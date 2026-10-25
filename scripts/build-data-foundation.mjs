import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, require, coreInputs, readJSON, writeJSON, fileHash, sha256, characterId, wordId, hexString, pinyinForms, normalizePinyin, splitSyllable, markSyllable, validateStroke, sourceReference, parseRegionalStrokeCounts } from './data-foundation-lib.mjs';

export async function buildFoundation(outputRoot = root) {
    const lock = readJSON('data/sources.lock.json');
    for (const input of [...lock.extracts, ...lock.localInputs, ...lock.licenses, ...lock.strokeFiles]) {
        if (fileHash(input.path) !== input.sha256) throw new Error(`Locked input changed: ${input.path}; explicitly re-extract/review inputs first`);
    }
    const { legacy, prototype, glyphs, positions } = await coreInputs();
    const entries = readJSON('data/source-extracts/cedict.json');
    const unihan = readJSON('data/source-extracts/unihan.json');
    const components = readJSON('data/source-extracts/components.json');
    const audioManifest = readJSON('audio-manifest.json');
    const editorial = readJSON('data/editorial-decisions.json');
    const { PRONUNCIATION_OVERRIDES, buildCorpus } = require(path.join(root, 'tts-corpus.js'));
    const corpus = buildCorpus(legacy);
    const characters = [], readings = [], words = [], strokes = [], kanji = [], audio = [], informationIssues = [];
    const revision = sha256(JSON.stringify({ files: [...lock.extracts, ...lock.localInputs, ...lock.strokeFiles], pipeline: [fileHash('scripts/build-data-foundation.mjs'), fileHash('scripts/data-foundation-lib.mjs')] })).slice(0, 12);
    const addReadings = (itemId, selected) => {
        const grouped = new Map();
        for (const e of selected) {
            const numeric = normalizePinyin(e.pinyin);
            const g = grouped.get(numeric) || [];
            g.push(e); grouped.set(numeric, g);
        }
        return [...grouped.entries()].map(([numeric, rows]) => {
            const readingId = `reading:${itemId}:${numeric.replaceAll(' ', '-').replaceAll('ü', 'v')}`;
            const forms = pinyinForms(numeric);
            const r = { readingId, itemId, pinyin: forms, senses: [...new Set(rows.flatMap(e => e.senses))],
                traditionalForms: [...new Set(rows.map(e => e.traditional))],
                evidence: rows.map(e => sourceReference('cedict', e.sourceLocator)),
                sourceReferences: ['cedict'], reviewStatus: 'draft' };
            readings.push(r); return r;
        });
    };
    for (const glyph of glyphs) {
        const id = characterId(glyph);
        const selected = entries.filter(e => e.simplified === glyph);
        if (!selected.length) throw new Error(`Missing CEDICT character: ${glyph}`);
        const rs = addReadings(id, selected);
        const proto = prototype.find(c => c.char === glyph);
        const override = PRONUNCIATION_OVERRIDES[glyph]?.pinyin;
        const target = normalizePinyin(override || editorial.primaryReadings[glyph]?.numeric || '') || null;
        const primary = (target ? rs.find(r => r.pinyin.numeric === target) : null)
            || (proto ? rs.find(r => r.pinyin.marked === proto.pinyin) : null)
            || rs.find(r => r.senses.some(s => !/^(surname|variant of|old variant|see |used in |Taiwan pr\.)/i.test(s))) || rs[0];
        if (target && primary.pinyin.numeric !== target) throw new Error(`Context reading missing: ${glyph} ${target}`);
        const c = components.find(c => c.glyph === glyph);
        if (!c?.radical || !c.decomposition) throw new Error(`Missing Information: ${glyph}`);
        const rawPath = `data/strokes/${hexString(glyph)}.json`;
        const raw = readJSON(rawPath); validateStroke(raw);
        const asset = { characterId: id, glyph, locale: 'zh-Hans-CN', glyphStandard: 'Make Me a Hanzi / Arphic mainland stroke order',
            url: rawPath, strokeCount: raw.strokes.length, version: '2.0.1', sha256: fileHash(rawPath),
            sourceReleaseId: 'hanzi-writer-data', sourceLocator: `package/${glyph}.json`, licenseId: 'Arphic-Public-License', status: 'available' };
        strokes.push(asset);
        const rootIDS = c.decomposition[0];
        const simple = new Set([...editorial.singleComponentGlyphs]);
        const layout = simple.has(glyph) ? 'single-component' : ({ '⿰': 'left-right', '⿱': 'top-bottom', '⿲': 'left-middle-right', '⿳': 'top-middle-bottom', '⿴': 'full-enclosure', '⿵': 'upper-enclosure', '⿶': 'lower-enclosure', '⿷': 'left-enclosure', '⿸': 'upper-left-enclosure', '⿹': 'upper-right-enclosure', '⿺': 'lower-left-enclosure', '⿻': 'overlaid' })[rootIDS] || 'single-component';
        const u = unihan[glyph] || {};
        const unicodeVariants = ['kTraditionalVariant', 'kSimplifiedVariant'].flatMap(field =>
            [...(u[field]?.value || '').matchAll(/U\+([0-9A-F]+)/g)].map(m => ({ glyph: String.fromCodePoint(parseInt(m[1], 16)), kind: field === 'kTraditionalVariant' ? 'traditional-candidate' : 'simplified-candidate',
                context: 'Unicode character-level candidate; consult reading/sense-specific CC-CEDICT relationships',
                ...sourceReference('unihan', u[field].sourceLocator) })));
        const relations = selected.map(e => ({ simplified: glyph, traditional: e.traditional,
            relation: e.traditional === glyph ? 'same-form' : 'different-form', readingId: rs.find(r => r.pinyin.numeric === normalizePinyin(e.pinyin)).readingId,
            senses: e.senses, ...sourceReference('cedict', e.sourceLocator) }));
        const counts = (u.kTotalStrokes?.value || '').split(' ').filter(Boolean).map(Number);
        const alternateCounts = parseRegionalStrokeCounts(u.kAlternateTotalStrokes?.value, u.kAlternateTotalStrokes?.sourceLocator);
        if (alternateCounts.length || counts.length > 1 || (counts.length && !counts.includes(asset.strokeCount))) informationIssues.push({ characterId: id, kind: 'regional-stroke-count', selectedLocale: asset.locale, selectedCount: asset.strokeCount, unihanCounts: counts, alternateCounts,
            evidence: sourceReference('unihan', u.kTotalStrokes.sourceLocator), status: 'review-required' });
        if (/[？?]/u.test(c.decomposition)) informationIssues.push({ characterId: id, kind: 'incomplete-source-decomposition', sourceDecomposition: c.decomposition, structure: layout, status: 'do-not-display-unknown-components' });
        characters.push({ characterId: id, glyph, readingId: rs.map(r => r.readingId), primaryReadingId: primary.readingId,
            definition: primary.senses.join('; '), radical: c.radical, structure: layout,
            components: { ids: c.decomposition, completeness: /[？?]/u.test(c.decomposition) ? 'partial' : 'complete', evidence: sourceReference('mmh-dictionary', c.sourceLocator), note: 'Visible structure only; not a historical etymology claim' },
            strokeCount: asset.strokeCount, locale: asset.locale,
            scriptRelations: relations, unicodeVariants,
            unihanStrokeCounts: { values: counts, alternates: alternateCounts, interpretation: 'Unihan 17 kTotalStrokes uses IRG counting conventions; regional differences are in kAlternateTotalStrokes with explicit IRG source letters. Current displayed count is from the actual zh-Hans-CN asset', evidence: u.kTotalStrokes ? sourceReference('unihan', u.kTotalStrokes.sourceLocator) : null },
            contentTier: 'Tier2', reviewStatus: 'draft', publicationStatus: 'draft',
            sourceReferences: ['cedict', 'unihan', 'mmh-dictionary', 'hanzi-writer-data'],
            origins: [legacy.some(c => c.char === glyph) ? 'legacy' : null, proto ? 'prototype' : null].filter(Boolean) });
        // kJoyoKanji=2010 attests this literal glyph in the 2010 Joyo list, not language exclusivity.
        const joyo = u.kJoyoKanji;
        kanji.push({ characterId: id, status: joyo?.value === '2010' ? 'verified' : 'not-in-consulted-source',
            japaneseGlyph: joyo?.value === '2010' ? glyph : null, relationType: joyo?.value === '2010' ? 'same-character' : null,
            evidence: joyo ? [sourceReference('unihan', joyo.sourceLocator)] : [], sourceReferences: ['unihan'],
            note: joyo?.value === '2010' ? 'Unihan 17 kJoyoKanji=2010; Japanese glyph style requires lang=ja and a Japanese font. No Japanese readings/meanings inferred.' : 'No direct same-glyph 2010 Joyo attestation in the consulted field; this does not mean absent from Japanese. Variant correspondences remain unverified.' });
        const old = audioManifest.cards[glyph];
        if (old) audio.push({ audioId: `audio:tts-v1:${hexString(glyph)}`, characterId: id,
            targetReadingId: primary.readingId, confirmedReadingId: null,
            url: old.url, sha256: old.sha256, text: old.text, declaredPronunciation: old.pronunciation,
            voice: audioManifest.voice, sourceReleaseId: 'legacy-tts', kind: 'character-with-context',
            reviewStatus: 'pending-listening', usableForIsolatedSyllable: false });
    }
    for (const word of [...new Set(legacy.map(c => c.word))].filter(w => [...w].length > 1)) {
        const selected = entries.filter(e => e.simplified === word);
        const id = wordId(word);
        const rs = addReadings(id, selected);
        words.push({ wordId: id, simplified: word, traditionalForms: [...new Set(selected.map(e => e.traditional))],
            readingId: rs.map(r => r.readingId), componentCharacterIds: [...word].map(characterId),
            coreCharacterIds: [...word].filter(c => glyphs.includes(c)).map(characterId),
            coverageStatus: selected.length ? 'dictionary-attested' : 'missing-dictionary', reviewStatus: 'draft', sourceReferences: selected.length ? ['cedict', 'legacy-cards'] : ['legacy-cards'] });
    }
    const occurrences = legacy.map((c, i) => {
        const r = characters.find(x => x.glyph === c.char);
        return { cardId: `card:legacy:${positions[i].group}:${positions[i].indexInGroup}`, characterId: r.characterId,
            itemId: r.characterId, readingId: r.primaryReadingId, promptType: 'character', contentVersion: `hf02-${revision}`,
            source: 'characters.js', ...positions[i], zeroBasedIndex: i, oneBasedTeachingPosition: i + 1,
            originalCard: c, corpusId: corpus[i].id, audioId: audio.some(a => a.characterId === r.characterId) ? `audio:tts-v1:${hexString(c.char)}` : null };
    });
    const scope = readJSON('data/pinyin/scope.json');
    const examples = readJSON('data/source-extracts/pinyin-examples.json');
    const pinyinReadings = [];
    const syllables = scope.rows.flatMap(row => row.split(' ')).map(base => {
        const tones = examples.filter(e => e.numeric.replace(/[1-5]$/, '') === base).map(e => {
            const id = `reading:pinyin:${hexString(e.glyph)}:${e.numeric.replaceAll('ü', 'v')}`;
            pinyinReadings.push({ readingId: id, glyph: e.glyph, pinyin: pinyinForms(e.numeric),
                evidence: sourceReference('cedict', e.sourceLocator), reviewStatus: 'draft' });
            return { tone: Number(e.numeric.at(-1)), spelling: markSyllable(e.numeric), exampleReadingId: id, audioId: null,
                playable: false, reviewStatus: 'draft', usage: e.numeric.endsWith('5') ? 'neutral-tone-requires-word-context-review' : 'dictionary-attested-pending-standard-usage-review' };
        }).sort((a, b) => a.tone - b.tone);
        return { syllableId: `pinyin:${base.replaceAll('ü', 'v')}`, spelling: base, ...splitSyllable(base),
            search: [...new Set([base, base.replaceAll('ü', 'v'), base.replaceAll('ü', 'u:')])],
            scopeVersion: scope.version, frequencyClass: scope.rareIncluded.includes(base) ? 'rare' : 'standard-candidate',
            tones, status: tones.length ? 'dictionary-attested' : 'no-attestation-in-locked-source',
            reviewStatus: 'draft', sourceReferences: ['cedict', 'pinyin-rules'] };
    });
    const pronunciationRequests = characters.flatMap(c => c.readingId.map(id => ({ readingId: id, characterId: c.characterId,
        reason: audio.some(a => a.targetReadingId === id) ? 'context-recording-exists-requires-listening-or-isolated-replacement' : 'no-recording-for-this-reading', status: 'not-requested-no-TTS-consumed' })));
    const coverage = { core: { uniqueCharacters: characters.length, legacyOccurrences: occurrences.length, legacyUniqueCharacters: new Set(legacy.map(c => c.char)).size,
        prototypeUniqueCharacters: new Set(prototype.map(c => c.char)).size, intersection: prototype.filter(p => legacy.some(c => c.char === p.char)).length,
        dataReady: characters.filter(c => c.readingId.length && c.radical && c.structure && c.strokeCount).length,
        strokesAvailable: strokes.length, informationAvailable: characters.length, tier2Available: 0, tier1Enhanced: 0, publishablePages: 0 },
        hsk: { importStatus: 'contract-only-HF-07', associatedUniqueCharacters: 0, importedMemberships: 0, sourceDenominator: null },
        words: { uniqueWords: words.length, dictionaryAttested: words.filter(w => w.readingId.length).length },
        audio: { uniqueContextRecordings: audio.length, mappedOccurrences: occurrences.filter(c => c.audioId).length, reviewedForNewReading: 0,
            missingCoreContextRecordings: characters.length - audio.length, isolatedReadingRequests: pronunciationRequests.length },
        kanji: { verifiedSameGlyph: kanji.filter(k => k.status === 'verified').length, notInConsultedSource: kanji.filter(k => k.status !== 'verified').length },
        pinyin: { scopeVersion: scope.version, totalSyllables: syllables.length, syllablesWithAttestation: syllables.filter(s => s.tones.length).length,
            attestedSyllableTones: pinyinReadings.length, reviewedSyllableTones: 0, reviewedPlayableAudio: 0, missingAudio: pinyinReadings.length },
        status: 'data-generated-editorial-and-listening-acceptance-pending',
        publicationNote: 'Data readiness is not full Tier2 teaching-page readiness; HF-04 supplies/reviews VisualNotes, examples and practice UI. Missing illustrations alone never block Tier2.' };
    const bundle = { characters, readings, words, strokes, kanji, audio, occurrences, syllables, pinyinReadings };
    for (const name of ['characters', 'readings', 'words', 'kanji', 'audio']) writeJSON(`data/normalized/${name}.json`, bundle[name], outputRoot);
    writeJSON('data/strokes/manifest.json', strokes, outputRoot);
    writeJSON('data/legacy-occurrences.json', occurrences, outputRoot);
    writeJSON('data/core-manifest.json', { version: `hf02-${revision}`, characterIds: characters.map(c => c.characterId), glyphs, sourceLock: 'data/sources.lock.json' }, outputRoot);
    writeJSON('data/pinyin/syllables.json', syllables, outputRoot);
    writeJSON('data/pinyin/readings.json', pinyinReadings, outputRoot);
    writeJSON('data/coverage.json', coverage, outputRoot);
    writeJSON('data/reports/audio-requests.json', { coreReadings: pronunciationRequests, pinyin: pinyinReadings.map(r => ({ readingId: r.readingId, numeric: r.pinyin.numeric, glyph: r.glyph, status: 'missing-reviewed-audio', audioId: null })), automaticTTS: false }, outputRoot);
    writeJSON('data/reports/word-gaps.json', words.filter(w => !w.readingId.length).map(w => ({ wordId: w.wordId, text: w.simplified, status: 'legacy-phrase-not-a-locked-dictionary-headword', action: 'Keep original teaching occurrence; HF-04 may author a reviewed compositional example, do not invent CC-CEDICT senses' })), outputRoot);
    writeJSON('data/reports/information-issues.json', informationIssues, outputRoot);
    writeJSON('data/reports/editorial-review.json', characters.map(c => ({ characterId: c.characterId, primaryReadingId: c.primaryReadingId,
        readingId: c.readingId, status: 'pending', checks: ['all-readings-and-English-senses', 'context-specific-traditional-forms', 'visible-structure', 'regional-stroke-count'], reviewer: null })), outputRoot);
    return { bundle, coverage };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const index = process.argv.indexOf('--output');
    const { coverage } = await buildFoundation(index >= 0 ? path.resolve(process.argv[index + 1]) : root);
    console.log(JSON.stringify(coverage, null, 2));
}
