# SPECTRUM — Spectroscopy: what starlight says (Wave 6)

**Purpose:** show how a spread-out spectrum tells us composition, temperature and motion, from Newton's prism to the first planet around a Sun-like star, with every quoted number either sourced or computed and checked. **Audience:** interested non-specialists; equations sit in eq-boxes.
**Owner:** Wave 6 author team (fork), 2026-10-11. **Category:** `foundations` (see Wiring).

## Structure
10 chapters, lede "Ten chapters and four instruments" (generated-guide convention: every chapter counts, REFERENCES included).
1. Prism — Newton 1666/1672; eq-box: 2° 49′ ÷ 31′ ≈ 5.5; cross-link PARABOLA (Newton's turn to mirrors).
2. Dark lines — Fraunhofer 1814–17: ~574 lines between B and H, lamp line at D, Sirius's three stripes; eq-box C/D/F/H(+K) identifications.
3. Fingerprints — Kirchhoff & Bunsen 1859–60, equivalent width (atlas definition). **Instrument 1 (line matcher):** 1966 solar atlas strip 380–700 nm vs NIST laboratory lines for H, Na, Mg, Ca, Fe, He; readouts: lines shown, matches (≤ 0.03 nm), strongest match and its equivalent width.
4. Helium — Janssen 18 Aug 1868 (Guntur), Lockyer 20 Oct 1868, D₃, Ramsay/cleveite 1895, Crookes; eq-box D₃ vs D₁/D₂ spacing.
5. Ladder — Balmer 1885, Rydberg 1890, Bohr (Nobel 1922). **Instrument 2:** Lyman/Balmer/Paschen, upper level 2–12; Rydberg formula with reduced mass + Peck & Reeder air conversion vs NIST Ritz wavelengths, Balmer's 1885 formula, photon energy.
6. Harvard — Fleming (10,351 stars, 1890), Cannon (1901; HD 225,300 stars 1918–24); chart of HD class counts computed from VizieR with Mamajek dwarf temperatures.
7. Payne — temperature sequence, the "almost certainly not real" sentence, Russell 1929, Struve's verdict. **Instrument 3 (stellar thermometer):** Planck curve + Boltzmann×Saha share of H in level 2 vs T, electron-pressure slider, presets M0V/Sun/A0V/B0V. Chart: atoms per Si, Payne 1925 vs Asplund 2021.
8. Wobble — ELODIE, 51 Peg b. **Instrument 4:** RV curve from planet mass × sin i, period, star mass; presets 51 Peg b / Jupiter–Sun / Earth–Sun; readouts K, a, Δλ at 589 nm, share of an ELODIE resolution element; ±13 m/s band.
9. Legacy — cross-links UNFOLD (Webb), BURST, DARK, GLOW; timeline 1666–2021 (21 entries).
10. References — 35 sources (31–35 added in review: Maury 1897, Hertzsprung 1909, Wollaston 1802, Kirchhoff & Bunsen 1861, Baranne et al. 1996).

## Sources per key number (all opened/downloaded 2026-10-11)
- Newton: 1666, "about five times", 2° 49′ vs 31′, experimentum crucis, "Heterogeneous mixture of differently refrangible Rays", "took Reflections into consideration" — Newton Project transcription of Phil. Trans. 6, 3075 [1].
- Fraunhofer: "zwischen B und H ungefähr 574 Linien" (checked on the page image, Ostwald ed. p. 14), lamp line R at D, Sirius "drei breite Streifen … einer im Grünen und zwei im Blauen", presented 12 April 1817 — archive.org scan of the 1905 reprint [2].
- Kirchhoff/Bunsen: paper metadata via Crossref [3]; autumn 1859 sodium-flame experiment, the quoted law, caesium and rubidium (1860), Bunsen's hot low-luminosity flame — DSB [4].
- 1966 atlas (NBS Monograph 61, 32 MB PDF) [5]: ~24,000 lines, 73 % identified, 63 elements, wavelengths in air, equivalent-width definition, "Lines of He I and He II conspicuous in the spectrum of the chromosphere", no He identification at 5875.6 Å (only Atm H₂O). Equivalent widths **checked by eye on page images** for 38 lines (33 at authoring, 5 more in review: Fe 3812.962 (322, blend), 3827.832 (897), 3834.233 (624), 3895.667 (361, blend), 3969.268 (52)): Ca II K 3933.682 (20253 mÅ, p. 112), H 3968.492 (15467, combined with Hε), Hε 3970.076 (76), H8 3889.05 (2346), H9 3835.39 (2362), Hδ 3133, Hγ 2855, Hβ 3680, Hα 4020, Na D₂ 752, D₁ 564 (blend), Na 5688.217 (121), Mg 3832.310 (1685), 3838.302 (1920), 5167.327 (935, blend with Fe 5167.508), 5172.698 (1259), 5183.619 (1584), 5528.418 (293), Ca 4226.740 (1476), 5857.459 (132, blend), 6439.083 (156), 6462.570 (216, blend), 6493.788 (133), Fe 3824.452 (519), 3878.580 (724), 3930.308 (108), 4045.825 (1174), 4307.912 (723, blend Fe/Ti/CH), 5269.550 (478, blend), 5328.051 (375), 5371.501 (294, blend), 6400.009 (181), 6494.994 (165). The 687 nm cluster is "Atm O₂" (rows checked in OCR text).
- The remaining ~285 background lines: automatic parse of the OCR text, kept only where EW ≥ 100 mÅ and the reduced width agrees with EW/λ within 30 % — not individually checked; OCR errors possible (stated in the page note).
- Lab lines: NIST ASD lines queries (H I, He I, Na I, Mg I, Ca I, Ca II, Fe I; observed air wavelengths, 380–700 nm) [6]. Fe list = the 30 strongest NIST Fe I lines in 380–700 nm by intensity (at authoring 6 were dropped; review flagged that as selection bias — 5 of the 6 had not matched only because their atlas rows had failed the OCR filter; those rows were checked by eye and added, and all 30 now match); Ca = Ca II H&K + strong Ca I lines; Na = D₁, D₂, 568.82; He = all He I lines with intensity ≥ 20 in range.
- Hydrogen reference wavelengths: NIST ASD **Ritz** values (Lyman vacuum, Balmer/Paschen air) [6]. Observed values for faint Paschen lines (e.g. 922.97) are quoted to only 0.01 nm, so Ritz is used throughout.
- Air index: Peck & Reeder five-parameter formula as used by ASD; reproduces ASD's own example 200.0648 nm vac = 200.0000 nm air [7]. (The formula's coefficients themselves are not printed on the NIST help page; they are the standard Peck & Reeder 1972 values, validated by that example.)
- Helium story: Marshall & Marshall 2012 (HEXAGON) [8] — dates, Guntur, C/F/D lines, Hampstead, 26 Oct reading, D₃ naming, Frankland, cleveite, Crookes's 587.45 vs 588.91/589.51 nm; EB1911 "Helium" (Strutt) [10]; Ramsay 1895 metadata via Crossref [9]; Nobel 1904 citation [11].
- Balmer: metadata [12]; formula, h = 3645.6 × 10⁻⁸ cm, Ångström's four lines, fifth predicted, ~1 in 1000, teaching career — DSB [13]. Rydberg 1890, wavenumbers, N₀ = 109,721.6 — DSB [14].
- CODATA 2022 R∞, mp/me, me — NIST cuu pages [15]; Bohr citation [16].
- Fleming 10,351 / A–Q / 99.3 % / 1881 / ~200,000 plates — DSB (Gingerich) [17]; Cannon 1901 1,122 stars, HD 225,300, 1911–15, > 3 stars/min, 1924 — DSB (Gingerich) [18].
- HD class counts — computed from VizieR III/135A catalog.dat (HD ≤ 225300): K 60,615; A 57,852; F 42,988; G 41,994; B 16,789; M 4,396; O 169; other (P, N, R, C, S, blank) 497; total 225,300 [19]. Faint limit ~9 mag from the ADC documentation (adc.doc) in the same VizieR entry.
- Dwarf Teff — Mamajek table v2022.04.16 [20].
- Payne: Table XXVIII (p. 184, page image checked): H 11, He 8.3, Na 5.2, Mg 5.6, Si 4.8, Ca 4.8, Fe 4.8 (neutral-atom rows); p. 188 quote; "maximum in the neighborhood of Class A0" — archive.org scan [21]. Arrival 1923, Saha, Russell's persuasion, Struve quote — DSB [22].
- Russell 1929 abstract (60 H : 2 He : 2 O : 1 metals : 0.8 e⁻ by volume) and p. 65 "very gratifying agreement" — ADS scan [23].
- Asplund et al. 2021 Table 2 and abstract mass fractions [24]; H ionization energy 13.598434599702 eV — NIST ASD [25].
- 51 Peg: P = 4.2293 ± 0.0011 d, K = 59 ± 3 m/s, e = 0, 0.47 ± 0.02 M_J, 6 Oct announcement, confirmations — IAUC 6251 [26]; ELODIE R = 42,000, 390–680 nm, 13 m/s, ~5,000 lines, 142 stars, 23 Nov publication, Jupiter ±13 m/s over 12 yr, "Jupiter-mass companion ought to have a much longer period" — Nobel scientific background [27]; citation [28].
- GM of Sun, Jupiter, Earth; Jupiter period 4,332.589 d; Earth year 365.256 d; Teff 5,772 K — NSSDC fact sheets [29][30].

## Computed (checks.js, 79 checks after review)
Newton ratio 5.45; K/D₂ 26.9; all 7 Balmer, 3 Na, 7 Mg, 8 Ca, 30 Fe lab lines land within 0.03 nm of an atlas line, 0 of 8 He lines (He 587.56 nm is 1.435 nm from the nearest listed line, D₂); Peck & Reeder reproduces NIST's example to 10⁻⁵ nm; D₂ − D₃ 1.433 nm, D₁ − D₂ 0.597 nm; R_H = 109,677.583 cm⁻¹; Rydberg 1890 +0.0401 %; Rydberg formula within 0.0179 nm of all 31 NIST Ritz lines; Hα 656.2883 nm air, Lyα 121.5684 nm vacuum; Balmer 1885 ≤ 0.0113 % (n = 3–12); Balmer's h 0.041 nm below the air series limit; level 2 − level 1 = 10.1988 eV = NIST 82,259.158 cm⁻¹; Hα photon 1.889 eV; HD counts sum to 225,300; Balmer-strength peak 9,872 K at Pe = 20 Pa (1.8 % from A0V 9,700 K), 9,522–10,785 K for 10–100 Pa; Sun 1 in 2.0 × 10⁸ H atoms in level 2; Wien 502 nm; nearest type G2V; H/Si 1.58 × 10⁶ (Payne) vs 30,903 (2021); X+Y+Z = 1; 51 Peg b m sin i 0.4696 M_J and a = 0.0512 AU with M★ = 1 M☉; Jupiter K 12.46 m/s; Earth K 8.95 cm/s; 59 m/s at 589 nm = 0.1159 pm = 1/121 of λ/42,000; UI fresh-load and RU/EN rendering checks.

## Assumptions / limitations
- Line matcher: tolerance 0.03 nm; solar wavelengths include the Sun's gravitational/convective shifts (~0.002 nm at D), far below the tolerance. A "match" is a coincidence in wavelength, which is how identification works but is not proof by itself.
- Thermometer: LTE, hydrogen only, Z_I = 2 (rungs above 2 ignored), Z_II = 1; the electron pressure (default 20 Pa) is an illustrative value, not sourced (the panel's Carroll & Ostlie recollection could not be opened, so it is not cited); star presets reset it to 20 Pa; the curve is a sketch of Payne's reasoning, not her calculation. The upper panel is a pure Planck curve.
- Wobble: circular, edge-on orbits; K for planets uses GM (G·M) so G itself is not needed.
- HD chart: classes by the first letter of the printed type; "other" lumps P (planetary nebulae/peculiar), N, R, C, S and 4 blanks. The brightness-limit explanation for A/K dominance is general reasoning, worded as "favours", not a cited result.
- Payne comparison uses her neutral-atom values; Russell noted her zero point differs (he added 1.9) — the per-silicon normalization removes the zero point.
- Colours of spectrum strips are approximate (display only).

## Unverified / judgment calls
- The Fraunhofer letter identifications C, F (hydrogen) come from Marshall & Marshall's account of Janssen [8]; D (sodium) from the DSB [4]; H and K from the atlas [5]. E, b, G are not labelled because no opened source states their modern identifications.
- Mayor & Queloz's Nature paper itself was not readable (paywall; ADS returned 403/504); its numbers come from IAUC 6251 and the Nobel scientific background, which quote it.
- Lockyer 1868 and Ramsay 1895 papers were not readable (Royal Society blocks scripts); only their metadata was checked; the narrative relies on [8] and [10].
- Wollaston 1802: now cited from the Internet Archive scan of Phil. Trans. 92 (p. 378: four colours bounded by lines A–E, "other distinct dark lines, f and g").
- Rubidium: now "caesium, announced in 1860, and rubidium, described in their second paper of 1861" — supported by the Crossref record of the 1861 Annalen paper (vol. 189, p. 337) and EB1911 "Rubidium", which cites p. 337 for the discovery; the DSB's "(1860)" is noted in ref [4].
- "Most lines are under 0.01 nm" (100 mÅ) is from the OCR parse (only ~386 of ~14,900 parsed rows in 380–700 nm reach 100 mÅ), not a stated atlas figure.

## Wiring (for the coordinator)
- Codename **SPECTRUM** / RU **СПЕКТР**. Category **`foundations`** ("Foundations & Tools"): spectroscopy is a method used by every telescope guide, not a mission, and it sits naturally beside the other method guides there (RESONANCE on waves and spectra of sound, the physics of spaceflight, SLINGSHOT). `telescopes` would also work if the coordinator prefers to keep all Wave 6 together.
- Index label EN: `Spectroscopy: What Starlight Says` · RU: `Спектроскопия: о чём говорит свет звёзд`.
- llms.txt: `Spectroscopy from Newton's prism to exoplanets: the 1966 solar atlas's dark lines matched to NIST laboratory lines (sodium, iron, hydrogen — and no helium), helium found in the Sun in 1868 and on Earth in 1895, hydrogen's Rydberg ladder checked against NIST to 0.02 nm, the Harvard classification (225,300 HD stars), Cecilia Payne's 1925 temperature sequence and hydrogen-rich Sun, and the 59 m/s Doppler wobble of 51 Pegasi b.`
- `python3 _tools/wire.py spectrum-spectroscopy SPECTRUM "Spectroscopy: What Starlight Says" "Спектроскопия: о чём говорит свет звёзд" foundations "<llms line>"`
- Links out to `parabola-mirrors-and-dishes`, `james-webb-space-telescope`, `burst-gamma-ray-bursts`, `dark-euclid-roman`, `glow-cosmic-microwave-background` — wire after (or with) BURST, DARK and GLOW, or those links will point to unwired-but-present pages (the HTML files exist).

## Response to review (REVIEW.md, 2026-10-12)

### MUST-FIX — all applied, each with a check
1. **Hα status ppm** — the status now prints the computed difference (10 ppm); check ties the number in the status to |λ_model − λ_NIST|/λ_NIST.
2. **Wobble readouts** — shift ≥ one ELODIE element prints "× N elements"; tiny shifts use scientific notation (no "0.00 fm"); K ≥ 1,000 m/s grouped; y-axis switches to km/s above 10,000 m/s. Checks at both slider extremes.
3. **SVG labels** — ladder (labels only n = 1–3, ∞ and the chosen level; eV labels clear of the strip; two-line series description), thermometer (taller viewBox, short top caption, two-line bottom title, type ticks B0V/A0V/F0V/G2V/M0V, end-anchored "2,000"), HD chart (two-line caption, white labels inside long bars), abundance chart (taller viewBox, two-line legend, short note), matcher (axis ends at x = 455), wobble (ELODIE legend moved under the chart, "0" tick start-anchored). New check: every SVG text label stays inside its viewBox and overlaps no other label, using a 14 px × 0.6 em monospace estimate (the phone size), in EN and RU over 12 instrument states each. Screens at 1300 and 390 (EN; 390 tail via a temporary copy hiding hero–CH.06; RU at 1300 via a temporary copy) show no overlaps; temporary copies and their shots deleted.
4. **Antonia Maury** — new CH.06 paragraph (assigned 1888, 681 stars, "alone responsible", 22 groups, divisions a/b/c, division c "must differ more decidedly in constitution") from the ADS scan of Harvard Annals 28 (preface + ch. I, pp. 1–5, read on page images) [31]; Hertzsprung's use of her c stars from his 1909 AN paper (page image) [32]; timeline 1897 and 1909; meta description names her. Check covers paragraph, timeline and references.
5. **meta.json** — "found — and doubted — a hydrogen-dominated Sun"; og "primary and historical sources". Check reads meta.json.
6. **RU grammar** — «её убедил — главным образом Генри Норрис Расселл, — что здесь какая-то ошибка». Check.

### SHOULD — applied
- 1.2 chance-coincidence sentence (EN/RU) in the matcher note; dropped-Fe-lines disclosure (now all 30 restored, see Sources).
- 1.3 Saha box: N_H (all), N_H⁰ (neutral), N_H⁺; Boltzmann factor written as 4e^(−10.20 eV/kT)/(1 + …); the absorbed 2·Z_II/Z_I = 1 stated; superscripts and three-line layout (also 3.6).
- 1.5 "main driver of Balmer-line strength" in chart title and eq-note (opacity caveat).
- 1.6 "a star of 1.1 Suns would give 0.50" (computed, no claim about 51 Peg's actual mass); 1.7 "about 10 ppm throughout".
- 2.1 rubidium 1861 (body, timeline, ref [4] note, new ref [34]); 2.2 "seen in the Sun 27 years before it was recognised on Earth" (eq-note, timeline); 2.3 Balmer's 1/1000 now refers to the further lines; 2.4 "Before 1925" (Fe status); 2.5 "first glimpsed in 1925 and accepted only after 1929" (H status); 2.6 Sirius "almost certainly"; 2.7 HD "other" = classes P, N, R, "Con", S (no carbon-star claim — not in an opened source); 2.8 ref [6] mentions Ritz values.
- 3.1 Sun-range status adds "Only 1 hydrogen atom in 2.0 × 10⁸ … Payne's discovery in miniature"; 3.2 RV axis now "away (+) / towards (−)" with the note "as astronomers plot them"; 3.3 redshift ≠ wobble wording (EN/RU); 3.4 hero kicker "1966 SOLAR ATLAS · 380–700 nm"; 3.5 star presets reset Pe to 20 Pa.
- 4.2–4.8 Russian: «уже 0,01 нм», «не соответствует действительности» (body + ref), «электронное давление» (label, eq-note, note, aria), «на свой, строго определённый угол», «справочник — о том», «состоят из разных веществ», «подтверждает расстояния до … по их спектрам», timeline 1895; 4.9 «со щепоткой», «Готовая настройка», «РАЗЛОЖЕННЫЙ В СПЕКТР», «(числе волн на сантиметр)», ppm unit as «ppm».
- 5.3 readouts above 10⁶ in scientific notation; 5.4 HD note: dwarf temperatures are "a guide to each class, not to the particular stars counted here".
- 6.3 Wollaston (sourced, see above); 6.4 André Baranne and colleagues, ref [35] (Crossref metadata of A&AS 119, 373); 6.5 "Charlotte Moore" named; Per Teodor Cleve's independent 1895 find (Marshall & Marshall [8]); Langlet not added (not in an opened source).
- Extra found in screenshots: full-width charts (HD, abundance) were scaled ~2.5× at 1300 px — capped at 640 px.

### Declined / deferred
- 1.4 Carroll & Ostlie for 20 Pa: the book could not be opened, so not cited; 20 Pa stays labelled "illustrative … not a measurement or a cited figure".
- 5.4 "most HD K stars are giants": not stated as fact (no opened source); replaced by the neutral "guide to each class" wording.
- 6.1 extras: "c kept in the 1922 IAU system" and "first Annals volume credited to a woman" not added (not in an opened source); Hertzsprung's quoted praise (from the AAVSO talk) not used — the 1909 paper itself is cited.
- 5.5 live state in SVG aria-labels (NICE): not done; statuses are aria-live and carry the values.
- Fraunhofer letter "b" (Mg): left unlabelled; the atlas identifies the lines as Mg I but no opened source ties Fraunhofer's "b" to them.
- 6.5 pay/status of the Harvard computers: not added (no opened source).
