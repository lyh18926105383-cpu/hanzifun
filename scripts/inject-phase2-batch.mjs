// Editorial injection only. Publication remains a separate hash-bound release operation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
import {reviewInputs, characterReviewState, contentHash} from '../site/publication-review.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const schema = read('data/schemas/hsk-teaching-entry.schema.json');
const validate = new Ajv({allErrors:true}).compile(schema);
const columns = ['glyph','meaning','word','wordPinyin','wordMeaning','sentence','pinyin','translation','mnemonic'];
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value||'') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
export function parsePSV(text) {
  const rows = text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(line=>line.trim()).map((line,i)=>{
    const values=line.split('|').map(s=>s.trim());
    if(values.length!==9 || values.some(s=>!s || /<[^>]+>|\b(?:TODO|TBD|PLACEHOLDER)\b/i.test(s)))throw Error('Invalid PSV fields at line '+(i+1));
    if([...values[0]].length!==1)throw Error('Expected one character at line '+(i+1));
    return Object.fromEntries(columns.map((key,j)=>[key,values[j]]));
  });
  if(new Set(rows.map(r=>r.glyph)).size!==rows.length)throw Error('Duplicate character');
  return rows;
}
export function mergeStructureNotes(metadata,source) {
  if(!source)return metadata;
  if(!source.reviewer?.trim()||!validDate(source.date)||!source.notes||typeof source.notes!=='object'||Array.isArray(source.notes))throw Error('Structure-notes file requires reviewer, valid date and notes mapping');
  const existing=metadata.structureNotes||{};
  for(const [glyph,note] of Object.entries(source.notes))if(existing[glyph]&&JSON.stringify(existing[glyph])!==JSON.stringify(note))throw Error('Conflicting structure note: '+glyph);
  return {...metadata,structureNotes:{...existing,...source.notes},structureReviewer:source.reviewer,structureReviewDate:source.date};
}
export function mergeReadingSelections(metadata,source) {
  if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Reading-selections file must be a glyph-to-reading map');
  const existing=metadata.readingSelections||{};
  for(const [glyph,reading] of Object.entries(source))if(existing[glyph]&&existing[glyph]!==reading)throw Error('Conflicting reading selection: '+glyph);
  return {...metadata,readingSelections:{...existing,...source}};
}
export function planInjection({text,metadata,batches=read('docs/hanzifun-rebuild/hf10-batches.json'),inventory=read('docs/hanzifun-rebuild/hf10-inventory.json'),inputs=reviewInputs,policy=resolveRoutePolicy}) {
  const batch=batches.batches.find(b=>b.batchId===metadata.batchId);
  if(!batch)throw Error('Unknown batch');
  if(!metadata.reviewer?.trim() || !validDate(metadata.reviewDate))throw Error('Real reviewer and valid reviewDate required');
  if(!['approved','pending'].includes(metadata.humanAcceptance) || !metadata.evidence?.trim())throw Error('Explicit review declaration and evidence required');
  const rows=parsePSV(text);
  if(rows.length!==batch.count || batch.glyphs.some(g=>!rows.some(r=>r.glyph===g)))throw Error('Batch must contain exactly its frozen character set');
  const batchGlyphs=new Set(batch.glyphs);
  for(const glyph of Object.keys(metadata.structureNotes||{}))if(!batchGlyphs.has(glyph))throw Error('Structure note is outside frozen batch: '+glyph);
  for(const glyph of Object.keys(metadata.readingSelections||{}))if(!batchGlyphs.has(glyph))throw Error('Reading selection is outside frozen batch: '+glyph);
  if(!metadata.structureReviewer?.trim()||!validDate(metadata.structureReviewDate))throw Error('Structure reviewer and valid structureReviewDate required');
  const entries=rows.map(({glyph,...content})=>{
    const c=inputs.supplemental.characters.find(c=>c.glyph===glyph),historic=inventory.characters.find(c=>c.glyph===glyph);
    if(!c || historic?.characterId!==c.characterId || !batch.characterIds.includes(c.characterId))throw Error('Character identity/scope mismatch: '+glyph);
    const candidates=c.readingId.map(id=>inputs.supplemental.readings.find(r=>r.readingId===id));
    const numeric=metadata.readingSelections?.[glyph];
    if(candidates.length>1&&!numeric)throw Error('Explicit contextual reading selection required: '+glyph);
    const r=numeric?candidates.find(r=>r.pinyin.numeric===numeric):candidates[0];
    if(!r)throw Error('Unknown teaching reading: '+glyph+' '+numeric);
    const stroke=inputs.supplemental.strokes.find(s=>s.characterId===c.characterId);
    if(!stroke)throw Error('Missing stroke source: '+glyph);
    const note=metadata.structureNotes?.[glyph];
    if((c.components.completeness!=='complete'||c.structure==='other / unverified')&&!note)throw Error('Explicit visible structure review required: '+glyph);
    const entry={characterId:c.characterId,readingId:r.readingId,...content,
      reviewer:metadata.reviewer,reviewDate:metadata.reviewDate,generationBatch:batch.batchId,
      kind:'mnemonic',targetTier:'Tier2',reviewStatus:metadata.humanAcceptance==='approved'?'human-reviewed':'ai-quick-reviewed',humanAcceptance:metadata.humanAcceptance,
      structureReview:{status:'reviewed',layout:note?.layout||c.structure,
        description:note?.description||('Visible layout: '+c.components.ids+'. This describes graphic arrangement, not historical origin.'),
        reviewer:metadata.structureReviewer,date:metadata.structureReviewDate,sourceSha256:contentHash({components:c.components,strokeSha256:stroke.sha256})}};
    if(!validate(entry))throw Error(glyph+': '+JSON.stringify(validate.errors));
    if(!entry.word.includes(glyph)||!entry.sentence.includes(glyph))throw Error('Word/sentence must include character: '+glyph);
    const previous=inputs.supplementalTeaching.entries.find(e=>e.characterId===c.characterId);
    if(policy('/dictionary/'+glyph+'/').status==='published' && JSON.stringify(previous)!==JSON.stringify(entry))throw Error('Refusing to overwrite published teaching: '+glyph);
    return entry;
  });
  const teaching=structuredClone(inputs.supplementalTeaching);
  for(const entry of entries){const i=teaching.entries.findIndex(e=>e.characterId===entry.characterId);if(i<0)teaching.entries.push(entry);else teaching.entries[i]=entry;}
  const candidate={...inputs,supplementalTeaching:teaching};
  for(const entry of entries){const state=characterReviewState(entry.characterId,candidate);if(!state.contentComplete)throw Error(state.glyph+': '+state.issues.join('; '));}
  const decisions=entries.map(e=>({characterId:e.characterId,contentSha256:characterReviewState(e.characterId,candidate).contentSha256,humanContent:metadata.humanAcceptance==='approved'?'approved':'pending',reviewer:metadata.humanAcceptance==='approved'?metadata.reviewer:'',date:metadata.humanAcceptance==='approved'?metadata.reviewDate:'',evidence:metadata.evidence}));
  return {batchId:batch.batchId,entries,teaching,decisions,changed:JSON.stringify(teaching)!==JSON.stringify(inputs.supplementalTeaching)};
}
export function atomicWrite(target,text,expected,io=fs) {
  if(io.readFileSync(target,'utf8')!==expected)throw Error('Editorial source changed during injection');
  const temp=target+'.hf10-'+process.pid+'.tmp';
  try{io.writeFileSync(temp,text,{flag:'wx'});if(io.readFileSync(target,'utf8')!==expected)throw Error('Editorial source changed during injection');io.renameSync(temp,target);}
  finally{if(io.existsSync(temp))io.unlinkSync(temp);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const arg=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
    if(!arg('input')||!arg('metadata'))throw Error('Usage: node scripts/inject-phase2-batch.mjs --input=batch.psv --metadata=review.json [--reading-selections=readings.json] [--structure-notes=structures.json] [--apply] [--decisions=output.json]');
    const target=path.join(root,'data/editorial/hsk-characters.json'),before=fs.readFileSync(target,'utf8');
    let metadata=JSON.parse(fs.readFileSync(arg('metadata'),'utf8'));
    if(arg('reading-selections'))metadata=mergeReadingSelections(metadata,JSON.parse(fs.readFileSync(arg('reading-selections'),'utf8')));
    if(arg('structure-notes'))metadata=mergeStructureNotes(metadata,JSON.parse(fs.readFileSync(arg('structure-notes'),'utf8')));
    const plan=planInjection({text:fs.readFileSync(arg('input'),'utf8'),metadata});
    if(process.argv.includes('--apply')&&plan.changed){
      fs.mkdirSync(path.join(root,'.cache/hf10'),{recursive:true});
      fs.writeFileSync(path.join(root,'.cache/hf10/teaching-'+contentHash(before)+'.json'),before,{flag:'w'});
      atomicWrite(target,JSON.stringify(plan.teaching,null,2)+'\n',before);
    }
    // Export only with apply: a dry run cannot leave an apparently signed approval file.
    if(arg('decisions')){
      if(!process.argv.includes('--apply'))throw Error('--decisions requires --apply; dry run writes no files');
      fs.writeFileSync(arg('decisions'),JSON.stringify({batchId:plan.batchId,decisions:plan.decisions},null,2)+'\n');
    }
    console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',batchId:plan.batchId,count:plan.entries.length,changed:plan.changed,readings:plan.entries.map(e=>({characterId:e.characterId,readingId:e.readingId})),publication:'separate review-release-batch step'},null,2));
  }catch(e){console.error(e.message);process.exitCode=1;}
}
