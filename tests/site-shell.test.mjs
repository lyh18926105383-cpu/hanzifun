import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { footer, header, renderPages } from '../site/site.mjs';
import {
  buildRouteManifest,
  releaseConfig,
  resolveRoutePolicy,
  routeContract,
  staticOutputPath,
} from '../site/routes.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototypePaths = ['/', ...renderPages().map(page => page.path)];
const coreManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/core-manifest.json'), 'utf8'));
const coreCharacters = coreManifest.characterIds.map(id =>
  String.fromCodePoint(parseInt(id.slice('char:'.length), 16))
);
const routeManifest = buildRouteManifest({
  prototypePaths,
  characters: coreCharacters,
  contract: routeContract,
  release: releaseConfig,
});

test('the archived prototype path set remains 77 unique mapped routes', () => {
  assert.equal(prototypePaths.length, 77);
  assert.equal(new Set(prototypePaths).size, 77);
  assert.equal(routeManifest.prototypePathCount, 77);
  assert.equal(routeManifest.prototypePaths.length, 77);
  assert.ok(routeManifest.prototypePaths.every(route => route.output));
  assert.ok(routeManifest.routes.some(route => route.path === '/pinyin-chart/'));
  assert.ok(!routeManifest.prototypePaths.some(route => route.path === '/pinyin-chart/'));
});

test('release status controls noindex,follow for previews and planned pages', () => {
  const noindexRoutes = [
    '/',
    '/pinyin-chart/',
    '/blog/',
    '/blog/mid-autumn-festival-chinese-characters/',
    '/tools/chinese-name-generator/',
    '/tools/zodiac-elements-calculator/',
    '/account/',
    '/flashcards/my-words/',
    '/sign-in/',
    '/pricing/',
    '/dictionary/水/',
    '/academic/textbooks/',
  ];
  for (const routePath of noindexRoutes) {
    const route = resolveRoutePolicy(routePath,{...releaseConfig,routes:Object.fromEntries(noindexRoutes.map(p=>[p,'preview']))});
    assert.equal(route.indexing, 'noindex', routePath);
    assert.equal(route.robots, 'noindex,follow', routePath);
  }
  assert.deepEqual(resolveRoutePolicy('/zh/'), {
    status: 'legacy',
    indexing: 'inherit',
    robots: 'inherit',
  });
  assert.equal(resolveRoutePolicy('story.html?lesson={lessonId}').robots, 'inherit');
  assert.equal(resolveRoutePolicy('/ready-page/', {
    defaultStatus: 'published',
    statusPolicies: releaseConfig.statusPolicies,
  }).robots, 'index,follow');
});

test('controlled dictionary routes cover the HF-02 core set without opening arbitrary characters', () => {
  const coreRoutes = routeManifest.routes.filter(route =>
    route.sources.includes('core-character-manifest')
  );
  assert.equal(coreCharacters.length, 126);
  assert.equal(coreRoutes.length, 126);
  assert.ok(coreRoutes.every(route => route.robots === resolveRoutePolicy(route.path).robots));
  assert.ok(coreRoutes.some(route => route.path === '/dictionary/水/'));
  assert.ok(!coreRoutes.some(route => route.path === '/dictionary/狗/'));
  assert.equal(staticOutputPath('/dictionary/水/'), 'dictionary/水/index.html');
  assert.equal(staticOutputPath('/dictionary/{字}/'), null);
});

test('the homepage retains seven sections and the approved subtitle verbatim', () => {
  const home = fs.readFileSync(path.join(projectRoot, 'site/pages/home.html'), 'utf8');
  const text = home.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const subtitle = "Stop rote memorization. Whether you're raising bilingual kids, traveling/doing business in China, or studying for HSK, master Chinese characters effortlessly.";
  const sectionCount = (home.match(/<section\b/g) || []).length;
  const siteFooter = footer();
  const footerCount = (siteFooter.match(/<footer\b/g) || []).length;
  assert.equal(sectionCount, 6);
  assert.equal(footerCount, 1);
  assert.equal(sectionCount + footerCount, 7);
  assert.equal((siteFooter.match(/<div><h3>/g) || []).length, 4);
  assert.ok(text.includes(subtitle));
  const navigation = header();
  assert.ok(navigation.includes('href=\"/stroke-order/\"'));
  assert.ok(navigation.includes('href=\"/pinyin-chart/\"'));
  for (const route of ['/kids/', '/scenarios/', '/academic/', '/flashcards/']) {
    assert.ok(home.includes('href=\"' + route + '\"'), route);
  }
});

test('the shared layout uses versioned isolated assets and release-driven robots metadata', () => {
  const layout = fs.readFileSync(path.join(projectRoot, 'site/layouts/base.html'), 'utf8');
  assert.ok(layout.includes('{{robots}}'));
  assert.ok(layout.includes('{{description}}'));
  assert.ok(layout.includes('/site-assets/site-styles.hf03-v1.css'));
  assert.ok(layout.includes('/site-assets/site-preview.hf03-v1.js'));
  assert.ok(layout.includes('/site-assets/navigation.hf03-v1.mjs'));
  assert.ok(!layout.includes('href=\"/styles.css\"'));
  assert.ok(!layout.includes('src=\"/app.js\"'));

  const navigation = fs.readFileSync(path.join(projectRoot, 'src/client/navigation.mjs'), 'utf8');
  assert.ok(navigation.includes("event.key !== 'Escape'"));
  assert.ok(navigation.includes('menuButton.focus()'));
  assert.ok(navigation.includes('focusin'));
});

test('unknown paths use the real 404 asset instead of a single-page fallback', () => {
  const wrangler = fs.readFileSync(path.join(projectRoot, 'wrangler.toml'), 'utf8');
  assert.match(wrangler, /not_found_handling\s*=\s*\"404-page\"/);
  assert.doesNotMatch(wrangler, /single-page-application/);
  assert.ok(routeManifest.routes.some(route => route.path === '/404.html' && route.robots === 'noindex,follow'));
});
