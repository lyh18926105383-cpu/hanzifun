import {characters,editorFor,readingFor,readJson,escapeHtml as e} from '../dictionary-data.mjs';
import {characterReviewState} from '../publication-review.mjs';
export const starter=readJson('data/editorial/starter-100.json');
export function validateStarter100(value=starter){
 const ids=value.groups.flatMap(g=>g.characterIds);
 if(ids.length!==100||new Set(ids).size!==100)throw Error('Starter collection must contain 100 unique characters');
 for(const id of ids)if(!characters.some(c=>c.characterId===id)||!characterReviewState(id).accepted)throw Error('Unapproved starter character: '+id);
 return ids;
}
export function starter100Page(){
 validateStarter100();
 return {path:'/dictionary/top-100/',title:'100 Chinese Characters to Start With: A Thematic Collection',description:'Explore 100 reviewed Chinese characters in five small thematic groups, with pinyin, meanings, dictionary examples and local practice. This is not a frequency ranking.',content:'<div class="container hf04"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/dictionary/">Dictionary</a></nav><h1>100 Chinese Characters to Start With</h1><p class="lead">A thematic starter collection, not a frequency ranking.</p><p>'+e(starter.selectionBasis)+'</p><p>Choose a few useful characters at a time. Each dictionary page links to examples, writing and practice that you can save on this device. The group labels organize this collection; they do not claim that every reading belongs only to that topic.</p>'+starter.groups.map(g=>'<section><h2>'+e(g.title)+' · '+g.characterIds.length+'</h2><ul>'+g.characterIds.map(id=>{const c=characters.find(c=>c.characterId===id),ed=editorFor(id),r=readingFor(ed.readingId);return '<li><a lang="zh-CN" href="/dictionary/'+c.glyph+'/">'+c.glyph+'</a> · '+e(r.pinyin.marked)+' · '+e(ed.meaning)+'</li>';}).join('')+'</ul></section>').join('')+'<p><a href="/flashcards/">Choose a practice set</a> · <a href="/pinyin-chart/">Listen to pinyin</a> · <a href="/dictionary/compare/">Compare similar characters</a> · <a href="/data-sources/">Sources and licenses</a></p><p>Readings and lexical data: CC-CEDICT contributors / MDBG, CC BY-SA 4.0; original teaching meanings and selection: HanziFun. Selection version '+e(starter.version)+', '+e(starter.date)+'.</p></div>'};
}
