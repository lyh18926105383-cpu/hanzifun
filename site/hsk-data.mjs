import {assertCharacterPublication,characterReviewState} from './publication-review.mjs';
import {readJson,characters as core,readingFor as coreReading,editorFor} from './dictionary-data.mjs';
export const membership=readJson('data/hsk/membership.json');
export const lexicon=readJson('data/hsk/lexicon.json');
export const coverage=readJson('data/hsk/coverage.json');
export const scenarioData=readJson('data/scenarios/scenarios.json');
export const allCharacters=[...core,...lexicon.characters.map(c=>({...c,primaryReadingId:characterReviewState(c.characterId).teaching?.readingId||c.primaryReadingId}))];
export const findCharacter=glyph=>allCharacters.find(c=>c.glyph===glyph);
export const findReading=id=>coreReading(id)||lexicon.readings.find(r=>r.readingId===id);
export const wordFor=id=>lexicon.words.find(w=>w.itemId===id);
export const vocabularyFor=glyph=>lexicon.words.find(w=>w.glyph===glyph);
export const readingLabel=c=>{const ed=editorFor(c.characterId),r=findReading(c.primaryReadingId);return {pinyin:r.pinyin.marked,meaning:ed?.meaning||r.senses.join('; ')};};
export const listId=(system,type,level)=>`${system}-${system==='hsk-2'?'2015':'2025'}-level-${level}-${type}`;
export const listMembers=(system,type,level)=>membership.filter(m=>m.system===system&&m.itemType===type&&m.level===level);
export function constituentIds(rows){return [...new Set(rows.flatMap(m=>[...m.glyph].map(g=>findCharacter(g)?.characterId).filter(Boolean)))];}
export function hskDecks(primary) {
 const make=(slug,title,ids,metadata)=>({slug,title,description:'Character practice from a fixed source list. Vocabulary entries are explained on the library page; ratings count characters, not words.',chars:ids.map(id=>allCharacters.find(c=>c.characterId===id).glyph),cardIds:ids.map(id=>primary.get(id)).filter(Boolean),...metadata});
 const decks=coverage.lists.map(l=>make(listId(l.system,l.itemType,l.level),`${l.system==='hsk-2'?'HSK 2.0 · 2015':'HSK 3.0 · 2025 syllabus'} · ${l.level==='1-2'?'Levels 1–2 combined':'Level 1'} · ${l.itemType}`,constituentIds(listMembers(l.system,l.itemType,l.level)),{system:l.system,level:l.level,itemType:l.itemType,contentVersion:l.system==='hsk-2'?'2015-vocabulary':'2025-11-syllabus-effective-2026-07'}));
 for(const scenario of scenarioData.scenarios)decks.push(make('scenario-'+scenario.id,scenario.title+' · character practice',constituentIds(scenario.sentences.flatMap(s=>s.tokens.map(t=>({glyph:t[0]})))),{scenarioId:scenario.id,contentVersion:scenarioData.version}));
 return decks;
}
export function assertPublicationReady(route){
 if(route.indexing!=='index')return;
 if(/^\/dictionary\/[^/]+\/$/.test(route.path)&&lexicon.characters.some(c=>route.path==='/dictionary/'+c.glyph+'/'))assertCharacterPublication(lexicon.characters.find(c=>route.path==='/dictionary/'+c.glyph+'/').characterId);
 if(['/academic/','/academic/hsk-2/','/academic/hsk-3/'].includes(route.path)){
  const facts=readJson('data/hsk/source-headwords.json');
  if(facts.hsk2.length!==150||facts.hsk3.vocabulary.length!==300||facts.hsk3.recognition.length!==246||facts.hsk3.writing.length!==100||coverage.lists.some(l=>l.mappedCount!==l.sourceCount)||coverage.missing.length)throw Error('Incomplete HSK source mapping');
 }
 if(scenarioData.scenarios.some(s=>s.path===route.path)&&scenarioData.review.humanAcceptance!=='approved')throw Error('Scenario human language acceptance pending');
}
