export const topicOrigin='https://hanzifun.online';
export const topicDate='2026-11-13';
export const topicPaths=['/stroke-order/','/stroke-order/basic-strokes/','/stroke-order/rules/','/stroke-order/examples/','/stroke-order/animation/'];
export const topicAnswer="As a beginner learning Chinese, stroke order (笔顺, bǐ shùn) is worth learning because it makes Chinese characters easier to write, recognize, and remember.";
export const topicMeta=[
 {path:topicPaths[0],key:'hub',label:'Stroke Order',title:'Chinese Stroke Order: Rules, Charts & Character Lookup',h1:'Chinese Stroke Order',description:'Learn Chinese stroke order with 7 clear rules, 8 basic stroke types and a character lookup. See numbered diagrams and download free handwriting practice PDFs.'},
 {path:topicPaths[1],key:'basics',label:'Basic Strokes',title:'Chinese Basic Strokes: All 8 Strokes, Tips & Examples',h1:'Chinese Basic Strokes',description:'Explore 8 Chinese basic stroke families with single-stroke animations, writing tips and common mistakes. Compare shapes and download a free practice worksheet.'},
 {path:topicPaths[2],key:'rules',label:'Stroke Order Rules',title:'Chinese Stroke Order Rules: 7 Rules With Clear Examples',h1:'Chinese Stroke Order Rules',description:'Understand 7 Chinese stroke order rules through focused examples, common exceptions and regional differences. Use numbered diagrams to check each pen movement.'},
 {path:topicPaths[3],key:'examples',label:'Worked Examples',title:'Chinese Stroke Order Examples: 8 Characters Step by Step',h1:'Chinese Stroke Order Examples',description:'Study 8 Chinese stroke order examples with interactive playback, numbered diagrams, real character data and everyday sentences. Practise at your own pace.'},
 {path:topicPaths[4],key:'animation',label:'Animation Resources',title:'Chinese Characters Animation: Free GIFs & Embed Code',h1:'Chinese Characters Animation',description:'Use 8 Chinese character animations in lessons and websites. Download GIF and SVG files, generate iframe embed code and keep source attribution with each file.'}
];
export const metaFor=path=>topicMeta.find(m=>m.path===path);
export const topicReferences=[
 {title:'Mainland standard: GF 0023-2020',url:'https://jw.beijing.gov.cn/language/bzgf/202105/P020210512414220837538.pdf'},
 {title:'Hanzi Writer data and licensing',url:'https://github.com/chanind/hanzi-writer-data'},
 {title:'cnchar stroke-order documentation',url:'https://theajack.github.io/cnchar/doc/order.html'},
 {title:'Taiwan Ministry of Education: basic rules',url:'https://stroke-order.learningweb.moe.edu.tw/page.jsp?ID=23&la=0'},
 {title:'NINJAL: character forms and stroke order',url:'https://kotoba.ninjal.ac.jp/qa/yokuaru/qa-182/'},
 {title:'CC-CEDICT dictionary data',url:'https://www.mdbg.net/chinese/dictionary?page=cedict'}
];
