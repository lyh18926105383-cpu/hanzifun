import {blogPage} from './pages/blog.mjs';
import fs from 'node:fs';
import {pronunciationButton} from './pronunciation.mjs';
import {escapeHtml as e} from './dictionary-data.mjs';
export const guides=[
 {path:'/blog/chinese-character-study-routine/',file:'study-routine.html',title:'A 12-Minute Chinese Character Study Routine',description:'Connect shape, sound, context and honest retrieval in a small daily Chinese study session.'},
 {path:'/blog/chinese-character-confusions/',file:'confusions.html',title:'Confusing Chinese Characters: Compare Shape, Sound and Use',description:'Use 快 and 块, 六 and 穴, and 星 and 醒 to identify and repair specific reading mistakes.'}
];
export const expandedCharacters={'快':'kuai.html','六':'liu.html','星':'xing.html'};
export function editorialHtml(file){
 const source=fs.readFileSync(new URL('./content/adsense/'+file,import.meta.url),'utf8');
 return source.replace(/\{\{audio:([^{}]+)\}\}/g,(_,text)=>pronunciationButton(text,{label:'Listen to example'}));
}
export function guideCards(){return '<div class="tile-grid">'+guides.map(g=>`<article class="tile"><h2><a href="${g.path}">${e(g.title)}</a></h2><p>${e(g.description)}</p></article>`).join('')+'</div>';}
export function editorialPages(){return [
 blogPage(guides),
 ...guides.map(g=>({...g,content:`<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Learning guides</a> / <span>${e(g.title)}</span></nav><article class="content-prose editorial-lesson"><h1>${e(g.title)}</h1><p>By HanziFun · Updated 28 October 2026</p>${editorialHtml(g.file)}</article></div>`}))
];}
export function enrichCharacter(page){
 const match=/^\/dictionary\/([^/]+)\/$/.exec(page.path),file=match&&expandedCharacters[match[1]];
 if(!file)return page;
 const guide=`<div class="content-prose">${editorialHtml(file)}</div>`;
 const marker='<section class="stroke-panel"';
 if(!page.content.includes(marker))throw Error('Missing stroke panel for expanded lesson '+page.path);
 return {...page,content:page.content.replace(marker,guide+marker)};
}
