// interval-v1: no DOM, storage, ambient clock or random values.
export const VERSION = 'interval-v1';
export const DAY = 86_400_000;
export const AGAIN = 600_000;
export const INTERVALS = Object.freeze([1, 3, 7, 14, 30, 60]);
export const compareId = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function timestamp(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('Invalid UTC milliseconds');
  return value;
}

export function effectiveClock(now, lastNow = 0) {
  timestamp(now); timestamp(lastNow);
  return {now: Math.max(now, lastNow), warning: now < lastNow - AGAIN};
}

export function initialProgress(cardId, characterId) {
  return {cardId, characterId, stage: 0, dueAt: null, lapses: 0, revision: '0', seenCount: 0};
}

export function isNew(progress) { return progress.revision === '0' && progress.dueAt === null; }
export function eligible(progress, now) {
  return isNew(progress) || (progress.dueAt !== null && progress.dueAt <= now);
}

export function schedule(progress, {rating, occurredAt, scheduleRevision, intent = 'scheduled', eventId}) {
  timestamp(occurredAt);
  if (!['familiar', 'unfamiliar'].includes(rating)) throw new TypeError('Invalid rating');
  const next = {...progress, seenCount: progress.seenCount + 1};
  const advances = intent === 'scheduled' && scheduleRevision === progress.revision && eligible(progress, occurredAt);
  if (!advances) return {progress: next, scheduled: false};
  const stage = rating === 'familiar' ? Math.min(progress.stage + 1, 6) : 0;
  return {scheduled: true, progress: {...next, stage,
    dueAt: occurredAt + (stage ? INTERVALS[stage - 1] * DAY : AGAIN),
    lapses: progress.lapses + (rating === 'unfamiliar' ? 1 : 0), revision: eventId}};
}

export function localDay(now, timeZone) {
  timestamp(now);
  // Fixed ISO calendar/Latin digits; machine locale cannot change quota identities.
  const parts = new Intl.DateTimeFormat('en-US', {timeZone, calendar: 'iso8601', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now);
  const get = key => parts.find(p => p.type === key).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function quotaAt(quota, now, requestedZone = 'UTC') {
  // Pin the accounting zone after first use. A preference change must never mint
  // another allowance; HF-06 can change display zone independently.
  const timeZone = quota?.timeZone ?? requestedZone;
  const day = localDay(now, timeZone);
  const latestDay = quota?.latestDay && quota.latestDay > day ? quota.latestDay : day;
  return {timeZone, latestDay, used: {...quota?.used}};
}

export function buildQueue(cards, projection, {now, timeZone = 'UTC', dailyNew = 10, limit = 20, free = false} = {}) {
  timestamp(now);
  if (![5, 10, 20].includes(dailyNew) || ![5, 10, 20].includes(limit)) throw new RangeError('Choose 5, 10 or 20');
  const quota = quotaAt(projection.quota, now, timeZone);
  const seen = new Set();
  const entries = cards.filter(card => {
    if (seen.has(card.cardId)) return false;
    seen.add(card.cardId); return true;
  }).map(card => {
    const progress = projection.cards[card.cardId] ?? initialProgress(card.cardId, card.characterId);
    if (progress.characterId !== card.characterId) throw new Error('Card identity changed');
    return {card: structuredClone(card), scheduleRevision: progress.revision,
      intent: free ? 'free' : 'scheduled', progress};
  });
  const due = entries.filter(e => !isNew(e.progress) && eligible(e.progress, now))
    .sort((a, b) => a.progress.dueAt - b.progress.dueAt || compareId(a.card.cardId, b.card.cardId));
  const fresh = entries.filter(e => isNew(e.progress)).sort((a, b) => compareId(a.card.cardId, b.card.cardId));
  const allowance = Math.max(0, dailyNew - (quota.used[quota.latestDay] ?? 0));
  const queue = free ? entries : [...due, ...fresh.slice(0, allowance)];
  return {queue: queue.slice(0, limit).map(({progress, ...entry}) => entry), quota,
    dueRemaining: Math.max(0, due.length - limit), newRemaining: allowance};
}
