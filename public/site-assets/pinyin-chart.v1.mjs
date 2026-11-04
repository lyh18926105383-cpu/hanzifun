const filters = document.querySelector('[data-pinyin-filter]');

filters.addEventListener('reset', () => {
  // Refresh the shared filter after the browser restores the form defaults.
  setTimeout(() => filters.dispatchEvent(new Event('input')), 0);
});
