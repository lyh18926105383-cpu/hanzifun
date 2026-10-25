import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlashcardController, mountFlashcards} from '../src/client/flashcards.mjs';
import {emptyProjection} from '../src/learning/events.mjs';
import {createSession} from '../src/learning/session.mjs';
const now = Date.UTC(2026, 9, 25, 8);
let sequence = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`;
const cards = [{cardId: 'fixture:1', characterId: 'char:775b', front: '睛', back: '<script>inert answer</script>'}];
function controller(commit = () => ({saved: true}), patch = {}) {
  const projection = emptyProjection();
  const session = createSession({cards, projection, now, sessionId: uuid(), baseRevision: 'test-only'});
  return createFlashcardController({session, projection, commit, clock: () => now, uuid,
    deviceId: 'test-device', nextSeq: count => {sequence += count; return sequence - count;}, ...patch});
}
// Small DOM test double checks our event/focus contract, not browser rendering.
class Element {
  constructor(tag, document) { this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(key, callback) { this.listeners[key] = callback; }
  removeEventListener(key) { delete this.listeners[key]; }
  focus() { this.ownerDocument.activeElement = this; }
  remove() { this.removed = true; }
  async click() { if (!this.disabled && !this.hidden) return this.listeners.click?.(); }
}
function dom() {
  const document = {createElement: tag => new Element(tag, document)};
  const root = document.createElement('div'); return {root, document};
}
test('controller blocks rapid double submit and accepts only confirmed saved:true', async () => {
  const writes = []; let release;
  const c = controller(tx => { writes.push(tx); return tx.events.length ? new Promise(resolve => { release = resolve; }) : {saved: true}; });
  assert.equal(await c.rate('familiar'), false); await c.flip();
  const pending = c.rate('familiar'); assert.equal(c.getState().saving, true);
  assert.equal(await c.rate('unfamiliar'), false); release({saved: true}); await pending;
  assert.equal(writes.filter(tx => tx.events.length).length, 1);
  assert.equal(c.getState().session.status, 'complete'); assert.equal(c.getState().saveState, 'saved');
});
test('failure retains evaluated snapshot, retry reuses byte-identical transaction after a lost acknowledgement', async () => {
  const writes = []; let fail = false;
  const c = controller(tx => {writes.push(structuredClone(tx)); if (fail) throw Error('quota'); return {saved: true};});
  await c.flip(); fail = true;
  assert.equal(await c.rate('unfamiliar'), false); assert.equal(c.getState().saveState, 'unsaved');
  assert.equal(c.exportState().pending.events.length, 2); assert.equal(c.getState().session.cursor, 1);
  assert.equal(await c.rate('familiar'), false); fail = false; await c.retry();
  assert.deepEqual(writes.at(-1), writes.at(-2)); assert.equal(c.getState().projection.completions.length, 1);
  const saved = c.exportState(); const restored = controller(() => ({saved: true}), {session: saved.snapshot, projection: saved.projection});
  assert.equal(await restored.rate('familiar'), false); assert.equal(restored.getState().projection.completions.length, 1);
});
test('missing/rejected storage and pause checkpoint never claim success; frozen cursor resumes', async () => {
  const c = controller(() => ({saved: false})); await c.flip();
  assert.equal(c.getState().saveState, 'unsaved'); assert.equal(c.getState().session.face, 'back');
  const ok = controller(); await ok.pause(); assert.equal(ok.getState().session.status, 'paused');
  const state = ok.exportState(); const restored = controller(() => ({saved: true}), {session: state.snapshot});
  await restored.resume(); assert.equal(restored.getState().session.status, 'active'); assert.equal(restored.getState().session.cursor, 0);
});
test('component renders inert text, semantic buttons, flip-first rating, focus and keyboard completion', async () => {
  const {root, document} = dom(); const c = controller(); const view = mountFlashcards(root, c);
  const section = root.children[0], controls = section.children[3];
  const get = action => controls.children.find(button => button.dataset.action === action);
  assert.equal(section.attributes['aria-label'], 'Flashcard practice');
  assert.equal(section.children[4].attributes['role'], 'status');
  assert.equal(get('familiar').disabled, true); assert.equal(document.activeElement, get('flip'));
  await get('flip').click(); assert.equal(get('familiar').disabled, false);
  assert.equal(section.children[1].textContent, cards[0].back); assert.equal(document.activeElement, get('familiar'));
  let prevented = false;
  section.listeners.keydown({key: '1', target: section, preventDefault() {prevented = true;}});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(prevented, true); assert.equal(c.getState().session.status, 'complete');
  assert.equal(document.activeElement, section.children[0]); assert.match(section.children[4].textContent, /Saved on this device/);
  view.destroy(); assert.equal(section.removed, true); assert.equal(section.listeners.keydown, undefined);
});
test('component ignores premature/repeating/text-input shortcuts, exposes failed save and retry focus', async () => {
  const {root, document} = dom(); let fail = true;
  const c = controller(() => ({saved: !fail})); mountFlashcards(root, c);
  const section = root.children[0], controls = section.children[3];
  const get = action => controls.children.find(button => button.dataset.action === action);
  for (const event of [{key: '1'}, {key: '2', repeat: true}, {key: '2', target: {tagName: 'INPUT'}}]) section.listeners.keydown(event);
  assert.equal(c.getState().session.cursor, 0);
  await get('flip').click(); assert.match(section.children[4].textContent, /Not saved/);
  assert.equal(document.activeElement, get('retry')); assert.equal(get('familiar').disabled, true);
  assert.equal(get('retry').hidden, false); fail = false; await get('retry').click();
  assert.equal(get('familiar').disabled, false); assert.equal(get('retry').hidden, true);
});

test('transaction carries log and session revisions so a host can reject a stale second tab without overwriting', async () => {
  let stored, logHead = {length: 0, head: null};
  const first = controller(tx => {
    if ((stored && tx.expectedSessionRevision !== stored.snapshot.revision) || JSON.stringify(tx.expectedLog) !== JSON.stringify(logHead)) return {saved: false, reason: 'Revision conflict; reload saved session'};
    stored = tx; logHead = {length: tx.projection.eventIds.length, head: tx.projection.eventIds.at(-1) ?? null};
    return {saved: true};
  });
  const initial = first.exportState();
  const other = controller(tx => {
    assert.equal(tx.expectedSessionRevision, 0); assert.equal(stored.snapshot.revision, 1);
    return {saved: false, reason: 'Revision conflict; reload saved session'};
  }, {session: initial.snapshot, projection: initial.projection});
  await first.flip(); assert.equal(await other.flip(), false);
  assert.match(other.getState().error, /Revision conflict/); assert.equal(stored.snapshot.face, 'back');
  assert.equal(stored.events.length, 0);
});
