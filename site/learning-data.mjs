import {createHash} from 'node:crypto';
import {characters, readings, editorFor, readingFor, readJson} from './dictionary-data.mjs';
import {decks, stories} from './data.mjs';
import {lexicon,hskDecks,findReading} from './hsk-data.mjs';
import {characterReviewState} from './publication-review.mjs';
import {pronunciationManifest} from './pronunciation.mjs';
export function learningData() {
  const card = (c, readingId, cardId, source) => {
    const r=readingFor(readingId), ed=editorFor(c.characterId);
    return {cardId,characterId:c.characterId,readingId,itemId:c.characterId,front:c.glyph,
      back:r.pinyin.marked+' · '+(readingId===ed.readingId?ed.meaning:r.senses.join('; '))+
        (readingId===ed.readingId?'\n'+ed.sentence+'\n'+ed.pinyin+'\n'+ed.translation:''),
      source,contentVersion:'hf04-teaching-v1',reviewStatus:'human-pending'};
  };
  const legacy=readJson('data/legacy-occurrences.json').map(o=>card(characters.find(c=>c.characterId===o.characterId),o.readingId,o.cardId,o.source));
  const dictionary=characters.flatMap(c=>c.readingId.map(id=>card(c,id,'card:dictionary:'+id,'dictionary')));
  const extra=lexicon.characters.flatMap(c=>c.readingId.map(readingId=>{const r=findReading(readingId), state=characterReviewState(c.characterId), ed=state.teaching, selected=ed?.readingId===readingId;return {cardId:'card:dictionary:'+readingId,characterId:c.characterId,readingId,itemId:c.characterId,front:c.glyph,back:r.pinyin.marked+' · '+(selected?ed.meaning:r.senses.join('; '))+(selected?'\n'+ed.sentence+'\n'+ed.pinyin+'\n'+ed.translation:''),source:'hsk-import',contentVersion:ed?'hf10-'+state.contentSha256.slice(0,16):'hf07-dictionary-import-v1',reviewStatus:state.accepted?'human-reviewed':'human-pending'};}));
  const catalog=[...legacy,...dictionary,...extra];
  const primary=c=>legacy.find(x=>x.characterId===c.characterId&&x.readingId===c.primaryReadingId)||dictionary.find(x=>x.readingId===c.primaryReadingId);
  const groups=decks.map(d=>({...d,cardIds:d.chars.map(g=>primary(characters.find(c=>c.glyph===g)).cardId)}));
  const primaries=[...characters.map(c=>primary(c).cardId),...lexicon.characters.map(c=>'card:dictionary:'+(characterReviewState(c.characterId).teaching?.readingId||c.primaryReadingId))];
  const fixed=hskDecks(new Map(primaries.map(id=>[catalog.find(c=>c.cardId===id).characterId,id])));
  const value={catalog,decks:[...groups,...fixed],lessonIds:stories.map(s=>s.id),primary:primaries};
  const pronunciations=Object.fromEntries([...readings,...lexicon.readings].filter(r=>r.itemId?.startsWith('char:')).map(r=>{
    const record=pronunciationManifest.syllables[r.pinyin.numeric.replaceAll('ü','v')];
    return [r.readingId,{url:record?.url?'/'+record.url:'',text:record?.text||String.fromCodePoint(parseInt(r.itemId.slice(5),16))}];
  }));
  return {...value,pronunciations,contentVersion:'hf06-'+createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,16)};
}
