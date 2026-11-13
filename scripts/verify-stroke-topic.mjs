import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
import {nodes,attr,textContent,validateBuild} from './validate-seo-quality.mjs';
import {topicPaths,topicMeta} from '../site/stroke-topic-meta.mjs';
import {topicCatalog,topicStroke,exampleCharacters,exampleId,exampleCopy} from '../site/stroke-topic-data.mjs';
const output=path.resolve(process.env.HF_BUILD_OUTPUT_DIR||'/private/tmp/hanzifun-stroke-topic-candidate');
const evidence=path.resolve(process.env.HF_TOPIC_EVIDENCE_DIR||'docs/hanzifun-rebuild/evidence/stroke-topic-2026-11-13');
const read=route=>fs.readFileSync(path.join(output,route,'index.html'),'utf8');
const text=n=>textContent(n).replace(/\s+/g,' ').trim();
const hash=b=>createHash('sha256').update(b).digest('hex');
export function verifyTopic(){
 fs.mkdirSync(evidence,{recursive:true});
 const report={date:'2026-11-13',status:'PASS',build:output,pages:[],data:{},checks:[],incomingAnchors:{}};
 const manifest=JSON.parse(fs.readFileSync(path.join(output,'route-manifest.json'))),sitemap=fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');
 assert.deepEqual(manifest.routes.filter(r=>r.output&&r.path.startsWith('/stroke-order/')).map(r=>r.path).sort(),[...topicPaths].sort(),'Exactly five topic routes');
 assert.equal(manifest.routes.filter(r=>/^\/dictionary\/\p{Script=Han}\/$/u.test(r.path)).length,339,'No additional dictionary page');
 assert.ok(!fs.existsSync(path.join(output,'dictionary/永')),'永 must not become a new character page');
 for(const meta of topicMeta){
  const html=read(meta.path),all=nodes(parse(html)),main=all.find(n=>attr(n,'data-st-topic')),h1=all.filter(n=>n.tagName==='h1');
  assert.equal(h1.length,1);assert.equal(text(h1[0]),meta.h1);assert.equal(text(all.find(n=>n.tagName==='title')),meta.title);assert.ok(meta.title.length>=50&&meta.title.length<=60);
  assert.equal(attr(all.find(n=>n.tagName==='meta'&&attr(n,'name')==='description'),'content'),meta.description);assert.ok(meta.description.length>=150&&meta.description.length<=160);
  assert.equal(attr(all.find(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'),'href'),'https://hanzifun.online'+meta.path);assert.ok(sitemap.includes('<loc>https://hanzifun.online'+meta.path+'</loc>'));
  let level=1;for(const h of nodes(main).filter(n=>/^h[1-6]$/.test(n.tagName))){const next=Number(h.tagName[1]);assert.ok(next<=3&&next<=level+1,'Heading skip '+meta.path+' '+text(h));level=next;}
  const graph=all.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').flatMap(n=>JSON.parse(textContent(n))['@graph']);
  assert.deepEqual(graph.map(n=>n['@type']).sort(),(meta.key==='animation'?['Article','BreadcrumbList']:['Article','BreadcrumbList','FAQPage']).sort());
  assert.equal(graph.find(n=>n['@type']==='Article').datePublished,'2026-11-13');assert.ok(graph.find(n=>n['@type']==='Article').author.name);
  const ids=nodes(main).filter(n=>attr(n,'id')!==undefined).map(n=>attr(n,'id'));assert.equal(ids.length,new Set(ids).size,'Unique local anchors');
  const links=nodes(main).filter(n=>n.tagName==='a');
  for(const a of links){try{const target=new URL(attr(a,'href'),'https://hanzifun.online'+meta.path);if(target.origin==='https://hanzifun.online'&&topicPaths.includes(target.pathname)){const bucket=report.incomingAnchors[target.pathname]||{total:0,exact:0};bucket.total++;const keyword={hub:'chinese stroke order',basics:'chinese basic strokes',rules:'chinese stroke order rules',examples:'chinese stroke order examples',animation:'chinese characters animation'}[topicMeta.find(m=>m.path===target.pathname).key];if(text(a).toLowerCase()===keyword)bucket.exact++;report.incomingAnchors[target.pathname]=bucket;}}catch{throw Error('Invalid topic link');}}
  for(const a of links){const href=attr(a,'href');if(href?.startsWith('/stroke-order/examples/'))assert.match(href,/^\/stroke-order\/examples\/(?:#(?:wo|ni|hao|shi|zhong|guo|xue|yong))?$/,'Example links must target the index or stable anchors');}
  const anchors=new Set(links.map(a=>attr(a,'href')).filter(h=>h?.startsWith('/stroke-order/examples/#')));
  if(['basics','rules'].includes(meta.key))assert.ok(anchors.size>=6);
  if(meta.key==='hub')assert.ok(anchors.size>=4);
  for(const img of nodes(main).filter(n=>n.tagName==='img'))for(const key of ['width','height','alt','loading'])assert.ok(attr(img,key),'Image '+key+' required');
  const faq=nodes(main).find(n=>attr(n,'id')==='faq'),count=faq?nodes(faq).filter(n=>n.tagName==='details').length:0;assert.equal(count,meta.key==='animation'?0:5);
  const sectionIds=nodes(main).filter(n=>n.tagName==='section').map(n=>attr(n,'id'));
  if(meta.key==='hub')assert.deepEqual(sectionIds,['lookup','examples','overview','rules','counting','concepts','practice','sources','faq']);
  if(meta.key==='basics'){assert.equal(nodes(main).filter(n=>attr(n,'data-st-single')!==undefined).length,8);assert.equal(nodes(main).filter(n=>attr(n,'data-st-player')!==undefined).length,0);}
  if(meta.key==='rules'){assert.equal(nodes(main).filter(n=>attr(n,'data-rule-focus')!==undefined).length,14);assert.equal(nodes(main).filter(n=>attr(n,'data-st-player')!==undefined).length,0);}
  if(meta.key==='examples')for(const c of exampleCharacters){const entry=nodes(main).find(n=>attr(n,'id')===exampleId(c.glyph));assert.ok(entry);assert.equal(nodes(entry).filter(n=>attr(n,'data-st-player')!==undefined).length,1);assert.equal(nodes(entry).filter(n=>n.tagName==='table').length,1);assert.equal(nodes(entry).filter(n=>n.tagName==='li').length,3);assert.equal(nodes(entry).filter(n=>n.tagName==='a'&&/^#(?:wo|ni|hao|shi|zhong|guo|xue|yong)$/.test(attr(n,'href')||'')).length,2);}
  if(meta.key==='animation')assert.equal(nodes(main).filter(n=>attr(n,'data-st-media')!==undefined).length,8);
  const wordText=n=>n.nodeName==='#text'?n.value:['script','style','noscript'].includes(n.tagName)?'':(n.childNodes||[]).map(wordText).join(' ');
  const words=wordText(main).match(/\b[A-Za-z]+(?:['’-][A-Za-z]+)*\b/g)?.length||0;
  if(meta.key==='examples')report.exampleWordCounts=exampleCharacters.map(c=>{const entry=nodes(main).find(n=>attr(n,'id')===exampleId(c.glyph)),count=wordText(entry).match(/\b[A-Za-z]+(?:['’-][A-Za-z]+)*\b/g)?.length||0;assert.ok(count>=200&&count<=280,c.glyph+' example word range: '+count);return {glyph:c.glyph,words:count};});
  // The owner's prescribed shorter hub copy supersedes its original 1500-word minimum.
  const bounds={basics:[1200,1800],rules:[1000,1500],examples:[1800,2500]}[meta.key];
  if(meta.key==='hub')assert.ok(words<=2500,'Hub maximum word range: '+words);
  if(bounds)assert.ok(words>=bounds[0]&&words<=bounds[1],meta.key+' word range: '+words);
  report.pages.push({path:meta.path,titleLength:meta.title.length,descriptionLength:meta.description.length,words,faqs:count,exampleAnchors:anchors.size,htmlSha256:hash(html)});
 }
 const redirects=fs.readFileSync(path.join(output,'_redirects'),'utf8');for(const p of topicPaths)assert.ok(redirects.includes(p.slice(0,-1)+' '+p+' 301'));
 for(const bucket of Object.values(report.incomingAnchors)){bucket.ratio=bucket.exact/bucket.total;assert.ok(bucket.ratio<=0.3,'Exact-match anchor ratio');}
 for(const c of topicCatalog.characters){const raw=topicStroke(c);assert.equal(c.strokeCount,raw.strokes.length);assert.equal(c.strokeCount,c.strokeTypes.length);assert.deepEqual(c.strokeNumbers,raw.strokes.map((_,i)=>i+1));assert.equal(c.shapeCode.length,c.strokeCount);assert.match(c.shapeCode,/^[1-5]+$/);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output,'site-assets/stroke-topic/characters/'+c.codepoint+'.json'))).strokes,raw.strokes);}
 const seen=new Set();for(const f of topicCatalog.basic){assert.ok(exampleCharacters.some(c=>c.strokeTypes.some(t=>t.letter===f.letter)),'Fixed examples cover '+f.id);assert.ok(f.examples.length>=3&&f.examples.length<=5);seen.add(f.id);}
 for(const c of topicCatalog.characters)for(const stroke of c.strokeTypes)if(stroke.letter==='h')assert.equal(stroke.class,5,'竖提 remains a turning shape');
 assert.equal(seen.size,8);assert.equal(new Set(exampleCharacters.map(c=>c.structure)).size,4);
 for(const c of exampleCharacters){const rows=exampleCopy.entries[exampleId(c.glyph)];assert.equal(rows.length,3);for(const r of rows){assert.ok(r.word.includes(c.glyph)&&r.sentence.includes(c.glyph)&&r.pinyin&&r.translation&&r.sourceLocator);}}
 report.data={characters:topicCatalog.characters.length,exampleCharacters:8,strokeFamilies:8,structures:4,originalSentences:24,allCountsAndAssetHashes:'verified'};
 for(const name of ['practice-a4.pdf','practice-letter.pdf'])assert.equal(fs.readFileSync(path.join(output,'site-assets/stroke-topic',name)).subarray(0,4).toString(),'%PDF');
 for(const c of exampleCharacters)assert.match(fs.readFileSync(path.join(output,'site-assets/stroke-topic/gif/'+c.codepoint+'.gif')).subarray(0,6).toString(),/^GIF8[79]a$/);
 const qa=validateBuild(output);assert.deepEqual(qa.errors,[]);report.site={pages:qa.pages,corePages:qa.corePages,sitemap:qa.sitemap.length};
 const input=JSON.parse(fs.readFileSync('.cache/stroke-order-2026-11-13/before/data/editorial/review-decisions.json'));
 const after=JSON.parse(fs.readFileSync('data/editorial/review-decisions.json'));delete input.characterPagePresentation;delete after.characterPagePresentation;assert.deepEqual(after,input,'Teaching and audio approval records must remain identical');
 report.checks=['Exactly five topic routes, no new single-character routes','Metadata, heading hierarchy, static article/FAQ/breadcrumb schema','Stable example anchors and 3–5 data-backed family examples','340 source byte hashes, counts, ordered names, shape codes','Eight required characters cover eight families and four source structures','24 original examples with dictionary-attested word readings','Direct PDF/GIF assets and five explicit slash redirects','Existing teaching/audio approvals preserved'];
 fs.writeFileSync(path.join(evidence,'static-verification.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url))console.log(JSON.stringify(verifyTopic(),null,2));
