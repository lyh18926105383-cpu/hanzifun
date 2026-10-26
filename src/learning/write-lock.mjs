// Web Locks when available; Lamport bakery coordination otherwise.
// localStorage read/compare/write alone is NOT an atomic compare-and-swap.
export function createWriteLock({storage, locks, uuid, delay = ms => new Promise(r => setTimeout(r, ms))}) {
  const prefix = 'hanzifun.guest.lock.';
  const entries = () => {
    const result = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) result.push([key, JSON.parse(storage.getItem(key) || 'null')]);
    }
    const values=result.filter(([,v])=>v);
    if(values.some(([,v])=>typeof v.choosing!=='boolean'||!Number.isSafeInteger(v.ticket)||v.ticket<0))throw new Error('Damaged write marker. Close other learning tabs and recover coordination in My learning.');
    return values;
  };
  const coordinatedWrite = async operation => {
    const key = prefix + uuid();
    try {
      storage.setItem(key, JSON.stringify({choosing: true, ticket: 0}));
      await delay(8);
      const ticket = 1 + Math.max(0, ...entries().map(([, v]) => v.ticket));
      if(!Number.isSafeInteger(ticket))throw new Error('Write ticket overflow; recover coordination in My learning.');
      const token=JSON.stringify({choosing: false, ticket});
      storage.setItem(key, token);
      await delay(8);
      // Each contender publishes choosing before reading others' tickets. Unique
      // keys break ties. Never evict a suspended writer on a timeout (unsafe).
      const began = performance.now();
      while (entries().some(([other, v]) => other !== key && (v.choosing ||
        (v.ticket > 0 && (v.ticket < ticket || (v.ticket === ticket && other < key)))))) {
        if (performance.now() - began > 2000) throw new Error('Another tab is writing. Close idle learning tabs, then retry or export.');
        await delay(8);
      }
      // Critical section must remain synchronous: no await between read and write.
      if(storage.getItem(key)!==token)throw new Error('Write ownership changed; retry or export.');
      const value = operation();
      if (value?.then) throw new Error('Fallback write section must be synchronous');
      await delay(8); return value;
    } finally { storage.removeItem(key); }
  };
  return async operation => {
    let request;
    try {request=locks?.request;} catch {/* Restricted getter: use the same local coordination. */}
    if(typeof request==='function') {
      let entered=false;
      try {
        return await request.call(locks,'hanzifun-guest-write',async()=>{
          entered=true;await delay(8);return coordinatedWrite(operation);
        });
      } catch(error) {if(entered)throw error;}
    }
    // Both branches share bakery markers, including mixed-capability tabs.
    return coordinatedWrite(operation);
  };
}
