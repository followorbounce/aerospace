# BURST — Gamma-ray bursts: Swift & Fermi (Wave 6)

**Purpose.** Explain what gamma-ray bursts are and how we know, through four instruments that compute with real or published numbers.
**Audience.** Interested non-specialists; secondary-school physics is enough.
**Owner.** Wave 6 author team (2026-10-11). Category `telescopes`.

## Structure
9 chapters, lede "Nine chapters and four instruments" (counts every chapter including REFERENCES).
1 Vela (1967–1973) · 2 BATSE isotropy — **Instrument 1** disk-vs-everywhere sky model · 3 Two families — **Instrument 2** 4,391 real Fermi T90 values · 4 Swift BAT coded mask, Fermi GBM/LAT, instrument table · 5 Distance and energy — **Instrument 3** E_iso and age from fluence + redshift · 6 Beaming — **Instrument 4** jet angle → true energy · 7 Swift's last orbits (dated status) · 8 LEGACY timeline · 9 REFERENCES (26).

## Sources per key number
- Vela 4a/4b launched 28 Apr 1967, first burst 2 Jul 1967, CGRO 5 Apr 1991, BATSE isotropy 1992, BeppoSAX 1997 (z = 0.835), Swift 20 Nov 2004, Fermi 11 Jun 2008 — HEASARC history [2].
- 16 bursts, 0.2–1.5 MeV, <0.1–30 s, Jul 1969–Jul 1972 — Klebesadel et al. 1973 abstract (INSPIRE) [3].
- 2,704 BATSE bursts, isotropic, no dipole/quadrupole, faint-burst deficit — HEASARC CGRO page [4].
- Two classes split at 2 s, short harder — Kouveliotou et al. 1993 abstract (INSPIRE) [5].
- **T90 data**: HEASARC TAP query of FERMIGBRST on 11 Oct 2026: `SELECT name,trigger_time,t90 FROM fermigbrst` → 4,392 rows, 4,391 with T90 > 0, triggers 14 Jul 2008 – 8 Oct 2026; 741 below 2 s. Binned at 0.05 dex in script.js; exact 2 s count stored separately and checked.
- 2003 hypernova — Hjorth et al. 2003 [8]. GW170817/GRB 170817A: 1.74 s delay, 42.9 Mpc, E_iso 3–5e46 — Abbott et al. 2017 [9] (read from the PDF).
- BAT: 15–150 keV, 1.4 sr half-coded, 32,768 CZT, ~54,000 lead tiles, 4′, seconds — NASA BAT page [10]. GCN tables for XRT/GBM/LAT bands, FOV, rates [11][12] (GCN gives GBM as 8 keV–30 MeV; Lesage's abstract says 8 keV–40 MeV; the page uses GCN).
- GRB 221009A: fluence ≈ 0.22 erg/cm², E_iso ≈ 1.2e55 (Frederiks [14]); GBM E_iso 1.0e55 (Lesage [13]). Model gives 1.27e55 (+6 %).
- GRB 080916C: fluence 2.4e-4 erg/cm² (10 keV–10 GeV; Abdo 2009 [17], widely cited — the Science DOI blocks scripts, value confirmed via citing papers), E_iso 8.8e54 (Tajima [18]). Model 8.80e54.
- GRB 090423: z ≈ 8.2, ~630 Myr (Tanvir [15]); fluence 1.1e-6 (GCN 9229 [19]); E_iso 1.03e53 at z = 8.1 (GCN 9235 [20]). Model 1.005e53 at z = 8.1; age at 8.2 = 617 Myr.
- Planck 2018: H0 67.36, Ωm 0.3153 [16]; model age today 13.80 Gyr.
- Frail 2001: 5e50 erg cluster [21].
- Swift status: blog 28 Aug [23] and 25 Sep 2026 [25]; LINK ended 25 Sep, re-entry expected this year (SpacePolicyOnline [24]); Swift table 1,765 GRBs [22]. SVOM 22 Jun 2024 [26].

## Assumptions and limitations
- E_iso uses no k-correction; disclosed in the eq-note; within 6 % of the three published values.
- Instrument 1 is an illustration (uniform sphere ∩ slab), not BATSE data; analytic ⟨sin² b⟩ = k²(1/3 + ln 1/k)/(1.5 − 0.5k²), k = h/D, verified by Monte Carlo.
- Instrument 4's jet angle is user-chosen; no jet angle is claimed for the preset bursts.
- Direction-from-timing arithmetic (0.03 s → ~5° at D = 10⁵ km) is illustrative, not Vela's actual timing precision.
- The T90 chart is GBM's sample, which under-represents short bursts relative to BATSE (stated on the page; trigger bias is standard knowledge but not separately cited).

## Unverified / judgment calls
- **Swift status is time-critical**: as of 11 Oct 2026 the latest NASA post is 25 Sep (325 km, crossing 300 km expected early–mid October). Re-check before publishing and after any NASA update; Swift may already have stopped observing.
- "Vela launched in pairs" (LANL) — no launch year for the first pair is given on the page (1963 not cited).
- Klebesadel 1973 and Kouveliotou 1993 cited via INSPIRE (ADS returns 405 to scripts); Abdo 2009 via DOI (403 to scripts, resolves in browsers).
- Swift GRB count: stats page shows 1,765 with a stale "last updated" date; the page says only "more than 1,700".
- Not done: screenshots at 1300/390 px (central pass), real-device touch.

## Wiring (for the coordinator)
- Index label EN: `Gamma-Ray Bursts: Swift & Fermi` · RU: `Гамма-всплески: Swift и Fermi` · codename `BURST` · category `telescopes`.
- llms.txt: `Gamma-ray bursts from Vela to Swift and Fermi: an isotropy model of why an even sky meant cosmological distances, 4,391 real Fermi GBM durations split into short and long families, Swift's coded mask, isotropic energy and cosmic age from fluence and redshift (GRB 221009A ≈ 10^55 erg, GRB 090423 at z ≈ 8.2), jet beaming, and Swift's decaying orbit as of October 2026.`
- Links out to `ripple-gravitational-waves` (RIPPLE / РЯБЬ) — wire RIPPLE in the same batch or the link 404s.

## Response to review (2026-10-11)
Panel verdict APPROVE WITH CHANGES; all 4 MUST-FIX done. check-all ALL OK, 44 checks (was 33); node --check passes. 28 references (two added; citations renumbered by first appearance).

**MUST-FIX**
1. Instrument 1 note no longer mentions a band: "the readout's ± range is 2 standard errors of an even sky (600 sources)" (EN/RU).
2. Instrument 3 now loads in the exact GRB 221009A preset (`enZ`/`enS` set before the first render). A check re-loads the page in a fresh jsdom and asserts "PUBLISHED 1.20 × 10⁵⁵" and the % status on load.
3. RU status: «… эрг — на N % отличается от опубликованного значения …» (checked).
4. `aria-valuetext` on every slider, mirroring the displayed value (skyD, t90Cut, enZ, enS, jetE, jetT); a fresh-load check asserts all have it.

**SHOULD, applied**
- LINK: "the boost was called off on 19 August [25], and LINK itself re-entered on 25 September [26]"; new ref [25] = NASA blog 19 Aug 2026. Timeline 2026 entry updated.
- 2003: the long burst "was followed, at the same spot, by a very energetic supernova that had exploded within a few days of it" (body + timeline).
- Lede: "About once a day"; "from distant galaxies across the universe".
- GRB 970508: Keck absorption system at z = 0.835, "so the burst was at least that far" — new ref [13] Metzger et al. 1997 (Caltech record). Timeline updated.
- "about six to seven times" (checks cover 6.7 and the model's 7.1).
- Short-burst wording: "a small hump just under a second and a much larger one near half a minute"; checks locate the short-side maximum (0.63–1 s bin) and its size.
- GBM short-fraction reason reworded as "a likely reason … detectors respond to lower energies" (not cited — von Kienlin 2020 not confirmed to state it; flagged as likely).
- Grey straddling bar explained in the T90 note.
- GRB 090423 comparison now computed at the published z = 8.1 (≈ 2 %); published z printed with its own digits (8.1, 4.35, 0.151).
- RU: «сквозь зеркала», «половина ячеек открыта», «охватывает около 1,4 ср неба», джет-брейк wording, table terms («телескоп с конверсией в электрон-позитронные пары», «по наводке BAT»), «Вела-4А/4Б», halo clause; four-digit numbers ungrouped in readouts (num()) to match the body.
- Button-group aria-labels translated (checked in RU).
- Checks added for 0.0096 label, Δθ ≈ 5°, 17 % within 10°, 140 million light-years.
- Tanvir ref note explains the preprint's "8.3" title vs the Nature "≈ 8.2".

**Declined / deferred**
- Lowercase "2 с (условно)": buttons are uppercase site-wide in both languages; kept.
- Partial Test Ban Treaty clause: not added (the cited LANL page doesn't name it).
- Meegan/Fishman names for 1992: not added (the cited HEASARC entry is enough; no extra source opened).
- SVG aria-label with live values (NICE): aria-live statuses already carry the values.

**Swift blog re-checked 11 Oct 2026:** newest post still 25 Sep; nothing newer. Re-check again on the day of publishing.
