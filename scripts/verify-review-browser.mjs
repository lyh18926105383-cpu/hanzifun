// Optional browser QA; no browser library enters production or npm dependencies.
// HF05_PLAYWRIGHT_MODULE may point at a host-provided Playwright ES module.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {chromium} = await import(process.env.HF05_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.HF05_PLAYWRIGHT_MODULE).href : 'playwright');
const allowed = new Set(['tests/fixtures/hf05-preview.html', 'src/client/flashcards.mjs', 'src/client/flashcards.css',
  'src/learning/scheduler.mjs', 'src/learning/events.mjs', 'src/learning/session.mjs']);
const server = http.createServer(async (request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname.slice(1);
  if (!allowed.has(name)) {response.writeHead(404).end(); return;}
  try {response.setHeader('Content-Type', name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : 'text/javascript');
    response.end(await fs.readFile(path.join(root, name)));} catch {response.writeHead(500).end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const output = process.env.HF05_EVIDENCE_DIR || await fs.mkdtemp(path.join(os.tmpdir(), 'hf05-browser-'));
try {
  await fs.mkdir(output, {recursive: true});
  browser = await chromium.launch({headless: true, ...(process.env.HF05_BROWSER_CHANNEL ? {channel: process.env.HF05_BROWSER_CHANNEL} : {})});
  const page = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tests/fixtures/hf05-preview.html`);
  const button = action => page.locator(`[data-action="${action}"]`);
  await button('flip').waitFor(); assert.equal(await button('familiar').isDisabled(), true);
  await button('flip').press('Enter'); await page.waitForFunction(() => hf05.controller.getState().saveState === 'saved');
  assert.equal(await button('familiar').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('1'); await page.waitForFunction(() => hf05.controller.getState().session.cursor === 1);
  await button('pause').click(); await page.waitForFunction(() => hf05.controller.getState().session.status === 'paused');
  await page.reload(); await button('resume').waitFor();
  assert.equal(await page.evaluate(() => hf05.controller.getState().session.cursor), 1);
  await button('resume').click(); await page.waitForFunction(() => !hf05.controller.getState().saving);
  await page.evaluate(() => {hf05.fail = true;});
  await button('flip').click(); await button('retry').waitFor();
  assert.match(await page.locator('[role="status"]').innerText(), /Not saved/);
  assert.equal(await button('familiar').isDisabled(), true);
  assert.equal(await button('retry').evaluate(el => el === document.activeElement), true);
  await page.screenshot({path: path.join(output, 'mobile-unsaved.png'), fullPage: true});
  await page.evaluate(() => {hf05.fail = false;});
  await button('retry').click(); await page.waitForFunction(() => hf05.controller.getState().saveState === 'saved');
  const retries = await page.evaluate(() => hf05.writes.slice(-2)); assert.deepEqual(retries[0], retries[1]);
  await page.keyboard.press('2'); await page.waitForFunction(() => hf05.controller.getState().session.status === 'complete');
  assert.match(await page.locator('h2').innerText(), /Practice complete/);
  assert.equal(await page.locator('h2').evaluate(el => el === document.activeElement), true);
  await page.reload(); await page.waitForFunction(() => window.hf05?.controller);
  const complete = await page.evaluate(() => hf05.controller.getState());
  assert.equal(complete.projection.completions.length, 1); assert.equal(complete.summary.practiced, 2); assert.equal(complete.summary.again, 1);
  const widths = [];
  for (const width of [360, 390, 768, 1100, 1440]) {
    await page.setViewportSize({width, height: 900});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    widths.push(width);
  }
  await page.screenshot({path: path.join(output, 'desktop-complete.png'), fullPage: true});
  assert.deepEqual(errors, []);
  const receipt = {date: '2026-10-25', browser: await browser.version(), syntheticFixture: true,
    checks: ['native Enter reveal', 'rating shortcut', 'focus', 'pause/reload/resume', 'failed save', 'same-transaction retry',
      'completion/reload idempotency', 'two cardIds / one characterId', 'no console errors', 'no horizontal overflow'], widths,
    practicedCharacters: new Set(Object.values(complete.projection.cards).map(c => c.characterId)).size,
    events: complete.projection.eventIds.length, sessions: complete.projection.completions.length};
  await fs.writeFile(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({passed: true, output, ...receipt}, null, 2));
} finally {await browser?.close(); await new Promise(resolve => server.close(resolve));}
