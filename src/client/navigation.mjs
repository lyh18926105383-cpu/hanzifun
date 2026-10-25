const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('#mobile-menu');
const menuGroups = Array.from(document.querySelectorAll('.desktop-nav details, .mobile-menu details'));

function closeMobileMenu(returnFocus = false) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
  if (returnFocus) menuButton.focus();
}

function closeOpenGroups(except = null) {
  menuGroups.forEach(group => {
    if (group !== except && group.open) group.open = false;
  });
}

menuButton?.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  mobileMenu.hidden = !opening;
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  const activeGroup = menuGroups.find(group => group.open && group.contains(document.activeElement));
  if (activeGroup) {
    event.preventDefault();
    activeGroup.open = false;
    activeGroup.querySelector('summary')?.focus();
    return;
  }

  const openGroup = menuGroups.find(group => group.open);
  if (openGroup) openGroup.open = false;
  if (menuButton?.getAttribute('aria-expanded') === 'true') {
    event.preventDefault();
    closeMobileMenu(true);
  }
});

document.addEventListener('click', event => {
  if (!event.target.closest('.desktop-nav, .mobile-menu')) closeOpenGroups();
  if (event.target.closest('#mobile-menu a')) closeMobileMenu();
});

document.addEventListener('focusin', event => {
  menuGroups.forEach(group => {
    if (group.open && !group.contains(event.target)) group.open = false;
  });
});

menuGroups.forEach(group => {
  group.addEventListener('toggle', () => {
    if (group.open) closeOpenGroups(group);
  });
});

window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 1051px)').matches) closeMobileMenu();
});
