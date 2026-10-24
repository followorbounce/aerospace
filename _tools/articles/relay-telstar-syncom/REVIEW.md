# REVIEW — RELAY (Telstar, Syncom & the geostationary idea)

**Date:** 2026-10-22/23 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There are six MUST-FIX items, all applied (see "Consolidated MUST-FIX"). Every computed number re-derives independently. The Telstar pass windows match python-sgp4 2.27 to the minute. The MUST items are:
- a historical conflation: Molniya-1 is presented at 63.4°, but it actually flew at about 65°;
- a physics overstatement that the guide's own instrument contradicts;
- the Telstar instrument does not say that its orientation is today's, not 1962's;
- the time slider has no `aria-valuetext`;
- two Russian status strings lose their degree sign.

Reviewer scripts: `/tmp/claude-1000/-home-none-git/98d54dca-fa8e-4aef-8d4f-2f576b4a6497/scratchpad/review-relay/` (`phys.py`, python-sgp4 in `pylib/`, `geo.json` = CelesTrak GEO group as fetched).
`./check-all.sh relay-telstar-syncom` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 24/24, timeline 11, 59 checks PASS).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

Independent re-derivation (Python, own code):

| Quantity | Reviewer | Page |
|---|---|---|
| Sidereal day 2π/ω | 86,164.10 s = 23.93447 h | 23 h 56 min 4 s ✔ |
| R_GEO, H_GEO, v_GEO | 42,164.17 km; 35,786.04 km; 3.0747 km/s | ✔ |
| Potočnik 42,300 km → period, speed | 24.05 h; 3.070 km/s | text quotes 3,080 m/s (book); within 0.3 % ✔ |
| Clarke 42,000 km → period | 23.79 h | "exactly 24 h" quoted as Clarke's ✔ |
| Echo / Telstar / Relay from mean altitude | 118.29 / 157.81 / 185.10 min | ✔ |
| 593 × 3,503 mi | 954.3 × 5,637.5 km | ✔ |
| Telstar TLE (re-fetched, identical) a; perigee × apogee; P | 9,670.6 km; 947 × 5,638 km; 157.74 min | ✔ |
| **SGP4 windows on 22 Oct 2026** (minute steps, TEME→ECEF by GMST82, WGS84 stations) | Andover 5 passes 12/21/31/43/44 min; shared [553–556], [717–727], [882–901], [1056–1073] → longest 19 min | identical ✔ |
| GEO at 28° W elevation | Andover 23.58°, Pleumeur 29.29° | ✔ |
| Figure eight swing at 33° / 0.1°; from zenith at 33° | ±5.034° / 4.4e-5°; 38.39° | ✔ |
| Drift model at 62.17 / 61.54 yr | 7.55° / 7.08° (observed 7.27° / 7.46°) | ✔ |
| Critical inclination | 63.4349° | ✔ |
| Molniya a; perigee × apogee | 26,561.8 km; 1,006 × 39,361 km | ✔ |
| Fraction north of the equator (200,000 samples) | 0.9158 | 91.6 % ✔ |
| North of 50° / 45° | 7.21 h of 12 / **0.676** | 7.2 h ✔ |
| Perigee drift at 50 / 62 / 65 / 75° | +57.4 / +5.5 / **−5.76** / −35.8 °/yr | instrument ✔, eq-note ✗ (see 1.1) |
| Earth's angular size; λ(0°), cap | 17.40°; 81.30°, 42.4 % | ✔ |
| λ(5°), λ(10°); ε at which λ = 60° | 76.3°, 71.4°; 21.93° | ✔ |
| Delay nadir/edge; Q&A | 0.2387 / 0.2781 s; 0.477–0.556 s | ✔ |
| Moscow / Norilsk elevation | 26.47° / 12.15° | ✔ |
| 0.05° box; ring; spacing | 36.80 km; 264,925 km; 466 km, 0.634° | ✔ |
| CelesTrak GEO group today | 568 objects, 326 < 0.1°, 369 < 1° | ✔ |

- `checks.js` tests published values (NASA, ESA, NSSDC, CelesTrak, the SGP4 reference windows) and not just the code against itself. The SGP4 reference is hard-coded from an external propagator, which is the right design.
- The Kepler solver starts Newton from E = π. Its residual is below 1e-10 up to e = 0.999.
- The J₂ secular rate formulas are standard (dΩ/dt = −(3/2) n J₂ (R/p)² cos i; dω/dt = (3/4) n J₂ (R/p)² (5cos²i − 1)).

Findings:
1. **MUST — the eq-note contradicts the instrument.** The eq-note says "At any other tilt the apogee would wander away from the north within months". At 65° (and at 62°) the rate is about 5.5–5.8°/yr. The Molniya instrument itself says "in about 62 months the apogee would slide 30°". Only tilts far from 63.4° drift "within months". *Fixed:* "Far from that tilt — at 50° or 75° — … within months; a degree or two off, within a few years" (EN + RU). Checks were added for 65° (−5.76°/yr) and for 50°/75° (30° in under a year).
2. **SHOULD (author query) — Molniya "91.6 % north of the equator" vs NASA's "about two-thirds over one hemisphere".** The page's 91.6 % is correct for e 0.722, ω 270°. NASA's two-thirds matches the time spent north of about 45° (0.676 in the model), which is the useful, high part of the dwell. The page should keep its framing and add one reconciling sentence, because a reader who opens [13] will see "two-thirds". *Applied* to the Molniya model note (EN + RU), with a check (fraction north of 45° ≈ 2/3).
3. **NICE (author query) — Syncom 2 drift: 7.5°/day (NSSDC) vs 6.73°/day from the formula** at the mean of 34,100 and 36,440 km. NSSDC probably quotes the observed drift from a slightly different orbit. The page does not use either number, so nothing needs to change. Keep the note in NOTES.

## 2. Historian / fact-check — APPROVE WITH CHANGES

Opened and confirmed today:
- **NASA Telstar page:** 10 July 1962; 171 lb, 34.5 in; 3,503 × 593 mi; "only about 18 minutes at a time"; built by Bell Laboratories ✔
- **ETHW Andover:** seven stories, 340 tons, radome 160 ft, 11 July 1962, "ten billion times" ✔
- **ETHW Pleumeur-Bodou:** 11 July 1962, 64 m radome, museum ✔
- **Scientific American:** 1.4 Mt, 400 km, "a hundred times what was predicted", February 1963, 23 July broadcast, Pierce's 25 satellites ✔
- **NSSDC Syncom 2:** 68 kg fuelled, 71 × 39 cm, 29 W, 33° figure eight, service 16 Aug, "over the Atlantic Ocean and Brazil at 55 degrees longitude" → W ✔
- **NSSDC Syncom 3:** 0.1°, 180°, Olympics, off April 1969 ✔
- **Gunter, Early Bird:** 240 circuits / one TV channel, 28° W, 28 June, 18 months, "nearly 4 years", reserve Jan 1969, recalled June 1969 for Apollo 11 ✔
- **ComNews:** Orbita 1967, 20 → 73 stations, regions ✔
- **NASA Earth Observatory:** 42,164 km; Molniya 63.4°, 0.722, 12 h ✔
- **CelesTrak:** all three TLEs and the GEO counts re-fetched, identical ✔
- **Clarke transcription (rfcafe):** the 42,000 km / 24 h sentence, half the globe, three stations at 30 E / 150 E / 90 W, 1.2 kW for broadcasting ✔

Link status:
- The NSSDC records for Telstar 1 (1962-029A) and Early Bird (1965-028A) still return the NSSDC error page. The author was right to use secondary sources.
- The IERS Conventions PDF (ref [16]) did not respond from this host (timed out twice). See open items.

Findings:
1. **MUST — Molniya-1 is presented at 63.4°.** The text says "The Soviet answer was a long ellipse tilted 63.4° … Molniya-1, launched on 23 April 1965 …". Gunter's Molniya-1 page gives "500 km × 40000 km, 65° (typical)". The first satellites flew at about 65°, where the perigee drifts only about 6°/yr, so the idealised 63.4° is not what Molniya-1 flew. *Fixed:* added "the early Molniya-1 satellites actually flew at about 65°, close enough to the critical tilt that their apogee drifted only a few degrees a year [24]" (EN + RU), plus new ref [24] (Gunter, Molniya-1). The instrument's idealised 63.4° stays as the model of the orbit type.
2. **SHOULD — Syncom 3's tilt removal is under-described.** NSSDC says the third stage made a yaw manoeuvre that left a 16° inclination, and then "the apogee motor was fired to remove most of the remaining inclination". *Applied:* "was left at a 16° tilt by a sideways turn of its rocket's third stage; its apogee motor and thrusters removed the rest" (EN + RU).
3. **SHOULD — "Transistors in its command system failed"** goes beyond source [6], which says only "some transistors had failed". *Applied:* "Some of its transistors failed" (EN + RU).
4. **NICE (author query) — Telstar failure "February 1963".** This is what [6] supports. 21 February 1963 is widely quoted (NSSDC record, now offline). "February 1963" is fine as written.
5. **NICE (author query) — Orbita "1967".** The cited source gives only the year, and other sources differ on the day. Fine as written.
6. **NICE (author query) — Clarke quotes from a transcription.** The quoted fragment matches the OCR text exactly. The reference title already says "(transcription)". Acceptable.
7. **NICE — Early Bird was briefly reactivated in 1990 for its 25th anniversary** (widely reported; not in an opened authoritative source). "Nobody has steered them since" remains true, because that reactivation did no station-keeping.

## 3. Science communication & Education — APPROVE WITH CHANGES

The guide has a strong spine: one number (35,786 km), three ways to miss it (Telstar too low, Syncom 2 tilted, Molniya deliberately elliptical), and a present-day coda. All five instruments are genuine manipulations, and their captions match what they show. The figure-eight "stretched ×9.6" label and the "seen from below" readout are good teaching touches.

1. **MUST (author query) — the Telstar instrument uses today's orbit orientation without saying what that implies.** The text says "22 October 2026" but also "watch Telstar's real passes" under the heading "Eighteen minutes at a time". The instrument's longest window (19 min) agrees with NASA's 1962 "about 18 minutes" largely by coincidence, because J₂ has turned the node and perigee through many full cycles since 1962. *Fixed:* added to the chapter-3 paragraph: "The size and tilt of the orbit are Telstar's own, but Earth's bulge has turned it around many times since 1962, so today's pass times and lengths are not those of July 1962 — only the kind of thing the engineers faced." (EN + RU). The checks.js label was reworded so it no longer reads as a validation of 1962.
2. **SHOULD — the station coordinates are uncited.** The note says "approximately". Moving a station by about 1 km changes rise and set times by seconds, below the 1-minute sampling, so the windows are robust. Could be closed by citing a gazetteer or the radome's own coordinates. Left open.

## 4. Design, UX & Accessibility — APPROVE WITH CHANGES

Screenshots retaken after the edits. The 1300 px capture is 6 tiles. The 390 px capture was taken with a scratch copy of shot.sh at 26,000 px window height (9 tiles, page 21,039 px), because the stock 14,000 px window cuts off the page at 390 px. The layout is clean at both widths:
- figures stack at 390 px;
- button rows wrap;
- readouts stay in two columns;
- SVG text grows under 520 px.

Present and working:
- `.btn`/range at least 44 px; focus-visible outlines;
- reduced motion (PLAY steps 15 min per press instead of animating);
- `aria-live` statuses; SVG aria-labels re-set per language;
- `aria-valuetext` on 5 of 6 sliders.

1. **MUST — the time slider `tsT` has no `aria-valuetext`.** A screen reader announces "882" instead of a time. *Fixed:* "14:42 UTC, Telstar elevation: Andover 59.1°, Pleumeur-Bodou 1.6°" (GEO mode and RU too). A check was added.
2. **SHOULD — the button-group labels are English in RU** ("Preset orbits", "Satellite", "Animation", "Preset inclinations" ×2, "Ground station"). *Applied:* `data-aria-en`/`data-aria-ru` on all six. renderAll already maps them.
3. **NICE — the 63.4° Molniya preset reads "63.4°" in RU** (should be «63,4°»). The same applies to "50°/75°" (no change needed there).
4. **NOTE for the coordinator:** at 390 px the stock `shot.sh` truncates this page at 14,000 px. The page is 21,039 px tall. This is a tool limit, not a page defect.

## 5. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is natural and the terminology is correct: угол места, ГСО, наклонение, апогейный двигатель, радиопрозрачный купол, «Плёмёр-Боду», «Эрли Бёрд», «Старфиш Прайм». Numbers follow the site rule (four digits unspaced). EN/RU parity is complete (missingRu 0).

1. **MUST — two RU status strings dropped the degree sign.** "Быстрее вращения Земли: спутник уходит на 12,3 в сутки вперёд…" and "…смещается на 3,1 в сутки к западу." *Fixed:* «12,3° в сутки». A check was added.
2. **SHOULD — wrong RU plural for years.** The figure-eight readout and status printed «1 лет», «2 лет» … «4 лет», and EN printed "≈ 1 years". *Applied:* a `yearsWord()` helper (год/года/лет; year/years), with a check.

## 6. Ethicist — APPROVE

The Soviet programme is treated fairly: Molniya is "the Soviet answer" for real geographic reasons, with the Orbita network credited. Starfish Prime is described factually, as a US test whose side effect killed a US satellite, with no sensationalism. Potočnik is credited ahead of Clarke. No speculation is presented as fact. No issues.

---

## Consolidated MUST-FIX (all applied)

1. **Molniya-1 at about 65°, not 63.4°.** Clause added and new ref [24] (Gunter), EN + RU (§2.1).
2. **Eq-note "within months at any other tilt".** Corrected to near/far tilts, with checks at 50/65/75° (§1.1).
3. **Telstar instrument shows today's orientation.** Sentence added in EN + RU; check label made honest (§3.1).
4. **`tsT` slider `aria-valuetext`.** Added, with a check (§4.1).
5. **RU drift statuses lost "°".** Fixed, with a check (§5.1).
6. **The Molniya "two-thirds" discrepancy that a reader of [13] will meet.** The reconciling note was applied together with item 1 (listed as SHOULD §1.2, but applied).

## SHOULD / NICE left open
- **§3.2:** cite the station coordinates.
- **§2 (links):** IERS ref [16] did not respond from this host on 2026-10-23. Re-check it, and if it is dead use the IERS TN36 landing page https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html.
- **§4.3:** RU decimal comma on the 63.4° Molniya preset.
- **§2.4–2.7, §1.3:** NICE items; the author's choices are acceptable as written.
- **MOD.json:** Syncom 3 is typed `leo` because the widget has no GEO trajectory type. This is the coordinator's call when wiring.
