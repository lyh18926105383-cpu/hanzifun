import {VERSION, buildQueue, effectiveClock, timestamp} from './scheduler.mjs';
import {applyEvent, createEvent} from './events.mjs';

export function createSession({cards, projection, now, sessionId, baseRevision, timeZone = 'UTC',
  dailyNew = 10, limit = 20, free = false, mode = 'learning'}) {
  if (!sessionId || !baseRevision || !['learning', 'review', 'scenario'].includes(mode)) throw new TypeError('Session identity required');
  for (const card of cards) {
    if (!card.cardId || !/^char:[0-9a-f]{4,6}$/.test(card.characterId) ||
      typeof card.front !== 'string' || !card.front || typeof card.back !== 'string' || !card.back) throw new TypeError('Invalid card content');
  }
  const clock = effectiveClock(now, projection.lastNow);
  const {queue, quota} = buildQueue(cards, projection, {now: clock.now, timeZone, dailyNew, limit, free});
  return {snapshotVersion: 1, revision: 0, schedulerVersion: VERSION, sessionId, baseRevision, mode,
    timeZone: quota.timeZone, dailyNew, createdAt: clock.now, lastNow: clock.now, clockWarning: clock.warning,
    queue, cursor: 0, face: 'front', results: [], status: queue.length ? 'active' : 'empty',
    completionEventId: null};
}

export function restoreSession(snapshot) {
  if (snapshot?.snapshotVersion !== 1 || snapshot.schedulerVersion !== VERSION || !snapshot.sessionId ||
      !snapshot.baseRevision || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 ||
      ![5, 10, 20].includes(snapshot.dailyNew) || !Array.isArray(snapshot.queue) || !Array.isArray(snapshot.results) ||
      !Number.isInteger(snapshot.cursor) || snapshot.cursor < 0 || snapshot.cursor > snapshot.queue.length ||
      snapshot.results.length !== snapshot.cursor || !['front', 'back'].includes(snapshot.face) ||
      !['active', 'paused', 'complete', 'empty'].includes(snapshot.status) ||
      (snapshot.status === 'complete' && (!snapshot.completionEventId || snapshot.cursor !== snapshot.queue.length)) ||
      (['active', 'paused'].includes(snapshot.status) && snapshot.cursor === snapshot.queue.length) ||
      (snapshot.status === 'empty' && (snapshot.queue.length !== 0 || snapshot.cursor !== 0)) ||
      snapshot.queue.some(entry => !entry?.card?.cardId || !/^char:[0-9a-f]{4,6}$/.test(entry.card.characterId) ||
        typeof entry.card.front !== 'string' || typeof entry.card.back !== 'string' ||
        !['free', 'scheduled'].includes(entry.intent) || typeof entry.scheduleRevision !== 'string')) {
    throw new TypeError('Unsupported or damaged session; preserve for export');
  }
  timestamp(snapshot.lastNow);
  return structuredClone(snapshot);
}

export function flip(session) {
  return session.status === 'active' ? {...session, revision: session.revision + 1, face: session.face === 'front' ? 'back' : 'front'} : session;
}
export function pause(session) { return session.status === 'active' ? {...session, revision: session.revision + 1, status: 'paused'} : session; }
export function resume(session) { return session.status === 'paused' ? {...session, revision: session.revision + 1, status: 'active'} : session; }

// Immediately revisit an answered card as free practice, never another schedule step.
export function revisit(session, position) {
  if (session.status !== 'active' || !session.results[position]) return session;
  const entry = structuredClone(session.queue[position]);
  return {...session, revision: session.revision + 1, queue: [...session.queue, {...entry, intent: 'free'}]};
}

export function rate(session, projection, rating, {now, id, completionId, deviceId, deviceSeq}) {
  if (session.status !== 'active') throw new Error('An active card is required for rating');
  const clock = effectiveClock(now, Math.max(session.lastNow, projection.lastNow));
  const entry = session.queue[session.cursor];
  const event = createEvent({type: 'card-rated', sessionId: session.sessionId,
    baseRevision: session.baseRevision, mode: session.mode, occurredAt: clock.now,
    cardId: entry.card.cardId, characterId: entry.card.characterId, rating,
    scheduleRevision: entry.scheduleRevision, intent: entry.intent, position: session.cursor,
    timeZone: session.timeZone, dailyNew: session.dailyNew}, {id, deviceId, deviceSeq});
  let nextProjection = applyEvent(projection, event);
  const next = {...session, revision: session.revision + 1, cursor: session.cursor + 1, face: 'front', lastNow: clock.now,
    clockWarning: session.clockWarning || clock.warning, results: [...session.results, event]};
  const events = [event];
  if (next.cursor === next.queue.length) {
    const completion = createEvent({type: 'session-completed', sessionId: session.sessionId,
      baseRevision: session.baseRevision, mode: session.mode, occurredAt: clock.now, rating: null},
    {id: completionId, deviceId, deviceSeq: deviceSeq + 1});
    nextProjection = applyEvent(nextProjection, completion);
    events.push(completion); next.status = 'complete'; next.completionEventId = completion.eventId;
  }
  return {events, projection: nextProjection, snapshot: next};
}

export function summary(session, projection) {
  const dueTimes = Object.values(projection.cards).map(c => c.dueAt).filter(t => t !== null);
  return {practiced: session.results.length,
    again: session.results.filter(r => r.rating === 'unfamiliar').length,
    earliestDueAt: dueTimes.length ? Math.min(...dueTimes) : null};
}
