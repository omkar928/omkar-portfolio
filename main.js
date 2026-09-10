/* =========================================================
   Omkar Deshmukh — Portfolio  ·  main.js
   Zero-dependency: custom 3D canvas engine, scroll reveals,
   3D tilt, counters, typewriter, custom cursor.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const GOLD = '242,165,69';

  $('#year').textContent = new Date().getFullYear();

  /* ---------------- Cursor ---------------- */
  if (!isTouch) {
    const cur = $('.cursor'), ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    (function loop() { rx += (mx - rx) * .15; ry += (my - ry) * .15; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    $$('a, button, .tilt, .stat, .award, .pub, .chips span, .about-pills span').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  /* ---------------- Nav / menu / progress ---------------- */
  const nav = $('.nav'), menuBtn = $('.menu-btn'), fullmenu = $('.fullmenu');
  const progress = $('.scroll-progress span');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 60);
    const h = document.documentElement;
    progress.style.width = (scrollY / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });
  const toggleMenu = open => { fullmenu.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  menuBtn.addEventListener('click', () => toggleMenu(!fullmenu.classList.contains('open')));
  $$('.fullmenu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });


  /* ---------------- Text splitting ---------------- */
  // Wrap words in .w (keeps <b>/<em> inline elements intact by recursing into them)
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('bar')) walk(n);
      });
    };
    walk(el);
    $$('.w', el).forEach((w, i) => w.style.transitionDelay = (i * 28) + 'ms');
  }
  $$('[data-words]').forEach(splitWords);

  // Hero headline: each word gets its own entrance (rise / flip / scatter / blur / swing),
  // set as an inline start state; CSS moves every character to rest once body.loaded.
  const rnd = (a, b) => a + Math.random() * (b - a);
  const FX = {
    rise:    (i, n) => ({ t: `translateY(115%)`, d: 80 + i * 45 }),
    flip:    (i, n) => ({ t: `rotateX(-95deg) translateY(.3em)`, o: '50% 100%', d: 260 + i * 70 }),
    scatter: (i, n) => ({ t: `translate3d(${rnd(-160, 160)}px,${rnd(-120, 120)}px,${rnd(-500, -200)}px) rotate(${rnd(-50, 50)}deg) scale(.5)`, f: 'blur(10px)', d: 380 + Math.random() * 500 }),
    blur:    (i, n) => ({ t: `translateX(${rnd(-14, 14)}px) scale(1.15)`, f: 'blur(16px)', d: 900 + i * 40 }),
    swing:   (i, n) => ({ t: `rotateY(95deg) translateX(-.2em)`, o: '0 50%', d: 1050 + i * 60 }),
  };
  $$('.hero-title [data-fx]').forEach(word => {
    const fx = FX[word.dataset.fx] || FX.rise, chars = [...word.textContent];
    word.textContent = '';
    chars.forEach((ch, i) => {
      const s = document.createElement('span'); s.className = 'ch' + (ch === ' ' ? ' space' : ''); s.textContent = ch === ' ' ? ' ' : ch;
      const st = fx(i, chars.length);
      s.style.transform = st.t; if (st.f) s.style.filter = st.f; if (st.o) s.style.transformOrigin = st.o;
      s.style.transitionDelay = Math.round(st.d) + 'ms';
      word.appendChild(s);
    });
  });


  /* ---------------- Auto-fit display type ----------------
     Font metrics differ per device/browser, so a fixed vw size can still
     overflow. Measure the real rendered width and scale down until it fits. */
  function fitDisplayType() {
    const title = $('.hero-title');
    if (title) {
      const avail = title.clientWidth;
      $$('.line', title).forEach(line => {
        const words = $$('[data-fx]', line);
        if (!words.length || !avail) return;
        words.forEach(w => w.style.fontSize = '');
        const gap = (words.length - 1) * 12;
        let total = words.reduce((s, w) => s + w.getBoundingClientRect().width, 0) + gap;
        if (total > avail) {
          const k = (avail / total) * 0.97;
          words.forEach(w => {
            const base = parseFloat(getComputedStyle(w).fontSize);
            w.style.fontSize = (base * k).toFixed(1) + 'px';
          });
        }
      });
    }
    const ct = $('.contact-title');
    if (ct) {
      ct.style.fontSize = '';
      let guard = 0;
      while (ct.scrollWidth > ct.clientWidth + 1 && guard++ < 40) {
        ct.style.fontSize = (parseFloat(getComputedStyle(ct).fontSize) * 0.94).toFixed(1) + 'px';
      }
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitDisplayType);
  fitDisplayType();
  let fitT; addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitDisplayType, 150); });

  /* ---------------- Typewriter ---------------- */
  const roles = ['Software Engineer', 'Researcher · Innovator', 'Developer & Event Organizer', 'Patent Holder · 4 Granted (IN + US)', 'TEDxSNPSU Organizer & Licensee', 'President, BioBridge', 'Team Leader, ISRO STRC 2026', 'NUS Young Fellow (FIERD)'];
  const tw = $('.tw-text'); let ri = 0, ci = 0, del = false;
  (function type() {
    const word = roles[ri]; tw.textContent = word.slice(0, ci);
    if (!del && ci < word.length) { ci++; setTimeout(type, 55); }
    else if (!del) { del = true; setTimeout(type, 1800); }
    else if (ci > 0) { ci--; setTimeout(type, 28); }
    else { del = false; ri = (ri + 1) % roles.length; setTimeout(type, 300); }
  })();

  /* =========================================================
     Mini 3D engine (Canvas 2D with perspective projection)
     ========================================================= */
  const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
  const rotY = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
  const rotZ = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };

  function initHero() {
    const canvas = $('#hero-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr, scale = 1, offX = 0, offY = 0;

    // --- Constellation sphere (fibonacci)
    const N = 380, R = 1;
    const sph = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - 2 * (i + .5) / N), th = Math.PI * (1 + Math.sqrt(5)) * i;
      sph.push([R * Math.cos(th) * Math.sin(phi), R * Math.sin(th) * Math.sin(phi), R * Math.cos(phi)]);
    }
    const edges = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(sph[i][0] - sph[j][0], sph[i][1] - sph[j][1], sph[i][2] - sph[j][2]);
      if (d < .23) edges.push([i, j]);
    }
    // --- Icosahedron
    const t = (1 + Math.sqrt(5)) / 2, s = .46 / Math.hypot(1, t);
    const icoV = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v => v.map(x => x * s));
    const icoE = [[0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9], [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9], [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10], [8, 9], [10, 11]];
    // --- Rings
    const ringPts = n => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [Math.cos(a), 0, Math.sin(a)]; });
    const ring = ringPts(140);
    // --- Helix
    const helix = [];
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 4, y = (i / 48 - .5) * 2.2; helix.push([[Math.cos(a) * .22, y, Math.sin(a) * .22], [-Math.cos(a) * .22, y, -Math.sin(a) * .22]]); }
    // --- Dust
    const dust = Array.from({ length: innerWidth < 680 ? 90 : 260 }, () => [(Math.random() - .5) * 6, (Math.random() - .5) * 4, (Math.random() - .5) * 4]);

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(W, H) * (W < 680 ? .34 : W < 1100 ? .38 : .42);
      offX = W < 1100 ? 0 : W * .22; offY = W < 1100 ? H * .22 : 0;
    };
    resize(); addEventListener('resize', resize);

    let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0;
    addEventListener('mousemove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
    addEventListener('scroll', () => sy = scrollY, { passive: true });
    let running = true; new IntersectionObserver(([e]) => running = e.isIntersecting).observe(canvas);

    const FOV = 3.2;
    const project = (p, ox, oy, sc) => { const z = FOV / (FOV + p[2]); return [ox + p[0] * sc * z, oy + p[1] * sc * z, z]; };

    let t0 = performance.now();
    (function frame(now) {
      requestAnimationFrame(frame); if (!running) return;
      const T = Math.max(0, (now - t0) / 1000);
      cx += (tx - cx) * .05; cy += (ty - cy) * .05;
      const ox = W / 2 + offX + cx * -30, oy = H / 2 + offY - sy * .25 + cy * -20;
      ctx.clearRect(0, 0, W, H);

      // dust
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (const d of dust) { const p = project(rotY(d, T * .02 + cx * .3), W / 2, H / 2 - sy * .1, Math.min(W, H) * .45); ctx.fillRect(p[0], p[1], 1.2, 1.2); }

      // rings
      const drawRing = (rx, rz, rad, alpha, spin) => {
        ctx.strokeStyle = `rgba(${GOLD},${alpha})`; ctx.lineWidth = 1; ctx.beginPath();
        ring.forEach((p, i) => { let q = rotY(p, spin); q = rotX(q, rx); q = rotZ(q, rz); q = rotY(q, cx * .8); q = rotX(q, cy * .6); const pr = project(q, ox, oy, scale * rad); i ? ctx.lineTo(pr[0], pr[1]) : ctx.moveTo(pr[0], pr[1]); });
        ctx.closePath(); ctx.stroke();
      };
      drawRing(1.25, .25 + T * .05, 1.42, .45, T * .2); drawRing(1.9, -.5 - T * .04, 1.65, .22, -T * .15);

      // icosahedron
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.beginPath();
      const icoP = icoV.map(v => { let q = rotY(v, -T * .35 + cx); q = rotX(q, T * .25 + cy); return project(q, ox, oy, scale); });
      icoE.forEach(([a, b]) => { ctx.moveTo(icoP[a][0], icoP[a][1]); ctx.lineTo(icoP[b][0], icoP[b][1]); });
      ctx.stroke();

      // constellation sphere
      const ry = T * .14 + cx * .9, rx = Math.sin(T * .3) * .1 + cy * .6;
      const pts = sph.map((p, i) => { const b = 1 + Math.sin(T * 1.4 + i * .37) * .03; let q = [p[0] * b, p[1] * b, p[2] * b]; q = rotY(q, ry); q = rotX(q, rx); return project(q, ox, oy, scale); });
      ctx.lineWidth = 1;
      for (const [a, b] of edges) { const z = (pts[a][2] + pts[b][2]) / 2; ctx.strokeStyle = `rgba(${GOLD},${.05 + (z - .7) * .5})`; ctx.beginPath(); ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); ctx.stroke(); }
      for (const p of pts) { const z = p[2]; ctx.fillStyle = `rgba(${GOLD},${.25 + (z - .7) * 1.6})`; ctx.beginPath(); ctx.arc(p[0], p[1], 1 + (z - .7) * 4, 0, Math.PI * 2); ctx.fill(); }
      // occasional "signal" pulses along edges
      for (let k = 0; k < 6; k++) { const e = edges[((Math.floor(T * 2) * 31 + k * 97) % edges.length + edges.length) % edges.length]; const f = (T * 2) % 1; const a = pts[e[0]], b = pts[e[1]]; ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 2, 0, Math.PI * 2); ctx.fill(); }

      // helix (left side on wide screens, hidden on small)
      if (W >= 1100) {
        const hx = W * .05, hy = H / 2 + Math.sin(T * .6) * 12 - sy * .3, hs = scale * .75;
        helix.forEach(([a, b], i) => {
          let qa = rotY(a, T * .6); qa = rotZ(qa, .18); let qb = rotY(b, T * .6); qb = rotZ(qb, .18);
          const pa = project(qa, hx, hy, hs), pb = project(qb, hx, hy, hs);
          if (i % 2 === 0) { ctx.strokeStyle = `rgba(${GOLD},.18)`; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); }
          ctx.fillStyle = `rgba(${GOLD},${.25 + (pa[2] - .7) * 1.2})`; ctx.beginPath(); ctx.arc(pa[0], pa[1], 1.5 + (pa[2] - .7) * 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${.18 + (pb[2] - .7) * 1.2})`; ctx.beginPath(); ctx.arc(pb[0], pb[1], 1.5 + (pb[2] - .7) * 5, 0, Math.PI * 2); ctx.fill();
        });
      }
    })(t0);
  }

  /* ---------------- Contact particle field ---------------- */
  function initContact() {
    const canvas = $('#contact-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, pts = [], mouse = { x: -9999, y: -9999 };
    const resize = () => { w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight;
      pts = Array.from({ length: Math.min(w < 680 ? 60 : 160, Math.floor(w * h / 9000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })); };
    resize(); addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    let running = false; new IntersectionObserver(([e]) => running = e.isIntersecting).observe(canvas);
    (function draw() {
      requestAnimationFrame(draw); if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        ctx.fillStyle = `rgba(${GOLD},.8)`; ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) { ctx.strokeStyle = `rgba(${GOLD},${(1 - d / 120) * .25})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
    })();
  }

  /* ---------------- DNA helix (patent card) ---------------- */
  function initDNA() {
    const c = $('#dna-canvas'); if (!c) return;
    const ctx = c.getContext('2d'), W = c.width, H = c.height;
    let running = false; new IntersectionObserver(([e]) => running = e.isIntersecting).observe(c);
    let t = 0;
    (function draw() {
      requestAnimationFrame(draw); if (!running) return; t += .02;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, rows = 26;
      for (let i = 0; i < rows; i++) {
        const y = 30 + i * (H - 60) / (rows - 1), ph = t + i * .42;
        const x1 = cx + Math.sin(ph) * 90, x2 = cx + Math.sin(ph + Math.PI) * 90, z1 = Math.cos(ph), z2 = -z1;
        ctx.strokeStyle = `rgba(${GOLD},.25)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        [[x1, z1, '#f2a545'], [x2, z2, '#ffffff']].forEach(([x, z, col]) => { ctx.globalAlpha = .45 + z * .5; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 4 + z * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; });
      }
    })();
  }

  /* ---------------- 3D tilt ---------------- */
  function initTilt() {
    if (isTouch || reduce) return;
    $$('[data-tilt]').forEach(el => {
      const max = parseFloat(el.dataset.tiltMax || 10);
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateX(${(y - .5) * -max}deg) rotateY(${(x - .5) * max}deg) translateZ(6px)`;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; });
    });
    const ph = $('#hero-photo'), hc = $('#hero-content');
    addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      ph.style.setProperty('--rx', (-y * 8) + 'deg'); ph.style.setProperty('--ry', (x * 10) + 'deg');
      hc.style.setProperty('--hry', (x * 4) + 'deg'); hc.style.setProperty('--hrx', (-y * 3) + 'deg');
    });
  }

  /* ---------------- Counters & cert bars ---------------- */
  function initCounters() {
    $$('.stat-num').forEach(el => {
      const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; io.disconnect();
        const start = performance.now(), dur = 1800;
        (function step(now) {
          const p = Math.min(1, (now - start) / dur), ease = 1 - Math.pow(1 - p, 4);
          el.textContent = pre + (target * ease).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(start);
      }, { threshold: .5 }); io.observe(el);
    });
    $$('.cert').forEach(el => new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('in-view'); }, { threshold: .3 }).observe(el));
  }

  /* ---------------- Scroll reveals ---------------- */
  function initReveals() {
    const groups = ['.stat', '.about-photo', '.about-text', '.mini-stats > div', '.patent-hero', '.card', '.pub', '.project', '.events', '.tl-item', '.grant', '.award', '.skill-col', '.sub-head', '.lang', '.cert', '.cert-note', '.contact-inner > *'];
    const targets = groups.flatMap(sel => $$(sel));
    $$('[data-words]:not(.hero-sub):not(.section-title)').forEach(el => targets.push(el));
    targets.forEach(el => el.classList.add('rv'));
    $$('.section-head').forEach(h => h.classList.add('rv-head'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // stagger siblings that appear together
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv') && !c.classList.contains('in'));
      const idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = (Math.min(idx, 8) * 80) + 'ms';
      el.classList.add('in'); io.unobserve(el);
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
    const ioH = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ioH.unobserve(e.target); } }), { threshold: .3 });
    $$('.rv-head').forEach(el => ioH.observe(el));

    // timeline line grow
    const timeline = $('.timeline');
    if (timeline) {
      const line = document.createElement('div'); line.className = 'tl-line'; timeline.appendChild(line);
      const upd = () => { const r = timeline.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height)); line.style.height = `calc(${p * 100}% - 20px)`; };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
    // hero parallax on scroll
    const hc = $('.hero-content'), hp = $('#hero-photo'), ct = $('.contact-title');
    addEventListener('scroll', () => {
      const y = scrollY, vh = innerHeight;
      if (y < vh) { hc.style.setProperty('--sy', (-y * .25) + 'px'); hc.style.opacity = 1 - y / vh * 1.1; hp.style.setProperty('--sy', (y * .18) + 'px'); }
      if (ct && innerWidth > 680) { const r = ct.getBoundingClientRect(); const off = Math.max(-40, Math.min(40, (r.top - vh) * .08)); ct.style.transform = `translateY(${off}px)`; }
    }, { passive: true });
  }

  /* ---------------- Boot ---------------- */
  window.addEventListener('load', () => {
    initHero(); initContact(); initDNA(); initTilt(); initCounters(); initReveals();
    setTimeout(() => { $('#preloader').classList.add('done'); document.body.classList.add('loaded'); }, reduce ? 0 : 1500);
  });
})();
