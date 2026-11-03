import {queryNames,queryMenu,queryZodiac,queryTattoo} from './cultural-tools.mjs';
import {openTeacherStorage,createTeacherDecks,resolveTeacherGlyphs} from './teacher-decks.mjs';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const GALLERY_SCENES=[
 {id:'name',kind:'names',guide:'Find a Chinese name that feels like you.',zh:'名字',en:'Name Explorer',seal:'名',art:'name-scroll',path:'/tools/chinese-name-generator/',eyebrow:'A NAME, A LITTLE POSSIBILITY',description:'Find a character pair that feels like a beginning. Explore its sound, shape, and individual meanings.',note:'30 teaching pairs · character meanings, not a personal naming recommendation.'},
 {id:'menu',kind:'menu',guide:'Discover the characters behind your next meal.',zh:'食味',en:'Menu Decoder',seal:'味',art:'menu-scroll',path:'/tools/chinese-menu-decoder/',eyebrow:'READ THE CHARACTERS, TASTE THE CULTURE',description:'A familiar dish can open a new door. Discover the characters tucked inside a Chinese menu.',note:'50 teaching sequences · not an ingredient, allergy, or food-safety guarantee.'},
 {id:'zodiac',kind:'zodiac',guide:'Find the animal and element of your lunar year.',zh:'岁次',en:'Lunar Zodiac',seal:'岁',art:'zodiac-scroll',path:'/tools/zodiac-elements-calculator/',eyebrow:'THE YEAR TURNS, THE STORY CONTINUES',description:'Follow the lunar year to its animal and year-stem element. A small window into a much older calendar.',note:'Hong Kong Observatory year boundaries · 2000-02-05 through 2034-02-18. No fate or personality predictions.'},
 {id:'tattoo',kind:'tattoo',guide:'Explore the meaning before it becomes ink.',zh:'墨鉴',en:'Tattoo Checker',seal:'墨',art:'tattoo-scroll',path:'/tools/tattoo-character-checker/',eyebrow:'BEFORE THE INK BECOMES PERMANENT',description:'Slow down with the characters. Look closely at their readings and meanings before making them your own.',note:'1–8 characters · individual senses are not a phrase translation or a tattoo recommendation.'},
 {id:'teacher',kind:'teacher',guide:'Turn a few characters into your next lesson.',zh:'教案',en:'Teacher Decks',seal:'教',art:'teacher-scroll',path:'/flashcards/teacher/',eyebrow:'A FEW CHARACTERS, A WHOLE LESSON',description:'Gather a thoughtful set of characters. Arrange a little lesson, save it privately, and take it to the classroom.',note:'2–100 published characters · private browser storage. No account or textbook mapping.'}
];
export const GALLERY_DEFAULTS={names:{style:'calm',surname:'',sound:'',displayName:''},menu:{text:'牛肉面'},zodiac:{date:'2024-02-10'},tattoo:{text:'安好'},teacher:{name:'Nature notes',text:'山水木月'}};
const link=c=>c?.path?`<a href="${e(c.path)}" lang="zh-CN" aria-label="${e(c.glyph+' · '+c.meaning)}">${e(c.glyph)}</a>`:`<span lang="zh-CN">${e(c?.glyph||'')}</span>`;
const study=items=>`<div class="tools-study-links">${items.map(c=>c.path?`<a href="${e(c.path)}"><span lang="zh-CN">${e(c.glyph)}</span><span>${e(c.pinyin)}<small>${e(c.meaning)}</small></span><span aria-hidden="true">↗</span></a>`:`<span class="tools-unlisted"><span lang="zh-CN">${e(c.glyph)}</span> · not in this dictionary</span>`).join('')}</div>`;
const save=items=>{const c=items.find(c=>c.characterId&&c.path);return c?`<button type="button" class="tools-save" data-studio-save="${e(c.characterId)}"><span aria-hidden="true">＋</span> Save ${e(c.glyph)} to my characters</button>`:'';};
function frame(scene,items,pinyin,label,extra='',glyphs=''){
 return `<div class="tools-stage-heading"><span>${e(label)}</span><span class="tools-stage-seal" aria-hidden="true">${scene.seal}</span></div><div class="tools-preview-center"><p class="tools-preview-glyphs ${items.length>3?'tools-preview-glyphs-many':''}">${glyphs||items.slice(0,8).map(link).join('')}</p><p class="tools-preview-pinyin" lang="zh-Latn-pinyin">${e(pinyin)}</p><span class="tools-preview-rule" aria-hidden="true"></span></div>${extra}${study(items.slice(0,4))}<div class="tools-stage-bottom"><span>Discover the characters within.</span>${save(items)}</div>`;
}
function empty(scene,message){return `<div class="tools-stage-heading"><span>YOUR CHARACTER STUDY</span><span class="tools-stage-seal" aria-hidden="true">${scene.seal}</span></div><div class="tools-preview-center tools-preview-empty"><span lang="zh-CN">${scene.seal}</span><p>${e(message)}</p></div>`;}
export function studioPreview(kind,input,catalog,{pick=0}={}){
 const scene=GALLERY_SCENES.find(s=>s.kind===kind);
 if(kind==='names'){
  const r=queryNames(input,catalog);if(!r.candidates.length)return empty(scene,r.notice);
  const c=r.candidates[Math.min(pick,r.candidates.length-1)],items=c.characters;
  return frame(scene,items,items.map(c=>c.pinyin).join(' · '),'A PAIR TO EXPLORE',`<div class="tools-name-choices" aria-label="Character pairs">${r.candidates.map((c,i)=>`<button type="button" data-studio-pick="${i}" aria-pressed="${i===Math.min(pick,r.candidates.length-1)}"><span lang="zh-CN">${e(c.glyphs.join(''))}</span></button>`).join('')}</div>${r.displayName?`<p class="tools-preview-notice">${e(r.displayName.text)} — shown as typed, not transliterated.</p>`:''}`);
 }
 if(kind==='menu'){
  const r=queryMenu(input.text,catalog),items=r.dishes?.[0]?.characters||r.characters||[];
  if(!items.length)return empty(scene,r.notice);
  return frame(scene,items,items.filter(c=>c.path).map(c=>c.pinyin).join(' · '),r.status==='matched'?'A DISH, CHARACTER BY CHARACTER':'AN UNFAMILIAR DISH',`<p class="tools-preview-notice">${r.status==='matched'?'Individual character senses — a starting point for reading.':'Some characters or the whole dish are outside this teaching list.'}</p>`);
 }
 if(kind==='zodiac'){
  const r=queryZodiac(input.date,catalog);if(r.status!=='ok')return empty(scene,r.notice);
  const items=[r.elementItem||r.exampleItem,r.animalItem].filter(Boolean),animals={'鼠':'Rat','牛':'Ox','虎':'Tiger','兔':'Rabbit','龙':'Dragon','蛇':'Snake','马':'Horse','羊':'Goat','猴':'Monkey','鸡':'Rooster','狗':'Dog','猪':'Pig'},elements={'木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water'};
  return frame(scene,items,r.elementItem?'year-stem element · '+r.elementItem.pinyin:'study character · '+r.exampleItem.pinyin, 'THE LUNAR YEAR',`<p class="tools-zodiac-label">${e(elements[r.element])} · ${e(animals[r.animal])}</p><p class="tools-preview-notice">The lunar year begins at the Observatory New Year boundary.<br>The element belongs to the year stem only.</p>`,`<span class="tools-zodiac-year" lang="zh-CN">${e(r.lunarYearLabel)}</span>`);
 }
 if(kind==='tattoo'){
  const r=queryTattoo(input.text,catalog);if(r.status!=='ok')return empty(scene,r.notice);
  return frame(scene,r.characters,r.characters.filter(c=>c.path).map(c=>c.pinyin).join(' · '),r.ambiguous?'MORE THAN ONE READING':'A MOMENT BEFORE THE INK',`<p class="tools-preview-notice">${r.ambiguous?'A character here has multiple readings. Open its dictionary page to choose the right context.':'Read the characters individually. Their combined phrase needs its own context.'}</p>`);
 }
 const glyphs=[...String(input.text||'')].filter(g=>!/[\s,，]/u.test(g)),r=resolveTeacherGlyphs(glyphs,catalog);
 if(!r.ok)return empty(scene,r.reason);
 const items=glyphs.map(g=>catalog.byGlyph.get(g));
 return frame(scene,items,items.slice(0,4).map(c=>c.pinyin).join(' · '),`${String(items.length).padStart(2,'0')} CHARACTERS · A4 / LETTER`,`<p class="tools-deck-preview-name">${e(input.name||'Untitled character set')}</p>${items.length>4?`<p class="tools-preview-notice">${items.length} characters selected. The preview shows the first four study links.</p>`:''}`);
}
export function mountToolsGallery(root,catalog,{saveCharacter}={}){
 root.classList.add('tools-gallery-enhanced');
 const scenes=[...root.querySelectorAll('[data-tools-section]')],rail=root.querySelector('[data-tools-rail]'),links=[...root.querySelectorAll('[data-tools-path]')],indicator=root.querySelector('[data-tools-indicator]'),toggle=root.querySelector('[data-tools-toggle]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const scrollOffset=()=>matchMedia('(max-width:900px)').matches?76:24;
 let active=0,pinned=null,frameId=0,repoPromise,savedDeck=null;
 const setActive=i=>{active=i;links.forEach((a,n)=>{if(i===n)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const a=links[i];indicator.style.height=a.offsetHeight+'px';indicator.style.transform=`translateY(${a.offsetTop}px)`;root.querySelector('[data-tools-current]').textContent=GALLERY_SCENES[i].en;};
 const scrollUpdate=()=>{frameId=0;if(pinned&&performance.now()<pinned.until&&Math.abs(pinned.target.getBoundingClientRect().top-scrollOffset())>12)return;pinned=null;let nearest=0;for(let i=0;i<scenes.length;i++)if(scenes[i].getBoundingClientRect().top<=innerHeight*.38)nearest=i;setActive(nearest);for(const scene of scenes){const r=scene.getBoundingClientRect();if(!reduce.matches&&r.bottom>0&&r.top<innerHeight)scene.style.setProperty('--scene-shift',Math.max(-16,Math.min(16,(innerHeight*.5-r.top-r.height*.5)*.035))+'px');}};
 const requestScroll=()=>{if(!frameId)frameId=requestAnimationFrame(scrollUpdate);};
 for(const [i,a] of links.entries())a.addEventListener('click',event=>{event.preventDefault();setActive(i);rail.dataset.open='false';toggle.setAttribute('aria-expanded','false');history.replaceState(null,'',a.getAttribute('href'));pinned={target:scenes[i],until:performance.now()+1300};window.scrollTo({top:scrollY+scenes[i].getBoundingClientRect().top-scrollOffset(),behavior:reduce.matches?'auto':'smooth'});});
 toggle.hidden=false;toggle.addEventListener('click',()=>{const open=rail.dataset.open!=='true';rail.dataset.open=String(open);toggle.setAttribute('aria-expanded',String(open));requestAnimationFrame(()=>setActive(active));});
 rail.addEventListener('keydown',event=>{if(event.key==='Escape'){rail.dataset.open='false';toggle.setAttribute('aria-expanded','false');toggle.focus();}});
 if('IntersectionObserver' in window){const spy=new IntersectionObserver(requestScroll,{rootMargin:'-15% 0px -45% 0px',threshold:[0,.25,.5,1]});scenes.forEach(s=>spy.observe(s));const reveal=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');reveal.unobserve(entry.target);}},{threshold:.08});scenes.forEach(s=>reveal.observe(s));}
 else scenes.forEach(s=>s.classList.add('is-revealed'));
 addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll);setActive(0);requestScroll();
 const fields=form=>Object.fromEntries(new FormData(form));
 const show=(form,pick=0)=>{form.closest('[data-tools-section]').querySelector('[data-studio-stage]').innerHTML=studioPreview(form.dataset.studioForm,fields(form),catalog,{pick});};
 for(const form of root.querySelectorAll('[data-studio-form]')){
  let timer;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>show(form),100);};form.addEventListener('input',refresh);form.addEventListener('change',()=>{clearTimeout(timer);show(form);});
  form.addEventListener('submit',async event=>{event.preventDefault();clearTimeout(timer);show(form);if(form.dataset.studioForm!=='teacher')return;const status=form.querySelector('[data-studio-status]');try{const input=fields(form),glyphs=[...String(input.text||'')].filter(g=>!/[\s,，]/u.test(g));repoPromise??=openTeacherStorage({indexedDB:globalThis.indexedDB,localStorage:globalThis.localStorage}).then(storage=>createTeacherDecks({storage,catalog}));const repo=await repoPromise,result=savedDeck?await repo.update({deckId:savedDeck.deckId,expectedRevision:savedDeck.revision,name:input.name,glyphs}):await repo.create({name:input.name,glyphs});if(!result.saved)throw Error(result.reason);savedDeck=result.deck;status.textContent=`Saved on this device · revision ${savedDeck.revision}. Continue in the full teacher workspace.`;}catch(error){status.textContent=error.message||'Could not save. Please retry.';}});
 }
 root.addEventListener('click',async event=>{const pick=event.target.closest('[data-studio-pick]');if(pick){const form=pick.closest('[data-tools-section]').querySelector('form');show(form,Number(pick.dataset.studioPick));}const quick=event.target.closest('[data-studio-quick]');if(quick){const form=quick.closest('form');form.elements.text.value=quick.dataset.studioQuick;show(form);}const button=event.target.closest('[data-studio-save]');if(!button)return;const status=button.closest('[data-tools-section]').querySelector('[data-studio-status]');try{const result=await saveCharacter(button.dataset.studioSave);status.textContent=result.saved?'Saved to your characters on this device.':result.reason||'Could not save. Please retry.';}catch(error){status.textContent=error.message;}});
}
