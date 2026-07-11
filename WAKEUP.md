# WAKEUP.md — sentys.ai redesign overnight run

**Started:** 2026-07-12 01:45 CEST · **Branch:** `redesign` · **Protocol:** ~/sensory/docs/OVERNIGHT_PROTOCOL.md
**Prompt:** RUN_PROMPT.md (untracked, kept out of git via .git/info/exclude along with sensory/)

## Current milestone
M2 — Full site build from winning concept C ("Resonance")

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

## Next step
M2: build full index.html from Concept C. Type: Clash Display + Supreme + PlexMono.
Palette: plate graphite #101318, dust #efe7d8, ember #f2a53e→#ff6a45 heat ramp; light
instrument-paper sections for readability. Asymmetric hero (NOT centered), plate confined
with vignette, drift narrated by typed sense-voice line. Watch mobile horizontal overflow
(C prototype had real overflow at 390px — find with document.scrollWidth during build).
Preserve demo/ iframe, sample-report.html, data-spec.html, CNAME, SEO meta.

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
| — | — | — | — | nothing spent yet | — |
Gemini calls used: 0/15 · Higgsfield metered credits used: 0 · Clips shipped: 0/2 · Images shipped: 0/6

## Open problems
- ffmpeg not on PATH (only `convert`) — check again before video work; degrade to code-driven motion if clips can't be compressed.

## Re-orientation (on any revival)
1. Read this file. 2. `git log --oneline -5` + `git status`. 3. TaskList → find first non-completed task. 4. Continue idempotently — NEVER redo paid generations (check spend tally + assets/ on disk first).
