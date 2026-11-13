import {escapeHtml as e} from '../dictionary-data.mjs';
import {topicCatalog,topicCharacter,topicStroke,exampleId} from '../stroke-topic-data.mjs';
const base='/site-assets/stroke-topic/';
// Every pen movement takes 600 ms; the fully written character is held for 2000 ms.
function loopingStrokeSvg(c,{prefix,className,diagonals=false}){
 const data=topicStroke(c),drawMs=c.strokeCount*600,duration=drawMs+2000;
 const percent=ms=>Number((ms/duration*100).toFixed(8));
 const frames=data.strokes.map((_,i)=>`@keyframes ${prefix}-${i}{0%,${percent(i*600)}%{stroke-dashoffset:var(--st-length)}${percent((i+1)*600)}%,100%{stroke-dashoffset:0}}`).join('');
 const strokes=data.strokes.map((d,i)=>{
  const points=data.medians[i],length=Math.ceil(points.slice(1).reduce((n,p,j)=>n+Math.hypot(p[0]-points[j][0],p[1]-points[j][1]),0));
  return `<path d="${e(d)}" fill="#e7e0d3"/><path class="st-loop-ink${className==='st-hero-grid'?' st-hero-ink':''}" d="${points.map((p,j)=>(j?'L':'M')+p.join(' ')).join(' ')}" clip-path="url(#${prefix}-clip-${i})" fill="none" stroke="#b74432" stroke-width="180" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${length}" style="--st-length:${length};--st-animation:${prefix}-${i}"/>`;
 }).join('');
 return `<svg class="${className}" viewBox="0 0 1024 1024" width="320" height="320" role="img" aria-labelledby="${prefix}-title ${prefix}-desc" style="--st-duration:${duration}ms"><title id="${prefix}-title">Stroke order of ${e(c.glyph)}</title><desc id="${prefix}-desc">${c.strokeCount} strokes drawn in order on a ${diagonals?'square with horizontal, vertical and diagonal guides':'square with horizontal and vertical centre guides'}. After the character is complete, wait two seconds, then repeat. Hover over or focus the demonstration to pause.</desc><style>${frames}</style><defs>${data.strokes.map((d,i)=>`<clipPath id="${prefix}-clip-${i}"><path d="${e(d)}"/></clipPath>`).join('')}</defs><rect width="1024" height="1024" fill="#fcf8ef"/><path data-st-grid d="M512 0V1024M0 512H1024${diagonals?'M0 0L1024 1024M1024 0L0 1024':''}" fill="none" stroke="#c6b899" stroke-width="4" stroke-dasharray="12 12"/><g transform="translate(0,900) scale(1,-1)">${strokes}</g></svg>`;
}
export function heroStrokeDemo(c,note=''){
 return `<figure class="st-hero-demo st-loop-demo" data-st-hero data-st-loop data-st-character="${e(c.glyph)}" data-st-draw-ms="${c.strokeCount*600}" data-st-hold-ms="2000" tabindex="0" aria-label="Stroke order of ${e(c.glyph)}; focus to pause animation">${loopingStrokeSvg(c,{prefix:'st-hero-'+c.codepoint,className:'st-hero-grid'})}<figcaption><span class="st-hero-pinyin">${e(c.pinyin)}</span><span>${e(c.meaning)}</span></figcaption><div class="st-hero-note">${note}</div><noscript><p>Static reference: <span lang="zh-CN">${e(c.glyph)}</span> · ${c.strokeCount} strokes.</p></noscript></figure>`;
}
const ruleDemoGlyphs={'top-to-bottom':'二','left-to-right':'川','horizontal-before-vertical':'十','falling-strokes':'人','outside-before-inside':'月','close-last':'国','centre-before-sides':'小'};
export function ruleStrokeDemo(rule){
 const c=topicCharacter(ruleDemoGlyphs[rule.id]);
 return `<figure class="st-rule-demo st-loop-demo" data-st-loop data-st-rule-demo="${e(rule.id)}" data-st-character="${e(c.glyph)}" data-st-draw-ms="${c.strokeCount*600}" data-st-hold-ms="2000" tabindex="0" aria-label="${e(rule.title)}: stroke order of ${e(c.glyph)}; focus to pause animation">${loopingStrokeSvg(c,{prefix:'st-demo-'+rule.id,className:'st-rule-grid',diagonals:true})}<figcaption><span lang="zh-CN">${e(c.glyph)}</span> · ${c.strokeCount} strokes</figcaption></figure>`;
}
export const exampleLink=(g,label=g)=>exampleId(g)?`<a href="/stroke-order/examples/#${exampleId(g)}">${e(label)}</a>`:`<span lang="zh-CN">${e(g)}</span>`;
export const anchorNav=items=>`<nav class="st-anchor-nav" aria-label="On this page"><ul>${items.map(([id,label])=>`<li><a href="#${id}">${e(label)}</a></li>`).join('')}</ul></nav>`;
export const faqBlock=items=>`<section id="faq" class="st-section st-faq"><h2>Questions about ${e(items.topic||'stroke order')}</h2>${items.map(x=>`<details><summary>${e(x.q)}</summary><div>${x.a}</div></details>`).join('')}</section>`;
export const practiceSheetCTA=()=>`<aside class="st-practice"><div><span class="st-kicker">PAPER, PEN, A LITTLE PRACTICE</span><h3>Make room for your next character.</h3><p>Eight worked examples, stroke guides and blank writing grids. Free to download. No account or email needed.</p></div><div class="st-downloads"><a class="button" download href="${base}practice-a4.pdf">Download A4 PDF <span aria-hidden="true">↓</span></a><a class="st-text-link" download href="${base}practice-letter.pdf">US Letter PDF <span aria-hidden="true">↗</span></a></div></aside>`;
export function strokeDataTable(c,{id=''}={}){
 return `<div class="st-table-wrap" tabindex="0" role="region" aria-label="Character data for ${e(c.glyph)}"><table class="st-data-table" ${id?`id="${e(id)}"`:''}><caption>Writing reference · <span lang="zh-CN">${e(c.glyph)}</span></caption><tbody>${[
 ['Pinyin',c.pinyin],['Tone',String(c.tone||'').match(/[1-5]/g)?.join(', ')||'See pinyin'],['Radical',`<span lang="zh-CN">${e(c.radical)}</span>`],['Stroke count',c.strokeCount],['Structure',c.structure],['Stroke type sequence',`<span lang="zh-CN">${c.strokeTypes.map(x=>e(x.name.replaceAll('|',' / '))).join(' → ')}</span>`],['Step numbers',c.strokeNumbers.join(' → ')],['Five-shape code',`<code>${c.shapeCode}</code>`]
 ].map(([k,v])=>`<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></div>`;
}
export function staticFallback(c,{eager=false}={}){
 const columns=Math.min(6,c.strokeCount),rows=Math.ceil(c.strokeCount/columns);
 return `<figure class="st-static" tabindex="0" aria-label="Scrollable numbered stroke sequence"><img src="${base}static/${c.codepoint}.svg" width="${columns*180}" height="${rows*205}" loading="${eager?'eager':'lazy'}" alt="${e(c.glyph)} in ${c.strokeCount} numbered panels, with each new stroke shown in red"><figcaption>Follow the red stroke in each numbered panel. Step order: ${c.strokeNumbers.join(' → ')}.</figcaption></figure>`;
}
export function strokePlayer(c,{compact=false,embed=false}={}){
 return `<div class="st-player${compact?' st-player-compact':''}" data-st-player data-st-character="${e(c.glyph)}" data-codepoint="${c.codepoint}" data-st-src="${base}characters/${c.codepoint}.json"><div class="st-stage" data-st-stage aria-label="Writing viewer for ${e(c.glyph)}"><img src="${base}glyph/${c.codepoint}.svg" width="320" height="320" loading="lazy" alt="Complete reference shape of ${e(c.glyph)}"></div><div class="st-player-body"><p class="st-player-count" data-st-count role="status">${c.strokeCount} strokes · ready when you are</p><div class="st-controls"><button type="button" data-st-action="play">Play</button><button type="button" data-st-action="pause">Pause</button><button type="button" data-st-action="replay">Replay</button><button type="button" data-st-action="previous" aria-label="Previous stroke of ${e(c.glyph)}">Previous</button><button type="button" data-st-action="next" aria-label="Next stroke of ${e(c.glyph)}">Next</button><label>Speed <select data-st-speed aria-label="Playback speed for ${e(c.glyph)}"><option value="700">Normal</option><option value="1200">Slow</option><option value="350">Fast</option></select></label><button type="button" data-st-action="trace" aria-pressed="false">Trace</button><button type="button" data-st-action="clear">Clear tracing</button></div><p class="st-player-help" data-st-help>Play, step through, or trace this character. Tracing is not graded.</p>${!embed?`<p class="st-source-line">Mainland reference outlines · Hanzi Writer / Make Me a Hanzi · <a href="/data-sources/">Arphic licence</a></p>`:''}</div><noscript>${staticFallback(c)}<p>JavaScript is off. Read the numbered static steps instead.</p></noscript></div>`;
}
export function singleStroke(family){
 return `<figure class="st-single" data-st-single><img src="${base}single/${family.id}.svg" width="240" height="200" loading="lazy" alt="Isolated ${e(family.label.toLowerCase())} stroke, drawn from ${e(family.sourceGlyph)}"><button type="button" data-st-single-toggle aria-pressed="false">Play single stroke</button><figcaption>${e(family.direction)}. One pen movement.</figcaption><noscript><style>.st-single>img{display:none}</style><img src="${base}single/${family.id}.svg" width="240" height="200" loading="lazy" alt="Static isolated ${e(family.label.toLowerCase())} stroke"><p>One continuous stroke. Read from the start dot toward the tip: ${e(family.direction)}.</p></noscript></figure>`;
}
export const ruleDefinitions=[
 {id:'top-to-bottom',title:'Top to bottom',summary:'Complete an upper stroke or component before the one below it.',glyphs:['是','学'],focus:[4,5]},
 {id:'left-to-right',title:'Left to right',summary:'For side-by-side components, write the left component before the right.',glyphs:['你','好'],focus:[2,3]},
 {id:'horizontal-before-vertical',title:'Horizontal before a crossing vertical',summary:'A horizontal normally precedes a vertical that crosses it; check the complete sequence.',glyphs:['国','我'],focus:[4,5]},
 {id:'falling-strokes',title:'Left-falling before right-falling',summary:'A paired left-falling stroke normally comes before its right-falling partner.',glyphs:['永','是'],focus:[4,5]},
 {id:'outside-before-inside',title:'Outside before inside',summary:'Begin an enclosing shape, then write what belongs inside it.',glyphs:['国','中'],focus:[1,2]},
 {id:'close-last',title:'Close the enclosure after its contents',summary:'Leave the bottom closing stroke until the contents of the enclosure are complete.',glyphs:['国','日'],focus:[7,8]},
 {id:'centre-before-sides',title:'Centre before symmetrical sides, where applicable',summary:'Some symmetrical characters begin with a central stroke, then the left and right sides.',glyphs:['小','水'],focus:[1,2]}
];
export function ruleFocus(rule){return `<div class="st-rule-pair">${rule.glyphs.map(g=>{const c=topicCharacter(g);return `<figure class="st-rule-focus" data-rule-focus><img src="${base}focus/${rule.id}-${c.codepoint}.svg" width="320" height="200" loading="lazy" alt="Two numbered key stages for ${e(g)} illustrating ${e(rule.title.toLowerCase())}"><figcaption><span lang="zh-CN">${e(g)}</span> · a focused comparison, not a complete playback${exampleId(g)?' · '+exampleLink(g,'View the complete example'):''}</figcaption></figure>`;}).join('')}</div>`;}
export function validateTopicData(){
 for(const c of topicCatalog.characters)topicStroke(c);
 if(topicCatalog.basic.length!==8)throw Error('Eight sourced teaching families required');
}
