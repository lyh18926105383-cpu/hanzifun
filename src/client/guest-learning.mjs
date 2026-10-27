import {uuid} from '../learning/identity.mjs';
import {createRepository, STORAGE_KEY} from '../learning/repository.mjs';
import {LEGACY_KEYS, MAX_IMPORT_BYTES} from '../learning/legacy-import.mjs';
import {createSession} from '../learning/session.mjs';
import {emptyProjection} from '../learning/events.mjs';
import {createFlashcardController, mountFlashcards} from './flashcards.mjs';
const $=s=>document.querySelector(s);
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const link=(label,href)=>{const n=node('a',label);n.href=href;n.className='learning-button';return n;};
const button=(label,fn)=>{const b=node('button',label);b.type='button';b.className='learning-button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){status(e.message);}finally{b.disabled=false;}});return b;};
const status=text=>{const n=$('[data-guest-status]')||$('[data-hf-save-status]');if(n)n.textContent=text;};
const report=r=>{status(r.saved?'Saved on this device.':'Not saved. '+r.reason);return r.saved;};
const download=(name,raw)=>{const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=link('',url);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const params=new URLSearchParams(location.search);
let library, repo, view, controller;
const deviceId=uuid(); let sequence=0;
const safeReturn=value=>typeof value==='string'&&/^\/(?:academic\/hsk-[23]\/(?:level-2\/)?|scenarios\/(?:travel\/(?:restaurant|airport|hotel|supermarket)|business\/icebreakers)\/)(?:[#?]|$)/.test(value)&&!/[\r\n\\]/.test(value)?value:null;
let returnTarget=safeReturn(params.get('returnTo'));
const practiceURL=id=>'/flashcards/?session='+encodeURIComponent(id)+(returnTarget?'&returnTo='+encodeURIComponent(returnTarget):'');
const cardFor=(characterId,readingId)=>{
  const choices=library.catalog.filter(c=>c.characterId===characterId&&(!readingId||c.readingId===readingId));
  return choices.find(c=>repo.getData().projection.cards[c.cardId])||choices.find(c=>library.primary.includes(c.cardId))||choices[0];
};
const errorStorage={getItem(){throw new Error('Browser storage access is denied');},setItem(){throw new Error('Browser storage access is denied');},removeItem(){}};
function mount(session,projection,temporary=false) {
  view?.destroy();
  controller=createFlashcardController({session,projection,deviceId,uuid,nextSeq:count=>{const n=sequence;sequence+=count;return n;},
    temporary, commit:temporary?()=>({temporary:true}):t=>repo.commit(t)});
  view=mountFlashcards($('[data-guest-practice]'),controller);
  const listen=node('button','Listen to character');listen.type='button';listen.className='learning-button';listen.dataset.pronunciation='';listen.setAttribute('aria-pressed','false');
  $('[data-guest-practice]').append(listen);let lastCard;
  const audioUpdate=()=>{const state=controller.getState(),s=state.session,card=s.queue[s.cursor]?.card;
    const key=s.status==='active'?card?.cardId:null;
    if(key!==lastCard){window.dispatchEvent(new CustomEvent('hanzifun-pronunciation-stop'));lastCard=key;}
    listen.hidden=!key;const audio=library.pronunciations?.[card?.readingId];listen.dataset.audioUrl=audio?.url||'';listen.dataset.speechText=audio?.text||card?.front||'';
  };
  const unsubscribeAudio=controller.subscribe(audioUpdate);audioUpdate();const destroyAudio=view.destroy;
  view.destroy=()=>{unsubscribeAudio();window.dispatchEvent(new CustomEvent('hanzifun-pronunciation-stop'));listen.remove();destroyAudio();};
  if(returnTarget)$('[data-guest-practice]').append(link('Return to learning context',returnTarget));
  if(!temporary){
    const controls=node('p'),free=button('Practise this set freely',()=>launch((session.cardIds||session.queue.map(e=>e.card.cardId)).map(id=>library.catalog.find(c=>c.cardId===id)).filter(Boolean),session.title||'Free practice',{free:true,source:'free'}));
    const update=()=>{const state=controller.getState();free.hidden=!['complete','empty'].includes(state.session.status);free.disabled=state.blocked;};
    const unsubscribe=controller.subscribe(update);update();controls.append(free);$('[data-guest-practice]').append(controls);
    const destroy=view.destroy;view.destroy=()=>{unsubscribe();controls.remove();destroy();};
  }
}
async function launch(cards,title,{free=false,source='flashcards',navigate=false}={}) {
  if(!cards.length){status('No matching cards. Browse a set or save a character.');return {started:false};}
  const result=await repo.start({cards,title,source,free});
  if(result.saved){
    if(navigate){location.assign(practiceURL(result.session.sessionId));return {started:true};}
    history.replaceState(null,'',practiceURL(result.session.sessionId));mount(result.session,result.projection);
    return {started:true};
  }
  status('Not saved. '+result.reason);
  const root=$('[data-guest-practice]');
  if(root){root.replaceChildren(node('p','A saved session could not start. Your previous records remain intact.'),
    button('Retry starting practice',()=>launch(cards,title,{free,source})),
    button('Start temporary practice',()=>{
      // Temporary sessions are explicitly separate and never acknowledged as saved.
      const s=createSession({cards,projection:emptyProjection(),now:Date.now(),sessionId:uuid(),baseRevision:library.contentVersion,free:true});
      history.replaceState(null,'','/flashcards/?temporary=1');mount(s,emptyProjection(),true);status('Temporary practice. Not saved; export recovery before closing.');
    }));}
  return {started:false,reason:result.reason};
}
function renderWords(){
  const root=$('[data-guest-words]');if(!root)return;
  const data=repo.getData(); root.replaceChildren(node('p',`${data.favorites.length} saved characters`),link('Practise saved characters','/flashcards/?review=saved'));
  const grid=node('div');grid.className='tile-grid';
  for(const id of data.favorites){const c=cardFor(id),tile=node('article');tile.className='tile';tile.append(link(c.front,'/dictionary/'+encodeURIComponent(c.front)+'/'),node('p',c.back),
    link('Practise','/flashcards/?characterId='+encodeURIComponent(id)),button('Remove from saved characters',async()=>{if(report(await repo.setFavorite(id,false)))renderWords();}));grid.append(tile);}
  root.append(grid);
}
function renderDashboard(){
  const root=$('[data-guest-dashboard]');if(!root)return;
  const d=repo.getDashboard();root.replaceChildren();
  const group=(title)=>{const section=node('section');section.className='learning-panel';section.append(node('h2',title));root.append(section);return section;};
  const actions=(...items)=>{const row=node('div');row.className='learning-actions';row.append(...items);return row;};
  const stats=node('div');stats.className='learning-stats';
  for(const [label,n] of [['Unique characters practised',d.practicedCharacters],['Cards practised',d.practicedCards],['Due cards',d.dueCards],['Saved characters',d.favorites],['Completed sessions',d.completedSessions]]){const t=node('article');t.append(node('h2',label),node('strong',String(n)));stats.append(t);}
  root.append(stats);
  const review=group('Ready for review');
  review.append(node('p',d.earliestDueAt===null?'Start a practice set to build your review routine.':'Next review: '+new Date(d.earliestDueAt).toLocaleString()),
    actions(link('Practise due cards','/flashcards/?review=due'),link('Review weak characters ('+d.weakCharacters.length+')','/flashcards/?review=weak')));
  const ongoing=group('Continue practice');
  if(!d.unfinished.length)ongoing.append(node('p','No unfinished sessions. Choose a set to get started.'));
  const ongoingList=node('ul');ongoingList.className='learning-session-list';
  for(const s of d.unfinished){const item=node('li'),copy=node('div');copy.append(node('strong',s.title||'Practice'),node('small',`${s.cursor} of ${s.queue.length} cards completed`));item.append(copy,link('Continue',practiceURL(s.sessionId)));ongoingList.append(item);}
  if(d.unfinished.length)ongoing.append(ongoingList);
  const recent=group('Recent sessions');
  let page=0;const list=node('ol'),pager=node('div');list.className='learning-session-list';pager.className='learning-actions learning-pagination';
  const history=()=>{list.replaceChildren();for(const h of d.history.slice(page*8,page*8+8)){
    const li=node('li'),copy=node('div');copy.append(node('strong',h.title),node('small',`${h.count} practised · ${h.again} to revisit · ${new Date(h.completedAt).toLocaleString()}`));li.append(copy);
    const session=repo.getData().sessions[h.id];
    if(session)li.append(actions(link('Open completed session',practiceURL(h.id)),button('Practise again',()=>launch((session.cardIds||session.queue.map(e=>e.card.cardId)).map(id=>library.catalog.find(c=>c.cardId===id)).filter(Boolean),session.title||'Free practice',{free:true,source:'free',navigate:true}))));list.append(li);
  }
    const previous=button('Previous',()=>{page=Math.max(0,page-1);history();}),next=button('Next',()=>{if((page+1)*8<d.history.length)page++;history();});
    previous.disabled=page===0;next.disabled=(page+1)*8>=d.history.length;
    pager.replaceChildren(node('span',`Page ${page+1} of ${Math.max(1,Math.ceil(d.history.length/8))}`),previous,next);pager.hidden=d.history.length<=8;
  };
  history();if(!d.history.length)recent.append(node('p','Your completed practice sessions will appear here.'));recent.append(list,pager);
  if(d.legacy.length){
    const legacy=group('Imported learning');legacy.append(node('p','Earlier records are kept separately from your current review schedule.'));
    if(d.legacyPending.length)legacy.append(link(`Practise imported characters (${d.legacyPending.length})`,'/flashcards/?review=imported'));
    for(const b of d.legacy){const detail=node('details');detail.className='learning-details';
      const label=b.story?'Story records':b.sourceKey==='hanzifun.prototype.learning.v1'?'Earlier flashcards':'Earlier character practice';
      detail.append(node('summary',`${label} · ${b.summary.sessions} sessions · ${b.summary.characters} characters`));
      for(const [glyph,stats] of Object.entries(b.characters)){const line=node('p');line.append(link(glyph,'/dictionary/'+encodeURIComponent(glyph)+'/'),node('span',`${stats.seenCount??stats.attempts??0} practised · ${stats.familiarCount??0} familiar`));detail.append(line);}
      if(b.unresolved.length)detail.append(node('p',`${b.unresolved.length} entries are kept in your backup without a character match.`));
      if(b.story)for(const s of b.sessions)detail.append(node('p',`${s.lessonId.replaceAll('-',' ')} · ${s.quizCorrect??'?'} / ${s.quizTotal??'?'} · ${s.completedAt?new Date(s.completedAt).toLocaleString():'Date unavailable'}`));
      legacy.append(detail);
    }
  }
}
function renderSettings(){
  const root=$('[data-guest-settings]');if(!root)return;
  root.replaceChildren(node('h2','Practice settings'),node('p','Choose a comfortable pace. Due reviews do not use your daily new-card allowance.'));
  const form=node('form');form.className='learning-settings-form';
  for(const [key,label] of [['dailyNew','New cards per day'],['limit','Cards per session']]){const l=node('label',label+' '),s=node('select');s.name=key;for(const n of [5,10,20]){const o=node('option',String(n));o.value=n;s.append(o);}s.value=repo.getData().settings[key];l.append(s);form.append(l);}
  form.append(button('Save settings',async()=>report(await repo.setSettings({dailyNew:Number(form.elements.dailyNew.value),limit:Number(form.elements.limit.value)}))));root.append(form);
}
function renderImport(){
  const root=$('[data-guest-import]');if(!root)return;
  root.replaceChildren(node('h2','Import, export and recovery'),node('p','Export a backup to keep your progress or move it to another browser. Import JSON files up to 32 MiB; original records stay unchanged.'));
  const preview=node('div');let pending=[];
  const show=()=>{
    preview.replaceChildren();for(const b of pending)preview.append(node('p',b.kind==='PracticeRecovery'?`Practice recovery: session ${b.snapshot.sessionId}, cursor ${b.snapshot.cursor}. Missing prior events require the full guest backup first.`:b.kind==='HanziFunGuestExport'?`Guest backup: ${b.data.events.length} events. Restore only into an empty repository.`:
      `${b.sourceKey}: ${b.summary.sessions} retained rounds, ${b.summary.characters} summaries, ${b.favorites.length} saved, ${b.unresolved.length} unmatched. ${b.summary.note}`));
    if(pending.length)preview.append(button('Confirm import',async()=>{
      for(const b of pending){const r=b.kind==='PracticeRecovery'?await repo.restoreRecovery(b):b.kind==='HanziFunGuestExport'?await repo.restoreBackup(b):await repo.importLegacy(b);if(!report(r))return;}
      pending=[];show();renderDashboard();renderWords();status('Import saved. Repeating the same batch adds nothing.');
    }),button('Cancel import',()=>{pending=[];show();}));
  };
  const backupActions=node('div');backupActions.className='learning-actions';root.append(backupActions);
  backupActions.append(button('Export all guest data',()=>download('hanzifun-guest.json',repo.exportJSON())),button('Preview old records in this browser',async()=>{
    pending=[];for(const sourceKey of LEGACY_KEYS){const raw=repoStorage.getItem(sourceKey);if(raw)pending.push(await repo.previewLegacy({raw,sourceKey,sourceOrigin:location.origin}));}
    show();if(!pending.length)status('No legacy records found on this origin.');
  }));
  const sourceLabel=node('label','File source '),select=node('select');
  for(const value of ['Guest backup','Practice recovery',...LEGACY_KEYS]){const o=node('option',value);o.value=value;select.append(o);}sourceLabel.append(select);
  const originLabel=node('label','Original source origin '),originInput=node('input');originInput.type='url';originInput.value=location.origin;originLabel.append(originInput);
  const fileLabel=node('label','Import JSON file '),file=node('input');file.type='file';file.accept='.json,application/json';fileLabel.append(file);
  const fileForm=node('div');fileForm.className='learning-import-form';root.append(fileForm);
  fileForm.append(sourceLabel,originLabel,fileLabel,button('Preview selected file',async()=>{
    pending=[];show();const f=file.files[0];if(!f)throw new Error('Choose a JSON file first');if(f.size>MAX_IMPORT_BYTES)throw new Error('File exceeds 32 MiB; original untouched');
    const raw=await f.text();pending=[select.value==='Practice recovery'?await repo.previewRecovery(raw):select.value==='Guest backup'?await repo.previewBackup(raw):await repo.previewLegacy({raw,sourceKey:select.value,sourceOrigin:originInput.value})];show();
  }),preview,button('Clear guest data on this device',async()=>{
    if(!confirm('Clear the NEW guest snapshot, including practice, favorites and imported copies on this origin? Original v1/prototype keys stay unchanged. Export first if needed.'))return;
    if(report(await repo.clear())){renderDashboard();renderWords();renderSettings();}
  }));
  const recovery=node('details');recovery.className='learning-details';recovery.append(node('summary','Trouble saving?'),node('p','Close other learning tabs before resetting the save connection. Your records stay unchanged.'),button('Recover stale write coordination',()=>{if(!confirm('Close ALL other HanziFun learning tabs first. Reset only coordination markers? Guest records and old keys stay unchanged.'))return;const r=repo.resetWriteCoordination();status(r.reset?'Write markers reset. Retry saving.':'Could not reset markers. '+r.reason);}));root.append(recovery);
  const clear=fileForm.querySelector('button:last-child');clear.classList.add('learning-button-danger');
  if(repo.getStatus().error)status('Not saved / recovery required. '+repo.getStatus().error);
}
let repoStorage;
async function init(){
  const response=await fetch('/site-assets/hf06/learning-data.json');if(!response.ok)throw new Error('Learning data could not load. Reload to retry.');library=await response.json();
  try{repoStorage=window.localStorage;}catch{repoStorage=errorStorage;}
  let locks;try{locks=navigator.locks;}catch{/* Feature detection also handles restricted contexts. */}
  repo=createRepository({storage:repoStorage,catalog:library.catalog,locks,origin:location.origin,lessonIds:library.lessonIds,contentVersion:library.contentVersion,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'});
  window.HanziFunLearningAdapter={
    async startDeckPractice({deckId,characterIds,returnTo}){
      const deck=library.decks.find(d=>d.slug===deckId);if(!deck)return {started:false,reason:'Unknown practice set.'};
      let cards=deck.cardIds.map(id=>library.catalog.find(c=>c.cardId===id));
      if(characterIds!==undefined){if(!Array.isArray(characterIds)||!characterIds.length||characterIds.some(id=>!cards.some(c=>c.characterId===id)))return {started:false,reason:'Selection is outside this source list.'};cards=cards.filter(c=>characterIds.includes(c.characterId));}
      const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(cards.map(c=>c.cardId).join('|'))))].map(n=>n.toString(16).padStart(2,'0')).join('').slice(0,16);
      const source='deck:'+deck.slug+':'+digest;returnTarget=safeReturn(returnTo);
      const existing=Object.values(repo.getData().sessions).find(s=>['active','paused'].includes(s.status)&&s.source===source);
      if(existing&&!repo.getStatus().error){location.assign(practiceURL(existing.sessionId));return {started:true};}
      return launch(cards,deck.title,{source,navigate:true});
    },
    saveCharacter:({characterId})=>repo.setFavorite(characterId),
    async startCharacterPractice({characterId,readingId,source}){
      const card=cardFor(characterId,readingId);if(!card)return {started:false};
      const existing=Object.values(repo.getData().sessions).find(s=>['active','paused'].includes(s.status)&&s.source===source&&s.queue.length===1&&s.queue[0].card.cardId===card.cardId);
      if(existing&&!repo.getStatus().error){location.assign(practiceURL(existing.sessionId));return {started:true};}
      return launch([card],card.front,{source,free:!!repo.getData().projection.cards[card.cardId]?.dueAt&&repo.getData().projection.cards[card.cardId].dueAt>Date.now(),navigate:true});
    }
  };
  window.dispatchEvent(new Event('hanzifun-learning-ready'));
  renderWords();renderDashboard();renderSettings();renderImport();
  const practice=$('[data-guest-practice]');
  if(practice){
    const data=repo.getData();let sessionId=params.get('session');
    if(sessionId){const s=data.sessions[sessionId];if(s)mount(s,data.projection);else practice.replaceChildren(node('p','Session unavailable in saved data. Return to My learning or export recovery.'));}
    else {
      const slug=/^\/flashcards\/decks\/([^/]+)\/$/.exec(location.pathname)?.[1];
      const deck=library.decks.find(d=>d.slug===slug);
      const glyph=params.get('char'),characterId=params.get('characterId')||library.catalog.find(c=>c.front===glyph)?.characterId;
      const type=params.get('review');let cards,title;
      if(params.has('words')){cards=[...new Set(Array.from(params.get('words')))].map(g=>library.catalog.find(c=>c.front===g&&library.primary.includes(c.cardId))).filter(Boolean);title='Revisited set';}
      else if(characterId){cards=[cardFor(characterId)].filter(Boolean);title=glyph||cards[0]?.front||'Character';}
      else if(type==='due'){cards=library.catalog.filter(c=>data.projection.cards[c.cardId]?.dueAt!==null&&data.projection.cards[c.cardId]?.dueAt<=Math.max(Date.now(),data.projection.lastNow));title='Due cards';}
      else if(type==='imported'){cards=repo.getDashboard().legacyPending.map(id=>library.catalog.find(c=>c.characterId===id&&c.cardId.startsWith('card:dictionary:')&&library.primary.some(primary=>library.catalog.find(x=>x.cardId===primary)?.readingId===c.readingId)));title='Imported characters (first scheduling)';}
      else if(type==='saved'||type==='weak'){cards=(type==='saved'?data.favorites:repo.getDashboard().weakCharacters).map(id=>cardFor(id));title=type==='saved'?'Saved characters':'Another look';}
      else if(deck){cards=deck.cardIds.map(id=>library.catalog.find(c=>c.cardId===id));title=deck.title;}
      else {practice.replaceChildren(node('p','Choose a set below, practise due cards, or continue a saved session in My learning.'));return;}
      const source=deck?'deck:'+deck.slug:type||'character';
      const existing=Object.values(data.sessions).find(s=>['active','paused'].includes(s.status)&&s.source===source&&s.title===title);
      if(existing){history.replaceState(null,'',practiceURL(existing.sessionId));mount(existing,data.projection);}
      else await launch(cards,title,{source,free:type==='saved'||type==='weak'});
    }
  }
  if(repo.getStatus().error)status('Not saved / recovery required. '+repo.getStatus().error);
}
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){renderWords();renderDashboard();status('Another tab changed learning data. Active practice will check revisions before saving.');}});
init().catch(e=>status(e.message));
