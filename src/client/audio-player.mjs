// Bind only recordings with an explicit review and exact reading. No Latin-letter TTS.
export function approvedAudio(record, readingId, { isolated = false } = {}) {
  return record?.reviewStatus==='approved' && record.confirmedReadingId===readingId && typeof record.url==='string' && /^\/?audio\/[a-zA-Z0-9/_-]+\.mp3$/.test(record.url) && (!isolated || record.usableForIsolatedSyllable===true);
}
export function createAudioPlayer(makeAudio = url => new Audio(url)) {
  let active=null;
  const stop=()=>{if(active){active.pause();active.currentTime=0;active=null;}};
  return {stop, async play(record,readingId,onError=()=>{}) {
    stop();if(!approvedAudio(record,readingId)){onError('Choose another recording.');return false;}
    const player=makeAudio('/'+record.url.replace(/^\//,''));active=player;
    player.onerror=()=>{if(active===player){stop();onError('Try playing again. Pinyin remains readable.');}};
    try{await player.play();return active===player;}catch{if(active===player)stop();onError('Try playing again. Pinyin remains readable.');return false;}
  }};
}
