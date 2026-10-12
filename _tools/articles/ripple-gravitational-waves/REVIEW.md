# REVIEW — RIPPLE (Gravitational waves: LIGO, Virgo, KAGRA & LISA)

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There are six MUST-FIX items. Four are reachable UI states that show wrong or contradictory text, one is a stale headline claim, and one is accessibility. When re-derived independently, every published number reproduces. The physics is sound.

Scripts: `/tmp/claude-1000/-home-none-git/06c72027-ac75-419c-ade6-f25cd6b4035c/scratchpad/review-ripple/` (`phys.py`, `tau.py` for the physics; `probe.js`, `init.js`, `ps.js` exercise the UI in jsdom; `dl/` holds the downloaded PRL, the GWOSC factsheet and the GW170817 PDFs).
`./check-all.sh ripple-gravitational-waves` → **ALL OK** (errors 0, offStep [], missingRu 0, cites 19/19, timeline 13, 35/35 checks).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

**Independent re-derivation** (Python and scipy, written separately from `script.js`). The chirp time and cycle counts come from numerically integrating ḟ = (96/5)π^(8/3)(G𝓜/c³)^(5/3) f^(11/3) in ln f, not from the closed form.

| Quantity | Reviewer | Page |
|---|---|---|
| T☉ = GM☉/c³ | 4.92549 µs | 4.9255 |
| h = 1e-21, L = 4 km: per-arm displacement | 0.0020 fm; proton 2r_p / that = 840.75 | ±0.002 fm, 1/841 |
| λ(1064 nm) / per-arm displacement | 5.32e11 | "532 billion" |
| LISA light time, 2.5e9 m | 8.339 s | 8.34 s, "over 8 s" |
| τ to coalescence, 𝓜 = 30, from 35 Hz | 0.1704 s | 0.170 ("0.2 s") |
| Cycles 35 → 150 Hz, 𝓜 = 30 | 8.70 | 8.70 ("about 8"; PRL: "about 8") |
| Cycles from 30 Hz to coalescence | 12.3 | GWOSC "~10" (leading order runs high; fine) |
| ISCO f for M = 2^(6/5)·30 = 68.92 | 63.8 Hz; time 35 Hz → ISCO 0.136 s, 6.0 cycles | readout 64 Hz, 0.14 s, 6 cycles (see 1.2) |
| GW170817 τ(24 Hz), 𝓜 = 1.1977 | 99.95 s | "~100 s" |
| GW170817 cycles 24 Hz → ISCO (1598 Hz) | 3,834 | readout 3,834; ref [10] note "~3000" (see 1.4) |
| Separation, 70 M☉ at 75 Hz orbital | 347 km | "≃350 km" |
| Source-frame 𝓜 from 36 + 29 | 28.1 M☉ (× 1.09 ≈ 30.6 detector) | 𝓜 ≈ 30 detector-frame ✔ |
| 3.0 M☉c² | 5.361e47 J | 5.4e47 |
| 200 M☉c²/s | 3.574e49 W | 3.6e49 (PRL 3.6e56 erg/s ✔) |
| 3.6e49 / L☉ | 9.40e22 | "≈ 9 × 10²² Suns", "about 10²³" |
| E / (L☉ · 10 Gyr) | 4,438 | "≈ 4,400" |
| Peters–Mathews Ṗb (B1913+16) | −2.40210e-12 (−0.022 % vs W&H −2.40263e-12); f(e) = 11.8568 | −2.40209e-12, 11.86 |
| a (Kepler), da/dt | 1.949e6 km, −3.53 m/yr | 1.95e6 km, 3.5 m/yr |
| Periastron shift after 30 yr | −38.6 s | −38.6 s |
| f_ISCO for 1, 2.74, 65, 1e6, 1e9 M☉ | 4397 Hz, 1605 Hz, 67.6 Hz, 4.40 mHz, 4.40 µHz | same |
| 1/(15 yr) | 2.11 nHz | 2.11 |
| 26 Mpc / c; 1.74 s / that; (1.74 − 10) s / that | 84.8 Myr; 6.50e-16; −3.09e-15 | 85 Myr; 6.5e-16; published +7e-16 / −3e-15 ✔ |
| 40 Mpc, 410 Mpc in light-years | 130 Mly, 1.34 Gly | "130-million-year trip", "about 1.3 billion" |

- The formulas are correct. These were checked: the chirp mass from (f, ḟ); t_c − t at leading order; f_ISCO = c³/(6^(3/2)πGM) as a GW frequency; the Peters–Mathews Ṗb with the f(e) enhancement; the cumulative periastron shift ½(Ṗb/Pb)t²; and da/dt = (2/3)a·Ṗb/Pb. The sign convention of the speed-of-gravity bound is also right: the upper edge assumes simultaneous emission, and the lower edge allows a 10 s delay.
- **Statistician note:** the significances are quoted, not recomputed. They are: SNR 24, FAR < 1/203,000 yr, > 5.1σ, W&H 0.9983 ± 0.0016, and NANOGrav 3.5–4σ. Each matches its source, and each is attributed. The page labels the inspiral model "leading order" and the masses "detector-frame". Both labels are honest.

Findings:
1. **MUST — the pulsar instrument's initial state contradicts itself.** The HTML has `value="0.617"`, but B1913+16 has e = 0.6171340. On load, jsdom shows **PREDICTED Ṗb −2.3992 × 10⁻¹²** with *"general relativity predicts −2.399 × 10⁻¹² s/s"*, while the body says 2.40263. Next to that, the "MEASURED ÷ PREDICTED" cell reads **0.9983**, yet −2.398 / −2.3992 = 0.9995. The exact value appears only after the user clicks the already-pressed preset. Fix: in script.js, set `psE.value = B1913.e` before the first render (the exact-value wrapper keeps it). Add a check that the initial `psReadout` contains "2.4021".
2. **MUST — the GW150914 chirp readout contradicts the text beside it.** Default state: *"From 35 Hz the pair has **0.14 s** and about **6 cycles** left before the last stable orbit"*. The paragraph above says "Over 0.2 s it rose in about 8 cycles from 35 to 150 Hz". Both numbers are correct under their own definitions: the model stops at the equal-mass ISCO, 64 Hz, while the real signal ran past 150 Hz. A reader still sees two different numbers. Fix (either one):
   - (a) Add a readout row "TIME TO COALESCENCE (LEADING ORDER)" / «ВРЕМЯ ДО СЛИЯНИЯ (ГЛАВНЫЙ ПОРЯДОК)" = `tauOf(Mc, f0)` (0.17 s).
   - (b) For the GW150914 preset, append to the status: "The real signal kept rising past 150 Hz through the merger; to coalescence the formula gives 0.17 s, the 'fifth of a second'." RU: «Настоящий сигнал продолжал расти выше 150 Гц до слияния; до коалесценции формула даёт 0,17 с — ту самую „пятую долю секунды“».
3. **NICE — the 0.9983 ratio is not reproducible from the printed numbers.** 2.398 / 2.40263 = 0.9981. W&H used unrounded values. checks.js divides by the page's own Ṗb (−2.40209), which lands on 0.9983 by coincidence. Either add "(from unrounded values)" to the eq text, or change the check to divide by `B.gr` with a tolerance of 0.0016.
4. **NICE — GW170817 cycle count.** The readout gives 3,834 cycles (24 Hz → ISCO, leading order). Ref [10] says "∼3000 cycles". Either add "(leading order; the paper quotes ~3000)" to the preset note, or drop the WAVE CYCLES row for GW170817.
5. **NICE — frame mixing.** The chirp instrument uses detector-frame M = 68.9 M☉, giving ISCO 64 Hz, which the HUD shows. The bands instrument uses source-frame 65 M☉, giving 68 Hz. One clause in the band note would reconcile them: "65 M☉ in the source's frame; at the detector the redshift makes it ≈ 69".

## 2. Research / fact-check — APPROVE WITH CHANGES

Checked against primary or official sources. All items are confirmed unless noted.
- **PRL 116 061102** (I extracted the PDF text myself). Confirmed: 1916 linearised equations; quadrupole moment; Chapel Hill 1957 ("significant debate about the physical reality"); Weber in the 1960s; interferometers "first suggested in the early 1960s [25] and the 1970s [26]"; TAMA 300 / GEO 600 / LIGO / Virgo "joint observations from 2002 through 2011, setting upper limits"; 20 W → 700 W → 100 kW; "isolation from ground motion for frequencies above 10 Hz"; "limited by photon shot noise at frequencies above 150 Hz"; "most sensitive band, 100–300 Hz"; 10 ms intersite; 6.9 ms; 35 → 250 Hz; 8 cycles 35 → 150 Hz; ≳ 70 M☉; ≃ 350 km; SNR 24; 3.0 ± 0.5 M☉c²; 3.6e56 erg/s = 200 M☉c²/s; 410 Mpc.
- **GWOSC factsheet:** ±0.002 fm; ~200 ms; ~10 cycles from 30 Hz; ~0.6c ✔.
- **GW170817 PRL** (PDF): 12:41:04 UTC; "∼100 s (calculated starting from 24 Hz)"; "∼3000 cycles"; 𝓜_det = 1.1977; 2.74 M☉; 40 Mpc; SNR 32.4 ✔.
- **ApJL 848 L13:** 1.74 ± 0.05 s; −3e-15 ≤ Δv/c ≤ +7e-16 at 26 Mpc ✔.
- **Weisberg & Huang 2016** abstract: "9257 measurements … over the last thirty-five years"; 0.9983 ± 0.0016 ✔.
- **ESA LISA, 25 Jan 2024:** adopted; launch 2035 on Ariane 6; 2.5 million km; NASA to provide "ultra-stable lasers, the 30 cm telescopes … and the sources of UV light" ✔. **ESA Cosmos:** "from about 0.1 mHz to 0.1 Hz" ✔.
- **ICRR (ref 18):** O4 25 May 2023 00:00 JST → 19 Nov 01:00 JST; "approximately 300 significant gravitational-wave signals"; O5 "planned to start in 2028" ✔. The UTC conversion to 24 May / 18 Nov is correct.
- **observing.docs.ligo.org/plan, fetched today:** "Last updated Sep 03, 2026"; IR1, a six-month run, "early- to mid-November of 2026"; both LIGOs; Virgo "with possible interruptions"; KAGRA "later in the run"; O5 "being refined". The page's status paragraph is **accurate as of 2026-10-11**. Note that the plan page says its **next update is due 15 October 2026**, so re-check it on the day of push.
- Nobel 2017 motivation and the split (½ Weiss, ½ Barish + Thorne) ✔. Nobel 1993, Arecibo 300 m, 1974 ✔. Weber PRL 22, 1320 (1969) ✔. NANOGrav 15-yr: 67 pulsars, HD at ~3.5–4σ (frequentist), A = 2.4e-15 ✔.

Findings:
1. **MUST — "The most powerful event ever measured" is stale.** The CH4 heading (EN and RU) says this in the present tense. GW190521 (2020) radiated ≈ 8 M☉c², against GW150914's 3.0. GW231123 (2025) was heavier still, and its peak luminosity was at least comparable. Fix EN: "In 2015, the most powerful event ever measured — and nothing to see". RU: «В 2015 году — самое мощное из измеренных событий, и ничего не видно». A safer alternative is "Three suns turned into ripples, and nothing to see" / «Три Солнца, ушедшие в рябь, — и ничего не видно».
2. **SHOULD — LISA's NASA partnership is no longer certain.** The paragraph is labelled "Status, October 2026" and says *"…a launch planned in 2035, with NASA as a partner [6]"*. Since then:
   - the US FY2026 request proposed zeroing NASA's LISA work, and Congress restored it (≈ $80.5 M);
   - the FY2027 request again proposes cutting most of it;
   - ESA has begun "risk mitigation actions", including a €26.1 M contract to Thales Alenia Space on 5 May 2026 to develop the telescopes NASA was to supply, and a European charge-management-device tender (European Spaceflight, 8 May 2026).

   Fix EN: "…launch planned in 2035; NASA is a partner, though US budget proposals have put its share in doubt and ESA has started building back-ups for some of NASA's parts [new ref]". RU: «…запуск запланирован на 2035 год; NASA — партнёр, но проекты бюджета США поставили его вклад под сомнение, и ЕКА начало разрабатывать замену части американских узлов [новая ссылка]». Cite an ESA statement if one can be found; otherwise cite the European Spaceflight article and SpacePolicyOnline.
3. **SHOULD — CH5 heading: "The proof that came forty years early".** Hulse–Taylor is indirect evidence. The first decay measurement was Taylor, Fowler & McCulloch, Nature 277, 437 (1979), 36 years before 2015. Fix: "The evidence that came decades early" / «Свидетельство, пришедшее на десятилетия раньше». See also Ethics 1.
4. **NICE — the ground-band upper edge is weakly sourced.** "to around 2 kHz [1][10]". Ref [10] only says the plotted data were band-passed to 2 kHz, and that is not a detector limit. Either cite an aLIGO sensitivity source, or write "analyses usually run up to a few kHz".

## 3. Science Communication & Education — APPROVE WITH CHANGES

The guide is strong. Strain is explained concretely: ±0.002 fm against a proton, and λ against the displacement. The chapters build from strain to detector to chirp to energy to an indirect test to bands to multi-messenger. Limitations are stated: leading order, ISCO cut-off, detector frame, the deformation exaggerated ×10²⁰, "plus" polarisation only, rough PTA edge, and the round 10 Gyr. The eq-boxes are optional for lay readers. The "how fast is gravity" box, which reproduces the published edge, is excellent teaching.

1. **MUST — the strain instrument shows wrong text at reachable settings.** Verified in jsdom:
   - With LIGO, Virgo or KAGRA at h ≥ 10^-18.0 (LIGO) or once the ratio drops below 1, the status switches to the LISA sentence: *"On LIGO's 2.5-million-km arms the same strain is 1 proton widths — big enough to measure between free-floating test masses in different spacecraft."* RU: «На плечах LIGO длиной 2,5 млн км … это 1 диаметров протона».
   - Near ratio 1 the readout prints **"1/1"** and **"× 1"**, plus *"…light whose wavelength is 1 billion times larger"* (LIGO at 10^-18.1, all ground detectors at 10^-18, LISA at 10^-24).

   Fix:
   - (a) Branch the status on the detector (`stL > 1e6`), not on `protonRatio`. Make the ground and LISA sentences each handle both ratio regimes.
   - (b) When the ratio is between 0.1 and 10, print 2 significant figures: "0.84 of a proton width" / "1.2 proton widths" (RU «0,84 диаметра протона»).
   - (c) Format the wavelength ratio with `sci()` when it is below 10 billion or above 10¹².

   Add a check that sweeps `stH` over [−24, −18] on all four presets and rejects `/\b1\/1\b|× 1\b|2\.5-million-km/` unless LISA is selected.
2. **SHOULD — the chirp audio is mostly inaudible.** The GW150914 preset plays a 35 → 64 Hz sine. Phone speakers and most laptop speakers reproduce almost nothing below ~150–200 Hz, so on iPhone the user presses ▶ and hears silence. LIGO's own sound files shift the pitch up for this reason. Fix: add "best with headphones; phone speakers can't play below ~150 Hz" to the note, and/or an "▶ 4 octaves up" button (×16, labelled "pitch-shifted"). RU: «лучше в наушниках: динамик телефона не воспроизводит частоты ниже ~150 Гц».
3. **SHOULD — "INSPIRAL PASSES THROUGH" overstates detectability.** For a 2.74 M☉ neutron-star pair the readout lists "Pulsar timing, LISA, LIGO · Virgo · KAGRA". That implies the PTAs hear neutron stars. In fact a binary NS forms at a period of hours, never at nanohertz, and would be far too faint for PTAs anyway. Fix: relabel the row "FREQUENCIES THE INSPIRAL SWEEPS (NOT LOUDNESS)" / «ЧАСТОТЫ, ЧЕРЕЗ КОТОРЫЕ ПРОХОДИТ СБЛИЖЕНИЕ (НЕ ГРОМКОСТЬ)». Better, list only bands above ~1/(orbital period at formation); simplest is to drop PTA for M < 10⁵ M☉. Add a note sentence: "Being in a band's frequency range is necessary, not sufficient: the signal must also be loud enough."
4. **SHOULD — the hard 2 kHz edge.** At 2.0–2.2 M☉ the readout says "MERGER HEARD BY: no detector" with *"Above 2 kHz: too light for a black-hole pair"*, while 2.24 M☉ is "inside the LIGO band". The band edge is approximate; detectors still have some sensitivity at 2–4 kHz. Fix: "above the ground detectors' most sensitive range" / «выше самого чувствительного диапазона наземных детекторов».
5. **SHOULD — lede: "watch a pulsar's orbit decay exactly as Einstein's theory says it must".** The measured ratio is 0.9983 ± 0.0016. Use "…decay just as Einstein's theory predicts, to within 0.2 %" / «…в точности до 0,2 % по теории Эйнштейна».
6. **NICE** — the PLAY buttons do nothing silently when the model is "past" the last stable orbit. Either disable them (`aria-disabled`) or set a status line such as "Nothing to play: this pair merges below the start frequency."

## 4. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is generally fluent and uses correct terminology: чирп-масса, последняя устойчивая круговая орбита, в системе детектора, светоделитель, дробовой шум, моменты прихода импульсов, периастр, килоновая. Names follow the standard transliterations (Вайсс, Бэриш, Торн, Халс, Тейлор, Вайсберг и Хуан, Камиока). Decimal commas and units (мкс, Мпк, нГц) are correct. Grammatical agreement holds: ЕКА утвердило, LISA рассчитана.

1. **MUST (follows from §3.1)** — «это 1 диаметров протона» and «1/1 диаметра» disappear once the strain fix lands. Make sure the RU number agrees with its noun: «0,84 диаметра», «1,2 диаметра», «743 диаметра».
2. **SHOULD — hero.** «растянулось и сжалось примерно на одну 10²¹-ю часть» is clumsy. Use «…растянулось и сжалось примерно на 10⁻²¹ своей длины».
3. **SHOULD — CH3.** «частота ложных тревог ниже одной за 203 000 лет, больше 5,1σ» leaves "больше 5,1σ" hanging. Use «…ниже одной за 203 000 лет, что соответствует значимости выше 5,1σ».
4. **SHOULD — CH4 eq-box (script.js).** «≈ 4 400 отдач Солнца за 10 млрд лет» is not idiomatic. Use «≈ в 4 400 раз больше, чем Солнце излучит за 10 млрд лет».
5. **SHOULD — pulsar status.** «затухание составляет 8 % от реальной орбиты» compares decay with an orbit. Use «…8 % от затухания реальной орбиты».
6. **SHOULD — CH7.** «что приравнивает скорость гравитации к скорости света с точностью…» → «что показывает: скорость гравитации совпадает со скоростью света с точностью до нескольких единиц на 10¹⁵». Also, «светящиеся обломки» → «светящийся выброс вещества (килоновую)».
7. **SHOULD — the CH2 heading.** «Пятьдесят лет постройки «уха»…» → «Пятьдесят лет создания «уха»…».
8. **SHOULD — mid-sentence capital.** *«…сближение всё же проходит через Пульсарный тайминг»*; EN has the same problem ("crosses Pulsar timing"). Lower-case the band names when they sit in running text, or put them in quotation marks as the in-band sentence already does («в полосе «…»»). Consider «хронометраж пульсаров» as the main RU term and give «пульсарный тайминг» once as a gloss.
9. **NICE — the label «ДЕФОРМАЦИЯ h».** The established RU term is «безразмерная амплитуда h» or «относительная деформация h». «Деформация» is acceptable if the body glosses it once.
10. **NICE — digit grouping.** The body writes «9257» and «203 000», while the readouts print «4 400» and «1394 с». Pick one rule (four-digit numbers without a space is fine) and apply it to `fmtInt` and the body. The same problem appears in EN: "1394 s", "4397 Hz", "10484 %" next to "1,598 Hz" (`fmt` vs `fmtInt`).

## 5. Information Design & Frontend accessibility — APPROVE WITH CHANGES

Exercised in jsdom: every preset, every slider at its extremes and mid-points, EN and RU, PLAY with and without Web Audio. No NaN, `undefined` or `Infinity` appears anywhere. The following are fine:
- every SVG has `role="img"` and an `aria-label` translated on render;
- statuses are `aria-live`, and presets use `aria-pressed`;
- sliders have `<label for>`;
- touch targets are 44 px, and focus-visible is set;
- the ring animation honours `reduced()`;
- audio plays only on a tap, and `resume()` is called for iOS.

Chart honesty is good: the log axes say "(log scale)", the strain ruler states "each tick is 10⁴ times the last", the ring is labelled "deformation ×10²⁰", the pulsar curve is labelled as the GR prediction, and the PTA band is marked "≈".

1. **MUST — no `aria-valuetext`.** `stH` (log10 h) and `bdM` (log10 M) announce raw exponents ("−21", "1.81") to screen readers. `chM`, `chF`, `psE` and `psY` need units. Fix: in each render, `el.setAttribute('aria-valuetext', <matching *Val textContent>)`. Do this for all six sliders.
2. **MUST — the pulsar y-axis becomes unreadable at high e.** The gridline step is only 10, 50 or 200, so at e = 0.9 (shift ≈ −11,690 s) the chart draws **~58 labelled gridlines in 210 px**. jsdom counted 61 lines, and 17 already at e = 0.85. Fix: use a nice-number step, e.g. `step = niceStep(-bottom/5)` from {1, 2, 5} × 10ⁿ, so the axis keeps 4–6 labels. Add a check that the number of `#psSvg` text labels stays ≤ 12 across `psE` ∈ [0, 0.9].
3. **SHOULD — strain-ruler labels overlap at the LISA preset.** "each arm moves" (svg-label, centre x ≈ 163) and "laser wavelength" (svg-small, centre x = 240) sit on the same row (y = 232), about 77 px apart, with ~92 px of combined half-widths at desktop sizes. The overlap gets worse at the 14–15 px phone font. Fix: put the laser label on the upper row, or flip rows when the two are less than 100 px apart. Confirm with `shot.sh ripple-gravitational-waves 390`; NOTES says the page has not been screenshotted.
4. **SHOULD — group labels stay English in RU.** In RU mode the `aria-label`s still read "Detector arm / Event preset / Listen / Orbit preset / Binary preset". Set them via `T()` in the renderers or through `applyLang`.
5. **NICE** — the pulsar year slider runs to 2026, but W&H's data stop around 2013. A light vertical tick "last W&H data" would show where measurement ends and extrapolation begins.

## 6. Ethics — APPROVE WITH CHANGES

The page credits the collaborations rather than lone heroes. It names Weber fairly: the page says only that a detection "that held up" came in 2015, which neither disparages nor endorses his claim. It names Hulse and Taylor, Weisberg and Huang, NANOGrav, and the 2017 laureates with the official motivation. It deliberately avoids the unverifiable "brighter than all the stars in the universe" claim, which is good practice (NOTES). No harmful content.

1. **SHOULD — overclaiming:** the "most powerful event ever measured" (MUST in §2.1), the "proof … forty years early" (§2.3) and "exactly as Einstein's theory says" (§3.5) all overstate. Together they nudge the tone toward triumphalism that the data do not need.
2. **SHOULD — credit for the interferometer idea.** *"laser interferometers, first proposed in the 1960s and 1970s"* drops the names that the PRL itself cites. Fix EN: "first proposed by Mikhail Gertsenshtein and Vladislav Pustovoit in 1962 and worked out in detail by Rainer Weiss in 1972 [1]". RU: «впервые предложенные Михаилом Герценштейном и Владиславом Пустовойтом в 1962 году и подробно разработанные Райнером Вайссом в 1972 году [1]». This matters for both audiences. Consider also naming **Ronald Drever**, co-founder of LIGO with Weiss and Thorne, who died in March 2017 before the Nobel was awarded. The PRL author list includes him.
3. **NICE** — "LIGO read off about 30 solar masses" could say "the LIGO and Virgo teams" once, so that the collaborative authorship (~1,000 authors, Virgo included in the analysis) is visible.

---

## Consolidated MUST-FIX

1. **Strain instrument wrong-branch text:** ground detectors at large h show the LISA "2.5-million-km arms … spacecraft" sentence, and "1/1", "× 1", "1 proton widths", "1 billion times" appear near ratio 1. Branch on detector, use 2 significant figures between 0.1 and 10, fix RU agreement, and add a sweep check (§3.1, §4.1).
2. **Pulsar initial state:** set `psE.value = B1913.e` before the first render. On load it now shows −2.399 × 10⁻¹² next to a 0.9983 ratio that only holds for −2.402 × 10⁻¹² (§1.1).
3. **GW150914 chirp readout vs text:** 0.14 s and 6 cycles, against "0.2 s, about 8 cycles" in the paragraph above. Add a time-to-coalescence row (0.17 s) or a preset status note, EN and RU (§1.2).
4. **"The most powerful event ever measured"** (CH4 heading, EN and RU) is stale since GW190521. Date it ("In 2015, …") or reword (§2.1).
5. **`aria-valuetext`** on all six sliders, especially the log-scaled `stH` and `bdM` (§5.1).
6. **Pulsar y-axis label pile-up** at high e (~58 labels at e = 0.9): use a nice-number step (§5.2).

**SHOULD (strongly recommended before publishing):**
- LISA status caveat: NASA's share is in doubt and ESA has ordered replacement telescopes (§2.2).
- Re-check observing.docs.ligo.org/plan after its scheduled 15 Oct 2026 update, and again on push day.
- "Evidence … decades early" instead of "proof … forty years early" (§2.3).
- Lede: "within 0.2 %" instead of "exactly" (§3.5).
- A headphones / pitch-shift option for the chirp audio (§3.2).
- Relabel "inspiral passes through" as frequency-only, and soften the hard 2 kHz edge (§3.3–3.4).
- Name Gertsenshtein & Pustovoit (1962), Weiss (1972) and Drever (§6.2).
- The RU fixes in §4.2–4.8.
- Strain-ruler label overlap on LISA, verified by a 390 px screenshot (§5.3).
- Translated button-group `aria-label`s (§5.4).

**NICE:** the 0.9983 rounding note and its check (§1.3); GW170817's 3,834 vs ~3000 cycles (§1.4); the 65 vs 68.9 M☉ frame note (§1.5); the ground-band citation (§2.4); feedback when PLAY has nothing to play (§3.6); RU "безразмерная амплитуда" (§4.9); consistent digit grouping (§4.10); a "last data" tick on the pulsar chart (§5.5); collaborative credit wording (§6.3).
