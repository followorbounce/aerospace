# MASCON — GRAIL & the lumpy gravity of the Moon (Wave 8)

**Purpose:** explain lunar mass concentrations, from their discovery in Lunar Orbiter Doppler residuals (1968) through the instability of low lunar orbits (PFS-2, frozen inclinations) to GRAIL's inter-satellite ranging and what its gravity fields revealed about the crust. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations sit in eq-boxes.
**Owner:** Wave 8 author (agent), 2026-11-12. **Category:** moon. Neighbours not duplicated: SCOUT (LRO), RABBIT (Chang'e, far side relay), VALOR (Chandrayaan), TRANQUILITY (Apollo), LUNA, PROSPECT (Clementine). Mascons/GRAIL/frozen orbits are not covered anywhere else on the site (grep 2026-11-12).

## Outline (9 chapters, lede "Nine chapters and four instruments")
1. Fifty millimetres per second — Muller & Sjogren, Lunar Orbiter 5, six maria; eq-box point-mass anomaly.
2. A mass underground — **instrument 1**: Δg profile over a buried point mass at surface vs chosen altitude (presets: Murphy & Siry's Apollo 8 Aestuum mass; an illustrative 10¹⁶ kg at 20 km; altitudes 0/100/55/23 km).
3. Orbits that fall — PFS-1, PFS-2, Konopliv's frozen inclinations; **instrument 2**: RK4 integration of a satellite in GRGM1200A to degree 30 + Earth tide, perilune per day for a year; field degree 2/8/30 toggle; precomputed lifetime-vs-inclination strip with the published 27/50/76/86° marked. Lunar Prospector manoeuvres; Kaguya relay.
4. Ebb and Flow — GRAIL mission, Zuber, names, MoonKAM, low-energy transfer, 55 km / 113 min / 82–218 km; Kepler check printed live.
5. Microns per second — LGRS Ka-band, 0.02–0.05 µm/s vs 50 mm/s; eq-box first-order range-rate formula; **instrument 3**: range-rate wiggle vs mass/depth/altitude/separation, noise band.
6. Lower, then lower still — degree ↔ block size, attenuation (R/r)^(l+2); **instrument 4**: attenuation vs degree for 100/55/23/11 km + chosen, model degrees marked; extended mission, endgame, impact at the Sally K. Ride site.
7. A thin, broken crust — 98.5 % topography, 2,550 kg/m³, 12 %, 34–43 km, Melosh's bull's-eye basins, Park 2025 thermal asymmetry; eq-box 2πGρ.
8. Legacy — timeline 1968–2025 (10 entries) + quote.
9. References — 21 sources.

## Sources per number
- 50 mm/s on 2 × 10⁶ mm/s, 74 consecutive Lunar Orbiter 5 orbits, Imbrium/Serenitatis/Crisium/Nectaris/Humorum/Aestuum — Muller & Sjogren 1969 Physics Today [2] (PDF downloaded, text extracted). Discovery paper, Science 161, 680, August 1968 — [1] (bibliographic details via scilit/search; full text not opened).
- Apollo 8 Aestuum point mass 5 × 10⁻⁶ lunar masses, ~100 km deep, ~250 mGal; "six mascons" — Murphy & Siry 1969 [3] (NTRS PDF, text extracted).
- PFS-1: 4 Aug 1971, 102 × 139 km, 28.5°, 36.3 kg, data until Jan 1973, impact site unknown — NSSDC [4].
- PFS-2: 24 Apr 1972, 90 × 130 km, 10°, clockwise from north (retrograde), impact 29 May 1972 after 34 days / 425 revolutions — NSSDC [5]. NASA [6] gives 97–120 km, 11°, 35 days and 425 orbits, ~10 km perilune after 2½ weeks, back to ~30 mi (48 km), Konopliv quotes, frozen 27/50/76/86°, PFS-1 at 28°, Lunar Prospector manoeuvres every two months at 100 km / more than monthly at 30 km. The text uses NSSDC's orbit and NASA's 35 days; both are cited.
- LP150Q degree 150 — Konopliv et al. 2001 [7] (cited from reference lists of [11]/[12]; paper not opened).
- Kaguya/Okina four-way Doppler, Okina impact 12 Feb 2009 — JAXA release [8].
- GRAIL: launch 10 Sep 2011 Delta II, 202.4 kg each, Ebb/Flow names (Emily Dickinson Elementary, Bozeman), MoonKAM with Sally Ride Science and UCSD undergraduates, impact 17 Dec 2012 at 75.62 N 26.63 W, GRACE heritage, Discovery #11 — NASA mission page [9]. 50 km / 113 min / 175–225 km, three 27.3-day cycles in a 90-day science phase, impact coordinates — NSSDC [10].
- 27 manoeuvres, ~55 km, PM 1 Mar – 30 May 2012, 82–218 km, Ka-band 32 GHz, RMS range-rate residuals 0.02–0.05 µm/s (2–5× better than requirement), GL0420A degree 420 = 13 km, earlier fields 100–150 (54–36 km), degrees ≤60 = 90 km, 98.5 % between degrees 80 (68 km) and 320 (17 km), power law 2.5 × 10⁻⁴ l⁻², low-energy via EL-1, arrival 31 Dec / 1 Jan — Zuber et al. 2013 [11] (PDF text extracted; the "µm" sign is lost in extraction as "mms−1", read as µm/s, consistent with Lemoine et al. 2013's "0.1 µm/s or better").
- PM 1 Mar – 29 May (one week early), XM 30 Aug – 14 Dec 2012 at 23 km, three manoeuvres a week, 11 km from 6 Dec over Orientale, deorbit 17 Dec, 660 × 660 field — Zuber et al. LPSC 2013 [12] (NTRS PDF, text extracted).
- 2,550 kg/m³, ~12 % porosity, 34–43 km, 10–20 km thinner — Wieczorek et al. 2013 [13] (abstract + NTRS summary).
- Bull's-eye anomalies, collapse/melt densification/flexure/ejecta, Freundlich-Sharonov & Humorum — Melosh et al. 2013 + Purdue release [14].
- Impact times 2:28:51 / 2:29:21 PST, ~2.5 km mountain near Goldschmidt, 1.7 km/s, engines to depletion, >115,000 MoonKAM images, Ride led MoonKAM, died July 2012 — JPL news [15].
- Zuber first woman to lead a planetary spacecraft mission — MIT News 2011 [16].
- PDS file list (GL0420A, GL0660B, GL0900C/D, GRGM900C, GRGM1200A/B/L, GL1500E, GL1800F posted 2025-03/05), GRGM1200A header GM 4902.80011526323 km³/s², R 1738.0 km, coefficients to degree 30 used in instrument 2, topography constraint from n = 601 in GL1800F (and Kaula constraint >600 in GRGM1200A) — PDS [17] (labels read 2026-11-12).
- GL0900C/D, minimum altitude 3–23 km — Konopliv et al. 2014 [18] (abstract via search; paper not opened).
- k₃ = 0.0163, ~72 % excess, 100–200 K warmer near-side mantle, GL1800F — Park et al. 2025 [19] (abstract/press via search + PDS label).
- Mass 7.346e22 kg, mean radius 1,737.4, g 1.62, J₂ 202.7e-6, 384,400 km, 655.720 h, Earth GM — NASA Moon fact sheet [20]; G = 6.67430e-11 — NIST CODATA [21].

## Computed (checks.js, 56 checks, all PASS)
1/40,000; G·M_Moon/GM = 1.00003; surface g 162,422 mGal; Aestuum 245.1 mGal (0.151 %); x½ = 0.766(d+h); J₂ from GRGM1200A 203.22e-6 vs 202.7e-6 (tide-free vs with permanent tide); orbit model: PFS-2 32-orientation scan 12.7–51.3 days, median 33.65 (real 34–35); frozen 27/50/76/86° each have a surviving 100-km orbit within ±1°; 10° → 11.9 d, 40° → 32.2 d; live run reproduces stored strip; degree-2 Moon keeps PFS-2 up 120 d; period at 55 km 113.49 min (NSSDC 113); 13 km in 7.86 s; 112 days transfer; impacts 30 s apart; range-rate formula vs 2-D numerical integration 341.9 vs 342.8 µm/s; Apollo 8 mascon peak ≈ 40,700 µm/s at 55 km; block sizes 13.00/54.6/36.4/91/68.3/17.1/3.03 km; e-fold altitude 4.12 km at degree 420; 2πGρ 106.9 mGal/km; grain 2,898 kg/m³; UI checks.

## Assumptions / limitations
- Instrument 1: single point mass, flat surface. Real mascons are extended bull's-eyes.
- Instrument 2: GRGM1200A truncated at degree 30 (degree 50 tested in a prototype: survival bands move ≲1°); RK4 60 s; inertial integration with the field rotating at the sidereal rate; Earth fixed on the Moon's +x axis at 384,400 km (no eccentricity, libration or obliquity); no Sun, no solar pressure; impact at the mean radius (no topography). Starting node 0° (over the Earth-facing meridian) and perilune at the node for presets and the strip; the strip uses 100 km circular orbits. The model's prograde survival bands at 100 km are ~0–3°, 21–30°, 48–52°, 70–79°, 83–87°: the four published inclinations sit inside the last four; the near-equatorial band is not in NASA's list (stated on the page). PFS-1 survives the model year although the real one ended within ~1.5 years (stated). The strip and PFS-2 scan are precomputed by running the page's own `lifetime()` in jsdom (§strip below) and checked by live re-runs.
- Instrument 3: first-order, straight-path energy argument; checked against a 2-D orbit-plane integration (agreement < 1 % for the tested case). Noise band = upper end of the RMS residuals.
- Instrument 4: attenuation (R/r)^(l+2) of a single degree's radial gravity; Kaula law from [11].
- Bouguer: infinite-slab 2πGρh; implied grain density 2,900 kg/m³ is computed, not quoted.

## §strip — regenerating STRIP and PFS2_SCAN
Load the assembled page in jsdom and call `window.__mascon.lifetime({hp:100, ha:100, i, O:0, w:0}, 30, 365)` for i = 0…180 (crash day to 0.1, 0 if alive), and `lifetime({hp:90, ha:130, i:170, O, w}, 30, 365)` for O = 0…315 step 45, w = 0…270 step 90. Ten parallel node processes take about a minute.

## Unverified / judgment calls
- PFS-2 orbit and lifetime differ slightly between NSSDC (90 × 130 km, 10°, 34 days) and NASA 2006 (97 × 120 km, 11°, 35 days); both cited.
- The NASA "Bizarre Lunar Orbits" page is no longer on science.nasa.gov; cited via the UNT End-of-Term web archive URL (the archive frame did not render for the fetcher; text verified from the identical Moon Daily/Energy Daily repost of 7 Nov 2006).
- Muller & Sjogren 1968 full text not opened; facts about method come from their 1969 Physics Today article.
- Konopliv 2001 and 2014 papers not opened (abstract/reference-list level).
- The NASA GRAIL page gives the primary phase as 7 March – 29 May 2012; Zuber et al. say 1 March – 30 May and the LPSC abstract 1 March – 29 May. The page says "from 1 March to the end of May".
- JPL gives the mountain as "1.5-mile-tall (2.5-kilometer)"; the page says "about 2.5 km".
- GRAIL launch vehicle variant: NASA page "Delta 7920H", Zuber "Delta-II 7290H", NSSDC "2920-10"; the page says only "Delta II".
- Not used: Konopliv's plumb-bob and "50 pounds and 4 ounces" illustrations (inconsistent with his "half a percent"); claims about current landers' reliance on GRAIL fields.

## Freshness
claim | source URL | review-by date
--- | --- | ---
GL1800F (degree 1800, posted 2025) is the highest-degree GRAIL field in the PDS archive as of November 2026 | https://pds-geosciences.wustl.edu/grail/grail-l-lgrs-5-rdr-v1/grail_1001/shadr/ | 2027-11-12
Park et al. 2025 thermal-asymmetry result (k₃ = 0.0163) as the latest GRAIL interior finding cited | https://doi.org/10.1038/s41586-025-08949-5 | 2027-11-12
"Bizarre Lunar Orbits" reachable only via web archive (link rot check) | https://webarchive.library.unt.edu/eot2008/20090512014231/http:/science.nasa.gov/headlines/y2006/06nov_loworbit.htm | 2027-05-12

All sources retrieved 2026-11-12.

## Wiring (for the coordinator)
- Index label EN: `Mascons & GRAIL: the Moon's Lumpy Gravity` · RU: `Масконы и GRAIL: неровная гравитация Луны` · codename `MASCON`, category moon.
- llms.txt: `Lunar gravity from the 1968 discovery of mascons in Lunar Orbiter tracking to GRAIL: point-mass anomalies vs altitude, a satellite integrated in the real GRGM1200A field (PFS-2's 35-day fall, frozen inclinations 27°/50°/76°/86°), Ebb and Flow's Ka-band range-rate signal at 0.05 µm/s, gravity-field degree vs resolution to GL1800F, and the 34–43 km porous crust.`
- MOD.json: 5 rows (PFS-1, PFS-2, GRAIL launch, Ebb LOI, GRAIL impact), type `lunar`.

## Response to review (2026-11-12, independent panel; see REVIEW.md)
**Changed (MUST):**
- Orbit instrument responsiveness: `advance(n)` now stops at the current time + n days, so fractional pieces progress. The UI runs 0.1-day pieces until a 10 ms frame budget is used, then yields and redraws. The run starts when the chart comes within 300 px of the viewport (`LF_BUDGET_MS`, `LF_PIECE_DAYS`, IntersectionObserver with an immediate fallback). Measured: 12.7 ms per simulated day at degree 30, ≈ 1.6 ms per piece. Single-call results are unchanged (the strip and the PFS-2 scan still reproduce).
- `#lfStatus` (aria-live) no longer re-announces a day count every frame: it shows a constant "Integrating a year of orbit…", and the count stays in the readout.
- A surviving PFS-1 preset, and surviving degree-30 orbits below 3.5° or above 176.5°, now get a "limit of the model" sentence in the status (EN + RU).
- 5 checks added (56 → 61).

**Changed (SHOULD):**
- "(11° in JPL's account) [5][6]" for PFS-2.
- PFS-1 "too came down, in January 1973, after less than a year and a half [6]".
- "Held three cycles of 27.3 days".
- "From 1 March, a week earlier than planned".
- GRACE 2002 cited to [9] only (the LPSC abstract [12] misprints 2007).
- "A team led by Ryan Park of JPL".
- RU: «даёт просто её рельеф»; «затем снова поднялась примерно до 50 км».

**Left open (SHOULD), and why:**
- NASA's 7 March primary-phase start is not mentioned. The paper and the LPSC abstract both say 1 March, so the text follows them.
- The model's retrograde survival bands are not discussed, because there is no source for retrograde frozen inclinations.
- The strip's tan bars contrast at about 2.3:1. Bar height also encodes survival, so this is a cosmetic fix for later.
- A full year at degree 30 takes ~15–20 s on a phone. It is non-blocking and progressive. A larger step would mean regenerating STRIP and PFS2_SCAN (§strip).
