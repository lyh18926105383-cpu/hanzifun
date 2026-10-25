import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProjection, replay} from '../src/learning/events.mjs';
import {DAY} from '../src/learning/scheduler.mjs';
import {createSession, restoreSession, flip, pause, resume, revisit, rate, summary} from '../src/learning/session.mjs';
const now = Date.UTC(2026, 9, 25, 8);
const cards = [{cardId: 'legacy:019', characterId: 'char:775b', front: '睛', back: 'Eye'},
  {cardId: 'legacy:087', characterId: 'char:775b', front: '睛', back: 'Eyes in context'}];
let seq = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`;
const meta = (time = now) => ({now: time, id: uuid(), completionId: uuid(), deviceId: 'test', deviceSeq: seq});
const make = (patch = {}) => createSession({cards, projection: emptyProjection(), now, sessionId: uuid(), baseRevision: 'content-1', ...patch});

test('session freezes deep content/queue and restores exact front/back/cursor independently of source updates', () => {
  const source = structuredClone(cards); const s = make({cards: source}); source.reverse(); source[0].back = 'Changed';
  assert.deepEqual(s.queue.map(e => e.card.back), ['Eye', 'Eyes in context']);
  const first = rate(flip(s), emptyProjection(), 'familiar', meta());
  assert.equal(first.snapshot.cursor, 1); assert.equal(first.snapshot.face, 'front');
  assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(first.snapshot))), first.snapshot);
  assert.deepEqual(resume(pause(first.snapshot)), {...first.snapshot, revision: first.snapshot.revision + 2});
  assert.throws(() => restoreSession({...s, cursor: 3}), /damaged/);
  assert.throws(() => restoreSession({...s, snapshotVersion: 2}), /damaged/);
  assert.throws(() => createSession({cards, projection: emptyProjection(), now}), /identity/);
});
test('reveal precedes rating, last rating and completion form one transaction and repeated completion counts once', () => {
  const s = make({cards: cards.slice(0, 1)});
  assert.throws(() => rate(s, emptyProjection(), 'familiar', meta()), /Reveal/);
  const last = rate(flip(s), emptyProjection(), 'familiar', meta());
  assert.equal(last.events.length, 2); assert.equal(last.snapshot.status, 'complete');
  assert.equal(last.projection.completions.length, 1);
  assert.equal(replay([...last.events, ...last.events]).completions.length, 1);
  const completion = {...last.events[1], eventId: uuid()};
  assert.equal(replay([...last.events, completion]).completions.length, 1);
  assert.deepEqual(summary(last.snapshot, last.projection), {practiced: 1, again: 0, earliestDueAt: now + DAY});
  assert.throws(() => rate(last.snapshot, last.projection, 'familiar', meta()));
});
test('immediate revisit saves another practice event without advancing scheduling even after due time passes', () => {
  const first = rate(flip(make()), emptyProjection(), 'familiar', meta());
  const appended = revisit(first.snapshot, 0);
  assert.equal(appended.queue.length, 3); assert.equal(appended.queue[2].intent, 'free');
  const second = rate(flip(appended), first.projection, 'unfamiliar', meta());
  const last = rate(flip(second.snapshot), second.projection, 'familiar', meta(now + 10 * DAY));
  assert.equal(last.projection.cards['legacy:019'].stage, 1);
  assert.equal(last.projection.cards['legacy:019'].dueAt, now + DAY);
  assert.equal(last.projection.cards['legacy:019'].seenCount, 2);
  assert.equal(summary(last.snapshot, last.projection).again, 1);
});
test('early free session retains formal dueAt and stage; empty session never emits completion', () => {
  const first = rate(flip(make({cards: cards.slice(0, 1)})), emptyProjection(), 'familiar', meta());
  const s = make({projection: first.projection, free: true, cards: cards.slice(0, 1)});
  const next = rate(flip(s), first.projection, 'unfamiliar', meta());
  assert.equal(next.projection.cards['legacy:019'].dueAt, now + DAY);
  assert.equal(next.projection.cards['legacy:019'].stage, 1);
  assert.equal(make({cards: []}).status, 'empty');
});
