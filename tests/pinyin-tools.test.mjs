import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pinyin} from 'pinyin-pro';
import {plainPinyin,markSyllable,numericSyllable,pinyinQuery,convertToneText,formatHanziTokens} from '../src/client/pinyin-core.mjs';
import {createPronunciationPlayer} from '../src/client/pronunciation.mjs';
import {syllables} from '../site/dictionary-data.mjs';
import {pinyinToolPages} from '../site/pages/pinyin-tools.mjs';
import {pinyinChartPage} from '../site/pages/pinyin-chart.mjs';
import {coreSeo} from '../site/seo.mjs';
import {toolPreviews} from '../site/pinyin-model.mjs';
import {parse} from 'parse5';
import {nodes,attr} from '../scripts/validate-seo-quality.mjs';
import {createHash} from 'node:crypto';
const inventory=syllables.map(s=>s.spelling);

test('tone marks round-trip every attested chart reading, preserving ü and neutral forms',()=>{
  for(const syllable of syllables)for(const reading of syllable.tones){
    assert.equal(markSyllable(syllable.spelling,reading.tone),reading.spelling);
    assert.equal(numericSyllable(reading.spelling),syllable.spelling+reading.tone);
    assert.equal(plainPinyin(reading.spelling),syllable.spelling);
  }
});
test('tone editor handles mixed case, adjacent numbered syllables, aliases, punctuation and invalid input',()=>{
  assert.equal(convertToneText('ni3hao3! LV4 nv3 lu:4 lu4, liu2 hui4 ou3 ma0 ma5','marks',inventory).text,'nǐhǎo! LǛ nǚ lǜ lù, liú huì ǒu ma ma');
  assert.equal(convertToneText('Nǐ hǎo, lǜ! ni3 hao3 ma0','numbers',inventory).text,'Ni3 hao3, lü4! ni3 hao3 ma5');
  assert.equal(convertToneText('nǐ hǎo lǜ lu4 nv3 version2','plain',inventory).text,'ni hao lü lu nü version2');
  assert.deepEqual(convertToneText('hello3 ni33 ma9','marks',inventory),{text:'hello3 ni33 ma9',unconverted:['hello3','ni33','ma9']});
  assert.equal(convertToneText('ma9 ni33 version2','numbers',inventory).text,'ma9 ni33 version2');
  assert.equal(convertToneText('nǐhǎo','numbers',inventory).text,'nǐhǎo');
  assert.ok(convertToneText('nǐhǎo','numbers',inventory).unconverted.length);
  assert.deepEqual(pinyinQuery('Lu:4'),{plain:'lü',tone:4});
  assert.deepEqual(pinyinQuery('SHUǏ'),{plain:'shui',tone:3});
  assert.notEqual(pinyinQuery('lu').plain,pinyinQuery('lü').plain);
});
test('local Hanzi transcription uses phrase context and supports explicit corrections without losing punctuation',()=>{
  const tokens=pinyin('银行行长说：重庆的长江很长。學習中文！',{type:'all',toneSandhi:false});
  assert.equal(formatHanziTokens(tokens),'yín háng háng zhǎng shuō：chóng qìng de cháng jiāng hěn cháng。xué xí zhōng wén！');
  const ni=pinyin('你好，A4！\n水和女。',{type:'all',toneSandhi:false});
  assert.equal(formatHanziTokens(ni,'numbers'),'ni3 hao3，A4！\nshui3 he2 nü3。');
  assert.equal(formatHanziTokens(ni,'plain'),'ni hao，A4！\nshui he nü。');
  assert.match(formatHanziTokens(tokens,'marks',{1:'xíng'}),/^yín xíng háng/);
  assert.ok(tokens[1].polyphonic.includes('háng')&&tokens[1].polyphonic.includes('xíng'));
  const hostile='<img src=x onerror=alert(1)>水';
  assert.equal(formatHanziTokens(pinyin(hostile,{type:'all'})),'<img src=x onerror=alert(1)>shuǐ');
});
test('recording-only quiz fails closed without speech synthesis and stops earlier playback',async()=>{
  let speechCalls=0,pauses=0;const states=[];
  const player=createPronunciationPlayer({makeAudio:()=>({play:()=>Promise.reject(Error('failed')),pause(){pauses++;},currentTime:0}),speech:{speak(){speechCalls++;},getVoices:()=>[{lang:'zh-CN'}]},Utterance:class{}});
  assert.equal(await player.play({url:'/audio/pronunciation-v1/ma1.mp3',allowSpeechFallback:false},state=>states.push(state)),false);
  assert.ok(states.includes('error'));assert.equal(speechCalls,0);assert.ok(pauses>0);player.stop();
});
test('approved hub metadata, full A4 chart and distinct subpages remain connected',()=>{
  const hub=pinyinChartPage(),seo=coreSeo(hub.path);
  assert.equal(seo.title,'What Is Pinyin? Full Mandarin Chart With Audio');
  assert.equal(seo.description,'What is pinyin? It is the official Romanization of Mandarin. See all 410 syllables on one chart with pronunciation and printable options.');
  assert.equal(seo.h1,'Look up Pinyin');assert.match(hub.content,/<h1>Look up Pinyin<\/h1>/);
  assert.match(hub.content,/data-print>Print free A4 chart/);assert.match(fs.readFileSync('public/site-assets/pinyin-chart.v1.css','utf8'),/@page\{size:A4 portrait/);
  const pages=pinyinToolPages();assert.equal(pages.length,3);
  assert.equal(new Set(pages.map(p=>p.title)).size,3);
  for(const page of pages){assert.ok(page.path.startsWith('/pinyin-chart/'));assert.ok(hub.content.includes('href="'+page.path+'"'));assert.match(page.content,/href="\/pinyin-chart\/"/);assert.equal((page.content.match(/<summary>/g)||[]).length>=5,true);}
  const quiz=JSON.parse(/data-pinyin-tool-config>([^<]+)/.exec(pages.find(p=>p.path.endsWith('/tones/')).content)[1]).quiz;
  assert.ok(quiz.length>=16);assert.ok(quiz.every(q=>q.tone>=1&&q.tone<=4&&fs.existsSync('.'+q.url)));
});

test('visual examples stay tied to real chart coordinates, attested tones and integrity-locked tool screenshots',()=>{
  const tree=nodes(parse(pinyinChartPage().content));
  const explain=tree.find(n=>attr(n,'class')==='pinyin-how-work');assert.ok(explain);
  const water=syllables.find(s=>s.spelling==='shui');assert.equal(water.initial,'sh');assert.equal(water.final,'uei');
  const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
  assert.ok(text(explain).includes('uei'));assert.ok(text(explain).includes('written ui'));assert.ok(text(explain).includes('shuǐ'));
  const links=tree.filter(n=>attr(n,'data-chart-example')!==undefined);assert.equal(links.length,4);
  for(const link of links){const query=pinyinQuery(attr(link,'data-chart-example')),s=syllables.find(s=>s.spelling===query.plain);assert.ok(s?.tones.some(t=>t.tone===query.tone));assert.equal(attr(link,'href'),'#syllable-'+encodeURIComponent(s.spelling));assert.ok(tree.some(n=>attr(n,'id')===attr(link,'href').slice(1)));}
  const images=tree.filter(n=>n.tagName==='img'&&attr(n,'src')?.includes('/pinyin-previews/'));assert.equal(images.length,3);
  for(const preview of Object.values(toolPreviews)){
    assert.equal(preview.kind,'actual-local-tool-screenshot');assert.ok(preview.page.startsWith('/pinyin-chart/'));assert.equal(preview.variants.length,2);
    for(const v of preview.variants){const bytes=fs.readFileSync('public'+v.src);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256);assert.ok(v.width>0&&v.height>0);}
    const img=images.find(n=>attr(n,'src')===preview.variants.at(-1).src);assert.ok(img);assert.equal(attr(img,'alt'),preview.alt);assert.equal(attr(img,'loading'),'lazy');
  }
});
