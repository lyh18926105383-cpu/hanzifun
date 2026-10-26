import {characterReviewState,reviewInputs} from './publication-review.mjs';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
export const readJson = name => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rawCharacters = readJson('data/normalized/characters.json');
export const readings = readJson('data/normalized/readings.json');
export const kanji = readJson('data/normalized/kanji.json');
export const words = readJson('data/normalized/words.json');
export const strokes = readJson('data/strokes/manifest.json');
export const syllables = readJson('data/pinyin/syllables.json');
export const scope = readJson('data/pinyin/scope.json');
export const editorial = readJson('data/editorial/characters.json');
export const characters = rawCharacters.map(c=>({...c, primaryReadingId:editorial.entries.find(e=>e.characterId===c.characterId)?.readingId || c.primaryReadingId}));
export const comparisons = readJson('data/editorial/comparisons.json');
export const reviews = reviewInputs.reviews;
export const readingFor = id => readings.find(r => r.readingId === id);
export const editorFor = id => editorial.entries.find(entry => entry.characterId === id);
export const charUrl = glyph => '/dictionary/' + glyph + '/';
export const charLink = glyph => characters.some(c=>c.glyph===glyph) ? `<a lang="zh-CN" href="${charUrl(glyph)}">${escapeHtml(glyph)}</a>` : `<span lang="zh-CN">${escapeHtml(glyph)}</span>`;
export function searchShards() {
  return {
    characters: characters.map(c=>({id:c.characterId, type:'Characters & words',glyph:c.glyph,label:c.glyph+' · '+readingFor(c.primaryReadingId).pinyin.marked+' · '+editorFor(c.characterId).meaning,url:charUrl(c.glyph),aliases:[c.glyph,...c.readingId.flatMap(id=>readingFor(id).pinyin.search),editorFor(c.characterId).meaning,...c.readingId.flatMap(id=>readingFor(id).senses)]})),
    words: words.filter(w=>w.coverageStatus==='dictionary-attested').map(w=>({id:w.wordId,type:'Characters & words',glyph:w.simplified,label:w.simplified+' · '+w.readingId.map(id=>readingFor(id).pinyin.marked).join(' / '),url:charUrl(characters.find(c=>c.characterId===w.coreCharacterIds[0]).glyph)+'#examples',aliases:[w.simplified,...w.readingId.flatMap(id=>[...readingFor(id).pinyin.search,...readingFor(id).senses])]}))
  };
}
export function contentAccepted(id) {
  return characterReviewState(id).accepted;
}
export function assertPublicationReady(route) {
  if (route.indexing !== 'index') return;
  const match = /^\/dictionary\/([^/]+)\/$/.exec(route.path);
  if (match && characters.some(c=>c.glyph===match[1])) {
    const c = characters.find(c=>c.glyph===match[1]);
    if (!contentAccepted(c.characterId) || editorFor(c.characterId)?.reviewStatus !== 'ai-quick-reviewed') throw new Error('Unreviewed dictionary publication: '+route.path);
  }
  if (route.path==='/pinyin-chart/' && reviews.pinyin.humanTeaching !== 'approved') throw new Error('Pinyin teaching review is pending');
}
