const BASE='/site-assets/stroke-topic/';
const cache=new Map(),players=new Set();
for(const root of document.querySelectorAll('[data-st-loop]')){
 const update=()=>{root.dataset.stReady='true';root.dataset.stPaused=String(document.hidden);};
 document.addEventListener('visibilitychange',update);update();
}
const elem=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const svgElem=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
const read=async url=>{
 if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Resource load failed');return r.json();}).catch(e=>{cache.delete(url);throw e;}));
 return cache.get(url);
};
function player(root){
 root.dataset.stReady='true';
 const stage=root.querySelector('[data-st-stage]'),status=root.querySelector('[data-st-count]'),help=root.querySelector('[data-st-help]');
 let data,position=0,timer=0,animation=0,revision=0,playing=false,tracing=false,svg,traceGroup,tracePath;
 function pause(){playing=false;revision++;clearTimeout(timer);cancelAnimationFrame(animation);}
 function draw(){
  const title=`${root.dataset.stCharacter}: ${position} of ${data.strokes.length} strokes`;
  svg=svgElem('svg',{viewBox:'0 0 1024 1024',role:'img','aria-label':title});
  svg.append(svgElem('rect',{width:1024,height:1024,fill:'#fcf8ef'}));svg.append(svgElem('path',{d:'M512 0V1024M0 512H1024M0 0L1024 1024M1024 0L0 1024',stroke:'#d7ccba','stroke-dasharray':'12 12',fill:'none','stroke-width':3}));
  const g=svgElem('g',{transform:'translate(0,900) scale(1,-1)'});
  data.strokes.forEach((d,i)=>g.append(svgElem('path',{d,fill:i<position?(i===position-1?'#b74432':'#243d35'):'#e7e0d3'})));
  svg.append(g);traceGroup=svgElem('g',{'data-trace-layer':'',fill:'none',stroke:'#416f9a','stroke-width':14,'stroke-linecap':'round','stroke-linejoin':'round'});svg.append(traceGroup);stage.replaceChildren(svg);
  status.textContent=`${position} / ${data.strokes.length} strokes`;
  attachTrace();
 }
 async function load(){
  if(data)return true;status.textContent='Loading this writing reference…';
  try{const value=await read(root.dataset.stSrc);if(!Array.isArray(value.strokes)||!value.strokes.length||value.strokes.length!==value.medians?.length)throw Error('Invalid sequence');data=value;draw();return true;}
  catch{status.textContent='The player could not load. Use the numbered diagram below, or press Play to retry.';return false;}
 }
 function animateStroke(index,done){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){timer=setTimeout(done,Number(root.querySelector('[data-st-speed]').value));return;}
  const g=svg.querySelector('g'),path=g.children[index],points=data.medians[index];
  if(!points?.length){timer=setTimeout(done,Number(root.querySelector('[data-st-speed]').value));return;}
  const clip=svgElem('clipPath',{id:'st-clip-'+root.dataset.codepoint+'-'+index});clip.append(svgElem('path',{d:data.strokes[index]}));
  const defs=svgElem('defs');defs.append(clip);svg.append(defs);path.setAttribute('fill','#e7e0d3');
  const reveal=svgElem('path',{d:points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' '),fill:'none',stroke:'#b74432','stroke-width':180,'stroke-linecap':'round','stroke-linejoin':'round','clip-path':`url(#st-clip-${root.dataset.codepoint}-${index})`});g.append(reveal);
  const length=reveal.getTotalLength();reveal.setAttribute('stroke-dasharray',length);reveal.setAttribute('stroke-dashoffset',length);
  const start=performance.now(),duration=Number(root.querySelector('[data-st-speed]').value),version=revision;
  const tick=now=>{if(!playing||revision!==version)return;const ratio=Math.min(1,(now-start)/duration);reveal.setAttribute('stroke-dashoffset',length*(1-ratio));if(ratio<1)animation=requestAnimationFrame(tick);else timer=setTimeout(done,100);};animation=requestAnimationFrame(tick);
 }
 function advance(){
  if(!playing)return;if(position>=data.strokes.length){playing=false;draw();status.textContent=`Complete · ${data.strokes.length} strokes. Replay or try tracing.`;return;}
  position++;draw();animateStroke(position-1,advance);
 }
 let cursor=[512,512];
 function attachTrace(){
  svg.style.touchAction=tracing?'none':'auto';svg.setAttribute('tabindex',tracing?'0':'-1');
  const point=e=>{const r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*1024,(e.clientY-r.top)/r.height*1024];};
  const begin=p=>{tracePath=svgElem('path',{d:'M'+p.join(' ')});traceGroup.append(tracePath);};
  const extend=p=>{tracePath?.setAttribute('d',tracePath.getAttribute('d')+'L'+p.join(' '));};
  svg.addEventListener('pointerdown',e=>{if(!tracing)return;e.preventDefault();svg.setPointerCapture(e.pointerId);begin(point(e));});
  svg.addEventListener('pointermove',e=>{if(tracing&&tracePath&&svg.hasPointerCapture(e.pointerId))extend(point(e));});
  for(const event of ['pointerup','pointercancel'])svg.addEventListener(event,e=>{if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);tracePath=null;});
  svg.addEventListener('keydown',e=>{if(!tracing)return;const moves={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(moves[e.key]){e.preventDefault();cursor=cursor.map((v,i)=>Math.max(0,Math.min(1024,v+moves[e.key][i])));extend(cursor);}else if(e.key==='Enter'){e.preventDefault();tracePath?tracePath=null:begin(cursor);}else if(e.key==='Escape'){tracePath=null;root.querySelector('[data-st-action="trace"]').focus();}});
 }
 root.querySelectorAll('[data-st-action]').forEach(b=>b.addEventListener('click',async()=>{
  const action=b.dataset.stAction;if(action==='pause'){pause();if(data)draw();return;}
  pause();const current=revision;if(!await load()||revision!==current)return;
  if(action==='play'||action==='replay'){
   players.forEach(p=>{if(p.root!==root)p.pause();});if(action==='replay'||position>=data.strokes.length)position=0;
   tracing=false;root.querySelector('[data-st-action="trace"]').setAttribute('aria-pressed','false');playing=true;advance();
  }else if(action==='next'){position=Math.min(data.strokes.length,position+1);draw();}
  else if(action==='previous'){position=Math.max(0,position-1);draw();}
  else if(action==='trace'){
   tracing=!tracing;position=data.strokes.length;draw();b.setAttribute('aria-pressed',String(tracing));
   help.textContent=tracing?'Trace over the model with a finger or pointer. Keyboard: focus the square, Enter starts or ends a line, arrows move, Escape returns to Trace.':'Play or step through the sequence. Tracing is practice, not automatic grading.';if(tracing)svg.focus();
  }else if(action==='clear'){traceGroup?.replaceChildren();tracePath=null;help.textContent='Practice marks cleared. The source character is unchanged.';}
 }));
 const api={root,pause:()=>{pause();if(data)draw();}};players.add(api);return api;
}
document.querySelectorAll('[data-st-player]').forEach(player);
document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(p=>p.pause());});
window.addEventListener('pagehide',()=>players.forEach(p=>p.pause()));
const form=document.querySelector('[data-st-lookup]');
if(form){
 form.dataset.stReady='true';let operation=0;
 const status=document.querySelector('[data-st-lookup-status]'),result=document.querySelector('[data-st-lookup-result]');
 const select=async value=>{
  const id=++operation,glyph=String(value||'').normalize('NFC').trim();
  if([...glyph].length!==1||!/\p{Script=Han}/u.test(glyph)){status.textContent='Enter one Chinese character, such as 水 or 永.';return;}
  status.textContent='Checking this character…';
  try{
   const catalog=await read(BASE+'catalog.json');if(id!==operation)return;const c=catalog.characters.find(c=>c.glyph===glyph);
   if(!c){status.textContent='This character is not in the current collection. Try 水, 我, 国, 好 or 永.';return;}
   form.elements.char.value=glyph;result.replaceChildren();const h=elem('h3',`${glyph} · ${c.pinyin}`);h.lang='zh-CN';result.append(h);
   const wrap=elem('div');wrap.className='st-table-wrap';wrap.tabIndex=0;wrap.role='region';wrap.setAttribute('aria-label','Writing reference for '+glyph);
   const table=elem('table'),body=elem('tbody');table.className='st-data-table';table.append(elem('caption','Writing reference · '+glyph));
   for(const [key,value]of [['Pinyin',c.pinyin],['Tone',String(c.tone||'').match(/[1-5]/g)?.join(', ')||'See pinyin'],['Radical',c.radical],['Stroke count',c.strokeCount],['Structure',c.structure],['Stroke type sequence',c.strokeTypes.map(x=>x.name.replaceAll('|',' / ')).join(' → ')],['Step numbers',c.strokeNumbers.join(' → ')],['Five-shape code',c.shapeCode]]){const row=elem('tr'),th=elem('th',key);th.scope='row';row.append(th,elem('td',String(value)));body.append(row);}table.append(body);wrap.append(table);result.append(wrap);
   const raw=await read(BASE+'characters/'+c.codepoint+'.json');if(id!==operation)return;
   const figure=elem('figure');figure.className='st-inline-sequence';
   raw.strokes.forEach((_,i)=>{const item=elem('div'),svg=svgElem('svg',{viewBox:'0 0 1024 1024',role:'img','aria-label':`${glyph}: step ${i+1}`}),g=svgElem('g',{transform:'translate(0,900) scale(1,-1)'});raw.strokes.slice(0,i+1).forEach((d,j)=>g.append(svgElem('path',{d,fill:j===i?'#b74432':'#243d35'})));svg.append(g);item.append(svg,elem('span',String(i+1)));figure.append(item);});result.append(figure);
   const links=elem('p');if(c.dictionaryUrl){const a=elem('a','Read this character in the dictionary');a.href=c.dictionaryUrl;links.append(a,document.createTextNode('. '));}
   const ix=catalog.examples.indexOf(glyph),ids=['wo','ni','hao','shi','zhong','guo','xue','yong'];const a=elem('a',ix>=0?'Open this complete worked lesson':'Follow a complete worked lesson');a.href='/stroke-order/examples/#'+(ix>=0?ids[ix]:'yong');links.append(a);result.append(links);
   status.textContent=`${glyph}: ${c.strokeCount} strokes. The result stays on this page.`;
  }catch{if(id===operation)status.textContent='The writing reference could not load. Try again, or use the worked examples below.';}
 };
 form.addEventListener('submit',e=>{e.preventDefault();select(form.elements.char.value);});
 form.querySelectorAll('[data-st-pick]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.stPick)));
 const old=new URLSearchParams(location.search).get('char');if(old)select(old);
}
document.querySelectorAll('[data-st-single-toggle]').forEach(b=>{
 b.dataset.stReady='true';b.addEventListener('click',()=>{const img=b.closest('[data-st-single]').querySelector('img'),active=b.getAttribute('aria-pressed')==='true';img.src=active?img.src.replace('-animated.svg','.svg'):img.src.replace('.svg','-animated.svg');b.setAttribute('aria-pressed',String(!active));b.textContent=active?'Play single stroke':'Pause single stroke';});
});
document.querySelectorAll('[data-st-preview-toggle]').forEach(b=>{
 b.dataset.stReady='true';b.addEventListener('click',()=>{const img=b.closest('[data-st-media]').querySelector('[data-st-preview]'),active=b.getAttribute('aria-pressed')==='true';img.src=BASE+(active?'glyph/':'animated/')+img.dataset.stPreview+'.svg';b.setAttribute('aria-pressed',String(!active));b.textContent=active?'Play preview':'Stop preview';});
});
const filter=document.querySelector('[data-st-gallery-filter]');
if(filter){
 filter.dataset.stReady='true';const gallery=document.querySelector('[data-st-gallery]'),cards=[...gallery.children];
 const update=()=>{let visible=0;const {radical,group,sort}=filter.elements;const ordered=[...cards];if(sort.value!=='lesson')ordered.sort((a,b)=>(Number(a.dataset.count)-Number(b.dataset.count))*(sort.value==='most'?-1:1));ordered.forEach(c=>{c.hidden=!!(radical.value&&c.dataset.radical!==radical.value||group.value&&c.dataset.group!==group.value);if(!c.hidden)visible++;gallery.append(c);});document.querySelector('[data-st-gallery-status]').textContent=`${visible} animation resources match. Lesson selection is not a frequency ranking.`;};
 filter.addEventListener('change',update);filter.addEventListener('submit',e=>e.preventDefault());filter.addEventListener('reset',()=>setTimeout(update,0));
}
const embed=document.querySelector('[data-st-embed]');
if(embed){
 embed.dataset.stReady='true';const code=embed.querySelector('[data-st-embed-code]'),status=embed.querySelector('[data-st-copy-status]');
 const glyphs=[...'我你好是中国学永'],ids=['wo','ni','hao','shi','zhong','guo','xue','yong'];
 const update=()=>{const cp=embed.elements.character.value,index=glyphs.findIndex(g=>g.codePointAt(0).toString(16)===cp),g=glyphs[index],format=embed.elements.format.value,origin='https://hanzifun.online';
  const element=format==='iframe'?`<iframe src="${origin}/stroke-order/examples/?embed=${ids[index]}#${ids[index]}" title="Chinese writing example: ${g}" width="360" height="600" loading="lazy"></iframe>`:`<img src="${origin}${BASE}${format==='gif'?'gif/':'animated/'}${cp}.${format}" alt="${g} written stroke by stroke" width="240" height="240" loading="lazy">`;
  code.value=element+`\n<p>Stroke data: Hanzi Writer / Make Me a Hanzi, Arphic Public License. <a href="${origin}/stroke-order/animation/">HanziFun animation resources and attribution</a>.</p>`;
 };
 embed.addEventListener('change',update);embed.addEventListener('submit',e=>e.preventDefault());update();
 embed.querySelector('[data-st-copy-embed]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.value);status.textContent='Embed code and source credit copied.';}catch{code.focus();code.select();status.textContent='Select and copy the code above. Your browser did not allow clipboard access.';}});
}
const embedding=new URLSearchParams(location.search).get('embed');
if(embedding&&document.querySelector('[data-st-topic="examples"]')&&['wo','ni','hao','shi','zhong','guo','xue','yong'].includes(embedding)){
 const target=document.getElementById(embedding);document.documentElement.classList.add('st-embedded');
 document.querySelectorAll('.st-article > *').forEach(n=>{if(n!==target)n.hidden=true;});target.querySelectorAll(':scope > *').forEach(n=>{if(!n.matches('h2,.st-example-content'))n.hidden=true;});target.querySelector('.st-example-prose').hidden=true;
 document.querySelector('meta[name="robots"]').setAttribute('content','noindex,follow');
 const credit=elem('p','HanziFun · Hanzi Writer / Make Me a Hanzi · Arphic Public License');credit.className='st-embed-credit';const a=elem('a','Source and writing guide');a.href='https://hanzifun.online/stroke-order/animation/';a.target='_blank';a.rel='noopener';credit.append(document.createTextNode(' · '),a);target.append(credit);
}
