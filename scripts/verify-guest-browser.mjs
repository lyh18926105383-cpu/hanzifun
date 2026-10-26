// Real public build, isolated Chrome contexts; no test hooks ship to users.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const build=process.env.HF_BUILD_OUTPUT_DIR || '/private/tmp/hf06-build-hanzifun';
const output=process.env.HF06_EVIDENCE_DIR || '/private/tmp/hf06-browser-evidence';
const {chromium}=await import(pathToFileURL(process.env.HF06_PLAYWRIGHT_MODULE || '/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const key='hanzifun.guest.snapshot.v1';
const server=http.createServer(async(req,res)=>{
  try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
    const target=path.resolve(build,'.'+name);if(!target.startsWith(build+'/')){res.writeHead(403).end();return;}
    const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
    res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(await fs.readFile(target));
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
let browser;const checks=[],errors=[],results={};
const data=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const saved=async p=>p.waitForFunction(()=>document.querySelector('.hf-flashcards [role=status]')?.textContent==='Saved on this device.');
const btn=(p,a)=>p.locator('[data-action="'+a+'"]');
async function newContext(fallback=false){const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  if(fallback)await c.addInitScript(()=>Object.defineProperty(navigator,'locks',{get:()=>undefined}));
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));return c;}
try{
  await fs.mkdir(output,{recursive:true});browser=await chromium.launch({headless:true,channel:'chrome'});
  for(const fallback of [false,true]){
    const mode=fallback?'fallback':'web-locks',context=await newContext(fallback),p=await context.newPage();
    await p.goto(origin+'/dictionary/水/');await p.waitForFunction(()=>!!window.HanziFunLearningAdapter);
    await p.locator('[data-hf-save]').click();await p.locator('[data-hf-save-status]').filter({hasText:'Saved on this device.'}).waitFor();
    await p.locator('[data-hf-practice]').click();await p.waitForURL('**/flashcards/?session=*');await btn(p,'flip').waitFor();
    let d=await data(p);const sid=Object.keys(d.sessions)[0],id=d.sessions[sid].queue[0].card.cardId;
    assert.equal(d.favorites.length,1);assert.equal(d.sessions[sid].cursor,0);
    await btn(p,'flip').click();await saved(p);await btn(p,'again').click();await saved(p);
    d=await data(p);assert.equal(d.projection.cards[id].dueAt,d.sessions[sid].lastNow+600000);
    await p.reload();await btn(p,'flip').waitFor({state:'attached'});
    assert.equal((await data(p)).projection.completions.length,1);assert.match(await p.locator('.hf-flashcards h2').innerText(),/complete/);
    checks.push(mode+': dictionary save → practice → again → reload completion once');
    // Actual due route ten minutes later, using a controllable wall clock only in QA.
    const due=await context.newPage();await due.addInitScript(t=>{Date.now=()=>t;},d.sessions[sid].lastNow+600001);
    await due.goto(origin+'/flashcards/?review=due');await btn(due,'flip').waitFor();
    assert.equal((await data(due)).sessions[new URL(due.url()).searchParams.get('session')].queue[0].card.cardId,id);
    await btn(due,'flip').click();await saved(due);await btn(due,'familiar').click();await saved(due);await due.close();checks.push(mode+': real due route after ten minutes');
    // Two real tabs with a shared frozen session reject differing stale checkpoints.
    await p.goto(origin+'/flashcards/decks/first-six/');await btn(p,'flip').waitFor();
    const resumeURL=p.url(),other=await context.newPage();await other.goto(resumeURL);await btn(other,'flip').waitFor();
    await btn(p,'flip').click();await saved(p);await btn(other,'pause').click();await btn(other,'retry').waitFor();
    assert.match(await other.locator('.hf-flashcards [role=status]').innerText(),/conflict/);
    const active=new URL(resumeURL).searchParams.get('session');assert.equal((await data(p)).sessions[active].face,'back');
    await p.reload();await btn(p,'familiar').waitFor();await p.waitForFunction(()=>!document.querySelector('[data-action=familiar]').disabled);
    assert.equal((await data(p)).sessions[active].face,'back');checks.push(mode+': stale-tab conflict, frozen face/cursor reload');
    // Two independent repositories, real shared localStorage, simultaneous mutations.
    const race=async(page,offset)=>page.evaluate(async({offset})=>{
      const {createRepository}=await import('/site-assets/hf06/learning/repository.mjs');
      const lib=await(await fetch('/site-assets/hf06/learning-data.json')).json();
      const repo=createRepository({storage:localStorage,catalog:lib.catalog,locks:navigator.locks});
      const unique=[...new Set(lib.catalog.map(c=>c.characterId))];
      const r=[];for(let i=0;i<12;i++)r.push(await repo.setFavorite(unique[offset+i]));return r;
    },{offset});
    const raced=await Promise.all([race(p,30),race(other,60)]);assert.ok(raced.flat().every(r=>r.saved),JSON.stringify(raced));
    await p.waitForTimeout(100);d=await data(p);assert.equal(d.favorites.length,25,JSON.stringify({mode,favorites:d.favorites,other:(await data(other)).favorites}));checks.push(mode+': 24 competing favorite writes retained across two tabs');
    // Close/reopen preserves the same session and cursor.
    await other.close();await p.close();const reopened=await context.newPage();await reopened.goto(resumeURL);await btn(reopened,'familiar').waitFor();
    assert.equal((await data(reopened)).sessions[active].face,'back');checks.push(mode+': close/reopen resumes persisted session');
    if(!fallback){
      const mixed=await context.newPage();await mixed.addInitScript(()=>{Object.defineProperty(navigator,'locks',{get:()=>undefined});Object.defineProperty(crypto,'randomUUID',{value:undefined});});
      await mixed.goto(origin+'/account/');await mixed.getByRole('button',{name:'Export all guest data',exact:true}).waitFor();
      const expected=await reopened.evaluate(async()=>{const lib=await(await fetch('/site-assets/hf06/learning-data.json')).json(),ids=[...new Set(lib.catalog.map(c=>c.characterId))];return [...new Set([...JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1')).favorites,...ids.slice(0,12),...ids.slice(90,102)])].sort();});
      const mixedResult=await Promise.all([race(reopened,0),race(mixed,90)]);assert.ok(mixedResult.flat().every(r=>r.saved));await reopened.waitForTimeout(100);
      assert.deepEqual((await data(reopened)).favorites,expected);checks.push('mixed-capability tabs share coordination; old WebView UUID fallback saves normally');
    }
    results[mode]={events:d.events.length,favorites:d.favorites.length};await context.close();
  }
  // All four real decks, each in an independent visitor context, evaluate + pause + reload.
  for(const slug of ['first-six','at-the-tea-house','mid-autumn','ants-and-a-bean']){
    const c=await newContext(),p=await c.newPage();await p.goto(origin+'/flashcards/decks/'+slug+'/');await btn(p,'flip').waitFor();
    const before=await data(p),sid=new URL(p.url()).searchParams.get('session');assert.ok(before.sessions[sid].queue.length>=4);
    await btn(p,'flip').click();await saved(p);await btn(p,'familiar').click();await saved(p);await btn(p,'pause').click();await saved(p);
    await p.reload();await btn(p,'resume').waitFor();assert.equal((await data(p)).sessions[sid].cursor,1);
    assert.deepEqual((await data(p)).sessions[sid].queue,before.sessions[sid].queue);
    await btn(p,'resume').click();await saved(p);await c.close();
  }checks.push('all four real decks: one rating, pause/reload/resume, original queue preserved');
  const c=await newContext(),p=await c.newPage();
  await p.goto(origin+'/account/');await p.getByRole('button',{name:'Preview old records in this browser',exact:true}).waitFor();
  const raw=[JSON.stringify({version:1,sessions:[{id:'old',completedAt:1,results:[{char:'睛',status:true},{char:'睛',status:false}]}],characters:{'睛':{seenCount:20,familiarCount:10,unfamiliarCount:10,needsReview:true}}}),
    JSON.stringify({sessions:[{lessonId:'unknown-story',completedAt:1,quizCorrect:1,quizTotal:2}]}),
    JSON.stringify({version:1,characters:{'水':{known:true,attempts:3}},saved:['水'],sessions:[{chars:['水'],count:1,again:0,deck:'first-six',title:'old',finishedAt:'2026-10-25'}]})];
  await p.evaluate(raw=>{['hanzifun.learning.v1','hanzifun.story.v1','hanzifun.prototype.learning.v1'].forEach((k,i)=>localStorage.setItem(k,raw[i]));},raw);
  for(let i=0;i<2;i++){
    await p.getByRole('button',{name:'Preview old records in this browser',exact:true}).click();await p.getByRole('button',{name:'Confirm import',exact:true}).click();
    await p.locator('[data-guest-status]').filter({hasText:'Import saved.'}).waitFor();
  }
  assert.equal((await data(p)).imports.length,3);assert.equal((await data(p)).events.length,0);
  assert.deepEqual(await p.evaluate(()=>['hanzifun.learning.v1','hanzifun.story.v1','hanzifun.prototype.learning.v1'].map(k=>localStorage.getItem(k))),raw);
  const downloadEvent=p.waitForEvent('download');await p.getByRole('button',{name:'Export all guest data',exact:true}).click();
  const download=await downloadEvent;await download.saveAs(path.join(output,'guest-backup.json'));
  p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:'Clear guest data on this device',exact:true}).click();assert.equal((await data(p)).imports.length,3);
  p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Clear guest data on this device',exact:true}).click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).imports.length===0,key);
  await p.locator('input[type=file]').setInputFiles(path.join(output,'guest-backup.json'));
  await p.getByRole('button',{name:'Preview selected file',exact:true}).click();await p.getByRole('button',{name:'Confirm import',exact:true}).click();
  await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).imports.length===3,key);checks.push('three legacy sources: preview/confirm, duplicate import, original keys unchanged, backup download/clear cancel/restore');
  await p.screenshot({path:path.join(output,'learning-mobile.png'),fullPage:true});
  const widths=[];for(const width of [360,390,768,1100,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);widths.push(width);}
  await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});await p.waitForTimeout(150);
  await p.screenshot({path:path.join(output,'learning-desktop.png'),fullPage:false});results.widths=widths;
  await c.close();
  // Storage denial and real quota exception injection, retry + temporary mode.
  for(const failure of ['SecurityError','QuotaExceededError']){
    const c=await newContext(true);await c.addInitScript(failure=>{
      const original=Storage.prototype.setItem;
      window.hf06AllowWrite=false;
      Storage.prototype.setItem=function(k,v){if(!window.hf06AllowWrite)throw new DOMException('Injected storage fault',failure);return original.call(this,k,v);};
    },failure);
    const p=await c.newPage();await p.goto(origin+'/flashcards/decks/first-six/');await p.getByRole('button',{name:'Start temporary practice',exact:true}).waitFor();
    assert.match(await p.locator('[data-guest-status]').innerText(),/Not saved/);
    await p.getByRole('button',{name:'Start temporary practice',exact:true}).click();await btn(p,'flip').click();await p.waitForFunction(()=>document.querySelector('.hf-flashcards [role=status]')?.textContent.includes('Temporary practice'));
    await btn(p,'familiar').click();assert.match(await p.locator('.hf-flashcards [role=status]').innerText(),/Not saved/);
    const exported=p.waitForEvent('download');await p.getByRole('button',{name:'Export recovery JSON',exact:true}).click();const recoveryFile=await exported;const recoveryPath=path.join(output,failure+'-recovery.json');await recoveryFile.saveAs(recoveryPath);
    await p.goto(origin+'/account/');await p.evaluate(()=>{window.hf06AllowWrite=true;});await p.getByRole('button',{name:'Export all guest data',exact:true}).waitFor();
    await p.locator('select').last().selectOption('Practice recovery');await p.locator('input[type=file]').setInputFiles(recoveryPath);await p.getByRole('button',{name:'Preview selected file',exact:true}).click();await p.getByRole('button',{name:'Confirm import',exact:true}).click();await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)||'{}').events?.length===1,key);
    await c.close();checks.push(failure+': no false ack, temporary practice rates, exports and restores real free events');
  }
  // Fill the actual origin quota, not only an injected exception.
  const fullContext=await newContext(true),fullPage=await fullContext.newPage();await fullPage.goto(origin+'/account/');
  await fullPage.getByRole('button',{name:'Export all guest data',exact:true}).waitFor();
  const capacity=await fullPage.evaluate(()=>{
    let n=0;try{while(n<20)localStorage.setItem('hf06.qa.fill.'+n++,'x'.repeat(512*1024));}catch{}
    let small=0;try{while(small<1024)localStorage.setItem('hf06.qa.small.'+small++,'x'.repeat(1024));}catch{}
    return {large:n,small};
  });
  await fullPage.goto(origin+'/flashcards/decks/first-six/');await fullPage.getByRole('button',{name:'Retry starting practice',exact:true}).waitFor();
  assert.match(await fullPage.locator('[data-guest-status]').innerText(),/Not saved/);
  await fullPage.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hf06.qa.'))localStorage.removeItem(k);});
  await fullPage.getByRole('button',{name:'Retry starting practice',exact:true}).click();await btn(fullPage,'flip').waitFor();
  await btn(fullPage,'flip').click();await saved(fullPage);await btn(fullPage,'again').click();await saved(fullPage);
  // Offline applies to the already-loaded current practice only.
  await fullContext.setOffline(true);await btn(fullPage,'flip').click();await saved(fullPage);await btn(fullPage,'familiar').click();await saved(fullPage);
  await fullContext.setOffline(false);checks.push('actual localStorage quota filled: explicit failure, free space, retry; loaded current session still saves offline');results.capacity=capacity;
  await fullContext.close();
  // Actual incognito context supports local storage; persistence only within its lifetime.
  const privateContext=await newContext(),privatePage=await privateContext.newPage();await privatePage.goto(origin+'/flashcards/decks/first-six/');await btn(privatePage,'flip').waitFor();await privatePage.reload();await btn(privatePage,'flip').waitFor();await privateContext.close();checks.push('isolated incognito context: normal storage works, reload supported');
  const restricted=await newContext();await restricted.addInitScript(()=>Object.defineProperty(navigator,'locks',{get:()=>({request:()=>Promise.reject(new DOMException('Restricted','SecurityError'))})}));
  const restrictedPage=await restricted.newPage();await restrictedPage.goto(origin+'/flashcards/decks/first-six/');await btn(restrictedPage,'flip').waitFor();await btn(restrictedPage,'flip').click();await saved(restrictedPage);await restricted.close();checks.push('restricted Web Locks request rejects: fallback still saves');
  assert.deepEqual(errors,[]);
  const receipt={date:'2026-10-26',browser:await browser.version(),origin,publicBuild:build,checks,results,errors};
  await fs.writeFile(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
