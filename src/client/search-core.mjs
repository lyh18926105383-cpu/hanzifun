// Shared by the static builder and browser. Preserve ü; a tone mark becomes a digit.
export function normalizeQuery(input) {
  const text = String(input ?? '').normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
  if ([...text].length > 100 || /[\u0000-\u001f\u007f]/u.test(text)) return '';
  return text.replace(/u:/g, 'ü').replace(/v/g, 'ü').split(' ').map(word => {
    let tone = '';
    const stripped = word.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹ]/g, char => {
      const groups = ['āēīōūǖ', 'áéíóúǘń', 'ǎěǐǒǔǚň', 'àèìòùǜǹ'];
      tone = String(groups.findIndex(group => group.includes(char)) + 1);
      return char.normalize('NFD').replace(/[\u0300\u0301\u0304\u030c]/g, '').normalize('NFC');
    });
    return tone && !/[1-5]$/.test(stripped) ? stripped + tone : stripped;
  }).join(' ');
}
export function searchEntries(entries, input, { relaxTone = false } = {}) {
  let query = normalizeQuery(input);
  if (!query) return [];
  if (relaxTone) query = query.replace(/[1-5]/g, '');
  const tonal = /[1-5]/.test(query);
  return entries.map(item => {
    const aliases = item.aliases.map(normalizeQuery);
    const exact = aliases.includes(query);
    const contains = !tonal && aliases.some(alias => alias.includes(query));
    return { item, score: exact ? (item.glyph === query ? 0 : 1) : contains ? 2 : 99 };
  }).filter(result => result.score < 99).sort((a,b) => a.score-b.score || a.item.id.localeCompare(b.item.id)).map(result => result.item);
}
export function supportedCharacter(value, glyphs) {
  return typeof value === 'string' && [...value].length === 1 && glyphs.includes(value) ? value : null;
}
