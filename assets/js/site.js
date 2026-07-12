/* ═══════════════════════════════════════════════════════════════════
   SENTYS v4 — "THE PANEL" · console behaviours
   1. hero annunciator: blink, lamp test, acknowledge
   2. hero voice: LED readout typing the system's real triage lines
   3. story: the chart recorder — engine 03's life, drawn in real time
   4. quiet reveals, scrollspy (pressed nav button), pump-hall video
   ═══════════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

/* ── reveals ─────────────────────────────────────────────────────── */
{
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ── scrollspy: the pressed button ───────────────────────────────── */
{
  const links = $$('.nav-links a[href^="#"]:not(.nav-cta)');
  const secs = links.map(a => $(a.hash)).filter(Boolean);
  if (secs.length){
    const spy = new IntersectionObserver(es => es.forEach(e => {
      const a = links.find(l => l.hash === '#' + e.target.id);
      if (a) e.isIntersecting ? a.setAttribute('aria-current', 'true')
                              : a.removeAttribute('aria-current');
    }), { rootMargin: '-30% 0px -55% 0px' });
    secs.forEach(s => spy.observe(s));
  }
}

/* ── annunciator ─────────────────────────────────────────────────── */
{
  const wins = $$('.win'), lt = $('#lamptest'), ack = $('#ack');
  if (lt){
    const on  = () => wins.forEach(w => w.classList.add('lamptest'));
    const off = () => wins.forEach(w => w.classList.remove('lamptest'));
    lt.addEventListener('pointerdown', on);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => lt.addEventListener(e, off));
    lt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); on(); } });
    lt.addEventListener('keyup', off);
  }
  if (ack) ack.addEventListener('click', () =>
    $$('.win.on').forEach(w => w.style.animation = 'none'));
}

/* ── the voice: real triage lines on the LED readout ─────────────── */
{
  const el = $('.voice .vtext');
  if (el && !reduced){
    /* both lines are verbatim system output: the healthy default, and the
       demo's triage sentence for unit 03 (see #story / demo/) */
    const MSGS = [
      'all senses within healthy range',
      'rotation: 4.4× healthy baseline (warning) — schedule an inspection',
    ];
    let m = 0;
    const type = (txt, i, done) => {
      el.textContent = txt.slice(0, i);
      if (i <= txt.length) setTimeout(() => type(txt, i + 1, done), 34);
      else setTimeout(done, m === 0 ? 5200 : 7400);
    };
    (function next(){ type(MSGS[m], 0, () => { m = (m + 1) % MSGS.length; next(); }); })();
  }
}

/* ── the chart recorder ──────────────────────────────────────────── */
{
  const cv = $('#storychart');
  if (cv && typeof ENGINE03 !== 'undefined'){
    const ctx = cv.getContext('2d');
    const D = ENGINE03, N = D.life;
    const SENSES = ['thermal', 'pressure', 'rotation', 'flow'];
    const SENSE_HUES = { thermal:'#b0714f', pressure:'#7d90a0', rotation:'#d99a3c', flow:'#6fa08c' };
    const WARN = D.first_amber_cycle - 1;           // idx 122 → cycle 123
    const LMIN = Math.log10(0.55), LMAX = Math.log10(32);

    const cycEl = $('.rec-cycle .cyc');
    const chips = Object.fromEntries($$('.story-chip').map(c => [c.dataset.chip, c]));
    const stages = $$('.story-stage');
    const runBtn = $('#recrun'), holdBtn = $('#rechold');

    let W = 0, H = 0, dpr = 1, raf = 0, running = false, i = 0, holdT = 0;

    function size(){
      dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* geometry: main lane (overall, log scale) + 4 sense mini-lanes */
    const PAD = { l: 46, r: 14, t: 12, b: 8 };
    const laneGap = 7;
    const geom = () => {
      const mainH = (H - PAD.t - PAD.b) * 0.56;
      const senseH = (H - PAD.t - PAD.b - mainH - laneGap * 4) / 4;
      return { mainH, senseH };
    };
    const X = c => PAD.l + (W - PAD.l - PAD.r) * c / (N - 1);
    const Ymain = (v, mainH) =>
      PAD.t + mainH - mainH * (Math.log10(Math.max(v, 0.56)) - LMIN) / (LMAX - LMIN);

    function paper(mainH, senseH){
      ctx.fillStyle = '#efeddf';
      ctx.fillRect(0, 0, W, H);
      /* grid: fine + heavy, the paper's own */
      for (let x = PAD.l; x <= W - PAD.r + .5; x += (W - PAD.l - PAD.r) / (N - 1) * 5){
        ctx.strokeStyle = 'rgba(120,116,96,.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, H - PAD.b); ctx.stroke();
      }
      for (let c = 0; c <= N; c += 25){
        ctx.strokeStyle = 'rgba(120,116,96,.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(c), PAD.t); ctx.lineTo(X(c), H - PAD.b); ctx.stroke();
        ctx.fillStyle = 'rgba(90,86,70,.75)';
        ctx.font = '9.5px "Plex Mono",monospace';
        ctx.textAlign = 'left';
        ctx.fillText(String(c), X(c) + 3, H - PAD.b - 3);
      }
      [1, 3, 6, 10, 27].forEach(v => {
        const y = Ymain(v, mainH);
        ctx.strokeStyle = 'rgba(120,116,96,.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
        ctx.fillStyle = 'rgba(90,86,70,.8)';
        ctx.font = '9.5px "Plex Mono",monospace';
        ctx.textAlign = 'right';
        ctx.fillText(v + '×', PAD.l - 5, y + 3);
      });
      /* thresholds — amber and red, the machine's own alarm lines */
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#b57e17'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(PAD.l, Ymain(D.amber, mainH)); ctx.lineTo(W - PAD.r, Ymain(D.amber, mainH)); ctx.stroke();
      ctx.strokeStyle = '#b23a2f';
      ctx.beginPath(); ctx.moveTo(PAD.l, Ymain(D.red, mainH)); ctx.lineTo(W - PAD.r, Ymain(D.red, mainH)); ctx.stroke();
      ctx.setLineDash([]);
      /* sense lane separators + labels */
      SENSES.forEach((s, k) => {
        const y0 = PAD.t + mainH + laneGap + k * (senseH + laneGap);
        ctx.strokeStyle = 'rgba(120,116,96,.28)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.l, y0 + senseH); ctx.lineTo(W - PAD.r, y0 + senseH); ctx.stroke();
        ctx.fillStyle = SENSE_HUES[s];
        ctx.font = '500 9px "Plex Mono",monospace';
        ctx.textAlign = 'right';
        ctx.fillText(s.slice(0, 4), PAD.l - 5, y0 + senseH / 2 + 3);
      });
    }

    function traces(upTo, mainH, senseH){
      /* per-sense mini traces (each lane normalised to the sense's own max) */
      SENSES.forEach((s, k) => {
        const arr = D.domains[s];
        const mx = Math.max(...arr) * 1.06;
        const y0 = PAD.t + mainH + laneGap + k * (senseH + laneGap);
        ctx.strokeStyle = SENSE_HUES[s]; ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let c = 0; c <= upTo; c++){
          const y = y0 + senseH - senseH * (arr[c] / mx);
          c ? ctx.lineTo(X(c), y) : ctx.moveTo(X(c), y);
        }
        ctx.stroke();
      });
      /* event stamps appear when the pen reaches them */
      if (upTo >= WARN){
        ctx.strokeStyle = '#b57e17'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(X(WARN), PAD.t); ctx.lineTo(X(WARN), H - PAD.b); ctx.stroke();
        ctx.fillStyle = '#8a5c0a';
        ctx.font = '600 10px "Plex Mono",monospace';
        ctx.textAlign = 'right';
        ctx.fillText('FIRST WARNING · CYCLE 123', X(WARN) - 6, PAD.t + 12);
        ctx.fillText('ROTATION 3.7×', X(WARN) - 6, PAD.t + 25);
      }
      if (upTo >= N - 1){
        ctx.strokeStyle = '#b23a2f'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(X(N-1), PAD.t); ctx.lineTo(X(N-1), H - PAD.b); ctx.stroke();
        ctx.fillStyle = '#9c2f25';
        ctx.font = '600 10px "Plex Mono",monospace';
        ctx.textAlign = 'right';
        ctx.fillText('FAILURE · 179', X(N-1) - 6, PAD.t + 12);
        /* the payoff, on the paper itself */
        ctx.fillStyle = 'rgba(90,86,70,.9)';
        ctx.textAlign = 'center';
        ctx.fillText('← 56 CYCLES OF WARNING →', (X(WARN) + X(N-1)) / 2, H - PAD.b - 18);
      }
      /* the overall pen line, drawn last so it rides on top */
      ctx.strokeStyle = '#2f4a3d'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let c = 0; c <= upTo; c++){
        const y = Ymain(D.overall[c], mainH);
        c ? ctx.lineTo(X(c), y) : ctx.moveTo(X(c), y);
      }
      ctx.stroke();
      /* pen carriage */
      if (upTo < N - 1){
        ctx.strokeStyle = 'rgba(47,74,61,.32)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(upTo), PAD.t); ctx.lineTo(X(upTo), H - PAD.b); ctx.stroke();
        ctx.fillStyle = '#2f4a3d';
        ctx.beginPath(); ctx.arc(X(upTo), Ymain(D.overall[upTo], mainH), 3.4, 0, 7); ctx.fill();
      }
    }

    function hud(c){
      if (cycEl) cycEl.textContent = String(Math.min(c + 1, N)).padStart(3, '0');
      SENSES.forEach(s => {
        const chip = chips[s]; if (!chip) return;
        const v = D.domains[s][Math.min(c, N - 1)];
        chip.querySelector('.cv').textContent = v.toFixed(1) + '×';
        chip.classList.toggle('hot', v >= D.amber);
      });
      const cyc = c + 1;
      stages.forEach(st =>
        st.classList.toggle('live', cyc >= +st.dataset.from && cyc < +st.dataset.to));
    }

    function frame(c){
      const { mainH, senseH } = geom();
      paper(mainH, senseH);
      traces(c, mainH, senseH);
      hud(c);
    }

    /* the feed: ~26 cycles/s → one life ≈ 7 s, then hold ≈ 4.3 s */
    let skip = false;
    const pacedTick = () => {
      if (!running) return;
      skip = !skip;
      if (!skip){
        if (i >= N - 1){
          if (holdT === 0) frame(N - 1);
          holdT++;
          if (holdT > 130){ i = 0; holdT = 0; }
        } else { frame(Math.floor(i)); i += 0.85; }
      }
      raf = requestAnimationFrame(pacedTick);
    };

    const setPressed = run => {
      if (runBtn) runBtn.setAttribute('aria-pressed', String(run));
      if (holdBtn) holdBtn.setAttribute('aria-pressed', String(!run));
    };
    const start = () => { if (!running){ running = true; raf = requestAnimationFrame(pacedTick); setPressed(true); } };
    const stop  = () => { running = false; cancelAnimationFrame(raf); setPressed(false); };

    size();
    addEventListener('resize', () => { size(); frame(reduced ? N - 1 : Math.floor(i)); });

    if (reduced){
      frame(N - 1);
      stages.forEach(st => st.classList.add('live'));
      if (runBtn) runBtn.disabled = true;
      if (holdBtn) holdBtn.disabled = true;
    } else {
      frame(0);
      if (runBtn) runBtn.addEventListener('click', start);
      if (holdBtn) holdBtn.addEventListener('click', stop);
      const io = new IntersectionObserver(es => es.forEach(e => {
        e.isIntersecting ? start() : stop();
      }), { threshold: 0.25 });
      io.observe(cv);
    }
  }
}

/* ── pump-hall band: video fades in over the still ───────────────── */
{
  const media = $('.fit-band-media');
  const vid = media && media.querySelector('video');
  if (vid && !reduced && !(navigator.connection && navigator.connection.saveData)){
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      vid.src = 'assets/vid/band-pumphall.mp4';
      vid.addEventListener('canplay', () => { vid.classList.add('ready'); vid.play().catch(() => {}); }, { once: true });
    }), { rootMargin: '200px' });
    io.observe(media);
  }
}
})();
