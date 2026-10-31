// Bounded second-level membership facts from the already hash-locked 2015 XLSX.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
import {root,readJSON,fileHash,parseCedict,pinyinForms,sha256} from './data-foundation-lib.mjs';
export function levelTwoCore(){
 const lock=readJSON('data/sources.lock.json'),source=lock.sources.find(s=>s.id==='hsk-2-2015'),xlsx='.cache/hf07/HSK-2015.xlsx';
 if(fileHash(xlsx)!==source.sha256)throw Error('HSK XLSX hash mismatch');
 const rows=JSON.parse(execFileSync('python3',['-c',String.raw`import sys,json,re,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]);n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
st=[''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',n)];rows=[]
for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',n):
 c={}
 for e in row:
  v=e.findtext('s:v',default='',namespaces=n);c[e.get('r')[0]]=st[int(v)] if e.get('t')=='s' else v
 if c.get('A')=='2':rows.append(dict(glyph=re.sub(r'（[^）]*）','',c['B']),sourceLabel=c['B'],sourceLocator='xlsx:新HSK5000词:A'+row.get('r')+':B'+row.get('r'),ordinal=len(rows)+1))
print(json.dumps(rows,ensure_ascii=False))`,xlsx],{cwd:root,encoding:'utf8'}));
 if(rows.length!==150)throw Error('Expected 150 additional level-2 headwords');
 const chars=[...readJSON('data/normalized/characters.json'),...readJSON('data/hsk/lexicon.json').characters],gs=new Set(chars.map(c=>c.glyph));
 const cedict=lock.sources.find(s=>s.id==='cedict'),archive='.cache/hf02/'+cedict.file;if(fileHash(archive)!==cedict.sha256)throw Error('Dictionary hash mismatch');
 const dict=parseCedict(gunzipSync(fs.readFileSync(root+'/'+archive)).toString());
 const byGlyph=new Map();for(const r of dict){const values=byGlyph.get(r.simplified)||[];values.push(r);byGlyph.set(r.simplified,values);}
 const input=readJSON('data/editorial/hsk-level-2-examples.json'),examples=new Map(input.entries.map(e=>[e.glyph,e]));
 const compounds={'打篮球':['打','篮球'],'踢足球':['踢','足球'],'虽然……但是……':['虽然','但是'],'因为……所以……':['因为','所以']};
 const compoundGloss={'打篮球':'to play basketball','踢足球':'to play football (soccer)','虽然……但是……':'although ... , ... (contrasting clauses)','因为……所以……':'because ... , ... (reason and result)'};
 const entries=rows.map(r=>{
  const parts=compounds[r.glyph],matches=byGlyph.get(r.glyph)||[];
  const readings=matches.map(x=>({pinyin:pinyinForms(x.pinyin),senses:x.senses,traditional:x.traditional,sourceLocator:x.sourceLocator}));
  if(!readings.length&&parts){
   let syllableOffset=0;const expected=pinyinForms(examples.get(r.glyph).reading).syllables;const chosen=parts.map(g=>{const wanted=expected.slice(syllableOffset,syllableOffset+g.length).join(' ');syllableOffset+=g.length;const found=byGlyph.get(g)?.find(x=>pinyinForms(x.pinyin).numeric===wanted);if(!found)throw Error('Missing compound witness: '+g);return found;});
   readings.push({pinyin:pinyinForms(chosen.map(x=>x.pinyin).join(' ')),senses:[compoundGloss[r.glyph]],traditional:chosen.map(x=>x.traditional).join(parts.length&&r.glyph.includes('……')?'……':''),sourceLocator:chosen.map(x=>x.sourceLocator).join(';'),derivation:'composed-from-attested-parts',parts:chosen.map(x=>({glyph:x.simplified,pinyin:pinyinForms(x.pinyin),sourceReleaseId:'cedict',sourceLocator:x.sourceLocator}))});
  }
  if(!readings.length)throw Error('No dictionary reading: '+r.glyph);
  const glyphs=[...new Set([...r.glyph].filter(g=>/\p{Script=Han}/u.test(g)))];
  const bindings=glyphs.map(g=>({glyph:g,characterId:'char:'+g.codePointAt(0).toString(16),status:gs.has(g)?'published':'next-character-batch',path:gs.has(g)?'/dictionary/'+g+'/':null}));
  const example=examples.get(r.glyph);
  let teaching;
  if(example){
   const selected=pinyinForms(example.reading),reading=readings.find(x=>x.pinyin.numeric===selected.numeric);
   if(!reading)throw Error('Example reading has no dictionary witness: '+r.glyph+' '+selected.numeric);
   const text=[...example.sentence].filter(g=>/\p{Script=Han}/u.test(g)),syllables=pinyinForms(example.numeric).syllables;
   if(text.length!==syllables.length)throw Error('Example pinyin alignment: '+r.glyph);
   const anchors=parts&&r.glyph.includes('……')?parts:[r.glyph];let cursor=0;
   for(const part of anchors){const pos=example.sentence.indexOf(part,cursor);if(pos<0)throw Error('Example missing word: '+r.glyph);cursor=pos+part.length;}
   teaching={reading:selected,readingSourceLocators:reading.sourceLocator.split(';'),sentence:example.sentence,pinyin:pinyinForms(example.numeric),translation:example.translation,reviewStatus:input.reviewStatus,author:input.author,tokens:text.map((g,i)=>({glyph:g,pinyin:pinyinForms(syllables[i]),characterId:'char:'+g.codePointAt(0).toString(16),path:gs.has(g)?'/dictionary/'+g+'/':null}))};
  }
  return {...r,itemId:'word:'+Array.from(r.glyph,g=>g.codePointAt(0).toString(16)).join('-'),system:'hsk-2',edition:'2015-vocabulary',level:'2',cumulative:false,characterIds:bindings.map(b=>b.characterId),readings,constituentBindings:bindings,...(teaching?{teaching}:{}),...(parts?{lexicalParts:parts}:{})};
 });
 const missing=new Map();for(const w of entries)for(const b of w.constituentBindings)if(!b.path){const row=missing.get(b.characterId)||{...b,wordIds:[],sourceLocators:[]};row.wordIds.push(w.itemId);row.sourceLocators.push(w.sourceLocator);missing.set(b.characterId,row);}
 return {version:'hf14-level-two-core-v2',sourceReleaseId:source.id,sourceSha256:source.sha256,dictionarySourceSha256:cedict.sha256,sourceCount:150,coveredCount:entries.length,fullyLinkedCount:entries.filter(w=>w.constituentBindings.every(b=>b.path)).length,exampleCount:entries.filter(w=>w.teaching).length,scope:'All 150 additional HSK 2.0 level-2 membership entries. Level 1 remains a separate 150-word list (300 cumulative). Character-page coverage is counted separately; no unpublished character gets a dictionary link or a practice card. HSK 3.0 remains level 1.',entries,deferred:[],nextCharacterBatch:[...missing.values()],contentSha256:sha256(JSON.stringify(entries))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const value=levelTwoCore(),file=root+'/data/hsk/level-2-core.json';if(process.argv.includes('--check')){if(JSON.stringify(readJSON('data/hsk/level-2-core.json'))!==JSON.stringify(value))throw Error('Level-2 data is stale');}else fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');console.log(JSON.stringify({covered:value.coveredCount,fullyLinked:value.fullyLinkedCount,examples:value.exampleCount,nextCharacters:value.nextCharacterBatch.length,sourceCount:value.sourceCount,deferred:value.deferred.length,sha256:value.contentSha256}));}
