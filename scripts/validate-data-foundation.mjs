import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { root, require, readJSON, fileHash, characterId, coreInputs, normalizePinyin, pinyinForms, splitSyllable, validateStroke, parseRegionalStrokeCounts } from './data-foundation-lib.mjs';
import { buildFoundation } from './build-data-foundation.mjs';
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(readJSON('data/schemas/foundation.schema.json'));
const validateLock = ajv.compile(readJSON('data/schemas/sources.schema.json'));
const validateHSK = ajv.compile(readJSON('data/schemas/hsk-membership.schema.json'));

function schema(check, value, name) {
    if (!check(value)) throw new Error(`${name} schema: ${ajv.errorsText(check.errors)}`);
}
function unique(rows, key) {
    const ids = rows.map(r => r[key]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate ${key}`);
}
function safeFile(url) {
    assert.ok(!path.isAbsolute(url) && !url.split('/').includes('..'), `Unsafe resource path: ${url}`);
    const target = path.resolve(root, url);
    assert.ok(target.startsWith(`${root}${path.sep}`), 'Resource escapes root');
    assert.ok(fs.existsSync(target), `Missing resource: ${url}`);
    return target;
}
export function validateMembership(row, sources) {
    schema(validateHSK, row, 'HSK');
    const source = sources.find(s => s.id === row.sourceReleaseId);
    assert.ok(source?.sha256 && source?.version && source?.url, 'Missing actual locked HSK source');
    assert.equal(source.rightsStatus, 'approved-with-scope');
    const ordinal = level => level === '7-9' ? 7 : Number(level);
    assert.ok(ordinal(row.firstIntroducedLevel) <= ordinal(row.level), 'Introduced level exceeds membership level');
    if (!row.cumulative) assert.equal(row.firstIntroducedLevel, row.level, 'Incremental list must identify its introducing level');
    if (row.itemType.endsWith('character')) assert.match(row.itemId, /^char:[0-9a-f]{4,6}$/);
    else assert.match(row.itemId, /^word:[0-9a-f-]+$/);
    return true;
}

export function validateBundle(b, lock, { files = true } = {}) {
    schema(validateSchema, b, 'Foundation');
    schema(validateLock, lock, 'Sources');
    unique(lock.sources, 'id');
    for (const [rows, key] of [[b.characters, 'characterId'], [b.readings, 'readingId'], [b.words, 'wordId'], [b.strokes, 'characterId'], [b.kanji, 'characterId'], [b.audio, 'audioId'], [b.occurrences, 'cardId'], [b.syllables, 'syllableId'], [b.pinyinReadings, 'readingId']]) unique(rows, key);
    const sources = new Map(lock.sources.map(s => [s.id, s]));
    const sourceIds = new Set(sources.keys());
    const reference = id => assert.ok(sourceIds.has(id), `Unknown source: ${id}`);
    const evidence = e => { reference(e.sourceReleaseId); assert.ok(e.sourceLocator.trim(), 'Missing source locator'); };
    const readings = new Map(b.readings.map(r => [r.readingId, r]));
    const characters = new Map(b.characters.map(c => [c.characterId, c]));
    const audio = new Map(b.audio.map(a => [a.audioId, a]));
    const pyReadings = new Map(b.pinyinReadings.map(r => [r.readingId, r]));
    const scope = readJSON('data/pinyin/scope.json');
    const expectedSyllables = scope.rows.flatMap(row => row.split(' '));
    assert.equal(new Set(expectedSyllables).size, expectedSyllables.length, 'Duplicate syllable in scope');
    assert.deepEqual(b.syllables.map(s => s.spelling), expectedSyllables, 'Pinyin scope mismatch');
    assert.equal(b.characters.length, 126, 'Core must contain exactly 126 unique glyphs');
    for (const source of lock.sources) {
        assert.notEqual(source.version, 'latest', 'Unpinned source version');
        if (source.rightsStatus !== 'reference-only') {
            assert.ok(source.licenseTextPath, `Missing license: ${source.id}`);
            assert.ok(lock.licenses.some(l => l.path === source.licenseTextPath), `Unhashed license: ${source.id}`);
            if (files) safeFile(source.licenseTextPath);
        }
    }
    if (files) for (const f of [...lock.licenses, ...lock.extracts, ...lock.localInputs, ...lock.strokeFiles]) {
        safeFile(f.path); assert.equal(fileHash(f.path), f.sha256, `Locked hash mismatch: ${f.path}`);
    }
    for (const c of b.characters) {
        assert.equal([...c.glyph].length, 1, 'Character glyph must be one codepoint');
        assert.equal(c.characterId, characterId(c.glyph));
        assert.ok(c.readingId.includes(c.primaryReadingId), 'Missing primary reading');
        for (const id of c.readingId) assert.equal(readings.get(id)?.itemId, c.characterId, 'Character reading points to another item');
        c.sourceReferences.forEach(reference); evidence(c.components.evidence);
        for (const r of c.scriptRelations) {
            assert.equal(r.simplified, c.glyph); assert.ok(c.readingId.includes(r.readingId)); evidence(r);
            assert.equal(r.relation, r.simplified === r.traditional ? 'same-form' : 'different-form');
        }
        c.unicodeVariants.forEach(evidence);
        const regional = readJSON('data/source-extracts/unihan.json')[c.glyph]?.kAlternateTotalStrokes;
        assert.deepEqual(c.unihanStrokeCounts.alternates, parseRegionalStrokeCounts(regional?.value, regional?.sourceLocator));
        const stroke = b.strokes.find(s => s.characterId === c.characterId);
        assert.ok(stroke, `Missing stroke: ${c.glyph}`);
        assert.equal(c.strokeCount, stroke.strokeCount);
        assert.equal(c.locale, stroke.locale);
    }
    const readingKeys = new Set();
    for (const r of b.readings) {
        const key = `${r.itemId}:${r.pinyin.numeric}`;
        assert.ok(!readingKeys.has(key), `Duplicate normalized reading: ${key}`); readingKeys.add(key);
        assert.deepEqual(r.pinyin, pinyinForms(r.pinyin.numeric), 'Pinyin search/tone form drift');
        r.sourceReferences.forEach(reference); r.evidence.forEach(evidence);
        assert.ok(characters.has(r.itemId) || b.words.some(w => w.wordId === r.itemId), 'Orphan reading');
    }
    for (const w of b.words) {
        assert.deepEqual(w.componentCharacterIds, [...w.simplified].map(characterId));
        // Component IDs outside core are intentional references, not implicitly created pages.
        for (const id of w.coreCharacterIds) assert.ok(characters.has(id));
        for (const id of w.readingId) assert.equal(readings.get(id)?.itemId, w.wordId);
        w.sourceReferences.forEach(reference);
        if (w.coverageStatus === 'dictionary-attested') assert.ok(w.readingId.length);
    }
    assert.equal(b.strokes.length, 126);
    for (const s of b.strokes) {
        assert.equal(s.glyph, characters.get(s.characterId)?.glyph, 'Stroke glyph mismatch'); reference(s.sourceReleaseId);
        assert.equal(s.licenseId, sources.get(s.sourceReleaseId).licenseId);
        assert.ok(lock.strokeFiles.some(f => f.path === s.url && f.sha256 === s.sha256), 'Stroke not in locked source extraction');
        if (files) {
            safeFile(s.url); assert.equal(fileHash(s.url), s.sha256, `Stroke hash mismatch: ${s.glyph}`);
            const raw = readJSON(s.url); validateStroke(raw); assert.equal(raw.strokes.length, s.strokeCount);
        }
    }
    assert.equal(b.kanji.length, 126);
    for (const k of b.kanji) {
        assert.ok(characters.has(k.characterId)); k.sourceReferences.forEach(reference); k.evidence.forEach(evidence);
        if (k.status === 'verified') {
            assert.ok(k.japaneseGlyph && k.relationType && k.evidence.length, 'Verified Kanji lacks evidence');
            if (k.relationType === 'same-character') {
                assert.equal(k.japaneseGlyph, characters.get(k.characterId).glyph);
                const joyo = readJSON('data/source-extracts/unihan.json')[k.japaneseGlyph]?.kJoyoKanji;
                assert.equal(joyo?.value, '2010', 'No literal Joyo attestation');
                assert.ok(k.evidence.some(e => e.sourceLocator === joyo.sourceLocator));
            }
        } else assert.equal(k.japaneseGlyph, null, 'Unverified correspondence must not be displayed');
    }
    for (const a of b.audio) {
        reference(a.sourceReleaseId); assert.ok(characters.has(a.characterId));
        assert.equal(readings.get(a.targetReadingId)?.itemId, a.characterId);
        assert.equal(a.usableForIsolatedSyllable, false, 'Context recording is not isolated pinyin audio');
        if (a.reviewStatus === 'pending-listening') assert.equal(a.confirmedReadingId, null);
        if (files) { safeFile(a.url); assert.equal(fileHash(a.url), a.sha256, 'Audio hash mismatch'); }
    }
    assert.equal(b.occurrences.length, 108);
    const legacy = require(path.join(root, 'characters.js'));
    for (const [i, o] of b.occurrences.entries()) {
        assert.equal(o.zeroBasedIndex, i); assert.equal(o.oneBasedTeachingPosition, i + 1);
        assert.deepEqual(o.originalCard, legacy[i], 'Legacy occurrence reconstruction mismatch');
        assert.equal(o.characterId, characterId(legacy[i].char)); assert.equal(o.itemId, o.characterId);
        assert.ok(characters.get(o.characterId).readingId.includes(o.readingId));
        if (o.audioId) assert.equal(audio.get(o.audioId)?.characterId, o.characterId);
    }
    const jing = b.occurrences.filter(o => o.characterId === 'char:775b');
    assert.deepEqual(jing.map(o => o.oneBasedTeachingPosition), [19, 87]);
    assert.equal(new Set(jing.map(o => o.audioId)).size, 1);
    const manifest = readJSON('audio-manifest.json');
    assert.equal(manifest.total, 107); assert.equal(manifest.available, Object.keys(manifest.cards).length);
    assert.equal(manifest.totalOccurrences, 108); assert.equal(manifest.availableOccurrences, b.occurrences.filter(o => o.audioId).length);
    for (const r of b.pinyinReadings) { evidence(r.evidence); assert.deepEqual(r.pinyin, pinyinForms(r.pinyin.numeric)); }
    for (const s of b.syllables) {
        s.sourceReferences.forEach(reference);
        const parts = splitSyllable(s.spelling);
        assert.equal(s.initial, parts.initial); assert.equal(s.final, parts.final);
        const tones = new Set();
        for (const t of s.tones) {
            assert.ok(!tones.has(t.tone), 'Duplicate pinyin tone'); tones.add(t.tone);
            const r = pyReadings.get(t.exampleReadingId);
            assert.ok(r, 'Missing pinyin example reading');
            assert.equal(r.pinyin.numeric, `${s.spelling}${t.tone}`, 'Pinyin example tone mismatch');
            assert.equal(r.pinyin.marked, t.spelling);
            // No reviewed isolated syllable asset has been imported in this release.
            assert.equal(t.playable, false, 'No reviewed pinyin audio may be exposed');
            assert.equal(t.audioId, null, 'Unreviewed/absent pinyin audio cannot have a play binding');
        }
    }
    return true;
}
export function loadBundle() {
    return Object.fromEntries(Object.entries({ characters: 'normalized/characters', readings: 'normalized/readings', words: 'normalized/words', strokes: 'strokes/manifest', kanji: 'normalized/kanji', audio: 'normalized/audio', occurrences: 'legacy-occurrences', syllables: 'pinyin/syllables', pinyinReadings: 'pinyin/readings' }).map(([key, file]) => [key, readJSON(`data/${file}.json`)]));
}
function filesIn(directory, prefix = '') {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(e => e.isDirectory() ? filesIn(path.join(directory, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]).sort();
}
export async function validateFoundation({ reproducibility = true } = {}) {
    const bundle = loadBundle(), lock = readJSON('data/sources.lock.json');
    validateBundle(bundle, lock);
    const { glyphs } = await coreInputs();
    assert.deepEqual(bundle.characters.map(c => c.glyph), glyphs);
    assert.deepEqual(readJSON('data/core-manifest.json').characterIds, bundle.characters.map(c => c.characterId));
    if (reproducibility) {
        const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'hf02-rebuild-'));
        try {
            const first = path.join(temp, 'first'), second = path.join(temp, 'second');
            await buildFoundation(first); await buildFoundation(second);
            const files = filesIn(first);
            assert.deepEqual(files, filesIn(second));
            for (const file of files) {
                const bytes = fs.readFileSync(path.join(first, file));
                assert.deepEqual(bytes, fs.readFileSync(path.join(second, file)), `Non-deterministic artifact: ${file}`);
                assert.deepEqual(bytes, fs.readFileSync(path.join(root, file)), `Stale checked-in artifact: ${file}`);
            }
        } finally { fs.rmSync(temp, { recursive: true, force: true }); }
    }
    const coverage = readJSON('data/coverage.json');
    console.log(`HF-02 structural validation PASS: ${bundle.characters.length} characters / ${bundle.occurrences.length} occurrences / ${bundle.strokes.length} strokes; ${bundle.syllables.length} syllables. Rebuild ${reproducibility ? 'byte-identical' : 'not requested'}.`);
    console.log(`Acceptance remains explicit: ${coverage.pinyin.reviewedPlayableAudio} reviewed pinyin audio; ${coverage.core.publishablePages} complete teaching pages. See data/reports/ and HF-02 handover.`);
    return coverage;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await validateFoundation();
