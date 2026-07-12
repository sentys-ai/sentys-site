/* SENTYS — site behaviours.
   1. Chladni plate shader (hero) + drift cycle that drives the sense-voice line
   2. Engine-03 evidence chart (real model output, replayed on scroll)
   3. Reveal-on-scroll, nav hairline, count-ups
   All motion is gated on prefers-reduced-motion; the page is complete without JS. */

(() => {
  'use strict';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  // enable smooth in-page scrolling only after the initial hash jump has happened
  requestAnimationFrame(() => document.documentElement.classList.add('smooth'));

  /* ── nav hairline ─────────────────────────────────────────────────── */
  const nav = document.querySelector('nav.top');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive:true }); onScroll();

  /* ── reveal on scroll ─────────────────────────────────────────────── */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin:'0px 0px -8% 0px', threshold:.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── nav scrollspy: ember tick under the section you're in ────────── */
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

  /* ── hero: Chladni plate ──────────────────────────────────────────── */
  const cv = document.getElementById('plate');
  const voiceEl = document.querySelector('.voice');
  const voiceText = document.querySelector('.voice .vtext');

  // The two drift messages are verbatim product artifacts (see /guide):
  // triage sentence + work-order dominant sense from the benchmark run.
  const IDLE_MSG  = 'all senses within healthy range';
  const DRIFT_MSGS = [
    'vibration: 3.2× healthy baseline; temperature and flow within range.',
    'rotation: 1.56× healthy — nearest prior case: unit 88, kept degrading.',
  ];

  let plateOK = false;
  if (cv) plateOK = initPlate();                        // reduced motion → one static frame
  if (!plateOK && cv) cv.remove();                      // CSS fallback gradient shows
  if (REDUCED && voiceText) voiceText.textContent = IDLE_MSG;

  function initPlate(){
    const gl = cv.getContext('webgl', { antialias:false, alpha:false, powerPreference:'low-power' });
    if (!gl) return false;

    const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }';
    const FS = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec2 uMouse; uniform float uDrift;
uniform vec4 uMode; uniform float uMix; uniform vec2 uCenter;

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
  float grain = hash(gl_FragCoord.xy + floor(uT*7.)) * .5 + hash(gl_FragCoord.xy*1.7) * .5;
  dust *= .5 + .5*grain;

  vec3 plate = mix(vec3(.052,.06,.072), vec3(.078,.088,.104), uv.y + .05*sin(uv.x*6.));
  float field = smoothstep(.9, .0, abs(c)) * .045;

  float heat = uDrift * exp(-wd*1.25);
  vec3 dustCol = vec3(.93,.90,.84);
  dustCol = mix(dustCol, vec3(.99,.63,.28), clamp(heat*1.7,0.,1.));
  dustCol = mix(dustCol, vec3(1.,.44,.26), clamp(heat*heat*1.9,0.,1.));

  vec3 col = plate + field + dust * dustCol * (.62 + .42*heat);
  float vig = smoothstep(1.7, .5, length((uv-vec2(.55,.5))*vec2(asp,1.)*1.5));
  col *= .5 + .5*vig;
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
    const U = {}; ['uRes','uT','uMouse','uDrift','uMode','uMix','uCenter'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    addEventListener('resize', resize); resize();

    // reduced motion: one still frame of the resting plate, then done
    if (REDUCED){
      const portrait = W < H * .9;
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, 4.2);
      gl.uniform2f(U.uMouse, -10, -10);
      gl.uniform1f(U.uDrift, 0);
      gl.uniform4f(U.uMode, 5, 3, 5, 3);
      gl.uniform1f(U.uMix, 0);
      gl.uniform2f(U.uCenter, portrait ? .5 : .62, portrait ? .58 : .48);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      addEventListener('resize', () => { resize();
        gl.uniform2f(U.uRes, cv.width, cv.height); gl.drawArrays(gl.TRIANGLES, 0, 3); });
      return true;
    }

    let mouse = [.5,.5], tgt = [.5,.5];
    addEventListener('pointermove', e => {
      tgt = [e.clientX / innerWidth, 1 - e.clientY / Math.max(innerHeight,1)];
    }, { passive:true });

    // plate "songs" — (m,n) mode pairs, morphing every 8s
    const MODES = [[5,3],[6,2],[4,3],[7,2],[5,4],[3,2]];
    // drift cycle: 16s period — stable 0..9.5, rise 9.5..11.5, hold ..14, resolve ..15.2
    const DRIFT_PERIOD = 16;
    const driftEnv = tp => {
      if (tp < 9.5) return 0;
      if (tp < 11.5) return (tp - 9.5) / 2;
      if (tp < 14)   return 1;
      if (tp < 15.2) return 1 - (tp - 14) / 1.2;
      return 0;
    };

    // typing state for the sense-voice line
    let typed = 0, lastMsgIdx = -1, voiceMode = 'idle';
    if (voiceText) { voiceText.textContent = IDLE_MSG; }

    let visible = true, raf = 0;
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }).observe(cv);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame);
    });

    function frame(now){
      raf = 0;
      if (!visible || document.hidden) return;
      const t = now / 1000;

      const seg = 8, k = Math.floor(t/seg), fr = (t - k*seg)/seg;
      const a = MODES[k % MODES.length], b = MODES[(k+1) % MODES.length];
      const mixv = fr < .72 ? 0 : (fr - .72) / .28;

      const tp = t % DRIFT_PERIOD;
      const cyc = Math.floor(t / DRIFT_PERIOD);
      const drift = driftEnv(tp);

      // sense-voice: type the drift message while the plate deforms
      if (voiceText){
        if (drift > 0.02 && voiceMode !== 'drift'){
          voiceMode = 'drift'; typed = 0;
          lastMsgIdx = cyc % DRIFT_MSGS.length;
          voiceEl.classList.add('alert');
        }
        if (drift === 0 && tp < 9.5 && voiceMode !== 'idle' && tp > 1){
          voiceMode = 'idle'; typed = 0;
          voiceEl.classList.remove('alert');
        }
        const msg = voiceMode === 'drift' ? DRIFT_MSGS[lastMsgIdx] : IDLE_MSG;
        const want = Math.min(msg.length, Math.floor(typed));
        voiceText.textContent = msg.slice(0, want);
        typed += msg.length / 40;   // ~40 frames to fully type
      }

      mouse[0] += (tgt[0]-mouse[0]) * .05;
      mouse[1] += (tgt[1]-mouse[1]) * .05;

      const portrait = W < H * .9;
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, t);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uDrift, drift);
      gl.uniform4f(U.uMode, a[0], a[1], b[0], b[1]);
      gl.uniform1f(U.uMix, mixv);
      gl.uniform2f(U.uCenter, portrait ? .5 : .62, portrait ? .58 : .48);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return true;
  }

  /* ── evidence: Engine-03 replay (real data from engine03-data.js) ─── */
  const ec = document.getElementById('engine03');
  if (ec && typeof ENGINE03 !== 'undefined') initEngineChart();

  function initEngineChart(){
    const ctx = ec.getContext('2d');
    const D = ENGINE03;
    const n = D.overall.length;
    // log2 scale: surprise is a ratio, and the end-of-life spike is ~30× —
    // linear would crush the healthy band the story lives in.
    const VMIN = 0.5, VMAX = Math.max(...D.overall) * 1.25;
    const L = v => Math.log2(Math.max(v, VMIN));
    let progress = REDUCED ? 1 : 0, started = REDUCED;

    const css = getComputedStyle(document.documentElement);
    const COL = {
      dim: 'rgba(152,161,170,.9)', hair: 'rgba(36,43,53,1)',
      ember: (css.getPropertyValue('--ember') || '#f0a43c').trim(),
      heat: (css.getPropertyValue('--heat') || '#ff6a45').trim(),
      dust: 'rgba(236,229,214,.95)',
    };
    const SENSES = { thermal:'rgba(152,161,170,.34)', pressure:'rgba(152,161,170,.34)',
                     rotation:'rgba(152,161,170,.34)', flow:'rgba(152,161,170,.34)' };

    let W, H, dpr;
    function resize(){
      dpr = Math.min(devicePixelRatio||1, 2);
      W = ec.clientWidth; H = ec.clientHeight;
      ec.width = W*dpr; ec.height = H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw();
    }
    addEventListener('resize', resize);

    const PX = 56, PR = 18, PT = 26, PB = 34;
    const X = i => PX + (W-PX-PR) * (i/(n-1));
    const Y = v => PT + (H-PT-PB) * (1 - (L(v)-L(VMIN)) / (L(VMAX)-L(VMIN)));

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.font = '500 10.5px PlexMono, monospace';

      // y grid + labels at powers of two: 1×, 2×, 4×, …
      for (let v=1; v<=VMAX; v*=2){
        ctx.strokeStyle = COL.hair; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PX, Y(v)); ctx.lineTo(W-PR, Y(v)); ctx.stroke();
        ctx.fillStyle = COL.dim; ctx.textAlign = 'right';
        ctx.fillText(v + '×', PX-8, Y(v)+3.5);
      }
      // x labels
      ctx.textAlign = 'center';
      [0, 50, 100, 150].forEach(cx0 => { if (cx0 < n) ctx.fillText('cycle ' + cx0, X(cx0), H-12); });

      // amber threshold (real: thresholds.amber from the run)
      ctx.strokeStyle = COL.ember; ctx.setLineDash([5,5]); ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(PX, Y(D.amber)); ctx.lineTo(W-PR, Y(D.amber)); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = COL.ember; ctx.textAlign = 'left';
      const thrLabel = W < 560 ? 'amber ' + D.amber.toFixed(1) + '× threshold'
        : 'amber ' + D.amber.toFixed(1) + '× — threshold set from healthy data alone';
      ctx.fillText(thrLabel, PX+6, Y(D.amber)-7);

      const upto = Math.max(2, Math.floor(n * progress));

      // per-sense traces, thin
      for (const [k, col] of Object.entries(SENSES)){
        const s = D.domains[k]; if (!s) continue;
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i=0; i<Math.min(upto, s.length); i++){
          const y = Y(Math.min(s[i], VMAX));
          i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y);
        }
        ctx.stroke();
      }

      // overall surprise, ember → heat as it climbs
      const grad = ctx.createLinearGradient(0, Y(VMIN), 0, Y(VMAX));
      grad.addColorStop(0, COL.dust); grad.addColorStop(.45, COL.ember); grad.addColorStop(1, COL.heat);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i=0; i<upto; i++){
        i ? ctx.lineTo(X(i), Y(D.overall[i])) : ctx.moveTo(X(i), Y(D.overall[i]));
      }
      ctx.stroke();

      // annotations appear as the pen passes them
      ctx.textAlign = 'left';
      const fa = D.first_amber_cycle;
      if (upto >= fa){
        const ax = X(fa), ay = Y(D.overall[fa]);
        ctx.strokeStyle = COL.ember; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay-6); ctx.lineTo(ax, ay-30); ctx.stroke();
        ctx.fillStyle = COL.ember;
        ctx.font = '500 11.5px PlexMono, monospace';
        ctx.textAlign = 'right';                     // label sits left of the rising trace
        ctx.fillText('first warning — cycle ' + fa, ax-8, ay-34);
        ctx.textAlign = 'left';
        ctx.beginPath(); ctx.arc(ax, ay, 3.2, 0, 7); ctx.fill();
      }
      if (upto >= n-1){
        const ex = X(n-1), ey = Y(D.overall[n-1]);
        ctx.fillStyle = COL.heat;
        ctx.font = '500 11.5px PlexMono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('failure — cycle ' + D.life, ex-10, ey-8);
        ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, 7); ctx.fill();
      }
    }

    function animate(){
      if (progress >= 1){ progress = 1; draw(); return; }
      progress = Math.min(1, progress + 1/170);          // ~2.8s at 60fps
      draw();
      requestAnimationFrame(animate);
    }
    new IntersectionObserver((es, o) => {
      if (es[0].isIntersecting && !started){ started = true; animate(); o.disconnect(); }
    }, { threshold:.35 }).observe(ec);
    resize();
  }
})();
