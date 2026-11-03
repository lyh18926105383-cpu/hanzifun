import {editorialContent, publicArticle, articlePath} from '../editorial-workflow.mjs';
import {escapeHtml as e} from '../dictionary-data.mjs';

const asset = name => `/site-assets/blog/${name}.v1.jpg`;
const categories = [
  ['all', 'All articles'], ['characters', 'Character Stories'], ['hsk', 'HSK Prep'],
  ['culture', 'Chinese Culture'], ['study', 'Study Tips']
];
const presentation = {
  'mid-autumn-festival-chinese-characters': {category:'culture', image:'festival', alt:'Mooncakes and tea on a sunlit wooden table', minutes:6},
  'chinese-for-your-first-business-visit': {category:'culture', image:'tea', alt:'A traditional clay teapot on a bamboo table runner', minutes:7},
  'first-characters-for-bilingual-kids': {category:'characters', image:'archive', alt:'Chinese characters on paper beside traditional writing tools', minutes:6}
};
const label = category => categories.find(([id]) => id === category)?.[1] || 'Chinese Culture';
export function blogPosts(guides) {
  const articles = editorialContent.articles.filter(publicArticle).map(a => ({
    ...presentation[a.slug], category:presentation[a.slug]?.category || 'culture',
    image:presentation[a.slug]?.image || 'study', alt:presentation[a.slug]?.alt || 'Chinese study materials on a desk',
    minutes:presentation[a.slug]?.minutes || 6, path:articlePath(a), title:a.title,
    description:a.description, date:a.published || a.modified, feed:true
  }));
  const study = guides.map((g, i) => ({...g, category:'study', image:i ? 'calligraphy' : 'study',
    alt:i ? 'Traditional ink tools on textured rice paper' : 'An open notebook and character cards on a sunlit study desk',
    minutes:i ? 6 : 5, date:'2026-10-28', feed:true}));
  const hsk = {path:'/academic/hsk-2/level-2/', title:'Build your HSK vocabulary, one useful word at a time',
    description:'Explore 150 HSK 2.0 Level 2 vocabulary entries with pinyin, meanings and audio.',
    category:'hsk', image:'study', alt:'A notebook, study cards and tea ready for a focused learning session', minutes:null, feed:false};
  return {articles, study, hsk, all:[...articles, ...study, hsk]};
}
function photo(post, {eager=false, className=''}={}) {
  return `<img class="${className}" src="${asset(post.image)}" alt="${e(post.alt)}" width="1536" height="1024" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
}
const tag = post => `<span class="blog-tag blog-tag-${post.category}">${label(post.category)}</span>`;
const duration = post => post.minutes ? `${post.minutes} min read` : 'Vocabulary resource';
const arrow = '<span aria-hidden="true">↗</span>';
function card(post) {
  return `<article class="blog-card" data-blog-card data-category="${post.category}">
    <a class="blog-card-photo" href="${post.path}" tabindex="-1" aria-hidden="true">${photo(post)}</a>
    <div class="blog-card-body">${tag(post)}<h3><a href="${post.path}">${e(post.title)}</a></h3>
    <p>${e(post.description)}</p><div class="blog-card-meta"><span>${duration(post)}</span><span aria-hidden="true">↗</span></div></div></article>`;
}
export function blogPage(guides) {
  const {articles, study, hsk} = blogPosts(guides);
  const featured = articles[0] || study[0];
  const latest = [articles[2], hsk, articles[1], featured, ...study].filter(Boolean);
  const tips = [study[0], hsk, study[1]];
  const header = `<header class="site-header blog-header"><div class="nav-shell container">
    <a class="brand blog-brand" href="/" aria-label="HanziFun home"><span class="blog-seal" lang="zh-CN" aria-hidden="true">漢</span>HanziFun <span>Blog</span></a>
    <button type="button" class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">Menu <span aria-hidden="true">☰</span></button>
    <nav id="mobile-menu" class="desktop-nav primary-nav" aria-label="Main navigation"><a href="/flashcards/">Learn Chinese</a><a href="/dictionary/">Dictionary</a><a href="/tools/">Culture</a><a href="/blog/" aria-current="page">Blog</a></nav>
    <a class="blog-button blog-header-subscribe" href="#blog-subscribe" aria-label="Subscribe"><span class="blog-subscribe-label">Subscribe</span><span aria-hidden="true">→</span></a>
    </div></header>`;
  const footer = `<footer class="blog-footer"><div class="container"><a class="brand blog-brand" href="/"><span class="blog-seal" lang="zh-CN" aria-hidden="true">漢</span>HanziFun Blog</a><p>A small step into a richer language.</p><nav aria-label="Footer navigation"><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/data-sources/">Sources</a><a href="/blog/feed.xml">RSS</a></nav></div><div class="container blog-photo-credits">Photography: <a href="https://www.pexels.com/photo/brush-and-paint-for-hieroglyphs-writing-8627038/">Feng Zou / Pexels</a> · <a href="https://unsplash.com/photos/brown-teapot-on-stick-link-table-runner-1-L1ET2-kZ4">Y H / Unsplash</a> · Mooncake and study-desk images created with AI.</div></footer>`;
  const heroPhotos = [
    {image:'calligraphy',alt:'A traditional brush and inkstone in warm daylight'},
    {image:'festival',alt:'Mooncakes and porcelain tea on a wooden table'},
    {image:'study',alt:'A quiet study desk with a notebook and character cards'},
    {image:'archive',alt:'Chinese characters on paper beside traditional writing tools'},
    {image:'tea',alt:'A traditional clay teapot on a bamboo table runner'}
  ];
  return {
    path:'/blog/', title:'HanziFun Blog: Chinese Characters, Study Tips & Culture',
    description:'Discover Chinese character stories, practical study guides, HSK vocabulary and everyday Chinese culture.',
    bodyClass:'blog-page', header, footer,
    head:'<link rel="stylesheet" href="/site-assets/blog.v1.css"><link rel="alternate" type="application/rss+xml" title="HanziFun Blog" href="/blog/feed.xml">',
    content:`<div class="blog-journal">
      <section class="blog-hero" aria-labelledby="blog-title"><div class="blog-cloud" aria-hidden="true"></div>
        <div class="container"><p class="blog-eyebrow">Characters · Culture · Connection</p>
          <h1 id="blog-title">Every character<br><em>has a story.</em></h1>
          <p class="blog-hero-description">Explore Chinese characters, practical study tips, and the culture behind the words.</p>
          <div class="blog-photo-strip">${heroPhotos.map((p,i)=>photo(p,{eager:i===2,className:'blog-strip-photo blog-strip-photo-'+i})).join('')}</div>
        </div>
      </section>
      <div class="container blog-content">
        <form class="blog-toolbar" role="search" action="/search/" data-blog-controls>
          <fieldset class="blog-filters"><legend class="sr-only">Filter articles by category</legend>${categories.map(([id,name],i)=>`<label class="blog-filter blog-filter-${id}"><input type="radio" name="category" value="${id}" ${i===0?'checked':''} aria-controls="blog-articles"><span>${name}</span></label>`).join('')}</fieldset>
          <label class="blog-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><span class="sr-only">Search articles</span><input type="search" name="q" placeholder="Search articles" maxlength="100" data-blog-search></label>
          <noscript><button class="blog-button" type="submit">Search</button><p>All articles are listed below. Use site search to find a topic.</p></noscript>
        </form>
        <section class="blog-featured" aria-labelledby="blog-featured-title">
          <div><h2 id="blog-featured-title">Featured</h2><article class="blog-feature-card">
            <a class="blog-feature-photo" href="${featured.path}" tabindex="-1" aria-hidden="true">${photo(featured)}</a>
            <div class="blog-feature-body">${tag(featured)}<h3><a href="${featured.path}">${e(featured.title)}</a></h3><p>${e(featured.description)}</p>
              <div class="blog-feature-meta"><span>${duration(featured)}</span><a href="${featured.path}">Read the story ${arrow}</a></div></div>
          </article></div>
          <aside class="blog-reading" aria-labelledby="blog-reading-title"><h2 id="blog-reading-title">A little learning, every day</h2>
            <div class="blog-reading-list">${tips.map(p=>`<article class="blog-reading-item"><a href="${p.path}" class="blog-tip-photo" tabindex="-1" aria-hidden="true">${photo(p)}</a><div><h3><a href="${p.path}">${e(p.title)}</a></h3><div class="blog-tip-meta">${tag(p)}<span>${duration(p)}</span></div></div></article>`).join('')}</div>
            <section class="blog-subscribe" id="blog-subscribe" aria-labelledby="blog-subscribe-title"><span class="blog-envelope" aria-hidden="true">✉</span><div><h3 id="blog-subscribe-title">A fresh perspective, in your reader.</h3><p>Follow new articles with your favourite RSS reader.</p><a class="blog-button" href="/blog/feed.xml">Subscribe via RSS <span aria-hidden="true">→</span></a><button type="button" class="blog-copy-feed" data-copy-feed hidden>Copy feed link</button><p class="blog-feed-status" role="status" data-feed-status></p></div></section>
          </aside>
        </section>
        <section class="blog-latest" aria-labelledby="blog-latest-title"><div class="blog-section-heading"><h2 id="blog-latest-title">Latest Articles</h2><a href="#blog-articles" data-blog-reset>View all articles ${arrow}</a></div>
          <p class="blog-result-status sr-only" role="status" data-blog-status></p>
          <div class="blog-article-grid" id="blog-articles">${latest.map(card).join('')}</div>
          <div class="blog-empty" data-blog-empty hidden><h3>No articles found</h3><p>Try a different word or explore all categories.</p><button class="blog-button" type="button" data-blog-reset>Show all articles</button></div>
        </section>
      </div>
    </div><script type="module" src="/site-assets/blog.v1.mjs"></script>`
  };
}

export function blogFeed(guides, origin) {
  const {all} = blogPosts(guides);
  const items = all.filter(p=>p.feed).sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<item><title>${e(p.title)}</title><link>${e(origin+p.path)}</link><guid isPermaLink="true">${e(origin+p.path)}</guid><description>${e(p.description)}</description><pubDate>${new Date(p.date+'T00:00:00Z').toUTCString()}</pubDate><category>${e(label(p.category))}</category></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>HanziFun Blog</title><link>${e(origin)}/blog/</link><description>Chinese characters, study tips and culture from HanziFun.</description><language>en</language><atom:link href="${e(origin)}/blog/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>\n`;
}
