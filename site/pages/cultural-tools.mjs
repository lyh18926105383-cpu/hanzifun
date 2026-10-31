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
