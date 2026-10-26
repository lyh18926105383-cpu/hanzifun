// HF-06 supplies the adapter. Never write the legacy/prototype storage keys here.
export async function saveCharacter(adapter, characterId) {
  if (!adapter || typeof adapter.saveCharacter !== 'function') return {saved:false,reason:'Learning could not load. Reload to save this character.'};
  try {
    const result=await adapter.saveCharacter({characterId});
    return result?.saved===true ? {saved:true} : {saved:false,reason:'This browser could not save the character. Try again.'};
  } catch { return {saved:false,reason:'Saving failed. Please try again.'}; }
}

export async function startCharacterPractice(adapter, payload) {
  if (!adapter || typeof adapter.startCharacterPractice !== 'function') return {started:false,reason:'Learning could not load. Reload or choose a practice set below.'};
  try {
    const result=await adapter.startCharacterPractice(payload);
    return result?.started===true ? {started:true} : {started:false,reason:'The practice session could not start. Please try again.'};
  } catch { return {started:false,reason:'The practice session could not start. Please try again.'}; }
}
