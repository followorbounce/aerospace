# ELEMENTS — orbital elements & ground tracks (Wave 9)

**Purpose:** how six numbers (a, e, i, Ω, ω, M) pin down any orbit; from elements to position; two-line element sets decoded field by field on embedded, dated, real TLEs; ground tracks and why they step west; J2 nodal and apsidal drift, drag, and what "mean elements" means. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes; models labelled as models.
**Owner:** Wave 9 author (agent), 2026-11-14 (finished 2026-11-15). **Category:** foundations. Codename ELEMENTS / «ЭЛЕМЕНТЫ».
**Neighbours not duplicated (linked instead):** `physics-of-spaceflight` (vis-viva, Hohmann, orbit speed), `sunsync-earth-observation` (the Sun-synchronous condition and its instrument), `relay-telstar-syncom` (GEO, Molniya and the 63.4° box), `navigator-gps` (broadcast ephemeris).

## Science-proof condition and how it is met
TLEs are SGP4 mean elements; a Kepler + secular-J2 propagator on them is approximate.
- The five TLEs are **embedded with their epochs** (retrieved from CelesTrak 2026-11-14, epochs 12–14 Nov 2026); nothing is fetched at run time.
- The propagator is **labelled** "Kepler + secular J2, not SGP4" in the lede, the eq-box of ch. 7, both charts' aria labels, both status lines and both notes. It is the secular part of the SGP model exactly as printed in Spacetrack Report No. 3, section 5 (a0 from the Kozai-type formula, dΩ/dt, dω/dt, M = M0 + n0 t, optional ṅ/2 and n̈/6 drag terms), with every periodic term left out.
- It is **checked against published SGP4 positions** and the error is stated on the page (ch. 7 instrument and notes):
  - python-sgp4 documentation example (PyPI page, opened): ISS TLE of epoch 19343.69339541 → TEME (−6088.92, −936.13, −2866.44) km at 2019-12-09 20:42:00 UTC, 243.5 min after epoch. Model error: **11.1 km** with J2, 66.9 km Kepler only.
  - Vallado, Crawford, Hujsak & Kelso (2006) verification set (`SGP4-VER.TLE`, `tcppver.out`, copies bundled with python-sgp4; opened and parsed): 00005 Vanguard 1 (0–4320 min, 13 points): max 10.0 km with J2, 1,376.6 km Kepler only; 28057 CBERS-2 (25 points to 2880 min): 15.1 km / 776.7 km; 08195 Molniya 2-14: 96.6 km / 139.3 km (worst at perigee, at the epoch itself); 06251 Delta 1 debris: 24.3 km with J2, 13.9 km with the ṅ/2 term, 766.5 km Kepler only. Positions embedded rounded to 1 m.
  - For the five current TLEs the 24 h and 72 h reference positions were **computed by the author** with python-sgp4 2.25 (not a published table; said so on the page and in ref [3]): J2-model error after 24 h: ISS 15.0, Landsat 9 14.9, GPS 5.6, Molniya 19.3, GOES-19 27.2 km; after 72 h 46.7 / 9.4 / 6.8 / 9.9 / 41.0 km; Kepler only after 24 h for the ISS 469 km. For GOES-19 the J2 correction makes it worse than Kepler alone (lunisolar and resonance terms of SDP4 matter as much): stated in the status line and checked.
- Independent published cross-checks of the whole chain (TLE parse → a → GMST → sub-point): GOES-19 comes out at 75.16° W vs NOAA's 75.2° W; Landsat 9's descending-node local mean time 10:12.5 vs USGS 10:12 a.m. ± 5 min; perigee × apogee heights match the CelesTrak SATCAT to 1–2 km (Molniya 2193 × 38162 exactly); Landsat 9 makes 233.00 revolutions in 16 days.

## Outline (9 chapters, lede "Nine chapters and five instruments")
1. Six numbers — state vector vs elements; Kepler 1609/1619; Gauss and Ceres 1801; eq-box state ⇄ elements; links to neighbours.
2. Size, shape, timing — a, e, perigee/apogee; GPS vs Molniya (same a, different e); M, E, ν; Kepler's equation; eq-box.
3. Tilt and turn — i, Ω (from the equinox, not Greenwich), ω. **Instrument 1**: six sliders → orbit drawn to scale in 3-D, E, ν, r, speed, position vector; presets = the five real orbits; degenerate cases (i = 0, e = 0) explained; perigee < 100 km flagged "not an orbit".
4. Two lines — who publishes TLEs, the format, what is missing (no a). **Instrument 2**: TLE decoder on five embedded TLEs, 16 fields, checksums recomputed. Catalogue-number exhaustion (11 July 2026), Alpha-5, OMM.
5. Ground tracks — why the track steps west; highest latitude = i; eq-box Δλ = (ω⊕ − Ω̇)·T_N; repeat tracks. **Instrument 3**: world map + track for 0–72 h, three model levels, error vs SGP4 at 24/72 h.
6. The bulge and the air — J2, secular drift of node and perigee; eq-box (SGP equations). **Instrument 4**: Ω̇ and ω̇ vs inclination for chosen a, e, with six presets and a published comparison for each. Drag (ISS ṅ/2 → 55 m/day), lunisolar (GEO 0.75–0.95°/yr).
7. Mean elements — osculating vs mean; the STR#3 warning; Kozai/Brouwer → SGP/SGP4; accuracy of TLE + SGP4; eq-box of this page's propagator. **Instrument 5**: error of Kepler / + J2 / + ṅ/2 against published SGP4 positions, five published cases.
8. Legacy — timeline 1609–2026 (10 rows) + quote.
9. References — 28 sources.

## Sources per number (retrieved 2026-11-14/15; "opened" = the page or file itself was read)
- "Mean" elements quote, 225-minute rule, SGP (Hilton & Kuhlman 1966, from Kozai), SGP4 (Ken Cranford 1970, from Lane & Cranford 1969, Brouwer), pseudo-drag ṅ/2 ignored by SGP4, SGP equations for a0, dΩ/dt, dω/dt, M; XKMPER 6378.135, CK2 5.413080e-4 (J2 = 1.082616e-3), XJ3 −0.253881e-5 — Spacetrack Report No. 3 [1], PDF opened and text-extracted.
- μ = 398600.8 km³/s² (WGS-72), TEME frame, SGP ← Kozai / SGP4 ← Brouwer, "about a kilometer or so at epoch and it quickly degrades", GMST polynomial (gstime: 67310.54841 + (876600·3600 + 8640184.812866)·T…) — Vallado et al. 2006 [2], PDF opened.
- Verification positions and final-line node/perigee angles (00005: Ω 339.51733, ω 345.34018 at 4320 min; 28057: Ω 249.64625; 06251: Ω 45.53659; 08195: Ω 278.82248, ω 264.79245) — `tcppver.out` [2][3], opened.
- ISS 2019 example — python-sgp4 PyPI description [3], opened (my recollection of other numbers was wrong; the page's are used).
- Field meanings (ṅ/2 rev/day², n̈/6 rev/day³, B* in 1/Earth radii, ephemeris type 0, checksum rule, revolution = node to node, 57–99/00–56 years, two-line format proposed November 1972 instead of a five-line one) — Kelso 1998 [4], opened. Column positions — CelesTrak tle-fmt [5], opened.
- "We ran out of 5-digit catalog numbers on 2026-07-11. The official USSF SATCAT is now at 101387…" — CelesTrak gp-data-formats [6], banner read by curl 2026-11-14; OMM recommendation same page.
- 18 SDS, elset number 999, Alpha-5 100,000–339,999 without I and O — Space-Track documentation [7], opened.
- The five TLEs, catalogue names, launch dates (ISS/Zarya 1998-11-20, Navstar 71 2014-08-02, Molniya 3-50 1999-07-08, GOES 19 2024-06-25, Vanguard 1 1958-03-17, catalogue no. 5), SATCAT perigee/apogee — CelesTrak GP + SATCAT JSON [8], opened. "GPS BIIF-7 (PRN 09)" is CelesTrak's gps-ops name for 40105.
- Kozai 1959 AJ 64, 367; Brouwer 1959 AJ 64, 378 — Crossref records + STR#3 reference list [9][10] (papers themselves not opened).
- TLE bias 0.8 ± 0.3 km, growth ≈ 1.5 km/day — Levit & Marshall, arXiv:1002.2277 [12], PDF opened.
- Ω_E = 7.2921151467e-5 rad/s, Ω̇_REF = −2.6e-9 semicircles/s, A_REF = 26,559,710 m — IS-GPS-200N [13], PDF opened.
- ISS: 51.6°, 90–93 min, 15.5–15.9 orbits/day, ≈ 22.9° west per orbit, ≈ 3-day repeat, ≈ 63-day lighting cycle, decay and reboosts — NASA JSC Space Station Orbit Tutorial (Evans & Robinson) [14], opened by curl.
- Landsat 9: 27 Sep 2021, Atlas V 401, 705 km, 98.2°, 99 min, 16-day repeat, 10:12 a.m. ± 5 min — USGS [15], opened.
- GOES-19: GOES East from 7 April 2025 at 75.2° W, launched 25 June 2024 — NOAA NESDIS [16], opened by curl.
- GEO inclination change 0.75°–0.95° per year from Sun and Moon — ITU-R S.484-3 [17], .doc opened (sentence quoted in the reference).
- Merson & King-Hele 1958 [18], King-Hele & Merson 1959 [19] (abstract opened: J = 1626e-6, flattening 1/298.1 vs previously accepted 1/297.1 — the numbers are NOT used on the page), O'Keefe, Eckels & Squires 1959 [20] (Crossref record only), Okhotsimsky, Eneev & Taratynova 1957 [21] (Math-Net.Ru record opened: UFN 63:1, 33–50).
- Kepler's laws "published in 1609 and 1619", Astronomia nova (Heidelberg, 1609) — MacTutor [22], opened. Gauss/Ceres: 1 Jan 1801, 9° of orbit, Zach's June 1801 predictions, rediscovery by Zach 7 Dec 1801, Theoria motus 1809 — MacTutor [23], opened. Gauss born 30 April 1777 → "then 24" during 1801 after April (MacTutor).
- Earth radii 6378.137 / 6356.752 km, J2 1082.63e-6, sidereal rotation 23.9345 h — NSSDC Earth fact sheet [25], opened. Sidereal day 23h56m04.09054s — Kelso 1995 [27], opened.
- Coastline: Natural Earth 1:110m land (public domain) [26], simplified by Douglas–Peucker (0.9°), islands under 12 square degrees dropped, rounded to whole degrees: 30 rings, 723 vertices. Illustration only.

## Computed (checks.js, 78 checks, all PASS)
Sidereal day 86,164.0989 s (from Ω_E; Kelso's 86,164.0905 s is the equinox-based day, 8 ms shorter; both "23 h 56 min 4 s"); critical inclination 63.4349°; J2/|J3| = 426; Molniya 3-50 M = 90° → E = 122.67°, ν = 153.03°, r = 36,263 km, 89.5 % of the period on the far half; a: ISS 6,796.5, Landsat 9 7,082.1, GPS 26,560.0, Molniya 26,555.9, GOES-19 42,164.3 km; ISS 413 × 423 km, P 92.94 min, node −4.951°/day, perigee +3.695°/day, step 23.60° per revolution (23.28° Earth + 0.32° node), 15.252 revolutions per nodal day (61.01 in 4), lighting cycle 60.6 d, decay 55 m/day from ṅ/2; Landsat 9 node +0.9870°/day, 233.00 revolutions in 16 days, descending node 10:12.5 local mean time; GPS node −0.03834°/day (reference −0.04044), 2.00005 revolutions per turn of the Earth; Molniya 3-50 perigee −0.0008°/day; GOES-19 at 75.157° W; Vanguard 1 rates −3.064 / +4.476°/day (published output −3.069 / +4.525).

## Assumptions / limitations
- Instrument 1: exact two-body geometry; heights over a sphere of 6,378.135 km; presets are mean elements.
- Instrument 2: parsing only; a recovered from n by SGP's formula (differs from the plain Kepler value by under 3 km).
- Instrument 3: Kepler + secular J2 (+ optional SGP drag terms); UT1 = UTC; TEME treated as the frame for GMST rotation (as SGP4 users do; no polar motion); sub-point on WGS 84. Slider limited to 72 h. Not for pass prediction; said on the page.
- Instrument 4: first-order J2 only; no lunisolar, drag, J3/J4. Rates suppressed below a 100 km perigee.
- Instrument 5: errors are 3-D distances in TEME to published SGP4 positions (themselves a model of the real orbit, good to about a kilometre at epoch).
- The ISS "55 m/day" is the two-body reading of the TLE's ṅ/2 field (da/a = −(2/3) dn/n) at that epoch, not a NASA figure; it changes with solar activity and attitude.
- Local time at Landsat's node uses the mean Sun (RA from GMST), i.e. local mean solar time.

## Unverified / judgment calls
- [9], [10], [11], [18], [20], [24], [28]: only bibliographic records (Crossref / publisher landing pages) were opened; the page takes no number from them and their reference notes say "bibliographic record only" where relevant. Credit to Kozai, Brouwer, Lane, Cranford, Hilton, Kuhlman rests on STR#3 and Vallado 2006 (opened). Credit to Okhotsimsky, Eneev and Taratynova rests on the Math-Net.Ru record (title, authors, pages); initials only are used on the page, as in the record.
- O'Keefe, Eckels & Squires: Crossref spells the second author "Eckeis"; the paper's author is Ann Eckels (later Bailie). The "pear-shaped component" wording is the paper's title.
- NSSDC master-catalogue pages for four of the five satellites returned errors on 2026-11-14, so launch dates come from the CelesTrak SATCAT (which mirrors the USSF catalogue).
- A sourced NASA figure for the ISS decay rate per month was not found; none is given.
- "Franz Xaver von Zach found Ceres on 7 December 1801" follows MacTutor; other accounts give 31 December (Zach) and 1 January 1802 (Olbers) for the confirmed recovery. The page cites [23] for its wording.
- No screenshots were taken (authors may not run shot.sh): layout at 390 px was reasoned from the CSS (single-column sim-wrap under 900 px, `.tle-box` scrolls inside itself, SVG text 13 px in viewBox units under 520 px → 9.7 px at 358 px width). The coordinator should look at the ground-track map and the 16-button field row on a phone.
- RU: «Молния-3» № 50 and «Молния-2» № 14 for the catalogue names MOLNIYA 3-50 / 2-14; «Авангард-1» as on the site; King-Hele → Кинг-Хили; Kozai → Кодзаи; Hujsak is not transliterated (kept in Latin script, see Response to review); proposed glossary line: "mean elements" → «средние элементы», "osculating" → «оскулирующие», "secular" → «вековой», "epoch" → «эпоха», "two-line element set" → «двухстрочный набор элементов (TLE)».

## Freshness
claim | source URL | review-by date
--- | --- | ---
As of November 2026 the catalogue has run out of 5-digit numbers (11 July 2026); new objects have 6-digit numbers and no TLE; SATCAT at 101387 on 14 Nov 2026 | https://celestrak.org/NORAD/documentation/gp-data-formats.php | 2027-05-14
The five embedded element sets are dated 12–14 November 2026 (dated examples by design); all five objects still catalogued in orbit | https://celestrak.org/NORAD/elements/ | 2027-11-14
GOES-19 is GOES East at 75.2° W (since 7 April 2025) | https://www.nesdis.noaa.gov/news/noaas-goes-19-now-operational-goes-east-providing-critical-new-data-forecasters | 2027-05-14
Landsat 9 orbit: 705 km, 98.2°, 16-day repeat, crossing 10:12 a.m. ± 5 min | https://www.usgs.gov/landsat-missions/landsat-9 | 2027-11-14
Space-Track: element set number constant 999; Alpha-5 covers 100,000–339,999 | https://www.space-track.org/documentation | 2027-05-14

## Wiring (for the coordinator)
- Index label EN `Orbital Elements & Ground Tracks` · RU `Элементы орбиты и трассы спутников` · codename `ELEMENTS`, category `foundations`.
- `related`: physics-of-spaceflight, sunsync-earth-observation, relay-telstar-syncom, navigator-gps. Should link here: `physics-of-spaceflight`, `sunsync-earth-observation`, `relay-telstar-syncom` (also `navigator-gps`, `debris-space-junk`).
- MOD.json: 4 rows (Vanguard 1 1958-03-17, Molniya 3-50 1999-07-08, GPS IIF-7 2014-08-02, catalogue runs out of five digits 2026-07-11); none of these dates is in `assets/mission-of-day.js` (grepped 2026-11-15).

## Response to review (2026-11-15)
Three reviews (`REVIEW-A-physics.md`, `REVIEW-B-domain.md`, `REVIEW-C-history-language.md`), all APPROVE WITH CHANGES. Counts after the round: 31 references, 98 checks, all PASS. Earlier sections of this file describe the first draft; where they differ, this section is current (notably: the error statement is now the within-revolution maximum, the drag term is applied only below a 225-minute period, and the opening camera of instrument 1 looks from right ascension 270°).

### MUST
- **A-M1 (error sampled at one orbital phase).** Embedded a grid of SGP4 reference positions every 30 min for 72 h for each of the five TLEs (`REF_GRID`, 145 points each, python-sgp4 2.25, rounded to 10 m). The ground-track readout now shows the error at the nearest half hour and the largest error over the first 24 h and over all 72 h; the note says "between 15 and 29 km" in the first day (15.0 / 15.2 / 27.2 / 28.8 / 27.2) and "6 to 29 km at the epoch itself". The 30-min maxima equal the reviewer's 2-min maxima to 0.3 km (Landsat 9 over 72 h: 16.0 vs 16.3). New checks: grid integrity, first-day maxima, 72-h maxima, GPS 5.6 km at 24 h vs 27 km round the orbit, epoch errors.
- **A-M2 (Molniya 2-14 explanation).** Status rewritten as the reviewer established it: 40 min past perigee at the epoch, 96 km out there, 97 km the largest at the published times, about three quarters of it the Sun–Moon periodic correction of SDP4 (the reviewer's experiment, attributed to the reviewer on the page since I did not rerun it), the rest the J2 wobble. Check now tests ν = 95.6°, 40.4 min, r ≈ 15,000 km (well above the perigee radius).
- **B-M1 (69999, not 99999).** Chapter 4, the NUMBER field text, the 2026 timeline row, MOD.json row 4 (EN + RU), ref [6] note (second quote added) and freshness row 1 now say the ordinary numbers ran out at 69999 and continued at 100000; the 80,000–89,999 analyst range is cited to Space-Track [7]. Check added (text, timeline, MOD.json).
- **B-M2 ("no TLE at all").** Narrowed to CelesTrak [6]; Space-Track's Alpha-5 TLEs for 100,000–339,999 stated beside it [7]; the ref [7] note records that the same Space-Track page still carries an older, contradictory FAQ line. Timeline and freshness row changed to match. Check added.
- **B-M3 / C-S3 ("NASA rounds").** Now "NASA's tutorial quotes an approximate 63-day cycle" (EN + RU). Check added.
- **C-M1 (decoder on a phone).** `tleReveal()` centres the highlighted field in the scrolling box after every render (`.tle-box` is now `position:relative` so `offsetLeft` is measured from it), and a visible hint line sits under the box. Check simulates a 322 px box over 552 px of content.
- **C-M2 (clipped labels).** Map left margin 30 → 42 units and U+2212 minus signs; the equinox label is anchored at its end and clamped inside the figure; the last tick of the J2 chart (180°) and of the error chart (72 h / 48 h) is anchored at its end, the first at its start. Check added. Not re-screenshotted (authors may not run shot.sh): the coordinator or reviewer C should look again at 390 px.
- **C-M3 (false opening sentence).** The status prints M and ν in degrees and branches: under 1° apart "almost the same… swept at a nearly even rate", otherwise the size and sign of the gap and Kepler's second law. Check added (ISS and Molniya presets).
- **C-M4 ("far half").** Words changed to "on the apogee side of the Earth (true anomaly between 90° and 270°)", EN + RU; the check now also computes the geometric far half (0.716) to show the two differ.
- **C-M5 (Russian surname).** 2006 timeline row: «Дэвид Валладо с соавторами». Where the 1979 deep-space model is credited the author is written in Latin script in Russian (R. S. Hujsak). Check forbids any Cyrillic transliteration.

### SHOULD — done
- A-S1: GOES-19 status says the 22 km at the epoch is the Sun–Moon periodic term and that the J2 drift is then about as wrong as no drift, with the opposite sign, "for this element set". Check reworded (no longer presented as a property of the orbit).
- A-S2 / B-N6: Vanguard comparison worded as angles in the published output three days on, "about", including the periodic wobble (note and status). The CBERS-2 and Delta 1 debris node checks keep the same kind of comparison; their messages say "published … over 2 days".
- A-S3: the 10–25 km sentence scoped to "these four low-orbit cases … at the published times", with the Station's 47 km in three days beside it.
- A-S4 / C-S8: in KEPLER ONLY mode the readout and status use two-body facts (step 23.30°, node drift "none") and say the plane does not move. Check added.
- A-S5: chapter 7 eq-note states the units of ṅ/2 and what the drag mode does to a, e and the t³ term.
- A-S6 / C-S4: the ṅ/2 text for high orbits now says only that SGP4/SDP4 do not use it and that it is not air drag; the drag mode is not applied to sets with a period of 225 min or more (status says so). Check added.
- A-N1: "(on a map… the limit is about 0.2° higher)"; the dashed line is labelled "inclination 51.6°"; latitude checks now use 0.02° tolerances. A-N2 = B-S5. A-N3: at exactly 90° the node label and status say it does not drift. A-N4: the three checks that could not fail were removed; the 15.49 rev/day check now says it is just under NASA's general range.
- B-S1 / C-S1: Ceres with both dates (Zach 7 December [23], Olbers 31 December [31]) and a sentence that accounts differ; "eleven months later". New ref [31] (Weiss, Rutgers, opened: "Zach, on December 7, and then Olbers, on December 31"). The 31 December / 1 January 1802 version is mentioned in the ref note only, since I did not open a source for it.
- B-S2: SDP4 credited to R. S. Hujsak (1979) in chapter 7, the timeline (row now 1966–1979) and ref [1], from Spacetrack Report No. 3 (opened).
- B-S3 / C-N4: NASA's 22.9° explained as the 90-minute end of its own 90–93 min range; check computes 22.9° and 23.6° from the drift rate.
- B-S4: ephemeris-type text dated to Kelso 1998 and limited to the five sets shown; type 4 = SGP4-XP cited to new ref [30] (a.i. solutions FreeFlyer documentation, opened). New freshness row.
- B-S5: perigee "backward between 63.4° and 116.6°, forward again above"; check.
- B-S6 / C-S2: E. Buchar, Nature 182, 198–199 (July 1958) added to the 1958 row as new ref [29] (Crossref record opened; marked "bibliographic record only"; initial only, since the record gives "E.").
- B-N1 (OMM is XML/KVN; JSON and CSV are CelesTrak's), B-N2 (September 1957 issue; initials kept because the opened record gives initials), B-N3 (four satellites), B-N4 (NAVIGATOR link no longer promises the broadcast elements; cited to IS-GPS-200 [13]), B-N7 ("widely used"; 18 SDS added to the Space-Track freshness row).
- C-S5: camera azimuth fixed at right ascension 270° (|normal · view| ≥ 0.34 for the four inclined presets; equinox axis points right); node and perigee labels offset when close. Also fixed a bug found on the way: the front half of the Earth's equator was drawn on the far side.
- C-S6: "propagator" replaced by "orbit predictor" and J2 glossed in the lede; chapter 4 now introduces SGP4/SDP4 with a pointer to chapter 7; "March (vernal) equinox" and right ascension explained at first use (text, decoder, SVG label, aria).
- C-S7: every field text starts with its line and columns; year rule in the epoch and launch texts; day fraction worked out; n → T → a worked line with the size of SGP's correction; line number and repeated catalogue number explained; the unreachable classification branch removed. Checks added.
- C-S9: `.readout-cell .rl{text-transform:none}` in extra.css. Check.
- C-S10 to S17: «года» for decimal years; HUD uses «с. ш.»/«в. д.»; «обратно пропорционально… в степени 3,5» (EN "inversely as"); new ch. 3 heading; «Только Кеплер»; «даёт два равномерных эффекта»; «убраны усреднением»; «до 469 км» and «по состоянию на ноябрь 2026 года».
- C NITs done: N1, N2, N3, N5, N8, N9 (rows touched), N10 (Russian chapter references unpadded), N11, N12, N13, N15, N16, N17, N18, N19.

### SHOULD / NIT — left, with reasons
- B-N5 (Molniya 3-50's perigee has risen since 1999): needs a source for the launch orbit that I did not find; left out rather than asserted.
- C-N6 (two first names and one pair of initials in the 1959 row): the opened records give "R. K. Squires" only; kept.
- C-N7 (crowded but legible labels at 390 px) and C-N20 (talkative aria-live status lines, the site's pattern): left.
- C-N14 (one Russian unit word for revolutions): prose now says «витка в сутки в квадрате» and the decoder «витка/сут²»; the note of ref [4] still says «в оборотах в сутки», quoting the source's wording.
- A-S2 alternative (compare with SGP4's internal secular rates): not done, because those rates are not printed in a published source; the wording was fixed instead.

### Still unverified
- The lunisolar attribution for Molniya 2-14 and GOES-19 is reviewer A's experiment (pure-Python sgp4 with `_dpper` disabled); I did not reproduce it. The page attributes the Molniya figure to the reviewer.
- The 390 px fixes were not re-measured in a browser.
- Space-Track's logged-in API was not queried (no account): whether Alpha-5 TLEs are actually served today rests on its documentation, which contradicts itself on this point (recorded in ref [7]).
