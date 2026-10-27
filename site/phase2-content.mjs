import fs from 'node:fs';
export const levelTwo=JSON.parse(fs.readFileSync(new URL('../data/hsk/level-2-core.json',import.meta.url),'utf8'));
export const additionalScenarios=JSON.parse(fs.readFileSync(new URL('../data/editorial/phase2/scenarios.json',import.meta.url),'utf8'));
export function phaseTwoLinks(glyph){
 const scenarios=additionalScenarios.scenarios.filter(s=>s.sentences.some(x=>x.tokens.some(t=>t[0].includes(glyph))));
 const words=levelTwo.entries.filter(w=>w.glyph.includes(glyph));
 return `<section class="context-links"><h2>Use this character in context</h2><p>${scenarios.map(s=>`<a href="${s.path}">${s.title}</a>`).join(' · ')||'<a href="/scenarios/">Explore conversation scenarios</a>'}</p>${words.length?`<p>HSK 2.0 level 2: ${words.map(w=>`<a lang="zh-CN" href="/academic/hsk-2/level-2/#item-${w.itemId}">${w.glyph}</a>`).join(' · ')}</p>`:''}</section>`;
}
