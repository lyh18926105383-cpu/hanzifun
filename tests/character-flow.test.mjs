import test from 'node:test';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
import {nodes,attr} from '../scripts/validate-seo-quality.mjs';
import {publishedCharacters,characterFlowPage,visibleParts,derivativesFor,familyFor,sentencesFor,sentenceMarkup,alignSentence,publishedLink} from '../site/character-flow.mjs';
import {characterMeaning} from '../site/character-meaning.mjs';
import {findReading} from '../site/hsk-data.mjs';
import {characterReviewState} from '../site/publication-review.mjs';
import {coreSeo} from '../site/seo.mjs';
import {assertCharacterPresentation,characterPresentationPayload} from '../site/character-presentation-review.mjs';
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
const has=(n,c)=>(attr(n,'class')||'').split(/\s+/).includes(c);
const glyph=g=>publishedCharacters.find(c=>c.glyph===g);
const paths=new Set(publishedCharacters.map(c=>'/dictionary/'+c.glyph+'/'));
test('all 339 character routes retain SEO, teaching copy, isolated audio and one compact A–D flow',()=>{
 assert.equal(publishedCharacters.length,339);
 for(const c of publishedCharacters){
  const page=characterFlowPage(c),all=nodes(parse(page.content)),seo=coreSeo(page.path),copy=text(parse(page.content));
  assert.equal(page.title,seo.title);assert.equal(page.description,seo.lead);assert.equal(text(all.find(n=>n.tagName==='h1')),seo.h1);
  assert.equal(all.filter(n=>has(n,'hf-char-layout')).length,1);assert.equal(all.filter(n=>has(n,'hf-char-hero')).length,1);
  assert.deepEqual(all.filter(n=>has(n,'hf-char-section')).map(n=>attr(n,'id')),['anatomy','examples','sentences']);
  const ed=characterReviewState(c.characterId).teaching;
  for(const key of ['meaning','mnemonic','word','wordPinyin','wordMeaning','sentence','pinyin','translation'])assert.ok(copy.includes(ed[key]),c.glyph+' '+key);
  assert.ok(all.some(n=>attr(n,'data-pronunciation-reading')===ed.readingId));
  const main=all.find(n=>has(n,'hf-char-main')),mainChildren=main.childNodes.filter(n=>n.tagName);
  assert.ok(mainChildren.findIndex(n=>attr(n,'id')==='sentences')<mainChildren.findIndex(n=>has(n,'hf-char-reference')));
  const row=all.find(n=>has(n,'hf-char-pronunciation')),buttons=row.childNodes.filter(n=>n.tagName==='button');
  assert.equal(text(buttons[1]),'Play Stroke Order');assert.ok(attr(buttons[0],'data-pronunciation')!==undefined);assert.ok(attr(buttons[1],'data-hf-stroke-toggle')!==undefined);
  assert.ok(!all.some(n=>has(n,'hf-char-stage')&&nodes(n).some(n=>attr(n,'data-hf-stroke-toggle')!==undefined)));
  assert.doesNotMatch(copy,/Pinyin follows each example|CC-CEDICT contributors \/ MDBG|A memory association, not historical etymology/);
  assert.doesNotMatch(page.pronunciationFooter,/Stop audio|Recorded syllables play directly|data-pronunciation-stop/);assert.match(page.pronunciationFooter,/data-pronunciation-status/);assert.match(page.pronunciationFooter,/src="\/site-assets\/pronunciation.mjs"/);
  assert.doesNotMatch(copy,/Core Meaning|One-Sentence Cultural Hook|Evolution|Common Lookalikes/);
 }
});
test('component formulas and links are restricted to actually published pages',()=>{
 for(const c of publishedCharacters){const all=nodes(parse(characterFlowPage(c).content));
  for(const a of all.filter(n=>n.tagName==='a'&&attr(n,'href')?.startsWith('/dictionary/')))assert.ok(paths.has(decodeURI(attr(a,'href')))||attr(a,'href')==='/dictionary/',attr(a,'href'));
 }
 assert.doesNotMatch(publishedLink('龘'),/href=/);assert.doesNotMatch(publishedLink('<script>'),/<script>/);
 assert.deepEqual(visibleParts(glyph('休')),['亻','木']);assert.deepEqual(visibleParts(glyph('好')),['女','子']);
});
test('basic shapes reverse-search real component variants and never receive singleton equations',()=>{
 for(const g of ['木','水','火','山','人']){
  const c=glyph(g),html=characterFlowPage(c).content;assert.deepEqual(visibleParts(c),[]);assert.match(html,/BUILDING BLOCK POWER/);
  const d=derivativesFor(c);assert.ok(d.length>0&&d.length<=4);assert.ok(d.every(x=>x.glyph!==g&&paths.has('/dictionary/'+x.glyph+'/')));
 }
 assert.deepEqual(derivativesFor(glyph('木')).map(c=>c.glyph),['林','休','本','禾']);
 assert.ok(derivativesFor(glyph('水')).some(c=>c.radical==='氵'));
});
test('joined pinyin, repeated characters and punctuation align exactly to target syllables',()=>{
 const a=sentenceMarkup('请休息一下。','Qǐng xiūxi yíxià.','休');assert.match(a.py,/>xiū<\/strong>xi/);assert.doesNotMatch(a.py,/>xiūxi<\/strong>/);
 const b=sentenceMarkup('木头是木头。','Mùtou shì mùtou.','木');assert.equal((b.py.match(/hf-char-highlight/g)||[]).length,2);assert.equal((b.zh.match(/hf-char-highlight/g)||[]).length,2);
 assert.equal(alignSentence('女儿','nǚ’ér').filter(t=>t.glyph).length,2);
 assert.throws(()=>alignSentence('木头','nonsense'),/Unable to align/);
 for(const c of publishedCharacters)for(const ed of sentencesFor(c)){
  const a=alignSentence(ed.sentence,ed.pinyin);assert.equal(a.map(t=>t.text).join(''),ed.pinyin);
  assert.equal(a.filter(t=>t.glyph===c.glyph).length,[...ed.sentence].filter(g=>g===c.glyph).length);
  assert.equal(a.filter(t=>t.glyph).length,[...ed.sentence].filter(g=>/\p{Script=Han}/u.test(g)).length);
 }
});
test('radical families have distinct valid members, never pad with unrelated or unpublished glyphs',()=>{
 for(const c of publishedCharacters){const f=familyFor(c);assert.ok(f.length<=8);assert.equal(new Set(f.map(x=>x.glyph)).size,f.length);assert.ok(f.every(x=>x.glyph!==c.glyph&&paths.has('/dictionary/'+x.glyph+'/')));}
 assert.ok(familyFor(glyph('休')).some(c=>c.radical==='亻'));
});
test('presentation signature is independent of teaching/audio approval and rejects source drift',()=>{
 assert.doesNotThrow(()=>assertCharacterPresentation());
 const payload=characterPresentationPayload();payload.inputs[0].sha256='0'.repeat(64);assert.throws(()=>assertCharacterPresentation({payload}),/stale/);
 assert.throws(()=>assertCharacterPresentation({decision:{status:'approved'}}),/missing or stale/);
});

test('339 teaching-reading meaning panels have 1–3 definitions and contextual conversational explanations',()=>{
 for(const c of publishedCharacters){const ed=characterReviewState(c.characterId).teaching,r=findReading(ed.readingId),m=characterMeaning(c,ed,r);
  assert.equal(m.readingId,ed.readingId);assert.ok(m.definitions.length>=1&&m.definitions.length<=3);assert.equal(new Set(m.definitions).size,m.definitions.length);assert.ok(m.explanation.length>90);assert.ok(m.explanation.includes(c.glyph));
  const all=nodes(parse(characterFlowPage(c).content)),definitions=all.find(n=>has(n,'hf-char-definitions'));assert.equal(definitions.childNodes.filter(n=>n.tagName==='li').length,m.definitions.length);
 }
 const rest=glyph('休'),ed=characterReviewState(rest.characterId).teaching;
 assert.deepEqual(characterMeaning(rest,ed,findReading(ed.readingId)).definitions,['To rest','To pause / take a break','To stop / cease']);
 assert.doesNotMatch(characterMeaning(rest,ed,findReading(ed.readingId)).explanation,/surname|imperative/);
});
