/* Firefox — a recreation of the real browser chrome (light theme, macOS) with working tabs.
   Internal pages (projects.html, the Instagram profile, …) open inside this window instead of a new browser tab.
   Public API:  Browser.open(url)  — focus/launch Firefox and show that page in a tab. */
(function () {
  const h = window.h;
  const ORIGIN = 'https://tonchimatta.com';

  /* ---------------------------------------------------------------- icons (16px, stroke) */
  const svg = (d, extra) => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}>${d}</svg>`;
  const I = {
    back: svg('<path d="M13 8H3m5-5L3 8l5 5"/>'),
    fwd: svg('<path d="M3 8h10M8 3l5 5-5 5"/>'),
    reload: svg('<path d="M13.4 8.2A5.4 5.4 0 1 1 11.7 4.3"/><path d="M13.6 2.2v3.3h-3.3"/>'),
    x: svg('<path d="M3.8 3.8l8.4 8.4m0-8.4l-8.4 8.4"/>'),
    plus: svg('<path d="M8 3v10M3 8h10"/>'),
    chev: svg('<path d="M4 6.2l4 4 4-4"/>'),
    shield: svg('<path d="M8 1.8l5.2 1.9v4.1c0 3-2.2 5.2-5.2 6.4-3-1.2-5.2-3.4-5.2-6.4V3.7z"/>'),
    lock: svg('<rect x="3.4" y="7" width="9.2" height="6.6" rx="1.6"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>'),
    search: svg('<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/>'),
    star: svg('<path d="M8 1.9l1.9 4 4.3.55-3.15 3 .8 4.3L8 11.65 4.15 13.75l.8-4.3-3.15-3 4.3-.55z"/>'),
    puzzle: svg('<path d="M5.5 2.8h2.2a.9.9 0 0 1 .9.9V5H11a1 1 0 0 1 1 1v1.9h-.6a1.4 1.4 0 1 0 0 2.8h.6v2a1 1 0 0 1-1 1H8.9v-.6a1.4 1.4 0 1 0-2.8 0v.6H4a1 1 0 0 1-1-1v-2.1h.6a1.4 1.4 0 1 0 0-2.8H3V6a1 1 0 0 1 1-1h1.6V3.7a.9.9 0 0 1-.1-.9z"/>'),
    user: svg('<circle cx="8" cy="8" r="6.2"/><circle cx="8" cy="6.6" r="2.1"/><path d="M3.9 12.6c.9-1.7 2.3-2.5 4.1-2.5s3.2.8 4.1 2.5"/>'),
    menu: svg('<path d="M2.5 4h11M2.5 8h11M2.5 12h11"/>'),
    globe: svg('<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c2 1.8 2.9 3.9 2.9 6.2S10 12.4 8 14.2C6 12.4 5.1 10.3 5.1 8S6 3.6 8 1.8z"/>'),
    warn: svg('<path d="M8 2.2l6.2 11H1.8z"/><path d="M8 6.6v3.2m0 1.9v.1"/>'),
    ext: svg('<path d="M9 2.5h4.5V7M13.5 2.5L7.5 8.5M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3"/>'),
    doc: svg('<path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/>'),
    warnBig: `<svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#5b5b66" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="26"/><path d="M32 18v18m0 8v.5"/></svg>`
  };

  /* ---------------------------------------------------------------- address parsing */
  const NEWTAB = { kind: 'newtab', url: 'about:newtab', title: 'New Tab' };
  const ALIASES = { 'projects': '/projects/', 'projects.html': '/projects/', 'press': '/prensa/', 'prensa': '/prensa/' };
  const IG_RESERVED = ['explore', 'accounts', 'reels', 'direct', 'p', 'reel', 'stories', 'tv', 'about', 'web'];
  // sites that refuse to be displayed inside another page (X-Frame-Options / frame-ancestors)
  const BLOCKED = /(^|\.)(google\.[a-z.]+|github\.com|instagram\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|youtube\.com|youtu\.be|netflix\.com|duckduckgo\.com|bing\.com|reddit\.com|tiktok\.com|spotify\.com|amazon\.[a-z.]+|openai\.com|chatgpt\.com|claude\.ai|anthropic\.com|notion\.so|stackoverflow\.com|apple\.com|microsoft\.com|whatsapp\.com|pinterest\.com|twitch\.tv)$/i;

  function parse(raw) {
    let s = (raw || '').trim();
    if (!s || /^about:(newtab|home|blank)?$/i.test(s)) return NEWTAB;
    const alias = ALIASES[s.toLowerCase().replace(/^\.?\//, '').replace(/\/$/, '')];
    if (alias) s = ORIGIN + alias;
    let u = null;
    try {
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) u = new URL(s);
      else if (/^\/\S*$/.test(s)) u = new URL(s, ORIGIN);
      else if (/^(localhost|([\w-]+\.)+[a-z]{2,})(:\d+)?([/?#]\S*)?$/i.test(s)) u = new URL('https://' + s);
    } catch (e) { u = null; }
    if (u && !/^https?:$/.test(u.protocol)) u = null;
    if (!u) {
      return { kind: 'blocked', search: true, host: 'Google', url: 'https://www.google.com/search?q=' + encodeURIComponent(s), title: s + ' – Google Search' };
    }
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'tonchimatta.com') {
      const path = u.pathname + u.search + u.hash;
      if (u.pathname === '/' || u.pathname === '/index.html') return NEWTAB;     // the desktop itself
      return { kind: 'internal', url: ORIGIN + path, src: '.' + path, title: 'tonchimatta.com' };
    }
    if (host === 'instagram.com') {
      const m = u.pathname.match(/^\/([\w.]+)\/?$/);
      if (m && !IG_RESERVED.includes(m[1].toLowerCase())) {
        return { kind: 'ig', url: 'https://www.instagram.com/' + m[1] + '/', src: 'https://www.instagram.com/' + m[1] + '/embed/', title: m[1] + ' (@' + m[1] + ') • Instagram photos and videos' };
      }
    }
    if (BLOCKED.test(host) || (u.protocol === 'http:' && location.protocol === 'https:')) {
      return { kind: 'blocked', host, url: u.href, title: host };
    }
    return { kind: 'ext', url: u.href, src: u.href, host, title: host };
  }

  const pretty = u => u.replace(/^https:\/\//, '').replace(/^([^/?#]+)\/$/, '$1');

  function favHTML(p) {
    if (p.kind === 'newtab') return '<img src="assets/icons/firefox.png" alt="" draggable="false">';
    if (p.kind === 'internal') return '<img src="favicon.png" alt="" draggable="false">';
    if (p.kind === 'ig') return '<i class="ff-igfav"></i>';
    if (p.kind === 'blocked') return I.warn;
    return I.globe;
  }

  /* ---------------------------------------------------------------- the window */
  function build(win, opts) {
    opts = opts || {};
    const tabs = []; let active = null, tid = 0;
    const marks = [
      { title: 'Press', url: ORIGIN + '/prensa/' },
      { title: 'Instagram', url: CONTENT.links.instagram },
      { title: 'GitHub', url: CONTENT.links.github },
      { title: 'CV.txt', cv: true }
    ];
    const ibtn = (cls, icon, label, on) => h('button', { class: cls, title: label, 'aria-label': label, html: icon, onclick: on });

    /* tab strip (lives in the title bar) */
    const tabsEl = h('div', { class: 'ff-tabs', role: 'tablist' });
    const plus = ibtn('ff-tbtn ff-plus', I.plus, 'Open a new tab', () => newTab());
    const listBtn = ibtn('ff-tbtn ff-listall', I.chev, 'List all tabs', () => togglePanel('tabs'));
    listBtn.dataset.panel = '1';
    win.right.append(h('div', { class: 'ff-strip' }, tabsEl, plus, h('span', { class: 'ff-grow' }), listBtn));

    /* toolbar */
    const backB = ibtn('ff-tbtn', I.back, 'Go back one page', () => go(active, -1));
    const fwdB = ibtn('ff-tbtn', I.fwd, 'Go forward one page', () => go(active, 1));
    const reloadB = ibtn('ff-tbtn', I.reload, 'Reload', () => reload(active));
    const idBox = h('span', { class: 'ff-id' });
    const url = h('input', { class: 'ff-url', placeholder: 'Search with Google or enter address', 'aria-label': 'Search with Google or enter address', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' });
    const starB = ibtn('ff-star', I.star, 'Bookmark this page', () => toggleMark(active));
    const field = h('div', { class: 'ff-field' }, idBox, url, starB);
    const extB = ibtn('ff-tbtn', I.puzzle, 'Extensions', () => togglePanel('ext'));
    const userB = ibtn('ff-tbtn', I.user, 'Firefox Account', () => togglePanel('user'));
    const menuB = ibtn('ff-tbtn', I.menu, 'Open application menu', () => togglePanel('menu'));
    [extB, userB, menuB].forEach(b => { b.dataset.panel = '1'; });
    const nav = h('div', { class: 'ff-nav' }, backB, fwdB, reloadB, field, extB, userB, menuB);
    const bm = h('div', { class: 'ff-bm' });
    const content = h('div', { class: 'ff-content' });
    const panel = h('div', { class: 'ff-panel', hidden: '' });
    const root = h('div', { class: 'ff' }, h('div', { class: 'ff-top' }, nav, bm), content, panel);
    win.body.append(root);

    /* ---- bookmarks bar (shown on the New Tab page, like Firefox) ---- */
    const isMarked = u => marks.some(m => m.url === u);
    function renderMarks() {
      bm.replaceChildren(...marks.map(m => h('button', {
        class: 'ff-bmi', title: m.title,
        onclick: () => m.cv ? WM.launch('cv', { title: 'CV.txt' }) : visit(m.url)
      }, h('span', { class: 'ff-bmf', html: m.cv ? I.doc : bmFav(parse(m.url)) }), h('span', null, m.title))));
    }
    const bmFav = p => p.kind === 'blocked' ? I.globe : favHTML(p);
    function toggleMark(t) {
      if (!t || t.cur.kind === 'newtab') return;
      const i = marks.findIndex(m => m.url === t.cur.url);
      if (i > -1) marks.splice(i, 1);
      else marks.push({ title: (t.title || pretty(t.cur.url)).slice(0, 28), url: t.cur.url });
      renderMarks(); sync();
    }

    /* ---- tabs ---- */
    function mkTab() {
      const t = { id: ++tid, hist: [], hi: -1, cur: NEWTAB, title: 'New Tab', loading: false, frame: null, view: h('div', { class: 'ff-view', hidden: '' }) };
      t.favEl = h('span', { class: 'ff-fav' });
      t.titleEl = h('span', { class: 'ff-ttl' });
      t.el = h('div', {
        class: 'ff-tab in', role: 'tab',
        onpointerdown: e => e.stopPropagation(),               // tabs don't drag the window
        onclick: () => select(t),
        onauxclick: e => { if (e.button === 1) closeTab(t); }
      }, t.favEl, t.titleEl, h('button', { class: 'ff-x', title: 'Close tab', 'aria-label': 'Close tab', html: I.x, onclick: e => { e.stopPropagation(); closeTab(t); } }));
      return t;
    }
    function newTab(input) {
      const t = mkTab();
      tabs.push(t); tabsEl.append(t.el); content.append(t.view); tabsEl.style.setProperty('--n', tabs.length);
      navigate(t, input || 'about:newtab');
      select(t);
      if (t.cur.kind === 'newtab') setTimeout(() => url.focus(), 30);
      return t;
    }
    function select(t) {
      active = t;
      tabs.forEach(x => { const on = x === t; x.el.classList.toggle('sel', on); x.el.setAttribute('aria-selected', on); x.view.hidden = !on; });
      closePanel(); sync();
    }
    function closeTab(t) {
      const i = tabs.indexOf(t); if (i < 0) return;
      tabs.splice(i, 1); t.el.remove(); t.view.remove(); tabsEl.style.setProperty('--n', tabs.length);
      if (!tabs.length) return win.close();
      if (active === t) select(tabs[Math.min(i, tabs.length - 1)]);
    }
    function paintTab(t) {
      t.titleEl.textContent = t.title;
      t.el.title = t.title;
      t.favEl.innerHTML = favHTML(t.cur);
      t.el.classList.toggle('loading', t.loading);
    }

    /* ---- navigation ---- */
    function navigate(t, input, o) {
      const p = parse(input);
      if (document.activeElement === url) url.blur();          // programmatic navigation: show the new address
      if (!(o && o.noHist)) { t.hist.splice(t.hi + 1); t.hist.push(p.url); t.hi = t.hist.length - 1; }
      t.cur = p; t.title = p.title;
      renderView(t);
      paintTab(t);
      if (t === active) sync();
    }
    function go(t, d) {
      const i = t.hi + d;
      if (i < 0 || i >= t.hist.length) return;
      t.hi = i;
      navigate(t, t.hist[i], { noHist: true });
    }
    function reload(t) {
      if (t.loading && t.frame) {                                // acts as "stop" while loading
        try { t.frame.contentWindow.stop(); } catch (e) { /* cross-origin */ }
        t.loading = false; paintTab(t); sync(); return;
      }
      navigate(t, t.cur.url, { noHist: true });
    }
    function visit(input) { navigate(active, input); }

    function renderView(t) {
      const p = t.cur;
      t.view.replaceChildren(); t.frame = null; t.loading = false;
      if (p.kind === 'newtab') { t.view.append(home(t)); return; }
      if (p.kind === 'blocked') { t.view.append(errorPage(p)); return; }
      const f = h('iframe', { class: 'ff-frame', title: p.title, src: p.src, allow: 'fullscreen; clipboard-write', referrerpolicy: p.kind === 'internal' ? null : 'no-referrer' });
      if (p.kind !== 'internal') f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals');
      f.addEventListener('load', () => onLoad(t, f));
      t.frame = f; t.loading = true;
      t.view.append(p.kind === 'ig' ? h('div', { class: 'ff-ig' }, f) : f);
    }

    // same-origin pages: follow links clicked inside the page (URL bar, title, history)
    function onLoad(t, f) {
      if (t.frame !== f) return;
      t.loading = false;
      if (t.cur.kind === 'internal') {
        try {
          const loc = f.contentWindow.location, base = new URL('./', document.baseURI).href;
          if (loc.href !== 'about:blank' && loc.href.startsWith(base)) {
            const rel = loc.href.slice(base.length), disp = ORIGIN + '/' + rel;
            if (disp !== t.cur.url) { t.hist.splice(t.hi + 1); t.hist.push(disp); t.hi = t.hist.length - 1; t.cur = Object.assign({}, t.cur, { url: disp, src: './' + rel }); }
            t.title = f.contentDocument.title || t.cur.title;
          }
        } catch (e) { /* opened from file:// — can't peek inside */ }
      }
      paintTab(t); if (t === active) sync();
    }

    /* ---- pages ---- */
    function home(t) {
      const tile = (label, bg, glyph, on) => h('button', { class: 'ff-site', onclick: on },
        h('span', { class: 'ff-site-ic', style: 'background:' + bg }, glyph), h('span', { class: 'ff-site-l' }, label));
      const search = h('input', {
        placeholder: 'Search with Google or enter address', spellcheck: 'false', autocomplete: 'off',
        onkeydown: e => { if (e.key === 'Enter' && e.target.value.trim()) navigate(t, e.target.value); }
      });
      return h('div', { class: 'ff-home' },
        h('div', { class: 'ff-logo' }, h('img', { src: 'assets/icons/firefox.png', alt: '', draggable: 'false' }), h('span', null, 'Firefox')),
        h('label', { class: 'ff-hsearch' }, h('span', { html: I.search }), search),
        h('div', { class: 'ff-sites' },
          tile('Press', '#0a74ff', '</>', () => navigate(t, ORIGIN + '/prensa/')),
          tile('Instagram', 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)', 'IG', () => navigate(t, CONTENT.links.instagram)),
          tile('GitHub', '#24292f', 'GH', () => window.open(CONTENT.links.github, '_blank', 'noopener')),
          tile('CV', '#8e8e93', 'CV', () => WM.launch('cv', { title: 'CV.txt' }))));
    }
    function errorPage(p) {
      return h('div', { class: 'ff-err' }, h('div', { class: 'ff-err-in' },
        h('span', { html: I.warnBig }),
        h('h1', null, p.search ? 'Searching happens in a separate tab' : 'This page can’t be shown in this window'),
        h('p', null, p.search
          ? 'Google doesn’t allow itself to be displayed inside another page, so your search opens in a regular browser tab.'
          : p.host + ' doesn’t allow itself to be displayed inside another page, so it can’t open here. You can still visit it in a regular browser tab.'),
        h('button', { class: 'ff-primary', onclick: () => window.open(p.url, '_blank', 'noopener') }, p.search ? 'Search on Google' : 'Open in a new browser tab')));
    }

    /* ---- toolbar state ---- */
    function sync() {
      const t = active; if (!t) return;
      const p = t.cur, page = p.kind !== 'newtab';
      if (document.activeElement !== url) url.value = page ? pretty(p.url) : '';
      idBox.innerHTML = !page ? I.search : p.kind === 'blocked' ? I.warn : I.shield + I.lock;
      idBox.classList.toggle('plain', !page);
      backB.disabled = t.hi <= 0;
      fwdB.disabled = t.hi >= t.hist.length - 1;
      reloadB.innerHTML = t.loading ? I.x : I.reload;
      reloadB.title = reloadB.ariaLabel = t.loading ? 'Stop' : 'Reload';
      starB.hidden = !page;
      starB.classList.toggle('on', page && isMarked(p.url));
      bm.hidden = page;
    }
    url.addEventListener('focus', () => { field.classList.add('focus'); if (active.cur.kind !== 'newtab') { url.value = active.cur.url; } url.select(); });
    url.addEventListener('blur', () => { field.classList.remove('focus'); sync(); });
    url.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const v = url.value; if (v.trim()) { url.blur(); navigate(active, v); } }
      else if (e.key === 'Escape') url.blur();
    });
    field.addEventListener('pointerdown', e => { if (e.target === field || e.target.closest('.ff-id')) { e.preventDefault(); url.focus(); } });

    /* ---- popup panels (app menu, extensions, account, all tabs) ---- */
    const row = (icon, label, hint, on) => h('button', { class: 'ff-row', onclick: () => { closePanel(); on && on(); } },
      h('span', { class: 'ic', html: icon || '' }), h('span', null, label), hint ? h('small', null, hint) : null);
    function togglePanel(kind) {
      if (!panel.hidden && panel.dataset.kind === kind) return closePanel();
      panel.dataset.kind = kind; panel.className = 'ff-panel ' + kind; panel.replaceChildren();
      if (kind === 'menu') {
        panel.append(
          row(I.plus, 'New tab', '⌘T', () => newTab()),
          row(I.x, 'Close tab', '⌘W', () => closeTab(active)),
          h('div', { class: 'ff-sep' }), h('div', { class: 'ff-ph' }, 'Bookmarks'),
          ...marks.map(m => row(m.cv ? I.doc : bmFav(parse(m.url)), m.title, '', () => m.cv ? WM.launch('cv', { title: 'CV.txt' }) : visit(m.url))),
          h('div', { class: 'ff-sep' }),
          row(I.ext, 'Open page in a browser tab', '', () => { if (active.cur.kind !== 'newtab') window.open(active.cur.url, '_blank', 'noopener'); }),
          h('div', { class: 'ff-sep' }),
          row('', 'Quit Firefox', '⌘Q', () => win.close()));
      } else if (kind === 'tabs') {
        panel.append(...tabs.map(t => h('button', { class: 'ff-row' + (t === active ? ' on' : ''), onclick: () => { closePanel(); select(t); } },
          h('span', { class: 'ic', html: favHTML(t.cur) }), h('span', { class: 'ff-ttl' }, t.title))));
      } else if (kind === 'ext') {
        panel.append(h('div', { class: 'ff-note' }, h('b', null, 'Extensions'), h('p', null, 'No extensions installed. This is a tiny, pretend Firefox.')));
      } else {
        panel.append(h('div', { class: 'ff-note' }, h('b', null, 'Firefox Account'), h('p', null, 'Sign in to sync your passwords, bookmarks and tabs. (Not in this one, though.)')));
      }
      panel.hidden = false;
    }
    function closePanel() { panel.hidden = true; }
    const outside = e => { if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('[data-panel]')) closePanel(); };
    document.addEventListener('pointerdown', outside);
    addEventListener('blur', closePanel);                          // focus moved into an iframe

    /* ---- go ---- */
    renderMarks();
    const first = newTab(opts.url || 'about:newtab');
    first.el.classList.remove('in');

    Browser.inst = {
      win,
      open(input) {
        const p = parse(input);
        const same = p.kind !== 'newtab' && tabs.find(x => x.cur.url === p.url);
        if (same) return select(same);
        if (active.cur.kind === 'newtab' && active.hist.length === 1) { navigate(active, input); sync(); }
        else newTab(input);
      }
    };
    win.onClose = () => { document.removeEventListener('pointerdown', outside); removeEventListener('blur', closePanel); Browser.inst = null; };
  }

  window.Browser = {
    inst: null,
    build,
    parse,
    open(input) {
      if (this.inst) { WM.launch('firefox'); this.inst.open(input); }
      else WM.launch('firefox', { url: input });
    }
  };
})();
