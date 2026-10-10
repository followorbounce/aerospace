# _tools/ — how the generated field guides are built

Since Wave 1 (2026-10), new guides are generated from small source files. The repo is still static: the generated
`.html` page is committed at the repo root and GitHub Pages serves it as is. Nothing here runs in production.

The leading underscore matters: GitHub Pages builds this repo with Jekyll, which skips `_`-prefixed folders, so
none of this is published.

Older guides (before Wave 1, PARABOLA included) are hand-authored and have no sources here; edit those pages directly.

## Layout

| Path | What it is |
|---|---|
| `articles/<slug>/meta.json` | slug, EN/RU title, meta description, og text, brand line, HUD labels |
| `articles/<slug>/body.html` | the `<main>` content: hero, numbered chapters, LEGACY, REFERENCES (bilingual `data-en`/`data-ru`) |
| `articles/<slug>/script.js` | the page's interactives; exposes its pure functions as `window.__<name>` for testing |
| `articles/<slug>/checks.js` | numerical checks against published values, run in jsdom |
| `articles/<slug>/extra.css` | optional page-specific CSS |
| `assemble.py` | wraps the sources in the shared head, chrome and CSS (taken live from `parabola-mirrors-and-dishes.html`) plus `helpers.js` |
| `helpers.js` | shared page JS: `T()`, SVG helpers, number formatting (EN/RU), HUD, language toggle, timeline/references renderers |
| `wire.py` | adds a page to `pages.json`, `index.html` and `llms.txt` (and can create a new category) |
| `test.js` | jsdom smoke test: script errors, missing `data-ru`, citation numbers vs reference count, then `checks.js` |
| `check-all.sh` | rebuild every article, fail on drift from the committed page, run every test |
| `shot.sh` | headless-Firefox full-page screenshot, tiled into `shots/` (git-ignored) |

## Adding a guide

```bash
cd _tools && npm install                      # once (jsdom)
mkdir articles/<slug>   # write meta.json, body.html, script.js, checks.js
python3 assemble.py articles/<slug>          # writes ../<slug>.html
./check-all.sh <slug>                        # must end in ALL OK
python3 -m http.server 8790 --directory ../.. &   # server one level above the repo
./shot.sh <slug> 1300 && ./shot.sh <slug> 390     # look at every tile
python3 wire.py <slug> CODENAME "Label EN" "Label RU" <category-id> "llms.txt one-liner"
#   new category: append  "Title EN" "Title RU" <id-of-category-it-goes-before>
```

Then commit and push (`git pull --rebase` first). The GitHub Action regenerates `sitemap.xml` from `pages.json`;
never edit the sitemap by hand. Also update the homepage aero-shader card count/missions in
`followorbounce.github.io`, and `progress.md`.

## Rules the past waves learned the hard way

- Edit the sources, never the generated page — `check-all.sh` reports DRIFT if they diverge.
- Every number in the text is either cited or computed in `script.js` and checked in `checks.js`.
- `wire.py` takes raw `&` in labels; it escapes for `index.html` itself.
- HTML entities don't decode inside JS strings assigned with `.textContent` — use the real character.
- Kepler's equation: Newton from E = M diverges at e ≈ 0.98; use bisection or start at E = π.
- Screenshots must go through the local server (file:// silently breaks CSS custom properties). Don't kill or
  drive the desktop's own Firefox; `shot.sh` uses a throwaway profile and `--screenshot` only.
- `#hero` is `min-height:100svh`; `shot.sh` overrides that in a temporary copy so tall captures work.
- The lede's "N chapters" counts **every** numbered chapter, LEGACY and REFERENCES included (all generated guides
  do this). Older hand-made pages used a different count; don't copy theirs.
- Each guide's folder keeps `NOTES.md` (purpose, assumptions, sources per number, unverified items) and, from
  Wave 5 on, `REVIEW.md` (the independent review panel's verdicts) plus a "Response to review" section in NOTES.
