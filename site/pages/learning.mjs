import {learningData} from '../learning-data.mjs';
const decks=learningData().decks;
import {escapeHtml as e} from '../dictionary-data.mjs';
export function learningPages() {
  const intro='<div class="learning-toolbar"><a class="learning-history-link" href="/account/"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg><span>Learning History <small>Progress &amp; review stats</small></span></a><p>Your learning stays in this browser and origin. No account is required.<br><a href="/flashcards/my-words/">Saved characters</a> · <a href="/flashcards/?review=due">Due cards</a></p></div><p class="preview-note">HSK and scenario sets practise constituent characters; they do not rate whole-word knowledge. <a href="/data-sources/">Content sources and attribution</a>.</p>';
  const page=(path,title,body)=>({path,title,description:title+' — practise characters and keep learning records on this device.',content:
    '<div class="container guest-learning"><header class="page-intro"><h1>'+e(title)+'</h1>'+intro+'</header>'+body+
    '<p role="status" data-guest-status></p><noscript><p>Practice and local records need JavaScript. <a href="/dictionary/">Read the dictionary</a>.</p></noscript></div><script type="module" src="/site-assets/hf06/client/guest-learning.mjs"></script>'});
  const sets='<div class="tile-grid">'+decks.map(d=>'<article class="tile"><h2>'+e(d.title)+'</h2><p>'+e(d.description)+'</p><p lang="zh-CN">'+d.chars.join(' · ')+'</p><a class="button" href="/flashcards/decks/'+d.slug+'/">Open set →</a></article>').join('')+'</div>';
  const practice='<section data-guest-practice data-pronunciation-host><p>Loading practice…</p></section>';
  return [page('/flashcards/','Flashcards',practice+sets),page('/flashcards/decks/','Choose a practice set',sets),
    ...decks.map(d=>page('/flashcards/decks/'+d.slug+'/',d.title+' · Character Flashcards',practice)),
    page('/flashcards/my-words/','Saved characters','<section data-guest-words></section>'),
    page('/account/','My learning','<section data-guest-dashboard></section><section data-guest-settings></section><section data-guest-import></section>')];
}
