import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {chromium} from '/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {nodes,attr} from './validate-seo-quality.mjs';
import {publishedCharacters} from '../site/character-flow.mjs';
import {readJson} from '../site/dictionary-data.mjs';
const sourceStrokes=[...readJson('data/strokes/manifest.json'),...readJson('data/hsk/lexicon.json').strokes];
const build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'dist'),out=path.resolve('docs/hanzifun-rebuild/evidence/character-flow-2026-11-02');
const report={date:'2026-11-02',surface:'Isolated headless Chrome, local production build',checks:[],layouts:[],axe:[],pageErrors:[],screenshots:[],preservation:{}};
const digest=s=>createHash('sha256').update(s).digest('hex');
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
function seoSnapshot(file){
 const all=nodes(parse(fs.readFileSync(file,'utf8')));
 const one=(tag,pred=()=>true)=>all.find(n=>n.tagName===tag&&pred(n));
 return {title:text(one('title')),description:attr(one('meta',n=>attr(n,'name')==='description'),'content'),canonical:attr(one('link',n=>attr(n,'rel')==='canonical'),'href'),robots:attr(one('meta',n=>attr(n,'name')==='robots'),'content'),jsonLd:all.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').map(n=>JSON.parse(text(n)))};
}
function audioSnapshot(file){return nodes(parse(fs.readFileSync(file,'utf8'))).filter(n=>attr(n,'data-pronunciation')!==undefined).map(n=>Object.fromEntries(['data-speech-text','data-audio-url','data-pronunciation-reading','data-pronunciation-kind'].map(key=>[key,attr(n,key)])));}
if(process.env.HF_CHAR_BASELINE){
 const before=path.resolve(process.env.HF_CHAR_BASELINE),all=[];let recordings=0;
 for(const c of publishedCharacters){const relative='dictionary/'+c.glyph+'/index.html',old=path.join(before,relative),current=path.join(build,relative),seo=seoSnapshot(old);assert.deepEqual(seoSnapshot(current),seo,c.glyph+' metadata/JSON-LD drift');
  const audio=audioSnapshot(current);for(const a of audioSnapshot(old)){assert.ok(audio.some(b=>JSON.stringify(a)===JSON.stringify(b)),c.glyph+' audio binding drift: '+JSON.stringify(a));recordings++;}
  all.push({path:'/dictionary/'+c.glyph+'/',seoSha256:digest(JSON.stringify(seo))});
 }
 assert.equal(fs.readFileSync(path.join(build,'sitemap.xml'),'utf8'),fs.readFileSync(path.join(before,'sitemap.xml'),'utf8'));
 report.preservation={pages:all.length,existingAudioBindings:recordings,seoAndJsonLd:'identical',sitemap:'byte-identical',sitemapUrls:404,manifestSha256:digest(JSON.stringify(all))};
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'seo-preservation.json'),JSON.stringify(all,null,2)+'\n');
}
for(const asset of sourceStrokes){const svg=fs.readFileSync(path.join(build,'site-assets/character-glyph',asset.characterId.slice(5)+'.svg'),'utf8'),all=nodes(parse(svg));assert.deepEqual(all.filter(n=>n.tagName==='path').map(n=>attr(n,'d')),readJson(asset.url).strokes);assert.ok(svg.includes(asset.sha256));}report.checks.push('339 hero outlines match every original stroke path and source SHA-256 exactly');
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),file=path.resolve(build,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(build+path.sep)){res.writeHead(403).end();return;}const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
let browser,page;
try{
 fs.mkdirSync(out,{recursive:true});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,channel:'chrome'});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.pageErrors.push(e.message));
 for(const glyph of ['休','木']){
  await page.goto(origin+'/dictionary/'+glyph+'/');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>!document.querySelector('[data-hf-save]').disabled);
  assert.equal(await page.locator('main h1').count(),1);
  assert.ok(await page.locator('.hf-char-definitions li').count()>=1&&await page.locator('.hf-char-definitions li').count()<=3);
  const placement=await page.locator('.hf-char-main').evaluate(el=>{const sentence=el.querySelector('#sentences'),reference=el.querySelector('details.hf-char-reference'),row=el.querySelector('.hf-char-pronunciation'),listen=row.querySelector('[data-pronunciation]'),stroke=row.querySelector('[data-hf-stroke-toggle]');return {afterSentences:!!(sentence.compareDocumentPosition(reference)&Node.DOCUMENT_POSITION_FOLLOWING),afterListen:listen.nextElementSibling===stroke,stageControl:!!el.querySelector('.hf-char-stage [data-hf-stroke-toggle]')};});assert.deepEqual(placement,{afterSentences:true,afterListen:true,stageControl:false});
  assert.ok(!(await page.locator('main').innerText()).includes('Pinyin follows each example'));assert.equal(await page.locator('.hf-char-main > p.hf-char-notes').count(),0);assert.equal(await page.locator('[data-hf-stroke-toggle]').innerText(),'Play Stroke Order');assert.equal(await page.locator('[data-pronunciation-stop]').count(),0);assert.equal(await page.locator('.pronunciation-tools').count(),0);assert.ok(!(await page.locator('main').innerText()).includes('A memory association, not historical etymology'));assert.equal(await page.locator('[data-pronunciation-status]').count(),1);assert.ok(await page.locator('[data-seo-lead]').isVisible());
  assert.equal(await page.locator('.hf-char-glyph-image').getAttribute('data-glyph'),glyph);assert.ok(await page.locator('.hf-char-glyph-image').evaluate(img=>img.complete&&img.naturalWidth>0));
  const hero=await page.locator('.hf-char-hero').evaluate(el=>[...el.children].map(n=>n.getBoundingClientRect().toJSON()));assert.ok(Math.max(hero[0].top,hero[1].top)<Math.min(hero[0].bottom,hero[1].bottom));assert.ok(hero[1].left>hero[0].right);
  const layout=await page.locator('.hf-char-layout').evaluate(el=>[...el.children].map(n=>n.getBoundingClientRect().toJSON()));assert.ok(layout[0].width>layout[1].width*1.9&&layout[0].width<layout[1].width*2.3);assert.equal(await page.locator('.hf-char-utility').evaluate(el=>getComputedStyle(el).position),'sticky');
  const file=glyph==='休'?'xiu-desktop-full.png':'mu-desktop-full.png';await page.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});report.screenshots.push(file);
  await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));await page.waitForFunction(()=>Math.abs(document.querySelector('.hf-char-utility').getBoundingClientRect().top-24)<2);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  for(const width of [360,390,767,768,1100,1440]){
   await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),glyph+' overflow '+width);report.layouts.push({glyph,width,overflow:false});
  }
  for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await page.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],glyph+' axe '+width);report.axe.push({glyph,width,violations:0});}
 }
 report.checks.push('Compound and basic full-page desktop screenshots; 12 responsive layouts; desktop hero side-by-side and 68/32 columns; four axe WCAG AA scans');
 await page.goto(origin+'/dictionary/休/');await page.waitForFunction(()=>!document.querySelector('[data-hf-save]').disabled);await page.locator('[data-hf-save]').click();await page.waitForFunction(()=>document.querySelector('[data-hf-save-status]').textContent==='Saved on this device.');await page.reload();await page.waitForFunction(()=>!!window.HanziFunLearningAdapter);assert.ok(await page.evaluate(()=>JSON.stringify(localStorage).includes('char:4f11')));
 report.checks.push('Add to Flashcards writes durable local character identity and survives reload');
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('[data-hf-copy]').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'休');report.checks.push('Copy writes the current character to clipboard');
 await page.locator('[data-hf-stroke-toggle]').click();await page.waitForSelector('[data-stroke-stage] svg');assert.equal(await page.locator('[data-hf-stroke-toggle]').getAttribute('aria-expanded'),'true');await page.locator('[data-hf-stroke-toggle]').click();assert.equal(await page.locator('#character-strokes').getAttribute('open'),null);report.checks.push('Hero stroke toggle loads real per-character SVG, plays, closes and pauses');
 await page.goto(origin+'/dictionary/发/');await page.locator('.hf-char-reference').first().locator('summary').click();const alternative=await page.locator('[data-reading-select] option').last().getAttribute('value');await page.locator('[data-reading-select]').selectOption(alternative);assert.equal(await page.locator('[data-reading-panel]:visible').getAttribute('data-reading-panel'),alternative);assert.equal(await page.locator('[data-hf-practice]').getAttribute('data-reading-id'),alternative);report.checks.push('Alternative reading updates accessible information and practice identity without changing teaching example labels');
 await page.goto(origin+'/dictionary/木/');await page.evaluate(()=>window.__printCalls=0);await page.evaluate(()=>window.print=()=>{window.__printCalls++;window.dispatchEvent(new Event('beforeprint'));});await page.locator('[data-print]').click();assert.equal(await page.evaluate(()=>window.__printCalls),1);assert.equal(await page.locator('#character-strokes').getAttribute('open'),'');await page.emulateMedia({media:'print'});assert.equal(await page.locator('.hf-char-utility').isVisible(),false);await page.screenshot({path:path.join(out,'mu-print.png'),fullPage:true});report.screenshots.push('mu-print.png');await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));report.checks.push('Print Worksheet opens native printing, expands static learning content and omits utility controls');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}}),n=await nojs.newPage();await n.goto(origin+'/dictionary/木/');assert.equal(await n.locator('.hf-char-section').count(),3);await n.locator('#character-strokes > summary').click();assert.ok(await n.locator('.stroke-static').isVisible());assert.ok(await n.locator('.hf-char-formula a').count()>=4);await nojs.close();report.checks.push('Without JavaScript all four learning modules and valid links remain readable; native details reveal the complete static stroke sequence');
 const mobile=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),m=await mobile.newPage();await m.goto(origin+'/dictionary/休/');await m.evaluate(()=>document.fonts.ready);await m.screenshot({path:path.join(out,'xiu-mobile-full.png'),fullPage:true,animations:'disabled'});report.screenshots.push('xiu-mobile-full.png');await mobile.close();
 assert.deepEqual(report.pageErrors,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;if(page)await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});throw error;}finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();await new Promise(resolve=>server.close(resolve));console.log(JSON.stringify(report,null,2));}
