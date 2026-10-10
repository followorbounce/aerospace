# REVIEW — VEIL (veil-magellan-venus)

**Date:** 2026-10-09 · **Panel:** independent cross-disciplinary review (AGENTS.md: Peer Review + Cross-Disciplinary Review)
**Overall verdict: APPROVE-WITH-CHANGES** — 5 MUST-FIX items below; none needs a redesign. `./check-all.sh veil-magellan-venus` → ALL OK (34 checks, 0 missing `data-ru`, 14 cites / 14 refs).

Re-derivation script: `/tmp/claude-1000/-home-none-git/c08a888d-36f6-489f-bebf-b7fcbf302f74/scratchpad/review-veil/rederive.py`.

---

## 1. Physics & Mathematics + Electromagnetics — APPROVE-WITH-CHANGES

I re-derived these independently, and they all match the page: λ/D = 1.95°; c/2B = 66.3 m; orbital period 3.2596 h (e = 0.392, v_peri = 8.44 km/s); slant range ρ = 404 km at periapsis and 2,306 km at the pole; echo delay 2.70 ms and 15.4 ms; real-aperture footprint 13.8 km and 78.5 km; ground resolution 88/sin θ = 123 m and 310 m; strip spacing 21.25 km at the equator; 1,789.7 orbits per cycle; propulsive Δv 1.220 km/s (it changes by only 1 m/s if the periapsis is 140 km instead of 197 km); 475 kg of hydrazine at 1,100 kg and Isp 220 s; crater density 2.06 per 10⁶ km²; size parameter x = 11.4 in green light and 5.0 × 10⁻⁵ at 12.6 cm; Rayleigh ratio 2.8 × 10²¹. The units are right throughout. The stated limits (latitude used as true anomaly, a constant-Δv fit, the Mie regime, random rather than real crater positions) are honest and appear on the page.

1. **MUST — the SVG label mixes up aperture length and resolution.** script.js CH2: `T('synthetic aperture: 120 m','синтезированная апертура: 120 м')`. 120 m is the along-track *resolution cell*. The aperture the readout computes is a separate quantity: "SYNTHETIC APERTURE NEEDED" = 212 m at periapsis and 1,211 m at the pole. Fix: EN `'SAR resolution cell: 120 m'`, RU `'элемент разрешения РСА: 120 м'`.
2. **MUST — "steep look" says the opposite of what is meant.** gStatus EN: "so it can afford a steep look (large incidence angle)". In radar usage, "steep" means a *small* incidence angle. Fix EN: "Near periapsis the spacecraft is low, so it can look farther off to the side (a larger, more oblique incidence angle): the best ground resolution of the pass." RU: "У перицентра аппарат низко и может смотреть дальше вбок (больший, более пологий угол падения): лучшее разрешение на грунте за виток."
3. **MUST — the propellant claim contradicts the page's own model.** See §2.2. checks.js tests only "> 3 × the 132.5 kg", while the text claims "at least ten times too little", which no check covers.
4. **SHOULD — the synthetic-aperture length is overstated.** Text: "a synthetic aperture as long as the distance flown while the point stays in the beam". If you integrate over the whole beam dwell (about 14–80 km), you get the stripmap limit D/2 ≈ 1.9 m, not 120 m. Magellan ran in burst mode and used only a short aperture, spending the remaining Doppler bandwidth on ≥4 looks. Fix EN: "…equivalent to a far longer antenna — a *synthetic aperture* a few hundred metres to over a kilometre long, built from the echoes collected as the spacecraft flies on [3]." RU: "…эквивалент гораздо более длинной антенны — *синтезированную апертуру* длиной от сотен метров до километра с лишним, собранную из эхо-сигналов на пролёте [3]." This version also matches the headline "kilometre-long" and the readout (212 m to 1.3 km).
5. **SHOULD — the crater statistics use the Poisson error, not the binomial one.** The model fixes the total at 946, so the count in the band is binomial: sd = √(N(1−f)), not √N. At f = 0.5 the readout says ±22, but the true spread is ±15.4, so the "2σ" status is too lenient. Fix: `sd = Math.sqrt(exp*(1-f))`, and change the note to "scatters by about ±√(N(1−f)) (≈ ±√N for a narrow band)". Also, "real Venus counts pass this test [9]" overstates what [9] did. Phillips et al. ran CSR tests (nearest-neighbour and similar), not this band count. Fix EN: "real Venus craters pass tests of this kind [9]"; RU: "реальные кратеры Венеры проходят подобные проверки [9]".
6. **SHOULD — the aerobraking periapsis.** The drag passes ran at about 140 km. Periapsis was raised to 197 km only after aerobraking ended (Magellan mission catalogue, PDS; 1993 JPL status reports). The model note states 197 km honestly, but a reader will picture drag acting at 197 km. Add to the CH5 note — EN: "In reality the drag passes were flown at about 140 km and the low point was raised to 197 km at the end; holding it at 197 km changes the total Δv by about 1 m/s." RU: "На деле торможение шло на высоте около 140 км, а в конце перицентр подняли до 197 км; если держать его на 197 км, суммарное Δv меняется примерно на 1 м/с." Optionally add "to about 140 km" to "lowered the low point into the top of the atmosphere".
7. NICE — `incidence()` clamps above 90° and below −75°, and the slider range matches. Fine.

## 2. Research / fact-check — APPROVE-WITH-CHANGES

I verified these against sources:
- science.nasa.gov/mission/magellan: 120–300 m (design), 83.7% by 15 May 1991, 96% by 15 Jan 1992, 98% by 13 Sep 1992, contact lost after 10:05 UT on 13 Oct 1994, 1,200 Gbit against 900 Gbit for all earlier missions.
- Griffith et al. (NTRS 20210004680) abstract: 70 days, ended 3 Aug 1993, 8,467 → 541 km, 541 × 197 km.
- ESA EnVision page: launch November 2031, 11 months of aerobraking.
- Planetary Society VERITAS page: 30 m/pixel, "at least three times" sharper, NET 2031, "in danger".
- Schaber et al. 1992 (USGS abstract): 842 craters on 89% through orbit 2578, 1.5–280 km, about 0.5 Ga. The 62% pristine figure is not in the abstract and I could not verify it.
- 25 May → 3 Aug = 70 days. Pioneer Venus 2 launched Aug 1978 → May 1989 = 10.75 years ("almost eleven years").

Findings:

1. **MUST — the headline claim is false.** Hero: "No camera has ever seen the ground of Venus from orbit". The quote block repeats it: "We have never seen the surface of Venus from orbit. We have only heard it echo." From orbit, Venus Express (VMC, VIRTIS, 2006–14) and Akatsuki (IR1) imaged the surface's thermal glow through the 1 µm near-infrared window. Parker Solar Probe's WISPR also imaged nightside surface features at 0.47–0.8 µm in its 2020–21 flybys, and they match Magellan's maps (Wood et al. 2022, GRL, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9286398/). What *is* true is that cloud scattering blurs these images to tens of kilometres.
   - Fix lede EN: "From orbit, cameras see Venus's ground only as a blurred glow of heat leaking through an unbroken deck of sulphuric-acid cloud. Between 1990 and 1994 NASA's Magellan mapped 98% of the planet sharply anyway — with radar, from echoes, strip by strip."
   - Fix lede RU: "С орбиты камеры видят поверхность Венеры лишь как размытое тепловое свечение сквозь сплошной слой облаков из серной кислоты. И всё же в 1990–1994 годах «Магеллан» NASA чётко нанёс на карту 98% планеты — радиолокатором, по эхо-сигналам, полоса за полосой."
   - Quote EN: "From orbit, light shows us only the blur of Venus. Its sharp map we have only heard, as an echo." RU: "С орбиты свет показывает нам лишь размытую Венеру. Её чёткую карту мы только слышали — как эхо."
   - Add the WISPR paper as reference [15] and one sentence in CH1.
   - Matching CH1 instrument fix: the NEAR-IR button (2.3 µm) says "light is scattered over and over, and the surface stays hidden". At the 1.01 µm window the surface glow does get through. Either relabel the button "NEAR-IR WINDOW 1.0 µm" (x = 6.2) and, for x > 1 at that wavelength, use the status — EN "Scattered over and over but hardly absorbed: the surface's heat glow leaks through, blurred to tens of kilometres — too coarse for a map." RU "Свет многократно рассеивается, но почти не поглощается: тепловое свечение поверхности просачивается наружу, размытое до десятков километров, — для карты слишком грубо." — or drop the NEAR-IR button.
2. **MUST — the propellant claim is misattributed.** CH5: "Magellan's hydrazine, 132.5 kg at launch, was at least ten times too little for that [3][6]". Griffith [6] says the propellant *on board* in 1993 was "at least an order of magnitude too small". The page's own readout gives 475 kg needed against 132.5 kg at launch, only 3.6×, so readers see a contradiction.
   - Fix EN: "…would take about 1.2 km/s of braking. Even the full 132.5 kg of hydrazine loaded at launch [3] would have covered only about a quarter of that, and what was left on board by 1993 was at least ten times too little [6]."
   - Fix RU: "…нужно торможение около 1,2 км/с. Даже всех 132,5 кг гидразина, залитых при запуске [3], хватило бы лишь примерно на четверть, а оставшегося на борту к 1993 году топлива было по меньшей мере в десять раз меньше нужного [6]."
   - Relabel the readout `HYDRAZINE AT LAUNCH` to "HYDRAZINE AT LAUNCH (MUCH SPENT BY 1993)" / "ГИДРАЗИНА ПРИ ЗАПУСКЕ (К 1993 Г. БОЛЬШАЯ ЧАСТЬ ИЗРАСХОДОВАНА)".
3. **SHOULD — use the published full-coverage count instead of the scale-up.** The crater database from ~98% coverage was expanded to 912 craters, 1.5–280 km (NTRS 19940016252; Schaber, Kirk & Strom 1998, USGS OFR 98-104). Prefer "about 900–950 in all (912 on 98% of the surface)" over "842 ÷ 0.89 = 946". Optionally set N_CRATERS = 912 and keep the 842 text as the 1992 snapshot.
4. **SHOULD — the surface age needs an uncertainty band.** NOTES says no sourced band was found. The standard one is McKinnon et al. 1997 (*Venus II*): ~750 Ma, with a range of roughly 0.3–1 Ga. Please verify the reference, then add EN: "(later estimates range from about 0.3 to 1 billion years)" / RU "(более поздние оценки — примерно от 0,3 до 1 млрд лет)".
5. **SHOULD — mission status as of Oct 2026.** "NET 2031, future uncertain" [10] is still accurate. The PI's current target is June 2031 (SpaceNews, early 2026). VERITAS was on the FY2026 President's-budget cancellation list, while Congress's FY2026 appropriation funded DAVINCI ($99 M, launch targeted December 2030). Suggest EN: "…launch no earlier than 2031, its funding still uncertain as of late 2026 [10]". The lede of CH6 could also mention DAVINCI (a descent probe, in one clause, pointing to FURNACE). Keep EnVision at November 2031, as on ESA's own page; secondary press says December.
6. NICE — the ladder bar for Venera 15/16 (1,200–2,400 m, from [3]) disagrees with the text "1–2 km". Use "1–2 km" in both or "1.2–2.4 km" in both.
7. NICE — "1983" for Venera 15/16 is correct (orbit insertion October 1983). [3] supports it, so the NOTES "not verified" flag can be closed.

## 3. Science Communication & Education — APPROVE-WITH-CHANGES

The chapters build on each other well: the problem, then range and azimuth treated separately, coverage, the science result, and operations. Each instrument comes with an honest model caveat. The range/azimuth split and the Doppler-train analogy are good teaching choices.

1. MUST (covered by §2.1) — "no camera has ever seen" plants a misconception, and the 1 µm window story is a better teaching hook anyway: light *does* leak out, but too blurred to map.
2. MUST (covered by §1.2) — the "steep look" inversion would teach the wrong radar vocabulary.
3. SHOULD — CH4: "One reading is that most of Venus was resurfaced…; another is steady patchy resurfacing". Add one sentence on why randomness plus pristine craters is the puzzle: steady patchy resurfacing should leave many half-buried craters and regional age differences, and few are seen. Without that, a non-specialist can't tell why the two facts point to catastrophe.
4. NICE — CH2 headline "sees like a kilometre-long one": the readout shows 212 m at periapsis. A tooltip or the §1.4 wording settles it.

## 4. Linguist (RU) — APPROVE-WITH-CHANGES

The Russian is natural and at parity with the English. Decimal commas, «ёлочки», 4-digit numbers without a space and 5-digit with one (8467, 16 000), "ЕКА", "Циолковского", "тессеры", "венцы" and "РСА" are all correct.

1. SHOULD — "с качанием частоты в полосе 2,26 МГц" is dated. The standard term is "с линейной частотной модуляцией (ЛЧМ) в полосе 2,26 МГц".
2. SHOULD — "управленцы опустили перицентр": "управленцы" reads as administrators. Use "специалисты по управлению полётом опустили перицентр".
3. SHOULD — "Геррик и Хенсли" uses the old Г-for-H convention. Modern usage is "Херрик и Хенсли" (in body CH6).
4. NICE — "минимум по четырём независимым «взглядам»": the term of art is "некогерентные накопления". Suggest "…по четырём независимым «взглядам» (некогерентным накоплениям)".
5. NICE — "Пусть планета поворачивается внизу" is a calque. Prefer "Планета поворачивается под орбитой".
6. NICE — the percent spacing is inconsistent: the kF readout gives `fmt(f*100,0) + ' %'` ("10 %") in both languages, but the text uses "98%". Use `'%'` without the space.
7. Any RU text added from §§1–2 must keep the same conventions.

## 5. Information Design & Frontend accessibility — APPROVE-WITH-CHANGES

Charts and axes are honest. The resolution ladder is on a labelled log scale, the coverage bars use a 0–100% linear scale, the strips and orbits are labelled "to scale", and the apoapsis-vs-day axes are labelled with the real 70-day marker. Buttons carry `aria-pressed`, sliders have `<label for>`, statuses are `aria-live="polite"`, and the page has no autoplay animation. `reduced()` exists in the shared JS.

1. **MUST — touch targets are below 44 px.** VEIL has no `extra.css`. The shared `.btn` (11 px font, 8 px padding) renders about 29 px tall, and the range track is 2 px with an 18 px thumb. The sibling guides fix this (scorch, belt, slingshot). Add `articles/veil-magellan-venus/extra.css`:
   ```css
   .btn{min-height:44px; min-width:44px;}
   input[type=range]{height:44px; margin:2px 0; background:linear-gradient(var(--ink),var(--ink)) center/100% 2px no-repeat;}
   ```
   Then re-run assemble and check-all.
2. SHOULD — the SVG `aria-label` and `role=group` `aria-label` values ("Wavelength", "Preset latitude", "Crater throw", the SVG descriptions) are English only, so RU screen-reader users hear English. Translate them in `applyLang` via `data-aria-ru`, or follow the siblings' convention if one exists.
3. SHOULD — the sliders lack `aria-valuetext`. kF announces "0.1", not "10 %", and mP/aDv/aM announce bare numbers. Set `el.setAttribute('aria-valuetext', <the formatted value>)` in each render.
4. SHOULD — `.svg-small` is 9.5 px `#7a7a74`. That gives 4.32:1 on white (just under AA 4.5:1) and 3.51:1 on the `#efe7d4` fills. At 390 px the 480-wide SVG scales by about 0.75, so the text is ~7 px. This is site-wide CSS, so either set a page override (`.svg-small{fill:#5f5f59}`; 11 px where layout allows) or log it for the shared stylesheet.
5. NICE — on narrow screens the CH2 SVG puts left-anchored labels at x = 300 ("real 3.7 m dish: 13.8 km", ~27 chars × ~5.7 px). They fit inside 480, which is fine. Screenshots at 390 px are still outstanding (NOTES): run `shot.sh` before shipping.

## 6. Ethics — APPROVE-WITH-CHANGES

There is no harm vector. Soviet Venera 15/16 is credited fairly, the sources are primary and attributed, and the model pages carry "assumption" and "illustration" labels — good practice.

1. MUST (covered by §2.1) — the quote block is styled as a quotation but has no attribution, and its content is false. Either present it as the guide's own epigraph (no quotation styling, or "— the authors") or replace it with the corrected wording.
2. NICE — "first spacecraft to aerobrake into a new orbit at another planet": the qualifier "at another planet" is correct and should stay. Japan's Hiten aerobraked at Earth in 1991.

---

## Consolidated MUST-FIX

1. **The "never seen from orbit" claim is false** (hero lede, quote block, and the CH1 NEAR-IR status). Venus Express, Akatsuki and Parker Solar Probe WISPR have all imaged the surface's thermal glow, blurred by the clouds. Reword per §2.1, cite Wood et al. 2022, and fix or remove the 2.3 µm button.
2. **The propellant "ten times" claim is misattributed to the 132.5 kg launch load,** which contradicts the page's own 475 kg vs 132.5 kg (3.6×). Attribute "≥10×" to what was left on board in 1993, per §2.2, and relabel the readout.
3. **The SVG label "synthetic aperture: 120 m"** should read "SAR resolution cell: 120 m" / "элемент разрешения РСА: 120 м".
4. **The "steep look (large incidence angle)" wording** inverts radar terminology. Reword per §1.2, EN and RU.
5. **Touch targets are below 44 px.** Add `extra.css` with `.btn{min-height:44px;min-width:44px}` and a 44 px range hit area, then rebuild and run check-all. Run `shot.sh` at 390 and 1300 px before shipping.
