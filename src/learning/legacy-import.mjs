export const LEGACY_KEYS = ['hanzifun.learning.v1', 'hanzifun.story.v1', 'hanzifun.prototype.learning.v1'];
export const MAX_IMPORT_BYTES = 32 * 1024 * 1024;
export const canonical = value => JSON.stringify(sort(value));
function sort(value) {
  if (Array.isArray(value)) return value.map(sort);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])]));
  return value;
}
export function parseImport(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES) throw new Error('Import exceeds 32 MiB. Keep the original file.');
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object');
  const walk = (v, depth = 0) => {
    if (depth > 60) throw new Error('Import is too deeply nested');
    if (v && typeof v === 'object') for (const [k, child] of Object.entries(v)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) throw new Error('Unsafe import field');
      walk(child, depth + 1);
    }
  };
  walk(value); return value;
}
export async function previewLegacy({raw, sourceKey, sourceOrigin, catalog, lessonIds = [], crypto = globalThis.crypto}) {
  if (!LEGACY_KEYS.includes(sourceKey) || new URL(sourceOrigin).origin !== sourceOrigin) throw new Error('Select a supported source key and exact source origin');
  const value = parseImport(raw);
  const story = sourceKey === LEGACY_KEYS[1], prototype = sourceKey === LEGACY_KEYS[2];
  if ((!story && value.version !== 1) || (story && value.version !== undefined && value.version !== 1) || !Array.isArray(value.sessions) ||
    (!story && (!value.characters || typeof value.characters !== 'object' || Array.isArray(value.characters))) ||
    (prototype && !Array.isArray(value.saved))) throw new Error('Unsupported or damaged legacy schema; original preserved');
  if (value.sessions.some(s => !s || typeof s !== 'object' || (story ? typeof s.lessonId !== 'string' :
    prototype ? !Array.isArray(s.chars) || !Number.isFinite(s.count) || !Number.isFinite(s.again) :
    !Array.isArray(s.results) || s.results.some(r => typeof r.char !== 'string' || typeof r.status !== 'boolean')))) throw new Error('Invalid legacy session fields');
  for (const [glyph, stats] of Object.entries(value.characters || {})) {
    if (!glyph || !stats || typeof stats !== 'object' || (prototype ? typeof stats.known !== 'boolean' || !Number.isInteger(stats.attempts) || stats.attempts < 0 :
      ['seenCount','familiarCount','unfamiliarCount'].some(k => !Number.isSafeInteger(stats[k]) || stats[k] < 0))) throw new Error('Invalid legacy character summary');
  }
  if (prototype && value.saved.some(g => typeof g !== 'string')) throw new Error('Invalid saved characters');
  if(!crypto?.subtle)throw new Error('SHA-256 import preview requires HTTPS or localhost. Original records are untouched.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const payloadHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  const byGlyph = new Map(catalog.map(c => [c.front, c.characterId]));
  const glyphs = [...new Set([...Object.keys(value.characters || {}), ...(value.saved || []),
    ...(!story ? value.sessions.flatMap(s => prototype ? s.chars : s.results.map(r => r.char)) : [])])];
  const matched = glyphs.filter(g => byGlyph.has(g));
  const batchId = canonical([sourceKey, sourceOrigin, payloadHash, 1]);
  return {batchId, sourceKey, sourceOrigin, payloadHash, schemaVersion: 1, raw, type: 'LegacySnapshot',
    summary: {sessions: value.sessions.length, characters: Object.keys(value.characters || {}).length,
      note: 'Retained sessions and lifetime summaries overlap; never added together. No SRS stages inferred.'},
    characterIds: matched.map(g => byGlyph.get(g)),
    favorites: prototype ? [...new Set(value.saved.filter(g => byGlyph.has(g)).map(g => byGlyph.get(g)))] : [],
    unresolved: [...glyphs.filter(g => !byGlyph.has(g)), ...(story ? value.sessions.filter(s => !lessonIds.includes(s.lessonId)).map(s => s.lessonId) : [])],
    sessions: value.sessions, characters: value.characters || {}, story};
}
