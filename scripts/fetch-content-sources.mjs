// Raw archives stay in ignored .cache/hf02. Only bounded source slices enter data/.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { root, coreInputs, parseCedict, normalizePinyin, readJSON, writeJSON, fileHash } from './data-foundation-lib.mjs';

const cache = path.join(root, '.cache/hf02');
const updating = process.argv.includes('--refresh');
const existing = fs.existsSync(path.join(root, 'data/sources.lock.json')) ? readJSON('data/sources.lock.json') : null;
const commit = 'bddc96d41bef78427ed0e034e9f7e31d71fd1b92';
const specifications = [
    { id: 'cedict', publisher: 'CC-CEDICT contributors / MDBG', version: 'header', file: 'cedict.gz',
        url: 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz',
        licenseId: 'CC-BY-SA-4.0', licenseTextPath: 'data/licenses/CC-BY-SA-4.0.txt', usageScope: 'Selected dictionary headwords, readings and English senses; derived dataset under CC BY-SA 4.0' },
    { id: 'unihan', publisher: 'Unicode, Inc.', version: '17.0.0', file: 'Unihan-17.0.0.zip',
        url: 'https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip',
        licenseId: 'Unicode-3.0', licenseTextPath: 'data/licenses/Unicode-3.0.txt', usageScope: 'Selected variant, radical/stroke and Joyo fields; preserve field provenance' },
    { id: 'hanzi-writer-data', publisher: 'Hanzi Writer / Make Me a Hanzi / Arphic Technology', version: '2.0.1', file: 'hanzi-writer-data-2.0.1.tgz',
        url: 'https://registry.npmjs.org/hanzi-writer-data/-/hanzi-writer-data-2.0.1.tgz',
        upstreamCommit: 'ad1a9905cada18d07630acc27d438b070d753ec0',
        licenseId: 'Arphic-Public-License', licenseTextPath: 'data/licenses/Arphic-Public-License.txt', usageScope: '126 unchanged graphics files, Mainland China stroke-order convention; renderer code is separate' },
    { id: 'mmh-dictionary', publisher: 'Make Me a Hanzi / Unihan / CJKlib', version: commit, file: 'mmh-dictionary.txt',
        url: `https://raw.githubusercontent.com/skishore/makemeahanzi/${commit}/dictionary.txt`,
        licenseId: 'LGPL-3.0-or-later', licenseTextPath: 'data/licenses/LGPL-3.0.txt', usageScope: '126 radical/decomposition source records only; no etymology claims; derivative fields LGPL-3.0-or-later' },
    { id: 'pinyin-rules', publisher: '汉语拼音方案 / 华东师范大学语言文字网', version: '2019-12-10 page snapshot', file: 'pinyin-rules.html',
        url: 'https://yywz.ecnu.edu.cn/1f/56/c30556a335702/page.htm',
        downloadUrl: 'https://r.jina.ai/https://yywz.ecnu.edu.cn/1f/56/c30556a335702/page.htm',
        licenseId: 'reference-only', licenseTextPath: null, usageScope: 'Consult spelling rules only; webpage/images are not redistributed' },
    { id: 'unihan-field-guide', publisher: 'Unicode, Inc.', version: '17.0.0 / UAX38 revision 39', file: 'tr38-17.html',
        url: 'https://www.unicode.org/reports/tr38/tr38-39.html',
        licenseId: 'Unicode-3.0', licenseTextPath: 'data/licenses/Unicode-3.0.txt', usageScope: 'Reference for locked Unihan 17 field semantics' },
];

fs.mkdirSync(cache, { recursive: true });
function download(url, file, expectedHash) {
    const target = path.join(cache, file);
    if (updating || !fs.existsSync(target)) {
        const temporary = `${target}.partial`;
        execFileSync('curl', ['--fail', '--location', '--silent', '--show-error', '--retry', '2', '--max-time', '180', url, '-o', temporary], { stdio: 'inherit' });
        if (expectedHash && fileHash(temporary) !== expectedHash) {
            fs.rmSync(temporary); throw new Error(`Source changed: ${file}; use --refresh to review an upgrade`);
        }
        fs.renameSync(temporary, target);
    }
    if (expectedHash && fileHash(target) !== expectedHash) throw new Error(`Cached source hash mismatch: ${file}`);
    return target;
}
const previousSources = existing?.sources || [];
const sources = specifications.map(spec => {
    const previous = previousSources.find(s => s.id === spec.id);
    const target = download(spec.downloadUrl || spec.url, spec.file, updating ? null : previous?.sha256);
    return { ...spec, sha256: fileHash(target), bytes: fs.statSync(target).size,
        retrievedAt: !updating && previous ? previous.retrievedAt : new Date().toISOString(),
        rightsStatus: spec.licenseId === 'reference-only' ? 'reference-only' : 'licensed',
        decisionBasis: 'upstream-license-and-source-review', changeNotes: 'Bounded source extraction; see data/README.md' };
});
const { glyphs, legacy } = await coreInputs();
const selectedGlyphs = new Set(glyphs);
const words = new Set(legacy.map(c => c.word));
const allEntries = parseCedict(gunzipSync(fs.readFileSync(path.join(cache, 'cedict.gz'))).toString('utf8'));
const text = gunzipSync(fs.readFileSync(path.join(cache, 'cedict.gz'))).toString('utf8');
sources.find(s => s.id === 'cedict').version = text.match(/^#! date=(.+)$/m)?.[1].trim() || (() => { throw new Error('Missing CEDICT release date'); })();
const scope = readJSON('data/pinyin/scope.json');
const syllables = new Set(scope.rows.flatMap(row => row.split(' ')));
const examples = new Map();
for (const e of allEntries) {
    const numeric = normalizePinyin(e.pinyin);
    const match = numeric.match(/^([a-zü]+)([1-5])$/);
    if ([...e.simplified].length !== 1 || !match || !syllables.has(match[1])) continue;
    // Select an attested character example per tone, prefer common core entries and non-variant senses.
    const score = (selectedGlyphs.has(e.simplified) ? 100 : 0) + (e.senses.some(s => /dialect|archaic|variant of|surname|old variant/i.test(s)) ? 0 : 10);
    if (!examples.has(numeric) || score > examples.get(numeric).score) examples.set(numeric, { e, score });
}
const selectedLocators = new Set([...examples.values()].map(x => x.e.sourceLocator));
const selectedEntries = allEntries.filter(e => selectedGlyphs.has(e.simplified) || words.has(e.simplified) || selectedLocators.has(e.sourceLocator));
writeJSON('data/source-extracts/cedict.json', selectedEntries);
writeJSON('data/source-extracts/pinyin-examples.json', [...examples.entries()].map(([numeric, { e }]) => ({ numeric, glyph: e.simplified, sourceLocator: e.sourceLocator })));

const unihan = {};
const fields = new Set(['kTraditionalVariant', 'kSimplifiedVariant', 'kRSUnicode', 'kTotalStrokes', 'kAlternateTotalStrokes', 'kJoyoKanji', 'kJapaneseKun', 'kJapaneseOn', 'kJapanese', 'kMandarin']);
// Include only the directly linked variants as evidence, without expanding the core set.
const unzip = file => execFileSync('unzip', ['-p', path.join(cache, 'Unihan-17.0.0.zip'), file], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const variantText = unzip('Unihan_Variants.txt');
const evidenceGlyphs = new Set(glyphs);
for (const line of variantText.split('\n')) {
    const [cp, field, value] = line.split('\t');
    if (!cp?.startsWith('U+') || !['kTraditionalVariant', 'kSimplifiedVariant'].includes(field)) continue;
    if (selectedGlyphs.has(String.fromCodePoint(parseInt(cp.slice(2), 16)))) {
        for (const v of value.matchAll(/U\+([0-9A-F]+)/g)) evidenceGlyphs.add(String.fromCodePoint(parseInt(v[1], 16)));
    }
}
for (const file of ['Unihan_Variants.txt', 'Unihan_IRGSources.txt', 'Unihan_OtherMappings.txt', 'Unihan_Readings.txt', 'Unihan_DictionaryLikeData.txt']) {
    const sourceText = file === 'Unihan_Variants.txt' ? variantText : unzip(file);
    for (const [index, line] of sourceText.split('\n').entries()) {
        const [cp, field, value] = line.split('\t');
        if (!cp?.startsWith('U+') || !fields.has(field)) continue;
        const glyph = String.fromCodePoint(parseInt(cp.slice(2), 16));
        if (!evidenceGlyphs.has(glyph)) continue;
        (unihan[glyph] ||= {})[field] = { value, sourceLocator: `${file}:line:${index + 1}:${cp}:${field}` };
    }
}
writeJSON('data/source-extracts/unihan.json', unihan);
const components = fs.readFileSync(path.join(cache, 'mmh-dictionary.txt'), 'utf8').trim().split('\n').flatMap((line, i) => {
    const d = JSON.parse(line);
    return selectedGlyphs.has(d.character) ? [{ glyph: d.character, radical: d.radical, decomposition: d.decomposition, sourceLocator: `dictionary.txt:line:${i + 1}` }] : [];
});
writeJSON('data/source-extracts/components.json', components);
for (const glyph of glyphs) {
    const raw = execFileSync('tar', ['-xOf', path.join(cache, 'hanzi-writer-data-2.0.1.tgz'), `package/${glyph}.json`]);
    const target = path.join(root, `data/strokes/${glyph.codePointAt(0).toString(16)}.json`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, raw); // Unchanged source files preserve the original graphics dataset.
}
const licenses = [
    ['https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt', 'CC-BY-SA-4.0.txt', 'CC-BY-SA-4.0.txt'],
    ['https://www.unicode.org/license.txt', 'unicode-license.txt', 'Unicode-3.0.txt'],
    [`https://raw.githubusercontent.com/skishore/makemeahanzi/${commit}/COPYING`, 'mmh-COPYING', 'Make-Me-a-Hanzi-COPYING.txt'],
    [`https://raw.githubusercontent.com/skishore/makemeahanzi/${commit}/LGPL`, 'LGPL-3.0.txt', 'LGPL-3.0.txt'],
    ['https://raw.githubusercontent.com/spdx/license-list-data/v3.26.0/text/GPL-3.0-or-later.txt', 'GPL-3.0.txt', 'GPL-3.0.txt'],
];
fs.mkdirSync(path.join(root, 'data/licenses'), { recursive: true });
for (const [url, cached, target] of licenses) {
    const relative = `data/licenses/${target}`;
    const previousHash = updating ? null : existing?.licenses?.find(x => x.path === relative)?.sha256;
    fs.copyFileSync(download(url, cached, previousHash), path.join(root, relative));
}
fs.writeFileSync(path.join(root, 'data/licenses/Arphic-Public-License.txt'), execFileSync('tar', ['-xOf', path.join(cache, 'hanzi-writer-data-2.0.1.tgz'), 'package/APL/english/ARPHICPL.TXT']));
const licenseFiles = [...licenses.map(x => `data/licenses/${x[2]}`), 'data/licenses/Arphic-Public-License.txt'];
const extractPaths = ['cedict', 'pinyin-examples', 'unihan', 'components'].map(name => `data/source-extracts/${name}.json`);
const localPaths = ['characters.js', 'tts-corpus.js', 'audio-manifest.json', 'docs/hanzifun-rebuild/archive/prototype/data.mjs', 'data/pinyin/scope.json', 'data/editorial-decisions.json'];
const provenancePath = 'data/licenses/PROJECT-PROVENANCE.md';
fs.writeFileSync(path.join(root, provenancePath), '# Existing HanziFun project assets\n\nSelected legacy cards, prototype content and Tencent static TTS are reused within this project under the user-authorized HF-02 scope. This records project provenance, not an independent public license grant for the whole website. No credentials or new TTS calls are involved. Audio text, voice and individual SHA-256 remain recorded in audio-manifest.json.\n');
licenseFiles.push(provenancePath);
for (const [id, file, usageScope] of [
    ['legacy-cards', 'characters.js', 'Preserve 108 original teaching occurrences and legacy phrases'],
    ['legacy-tts', 'audio-manifest.json', 'Reuse existing project static audio with original text and voice; no new synthesis; listening review required'],
    ['prototype', 'docs/hanzifun-rebuild/archive/prototype/data.mjs', 'Core membership and attributed draft educational content from preserved project prototype']
]) sources.push({ id, publisher: 'HanziFun project', version: fileHash(file).slice(0, 12), file,
    url: `project:${file}`, licenseId: 'Project-existing-assets', licenseTextPath: provenancePath,
    usageScope, sha256: fileHash(file), bytes: fs.statSync(path.join(root, file)).size,
    retrievedAt: existing?.sources.find(s => s.id === id)?.retrievedAt || new Date().toISOString(),
    rightsStatus: 'approved-with-scope', decisionBasis: 'user-authorized-existing-project-reuse', changeNotes: 'Local source unchanged; preserve original semantics' });
const lock = { lockVersion: 1, sources,
    licenses: licenseFiles.map(p => ({ path: p, sha256: fileHash(p) })),
    strokeFiles: glyphs.map(g => { const p = `data/strokes/${g.codePointAt(0).toString(16)}.json`; return { path: p, sha256: fileHash(p) }; }),
    extracts: extractPaths.map(p => ({ path: p, sha256: fileHash(p) })),
    localInputs: localPaths.map(p => ({ path: p, sha256: fileHash(p) })),
    hskPolicy: { rightsStatus: 'approved-with-scope', decisionBasis: 'user-confirmed-scope', usageScope: 'Headwords, edition, level and list membership only; no official definitions/examples/layout; not a third-party license', importStatus: 'contract-only-HF-07' } };
writeJSON('data/sources.lock.json', lock);
if (updating && existing) writeJSON('data/reports/source-upgrade.json', { before: existing, after: lock, reviewStatus: 'pending', note: 'Review source hashes, field changes, licensing and normalized diff before accepting this upgrade.' });
console.log(`Extracted ${glyphs.length} core glyphs, ${selectedEntries.length} dictionary rows, ${examples.size} pinyin tone examples. Raw archives remain in .cache/hf02/.`);
