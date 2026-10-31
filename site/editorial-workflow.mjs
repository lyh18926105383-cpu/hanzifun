import fs from 'node:fs';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';
import {escapeHtml as e,characters,readingFor,editorFor} from './dictionary-data.mjs';
import {characterReviewState} from './publication-review.mjs';
import {learningData} from './learning-data.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../content/editorial/'+name,import.meta.url),'utf8'));
export const editorialContent=read('articles.json');
export const worksheetContent=read('worksheets.json');
const validate=new Ajv({allErrors:true}).compile(read('article.schema.json'));
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function articleHash(article){const {status,review,published,...body}=article;return digest(body);}
export const articlePath=a=>'/blog/'+a.slug+'/';
const realDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
export function humanApproved(a){return a.review.acceptance==='approved'&&typeof a.review.reviewer==='string'&&!!a.review.reviewer.trim()&&realDate(a.review.date)&&typeof a.review.evidence==='string'&&!!a.review.evidence.trim()&&a.review.contentSha256===articleHash(a);}
export const publicArticle=a=>['reviewed','published'].includes(a.status)&&humanApproved(a);
export function validateEditorial(content=editorialContent,{release,library=learningData()}={}){
 if(!validate(content))throw Error('Editorial schema: '+JSON.stringify(validate.errors));
 const slugs=new Set();
 for(const a of content.articles){
  if(slugs.has(a.slug))throw Error('Duplicate article slug: '+a.slug);slugs.add(a.slug);
  if(!realDate(a.created)||!realDate(a.modified)||a.modified<a.created)throw Error('Invalid article dates: '+a.slug);
  if(a.published!==null&&(!realDate(a.published)||a.published<a.created||a.published>a.modified))throw Error('Invalid publication date: '+a.slug);
  const deck=library.decks.find(d=>d.slug===a.deck);if(!deck)throw Error('Unknown article deck: '+a.deck);
  for(const id of a.characterIds)if(!characters.some(c=>c.characterId===id)||!characterReviewState(id).accepted)throw Error('Unpublished article character: '+id);
  if(!a.characterIds.some(id=>deck.cardIds.some(card=>library.catalog.find(c=>c.cardId===card)?.characterId===id)))throw Error('Unrelated article deck: '+a.slug);
  const refs=new Set();for(const ref of a.references){if(refs.has(ref.id)||!realDate(ref.accessed)||!/^https:\/\//.test(ref.url))throw Error('Invalid article reference: '+a.slug);refs.add(ref.id);new URL(ref.url);}
  if(['reviewed','published'].includes(a.status)&&!humanApproved(a))throw Error('Missing or stale human article review: '+a.slug);
  if(a.status==='published'&&!a.published)throw Error('Published article needs fixed publication date: '+a.slug);
  const policy=release?.routes?.[articlePath(a)],published=(typeof policy==='object'?policy.status:policy)==='published';
  if(published&&(!publicArticle(a)||!a.published))throw Error('Unsafe editorial release: '+a.slug);
 }
 return {articles:content.articles.length,approved:content.articles.filter(publicArticle).length,hashes:Object.fromEntries(content.articles.map(a=>[a.slug,articleHash(a)]))};
}
export function validateWorksheets(content=worksheetContent,library=learningData()){
 if(content.schemaVersion!=='hf13-v1'||content.sets.length!==2)throw Error('Expected two worksheet sets');
 const seen=new Set();for(const set of content.sets){
  if(!['family','classroom'].includes(set.slug)||seen.has(set.slug)||set.audience!==set.slug||typeof set.title!=='string'||typeof set.instructions!=='string')throw Error('Invalid worksheet set');seen.add(set.slug);
  const deck=library.decks.find(d=>d.slug===set.deck);
  if(!deck||set.glyphs.length!==6||new Set(set.glyphs).size!==6)throw Error('Invalid worksheet deck');
  for(const glyph of set.glyphs){const c=characters.find(c=>c.glyph===glyph);if(!c||!characterReviewState(c.characterId).accepted||!deck.chars.includes(glyph))throw Error('Unreviewed worksheet character: '+glyph);}
 }
 return {sets:2,cards:12,paperSizes:['A4','Letter']};
}
const script='<script type="module" src="/site-assets/dictionary.hf04-v1.mjs"></script>';
function learningLinks(a){return `<aside class="hf04 editorial-links"><h2>Read, practise and save</h2><ul>${a.characterIds.map(id=>{const c=characters.find(c=>c.characterId===id);return `<li><a lang="zh-CN" href="/dictionary/${c.glyph}/">${c.glyph}</a> <button type="button" data-hf-save="${id}" aria-label="Save ${c.glyph}">Save ${c.glyph}</button></li>`;}).join('')}</ul><p role="status" data-hf-save-status></p><p><a class="button" href="/flashcards/decks/${a.deck}/">Practise the related set</a></p><p><a href="/worksheets/${a.category==='culture'?'classroom':'family'}/">Print character cards</a> · <a href="/scenarios/business/icebreakers/">Business introductions</a> · <a href="/account/">My Progress</a></p></aside>${script}`;}
export function articlePage(a,{environment='production'}={}){
 const show=publicArticle(a)||(environment!=='production'&&a.status==='draft');
 const preview=!publicArticle(a)?'<p class="editorial-preview">Editorial preview: AI-assisted draft. Language review is in progress.</p>':'';
 const body=show?`${preview}<p>By <span data-editorial-author>${e(a.author.name)}</span>${a.author.kind==='ai'?' (AI-assisted writing)':''} · Revised <time datetime="${a.modified}">${a.modified}</time>${humanApproved(a)?' · Reviewed by '+e(a.review.reviewer):''}${a.published?' · Published <time datetime="'+a.published+'">'+a.published+'</time>':''}</p><p class="lead">${e(a.lead)}</p>${a.image?'<img src="'+e(a.image.src)+'" alt="'+e(a.image.alt)+'">':''}${a.sections.map(s=>'<section><h2>'+e(s.heading)+'</h2>'+s.paragraphs.map(p=>'<p>'+e(p)+'</p>').join('')+'</section>').join('')}<section><h2>Sources and reading</h2><ul>${a.references.map(r=>'<li><a href="'+e(r.url)+'">'+e(r.title)+'</a> — '+e(r.scope)+' Accessed '+e(r.accessed)+'.</li>').join('')}</ul><p>Dictionary attribution: CC-CEDICT contributors / MDBG, CC BY-SA 4.0. <a href="/data-sources/">Locked versions and licenses</a>. Teaching activities and examples are original editorial material.</p></section>${learningLinks(a)}`:'<p>This guide is being prepared. <a href="/blog/">Read the available learning guides</a>.</p>';
 return {path:articlePath(a),title:a.title,description:a.description,editorialArticle:show&&publicArticle(a)?a:null,content:`<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Learning guides</a></nav><article class="content-prose"><h1>${e(a.title)}</h1>${body}</article></div>`};
}
export function articleCards(environment='production'){
 const articles=editorialContent.articles.filter(a=>publicArticle(a)||(environment!=='production'&&a.status==='draft'));
 return articles.length?'<div class="tile-grid">'+articles.map(a=>`<article class="tile"><h2><a href="${articlePath(a)}">${e(a.title)}</a></h2><p>${e(a.description)}</p></article>`).join('')+'</div>':'';
}
export function worksheetPages(){
 validateWorksheets();
 const attribution='<p class="worksheet-attribution">Readings/lexical data: CC-CEDICT contributors / MDBG, CC BY-SA 4.0. Memory cues: original HanziFun teaching material; they are not historical etymology. hanzifun.online/data-sources/</p>';
 return [{path:'/worksheets/',title:'Printable Chinese Character Cards for Families and Classrooms',description:'Two six-character sets with pinyin, meanings and memory cues. Print on A4 or Letter and continue practice on this device.',content:'<div class="container"><h1>Printable Chinese Character Cards</h1><p>Choose a family or classroom set. Each has six cards, matching online practice, and instructions for A4 and Letter paper.</p><div class="tile-grid">'+worksheetContent.sets.map(s=>'<article class="tile"><h2><a href="/worksheets/'+s.slug+'/">'+e(s.title)+'</a></h2><p>'+e(s.instructions)+'</p><p lang="zh-CN">'+s.glyphs.join(' · ')+'</p></article>').join('')+'</div></div>'},...worksheetContent.sets.map(set=>({path:'/worksheets/'+set.slug+'/',title:set.title+' · Printable Chinese Cards',description:set.instructions,content:`<div class="container worksheet-page"><nav class="breadcrumbs no-print" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/worksheets/">Printable cards</a></nav><h1>${e(set.title)}</h1><div class="no-print"><p>${e(set.instructions)}</p><p>Choose A4 or Letter in your print dialog, portrait, scale 100%, and turn off browser headers and footers. Six cards fit on one sheet. Cut along the borders. For screen reading, follow each character to its dictionary page.</p><button class="button" type="button" data-print>Print these cards</button><p><a href="/flashcards/decks/${set.deck}/">Practise this set online</a> · <a href="/worksheets/">Choose another set</a></p></div><div class="worksheet-cards">${set.glyphs.map(g=>{const c=characters.find(c=>c.glyph===g),ed=editorFor(c.characterId),r=readingFor(ed.readingId);return `<article class="worksheet-card"><h2 lang="zh-CN"><a href="/dictionary/${g}/">${g}</a></h2><p class="worksheet-pinyin">${e(r.pinyin.marked)}</p><p>${e(ed.meaning)}</p><p class="worksheet-cue">Memory cue: ${e(ed.mnemonic)}</p></article>`;}).join('')}</div>${attribution}</div>`}))];
}
