/* Home page → "flip the stamp" → macOS desktop. */
(function () {
  const $ = s => document.querySelector(s);
  const wrap = $('#cardWrap'), card = $('#card'), front = $('#front'), back = $('#back'),
    desktop = $('#desktop'), slot = $('#stampSlot'), homeText = $('#homeText'), hint = $('#hint');

  // fill home text
  homeText.innerHTML = CONTENT.home.map(t => `<p>${t}</p>`).join('');
  document.title = CONTENT.siteTitle + ' — Portfolio';

  const PAD = 14, PR = 6, PS = 18;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let vw = 0, vh = 0, S = { x: 0, y: 0, w: 0, h: 0 };
  let p = 0, target = 0, raf = 0, snapT = 0;

  function measure() {
    vw = innerWidth; vh = innerHeight;
    const r = slot.getBoundingClientRect();
    S = { x: r.left, y: r.top, w: r.width, h: r.height };
    desktop.style.width = vw + 'px'; desktop.style.height = vh + 'px';
    render();
  }

  function render() {
    const a = ease(clamp(p / .72)) * 180;
    const z = ease(clamp((p - .3) / .7));
    const w = lerp(S.w, vw, z), h = lerp(S.h, vh, z);
    const x = lerp(S.x, 0, z), y = lerp(S.y, 0, z);
    const done = p >= .999;
    const pad = done ? 0 : lerp(PAD, 0, z);

    Object.assign(wrap.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    wrap.style.transform = (a > .01 && a < 179.9) ? `perspective(1800px) rotateY(${a}deg)` : 'none';
    wrap.classList.toggle('flat', done);
    wrap.style.pointerEvents = done ? 'auto' : 'none';

    const pr = lerp(PR, 0, clamp(z * 1.8));
    card.classList.toggle('perf', pr > .15 && !done);
    card.style.setProperty('--pr', pr + 'px');
    card.style.setProperty('--ps', PS + 'px');
    card.style.setProperty('--pad', pad + 'px');

    const showBack = a > 90;
    front.style.display = showBack ? 'none' : 'block';
    back.style.display = showBack ? 'block' : 'none';
    const mirror = a > 90 && a < 179.9;
    back.style.transform = mirror ? 'scaleX(-1)' : 'none';

    const iw = w - 2 * pad, ih = h - 2 * pad;
    const sc = done ? 1 : Math.max(iw / vw, ih / vh);
    const tx = done ? 0 : (iw - vw * sc) / 2, ty = done ? 0 : (ih - vh * sc) / 2;
    desktop.style.transform = done ? 'none' : `translate(${tx}px, ${ty}px) scale(${sc})`;

    const fade = 1 - clamp(p / .25);
    homeText.style.opacity = fade;
    homeText.style.transform = `translateY(${(1 - fade) * 24}px)`;
    hint.style.opacity = fade * .7;
    document.body.classList.toggle('on-desktop', done);
  }

  function kick() { if (!raf) raf = requestAnimationFrame(step); }
  function step() {
    raf = 0;
    const d = target - p;
    if (Math.abs(d) < .0006) p = target; else p += d * .11;
    render();
    if (p !== target) kick();
  }
  function go(t) { target = t; clearTimeout(snapT); kick(); }
  function snapLater() {
    clearTimeout(snapT);
    snapT = setTimeout(() => { if (target > 0 && target < 1) go(target > .3 ? 1 : 0); }, 140);
  }

  let upAcc = 0, upT = 0;
  addEventListener('wheel', e => {
    const inner = e.target.closest && e.target.closest('.win,.launchpad');
    if (p >= .999) {
      if (inner) return;                   // let windows scroll natively
      e.preventDefault();
      if (e.deltaY < 0) {                  // scrolling up on the bare desktop → back to the stamp
        upAcc += -e.deltaY; clearTimeout(upT); upT = setTimeout(() => upAcc = 0, 250);
        if (upAcc > 220) { upAcc = 0; go(0); }
      }
      return;
    }
    e.preventDefault();
    target = clamp(target + e.deltaY / 650);
    kick(); snapLater();
  }, { passive: false });

  let ty0 = null;
  addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', e => {
    if (p >= .999 || ty0 == null) return;
    const y = e.touches[0].clientY; target = clamp(target + (ty0 - y) / 420); ty0 = y; kick(); snapLater();
    e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', () => { ty0 = null; });

  addEventListener('keydown', e => {
    if (p >= .999 && target >= .999) return;
    if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(0); }
  });
  hint.addEventListener('click', () => go(1));
  addEventListener('resize', measure);

  Desktop.buildDock();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  if (location.hash === '#desktop') { p = target = 1; render(); }

  window.Flip = { go };
})();
