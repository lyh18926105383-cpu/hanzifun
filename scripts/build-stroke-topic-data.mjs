// Offline extraction from fixed, already downloaded upstream packages. No model fallback.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
import {allCharacters,findReading,readingLabel,lexicon} from '../site/hsk-data.mjs';
import {strokes} from '../site/dictionary-data.mjs';
import {parseCedict,pinyinForms,sha256} from './data-foundation-lib.mjs';
const require=createRequire(import.meta.url),cache='.cache/stroke-order-2026-11-13';
const upstream=path.resolve(cache,'cnchar/node_modules');
const cn=require(path.join(upstream,'cnchar'));
cn.use(require(path.join(upstream,'cnchar-order')),require(path.join(upstream,'cnchar-radical')));
if(cn.version!=='3.2.6')throw Error('Unexpected cnchar version');
const cedict=parseCedict(zlib.gunzipSync(fs.readFileSync('.cache/hf02/cedict.gz')).toString());
const assets=[...strokes,...lexicon.strokes];
const extras=JSON.parse(fs.readFileSync(path.join(cache,'yong-strokes.json'),'utf8'));
const yongEntry=cedict.find(x=>x.simplified==='永'&&x.pinyin==='yong3');
if(!yongEntry)throw Error('Missing sourced 永 reading');
const characters=[...allCharacters,{glyph:'永',characterId:'char:6c38',primaryReadingId:null,strokeCount:extras.strokes.length,radical:'水'}];
const issue=[],records=[];
const classFor=letter=>{
 const straight={j:1,i:1,f:2,g:2,s:3,k:4,d:4,l:4};
 if(Object.hasOwn(straight,letter))return straight[letter];
 // Turning families are an explicit closed set. 竖提 (h) is a turn, not class 2.
 if(['a','b','c','e','h','m','n','o','p','q','r','t','u','v','w','x','y','z'].includes(letter))return 5;
 throw Error('Unknown upstream stroke type; no inferred shape code: '+letter);
};
const structures={'左右结构':'Left–right','上下结构':'Top–bottom','独体结构':'Single-component','全包围结构':'Full enclosure','半包围结构':'Partial enclosure','上中下结构':'Top–middle–bottom','左中右结构':'Left–middle–right','品字结构':'Triple-component'};
for(const c of characters){
 const extra=c.glyph==='永',a=extra?{sha256:sha256(JSON.stringify(extras)),url:'data/stroke-order/strokes/6c38.json'}:assets.find(x=>x.characterId===c.characterId);
 if(!a)throw Error('Missing actual stroke asset '+c.glyph);
 const raw=extra?extras:JSON.parse(fs.readFileSync(a.url,'utf8'));
 const detail=cn.stroke(c.glyph,'order','detail')[0],rad=cn.radical(c.glyph)[0];
 if(!Array.isArray(detail)||detail.length!==raw.strokes.length||!rad?.struct){issue.push({glyph:c.glyph,reason:'cnchar sequence/count/structure missing or differs from outline source'});continue;}
 const r=extra?pinyinForms(yongEntry.pinyin):findReading(c.primaryReadingId).pinyin;
 const label=extra?{meaning:yongEntry.senses.join('; ')}:readingLabel(c);
 records.push({glyph:c.glyph,characterId:c.characterId,codepoint:c.characterId.slice(5),pinyin:r.marked,tone:r.numeric||r.numbered||r.syllables?.join(' '),meaning:label.meaning,
 radical:c.radical,structure:structures[rad.struct]||rad.struct,structureOriginal:rad.struct,strokeCount:raw.strokes.length,
 strokeTypes:detail.map(d=>({name:d.name,shape:d.shape,letter:d.letter,class:classFor(d.letter)})),
 strokeNumbers:detail.map((_,i)=>i+1),shapeCode:detail.map(d=>classFor(d.letter)).join(''),
 assetUrl:extra?'/data/stroke-order/strokes/6c38.json':'/'+a.url,assetSha256:extra?sha256(JSON.stringify(extras)+'\n'):a.sha256,
 dictionaryUrl:extra?null:'/dictionary/'+encodeURIComponent(c.glyph)+'/',
 source:{phonetics:extra?{release:'cedict',locator:yongEntry.sourceLocator}:{release:'cedict',readingId:c.primaryReadingId},radical:extra?'cnchar-radical-3.2.6':'existing Unihan/MMH normalized record',structure:'cnchar-radical-3.2.6',order:'cnchar-order-3.2.6',outlines:'hanzi-writer-data-2.0.1'}});
}
const folder='data/stroke-order';fs.mkdirSync(folder+'/strokes',{recursive:true});
fs.writeFileSync(folder+'/strokes/6c38.json',JSON.stringify(extras)+'\n');
const families=[['horizontal','横','j','Left to right'],['vertical','竖','f','Top to bottom'],['left-falling','撇','s','Upper right toward lower left'],['right-falling','捺','l','Upper left toward lower right'],['dot','点','k','A short diagonal mark'],['rising','提','i','Lower left toward upper right'],['hook','竖钩','g','Down, then a short hooked finish'],['turn','横折','c','Right, then turn downward without lifting']];
const exampleGlyphs=[...'我你好是中国学永'];
const basic=families.map(([id,name,letter,direction])=>{
 const examples=records.filter(c=>c.strokeTypes.some(t=>t.letter===letter)).sort((a,b)=>Number(exampleGlyphs.includes(b.glyph))-Number(exampleGlyphs.includes(a.glyph))).slice(0,5);
 const source=examples[0],index=source.strokeTypes.findIndex(t=>t.letter===letter);
 const entry=cedict.find(x=>x.simplified===name&&x.pinyin===({横:'heng2',竖:'shu4',撇:'pie3',捺:'na4',点:'dian3',提:'ti2',竖钩:'shu4 gou1',横折:'heng2 zhe2'}[name]));
 const parts=name.split('').map(g=>cedict.find(x=>x.simplified===g&&x.pinyin===({竖:'shu4',钩:'gou1',横:'heng2',折:'zhe2'}[g])));
 const py=entry?pinyinForms(entry.pinyin).marked:parts.every(Boolean)?parts.map(x=>pinyinForms(x.pinyin).marked).join(' '):null;
 if(!py||!source||examples.length<3)throw Error('Missing sourced teaching family '+id);
 return {id,name,pinyin:py,label:{horizontal:'Horizontal',vertical:'Vertical','left-falling':'Left-falling','right-falling':'Right-falling',dot:'Dot',rising:'Rising',hook:'Hook',turn:'Turn'}[id],letter,direction,sourceGlyph:source.glyph,sourceIndex:index,examples:examples.map(c=>c.glyph),sourceLocator:entry?.sourceLocator||parts.map(x=>x.sourceLocator).join('; ')};
});
const catalog={version:'stroke-topic-2026-11-13-v1',sourceDate:'2026-11-13',classification:'GF0023-2020 five main shapes; eight labelled learner families; no model-generated linguistic fields',examples:exampleGlyphs,characters:records,basic,issues:issue};
if(!exampleGlyphs.every(g=>records.some(c=>c.glyph===g)))throw Error('Missing mandatory example');
fs.writeFileSync(folder+'/catalog.json',JSON.stringify(catalog,null,2)+'\n');
const names=['cnchar','cnchar-order','cnchar-radical'];
const lock={version:1,date:'2026-11-13',sources:names.map(name=>{const root=path.join(upstream,name),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));const files=fs.readdirSync(root).filter(f=>/\.js$/.test(f));return {id:name,version:pkg.version,license:pkg.license,url:'https://www.npmjs.com/package/'+name+'/v/3.2.6',files:files.map(file=>({file,sha256:sha256(fs.readFileSync(path.join(root,file)))}))};}),priorSourceLock:'data/sources.lock.json',cedictSha256:sha256(fs.readFileSync('.cache/hf02/cedict.gz')),hanziArchiveSha256:sha256(fs.readFileSync('.cache/hf02/hanzi-writer-data-2.0.1.tgz')),catalogSha256:sha256(fs.readFileSync(folder+'/catalog.json'))};
fs.writeFileSync(folder+'/sources.lock.json',JSON.stringify(lock,null,2)+'\n');
fs.mkdirSync(folder+'/licenses',{recursive:true});
const licenseFile=fs.readdirSync(path.join(upstream,'cnchar')).find(n=>/^license/i.test(n));
if(licenseFile)fs.copyFileSync(path.join(upstream,'cnchar',licenseFile),folder+'/licenses/cnchar-MIT.txt');
else throw Error('Missing upstream cnchar license');
console.log(JSON.stringify({characters:records.length,examples:exampleGlyphs.length,basic:basic.length,issues:issue}));
