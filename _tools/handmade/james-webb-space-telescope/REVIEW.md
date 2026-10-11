# Cross-disciplinary review: UNFOLD, James Webb Space Telescope (Track B upgrade)

**Date:** 2026-10-10
**Page:** `james-webb-space-telescope.html` (working tree against HEAD)
**Panel:** Physics & Mathematics · Research / fact-check · Science Communication & Education · Linguist · Information Design & Frontend accessibility · Ethics
**Overall verdict: BLOCK until the six MUST-FIX items are done, then approve.** One lens (Information Design & Frontend) blocks. The blocking problems are specific and quick to fix. The other five lenses approve with changes.

The science upgrade is strong:
- I re-derived every computed number independently and all of them agree.
- 16 claims were checked against primary sources, and all but the items listed below hold.
- The corrections the authors made (318 °C, 344 single-point failures, TRAPPIST-1, the unsourced quasar claim, 3I/ATLAS) are right.

The problems are:
- The new instruments are missing their CSS.
- One status message is wrong over a range of z.
- One redshift has been superseded.
- One citation does not support the claims attached to it.

`./check-all.sh james-webb-space-telescope` reports ALL OK (32/32 PASS, 32 refs, 0 missing RU). The checks run in jsdom, so they cannot see CSS. That is why MUST-FIX 1 got through.

---

## 1. Physics & Mathematics: approve-with-changes

Scripts are in `scratchpad/review-jwst/phys.py`. Everything is recomputed independently, and the cosmology integral uses scipy `quad`, not the page's Simpson rule.

**Agreement table:**

| Quantity | Page / checks | Independent |
|---|---|---|
| Wien peak, Sun 5772 K | 0.502 µm | 0.50204 µm (matches a brute-force Planck maximum) |
| Wien peak, 310 K / 300 K / 40 K / 6.4 K | 9.35 / 9.66 / 72.4 / 453 µm | same |
| Lyα, Hα (vacuum, reduced-mass R_H) | 121.568, 656.47 nm | 121.5684, 656.4696 nm |
| Lyα at z = 14.44 | 1.877 µm | 1.8770 µm |
| z where Lyα leaves WFC3 / Hα leaves NIRSpec | 12.98 / 7.07 | 12.984 / 7.073 |
| Ωr·h² (photons + 3.046 ν) | 4.18e-5 | 4.180e-5 |
| Age today (Planck 2018 TT,TE,EE+lowE+lensing) | 13.795 Gyr | 13.795 Gyr (published 13.797) |
| Age at z = 14.44 / 14.32 / 10 | 282 / 286 / 470 Myr | 282.3 / 285.6 / 470.2 Myr; z = 10 is 3.41 % of today |
| 1.22 λ/D: Webb at 2 µm, Hubble at 0.5 µm | 0.0774″, 0.0524″ | same |
| Area ratio 25.44 / π·1.2² | 5.62× | 5.62× |
| 85 − (−233); 383 K; 36 K | 318 °C; 110 °C; −237 °C | 318; 109.85; −237.15 |

checks.js tests the claims the text actually makes. It does not test the low-z status branch (finding 1.1) and it pins the superseded z = 14.32 (finding 2.1).

**Findings:**

1. **MUST-FIX: the status message is wrong for 0 < z < 0.645.** Lyα (0.1216 µm × (1+z)) only reaches WFC3's 0.2 µm edge at z = 0.645. Below that, `sees(ly)` is false for Hubble and NIRSpec alike, so `drawIR` drops into the last `else`. That branch tells the reader Lyα is *"beyond NIRSpec, so only MIRI's longer wavelengths could reach it"* (RU *"дальше NIRSpec — достать его могли бы только длинные волны MIRI"*). It is the opposite: the line is still in the far ultraviolet, short of every band drawn. The slider reaches these values (step 0.01). **Fix:**
   - Add a branch before the MIRI one: `else if(ly < K.HUBBLE_MIN)`.
   - Its EN text: "Lyman-alpha arrives at X: still far ultraviolet, bluer than WFC3 and Webb can see; it needs Hubble's ultraviolet spectrographs."
   - Its RU text: "Лайман-альфа приходит на X: это ещё дальний ультрафиолет, короче диапазонов WFC3 и «Уэбба»; его видят только ультрафиолетовые спектрографы «Хаббла»."
   - Keep the MIRI text for `ly > K.NIRSPEC_MAX`. That branch is unreachable while z ≤ 20, which is fine.
   - Add a check: `setZ(0.3)` → the status text does not contain "MIRI".
2. **MUST-FIX (with Research 2.1): JADES-GS-z14-0's redshift.** Change it to 14.18 in the preset, the text and the check. At z = 14.18 the model gives 290 Myr, so it now matches the "about 290 million years" in the text exactly. Before, the model gave 286.
3. **MUST-FIX: CH2 contradicts itself within one sentence.** *"Behind the shield the telescope runs below 50 K: in flight the primary-mirror segments settled at 35–55 K"*. 55 K is not below 50 K. Rigby §2 gives 35–55 K. **Fix:**
   - EN: "Behind the shield the telescope runs at roughly 40 K: in flight the primary-mirror segments settled at 35–55 K, warmest nearest the shield [2]."
   - RU: "За экраном телескоп работает при температуре около 40 К: в полёте сегменты главного зеркала остыли до 35–55 К, теплее всего — ближайшие к экрану [2]."
4. **SHOULD: the wavefront error range is narrower than the source.** CH3 says *"about 65–70 nanometres"*, and ref [2]'s note repeats it. Rigby §4.1: telescope WFE is "generally in the range 60–80 nanometers rms". Change to "about 60–80 nanometres" / "около 60–80 нанометров" in both places.
5. **SHOULD: the collecting-area comparison is not like-for-like.**
   - Rigby §4 calls 25.44 m² the *unobscured* telescope area, so it is net of obstruction.
   - Hubble's 4.52 m² is the gross disc. Hubble's ~0.3 m secondary and its baffle obscure about 11 %, which leaves roughly 4.0 m², or about 6.3×.
   - The note discloses this honestly, but the headline "more than five and a half times" is biased low.
   - **Fix:** say "about 5.6 times the bare 2.4-metre disc, or about 6 times once Hubble's central obstruction is subtracted". Alternatively, compute both in the readout.

## 2. Research / fact-check: approve-with-changes

**Verified against primary sources (fetched or downloaded on 2026-10-10):**

| Claim | Source checked | Result |
|---|---|---|
| Roman "launched 30 Aug 2026" on Falcon Heavy toward L2 [31] | NASA Roman Launch page | ✔ 30 Aug 2026, 7:26 a.m. EDT, LC-39A, Falcon Heavy, toward L2 |
| Propellant "more than 20 years", requirement 10.5 years [2] | Rigby et al. 2023 full text, §2 | ✔ verbatim |
| 25.44 m² measured [2] | Rigby §4 | ✔ ("unobscured telescope area… measured… 25.44 m²", requirement > 25 m²) |
| 35–55 K segments, 35–39 K near-IR instruments, MIRI 6.4 K, commissioning ended 12 Jul 2022, diffraction-limited at 1.1 µm [2] | Rigby | ✔ |
| Sunshield fully deployed on 4 Jan 2022 [7] | NASA blog | ✔ (fifth layer tensioned at about 11:59 a.m. EST) |
| Mirror wings 7 (port) and 8 (starboard) Jan 2022 [8] | ESA weic2201 | ✔; "all deployments were declared complete" |
| L2 burn on 24 Jan, 297 s, 1.6 m/s [9] | NASA blog | ✔ |
| Fact-sheet numbers [3] | NASA fact sheet | ✔ 0.6–28.5 µm; 20.1 kg segments; 100 nm and 48.25 g gold; 21.197 × 14.162 m; 85 / −233 °C; 383 K / 36 K; 12:20 UTC |
| Orbit page [1] | NASA | ✔ ~6-month orbit "similar in size to the Moon's orbit"; L2 metastable; Hubble in and out of shadow every 90 min; DSN in Australia, Spain and California |
| 344 single-point failures [5] | NPR, Bill Ochs | ✔ "a majority… retired through that first two weeks or so of deployments" |
| TRAPPIST-1 c, 380 ± 31 K [24] | Zieba et al. 2023 | ✔ (per the ref) |
| K2-18 b, CH₄ + CO₂ with DMS "less robust" [25]; re-analysis [26] | NASA; arXiv 2508.05961 | ✔; Stevenson et al. find "no statistically significant evidence", now accepted to AJ |
| 3I/ATLAS CO₂/H₂O = 7.6 ± 0.3, "among the highest ever observed in a comet" [27] | arXiv 2508.18209 abstract | ✔ verbatim |
| UHZ1 [28] | Chandra release | ✔ 3 % of the present age (470 Myr), 10–100 M Suns, "similar to that of all the stars in the galaxy", "about a tenth of a percent" nearby, heavy-seed / direct-collapse reading |
| MoM-z14 z = 14.44, 280 Myr [21] | arXiv; search | ✔; no higher spectroscopic record found as of today. The paper is now published in the Open Journal of Astrophysics (2026), so update ref [21]. |
| Carniani [22], "apparent tension with many standard models" | Nature abstract | ✔ verbatim. That phrase refers to the z > 10 population generally. The abstract itself says "300 million years after the Big Bang". |
| WASP-96 b [14] | NASA release | ✔ "less than half that of Jupiter", ~1,150 ly, "every 3½ Earth-days", NIRISS, water, clouds, haze |
| Southern Ring [13] | NASA release | ✔ ~2,500 ly; second star "into full view"; "cloaked in dust" |
| Ref URLs | spot-checked [4][5][6][22][18][19][30][32] | all 200 |

**Findings:**

1. **MUST-FIX: JADES-GS-z14-0's redshift has been superseded.**
   - The page says *"In 2024 JADES-GS-z14-0 was confirmed at redshift 14.32"*. That is the NIRSpec-prism Lyman-break value, z = 14.32 (+0.08/−0.20).
   - In March 2025, ALMA detected [O III] 88 µm and pinned the redshift at **z = 14.1796 ± 0.0007**. The papers are Carniani et al. 2025, A&A (doi 10.1051/0004-6361/202452451), and Schouws et al. 2025, ApJ; the release is ESO eso2507.
   - The record story still holds, because MoM-z14 at 14.44 is higher.
   - **Fix:**
     - EN: "In 2024 JADES-GS-z14-0 was confirmed at redshift 14.32, refined in 2025 by ALMA's detection of oxygen to 14.18, about 290 million years after the Big Bang [22][new]".
     - RU: "В 2024 году галактику JADES-GS-z14-0 подтвердили на красном смещении 14,32, а в 2025 году обнаружение кислорода телескопом ALMA уточнило его до 14,18 — примерно 290 миллионов лет после Большого взрыва [22][new]".
     - Set the preset to 14.18, update the check to 14.18 → 290 ± 10 Myr, and add the A&A reference.
2. **MUST-FIX: ref [6] does not support what is cited to it.** The NASA blog of 26 Dec 2021 says only that the gimbaled antenna assembly with "Webb's high-data-rate dish antenna" was released and tested on 26 Dec. It does **not** mention:
   - "60-centimetre" or "Ka-band", cited in the CH4 bus card, stage 02 and the ref note;
   - "About 30 minutes after launch the solar array unfolded", cited in stage 02.

   **Fix:** cite a source that states these facts. Options are NASA's launch-day release or blog post "Webb's solar array deployed" for the array, and the STScI JWST User Documentation / NASA observatory page for the 0.6 m Ka-band dish. If you can't find one, drop the specifics. Correct the note on ref [6] as well.
3. **SHOULD: TRAPPIST-1 b's "so far bare" is overstated.** Ducrot et al. 2025, *Nature Astronomy* 9, 358, combined the 12.8 and 15 µm eclipses. They found the data fit either a bare, unweathered ultramafic surface *or* a thick, hazy CO₂ atmosphere with a temperature inversion. **Fix:**
   - Title EN: "TRAPPIST-1: rocky worlds, atmospheres still undecided".
   - Title RU: "TRAPPIST-1: каменистые миры, атмосферы пока под вопросом".
   - Add after [23]: "a later analysis with a second filter found that a thick, hazy carbon-dioxide atmosphere could fit too [new]" / "более поздний анализ во втором фильтре показал, что подходит и плотная дымчатая атмосфера из углекислого газа [new]".
4. **SHOULD: K2-18 b leaves out the 2025 claim the re-analyses respond to.** In April 2025, Madhusudhan et al. reported DMS/DMDS at about 3σ in MIRI data. That stronger claim is what [26] and the other re-analyses (Luque et al. 2025, Welbanks et al. 2025) address. Add one clause: "A 2025 MIRI study by the original team reported a stronger signal, but independent re-analyses… [26]". Citing a second independent re-analysis would also support the plural "re-analyses".
5. **NICE:**
   - Ref [7] does not mention the 28 December pallet lowering. Cite the 28/29 Dec NASA blog posts, or drop the date.
   - Ref [26] is now accepted to AJ, so "preprint" can be updated.

## 3. Science Communication & Education: approve-with-changes

The new instruments teach a real idea that transfers: why infrared, and why aperture is not the same as sharpness. The voice matches the page. Simplifications keep their scope. Examples are "consistent with", "apparent tension", and "less robust… no robust evidence".

There are no regressions in accuracy. The old text was weaker on every point the authors replaced.

**Findings:**

1. **SHOULD: the CH8 heading overstates (pre-existing).** *"The early universe looks nothing like predicted"* / *"Ранняя Вселенная выглядит совсем не так, как предсказывали"*. The cited source says "apparent tension with many standard models", and the body now says the same. The heading should match:
   - EN: "The early universe grew up faster than expected"
   - RU: "Ранняя Вселенная повзрослела быстрее, чем ожидали"
2. **SHOULD: the UHZ1 card title is imprecise.** *"A black hole as heavy as its galaxy"* is inaccurate: the black hole matches its galaxy's *stars*, as the body itself says. Change to "A black hole as heavy as its galaxy's stars" / "Чёрная дыра массой со все звёзды своей галактики".
3. **SHOULD: the IR chart doesn't say its curve is normalised.** The curve is drawn normalised to its own peak, but neither the chart nor the note says so. A learner who compares the 6.4 K curve with the Sun's will read them as equally bright. Add to the note: "The glow curve is drawn scaled to its own peak: it shows shape, not brightness." / "Кривая свечения нормирована на собственный пик: она показывает форму, а не яркость."
4. **NICE: the SMACS 0723 card lost two details.** The old card had the release date (12 July 2022) and "thousands of galaxies", both supported by [10]. Restore the date.
5. **NICE: CH9's lede says less than its own card.** It describes Hubble's *"ultraviolet-through-visible view"*, but the card under it (and [18]) includes near-IR to 1.7 µm. Change to "ultraviolet, visible and near-infrared view".

## 4. Linguist (Russian): approve-with-changes

The Russian is fluent and has full parity with the English, and the terminology is good. Examples are "ошибка волнового фронта", "единичные точки отказа", "разгрузка маховиков", "гало-орбита" and "дифракционно ограничен". Decimal commas and the ± spacing are right throughout, and the checks confirm `1,88 мкм`.

**Findings:**

1. **SHOULD:** *"семи землеподобных планет"*. «Землеподобные» implies habitability; the English says "Earth-sized". Change to «семи планет размером с Землю».
2. **SHOULD:** *"находятся в видимом противоречии"* is a calque of "apparent tension" and reads as "visibly contradict". Change to «Столь яркие галактики в столь раннюю эпоху плохо согласуются со многими стандартными моделями того, как быстро формировались первые галактики [22]».
3. **SHOULD:** *"с z = 14,44, примерно 280 миллионов лет после него"* is missing the preposition. Change to «с z = 14,44 — примерно через 280 миллионов лет после него».
4. **SHOULD:** the title *"Чёрная дыра тяжёлая, как её галактика"* reads as a predicate. See 3.2: «Чёрная дыра массой со все звёзды своей галактики».
5. **SHOULD: stage 05 differs between the languages.** EN says "put Webb **on course for** its halo orbit"; RU says «**вывело** «Уэбб» на гало-орбиту». Change RU to «направило «Уэбб» на гало-орбиту вокруг L2».
6. **SHOULD:** the CH1 title *"Стоянка в миллионе миль от Земли"* uses miles. Russian readers think in km, and the body uses km. Change to «Стоянка в полутора миллионах километров от Земли».
7. **NICE:** *"согласуется с голой скалой"* → «согласуется с голой каменной поверхностью».
8. **NICE: the RU thousands separator is inconsistent.**
   - `fmtInt` inserts a plain space into 4-digit numbers, so the readouts show "5 772 К", while the static text has «5772 К».
   - Russian typographic convention leaves 4-digit numbers unseparated.
   - A plain space can also break the line.
   - Use U+00A0 (or U+202F), and only for numbers with 5 or more digits.
9. **NICE:**
   - «ТОЧКА L2 СИСТЕМЫ СОЛНЦЕ-ЗЕМЛЯ» → «СОЛНЦЕ — ЗЕМЛЯ», to match CH1.
   - «Готовые температуры» → «Предустановки температуры», and likewise for the other preset groups.

## 5. Information Design & Frontend accessibility: BLOCK (reason below)

I ran `check-all.sh`: ALL OK. The rest of this section is reasoned from the code; no browser was launched.

**Findings:**

1. **MUST-FIX (block reason): both new instruments ship without their CSS.**
   - The page's `<style>` and `assets/site.css` define none of `.btn` (base), `.readout-grid`, `.readout-cell`, `.readout-cell .rl` or `.readout-cell.wide`.
   - The comment at line 42 says "shared look with the generated guides", but the generated guides define these rules inline.
   - As a result:
     - Every preset button renders as a browser-default grey button (`.btn.active` still turns it black).
     - The six plus five readouts collapse into unstyled lines where the label runs straight into the value, e.g. "GLOW PEAK502 nm" / "ПИК СВЕЧЕНИЯ502 нм".
   - jsdom can't see this, so the checks pass.
   - **Fix:** copy these lines from `comet-rosetta-philae.html` (lines 43 and 48–51):
     ```css
     .btn{font-family:var(--font-mono); font-size:11px; letter-spacing:0.03em; border:1px solid var(--line); background:var(--paper); color:var(--ink); padding:8px 11px; line-height:1.2; cursor:pointer;}
     .readout-grid{display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--line); border:1px solid var(--line); margin-top:16px;}
     .readout-cell{background:var(--white); padding:10px 12px; font-family:var(--font-mono); font-size:13px; min-width:0;}
     .readout-cell .rl{color:#5f5f59; display:block; font-size:9.5px; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;}
     .readout-cell.wide{grid-column:1/-1;}
     ```
     `.rl` uses #5f5f59 here, not `var(--mid)`; see finding 5.2. Then add a check that runs `getComputedStyle`, or at least asserts the selector exists in `document.styleSheets`.
2. **MUST-FIX: new small text fails WCAG AA contrast.** `.ctl-head` (10.5 px, on the white sim panel) and `.inst-kicker` (11 px, on paper) use `--mid` #7a7a74. That gives 4.32:1 on white and 3.99:1 on #f6f6f2, below 4.5:1. Use #5f5f59, which gives 6.43:1 / 5.93:1 and is already used for `.note`.
3. **SHOULD: the deployment stepper isn't announced or exposed to assistive tech.**
   - `#deployCaption` has no `aria-live`, so screen-reader users hear nothing when they choose a stage.
   - The stage buttons expose their selection only through the `.active` class.
   - **Fix:** add `aria-live="polite"` to `#deployCaption`, and set `aria-pressed` in `showStage` the way `pressGroup` does.
4. **SHOULD: expandable cards lose their heading semantics.** `<div class="exp-head" role="button">` wraps an `<h4>`, and children of a button are presentational, so the five discovery and five first-light headings vanish from the headings list. Use `<h4><button type="button" aria-expanded=…>…</button></h4>`, or move `role=button` onto an inner span.
5. **SHOULD: SVG text is too small at 390 px.**
   - At 390 px, `.sim-wrap` is one column. The SVG is about 390 − 2×16 − panel border ≈ 356 px wide against a 480-unit viewBox, a scale of 0.74.
   - So `.svg-small` (10) renders at about 7.4 px and `.svg-label` (11) at about 8.1 px. The tick labels, "NIRSpec", the scale bar and "cannot observe here" become illegible.
   - **Fix:** raise them to 13 and 14 units, or add `@media (max-width:480px){.svg-small{font-size:13px}.svg-label{font-size:14px}}`.
6. **SHOULD: the resolution figure has unexplained parts.**
   - The filled inner disc is drawn at r × 0.42, which is half the FWHM over the Rayleigh radius, but nothing says so. Add to the note: "pale disc: Rayleigh limit; dark core: half the brightness width (FWHM)" / "светлый круг — предел Рэлея; тёмное ядро — ширина на половине яркости".
   - At λ < 0.6 µm, where Webb cannot observe, "WEBB DIFFRACTION-LIMITED?" still answers "not quite". Show "—" instead.
   - "HUBBLE AS SHARP AT" can show 185 nm, below WFC3's range, with no caveat.
7. **Honesty of axes:** the IR log axis is labelled "(log scale)" and the bands are drawn to the true log positions. The resolution discs share one scale and have a round-number scale bar. That is honest, apart from 3.3 and 2.1.5.
8. **What was verified to work:**
   - Keyboard: hotspots handle Enter/Space; chips are `<button aria-pressed>`; cards are `tabindex=0` with `aria-expanded` and Enter/Space.
   - `aria-valuetext` on all sliders; aria-labels that switch language.
   - `prefers-reduced-motion` is handled site-wide in site.css (transitions go to 0.001 ms).
   - 44 px minimum on `.btn`, `.stage-btn` and `.module-chip`, and the slider hit area.
   - The SVG hotspots are smaller than 44 px at 390 px (about 75 × 17), but the chip buttons are an equivalent control (WCAG 2.5.8 exception).
9. **NICE (pre-existing):**
   - The `#langtoggle` buttons are about 32 px tall and have no `aria-pressed`.
   - The eyebrows read "CH.01–09 / 10" but "CH.10 / 11". Make it "CH.10 / 10".

## 6. Ethics: approve-with-changes

**Findings:**

1. **SHOULD: biosignature framing.** The K2-18 b card is now responsible, a big improvement on "a fierce debate". Two refinements:
   - *"dimethyl sulfide, which on Earth is made only by life"* is true but invites the inference "so detection means life". DMS has since been reported without life, on comet 67P and in interstellar gas.
     - EN: "which on Earth is made almost only by life, though it has since been found on a comet, where no life is involved".
     - RU: «которого на Земле почти всегда производят живые организмы, хотя его нашли и на комете, где жизни нет».
     - Cite Hänni et al. 2024 (Rosetta/ROSINA). Verify this citation before use; I could not fetch it in this session.
   - Retitle the card "A claimed biosignature that has not held up so far" / "Заявленный биомаркер, который пока не подтвердился". Once re-analyses find no robust evidence, "a hint of a biosignature" puts the claim before the evidence.
2. **Attribution is good.**
   - Images are credited to NASA/ESA/CSA releases.
   - The DMS caveat is quoted from NASA.
   - The UHZ1 result is credited to both Chandra and Webb, the heavy-seed reading is kept as an interpretation ("may have started"), and the peer-reviewed paper is cited alongside the release.
   - The removal of the unsourced quasar claim is correct.
3. No harm to people. The 3I/ATLAS and early-galaxy text avoid the "breaks cosmology" and "alien" hype common in coverage.

---

## Consolidated MUST-FIX list

1. **Missing CSS.** Add the `.btn`, `.readout-grid`, `.readout-cell`, `.rl` and `.wide` rules (copy from `comet-rosetta-philae.html` 43, 48–51). Today the presets render as browser-default buttons and the readouts run together ("GLOW PEAK502 nm"). (§5.1)
2. **Contrast.** `.ctl-head` and `.inst-kicker` use #7a7a74 (3.99–4.32:1); change them to #5f5f59. (§5.2)
3. **Wrong IR status for 0 < z < 0.645.** It says Lyα is "beyond NIRSpec… only MIRI" when it is really far-UV. Add the far-UV branch (EN and RU wording in §1.1) and a check.
4. **JADES-GS-z14-0 redshift.** Refine 14.32 → 14.18 (ALMA [O III], Carniani et al. 2025 A&A; Schouws et al. 2025). Update the text EN/RU, the preset, checks.js and add the reference. (§2.1)
5. **Citation [6].** It does not support "60-centimetre Ka-band dish" or "solar array about 30 minutes after launch". Cite a source that does, or drop those details, and fix the ref note. (§2.2)
6. **CH2 note contradiction.** "runs below 50 K: … 35–55 K" → "runs at roughly 40 K: … 35–55 K" (EN and RU in §1.3).

SHOULD items, by priority:
- WFE 60–80 nm (§1.4)
- like-for-like area ratio (§1.5)
- TRAPPIST-1 b, Ducrot 2025 (§2.3)
- K2-18 b, 2025 claim and the DMS caveat (§2.4, §6.1)
- CH8 heading (§3.1)
- normalised-curve note (§3.3)
- RU items 4.1–4.6
- deploy caption aria-live and aria-pressed (§5.3)
- card heading semantics (§5.4)
- SVG text at 390 px (§5.5)
- resolution figure legend (§5.6)
