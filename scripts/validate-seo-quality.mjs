import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {parse} from 'parse5';
import {coreSeo,effectivePolicy,canonicalUrl,privateRoute,assertEditorialReady} from '../site/seo.mjs';
import {resolveRoutePolicy,releaseConfig} from '../site/routes.mjs';
import {assertPublicationReady as dictionaryReady} from '../site/dictionary-data.mjs';
import {assertPublicationReady as hskReady} from '../site/hsk-data.mjs';
export const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
export const nodes=n=>[n,...(n.childNodes||[]).flatMap(nodes)];
export const textContent=n=>(n.nodeName==='#text'?n.value:(n.childNodes||[]).map(textContent).join(''));
const text=n=>textContent(n).replace(/\s+/g,' ').trim();
const equal=(a,b,message)=>{if(a!==b)throw Error(message+`: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);};
const requireValue=(v,message)=>{if(!v)throw Error(message);};
const absolute=v=>{try{return /^https?:$/.test(new URL(v).protocol);}catch{return false;}};
export function validateJsonLd(document,expectedCanonical) {
 let count=0;
 for(const script of nodes(document).filter(n=>n.tagName==='script'&&attr(n,'type')?.trim().toLowerCase()==='application/ld+json')){
  const raw=textContent(script);let data;
  try{data=JSON.parse(raw);}catch(error){throw Error('Invalid JSON-LD syntax: '+error.message);}
  requireValue(!/[<>&\u2028\u2029]/.test(raw),'Unsafe JSON-LD script serialization');
  const roots=Array.isArray(data)?data:[data];
  for(const root of roots){
   equal(root?.['@context'],'https://schema.org','JSON-LD @context');
   const graph=root['@graph']||[root];requireValue(Array.isArray(graph)&&graph.length,'JSON-LD graph required');
   for(const item of graph){
    const type=item?.['@type'];requireValue(['WebPage','WebSite','BreadcrumbList','WebApplication','Article'].includes(type),'Unsupported or missing JSON-LD @type');
    if(type==='BreadcrumbList'){
     requireValue(Array.isArray(item.itemListElement)&&item.itemListElement.length>=2,'BreadcrumbList items required');
     item.itemListElement.forEach((x,i)=>{equal(x['@type'],'ListItem','Breadcrumb item type');equal(x.position,i+1,'Breadcrumb position');requireValue(typeof x.name==='string'&&x.name.trim()&&absolute(x.item),'Breadcrumb name/item required');});
     if(expectedCanonical)equal(item.itemListElement.at(-1).item,expectedCanonical,'Breadcrumb canonical');
    }else if(type==='Article'){
     for(const key of ['headline','dateModified','url','mainEntityOfPage'])requireValue(typeof item[key]==='string'&&item[key].trim(),'Article missing '+key);
     requireValue(absolute(item.url)&&absolute(item.mainEntityOfPage),'Article URL required');
     if(expectedCanonical){equal(item.url,expectedCanonical,'Article canonical');equal(item.mainEntityOfPage,expectedCanonical,'Article page canonical');}
     equal(item.headline,text(nodes(document).find(n=>n.tagName==='h1')),'Article visible headline');
     requireValue(['Person','Organization'].includes(item.author?.['@type'])&&typeof item.author.name==='string'&&item.author.name.trim(),'Article author required');
     equal(item.author.name,text(nodes(document).find(n=>attr(n,'data-editorial-author')!==undefined)),'Article visible author');
     for(const key of ['dateModified',...(item.datePublished?['datePublished']:[])])requireValue(/^\d{4}-\d{2}-\d{2}$/.test(item[key])&&new Date(item[key]+'T00:00:00Z').toISOString().slice(0,10)===item[key],'Article invalid date');
     if(item.datePublished)requireValue(item.datePublished<=item.dateModified,'Article publication after revision');
     requireValue(Array.isArray(item.citation)&&item.citation.length&&item.citation.every(absolute),'Article citations required');
    }else if(type==='WebApplication'){
     for(const key of ['name','description','applicationCategory','operatingSystem'])requireValue(typeof item[key]==='string'&&item[key].trim(),'WebApplication missing '+key);
     requireValue(absolute(item.url),'WebApplication URL required');
     requireValue((typeof item.inLanguage==='string'&&item.inLanguage.length)||(Array.isArray(item.inLanguage)&&item.inLanguage.length&&item.inLanguage.every(x=>typeof x==='string'&&x.length)),'WebApplication language required');
     if(item.offers){equal(item.offers['@type'],'Offer','Offer type');requireValue(Number.isFinite(Number(item.offers.price))&&/^[A-Z]{3}$/.test(item.offers.priceCurrency),'Offer price/currency required');}
    }else{
     for(const key of ['@id','url','name','inLanguage',...(type==='WebPage'?['description']:[])])requireValue(typeof item[key]==='string'&&item[key].trim(),`${type} missing ${key}`);
     requireValue(absolute(item.url)&&absolute(item['@id']),'JSON-LD absolute URL required');
     if(type==='WebPage'&&expectedCanonical){equal(item.url,expectedCanonical,'WebPage canonical');equal(item.name,text(nodes(document).find(n=>n.tagName==='title')).replace(/ · HanziFun$/,''),'WebPage visible title');equal(item.description,attr(nodes(document).find(n=>n.tagName==='meta'&&attr(n,'name')==='description'),'content'),'WebPage visible description');}
    }
   }
  }count++;
 }
 return count;
}
// Inspect text nodes, including collapsed details and alternate readings. Attributes,
// scripts and styles carry machine data and are deliberately outside this contract.
export function learnerText(node) {
 if (['script','style','template'].includes(node.tagName)) return '';
 // An exact, visibly identified author name is attribution, not pipeline prose.
 if(node.tagName==='span'&&attr(node,'data-editorial-author')!==undefined&&text(node)==='Codex')return 'AI-assisted author';
 return node.nodeName==='#text' ? node.value : (node.childNodes||[]).map(learnerText).join(' ');
}
export function assertLearnerCopy(document) {
 const body=nodes(document).find(n=>n.tagName==='body')||document;
 const copy=learnerText(body).replace(/\s+/g,' ');
 const internal=/\b(?:tier\s+[12]|human[- ]reviewed|human acceptance|human teaching acceptance|human language acceptance|Codex|quick review|listening review|sign[- ]off|signed off|pending|unavailable|unverified|todo|coming soon|stable ID|sense_id)\b|char:[0-9a-f]+|待审核|未完成|\b(?:teaching|template|editorial|memory) drafts?\b|\bHF-\d+\s+batch\b|\b(?:source\s+)?(?:row|page)\s*[:#]\s*\d+/i;
 const found=copy.match(internal);
 requireValue(!found,'Internal pipeline text in learner HTML: '+found?.[0]);
 for(const button of nodes(body).filter(n=>n.tagName==='button'&&attr(n,'data-audio-state')==='muted')) {
  requireValue(attr(button,'disabled')!==undefined&&attr(button,'aria-disabled')==='true','Muted audio must be disabled');
  requireValue(!!attr(button,'aria-label'),'Muted audio needs an accessible label');
 }
}
export function validatePage(html,route,{origin,environment='production',titles=new Map()}={}) {
 const document=parse(html),all=nodes(document),head=all.find(n=>n.tagName==='head'),main=all.filter(n=>n.tagName==='main');
 equal(main.length,1,'Exactly one main required');const h1=nodes(main[0]).filter(n=>n.tagName==='h1');equal(h1.length,1,'Exactly one H1 inside main');equal(all.filter(n=>n.tagName==='h1').length,1,'No H1 outside main');
 const inHead=nodes(head),titleNodes=inHead.filter(n=>n.tagName==='title');equal(titleNodes.length,1,'Exactly one title');const title=text(titleNodes[0]);requireValue(title.length>10,'Informative title required');
 requireValue(!titles.has(title)||titles.get(title)===route.path,'Duplicate title: '+title);titles.set(title,route.path);
 const descriptions=inHead.filter(n=>n.tagName==='meta'&&attr(n,'name')==='description');equal(descriptions.length,1,'Exactly one description');requireValue(attr(descriptions[0],'content')?.trim(),'Non-empty description');
 const expected=effectivePolicy({...route,...resolveRoutePolicy(route.path)},environment);dictionaryReady({...route,...resolveRoutePolicy(route.path)});assertEditorialReady({...route,...resolveRoutePolicy(route.path)});hskReady({...route,...resolveRoutePolicy(route.path)});
 equal(route.robots,expected.robots,'Manifest/effective policy robots');equal(route.indexing,expected.indexing,'Manifest/effective indexing');
 const robots=inHead.filter(n=>n.tagName==='meta'&&attr(n,'name')?.toLowerCase()==='robots');equal(robots.length,1,'Exactly one robots meta');equal(attr(robots[0],'content'),expected.robots,'Robots agrees with effective release policy');
 const canonical=canonicalUrl(route.path,origin),links=inHead.filter(n=>n.tagName==='link'&&attr(n,'rel')==='canonical');equal(links.length,1,'Exactly one canonical');equal(attr(links[0],'href'),canonical,'Self canonical normalized');
 const seo=coreSeo(route.path);
 if(seo){
  equal(title,seo.title+' · HanziFun','Core keyword-led title');equal(text(h1[0]),seo.h1,'Core topic H1');
  const siblings=h1[0].parentNode.childNodes,after=siblings.slice(siblings.indexOf(h1[0])+1).find(n=>n.tagName);
  requireValue(after?.tagName==='p'&&attr(after,'data-seo-lead')!==undefined,'Answer paragraph must immediately follow H1');
  requireValue(nodes(main[0]).find(n=>n.tagName==='p')===after,'First main paragraph must be the answer, not a banner or label');
  equal(text(after),seo.lead,'Data-backed direct answer');requireValue(!nodes(after).some(n=>attr(n,'hidden')!==undefined||attr(n,'aria-hidden')==='true'||/display\s*:\s*none|visibility\s*:\s*hidden/i.test(attr(n,'style')||'')),'Lead must be visible');
  requireValue(!/^(?:welcome|hello|this is a preview|content review)/i.test(text(after)),'Generic introduction forbidden');
 }
 equal(attr(all.find(n=>n.tagName==='html'),'lang'),'en','English template language');
 requireValue(!all.some(n=>attr(n,'hreflang')),'No unverified translation alternates');
 assertLearnerCopy(document);
 const jsonLd=validateJsonLd(document,canonical);requireValue(jsonLd>0,'Structured data required');
 if(route.path==='/'){
  const faq=all.find(n=>attr(n,'id')==='faq'),questions=nodes(faq).filter(n=>n.tagName==='details');equal(questions.length,6,'Six static FAQs');
  questions.forEach(q=>{requireValue(nodes(q).some(n=>n.tagName==='summary'&&text(n).endsWith('?')),'FAQ question required');requireValue(nodes(q).some(n=>n.tagName==='p'&&text(n).length>30),'FAQ answer required');requireValue(nodes(q).some(n=>n.tagName==='a'&&attr(n,'href')?.startsWith('/')),'FAQ related link required');});
 }
 return {document,canonical,title,jsonLd,core:!!seo};
}
function files(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(root,x.name)):[path.join(root,x.name)]);}
export function validateBuild(build) {
 const manifest=JSON.parse(fs.readFileSync(path.join(build,'route-manifest.json'))),origin=manifest.siteOrigin;
 equal(origin,releaseConfig.siteOrigin,'Build canonical origin');const titles=new Map(),errors=[],pages=[],expected=[];let jsonLd=0,allJsonLd=0,core=0;
 for(const route of manifest.routes.filter(r=>r.output&&r.path!=='/zh/')){
  try{
   const file=path.join(build,route.output),html=fs.readFileSync(file,'utf8'),result=validatePage(html,route,{origin,environment:manifest.environment,titles});pages.push(route.path);core+=Number(result.core);jsonLd+=result.jsonLd;
   if(route.indexing==='index'){requireValue(!privateRoute(route.path),'Private route in sitemap');expected.push(result.canonical);}
  }catch(error){errors.push(route.path+': '+error.message);}
 }
 // Parse every block in every built HTML file, including legacy and unlisted output.
 for(const file of files(build).filter(f=>f.endsWith('.html'))){try{allJsonLd+=validateJsonLd(parse(fs.readFileSync(file,'utf8')));}catch(e){errors.push(path.relative(build,file)+': '+e.message);}}
 const sitemap=fs.readFileSync(path.join(build,'sitemap.xml'),'utf8'),actual=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].replaceAll('&amp;','&'));
 if(JSON.stringify([...actual].sort())!==JSON.stringify([...expected].sort()))errors.push('Sitemap must equal the effective indexable canonical set');
 if(new Set(actual).size!==actual.length||actual.some(u=>new URL(u).search||new URL(u).hash))errors.push('Duplicate/parameter sitemap URL');
 const robots=fs.readFileSync(path.join(build,'robots.txt'),'utf8');if(/Disallow:\s*\//i.test(robots))errors.push('robots.txt prevents crawlers reading noindex');
 if(manifest.environment!=='production'&&!fs.readFileSync(path.join(build,'_headers'),'utf8').includes('X-Robots-Tag: noindex'))errors.push('Preview must protect legacy HTML via X-Robots-Tag');
 // The homepage's direct scripts/styles plus transitive static module imports.
 const home=parse(fs.readFileSync(path.join(build,'index.html'),'utf8')),homeNodes=nodes(home),js=new Set(),css=new Set();
 const addJs=url=>{const file=path.join(build,decodeURIComponent(url));if(js.has(file))return;js.add(file);for(const m of fs.readFileSync(file,'utf8').matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(m[1].startsWith('.'))addJs(path.posix.normalize(path.posix.join(path.posix.dirname(url),m[1])));}};
 homeNodes.filter(n=>n.tagName==='script'&&attr(n,'src')).forEach(n=>addJs(attr(n,'src')));
 homeNodes.filter(n=>n.tagName==='link'&&attr(n,'rel')==='stylesheet').forEach(n=>css.add(path.join(build,attr(n,'href'))));
 const imageFiles=homeNodes.filter(n=>n.tagName==='img'&&attr(n,'loading')!=='lazy').map(n=>path.join(build,attr(n,'src')));
 const budget={jsGzipBytes:[...js].reduce((n,f)=>n+gzipSync(fs.readFileSync(f)).length,0),cssGzipBytes:[...css].reduce((n,f)=>n+gzipSync(fs.readFileSync(f)).length,0),eagerImageBytes:[...new Set(imageFiles)].reduce((n,f)=>n+fs.statSync(f).size,0)};
 for(const [key,limit] of Object.entries({jsGzipBytes:100*1024,cssGzipBytes:50*1024,eagerImageBytes:400*1024}))if(budget[key]>limit)errors.push('Homepage budget exceeded: '+key+' '+budget[key]+' > '+limit);
 return {environment:manifest.environment,releaseId:manifest.releaseId,pages:pages.length,corePages:core,jsonLdBlocks:allJsonLd,englishJsonLdBlocks:jsonLd,sitemap:actual,budget,errors};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const build=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||process.argv[2]||'dist');
 const report=validateBuild(build);console.log(JSON.stringify(report,null,2));
 if(process.env.HF08_SEO_REPORT)fs.writeFileSync(process.env.HF08_SEO_REPORT,JSON.stringify(report,null,2)+'\n');
 if(report.errors.length)process.exitCode=1;
}
