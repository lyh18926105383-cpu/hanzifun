const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = {
  '/': 'Home',
  '/dictionary/': 'Dictionary',
  '/dictionary/pinyin/': 'By pinyin',
  '/dictionary/radicals/': 'Character components',
  '/dictionary/compare/': 'Compare characters',
  '/dictionary/top-100/': '100 starter characters',
  '/stroke-order/': 'Stroke Order',
  '/pinyin-chart/': 'Pinyin Chart',
  '/academic/': 'Students & Teachers',
  '/academic/hsk-2/': 'HSK 2.0',
  '/academic/hsk-3/': 'HSK 3.0',
  '/academic/hsk-2/level-2/': 'Level 2',
  '/kids/': 'Kids & Families',
  '/kids/stories/': 'Stories',
  '/scenarios/': 'Travel & Business',
  '/scenarios/travel/': 'China Travel',
  '/scenarios/business/': 'Business Chinese',
  '/flashcards/': 'Flashcards',
  '/flashcards/decks/': 'Practice sets',
  '/flashcards/my-words/': 'Saved characters',
  '/flashcards/teacher/': 'Teacher decks',
  '/worksheets/': 'Printable cards',
  '/tools/': 'Culture tools',
  '/blog/': 'Blog',
  '/account/': 'My learning',
};

function label(page) {
  if (page.breadcrumbLabel) return page.breadcrumbLabel;
  if (labels[page.path]) return labels[page.path];
  const character = /^\/dictionary\/(\p{Script=Han})\/$/u.exec(page.path);
  return character ? character[1] : page.title;
}

// Only real, generated ancestors become links; query parameters never form a trail.
export function breadcrumbItems(page, pages = new Map()) {
  const pathname = page.path.split(/[?#]/)[0];
  if (['/', '/404.html', '/zh/'].includes(pathname)) return [];
  const items = [{path:'/', name:'Home'}];
  const segments = pathname.split('/').filter(Boolean);
  for (let i = 1; i < segments.length; i++) {
    const parent = pages.get('/' + segments.slice(0, i).join('/') + '/');
    if (parent) items.push({path:parent.path, name:label(parent)});
  }
  items.push({path:pathname, name:label({...page, path:pathname})});
  return items;
}

export function renderBreadcrumbs(items) {
  if (!items.length) return '';
  return '<div class="container site-breadcrumb-container"><nav class="site-breadcrumbs" aria-label="Breadcrumb"><ol role="list">' + items.map((item, i) => {
    const last = i === items.length - 1;
    const lang = /^\p{Script=Han}$/u.test(item.name) ? ' lang="zh-CN"' : '';
    return '<li>' + (i ? '<span class="site-breadcrumb-separator" aria-hidden="true">›</span>' : '') +
      (last ? '<span aria-current="page"' + lang + '>' + escape(item.name) + '</span>' : '<a href="' + escape(item.path) + '">' + escape(item.name) + '</a>') + '</li>';
  }).join('') + '</ol></nav></div>';
}

export function withBreadcrumbs(page, pages) {
  const breadcrumbs = breadcrumbItems(page, pages);
  // Replace the older template trails once, including the bespoke character trail.
  const content = page.content.replace(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>[\s\S]*?<\/nav>/gi, '');
  return {...page, breadcrumbs, content:renderBreadcrumbs(breadcrumbs) + content};
}
