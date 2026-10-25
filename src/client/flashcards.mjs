import {flip, pause, resume, rate, restoreSession, revisit, summary} from '../learning/session.mjs';

// commit({events, projection, snapshot, expectedLog}) must save atomically and
// deduplicate events/session completion. Both synchronous and async adapters work.
export function createFlashcardController({session, projection, commit = () => ({saved: false}),
  clock = Date.now, uuid = () => globalThis.crypto.randomUUID(), deviceId, nextSeq}) {
  let current = restoreSession(session);
  let progress = structuredClone(projection);
  let pending = null;
  let saving = false;
  let saveState = 'idle';
  let error = '';
  const listeners = new Set();
  const notify = () => listeners.forEach(fn => fn());
  const expectedLog = () => ({length: progress.eventIds.length, head: progress.eventIds.at(-1) ?? null});
  async function persist() {
    if (!pending || saving) return false;
    saving = true; saveState = 'saving'; notify();
    try {
      const result = await commit(structuredClone(pending));
      if (result?.saved !== true) throw new Error(result?.reason || 'Could not save on this device.');
      pending = null; saveState = 'saved'; error = ''; return true;
    } catch (failure) {
      saveState = 'unsaved'; error = failure.message || 'Could not save on this device.'; return false;
    } finally { saving = false; notify(); }
  }
  async function checkpoint(transform) {
    if (saving || pending) return false;
    const snapshot = transform(current);
    if (snapshot === current) return false;
    pending = {events: [], projection: progress, snapshot, expectedLog: expectedLog(), expectedSessionRevision: current.revision};
    current = snapshot;
    return persist();
  }
  return {
    getState() { return {session: structuredClone(current), projection: structuredClone(progress),
      saving, blocked: saving || !!pending, saveState, error, summary: summary(current, progress)}; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    flip: () => checkpoint(flip), pause: () => checkpoint(pause), resume: () => checkpoint(resume),
    revisit: position => checkpoint(s => revisit(s, position)),
    async rate(rating) {
      if (saving || pending || current.status !== 'active' || current.face !== 'back') return false;
      const transaction = rate(current, progress, rating, {now: clock(), id: uuid(), completionId: uuid(),
        deviceId, deviceSeq: nextSeq(2)});
      pending = {...transaction, expectedLog: expectedLog(), expectedSessionRevision: current.revision};
      current = transaction.snapshot; progress = transaction.projection;
      return persist();
    },
    retry: persist,
    exportState: () => structuredClone({snapshot: current, projection: progress, pending}),
    // Host persists the initial frozen queue before showing the practice route.
  };
}

export function mountFlashcards(root, controller) {
  const document = root.ownerDocument;
  const section = document.createElement('section');
  section.className = 'hf-flashcards'; section.setAttribute('aria-label', 'Flashcard practice');
  const heading = document.createElement('h2'); heading.tabIndex = -1;
  const card = document.createElement('div'); card.className = 'hf-flashcard';
  const status = document.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const warning = document.createElement('p');
  const controls = document.createElement('div'); controls.className = 'hf-flashcard-controls';
  const buttons = {};
  for (const [name, label, action] of [
    ['flip', 'Reveal answer', () => controller.flip()],
    ['familiar', 'Familiar', () => controller.rate('familiar')],
    ['again', 'Again', () => controller.rate('unfamiliar')],
    ['revisit', 'See previous card again', () => controller.revisit(controller.getState().session.cursor - 1)],
    ['pause', 'Pause', () => controller.pause()], ['resume', 'Continue', () => controller.resume()],
    ['retry', 'Retry saving', () => controller.retry()],
  ]) {
    const button = document.createElement('button'); button.type = 'button';
    button.textContent = label; button.dataset.action = name;
    button.addEventListener('click', action); controls.append(button); buttons[name] = button;
  }
  const exportButton = document.createElement('button'); exportButton.type = 'button';
  exportButton.textContent = 'Export recovery JSON';
  exportButton.addEventListener('click', () => {
    const view = document.defaultView;
    const url = view.URL.createObjectURL(new view.Blob([JSON.stringify(controller.exportState(), null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'hanzifun-practice-recovery.json';
    link.click(); view.URL.revokeObjectURL(url);
  });
  controls.append(exportButton);
  section.append(heading, card, warning, controls, status); root.replaceChildren(section);
  let previousKey;
  function render() {
    const state = controller.getState(), s = state.session;
    const active = s.status === 'active';
    card.className = active ? 'hf-flashcard' : 'hf-flashcard hf-flashcard-summary';
    heading.textContent = s.status === 'complete' ? 'Practice complete' : s.status === 'empty' ? 'No cards ready' :
      s.status === 'paused' ? 'Practice paused' : `Card ${s.cursor + 1} of ${s.queue.length}`;
    card.textContent = active ? s.queue[s.cursor].card[s.face] : s.status === 'complete' ?
      `Practiced: ${state.summary.practiced}. Again: ${state.summary.again}. Next due: ${state.summary.earliestDueAt === null ? 'None' : new Date(state.summary.earliestDueAt).toISOString()}.` : '';
    warning.textContent = s.clockWarning ? 'Device time moved backwards. Check your clock; your records are preserved.' : '';
    buttons.flip.hidden = !active; buttons.flip.textContent = s.face === 'front' ? 'Reveal answer' : 'Show front';
    for (const name of ['familiar', 'again']) { buttons[name].hidden = !active; buttons[name].disabled = state.blocked || s.face !== 'back'; }
    buttons.revisit.hidden = !active || s.cursor === 0;
    buttons.pause.hidden = !active; buttons.resume.hidden = s.status !== 'paused';
    for (const name of ['flip', 'pause', 'resume', 'revisit']) buttons[name].disabled = state.blocked;
    buttons.retry.hidden = state.saveState !== 'unsaved'; buttons.retry.disabled = state.saving;
    exportButton.hidden = state.saveState !== 'unsaved';
    status.textContent = state.saveState === 'saved' ? 'Saved on this device.' : state.saveState === 'unsaved' ?
      `Not saved. ${state.error}` : state.saving ? 'Saving on this device…' : s.status === 'complete' ?
      'Session complete.' : s.status === 'empty' ? 'No cards are due and no new cards are available.' : 'Ready to practice.';
    const key = `${s.cursor}:${s.face}:${s.status}:${state.saveState === 'unsaved'}`;
    if (!state.saving && key !== previousKey) {
      if (state.saveState === 'unsaved') buttons.retry.focus();
      else if (active) (s.face === 'front' ? buttons.flip : buttons.familiar).focus();
      else if (s.status === 'paused') buttons.resume.focus(); else heading.focus();
      previousKey = key;
    }
  }
  function keyboard(event) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName) || event.target?.isContentEditable) return;
    const s = controller.getState();
    if (s.blocked || s.session.status !== 'active') return;
    // Space/Enter retain native button behavior, avoiding a double activation.
    if (event.key === '1' || event.key === '2') {
      if (s.session.face !== 'back') return;
      event.preventDefault(); void controller.rate(event.key === '1' ? 'familiar' : 'unfamiliar');
    }
  }
  section.addEventListener('keydown', keyboard);
  const unsubscribe = controller.subscribe(render); render();
  return {destroy() { unsubscribe(); section.removeEventListener('keydown', keyboard); section.remove(); }};
}
