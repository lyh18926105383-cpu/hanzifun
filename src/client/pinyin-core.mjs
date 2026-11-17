const toneMarks = ['\u0304', '\u0301', '\u030c', '\u0300'];
export function plainPinyin(value) {
  return String(value).normalize('NFD').replace(/[\u0304\u0301\u030c\u0300]/g, '').normalize('NFC').replace(/u:/gi, m => m[0] === 'U' ? 'Ü' : 'ü').replace(/v/gi, m => m === 'V' ? 'Ü' : 'ü');
}
export function markSyllable(value, tone) {
  const plain = plainPinyin(value).replace(/[0-5]$/, '');
  if (![1, 2, 3, 4].includes(Number(tone))) return plain;
  const lower = plain.toLowerCase();
  let index = lower.indexOf('a');
  if (index < 0) index = lower.indexOf('e');
  if (index < 0 && lower.includes('ou')) index = lower.indexOf('o');
  if (index < 0) for (let i = plain.length - 1; i >= 0; i--) if (/[iouü]/i.test(plain[i])) { index = i; break; }
  if (index < 0) return plain;
  return (plain.slice(0, index + 1) + toneMarks[Number(tone) - 1] + plain.slice(index + 1)).normalize('NFC');
}
export function numericSyllable(value, neutral = '5') {
  const decomposed = String(value).normalize('NFD');
  const marks = [...decomposed].filter(c => toneMarks.includes(c));
  if (marks.length > 1) return null;
  return plainPinyin(value) + (marks.length ? String(toneMarks.indexOf(marks[0]) + 1) : neutral);
}
export function pinyinQuery(value) {
  const raw = String(value).trim().normalize('NFC');
  const numeric = /[0-5]$/.exec(raw);
  const marked = [...raw.normalize('NFD')].find(c => toneMarks.includes(c));
  return {plain: plainPinyin(raw).replace(/[0-5]$/, '').toLowerCase(), tone: numeric ? Number(numeric[0]) || 5 : marked ? toneMarks.indexOf(marked) + 1 : null};
}
export function convertToneText(value, mode, inventory) {
  const valid = inventory ? new Set(inventory) : null;
  const unconverted = [];
  const known = word => !valid || valid.has(plainPinyin(word).toLowerCase());
  let text = String(value).normalize('NFC');
  if (mode === 'marks' || mode === 'plain') {
    text = text.replace(/([a-züv:]+)([0-9]+)/gi, (all, word, tone) => {
      if (!known(word) || !/^[0-5]$/.test(tone)) { unconverted.push(all); return all; }
      return mode === 'plain' ? plainPinyin(word) : markSyllable(word, Number(tone));
    });
  }
  if (mode !== 'marks') text = text.replace(/([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ:]+)([0-9]*)/gi, (all, word, existingTone) => {
    if (!known(word)) { if (/[\u0304\u0301\u030c\u0300]/.test(word.normalize('NFD'))) unconverted.push(word); return all; }
    if (existingTone && !/^[0-5]$/.test(existingTone)) { unconverted.push(all); return all; }
    if (mode === 'plain') return plainPinyin(word);
    if (existingTone) return plainPinyin(word) + (existingTone === '0' ? '5' : existingTone);
    const numeric = numericSyllable(word);
    if (!numeric) { unconverted.push(word); return word; }
    return numeric;
  });
  return {text, unconverted: [...new Set(unconverted)]};
}
export function formatHanziTokens(tokens, mode = 'marks', overrides = {}) {
  let previousChinese = false;
  return tokens.map((token, index) => {
    if (!token.isZh) { previousChinese = false; return token.origin; }
    const marked = overrides[index] || token.pinyin;
    const syllable = mode === 'numbers' ? numericSyllable(marked) : mode === 'plain' ? plainPinyin(marked) : marked;
    const prefix = previousChinese ? ' ' : '';
    previousChinese = true;
    return prefix + syllable;
  }).join('');
}
