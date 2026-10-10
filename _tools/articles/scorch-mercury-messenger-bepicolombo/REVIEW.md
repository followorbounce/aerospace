# SCORCH — Mercury: MESSENGER & BepiColombo — cross-disciplinary review

- **Date:** 2026-10-09
- **Reviewed:** `scorch-mercury-messenger-bepicolombo.html` and the sources in this folder (`body.html`, `script.js`, `checks.js`, `extra.css`, `meta.json`, `NOTES.md`)
- **Process:** AGENTS.md "Cross-Disciplinary Review Process" and "Peer Review Process". Each lens reviews only against its own criteria.
- **Overall verdict: APPROVE-WITH-CHANGES.** The physics is sound and every computed number reproduces independently. The BepiColombo status matches ESA's 6 Oct 2026 update. There are three MUST-FIX items (one wrong date, one superlative that isn't true, one clipped chart label), plus a set of SHOULD items. Nothing blocks.

Tooling: `./check-all.sh scorch-mercury-messenger-bepicolombo` returns ALL OK: 27/27 checks, 0 missing `data-ru`, max citation 17 = 17 references, 11 timeline rows.

---

## 1. Physics & Mathematics — APPROVE-WITH-CHANGES

I re-derived the key numbers in a separate script (`scratchpad/review-scorch/rederive.py`, Python, using μ☉ = 1.32712440018e11), not with `script.js`:

| Quantity | Independent | Page |
|---|---|---|
| Mercury Hohmann departure / v∞ / min. capture / total | 7.533 / 9.612 / 6.358 / 13.891 km/s | 7.53 / 9.61 / — / 13.9 ✓ |
| Mars departure, transfer time | 2.945 km/s, 258.9 d | ✓ |
| Escape from 1 AU (heliocentric) | 12.337 km/s | 12.3 ✓ |
| 12 h orbit, 200 km periapsis → apoapsis altitude | 15,194 km (v_p 3.810, v_esc 4.086 km/s) | ~15,200 ✓ |
| v∞ implied by a 0.862 km/s impulsive burn | 2.267 km/s | 2.27 / "roughly 2.3" ✓ |
| Capture from the Hohmann v∞ into the 12 h orbit | 6.63 km/s | ✓ |
| 200 × 9,300 km orbit period (NOTES discrepancy) | 7.17 h | NOTES correct: "9,300" cannot be a 12 h orbit ✓ |
| APL 278 × 10,314 km / Mio 590 × 11,640 / MPO 480 × 1,500 | 8.00 / 9.30 / 2.36 h | ✓ |
| Irradiance at q / a / Q | 10.58 / 6.674 / 4.59 × Earth | ✓ |
| Black plate at perihelion | 709.8 K | ✓ (within 3 % of 725 K) |
| Solar day | 175.97 d (fact sheet 4,222.6 h = 175.94 d) | ✓ |
| Retrograde-Sun interval (my own check: Newton–Kepler on a 2 M-point grid, comparing dν/dt with ω_spin) | 8.11 d | 8.1 ✓ (matches the standard "~4 days either side of perihelion") |
| Pluto Hohmann + min. capture, same rules | 14.55 km/s | NOTES' 14.5 ✓ |

The models are right and their assumptions are stated in each eq-note: circular coplanar orbits, Earth escape excluded, a single impulsive periapsis burn, a one-sided plate, uniform spin. The Kepler solver uses bisection, which is safe. The 3:2 animation geometry is correct: at t = 0 the marker faces the Sun at perihelion, and the local hour is 0. `checks.js` tests what the text claims, against published anchors where they exist: fact-sheet irradiance, 4,222.6 h, 15,193 km, the APL 8 h orbit and the fact-sheet black-body 439.6 K.

Findings:

1. **SHOULD. The flybys did not do all the braking.** In CH3 the text says *"Run the calculator backwards from those figures and the flybys had cut the arrival speed from 9.6 km/s to roughly 2.3 km/s."* The preset is labelled *"MESSENGER AFTER 6 FLYBYS"*. MESSENGER also flew five deep-space manoeuvres, DSM-1 to DSM-5, totalling ≈ 1.04 km/s (315.6 + 227.4 + 72.2 + 246.8 + 177.75 m/s; APL Mission Design page). According to APL, the flybys supplied > 91 % of the trajectory's Δv. The 2.27 km/s is therefore the result of flybys plus DSMs.
   - EN fix: "…the six flybys, helped by five smaller deep-space burns, had cut the arrival speed from 9.6 km/s to roughly **2.3 km/s**."
   - RU fix: "…шесть пролётов вместе с пятью небольшими манёврами в дальнем космосе снизили скорость прибытия с 9,6 км/с примерно до **2,3 км/с**."
   - Preset label: "MESSENGER AFTER ITS FLYBYS" / "MESSENGER ПОСЛЕ ПРОЛЁТОВ".
   - If the DSM sentence is added, add the APL Mission Design page (https://messenger.jhuapl.edu/About/Mission-Design.html) as a reference.
2. **SHOULD. The page says Mercury beats Pluto but doesn't disclose that its own model disagrees.** In CH1 the chart shows Mercury > escape, and the text then quotes ESA's "more energy than sending a mission to Pluto". NOTES records that the page's own rules give a Pluto orbiter ≈ 14.5 km/s, slightly more than Mercury. A reader will take the chart as support for ESA's sentence. Add one clause.
   - EN: "…than sending a mission to Pluto [4]. (That comparison assumes a different Pluto mission; by this chart's simple rules a Pluto orbiter would cost slightly more, about 14.5 km/s.)"
   - RU: "…чем полёт к Плутону [4]. (Это сравнение предполагает иной профиль полёта к Плутону; по простым правилам этой диаграммы орбитальный аппарат у Плутона обошёлся бы чуть дороже — около 14,5 км/с.)"
   - Add a check in `checks.js` for Pluto ≈ 14.5.
3. **NICE.** The capture status computes `capture(VINF_HOH)` (6.6 km/s), not the slider value, whenever v > 6. The wording "Without flybys…" makes this clear, so no change is needed.

## 2. Research / fact-check — APPROVE-WITH-CHANGES

All 17 reference URLs return HTTP 200 to a browser user-agent, including `doi.org/10.1126/science.1229953` via Crossref redirect. The following claims were spot-checked against the primary text:

| Claim | Source checked | Result |
|---|---|---|
| MTM separation 3 Sep 2026; 11.4 m/s burn on 24 Sep; MOI 21 Nov 2026; MPO–Mio separation 9–10 Dec; science April 2027 | ESA "Latest updates" (last update 6 Oct 2026) | ✓ current as of today |
| April 2024 "unexpected electric currents between MTM's solar array and the unit…"; Dec 2025 arrival lost; 4th flyby 4 Sep 2024 at 165 km | ESA 2024 article [16] | ✓ |
| 4,100 kg, MPO 1,230 kg, Mio 255 kg, Ariane 5, 20 Oct 2018, flyby list | ESA factsheet [15] | ✓ except Venus 2 (see finding 1) |
| Mio 590 × 11,640 km, MPO 480 × 1,500 km; "more energy than … Pluto" | ESA Journey to Mercury [4] | ✓ |
| 15-min burn, "just over 0.86 km/s", 31 % of propellant | APL Orbit Insertion [11] | ✓ (APL's spacecraft page says "nearly 30 percent"; both are fine) |
| ~600 kg propellant = 54 %; 2.5 × 2 m Nextel shade; front predicted 370 °C "when Mercury was closest to the Sun"; spacecraft ~20 °C; diode heat pipes | APL Spacecraft & Instruments [9] | ✓ |
| 176-day re-encounter orbit; 40–45 % imaged | NASA History [8] | ✓ |
| MOI 00:45 UT; 25 km; 30 Apr 2015 19:26 UT; 14,080 km/h; Janáček | Beyond Earth [7], NASA mission page [10] | ✓ |
| "verified its polar deposits are dominantly water-ice" | NASA mission page [10] | ✓ |

Findings:

1. **MUST-FIX. BepiColombo's second Venus flyby was on 10 August 2021, not 11 August.** In `script.js` (`renderFlybys`) the row reads *"15 Oct 2020 · 11 Aug 2021"*. Closest approach was **10 August 2021, 13:51 UTC, at 552 km**, per ESA's flyby/mission-planning pages and JAXA (22:51 JST on 10 Aug). The ESA factsheet's "11 August" appears to be an error on that page.
   - Change the row to "15 Oct 2020 · 10 Aug 2021" / "15 окт 2020 · 10 авг 2021".
   - Record the discrepancy in NOTES ("Discrepancies found in sources").
   - Optionally cite https://www.isas.jaxa.jp/en/topics/002748.html or ESA's "BepiColombo's second Venus flyby in images".
2. **MUST-FIX. The "any planetary orbiter" superlative is false.** The CH3 status reads *"…about 6.6 km/s — several times what any planetary orbiter has carried."* It is uncited and wrong as worded: Dawn's ion propulsion delivered ≈ 11 km/s to orbit Vesta and Ceres, and BepiColombo's own MTM ion stage delivers several km/s. Replace it with a claim the page can compute.
   - EN: "…about 6.6 km/s — almost eight times MESSENGER's actual 0.862 km/s burn, far more than its propellant could supply."
   - RU: "…около 6,6 км/с — почти в восемь раз больше реального импульса MESSENGER 0,862 км/с и гораздо больше, чем позволял его запас топлива."
   - Arithmetic: 6.63 / 0.862 = 7.7. With ~600 kg of propellant and Isp ≈ 317 s, MESSENGER's total budget was ≈ 2.4 km/s.
3. **SHOULD. The image count misstates the source.** CH6 says *"took over 200,000 images, against a pre-launch expectation of 1,000 [7]"*. Beyond Earth says the **200,000th orbital image** was taken on 6 February 2014, "far exceeding the original expectation of **at least** 1,000 photographs".
   - EN: "…and by February 2014 had taken its 200,000th orbital image, against an original expectation of at least 1,000 [7]."
   - RU: "…и к февралю 2014 года сделал 200-тысячный снимок с орбиты, хотя изначально рассчитывали как минимум на 1000 [7]."
4. **SHOULD. The 25 km sentence has the chronology wrong.** CH6 says *"Two extensions later, out of propellant, it was steered down to orbits as low as 25 km, and on 30 April 2015…"*. Per [7][10], the low-altitude campaign was deliberate, reaching 25 km by 12 Sep 2014. The propellant ran out afterwards.
   - EN: "In its second extension it was deliberately lowered to orbits as low as 25 km for close-up science; then, out of propellant, on **30 April 2015** at 19:26 UTC it struck…"
   - RU: "Во втором продлении его намеренно опустили на орбиты высотой всего 25 км ради съёмки вблизи; затем, израсходовав топливо, **30 апреля 2015 года** в 19:26 UTC он врезался…"
5. **SHOULD. A historical claim is uncited.** CH5 opens with *"For decades astronomers thought Mercury kept one face to the Sun…"* with no source; NOTES already flags this. Either cite it (Pettengill & Dyce's abstract contrasts their result with the previously accepted 88-day synchronous period; check the abstract, and if it does, cite [12]) or soften the wording.
   - Softer EN: "Until 1965 the textbook answer was that Mercury kept one face to the Sun, as the Moon does to Earth."
   - Softer RU: "До 1965 года в учебниках писали, что Меркурий всегда повёрнут к Солнцу одной стороной, как Луна к Земле."
6. **NICE. The shade construction wording is loose.** CH4 says *"ceramic fabric over layers of plastic insulation"*. APL says front **and back** layers of Nextel ceramic cloth surround inner Kapton layers.
   - EN: "ceramic cloth wrapped around layers of plastic insulation"
   - RU: "керамическая ткань, обёрнутая вокруг слоёв пластиковой изоляции"
7. **NICE.** For Mariner 10 the ESA "Why so long" page [3] credits Colombo in 1970 with the Venus-flyby idea, not only the 176-day orbit. That would enrich CH2, but it isn't required.

## 3. Science Communication & Education — APPROVE-WITH-CHANGES

The progression works well. CH1 states the paradox (falling inward speeds you up) and its cost. CH2 introduces the gravity-assist idea. CH3 shows MESSENGER applying it and lets the reader feel the steep cost curve. CH4 covers heat, CH5 the resonance, and CH5 pays off CH2's "same face" puzzle explicitly ("The reason is in Chapter 5"), which is good teaching design. Misconceptions are addressed head-on ("It is not far away — it is too fast"). Each model states its simplifications in plain words. The "back-computed" 2.3 km/s is honestly framed as a calculation. Readable for a non-specialist.

1. **SHOULD. The lede miscounts the instruments.** The lede (EN and RU) says *"Nine chapters and three instruments"*, but the page has four interactive instruments: CH1 destination chart, CH3 capture calculator, CH4 plate temperature and CH5 resonance. NOTES lists four, and the lede's list of actions also skips the capture calculator.
   - EN: "Nine chapters and four instruments: work out why stopping at Mercury costs more than leaving the Solar System, see how steeply the braking burn grows with arrival speed, heat a sunshade in sunlight nearly eleven times stronger than on Earth, and watch a day that lasts two of Mercury's years."
   - RU: "Девять глав и четыре прибора: выясните, почему остановиться у Меркурия дороже, чем покинуть Солнечную систему, посмотрите, как круто растёт тормозной импульс со скоростью прибытия, нагрейте солнцезащитный экран в свете, который почти в одиннадцать раз сильнее земного, и посмотрите на сутки длиной в два меркурианских года."
   - This also fixes "up to eleven times", which overstates the 10.6× in CH4.
2. **SHOULD. Readers after 21 Nov 2026 won't know the status date.** The as-of date for BepiColombo is only in the reference title. Put it in the CH7 text so that later readers know how old the status is.
   - EN: "**As of 9 October 2026, orbit insertion is planned for 21 November 2026**, …"
   - RU: "**По состоянию на 9 октября 2026 года выход на орбиту запланирован на 21 ноября 2026 года**, …"
   - NOTES already schedules the post-arrival update; keep that.
3. **NICE.** CH5 says "for a few days" and the status says "about 8 Earth days". Unify them as "for about eight Earth days around each perihelion" / "примерно восемь земных суток у каждого перигелия".

## 4. Linguist (RU) — APPROVE-WITH-CHANGES

The two languages are at full parity: every EN passage has a complete RU counterpart, with no abridgement, and `missingRu = 0`. Terminology is standard: гомановский перелёт, гравитационный манёвр, перигелий/афелий, импульс, специалисты по баллистике, ЕКА. Decimal commas and RU thousands are correct, and dates are declined correctly.

1. **SHOULD.** CH4 RU has *"Он растёт обратно квадрату расстояния"*, which is not idiomatic. Use "Он обратно пропорционален квадрату расстояния".
2. **SHOULD.** CH4 RU has *"колеблется примерно от 4,6 до <b>10,6</b> земного значения"*, which is missing «раза». Use "колеблется примерно от 4,6 до <b>10,6</b> раза относительно земного" or, simpler, "он в 4,6–<b>10,6</b> раза сильнее земного".
3. **NICE.** The hero RU *"наименее изученная из каменных планет"* would be better with the standard term: "наименее изученная из планет земной группы".
4. **NICE.** CH5 RU *"отразил от него радарный сигнал"* would be better as "радиолокационный сигнал", the standard term.
5. **NICE.** Thousands in the RU body use an ordinary space ("14 080", "200 000", "22 032"), which can wrap across a line. `helpers.js` already uses U+00A0, so use a no-break space in `body.html` as well. This matches site convention, so it is low priority.

## 5. Information Design & Frontend accessibility — APPROVE-WITH-CHANGES

I reasoned from the code and the jsdom run only; no browser was launched.

What is good:
- The axes are honest: the bars start at 0 km/s, the escape line spans every row, and the axis caption says "heliocentric departure + capture".
- The temperature chart marks Mercury's orbit band, Venus and Earth.
- The resonance figure states "Mercury enlarged; orbit to scale".
- The animation never autoplays, runs only while visible, and is slower under reduced motion.
- All controls are native `<button>`/`<input type=range>` with `<label for>`, so the page is keyboard-operable.
- `aria-pressed` is kept in sync.
- `extra.css` gives buttons and sliders 44 px targets.
- Tables use `th scope="row"` inside `.table-scroll`.

1. **MUST-FIX. The "Hohmann" marker label is clipped at the chart edge.** In the CH3 chart, `txt(svg, X(m[0]) + 4, Tp + 10, m[1], ...)` places "Hohmann" at x = X(9.61) + 4 ≈ 449. At 9.5 px mono (~5.7 px per glyph) it ends near x ≈ 489, past the 480 viewBox edge, so the label is visibly truncated in EN. Anchor the Hohmann label to the left of its line, for example `txt(svg, X(m[0]) - 4, Tp + 10, m[1], 'svg-small', 'end')` for the Hohmann entry only, or for both entries.
2. **SHOULD. Two CH1 labels collide.** The escape label (baseline y = 20, x ≈ 214–374 EN, ≈ 192–374 RU) sits 8 px below the legend text (baseline y = 12, "brake to be captured" at x ≈ 240–354). At 9.5 px font the glyphs touch or overlap. Move the escape label into the empty strip under the last bar, for example `txt(svg, X(DV_ESCAPE) - 4, Tp + rowH*PLANETS.length - 6, …, 'svg-small', 'end')` (y ≈ 260, below Jupiter's bar at 216–234).
3. **SHOULD. The CH5 live region is rewritten every frame.** While Play runs, `drawDay()` sets `#dayStatus.innerHTML` (`aria-live="polite"`) on every animation frame. Screen readers may re-announce it continuously. Only write it when the text changes:
   ```js
   var s = …; if (st.innerHTML !== s) st.innerHTML = s;
   ```
   Alternatively, drop `aria-live` while playing.
4. **SHOULD (site-wide pattern, not specific to this page).** Some accessible names exist only in English, and RU readers hear them in English: the SVG `aria-label`s and the button-group labels ("Destination", "Arrival presets"). Add `data-en-aria`/`data-ru-aria` handling in `helpers.js`, or set them in `renderAll()` with `T()`.
5. **NICE (site-wide).**
   - `.svg-small` (#7a7a74 on white) has a contrast ratio of 4.32:1, just under 4.5:1 for small text.
   - At 390 px width the 480-unit viewBox scales to ~0.75, so chart text renders at ~7 px. The readouts carry the key values in body-size text, which mitigates this.
   - Consider #6b6b65 (≥ 5:1) for the shared class in a future site-wide pass.
6. **NICE.** The sliders have no `aria-valuetext`, so a screen reader announces "2.27", not "2.27 km/s". You could set `capV.setAttribute('aria-valuetext', fmt(v,2)+T(' km/s',' км/с'))` in each render; do the same for `hR`, `hAE` and `dayT`.

## 6. Ethics — APPROVE

- Credit is fair. NASA, APL, ESA, JAXA and the original 1965 authors are all cited. Colombo's role is described accurately. No images are reproduced, so there are no rights questions.
- Time-sensitive claims are labelled "planned" throughout, with a dated source; see SC-2 for making the date visible.
- The page doesn't hide discrepancies between sources: NOTES documents the 9,300 km and launch-date issues, and the page avoids repeating the bad figure.
- The only thing close to misleading is the uncited superlative in Research finding 2 and the non-disclosure of the Pluto model in Physics finding 2. Both are covered above.
- No harm concerns.

---

## Consolidated MUST-FIX

1. **Venus flyby date.** In the `script.js` flyby table, BepiColombo's second Venus flyby should read **10 Aug 2021** (EN) / **10 авг 2021** (RU), not 11 Aug. Note the factsheet discrepancy in NOTES.
2. **False superlative.** In the `script.js` CH3 `capStatus`, replace "several times what any planetary orbiter has carried" with "almost eight times MESSENGER's actual 0.862 km/s burn, far more than its propellant could supply" (RU in Research finding 2).
3. **Clipped label.** In the `script.js` CH3 chart, the "Hohmann" marker label overflows the viewBox; anchor it `end` to the left of its line.

After the fixes, re-run `python3 assemble.py articles/scorch-mercury-messenger-bepicolombo && ./check-all.sh scorch-mercury-messenger-bepicolombo`. If the flyby check text changes, consider adding a `checks.js` assertion for the Venus-2 date.

## SHOULD (in priority order)

- Physics 1: DSMs.
- SC 1: four instruments / "nearly eleven".
- SC 2: visible as-of date.
- Physics 2: Pluto disclosure.
- Research 3: images.
- Research 4: 25 km chronology.
- Research 5: "for decades".
- InfoDesign 2: CH1 label collision.
- InfoDesign 3: live region.
- InfoDesign 4: RU aria.
- RU 1–2.
