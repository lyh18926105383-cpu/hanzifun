import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseFragment} from 'parse5';
import {escapeHtml as e} from './dictionary-data.mjs';
import {blogShell} from './components/blog-shell.mjs';

export const cityArticleSlug='shenzhen-city-name-chinese';
const bodyUrl=new URL('../content/editorial/shenzhen-city-name-chinese.html',import.meta.url);
const photosUrl=new URL('../public/site-assets/blog/shenzhen/sources.json',import.meta.url);
const assetsRoot='/site-assets/blog/shenzhen/';
export const cityPhotos=JSON.parse(fs.readFileSync(photosUrl,'utf8')).images;
export const cityArticleBody=()=>fs.readFileSync(bodyUrl,'utf8');
export function cityArticleInputs(){
  for(const photo of cityPhotos)for(const variant of photo.variants){
    const bytes=fs.readFileSync(new URL('../public'+assetsRoot+variant.file,import.meta.url));
    if(createHash('sha256').update(bytes).digest('hex')!==variant.sha256)throw Error('Changed Shenzhen photo: '+variant.file);
  }
  return {html:cityArticleBody(),photos:cityPhotos,rendererSha256:createHash('sha256').update(fs.readFileSync(new URL('./city-article.mjs',import.meta.url))).digest('hex')};
}
export function cityReadMinutes(){
  const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join(' ');
  const words=text(parseFragment(cityArticleBody().replace('{{photo:bay}}',''))).match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)||[];
  return {words:words.length,minutes:Math.max(1,Math.ceil(words.length/200))};
}
export function cityPhoto(index,{hero=false}={}){
  const photo=cityPhotos[index],alt=hero?'Green space at Lianhuashan Park with Shenzhen’s skyline in the background, photographed in 2019.':'A view across the water toward Shenzhen’s skyline from Shenzhen Bay Park, photographed in 2015.';
  const license=photo.license.includes('/4.0/')?'CC BY-SA 4.0':'CC BY-SA 3.0';
  return `<figure class="sz-photo"><img src="${assetsRoot+photo.id}-1200.webp" srcset="${photo.variants.map(v=>assetsRoot+v.file+' '+v.width+'w').join(', ')}" sizes="${hero?'(max-width: 850px) calc(100vw - 36px), 48vw':'(max-width: 850px) calc(100vw - 36px), 800px'}" width="1600" height="1200" alt="${e(alt)}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async"><figcaption>${hero?'Green space and the city skyline at Lianhuashan Park, 2019.':'A view from Shenzhen Bay Park, 2015—not a photograph of the 2026 APEC event.'} Photo: <a href="${photo.sourcePage}">${photo.author} / Wikimedia Commons</a>, <a href="${photo.license}">${license}</a>. Resized and converted to WebP for this page.</figcaption></figure>`;
}
export function cityArticlePresentation(a){
  return {imageSrc:assetsRoot+cityPhotos[0].id+'-800.webp',imageSrcset:cityPhotos[0].variants.map(v=>assetsRoot+v.file+' '+v.width+'w').join(', '),imageWidth:1600,imageHeight:1200,alt:a.image.alt,minutes:cityReadMinutes().minutes,photoCredit:cityPhotos[0],category:'culture'};
}
export function cityArticlePage(a,{show,approved}){
  if(a.slug!==cityArticleSlug)throw Error('Unknown city article layout: '+a.slug);
  const shell=blogShell({article:true}),date=a.published||a.modified;
  const dateLabel=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
  const copy=cityArticleBody().replace('{{photo:bay}}',cityPhoto(1));
  const toc=[['the-city','The city'],['the-name','The name'],['learn-shenzhen','Learn 深圳'],['try-a-sentence','Try a sentence'],['quick-questions','Quick questions']];
  return {path:'/blog/'+a.slug+'/',title:a.title,documentTitle:a.title,breadcrumbLabel:'Shenzhen in Chinese',description:a.description,bodyClass:'blog-page sz-page',...shell,
    blogPosting:show,editorialArticle:show?a:null,socialImage:show?{src:assetsRoot+cityPhotos[0].id+'-1200.webp',alt:a.image.alt,width:1200,height:900}:null,
    head:'<link rel="stylesheet" href="/site-assets/blog.v1.css"><link rel="stylesheet" href="/site-assets/shenzhen-article.v1.css"><link rel="alternate" type="application/rss+xml" title="HanziFun Blog" href="/blog/feed.xml">',
    content:`<article class="sz-article"><header class="container sz-hero"><div class="sz-hero-copy"><p class="sz-category">Chinese Culture${approved?'':' · Local preview'}</p><h1>${e(a.h1)}</h1>${show?`<p class="sz-meta">By <span data-editorial-author>${e(a.author.name)}</span> · ${a.published?'Published':'Prepared'} <time datetime="${date}">${dateLabel}</time> · ${cityReadMinutes().minutes} min read</p><p class="sz-deck">Discover the city behind the APEC headlines—and learn to read <span lang="zh-CN">深圳</span>.</p><p class="sz-city-name"><span lang="zh-CN">深圳</span><span lang="zh-Latn-pinyin">Shēnzhèn</span><small>Shenzhen</small></p><a class="blog-button sz-learn-link" data-article-cta="hero" href="#learn-shenzhen">Learn the two characters <span aria-hidden="true">↓</span></a>`:''}</div>${show?cityPhoto(0,{hero:true}):''}</header>${show?`<nav class="sz-toc" aria-label="On this page"><div class="container">${toc.map(([id,label])=>`<a href="#${id}">${e(label)}</a>`).join('')}</div></nav><div class="container sz-prose">${copy}</div>`:'<div class="container sz-prose"><p>This guide is being prepared. <a href="/blog/">Read the available learning guides</a>.</p></div>'}</article>`};
}
