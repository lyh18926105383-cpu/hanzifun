import {toolsSeo,assertToolsAcceptance} from './tools-integration.mjs';
import {editorialContent,articlePath,publicArticle} from './editorial-workflow.mjs';
import {characterReviewState} from './publication-review.mjs';
// One content contract for core landing templates and one indexing policy for every output.
import {editorFor, escapeHtml as e} from './dictionary-data.mjs';
import {findCharacter,findReading,scenarioData,assertScenarioAcceptance} from './hsk-data.mjs';
import {breadcrumbItems} from './components/breadcrumbs.mjs';
import {topicPaths,topicMeta,topicAnswer} from './stroke-topic-meta.mjs';
export const canonicalUrl=(routePath,origin)=>new URL(routePath.split(/[?#]/)[0],origin).href;
export const privateRoute=p=>{
 const url=new URL(p,'https://hanzifun.invalid'),pathname=url.pathname;
 const publicFlashcards=pathname==='/flashcards/'||pathname==='/flashcards/decks/'||/^\/flashcards\/decks\/[^/]+\/$/.test(pathname);
 return /^\/(?:account|search|sign-in|pricing)(?:\/|$)/.test(pathname)
  || (pathname.startsWith('/flashcards/')&&(!publicFlashcards||url.searchParams.has('session')))
  || pathname==='/404.html';
};
export function buildEnvironment(value=process.env.HF_SITE_ENV||'local') {
 if(!['production','staging','local'].includes(value))throw Error('Unknown HF_SITE_ENV: '+value);
 return value;
}
export function effectivePolicy(route,environment) {
 buildEnvironment(environment);
 if(route.indexing==='index'&&route.robots!=='index,follow'||route.indexing==='noindex'&&route.robots!=='noindex,follow')throw Error('Contradictory indexing policy: '+route.path);
 if(route.indexing==='index'&&(privateRoute(route.path)||route.status!=='published'))throw Error('Unsafe indexable route: '+route.path);
 if(environment!=='production')return {...route,indexing:'noindex',robots:'noindex,follow'};
 return route;
}
export function assertEditorialReady(route) {
 assertToolsAcceptance(route);
 const article=editorialContent.articles.find(a=>articlePath(a)===route.path);
 if(route.indexing==='index'&&article&&(!publicArticle(article)||!article.published))throw Error('Unapproved article indexing: '+route.path);
 const scenario=scenarioData.scenarios.find(s=>s.path===route.path);
 if(route.indexing==='index'&&scenario)assertScenarioAcceptance(scenario);
}
// Owner-supplied landing-page copy. Descriptions are independent of visible introductions.
export const landingPageSeo={
 '/':{title:'Learn Chinese Characters Visually: Dictionary & Strokes',description:'Learn Chinese characters with stroke-order diagrams, hanzi meanings and pinyin, plus free flashcards that save your progress.',h1:'Learn Chinese Characters Visually'},
 '/stroke-order/':{title:topicMeta[0].title,description:topicMeta[0].description,h1:topicMeta[0].h1},
 '/dictionary/':{title:'Chinese Character Dictionary: Hanzi Meanings & Pinyin',description:'A free Chinese character dictionary with 339 hanzi: pinyin, core meanings, stroke order diagrams and example words, searchable in one click.',h1:'Chinese Character Dictionary'},
 '/scenarios/':{title:'Chinese Conversation Practice: Travel & Restaurant Talk',description:'Practise Chinese conversation for restaurants, airports, hotels and shopping, with pinyin, phrase meanings and linked character breakdowns.',h1:'Chinese Conversation Practice'},
 '/pinyin-chart/':{title:'What Is Pinyin? Full Mandarin Chart With Audio',description:'What is pinyin? It is the official Romanization of Mandarin. See all 410 syllables on one chart with pronunciation and printable options.',h1:'What Is Pinyin?'},
 '/flashcards/':{title:'Chinese Character Flashcards: Free Online Practice',description:'Practise Chinese characters with free online flashcards: pick a set, reveal each answer and keep saved characters in this browser.',h1:'Chinese Character Flashcards'},
 '/academic/':{title:'HSK 1 Vocabulary List: Compare HSK 2.0 and HSK 3.0',description:'HSK 1 vocabulary lists for HSK 2.0 and HSK 3.0 side by side, so you can check which characters and words each syllabus actually requires.',h1:'HSK 1 Vocabulary List: Choose Your Version'},
 '/tools/':{title:'Chinese Name Generator & Character Culture Tools',description:'Chinese name generator, menu decoder, lunar zodiac lookup and tattoo character checker, all built on one searchable hanzi dictionary.',h1:'Chinese Name Generator & Culture Tools'},
 '/kids/':{title:'Chinese Characters for family: Fun Visual Learning',description:'A playful Chinese character tool for family: tap a character to hear it, see its shape and learn one character at a time.'},
 '/worksheets/':{title:'Printable Chinese Character Cards',description:'Printable Chinese character cards with pinyin, meanings and memory cues'}
};
const fixed={
 '/flashcards/':{title:'Chinese Character Flashcards: Free Online Practice',h1:'Chinese Character Flashcards',lead:'Practise Chinese characters with free online flashcards. Choose a study set, reveal each answer and review saved characters, with progress stored in this browser on this device.'},
 '/':{title:'Learn Chinese Characters Visually: Dictionary, HSK & Flashcards',h1:'Learn Chinese Characters Visually',lead:'Learn Chinese characters with a visual dictionary, stroke order, HSK level 1 lists and flashcards that save practice on this device.'},
 '/dictionary/':{title:'Chinese Character Dictionary: 126 Core Hanzi, Pinyin & Meanings',h1:'Chinese Character Dictionary',lead:'This Chinese character dictionary covers 126 core hanzi with pinyin, meanings, stroke order and original teaching examples.'},
 '/dictionary/pinyin/':{title:'Chinese Characters by Pinyin: Find Hanzi and Readings',h1:'Find Chinese Characters by Pinyin',lead:'Find Chinese characters by pinyin using the readings of 126 core hanzi, grouped by syllable for direct character lookup.'},
 '/dictionary/radicals/':{title:'Chinese Radicals and Components: Browse Core Characters',h1:'Chinese Radicals and Visible Components',lead:'Browse Chinese characters by radical to find related written forms and their stroke counts in the 126-character core collection.'},
 '/dictionary/compare/':{title:'Similar Chinese Characters Compared: Shape, Pinyin & Use',h1:'Compare Similar Chinese Characters',lead:'Compare similar Chinese characters side by side using their shapes, pronunciations and contextual teaching examples.'},
 '/stroke-order/':{title:'Chinese Stroke Order: Step-by-Step Hanzi Writing Tool',h1:'Chinese Stroke Order',lead:'Follow Chinese stroke order step by step for 126 core characters using verified mainland writing sequences, playback controls and static stroke diagrams.'},
 '/pinyin-chart/':{
  title:'What Is Pinyin in Chinese?',
  h1:'What Is Pinyin in Chinese?',
  lead:'Pinyin, officially called Hanyu Pinyin, is the standard system for spelling the sounds of Mandarin Chinese with the Latin alphabet. Make HanziFun your go-to Chinese Pinyin tool to practise pronunciation online and print the complete Pinyin Chart in one click.',
  description:'Learn what Hanyu Pinyin is, practise Mandarin pronunciation online, and print the complete 410-syllable Pinyin Chart in one click.'
 },
 '/academic/':{title:'HSK Level 1 Lists: Compare HSK 2.0 and HSK 3.0',h1:'HSK Level 1: Choose Your Version',lead:'HSK level 1 has separate lists in HSK 2.0 and HSK 3.0: the libraries contain 150 and 300 vocabulary entries respectively.'},
 '/academic/hsk-2/':{title:'HSK 2.0 Level 1 Vocabulary: 150 Words & 174 Derived Characters',h1:'HSK 2.0 Level 1 Vocabulary and Characters',lead:'HSK 2.0 level 1 contains 150 vocabulary entries in the 2015 list, from which this library derives 174 unique characters.'},
 '/academic/hsk-3/':{title:'HSK 3.0 Level 1: 300 Words & 246 Recognition Characters',h1:'HSK 3.0 Level 1 Vocabulary and Recognition Characters',lead:'HSK 3.0 level 1 contains 300 vocabulary entries and 246 recognition characters in the 2025 examination syllabus; its 100 writing characters cover levels 1–2 together.'},
 '/scenarios/':{title:'Chinese Conversation Scenarios: Travel, Shopping & Business',h1:'Chinese Conversation Scenarios',lead:'Practise Chinese for restaurants, airport transport, hotel check-in, supermarket shopping and business introductions, with pinyin, phrase meanings and linked character practice.'},
 '/scenarios/travel/':{title:'Chinese Travel Phrases: Airports, Hotels, Restaurants & Shopping',h1:'Chinese Travel Phrases',lead:'Practise Chinese travel phrases for airport transport, hotels, restaurants and supermarket shopping, then follow each word to its character pages.'},
 '/scenarios/business/':{title:'Chinese Business Phrases: Courteous Introductions',h1:'Chinese Business Phrases',lead:'Start a Chinese business conversation with courteous greetings, introductions and thanks for someone’s time.'},
 '/scenarios/travel/restaurant/':{title:'Chinese Restaurant Phrases: Order Drinks & Ask Prices',h1:'Chinese Restaurant Phrases',lead:'Use Chinese restaurant phrases to request a glass of water, order tea and ask how much something costs.'},
 '/scenarios/business/icebreakers/':{title:'Chinese Business Icebreakers: Greetings & Introductions',h1:'Chinese Business Icebreakers',lead:'Use polite Chinese business icebreakers to greet someone respectfully, ask their name and thank them for their time.'}
};
export function coreSeo(routePath) {
 if(routePath==='/stroke-order/')return {...topicMeta[0],lead:topicAnswer};
 if(toolsSeo[routePath])return {...toolsSeo[routePath],...landingPageSeo[routePath]};
 if(fixed[routePath])return {...fixed[routePath],...landingPageSeo[routePath]};
 if(routePath==='/academic/hsk-2/level-2/')return {title:'HSK 2.0 Level 2: 150 Vocabulary Entries with Audio',h1:'HSK 2.0 Level 2: 150 Additional Vocabulary Entries',lead:'Study all 150 additional HSK 2.0 level-2 entries with pinyin, meanings and audio. Character links and practice use the existing 339-character dictionary; 86 words have complete character-page coverage.'};
 const scenario=scenarioData.scenarios.find(s=>s.path===routePath);
 if(scenario)return {title:scenario.title+': Phrases, Pinyin & Audio',h1:scenario.title,lead:scenario.context};
 const m=/^\/dictionary\/([^/]+)\/$/.exec(routePath),c=m&&findCharacter(decodeURIComponent(m[1]));
 if(!c)return null;
 const reading=findReading(c.primaryReadingId),meaning=characterReviewState(c.characterId).teaching?.meaning||reading.senses[0];
 if(!meaning||!reading.pinyin.marked||!Number.isInteger(c.strokeCount)||!c.radical)throw Error('Incomplete character SEO data: '+routePath);
 const label=`${c.glyph} (${reading.pinyin.marked})`;
 return {title:`${label} Meaning, Stroke Order & Examples`,h1:`${label}: ${meaning}`,lead:`${label} means "${meaning}" in Chinese, written with ${c.strokeCount} strokes under the ${c.radical} radical.`};
}
// Called by each core template, before layout rendering. The answer is a real static paragraph.
export function withCoreSeo(page) {
 if(page.strokeTopic)return page;
 const metadata=landingPageSeo[page.path];
 if(metadata)page={...page,title:metadata.title,description:metadata.description,documentTitle:metadata.title};
 const seo=coreSeo(page.path);if(!seo)return page;
 const description=seo.description??seo.lead;
 if(page.content.includes('data-seo-lead'))return {...page,title:seo.title,description};
 return {...page,title:seo.title,description,content:page.content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i,`<h1>${e(seo.h1)}</h1><p class="lead" data-seo-lead>${e(seo.lead)}</p>`)};
}
export function safeJsonLd(value) {
 return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
}
export function structuredData(page,canonical,origin) {
 if(page.strokeTopic){
  const a=page.editorialArticle;
  const graph=[{'@type':'Article',headline:a.title,author:{'@type':'Organization',name:a.author.name},datePublished:a.published,dateModified:a.modified,url:canonical,mainEntityOfPage:canonical,inLanguage:'en',citation:a.references.map(r=>r.url)},
   {'@type':'BreadcrumbList',itemListElement:(page.breadcrumbs||breadcrumbItems(page)).map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:canonicalUrl(item.path,origin)}))}];
  if(page.topicFaq?.length)graph.push({'@type':'FAQPage',mainEntity:page.topicFaq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()}}))});
  return '<script type="application/ld+json">'+safeJsonLd({'@context':'https://schema.org','@graph':graph})+'</script>';
 }
 const graph=[{'@type':'WebPage','@id':canonical+'#page',url:canonical,name:page.title,description:page.description||page.title,inLanguage:page.lang||'en'}];
 if(page.webApplication&&!page.path.startsWith('/tools/'))graph.push({'@type':'WebApplication',name:page.title,description:page.description,applicationCategory:'EducationalApplication',operatingSystem:'Any',url:canonical,inLanguage:'en'});
 if(page.editorialArticle){const a=page.editorialArticle;graph.push({'@type':'Article',headline:a.title,author:{'@type':a.author.kind==='human'?'Person':'Organization',name:a.author.name},dateModified:a.modified,...(a.published?{datePublished:a.published}:{}),url:canonical,mainEntityOfPage:canonical,citation:a.references.map(r=>r.url)});}
 if(page.path==='/')graph.push({'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'HanziFun',inLanguage:'en'});
 else if(page.path!=='/404.html')graph.push({'@type':'BreadcrumbList',itemListElement:(page.breadcrumbs||breadcrumbItems(page)).map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:canonicalUrl(item.path,origin)}))});
 return '<script type="application/ld+json">'+safeJsonLd({'@context':'https://schema.org','@graph':graph})+'</script>';
}
