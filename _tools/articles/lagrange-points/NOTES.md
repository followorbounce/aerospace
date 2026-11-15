# EQUILIBRIUM — Lagrange points (Wave 9 rebuild)

**Purpose:** the circular restricted three-body problem done properly, replacing the hand-made page at the same slug:
rotating frame and effective potential, an exact solver for L1–L3 beside the leading-order formulas and their error,
L4/L5 and the stability limit, halo/Lissajous orbits and what station-keeping costs, Trojans, and a dated register of
missions at Sun–Earth L1/L2 and Earth–Moon points. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes; models labelled as models.
**Owner:** Wave 9 author (agent), 2026-11-14. **Category:** foundations. Codename EQUILIBRIUM / РАВНОВЕСИЕ (unchanged).
Neighbours not duplicated: UNFOLD (`james-webb-space-telescope`, Webb's orbit and propellant), PARALLAX (`parallax-gaia-mission`),
DARK (`dark-euclid-roman`), HALO (`the-lunar-gateway`, NRHO and Gateway's status), RABBIT (`rabbit-change-far-side`, Queqiao's halo
and its own Earth–Moon L2 solver), GLOW (WMAP/Planck). All are linked, none of their instruments is rebuilt.

## What changed against the hand-made page
- 10 chapters → 9 (L1, L2, L3 chapters merged into one chapter with the exact solver). No other page links to an in-page
  anchor of this guide (`grep -r "lagrange-points#"` over the repo: no hits), ids `ch1`…`ch9` and `hero` kept.
- The leading-order calculator is replaced by an exact solver; the schematic (not computed) contour figure by a computed
  zero-velocity map; the L3 values of the 2026-11-14 fix (187 km / 262 km / 449 km) are reproduced and checked.
- References added (39 after the review round); mission register runs to Roman (2026).

## Outline (9 chapters, lede "Nine chapters and four instruments")
1. The problem — three bodies, the restricted problem, Euler (1763/1767) and Lagrange (1772) credited separately.
2. The rotating frame — effective potential, Jacobi constant, zero-velocity curves. **Instrument 1**: computed zero-velocity map.
3. The collinear points — the quintic, exact roots vs leading order. **Instrument 2**: exact solver with presets and error chart.
4. The triangular points — exact positions, linear stability, Gascheau/Routh limit. **Instrument 3**: eigenfrequencies vs μ and a linearised path.
5. Halo and Lissajous orbits, station-keeping. **Instrument 4**: published annual Δv, propellant by the rocket equation, error growth from the computed e-folding time.
6. Natural occupants — Jupiter Trojans (MPC counts), Earth/Mars/Neptune Trojans, Tethys's co-orbital moons, Lucy.
7. Missions — dated register (rendered from data in script.js, filter by point).
8. Legacy — timeline. 9. References.

## Sources per number (retrieved 2026-11-14 unless noted)
- [1] Koon, Lo, Marsden, Ross, *Dynamical Systems, the Three-Body Problem and Space Mission Design* (online edition 12 Oct 2022,
  full text read): Table 2.2.1 μ and L; quintic (2.5.2) and series (2.5.3); Sun–Jupiter example r_h = 6.825e-2, γ1 = 6.666e-2 (3rd order),
  6.668e-2 (exact), x_L1 = 0.9324; μ0 ≃ 0.038521; Sun–Earth L1 γ1 = 1.001090475e-2 = 1.497610041e6 km; ω_p = 2.086453455,
  ω_v = 2.0152105515; "Euler [1767] discovered L1, L2, L3 just a few years before Lagrange [1772] discovered L4 and L5"; Clarke 1950
  lunar L2 relay; Farquhar 1966 named the halo orbit; Breakwell & Brown 1979, Howell 1984 halo families; Lyapunov orbits.
- [2] Euler Archive E327: written 1763, published 1767, Novi Commentarii 11, 144–151. [3] Bistafa translation (arXiv:2104.13373): quintic; presented Dec 1763 (search summary of the PDF).
- [4] NASA Science "What is a Lagrange Point?" (27 Mar 2018, updated 1 Nov 2024): Lagrange's 1772 Essai; "unstable on a time scale of approximately 23 days"; "mass ratio … exceeds 24.96"; L3 hidden.
- [5] Sicardy 2010 (Celest. Mech. Dyn. Astron. 107, 145): Gascheau 1843 precedence, value 0.0385208…; Routh 1875 (search summary + arXiv abstract; hal page blocked).
- [6] NSSDC fact sheets (Sun 1,988,400; Earth 5.9722; Moon 0.07346; Jupiter 1,898.13; Pluto 0.01303 ×10²⁴ kg; Charon 1.586 ×10²¹ kg;
  a: Earth 149.598, Jupiter 778.479 Gm; Moon 0.3844 Gm; Charon 19,596 km; periods 365.256, 4,332.589, 27.3217, 6.3872 d; synodic month 29.53 d).
- [7] Siddiqi, *Beyond Earth* (NASA SP-2018-4041, full text read): ISEE-3 (launch 12 Aug 1978, halo 20 Nov 1978, first libration-point
  spacecraft, left from 10 Jun 1982), Wind (1 Nov 1994, back at L1 by 2004), SOHO (14 Feb 1996, about six months per orbit), ACE (25 Aug 1997),
  WMAP (30 Jun 2001, L2 1 Oct 2001, first at SE L2, graveyard Oct 2010), Genesis (8 Aug 2001, halo 16 Nov 2001, left 22 Apr 2004, capsule 8 Sep 2004),
  Herschel/Planck (14 May 2009; mid-July and 3 Jul 2009; 29 Apr 2013; 23 Oct 2013), ARTEMIS P1 (EM L2 25 Aug 2010, "61,300 km above the lunar surface",
  first at an Earth–Moon point) and P2 (EM L1 22 Oct 2010), Chang'e 2 (SE L2 25 Aug 2011 – 15 Apr 2012, 180-day Lissajous), Gaia (19 Dec 2013; 8 Jan 2014;
  263,000 × 707,000 km, 180 d), Chang'e 5-T1 (EM L2 27 Nov 2014 – 4 Jan 2015, 14-day period), DSCOVR (11 Feb 2015; L1 8 Jun 2015),
  LISA Pathfinder (3 Dec 2015; L1 22 Jan 2016), Hiten through EM L4/L5 after 2 Oct 1991.
- [8] Roberts 2011 (NTRS 20110008638, read): SOHO halo ≈178 d; doubling time ≈16 d; burns about every three months; ≈1.0 m/s per year for ACE and Wind; at L1 since 1997, 1996, 2004.
- [9] Folta, Woodard, Cosgrove 2011 (NTRS 20110015252, read): P1 7.39 m/s/yr at L2, 5.28 at L1; P2 5.09; weekly manoeuvres; lunar orbit 27 Jun / 17 Jul 2011.
- [10] Davis et al. 2020 (NTRS 20200000733, read): NRHO 9:2, period mean 6.56 d (6.26–6.76), perilune radius 3,366 km mean, apolune ≈71,100 km; mean annual cost ≈0.9–1.0 m/s in simulation, up to 2.3.
- [11] Folta & Vaughn 2004 (NTRS 20040171140, read): cm/s per year at L3–L5 to tens or hundreds of m/s at L1/L2 in early studies.
- [12] NASA Webb orbit page: 1.5 million km, about 6 months, similar in size to the Moon's orbit, out of Earth's and the Moon's shadows.
- [13] Logan et al. (NTRS 20230018630, read): launch 25 Dec 2021, L2 orbit insertion 24 Jan 2022.
- [14] ESA "What are Lagrange points": L1/L2 1.5 million km. [15] ESA Gaia passivation 27 Mar 2025. [16] ISRO: PSLV-C57 2 Sep 2023, HOI 6 Jan 2024, 177.86 d.
- [17] JHUAPL: IMAP launch 24 Sep 2025, final manoeuvre confirmed 10 Jan 2026. [18] NOAA: SWFO-L1 final burn 23 Jan 2026, renamed SOLAR-1.
- [19] NASA Roman launch page (updated 8 Sep 2026): 30 Aug 2026, 7:26 a.m. EDT; "three-month, million-mile journey".
- [20] NASA CAPSTONE page (updated 26 Jun 2026): launch 28 Jun 2022, NRHO insertion 13 Nov 2022, first spacecraft in a cislunar NRHO.
- [21] Planetary Society (L. Xu, 15 Jun 2018): Queqiao entered its halo orbit 14 Jun 2018, about 65,000 km from the Moon.
- [22] MPC Trojan lists (lists dated 30 May 2026, downloaded 14 Nov 2026): Jupiter L4 9,823 + L5 5,942; Mars 2 + 16; Neptune 28 + 7; Earth list: 2020 XL5 (L4).
- [23] JPL SBDB: 588 Achilles discovered 1906-Feb-22 by M. Wolf at Heidelberg. [24] Fleming & Hamilton 2000 (read): libration period ∼150 years.
- [25] Connors, Wiegert & Veillet 2011 (Nature 475, 481; title page opened). [26] Santana-Ros et al. 2022 (Nat. Commun. 13, 447; title page opened).
- [27] NASA Lucy page: launch 16 Oct 2021; Dinkinesh 1 Nov 2023; Donaldjohanson 20 Apr 2025; Eurybates 11 Aug 2027 … Patroclus 3 Mar 2033; eight Trojans.
- [28] NASA Telesto page: Telesto and Calypso share Tethys's orbit, Calypso about 60° behind. [29] NASA MSFC ART-XC page: SRG launched 13 Jul 2019, halo orbit about SE L2.
- [30] ESA Vigil page: planned for launch in 2031. [31] Parrish et al. 2020 (NTRS 20200011550, read): 9:2 NRHO maintained for "a few meters per second per year".

- Added in the review round (opened 15 Nov 2026): [32] Folta & Woodard, NASA Goddard feature of 14 Sep 2010 as reposted by Phys.org ("each about 61,300 km (38,100 miles) above the lunar surface");
  [33] Xinhua via CASC ("the world's first communication satellite operating in that orbit"); [34] Howell & Breakwell 1984 (Crossref record);
  [35] ESA "Last command" (LISA Pathfinder, 19:57 CEST on 18 July 2017); [36] MPE, 22 Oct 2019 (Spektr-RG reached L2 on 21 October, 100 days after launch);
  [37] ESA Euclid page (launch 1 July 2023) and ESA Euclid news archive, 28 Jul 2023 ("arrived"); [38] NASA Roman blog, 14 Sep 2026 ("approximately 100 days after launch, or about early December");
  [39] CGTN via CASC, updated 9 Feb 2026 (Xihe-2 to Sun–Earth L5 between 2028 and 2029). Also re-opened: ISRO [16], ESA Gaia [15], NOAA press kit [18], Planetary Society [21] (launch 21:28 UTC 20 May 2018).

## Assumptions / limitations
- Everything is the **circular restricted three-body problem**: two bodies on circular orbits, a massless third. Real systems have
  eccentric orbits (Moon e ≈ 0.055), a fourth body (the Sun for Earth–Moon; Jupiter and Venus for Sun–Earth L3–L5) and solar radiation pressure.
- "Sun–Earth" preset = Earth alone (reproduces the commonly quoted 1.4916 / 1.5015 million km and the L3 fix); "Sun–(Earth+Moon)" adds the Moon's mass (Koon's convention).
- Instrument 3's path is the linearised motion (valid only close to L4); it is not a tadpole or horseshoe orbit.
- Instrument 4: annual Δv is published data (flown for ACE/Wind/ARTEMIS, simulated for the NRHO); propellant = Tsiolkovsky with the reader's mass and
  specific impulse (assumptions, not mission values); error growth e^(t/τ) with τ from the linearised collinear point, no eccentricity, Sun or radiation pressure.

## Computed (checks.js, 101 checks after the review round, all PASS)
Mass parameters from NSSDC masses; force balance zero at all roots over the slider range; bisection = Newton on the quintic to 1e-10;
Koon's worked example (r_h 6.825e-2, γ1 6.668e-2, series 6.666e-2, x_L1 0.9324); Sun–(Earth+Moon) L1 γ1 1.00110e-2 vs Koon 1.001090475e-2
(8e-6 relative, from the slightly different μ), ω_p 2.0865 / ω_v 2.0152 vs Koon; Sun–Earth L1 1.4916, L2 1.5015 million km; L3 187 / 262 / 449 km
(the 2026-11-14 fix, exact and leading order); Earth covers 85 % of the Sun from the exact L2; Hill-formula errors 0.3 / 2 / 5–6 / 11 %;
Earth–Moon 58,020 and 64,515 km, roots 0.8369 / 1.1557 / −1.0051, Hill value 61,274 km vs NASA's 61,300; C(L4) = 3 − μ(1 − μ), gate order;
contour tracer on a circle; μ_crit 0.0385209, ratio 24.96; Jupiter long period 147.4 yr vs ∼150 published; e-folding 23.0 / 23.4 d (NASA: about 23),
doubling 15.9 d (Roberts: about 16); L1 periods 175.1 / 181.3 d bracket SOHO's 178 d and Aditya's 177.86 d; L2 177.6 / 184.0 d; Moon L1/L2 e-folding
1.48 / 2.01 d; Moon L2 in-plane period 14.7 d vs Chang'e 5-T1's 14 d; 2 × 29.53 / 9 = 6.56 d; rocket-equation limits; MPC sums; date intervals.

## Checked visually
Own headless-Chrome captures at 1300 px (EN) and 390 px (RU) into the scratch folder (shot.sh was not run, per the brief). Fixed after looking:
Greek letters upper-cased by label CSS (`.lc`), solver labels under the dashed guides, L3 rows shown to the kilometre, chart labels that
collided on phones removed in favour of the note, mission-table point column kept on one line.

## Unverified / judgment calls
- **Gascheau 1843 / Routh 1875**, **Earth Trojans at L4** and **Euclid's launch date**: open in the first draft, settled in review (reviewer B read Sicardy's full text, both Nature abstracts and the ESA Euclid page; see REVIEW-B and the response below).
- **Bistafa [3]**: abstract read; "presented December 1763" comes from a search summary, the page says "written in 1763" (Euler Archive [2]).
- **JWST station-keeping Δv per year** could not be confirmed from a primary source (a search summary gave 24.88 m/s over 10.5 years), so Webb is
  not among the station-keeping cases. Likewise SOHO's own figure ("just over 2 m/s per year" in Dunham & Roberts 2001, "much less than 1" in [8]) is left out.
- **61,300 km**: now cited to the Goddard feature [32] ("each about 61,300 km … above the lunar surface"); that it equals the leading-order distance from the Moon's centre is the page's own observation, stated as such.
- **Hiten**: [7] prints "October 1991 and January 1991" for the L4/L5 passes (an evident misprint); the page says only "after October 1991".
- **Status claims** are limited to what was read on 14–15 November 2026: Roman still in transfer (NASA page last updated 8 Sep 2026; no arrival notice found),
  Vigil planned for 2031, Lucy's planned flybys. No "still operating" claim is made for any spacecraft; the register says so.
- The L3 e-folding times shown by the solver (57 years for Sun–Earth) are properties of the two-primary model only; the page says so.
- Instrument 4's mass and specific-impulse sliders are reader assumptions (default 1,000 kg, 220 s); no mission value is implied.
- RU: «Гашо», «Раус», «Фаркуар», «Хитэн», «Эврибат», «Тефия», «Телесто», «Калипсо» follow common Russian usage; not in RU-STYLE's tables (proposed additions).

## Freshness
claim | source URL | review-by date
--- | --- | ---
Roman (launched 30 Aug 2026) still in transfer as of 15 Nov 2026; insertion at L2 expected about early December 2026; add the arrival date | https://science.nasa.gov/blogs/roman/ | 2026-12-31
MPC Trojan counts, lists dated 30 May 2026: Jupiter 9,823 + 5,942, Mars 18, Neptune 35, Earth 1 (2020 XL5; two known with 2010 TK7) | https://www.minorplanetcenter.net/iau/lists/Trojans.html | 2027-11-14
ESA Vigil planned for launch in 2031 to Sun–Earth L5 (as of November 2026) | https://www.esa.int/Space_Safety/Vigil | 2027-11-14
China's Xihe-2 planned for Sun–Earth L5 between 2028 and 2029 (CASC/CGTN, February 2026) | https://english.spacechina.com/n17212/c4541181/content.html | 2027-05-14
Lucy's Trojan flybys planned from Eurybates (11 Aug 2027) to Patroclus (3 Mar 2033) | https://science.nasa.gov/mission/lucy/ | 2027-09-01
Mission register: no end date recorded for Wind, SOHO, ACE, DSCOVR, Aditya-L1, IMAP, SWFO-L1, Spektr-RG, Webb, Euclid, Queqiao, CAPSTONE | https://www.esa.int/Enabling_Support/Operations/What_are_Lagrange_points | 2027-11-14
Gateway paused by NASA in March 2026 (per `the-lunar-gateway`); its NRHO described from 2020 design papers | https://ntrs.nasa.gov/citations/20200000733 | 2027-05-14

## Wiring (for the coordinator)
- Codename, label, llms line and related list are in meta.json (codename/label unchanged from `handmade/lagrange-points/meta.json`; llms rewritten; related unchanged).
  The `handmade/lagrange-points/` folder is now superseded by `articles/lagrange-points/` and was left untouched.
- MOD.json: 5 rows (ISEE-3 1978, WMAP 2001, ARTEMIS P1 2010, Queqiao 2018, Aditya-L1 2024), type `l2`.
- Guides that should link here: `rabbit-change-far-side` (its L2 chapter), `parallax-gaia-mission`, `dark-euclid-roman`, `the-lunar-gateway`
  (`james-webb-space-telescope` already does).

## Response to review (2026-11-15)
Three reviews: `REVIEW-A-physics.md`, `REVIEW-B-domain.md`, `REVIEW-C-history-language.md`, all APPROVE WITH CHANGES. After the round: 39 references, 24 register rows,
18 timeline rows, 101 checks, `./check-all.sh lagrange-points` = ALL OK.

### MUST
- **A-M1 (instrument 4 printed linear-model numbers far outside its range).** `growth()` returns no number once the factor passes 10⁶ (the chart's own ceiling);
  readout and status then say "more than 10⁶ times: the linear model no longer applies", EN and RU. `sci()` no longer prints "× 10⁰". The note states the limit.
  Checks: every case × days 0–120 has no km/s, no "× 10⁰", no factor above 10⁶, largest printed velocity below 1 km/s; `growth()` unit check.
- **B-M1 (Xihe-2 left out of "next").** Chapter 7 now names China's Xihe-2 (2028–2029) before ESA's Vigil (2031), ref [39], freshness row added.
- **B-M2 / C-M1 / A-S6 (61,300 km).** Followed reviewer B's sourcing: the Goddard feature [32] is cited for "both … above the lunar surface"; the page says, as its own
  observation, that the number equals the leading-order distance from the Moon's centre (61,274 km). Same wording in the solver status. The check label was rewritten and a
  second check shows that as heights the exact points are 56,283 and 62,778 km.
- **B-M3 ("first at" vs "first to orbit").** Register, timeline and MOD.json rows now say "first to orbit" (ISEE-3, WMAP, ARTEMIS), EN and RU. Check: no "first at" in register or timeline.
- **C-M2 (Genesis).** Register: "capsule crash-landed in Utah 8 Sep 2004 (parachute did not open)", per [7]. Check added.
- **C-M3 (scrollable tables).** Both `.table-scroll` boxes have `tabindex="0"`, `role="region"`, EN/RU `aria-label`, a focus outline, and each table a visually hidden caption. Check added.

### SHOULD — done
- **A-S1** μ clamped to 0.5 in all three instruments; equal masses get their own status sentence ("L2 and L3 … open together"); gate button handles C2 = C3. Checks added.
- **A-S2** the 400-unit guard applies only to unstable μ; a stable path is drawn in full (40 revolutions) and labelled "part of one long period" where that is so. Check added.
- **A-S3** the chapter 3 note says that the model gives λ ≈ √(21μ/8), 57 years for Sun–Earth L3, and that the often-quoted "roughly 150 years" does not follow from these
  equations (it corresponds to √(3μ/8)). Two checks. The Cornish/WMAP note (1998) was opened through the Wayback Machine: it does state an e-folding time "of roughly … years"
  for L3, but the digits were lost in text extraction, so the page attributes 150 years to no named source.
- **A-S4** removed: the literal `1906 − 1772` check, the `DATES` table and its checks, the `SK` self-comparison, the MPC sums on an unused table. Replaced by checks that read the
  register rows, the chapter text (MPC counts, 134 years, 147 years, 175/181 days, 85 %, 1.4916/1.5015, 187/262/449, 57 years) and the rendered instrument. RK4 check tightened to 1 %:
  it first failed (2.85 vs 3.05) because the path was sampled before the decaying mode had died and under the 400 cap; measured between 4 and 5 periods without the cap it gives
  3.0491 vs 3.0492, so the integrator and the analytic rate agree and nothing was loosened. New: L2 series, `l3lead` away from Sun–Earth, wall at the necks.
- **A-S5** Koon's ten-digit values are now reproduced to 1e-9 with μ = 3.040357143e-6 (γ₁, ω_p, ω_v, and the quintic); the misleading "rounds to 3.036e-6" label is gone.
- **A nits** N1 (test suite, not the page, runs Newton), N2 (heading: "Each of L1, L2 and L3 is the root of a quintic"), N3 (grid clause in the map note), N4 (six decimals of μ near the limit),
  N5 (`fmtInt` for mass ratios), N6 ("< 0.001 %"), N7 ("ten weeks").
- **B-S1** "NASA paused Gateway in March 2026; HALO follows its status" (date from the linked guide). **B-S2** NRHO range 0.4 to about 4 m/s per year, about 1 in the baseline, in status, note and ref [10].
- **B-S3 / C-S4 / C-S5** LISA Pathfinder switched off 18 Jul 2017 [35]; Spektr-RG arrived 21 Oct 2019 [36] (primary: MPE), with a 100-day check.
- **B-S4** Queqiao's launch is 20 May 2018 (UT) in the register; the table note says dates are UT where the source gives UT and that some agency dates are local.
- **B-S5** chapter 4: the Sun disturbs the Moon's L4/L5 strongly; "quasi-stable" per [11]. **B-S6** freshness row: Earth 1 on the MPC list. **B-S7 / C-N1** Farquhar found the orbits in 1966; name in print by his 1968 thesis.
- **B nits** 1 ("some of the busiest"), 2 ("the same small-swing formula is quoted as about 150"), 3 (ACE and Wind about 1 m/s, SOHO much less), 4 ("Their orbits…; Webb's keeps it out of the shadows"),
  7 (hero no longer says a relay "lives" there), 8 (Roman: insertion expected about early December [38]; freshness review date 31 Dec 2026).
- **C-S1** Queqiao's first, from Xinhua via CASC [33] ("the world's first communication satellite operating in that orbit"): chapter 5, register, timeline, MOD.json.
- **C-S2** Kathleen Howell and John Breakwell credited in chapter 5 and a 1984 timeline row, ref [34]. **C-S3** Euclid is a register row (launch 1 Jul 2023, arrived by 28 Jul 2023, [37]).
- **C-S6** the 1906 Achilles row in MOD.json replaced by Queqiao entering its halo orbit, 14 June 2018.
- **C-S7** chapter 2 now describes the wells as belonging to the potential energy −Ω and the eq-note says Ω is that energy with the sign reversed. **C-S8** "libration points" defined in chapter 1.
- **C-S9** «Гершель», «Люси», «Адитья-L1». **C-S10** grammar fixed. **C-S11** `I_уд` in the Russian formula. **C-S12** «по справочным данным NASA». **C-S13** «Чанъэ-5-T1», as in RABBIT.
- **C-S14** chart lines are keyed by dash pattern as well as colour (solid / dashed / dotted), legends show a sample of each line in left-to-right order with black text, and the notes describe
  the curves as upper/lower and by pattern; `.m-ag` is #5f5f59 (6.4:1). Simulated-NRHO bar and the dashed critical curves darkened (C nit 12).
- **C nits** 2 (Gabriel Gascheau, Edward Routh, "extended"; first name confirmed by reviewer B from Sicardy's footnote), 3 (China third after the United States and ESA, per [7]), 5 (EN Queqiao sentence matches the RU),
  6 (`NB` is U+00A0; thousands in Russian script strings use no-break spaces), 7 («выведена»), 8 (all listed wording fixes), 9 (Russian kicker with a decimal comma), 10 (barycentre and e glossed; tadpole/horseshoe explained in the note).

### SHOULD / NIT — left, and why
- **B nit 5** (secondary sources [21], [29]): kept, but each now has a primary beside it for the claims that matter ([33] Xinhua/CASC for Queqiao, [36] MPE for Spektr-RG's arrival).
- **B nit 6** (Hui et al. 2021 for 2020 XL5): not added; I did not open that paper, and the page's "confirmed in 2022" is accurate as it stands.
- **C nit 4** (Palisa, Kopff): optional credit, not added: no source opened for it in this round.
- **C nit 11** (tight labels at 390 px; 7.8 px chart text and the shared header's 13 px scroll at 320 px): the long legend labels were shortened and re-checked at 390 px in a new capture;
  320 px is below the brief's 390 px floor and the header is shared site chrome.
- **C nit 12, formula subscripts at 6.9–7.8 px**: nested sub/superscripts come from the shared `sup,sub{font-size:0.68em}` rule in base.css, outside this folder.
- **Time zones of Lucy / CAPSTONE / Aditya-L1 dates (B-S4, second half)**: left as the agencies give them; the register note now says so.
- For the coordinator (not mine to change): `ru/lagrange-points.html` is stale until `ru_pages.py` runs; the five MOD.json rows are not yet in `assets/mission-of-day.js`;
  «Гашо», «Раус», «Фаркуар», «Хитэн», «Эврибат», «Тефия», «Телесто», «Калипсо», «Сихэ-2», «Хауэлл», «Брейкуэлл» are proposed additions to RU-STYLE.
