# Sentys — outreach site

Public site for **Sentys**: sensor-agnostic predictive maintenance for
European industry — pumps, bearings, turbomachinery, and anything else that
logs sensor data. Learns each machine's normal from its own history — no
failure labels — and reports drift in plain language, per sensor.

**Live:** https://sentys.ai/

- `index.html` — the one-page site. Design: **"Resonance"** — a Chladni-plate
  WebGL shader as the hero (vibration made visible: healthy = a stable
  standing-wave pattern; drift deforms and heats it), dark "plate" bands +
  light "porcelain" bands, single ember accent, self-hosted type
  (Clash Display / Supreme / IBM Plex Mono) — **zero external requests**.
  Reduced-motion renders one static shader frame.
- `assets/css/site.css`, `assets/js/site.js` — design system + behaviours
  (shader, sense-voice ticker, Engine-03 evidence chart, reveals, scrollspy).
- `assets/js/engine03-data.js` — real model output for the evidence chart,
  extracted verbatim from `demo/fleet_data.json`.
- `assets/fonts/` — self-hosted woff2 (Clash Display + Supreme under the
  Fontshare ITF Free Font License, see `FONTSHARE_LICENSE.txt`; IBM Plex
  Mono, OFL).
- `assets/img/` — founder photo + one art-directed still (AI-generated,
  disclosed as illustration in its caption; every product visual on the site
  is real model output).
- `demo/` — playable fleet dashboard: 30 NASA C-MAPSS turbofan engines the
  model never saw in training (see `demo/README.md`). Embedded with
  `?embed=1&autoplay=1&loop=1&select=3`.
- `sample-report.html` — a real findings report generated from the NASA
  turbofan analysis run: what a prospect gets back for their CSV/JSON export.
- `data-spec.html` — the printable one-page export spec linked from the ask.
- `og-src.html` — source for `og.png` (render at 1200×630 in headless Chrome
  and screenshot; text lives in HTML, never in generated pixels).
- `brand/` — logo + LinkedIn cover (`brand/src/` holds the HTML sources).
- `guide/` — colophon: how the site was built, incl. the concept bake-off
  (`concepts/` holds the losing hero prototypes).

The platform itself lives in a private repository. Contact:
frixos@sentys.ai
