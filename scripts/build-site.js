const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.resolve(process.env.HF_BUILD_OUTPUT_DIR || path.join(projectRoot, 'dist'));
const siteRoot = path.join(projectRoot, 'site');
const publicFiles = [
    'styles.css',
    'story.css',
    'app.js',
    'story.js',
    'characters.js',
    'storage.js',
    'lessons.js',
    'tts-corpus.js',
    'audio.js',
    'audio-manifest.json',
    '工具头像.png',
];

function ensureSafeOutput() {
    if (outputRoot === projectRoot || outputRoot === path.join(projectRoot, '.git')) {
        throw new Error('Refusing to use a project-sensitive directory as the build output.');
    }
    const relative = path.relative(projectRoot, outputRoot);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return;
    }
    if (relative === '' || relative === 'node_modules') {
        throw new Error('Refusing to clear an unsafe build output: ' + outputRoot);
    }
}

function copyFile(relativePath) {
    const source = path.join(projectRoot, relativePath);
    const destination = path.join(outputRoot, relativePath);
    if (!fs.existsSync(source)) throw new Error('Missing site asset: ' + relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

function copyDirectory(relativePath, filter) {
    const source = path.join(projectRoot, relativePath);
    const destination = path.join(outputRoot, relativePath);
    if (!fs.existsSync(source)) throw new Error('Missing site directory: ' + relativePath);
    fs.cpSync(source, destination, {
        recursive: true,
        filter: currentPath => {
            if (fs.statSync(currentPath).isDirectory()) return true;
            return filter(currentPath);
        },
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

function routeFilePath(pathname) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        throw new Error('Malformed URL encoding in local link: ' + pathname);
    }
    if (decoded.split('/').includes('..')) throw new Error('Path traversal in local link: ' + pathname);
    if (decoded === '/') return path.join(outputRoot, 'index.html');
    const relative = decoded.replace(/^\/+/, '');
    return path.join(outputRoot, relative.endsWith('/') ? relative + 'index.html' : relative);
}

function assertLocalReferences(html, pagePath) {
    const reference = /\b(?:href|src|action)="([^"]+)"/g;
    for (const match of html.matchAll(reference)) {
        const raw = match[1];
        if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') ||
            raw.startsWith('javascript:') || raw.startsWith('//')) continue;
        let url;
        try {
            url = new URL(raw, 'https://hanzifun.invalid' + pagePath);
        } catch {
            throw new Error('Invalid link in ' + pagePath + ': ' + raw);
        }
        if (url.origin !== 'https://hanzifun.invalid') continue;
        const target = routeFilePath(url.pathname);
        if (!fs.existsSync(target)) {
            throw new Error('Broken local link/resource from ' + pagePath + ': ' + raw + ' -> ' + target);
        }
    }
}

function replacePrototypeAssets(html) {
    return html
        .replaceAll('/assets/seal.svg', '/site-assets/seal.hf03-v1.svg')
        .replaceAll('/assets/hero.png', '/site-assets/hero.hf03-v1.jpg')
        .replaceAll('/assets/audiences.png', '/site-assets/audiences.hf03-v1.jpg')
        .replaceAll('/assets/festival.png', '/site-assets/festival.hf03-v1.jpg')
        .replaceAll('/legacy/story.html?lesson=', '/story.html?lesson=')
        .replaceAll('/legacy/index.html', '/zh/');
}

function htmlForPage(layout, page, route, header, footer) {
    const robots = route.robots === 'inherit' ? '' :
        '<meta name="robots" content="' + escapeHtml(route.robots) + '">';
    const canonical=page.canonical ? '<link rel="canonical" href="'+escapeHtml(page.canonical)+'">' : '';
    let html = layout
        .replaceAll('{{lang}}', escapeHtml(page.lang || 'en'))
        .replaceAll('{{title}}', escapeHtml(page.title))
        .replaceAll('{{description}}', escapeHtml(page.description || page.title))
        .replaceAll('{{robots}}', robots+canonical)
        .replaceAll('{{seo}}', page.structuredData || '')
        .replaceAll('{{pageHead}}', page.head || '')
        .replaceAll('{{bodyClass}}', escapeHtml(page.bodyClass || ''))
        .replaceAll('{{header}}', page.header || header())
        .replaceAll('{{content}}', page.content)
        .replaceAll('{{footer}}', page.footer || footer());
    html = replacePrototypeAssets(html);
    if ((html.match(/<h1(?:\s|>)/gi) || []).length !== 1) {
        throw new Error('Expected exactly one H1 on ' + page.path);
    }
    if (route.robots !== 'inherit' && !html.includes('<meta name="robots" content="' + route.robots + '">')) {
        throw new Error('Route release policy was not rendered into the head: ' + page.path);
    }
    return html;
}

function outputPath(routePath) {
    if (routePath === '/') return 'index.html';
    if (routePath.endsWith('.html')) return routePath.slice(1);
    return routePath.slice(1) + 'index.html';
}

function writeRoutePage(routePath, html) {
    const destination = path.join(outputRoot, outputPath(routePath));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, html);
}

function coreCharacters() {
    const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/core-manifest.json'), 'utf8'));
    if (!Array.isArray(manifest.characterIds)) throw new Error('Invalid core character manifest.');
    const characters = manifest.characterIds.map(id => {
        const match = /^char:([0-9a-f]{4,6})$/i.exec(id);
        if (!match) throw new Error('Invalid stable character ID: ' + id);
        return String.fromCodePoint(parseInt(match[1], 16));
    });
    if (characters.length !== 126 || new Set(characters).size !== characters.length) {
        throw new Error('Expected the controlled 126-character route set.');
    }
    return characters;
}

function makeLegacyChineseEntry() {
    let html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
    if (!/<head>/i.test(html)) throw new Error('Chinese index.html has no head element.');
    html = html.replace(/<head>/i, '<head>\n    <base href="/">');
    return html;
}

function makeLegacyStoryPage() {
    return fs.readFileSync(path.join(projectRoot, 'story.html'), 'utf8')
        .replaceAll('href="index.html"', 'href="/zh/"')
        .replaceAll('href="/index.html"', 'href="/zh/"');
}

function makeSitemap(manifest, release) {
    const published = manifest.routes.filter(route =>
        route.indexing === 'index' && route.output && route.path.startsWith('/')
    );
    if (!published.length) {
        return '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
    }
    if (!release.siteOrigin) {
        throw new Error('Set siteOrigin before publishing indexable routes.');
    }
    const origin = release.siteOrigin.replace(/\/+$/, '');
    const urls = published.map(route =>
        '  <url><loc>' + escapeHtml(new URL(route.path, origin).href) + '</loc></url>'
    ).join('\n');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls +
        '\n</urlset>\n';
}

async function buildSite() {
    ensureSafeOutput();
    fs.rmSync(outputRoot, { recursive: true, force: true });
    fs.mkdirSync(outputRoot, { recursive: true });

    for (const file of publicFiles) copyFile(file);
    copyDirectory('audio/tts-v1', currentPath => currentPath.endsWith('.mp3'));
    copyDirectory('assets', currentPath => path.basename(currentPath) !== '.DS_Store');
    fs.cpSync(path.join(projectRoot, 'public/site-assets'), path.join(outputRoot, 'site-assets'), {
        recursive: true,
        filter: currentPath => path.basename(currentPath) !== '.DS_Store',
    });

    const { characters, decks, names, articles, stories } = await import('../site/data.mjs');
    const { header, footer, renderPages, journal } = await import('../site/site.mjs');
    const { createSupportPages, createCharacterStub, createContractFallback } =
        await import('../site/pages/route-stubs.mjs');
    const routesModule = await import('../site/routes.mjs');
    const {starter100Page}=await import('../site/pages/starter-100.mjs');
    const editorial = await import('../site/editorial-content.mjs');
    const {blogFeed} = await import('../site/pages/blog.mjs');
    const workflow = await import('../site/editorial-workflow.mjs');
    workflow.validateEditorial(undefined,{release:routesModule.releaseConfig});
    workflow.validateWorksheets();
    const {trustPages} = await import('../site/pages/trust.mjs');
    const {adsTxt} = await import('../site/adsense.mjs');
    const publisher = JSON.parse(fs.readFileSync(path.join(siteRoot,'publisher.json'),'utf8'));
    const authorizedSeller = adsTxt(publisher.adsensePublisherId);
    if (authorizedSeller) fs.writeFileSync(path.join(outputRoot,'ads.txt'),authorizedSeller);

    const assetSources = [
        ['site/public/site-styles.css', 'site-styles.hf03-v1.css'],
        ['src/client/site-preview.js', 'site-preview.hf03-v1.js'],
        ['src/client/navigation.mjs', 'navigation.hf03-v1.mjs'],
    ];
    for (const [sourcePath, outputName] of assetSources) {
        fs.copyFileSync(path.join(projectRoot, sourcePath), path.join(outputRoot, 'site-assets', outputName));
    }
    const safeArticles=workflow.editorialContent.articles.filter(workflow.publicArticle).map(a=>({slug:a.slug,title:a.title,category:a.category,chars:a.characterIds.map(id=>String.fromCodePoint(parseInt(id.slice(5),16))),keywords:a.title}));
    const browserData = { characters, decks, names, articles:safeArticles, stories };
    fs.writeFileSync(
        path.join(outputRoot, 'site-assets/site-data.hf03-v1.js'),
        'window.HANZIFUN = ' + JSON.stringify(browserData) + ';\n'
    );


    const seo = await import('../site/seo.mjs');
    const environment = seo.buildEnvironment();
    const home = fs.readFileSync(path.join(siteRoot, 'pages/home.html'), 'utf8').replace('{{journal}}', editorial.guideCards()+workflow.articleCards(environment));
    const prototypePages = [
        {
            path: '/',
            title: 'Learn Chinese Characters Visually',
            description: 'Vivid Stories, Smart Flashcards & Real-Life Scenarios. Explore the HanziFun design preview.',
            content: home,
        },
        ...renderPages(),
    ];
    // Keep the archived 77-path inventory, while moving the printable page to its new address.
    const prototypePaths = prototypePages.map(page => page.path === '/worksheets/' ? '/kids/worksheets/' : page.path);
    const coreChars = coreCharacters();
    const hf07 = await import('../site/hsk-data.mjs');
    const tools = await import('../site/tools-integration.mjs');
    const integratedTools = tools.integrationPages();
    const {learningData} = await import('../site/learning-data.mjs');
    const learningLibrary=learningData();
    const manifest = routesModule.buildRouteManifest({
        prototypePaths,
        characters: coreChars,
        additionalCharacters: hf07.lexicon.characters.map(c=>c.glyph),
        additionalPaths: [...integratedTools.map(p=>p.path),...workflow.worksheetPages().map(p=>p.path),...editorial.guides.map(g=>g.path),...learningLibrary.decks.map(d=>'/flashcards/decks/'+d.slug+'/'),...hf07.scenarioData.scenarios.map(s=>s.path),'/academic/hsk-2/level-2/'],
        contract: routesModule.routeContract,
        release: routesModule.releaseConfig,
    });

    manifest.environment = environment;
    manifest.siteOrigin = routesModule.releaseConfig.siteOrigin;
    manifest.routes = manifest.routes.map(route=>seo.effectivePolicy(route,environment));
    const pages = new Map();
    const addPage = page => {
        if (pages.has(page.path)) throw new Error('Duplicate static route page: ' + page.path);
        pages.set(page.path, page);
    };
    prototypePages.forEach(addPage);
    createSupportPages().forEach(addPage);

    // HF-04 overrides only its scoped preview routes. Preserve the 77-path baseline.
    const dictionary = await import('../site/dictionary-data.mjs');
    const { dictionaryPages, sourcePage } = await import('../site/pages/dictionary.mjs');
    const { strokeOrderPage } = await import('../site/pages/stroke-order.mjs');
    const { pinyinChartPage } = await import('../site/pages/pinyin-chart.mjs');
    const { staticStrokeSvg } = await import('../site/components/stroke-order.mjs');
    const {hskPages,additionalCharacterPages} = await import('../site/pages/hsk.mjs');
    const {scenarioPages} = await import('../site/pages/scenarios.mjs');
    const pronunciation = await import('../site/pronunciation.mjs');
    [...hskPages(),...additionalCharacterPages(),...scenarioPages()].forEach(page=>pages.set(page.path,page));
    const hf04Pages = [...dictionaryPages(), sourcePage(), strokeOrderPage(), pinyinChartPage()];
    hf04Pages.forEach(page => pages.set(page.path, page));
    [starter100Page(),...trustPages(),...editorial.editorialPages(),...workflow.worksheetPages(),...workflow.editorialContent.articles.map(a=>workflow.articlePage(a,{environment}))].forEach(page=>pages.set(page.path,page));
    for(const [routePath,page] of pages) {
        const enriched=editorial.enrichCharacter(page);
        const character=/^\/dictionary\/([^/]+)\/$/.exec(routePath);
        if(character && !['pinyin','radicals','compare','top-100'].includes(character[1])) enriched.content=enriched.content.replace(/<h1\b/, '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/dictionary/">Dictionary</a> / <span lang="zh-CN">'+escapeHtml(character[1])+'</span></nav><h1');
        pages.set(routePath,enriched);
    }
    const writePublic = (relative, value) => {
        const destination = path.join(outputRoot, relative);
        fs.mkdirSync(path.dirname(destination), {recursive:true});
        fs.writeFileSync(destination, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value) + '\n');
    };
    writePublic('blog/feed.xml', blogFeed(editorial.guides, routesModule.releaseConfig.siteOrigin));
    writePublic('site-assets/blog.v1.mjs', fs.readFileSync(path.join(projectRoot,'src/client/blog.mjs'),'utf8'));
    for (const name of ['dictionary','search-core','stroke-order','learning-entry','audio-player']) {
        fs.copyFileSync(path.join(projectRoot,'src/client',name+'.mjs'), path.join(outputRoot,'site-assets',name+'.hf04-v1.mjs'));
    }
    const {learningPages} = await import('../site/pages/learning.mjs');
    learningPages().forEach(page => pages.set(page.path, page));
    integratedTools.forEach(page=>pages.set(page.path,page));
    writePublic('site-assets/tools/published-catalog.json',{items:(await import('../site/pages/cultural-tools.mjs')).publishedCatalog().items});
    for(const name of ['cultural-tools','teacher-decks','tools-entry'])writePublic('site-assets/tools/'+name+'.mjs',fs.readFileSync(path.join(projectRoot,'src/client',name+'.mjs'),'utf8'));
    writePublic('site-assets/hf06/learning-data.json', learningData());
    for (const [directory, names] of [
        ['learning', ['scheduler.mjs','events.mjs','session.mjs','repository.mjs','legacy-import.mjs','write-lock.mjs','identity.mjs']],
        ['client', ['flashcards.mjs','flashcards.css','guest-learning.mjs']],
    ]) for (const name of names) writePublic('site-assets/hf06/'+directory+'/'+name, fs.readFileSync(path.join(projectRoot,'src',directory,name),'utf8'));
    writePublic('site-assets/hf07.mjs',fs.readFileSync(path.join(projectRoot,'src/client/hf07.mjs'),'utf8'));
    for(const name of ['coverage.json','membership.json','lexicon.json','source-headwords.json']) writePublic('site-assets/hf07/'+name,fs.readFileSync(path.join(projectRoot,'data/hsk',name),'utf8'));
    writePublic('site-assets/hf07/build-hsk-data.mjs',fs.readFileSync(path.join(projectRoot,'scripts/build-hsk-data.mjs'),'utf8'));
    writePublic('site-assets/pronunciation.mjs',fs.readFileSync(path.join(projectRoot,'src/client/pronunciation.mjs'),'utf8'));
    const seenAudio=new Set();
    for(const asset of [...Object.values(pronunciation.pronunciationManifest.syllables),...Object.values(pronunciation.pronunciationManifest.utterances)].filter(a=>a.url)){
        if(seenAudio.has(asset.url))continue;seenAudio.add(asset.url);
        const bytes=fs.readFileSync(path.join(projectRoot,asset.url));
        if(require('node:crypto').createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Pronunciation asset hash mismatch: '+asset.url);
        writePublic(asset.url,bytes);
    }
    const shards = dictionary.searchShards();
    shards.characters.push(...hf07.supplementalSearchEntries());
    for (const [name, entries] of Object.entries(shards)) writePublic('site-assets/search/'+name+'.hf04-v1.json', entries);
    const library = [
        ...integratedTools.map(p=>({id:'tool:'+p.path,type:'Scenarios & articles',label:p.title,url:p.path,aliases:[p.title,p.description||'']})),
        ...decks.map(d=>({id:'deck:'+d.slug,type:'Flashcard sets',label:d.title,url:'/flashcards/decks/'+d.slug+'/',aliases:[d.title,d.description,...d.chars]})),
        ...safeArticles.map(a=>({id:'article:'+a.slug,type:'Scenarios & articles',label:a.title,url:'/blog/'+a.slug+'/',aliases:[a.title,a.category,...a.chars]})),
        ...editorial.guides.map(g=>({id:'guide:'+g.path,type:'Scenarios & articles',label:g.title,url:g.path,aliases:[g.title,g.description]})),
        {id:'scenario:restaurant',type:'Scenarios & articles',label:'Restaurant',url:'/scenarios/travel/restaurant/',aliases:['restaurant','travel','food','water','水']},
        {id:'scenario:business',type:'Scenarios & articles',label:'Business icebreakers',url:'/scenarios/business/icebreakers/',aliases:['business','introductions','polite']}
    ];
    library.push(...hf07.scenarioData.scenarios.filter(s=>!['restaurant','icebreakers'].includes(s.id)).map(s=>({id:'scenario:'+s.id,type:'Scenarios & articles',label:s.title,url:s.path,aliases:[s.title,s.context,...s.sentences.flatMap(x=>x.tokens.map(t=>t[0]))]})),{id:'hsk-2-level-2',type:'Scenarios & articles',label:'HSK 2.0 level 2 core vocabulary',url:'/academic/hsk-2/level-2/',aliases:['HSK','level 2','vocabulary']});
    writePublic('site-assets/search/library.hf04-v1.json',library);
    const allStrokes=[...dictionary.strokes,...hf07.lexicon.strokes];
    const strokeManifest = allStrokes.map(asset=>({glyph:asset.glyph,codepoint:asset.characterId.slice(5),version:asset.sha256,strokeCount:asset.strokeCount}));
    writePublic('site-assets/dictionary/stroke-manifest.hf04-v1.json',strokeManifest);
    for (const asset of allStrokes) {
        // Raw paths stay in separate, unchanged per-character JSON files.
        writePublic('data/strokes/'+asset.characterId.slice(5)+'.json',fs.readFileSync(path.join(projectRoot,asset.url),'utf8'));
        writePublic('site-assets/stroke-static/'+asset.characterId.slice(5)+'.svg',staticStrokeSvg(asset.glyph,dictionary.readJson(asset.url)));
    }
    fs.cpSync(path.join(projectRoot,'data/licenses'),path.join(outputRoot,'site-assets/licenses'),{recursive:true});
    for (const relative of ['sources.lock.json','editorial-decisions.json','source-extracts/components.json','normalized/characters.json','normalized/readings.json','normalized/kanji.json','normalized/words.json']) {
        writePublic('site-assets/dictionary/'+relative,fs.readFileSync(path.join(projectRoot,'data',relative),'utf8'));
    }
    for (const name of ['build-data-foundation.mjs','data-foundation-lib.mjs']) writePublic('site-assets/dictionary/'+name,fs.readFileSync(path.join(projectRoot,'scripts',name),'utf8'));
    writePublic('site-assets/dictionary/review-summary.json',{
        coreCharacters:dictionary.characters.length,teachingDrafts:dictionary.editorial.entries.length,humanAcceptedCharacters:dictionary.characters.filter(c=>dictionary.contentAccepted(c.characterId)).length,verifiedKanji:dictionary.kanji.filter(k=>k.status==='verified').length,
        pinyinScope:dictionary.syllables.length,toneCandidates:dictionary.syllables.reduce((n,s)=>n+s.tones.length,0),approvedPinyinAudio:0,tier2Accepted:0,
        unresolved:['HF-02 human content acceptance','HF-02 pinyin teaching review','Audio listening and missing recordings','HF-07 supplemental teaching drafts and scenario listening review']
    });
    writePublic('content-manifest.json',{
        hf07:{version:'hf07-v1',pages:[...hskPages(),...additionalCharacterPages(),...scenarioPages()].map(page=>page.path),coreCharacters:126,additionalCharacters:hf07.lexicon.characters.length,sourceMappingComplete:true,teachingAcceptance:'pending',audioAcceptance:'pending',inputs:['data/hsk/source-headwords.json','data/hsk/membership.json','data/hsk/lexicon.json','data/scenarios/scenarios.json'].map(file=>({file,sha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(projectRoot,file))).digest('hex')}))},
        version:'hf04-v1',contentVersion:dictionary.readJson('data/core-manifest.json').version,
        pages:hf04Pages.map(page=>page.path),
        inputs:['data/editorial/characters.json','data/editorial/comparisons.json','data/editorial/review-decisions.json'].map(file=>({file,sha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(projectRoot,file))).digest('hex')}))
    });

    for (const character of coreChars) {
        const routePath = '/dictionary/' + character + '/';
        if (!pages.has(routePath)) addPage(createCharacterStub(character));
    }

    for (const [routePath, details] of Object.entries(routesModule.routeContract.routes || {})) {
        if (routePath.includes('{') || routePath.includes('?') || details.redirectTo || pages.has(routePath)) continue;
        addPage(createContractFallback(routePath, details.phase1));
    }

    const release = routesModule.releaseConfig;
    const layout = fs.readFileSync(path.join(siteRoot, 'layouts/base.html'), 'utf8');
    const concreteRoutes = new Map(manifest.routes.map(route => [route.path, route]));
    const generated = [];
    for (const page of pages.values()) {
        if (page.path === '/zh/') continue;
        const route = concreteRoutes.get(page.path);
        if (!route) throw new Error('No release manifest entry for page: ' + page.path);
        dictionary.assertPublicationReady(route, release);
        hf07.assertPublicationReady(route);
        seo.assertEditorialReady(route);
        const canonical=seo.canonicalUrl(page.path, release.siteOrigin);
        const prepared={...seo.withCoreSeo(page),canonical};
        if(prepared.content.includes('data-pronunciation'))prepared.content+=pronunciation.pronunciationFooter;
        prepared.structuredData=seo.structuredData(prepared,canonical,release.siteOrigin);
        const html = htmlForPage(layout, prepared, route, header, footer);
        writeRoutePage(page.path, html);
        generated.push({ path: page.path, html });
    }

    // The original Chinese app stays at /zh/ with its relative resources resolving
    // from the site root. The story player and its media keep their legacy URLs.
    const chineseEntry = makeLegacyChineseEntry().replace('\"url\": \"https://hanzifun.online\"','\"url\": \"'+release.siteOrigin+'/zh/\"').replace('</head>', '<link rel="canonical" href="'+escapeHtml(release.siteOrigin+'/zh/')+'">'+(environment==='production'?'':'<meta name="robots" content="noindex,follow">')+'</head>');
    const zhDestination = path.join(outputRoot, 'zh/index.html');
    fs.mkdirSync(path.dirname(zhDestination), { recursive: true });
    fs.writeFileSync(zhDestination, chineseEntry);
    const legacyStory = makeLegacyStoryPage();
    fs.writeFileSync(path.join(outputRoot, 'story.html'), legacyStory);

    generated.forEach(({ path: pagePath, html }) => assertLocalReferences(html, pagePath));
    assertLocalReferences(chineseEntry, '/');
    assertLocalReferences(legacyStory, '/story.html');


    fs.writeFileSync(path.join(outputRoot, 'route-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(path.join(outputRoot, 'robots.txt'), 'User-agent: *\nAllow: /\n'+(environment==='production'?'Sitemap: '+release.siteOrigin+'/sitemap.xml\n':''));
    fs.writeFileSync(path.join(outputRoot, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n'+(environment==='production'?'':'  X-Robots-Tag: noindex, follow\n'));
    // Candidate-only legacy mappings; production host checks remain HF-17/18.
    // /story is the Workers Assets normalized address for story.html; preserve its query.
    const movedRoutes = manifest.routes.filter(route=>route.redirectTo).map(route=>route.path+' '+route.redirectTo+' 301\n').join('');
    fs.writeFileSync(path.join(outputRoot, '_redirects'), '/index.html /zh/ 301\n/legacy/index.html /zh/ 301\n/legacy/story.html /story 301\n'+movedRoutes);
    fs.writeFileSync(path.join(outputRoot, 'sitemap.xml'), makeSitemap(manifest, release));

    const stylesheet = fs.readFileSync(path.join(outputRoot, 'site-assets/site-styles.hf03-v1.css'), 'utf8');
    for (const match of stylesheet.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/g)) {
        const raw = match[1];
        if (raw.startsWith('data:') || raw.startsWith('http:') || raw.startsWith('https:')) continue;
        const url = new URL(raw, 'https://hanzifun.invalid/site-assets/site-styles.hf03-v1.css');
        if (!fs.existsSync(routeFilePath(url.pathname))) throw new Error('Broken stylesheet asset: ' + raw);
    }

    const forbiddenNames = new Set(['.env', '.git', '.gitignore', '.DS_Store', 'docs', 'node_modules']);
    const queued = [outputRoot];
    let fileCount = 0;
    while (queued.length > 0) {
        const directory = queued.pop();
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (forbiddenNames.has(entry.name)) throw new Error('Forbidden deployment asset: ' + entry.name);
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) queued.push(entryPath);
            else fileCount += 1;
        }
    }

    const robotsPages = generated.filter(({ html }) => html.includes('<meta name="robots" content="noindex,follow">')).length;
    if (generated.some(({path:routePath,html}) => concreteRoutes.get(routePath).indexing === 'noindex' && !html.includes('<meta name="robots" content="noindex,follow">'))) {
        throw new Error('Preview routes must remain noindex,follow.');
    }
    if (manifest.prototypePathCount !== 77) throw new Error('The original prototype path count changed.');
    if (fs.existsSync(path.join(outputRoot, 'legacy'))) throw new Error('Do not publish a duplicate /legacy tree.');

    const {validateBuild}=await import('./validate-seo-quality.mjs');
    const seoReport=validateBuild(outputRoot);
    if(seoReport.errors.length)throw new Error('SEO quality gate failed:\n'+seoReport.errors.join('\n'));

    console.log('Built ' + fileCount + ' public files in ' + path.relative(projectRoot, outputRoot) +
        '/; mapped ' + manifest.prototypePathCount + ' prototype paths and generated ' +
        robotsPages + ' noindex preview pages.');
}

module.exports = { buildSite, makeSitemap };
if (require.main === module) {
    buildSite().catch(error => {
        console.error(error.stack || error);
        process.exitCode = 1;
    });
}
