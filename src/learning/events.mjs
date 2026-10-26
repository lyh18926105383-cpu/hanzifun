import {VERSION, effectiveClock, initialProgress, isNew, quotaAt, schedule, timestamp} from './scheduler.mjs';

export const emptyProjection = () => ({schedulerVersion: VERSION, cards: {}, eventIds: [],
  evaluationKeys: [], completions: [], quota: null, lastNow: 0});
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createEvent(payload, {id, deviceId, deviceSeq}) {
  const event = {...payload, schemaVersion: '1', ownerScope: 'guest', schedulerVersion: VERSION,
    eventId: id, deviceId, deviceSeq};
  validateEvent(event);
  return event;
}

export function validateEvent(event) {
  if (event.schemaVersion !== '1' || event.ownerScope !== 'guest' || event.schedulerVersion !== VERSION ||
      !uuidPattern.test(event.eventId) || !event.deviceId || !Number.isSafeInteger(event.deviceSeq) || event.deviceSeq < 0 ||
      !event.sessionId || !event.baseRevision || !['learning', 'review', 'scenario'].includes(event.mode)) {
    throw new TypeError('Unsupported learning event');
  }
  timestamp(event.occurredAt);
  if (event.type === 'session-completed') {
    if (event.rating !== null) throw new TypeError('Completion has no rating');
  } else if (event.type === 'card-rated') {
    if (!event.cardId || !/^char:[0-9a-f]{4,6}$/.test(event.characterId) ||
      !['familiar', 'unfamiliar'].includes(event.rating) || !['scheduled', 'free'].includes(event.intent) ||
      typeof event.scheduleRevision !== 'string' || ![5, 10, 20].includes(event.dailyNew) ||
      !Number.isSafeInteger(event.position) || event.position < 0) {
      throw new TypeError('Invalid card event');
    }
    quotaAt(null, event.occurredAt, event.timeZone);
  } else throw new TypeError('Unknown event type');
}

// Input order is the committed log order, never a sort by an untrusted wall clock.
function reduceEvent(next, event, indexes) {
  validateEvent(event);
  if (next.schedulerVersion !== VERSION) throw new Error('Unsupported projection version');
  if (indexes.ids.has(event.eventId)) return next;
  indexes.ids.add(event.eventId); next.eventIds.push(event.eventId);
  next.lastNow = effectiveClock(event.occurredAt, next.lastNow).now;
  if (event.type === 'session-completed') {
    if (!indexes.completions.has(event.sessionId)) {indexes.completions.add(event.sessionId);next.completions.push(event.sessionId);}
    return next;
  }
  const key = JSON.stringify([event.sessionId, event.position]);
  if (indexes.keys.has(key)) return next;
  indexes.keys.add(key);next.evaluationKeys.push(key);
  const previous = next.cards[event.cardId] ?? initialProgress(event.cardId, event.characterId);
  if (previous.characterId !== event.characterId) throw new Error('Card identity changed');
  const quota = quotaAt(next.quota, next.lastNow, event.timeZone);
  const exhausted = isNew(previous) && (quota.used[quota.latestDay] ?? 0) >= event.dailyNew;
  const result = schedule(previous, {...event, occurredAt: next.lastNow,
    intent: exhausted ? 'free' : event.intent});
  next.cards[event.cardId] = result.progress;
  if (result.scheduled && isNew(previous)) {
    next.quota = quotaAt(next.quota, next.lastNow, event.timeZone);
    const day = next.quota.latestDay;
    next.quota.used[day] = (next.quota.used[day] ?? 0) + 1;
  }
  return next;
}
const indexesFor = p => ({ids:new Set(p.eventIds),keys:new Set(p.evaluationKeys),completions:new Set(p.completions)});
export function applyEvent(projection, event) {
  // Preserve the public immutable reducer while bulk replay clones only once.
  validateEvent(event);
  if(projection.schedulerVersion!==VERSION)throw new Error('Unsupported projection version');
  if(projection.eventIds.includes(event.eventId))return projection;
  return reduceEvent(structuredClone(projection),event,indexesFor(projection));
}
export function replay(events, initial = emptyProjection()) {
  const next=structuredClone(initial), indexes=indexesFor(next);
  for(const event of events)reduceEvent(next,event,indexes);
  return next;
}

export function dashboard(projection) {
  const cards = Object.values(projection.cards);
  return {practicedCharacters: new Set(cards.filter(c => c.seenCount > 0).map(c => c.characterId)).size,
    dueCards: cards.filter(c => c.dueAt !== null && c.dueAt <= projection.lastNow).length,
    completedSessions: projection.completions.length};
}
