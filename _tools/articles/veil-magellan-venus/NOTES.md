# VEIL — Magellan's radar map of Venus (Wave 5)

**Owner:** Wave 5 author team (2026-10-09). **Category:** `probes`. **Slug:** `veil-magellan-venus`.

## Purpose and audience
A bilingual field guide to how Magellan mapped Venus through its clouds: why radar, how synthetic-aperture
radar gets 120–300 m from a 3.7 m dish, how 243-day cycles built a 98% map, what the craters imply, and the
first planetary aerobraking. For curious non-specialists and students. It complements FURNACE (the Venera/Vega
landers and balloons) and doesn't repeat it.

## Structure
Lede says "Seven chapters" (coordinator's convention for generated guides: every chapter incl. REFERENCES, CH.07/07). Instruments:
1. Resolution ladder (log scale) plus the droplet size parameter / Rayleigh scaling by wavelength.
2. SAR geometry by latitude: altitude, incidence, slant range, echo delay, real-aperture footprint vs 120 m, ground-range resolution.
3. Mapping strips: spacing vs strip width for a chosen latitude/period/width, plus coverage per cycle.
4. Random craters: 946 uniform-on-sphere craters in an equal-area map; counting band with expected ± √N.
5. Aerobraking: constant Δv per pass with periapsis fixed at 197 km; days and passes; propulsive hydrazine comparison.

## Key numbers and where they come from
| Number | Source |
|---|---|
| 12.6 cm / 2.385 GHz, 2.26 MHz, 26.5 µs, beam 2.1° × 2.5°, 88 m slant, 120 m along track | Ford et al. 1993 (JPL 93-24) Table 1-1 [4] |
| Orbit 289 km at 9.5° N, apoapsis 8,458, 85.5°, 3.259 h | [4] Table 1-1; period reproduced to 3.2596 h |
| Cycle 1 incidence angles by latitude (16.5°–45.7°) | [4] Table 4-1 |
| 120–300 m resolution | Beyond Earth [1], NASA [2]; reproduced as 88/sin θ = 123–310 m |
| 1,790 orbits per cycle, 110 lost to conjunction | [4]; reproduced 5,832.6/3.259 = 1,789.7 |
| 25 × 16,000 km strips, ~5 km overlap, 3,453 kg, 132.5 kg hydrazine, Star 48B 2,146 kg | Young 1990 (JPL 90-24) [3] |
| 83.7 / 96 / 98 %, dates, 1,200 Gbit, 85% volcanic | [1], [2] |
| Aerobraking 70 days to 3 Aug 1993, 8,467 → 541 km, 541 × 197 km, propellant ≥10× too small | Griffith et al. 1993 [6] |
| >700 passes, first planetary aerobraking, ~8,000 km drop | Doody 1994 [7] |
| 842 craters / 89%, 1.5–280 km, ~0.5 Ga, 62% pristine, 4% embayed | Schaber et al. 1992 [8] (62% and 4% are in the Crossref abstract) |
| 912 craters at ~98% coverage | Russell & Schaber 1993 [16] |
| Drag passes at ~140 km; 94-min final orbit | JPL news release 10 Aug 1993 [17] |
| ~750 Ma average age (citing McKinnon 1997) | Kane et al. 2019 [18] |
| Surface glow at 1 µm, ~50 km blur | ESA VMC 2007 [19]; WISPR below 0.8 µm: Wood et al. 2022 [15] |
| CSR not rejected, ~500 Ma CRM, ERM end member | Phillips et al. 1992 [9] |
| R, GM, rotation, 92 bar, 737 K | NASA Venus fact sheet [5] |
| Clouds 30–90 km, ~1 µm mode, 75% H₂SO₄ | BIRA-IASB [13] |
| VERITAS 30 m, NET 2031, "in danger" | Planetary Society [10] |
| EnVision launch Nov 2031, 11 months aerobraking | ESA [11] |
| 2023 vent ~2.2 km², 8 months | Herrick & Hensley 2023 [12] |

All 19 reference URLs checked: all return 200 except the JPL 1993 release (403 to curl, readable in a browser fetch) and the three DOIs. The DOIs (AGU ×2, Science) redirect (302) to publisher pages that return 403 to scripts — normal bot blocking, valid DOIs.

## Assumptions and known limitations
- Altitude-vs-latitude treats latitude as the angle from periapsis along the orbit (ignores the 85.5° inclination); gives 2,237 km at the pole vs "about 2,000" [4] / 2,150 at the start of the pass [3], and 2,454 km at 75° S vs "2,400 near 74° S" [3]. Stated on the page.
- Aerobraking model: a constant Δv per pass, periapsis fixed at the final 197 km. At 1.6 m/s it gives 763 passes and 70.7 days, consistent with ">700" and "70 days", but it is a fit, not flown data.
- Propellant comparison: the Isp of 220 s and the in-orbit mass of ~1,100 kg are assumptions (labelled on the page). It gives ≈475 kg against 132.5 kg loaded at launch. The "≥10× too small" claim is NASA's [6], not computed.
- The crater map is uniform-random, not Magellan's real crater positions (labelled). The model uses the published 912 (at ~98% coverage).
- The Rayleigh (a/λ)⁴ figure is for scaling only; visible-light scattering by ~1 µm droplets is in the Mie regime. Microwave absorption by H₂SO₄ vapour is not modelled (stated).
- Surface age: ~0.5 Ga [8][9] and the later ~0.75 Ga [18] are both given. I gave no numeric range because I couldn't read the McKinnon et al. 1997 chapter itself.

## Not verified
- Exact current (Oct 2026) budget status of VERITAS and DAVINCI. The page says only "NET 2031, future uncertain" per the Planetary Society. DAVINCI is not mentioned.
- No browser screenshots (shot.sh was out of scope for this task); layout at 390 px is unverified.

## Wiring (for the integrator)
- Index label EN: `Magellan's Radar Map of Venus` · RU: `Радиолокационная карта Венеры «Магеллана»` · codename `VEIL`, category `probes`.
- llms.txt one-liner: `NASA's Magellan (1989–1994): synthetic-aperture radar at 12.6 cm mapping 98% of Venus at 120–300 m, 243-day mapping cycles, randomly scattered craters and a ~0.5-billion-year surface, and the first aerobraking at another planet; interactive radar geometry, strip-coverage, crater and aerobraking models.`

## Response to review (REVIEW.md, 2026-10-09)

All 5 MUST-FIX items were applied. Rebuilt; `check-all.sh veil-magellan-venus` → ALL OK, now 46 numerical checks, 19 refs.

**MUST-FIX**
1. **"Never seen from orbit":** fixed in the hero lede (EN/RU, as suggested), the quote block (replaced with the panel's corrected wording, an unattributed epigraph rather than a fake quotation), and a new CH1 sentence: Venus Express, Akatsuki and WISPR saw the 1 µm heat glow, blurred to ~50 km. New refs: [15] Wood et al. 2022 (PMC URL verified), [19] ESA VMC 2007 for the 50 km figure. The button now reads NEAR-IR WINDOW 1.0 µm (x = 6.2) and shows a "leaks through, blurred" status. The green-light status was reworded to "clouds show only themselves". Added a check that the claim is gone.
2. **Propellant:** the text now matches Griffith: the full 132.5 kg launch load gives only about a quarter of the needed Δv, and what remained in 1993 was ≥10× too little [6]. The readout is relabelled, and a new readout gives "Δv that full load could give (x % of what was needed)". Checks added: about a quarter (22.7%) at 1,100 kg, 17.6–25.1% across 1,000–1,400 kg, and a rocket-equation round trip.
3. **CH2 label:** "SAR resolution cell: 120 m" / "элемент разрешения РСА: 120 м". Check added.
4. **"Steep look":** reworded as "farther off to the side (a larger, more oblique incidence angle)" in EN and RU. Check added.
5. **Touch targets:** added `extra.css` with 44 px buttons and slider hit areas, focus-visible outlines and the coarse-pointer block from SCORCH/BELT.

**SHOULD/NICE, applied**
- Aerobraking: drag passes flown at ~140 km, verified against JPL's 10 Aug 1993 release [17]. Mentioned in the CH5 text, the model note and the timeline. Check added: 140 vs 197 km changes Δv by 1.04 m/s.
- Burst-mode caveat: the synthetic aperture is now "a few hundred metres to over a kilometre"; burst mode plus ≥4 looks explain why not finer.
- Craters: binomial sd √(N f(1−f)), with checks (15.1 at f = 0.5; 400 throws give 455.6 ± 16.1). "Real Venus craters pass tests of this kind [9]". The model uses 912 [16] (verified, NTRS 19940016252). Added the sentence explaining why random plus pristine is a puzzle.
- Surface age: added "a later review puts the average nearer 0.75 billion years" [18] (Kane et al. 2019, which cites McKinnon 1997; verified in the text).
- RU: ЛЧМ, «некогерентные накопления», «специалисты по управлению полётом», «Херрик», CH3 heading «Планета поворачивается под орбитой».
- The Venera 15/16 figure is 1.2–2.4 km everywhere (text, timeline, fallback), consistent with the ladder and [3].
- Accessibility: `aria-valuetext` on all 7 sliders (from the displayed value; updated on every input/click); RU `aria-label`s via `data-aria-en/ru`; "%" without a space; `.svg-small` darkened to #55554f on this page (≈7.6:1 on white, 6:1 on the tan fills).

**Declined or partly applied**
- **0.3–1 Ga age range:** not added. I couldn't verify it from the McKinnon chapter or any primary text. Secondary sources give 350 Ma–1 Ga, 730 ± 220 Ma, and "factor of two". Only the verified ~750 Ma figure from Kane et al. is on the page.
- **"Funding still uncertain as of late 2026" and the FY2026 cancellation list / DAVINCI $99M:** not added. I couldn't verify them against a primary budget document in this pass. The page keeps "NET 2031, future uncertain" [10], which the panel confirms is accurate. DAVINCI is still not mentioned.
- **"Raised to 197 km at the end":** worded as stated by the panel, from the final orbit [6] plus the 140 km dips [17]. I didn't separately fetch the PDS mission.cat.
- **11 px SVG text:** not changed, because a larger font would overflow the 480-wide SVG labels. Contrast fixed instead.
