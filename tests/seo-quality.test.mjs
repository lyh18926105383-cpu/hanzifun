import {scenarioData} from '../site/hsk-data.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {makeSitemap}=createRequire(import.meta.url)('../scripts/build-site.js');
import {parse} from 'parse5';
import {coreSeo,withCoreSeo,safeJsonLd,structuredData,effectivePolicy,canonicalUrl,buildEnvironment,assertEditorialReady} from '../site/seo.mjs';
import {releaseConfig,resolveRoutePolicy} from '../site/routes.mjs';
import {validatePage,validateJsonLd,validateBuild} from '../scripts/validate-seo-quality.mjs';
const origin=releaseConfig.siteOrigin,routePath='/dictionary/水/',route={path:routePath,...resolveRoutePolicy(routePath)};
function fixture(){const seo=coreSeo(routePath),canonical=canonicalUrl(routePath,origin);return `<html lang="en"><head><title>${seo.title} · HanziFun</title><meta name="description" content="Water entry"><meta name="robots" content="${route.robots}"><link rel="canonical" href="${canonical}">${structuredData({path:routePath,title:seo.title,description:'Water entry'},canonical,origin)}</head><body><main><h1>${seo.h1}</h1><p data-seo-lead>${seo.lead.replaceAll('"','&quot;')}</p></main></body></html>`;}
const verify=html=>validatePage(html,route,{origin});
test('Three Kings reject duplicated/missing headings, banner paragraphs and stale answers in actual DOM',()=>{
 assert.equal(verify(fixture()).core,true);
 assert.throws(()=>verify(fixture().replace('</main>','<h1>Duplicate</h1></main>')),/Exactly one H1/);
 assert.throws(()=>verify(fixture().replace('<h1>','<p>Preview pending</p><h1>')),/First main paragraph/);
 assert.throws(()=>verify(fixture().replace('<p data-seo-lead>','<nav>Navigation</nav><p data-seo-lead>')),/immediately follow/);
 assert.throws(()=>verify(fixture().replace('4 strokes','99 strokes')),/Data-backed/);
 assert.throws(()=>verify(fixture().replace('<p data-seo-lead>','<p data-seo-lead hidden>')),/visible/);
 assert.throws(()=>verify(fixture().replace(coreSeo(routePath).title,'Welcome')),/Core keyword/);
 const titles=new Map([[coreSeo(routePath).title+' · HanziFun','/other/']]);assert.throws(()=>validatePage(fixture(),route,{origin,titles}),/Duplicate title/);
});
test('core templates share explicit keyword and answer contracts, including supplemental and polyphonic characters',()=>{
 for(const p of ['/','/dictionary/','/dictionary/pinyin/','/stroke-order/','/pinyin-chart/','/academic/','/academic/hsk-2/','/academic/hsk-3/','/scenarios/travel/restaurant/','/scenarios/business/icebreakers/','/dictionary/发/','/dictionary/爱/']){
  const seo=coreSeo(p);assert.ok(seo.title&&seo.h1&&seo.lead);const page={path:p,content:'<h1>Old title</h1><p>Preview</p>'};const once=withCoreSeo(page);assert.deepEqual(withCoreSeo(once),once);
 }
 assert.match(coreSeo('/dictionary/发/').title,/fā/);assert.match(coreSeo('/academic/hsk-3/').lead,/levels 1–2 together/);
});
test('effective indexing fails closed in staging/local and refuses private published routes',()=>{
 const published={path:'/academic/',...resolveRoutePolicy('/academic/')};assert.equal(effectivePolicy(published,'production').robots,'index,follow');
 for(const env of ['staging','local'])assert.equal(effectivePolicy(published,env).robots,'noindex,follow');
 for(const p of ['/account/','/search/','/sign-in/','/flashcards/?session=secret','/404.html'])assert.throws(()=>effectivePolicy({...published,path:p},'production'),/Unsafe indexable/);
 assert.throws(()=>buildEnvironment('prodution'),/Unknown/);
 assert.equal(buildEnvironment('local'),'local');
 const old=scenarioData.review.humanAcceptance;try{scenarioData.review.humanAcceptance='pending';assert.throws(()=>assertEditorialReady({path:'/scenarios/travel/restaurant/',indexing:'index'}),/human language acceptance pending/);}finally{scenarioData.review.humanAcceptance=old;}
 assert.doesNotThrow(()=>assertEditorialReady({path:'/scenarios/travel/restaurant/',indexing:'index'}));
 assert.throws(()=>effectivePolicy({...published,robots:'noindex,follow'},'production'),/Contradictory/);
 assert.equal(canonicalUrl('/stroke-order/?char=水#play',origin),origin+'/stroke-order/');assert.equal(canonicalUrl('/dictionary/水/?returnTo=secret',origin),origin+'/dictionary/%E6%B0%B4/');
});
test('JSON-LD round-trips hostile closing tags, quotes, accents and multilingual text without breaking the script',()=>{
 const content='"quoted" shuǐ lǜ 汉字 日本語 </script><script>alert(1)</script> & \u2028 \u2029';
 const serialized=safeJsonLd({text:content});assert.deepEqual(JSON.parse(serialized),{text:content});assert.doesNotMatch(serialized,/[<>&\u2028\u2029]/);
 assert.equal(validateJsonLd(parse(`<script type="application/ld+json">${safeJsonLd({'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#site',name:content,url:origin+'/',inLanguage:'en'})}</script>`)),1);
});
test('all JSON-LD blocks must parse and satisfy required type, URL, graph and breadcrumb fields',()=>{
 const block=data=>parse('<script type="application/ld+json">'+data+'</script>');
 assert.throws(()=>validateJsonLd(block('{"broken":')),/Invalid JSON-LD/);
 for(const object of [
  {'@context':'https://schema.org','@type':'WebPage',url:origin},
  {'@context':'https://schema.org','@type':'WebSite','@id':origin,name:'Site',url:'/relative',inLanguage:'en'},
  {'@context':'https://schema.org','@graph':[]},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:9,name:'Home',item:origin}]}
 ])assert.throws(()=>validateJsonLd(block(JSON.stringify(object))));
 assert.throws(()=>validateJsonLd(parse(fixture()+'<script type="application/ld+json">{"broken":</script>')),/Invalid JSON-LD/);
});
test('future accepted Unicode character pages use exactly their encoded canonical in sitemap',()=>{
 const xml=makeSitemap({routes:[{path:'/dictionary/水/',output:'dictionary/水/index.html',indexing:'index'}]},releaseConfig);
 assert.ok(xml.includes('<loc>'+canonicalUrl('/dictionary/水/',origin)+'</loc>'));
});

test('HTML robots and canonical cannot contradict the release manifest',()=>{
 assert.throws(()=>verify(fixture().replace('content="'+route.robots+'"','content="'+(route.robots==='noindex,follow'?'index,follow':'noindex,follow')+'"')),/Robots agrees/);
 assert.throws(()=>verify(fixture().replace('rel="canonical" href="'+canonicalUrl(routePath,origin)+'"','rel="canonical" href="'+origin+'/dictionary/"')),/Self canonical/);
});
test('production and staging builds enforce the exact sitemap set, all JSON-LD blocks and resource budgets',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hf08-test-'));
 try{for(const environment of ['production','staging']){
  const output=path.join(tmp,environment),build=spawnSync(process.execPath,['scripts/build-site.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,HF_BUILD_OUTPUT_DIR:output,HF_SITE_ENV:environment},encoding:'utf8'});assert.equal(build.status,0,build.stderr);
  const report=validateBuild(output);assert.deepEqual(report.errors,[]);assert.equal(report.corePages,354);assert.equal(report.sitemap.length,environment==='production'?JSON.parse(fs.readFileSync(path.join(output,'route-manifest.json'))).routes.filter(r=>r.output&&r.indexing==='index').length:0);
  // A wrongly inserted URL or a corrupt JSON-LD block must break the same deployment gate.
  fs.appendFileSync(path.join(output,'sitemap.xml'),'<loc>https://hanzifun.online/search/?q=water</loc>');assert.ok(validateBuild(output).errors.some(e=>e.includes('Sitemap')));
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
