/* The apps that live in the dock. */
(function () {
  const h = window.h, reg = a => Apps.reg(a);

  /* ---------- shared lightbox (Photos + Photo Booth) ---------- */
  function lightbox(host, urls, start, label) {
    let i = start;
    const img = h('img', { alt: '' });
    const dl = h('a', { class: 'lb-btn', title: 'Save' }, 'Save');
    const ov = h('div', { class: 'lightbox' },
      h('button', { class: 'lb-x', onclick: close, 'aria-label': 'Close' }, '✕'),
      h('button', { class: 'lb-nav prev', onclick: () => go(-1), 'aria-label': 'Previous' }, '‹'),
      img,
      h('button', { class: 'lb-nav next', onclick: () => go(1), 'aria-label': 'Next' }, '›'),
      dl);
    function show() {
      img.src = urls[i];
      dl.href = urls[i];
      dl.setAttribute('download', (label || 'photo') + '-' + (i + 1) + '.jpg');
      ov.classList.toggle('single', urls.length < 2);
    }
    function go(d) { i = (i + d + urls.length) % urls.length; show(); }
    function close() { ov.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (!ov.isConnected) return document.removeEventListener('keydown', key); if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', key);
    show(); host.append(ov);
  }

  /* ---------- Finder ---------- */
  reg({
    id: 'finder', name: 'Finder', icon: () => Icons.finder(), w: 720, h: 460, title: 'Desktop',
    build(win) {
      const main = h('div', { class: 'f-main' });
      const side = h('div', { class: 'f-side' });
      const items = [{ id: 'desktop', label: 'Desktop' }, { id: 'apps', label: 'Applications' }];
      function select(id) {
        side.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === id));
        win.setTitle(id === 'apps' ? 'Applications' : 'Desktop');
        main.innerHTML = '';
        if (id === 'desktop') {
          Files.list.forEach(f => main.append(fileCell(f.name, f.icon(), () => Files.open(f.id))));
        } else {
          Apps.list.filter(a => a.id !== 'launchpad' && !a.hidden).forEach(a => main.append(fileCell(a.name, a.icon(), () => WM.launch(a.id), true)));
        }
      }
      function fileCell(name, icon, open, sq) {
        const el = h('div', { class: 'f-item' + (sq ? ' sq' : ''), tabindex: '0' }, h('div', { class: 'dimg', html: icon }), h('span', null, name));
        let touch = false;
        el.addEventListener('pointerdown', () => { /* noop */ });
        el.addEventListener('click', e => {
          main.querySelectorAll('.f-item').forEach(x => x.classList.toggle('sel', x === el));
          if (e.pointerType && e.pointerType !== 'mouse') open();
        });
        el.addEventListener('dblclick', open);
        return el;
      }
      items.forEach(it => side.append(h('button', { 'data-id': it.id, onclick: () => select(it.id) }, h('span', { class: 'f-ic ' + it.id }), it.label)));
      win.body.append(h('div', { class: 'finder' }, side, main));
      select('desktop');
    }
  });

  /* ---------- Launchpad (dock-only) ---------- */
  reg({ id: 'launchpad', name: 'Apps', icon: () => Icons.launchpad(), hidden: true, build() { } });

  /* ---------- Firefox ---------- */
  reg({
    id: 'firefox', name: 'Firefox', icon: () => Icons.firefox(), w: 900, h: 580, minW: 460,
    build(win) {
      win.setTitle('New Tab');
      const url = h('input', { class: 'ff-url', placeholder: 'Search or enter address', spellcheck: 'false', autocomplete: 'off' });
      const go = v => {
        v = (v || '').trim(); if (!v) return;
        const isUrl = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v);
        const target = isUrl ? (/^https?:/i.test(v) ? v : 'https://' + v) : 'https://www.google.com/search?q=' + encodeURIComponent(v);
        window.open(target, '_blank', 'noopener');
      };
      url.addEventListener('keydown', e => { if (e.key === 'Enter') { go(url.value); url.value = ''; } });
      const tile = (label, href, color, glyph) => h('a', { class: 'ff-tile', href, target: '_blank', rel: 'noopener' },
        h('span', { class: 'ff-t-ic', style: 'background:' + color }, glyph), h('span', null, label));
      const page = h('div', { class: 'ff-page' },
        h('h1', null, 'Search or enter address'),
        h('div', { class: 'ff-search' }, h('input', {
          placeholder: 'Search the web', spellcheck: 'false',
          onkeydown: e => { if (e.key === 'Enter') { go(e.target.value); e.target.value = ''; } }
        })),
        h('div', { class: 'ff-tiles' },
          tile('Instagram', CONTENT.links.instagram, 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)', 'IG'),
          tile('GitHub', CONTENT.links.github, '#24292f', 'GH'),
          h('a', { class: 'ff-tile', href: '#', onclick: e => { e.preventDefault(); Files.open('press'); } }, h('span', { class: 'ff-t-ic', style: 'background:#0a74ff' }, '</>'), h('span', null, 'Press')),
          h('a', { class: 'ff-tile', href: '#', onclick: e => { e.preventDefault(); WM.launch('cv', { title: 'CV.txt' }); } }, h('span', { class: 'ff-t-ic', style: 'background:#8e8e93' }, 'CV'), h('span', null, 'CV'))));
      win.right.append();
      win.body.append(h('div', { class: 'ff' },
        h('div', { class: 'ff-tabs' }, h('div', { class: 'ff-tab' }, h('span', { class: 'ff-fav' }), 'New Tab')),
        h('div', { class: 'ff-bar' }, h('button', { class: 'ff-nav', disabled: '' }, '←'), h('button', { class: 'ff-nav', disabled: '' }, '→'), h('button', { class: 'ff-nav', onclick: () => { } }, '↻'), url),
        page));
    }
  });

  /* ---------- Terminal ---------- */
  reg({
    id: 'terminal', name: 'Terminal', icon: () => Icons.terminal(), w: 640, h: 400, cls: 'dark term-win', title: 'guest — -zsh — 80×24',
    build(win) {
      const PROMPT = 'guest@portfolio ~ % ';
      const out = h('div', { class: 't-out' });
      const inp = h('input', { class: 't-in', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off' });
      const line = h('div', { class: 't-line' }, h('span', { class: 't-prompt' }, PROMPT), inp);
      const box = h('div', { class: 'term', onclick: () => { if (!getSelection().toString()) inp.focus(); } }, out, line);
      win.body.append(box);
      const hist = []; let hi = 0;
      const print = (t, c) => { out.append(h('div', { class: 't-row ' + (c || '') }, t)); box.scrollTop = box.scrollHeight; };
      const files = { 'press': 'press', 'prensa': 'press', 'cv.txt': 'cv', 'instagram.webloc': 'instagram', 'instagram': 'instagram' };
      const cmds = {
        help() { print('Available commands:'); print('  ls            list files on the desktop'); print('  cat <file>    print a text file (try: cat CV.txt)'); print('  open <file>   open a file (try: open press)'); print('  whoami        who am I?'); print('  date          current date'); print('  echo <text>   repeat after me'); print('  neofetch      about this machine'); print('  clear         clear the screen'); print('  exit          close this window'); },
        ls() { print('CV.txt    Instagram.webloc    press'); },
        pwd() { print('/Users/guest/Desktop'); },
        whoami() { print('guest'); },
        date() { print(new Date().toString()); },
        echo(a) { print(a.join(' ')); },
        clear() { out.innerHTML = ''; },
        exit() { win.close(); },
        cat(a) {
          if (!a[0]) return print('usage: cat <file>');
          const f = files[a[0].toLowerCase()];
          if (f === 'cv') CONTENT.cv.split('\n').forEach(l => print(l || ' '));
          else if (f) print(`cat: ${a[0]}: Is not a text file (try: open ${a[0]})`);
          else print(`cat: ${a[0]}: No such file or directory`);
        },
        open(a) {
          if (!a[0]) return print('usage: open <file>');
          const f = files[a[0].toLowerCase()];
          if (f) { print('Opening ' + a[0] + '…'); Files.open(f); } else print(`The file ${a[0]} does not exist.`);
        },
        neofetch() { ['guest@portfolio', '---------------', 'OS: portfolioOS 1.0', 'Host: your browser', 'Shell: zsh (pretend)', 'Resolution: ' + innerWidth + 'x' + innerHeight, 'Made by: tonchimatta'].forEach(l => print(l)); },
        sudo() { print('guest is not in the sudoers file. This incident will be reported.'); }
      };
      print('Last login: ' + new Date().toString().slice(0, 24) + ' on ttys000');
      print("Type 'help' to see what you can do.");
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const v = inp.value; print(PROMPT + v, 'cmd');
          inp.value = '';
          const parts = v.trim().split(/\s+/); const c = (parts[0] || '').toLowerCase();
          if (v.trim()) { hist.push(v); hi = hist.length; }
          if (c) (cmds[c] ? cmds[c](parts.slice(1)) : print('zsh: command not found: ' + parts[0]));
        } else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = hist[--hi]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; }
        else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
      });
      setTimeout(() => inp.focus(), 300);
    }
  });

  /* ---------- Photo Booth ---------- */
  const PB_ICONS = {
    four: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    photo: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="3"/><circle cx="12" cy="10.2" r="2.6" fill="currentColor" stroke="none"/><path d="M6.8 18.4c.6-2.6 2.6-3.9 5.2-3.9s4.6 1.3 5.2 3.9" fill="currentColor" stroke="none"/></svg>',
    video: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6.5" width="13" height="11" rx="2.6"/><path d="M16 11l5-3v8l-5-3z"/></svg>',
    cam: '<svg viewBox="0 0 28 24" width="28" height="24" fill="#fff"><path fill-rule="evenodd" d="M9.5 2.3c.4-.8 1.200-1.300 2.100-1.300h4.800c.9 0 1.700.5 2.100 1.300L19.300 4H23a4 4 0 0 1 4 4v10.500a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h3.700l.8-1.700zM14 18.200a5.200 5.200 0 1 0 0-10.400 5.200 5.200 0 0 0 0 10.400zm0-2.600a2.600 2.600 0 1 1 0-5.200 2.600 2.600 0 0 1 0 5.200zM23.200 8.300a1.200 1.200 0 1 0 0-2.400 1.200 1.200 0 0 0 0 2.400z"/></svg>'
  };
  reg({
    id: 'photobooth', name: 'Photo Booth', icon: () => Icons.photobooth(), w: 725, h: 600, minW: 460, cls: 'pb-win', title: 'Photo Booth',
    build(win) {
      const video = h('video', { autoplay: '', playsinline: '' }); video.muted = true;
      const msg = h('div', { class: 'pb-msg' }, 'Starting camera…');
      const count = h('div', { class: 'pb-count' });
      const flash = h('div', { class: 'pb-flash' });
      const review = h('div', { class: 'pb-review' }); review.hidden = true;
      const stage = h('div', { class: 'pb-stage' }, video, msg, count, flash, review);
      let stream = null, busy = false, mode = 'photo';
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      const segs = {};
      const seg = (m, title, off) => (segs[m] = h('button', {
        class: 'pb-seg' + (m === mode ? ' on' : ''), title: off ? title + ' (coming soon)' : title, 'aria-label': title, disabled: off ? 'true' : false,
        html: PB_ICONS[m], onclick: () => { mode = m; Object.keys(segs).forEach(k => segs[k].classList.toggle('on', k === m)); }
      }));
      const shutter = h('button', { class: 'pb-shutter', title: 'Take photo', 'aria-label': 'Take photo', html: PB_ICONS.cam, onclick: snap });
      win.body.append(h('div', { class: 'pb' }, stage,
        h('div', { class: 'pb-bar' },
          h('div', { class: 'pb-segs' }, seg('four', 'Take four quick photos'), seg('photo', 'Take a still photo'), seg('video', 'Record a movie clip', true)),
          shutter, h('div', { class: 'pb-spacer' }))));

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = 'Camera is not available here (it needs https or localhost).';
      } else {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
          .then(s => { if (win.closed) { s.getTracks().forEach(t => t.stop()); return; } stream = s; video.srcObject = s; msg.remove(); })
          .catch(() => { msg.textContent = 'Camera access was blocked. Allow it in your browser, then reopen Photo Booth.'; });
      }
      win.onClose = () => { win.closed = true; if (stream) stream.getTracks().forEach(t => t.stop()); };

      function grab() {
        const c = document.createElement('canvas');
        c.width = video.videoWidth || 1280; c.height = video.videoHeight || 720;
        const x = c.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(video, 0, 0, c.width, c.height);
        return c;
      }
      function collage(frames) {
        const w = frames[0].width, hh = frames[0].height, c = document.createElement('canvas');
        c.width = w; c.height = hh;
        const x = c.getContext('2d');
        frames.forEach((f, i) => x.drawImage(f, (i % 2) * w / 2, (i >> 1) * hh / 2, w / 2, hh / 2));
        return c;
      }
      const fire = () => { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); };

      async function snap() {
        if (!stream || busy) return;
        busy = true; shutter.disabled = true;
        for (const n of [3, 2, 1]) { count.textContent = n; count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop'); await sleep(850); }
        count.textContent = ''; count.classList.remove('pop');
        const frames = [], n = mode === 'four' ? 4 : 1;
        for (let i = 0; i < n; i++) { frames.push(grab()); fire(); if (i < n - 1) await sleep(900); }
        const url = (n === 1 ? frames[0] : collage(frames)).toDataURL('image/jpeg', 0.9);
        busy = false; shutter.disabled = false;
        ask(url);
      }

      // "Save or not?" prompt
      function ask(url) {
        review.innerHTML = '';
        const note = h('div', { class: 'pb-note' }, PhotoStore.remote ? 'Save this photo? Once approved it will be shown to everyone in Photos.' : 'Save this photo?');
        const discard = h('button', { class: 'pb-btn', onclick: () => { review.hidden = true; } }, 'Discard');
        const save = h('button', { class: 'pb-btn primary', onclick: async () => {
          save.disabled = discard.disabled = true; save.textContent = 'Saving…';
          try {
            const rec = await PhotoStore.add(url);
            if (!rec.pending) { State.saved.unshift(rec); State.emit('shots'); }
            note.textContent = rec.pending ? 'Thanks! It will appear in Photos once it is approved.' : 'Saved to Photos'; save.remove(); discard.textContent = 'Done'; discard.disabled = false;
          } catch (e) { note.textContent = 'Could not save'; save.textContent = 'Save'; save.disabled = discard.disabled = false; }
        } }, 'Save');
        review.append(h('img', { src: url, alt: '' }), h('div', { class: 'pb-ask' }, note, h('div', { class: 'pb-btns' }, discard, save)));
        review.hidden = false;
      }
    }
  });

  /* ---------- Notes ---------- */
  reg({
    id: 'notes', name: 'Notes', icon: () => Icons.notes(), w: 760, h: 480, minW: 480, title: 'Notes',
    build(win) {
      let seq = 0;
      const notes = CONTENT.notes.map(n => ({ id: ++seq, body: n.title + '\n' + n.body, date: new Date(n.date) }));
      let sel = notes[0] || null, q = '';
      const list = h('div', { class: 'n-list' });
      const search = h('input', { class: 'n-search', placeholder: 'Search', oninput: e => { q = e.target.value.toLowerCase(); renderList(); } });
      const dateEl = h('div', { class: 'n-date' });
      const ta = h('textarea', { class: 'n-ta', placeholder: 'Start writing…', spellcheck: 'false' });
      const titleOf = n => (n.body.split('\n')[0] || '').trim() || 'New Note';
      const previewOf = n => { const l = n.body.split('\n').slice(1).join(' ').trim(); return l || 'No additional text'; };
      const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      function renderList() {
        list.innerHTML = '';
        notes.filter(n => !q || n.body.toLowerCase().includes(q)).forEach(n => {
          list.append(h('button', { class: 'n-item' + (n === sel ? ' on' : ''), onclick: () => { sel = n; renderList(); load(); } },
            h('b', null, titleOf(n)), h('span', null, h('em', null, fmt(n.date)), ' ' + previewOf(n))));
        });
      }
      function load() {
        ta.disabled = !sel; ta.value = sel ? sel.body : '';
        dateEl.textContent = sel ? sel.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' at ' + sel.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
      }
      ta.addEventListener('input', () => { if (!sel) return; sel.body = ta.value; sel.date = new Date(); renderList(); });
      const add = h('button', { class: 'tb-btn', title: 'New note', 'aria-label': 'New note', onclick: () => { const n = { id: ++seq, body: '', date: new Date() }; notes.unshift(n); sel = n; q = ''; search.value = ''; renderList(); load(); ta.focus(); } }, '✎');
      const del = h('button', { class: 'tb-btn', title: 'Delete note', 'aria-label': 'Delete note', onclick: () => { if (!sel) return; const i = notes.indexOf(sel); notes.splice(i, 1); sel = notes[Math.min(i, notes.length - 1)] || null; renderList(); load(); } }, '🗑');
      win.right.append(del, add);
      win.body.append(h('div', { class: 'notes' }, h('div', { class: 'n-side' }, search, list), h('div', { class: 'n-edit' }, dateEl, ta)));
      renderList(); load();
    }
  });

  /* ---------- Spotify ---------- */
  reg({
    id: 'spotify', name: 'Spotify', icon: () => Icons.spotify(), w: 460, h: 580, minW: 340, cls: 'dark', title: 'Spotify',
    build(win) {
      win.body.append(h('iframe', {
        class: 'sp', title: 'Spotify', loading: 'lazy', frameborder: '0',
        src: 'https://open.spotify.com/embed/playlist/' + CONTENT.spotifyPlaylist + '?utm_source=generator&theme=0',
        allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      }));
    }
  });

  /* ---------- Photos ---------- */
  reg({
    id: 'photos', name: 'Photos', icon: () => Icons.photos(), w: 820, h: 540, minW: 420, title: 'Photos',
    build(win) {
      const grid = h('div', { class: 'ph-grid' });
      const draw = () => {
        const all = State.saved.map(r => r.url).concat(CONTENT.photos);
        grid.innerHTML = '';
        if (!all.length) grid.append(h('div', { class: 'ph-empty' }, 'No photos yet'));
        all.forEach((u, i) => grid.append(h('button', { class: 'ph-cell', onclick: () => lightbox(win.body, all, i, 'photo') }, h('img', { src: u, alt: '', loading: 'lazy' }))));
      };
      State.on('shots', draw); draw();
      win.onClose = () => State.off('shots', draw);
      win.body.append(h('div', { class: 'ph' }, grid));
    }
  });


  /* ---------- Contacts ---------- */
  reg({
    id: 'contacts', name: 'Contacts', icon: () => Icons.contacts(), w: 980, h: 640, minW: 600, minH: 380, cls: 'dark ct-win', title: '',
    build(win) {
      const data = CONTENT.contacts.map((c, i) => ({ id: i + 1, ...c, fields: c.fields.map(f => ({ ...f })) }));
      let seq = data.length, sel = data[0] || null, q = '', editing = false;

      const fullName = c => [c.first, c.last].filter(Boolean).join(' ');
      const initials = c => ((c.first || '').charAt(0) + (c.last || '').charAt(0)).toUpperCase() || '?';
      const sortKey = c => ((c.last || c.first || '').toLowerCase());

      const list = h('div', { class: 'ct-list' });
      const scroll = h('div', { class: 'ct-scroll' });
      const detail = h('div', { class: 'ct-detail' }, h('div', { class: 'ct-poster' }), scroll);
      const root = h('div', { class: 'ct' }, list, detail);

      // toolbar (lives in the title bar, like the real app)
      const tb = win.el.querySelector('.titlebar');
      const sideBtn = h('button', { class: 'tb-btn ct-round', title: 'Show / hide the list', 'aria-label': 'Toggle list', html: '<svg viewBox="0 0 24 20" width="20" height="17" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="2" width="20" height="16" rx="3.5"/><path d="M9 2v16"/><path d="M4.6 6.2h2.2M4.6 9h2.2" stroke-linecap="round"/></svg>', onclick: () => root.classList.toggle('no-list') });
      tb.insertBefore(sideBtn, win.titleEl);
      const search = h('input', { class: 'ct-search', placeholder: 'Search', spellcheck: 'false', oninput: e => { q = e.target.value.toLowerCase(); renderList(); } });
      const editBtn = h('button', { class: 'tb-btn ct-pill txt', onclick: () => { editing = !editing; renderDetail(); } }, 'Edit');
      const addBtn = h('button', { class: 'tb-btn ct-round', title: 'New contact', 'aria-label': 'New contact', html: '<svg viewBox="0 0 20 20" width="16" height="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 3v14M3 10h14"/></svg>', onclick: () => {
        const c = { id: ++seq, first: '', last: '', fields: [{ label: 'mobile', value: '' }, { label: 'email', value: '' }, { label: 'home', value: '', multiline: true }] };
        data.push(c); sel = c; q = ''; search.value = ''; editing = true; renderList(); renderDetail();
      } }, '');
      const sbox = h('label', { class: 'ct-sbox', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>' }, search);
      win.right.append(editBtn, addBtn, sbox);

      function matches(c) {
        if (!q) return true;
        return (fullName(c) + ' ' + (c.nickname || '') + ' ' + c.fields.map(f => f.value).join(' ')).toLowerCase().includes(q);
      }

      function renderList() {
        list.innerHTML = '';
        const items = data.filter(matches).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
        if (!items.length) { list.append(h('div', { class: 'ct-none' }, 'No Results')); return; }
        let letter = null;
        items.forEach(c => {
          const l = (sortKey(c).charAt(0) || '#').toUpperCase();
          if (l !== letter) { letter = l; list.append(h('div', { class: 'ct-letter' }, l)); }
          list.append(h('button', { class: 'ct-row' + (c === sel ? ' on' : ''), onclick: () => { sel = c; editing = false; renderList(); renderDetail(); } },
            h('span', { class: 'ct-av' }, initials(c)),
            h('span', { class: 'ct-nm' }, h('b', null, fullName(c) || 'New Contact'), c.org ? h('small', null, c.org) : null)));
        });
      }

      function field(c, f) {
        const lab = h('div', { class: 'ct-lab' }, f.label);
        if (editing) {
          const inp = f.multiline ? h('textarea', { class: 'ct-in', rows: Math.max(2, f.value.split('\n').length) }) : h('input', { class: 'ct-in' });
          inp.value = f.value; inp.addEventListener('input', () => { f.value = inp.value; });
          return h('div', { class: 'ct-field' }, lab, inp);
        }
        if (!f.value) return null;
        const val = f.link ? h('a', { class: 'ct-val', href: f.link }, f.value) : h('div', { class: 'ct-val' }, f.value);
        return h('div', { class: 'ct-field' }, lab, val);
      }

      function renderDetail() {
        editBtn.textContent = editing ? 'Done' : 'Edit';
        scroll.innerHTML = '';
        if (!sel) { scroll.append(h('div', { class: 'ct-empty' }, 'No Contact Selected')); return; }
        const c = sel;
        const sub = [c.nickname && c.nickname.toUpperCase(), c.pronouns && c.pronouns.toUpperCase()].filter(Boolean).join(' · ');
        if (editing) {
          const mk = (k, ph) => { const i = h('input', { class: 'ct-in big', placeholder: ph }); i.value = c[k] || ''; i.addEventListener('input', () => { c[k] = i.value; renderList(); }); return i; };
          scroll.append(h('div', { class: 'ct-head edit' }, mk('first', 'First name'), mk('last', 'Last name'), mk('nickname', 'Nickname')));
        } else {
          scroll.append(h('div', { class: 'ct-head' }, sub ? h('div', { class: 'ct-sub' }, sub) : null, h('h1', null, c.posterName || fullName(c) || 'New Contact')));
        }
        if (!editing) {
          scroll.append(h('div', { class: 'ct-card ct-share' },
            h('span', { class: 'ct-shav', html: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#e9e9ee"/><circle cx="16" cy="13" r="5" fill="none" stroke="#555a66" stroke-width="1.6"/><path d="M6.5 26c1.4-4.6 5.200-6.800 9.500-6.800s8.100 2.200 9.500 6.800" fill="none" stroke="#555a66" stroke-width="1.6" stroke-linecap="round"/></svg>' }),
            h('span', { class: 'ct-sh' }, h('b', null, 'Share Name and Photo'), h('small', null, 'Sharing: No')),
            h('span', { class: 'ct-chev', html: '<svg viewBox="0 0 8 14" width="8" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>' })));
        }
        const rows = c.fields.map(f => field(c, f)).filter(Boolean);
        if (rows.length) scroll.append(h('div', { class: 'ct-card' }, rows));
        scroll.scrollTop = 0;
      }

      win.body.append(root);
      renderList(); renderDetail();
    }
  });

  /* ---------- Calendar ---------- */
  reg({
    id: 'calendar', name: 'Calendar', icon: () => Icons.calendar(), w: 780, h: 560, minW: 520, title: 'Calendar',
    build(win) {
      const today = new Date();
      let y = today.getFullYear(), m = today.getMonth();
      const grid = h('div', { class: 'cal-grid' });
      const head = h('div', { class: 'cal-title' });
      const pad = n => String(n).padStart(2, '0');
      function render() {
        head.innerHTML = '';
        head.append(h('b', null, new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long' })), ' ' + y);
        grid.innerHTML = '';
        const first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
        const rows = Math.ceil((first + dim) / 7);
        grid.style.gridTemplateRows = `auto repeat(${rows}, 1fr)`;
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => grid.append(h('div', { class: 'cal-dow' }, d)));
        for (let i = 0; i < rows * 7; i++) {
          const d = i - first + 1, out = d < 1 || d > dim;
          const dt = new Date(y, m, d);
          const key = dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
          const isToday = dt.toDateString() === today.toDateString();
          const cell = h('div', { class: 'cal-cell' + (out ? ' out' : '') + (i % 7 === 0 || i % 7 === 6 ? ' we' : '') },
            h('span', { class: 'cal-n' + (isToday ? ' today' : '') }, dt.getDate() === 1 ? dt.toLocaleDateString('en-US', { month: 'short' }) + ' 1' : String(dt.getDate())));
          CONTENT.events.filter(e => e.date === key).forEach(e => cell.append(h('div', { class: 'cal-ev' }, e.title)));
          grid.append(cell);
        }
      }
      const nav = n => () => { m += n; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } render(); };
      win.right.append(h('button', { class: 'tb-btn', onclick: nav(-1), 'aria-label': 'Previous month' }, '‹'), h('button', { class: 'tb-btn txt', onclick: () => { y = today.getFullYear(); m = today.getMonth(); render(); } }, 'Today'), h('button', { class: 'tb-btn', onclick: nav(1), 'aria-label': 'Next month' }, '›'));
      win.body.append(h('div', { class: 'cal' }, head, grid));
      render();
    }
  });

  /* ---------- TextEdit (CV.txt) – opened from the desktop file ---------- */
  reg({
    id: 'cv', name: 'TextEdit', icon: () => Icons.txt(), hidden: true, w: 660, h: 560, minW: 360, cls: 'paper', title: 'CV.txt',
    build(win) {
      const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = esc(CONTENT.cv)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
        .replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '<a href="mailto:$1">$1</a>');
      win.body.append(h('pre', { class: 'txt', html }));
    }
  });
})();
