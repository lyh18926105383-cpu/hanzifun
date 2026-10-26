// Restore ignored original archives using exact locked bytes. Never refresh a release silently.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,readJSON,fileHash} from './data-foundation-lib.mjs';
const lock=readJSON('data/sources.lock.json'),cache=path.join(root,'.cache/hf07');fs.mkdirSync(cache,{recursive:true});
for(const id of ['hsk-2-2015','hsk-3-2025']){
 const source=lock.sources.find(s=>s.id===id),target=path.join(cache,source.file);
 if(!fs.existsSync(target)){
  const partial=target+'.partial';
  try{execFileSync('curl',['--fail','--location','--silent','--show-error','--max-time','45',source.downloadUrl||source.url,'-o',partial],{stdio:'inherit'});
   if(fileHash(partial)!==source.sha256)throw Error('Source release changed: '+id+'; review before replacing lock');fs.renameSync(partial,target);
  }finally{fs.rmSync(partial,{force:true});}
 }
 if(fileHash(target)!==source.sha256)throw Error('Cached source changed: '+id);
 console.log(id+' locked hash OK');
}
