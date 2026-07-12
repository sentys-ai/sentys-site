/* SENTYS v2 — "one continuous instrument".
   1. Global Chladni plate: a fixed layer behind the whole page. A scroll
      conductor reads [data-plate] off each section and morphs the plate's
      resonant mode, dimness and drift as you travel.
   2. Story scene: Engine 03's real life, scrubbed by scroll. The plate's
      drift IS the engine's surprise value at the cycle under your finger.
   3. Sense-voice ticker (hero), reveals, scrollspy, fits-band loop.
   All motion gated on prefers-reduced-motion; the page is complete without JS. */

(() => {
  'use strict';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  requestAnimationFrame(() => document.documentElement.classList.add('smooth'));
  setTimeout(() => document.querySelector('.eyebrow-seq')?.classList.add('in'), 120);

  /* ── nav hairline ─────────────────────────────────────────────────── */
  const nav = document.querySelector('nav.top');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive:true }); onScroll();

  /* ── reveal on scroll ─────────────────────────────────────────────── */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin:'0px 0px -8% 0px', threshold:.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── nav scrollspy ────────────────────────────────────────────────── */
  const spyLinks = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (sec) spyLinks.set(sec, a);
  });
  if (spyLinks.size){
    const spy = new IntersectionObserver(es => es.forEach(e => {
      const a = spyLinks.get(e.target);
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-links a.current').forEach(x => x.classList.remove('current'));
        a.classList.add('current');
      }
    }), { rootMargin:'-30% 0px -55% 0px' });
    spyLinks.forEach((a, sec) => spy.observe(sec));
  }

  /* ── the plate: global fixed layer + scroll conductor ─────────────── */
  const cv = document.getElementById('plate');
  const voiceEl = document.querySelector('.voice');
  const voiceText = document.querySelector('.voice .vtext');
  const IDLE_MSG  = 'all senses within healthy range';
  const DRIFT_MSGS = [
    'vibration: 3.2× healthy baseline; temperature and flow within range.',
    'rotation: 1.56× healthy · nearest prior case: unit 88, kept degrading.',
  ];

  // conductor override, set by the story scene: null = free, 0..1 = engine surprise
  let storyDrift = null;

  let plateOK = false;
  if (cv) plateOK = initPlate();
  if (!plateOK && cv) cv.remove();
  if (REDUCED && voiceText) voiceText.textContent = IDLE_MSG;

  function initPlate(){
    const gl = cv.getContext('webgl', { antialias:false, alpha:false, powerPreference:'low-power' });
    if (!gl) return false;

    const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }';
    const FS = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec2 uMouse; uniform float uDrift;
uniform vec4 uMode; uniform float uMix; uniform vec2 uCenter; uniform float uDim;

float chladni(vec2 p, float m, float n){
  return cos(m*3.14159*p.x)*cos(n*3.14159*p.y) - cos(n*3.14159*p.x)*cos(m*3.14159*p.y);
}
float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1,311.7)))*43758.5453); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - uCenter) * vec2(asp, 1.0) * 2.05;

  vec2 warpC = vec2(.55*asp, .38);
  float wd = length(p - warpC);
  vec2 pw = p + uDrift * .24 * exp(-wd*1.5) * vec2(sin(uT*.9+wd*5.), cos(uT*.7+wd*4.));

  float c = mix(chladni(pw, uMode.x, uMode.y), chladni(pw, uMode.z, uMode.w), uMix);

  vec2 m = (uMouse - uCenter) * vec2(asp,1.) * 2.05;
  float md = length(p - m);
  c += .32 * exp(-md*3.2) * sin(uT*6. - md*13.);

  float dust = 1.0 - smoothstep(0.0, 0.15, abs(c));
  float grain = hash(gl_FragCoord.xy + floor(uT*4.)) * .5 + hash(gl_FragCoord.xy*1.7) * .5;
  dust *= .56 + .44*grain;

  vec3 plate = mix(vec3(.052,.06,.072), vec3(.078,.088,.104), uv.y + .05*sin(uv.x*6.));
  float field = smoothstep(.9, .0, abs(c)) * .045;

  float heat = uDrift * exp(-wd*1.25);
  vec3 dustCol = vec3(.93,.90,.84);
  dustCol = mix(dustCol, vec3(.99,.63,.28), clamp(heat*1.7,0.,1.));
  dustCol = mix(dustCol, vec3(1.,.44,.26), clamp(heat*heat*1.9,0.,1.));

  vec3 col = plate + field + dust * dustCol * (.68 + .38*heat);
  float vig = smoothstep(1.7, .5, length((uv-vec2(.55,.5))*vec2(asp,1.)*1.5));
  col *= .5 + .5*vig;
  col *= uDim;
  gl_FragColor = vec4(col, 1.);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes','uT','uMouse','uDrift','uMode','uMix','uCenter','uDim'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

    let W = 0, H = 0, raf = 0, plateShown = false;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    addEventListener('resize', () => { resize();
      if (!REDUCED && !raf && !document.hidden) raf = requestAnimationFrame(frame); });
    resize();

    // sections that conduct the plate
    const stops = [...document.querySelectorAll('[data-plate]')].map(el => {
      const d = el.dataset;
      return {
        el,
        mode:   (d.plateMode   || '5,3').split(',').map(Number),
        center: (d.plateCenter || '.62,.48').split(',').map(Number),
        dim:    +(d.plateDim   ?? 1),
        hero:   d.plate === 'hero',
      };
    });

    // current + target plate state
    const st = { modeA:[5,3], modeB:[5,3], mix:1, drift:0, center:[.62,.48], dim:1 };
    let tgtStop = stops[0] || { mode:[5,3], center:[.62,.48], dim:1, hero:true };

    // static single frame for reduced motion
    if (REDUCED){
      const portrait = W < H * .9;
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, 4.2);
      gl.uniform2f(U.uMouse, -10, -10);
      gl.uniform1f(U.uDrift, 0);
      gl.uniform4f(U.uMode, 5, 3, 5, 3);
      gl.uniform1f(U.uMix, 0);
      gl.uniform2f(U.uCenter, portrait ? .5 : .62, portrait ? .58 : .48);
      gl.uniform1f(U.uDim, .8);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cv.classList.add('on');
      addEventListener('resize', () => { resize();
        gl.uniform2f(U.uRes, cv.width, cv.height); gl.drawArrays(gl.TRIANGLES, 0, 3); });
      return true;
    }

    let mouse = [.5,.5], tgt = [.5,.5];
    addEventListener('pointermove', e => {
      tgt = [e.clientX / innerWidth, 1 - e.clientY / Math.max(innerHeight,1)];
    }, { passive:true });

    const DRIFT_PERIOD = 16;
    // phase-shifted so the FIRST drift lands ~3.5s after arrival —
    // visitors should witness the plate feel something before they scroll
    const DRIFT_PHASE = 6;
    const heroDriftEnv = tp => {
      if (tp < 9.5) return 0;
      if (tp < 11.5) return (tp - 9.5) / 2;
      if (tp < 14)   return 1;
      if (tp < 15.2) return 1 - (tp - 14) / 1.2;
      return 0;
    };
    // idle breathing: while resting in the hero the plate slowly walks its
    // resonant modes (the concept's "song") instead of holding one chord
    const HERO_MODES = [[5,3],[6,2],[4,3],[7,2],[5,4]];

    let typed = 0, lastMsgIdx = -1, voiceMode = 'idle';
    if (voiceText) voiceText.textContent = IDLE_MSG;

    const wake = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
    document.addEventListener('visibilitychange', wake);
    addEventListener('scroll', wake, { passive:true });

    function pickStop(){
      const mid = innerHeight * .5;
      for (const s of stops){
        const r = s.el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) return s;
      }
      return tgtStop;
    }

    const lerp = (a, b, k) => a + (b - a) * k;

    function frame(now){
      raf = 0;
      if (document.hidden) return;
      const t = now / 1000;

      tgtStop = pickStop();

      // mode morph: when the target differs from modeB, start a new blend
      const inHero = tgtStop.hero && storyDrift === null;
      const tm = inHero
        ? HERO_MODES[Math.floor((t + DRIFT_PHASE) / 9) % HERO_MODES.length]
        : tgtStop.mode;
      // a new morph may only START from a settled pattern — an interrupted
      // blend can't be re-based (the shader holds two modes), and re-basing
      // mid-flight is a visible snap. Pending targets wait a beat instead.
      if (st.mix >= 1 && (tm[0] !== st.modeB[0] || tm[1] !== st.modeB[1])){
        st.modeA = st.modeB; st.modeB = tm; st.mix = 0;
      }
      // hero morphs are languid (the breathing); section changes stay brisk
      st.mix = Math.min(1, st.mix + (inHero ? .0045 : .012));

      // drift: story override, hero cycle, or calm
      let dTgt = 0;
      if (storyDrift !== null) dTgt = storyDrift;
      else if (tgtStop.hero) dTgt = heroDriftEnv((t + DRIFT_PHASE) % DRIFT_PERIOD);
      st.drift = lerp(st.drift, dTgt, .07);

      st.center[0] = lerp(st.center[0], tgtStop.center[0], .04);
      st.center[1] = lerp(st.center[1], tgtStop.center[1], .04);
      st.dim = lerp(st.dim, tgtStop.dim, .05);

      // sense-voice ticker, hero only
      if (voiceText && tgtStop.hero && storyDrift === null){
        const tp = (t + DRIFT_PHASE) % DRIFT_PERIOD, cyc = Math.floor((t + DRIFT_PHASE) / DRIFT_PERIOD);
        const env = heroDriftEnv(tp);
        if (env > 0.02 && voiceMode !== 'drift'){
          voiceMode = 'drift'; typed = 0;
          lastMsgIdx = cyc % DRIFT_MSGS.length;
          voiceEl.classList.add('alert');
        }
        if (env === 0 && tp < 9.5 && voiceMode !== 'idle' && tp > 1){
          voiceMode = 'idle'; typed = 0;
          voiceEl.classList.remove('alert');
        }
        const msg = voiceMode === 'drift' ? DRIFT_MSGS[lastMsgIdx] : IDLE_MSG;
        voiceText.textContent = msg.slice(0, Math.min(msg.length, Math.floor(typed)));
        typed += msg.length / 40;
      }

      mouse[0] += (tgt[0]-mouse[0]) * .05;
      mouse[1] += (tgt[1]-mouse[1]) * .05;

      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, t);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uDrift, st.drift);
      gl.uniform4f(U.uMode, st.modeA[0], st.modeA[1], st.modeB[0], st.modeB[1]);
      gl.uniform1f(U.uMix, st.mix);
      gl.uniform2f(U.uCenter, st.center[0], st.center[1]);
      gl.uniform1f(U.uDim, st.dim);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!plateShown){ plateShown = true; cv.classList.add('on'); }

      // the instrument sleeps: freeze in reading sections once settled.
      // it wakes on scroll, and stays awake only where something is felt
      // (the hero's drift cycle, the story's live surprise).
      const settled =
        Math.abs(st.dim - tgtStop.dim) < .004 && st.mix > .995 && st.drift < .005 &&
        Math.abs(st.center[0] - tgtStop.center[0]) < .002 &&
        Math.abs(st.center[1] - tgtStop.center[1]) < .002;
      const active = tgtStop.hero || storyDrift !== null;
      if (active || !settled) raf = requestAnimationFrame(frame);
      else raf = 0;
    }
    raf = requestAnimationFrame(frame);
    return true;
  }

  /* ── the story: one engine's life, scrubbed by scroll ─────────────── */
  const story = document.getElementById('story');
  const sc = document.getElementById('storychart');
  if (story && sc && typeof ENGINE03 !== 'undefined') initStory();

  function initStory(){
    const D = ENGINE03;
    const n = D.overall.length;
    const VMIN = 0.5, VMAX = Math.max(...D.overall) * 1.25;
    const L = v => Math.log2(Math.max(v, VMIN));
    const ctx = sc.getContext('2d');

    const SENSES = ['thermal','pressure','rotation','flow'];
    const chips = {}, chipEls = {};
    SENSES.forEach(s => {
      chipEls[s] = story.querySelector(`[data-chip="${s}"]`);
      chips[s] = chipEls[s].querySelector('.cv');
    });
    const cycleEl = story.querySelector('.story-cycle .cyc');
    const stages = [...story.querySelectorAll('.story-stage')];
    const railFill = story.querySelector('.story-rail .fill');
    const hintEl = story.querySelector('.story-hint');
    if (hintEl && matchMedia('(pointer:coarse)').matches)
      hintEl.textContent = 'swipe to run \u25be';

    let W, H, dpr, lastCycle = -1;
    function resize(){
      dpr = Math.min(devicePixelRatio||1, 2);
      W = sc.clientWidth; H = sc.clientHeight;
      sc.width = W*dpr; sc.height = H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw(Math.max(lastCycle, 0));
    }
    addEventListener('resize', resize);

    const PX = 54, PR = 16, PT = 22, PB = 30;
    const X = i => PX + (W-PX-PR) * (i/(n-1));
    const Y = v => PT + (H-PT-PB) * (1 - (L(v)-L(VMIN)) / (L(VMAX)-L(VMIN)));
    const COL = { dim:'rgba(152,161,170,.9)', hair:'rgba(56,66,80,.8)',
      ember:'#f0a43c', heat:'#ff6a45', dust:'rgba(236,229,214,.95)',
      sense:'rgba(152,161,170,.30)' };

    function draw(upto){
      ctx.clearRect(0,0,W,H);
      ctx.font = '500 10.5px PlexMono, monospace';
      for (let v=1; v<=VMAX; v*=2){
        ctx.strokeStyle = COL.hair; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PX, Y(v)); ctx.lineTo(W-PR, Y(v)); ctx.stroke();
        ctx.fillStyle = COL.dim; ctx.textAlign = 'right';
        ctx.fillText(v + '×', PX-8, Y(v)+3.5);
      }
      ctx.textAlign = 'center';
      [0,50,100,150].forEach(c0 => { if (c0 < n) ctx.fillText('cycle ' + c0, X(c0), H-10); });

      ctx.strokeStyle = COL.ember; ctx.setLineDash([5,5]); ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(PX, Y(D.amber)); ctx.lineTo(W-PR, Y(D.amber)); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = COL.ember; ctx.textAlign = 'left';
      ctx.fillText(W < 560 ? 'amber ' + D.amber.toFixed(1) + '×'
        : 'amber ' + D.amber.toFixed(1) + '× · threshold set from healthy data alone', PX+6, Y(D.amber)-7);

      for (const k of SENSES){
        const s = D.domains[k];
        ctx.strokeStyle = COL.sense; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i=0; i<=Math.min(upto, s.length-1); i++){
          const y = Y(Math.min(s[i], VMAX));
          i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y);
        }
        ctx.stroke();
      }

      const grad = ctx.createLinearGradient(0, Y(VMIN), 0, Y(VMAX));
      grad.addColorStop(0, COL.dust); grad.addColorStop(.45, COL.ember); grad.addColorStop(1, COL.heat);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i=0; i<=upto; i++)
        i ? ctx.lineTo(X(i), Y(D.overall[i])) : ctx.moveTo(X(i), Y(D.overall[i]));
      ctx.stroke();

      // playhead
      const hx = X(upto), hy = Y(D.overall[upto]);
      ctx.fillStyle = D.overall[upto] >= D.amber ? COL.ember : COL.dust;
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, 7); ctx.fill();

      const fa = D.first_amber_cycle;
      if (upto >= fa){
        const ax = X(fa), ay = Y(D.overall[fa]);
        ctx.strokeStyle = COL.ember; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay-6); ctx.lineTo(ax, ay-30); ctx.stroke();
        ctx.fillStyle = COL.ember; ctx.font = '500 11.5px PlexMono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('first warning · cycle ' + fa, ax-8, ay-34);
        ctx.textAlign = 'left';
        ctx.beginPath(); ctx.arc(ax, ay, 3.2, 0, 7); ctx.fill();
      }
      if (upto >= n-1){
        const ex = X(n-1), ey = Y(D.overall[n-1]);
        ctx.fillStyle = COL.heat; ctx.font = '500 11.5px PlexMono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('failure · cycle ' + D.life, ex-10, ey-8);
        ctx.textAlign = 'left';
        ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, 7); ctx.fill();
      }
    }

    function setChips(c){
      for (const k of SENSES){
        const v = D.domains[k][Math.min(c, D.domains[k].length-1)];
        chips[k].textContent = v.toFixed(1) + '×';
        chipEls[k].classList.toggle('warn', v >= D.amber && v < 6);
        chipEls[k].classList.toggle('hot',  v >= 6);
      }
      cycleEl.textContent = c;
    }

    function setStages(c){
      stages.forEach(sg => {
        sg.classList.toggle('on', c >= +sg.dataset.from && c < +sg.dataset.to);
      });
    }

    if (REDUCED){
      story.classList.add('story-static');
      resize(); draw(n-1); setChips(n-1);
      stages.forEach(sg => sg.classList.add('on'));
      return;
    }

    // the playhead has mass: dc eases toward the scroll target
    let targetC = 0, dc = 0, sRaf = 0, inView = false;
    function tick(){
      sRaf = 0;
      const diff = targetC - dc;
      if (Math.abs(diff) > .35){
        dc += diff * .13;
        const c = Math.round(dc);
        if (c !== lastCycle){
          lastCycle = c;
          draw(c); setChips(c); setStages(c);
          if (railFill) railFill.style.width = (c / (n-1) * 100) + '%';
        }
        const s = D.overall[Math.round(dc)];
        if (inView) storyDrift = Math.min(1, Math.max(0, L(s) / L(32))) * .95;
      }
      if (inView && Math.abs(targetC - dc) > .35) sRaf = requestAnimationFrame(tick);
    }
    function update(){
      const r = story.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      inView = r.top < innerHeight && r.bottom > 0;
      targetC = p * (n-1);
      if (!inView) storyDrift = null;
      // approach: 0 far below, 1 locked — the chart visibly rises into its dock
      const ap = Math.min(1, Math.max(0, 1 - r.top / (innerHeight * .85)));
      story.style.setProperty('--ap', ap.toFixed(3));
      // dock state: the sticky is engaged and driving the wheel
      const docked = inView && r.top <= 1 && r.bottom >= innerHeight - 1;
      story.classList.toggle('docked', docked);
      document.body.classList.toggle('story-focus', docked);
      // the hint appears on APPROACH, before the wheel changes jobs
      if (hintEl) hintEl.classList.toggle('on', (docked || (ap > .55 && !docked)) && dc < 12);
      story.classList.toggle('done', dc >= n - 4);
      if (inView && !sRaf) sRaf = requestAnimationFrame(tick);
    }
    addEventListener('scroll', update, { passive:true });
    resize(); update();
  }

  /* ── Fig. 01, the organ: afferent overlay on the engraved plate ───── */
  const organCv = document.getElementById('afferent');
  if (organCv) initOrgan();

  function initOrgan(){
    const octx = organCv.getContext('2d');
    const ostate = document.getElementById('ostate');
    const osense = document.getElementById('osense');
    // ganglion sits HIGH (afferent pathways climb, as in the original
    // Afferent concept): most fibers rise toward it and pulses travel upward
    const GANG = { x:.315, y:.16 };
    const SENSORS = [
      { x:.450, y:.385, sense:'a. rotation', key:'rotation', lx:-14, ly: 20, align:'right', ph:0   },
      { x:.712, y:.205, sense:'b. thermal',  key:'thermal',  lx:-12, ly:-14, align:'right', ph:2.1 },
      { x:.752, y:.085, sense:'c. pressure', key:'pressure', lx:-12, ly: -6, align:'right', ph:4.2 },
      { x:.700, y:.890, sense:'d. flow',     key:'flow',     lx:-16, ly: 26, align:'right', ph:5.6 },
    ];
    let W, H, fibers = [];

    function resize(){
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = organCv.clientWidth; H = organCv.clientHeight;
      organCv.width = W*dpr; organCv.height = H*dpr;
      octx.setTransform(dpr,0,0,dpr,0,0);
      const gx = GANG.x*W, gy = GANG.y*H;
      fibers = SENSORS.map(sn => {
        const sx = sn.x*W, sy = sn.y*H;
        const dx = gx-sx, dy = gy-sy, L = Math.hypot(dx,dy);
        const nx = -dy/L, ny = dx/L, bow = L*.16*(sy > gy ? -1 : 1);
        return { sn, sx, sy, cx:(sx+gx)/2+nx*bow, cy:(sy+gy)/2+ny*bow, gx, gy };
      });
    }
    addEventListener('resize', () => { resize(); if (REDUCED) still(); });
    resize();

    const bez = (f,t) => {
      const u = 1-t;
      return [ u*u*f.sx + 2*u*t*f.cx + t*t*f.gx, u*u*f.sy + 2*u*t*f.cy + t*t*f.gy ];
    };

    function drawGanglion(t, excite){
      const gx = GANG.x*W, gy = GANG.y*H, s = Math.min(W,H);
      const breathe = 1 + Math.sin(t*.0014)*.05 + excite*.3;
      octx.save();
      octx.translate(gx,gy);
      const col = excite > .05 ? `rgba(240,164,60,${.28+excite*.45})` : 'rgba(236,229,214,.28)';
      for (let i=0;i<16;i++){
        const a = i/16*Math.PI*2 + t*.00004;
        const r0 = s*.030*breathe, r1 = s*(.055+.012*Math.sin(t*.0009+i))*breathe;
        octx.strokeStyle = col;
        octx.lineWidth = 1;
        octx.beginPath();
        octx.moveTo(Math.cos(a)*r0, Math.sin(a)*r0);
        octx.lineTo(Math.cos(a)*r1, Math.sin(a)*r1);
        octx.stroke();
      }
      const core = excite > .05 ? 'rgba(240,164,60,' : 'rgba(236,229,214,';
      const g = octx.createRadialGradient(0,0,0, 0,0,s*.05*breathe);
      g.addColorStop(0, core + (.75+excite*.2) + ')');
      g.addColorStop(1, core + '0)');
      octx.fillStyle = g;
      octx.beginPath(); octx.arc(0,0,s*.05*breathe,0,7); octx.fill();
      octx.font = '500 11px PlexMono, monospace';
      octx.fillStyle = 'rgba(152,161,170,.9)';
      octx.textAlign = 'center';
      octx.fillText('g.', 0, s*.05*breathe + 22);
      octx.restore();
    }

    function drawFibers(t, driftFi, driftEnv){
      fibers.forEach((f, i) => {
        const isDrift = i === driftFi && driftEnv > 0;
        const col = isDrift ? 'rgba(240,164,60,' : 'rgba(236,229,214,';
        for (const [w, a] of [[2.6,.04],[1.2,.10],[.6,.38]]){
          octx.strokeStyle = col + (a + (isDrift ? driftEnv*.25 : 0)) + ')';
          octx.lineWidth = w;
          octx.beginPath();
          octx.moveTo(f.sx,f.sy);
          octx.quadraticCurveTo(f.cx,f.cy,f.gx,f.gy);
          octx.stroke();
        }
        octx.fillStyle = col + '.9)';
        octx.beginPath(); octx.arc(f.sx,f.sy,2.6,0,7); octx.fill();
        if (!REDUCED){
          const rate = isDrift ? 1500 : 3400;
          for (let p=0;p<(isDrift?4:2);p++){
            const tt = ((t + f.sn.ph*1000 + p*rate/(isDrift?4:2)) % rate) / rate;
            const [x,y] = bez(f,tt);
            const r = isDrift ? 2.8 : 2.0;
            const g = octx.createRadialGradient(x,y,0,x,y,r*4);
            g.addColorStop(0, col + '.9)');
            g.addColorStop(1, col + '0)');
            octx.fillStyle = g;
            octx.beginPath(); octx.arc(x,y,r*4,0,7); octx.fill();
          }
        }
        octx.font = '500 11px PlexMono, monospace';
        octx.fillStyle = isDrift ? 'rgba(240,164,60,.95)' : 'rgba(152,161,170,.9)';
        octx.textAlign = f.sn.align;
        const tag = W < 560 ? f.sn.sense.slice(0,2) : f.sn.sense;
        octx.fillText(tag + (isDrift && W >= 560 ? ' · surprised' : ''), f.sx + f.sn.lx, f.sy + f.sn.ly);
      });
    }

    const still = () => { octx.clearRect(0,0,W,H); drawFibers(0, -1, 0); drawGanglion(0, 0); };
    if (REDUCED){
      document.fonts ? document.fonts.ready.then(still) : still();
      return;
    }

    // surprises recur while the figure is watched: the first ~1.6s after it
    // docks into view, then one sense at a time every ~14s of VISIBLE time
    // (the clock stops when the organ scrolls away — it never fires unseen)
    let vt = 0, lastNow = 0, needSync = false;
    const SUR_LEN = 3500, SUR_PERIOD = 14000, SUR_FIRST = 1600, SUR_LATER = 8500;
    function surpriseState(){
      const k = Math.floor(vt / SUR_PERIOD);
      const local = vt - k*SUR_PERIOD;
      const start = k === 0 ? SUR_FIRST : SUR_LATER;
      const fi = k % SENSORS.length;
      const env = (local > start && local < start + SUR_LEN)
        ? Math.sin((local - start)/SUR_LEN*Math.PI) : 0;
      return { fi, env };
    }

    let running = false, rafo = 0;
    function frame(now){
      if (needSync){ lastNow = now; needSync = false; }
      vt += Math.min(now - lastNow, 100); lastNow = now;
      octx.clearRect(0,0,W,H);
      const s = surpriseState();
      drawFibers(now, s.fi, s.env);
      drawGanglion(now, s.env);
      const active = s.env > .1;
      ostate.classList.toggle('surprised', active);
      osense.textContent = active
        ? SENSORS[s.fi].key + ' · surprised'
        : 'all senses within healthy range';
      rafo = running ? requestAnimationFrame(frame) : 0;
    }
    new IntersectionObserver(es => {
      const vis = es[0].isIntersecting;
      if (vis && !running){
        running = true; needSync = true;
        rafo = requestAnimationFrame(frame);
      }
      if (!vis && running){ running = false; cancelAnimationFrame(rafo); }
    }, { threshold:.25 }).observe(organCv);
  }

  /* ── fits band: ambient loop, desktop + motion-allowed only ───────── */
  const bandVid = document.querySelector('.fit-band video');
  if (bandVid && !REDUCED && matchMedia('(min-width:721px)').matches){
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      const s = document.createElement('source');
      s.src = 'assets/vid/band-pumphall.mp4'; s.type = 'video/mp4';
      bandVid.appendChild(s); bandVid.load();
      bandVid.addEventListener('canplay', () => {
        bandVid.play().then(() => bandVid.classList.add('on')).catch(() => {});
      }, { once:true });
    }, { rootMargin:'200px' }).observe(bandVid);
  }
})();
