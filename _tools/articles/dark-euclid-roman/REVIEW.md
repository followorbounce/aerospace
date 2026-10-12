# REVIEW — DARK (Euclid & Roman: dark matter and dark energy)

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Four MUST-FIX items. Two are logic bugs in Instrument 2 that show physically wrong messages in reachable states, one is the Roman status paragraph, and one is a broken Russian sentence. The core numbers hold up when re-derived independently, including a fresh download of the SPARC table and a fresh halo fit.

Scripts and data: `/tmp/claude-1000/-home-none-git/4821a4ce-2654-4b7d-8122-31c1dceef901/scratchpad/review-dark/`
- `halo.py` (scipy Nelder–Mead halo fit)
- `cosmo.py` (scipy `quad`, rel. tol 1e-12)
- `agebug.js` and `status.js` (jsdom runs of the real generated page)
- `data/x/NGC3198_rotmod.dat` (re-downloaded from SPARC `Rotmod_LTG.zip`), `data/euclid.txt` (Euclid overview, arXiv HTML), `data/zw.txt` (Zwicky translation PDF)

`./check-all.sh dark-euclid-roman` → **ALL OK** (errors 0, offStep [], missingRu 0, cites 21/21, timeline 11, 40 checks PASS).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

**Independent re-derivation:**

| Quantity | Reviewer | Page |
|---|---|---|
| SPARC NGC 3198 table vs `N3198` array | identical, 43 rows, D = 13.8 Mpc | ✔ |
| Υ = 0.5 halo fit (continuous optimiser, not a grid) | R_c 2.659 kpc, ρ₀ 0.0530 M☉/pc³, χ²/dof 1.217 | 2.66 · 0.053 · 1.22 ✔ |
| Υ = 0.2 / 0.3 / 0.9 / 1.2, χ²/dof | 4.24 / 2.45 / 3.86 / 30.4 | "poor fit" status triggers at > 2 ✔ |
| M(<44.08 kpc) = v²R/G | 2.2754e11 M☉ | 2.28e11 ✔ |
| Visible v, M at the edge (Υ 0.5) | 64.7 km/s, 4.29e10 M☉ | 65, 4.3e10 ✔ |
| Dark share, Υ = 0.5 / 0.3 / 0.9 / 1.2 | 81.1 / 84.6 / 74.3 / 69.2 % | 81 %; NOTES "74–85 %" ✔ |
| Kepler from visible M(<14 kpc), at 44 kpc | 51.0 km/s | 51 ✔ |
| Halo v² vs direct integration of ρ₀/(1+(r/R_c)²) | 88.545 km/s both | ✔ |
| Ω_b, Ω_c, ratio (h = 0.6736) | 0.04930, 0.26447, 5.364 | 4.9 / 26.5 %, 5.4 ✔ |
| Age, Planck 2018 (no radiation) / EdS | 13.8007 / 9.6773 Gyr | 13.80 / 9.68 ✔ |
| d_L(0.5), Planck | 2,928.5 Mpc = 9.552 Gly | 9.55 ✔ |
| Planck vs (Ω_m 0.2, no Λ) at z 0.5 / 1.0 | +8.37 % / +8.45 % | "about 8 %" ✔ |
| Δμ vs empty at z 0.5: Planck / matter-only | +0.1117 / −0.2756 mag | 0.112 / −0.276 ✔ |
| Planck Δμ crosses zero (vs empty) | **z = 1.173**; −0.090 mag at z 1.5 | see MUST 1.2 |
| Deceleration→acceleration, Planck | z_t = 0.632 | (not stated) |
| Empty universe age 1/H₀; Ω_m 0, Ω_Λ 0.5 | 14.52 Gyr; 18.09 Gyr | **page: "no Big Bang"**, see MUST 1.1 |
| Euclid density 1.5e9/14,000 deg² | 29.76 arcmin⁻²; log₁₀ N presets 1.473661 / 5.029963 / 9.176091 | ✔ (exact) |
| N for S/N 10 at γ 2 %; area | 16,900; 568 arcmin² = 0.158 deg² | ✔ |
| σ on mean, 1.5e9 galaxies | 6.713e-6 | ✔ |
| Pointings for 1,000 deg²: Euclid / Roman / WFC3 / NIRCam | 1,852 / 3,559 / 800,000 / 371,134 | ✔ |
| Roman ÷ WFC3-IR field | 224.8 with 4.5′² (217.7 with 123″×136″) | text "about 200×" per NASA ✔ |
| Two-sided 1/p at 3σ / 4σ / 5σ | 370.4 / 15,787 / 1.744e6 | ✔ |

- **The fit method is sound.** For each R_c, ρ₀ is linear in v², and the best R_c is picked by χ² in v. My unconstrained 2-parameter fit lands on the same minimum, so the 401-point grid is fine. The fit's degrees of freedom are 43 − 2, with Υ fixed.
- **The cosmology formulas are right.** S_k uses sinh/sin. The empty universe has d_L = z(1 + z/2). The age integrand 2u²/√(Ω_m + Ω_k u² + Ω_Λ u⁶) with a = u² is a correct change of variables.
- **The shape-noise model is consistent.** σ_ε = 0.26 is used per component, both in the drawing and in S/N = γ√N/σ_ε. This matches the Euclid overview's N_g = (σ_ε/(σ_m|γ|))² usage.
- **The charts are honest in the main.** The rotation-curve y-axis starts at 0 and is linear. Error bars are clipped at 0. Every curve is labelled.

Findings:
1. **MUST — `age()` reports "no Big Bang" for every Ω_m = 0 universe, including the empty reference universe.** In the real page (jsdom), Ω_m 0 / Ω_Λ 0 gives *"THIS UNIVERSE: no Big Bang: it would have bounced"* and *"So much dark energy and so little matter…"*, even with no dark energy at all. Ω_m 0 / Ω_Λ 0.5 gives the same. The cause: at u = 0 the code tests `q = Ω_m + … = 0`, and `q <= 0` returns NaN. These universes do start from a Big Bang, with ages of 14.52 and 18.09 Gyr. Ω_m = 0 is one notch on the slider, and it is the very universe the chart uses as its zero line.
   Fix in `age()`: `if(q < 0) return NaN; if(q === 0){ if(i === 0 && Ok > 0) continue; return NaN; }`. The integrand tends to 0 at u = 0 when Ω_m = 0 and Ω_k > 0. Add checks: `age({Om:0,OL:0})` ≈ 14.52 Gyr (= 1/H₀) and `age({Om:0,OL:0.5})` ≈ 18.09 Gyr.
2. **MUST — wrong status under the default Planck universe for z > 1.19.** With PLANCK 2018 selected and z = 1.4, the readout shows Δμ −0.061 and the status says *"Closer than in an empty universe: gravity has been slowing the expansion. The 1998 supernovae said otherwise."* In ΛCDM, light from z ≳ 1.17 left during the matter-dominated slowdown, which the later acceleration has not yet outweighed. That is the expected result, not a contradiction of 1998. Fix: branch on `c.OL > 0`.
   - EN (`dm < −0.005`, `c.OL > 0`): "Closer than in an empty universe: this light set out while matter still dominated and gravity was slowing the expansion, and the later speeding-up has not yet made up for it. That happens even in an accelerating universe — the 1998 supernovae, below z = 1, saw the net speeding-up."
   - RU: «Ближе, чем в пустой Вселенной: этот свет вышел, когда ещё преобладало вещество и гравитация тормозила расширение, и позднейшее ускорение пока не возместило торможения. Так бывает и в ускоряющейся Вселенной: сверхновые 1998 года, на z меньше 1, увидели итоговое ускорение.»
   - Keep the current text for `c.OL === 0`.
   - Also soften the "farther" branch. EN: "Farther than in an empty universe: along this supernova's light path, the speeding-up has outweighed any earlier slowing-down". RU: «Дальше, чем в пустой Вселенной: на пути света этой сверхновой ускорение расширения перевесило более раннее замедление».
   - Add a check that Planck at z = 1.4 does not produce the "said otherwise" text.
3. **SHOULD — the leftover share is neutrinos, not radiation.** Eq note: *"with Ω_Λ = 0.6847 they sum to 1 within the small share of radiation"*. The gap is 1 − 0.9985 = 0.0015, which is massive neutrinos (Ω_ν ≈ 0.06 eV/93.14 eV/h² = 0.0014). Radiation is only about 9 × 10⁻⁵. checks.js already says "neutrinos".
   - EN: "with Ω_Λ = 0.6847 they sum to 1 once the small neutrino share (about 0.14 %) is added [2]."
   - RU: «вместе с Ω_Λ = 0,6847 сумма равна 1, если добавить небольшую долю нейтрино (около 0,14 %) [2].»
4. **SHOULD — the 1998 significance is quoted only with the flat prior.** The Riess abstract also gives *Ω_Λ > 0 at 3.0σ and 4.0σ* with no prior on flatness. Adding this sets up the σ lesson of CH.06 honestly.
   - EN: "…required a positive cosmological constant at 7σ to 9σ — or 3σ to 4σ without that assumption [7]."
   - RU: «…требовали положительной космологической постоянной на уровне 7σ–9σ, а без этого предположения — 3σ–4σ [7].»
5. **NICE — the "4σ" chance is rounded two ways.** The body says "about once in 16,000" and the note says "1 in 15,800". Use "about once in 16,000" in both, or 15,800 in both.
6. **NICE — Instrument 2 clips curves at the plot edge without saying so.** Δμ is clamped to [−0.8, +0.6]. For example, Ω_m 0.05 / Ω_Λ 1.2 reaches +0.90 at z 1.5 and draws as a flat line on the top border. Stop the path at the border, or mark the clip with a small arrow.
7. **NICE** — Zwicky's own value in the paper is **558** km/s/Mpc (Hubble & Humason 1931). "500" is the figure he quotes historically. Write "558 km/s per million parsecs (about eight times today's 67.4)" / «558 км/с на миллион парсек (примерно в восемь раз больше сегодняшних 67,4)».

## 2. Research / fact-check — APPROVE WITH CHANGES

**All 21 reference URLs return 200.** I opened and confirmed the cited text:
- **Zwicky (Andernach translation):** "Doppler effect of 1000 km/s or more … at least 400 times greater …"; quote "dark matter exists in much greater density than luminous matter" ✔ verbatim.
- **Planck 2018:** standard values ✔.
- **Rubin & Ford 1970:** 67 H II regions, 3–24 kpc, mass roughly linear past 4 kpc out to 14 kpc ✔.
- **Riess 1998:** "10% to 15% farther … (Ω_M = 0.2)"; flat prior 7σ and 9σ ✔.
- **Perlmutter 1999:** 42 SNe, 0.18–0.83, flat Ω_M = 0.28 ✔.
- **Nobel 2011** ✔.
- **Kilbinger** §1: "on the order of a few percent, much smaller than the width of the intrinsic shape … distribution" ✔.
- **ESA launch release:** Falcon 9, Cape Canaveral, 17:12 CEST, 1 July 2023 ✔.
- **Euclid overview:** 1.2 m Korsch; 0.54 deg²; 14,000 deg² in about six years; 1.5 billion; 35 million; σ_ε = 0.26; w to about 1 %; survey start 14 Feb 2024; WFC3 4.5 arcmin², NIRCam 9.7 arcmin² ✔.
- **Q1:** 63.1 deg², about 30 million objects ✔.
- **ESA DR1 timeline** (update of 15 June 2026): Nov 2026 "about 1900 deg²", complete DR1 mid-2027; "exact release dates will be communicated at a later stage" ✔.
- **NASA launch release:** 30 Aug 2026, 7:26 a.m. EDT, Falcon Heavy, LC-39A, bound for L2; "first images by early 2027" ✔.
- **NASA Roman FAQ:** 2.4 m, same as Hubble ✔. **WFI technical page:** 18 H4RG-10 detectors, 0.281 deg² excluding gaps, ≈200× WFC3-IR ✔. **HLWAS page:** >5,000 deg², about 12 %, "just under a year and a half" ✔.
- **DESI DR2 abstract:** BAO alone well described by flat ΛCDM; 3.1σ with CMB; 2.8–4.2σ with SNe ✔. The per-sample split (Pantheon+/Union3/DESY5) is in the paper body.
- **Dovekie (v3, 27 Mar 2026):** "3.2σ, reduced from 4.2σ for DES-SN5YR"; "only a weak preference" ✔.
- **Currency:** a search found no 2026 DESI update that supersedes these σ values. No source I found reports Roman's L2 arrival yet, so "on its way to L2" is consistent with the evidence.

Findings:
1. **MUST — the Roman commissioning sentence is not backed by its source and is partly wrong.** Text: *"the Wide Field Instrument was switched on on 15 September and the coronagraph took its first observation in September [19]; NASA expects science to begin by early 2027 [15]."*
   - Ref [19] (30 Sep post) gives **no WFI date**. It dates coronagraph first light to **22 September**.
   - The WFI activation is in a separate post dated 15 Sep (`…/blogs/roman/2026/09/15/nasa-activates-romans-primary-instrument-checks-out-coronagraph/`). The heater was switched off on 11 Sep, and the detectors were activated in the following days, so 15 September is the blog date, not the switch-on date.
   - NASA promises *first science images* by early 2027 ([15] and the 15 Sep post), not "science to begin".
   - Fix EN: "As of 11 October 2026 Roman is in commissioning on its way to L2: its Wide Field Instrument was switched on in mid-September [new ref] and the coronagraph saw its first light on 22 September [19]; NASA expects to release Roman's first science images by early 2027 [15]."
   - RU: «По состоянию на 11 октября 2026 года Roman проходит ввод в эксплуатацию на пути к L2: широкоугольный прибор включили в середине сентября [новая ссылка], а коронограф получил первый свет 22 сентября [19]; первые научные изображения NASA рассчитывает опубликовать к началу 2027 года [15].»
   - Add the 15 Sep post as a reference. Fix the matching timeline row "2027 — Planned: Roman science begins" → "Roman's first science images expected [15]" / «ожидаются первые научные изображения Roman [15]». Update NOTES ("WFI on 15 Sep") to match.
2. **SHOULD — Rubin, Ford & Thonnard 1980 is misdescribed.** Body: *"rotation curves for 21 spirals from 4 to 122 kpc across [4]: they stay flat."* The title and abstract give **radii** (NGC 4605, R = 4 kpc, to UGC 2885, R = 122 kpc, at H₀ = 50). The abstract also says most curves are *still rising slowly* at the last point and none falls. Ref note [4] already says "radii".
   - EN: "By 1980 they had rotation curves for 21 spirals with radii from 4 to 122 kpc [4]: not one falls off, and most are still rising slightly at the last point measured."
   - RU: «К 1980 году у них были кривые вращения 21 спиральной галактики радиусом от 4 до 122 кпк [4]: ни одна не спадает, а большинство всё ещё слегка растёт в последней измеренной точке.»
3. **SHOULD — Zwicky did not measure the velocities.** *"In 1933 Fritz Zwicky measured how fast the galaxies of the Coma cluster move…"* He used eight published radial velocities (from Hubble & Humason and others) and did the dynamical calculation himself.
   - EN: "In 1933 Fritz Zwicky took the measured speeds of galaxies in the Coma cluster — spread over about 1,000 km/s — and asked how much mass it takes to keep them together."
   - RU: «В 1933 году Фриц Цвикки взял измеренные скорости галактик скопления Волос Вероники — с разбросом около 1000 км/с — и задался вопросом, сколько массы нужно, чтобы удержать их вместе.»
4. **NICE** — re-check the Roman status (L2 arrival, end of commissioning) and the Euclid DR1 date (November 2026) on the day this ships. NOTES already lists both.

## 3. Science Communication & Education — APPROVE WITH CHANGES

The guide teaches well. Each chapter answers "how do we know". The halo instrument shows how a dark share follows from Υ, and the poor-fit warning for extreme Υ is a nice touch. "Model, not data" is stated plainly. CH.06 is a model of calibrated language: it gives σ and its meaning, names systematics, and closes with "a hint, not a discovery".

1. **SHOULD — the hero overstates what is "seen".** *"Everything astronomers have ever seen — stars, gas, dust, planets — adds up to about a twentieth of the universe."* The 4.9 % is *all* ordinary matter, and most of it is diffuse gas that is hard to see. Stars alone are well under 1 %.
   - EN: "Ordinary matter — the stuff of stars, gas, dust and planets — makes up only about a twentieth of the universe."
   - RU: «Обычное вещество — то, из чего состоят звёзды, газ, пыль и планеты, — составляет лишь около двадцатой части Вселенной.»
2. **SHOULD — the hero says Roman is already mapping.** *"Two space telescopes are now mapping it"*. Roman is still in commissioning.
   - EN: "Two space telescopes are built to map it: ESA's Euclid, surveying since 2024, and NASA's Roman, launched on 30 August 2026."
   - RU: «Картографировать его созданы два космических телескопа: Euclid ЕКА, ведущий обзор с 2024 года, и Roman NASA, запущенный 30 августа 2026 года.»
3. **NICE — clarify what the "EUCLID WIDE" preset means.** Its noise of 6.7 × 10⁻⁶ treats the whole sky as one constant shear. Add one clause to the note: "The real shear changes from patch to patch; Euclid's gain is measuring it in many thousands of independent patches." RU: «Настоящий сдвиг меняется от участка к участку; выигрыш Euclid — в измерении его в многих тысячах независимых участков.»
4. **NICE** — say why Υ 0.5 is "typical": SPARC adopts Υ = 0.5 at 3.6 µm [5]. Add this to the Instrument 1 note.
5. **NICE** — the CH.05 heading "a hundred Hubbles' view" undersells the page's own "about 200 times". Use "two hundred Hubbles' view" / «поле зрения двухсот «Хабблов»», or keep it as a deliberate understatement.

## 4. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is generally good. The terminology is right: фотометрическое расстояние, модуль расстояния, псевдоизотермическая сфера, слабое линзирование, зв. вел., кв. градус, угл. мин². Decimal commas are used and figures are consistent with EN.

1. **MUST — a sentence with no subject (CH.04).** *«Первый взгляд на глубину обзора Euclid дал в марте 2025 года: быстрый выпуск охватил 63,1 кв. градуса…»*. Who "gave" the look is missing. Fix: «Первый взгляд на обзор Euclid в полную глубину дал в марте 2025 года быстрый выпуск данных Q1: 63,1 кв. градуса глубоких полей и около 30 млн объектов [13].»
2. **SHOULD — the constellation name.** «скопление Волосы Вероники» (CH.01, timeline, ref note) → «скопление Волос Вероники» (the standard form). Example: «галактики скопления Волос Вероники», «скоплению Волос Вероники».
3. **SHOULD — the CH.01 heading.** «Скопление движется слишком быстро, чтобы удержаться» reads as "to hold on". Use «Скопление, которое движется слишком быстро, чтобы не разлететься».
4. **SHOULD — "budget".** «Лучший сегодняшний баланс…» and the label «БАЛАНС ВСЕЛЕННОЙ» → «Самую точную на сегодня оценку состава Вселенной дают…» and «СОСТАВ ВСЕЛЕННОЙ, PLANCK 2018».
5. **SHOULD — subject–verb agreement.** «Простейшее объяснение — космологическая постоянная Λ — одинакова везде…» → «Простейшее объяснение — космологическая постоянная Λ: она одинакова везде и во все времена.»
6. **SHOULD** — «Вместо этого что-то расталкивает.» → «Вместо этого что-то его ускоряет.»
7. **SHOULD** — «Какое Υ ни выбери, видимое вещество не удерживает край на 150 км/с» → «Какое Υ ни выбери, видимого вещества не хватает, чтобы край галактики вращался со скоростью 150 км/с.»
8. **SHOULD** — «ближний инфракрасный спектрометр-фотометр» attaches "near" to the device, not the band. Use «спектрометр-фотометр ближнего ИК-диапазона (NISP)».
9. **SHOULD** — «Широкоугольный обзор высоких широт» → «Широкоугольный обзор высоких галактических широт (HLWAS)». Without "galactic", «высокие широты» reads as Earth latitudes.
10. **NICE** — CH.01 has a stray comma before the dash: «…множитель сильно уменьшился, — но разрыв…» → «…уменьшился — но разрыв…».
11. **NICE** — «чем обычной» → «чем обычного вещества», to match the term used just before. Also «ориентированы как попало» → «ориентированы случайно», «примерно с точностью 1 %» → «с точностью около 1 %», «с Космического центра Кеннеди» → «из Космического центра Кеннеди», «космическая дисперсия выборки» → «космическая дисперсия».
12. **NICE** — the hero kicker «4.9 % · 26.5 % · 68.5 %» has no `data-ru`, so it shows decimal points in RU. Add `data-ru="4,9 % · 26,5 % · 68,5 %"`.

## 5. Information Design & Frontend accessibility — APPROVE WITH CHANGES

Reasoned from code plus the jsdom runs. The following are fine:
- Every slider sets `aria-valuetext` (the lesson from BURST has been applied).
- The SVGs have `role="img"` and bilingual `aria-label`s.
- Button-group labels are translated through `data-aria-*`, and `aria-pressed` is used.
- Statuses are `aria-live="polite"`.
- `.btn` and range inputs are 44 px, and focus-visible outlines are set.
- The FoV table is in `.table-scroll` with `scope` attributes.
- Preset values are kept exact (no off-step).
- The guide has no animation.

1. **SHOULD — the halo toggle mixes two toggle patterns.** On load it reads **"SHOW DARK HALO"** while the halo *is* shown and `aria-pressed="true"`. After clicks it alternates "SHOW…"/"HIDE…" while `aria-pressed` also flips, so a screen reader announces "Hide dark halo, pressed". Fix: keep the constant label "SHOW DARK HALO" / «ПОКАЗАТЬ ТЁМНОЕ ГАЛО» and toggle only `aria-pressed` and `.active`. Remove the text and `data-en`/`data-ru` swap in the click handler.
2. **SHOULD — the Instrument 2 reference curves are identified only in the note.** All three are grey and differ only by dash pattern. Add direct labels at their right-hand ends ("Planck", "Ω_m 0.2", "matter only" / «Planck», «Ω_m 0,2», «только вещество»).
3. **SHOULD — the legend text is low-contrast.** The "visible matter" legend text in #a8741a on #fbfbf8 is about 3.9 : 1, below 4.5 : 1 for small text. Darken the text only (e.g. #8a5f12, about 5.5 : 1). The line colour can stay.
4. **NICE — Instrument 3 label overflow on phones.** The gauge label "avg of 48" starts at x = 422. At the phone font size (14 units) it runs to about x = 490 and is clipped by the 480 viewBox. Anchor it `end` at x = 476, or move it left of the gauge.
5. **NICE** — "FIG. 00 — ROMAN LAUNCH, 30 AUGUST 2026" in the hero kicker names a figure that does not exist. Use "ROMAN LAUNCHED 30 AUGUST 2026" / «ROMAN ЗАПУЩЕН 30 АВГУСТА 2026».

## 6. Ethics — APPROVE WITH CHANGES

The guide credits fairly overall:
- Zwicky, Rubin, Ford and Thonnard are named.
- Riess, Schmidt and Perlmutter are named, with both teams.
- Lelli, McGaugh and Schombert are credited for SPARC.
- The DES team's own downgrade of its result is reported prominently and without spin.
- There is no hype: "nobody yet knows", "Not settled", "a hint, not a discovery".

1. **SHOULD — credit the classic NGC 3198 result.** NGC 3198 is *the* textbook dark-halo galaxy because of the radio (21 cm) work of van Albada, Bahcall, Begeman & Sancisi (1985, ApJ 295, 305), and radio astronomers (Roberts, Bosma) found flat outer curves alongside Rubin's optical work. Add one sentence with a citation.
   - EN: "NGC 3198 became the classic case in 1985, when van Albada, Bahcall, Begeman and Sancisi used its radio-measured gas to show it needs a dark halo [new ref]."
   - RU: «NGC 3198 стала классическим примером в 1985 году, когда ван Альбада, Бакал, Бегеман и Санчизи по радионаблюдениям её газа показали, что ей нужно тёмное гало [новая ссылка].»
2. **NICE — say who Nancy Grace Roman was.** NASA FAQ [16]: "named to honor a NASA pioneer, Nancy Grace Roman, who is considered the 'mother of Hubble'."
   - EN: "…named after Nancy Grace Roman, NASA's first chief of astronomy, often called the 'mother of Hubble' [16]."
   - RU: «…названный в честь Нэнси Грейс Роман, первой руководительницы астрономических программ NASA, которую называют «матерью „Хаббла“» [16].»
   - Note: "first chief of astronomy" needs its own source, or keep only the FAQ wording.
3. **NICE** — the Vera C. Rubin Observatory's survey is a third dark-universe map named after her. One cited line in CH.05/06 would close the Rubin story; it is optional.

---

## Consolidated MUST-FIX

1. **`age()` returns NaN for every Ω_m = 0 universe**, so the empty reference universe shows "no Big Bang … so much dark energy". Fix the u = 0 test and add the 1/H₀ check (§1.1).
2. **Instrument 2 status under PLANCK 2018 at z > 1.19** says gravity slowed the expansion and "the 1998 supernovae said otherwise". Branch on Ω_Λ > 0 with the EN/RU text in §1.2 and add a check.
3. **Roman status sentence:** the WFI date is not in ref [19] and 15 Sep is the blog date, not the switch-on. Coronagraph first light was 22 Sep. NASA promises "first science images", not "science", by early 2027. Fix EN/RU, add the 15 Sep reference, and fix the timeline row and NOTES (§2.1).
4. **The RU CH.04 sentence «Первый взгляд … дал в марте 2025 года:» has no subject.** Rewrite it as in §4.1.

Strongly recommended before publishing (SHOULD):
- Rubin 1980 is radii, not "across", and the curves are still rising (§2.2).
- Neutrinos, not radiation (§1.3).
- The 1998 significance without the flat prior (§1.4).
- The hero "everything seen" and "now mapping" (§3.1–3.2).
- Zwicky used measured speeds (§2.3).
- The halo toggle label (§5.1).
- Direct labels for the Instrument 2 reference curves (§5.2).
- The van Albada et al. 1985 credit (§6.1).
- The Russian fixes in §4.2–4.9.

Re-check the Roman blog and ESA's DR1 page on the day this ships.
