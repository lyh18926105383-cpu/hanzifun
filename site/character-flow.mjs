// One static learning flow for the 339 published characters. No new content source.
import {readJson,escapeHtml as e,kanji} from './dictionary-data.mjs';
import {allCharacters,findReading,membership} from './hsk-data.mjs';
import {characterReviewState,reviewInputs} from './publication-review.mjs';
import {resolveRoutePolicy} from './routes.mjs';
import {pronunciationButton as listen} from './pronunciation.mjs';
import {strokePanel} from './components/stroke-order.mjs';
import {withCoreSeo} from './seo.mjs';
import {characterMeaning} from './character-meaning.mjs';
export const publishedCharacters=allCharacters.filter(c=>resolveRoutePolicy('/dictionary/'+c.glyph+'/').status==='published'&&characterReviewState(c.characterId).accepted);
const byGlyph=new Map(publishedCharacters.map(c=>[c.glyph,c]));
const teaching={get:g=>{const id=byGlyph.get(g)?.characterId;return [...reviewInputs.coreTeaching.entries,...reviewInputs.supplementalTeaching.entries].find(x=>x.characterId===id);},values:()=>[...reviewInputs.coreTeaching.entries,...reviewInputs.supplementalTeaching.entries][Symbol.iterator]()};
const strokeAssets=[...readJson('data/strokes/manifest.json'),...readJson('data/hsk/lexicon.json').strokes];
const url=g=>'/dictionary/'+encodeURIComponent(g)+'/';
const primary=c=>findReading(teaching.get(c.glyph)?.readingId||c.primaryReadingId);
export const publishedLink=g=>byGlyph.has(g)?`<a lang="zh-CN" href="${url(g)}">${e(g)}</a>`:`<span lang="zh-CN">${e(g)}</span>`;
const variants={'人':['人','亻'],'水':['水','氵','氺'],'火':['火','灬'],'心':['心','忄','⺗'],'手':['手','扌'],'衣':['衣','衤'],'示':['示','礻'],'犬':['犬','犭'],'言':['言','讠'],'食':['食','饣'],'金':['金','钅'],'糸':['糸','纟'],'玉':['玉','王'],'艸':['艸','艹']};
const componentLabel={'亻':['rén','person'],'氵':['shuǐ','water'],'氺':['shuǐ','water'],'灬':['huǒ','fire'],'忄':['xīn','heart'],'扌':['shǒu','hand'],'讠':['yán','speech'],'纟':['sī','silk'],'钅':['jīn','metal'],'艹':['cǎo','grass'],'礻':['shì','spirit'],'衤':['yī','clothing'],'犭':['quǎn','dog'],'饣':['shí','food']};
const idsOperators=/[⿰-⿿]/u;
export function visibleParts(c){
 if(c.structure==='single-component'||teaching.get(c.glyph)?.structureReview?.layout==='single-component')return [];
 if(c.components.completeness!=='complete')return [];
 const parts=[...c.components.ids].filter(g=>!idsOperators.test(g)&&g!==c.glyph&&!/[？?\s]/u.test(g));
 return parts.length>=2?parts:[];
}
function mentions(c,g,seen=new Set()){
 if(seen.has(c.glyph))return false;seen.add(c.glyph);
 const forms=variants[g]||[g],leaves=[...c.components.ids];
 return forms.some(f=>leaves.includes(f))||leaves.some(p=>byGlyph.has(p)&&p!==c.glyph&&mentions(byGlyph.get(p),g,seen));
}
export function derivativesFor(c){
 const preferred={'木':'林森休本','人':'休从众你','水':'河海洗泳','火':'炎秋灯热','山':'出岁岛岩'}[c.glyph]||'';
 return publishedCharacters.filter(x=>x.glyph!==c.glyph&&mentions(x,c.glyph)).sort((a,b)=>{
  const rank=g=>preferred.includes(g)?preferred.indexOf(g)-100:0;
  return rank(a.glyph)-rank(b.glyph)||a.strokeCount-b.strokeCount||a.glyph.localeCompare(b.glyph,'zh');
 }).slice(0,4);
}
export function familyFor(c){
 const key=g=>Object.entries(variants).find(([,v])=>v.includes(g))?.[0]||g;
 return publishedCharacters.filter(x=>x.glyph!==c.glyph&&key(x.radical)===key(c.radical)).sort((a,b)=>a.strokeCount-b.strokeCount||a.glyph.localeCompare(b.glyph,'zh')).slice(0,8);
}
function component(g){
 const c=byGlyph.get(g),ed=teaching.get(g),label=c?[primary(c).pinyin.marked,ed.meaning]:componentLabel[g]||['','visible component'];
 const body=`<span class="hf-char-component-glyph" lang="zh-CN">${e(g)}</span><span class="hf-char-component-pinyin" lang="zh-Latn-pinyin">${e(label[0])}</span><small class="hf-char-component-meaning">${e(label[1])}</small>`;
 return c?`<a class="hf-char-component" href="${url(g)}">${body}</a>`:`<span class="hf-char-component">${body}</span>`;
}
const plain=s=>s.normalize('NFD').replace(/[\u0300-\u0304\u0306-\u036f]/g,'').replaceAll('u\u0308','ü').toLowerCase();
const syllableSet=new Set(readJson('data/pinyin/syllables.json').map(s=>s.spelling));
const accent=/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u;
// Split joined pinyin words while preserving original punctuation/spacing and matching readings.
export function alignSentence(text,pinyin){
 const hanzi=[...text].filter(g=>/\p{Script=Han}/u.test(g));
 const pieces=[...pinyin.normalize('NFC').matchAll(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹê]+|[^a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹê]+/giu)].map(m=>m[0]);
 const memo=new Map();
 const solve=(part,offset,index)=>{
  const key=part+':'+offset+':'+index;if(memo.has(key))return memo.get(key);
  if(part===pieces.length)return index===hanzi.length?[]:null;
  const word=pieces[part];if(!/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹê]+$/iu.test(word)){
   const rest=solve(part+1,0,index),answer=rest&&[{text:word},...rest];memo.set(key,answer);return answer;
  }
  if(offset===word.length)return solve(part+1,0,index);
  if(index>=hanzi.length)return null;
  const c=byGlyph.get(hanzi[index]);
  const known=c?c.readingId.map(id=>plain(findReading(id).pinyin.marked)):[];
  const candidates=[];
  for(let end=Math.min(word.length,offset+6);end>offset;end--){
   const s=word.slice(offset,end),normalized=plain(s),marks=[...s].filter(x=>accent.test(x)).length;
   if(marks>1||!syllableSet.has(normalized)&&!['r','ng','n','m','ê'].includes(normalized))continue;
   // A toned syllable cannot absorb the initial of the next syllable as an untoned suffix.
   candidates.push({s,end,score:known.includes(normalized)?10:0});
  }
  candidates.sort((a,b)=>b.score-a.score||b.s.length-a.s.length);
  for(const {s,end} of candidates){const rest=solve(part,end,index+1);if(rest){const answer=[{text:s,glyph:hanzi[index],index},...rest];memo.set(key,answer);return answer;}}
  memo.set(key,null);return null;
 };
 const aligned=solve(0,0,0);
 if(!aligned)throw Error('Unable to align sentence pinyin: '+text+' / '+pinyin);
 return aligned;
}
export function sentenceMarkup(text,pinyin,glyph){
 const zh=[...text].map(g=>g===glyph?`<strong class="hf-char-highlight">${e(g)}</strong>`:e(g)).join('');
 const py=alignSentence(text,pinyin).map(t=>t.glyph===glyph?`<strong class="hf-char-highlight">${e(t.text)}</strong>`:e(t.text)).join('');
 return {zh,py};
}
export function wordsFor(c){
 const rows=[teaching.get(c.glyph),...teaching.values()].filter(ed=>ed.word.includes(c.glyph));
 return rows.filter((ed,i)=>rows.findIndex(x=>x.word===ed.word)===i).slice(0,4);
}
export function sentencesFor(c){
 const own=teaching.get(c.glyph),tone=primary(c).pinyin.marked.toLowerCase();
 const rows=[own,...teaching.values()].filter(ed=>ed.sentence.includes(c.glyph)&&(ed===own||alignSentence(ed.sentence,ed.pinyin).filter(t=>t.glyph===c.glyph).every(t=>t.text.toLowerCase()===tone||'一不'.includes(c.glyph))));
 return rows.filter((ed,i)=>rows.findIndex(x=>x.sentence===ed.sentence)===i).slice(0,3);
}
function reference(c){
 const ed=teaching.get(c.glyph),ids=[ed.readingId,...c.readingId.filter(id=>id!==ed.readingId)],k=kanji.find(x=>x.characterId===c.characterId&&x.status==='verified');
 return `<details class="hf-char-reference"><summary>Information · readings &amp; forms</summary>${ids.length>1?`<label for="reading-select">Choose a reading and sense</label><select id="reading-select" data-reading-select>${ids.map(id=>`<option value="${e(id)}"${id===ed.readingId?' selected':''}>${e(findReading(id).pinyin.marked)} — ${e(findReading(id).senses[0])}</option>`).join('')}</select>`:''}${ids.map((id,i)=>{const r=findReading(id),forms=c.scriptRelations.filter(x=>x.readingId===id);return `<section data-reading-panel="${e(id)}"${i?' hidden':''}><h2>${e(r.pinyin.marked)}</h2><p>${e(r.senses.join('; '))}</p>${i?'<p>The words and sentences in this lesson use the teaching reading; this alternative has its own sense context.</p>':''}${listen(c.glyph,{numeric:r.pinyin.numeric,readingId:id,label:'Listen to '+r.pinyin.marked})}<dl><dt>Traditional Chinese</dt><dd lang="zh-Hant">${e([...new Set(forms.map(x=>x.traditional))].join(' / ')||r.traditionalForms?.join(' / ')||c.glyph)}</dd><dt>Radical</dt><dd lang="zh-CN">${e(c.radical)}</dd><dt>Stroke count</dt><dd>${c.strokeCount} · mainland Chinese form</dd><dt>Structure</dt><dd>${e(ed.structureReview?.layout||c.structure)}</dd>${k?`<dt>Japanese Kanji</dt><dd lang="ja">${e(k.japaneseGlyph)} · Japanese readings and uses differ.</dd>`:''}</dl></section>`;}).join('')}${ids.length>1?`<noscript><h2>Other readings</h2>${ids.slice(1).map(id=>`<p>${e(findReading(id).pinyin.marked)} · ${e(findReading(id).senses.join('; '))}</p>`).join('')}</noscript>`:''}${ed.structureReview?.description?'<p>'+e(ed.structureReview.description)+'</p>':''}<p>Unicode U+${c.characterId.slice(5).toUpperCase()} · <a href="/pinyin-chart/">Pinyin Chart</a></p></details>`;
}
export function characterFlowPage(c){
 const ed=teaching.get(c.glyph);if(!ed)throw Error('Unpublished character flow: '+c.glyph);
 const r=primary(c),parts=visibleParts(c),derived=derivativesFor(c),family=familyFor(c),asset=strokeAssets.find(x=>x.characterId===c.characterId);
 const meaning=characterMeaning(c,ed,r);
 const number=publishedCharacters.findIndex(x=>x.characterId===c.characterId)+1;
 const hsk=membership.some(m=>m.level==='1'&&m.glyph.includes(c.glyph));
 const sign=s=>`<span class="hf-char-formula-sign" aria-hidden="true">${s}</span>`;
 const anatomy=parts.length?`<div class="hf-char-formula" aria-label="Visible components of ${e(c.glyph)}">${parts.map(component).join(sign('+'))}${sign('=')}${component(c.glyph)}</div>`:derived.length?`<div class="hf-char-formula" aria-label="Characters built with ${e(c.glyph)}">${component(c.glyph)}${sign('→')}<div class="hf-char-derivatives">${derived.map(d=>component(d.glyph)).join('')}</div></div>`:`<p>Practise ${e(c.glyph)} as one complete shape. Follow its ${c.strokeCount} strokes, then find it in the words below.</p>`;
 const heroListen=listen(c.glyph,{numeric:r.pinyin.numeric,readingId:r.readingId,label:'Listen'}).replace(/(<\/span>) [^<]*(<\/button>)/,'$1 Listen$2');
 const body=`<div class="container hf04 hf-char-page"><nav class="hf-char-breadcrumb" aria-label="Breadcrumb"><a href="/">Explore</a> <span aria-hidden="true">›</span> <a href="/dictionary/">Characters</a> <span aria-hidden="true">›</span> <span lang="zh-CN">${e(c.glyph)}</span> (${e(r.pinyin.marked)})</nav><h1>Character</h1><div class="hf-char-layout"><article class="hf-char-main"><div class="hf-char-tags"><span>CHARACTER NO. ${String(number).padStart(3,'0')}</span>${hsk?'<span>HSK 1</span>':''}</div><section class="hf-char-hero" aria-label="Character and meaning"><div class="hf-char-glyph-column"><div class="hf-char-stage"><span class="hf-char-glyph" lang="zh-CN"><span class="sr-only">${e(c.glyph)}</span><img class="hf-char-glyph-image" src="/site-assets/character-glyph/${c.characterId.slice(5)}.svg" alt="" aria-hidden="true" width="224" height="224" data-glyph="${e(c.glyph)}" data-stroke-source-sha256="${asset.sha256}"></span><span class="hf-char-seal" aria-hidden="true">字</span></div><div class="hf-char-pronunciation"><em class="hf-char-pinyin" lang="zh-Latn-pinyin">${e(r.pinyin.marked)}</em>${heroListen}<button class="hf-char-stroke-toggle" type="button" data-hf-stroke-toggle aria-controls="character-strokes" aria-expanded="false" aria-label="Play Stroke Order" title="Play Stroke Order">Play Stroke Order</button><button type="button" data-hf-copy="${e(c.glyph)}" aria-label="Copy ${e(c.glyph)}">Copy</button><span role="status" data-hf-copy-status></span></div></div><div class="hf-char-intuition"><h2 class="hf-char-meaning">${e(ed.meaning)}</h2><ul class="hf-char-definitions" aria-label="Definitions">${meaning.definitions.map((d,i)=>`<li><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span> ${e(d)}</li>`).join('')}</ul><p class="hf-char-hook">${e(meaning.explanation)}</p></div></section><details class="hf-char-strokes" id="character-strokes"><summary>Stroke order · animation &amp; complete sequence</summary>${strokePanel(c,asset)}<a href="/stroke-order/?char=${encodeURIComponent(c.glyph)}">Open the dedicated Stroke Order tool →</a></details><section class="hf-char-section" id="anatomy"><h2 class="hf-char-section-title">${parts.length?'VISUAL ANATOMY <span lang="zh-CN">(拆字)</span>':'BUILDING BLOCK POWER <span lang="zh-CN">(造字能力)</span>'}</h2>${anatomy}<p class="hf-char-mnemonic"><em>Visual Mnemonic <span lang="zh-CN">(记忆故事)</span>:</em> ${e(ed.mnemonic)}</p></section><section class="hf-char-section" id="examples"><h2 class="hf-char-section-title">COMMON WORDS <span lang="zh-CN">(组词)</span></h2><div class="hf-char-word-grid">${wordsFor(c).map(w=>`<article class="hf-char-word"><div class="hf-char-word-hanzi">${[...w.word].map(publishedLink).join('')}</div><p class="hf-char-word-pinyin" lang="zh-Latn-pinyin">${e(w.wordPinyin)}</p><p class="hf-char-word-meaning">${e(w.wordMeaning)}</p>${listen(w.word,{label:'Listen to word'})}</article>`).join('')}</div></section><section class="hf-char-section" id="sentences"><h2 class="hf-char-section-title">CONTEXT SENTENCES <span lang="zh-CN">(实战例句)</span></h2><div class="hf-char-sentences">${sentencesFor(c).map(s=>{const {zh,py}=sentenceMarkup(s.sentence,s.pinyin,c.glyph);return `<article class="hf-char-sentence"><div><p class="hf-char-sentence-hanzi" lang="zh-CN">${zh}</p><p class="hf-char-sentence-pinyin" lang="zh-Latn-pinyin">${py}</p><p class="hf-char-sentence-translation">${e(s.translation)}</p></div>${listen(s.sentence,{label:'Play sentence'})}</article>`;}).join('')}</div></section>${reference(c)}<!--hf-char-expanded--></article><aside class="hf-char-utility" aria-label="Character tools"><h2 class="hf-char-utility-title">UTILITY BOX</h2><button class="hf-char-save" type="button" data-hf-save="${c.characterId}">★ Add to Flashcards</button><p role="status" data-hf-save-status>Keep this character on this device.</p><button class="hf-char-print" type="button" data-print>Print Worksheet</button><button class="hf-char-practice" type="button" data-hf-practice="${c.characterId}" data-reading-id="${e(ed.readingId)}">Practise this character</button><p role="status" data-hf-practice-status></p><section class="hf-char-family"><h2 class="hf-char-utility-title">SIMILAR RADICAL</h2><p class="hf-char-radical"><span lang="zh-CN">${e(c.radical)}</span> · same radical family</p>${family.length?`<div class="hf-char-family-grid">${family.map(x=>`<a class="hf-char-family-card" href="${url(x.glyph)}"><span lang="zh-CN">${e(x.glyph)}</span><small lang="zh-Latn-pinyin">${e(primary(x).pinyin.marked)}</small></a>`).join('')}</div>`:'<p>This is the only published character in this radical family.</p>'}</section></aside></div></div><script type="module" src="/site-assets/dictionary.hf04-v1.mjs"></script>`;
 const page=withCoreSeo({path:'/dictionary/'+c.glyph+'/',title:c.glyph,content:body});
 page.pronunciationFooter='<p class="hf-char-audio-status" role="status" aria-live="polite" data-pronunciation-status></p><script type="module" src="/site-assets/pronunciation.mjs"></script>';
 page.footerHtml='<footer class="hf-char-footer"><nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/data-sources/">Sources</a></nav><p>© 2026 HanziFun · Made for curious learners.</p></footer>';
 page.content=page.content.replace('<h1>','<h1 class="hf-char-sr-only">');return page;
}
