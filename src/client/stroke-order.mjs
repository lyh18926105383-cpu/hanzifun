const cache = new Map();
export async function fetchStroke(codepoint, version, fetcher = fetch) {
  if (!/^[0-9a-f]{4,6}$/.test(codepoint) || !/^[0-9a-f]{64}$/.test(version)) throw new Error('Unsupported stroke asset');
  const url = `/data/strokes/${codepoint}.json?v=${version}`;
  if (!cache.has(url)) cache.set(url, (async()=>{
    const response=await fetcher(url);
    if(!response.ok)throw new Error('Stroke asset unavailable');
    const value=await response.json();
    if(!Array.isArray(value.strokes)||!value.strokes.length||!Array.isArray(value.medians)||value.medians.length!==value.strokes.length||!value.strokes.every(p=>typeof p==='string'&&/^[MmLlQqCcZzHhVvSsTtAaEe0-9.,+\s-]+$/.test(p)))throw new Error('Invalid stroke data');
    return value;
  })().catch(error=>{cache.delete(url);throw error;}));
  return cache.get(url);
}
export function mountStrokePanel(panel) {
  let data=null, position=0, timer=null, epoch=0, command=0;
  const status=panel.querySelector('[data-stroke-status]'), stage=panel.querySelector('[data-stroke-stage]');
  const pause=()=>{command++;clearTimeout(timer);timer=null;};
  const draw=()=>{
    if(!data)return;
    const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 1024 1024');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${panel.dataset.glyph}: ${position} / ${data.strokes.length} strokes`);
    const group=document.createElementNS(ns,'g');group.setAttribute('transform','translate(0,900) scale(1,-1)');
    data.strokes.forEach((d,i)=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('fill',i<position?(i===position-1?'#ad392b':'#263c33'):'#e4ddd0');group.append(p);});
    svg.append(group);stage.replaceChildren(svg);status.textContent=`${position} / ${data.strokes.length} strokes`;
  };
  const load=async()=>{
    const current=epoch;
    status.textContent='Loading this character…';
    try{const value=await fetchStroke(panel.dataset.codepoint,panel.dataset.version);if(current!==epoch)return false;data=value;draw();return true;}
    catch{if(current===epoch)status.textContent='Could not load strokes. Use the static sequence below, or Load / retry.';return false;}
  };
  const advance=()=>{
    if(position>=data.strokes.length){pause();return;}
    position++;draw();timer=setTimeout(advance,Number(panel.querySelector('[data-stroke-speed]').value));
  };
  panel.querySelectorAll('[data-stroke]').forEach(button=>button.addEventListener('click',async()=>{
    const operation=button.dataset.stroke;
    if(operation==='pause'){pause();return;}
    pause();const current=epoch, action=command;
    if(!data&&!await load() || current!==epoch || action!==command)return;
    if(operation==='play'){if(position>=data.strokes.length)position=0;advance();}
    else if(operation==='next'){position=Math.min(position+1,data.strokes.length);draw();}
    else if(operation==='previous'){position=Math.max(position-1,0);draw();}
    else if(operation==='reset'){position=0;draw();}
  }));
  const select=(item)=>{
    epoch++;pause();data=null;position=0;panel.dataset.codepoint=item.codepoint;panel.dataset.version=item.version;panel.dataset.glyph=item.glyph;
    stage.textContent=item.glyph;stage.setAttribute('aria-label','Stroke viewer for '+item.glyph);
    const image=panel.querySelector('[data-stroke-static]');image.src=`/site-assets/stroke-static/${item.codepoint}.svg`;image.alt=`${item.glyph}: all ${item.strokeCount} cumulative stroke steps, new stroke in red`;
    panel.querySelector('[data-stroke-static-link]').href=image.src;
    panel.querySelector('[data-stroke-dictionary]').href='/dictionary/'+encodeURIComponent(item.glyph)+'/';
    panel.querySelector('h2 + p').textContent=`Mainland simplified glyph · ${item.strokeCount} strokes. Hanzi Writer data 2.0.1 / Make Me a Hanzi / Arphic.`;
    status.textContent='Load this character to start. The complete static sequence is below.';
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('pagehide',pause);
  return {select,pause};
}
