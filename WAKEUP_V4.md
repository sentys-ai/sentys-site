# WAKEUP — v4 run state (branch `redesign-v4`)

Run: 2026-07-12, daytime session (owner present; overnight ping protocol skipped
at owner's request). Worktree `~/sentys-site-v4`, served at :8324 (tmux `sentys`,
window `v4`).

## Where things stand

- [x] Immersion: product docs, EVIDENCE.md, live v3 at :8323, v3 guide
- [x] Bake-off: 3 heroes under `concepts/` — **annunciator** beat vitals + sonar
      (losers kept, guide has the verdicts)
- [x] Full build from winner: "THE PANEL" — enamel console, annunciator hero,
      chart-recorder story, full content parity from v3 (commit `a9e040c`)
- [x] Pass 1: recorder legibility, satellite reskins (sample-report + data-spec
      as paper, 404 as console), og.png regenerated
- [x] Pass 2: guide rewritten in v4 skin with per-generation scoping + v4 system
      notes, WAKEUP_V4.md
- [x] Pass 3: multi-viewport + reduced-motion verification, LinkedIn cover
      refresh (hand-built), final polish
- [x] Verdict vs v3 + push (see "Verdict" below)

## Spend tally (hard limits: Gemini <~10 calls, Higgsfield 50 free credits)

| When | What | Cost |
|---|---|---|
| — | Fontshare woff2 downloads (Tanker, Author, Technor, Khand) | free |
| — | og.png, 404, all concept art: hand-built CSS/canvas + screenshots | free |
| — | Gemini calls this run | 0 |
| — | Higgsfield credits this run | 0 |

The design system is deliberately hand-built (enamel/glass/paper via CSS +
canvas); generated imagery was evaluated and declined — it would dilute the
engineered-console language. Existing v3 media (pump-hall cinemagraph,
robot-origin still) carries over.

## Content parity checklist (RUN_PROMPT_V4)

- [x] Hero claims 30/30 · 59 · 1 · 6 (LED readout rail)
- [x] One-engine story (unit 03, cycle 123, 56 cycles) — chart recorder
- [x] demo/ route embedded + preserved untouched
- [x] Evidence wall incl. PHM 2010 GATE PASS + FEMTO/XJTU published FAILs
- [x] "How much warning do I actually get?" box
- [x] Agent chain (Code → Claude → mechanical check → engineer), verbatim
      work order, "AI that can't make numbers up" card next to free-CSV ask
- [x] Ask sheet (NDA → export → report → that's it), five-line spec,
      data-handling block, founder section, Danish note
- [x] Routes: demo/, sample-report.html, data-spec.html, CNAME, og.png (regen)

## Verdict (fresh eyes, 2026-07-12)

**v4 beats v3 for this audience — PR opened.** v3 is the more beautiful
object; v4 is the more credible instrument. The brief's criterion is
credibility with maintenance/reliability engineers, and v4 speaks their
mother tongue: annunciator windows, LAMP TEST/ACKNOWLEDGE, LED readouts,
RAL-7032 enamel, paper deliverables shown as paper. A plant engineer
arriving cold sees "the fourth dark AI site this week" in v3, and a control
console in v4. Counterpoint stated in the PR: design-literate visitors
(e.g. investors) may find v3 more impressive; the owner decides.
Side-by-sides: `guide/compare/`.

## If revived mid-run

Everything above marked [x] is committed on `redesign-v4` — do not redo.
No paid generations exist to protect. Serve check:
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8324/`.
