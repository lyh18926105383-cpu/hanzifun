import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import Ajv from 'ajv';
import {root,readJSON,sha256,pinyinForms,wordId,characterId} from './data-foundation-lib.mjs';
import {characterReviewState,reviewInputs} from '../site/publication-review.mjs';
import {buildTopics} from './build-hsk-topics.mjs';
const schema=new Ajv({allErrors:true}).compile(readJSON('data/schemas/hsk-level-two.schema.json'));
export function validateLevelTwo(value=readJSON('data/hsk/level-2-core.json')){
 assert.ok(schema(value),'Level-two schema: '+JSON.stringify(schema.errors));
 const sources=readJSON('data/sources.lock.json');
 assert.equal(value.sourceReleaseId,'hsk-2-2015');assert.equal(value.sourceSha256,sources.sources.find(s=>s.id===value.sourceReleaseId).sha256);
 assert.equal(value.dictionarySourceSha256,sources.sources.find(s=>s.id==='cedict').sha256);
 assert.equal(value.coveredCount,150);assert.equal(value.sourceCount,150);assert.equal(value.deferred.length,0);
 assert.equal(value.contentSha256,sha256(JSON.stringify(value.entries)),'Stale level-two content hash');
 const all=[...reviewInputs.core,...reviewInputs.supplemental.characters],known=new Set(all.map(c=>c.characterId));
 assert.equal(new Set(value.entries.map(w=>w.itemId)).size,150);let exampleCount=0;
 for(const [index,w] of value.entries.entries()){
  assert.equal(w.ordinal,index+1);assert.equal(w.itemId,wordId(w.glyph));assert.equal(w.system,'hsk-2');assert.equal(w.level,'2');assert.equal(w.edition,'2015-vocabulary');assert.equal(w.cumulative,false);
  assert.equal(w.sourceLocator,`xlsx:新HSK5000词:A${index+152}:B${index+152}`);
  const glyphs=[...new Set([...w.glyph].filter(g=>/\p{Script=Han}/u.test(g)))];
  assert.deepEqual(w.characterIds,glyphs.map(characterId));assert.equal(w.constituentBindings.length,glyphs.length);
  for(const [i,b] of w.constituentBindings.entries()){
   assert.equal(b.characterId,characterId(glyphs[i]));assert.equal(b.glyph,glyphs[i]);
   assert.equal(b.path,known.has(b.characterId)?'/dictionary/'+b.glyph+'/':null);assert.equal(b.status,b.path?'published':'next-character-batch');
   if(b.path)assert.ok(characterReviewState(b.characterId).accepted,'Unreviewed constituent '+b.glyph);
  }
  for(const r of w.readings){assert.deepEqual(r.pinyin,pinyinForms(r.pinyin.numeric));assert.ok(r.senses.length);assert.match(r.sourceLocator,/^cedict_ts.u8:line:\d+(;cedict_ts.u8:line:\d+)*$/);if(r.derivation){assert.equal(r.parts.map(p=>p.pinyin.numeric).join(' '),r.pinyin.numeric);assert.deepEqual(r.parts.map(p=>p.glyph),w.lexicalParts);}}
  if(w.teaching){exampleCount++;const t=w.teaching;assert.ok(w.readings.some(r=>r.pinyin.numeric===t.reading.numeric));assert.deepEqual(t.pinyin,pinyinForms(t.pinyin.numeric));assert.equal(t.tokens.map(t=>t.glyph).join(''),[...t.sentence].filter(g=>/\p{Script=Han}/u.test(g)).join(''));assert.equal(t.tokens.length,t.pinyin.syllables.length);assert.ok(t.translation.trim());
   for(const [i,token] of t.tokens.entries()){assert.equal(token.characterId,characterId(token.glyph));assert.deepEqual(token.pinyin,pinyinForms(t.pinyin.syllables[i]));assert.equal(token.path,known.has(token.characterId)?'/dictionary/'+token.glyph+'/':null);}
   let at=0;for(const part of w.lexicalParts&&w.glyph.includes('……')?w.lexicalParts:[w.glyph]){const found=t.sentence.indexOf(part,at);assert.ok(found>=0,'Example must contain target: '+w.glyph);at=found+part.length;}
  }
 }
 assert.equal(value.exampleCount,exampleCount);assert.equal(exampleCount,64);
 assert.equal(value.fullyLinkedCount,value.entries.filter(w=>w.constituentBindings.every(b=>b.path)).length);
 const expected=new Map();for(const w of value.entries)for(const b of w.constituentBindings)if(!b.path){const row=expected.get(b.characterId)||{...b,wordIds:[],sourceLocators:[]};row.wordIds.push(w.itemId);row.sourceLocators.push(w.sourceLocator);expected.set(b.characterId,row);}
 assert.deepEqual(value.nextCharacterBatch,[...expected.values()]);
 return {sourceEntries:value.sourceCount,mappedEntries:value.coveredCount,examples:exampleCount,fullyLinkedWords:value.fullyLinkedCount,nextCharacters:value.nextCharacterBatch.length};
}
export function validateHskExpansion({level=readJSON('data/hsk/level-2-core.json'),topics=readJSON('data/hsk/topics.json'),reviews=readJSON('data/editorial/review-decisions.json'),release=readJSON('site/release.json'),requireAcceptance=true}={}){
 const counts=validateLevelTwo(level);assert.deepEqual(topics,buildTopics(),'Stale topic source/reading/pronunciation/cross-index bindings');
 assert.equal(new Set(topics.groups.map(g=>g.id)).size,topics.groups.length);
 for(const g of topics.groups){assert.ok(g.entries.length>0);assert.equal(new Set(g.entries.map(e=>e.characterId)).size,g.entries.length);}
 if(requireAcceptance){
  const batchId='hf14-hsk-data-2026-10-31',d=reviews.hskBatches?.[batchId];
  assert.equal(d?.status,'approved','HSK batch acceptance missing');assert.equal(d?.approvalBasis,'owner-authorized-schema-and-source-validation');assert.ok(d.reviewer?.trim());assert.equal(d.date,'2026-10-31');assert.ok(d.evidence?.trim());
  assert.equal(d.levelTwoSha256,level.contentSha256,'Stale level-two signature');assert.equal(d.topicsSha256,topics.contentSha256,'Stale topic signature');
  assert.equal(release.hf14?.batchId,batchId);assert.equal(release.hf14?.levelTwoSha256,level.contentSha256);assert.equal(release.hf14?.topicsSha256,topics.contentSha256);
  const receipt=readJSON(d.evidence);assert.equal(receipt.approvalBasis,d.approvalBasis);assert.equal(receipt.levelTwoSha256,d.levelTwoSha256);assert.equal(receipt.topicsSha256,d.topicsSha256);assert.equal(receipt.humanListeningPerformed,false);
 }
 return {status:'PASS',...counts,topics:topics.groups.length,topicCharacters:topics.uniqueCharacters,topicBindings:topics.bindings,starterOverlap:topics.starterOverlap};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateHskExpansion(),null,2));
