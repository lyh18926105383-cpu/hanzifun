import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {toolsPayload,toolsBatchId,assertToolsAcceptance,teacherPath} from '../site/tools-integration.mjs';
import {releaseConfig,resolveRoutePolicy} from '../site/routes.mjs';
import {readJson} from '../site/dictionary-data.mjs';
import {parse} from 'parse5';
import {nodes,attr,validateBuild} from '../scripts/validate-seo-quality.mjs';
test('culture and private teacher publication reject missing, stale or mismatched owner signatures',()=>{
 const baseline={payload:toolsPayload(),reviews:readJson('data/editorial/review-decisions.json'),release:structuredClone(releaseConfig)};
 for(const route of ['/tools/',teacherPath]){
  assert.doesNotThrow(()=>assertToolsAcceptance({path:route,...resolveRoutePolicy(route)},baseline));
  for(const mutate of [v=>delete v.reviews.toolBatches,v=>v.reviews.toolBatches[toolsBatchId].humanContent='pending',v=>v.payload.catalog[0].meaning='Changed teaching content',v=>v.release.cultureTeacher.contentSha256='0'.repeat(64),v=>delete v.release.pageReviews[route]]){const value=structuredClone(baseline);mutate(value);assert.throws(()=>assertToolsAcceptance({path:route,...resolveRoutePolicy(route)},value),/acceptance|signature/);}
 }
});
test('production distributes runnable cultural/teacher assets, indexes five public routes and excludes personal teacher data',()=>{
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'culture-teacher-'));
 try{
  execFileSync(process.execPath,['scripts/build-site.js'],{env:{...process.env,HF_SITE_ENV:'production',HF_BUILD_OUTPUT_DIR:output},stdio:'pipe'});
  const report=validateBuild(output);assert.deepEqual(report.errors,[]);assert.equal(report.sitemap.length,404);
  for(const route of releaseConfig.cultureTeacher.publicRoutes){const html=fs.readFileSync(path.join(output,route,'index.html'),'utf8'),tree=nodes(parse(html));assert.equal(attr(tree.find(n=>n.tagName==='meta'&&attr(n,'name')==='robots'),'content'),'index,follow');assert.ok(report.sitemap.includes('https://hanzifun.online'+route));if(route!=='/tools/'){assert.ok(html.includes('/site-assets/tools/tools-entry.mjs'));assert.ok(html.includes('data-local-form disabled'));}}
  const teacher=fs.readFileSync(path.join(output,teacherPath,'index.html'),'utf8');assert.match(teacher,/noindex,follow/);assert.ok(!report.sitemap.some(u=>u.includes('/flashcards/teacher/')));assert.match(teacher,/data-teacher-workspace/);
  for(const file of ['cultural-tools','teacher-decks','tools-entry']){const source=fs.readFileSync(path.join(output,'site-assets/tools',file+'.mjs'),'utf8');assert.doesNotMatch(source,/from ['"].*(?:publication-review|node:fs|dictionary-data)/);}
  const catalog=JSON.parse(fs.readFileSync(path.join(output,'site-assets/tools/published-catalog.json')));assert.equal(catalog.items.length,339);assert.ok(catalog.items.every(c=>/^char:[0-9a-f]+$/.test(c.characterId)&&c.path.startsWith('/dictionary/')));
 }finally{fs.rmSync(output,{recursive:true,force:true});}
});
