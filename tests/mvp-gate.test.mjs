import {additionalCharacterPages} from '../site/pages/hsk.mjs';
import {assertPublicationReady as hskPublication} from '../site/hsk-data.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewInputs,characterReviewState,assertCharacterPublication} from '../site/publication-review.mjs';
import {planBatch,prepareBatch} from '../scripts/review-release-batch.mjs';
const approve=(id,inputs)=>({characterId:id,humanContent:'approved',reviewer:'Fixture only',date:'2026-10-26',evidence:'Synthetic unit test; never persisted',contentSha256:characterReviewState(id,inputs).contentSha256});
test('HF09 all 339 stable identities have explicit review records; source mapping is not human acceptance',()=>{
 const ids=[...reviewInputs.core,...reviewInputs.supplemental.characters].map(c=>c.characterId);assert.equal(new Set(ids).size,339);
 for(const id of ids){assert.ok(reviewInputs.reviews.characters[id]);const fixture=structuredClone(reviewInputs);fixture.reviews.characters[id].humanContent='pending';assert.equal(characterReviewState(id,fixture).accepted,false);}
});
test('HF09 core batch is dry-run, preserves audio status and refuses duplicate/unknown/stale/unsigned decisions',()=>{
 const before=JSON.stringify(reviewInputs),d=approve('char:6c34'),batch={batchId:'fixture-water',decisions:[d]};
 assert.equal(planBatch(batch)[0].to,'published');assert.equal(JSON.stringify(reviewInputs),before);
 for(const decisions of [[d,d],[{...d,characterId:'char:unknown'}],[{...d,contentSha256:'old'}],[{...d,evidence:''}],[{...d,humanContent:'pending'}],[{...d,audioListening:'approved'}],[{...d,date:'2026-02-31'}]])assert.throws(()=>planBatch({...batch,decisions}));
});
test('HF09 supplementary page needs individual Tier2 content before approval; edits invalidate signature',()=>{
 const inputs=structuredClone(reviewInputs),c=inputs.supplemental.characters.find(c=>c.glyph==='爱');
 inputs.supplementalTeaching.entries=inputs.supplementalTeaching.entries.filter(e=>e.characterId!==c.characterId);
 assert.throws(()=>planBatch({batchId:'fixture-love',decisions:[approve(c.characterId,inputs)]},inputs),/Missing teaching/);
 inputs.supplementalTeaching.entries.push({characterId:c.characterId,readingId:c.primaryReadingId,meaning:'love',word:'爱好',wordPinyin:'àihào',wordMeaning:'hobby',sentence:'我爱妈妈。',pinyin:'Wǒ ài māma.',translation:'I love Mum.',mnemonic:'Imagine caring for someone.',reviewStatus:'human-reviewed'});
 const d=approve(c.characterId,inputs);assert.equal(planBatch({batchId:'fixture-love',decisions:[d]},inputs).length,1);
 inputs.reviews.characters[c.characterId]=d;assert.doesNotThrow(()=>assertCharacterPublication(c.characterId,inputs));
 inputs.supplementalTeaching.entries.find(e=>e.characterId===c.characterId).translation='Changed after review';assert.throws(()=>assertCharacterPublication(c.characterId,inputs),/pending/);
});
test('HF09 an approved flag without source-content fingerprint cannot publish even complete core teaching',()=>{
 const inputs=structuredClone(reviewInputs);inputs.reviews.characters['char:6c34']={...approve('char:6c34',inputs),contentSha256:undefined};assert.throws(()=>assertCharacterPublication('char:6c34',inputs),/pending/);
});

test('HF09 supplement approval drives real renderer and publication gate without altering other routes',()=>{
 const id='char:7231',c=reviewInputs.supplemental.characters.find(c=>c.characterId===id),old=reviewInputs.reviews.characters[id],oldEntries=reviewInputs.supplementalTeaching.entries;
 reviewInputs.supplementalTeaching.entries=oldEntries.filter(e=>e.characterId!==id);
 try{
  reviewInputs.supplementalTeaching.entries.push({characterId:id,readingId:c.primaryReadingId,meaning:'love',word:'爱好',wordPinyin:'àihào',wordMeaning:'hobby',sentence:'我爱妈妈。',pinyin:'Wǒ ài māma.',translation:'I love Mum.',mnemonic:'Imagine caring for someone.',reviewStatus:'human-reviewed'});
  reviewInputs.reviews.characters[id]=approve(id);assert.doesNotThrow(()=>hskPublication({path:'/dictionary/爱/',indexing:'index'}));
  const html=additionalCharacterPages().find(p=>p.path==='/dictionary/爱/').content;assert.doesNotMatch(html,/Human-reviewed Tier 2|pending|unavailable|stable ID/i);assert.match(html,/I love Mum/);assert.doesNotMatch(html,/not yet an accepted Tier 2/);
  const other=reviewInputs.supplemental.characters.find(c=>c.characterId!==id&&!characterReviewState(c.characterId).accepted);if(other)assert.throws(()=>hskPublication({path:'/dictionary/'+other.glyph+'/',indexing:'index'}),/pending/);
 }finally{reviewInputs.reviews.characters[id]=old;reviewInputs.supplementalTeaching.entries=oldEntries;}
});

test('HF09 prepared batches partition all core/supplemental IDs and never generate an approval',()=>{
 const core=Array.from({length:6},(_,i)=>prepareBatch('core-'+String(i+1).padStart(2,'0'))).flatMap(b=>b.decisions),hsk=Array.from({length:11},(_,i)=>prepareBatch('hsk-'+String(i+1).padStart(2,'0'))).flatMap(b=>b.decisions);
 assert.equal(core.length,126);assert.equal(hsk.length,213);assert.equal(new Set([...core,...hsk].map(d=>d.characterId)).size,339);assert.ok([...core,...hsk].every(d=>d.humanContent==='pending'&&!d.reviewer));
 assert.throws(()=>prepareBatch('core-07'));assert.throws(()=>planBatch(prepareBatch('core-01')));
});
