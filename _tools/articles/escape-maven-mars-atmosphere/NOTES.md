# ESCAPE — Where Mars's air went: MAVEN & atmospheric loss (Wave 8)

**Purpose:** explain how Mars lost most of its atmosphere: the evidence for a thicker past, the physics of escape (scale height, exobase, Jeans escape, photochemical hot O, ion pickup, sputtering), why Mars rather than Earth (gravity first, magnetic field second and nuanced), MAVEN's measured loss budget and storm-time increases, isotopic evidence (³⁸Ar/³⁶Ar, D/H), and an extrapolation over 4 Gyr. MAVEN's status, Mars Express, Hope and Tianwen-1 come in as context.
**Audience:** interested non-specialists; equations in eq-boxes.
**Owner:** Wave 8 author (agent), 2026-11-12. **Category:** mars. Neighbours not duplicated: JEZERO (the delta, only linked), TRANSFER (the trip), SKYCRANE (Curiosity; SAM argon result used here only as a number), VIKING.

## Outline (9 chapters, lede "Nine chapters and five instruments")
1. A thicker past: 6.36 mbar, 2.5 × 10¹⁶ kg, Jezero delta, Kite crater palaeopressure limit, MAVEN conclusion "loss to space dominant". Eq-box: M = p·4πR²/g.
2. Scale height, exobase, Jeans: H = kT/mg; exobase 200 km (Mars) / 500 km (Earth); Jeans flux eq-box. **Instrument 1**: Jeans calculator (planet, gas H/D/He/O, exobase T, exobase density) with chart of Φ/n vs T for Mars and Earth; readouts H at exobase, v_esc, v₀, λ, tail fraction, flux, global rate.
3. Non-thermal: O₂⁺ dissociative recombination channels vs escape energy; pickup, sputtering; crustal fields (Acuña), dynamo 4.5 and 3.7 Ga (Mittelholz, Johnson); Gunell on fields; Earth's own leak (Catling & Zahnle); 2018 dust storm (Stone). **Instrument 2**: hot-O energy bars vs escape energy for a world of Mars density and chosen radius.
4. MAVEN: launch/MOI, orbit (apoapsis from Kepler), 8 instruments, PIs Jakosky → Curry, loss budget, tail/plume, Mars Express/Hope/Tianwen-1, loss of signal 6 Dec 2025, end 3 Jun 2026. Eq-box Kepler orbit.
5. Solar storms: 8 Mar 2015 ICME, model 1.5e24 → 1e25 → 3e25 /s, earlier 10–100×, Sep 2017 3–20×. **Instrument 3**: storm boost × duration × storms per year.
6. Isotopes: argon (SAM 4.2 vs solar 5.5; MAVEN 66 ± 4.5 %), D/H (7× atmosphere, 8× caps, 137 m, 87 %). Eq-box Rayleigh. **Instrument 4**: Rayleigh distillation, argon (Δz/H₄₀) or D/H (x).
7. Four billion years: 2.5 kg/s × 4 Gyr; EUV history from Ribas; MAVEN 0.8 bar lower limit. **Instrument 5**: cumulative loss vs time with rate, EUV exponent, start.
8. Legacy: timeline 1969–2026 (13 rows) + quote.
9. References: 32.

## Sources per number (retrieved 2026-11-12 unless stated)
- 6.36 mb (4.0–8.7), 11.0 km, ~214 K, 43.49, ~2.5e16 kg, 95.1 % CO₂, GM 0.042828e6 km³/s², R 3,389.5 / 3,396.2 km, g 3.73, v_esc 5.03, ρ 3,934 — NSSDC Mars fact sheet [1]. Earth 1,014 mb, 8.5 km, 288 K, 28.97, 5.1e18 kg, 11.19 km/s, g 9.82 — [2].
- Jezero delta-lake + flood deposits — Mangold et al. 2021 [3] (abstract via Caltech; no age used). Palaeopressure ≤ 0.9 ± 0.1 / 1.9 ± 0.2 bar — Kite et al. 2014 [4].
- 2–3 kg/s, up to 0.8 bar CO₂ or 23 m GEL, lower limits, no reservoirs → loss to space dominant — Jakosky et al. 2018 Icarus abstract [5].
- Exobase ~500 km, ~1,000 K, H ~5 km/s vs 10.8 km/s, Jeans 10–40 % of Earth's H loss, 3 kg/s H + 50 g/s He, charge exchange etc. — Catling & Zahnle 2009 [6] (authors' PDF, text extracted).
- Jeans flux formula — Hunten 1973 [7] (standard; DOI verified via Crossref, text not opened).
- Exobase 200 km assumption; n_H 1e4–1e6 cm⁻³, T 100–1,500 K — Chaffin et al. 2015 [8] (PDF text extracted). 1–8 × 10⁸ cm⁻² s⁻¹ (1e26–1e27 /s), 1e5 cm⁻³ at 240 K, seasonal change, earlier observers — Chaffin ESLAB slides 17 May 2018 [9].
- DR channels 6.99/5.02/3.05 eV, 20.4/44.0/31.5 % — Gröller et al. 2014 [10], Table 1 (arXiv PDF).
- Photochemical escape from MAVEN in situ data — Lillis et al. 2017 [11] (DOI/abstract only).
- Crustal magnetisation — Acuña et al. 1999 [12]. Dynamo 4.5 & 3.7 Ga — Mittelholz et al. 2020 [13]. Similar escape rates Earth/Venus/Mars; magnetised planets can lose more — Gunell et al. 2018 [14] (abstract).
- MAVEN launch 18 Nov 2013 18:28 UT Atlas V 401; MOI 02:24 UT 22 Sep 2014; 4.5 h, 75°, periapsis 150 km, deep dips 125 km, 1-yr nominal, 8 instruments — NSSDC 2013-063A [15].
- Last heard 6 Dec 2025; end declared 3 Jun 2026; not recoverable; 12 y 6 m 16 d — science.nasa.gov/mission/maven [16]. Spin faster than normal, preliminary: rotation drained batteries, cut radio power; root cause TBD, final report expected later in 2026; > 800 publications; > 11 years — collectSPACE 3 Jun 2026 [25].
- Curry PI from 31 Aug 2021, Jakosky PI since 2003 — LASP 2021 [17].
- O budget photochemical ~1.3 kg/s, ions ~130 g/s, sputtering ~80 g/s, total 2–3 kg/s; 10 Sep 2017 event, models 3–20×; argon 66 ± 4.5 %; argon only by sputtering; dust/season drives H — Jakosky ESLAB slides [18] (PDF text extracted).
- ~100 g/s, ~75 % tail / ~25 % plume — NASA release 5 Nov 2015 [19].
- Water transported by season and dust storms (incl. 2018) dominates H loss — Stone et al. 2020 [20] (abstract; press "20×" not used).
- Mars Express launch 2 Jun 2003, ions since 2004 min→max, gravity ~1/3, 4.6 Gyr — ESA 2018 [21]; Ramstad et al. 2017 JGR. Operations to end 2026, indicative to 31 Dec 2028 — ESA 7 Mar 2023 [32].
- Hope EMUS: H emission changes ≥ 10× perihelion↔aphelion, O ~2× — EGU23-13324 [22]. Tianwen-1 MOMAG since 13 Nov 2021, 158 bow-shock crossings, 5 simultaneous with MAVEN — Wang et al. 2023 [23]. Launch dates Mariner 6/7 (1969), 9 (1971), Mars Express, MAVEN, Hope, Tianwen-1 — NSSDC chronology [24].
- ICME 8 Mar 2015: >800 km/s ~7 h, ram pressure >10×, aurora, pickup ions; model 1.5e24 /s (O₂⁺) → ~1e25 (7×, 4× pressure) → 3e25 (15× pressure); earlier 10–100×; window 16:00 8 Mar – 12:00 9 Mar — Jakosky et al. 2015 Science [26] (full text extracted).
- ³⁶Ar/³⁸Ar 4.2 ± 0.1; solar 5.5; ≥ 50 %, perhaps 85–95 % lost — Atreya et al. 2013 [27] (PMC).
- ~65 % of argon lost by sputtering; majority of CO₂ — Jakosky et al. 2017 / LASP release [28].
- 6.5× caps, 137 m, 19 %, 87 % lost — NASA release 5 Mar 2015 [29] (Villanueva et al. 2015). D/H 7× atmosphere, 8× caps — Keck release [30].
- 1–1200 Å flux ~6× 3.5 Gyr ago, ~2.5× 2.5 Gyr ago — Ribas et al. 2005 abstract [31].

## Computed (checks.js, 70 checks, all PASS)
H(Mars, 214 K) 10.97 km; H(Earth) 8.42 km; M_atm Mars 2.46e16 kg, Earth (formula) 5.27e18 (NSSDC 5.1e18); ratio ~200; v_esc exobase Mars 4.885, Earth 10.771 km/s; H mean speed 1,000 K 4.58 km/s; λ_H Mars 240 K 6.03, λ_O 95.7, λ_H Earth 1,000 K 7.03; Jeans H 1e5 cm⁻³ 240 K: 9.5e7 cm⁻² s⁻¹, 1.54e26 s⁻¹ (MAVEN 1e26–1e27); Jeans D/H efficiency 0.0032; O escape energy 1.98 eV (Mars), 9.62 eV (Earth); per-atom DR 3.50/2.51/1.53 eV → 64.4 % escaping channels on Mars, 0 on Earth; hot O blocked above R ≈ 4,474 km at Mars density; MAVEN apoapsis 6,215 km, a 6,579 km; quiet ions 79.7 g/s; ×20 × 20 h = 15.8 quiet days, 109 t; ×7 → 5 days; argon 5.5/4.2 = 1.3095, 66 % ↔ Δz = 5.76 H₄₀; D/H ×8, x = 0 → 87.5 %; β = 1.252, 2.67× at 2.5 Gyr (Ribas 2.5), 12.8× at 4 Gyr; constant 2.5 kg/s × 4 Gyr = 3.16e17 kg = 12.8 atmospheres = 81.5 mbar; ∝EUV ×3.06 → 250 mbar; ∝EUV² 1,273 mbar; date arithmetic for 12 y 6 m 16 d; UI renders without NaN in EN/RU, no Latin units in RU readouts.

## Assumptions / limitations
- Instrument 1: single isothermal exobase at fixed altitude (200 / 500 km), Maxwellian, collisionless (Chamberlain picture); density is a free slider (only the Mars H preset is anchored to a published model, 1e5 cm⁻³ at 240 K). No Earth density preset on purpose (not sourced).
- Instrument 2: O₂⁺ at rest, equal energy split, branching at ~0 collision energy, no collisional losses or angular factor; Mars-density scaling of a hypothetical world.
- Instrument 3: constant multiplier over the storm, all ions counted as O₂⁺; quiet baseline is a model value [26], not a measurement; the storms-per-year slider is illustrative.
- Instrument 4: pure Rayleigh distillation from one closed reservoir; the argon preset (5.76 H₄₀) is reverse-engineered so the simple model gives MAVEN's 66 %; MAVEN's real model includes outgassing and impacts. D/H x is poorly known; water exchanges with ice/regolith.
- Instrument 5: loss ∝ (EUV)^s with a single power law fitted to one Ribas point; mass converted to "mbar of today's air"; lost H/O come from both H₂O and CO₂, so this is a mass scale not a CO₂ inventory; no hydrodynamic escape, impacts, outgassing or crustal sinks.
- The Sun's age 4.6 Gyr is taken from ESA's "4.6 billion years" phrasing [21].

## Unverified / judgment calls
- Jakosky ESLAB slides [18]: hosted on ESA Cosmos in the same 2018 ESLAB folder as Chaffin's dated slides; the exact date of Jakosky's talk is not printed in the extracted text ("2018" is inferred).
- Lillis et al. 2017 rates (1.2–5.5e25 /s) came only via search snippet; not quoted in the page. Rahmati et al. 2014 not opened.
- Stone 2020 "20× more water" / "45 days" (press) not used.
- MAVEN failure root cause: no final review-board report found as of 2026-11-12; the page says so.
- Hope and Tianwen-1 orbit-arrival dates (Feb 2021) and current operating status not stated (not verified from primary sources).
- Mars Express: a 2025 ESA review reportedly confirmed the 2027–2028 extension; only the 2023 ESA decision was opened, so the page says "indicative extension to 2028" with "as of ESA's latest decision we found".
- First names: Herbert Gunell (H. Gunell), Stas Barabash (S. Barabash) — standard, not checked against the paper bylines.
- Whether the Mariner 6/7/9 Lyman-α data were "the first sign" of escape is an editorial simplification of [9]'s list of earlier observations.

## Freshness
claim | source URL | review-by date
--- | --- | ---
MAVEN lost 6 Dec 2025, mission ended 3 Jun 2026, preliminary cause (spin drained batteries), no final root cause published as of Nov 2026 | https://science.nasa.gov/mission/maven/ , https://www.collectspace.com/news/news-060326a-maven-mars-atmosphere-probe-end-mission.html | 2027-03-01
Mars Express operations to end 2026, indicative extension to end 2028 | https://sci.esa.int/web/director-desk/-/extended-life-for-esa-s-science-missions | 2027-01-15
MAVEN "more than 800 publications" | https://www.collectspace.com/news/news-060326a-maven-mars-atmosphere-probe-end-mission.html | 2027-06-01
Tianwen-1 MOMAG measuring since 13 Nov 2021 (implied ongoing) | https://arxiv.org/abs/2301.00677 | 2027-05-12
NSSDC Mars fact sheet values (6.36 mb, 11.0 km, 214 K, 43.49) — revised periodically | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html | 2027-11-12

## Wiring (for the coordinator)
- Index label EN: `MAVEN & Where Mars's Air Went` · RU: `MAVEN: куда делся воздух Марса` · codename `ESCAPE`, category mars.
- llms.txt: `How Mars lost its atmosphere: scale height and exobase, Jeans escape of hydrogen (calculator for Mars and Earth), hot oxygen from O2+ recombination versus escape energy, ion pickup and sputtering, why gravity matters more than the missing magnetic field, MAVEN's 2014–2025 loss budget (2–3 kg/s) and its loss in December 2025, solar-storm boosts, argon 38/36 and D/H Rayleigh distillation, and four billion years of loss under a brighter young Sun.`
- MOD.json: 4 rows (Mars Express launch, MAVEN launch, MAVEN orbit insertion, Hope launch), type `mars`.
- Suggested related.json: transfer-earth-to-mars, jezero-perseverance-rover, skycrane-curiosity-rover, corona-parker-solar-orbiter. Neighbours to link here: jezero-perseverance-rover, skycrane-curiosity-rover (SAM argon), transfer-earth-to-mars.

## Response to review (2026-11-12)
Panel verdict: APPROVE WITH CHANGES (REVIEW.md). Changes:
- Jeans model note: "Above λ ≈ 1.5" corrected to "Below λ ≈ 1.5" (EN; RU and the status code were already right). Check added.
- Mars Express: the June 2026 ESA Science Programme Committee meeting endorsed a further extension; no new end date was published as of 2026-11-12. The text was updated (EN + RU) and new ref [33] added (ESA, 11 June 2026). Check added. This replaces the "unverified 2025 review" item above.
- Jeans eq-note "many powers of ten" → "a factor of about 300 for Mars's hydrogen" (EN + RU). Check added (315×).
- Timeline 2018: "at least 0.8 bar" → "as much as 0.8 bar …, probably a lower limit", matching [5].
- Refs [9] and [18] are labelled "52nd ESLAB Symposium, ESA/ESTEC, (14–)18 May 2018". For [18] the day of the talk is not printed. Its numbers re-checked against the slides and the Icarus abstract.
- RU: Герберт Гунелл; «в ранние эпохи именно бури…»; the storm-slider note sentence was rebuilt.
- First names Herbert Gunell and Stas Barabash verified (A&A byline / BIRA; IRF release).
- Left as SHOULD: the chapter 5 title follows the ×20 preset; Ribas's own τ^−1.23 fit was not opened; Hope/Tianwen-1 status was not stated.
- 33 references, 73 checks, `./check-all.sh escape-maven-mars-atmosphere` = ALL OK.

Freshness update:
claim | source URL | review-by date
--- | --- | ---
Mars Express extension endorsed June 2026, end date not published as of Nov 2026 (replaces the 2023 row) | https://www.esa.int/Science_Exploration/Space_Science/ESA_science_missions_get_green_light_for_new_discoveries | 2027-01-15
MAVEN final review-board report still unpublished as of 2026-11-12 ("expected later in 2026") | https://www.collectspace.com/news/news-060326a-maven-mars-atmosphere-probe-end-mission.html | 2027-01-15
