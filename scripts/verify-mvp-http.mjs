// Offline local Workers Assets verification: no deploy command, API token or remote operation.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),cache=path.join(root,'.cache/hf09'),output=path.join(root,'docs/hanzifun-rebuild/evidence/hf09/workers-http.json');
const npx=path.join(process.env.HOME,'.npm/_npx');
const installed=fs.existsSync(npx)?fs.readdirSync(npx).map(id=>path.join(npx,id,'node_modules/wrangler')).filter(p=>fs.existsSync(path.join(p,'package.json'))).map(p=>({p,version:JSON.parse(fs.readFileSync(path.join(p,'package.json'),'utf8')).version})).sort((a,b)=>b.version.localeCompare(a.version,undefined,{numeric:true})):[];
const cli=process.env.HF09_WRANGLER_CLI||installed[0]?.p&&path.join(installed[0].p,'bin/wrangler.js');if(!cli)throw Error('Install local Wrangler or set HF09_WRANGLER_CLI; this script never downloads a runtime');
const report={date:new Date().toISOString(),runtime:installed[0]?.version||'explicit CLI',mode:'local dev only',responses:[],errors:[]};
for(const environment of ['production','staging']){
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 const config=path.join(cache,'workers-'+environment+'.json');fs.writeFileSync(config,JSON.stringify({name:'hanzifun-hf09-local',compatibility_date:'2026-07-15',assets:{directory:path.join(cache,environment),not_found_handling:'404-page'}}));
 const log=fs.openSync(path.join(cache,'workers-'+environment+'.log'),'w');
 const worker=spawn('node',[cli,'dev','--local','--config',config,'--port',String(port),'--ip','127.0.0.1','--persist-to',path.join(cache,'workers-state'),'--log-level','error'],{cwd:root,env:{...process.env,WRANGLER_LOG_PATH:path.join(cache,'workers-debug.log'),WRANGLER_SEND_METRICS:'false'},stdio:['ignore',log,log]});
 const origin='http://127.0.0.1:'+port;
 try{
  let ready=false;for(let i=0;i<150;i++){if(worker.exitCode!==null)throw Error('Wrangler exited '+worker.exitCode);try{const r=await fetch(origin,{signal:AbortSignal.timeout(1000)});if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(ready,'Workers startup timed out');
  for(const [route,status] of [['/',200],['/academic/hsk-2/',200],['/zh/',200],['/story.html?lesson=cat-and-fish-01',307],['/index.html',301],['/legacy/index.html',301],['/legacy/story.html?lesson=cat-and-fish-01',301],['/missing-hf09/',404],['/dictionary/不存在/',404]]){
   const r=await fetch(origin+encodeURI(route),{redirect:'manual'}),location=r.headers.get('location'),robots=r.headers.get('x-robots-tag');assert.equal(r.status,status,environment+' '+route);
   if(route.includes('lesson='))assert.ok(location?.includes('lesson=cat-and-fish-01'),'Lost lesson query');
   if(environment==='staging')assert.match(robots,/noindex/);
   report.responses.push({environment,route,status:r.status,location,xRobotsTag:robots});
   if(location){const final=await fetch(new URL(location,origin));assert.equal(final.status,200);}
  }
 }catch(e){report.errors.push(environment+': '+e.stack);}
 finally{worker.kill('SIGTERM');await Promise.race([new Promise(r=>worker.once('exit',r)),new Promise(r=>setTimeout(r,3000))]);if(worker.exitCode===null)worker.kill('SIGKILL');fs.closeSync(log);}
}
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({responses:report.responses.length,errors:report.errors},null,2));if(report.errors.length)process.exitCode=1;
