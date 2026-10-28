import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'dist');
const evidence=process.env.HF_ADSENSE_EVIDENCE_DIR||'/private/tmp/hanzifun-adsense-browser';
const server=http.createServer(async(req,res)=>{try{
 let p=decodeURIComponent(new URL(req.url,'http://local').pathname);if(p.endsWith('/'))p+='index.html';
 const file=path.resolve(build,'.'+p);if(!file.startsWith(build+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
 }catch{res.writeHead(404).end();}});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port,report={date:new Date().toISOString(),checks:[],layouts:[],axe:[],pageErrors:[]};let browser;
try{
 await fs.mkdir(evidence,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage();p.on('pageerror',e=>report.pageErrors.push(e.message));
 const paths=['/','/scenarios/','/dictionary/快/','/dictionary/六/','/dictionary/星/','/privacy/','/terms/','/about/','/contact/','/blog/','/blog/chinese-character-study-routine/','/blog/chinese-character-confusions/'];
 for(const route of paths){
  assert.equal((await p.goto(origin+route)).status(),200);assert.equal(await p.locator('header nav[aria-label="Main navigation"]').count(),1);
  for(const dest of ['/privacy/','/terms/','/about/','/contact/'])assert.equal(await p.locator(`footer a[href="${dest}"]`).count(),1);
  await p.addScriptTag({path:path.resolve('node_modules/axe-core/axe.min.js')});const result=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa']}}));
  report.axe.push({route,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
  assert.equal(result.violations.length,0,route+JSON.stringify(report.axe.at(-1)));
  for(const width of [360,390,768,1100,1440]){await p.setViewportSize({width,height:1000});const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);report.layouts.push({route,width,overflow});assert.equal(overflow,false,route+' '+width);}
 }
 await p.setViewportSize({width:390,height:844});await p.goto(origin+'/scenarios/');assert.equal(await p.locator('#mobile-menu').isVisible(),false);
 await p.locator('[data-menu-toggle]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#mobile-menu').isVisible(),true);
 await p.keyboard.press('Tab');assert.equal(await p.locator('#mobile-menu :focus').count(),1);await p.keyboard.press('Escape');assert.equal(await p.locator('#mobile-menu').isVisible(),false);assert.equal(await p.locator('[data-menu-toggle]:focus').count(),1);
 await p.setViewportSize({width:1440,height:1000});await p.waitForFunction(()=>!document.querySelector('#mobile-menu').hidden);assert.equal(await p.locator('#mobile-menu').isVisible(),true);report.checks.push('Single menu: mobile toggle, keyboard Tab, Escape focus return and resize back to desktop');
 await p.setViewportSize({width:390,height:844});await p.goto(origin+'/dictionary/快/');assert.equal(await p.locator('main .editorial-lesson [data-pronunciation]').count(),3);await p.locator('main .editorial-lesson details').first().locator('summary').click();assert.equal(await p.locator('main .editorial-lesson details').first().getAttribute('open'),'');report.checks.push('Three example audio bindings and expandable answer in the enhanced character lesson');
 await p.locator('#kuai-guide').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(evidence,'kuai-mobile.png')});
 await p.goto(origin+'/privacy/');await p.screenshot({path:path.join(evidence,'privacy-mobile.png')});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),np=await nojs.newPage();await np.goto(origin+'/scenarios/');assert.equal(await np.locator('#mobile-menu').isVisible(),true);assert.ok((await np.locator('#main').innerText()).includes('three-turn exchange'));report.checks.push('Without JavaScript: mobile navigation and substantial scenario lesson remain readable');await nojs.close();
 assert.deepEqual(report.pageErrors,[]);
}finally{await fs.writeFile(path.join(evidence,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.close();}
console.log(JSON.stringify({evidence,...report,layouts:report.layouts.length,axe:report.axe.length},null,2));
