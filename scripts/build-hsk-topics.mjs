import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {root,readJSON,sha256} from './data-foundation-lib.mjs';
import {characterReviewState,reviewInputs} from '../site/publication-review.mjs';
export function buildTopics(){
 const selection=readJSON('data/editorial/hsk-topic-selection.json'),level=readJSON('data/hsk/level-2-core.json'),audio=readJSON('data/audio/pronunciation.json');
 const all=[...reviewInputs.core,...reviewInputs.supplemental.characters],readings=[...reviewInputs.coreReadings,...reviewInputs.supplemental.readings];
 const groups=selection.groups.map(group=>({id:group.id,title:group.title,entries:group.glyphs.map(glyph=>{
  const c=all.find(c=>c.glyph===glyph);if(!c)throw Error('Unknown topic character: '+glyph);
  const state=characterReviewState(c.characterId);if(!state.accepted)throw Error('Unaccepted topic character: '+glyph);
  const r=readings.find(r=>r.readingId===state.teaching.readingId),key=r.pinyin.numeric.replaceAll('ü','v'),record=audio.syllables[key];
  if(!record)throw Error('Unmapped topic pronunciation: '+glyph);
  return {characterId:c.characterId,glyph,readingId:r.readingId,pinyin:r.pinyin,meaning:state.teaching.meaning,path:state.path,characterReviewSha256:state.contentSha256,evidence:r.evidence,pronunciation:{key,kind:record.kind,url:record.url||null,text:record.text||glyph,sourceLocator:record.sourceLocator||record.sourcePath||record.url,sourceBlob:record.sourceBlob||null},wordIds:level.entries.filter(w=>w.characterIds.includes(c.characterId)).map(w=>w.itemId)};
 })}));
 const ids=[...new Set(groups.flatMap(g=>g.entries.map(e=>e.characterId)))];
 const crossIndex=Object.fromEntries(ids.map(id=>[id,{topicIds:groups.filter(g=>g.entries.some(e=>e.characterId===id)).map(g=>g.id),wordIds:level.entries.filter(w=>w.characterIds.includes(id)).map(w=>w.itemId)}]));
 const payload={version:'hf14-hsk-topics-v1',date:selection.date,selectionBasis:selection.selectionBasis,sourceLevelTwoSha256:level.contentSha256,audioManifestSha256:sha256(fs.readFileSync(root+'/data/audio/pronunciation.json')),groups,crossIndex,uniqueCharacters:ids.length,bindings:groups.reduce((n,g)=>n+g.entries.length,0),starterOverlap:readJSON('data/editorial/starter-100.json').groups.flatMap(g=>g.characterIds).filter(id=>ids.includes(id)).length};
 return {...payload,contentSha256:sha256(JSON.stringify(payload))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const value=buildTopics(),file=root+'/data/hsk/topics.json';if(process.argv.includes('--check')){if(JSON.stringify(readJSON('data/hsk/topics.json'))!==JSON.stringify(value))throw Error('HSK topics are stale');}else fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');console.log(JSON.stringify({topics:value.groups.length,characters:value.uniqueCharacters,bindings:value.bindings,starterOverlap:value.starterOverlap,sha256:value.contentSha256}));}
