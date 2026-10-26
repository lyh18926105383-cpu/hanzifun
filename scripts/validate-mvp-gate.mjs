import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {reviewInputs,characterReviewState} from '../site/publication-review.mjs';
import {manualScopes} from './mvp-manual-scopes.mjs';
import {validateBuild} from './validate-seo-quality.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),cache=path.join(root,'.cache/hf09'),evidence=path.join(root,'docs/hanzifun-rebuild/evidence/hf09');
const hash=b=>createHash('sha256').update(b).digest('hex');
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]).sort();
export function buildFingerprint(dir){const listing=files(dir).map(f=>[path.relative(dir,f),hash(fs.readFileSync(f))]);return {files:listing.length,sha256:hash(JSON.stringify(listing))};}
export function manualInventory(){return [...reviewInputs.core,...reviewInputs.supplemental.characters].map(c=>{const {teaching,...s}=characterReviewState(c.characterId);return s;});}
export function runGate({browser=false,requireHuman=false}={}){
 fs.mkdirSync(cache,{recursive:true});fs.mkdirSync(evidence,{recursive:true});
 const report={date:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),branch:execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),deployment:'NOT DEPLOYED',checks:[],builds:{},failures:[],manualBlockers:[],limitations:['Human content/listening, real device/browser/screen-reader acceptance is never inferred','Local production-mode package is not a production deployment']};
 if(report.branch!=='main')throw Error('HF09 must run in main');
 report.fingerprintScope='Product/code/data files and explicit root config; includes nonignored new sources, excludes docs and pre-existing unrelated user files';
 const sourceFiles=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(p=>p&&(/^(?:site|src|scripts|tests|data|assets|audio)\//.test(p)||['package.json','package-lock.json','characters.js','lessons.js','story.js','story.html','story.css','storage.js','audio.js','audio-manifest.json','tts-corpus.js','styles.css','index.html','wrangler.toml','.gitignore'].includes(p))&&fs.existsSync(path.join(root,p)));
 report.inputSha256=hash(JSON.stringify(sourceFiles.sort().map(p=>[p,hash(fs.readFileSync(path.join(root,p)))])));
 function run(name,args,extra={}){const r=spawnSync(args[0],args.slice(1),{cwd:root,env:{...process.env,...extra},encoding:'utf8',maxBuffer:20*1024*1024});fs.writeFileSync(path.join(cache,name+'.log'),(r.stdout||'')+(r.stderr||''));report.checks.push({name,status:r.status===0?'PASS':'FAIL',logSha256:hash((r.stdout||'')+(r.stderr||''))});if(r.status!==0){report.failures.push(name+': '+(r.error?.message||'exit '+r.status));console.error((r.stdout||'').slice(-2500),(r.stderr||'').slice(-2500));}console.log(name+': '+(r.status===0?'PASS':'FAIL'));return r.status===0;}
 run('tests',['npm','test']);run('benchmark',['node','scripts/benchmark-guest-learning.mjs'],{HF06_BENCHMARK_OUTPUT:path.join(evidence,'learning-benchmark.json')});run('data',['node','scripts/validate-data-foundation.mjs']);run('hsk',['node','scripts/validate-hsk-data.mjs']);
 for(const name of ['production','production-repeat','staging','local']){
  const dir=path.join(cache,name),env=name.startsWith('production')?'production':name;
  if(run('build-'+name,['node','scripts/build-site.js'],{HF_SITE_ENV:env,HF_BUILD_OUTPUT_DIR:dir})){
   const seo=validateBuild(dir);report.builds[name]={...buildFingerprint(dir),...seo};report.failures.push(...seo.errors);
   const componentMirror='site-assets/dictionary/source-extracts/components.json';if(hash(fs.readFileSync(path.join(dir,componentMirror)))!==hash(fs.readFileSync(path.join(root,'data/source-extracts/components.json'))))report.failures.push('Attribution component source mirror changed');
   const forbidden=files(dir).map(f=>path.relative(dir,f)).filter(f=>f!=='site-assets/dictionary/source-extracts/components.json').filter(f=>/(^|\/)(?:\.env(?:\.|$)|node_modules|\.cache|storyboards|tests|docs|source-extracts)(\/|$)/.test(f));if(forbidden.length)report.failures.push('Forbidden build files: '+forbidden.join(','));
  }
 }
 if(report.builds.production?.sha256!==report.builds['production-repeat']?.sha256)report.failures.push('Nondeterministic production build');
 if(report.builds.production){
  const require=createRequire(import.meta.url),lessons=require('../lessons.js'),cards=require('../characters.js');
  const preserved=['characters.js','lessons.js','story.js','story.css','story.html','storage.js','audio-manifest.json',...files(path.join(root,'assets/lessons')).filter(f=>path.basename(f)!=='.DS_Store').map(f=>path.relative(root,f)),...files(path.join(root,'audio/tts-v1')).filter(f=>f.endsWith('.mp3')).map(f=>path.relative(root,f))];
  const changed=execFileSync('git',['diff','HEAD','--name-only','--',...preserved],{cwd:root,encoding:'utf8'}).trim();
  const missing=preserved.filter(p=>!fs.existsSync(path.join(cache,'production',p))||hash(p==='story.html'?fs.readFileSync(path.join(root,p),'utf8').replaceAll('href="index.html"','href="/zh/"'):fs.readFileSync(path.join(root,p)))!==hash(fs.readFileSync(path.join(cache,'production',p))));
  report.preservation={intentionalTransform:'story.html: href=index.html → href=/zh/ only; .DS_Store and nonpublic corpus excluded',positions:cards.length,uniqueCharacters:new Set(cards.map(c=>c.char)).size,lessons:lessons.map(l=>l.id),files:preserved.length,changedSinceHead:changed,buildMismatches:missing};
  if(cards.length!==108||new Set(cards.map(c=>c.char)).size!==107||lessons.length!==8||changed||missing.length)report.failures.push('Legacy baseline preservation failed');
  run('workers-http',['node','scripts/verify-mvp-http.mjs']);
 }
 if(browser&&report.builds.production)run('browser',['node','scripts/verify-mvp-browser.mjs'],{HF_BUILD_OUTPUT_DIR:path.join(cache,'production'),HF09_BROWSER_OUTPUT:path.join(cache,'browser')});
 else report.manualBlockers.push('Browser E2E not run in this invocation');
 const inventory=manualInventory();fs.writeFileSync(path.join(evidence,'review-inventory.json'),JSON.stringify({version:'hf09-v1',items:inventory},null,2)+'\n');
 const core=inventory.filter(i=>!i.supplemental);report.coverage={core:core.length,supplemental:inventory.length-core.length,coreHumanAccepted:core.filter(i=>i.accepted).length,supplementalHumanAccepted:inventory.filter(i=>i.supplemental&&i.accepted).length,coreContentComplete:core.filter(i=>i.contentComplete).length};
 if(report.coverage.coreHumanAccepted!==126)report.manualBlockers.push('126 core Tier2 human acceptance incomplete');
 const scopes=manualScopes();fs.writeFileSync(path.join(evidence,'manual-scopes.json'),JSON.stringify({scopes},null,2)+'\n');
 report.manualBlockers.push(...scopes.filter(s=>!s.accepted).map(s=>s.id+': '+s.scope));
 report.engineeringStatus=report.failures.length?'FAIL':'PASS';report.candidateAcceptance=report.failures.length?'FAIL':report.manualBlockers.length?'BLOCKED':'PASS';
 fs.writeFileSync(path.join(evidence,'gate.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({engineeringStatus:report.engineeringStatus,candidateAcceptance:report.candidateAcceptance,failures:report.failures,coverage:report.coverage},null,2));
 return {report,exitCode:report.failures.length?1:requireHuman&&report.manualBlockers.length?2:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.exitCode=runGate({browser:process.argv.includes('--browser'),requireHuman:process.argv.includes('--require-human')}).exitCode;}catch(e){console.error(e);process.exitCode=1;}}
