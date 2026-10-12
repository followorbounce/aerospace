# REVIEW — GLOW (The cosmic microwave background: COBE, WMAP & Planck)

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Five MUST-FIX items. The core physics re-derives cleanly: the FIRAS table, the Planck-law numbers, the ΛCDM ages, the dipole and the beam transfer functions all hold. The MUST items concern two captions that the instruments contradict (the FIRAS misfit against "< 50 ppm", and COBE's view of the sky patch), one stale "farthest galaxy" label, missing prediction credit (Alpher & Herman; Doroshkevich & Novikov), and slider `aria-valuetext`.

Scripts and data: `/tmp/claude-1000/-home-none-git/4821a4ce-2654-4b7d-8122-31c1dceef901/scratchpad/review-glow/` (`phys.py`, `sky.py`, `ui.js`, and `data/` with the FIRAS table, Planck 2018 I and VI as text, the Penzias & Wilson and Dicke et al. PDFs, and both Nobel lectures).
`./check-all.sh glow-cosmic-microwave-background` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 18/18, timeline 12, 40 checks PASS).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

**Independent re-derivation** (Python/numpy/scipy; scipy `quad` at rel. tol 1e-12; FIRAS table re-downloaded from LAMBDA today):

| Quantity | Reviewer | Page |
|---|---|---|
| FIRAS: 43 points, range | 43; 68.05–639.46 GHz | 43; 68–640 GHz ✔ |
| col 2 = B(2.725 K) + col 3 | max diff 0.0076 MJy/sr | ✔ (embedded table matches the LAMBDA file) |
| x for ν_peak; ν_peak(T₀) | 2.821439; 160.229 GHz | 160.2 ✔ |
| Wien λ_peak(T₀) | 1.06322 mm | 1.063 ✔ |
| n_γ(T₀) | 410.72 cm⁻³ | 410.7 ✔ |
| Unweighted-RMS best fit; misfit | 2.725013 K; 71.6 kJy/sr | 2.72501; 72 ✔ (but see finding 1) |
| Unweighted misfit at 2.72548 K | 153.7 kJy/sr | 154 ✔ |
| **σ-weighted** best fit; weighted RMS | 2.725015 K; **19.8 kJy/sr = 51 ppm**; χ² = 45.1 / 42 dof | not shown |
| Weighted RMS at 2.72548 K; χ² | 173.7 kJy/sr (453 ppm); χ² = 3,807 | not shown |
| Ωr (N_eff 3.046, T₀); Ωm/Ωr − 1 | 9.2197e-5; 3,419 | 3,419 vs Planck 3,402 ✔ |
| Age today | 13.7952 Gyr | 13.795 (Planck 13.797; massless ν, stated) ✔ |
| Age at z* = 1089.92 | 371,207 yr | "about 370,000" ✔ |
| Same without radiation | +28.85 % | "about 30 %" ✔ |
| Age at z 14.18 / 14.44 / z_eq 3402 | 289.6 / 282.3 Myr / 50,934 yr | 290 Myr ✔ |
| T(z*) | 2,973.3 K | 2,973 / "about 2,970" ✔ |
| T₀β at 369.82 km/s; exact extremes | 3.36212 mK; +3.36419 / −3.36004 mK | ✔ |
| 1/β; dipole ÷ 30 µK | 810.6; 112.07 | 811; 112 ✔ |
| Planck 3,362.08 µK ÷ T₀ → v | 369.816 km/s | consistent with 369.82 ✔ |
| 30 µK/T₀; on Earth; on Earth–Moon | 1.1007e-5; 140.3 m; 4.23 km | ✔ |
| B_ℓ(220.1): COBE 7° / WMAP 13′ / Planck 5′ | 3.59e-29 / 0.9392 / 0.9908 | ✔ |
| ℓ½ (B = 0.5): COBE / WMAP / Planck | 22.2 / 732.7 / 1,905.8 | ✔ |
| Moon width; 7° ÷ Moon; 180°/220 ÷ Moon | 0.51793°; 13.52; 1.58 | ✔ |
| θ* = 0.010411 rad; precision | 0.59651°; 0.029 % | "0.5965°, 0.03 %" ✔ |
| λ at 4,080 MHz | 7.348 cm | 7.35 ✔ |
| Patch: pixel; lowest ℓ; Nyquist ℓ | 4.69′; ℓ_min = 36; 2,304 | "4.7′" ✔ |
| Patch expected rms: none / 5′ / 13′ / 7° | 97.5 / 95.2 / 87.6 / **4.8 µK** | page's seed: 90.8 / 88.3 / 80.0 / **2.6** |
| Patch rms over 200 random seeds | 97.6 ± 4.7 µK (5–95 %: 90–107) | the fixed seed sits at the 5th percentile, which is fine |

- **Simulated-sky normalisation is correct.** With unit white noise, `a_k = W_k·N√(C_ℓ/A)/N²` and an inverse FFT without the 1/N² factor, the pixel variance is Σ_k C_ℓ/A, which is the flat-sky ∫d²ℓ/(2π)² C_ℓ. The filter depends only on |k|, so Hermitian symmetry holds and the map is real. `dTl` hits the three WMAP anchors exactly, and its only maximum is at ℓ = 220. The illustrative extrema at ℓ 681 / 810 are labelled as interpolation.
- **Charts are honest.** The blackbody and ripple y-axes are linear from 0. The cooling chart is log–log and says so. The dipole and ripple band share one vertical scale, as stated. The sky is labelled "Not the real sky".

Findings:
1. **MUST — the instrument's misfit contradicts the "< 50 ppm" in the text.** The text (and Fixsen 1996) says the deviations are *"less than 50 parts per million of the peak"*. The instrument's best-fit misfit is 72 kJy/sr, which it calls "0.02 % of the peak". That is **187 ppm**, nearly four times larger. The cause is that `misfit()` is an *unweighted* RMS, although the 1σ errors range from 14 to 282 kJy/sr. Two points dominate it: the 640 GHz point (−432 ± 282) and the 626 GHz point (−116 ± 155). Without those two the RMS is 22 kJy/sr. Weighted by 1/σ², as FIRAS did, it is 19–20 kJy/sr, about 50 ppm. Preferred fix: make `misfit()` error-weighted, `√(Σ(d/σ)² / Σ(1/σ²))`, using column 4. The numbers then become 19.8 kJy/sr (0.005 %) at 2.725 K and 174 kJy/sr (0.045 %) at 2.72548 K. The status thresholds (`1.5·mb`, `500`) still work. Update checks.js accordingly (≈ 20 and ≈ 174), and add a check that `misfit(FIT_T)/383.67 MJy/sr < 55 ppm`. New note text, EN: "“Misfit” is the root-mean-square difference between the curve and the 43 points, each weighted by its error bar as FIRAS did. … the misfit is smallest there — about 20 kJy/sr, 50 parts per million of the peak; at the combined 2.72548 K it is 174 kJy/sr, still under 0.05 %." RU: «„Расхождение“ — среднеквадратичная разница между кривой и 43 точками, где каждая точка взвешена по своей погрешности, как это делала команда FIRAS. … расхождение минимально именно там — около 20 кЯн/ср, 50 миллионных долей от максимума; при сводных 2,72548 K оно составляет 174 кЯн/ср — всё ещё меньше 0,05 %.» The first status string ("0.02 %" / «0,02 %») must change to "0.005 % (50 ppm)" / «0,005 % (50 миллионных долей)». Minimal alternative: keep the unweighted RMS, but add EN "(unweighted, so the two noisiest points above 620 GHz dominate it; weighted by the error bars it is about 20 kJy/sr — the < 50 ppm FIRAS quotes)" / RU «(без весов, поэтому его определяют две самые шумные точки выше 620 ГГц; с учётом погрешностей оно около 20 кЯн/ср — те самые < 50 миллионных долей, о которых пишет FIRAS)».
2. **SHOULD — "the points no longer sit on the curve" appears long before they visibly leave it.** The "Off by" branch fires at misfit ≥ 500 kJy/sr, which is ΔT ≈ 2 mK. At 2.7268 K the status says the points have left the curve, but the largest gap is 0.5 MJy/sr ≈ 0.2 px. A gap of 2–4 px is not reached until about 10–20 mK. The statistics are right: χ² is already huge at 2 mK. The visual claim is not. Fix EN: "Off by N mK — by eye the curve still passes close, but the misfit is now M times FIRAS's typical error bar: the data reject it. Only one temperature fits all 43 at once." RU: «Отклонение N мК — на глаз кривая ещё проходит рядом, но расхождение уже в M раз больше типичной погрешности FIRAS: данные её отвергают. Все 43 точки сразу описывает только одна температура.» Use M = misfit ÷ 20 kJy/sr, or switch the wording at about 15 mK.
3. **SHOULD — the "FIRAS's own calibration" status cites [6].** The status ends *"…puts the best fit at 2.7250 K [6]"*. Ref [6] (Fixsen 1996) gives **2.728 ± 0.004 K**. The 2.725 K scale of the LAMBDA table comes from Fixsen & Mather 2002 (the file header's "Reference2"). Cite [5] instead, and add "Fixsen & Mather 2002 (ApJ 581, 817)" to the note of ref [5].
4. **NICE — the dipole's ripple band is sub-pixel.** ±30 µK on a ±10 mK axis is 0.7 px tall (≈ 0.5 px at 390 px), drawn at opacity 0.35, so it is effectively invisible. The at-rest status still says *"— the thin band"*. That is honest to scale, but tell the reader: EN "— a band thinner than a pixel on this scale, which is the point" / RU «— полоса тоньше пикселя в этом масштабе, в этом и суть».
5. **NICE — the checks.js label is out of date:** *"simulated sky rms matches its spectrum within 15 %"*, while NOTES says "within 7 %". The real gap is −6.9 %, inside the seed scatter shown above. Either is fine; make them agree.

## 2. Research / fact-check — APPROVE WITH CHANGES

Opened and confirmed (✔ unless noted):
- Penzias & Wilson 1965 (ADS PDF): 20-foot horn-reflector at Crawford Hill, Holmdel; 4080 Mc/s; "about 3.5° K higher than expected"; the quote "isotropic, unpolarized, and free from seasonal variations (July, 1964–April, 1965)" ✔. The body omits the paper's own ±1.0 K, which is acceptable because the eq-note mentions "a large error bar".
- Dicke, Peebles, Roll & Wilkinson 1965, ApJ 142, 414: companion letter, same volume ✔. It credits Gamow, Alpher and Herman (see §6).
- Nobel 1978: "the other half jointly to Arno Allan Penzias and Robert Woodrow Wilson 'for their discovery of cosmic microwave background radiation'" ✔. Nobel 2006 citation ✔.
- LAMBDA DMR: six radiometers, 31.5/53/90 GHz, 60°, 7° FWHM ✔. The DMR page does **not** give the launch date that ref [4]'s note attributes to it (NICE: delete it there; [18] covers it).
- LAMBDA FIRAS file: columns and values ✔ (Reference2 = Fixsen & Mather 2002, see §1.3).
- Fixsen 1996 abstract: < 50 ppm, 2.728 ± 0.004 K, dipole 3.372 ± 0.007 mK ✔. Fixsen 2009: 2.72548 ± 0.00057; FIRAS-on-WMAP 2.7260 ± 0.0013 ✔.
- Wright 1994 PDF: "resolution of ≈ 10°, is 30 µK" ✔.
- Planck 2018 I (PDF): launch 14 May 2009, scanning 12 Aug 2009 – 23 Oct 2013, nine bands 30–857 GHz, "over a billion map pixels", 18 peaks, θ* to 0.03 %, dipole 3,362.08 ± 0.99 µK at (264.021°, 48.253°), Sun–CMB 369.82 ± 0.11 km/s ✔.
- Planck 2018 VI (PDF): Table 2, column TT,TE,EE+lowE+lensing — H₀ 67.36 ± 0.54, Ωm 0.3153 ± 0.0073, age 13.797 ± 0.023, z* 1089.92 ± 0.25, r* 144.43 ± 0.26, z_eq 3402 ± 26 ✔. The abstract gives 100θ* = 1.0411 ± 0.0003, Ωch² 0.120, Ωbh² 0.0224, H₀ 67.4 ± 0.5, Ωm 0.315, ΩK = 0.001 ± 0.002 with BAO, and "in significant, 3.6 σ, tension with local measurements of the Hubble constant (which prefer a higher value)" ✔. Note: the quote is in the full abstract (PDF/A&A), **not** in arXiv's abridged web abstract. That is fine, but the ref note should say "abstract (full version)".
- WMAP (NASA): launched 30 June 2001; "ended the collection of science data on August 19th 2010"; "0.2 degree" map ✔. LAMBDA: 13′ FWHM, "33 times the angular resolution of the COBE DMR" ✔. Page et al. 2003: all three peak/trough values ✔.
- NSSDC Moon sheet: 1,737.4 / 6,371.0 km, 0.3844 × 10⁶ km ✔. NASA COBE page: launch Nov. 18, 1989 ✔.

Findings:
1. **MUST — "FARTHEST GALAXY z 14.18" is out of date and contradicts the hub's own James Webb guide.** That guide (james-webb-space-telescope.html) says: "In 2025 MoM-z14 took the record at z = 14.44, about 280 million years [after the Big Bang]" (Naidu et al. 2025, arXiv:2505.11263, z_spec = 14.44 ± 0.02, confirmed today). Fix the button label: EN "JADES-GS-z14-0 z 14.18" / RU «JADES-GS-z14-0 z 14,18». Alternatively, "EARLY GALAXY z 14.18" / «РАННЯЯ ГАЛАКТИКА z 14,18». The note under the instrument already names the galaxy correctly. If the record holder is preferred instead, use z = 14.44 → 282 Myr (reviewer's integral), cite the Webb guide's source, and update the check.
2. **SHOULD — Planck's beams: "down to about 5 arcminutes (4.90′ at 217 GHz)" is not the smallest.** Planck 2018 I, Table (effective beam FWHM): 32.29, 27.94, 13.08, 9.66, 7.22, **4.90**, 4.92, **4.67, 4.22**′. The 545/857 GHz beams are sharper. Fix EN: "with beams of about **5 arcminutes** in its main CMB channels (4.90′ at 217 GHz; down to 4.2′ in the 857 GHz dust channel)". RU: «с лучами около **5 угловых минут** в основных каналах для реликтового излучения (4,90′ на 217 ГГц; до 4,2′ в канале пыли 857 ГГц)». Correct ref [10]'s note to "32.29′ (30 GHz) to 4.22′ (857 GHz); 4.90′ at 217 GHz".
3. **SHOULD — "scanned the sky from 12 August 2009 to 23 October 2013 in nine bands"** implies nine bands throughout. Planck 2018 I's own timeline has "14 Jan 2012 … End of cryogenic mission, start of warm phase": HFI (six bands) stopped then, and only LFI continued to October 2013. Fix EN: "scanned the sky from 12 August 2009 — in all nine bands from 30 to 857 GHz until January 2012, and in its three lowest until 23 October 2013 —". RU: «сканировал небо с 12 августа 2009 года — во всех девяти диапазонах от 30 до 857 ГГц до января 2012 года, а в трёх нижних — до 23 октября 2013 года, —». Make the 2013 timeline entry match.
4. **SHOULD — ref [17] (ESA "Planck" page) does not support its note.** The fetched page is a story listing. Neither "third-generation" nor the launch facts appear on it. Either cite an ESA page that states them, or drop [17] from "[10][17]" (Planck 2018 I covers everything) and reword the note to "ESA's Planck mission page".
5. **NICE** — "Neither side has found an error that explains the gap" is uncited editorial. Safer EN: "Planck's data alone cannot say which side is off; the question is still open." RU: «Одни данные „Планка“ не позволяют сказать, какая из сторон ошибается; вопрос остаётся открытым.»
6. **NICE** — "about 370,000 years" is the guide's own integral, and that is disclosed. Many sources say "380,000 years". One clause would stop readers thinking one of them is wrong: EN "(often rounded to 380,000; the exact figure depends on the model and on how 'last scattering' is defined)" / RU «(часто округляют до 380 000 — точная цифра зависит от модели и от того, что считать моментом последнего рассеяния)».

## 3. Science Communication & Education — APPROVE WITH CHANGES

This is a strong guide. It uses one temperature to tell the whole story, the "how do we know" thread runs through it, the simulated sky is labelled "Not the real sky" with a precise account of what is anchored and what is illustrative, the age integral's neutrino simplification is disclosed, and the H₀ tension is told in Planck's own words.

1. **MUST — the COBE view of the sky patch contradicts its caption.** On COBE, the status reads *"COBE sees the ripples exist but blurs them into broad, faint swells"*. Through COBE's 7° beam the 10° × 10° patch has an rms of **2.6 µK** on a ±250 µK colour scale, so the picture is a blank white square (readout: "rms 3 µK"). The patch cannot contain the swells COBE actually detected: its largest mode is ℓ = 36 (10°), while COBE's 30 µK signal sits at ℓ ≲ 20. A reader will conclude that COBE saw nothing. Fix the status, EN: "COBE's 7° beam smooths this whole 10° patch almost flat (rms ≈ 3 µK). The ~30 µK ripples COBE did detect are swells 10° across and larger — bigger than this patch. At ℓ = 220 nothing survives." RU: «Луч COBE шириной 7° почти полностью выглаживает этот участок 10° (СКО ≈ 3 мкК). Рябь около 30 мкК, которую COBE действительно обнаружил, — это волны размером 10° и больше, крупнее всего участка. На ℓ = 220 не остаётся ничего.» Add to the note, EN: "A 10° patch holds only scales smaller than itself (ℓ ≳ 36); the low-ℓ plateau on the chart is not in the picture." RU: «Участок 10° содержит только масштабы меньше себя (ℓ ≳ 36); плато при малых ℓ на графике в картинку не попадает.»
2. **SHOULD — the hero overstates isotropy.** *"the same in every direction to one part in a hundred thousand"* — the dipole is one part in 811, which chapter 4 itself says. Fix EN: "the same in every direction to one part in a thousand — and, once our own motion is taken out, to one part in a hundred thousand." RU: «одинаковое во всех направлениях с точностью до одной тысячной, а если вычесть наше собственное движение, — до одной стотысячной.»
3. **SHOULD — θ* ≈ 0.6° next to "ℓ = 220 means spots about 0.8° wide".** A careful reader will see two different sizes for "the first peak". Add after "θ* ≈ 0.5965°": EN "(the first peak itself appears at a slightly larger angle, ℓ ≈ 220 or about 0.8°, because of how the waves were caught mid-oscillation)". RU: «(сам первый пик виден под чуть большим углом — ℓ ≈ 220, около 0,8°, — потому что волны „застали“ в середине колебания)». A simpler version: "θ* is the yardstick; the first peak sits at a slightly larger angle, about 0.8°".
4. **SHOULD — ℓ is used before it is defined.** Chapter 5's first paragraph says "multipole ℓ = 220.1", but "180°/ℓ" is explained only in the second. Move the clause: EN "…at multipole **ℓ = 220.1 ± 0.8** — a multipole ℓ means features roughly 180°/ℓ across, so about 0.8° [14]." RU: «…на мультиполе **ℓ = 220,1 ± 0,8** — мультиполь ℓ соответствует деталям размером примерно 180°/ℓ, то есть около 0,8° [14].» Then trim the repeat in paragraph 2.
5. **NICE** — "the seeds of every galaxy" for 10° spots. The 10° spots are far larger than any galaxy. Prefer EN "the seeds of all cosmic structure" / RU «зародыши всей крупномасштабной структуры».
6. **NICE** — "Only a universe that was once hot and dense — opaque — produces one" → EN "Only a universe that was once hot, dense and opaque throughout produces such a perfect, uniform one" / RU «Такой идеальный и одинаковый во всех направлениях спектр даёт только Вселенная, которая когда-то вся была горячей, плотной и непрозрачной».
7. **NICE** — link "the James Webb guide" (it does explain Wien's law: "2,898 microns divided by its temperature") to `/aerospace/james-webb-space-telescope.html` in both places.

## 4. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is natural and the terminology is correct: реликтовое излучение, абсолютно чёрное тело, поверхность последнего рассеяния, мультиполь, акустический пик, сопутствующие координаты, МЯн/ср, «Планк» in guillemets, ЕКА. Decimal commas are used throughout.

1. **SHOULD — the kelvin symbol mixes alphabets.** The RU strings use Latin **K** after numbers (14 in body, 10 in script, e.g. «3,5 K», «2,72548 K», «2970 K») but Cyrillic in «мК»/«мкК» (25). The Russian unit symbol is **К**. Use «К» in every data-ru string and in `T(' K',' К')` in the readouts. Fix «ШКАЛА FIRAS 2,725 K» → «… 2,725 К», etc.
2. **SHOULD — mixed tenses.** «Пока Вселенная была горячее примерно 3000 K, водород оставался ионизованным, и свободные электроны **рассеивают** свет так часто, что Вселенная **непрозрачна**… Когда электроны и протоны **объединяются** в атомы, свет **летит** свободно» → «…свободные электроны **рассеивали** свет так часто, что Вселенная **была непрозрачной**, как внутренность облака. Когда электроны и протоны **объединились** в атомы, свет **полетел** свободно…». The EN has the same mix: "scatter… is opaque" → "scattered… was opaque"; "combine… flies free" → "combined… flew free".
3. **SHOULD — a grammatical clash in the quote.** «этот избыток… был „изотропным, неполяризованным и не зависел от сезона“» joins adjectives with a finite verb. Use «был „изотропным, неполяризованным и свободным от сезонных колебаний“». In ref [1]'s note use the same wording: «„изотропный, неполяризованный и свободный от сезонных колебаний (июль 1964 — апрель 1965)“».
4. **SHOULD — the hero sentence.** «она остыла примерно до 3000 K настолько, что свет смог свободно распространяться» → «она остыла примерно до 3000 К — достаточно, чтобы свет смог свободно распространяться».
5. **SHOULD — a calque.** «с фиксированным зерном» → «с фиксированным начальным значением генератора случайных чисел».
6. **SHOULD — an awkward note.** «Пиксель — 4,7′, поэтому 5′ луча «Планка» здесь близки к пределу разрешения картинки» → «Пиксель — 4,7′, поэтому луч „Планка“ шириной 5′ здесь близок к пределу разрешения картинки».
7. **SHOULD — the readout calque «1 часть из 811»** → «1/811». EN can stay "1 part in 811".
8. **SHOULD — the two Russian renderings of the 2006 Nobel citation differ.** The body has «за открытие спектра абсолютно чёрного тела и анизотропии», ref [8] has «за открытие формы спектра абсолютно чёрного тела и анизотропии…». Use the ref's wording (it renders "form") in both.
9. **SHOULD — digit grouping is inconsistent.** The body writes «3000», «2970», «4080», «3402», but `fmtInt` prints «2 973 K». Follow the same rule as BURST: four-digit numbers without a space and five or more with a space (both «370 000» and «12 742» are already correct), and make `fmtInt` skip the space for 1000–9999 in RU.
10. **NICE** — «Мимо на N мК» is colloquial; use «Отклонение N мК» (see §1.2). «ВСЕ ДАННЫЕ 2,72548 K» → «ВСЕ ИЗМЕРЕНИЯ 2,72548 К» (EN could be "ALL MEASUREMENTS"). On first use, «луч» could be glossed as «луч (диаграмма направленности)».

## 5. Information Design & Frontend accessibility — APPROVE WITH CHANGES

Reasoned from the code plus a jsdom probe (no browser was launched). The following are fine:
- All three SVGs and the canvas have `role="img"` with EN/RU aria-labels that are re-set on render.
- Button groups have **translated** `data-aria-ru` labels (RU confirmed: «Готовые значения температуры / Моменты / … / Луч»), and use `aria-pressed`.
- Statuses are `aria-live="polite"`.
- Sliders have `<label for>`.
- `.btn` and range inputs are ≥ 44 px, and focus-visible outlines are set.
- SVG text grows to 14 px under 520 px (≈ 10 px effective at 390 px).
- The colour bar and legend are `aria-hidden` (the rms is also in the readout).
- There is no animation.
- The diverging blue–white–red map differs in luminance as well as hue.
- The initial states are consistent: `cvZ` is set exactly to z*, and the presets match the sliders on load.

1. **MUST — no `aria-valuetext` on any slider.** `cvZ` stores log₁₀(1 + z), so a screen reader announces "3.038" rather than "z = 1,090". `bbT` and `dpV` announce bare numbers without units. Fix: at the end of each render, `el.setAttribute('aria-valuetext', <the *Val textContent>)` for `bbT` (`bbTVal`), `cvZ` (`cvZVal`, e.g. "z = 1,090, 371,000 years" would be better still) and `dpV` (`dpVVal`). Add a checks.js assertion that `cvZ` has aria-valuetext containing "z =".
2. **SHOULD — the ripple-strength chart has no x-axis title.** It shows only "ℓ = 2 … 1000" ticks on a log axis. Add `txt(svg, R, Bt + 30, T('multipole ℓ (log scale; ≈ 180°/ℓ)','мультиполь ℓ (лог. шкала; ≈ 180°/ℓ)'), 'svg-small', 'end')` and move the legend up, or put the title on the left.
3. **NICE** — the canvas aria-label could carry the current beam and rms (e.g. "…through Planck's 5′ beam; rms 88 µK"). The live status partly covers this.
4. **NICE** — the dipole chart could say "(band ±30 µK, to scale)" next to the curve, since the band is not visible (§1.4).

## 6. Ethics — APPROVE WITH CHANGES

The guide gives Penzias & Wilson and the Dicke group fair, accurate billing (the companion letter, the same issue). It names Mather and Smoot, and frames the H₀ tension neutrally with no hype. The weak point is the history of the *prediction*, which matters especially for a bilingual EN/RU audience.

1. **MUST — the people who predicted the radiation are missing.** The page implies the idea began with the Princeton group ("building a receiver to look for exactly this"). Two earlier contributions are not mentioned. Alpher & Herman (following Gamow) predicted a present temperature of a few kelvin in the late 1940s; Dicke et al. 1965 themselves cite Gamow, Alpher and Herman. Doroshkevich & Novikov (1964) identified the radiation as a detectable microwave blackbody and named the Bell Labs 20-foot horn at Crawford Hill as the best instrument for finding it. Both are documented in Penzias's own Nobel lecture, opened and verified. Add after the Dicke sentence, EN: "The idea was older. In the late 1940s Ralph Alpher and Robert Herman, building on George Gamow's work, estimated that the Big Bang's leftover radiation should now be a few kelvin; and in 1964 the Soviet cosmologists Andrei Doroshkevich and Igor Novikov pointed out that it should show up as microwaves — naming the Bell Labs horn at Crawford Hill as the best instrument to find it [19]." RU: «Сама идея была старше. В конце 1940-х годов Ральф Алфер и Роберт Херман, развивая работы Георгия Гамова, оценили, что остаточное излучение Большого взрыва сегодня должно иметь температуру в несколько кельвинов, а в 1964 году советские космологи Андрей Дорошкевич и Игорь Новиков указали, что его можно обнаружить в микроволновом диапазоне, — и назвали лучшим инструментом для этого рупорную антенну Bell Labs в Кроуфорд-Хилле [19].» New ref [19]: A. A. Penzias (1978), "The Origin of Elements", Nobel Lecture — https://www.nobelprize.org/uploads/2018/06/penzias-lecture.pdf. Note EN: "Alpher and Herman (1949) traced the relict radiation to 'a temperature of a few degrees Kelvin'; Doroshkevich and Novikov (1964) 'explicitly focus upon the Bell Laboratories twenty-foot horn reflector at Crawford Hill'." RU accordingly. Timeline entries: "1948–49 — Alpher and Herman predict a relic glow of a few kelvin [19]" and "1964 — Doroshkevich and Novikov point to microwaves and the Crawford Hill horn [19]".
2. **SHOULD — RELIKT-1 is missing from a history that runs COBE → WMAP → Planck.** It was a Soviet space experiment that measured the dipole before COBE. LAMBDA (opened): "Prognoz 9, launched on 1 July 1983 … Relikt-1 experiment … at 37 GHz … The galactic microwave flux was measured and the CMB dipole observed. A quadrupole moment was found between 17 and 95 microkelvin rms, with 90% confidence level" (Strukov et al. 1992). Suggested addition to chapter 4, EN: "Before COBE, the Soviet RELIKT-1 experiment on the Prognoz 9 satellite (launched 1 July 1983) mapped the sky at 37 GHz and measured the dipole; a 1992 analysis of its data reported a large-scale anisotropy of 17–95 µK at 90 % confidence [20]." RU: «Ещё до COBE советский эксперимент «Реликт-1» на спутнике «Прогноз-9» (запущен 1 июля 1983 года) картографировал небо на 37 ГГц и измерил диполь; анализ его данных 1992 года сообщил о крупномасштабной анизотропии 17–95 мкК при доверительной вероятности 90 % [20].» New ref [20]: NASA LAMBDA, "The Relikt Experiment" — https://lambda.gsfc.nasa.gov/product/relikt/. Do **not** call it "the first detection": that claim is contested and no opened source makes it. Optional timeline entry for 1983.
3. **SHOULD — "two engineers" (hero lede and the chapter 7 quote).** Penzias and Wilson were physicists working as radio astronomers at Bell Labs (they won the Nobel Prize in *Physics*). The phrase repeats a common myth. Fix EN: "two radio astronomers" / RU «два радиоастронома», in the lede; quote: "that two radio astronomers once suspected was a fault in their antenna" / «которое два радиоастронома когда-то принимали за неисправность своей антенны».
4. **NICE** — "Penzias and Wilson shared the 1978 Nobel Prize" → "shared half of the 1978 Nobel Prize in Physics (the other half went to Pyotr Kapitsa)" / «разделили половину Нобелевской премии по физике 1978 года (другая половина — Петру Капице)» (the Nobel page lists both).
5. **NICE** — WMAP is named after David Wilkinson of the 1965 Dicke group (NASA [12]: "renamed WMAP after team member David T. Wilkinson"). One clause in chapter 5 would close the loop with chapter 1. Optionally, "the spectral distortions Sunyaev and Zeldovich predicted" in the FIRAS paragraph, with a source, since Fixsen 1996 gives the |y| and |μ| limits that test them.

---

## Consolidated MUST-FIX

1. **FIRAS misfit contradicts "< 50 ppm"** (instrument shows 0.02 % ≈ 190 ppm from an unweighted RMS). Weight the RMS by the FIRAS errors (→ 20 kJy/sr ≈ 50 ppm) or explain the difference; update the note, status and checks, EN + RU (§1.1).
2. **COBE sky-patch caption contradicts the picture** (2.6 µK rms = blank square). Reword the status and add the "patch holds only ℓ ≳ 36" note, EN + RU (§3.1).
3. **"FARTHEST GALAXY z 14.18" is outdated** and contradicts the hub's Webb guide (MoM-z14, z = 14.44). Relabel the button "JADES-GS-z14-0 z 14.18", EN + RU (§2.1).
4. **The prediction is uncredited.** Add Alpher & Herman (late 1940s) and Doroshkevich & Novikov (1964, who named the Crawford Hill horn), citing Penzias's Nobel lecture as [19], EN + RU, plus timeline entries (§6.1).
5. **`aria-valuetext`** on `bbT`, `cvZ` (log-scaled) and `dpV`, mirroring the displayed values, plus a check (§5.1).

Strongly recommended (SHOULD): the hero's isotropy caveat (§3.2); "two engineers" → radio astronomers (§6.3); RELIKT-1 (§6.2); Planck beams 4.22′ and the HFI end date (§2.2–2.3); the θ*-vs-0.8° clause and defining ℓ before first use (§3.3–3.4); the "Off by" visual claim (§1.2); the [6]→[5] citation (§1.3); ref [17]; the ripple-chart x-axis title; and Russian §4.1–4.9, especially Cyrillic «К» and the tense fixes.
