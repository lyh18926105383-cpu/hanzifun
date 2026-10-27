import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {nodes,attr} from '../scripts/validate-seo-quality.mjs';
import {chooseMandarinVoice,createPronunciationPlayer} from '../src/client/pronunciation.mjs';
import {pronunciationManifest,pronunciationButton} from '../site/pronunciation.mjs';
import {additionalScenarios,levelTwo,phaseTwoLinks} from '../site/phase2-content.mjs';
import {findCharacter,scenarioData,assertPublicationReady} from '../site/hsk-data.mjs';
import {scenarioPages} from '../site/pages/scenarios.mjs';
import {levelTwoPage} from '../site/pages/hsk.mjs';
import {learningData} from '../site/learning-data.mjs';
import {assertEditorialReady} from '../site/seo.mjs';
import {renderPages} from '../site/site.mjs';
import {characterReviewState} from '../site/publication-review.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';
import {levelTwoCore} from '../scripts/build-level-two-core.mjs';
const root=new URL('../',import.meta.url);
test('HF11 all static pronunciation bindings resolve to unchanged nonempty MP3 bytes, without forged listening approval',()=>{
 const records=Object.values(pronunciationManifest.syllables),physical=records.filter(r=>r.url);
 assert.equal(records.length,1325);assert.equal(physical.length,1268);assert.equal(pronunciationManifest.listeningAcceptance,'pending');
 for(const r of physical){const bytes=fs.readFileSync(new URL(r.url,root));assert.ok(bytes.length>1000);assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),r.sourceBlob);}
 assert.notEqual(pronunciationManifest.syllables.lv3.url,pronunciationManifest.syllables.lu3.url);
 for(const r of records.filter(r=>!r.url)){assert.equal(r.kind,'browser-speech');assert.match(r.text,/\p{Script=Han}/u);assert.ok(r.sourceLocator);}
});
test('HF11 every dictionary reading is mapped; browser examples use Chinese text and escaped labels',()=>{
 const lib=learningData();for(const c of lib.catalog){assert.ok(lib.pronunciations[c.readingId],c.readingId);assert.match(lib.pronunciations[c.readingId].text,/\p{Script=Han}/u);}
 const button=nodes(parse(pronunciationButton('"<&水',{numeric:'shui3'}))).find(n=>n.tagName==='button');
 assert.equal(attr(button,'aria-label'),'Listen: "<&水');assert.ok(attr(button,'data-audio-url').endsWith('/shui3.mp3'));assert.equal(attr(button,'disabled'),undefined);
});
test('HF11 Mandarin voice selection excludes Cantonese and English; no-voice failure gives actionable retry',async()=>{
 assert.equal(chooseMandarinVoice([{lang:'en-US'},{lang:'zh-HK'},{lang:'yue-HK'}]),null);
 assert.equal(chooseMandarinVoice([{lang:'zh-TW'},{lang:'zh-CN'}]).lang,'zh-CN');
 let called=0;const status=[];const p=createPronunciationPlayer({speech:{getVoices:()=>[{lang:'en-US'}],speak:()=>called++},Utterance:class{},setTimer:fn=>{queueMicrotask(fn);return 1;},clearTimer:()=>{}});
 assert.equal(await p.play({text:'你好'},(s,m)=>status.push([s,m])),false);assert.equal(called,0);assert.match(status.at(-1)[1],/Add a Mandarin voice/);
});
test('HF11 static failure falls back to Mandarin speech and superseded events cannot change the new playback',async()=>{
 const spoken=[],audio=[],states=[];
 const speech={getVoices:()=>[{lang:'zh-CN'}],resume(){},speak:u=>spoken.push(u),cancel(){}};
 const player=createPronunciationPlayer({speech,Utterance:class{constructor(text){this.text=text;}},makeAudio:()=>{const a={pause(){},play:async()=>{throw Error('404');},currentTime:0};audio.push(a);return a;}});
 assert.equal(await player.play({url:'/audio/pronunciation-v1/ma1.mp3',text:'妈'},s=>states.push(s)),true);
 assert.equal(spoken[0].text,'妈');assert.equal(spoken[0].voice.lang,'zh-CN');spoken[0].onstart();assert.equal(states.at(-1),'playing');
 const oldEnd=spoken[0].onend;await player.play({text:'水'},s=>states.push(s));const before=states.length;oldEnd();assert.equal(states.length,before);player.stop();
 assert.equal(await player.play({url:'https://example.com/audio.mp3',text:'水'}),false);
});
test('HF11 stopping while voices load prevents a delayed utterance',async()=>{
 let voice=null,listener,spoken=0;const speech={getVoices:()=>voice?[voice]:[],addEventListener:(_,f)=>listener=f,removeEventListener(){},speak:()=>spoken++};
 const p=createPronunciationPlayer({speech,Utterance:class{},setTimer:()=>1,clearTimer(){}});const pending=p.play({text:'水'});p.stop();voice={lang:'zh-CN'};listener?.();assert.equal(await pending,false);assert.equal(spoken,0);
});
test('HF12 86 level-2 words reproduce from the locked XLSX and dictionary; scope never claims complete level 2 or HSK 3.0 expansion',()=>{
 assert.deepEqual(levelTwoCore(),levelTwo);assert.equal(levelTwo.coveredCount,86);assert.equal(levelTwo.deferred.length,64);assert.equal(levelTwo.sourceCount,150);
 assert.ok(levelTwo.entries.every(w=>w.level==='2'&&w.system==='hsk-2'&&w.cumulative===false&&w.characterIds.length));
 assert.match(levelTwoPage().content,/not the complete second-level list/);assert.equal(resolveRoutePolicy('/academic/hsk-2/level-2/').indexing,'index');
});
test('HF12 three new scenarios keep token boundaries, complete character links, 15 speech controls and real practice decks',()=>{
 const lib=learningData();assert.equal(additionalScenarios.scenarios.length,3);
 for(const s of additionalScenarios.scenarios){
  const p=scenarioPages().find(p=>p.path===s.path),tree=nodes(parse(p.content)),deck=lib.decks.find(d=>d.slug==='scenario-'+s.id);assert.ok(deck?.cardIds.length);
  for(const x of s.sentences){assert.equal(x.tokens.map(t=>t[0]).join(''),x.text.replace(/\p{P}/gu,''));for(const [word] of x.tokens)for(const g of word){assert.ok(findCharacter(g));assert.ok(p.content.includes('/dictionary/'+encodeURIComponent(g)+'/'));assert.ok(deck.chars.includes(g));}}
  assert.equal(tree.filter(n=>attr(n,'aria-label')?.startsWith('Listen to sentence:')).length,5);
 }
 assert.equal(lib.decks.find(d=>d.slug==='hsk-2-2015-level-2-core').chars.length,new Set(levelTwo.entries.flatMap(w=>[...w.glyph])).size);
 assert.match(phaseTwoLinks('房'),/scenarios\/travel\/hotel/);assert.match(phaseTwoLinks('贵'),/academic\/hsk-2\/level-2\/#item-word:/);
});
test('HF12 owner-approved scenarios publish only with their independent current content signature',()=>{
 const review=additionalScenarios.review;
 assert.equal(review.humanAcceptance,'approved');
 assert.equal(review.contentSha256,createHash('sha256').update(JSON.stringify(additionalScenarios.scenarios)).digest('hex'));
 for(const s of additionalScenarios.scenarios){
  assert.equal(resolveRoutePolicy(s.path).indexing,'index');
  assert.doesNotThrow(()=>assertPublicationReady({path:s.path,indexing:'index'}));
  assert.doesNotThrow(()=>assertEditorialReady({path:s.path,indexing:'index'}));
 }
 const first=additionalScenarios.scenarios[0],original=first.sentences[0].translation;
 const reject=()=>{for(const s of additionalScenarios.scenarios){assert.throws(()=>assertPublicationReady({path:s.path,indexing:'index'}),/human language acceptance pending/);assert.throws(()=>assertEditorialReady({path:s.path,indexing:'index'}),/human language acceptance pending/);}};
 try{
  first.sentences[0].translation='Changed since review';reject();first.sentences[0].translation=original;
  for(const field of ['humanAcceptance','contentSha256','reviewer','date','evidence']){const value=review[field];try{delete review[field];reject();}finally{review[field]=value;}}
 }finally{first.sentences[0].translation=original;}
});
test('Five Elements has five distinct complete cards and every character link targets approved published teaching',()=>{
 const page=renderPages().find(p=>p.path==='/tools/zodiac-elements-calculator/'),tree=nodes(parse(page.content));
 const cards=tree.filter(n=>attr(n,'data-five-element')!==undefined);
 assert.deepEqual(cards.map(n=>attr(n,'data-five-element')),['金','木','水','火','土']);
 for(const card of cards){
  const content=nodes(card),links=content.filter(n=>n.tagName==='a');
  assert.equal(links.length,2);assert.ok(content.some(n=>n.tagName==='h2'));
  const text=content.filter(n=>n.nodeName==='#text').map(n=>n.value).join(' ');
  assert.match(text,/Component:/);assert.match(text,/Example:/);assert.match(text,/Metal|Wood|Water|Fire|Earth/);
  for(const a of links){const path=attr(a,'href'),glyph=decodeURIComponent(path.split('/')[2]),c=findCharacter(glyph);assert.ok(c);assert.equal(resolveRoutePolicy(path).indexing,'index');assert.equal(characterReviewState(c.characterId).accepted,true);}
 }
});
test('HF11 owner audio strategy approval is bound to the current manifest and preserves static coverage facts',()=>{
 const receipt=JSON.parse(fs.readFileSync(new URL('docs/hanzifun-rebuild/acceptance/phase-2-hf11-audio-signoff.json',root)));
 assert.equal(receipt.status,'approved');assert.equal(receipt.manifestSha256,createHash('sha256').update(fs.readFileSync(new URL('data/audio/pronunciation.json',root))).digest('hex'));
 assert.equal(receipt.scope.staticRecordings,Object.values(pronunciationManifest.syllables).filter(r=>r.url).length);
 assert.equal(receipt.scope.fallbackReadings,Object.values(pronunciationManifest.syllables).filter(r=>!r.url).length);
 assert.equal(receipt.scope.fallbackWordSentenceGroups,Object.keys(pronunciationManifest.utterances).length);
});
