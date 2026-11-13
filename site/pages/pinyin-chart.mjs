import { syllables, scope, characters, readingFor, escapeHtml as e, charLink } from '../dictionary-data.mjs';
import { page } from './dictionary.mjs';
import {pronunciationButton as listen} from '../pronunciation.mjs';
export function pinyinChartPage() {
  const initials=[...new Set(syllables.map(s=>s.initial))], finals=[...new Set(syllables.map(s=>s.final))];
  const options=values=>values.map(value=>`<option value="${e(value||'_zero')}">${e(value||'Zero initial')}</option>`).join('');
  const groups = new Map();
  for (const syllable of syllables) {
    const onset = syllable.initial || syllable.orthographicOnset;
    if (!groups.has(onset)) groups.set(onset, []);
    groups.get(onset).push(syllable);
  }
  const renderSyllable = s => {
    const examples=characters.filter(c=>c.readingId.some(id=>readingFor(id).pinyin.plain===s.spelling));
    return `<details class="pinyin-syllable" id="syllable-${encodeURIComponent(s.spelling)}" data-syllable="${e(s.spelling)}" data-initial="${e(s.initial||'_zero')}" data-final="${e(s.final)}"><summary><span lang="zh-Latn-pinyin">${e(s.spelling)}</span>${scope.rareIncluded.includes(s.spelling)?' · less common':''}</summary><p>Initial: ${e(s.initial||'zero')} · final: ${e(s.final)} · written onset: ${e(s.orthographicOnset||'none')}</p><p>These tone forms occur in dictionary entries; their frequency and use depend on the word.</p><ul>${s.tones.map(t=>`<li><span lang="zh-Latn-pinyin">${e(t.spelling)}</span> · tone ${t.tone===5?'5 (neutral; needs word context)':t.tone} · ${listen(t.spelling,{numeric:s.spelling+t.tone,label:"Listen to "+t.spelling})}</li>`).join('')}</ul><p>${examples.length?'Core example links: '+examples.map(c=>charLink(c.glyph)+' '+c.readingId.filter(id=>readingFor(id).pinyin.plain===s.spelling).map(id=>e(readingFor(id).pinyin.marked)).join('/')).join(' · '):'Explore more characters in the pinyin index.'}</p>${examples.length?`<a href="/dictionary/pinyin/#pinyin-${encodeURIComponent(s.spelling)}">Find core characters with this syllable</a>`:'<a href="/dictionary/pinyin/">Browse the core pinyin index</a>'}</details>`;
  };
  const titledGroups = [...groups].map(([onset, entries]) => ({
    onset,
    entries,
    title: onset ? `${onset} syllables` : 'Vowel-starting syllables'
  }));
  const chart = titledGroups.map(({onset, entries, title}) => {
    const examples = entries.slice(0, 3).map(({spelling}) => e(spelling)).join(', ');
    let description = 'These syllables start directly with a vowel sound.';
    if (onset === 'y' || onset === 'w') {
      description = `Pinyin uses ${onset} at the start of these spellings for syllables with no consonant initial.`;
    } else if (onset) {
      description = `These syllables share the initial ${onset} and pair it with different finals.`;
    }
    return `<section class="pinyin-group" data-pinyin-group><h3>${e(title)}</h3><p>${e(description)} Try <span lang="zh-Latn-pinyin">${examples}</span>.</p><div class="pinyin-grid">${entries.map(renderSyllable).join('')}</div></section>`;
  }).join('');
  const printGroups = titledGroups.map(({title, entries}) => {
    const rows = entries.map(({spelling, tones}) => {
      const forms = tones.map(({spelling: form}) => `<span>${e(form)}</span>`).join(' ');
      return `<div class="pinyin-print-syllable"><dt>${e(spelling)}</dt><dd>${forms}</dd></div>`;
    }).join('');
    return `<section class="pinyin-print-group"><h3>${e(title)}</h3><dl lang="zh-Latn-pinyin">${rows}</dl></section>`;
  }).join('');
  const printSheet = `<div class="pinyin-print-sheet">
    <h2>Chinese Pinyin Chart</h2>
    <p>HanziFun · ${syllables.length} Mandarin syllables grouped by written onset</p>
    <p>The first tone (<span lang="zh-Latn-pinyin">ā</span>) is high and level, the second (<span lang="zh-Latn-pinyin">á</span>) rises, the third (<span lang="zh-Latn-pinyin">ǎ</span>) is low, and the fourth (<span lang="zh-Latn-pinyin">à</span>) falls. An unmarked form in the tone list indicates the neutral tone. Each syllable lists the tone forms attested in the chart.</p>
    ${printGroups}
  </div>`;
  const intro = `<p>Think of pinyin as a pronunciation guide for Chinese characters. Take ${charLink('水')} (water). Its pinyin, <span lang="zh-Latn-pinyin">shuǐ</span>, shows you how to say it, and the mark over the <span lang="zh-Latn-pinyin">ǐ</span> tells you to use the third tone. Try looking up <span lang="zh-Latn-pinyin">shuǐ</span> in the chart below. You can explore 410 syllables, compare their tones, and listen where audio is available.</p>`;
  const chartPage = page('/pinyin-chart/','What Is Pinyin in Chinese?',`<div class="content-prose">${intro}<h2>Look up a syllable of Chinese Pinyin</h2><p><a href="#pinyin-syllable-filters">Jump to syllable filters</a></p><ol><li>Type a spelling (for example shuǐ, shui3, or lü) or narrow the list with the initial and final menus below.</li><li>Open a syllable row to compare tone marks, use available samples, and follow links to example core characters.</li><li>For every core character with that syllable, use the <a href="/dictionary/pinyin/">pinyin character index</a>; to review what you found, open <a href="/flashcards/">flashcards</a> or a <a href="/flashcards/decks/">practice set</a>.</li></ol><h2>Chinese Pinyin has four tones and a neutral tone</h2><p>First tone is high and level (mā); second rises (má); third is low, often rising when pronounced alone (mǎ); fourth falls (mà). The neutral tone is short and unstressed, with pitch depending on context. Neutral-tone teaching needs an actual word context.</p><h2>Chinese Pinyin spelling guide</h2><p>lü / lv / lu: refer to the same syllable; lu is different. After j, q and x, the dots on ü are omitted (ju, qu, xu). Zero-initial i, u and ü syllables use y or w forms, including yi, wu and yu. Written iu, ui and un are shortened spellings in appropriate combinations. This chart does not treat English letter names as Mandarin pronunciation.</p><p>Less common syllables: ${scope.rareIncluded.map(e).join(', ')}. Excluded scope: ${scope.excluded.map(e).join('; ')}. Usage varies by word and region.</p></div><div class="pinyin-chart-toolbar"><h2 id="pinyin-chart-results" class="pinyin-chart-heading">Chinese Pinyin syllables by initial</h2><button type="button" class="pinyin-print-button" data-print>Print Pinyin Chart</button></div><form id="pinyin-syllable-filters" data-pinyin-filter tabindex="-1"><label for="pinyin-query">Chinese Pinyin syllable (marked, numeric, ü / v / u:)</label><input id="pinyin-query" maxlength="100" name="syllable"><label for="initial-filter">Initial</label><select id="initial-filter" name="initial"><option value="">All initials</option>${options(initials)}</select><label for="final-filter">Final</label><select id="final-filter" name="final"><option value="">All finals</option>${options(finals)}</select><button>Filter</button><button type="reset">Reset</button></form><p role="status" data-pinyin-count>${syllables.length} syllables</p>${chart}<p><a href="/dictionary/pinyin/">Find characters by pinyin</a> · <a href="/data-sources/">Sources and licenses</a></p><noscript><p>All syllables and tone candidates remain readable. Open a syllable to inspect it; filtering requires JavaScript.</p></noscript>${printSheet}`);
  return {
    ...chartPage,
    content: chartPage.content + '<script type="module" src="/site-assets/pinyin-chart.v1.mjs"></script>',
    pronunciationFooter: '<p class="container pinyin-audio-status" role="status" aria-live="polite" data-pronunciation-status></p><script type="module" src="/site-assets/pronunciation.mjs"></script>',
    head:'<link rel="stylesheet" href="/site-assets/pinyin-chart.v1.css">'
  };
}
