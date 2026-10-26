// Full local integration suite. Screenshots, copies and downloaded backups stay in .cache.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||path.join(root,'.cache/hf09/production')),output=process.env.HF09_BROWSER_OUTPUT||path.join(root,'.cache/hf09/browser'),evidence=path.join(root,'docs/hanzifun-rebuild/evidence/hf09');
fs.mkdirSync(output,{recursive:true});fs.mkdirSync(evidence,{recursive:true});
const require=createRequire(import.meta.url),lessons=require('../lessons.js');
const {chromium}=await import(pathToFileURL(process.env.HF09_PLAYWRIGHT_MODULE||'/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const report={date:new Date().toISOString(),status:'RUNNING',checks:[],stories:[],errors:[],limitations:['Automated Chrome media playback; no human listening or visual sign-off','No Safari/Firefox/physical devices/real screen reader/native zoom','Static Node HTTP server; Workers redirect semantics are checked separately']};
if(!process.argv.includes('--integration-only'))for(const [script,prefix,receipt] of [['verify-guest-browser.mjs','HF06','receipt.json'],['verify-hsk-browser.mjs','HF07','browser.json'],['verify-quality-browser.mjs','HF08','browser.json']]){
 const dir=path.join(output,prefix);const run=spawnSync('node',['scripts/'+script],{cwd:root,env:{...process.env,HF_BUILD_OUTPUT_DIR:build,[prefix+'_EVIDENCE_DIR']:dir},encoding:'utf8',maxBuffer:10*1024*1024});
 fs.writeFileSync(path.join(output,prefix+'.log'),(run.stdout||'')+(run.stderr||''));
 if(run.status!==0){report.errors.push(script+': '+(run.stderr||run.stdout).slice(-1800));continue;}
 const actual=fs.readdirSync(dir).find(f=>f===receipt)||fs.readdirSync(dir).find(f=>f.endsWith('.json')&&f!=='guest-backup.json');
 const result=JSON.parse(fs.readFileSync(path.join(dir,actual),'utf8'));
 fs.writeFileSync(path.join(evidence,prefix.toLowerCase()+'-browser.json'),JSON.stringify(result,null,2)+'\n');report.checks.push(script+' PASS');
}
const handler=(req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=decodeURIComponent(u.pathname),f=path.resolve(build,'.'+(p.endsWith('/')?p+'index.html':p));if(!f.startsWith(build+'/')){res.writeHead(403).end();return;}
 const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.mp4':'video/mp4'};
 res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}};
const servers=[http.createServer(handler),http.createServer(handler)];for(const s of servers)await new Promise(r=>s.listen(0,'127.0.0.1',r));const [origin,other]=servers.map(s=>'http://127.0.0.1:'+s.address().port);let browser;
try{
 browser=await chromium.launch({headless:true,channel:'chrome'});report.browser=await browser.version();
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 for(const query of ['水','shuǐ','shui3','water']){await p.goto(origin+'/search/?q='+encodeURIComponent(query));await p.locator('[data-hf-results] a[href="/dictionary/水/"]').first().waitFor();}
 await p.locator('[data-hf-results] a[href="/dictionary/水/"]').first().click();await p.locator('[data-stroke=next]').click();await p.locator('[data-stroke-status]').filter({hasText:'1 /'}).waitFor();
 await p.getByRole('link',{name:/Open.*Stroke Order/i}).click();assert.equal(new URL(p.url()).searchParams.get('char'),'水');
 report.searchPerformance=await p.evaluate(async()=>{const {searchEntries}=await import('/site-assets/search-core.hf04-v1.mjs');const entries=(await Promise.all(['characters','words','library'].map(n=>fetch('/site-assets/search/'+n+'.hf04-v1.json').then(r=>r.json())))).flat(),times=[];for(let i=0;i<100;i++){const t=performance.now();searchEntries(entries,['水','shuǐ','shui3','water'][i%4]);times.push(performance.now()-t);}times.sort((a,b)=>a-b);return {queries:100,p95Ms:times[94],scope:'Warm loaded index; Chrome desktop CPU, no network time'};});assert.ok(report.searchPerformance.p95Ms<=200);
 report.checks.push('All four water search forms → real detail → stroke → independent tool preserves 水');
 await p.goto(origin+'/pinyin-chart/');assert.equal(await p.locator('details[id^=syllable-]').count(),410);
 const shui=p.locator('[id="syllable-shui"]');await shui.locator('summary').click();assert.ok(await shui.getByRole('button').first().isDisabled());
 await shui.locator('a[href="/dictionary/水/"]').first().click();assert.match(decodeURI(new URL(p.url()).pathname),/水/);
 report.checks.push('Pinyin shui → disabled audio icon → 水 detail; 410 static syllables');
 // Genuine file export on one origin and user-file preview/confirm on a second origin.
 await p.goto(origin+'/account/');await p.getByRole('button',{name:'Preview old records in this browser',exact:true}).waitFor();
 const raws=[JSON.stringify({version:1,sessions:[],characters:{'睛':{seenCount:2,familiarCount:1,unfamiliarCount:1,needsReview:true},'龘':{seenCount:1,familiarCount:0,unfamiliarCount:1}}}),JSON.stringify({sessions:[{lessonId:'unknown-lesson',completedAt:1,quizCorrect:1,quizTotal:2}]}),JSON.stringify({version:1,characters:{'水':{known:true,attempts:1}},saved:['水'],sessions:[]})];
 const keys=['hanzifun.learning.v1','hanzifun.story.v1','hanzifun.prototype.learning.v1'];await p.evaluate(({keys,raws})=>keys.forEach((k,i)=>localStorage.setItem(k,raws[i])),{keys,raws});
 await p.getByRole('button',{name:'Preview old records in this browser',exact:true}).click();await p.getByRole('button',{name:'Confirm import',exact:true}).click();await p.locator('[data-guest-status]').filter({hasText:'Import saved.'}).waitFor();
 const source=await p.evaluate(()=>JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1')));
 const downloaded=p.waitForEvent('download');await p.getByRole('button',{name:'Export all guest data',exact:true}).click();const download=await downloaded,backup=path.join(output,'cross-origin-backup.json');await download.saveAs(backup);
 assert.deepEqual(await p.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys),raws);
 await p.goto(other+'/account/');await p.getByRole('button',{name:'Preview selected file',exact:true}).waitFor();assert.equal(await p.evaluate(()=>localStorage.getItem('hanzifun.learning.v1')),null);
 await p.locator('select').last().selectOption('Guest backup');await p.locator('input[type=file]').setInputFiles(backup);await p.getByRole('button',{name:'Preview selected file',exact:true}).click();await p.getByRole('button',{name:'Confirm import',exact:true}).click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1'))?.imports.length===3);
 const dest=await p.evaluate(()=>JSON.parse(localStorage.getItem('hanzifun.guest.snapshot.v1')));assert.deepEqual(dest.imports,source.imports);assert.deepEqual(dest.favorites,source.favorites);assert.equal(dest.events.length,0);
 report.checks.push('Three old sources including unknown character/story → preview/confirm → real download → different port origin file restore; original keys unchanged; no invented events');
 await c.close();
 // Real unaccelerated media playback and complete lesson interaction, without claiming human QA.
 for(const lesson of lessons){const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(lesson.id+': '+e.message));
  await page.goto(origin+'/zh/');await page.locator('.story-collection summary').click();const entry=page.locator('a[href*="lesson='+lesson.id+'"]').first();await entry.click();assert.equal(new URL(page.url()).searchParams.get('lesson'),lesson.id);assert.equal(await page.locator('#lessonTitle').innerText(),lesson.title);
  await page.evaluate(()=>{window.hf09Captions=[];new MutationObserver(()=>window.hf09Captions.push({caption:document.querySelector('#sceneCaption').textContent,highlight:[...document.querySelectorAll('.focus-char.speaking')].map(n=>n.textContent)})).observe(document.querySelector('#sceneStage'),{subtree:true,childList:true,attributes:true});});
  await page.locator('#startStoryButton').click();await page.waitForFunction(()=>!document.querySelector('#startPracticeButton').disabled,{},{timeout:45000});
  const playback=await page.evaluate(()=>({captions:[...new Set(window.hf09Captions.map(x=>x.caption))],highlighted:[...new Set(window.hf09Captions.flatMap(x=>x.highlight))],muted:[...document.querySelectorAll('video')].every(v=>v.muted),audioError:document.querySelector('#voicePlayer').error?.message||null}));
  assert.equal(playback.muted,true);assert.equal(playback.audioError,null);assert.ok(playback.captions.length>0);
  await page.locator('#startPracticeButton').click();for(const item of lesson.practice){assert.equal(await page.locator('#practiceChar').innerText(),item.char);await page.locator('#practiceDoneButton').click();}
  for(const question of lesson.quiz){await page.locator('#quizTitle').filter({hasText:question.prompt}).waitFor();await page.locator('.quiz-choice').filter({hasText:new RegExp('^'+question.choices.find(x=>x!==question.answer)+'$')}).click();await page.locator('#quizFeedback').filter({hasText:'再找一找'}).waitFor();await page.locator('.quiz-choice').filter({hasText:new RegExp('^'+question.answer+'$')}).click();}
  await page.locator('#resultPanel:not([hidden])').waitFor({timeout:20000});assert.equal(await page.locator('#resultScore').innerText(),String(lesson.quiz.length));
  report.stories.push({id:lesson.id,title:lesson.title,practice:lesson.practice.length,quiz:lesson.quiz.length,...playback,status:'AUTOMATED PASS',humanAcceptance:'pending'});await context.close();console.log('story '+lesson.id+': PASS');
 }
 report.checks.push('Eight real Chinese homepage links → full media playback → all practice characters → wrong feedback + all correct answers → result');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.errors.push(e.stack);process.exitCode=1;}
finally{await browser?.close();for(const s of servers)await new Promise(r=>s.close(r));fs.writeFileSync(path.join(evidence,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,stories:report.stories.length,errors:report.errors},null,2));}
