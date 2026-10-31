// Local teacher decks. No account, and no write into the guest learning snapshot.
export const TEACHER_STORAGE_KEY = 'hanzifun.teacher.decks.v1';
export const TEACHER_DB = 'hanzifun-teacher-decks';
export const TEACHER_STORE = 'snapshot';
export const MIN_DECK_ITEMS = 2;
export const MAX_DECK_ITEMS = 100;
export const MAX_IMPORT_BYTES = 1024 * 1024;

const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => String(value ?? '');
const clone = value => structuredClone(value);

export function emptyTeacherStore() {
  return {schemaVersion:1, storeRevision:0, decks:{}, sessions:{}, operations:[]};
}

function indexCatalog(catalog) {
  if (catalog?.byGlyph) return catalog.byGlyph;
  return new Map((catalog || []).map(item => [item.glyph, item]));
}

function snapshot(item) {
  return {glyph: item.glyph, characterId: item.characterId, pinyin: item.pinyin, meaning: item.meaning, path: item.path};
}

export function resolveTeacherGlyphs(glyphs, catalog) {
  const byGlyph = indexCatalog(catalog);
  if (!Array.isArray(glyphs)) return {ok:false, code:'invalid', reason:'Choose characters from the published dictionary.'};
  const unpublished = [...new Set(glyphs.filter(glyph => !byGlyph.has(glyph)))];
  if (unpublished.length) return {ok:false, code:'unpublished', reason:'Some characters have no published dictionary page.', glyphs: unpublished};
  const duplicate = [...new Set(glyphs.filter((glyph, index) => glyphs.indexOf(glyph) !== index))];
  if (duplicate.length) return {ok:false, code:'duplicate', reason:'That character is already in the deck.', glyphs: duplicate};
  if (glyphs.length < MIN_DECK_ITEMS || glyphs.length > MAX_DECK_ITEMS) return {ok:false, code:'limit', reason:`A deck needs ${MIN_DECK_ITEMS} to ${MAX_DECK_ITEMS} characters.`, count: glyphs.length};
  return {ok:true, items: glyphs.map(glyph => snapshot(byGlyph.get(glyph)))};
}

function checkCopy(name, notes) {
  const title = text(name).trim();
  const body = text(notes);
  if (!title || title.length > 80) return {ok:false, code:'name', reason:'Give the deck a name of 1 to 80 characters.'};
  if (body.length > 500) return {ok:false, code:'notes', reason:'Notes can be 500 characters at most.'};
  return {ok:true, name: title, notes: body};
}

function sameCard(card, item) {
  return card?.glyph === item.glyph && card.characterId === item.characterId && card.pinyin === item.pinyin && card.meaning === item.meaning && card.path === item.path;
}

function validateCards(cards, byGlyph) {
  if (!Array.isArray(cards)) throw new Error('Invalid teacher cards');
  for (const card of cards) {
    const item = byGlyph.get(card?.glyph);
    if (!item || !sameCard(card, snapshot(item))) throw new Error('Imported card does not match the published dictionary');
  }
}

export function validateTeacherStore(data, catalog) {
  const byGlyph = indexCatalog(catalog);
  if (data?.schemaVersion !== 1 || !Number.isSafeInteger(data.storeRevision) || data.storeRevision < 0 || !data.decks || Array.isArray(data.decks) || !data.sessions || Array.isArray(data.sessions) || !Array.isArray(data.operations)) {
    throw new Error('Unsupported or damaged teacher snapshot');
  }
  const operationIds = new Set();
  const operations = [];
  for (const operation of data.operations) {
    if (!operation?.id || operationIds.has(operation.id)) throw new Error('Invalid teacher operation');
    operationIds.add(operation.id);
    operations.push({id: operation.id, deckId: operation.deckId || ''});
  }
  const decks = {};
  for (const [id, deck] of Object.entries(data.decks)) {
    if (id !== deck?.deckId || !Number.isSafeInteger(deck.revision) || deck.revision < 1 || !Number.isSafeInteger(deck.createdAt) || !Number.isSafeInteger(deck.updatedAt)) throw new Error('Invalid teacher deck');
    const copy = checkCopy(deck.name, deck.notes);
    if (!copy.ok) throw new Error('Invalid teacher deck copy');
    validateCards(deck.items, byGlyph);
    const glyphs = deck.items.map(card => card.glyph);
    if (new Set(glyphs).size !== glyphs.length || glyphs.length < MIN_DECK_ITEMS || glyphs.length > MAX_DECK_ITEMS) throw new Error('Invalid teacher deck size');
    if (!Array.isArray(deck.history)) throw new Error('Invalid teacher history');
    const history = [];
    for (const previous of deck.history) {
      validateCards(previous.items, byGlyph);
      const previousCopy = checkCopy(previous.name, previous.notes || '');
      if (!previousCopy.ok) throw new Error('Invalid teacher history');
      history.push({revision: previous.revision, name: previousCopy.name, notes: previousCopy.notes, updatedAt: previous.updatedAt, items: previous.items.map(card => snapshot(byGlyph.get(card.glyph)))});
    }
    decks[id] = {deckId: id, name: copy.name, notes: copy.notes, revision: deck.revision, createdAt: deck.createdAt, updatedAt: deck.updatedAt, items: deck.items.map(card => snapshot(byGlyph.get(card.glyph))), history};
  }
  const sessions = {};
  for (const [id, session] of Object.entries(data.sessions)) {
    if (id !== session?.sessionId || !Number.isSafeInteger(session.revision) || session.revision < 1) throw new Error('Invalid teacher practice snapshot');
    validateCards(session.items, byGlyph);
    sessions[id] = {sessionId: id, deckId: session.deckId, revision: session.revision, name: text(session.name).trim(), items: session.items.map(card => snapshot(byGlyph.get(card.glyph))), createdAt: session.createdAt};
  }
  return {schemaVersion: 1, storeRevision: data.storeRevision, decks, sessions, operations};
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Teacher storage request failed'));
  });
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('Teacher storage transaction aborted'));
    tx.onerror = () => reject(tx.error || new Error('Teacher storage transaction failed'));
  });
}

export function openTeacherIndexedDb(idb, databaseName = TEACHER_DB) {
  const openRequest = idb.open(databaseName, 1);
  const ready = new Promise((resolve, reject) => {
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(TEACHER_STORE)) db.createObjectStore(TEACHER_STORE);
    };
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onerror = () => reject(openRequest.error || new Error('Could not open teacher storage'));
  });
  async function run(mode, fn) {
    const db = await ready;
    const tx = db.transaction(TEACHER_STORE, mode);
    const done = transactionDone(tx);
    const result = await fn(tx.objectStore(TEACHER_STORE));
    await done;
    return result;
  }
  return {
    async getItem(key) {
      const value = await run('readonly', store => requestToPromise(store.get(key)));
      return value ?? null;
    },
    async compareAndSet(key, expected, value) {
      return run('readwrite',store=>new Promise((resolve,reject)=>{const request=store.get(key);request.onerror=()=>reject(request.error);request.onsuccess=()=>{if((request.result??null)!==expected){resolve(false);return;}const put=store.put(value,key);put.onsuccess=()=>resolve(true);put.onerror=()=>reject(put.error);};}));
    },
    async setItem(key, value) {
      await run('readwrite', store => requestToPromise(store.put(value, key)));
    },
    async removeItem(key) {
      await run('readwrite', store => requestToPromise(store.delete(key)));
    }
  };
}

export async function openTeacherStorage({indexedDB, localStorage} = {}) {
  if (indexedDB) {
    try { const storage=openTeacherIndexedDb(indexedDB);await storage.getItem(TEACHER_STORAGE_KEY);return storage; } catch { /* Local storage remains available. */ }
  }
  if (!localStorage) throw new Error('This browser has no storage for teacher decks');
  return {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: key => localStorage.removeItem(key)
  };
}

async function readRaw(storage) {
  const value = storage.getItem(TEACHER_STORAGE_KEY);
  return value && typeof value.then === 'function' ? await value : value;
}

async function writeRaw(storage, value) {
  const result = storage.setItem(TEACHER_STORAGE_KEY, value);
  if (result && typeof result.then === 'function') await result;
}

export function createTeacherDecks({storage, catalog, clock = () => Date.now(), uuid = () => globalThis.crypto.randomUUID(), withLock = operation => globalThis.navigator?.locks?globalThis.navigator.locks.request('hanzifun.teacher.decks.write',operation):operation()}) {
  const byGlyph = indexCatalog(catalog);
  let damagedSnapshot = null;
  async function load() {
    const raw = await readRaw(storage);
    if (raw == null) { damagedSnapshot = null; return emptyTeacherStore(); }
    try {
      const data = validateTeacherStore(JSON.parse(raw), {byGlyph});
      damagedSnapshot = null;
      return data;
    } catch (error) {
      damagedSnapshot = raw;
      error.damaged = true;
      throw error;
    }
  }
  async function mutateUnlocked(change, {recover = false} = {}) {
    try {
      const before = await readRaw(storage);
      let current;
      if (before == null) current = emptyTeacherStore();
      else {
        try { current = validateTeacherStore(JSON.parse(before), {byGlyph}); damagedSnapshot = null; }
        catch (error) {
          damagedSnapshot = before;
          if (!recover) return {saved:false, code:'damaged', reason:error.message, originalSnapshot: before};
          current = emptyTeacherStore();
        }
      }
      const next = clone(current);
      const answer = await change(next, current) || {};
      if (answer.reject) return {saved:false, ...answer.reject};
      if (answer.skip) return {saved:true, idempotent:true, ...answer.result};
      const written = answer.replace ? clone(answer.replace) : next;
      written.storeRevision = current.storeRevision + 1;
      const checked = validateTeacherStore(written, {byGlyph});
      const serialized = JSON.stringify(checked);
      if (await readRaw(storage) !== before) return {saved:false, code:'conflict', reason:'Another tab changed teacher decks. Export, then reload.'};
      if(storage.compareAndSet){if(!await storage.compareAndSet(TEACHER_STORAGE_KEY,before,serialized))return {saved:false,code:'conflict',reason:'Another tab changed teacher decks. Reload and retry.'};}else await writeRaw(storage, serialized);
      if (await readRaw(storage) !== serialized) return {saved:false, code:'conflict', reason:'Write verification failed. Export recovery.'};
      damagedSnapshot = null;
      return {saved:true, store: checked, ...answer.result};
    } catch (error) {
      return {saved:false, code: error.damaged ? 'damaged' : 'storage', reason: error.message, originalSnapshot: damagedSnapshot};
    }
  }
  const mutate=(change,options)=>withLock(()=>mutateUnlocked(change,options));
  function remember(next, operationId, deckId) {
    if (!operationId) return;
    next.operations.push({id: operationId, deckId});
    if (next.operations.length > 200) next.operations.splice(0, next.operations.length - 200);
  }
  function seen(current, operationId) {
    return operationId ? current.operations.find(operation => operation.id === operationId) : null;
  }
  return {
    async getStatus() {
      try { await load(); return {damaged:false, originalSnapshot:null}; }
      catch (error) { return {damaged:true, reason:error.message, originalSnapshot: damagedSnapshot}; }
    },
    async list() {
      const data = await load();
      return Object.values(data.decks).sort((a, b) => a.createdAt - b.createdAt || a.deckId.localeCompare(b.deckId));
    },
    async read(deckId) {
      const data = await load();
      const deck = data.decks[deckId];
      return deck ? clone(deck) : {ok:false, code:'missing', reason:'That deck is not on this device.'};
    },
    async create({name, notes = '', glyphs, operationId} = {}) {
      return mutate(next => {
        const prior = seen(next, operationId);
        if (prior) return {skip:true, result:{deck: clone(next.decks[prior.deckId])}};
        const copy = checkCopy(name, notes);
        if (!copy.ok) return {reject: copy};
        const resolved = resolveTeacherGlyphs(glyphs, {byGlyph});
        if (!resolved.ok) return {reject: resolved};
        const now = clock();
        const deck = {deckId: uuid(), name: copy.name, notes: copy.notes, revision: 1, createdAt: now, updatedAt: now, items: resolved.items, history: []};
        next.decks[deck.deckId] = deck;
        remember(next, operationId, deck.deckId);
        return {result:{deck: clone(deck)}};
      });
    },
    async update({deckId, expectedRevision, name, notes, glyphs, operationId} = {}) {
      return mutate((next, current) => {
        const prior = seen(current, operationId);
        if (prior) return {skip:true, result:{deck: clone(current.decks[prior.deckId])}};
        const deck = next.decks[deckId];
        if (!deck) return {reject:{code:'missing', reason:'That deck is not on this device.'}};
        if (deck.revision !== expectedRevision) return {reject:{code:'conflict', reason:'This deck changed. Reload it before saving again.', revision: deck.revision}};
        const copy = checkCopy(name ?? deck.name, notes ?? deck.notes);
        if (!copy.ok) return {reject: copy};
        const resolved = glyphs === undefined ? {ok:true, items: deck.items} : resolveTeacherGlyphs(glyphs, {byGlyph});
        if (!resolved.ok) return {reject: resolved};
        deck.history.push({revision: deck.revision, name: deck.name, notes: deck.notes, items: clone(deck.items), updatedAt: deck.updatedAt});
        deck.name = copy.name;
        deck.notes = copy.notes;
        deck.items = resolved.items;
        deck.revision += 1;
        deck.updatedAt = clock();
        remember(next, operationId, deck.deckId);
        return {result:{deck: clone(deck)}};
      });
    },
    async remove({deckId, operationId} = {}) {
      return mutate(next => {
        const prior = seen(next, operationId);
        if (prior) return {skip:true, result:{removed:true, deckId}};
        if (!next.decks[deckId]) return {reject:{code:'missing', reason:'That deck is not on this device.'}};
        delete next.decks[deckId];
        remember(next, operationId, deckId);
        return {result:{removed:true, deckId}};
      });
    },
    async startPractice({deckId} = {}) {
      return mutate(next => {
        const deck = next.decks[deckId];
        if (!deck) return {reject:{code:'missing', reason:'That deck is not on this device.'}};
        const session = {sessionId: uuid(), deckId, revision: deck.revision, name: deck.name, items: clone(deck.items), createdAt: clock()};
        next.sessions[session.sessionId] = session;
        return {result:{session: clone(session)}};
      });
    },
    async listPractices(){const data=await load();return Object.values(data.sessions).map(clone).sort((a,b)=>b.createdAt-a.createdAt);},
    async readPractice(sessionId) {
      const data = await load();
      const session = data.sessions[sessionId];
      return session ? clone(session) : {ok:false, code:'missing', reason:'That practice snapshot is not on this device.'};
    },
    async exportJson() {
      const status = await this.getStatus();
      if (status.damaged) return JSON.stringify({kind:'HanziFunTeacherExport', damaged:true, originalSnapshot: status.originalSnapshot});
      const raw = await readRaw(storage);
      const store = raw == null ? emptyTeacherStore() : validateTeacherStore(JSON.parse(raw), {byGlyph});
      return JSON.stringify({kind:'HanziFunTeacherExport', damaged:false, store});
    },
    async importJson(raw) {
      if (typeof raw !== 'string') return {saved:false, code:'invalid', reason:'Import a JSON export.'};
      if (new TextEncoder().encode(raw).byteLength > MAX_IMPORT_BYTES) return {saved:false, code:'limit', reason:'The file is larger than 1 MiB. Current decks were kept.'};
      let parsed;
      try { parsed = JSON.parse(raw); } catch { return {saved:false, code:'invalid', reason:'The file is not JSON. Current decks were kept.'}; }
      const incoming = parsed?.kind === 'HanziFunTeacherExport' ? parsed.store : parsed;
      if (parsed?.damaged) return {saved:false, code:'damaged', reason:'That export is a damaged snapshot. Current decks were kept.'};
      try { validateTeacherStore(incoming, {byGlyph}); }
      catch (error) { return {saved:false, code:'invalid', reason:error.message}; }
      return mutate(() => ({replace: incoming, result:{imported:true}}));
    },
    async clear() {
      return mutate(() => ({replace: emptyTeacherStore(), result:{cleared:true}}), {recover:true});
    }
  };
}

export function searchPublishedCharacters(catalog, query) {
  const items = catalog.items || catalog;
  const needle = text(query).trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter(item => item.glyph.includes(needle) || item.pinyin.toLowerCase().includes(needle) || item.pinyinPlain.includes(needle) || item.meaning.toLowerCase().includes(needle));
}

export function printLayout(count, paper) {
  const kind = paper === 'Letter' ? 'Letter' : 'A4';
  const box = kind === 'Letter' ? {w:190, h:250} : {w:186, h:270};
  const cols = Math.max(1, Math.ceil(Math.sqrt(count > 24 ? count : count * box.w / box.h)));
  const rows = Math.ceil(count / cols);
  const density = count <= 6 ? 'roomy' : count <= 24 ? 'compact' : 'dense';
  return {paper: kind, cols, rows, density};
}

export function renderTeacherPrint(deck, {paper = 'A4'} = {}) {
  const layout = printLayout(deck.items.length, paper);
  const cards = deck.items.map(item => `<article class="hf-teacher-card" data-teacher-card="${e(item.glyph)}"><h2 class="hf-teacher-glyph" lang="zh-CN">${e(item.glyph)}</h2><p class="hf-teacher-meta" lang="zh-Latn-pinyin">${e(item.pinyin)}</p><p class="hf-teacher-meta">${e(item.meaning)}</p><div class="hf-teacher-trace" aria-hidden="true"><span></span><span></span><span></span><span></span></div></article>`).join('');
  return `<section class="hf-teacher-print" data-teacher-print data-paper="${layout.paper}" data-print-fit="single-page" data-card-count="${deck.items.length}" data-density="${layout.density}" style="--hf-cols:${layout.cols};--hf-rows:${layout.rows}"><h2>${e(deck.name)}</h2><div class="hf-teacher-print-grid">${cards}</div></section>`;
}

export function mountTeacherWorkspace(root,repo,catalog){
 const list=root.querySelector('[data-teacher-list]'),picker=root.querySelector('[data-teacher-picker]'),status=root.querySelector('[data-teacher-status]'),printSlot=root.querySelector('[data-teacher-print-slot]'),practiceSlot=root.querySelector('[data-teacher-practice]');
 const field=name=>root.querySelector(`[name="${name}"]`),say=message=>{status.textContent=message;};
 let editing=null,session=null,cursor=0,revealed=false;
 const checked=()=>[...root.querySelectorAll('[data-teacher-choice]:checked')].map(n=>n.value);
 function selected(){const order=field('teacher-order')?.value.trim();if(!order)return checked();const glyphs=[...order].filter(g=>!/\s|[,，]/u.test(g)),choices=checked();if(glyphs.length!==choices.length||glyphs.some(g=>!choices.includes(g))){throw Error('Order must contain each selected character once. Update the selection or clear the order field.');}return glyphs;}
 function reset(){editing=null;field('teacher-name').value='';field('teacher-notes').value='';field('teacher-order').value='';for(const n of picker.querySelectorAll('input'))n.checked=false;field('teacher-create').textContent='Save deck';}
 function practice(){if(!session||!practiceSlot)return;const item=session.items[cursor];practiceSlot.innerHTML=`<h2>${e(session.name)} · saved revision ${session.revision}</h2><p>${cursor+1} / ${session.items.length}</p><p class="large-hanzi" lang="zh-CN">${e(item.glyph)}</p>${revealed?`<p>${e(item.pinyin)} · ${e(item.meaning)}</p>`:''}<button type="button" data-teacher-flip>Show ${revealed?'character':'answer'}</button> <button type="button" data-teacher-next>${cursor+1===session.items.length?'Start again':'Next character'}</button>`;}
 async function paint(){const decks=await repo.list(),sessions=await repo.listPractices();list.innerHTML=decks.map(d=>`<article data-teacher-deck="${e(d.deckId)}" data-teacher-revision="${d.revision}"><h2>${e(d.name)}</h2><p lang="zh-CN">${d.items.map(i=>e(i.glyph)).join(' ')}</p><button type="button" data-teacher-edit="${e(d.deckId)}">Edit and reorder</button> <button type="button" data-teacher-start="${e(d.deckId)}">Practise saved revision</button> <button type="button" data-teacher-print-deck="${e(d.deckId)}">Print</button> <button type="button" data-teacher-delete="${e(d.deckId)}">Delete deck</button></article>`).join('')+(sessions.length?`<h2>Saved practice snapshots</h2>${sessions.slice(0,10).map(s=>`<p><button type="button" data-teacher-resume="${e(s.sessionId)}">${e(s.name)} · revision ${s.revision}</button></p>`).join('')}`:'');}
 root.addEventListener('submit',e=>e.preventDefault());
 root.addEventListener('input',event=>{if(event.target?.name!=='teacher-search')return;const visible=new Set(searchPublishedCharacters(catalog,event.target.value).map(i=>i.glyph));for(const label of picker.querySelectorAll('[data-teacher-option]'))label.hidden=!visible.has(label.dataset.teacherOption);});
 root.addEventListener('click',async event=>{
  const button=event.target.closest?.('button');if(!button)return;
  try{
   if(button.name==='teacher-create'){
    const data={name:field('teacher-name').value,notes:field('teacher-notes').value,glyphs:selected()},result=editing?await repo.update({...data,deckId:editing.deckId,expectedRevision:editing.revision}):await repo.create(data);
    say(result.saved?'Deck saved on this device.':result.reason);if(result.saved){reset();await paint();}
   }
   if(button.name==='teacher-cancel'){reset();say('Ready for a new deck.');}
   if(button.dataset.teacherEdit){const d=await repo.read(button.dataset.teacherEdit);if(!d.items)throw Error(d.reason);editing={deckId:d.deckId,revision:d.revision};field('teacher-name').value=d.name;field('teacher-notes').value=d.notes;field('teacher-order').value=d.items.map(i=>i.glyph).join(' ');for(const n of picker.querySelectorAll('input'))n.checked=d.items.some(i=>i.glyph===n.value);field('teacher-create').textContent='Save changes';field('teacher-name').focus();say('Editing revision '+d.revision+'. Change the order field to reorder selected characters.');}
   if(button.dataset.teacherStart){const r=await repo.startPractice({deckId:button.dataset.teacherStart});if(!r.saved)throw Error(r.reason);session=r.session;cursor=0;revealed=false;practice();await paint();}
   if(button.dataset.teacherResume){session=await repo.readPractice(button.dataset.teacherResume);if(!session.items)throw Error(session.reason);cursor=0;revealed=false;practice();}
   if(button.hasAttribute('data-teacher-flip')){revealed=!revealed;practice();}
   if(button.hasAttribute('data-teacher-next')){cursor=(cursor+1)%session.items.length;revealed=false;practice();}
   if(button.name==='teacher-export'){const raw=await repo.exportJson(),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='hanzifun-teacher-decks.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
   if(button.name==='teacher-import'){const file=field('teacher-file').files?.[0];if(!file)throw Error('Choose a JSON file first.');if(file.size>MAX_IMPORT_BYTES)throw Error('The file is larger than 1 MiB. Current decks were kept.');const result=await repo.importJson(await file.text());say(result.saved?'Import saved on this device.':result.reason);if(result.saved){reset();await paint();}}
   const printId=button.dataset.teacherPrintDeck||(button.name==='teacher-print'?list.querySelector('[data-teacher-deck]')?.dataset.teacherDeck:null);
   if(printId){const deck=await repo.read(printId);if(!deck.items)throw Error(deck.reason);const html=renderTeacherPrint(deck,{paper:root.querySelector('[name=teacher-paper]:checked')?.value||'A4'});printSlot.innerHTML=html;document.querySelector('[data-teacher-print-document]')?.remove();const doc=document.createElement('div');doc.setAttribute('data-teacher-print-document','');doc.innerHTML=html;doc.hidden=true;document.body.append(doc);document.body.classList.add('hf-teacher-printing');window.print?.();}
   if(button.dataset.teacherDelete){const result=await repo.remove({deckId:button.dataset.teacherDelete});say(result.saved?'Deck deleted. Practice snapshots stay on this device.':result.reason);if(result.saved)await paint();}
  }catch(error){say(error.message||'Could not save. Please retry.');}
 });
 window.addEventListener('afterprint',()=>{document.body.classList.remove('hf-teacher-printing');document.querySelector('[data-teacher-print-document]')?.remove();});
 return paint();
}

