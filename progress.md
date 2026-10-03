# Progress — Aerospace Knowledge Hub

## Status
- ~60 article HTML files covering space programs, missions, telescopes, and adjacent field guides (physics, logic, music theory).
- Shared site system, cross-page nav, and SEO/a11y baseline introduced (commit `41e44f0`).
- Working tree clean; up to date with `origin/main` (checked 2026-10-02). All reference links clickable (2026-09-25).
- Remote: `github.com/followorbounce/aerospace`.

## Recent work (most recent first)
- 2026-09-22 — **Added TRANSFER — Earth to Mars** (`transfer-earth-to-mars.html`, Mars Exploration category). 9 content chapters + LEGACY + REFERENCES, bilingual EN/RU, 8 interactives: live Kepler-equation orbit viewer from JPL mean elements (validated against the 2003/2018/2020 close approaches to ~0.1 M km) + 2000–2045 distance chart; computed launch-window dates; aimable Hohmann animation (hit/miss); tangent-departure transfer family (days vs Δv); Δv/rocket-equation budget; radiation dose calculator on MSL RAD measured rates (1.84 / 0.64 mSv/day) vs NASA 600 mSv limit; Pu-238 RTG decay; light-delay signal sender; Mars-vs-Earth table + weight; real mission cruise-time bars. 12 references, URLs checked. Wired into pages.json/index.html/llms.txt/sitemap.xml. Verified in headless Firefox (desktop EN, mobile RU). Committed `fa71336` and pushed.
- 2026-09-16 — Added CLAUDE.md and progress.md for ongoing tracking.
- Added RESONANCE — The Mathematics of Music field guide page (pushed).
- Added CASCADE — Physical Computing field guide page.
- Expanded THRESHOLD (Common Ground & Basic Logic) to 13 chapters with 5 interactive elements.
- Added IMPULSE — The Physics of Spaceflight field guide page.
- Added REFERENCES sections to 22 pages, fixed 11 dead agency links.
- Added the 12 remaining field-guide articles; introduced shared site system + nav + SEO/a11y baseline.

- 2026-09-19 — Added a Cloudflare Web Analytics beacon (cross-repo rollout across every deployed followorbounce/client site). See [[cloudflare-analytics-setup]] in the assistant's memory for the account/token map.

## Next steps- 2026-10-02 — Science/maths review of interactives (Hohmann, Kepler solvers, rocket equation, radiation, music cents — all verified numerically). Fixed: `physics-of-spaceflight.html` Δv ladder GEO 12.2 → 13.3 km/s (LEO 9.4 + coplanar Hohmann 2.46 + 1.48); `iss-and-mir.html` Newton-cannon ellipse now has perigee at the launch point (e = (v/7.9)² − 1) instead of dipping inside Earth above ~9 km/s; third-cosmic-velocity text (EN+RU) corrected — 16.6 km/s is relative to Earth, ≈42.1 km/s heliocentric. No broken internal links (resolving /aerospace/ base + extensionless URLs); all 50 inline scripts pass `node --check`.

- ~~Resolve the stray/duplicate-looking files~~ — checked 2026-10-02: `build-your-own-cubsat.html`, `ISSandMir.html`, `unfold-james-webb.html`, `equilibrium-lagrange-points.html` and `time philosophy/` are all deliberate noindex redirect stubs (meta refresh + `location.replace`) to the canonical pages, kept so old/indexed URLs keep working. `lagrange-points.html` is the canonical Lagrange page. Keep the stubs; nothing to delete.
- Planned: PARABOLA — optical/RF reflector field guide (workspace roadmap P2.1, `/home/none/git/roadmaps/roadmap-2026-10.html`).
- No other open TODOs found in-repo; check `AGENTS.md` workflow protocol before larger changes.
