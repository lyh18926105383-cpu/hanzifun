import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {publishedCatalog,culturalStudioPage,culturalToolPages,culturalResultHtml,assertCulturalFixtures,TOOL_PATHS} from './pages/cultural-tools.mjs';
import {teacherDeckPage} from './pages/teacher-decks.mjs';
import {characterReviewState,contentHash} from './publication-review.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const e=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const toolsBatchId='culture-teacher-gallery-2026-10-31';
export const teacherPath='/flashcards/teacher/';
export const toolsSeo={
 '/tools/':{title:'Chinese Culture Tools: Names, Menus, Zodiac & Characters',h1:'Chinese Culture Tools',lead:'Explore Chinese character senses in teaching name pairs, dish names, lunar-year symbols and short tattoo text, then continue with dictionary pages and local practice.'},
 [TOOL_PATHS.names]:{title:'Chinese Name Explorer: 30 Character Teaching Pairs',h1:'Chinese Name Explorer',lead:'Explore 30 teaching pairs by style, first character or pinyin. Each character links to its published dictionary sense; these examples are not transliterations or personal naming recommendations.'},
 [TOOL_PATHS.menu]:{title:'Chinese Menu Decoder: 50 Character-Based Examples',h1:'Chinese Menu Decoder',lead:'Look up 50 Chinese menu teaching sequences and their character senses. Unknown text stays uncertain; results do not confirm ingredients, allergies or food safety.'},
 [TOOL_PATHS.zodiac]:{title:'Chinese Zodiac Calculator: Lunar Year & Stem Element',h1:'Chinese Zodiac and Year-Stem Calculator',lead:'Find the lunar-year animal and year-stem element for dates from 5 February 2000 through 18 February 2034 using Hong Kong Observatory New Year boundaries. This is not a fate or personality reading.'},
 [TOOL_PATHS.tattoo]:{title:'Chinese Tattoo Character Checker: Readings & Context',h1:'Chinese Tattoo Character Context Checker',lead:'Check one to eight Chinese characters for published senses, alternative forms and multiple readings. Individual character meanings do not establish the meaning of a whole phrase.'},
 [teacherPath]:{title:'Private Teacher Character Decks: Local Practice & Printing',h1:'Teacher Decks on This Device',lead:'Build private decks of 2 to 100 published Chinese characters, edit their order, practise saved revisions, and print A4 or Letter cards. Decks stay in this browser without an account or cloud sync.'}
};
const nav=`<nav class="subnav" aria-label="Culture and teaching"><a href="/tools/">Culture tools</a><a href="/flashcards/teacher/">Private teacher decks</a><a href="/flashcards/decks/">Practice sets</a><a href="/dictionary/">Dictionary</a></nav>`;
export function integrationPages(){
 const catalog=publishedCatalog();assertCulturalFixtures(catalog);
 const examples={names:{style:'calm'},menu:'米饭',zodiac:'2024-02-10',tattoo:'安好'};
 const publicPages=culturalToolPages(catalog).map(p=>{const key=Object.keys(TOOL_PATHS).find(k=>TOOL_PATHS[k]===p.path);return {...p,webApplication:true,description:toolsSeo[p.path].lead,content:`<div class="container hf04">${nav}${p.content.replace(/(<form\b[^>]*>)/g,'$1<fieldset data-local-form disabled>').replaceAll('</form>','</fieldset></form>')}<p role="status" data-local-status></p><details><summary>Read an example</summary>${culturalResultHtml(key,examples[key],catalog)}</details><p>Your typed name, date and text stay on this page. Saving a character stores its dictionary identity on this device.</p><noscript><p>Interactive results need JavaScript. The example and dictionary links above remain readable.</p></noscript></div><script type="module" src="/site-assets/hf06/client/guest-learning.mjs"></script><script type="module" src="/site-assets/tools/tools-entry.mjs"></script>`};});
 const teacher=teacherDeckPage(catalog);teacher.webApplication=true;teacher.content=`<div class="container hf04">${nav}${teacher.content}<p role="status" data-local-status></p><noscript><p>Private decks need JavaScript and browser storage. You can still read the dictionary and <a href="/worksheets/">print the public worksheets</a>.</p></noscript></div><script type="module" src="/site-assets/tools/tools-entry.mjs"></script>`;
 const hub={...culturalStudioPage(catalog),title:toolsSeo['/tools/'].title,description:toolsSeo['/tools/'].lead};
 return [hub,...publicPages,teacher];
}
export const toolsInputFiles=['site/pages/cultural-tools.mjs','site/pages/teacher-decks.mjs','src/client/cultural-tools.mjs','src/client/teacher-decks.mjs','src/client/tools-entry.mjs','site/tools-integration.mjs','site/public/site-styles.css','src/client/tools-gallery.mjs',...['name','menu','zodiac','tattoo','teacher'].map(n=>'site/public/tools-art/'+n+'-scroll.svg')];
export function toolsPayload(){return {batchId:toolsBatchId,inputs:toolsInputFiles.map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex')})),catalog:publishedCatalog().items.map(c=>({...c,reviewSha256:characterReviewState(c.characterId).contentSha256})),pages:integrationPages().map(p=>({path:p.path,contentSha256:contentHash(p),seo:toolsSeo[p.path]}))};}
export function assertToolsAcceptance(route,{reviews=read('data/editorial/review-decisions.json'),release=read('site/release.json'),payload}={}){
 if(!toolsSeo[route.path]||!['published','published-private'].includes(route.status))return;
 payload??=toolsPayload();
 const d=reviews.toolBatches?.[toolsBatchId],hash=contentHash(payload),r=release.cultureTeacher;
 if(d?.humanContent!=='approved'||!d.reviewer?.trim()||d.date!=='2026-10-31'||!d.evidence?.trim()||d.contentSha256!==hash||r?.batchId!==toolsBatchId||r.contentSha256!==hash)throw Error('Culture/teacher owner acceptance missing or stale: '+route.path);
 const page=payload.pages.find(p=>p.path===route.path),decision=release.pageReviews?.[route.path];
 if(decision?.status!=='approved'||decision.contentSha256!==page.contentSha256||decision.batchId!==toolsBatchId)throw Error('Culture/teacher page signature missing or stale: '+route.path);
 if(publishedCatalog().count!==339||publishedCatalog().items.some(c=>!characterReviewState(c.characterId).accepted))throw Error('Culture/teacher dictionary approval mismatch');
 const receipt=read(d.evidence);if(receipt.contentSha256!==hash||receipt.ownerApproval!=='approved')throw Error('Culture/teacher receipt missing or stale');
}
