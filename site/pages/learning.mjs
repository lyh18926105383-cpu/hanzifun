import {learningData} from '../learning-data.mjs';
const decks=learningData().decks;
import {escapeHtml as e} from '../dictionary-data.mjs';
export function learningPages() {
  const intro='<p>Your learning stays in this browser and origin. No account is required. <a href="/account/">My learning</a> · <a href="/flashcards/my-words/">Saved characters</a> · <a href="/flashcards/?review=due">Due cards</a></p><p class="preview-note">Teaching drafts await human review. HSK and scenario sets practise constituent characters; they do not rate whole-word knowledge. <a href="/data-sources/">Content sources and attribution</a>.</p>';
  const page=(path,title,body)=>({path,title,description:'Local flashcards and guest learning records.',content:
    '<div class="container guest-learning"><header class="page-intro"><h1>'+e(title)+'</h1>'+intro+'</header>'+body+
    '<p role="status" data-guest-status></p><noscript><p>Practice and local records need JavaScript. <a href="/dictionary/">Read the dictionary</a>.</p></noscript></div><script type="module" src="/site-assets/hf06/client/guest-learning.mjs"></script>'});
  const sets='<div class="tile-grid">'+decks.map(d=>'<article class="tile"><h2>'+e(d.title)+'</h2><p>'+e(d.description)+'</p><p lang="zh-CN">'+d.chars.join(' · ')+'</p><a class="button" href="/flashcards/decks/'+d.slug+'/">Open set →</a></article>').join('')+'</div>';
  const practice='<section data-guest-practice><p>Loading practice…</p></section>';
  return [page('/flashcards/','Flashcards',practice+sets),page('/flashcards/decks/','Choose a practice set',sets),
    ...decks.map(d=>page('/flashcards/decks/'+d.slug+'/',d.title,practice)),
    page('/flashcards/my-words/','Saved characters','<section data-guest-words></section>'),
    page('/account/','My learning','<section data-guest-dashboard></section><section data-guest-settings></section><section data-guest-import></section>')];
}
