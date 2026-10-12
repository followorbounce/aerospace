# GLOW — The cosmic microwave background (Wave 6)

**Purpose:** explain the CMB from discovery to precision cosmology, with every quoted number either sourced or computed and checked. **Audience:** interested non-specialists; the equations sit in eq-boxes for those who want them.
**Owner:** Wave 6 author team (fork), 2026-10-11. **Category:** `telescopes`.

## Structure
8 chapters, lede "Eight chapters and four instruments" (generated-guide convention: every chapter counts, REFERENCES included).
1. The hiss — Penzias & Wilson 1965, Dicke et al., the earlier prediction (Alpher & Herman; Doroshkevich & Novikov), Nobel 1978 (eq-box: 4,080 MHz = 7.35 cm).
2. Blackbody — **instrument 1:** Planck's law vs the 43 real COBE/FIRAS points (LAMBDA table), temperature slider, presets 2.72548 / 2.725 / 3.5 / 2.5 K; readouts peak frequency, Wien peak, photons/cm³, error-weighted RMS misfit.
3. Cooling — **instrument 2:** T = T₀(1+z) and the age at z from a flat ΛCDM integral (Planck 2018 densities + radiation), presets today / JADES-GS-z14-0 z 14.18 / z* / z_eq.
4. Ripples and motion — **instrument 3:** exact Doppler dipole vs speed, the ±30 µK ripple band to scale, and 1.1 × 10⁻⁵ applied to a ruler / Earth / Earth–Moon.
5. Sharper maps — **instrument 4:** a 10° × 10° simulated sky (128² flat-sky Gaussian random field, fixed seed) through COBE 7°, WMAP 13′, Planck 5′ or no beam, plus the ripple-strength chart before/after the beam.
6. Six numbers — acoustic scale, 18 peaks, ΛCDM parameters, flatness, the H₀ tension (Planck's own wording).
7. Legacy — timeline 1948–2018 (16 entries).
8. References — 20 sources.

## Sources per key number
- 3.5 K at 4,080 Mc/s, quote "isotropic, unpolarized…" — Penzias & Wilson 1965 [1]; interpretation — Dicke et al. 1965 [2]; Nobel citations [3][8] (fetched text).
- FIRAS points — LAMBDA firas_monopole_spec_v1.txt (Fixsen 1996 Table 4) [5], embedded verbatim (columns 1–4). < 50 ppm deviations, 2.728 ± 0.004 K, dipole 3.372 mK — Fixsen 1996 abstract [6].
- T₀ = 2.72548 ± 0.00057 K; FIRAS recalibrated on WMAP 2.7260 ± 0.0013 K — Fixsen 2009 abstract [7].
- DMR: 31.5/53/90 GHz, 60° separation, 7° FWHM — LAMBDA DMR page [4]; launch 18 Nov 1989 — NASA [18]; 30 µK at ~10° — Wright 1994 tutorial [9] (Smoot/Bennett 1992 not fetched directly).
- Planck: launch, scan dates, nine bands to 14 Jan 2012 (end of the cryogenic/HFI mission) and LFI to 23 Oct 2013, beams 32.29′ → 4.22′ (4.90′ at 217 GHz), dipole 3,362.08 ± 0.99 µK, 369.82 ± 0.11 km/s, (264.021°, 48.253°), 18 peaks, "over a billion map pixels" — Planck 2018 I PDF [10].
- H₀ 67.36, Ωm 0.3153, age 13.797 ± 0.023, z* 1089.92 ± 0.25, z_eq 3402, r* 144.43 Mpc — Planck 2018 VI Table 2 (PDF, TT,TE,EE+lowE+lensing) [11]; 100θ* = 1.0411 ± 0.0003, ΩK = 0.001 ± 0.002 (with BAO), H₀ tension wording — its abstract.
- WMAP: launch 30 Jun 2001, science data to 19 Aug 2010, "0.2 degree" map — NASA [12]; 13′ FWHM, 33× COBE resolution — LAMBDA [13]; first peak ℓ 220.1 ± 0.8 / 74.7 µK, trough 411.7 / 41.0 µK, second peak 546 / 48.8 µK — Page et al. 2003 abstract [14].
- FIRAS's 2.725 K absolute scale — Fixsen & Mather 2002 (ApJ 581, 817), the LAMBDA file's second reference, noted under [5]. ESA's Planck page [17] is cited only as the mission page.
- Prediction history — Penzias's 1978 Nobel lecture [19] (Alpher & Herman 1949 "a few degrees Kelvin"; Doroshkevich & Novikov 1964 and the Crawford Hill horn). RELIKT-1 on Prognoz 9 (1 Jul 1983, 37 GHz, dipole, 17–95 µK quadrupole at 90 %) — NASA LAMBDA [20]. Both were opened and quoted by the review panel; the author team took the wording from REVIEW.md §6 and did not re-open them. WMAP's naming after David Wilkinson — NASA [12] (also per the panel).
- Constants h, k, c, b — NIST [15]; Moon 3,474.8 km at 384,400 km (0.518°) and Earth 12,742 km — NSSDC [16].

## Computed (and checked in checks.js, 56 checks)
Peak 160.23 GHz, Wien 1.0632 mm, 410.7 photons/cm³; peak brightness 383.67 MJy/sr; FIRAS best fit 2.72502 K with error-weighted RMS misfit 18.9 kJy/sr (49 ppm of the peak; 51 ppm at exactly 2.725 K; the panel's 19.8 used the integer residual column), 173.7 kJy/sr (0.045 %) at 2.72548 K; every FIRAS point equals the 2.725 K blackbody + its residual to 0.008 MJy/sr; age today 13.795 Gyr (Planck 13.797 — neutrino masses ignored), at z* ≈ 371,000 yr (+28.9 % if radiation is dropped), at z 14.18 ≈ 290 Myr; T(z*) = 2,973 K; Ωm/Ωr − 1 = 3,419 vs Planck z_eq 3,402; dipole T₀v/c = 3.36212 mK, exact extremes +3.3642 / −3.3600 mK, 1 part in 811, 112× the 30 µK ripples; 30 µK/T₀ = 1.10 × 10⁻⁵ (Earth → 140 m); beam responses at ℓ 220: COBE ~10⁻²⁹, WMAP 0.939, Planck 0.991; FFT round trip; simulated-sky rms within 7 % of its spectrum (90.8 vs 97.5 µK; checked to 8 %); COBE's beam leaves 2.6 µK on the patch, whose lowest mode is ℓ = 36; UI presets render without NaN in both languages.

## Assumptions / limitations
- Age integral: flat ΛCDM, Planck densities, radiation from T₀ with N_eff = 3.046 massless neutrinos, no neutrino mass — hence 13.795 vs 13.797 Gyr.
- "Last scattering ≈ 370,000 years" is our integral (371,207 yr), not a quoted Planck figure (the paper's table gives z*, not t*).
- The sky patch is **not** the real sky: a random field whose spectrum passes exactly through WMAP's three measured points; everything else on that curve (low-ℓ plateau ~30 µK, beyond ℓ 546, third peak) is a labelled illustrative interpolation. Flat-sky approximation over 10°; 4.7′ pixels, so Planck's 5′ beam is near the pixel limit.
- Dipole drawn against angle from the direction of motion, not as a sky map.
- The FIRAS table's absolute scale is 2.725 K; the page explains why 2.72548 K fits slightly less well (still 0.04 %).

## Unverified / judgment calls
- Smoot et al. 1992 and Bennett et al. 1992 not opened; the 30 µK figure is cited to Wright's 1994 COBE tutorial, which quotes them.
- "April 1992" date removed (not in an opened source); timeline says 1992.
- Did not claim a value for t* from Planck; did not add successor missions (LiteBIRD, Simons Observatory, CMB-S4) because their October 2026 status was not verified.
- Moon and Earth sizes are 2 × the volumetric mean radii on the NSSDC Moon fact sheet (1,737.4 and 6,371.0 km); Earth–Moon 384,400 km is its 0.3844 × 10⁶ km semimajor axis.
- Russian codenames: GLOW → «СВЕЧЕНИЕ».

## Wiring (for the coordinator)
- Index label EN: `The Cosmic Microwave Background: COBE, WMAP & Planck` · RU: `Реликтовое излучение: COBE, WMAP и «Планк»` · codename `GLOW`, category `telescopes`.
- `wire.py glow-cosmic-microwave-background GLOW "The Cosmic Microwave Background: COBE, WMAP & Planck" "Реликтовое излучение: COBE, WMAP и «Планк»" telescopes "<llms line>"`
- llms.txt: `The cosmic microwave background from Penzias & Wilson's 3.5 K hiss to Planck: Planck's law fitted to the real 43-point COBE/FIRAS spectrum (2.725 K, < 50 ppm), T = T₀(1+z) and the age at last scattering (~370,000 yr) from Planck 2018 densities, the 3.36 mK dipole from our 370 km/s motion and the 1-in-100,000 ripples, and a simulated sky patch seen through COBE 7°, WMAP 13′ and Planck 5′ beams with WMAP's first peak at ℓ = 220.`

## Review fixes applied / declined (REVIEW.md, 2026-10-11)

**MUST, applied (each has a check)**
1. FIRAS misfit is now error-weighted, √(Σ(d/σ)²/Σ(1/σ²)), as FIRAS did: 18.9 kJy/sr (49 ppm) at the best fit, 174 kJy/sr (0.045 %) at 2.72548 K. Note, status (computed % and ppm, now citing [5]) and checks updated, EN + RU; check asserts < 55 ppm.
2. COBE sky-patch status rewritten (smoothed almost flat, rms shown live ≈ 3 µK; the ~30 µK swells COBE saw are larger than the patch); note adds "A 10° patch holds only scales smaller than itself (ℓ ≳ 36)", EN + RU.
3. Button relabelled "JADES-GS-z14-0 z 14.18" (EN/RU); note says the record has since passed to MoM-z14 at z = 14.44, consistent with the Webb guide.
4. Prediction credited in CH.01: Alpher & Herman (late 1940s, after Gamow) and Doroshkevich & Novikov (1964, Crawford Hill horn), new ref [19] Penzias Nobel lecture; timeline entries 1948–49 and 1964.
5. `aria-valuetext` on bbT, cvZ ("z = 1,090, 371,000 years") and dpV, mirroring the readouts.

**SHOULD, applied**
- Hero: "one part in a thousand — and, once our own motion is taken out, one part in a hundred thousand".
- "two engineers" → "two radio astronomers" (lede and CH.07 quote, EN + RU).
- RELIKT-1 paragraph in CH.04 + ref [20] + 1983 timeline entry (not called "the first detection").
- Planck: nine bands until January 2012, three lowest until 23 October 2013; beams "about 5′ in its main CMB channels (4.90′ at 217 GHz; down to 4.2′ at 857 GHz)"; ref [10] note and a 2012 + revised 2013 timeline entry.
- θ* vs 0.8° clause in CH.06; ℓ defined at first use in CH.05, repeat trimmed.
- "Off by" status: below 15 mK it says the curve still looks close but the misfit is N × FIRAS's typical error (N = misfit ÷ 20 kJy/sr); far off it keeps "no longer sit on the curve".
- Status cites [5] instead of [6]; Fixsen & Mather 2002 added to [5]'s note.
- Ref [17]: "third-generation" claim removed; now cited only as ESA's mission page next to "ESA's Planck".
- Ripple chart x-axis title "multipole ℓ (log; ≈ 180°/ℓ)".
- Russian: Cyrillic «К» everywhere after numbers (body, readouts, statuses, timeline, refs; a check scans for Latin K); tenses fixed in CH.03 (EN too); «свободным от сезонных колебаний» (body and ref [1]); hero sentence; «начальным значением генератора случайных чисел»; the 5′ pixel note; «1/811»; the 2006 Nobel wording matches ref [8]; four-digit numbers unspaced in RU readouts via a local num() (2973 К, 1906); «Отклонение»; «ВСЕ ИЗМЕРЕНИЯ 2,72548 К» (EN "ALL MEASUREMENTS"); «луч (диаграмма направленности антенны)» glossed once.

**NICE, applied:** dipole band "thinner than a pixel, which is the point" (status and note); checks label agrees with NOTES (8 %); ref [4] launch date removed (now [18]); H₀ editorial sentence replaced by "Planck's data alone cannot say which side is off"; 380,000 clause; "seeds of all cosmic structure"; "hot, dense and opaque throughout … such a perfect, uniform one"; links to the James Webb guide; half of the 1978 prize, other half to Kapitsa (body, timeline, ref [3]); WMAP named after David Wilkinson [12]; ref [11] note says "abstract (full version)".

**Declined / deferred**
- Sunyaev–Zeldovich distortion limits (NICE §6.5): needs its own source; not added.
- Canvas aria-label with live beam/rms (NICE §5.3) and an "(band ±30 µK, to scale)" chart label (NICE §5.4): the live status and the note already carry both.
