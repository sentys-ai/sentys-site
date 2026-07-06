# Sensory — outreach site

Public site for **Sensory**: sensor-agnostic predictive maintenance for
European industry — pumps, bearings, turbomachinery, and anything else that
logs sensor data. Learns each machine's normal from its own history — no
failure labels — and reports drift in plain language, per sensor.

**Live:** https://freakysauce.github.io/sensory-site/

- `index.html` — the one-page site. Design: dual-band "precision instrument"
  (dark machine bands + light instrument-paper body), signal-amber accent,
  self-hosted type (Nippo display / Supreme body / IBM Plex Mono readouts) —
  **zero external requests**. The hero draws real Engine-03 model output over
  a graded macro photograph; reduced-motion renders it statically.
- `assets/fonts/` — self-hosted woff2 (Nippo + Supreme under the Fontshare
  ITF Free Font License, see `FONTSHARE_LICENSE.txt`; IBM Plex Mono, OFL).
- `assets/img/` — art-directed macro-industrial stills (AI-generated,
  post-graded to the brand palette; ambience only — every product visual on
  the site is real model output).
- `demo/` — playable fleet dashboard: 30 NASA C-MAPSS turbofan engines the
  model never saw in training (see `demo/README.md`). The site embeds it with
  `?embed=1&autoplay=1&loop=1&select=3`.
- `sample-report.html` — a real findings report generated from the NASA
  turbofan analysis run: what a prospect gets back for their CSV/JSON export.
- `data-spec.html` — the printable one-page export spec linked from the ask.
- `og-src.html` — source for `og.png` (render at 1200×630 in headless Chrome
  and screenshot; text lives in HTML, never in generated pixels).

The platform itself lives in a private repository. Contact:
frixos.andreou.dk@gmail.com
