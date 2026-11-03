import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const digest=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
export const presentationFiles=['site/character-flow.mjs','site/components/stroke-order.mjs','site/character-meaning.mjs','data/editorial/character-meaning-explanations.json','site/character-presentation-review.mjs','site/pages/dictionary.mjs','site/pages/hsk.mjs','site/editorial-content.mjs','src/client/dictionary.mjs','site/public/site-styles.css','scripts/build-site.js'];
export function characterPresentationPayload(){return {batchId:'character-flow-2026-11-02',inputs:presentationFiles.map(file=>({file,sha256:digest(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'))}))};}
export function assertCharacterPresentation({decision=read('data/editorial/review-decisions.json').characterPagePresentation,payload=characterPresentationPayload()}={}){
 if(decision?.status!=='approved'||!decision.reviewer?.trim()||decision.date!=='2026-11-02'||!decision.authorization?.trim()||decision.contentSha256!==digest(payload))throw Error('Character page presentation approval missing or stale');
 return {batchId:payload.batchId,contentSha256:decision.contentSha256};
}
