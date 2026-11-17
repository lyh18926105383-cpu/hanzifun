import {syllables,charLink,escapeHtml as e} from '../dictionary-data.mjs';

export function pinyinExplainer(){
  const water=syllables.find(s=>s.spelling==='shui');
  return `<section class="pinyin-how-work" aria-labelledby="pinyin-how-heading">
    <h2 id="pinyin-how-heading">How Does Pinyin Work?</h2>
    <p class="pinyin-how-lead">An initial, a final and a tone work together to make a syllable.</p>
    <div class="pinyin-syllable-formula" aria-label="sh plus ui with the third tone makes shuǐ">
      <div class="pinyin-formula-token pinyin-initial-token"><small>1 · Initial</small><strong lang="zh-Latn-pinyin">sh</strong><span>The starting sound</span></div>
      <span class="pinyin-formula-operator" aria-hidden="true">+</span>
      <div class="pinyin-formula-token pinyin-final-token"><small>2 · Final</small><strong lang="zh-Latn-pinyin">ui</strong><span>The ending sound</span></div>
      <span class="pinyin-formula-operator" aria-hidden="true">+</span>
      <div class="pinyin-formula-token pinyin-tone-token"><small>3 · Tone</small><svg viewBox="0 0 100 48" role="img" aria-label="Third tone: low, dipping when said alone"><polyline points="8,14 45,39 92,10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Third tone</span></div>
      <span class="pinyin-formula-operator" aria-hidden="true">=</span>
      <div class="pinyin-formula-token pinyin-result-token"><small>One syllable</small><strong lang="zh-Latn-pinyin">shu<span>ǐ</span></strong><span lang="zh-CN">水 <span lang="en">· water</span></span></div>
    </div>
    <div class="pinyin-chart-connection">
      <table class="pinyin-example-matrix"><caption>Find it in the chart</caption><thead><tr><th scope="col">Initial ↓<br>Final →</th><th scope="col">${e(water.final)}<small>written ui</small></th></tr></thead><tbody><tr><th scope="row">${e(water.initial)}</th><td><span lang="zh-Latn-pinyin">${e(water.spelling)}</span></td></tr></tbody></table>
      <div><p><strong>Follow the sh row to the ${e(water.final)} column.</strong> The spelling is shui; add the third-tone mark to get <span lang="zh-Latn-pinyin">shuǐ</span>.</p><p class="pinyin-chart-connection-note">The chart uses the full final uei; it is shortened to ui in shui.</p><a class="pinyin-demo-link" href="#syllable-shui" data-chart-example="shui3">Try shuǐ in the chart <span aria-hidden="true">↑</span></a></div>
    </div>
    <p class="pinyin-how-footnote">∅ means no initial. Neutral tones are written without a tone mark.</p>
  </section>`;
}

export function pinyinLookupExamples(){
  const examples=[
    {query:'shui3',plain:'shui',marked:'shuǐ',glyph:'水',meaning:'water',aliases:['shuǐ','shui3']},
    {query:'lv4',plain:'lü',marked:'lǜ',glyph:'绿',meaning:'green',aliases:['lǜ','lv4','lu:4']},
    {query:'ma3',plain:'ma',marked:'mǎ',glyph:'马',meaning:'horse',aliases:['mǎ','ma3']}
  ];
  return `<div class="pinyin-lookup-examples" aria-label="Try a pinyin lookup example">${examples.map(x=>`<article><div class="pinyin-lookup-result"><span class="pinyin-example-glyph">${charLink(x.glyph)}</span><div><strong lang="zh-Latn-pinyin">${x.marked}</strong><span>${x.meaning}</span></div></div><p class="pinyin-lookup-aliases">${x.aliases.map(a=>`<kbd lang="zh-Latn-pinyin">${e(a)}</kbd>`).join('<span aria-hidden="true"> / </span>')}</p><a class="pinyin-demo-link" href="#syllable-${encodeURIComponent(x.plain)}" data-chart-example="${x.query}">Try this lookup <span aria-hidden="true">↑</span><span class="sr-only">: ${x.marked}</span></a></article>`).join('')}</div><p class="pinyin-back-to-filters"><a href="#pinyin-syllable-filters">Jump to syllable filters</a></p>`;
}
