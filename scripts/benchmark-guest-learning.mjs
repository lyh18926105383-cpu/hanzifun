import {performance} from 'node:perf_hooks';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {createEvent,replay} from '../src/learning/events.mjs';
import {createRepository,emptyData,STORAGE_KEY} from '../src/learning/repository.mjs';
import {canonical} from '../src/learning/legacy-import.mjs';
const now=Date.UTC(2026,9,26),catalog=Array.from({length:1000},(_,i)=>({cardId:'benchmark:'+i,characterId:'char:'+String.fromCodePoint(0x4e00+i).codePointAt(0).toString(16),front:String.fromCodePoint(0x4e00+i),back:'Performance fixture'}));
const data=emptyData();let seq=0;
for(let n=0;n<1000;n++){
  const sessionId=randomUUID(),results=[],queue=[];
  for(let position=0;position<9;position++){
    const card=catalog[(n*9+position)%1000];queue.push({card,intent:'free',scheduleRevision:'0'});
    results.push(createEvent({type:'card-rated',sessionId,baseRevision:'benchmark-v1',mode:'learning',occurredAt:now,cardId:card.cardId,characterId:card.characterId,rating:'familiar',intent:'free',scheduleRevision:'0',position,dailyNew:10,timeZone:'UTC'}, {id:randomUUID(),deviceId:'benchmark',deviceSeq:seq++}));
  }
  const completion=createEvent({type:'session-completed',sessionId,baseRevision:'benchmark-v1',mode:'learning',occurredAt:now,rating:null},{id:randomUUID(),deviceId:'benchmark',deviceSeq:seq++});
  data.events.push(...results,completion);data.sessions[sessionId]={snapshotVersion:1,revision:18,schedulerVersion:'interval-v1',sessionId,baseRevision:'benchmark-v1',mode:'learning',timeZone:'UTC',dailyNew:10,createdAt:now,lastNow:now,queue,cursor:9,face:'front',results,status:'complete',completionEventId:completion.eventId};
}
let start=performance.now();data.projection=replay(data.events);const replayMs=performance.now()-start;
data.sequences.benchmark=seq;const raw=canonical(data),map=new Map([[STORAGE_KEY,raw]]);
const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),get length(){return map.size;},key:i=>[...map.keys()][i]};
start=performance.now();const repo=createRepository({storage,catalog,clock:()=>now});const coldLoadMs=performance.now()-start;
start=performance.now();const dashboard=repo.getDashboard();const dashboardMs=performance.now()-start;
assert.equal(dashboard.practicedCharacters,1000);assert.equal(dashboard.completedSessions,1000);assert.equal(repo.getStatus().error,'');
start=performance.now();const backup=await repo.previewBackup(repo.exportJSON());const roundTripMs=performance.now()-start;assert.equal(backup.data.events.length,10000);
const receipt={date:'2026-10-26',node:process.version,cards:1000,events:10000,sessions:1000,bytes:Buffer.byteLength(raw),replayMs,coldLoadMs,dashboardMs,roundTripMs,
  scope:'Synthetic catalog and in-memory Storage measure CPU/recovery semantics. This snapshot exceeds typical localStorage capacity; actual quota failures are tested separately in Chrome. No claim of durable 10000-event capacity.'};
const output=process.env.HF06_BENCHMARK_OUTPUT||'/private/tmp/hf06-performance.json';await fs.writeFile(output,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
