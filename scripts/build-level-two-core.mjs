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
 const entries=rows.filter(r=>[...r.glyph].every(g=>gs.has(g))).map(r=>{
  const matches=dict.filter(x=>x.simplified===r.glyph);if(!matches.length)throw Error('No dictionary reading: '+r.glyph);
  return {...r,itemId:'word:'+Array.from(r.glyph,g=>g.codePointAt(0).toString(16)).join('-'),system:'hsk-2',edition:'2015-vocabulary',level:'2',cumulative:false,characterIds:Array.from(new Set([...r.glyph]),g=>'char:'+g.codePointAt(0).toString(16)),readings:matches.map(x=>({pinyin:pinyinForms(x.pinyin),senses:x.senses,traditional:x.traditional,sourceLocator:x.sourceLocator}))};
 });
 return {version:'hf12-level-two-core-v1',sourceReleaseId:source.id,sourceSha256:source.sha256,dictionarySourceSha256:cedict.sha256,sourceCount:150,coveredCount:entries.length,scope:'Additional HSK 2.0 level-2 headwords whose constituent characters already have complete site pages; a subset, not the complete level-2 syllabus. HSK 3.0 remains level 1.',entries,deferred:rows.filter(r=>!entries.some(e=>e.ordinal===r.ordinal)),contentSha256:sha256(JSON.stringify(entries))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const value=levelTwoCore(),file=root+'/data/hsk/level-2-core.json';if(process.argv.includes('--check')){if(JSON.stringify(readJSON('data/hsk/level-2-core.json'))!==JSON.stringify(value))throw Error('Level-2 subset is stale');}else fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');console.log(JSON.stringify({covered:value.coveredCount,sourceCount:value.sourceCount,deferred:value.deferred.length,sha256:value.contentSha256}));}
