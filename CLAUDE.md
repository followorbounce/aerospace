# Aerospace Knowledge Hub

Bilingual (EN/RU) aerospace & space-science field-guide site: a large set of single-file HTML articles (missions, programs, telescopes, physics/logic/music-theory field guides) plus an index, sitemap, and `llms.txt`.

## Structure
- One `.html` file per article at repo root, no build system — static, dependency-free HTML/CSS/JS.
- `assets/` — shared site CSS/JS used across articles.
- `index.html`, `pages.json`, `sitemap.xml`, `llms.txt` — site manifest/navigation, regenerate together when adding a page.
- `AGENTS.md` — the full "virtual expert team" charter (engineering, science, content, workflow roles). Read it before nontrivial changes; it has authority over role-specific conventions this file doesn't restate.
- `docs/`, `time philosophy/` + `time-philosophy/` (duplicate-looking dirs — check both before assuming one is dead) — secondary content areas.
- A few stray root files look like abandoned duplicates/typos (`build-your-own-cubsat.html`, `ISSandMir.html`, `lagrange-points.html`, `unfold-james-webb.html` vs. their differently-named full versions) — don't edit these without checking `pages.json`/`sitemap.xml` for which one is actually live.

## Conventions
- Single-file-per-article pattern; keep bilingual EN/RU markup structurally parallel so shared CSS/JS keeps working for both.
- No framework/build-step creep without explicit sign-off (see AGENTS.md, Principal Frontend Engineer role).
- WCAG 2.2 AA+ accessibility, responsive/fluid layout, progressive enhancement.
- Never use Russian in code/UI/docs unless the task explicitly calls for it (bilingual EN/RU *content* pages are the one deliberate exception the site's premise calls for).

## Deploy
GitHub Pages from `main`, remote `github.com/followorbounce/aerospace`.
