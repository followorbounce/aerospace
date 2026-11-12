# Wave 8 author brief (2026-11-12): Moon & Mars gaps, 83 → 88 guides

You are the author team for ONE new guide on the Aerospace Knowledge Hub (`/Users/noone/code/aerospace`,
followorbounce.github.io/aerospace/). The guide is generated from sources in `_tools/articles/<slug>/`.

## Read first (in this order)
1. `CLAUDE.md` (repo) and `_tools/README.md`: layout, pipeline, "rules the past waves learned the hard way".
2. `AGENTS.md`: the review lenses (Scientific, Mathematical, Design, Educational, Ethical...). Write so that panel would approve.
3. The exemplar, all of it: `_tools/articles/relay-telstar-syncom/` (meta.json, body.html, script.js, checks.js,
   extra.css, MOD.json, NOTES.md, REVIEW.md). Match its structure, tone, HUD, chapter numbering, eq-boxes,
   instruments, LEGACY timeline, REFERENCES and bilingual markup exactly. Also skim one guide in your own category
   (Moon: `rabbit-change-far-side`, `scout-lunar-reconnaissance-orbiter`; Mars: `jezero-perseverance-rover`,
   `transfer-earth-to-mars`) so you don't duplicate it and can cross-link it.
4. `_tools/helpers.js`: use its shared helpers (T(), SVG, number formatting EN/RU, the exact-value slider wrapper).

## What to produce, in `_tools/articles/<slug>/` only
- `meta.json`, `body.html`, `script.js` (exposes its pure functions as `window.__<name>`), `checks.js`,
  `extra.css` (include the page-level 44 px button/target rule the Wave 5–7 guides have), `MOD.json`
  (3–6 mission-of-the-day entries, same 8-field format, EN + RU), `NOTES.md` (purpose, audience, owner
  "Wave 8 author (agent), 2026-11-12", outline, sources per number, assumptions, unverified items, and a
  `## Freshness` section listing every dated claim with a suggested review_by date and source URL).
- 7–9 numbered chapters including LEGACY and REFERENCES; 4–5 real instruments (interactive, computed, honest);
  at least 18 references, primary where possible (NASA/NSSDC, ESA, JAXA, ISRO, CNSA, mission papers, PDS,
  peer-reviewed literature). The lede's "N chapters" counts every numbered chapter (LEGACY and REFERENCES too).
- Bilingual: every visible string has `data-en` and `data-ru`; script-drawn labels go through T(). Russian must be
  natural technical Russian (Russian is in scope on this site only through these bilingual attributes).

## Hard rules
- Every number in the text is cited or computed in script.js and checked in checks.js against a published value.
  Models are labelled as models. Never invent a figure, quote or date; if you can't source it, leave it out and
  list it in NOTES "unverified".
- Use web sources to verify; record retrieval dates. Today is 2026-11-12. Anything that can change goes in
  NOTES `## Freshness` with "as of" wording in the text.
- No reference-artist names, no filmmaker names as style references. Credit scientists and engineers fairly
  (including non-US teams and women scientists where the history involves them).
- Don't edit anything outside your folder except generating `../<slug>.html` with assemble.py. Do NOT touch
  pages.json, index.html, llms.txt, related.json, search.json, freshness.json, sitemap.xml, assets/, ru/, other
  guides, or git (no commits, no pushes, no stash). The coordinator wires, links and commits.
- Build and test until clean:
  `cd _tools && python3 assemble.py articles/<slug>` then `./check-all.sh <slug>` must end in `ALL OK`
  (no errors, no missing RU, no off-step sliders, no unstyled classes, every check PASS). `node --check` on script.js.
- Screenshots: this Mac has no Firefox, so skip shot.sh; the coordinator previews in Chrome. Keep layouts that
  work at 390 px wide (no horizontal page scroll; wide tables/charts scroll inside their own box).
- Accessibility: charts have role/aria-label (EN and RU), sliders have labels and live readouts, reduced-motion
  respected, keyboard reachable, contrast as the exemplar.

## Report back (final message, concise)
slug · chapters · instruments (one line each) · check count and the ALL OK line · reference count · dated claims
(with review_by) · anything unverified or risky · suggested 3–4 related slugs and 2–3 neighbour guides that
should link to this one.

## The five guides
| Slug | Codename | Category | Scope |
|---|---|---|---|
| `footing-ranger-surveyor` | FOOTING | moon | Ranger 1–9 (the failures first, then the impact cameras: resolution vs altitude), Surveyor 1–7 soft landings: terminal descent (vernier + retro, the 3.4 m/s touchdown), "will the LM sink?" soil bearing strength from footpad penetration and the surface sampler, Lunar Orbiter site photos, Apollo 12 retrieving Surveyor 3's camera (and the much-debated bacteria story, told honestly). Instruments e.g. impact-camera resolution vs time-to-impact, retro burn/terminal descent, footpad penetration → bearing strength. |
| `mascon-grail-lunar-gravity` | MASCON | moon | Mascons (Muller & Sjogren 1968), why low lunar orbits are unstable (PFS-2's 35-day decay, frozen orbits at 27°/50°/76°/86°), GRAIL Ebb & Flow (2011–2012) inter-satellite Ka-band ranging to microns per second, gravity field to degree ~1500+, thin crust, final impact. Instruments e.g. orbit lifetime over a mascon field, twin-satellite range-rate signal, gravity anomaly from a buried mass, crustal thickness. |
| `touchdown-commercial-lunar-landers` | TOUCHDOWN | moon | The 2019–2026 landers: Beresheet, Chandrayaan-2 Vikram (link VALOR, don't repeat it), ispace M1/M2, SLIM's pinpoint landing (and why it ended upside down), Peregrine, CLPS (Odysseus and Athena tipping over, Blue Ghost M1 success), Luna-25, anything through Nov 2026 (verify; date every status). Physics: guidance and hazard avoidance, landing ellipse vs pinpoint, tip-over stability (CoM height, leg footprint, slope, lateral speed), propellant margin, laser altimeter/terrain-relative navigation. Instruments e.g. tip-over envelope, landing ellipse vs navigation error, descent propellant budget, scorecard of every attempt (outcome stated exactly). |
| `quake-insight-mars` | QUAKE | mars | InSight 2018–2022: SEIS (wind and thermal noise, the shield), marsquakes (S1222a M4.7, ~1,300 events), Mars's liquid core radius ~1,830 km and crust layering from seismic phases, impacts detected seismically and confirmed by MRO, HP3 "mole" failure (honest), dust on solar panels and the end of the mission. Instruments e.g. P/S travel times through a layered Mars and the core shadow, marsquake magnitude vs distance, solar power vs dust over sols, the mole's friction problem. |
| `escape-maven-mars-atmosphere` | ESCAPE | mars | Where Mars's air went: evidence of a thicker past, Jeans escape (thermal) vs non-thermal (photochemical, sputtering, ion pickup), scale height and exobase, why Mars and not Earth (gravity, no global magnetic field), MAVEN (2014–) measured loss rates and storm-time increases, isotopic evidence (argon 38/36, D/H), Mars Express/Hope/Tianwen-1 context, MAVEN status as of now. Instruments e.g. Jeans escape flux vs planet and temperature, scale-height/exobase calculator, loss rate over 4 billion years vs pressure today, solar-storm boost. |
