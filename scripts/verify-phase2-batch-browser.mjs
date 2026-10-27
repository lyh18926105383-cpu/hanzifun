// Local-only checks using a fresh browser profile; never touches an existing user's learning data.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {reviewInputs,characterReviewState} from '../site/publication-review.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const build=process.env.HF_BUILD_OUTPUT_DIR||path.join(root,'dist');
const output=process.env.HF10_BROWSER_OUTPUT||path.join(root,'.cache/hf10/browser');
const batchId=process.argv.find(a=>a.startsWith('--batch='))?.slice(8)||'hf10-phase2-a';
const batch=JSON.parse(await fs.readFile(path.join(root,'docs/hanzifun-rebuild/hf10-batches.json'),'utf8')).batches.find(b=>b.batchId===batchId);
if(!batch)throw Error('Unknown frozen batch');
const {chromium}=await import(pathToFileURL(process.env.HF10_PLAYWRIGHT_MODULE||'/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
// Fulfil browser HTTP requests from the built files, without opening a listening port.
const serve=async route=>{
 try{
  let name=decodeURIComponent(new URL(route.request().url()).pathname);if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(build,'.'+name);if(!file.startsWith(build+'/')){await route.fulfill({status:403});return;}
  const contentType=({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream';
  await route.fulfill({status:200,contentType,body:await fs.readFile(file)});
 }catch{await route.fulfill({status:404});}
};
const origin='http://hf10.local';
const receipt={batchId,transport:'Playwright route fulfillment from dist; no listener',pages:[],journeys:[],errors:[],screenshots:[],limitations:['Local Chrome only; HTTP routing is simulated, not a Workers check; no production deployment or new audio listening acceptance.']};
let browser;
try{
 await fs.mkdir(output,{recursive:true});browser=await chromium.launch({headless:true,channel:'chrome'});receipt.browser=browser.version();
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await context.route(origin+'/**',serve);const p=await context.newPage();
 p.on('pageerror',e=>receipt.errors.push(e.message));
 for(const id of batch.characterIds){
  const state=characterReviewState(id),ed=state.teaching;assert.ok(state.accepted,state.glyph+' must be signed');
  for(const width of [390,1440]){
   await p.setViewportSize({width,height:900});const r=await p.goto(origin+state.path);assert.equal(r.status(),200);
   assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'index,follow');
   assert.equal(await p.locator('[data-reading-select]').inputValue(),ed.readingId);
   assert.ok((await p.locator('main').innerText()).includes(ed.sentence));
   assert.ok((await p.locator('main').innerText()).includes(ed.mnemonic));
   assert.ok((await p.locator('.character-info:visible').innerText()).includes(ed.structureReview.description));
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),state.glyph+' overflow at '+width);
  }
  receipt.pages.push({character:state.glyph,readingId:ed.readingId,widths:[390,1440],signed:true});
 }
 await p.setViewportSize({width:390,height:844});
 for(const glyph of ['一','好','少','分','会','了','的','么','吗']){
  const c=reviewInputs.supplemental.characters.find(c=>c.glyph===glyph);if(!batch.characterIds.includes(c.characterId))continue;
  const ed=characterReviewState(c.characterId).teaching;
  await p.goto(origin+'/dictionary/'+glyph+'/');await p.waitForFunction(()=>!!window.HanziFunLearningAdapter);
  await p.locator('[data-stroke=next]').click();await p.locator('[data-stroke-status]').filter({hasText:'1 /'}).waitFor();
  await p.locator('[data-hf-save]').click();await p.locator('[data-hf-save-status]').filter({hasText:/saved/i}).waitFor();
  await p.reload();await p.waitForFunction(()=>!!window.HanziFunLearningAdapter);
  const saved=await p.evaluate(id=>JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1')).favorites.includes(id),c.characterId);
  assert.equal(saved,true);
  await p.locator('[data-hf-practice]').click();await p.waitForURL('**/flashcards/?session=*&returnTo=*');
  await p.locator('[data-action=flip]').waitFor();const sessionId=new URL(p.url()).searchParams.get('session');
  const card=await p.evaluate(id=>JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1')).sessions[id].queue[0].card,sessionId);
  assert.equal(card.readingId,ed.readingId);assert.ok(card.back.includes(ed.sentence));
  await p.locator('[data-action=again]').click();await p.locator('.hf-flashcards [role=status]').filter({hasText:'Saved on this device.'}).waitFor();
  await p.reload();await p.locator('.hf-flashcards').waitFor();
  receipt.journeys.push({character:glyph,steps:'signed page → real stroke → save → reload favorite → contextual reading flashcard → rate → reload'});
 }
 for(const glyph of ['一','有','今','吗']){
  await p.goto(origin+'/dictionary/'+glyph+'/');const filename='character-'+glyph.codePointAt(0).toString(16)+'.png';
  await p.screenshot({path:path.join(output,filename),fullPage:true});receipt.screenshots.push(filename);
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.route(origin+'/**',serve);const n=await nojs.newPage();
 for(const id of batch.characterIds){const s=characterReviewState(id);await n.goto(origin+s.path);assert.ok((await n.locator('main').innerText()).includes(s.teaching.sentence));assert.ok(await n.locator('svg').count()>0);}
 receipt.noJavaScriptPages=batch.count;assert.deepEqual(receipt.errors,[]);
}catch(e){receipt.errors.push(e.stack);process.exitCode=1;}
finally{if(browser)await browser.close();await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({pages:receipt.pages.length,journeys:receipt.journeys.length,errors:receipt.errors},null,2));}
