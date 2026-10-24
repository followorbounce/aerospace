# REVIEW — FORECAST (TIROS, GOES, Meteosat & weather from orbit)

**Date:** 2026-10-23 · **Panel:** independent cross-disciplinary review (AGENTS.md: Cross-Disciplinary Review and Peer Review)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Every computed number re-derives independently. The panel read the official ABI grid figures straight from a GOES-19 Level 1b file. They confirm 56/28/14 µrad, but they also show that the GOES-East fixed grid is centred on **75.0° W**, not on the satellite's 75.2° W. There are six MUST-FIX items: that grid origin and the official grid step; three factual or citation fixes in the prose (the Nimbus end date, the AMV attribution, and the two uncited microwave sentences); and two label collisions at 390 px. All six have been applied in the sources and re-checked: `./check-all.sh forecast-weather-satellites` → **ALL OK** (50 checks).

Scripts and data: `/tmp/claude-1000/-home-none-git/98d54dca-fa8e-4aef-8d4f-2f576b4a6497/scratchpad/review-forecast/`. `phys.py` holds the independent re-derivation. `h5.py` plus `data/` hold three GOES-19 ABI L1b mesoscale files (bands 1, 2, 13; 17 Oct 2026 12:00 UTC, from NOAA's public AWS bucket). `shot-tall.sh` is a copy of `shot.sh` with a taller window, and its tiles are in `shots/`.

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

Independent re-derivation (Python, scipy `quad` for the Stefan–Boltzmann integral):

| Quantity | Reviewer | Page |
|---|---|---|
| r_GEO from μ = 398,600.4418, T = 86,164.0905 s | 42,164.17 km; h = 35,786.03 km = 22,236.4 mi | 42,164 / 35,786 ✔ |
| Limb arc; visible fraction | 81.300°; 42.437 % | 81.3°; 42.4 % ✔ |
| ψ at zenith 70°; cap fraction | 61.828°; 26.39 % | 61.8°; 26.4 % ✔ |
| N–S stretch at 60° on the meridian (sphere) | × 2.945 (zenith 68.07°) | × 2.94 ✔ |
| NOAA-21 at 824 km: period, orbits/day | 101.380 min; 14.204 | 101.4; 14 ✔ |
| Track shift per orbit | 25.414° (sidereal) / 25.345° (solar day) | 25.4° ✔ (both round the same) |
| Equatorial track spacing; looks/day at 0° | 2,818 km; 2.129 | 2,820; 2.1 ✔ |
| Latitude where the one-per-orbit cap takes over | 81.4° | — (consistent with the curve) |
| ABI grid step, **official** (L1b `x/y scale_factor`) | **5.6e-05 / 2.8e-05 / 1.4e-05 rad** | page derived 55.9 µrad from 2 km ÷ h (see finding 1) |
| Same step at 824 km | 46.1 m | 46 m ✔ |
| Footprints on the official grid (56 µrad, origin 75.0° W) | nadir 2.00 × 2.02; Kansas **2.39 × 3.14**; 60° N 2.20 × 5.88; Reykjavik 7.45 × 18.6; Miami 2.05 × 2.38 km | 2.4 × 3.1; 2.2 × 5.9; 7.5 × 19 ✔ |
| Same, author's grid (55.9 µrad, origin 75.2° W) | Kansas 2.385 × 3.129; Reykjavik 7.53 × 18.76 | — |
| Fixed-grid round trip | 4e-12° | < 1e-9 ✔ |
| c₁, c₂ from exact SI | 1.1910430e-5 mW m⁻² sr⁻¹ cm⁴; 1.4387769 cm K | ✔ |
| ν(10.3 µm); B(ν, 300 K) | 970.874 cm⁻¹; 104.565 mW/(m² sr cm⁻¹) | 970.9; 104.56 ✔ |
| π∫B dν / σT⁴ at 300 K | 1 − 3e-11 | to 1e-5 ✔ |
| Half-cloudy 8 km pixel: T_b, apparent height, split window | 266.373 K; 3.350 km; +0.978 K | 266.4; 3.35; +0.98 ✔ |
| Anvil 217 K → height; stratus 282 K → height | 10.95 km; 0.95 km | "about 11"; "about 1" ✔ |
| TIROS 1 Apr → 18 Jun 1960; 450 mi | 78 days; 724 km | 78; "720" ✔ |

The checks are genuine. They test against published values (NOAA 22,236 mi, "14 times a day", twice-daily coverage, CIRA's 2.4 × 3.2 km, NASA's 6.49 K/km, NIST σ), and now also against the L1b header. They do not test the code against itself, except for the exact-inverse round trips, which is legitimate.

Findings:
1. **MUST — the fixed grid is centred on 75.0° W, and its step is the official 56 µrad, not 2 ÷ 35,786.** The author could not get the PUG, so the reviewer read the netCDF headers of three GOES-19 ABI L1b files instead. All three give `goes_imager_projection: longitude_of_projection_origin = −75.0`, `perspective_point_height = 35,786,023 m`, GRS80 semi-axes 6,378,137 / 6,356,752.31414 m, and `nominal_satellite_subpoint_lon = −75.2`. The `x/y scale_factor` is 5.6e-05 rad for band 13, 2.8e-05 for band 1 and 1.4e-05 for band 2. The page projected its grid around 75.2° W, described the satellite as "over 75.2° W" in the "exact projection" note, and used 55.9 µrad. The rounded results barely move (Kansas 3.13 → 3.14 km; Reykjavik 18.8 → 18.6 km), but the page calls the projection "exact", so its parameters must be the real ones. **Fixed:** `ABI_STEP` / `abiStep()` hold 14/28/56 µrad; `GOES_EAST = −75.0` with a comment; the chapter-4 text now says the files give the step, and that 2 km ÷ 35,786 km = 55.9 µrad means the kilometre figures are the rounded ones; the eq-note and the instrument note now name the 75.0° W grid centre. New ref [40] is the L1b file, with the header values quoted. There are three new checks (file steps, the 0.3 % nominal-vs-file gap, the grid origin), and the Reykjavik check is tightened to 7.45 × 18.6.
2. **OK — Kansas 3.14 vs CIRA 3.2 km.** CIRA's page (opened) says "approximately 2.4 x 3.2 km resolution at the Kansas location (2 x 2 km at sub satellite point)". The figure comes from a simulation that applied "the anticipated point spread function (PSF) for GOES-R ABI", with the satellite at 75° W. A PSF-blurred effective footprint should be a little larger than the grid-cell size. The page already says that optics blur each pixel beyond its grid spacing, so the 2 % gap is explained, and the page states it correctly as "about 2.4 × 3.1 … CIRA … 2.4 × 3.2".
3. **OK — the 70° "usable" limit is labelled as a choice.** The eq-note says: "The 'usable' limit is a choice, not a standard: forecasters still look at images beyond 70°…". The slider default and the readout ("GEO usable at this limit") follow from it.
4. **SHOULD (applied) — the polar looks/day formula ignores swath obliquity.** 2 × n × swath ÷ parallel length treats the swath as if it crossed the parallel at right angles. At high latitude the ground track runs nearly east–west, so the swath's intercept along the parallel is longer. The formula therefore *underestimates* looks there until the one-per-orbit cap takes over at 81.4°. The note already gave the clustering caveat; **added**: "it also ignores that at high latitude the swath crosses the parallel obliquely, so it underestimates looks there before the one-per-orbit cap takes over" (EN + RU).
5. **OK — instrument 3 has no absorption.** The note says "no gas absorption". The clear-sky preset therefore reads 288.15 K, a few kelvin warmer than a real humid-tropics 10.3 µm clear-sky T_b. The split-window "third cause" is honestly labelled as Planck curvature only. NICE: one clause, "in real moist air the clear-sky reading is a few kelvin colder than the ground", would stop readers taking the clear-sky value as realistic.
6. **NICE** — `trackShiftDeg` uses the sidereal day. For a sun-synchronous orbit the shift relative to the Sun-fixed pattern is 360° × P / 86,400 s = 25.34°. Both round to 25.4°, so nothing visible changes.

## 2. Historian / fact-check — APPROVE WITH CHANGES

Opened today and confirmed (✔):
- NSSDC TIROS-1: 122.5 kg, launch 1960-04-01, "performed normally… until June 15, 1960". NOAA: "lasting only 78 days, it sent back 19,389 usable images". NASA EO: two cameras, "about 450 miles below", first image "frame 2" shows the Red Sea.
- NSSDC Nimbus table: Nimbus 1 1964-08-28 … Nimbus 3 1969-04-14 … **Nimbus 7 1978-10-24** (see finding 1). CIRA: SIRS "put into operational use on 24 May 1969". Skyrocket: Kosmos 44 28.08.1964, inclination 81–82°.
- NOAA ATS-1: "9:12 p.m. Eastern on December 6, 1966", line by line "in less than 30 minutes", first full disk "December 11, 1966". SSEC: "The weather moves, not the satellite"; the film "in January 1967"; 20-minute full disks. NSSDC: launch 1966-12-07, "151.16 deg W".
- Skyrocket: SMS 1 17.05.1974, GOES 1 16.10.1975, VISSR. ESA: Meteosat-1 "13:35 GMT on 23 November 1977", first image 9 December, the first geostationary water-vapour channel, full disc every 30 min.
- NOAA ABI scan-mode page: mode 6 from "on or about April 2, 2019", 10-min full disk, CONUS every 5 min, two 1000 × 1000 km meso boxes every 60 s or one every 30 s; band 13 "Clean" 10.3 µm, band 15 "Dirty" 12.3 µm; 0.5 km band 2, 1 km bands 1/3/5, 2 km the rest. GLM: 777.4 nm, 2 ms frames ("500 images… every second"), 8 km nadir / 14 km edge, to 52° N.
- NOAA GOES-19 operational release: 7 April 2025, 75.2° W, 22,236 miles, launch 25 June 2024. OSPO status (as updated 3 Sep 2026): GOES-19 East 75.2° W; GOES-18 West 137.0° W since 4 Jan 2023; GOES-16 storage at 104.7° W. No spacecraft anomaly listed. The page also notes product-distribution outages in Sep–Oct 2026, which do not need mentioning. NASA: GOES-R launch months.
- WTOP (16 July 2026, a Thursday): GOES-19 "entered what's known as safe hold mode", the outage "lasted nearly the entire day", "returned to service in less than 24 hours", cause unclear. So the outage date is **16 July 2026**. "Mid-July… nearly a whole day" is correct; SHOULD: the exact date could be given.
- Met Office (Wed 4 Dec 2024): MTG-I1 becomes Meteosat-12, full disc every 10 min, 500 m to 1–2 km, first lightning imager for the region. ESA (15 July 2026): MTG-S1 commissioning closed 2 July 2026, at 0°, IRS over Europe every 30 min, Sentinel-4 hourly, MTG-I2 at 9.5° E every 150 s. ESA: MTG-I2 on Ariane 6, 27 Aug 2026, 22:10 CEST.
- JMA: Himawari-8 operations 7 July 2015; switch to Himawari-9 on 13 December 2022. WMO: FY-4C at 0:07 on 27 Dec 2025 (Beijing time), to replace FY-4A and work with FY-4B.
- NOAA JPSS: "14 times a day", "full global coverage twice daily", "provide the majority of data", JPSS-4 "to be renamed NOAA-22", next to launch, readiness 2027. OSCAR: NOAA-21 824 km, 13:25 asc; VIIRS swath 3000 km, 375/750 m; Metop-SG-A1 835 km, 09:30, status "Commissioning" (updated 2026-08-24); Meteor-M N2-4 820.7 km, operational. ESA (20 Oct 2026): MetOp-SG-B1 arrived 16 October, Ariane 6 launch "expected at the end of the year", "three successive pairs", scatterometer / microwave imager / ice cloud imager.
- ECMWF (Cardinali & Healy 2012, PDF): "The largest contribution in decreasing the forecast error is provided by AMSU-A radiances (~21%)"; "Atmospheric Motion Vectors (AMVs) from all the various platforms (MODIS, Meteosat and GOES) make a useful contribution to the 24-hour error reduction (6%)"; June 2011 (see finding 2).
- AOML Dvorak FAQ: warm eye vs cold cloud tops, "the larger the difference, the more intense" ✔. ABI Band 15 Quick Guide: moist air positive, dust negative ✔.

Findings:
1. **MUST — "seven research satellites flown until 1978" is wrong.** Nimbus 7 was *launched* on 24 October 1978 (NSSDC [5]) and flew for many years after that. **Fixed:** EN "launched between 1964 and 1978"; RU «запущенных с 1964 по 1978 год». Added a check.
2. **MUST — the 6 % AMV share is not "from geostationary images".** ECMWF's 6 % covers AMVs "from all the various platforms (MODIS, Meteosat and GOES)", and MODIS polar winds are part of it. **Fixed:** "cloud-motion winds tracked in satellite images (geostationary, and polar near the poles) added 6 %" (EN + RU). In the same sentence, NOAA's "majority of data" is said of the JPSS satellites, not of "polar sounders". Reworded to "NOAA's polar satellites provide 'the majority of data'… in the agency's own words".
3. **OK — the fleet status is not stale.** No source shows a Sentinel-4 public data release yet, and the page claims none (it states only the hourly design, per ESA). NOAA's own page still names JPSS-4 as next (2027). NASA's pairing of "2027 and 2032" and Skyrocket both put JPSS-3 at 2032, so the page's dated NOAA wording is the safe one. SHOULD: the NOTES freshness row could add "JPSS-3 ~2032". GOES-19's safe hold: 16 July 2026 (WTOP), consistent with "mid-July".
4. **SHOULD** — ref [17] is cited for the hurricane meso box in chapter 7, but it does not mention hurricanes. [14] alone supports the cadence.

## 3. Science communication & Education — APPROVE WITH CHANGES

The guide teaches well. Each instrument answers a question the prose has just raised (why a GEO pixel stretches; why polar orbiters still matter; how a temperature becomes a height and where that breaks). The statuses explain each state in words, and the limits of the models are stated beside the instruments.

1. **MUST — two qualitative microwave sentences had no citation** (the author flagged them). **Fixed** with new ref [41], NOAA's ATMS page: "ATMS observes Earth in the microwave portion of the electromagnetic spectrum, which allows it to see through clouds"; "provides a view inside and below clouds and can be used to produce images inside storms, including hurricanes"; "all-weather… temperature and moisture data… three-dimensional atmospheric profiles". EN now reads: "Microwaves pass through most clouds, so a microwave sounder gives temperature and moisture profiles in almost any weather [41]" and "Polar microwave sounders then look inside the storm, below the cloud tops that hide it in the infrared [41]." RU matches. The oxygen-band and eyewall specifics were dropped because no opened source stated them for these instruments.
2. **SHOULD** — the LEGACY heading "Sixty-six years of watching the sky from above" → "watching the weather from above" / «Шестьдесят шесть лет наблюдения за погодой сверху». The satellites look down at the weather, not up at the sky.
3. **NICE** — the latitude readout rounds to whole degrees, so the ARCTIC CIRCLE 66.6° preset shows "67°". Use one decimal place, as instrument 2 does.

## 4. Design, UX & Accessibility — APPROVE WITH CHANGES

Screenshots: the official tiles were retaken with `shot.sh` at 1300 and 390. Both widths stop at the 14,000 px window, which at 1300 px also cuts off references [31]–[41], not only at 390 px. Full-length captures from the reviewer's copy with a taller window (`shot-tall.sh`: 390 → 26,119 px, 1300 → full length) show the end of the timeline, the closing quote and all 41 references rendering cleanly at both widths. All sliders carry `aria-valuetext` with units (latitude, viewing angle, altitude, lat/lon with N/S/E/W, cloud height with K/°C, coverage %). Button groups have translated `aria-label`s and `aria-pressed`. Statuses are `aria-live`. There is no animation, so nothing to reduce. `.btn` is ≥ 44 px and the range inputs are 44 px high with focus-visible outlines.

1. **MUST — label collisions at 390 px.** In instrument 1, "one polar orbiter (average gap)" ran into "too oblique" ("…gap)too oblique"). In instrument 2, "one pixel, to scale (12 km box)" was clipped at the SVG's right edge, and "dashed: below the satellite" touched it. **Fixed:** "too oblique" moved to the bottom of the shaded band; the box title split into two lines; the caption became "dashed: nadir pixel" / «пунктир: пиксель в надире». Re-shot at 390 and both are clean.
2. **SHOULD** — at 390 px the chart text is about 10 px effective (14 px × 0.7 scale). It is legible but small. Consider a taller viewBox on narrow screens.
3. **SHOULD (tooling, outside this guide)** — `shot.sh`'s fixed 14,000 px window truncates long guides at *both* widths. The coordinator may want a `H` override like the reviewer's copy.

## 5. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is natural and technically idiomatic: яркостная температура, расщеплённое окно, подспутниковая точка, наковальня кучево-дождевого облака, «Метеосат», «Химавари», «Фэнъюнь», decimal commas, Cyrillic «К», thin-space grouping (five digits and up). EN/RU parity was checked paragraph by paragraph and is complete.

1. **SHOULD (applied)** — «на „дневных“ орбитах» for "afternoon orbits" is misleading, because a sun-synchronous orbit is lit at a given local time. → «на послеполуденных орбитах».
2. **SHOULD (applied)** — «радиометр-изображатель» (chapter 6 and the ref [39] note) is a calque. → «микроволновый сканирующий радиометр» in both places.
3. **SHOULD** — MOD.json, ATS-1 RU line: «камера со сканированием вращением» → «сканирующая камера, использовавшая вращение спутника,».
4. **NICE** — «по словам NOAA, „большую часть данных“» was replaced by «по словам самого ведомства», which avoids NOAA's awkward grammatical gender.

## 6. Ethicist — APPROVE

Nations are treated even-handedly: the US, European, Japanese, Chinese and Soviet/Russian programmes are each credited with dated facts. Kosmos 44 is credited on the same day as Nimbus 1, and Meteor-M 2-4 appears in the fleet. People (Suomi, Parent) are named accurately. The GOES-19 outage is reported factually without speculating about its cause, matching WTOP's "remains unclear". The "usable limit" and every modelling simplification are labelled as such, so no speculation is presented as fact.

---

## Consolidated MUST-FIX (all applied)

1. Fixed grid: official 56/28/14 µrad steps and the 75.0° W projection origin from the GOES-19 L1b header; new ref [40]; text, notes and checks updated (§1.1).
2. Nimbus: "launched between 1964 and 1978", not "flown until 1978" (§2.1).
3. AMVs: the 6 % includes polar (MODIS) winds; plus the NOAA "majority of data" attribution (§2.2).
4. Microwave "through clouds" and "inside the storm" sentences cited to NOAA's ATMS page [41], with the unsourced specifics trimmed (§3.1).
5. & 6. 390 px label collisions in instruments 1 and 2 (§4.1).

SHOULD left open: the exact 16 July date for the GOES-19 safe hold (§2); ref [17] on the hurricane sentence (§2.4); the JPSS-3 ~2032 freshness row (§2.3); the LEGACY heading wording (§3.2); the latitude readout decimal (§3.3); the clear-sky absorption clause (§1.5); narrow-screen chart text size (§4.2); `shot.sh` height (§4.3, a shared file); the MOD.json RU wording (§5.3).
