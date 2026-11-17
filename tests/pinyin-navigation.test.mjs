import test from 'node:test';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
import {characters, readingFor, syllables} from '../site/dictionary-data.mjs';
import {dictionaryPages} from '../site/pages/dictionary.mjs';
import {pinyinChartPage} from '../site/pages/pinyin-chart.mjs';
import {attr, nodes} from '../scripts/validate-seo-quality.mjs';

function pinyinIndexGroups() {
  const groups = new Map();
  for (const c of characters) {
    for (const id of c.readingId) {
      const r = readingFor(id), key = r.pinyin.plain;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({c, r});
    }
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b));
}

function expectedLetterAnchors(sortedGroups) {
  const anchors = new Map();
  for (const [key] of sortedGroups) {
    const letter = key.charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(letter) && !anchors.has(letter)) anchors.set(letter, `#pinyin-${encodeURIComponent(key)}`);
  }
  return anchors;
}

test('pinyin index letter nav targets first syllable anchors and preserves section ids', () => {
  const sortedGroups = pinyinIndexGroups();
  const expectedIds = sortedGroups.map(([key]) => `pinyin-${encodeURIComponent(key)}`);
  const expectedLetters = expectedLetterAnchors(sortedGroups);
  const html = dictionaryPages().find(p => p.path === '/dictionary/pinyin/').content;
  const tree = nodes(parse(`<body>${html}</body>`));
  const sections = tree.filter(n => n.tagName === 'section' && attr(n, 'id')?.startsWith('pinyin-'));
  assert.deepEqual(sections.map(n => attr(n, 'id')).sort(), [...expectedIds].sort());
  const nav = tree.find(n => n.tagName === 'nav' && attr(n, 'aria-label') === 'Pinyin index letters');
  assert.ok(nav, 'letter nav required');
  assert.match(attr(nav, 'class') || '', /\bsubnav\b/);
  const links = (nav.childNodes || []).filter(n => n.tagName === 'a');
  assert.equal(links.length, expectedLetters.size);
  const seenLetters = new Set();
  for (const link of links) {
    const letter = (link.childNodes || []).map(n => n.value || '').join('').trim();
    assert.match(letter, /^[A-Z]$/);
    assert.ok(!seenLetters.has(letter), 'duplicate letter '+letter);
    seenLetters.add(letter);
    assert.equal(attr(link, 'href'), expectedLetters.get(letter));
    assert.ok(tree.some(n => attr(n, 'id') === attr(link, 'href').slice(1)), 'target section exists');
  }
});

test('pinyin chart exposes one keyboard-reachable filter anchor', () => {
  const html = pinyinChartPage().content;
  const tree = nodes(parse(`<body>${html}</body>`));
  const forms = tree.filter(n => n.tagName === 'form' && attr(n, 'id') === 'pinyin-syllable-filters');
  assert.equal(forms.length, 1);
  assert.equal(attr(forms[0], 'data-pinyin-chart-filter'), '');
  assert.equal(attr(forms[0], 'tabindex'), '-1');
  const jumps = tree.filter(n => n.tagName === 'a' && attr(n, 'href') === '#pinyin-syllable-filters');
  assert.equal(jumps.length, 1);
  assert.match(jumps[0].childNodes?.map(n => n.value || '').join('') || '', /Jump to syllable filters/);
  assert.ok(tree.some(n => n.tagName === 'form' && attr(n, 'id') === 'pinyin-syllable-filters' && attr(n, 'data-pinyin-chart-filter') !== undefined));
});

test('pinyin matrix has initial rows, final columns and every legal syllable exactly once', () => {
  const tree = nodes(parse(pinyinChartPage().content));
  const cells=tree.filter(n=>n.tagName==='button'&&attr(n,'data-syllable')!==undefined);
  assert.equal(cells.length,410);
  assert.deepEqual(cells.map(n=>attr(n,'data-syllable')).sort(),syllables.map(s=>s.spelling).sort());
  for(const cell of cells){
    const data=syllables.find(s=>s.spelling===attr(cell,'data-syllable'));
    assert.equal(attr(cell,'data-initial'),data.initial||'_zero');
    assert.equal(attr(cell,'data-final'),data.final);
    assert.equal(attr(cell,'id'),'syllable-'+encodeURIComponent(data.spelling));
  }
  assert.equal(tree.filter(n=>attr(n,'data-initial-heading')!==undefined).length,22);
  const finals=tree.filter(n=>attr(n,'data-final-heading')!==undefined).map(n=>attr(n,'data-final-heading'));
  assert.deepEqual(finals.sort(),[...new Set(syllables.map(s=>s.final))].sort());
});

test('the print chart contains all syllables and their attested tones alongside working audio markup', () => {
  const page = pinyinChartPage();
  const tree = nodes(parse(page.content));
  const printSheet = tree.find(node => attr(node, 'class') === 'pinyin-print-sheet');
  assert.ok(printSheet);
  const printNodes = nodes(printSheet);
  const text = node => nodes(node).filter(child => child.nodeName === '#text').map(child => child.value).join('');
  assert.equal(printNodes.filter(node => attr(node, 'class') === 'pinyin-print-group').length, 24);
  assert.deepEqual(printNodes.filter(node => node.tagName === 'dt').map(text), syllables.map(({spelling}) => spelling));
  assert.deepEqual(printNodes.filter(node => node.tagName === 'dd').map(text), syllables.map(({tones}) => tones.map(tone => tone.spelling).join(' ')));
  assert.ok(tree.some(node => node.tagName === 'button' && attr(node, 'data-print') === ''));
  assert.match(page.pronunciationFooter, /data-pronunciation-status/);
  assert.match(page.pronunciationFooter, /\/site-assets\/pronunciation\.mjs/);
  assert.doesNotMatch(page.pronunciationFooter, /data-pronunciation-stop|Recorded syllables play directly/);
});
