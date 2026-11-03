import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'parse5';
import {culturalStudioPage,publishedCatalog} from '../site/pages/cultural-tools.mjs';
import {studioPreview,GALLERY_SCENES,GALLERY_DEFAULTS} from '../src/client/tools-gallery.mjs';
import {nodes,attr,assertLearnerCopy} from '../scripts/validate-seo-quality.mjs';
import {withCoreSeo} from '../site/seo.mjs';
const catalog=publishedCatalog(),allowed=new Set(catalog.items.map(c=>c.path));
test('tools gallery serves five disabled private forms, distinct themed scrolls and stable chapter/deep links',()=>{
 const page=withCoreSeo(culturalStudioPage()),tree=nodes(parse(page.content)),ids=tree.map(n=>attr(n,'id')).filter(Boolean);
 assert.equal(page.path,'/tools/');assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(tree.filter(n=>attr(n,'data-tools-path')!==undefined).map(n=>attr(n,'href')),GALLERY_SCENES.map(s=>'#tool-'+s.id));
 assert.equal(tree.filter(n=>attr(n,'data-studio-form')!==undefined).length,5);assert.equal(tree.filter(n=>attr(n,'data-local-form')!==undefined&&attr(n,'disabled')!==undefined).length,5);
 for(const s of GALLERY_SCENES){assert.ok(ids.includes('tool-'+s.id));assert.ok(tree.some(n=>n.tagName==='a'&&attr(n,'href')===s.path));assert.ok(tree.some(n=>n.tagName==='img'&&attr(n,'src')==='/site-assets/tools-art/'+s.art+'.svg'));const svg=fs.readFileSync(new URL('../site/public/tools-art/'+s.art+'.svg',import.meta.url),'utf8');assert.match(svg,/viewBox="0 0 1600 1000"/);assert.doesNotMatch(svg,/<script|<foreignObject|(?:href|src)="https?:/i);}
 const p=tree.find(n=>n.tagName==='p');assert.equal(attr(p,'data-seo-lead')!==undefined,true);assert.doesNotThrow(()=>assertLearnerCopy(parse('<body>'+page.content+'</body>')));
});
test('live gallery renderers use source-backed results, reject absent characters and escape transient private text',()=>{
 for(const s of GALLERY_SCENES){const html=studioPreview(s.kind,GALLERY_DEFAULTS[s.kind],catalog);for(const a of nodes(parse(html)).filter(n=>n.tagName==='a'))assert.ok(allowed.has(attr(a,'href')),attr(a,'href'));}
 const menu=studioPreview('menu',{text:'龙虾'},catalog);assert.equal(nodes(parse(menu)).filter(n=>n.tagName==='a').length,0);
 assert.match(studioPreview('teacher',{text:'林林',name:'Duplicate'},catalog),/already in the deck/);
 const unsafe=studioPreview('names',{style:'calm',displayName:'<img src=x onerror=1>'},catalog);assert.ok(unsafe.includes('&lt;img'));assert.ok(!nodes(parse(unsafe)).some(n=>n.tagName==='img'));
 const before=studioPreview('zodiac',{date:'2024-02-09'},catalog),after=studioPreview('zodiac',{date:'2024-02-10'},catalog);assert.ok(before.includes('癸卯'));assert.ok(after.includes('甲辰'));assert.notEqual(before,after);
 assert.match(studioPreview('tattoo',{text:'发'},catalog),/MORE THAN ONE READING/);
});
