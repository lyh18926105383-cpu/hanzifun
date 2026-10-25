import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const require = createRequire(import.meta.url);
export const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
export const fileHash = file => sha256(fs.readFileSync(path.resolve(root, file)));
export const characterId = glyph => `char:${glyph.codePointAt(0).toString(16)}`;
export const hexString = value => [...value].map(c => c.codePointAt(0).toString(16)).join('-');
export const wordId = glyph => `word:${hexString(glyph)}`;
export function writeJSON(file, value, outputRoot = root) {
    const target = path.resolve(outputRoot, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

export async function coreInputs() {
    const legacy = require(path.join(root, 'characters.js'));
    const { characters: prototype } = await import(path.join(root, 'docs/hanzifun-rebuild/archive/prototype/data.mjs'));
    const glyphs = [...new Set([...legacy, ...prototype].map(c => c.char))];
    if (legacy.length !== 108 || new Set(legacy.map(c => c.char)).size !== 107 || glyphs.length !== 126) {
        throw new Error('Core input changed: expected 108 occurrences / 107 legacy / 126 union');
    }
    // Read group comments rather than assuming six cards in every future group.
    let group, indexInGroup = 0;
    const positions = [];
    for (const line of fs.readFileSync(path.join(root, 'characters.js'), 'utf8').split('\n')) {
        const heading = line.match(/^\s*\/\/\s*(\d+-\d+)\s*$/);
        if (heading) { group = heading[1]; indexInGroup = 0; }
        if (/\{ char:/.test(line)) {
            positions.push({ group, indexInGroup: ++indexInGroup });
        }
    }
    if (positions.length !== legacy.length) throw new Error('Unrecognized legacy layout');
    return { legacy, prototype, glyphs, positions };
}

export function parseCedict(text) {
    const entries = [];
    for (const [index, line] of text.split(/\r?\n/).entries()) {
        if (!line.trim() || line.startsWith('#')) continue;
        const m = line.match(/^(\S+) (\S+) (\[\[?)(.+?)(\]\]?) \/(.+)\/$/);
        if (!m || m[3].length !== m[5].length) throw new Error(`Invalid CEDICT line ${index + 1}`);
        entries.push({ traditional: m[1], simplified: m[2], pinyin: m[4],
            senses: m[6].split('/'), format: m[3].length === 2 ? 'v2' : 'v1',
            sourceLocator: `cedict_ts.u8:line:${index + 1}`, raw: line });
    }
    return entries;
}

export function normalizePinyin(input) {
    return input.normalize('NFC').toLowerCase().replaceAll('u:', 'ü').replaceAll('v', 'ü').trim().replace(/\s+/g, ' ');
}
const marks = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
export function markSyllable(input) {
    const m = normalizePinyin(input).match(/^([a-züê]+)([1-5])$/);
    if (!m) throw new Error(`Invalid numbered syllable: ${input}`);
    const [, base, toneText] = m;
    const tone = Number(toneText);
    if (tone === 5) return base;
    let index = base.indexOf('a');
    if (index < 0) index = base.indexOf('e');
    if (index < 0 && base.includes('ou')) index = base.indexOf('o');
    if (index < 0) index = [...base].findLastIndex(c => 'iouü'.includes(c));
    if (index < 0) throw new Error(`No supported tone-bearing vowel: ${input}`);
    return base.slice(0, index) + marks[base[index]][tone - 1] + base.slice(index + 1);
}
export function pinyinForms(input) {
    const numeric = normalizePinyin(input);
    const tokens = numeric.match(/[a-züê]+[1-5]/g) || [];
    if (!tokens.length) throw new Error(`No pinyin tokens: ${input}`);
    // This pipeline deliberately selects v1 rows; v2 parsing remains supported for future imports.
    const marked = numeric.replace(/[a-züê]+[1-5]/g, markSyllable);
    const plain = numeric.replace(/[1-5]/g, '');
    return { numeric, marked, plain,
        search: [...new Set([numeric, marked, plain, plain.replaceAll('ü', 'v'), plain.replaceAll('ü', 'u:')])],
        syllables: tokens };
}
export function splitSyllable(base) {
    const zeroY = { yi: 'i', ya: 'ia', yo: 'io', ye: 'ie', yao: 'iao', you: 'iou', yan: 'ian', yin: 'in', yang: 'iang', ying: 'ing', yong: 'iong', yu: 'ü', yue: 'üe', yuan: 'üan', yun: 'ün' };
    const zeroW = { wu: 'u', wa: 'ua', wo: 'uo', wai: 'uai', wei: 'uei', wan: 'uan', wen: 'uen', wang: 'uang', weng: 'ueng' };
    if (zeroY[base] || zeroW[base]) return { initial: '', final: zeroY[base] || zeroW[base], orthographicOnset: base[0] };
    const initial = base.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/u)?.[0] || '';
    let final = base.slice(initial.length);
    if ('jqx'.includes(initial) && initial && final.startsWith('u')) final = `ü${final.slice(1)}`;
    final = ({ iu: 'iou', ui: 'uei', un: 'uen' })[final] || final;
    return { initial, final, orthographicOnset: initial };
}
export function validateStroke(stroke) {
    if (!Array.isArray(stroke.strokes) || stroke.strokes.length === 0 || !Array.isArray(stroke.medians) || stroke.strokes.length !== stroke.medians.length) {
        throw new Error('Stroke paths/medians count mismatch');
    }
    for (const d of stroke.strokes) {
        if (typeof d !== 'string' || !/^M\s*-?[\d.]/.test(d) || !/[zZ]\s*$/.test(d) || /NaN|Infinity/.test(d)) throw new Error('Invalid SVG stroke path');
    }
    for (const line of stroke.medians) {
        if (!Array.isArray(line) || line.length < 2 || line.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) throw new Error('Invalid stroke median');
    }
}

export function sourceReference(sourceReleaseId, sourceLocator) { return { sourceReleaseId, sourceLocator }; }

export function parseRegionalStrokeCounts(value, sourceLocator) {
    if (!value || value === '-') return [];
    return value.split(' ').map(token => {
        const m = token.match(/^(\d+):([BGHJKMPSTUV]+)$/);
        if (!m) throw new Error(`Invalid regional stroke count: ${token}`);
        return { count: Number(m[1]), irgSources: m[2], evidence: sourceReference('unihan', sourceLocator) };
    });
}
