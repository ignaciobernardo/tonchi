/* Hand-drawn SVG icons (app squircles + file icons). */
(function () {
  let n = 0;
  const uid = () => 'i' + (++n);
  const img = n => `<img src="assets/icons/${n}.png" alt="" draggable="false">`;
  const fileIcon = badge => `<div class="fi"><img src="assets/icons/file.png" alt="" draggable="false"><span class="fi-b">${badge}</span></div>`;
  const mask = (n, w, h) => `<i class="mbi" style="--m:url(${new URL('assets/icons/ui/' + n + '.svg', document.baseURI).href});width:${w}px;height:${h}px"></i>`;

  function squircle(c1, c2, inner, extra) {
    const g = uid(), c = uid();
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" draggable="false">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
        <clipPath id="${c}"><rect width="64" height="64" rx="15"/></clipPath>
      </defs>
      <g clip-path="url(#${c})"><rect width="64" height="64" fill="url(#${g})"/>${inner}</g>
      <rect x=".5" y=".5" width="63" height="63" rx="14.5" fill="none" stroke="rgba(0,0,0,.14)"/>
      <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(255,255,255,.35)" ${extra || ''}/>
    </svg>`;
  }

  const Icons = {
    finder() { return img('finder'); },
    launchpad() { return img('launchpad'); },
    firefox() { return img('firefox'); },
    terminal() { return img('terminal'); },
    photobooth() { return img('photobooth'); },
    notes() { return img('notes'); },
    spotify() { return img('spotify'); },
    photos() { return img('photos'); },
    calendar(date) {
      const d = date || new Date();
      const wd = d.toLocaleString('en-US', { weekday: 'short' });
      const f = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
      // the kit icon has a static date: paint over it with a stretched, text-free strip, then write today's
      return `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" draggable="false">
        <image href="assets/icons/calendar.png" width="256" height="256"/>
        <svg x="46" y="38" width="164" height="182" viewBox="26 38 4 182" preserveAspectRatio="none"><image href="assets/icons/calendar.png" width="256" height="256"/></svg>
        <text x="128" y="78" text-anchor="middle" font-family="${f}" font-size="44" font-weight="600" fill="#ff3b30">${wd}</text>
        <text x="128" y="204" text-anchor="middle" font-family="${f}" font-size="138" font-weight="300" fill="#1c1c1e">${d.getDate()}</text>
      </svg>`;
    },

    /* ----- file icons (64x80) ----- */
    page(inner) {
      return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" draggable="false">
        <path d="M8 2h34l16 16v58a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" fill="#fff" stroke="#c4c7d0" stroke-width="1.2"/>
        <path d="M42 2v11a5 5 0 0 0 5 5h11z" fill="#e4e6ec" stroke="#c4c7d0" stroke-width="1.2" stroke-linejoin="round"/>
        ${inner}</svg>`;
    },
    html() { return fileIcon(`<img src="assets/icons/safari.png" alt="" draggable="false">`); },
    txt() { return img('txt'); },
    webloc() {
      const g = uid();
      return fileIcon(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${g}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".65" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="16" fill="url(#${g})"/><rect x="16" y="16" width="32" height="32" rx="10" fill="none" stroke="#fff" stroke-width="4.2"/><circle cx="32" cy="32" r="7.5" fill="none" stroke="#fff" stroke-width="4.2"/><circle cx="43" cy="21" r="2.6" fill="#fff"/></svg>`);
    },

    /* ----- small UI glyphs ----- */
    apple() { return mask('apple', 13, 15); },
    wifi() { return mask('wifi', 20, 12); },
    search() { return mask('search', 16, 16); },
    control() { return mask('control-center', 19, 13); },
    battery() {
      return `<svg viewBox="0 0 28 14" width="25" height="13" fill="none"><rect x=".7" y=".7" width="22.6" height="12.6" rx="3.6" stroke="currentColor" opacity=".55" stroke-width="1.2"/><rect x="2.4" y="2.4" width="16" height="9.2" rx="2.2" fill="currentColor"/><path d="M25 4.7v4.6" stroke="currentColor" opacity=".55" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    }
  };

  window.Icons = Icons;
})();
