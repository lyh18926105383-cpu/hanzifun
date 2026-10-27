// Static content is readable without JS; actions acknowledge only real adapter saves.
const status=message=>{const el=document.querySelector('[data-hf07-status]');if(el)el.textContent=message;};
const characterIds=glyph=>[...new Set([...glyph])].filter(g=>/\p{Script=Han}/u.test(g)).map(g=>'char:'+g.codePointAt(0).toString(16));
const adapter=()=>{const value=window.HanziFunLearningAdapter;if(!value)throw Error('Learning is still loading. Please retry.');return value;};
const returnTo=element=>location.pathname+(element?.closest('details[id]')?'#'+element.closest('details[id]').id:location.hash);
async function save(ids){if(!ids.length)throw Error('Select at least one character first.');let count=0;for(const characterId of ids){const r=await adapter().saveCharacter({characterId});if(r?.saved!==true)throw Error(`${count} saved; remaining characters were not saved. Retry after checking browser storage.`);count++;}status(`${count} characters saved on this device.`);}
async function practise(deckId,ids,context=returnTo()){const r=await adapter().startDeckPractice({deckId,characterIds:ids,returnTo:context});if(!r?.started)throw Error(r?.reason||'Practice was not saved. Please retry.');}
const groupRoot=document.querySelector('[data-context-group]');
const groupKey='hanzifun.hf07.selection:'+location.pathname;
let group=[];
try{const old=JSON.parse(sessionStorage.getItem(groupKey)||'[]');if(Array.isArray(old))group=old.filter(g=>typeof g==='string'&&/^\p{Script=Han}$/u.test(g));}catch{}
function showGroup(){if(groupRoot)groupRoot.querySelector('[data-context-group-items]').textContent=group.length?group.join(' · '):'No characters selected yet.';}
function storeGroup(){showGroup();try{sessionStorage.setItem(groupKey,JSON.stringify(group));}catch{status('Current selection is temporary; this browser cannot retain it after navigation.');}}
showGroup();
const selected=section=>[...new Set([...section.querySelectorAll('[data-select-glyph]:checked')].flatMap(n=>characterIds(n.dataset.selectGlyph)))];
document.addEventListener('click',async event=>{
 const anchor=event.target.closest('a');
 if(filter&&anchor&&anchor.getAttribute('href')?.startsWith('/dictionary/')){const u=new URL(anchor.href);u.searchParams.set('returnTo',returnTo());anchor.href=u.href;}
 const b=event.target.closest('button');if(!b||b.disabled)return;
 const action=b.matches('[data-practice-deck],[data-practice-selected],[data-save-selected],[data-token-save],[data-token-practice],[data-token-add],[data-context-group-practice],[data-context-group-clear]');if(!action)return;
 b.disabled=true;
 try{
  if(b.hasAttribute('data-token-add')){group=[...new Set([...group,...b.dataset.tokenAdd])];storeGroup();}
  else if(b.hasAttribute('data-context-group-clear')){group=[];storeGroup();}
  else if(b.hasAttribute('data-context-group-practice')){if(!group.length)throw Error('Add a word or character first.');await practise(groupRoot.dataset.contextGroup,characterIds(group.join('')));}
  else if(b.hasAttribute('data-practice-deck'))await practise(b.dataset.practiceDeck);
  else if(b.hasAttribute('data-practice-selected')){const ids=selected(b.closest('[data-hsk-list]'));if(!ids.length)throw Error('Select at least one entry first.');await practise(b.dataset.practiceSelected,ids);}
  else if(b.hasAttribute('data-save-selected'))await save(selected(b.closest('[data-hsk-list]')));
  else if(b.hasAttribute('data-token-save'))await save(characterIds(b.dataset.tokenSave));
  else await practise(b.dataset.deck,characterIds(b.dataset.tokenPractice),returnTo(b));
 }catch(error){status(error.message);}finally{b.disabled=false;}
});
const filter=document.querySelector('[data-hsk-filter]');
if(filter){
 const sections=[...document.querySelectorAll('[data-hsk-list]')],message=document.querySelector('[data-hsk-filter-status]');
 function apply(write=false){
  const level=filter.elements.level.value,type=filter.elements.type.value;let shown=0;
  for(const section of sections){section.hidden=section.dataset.level!==level||section.dataset.hskList!==type;if(!section.hidden)shown++;}
  message.textContent=shown?'Showing the locked source scope below.':'This level/list combination is not available. Other levels are planned. The writing list spans levels 1–2 together; select that level to view it.';
  if(write){const value=new URLSearchParams({level,type});history.replaceState(null,'',location.pathname+'#'+value);}
 }
 function restore(){const p=new URLSearchParams(location.hash.slice(1));if([...filter.elements.level.options].some(o=>o.value===p.get('level')))filter.elements.level.value=p.get('level');if([...filter.elements.type.options].some(o=>o.value===p.get('type')))filter.elements.type.value=p.get('type');apply();}
 filter.addEventListener('submit',event=>{event.preventDefault();apply(true);});
 filter.addEventListener('change',event=>{if(event.target===filter.elements.type){if(filter.elements.type.value==='writing-character')filter.elements.level.value='1-2';else if(filter.elements.level.value==='1-2')filter.elements.level.value='1';}else if(filter.elements.level.value==='1-2')filter.elements.type.value='writing-character';apply(true);});
 filter.addEventListener('reset',()=>queueMicrotask(()=>{history.replaceState(null,'',location.pathname);apply();}));
 window.addEventListener('hashchange',restore);restore();
}
// Open the exact word context on a fresh return as well as browser back.
function restoreContext(){if(!location.hash||filter)return;const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(el?.matches('details'))el.open=true;el?.scrollIntoView({block:'center'});}
try{restoreContext();}catch{/* A malformed fragment leaves the readable page intact. */}
window.addEventListener('hashchange',()=>{try{restoreContext();}catch{}});
