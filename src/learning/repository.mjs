import {emptyProjection, replay, dashboard} from './events.mjs';
import {restoreSession, createSession} from './session.mjs';
import {effectiveClock} from './scheduler.mjs';
import {canonical, parseImport, previewLegacy} from './legacy-import.mjs';
import {uuid as createUUID} from './identity.mjs';
import {createWriteLock} from './write-lock.mjs';
export const STORAGE_KEY = 'hanzifun.guest.snapshot.v1';
export const emptyData = () => ({schemaVersion: 1, schedulerVersion: 'interval-v1', revision: 0,
  events: [], projection: emptyProjection(), sessions: {}, favorites: [], imports: [], summaries: [],
  sequences: {}, settings: {dailyNew: 10, limit: 20}, dataVersion: 'hf06-v1'});
const equal = (a, b) => canonical(a) === canonical(b);
const log = data => ({length: data.events.length, head: data.events.at(-1)?.eventId ?? null});
function validateLinks(data) {
  const ratings=new Map(),completions=new Map();
  for(const e of data.events){
    if(!Object.hasOwn(data.sessions,e.sessionId))throw new Error('Event has no session');
    if(e.type==='card-rated'){if(!ratings.has(e.sessionId))ratings.set(e.sessionId,[]);ratings.get(e.sessionId).push(e);}
    else completions.set(e.sessionId,e);
  }
  for(const s of Object.values(data.sessions)){
    const items=ratings.get(s.sessionId)||[];
    if(!equal(items,s.results))throw new Error('Session cursor/results differ from committed log');
    for(let i=0;i<items.length;i++){
      const e=items[i],q=s.queue[i];
      if(e.position!==i||!q||e.cardId!==q.card.cardId||e.characterId!==q.card.characterId||e.intent!==q.intent||e.scheduleRevision!==q.scheduleRevision||e.baseRevision!==s.baseRevision||e.mode!==s.mode)throw new Error('Session event mapping mismatch');
    }
    const done=completions.get(s.sessionId);
    if((s.status==='complete')!==!!done || (done && s.completionEventId!==done.eventId))throw new Error('Completion and snapshot disagree');
  }
}
export function validateData(data, catalog) {
  if (data?.schemaVersion !== 1 || data.schedulerVersion !== 'interval-v1' || !Number.isSafeInteger(data.revision) || data.revision < 0 ||
    !Array.isArray(data.events) || !data.sessions || typeof data.sessions !== 'object' || Array.isArray(data.sessions) ||
    !Array.isArray(data.favorites) || !Array.isArray(data.imports) || !Array.isArray(data.summaries) ||
    !data.sequences || typeof data.sequences !== 'object' || ![5,10,20].includes(data.settings?.dailyNew) || ![5,10,20].includes(data.settings?.limit)) throw new Error('Unsupported or damaged snapshot; export before recovery.');
  const cards = new Map(catalog.map(c => [c.cardId, c.characterId]));
  const characters = new Set(catalog.map(c => c.characterId));
  for (const e of data.events) if (e.type === 'card-rated' && cards.get(e.cardId) !== e.characterId) throw new Error('Unknown card mapping; original preserved.');
  if (!equal(replay(data.events), data.projection)) throw new Error('Snapshot projection does not match event log');
  for (const [id, s] of Object.entries(data.sessions)) {
    restoreSession(s);
    if (id !== s.sessionId || s.queue.some(e => cards.get(e.card.cardId) !== e.card.characterId)) throw new Error('Invalid session mapping');
  }
  if (data.favorites.some(id => !characters.has(id)) || new Set(data.favorites).size !== data.favorites.length) throw new Error('Invalid favorites');
  if (Object.values(data.sequences).some(v => !Number.isSafeInteger(v) || v < 0)) throw new Error('Invalid device sequence');
  const slots = new Set(), ids = new Set(), completed = new Set(), sequences = new Set();
  for (const e of data.events) {
    const seq=canonical([e.deviceId,e.deviceSeq]);if(sequences.has(seq))throw new Error('Duplicate device sequence');sequences.add(seq);
    if (ids.has(e.eventId)) throw new Error('Duplicate event ID'); ids.add(e.eventId);
    if (e.type === 'card-rated') {
      const key = canonical([e.sessionId, e.position]);
      if (slots.has(key)) throw new Error('Duplicate evaluation slot'); slots.add(key);
    } else {if (completed.has(e.sessionId)) throw new Error('Duplicate completion'); completed.add(e.sessionId);}
  }
  validateLinks(data);
  const batches = new Set();
  for (const batch of data.imports) {
    if (!batch.batchId || batches.has(batch.batchId) || typeof batch.raw !== 'string' || !Array.isArray(batch.sessions) || !Array.isArray(batch.characterIds) || !Array.isArray(batch.favorites) || !Array.isArray(batch.unresolved)) throw new Error('Invalid import batch');
    batches.add(batch.batchId);
  }
  return data;
}
export function createRepository({storage, catalog, locks, uuid = createUUID, clock = Date.now,
  timeZone = 'UTC', origin = 'http://localhost', lessonIds = [], contentVersion = 'hf06-content-v1'}) {
  let memory = emptyData(), lastRaw, error = '';
  const lock = createWriteLock({storage, locks, uuid});
  function read() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === lastRaw) return structuredClone(memory);
    const data = raw === null ? emptyData() : validateData(parseImport(raw), catalog);
    memory = data; lastRaw = raw; error = ''; return structuredClone(data);
  }
  function getData() {try {return read();} catch (e) {error = e.message; return structuredClone(memory);}}
  async function mutate(change, reset = false) {
    try {
      return await lock(() => {
        const current = reset ? emptyData() : read(), before = reset ? storage.getItem(STORAGE_KEY) : lastRaw, next = structuredClone(current);
        const answer = change(next, current);
        if (answer?.skip) {error='';return {saved: true, ...answer.result};}
        next.revision++;
        const serialized = canonical(next);
        // Optimistic CAS checks also run inside the fallback coordination section.
        if (storage.getItem(STORAGE_KEY) !== before) return {saved: false, reason: 'conflict: another tab changed the snapshot; refresh or export.'};
        storage.setItem(STORAGE_KEY, serialized);
        if (storage.getItem(STORAGE_KEY) !== serialized) return {saved: false, reason: 'conflict: write verification failed; export recovery.'};
        memory = next; lastRaw = serialized; error = '';
        return {saved: true, ...answer};
      });
    } catch (e) {error = e.message; return {saved: false, reason: e.message};}
  }
  const api = {
    getData,
    resetWriteCoordination() {
      // Only after the UI explicitly asks the user to close other learning tabs.
      try{const keys=[];for(let i=0;i<storage.length;i++)keys.push(storage.key(i));for(const k of keys)if(k?.startsWith('hanzifun.guest.lock.'))storage.removeItem(k);return {reset:true};}
      catch(e){return {reset:false,reason:e.message};}
    },
    getStatus: () => ({error, saved: !error, raw: (() => {try {return storage.getItem(STORAGE_KEY);} catch {return null;}})()}),
    getDashboard() {
      const data = getData(), now = effectiveClock(clock(), data.projection.lastNow).now;
      const stats = dashboard({...data.projection, lastNow: now});
      const history = Object.values(data.sessions).filter(s => s.status === 'complete').map(s => ({id:s.sessionId,
        title:s.title || 'Flashcard practice', completedAt:s.lastNow, count:s.results.length,
        again:s.results.filter(r=>r.rating==='unfamiliar').length, kind:s.mode}));
      history.push(...data.summaries);
      // Latest batch from each source/origin is the displayed legacy snapshot.
      const latest = new Map(); for (const b of data.imports) latest.set(canonical([b.sourceKey,b.sourceOrigin]), b);
      const legacy = [...latest.values()];
      history.sort((a,b)=>b.completedAt-a.completedAt || a.id.localeCompare(b.id));
      const due = Object.values(data.projection.cards).map(c=>c.dueAt).filter(t=>t!==null);
      const latestRatings = new Map(); for(const e of data.events)if(e.type==='card-rated')latestRatings.set(e.cardId,e);
      return {...stats, practicedCards:Object.values(data.projection.cards).filter(c=>c.seenCount>0).length,
        favorites:data.favorites.length, recentSessions:history.slice(0,8), history,
        legacy, legacyPending:[...new Set(legacy.flatMap(b=>b.characterIds))].filter(id=>!Object.values(data.projection.cards).some(c=>c.characterId===id&&c.seenCount>0)), storyHistory:legacy.filter(b=>b.story).flatMap(b=>b.sessions),
        unfinished:Object.values(data.sessions).filter(s=>['active','paused'].includes(s.status)),
        earliestDueAt:due.length?Math.min(...due):null,
        weakCharacters:[...new Set([...latestRatings.values()].filter(e=>e.rating==='unfamiliar').map(e=>e.characterId))]};
    },
    commit(transaction) {
      return mutate((next, current) => {
        const {events, snapshot, projection, expectedLog, expectedSessionRevision} = transaction;
        restoreSession(snapshot);
        const previous = current.sessions[snapshot.sessionId];
        if (events.every(e=>current.events.some(old=>old.eventId===e.eventId && equal(old,e))) &&
          ((events.length>0 && previous?.revision>=snapshot.revision) || equal(previous,snapshot))) return {skip:true};
        if (events.some(e=>current.events.some(old=>old.eventId===e.eventId || (e.type==='card-rated' && old.type==='card-rated' && old.sessionId===e.sessionId && old.position===e.position) ||
          (e.type==='session-completed' && old.type===e.type && old.sessionId===e.sessionId)))) throw new Error('conflict: transaction already consumed; preserve recovery.');
        if (!equal(log(current),expectedLog) || (previous?.revision ?? null)!==expectedSessionRevision) throw new Error('conflict: newer tab state exists. Export pending work, then reload.');
        if (snapshot.queue.some(e=>!catalog.some(c=>c.cardId===e.card.cardId && c.characterId===e.card.characterId))) throw new Error('Unknown session card');
        if (previous && snapshot.revision!==previous.revision+1) throw new Error('Invalid session revision');
        if (events.some(e=>e.sessionId!==snapshot.sessionId)) throw new Error('Mixed session transaction');
        for(const e of events)if(e.deviceSeq<(current.sequences[e.deviceId]||0))throw new Error('conflict: device sequence already reserved');
        const computed = replay(events,current.projection);
        if (!equal(computed,projection)) throw new Error('Projection mismatch');
        next.events.push(...events); next.projection=computed; next.sessions[snapshot.sessionId]=snapshot;
        validateLinks(next);
        for (const e of events) next.sequences[e.deviceId]=Math.max(next.sequences[e.deviceId]||0,e.deviceSeq+1);
      });
    },
    async start({cards, title, source='flashcards', free=false}) {
      let session;
      const result = await mutate((next,current)=>{
        session=createSession({cards, projection:current.projection, now:clock(), sessionId:uuid(),
          baseRevision:contentVersion, timeZone, ...current.settings, free});
        session.title=title; session.source=source;session.cardIds=cards.map(c=>c.cardId);
        if (session.queue.some(e=>!catalog.some(c=>c.cardId===e.card.cardId && c.characterId===e.card.characterId))) throw new Error('Unknown card');
        next.sessions[session.sessionId]=session;
      });
      return {...result, session, projection:getData().projection};
    },
    setFavorite(characterId, saved=true) {return mutate(next=>{
      if (!catalog.some(c=>c.characterId===characterId)) throw new Error('Unknown character');
      next.favorites=next.favorites.filter(id=>id!==characterId); if(saved)next.favorites.push(characterId); next.favorites.sort();
    });},
    setSettings(settings) {return mutate(next=>{if(![5,10,20].includes(settings.dailyNew)||![5,10,20].includes(settings.limit))throw new Error('Choose 5, 10 or 20'); next.settings=settings;});},
    record(payload) {return mutate(next=>{
      const results=payload.cards.map((c,i)=>({char:typeof c==='string'?c:c.char,status:payload.statuses[i]}));
      if(results.some(r=>typeof r.char!=='string'||typeof r.status!=='boolean'))throw new Error('Invalid summary');
      const id=payload.id || uuid(); if(next.summaries.some(s=>s.id===id))return {skip:true};
      next.summaries.push({id,title:'Imported session summary (no SRS)',results,kind:payload.kind,
        completedAt:payload.completedAt,count:results.length,again:results.filter(r=>!r.status).length});
    }).then(result=>({...result,data:getData()}));},
    previewLegacy: input => previewLegacy({...input,catalog,lessonIds}),
    async importLegacy(batch) {
      try{if(!equal(await api.previewLegacy(batch),batch))throw new Error('Import preview changed; preview the source again');}
      catch(e){return {saved:false,reason:e.message};}
      return mutate(next=>{
      if(next.imports.some(b=>b.batchId===batch.batchId))return {skip:true};
      next.imports.push(structuredClone(batch)); next.favorites=[...new Set([...next.favorites,...batch.favorites])].sort();
    });},
    exportJSON() {return JSON.stringify({schemaVersion:1,kind:'HanziFunGuestExport',sourceOrigin:origin,
      generatedAt:new Date(clock()).toISOString(),data:getData(),originalSnapshot:api.getStatus().raw,error},null,2);},
    async previewRecovery(raw) {
      const value=parseImport(raw);restoreSession(value.snapshot);
      const data=getData();
      if(value.temporaryEvents){
        if(!Array.isArray(value.temporaryEvents)||value.temporaryEvents.some(e=>e.sessionId!==value.snapshot.sessionId||(e.type==='card-rated'&&e.intent!=='free')))throw new Error('Temporary recovery must contain only its real free-practice events');
        const candidate=emptyData();candidate.events=value.temporaryEvents;candidate.projection=value.projection;candidate.sessions[value.snapshot.sessionId]=value.snapshot;
        validateData(candidate,catalog);
        return {...value,kind:'PracticeRecovery'};
      }
      const projected=value.pending?replay(value.pending.events,data.projection):data.projection;
      if(!equal(projected,value.projection))throw new Error('Recovery requires its original guest history; import the full guest backup first.');
      if(value.pending && !equal(value.pending.snapshot,value.snapshot))throw new Error('Recovery snapshots disagree');
      if(value.snapshot.queue.some(e=>!catalog.some(c=>c.cardId===e.card.cardId&&c.characterId===e.card.characterId)))throw new Error('Unknown recovery card');
      return {...value,kind:'PracticeRecovery'};
    },
    restoreRecovery(value) {
      if(value.temporaryEvents)return mutate((next,current)=>{
        const existing=current.sessions[value.snapshot.sessionId];
        if(existing){if(equal(existing,value.snapshot)&&value.temporaryEvents.every(e=>current.events.some(old=>equal(old,e))))return {skip:true};throw new Error('conflict: temporary session already exists');}
        if(value.temporaryEvents.some(e=>current.events.some(old=>old.eventId===e.eventId)))throw new Error('conflict: temporary events already exist');
        next.events.push(...value.temporaryEvents);next.projection=replay(value.temporaryEvents,current.projection);next.sessions[value.snapshot.sessionId]=restoreSession(value.snapshot);
        for(const e of value.temporaryEvents)next.sequences[e.deviceId]=Math.max(next.sequences[e.deviceId]||0,e.deviceSeq+1);
        validateLinks(next);
      });
      if(value.pending)return api.commit(value.pending);
      return mutate((next,current)=>{
        if(!equal(current.projection,value.projection))throw new Error('Recovery needs the matching guest backup');
        if(current.sessions[value.snapshot.sessionId] && !equal(current.sessions[value.snapshot.sessionId],value.snapshot))throw new Error('conflict: saved session differs');
        next.sessions[value.snapshot.sessionId]=restoreSession(value.snapshot);
      });
    },
    async previewBackup(raw) {
      const value=parseImport(raw);
      if(value.kind!=='HanziFunGuestExport'||value.schemaVersion!==1)throw new Error('Unsupported export');
      validateData(value.data,catalog);
      for(const b of value.data.imports) {
        const verified=await api.previewLegacy(b);
        if(!equal(verified,b))throw new Error('Import batch failed verification');
      }
      return value;
    },
    restoreBackup(value) {return mutate((next,current)=>{
      validateData(value.data,catalog);
      if(current.events.length||Object.keys(current.sessions).length||current.favorites.length||current.imports.length||current.summaries.length)throw new Error('Restore needs an empty guest repository. Export and clear this device first.');
      Object.assign(next,structuredClone(value.data));
    });},
    clear() {return mutate(next=>{Object.keys(next).forEach(k=>delete next[k]);Object.assign(next,emptyData());},true);},
  };
  getData(); return api;
}
