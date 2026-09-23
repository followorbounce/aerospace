# Progress — Aerospace Knowledge Hub

## Status
- ~60 article HTML files covering space programs, missions, telescopes, and adjacent field guides (physics, logic, music theory).
- Shared site system, cross-page nav, and SEO/a11y baseline introduced (commit `41e44f0`).
- Working tree clean; branch is **1 commit ahead of `origin/main`** (the RESONANCE — Mathematics of Music page) — not yet pushed.
- Remote: `github.com/followorbounce/aerospace`.

## Recent work (most recent first)
- 2026-09-22 — **Added TRANSFER — Earth to Mars** (`transfer-earth-to-mars.html`, Mars Exploration category). 9 content chapters + LEGACY + REFERENCES, bilingual EN/RU, 8 interactives: live Kepler-equation orbit viewer from JPL mean elements (validated against the 2003/2018/2020 close approaches to ~0.1 M km) + 2000–2045 distance chart; computed launch-window dates; aimable Hohmann animation (hit/miss); tangent-departure transfer family (days vs Δv); Δv/rocket-equation budget; radiation dose calculator on MSL RAD measured rates (1.84 / 0.64 mSv/day) vs NASA 600 mSv limit; Pu-238 RTG decay; light-delay signal sender; Mars-vs-Earth table + weight; real mission cruise-time bars. 12 references, URLs checked. Wired into pages.json/index.html/llms.txt/sitemap.xml. Verified in headless Firefox (desktop EN, mobile RU). Committed `fa71336` and pushed.
- 2026-09-16 — Added CLAUDE.md and progress.md for ongoing tracking.
- Added RESONANCE — The Mathematics of Music field guide page (unpushed).
- Added CASCADE — Physical Computing field guide page.
- Expanded THRESHOLD (Common Ground & Basic Logic) to 13 chapters with 5 interactive elements.
- Added IMPULSE — The Physics of Spaceflight field guide page.
- Added REFERENCES sections to 22 pages, fixed 11 dead agency links.
- Added the 12 remaining field-guide articles; introduced shared site system + nav + SEO/a11y baseline.

- 2026-09-19 — Added a Cloudflare Web Analytics beacon (cross-repo rollout across every deployed followorbounce/client site). See [[cloudflare-analytics-setup]] in the assistant's memory for the account/token map.

## Next steps
- `git push` the pending local commit (RESONANCE page).
- Resolve the stray/duplicate-looking files at repo root (`build-your-own-cubsat.html`, `ISSandMir.html`, `lagrange-points.html`, `unfold-james-webb.html`, `time philosophy/` vs `time-philosophy/`) — confirm which are dead and remove them, or document why both exist.
- No other open TODOs found in-repo; check `AGENTS.md` workflow protocol before larger changes.
