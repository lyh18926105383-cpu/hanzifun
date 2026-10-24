/* Local prototype interactions. No analytics, accounts, or external requests. */
(() => {
  'use strict';
  const data=window.HANZIFUN;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const charLink=char=>'/dictionary/'+encodeURIComponent(char)+'/';
  const normalize=value=>String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-–—]/g,' ').trim();
  const params=new URLSearchParams(location.search);
  const storageKey='hanzifun.prototype.learning.v1';
  const validChars=new Set(data.characters.map(c=>c.char));
  const emptyLearning=()=>({version:1,characters:{},saved:[],sessions:[]});
  const loadLearning=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(storageKey));
      if(!value||value.version!==1||!value.characters||!Array.isArray(value.saved)||!Array.isArray(value.sessions))return emptyLearning();
      const clean=emptyLearning();
      for(const [char,record] of Object.entries(value.characters)){
        if(validChars.has(char)&&record&&typeof record.known==='boolean'&&Number.isFinite(record.attempts)&&record.attempts>=1){
          clean.characters[char]={known:record.known,attempts:Math.floor(record.attempts),seenAt:typeof record.seenAt==='string'?record.seenAt:''};
        }
      }
      clean.saved=[...new Set(value.saved.filter(c=>validChars.has(c)))];
      clean.sessions=value.sessions.filter(s=>s&&data.decks.some(d=>d.slug===s.deck)&&Array.isArray(s.chars)&&s.chars.length&&s.chars.every(c=>validChars.has(c))&&Number.isFinite(s.count)&&s.count>0&&Number.isFinite(s.again)&&s.again>=0&&s.again<=s.count&&typeof s.title==='string'&&Number.isFinite(Date.parse(s.finishedAt))).slice(0,30);
      return clean;
    }catch{return emptyLearning();}
  };
  const learning=loadLearning();
  let savedOnDevice=true;
  const saveLearning=()=>{
    try{localStorage.setItem(storageKey,JSON.stringify(learning));savedOnDevice=true;}
    catch{savedOnDevice=false;const toast=$('#toast');toast.hidden=false;toast.textContent='This browser cannot save progress right now. You can still practise on this page.';}
  };
  const wordCollection=()=>[...new Set([...learning.saved,...Object.keys(learning.characters)])];
  const wordsToReview=()=>Object.keys(learning.characters).filter(c=>!learning.characters[c].known);
  const dateLabel=value=>new Date(value).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const learningCards=chars=>'<div class="saved-word-grid">'+chars.map(char=>{
    const item=data.characters.find(c=>c.char===char),record=learning.characters[char];
    return '<article class="saved-word"><a href="'+charLink(char)+'"><span lang="zh-CN">'+char+'</span><strong>'+item.pinyin+'</strong><small>'+item.meaning+'</small></a><span class="word-status '+(record?.known?'familiar':'')+'">'+(record?(record.known?'Familiar':'Ready to review'):'Saved · not practised')+'</span><a class="text-link" href="/flashcards/?char='+encodeURIComponent(char)+'">Practise →</a></article>';
  }).join('')+'</div>';
  $$('[data-save-char]').forEach(button=>{
    const char=button.dataset.saveChar;
    const update=()=>{const saved=wordCollection().includes(char);button.setAttribute('aria-pressed',String(saved));button.textContent=saved?'Saved to my words ✓':'Save to my words';button.disabled=saved;};
    button.addEventListener('click',()=>{if(!validChars.has(char))return;learning.saved=[...new Set([...learning.saved,char])];saveLearning();update();});
    update();
  });
  const menuButton=$('[data-menu-toggle]');
  menuButton?.addEventListener('click',()=>{
    const open=menuButton.getAttribute('aria-expanded')!=='true';
    menuButton.setAttribute('aria-expanded',String(open));
    $('#mobile-menu').hidden=!open;
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    $$('.nav-group[open]').forEach(item=>item.open=false);
    if(menuButton?.getAttribute('aria-expanded')==='true'){
      menuButton.setAttribute('aria-expanded','false');$('#mobile-menu').hidden=true;menuButton.focus();
    }
  });
  $$('.nav-group').forEach(group=>group.addEventListener('toggle',()=>{
    if(group.open)$$('.nav-group').filter(item=>item!==group).forEach(item=>item.open=false);
  }));
  document.addEventListener('click',event=>{
    if(!event.target.closest('.nav-group'))$$('.nav-group').forEach(item=>item.open=false);
  });
  $('[data-print]')?.addEventListener('click',()=>window.print());
  $('[data-hero-flip]')?.addEventListener('click',event=>{
    const button=event.currentTarget;
    const flipped=button.classList.toggle('is-flipped');
    button.setAttribute('aria-pressed',String(flipped));
    button.setAttribute('aria-label',flipped?'Show the picture for 休, rest':'Flip the visual card for 休, rest');
    $('.card-front',button).setAttribute('aria-hidden',String(flipped));
    $('.card-back',button).setAttribute('aria-hidden',String(!flipped));
  });
  $('[data-mini-flip]')?.addEventListener('click',event=>{
    const revealed=event.currentTarget.getAttribute('aria-pressed')!=='true';
    event.currentTarget.setAttribute('aria-pressed',String(revealed));
    $('[data-mini-meaning]').textContent=revealed?'yuè · moon / month':'Tap to remember the meaning';
    $('[data-mini-feedback]').textContent=revealed?'How familiar did it feel?':'Take a moment to recall, then turn the card.';
  });
  $$('[data-mini-mark]').forEach(button=>button.addEventListener('click',()=>{
    $('[data-mini-feedback]').textContent=button.dataset.miniMark==='known'?'A familiar shape! Try the full six-card sample.':'A second look helps. Try the full sample to review a set.';
    $('[data-mini-meaning]').textContent='yuè · moon / month';
    $('[data-mini-flip]').setAttribute('aria-pressed','true');
  }));
  $$('[data-word]').forEach(button=>button.addEventListener('click',()=>{
    const item=data.characters.find(c=>c.char===button.dataset.word);
    const reveal=$('[data-word-reveal]',button.closest('.scenario-demo'));
    reveal.innerHTML='<span class="word-char" lang="zh-CN">'+item.char+'</span><div><strong>'+item.pinyin+' · '+item.meaning+'</strong><p>'+(item.char==='请'?'A polite beginning to a request.':'The character for water.')+'</p></div><a href="'+charLink(item.char)+'" aria-label="Explore '+item.char+'">↗</a>';
  }));
  const practice=$('[data-practice]');
  if(practice){
    const selected=data.decks.find(d=>d.slug===practice.dataset.deck)||data.decks[0];
    const single=data.characters.find(c=>c.char===params.get('char'));
    const reviewType=params.get('review');
    const reviewChars=reviewType==='weak'?wordsToReview():reviewType==='saved'?wordCollection():null;
    if(reviewChars&&!reviewChars.length){
      practice.innerHTML='<div class="empty-state"><h2>A fresh start.</h2><p>There are no characters in this collection yet.</p><a class="text-link" href="/flashcards/decks/first-six/">Try the starter set →</a></div>';
      return;
    }
    const previousWords=params.has('words')?[...new Set(Array.from(params.get('words')))].filter(c=>validChars.has(c)):null;
    const original=reviewChars||(previousWords?.length?previousWords:single?[single.char]:selected.chars);
    const sessionTitle=reviewChars?(reviewType==='weak'?'Another look':'My saved words'):previousWords?.length?'Revisited practice set':single?'Character: '+single.char:selected.title;
    let queue=[...original],index=0,revealed=false,again=[],sessionSaved=false;
    const flip=$('[data-practice-flip]',practice),controls=$('.practice-controls',practice),summary=$('[data-summary]',practice),instruction=$('[data-practice-instruction]',practice);
    const render=()=>{
      if(index>=queue.length){
        if(!sessionSaved){
          learning.sessions.unshift({deck:selected.slug,title:sessionTitle,chars:[...queue],count:queue.length,again:again.length,finishedAt:new Date().toISOString()});
          learning.sessions=learning.sessions.slice(0,30);
          saveLearning();sessionSaved=true;
        }
        flip.hidden=true;controls.hidden=true;instruction.hidden=true;summary.hidden=false;
        $('[data-progress]',practice).textContent='Set complete';
        summary.innerHTML='<p class="eyebrow">A small step forward</p><h2>You met '+queue.length+' character'+(queue.length===1?'':'s')+'.</h2><p>'+again.length+' marked for another look.</p><div class="actions">'+(again.length?'<button class="button" data-review-again>Review these '+again.length+'</button>':'')+'<button class="button button-outline" data-restart>Start again</button></div><p class="muted" style="font-size:12px;margin-top:24px">'+(savedOnDevice?'Saved on this device.':'Progress could not be saved in this browser.')+' <a href="/account/">View my learning →</a></p>';
        $('[data-review-again]',summary)?.addEventListener('click',()=>{queue=[...again];index=0;again=[];revealed=false;sessionSaved=false;render();flip.focus();});
        $('[data-restart]',summary).addEventListener('click',()=>{queue=[...original];index=0;again=[];revealed=false;sessionSaved=false;render();flip.focus();});
        summary.querySelector('button').focus();
        return;
      }
      flip.hidden=false;controls.hidden=false;instruction.hidden=false;summary.hidden=true;
      const item=data.characters.find(c=>c.char===queue[index]);
      $('[data-progress]',practice).textContent=(index+1)+' / '+queue.length;
      flip.setAttribute('aria-pressed',String(revealed));
      flip.setAttribute('aria-label',revealed?'Show the front of '+item.char:'Reveal the meaning of '+item.char);
      flip.classList.toggle('has-art',Boolean(item.art&&!revealed));
      flip.innerHTML=(!revealed&&item.art?'<img class="practice-art" src="/assets/hero.png" alt="">':'')+'<span class="practice-hanzi" lang="zh-CN">'+item.char+'</span>'+
        (revealed?'<span class="practice-pinyin">'+item.pinyin+' · '+item.meaning+'</span><span class="practice-meaning">'+item.cue+'</span><span class="practice-hint">'+item.example+' — '+item.translation+'</span>':'<span class="practice-hint">Tap to reveal the meaning ⟳</span>');
      $$('[data-rate]',practice).forEach(button=>button.disabled=!revealed);
      instruction.textContent=revealed?'How familiar did it feel?':'Try to recall the meaning, then flip the card.';
    };
    flip.addEventListener('click',()=>{revealed=!revealed;render();});
    $$('[data-rate]',practice).forEach(button=>button.addEventListener('click',()=>{
      if(!revealed)return;
      if(button.dataset.rate==='again')again.push(queue[index]);
      const char=queue[index];
      learning.characters[char]={known:button.dataset.rate==='known',attempts:(learning.characters[char]?.attempts||0)+1,seenAt:new Date().toISOString()};
      saveLearning();
      index++;revealed=false;render();
      if(index<queue.length)flip.focus();
    }));
    render();
  }
  const dashboard=$('[data-learning-dashboard]');
  if(dashboard){
    const studied=Object.keys(learning.characters),weak=wordsToReview(),known=studied.filter(c=>learning.characters[c].known),saved=wordCollection();
    dashboard.innerHTML='<div class="learning-stats"><article><span class="eyebrow">Characters practised</span><strong>'+studied.length+'</strong><small>'+known.length+' feeling familiar</small></article><article><span class="eyebrow">Ready for another look</span><strong>'+weak.length+'</strong><small>Based on your latest choices</small></article><article><span class="eyebrow">Practice sessions</span><strong>'+learning.sessions.length+'</strong><small>Completed sets · latest 30</small></article></div>'+
      '<section class="learning-next"><div><p class="eyebrow">Your next small step</p><h2>'+(weak.length?'Make a familiar connection.':'Discover a little more.')+'</h2><p>'+(weak.length?'Return to the characters you marked for another look.':'Begin with a short set. Your choices will build your learning record.')+'</p></div><a class="button" href="'+(weak.length?'/flashcards/?review=weak':'/flashcards/decks/first-six/')+'">'+(weak.length?'Review '+weak.length+' characters':'Try your first set')+' →</a></section>'+
      '<div class="section-heading learning-heading"><div><p class="eyebrow">Your collection</p><h2>Words to come back to.</h2></div><a class="text-link" href="/flashcards/my-words/">All '+saved.length+' words →</a></div>'+
      (saved.length?learningCards(saved.slice(0,6)):'<div class="empty-state"><h3>A collection begins with one character.</h3><p>Save a character from the dictionary, or practise a small set.</p><a class="text-link" href="/dictionary/">Explore the dictionary →</a></div>')+
      '<section class="learning-history"><p class="eyebrow">A record of your practice</p><h2>Recent sessions.</h2>'+
      (learning.sessions.length?'<ol class="session-list">'+learning.sessions.slice(0,8).map(s=>'<li><div><strong>'+escape(s.title)+'</strong><small>'+escape(dateLabel(s.finishedAt))+'</small></div><p>'+s.count+' practised <span>·</span> '+s.again+' for another look</p><a href="/flashcards/?words='+encodeURIComponent(s.chars.join(''))+'">Revisit set ↗</a></li>').join('')+'</ol>':'<p class="muted">Finish a practice set to see your first session here.</p>')+'</section>';
  }
  const myWords=$('[data-my-words]');
  if(myWords){
    const saved=wordCollection(),weak=wordsToReview();
    myWords.innerHTML=saved.length?'<div class="actions" style="margin-bottom:30px"><a class="button" href="/flashcards/?review=saved">Practise all '+saved.length+' words →</a>'+(weak.length?'<a class="button button-outline" href="/flashcards/?review=weak">Review '+weak.length+' less familiar →</a>':'')+'</div>'+learningCards(saved):'<div class="empty-state"><h2>Your collection begins here.</h2><p>Save a character from the dictionary, or practise a set. Both will appear in this collection.</p><a class="text-link" href="/dictionary/">Find your first character →</a></div>';
  }
  const nameForm=$('[data-name-form]');
  if(nameForm){
    const nameInput=$('[name=name]',nameForm),styleInput=$('[name=style]',nameForm);
    nameInput.value=(params.get('name')||'').slice(0,50);
    styleInput.value=Object.hasOwn(data.names,params.get('style'))?params.get('style'):'calm';
    const showName=()=>{
      const item=data.names[styleInput.value]||data.names.calm;
      const personal=nameInput.value.trim();
      $('[data-name-result]').innerHTML='<p class="eyebrow">Curated example'+(personal?' · for '+escape(personal):'')+'</p><h2 lang="zh-CN">'+item.name+'</h2><p class="name-reading">'+item.pinyin+'</p><p><strong>'+item.meaning+'</strong></p><p>'+item.explanation+'</p><div class="character-chips">'+item.chars.map(c=>'<a href="'+charLink(c)+'" lang="zh-CN" aria-label="Learn '+c+'">'+c+'</a>').join('')+'</div><p>Tap a character to explore its pronunciation, meaning, and memory cue.</p><p class="muted" style="font-size:11px;margin-top:23px">A style example, not a personalized naming recommendation. A complete naming tool would also consider pronunciation, preferences, and cultural context.</p>';
    };
    nameForm.addEventListener('submit',event=>{event.preventDefault();showName();});
    showName();
  }
  const search=$('#search-results');
  if(search){
    const query=(params.get('q')||'').slice(0,100).trim();
    $('#search-input').value=query;
    if(query){
      const terms=normalize(query);
      const chars=data.characters.filter(c=>normalize([c.char,c.pinyin,c.meaning,c.example].join(' ')).includes(terms));
      const decks=data.decks.filter(d=>normalize([d.title,d.description,d.chars.join('')].join(' ')).includes(terms));
      const stories=data.articles.filter(a=>normalize([a.title,a.keywords,a.category].join(' ')).includes(terms));
      const count=chars.length+decks.length+stories.length;
      search.innerHTML='<p class="muted">'+count+' result'+(count===1?'':'s')+' for “'+escape(query)+'”</p>'+
        (chars.length?'<section class="search-section"><h2>Characters</h2><div class="char-grid">'+chars.map(c=>'<a class="char-tile" href="'+charLink(c.char)+'"><span lang="zh-CN">'+c.char+'</span><strong>'+c.pinyin+'</strong><small>'+c.meaning+'</small></a>').join('')+'</div></section>':'')+
        (decks.length?'<section class="search-section"><h2>Flashcard sets</h2><div class="tile-grid">'+decks.map(d=>'<article class="tile"><h3>'+d.title+'</h3><p>'+d.description+'</p><a class="text-link" href="/flashcards/decks/'+d.slug+'/">Open the set →</a></article>').join('')+'</div></section>':'')+
        (stories.length?'<section class="search-section"><h2>Journal stories</h2><div class="tile-grid">'+stories.map(a=>'<article class="tile"><span class="tag">SAMPLE STORY</span><h3>'+a.title+'</h3><a class="text-link" href="/blog/'+a.slug+'/">Read the story →</a></article>').join('')+'</div></section>':'')+
        (!count?'<div class="empty-state" style="margin-top:25px"><h2>A new discovery for another day.</h2><p>This preview has a small sample collection. Try 水, shui, water, or mid-autumn.</p><a class="text-link" style="margin-top:22px" href="/dictionary/">Browse the sample dictionary →</a></div>':'');
    }
  }
  const strokes=$('[data-strokes]');
  if(strokes){
    let step=0;
    const render=()=>{
      $$('.stroke',strokes).forEach((stroke,i)=>{stroke.classList.toggle('active',i===step-1);stroke.classList.toggle('done',i<step-1);});
      $('[data-stroke-count]',strokes).textContent=step+' / 4 strokes'+(step===4?' · 木 is complete.':'');
      $('[data-stroke-next]',strokes).disabled=step===4;
    };
    $('[data-stroke-next]',strokes).addEventListener('click',()=>{step=Math.min(4,step+1);render();});
    $('[data-stroke-reset]',strokes).addEventListener('click',()=>{step=0;render();$('[data-stroke-next]',strokes).focus();});
  }
  $$('nav.subnav a, [data-dictionary-menu] a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
})();
