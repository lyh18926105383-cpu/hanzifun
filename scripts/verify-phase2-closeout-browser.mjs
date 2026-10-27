// Phase 2 closeout: isolated production-browser checks; no user profile or saved records are used.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from '/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),build=process.env.HF_BUILD_OUTPUT_DIR||path.join(root,'dist'),output=process.env.HF_CLOSEOUT_EVIDENCE_DIR||'/private/tmp/hf-closeout-ui';
const server=http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(build,'.'+pathname);if(!file.startsWith(build+'/'))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port,key='hanzifun.guest.snapshot.v1';
const report={date:new Date().toISOString(),checks:[],layouts:[],axe:[],errors:[]};let browser;
try{
 await fs.mkdir(output,{recursive:true});browser=await chromium.launch({headless:true,channel:'chrome'});report.browser=browser.version();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(origin+'/account/');await page.getByRole('button',{name:'Export all guest data',exact:true}).waitFor();
 // Seed isolated records through the production repository and reducer, never the owner's local storage.
 const seeded=await page.evaluate(async()=>{
  const {createRepository}=await import('/site-assets/hf06/learning/repository.mjs');
  const {createFlashcardController}=await import('/site-assets/hf06/client/flashcards.mjs');
  const lib=await(await fetch('/site-assets/hf06/learning-data.json')).json();
  const repo=createRepository({storage:localStorage,catalog:lib.catalog,locks:navigator.locks,origin:location.origin,lessonIds:lib.lessonIds,contentVersion:lib.contentVersion});let seq=0;
  const cards=lib.decks.find(d=>d.slug==='first-six').cardIds.map(id=>lib.catalog.find(c=>c.cardId===id));
  for(let i=0;i<9;i++){
   const r=await repo.start({cards:[cards[i%cards.length]],title:'Review round '+(i+1),source:'qa-history',free:true});if(!r.saved)throw Error(r.reason);
   const c=createFlashcardController({session:r.session,projection:r.projection,deviceId:crypto.randomUUID(),uuid:()=>crypto.randomUUID(),nextSeq:n=>{const start=seq;seq+=n;return start;},commit:t=>repo.commit(t)});await c.rate(i%2?'familiar':'unfamiliar');
  }
  const unfinished=await repo.start({cards,title:'Continue this set',source:'qa-resume',free:true});if(!unfinished.saved)throw Error(unfinished.reason);
  const c=createFlashcardController({session:unfinished.session,projection:unfinished.projection,deviceId:crypto.randomUUID(),uuid:()=>crypto.randomUUID(),nextSeq:n=>{const start=seq;seq+=n;return start;},commit:t=>repo.commit(t)});await c.rate('familiar');await c.pause();
  return {id:unfinished.session.sessionId,queue:unfinished.session.queue};
 });
 await page.reload();await page.getByRole('button',{name:'Export all guest data',exact:true}).waitFor();
 const recent=page.locator('.learning-panel').filter({has:page.getByRole('heading',{name:'Recent sessions',exact:true})});
 assert.equal(await recent.locator('li').count(),8);assert.equal(await recent.getByRole('button',{name:'Previous',exact:true}).isDisabled(),true);
 await recent.getByRole('button',{name:'Next',exact:true}).click();assert.equal(await recent.locator('li').count(),1);assert.equal(await recent.getByRole('button',{name:'Next',exact:true}).isDisabled(),true);await recent.getByRole('button',{name:'Previous',exact:true}).click();assert.equal(await recent.locator('li').count(),8);report.checks.push('Nine completed rounds paginate 8/1 with correctly disabled boundary buttons');
 await page.getByRole('link',{name:'Continue',exact:true}).click();await page.locator('[data-action=resume]').waitFor();
 let snapshot=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(snapshot.sessions[seeded.id].cursor,1);assert.deepEqual(snapshot.sessions[seeded.id].queue,seeded.queue);
 await page.locator('[data-action=resume]').click();await page.waitForFunction(()=>document.querySelector('.hf-flashcards [role=status]')?.textContent==='Saved on this device.');await page.reload();await page.locator('[data-action=familiar]').waitFor();snapshot=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(snapshot.sessions[seeded.id].cursor,1);report.checks.push('Dashboard Continue resumes paused session after refresh with frozen queue and cursor unchanged');
 await page.goto(origin+'/account/');await recent.getByRole('button',{name:'Practise again',exact:true}).first().waitFor();
 const old=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);await recent.getByRole('button',{name:'Practise again',exact:true}).first().click();await page.waitForURL('**/flashcards/?session=*');await page.locator('[data-action=familiar]').waitFor();
 const replay=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),id=new URL(page.url()).searchParams.get('session');assert.ok(replay.sessions[id].queue.length);assert.ok(replay.sessions[id].queue.every(entry=>entry.intent==='free'));assert.equal(replay.projection.completions.length,old.projection.completions.length);for(const [sid,s] of Object.entries(old.sessions))assert.deepEqual(replay.sessions[sid],s);report.checks.push('Practise again creates a new free session and preserves all previous sessions and completion counts');
 await page.goto(origin+'/account/');await page.getByRole('button',{name:'Save settings',exact:true}).click();await page.locator('[data-guest-status]').filter({hasText:'Saved on this device.'}).waitFor();
 const backup=page.waitForEvent('download');await page.getByRole('button',{name:'Export all guest data',exact:true}).click();assert.ok((await backup).suggestedFilename().endsWith('.json'));report.checks.push('Settings save and backup export remain functional');
 const axe=await fs.readFile(path.join(root,'node_modules/axe-core/axe.min.js'),'utf8');
 for(const route of ['/account/','/flashcards/my-words/','/tools/zodiac-elements-calculator/']){
  await page.goto(origin+route);if(route!='/tools/zodiac-elements-calculator/')await page.waitForFunction(()=>!!window.HanziFunLearningAdapter);
  for(const width of [360,390,768,1100,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' '+width);report.layouts.push({route,width,overflow:false});}
  await page.addScriptTag({content:axe});const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));assert.deepEqual(violations,[]);report.axe.push({route,violations});
  await page.screenshot({path:path.join(output,route==='/account/'?'learning-desktop.png':route==='/flashcards/my-words/'?'saved-desktop.png':'five-elements-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(output,route==='/account/'?'learning-mobile.png':route==='/flashcards/my-words/'?'saved-mobile.png':'five-elements-mobile.png'),fullPage:true});
 }
 const cards=page.locator('[data-five-element]');assert.equal(await cards.count(),5);
 for(const href of await cards.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){const response=await page.request.get(origin+href);assert.equal(response.status(),200);assert.match(await response.text(),/name="robots" content="index,follow"/);}
 await page.getByRole('link',{name:'Explore 钱',exact:true}).focus();await page.keyboard.press('Enter');await page.waitForURL('**/dictionary/%E9%92%B1/');report.checks.push('All ten Five Elements links return indexed dictionary pages; keyboard activation works');
 assert.deepEqual(report.errors,[]);await fs.writeFile(path.join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await context.close();
}finally{await browser?.close();await new Promise(r=>server.close(r));}
