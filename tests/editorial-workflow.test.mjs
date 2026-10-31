import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {editorialContent,worksheetContent,articleHash,articlePage,articlePath,validateEditorial,validateWorksheets,worksheetPages} from '../site/editorial-workflow.mjs';
import {applyDecisions} from '../scripts/review-editorial.mjs';
import {parse} from 'parse5';
import {validateJsonLd,assertLearnerCopy} from '../scripts/validate-seo-quality.mjs';
import {structuredData} from '../site/seo.mjs';
const copy=()=>{const value=structuredClone(editorialContent);for(const a of value.articles){a.status='draft';a.published=null;a.review={acceptance:'pending',reviewer:null,date:null,contentSha256:null,evidence:null};}return value;};
const decisions=content=>content.articles.map(a=>({slug:a.slug,acceptance:'approved',kind:'human',reviewer:'Synthetic test reviewer',date:'2026-10-31',contentSha256:articleHash(a),evidence:'Synthetic fixture only; never written to project data.'}));
test('HF13 content has three distinct directions and traceable approved character/deck links',()=>{
 assert.equal(validateEditorial().articles,3);assert.equal(validateEditorial().approved,3);
 assert.deepEqual(new Set(editorialContent.articles.map(a=>a.category)),new Set(['culture','travel-business','family']));
 for(const a of editorialContent.articles){assert.equal(a.status,'published');assert.ok(a.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>=500);}
});
test('HF13 dates, duplicates, unknown cards/decks, source URLs and image alt fail closed',()=>{
 for(const mutate of [c=>c.articles[0].created='2026-02-30',c=>c.articles[0].modified='2025-10-31',c=>c.articles[1].slug=c.articles[0].slug,c=>c.articles[0].deck='private-unavailable',c=>c.articles[0].characterIds[0]='char:ffff',c=>c.articles[0].references[0].url='javascript:alert(1)',c=>c.articles[0].image={src:'/site-assets/x.jpg',alt:''}]){const c=copy();mutate(c);assert.throws(()=>validateEditorial(c));}
});
test('HF13 human review applies to the exact content, preserves dates and rejects stale decisions',()=>{
 const c=copy(),d=decisions(c),reviewed=applyDecisions(c,d);assert.equal(validateEditorial(reviewed).approved,3);assert.equal(c.articles[0].status,'draft');assert.equal(reviewed.articles[0].published,null);
 for(const mutate of [c=>c.articles[0].sections[0].paragraphs[0]+=' Revised.',c=>c.articles[0].title+=' Revised',c=>c.articles[0].references[0].scope+=' Revised']){const c=copy();mutate(c);assert.throws(()=>applyDecisions(c,d),/stale/);}
 assert.throws(()=>applyDecisions(c,[...d,d[0]]),/duplicate/);
 assert.throws(()=>applyDecisions(c,[{...d[0],kind:'ai'}]),/incomplete/);
});
test('HF13 publication requires approval and fixed publication date; drafts and archived items cannot index',()=>{
 for(const status of ['draft','reviewed','published','archived']){const c=copy();c.articles[0].status=status;const release={routes:{[articlePath(c.articles[0])]:'published'}};assert.throws(()=>validateEditorial(c,{release}));}
 const c=applyDecisions(copy(),decisions(copy()));c.articles[0].status='published';c.articles[0].published='2026-10-31';assert.doesNotThrow(()=>validateEditorial(c,{release:{routes:{[articlePath(c.articles[0])]:'published'}}}));
 c.articles[0].lead+=' Changed';assert.throws(()=>validateEditorial(c),/stale/);
});
test('HF13 production excludes draft/archived prose; local draft previews include safe escaped prose',()=>{
 const a=copy().articles[0];assert.ok(!articlePage(a).content.includes(a.sections[0].paragraphs[0]));
 assert.ok(articlePage(a,{environment:'local'}).content.includes('Language review is in progress'));
 a.sections[0].paragraphs[0]='<script>alert(1)</script>';const local=articlePage(a,{environment:'local'}).content;assert.ok(local.includes('&lt;script&gt;'));assert.ok(!local.includes('<script>alert'));
 a.status='archived';assert.ok(!articlePage(a,{environment:'local'}).content.includes('&lt;script&gt;'));
});
test('HF13 approved article exposes dictionary/save/practice links and honest Article metadata',()=>{
 const c=applyDecisions(copy(),decisions(copy())),a=c.articles[0];a.published='2026-10-31';const page=articlePage(a);assert.equal((page.content.match(/data-hf-save=/g)||[]).length,a.characterIds.length);assert.match(page.content,/\/flashcards\/decks\/mid-autumn\//);
 const ld=structuredData(page,'https://hanzifun.online'+page.path,'https://hanzifun.online');assert.match(ld,/"@type":"Article"/);assert.match(ld,/"datePublished":"2026-10-31"/);assert.match(ld,/"name":"Codex"/);
});
test('HF13 two printable sets reuse six approved cards each with complete attribution',()=>{
 assert.equal(validateWorksheets().cards,12);const pages=worksheetPages();assert.equal(pages.length,3);for(const p of pages.slice(1)){assert.equal((p.content.match(/class="worksheet-card"/g)||[]).length,6);assert.match(p.content,/CC BY-SA 4.0/);assert.match(p.content,/data-print/);assert.match(p.content,/A4 or Letter/);}
 const bad=structuredClone(worksheetContent);bad.sets[0].glyphs[0]='𠮷';assert.throws(()=>validateWorksheets(bad));
});
test('HF13 production publishes approved articles and prints while browser data excludes full prose',()=>{
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'hf13-test-'));
 try{execFileSync(process.execPath,['scripts/build-site.js'],{env:{...process.env,HF_SITE_ENV:'production',HF_BUILD_OUTPUT_DIR:output},stdio:'pipe'});
 const map=fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');
 for(const a of editorialContent.articles){assert.ok(map.includes(articlePath(a)));const html=fs.readFileSync(path.join(output,articlePath(a),'index.html'),'utf8');assert.match(html,/index,follow/);assert.ok(html.includes(a.sections[0].heading));}
 for(const f of fs.readdirSync(output,{recursive:true}).filter(f=>/\.(?:js|mjs)$/.test(f))){const body=fs.readFileSync(path.join(output,f),'utf8');for(const a of editorialContent.articles)assert.ok(!body.includes(a.sections[0].paragraphs[0]),'Article prose leaked into browser data '+f);}
 for(const slug of ['family','classroom'])assert.ok(map.includes('/worksheets/'+slug+'/'));
 }finally{fs.rmSync(output,{recursive:true,force:true});}
});

test('HF13 legitimate AI author byline is allowed while internal pipeline prose is still rejected',()=>{
 assert.doesNotThrow(()=>assertLearnerCopy(parse('<body><span data-editorial-author>Codex</span></body>')));
 assert.throws(()=>assertLearnerCopy(parse('<body><p>Codex pending review</p></body>')));
 assert.throws(()=>assertLearnerCopy(parse('<body><span data-editorial-author>Codex pending review</span></body>')));
 const a=applyDecisions(copy(),decisions(copy())).articles[0];a.published='2026-10-31';const p=articlePage(a),canonical='https://hanzifun.online'+p.path;
 const document=parse('<html><head><title>'+a.title+' · HanziFun</title><meta name="description" content="'+a.description+'">'+structuredData(p,canonical,'https://hanzifun.online')+'</head><body>'+p.content+'</body></html>');
 assert.doesNotThrow(()=>validateJsonLd(document,canonical));
});
