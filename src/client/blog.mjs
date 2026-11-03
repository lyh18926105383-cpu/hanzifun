const form = document.querySelector('[data-blog-controls]');
const search = form?.querySelector('[data-blog-search]');
const cards = [...document.querySelectorAll('[data-blog-card]')];
const status = document.querySelector('[data-blog-status]');
const empty = document.querySelector('[data-blog-empty]');
if (form) {
  function filterArticles() {
    const category = form.elements.category.value;
    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      const matches = (category === 'all' || card.dataset.category === category)
        && card.textContent.normalize('NFKC').toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) count++;
    }
    empty.hidden = count > 0;
    status.textContent = `${count} ${count === 1 ? 'article' : 'articles'} found${query ? ` for “${search.value.trim()}”` : ''}.`;
  }
  form.addEventListener('change', filterArticles);
  search.addEventListener('input', filterArticles);
  form.addEventListener('submit', event => {
    event.preventDefault();
    filterArticles();
    document.querySelector('#blog-latest-title').scrollIntoView({block:'start'});
  });
  for (const reset of document.querySelectorAll('[data-blog-reset]')) reset.addEventListener('click', () => {
    form.reset();
    filterArticles();
  });
  const category = new URLSearchParams(location.search).get('category');
  if ([...form.elements.category].some(input => input.value === category)) form.elements.category.value = category;
  search.value = new URLSearchParams(location.search).get('q') || '';
  filterArticles();
}
const copy = document.querySelector('[data-copy-feed]');
if (copy && navigator.clipboard?.writeText) {
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    const url = new URL('/blog/feed.xml', location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      document.querySelector('[data-feed-status]').textContent = 'Feed link copied. Paste it into your RSS reader.';
    } catch {
      document.querySelector('[data-feed-status]').textContent = `Feed link: ${url}`;
    }
  });
}
