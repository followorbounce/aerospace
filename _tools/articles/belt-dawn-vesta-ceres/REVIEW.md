# BELT — Dawn at Vesta & Ceres: cross-disciplinary review

**Date:** 2026-10-09 · **Reviewed:** `belt-dawn-vesta-ceres.html` and its sources (body.html, script.js, checks.js, meta.json, extra.css, NOTES.md)
**Panel lenses:** Physics & Mathematics · Research / fact-check · Science Communication & Education · Linguist (RU) · Information Design & Frontend a11y · Ethics
**Overall verdict: APPROVE WITH CHANGES.** There are 4 MUST-FIX items. Each is a small text or code change, and none needs a redesign.

`./check-all.sh belt-dawn-vesta-ceres` → ALL OK (37 checks, 0 missing `data-ru`, 18 cites = 18 refs). Independent re-derivation script: `/tmp/claude-1000/-home-none-git/c08a888d-36f6-489f-bebf-b7fcbf302f74/scratchpad/review-belt/derive.py`.

---

## 1. Physics & Mathematics: approve-with-changes

I re-derived these independently, and they agree with the page:
- 30,045 kg chemical at 320 s (24.7× launch mass). The ideal ion case at 3,100 s needs 364 kg.
- Implied I_sp is 2,973 / 2,808 / 2,729 s.
- 92 mN is the weight of 9.381 g, or 1.88 A4 sheets.
- 0→100 km/h takes 4.26 d. The mission-average acceleration is 62.0 µm/s².
- Densities are 3,463 / 2,162 kg/m³ and g is 0.2530 / 0.2839 m/s².
- Escape speeds are 363.7 / 516.4 m/s. Jumps are 19.4 / 17.3 m.
- Kepler periods match within −1.4…+2.1 % (Vesta survey −2.0 % against JPL's 69 h; Ceres RC3 +2.2 % against 15 d).
- Edelbaum spirals give 91.0 m/s (Ceres HAMO→LAMO) and 56.0 m/s (Vesta).
- The ratio of the 45-day transfer to the full-thrust time is 3.23.

The formulas and units are correct. The Edelbaum |v₁−v₂| result is applied correctly, for coplanar circular orbits only, and its limits are stated.

1. **MUST-FIX: the xenon ledger contradicts itself at the milestones.** The curves and the "PROPELLANT NEEDED" readout use a fixed final mass m_f = 792.7 kg. The milestone I_sp, however, is derived with the actual final mass at that moment, M_LAUNCH − xe (that is correct, and checks.js even round-trips it with 1217.7 − 250). As a result:
   - Pressing **AT VESTA, 2011** sets 6.70 km/s / 2,970 s. The readout and red dot then show **≈205 kg**, while the milestone row and the blue square say **250 kg**. The status line even says "Fits in Dawn's tank: 205 kg of 425".
   - **AT CERES, 2016** shows ≈389 kg against 401 kg.
   - Only WHOLE MISSION agrees, because there the final mass really is 792.7 kg.

   The blue squares are also plotted against curves that assume a different final mass, so a reader cannot compare them honestly with the curves.

   **Fix (preferred):** model a fixed *initial* mass, m_prop = m₀(1 − e^(−Δv/(I_sp g₀))) with m₀ = 1,217.7 kg. Every milestone then lies exactly on the curve for its implied I_sp, and the 425 kg line keeps its meaning. Keep the "30 t chemical" point as a separate readout row ("to deliver the same 792.7 kg spacecraft: 30,045 kg"). Under m₀ the chemical curve can never exceed 1,217.7 kg, which is itself the lesson.
   **Minimal alternative:** while a milestone is active, compute the readout and dot with m_f = M_LAUNCH − m.xe.

   Either way, add a check to checks.js: after clicking each milestone, the readout must equal the milestone xenon to within 1 %. That check would have caught this.
2. **SHOULD: the whole-mission "I_sp ≤ 2,729 s" is not a valid upper bound.** The two error sources pull in opposite directions. Ignoring the hydrazine raises the implied I_sp. Using the 425 kg *load* rather than the unknown amount actually consumed lowers it. Show "≈" for the `end` milestone, or add "(load, not consumed; not a bound)". The equation note's sentence "so it is an upper bound" should then read "so for the two dated milestones it is an upper bound".
3. **SHOULD: checks.js tests a different claim from the text.** `'Ceres ≈ two-thirds as dense as Vesta'` asserts 0.625 ± 0.01, but the text says "about two-thirds" (0.667). Either change the text (see 3.4) or test against 2/3 with an honest tolerance.
4. **NICE:** The thrust instrument and text never say that Dawn fired **one engine at a time**. Readers will be tempted to multiply 92 mN by 3. Add to Ch.2: EN "…and only one fired at a time." RU "…и одновременно работал только один."

## 2. Research / fact-check: approve-with-changes

Spot-checked against primary sources:

| Claim | Source checked | Result |
|---|---|---|
| Masses 1,217.7 / 747.1 / 425 / 45.6 kg; 19.7 m; 10.3 / 1.3 kW; 92 mN at 2.6 kW; 1,900–3,200 s; 30 cm | NSSDC 2007-043A | ✔ |
| 250 kg / 6.7 km/s at Vesta capture; Mars flyby the only ΔV not made by IPS | Garner et al. 2011 (NTRS abstract) | ✔ |
| 401 kg / > 11.0 km/s; LAMO 385 km | Garner & Rayman 2016 (NTRS abstract) | ✔ |
| 5.87 yr; 25,700 mph = 41,360 km/h; "not Dawn's actual velocity" | JPL 28 Jun 2018 | ✔ |
| Missed contacts 31 Oct / 1 Nov 2018; ≥ 20 yr, > 99 % for ≥ 50 yr; 6.9 billion km | JPL 1 Nov 2018 | ✔ |
| Occator 92 km, ~20 Myr; brine ~40 km; deposits < 2 Myr; < 35 km | JPL 10 Aug 2020 | ✔ |
| Mars flyby 542 km, 17 Feb 2009; Vesta 16 Jul 2011 05:00 UT; HAMO 680 km / 12.3 h, six maps; LAMO 210 km / 4.3 h; 13,000 photos, > 2.6 M spectra; Rheasilvia 500 km, Veneneia 400 km; wheel failures 17 Jun 2010 / 8 Aug 2012; Ceres orbits and dates | Siddiqi, *Beyond Earth*, pp. 253–256 | ✔ (but see 2.1, 2.2) |
| GM, diameters, densities (Park 2025 / Park 2016) | JPL SBDB API, live | ✔ exact |
| Rayman "sheet of paper", "> 5 days to 60 mph", "< 2.7 mg/s" | Planetary Society Dawn Journal, 2 Jul 2013 | ✔ quoted, **✘ context dropped**, see 2.3 |

Reference URLs: [1] [2] [3] [4] [5] [6] [8] [12] [13] [14] [15] [16] [17] [18] and the SBDB link return 200. [7] [10] [11] (AIAA and Science DOIs) return 403 to scripts. That is a publisher bot block, the DOIs are well-formed, and it is acceptable.

1. **MUST-FIX: Ceres arrival was 6 March 2015, not 7 March.** JPL, "NASA Spacecraft Becomes First to Orbit a Dwarf Planet" (6 Mar 2015), says "captured by the dwarf planet's gravity at about 4:39 a.m. PST … Friday [6 March]". That is 12:39 UTC on 6 March. *Beyond Earth* gives "00:39 UT on 7 March 2015", which is 12 h off, apparently a transcription slip. The page's other dates are UTC (Vesta 16 July = 05:00 UT), so 6 March is correct in every convention.
   Change it in:
   - **the hero kicker:** "FIG. 00 — 6 MARCH 2015, CERES" / "РИС. 00 — 6 МАРТА 2015, ЦЕРЕРА";
   - **Ch.7:** "On 6 March 2015 it entered orbit…" / "6 марта 2015 года он вышел на орбиту…";
   - **the timeline:** `<b>6 March:</b>` / `<b>6 марта:</b>`.

   Add the JPL release as a reference (https://www.jpl.nasa.gov/news/nasa-spacecraft-becomes-first-to-orbit-a-dwarf-planet/) and cite it there. Record the discrepancy in NOTES.md.
2. **MUST-FIX: "the first spacecraft to orbit two bodies other than the Sun" is false.** It is Siddiqi's own wording, but it is still false. Many spacecraft orbited Earth and then the Moon: Apollo CSMs, Clementine, and SMART-1, which did so on ion propulsion (2003–06). JPL's wording is correct: "go into orbit around two destinations beyond Earth" [16], or "outside of the Earth-Moon system" [5].
   - **Ch.7:** EN "…and the first spacecraft to orbit two destinations beyond Earth [16]." RU "…и первый аппарат, побывавший на орбитах двух тел за пределами Земли [16]."
   - **Ref [1] note:** change "first to orbit two bodies" to "first to orbit two bodies (see [16] for the precise wording)", or drop the phrase.
   - **Ch.9 quote,** same problem: "Every earlier probe had either flown past its targets or stayed with one." Change it to EN "Every earlier deep-space probe had either flown past its targets or orbited just one of them." RU "Все прежние межпланетные зонды либо пролетали мимо целей, либо выходили на орбиту только одной из них." NEAR flew past Mathilde and then orbited Eros, and this wording covers that case.
3. **MUST-FIX: two Rayman figures are quoted without the context that changes their meaning.** The source says "**At today's thrust level**, it would take more than five days…". That is the reduced thrust of mid-2013. The 2.7 mg/s is a **mission average** (305 kg over 3.6 years of thrusting). At 92 mN and 3,100 s the engine uses ≈3.0 mg/s, so "less than 2.7 mg/s" contradicts Ch.2's 92 mN. The page's own instrument also shows 4.1 days to 60 mph at full thrust and launch mass, so a careful reader sees two numbers that disagree.
   - **Ch.4 para 1, EN:** "Dawn's mission director Marc Rayman compared the push of one engine to the weight of a single sheet of paper resting on your hand. At the reduced thrust Dawn was using in 2013, he wrote, it would take more than five days to go from zero to 60 mph (97 km/h); averaged over its first 3.6 years of thrusting, Dawn used less than 2.7 milligrams of xenon a second [6]."
   - **RU:** "Директор миссии Марк Рэйман сравнивал тягу одного двигателя с весом листа бумаги на ладони. При пониженной тяге, на которой Dawn работал в 2013 году, разгон от нуля до 60 миль/ч (97 км/ч), по его словам, занял бы больше пяти дней, а в среднем за первые 3,6 года работы двигателей Dawn расходовал меньше 2,7 миллиграмма ксенона в секунду [6]."
   - **Ref [6] note:** update it to match.
4. **SHOULD: "No spacecraft has done more under its own power."** This was true when JPL said it in 2018, and the page is read in 2026 and later. Date it: EN "No spacecraft had ever done more under its own power [5]." RU "Ни один аппарат до него не сделал больше своими силами [5]."
5. **NICE: Mars flyby date.** 17 Feb 2009 is the US date; closest approach was 00:28 UTC on **18 Feb**. Either keep 17 Feb and add "(US time)", or use 18 Feb so it matches the UTC convention used for Vesta.

## 3. Science Communication & Education: approve-with-changes

Strong points:
- "This is not its speed" heads off the main ΔV misconception.
- "Going down makes the spacecraft faster" is stated plainly and correctly.
- The model limits (point mass, the Sun ignored, a schematic spiral) are disclosed where they apply.
- The chemical 320 s figure is labelled as typical rather than a Dawn value.
- Computed values are shown next to Rayman's metaphor rather than hidden.

1. The Rayman context fix (2.3) also matters here. Without it, the guide teaches two incompatible numbers for the same quantity.
2. **SHOULD: one size ratio, said two ways.** Ch.1 says "Ceres is nearly twice as wide", while the instrument says 1.8×. Use one figure: EN "Ceres is 1.8 times as wide and far less dense" / RU "Церера в 1,8 раза шире и намного менее плотная".
3. **SHOULD: the jump "fall back would take seconds".** The real time is about 12 s down and about 25 s in the air, so "seconds" undersells the point. EN "…and you would hang in the air for about 25 seconds." RU "…и провисели бы в воздухе около 25 секунд." Compute it in script and check it in checks.js (2√(2h/g): Vesta 24.8 s, Ceres 22.1 s).
4. **SHOULD: "two-thirds as dense" is ambiguous** (as dense as what?). The values are 0.65 of the Moon and 0.62 of Vesta. EN "Vesta is about as dense as the Moon; Ceres has less than two-thirds of Vesta's density." RU "Веста примерно так же плотна, как Луна, а плотность Цереры — меньше двух третей плотности Весты."
5. **NICE: the Ceres INSIDE layer.** It draws 70 km and 190 km as two nested rings, which reads as two layers. It is really one boundary whose depth is uncertain. Label it EN "shell 70–190 km thick (range of estimates)" / RU "оболочка толщиной 70–190 км (диапазон оценок)".

## 4. Linguist (Russian): approve-with-changes

The Russian is generally natural. Parity with the English is complete, and the RU decimal comma and space-grouped thousands (41 360, 13 000) are correct throughout.

1. **SHOULD, lede:** "первым в истории облетев по орбите два мира" is pleonastic and awkward. Use "…— первый в истории аппарат, вышедший на орбиты двух миров за пределами Земли."
2. **SHOULD, lede:** "получили одиннадцать с половиной километров в секунду из 425 килограммов ксенона" is a calque of "got X out of Y". Use "…набрали одиннадцать с половиной километров в секунду приращения скорости, израсходовав всего 425 килограммов ксенона."
3. **SHOULD:** "самый нежный толчок" (lede, Ch.4 eyebrow) is an unidiomatic collocation for thrust. Use "самый мягкий толчок".
4. **SHOULD:** "Руководитель полёта Марк Рейман": «руководитель полёта» means flight director in Russian usage. Rayman's title was mission director, and the established spelling is Рэйман. Use "Директор миссии Марк Рэйман".
5. **SHOULD:** the readout label "ТЯГОТЕНИЕ" heads a value in m/s². Use "УСКОРЕНИЕ СВОБ. ПАДЕНИЯ", or "g НА ПОВЕРХНОСТИ".
6. **SHOULD, Ch.8:** "а Церера — лишь на две трети" is elliptical to the point of ambiguity. See 3.4 for wording.
7. **NICE:** "ПРЫЖОК НА 0,5 м" drops the EN "EARTH". Use "ЗЕМНОЙ ПРЫЖОК 0,5 м".
8. **NICE, timeline:** "как минимум примерно до 2038 года" stacks two hedges. Use "не меньше чем до 2038 года, а с уверенностью больше 99 % — до 2068-го".

## 5. Information Design & Frontend accessibility: approve-with-changes

Reasoned from code only; no browser was used. Good:
- Native buttons and ranges, with `<label for>`.
- `aria-pressed` on toggles and `aria-live="polite"` on status lines.
- `:focus-visible` outline.
- The orbit animation is disabled under `prefers-reduced-motion`.
- The log axis is labelled "log scale", and both orbit drawings are true to scale with a scale bar.
- The spiral is labelled "schematic, 4 turns".
- `pointer:coarse` sets buttons to 44 px and enlarges the range thumbs.
- `.sim-wrap` collapses to one column at narrow widths.

1. **MUST-FIX:** the xenon chart's milestone squares versus its curves (1.1). This is an honesty problem in the chart, not only a numbers problem.
2. **SHOULD: SVG text is too small and too low in contrast.** `.svg-small` is 9.5 px `#7a7a74` on white, a contrast of 4.32:1, which is below AA 4.5:1 for small text. At 390 px the 480-unit viewBox scales by about 0.74, so the axis labels render near 7 px. This is shared CSS, so either fix it in this page's extra.css (`.svg-small{fill:#5f5f59}`, about 6.4:1) or raise it for the site.
3. **SHOULD: low-contrast core label.** On the Ceres INSIDE layer, the white "rocky core" label sits on `#8a8378` at 3.75:1. Darken the core fill to about `#5a5a55`, which matches Vesta's core at 6.9:1.
4. **SHOULD: charts block scrolling on phones.** The shared `.sim-svg{touch-action:none}` stops page scrolling when a swipe starts on these charts. None of this page's SVGs take pointer input, so add `.sim-svg{touch-action:auto;}` to extra.css. Four chart-sized dead zones at 390 px is a real scroll trap.
5. **SHOULD: English-only accessible names.** The `role="group"` aria-labels ("Milestones", "World", "Orbit", "Layer", "Scale") and all four SVG `aria-label`s stay English when the page is in Russian. Give them `data-en`/`data-ru`-driven text (for example `data-aria-en` / `data-aria-ru` set in `applyLang`), or move each label into a visible translated heading referenced by `aria-labelledby`.
6. **NICE: chatty status announcements.** `aria-live` status lines re-announce on every range `input` step. Update them on `change` instead, or debounce them.
7. **NICE: crowded labels with the Moon on.** With WITH THE MOON active, Vesta's core radius is about 7 px and "iron core" overflows it. Hide the inner labels when r < 20 px.

## 6. Ethics: approve-with-changes

Nothing on the page poses a risk of harm. NASA's phrase "first truly interplanetary spaceship" is quoted, attributed and cited [18]. No images are used, so there are no licensing questions. Sources are open and primary. The planetary-protection explanation is fair.

1. The two factual overstatements, 2.2 ("two bodies other than the Sun") and 2.4 (an undated "No spacecraft has done more"), are the ethical concern too. Each is a superlative stated more broadly than its source supports, and both are covered by the fixes above.
2. **NICE:** NOTES.md records that *Beyond Earth* and JPL disagree on the Ceres LAMO date. Record the Ceres capture-date conflict (2.1) there too, so the next editor doesn't "fix" it back.

---

## Consolidated MUST-FIX

1. **Xenon ledger milestones are inconsistent** (1.1 / 5.1). AT VESTA shows 205 kg needed against 250 kg used, and AT CERES shows 389 against 401. Switch to a fixed-m₀ model, or use m_f = M_LAUNCH − xe for milestones. Add a checks.js test that each milestone readout equals its xenon.
2. **Ceres orbit date: 7 March → 6 March 2015** (2.1), in the hero kicker, Ch.7 and the timeline, EN and RU. Cite the JPL 6 March 2015 release.
3. **"first spacecraft to orbit two bodies other than the Sun" is false** (SMART-1, Clementine and Apollo orbited Earth and then the Moon). Change it to "two destinations beyond Earth" in Ch.7 and the ref [1] note. In the Ch.9 quote, change it to "Every earlier deep-space probe … or orbited just one of them" (2.2).
4. **Rayman quotes lack their context** (2.3). "More than five days to 60 mph" was at reduced 2013 thrust, and "< 2.7 mg/s" is a mission average. Reword Ch.4 and ref [6] in EN and RU as given above.

After the fixes, rerun `./check-all.sh belt-dawn-vesta-ceres` and regenerate the page with `assemble.py`.
