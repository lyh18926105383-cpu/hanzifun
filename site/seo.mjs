import {characterReviewState} from './publication-review.mjs';
// One content contract for core landing templates and one indexing policy for every output.
import {editorFor, escapeHtml as e} from './dictionary-data.mjs';
import {findCharacter,findReading,scenarioData} from './hsk-data.mjs';
export const canonicalUrl=(routePath,origin)=>new URL(routePath.split(/[?#]/)[0],origin).href;
export const privateRoute=p=>/^\/(?:account|search|sign-in|pricing)(?:\/|$)/.test(p)||/^\/flashcards\//.test(p)||p==='/flashcards/'||p==='/404.html';
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
 const scenario=scenarioData.scenarios.find(s=>s.path===route.path);
 if(route.indexing==='index'&&scenario&&(scenario.review||scenarioData.review).humanAcceptance!=='approved')throw Error('Scenario human language acceptance pending: '+route.path);
}
const fixed={
 '/':{title:'Learn Chinese Characters Visually: Dictionary, HSK & Flashcards',h1:'Learn Chinese Characters Visually',lead:'Learn Chinese characters with a visual dictionary, stroke order, HSK level 1 lists and flashcards that save practice on this device.'},
 '/dictionary/':{title:'Chinese Character Dictionary: 126 Core Hanzi, Pinyin & Meanings',h1:'Chinese Character Dictionary',lead:'This Chinese character dictionary covers 126 core hanzi with pinyin, meanings, stroke order and original teaching examples.'},
 '/dictionary/pinyin/':{title:'Chinese Characters by Pinyin: Find Hanzi and Readings',h1:'Find Chinese Characters by Pinyin',lead:'Find Chinese characters by pinyin using the readings of 126 core hanzi, grouped by syllable for direct character lookup.'},
 '/dictionary/radicals/':{title:'Chinese Radicals and Components: Browse Core Characters',h1:'Chinese Radicals and Visible Components',lead:'Browse Chinese characters by radical to find related written forms and their stroke counts in the 126-character core collection.'},
 '/dictionary/compare/':{title:'Similar Chinese Characters Compared: Shape, Pinyin & Use',h1:'Compare Similar Chinese Characters',lead:'Compare similar Chinese characters side by side using their shapes, pronunciations and contextual teaching examples.'},
 '/stroke-order/':{title:'Chinese Stroke Order: Step-by-Step Hanzi Writing Tool',h1:'Chinese Stroke Order',lead:'Follow Chinese stroke order step by step for 126 core characters using verified mainland writing sequences, playback controls and static stroke diagrams.'},
 '/pinyin-chart/':{title:'Mandarin Pinyin Chart: 410 Syllables, Initials, Finals & Tones',h1:'Mandarin Pinyin Chart',lead:'This Mandarin pinyin chart groups 410 syllables by initial and final and explains the four tones, neutral tone and spelling rules.'},
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
 if(fixed[routePath])return fixed[routePath];
 if(routePath==='/academic/hsk-2/level-2/')return {title:'HSK 2.0 Level 2 Core Vocabulary: 86 Words with Audio',h1:'HSK 2.0 Level 2: 86 Core Words',lead:'Study 86 of the 150 additional HSK 2.0 level-2 words with pinyin, meanings, audio and links to complete character pages. This selected core list is not the full second-level syllabus.'};
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
 const seo=coreSeo(page.path);if(!seo)return page;
 if(page.content.includes('data-seo-lead'))return {...page,title:seo.title,description:seo.lead};
 return {...page,title:seo.title,description:seo.lead,content:page.content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i,`<h1>${e(seo.h1)}</h1><p class="lead" data-seo-lead>${e(seo.lead)}</p>`)};
}
export function safeJsonLd(value) {
 return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
}
export function structuredData(page,canonical,origin) {
 const graph=[{'@type':'WebPage','@id':canonical+'#page',url:canonical,name:page.title,description:page.description||page.title,inLanguage:page.lang||'en'}];
 if(page.path==='/')graph.push({'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'HanziFun',inLanguage:'en'});
 else if(page.path!=='/404.html')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},{'@type':'ListItem',position:2,name:page.title,item:canonical}]});
 return '<script type="application/ld+json">'+safeJsonLd({'@context':'https://schema.org','@graph':graph})+'</script>';
}
