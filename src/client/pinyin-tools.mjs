import {convertToneText, formatHanziTokens, numericSyllable, plainPinyin} from './pinyin-core.mjs';
import {createPronunciationPlayer} from './pronunciation.mjs';
const configNode=document.querySelector('[data-pinyin-tool-config]');
const config=configNode?JSON.parse(configNode.textContent):{};
const copyText=async(text,status)=>{try{await navigator.clipboard.writeText(text);status.textContent='Copied to clipboard.';}catch{status.textContent='Copy was blocked by this browser. Select the result and copy it manually.';}};
const el=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};

const converter=document.querySelector('[data-hanzi-converter]');
if(converter){
  const input=converter.querySelector('#hanzi-input'),output=converter.querySelector('#hanzi-result'),format=converter.querySelector('#hanzi-format'),compare=converter.querySelector('#hanzi-compare'),status=converter.querySelector('[data-converter-status]');
  const copy=converter.querySelector('[data-copy-hanzi]');
  let libraryPromise=null,tokens=[],overrides={},revision=0,convertedText='';
  function render(){
    convertedText=formatHanziTokens(tokens,format.value,overrides);output.replaceChildren();
    if(compare.checked){tokens.forEach((token,index)=>{
      if(!token.isZh){output.append(document.createTextNode(token.origin));return;}
      const ruby=el('ruby');ruby.lang='zh-CN';ruby.append(document.createTextNode(token.origin));
      const rt=el('rt',format.value==='numbers'?numericSyllable(overrides[index]||token.pinyin):format.value==='plain'?plainPinyin(overrides[index]||token.pinyin):overrides[index]||token.pinyin);rt.lang='zh-Latn-pinyin';ruby.append(rt);output.append(ruby);
    });}else output.textContent=convertedText;
    copy.disabled=!convertedText;
  }
  async function convert(){
    const current=++revision,value=input.value;overrides={};tokens=[];copy.disabled=true;
    converter.querySelector('[data-corrections]').hidden=true;
    if(!value.trim()){output.textContent='Paste Chinese text to begin.';status.textContent='Enter some Chinese text.';return;}
    if([...value].length>2000){status.textContent='Please use at most 2,000 characters.';return;}
    status.textContent='Loading the local pronunciation dictionary…';
    try{
      libraryPromise??=import('./vendor/pinyin-pro/index.mjs').catch(error=>{libraryPromise=null;throw error;});
      const library=await libraryPromise;if(current!==revision)return;
      tokens=library.pinyin(value,{type:'all',toneSandhi:false});
      render();
      const corrections=converter.querySelector('[data-correction-fields]');corrections.replaceChildren();
      tokens.forEach((token,index)=>{if(!token.isZh||token.polyphonic.length<2)return;
        const label=el('label',`${token.origin} · character ${index+1}`),select=el('select');select.setAttribute('aria-label',`Reading of ${token.origin} at character ${index+1}`);
        [...new Set([token.pinyin,...token.polyphonic])].forEach(reading=>{const option=el('option',reading);option.value=reading;select.append(option);});
        select.value=token.pinyin;select.addEventListener('change',()=>{overrides[index]=select.value;render();status.textContent='Reading updated. Your copied result includes this correction.';});label.append(select);corrections.append(label);
      });
      converter.querySelector('[data-corrections]').hidden=!corrections.children.length;
      const unknown=tokens.filter(t=>!t.isZh&&/\p{Script=Han}/u.test(t.origin));
      status.textContent=unknown.length?`${unknown.length} character(s) could not be transcribed and remain unchanged. Check names and uncommon words.`:tokens.some(t=>t.isZh)?'Converted locally. Check alternative readings, especially for names and uncommon words.':'No Chinese characters found. Other text is kept unchanged.';
    }catch{if(current!==revision)return;output.textContent='The pronunciation dictionary could not load.';status.textContent='Check your connection for the initial dictionary download, then choose Convert to retry. Text is never uploaded.';}
  }
  converter.querySelector('[data-convert]').addEventListener('click',convert);
  format.addEventListener('change',render);compare.addEventListener('change',render);
  input.addEventListener('input',()=>{++revision;tokens=[];overrides={};convertedText='';copy.disabled=true;output.textContent='Choose Convert to update the result.';converter.querySelector('[data-corrections]').hidden=true;status.textContent='Input changed. Convert again to update the result.';});
  converter.querySelector('[data-converter-example]').addEventListener('click',()=>{input.value='银行行长说：重庆的长江很长。學習中文很有趣！';convert();});
  converter.querySelector('[data-clear-hanzi]').addEventListener('click',()=>{input.value='';++revision;tokens=[];overrides={};convertedText='';render();converter.querySelector('[data-corrections]').hidden=true;status.textContent='Cleared.';input.focus();});
  copy.addEventListener('click',()=>copyText(convertedText,status));
}

const editor=document.querySelector('[data-tone-editor]');
if(editor){
  const input=editor.querySelector('#tone-input'),output=editor.querySelector('#tone-output'),mode=editor.querySelector('#tone-mode'),status=editor.querySelector('[data-tone-status]');
  function render(){const result=convertToneText(input.value,mode.value,config.inventory);output.value=result.text;status.textContent=result.unconverted.length?'Some text was left unchanged: '+result.unconverted.slice(0,6).join(', ')+'. Separate marked syllables with spaces and check their spelling.':'Converted on your device. ü, v and u: are supported; lu and lü stay different.';}
  editor.querySelector('[data-convert-tones]').addEventListener('click',render);mode.addEventListener('change',render);
  input.addEventListener('input',render);
  editor.querySelectorAll('[data-insert-pinyin]').forEach(button=>button.addEventListener('click',()=>{input.setRangeText(button.dataset.insertPinyin,input.selectionStart,input.selectionEnd,'end');input.focus();render();}));
  editor.querySelector('[data-copy-tones]').addEventListener('click',()=>copyText(output.value,status));
  editor.querySelector('[data-clear-tones]').addEventListener('click',()=>{input.value='';output.value='';status.textContent='Cleared.';input.focus();});
  render();
}

const quiz=document.querySelector('[data-tone-quiz]');
if(quiz){
  const player=createPronunciationPlayer();
  const result=quiz.querySelector('[data-quiz-result]'),score=quiz.querySelector('[data-quiz-score]'),play=quiz.querySelector('[data-quiz-play]'),answers=[...quiz.querySelectorAll('[data-answer-tone]')];
  let question,answered=false,heard=false,correct=0,total=0,generation=0;
  function next(reset=false){
    player.stop();window.dispatchEvent(new Event('hanzifun-pronunciation-stop'));generation++;
    if(reset){correct=0;total=0;}
    const alternatives=config.quiz.filter(q=>q!==question);question=alternatives[Math.floor(Math.random()*alternatives.length)];
    answered=false;heard=false;answers.forEach(button=>{button.disabled=true;delete button.dataset.correct;});
    play.disabled=false;play.textContent='Play sound';result.textContent='Play the recording, then choose a tone.';score.textContent=`${correct} correct / ${total} answered`;
  }
  play.addEventListener('click',async()=>{
    window.dispatchEvent(new Event('hanzifun-pronunciation-stop'));const current=generation;
    await player.play({url:question.url,text:'',allowSpeechFallback:false},(state,message)=>{
      if(current!==generation)return;
      if(state==='playing'){heard=true;play.textContent='Replay sound';if(!answered)answers.forEach(button=>button.disabled=false);result.textContent=answered?result.textContent:'Choose the tone you heard.';}
      if(state==='error'){heard=false;answers.forEach(button=>button.disabled=true);result.textContent='This sound could not play. Try again or choose Next sound.';}
      if(state==='loading')result.textContent='Preparing the recording…';
    });
  });
  answers.forEach(button=>button.addEventListener('click',()=>{
    if(answered||!heard)return;answered=true;total++;const answer=Number(button.dataset.answerTone),right=answer===question.tone;if(right)correct++;
    button.dataset.correct=String(right);answers.forEach(b=>{b.disabled=true;if(Number(b.dataset.answerTone)===question.tone)b.dataset.correct='true';});
    result.textContent=(right?'Correct. ':'The answer is tone '+question.tone+'. ')+`The syllable is ${question.syllable}, tone ${question.tone}. Replay it or try the next sound.`;score.textContent=`${correct} correct / ${total} answered`;
  }));
  quiz.querySelector('[data-quiz-next]').addEventListener('click',()=>next());quiz.querySelector('[data-quiz-reset]').addEventListener('click',()=>next(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)player.stop();});window.addEventListener('pagehide',()=>player.stop());
  document.addEventListener('click',event=>{if(event.target.closest('[data-pronunciation]'))player.stop();});
  next(true);
}
