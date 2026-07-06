# Sensory — outreach site

Public site for **Sensory**: sensor-agnostic predictive maintenance for
mid-size industry (district heating first). Learns each machine's normal from
its own history — no failure labels — and reports drift in plain language,
per sensor.

**Live:** https://freakysauce.github.io/sensory-site/

- `index.html` — the one-page site (inline CSS/JS; only external requests are
  the IBM Plex font stylesheets, with system-font fallback)
- `demo/` — playable fleet dashboard: 30 NASA C-MAPSS turbofan engines the
  model never saw in training (see `demo/README.md`). The site embeds it with
  `?embed=1&autoplay=1&loop=1&select=3`.
- `sample-report.html` — a real findings report generated from the NASA
  turbofan analysis run: what a prospect gets back for their CSV/JSON export.

The platform itself lives in a private repository. Contact:
frixos.andreou.dk@gmail.com
