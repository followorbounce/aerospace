# REVIEW — FOOTING (Ranger, Surveyor & the ground under Apollo)

**Date:** 2026-11-12 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There are four MUST items, and all four are applied:
1. A co-author's first name was invented ("Rebecca Jones" for R. H. Jones), and the lead author was left out.
2. The footpad instrument's "safety factor vs Surveyor 5 soil" (×6) sat next to the Sourcebook's 600–2,200 with no explanation.
3. The bacteria conclusion was stated more strongly than the source states it.
4. The two-column readout left an empty half-cell on the Surveyor crash preset.

All computed numbers re-derive independently.
Reviewer scratch work: `/private/tmp/claude-501/-Users-noone-code/d599e1b7-a2a0-4aa3-a884-9de91139cba6/scratchpad/rv/` (NSSDC page texts, Rummel slides and Hughes SSD-68223R text extracted with pypdf, own Python).
`./check-all.sh footing-ranger-surveyor` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 31/31, timeline 10, 68 checks PASS).

---

## 1. Physicist / planetary scientist — APPROVE WITH CHANGES

| Quantity | Reviewer | Page |
|---|---|---|
| v_esc from GM 4,902.800118, R 1,737.4 | 2.3757 km/s | 2.38 ✔ |
| v∞ for 2.62 km/s | 1.105 km/s | 1.10 ✔ |
| Fitted path angle (own leapfrog integration backwards from impact to first-picture altitude, NSSDC times) | R7 63.6°, R8 39.6°, R9 65.3° | 63.6 / 39.6 / 65.3 ✔ |
| Free fall from 12 ft at 4 ft/s | 3.652 m/s, 1.50 s | 3.7 m/s, 1.5 s ✔ |
| NSSDC 3.4 m cut-off | 3.54 m/s | ✔ |
| Earth drop for 3.65 m/s | 68.0 cm | 68 cm ✔ |
| Surveyor pad 294.3 kg / 3 × Ø 29.8 cm | 2.279 kPa | 2.2 kPa (Sourcebook) ✔ |
| LM 16,000 lb / 4 × Ø 3 ft | 4.476 kPa | 4.5 kPa ✔ |
| LO smallest object 46 km / 610 mm, 80 mm; 99 km; 40.5 km | 0.99 / 7.57 / 2.14 / 0.87 m | ✔ |
| v_circ(46 km), blur in 1/25 s | 1.658 km/s, 66.3 m | ✔ |
| Intrepid–Surveyor 3 haversine | 156.8 m | 157 ✔ |

- Touchdown speed: Hughes SSD-68223R p. 5.10-14 (best estimate "cutoff at 4 fps … ho of 12 feet; 1.5-second fall; and 12 fps at touchdown"). A separate TD-1 simulation in §5.15 gives 12.2 ft/s. NSSDC says "about 3 m/s" and the JPL release says "about 7.5 miles per hour" (both re-opened). 3.7 m/s is the best-documented value, and the page explains the spread fairly. **Approved as written.**
- **MUST (shared with Educator) — the two footpad margins.** The instrument gives a "safety factor vs Surveyor 5 soil" of ×6 for the LM. Two paragraphs later the Sourcebook gives 600–2,200 for the same pads. The Sourcebook (ch. 9, near Fig. 9.36) says why: "for larger footings, the ultimate bearing capacity is roughly proportional to the width". The 27 kPa also comes from a model fitted to Surveyor's 30 cm pads. *Fixed:*
  - one sentence (EN and RU) after the Sourcebook figure explains the difference;
  - the readout is renamed "MARGIN OVER SURVEYOR 5'S 27 kPa (LOWER BOUND)" / «ЗАПАС ПО 27 кПа «СЕРВЕЙЕРА-5» (НИЖНЯЯ ОЦЕНКА)»;
  - a check was added.
- SHOULD — the k = 8 / 2 kPa/cm bootprint modulus applied to a 0.9 m pad is an extrapolation. The note already says so; nothing to change.
- NIT — in the retro black box, a higher ignition would arrive with a few m/s less speed. This is acknowledged in NOTES.

## 2. Mathematician — APPROVE

- The checks test the code against published numbers (NSSDC times, Hughes, the Sourcebook, PDS), not only against itself. The fitted angle is checked by reproducing the timing to 0.5 s. My independent integrator agrees to 0.1°.
- Units: lb→kg, ft→m and psi→kPa constants are exact. 2.7 N/cm² = 27 kPa ✔.
- My first version of the new check used a ">100×" threshold. The true ratio is 600/6.03 = 99.5, so the check now uses ">90×". This is noted so that nobody "fixes" the threshold back.
- NIT — the LO "smallest object = altitude ÷ (f × 76 lines/mm)" is one film line. The Ranger "4 lines" rule borrows a different (scan-line) criterion from the same PDS file. Both are labelled, so this is acceptable.

## 3. Historian / fact-checker — APPROVE WITH CHANGES

Re-opened today:
- NSSDC Ranger 7, Ranger 9, Surveyor 1, Surveyor 3, Surveyor 5 and Apollo 12 LM: every quoted number matches. This includes "within about 180 meters", the LRO positions, 3.4 m, "about 3 m/s", the 1,300 m / 30 m/s and the 20° slope.
- JPL release of 16 June 1966: 46.75 mi, 2 min 46 s, 38 s, 71.4 mph at 1,000 ft, "free-fell the last 10 feet", "about 7.5 miles per hour" ✔.
- Hughes report (NTRS 19680009187): 42.79 lb, 06:17:35.55, 358,556 lb·s and the best-estimate paragraph ✔.
- Caltech record of Christensen et al. 1968 (authors.library.caltech.edu/51447): 12 authors, initials only. The abstract says "a static bearing capacity of 2.7 newtons/cm^2 gave best agreement" ✔.
- Rummel/Allton/Morrison slides: all facts used are on slides 4–29 ✔. Contemporary coverage (Space.com, May 2011) dates the talk to 2011 ✔.
- Lunar Sourcebook ch. 9: snowshoes, 2.2 kPa, 3,000–11,000 kPa, 600–2,200 ✔.

Findings:
1. **MUST — "Ronald Scott, Leonard Jaffe, Rebecca Jones and nine others".** The paper gives "R. H. Jones" with initials only, and no opened source supports "Rebecca". The sentence also dropped the first author, E. M. Christensen. *Fixed:* "E. M. Christensen and eleven colleagues, among them JPL's Leonard Jaffe and Caltech's Ronald Scott" (EN and RU). Jaffe's full name comes from the NSSDC personnel list, where he is Project Scientist at JPL. Scott is Ronald F. Scott of Caltech (Caltech authors record). A check was added.
2. SHOULD (author query) — "Ranger was JPL's plan". This is uncontroversial history, but no source opened today states it. NSSDC lists JPL technical reports, and JPL's own Ranger 7 page does not say it either. Recommendation for a later pass: cite R. Cargill Hall, *Lunar Impact: A History of Project Ranger*, NASA SP-4210 (1977). This was not added now, to avoid renumbering 31 references on a point no one disputes.
3. SHOULD — "Surveyor, built by Hughes Aircraft for JPL". The JPL release says "under technical direction of the Jet Propulsion Laboratory", which supports the sentence. Fine.
4. NIT (author query) — Ranger impact angles. NSSDC gives only the incoming asymptote relative to the lunar equator (−5.57° for R7, −5.6° for R9). That is not an angle to the local horizontal, and no opened source gives one. The page labels the angles a fit, both in the readout ("PATH ANGLE AT IMPACT (FITTED)") and in the model note ✔.
5. NIT — the LM preset uses a 16,000 lb *design* weight (Rogers TN D-6850). It is labelled as such in the note and in the text, and the Sourcebook's "about 5 kPa" for the real Apollo 11 pads brackets it ✔.

## 4. Science communicator + Educator — APPROVE WITH CHANGES

- Every model is labelled as a model, with its limits: the hyperbola fit, the retro black box, static equal load sharing and a circular orbit. Failures come first, as the brief asked.
- **MUST — the bacteria story.** The text said "Their conclusion: the bacteria were almost certainly picked up on Earth, after the camera came back". The timeline said "conclude the microbe was almost certainly Earth contamination". The slides never claim certainty. Morrison's analysis (slides 24–25) calls contamination during the foam sampling "very real" as a possibility and says the procedure makes it impossible to rule out. Slide 27 opens "Just because we don't believe it…". The current consensus is likely contamination on Earth, with the sampling itself as the leading suspect, not proven contamination. *Fixed* in EN and RU, in both body and timeline: "most likely came from the people handling the camera on Earth, quite possibly during the sampling itself … They did not claim proof … nothing they found supports a microbe surviving on the Moon". A check was added (no "almost certainly"; "very real" is present).
- SHOULD (applied) — "came back in a zipped bag rather than a sealed container" omitted that the camera was sealed in two Teflon bags at the Lunar Receiving Laboratory (slide 12). *Changed* to "travelled home in a zipped sample bag and was sealed in Teflon bags only at the Lunar Receiving Laboratory".
- NIT (applied) — "moments earlier" became "just before" (slide 24 says "Immediately after the camera rotation"). The Russian «за минуту до того» became «незадолго до того».

## 5. Designer + Accessibility — APPROVE WITH CHANGES

- 44 px targets (`.btn` min-height/width, range height 44 px, coarse-pointer thumbs) ✔. Visible focus ✔. Four `aria-live="polite"` status lines ✔. Every SVG has `role="img"` and EN/RU aria labels ✔. All six sliders have `aria-valuetext` ✔.
- There is no animation, so no reduced-motion issue (no rAF or intervals in script.js).
- At 390 px the 480-unit viewBox scales to about 0.75, and the ≤520 px media query raises SVG text to 13/11/14 px (about 9.7 px rendered). Legible.
- **MUST (author query: the "odd last `wide` cell") — 2-column readout grid.** The `wide` flag on the 7th cell of the Ranger and Surveyor panels is correct, because it fills the orphan row. On the Surveyor *crash* presets only 3 rows render, so the third cell left an empty half-row. *Fixed:* `if(rows.length % 2) rows[rows.length-1][2] = 1` before `cells()`. A check was added (crash: 3 cells, last wide; as flown: 7 cells, last wide).
- NIT — paragraph elements carry short placeholder text ("Model note."), and the full copy comes from `data-en`. This follows the site pattern, so it was left alone.

## 6. Russian editor — APPROVE WITH CHANGES

- The Russian reads naturally, with technical terms used correctly (верньеры, РДТТ, коэффициент постели, периселений, грунтозаборник). Units are Cyrillic throughout (checked).
- **Spelling «Сервейер» vs «Сервейор» (author query).** Keep **«Сервейер»**. It is the established Russian rendering (Russian Wikipedia and most Russian space literature use «Сервейер»), and the site already uses it in `tranquility-apollo-program` (EN and RU pages, two places). The only «Сервейор» on the site is one row in `assets/mission-of-day.js` (Surveyor 1, slug luna-programs). That row is the outlier. **The coordinator should change it to «Сервейер-1»** (shared file, outside this panel's remit).
- Fixed together with the MUST edits: «запас прочности» → «коэффициент запаса» (the soil-mechanics term) in the Sourcebook sentence; the new sentences are in parity with the English.
- NIT — «Игла» (Eagle, genitive) matches Russian Wikipedia's «Игл». Fine.

## 7. Ethicist — APPROVE WITH CHANGES

- Credit: the invented first name ("Rebecca") was a fair-credit error in a sentence whose purpose was to credit people. It is fixed (see 3.1). The lead author is now named.
- Honest failures: Rangers 1–6 and Surveyors 2 and 4 are each given their cause, or "still unknown" for Surveyor 4 ✔.
- The bacteria episode is now fair to both sides. Mitchell & Ellis's 1971 report is stated plainly, and the 2011 re-examination is given at the strength its authors used (see 4).
- No living individual is harmed. The unnamed lab worker stays unnamed ✔.

---

## Consolidated MUST-FIX (all applied, all checked)
1. Christensen et al. 1968 credit: no invented first name; lead author named (body EN/RU; check).
2. Footpad margins: explanation sentence plus a "LOWER BOUND" readout label (body EN/RU, script.js; check).
3. Bacteria conclusion: matches the source's strength (body and timeline, EN/RU; check). Also the Teflon-bag detail and "just before".
4. Odd readout cell: full-width when the row count is odd (script.js; check).

## Open SHOULD
- Cite NASA SP-4210 for "Ranger was JPL's plan" (would renumber the references).
- Coordinator: unify `assets/mission-of-day.js` «Сервейор-1» → «Сервейер-1».
- Coordinator: og_cards / structured_data still need a run from the followorbounce.github.io repo (PIL is missing on this Mac; assemble.py warns but writes the page).
