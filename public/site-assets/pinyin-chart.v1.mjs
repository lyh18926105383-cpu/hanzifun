import {pinyinQuery} from './pinyin-core.mjs';
const form = document.querySelector('[data-pinyin-chart-filter]');
if (form) {
  const cells = [...document.querySelectorAll('button[data-syllable]')];
  const templates = new Map([...document.querySelectorAll('[data-sound-template]')].map(t=>[t.dataset.soundTemplate,t]));
  const panel = document.getElementById('pinyin-sound-panel');
  const stage = panel.parentElement;
  const scroll = document.querySelector('[data-matrix-scroll]');
  const status = document.querySelector('[data-pinyin-count]');
  let selected = null;
  function stop() { window.dispatchEvent(new Event('hanzifun-pronunciation-stop')); }
  function close(restoreFocus = false) {
    stop(); panel.hidden = true;
    if (selected) { selected.setAttribute('aria-expanded','false'); if(restoreFocus) selected.focus({preventScroll:true}); }
  }
  function place() {
    if(panel.hidden || !selected) return;
    const box = stage.getBoundingClientRect(), target = selected.getBoundingClientRect(), frame = scroll.getBoundingClientRect();
    const width = panel.offsetWidth, height = panel.offsetHeight;
    const left = Math.min(Math.max(8,target.right-box.left+6),Math.max(8,box.width-width-8));
    const top = Math.min(Math.max(8,target.top-box.top),Math.max(8,frame.height-height-8));
    panel.style.left=left+'px';panel.style.top=top+'px';
  }
  function select(button,{focusPanel=true,updateHash=true,tone=null}={}) {
    stop(); close(); selected=button;
    document.querySelectorAll('.pinyin-axis-selected').forEach(el=>el.classList.remove('pinyin-axis-selected'));
    document.querySelectorAll('[data-initial-heading],[data-final-heading]').forEach(el=>{
      if(el.dataset.initialHeading===button.dataset.initial||el.dataset.finalHeading===button.dataset.final)el.classList.add('pinyin-axis-selected');
    });
    document.querySelector('[data-panel-content]').replaceChildren(templates.get(button.dataset.syllable).content.cloneNode(true));
    panel.querySelector('h3').id='pinyin-selected-heading';
    button.setAttribute('aria-expanded','true'); panel.hidden=false;
    const soundButtons=[...panel.querySelectorAll('[data-pronunciation]')];
    if(tone) soundButtons.forEach(b=>{if(pinyinQuery(b.closest('li').querySelector('span').textContent).tone===tone)b.closest('li').classList.add('pinyin-tone-selected');});
    place();
    if(updateHash)history.replaceState(null,'',location.pathname+location.search+'#'+button.id);
    if(focusPanel)panel.querySelector('[data-panel-close]').focus({preventScroll:true});
    status.textContent=`Selected ${button.dataset.syllable}. Choose a tone to listen.`;
  }
  cells.forEach(button=>button.addEventListener('click',()=>select(button)));
  panel.querySelector('[data-panel-close]').addEventListener('click',()=>close(true));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true);}});
  document.addEventListener('click',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!event.target.closest('[data-syllable],[data-chart-example]')&&!form.contains(event.target))close();});
  scroll.addEventListener('scroll',place);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(place).observe(stage);
  function search() {
    const query=pinyinQuery(form.elements.syllable.value);
    const button=cells.find(c=>c.dataset.syllable===query.plain);
    if(!query.plain){close();status.textContent='410 syllables · Select a syllable to hear its tones.';return;}
    if(!button){close();status.textContent='No matching syllable. Try a spelling such as shui, shui3 or lü.';return;}
    const td=button.getBoundingClientRect(), view=scroll.getBoundingClientRect();
    scroll.scrollLeft+=td.left-view.left-scroll.querySelector('th').offsetWidth-10;
    scroll.scrollTop+=td.top-view.top-scroll.querySelector('thead').offsetHeight-10;
    select(button,{tone:query.tone});
  }
  form.addEventListener('submit',event=>{event.preventDefault();search();});
  document.querySelectorAll('[data-chart-example]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();form.elements.syllable.value=link.dataset.chartExample;search();
    form.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  form.addEventListener('reset',()=>{close();selected=null;cells.forEach(c=>c.setAttribute('aria-expanded','false'));document.querySelectorAll('.pinyin-axis-selected').forEach(el=>el.classList.remove('pinyin-axis-selected'));history.replaceState(null,'',location.pathname+location.search);scroll.scrollTo({left:0,top:0});status.textContent='410 syllables · Select a syllable to hear its tones.';});
  function followHash(){try{const id=decodeURIComponent(location.hash.slice(1));const button=cells.find(c=>decodeURIComponent(c.id)===id);if(button){form.elements.syllable.value=button.dataset.syllable;search();}}catch{/* malformed hashes leave the chart readable */}}
  window.addEventListener('hashchange',followHash);
  if(location.hash)followHash();
}
