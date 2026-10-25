import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON, parseCedict, normalizePinyin, pinyinForms, markSyllable, splitSyllable, validateStroke, require, parseRegionalStrokeCounts } from '../scripts/data-foundation-lib.mjs';
import { loadBundle, validateBundle, validateFoundation, validateMembership } from '../scripts/validate-data-foundation.mjs';

const lock = readJSON('data/sources.lock.json');
const bundle = loadBundle();
const checkMutation = (mutate, pattern) => {
    const b = structuredClone(bundle), l = structuredClone(lock);
    mutate(b, l); assert.throws(() => validateBundle(b, l, { files: false }), pattern);
};

test('HF-02 all source-backed artifacts validate and rebuild byte-identically offline', async () => {
    await validateFoundation();
});
test('108 positions reconstruct legacy source and both 睛 cards share one identity and audio', () => {
    const jing = bundle.occurrences.filter(c => c.characterId === 'char:775b');
    assert.deepEqual(jing.map(c => c.cardId), ['card:legacy:4-4:1', 'card:legacy:4-15:3']);
    assert.equal(new Set(jing.map(c => c.audioId)).size, 1);
    assert.deepEqual(bundle.occurrences.map(c => c.originalCard), require('../characters.js'));
    checkMutation(b => b.occurrences[86].characterId = 'char:773c', /characterId|char:775b|775b|773c|reading/);
});
test('CEDICT parser retains v1/v2, multiple traditional forms, line locators and malformed input fails', () => {
    const rows = parseCedict('# comment\n發 发 [fa1] /to issue/\n髮 发 [[fa4]] /hair/');
    assert.deepEqual(rows.map(r => r.traditional), ['發', '髮']);
    assert.deepEqual(rows.map(r => r.format), ['v1', 'v2']);
    assert.equal(rows[0].sourceLocator, 'cedict_ts.u8:line:2');
    assert.throws(() => parseCedict('not a cedict entry'), /Invalid CEDICT/);
    assert.throws(() => parseCedict('女 女 [[nu:3] /female/'), /Invalid CEDICT/);
});
test('Pinyin ü aliases stay distinct from u, zero initials, contractions and tone placement survive', () => {
    assert.equal(normalizePinyin(' LU:4 '), 'lü4');
    assert.equal(normalizePinyin('lv4'), 'lü4');
    assert.notEqual(normalizePinyin('lu4'), normalizePinyin('lü4'));
    assert.equal(markSyllable('liu2'), 'liú');
    assert.equal(markSyllable('gui3'), 'guǐ');
    assert.equal(markSyllable('lüe4'), 'lüè');
    assert.equal(markSyllable('shui3'), 'shuǐ');
    assert.equal(markSyllable('ma5'), 'ma');
    assert.deepEqual(splitSyllable('yuan'), { initial: '', final: 'üan', orthographicOnset: 'y' });
    assert.equal(splitSyllable('jun').final, 'ün');
    assert.equal(splitSyllable('lun').final, 'uen');
    assert.equal(splitSyllable('liu').final, 'iou');
    assert.equal(splitSyllable('a').initial, '');
    assert.ok(pinyinForms('nu:3').search.includes('nv'));
});
test('Polyphones, one-to-many forms and reviewed context corrections do not collapse', () => {
    const fa = bundle.characters.find(c => c.glyph === '发');
    assert.ok(fa.readingId.some(id => id.endsWith(':fa1')));
    assert.ok(fa.readingId.some(id => id.endsWith(':fa4')));
    assert.ok(fa.scriptRelations.some(r => r.traditional === '發' && r.readingId.endsWith(':fa1')));
    assert.ok(fa.scriptRelations.some(r => r.traditional === '髮' && r.readingId.endsWith(':fa4')));
    for (const [glyph, numeric] of Object.entries({ 壳: 'ke2', 肚: 'du4', 说: 'shuo1', 听: 'ting1', 给: 'gei3' })) {
        const c = bundle.characters.find(c => c.glyph === glyph);
        assert.equal(bundle.readings.find(r => r.readingId === c.primaryReadingId).pinyin.numeric, numeric);
    }
    checkMutation(b => b.readings.push(structuredClone(b.readings[0])), /Duplicate readingId/);
    checkMutation(b => b.readings[0].evidence[0].sourceReleaseId = 'unknown', /Unknown source/);
});
test('Missing license, stroke/resource binding, bad SVG medians and incorrect counts fail closed', () => {
    checkMutation((b, l) => l.sources.find(s => s.id === 'cedict').licenseTextPath = null, /Missing license/);
    checkMutation(b => b.strokes[0].sha256 = '0'.repeat(64), /Stroke not in locked/);
    checkMutation(b => b.strokes.pop(), /Missing stroke|126/);
    checkMutation(b => b.characters[0].strokeCount += 1, /strictEqual|Expected/);
    assert.throws(() => validateStroke({ strokes: ['M 0 0 L 1 1 Z'], medians: [] }), /count mismatch/);
    assert.throws(() => validateStroke({ strokes: ['M 0 0 L 1 1 Z'], medians: [[[0, NaN], [1, 1]]] }), /Invalid stroke median/);
    assert.throws(() => validateStroke({ strokes: ['bad'], medians: [[[0, 0], [1, 1]]] }), /Invalid SVG/);
});
test('Kanji evidence is required for positives and unlisted is not a negative Japanese claim', () => {
    assert.ok(bundle.kanji.some(k => k.status === 'verified' && k.evidence.length));
    assert.ok(bundle.kanji.some(k => k.status === 'not-in-consulted-source' && k.japaneseGlyph === null));
    checkMutation(b => b.kanji.find(k => k.status === 'verified').evidence = [], /Verified Kanji lacks evidence/);
});
test('Pinyin cannot expose fake playback, wrong tone examples or an illegal scope combination', () => {
    checkMutation(b => b.syllables[0].tones[0].playable = true, /No reviewed pinyin audio/);
    checkMutation(b => b.syllables[0].tones[0].exampleReadingId = b.syllables[1].tones[0].exampleReadingId, /tone mismatch/);
    checkMutation(b => b.syllables[0].spelling = 'bua', /Pinyin scope mismatch/);
});
test('HSK contracts keep editions/list types separate and accept user scope without invented license', () => {
    const row = { system: 'hsk-2', edition: '2015-vocabulary', sourceReleaseId: 'fixture-official-hsk', level: '1',
        itemType: 'derived-character', membershipKind: 'derived-from-vocabulary', itemId: 'char:6c34', firstIntroducedLevel: '1', cumulative: true,
        sourceLocator: 'fixture:row:1', rightsStatus: 'approved-with-scope', decisionBasis: 'user-confirmed-scope', usageScope: 'headword-edition-level-membership-only' };
    const sources = [{ id: row.sourceReleaseId, sha256: 'a'.repeat(64), version: 'fixture-only', url: 'https://example.invalid/hsk', rightsStatus: 'approved-with-scope' }];
    assert.equal(validateMembership(row, sources), true);
    assert.throws(() => validateMembership({ ...row, membershipKind: 'official-recognition' }, sources), /HSK schema/);
    assert.throws(() => validateMembership({ ...row, level: '7-9' }, sources), /HSK schema/);
    assert.throws(() => validateMembership(row, []), /Missing actual locked HSK source/);
});


test('TTS generator measures unique assets and covered occurrences separately without writing', () => {
    const { buildManifestFiles } = require('../scripts/build-tts-manifest.js');
    const m = buildManifestFiles({ write: false, voice: 'tencent-502007' });
    assert.equal(m.available, 107);
    assert.equal(m.total, 107);
    assert.equal(m.availableOccurrences, 108);
    assert.equal(m.totalOccurrences, 108);
    assert.equal(m.voice, 'tencent-502007');
    assert.equal(Object.keys(m.cards).length, 107);
    assert.equal(m.cards['睛'].url, 'audio/tts-v1/019-775b.mp3');
});

test('Regional counts use actual linked-variant evidence with explicit IRG tags', () => {
    const source = readJSON('data/source-extracts/unihan.json')['蠶'];
    const parsed = parseRegionalStrokeCounts(source.kAlternateTotalStrokes.value, source.kAlternateTotalStrokes.sourceLocator);
    assert.equal(source.kTotalStrokes.value, '24');
    assert.equal(parsed[0].count, 26);
    assert.equal(parsed[0].irgSources, 'J');
    assert.match(parsed[0].evidence.sourceLocator, /kAlternateTotalStrokes/);
    assert.deepEqual(parseRegionalStrokeCounts('-', 'fixture'), []);
    assert.throws(() => parseRegionalStrokeCounts('24 26', 'fixture'), /Invalid regional/);
});
