// Explicit asset production; builds never contact a provider or read credentials.
import fs from 'node:fs';
import path from 'node:path';
import {createHash,createHmac,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
export function tencentConfig(){
 const env={};
 const file=path.join(root,'.env');if(fs.existsSync(file))for(const line of fs.readFileSync(file,'utf8').split('\n')){const m=/^(TENCENTCLOUD_SECRET_(?:ID|KEY))\s*=\s*(.*?)\s*$/.exec(line);if(m)env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}
 if(!env.TENCENTCLOUD_SECRET_ID||!env.TENCENTCLOUD_SECRET_KEY)throw Error('Tencent speech configuration is required for explicit production.');
 return {secretId:env.TENCENTCLOUD_SECRET_ID,secretKey:env.TENCENTCLOUD_SECRET_KEY,voiceType:502007,speed:0,region:'ap-guangzhou'};
}
async function synthesize(item,config){
 const host='tts.tencentcloudapi.com',timestamp=Math.floor(Date.now()/1000),date=new Date(timestamp*1000).toISOString().slice(0,10);
 const payload=JSON.stringify({Text:item.text,SessionId:randomUUID(),ModelType:1,VoiceType:config.voiceType,Codec:'mp3',SampleRate:24000,Speed:config.speed,Volume:0,PrimaryLanguage:1});
 const hmac=(key,data,encoding)=>createHmac('sha256',key).update(data).digest(encoding);
 const scope=date+'/tts/tc3_request',canonical=['POST','/','',`content-type:application/json; charset=utf-8\nhost:${host}\n`,'content-type;host',hash(payload)].join('\n');
 const signature=hmac(hmac(hmac(hmac('TC3'+config.secretKey,date),'tts'),'tc3_request'),['TC3-HMAC-SHA256',timestamp,scope,hash(canonical)].join('\n'),'hex');
 const response=await fetch('https://'+host,{method:'POST',headers:{Authorization:`TC3-HMAC-SHA256 Credential=${config.secretId}/${scope}, SignedHeaders=content-type;host, Signature=${signature}`,'Content-Type':'application/json; charset=utf-8','X-TC-Action':'TextToVoice','X-TC-Timestamp':String(timestamp),'X-TC-Version':'2019-08-23','X-TC-Region':config.region},body:payload});
 const result=await response.json();if(!response.ok||result.Response?.Error||!result.Response?.Audio)throw Error(result.Response?.Error?.Code+': '+(result.Response?.Error?.Message||'Speech request failed'));
 return Buffer.from(result.Response.Audio,'base64');
}
export const escapeXml=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function phonemeText(glyph,numeric){
 const tokens=numeric.toLowerCase().replaceAll('u:','ü').replaceAll('v','ü').match(/[a-züê]+[1-5]/g)||[];
 if(tokens.length!==[...glyph].length||!/^[\p{Script=Han}]+$/u.test(glyph))throw Error('Phoneme count/text mismatch: '+glyph);
 return `<speak><phoneme alphabet="py" ph="${escapeXml(tokens.join(' ').replaceAll('ü','v'))}">${escapeXml(glyph)}</phoneme></speak>`;
}
export async function probeSpeech(){
 const data=await synthesize({text:phonemeText('女','nü3')},tencentConfig());
 fs.mkdirSync(path.join(root,'.cache/hf11'),{recursive:true});fs.writeFileSync(path.join(root,'.cache/hf11/probe.mp3'),data);
 return {bytes:data.length,sha256:hash(data)};
}
const sourceCommit='aa25ecce7b7fb02757b2c2b8e3c01aa975812edc';
export async function prepareAssets({onProgress=()=>{},synthesizeMissing=false}={}){
 const manifestFile=path.join(root,'data/audio/pronunciation.json');
 const manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{version:'hf11-audio-v1',sources:{pinyin:{repository:'https://github.com/davinfifield/mp3-chinese-pinyin-sound',commit:sourceCommit,license:'Unlicense'},speech:{provider:'Tencent Cloud',voice:502007,format:'mp3/24000Hz',ssmlReference:'https://intl.cloud.tencent.com/zh/document/product/1154/47883'}},syllables:{},utterances:{},listeningAcceptance:'pending'};
 fs.mkdirSync(path.join(root,'audio/pronunciation-v1'),{recursive:true});fs.mkdirSync(path.dirname(manifestFile),{recursive:true});
 const save=()=>{fs.writeFileSync(manifestFile+'.tmp',JSON.stringify(manifest,null,2)+'\n');fs.renameSync(manifestFile+'.tmp',manifestFile);};
 const valid=r=>r&&typeof r.url==='string'&&fs.existsSync(path.join(root,r.url))&&hash(fs.readFileSync(path.join(root,r.url)))===r.sha256;
 const tree=await (await fetch(`https://api.github.com/repos/davinfifield/mp3-chinese-pinyin-sound/git/trees/${sourceCommit}?recursive=1`)).json();
 if(!Array.isArray(tree.tree)||tree.sha!==sourceCommit)throw Error('Unexpected audio source tree');
 const files=new Map(tree.tree.map(x=>[x.path,x]));
 const jobs=read('data/pinyin/syllables.json').flatMap(s=>s.tones.map(t=>({key:s.spelling.replace('ü','v')+t.tone,glyph:String.fromCodePoint(parseInt(t.exampleReadingId.split(':')[2],16)),numeric:s.spelling+t.tone})));
 // Include all dictionary readings, including readings not offered by the bounded chart.
 const readings=[...read('data/normalized/readings.json'),...read('data/hsk/lexicon.json').readings];
 for(const r of readings)if(/^reading:char:/.test(r.readingId)&&r.pinyin.syllables.length===1&&!jobs.some(j=>j.numeric===r.pinyin.numeric))jobs.push({key:r.pinyin.numeric.replace('ü','v'),numeric:r.pinyin.numeric,glyph:String.fromCodePoint(parseInt(r.itemId?.slice(5)||r.characterId?.slice(5),16))});
 const missing=[];let cursor=0,done=0;
 await Promise.all(Array.from({length:12},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];if(valid(manifest.syllables[job.key])){done++;continue;}
  const file='mp3/'+job.numeric.replace('ü','uu')+'.mp3',entry=files.get(file);
  if(!entry){missing.push(job);continue;}
  const response=await fetch(`https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/${sourceCommit}/${file}`);if(!response.ok)throw Error('Audio download HTTP '+response.status);
  const data=Buffer.from(await response.arrayBuffer());const gitHash=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');if(gitHash!==entry.sha)throw Error('Source audio checksum mismatch: '+job.key);
  const url='audio/pronunciation-v1/'+job.key+'.mp3';fs.writeFileSync(path.join(root,url),data);manifest.syllables[job.key]={url,sha256:hash(data),bytes:data.length,numeric:job.numeric,kind:'source-recording',sourcePath:file,sourceBlob:entry.sha};done++;if(done%100===0){save();onProgress({stage:'recordings',done,total:jobs.length});}
 }}));save();
 const config=synthesizeMissing?tencentConfig():null;
 const source=read('data/sources.lock.json').sources.find(s=>s.id==='cedict');
 const dictionaryBytes=fs.readFileSync(path.join(root,'.cache/hf02',source.file));if(hash(dictionaryBytes)!==source.sha256)throw Error('Dictionary audio-context source hash mismatch');
 const rows=gunzipSync(dictionaryBytes).toString().split('\n').map((line,i)=>{
  const m=/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/.exec(line.trimEnd());return m?{text:m[2],numeric:m[3].toLowerCase().replaceAll('u:','ü'),meaning:m[4],sourceLocator:'cedict_ts.u8:line:'+(i+1)}:null;
 }).filter(Boolean);
 for(const job of missing){
  if(!config){
   const context=rows.filter(r=>r.numeric.split(' ').includes(job.numeric)&&[...r.text].length>1&&[...r.text].length<=4&&!/surname|variant of|Taiwan pr\.|archaic|dialect|onomatopoeia/i.test(r.meaning)).sort((a,b)=>a.text.length-b.text.length)[0];
   manifest.syllables[job.key]={numeric:job.numeric,kind:'browser-speech',text:context?.text||job.glyph,contextPinyin:context?.numeric||job.numeric,sourceLocator:context?.sourceLocator||'data/pinyin/readings.json',fallbackReason:'No matching static recording; Chinese example speech uses device voice.'};done++;continue;
  }
  const data=await synthesize({text:phonemeText(job.glyph,job.numeric)},config),url='audio/pronunciation-v1/'+job.key+'.mp3';if(data.length<1000)throw Error('Empty synthesized audio: '+job.key);
  fs.writeFileSync(path.join(root,url),data);manifest.syllables[job.key]={url,sha256:hash(data),bytes:data.length,numeric:job.numeric,kind:'synthetic-phoneme',text:job.glyph};done++;save();onProgress({stage:'phonemes',done,total:jobs.length});
 }
 const entries=[...read('data/editorial/characters.json').entries,...read('data/editorial/hsk-characters.json').entries];
 const scenarios=[...read('data/scenarios/scenarios.json').scenarios,...read('data/editorial/phase2/scenarios.json').scenarios];
 const texts=[...new Set([...entries.flatMap(e=>[e.word,e.sentence]),...scenarios.flatMap(s=>s.sentences.flatMap(x=>[x.text,...x.tokens.map(t=>t[0])])),...read('data/hsk/level-2-core.json').entries.map(e=>e.glyph)])].sort();
 let completed=0;
 for(const text of texts){const key=hash(text).slice(0,24);if(valid(manifest.utterances[key])){completed++;continue;}
  if(!config){manifest.utterances[key]={text,kind:'browser-speech'};completed++;continue;}
  const data=await synthesize({text},config),url='audio/pronunciation-v1/u-'+key+'.mp3';if(data.length<1000)throw Error('Empty synthesized sentence');fs.writeFileSync(path.join(root,url),data);manifest.utterances[key]={text,url,sha256:hash(data),bytes:data.length,kind:'synthetic-speech'};completed++;save();if(completed%25===0)onProgress({stage:'words-and-sentences',done:completed,total:texts.length});
 }
 const license=await (await fetch(`https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/${sourceCommit}/LICENSE`)).text();fs.writeFileSync(path.join(root,'data/licenses/Pinyin-Audio-Unlicense.txt'),license+'\n');
 save();return {syllables:Object.keys(manifest.syllables).length,recordings:Object.values(manifest.syllables).filter(r=>r.url).length,utterances:Object.keys(manifest.utterances).length,bytes:[...Object.values(manifest.syllables),...Object.values(manifest.utterances)].reduce((n,r)=>n+(r.bytes||0),0)};
}
