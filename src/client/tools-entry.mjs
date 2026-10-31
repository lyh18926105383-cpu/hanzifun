import {setPublishedCatalog,mountCulturalTools} from './cultural-tools.mjs';
import {openTeacherStorage,createTeacherDecks,mountTeacherWorkspace} from './teacher-decks.mjs';
const status=document.querySelector('[data-local-status]');
for(const form of document.querySelectorAll('[data-cultural-form],.hf-teacher-form'))form.addEventListener('submit',event=>event.preventDefault());
try{
 const response=await fetch('/site-assets/tools/published-catalog.json');if(!response.ok)throw Error('Could not load the character list. Reload to retry.');
 const catalog=setPublishedCatalog(await response.json()),workspace=document.querySelector('[data-teacher-workspace]');
 if(workspace){const storage=await openTeacherStorage({indexedDB:globalThis.indexedDB,localStorage:globalThis.localStorage}),repo=createTeacherDecks({storage,catalog});await mountTeacherWorkspace(workspace,repo,catalog);}
 else mountCulturalTools(document,{catalog,saveCharacter:async characterId=>{const adapter=window.HanziFunLearningAdapter;if(!adapter)return {saved:false,reason:'Learning storage is still loading. Please retry.'};try{return await adapter.saveCharacter({characterId});}catch(error){return {saved:false,reason:error.message};}}});
 for(const fieldset of document.querySelectorAll('[data-local-form]'))fieldset.disabled=false;
 document.documentElement.setAttribute('data-local-tools-ready','true');
}catch(error){if(status)status.textContent=error.message||'Could not open browser storage. Reload to retry.';}
