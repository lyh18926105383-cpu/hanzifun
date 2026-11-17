import {syllables, escapeHtml as e} from './dictionary-data.mjs';
import fs from 'node:fs';
export const toolPreviews=JSON.parse(fs.readFileSync(new URL('../content/pinyin-tools/previews.json',import.meta.url),'utf8'));
export const pinyinRoot = '/pinyin-chart/';
export const toolMeta = [
  {key:'converter',path:pinyinRoot+'chinese-to-pinyin/',title:'Chinese to Pinyin Converter with Tone Marks',h1:'Chinese to Pinyin',lead:'Turn Chinese text into pinyin with tone marks, numbers or no tones.',description:'Convert Simplified or Traditional Chinese to pinyin with tone marks or numbers. Check alternative readings and copy the result for free in your browser.'},
  {key:'tones',path:pinyinRoot+'tones/',title:'Chinese Tones: Audio Examples & Listening Practice',h1:'Chinese Tones',lead:'Hear the four Mandarin tones, compare real examples and practise listening.',description:'Learn the four Chinese tones and the neutral tone with audio examples, pitch guides and a free listening quiz. Practise Mandarin pronunciation at your own pace.'},
  {key:'toneMarks',path:pinyinRoot+'tone-marks/',title:'Type Pinyin with Tone Marks: Free Online Tool',h1:'Type Pinyin with Tone Marks',lead:'Turn ni3 hao3 into nǐ hǎo, then copy your pinyin.',description:'Type pinyin with tone marks online for free. Convert tone numbers to accents, change accents back to numbers or remove tones, with support for ü, v and u:.'}
];
export const initialOrder = ['', 'b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s'];
export const finalOrder = ['a','o','e','ai','ei','ao','ou','an','en','ang','eng','ong','er','i','ia','ie','iao','iou','ian','in','iang','ing','iong','io','u','ua','uo','uai','uei','uan','uen','uang','ueng','ü','üe','üan','ün'];
export const pinyinFooter = '<p class="container pinyin-audio-status" role="status" aria-live="polite" data-pronunciation-status></p><script type="module" src="/site-assets/pronunciation.mjs"></script>';
export function pinyinPage({path,title,h1,lead,description},body,extra = {}) {
  return {path,title,documentTitle:title,description,bodyClass:'pinyin-layout',webApplication:true,
    content:`<div class="container pinyin-page"><header class="pinyin-intro"><h1>${e(h1)}</h1><p class="lead" data-seo-lead>${e(lead)}</p></header>${body}</div>`,
    head:'<link rel="stylesheet" href="/site-assets/pinyin-chart.v1.css?v=20261117-visuals-2">',pronunciationFooter:pinyinFooter,...extra};
}
export function toolCards(current = '') {
  const examples = {converter:'你好 → nǐ hǎo', tones:'mā · má · mǎ · mà', toneMarks:'ni3 hao3 → nǐ hǎo'};
  return `<section class="pinyin-section" aria-labelledby="pinyin-tools-heading"><h2 id="pinyin-tools-heading">Explore more pinyin tools</h2><div class="pinyin-tool-cards">${toolMeta.filter(m=>m.key!==current).map(m=>{const preview=toolPreviews[m.key],large=preview.variants.at(-1);return `<article><div class="pinyin-tool-preview"><img src="${e(large.src)}" srcset="${preview.variants.map(v=>e(v.src)+' '+v.width+'w').join(', ')}" sizes="(max-width: 760px) calc(100vw - 34px), (max-width: 1100px) 31vw, 400px" width="${large.width}" height="${large.height}" alt="${e(preview.alt)}" loading="lazy" decoding="async"></div><div class="pinyin-tool-card-body"><h3><a href="${m.path}">${e(m.h1)}</a></h3><p class="pinyin-tool-example" lang="zh-Latn-pinyin">${e(examples[m.key])}</p><p>${e(m.lead)}</p><a class="text-link" href="${m.path}">${m.key==='converter'?'Convert Chinese text':m.key==='tones'?'Learn and practise tones':'Type pinyin'} →</a></div></article>`;}).join('')}</div>${current?'<p><a class="text-link" href="/pinyin-chart/">← Look up Pinyin in the complete chart</a></p>':''}</section>`;
}
export function renderFaq(entries, headingId = 'pinyin-faq') {
  return `<section class="pinyin-section pinyin-faq" aria-labelledby="${headingId}"><h2 id="${headingId}">Frequently Asked Questions</h2>${entries.map(x=>`<details><summary>${e(x.question)}</summary><p>${e(x.answer)}</p></details>`).join('')}</section>`;
}
export const inventory = syllables.map(s=>s.spelling);
