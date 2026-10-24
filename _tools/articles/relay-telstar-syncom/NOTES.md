# RELAY — Telstar, Syncom & the geostationary idea (Wave 7)

**Purpose:** explain why communication satellites ended up on one ring 35,786 km up, through the history (Potočnik, Clarke, Echo, Telstar, Relay, Syncom, Early Bird, Molniya) and four pieces of orbital geometry the reader can manipulate. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations sit in eq-boxes.
**Owner:** Wave 7 author (agent), 2026-10-22. **Category:** Earth orbit. Neighbours not duplicated: NAVIGATOR (GPS, MEO constellations), DEBRIS (Kessler, LEO decay), SUNSYNC (J₂ nodal precession, used here only for the perigee/apsidal side), LINK (DSN link budgets).

## Outline (8 chapters, lede "Eight chapters and five instruments")
1. A tower that isn't there — Potočnik 1929 (42,300 km, 3,080 m/s, 35,900 km), Clarke 1945 (42,000 km, three stations, 1.2 kW); eq-box Kepler III for one sidereal day (computed radius printed live).
2. One sidereal day — **instrument 1**: period vs altitude (log–log), sidereal-day line, Echo 1 / Telstar / Relay 1 / Molniya / GEO markers; readouts period, speed, ground drift, up-and-down light time.
3. Echo and Telstar — **instrument 2**: Telstar 1's real orbit (CelesTrak elements of 21 Oct 2026) propagated through 22 Oct 2026 UTC; world map ground track + elevation at Andover and Pleumeur-Bodou with shared windows shaded; time slider, play (reduced motion: 15-min steps), "next shared window"; toggle to a GEO satellite at 28° W. Starfish Prime, Relay 1, Pierce's 25 satellites.
4. Syncom and Early Bird — **instrument 3**: figure-eight ground track of a 24-h orbit vs inclination; presets Syncom 2 33°, Syncom 3 1964 0.1°, Syncom 3 today 7.27°, Early Bird today 7.46°; readouts N–S / E–W swing, swing from zenith, years a dead satellite needs to drift to that tilt (53-yr cycle model).
5. Molniya — eq-box critical inclination; **instrument 4**: 24-h Molniya ground track vs inclination; readouts perigee/apogee, J₂ perigee drift °/yr, fraction north of equator, hours north of 50°.
6. The belt today — **instrument 5**: coverage geometry to scale; min-elevation slider and station-latitude slider (presets equator/Andover/Moscow/Norilsk); readouts footprint radius, % of Earth, satellites for a ring, elevation, one-way delay, question-and-answer delay. FCC 0.05° box, IADC protected region, CelesTrak census.
7. Legacy — timeline 1929–2026 (11 entries) + quote.
8. References — 24 sources (ref [24] added in review).

## Sources per number
- 42,300 km, 3,080 m/s, 35,900 km, "stationary orbit", ~6,400 km Earth radius, book dated 1929 — NASA SP-4026 pp. 72–74 + preface [1] (PDF downloaded and grepped).
- Clarke: 42,000 km radius / 24 h, three stations 30E/150E/90W, half the globe, 1.2 kW — rfcafe transcription of Wireless World Oct 1945 [2] (not the scanned original).
- Echo 1: 12 Aug 1960, 30.48 m, 0.0127 mm Mylar, 1,524 × 1,684 km, 118.3 min — NSSDC [3] (spacecraft + orbital pages).
- Telstar: 10 July 1962, 171 lb, 34.5 in, 593 × 3,503 mi, ~18 min at a time — NASA [4]; Andover horn 7 stories / 340 t / radome 160 ft, 11 July transmission, ×10 billion amplification — ETHW [5]; Pleumeur-Bodou reception — ETHW [22]; Starfish Prime (day before launch, 400 km, 1.4 Mt, flux ×100), failure Feb 1963, public broadcast 23 July, Pierce ~25 satellites — Scientific American [6].
- Relay 1: 13 Dec 1962, 1,322 × 7,439 km, 47.5°, 185 min, radiation experiments — NSSDC [7].
- Syncom 2: 26 July 1963, 33°, figure eight, 55° (W) longitude, 16 Aug, 71 × 39 cm, 68 kg, 29 W, one two-way telephone channel — NSSDC [8]; Hughes as contractor — Gunter [23].
- Syncom 3: 19 Aug 1964, 35,670 × 35,908 km, 0.1°, 180°, Tokyo Olympics, off April 1969 — NSSDC [9].
- Early Bird: 6 Apr 1965, 240 circuits or one TV channel, 28° W, 28 June service, 18-month design / ~4 years, reserve Jan 1969, Apollo 11 — Gunter [10]; "first commercial", 18 months / four years — IEEE ComSoc [11].
- Molniya-1 23 Apr 1965, first Soviet comsat, TV — ComSoc [12]; Molniya orbit 63.4°, e 0.722, 12 h; GEO radius 42,164 km — NASA Earth Observatory [13]; Orbita 1967, 20 stations, 73 ten years later, regions — ComNews 2021 [14] (Russian).
- 35,786 km, 23 h 56 min 4 s, three satellites near-global — ESA [15]; GM and ω — IERS 2010 ch.1 [16]; R_eq 6,378.137 km, J₂, 23.9345 h — NASA Earth fact sheet [17].
- 53-yr inclination cycle, max 14.5–15°, 7.3° Laplace-plane offset — Proietti et al. 2021 [18] (arXiv PDF, review section quoting Hechler and Friesen).
- IADC protected region ±200 km, ±15° — Johnson 2011, NASA NTRS [19]; 0.05° east–west — 47 CFR 25.210(j) [20].
- CelesTrak [21], retrieved 2026-10-22: 568 "Active Geosynchronous" objects (326 with i < 0.1°, 369 with i < 1°, counted by me from the JSON); Telstar 1 TLE (n 9.12893360 rev/day, e 0.2425019, i 44.7918°, epoch 26294.50630661); Syncom 3 i 7.2697°, Intelsat 1-F1 i 7.4572°.

## Computed (checks.js, 59 checks after review, all PASS)
Sidereal day 86,164.10 s; R_GEO 42,164.17 km; H_GEO 35,786.04 km; v_GEO 3.0747 km/s; Potočnik's 42,300 km → 24.05 h; Clarke's 42,000 → 23.79 h; Echo 118.29, Relay 185.10, Telstar 157.81 min (CelesTrak 157.74); 593 × 3,503 mi = 954 × 5,637 km; Telstar TLE perigee/apogee 947 × 5,638 km; Kepler residual < 1e-10 up to e = 0.999; **Telstar pass windows identical to python-sgp4 2.27** run on the same TLE (minute steps, TEME→ECEF by GMST, WGS84 stations): Andover 5 passes 12–44 min, Pleumeur 5, shared 4, longest 19 min (NASA: ~18); GEO at 28° W: Andover 23.6°, Pleumeur 29.3° constant; Syncom 2 33° → E–W ±5.03°, from zenith ±38.4°; drift model 7.55° (Syncom 3) / 7.08° (Early Bird) vs observed 7.27° / 7.46°; critical inclination 63.435°; Molniya a 26,562 km, 1,006 × 39,361 km, 91.6 % north of equator, apogees 65° E / 115° W; Earth 17.40° wide from GEO; footprint 81.30° (42.4 %); 3 satellites close the ring up to 21.9° min elevation, 4 above; 0.2387 s nadir, 0.2781 s edge, Q&A 0.48–0.56 s; Moscow 26.5°, Norilsk 12.1°; 0.05° = 36.8 km; ring 264,925 km; 360/568 = 0.634°; UI presets render without NaN in EN and RU.

## Assumptions / limitations
- Instrument 2: mean elements treated as osculating Kepler elements + J₂ secular node/perigee drift; no drag, no SGP4 short-period terms. Agrees with SGP4 to the minute for this day, but it is *today's* orbit orientation, not July 1962's (size and tilt are unchanged since 1962; the orientation has precessed). Horizon 0°, no terrain mask. Station coordinates are approximate (town/site level): Andover 44.633 N 70.700 W, Pleumeur-Bodou 48.786 N 3.524 W — not from a cited source.
- Instrument 3: circular orbit, period exactly one sidereal day; drift model i = 14.6°·|sin(πt/53)| is a simplification of [18] that assumes a start at 0° and the pole circling the Laplace pole; it ignores longitude libration toward 75° E / 105° W.
- Instrument 4: idealised Molniya (e 0.722, ω 270°, a for exactly 12 sidereal hours) per [13]; the first Molniya-1 satellites flew at about 65° (Gunter gives "65° typical"), which the page does not claim otherwise but does not mention either. Track drawn without J₂.
- Instrument 5: spherical Earth, station on the satellite's meridian; delay is geometric (no processing/ground-network delay).
- City latitudes (Moscow 55.75°, Norilsk 69.35°) are standard values, not separately cited.

## Unverified / judgment calls
- NASA's "about two-thirds of that time over one hemisphere" (Molniya, [13]) is not used: for e 0.722 and ω 270° the satellite is north of the equator 91.6 % of the time; the NASA phrasing is probably loose. Reviewer may want to look.
- NSSDC gives Syncom 2's transfer orbit drift as 7.5°/day east for 34,100 × 36,440 km; the circular-orbit formula gives 6.7°/day. Not used in the text.
- Telstar "failed in February 1963": Scientific American says February 1963; the commonly quoted exact date (21 Feb) was not found in an opened source, so the page says "February 1963".
- Clarke quotes are from a web transcription, not the scanned magazine.
- Orbita's opening date is given only as 1967 (sources differ between 25 Oct, 2 Nov and 4 Nov 1967).
- NSSDC Master Catalog records for Telstar 1 (1962-029A), Early Bird (1965-028A) and Molniya 1-1 (1965-030A) returned server errors on 2026-10-22; facts came from NASA/ETHW/SciAm/Gunter/ComSoc instead.
- RU codename: RELAY → «РЕТРАНСЛЯТОР».

## Freshness
claim | source URL | review-by date
--- | --- | ---
568 active geosynchronous satellites as of October 2026 (326 within 0.1°, 369 within 1°); spacing 0.63° | https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=json | 2027-04-22
Telstar 1 still in orbit, 157.7-min orbit; instrument 2 uses its elements of 21 Oct 2026 | https://celestrak.org/NORAD/elements/gp.php?CATNR=340&FORMAT=tle | 2027-10-22
Syncom 3 inclination 7.27°, Early Bird 7.46° (October 2026; drift ~0.1°/yr changes the "today" presets) | https://celestrak.org/NORAD/elements/gp.php?CATNR=858&FORMAT=tle , https://celestrak.org/NORAD/elements/gp.php?CATNR=1317&FORMAT=tle | 2027-10-22
FCC 0.05° east–west station-keeping rule | https://www.law.cornell.edu/cfr/text/47/25.210 | 2027-10-22

## Wiring (for the coordinator)
- Index label EN: `Telstar, Syncom & the Geostationary Orbit` · RU: `«Телстар», «Синком» и геостационарная орбита` · codename `RELAY`, category Earth orbit.
- llms.txt: `Communications satellites from Potočnik's and Clarke's 35,786 km orbit to today's belt: period vs altitude from Kepler's third law and one sidereal day, Telstar 1's real passes over Andover and Pleumeur-Bodou (propagated from CelesTrak elements, checked against SGP4) against a fixed geostationary dish, Syncom 2's figure eight and the 53-year drift of dead GEO satellites, the Molniya orbit's 63.4° critical inclination, and geostationary footprint, latency and station-keeping.`
- MOD.json: 3 candidate rows (Telstar 1, Syncom 3, Molniya-1), type `leo` (no GEO trajectory type exists in the widget).

## Response to review (2026-10-23, see REVIEW.md)
Verdict: APPROVE WITH CHANGES. All MUST items applied in the sources, rebuilt, `./check-all.sh relay-telstar-syncom` → ALL OK (59 checks).
- Ch.5: early Molniya-1 satellites flew at about 65° (not the idealised 63.4°), apogee drift only a few °/yr; new ref [24] Gunter "Molniya-1" ("65° (typical)"). EN + RU.
- Ch.5 eq-note: "at any other tilt … within months" → far tilts (50°/75°) within months, a degree or two off within a few years (the instrument gives ~62 months at 65°). Checks: dω/dt(65°) ≈ −5.76°/yr; 50°/75° move 30° in under a year.
- Ch.5 model note: reconciles NASA's "about two-thirds over one hemisphere" [13] = time north of ~45° (0.676); north of the equator 91.6 %. Check added.
- Ch.3: sentence that today's Telstar orbit orientation differs from July 1962 (J₂ has turned it), so pass times/lengths are not 1962's; check label reworded.
- Ch.3 time slider: `aria-valuetext` (UTC time + elevation at both stations), check added.
- RU: degree sign restored in the two drift statuses of ch.2; RU/EN year plurals (год/года/лет, year/years) via `yearsWord()`; checks added.
- SHOULD items also applied: Syncom 3's 16° after the third-stage yaw manoeuvre, then apogee motor (NSSDC); "Some of its transistors failed" (matches [6]); translated `data-aria-*` labels on the six button groups.
- Open: cite station coordinates; IERS PDF [16] unreachable from this host on 2026-10-23 (re-check); RU decimal comma on the 63.4° preset.
- Screenshots retaken: 1300 (6 tiles) and 390 via a 26,000 px scratch copy of shot.sh (page 21,039 px at 390).
