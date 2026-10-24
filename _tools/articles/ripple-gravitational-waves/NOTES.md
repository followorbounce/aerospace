# RIPPLE — Gravitational waves: LIGO, Virgo, KAGRA & LISA

**Purpose.** Wave 6 field guide (category `telescopes`): what a gravitational wave is, how ground interferometers hear it, what GW150914's chirp says about the masses, the energy it carried, the Hulse–Taylor pulsar test, why arm length sets the frequency band (LIGO vs LISA vs pulsar timing), GW170817 and the network's status in October 2026.
**Audience.** Interested non-specialists comfortable with powers of ten; formulas shown in eq-boxes for readers who want them.
**Owner.** Generated guide; sources here, build with `python3 _tools/assemble.py _tools/articles/ripple-gravitational-waves`.

## Structure
9 chapters (lede “Nine chapters”, counting REFERENCES, as for all generated guides). 4 instruments: strain to scale (CH1), chirp with audio (CH3), Hulse–Taylor decay (CH5), detector bands (CH6). CH4 energy and CH7 speed-of-gravity are computed eq-boxes. 21 references, 17 timeline entries, 58 checks (after the review fixes).

## Sources for key numbers
- GW150914 (time, 35→250 Hz, h = 1.0e-21, 6.9 ms, 8 cycles/0.2 s, 𝓜 ≃ 30, ≳70 M☉, 350 km, 36+29→62, 3.0 M☉c², 3.6e56 erg/s = 200 M☉c²/s, 410 Mpc, SNR 24, FAR, 4 km, 1064 nm, 20 W→700 W→100 kW, >10 Hz isolation, 100–300 Hz, 10 ms intersite, history): [1] PRL 116 061102 (arXiv 1602.03837, PDF text checked).
- ±0.002 fm arm displacement, ~200 ms/~10 cycles from 30 Hz: [2] GWOSC factsheet.
- Proton radius 0.84075 fm: [3] NIST CODATA 2022.
- Virgo 3 km near Pisa [4]; KAGRA 3 km Kamioka, sapphire, 20 K [5] (page gives no depth, so none stated).
- LISA adoption 25 Jan 2024, 3 spacecraft, 2.5 million km, launch 2035, NASA role [6]; band 0.1 mHz–0.1 Hz [14] (ESA Cosmos; some older papers say up to 1 Hz — ESA's current figure used).
- Integrated chirp f(t) and ISCO 4.4 kHz × M☉/M: [9] “basic physics of GW150914”.
- GW170817: 1.1977 M☉ detector-frame chirp mass, ~100 s from 24 Hz, 2.74 M☉, 40 Mpc, SNR 32.4, 30 Hz–2 kHz band-pass [10]; 1.74 ± 0.05 s, D = 26 Mpc conservative, 10 s emission allowance, −3e-15 ≤ Δv/c ≤ +7e-16 [16]; NGC 4993, <11 h, UV→radio [17].
- Sun: mass, GM, luminosity [11] NSSDC.
- PSR B1913+16: discovery 1974, Arecibo, Nobel 1993 [12]; all timing values [13] Weisberg & Huang 2016 (PDF text checked).
- NANOGrav 15-yr: 67 pulsars, evidence for background [15].
- O4 25 May 2023 00:00 JST → 19 Nov 2025 01:00 JST (= 24 May / 18 Nov UTC), ~300 signals [18]; IR1 six-month run planned from early–mid Nov 2026, O5 in discussion, page updated 3 Sep 2026 [19].
- Weber 1969 title/date [7] (Crossref metadata; APS DOI page returns 403 to scripts).
- Nobel 2017 motivation [8].
- Interferometer history (Gertsenshtein & Pustovoit 1962; Moss, Miller & Forward 1971; Weiss 1972; Drever 1983; the 1989 LIGO proposal by Drever, Raab, Thorne, Vogt & Weiss): [1], the PRL's own intro and reference list (refs 25–29, PDF text checked).
- GW190521: 7.6 (+2.2/−1.9) M☉c² radiated, “the most energetic GW event recorded to date”, peak 3.7e56 erg/s [20] ApJL 900 L13 (arXiv 2009.01190, PDF text checked; not Wikipedia).
- LISA funding: €26.1 M Thales Alenia Space telescope contract 5 May 2026, FY2026 cut proposed then $80.5 M restored by Congress, FY2027 cuts proposed again, ESA “budget discussions are ongoing” [21] European Spaceflight, 8 May 2026 (Thales's own press release returns an empty page to scripts).

## Computed (checked in checks.js)
- 0.002 fm = 1/841 proton width; LISA light time 8.34 s.
- Leading-order chirp: τ(30 M☉, 35 Hz) = 0.170 s (“0.2 s”); 8.7 cycles 35→150 Hz (“about 8”); GW170817 τ(24 Hz) = 99.9 s (“~100 s”); 347 km at 75 Hz (“≃350 km”).
- 3 M☉c² = 5.36e47 J; 200 M☉c²/s = 3.57e49 W (paper 3.6e49); 9.3e22 Suns; ≈4,400 Sun-lifetimes (assumption below).
- Peters–Mathews Ṗb = −2.40209e-12 vs paper −2.40263e-12 (0.02 %); f(e) = 11.86; −2.398/−2.4021 = 0.9983; a = 1.95e6 km; shrink 3.5 m/yr; 38.6 s shift after 30 yr.
- Speed bound 1.74 s / (26 Mpc / c) = 6.5e-16, matching the published +7e-16 edge.

## Assumptions / limitations
- Chirp is leading-order inspiral with equal masses, ending at the non-spinning ISCO; real GW150914 continues to ~250 Hz through merger and ringdown. Masses are detector-frame (redshift noted).
- Strain picture shows only “plus” polarisation, deformation exaggerated ~10²⁰ (labelled).
- Pulsar instrument varies e with masses and period fixed; the plot is the GR prediction (not data points) — the note says the measured points follow it (Weisberg & Huang Fig. 2).
- Bands are approximate; the PTA upper edge (1e-7 Hz) is drawn only roughly and labelled “≈”; the lower edge is 1/(15 yr), computed.
- “Sun's lifetime output” uses a round 10 billion years at today's luminosity, stated in the eq-box note.
- Audio: real GW frequencies (capped at 4 kHz, which only the pitch-shifted mode reaches), at most 4 s, user-initiated only; AudioContext resumed on tap for iOS; no-Web-Audio fallback message.

## Unverified / judgment calls
- “Weber's reports never confirmed” is NOT claimed (no primary source opened); the page says only that a detection that held up came in 2015.
- Hanford–Livingston distance not stated in km; the PRL's 10 ms intersite light time is used.
- No claim of “brighter than all the stars in the universe” (LIGO's paper doesn't give a figure I could verify); Sun comparison computed instead.
- Status lines dated 11 October 2026. The LVK plan page (re-fetched 11 Oct: still “Last updated Sep 03, 2026”) promises its next update by 15 October 2026 — **re-check it on push day and after IR1's planned November start.**
- Screenshotted at 1300 and 390 px after the fixes (see below).

## Wiring (not done here)
- Index label EN: `Gravitational Waves: LIGO, Virgo, KAGRA & LISA` · RU: `Гравитационные волны: LIGO, Virgo, KAGRA и LISA` · codename `RIPPLE` · category `telescopes`.
- llms.txt: `Gravitational waves: strain of 10⁻²¹ on LIGO's 4 km arms (±0.002 fm), GW150914's chirp and chirp mass with playable audio, 3 M☉c² radiated, Hulse–Taylor orbital decay vs general relativity (0.9983 ± 0.0016), detector bands from pulsar timing to LISA and LIGO, GW170817 and the network's status as of October 2026.`

## Review fixes applied / declined (2026-10-11, after REVIEW.md)

**MUST, applied (each has a check)**
1. Strain status now branches on the detector (LISA if the arm is > 1,000 km), not on the proton ratio. Between 0.1 and 10 proton widths it prints 2 significant figures (“0.94 of a proton's width”, “1.2 proton widths”); below 1/100,000 it switches to scientific notation (RU grouping made “1/1 121 000” ambiguous); the wavelength ratio uses sci() outside 10–1,000 billion. RU noun agreement (диаметр / диаметра / диаметров) by a small helper. Check: sweeps h from 10⁻²⁴ to 10⁻¹⁸ on all four detectors in EN and RU, rejecting “1/1”, “× 1”, “1 billion”, the LISA sentence on ground detectors and bad RU agreement; plus fixed values (1/841 on LIGO, 743 widths on LISA).
2. `psE.value = B1913.e` before the first render (exact-value wrapper keeps 0.6171340). Check, in a fresh jsdom window: the load-state readout shows −2.4021 × 10⁻¹².
3. Chirp readout: new row “TIME TO COALESCENCE (FORMULA)” (0.17 s for GW150914) beside “TIME TO LAST STABLE ORBIT” (0.14 s); the status names both and says the real signal keeps rising through the merger. Checks for the row and the status.
4. CH4 heading → “Three suns turned into ripples, and nothing to see” / «Три Солнца, ушедшие в рябь, — и ничего не видно»; added “Bigger mergers have been heard since: GW190521 … about 7.6 solar masses [20]” and a 2020 timeline row. (Not “held the record until GW190521”: GWTC-1's GW170729, ~4.8 M☉c², came in between.) Checks: the old phrase is gone; GW190521 cited.
5. `aria-valuetext` on all six sliders, mirroring the readouts (log sliders announce “strain 1.0 × 10⁻²¹”, “total mass 65 solar masses”). Check in the fresh window.
6. Pulsar y-axis uses a 1-2-5 nice step from the curve's range: 4–6 gridlines at any e. Check: ≤ 7 y-labels for e = 0 … 0.9.

**SHOULD, applied**
- LISA status: NASA's share in doubt, ESA paying for European back-ups starting with the telescopes [21]; timeline 2026 row.
- LVK plan page re-checked 11 Oct (unchanged); status note dated 11 Oct and says the page's next update is due 15 Oct.
- “The evidence that came decades early”; lede “to within 0.2 %” (EN and RU).
- Audio: note that 35–64 Hz is too low for phone/laptop speakers, plus a “▶ 4 OCTAVES UP” button (×16, labelled pitch-shifted in the status); PLAY now says “Nothing to play” instead of failing silently.
- Bands: row relabelled “FREQUENCIES THE INSPIRAL SWEEPS (NOT LOUDNESS)”; pulsar timing listed only for pairs ≥ 10⁵ M☉; “necessary, not sufficient” sentence in status and note; the hard 2 kHz edge softened (“above the ground detectors' most sensitive range”; body says “up to the kilohertz range”, note says the 2 kHz edge is the GW170817 plot's).
- Credit: Gertsenshtein & Pustovoit (1962), Weiss (1972), Drever, and the 1989 LIGO proposal, all from [1]; timeline rows 1962, 1972, 1989. “The LIGO and Virgo teams read off …”.
- Russian: 10⁻²¹ своей длины; «что соответствует значимости выше 5,1σ»; «в 4400 раз больше, чем Солнце излучит за 10 млрд лет»; «8 % от затухания реальной орбиты»; «что показывает: скорость гравитации совпадает …»; «светящийся выброс вещества — килоновую»; «создания „уха“»; band name lower-case «хронометраж пульсаров» (glossed once as «пульсарный тайминг»), quoted in running text; «относительная деформация h» with a gloss. Four-digit numbers ungrouped in RU readouts (page-local num()), as in the body.
- Strain ruler: laser label on the upper row, arm on the lower; tick lines drawn first and labels haloed on top; tick labels without units (“metres” moved into the scale caption), and every other tick label hidden below 500 px.
- Button-group aria-labels translated (checked in RU).

**NICE, applied:** 0.9983 “computed from unrounded values” and the check now divides by the published −2.40263; GW170817 note gives the paper's ~3,000 cycles vs the model's ~3,800; 65 (source frame) vs ≈ 69 (detector frame) reconciled in the band note; “their timing data end around 2013” in the pulsar note; the chirp axis ends at “0”, not “−0.00”; zero-line label on the pulsar chart moved below the line (it hit the title at 390 px); chirp readout has no orphan cell.

**Declined**
- A “last W&H data” tick on the pulsar chart — the note says it instead (keeps the small chart clean).
- An ESA statement for the LISA caveat: none found; cited the trade report that quotes ESA.

**Screenshots:** 1300 and 390 px after the final edit; no overlaps or clipping left in the instruments. `check-all.sh ripple-gravitational-waves` → ALL OK (58 checks); `node --check` on the inline script OK.

## 2026-10-22 — freshness
- LVK plan page updated 16 Oct 2026: IR1 moved from November 2026 to mid-January 2027; status, note, timeline and ref 19 updated. Next page update due 15 Nov 2026 (in ../../freshness.json).
