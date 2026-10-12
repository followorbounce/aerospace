# REVIEW — BURST (Gamma-ray bursts: Swift & Fermi)

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Four MUST-FIX items, all small. The physics and data hold up when re-derived independently, including a fresh re-query of the GBM catalog.

Scripts and data: `/tmp/claude-1000/-home-none-git/c08a888d-36f6-489f-bebf-b7fcbf302f74/scratchpad/review-burst/` (`cosmo.py`, `t90.py`, `data/gbm.vot`).
`./check-all.sh burst-gamma-ray-bursts` → **ALL OK** (errors 0, offStep [], missingRu 0, cites 26/26, timeline 14).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

**Independent re-derivation** (scipy `quad`, rel. tol 1e-12, flat ΛCDM, H₀ 67.36, Ωm 0.3153):

| Quantity | Reviewer | Page |
|---|---|---|
| Age today | 13.801 Gyr | 13.80 (radiation omitted; Planck's 13.797 includes it, so this is fine) |
| d_L(0.151) | 745.3 Mpc | 745 |
| E_iso 221009A (S 0.22, z 0.151) | 1.270e55 (+5.8 % vs 1.2e55) | 1.27e55, "6 %" |
| E_iso 080916C (2.4e-4, z 4.35) | 8.801e54 (+0.0 %) | 8.80e54 |
| E_iso 090423 at z 8.1 / 8.2 | 1.005e53 (−2.4 %) / 1.023e53 (−0.7 %) | 1.005e53 / 1.02e53 |
| Age at z 8.2 | 617 Myr | 617 (text: "about 630", per Tanvir) |
| z for d_L = 42.9 Mpc | 0.00957 | check uses 0.0096 |
| M☉c²; 1.2e55/M☉c² | 1.787e54; 6.71 | 1.787e54; "almost seven" |
| f(5°) = 1 − cos 5°; 1/f | 0.003805; 263 | 0.38 %; 263 |
| Δθ for 0.03 s at D = 10⁵ km, θ = 90° | 5.15° | "about 5°" |

- **Isotropy model.** I derived the expectation myself. Sources are uniform in a sphere of radius D, inside a slab |z| < 1. ∫sin²b dV = 4π(1/9 + ln D / 3) and V = 2π(D² − 1/3), which gives ⟨sin²b⟩ = k²(1/3 + ln 1/k)/(1.5 − 0.5k²) with k = 1/D. That is identical to `expSin2`. The σ for an even sky, √(4/45/N), is also correct (Var u² = 1/5 − 1/9). "Even sky: 17 %" within 10° matches sin 10° = 0.174.
- **T90 data.** I re-queried HEASARC TAP (`SELECT name,trigger_time,t90 FROM fermigbrst`, VOTable). It returned 4,392 rows, 4,391 with T90 > 0, triggers 2008-07-14 to 2026-10-08, and **741 below 2 s**. All match the page. My 0.05-dex histogram matches `T90_HIST` except one burst shifted between bins 64 and 65 (a bin-edge rounding difference, which does not matter). The 2 s cut lands on a bin edge (0.30 vs 0.301) without changing the count. The largest T90 is 984 s, so the 10^3.0 axis holds every burst. Bars are 0.2 dex, the y-axis starts at zero and is linear: the chart is honest.
- **E_iso formula and the "1 + z" explanation** are correct. Fluence integrates flux over an observed duration stretched by 1 + z.

Findings:
1. **SHOULD — the "two humps" wording overstates the short-burst peak.** In 0.2-dex bars the short side reads 103, **165** (0.63–1 s), 113, 152, 155, 217, …. That is a weak hump below 1 s followed by a shallow shoulder, not a clean peak "near half a second". Status text: *"two humps — near half a second and near half a minute"*. Fix EN: "a small hump just under a second and a much larger one near half a minute". RU: «небольшой горб чуть меньше секунды и гораздо больший — около полуминуты». Add a checks.js test that locates the short-side maximum (bin −0.2…0.0).
2. **SHOULD — "almost seven times" vs the readout's 7.10.** The body takes 1.2e55 (6.7 × M☉c²), but the instrument's own estimate (1.27e55) shows **7.10**, and the hero says "≈ 10⁵⁵" (5.6 ×). Fix: "about six to seven times" / «примерно в шесть–семь раз». Alternatively say "almost seven times, on the Konus-Wind value [14]" (Frederiks gives "≳ 6.5 solar rest mass").
3. **SHOULD — the GRB 090423 "1 %" compares different redshifts.** The preset computes at z = 8.2 and compares with the published value at z = 8.1 (the readout does show "z = 8.100"). At equal z the gap is 2.4 %. Fix: compute the comparison at `pubZ`, or reword the status as "…at z = 8.2; the published value assumes z = 8.1".
4. **NICE — checks.js label mismatch.** It says *"z ≈ 0.0098"* but tests 0.0096 (the true value is 0.00957). Also add checks for "Δθ ≈ 5°" and "even sky: 17 %", which are in the text but untested.
5. **NICE** — `fmt(b.pubZ, 3)` prints "z = 8.100" / "4.350". Use the significant digits instead (8.1, 4.35, 0.151).

## 2. Research / fact-check — APPROVE WITH CHANGES

Spot-checked against primary or official sources (all confirmed unless noted):
- Vela 4a,b launched 28 Apr 1967; first GRB 2 Jul 1967; classified for years — HEASARC history ✔.
- Klebesadel, Strong & Olson 1973, ApJ 182 L85: 16 bursts, 0.2–1.5 MeV, Jul 1969 – Jul 1972, <0.1 to 30 s, "Directional information eliminates the Earth and Sun" (INSPIRE abstract) ✔.
- CGRO launched 5 Apr 1991 (deployed 7 Apr); BATSE isotropy 1992 (Meegan et al.) ✔. The 2,704 count comes from the cited HEASARC page.
- Kouveliotou et al. 1993, ApJ 413 L101: bimodal, <2 s / >2 s, short harder (abstract) ✔. Note: this was the *first BATSE catalog*.
- BeppoSAX 1997: X-ray counterpart 28 Feb; 970508 "first to result in a measured redshift (= 0.835)" ✔, but see finding 2.
- Swift launched 20 Nov 2004; Fermi 11 Jun 2008 ✔. BAT: 15–150 keV, 1.4 sr half-coded, 32,768 CdZnTe, ~54,000 tiles 50 % open, 1 m, 4′, "within several seconds" ✔.
- GW170817/GRB 170817A: delay (+1.74 ± 0.05) s (Abbott et al. 2017, ApJL 848 L13) ✔.
- GRB 221009A: Frederiks — 0.22 erg/cm² (20 keV–10 MeV), E_iso ≈ 1.2e55, "≳ 6.5 solar rest mass" ✔. Lesage — the highest-flux GBM burst ✔. Lesage quotes the GBM band as 8 keV–40 MeV; the page uses GCN's 30 MeV, as disclosed in NOTES.
- Frail 2001: "narrowly clustered around 5×10⁵⁰ erg" ✔.
- **Swift status (checked today):** the newest NASA Swift blog post is still **25 Sep 2026** (BAT detecting on 18 Sep, automated pointing on 21 Sep, ~325 km, <300 km "early to mid-October"). No October post exists, and no source reports that science has ended or that Swift has re-entered. LINK launched 3 Jul 2026 (Pegasus XL) and re-entered 25 Sep. The page's status note is **accurate as of 2026-10-11**. Still re-check right before pushing.

Findings:
1. **SHOULD — the LINK timeline is compressed.** *"…could not capture Swift, and the LINK mission ended on 25 September [24]"*. Katalyst **abandoned the boost attempt on 19 August** (NASA blog, 19 Aug; Wikipedia); 25 September is when LINK *re-entered*. Fix EN: "…could not capture Swift; Katalyst called off the boost on 19 August, and LINK itself re-entered on 25 September [24]." RU: «…не смог захватить Swift; Katalyst отказалась от подъёма орбиты 19 августа, а сам LINK вошёл в атмосферу 25 сентября [24].» Optionally cite the NASA 19 Aug blog post.
2. **SHOULD — the 2003 supernova was not seen "on 29 March".** *"on 29 March 2003 a very energetic supernova appeared at the place and time of a long burst [8]"*. The burst was on 29 March. The supernova's spectrum emerged about a week later, and Hjorth's abstract says it "exploded within a few days of" the GRB. Fix EN: "the long burst of 29 March 2003 was followed, at the same spot, by a very energetic supernova that had exploded within a few days of it [8]". RU: «за длинным всплеском 29 марта 2003 года в той же точке последовала очень мощная сверхновая, взорвавшаяся в пределах нескольких дней от него [8]». Make the matching change to the timeline entry ("appears with a long burst" → "is found to follow the long burst of 29 March").
3. **SHOULD — the burst rate.** Lede: *"A few times a day…"*. Detectable GRBs occur roughly **once a day** (BATSE ~1/day; GBM ~240/yr over ~70 % of the sky). Fix: "About once a day…" / «Примерно раз в сутки…».
4. **SHOULD — the GBM short-fraction explanation is uncited and imprecise.** *"because its trigger favours longer events"*. The usual reason is GBM's softer energy response, which favours softer (mostly long) bursts. Fix EN: "GBM's detectors respond to lower energies than BATSE's, which favours the softer, mostly long bursts". RU accordingly. Cite von Kienlin et al. 2020 [7] if it supports this, or mark it as an approximate explanation.
5. **NICE** — ref [15] links arXiv:0906.1577, whose preprint title reads "…at redshift 8.3". Add the Nature DOI 10.1038/nature08459 so the cited title and "z ≈ 8.2 / ~630 Myr" can be found at the link.

## 3. Science Communication & Education — APPROVE WITH CHANGES

The guide teaches well. Each chapter answers "how do we know", the isotropy chapter openly shows only "the first half of that argument", the k-correction and the jet angle are disclosed, and Frail's cluster is labelled "a typical value, not a law". These are good practice.

1. **MUST — the caption describes a visual that does not exist.** Note under Instrument 1: *"the band shows ± 2 standard errors of an even sky"* / «полоса — ± 2 стандартные ошибки…». `renderSky` draws no band. The ±2σ appears only as a readout cell. Fix EN: "the readout's ± range is 2 standard errors of an even sky (600 sources)". RU: «диапазон ± в показаниях — 2 стандартные ошибки для равномерного неба (600 источников)». The alternative is to draw the band.
2. **MUST — Instrument 3 is inconsistent on first load.** "GRB 221009A" is shown pressed (`aria-pressed=true`), but the slider starts at its HTML `value="-0.82"`/`"-0.66"`, not at the exact preset. Result in jsdom on load: d_L **747** Mpc, *PUBLISHED —*, and the generic status, so the page's central comparison is missing until the user clicks the already-active button. Fix: before the first `renderAll`, set `enZ.value = Math.log10(BURSTS.boat.z); enS.value = Math.log10(BURSTS.boat.S)` (the exact-value wrapper keeps them), or simulate the preset click. Add a checks.js assertion that the initial `enReadout` contains "1.20 × 10⁵⁵".
3. **SHOULD — the BeppoSAX paragraph implies BeppoSAX measured the redshift.** See Ethics 1.
4. **NICE** — *"from the far side of the universe"* / «с другого края Вселенной» is hyperbole. Use "from distant galaxies across the universe" / «из далёких галактик по всей Вселенной».
5. **NICE** — "about 43 million parsecs" means little to a lay reader. Add "(about 140 million light-years)" / «(около 140 млн световых лет)».
6. **NICE** — the "something odd around the Sun" alternative omits the main contender of the 1990s, a large halo around the Milky Way. One clause would fix it: "…around the Sun or in a vast halo around the Galaxy".

## 4. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is generally natural, and the terms are correct: фотометрическое расстояние, флюенс, кодирующая маска, K-поправка, коллимация, decimal commas, эрг/кэВ/Мпк.

1. **MUST — the meaning is inverted in the Instrument 3 status.** *«эта простая оценка даёт 1,27 × 10⁵⁵ эрг, 6 % от опубликованного значения»* reads as "6 % **of** the published value". Fix: «…эрг — на 6 % отличается от опубликованного значения, в котором учтён ещё и энергетический диапазон детектора.»
2. **SHOULD — pleonasm.** «Гамма-лучи проходят сквозь зеркала насквозь» → «Гамма-лучи проходят сквозь зеркала».
3. **SHOULD — case government.** «BAT следит примерно за 1,4 стерадиана» is wrong after «за». Use «BAT охватывает около 1,4 ср неба» or «следит за участком неба около 1,4 стерадиана».
4. **SHOULD** — «половина пропускает свет»: a gamma-ray mask does not pass "light" in the everyday sense, and EN says "half open". Use «половина ячеек открыта».
5. **SHOULD — a misleading term.** «Угол θ даёт резкое ускорение угасания послесвечения — излом струи». «Излом струи» reads as "a kink in the jet". Use «…— излом кривой блеска, связанный со струёй (джет-брейк)».
6. **SHOULD — instrument table.** «телескоп на рождении пар» → «телескоп с конверсией в электрон-позитронные пары». «за BAT» ("follows BAT") → «по наводке BAT».
7. **SHOULD — digit grouping is inconsistent.** Body text writes «4391», «2704», while readouts print «4 391», «3 650». Pick one rule (four-digit numbers without a space is fine in RU typesetting) and apply it to `fmtInt` output or the body.
8. **NICE** — ««Вела-4a»» mixes Cyrillic and Latin. Use «Вела-4А/4Б» or keep "Vela 4a" in Latin. Button «2 С (УСЛОВНО)»: keep the unit lowercase, «2 с (условно)», and let CSS uppercase it if needed. EN does the same.

## 5. Information Design & Frontend accessibility — APPROVE WITH CHANGES

Reasoned from code only; no browser was launched. The following are fine:
- Every SVG has `role="img"` and a bilingual `aria-label` that is re-set on render.
- Statuses are `aria-live="polite"` and button groups use `aria-pressed`.
- All sliders are labelled `<label for>`.
- `.btn` and range inputs are ≥ 44 px (extra.css), and focus-visible outlines are set.
- `.svg-small` #5f5f59 on #fbfbf8 has contrast ≈ 6.3 : 1.
- The guide has no animation, so reduced motion is moot.
- On phones the chart text grows to 14–15 px (≈ 10.5 px effective at 390 px).
- The table sits in `.table-scroll`.
- Chart honesty: the y-axes start at 0 and are linear; the log x-axes are labelled "(log scale)"; the sky map is labelled "illustration"; the published squares are labelled; the jet angle is marked "your choice".

1. **MUST — log-scaled sliders announce raw exponents.** `skyD`, `t90Cut`, `enZ`, `enS` and `jetE` store log10 values, so a screen reader announces "−0.82", "−0.66", "55.08" instead of "z = 0.151" or "2.2 × 10⁻¹ erg/cm²". There is no `aria-valuetext` anywhere in the page, although eight other guides set it (e.g. `slingshot-gravity-assists.html` l. 547). Fix: in each render, `el.setAttribute('aria-valuetext', <the matching *Val textContent>)`. Do the same for `jetT` for consistency.
2. **SHOULD — the T90 grey bar has no legend.** The bar that straddles the dividing line is drawn grey (#9a8f7a) with no explanation. Add to the note: "grey bar: straddles the line; the counts use the exact 0.05-dex bins" / «серый столбец пересекает границу; подсчёт ведётся по точным бинам 0,05 декады».
3. **SHOULD — button-group labels are English-only.** `aria-label="Population" / "Dividing line" / "Burst" / "Starting energy"` stay English in RU. Set them via `T()` in the renderers, or add `data-` translations that `applyLang` handles.
4. **NICE** — the `aria-label` of Instrument 3's SVG could include the current values (z, E_iso), as the readouts do. The aria-live statuses partly cover this.

## 6. Ethics — APPROVE WITH CHANGES

The Vela origin is told neutrally and accurately ("to watch space for nuclear explosions", "looked nothing like a weapon"), with no sensationalism. The heading "From a secret archive" is fair, because the data was classified (HEASARC). Klebesadel, Strong, Olson, Kouveliotou and Frail are named. The Swift-decline chapter is factual and blames no one.

1. **SHOULD — the GRB 970508 redshift is mis-attributed.** *"The first afterglows… were found in 1997 by BeppoSAX: GRB 970228 in X-rays, then GRB 970508 with the first measured redshift, 0.835 [2]."* BeppoSAX localised both bursts and found the X-ray afterglow of 970228 (Costa et al. 1997). The 0.835 redshift came from Keck optical spectra (Metzger et al. 1997, Nature 387, 878), and it was strictly a lower limit at the time. Fix EN: "BeppoSAX caught the first X-ray afterglow, of GRB 970228, and pinned down GRB 970508 quickly enough for the Keck telescope to measure the first redshift, 0.835 (Metzger et al.) [2]". RU: «BeppoSAX зарегистрировал первое рентгеновское послесвечение (GRB 970228) и так быстро локализовал GRB 970508, что телескоп Кека измерил первое красное смещение — 0,835 (Метцгер и др.) [2]». Add Metzger 1997 as a reference, or at least name the observatory.
2. **NICE** — name the people behind BATSE's isotropy result (Meegan, Fishman et al. 1992). Note that Swift is officially the *Neil Gehrels* Swift Observatory (ref [11] already uses that name).
3. **NICE** — the Vela context could mention, in one neutral clause, that the satellites verified the 1963 Partial Test Ban Treaty. Add it only with a citation; LANL ref [1] likely covers it.

---

## Consolidated MUST-FIX

1. **Instrument 1 note:** remove "the band shows ± 2 standard errors" (no band is drawn). Reword to the readout's ± range, EN and RU (§3.1).
2. **Instrument 3 initial state:** set `enZ`/`enS` to the exact GRB 221009A preset before the first render, so "PUBLISHED 1.20 × 10⁵⁵" and the % status show on load. Add a check (§3.2).
3. **RU status "N % от опубликованного значения"** reads as "N % *of*". Change it to «на N % отличается от опубликованного значения» (§4.1).
4. **`aria-valuetext`** on the log-scaled sliders (`skyD`, `t90Cut`, `enZ`, `enS`, `jetE`, plus `jetT`), mirroring the displayed values (§5.1).

Strongly recommended before publishing (SHOULD): LINK 19 Aug vs 25 Sep (§2.1); 2003 supernova timing (§2.2); "about once a day" (§2.3); BeppoSAX/Keck attribution (§6.1); "six to seven times" (§1.2); the short-hump wording (§1.1); the Russian fixes in §4.2–4.7; the T90 grey-bar legend; translated group labels. Re-check the NASA Swift blog the day this is pushed: as of 2026-10-11 the latest post is 25 Sep, and Swift is expected to cross 300 km about now.
