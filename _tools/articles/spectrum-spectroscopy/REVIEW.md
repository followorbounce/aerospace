# REVIEW — SPECTRUM (Spectroscopy: what starlight says)

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Six MUST-FIX items, all small: one wrong number in a status line, two reachable readouts with wrong text, several SVG labels that overlap or are clipped, one omitted credit (Antonia Maury), one overclaim in the page metadata, and one Russian grammar error. The physics re-derives cleanly. The HD class counts reproduce exactly from a fresh download of the catalogue.

Scripts and data: `/tmp/claude-1000/-home-none-git/06c72027-ac75-419c-ade6-f25cd6b4035c/scratchpad/rev/`:
- `phys.py`: Rydberg/Balmer vs NIST, Saha–Boltzmann, Planck/Wien, RV.
- `hd/catalog.dat.gz`: fresh CDS download of III/135A.
- `stat.js`: chance-coincidence rate of the line matcher.
- `fuzz.js`: jsdom sweep of every slider and button in EN and RU.
- `ph_*.png`, `tail_*.png`, `ru_*.png`: extra screenshots.

`./check-all.sh spectrum-spectroscopy` → **ALL OK** (64 checks pass; errors 0, offStep [], missingRu 0).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

**Independent re-derivation** (Python/scipy, CODATA 2022, Peck & Reeder air index):

| Quantity | Reviewer | Page |
|---|---|---|
| R_H = R∞/(1 + mₑ/mₚ) | 109,677.583 cm⁻¹ | 109,677.58 ✔ |
| Peck & Reeder on NIST's example 200.0648 nm vac | 199.99999 nm air | ✔ |
| Hα (Rydberg, air) vs NIST Ritz 656.2819 | 656.2883 nm, +0.0064 nm = **9.8 ppm** | readout "10 ppm" ✔, status "**15 ppm**" ✘ |
| Lyα (vacuum) | 121.5684 nm (+11.8 ppm vs 121.56701) | ✔ |
| Max Rydberg–NIST gap, 31 lines | 0.0179 nm (Paschen α, 1875 nm); every line is 7.5–11.8 ppm | "up to 0.02 nm" ✔ |
| Balmer 1885 (h = 364.56 nm) vs NIST, m = 3–12 | −0.0106 … −0.0113 % | "≤ 0.012 %" ✔ |
| Balmer's h vs series limit in air | 364.601 nm, so h is 0.041 nm below | ✔ |
| Rydberg 1890 N₀ excess | +0.0401 % | ✔ |
| E(n=2) from 82,259.158 cm⁻¹; Hα photon | 10.1988 eV; 1.8887 eV | ✔ |
| Balmer peak, Pₑ = 20 Pa | **9,872 K** (golden-section and scipy agree) | 9,870 ✔ |
| Peak vs Pₑ: 1 / 5 / 10 / 50 / 100 / 1000 Pa | 8,506 / 9,193 / 9,522 / 10,374 / 10,785 / 12,391 K | "9,500 to 10,800 K for 10–100 Pa" ✔ |
| Partition function to n = 3 instead of n = 2 | peak unchanged (≤ 1 K) | the Z_I = 2 truncation is harmless ✔ |
| Sun: atoms in n = 2; ionized share | 1 in 2.009 × 10⁸; 5.6 × 10⁻⁴ % | ✔ |
| Wien peak, 5,772 K (closed form and numerical Planck) | 502.04 nm | ✔ |
| 51 Peg b m sin i (K 59, P 4.2293 d, 1 M☉) | 0.4696 M_J; K = 56–62 m/s → 0.446–0.493 | 0.47 ± 0.02 ✔ |
| Same with a modern star mass of 1.05–1.11 M☉ | 0.485–0.503 M_J | (see SHOULD 1.4) |
| a | 0.0512 AU | ✔ |
| Jupiter / Earth reflex speed | 12.459 m/s / 8.946 cm/s | ✔ |
| Δλ(59 m/s, 589 nm); λ/R (R = 42,000) | 0.1159 pm; 14.02 pm, ratio **121.0** | ✔ |
| Newton 169′/31′; Ca K/Na D₂ EW; D₂−D₃ / D₁−D₂ | 5.45; 26.9; 1.433 / 0.597 nm (×2.40) | ✔ |
| Payne / Asplund H per Si | 1.585 × 10⁶ / 30,903 | ✔ |
| **HD counts**: CDS III/135A catalog.dat, HD ≤ 225300, first letter of SpT | K 60,615; A 57,852; F 42,988; G 41,994; B 16,789; M 4,396; O 169; P 196, N 149, R 82, "Con" 62, S 4, blank 4 → other 497; total 225,300 | all exact ✔ |
| HD photovisual magnitude: median / 95th percentile | 8.9 / 10.4 | "about 9th magnitude" ✔ |

Line-matcher statistics (`stat.js`): the displayed atlas list holds 317 lines in 380–700 nm. A ±0.03 nm window around them covers **5.7 %** of the axis, so a random lab line "matches" by chance with p ≈ 0.06. The iron result, 24/24, is therefore far beyond chance (p ~ 10⁻³⁰). Helium's 0/8 is also consistent: 0.45 chance matches were expected. He 388.865 misses H8 (388.905) by only 0.040 nm.

Findings:
1. **MUST — Hα status gives the wrong precision.** Status: *"Two integers and one constant give its wavelength to about 15 parts per million"* / «…с точностью около 15 миллионных». The readout beside it says 10 ppm, and the true value is 9.8 ppm. Fix: "about 10 parts per million" / «около 10 миллионных». Add a check that ties the status to `Math.abs(lw-obs)/obs`.
2. **SHOULD — the 0/8 helium result holds only because faint lines are filtered out.** The full atlas has ~15,000 lines in 380–700 nm (~47 per nm). Against that list, almost any lab line would land within 0.03 nm of *some* line (P ≈ 1 − e^(−47×0.06) ≈ 94 %). Add one sentence to the instrument note, EN: "Only lines of at least 100 mÅ are shown; against all 24,000 atlas lines almost any wavelength would find a faint neighbour within 0.03 nm by chance, which is why real identification needs several lines with the right relative strengths." RU: «Показаны только линии не слабее 100 мÅ; среди всех 24 000 линий атласа почти любая длина волны случайно нашла бы слабую соседку ближе 0,03 нм, поэтому настоящее отождествление требует нескольких линий с правильным соотношением интенсивностей.» Also state in NOTES whether the 6 iron lines dropped "in crowded/blended spots" matched or not. Selecting lines after looking at the result is a selection bias.
3. **SHOULD — Saha box notation.** In `N₂/N_H = … × 1/(1 + N_H⁺/N_H)`, `N_H` means *all* hydrogen on the left and *neutral* hydrogen on the right. Write `N_HI` for neutral hydrogen, or `N_H⁺/N_H⁰`. Also state that the prefactor 2·Z_II/Z_I = 1 has been absorbed. As written, a reader checking against a textbook will look for a missing factor.
4. **SHOULD — the 20 Pa default can be sourced.** Carroll & Ostlie, *An Introduction to Modern Astrophysics*, use Pₑ ≈ 20 N m⁻² in their Balmer-strength example and find a peak near 9,900 K. That matches the 9,872 K here. (This is from reviewer recollection of the 2nd ed., §8.1; check the edition and page before citing.) Citing it would turn "illustrative, not sourced" into a sourced textbook value.
5. **SHOULD — the "Balmer strength" label claims more than the model computes.** The bottom panel is titled *"strength of the Balmer lines: hydrogen atoms in level 2"*. The model computes N₂/N_H only. Real line strength also depends on the continuous opacity (H⁻), which changes strongly with T. Retitle as "hydrogen atoms in level 2 — the main driver of Balmer-line strength (peak = 1)" / «атомы водорода на уровне 2 — главный фактор силы линий Бальмера (максимум = 1)».
6. **NICE** — 51 Peg's modern mass (~1.1 M☉) gives m sin i ≈ 0.50 M_J. One clause in the wobble note, "(a modern mass of about 1.1 Suns gives 0.50)", would show how the answer depends on M★.
7. **NICE** — "differs from NIST by up to 0.02 nm" is clearer in relative terms: "by about 10 parts per million throughout".

## 2. Research / fact-check — APPROVE WITH CHANGES

Checked against sources I opened myself:
- **DSB Kirchhoff** (text extracted): the autumn 1859 sodium-flame darkening ✔. "On the day following the surprising observation, Kirchhoff found the correct interpretation" ✔ ("the next day"). The quoted law ✔. "its very first systematic application … led Bunsen to the discovery of … cesium and rubidium (1860)" ✔ as DSB wording; see finding 1.
- **DSB Balmer**: girls' secondary school from 1859, part-time university lecturer 1865–90 ✔. Hagenbach-Bischoff told him the fifth line had been observed ✔. The **"one part in one thousand"** refers to the comparison with the *additional* (mostly stellar) lines, not to Ångström's four. See finding 3.
- **DSB Fleming**: 1881, "after a period of domestic work for Pickering … fulltime copyist and computer" ✔; nearly 200,000 plates by 1910 ✔.
- **DSB Cannon**: rearranged the groups, omitted some letters, "continuous series" ✔; 1901, 1,122 stars ✔; > 3 stars/min ✔; HD in Annals 91–99 ✔.
- **DSB Payne-Gaposchkin**: arrived September 1923 ✔; Saha 1920–21 ✔; persuaded "largely by … Henry Norris Russell" ✔; the Struve quote (Struve & Zebergs 1962, p. 220) ✔.
- **HD catalogue**: counts re-derived exactly (§1).
- **Dates from general reference** (not re-opened here; standard and consistent with the cited sources): Newton's letter, Phil. Trans. Feb 1672 ✔; Janssen at Guntur 18 Aug 1868, Lockyer 20 Oct, both read in Paris 26 Oct ✔; Ramsay's cleveite, March 1895 ✔; Ramsay's Nobel 1904 ✔; Bohr's Nobel 1922 ✔; 51 Peg announced in Florence 6 Oct 1995 (Cool Stars 9), Nature 378, 355, 23 Nov 1995 ✔; Lick (Marcy & Butler) and CfA/HAO confirmations ✔.

On the items NOTES lists as unverified:
- **Fraunhofer letters**: C = Hα, F = Hβ, D = Na, H/K = Ca II are the standard identifications and are correct. b (Mg triplet near 517 nm) could safely be labelled too, because the atlas itself identifies those lines as Mg.
- **The Mayor & Queloz paper**: the page's numbers (P, K, 0.47 M_J, 142 stars, 23 Nov) agree with IAUC 6251 and the Nobel background. No discrepancy.
- **Lockyer 1868 / Ramsay 1895**: the narrative matches the standard account.
- **Rubidium**: see finding 1.
- **Wollaston**: see Ethics 3.

Findings:
1. **SHOULD — rubidium is 1861.** Caesium was announced in May 1860 (Dürkheim mineral water). Rubidium was announced in February 1861 (lepidolite), and the second Kirchhoff–Bunsen paper (Ann. Phys. 1861) reports both. The DSB's "(1860)" compresses this. Fix EN: "…and within a year the method had turned up two new elements, caesium (1860) and rubidium (1861) [4]". RU: «…а меньше чем за год метод принёс два новых элемента — цезий (1860) и рубидий (1861) [4]». Change the 1860 timeline entry the same way. Citing the 1861 paper's Crossref record would also do.
2. **SHOULD — "Helium was named 27 years before anyone had a sample."** The 27 years run from the 1868 *detection*. The name was coined by Lockyer (and Frankland) a little later and first used publicly in 1871 (Kelvin's BA address). Also, Hillebrand had released the gas from uraninite in 1890 without recognising it. Fix EN: "Helium was seen in the Sun 27 years before it was recognised on Earth." RU: «Гелий увидели на Солнце за 27 лет до того, как его распознали на Земле.» The lede already says "found … 27 years before", which is correct.
3. **SHOULD — Balmer's "one part in a thousand" is misplaced.** As written, the sentence reads as if the formula matched Ångström's four lines only to 1/1000. Balmer's own comparison with Ångström agreed far better: the page's own readout shows 0.011 % against modern values, and Balmer reported about 1/40,000 (reviewer's recollection of the 1885 paper; the DSB does not give it). Fix EN: "…along with more, which the formula also matched, to within about one part in a thousand [13]." RU accordingly: «…а с ней и другие; формула совпала и с ними — примерно до одной тысячной [13]».
4. **SHOULD — "In 1925 that was taken as a sign of how much iron there is"** (Fe status). The belief that the Sun resembled Earth's crust predates 1925 (Russell 1914), and Payne's work is the 1925 event. Fix: "Before 1925…" / «До 1925 года…».
5. **SHOULD — "Hydrogen is the commonest element in the Sun — but that took until 1925 to see"** (H status). Payne saw it in 1925 and called it "almost certainly not real". It was accepted after Russell 1929. Fix EN: "…first glimpsed in 1925 and accepted only after 1929 (chapter 7)". RU: «…впервые это увидели в 1925 году, а признали лишь после 1929 года (глава 7)».
6. **SHOULD — the Sirius stripes as Hβ, Hγ, Hδ.** The ladder status presents the identification as fact. It is a modern interpretation and a very plausible one (Sirius is A1V), but Fraunhofer's source does not say it. Fix EN: "…almost certainly the 'three broad stripes' Fraunhofer saw in Sirius…" / «…почти наверняка это те „три широкие полосы“…».
7. **NICE** — the HD "other" note says *"mostly rare carbon-star and peculiar types"*. In the file: carbon stars R + N = 231; P (planetary nebulae, with Pa–Pf) = 196, including 82 "Pec"; "Con" = 62; S = 4. Fix: "carbon stars (R, N), planetary nebulae (P) and peculiar or composite spectra". NOTES should also note that "C" in the file is "Con", not carbon class C, which postdates the HD.
8. **NICE** — the NIST ref [6] note says "Observed wavelengths … used for every laboratory line", but the ladder uses Ritz values. Add "(Ritz values for the hydrogen ladder)".

## 3. Science Communication & Education — APPROVE WITH CHANGES

The guide teaches well. Every number is traceable. The thermometer openly says it is "a sketch of Payne's reasoning, not her calculation". The 687 nm telluric band is flagged. The helium null result in Instrument 1 is a lovely piece of teaching design.

1. **SHOULD — the Sun preset says "Too cool for strong Balmer lines"**, yet chapter 3 just showed Hα (4.0 Å) and Hβ (3.7 Å) among the Sun's strongest lines. A careful learner will see a contradiction. This is also exactly Payne's point, so make the tie explicit. Add for T in roughly 5,000–7,000 K, EN: "Only 1 hydrogen atom in 200 million is in level 2 — yet Hα is still a strong line in sunlight, because there is so much hydrogen. That is Payne's discovery in miniature." RU: «На уровне 2 лишь один атом водорода из 200 миллионов — и всё же Hα в солнечном свете сильная линия, потому что водорода очень много. Это открытие Пейн в миниатюре.»
2. **SHOULD — the RV sign convention is inverted.** Axis: *"star's speed towards (+) / away (−)"*. Astronomers use + for receding (redshift), as in Mayor & Queloz's own curves. Use "away (+) / towards (−)" and flip the curve. Or keep the axis and add "(astronomers usually plot the opposite sign)".
3. **SHOULD — "A redshift is the wobble of chapter 8 stretched by the expanding universe."** Cosmological redshift is not a Doppler wobble. Fix EN: "A redshift is measured exactly as in chapter 8, by Δλ/λ — though for distant galaxies it comes from the stretching of space, not from motion through it." RU: «Красное смещение измеряют так же, как в главе 8, — по Δλ/λ, хотя у далёких галактик оно возникает из-за растяжения пространства, а не из-за движения в нём.»
4. **SHOULD — the hero kicker "380–700 nm · 24,000 lines"** implies the instrument shows 24,000 lines. It shows 317. The atlas's 24,000 span 293–877 nm. Use "380–700 nm · 317 of 24,000 solar lines" or simply "1966 SOLAR ATLAS".
5. **SHOULD — preset buttons do not reset the electron pressure.** After Pₑ = 1000 Pa, pressing "A0 DWARF" reports "Too cool…" while the page says Payne found the peak at A0. Either reset Pₑ to 20 Pa on any star preset, or add the current Pₑ to the status ("at Pₑ = 1,000 Pa the peak moves to 12,390 K").
6. **NICE** — the Saha box is set as ASCII (`e^(−10.20 eV/kT)`, `(2πmₑkT/h²)^(3/2)`). On phones it wraps into five lines. Superscripts (e^−10.20 eV/kT as `e<sup>…</sup>`) or a two-line layout would read better.
7. **NICE** — the "Payne 1925" bars are stellar-atmosphere averages, not the Sun alone. Legend: "Payne 1925, stars [21]".

## 4. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is fluent and the terms are correct. Indeclinable female surnames are handled right throughout («атлас Мур», «найденный Пейн», «классифицированных Кэннон», «Флеминг»), as are «теория Саха», ионизованный, длины волн Ритца, эквивалентная ширина and «за считаные недели». Decimal commas and units are consistent.

1. **MUST — a subject–verb error in the main narrative.** «её убедили, в основном Генри Норрис Расселл, что тут какая-то ошибка» puts a plural verb with a singular subject. Fix: «её убедил — главным образом Генри Норрис Расселл, — что здесь какая-то ошибка [22]».
2. **SHOULD — ambiguity.** «Большинство уже 0,01 нм» reads first as "most are *already* 0.01 nm". Fix: «Большинство линий — меньше 0,01 нм».
3. **SHOULD** — «почти наверняка не реально» → «почти наверняка не соответствует действительности» (in body [61] and ref [21]). The quoted sentence needs a natural rendering, not a calque.
4. **SHOULD — term.** «давление электронов» → the standard «электронное давление», both in the slider label «ЭЛЕКТРОННОЕ ДАВЛЕНИЕ» and in the eq-note and the aria-valuetext.
5. **SHOULD** — «каждый цвет преломлялся на своё постоянное значение» → «каждый цвет преломлялся на свой, строго определённый угол». In «весь этот справочник о том, как его читать», add the dash: «весь этот справочник — о том, как его читать».
6. **SHOULD** — «а не потому, что они сделаны из разного» → «а не потому, что состоят из разных веществ».
7. **SHOULD** — «„Джеймс Уэбб“ подтверждает свои самые далёкие галактики по спектрам» → «„Джеймс Уэбб“ подтверждает расстояния до самых далёких галактик по их спектрам».
8. **SHOULD** — timeline 1895: «Гелий найден на Земле через 27 лет после Солнца» → «…через 27 лет после того, как его увидели на Солнце». EN "27 years after the Sun" → "27 years after it was seen in the Sun".
9. **NICE** — «с щепоткой» → «со щепоткой». «Пресет» → «Готовая настройка». The readout unit «млн⁻¹» for ppm is formally correct but rare; «10 ppm» or «10 миллионных» reads more easily. «РАЗОБРАННЫЙ НА ЧАСТИ» → «РАЗЛОЖЕННЫЙ В СПЕКТР». «в волновых числах — числе волн на сантиметр» → «(числе волн на сантиметр)» to avoid the case clash.

## 5. Information Design & Frontend accessibility — APPROVE WITH CHANGES

The following were verified in jsdom (`fuzz.js`) and in Firefox screenshots I took myself: 1300 px and 390 px EN via `shot.sh`; 390 px chapters 7–10 and 1300 px RU via a scratch server, because the 14,000 px window cuts the phone page at chapter 8.

What works:
- **Every slider has `aria-valuetext`** in human units ("9,700 K", "0.470 Jupiter masses", "from level 3 down to level 2, 656.29 nanometres"), in both languages.
- Button groups use `aria-pressed` and have translated `aria-label`s.
- Statuses are `aria-live`, and touch targets are ≥ 44 px.
- No NaN, Infinity or undefined appears anywhere across ~2,000 swept states in EN and RU, and there are no script errors.
- Charts are honest: the HD bars are linear from zero; the abundance axis is labelled log with the baseline at Si = 1, which the caption explains; the temperature axis is marked "(log)"; the Planck and N₂ curves are labelled "peak = 1" / "glow shape"; the ELODIE band is labelled.
- Motion respects `reduced()`.

1. **MUST — wrong readout text in reachable states (wobble).**
   - (a) **"1/0"**: with mass at the maximum, P = 1–4 d and M★ = 0.1 M☉, K reaches 15–25 km/s. Δλ then exceeds an ELODIE element, and `Math.round(res/dl)` = 0 prints "SHARE OF ONE ELODIE RESOLUTION ELEMENT 1/0". When `dl >= res`, print "× " + fmt(dl/res, 1) ("3.5 elements") / «× 3,5 элемента».
   - (b) **"0.00 fm"**: with mass at the minimum, P = 10⁴ d and M★ = 2 M☉, the shift prints "0.00 fm" for a nonzero value. Use 2 significant figures or scientific notation below 0.01 fm.
   - Also: "25020.8 m/s" lacks digit grouping. Use `num()` for K ≥ 1000.
2. **MUST — SVG labels overlap or are clipped (both widths, both languages; seen in the screenshots):**
   - Thermometer: the top axis caption *"wavelength, nm — glow shape at this temperature"* (y = B + 26 = 146) collides with the bottom title (y = Tp2 − 6 = 154). Move Tp2 down by ~20 px or shorten the caption. On the bottom axis the tick labels **K0V and G2V overprint** ("K0VG2V") and O5V clips at the right edge at 390 px. Drop K0V or G2V, or stagger them. "2,000" clips at 390 px.
   - HD chart: the caption *"stars per class, HD 1–225,300 [19]; hottest at top, dwarf temperatures [20]"* is cut at the right edge in EN and RU at both widths. Wrap it onto two lines or shorten it.
   - Abundance chart: the note *"bars shorter than 1 … rarer than silicon"* sits at y ≈ 256, outside `viewBox` 0 0 480 250, so it is cut off. Enlarge the viewBox to ~270.
   - Ladder: the level labels n = 4 … n = 12 crowd into an illegible stack near the top. Only label n = 1–3, n = ∞ and the selected level. "−1.51 eV" runs under the black series strip. "visible and near-ultraviolet" / «видимый и ближний ультрафиолет» clips at the right.
   - Minor: in the line matcher the "700" tick clips at 390 px. In the wobble chart the "± 13 m/s: ELODIE's accuracy" label sits on the curve; move it under the band or to the left.
3. **SHOULD — spurious precision.** At 3,000 K the readout shows "1 in 31,376,016,838,443,188" (17 digits). Above 10⁶, use "1 in 3.1 × 10¹⁶".
4. **SHOULD — the HD chart pairs each class with a dwarf temperature ("K0V ≈ 5,270 K")**, but most HD K stars are giants, and those are the reason K dominates a brightness-limited list. That is exactly the reasoning in the note. Add to the note: "most of the K stars here are giants, cooler than K0V dwarfs" / «большинство K-звёзд здесь — гиганты, они холоднее карликов K0V».
5. **NICE** — the SVG `aria-label`s are static. Append the current state (element; matches "3 of 3"; T and peak; K) as BURST's review suggested.

## 6. Ethics — APPROVE WITH CHANGES

Several things are done well:
- The women at Harvard are named with their actual work: Fleming's 10,351 stars and 200,000 plates, Cannon's 225,300 stars.
- Payne's story is told accurately. Her self-doubt and Russell's role are stated without vilifying anyone, and Russell's "very gratifying agreement" is quoted.
- Struve's verdict is attributed.
- Janssen and Lockyer are credited in parallel.

1. **MUST — Antonia Maury is missing.** Her 1897 classification of 681 bright northern stars (Harvard Annals 28) was the first Harvard Annals volume credited to a woman. Her "c" mark for sharp-lined spectra let Hertzsprung (1905) separate giants from dwarfs, which became one root of the H–R diagram and was kept in the 1922 IAU system. The current text credits Cannon alone with showing "one continuous sequence", so the omission is a credit gap and not just a missing anecdote. Add after the Cannon paragraph, EN: "Antonia Maury, classifying 681 bright stars in finer detail in 1897, marked some spectra with unusually sharp lines; Ejnar Hertzsprung later showed these were giant stars — a clue that a spectrum shows a star's size as well as its temperature." RU: «Антония Мори, в 1897 году подробнее классифицировавшая 681 яркую звезду, отметила спектры с необычно узкими линиями; позже Эйнар Герцшпрунг показал, что это звёзды-гиганты, — значит, спектр говорит не только о температуре звезды, но и о её размере.» Cite the DSB "Maury, Antonia" entry or the Harvard CfA library page (library.cfa.harvard.edu/antonia-maury). Add a 1897 timeline entry.
2. **MUST — overclaim in the page metadata.** `meta.json` description: *"Cecilia Payne's 1925 proof that stars are mostly hydrogen"*. The body says, correctly, that she called her own result "almost certainly not real" and that it was accepted after 1929. The search/og description should not contradict the page. Fix: "Cecilia Payne's 1925 thesis, which showed spectra differ by temperature and found — and doubted — a hydrogen-dominated Sun". Also soften the `og` line "sourced from … the discovery papers": several discovery papers were checked only by metadata. Use "from NIST, the 1966 solar atlas and primary and historical sources".
3. **SHOULD — Wollaston.** The page says Fraunhofer "found the marks", which reads as first discovery. William Hyde Wollaston saw several dark lines in 1802 (Phil. Trans. 92, 365) and took them for colour boundaries. One clause is fair and standard: "(William Wollaston had glimpsed a few in 1802, but took them for gaps between colours)". The Phil. Trans. paper is on JSTOR or the Biodiversity Heritage Library if royalsociety.org blocks scripts.
4. **SHOULD — ELODIE was not built by Mayor and Queloz alone.** *"Michel Mayor and Didier Queloz built the fibre-fed ELODIE spectrograph"* omits André Baranne, its optical designer (Baranne et al. 1996, A&AS 119, 373), and the OHP/Geneva/Marseille team. Fix: "Michel Mayor and Didier Queloz, with André Baranne and colleagues, built…" / «Мишель Майор и Дидье Кело вместе с Андре Баранном и коллегами создали…».
5. **NICE** — name Charlotte Moore (Sitterly), the atlas's first author and a major figure in spectroscopy, by full name once: "Charlotte Moore, Marcel Minnaert and Jakob Houtgast". Mention that Per Teodor Cleve and Nils Langlet in Uppsala isolated helium independently in 1895. Optionally, one neutral clause on the Harvard computers' pay and status, if the DSB or another opened source supports it.

---

## Consolidated MUST-FIX

1. **Hα status:** "about 15 parts per million" → "about 10" (EN/RU); the readout and the re-derivation give 9.8 ppm (§1.1).
2. **Wobble readouts:** "1/0" when the shift exceeds one ELODIE element, and "0.00 fm" at the smallest settings. Print "× N elements" and use significant figures (§5.1).
3. **SVG overlap/clipping:** the thermometer's top caption and bottom title collide, and K0V/G2V overprint; the HD caption clips; the abundance note falls outside its viewBox; the ladder's n-labels stack and "−1.51 eV" runs under the strip; "visible and near-ultraviolet" clips (§5.2). Re-shoot at 1300 and 390 px in EN and RU afterwards.
4. **Credit Antonia Maury** in chapter 6 and the timeline, with a citation (§6.1).
5. **meta.json:** "Payne's 1925 proof" → "found — and doubted"; soften "sourced from … the discovery papers" (§6.2).
6. **RU grammar:** «её убедили, в основном Генри Норрис Расселл» → «её убедил — главным образом Генри Норрис Расселл, —» (§4.1).

**SHOULD (strongly recommended before publishing):**
- Rubidium 1861 (§2.1).
- "Seen 27 years before recognised", not "named" (§2.2).
- Balmer's 1/1000 refers to the extra lines (§2.3).
- "Before 1925" for iron; "glimpsed 1925, accepted after 1929" for hydrogen; Sirius stripes "almost certainly" (§2.4–2.6).
- Line-matcher chance-coincidence sentence, and disclosure of the 6 dropped Fe lines (§1.2).
- Saha notation and the absorbed factor (§1.3).
- Cite Carroll & Ostlie for 20 Pa after checking it (§1.4).
- "Main driver of" Balmer strength (§1.5).
- The Sun preset should explain why Hα is still strong (§3.1).
- RV sign convention (§3.2).
- Redshift ≠ wobble (§3.3).
- Hero kicker "24,000 lines" (§3.4).
- Star presets vs Pₑ (§3.5).
- Spurious 17-digit readout (§5.3).
- HD K stars are mostly giants (§5.4).
- Wollaston and Baranne credit (§6.3–6.4).
- Russian fixes §4.2–4.8.
