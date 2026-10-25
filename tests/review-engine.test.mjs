import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';
import {DAY, AGAIN, VERSION, INTERVALS, initialProgress, schedule, eligible, buildQueue, localDay, quotaAt, effectiveClock} from '../src/learning/scheduler.mjs';
import {emptyProjection, createEvent, applyEvent, replay, dashboard} from '../src/learning/events.mjs';
const now = Date.UTC(2026, 9, 25, 8);
let serial = 0;
const id = () => `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`;
const card = (n = 0) => ({cardId: `card:${String(n).padStart(3, '0')}`, characterId: 'char:775b', front: '睛', back: 'Eye'});
function event(payload = {}) {
  return createEvent({type: 'card-rated', sessionId: id(), baseRevision: 'fixture-v1', mode: 'review',
    occurredAt: now, cardId: 'card:000', characterId: 'char:775b', rating: 'familiar', intent: 'scheduled',
    position: 0, scheduleRevision: '0', timeZone: 'Asia/Singapore', dailyNew: 10, ...payload},
  {id: id(), deviceId: 'fixture', deviceSeq: serial});
}
test('all six known intervals and cap are exact, again resets every stage and increments lapses', () => {
  let p = initialProgress('card:000', 'char:775b');
  for (let stage = 1; stage <= 7; stage++) {
    const t = p.dueAt ?? now;
    const result = schedule(p, {rating: 'familiar', occurredAt: t, scheduleRevision: p.revision, eventId: id()});
    p = result.progress;
    assert.equal(p.stage, Math.min(stage, 6)); assert.equal(p.dueAt, t + INTERVALS[Math.min(stage, 6) - 1] * DAY);
    const again = schedule(p, {rating: 'unfamiliar', occurredAt: p.dueAt, scheduleRevision: p.revision, eventId: id()}).progress;
    assert.equal(again.stage, 0); assert.equal(again.dueAt, p.dueAt + AGAIN); assert.equal(again.lapses, p.lapses + 1);
  }
});
test('dueAt ±1ms and free/early/stale revision do not advance or delay scheduling', () => {
  const p = {...initialProgress('c', 'char:775b'), stage: 3, dueAt: now, revision: 'r', seenCount: 2};
  assert.equal(eligible(p, now - 1), false); assert.equal(eligible(p, now), true); assert.equal(eligible(p, now + 1), true);
  for (const patch of [{occurredAt: now - 1}, {intent: 'free'}, {scheduleRevision: 'stale'}]) {
    const result = schedule(p, {rating: 'familiar', occurredAt: now, scheduleRevision: 'r', eventId: id(), ...patch});
    assert.equal(result.scheduled, false); assert.equal(result.progress.stage, 3); assert.equal(result.progress.dueAt, now);
  }
});
test('queue uses dueAt then stable cardId, new allowance separate from due pagination', () => {
  const cards = Array.from({length: 35}, (_, n) => card(n));
  const projection = emptyProjection();
  for (let n = 0; n < 25; n++) projection.cards[cards[n].cardId] = {
    ...initialProgress(cards[n].cardId, 'char:775b'), dueAt: now - (n === 24 ? 1 : 0), seenCount: 1, revision: 'r'};
  projection.quota = {timeZone: 'UTC', latestDay: '2026-10-25', used: {'2026-10-25': 10}};
  const q = buildQueue(cards.reverse(), projection, {now});
  assert.equal(q.queue.length, 20); assert.equal(q.queue[0].card.cardId, 'card:024');
  assert.equal(q.queue[1].card.cardId, 'card:000'); assert.equal(q.dueRemaining, 5); assert.equal(q.newRemaining, 0);
  projection.quota.used['2026-10-25'] = 8;
  assert.equal(buildQueue(cards.filter(c => Number(c.cardId.slice(5)) >= 25), projection, {now}).queue.length, 2);
  for (const setting of [5, 10, 20]) assert.equal(buildQueue(cards, emptyProjection(), {now, limit: setting, dailyNew: setting}).queue.length, setting);
  assert.deepEqual(buildQueue([], emptyProjection(), {now}).queue, []);
  assert.throws(() => buildQueue(cards, projection, {now, limit: 7}));
});
test('UTC quota boundaries, DST repeated hour and timezone preference changes never refill the same day', () => {
  assert.equal(localDay(Date.UTC(2026, 9, 25, 15, 59, 59, 999), 'Asia/Singapore'), '2026-10-25');
  assert.equal(localDay(Date.UTC(2026, 9, 25, 16), 'Asia/Singapore'), '2026-10-26');
  for (const t of [Date.UTC(2026, 10, 1, 5, 30), Date.UTC(2026, 10, 1, 6, 30)]) assert.equal(localDay(t, 'America/New_York'), '2026-11-01');
  assert.equal(localDay(Date.UTC(2026, 2, 8, 6, 59), 'America/New_York'), localDay(Date.UTC(2026, 2, 8, 7, 1), 'America/New_York'));
  const q = {timeZone: 'Pacific/Honolulu', latestDay: '2026-10-24', used: {'2026-10-24': 10}};
  const changed = quotaAt(q, Date.UTC(2026, 9, 25, 8), 'Pacific/Kiritimati');
  assert.equal(changed.timeZone, 'Pacific/Honolulu'); assert.equal(changed.latestDay, '2026-10-24');
  assert.equal(changed.used[changed.latestDay], 10);
  assert.equal(quotaAt({...q, latestDay: '2026-10-26'}, now).latestDay, '2026-10-26');
  assert.throws(() => localDay(now, 'Not/AZone'));
});
test('clock rollback clamps effective time, warns, keeps history, and intervals remain 24h across DST', () => {
  assert.deepEqual(effectiveClock(now - AGAIN - 1, now), {now, warning: true});
  const first = event(), second = event({occurredAt: now - DAY, intent: 'free'});
  const p = replay([first, second]); assert.equal(p.lastNow, now); assert.equal(p.eventIds.length, 2);
  assert.equal(p.cards['card:000'].dueAt, now + DAY);
  const t = Date.UTC(2026, 2, 7, 18);
  assert.equal(schedule(initialProgress('x', 'char:775b'), {rating: 'familiar', occurredAt: t, scheduleRevision: '0', eventId: id()}).progress.dueAt, t + DAY);
  assert.throws(() => effectiveClock(NaN));
});
test('same event stream replay is deterministic, UUID and evaluation-slot dedup guard double ratings', () => {
  const first = event(); const duplicateSlot = event({...first, rating: 'unfamiliar'});
  const p = replay([first, first, duplicateSlot]);
  assert.equal(p.cards['card:000'].stage, 1); assert.equal(p.cards['card:000'].seenCount, 1);
  assert.deepEqual(p, replay([first, first, duplicateSlot]));
  const stale = event({scheduleRevision: '0', occurredAt: now + DAY});
  assert.equal(replay([first, stale]).cards['card:000'].stage, 1);
  assert.equal(replay([first, stale]).cards['card:000'].dueAt, now + DAY);
  assert.throws(() => applyEvent(p, {...first, schedulerVersion: 'other'}));
  assert.throws(() => event({characterId: '睛'}));
  assert.equal(VERSION, 'interval-v1');
});
test('睛 teaching positions schedule separately and count once by characterId', () => {
  const p = replay([event({cardId: 'legacy:019'}), event({cardId: 'legacy:087', rating: 'unfamiliar'})]);
  assert.equal(p.cards['legacy:019'].stage, 1); assert.equal(p.cards['legacy:087'].stage, 0);
  assert.equal(p.cards['legacy:087'].dueAt, now + AGAIN); assert.equal(dashboard(p).practicedCharacters, 1);
  assert.equal(dashboard({...p, lastNow: now + DAY}).dueCards, 2);
});
test('free unseen practice remains eligible for first formal schedule and consumes no quota', () => {
  const free = event({intent: 'free'}); const p = replay([free]);
  assert.equal(p.quota, null); assert.equal(p.cards['card:000'].dueAt, null);
  assert.equal(buildQueue([card()], p, {now}).queue.length, 1);
  const formal = event(); assert.equal(replay([free, formal]).cards['card:000'].stage, 1);
});
test('quota is checked again on replay when two frozen sessions compete; next local day refills', () => {
  const events = Array.from({length: 11}, (_, n) => event({cardId: card(n).cardId}));
  const p = replay(events);
  assert.equal(p.quota.used['2026-10-25'], 10); assert.equal(p.cards['card:010'].dueAt, null);
  assert.equal(buildQueue([card(10)], p, {now}).queue.length, 0);
  assert.equal(buildQueue([card(10)], p, {now: Date.UTC(2026, 9, 25, 16)}).queue.length, 1);
});

test('generated events conform to the frozen JSON schema including UUID, content revision and guest scope', () => {
  const schema = JSON.parse(fs.readFileSync(new URL('../docs/hanzifun-rebuild/contracts/learning-event.schema.json', import.meta.url), 'utf8'));
  const ajv = new Ajv({strict: false});
  ajv.addFormat('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  const validate = ajv.compile(schema);
  assert.equal(validate(event()), true, JSON.stringify(validate.errors));
  const completion = event({type: 'session-completed', rating: null});
  assert.equal(validate(completion), true, JSON.stringify(validate.errors));
  assert.throws(() => event({mode: 'story'}), /Unsupported/);
});

test('multiple rounds preserve inputs, idempotency and scheduling invariants over 120 deterministic operations', () => {
  const log = []; let p = emptyProjection();
  for (let n = 0; n < 120; n++) {
    const previous = p.cards['card:000'] ?? initialProgress('card:000', 'char:775b');
    const e = event({occurredAt: previous.dueAt ?? now, scheduleRevision: previous.revision,
      rating: n % 4 === 0 ? 'unfamiliar' : 'familiar', intent: n % 5 === 0 ? 'free' : 'scheduled'});
    const before = structuredClone(p);
    const after = applyEvent(p, e); assert.deepEqual(p, before);
    assert.ok(after.cards['card:000'].stage >= 0 && after.cards['card:000'].stage <= 6);
    assert.equal(applyEvent(after, e), after);
    if (e.intent === 'free') assert.equal(after.cards['card:000'].dueAt, previous.dueAt);
    log.push(e); p = after;
  }
  assert.deepEqual(replay(log), p);
});
