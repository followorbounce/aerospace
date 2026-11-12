# FOOTING — Ranger, Surveyor & the ground under Apollo (Wave 8)

**Purpose:** explain how the robotic precursors (Ranger 1–9, Surveyor 1–7, Lunar Orbiter 1–5) answered "what is the surface like, and will it hold a lander?" before Apollo 11, through the history (failures first) and four pieces of physics the reader can manipulate. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes.
**Owner:** Wave 8 author (agent), 2026-11-12. **Category:** moon. Neighbours not duplicated: `luna-programs` (Luna 9/13, Soviet side; Luna 9 mentioned once here), `tranquility-apollo-program` (Apollo 12's 535 ft from Surveyor III is there; this guide adds the LRO-position distance and the camera/bacteria story), `scout-lunar-reconnaissance-orbiter` (LRO; used here only as the source of impact/landing positions), `rabbit-change-far-side`.

## Outline (8 chapters, lede "Eight chapters and four instruments")
1. Six tries — Rangers 1–6, each failure; eq-box impact speed v² = v∞² + v_esc² (v∞ printed live, 1.10 km/s).
2. The last seventeen minutes — Rangers 7–9; **instrument 1** (rg): scan-line footprint vs seconds before impact on a two-body hyperbola; mission (R7/R8/R9), camera (A 25°/1150, B 8.4°/1150, P 2.1°/300), time slider (log, 0.2 s → first picture), presets; readouts altitude, distance to impact point, speed, picture width, one line, smallest object (4 lines), fitted path angle.
3. Three minutes to touchdown — Surveyor 1's descent; **instrument 2** (sd): speed vs altitude, retro ignition altitude slider (60–100 km) + vernier cut-off height slider; presets as flown / 6 km late (crash) / 15 km early (runs out of propellant); readouts retro-phase end, deceleration needed vs available, propellant used vs budget, ignition-to-touchdown time, touchdown speed, Earth-drop equivalent. Then Surveyors 2, 3 (bounces), 4, 5 (helium leak), 6 (hop).
4. Will the LM sink? — design soil (1964 spec), Surveyor pads, sampler, Surveyor 5 bearing capacity; **instrument 3** (ft): pad pressure vs diameter, mass + diameter sliders, 3/4 legs, k = 8 or 2 kPa/cm; readouts lunar weight, pressure (kPa, psi), safety factor vs 27 kPa, static sinkage. LM 4.5 kPa, Sourcebook factor 600–2,200, Apollo 11 penetration 0.5–1.5 in.
5. Maps for Apollo — Lunar Orbiter; **instrument 4** (lo): smallest object vs altitude for 610/80 mm lenses, altitude slider + presets (40.5, 46, 99, 1,850 km); readouts objects, frame sizes, circular speed, blur in 1/25 s without image-motion compensation.
6. A visit to Surveyor 3 — Apollo 12, camera retrieval; eq-box haversine distance from LRO positions (157 m, printed live); the S. mitis story and the 2011 re-examination.
7. Legacy — timeline 1961–2011 (10 entries) + quote (21 robots, 8 lost or blind).
8. References — 31 sources.

## Sources per number (retrieved 2026-11-12)
- Rangers 1–6 dates, failure causes, 36,800 km, 725 km, 9,600 km/h, far side 26 Apr 1962, Ranger 6 arc-over 67 s, $170 million — NSSDC pages [1]–[6] (HTML fetched and grepped).
- Ranger 7/8/9: first-image altitude and UT, impact UT, impact speed, picture counts, final resolutions 0.5/1.5/0.3 m, Ranger 8 terminal manoeuvre cancelled, Ranger 9 cameras aligned with flight direction, live TV — NSSDC [7][9][10]. Cameras: A 25° 25 mm, B 8.4° 76 mm, 1,150 lines, 2.5 s scan; P 300 lines, 0.2 s scan, fields to 2.1°; last P picture 0.2–0.4 s before impact; PI Kuiper + Shoemaker, Whitaker, Urey, Heacock — NSSDC experiment page [8].
- Surveyor 1: 75.3 km, 2,612 m/s, 40 s, ~11 km, 110 m/s, 3.4 m cut-off, ~3 m/s, 294.3 kg, verniers 130–460 N, 11,240 pictures, $469 M — NSSDC [11]. 46.75 mi, 2 min 46 s, 38 s, 71.4 mph at 1,000 ft, last 10 ft free fall, ~7.5 mph — JPL release 16 June 1966 [12]. Total impulse 358,556 lb·s, Isp 288.4 s, max thrust 9,850 lb, motor 1,386 lb, vernier-phase initial 27,820 ft / 430 ft/s / 727.6 lb after 54.68 s, retro ignition 06:14:48.558, touchdown 06:17:35.55, best estimate cut-off 4 ft/s at 12 ft, 1.5 s fall, 12 ft/s, 10 ft/s mark at 43 ft, 42.79 lb usable left — Hughes SSD-68223R vol. 3 [13] (PDF from NTRS 19680009187, text extracted with pypdf; pages 5.8-1–5.8-4, 5.10-14, 5.15-17–5.15-21).
- Surveyors 2–7 facts — NSSDC [14]–[19].
- 2.7 N/cm² (Surveyor 5), author list incl. R. H. Jones — Christensen et al. 1968 JGR [20] (Caltech record abstract).
- 2.2 kPa Surveyor pad design, LM ~5 kPa, ultimate 3,000–11,000 kPa, factor 600–2,200, k = 8 / 2 kPa/cm, 1.5 g/cm³ (Christensen 1967), early 0.3–0.4 g/cm³ estimates, snowshoes/antenna — Lunar Sourcebook ch. 9 [21] (PDF, text extracted).
- 1964 LM design soil (1.0 psi → ≤ 4 in; 12 psi → ≤ 24 in), pads ~3 ft, 16,000 Earth lb design weight, Apollo 11 penetration 0.5–1.5 in, specification verified by Surveyor/Lunar Orbiter — Rogers 1972 TN D-6850 [22] (NTRS 19720018253, extracted).
- Surveyor pad 29.8 cm (11¾ in), backup pads identical to the five landed Surveyors' — NASM [23] (catalogue page fetched 2026-11-12).
- Lunar Orbiter 1: 10 Aug 1966, 40.5 km, 42 + 187 frames, first Earth pictures — NSSDC [24]. LO5: 99 km, 99 %, 2,180 + 882 frames, "down to 2 meters", $163 M, Langley — NSSDC [25]. Lenses 610/80 mm, 70 mm film, 1 m and 8 m from 46 km, 76 lines/mm, 4-scan-line rule, shutters, IMC, frames 4.15 × 16.6 and 31.6 × 37.4 km at 55 km, ~1,850 km apolune — PDS catalogue [26].
- Apollo 12: 06:54:35 UT 19 Nov 1969, LRO position, "within about 180 m", EVA-2 visit, ~10 kg parts — NSSDC [27]; camera at NASM, Surveyor 3 LRO position — NSSDC [15].
- Bacteria: Rummel, Allton & Morrison 2011 slides [28] (PDF extracted): ~163 m, sampling from 8 Jan 1970, 32 of 33 / 10 of 11, foam sample last, S. mitis found on crew, no negative control, short sleeves, zipped pack, ~70 °C, no viable microbes from any Apollo surface sample, Mitchell & Ellis 1971 citation, "lessons" slide.
- Moon radius 1,737.4 km, g 1.62, v_esc 2.38 — NSSDC fact sheet [29]; GM 4,902.800118 — JPL SSD [30]; Luna 9 "first survivable landing", Feb 1966 — NASA Science [31].

## Computed (checks.js, 64 checks, all PASS)
v_esc 2.3757 km/s; v∞(2.62) = 1.105; first-picture-to-impact 17.06/23.08/18.65 min; fitted path angles 63.6° / 39.6° / 65.3°; 4-line object at 0.3 s 0.38 m (R7, published 0.5) and 0.39 m (R9, published 0.3); B and P per-line field within 5 %; 46.75 mi = 75.24 km; T_actual 166.99 s; DH_retro 66.82 km; free fall from 12 ft at 4 ft/s → 3.652 m/s in 1.50 s (Hughes 12 ft/s, 1.5 s); NSSDC 3.4 m → 3.54 m/s; Earth drop 68 cm; effective vernier Isp 275.3 s; best vernier braking 2.561 m/s²; as flown 177.6 s and 37.6 kg (actual 167 s, 35.7 kg); window 70.28–83.70 km; Surveyor pad 2.279 kPa; LM 4.476 kPa; LM/Surveyor ≈ 1.96, LM/27 kPa ≈ 0.166; sinkage 0.56 / 2.24 cm; LO 0.992 m and 7.57 m at 46 km, 2.14 m at 99 km, 0.87 m at 40.5 km; v_circ(46 km) 1.658 km/s, blur 66.3 m (×67); Apollo 12–Surveyor 3 157 m; 2.59 years on the Moon; UI presets without NaN in EN/RU; aria-valuetext on all six sliders.

## Assumptions / limitations
- Instrument 1: two-body hyperbola; the path angle is a **fit** to NSSDC's first-picture timing, not a published value. Camera assumed to look at the impact point (true-ish for Ranger 9; Ranger 8's cameras were oblique, so its 1.5 m is coarser than the model, which is said). "Smallest object" = 4 scan lines, borrowed from Lunar Orbiter's specification [26], not a Ranger specification. Frame sizes of the vidicons (11 mm, 2.8 mm) inferred from NSSDC's "11 sq mm"/"2.8 sq mm" (read as the side of a square; the focal lengths then reproduce the stated fields) — only used in checks.
- Instrument 2: the retro phase is a black box between NSSDC's ignition point and Hughes's vernier-phase start (fixed 66.8 km drop; ignoring the few m/s by which a higher ignition would meet the Moon slower); a first attempt to model the retro burn from total impulse and Isp ended ~2–4 km too high (thrust curve and geometry), so it was dropped. Verniers decelerate uniformly between published contour points; best braking uses the vernier-phase starting mass (conservative). Effective vernier Isp 275 s is derived from Surveyor 1's own masses and times. NSSDC's "jettisoned at roughly 11 km and 110 m/s" and Hughes's "27,820 ft at 430 ft/s" are different instants; both are quoted.
- Instrument 3: static, equal load sharing; k from bootprints (< 0.5 m loads) extrapolated to ~1 m LM pads (said in the note). LM preset uses Rogers's 16,000 lb design weight, not an actual landed mass.
- Instrument 4: circular-orbit speed (real orbits elliptical); film resolution 76 lines/mm is the requirement, not the measured system performance.
- Russian names: «Сервейер» (the common Russian spelling). Note: `assets/mission-of-day.js` already spells Surveyor 1 as «Сервейор-1»; the coordinator may want to unify.

## Unverified / judgment calls
- The brief's "3.4 m/s touchdown": no primary source gives exactly that. Hughes's best estimate is 12 ft/s (3.66 m/s); NSSDC says cut-off at 3.4 m and "about 3 m/s"; JPL says "about 7.5 mph" (3.35 m/s). The page gives 3.7 m/s and explains the spread.
- "Ranger was JPL's plan": JPL management of Ranger is standard history, but no opened source states it explicitly (NSSDC references JPL reports; Heacock is JPL). Kept.
- Surveyor 3 bearing values from the surface sampler (2–6 N/cm², reported in a search snippet) not used — source not opened.
- Ranger impact angles: not found in any opened source; the guide uses fitted angles and labels them.
- Surveyor 1 "first hour of engineering tests", Luna 9 coordinates: not used.
- The 2011 slides say the 16 mm films were found "last year" (i.e. ~2010); the page just says the films were re-examined.
- assemble.py tried to run `../followorbounce.github.io/engine/og_cards.py`, which failed (no PIL on this Mac); the page was written anyway. The coordinator should run og_cards / structured_data from that repo.

## Freshness
claim | source URL | review-by date
--- | --- | ---
Surveyor 3's camera is on display at the National Air and Space Museum | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A | 2028-11-12
Impact/landing positions "as determined from LRO images" (Rangers 6–9, Surveyors, Apollo 12 LM) — could be refined | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C | 2028-11-12
NASM Surveyor footpad object record (diameter 29.8 cm) | https://airandspace.si.edu/collection-objects/pad-landing-leg-surveyor/nasm_A19721105000 | 2028-11-12
Rummel/Allton/Morrison slides hosted at smd-cms.nasa.gov (link rot risk) | https://smd-cms.nasa.gov/wp-content/uploads/2023/04/A_Microbe_on_the_Moon_TAGGED.pdf | 2027-11-12

## Wiring (for the coordinator)
- Index label EN: `Ranger, Surveyor & the Ground under Apollo` · RU: `«Рейнджер», «Сервейер» и грунт под «Аполлоном»` · codename `FOOTING`, category moon.
- llms.txt: `How robots answered "will the Moon hold a lander?" before Apollo: Ranger 1–6's failures and Ranger 7–9's impact cameras (scan-line footprint vs seconds to impact on a two-body hyperbola), Surveyor 1's terminal descent from its Hughes flight report (retro ignition window, vernier contour, 12-ft free fall to 3.7 m/s), footpad pressure vs the 2.7 N/cm² Surveyor 5 soil and the 1964 LM design soil, Lunar Orbiter's 1 m from 46 km and image-motion compensation, and Apollo 12's visit to Surveyor 3 with the Streptococcus mitis story re-examined.`
- MOD.json: 4 rows (Ranger 7, Ranger 9, Lunar Orbiter 1, Surveyor 3); Surveyor 1 and Luna 9 are already in the widget (slug luna-programs).

## Response to review (2026-11-12, independent panel — see REVIEW.md)
- MUST 1: "Ronald Scott, Leonard Jaffe, Rebecca Jones and nine others" → "E. M. Christensen and eleven colleagues, among them JPL's Leonard Jaffe and Caltech's Ronald Scott". The paper gives R. H. Jones by initials only, so "Rebecca" was unsupported. EN + RU; check added.
- MUST 2: added one sentence explaining why the instrument's ×6 against Surveyor 5's 27 kPa differs from the Sourcebook's 600–2,200: ultimate bearing capacity grows roughly with footing width (Sourcebook ch. 9), and the 2.7 N/cm² was fitted to 30 cm pads. The readout is renamed "MARGIN OVER SURVEYOR 5'S 27 kPa (LOWER BOUND)". «запас прочности» → «коэффициент запаса». Check added.
- MUST 3: the bacteria conclusion no longer says "almost certainly" (body and timeline). It now says "most likely … on Earth, quite possibly during the sampling itself; they did not claim proof", quoting Morrison's "very real" possibility. Also: the camera was sealed in Teflon bags at the LRL, and "moments earlier" → "just before". Check added.
- MUST 4: the Surveyor readout gives the last cell the `wide` class whenever the row count is odd (the crash preset has 3 rows). The existing `wide` on the 7th cell of the Ranger and Surveyor panels was correct (it fills the orphan row). Check added.
- Spelling: the panel confirms «Сервейер». The site's only «Сервейор» is in assets/mission-of-day.js, which the coordinator should unify.
- Left as SHOULD: an SP-4210 citation for "Ranger was JPL's plan" (it would renumber 31 references for an undisputed point).
- Checks: 68 PASS; ./check-all.sh footing-ranger-surveyor = ALL OK.
