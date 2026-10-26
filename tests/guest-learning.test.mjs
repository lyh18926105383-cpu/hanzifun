import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRepository,STORAGE_KEY,validateData} from '../src/learning/repository.mjs';
import {canonical,LEGACY_KEYS,MAX_IMPORT_BYTES,parseImport} from '../src/learning/legacy-import.mjs';
import {createFlashcardController} from '../src/client/flashcards.mjs';
import {createEvent,emptyProjection,replay,applyEvent} from '../src/learning/events.mjs';
import {createSession} from '../src/learning/session.mjs';
import {learningData} from '../site/learning-data.mjs';
import {learningPages} from '../site/pages/learning.mjs';
const library=learningData(), water=library.catalog.find(c=>c.front==='水');
const now=Date.UTC(2026,9,26,8);
class Storage {
  map=new Map();fail=false;readFail=false;
  get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}
  getItem(k){if(this.readFail)throw Error('SecurityError');return this.map.get(k)??null;}
  setItem(k,v){if(this.fail)throw Error('QuotaExceededError');this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
const setup=(options={})=>{
  const storage=options.storage||new Storage();
  const repo=createRepository({storage,catalog:library.catalog,uuid:randomUUID,clock:()=>now,origin:'http://localhost',...options});
  return {storage,repo};
};
const control=(repo,session,projection,commit=t=>repo.commit(t))=>{let seq=0;return createFlashcardController({session,projection,deviceId:randomUUID(),nextSeq:n=>{const first=seq;seq+=n;return first;},clock:()=>now,uuid:randomUUID,commit});};
test('HF06 four real decks, 126 characters and two separate 睛 teaching positions are mapped',()=>{
  assert.equal(library.decks.length,4);assert.equal(new Set(library.catalog.map(c=>c.characterId)).size,126);
  assert.equal(library.catalog.filter(c=>c.front==='睛'&&c.source==='characters.js').length,2);
  for(const d of library.decks)assert.deepEqual(d.cardIds.map(id=>library.catalog.find(c=>c.cardId===id).front),d.chars);
  assert.equal(learningPages().length,8);
});
test('HF06 fallback without navigator.locks persists initial queue, every rating, refresh and unique completion',async()=>{
  const {repo,storage}=setup();const initial=await repo.start({cards:[water],title:'水'});assert.equal(initial.saved,true);
  const c=control(repo,initial.session,initial.projection);await c.flip();await c.rate('unfamiliar');
  const again=setup({storage,clock:()=>now+600000}).repo;
  assert.equal(again.getDashboard().dueCards,1);assert.equal(again.getDashboard().practicedCharacters,1);
  assert.equal(again.getDashboard().completedSessions,1);assert.equal(again.getData().sessions[initial.session.sessionId].cursor,1);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).projection.cards[water.cardId].dueAt,now+600000);
  assert.equal(await c.rate('familiar'),false);
});
test('HF06 lost acknowledgements retry identical event transactions even after a later session write',async()=>{
  const {repo}=setup();const a=await repo.start({cards:[water],title:'water'});let lost=false,tx;
  const c=control(repo,a.session,a.projection,async t=>{tx=t;const r=await repo.commit(t);if(lost){lost=false;throw Error('lost reply');}return r;});
  await c.flip();lost=true;assert.equal(await c.rate('familiar'),false);
  assert.equal((await repo.start({cards:[water],title:'other',free:true})).saved,true);
  assert.equal(await c.retry(),true);assert.equal(repo.getData().events.length,2);assert.equal((await repo.commit(tx)).saved,true);
});
test('HF06 two repositories preserve both favorites and refuse stale session edits',async()=>{
  const {repo,storage}=setup();const other=setup({storage}).repo;
  const result=await Promise.all([repo.setFavorite(water.characterId),other.setFavorite('char:775b')]);assert.ok(result.every(r=>r.saved));
  assert.equal(repo.getData().favorites.length,2);
  const initial=await repo.start({cards:[water],title:'water'});
  const a=control(repo,initial.session,initial.projection),b=control(other,initial.session,initial.projection);
  assert.equal(await a.flip(),true);assert.equal(await b.pause(),false);assert.match(b.getState().error,/conflict/);
  assert.equal(repo.getData().sessions[initial.session.sessionId].revision,1);
});
test('HF06 Web Locks branch wraps writes and storage exceptions never return saved',async()=>{
  let locks=0;const {repo,storage}=setup({locks:{request:async(name,fn)=>{assert.equal(name,'hanzifun-guest-write');locks++;return fn();}}});
  assert.equal((await repo.setFavorite(water.characterId)).saved,true);assert.equal(locks,1);
  storage.fail=true;const before=storage.getItem(STORAGE_KEY);
  assert.equal((await repo.setFavorite('char:775b')).saved,false);assert.equal(storage.getItem(STORAGE_KEY),before);
  storage.readFail=true;assert.doesNotThrow(()=>repo.getData());assert.equal((await repo.start({cards:[water]})).saved,false);
});
test('HF06 damaged/future snapshots stay byte-identical until explicit clear, export includes original',async()=>{
  for(const raw of ['{broken',JSON.stringify({schemaVersion:999})]){
    const {repo,storage}=setup();storage.setItem(STORAGE_KEY,raw);
    assert.equal((await repo.setFavorite(water.characterId)).saved,false);assert.equal(storage.getItem(STORAGE_KEY),raw);
    assert.equal(JSON.parse(repo.exportJSON()).originalSnapshot,raw);
    assert.equal((await repo.clear()).saved,true);assert.equal(repo.getData().events.length,0);
  }
});
const sources=[
  {version:1,sessions:[{id:'old',completedAt:now,results:[{char:'睛',status:true},{char:'睛',status:false},{char:'龍',status:false}]}],characters:{'睛':{seenCount:20,familiarCount:8,unfamiliarCount:12,needsReview:true}}},
  {sessions:[{lessonId:'missing-lesson',completedAt:now,quizCorrect:1,quizTotal:2}]},
  {version:1,characters:{'水':{known:true,attempts:9,seenAt:'2026-10-25'}},saved:['水'],sessions:[{deck:'first-six',title:'old',chars:['水'],count:1,again:0,finishedAt:'2026-10-25'}]},
];
test('HF06 three legacy sources retain raw order/stats, are idempotent and never mint SRS events',async()=>{
  const {repo,storage}=setup();
  for(let i=0;i<3;i++){
    const raw=JSON.stringify(sources[i]);storage.setItem(LEGACY_KEYS[i],raw);
    const b=await repo.previewLegacy({raw,sourceKey:LEGACY_KEYS[i],sourceOrigin:'http://localhost'});
    assert.equal((await repo.importLegacy(b)).saved,true);assert.equal((await repo.importLegacy(b)).saved,true);
    assert.equal(storage.getItem(LEGACY_KEYS[i]),raw);assert.equal(repo.getData().imports[i].raw,raw);
  }
  assert.equal(repo.getData().imports.length,3);assert.equal(repo.getData().events.length,0);
  assert.equal(repo.getDashboard().practicedCharacters,0);assert.equal(repo.getDashboard().storyHistory.length,1);
  assert.deepEqual(repo.getData().imports[0].unresolved,['龍']);assert.equal(repo.getData().favorites.length,1);
  assert.equal(repo.getData().imports[0].characters['睛'].seenCount,20);
  const backup=await repo.previewBackup(repo.exportJSON());const other=setup().repo;await other.clear();
  assert.equal((await other.restoreBackup(backup)).saved,true);
  const copy=other.getData(),original=repo.getData();delete copy.revision;delete original.revision;assert.deepEqual(copy,original);
});
test('HF06 newer legacy snapshot replaces displayed source summary without adding overlapping totals',async()=>{
  const {repo}=setup();for(const n of [20,22]){const data=structuredClone(sources[0]);data.characters['睛'].seenCount=n;
    const b=await repo.previewLegacy({raw:JSON.stringify(data),sourceKey:LEGACY_KEYS[0],sourceOrigin:'http://localhost'});await repo.importLegacy(b);}
  assert.equal(repo.getData().imports.length,2);assert.equal(repo.getDashboard().legacy.length,1);
  assert.equal(repo.getDashboard().legacy[0].characters['睛'].seenCount,22);
});
test('HF06 malformed imports, wrong versions, unsafe fields and oversized files fail before writing',async()=>{
  const {repo,storage}=setup();
  for(const raw of ['{bad','{"version":2,"sessions":[],"characters":{}}','{"version":1,"sessions":[{}],"characters":{}}','{"__proto__":{}}']){
    await assert.rejects(repo.previewLegacy({raw,sourceKey:LEGACY_KEYS[0],sourceOrigin:'http://localhost'}));
  }
  assert.throws(()=>parseImport(' '.repeat(MAX_IMPORT_BYTES+1)),/exceeds/);
  assert.equal(storage.getItem(STORAGE_KEY),null);
});
test('HF06 favorites never delete practice, history paginates beyond eight, and recovery exports can retry',async()=>{
  const {repo}=setup();let recovery;
  for(let i=0;i<10;i++){
    const initial=await repo.start({cards:[water],title:'round '+i,free:true});let fail=i===9;
    const c=control(repo,initial.session,initial.projection,tx=>fail&&tx.events.length?{saved:false,reason:'quota'}:repo.commit(tx));
    await c.flip();await c.rate('familiar');if(fail){recovery=await repo.previewRecovery(JSON.stringify(c.exportState()));assert.equal((await repo.restoreRecovery(recovery)).saved,true);}
  }
  assert.equal(repo.getDashboard().recentSessions.length,8);assert.equal(repo.getDashboard().history.length,10);
  await repo.setFavorite(water.characterId);await repo.setFavorite(water.characterId,false);
  assert.equal(repo.getData().favorites.length,0);assert.equal(repo.getDashboard().completedSessions,10);
  const backup=await repo.previewBackup(repo.exportJSON());assert.equal(backup.data.events.length,20);
});
test('HF06 temporary practice is usable across ratings but never says saved',async()=>{
  const s=createSession({cards:[water],projection:emptyProjection(),now,sessionId:randomUUID(),baseRevision:'v1',free:true});let seq=0;
  const c=createFlashcardController({session:s,projection:emptyProjection(),temporary:true,commit:()=>({temporary:true}),deviceId:randomUUID(),nextSeq:n=>{const x=seq;seq+=n;return x;},clock:()=>now});
  await c.flip();await c.rate('familiar');assert.equal(c.getState().saveState,'temporary');assert.equal(c.getState().session.status,'complete');
  const {repo}=setup();const recovery=await repo.previewRecovery(JSON.stringify(c.exportState()));assert.equal((await repo.restoreRecovery(recovery)).saved,true);assert.equal(repo.getDashboard().completedSessions,1);assert.equal(repo.getData().projection.cards[water.cardId].dueAt,null);assert.equal((await repo.restoreRecovery(recovery)).saved,true);
});
test('HF06 bulk replay remains identical to immutable reducer and rejects forged cursor/projection',async()=>{
  const {repo}=setup();const initial=await repo.start({cards:[water],title:'water'});const c=control(repo,initial.session,initial.projection);await c.flip();await c.rate('familiar');
  const data=repo.getData();assert.deepEqual(replay(data.events),data.events.reduce(applyEvent,emptyProjection()));
  const forged=JSON.parse(JSON.stringify(data));forged.sessions[initial.session.sessionId].results[0].rating='unfamiliar';assert.throws(()=>validateData(forged,library.catalog),/differ/);
});

test('HF06 optimistic check compares the exact raw snapshot that produced the candidate',async()=>{
  const storage=new Storage();let hook=false,reads=0;
  const original=storage.getItem.bind(storage);
  storage.getItem=k=>{const v=original(k);if(hook&&k===STORAGE_KEY&&++reads===1){storage.map.set(k,canonical({...JSON.parse(v),revision:999,favorites:['char:775b']}));}return v;};
  const {repo}=setup({storage,locks:{request:async(_,fn)=>fn()}});await repo.setFavorite(water.characterId);
  hook=true;const r=await repo.setFavorite('char:4f11');assert.equal(r.saved,false);assert.match(r.reason,/conflict/);
  assert.equal(JSON.parse(original(STORAGE_KEY)).revision,999);
});

test('HF06 denied Web Locks falls back, and explicit marker recovery preserves guest data',async()=>{
  const {repo,storage}=setup({locks:{request(){throw new DOMException('Restricted','SecurityError');}}});
  assert.equal((await repo.setFavorite(water.characterId)).saved,true);
  const raw=storage.getItem(STORAGE_KEY);storage.setItem('hanzifun.guest.lock.orphan',JSON.stringify({choosing:true,ticket:0}));
  assert.equal(repo.resetWriteCoordination().reset,true);assert.equal(storage.getItem(STORAGE_KEY),raw);assert.equal(storage.getItem('hanzifun.guest.lock.orphan'),null);
});
