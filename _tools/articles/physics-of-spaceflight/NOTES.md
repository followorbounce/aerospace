# IMPULSE — The Physics of Spaceflight (Wave 9 rebuild)

**Purpose:** the foundation guide other guides lean on: momentum exchange, the rocket equation and staging, orbit speed and vis-viva, Hohmann transfers and plane changes, the Oberth effect, a Δv map of the Solar System on one stated basis, and a short sourced survey of propulsion types. It replaces the hand-made page at the same slug, codename, label and URL. Every number is cited or computed in `script.js` and checked in `checks.js` (111 checks).
**Audience:** interested non-specialists; equations in eq-boxes; models labelled as models, with where they stop.
**Owner:** Wave 9 author (agent), 2026-11-14 (finished 2026-11-15). **Category:** foundations.
**Neighbours not duplicated (linked instead):** NOZZLE (thrust equation's pressure term, nozzle), THRUST (Apollo 11's real stage masses through the rocket equation), TRANSFER (Earth–Mars Hohmann and synodic sliders), SLINGSHOT (gravity assists), SAIL, BELT (Dawn's xenon ledger), SCORCH (Mercury), RETURN, EQUILIBRIUM (`lagrange-points`), and the Wave 9 guides PITCHOVER (ascent losses), ELEMENTS, WINDOW by slug.

## What changed against the old hand-made page
- Ten chapters → nine (the four engine chapters became one sourced survey with a table). Chapter ids `ch1`…`ch9` kept; `ch10` no longer exists. `grep -r "physics-of-spaceflight#"` over the repo found no inbound anchor links, so nothing breaks.
- The old Δv ladder (seven hand-typed totals "from the surface", patched in EN-FIXES) is replaced by 15 rows recomputed in `dvMap()` from a 200 km orbit; the ground leg is a quoted figure behind a switch.
- "9.4 km/s to LEO" had no source. The page now uses 9.3 km/s = Saturn V's 9,267 m/s from Humble, Henry & Larson [10] and gives the source's range 8.8–9.3 km/s. **THRUST still says 9.4** (its chart label "orbit ≈ 9.4") and the Wave 9 brief words PITCHOVER as "about 9.4": coordinator to reconcile.
- DRACO is described as cancelled (2025); no engine is described as "in development".
- No references before; 29 now.
- The Tsiolkovsky "cradle" quote was dropped: no primary source was found for the wording or the 1911 date.

## Outline (9 chapters; lede "Nine chapters and five instruments")
1. Momentum — third law, thrust = flow × exhaust velocity, specific impulse; RS-25 worked example; eq-box.
2. Rocket equation and staging — Tsiolkovsky 1898/1903, mass ratios for 9.3 km/s, Dawn as a flown check; **instrument 1**: staging optimiser (Lagrange split of a target Δv between 1–4 stages, first-stage and upper-stage Isp, structural fraction; payload share bars, mass breakdown).
3. Orbits and vis-viva — Newton's cannon, circular/escape speed, vis-viva, Kepler III; checks against GEO, ISS, Apollo 11 TLI, Parker; **instrument 2**: orbit calculator (Earth, Moon, Mars, Sun; ten presets).
4. Hohmann transfers and plane changes — Hohmann 1925, combined plane change, bi-elliptic thresholds; **instrument 3**: Hohmann between any two circular orbits around Earth or the Sun with a plane change.
5. Oberth effect — energy bookkeeping, Mars departure 3.61 vs 6.17 km/s; **instrument 4**: burn at closest approach vs far away (Earth, Jupiter, Sun).
6. Δv map — stated basis; **instrument 5**: 15 computed rows as stacked bars, basis switch, per-leg readout; the same data as a table.
7. Ways to make the push — chemical, nuclear thermal, electric, sails; jet-power eq-box; table of published figures with computed exhaust velocity and jet-power share (a display of published data, not counted as an instrument).
8. Legacy — timeline 1687–2025 (13 rows).
9. References — 29.

## Sources per number (retrieved 2026-11-14 unless noted)
- GM, radii, semi-major axes; published escape speeds 4.3 / 10.4 / 11.2 / 2.4 / 5.0 / 59.5 and orbital speeds 47.4 / 35.0 / 29.8 / 24.1 / 13.1 km/s — NSSDCA Planetary Fact Sheet [1]. Mars GM 42,828 km³/s², R 3,396.2 km, a 227.956 × 10⁶ km; Mercury 22,032 / 2,440.5 / 57.909; Venus 324,860 / 6,051.8 / 108.210; Jupiter 126,687,000 / 71,492 / 778.479; Neptune a 4,514.953 are the per-planet fact-sheet values as already used and verified in SLINGSHOT and TRANSFER (the summary table was re-fetched; the per-planet sheets for Mars, Mercury, Venus, Jupiter were not re-opened this wave — the escape-speed and orbital-speed checks tie them to the summary table).
- Earth GM 0.39860 × 10⁶, R 6,378.137, escape 11.186, a 149.598 × 10⁶ km, 29.78 km/s, sidereal rotation 23.9345 h, year 365.256 d; Moon GM 0.00490 × 10⁶, R 1,737.4, escape 2.38, a 384,400 km, 1.022 km/s, 27.3217 d; Sun GM 132,712 × 10⁶, R 695,700, escape 617.6 — NSSDCA Earth/Moon/Sun fact sheets [2].
- Newton's cannon; raising apoapsis at periapsis — JPL Basics of Space Flight ch. 3 [3].
- Rocket equation written 1898, first published 1903 in Nauchnoe Obozrenie — tsiolkovsky.org description of NASA TT F-237 [4] (the PDF itself was not opened page by page).
- Goddard: 16 March 1926, Auburn MA, liquid oxygen and gasoline; "A Method of Reaching Extreme Altitudes" Smithsonian Misc. Publ. 2540, January 1920 — NASA [5]. (The paper carries the date 1919; NASA gives January 1920 as publication, which is what the timeline uses.)
- Hohmann 1925, NASA TT F-44 (1960) — archive.org record of the NASA document [6]. Oberth 1929, NASA TT F-622 (1972) — archive.org record [7].
- Sternfeld 1934 — bibliographic citation; Briot (2012, arXiv:1207.1491) describes his two 1934 notes to the Academy [8]. Thresholds 11.94 / 15.58 — Vallado [9] (textbook not opened; both recomputed: bi-parabolic = Hohmann at 11.939, Hohmann cost peaks at 15.582).
- Ascent budgets (Saturn V 7,798 + 1,534 + 40 + 243 − 348 = 9,267 m/s; Shuttle 9,086 + 144; Atlas I 9,243; Delta 7925 8,814; Ariane 44L 9,138; Titan IV/Centaur 9,207; "between 8.8 and 9.3 km/s") — Humble, Henry & Larson (1995) as reproduced on slide 8 of Seitzman's Georgia Tech handout [10]; the book itself was not opened.
- Apollo 11: TLI cutoff 180.581 n mi, 35,545.6 ft/s; lunar arrival 8,250.0 ft/s at 86.7 n mi; LOI-1 2,917.5 ft/s → 169.7 × 60.0 n mi; LOI-2 158.8 ft/s; LM ascent 6,070.1 ft/s → 48.0 × 9.4 n mi — Orloff, SP-4029 web tables [11]. F-1 1,522,000 lbf — same book (as cited in THRUST).
- F-1 265 s — NTRS 20100027316 [12] (as verified for NOZZLE).
- RS-25 418,000 / 512,300 lb at 109 %, 452.3 s vacuum — L3Harris spec sheet 07/2024 [13] (PDF text extracted locally).
- NEXT vs NSTAR Table 1 — NASA/TM-2008-214986 [14] (PDF text extracted locally).
- Dawn ~51,250 h, ~416 kg xenon, almost 11.5 km/s, "a record for an on-board propulsion system" — Rayman & Garner 2018 [15]. 91 mN, sheet of paper, four days 0–60 mph, 425 kg xenon — NASA Dawn page [16]; launch mass 1,217.7 kg — NSSDCA 2007-043A (as verified for BELT).
- 1.35 kW SPT: claimed 16,000 m/s and 50 %; >50 of the 660 W thrusters flown (claim) — Brophy 1992 abstract [17].
- DRACO closed out 2025 — Breaking Defense [18] (trade press; same source as EN-FIXES).
- Rover/NERVA 1955–1972, 20 reactors, ~$1.4 B, 825 s tested on NERVA XE, 850 s chosen for flight engine, 25–250 klbf engines, XE 28 start-ups in 1969; comparison table (SRB 242 s and 2,800 klbf at sea level; F-1 vacuum 303.1 s; J-2 vacuum 421 s; RS-25 366 / 452.3 s; ion 2,000–8,000 s; NTP 800–1,000 s) — Wilkerson 2019, NTRS 20190033337 [19] (PDF text extracted locally).
- IKAROS 1.12 mN — JAXA press release 9 July 2010 [20] (as verified for SAIL).
- Parker 3.8 million miles above the surface, about 430,000 mph, 24 December 2024 — NASA [21].
- ISS: five miles per second, about every 90 minutes, 16 orbits in 24 hours — NASA [22].
- GEO 35,786 km, 23 h 56 min 4 s — ESA [23] (as verified for RELAY).
- Cosmic velocities 7.910 / 11.186 / 16.67 km/s — Great Soviet Encyclopedia article "Космические скорости" [24] (see Unverified).
- Starshot "up to 100 million miles an hour", flyby "in just over 20 years from launch", ground-based light beamer — Breakthrough Initiatives [25].
- Brill: electrothermal hydrazine thruster, US patent 3,807,657, RCA Astro Electronics, 30 % — National Inventors Hall of Fame [26].
- Molniya 500 × 40,000 km, 12 h — Gunter's Space Page [27] (as verified for RELAY).
- RS-25 at 100 %: 1,035 lb/s, 470,000 lbf vacuum — HAER TX-116 [28] (as verified for NOZZLE).
- 30 years direct to Neptune — NASA Voyager page [29] (as verified for SLINGSHOT).

## Computed values quoted in the text (all in checks.js)
4.45 / 4.44 km/s (RS-25); mass ratios 8.1 and 22.9; Dawn 27.5 km/s ≈ 2,800 s; 7.67 km/s and 92.6 min at 400 km (4.77 miles/s); 7.91 / 11.18 at the surface; GEO 35,786 km from the sidereal day; Apollo 11 TLI 10.83 km/s = 99.4 % of escape; Parker 140 / 192 / 197 km/s; LEO→GEO 2.45 + 1.48 = 3.93 km/s in 5.26 h; Mars 2.94 / 2.65 km/s, 259 d; Neptune 30.8 yr; plane change 3.83 / 1.51 / +0.36 km/s; 11.94 / 15.58; Oberth 3.22 + 2.94 = 6.17 vs 3.61, saving 2.56; 0.39 → 2.96 km/s; all 15 map rows; Apollo 11 LOI 0.94 flown vs 0.91 ideal, ascent 1.85 vs 1.70; 16.65 km/s third cosmic velocity; NSTAR 1.40 kW = 61 %; SPT 84 mN; Starshot 15 % of c.

## Assumptions / limitations (stated on the page)
- Instrument 1: rocket equation per stage; one ε for all stages; vacuum Isp; no thrust-to-weight, engine mass scaling, fairings or reserves; refuses (no extrapolation) when the Δv exceeds what the stages can reach with zero payload. Sliders 200–470 s cover chemical engines only.
- Instrument 2: two-body; ranges capped at 900,000 km (Earth), 60,000 km (Moon), 500,000 km (Mars), 0.03–40 AU (Sun).
- Instrument 3: circular coplanar orbits, impulsive burns; whole plane change at the larger orbit; around the Sun the burns are heliocentric speed changes.
- Instrument 4: one body, impulsive burn exactly at periapsis; floor at 1.02 radii; Jupiter and Sun presets are illustrations, no such burn has been flown there.
- Instrument 5: from a 200 km circular LEO; impulsive; Hohmann, circular coplanar planets at mean distance; patched conics; capture to 300 km circular (100 km at the Moon); the Moon by Hohmann-to-lunar-distance plus lunar gravity (rough); no losses, margins or corrections. Ground leg = quoted 9.3 km/s (Saturn V).
- Chapter 7 table: one published example per type; SRB and F-1 at sea level; SPT thrust computed from claimed figures; NERVA thrust given as the tested range.

## Unverified / judgment calls
- **[19] column order.** The NASA comparison table was read from extracted PDF text; "303.1" (F-1 vacuum) and "421" (J-2 vacuum) are assigned by column order. 421 s for J-2 is the standard figure; reviewer please open slide 5 and confirm 303.1 belongs to F-1. They are used only as the kerosene/hydrogen presets of instrument 1.
- **[24] BSE.** booksite.ru returned 403 to the fetcher; the three values come from the search-engine summary of that page. They are standard (11.186 matches NSSDCA; 16.67 vs 16.65 computed here).
- **[8] Sternfeld.** The 1934 note was not opened; wording on the page is "usually credited to".
- **[9] Vallado, [10] Humble et al.** Textbooks not opened; [10] is read from a university handout that reproduces the table with attribution.
- **[4] Tsiolkovsky.** "Written 1898, published 1903" is from the hosting site's description of NASA TT F-237. The often-quoted derivation date 10 May 1897 is not used (Wikipedia only).
- Hall thrusters "developed in the Soviet Union": Brophy's abstract speaks of Russian thrusters evaluated in 1991–92; the Soviet origin is general knowledge. The first-flight claim (SPT on a Meteor satellite, December 1971) was found on Wikipedia only and is **not** on the page. SERT I (1964) likewise left out (NTRS record timed out).
- "Chemical exhaust velocity caps near 4.5 km/s" is a general statement supported by the RS-25 figure only.
- "Kinetic-energy" explanation that the Oberth gain is paid for by the propellant left deep in the well is textbook reasoning, not cited to a page of [7].
- Dawn's mean Isp ≈ 2,800 s is derived here (11.5 km/s, 416 kg, 1,217.7 kg) and ignores the hydrazine used in the meantime, which would raise it slightly.
- MOD row "IKAROS: thrust from sunlight confirmed" is dated by the JAXA press release (9 July 2010), not by the measurement.
- RU codenames of the three Wave 9 guides linked here (PITCHOVER, ELEMENTS, WINDOW) are not decided yet; the Russian text uses the Latin codenames. Coordinator to replace when the titles exist.
- Layout was checked with my own headless-Chrome captures at 1300 px and at 390 px (iframe): no horizontal overflow (scrollWidth 390), chart text ≥ 9 px. `shot.sh` was not run, per the brief.

## Freshness
claim | source URL | review-by date
--- | --- | ---
As of November 2026 no nuclear thermal rocket has flown; DRACO was cancelled in 2025 | https://breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/ | 2027-05-14
Dawn's almost 11.5 km/s "a record for an on-board propulsion system" (stated 2018; the page says "at the time") | https://ntrs.nasa.gov/citations/20210008613 | 2027-11-14
Breakthrough Starshot described as a study, not hardware | https://breakthroughinitiatives.org/initiative/3 | 2027-05-14
Parker Solar Probe's about 430,000 mph on 24 December 2024 (NASA: faster than any human-made object had moved) | https://science.nasa.gov/science-research/heliophysics/nasas-parker-solar-probe-makes-history-with-closest-pass-to-sun/ | 2027-11-14
RS-25 specification sheet (452.3 s, 512,300 lb) is a manufacturer document that is reissued | https://l3harris.com/sites/default/files/2024-07/l3harris-ar-rs-25-spec-sheet.pdf | 2027-11-14

## Wiring (for the coordinator)
- Same slug, codename `IMPULSE`, label EN `The Physics of Spaceflight` / RU `Физика космического полёта`, category foundations: copied from `_tools/handmade/physics-of-spaceflight/meta.json` (left untouched). Once this folder is the source, the handmade folder for this slug should be retired so the guide has one manifest.
- `llms` line rewritten to match the rebuilt content (see meta.json). `related` unchanged: `nozzle-rocket-engines`, `transfer-earth-to-mars`, `slingshot-gravity-assists`, `lagrange-points`.
- MOD.json: 4 rows (Goddard 1926-03-16 `sub`; Apollo 11 TLI 1969-07-16 `lunar`; IKAROS 2010-07-09 `trail`; Parker 2024-12-24 `trail`).
- Guides that should link here: `pitchover-ascent-to-orbit`, `elements-orbital-elements-ground-tracks`, `window-launch-windows-porkchop` (their briefs name this guide), and existing `thrust-saturn-v-n1` (already links; its 9.4 figure to reconcile), `belt-dawn-vesta-ceres`, `nozzle-rocket-engines`.

## Response to review (2026-11-15)

Three reviews (`REVIEW-A-physics.md`, `REVIEW-B-domain.md`, `REVIEW-C-history-language.md`), all APPROVE WITH CHANGES. After the round: 137 checks, 36 references, 17 timeline rows, `./check-all.sh physics-of-spaceflight` = ALL OK. Where this section and the sections above differ, this section is current (references are now 36; the NERVA figure is 710 s; MOD rows changed; freshness has 8 rows in meta.json).

### MUST
- **A-M1 (unused stage shown as "3 stages").** Kept the model, made the corner visible: `stageOpt()` returns `unused`; chart rows read "7.05% · 1 unused"; a readout row "STAGES LEFT UNUSED" appears; the status line explains it; the eq-note says a stage whose mass ratio would fall below 1 is left out; the model note explains why real first stages are still kerosene. Checks: the 3-stage default equals the 2-stage hydrogen rocket, brute force never beats it, and the page says "unused".
- **A-M2 (Mercury "several per cent").** `mercuryEnds()` recomputes the row for arrival at perihelion and aphelion (e = 0.2056). The note and both Mercury status lines now give flyby 4.8–6.7 and orbit 12.3–14.6 km/s, before the 7° tilt. Checks reproduce reviewer A's six figures to 0.01 km/s and confirm the conclusion survives (12.3 > 8.75). Ref [1] note corrected: Mercury's 47.4 km/s is not used as a check, and why.
- **B-M1 (NERVA "reached 825 s").** Table row is now XE-Prime, 710 s, 246,663 N (55,430 lb), cited to Finseth [31]; text says the flight engine was designed for 825 s or more; [19] note reworded to the 825–850 / 850–875 s capability ranges. Checks added. Caveat: Finseth's report is a scan my fetcher could not read; the figures are as quoted by reviewer B from PDF p. 123, and the ref note says so.
- **B-M2 / A-S5 (solar escape and New Horizons; treated as MUST).** Status line now says four of the five departing craft needed Jupiter and New Horizons left on launch energy alone (C3 = 157.7502 km²/s² [32] → 12.56 km/s beyond the Earth, a burn of 8.92 km/s from this orbit, against the row's 8.75). Consistent with SLINGSHOT. Checks added; a 2006 timeline row added.
- **C-M1 (Tsiolkovsky "wrote/derived it in 1898").** Now "had its final form on paper by August 1898 and published it in 1903", the same in Russian, from Tsiolkovsky's own note in [4] as read by reviewer B (page dated 25 August 1898; publication in Nauchnoe Obozrenie No. 5, 1903). Timeline and ref note aligned. "Derived in 1898" is gone.
- **C-M2 (Hohmann status false for inward transfers).** Status branches on direction: "both against the direction of flight" inward. The plane-change line now says "the burn made on the larger orbit". Checks press EARTH → VENUS and EARTH → MARS.
- **C-M3 (Chapter 8 heading).** Now "The equations were on paper before anything reached orbit".
- **C-M4 / A-S4 / B-S3 (Jupiter burn).** Note reworded: no speeding-up burn of this kind at Jupiter or the Sun as of November 2026; Juno's 35-minute, 542 m/s braking burn on 4 July 2016 used the effect in reverse [33]. No altitude is quoted (not sourced). Freshness row added.

### SHOULD — done
- **A-S1 / C-S4** text softened ("has little or nothing left over for a load"); single-stage status says the figure flatters a single stage; model note gives the sea-level case (366 s: limit 9.07 km/s, cannot reach 9.3). Check added.
- **A-S2** Oberth y-axis: tick step chosen from a round list, labels are exact multiples. Check in three states.
- **A-S3** column and legend renamed "Burn on arrival".
- **A-S6** 2.95 km/s everywhere (3.22 + 2.95 = 6.17); tolerances tightened to 0.005 (also the 2.45 check). TRANSFER still prints 2.94 for the same quantity (2.9452): coordinator's call.
- **A-S7** table note explains the 69 %; the check now pins 0.69 ± 0.005 and shows that "over 70 %" needs more than 4,172 s.
- **B-S1** 9.3 km/s kept, worded as a published budget, not a flight measurement; note adds the 176 km orbit (+0.01 km/s to 200 km, checked) and that vacuum specific impulse makes the bars optimistic.
- **B-S2** Starshot: "put on hold in 2024 according to one of its former team leaders [34]"; freshness row now cites Benford.
- **B-S4** statuses: Hall row "type flown since 1972" [17][30]; NEXT "in ground testing in the 2008 source" (I did not verify a NEXT flight from a source, so the page does not claim one; freshness row added).
- **B-S5** clause reconciling SCORCH's 13.9 and 12.3 km/s.
- **B-S6** model note: the [19] "F-1" column carries the uprated 1.8-million-pound rating; J-2 421 s here vs about 425 s in THRUST (another mixture ratio).
- **B-S7 / C-S6** "a note", singular; the manoeuvre is named (bi-elliptic transfer / биэллиптический перелёт); ref [8] gives Briot's title, says why it is linked, and adds Lingam & Loeb for the credit. The Gallica scan was not opened.
- **B-S8** ref [18] is now the FY2027 budget (DRACO closeout) with the Breaking Defense report alongside.
- **B-S9** freshness rows: Starshot (independent source), Parker (record matched, not beaten; NASA 10 Sep 2026, as read by reviewer B), the two open-ended negative claims, NEXT status.
- **C-S1** "the cheapest two-burn way".
- **C-S2 (credit)** Esnault-Pelterie: sentence in ch. 2 and a 1913 timeline row, from Encyclopædia Universalis [36] (opened). Worded as "put the same mass-ratio argument", not "derived independently": whether he knew Tsiolkovsky's paper is not established. Kondratyuk: 1929 timeline row from the Linda Hall Library [35] (opened), including that the Apollo link is unproven.
- **C-S3** Morozov's group at the Kurchatov Institute of Atomic Energy, Fakel, first flight test 1972 on a Meteor launched December 1971, from IEPC-2007-142 [30] (PDF text extracted and read); text, timeline row and table status.
- **C-S5** aerobraking: "several have then lowered it by aerobraking".
- **C-S7, S8, S10, S11** Russian: «Электроракетный двигатель»; «Орбита у Марса» / «ОРБИТА ВОКРУГ МАРСА» and «с околоземной орбиты»; the literal renderings replaced; «мор. мили» in ref [11].
- **C-S9** no-break spaces: a pass over every Russian string in script.js (233 U+00A0 now), including unit suffixes from `T()`, thousands separators, «а. е.» and « %». Check added.
- **C-S12** gravity well explained at first use; "inclination … its tilt i"; Δv glossed in the lede; vis-viva given its meaning.
- **C-S13** MOD.json: Goddard (before 1957) and Parker (duplicate) replaced by Apollo 11's lunar-orbit insertion (1969-07-19) and Dawn's end of mission (2018-11-01). IKAROS row kept; it is dated by the press release.
- NITs taken: A-N1 (Moon 2.37), A-N2, A-N3 (49° clause, checked), A-N4, A-N5, A-N6; B-N1 (6,371 km sphere; "Soviet reference books"), B-N2 ("100 % of rated power"), B-N4, B-N5; C-N1, C-N8, C-N9, C-N10 (`scope` on table headers), part of C-N6.

### SHOULD — left, with reasons
- **C-S2, Goddard's 1920 paper and William Moore (1813).** Not added: I could not open a source that states what either contains in the terms the review suggests, and the brief forbids writing from memory.
- **A-S1 alternative (separate ε for hydrogen stages).** Not done: it would need a sourced ε per propellant; the limitation is stated instead.
- **B-S4, NEXT-C on DART.** Left as "ground testing in the 2008 source" for the same reason (no source opened).
- **B-N3 (Vallado link), C-N3 (Parker 6.9 vs 6.8 million km), C-N4, C-N5, C-N7, C-N11, C-N2.** Left. C-N3: the page's 6.8 follows from its cited NASA figure (3.8 million miles); the CORONA guide's more precise distance gives 6.9, and the conclusion (between circular and escape speed) is the same. C-N5 (Oberth's Russian title) could not be confirmed either way. Number + spelled-out unit in body.html (C-S9 tail) left as a NIT.
- **9.4 km/s in THRUST, 2.94 in TRANSFER:** other guides; for the coordinator.

### Still unverified after the round
Finseth's figures (scan; quoted by reviewer B); Sternfeld's note itself; Vallado and Humble et al. (books); the NASA Parker blog of 10 September 2026 and the FY2027 budget page and Benford's post (cited as read by reviewer B, not re-opened by me); the Guo & Farquhar table (same).
