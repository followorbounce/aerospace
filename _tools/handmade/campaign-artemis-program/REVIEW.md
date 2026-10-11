# Cross-disciplinary review: Artemis pages (CAMPAIGN, HORIZON, HALO)

**Date:** 11 October 2026 · **Reviewed:** working tree vs HEAD, i.e. `campaign-artemis-program.html`, `horizon-artemis-base-camp.html`, `the-lunar-gateway.html`, plus NOTES.md and checks.js.
**Panel lenses:** Research/fact-check; Physics & Mathematics; Science Communication, Education & Ethics; Linguist (RU); Information Design & Frontend accessibility.

## Overall verdict: APPROVE-WITH-CHANGES

The upgrade is substantively sound. Every dated status claim we checked matches NASA or OIG primary sources, and the corrections listed in NOTES.md are right. Ship once the 6 MUST-FIX items below are closed. All of them are small text or attribute edits. The most serious is M1: in a real browser the distance instrument cannot display the record figures the page quotes.

Automated checks: `./check-all.sh campaign-artemis-program` reported ALL OK (22/22 PASS). `test.js` on HORIZON and HALO reported 0 errors, 0 broken attributes, 0 missing RU, with refs equal to maxCite (11 and 9). M1 shows one limit of these checks: jsdom does not apply range-input step sanitisation, but browsers do.

---

## 1. Research / fact-check: APPROVE-WITH-CHANGES

We checked these claims against primary sources on 11 Oct 2026. All were confirmed except where a finding below says otherwise.

| Claim | Source checked | Result |
|---|---|---|
| Launch 6:35 p.m. EDT, 1 Apr 2026, Pad 39B; crew and roles | NASA release, 10 Apr 2026 (updated 7 May) | ✔ |
| Splashdown 5:07 p.m. PDT, 10 Apr 2026, off San Diego; 695,081 mi; "nearly 10-day" | same | ✔ |
| Record passed 12:56 p.m. CDT, 6 Apr; 248,655 mi; ~252,756 mi; 4,067 mi above the Moon | NASA release, 6 Apr 2026 | ✔ (NASA gives miles only; the km conversions are correct) |
| Heat-shield char loss "significantly reduced" vs Artemis I; Marshall analysis | NASA, 20 Apr 2026 | ✔, **but see R1** |
| 76th signatory San Marino, 25 Sep 2026, Rimini | NASA OIIR | ✔ |
| 73rd Albania, 21 Sep 2026, NASA HQ · 70th Mauritius, 17 Jul 2026, Ébène | NASA OIIR | ✔ |
| 67 after six signings "leading up to" the Lima workshop, 13–14 May 2026 | NASA release, 21 May 2026 | ✔ (dating the count to 13 May is a disclosed assumption) |
| 8 founders including the US, 13 Oct 2020; 59 after Hungary (22 Oct), Malaysia and the Philippines (announced 26 Oct 2025) | NASA, 20 Nov 2025 | ✔ |
| Artemis III mid-2027 LEO test with one or both providers; Artemis IV early 2028; Artemis V by late 2028; ~1 mission/yr; SLS standardised from Artemis IV; no EUS or ML-2 "as development of both has faced delays" | NASA, 3 Mar 2026 | ✔ |
| Crew Bresnik (CDR), Parmitano (ESA, PLT), Douglas, Rubio; Blue Moon first for ~2 days, then Starship ~1 day; ~2 weeks; spacer; Pacific splashdown; Artemis IV "first planned crewed mission to the lunar South Pole in 2028" | NASA, 9 Jun 2026 | ✔ |
| ESM circularises the orbit; Blue Moon Mark 2 and Starship pathfinders; crew "could potentially enter at least one lander test article" | NASA, 13 May 2026 | ✔ |
| Gateway "intends to pause … in its current form"; Moon Base phases 1–3 with JAXA rover, ASI habitats and CSA LUV; landings every 6 months beyond Artemis V; up to 30 robotic landings from 2027 | NASA, 24 Mar 2026 | ✔ |
| OIG ML-26-002 (24 Jun 2026): 4 systems, $5.9B; HALO sole-sourced Jul 2019; $1.3B at FFP conversion; $1.8B cost-plus (Sep 2024); stop-work Apr 2026 at $1.9B; corrosion found 2025; delivery Jul 2031; Gateway ≥2032; reuse "not finalized" | OIG PDF, text extracted | ✔, **but see R3** |
| HALO power and avionics repurposed for 3 Northrop Grumman payloads; Phase I "now through 2029" | NASA, 4 Aug 2026 | ✔ |
| PPE to be "that component for the SR-1 spacecraft that is going to Mars" | NASA podcast ep. 436, 11 Sep 2026, García-Galán | ✔ (a statement by a manager; see E3) |
| NASA–DOE "develop a lunar surface reactor by 2030"; LR-1 powers the Moon Base through lunar nights (no date given) | NASA, 13 Jan 2026; Space Reactors page | ✔ in body text, **but see R4** |
| PPE powered on 2025, 60 kW, Lanteris, Palo Alto; HALO from Turin to Mesa on 1 Apr 2025, outfitting in Gilbert | NASA Glenn, 8 Jan 2026; NASA, 4 Apr 2025 | ✔ |
| NRHO ~1,000 mi (1,500 km) to ~43,500 mi (70,000 km), ~6.5 days; crews up to 4 | NASA Gateway FAQ, 23 Jul 2026 | ✔ |
| CAPSTONE entered NRHO Nov 2022 (first spacecraft to fly an NRHO) | NASA mission blog, 13 Nov 2022 | ✔ |

**Findings**

- **R1 (MUST-FIX).** The reference does not support the claim. CAMPAIGN CH.06: "To protect the crew, NASA had shortened how far Orion flies between entering the atmosphere and splashdown … <sup>[15]</sup>". Ref [15] (NASA, 20 Apr 2026) contains no mention of range, trajectory or skip entry. Its own note also claims "shortened entry range". The decision is in NASA's 5 Dec 2024 release, "NASA Shares Orion Heat Shield Findings, Updates Artemis Moon Missions" (https://www.nasa.gov/news-release/nasa-shares-orion-heat-shield-findings-updates-artemis-moon-missions/).
  - **Fix:** add that release as a new reference and cite it for the range sentence; keep [15] for the char-loss finding. In [15]'s note, delete "shortened entry range" / «укороченная дальность спуска».
  - **New ref note EN:** "NASA, 5 Dec 2024. Artemis II to fly a modified entry trajectory that shortens the distance between atmospheric entry and splashdown."
  - **New ref note RU:** «NASA, 5 декабря 2024 года. Artemis II полетит по изменённой траектории входа, сокращающей расстояние от входа в атмосферу до приводнения.»
  - Also update NOTES.md, which repeats "[15]".
- **R2 (MUST-FIX).** HORIZON CH.07 lander cards (JS `rows`) contain a claim the authors themselves removed for lack of a source.
  - Blue Moon card: `SETBACK: Rocket explosion, May 2026`, `SCHEDULE: Slipped at least 8 months per NASA OIG`, and status `DELAYED` with `dead:true` styling.
  - Starship card: `V3 TEST FLIGHT: Targeted 2026`.
  - NOTES.md says "Blue Moon … suffered a rocket failure in 2026" was removed, yet the card still asserts it. None of these rows is cited, and all are dated status claims.
  - **Fix:** replace the rows with what the page can source.
    - Starship: `ROLE: HLS provider; Artemis III Earth-orbit docking test [4][5]` / `РОЛЬ: поставщик HLS; стыковочное испытание Artemis III на околоземной орбите`, plus `OPEN ITEM: In-orbit propellant transfer needed before a crewed landing` / `ОТКРЫТЫЙ ВОПРОС: перед пилотируемой посадкой нужна перекачка топлива на орбите`.
    - Blue Moon: `ROLE: Second HLS provider; docks with Orion first on Artemis III [5]` / `РОЛЬ: второй поставщик HLS; первым стыкуется с «Орионом» в Artemis III`.
    - Both cards: status `IN DEVELOPMENT · NOT YET CREWED (10 OCT 2026)` / `В РАЗРАБОТКЕ · БЕЗ ЭКИПАЖА (10 ОКТ. 2026)`, `dead:false`.
  - **Alternative:** if a primary OIG source for the 8-month slip exists, cite it.
- **R3 (SHOULD).** The $5.9B figure is worded more strongly than the OIG puts it. The OIG says the four systems are ones "the Agency recently announced plans to cancel or repurpose", with a "combined current contract value" of $5.9B. It does not say $5.9B of contracts were cancelled.
  - CAMPAIGN CH.07, "NASA's Inspector General counts four Artemis systems cancelled or repurposed in this reformulation … with a combined contract value of $5.9 billion":
    - EN: "…counts four Artemis systems NASA has announced plans to cancel or repurpose … with a combined current contract value of $5.9 billion."
    - RU: «…насчитывает четыре системы Artemis, которые NASA объявило намерение отменить или перепрофилировать, … с общей текущей стоимостью контрактов 5,9 млрд долларов».
  - HORIZON risk card, "counts $5.9 billion of Artemis contracts cancelled or repurposed":
    - EN: "counts four Artemis systems, with a combined contract value of $5.9 billion, that NASA plans to cancel or repurpose".
    - RU: «насчитывает четыре системы Artemis общей стоимостью контрактов 5,9 млрд долларов, которые NASA намерено отменить или перепрофилировать».
- **R4 (SHOULD).** HORIZON LEGACY timeline, `{y:'2030', en:'Lunar Reactor-1', noteEn:'Reactor development goal'}`, ties the 2030 goal to LR-1. NASA's 2030 commitment is for "a lunar surface reactor", and the LR-1 page gives no date.
  - **Fix:** `en:'Lunar surface reactor'`, `ru:'Лунный реактор'`, note "NASA–DOE development goal" / «Цель разработки NASA и DOE».
  - Same issue in the base chip `cEn:'Fission; NASA–DOE goal: develop by 2030'`. Acceptable as is, because the description separates the two.
- **R5 (SHOULD).** HALO says NASA calls PPE "the most powerful solar-electric spacecraft of its kind", under the heading "The most powerful solar-electric spacecraft ever built". NASA's FAQ actually says "the most powerful solar electric spacecraft ever flown". That wording is itself odd, since PPE has not flown, so the page should neither paraphrase it nor amplify it.
  - **Fix heading:** EN "A 60-kilowatt solar-electric powerhouse" / RU «Солнечно-электрическая «электростанция» на 60 кВт».
  - **Fix body:** EN "NASA's FAQ calls it the most powerful solar-electric spacecraft ever flown, although it has not yet flown" / RU «в FAQ NASA он назван самым мощным солнечно-электрическим аппаратом из когда-либо летавших, хотя сам он ещё не летал».
- **R6 (SHOULD).** HALO has inconsistent partner and module counts.
  - "Five modules, built by five different agencies" is wrong. Most of the modules were never built, and the providers are NASA's contractors, ESA and MBRSC.
  - The next chapter says "Four space agencies, one small station", but NASA's FAQ lists five partners (NASA, ESA, JAXA, CSA, MBRSC), as HORIZON CH.04 also does.
  - The anatomy chip "ESPRIT" is a name NASA's FAQ no longer uses. The FAQ lists Lunar View and Lunar Link, and the page's own hardware card uses those names.
  - **Fix:** headings "Five planned modules from four providers" / «Пять запланированных модулей от четырёх поставщиков» and "Five partners, one small station" / «Пять партнёров — одна небольшая станция». Rename the chip "Lunar View / Lunar Link (formerly ESPRIT)" / «Lunar View / Lunar Link (бывший ESPRIT)».
- **R7 (SHOULD).** CAMPAIGN CH.10 cites [10] for "a hedge against exactly the kind of schedule slip that triggered the 2026 restructuring". [10] says only that "lander readiness will determine which provider…".
  - The hedge is the authors' own reading, so take it out of the cited sentence.
  - EN: "…Blue Origin's Blue Moon. NASA says lander readiness will decide which one carries the first crew down.<sup>[10]</sup>"
  - RU: «…Blue Moon от Blue Origin. По словам NASA, какой из них первым доставит экипаж на поверхность, решит готовность модулей.<sup>[10]</sup>»
  - HORIZON CH.07 lede has the same problem ("…exactly the kind of delay both are currently experiencing", uncited and undated). EN: "…a hedge against either one slipping." / RU: «…страховка на случай задержки одного из них».
- **R8 (NICE).** HALO CH.02 says "keeping constant line of sight to both the lunar south pole and Earth". The FAQ supports "uninterrupted communications" with Earth and "access" to the south pole, not constant line of sight.
  - EN: "…while keeping an uninterrupted link to Earth and good coverage of the south pole." / RU: «…сохраняя непрерывную связь с Землёй и хороший обзор южного полюса».

## 2. Physics & Mathematics: BLOCK-WITH-REASON (lifts once M1 is fixed)

Values re-derived with c = 299,792.458 km/s and 1 mi = 1.609344 km:

| Quantity | Result |
|---|---|
| Moon, 384,400 km | 1.2822 s one way / 2.564 s round trip |
| Apollo 13, 400,171.4 km | 1.3348 / 2.670 s |
| Artemis II, 406,771.4 km | 1.3568 / 2.714 s ("1.357 s" ✔) |
| Artemis II margin over Apollo 13 | 6,599.9 km ✔ |
| Artemis II beyond the Moon's mean distance | 22,371 km ✔ |
| Accords, whole history | 68 in 2,173 days, 11.430 a year, one every 31.96 days ✔ |
| Accords, Oct 2025 → Sep 2026 | 17 in 334 days, 18.59 a year ✔ |
| Accords, Oct 2020 → Dec 2024 | 42 in 1,520 days, 10.09 a year ✔ |

checks.js tests the arithmetic correctly.

- **M1 (MUST-FIX).** The distance instrument cannot show the record values in a real browser. The slider is `<input type="range" id="distKm" min="0" max="420000" step="100" value="406771">`. Under HTML value sanitisation, a browser snaps any value to a multiple of `step`, so the initial value and every preset are snapped:
  - Artemis II becomes 406,800 km: the readouts show 406,800 km and 252,774 mi, and the status says "6,629 km beyond Apollo 13's record".
  - Apollo 13 becomes 400,200 km: "VS APOLLO 13 RECORD: +29 km", which should read 0.
  - Only the one-way light time survives at 3 decimals.
  - checks.js test 19 ("RU: Artemis II preset reads 406 771") passes only because jsdom does not snap.
  - **Fix:** set `step="1"`. Apollo 13 then becomes 400,171, mi 248,655 and +0 km; Artemis II becomes 406,771 / 252,756. Keyboard arrow steps get finer; also add `PageUp`/`PageDown` (browsers already apply 10% jumps).
  - **Better test:** after each preset click, assert `distKm.value % step === 0` and that the readout equals the preset's mile figure.
- **P2 (SHOULD).** The Accords readout annualises very short windows.
  - Picking adjacent points 6→7 (21 → 25 Sep 2026) gives "AVERAGE PER YEAR 273.9". That reads as a projection, which the page explicitly disclaims.
  - **Fix:** show "—" for per-year when `days < 180`, with the status "Too short a span to annualise" / «Слишком короткий промежуток для пересчёта на год». The days-per-signatory figure is fine to keep.
- **P3 (NICE).** The distance note gives "Linear scale from Earth's centre" and uses the Moon's semimajor axis, which is centre-to-centre. NASA does not say whether its "miles from Earth" are measured from the centre or the surface, which matters by about 6,371 km.
  - **Fix:** add one clause. EN "NASA does not state whether its record distances are measured from Earth's centre or surface." / RU «NASA не уточняет, отсчитываются ли рекордные расстояния от центра Земли или от её поверхности.»
  - Also qualify the "BEYOND THE MOON'S MEAN DISTANCE" figure as approximate.

## 3. Science Communication & Education + Ethics: APPROVE-WITH-CHANGES

Dating is good: status notices, footers and "as of 10 October 2026" appear throughout. The pause is consistently framed as NASA's "intent". Partners are credited (ESA service module and Parmitano, CSA Hansen, JAXA, ASI, CSA LUV, MBRSC).

- **E1 (MUST-FIX).** The CAMPAIGN CH.06 heading undersells the record and contradicts its own text and HORIZON. "Farther from Earth than any human in fifty years" / «Дальше от Земли, чем любой человек за пятьдесят лет» sits above body text saying "farther from Earth than any humans before them"; HORIZON was corrected for exactly this.
  - **Fix:** EN "Farther from Earth than any human before" / RU «Дальше от Земли, чем кто-либо из людей до них».
- **E2 (MUST-FIX).** HALO shows hardware status that is no longer true. The anatomy chip `cEn:'Built, Northrop Grumman / Thales Alenia Space'` (RU «Построен…») for HALO contradicts the stop-work order and the OIG's 2031 delivery projection on the same page. The HALO description "integrated with PPE before launch" is written as if it happened.
  - **Fix chip:** `'Structure built; stop-work order Apr 2026'` / `'Конструкция изготовлена; работы остановлены в апр. 2026'`.
  - **Fix description:** "was to be integrated with PPE before launch" / «должна была быть интегрирована с PPE перед запуском».
  - The PPE chip "Built" is acceptable, since NASA says it was powered on.
- **E3 (SHOULD).** HALO's PPE status reads `POWERED ON 2025 · TO BE REUSED` / `БУДЕТ ИСПОЛЬЗОВАН`, with fate "Core of the SR-1…". The source is a program manager speaking on a podcast, not a decision document.
  - **Fix status:** `'POWERED ON 2025 · REUSE PLANNED'` / `'ВКЛЮЧЁН В 2025 · ПЛАНИРУЕТСЯ ПОВТОРНОЕ ИСПОЛЬЗОВАНИЕ'`.
- **E4 (SHOULD).** HORIZON CH.03 dash row "Paused; resources shifted to the surface" / «Приостановлена; ресурсы перенаправлены на поверхность» is firmer than NASA's "intends to pause".
  - **Fix:** "Pause announced 24 Mar 2026; shift to a surface base" / «Приостановка объявлена 24 марта 2026; переход к базе на поверхности».
- **E5 (SHOULD).** HORIZON lunar-night stepper, stage 01: "Near-constant sunlight on high terrain…" contradicts CH.01, which was corrected to "long stretches of light". Stage 02, "As the two-week lunar day ends", describes the equatorial case on a stepper framed around a polar ridge.
  - **Fix stage 01:** "Long stretches of sunlight on high polar terrain…" / «Долгие периоды солнечного света на полярных возвышенностях…».
  - **Fix stage 02:** "As the ridge passes into shadow, solar output drops…" / «Когда гребень уходит в тень, выработка падает…».
- **E6 (NICE).** CAMPAIGN CH.09 heading "Now the mission carrying Apollo's old title" / «…несёт прежний титул «Аполлона»» is unclear.
  - **Fix:** "Now the first landing since Apollo 17" / «Теперь — первая посадка со времён «Аполлона-17»».

## 4. Linguist (RU): APPROVE-WITH-CHANGES

Overall the Russian is natural. Terminology is right (ЕКА, ККА, «Орион», проставка, приводнение), and number formatting in the static text uses non-breaking spaces and decimal commas.

- **L1 (MUST-FIX).** The new status values on HALO's hardware cards are English-only. `rows[].v` is rendered as `r.v` in both languages (the-lunar-gateway.html, JS around line 358), so RU readers see, for example, "Core of the SR-1 nuclear-electric spacecraft to Mars, per NASA's Moon Base manager (Sep 2026)", "$1.9B by Apr 2026", "Leverage partner commitments…" and "24 Mar 2026". These rows were added in this upgrade.
  - **Fix:** give each row `vEn`/`vRu` and render `lang==='en'?r.vEn:r.vRu`. Suggested RU:
    - «Lanteris Space Systems (ранее Maxar) [2]»
    - «375 млн долл., май 2019 [8]»
    - «Основа ядерно-электрического аппарата SR-1 для полёта к Марсу — по словам руководителя Лунной базы NASA (сент. 2026) [7]»
    - «Northrop Grumman; конструкция — Thales Alenia Space, Турин [3]»
    - «1,9 млрд долл. к апр. 2026 [5]»
    - «Силовая электроника и авионика перепрофилированы для грузов на поверхность Луны [6]»
    - «Использовать обязательства партнёров для Лунной базы [4]»
    - «Согласно списку NASA [1]»
    - «24 марта 2026 [4]»
    - «Не ранее 2032 года (прогноз OIG) [5]»
  - The same pattern exists, pre-existing, in HALO's partner cards and HORIZON's lander cards; fix them at the same time (SHOULD).
- **L2 (SHOULD).** CAMPAIGN CH.02 h2 «Необязывающий договор…» (EN "A non-binding treaty…") is a terminology error in both languages. The Accords are not a treaty, and the guide's own text calls them a non-binding set of principles.
  - **Fix:** EN "A non-binding agreement that keeps gaining signatories" / RU «Необязывающие соглашения, к которым присоединяется всё больше стран».
- **L3 (SHOULD).** «скругляет орбиту» (CAMPAIGN CH.08 and ref [20] note) is unidiomatic.
  - **Fix:** «переводит "Орион" на круговую орбиту» / «выполняет манёвр скругления орбиты».
- **L4 (SHOULD).** In instrument output, `fmtInt` groups digits with an ordinary space, while the static text uses U+00A0. A number can wrap mid-figure, for example in the status line "на 6 600 км".
  - **Fix:** use `' '` for RU and update checks.js test 19's regex to `/406 771/`.
- **L5 (SHOULD).** HORIZON renders the proper name «Реактор «Лунный-1»» / «Лунный-1». This is an invented translation of "Lunar Reactor-1", and CAMPAIGN-style body text uses "LR-1".
  - **Fix:** «Lunar Reactor-1 (LR-1)» everywhere.
- **L6 (NICE).** Grammar and parity details:
  - Plural agreement in readouts: «32 дн.» → «32 дня»; « г.» → «года» (or label «ЛЕТ» in the cell header).
  - `ACC` label «Албания, 73-я» → «73-й» to match the other labels, which refer to «подписант».
  - CH.02 «соглашения подписал Сан-Марино» → «подписало».
  - The distance note drops "and relay": «…через аппаратуру наземных станций и ретрансляторов».
  - Hero «КАМПАНИЯ» in `<title>` vs footer "CAMPAIGN —" in data-ru: pick one.

## 5. Information Design & Frontend accessibility: APPROVE-WITH-CHANGES (after M1)

What is already right:

- **Step chart:** y from 0, gridlines every 20, year ticks, axis label "published counts", and the flat-segment caveat is stated in the note.
- **Controls:** the range inputs are 44 px tall and buttons have `min-height:44px`. Labels are tied with `for`, `aria-valuetext` is set and localised, and SVGs have `role="img"` with localised `aria-label`.
- **Keyboard and contrast:** hotspots and chips get keyboard support from site.js (role, tabindex, Enter/Space). The highlight colour #2f5aa1 on white is about 6.6:1 and the small text #5f5f59 is about 6.4:1.
- **Motion:** the instruments add no animation, so there is nothing to gate on reduced motion.

Findings:

- **A1 (SHOULD).** Both `#accReadout`/`#distReadout` and `#accStatus`/`#distStatus` are `aria-live="polite"`. Every slider `input` event re-announces six cells plus the status, which is very verbose with screen readers while dragging.
  - **Fix:** remove `aria-live` from the readout grids and keep it on the status lines only.
- **A2 (SHOULD).** At 390 px width the SVG renders about 0.7× (viewBox 480), so the 10 px `.sim-svg text` displays at roughly 7 px, below legible size.
  - **Fix:** raise to `font-size:13px` in the SVG, or use the existing larger-text media query: `@media (max-width:520px){.sim-svg text{font-size:14px}}`.
  - Distance-marker labels at x≈409/415 also crowd, since Apollo 13 and Artemis II sit about 6 px apart. They are already staggered vertically, which is OK.
- **A3 (NICE).** The Accords preset buttons carry no `aria-pressed` until the first click; the distance presets set it on init. Initialise them the same way.
- **A4 (NICE).** The step chart's flat-then-jump rendering visually implies no signings for 2.7 years between 2020 and 2023. This is disclosed in the note, but drawing those runs dashed would show it directly: "between published counts".

Not flagged: the chapter counters (CH.xx / 10 vs / 11 on HORIZON and HALO), per the brief.

---

## Consolidated MUST-FIX

1. **M1 (CAMPAIGN):** set `#distKm` to `step="1"`. Browsers snap 406,771 to 406,800 and 400,171 to 400,200, so the presets show the wrong km, mi and Apollo 13 delta. Add a checks.js test that the preset value is a step multiple and that its readout matches the quoted figure.
2. **R1 (CAMPAIGN):** the shortened entry-range sentence cites [15], which does not say it. Add NASA's 5 Dec 2024 heat-shield release as a reference and cite it there; remove "shortened entry range" from [15]'s note in EN and RU, and from NOTES.md.
3. **R2 (HORIZON):** the lander cards still assert "Rocket explosion, May 2026", "Slipped at least 8 months per NASA OIG" and "V3 TEST FLIGHT Targeted 2026" without a source, plus `DELAYED`/`dead` styling. Replace them with sourced rows (text above).
4. **E1 (CAMPAIGN):** CH.06 h2 "…than any human in fifty years" → "Farther from Earth than any human before" / «Дальше от Земли, чем кто-либо из людей до них».
5. **E2 (HALO):** the HALO chip "Built, …" → "Structure built; stop-work order Apr 2026" / «Конструкция изготовлена; работы остановлены в апр. 2026»; the description "integrated with PPE before launch" → "was to be integrated…".
6. **L1 (HALO):** the new hardware-status row values render in English on the RU page. Add `vEn`/`vRu` (RU text above).

After these are fixed, re-run `./check-all.sh campaign-artemis-program` and `test.js` on both freshness pages.
