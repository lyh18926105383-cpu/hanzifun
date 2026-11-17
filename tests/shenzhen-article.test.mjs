import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {editorialContent,articleHash,articlePage,articleCards,validateEditorial,publicArticle,articlePath,visibleArticle} from '../site/editorial-workflow.mjs';
import {cityPhotos,cityArticleBody,cityArticleInputs,cityReadMinutes} from '../site/city-article.mjs';
import {blogPosts,blogFeed,blogPage} from '../site/pages/blog.mjs';
import {guides} from '../site/editorial-content.mjs';
import {structuredData,articleSocialMetadata} from '../site/seo.mjs';
import {validateJsonLd} from '../scripts/validate-seo-quality.mjs';
import {applyDecisions} from '../scripts/review-editorial.mjs';
const actualArticle=editorialContent.articles.find(a=>a.slug==='shenzhen-city-name-chinese');
const article=structuredClone(actualArticle);
article.status='draft';article.published=null;article.review={acceptance:'pending',reviewer:null,date:null,contentSha256:null,evidence:null};
const origin='https://hanzifun.online',canonical=origin+articlePath(article);
const nodes=n=>[n,...(n.childNodes||[]).flatMap(nodes)];
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');

test('Shenzhen draft preserves supplied metadata, truthful date and two static learning cards',()=>{
 const page=articlePage(article,{environment:'local'}),all=nodes(parse(page.content));
 assert.equal(article.status,'draft');assert.equal(article.published,null);assert.equal(article.review.acceptance,'pending');
 assert.equal(article.author.name,'HanziFun');assert.equal(article.author.kind,'organization');
 assert.equal(article.title,'Shenzhen: The APEC 2026 Host City & Its Chinese Name | HanziFun');
 assert.equal(all.filter(n=>n.tagName==='h1').length,1);assert.equal(text(all.find(n=>n.tagName==='h1')),'Meet Shenzhen: A Global City in Two Chinese Characters');
 const glyphs=all.filter(n=>attr(n,'class')==='sz-glyph').map(text);assert.deepEqual(glyphs,['深','圳']);
 assert.match(page.content,/Strokes:<\/strong> 11/);assert.match(page.content,/Strokes:<\/strong> 6/);assert.match(page.content,/shēn shuǐ/);assert.match(page.content,/is scheduled for November 18–19/);
 assert.doesNotMatch(page.content,/data-pronunciation|data-stroke|speechSynthesis|\/dictionary\/(?:深|圳)\//);
 assert.equal(all.filter(n=>n.tagName==='tr').length,4);assert.equal(all.filter(n=>n.tagName==='details').length,6);
 assert.equal(all.filter(n=>attr(n,'aria-label')==='On this page').flatMap(n=>nodes(n)).filter(n=>n.tagName==='a').length,5);
 assert.equal(attr(all.find(n=>attr(n,'data-article-cta')==='hero'),'href'),'#learn-shenzhen');assert.ok(all.some(n=>attr(n,'id')==='learn-shenzhen'));
 assert.equal(attr(all.find(n=>attr(n,'data-article-cta')==='end'),'href'),'/');
 assert.match(page.content,/Prepared <time/);assert.doesNotMatch(page.content,/Published <time/);
 assert.equal(cityReadMinutes().minutes,Math.ceil(cityReadMinutes().words/200));assert.ok(cityReadMinutes().words>1000);
});

test('Shenzhen photographs are local, integrity-locked WebP derivatives with both attribution licenses',()=>{
 assert.deepEqual(cityPhotos.map(p=>[p.author,p.year]),[['Shihu7',2019],['Wishds',2015]]);
 assert.ok(cityArticleInputs().html.includes('Memory cue:'));
 for(const photo of cityPhotos){assert.match(photo.sourcePage,/^https:\/\/commons.wikimedia.org\//);assert.equal(photo.derivedLicense,photo.license);
  assert.deepEqual(photo.variants.map(v=>v.width),[480,800,1200,1600]);
  for(const v of photo.variants){const bytes=fs.readFileSync(new URL('../public/site-assets/blog/shenzhen/'+v.file,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256);assert.equal(v.width/v.height,4/3);}
 }
 assert.ok(cityPhotos[0].variants.at(-1).bytes<310000);assert.ok(cityPhotos[1].variants.at(-1).bytes<200000);
 const html=articlePage(article,{environment:'local'}).content;assert.match(html,/fetchpriority="high"/);assert.match(html,/loading="lazy"/);assert.equal((html.match(/Resized and converted to WebP for this page\./g)||[]).length,2);
 assert.doesNotMatch(html,/<img[^>]+src="https?:/);assert.match(html,/CC BY-SA 4\.0/);assert.match(html,/CC BY-SA 3\.0/);
});

test('Shenzhen BlogPosting and social metadata agree with visible headline, author and canonical without inventing publication',()=>{
 const page=articlePage(article,{environment:'local'}),ld=structuredData(page,canonical,origin),graph=JSON.parse(/<script[^>]*>([\s\S]*)<\/script>/.exec(ld)[1])['@graph'];
 const posting=graph.find(x=>x['@type']==='BlogPosting');assert.equal(posting.headline,article.h1);assert.equal(posting.author.name,'HanziFun');assert.equal(posting.author['@type'],'Organization');assert.equal(posting.dateModified,article.modified);assert.equal(posting.datePublished,undefined);assert.equal(posting.url,canonical);assert.ok(graph.some(x=>x['@type']==='BreadcrumbList'));assert.ok(!graph.some(x=>x['@type']==='FAQPage'));
 assert.doesNotThrow(()=>validateJsonLd(parse('<html><head><title>'+article.title.replaceAll('&','&amp;')+'</title><meta name="description" content="'+article.description+'">'+ld+'</head><body>'+page.content+'</body></html>'),canonical));
 const social=articleSocialMetadata(page,canonical,origin);assert.match(social,/property="og:type" content="article"/);assert.match(social,/name="twitter:card" content="summary_large_image"/);assert.ok(social.includes('content="'+canonical+'"'));
});

test('Shenzhen approved publication participates in discovery while draft fixture remains hidden in production',()=>{
 const route=articlePath(article),posts=blogPosts(guides,{environment:'local'}).all;
 assert.ok(posts.some(p=>p.path===route&&p.category==='culture'&&p.minutes===6));
 const list=blogPage(guides,{environment:'local'}).content;assert.ok(list.includes(route));assert.match(list,/data-category="culture"/);
 const rss=blogFeed(guides,origin,{environment:'local'});assert.ok(rss.includes(canonical));const item=rss.split('<item>').find(x=>x.includes(canonical));assert.ok(item.includes('<pubDate>'));
 const home=articleCards('local');assert.ok(home.includes(route));assert.equal((home.match(/class="tile"/g)||[]).length,3);
 assert.ok(articleCards('production').includes(route));assert.ok(blogFeed(guides,origin).includes(canonical));assert.ok(blogPosts(guides).all.some(p=>p.path===route));assert.ok(!articlePage(article).content.includes('Learn the two characters'));assert.equal(visibleArticle(article,'production'),false);assert.ok(publicArticle(actualArticle));assert.equal(actualArticle.status,'published');assert.equal(actualArticle.published,'2026-11-18');assert.match(structuredData(articlePage(actualArticle),canonical,origin),/"datePublished":"2026-11-18"/);
});

test('Shenzhen static layout cannot bypass article review, fixed-date or dictionary-link gates',()=>{
 const copy=structuredClone(editorialContent);copy.articles[copy.articles.length-1]=structuredClone(article);assert.doesNotThrow(()=>validateEditorial(copy));
 for(const mutate of [a=>a.layout=undefined,a=>a.characterIds=['char:6df1'],a=>a.deck='first-six',a=>a.status='published',a=>a.slug='other-city']){const c=structuredClone(copy);mutate(c.articles.at(-1));assert.throws(()=>validateEditorial(c));}
 assert.throws(()=>validateEditorial(copy,{release:{routes:{[articlePath(article)]:'published'}}}),/Unsafe editorial release/);
 const decisions=[{slug:article.slug,acceptance:'approved',kind:'human',reviewer:'Synthetic test reviewer',date:'2026-11-17',contentSha256:articleHash(article),evidence:'Synthetic fixture only; never written to project data.'}];
 const reviewed=applyDecisions(copy,decisions),approved=reviewed.articles.at(-1);assert.ok(publicArticle(approved));approved.status='published';approved.published='2026-11-17';assert.doesNotThrow(()=>validateEditorial(reviewed,{release:{routes:{[articlePath(article)]:'published'}}}));
 const p=articlePage(approved);assert.ok(p.content.includes('Learn the two characters'));assert.match(structuredData(p,canonical,origin),/"datePublished":"2026-11-17"/);
 const oldHash=articleHash(approved);approved.h1+=' Changed';assert.notEqual(articleHash(approved),oldHash);assert.throws(()=>validateEditorial(reviewed),/stale/);
 assert.ok(cityArticleBody().includes('checked November 17, 2026'));
});
