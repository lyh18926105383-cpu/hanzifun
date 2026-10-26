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
