/* Window manager, menu bar, dock and desktop icons. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const desk = $('#desktop'), layer = $('#windows'), dockEl = $('#dock');
  const MB = 30; // menu bar height

  window.h = function (tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const h = window.h;

  const Apps = {
    list: [], by: {},
    reg(a) { this.list.push(a); this.by[a.id] = a; }
  };
  window.Apps = Apps;

  const State = {
    shots: [], subs: {},
    on(k, f) { (this.subs[k] = this.subs[k] || []).push(f); },
    off(k, f) { this.subs[k] = (this.subs[k] || []).filter(x => x !== f); },
    emit(k) { (this.subs[k] || []).slice().forEach(f => f()); }
  };
  window.State = State;

  /* ------------------------------------------------------------ windows */
  const wins = [];
  let zc = 100, cascade = 0, focused = null;
  const size = () => ({ vw: desk.clientWidth, vh: desk.clientHeight });

  function dockRect(appId) {
    const it = dockEl.querySelector(`[data-app="${appId}"]`);
    const r = (it || dockEl).getBoundingClientRect();
    const d = desk.getBoundingClientRect();
    const s = d.width / desk.clientWidth || 1;
    return { cx: (r.left + r.width / 2 - d.left) / s, cy: (r.top + r.height / 2 - d.top) / s };
  }

  function refreshRunning() {
    dockEl.querySelectorAll('.ditem').forEach(it => {
      it.classList.toggle('run', wins.some(w => w.app.id === it.dataset.app) || it.dataset.app === 'finder' && false);
    });
  }

  function focus(w) {
    if (w && w.minimized) return;
    focused = w || null;
    wins.forEach(x => x.el.classList.toggle('focus', x === w));
    if (w) w.el.style.zIndex = ++zc;
    Menubar.setApp(w ? w.app.name : 'Finder');
  }

  function topVisible() {
    return wins.filter(w => !w.minimized).sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex)[0] || null;
  }

  function launch(id, opts) {
    opts = opts || {};
    const app = Apps.by[id];
    if (!app) return;
    const key = opts.key || id;
    let w = wins.find(x => x.key === key);
    if (w) {
      if (w.minimized) restore(w);
      focus(w);
      return w;
    }
    const dk = dockEl.querySelector(`[data-app="${app.id}"]`);
    if (dk && !dk.classList.contains('run')) {
      dk.classList.remove('bounce'); void dk.offsetWidth; dk.classList.add('bounce');
      setTimeout(() => dk.classList.remove('bounce'), 1000);
    }
    w = createWin(app, key, opts);
    wins.push(w);
    app.build(w, opts);
    refreshRunning();
    focus(w);
    return w;
  }

  function createWin(app, key, opts) {
    const { vw, vh } = size();
    const maxW = vw - 24, maxH = vh - MB - 100;
    let W = Math.min(opts.w || app.w || 640, maxW), H = Math.min(opts.h || app.h || 440, maxH);
    const el = h('div', { class: 'win ' + (app.cls || '') },
      h('div', { class: 'titlebar' },
        h('div', { class: 'lights' }, h('button', { class: 'l close', 'aria-label': 'Close' }), h('button', { class: 'l min', 'aria-label': 'Minimize' }), h('button', { class: 'l max', 'aria-label': 'Zoom' })),
        h('div', { class: 'title' }),
        h('div', { class: 'tb-right' })),
      h('div', { class: 'body' }),
      h('div', { class: 'rz' }));
    const off = (cascade++ % 6) * 28;
    let x = Math.round((vw - W) / 2 + off - 40), y = Math.round(Math.max(MB + 14, (vh - H) / 2 - 24) + off);
    x = Math.max(8, Math.min(x, vw - W - 8)); y = Math.min(y, vh - H - 70);
    Object.assign(el.style, { left: x + 'px', top: Math.max(MB + 8, y) + 'px', width: W + 'px', height: H + 'px', zIndex: ++zc });
    layer.append(el);
    // macOS: the window fades in while growing from ~95%, overshooting a hair, then settling
    el.animate([
      { opacity: 0, transform: 'scale(.94)' },
      { opacity: 1, transform: 'scale(1.012)', offset: .6 },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 320, easing: 'cubic-bezier(.22,.8,.3,1)' });

    const w = {
      el, app, key, minimized: false, maximized: false,
      body: el.querySelector('.body'), right: el.querySelector('.tb-right'),
      titleEl: el.querySelector('.title'), onClose: null, minW: app.minW || 340, minH: app.minH || 220,
      setTitle(t) { this.titleEl.textContent = t; },
      close() { closeWin(w); }
    };
    w.setTitle(opts.title || app.title || app.name);

    el.addEventListener('pointerdown', () => { if (focused !== w) focus(w); }, true);
    el.querySelector('.close').onclick = () => closeWin(w);
    el.querySelector('.min').onclick = () => minimize(w);
    el.querySelector('.max').onclick = () => toggleMax(w);
    el.querySelector('.titlebar').addEventListener('dblclick', e => { if (!e.target.closest('.lights,.tb-right')) toggleMax(w); });

    // drag
    const tb = el.querySelector('.titlebar');
    tb.addEventListener('pointerdown', e => {
      if (e.button || e.target.closest('.lights,.tb-right button,.tb-right input') || w.maximized) return;
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      tb.setPointerCapture(e.pointerId);
      const mv = ev => {
        const s = size();
        let nx = ox + ev.clientX - sx, ny = oy + ev.clientY - sy;
        ny = Math.max(MB, Math.min(ny, s.vh - 44));
        nx = Math.max(-el.offsetWidth + 90, Math.min(nx, s.vw - 90));
        el.style.left = nx + 'px'; el.style.top = ny + 'px';
      };
      const up = () => { tb.removeEventListener('pointermove', mv); tb.removeEventListener('pointerup', up); tb.removeEventListener('pointercancel', up); };
      tb.addEventListener('pointermove', mv); tb.addEventListener('pointerup', up); tb.addEventListener('pointercancel', up);
    });

    // resize
    const rz = el.querySelector('.rz');
    rz.addEventListener('pointerdown', e => {
      if (w.maximized) return;
      e.preventDefault(); rz.setPointerCapture(e.pointerId);
      const sx = e.clientX, sy = e.clientY, ow = el.offsetWidth, oh = el.offsetHeight;
      el.classList.add('resizing');
      const mv = ev => {
        el.style.width = Math.max(w.minW, ow + ev.clientX - sx) + 'px';
        el.style.height = Math.max(w.minH, oh + ev.clientY - sy) + 'px';
      };
      const up = () => { el.classList.remove('resizing'); rz.removeEventListener('pointermove', mv); rz.removeEventListener('pointerup', up); rz.removeEventListener('pointercancel', up); };
      rz.addEventListener('pointermove', mv); rz.addEventListener('pointerup', up); rz.addEventListener('pointercancel', up);
    });
    return w;
  }

  function closeWin(w) {
    if (w.closing) return;
    w.closing = true;
    try { w.onClose && w.onClose(); } catch (e) { console.error(e); }
    const i = wins.indexOf(w); if (i > -1) wins.splice(i, 1);
    refreshRunning();
    w.el.style.pointerEvents = 'none';
    // macOS: ~0.2s, fades out while scaling down to ~95%
    const a = w.el.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(.95)' }
    ], { duration: 200, easing: 'cubic-bezier(.4,0,.7,.6)', fill: 'forwards' });
    a.onfinish = () => w.el.remove();
    if (focused === w) focus(topVisible());
  }

  // Genie-style minimize: the bottom of the window pinches toward the dock icon
  const FULL = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  function minimize(w) {
    if (w.minimized) return;
    const el = w.el, dr = dockRect(w.app.id);
    const dx = dr.cx - (el.offsetLeft + el.offsetWidth / 2);
    const dy = dr.cy - (el.offsetTop + el.offsetHeight);
    el.style.transformOrigin = '50% 100%';
    w.anim = el.animate([
      { transform: 'translate(0,0) scale(1,1)', clipPath: FULL, opacity: 1 },
      { transform: `translate(${dx * .35}px, ${dy * .5}px) scale(.82,.7)`, clipPath: 'polygon(0 0, 100% 0, 78% 100%, 22% 100%)', opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.07,.05)`, clipPath: 'polygon(0 0, 100% 0, 60% 100%, 40% 100%)', opacity: .5 }
    ], { duration: 520, easing: 'cubic-bezier(.55,.05,.75,.45)', fill: 'forwards' });
    w.minimized = true;
    el.style.pointerEvents = 'none';
    w.anim.onfinish = () => { if (w.minimized) el.style.visibility = 'hidden'; };
    if (focused === w) focus(topVisible());
  }

  function restore(w) {
    const el = w.el;
    w.minimized = false;
    el.style.visibility = '';
    focus(w);
    if (!w.anim) return;
    const a = w.anim;
    a.onfinish = () => { a.cancel(); w.anim = null; el.style.pointerEvents = ''; el.style.transformOrigin = ''; };
    a.reverse();
  }

  function toggleMax(w) {
    const el = w.el, { vw, vh } = size();
    el.classList.add('animating');
    if (!w.maximized) {
      w.prev = { l: el.style.left, t: el.style.top, w: el.style.width, h: el.style.height };
      Object.assign(el.style, { left: '10px', top: MB + 6 + 'px', width: vw - 20 + 'px', height: vh - MB - 102 + 'px' });
      w.maximized = true; el.classList.add('maxed');
    } else {
      Object.assign(el.style, { left: w.prev.l, top: w.prev.t, width: w.prev.w, height: w.prev.h });
      w.maximized = false; el.classList.remove('maxed');
    }
    setTimeout(() => el.classList.remove('animating'), 360);
  }

  window.WM = { launch, focus, wins, MB, size };

  /* ------------------------------------------------------------ menubar */
  const Menubar = (() => {
    const bar = $('#menubar');
    const appName = h('span', { class: 'mb-item mb-app' }, 'Finder');
    const left = h('div', { class: 'mb-left' },
      h('button', { class: 'mb-item mb-apple', 'aria-label': 'Apple menu', html: Icons.apple() }),
      appName,
      ...['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map(t => h('span', { class: 'mb-item mb-dim' }, t)));
    const clock = h('span', { class: 'mb-item mb-clock' });
    const right = h('div', { class: 'mb-right' },
      h('span', { class: 'mb-glyph', html: Icons.wifi() }),
      h('span', { class: 'mb-glyph', html: Icons.search() }),
      h('span', { class: 'mb-glyph', html: Icons.control() }),
      clock);
    bar.append(left, right);

    function tick() {
      const d = new Date();
      clock.textContent = d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '  ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    tick(); setInterval(tick, 10000);

    // apple dropdown
    const dd = h('div', { class: 'dd', hidden: '' },
      h('button', { onclick: () => { close(); WM.launch('finder'); } }, 'About This Portfolio'),
      h('hr'),
      h('button', { onclick: () => { close(); window.Flip && Flip.go(0); } }, 'Back to Home'),
      h('button', { onclick: () => { close(); window.open(CONTENT.links.instagram, '_blank', 'noopener'); } }, 'Instagram…'));
    bar.append(dd);
    const apple = left.querySelector('.mb-apple');
    function close() { dd.hidden = true; apple.classList.remove('open'); }
    apple.addEventListener('click', e => { e.stopPropagation(); dd.hidden = !dd.hidden; apple.classList.toggle('open', !dd.hidden); });
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.dd,.mb-apple')) close(); });

    return { setApp(n) { appName.textContent = n; }, close };
  })();
  window.Menubar = Menubar;

  /* ------------------------------------------------------------ desktop files */
  const Files = {
    list: [
      { id: 'projects', name: 'projects.html', icon: () => Icons.html() },
      { id: 'cv', name: 'CV.txt', icon: () => Icons.txt() },
      { id: 'instagram', name: 'Instagram', icon: () => Icons.webloc() }
    ],
    open(id) {
      if (id === 'projects') {
        // new browser tab; its back arrow closes it and returns here
        const t = window.open('projects/', '_blank');
        if (!t) location.href = 'projects/';
      } else if (id === 'cv') {
        WM.launch('cv', { title: 'CV.txt' });
      } else if (id === 'instagram') {
        window.open(CONTENT.links.instagram, '_blank', 'noopener');
      }
    }
  };
  window.Files = Files;

  const iconsEl = $('#icons');
  const hint = h('div', { class: 'dhint', style: `left:20px;top:${MB + 22 + Files.list.length * 142}px` }, 'double-click to open · drag to move');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function selectIcon(el) {
    iconsEl.querySelectorAll('.dicon').forEach(x => x.classList.toggle('sel', x === el));
  }
  Files.list.forEach((f, i) => {
    const el = h('div', { class: 'dicon', tabindex: '0', 'data-file': f.id, style: `left:20px;top:${MB + 22 + i * 142}px` },
      h('div', { class: 'dimg', html: f.icon() }), h('div', { class: 'dname' }, h('span', null, f.name)));
    let touch = false, moved = false, justDragged = false;
    el.addEventListener('pointerdown', e => {
      if (e.button) return;
      touch = e.pointerType !== 'mouse'; moved = false;
      selectIcon(el);
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved) { if (Math.hypot(dx, dy) < 5) return; moved = true; el.classList.add('dragging'); hint.classList.add('gone'); }
        const { vw, vh } = WM.size();
        el.style.left = clamp(ox + dx, 0, vw - el.offsetWidth) + 'px';
        el.style.top = clamp(oy + dy, MB, vh - el.offsetHeight - 6) + 'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        el.classList.remove('dragging');
        if (moved) { justDragged = true; setTimeout(() => justDragged = false, 60); }
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (justDragged) return;
      selectIcon(el); hint.classList.add('gone');
      if (touch) Files.open(f.id);
    });
    el.addEventListener('dblclick', () => { if (!justDragged) Files.open(f.id); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') Files.open(f.id); });
    iconsEl.append(el);
  });
  iconsEl.append(hint);

  desk.addEventListener('pointerdown', e => {
    if (e.target.closest('.win,.dicon,#dock,#menubar,.launchpad')) return;
    iconsEl.querySelectorAll('.dicon').forEach(x => x.classList.remove('sel'));
    focus(null);
  });

  /* ------------------------------------------------------------ dock */
  const DOCK = ['finder', 'launchpad', 'firefox', 'terminal', 'photobooth', 'notes', 'spotify', 'photos', 'calendar', 'contacts'];
  const BASE = 56, GAP = 8, PADX = 12, MAXS = 1.7, REACH = 130;
  const tip = h('div', { class: 'dtip' });
  desk.append(tip);
  let baseW = 0, dragging = false, justDragged = false;
  const baseCenter = i => PADX + i * (BASE + GAP) + BASE / 2;

  function buildDock() {
    dockEl.innerHTML = '';
    DOCK.forEach(id => {
      const app = Apps.by[id];
      if (!app) return;
      const it = h('button', { class: 'ditem', 'data-app': id, 'aria-label': app.name },
        h('div', { class: 'dimg', html: app.icon() }), h('i', { class: 'dot' }));
      it.addEventListener('click', () => {
        if (justDragged) return;
        if (id === 'launchpad') { Launchpad.toggle(); return; }
        Launchpad.close();
        const w = wins.filter(x => x.app.id === id)[0];
        if (id === 'finder' && !w) { launch('finder'); return; }
        if (w && !w.minimized && focused === w && wins.filter(x => x.app.id === id).length === 1) { return; }
        launch(id, w ? { key: w.key } : {});
      });
      dockEl.append(it);
    });
    dockEl.style.width = '';
    baseW = dockEl.offsetWidth;
    refreshRunning();
  }

  const dockItems = () => [...dockEl.querySelectorAll('.ditem')];

  function magnify(e) {
    if (dragging) return;
    const items = dockItems();
    const dr = dockEl.getBoundingClientRect();
    const left = dr.left + dr.width / 2 - baseW / 2;     // left edge of the un-magnified dock
    const mx = e ? e.clientX - left : -9999;
    const scales = items.map((it, i) => 1 + (MAXS - 1) * Math.pow(Math.max(0, 1 - Math.abs(mx - baseCenter(i)) / REACH), 1.6));
    const extra = scales.map(s => (s - 1) * BASE);
    const total = extra.reduce((a, b) => a + b, 0);
    dockEl.style.width = (baseW + total).toFixed(1) + 'px';   // the capsule grows with the icons
    let acc = 0, hov = null, best = 0;
    items.forEach((it, i) => {
      const tx = -total / 2 + acc + extra[i] / 2;
      acc += extra[i];
      it.style.transform = `translateX(${tx.toFixed(1)}px) scale(${scales[i].toFixed(3)})`;
      if (scales[i] > best) { best = scales[i]; hov = it; }
    });
    if (e && hov && best > 1.15) {
      const r = hov.getBoundingClientRect(), d = desk.getBoundingClientRect();
      tip.textContent = Apps.by[hov.dataset.app].name;
      tip.style.left = r.left + r.width / 2 - d.left + 'px';
      tip.style.top = r.top - d.top - 10 + 'px';
      tip.classList.add('show');
    } else tip.classList.remove('show');
  }
  dockEl.addEventListener('mousemove', magnify);
  dockEl.addEventListener('mouseleave', () => magnify(null));

  // drag an icon sideways to rearrange the dock
  dockEl.addEventListener('pointerdown', e => {
    const it = e.target.closest('.ditem');
    if (!it || e.button) return;
    const sx = e.clientX;
    let started = false;
    const mv = ev => {
      if (!started) {
        if (Math.abs(ev.clientX - sx) < 6) return;
        started = true; dragging = true;
        it.classList.add('dragging'); tip.classList.remove('show'); dockEl.classList.add('reordering');
        dockItems().forEach(x => { if (x !== it) x.style.transform = ''; });
        dockEl.style.width = '';
      }
      const left = dockEl.getBoundingClientRect().left;
      const items = dockItems(), cur = items.indexOf(it);
      const idx = clamp(Math.round((ev.clientX - left - PADX - BASE / 2) / (BASE + GAP)), 0, items.length - 1);
      if (idx !== cur) {
        const before = new Map(items.map(x => [x, x.getBoundingClientRect().left]));
        const ref = items[idx];
        if (idx > cur) ref.after(it); else ref.before(it);
        dockItems().forEach(x => {
          if (x === it) return;
          const d = before.get(x) - x.getBoundingClientRect().left;
          if (d) { x.style.transition = 'none'; x.style.transform = `translateX(${d}px)`; void x.offsetWidth; x.style.transition = ''; x.style.transform = ''; }
        });
      }
      const slot = left + baseCenter(dockItems().indexOf(it));
      it.style.transform = `translateX(${ev.clientX - slot}px) translateY(-6px) scale(1.1)`;
    };
    const up = () => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      if (!started) return;
      it.classList.remove('dragging'); dockEl.classList.remove('reordering');
      it.style.transform = '';
      dragging = false; justDragged = true; setTimeout(() => justDragged = false, 60);
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });

  /* ------------------------------------------------------------ launchpad */
  const lp = $('#launchpad');
  const Launchpad = {
    open() {
      lp.innerHTML = '';
      const grid = h('div', { class: 'lp-grid' });
      Apps.list.filter(a => a.id !== 'launchpad' && !a.hidden).forEach(a => {
        grid.append(h('button', { class: 'lp-app', onclick: e => { e.stopPropagation(); Launchpad.close(); launch(a.id); } },
          h('div', { class: 'dimg', html: a.icon() }), h('span', null, a.name)));
      });
      lp.append(grid);
      lp.classList.add('on');
    },
    close() {
      if (!lp.classList.contains('on') || lp.classList.contains('out')) return;
      lp.classList.add('out');
      setTimeout(() => lp.classList.remove('on', 'out'), 220);
    },
    toggle() { lp.classList.contains('on') ? this.close() : this.open(); }
  };
  lp.addEventListener('pointerdown', e => { if (e.target === lp || e.target.classList.contains('lp-grid')) Launchpad.close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') Launchpad.close(); });
  window.Launchpad = Launchpad;

  window.Desktop = { buildDock, refreshRunning };
})();
