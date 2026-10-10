# SCORCH — Mercury: MESSENGER & BepiColombo — author notes

- **Slug:** `scorch-mercury-messenger-bepicolombo` · **Category:** `probes` · **Owner:** Wave 5 author team (2026-10-09)
- **Purpose:** explain why Mercury is the hardest planet to *stop at* (not to reach), how gravity assists solved it (Mariner 10 → MESSENGER → BepiColombo), the thermal problem, and the 3:2 spin–orbit resonance; report BepiColombo's status honestly as of 9 Oct 2026.
- **Audience:** curious general readers through engineering students; no calculus needed, and the equations are shown for those who want them.
- **Structure:** 9 chapters (7 content + LEGACY + REFERENCES), lede says "Nine chapters" (same convention as Waves 2–4). 19 references (after review), cited in order of first appearance.

## Instruments
1. **CH1 Hohmann + minimum capture** (Venus, Mars, Mercury, Jupiter): stacked bars, departure Δv from 1 AU + smallest capture burn at 200 km altitude; line at 12.34 km/s (escape from 1 AU).
2. **CH3 Capture burn vs arrival speed**: Δv into MESSENGER's 12-h orbit (200 km low point) and into a 200 km circle; presets "Hohmann, no flybys" (9.61 km/s) and "MESSENGER after 6 flybys" (2.27 km/s, back-computed).
3. **CH4 Sunlit-plate temperature** vs distance with an α/ε slider; Mercury's orbit band, the MESSENGER shade's predicted 370 °C, and the 725 K maximum ground temperature.
4. **CH5 3:2 resonance animation**: Kepler-solved orbit (bisection solver, safe at any e), uniform spin, red surface marker, local solar clock, retrograde-Sun flag near perihelion. Time slider is keyboard-operable; Play/Pause/Reset buttons; never autoplays; slower under `prefers-reduced-motion`.

`checks.js`: 31 checks after review, all passing (`_tools/check-all.sh scorch-mercury-messenger-bepicolombo` → ALL OK).

## Key numbers and their sources
| Number | Source |
|---|---|
| Mercury GM 22,032, R 2,439.7 km, a/q/Q 57.909/46.000/69.818 Mkm, e 0.2056, 47.36 km/s, 87.969 d, spin 1,407.6 h, day 4,222.6 h, irradiance 6.674×, 590–725 K, obliquity 0.034°, Bond albedo 0.068, black-body 439.6 K | NASA Mercury fact sheet [1] |
| 29.78 km/s, 1,361 W/m², 1 AU = 149.598 Mkm | NASA Earth fact sheet [2] |
| μ☉ | NASA Sun fact sheet [5]; Venus/Mars/Jupiter GM/R/a: NASA planetary fact sheets [6] |
| "More energy than Pluto", Mio 590×11,640 km, MPO 480×1,500 km | ESA Journey to Mercury [4] |
| Mariner 10 dates, ranges, temperatures | Beyond Earth SP-2018-4041 entry 144 [7]; Colombo's 176-day orbit, 40–45 % coverage: NASA History [8] |
| MESSENGER 1,107.9 kg, launch/flyby/MOI/impact dates, 25 km, 200,000 images, 14,080 km/h | Beyond Earth entry 206 [7], NASA mission page [10] |
| 600 kg propellant (54 %), 2.5×2 m ceramic sunshade, 370 °C predicted front / 20 °C behind | APL Spacecraft & Instruments [9] |
| 15-min MOI, "just over 0.86 km/s" (862 m/s in APL press releases), 31 % propellant, 12-h orbit, ~200 km minimum altitude, 8-h orbit 278×10,314 km | APL Orbit Insertion page [11] |
| 59 ± 5 days (Arecibo, Apr 1965); 58.65 d = ⅔ orbit | Pettengill & Dyce 1965 [12]; Colombo 1965 [13] |
| North-pole water ice (neutron spectrometer) | Lawrence et al. 2013 [14] |
| BepiColombo 4,100 kg, MPO 1,230, Mio 255 kg, all 9 flyby dates, milestones | ESA factsheet [15] |
| April 2024 power fault, new trajectory, 4th flyby 4 Sep 2024 ~165 km | ESA [16] |
| MTM separation 3 Sep 2026, 11.4 m/s burn 24 Sep, MOI 21 Nov 2026, separation 9–10 Dec, science Apr 2027 | ESA Latest updates (page dated 6 Oct 2026, checked 9 Oct 2026) [17] |

Computed in `script.js` and checked: Hohmann figures (Mercury 7.53 out / 9.61 in, total 13.89 km/s; Mars 2.95 km/s / 259 d); escape from 1 AU 12.34; 12-h orbit apoapsis 15,194 km; arrival v∞ 2.27 km/s from the 0.862 km/s burn; Mio/MPO periods 9.3 h / 2.36 h; perihelion/aphelion irradiance 10.58× / 4.59×; solar day 175.97 d; retrograde Sun ≈ 8.1 d per orbit.

## Assumptions and known limitations
- CH1: circular, coplanar planetary orbits at mean distance; Earth-escape cost excluded; "minimum capture" means just bound at 200 km periapsis. Mercury's real eccentricity and inclination (7°) make the true cost route-dependent. Pluto is deliberately **not** charted: under these assumptions a Pluto Hohmann + minimum capture comes out ≈ 14.5 km/s, slightly above Mercury, so ESA's "more than Pluto" statement is quoted as ESA's (it likely assumes a different Pluto mission profile) rather than reproduced.
- CH3: single impulsive burn at periapsis; the real MOI was a 15-minute finite burn. The 2.27 km/s arrival speed is **back-computed**, not a published figure.
- CH4: one-sided flat plate; real shades are cooler. The model's black plate at perihelion (≈ 710 K) lands within 3 % of Mercury's maximum ground temperature (725 K) — presented as a sanity check, not as physics of regolith.
- CH5: Mercury drawn enlarged; spin uniform; no libration.

## Discrepancies found in sources
- **MESSENGER initial orbit:** Beyond Earth and the NASA mission page both say "approximately 9,300 × 200 km with a 12-hour period". That is physically inconsistent: a 200 × 9,300 km orbit has a 7.2 h period. A 12-h orbit with a 200 km low point has a ~15,190 km high point, which matches the commonly cited 15,193 km; "9,300" looks like miles (≈ 15,000 km). The page uses the 12-hour period and 200 km (APL) and derives the high point; it does not quote "9,300".
- NASA's MESSENGER page lists 2 August 2004 (EDT) as the launch date and 11 March 2011 under Key Dates in places; the page uses 3 August 2004 UTC and 18 March 2011 UTC (Beyond Earth, APL).
- **BepiColombo second Venus flyby:** ESA's factsheet [16] lists 11 August 2021; JAXA [19] gives closest approach 10 August 2021, 22:51:53 JST = 13:51 UTC (552 km), matching ESA's flyby coverage. The page uses 10 August and says so in the table caption.
- MESSENGER sunshade front temperature: APL's spacecraft page says "predicted to reach 370 °C"; other APL papers say "well above 300 °C". The page says "predicted 370 °C".

## Not verified / judgment calls
- `doi.org/10.1126/science.1229953` returns 403 to scripted requests (science.org blocks bots); the DOI is valid per Crossref.
- BepiColombo status is as of ESA's 6 Oct 2026 update. **After 21 Nov 2026, update CH7, the timeline, the table and the hero lede** (arrival is described as planned throughout).
- The BepiColombo transfer-module thrust (mN) and the "90 % of capacity" figure in press reports were not used (no ESA primary source found).

## Suggested wiring
- Index label EN: `Mercury: MESSENGER & BepiColombo` · RU: `Меркурий: MESSENGER и BepiColombo` · codename `SCORCH`
- llms.txt: `Why orbiting Mercury costs more than leaving the Solar System (Hohmann + capture calculator), Mariner 10 and Colombo's gravity assists, MESSENGER's six flybys and 0.86 km/s capture, sunshade thermal model, the 3:2 spin–orbit resonance animated (176-day solar day, retrograde Sun), polar ice, and BepiColombo's arrival planned for 21 November 2026.`

## Response to review (2026-10-09)

Everything below is from `REVIEW.md` (verdict APPROVE-WITH-CHANGES). After the changes, `check-all.sh` → ALL OK: 31 checks, 19 refs = max citation 19, missingRu 0. The jsdom interaction run found no errors and no NaN, and citations are in first-appearance order 1–19.

**MUST-FIX (all done)**
1. BepiColombo Venus-2 changed to **10 Aug 2021** (EN/RU table). Verified on JAXA's page and added it as ref [19]. A table caption gives the sources and states ESA's 11 August discrepancy (also logged above). New check asserts the date.
2. The CH3 superlative is replaced with the review's wording in EN/RU: "almost eight times MESSENGER's actual 0.862 km/s burn, far more than its propellant could supply". 6.63/0.862 = 7.7.
3. CH3 chart marker labels ("Hohmann" and "MESSENGER") are now end-anchored to the left of their lines, so neither can overflow the viewBox.

**SHOULD (done)**
- **DSMs:** verified on APL's Mission Design page: DSM-1…5 = 315.6 + 227.4 + 72.2 + 222.1 + 24.7 + 177.75 = 1,039.75 m/s. Added it as ref [12]; old refs 12–17 renumbered to 13–18 (array indices untouched — audited). The text now credits "six flybys, helped by five smaller deep-space burns totalling about 1.04 km/s". Preset relabelled "MESSENGER AFTER ITS FLYBYS / MESSENGER ПОСЛЕ ПРОЛЁТОВ". Check added. APL's ">91 % from flybys" was not found on that page, so it is not used.
- **Lede:** now says "four instruments", lists the capture calculator, and says "nearly eleven times" (EN/RU). Also took the RU-nice "планет земной группы".
- **CH7 status:** now says "As of 9 October 2026, orbit insertion is planned…" (EN/RU).
- **Pluto:** the model figure is disclosed next to ESA's quote. Check added using the NASA Pluto fact-sheet values (a = 5,869.656 Mkm, GM 870, R 1,188 km): 14.55 km/s.
- **CH6:** the 200,000th orbital image (Feb 2014) vs "at least 1,000", and the 25 km chronology (deliberate low orbits, then out of propellant), both corrected in EN/RU.
- **CH5 history:** softened to "Until 1965 the textbook answer was…". The cited abstracts don't state the 88-day belief, so I did not cite it.
- **CH5 timing:** "for a few days" unified to "about eight Earth days around each perihelion" (SC-nice).
- **CH1 label collision:** the escape-line label moved into the strip under Jupiter's bar (y ≈ 260), clear of the legend.
- **CH3 curve labels:** moved mid-chart, above the dashed circular curve (at v∞ 5.6) and below the 12-hour curve (from v∞ 6.4), away from the crowded top-right.
- **CH5 live region:** `#dayStatus` is written only when its text changes, so it no longer updates every animation frame.
- **RU accessible names:** SVG and button-group `aria-label`s are now set in `renderAll()` via `T()` (page-local; the site-wide helpers.js approach is left to the coordinator).
- **RU CH4:** "обратно пропорционален квадрату расстояния" and "в 4,6–10,6 раза сильнее земного". RU-nice "радиолокационный" also taken.
- **Nice items taken:** the sunshade construction wording ("ceramic cloth wrapped around…"), and `aria-valuetext` with units on all four sliders.

**Declined / deferred**
- **RU no-break spaces in body thousands (RU-nice 5):** deferred. It matches existing guides; a site-wide pass would be more consistent.
- **`.svg-small` contrast (InfoDesign-nice 5):** shared style, out of scope for a single guide.
- **Colombo's 1970 Venus-flyby credit in CH2 (Research-nice 7):** not added. CH2 already credits him via NASA History and the length stays down; can add if wanted.
