// Deterministic, offline generation from bounded HSK facts and hash-locked HF02 archives.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
import {root,readJSON,sha256,fileHash,parseCedict,characterId,wordId,pinyinForms,normalizePinyin,validateStroke} from './data-foundation-lib.mjs';
const compact=(file,value,out)=>{const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(value)+'\n');};
export function buildHsk(out=root) {
 const lock=readJSON('data/sources.lock.json'), facts=readJSON('data/hsk/source-headwords.json'), scenarios=readJSON('data/scenarios/scenarios.json');
 if(fileHash('data/hsk/source-headwords.json')!==lock.hskPolicy.headwordsSha256)throw Error('HSK extraction changed; review and update lock explicitly');
 const checked=id=>{const s=lock.sources.find(s=>s.id===id),file=path.join(root,'.cache/hf02',s.file);if(fileHash(file)!==s.sha256)throw Error('Source hash mismatch: '+id);return file;};
 const entries=parseCedict(gunzipSync(fs.readFileSync(checked('cedict'))).toString());
 const index=new Map();for(const row of entries){const list=index.get(row.simplified)||[];list.push(row);index.set(row.simplified,list);}
 const core=readJSON('data/normalized/characters.json'); const coreIds=new Set(core.map(c=>c.characterId));
 const members=[];
 const add=(system,rows,itemType,level='1')=>{for(const row of rows)members.push({system,edition:system==='hsk-2'?'2015-vocabulary':'2025-11-syllabus-effective-2026-07',sourceReleaseId:system==='hsk-2'?'hsk-2-2015':'hsk-3-2025',level,itemType,membershipKind:({'vocabulary':'official-vocabulary','derived-character':'derived-from-vocabulary','recognition-character':'official-recognition','writing-character':'official-writing'})[itemType],itemId:itemType==='vocabulary'?wordId(row.glyph):characterId(row.glyph),firstIntroducedLevel:level,cumulative:false,sourceLocator:row.sourceLocator,rightsStatus:'approved-with-scope',decisionBasis:'user-confirmed-scope',usageScope:'headword-edition-level-membership-only',...row});};
 add('hsk-2',facts.hsk2,'vocabulary');add('hsk-3',facts.hsk3.vocabulary,'vocabulary');add('hsk-3',facts.hsk3.recognition,'recognition-character');add('hsk-3',facts.hsk3.writing,'writing-character','1-2');
 // At level 1 new and cumulative sets coincide. Derived characters retain every word witness.
 const oldDerived=new Map();for(const w of facts.hsk2)for(const g of w.glyph){if(!oldDerived.has(g))oldDerived.set(g,[]);oldDerived.get(g).push(w.sourceLocator);}
 add('hsk-2',[...oldDerived].map(([glyph,witnesses],i)=>({glyph,ordinal:i+1,sourceLocator:witnesses.join(';')})),'derived-character');
 const glyphs=[...new Set([...members.flatMap(m=>[...m.glyph]),...scenarios.scenarios.flatMap(s=>s.sentences.flatMap(x=>x.tokens.flatMap(t=>[...t[0]])))])].sort((a,b)=>a.codePointAt(0)-b.codePointAt(0));
 const wanted=new Set(glyphs), rawUnihan=checked('unihan'),unihan={};
 for(const file of ['Unihan_Variants.txt','Unihan_IRGSources.txt','Unihan_OtherMappings.txt']){
  const text=execFileSync('unzip',['-p',rawUnihan,file],{encoding:'utf8',maxBuffer:32*1024*1024});
  for(const [i,line] of text.split('\n').entries()){const [cp,field,value]=line.split('\t');if(!cp?.startsWith('U+'))continue;const g=String.fromCodePoint(parseInt(cp.slice(2),16));if(wanted.has(g)&&['kTraditionalVariant','kSimplifiedVariant','kTotalStrokes','kRSUnicode','kJoyoKanji'].includes(field))(unihan[g]||={})[field]={value,sourceLocator:`${file}:line:${i+1}:${cp}:${field}`};}
 }
 const comp=new Map(fs.readFileSync(checked('mmh-dictionary'),'utf8').trim().split('\n').map((l,i)=>{const r=JSON.parse(l);return [r.character,{radical:r.radical,ids:r.decomposition,sourceLocator:'dictionary.txt:line:'+(i+1)}];}));
 const archive=checked('hanzi-writer-data'), extra=path.join(root,'.cache/hf07/graphics');fs.mkdirSync(extra,{recursive:true});
 execFileSync('tar',['-xzf',archive,'-C',extra]);
 const normalizedReadings=[],characters=[],strokes=[],words=[],missing=[];
 const readingsFor=(id,glyph)=>{
  const groups=new Map();for(const row of index.get(glyph)||[]){const key=normalizePinyin(row.pinyin);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
  return [...groups].map(([numeric,rows])=>{const r={readingId:`reading:${id}:${numeric.replaceAll(' ','-').replaceAll('ü','v')}`,itemId:id,pinyin:pinyinForms(numeric),senses:[...new Set(rows.flatMap(r=>r.senses))],traditionalForms:[...new Set(rows.map(r=>r.traditional))],evidence:rows.map(r=>({sourceReleaseId:'cedict',sourceLocator:r.sourceLocator})),reviewStatus:'draft'};normalizedReadings.push(r);return r;});
 };
 for(const glyph of glyphs){if(coreIds.has(characterId(glyph)))continue;
  const id=characterId(glyph),rs=readingsFor(id,glyph),rawPath=path.join(extra,'package',glyph+'.json');
  if(!rs.length||!fs.existsSync(rawPath)){missing.push({glyph,reason:!rs.length?'dictionary-missing':'strokes-missing'});continue;}
  const primary=rs.find(r=>r.senses.some(s=>!/^(surname|variant of|old |see |used in |Taiwan pr)/i.test(s)))||rs[0];
  const raw=fs.readFileSync(rawPath),data=JSON.parse(raw);validateStroke(data);
  const url=`data/hsk/strokes/${id.slice(5)}.json`;const target=path.join(out,url);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,raw);
  const shape=comp.get(glyph),ids=shape?.ids||'?';
  const c={characterId:id,glyph,readingId:rs.map(r=>r.readingId),primaryReadingId:primary.readingId,definition:primary.senses.join('; '),radical:shape?.radical||'unverified',structure:({'⿰':'left-right','⿱':'top-bottom','⿴':'full-enclosure','⿵':'upper-enclosure','⿸':'upper-left-enclosure','⿺':'lower-left-enclosure'})[ids[0]]||'other / unverified',components:{ids,completeness:/[?？]/.test(ids)?'incomplete':'complete',evidence:{sourceReleaseId:'mmh-dictionary',sourceLocator:shape?.sourceLocator||'not-found'}},strokeCount:data.strokes.length,locale:'zh-Hans-CN',scriptRelations:(index.get(glyph)||[]).map(r=>({traditional:r.traditional,senses:r.senses,readingId:rs.find(x=>x.pinyin.numeric===normalizePinyin(r.pinyin)).readingId})),unihan:unihan[glyph]||{},sourceReferences:['cedict','unihan','mmh-dictionary','hanzi-writer-data'],reviewStatus:'draft',publicationStatus:'draft',contentTier:null};characters.push(c);
  strokes.push({characterId:id,glyph,url,sha256:sha256(raw),strokeCount:data.strokes.length,sourceReleaseId:'hanzi-writer-data',sourceLocator:'package/'+glyph+'.json',licenseId:'Arphic-Public-License'});
 }
 const wordGlyphs=[...new Set([...members.filter(m=>m.itemType==='vocabulary').map(m=>m.glyph),...scenarios.scenarios.flatMap(s=>s.sentences.flatMap(x=>x.tokens.map(t=>t[0])))])];
 for(const glyph of wordGlyphs){const rs=readingsFor(wordId(glyph),glyph);words.push({itemId:wordId(glyph),glyph,readingIds:rs.map(r=>r.readingId),characterIds:[...new Set([...glyph].map(characterId))],reviewStatus:'draft',status:rs.length?'dictionary-attested':'dictionary-missing'});}
 const groups=[['hsk-2','vocabulary','1'],['hsk-2','derived-character','1'],['hsk-3','vocabulary','1'],['hsk-3','recognition-character','1'],['hsk-3','writing-character','1-2']];
 const coverage=groups.map(([system,itemType,level])=>{const list=members.filter(m=>m.system===system&&m.itemType===itemType&&m.level===level);const gs=new Set(list.flatMap(m=>[...m.glyph]));return {system,itemType,level,sourceCount:list.length,mappedCount:list.length,uniqueItems:new Set(list.map(m=>m.itemId)).size,uniqueCharacters:gs.size,coreOverlap:[...gs].filter(g=>coreIds.has(characterId(g))).length,dictionaryAttested:itemType==='vocabulary'?list.filter(m=>words.find(w=>w.itemId===m.itemId)?.readingIds.length).length:list.filter(m=>coreIds.has(m.itemId)||characters.some(c=>c.characterId===m.itemId)).length,tier2Accepted:0,tier1Accepted:0,indexableCharacterPages:0};});
 compact('data/hsk/membership.json',members,out);compact('data/hsk/lexicon.json',{characters,readings:normalizedReadings,strokes,words},out);
 compact('data/hsk/coverage.json',{version:'hf07-v1',lists:coverage,coreCount:126,additionalCharacters:characters.length,unionCharacters:126+characters.length,missing,wordDictionaryGaps:words.filter(w=>!w.readingIds.length).map(w=>w.glyph),humanReviewedCharacters:0,scenarioAudioApproved:0,writingScope:'HSK 3.0 levels 1–2 combined; no standalone level-1 list exists in the locked PDF',reviewStatus:'human-pending'},out);
 return {members,characters,coverage};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const result=buildHsk(process.env.HF_HSK_OUTPUT_DIR||root);console.log(JSON.stringify({lists:result.coverage,additionalCharacters:result.characters.length}));}
