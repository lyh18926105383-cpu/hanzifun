import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {characters,decks,names,articles,stories} from './data.mjs';
import {header,footer,renderPages,journal} from './site.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const out=join(root,'dist');
await mkdir(out,{recursive:true});
await cp(join(root,'public'),out,{recursive:true});
const layout=await readFile(join(root,'layout.html'),'utf8');
const home=(await readFile(join(root,'home.html'),'utf8')).replace('{{journal}}',journal());
const pages=[{path:'/',title:'Learn Chinese Characters Visually',content:home},...renderPages()];
for(const page of pages){
  const destination=join(out,page.path,'index.html');
  await mkdir(dirname(destination),{recursive:true});
  const html=layout.replace('{{lang}}',page.lang||'en').replace('{{title}}',page.title)
    .replace('{{header}}',header()).replace('{{content}}',page.content).replace('{{footer}}',footer());
  await writeFile(destination,html);
}
await writeFile(join(out,'data.js'),'window.HANZIFUN = '+JSON.stringify({characters,decks,names,articles})+';\n');
await writeFile(join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
await writeFile(join(out,'routes.json'),JSON.stringify(pages.map(p=>p.path),null,2));
// Copy only the existing site's allowlisted public build, never the source tree.
const legacy=join(root,'..','dist');
try{await access(join(legacy,'index.html'));await cp(legacy,join(out,'legacy'),{recursive:true});}
catch{throw new Error('Build the existing public site first: npm run build:site');}
console.log('Built '+pages.length+' preview pages and the existing Chinese experience into prototype/dist.');
