import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {root,readJSON,fileHash,characterId,wordId,pinyinForms,validateStroke} from './data-foundation-lib.mjs';
import {validateMembership} from './validate-data-foundation.mjs';
import {buildHsk} from './build-hsk-data.mjs';
export function validateHsk({rebuild=false}={}){
 const lock=readJSON('data/sources.lock.json'),facts=readJSON('data/hsk/source-headwords.json'),members=readJSON('data/hsk/membership.json'),lex=readJSON('data/hsk/lexicon.json'),coverage=readJSON('data/hsk/coverage.json'),core=readJSON('data/normalized/characters.json'),scenario=readJSON('data/scenarios/scenarios.json');
 assert.equal(fileHash('data/hsk/source-headwords.json'),lock.hskPolicy.headwordsSha256,'Source facts lock mismatch');
 for(const [id,file] of [['hsk-2-2015','HSK-2015.xlsx'],['hsk-3-2025','hsk3.pdf']]){const source=lock.sources.find(s=>s.id===id);assert.equal(source.sha256,facts.rawHashes[file]);const cached=path.join(root,'.cache/hf07',file);if(fs.existsSync(cached))assert.equal(fileHash(cached),source.sha256);}
 const groups=[['hsk-2','vocabulary','1',facts.hsk2,150],['hsk-3','vocabulary','1',facts.hsk3.vocabulary,300],['hsk-3','recognition-character','1',facts.hsk3.recognition,246],['hsk-3','writing-character','1-2',facts.hsk3.writing,100]];
 for(const [system,type,level,rows,count] of groups){assert.equal(rows.length,count);assert.deepEqual(rows.map(r=>r.ordinal),Array.from({length:count},(_,i)=>i+1));const mapped=members.filter(m=>m.system===system&&m.itemType===type&&m.level===level);assert.equal(mapped.length,count);for(const [i,row] of rows.entries()){assert.equal(mapped[i].glyph,row.glyph);assert.equal(mapped[i].sourceLocator,row.sourceLocator);assert.equal(mapped[i].itemId,type==='vocabulary'?wordId(row.glyph):characterId(row.glyph));}}
 assert.deepEqual([facts.hsk2[0].glyph,facts.hsk2.at(-1).glyph],['爱','做']);assert.deepEqual([facts.hsk3.vocabulary[0].glyph,facts.hsk3.vocabulary.at(-1).glyph],['爱','做饭']);
 const seen=new Set();for(const m of members){validateMembership(m,lock.sources);const id=[m.system,m.level,m.itemType,m.itemId].join('|');assert.ok(!seen.has(id),'Duplicate membership');seen.add(id);}
 const derived=members.filter(m=>m.itemType==='derived-character');assert.deepEqual(new Set(derived.map(m=>m.glyph)),new Set(facts.hsk2.flatMap(r=>[...r.glyph])));assert.equal(derived.length,174);
 assert.ok(!members.some(m=>m.itemType==='writing-character'&&m.level==='1'));
 const all=[...core,...lex.characters],ids=new Set(all.map(c=>c.characterId));assert.equal(ids.size,all.length);assert.equal(all.length,coverage.unionCharacters);assert.equal(core.length,126);
 const readings=new Map(lex.readings.map(r=>[r.readingId,r]));assert.equal(readings.size,lex.readings.length);
 for(const r of readings.values()){assert.deepEqual(r.pinyin,pinyinForms(r.pinyin.numeric));assert.ok(r.senses.length);assert.ok(r.evidence.length);assert.ok(r.evidence.every(e=>e.sourceReleaseId==='cedict'&&/^cedict_ts.u8:line:\d+$/.test(e.sourceLocator)));}
 for(const c of lex.characters){assert.equal(c.characterId,characterId(c.glyph));assert.equal(c.reviewStatus,'draft');assert.equal(c.contentTier,null);assert.ok(c.readingId.every(id=>readings.get(id)?.itemId===c.characterId));assert.ok(c.readingId.includes(c.primaryReadingId));const stroke=lex.strokes.find(s=>s.characterId===c.characterId);assert.ok(stroke);assert.equal(fileHash(stroke.url),stroke.sha256);const value=readJSON(stroke.url);validateStroke(value);assert.equal(value.strokes.length,c.strokeCount);}
 for(const word of lex.words){assert.ok(word.characterIds.every(id=>ids.has(id)));assert.ok(word.readingIds.every(id=>readings.get(id)?.itemId===word.itemId));}
 for(const group of coverage.lists){const rows=members.filter(m=>m.system===group.system&&m.itemType===group.itemType&&m.level===group.level);assert.equal(group.sourceCount,rows.length);assert.equal(group.mappedCount,rows.length);const gs=new Set(rows.flatMap(r=>[...r.glyph]));assert.equal(group.uniqueCharacters,gs.size);assert.equal(group.coreOverlap,[...gs].filter(g=>core.some(c=>c.glyph===g)).length);assert.equal(group.tier2Accepted,0);assert.equal(group.indexableCharacterPages,0);}
 assert.deepEqual(coverage.missing,[]);assert.deepEqual(coverage.wordDictionaryGaps,['您好']);
 for(const s of scenario.scenarios){assert.ok(s.sentences.length>=3);for(const x of s.sentences){assert.equal(x.tokens.map(t=>t[0]).join(''),x.text.replace(/\p{P}/gu,''));for(const t of x.tokens){assert.equal(t.length,3);for(const g of t[0])assert.ok(ids.has(characterId(g)));}}}
 assert.equal(scenario.audio.playable,false);assert.ok(['pending','approved'].includes(scenario.review.humanAcceptance));
 if(scenario.review.humanAcceptance==='approved')for(const f of ['reviewer','date','evidence'])assert.ok(scenario.review[f]?.trim(),'Missing scenario signature '+f);
 if(rebuild){const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'hf07-rebuild-'));try{buildHsk(temporary);for(const file of ['membership.json','lexicon.json','coverage.json',...lex.strokes.map(s=>'strokes/'+s.characterId.slice(5)+'.json')])assert.deepEqual(fs.readFileSync(path.join(temporary,'data/hsk',file)),fs.readFileSync(path.join(root,'data/hsk',file)),'Stale or nondeterministic '+file);}finally{fs.rmSync(temporary,{recursive:true,force:true});}}
 return {status:'PASS',sourceRows:{hsk2Vocabulary:150,hsk3Vocabulary:300,recognition:246,writingCombined:100},core:126,additional:lex.characters.length,union:all.length,sourceMappingComplete:true,teachingAcceptance:'supplemental-drafts-pending',scenarioLanguageAcceptance:scenario.review.humanAcceptance,audioAcceptance:scenario.audio.reviewStatus,rebuild};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateHsk({rebuild:!process.argv.includes('--no-rebuild')}),null,2));
