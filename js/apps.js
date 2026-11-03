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
          h('a', { class: 'ff-tile', href: '#', onclick: e => { e.preventDefault(); Files.open('projects'); } }, h('span', { class: 'ff-t-ic', style: 'background:#0a74ff' }, '</>'), h('span', null, 'Projects')),
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
      const files = { 'projects.html': 'projects', 'cv.txt': 'cv', 'instagram.webloc': 'instagram', 'instagram': 'instagram' };
      const cmds = {
        help() { print('Available commands:'); print('  ls            list files on the desktop'); print('  cat <file>    print a text file (try: cat CV.txt)'); print('  open <file>   open a file (try: open projects.html)'); print('  whoami        who am I?'); print('  date          current date'); print('  echo <text>   repeat after me'); print('  neofetch      about this machine'); print('  clear         clear the screen'); print('  exit          close this window'); },
        ls() { print('CV.txt    Instagram.webloc    projects.html'); },
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
  reg({
    id: 'photobooth', name: 'Photo Booth', icon: () => Icons.photobooth(), w: 700, h: 560, minW: 420, cls: 'dark', title: 'Photo Booth',
    build(win) {
      const video = h('video', { autoplay: '', playsinline: '' }); video.muted = true;
      const msg = h('div', { class: 'pb-msg' }, 'Starting camera…');
      const count = h('div', { class: 'pb-count' });
      const flash = h('div', { class: 'pb-flash' });
      const stage = h('div', { class: 'pb-stage' }, video, msg, count, flash);
      const strip = h('div', { class: 'pb-strip' });
      let stream = null, busy = false;
      const shutter = h('button', { class: 'pb-shutter', title: 'Take photo', 'aria-label': 'Take photo', onclick: snap }, h('span'));
      win.body.append(h('div', { class: 'pb' }, stage, h('div', { class: 'pb-bar' }, strip, shutter, h('div', { class: 'pb-spacer' }))));

      function renderStrip() {
        strip.innerHTML = '';
        State.shots.slice(0, 6).forEach((u, i) => strip.append(h('button', { class: 'pb-thumb', onclick: () => lightbox(win.body, State.shots, i, 'photobooth') }, h('img', { src: u, alt: '' }))));
      }
      State.on('shots', renderStrip); renderStrip();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = 'Camera is not available here (it needs https or localhost).';
      } else {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
          .then(s => { if (win.closed) { s.getTracks().forEach(t => t.stop()); return; } stream = s; video.srcObject = s; msg.remove(); })
          .catch(() => { msg.textContent = 'Camera access was blocked. Allow it in your browser, then reopen Photo Booth.'; });
      }
      win.onClose = () => { win.closed = true; State.off('shots', renderStrip); if (stream) stream.getTracks().forEach(t => t.stop()); };

      async function snap() {
        if (!stream || busy) return;
        busy = true;
        for (const n of [3, 2, 1]) { count.textContent = n; count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop'); await new Promise(r => setTimeout(r, 850)); }
        count.textContent = ''; count.classList.remove('pop');
        const c = document.createElement('canvas');
        c.width = video.videoWidth || 1280; c.height = video.videoHeight || 720;
        const x = c.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(video, 0, 0, c.width, c.height);
        State.shots.unshift(c.toDataURL('image/jpeg', 0.92));
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
        State.emit('shots'); busy = false;
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
        const all = State.shots.concat(CONTENT.photos);
        grid.innerHTML = '';
        if (!all.length) grid.append(h('div', { class: 'ph-empty' }, 'No photos yet'));
        all.forEach((u, i) => grid.append(h('button', { class: 'ph-cell', onclick: () => lightbox(win.body, all, i, 'photo') }, h('img', { src: u, alt: '', loading: 'lazy' }))));
      };
      State.on('shots', draw); draw();
      win.onClose = () => State.off('shots', draw);
      win.body.append(h('div', { class: 'ph' }, grid));
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
    build(win) { win.body.append(h('pre', { class: 'txt' }, CONTENT.cv)); }
  });
})();
