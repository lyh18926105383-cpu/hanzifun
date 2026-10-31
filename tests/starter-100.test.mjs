import test from 'node:test';
import assert from 'node:assert/strict';
import {starter,validateStarter100,starter100Page} from '../site/pages/starter-100.mjs';
import {learningData} from '../site/learning-data.mjs';
import {resolveRoutePolicy} from '../site/routes.mjs';
test('HF14 thematic starter contains exactly 100 reviewed core characters with stable practice identities',()=>{
 const ids=validateStarter100(),library=learningData();assert.equal(ids.length,100);for(const id of ids)assert.ok(library.catalog.some(c=>c.characterId===id));
 const page=starter100Page();assert.equal((page.content.match(/<a lang="zh-CN" href="\/dictionary\/[^/]+\/"/g)||[]).length,100);assert.match(page.content,/not a frequency ranking/);assert.match(page.content,/CC BY-SA 4.0/);assert.equal(resolveRoutePolicy(page.path).status,'published');
});
test('HF14 rejects duplicate, missing and unreviewed characters in the starter selection',()=>{
 for(const mutate of [s=>s.groups[0].characterIds.pop(),s=>s.groups[0].characterIds[0]=s.groups[1].characterIds[0],s=>s.groups[0].characterIds[0]='char:ffff']){const value=structuredClone(starter);mutate(value);assert.throws(()=>validateStarter100(value));}
});
