# REVIEW — ESCAPE (Where Mars's air went: MAVEN & atmospheric loss)

**Date:** 2026-11-12 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There were three MUST items, and all are applied:
- a physics sign error in the Jeans model note (EN only);
- an out-of-date Mars Express status;
- an overclaim ("many powers of ten") in the Jeans eq-note.

Every computed number was re-derived independently (own Python, constants from NSSDC). The cited sources for the dated claims were re-opened today.
`./check-all.sh escape-maven-mars-atmosphere` → **ALL OK**: errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 33/33, timeline 13, unstyled [], 73 checks PASS (70 + 3 new).

---

## 1. Physicist / planetary scientist — APPROVE WITH CHANGES

| Quantity | Reviewer | Page |
|---|---|---|
| H = kT/mg, Mars 214 K, 43.49 u, 3.73 | 10.97 km | 11.0 ✔ |
| v_esc at 200 km (Mars) / 500 km (Earth, R 6,371) | 4.885 / 10.771 km/s | ✔ |
| λ_H Mars 240 K; λ_O | 6.03; 95.7 | ✔ |
| Jeans flux, 1e5 cm⁻³, 240 K; global | 9.49e7 cm⁻² s⁻¹; 1.54e26 s⁻¹ | ✔ (inside MAVEN's 1e26–1e27) |
| O escape energy, Mars 200 km / Earth 500 km | 1.98 / 9.62 eV | ✔ |
| DR per-atom 3.50/2.51/1.53 eV → escaping share | 20.4 + 44.0 = 64.4 % | ✔ |
| Radius at which the 3.50 eV channel is blocked (ρ = 3,934) | 4,478 km | 4,474 ✔ (preset 4,500 km = all blocked) |
| MAVEN a, apoapsis (T 4.5 h, R_eq 3,396.2) | 6,578.6 km; 6,215 km | ✔ |
| λ = GMm/kTr = (v_esc/v₀)² = r/H | identity holds | ✔ |

Findings:
1. **MUST — the Jeans model note says "Above λ ≈ 1.5 the formula no longer applies".** It is the other way round. Jeans escape fails at *small* λ, where the gas is barely bound and flows away hydrodynamically (Hunten 1973 [7]; Öpik's blow-off). The instrument's own status line (`l < 1.5`) and the RU text («при λ меньше примерно 1,5») were already right, so EN and RU disagreed. *Fixed:* "Below λ ≈ 1.5 …". A check was added that the note says "Below" and that the status threshold matches.
2. **SHOULD (not applied) — exobase 200 km is a model choice** (Chaffin 2015 [8]), not a measured altitude. The text says "where MAVEN's hydrogen models put it", which is fair. Leave it.
3. **NIT — "a third of Earth's pull"**: 3.73/9.82 = 0.38. ESA's wording [21] is quoted, so it can stay.
4. **NIT — "the only way to remove argon" is sputtering.** That is the MAVEN team's wording [18]; argon ions can also be picked up, but the team's argon analysis treats sputtering as the remover. It is cited, so it can stay.

## 2. Mathematician (models, units, numerics, the checks) — APPROVE WITH CHANGES

Re-derived:
- Rayleigh argon: R/R₀ = 5.5/4.2 = 1.3095, f = 0.34 → x = 0.750 → Δz/H₄₀ = 20 ln(1/0.75) = 5.75 (page 5.76 ✔).
- D/H: with x = 0, f = 1/8 → 87.5 % lost. It is correctly called "at least", since any D escape (x > 0) needs more loss for the same enrichment ✔.
- Jeans D/H efficiency at 240 K: (1/√2)·(13.06/7.03)·e^−6.03 = 0.0032 ✔.
- Storm: 1.5e24 × 32 u = 79.7 g/s ✔. At ×20 for 20 h the extra loss is 19 × 20/24 = 15.8 quiet days and 109 t ✔. At ×7 it is 5 days ✔.
- 4 Gyr loss: 2.5 kg/s × 4 Gyr = 3.16e17 kg = 12.8 atmospheres = 81.5 mbar ✔.
- Power law: β = ln6/ln(4.6/1.1) = 1.2524 ✔. 2.67× at 2.5 Gyr ago, 12.8× at 4 Gyr ago ✔.
- Integrated (analytic, mine): ∝EUV gives ×3.06 → 250 mbar ✔; ∝EUV² gives ×15.6 → 1,273 mbar ✔.

Findings:
1. **MUST — eq-note overclaim: "doubling the mass of the atom or halving the temperature changes the flux by many powers of ten".** For Mars's hydrogen at 240 K (λ = 6) either change cuts the flux by 315×, which is 2.5 orders of magnitude, not "many". *Fixed:* "cuts the flux by a factor of about 300 for Mars's hydrogen, and by far more for heavier gases" (EN + RU). A check was added (315 / 315).
2. **NIT — the 4 Gyr power law is fitted to one Ribas point.** The model note says so, and it reports the 2.7 vs 2.5 mismatch at the second point. The paper body is reported to give its own τ^−1.23 fit, but only the abstract was opened, so this is not added. The page is honest as it stands.
3. The checks test published values (NSSDC, MAVEN, Atreya, Villanueva, Ribas) and not just the code against itself. The erfc check uses tabulated values. The design is good.

## 3. Historian / fact-checker — APPROVE WITH CHANGES

Opened today (2026-11-12):
- **science.nasa.gov/mission/maven** — "heard last on Dec. 6", end "Declared June 3, 2026", "not recoverable", "12 years, 6 months, 16 days" ✔.
- **collectSPACE 3 Jun 2026** — the telemetry fragment showed it "rotating at a higher than normal rate". The board's preliminary finding was that the rotation drained the batteries and cut power to communications, and the cause of the spin is "still being sought". The page also has "final report expected later this year", "more than 800 publications" and "more than 11 years" ✔. The page's cause wording ("preliminary finding … drained its batteries and cut power to the radio"; "no published final root cause" as of November 2026) is accurate. A web search today found no final report.
- **Jakosky ESLAB slides [18]** — re-downloaded. The figures 1.3 kg O/s, ~130 g O/s, ~80 g O/s, "~2–3 kg/s", "3-20x enhancement" (10 Sep 2017), "66 ± 4.5 %" and "Argon can be removed only by sputtering" are all present. The slides cite 2018 papers, and the file sits in the 52nd ESLAB Symposium folder on ESA Cosmos (ESTEC, 14–18 May 2018; Jakosky was co-convenor, https://www.cosmos.esa.int/web/52nd-eslab-symposium). The same headline numbers are in the peer-reviewed Jakosky et al. 2018 Icarus abstract [5], which is always cited alongside, so the slides are an acceptable supporting source. *Applied (SHOULD):* the ref title now reads "52nd ESLAB Symposium, ESA/ESTEC, 14–18 May 2018 (slides; the day of the talk is not printed)", and ref [9] is labelled the same way.
- **Jakosky et al. 2018 Icarus abstract** (via commons.emich.edu/fac_sch2018/120) — "∼2–3 kg/s", "as much as 0.8 bar CO₂ or 23 m GEL", "likely to be lower limits", no reservoirs ✔.
- **Ribas et al. 2005 abstract** — "about 2.5 times … 2.5 Gyr ago and about 6 times … about 3.5 Gyr ago" ✔.
- **Names** — Herbert Gunell is first author of A&A 614, L3 (BIRA-IASB) ✔. Stas (Stanislav) Barabash of IRF Kiruna is named "Stas Barabash" in IRF's own release and is co-author of Ramstad et al. 2017 (R. Ramstad, S. Barabash, Y. Futaana, H. Nilsson, M. Holmström) ✔.

Findings:
1. **MUST — the Mars Express status is out of date.** The page said "as of ESA's latest decision we found, its operations run to the end of 2026 with an indicative extension to 2028 [32]". On 10–11 June 2026 ESA's Science Programme Committee "endorsed extensions for all 13" missions ending their current phase before the end of 2026, Mars Express among them. The release gives no new end dates (https://www.esa.int/Science_Exploration/Space_Science/ESA_science_missions_get_green_light_for_new_discoveries, 11 June 2026; also IRF 15 June 2026). *Fixed:* "ESA had confirmed its operations to the end of 2026 with an indicative extension to 2028 [32], and in June 2026 its Science Programme Committee endorsed a further extension; as of November 2026 we found no published new end date [33]" (EN + RU), plus the new ref [33] and a check.
2. **SHOULD — timeline 2018 said "at least 0.8 bar"**, while the body (correctly, following [5]) says "as much as 0.8 bar … lower limits". *Applied:* "as much as 0.8 bar of CO₂ over history, probably a lower limit" (EN + RU).
3. **NIT (not applied) — "Mariner 6, 7 and 9 … the first sign of gas leaving the planet today".** This is an editorial simplification of [9]'s list of earlier corona observations, already logged in NOTES. Those Lyman-α data were indeed used to derive escape, so it can stay.
4. **NIT (not applied) — Hope and Tianwen-1 arrival dates and current status** are not stated. The author was right not to state them without a primary source.

## 4. Science communicator + Educator — APPROVE

- Every instrument has a "Model:" note that says what is assumed and what is not modelled.
  - The **argon preset** is explicitly "the separation … at which this simple model reproduces MAVEN's 66 %", which makes clear it is back-calculated, and the note says MAVEN's real analysis included outgassing and impacts.
  - The **storm baseline** is "the pre-storm model value of [26]", the chart axis says "(model)", and the readout says "QUIET ION ESCAPE (MODEL)".
  - The **4-Gyr power law** is "Model: …", it states the fit and its mismatch, and the status line says "A model, not a measurement".
- "Why Mars?" is answered honestly (gravity first, the magnetic field nuanced, with Gunell [14]). This corrects a popular misconception rather than repeating it.
- SHOULD (not applied): the chapter 5 title "A day of storm, two weeks of leak" matches the ×20 preset (15.8 quiet days). The measured March 2015 case (×7) gives about 5 days. The text makes the model status clear, so the title can stay as a hook.

## 5. Designer + Accessibility — APPROVE

- Every SVG has role="img" and an aria-label in EN and RU (data-aria-en/ru). All 11 sliders have `<label for>` and live `aria-valuetext` (there is a check for this). Status lines are aria-live="polite". Preset groups are role="group" with bilingual labels.
- extra.css has the 44 px .btn and range target rule, focus-visible outlines, a coarse-pointer thumb size, and larger SVG text at ≤ 520 px. The SVGs use a viewBox and scale, so there is no horizontal page scroll at 390 px. At 1,300 px the layout follows the shared grid.
- There is no animation loop (no requestAnimationFrame or CSS transitions), so there is nothing for reduced motion to switch off.
- NIT: the Jeans chart's "escape speed of the gas, Φ/n" means the effusion velocity, and it is labelled with Φ/n, so it is not confused with escape velocity. Fine.

## 6. Russian editor — APPROVE WITH CHANGES

The Russian reads as natural technical Russian. Terminology is consistent: экзобаза, гомопауза, высота однородной атмосферы, джинсовское убегание, распыление, захват ионов, рэлеевская дистилляция. EN/RU parity holds (missingRu 0). Changes applied (SHOULD):
1. «Херберт Гунелл» → **«Герберт Гунелл»**, the usual Russian rendering of Herbert.
2. «команда считает, что в начале бури могли быть главным каналом» read as "at the start of the storm". Now «что в ранние эпохи именно бури могли быть главным каналом ухода ионов».
3. «ползунок числа бурь в год — для того, чтобы представить …, а не измеренная величина» was ungrammatical. Now «ползунок … нужен, чтобы представить молодое, бурное Солнце, и это не измеренная величина».
4. NIT (not applied): «Руководил ею с замысла в 2003 году» could be «с момента зарождения замысла»; the current wording is acceptable.

## 7. Ethicist — APPROVE

- Credit is fair and international: ESA/Sweden (ASPERA-3, Ramstad, Barabash), UAE (Hope), China (Tianwen-1 MOMAG), Austria (Gröller, Lammer), and Belgium/Sweden (Gunell). Women scientists are credited by name: Shannon Curry as PI, Anna Mittelholz, Catherine Johnson.
- MAVEN's loss is told plainly. The page gives the preliminary finding, does not invent a root cause, and uses "as of" wording.
- Models are not passed off as measurements. Nothing here can harm anyone.

---

## Consolidated MUST (all applied)
1. Jeans note "Above λ ≈ 1.5" → "Below λ ≈ 1.5" (EN; RU was already right). Check added.
2. Mars Express: added the June 2026 SPC endorsement of a further extension, with no published end date; new ref [33]. Check added; NOTES Freshness updated.
3. "many powers of ten" → "a factor of about 300 for Mars's hydrogen" (EN + RU). Check added (315×).

## Open SHOULD / NIT
- Chapter 5 title follows the ×20 preset rather than the measured ×7 case (kept as a hook; the text labels the model).
- Ribas's own τ^−1.23 fit (paper body, not opened) could replace the one-point β = 1.25.
- Hope/Tianwen-1 arrival dates and current status are not stated (no primary source opened).
- Russian NIT on «с замысла».
