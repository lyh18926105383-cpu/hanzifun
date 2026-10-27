import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parsePSV,planInjection,atomicWrite,mergeStructureNotes,mergeReadingSelections} from '../scripts/inject-phase2-batch.mjs';
import {reviewInputs,characterReviewState} from '../site/publication-review.mjs';
import {planBatch} from '../scripts/review-release-batch.mjs';
import {learningData} from '../site/learning-data.mjs';
import {additionalCharacterPages} from '../site/pages/hsk.mjs';
import {parse} from 'parse5';
import {supplementalSearchEntries,findReading} from '../site/hsk-data.mjs';
const text=fs.readFileSync(new URL('../data/editorial/phase2/batch-a.psv',import.meta.url),'utf8');
const metadata=JSON.parse(fs.readFileSync(new URL('../data/editorial/phase2/batch-a-review.json',import.meta.url),'utf8'));
const policy=()=>({status:'preview'});
const plan=(patch={})=>planInjection({text,metadata,policy,...patch});

test('HF10 validates all 54 owner-supplied rows, contextual readings, layouts and bound approval hashes without mutating inputs',()=>{
 const before=JSON.stringify(reviewInputs),p=plan();assert.equal(p.entries.length,54);assert.equal(JSON.stringify(reviewInputs),before);
 const entries=Object.fromEntries(p.entries.map(e=>[reviewInputs.supplemental.characters.find(c=>c.characterId===e.characterId).glyph,e]));
 for(const [g,r]of Object.entries({'好':'hao3','少':'shao3','分':'fen1','会':'hui4','了':'le5','的':'de5','吗':'ma5','么':'me5','子':'zi5','一':'yi1','不':'bu4'}))assert.ok(entries[g].readingId.endsWith(':'+r));
 for(const e of p.entries){assert.equal(e.humanAcceptance,'approved');assert.equal(e.structureReview.status,'reviewed');assert.equal(e.reviewDate,'2026-10-26');}
 const inputs={...reviewInputs,supplementalTeaching:p.teaching};assert.equal(planBatch({batchId:p.batchId,decisions:p.decisions},inputs).length,54);
});
test('HF10 refuses missing/duplicate/cross-batch/malformed/placeholder rows and words without their target character',()=>{
 const lines=text.trim().split('\n');
 for(const changed of [lines.slice(1).join('\n'),[...lines,lines[0]].join('\n'),text.replace(/^学\|/,'名|'),text.replace('to study; to learn','TODO'),text.replace('学|to study; to learn|学习','学|to study; to learn|阅读')])assert.throws(()=>plan({text:changed}));
 assert.throws(()=>parsePSV('学|too|few'));assert.throws(()=>parsePSV('学习|a|b|c|d|e|f|g|h'));
});
test('HF10 ambiguous readings, unreviewed structure and invalid review dates fail before writing',()=>{
 for(const mutate of [m=>delete m.readingSelections['好'],m=>m.readingSelections['好']='hao9',m=>delete m.structureNotes['一'],m=>m.reviewDate='2026-02-31',m=>m.structureNotes['一'].layout='invented',m=>m.humanAcceptance='yes']){
  const m=structuredClone(metadata);mutate(m);assert.throws(()=>plan({metadata:m}));
 }
});
test('HF10 structure notes can be supplied independently and must stay within the frozen batch',()=>{
 const merged=mergeStructureNotes({...metadata,structureNotes:{}},{reviewer:'Codex structural audit',date:'2026-10-27',notes:{'一':{layout:'single-component',description:'One horizontal stroke.'}}});
 assert.equal(merged.structureReviewer,'Codex structural audit');assert.equal(merged.structureReviewDate,'2026-10-27');assert.ok(merged.structureNotes['一']);
 assert.throws(()=>plan({metadata:{...merged,structureNotes:{'名':{layout:'left-right',description:'Outside Batch A.'}}}}),/outside frozen batch/);
 assert.throws(()=>mergeStructureNotes(metadata,{reviewer:'Codex',date:'2026-02-31',notes:{}}),/valid date/);
});
test('HF10 contextual reading selections can be overlaid independently with conflict detection',()=>{
 const merged=mergeReadingSelections({...metadata,readingSelections:{}},{'好':'hao3'});
 assert.equal(merged.readingSelections['好'],'hao3');
 assert.throws(()=>mergeReadingSelections(metadata,{'好':'hao4'}),/Conflicting/);
 assert.throws(()=>plan({metadata:{...merged,readingSelections:{'名':'ming2'}}}),/outside frozen batch/);
});
test('HF10 injection is idempotent after release and refuses changed published content',()=>{
 const p=plan(),inputs={...reviewInputs,supplementalTeaching:p.teaching};
 assert.equal(plan({inputs,policy:()=>({status:'published'})}).changed,false);
 assert.throws(()=>plan({inputs,policy:()=>({status:'published'}),text:text.replace('I study Chinese every day.','A changed translation.')}),/overwrite published/);
});
test('HF10 structural source changes or content edits invalidate approval, and unsigned content cannot publish',()=>{
 const p=plan(),inputs=structuredClone({...reviewInputs,supplementalTeaching:p.teaching});
 const e=p.entries[0],d=p.decisions[0];inputs.reviews.characters[e.characterId]=d;
 assert.equal(characterReviewState(e.characterId,inputs).accepted,true);
 inputs.supplementalTeaching.entries.find(x=>x.characterId===e.characterId).structureReview.sourceSha256='0'.repeat(64);
 assert.equal(characterReviewState(e.characterId,inputs).accepted,false);
 assert.throws(()=>planBatch({batchId:p.batchId,decisions:[d]},inputs));
 const pending=structuredClone(metadata);pending.humanAcceptance='pending';const q=plan({metadata:pending});
 assert.throws(()=>planBatch({batchId:q.batchId,decisions:q.decisions},{...reviewInputs,supplementalTeaching:q.teaching}));
});
test('HF10 failed atomic replacement preserves original file, removes temporary files and detects competing edits',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hf10-atomic-')),file=path.join(dir,'teaching.json');
 try{
  fs.writeFileSync(file,'original');assert.throws(()=>atomicWrite(file,'next','wrong'),/changed/);
  const io={...fs,renameSync(){throw Error('simulated disk failure');}};
  assert.throws(()=>atomicWrite(file,'next','original',io),/disk failure/);assert.equal(fs.readFileSync(file,'utf8'),'original');assert.deepEqual(fs.readdirSync(dir),['teaching.json']);
  atomicWrite(file,'next','original');assert.equal(fs.readFileSync(file,'utf8'),'next');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('HF10 released contextual primary is the one used for fresh learning cards; existing reading card IDs stay available',()=>{
 if(!reviewInputs.supplementalTeaching.entries.some(e=>e.generationBatch==='hf10-phase2-a'))return;
 const data=learningData();for(const e of reviewInputs.supplementalTeaching.entries.filter(e=>e.generationBatch==='hf10-phase2-a')){
  assert.ok(data.primary.includes('card:dictionary:'+e.readingId));const c=data.catalog.find(c=>c.cardId==='card:dictionary:'+e.readingId);assert.ok(c.back.includes(e.sentence));
 }
 for(const c of reviewInputs.supplemental.characters)for(const id of c.readingId)assert.ok(data.catalog.some(c=>c.cardId==='card:dictionary:'+id));
});
test('HF10 all 54 rendered pages expose the exact supplied teaching copy, selected reading and source-bound visible shape explanation',()=>{
 const p=plan(),pages=additionalCharacterPages();
 const walk=(n,predicate)=>predicate(n)?n:(n.childNodes||[]).map(c=>walk(c,predicate)).find(Boolean);
 const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
 for(const e of p.entries){
  const glyph=reviewInputs.supplemental.characters.find(c=>c.characterId===e.characterId).glyph;
  const page=pages.find(p=>p.path==='/dictionary/'+glyph+'/');const dom=parse(page.content),copy=text(dom);
  for(const key of ['meaning','word','wordPinyin','wordMeaning','sentence','pinyin','translation','mnemonic'])assert.ok(copy.includes(e[key]),glyph+' '+key);
  const selected=walk(dom,n=>n.tagName==='option'&&n.attrs.some(a=>a.name==='selected'));
  assert.equal(selected.attrs.find(a=>a.name==='value').value,e.readingId);
  assert.ok(copy.includes(e.structureReview.description));assert.doesNotMatch(copy,/human-reviewed|Tier\s*2|pending|contentSha256|publicationStatus|generationBatch|preview|noindex/i);
 }
});
test('HF10 supplemental search labels use the chosen teaching reading and meaning without leaking draft status',()=>{
 const rows=supplementalSearchEntries();assert.equal(rows.length,213);
 for(const r of rows)assert.doesNotMatch(r.label,/import draft|preview|pending|Tier\s*2/i);
 for(const e of reviewInputs.supplementalTeaching.entries){const r=rows.find(r=>r.id===e.characterId);assert.ok(r.label.includes(findReading(e.readingId).pinyin.marked));assert.ok(r.label.includes(e.meaning));assert.ok(r.aliases.includes(e.word));}
});
