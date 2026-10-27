// A click starts one recording or one Mandarin utterance. No autoplay or English fallback.
export function chooseMandarinVoice(voices){
 const lang=v=>(v.lang||'').replaceAll('_','-').toLowerCase();
 return voices.find(v=>/^zh-(cn|hans)(-|$)/.test(lang(v)))||voices.find(v=>/^cmn(-|$)/.test(lang(v)))||voices.find(v=>/^zh-(tw|hant)(-|$)/.test(lang(v)))||voices.find(v=>lang(v)==='zh')||null;
}
export function createPronunciationPlayer({makeAudio=url=>new Audio(url),speech=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let revision=0,active=null,voiceWait=null;
 const stop=()=>{
  revision++;if(voiceWait){voiceWait();voiceWait=null;}
  if(active){const old=active;active=null;clearTimer(old.timer);if(old.audio){old.audio.onended=null;old.audio.onerror=null;old.audio.pause();old.audio.currentTime=0;}if(old.utterance&&speech)speech.cancel();old.state('idle');}
 };
 const waitVoice=()=>new Promise(resolve=>{
  const existing=chooseMandarinVoice(speech?.getVoices?.()||[]);if(existing||!speech){resolve(existing);return;}
  let timer;const done=()=>{clearTimer(timer);speech.removeEventListener?.('voiceschanged',changed);voiceWait=null;resolve(chooseMandarinVoice(speech.getVoices()));};
  const changed=()=>{if(chooseMandarinVoice(speech.getVoices()))done();};voiceWait=done;speech.addEventListener?.('voiceschanged',changed);timer=setTimer(done,2000);
 });
 async function speak(text,current,state){
  if(!speech||!Utterance){state('error','Try audio in a browser with a Mandarin voice.');return false;}
  const voice=await waitVoice();if(current!==revision)return false;
  if(!voice){state('error','Add a Mandarin voice in your device speech settings, then try again.');return false;}
  try{
   const utterance=new Utterance(text),item={utterance,state,timer:null};active=item;utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=0.85;
   const finish=(status,message)=>{if(active!==item)return;clearTimer(item.timer);active=null;state(status,message);};
   utterance.onstart=()=>{if(active===item){clearTimer(item.timer);state('playing','Playing Mandarin speech.');item.timer=setTimer(()=>{stop();state('error','Try again after checking device audio.');},Math.max(15000,text.length*1500));}};
   utterance.onend=()=>finish('idle','Finished.');utterance.onerror=()=>finish('error','Try again after checking device audio.');
   item.timer=setTimer(()=>{stop();state('error','Try again after checking device audio.');},8000);
   speech.resume?.();speech.speak(utterance);return true;
  }catch{if(active){clearTimer(active.timer);active=null;}state('error','Try again after checking device audio.');return false;}
 }
 return {stop,async play({url='',text=''},state=()=>{}){
  stop();const current=revision;state('loading','Preparing pronunciation…');
  if(url){
   if(!/^\/audio\/pronunciation-v1\/[a-z0-9-]+\.mp3$/.test(url)){state('error','Please reload and try again.');return false;}
   const audio=makeAudio(url),item={audio,state,timer:null};active=item;
   audio.onended=()=>{if(active===item){clearTimer(item.timer);active=null;state('idle','Finished.');}};
   // A failed static request can use Chinese speech, with a fresh generation check.
   const fallback=async()=>{if(active!==item||current!==revision)return false;clearTimer(item.timer);active=null;audio.pause();audio.onerror=null;audio.onended=null;return speak(text,current,state);};
   audio.onerror=()=>{void fallback();};
   item.timer=setTimer(()=>{void fallback();},8000);
   try{await audio.play();if(active===item&&current===revision){clearTimer(item.timer);state('playing','Playing recording.');return true;}return false;}catch{return fallback();}
  }
  return speak(text,current,state);
 }};
}
export function mountPronunciation(document,window){
 const player=createPronunciationPlayer(),status=document.querySelector('[data-pronunciation-status]');
 const buttons=[...document.querySelectorAll('[data-pronunciation]')];
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-pronunciation-stop')){player.stop();if(status)status.textContent='Audio stopped.';return;}
  if(!button.hasAttribute('data-pronunciation'))return;
  void player.play({url:button.dataset.audioUrl,text:button.dataset.speechText},(state,message)=>{
   button.setAttribute('aria-pressed',String(state==='playing'));button.dataset.playbackState=state;
   if(status&&message)status.textContent=message;
  });
 });
 // Changing the reading or hiding the page stops speech from the previous context.
 document.querySelector('[data-reading-select]')?.addEventListener('change',()=>player.stop());
 window.addEventListener('hanzifun-pronunciation-stop',()=>player.stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)player.stop();});window.addEventListener('pagehide',()=>player.stop());
 return {player,buttons};
}
if(typeof document!=='undefined')mountPronunciation(document,window);
