import {levelTwo} from '../site/phase2-content.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readJSON,sha256,characterId} from '../scripts/data-foundation-lib.mjs';
import {levelTwoCore} from '../scripts/build-level-two-core.mjs';
import {buildTopics} from '../scripts/build-hsk-topics.mjs';
import {validateLevelTwo,validateHskExpansion} from '../scripts/validate-hsk-expansion.mjs';
import {hskTopics,hskTopicLinks,allCharacters,assertPublicationReady} from '../site/hsk-data.mjs';
import {levelTwoPage,additionalCharacterPages} from '../site/pages/hsk.mjs';
import {learningData} from '../site/learning-data.mjs';
import {parse} from 'parse5';
import {nodes,attr} from '../scripts/validate-seo-quality.mjs';
test('HF14 all 150 additional source rows deterministically reproduce, including all 64 previous deferrals',()=>{
 assert.deepEqual(levelTwoCore(),levelTwo);assert.equal(validateLevelTwo().mappedEntries,150);assert.equal(levelTwo.deferred.length,0);assert.equal(levelTwo.exampleCount,64);assert.equal(new Set(levelTwo.entries.map(w=>w.ordinal)).size,150);
});
test('HF14 complete membership stays separate from the unchanged 339-character coverage and practice identities',()=>{
 assert.equal(allCharacters.length,339);assert.equal(levelTwo.fullyLinkedCount,86);assert.equal(levelTwo.nextCharacterBatch.length,87);
 const lib=learningData(),deck=lib.decks.find(d=>d.slug==='hsk-2-2015-level-2-core');
 for(const w of levelTwo.entries)for(const b of w.constituentBindings){assert.equal(b.characterId,characterId(b.glyph));assert.equal(!!b.path,allCharacters.some(c=>c.characterId===b.characterId));if(!b.path)assert.ok(!deck.chars.includes(b.glyph));}
 for(const id of deck.cardIds)assert.ok(lib.catalog.some(c=>c.cardId===id));
 assert.deepEqual(new Set(deck.chars),new Set(levelTwo.entries.flatMap(w=>w.constituentBindings.filter(b=>b.path).map(b=>b.glyph))));
});
test('HF14 composed activity phrases and paired conjunctions retain part-level dictionary witnesses without ellipsis characters',()=>{
 for(const glyph of ['打篮球','踢足球','虽然……但是……','因为……所以……']){const w=levelTwo.entries.find(w=>w.glyph===glyph);assert.equal(w.readings[0].derivation,'composed-from-attested-parts');assert.ok(w.readings[0].parts.every(p=>p.sourceReleaseId==='cedict'));assert.ok(w.characterIds.every(id=>id!=='char:2026'));}
 const phrase=levelTwo.entries.find(w=>w.glyph==='因为……所以……');assert.equal(phrase.teaching.reading.numeric,'yin1 wei4 suo3 yi3');
});
test('HF14 invalid source counts, aliases, missing-word examples, pinyin alignment and false dictionary links fail closed',()=>{
 for(const mutate of [v=>v.coveredCount=149,v=>v.entries[0].characterIds[0]='char:773c5b',v=>v.entries[3].teaching.sentence='你好。',v=>v.entries[3].teaching.tokens[0].pinyin.numeric='wo3',v=>v.entries[3].constituentBindings[0].path='/dictionary/帮/',v=>v.nextCharacterBatch.pop(),v=>v.entries[0].sourceLocator='xlsx:unknown',v=>v.entries[0].readings[0].sourceLocator='made-up']){const v=structuredClone(levelTwo);mutate(v);v.contentSha256=sha256(JSON.stringify(v.entries));assert.throws(()=>validateLevelTwo(v));}
});
test('HF14 topic expansion covers every approved character and all original starter entries with stable contextual readings',()=>{
 assert.deepEqual(hskTopics,buildTopics());assert.equal(hskTopics.uniqueCharacters,339);assert.equal(hskTopics.groups.length,16);assert.equal(hskTopics.bindings,383);assert.equal(hskTopics.starterOverlap,100);
 for(const c of allCharacters){assert.ok(hskTopics.crossIndex[c.characterId]?.topicIds.length);assert.match(hskTopicLinks(c.glyph),/#topic-/);}
 assert.ok(hskTopics.groups.flatMap(g=>g.entries).every(c=>c.readingId.startsWith('reading:'+c.characterId+':')&&c.evidence.length&&c.pronunciation.sourceLocator));
});
test('HF14 delegated acceptance binds both datasets and release; stale readings, missing receipts and altered hashes reject publication',()=>{
 assert.equal(validateHskExpansion().status,'PASS');assert.doesNotThrow(()=>assertPublicationReady({path:'/academic/hsk-2/level-2/',indexing:'index'}));
 const reviews=readJSON('data/editorial/review-decisions.json'),release=readJSON('site/release.json');
 for(const mutate of [v=>delete v.reviews.hskBatches,v=>v.release.hf14.topicsSha256='0'.repeat(64),v=>v.topics.groups[0].entries[0].readingId='reading:char:4eba:ma1',v=>v.topics.crossIndex['char:4eba'].topicIds=[],v=>v.reviews.hskBatches['hf14-hsk-data-2026-10-31'].approvalBasis='human-listened']){const v=structuredClone({reviews,release,topics:hskTopics});mutate(v);assert.throws(()=>validateHskExpansion(v));}
 assert.deepEqual(Object.keys(reviews.characters).length,339);assert.equal(reviews.hskBatches['hf14-hsk-data-2026-10-31'].approvalBasis,'owner-authorized-schema-and-source-validation');
});
test('HF14 static HSK page exposes all word/example/topic anchors, pinyin and only real character links',()=>{
 const page=levelTwoPage();assert.equal(page.title,'HSK 2.0 Level 2: 150 Vocabulary Entries with Audio');assert.match(page.description,/all 150 additional/);assert.match(page.description,/86 words have complete/);const tree=nodes(parse(page.content)),ids=tree.map(n=>attr(n,'id')).filter(Boolean);assert.equal(new Set(ids).size,ids.length);
 for(const w of levelTwo.entries)assert.ok(ids.includes('item-'+w.itemId));
 assert.equal(tree.filter(n=>attr(n,'aria-label')?.startsWith('Listen to sentence:')).length,64);
 for(const a of tree.filter(n=>n.tagName==='a')){const url=attr(a,'href');if(url?.startsWith('#'))assert.ok(ids.includes(url.slice(1)));if(url?.startsWith('/dictionary/')&&!url.includes('top-100')&&!['/dictionary/','/dictionary/pinyin/','/dictionary/radicals/','/dictionary/compare/'].includes(url)){const glyph=decodeURIComponent(url.split('/')[2]);assert.ok(allCharacters.some(c=>c.glyph===glyph),url);}}
 assert.match(page.content,/87 missing character pages/);assert.match(page.content,/150 additional level-2 entries/);
});
