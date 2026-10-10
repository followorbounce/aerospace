# TILT — Uranus & Neptune: cross-disciplinary review

- **Date:** 2026-10-09
- **Reviewed:** `tilt-uranus-neptune.html` (generated), with `body.html`, `script.js`, `checks.js`, `meta.json` and `NOTES.md` in this folder
- **Panel lenses:** Physics & Mathematics · Research / fact-check · Science Communication & Education · Linguist (RU) · Information Design & Frontend accessibility · Ethics
- **Overall verdict: APPROVE-WITH-CHANGES.** No lens blocks. All 33 checks pass (`./check-all.sh tilt-uranus-neptune` gives ALL OK, 0 missing RU, 19 refs, max cite 19). Every key number reproduces from an independent derivation. The status of the Uranus Orbiter and Probe (UOP) matches the primary sources as of today. Seven must-fix items are listed at the end. Each is a wording or legend fix, and none needs a structural change.

---

## 1. Physics & Mathematics — APPROVE-WITH-CHANGES

I re-derived the numbers independently with a Python script (radial-quadrature time of flight, not Kepler's equation, so it is a different method from the page's). The scratchpad lives at `/tmp/claude-1000/-home-none-git/c08a888d-36f6-489f-bebf-b7fcbf302f74/scratchpad/review-tilt/ind.py`.

| Quantity | Page | Independent |
|---|---|---|
| Uranus period / polar day at the pole / at 60° | 84.0 / 42.0 / 27.9 yr | 84.01 / 42.01 / 27.86 yr |
| Orbit-mean pole:equator, Uranus | 1.52× | 1.516× (equal at ε ≈ 54°) |
| 1/369, 1/902 | yes | 368.8, 902.5 |
| Light time U / N | 2.66 / 4.18 h | 2.657 / 4.183 h |
| Panels for 350 W at 30 % | ~316 m² | 315 m² |
| 1/r² from Jupiter (5.2 AU) | ~9,000 / 3,200 | 8,481 / 3,420 (DESCANSO's 1/13, 1/36 match) |
| Hohmann U / N | 16.0 / 30.8 yr | 16.0 / 30.8 yr (with NSSDC a = 30.18 AU) |
| v∞, C3, arrival v∞ (Uranus Hohmann) | 11.28, 127, 4.66 | 11.280, 127.2, 4.66 |
| +0.1 km/s saving | ~4.5 yr | 4.55 yr |
| Voyager 2 flight times | 8.4 / 12.0 yr | 8.43 / 12.01 yr |

The model assumptions (circular coplanar orbits, even seasons, top-of-atmosphere daily mean, ε > 90° handled through sin δ = sin ε sin λ, so δ peaks at 82.23°) are stated and correct. `checks.js` tests what the text claims, including the two closed forms and an RK4 cross-check.

1. **MUST — the braking claim is physically wrong.** Ch5 says *"every km/s at arrival must be braked away to enter orbit"*, and the status line reads *"… X km/s more to brake on arrival."* Because of the Oberth effect, the capture burn at periapsis is much smaller than v∞, and it grows more slowly than v∞. For Uranus with r_p = 1.3 R: v∞ 4.66 → 12.84 km/s raises the capture Δv to a parabolic orbit only from 0.57 → 3.99 km/s.
   - Body fix, EN: *"— but a faster departure also arrives faster, and the faster you arrive, the bigger the braking burn needed to be captured into orbit."* RU: *«…но более быстрый старт означает и более быстрое прибытие, а чем выше скорость прибытия, тем больше тормозной импульс, нужный для выхода на орбиту.»*
   - Status line, EN: *"… X km/s faster on arrival (more braking needed to enter orbit)."* RU: *«… прибытие на X км/с быстрее (нужно сильнее тормозить для выхода на орбиту).»*
2. **MUST — v∞ is described as additive to escape speed.** Ch5 says *"a departure speed of 11.3 km/s beyond Earth's escape"*, the slider label is *"DEPARTURE SPEED BEYOND ESCAPE v∞"*, and the RU text says *«скорости 11,3 км/с сверх второй космической»*. Readers will add 11.2 + 11.3. In fact v∞ is what remains after escape: the speed needed near Earth is √(11.2² + 11.3²) ≈ 15.9 km/s, not 22.5.
   - Body, EN: *"needs 11.3 km/s left over after escaping Earth's gravity (the hyperbolic excess speed v∞)"*. RU: *«требует, чтобы после ухода из поля тяготения Земли оставалось 11,3 км/с (гиперболический избыток скорости v∞)»*.
   - Slider, EN: *"SPEED LEFT AFTER ESCAPE v∞"*. RU: *«ИЗБЫТОК СКОРОСТИ ПОСЛЕ УХОДА ОТ ЗЕМЛИ v∞»*.
3. SHOULD — EN *"Sunlight thins with the square of distance"* would read better as *"falls off as the inverse square of distance"*. The RU version of this sentence is wrong, not just loose; see Linguist 1.
4. NICE — Neptune's 30.2 AU (and "30.2 AU" in the hero) is NSSDC's osculating value. Textbooks usually say 30.1 AU (mean 30.07), and the mean value gives a Hohmann time of 30.6 yr. Add a short footnote, or say "about 30 AU".
5. NICE — Ch1 could add *"(this happens for any tilt above about 54°)"* after "poles get more sunlight than its equator". I verified the crossover at ≈ 54°. It turns a curiosity into a transferable rule.

## 2. Research / fact-check — APPROVE-WITH-CHANGES

Spot-checked against primary sources today (2026-10-09):

| Claim | Source checked | Result |
|---|---|---|
| UOP FY2026: request "Delayed Indefinitely", enacted $10.0 M; minibus H.R. 6938 passed House 8 Jan and Senate 15 Jan 2026 | planetary.org, 15 Jan 2026 [14] | ✔ |
| FY2027: request $0.0; House "Supported", no amount; committee advanced 13 May 2026 | planetary.org, 14 May 2026 [15] | ✔ (it is the committee report, see item 4) |
| CR through 11 Dec 2026, signed 2 Sep (P.L. 119-103), NASA at $24.4 B | SpacePolicyOnline [18] | ✔ |
| Simon et al. 2026, PSJ 7(6):143, published 4 June 2026: no JGA after 2033 through 2044; 2031–32 "precluded by current funding profiles"; 2035–40 launches, start ≥ 2027; Hohmann 16–17 yr; SEP 12–14; Starship ~10; 2 Next Gen RTGs, 350 W EOM; 19.5 kbps Ka; 50 g (was 110 g) | iopscience full text [13] | ✔ (DOI resolves) |
| Voyager 2: Uranus 17:59 UT 24 Jan 1986, 81,500 km, 10 moons, 2 rings; Neptune 03:56 UT 25 Aug 1989, 4,800 km, closest of four | NASA Voyager 2 page [5] | ✔ (see item 3) |
| 97.77°, 21-year dark winter, magnetic axis ~60° | NASA Uranus facts [3] | ✔ (that page still says 28 moons; 29 from [11] is correct, and I found no 2026 discovery) |
| Six hours of key data; December 2007 equinox | NASA Uranus exploration [19] | ✔ |
| "conditions that only occur about 4% of the time" (Jasinski); moons "might be geologically active" | JPL, 11 Nov 2024 [7] | ✔ |
| Table 6-1 rates 115,200; ~29,000/44,800; ~9,000/29,900; ~3,200/21,600 | local DESCANSO PDF [6] | ✔ |
| Hubble 1994: GDS and DS2 gone | NASA Hubble page [10] | ✔ for the year, but the source gives **no month** |

1. **MUST — the Decadal Survey's date is given three different ways.** Ch5 says *"The 2023 Decadal Survey's concept"*, the CH7 timeline puts it under **2023**, and Ch6 says *"the 2021 Decadal design"*. The report was released on 19 April 2022 (the NAP catalogue year is 2023), and the UOP concept study was done in 2021.
   - Ch5, EN: *"The Decadal Survey's 2021 concept study cut the Uranus trip…"*. RU: *«Концептуальное исследование 2021 года для Десятилетнего обзора сокращало полёт…»*.
   - Timeline: change the year to **2022** and start the entry with *"<b>April:</b> the planetary Decadal Survey (2023–2032) ranks…"*. RU: *«<b>Апрель:</b> Десятилетний обзор планетологии (2023–2032) ставит…»*.
2. **MUST — the timeline gives a month its source doesn't support.** The 1994 entry starts *"<b>November:</b> Hubble images show…"*, but [10] gives no month. HST imaged Neptune more than once in 1994, so the month is unsupported. Drop "November:" and "Ноябрь:".
3. SHOULD — Ch4 and the timeline say *"about 4,800 km over Neptune's north pole"*, but [5] says *"over the cloud tops"*. Either say *"over the cloud tops near the north pole"* (RU *«над облаками у северного полюса»*) or add a JPL source for the polar geometry.
4. SHOULD — Ch6 says *"the House appropriations bill of May 2026 states support"*. It was the House Appropriations **Committee's** report, and no Senate bill names UOP yet. EN: *"the House Appropriations Committee's report of May 2026 backs it without a dollar figure, and the Senate has not yet acted"*. Note that the RU text already says «комитета».
5. NICE — the box's *"three RTGs (about 708 W at launch)"*: I didn't reach this figure in the part of the paper I read. The paper gives the three-RTG EOM as ~520–530 W. Keep the 708 W only if it is quoted verbatim from [13]. The safest option is to quote the EOM figures (3 RTGs ≈ 525 W vs 2 RTGs 350 W) so the two numbers can be compared directly.

## 3. Science Communication & Education — APPROVE-WITH-CHANGES

The page teaches well. It builds the argument from tilt to distance to radio to trip to status, it states its assumptions honestly, and the "unusual day" theme is a good epistemic lesson. Physics items 1 and 2 (braking and v∞) are the two misconceptions it currently teaches, and both are MUST.

1. **MUST — the lede overgeneralises.** It says *"see why the outer planets need nuclear power"*, but Juno runs on solar power at Jupiter, and this site has a Juno guide (POLAR). EN: *"see why the ice giants need nuclear power"*. RU: *«почему ледяным гигантам нужны ядерные источники энергии»*.
2. SHOULD — Ch1 says *"sets for 42; NASA describes each pole's deepest stretch as a 21-year dark winter"*. Readers will see 42 and 21 as a conflict. Add: *"— the quarter-orbit around solstice when the pole points most directly away from the Sun"*. RU: *«— четверть оборота вокруг солнцестояния, когда полюс обращён от Солнца сильнее всего»*.
3. NICE — the lede says *"three instruments"*, but four interactive figures exist (seasons, far and dim, encounter, transfer). Say "four" or keep three deliberately; either is fine.
4. NICE — the encounter readout label *"ABOVE THE CLOUDS"* could gain a hint that 1 bar is the reference level.

## 4. Linguist (Russian) — APPROVE-WITH-CHANGES

The Russian is mostly natural and complete (0 missing strings). Number formatting is correct throughout (decimal comma, a space in 81 500 / 29 900, "±10 %"), and fractional years are correctly declined (16,0 года).

1. **MUST — the RU sentence states the wrong physics.** Ch2 says *«Солнечный свет ослабевает пропорционально квадрату расстояния»*, which literally means the light grows with distance. Fix: *«ослабевает обратно пропорционально квадрату расстояния»*.
2. SHOULD — Ch1 *«наоборот, чем на Земле»* is ungrammatical. Use *«— не так, как на Земле»* or *«в отличие от Земли»*.
3. SHOULD — the chart legend *«достигнуто с 70-м антеннами и решётками»* has two problems. «70-м» reads as "70th", and «решётки» suggests phased arrays. The content is also wrong (see Info Design 1). Use *«достигнуто за счёт объединения антенн и модернизации»*.
4. SHOULD — Ch5 *«солнечно-электрическую двигательную ступень»* is not standard. Use *«ступень с солнечной электроракетной двигательной установкой (СЭДУ)»*. Ref [13] already uses «СЭДУ», so define it here.
5. SHOULD — Ch5 *«вблизи минимума время полёта очень чувствительно —»* is missing its complement. Use *«очень чувствительно к скорости старта»*.
6. SHOULD — Ch6 *«Формально проектом NASA миссию не запустило»* is awkward. Use *«Официально NASA пока не начало миссию как проект»*.
7. SHOULD — the readout label *«ВРЕМЯ СВЕТА В ОДНУ СТОРОНУ»*. Use *«ВРЕМЯ ПРОХОЖДЕНИЯ СИГНАЛА В ОДНУ СТОРОНУ»*.
8. NICE — the HUD shows *«16,0 г»*, which is ambiguous with grams. Use «лет» or «года».
9. NICE — Ch1 *«Сорок два года дня на полюсе»* would read better as *«Сорок два года полярного дня»*. In Ch4, *«ближе, чем у любой из четырёх планет»* would read better as *«ближе, чем к любой другой из четырёх планет»*.

## 5. Information Design & Frontend accessibility — APPROVE-WITH-CHANGES

I reasoned from the code only and launched no browser. Strong points: `aria-pressed` groups, labelled sliders, `aria-live` status lines, a focus-visible ring on sliders, a reduced-motion check in the shared script, and a one-column layout at ≤ 900 px.

1. **MUST — the Ch2 chart legend is factually wrong.** The legend reads *"achieved with 70 m dishes and arrays"*, but the 64 → 70 m upgrade came only for Neptune (1987–89). The 1980–81 Saturn rate and the 1986 Uranus rate were not achieved with 70 m dishes. DESCANSO §6.3 says Parkes was used *"as had been done for the Uranus encounter"*.
   - Grey bar label, EN: *"expected with the 1979–81 ground system [6]"*. These bars are DESCANSO's values, not a scaling; the current *"scaled by distance"* implies the page computed them.
   - Blue bar label, EN: *"achieved maximum (arraying, upgrades) [6]"*.
   - Body Ch2, EN: *"…learned to combine several antennas — Australia's Parkes telescope for both encounters — and, for Neptune, grew its 64 m dishes to 70 m and added the 27 dishes of the Very Large Array…"*. Mirror this in RU.
2. SHOULD — the Ch2 chart draws bars on a log axis with an arbitrary 1,000 bit/s baseline, so bar length is not proportional to rate. Draw dots or lollipops on the log axis and keep the ×-factor labels.
3. SHOULD — the Ch1 y-axis rescales with latitude (`top = max(S·0.35, qmax·1.08)`). As a result the equator and the pole look equally bright, which visually undercuts the chapter's main point (pole 1.52× the equator). Fix the y-max per planet, e.g. S·sin(δmax) for that planet.
4. SHOULD — touch targets are too small. `.btn` is 11 px text plus 8 px padding, about 29 px tall, against the 44 px requirement. The range thumb is 18 px on a 2 px track. This comes from the site-wide template, but this guide has 4 button groups. Add `@media (pointer:coarse){.btn{min-height:44px}}` and a larger thumb, ideally in the template.
5. SHOULD — two contrast failures. SVG labels `.svg-small` (#7a7a74 at 9.5 px in a 480-wide viewBox, about 7.7 px rendered at 390 px) measure about 3.9–4.3:1, below 4.5:1, and they are tiny on phones. The grey "expected" bars (#c9c9c2) measure about 1.5:1 against the paper, below the 3:1 non-text minimum. Darken them (e.g. #8f8f88).
6. SHOULD — the SVG `aria-label`s and button-group labels are English only and are not swapped by `applyLang` in RU mode. Add `data-aria-en/ru`, or set them in each render function. The Ch2 SVG label also says it shows *"sunlight and light time"*, but the SVG shows only data rates.
7. NICE — the moon dots in the encounter figure have a 2.5 px minimum, which enlarges Miranda about 10× and Triton about 5×. The label honestly lists only planet, approach and orbit as to scale. Add "moon dot enlarged".

## 6. Ethics — APPROVE-WITH-CHANGES

The status section is careful. Its heading is "Top priority, not yet a project", it says plainly that NASA has not started a formal project, it sources the funding figures, and it dates the claim to October 2026. Quotes are attributed. I see no harm to people.

1. **MUST — the lede presents the mission as certain.** It calls UOP *"NASA's next visit"* (RU *«следующий визит NASA»*), but the mission is proposed and unfunded beyond formulation. EN: *"…then read where the proposed Uranus Orbiter and Probe, NASA's candidate next visit, stands today."* RU: *«…и узнайте, на каком этапе сегодня предлагаемая миссия Uranus Orbiter and Probe.»* Apply the same change to the `meta.json` description (*"where NASA's Uranus Orbiter and Probe stands"* → *"where the proposed Uranus Orbiter and Probe stands"*).
2. SHOULD — the status will go stale. Add a visible *"Status as of 9 October 2026; re-check after 11 December 2026"* line in Ch6, not only in NOTES.md, since both the CR and the FY2027 bill are pending.

---

## Consolidated MUST-FIX list

1. **Braking claim (Ch5 body and status line):** "every km/s at arrival must be braked away" is wrong (Oberth effect). Reword per Physics 1 (EN and RU).
2. **v∞ wording (Ch5 body and slider label, EN and RU):** stop implying v∞ adds to escape speed ("beyond Earth's escape", «сверх второй космической»). See Physics 2.
3. **RU inverse square (Ch2):** «пропорционально квадрату расстояния» → «обратно пропорционально квадрату расстояния».
4. **Ch2 chart legend and body:** the 70 m upgrade was for Neptune only. Relabel the bars ("expected with the 1979–81 ground system", "achieved maximum") and fix the body sentence. See Info Design 1.
5. **Decadal date consistency:** "2023 Decadal" in Ch5, "2021 Decadal design" in Ch6, and the 2023 timeline year. Released April 2022; concept study 2021. See Research 1.
6. **Timeline 1994:** drop the unsupported "November" / «Ноябрь».
7. **Lede and meta wording:** "NASA's next visit" → "the proposed Uranus Orbiter and Probe"; "the outer planets need nuclear power" → "the ice giants". See Ethics 1 and SciComm 1.
