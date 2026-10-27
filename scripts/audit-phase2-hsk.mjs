// Read-only against production data: write audit artifacts only, never teaching or approvals.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {reviewInputs, characterReviewState, contentHash} from '../site/publication-review.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';

const root = new URL('../', import.meta.url);
const membership = JSON.parse(fs.readFileSync(new URL('data/hsk/membership.json', root)));
const fields = ['readingId','meaning','word','wordPinyin','wordMeaning','sentence','pinyin','translation','mnemonic'];
const candidates = reviewInputs.supplemental.characters;
const rows = candidates.map(c => {
  const state = characterReviewState(c.characterId);
  const sourceMembership = membership.filter(m => m.glyph.includes(c.glyph));
  const old = sourceMembership.some(m => m.system === 'hsk-2');
  const newer = sourceMembership.some(m => m.system === 'hsk-3');
  const sourceGroup = old && newer ? 'both' : old ? 'hsk2-only' : newer ? 'hsk3-only' : 'scenario-only';
  const vocabulary = sourceMembership.filter(m => m.itemType === 'vocabulary');
  const vocabularyHeadwordCount = new Set(vocabulary.map(m => m.system + ':' + m.glyph)).size;
  const writing = sourceMembership.some(m => m.itemType === 'writing-character');
  const recognition = sourceMembership.some(m => m.itemType === 'recognition-character');
  const readings = c.readingId.map(id => reviewInputs.supplemental.readings.find(r => r.readingId === id));
  const stroke = reviewInputs.supplemental.strokes.find(s => s.characterId === c.characterId);
  return {
    characterId:c.characterId, glyph:c.glyph, path:state.path,
    routePolicy:resolveRoutePolicy(state.path), sourceGroup, writing, recognition,
    vocabularyHeadwordCount, firstVocabularyOrdinal:Math.min(...vocabulary.map(m => m.ordinal), 999999),
    base:{primaryReadingId:c.primaryReadingId, readingIds:c.readingId,
      readings:readings.map(r => ({readingId:r.readingId,pinyin:r.pinyin,senses:r.senses,traditionalForms:r.traditionalForms,evidence:r.evidence})),
      definition:c.definition,radical:c.radical,strokeCount:c.strokeCount,structure:c.structure,
      components:c.components,scriptRelations:c.scriptRelations,sourceReferences:c.sourceReferences,
      stroke,strokeFileExists:!!stroke && fs.existsSync(new URL(stroke.url,root))},
    sourceMembership:sourceMembership.map(({system,edition,level,itemType,glyph,ordinal,sourceLocator})=>({system,edition,level,itemType,glyph,ordinal,sourceLocator})),
    missingTeachingFields:fields.filter(f => !state.teaching?.[f]?.trim()),
    gateIssues:state.issues,accepted:state.accepted,contentSha256:state.contentSha256,
    manualReviewFlags:[...(c.components.completeness !== 'complete'?['incomplete-components']:[]),
      ...(c.structure === 'other / unverified'?['unverified-structure']:[]),
      ...(readings.length > 1?['multiple-readings']:[]),
      ...(sourceGroup === 'scenario-only'?['not-in-hsk-membership']:[])],
    humanContent:reviewInputs.reviews.characters[c.characterId]?.humanContent || 'pending'
  };
});
// Curriculum overlap and syllabus coverage are priority proxies, not corpus frequency.
const groupRank = {'both':0,'hsk2-only':1,'hsk3-only':2,'scenario-only':3};
rows.sort((a,b)=>groupRank[a.sourceGroup]-groupRank[b.sourceGroup]
  || Number(b.writing)-Number(a.writing) || Number(b.recognition)-Number(a.recognition)
  || b.vocabularyHeadwordCount-a.vocabularyHeadwordCount
  || a.firstVocabularyOrdinal-b.firstVocabularyOrdinal
  || a.glyph.codePointAt(0)-b.glyph.codePointAt(0));
const sizes = [54,53,53,53]; let offset = 0;
const batches = sizes.map((size,i)=>{
  const batchId = 'hf10-phase2-' + 'abcd'[i];
  const members = rows.slice(offset,offset+size); offset += size;
  members.forEach(r => {r.batchId=batchId;});
  return {batchId,label:'Batch '+'ABCD'[i],count:members.length,glyphs:members.map(r=>r.glyph),characterIds:members.map(r=>r.characterId),
    sourceGroups:Object.fromEntries(Object.keys(groupRank).map(k=>[k,members.filter(r=>r.sourceGroup===k).length])),status:'planned-no-content'};
});
if(rows.length!==213 || offset!==rows.length || new Set(rows.map(r=>r.characterId)).size!==213
  || rows.some(r=>r.routePolicy.status!=='preview'||r.accepted)) throw Error('Expected exactly 213 unique unapproved preview characters; re-audit changed scope before planning');
const summary = {
  total:rows.length,sourceGroups:Object.fromEntries(Object.keys(groupRank).map(k=>[k,rows.filter(r=>r.sourceGroup===k).length])),
  teachingEntries:rows.filter(r=>!r.missingTeachingFields.length).length,
  basicReadings:rows.filter(r=>r.base.readings.every(x=>x.pinyin.marked&&x.senses.length)).length,
  radical:rows.filter(r=>r.base.radical && r.base.radical!=='unverified').length,
  strokeAssets:rows.filter(r=>r.base.strokeFileExists).length,
  scriptRelations:rows.filter(r=>r.base.scriptRelations.length).length,
  incompleteComponents:rows.filter(r=>r.manualReviewFlags.includes('incomplete-components')).map(r=>r.glyph),
  unverifiedStructure:rows.filter(r=>r.manualReviewFlags.includes('unverified-structure')).map(r=>r.glyph),
  multipleReadings:rows.filter(r=>r.manualReviewFlags.includes('multiple-readings')).map(r=>r.glyph),
  missingTeachingFields:Object.fromEntries(fields.map(f=>[f,rows.filter(r=>r.missingTeachingFields.includes(f)).length]))
};
const scopeHash = contentHash({characters:candidates,membership,teaching:reviewInputs.supplementalTeaching});
const artifacts = {'hf10-inventory.json':{version:'hf10-phase2-audit-v1',scopeHash,summary,characters:rows},
  'hf10-batches.json':{version:'hf10-phase2-batches-v1',scopeHash,sortPolicy:'sourceGroup(both,hsk2-only,hsk3-only,scenario-only); writing desc; recognition desc; distinct vocabulary headwords per edition desc; first vocabulary ordinal asc; Unicode asc',batches}};
for(const [name,data] of Object.entries(artifacts)){
  const dest = new URL('docs/hanzifun-rebuild/'+name,root), text=JSON.stringify(data,null,2)+'\n';
  if(process.argv.includes('--check')){if(fs.readFileSync(dest,'utf8')!==text)throw Error('Stale audit: '+fileURLToPath(dest));}
  else fs.writeFileSync(dest,text);
}
console.log(JSON.stringify({mode:process.argv.includes('--check')?'check':'write',summary,batches},null,2));
