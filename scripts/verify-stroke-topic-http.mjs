import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {topicPaths} from '../site/stroke-topic-meta.mjs';
import {topicCatalog,exampleCharacters} from '../site/stroke-topic-data.mjs';
const origin=process.env.HF_STROKE_HTTP_ORIGIN||'http://127.0.0.1:8794';
const output=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'/private/tmp/hanzifun-stroke-topic-candidate');
const checks=[];
const digest=b=>createHash('sha256').update(b).digest('hex');
for(const p of topicPaths){
 const r=await fetch(origin+p,{redirect:'manual'});assert.equal(r.status,200,p);const html=await r.text();assert.ok(html.includes('href="https://hanzifun.online'+p+'"'));assert.equal(digest(html),digest(fs.readFileSync(path.join(output,p,'index.html'))));checks.push({path:p,status:r.status,bytes:'match frozen candidate'});
 const q=p.slice(0,-1)+'?source=local-check',redirect=await fetch(origin+q,{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),p+'?source=local-check');checks.push({path:q,status:301,location:redirect.headers.get('location')});
}
for(const p of ['/stroke-order/unknown/','/stroke-order/永/','/dictionary/永/']){const r=await fetch(origin+encodeURI(p),{redirect:'manual'});assert.equal(r.status,404,p);checks.push({path:p,status:404});}
for(const file of ['practice-a4.pdf','practice-letter.pdf',...exampleCharacters.map(c=>'gif/'+c.codepoint+'.gif'),'animated/6c38.svg','single/horizontal.svg','static/6c38.svg','licenses/cnchar-MIT.txt']){
 const p='/site-assets/stroke-topic/'+file,r=await fetch(origin+p);assert.equal(r.status,200,p);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(digest(bytes),digest(fs.readFileSync(path.join(output,p))));if(file.endsWith('.pdf'))assert.match(r.headers.get('content-type'),/application\/pdf/);checks.push({path:p,status:200,contentType:r.headers.get('content-type'),sha256:digest(bytes)});
}
const sitemap=await (await fetch(origin+'/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.ok(urls.every(u=>!/[?#]/.test(u)));for(const p of topicPaths)assert.ok(urls.includes('https://hanzifun.online'+p));
const result={date:'2026-11-13',status:'PASS',surface:'Wrangler 4.156.0 local Cloudflare Assets, no deployment',origin,checks,count:checks.length,sourceCharacters:topicCatalog.characters.length};const evidence=path.resolve(process.env.HF_TOPIC_EVIDENCE_DIR||'docs/hanzifun-rebuild/evidence/stroke-topic-2026-11-13');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'http-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
