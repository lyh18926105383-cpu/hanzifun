export function blogShell({article=false}={}) {
  let header = `<header class="site-header blog-header"><div class="nav-shell container">
    <a class="brand blog-brand" href="/" aria-label="HanziFun home"><span class="blog-seal" lang="zh-CN" aria-hidden="true">漢</span>HanziFun <span>Blog</span></a>
    <button type="button" class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">Menu <span aria-hidden="true">☰</span></button>
    <nav id="mobile-menu" class="desktop-nav primary-nav" aria-label="Main navigation"><a href="/flashcards/">Learn Chinese</a><a href="/dictionary/">Dictionary</a><a href="/tools/">Culture</a><a href="/blog/" aria-current="page">Blog</a></nav>
    <a class="blog-button blog-header-subscribe" href="#blog-subscribe" aria-label="Subscribe"><span class="blog-subscribe-label">Subscribe</span><span aria-hidden="true">→</span></a>
    </div></header>`;
  let footer = `<footer class="blog-footer"><div class="container"><a class="brand blog-brand" href="/"><span class="blog-seal" lang="zh-CN" aria-hidden="true">漢</span>HanziFun Blog</a><p>A small step into a richer language.</p><nav aria-label="Footer navigation"><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/data-sources/">Sources</a><a href="/blog/feed.xml">RSS</a></nav></div><div class="container blog-photo-credits">Photography: <a href="https://www.pexels.com/photo/brush-and-paint-for-hieroglyphs-writing-8627038/">Feng Zou / Pexels</a> · <a href="https://unsplash.com/photos/brown-teapot-on-stick-link-table-runner-1-L1ET2-kZ4">Y H / Unsplash</a> · Mooncake and study-desk images created with AI.</div></footer>`;
  if(article){
    header=header.replace('href="#blog-subscribe"','href="/blog/feed.xml"').replace('aria-label="Subscribe"','aria-label="RSS feed"').replace('>Subscribe</span>','>RSS</span>');
    footer=footer.replace(/<div class="container blog-photo-credits">[\s\S]*?<\/div>/,'');
  }
  return {header,footer};
}
