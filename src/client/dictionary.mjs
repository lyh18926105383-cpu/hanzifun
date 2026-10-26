if(document.querySelector('[data-hf-save], [data-hf-practice]')&&!window.HanziFunLearningAdapter) {
  document.querySelectorAll('[data-hf-save], [data-hf-practice]').forEach(b=>b.disabled=true);
  window.addEventListener('hanzifun-learning-ready',()=>document.querySelectorAll('[data-hf-save], [data-hf-practice]').forEach(b=>b.disabled=false),{once:true});
  import('./hf06/client/guest-learning.mjs').catch(()=>{document.querySelector('[data-hf-save-status]').textContent='Learning could not load. Reload to retry.';});
}
import { normalizeQuery, searchEntries, supportedCharacter } from './search-core.hf04-v1.mjs';
import { mountStrokePanel } from './stroke-order.hf04-v1.mjs';
import { saveCharacter, startCharacterPractice } from './learning-entry.hf04-v1.mjs';
const params=new URLSearchParams(location.search);
const json=async url=>{const response=await fetch(url);if(!response.ok)throw new Error('Unavailable');return response.json();};
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const resultRoot=document.querySelector('[data-hf-results]'), form=document.querySelector('[data-hf-search]');
if(form && resultRoot) {
  let shards=null, request=0;
  const render=async(value,relaxTone=false)=>{
    const current=++request, query=normalizeQuery(value);resultRoot.replaceChildren();
    if(!query){resultRoot.textContent=value?'Enter a query of at most 100 characters, without control characters.':'Enter a character, pinyin or English meaning to start.';return;}
    resultRoot.textContent='Loading the learning index…';
    try {
      if(!shards)shards=(await Promise.all(['characters','words','library'].map(name=>json('/site-assets/search/'+name+'.hf04-v1.json')))).flat();
      if(current!==request)return;
      const results=searchEntries(shards,value,{relaxTone});resultRoot.replaceChildren(node('p',`${results.length} results · 126 core characters, HSK imports and linked content`));
      for(const group of ['Characters & words','Flashcard sets','Scenarios & articles']) {
        const items=results.filter(item=>item.type===group);if(!items.length)continue;
        resultRoot.append(node('h2',group));const ul=node('ul');
        items.slice(0,40).forEach(item=>{const li=node('li'),a=node('a',item.label);a.href=item.url;li.append(a);ul.append(li);});resultRoot.append(ul);
        if(items.length>40)resultRoot.append(node('p',`Showing the first 40 of ${items.length}. Refine your query.`));
      }
      if(!results.length){resultRoot.append(node('p','No matching entry is in this collection. Try a different spelling or browse all 126 characters.'));}
      if(/[1-5]/.test(query)&&!relaxTone){const button=node('button','Search without the tone');button.type='button';button.addEventListener('click',()=>render(value,true));resultRoot.append(button);}
    }catch{if(current!==request)return;resultRoot.replaceChildren(node('p','The search index could not load. Browse the dictionary or try again.'));const retry=node('button','Retry search');retry.type='button';retry.addEventListener('click',()=>render(value,relaxTone));resultRoot.append(retry);}
  };
  form.addEventListener('submit',event=>{event.preventDefault();const value=new FormData(form).get('q');history.replaceState(null,'','?q='+encodeURIComponent(value));render(value);});
  if(params.has('q')){form.elements.q.value=params.get('q');render(params.get('q'));}
}
document.querySelector('[data-reading-select]')?.addEventListener('change',event=>{
  const practiceButton=document.querySelector('[data-hf-practice]');if(practiceButton)practiceButton.dataset.readingId=event.target.value;
  document.querySelectorAll('[data-reading-panel]').forEach(panel=>{panel.hidden=panel.dataset.readingPanel!==event.target.value;});
});
document.querySelectorAll('[data-hf-save]').forEach(button=>button.addEventListener('click',async()=>{
  button.disabled=true;
  const result=await saveCharacter(window.HanziFunLearningAdapter,button.dataset.hfSave);
  document.querySelector('[data-hf-save-status]').textContent=result.saved?'Saved on this device.':result.reason;
  button.disabled=false;
}));
document.querySelectorAll('[data-hf-practice]').forEach(button=>button.addEventListener('click',async()=>{
  button.disabled=true;
  const result=await startCharacterPractice(window.HanziFunLearningAdapter,{characterId:button.dataset.hfPractice,readingId:button.dataset.readingId,source:'dictionary'});
  document.querySelector('[data-hf-practice-status]').textContent=result.started?'Practice session started.':result.reason;
  button.disabled=false;
}));
const panel=document.querySelector('[data-stroke-panel]');
const stroke=panel?mountStrokePanel(panel):null;
const picker=document.querySelector('[data-stroke-picker]');
if(picker && stroke){
  let manifest=null, revision=0;
  const select=async value=>{
    const current=++revision,status=document.querySelector('[data-stroke-picker-status]');
    status.textContent='Checking the supported collection…';
    try{
      if(!manifest)manifest=await json('/site-assets/dictionary/stroke-manifest.hf04-v1.json');
      if(current!==revision)return;
      const glyph=supportedCharacter(value,manifest.map(item=>item.glyph));
      if(!glyph){status.textContent='This character is not in the supported collection. Choose one from the list.';return;}
      picker.elements.char.value=glyph;stroke.select(manifest.find(item=>item.glyph===glyph));
      status.textContent=`Selected ${glyph}. Load or play to fetch only this character’s strokes.`;
    }catch{status.textContent='The character list could not load. Submit again to retry, or use the dictionary links below.';}
  };
  picker.addEventListener('submit',event=>{event.preventDefault();const value=picker.elements.char.value;history.replaceState(null,'','?char='+encodeURIComponent(value));select(value);});
  if(params.has('char'))select(params.get('char'));
}
const pinyinForm=document.querySelector('[data-pinyin-filter]');
if(pinyinForm){
  const filter=()=>{
    const query=normalizeQuery(pinyinForm.elements.syllable.value).replace(/[1-5]$/,'');
    let count=0;
    document.querySelectorAll('[data-syllable]').forEach(detail=>{
      const match=(!query||normalizeQuery(detail.dataset.syllable)===query)&&(!pinyinForm.elements.initial.value||pinyinForm.elements.initial.value===detail.dataset.initial)&&(!pinyinForm.elements.final.value||pinyinForm.elements.final.value===detail.dataset.final);
      detail.hidden=!match;if(match)count++;
    });
    document.querySelector('[data-pinyin-count]').textContent=`${count} syllables match. Explore their tones and example characters.`;
  };
  pinyinForm.addEventListener('submit',event=>{event.preventDefault();filter();});
  pinyinForm.addEventListener('input',filter);pinyinForm.addEventListener('change',filter);
  pinyinForm.addEventListener('reset',()=>queueMicrotask(filter));
  if(location.hash){try{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target?.matches('[data-syllable]'))target.open=true;}catch{/* Malformed fragments leave the readable chart intact. */}}
}

// Context return is limited to local HSK/scenario pages, never arbitrary redirects.
const contextReturn=params.get('returnTo');
if(contextReturn&&/^\/(?:academic\/hsk-[23]\/|scenarios\/(?:travel\/restaurant|business\/icebreakers)\/)(?:[#?]|$)/.test(contextReturn)&&!/[\r\n\\]/.test(contextReturn)){
 const a=node('a','Return to learning context');a.href=contextReturn;document.querySelector('main')?.prepend(a);
}
