import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reviewInputs,characterReviewState} from '../site/publication-review.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';
export function prepareBatch(name,inputs=reviewInputs){
 const m=/^(core|hsk)-(\d{2})$/.exec(name);if(!m)throw Error('Batch name must be core-01..06 or hsk-01..11');
 const rows=m[1]==='core'?inputs.core:inputs.supplemental.characters,start=(Number(m[2])-1)*21;
 if(start<0||start>=rows.length)throw Error('Unknown batch');
 return {batchId:name,decisions:rows.slice(start,start+21).map(c=>({characterId:c.characterId,contentSha256:characterReviewState(c.characterId,inputs).contentSha256,humanContent:'pending',reviewer:'',date:'',evidence:''}))};
}
export function planBatch(batch,inputs=reviewInputs){
 if(!/^[a-z0-9][a-z0-9-]+$/.test(batch.batchId||'')||!Array.isArray(batch.decisions)||!batch.decisions.length)throw Error('batchId and explicit decisions required');
 const seen=new Set();
 return batch.decisions.map(d=>{
  if(Object.keys(d).some(k=>!['characterId','humanContent','reviewer','date','evidence','contentSha256'].includes(k)))throw Error('Unexpected decision field; character content approval only');
  if(seen.has(d.characterId))throw Error('Duplicate character: '+d.characterId);seen.add(d.characterId);
  const state=characterReviewState(d.characterId,inputs);
  if(!state.contentComplete)throw Error(state.path+': '+state.issues.join('; '));
  if(d.contentSha256!==state.contentSha256)throw Error('Stale content hash: '+d.characterId);
  const candidate=structuredClone(inputs);candidate.reviews.characters[d.characterId]={...candidate.reviews.characters[d.characterId],...d};
  if(!characterReviewState(d.characterId,candidate).accepted)throw Error('Real human approval, reviewer, date and evidence required: '+d.characterId);
  return {characterId:d.characterId,path:state.path,from:resolveRoutePolicy(state.path).status,to:'published',contentSha256:state.contentSha256,decision:d};
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const prepare=process.argv.find(a=>a.startsWith('--prepare='))?.slice(10);if(prepare){if(process.argv.includes('--apply'))throw Error('Cannot apply a pending prepared batch');console.log(JSON.stringify(prepareBatch(prepare),null,2));process.exit(0);}
  const file=process.argv.find(a=>a.startsWith('--batch='))?.slice(8);
  if(!file)throw Error('Usage: node scripts/review-release-batch.mjs --batch=review.json [--apply]. Default: dry run. Character content approvals only; no audio approval.');
  const batch=JSON.parse(fs.readFileSync(file,'utf8')),plan=planBatch(batch);
  console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',batchId:batch.batchId,changes:plan.map(({decision,...p})=>p)},null,2));
  if(process.argv.includes('--apply')){
   const reviewPath=new URL('../data/editorial/review-decisions.json',import.meta.url),releasePath=new URL('../site/release.json',import.meta.url),oldReview=fs.readFileSync(reviewPath,'utf8'),oldRelease=fs.readFileSync(releasePath,'utf8'),review=JSON.parse(oldReview),release=JSON.parse(oldRelease);
   for(const p of plan){review.characters[p.characterId]={...review.characters[p.characterId],...p.decision,batchId:batch.batchId};release.routes[p.path]='published';}
   try{fs.writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');fs.writeFileSync(releasePath,JSON.stringify(release,null,2)+'\n');}catch(e){fs.writeFileSync(reviewPath,oldReview);fs.writeFileSync(releasePath,oldRelease);throw e;}
  }
 }catch(e){console.error(e.message);process.exitCode=1;}
}
