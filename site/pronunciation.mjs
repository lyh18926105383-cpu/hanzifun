import fs from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync(new URL('../data/audio/pronunciation.json',import.meta.url),'utf8'));
const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pronunciationManifest=manifest;
export function pronunciationButton(text,{numeric='',label='Listen',readingId=''}={}){
 const key=numeric.toLowerCase().replaceAll('u:','v').replaceAll('ü','v');
 const record=manifest.syllables[key]||manifest.utterances[createHash('sha256').update(text).digest('hex').slice(0,24)];
 const example=!!numeric&&record?.kind==='browser-speech';
 const speech=record?.text||text;
 return `<button type="button" class="pronunciation-button" data-pronunciation data-speech-text="${e(speech)}" data-audio-url="${e(record?.url?'/'+record.url:'')}" data-pronunciation-reading="${e(readingId)}" data-pronunciation-kind="${e(record?.kind||'browser-speech')}" aria-label="${e(label)}: ${e(example?speech:text)}" aria-pressed="false"><span aria-hidden="true">▶</span> ${e(example?'Hear example: '+speech:label)}</button>`;
}
export const pronunciationFooter='<div class="pronunciation-tools"><button type="button" data-pronunciation-stop>Stop audio</button><p role="status" aria-live="polite" data-pronunciation-status></p><p class="muted">Recorded syllables play directly. Other examples use your device’s Mandarin voice; example speech and neutral tones depend on context. <a href="/data-sources/">Audio sources</a></p></div><script type="module" src="/site-assets/pronunciation.mjs"></script>';
