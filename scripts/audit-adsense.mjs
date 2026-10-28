import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';
const build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'dist');
const all=n=>[n,...(n.childNodes||[]).flatMap(all)];
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const txt=n=>['nav','script','style','button','noscript'].includes(n.tagName)||n.attrs?.some(a=>a.name==='hidden')?'':n.nodeName==='#text'?n.value:(n.childNodes||[]).map(txt).join(' ');
const words=n=>(txt(n).match(/\b[A-Za-z]+(?:['’-][A-Za-z]+)*\b/g)||[]).length;
const manifest=JSON.parse(fs.readFileSync(path.join(build,'route-manifest.json')));
const inventory=manifest.routes.filter(r=>r.output&&r.path.startsWith('/dictionary/')&&r.character).map(r=>{
 const doc=parse(fs.readFileSync(path.join(build,r.output),'utf8')),main=all(doc).find(n=>n.tagName==='main');
 return {path:r.path,englishWordsInMain:words(main),indexing:r.indexing};
});
const selected=['/scenarios/','/dictionary/快/','/dictionary/六/','/dictionary/星/','/blog/chinese-character-study-routine/','/blog/chinese-character-confusions/'];
const errors=[],pages=selected.map(p=>{
 const r=manifest.routes.find(r=>r.path===p),doc=parse(fs.readFileSync(path.join(build,r.output),'utf8')),ns=all(doc),main=ns.find(n=>n.tagName==='main');
 const wordCount=words(main),navs=ns.filter(n=>n.tagName==='nav'&&attr(n,'aria-label')==='Main navigation').length;
 if(wordCount<800)errors.push(p+': fewer than 800 English words in main');
 if(navs!==1)errors.push(p+': duplicate primary navigation');
 for(const target of ['/privacy/','/terms/','/about/','/contact/'])if(!ns.some(n=>n.tagName==='a'&&attr(n,'href')===target))errors.push(p+': missing trust link '+target);
 return {path:p,englishWordsInMain:wordCount,primaryNavigationTrees:navs,indexing:r.indexing};
});
const publisher=JSON.parse(fs.readFileSync(new URL('../site/publisher.json',import.meta.url)));
const report={date:new Date().toISOString(),releaseId:manifest.releaseId,build,pages,characterPages:inventory.length,characterPagesUnder800:inventory.filter(r=>r.englishWordsInMain<800).length,inventory,errors,ownerActions:{operatorIdentityMissing:!publisher.operatorName,contactEmailMissing:!publisher.contactEmail,publisherIdMissing:!publisher.adsensePublisherId,cmpNotConfigured:true,accountAndTrafficChecksRequired:true},notes:['Word counts exclude navigation, scripts, hidden panels and buttons; this is an editorial target, not a Google approval threshold.','This checks a local build only. No AdSense account status, consent behavior, public deployment or Google approval is asserted.']};
const dest=process.argv.find(x=>x.startsWith('--output='))?.slice(9);if(dest)fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,inventory:undefined},null,2));if(errors.length)process.exitCode=1;
