# BUCKET — CORONA, Zenit & the first spy satellites (Wave 7)

**Purpose:** a historical, factual account of the first photo-reconnaissance satellites (CORONA/Discoverer, the Soviet Zenit, and the move to digital), with interactives that let the reader work the physics: re-entry and air recovery, ground resolution, panoramic coverage, and the perigee-versus-lifetime trade. Only publicly documented material is used. Nothing is said about later or current classified systems beyond KH-11's 1976 launch date and its role as the first electro-optical satellite, which the NRO has published.
**Audience:** interested non-specialists. Equations sit in eq-boxes.
**Owner:** Wave 7 author (fork), 2026-10-22/23. **Category:** Earth orbit.

## Outline (9 chapters, lede "Nine chapters and four instruments")
1. The gap: U-2 1956–60, Powers on 1 May 1960, CORONA/Discoverer cover. Eq-box: 110 days.
2. Twelve tries: twelve failed launches Feb 1959 – Jun 1960; Discoverer XIII recovered from the sea on 11 Aug 1960; Discoverer XIV caught in the air on 19 Aug 1960. Eq-box: Kepler period vs the announced 94.5 min.
3. The catch (**instrument 1**): retro Δv and orbit height lead to the ellipse, entry at 120 km, an RK4 ballistic entry to 60,000 ft, then parachute descent to the catch window. Outputs are the time-line chart, a Pacific recovery-zone map with the splash point, passes in the window, and the range sensitivity.
4. The camera (**instrument 2**): ground resolution = H/(f·R) vs the Rayleigh diffraction limit, with KH-1…KH-4B presets compared against the USGS best figures. **Instrument 3:** panoramic sweep swath (spherical, flat and H·θ), frame width and edge stretch.
5. Low and short (**instrument 4**): orbit-averaged Gauss drag decay, lifetime against perigee, and KH-4B resolution at perigee.
6. Zenit: Vostok-derived capsule carrying the cameras; Kosmos 4/7; 81 Zenit-2 launches; Yantar-2K and Terilen. Eq-box compares scale (1:246,000 vs 1:250,000). Links to first-vostok-voskhod and almaz-program-ussr.
7. Buckets to bits: last CORONA in 1972 (145 launches, 165 recoveries), KH-11 on 19 Dec 1976, EO 12951 (1995), USGS archive, archaeology (Casana), glaciology (Bolch 2008). Eq-box on scan sampling.
8. Legacy timeline (15 rows). 9. References (16).

## Sources per number
- U-2 1956, Powers 1 May 1960 near Sverdlovsk, "110 days", 7 of 17 orbits over denied territory, more coverage than all U-2 flights, twelve launches Feb 1959 – Jun 1960 (8 with cameras: 4 no orbit, 3 camera/film, 1 spin rockets), recovery sequence, C-119 then C-130, drop tests (33 ft/s available, ~20 ft/s needed, 3–4 passes), recovery zone (nominal impact ~250 mi south of Honolulu, 250 mi N–S, ~550 mi either side E–W), Discoverer XIII ~330 mi NW of Hawaii (Mitchell missed it, ship recovery), Discoverer XIV (17th pass, chute at 60,000 ft, 84 lb, 8,506 ft on the third pass, Capt. Harold E. Mitchell, "Pelican 9", 77.6°, apogee 502 mi, perigee 116 mi, 94.5 min), ground-resolution definition, KH-1 nominal 40 ft, low perigee leading to rapid decay and drag make-up units, 145th and last launch with final recovery on 31 May 1972 (the 165th), EO signed 22 Feb 1995 for >800,000 images, Gore unveiling on 24 Feb → [1] Ruffner (CIA, 1995). PDF opened. Several passages were read from page images because the text layer is OCR with gaps (pp. 12, 14, 21, 24 of the history).
- Best resolutions 40/30/25/25/9/6 ft, 70 mm × 29.8 in frames, stereo 30°, >860,000 images, EO 12951, 7/14 µm scans, free EarthExplorer downloads and $30/frame scanning → [2] USGS (opened 2026-10-22).
- Lowest altitudes 192/252/217/211/180/150 km, film 50–100/120/160 lp/mm, f/5 Tessar → f/3.5 Petzval, 61 cm focal length, pan angle 71.16°, coverage 13.8×188 and 17×232 km, mission life 1 → 19 days, KH-4B period from 15/9/67 → [3] Galiatsatos 2009 (PDF opened).
- 609.602 mm, Tessar → Petzval for chromatic blur, ±15° stereo, KH-1 fixed IMC, design wavelengths 0.5461–0.71 µm (optimum 0.62/0.65) → [4] Dashora et al. 2007 (PDF opened). Its "recovered over the Atlantic" and "29 Feb 1959" are errors and are not used.
- "about two meters" by 1972 → [5] NASM Petzval lens. Discoverer XIII recovered 11 Aug 1960 north of Hawaii, first object from orbit, 73.7 × 47 cm, 136.1 kg → [6] NASM.
- KH-11 KENNEN on 19 Dec 1976, first electro-optical → [7] Space Review (quoting an NRO brochure). "From Buckets to Bits", 17 Nov 2021, >3,000 documents → [8].
- Zenit: [9] en.wikipedia (Gorin 1998 via WP), [10] ru.wikipedia (Ftor-2, 1000 mm "Leningrad-9" ×2 + 200 mm "Orion", 150 km strip from 250 km, ~10 m presumed, 81 launches), [11] en.wikipedia Kosmos 4, [12] Gunter's Space Page launch list, [13] en.wikipedia Yantar.
- Archaeology: ~4,500 known sites → ~10,000 new → [14] National Geographic 2014. Glaciology: Khumbu −5 % 1962–2005 → [15] Bolch et al. 2008 (abstract opened).
- Densities → [16] PDAS USSA-1976 tables. Density was derived as number density × molecular weight / N_A and cross-checked against μ/η. Values above 200 km are the same ones the debris guide uses.

## Computed (checks.js, 60 checks, all pass)
110 days; 187/808 km and a 94.56 min period (0.06 % from 94.5); vacuum integrator conserves energy and angular momentum to 1e-14; entry at 7.73 km/s and −1.63° for 150 m/s from 200 km; peak deceleration ~8.6 g; 6.4 min entry → chute; subsonic (~210 m/s) at 60,000 ft; window 8.1 min at 20 ft/s (3.3 passes) vs 4.9 min at 33 ft/s (2.0); range sensitivity ~26 km per m/s, giving a tolerance of ±7.6 m/s for a 250-mile-deep zone; heading 167°; film-limited GR KH-4B 1.54 m (84 % of USGS 1.83 m), KH-2…KH-4A 90–93 %, KH-1 52 %; f/3.5 aperture 174 mm, lens limit 378 lp/mm, KH-4B diffraction 0.65 m on the ground; scale 1:246,000 vs Zenit 1:250,000; 10 m at 1:250,000 = 25 lp/mm; pan angle 71.14°; frame widths 13.6/16.8 km; H·θ 186/230 km (table 188/232); true swath 216 km; edge stretch 1.23/1.51; density ratios 8.2 and 108; elliptical decay matches the circular integrator within 1.2 %; lifetime ∝ β; UI and aria checks.

## Assumptions / limitations
- Recovery model: tangential retro burn from a circular orbit (the real capsule fired after a pitch-down); 2-D, non-rotating Earth; **assumed** β = 200 kg/m² for the capsule; sink rate referenced at 8,500 ft and scaled √(ρ₀/ρ); drogue phase ignored; the catch window of 15,000–5,000 ft and one pass per 2.5 min are **illustrative assumptions**; the aim point is defined by the default burn (150 m/s from 200 km), not a documented CORONA Δv.
- Map: zone geometry from [1]; Discoverer XIII marker placed 330 statute miles at 315° from Honolulu ("north-west of Hawaii" is approximate); islands are dots.
- Resolution model: a single system lp/mm at nadir, with the low end of Galiatsatos's 50–100 lp/mm for KH-1…KH-4. This is a modelling choice that makes the USGS "best" figures line up. KH-1's shortfall is attributed to fixed IMC and the Tessar per [4]. That is a plausible reading, not a quantified one.
- "Table coverage = H·θ" is **our inference** from the numbers, not stated in [3].
- Orbit lifetime: mean-solar USSA-1976 densities, no make-up burns, and an **assumed** β (default 400 kg/m²), so only the trend matters. 1959–60 was near solar maximum.

## Unverified / reviewer focus
- **Brief said KH-1 ≈ 7.5 m; the published figure is 40 ft = 12.2 m** (USGS and Ruffner). 7.6 m is Galiatsatos's KH-2 value. The page uses 12.2 m.
- Sources disagree on early resolutions: Ruffner says KH-2/KH-3 "10 feet" and KH-4B "5 feet"; USGS says 30/25 ft and 6 ft; Galiatsatos gives ranges. USGS is used throughout.
- Zenit details rely on Wikipedia (tertiary; the primary source is Gorin 1998 in *Eye in the Sky*, not opened). EN and RU WP disagree on 2 vs 4 long-focus cameras, and the text says so. The Kosmos 4 WP article's mission narrative is internally odd (it mentions Starfish Prime), so the page states only the dates and an orientation problem.
- The Gore unveiling on 24 Feb 1995 comes from the CIA book's catalogue description (search result), not the PDF text.
- NRO web pages (nro.gov) returned 403 and could not be opened.
- Screenshots: at 390 px the page is taller than shot.sh's 14,000 px window, so the bottom (part of CH.07 onward) was not captured at that width. The 1300 px capture is complete.

## Freshness
claim | source URL | review-by
--- | --- | ---
USGS EarthExplorer: existing CORONA scans free to download, on-demand scans $30/frame (as of October 2026) | https://www.usgs.gov/centers/eros/science/usgs-eros-archive-declassified-data-declassified-satellite-imagery-1 | 2027-10-01

## Wiring (for the coordinator)
- Codename `BUCKET`, category Earth orbit. EN label: `CORONA, Zenit & the First Spy Satellites`. RU label: `CORONA, «Зенит» и первые спутники-разведчики`.
- llms.txt: `The first spy satellites: CORONA's twelve failures before Discoverer XIV's film was caught in mid-air on 19 Aug 1960, a retro-burn → re-entry → parachute → air-catch model with the Pacific recovery zone, ground resolution from focal length, film lp/mm and altitude checked against KH-1…KH-4B (12.2 m → 1.8 m), panoramic swath, the low-perigee lifetime trade, the Soviet Zenit, KH-11 (1976) and the 1995 declassification.`
- MOD.json: 3 candidate rows (1960-08-11, 1960-08-19, 1962-04-26), with no dates duplicated in mission-of-day.js.

## Response to review (2026-10-23)
See REVIEW.md. The six MUST-FIX items are applied in the sources, the page is rebuilt, and `./check-all.sh bucket-corona-spy-satellites` gives ALL OK with 63 checks (3 new).
1. **Resolution conflict now shown on the page.** Ch. 4 now gives the CIA 1995 introduction's KH-2/KH-3 "10 feet" and KH-4B "5 feet" [1] and Galiatsatos's 7.6 m (KH-2) and 1.8–7.6 m (KH-4B) [3], and says why the USGS list is used. The eq-note says the low end of 50–100 lp/mm is what makes the model match USGS. The notes of refs [1] and [3] are updated (EN + RU).
2. **KH-1 cause hedged** in the body and the status: "the sources do not say why". Likely contributors are the fixed-altitude IMC and the acetate film [4]. The Tessar alone cannot explain it, because KH-2 had the same lens. Ref [4]'s note now lists the acetate base and the 2.18 × 29.8 in format.
3. **Discoverer XIII:** "a Navy ship's helicopter lifted it" → "a Navy recovery ship fished it out of the sea" (CIA p. 21–22: "A ship reached the scene before the capsule sank and fished it out of the ocean").
4. **Heading** "two firsts in nine days" → "eight days" (11 → 19 Aug).
5. **Zenit cameras:** "two or four" → two at first, later three (RU WP, «Фтор-2Р») vs four on most flights (EN WP). Ref [10]'s note is updated.
6. **KH-4A 185 km** is no longer attributed to Galiatsatos (the table says 180 km); it is labelled as the altitude that reproduces the coverage. The 2.18 in film width is now cited to [4].
Also applied: "13 %" → "14 %"; two Russian grammar fixes («большую площадь…», «в H/f раз…»).

**Resolved flags.**
- The Gore unveiling on 24 Feb 1995 is in the PDF text of [1] itself (Foreword).
- nro.gov still returns 403, but the archived NRO Fact Sheet (2009) at https://webarchive.library.unt.edu/web/20090813044320id_/http://nro.gov/NRO_Fact_Sheet.pdf confirms 145 missions, over 800,000 images and declassification in 1995.
- The 390 px page was captured in full (22,679 px) with `shot.sh … 390 30000` and checked from CH.07 to the end.

**Open (SHOULD):**
- the edge stretch is flat-Earth (label it or compute it on the sphere);
- the "only ±N m/s" wording at extreme burns;
- use Galiatsatos's 5.265° aperture width for the frame width (it reproduces 13.8/17.0 km exactly);
- mention 8,506 ft once;
- RU «НРУ» → the full Russian name of the NRO.
