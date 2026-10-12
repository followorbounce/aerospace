# DARK — Euclid & Roman: mapping dark matter and dark energy

- **Purpose:** explain how dark matter and dark energy were inferred and how Euclid and Roman will map them, with three instruments that compute from real data or standard cosmology.
- **Audience:** interested non-specialists, plus students who want to see the numbers work.
- **Owner:** Wave 6 author team, 2026-10-11.
- **Structure:** 8 chapters, counting LEGACY and REFERENCES (lede: "Eight chapters and three instruments"); 23 references; 11 timeline rows; 48 checks in `checks.js`.

## Instruments

1. **A dark halo for NGC 3198 (CH.02).** Uses real data from the SPARC `NGC3198_rotmod.dat` table, downloaded 11 Oct 2026; raw copy in `~/.cache/aero-src/w6dark/rot/`.
   - The table gives V_obs ± err, V_gas and V_disk at Υ = 1 (3.6 µm).
   - The user sets Υ. A pseudo-isothermal halo is fitted by weighted least squares in v², with ρ₀ solved linearly for each trial R_c on a 401-point log grid.
   - At Υ = 0.5: R_c = 2.66 kpc, ρ₀ = 0.053 M☉/pc³, χ²/dof = 1.22.
   - Mass inside 44.08 kpc is 2.28 × 10¹¹ M☉; visible matter is 4.3 × 10¹⁰ M☉, so 81 % is dark.
   - Kepler from the visible mass inside 14 kpc gives 51 km/s at 44 kpc, against 149 km/s observed.
   - Masses use v²R/G, which is exact only for a sphere; the page says so.
2. **How far is the supernova? (CH.03).** Luminosity distance for any (Ω_m, Ω_Λ), with curvature (sinh/sin) and Simpson's-rule integration; Δμ is measured against the empty universe; age comes from ∫2u²du/√(Ω_m + Ω_k u² + Ω_Λ u⁶).
   - Bounced universes (E² ≤ 0 somewhere in the past) are detected through the age integral and reported as "no Big Bang".
   - Checked against the Planck age (13.801 vs 13.797 Gyr), the Einstein–de Sitter closed forms and an independent midpoint integration.
   - **Judgment call:** Planck 2018 gives a supernova at z = 0.5 about 8.4 % farther than the Ω_m = 0.2, no-Λ comparison universe, while Riess 1998 measured 10–15 %. The page states both and labels which is the model and which the measurement.
3. **Why a billion galaxies (CH.04).** Shape noise σ_ε = 0.26 (Euclid overview), S/N = γ√N/σ_ε, and a sky-area conversion at Euclid's implied density of 1.5 × 10⁹ / 14,000 deg² = 29.8 per arcmin².
   - The drawing shows 48 seeded random ellipses with the true-scale shear, plus a gauge (true shear, sample mean, ±1σ for N).
   - Presets set exact log10(N) values; helpers.js keeps them exact and check-all confirms no off-step sliders.

Initial slider values for Ω_m, Ω_Λ and N are set from the script, because browsers round an off-step `value` attribute (0.3153 → 0.32).

## Key numbers and sources

| Number | Source |
|---|---|
| 4.9 / 26.5 / 68.5 %, ratio 5.4, H₀ 67.36 | Planck 2018 VI [2]: Ω_b h² 0.02237, Ω_c h² 0.1200, Ω_Λ 0.6847 — computed and checked |
| "at least 400 times", "dark matter… much greater density", 558 km/s/Mpc (Hubble & Humason 1931, as quoted) | Zwicky 1933 English translation [1] (checked in the PDF text) |
| 67 H II regions, 3–24 kpc, mass ∝ R to 14 kpc | Rubin & Ford 1970 [3] — from the abstract |
| 21 Sc galaxies, radii 4–122 kpc, none falling, most still rising | Rubin, Ford & Thonnard 1980 [4] — from the abstract |
| 10–15 % farther; 7σ / 9σ with a flat prior, 3.0σ / 4.0σ without | Riess 1998 abstract [8] |
| 42 SNe, z 0.18–0.83, Ω_M = 0.28 | Perlmutter 1999 abstract [9] |
| Shear "a few percent" | Kilbinger 2015 review [10], §1 text |
| Launch 1 July 2023, 17:12 CEST, Falcon 9 | ESA release [12] |
| 1.2 m, 0.54 deg², 14,000 deg², 1.5 billion shapes, 35 million redshifts, σ_ε 0.26, w to ~1 %, survey start 14 Feb 2024, WFC3 4.5′², NIRCam 9.7′² | Euclid overview [13] (full HTML text grepped) |
| 63.1 deg², ~30 million objects | Q1 overview [14] |
| DR1 in two stages: Nov 2026 (~1,900 deg²), mid-2027 | ESA DR1 timeline, update of 15 June 2026 [15] |
| Roman launch 30 Aug 2026, 7:26 a.m. EDT, Falcon Heavy, LC-39A; first images by early 2027 | NASA release [16] |
| 2.4 m mirror | NASA FAQ [17] |
| 18 × 4096², 0.281 deg², ~200× WFC3-IR | NASA WFI technical page [18] |
| >5,000 deg², ~12 % of sky, < 1.5 years | NASA HLWAS page [19] |
| WFI heater off 11 Sep, detectors activated after cool-down (reported 15 Sep) | NASA Roman blog, 15 Sep 2026 [20] |
| Fine-guidance tests 15–21 Sep; coronagraph first light 22 Sep | NASA Roman blog, 30 Sep 2026 [21] |
| NGC 3198: 21 cm rotation curve to 11 scale lengths, dark ≥ 4× visible inside 30 kpc | van Albada et al. 1985 [7] (ADS PDF scan text) |
| SPARC adopts Υ = 0.5 at 3.6 µm | Lelli et al. 2016 abstract [5] |
| "mother of Hubble" | NASA Roman FAQ [17] |
| 3.1σ; 2.8 / 3.8 / 4.2σ | DESI DR2 [22] |
| 4.2σ → 3.2σ, "only a weak preference" | DES-Dovekie [23] |
| 1 in 370 / 15,800 / 1.7 million | Computed (two-sided Gaussian; erfc from the Numerical Recipes Chebyshev fit) |

## Assumptions and limitations

- The halo shape (pseudo-isothermal) is one common choice. NFW would fit somewhat differently, and the dark share depends on Υ: 74–85 % for Υ from 0.9 down to 0.3.
- The cosmology calculator ignores radiation and neutrinos, which matter only below ~0.1 % at z < 1.5; the w(z) of evolving dark energy is not modelled.
- The lensing instrument is a best case: no measurement noise, no sample variance, no calibration bias.
- Pointings to tile 1,000 deg² = area ÷ field, ignoring overlaps and gaps.

## Unverified / to re-check

- **Roman status** is dated 11 Oct 2026, from NASA's 15 and 30 Sep posts; re-checked 11 Oct 2026: still no post after 30 Sep. Re-check after L2 arrival and when the first science images appear (expected by early 2027).
- **Euclid DR1** dates are "November 2026" and "mid-2027", with exact dates not yet announced by ESA. Re-check in November 2026.
- **The Rubin papers** (scanned PDFs) were not read in full; the numbers come from their ADS abstracts. The two ui.adsabs abstract pages return 405 to scripts, so the references point at the articles.adsabs PDF scans (200).
- **NASA's "first images by early 2027"** comes from search summaries of NASA's release; the NASA URL itself returns 200.

## Wiring (for the coordinator)

- Codename: **DARK** / RU **ТЬМА**; category `telescopes`.
- Index label EN: `Euclid & Roman: Dark Matter and Dark Energy`; RU: `Euclid и Roman: тёмная материя и тёмная энергия`.
- llms.txt: `Dark matter and dark energy: Zwicky's 1933 cluster, a real dark-halo fit to galaxy NGC 3198 (SPARC data), the 1998 accelerating-universe supernovae in a luminosity-distance calculator, why weak lensing needs a billion galaxies (shape noise), ESA's Euclid (2023) and NASA's Roman (launched 30 Aug 2026), and DESI's evolving-dark-energy hints with their stated significance.`
- `python3 _tools/wire.py dark-euclid-roman DARK "Euclid & Roman: Dark Matter and Dark Energy" "Euclid и Roman: тёмная материя и тёмная энергия" telescopes "<llms line>"`
- Links out to `glow-cosmic-microwave-background` (GLOW / СВЕЧЕНИЕ) and `james-webb-space-telescope` (UNFOLD / РАЗВЁРТЫВАНИЕ). Wire GLOW in the same batch.

## Review fixes applied / declined (2026-10-11, REVIEW.md)

**MUST, applied (each has a check)**
1. `age()` handles Ω_m = 0 at u = 0 (integrand → 0 when Ω_k > 0): empty universe 14.516 Gyr = 1/H₀, Ω_Λ 0.5 → 18.093 Gyr; the live page no longer says "no Big Bang" for them.
2. Instrument 2 status branches on Ω_Λ > 0: Planck at z = 1.4 now explains the matter-era slowdown; the "1998 supernovae said otherwise" text stays only for Ω_Λ = 0. "Farther" branch softened as suggested.
3. Roman status: WFI switched on in mid-September [20, new: 15 Sep blog], coronagraph first light 22 September [21]; NASA expects "first science images" by early 2027 [16]. Timeline 2027 row and ref [21] note fixed. NASA Roman blog re-checked 11 Oct 2026: newest post still 30 Sep.
4. RU CH.04: «Первый взгляд на обзор Euclid в полную глубину дал в марте 2025 года быстрый выпуск данных Q1: …».

**SHOULD, applied**
- Rubin 1980: radii 4–122 kpc; none falls, most still rising.
- Neutrinos (≈ 0.14 %), not radiation, close the Planck sum.
- 1998: 7σ–9σ with flat prior, 3σ–4σ without (body + ref note).
- Hero: "Ordinary matter … about a twentieth"; "Two space telescopes are built to map it: Euclid, surveying since 2024, and Roman, launched 30 Aug 2026".
- Zwicky "took the measured speeds"; his H₀ is 558 km/s/Mpc (about eight times 67.4).
- van Albada, Bahcall, Begeman & Sancisi 1985 credited as new ref [7] (PDF scan read: 21 cm curve, dark ≥ 4× visible inside 30 kpc).
- Halo toggle, Instrument 2 direct curve labels, clip markers, darker legend text and the gauge label were already fixed in script.js before this pass (verified).
- Russian §4.2–4.12: Волос Вероники (body, timeline, ref), CH.01 heading, «Самую точную на сегодня оценку состава Вселенной», «СОСТАВ ВСЕЛЕННОЙ», Λ sentence agreement, «что-то его ускоряет», 150 km/s sentence, NISP and HLWAS terms, stray comma, «обычного вещества», «случайно», «с точностью около 1 %», «из Космического центра», «космическая дисперсия», RU kicker with decimal commas.
- NICE: 4σ written as 15,800 in both places; CH.05 heading "two hundred Hubbles' view"; kicker "ROMAN LAUNCHED 30 AUGUST 2026"; EUCLID WIDE preset caveat in the drawing note; SPARC's Υ = 0.5 stated in the Instrument 1 note; Nancy Grace Roman named with the FAQ's "mother of Hubble" wording.
- References renumbered in reading order (23 total): van Albada → [7], 15 Sep blog → [20].

**Declined / deferred**
- "NASA's first chief of astronomy": not added — the FAQ [17] does not state it; kept only the FAQ wording.
- Vera C. Rubin Observatory line (NICE, optional): not added — its survey status in Oct 2026 was not verified.
- Euclid DR1 "November 2026" left as is; re-check ESA's page (200 on 11 Oct) in November.
