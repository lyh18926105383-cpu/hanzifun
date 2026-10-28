import test from 'node:test';
import assert from 'node:assert/strict';
import {adsTxt} from '../site/adsense.mjs';
import {editorialHtml} from '../site/editorial-content.mjs';
import {parse} from 'parse5';
function visible(n){if(['script','style','nav','button'].includes(n.tagName))return '';return n.nodeName==='#text'?n.value:(n.childNodes||[]).map(visible).join(' ');}
test('ads.txt requires a real-shaped account ID and never publishes a placeholder by default',()=>{
 assert.equal(adsTxt(),null);
 for(const id of ['pub-0000000000000000','ca-pub-1234567890123456','pub-123','pub-1234567890123456\nother.example'])assert.throws(()=>adsTxt(id));
 // Synthetic fixture only: this value is never written to a production configuration.
 assert.equal(adsTxt('pub-1234567890123456'),'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
});
test('finished lessons contain substantive static prose, working audio bindings and answerable checks',()=>{
 for(const f of ['kuai.html','liu.html','xing.html','scenarios.html','study-routine.html','confusions.html']){
  const html=editorialHtml(f),words=visible(parse(html)).match(/\b[A-Za-z]+(?:['’-][A-Za-z]+)*\b/g)||[];
  assert.ok(words.length>=800&&words.length<=1500,`${f}: ${words.length} English words`);
  assert.doesNotMatch(html,/\{\{audio:/);
  assert.ok((html.match(/<details>/g)||[]).length>=3,f);
  if(['kuai.html','liu.html','xing.html'].includes(f))assert.equal((html.match(/data-pronunciation /g)||[]).length,3);
 }
});
