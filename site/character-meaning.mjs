import {readJson} from './dictionary-data.mjs';
const explanations=readJson('data/editorial/character-meaning-explanations.json');
// These are teaching-reading explanations. Other readings remain in Information.
export function characterMeaning(c,ed,reading){
 const entry=explanations.entries.find(x=>x.characterId===c.characterId&&x.readingId===reading.readingId);
 const definitions=entry?.definitions||[...new Set(ed.meaning.split(/;\s*/).map(s=>s.trim()).filter(Boolean))].slice(0,3);
 if(!definitions.length||definitions.length>3)throw Error('Expected 1–3 teaching definitions: '+c.glyph);
 const explanation=entry?.explanation||`Think of ${c.glyph} as “${ed.meaning}”. You’ll meet it in ${ed.word} (${ed.wordPinyin}), which means “${ed.wordMeaning}”. Read that word as a whole, then look for the same idea in the examples below.`;
 return {definitions,explanation,readingId:reading.readingId};
}
