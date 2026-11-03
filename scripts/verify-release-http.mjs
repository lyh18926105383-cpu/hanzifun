import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const origin=process.env.HF_VERIFY_ORIGIN||'http://127.0.0.1:8766',build=path.resolve(process.env.HF_VERIFY_BUILD||'dist'),output=process.env.HF_VERIFY_OUTPUT;
const manifest=JSON.parse(fs.readFileSync(path.join(build,'route-manifest.json'),'utf8'));
const prior=JSON.parse(fs.readFileSync('docs/hanzifun-rebuild/releases/seo-navigation-release-2026-11-02/online-verification.json','utf8'));
const chars=manifest.routes.filter(r=>/^\/dictionary\/\p{Script=Han}\/$/u.test(r.path));
const paths=[...new Set([...prior.checks.map(x=>x.path),...chars.map(r=>r.path),...(fs.existsSync(path.join(build,'site-assets/character-glyph'))?['/site-assets/character-glyph/4f11.svg','/site-assets/character-glyph/6728.svg','/site-assets/character-glyph/6c34.svg']:[])])];
const sum=b=>createHash('sha256').update(b).digest('hex');
const report={checkedAt:new Date().toISOString(),origin,artifact:build,checks:[],errors:[]};
let index=0;await Promise.all(Array.from({length:8},async()=>{while(index<paths.length){const route=paths[index++],row={path:route,errors:[]};try{
 const u=new URL(route,origin),res=await fetch(u,{redirect:'manual',signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await res.arrayBuffer());row.status=res.status;row.bytes=bytes.length;row.sha256=sum(bytes);
 const redirects={'/index.html':'/zh/','/kids/worksheets/':'/worksheets/','/legacy/story.html':'/story'};
 if(redirects[u.pathname]){row.location=res.headers.get('location');const target=new URL(row.location,origin);if(res.status!==301||target.pathname!==redirects[u.pathname]||target.search!==u.search)row.errors.push('Redirect/status/query mismatch');}
 else{const missing=u.pathname.startsWith('/hf-release-not-a-real-page'),file=missing?path.join(build,'404.html'):path.join(build,decodeURIComponent(u.pathname).slice(1)+(u.pathname.endsWith('/')?'index.html':'')),expected=fs.readFileSync(file);
  if(res.status!==(missing?404:200))row.errors.push('Unexpected HTTP status');
  row.matchesArtifact=u.pathname==='/robots.txt'?bytes.toString().includes(expected.toString().trim()):bytes.equals(expected);if(!row.matchesArtifact)row.errors.push('Response differs from frozen artifact');
 }
}catch(e){row.errors.push(e.message);}report.checks.push(row);if(row.errors.length)report.errors.push({path:route,errors:row.errors});}}));
const audio='/audio/tts-v1/052-9e45.mp3';try{const res=await fetch(new URL(audio,origin),{headers:{Range:'bytes=0-127'},signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await res.arrayBuffer()),full=fs.readFileSync(path.join(build,audio)),expected=full.subarray(0,128),row={path:audio,range:'bytes=0-127',status:res.status,contentRange:res.headers.get('content-range'),bytes:bytes.length,matchesArtifact:res.status===206?bytes.equals(expected):bytes.equals(full),responseMode:res.status===206?'partial-range':'complete-response-fallback',errors:[]};if(!(res.status===206&&/^bytes 0-127\//.test(row.contentRange||'')&&bytes.equals(expected)||res.status===200&&bytes.equals(full)))row.errors.push('Invalid partial or complete audio response');report.checks.push(row);if(row.errors.length)report.errors.push(row);}catch(e){report.errors.push({path:audio,errors:[e.message]});}
report.checks.sort((a,b)=>a.path.localeCompare(b.path));report.characterPages=chars.length;report.totalChecks=report.checks.length;report.status=report.errors.length?'FAIL':'PASS';
if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,origin,checks:report.totalChecks,characterPages:chars.length,errors:report.errors},null,2));if(report.errors.length)process.exitCode=1;
