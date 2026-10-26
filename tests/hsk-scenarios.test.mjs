import {scenarioData} from '../site/hsk-data.mjs';
import {characterReviewState} from '../site/publication-review.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {validateHsk} from '../scripts/validate-hsk-data.mjs';
import {membership,coverage,lexicon,findReading,hskDecks,assertPublicationReady} from '../site/hsk-data.mjs';
import {hskPages,additionalCharacterPages} from '../site/pages/hsk.mjs';
import {scenarioPages} from '../site/pages/scenarios.mjs';
import {learningData} from '../site/learning-data.mjs';
import {createRepository,STORAGE_KEY} from '../src/learning/repository.mjs';
import {createFlashcardController} from '../src/client/flashcards.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';

test('HF07 source counts, rows, stable identities and all raw stroke hashes validate',()=>{
 assert.equal(validateHsk().status,'PASS');
 assert.equal(coverage.additionalCharacters,213);assert.equal(coverage.unionCharacters,339);
 assert.equal(membership.filter(m=>m.system==='hsk-2'&&m.itemType==='derived-character').length,174);
});
test('HF07 writing keeps combined 1–2 scope; vocabulary and recognition have different denominators',()=>{
 const w=membership.filter(m=>m.itemType==='writing-character');assert.equal(w.length,100);assert.ok(w.every(m=>m.level==='1-2'));
 assert.equal(coverage.lists.find(l=>l.system==='hsk-3'&&l.itemType==='vocabulary').uniqueCharacters,248);
 assert.equal(coverage.lists.find(l=>l.itemType==='recognition-character').uniqueCharacters,246);
 const html=hskPages().find(p=>p.path==='/academic/hsk-3/').content;assert.match(html,/not provide a standalone level-1/);assert.match(html,/fragment URL/);
});
test('HF07 fixed decks reuse character cards across editions and preserve four legacy sets',()=>{
 const lib=learningData();assert.equal(new Set(lib.catalog.map(c=>c.cardId)).size,lib.catalog.length);
 assert.deepEqual(lib.decks.slice(0,4).map(d=>d.slug),['first-six','at-the-tea-house','mid-autumn','ants-and-a-bean']);
 for(const d of lib.decks){assert.deepEqual(d.cardIds.map(id=>lib.catalog.find(c=>c.cardId===id).front),d.chars);assert.equal(new Set(d.cardIds).size,d.cardIds.length);}
 const old=lib.decks.find(d=>d.slug==='hsk-2-2015-level-1-vocabulary'),current=lib.decks.find(d=>d.slug==='hsk-3-2025-level-1-vocabulary');
 assert.equal(old.cardIds.length,174);assert.equal(current.cardIds.length,248);
 const a=old.cardIds.find(id=>lib.catalog.find(c=>c.cardId===id).front==='水');assert.ok(current.cardIds.includes(a));
 assert.ok(lib.catalog.every(c=>/^char:[0-9a-f]+$/.test(c.characterId)),'Words never masquerade as character rating events');
});
test('HF07 source completeness does not open unaccepted dictionary or scenario pages',()=>{
 for(const p of ['/academic/','/academic/hsk-2/','/academic/hsk-3/']){assert.equal(resolveRoutePolicy(p).indexing,'index');assert.doesNotThrow(()=>assertPublicationReady({path:p,indexing:'index'}));}
 if(!characterReviewState('char:60a8').accepted)assert.throws(()=>assertPublicationReady({path:'/dictionary/您/',indexing:'index'}),/pending/);
 const old=scenarioData.review.humanAcceptance;try{scenarioData.review.humanAcceptance='pending';assert.throws(()=>assertPublicationReady({path:'/scenarios/travel/restaurant/',indexing:'index'}),/pending/);}finally{scenarioData.review.humanAcceptance=old;}
 assert.doesNotThrow(()=>assertPublicationReady({path:'/scenarios/travel/restaurant/',indexing:'index'}));
 if(resolveRoutePolicy('/dictionary/您/').indexing==='index')assert.ok(characterReviewState('char:60a8').accepted);
 for(const p of additionalCharacterPages()){const c=lexicon.characters.find(c=>p.path==='/dictionary/'+c.glyph+'/');assert.match(p.content,characterReviewState(c.characterId).accepted?/Human-reviewed Tier 2/:/not yet an accepted Tier 2/);assert.match(p.content,/listening review pending/);assert.doesNotMatch(p.content,/<audio|speechSynthesis/);}
});
test('HF07 phrase boundaries retain full context and real links for every sentence token',()=>{
 const pages=scenarioPages().filter(p=>p.path.endsWith('restaurant/')||p.path.endsWith('icebreakers/'));
 assert.equal(pages.length,2);
 for(const p of pages){assert.equal((p.content.match(/class="hf07-sentence"/g)||[]).length,3);assert.equal((p.content.match(/disabled aria-describedby="audio-/g)||[]).length,3);assert.match(p.content,/data-token-add/);assert.match(p.content,/returnTo=/);assert.doesNotMatch(p.content,/data-word-reveal|speechSynthesis/);}
});
test('HF07 supplemental readings keep separate polyphones and traditional forms with provenance',()=>{
 const x=lexicon.characters.find(c=>c.glyph==='长');assert.ok(x.readingId.length>1);
 assert.ok(x.readingId.map(findReading).every(r=>r.traditionalForms.length&&r.evidence.length));
 const py=x.readingId.map(id=>findReading(id).pinyin.numeric);assert.ok(py.includes('chang2'));assert.ok(py.includes('zhang3'));
});
test('HF07 new content accepts an old guest snapshot and persists exact supplemental reading through reload',async()=>{
 const storage={data:new Map(),getItem(k){return this.data.get(k)||null;},setItem(k,v){this.data.set(k,v);},removeItem(k){this.data.delete(k);}},lib=learningData();
 const core=lib.catalog.filter(c=>c.source!=='hsk-import');let repo=createRepository({storage,catalog:core,uuid:randomUUID,clock:()=>1800000000000});
 await repo.setFavorite('char:6c34');const old=storage.getItem(STORAGE_KEY);
 repo=createRepository({storage,catalog:lib.catalog,uuid:randomUUID,clock:()=>1800000000000});assert.equal(storage.getItem(STORAGE_KEY),old);assert.deepEqual(repo.getData().favorites,['char:6c34']);
 const card=lib.catalog.find(c=>c.source==='hsk-import'&&c.front==='长'&&c.readingId.endsWith(':zhang3'));
 const r=await repo.start({cards:[card],title:'Selected reading',source:'hsk-3-selected'});assert.equal(r.saved,true);
 let seq=0;const c=createFlashcardController({session:r.session,projection:r.projection,uuid:randomUUID,deviceId:randomUUID(),nextSeq:n=>{const first=seq;seq+=n;return first;},clock:()=>1800000000000,commit:t=>repo.commit(t)});
 await c.flip();await c.rate('unfamiliar');
 repo=createRepository({storage,catalog:lib.catalog});const s=repo.getData().sessions[r.session.sessionId];assert.equal(s.queue[0].card.readingId,card.readingId);assert.equal(repo.getData().projection.cards[card.cardId].dueAt,1800000600000);
});
