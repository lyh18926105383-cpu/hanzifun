// Real browser checks against a local build or an explicitly supplied local Workers origin.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
const build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'/private/tmp/hf08-production');
const output=process.env.HF08_EVIDENCE_DIR||'/private/tmp/hf08-browser';
const {chromium}=await import(pathToFileURL(process.env.HF08_PLAYWRIGHT_MODULE||'/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const axe=fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
let server,origin=process.env.HF08_ORIGIN;
if(!origin){server=http.createServer((req,res)=>{try{
 const u=new URL(req.url,'http://localhost'),name=decodeURIComponent(u.pathname),file=path.resolve(build,'.'+(name.endsWith('/')?name+'index.html':name));if(!file.startsWith(build+'/')){res.writeHead(403).end();return;}
 let target=file,status=200;if(!fs.existsSync(target)||fs.statSync(target).isDirectory()){target=path.join(build,'404.html');status=404;}
 const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg'};
 let bytes=fs.readFileSync(target);const headers={'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'};
 if(/text|javascript|json|svg/.test(headers['Content-Type'])&&req.headers['accept-encoding']?.includes('gzip')){bytes=gzipSync(bytes);headers['Content-Encoding']='gzip';}
 res.writeHead(status,headers).end(bytes);
 }catch{res.writeHead(500).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;}
fs.mkdirSync(output,{recursive:true});
const routes=['/','/dictionary/','/dictionary/水/','/dictionary/发/','/dictionary/爱/','/dictionary/pinyin/','/stroke-order/','/pinyin-chart/','/academic/','/academic/hsk-2/','/academic/hsk-3/','/scenarios/travel/restaurant/','/scenarios/business/icebreakers/','/flashcards/','/account/','/search/'];
const report={date:new Date().toISOString(),origin,engine:'',axeVersion:'',checks:[],accessibility:[],layouts:[],http:[],performance:[],performanceConfig:{viewport:'390x844',deviceScaleFactor:1,latencyMs:150,downloadMbps:1.6,uploadKbps:750,cpuSlowdown:4,runs:3,cache:'disabled, fresh browser context',server:'Node gzip; external Workers run optional'},performanceMedians:[],errors:[],limitations:['Chrome desktop emulation; not physical Android/iOS, Safari or Firefox','CDP accessibility tree and keyboard checked; no spoken VoiceOver/NVDA session','CSS zoom and equivalent reflow viewport; not native browser zoom UI','Local lab LCP/CLS; not field p75 or INP','Local Node server is not Cloudflare; external Workers run is recorded separately']};
let browser;
try{
 browser=await chromium.launch({headless:true,channel:'chrome'});report.engine=browser.version();
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 for(const route of routes){
  const response=await p.goto(origin+route);assert.equal(response.status(),200);await p.waitForLoadState('networkidle');
  if(route==='/pinyin-chart/'){await p.locator('[id="syllable-l%C3%BC"] summary').click();}
  if(route==='/academic/hsk-3/')await p.locator('.hf07-entry details summary').first().click();
  await p.addScriptTag({content:axe});const result=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));report.axeVersion=result.testEngine.version;
  report.accessibility.push({route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>v.id)});
 }
 // Do not throw until the receipt has preserved every failing selector.
 assert.equal(report.accessibility.reduce((n,x)=>n+x.violations.length,0),0,'WCAG violations; see browser receipt');
 for(const route of routes.slice(0,13))for(const width of [360,390,768,1100,1440]){
  await p.setViewportSize({width,height:900});await p.goto(origin+route);await p.waitForLoadState('networkidle');
  const layout=await p.evaluate(()=>({client:innerWidth,scroll:document.documentElement.scrollWidth}));report.layouts.push({route,width,...layout});assert.ok(layout.scroll<=width+1,route+' overflow at '+width);
 }
 // CSS 200% zoom catches fixed widths; 720px reflow also exercises responsive breakpoints.
 for(const route of ['/','/dictionary/水/','/stroke-order/','/pinyin-chart/','/academic/hsk-3/']){
  await p.setViewportSize({width:1440,height:1000});await p.goto(origin+route);await p.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' CSS zoom overflow');
 }
 report.checks.push('13 core routes × 5 viewport widths; 5 templates CSS 200% zoom');
 await p.setViewportSize({width:390,height:844});await p.goto(origin+'/');
 await p.keyboard.press('Tab');assert.equal(await p.locator(':focus').textContent(),'Skip to content');await p.keyboard.press('Enter');assert.equal(await p.locator(':focus').getAttribute('id'),'main');
 await p.locator('[data-menu-toggle]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'true');await p.keyboard.press('Tab');assert.ok(await p.locator('#mobile-menu :focus').count());await p.keyboard.press('Escape');assert.equal(await p.locator(':focus').getAttribute('data-menu-toggle'),'');
 await p.locator('[data-hero-flip]').focus();await p.keyboard.press('Space');assert.equal(await p.locator('.card-front').getAttribute('aria-hidden'),'true');await p.keyboard.press('Space');assert.equal(await p.locator('.card-back').getAttribute('aria-hidden'),'true');
 for(const summary of await p.locator('#faq summary').all()){await summary.focus();await p.keyboard.press('Enter');}
 await p.screenshot({path:path.join(output,'home-390.png'),fullPage:true});await p.screenshot({path:path.join(output,'home-390-viewport.png')});
 await p.goto(origin+'/stroke-order/?char=水');await p.locator('[data-stroke=next]').focus();await p.keyboard.press('Enter');await p.locator('[data-stroke-status]').filter({hasText:'1 /'}).waitFor();
 assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://hanzifun.online/stroke-order/');
 await p.goto(origin+'/pinyin-chart/');await p.locator('[name=syllable]').fill('lv');await p.locator('[data-pinyin-filter] button').first().click();assert.ok(await p.locator('.pinyin-syllable:visible').count());
 await p.locator('.pinyin-syllable:visible summary').first().focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.pinyin-syllable:visible').first().getAttribute('open'),'');
 await p.screenshot({path:path.join(output,'pinyin-390.png'),fullPage:true});
 const cdp=await context.newCDPSession(p),tree=await cdp.send('Accessibility.getFullAXTree');assert.ok(tree.nodes.some(n=>n.role?.value==='heading'&&n.name?.value==='Mandarin Pinyin Chart'));assert.ok(tree.nodes.some(n=>n.role?.value==='textbox'));
 report.checks.push('Keyboard: skip link → main, mobile menu Escape/focus return, hero flip hidden semantics, six FAQ toggles, stroke next, pinyin filter and summary; CDP AX heading/textbox');
 await p.goto(origin+'/dictionary/发/?returnTo=%2Facademic%2Fhsk-2%2F');assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://hanzifun.online/dictionary/%E5%8F%91/');await p.locator('[data-reading-select]').selectOption({label:await p.locator('[data-reading-select] option').last().textContent()});
 await p.screenshot({path:path.join(output,'dictionary-390.png'),fullPage:true});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),n=await nojs.newPage();
 for(const route of ['/','/dictionary/水/','/pinyin-chart/','/academic/hsk-3/']){await n.goto(origin+route);assert.equal(await n.locator('main h1').count(),1);assert.ok(await n.locator('main [data-seo-lead]').isVisible());if(route==='/pinyin-chart/'){assert.equal(await n.locator('.pinyin-syllable').count(),410);assert.equal(await n.locator('.pinyin-syllable button:disabled').count(),1323);}if(route==='/dictionary/水/')assert.ok(await n.locator('.stroke-static').isVisible());}
 assert.equal(await n.locator('.hf07-entry').count(),646);await nojs.close();report.checks.push('No-JS answer paragraphs, dictionary static content, full pinyin and HSK lists');
 for(const route of ['/missing-hf08/','/dictionary/不存在/']){const response=await p.goto(origin+route);report.http.push({route,status:response.status()});assert.equal(response.status(),404);assert.match(await p.locator('meta[name=robots]').getAttribute('content'),/noindex/);}
 for(const route of ['/zh/','/story.html?lesson=cat-and-fish-01','/audio/tts-v1/076-8c46.mp3']){const response=await context.request.get(origin+route);report.http.push({route,status:response.status()});assert.equal(response.status(),200);}
 if(process.env.HF08_ORIGIN){
  for(const route of ['/index.html','/legacy/index.html','/legacy/story.html?lesson=cat-and-fish-01']){const response=await context.request.get(origin+route,{maxRedirects:0});report.http.push({route,status:response.status(),location:response.headers().location});assert.equal(response.status(),301);if(route.includes('lesson='))assert.match(response.headers().location,/lesson=cat-and-fish-01/);}
 }
 await p.goto(origin+'/');await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:path.join(output,'home-1440.png'),fullPage:true});
 // Three cold runs per key template at fixed emulated mobile/4G/4× CPU. Observer values are lab metrics only.
 if(!process.env.HF08_SKIP_PERFORMANCE)for(const route of ['/','/dictionary/水/','/pinyin-chart/','/academic/hsk-3/'])for(let run=1;run<=3;run++){
  const pc=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}),pp=await pc.newPage(),session=await pc.newCDPSession(pp);
  await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});await session.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});await session.send('Emulation.setCPUThrottlingRate',{rate:4});
  await pp.addInitScript(()=>{window.lab={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
  await pp.goto(origin+route);await pp.waitForLoadState('networkidle');await pp.waitForTimeout(1200);
  report.performance.push({route,run,...await pp.evaluate(()=>({...window.lab,domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,resources:performance.getEntriesByType('resource').map(x=>({name:new URL(x.name).pathname,transferSize:x.transferSize,encodedBodySize:x.encodedBodySize,decodedBodySize:x.decodedBodySize}))}))});await pc.close();
 }
 for(const route of [...new Set(report.performance.map(x=>x.route))]){const runs=report.performance.filter(x=>x.route===route),median=key=>runs.map(x=>x[key]).sort((a,b)=>a-b)[1];const row={route,lcpMs:median('lcp'),cls:median('cls')};report.performanceMedians.push(row);assert.ok(row.lcpMs>0&&row.lcpMs<=2500,'Lab LCP budget: '+route);assert.ok(row.cls<=0.1,'Lab CLS budget: '+route);}
 assert.deepEqual(report.errors,[]);
}catch(error){report.errors.push(error.stack||error.message);process.exitCode=1;}
finally{fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));console.log(JSON.stringify({output,engine:report.engine,axe:report.accessibility.map(x=>({route:x.route,violations:x.violations.length})),layouts:report.layouts.length,performance:report.performance.map(({route,run,lcp,cls})=>({route,run,lcp,cls})),errors:report.errors},null,2));}
