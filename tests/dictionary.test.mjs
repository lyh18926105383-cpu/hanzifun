import {resolveRoutePolicy} from '../site/routes.mjs';
import {characterReviewState} from '../site/publication-review.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {normalizeQuery,searchEntries,supportedCharacter} from '../src/client/search-core.mjs';
import {fetchStroke} from '../src/client/stroke-order.mjs';
import {saveCharacter,startCharacterPractice} from '../src/client/learning-entry.mjs';
import {approvedAudio,createAudioPlayer} from '../src/client/audio-player.mjs';
import {characters,editorial,readings,kanji,strokes,syllables,scope,comparisons,reviews,escapeHtml,searchShards,assertPublicationReady,readJson} from '../site/dictionary-data.mjs';
import {lexicon} from '../site/hsk-data.mjs';
import {characterPage,dictionaryPages} from '../site/pages/dictionary.mjs';
import {pinyinChartPage} from '../site/pages/pinyin-chart.mjs';
import {staticStrokeSvg} from '../site/components/stroke-order.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('all 126 stable characters have distinct, traceable teaching drafts without invented human acceptance',()=>{
 assert.equal(characters.length,126);assert.equal(editorial.entries.length,126);
 assert.equal(new Set(editorial.entries.map(x=>x.mnemonic)).size,126);
 for(const c of characters){const ed=editorial.entries.find(x=>x.characterId===c.characterId);
  for(const key of ['meaning','word','wordPinyin','wordMeaning','sentence','pinyin','translation','mnemonic','reviewer','reviewDate','generationBatch'])assert.ok(ed[key]?.length,key+' '+c.glyph);
  assert.ok(ed.word.includes(c.glyph));assert.ok(ed.sentence.includes(c.glyph));assert.ok(c.readingId.includes(ed.readingId));assert.equal(ed.kind,'mnemonic');assert.equal(ed.humanAcceptance,'pending');
 }
 assert.equal(characters.find(c=>c.glyph==='发').primaryReadingId,'reading:char:53d1:fa1');
});
test('search keeps tones and ü, including NFC, and exact characters outrank indirect mentions',()=>{
 const entries=searchShards().characters;
 for(const q of ['水','shuǐ','shui3','  WATER  '])assert.equal(searchEntries(entries,q)[0].glyph,'水',q);
 for(const q of ['lü','lv','lu:','lu\u0308'])assert.equal(normalizeQuery(q),'lü');
 assert.equal(normalizeQuery('lǜ'),'lü4');assert.notEqual(normalizeQuery('lu'),normalizeQuery('lü'));
 const fixture=[{id:'1',glyph:'甲',aliases:['lü4','lǜ','lü']},{id:'2',glyph:'乙',aliases:['lu4','lù','lu']}];
 assert.deepEqual(searchEntries(fixture,'lv4').map(x=>x.id),['1']);assert.deepEqual(searchEntries(fixture,'lu4').map(x=>x.id),['2']);
 assert.ok(!searchEntries(entries,'shui4').some(x=>x.glyph==='水'));
 assert.ok(searchEntries(entries,'shui4',{relaxTone:true}).some(x=>x.glyph==='水'));
 assert.deepEqual(searchEntries(entries,''),[]);assert.deepEqual(searchEntries(entries,'x'.repeat(101)),[]);
 assert.equal(supportedCharacter('../水',characters.map(c=>c.glyph)),null);assert.equal(supportedCharacter('狗',characters.map(c=>c.glyph)),null);
});
test('unsafe query and markup stay inert, malformed and unknown character input is rejected',()=>{
 assert.equal(escapeHtml('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
 for(const input of ['%E0%A4%A','../水','水/','水水','\\水','狗'])assert.equal(supportedCharacter(input,characters.map(c=>c.glyph)),null);
 assert.deepEqual(searchEntries(searchShards().characters,'<script>alert(1)</script>'),[]);
});

test('polyphonic Information stays tied to reading IDs, known Kanji have evidence and unknown relations are omitted',()=>{
 const hair=characterPage(characters.find(c=>c.glyph==='发')).content;
 assert.match(hair,/fā/);assert.match(hair,/fà/);assert.match(hair,/發/);assert.match(hair,/髮/);assert.match(hair,/data-reading-panel=/);
 assert.match(characterPage(characters.find(c=>c.glyph==='水')).content,/lang="ja"/);
 assert.doesNotMatch(characterPage(characters.find(c=>c.glyph==='请')).content,/<dt>Japanese Kanji/);
 assert.equal(kanji.filter(k=>k.status==='verified').length,80);
});
test('character text, Information and complete static sequences are rendered without runtime SVG payloads',()=>{
 for(const c of characters){const html=characterPage(c).content;assert.match(html,/Information/);assert.match(html,/Visual memory cue/);assert.match(html,/id="examples"/);assert.match(html,/loading="lazy"/);assert.match(html,/stroke-static\/[0-9a-f]+\.svg/);assert.doesNotMatch(html,/<path\b/);assert.match(html,/data-stroke-panel/);}
 assert.equal(dictionaryPages().filter(p=>characters.some(c=>p.path==='/dictionary/'+c.glyph+'/')).length,126);
 assert.ok(comparisons.entries.length>=6);
});
test('410-syllable scope is independent of core coverage; tone candidates and missing audio stay explicit',()=>{
 const html=pinyinChartPage().content;assert.equal(syllables.length,410);
 assert.equal((html.match(/data-syllable=/g)||[]).length,410);assert.equal(syllables.reduce((n,s)=>n+s.tones.length,0),1323);
 assert.match(html,/Audio pending review/);assert.match(html,/Zero initial/);assert.match(html,/neutral/);assert.match(html,/lü/);
 assert.ok(scope.rareIncluded.length>0);assert.ok(!syllables.some(s=>s.spelling==='bua'));
});
test('stroke loader fetches only the requested version, deduplicates calls, and recovers after failure',async()=>{
 const version='a'.repeat(64);let calls=[];
 const ok=async url=>{calls.push(url);return {ok:true,json:async()=>({strokes:['M 0 0 L 1 1 Z'],medians:[[[0,0],[1,1]]]})};};
 await Promise.all([fetchStroke('6c34',version,ok),fetchStroke('6c34',version,ok)]);
 assert.deepEqual(calls,[`/data/strokes/6c34.json?v=${version}`]);
 await fetchStroke('6c34','b'.repeat(64),ok);assert.equal(calls.length,2);
 await assert.rejects(fetchStroke('../x',version,ok));
 await assert.rejects(fetchStroke('6728',version,async()=>({ok:false})));
 await fetchStroke('6728',version,ok);assert.equal(calls.length,3);
 await assert.rejects(fetchStroke('6708',version,async()=>({ok:true,json:async()=>({strokes:[],medians:[]})})));
});
test('static stroke sequence uses the locked real paths once and gives every cumulative step',()=>{
 for(const asset of strokes){const data=readJson(asset.url),svg=staticStrokeSvg(asset.glyph,data);
  assert.equal((svg.match(/<path id=/g)||[]).length,asset.strokeCount);
  assert.equal((svg.match(/<text /g)||[]).length,asset.strokeCount);
  assert.match(svg,/Arphic Public License/);
 }
});
test('repository bridge never claims a save without a confirmed durable write',async()=>{
 assert.equal((await saveCharacter(null,'char:6c34')).saved,false);
 assert.equal((await saveCharacter({saveCharacter:()=>({saved:false})},'char:6c34')).saved,false);
 assert.equal((await saveCharacter({saveCharacter:()=>{throw Error('quota');}},'char:6c34')).saved,false);
 let received;assert.equal((await saveCharacter({saveCharacter:payload=>{received=payload;return {saved:true};}},'char:6c34')).saved,true);assert.deepEqual(received,{characterId:'char:6c34'});
});
test('practice bridge preserves the selected identity and reports missing or failed integration honestly',async()=>{
 const payload={characterId:'char:53d1',readingId:'reading:char:53d1:fa4',source:'dictionary'};
 assert.equal((await startCharacterPractice(null,payload)).started,false);
 let received;assert.equal((await startCharacterPractice({startCharacterPractice:value=>{received=value;return {started:true};}},payload)).started,true);assert.deepEqual(received,payload);
 assert.equal((await startCharacterPractice({startCharacterPractice:()=>{throw Error('failure');}},payload)).started,false);
});

test('audio rejects unreviewed/context-mismatched bindings and stops the previous recording',async()=>{
 const draft=readJson('data/normalized/audio.json')[0];assert.equal(approvedAudio(draft,draft.targetReadingId),false);
 const recording={reviewStatus:'approved',confirmedReadingId:'r1',url:'audio/test.mp3',usableForIsolatedSyllable:false};
 assert.equal(approvedAudio(recording,'r2'),false);assert.equal(approvedAudio(recording,'r1',{isolated:true}),false);
 const players=[];const player=createAudioPlayer(()=>{const a={paused:false,currentTime:4,pause(){this.paused=true;},async play(){}};players.push(a);return a;});
 await player.play(recording,'r1');await player.play(recording,'r1');assert.equal(players[0].paused,true);assert.equal(players[0].currentTime,0);player.stop();assert.equal(players[1].paused,true);
});
test('publication fails closed for unaccepted teaching; a missing illustration is not used as a gate',()=>{
 assert.doesNotThrow(()=>assertPublicationReady({path:'/dictionary/水/',indexing:'noindex'}));
 if(!characterReviewState('char:6c34').accepted)assert.throws(()=>assertPublicationReady({path:'/dictionary/水/',indexing:'index'}),/Unreviewed/);
 assert.throws(()=>assertPublicationReady({path:'/pinyin-chart/',indexing:'index'}),/pending/);
 const original=reviews.characters['char:6c34'];
 try {reviews.characters['char:6c34']={humanContent:'approved'};assert.throws(()=>assertPublicationReady({path:'/dictionary/水/',indexing:'index'}),/Unreviewed/);
 reviews.characters['char:6c34']={humanContent:'approved',reviewer:'test-fixture',date:'2026-10-25',evidence:'test-only acceptance fixture',contentSha256:characterReviewState('char:6c34').contentSha256};
 assert.doesNotThrow(()=>assertPublicationReady({path:'/dictionary/水/',indexing:'index'}));
 }finally {reviews.characters['char:6c34']=original;}

});
test('isolated static build verifies all references, per-character assets, preview robots and deploy exclusions',()=>{
 const output=fs.mkdtempSync(path.join(os.tmpdir(),'hf04-test-'));
 try{
  const result=spawnSync(process.execPath,['scripts/build-site.js'],{cwd:root,env:{...process.env,HF_SITE_ENV:'production',HF_BUILD_OUTPUT_DIR:output},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);const get=p=>fs.readFileSync(path.join(output,p),'utf8');
  for(const c of characters){const html=get('dictionary/'+c.glyph+'/index.html');assert.ok(html.includes('content="'+resolveRoutePolicy('/dictionary/'+c.glyph+'/').robots+'"'));assert.match(html,/Information/);}
  assert.equal(fs.readdirSync(path.join(output,'data/strokes')).length,126+lexicon.characters.length);
  for(const asset of strokes)assert.deepEqual(fs.readFileSync(path.join(output,asset.url)),fs.readFileSync(path.join(root,asset.url)));
  assert.equal(JSON.parse(get('content-manifest.json')).contentVersion,readJson('data/core-manifest.json').version);
  assert.ok(fs.existsSync(path.join(output,'dictionary/狗/index.html')));
  assert.ok(!fs.existsSync(path.join(output,'dictionary/龘/index.html')));
  assert.equal(fs.readdirSync(path.join(output,'site-assets/stroke-static')).length,126+lexicon.characters.length);
  for(const file of fs.readdirSync(path.join(output,'site-assets')).filter(f=>/\.(js|mjs)$/.test(f)))assert.doesNotMatch(get('site-assets/'+file),/"medians"|"strokes"\s*:/);
  assert.ok(!fs.existsSync(path.join(output,'data/source-extracts')));assert.ok(!fs.existsSync(path.join(output,'.cache')));
  assert.match(get('sitemap.xml'),/https:\/\/hanzifun.online\/academic\/hsk-2\//);
  assert.doesNotMatch(get('sitemap.xml'),/flashcards/);for(const c of characters){const url=new URL('/dictionary/'+c.glyph+'/', 'https://hanzifun.online').href;assert.equal(get('sitemap.xml').includes('<loc>'+url+'</loc>'),resolveRoutePolicy('/dictionary/'+c.glyph+'/').indexing==='index');}
  assert.equal(JSON.parse(get('content-manifest.json')).pages.length,134);
 }finally{fs.rmSync(output,{recursive:true,force:true});}
});
