# REVIEW — MASCON (GRAIL & the lumpy gravity of the Moon)

**Date:** 2026-11-12 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes; brief `_tools/WAVE8-REVIEW-BRIEF.md`)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Four MUST items, all applied in the sources and rebuilt:
- the orbit integration ran in 6-day chunks (about 75 ms of arithmetic per frame on a desktop, several hundred ms on a phone);
- the aria-live status of the orbit instrument re-announced a running day count about 60 times per run;
- the instrument told a reader that PFS-1 "stays in orbit" with no caveat, although the real one fell in January 1973;
- the same problem for the model-only near-equatorial survival band (< 3°).

Every computed number re-derives independently; the numerical checks test published values, not only the code against itself.
`./check-all.sh mascon-grail-lunar-gravity` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 21/21, timeline 10, **61 checks PASS**; 56 before review).
Reviewer scratch scripts: `/private/tmp/claude-501/-Users-noone-code/d599e1b7-a2a0-4aa3-a884-9de91139cba6/scratchpad/` (`t.js` timing, `t2.js` chunked-run/event-loop test, `pdftxt.py` + `pdf1/lpsc.txt` LPSC abstract text).

---

## 1. Planetary physicist — APPROVE WITH CHANGES

- The orbit model is sound for its stated purpose. It integrates inertially with the field rotating at the sidereal rate. Earth sits fixed on the body +x axis, which is right for a synchronously locked Moon (no libration/eccentricity, as stated). The indirect tidal term −GM⊕/D² is included. Starting perilune and node are fixed at 0°.
- Retrograde PFS-2: NSSDC's "clockwise as viewed from north" → i = 170°, correct.
- The model's survival bands (0–3°, 21–30°, 48–52°, 70–79°, 83–87° prograde, plus retrograde bands at 94–111°, 130–133°, 152–158° and 178–180°) contain all four published frozen inclinations. The 0–3° band and PFS-1's survival are real model artefacts. The note states both.
- PFS-2 scan: 12.7–51.3 d, median 33.7 d against the real 34–35 d. This is honest framing: the model shows the mechanism and does not reconstruct the orbit.
- **MUST (applied, with §4.1)** — the readout status contradicted history for the PFS-1 preset ("Still in orbit after a year … the pulls … largely cancel at this tilt"). The note under the chart was correct, but a reader who presses PFS-1 sees only the status. *Fixed:* in the degree-30 field, the status now adds "A limit of the model: the real PFS-1 came down in January 1973, after less than a year and a half [6]". A similar caveat appears for surviving orbits below 3.5° or above 176.5° (EN + RU). Check added (`isPFS1`); both strings verified in a 25 s jsdom run of the real page loop.
- **SHOULD (applied)** — the ch.3 paragraph said "PFS-1, at 28°, was near one of them" but not that it still fell. *Added:* "…and lasted far longer, though it too came down, in January 1973, after less than a year and a half [6]" (EN + RU).
- NIT — "mountains pull, craters don't" (ch.7) is a figure of speech for "gravity follows topography". Acceptable.

## 2. Mathematician (models, units, numerics, the checks) — APPROVE WITH CHANGES

Independent re-derivation:

| Quantity | Reviewer | Page |
|---|---|---|
| x½ = (2^(2/3) − 1)^½ (d + h) | 0.76642 | 0.766 ✔ |
| Aestuum 5 × 10⁻⁶ × 7.346 × 10²² kg = 3.673 × 10¹⁷ kg at 100 km | GM = 0.024515 km³/s² → 245.1 mGal | 245 ✔ |
| Circular period / speed at 55 km (GM 4,902.80, R 1,737.4) | 113.49 min, 1.654 km/s | 113.5 / 1.65 ✔ |
| 13 km / 1.654 km/s | 7.86 s | "eight seconds" ✔ |
| e-fold altitude, degree 420: R(e^{1/(l+2)} − 1) | 4.12 km | "about 4 km" ✔ |
| πR/l at 420 / 1800 / 80 / 320 (R = 1,738) | 13.00 / 3.03 / 68.3 / 17.1 km | ✔ |
| 2πGρ, ρ = 2,550 | 106.9 mGal/km | 107 ✔ |
| 2,550 / 0.88 | 2,898 kg/m³ | "about 2,900 (computed here)" ✔ |
| δv = GM/(v s) from v δv = GM/s | first-order energy argument | ✔; checks.js compares with a 2-D integration (342 µm/s each, < 1 %) |
| Apollo 8 mascon range-rate peak at 55 km | ≈ 4 × 10⁴ µm/s ≈ 40 mm/s | consistent with Lunar Orbiter's ~50 mm/s, a good internal sanity check |
| PFS-2 release 24 Apr 21:56 UT → 29 May | 34.1–35.1 d, depending on the unknown impact hour | NSSDC "34", NASA "35": both consistent; the text keeps 35 |

- The Cunningham recursion, the normalisation factor √((2 − δ₀ₘ)(2n + 1)(n − m)!/(n + m)!), and J₂ = 203.2 × 10⁻⁶ (tide-free) against the fact sheet's 202.7 × 10⁻⁶ are all correct.
- **MUST (author flag; applied)** — responsiveness. Measured cost: 12.7 ms of arithmetic per simulated day at degree 30 (1.3 ms at degree 2). The old `advance(6)` per animation frame was therefore a 76 ms long task on this Mac, and roughly 250–400 ms on a mid-range phone, about 61 times in a row. There was also a latent bug: `advance(n)` measured its stop from the last whole day, so fractional pieces would never progress. *Fixed:*
  - `advance` now stops at `t + n days`. Single-call results are identical: the stored strip and the PFS-2 scan still reproduce.
  - The UI runs 0.1-day pieces (≈ 1.6 ms each here) until a 10 ms frame budget is spent, then yields and redraws once.
  - The run starts only when the chart is within 300 px of the viewport (IntersectionObserver; immediate where it is absent).
  - Checks added: one piece is less than half the budget, and the run in pieces gives the same PFS-2 impact day as the stored scan (46.56 vs 46.6 d). A jsdom event-loop probe shows a maximum gap of 26 ms while integrating, including the SVG redraw.
- **SHOULD (applied)** — "the 90-day mapping phase was split into three cycles of 27.3 days" — 3 × 27.3 = 81.9 d, not 90. Reworded to "held three cycles of 27.3 days" (EN «вмещал»).
- NIT — the check "orbit integrations ran (… ms)" always passes; it is informational. Fine.

## 3. Historian / fact-checker — APPROVE WITH CHANGES

Opened today (2026-11-12):
- **NSSDC Apollo 16 Subsatellite** — 90/130 km, 10°, "clockwise as viewed from north", deployed 24 April 21:56:09 UT, impacted 29 May 1972 "after 34 days (425 revolutions)" ✔
- **"Bizarre Lunar Orbits"** (Moon Daily mirror of the 2006 Science@NASA text) — 2½ weeks to 10 km; "35 days and 425 orbits"; PFS-2 "inclination of only 11"; PFS-1 at 28, "bit the dust in January 1973 … after less than a year and a half"; frozen 27/50/76/86; Lunar Prospector every two months at 100 km and more than monthly at 30 km; Konopliv quote ✔. The NASA original is gone; the UNT archive link is the right citation, with the mirror noted.
- **NASA GRAIL mission page** — Delta 7920H; 202.4 kg; **primary science 7 March – 29 May 2012**; Emily Dickinson Elementary, Bozeman, fourth grade; MoonKAM with UCSD undergraduates and Sally Ride Science; GRACE "from 2002 to 2017"; 11th Discovery mission; impact 75.62° N 26.63° W; mascons discovered at JPL in 1968 ✔. (The page also gives the second science phase as "Aug. 8", where Zuber et al. give 30 August; the guide follows the paper.)
- **Zuber et al., LPSC 2013 (NTRS PDF, text extracted)**:
  - "PM in lunar orbit between March 1, 2012 and May 29, 2012" and "the PM initiated on March 1, one week early";
  - XM 30 August – 14 December at 23 km, three manoeuvres a week, 11 km from 6 December over Orientale, deorbit 17 December, 660 × 660 field ✔;
  - the abstract itself has two typos: GRACE "launch in 2007" and GRAIL "launched on September 10, 2012".
- **Konopliv et al. 2014** (abstract via Zendy/Caltech) — GL0900C/D; "minimum spacecraft altitude varies spatially between 3 km and 23 km" ✔
- **Park et al. 2025** (Nature 641, 1188–1192) — k₃ = 0.0163 ± 0.0007, about 72 % above a symmetric Moon, 100–200 K nearside anomaly ✔
- **Wieczorek et al. 2013** (abstract records) — 2,550 kg/m³, 12 % to at least a few km ✔. The 34–43 km figure is in the Science abstract as the reviewer recalls it, and it is quoted in companion LPSC work. Accepted.
- **Muller & Sjogren 1968** — Science 161 (3842), 680–684, doi 10.1126/science.161.3842.680 ✔ (bibliographic level; full text still not opened, as the author flagged). The facts the page draws from it are only "the name" and "August 1968". The method facts come from the 1969 Physics Today article, which was opened.
- **Konopliv 2001** — Icarus 150, 1–18, LP150Q to degree 150, confirmed through the LPSC reference list ✔

Author-flagged items, resolved:
1. **PFS-2 orbit/lifetime NSSDC vs NASA** — **SHOULD (applied):** a reader who opens [6] sees 11°. Added "(11° in JPL's account) [5][6]" (EN + RU). 34 vs 35 days reconciles through the release hour (see §2).
2. **Primary-mission start 1 vs 7 March** — The paper and the LPSC abstract say 1 March. The NASA page's 7 March probably reflects the date the science phase was announced or formally began. The page's wording followed the paper. **SHOULD (applied):** the EN text "ran from 1 March to the end of May 2012, a week ahead of schedule" put the "week early" on the whole phase. It is now "ran from 1 March, a week earlier than planned, to the end of May 2012" (the RU was already right). Open SHOULD: a footnote-level mention of NASA's 7 March, if the coordinator wants it.
3. **2006 NASA article via web archive** — acceptable; the freshness row (link-rot check, 2027-05-12) is right.
4. **Citation hygiene, SHOULD (applied)** — "GRACE … since 2002 [9][12]": [12] says 2007 (typo in the abstract), so the claim now cites [9] only.

No dated claim changed status. GL1800F is still the highest-degree field in the PDS SHADR listing named in NOTES. Park 2025 is still current.

## 4. Science communicator + Educator — APPROVE WITH CHANGES

- The spine is strong: one measurement (speed along the line of sight), one nuisance (residuals), one fix (measure between two spacecraft), one consequence (orbits fall). Each chapter's instrument matches its argument.
- Models are labelled as models in every note. The illustrative presets are called illustrative. The Bouguer grain density is flagged "computed here".
- The comparison "a million times finer" is computed and checked.
- **MUST (applied; shared with §1)** — the orbit instrument's survival message is the one place where the page overclaimed. It is now caveated in the live status, not only in the note.
- SHOULD (open) — the strip shows retrograde survival bands (94–111°, 130–133°, 152–158°, 178–180°) without comment. A reader might wonder whether they are real. A sentence like "the published list covers prograde orbits; the model's retrograde bands are untested" would help, but the panel could not source what JPL found for retrograde orbits, so it is left as a note for the author.
- NIT — "Integrating…" now reads "Integrating a year of orbit…"; progress stays visible in the DAYS COMPUTED readout.

## 5. Designer + Accessibility — APPROVE WITH CHANGES

Checked by reading markup and CSS (390 px and 1300 px):
- `.sim-wrap` stacks at narrow widths, `.fig-stack` holds chart + strip, and button rows wrap (7 orbit presets wrap onto 2–3 lines at 390 px).
- Small SVG text grows under 520 px (`svg-small` 13 px, `svg-tiny` 11 px in viewBox units). The longest strip caption (~70 characters) still fits from x = 50 to x ≈ 470.
- 44 px buttons and slider hit area; coarse-pointer thumbs; focus-visible outlines.
- Every slider has `aria-valuetext` (checked). Every chart has `data-aria-en/ru` (checked). Button groups have `data-aria-en/ru`.

Findings:
1. **MUST (applied)** — the `#lfStatus` live region was rewritten every animation frame with "Integrating… N days", so a screen reader would queue dozens of announcements. It now holds a constant "Integrating a year of orbit…" (set only if changed) and announces only the final result. The day count lives in the non-live readout. Check added.
2. **MUST (applied; §2)** — main-thread blocking. With a 10 ms frame budget, it is solved.
3. Reduced motion — the progressive drawing is a progress display, not decorative motion, and nothing else animates. Acceptable as is. NIT: under `prefers-reduced-motion` the chart could redraw every 10 simulated days instead of every frame; not needed.
4. SHOULD (open) — the strip's tan bars (#c9a46a) against white are about 2.3:1 as a non-text graphic. Survival is also encoded by bar height (full height = survives), so the information is not colour-only. A darker tan would pass 3:1.
5. SHOULD (open) — on a phone, a full degree-30 year takes roughly 15–20 s of wall time (12.7 ms/day here × 365 × phone factor). That is acceptable with the progressive chart and the readout. A faster step (e.g. dt = 120 s) would need the strip and the scan to be regenerated.

## 6. Russian editor — APPROVE WITH CHANGES

The Russian is natural technical Russian: периселений, наклонение, обратное (ретроградное) движение, «замороженные» орбиты, миллигалы, число Лява, Восточное море, Залив Зноя. Moon names are correctly localised. EN/RU parity: missingRu 0.
1. **SHOULD (applied)** — "98,5 % гравитационного сигнала Луны дают просто её рельефы" → «…даёт просто её рельеф» (singular noun; the verb agrees with рельеф).
2. **SHOULD (applied)** — «опустилась примерно до 10 км, поднялась снова до 50 км, опять пошла вниз» → «опустилась примерно до 10 км, затем снова поднялась примерно до 50 км и опять пошла вниз».
3. New strings for the model-limit statuses and the PFS-1 sentence were written in RU in parallel («не продержавшись и полутора лет»).
4. NIT — «сут» as the unit after numbers is standard; «падение: 47 сут» reads fine.

## 7. Ethicist — APPROVE (one SHOULD applied)

- Credit is fair: Muller and Sjogren; Murphy and Siry (Goddard); Konopliv; Maria Zuber as the first woman to lead a planetary mission (sourced); the Bozeman schoolchildren; Sally Ride and the UCSD students; JAXA's Kaguya/Okina; Melosh's team (Purdue); Wieczorek.
- Failures (PFS-2) are told plainly. The model's own failures (PFS-1, the < 3° band) are now stated where the reader meets them.
- **SHOULD (applied)** — "a JPL team in 2025" understated a multi-institution paper. It is now "a team led by Ryan Park of JPL" (EN + RU).
- No harm concerns. The NOTES record why Konopliv's illustrative "plumb-bob" figures were left out.

---

## Consolidated MUST-FIX (all applied)
1. Orbit integration: 0.1-day pieces under a 10 ms frame budget, start on approach to the viewport, `advance()` stop measured from the current time (§2). Checks: piece cost, and the run in pieces equals the stored PFS-2 scan.
2. `#lfStatus` aria-live: no per-frame day count (§5.1). Check added.
3. PFS-1 survival in the model is caveated in the live status (§1). Check added.
4. The near-equatorial (< 3°) survival band is caveated in the live status, in the degree-30 field (§1).

## SHOULD applied
- PFS-2 "11° in JPL's account" [5][6].
- PFS-1 "too came down, January 1973".
- "Held three cycles" (not "split").
- "1 March, a week earlier than planned".
- GRACE 2002 cited to [9] only.
- "Team led by Ryan Park of JPL".
- Two RU grammar fixes.

## SHOULD / NIT left open
- §3.2 — optionally mention NASA's 7 March start for the primary science phase.
- §4 — the retrograde survival bands are not discussed; no source found for retrograde frozen orbits.
- §5.4 — the strip's tan bars contrast is about 2.3:1 (height also encodes survival).
- §5.5 — on a phone the full year takes ~15–20 s of wall time (progressive, non-blocking).
- Muller & Sjogren 1968 and Konopliv 2001 full texts are still not opened. The page uses only bibliographic facts from them.
- Build note for the coordinator: `assemble.py` prints a `ModuleNotFoundError: No module named 'PIL'` from `../followorbounce.github.io/engine/og_cards.py`. The page is still written and check-all passes; the share card must be rendered where Pillow is installed.
