# QUAKE — InSight & the inside of Mars (Wave 8)

**Purpose:** what NASA's InSight lander (2018–2022) learned about Mars from one seismometer: SEIS and the fight against wind and heat, the marsquake catalogue and S1222a, meteoroid impacts heard by SEIS and found from orbit, crust/mantle/core (the core radius revised since 2021), the HP³ mole failure, and the dust that ended the mission. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes; models labelled as models.
**Owner:** Wave 8 author (agent), 2026-11-12. **Category:** mars. Neighbours not duplicated: ARRIVAL (`viking`, mentions the Viking seismometer only in passing; linked from ch.1), TRANSFER (`transfer-earth-to-mars`), JEZERO, SKYCRANE.

## Outline (9 chapters, lede "Nine chapters and four instruments")
1. One station, one planet — Apollo/Viking precedent, InSight launch/landing/site/experiments/team; eq-box single-station distance from S−P.
2. Listening through the wind — SEIS consortium (CNES/IPGP, Imperial, ETH, MPS, JPL), VBB/SP bands, deployment dates, shield, three barriers, wind noise, first marsquake, naming convention.
3. Marsquakes — 1,319 events, 27°–40°, Cerberus Fossae, S0976a, S1222a (NASA's first "magnitude 5" vs catalogue 4.7), tectonic origin; eq-box Hanks–Kanamori + circular crack; **instrument 1**: magnitude → seismic moment, ratio to S1222a and to a small impact, rupture radius at an assumed stress drop; chart of the big events and small impacts by distance.
4. Impacts — four small impacts (Garcia 2022), S1000a and S1094b, ice at 35° N, surface waves and crustal shear speed, known sources as model tests. (No instrument; covered by instrument 1's chart.)
5. Crust, mantle, core — crust 20/39 km, lithosphere ~500 km, core 1,830 (2021) → RISE 1,835 → SKS 1,780–1,810 → 1,675/1,650 with a molten silicate layer (2023), NSSDC footnote, inner-core claim (2025) and doubts; eq-box straight-ray shadow + spherical Snell; **instrument 2**: cross-section with direct/PP-SS/ScS/SKS rays, core radius and distance sliders, travel times from a toy uniform mantle fitted to S1000a.
6. The mole — HP³/DLR, mole dimensions, forces, duricrust, pit, rescue campaign, end, what was learned; eq-box friction model; **instrument 3**: soil grip vs buried length, Mars/Earth gravity, loose sand vs 20 cm duricrust, friction angle, scoop pinning.
7. Dust and the end — arrays, 4,588 Wh sol 1, ~5,000 → ~500 Wh, 25 % cleaning, storm, shutdown, last contact, end; **instrument 4**: energy per sol = Sun-distance factor × fitted dust exponential, with NASA points, aphelion/perihelion, sweep toggle.
8. Legacy — timeline 1976–2025 (7 rows) + quote.
9. References — 36 sources.

## Sources per number (retrieved 2026-11-12)
- Launch 5 May 2018 11:05 UT, Atlas V 401, Vandenberg; landing 26 Nov 2018 19:52:59 UT, western Elysium Planitia; 360 kg; SEIS/HP³/RISE; arrays 2.2 m; Banerdt/Smrekar — NSSDC 2018-042A [1].
- 4.502° N 135.623° E; degraded crater, smooth sandy surface — Golombek et al. 2020 [2] (PMC7039939 full text).
- Viking 2 seismometer, wind correlation, sol 80 candidate — Lorenz, Nakamura & Murphy 2017 [3] (abstract).
- First quake 6 Apr 2019 sol 128; Apollo five seismometers / thousands of quakes; CNES/IPGP; WTS by JPL — NASA Science [4].
- Who built what; VBB 0.01–10 Hz; SP 0.1–50 Hz; ~300-wire tether — DLR SEIS page [5].
- 19 Dec 2018; WTS 2 Feb 2019 sol 66; 94 °C; 1.2 m vaults; three barriers; titanium sphere — JPL 2019 [6].
- Lognonné PI and instrument paper — [7] (not opened beyond crossref metadata; PI role inferred from first authorship and NASA's "PI at IPGP").
- Events found mostly in quiet evening/night hours — Giardini et al. 2020 [8] (not opened; see Unverified).
- 1,319 marsquakes; last contact 15 Dec 2022; sol 1,436 = 11 Dec; mole 5 m / 40 cm — JPL retirement 2022 [9].
- S1222a "magnitude 5" first estimate, sol 1,222, S0976a 4.2 on 25 Aug 2021 — JPL May 2022 [10].
- Mw 4.7, ×5 moment, Love waves, >10 h coda, 1/30–35 Hz, dichotomy, outside Cerberus — Kawamura et al. 2023 abstract (crossref) [11].
- S1222a at 37°; core 1,650 ± 20 km, 6.5 g/cm³ — Samuel et al. 2023 [12] (PMC10600000 full text).
- ~300 m crater searched, none found, tectonic — Fernando et al. 2023 abstract [13].
- Four small impacts, dates, 85–290 km, ≤ M2.0, three shards, CTX/HiRISE — JPL 2022 [14].
- 24 Dec 2021, M4, 150 m × 21 m, Amazonis, ice, first surface waves — JPL 2022 [15].
- >130 m craters, largest in 16 years, ice at 35° N — Posiolova et al. 2022 abstract [16].
- S1094b Mw 4.0 ± 0.2, 3,532 km, MQS 59.7 ± 6°, S1000a ~7,460 km, 3.2 km/s crust 5–30 km — Kim et al. 2022 (eScholarship PDF) [17].
- 18 Sep 2021 crater >100 m; Cerberus ~1,500 km east; 1,318 quakes — DLR 2022 [18].
- Crust 20 ± 5 / 39 ± 8 km, average 24–72 km, lithosphere ~500 km (issue summary) — Knapmeyer-Endrun et al. 2021 [19].
- LVZ, ×13–20 heat-producing elements — Khan et al. 2021 abstract [20].
- 1,830 ± 40 km, 5.7–6.3 g/cm³, shadow covers half of Mars incl. Tharsis — Stähler et al. 2021 abstract [21].
- S0976a 146 ± 7°, S1000a 125.9°, M4.2/4.1; Table 1 method A times (S0976a SS−PP 858.5, SKS−PP 311.0; S1000a SKS−PP 344.2, SS−SKS 401.4 s); 1,780–1,810 km; 6.2–6.3 g/cm³; V_P 4.9–5.0 km/s — Irving et al. 2023 [22] (PMC10161042 full text).
- 1,675 ± 30 km, 6.65 ± 0.1, LSL 150 ± 15 km, 4.05; the "ScS" of 2021 is a reflection from the LSL top — Khan et al. 2023 [23] (PMC10600012).
- RISE 1,835 ± 55 km, argues against solid inner core — Le Maistre et al. 2023 abstract [24].
- Inner core 613 ± 67 km, ~30 % jump; most seismicity 27°–40° — Bi et al. 2025 [25] (PMC12408336).
- Doubts (Khan) — Eos 1 Oct 2025 [26].
- R 3,389.5 km; g 3.73 / 9.82; day 24.6597 h; core 1,830 km with "1650 – 1675 km" footnote — NSSDC Mars fact sheet [27].
- S1000a Mw 4.1 ± 0.2, Tempe Terra, ~126°, naming convention — Durán et al. 2022 [28] (PDF).
- All mole numbers (400 × 27 mm, 3–5 m, 70 cm first target, 1,100 ± 150 N, 5–7 N, 30 N springs, ¾ buried, pit 7 × 5–6 cm, 31 → 37 cm, back-end 1–2 cm below, ~20 cm duricrust, 0.3–0.7 MPa, cohesion 2–15 kPa / 5.8 kPa, 1,211 kg/m³, friction angles 30°–40°, 10 N lateral arm force, 22 months, sol 754 / 9 Jan) — Spohn et al. 2022 [29] (PMC9734249 full text).
- 14 Jan 2021 announcement, 9 Jan final attempt, 500 strokes, start 28 Feb 2019, Spohn PI — JPL 2021 [30] (via search summary of the JPL page; see Unverified).
- 4,588 Wh sol 1 — AIAA reprint of the NASA release [31].
- ~5,000 Wh → ~500 Wh, oven 1 h 40 / 10 min, 25 % → ~1,000 Wh, arm parked, seismometer off by summer — JPL May 2022 [32].
- 425 → 275 Wh, storm 3,500 km, seismometer 24 h every other sol — JPL Oct 2022 [33].
- Mars Keplerian elements — JPL SSD approximate positions, Table 1 [34].
- Mw definition — Hanks & Kanamori 1979 [35]; circular crack — Eshelby 1957 [36].

## Computed (checks.js, 60 checks, all PASS)
1° = 59.157 km; 27°–40° = 1,597–2,366 km; 37° = 2,189 km; S1094b 59.71°; S1000a 126.1° (vs 125.9); small impacts 1.44°–4.90°; M0(4.7) = 1.259 × 10¹⁶ N·m; ×31.6 per unit; S1222a/S0976a = 5.62; rupture radius 1.77 km at 1 MPa; shadow edge 114.6° (1,830) / 121.7° (1,650); straight-ray shadow share 29 %; toy fits reproduce S1000a to 0.3 s for 1,650/1,675/1,795/1,830 km with V_P 6.28–6.60, V_S 3.78–3.89 km/s; S0976a SS−PP predicted 849 vs 858.5 s (1.1 %); S0976a SKS−PP predicted 258 vs 311 s (toy fails, stated in the status); trade-off 2.95 % in V_S between 1,650 and 1,830 km; K₀(35°) 0.426, μ 0.431; full 40 cm hull on Mars 5.6 N, at 30 cm 3.2 N; Earth/Mars 2.63; duricrust at 37 cm < 5 N; pinning 10 N → 4.3 N; perihelion 21 Jun 2022, aphelion 12 Jul 2021; 1.3814–1.6660 AU (NSSDC 206.65–249.26 Gm); aphelion 31 % less light; τ = 547 sols; model 359 Wh on 3 Oct 2022 vs 425 reported (−16 %); 25 % sweep +1,067 Wh vs NASA ~1,000; sol numbers of 2 Feb 2019 (66), 6 Apr 2019 (128), 9 Jan 2021 (754), 4 May 2022 (1,222), 11 Dec 2022 (1,436), 15 Dec 2022 (~1,440) within one sol.

## Assumptions / limitations
- Instrument 1: Hanks–Kanamori with the 9.05 constant (from −10.7 in dyne·cm); Mars magnitudes treated as on the same moment scale. Stress drop is a free assumption (0.1–100 MPa); rupture radius from Eshelby's circular crack.
- Instrument 2: **toy** — no crust, uniform mantle, straight rays, core V_P 4.95 km/s, no molten layer or inner core in the ray tracing; mantle speeds fitted per core radius to the two S1000a differential times. The fitted speeds are effective, slower than real mantle speeds; the page says so. Shadow-edge numbers are straight-ray numbers, contrasted with Stähler's "half the surface".
- Instrument 3: cohesionless soil with Jáky K₀ = 1 − sin φ and wall friction tan(2φ/3) (textbook geotechnical assumptions, no citation in the reference list); a top layer of thickness c gives no lateral pressure; arm push turned into friction with the same μ; no springs, tilt or stroke dynamics. Uses the regolith bulk density 1,211 kg/m³ from [29] for the whole column.
- Instrument 4: energy ∝ 1/r² from the Sun distance × one dust exponential fitted through sol 1 (4,588 Wh) and 17 May 2022 (500 Wh). No seasonal solar elevation, atmospheric opacity, storms or battery/heater loads. Sol ↔ date from the landing time and 24.6597 h; the sol number is the mission sol to within one (local time of landing not modelled).

## Unverified / judgment calls
- Giardini et al. 2020 [8] was not opened (Nature paywall); the "quiet evening and night hours" statement is from memory of the paper and widely reported — reviewer should confirm or swap the citation.
- Lognonné as SEIS PI: [4] says "principal investigator at IPGP" without the name; name from [7]'s first authorship.
- JPL mole page [30] returned 404 to the fetcher; its content (14 Jan 2021, 9 Jan, 500 strokes, 28 Feb 2019, Spohn) is from the search-engine summary of that page; the same facts (sol 754, 500 strokes, January 2021) are in [29].
- 4,588 Wh comes from an AIAA reprint of NASA's release; the original JPL page 404'd.
- The direct S−P time of S1222a and the Böse et al. (2021) magnitude–distance scaling could not be retrieved (BSSA/Bristol PDFs blocked), so the page has no detection-threshold curve and no S1222a travel-time check.
- Jáky (1944) not in the reference list (no stable URL found); named in the eq-note.
- The "S0128a" name for the first event is derived from the naming convention [28] and the sol [4], not quoted.
- RU codename: QUAKE → «ТОЛЧОК».

## Freshness
claim | source URL | review-by date
--- | --- | ---
Core radius "as of November 2026": liquid core ~1,650–1,675 km under a molten silicate layer | https://doi.org/10.1038/s41586-023-06586-4 , https://doi.org/10.1038/s41586-023-06601-8 | 2027-05-12
Solid inner core (613 ± 67 km, 2025) still debated, not independently confirmed | https://doi.org/10.1038/s41586-025-09361-9 , https://eos.org/articles/scientists-may-have-finally-detected-a-solid-inner-core-on-mars | 2027-05-12
NSSDC Mars fact sheet still lists 1,830 km with a 1,650–1,675 km footnote (retrieved 2026-11-12) | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html | 2027-11-12
1,319 marsquakes = NASA's end-of-mission count; the Marsquake Service reference catalogue (being finalised in 2025) lists over 1,900 events — update when the catalogue paper appears | https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/ , https://meetingorganizer.copernicus.org/EGU25/EGU25-13152.html | 2027-05-12

## Wiring (for the coordinator)
- Index label EN: `InSight & Marsquakes` · RU: `InSight и марсотрясения` · codename `QUAKE`, category `mars`.
- llms.txt: `NASA's InSight lander (2018–2022): the SEIS seismometer and its wind shield, 1,319 marsquakes and the M4.7 S1222a, meteoroid impacts heard seismically and confirmed by MRO, crust, mantle and a liquid core revised from 1,830 km to ~1,650–1,675 km (molten silicate layer; 2025 inner-core claim), the HP³ mole's friction failure and the dust that ended the mission — with a moment calculator, a toy ray tracer fitted to S1000a, a mole-friction model and a solar-power model.`
- MOD.json: 4 rows (landing, first marsquake, Dec 2021 impact, S1222a), type `land`, body `mars`.
- Suggested related.json: `viking`, `transfer-earth-to-mars`, `jezero-perseverance-rover`, `skycrane-curiosity-rover`. Neighbours that should link here: `viking` (its seismometer), `transfer-earth-to-mars`, `jezero-perseverance-rover`.

## Response to review (2026-11-12)
Panel verdicts and evidence in `REVIEW.md` (overall approve-with-changes, no blocks). Changed:
- Wind cleaning: "No gust of wind ever cleaned them" → "No dust devil ever swept them clean", plus the May 2021 sand-trickling trick (~30 Wh/sol, sol 884), new ref [40] (JPL 3 Jun 2021). The instrument status line now matches. New check: 22 May 2021 = sol 884.
- Lognonné as SEIS PI: new ref [37] (CNRS News, 24 Jul 2021, names him PI), cited with [4].
- Night-time detection: ref [8] (Giardini 2020, never opened; HAL blocked and the downloads stalled) replaced by JPL 22 Sep 2021 ("usually finds marsquakes at night, when the planet cools off and winds are low"). Text reworded to match.
- "S0128a" removed (no source found). The naming sentence uses S1222a only.
- 1,319 is labelled as the end-of-mission count; the >1,900-event reference catalogue is added, new ref [38] (Clinton et al., EGU25-13152). Freshness row updated.
- Jáky: K0 = 1 − sin φ written out and cited to Mayne & Kulhawy 1982 [39] (doi 10.1061/AJGEB6.0001306, verified on Crossref).
- Models labelled inside the figures: SVG text "TOY MODEL · STRAIGHT RAYS" on the ray tracer; aria labels begin "Toy model:" / "Model:" (EN + RU).
- RU: «область Темпе» → «Земля Темпе» (text and the note to ref [28]).
- Unverified items resolved: the JPL mole page [30] opened directly (no longer 404); all its facts were confirmed first-hand.
- 7 new checks (67 total), ALL OK. References: 40.

Left as SHOULD/NIT:
- 4,588 Wh is still sourced from the AIAA reprint [31]; the JPL original is 404, and no NASA URL was found.
- The reference-catalogue count comes from a conference abstract; there is no journal paper yet.
- "(toy)" was not added to each ray readout label, because the figure is labelled.
- RU «шахты» for vaults and the EN line "The hard distances … are tiny ones" were left as is.
- Inner-core status was re-checked: no 2026 confirmation or rebuttal was found, so the wording stays.
