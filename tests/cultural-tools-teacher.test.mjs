import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'parse5';
import {characterReviewState} from '../site/publication-review.mjs';
import {
  CULTURAL_SAVE_KEY, MENU_SEQUENCES, ZODIAC_CALENDAR, assertCulturalFixtures, culturalResultHtml, culturalToolPages,
  expectedStemBranch, publishedCatalog, queryMenu, queryNames, queryTattoo, queryZodiac, renderNameResult,
  renderTattooResult, renderZodiacResult, savePublishedCharacters
} from '../site/pages/cultural-tools.mjs';
import {teacherDeckPage} from '../site/pages/teacher-decks.mjs';
import {
  MAX_DECK_ITEMS, TEACHER_STORAGE_KEY, createTeacherDecks, openTeacherIndexedDb, printLayout, renderTeacherPrint,
  resolveTeacherGlyphs, searchPublishedCharacters
} from '../src/client/teacher-decks.mjs';

const attr = (node, key) => node.attrs?.find(item => item.name === key)?.value;
const nodes = node => [node, ...(node.childNodes || []).flatMap(nodes)];
const textOf = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(textOf).join('');
const hrefs = html => nodes(parse(html)).filter(node => node.tagName === 'a').map(node => attr(node, 'href'));
const dictionaryGlyph = href => {
  const match = /^\/dictionary\/([^/]+)\/$/.exec(href || '');
  return match ? decodeURIComponent(match[1]) : null;
};
const catalog = publishedCatalog();
const accepted = new Map([...catalog.items].map(item => [item.glyph, item]));

class Memory {
  map = new Map();
  fail = false;
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { if (this.fail) throw new Error('QuotaExceededError'); this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}
const sample = [
  {glyph:'林', characterId:'char:lin', pinyin:'lín', pinyinPlain:'lin', meaning:'woods', path:'/dictionary/林/'},
  {glyph:'安', characterId:'char:an', pinyin:'ān', pinyinPlain:'an', meaning:'peaceful; safe', path:'/dictionary/安/'},
  {glyph:'明', characterId:'char:ming', pinyin:'míng', pinyinPlain:'ming', meaning:'bright', path:'/dictionary/明/'}
];
const repoFor = (storage = new Memory(), items = sample) => createTeacherDecks({
  storage, catalog: items, clock: () => 1_700_000_000_000,
  uuid: (() => { let n = 0; return () => 'id-' + (++n); })()
});

function assertPublishedLinks(html) {
  const links = hrefs(html).map(dictionaryGlyph).filter(Boolean);
  assert.ok(links.length);
  for (const glyph of links) {
    const item = accepted.get(glyph);
    assert.ok(item, glyph);
    assert.equal(characterReviewState(item.characterId).accepted, true);
    assert.equal(item.path, '/dictionary/' + encodeURIComponent(glyph) + '/');
  }
  return links;
}

test('cultural fixtures use the published dictionary and the Observatory year boundary', () => {
  const facts = assertCulturalFixtures(catalog);
  assert.equal(facts.published, 339);
  assert.equal(facts.names, 30);
  assert.equal(facts.dishes, 50);
  assert.equal(new Set(MENU_SEQUENCES).size, 50);
  for (const row of ZODIAC_CALENDAR.boundaries) assert.equal(row.label, expectedStemBranch(Number(row.date.slice(0, 4))));
  const pages = culturalToolPages(catalog);
  assert.deepEqual(pages.map(page => page.path), [
    '/tools/chinese-name-generator/',
    '/tools/chinese-menu-decoder/',
    '/tools/zodiac-elements-calculator/',
    '/tools/tattoo-character-checker/'
  ]);
  for (const page of pages) {
    const tree = nodes(parse(page.content));
    const form = tree.find(node => node.tagName === 'form');
    assert.equal(attr(form, 'method'), 'post');
    assert.equal(attr(form, 'action'), '');
    const script = tree.find(node => node.tagName === 'script');
    const data = JSON.parse(textOf(script));
    assert.equal(data['@type'], 'WebApplication');
    assert.equal(data.url, 'https://hanzifun.online' + page.path);
    for (const glyph of hrefs(page.content).map(dictionaryGlyph).filter(Boolean)) {
      assert.equal(characterReviewState(accepted.get(glyph).characterId).accepted, true);
    }
    assert.doesNotMatch(textOf(parse(page.content)), /char:[0-9a-f]+|pending|unverified|coming soon|human-reviewed/i);
  }
});

test('name, menu, zodiac, and tattoo results change with input and never invent a dead link', () => {
  const calm = queryNames({style:'calm', displayName:'Alex'}, catalog);
  const renamed = queryNames({style:'calm', displayName:'Blake'}, catalog);
  const bright = queryNames({style:'bright', displayName:'Alex'}, catalog);
  assert.deepEqual(calm.candidates.map(item => item.glyphs), renamed.candidates.map(item => item.glyphs));
  assert.equal(calm.candidates.length, 3);
  assert.notDeepEqual(calm.candidates.map(item => item.glyphs), bright.candidates.map(item => item.glyphs));
  assert.equal(calm.candidates[0].transliterated, false);
  const nameHtml = renderNameResult(calm);
  assert.match(nameHtml, /Alex/);
  assert.equal(hrefs(nameHtml).some(href => /alex/i.test(href)), false);
  assert.equal(queryNames({style:'calm', surname:'金'}, catalog).status, 'unsupported');
  assert.equal(queryNames({style:'nature', surname:'孙'}, catalog).status, 'empty');
  assert.deepEqual(queryNames({style:'calm', sound:'an'}, catalog).candidates.map(item => item.glyphs[1]), ['安','安','安']);

  const rice = queryMenu('米饭', catalog);
  assert.equal(rice.status, 'matched');
  assert.ok(rice.dishes.some(dish => dish.text === '米饭'));
  assert.equal(rice.dishes.every(dish => dish.compoundMeaning === null), true);
  const unknown = queryMenu('宫保鸡丁', catalog);
  assert.equal(unknown.status, 'uncertain');
  assert.match(unknown.notice, /not a statement about ingredients, allergies, or food safety/);
  const unknownHtml = culturalResultHtml('menu', '宫保鸡丁', catalog);
  assert.match(unknownHtml, /data-unpublished-glyph="宫"/);
  assert.equal(hrefs(unknownHtml).some(href => decodeURIComponent(href).includes('宫')), false);
  assert.ok(hrefs(unknownHtml).some(href => href.includes('/dictionary/' + encodeURIComponent('鸡') + '/')));

  const before = queryZodiac('2024-02-09', catalog);
  const onNewYear = queryZodiac('2024-02-10', catalog);
  const leap = queryZodiac('2024-02-29', catalog);
  assert.equal(before.lunarYearLabel, '癸卯');
  assert.equal(onNewYear.lunarYearLabel, '甲辰');
  assert.notEqual(before.lunarYearLabel, expectedStemBranch(before.naiveGregorianYear));
  assert.equal(leap.lunarYearLabel, '甲辰');
  assert.equal(queryZodiac('2023-02-29', catalog).status, 'invalid');
  assert.equal(queryZodiac('2000-02-04', catalog).status, 'unsupported');
  assert.equal(queryZodiac('2000-02-29', catalog).lunarYearLabel, '庚辰');
  assert.equal(queryZodiac('2034-02-18', catalog).lunarYearLabel, '癸丑');
  assert.equal(queryZodiac('2034-02-19', catalog).status, 'unsupported');
  assert.equal(queryZodiac('2005-02-08', catalog).lunarYearLabel, '甲申');
  assert.equal(queryZodiac('2005-02-09', catalog).lunarYearLabel, '乙酉');
  const dragon = renderZodiacResult(onNewYear, catalog);
  assert.equal(hrefs(dragon).some(href => decodeURIComponent(href).includes('/龙/')), false);
  assert.ok(hrefs(dragon).includes('/dictionary/' + encodeURIComponent('木') + '/'));
  assert.equal(hrefs(dragon).some(href => href.includes('2024-02-10')), false);
  const metal = renderZodiacResult(queryZodiac('2000-02-05', catalog), catalog);
  assert.equal(hrefs(metal).some(href => decodeURIComponent(href).includes('/金/')), false);
  assert.ok(hrefs(metal).includes('/dictionary/' + encodeURIComponent('钱') + '/'));
  const cards = nodes(parse(culturalToolPages(catalog)[2].content)).filter(node => attr(node, 'data-five-element') !== undefined);
  assert.deepEqual(cards.map(card => attr(card, 'data-five-element')), ['金','木','水','火','土']);

  const tattoo = queryTattoo('安好', catalog);
  assert.equal(tattoo.phraseMeaning, null);
  assert.match(renderTattooResult(tattoo), /not the meaning of the whole phrase/);
  assert.equal(queryTattoo('木'.repeat(8), catalog).status, 'ok');
  assert.equal(queryTattoo('木'.repeat(9), catalog).status, 'invalid');
  assert.equal(queryTattoo('ABC', catalog).status, 'invalid');
  const polyphonic = queryTattoo('发', catalog);
  assert.equal(polyphonic.ambiguous, true);
  assert.ok(polyphonic.characters[0].readings.length > 1);
  const gate = renderTattooResult(queryTattoo('门', catalog));
  const unlinked = nodes(parse(gate)).filter(node => attr(node, 'data-unlinked-form'));
  assert.ok(unlinked.length);
  for (const node of unlinked) assert.equal(accepted.has(attr(node, 'data-unlinked-form')), false);
  assertPublishedLinks(dragon + metal + nameHtml + unknownHtml + gate + culturalResultHtml('tattoo', '安好', catalog));
});

test('five-element card links are real anchors, including cards whose element has no dictionary page', () => {
  const html = culturalToolPages(catalog)[2].content;
  const cards = nodes(parse(html)).filter(node => attr(node, 'data-five-element') !== undefined);
  for (const card of cards) {
    const links = nodes(card).filter(node => node.tagName === 'a' && dictionaryGlyph(attr(node, 'href')));
    assert.equal(links.length, 2);
    for (const link of links) {
      const glyph = dictionaryGlyph(attr(link, 'href'));
      assert.equal(characterReviewState(accepted.get(glyph).characterId).accepted, true);
    }
    const element = attr(card, 'data-five-element');
    if (!accepted.has(element)) assert.equal(links.some(link => dictionaryGlyph(attr(link, 'href')) === element), false);
  }
});

test('local character save keeps published ids and leaves a damaged value untouched', () => {
  const storage = new Memory();
  const ids = queryTattoo('安好', catalog).characters.map(item => item.characterId);
  const saved = savePublishedCharacters(storage, ids, catalog);
  assert.equal(saved.saved, true);
  const raw = storage.getItem(CULTURAL_SAVE_KEY);
  assert.deepEqual(JSON.parse(raw).characterIds, ids);
  assert.equal(raw.includes('安好'), false);
  assert.equal(savePublishedCharacters(storage, ['missing'], catalog).saved, false);
  storage.setItem(CULTURAL_SAVE_KEY, '{broken');
  const refused = savePublishedCharacters(storage, ids, catalog);
  assert.equal(refused.saved, false);
  assert.equal(storage.getItem(CULTURAL_SAVE_KEY), '{broken');
  assert.equal(refused.originalSnapshot, '{broken');
});

test('teacher decks support create, update, conflict, practice snapshots, and import guards', async () => {
  const storage = new Memory();
  const repo = repoFor(storage);
  assert.equal((await repo.create({name:' ', glyphs:['林','安']})).code, 'name');
  assert.equal((await repo.create({name:'One', glyphs:['林']})).code, 'limit');
  assert.equal((await repo.create({name:'Copy', glyphs:['林','林']})).code, 'duplicate');
  assert.equal((await repo.create({name:'Missing', glyphs:['林','金']})).code, 'unpublished');
  const tooMany = Array.from({length: MAX_DECK_ITEMS + 1}, (_, index) => ({...sample[0], glyph:'字' + index, characterId:'id-' + index}));
  assert.equal(resolveTeacherGlyphs(tooMany.map(item => item.glyph), tooMany).code, 'limit');
  const created = await repo.create({name:'A & B <deck>', notes:'Classroom set', glyphs:['林','安'], operationId:'create-1'});
  assert.equal(created.saved, true);
  assert.equal(created.deck.revision, 1);
  const again = await repo.create({name:'Other', glyphs:['林','明'], operationId:'create-1'});
  assert.equal(again.idempotent, true);
  assert.equal((await repo.list()).length, 1);
  const practice = await repo.startPractice({deckId: created.deck.deckId});
  const updated = await repo.update({deckId: created.deck.deckId, expectedRevision: 1, name:'Woods', glyphs:['林','明'], operationId:'edit-1'});
  assert.equal(updated.deck.revision, 2);
  assert.deepEqual(updated.deck.history[0].items.map(item => item.glyph), ['林','安']);
  const stale = await repo.update({deckId: created.deck.deckId, expectedRevision: 1, name:'Stale', glyphs:['安','明']});
  assert.equal(stale.saved, false);
  assert.equal(stale.code, 'conflict');
  assert.equal((await repo.read(created.deck.deckId)).revision, 2);
  const parallel = createTeacherDecks({storage, catalog: sample, clock: () => 5, uuid: () => 'other-tab'});
  const clash = await parallel.update({deckId: created.deck.deckId, expectedRevision: 1, name:'Other tab', glyphs:['林','安']});
  assert.equal(clash.saved, false);
  assert.equal(clash.code, 'conflict');
  assert.equal((await repo.read(created.deck.deckId)).name, 'Woods');
  const repeated = await repo.update({deckId: created.deck.deckId, expectedRevision: 1, name:'Ignored', glyphs:['安','明'], operationId:'edit-1'});
  assert.equal(repeated.idempotent, true);
  assert.equal((await repo.read(created.deck.deckId)).revision, 2);
  const remembered = await repo.readPractice(practice.session.sessionId);
  assert.deepEqual(remembered.items.map(item => item.glyph), ['林','安']);
  assert.equal((await repo.remove({deckId: created.deck.deckId})).saved, true);
  assert.equal((await repo.read(created.deck.deckId)).code, 'missing');
  assert.deepEqual((await repo.readPractice(practice.session.sessionId)).items.map(item => item.glyph), ['林','安']);

  const other = new Memory();
  other.setItem(TEACHER_STORAGE_KEY, storage.getItem(TEACHER_STORAGE_KEY));
  const second = repoFor(other);
  const lost = await second.update({deckId: created.deck.deckId, expectedRevision: 1, name:'Tab', glyphs:['林','安']});
  assert.equal(lost.code, 'missing');
  const fresh = repoFor();
  await fresh.create({name:'Trees', glyphs:['林','安']});
  const raw = await fresh.exportJson();
  const parsed = JSON.parse(raw);
  const deckId = Object.keys(parsed.store.decks)[0];
  parsed.store.decks[deckId].email = 'teacher@example.com';
  const imported = repoFor();
  assert.equal((await imported.importJson(JSON.stringify(parsed))).saved, true);
  assert.equal((await imported.exportJson()).includes('teacher@example.com'), false);
  parsed.store.decks[deckId].items[0].meaning = 'forged sense';
  const untouched = new Memory();
  const guarded = repoFor(untouched);
  await guarded.create({name:'Keep', glyphs:['林','安']});
  const before = untouched.getItem(TEACHER_STORAGE_KEY);
  assert.equal((await guarded.importJson(JSON.stringify(parsed))).saved, false);
  assert.equal(untouched.getItem(TEACHER_STORAGE_KEY), before);
  assert.equal((await guarded.importJson('{broken')).saved, false);
  assert.equal(untouched.getItem(TEACHER_STORAGE_KEY), before);
  storage.setItem(TEACHER_STORAGE_KEY, '{broken');
  const damaged = repoFor(storage);
  assert.equal((await damaged.create({name:'No', glyphs:['林','安']})).saved, false);
  assert.equal(storage.getItem(TEACHER_STORAGE_KEY), '{broken');
  assert.equal(JSON.parse(await damaged.exportJson()).originalSnapshot, '{broken');
  assert.equal((await damaged.clear()).saved, true);
  assert.equal((await damaged.list()).length, 0);
  storage.fail = true;
  const kept = storage.getItem(TEACHER_STORAGE_KEY);
  assert.equal((await damaged.create({name:'Quota', glyphs:['林','安']})).saved, false);
  assert.equal(storage.getItem(TEACHER_STORAGE_KEY), kept);
});

test('teacher print is one A4 or Letter sheet and the page links only published characters', () => {
  const deck = {name:'A & B <deck>', items: sample.slice(0, 2)};
  for (const paper of ['A4', 'Letter']) {
    const html = renderTeacherPrint(deck, {paper});
    const tree = nodes(parse(html));
    const sheet = tree.find(node => attr(node, 'data-teacher-print') !== undefined);
    assert.equal(attr(sheet, 'data-paper'), paper);
    assert.equal(attr(sheet, 'data-print-fit'), 'single-page');
    assert.equal(attr(sheet, 'data-card-count'), '2');
    const cards = tree.filter(node => attr(node, 'data-teacher-card'));
    assert.deepEqual(cards.map(card => attr(card, 'data-teacher-card')), ['林','安']);
    for (const card of cards) assert.equal(nodes(card).filter(node => node.tagName === 'span' && node.parentNode?.attrs?.some(item => item.name === 'class' && item.value === 'hf-teacher-trace')).length, 4);
    assert.match(textOf(sheet), /lín/);
    assert.match(textOf(sheet), /woods/);
    assert.match(html, /A &amp; B &lt;deck&gt;/);
    assert.equal(html.includes('@'), false);
    assert.equal(printLayout(2, paper).paper, paper);
  }
  const many = Array.from({length: 100}, (_, index) => ({glyph:'林', characterId:'char:lin', pinyin:'lín', meaning:'woods', path:'/dictionary/林/'}));
  const dense = renderTeacherPrint({name:'Full set', items: many}, {paper:'A4'});
  assert.equal(attr(nodes(parse(dense)).find(node => attr(node, 'data-teacher-print') !== undefined), 'data-card-count'), '100');
  assert.equal(nodes(parse(dense)).filter(node => node.tagName === 'article').length, 100);
  const page = teacherDeckPage(catalog);
  assert.match(page.content, /Textbook chapter mapping is not included/);
  assert.match(page.content, /name="teacher-print"/);
  assert.match(page.content, /name="teacher-export"/);
  assert.match(page.content, /name="teacher-import"/);
  const choices = nodes(parse(page.content)).filter(node => attr(node, 'data-teacher-choice') !== undefined);
  assert.equal(choices.length, catalog.count);
  assertPublishedLinks(page.content);
  assert.deepEqual(searchPublishedCharacters(catalog, 'woods').map(item => item.glyph).includes('林') ? ['林'] : [], accepted.get('林') ? ['林'] : []);
  const css = fs.readFileSync(new URL('../site/public/site-styles.css', import.meta.url), 'utf8');
  const marker = css.indexOf('Cultural tools and local teacher decks');
  assert.ok(marker > css.indexOf('.five-elements-grid'));
  const added = css.slice(marker);
  assert.match(added, /\.hf-teacher-print\[data-paper="A4"\]\{width:186mm;height:270mm\}/);
  assert.match(added, /\.hf-teacher-print\[data-paper="Letter"\]\{width:190mm;height:250mm\}/);
  assert.match(added, /@media print/);
  assert.match(added, /break-inside:avoid/);
  assert.equal(added.includes('.five-elements-grid{'), false);
  assert.equal(added.includes('line-clamp'), false);
});

test('IndexedDB teacher storage round-trips a deck without touching local guest data', async () => {
  const databases = new Map();
  const idb = {open(name) {
    const request = {};
    queueMicrotask(() => {
      let record = databases.get(name);
      const created = !record;
      if (!record) record = {names: new Set(), stores: new Map()};
      databases.set(name, record);
      const db = {
        objectStoreNames: {contains: store => record.names.has(store)},
        createObjectStore(store) { record.names.add(store); record.stores.set(store, new Map()); },
        transaction(store) {
          const map = record.stores.get(store);
          const jobs = [];
          const tx = {objectStore: () => ({
            get(key) { const req = {}; jobs.push(() => { req.result = map.get(key); req.onsuccess?.(); }); return req; },
            put(value, key) { const req = {}; jobs.push(() => { map.set(key, value); req.onsuccess?.(); }); return req; },
            delete(key) { const req = {}; jobs.push(() => { map.delete(key); req.onsuccess?.(); }); return req; }
          })};
          queueMicrotask(() => { for (const job of jobs) job(); queueMicrotask(() => tx.oncomplete?.()); });
          return tx;
        }
      };
      request.result = db;
      if (created) request.onupgradeneeded?.();
      request.onsuccess?.();
    });
    return request;
  }};
  const storage = openTeacherIndexedDb(idb);
  const repo = repoFor(storage);
  assert.equal((await repo.create({name:'Indexed', glyphs:['林','安']})).saved, true);
  assert.equal((await repo.list())[0].name, 'Indexed');
  assert.equal([...databases.keys()].includes('hanzifun.guest.snapshot.v1'), false);
});
