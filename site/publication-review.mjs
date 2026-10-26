// Human decisions bind to the exact source-backed teaching content, never to a count.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
export const reviewInputs={core:read('data/normalized/characters.json'),coreReadings:read('data/normalized/readings.json'),coreTeaching:read('data/editorial/characters.json'),supplemental:read('data/hsk/lexicon.json'),supplementalTeaching:read('data/editorial/hsk-characters.json'),reviews:read('data/editorial/review-decisions.json'),sources:read('data/sources.lock.json'),strokes:read('data/strokes/manifest.json')};
export const contentHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function characterReviewState(id,inputs=reviewInputs){
 const c=[...inputs.core,...inputs.supplemental.characters].find(c=>c.characterId===id);
 if(!c)throw Error('Unknown character: '+id);
 const supplemental=!inputs.core.some(c=>c.characterId===id);
 const teaching=(supplemental?inputs.supplementalTeaching:inputs.coreTeaching).entries.find(e=>e.characterId===id);
 const readings=c.readingId.map(id=>[...inputs.coreReadings,...inputs.supplemental.readings].find(r=>r.readingId===id));
 const issues=[];
 for(const f of ['readingId','meaning','word','wordPinyin','wordMeaning','sentence','pinyin','translation','mnemonic'])if(typeof teaching?.[f]!=='string'||!teaching[f].trim())issues.push('Missing teaching '+f);
 if(teaching&&!c.readingId.includes(teaching.readingId))issues.push('Unknown teaching reading');
 if(teaching&&!['ai-quick-reviewed','human-reviewed'].includes(teaching.reviewStatus))issues.push('Teaching quick review pending');
 if(teaching&&(!teaching.word?.includes(c.glyph)||!teaching.sentence?.includes(c.glyph)))issues.push('Word/sentence must include character');
 if(readings.some(r=>!r?.pinyin?.marked||!r.senses?.length))issues.push('Reading data incomplete');
 const contentSha256=contentHash({character:c,readings,teaching:teaching||null,strokes:supplemental?inputs.supplemental.strokes.find(s=>s.characterId===id):inputs.strokes.find(s=>s.characterId===id),sources:inputs.sources});
 const decision=inputs.reviews.characters[id];
 const signed=decision?.humanContent==='approved'&&typeof decision.reviewer==='string'&&decision.reviewer.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(decision.date||'')&&!Number.isNaN(Date.parse(decision.date))&&new Date(decision.date).toISOString().slice(0,10)===decision.date&&typeof decision.evidence==='string'&&decision.evidence.trim()&&decision.contentSha256===contentSha256;
 return {characterId:id,glyph:c.glyph,path:'/dictionary/'+c.glyph+'/',supplemental,contentSha256,contentComplete:issues.length===0,accepted:!!signed&&issues.length===0,targetTier:decision?.targetTier||'Tier2',audioListening:decision?.audioListening||'pending',issues,teaching};
}
export function assertCharacterPublication(id,inputs=reviewInputs){const s=characterReviewState(id,inputs);if(!s.accepted)throw Error('Character teaching acceptance pending: '+s.path+'; '+(s.issues.join('; ')||'missing/stale human signature'));return s;}
