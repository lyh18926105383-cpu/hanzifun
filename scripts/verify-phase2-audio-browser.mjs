import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url);
export async function verifyPhaseTwoBrowser({playwrightModule='/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'}={}){
 const {chromium}=require(playwrightModule),build=path.join(root,'dist'),out=path.join(root,'docs/hanzifun-rebuild/evidence/hf11');fs.mkdirSync(out,{recursive:true});
 const report={date:new Date().toISOString(),routes:[],layouts:[],interaction:[],errors:[],limitations:['Chrome desktop emulation, not Safari/Firefox or physical devices.','MP3 decoding and sample energy are verified; no human listening acceptance inferred.','Browser speech requires a Mandarin device voice; this headless environment may supply none.']};
 const save=()=>fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
 const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),file=path.resolve(build,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(build+path.sep)){res.writeHead(403).end();return;}const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg'};res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 let browser;
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,channel:'chrome'});report.engine=browser.version();const page=await browser.newPage();page.setDefaultTimeout(5000);page.on('pageerror',e=>report.errors.push(e.message));
  const axe=fs.readFileSync(path.join(root,'node_modules/axe-core/axe.min.js'),'utf8');
  for(const route of ['/pinyin-chart/','/dictionary/发/','/dictionary/房/','/academic/hsk-2/level-2/','/scenarios/travel/airport/','/scenarios/travel/hotel/','/scenarios/travel/supermarket/']){
   const response=await page.goto(origin+route);await page.waitForLoadState('networkidle');assert.equal(response.status(),200);await page.addScriptTag({content:axe});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   report.routes.push({route,status:response.status(),violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.length})),robots:await page.locator('meta[name=robots]').getAttribute('content')});assert.equal(result.violations.length,0);
   for(const width of [360,768,1440]){await page.setViewportSize({width,height:900});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);report.layouts.push({route,width,overflow});assert.equal(overflow,false);}save();
  }
  await page.goto(origin+'/pinyin-chart/');await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-pronunciation]').count(),1323);assert.equal(await page.locator('[data-pronunciation][disabled]').count(),0);
  report.mandarinVoices=await page.evaluate(()=>speechSynthesis.getVoices().filter(v=>/^(zh-(CN|TW|Hans|Hant)|cmn)/i.test(v.lang)).map(v=>v.lang));
  await page.locator('[id="syllable-ma"] summary').click();await page.locator('[id="syllable-ma"] [data-pronunciation]').first().click();await page.waitForFunction(()=>['Playing recording.','Finished.'].includes(document.querySelector('[data-pronunciation-status]').textContent));
  report.interaction.push('Actual pinyin recording started; 1323 enabled chart controls.');await page.locator('[data-pronunciation-stop]').click();await page.setViewportSize({width:390,height:844});await page.locator('[id="syllable-ma"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'pinyin-390.png')});save();
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/audio/pronunciation.json'),'utf8'));
  report.decode=await page.evaluate(async urls=>{const context=new AudioContext(),out={decoded:0,nonSilent:0,errors:[],minDuration:Infinity,maxDuration:0};let next=0;
   await Promise.all(Array.from({length:6},async()=>{while(next<urls.length){const url=urls[next++];try{const r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);const data=await context.decodeAudioData(await r.arrayBuffer());out.decoded++;out.minDuration=Math.min(out.minDuration,data.duration);out.maxDuration=Math.max(out.maxDuration,data.duration);let energy=false;for(let c=0;c<data.numberOfChannels;c++){for(const x of data.getChannelData(c))if(Math.abs(x)>.002){energy=true;break;}}if(energy)out.nonSilent++;else out.errors.push({url,error:'silent'});}catch(e){out.errors.push({url,error:String(e)});}}}));await context.close();return out;
  },Object.values(manifest.syllables).filter(r=>r.url).map(r=>'/'+r.url));assert.equal(report.decode.decoded,1268);assert.equal(report.decode.nonSilent,1268);assert.equal(report.decode.errors.length,0);save();
  await page.goto(origin+'/scenarios/travel/airport/');await page.waitForLoadState('networkidle');await page.locator('#arrival-token-0 summary').click();await page.locator('#arrival-token-0 [data-token-add]').click();await page.locator('#arrival-token-0 [data-token-save]').click();
  await page.locator('[data-hf07-status]').filter({hasText:'2 characters saved'}).waitFor();report.interaction.push('Saved 飞机 as 2 characters; current group contains both.');save();
  await page.locator('#arrival-token-0 [data-token-practice]').click();await page.waitForURL('**/flashcards/**');await page.locator('[data-action=familiar]').waitFor();
  const returnLink=page.getByRole('link',{name:'Return to learning context'});assert.match(await returnLink.getAttribute('href'),/^\/scenarios\/travel\/airport\//);
  await page.getByRole('button',{name:'Listen to character',exact:true}).click();await page.waitForFunction(()=>['Playing recording.','Finished.'].includes(document.querySelector('[data-pronunciation-status]').textContent));await page.locator('[data-action=familiar]').click();report.interaction.push('New scenario starts real saved practice, plays the exact card reading and accepts a rating.');save();
  await returnLink.click();await page.waitForURL('**/scenarios/travel/airport/**');await page.locator('#arrival-token-0 a').first().click();await page.waitForURL('**/dictionary/**');const back=page.getByRole('link',{name:'Return to learning context'});await back.waitFor();assert.match(await back.getAttribute('href'),/^\/scenarios\/travel\/airport\//);report.interaction.push('Dictionary and practice return to the exact airport token context.');
  await page.goto(origin+'/scenarios/travel/hotel/');await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'hotel-390.png'),fullPage:true});report.status=report.errors.length?'FAIL':'PASS';save();
 }catch(error){report.errors.push(error.message);report.status='FAIL';save();}
 finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
 return report;
}
