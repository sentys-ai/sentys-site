# WAKEUP.md — sentys.ai redesign overnight run

**Started:** 2026-07-12 01:45 CEST · **Branch:** `redesign` · **Protocol:** ~/sensory/docs/OVERNIGHT_PROTOCOL.md
**Prompt:** RUN_PROMPT.md (untracked, kept out of git via .git/info/exclude along with sensory/)

## Current milestone
M7 — Iteration pass 2 (pass 1 done)

## Done
- [x] M0 Setup: read ONE_PAGER/VISION/MANIFESTO/EVIDENCE/WORLD_MODEL + current site copy;
      branch `redesign`; 5 staggered resume pings armed (03:00/04:15/05:45/07:15/08:45);
      tasks #1–#9 created (TaskList); Chrome + GEMINI_API_KEY + python3/node verified.
- [x] M1 Bake-off: 3 prototypes in /concepts/{a,b,c} (fonts in /concepts/fonts), screenshotted
      1440+390. **VERDICT: C "Resonance" wins** — Chladni-plate WebGL shader (vibration made
      visible; healthy = stable standing wave, drift = pattern deforms + heats). Physically true,
      highest craft ceiling, most distinctive. A "Afferent" (anatomy-plate nerves) lost: sparse
      diagram feel, moody-dark-AI risk. B "Recorder" (strip chart) lost: print-nostalgia fights
      the WebGL brief — but its instrument furniture is absorbed into the winner (mono readouts,
      alarm annotations, strip-chart evidence device), as is A's plain-language sense-voice.
      User mid-run note: fetched ui-ux-pro-max-skill.nextlevelbuilder.io — page empty, nothing taken.

- [x] M4 /guide colophon (unlinked) + bake-off verdicts. M5 brand kit: brand/logo.png (1024²,
      48px-legible), brand/linkedin-cover.png (1128×191), new og.png — all hand-built shader/SVG.
- [x] M6 Iteration pass 1: reduced-motion now renders a static plate frame (identity kept);
      Engine-03 chart label moved clear of trace; 4 hand-drawn line icons on fit cards; ONE
      Gemini still (pump hall) shipped as fits-band with honest "(Illustration.)" caption; old
      design's webp images removed; favicon added. No overflow, no console errors.
- [x] M2 Full site built: index.html + assets/css/site.css + assets/js/site.js +
      assets/js/engine03-data.js (real Engine-03 series from demo/fleet_data.json, log2 chart).
      Founder pic extracted to assets/img/founder.jpg. Chladni hero + sense-voice ticker +
      6-benchmark evidence wall (incl. FEMTO/XJTU honest FAILs) + all routes preserved.
      Screenshot harness: scratchpad/shoot.js (puppeteer-core, checks overflow + console errors).
      Local server: python http.server on :8321.

## Next step
M4: write /guide (unlinked) + concepts rationale. Then M5 brand kit (hand-built logo.png,
linkedin-cover.png, og.png from hero screenshot). Then iteration passes 1–3 (fresh-eyes
screenshots each). Decide during pass 1 whether any generated imagery (M3) actually elevates
the design — shader/canvas art may be enough; budget spend must be deliberate.
Known nits for pass 1: 'first warning' annotation can clip the trace; failure annotation
only visible at animation end; hero readout strip bottom spacing at short viewports.

## Milestone map
M1 bake-off → M2 full site build → M3 media assets → M4 guide+concepts notes →
M5 brand kit + og.png → M6/M7/M8 iteration passes 1–3 → M9 mirror to
~/sensory/docs/product/website/ + PR.

## Key constraints (from prompt — binding)
- Claims ONLY from current site copy or ~/sensory/docs/EVIDENCE.md. WORLD_MODEL = inspiration, never claims.
- ≤6 shipped generated images; Gemini ≤15 calls total incl. retries; ≤2 short clips (Higgsfield unlimited models preferred: Wan 2.2 motion / Soul 2.0 stills); watermark-free only.
- Preserve routes: demo/, sample-report.html, data-spec.html, CNAME. Keep SEO metadata.
- prefers-reduced-motion respected; fast on mobile; accessible contrast.
- Mirror final files to ~/sensory/docs/product/website/ (BOTH copies get edits).
- /guide unlinked page crediting Claude; losing concepts stay in /concepts.
- brand/logo.png (≥1024², readable at 48px round crop) + brand/linkedin-cover.png (1128×191 center-safe).
- NEVER `git add` sensory/ or RUN_PROMPT.md (excluded locally).
- Open PR when 3 iteration passes complete. Do not merge.

## Spend tally (paid/credit generations)
| # | When | Service | Model | What | Result |
|---|------|---------|-------|------|--------|
| 1 | 02:32 | Gemini API | gemini-3.1-flash-image | district-heating pump hall still, 16:9 | KEPT → assets/img/band-pumphall{,-m}.webp |
Gemini calls used: 1/15 · Higgsfield metered credits used: 0 (trial NOT active — account shows
free plan / 50 credits; per budget rules left untouched, Gemini primary) · Clips shipped: 0/2
(decision: zero clips — the shader is the site's motion; a video would compete and cost mobile
weight) · Images shipped: 1/6 (one image, two responsive sizes)

## Open problems
- ffmpeg not on PATH (only `convert`) — check again before video work; degrade to code-driven motion if clips can't be compressed.

## Re-orientation (on any revival)
1. Read this file. 2. `git log --oneline -5` + `git status`. 3. TaskList → find first non-completed task. 4. Continue idempotently — NEVER redo paid generations (check spend tally + assets/ on disk first).
