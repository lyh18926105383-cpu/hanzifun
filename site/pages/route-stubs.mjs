const page = (path, title, description, content, eyebrow = 'A little Chinese, at your pace') => ({
  path, title, description,
  content: '<div class=\"container\"><nav class=\"breadcrumbs\" aria-label=\"Breadcrumb\"><a href=\"/\">Home</a><span aria-hidden=\"true\">/</span><span>' +
    title + '</span></nav><header class=\"page-intro\"><p class=\"eyebrow\">' + eyebrow +
    '</p><h1>' + title + '</h1><p>' + description +
    '</p></header><div class=\"page-body\">' + content + '</div></div>'
});

const notice = text => '<p class=\"preview-note\">' + text + '</p>';
const action = (href, label) => '<p><a class=\"button\" href=\"' + href + '\">' + label + ' →</a></p>';

export function createSupportPages() {
  return [
    page('/pinyin-chart/', 'Mandarin Pinyin Chart', 'A dedicated place to explore Mandarin initials, finals, syllables, tones, and example characters.',
      notice('The complete reviewed chart and approved audio are planned. Pinyin audio is not enabled in this preview.') +
      '<div class=\"tile-grid\"><article class=\"tile\"><h3>Find a character by pronunciation</h3><p>Browse the current character index by pinyin.</p>' +
      action('/dictionary/pinyin/', 'Open the pinyin index') + '</article><article class=\"tile\"><h3>Explore written strokes</h3><p>Stroke order has its own learning page and address.</p>' +
      action('/stroke-order/', 'Open Stroke Order') + '</article></div>', 'Visual Dictionary / Pronunciation'),
    page('/privacy/', 'Privacy', 'A clear description of how this preview handles learning information.',
      '<div class=\"content-prose\"><p class=\"lead\">This preview does not ask you to create an account or enter sign-in credentials.</p>' +
      '<h2>Learning on this device</h2><p>The prototype flashcard experience saves practice choices in this browser using local storage. It does not provide cloud sync.</p>' +
      '<h2>Future changes</h2><p>Any additional collection or account service will be described here before it is enabled.</p></div>', 'HanziFun / Privacy preview'),
    page('/terms/', 'Terms', 'The public terms and content-attribution details are being prepared before launch.',
      notice('This route is a launch placeholder. It does not set final terms, licenses, or paid-service conditions.') +
      action('/data-sources/', 'View source information'), 'HanziFun / Terms preview'),
    page('/data-sources/', 'Data Sources', 'Source versions and attribution will be published alongside reviewed public learning content.',
      notice('The source and license inventory is being prepared for the public release. Preview content is not a verified dictionary or HSK list.') +
      action('/dictionary/', 'Return to the character preview'), 'HanziFun / Sources preview'),
    page('/404.html', 'Page not found', 'This address does not match a page in the current site.',
      '<div class=\"empty-state\"><p>The page may have moved, or it may not be part of this preview.</p>' +
      action('/', 'Return to HanziFun') + '</div>', '404 / Not found')
  ];
}

export function createCharacterStub(character) {
  return page('/dictionary/' + character + '/', character + ' · Dictionary entry preview',
    'A reviewed dictionary entry for ' + character + ' is not available yet.',
    '<div class=\"character-detail\"><div class=\"content-prose\"><p class=\"lead\" lang=\"zh-CN\">' + character + '</p>' +
    '<p>This route is reserved for the controlled character library. Its reviewed meaning, readings, examples, and Information will be added with the dictionary pages.</p>' +
    '<p>Prototype examples are marked as previews and are not presented as approved dictionary content.</p>' +
    '<p><a href=\"/dictionary/\">Browse the character preview</a></p></div></div>', 'Visual Dictionary / Entry pending review');
}

export function createContractFallback(routePath, phase1Description) {
  const slug = routePath.split('/').filter(Boolean).pop() || 'HanziFun';
  const title = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  return page(routePath, title, phase1Description || 'This page is part of the HanziFun route plan.',
    notice('This page is a route placeholder. Its complete content will be added when it is reviewed and ready to publish.') +
    action('/', 'Return to the homepage'), 'HanziFun / Planned page');
}
