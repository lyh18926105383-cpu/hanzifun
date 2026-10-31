import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {editorialContent,articleHash,validateEditorial} from '../site/editorial-workflow.mjs';
export function applyDecisions(content,decisions){
 const next=structuredClone(content),seen=new Set();
 if(!Array.isArray(decisions)||!decisions.length)throw Error('Supply human review decisions');
 for(const d of decisions){
  const a=next.articles.find(a=>a.slug===d.slug);
  if(!a||seen.has(d.slug)||a.status==='archived')throw Error('Unknown, duplicate or archived article');seen.add(d.slug);
  if(d.acceptance!=='approved'||d.kind!=='human'||typeof d.reviewer!=='string'||!d.reviewer.trim()||!d.evidence||!d.date||d.contentSha256!==articleHash(a))throw Error('Human decision incomplete or stale: '+d.slug);
  a.status='reviewed';a.review={acceptance:'approved',reviewer:d.reviewer,date:d.date,contentSha256:d.contentSha256,evidence:d.evidence};
 }
 validateEditorial(next);return next;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const index=process.argv.indexOf('--decision');if(index<0)throw Error('Usage: node scripts/review-editorial.mjs --decision decision.json [--apply]');
 const result=applyDecisions(editorialContent,JSON.parse(fs.readFileSync(process.argv[index+1],'utf8')));
 if(process.argv.includes('--apply')){const target=new URL('../content/editorial/articles.json',import.meta.url),temp=new URL('../content/editorial/articles.json.tmp',import.meta.url);fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n');fs.renameSync(temp,target);}
 console.log(JSON.stringify({mode:process.argv.includes('--apply')?'applied':'dry-run',...validateEditorial(result)}));
}
