/* Where saved Photo Booth photos live.
   - No backend configured (js/config.js empty): this browser only (IndexedDB).
   - Supabase configured: new photos are sent as "pending"; only photos you approve
     in /admin/ are shown to every visitor. */
(function () {
  State.saved = [];
  const B = window.BACKEND || {};
  const DB = 'portfolio-photos', ST = 'photos';
  let mem = [];

  /* ---------------- local (this browser) ---------------- */
  function open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(ST, { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  const local = {
    remote: false,
    async list() {
      if (!window.indexedDB) return mem.slice();
      try {
        const db = await open();
        return await new Promise(res => {
          const q = db.transaction(ST).objectStore(ST).getAll();
          q.onsuccess = () => res(q.result.sort((a, b) => b.ts - a.ts));
          q.onerror = () => res([]);
        });
      } catch (e) { return mem.slice(); }
    },
    async add(url) {
      const rec = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), ts: Date.now(), url };
      if (!window.indexedDB) { mem.unshift(rec); return rec; }
      try {
        const db = await open();
        await new Promise((res, rej) => {
          const tx = db.transaction(ST, 'readwrite');
          tx.objectStore(ST).put(rec);
          tx.oncomplete = res; tx.onerror = () => rej(tx.error);
        });
      } catch (e) { mem.unshift(rec); }
      return rec;
    }
  };

  /* ---------------- shared (Supabase REST, no library needed) ---------------- */
  function shrink(dataUrl, maxW) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
  const hdr = () => ({ apikey: B.supabaseAnonKey, Authorization: 'Bearer ' + B.supabaseAnonKey, 'Content-Type': 'application/json' });
  const remote = {
    remote: true,
    async list() {
      try {
        const r = await fetch(`${B.supabaseUrl}/rest/v1/photos?select=id,created_at,image&status=eq.approved&order=created_at.desc`, { headers: hdr() });
        if (!r.ok) return [];
        return (await r.json()).map(p => ({ id: p.id, ts: Date.parse(p.created_at), url: p.image }));
      } catch (e) { return []; }
    },
    async add(url) {
      const image = await shrink(url, 1000);
      const r = await fetch(`${B.supabaseUrl}/rest/v1/photos`, {
        method: 'POST', headers: { ...hdr(), Prefer: 'return=minimal' }, body: JSON.stringify({ image, status: 'pending' })
      });
      if (!r.ok) throw new Error('upload failed');
      return { id: 'pending', ts: Date.now(), url: image, pending: true };
    }
  };

  window.PhotoStore = (B.supabaseUrl && B.supabaseAnonKey) ? remote : local;
  PhotoStore.list().then(l => { State.saved = l; State.emit('shots'); });
})();
