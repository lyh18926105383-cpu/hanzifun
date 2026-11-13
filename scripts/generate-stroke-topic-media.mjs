import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('/Users/graceshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
import {topicCatalog,topicCharacter,topicStroke,exampleCharacters} from '../site/stroke-topic-data.mjs';
import {staticStrokeSvg,completeGlyphSvg} from '../site/components/stroke-order.mjs';
import {ruleDefinitions} from '../site/components/stroke-topic.mjs';
import {escapeHtml as e} from '../site/dictionary-data.mjs';
const root='public/stroke-topic',temp='.cache/stroke-order-2026-11-13/gif-frames';
const write=(file,text)=>{const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);};
const start='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">';
const grid='<rect width="1024" height="1024" fill="#fcf8ef"/><path d="M512 0V1024M0 512H1024M0 0L1024 1024M1024 0L0 1024" stroke="#ded8cb" stroke-width="4" stroke-dasharray="12 12"/>';
function frame(c,step){return start+`<title>${e(c.glyph)} · stroke ${step} of ${c.strokeCount}</title><desc>Hanzi Writer 2.0.1 / Make Me a Hanzi. Arphic Public License.</desc>`+grid+'<g transform="translate(0,900) scale(1,-1)">'+topicStroke(c).strokes.map((p,i)=>`<path d="${e(p)}" fill="${i<step?(i===step-1?'#b74432':'#243d35'):'#e7e0d3'}"/>`).join('')+'</g></svg>';}
for(const c of topicCatalog.characters){
 const raw=topicStroke(c);write('characters/'+c.codepoint+'.json',JSON.stringify({...c,...raw})+'\n');
}
for(const c of [...exampleCharacters,topicCharacter('水')]){
 const raw=topicStroke(c);write('static/'+c.codepoint+'.svg',staticStrokeSvg(c.glyph,raw));write('glyph/'+c.codepoint+'.svg',completeGlyphSvg(c.glyph,raw,c.assetSha256));
 const duration=2.8,paths=raw.strokes.map((d,i)=>`<path class="stroke s${i}" d="${e(d)}" fill="#243d35"/>`).join('');
 write('animated/'+c.codepoint+'.svg',start+`<title>${e(c.glyph)} stroke-order loop</title><desc>Numbered sequence in the accompanying guide. Hanzi Writer 2.0.1 / Make Me a Hanzi, Arphic Public License.</desc><style>${raw.strokes.map((_,i)=>`.s${i}{animation:show${i} ${duration}s infinite}@keyframes show${i}{0%,${Math.round((i+.3)/(raw.strokes.length+2)*100)}%{opacity:0}${Math.round((i+.5)/(raw.strokes.length+2)*100)}%,90%{opacity:1}100%{opacity:0}}`).join('')}@media(prefers-reduced-motion:reduce){.stroke{animation:none}}</style>`+grid+'<g transform="translate(0,900) scale(1,-1)">'+paths+'</g></svg>');
 if(exampleCharacters.includes(c)){
  const dir=path.join(temp,c.codepoint);fs.mkdirSync(dir,{recursive:true});
  for(let i=0;i<=c.strokeCount;i++)await sharp(Buffer.from(frame(c,i))).resize(192,192).png().toFile(path.join(dir,String(i)+'.png'));
 }
}
for(const family of topicCatalog.basic){
 const c=topicCharacter(family.sourceGlyph),raw=topicStroke(c),p=raw.strokes[family.sourceIndex],median=raw.medians[family.sourceIndex],[x,y]=median[0];
 const body=grid+`<g transform="translate(0,900) scale(1,-1)"><path d="${e(p)}" fill="#b74432"/><circle cx="${x}" cy="${y}" r="16" fill="#243d35"/></g>`;
 write('single/'+family.id+'.svg',start+`<title>${e(family.label)}: ${e(family.name)}</title><desc>One actual stroke extracted from ${e(c.glyph)}. Hanzi Writer / Make Me a Hanzi, Arphic Public License.</desc>`+body+'</svg>');
 const line=median.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');
 write('single/'+family.id+'-animated.svg',start+`<title>${e(family.label)} stroke direction</title><desc>One continuous stroke; follow the red reveal from the green start dot. Arphic Public License.</desc><defs><clipPath id="stroke"><path d="${e(p)}"/></clipPath></defs><style>.reveal{stroke-dasharray:2400;animation:write 2s linear infinite}@keyframes write{0%{stroke-dashoffset:2400}75%,100%{stroke-dashoffset:0}}@media(prefers-reduced-motion:reduce){.reveal{animation:none;stroke-dashoffset:0}}</style>`+grid+`<g transform="translate(0,900) scale(1,-1)"><path d="${e(p)}" fill="#e7e0d3"/><path class="reveal" d="${line}" fill="none" stroke="#b74432" stroke-width="180" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#stroke)"/><circle cx="${x}" cy="${y}" r="16" fill="#243d35"/></g></svg>`);
}
for(const rule of ruleDefinitions)for(const g of rule.glyphs){
 const c=topicCharacter(g),raw=topicStroke(c),steps=rule.id==='close-last'?[c.strokeCount-1,c.strokeCount]:(rule.id==='top-to-bottom'&&g==='学'?[5,6]:rule.id==='left-to-right'&&g==='好'?[3,4]:rule.id==='horizontal-before-vertical'&&g==='我'?[2,3]:rule.id==='falling-strokes'&&g==='是'?[8,9]:rule.focus).map(s=>Math.min(s,c.strokeCount));
 const parts=steps.map((s,i)=>`<g transform="translate(${i*520},0)"><svg width="500" height="500" viewBox="0 0 1024 1024">${grid}<g transform="translate(0,900) scale(1,-1)">${raw.strokes.map((d,j)=>`<path d="${e(d)}" fill="${j<s?(j===s-1?'#b74432':'#243d35'):'#e7e0d3'}"/>`).join('')}</g></svg><text x="250" y="560" text-anchor="middle" fill="#243d35" font-size="45">Step ${s}</text></g>`).join('');
 write('focus/'+rule.id+'-'+c.codepoint+'.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 600"><title>${e(g)} key steps ${steps.join(' and ')}</title><desc>Two selected stages, not the complete sequence. Hanzi Writer / Make Me a Hanzi, Arphic Public License.</desc>${parts}</svg>`);
}
write('catalog.json',JSON.stringify(topicCatalog)+'\n');
write('sources.lock.json',fs.readFileSync('data/stroke-order/sources.lock.json'));
write('licenses/cnchar-MIT.txt',fs.readFileSync('data/stroke-order/licenses/cnchar-MIT.txt'));
write('licenses/Arphic-Public-License.txt',fs.readFileSync('data/licenses/Arphic-Public-License.txt'));
write('licenses/CC-BY-SA-4.0.txt',fs.readFileSync('data/licenses/CC-BY-SA-4.0.txt'));
write('ATTRIBUTION.txt','HanziFun stroke resources\nOutlines: Hanzi Writer data 2.0.1, adapted from Make Me a Hanzi; Arphic Public License.\nNames/order: cnchar and cnchar-order 3.2.6, MIT, theajack.\nDictionary readings: CC-CEDICT (2026-10-23), CC BY-SA 4.0.\nOriginal teaching material and arrangement: HanziFun, 2026-11-13.\nSource, complete licences and notices: https://hanzifun.online/data-sources/\nSequence classifications are mainland reference sequences, not claims of universal regional agreement.\n');
console.log('Generated source-matched static, isolated, animated SVG and lookup JSON resources. GIF frames ready in '+temp);
