import {GALLERY_SCENES,GALLERY_DEFAULTS,studioPreview} from '../../src/client/tools-gallery.mjs';
// Server-only assembly; browser-safe tool logic lives in src/client.
import {characterReviewState,reviewInputs} from '../publication-review.mjs';
import {setPublishedCatalog} from '../../src/client/cultural-tools.mjs';
export * from '../../src/client/cultural-tools.mjs';

let catalogCache;
export function publishedCatalog() {
  if (catalogCache) return catalogCache;
  const characters = [...reviewInputs.core, ...reviewInputs.supplemental.characters];
  const readings = [...reviewInputs.coreReadings, ...reviewInputs.supplemental.readings];
  const items = [];
  for (const character of characters) {
    const state = characterReviewState(character.characterId);
    if (!state.accepted || !state.teaching) continue;
    const rows = character.readingId.map(id => readings.find(row => row.readingId === id)).filter(Boolean);
    const primary = rows.find(row => row.readingId === state.teaching.readingId) || rows[0];
    if (!primary?.pinyin?.marked) continue;
    const traditional = [...new Set(rows.flatMap(row => row.traditionalForms || []))];
    items.push({
      characterId: character.characterId,
      glyph: character.glyph,
      path: '/dictionary/' + encodeURIComponent(character.glyph) + '/',
      pinyin: primary.pinyin.marked,
      pinyinPlain: primary.pinyin.plain,
      meaning: state.teaching.meaning,
      surnameInTeaching: /\bsurname\b/i.test(state.teaching.meaning),
      readings: rows.map(row => ({pinyin: row.pinyin.marked, pinyinPlain: row.pinyin.plain, primary: row.readingId === state.teaching.readingId})),
      traditional
    });
  }
  const byGlyph = new Map(items.map(item => [item.glyph, item]));
  catalogCache = {items, byGlyph, count: items.length};
  return catalogCache;
}

setPublishedCatalog(publishedCatalog());


const studioEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function studioForm(kind){
 const input=(name,label,attrs='')=>`<label>${label}<input name="${name}" ${attrs}></label>`;
 const formBody={
 names:`<div class="tools-fields-two"><label>Feeling<select name="style"><option value="calm">Quiet & calm</option><option value="bright">Light & bright</option><option value="nature">Close to nature</option></select></label>${input('surname','First character · optional','maxlength="1" placeholder="e.g. 林" autocomplete="off"')}</div><div class="tools-fields-two">${input('sound','Pinyin · optional','maxlength="8" placeholder="e.g. lin" autocomplete="off"')}${input('displayName','Your name · optional','maxlength="50" placeholder="Shown as typed" autocomplete="off"')}</div><button class="tools-primary" type="submit">Explore the pairs <span aria-hidden="true">↗</span></button>`,
 menu:`<label>What is on the menu?<textarea name="text" rows="2" maxlength="32" spellcheck="false">牛肉面</textarea></label><div class="tools-quick-picks"><span>Try a little taste</span>${['米饭','茶水','牛肉面'].map(g=>`<button type="button" data-studio-quick="${g}" lang="zh-CN">${g}</button>`).join('')}</div><button class="tools-primary" type="submit">Read the characters <span aria-hidden="true">↗</span></button>`,
 zodiac:`${input('date','A date to explore','type="date" value="2024-02-10" min="2000-02-05" max="2034-02-18"')}<p class="tools-input-note">The year turns at Lunar New Year, not January 1.</p><button class="tools-primary" type="submit">Find the lunar year <span aria-hidden="true">↗</span></button>`,
 tattoo:`${input('text','The characters you have in mind','value="安好" maxlength="16" spellcheck="false" autocomplete="off"')}<p class="tools-input-note">1–8 Chinese characters. A word deserves context.</p><button class="tools-primary" type="submit">Look a little closer <span aria-hidden="true">↗</span></button>`,
 teacher:`${input('name','A name for this little lesson','value="Nature notes" maxlength="80" autocomplete="off"')}<label>Your characters · in order<textarea name="text" rows="2" spellcheck="false">山水木月</textarea></label><p class="tools-input-note">Choose 2–100 different characters from the published dictionary.</p><button class="tools-primary" type="submit">Save private deck <span aria-hidden="true">↗</span></button>`
 };
 return `<form class="tools-studio-form" data-studio-form="${kind}" method="post" action=""><fieldset data-local-form disabled>${formBody[kind]}</fieldset><p class="tools-studio-status" data-studio-status role="status"></p></form>`;
}
export function culturalStudioPage(catalog=publishedCatalog()){
 const e=studioEscape;
 const rail=`<aside class="tools-path-rail" data-tools-rail data-open="false"><div class="tools-rail-intro"><span class="tools-rail-seal" lang="zh-CN" aria-hidden="true">游</span><p>A path through<br><em>Chinese culture.</em></p></div><button type="button" class="tools-rail-toggle" data-tools-toggle aria-expanded="false" aria-controls="tools-path-menu" hidden><span data-tools-current>Name Explorer</span><span aria-hidden="true">＋</span></button><nav class="tools-rail-items" id="tools-path-menu" aria-label="Tool chapters"><span class="tools-path-indicator" data-tools-indicator aria-hidden="true"></span>${GALLERY_SCENES.map((s,i)=>`<a href="#tool-${s.id}" data-tools-path ${i===0?'aria-current="location"':''}><span class="tools-path-stamp" lang="zh-CN" aria-hidden="true">${s.seal}</span><span class="tools-path-label"><span><span class="tools-path-number">0${i+1}</span><span lang="zh-CN">${s.zh}</span></span><strong>${s.en}</strong><small class="tools-path-guide">${e(s.guide)}</small></span></a>`).join('')}</nav><p class="tools-rail-foot">五种相遇，一字一世界<br><span>Five ways in. A world within.</span></p></aside>`;
 const scenes=GALLERY_SCENES.map((s,i)=>`<section class="tools-scene tools-scene-${s.id}" id="tool-${s.id}" data-tools-section aria-labelledby="tool-${s.id}-title"><div class="tools-scene-art" aria-hidden="true"><img src="/site-assets/tools-art/${s.art}.svg" alt="" width="1600" height="1000" ${i?'loading="lazy"':'fetchpriority="high"'}></div><div class="tools-scene-scrim" aria-hidden="true"></div><div class="tools-scene-chapter"><span>0${i+1} / 05</span><span lang="zh-CN">${s.zh}</span></div><div class="tools-studio"><div class="tools-controls"><p class="tools-studio-eyebrow">${s.eyebrow}</p><h2 id="tool-${s.id}-title"><span lang="zh-CN">${s.zh}</span><span>${s.en}</span></h2><p class="tools-studio-description">${s.description}</p>${studioForm(s.kind)}<a class="tools-dedicated-link" href="${s.path}">${s.kind==='teacher'?'Open the full teacher workspace':'Open the dedicated tool'} <span aria-hidden="true">↗</span></a></div><div class="tools-stage tools-stage-${s.id}" data-studio-stage aria-live="polite" aria-atomic="true">${studioPreview(s.kind,GALLERY_DEFAULTS[s.kind],catalog)}</div></div><p class="tools-scene-footnote">${s.note}</p></section>`).join('');
 return {path:'/tools/',title:'Chinese Culture Tools: Names, Menus, Zodiac & Characters',description:'Explore five live Chinese character studios, with names, food, lunar years, tattoo context and private teacher decks.',content:`<div class="tools-gallery" data-tools-gallery><header class="tools-gallery-heading"><div><div class="tools-gallery-kicker"><span aria-hidden="true"></span> A LITTLE CURIOSITY GOES A LONG WAY</div><h1>Chinese Culture Tools</h1></div><p class="tools-gallery-note"><span lang="zh-CN">以字为引，以文会友</span><br>Start with a character.<br>See where it takes you.</p></header><div class="tools-gallery-layout">${rail}<div class="tools-showcase-stream">${scenes}</div></div><p class="tools-gallery-footer">339 published characters. Five small windows into their world. <a href="/data-sources/">Sources & attribution ↗</a></p><p data-local-status role="status"></p><noscript><p>The previews and chapter links work without JavaScript. Enable JavaScript for live tools; private inputs are never submitted.</p></noscript></div><script type="module" src="/site-assets/hf06/client/guest-learning.mjs"></script><script type="module" src="/site-assets/tools/tools-entry.mjs"></script>`};
}
