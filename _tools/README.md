# _tools/ — how the generated field guides are built

Since Wave 1 (2026-10), new guides are generated from small source files. The repo is still static: the generated
`.html` page is committed at the repo root and GitHub Pages serves it as is. Nothing here runs in production.

The leading underscore matters: GitHub Pages builds this repo with Jekyll, which skips `_`-prefixed folders, so
none of this is published.

Older guides (before Wave 1, PARABOLA included) are hand-authored and have no sources here; edit those pages directly.

## Layout

| Path | What it is |
|---|---|
| `articles/<slug>/meta.json` | the guide's manifest. For the page: slug, EN/RU title, meta description, og text, brand line, HUD labels. For the site: `codename`, `label` {en, ru}, `llms` (its llms.txt line), `related` (3–4 slugs), `freshness` (rows of claim, source, review_by) |
| `handmade/<slug>/meta.json` | the same site fields for a hand-made guide (slug, codename, label, llms, related, freshness); the two time-philosophy pages are `handmade/time-philosophy/` and `handmade/time-philosophy/time-as-space/` |
| `site.json` | site block, external links, and the categories: id, EN/RU title and their guides **in display order** (a guide's category and position are set here and nowhere else). Also SOON rows, where the external links sit on the index page, and a second index listing (`{"also": slug}`) |
| `build-site.py` | generates `pages.json`, the guide lists in `index.html` (between the `<!-- guides: … -->` markers), `llms.txt` (from the first `## ` on), `related.json`, `freshness.json`, `search.json` and `sitemap.xml` from `site.json` + the manifests, then runs `ru_pages.py`. Writes only what changed; `--check` writes nothing and exits 1 if anything is out of date. Also reports `MOD.json` rows missing from `assets/mission-of-day.js` |
| `articles/<slug>/body.html` | the `<main>` content: hero, numbered chapters, LEGACY, REFERENCES (bilingual `data-en`/`data-ru`) |
| `articles/<slug>/script.js` | the page's interactives; exposes its pure functions as `window.__<name>` for testing |
| `articles/<slug>/checks.js` | numerical checks against published values, run in jsdom |
| `articles/<slug>/extra.css` | optional page-specific CSS |
| `assemble.py` | wraps the sources in the shared head, chrome and `base.css` plus `helpers.js`, then `blocks.place()`; output is byte-identical to the committed page. `--og` also renders the share picture (coordinator only) |
| `blocks.py`, `blocks/`, `dates.json` | the shared blocks every page carries (hreflang, analytics, JSON-LD, network footer) in fixed slots; JSON-LD dates |
| `finalize.py` | the same blocks on hand-made pages; `--touch <slug>` sets a guide's modified date; `--check` |
| `site-check.py` | internal links, JSON-LD, head tags, manifest (no browser needed) |
| `helpers.js` | shared page JS: `T()`, SVG helpers, number formatting (EN/RU), HUD, language toggle, timeline/references renderers |
| `test.js` | jsdom smoke test: script errors, missing `data-ru`, citation numbers vs reference count, then `checks.js` |
| `check-all.sh` | rebuild every article, fail on drift from the committed page, run every test |
| `shot.sh` | headless-Firefox full-page screenshot, tiled into `shots/` (git-ignored); optional 3rd arg = window height (default 28000) |
| `search-index.py` | the `/search.json` text (descriptions + chapter titles, EN/RU) and the related-links checks; `build-site.py` uses it |
| `freshness.json` | generated from the manifests' `freshness` rows; `.github/workflows/freshness.yml` opens an issue on the 1st of each month for overdue rows |

## Adding a guide

```bash
cd _tools && npm install                      # once (jsdom)
mkdir articles/<slug>   # write meta.json, body.html, script.js, checks.js
python3 assemble.py articles/<slug>          # writes ../<slug>.html
./check-all.sh <slug>                        # must end in ALL OK
python3 -m http.server 8790 --directory ../.. &   # server one level above the repo
./shot.sh <slug> 1300 && ./shot.sh <slug> 390     # look at every tile
```

Then put it on the site (the coordinator's step; nothing below is typed into a generated file):

1. In the guide's `meta.json` add the site fields (a hand-made guide gets `handmade/<slug>/meta.json` with `slug` + these):
   ```json
   "codename": "QUAKE",
   "label": { "en": "InSight & Marsquakes", "ru": "InSight и марсотрясения" },
   "llms": "the one-line description for llms.txt",
   "related": ["viking", "escape-maven-mars-atmosphere", "transfer-earth-to-mars"],
   "freshness": [ { "claim": "… as of 12 Nov 2026", "source": "https://…", "review_by": "2027-05-12" } ]
   ```
   Labels take raw `&` and quotes; `build-site.py` escapes them for `index.html`. `related` needs at least 3 guides; `freshness` may be `[]`.
2. Add the slug to its category's `"guides"` list in `site.json`, at the position it should have on the index page.
   A new category is a new `{ "id", "title": {en, ru}, "guides": [...] }` object, placed where it should appear.
3. `python3 finalize.py --touch <slug>` (publication and modified dates in `dates.json`; it also writes them into the page).
4. `python3 build-site.py` (all seven generated files, then the Russian edition and the sitemap). `build-site.py --check` must then report `out of date: none`.
5. Link the guide from 2–3 neighbours (their `related` lists and, where it fits, their text), add its `MOD.json` rows to
   `assets/mission-of-day.js` by hand (`build-site.py` lists the ones still missing), run `./check-all.sh`, then commit
   everything together, `sitemap.xml` included, and push. No workflow commits to the repo any more, so there is nothing to pull afterwards.

The coordinator also renders the share picture (`assemble.py --og`), updates the homepage aero-shader card
count/missions in `followorbounce.github.io`, and `progress.md`.

Changing a label, a codename, the order, a related list or a freshness row later is the same: edit the manifest or
`site.json`, run `build-site.py`. Never edit `pages.json`, `related.json`, `freshness.json`, `search.json`, `sitemap.xml`,
the generated part of `llms.txt` or the marked lists in `index.html` by hand: `check-all.sh` fails if they differ from the manifests.

- Dated claims ("as of …") go in the guide's NOTES `## Freshness` and in the `freshness` rows of its `meta.json`.

## Rules the past waves learned the hard way

- Edit the sources, never the generated page — `check-all.sh` reports DRIFT if they diverge.
- Every number in the text is either cited or computed in `script.js` and checked in `checks.js`.
- HTML entities don't decode inside JS strings assigned with `.textContent` — use the real character.
- Kepler's equation: Newton from E = M diverges at e ≈ 0.98; use bisection or start at E = π.
- Screenshots must go through the local server (file:// silently breaks CSS custom properties). Don't kill or
  drive the desktop's own Firefox; `shot.sh` uses a throwaway profile and `--screenshot` only.
- `#hero` is `min-height:100svh`; `shot.sh` overrides that in a temporary copy so tall captures work. Long guides pass 20,000 px at 390 wide — the old 14,000 px window cut them off.
- The lede's "N chapters" counts **every** numbered chapter, LEGACY and REFERENCES included (all generated guides
  do this). Older hand-made pages used a different count; don't copy theirs.
- Each guide's folder keeps `NOTES.md` (purpose, assumptions, sources per number, unverified items) and, from
  Wave 5 on, `REVIEW.md` (the independent review panel's verdicts) plus a "Response to review" section in NOTES.

## Hand-made pages with tests (Track B, 2026-10)

Older guides are upgraded **in place** (their HTML stays the source of truth). When one gains computed interactives,
its script exposes `window.__<name>` and `_tools/handmade/<slug>/` holds `checks.js`, `NOTES.md` and `REVIEW.md`.
`check-all.sh` runs the jsdom smoke test + checks on those pages too (no rebuild/drift step).
