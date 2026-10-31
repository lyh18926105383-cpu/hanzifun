// Four cultural tools. Character links come only from accepted dictionary pages.
// Name, birthday and tattoo text stay in the result object for this page view.


const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HAN = /\p{Script=Han}/u;

export const CULTURAL_SAVE_KEY = 'hanzifun.cultural.characters.v1';
export const TOOL_PATHS = {
  names: '/tools/chinese-name-generator/',
  menu: '/tools/chinese-menu-decoder/',
  zodiac: '/tools/zodiac-elements-calculator/',
  tattoo: '/tools/tattoo-character-checker/'
};

const STEMS = [...'甲乙丙丁戊己庚辛壬癸'];
const BRANCHES = [...'子丑寅卯辰巳午未申酉戌亥'];
const ANIMALS = [...'鼠牛虎兔龙蛇马羊猴鸡狗猪'];
const STEM_ELEMENT = ['木','木','火','火','土','土','金','金','水','水'];

// 正月 dates and stem-branch labels transcribed from Hong Kong Observatory
// files T2000c.txt–T2034c.txt on 2026-10-31. The last row is the first
// unsupported instant (start of the following lunar year).
const BOUNDARY_TEXT = `
2000-02-05 庚辰
2001-01-24 辛巳
2002-02-12 壬午
2003-02-01 癸未
2004-01-22 甲申
2005-02-09 乙酉
2006-01-29 丙戌
2007-02-18 丁亥
2008-02-07 戊子
2009-01-26 己丑
2010-02-14 庚寅
2011-02-03 辛卯
2012-01-23 壬辰
2013-02-10 癸巳
2014-01-31 甲午
2015-02-19 乙未
2016-02-08 丙申
2017-01-28 丁酉
2018-02-16 戊戌
2019-02-05 己亥
2020-01-25 庚子
2021-02-12 辛丑
2022-02-01 壬寅
2023-01-22 癸卯
2024-02-10 甲辰
2025-01-29 乙巳
2026-02-17 丙午
2027-02-06 丁未
2028-01-26 戊申
2029-02-13 己酉
2030-02-03 庚戌
2031-01-23 辛亥
2032-02-11 壬子
2033-01-31 癸丑
2034-02-19 甲寅
`.trim();

export const ZODIAC_CALENDAR = {
  source: 'Hong Kong Observatory Gregorian-Lunar Calendar Conversion Table',
  sourceUrl: 'https://www.hko.gov.hk/en/gts/time/conversion.htm',
  filePattern: 'https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T{year}c.txt',
  retrieved: '2026-10-31',
  boundaries: BOUNDARY_TEXT.split('\n').map(line => {
    const [date, label] = line.split(' ');
    return {date, stem: label[0], branch: label[1], label};
  })
};
ZODIAC_CALENDAR.inclusiveStart = ZODIAC_CALENDAR.boundaries[0].date;
ZODIAC_CALENDAR.exclusiveEnd = ZODIAC_CALENDAR.boundaries.at(-1).date;

const NAME_PAIRS = [
  ['林','安','calm'],['周','安','calm'],['高','安','calm'],['孙','安','calm'],['文','安','calm'],
  ['林','休','calm'],['周','休','calm'],['高','休','calm'],['孙','休','calm'],['文','休','calm'],
  ['林','明','bright'],['周','明','bright'],['高','明','bright'],['孙','明','bright'],['文','明','bright'],
  ['林','光','bright'],['周','光','bright'],['高','光','bright'],['孙','光','bright'],['文','光','bright'],
  ['小','木','nature'],['天','木','nature'],['中','山','nature'],['小','水','nature'],['天','月','nature'],
  ['中','月','nature'],['小','月','nature'],['天','水','nature'],['中','水','nature'],['小','山','nature']
];

export const MENU_SEQUENCES = [
  '米饭','白饭','大米饭','小米饭','鸡蛋','牛肉','鸡肉','面条','牛肉面','鸡肉面',
  '鸡蛋面','饺子','白菜','热菜','热茶','热水','开水','白开水','包子','肉包',
  '菜包','面包','牛奶','热牛奶','蛋饼','肉饼','菜饼','苹果','水果','饭团',
  '茶水','清茶','白米','白茶','小菜','白水','蛋包','鸡蛋饼','牛肉饼','大饼',
  '小饼','面饼','水饺','菜饭','蛋饭','肉饭','鸡饭','果茶','茶点','白面条'
];

const FIVE_ELEMENTS = [
  {glyph:'金', pinyin:'jīn', english:'Metal', component:'钅', example:'钱'},
  {glyph:'木', pinyin:'mù', english:'Wood', component:'木', example:'林'},
  {glyph:'水', pinyin:'shuǐ', english:'Water', component:'氵', example:'清'},
  {glyph:'火', pinyin:'huǒ', english:'Fire', component:'灬', example:'秋'},
  {glyph:'土', pinyin:'tǔ', english:'Earth', component:'土', example:'地'}
];

let catalogCache;
export function setPublishedCatalog(value){
 if(!value?.items?.length)throw Error('Published character catalog is empty');
 catalogCache={items:value.items,byGlyph:new Map(value.items.map(item=>[item.glyph,item])),count:value.items.length};
 return catalogCache;
}
function publishedCatalog(){if(!catalogCache)throw Error('Published catalog has not loaded');return catalogCache;}

export function expectedStemBranch(year) {
  const offset = year - 4;
  return STEMS[((offset % 10) + 10) % 10] + BRANCHES[((offset % 12) + 12) % 12];
}

function requireItem(catalog, glyph) {
  const item = catalog.byGlyph.get(glyph);
  if (!item) throw new Error('Unpublished cultural glyph: ' + glyph);
  return item;
}

export function assertCulturalFixtures(catalog = publishedCatalog()) {
  if (NAME_PAIRS.length < 30) throw new Error('Name fixtures are short');
  if (MENU_SEQUENCES.length < 50) throw new Error('Menu fixtures are short');
  for (const [a, b] of NAME_PAIRS) { requireItem(catalog, a); requireItem(catalog, b); }
  for (const dish of MENU_SEQUENCES) for (const glyph of [...dish]) requireItem(catalog, glyph);
  for (const card of FIVE_ELEMENTS) requireItem(catalog, card.example);
  const dates = ZODIAC_CALENDAR.boundaries.map(row => row.date);
  if (dates.some((date, index) => index && date <= dates[index - 1])) throw new Error('Calendar boundaries are unsorted');
  for (const row of ZODIAC_CALENDAR.boundaries) {
    const year = Number(row.date.slice(0, 4));
    if (row.label !== expectedStemBranch(year)) throw new Error('Calendar label disagrees with the sexagenary cycle: ' + row.date);
  }
  return {names: NAME_PAIRS.length, dishes: MENU_SEQUENCES.length, published: catalog.count};
}

function charAnchor(item) {
  if (!item?.path?.startsWith('/dictionary/') || !item.path.endsWith('/')) throw new Error('Refusing a non-dictionary link');
  return `<a class="hf-cultural-char" lang="zh-CN" href="${e(item.path)}">${e(item.glyph)}</a>`;
}

function practiseLink(item) {
  return `<a class="hf-cultural-practice" href="/flashcards/?characterId=${encodeURIComponent(item.characterId)}">Practise ${e(item.glyph)}</a>`;
}

function saveButton(item) {
  return `<button type="button" data-cultural-save="${e(item.characterId)}">Save ${e(item.glyph)}</button>`;
}

function characterCard(item, extra = '') {
  const readings = item.readings.length > 1
    ? `<p>Stored readings: ${item.readings.map(row => e(row.pinyin)).join(', ')}. The published dictionary sense above belongs to ${e(item.readings.find(row => row.primary)?.pinyin || item.pinyin)}.</p>`
    : '';
  return `<article class="hf-cultural-card" data-character="${e(item.glyph)}"><h3>${charAnchor(item)}</h3><p lang="zh-Latn-pinyin">${e(item.pinyin)}</p><p>${e(item.meaning)}</p>${readings}${extra}<p>${practiseLink(item)} ${saveButton(item)}</p></article>`;
}

function jsonLd(tool, name, description) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    url: 'https://hanzifun.online' + TOOL_PATHS[tool],
    inLanguage: 'en'
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function queryNames(input = {}, catalog = publishedCatalog()) {
  assertCulturalFixtures(catalog);
  const style = String(input.style || '').trim();
  if (!['calm','bright','nature'].includes(style)) return {status:'invalid', candidates:[], notice:'Choose calm, bright, or nature. Nothing was selected.'};
  const display = String(input.displayName || input.name || '').trim();
  if (display.length > 50) return {status:'invalid', candidates:[], notice:'The optional display name is too long. It was not used.'};
  let rows = NAME_PAIRS.filter(row => row[2] === style);
  const surname = String(input.surname || '').trim();
  let surnameNote = '';
  if (surname) {
    if ([...surname].length !== 1 || !HAN.test(surname)) return {status:'invalid', candidates:[], notice:'The first character must be one Chinese character.'};
    const item = catalog.byGlyph.get(surname);
    if (!item) return {status:'unsupported', candidates:[], notice:'That character has no published dictionary page, so no pair was created.'};
    rows = rows.filter(row => row[0] === surname);
    surnameNote = item.surnameInTeaching
      ? 'The published dictionary sense uses the word surname.'
      : 'The published dictionary sense does not call this character a surname. It is only the first character of a teaching pair.';
  }
  const sound = String(input.sound || '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (sound) rows = rows.filter(row => row.slice(0, 2).some(glyph => catalog.byGlyph.get(glyph).pinyinPlain === sound));
  const candidates = rows.slice(0, 3).map(([a, b, pairStyle]) => ({
    style: pairStyle,
    glyphs: [a, b],
    characters: [requireItem(catalog, a), requireItem(catalog, b)],
    transliterated: false
  }));
  return {
    status: candidates.length ? 'ok' : 'empty',
    candidates,
    displayName: display ? {text: display, transliterated: false} : null,
    surnameNote,
    notice: candidates.length
      ? 'Each character keeps its own published dictionary sense. The pair is a teaching example, not a personal naming recommendation.'
      : 'No teaching pair matches those choices. Change the style, first character, or sound.'
  };
}

function menuCharacters(text, catalog) {
  return [...text].map(glyph => catalog.byGlyph.get(glyph) || {glyph, published: false});
}

export function queryMenu(input, catalog = publishedCatalog()) {
  assertCulturalFixtures(catalog);
  const text = String(input || '').replace(/\s+/g, '');
  if (!text) return {status:'empty', dishes:[], notice:'Paste a Chinese dish name to look up published character senses.'};
  if (text.length > 32) return {status:'invalid', dishes:[], notice:'That text is too long for this lookup.'};
  const glyphs = [...text];
  if (glyphs.some(glyph => !HAN.test(glyph))) return {status:'invalid', dishes:[], notice:'Use Chinese characters only. This tool does not read photos.'};
  const unknown = glyphs.filter(glyph => !catalog.byGlyph.has(glyph));
  const safety = 'This lookup is not a statement about ingredients, allergies, or food safety.';
  if (unknown.length) {
    return {
      status:'uncertain',
      dishes:[],
      characters: menuCharacters(text, catalog),
      unknown: [...new Set(unknown)],
      notice: 'This exact text is not in the teaching list. Only published characters are explained. ' + safety
    };
  }
  const dishes = MENU_SEQUENCES.filter(dish => dish === text || (text.length >= 2 && dish.includes(text)));
  if (!dishes.length) {
    return {status:'uncertain', dishes:[], characters: menuCharacters(text, catalog), unknown:[], notice:'No teaching sequence matches this text. Character senses below are not a dish translation. ' + safety};
  }
  return {
    status:'matched',
    dishes: dishes.map(dish => ({
      text: dish,
      characters: [...dish].map(glyph => requireItem(catalog, glyph)),
      compoundMeaning: null
    })),
    notice: 'Matches are teaching sequences. A single character sense is not the meaning of the whole dish. ' + safety
  };
}

function civilDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return iso;
}

export function queryZodiac(input, catalog = publishedCatalog()) {
  assertCulturalFixtures(catalog);
  const iso = civilDate(String(input || '').trim());
  if (!iso) return {status:'invalid', notice:'Enter a real calendar date as YYYY-MM-DD. The date stays on this page.'};
  if (iso < ZODIAC_CALENDAR.inclusiveStart || iso >= ZODIAC_CALENDAR.exclusiveEnd) {
    return {status:'unsupported', notice:`This calculator covers ${ZODIAC_CALENDAR.inclusiveStart} inclusive through the day before ${ZODIAC_CALENDAR.exclusiveEnd}. Dates outside that span are refused.`};
  }
  let row = ZODIAC_CALENDAR.boundaries[0];
  for (const candidate of ZODIAC_CALENDAR.boundaries.slice(0, -1)) if (candidate.date <= iso) row = candidate;
  const element = STEM_ELEMENT[STEMS.indexOf(row.stem)];
  const animal = ANIMALS[BRANCHES.indexOf(row.branch)];
  const elementItem = catalog.byGlyph.get(element) || null;
  const animalItem = catalog.byGlyph.get(animal) || null;
  const example = FIVE_ELEMENTS.find(card => card.glyph === element);
  return {
    status:'ok',
    date: iso,
    lunarYearLabel: row.label,
    stem: row.stem,
    branch: row.branch,
    element,
    animal,
    elementItem,
    animalItem,
    exampleItem: example ? requireItem(catalog, example.example) : null,
    naiveGregorianYear: Number(iso.slice(0, 4)),
    notice: 'The lunar year begins on the Observatory 正月 date, not on 1 January. The element is the year stem only. This is not a four-pillar, personality, or fate reading.'
  };
}

export function queryTattoo(input, catalog = publishedCatalog()) {
  assertCulturalFixtures(catalog);
  const text = String(input || '').replace(/\s+/g, '');
  if (!text) return {status:'empty', characters:[], notice:'Enter 1 to 8 Chinese characters. The text stays on this page.'};
  const glyphs = [...text];
  if (glyphs.some(glyph => !HAN.test(glyph))) return {status:'invalid', characters:[], notice:'Use Chinese characters only. Photos and images are not read.'};
  if (glyphs.length > 8) return {status:'invalid', characters:[], notice:'Enter 8 Chinese characters or fewer.'};
  const characters = glyphs.map(glyph => {
    const item = catalog.byGlyph.get(glyph);
    if (!item) return {glyph, published: false};
    const traditional = item.traditional.filter(form => form !== glyph).map(form => {
      const linked = catalog.byGlyph.get(form);
      return linked ? {form, item: linked} : {form, item: null};
    });
    return {...item, published: true, traditionalLinks: traditional};
  });
  return {
    status:'ok',
    characters,
    phraseMeaning: null,
    ambiguous: characters.some(item => item.published && item.readings.length > 1),
    notice: 'Each card is one published dictionary sense, or a refusal where no page exists. These senses are not the meaning of the whole phrase. Check the words and sentences on the dictionary page before treating the text as a label.'
  };
}

function fiveElementCards(catalog) {
  return `<div class="hf-cultural-five">${FIVE_ELEMENTS.map(card => {
    const example = requireItem(catalog, card.example);
    const self = catalog.byGlyph.get(card.glyph);
    const explore = self || example;
    return `<article class="hf-cultural-card" data-five-element="${e(card.glyph)}"><h2>${e(card.english)} · <span lang="zh-CN">${e(card.glyph)}</span></h2><p lang="zh-Latn-pinyin">${e(card.pinyin)}</p><p>Visible component: <span lang="zh-CN">${e(card.component)}</span>. This is a component label, not a history of the character.</p><p>Example: ${charAnchor(example)} · ${e(example.meaning)}</p><p><a href="${e(explore.path)}">Explore ${e(explore.glyph)}</a></p></article>`;
  }).join('')}</div>`;
}

export function renderNameResult(result) {
  const shown = result.displayName ? `<p data-display-name>Shown as typed: ${e(result.displayName.text)}. It was not turned into Chinese characters.</p>` : '';
  const cards = result.candidates.map(candidate => `<article class="hf-cultural-card" data-name-candidate="${e(candidate.glyphs.join(''))}"><h2 lang="zh-CN">${candidate.characters.map(charAnchor).join('')}</h2><p>${candidate.characters.map(item => `${e(item.glyph)} · ${e(item.pinyin)} · ${e(item.meaning)}`).join(' / ')}</p><p>${e(result.notice)}</p><p>${candidate.characters.map(item => practiseLink(item) + ' ' + saveButton(item)).join(' ')}</p></article>`).join('');
  return `<div data-cultural-status="${e(result.status)}">${shown}<p>${e(result.surnameNote || '')}</p><p>${e(result.notice)}</p><div class="hf-cultural-cards">${cards}</div></div>`;
}

export function renderMenuResult(result) {
  const dishes = (result.dishes || []).map(dish => `<article class="hf-cultural-card" data-menu-dish="${e(dish.text)}"><h2 lang="zh-CN">${[...dish.text].map(glyph => charAnchor(dish.characters.find(item => item.glyph === glyph))).join('')}</h2><div class="hf-cultural-cards">${dish.characters.map(item => characterCard(item)).join('')}</div></article>`).join('');
  const loose = (result.characters || []).map(item => item.published === false || !item.path
    ? `<span lang="zh-CN" data-unpublished-glyph="${e(item.glyph)}">${e(item.glyph)}</span>`
    : characterCard(item)).join('');
  return `<div data-menu-status="${e(result.status)}"><p>${e(result.notice || '')}</p>${dishes}${loose}</div>`;
}

export function renderZodiacResult(result, catalog = publishedCatalog()) {
  if (result.status !== 'ok') return `<div data-zodiac-status="${e(result.status)}"><p>${e(result.notice)}</p></div>`;
  const elementLink = result.elementItem ? charAnchor(result.elementItem) : `${result.exampleItem ? charAnchor(result.exampleItem) : ''}<span lang="zh-CN">${e(result.element)}</span>`;
  const animalLink = result.animalItem ? charAnchor(result.animalItem) : `<span lang="zh-CN">${e(result.animal)}</span>`;
  return `<div data-zodiac-status="ok"><p data-lunar-label>${e(result.lunarYearLabel)}</p><p>Year stem ${e(result.stem)} · element ${elementLink}. Branch ${e(result.branch)} · ${animalLink}.</p><p>${e(result.notice)}</p>${result.elementItem ? characterCard(result.elementItem) : ''}${result.animalItem ? characterCard(result.animalItem) : ''}${fiveElementCards(catalog)}</div>`;
}

export function renderTattooResult(result) {
  const cards = (result.characters || []).map(item => {
    if (!item.path) return `<article class="hf-cultural-card" data-unpublished-glyph="${e(item.glyph)}"><h3><span lang="zh-CN">${e(item.glyph)}</span></h3><p>No published dictionary page for this character, so no sense is shown.</p></article>`;
    const forms = (item.traditionalLinks || []).map(form => form.item
      ? charAnchor(form.item)
      : `<span lang="zh-CN" data-unlinked-form="${e(form.form)}">${e(form.form)}</span>`).join(' ');
    const formNote = forms ? `<p>Other recorded forms: ${forms}. A form without a link has no published dictionary page.</p>` : '';
    return characterCard(item, formNote);
  }).join('');
  return `<div data-tattoo-status="${e(result.status)}" data-ambiguous="${result.ambiguous ? 'true' : 'false'}"><p>${e(result.notice || '')}</p><div class="hf-cultural-cards">${cards}</div></div>`;
}

export function culturalResultHtml(tool, input, catalog = publishedCatalog()) {
  if (tool === 'names') return renderNameResult(queryNames(input, catalog));
  if (tool === 'menu') return renderMenuResult(queryMenu(input?.text ?? input, catalog));
  if (tool === 'zodiac') return renderZodiacResult(queryZodiac(input?.date ?? input, catalog), catalog);
  if (tool === 'tattoo') return renderTattooResult(queryTattoo(input?.text ?? input, catalog));
  throw new Error('Unknown cultural tool');
}

function toolShell(tool, title, intro, form, extra = '') {
  return `<section class="hf-cultural-tool" data-cultural-tool="${tool}"><h1>${e(title)}</h1><p>${intro}</p>${form}<div data-cultural-result></div>${extra}${jsonLd(tool, title, intro.replace(/<[^>]+>/g, ''))}</section>`;
}

export function culturalToolPages(catalog = publishedCatalog()) {
  assertCulturalFixtures(catalog);
  const names = toolShell('names', 'Chinese name explorer',
    'Choose a style and, if you want, one first character and a pinyin syllable. Three teaching pairs come from published dictionary senses. An English name is shown only and is not turned into Chinese.',
    `<form class="hf-cultural-form" data-cultural-form="names" method="post" action=""><label>Style <select name="style"><option value="calm">Calm</option><option value="bright">Bright</option><option value="nature">Nature</option></select></label><label>First character <input name="surname" maxlength="1" autocomplete="off"></label><label>Sound <input name="sound" maxlength="8" autocomplete="off"></label><label>Name to show, optional <input name="displayName" maxlength="50" autocomplete="off"></label><button type="submit">Show teaching pairs</button></form>`);
  const menu = toolShell('menu', 'Chinese menu decoder',
    'Paste a dish name. The result explains published character senses from a fixed teaching list. It does not read photos and it is not a food-safety statement.',
    `<form class="hf-cultural-form" data-cultural-form="menu" method="post" action=""><label>Dish name <textarea name="text" maxlength="32"></textarea></label><button type="submit">Look up characters</button></form>`);
  const zodiac = toolShell('zodiac', 'Zodiac and year stem',
    `Enter a date. The lunar year uses Hong Kong Observatory 正月 boundaries from ${ZODIAC_CALENDAR.inclusiveStart} through the day before ${ZODIAC_CALENDAR.exclusiveEnd}. <a href="${e(ZODIAC_CALENDAR.sourceUrl)}">Observatory calendar tables</a>. The five cards below are labels and examples, not a fate chart.`,
    `<form class="hf-cultural-form" data-cultural-form="zodiac" method="post" action=""><label>Date <input name="date" type="date" min="${ZODIAC_CALENDAR.inclusiveStart}" max="2034-02-18"></label><button type="submit">Find the lunar year</button></form>`,
    fiveElementCards(catalog));
  const tattoo = toolShell('tattoo', 'Tattoo character context',
    'Enter 1 to 8 Chinese characters. Each published character keeps its own dictionary sense. The cards are not a translation of the whole phrase, and images are not read.',
    `<form class="hf-cultural-form" data-cultural-form="tattoo" method="post" action=""><label>Characters <input name="text" autocomplete="off"></label><button type="submit">Check characters</button></form>`);
  return [
    {path: TOOL_PATHS.names, title: 'Chinese name explorer', content: names},
    {path: TOOL_PATHS.menu, title: 'Chinese menu decoder', content: menu},
    {path: TOOL_PATHS.zodiac, title: 'Zodiac and year stem', content: zodiac},
    {path: TOOL_PATHS.tattoo, title: 'Tattoo character context', content: tattoo}
  ];
}

export function savePublishedCharacters(storage, ids, catalog = publishedCatalog()) {
  const allowed = new Set(catalog.items.map(item => item.characterId));
  let before = null;
  try { before = storage.getItem(CULTURAL_SAVE_KEY); } catch (error) { return {saved:false, reason:error.message}; }
  let current = [];
  if (before != null) {
    try {
      const parsed = JSON.parse(before);
      if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.characterIds) || parsed.characterIds.some(id => typeof id !== 'string' || !allowed.has(id))) {
        return {saved:false, code:'damaged', reason:'Damaged character list. Original kept.', originalSnapshot: before};
      }
      current = parsed.characterIds;
    } catch {
      return {saved:false, code:'damaged', reason:'Damaged character list. Original kept.', originalSnapshot: before};
    }
  }
  if (!Array.isArray(ids) || ids.some(id => !allowed.has(id))) return {saved:false, code:'unpublished', reason:'Only published dictionary characters can be saved.'};
  const characterIds = [...new Set([...current, ...ids])];
  const serialized = JSON.stringify({schemaVersion:1, characterIds});
  try {
    storage.setItem(CULTURAL_SAVE_KEY, serialized);
    if (storage.getItem(CULTURAL_SAVE_KEY) !== serialized) {
      if (before == null) storage.removeItem(CULTURAL_SAVE_KEY); else storage.setItem(CULTURAL_SAVE_KEY, before);
      return {saved:false, code:'conflict', reason:'Write verification failed.'};
    }
  } catch (error) {
    return {saved:false, reason:error.message};
  }
  return {saved:true, characterIds};
}

export function mountCulturalTools(root, options = {}) {
  const catalog = options.catalog || publishedCatalog();
  for (const form of root.querySelectorAll('[data-cultural-form]')) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const tool = form.getAttribute('data-cultural-form');
      const fields = Object.fromEntries(new FormData(form).entries());
      const slot = form.closest('[data-cultural-tool]')?.querySelector('[data-cultural-result]');
      if (slot) slot.innerHTML = culturalResultHtml(tool, fields, catalog);
    });
  }
  root.addEventListener('click', async event => {
    const button = event.target.closest?.('[data-cultural-save]');
    if (!button) return;
    const id=button.getAttribute('data-cultural-save');
    const result=options.saveCharacter?await options.saveCharacter(id):options.storage?savePublishedCharacters(options.storage,[id],catalog):{saved:false,reason:'Storage is not available in this browser.'};
    const status = root.querySelector('[data-cultural-save-status]') || root.querySelector('[data-cultural-result]');
    if(status){const message=document.createElement('p');message.setAttribute('data-cultural-saved',String(!!result.saved));message.textContent=result.saved?'Saved the published character on this device.':result.reason||'Could not save. Please retry.';status.append(message);}
  });
}
