**Verdict: APPROVE WITH CHANGES** — 3 MUST, 14 SHOULD, 12 NIT. Nothing blocks: the history is credited correctly, the Russian reads as real technical prose, and the page holds at 390 px. The MUSTs are one misattributed figure, one failure told as a success, and scrollable tables a keyboard cannot reach.

# REVIEW C — EQUILIBRIUM (`lagrange-points`): history, credit, teaching, Russian, access

Reviewer C, 2026-11-15. Not the author. Read: `WAVE9-BRIEF.md` row, `NOTES.md`, all of `body.html`, `script.js`, `extra.css`, `meta.json`, `MOD.json`, `RU-STYLE.md`, the generated `lagrange-points.html`.
`./check-all.sh lagrange-points` → **ALL OK** (82 checks PASS).
Line numbers are for `body.html` (B) and `script.js` (S) as of 12:59 today.

Sources I opened myself (not search snippets):
- Koon, Lo, Marsden, Ross (2022), full PDF text extracted: https://ross.aoe.vt.edu/books/Ross_3BodyProblem_Book_2022.pdf
- Siddiqi, *Beyond Earth* (NASA SP-2018-4041), full PDF text extracted: https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf
- Sicardy (2010), author copy, text extracted: https://lesia.obspm.fr/perso/bruno-sicardy/biblio/biblio/Sicardy_Gascheau_CelMec10.pdf
- Euler Archive E327: https://scholarlycommons.pacific.edu/euler-works/327/
- NASA "What is a Lagrange Point?": https://science.nasa.gov/resource/what-is-a-lagrange-point/
- NASA Lucy: https://science.nasa.gov/mission/lucy/
- Russian Wikipedia titles and article text through the MediaWiki API (used only as the tie-breaker RU-STYLE §7 and §9 name for Russian forms).

---

## MUST

**M1. "NASA's round figure for both is 61,300 km [7]" is not what [7] says.**
- B231 (EN): "NASA's round figure for both is 61,300 km [7], which is the leading-order value." RU: «круглая цифра NASA для обеих — 61 300 км [7], и это значение первого приближения».
- S261 (EN): "close to the 61,300 km NASA quotes for both [7]". RU: «близко к 61 300 км, которые NASA приводит для обеих [7]».
- Siddiqi [7], ARTEMIS entry, verbatim: "an engine burn propelled ARTEMIS P1 into orbit around the Earth–Moon L2 Lagrange point, located on the far side of the Moon, about 61,300 kilometers above the lunar surface."
- Two things differ. The source gives the figure for **L2 only**, and measures it **above the lunar surface**. The page says "for both" and compares it with distances from the Moon's centre (58,000 / 64,500 km, leading order 61,274 km).
- For scale: the page's own exact L2 is 64,515 km from the centre, so about 62,800 km above the surface (64,515 − 1,737). The match with 61,274 km is a match with a centre distance, which the page does not say.
- Fix: say what the source says ("Siddiqi's NASA history gives 'about 61,300 km above the lunar surface' for L2; that number equals the leading-order distance from the Moon's centre"), or cite a NASA page that gives 61,300 km for both points. Same change in the Russian and in the `em` solver status. The check "Hill value 61,274 km vs NASA's 61,300" should carry the same wording.

**M2. Genesis: a crash is recorded as "capsule home".**
- S405: `'left 22 Apr 2004; capsule home 8 Sep 2004'` / `'уход 22 апр. 2004; капсула на Земле 8 сент. 2004'`.
- The cited source [7] says: "The drogue parachute … unfortunately did not deploy, and the capsule hit the ground at an estimated speed of 311 kilometers/hour at 15:58 UT on 8 September 2004 … the capsule was severely damaged and contaminated."
- A reader of the register will take "capsule home" as a normal return. This is the only failure in the guide, and it is hidden.
- Fix (both languages), for example: "capsule crash-landed in Utah 8 Sep 2004 (parachute did not open; samples partly recovered)" / «капсула разбилась при посадке в Юте 8 сент. 2004 (парашют не раскрылся; часть образцов спасена)».

**M3. The two scrollable tables cannot be reached or scrolled from the keyboard in Safari, and have no accessible name.**
- B102 and B239: `<div class="table-scroll">` with no `tabindex`, `role` or label. `extra.css` sets `#mTable{min-width:860px}` and `#sTable{min-width:520px}`.
- Measured in headless Chrome at 390 px: the solver table is 550 px inside a 356 px box, the mission register 860 px inside 356 px. The register also overflows on any viewport under about 920 px, which includes a laptop at 200 % zoom.
- Four of the register's six columns (arrival, end, source) are off-screen and reachable only by touch or mouse where the browser does not make scrollers focusable.
- The site already has the pattern (one generated guide uses it): `<div class="table-scroll" tabindex="0" role="region" aria-label="…" data-aria-en="…" data-aria-ru="…">`. `renderAll()` already swaps `data-aria-*`, so this is a markup-only change.
- Same finding, lower weight: neither table has a `<caption>` (S215, S429). A visually hidden caption in EN and RU would name them for screen readers.

---

## SHOULD

### History and credit

**S1. Queqiao is denied its "first".** The timeline gives firsts to ISEE-3, WMAP, ARTEMIS and CAPSTONE (all US). For Queqiao it says only "settles into a halo orbit behind the Moon" (S457), and the register says "halo about L2" (S422). Queqiao was the first relay satellite at the Earth–Moon L2, and the first spacecraft to work in a halo orbit there (ARTEMIS flew Lissajous orbits, per [9]). It is also the realisation of the Clarke 1950 / Farquhar 1966 proposal the guide describes in chapter 5, 52 years on. One clause in the timeline and in B167 would close that loop. The author's own source [21] is the place to confirm the wording.

**S2. Kathleen Howell is missing from the halo story.** Chapter 5 credits Clarke and Farquhar, then goes straight to the near-rectilinear halo orbit with no name. The textbook the guide follows credits "comprehensive studies of halo orbit families" to Breakwell and Brown (1979), Howell and Breakwell (1984) and Howell (1984), and thanks Howell, Barden and Wilson for the Genesis trajectory design. The near-rectilinear family is Howell & Breakwell, "Almost rectilinear halo orbits", *Celestial Mechanics* 32, 29–52 (1984), doi 10.1007/BF01358402. NOTES.md lists these papers under [1] but the page does not use them. She is also a co-author of ref [10]. One sentence in B167 and a timeline row for 1984 would do it.

**S3. Euclid is named in the text but left out of the register.** B230 lists "Webb, Euclid and Roman" as L2 telescopes. The register has Roman (not yet arrived) and no Euclid row; ESA's mission sits in a note with no reference. Add the row with an ESA reference for launch (1 July 2023) and arrival. The author's reason (no page returned the date to a plain fetch) is a sourcing gap, not a reason to list a NASA telescope still in transit and omit an ESA one already working.

**S4. Spektr-RG has no arrival date** (S416: "halo orbit about L2"), the only register row without one. It is also the only Russian-led mission in the table. I could not confirm the date from a primary page today (IKI / Roscosmos, October 2019; Russian press reports a 100-day flight after the 13 July launch). Find it or say "arrived October 2019" with a source.

**S5. LISA Pathfinder shows a dash for its end, and it ended in 2017.** ESA sent the final command on 18 July 2017 (ESA: "LISA Pathfinder switch off", https://www.esa.int/ESA_Multimedia/Videos/2017/08/LISA_Pathfinder_switch_off_Mission_summary_and_beyond). The note under the table says a dash means "no end date is recorded here", which is honest, but the freshness row lists the eleven craft with no end date and leaves LISA Pathfinder out, so the row and the table disagree. Add the date.

**S6. `MOD.json`: the 1906 Achilles row does not fit the widget.** `assets/mission-of-day.js` has `ERA=[[1957,1975],[1976,1999],[2000,9999]]`; a 1906 row falls in no period chip and can only surface through "Today" near 22 February. It is also not a mission. The date and the text are correct. Replace it with a dated mission event from the guide, for example Queqiao entering its halo orbit (14 June 2018) or Chang'e 2 arriving at Sun–Earth L2 (25 August 2011). Either also balances four US rows out of five.

### Teaching

**S7. Chapter 2 describes Ω with the opposite sign to the equation box under it.** B40: "one effective potential Ω. Its landscape has two deep wells at the bodies, a rim that falls away far outside". The box at B45 defines Ω = ½(x² + y²) + (1 − μ)/r₁ + μ/r₂, which rises without limit at the bodies and far outside. The eq-note then says L4 and L5 are "the lowest points of Ω (the highest of the potential energy −Ω)", and the map status calls them "the summits of the potential". A careful reader meets wells, lowest points and summits for the same thing within one screen. Fix the body text: the wells and the falling rim belong to the potential energy −Ω. Same sentence in Russian («В его рельефе две глубокие ямы у тел»).

**S8. "Libration point" is used six times in English and five in Russian, and never defined.** It appears in the register (S401, "the first spacecraft at any libration point"), the timeline (1978, 2010), `MOD.json` and ref notes, in Russian as «точка либрации». Chapters 1–3 only say "Lagrange point". Add "(also called libration points)" at first use in chapter 1, in both languages.

### Russian

**S9. Three spacecraft names break Rule A of RU-STYLE §7** ("Cyrillic in «ёлочки» for … Indian names and for Western spacecraft that have an established Russian form … apply Rule A when Russian Wikipedia … use a Russian form").
- Herschel → **«Гершель»**. Russian Wikipedia: «Гершель (космический телескоп)». The hand-made page this guide replaces wrote «Гершель» и «Планк». The new register writes Latin `Herschel` next to Cyrillic «Планк» (S412–413), and so do ref notes [7] and [14].
- Lucy → **«Люси»**. Russian Wikipedia: «Люси (космический аппарат)». B215 «Аппарат NASA Lucy», timeline 2021.
- Aditya-L1 → **«Адитья-L1»**. Russian Wikipedia: «Адитья-L1»; Rule A names Indian craft explicitly («Чандраян-3»). S408, timeline 2024, `MOD.json` row 5 (name and line).
- Genesis, Wind, ACE, SOHO, DSCOVR, IMAP, LISA Pathfinder, CAPSTONE, Euclid, Roman, Gateway, Vigil stay Latin (Russian Wikipedia uses Latin for those it covers, or the style table says so).

**S10. A grammatical slip in chapter 2.** B41: «горловина открывается сначала у L1, потом у L2, затем у L3, а последними область исчезает у L4 и L5». «Последними» has nothing to agree with. Write «…затем у L3, а в последнюю очередь запретная область исчезает у L4 и L5».

**S11. `I<sub>sp</sub>` in the Russian formula.** B175: the eq-body is not bilingual, so the Russian page shows `g₀I_sp`. RU-STYLE §5 (decision 2): «I<sub>уд</sub>» in text, readouts and formulas; avoid `I<sub>sp</sub>`. Wrap the symbol in a `data-en`/`data-ru` span.

**S12. «справочник NASA» for "NASA fact sheets"** (B29 «по массам из справочника NASA», B120 «из справочника NASA»). RU-STYLE §11 keeps «справочник» for the site's own guides. Write «по справочным данным NASA (Planetary Fact Sheets)» or «по таблицам NASA».

**S13. «Чанъэ-5Т1» against the site's «Чанъэ-5-T1».** S421 and ref note [7] write Cyrillic «Т», no hyphen. `rabbit-change-far-side` writes «Чанъэ-5-T1» (Latin T, hyphen, four uses). Russian Wikipedia's title is «Чанъэ-5Т1», so the author's form is the better one, but the site should have one. Either match RABBIT now or ask the coordinator to change RABBIT and add the name to RU-STYLE.

### Access

**S14. The error-growth chart tells its three lines apart by colour alone** (S373–378). The legend is three lines of text, each in its line's colour, in an order (Sun–Earth L1, Moon L2, Moon L1) that does not match the lines left to right. The red and green lines are steep and adjacent. Put a short label at the end of each line, or key them by dash pattern. The same applies to "Blue and green: the two oscillation frequencies" in the chapter 4 note (B156); "upper" and "lower" would carry it.
- Related: `.m-ag` (agency names in the register, `extra.css`) is 11 px in `var(--mid)` #7a7a74 on white, contrast 4.32:1, under the 4.5:1 AA threshold. `.svg-small` in the same file already uses #5f5f59 (6.43:1); use that.

---

## NIT

1. **Halo orbits named "in 1966"** (B167, timeline). Koon's chapter 6 says 1966; the same book's chapter 1 says "originally named for lunar halo orbits by Farquhar [1968]", and Russian Wikipedia gives the 1968 thesis. "In 1966–68" or "in the late 1960s" is safe.
2. **Gascheau and Routh appear without first names in chapter 4** (B131) and as "G. Gascheau" in the timeline. RU-STYLE §9 asks for first name + surname at first mention. Sicardy's reference list prints only "Gascheau, G." (*C. R. Acad. Sci.* 16, 393, 1843), so "Г. Гашо" and «Эдвард Раус» in B131 would match the timeline. Sicardy also says Routh "actually extended the result to a general attraction law", which is a little more than "rederived".
3. **China's place in the sequence.** Siddiqi [7] notes that Chang'e 2 made China "only the third country or entity (after the United States and ESA)" to send a spacecraft to a Lagrange point. Worth six words in the 2011 timeline row.
4. **Trojan naming.** Johann Palisa of Vienna proposed the Trojan War names; August Kopff found Hektor and Patroclus (the first at L5) in 1906–07. Optional credit in B214.
5. **B167 EN/RU say different things about Queqiao.** EN: "Queqiao's lets Earth see past the Moon to the far side". RU: «орбита „Цюэцяо“ позволяет Земле видеть аппарат из-за края Луны» (Earth sees the spacecraft past the Moon's edge). The Russian is the accurate one; bring the English to it.
6. **`var NB = ' '` (S116) is an ordinary space**, not U+00A0, so «0,30 %» and «11 %» can break across lines, and the Russian ref notes carry ordinary spaces in «384 400 км», «19 596 км», «71 100 км», «65 000 км», «1 988 400». RU-STYLE §3 requires the no-break space. The reference guide `relay-telstar-syncom` has the same habit in its script, so this is a site pattern, but `NB` is one character to fix here.
7. **«Гайя» changes gender in the register.** S415 «выведен из работы» (masculine); timeline and ref [15] «выключена», «уведена», «переведена» (feminine). Use «выведена из работы».
8. **Smaller Russian wording.**
   - B7 «ПЯТЬ МЕСТ, ГДЕ МОЖНО СТОЯТЬ НА МЕСТЕ» repeats «мест… месте»; «ПЯТЬ ТОЧЕК, ГДЕ МОЖНО…».
   - B87 «около 2 % для Солнце — Юпитер, 5–6 % для Земля — Луна и 11 % для Плутон — Харон»: a preposition before an undeclined pair; «для пары Солнце — Юпитер…».
   - B92 «совпадают лучше чем до одной десятимиллиардной» → «совпадают с точностью лучше одной десятимиллиардной».
   - B131 «это работает, только если одна масса преобладает» → «это возможно, только если…».
   - B40 «не испытывает результирующей силы» → «равнодействующая сил равна нулю».
   - B23–24 «рисунок» for "pattern" («сохраняют свой рисунок», «второй рисунок», «два рисунка превращаются в пять точек»): the usual word is «конфигурация» or «расположение».
   - B11 «…и лунный ретранслятор и живут тысячи астероидов»: two «и» in a row; put a comma or «а также».
   - B181 aria «Опубликованный случай» → «Опубликованный пример»; S215 column «ОТСЧЁТ» for "MEASURED" → «ОТ ЧЕГО».
9. **Hero kicker `∇Ω = 0 · μ < 0.03852` (B8) has no Russian variant**, so the Russian hero shows a decimal point. RU-STYLE lets formulas keep their notation; a decimal comma here would still match every other 0,03852 on the Russian page.
10. **Terms used once without a gloss:** "barycentre" (B95, solver table and status) after three chapters of "centre of mass"; "tadpole and horseshoe" (B156); "multiplies by e" (B170) with no value for e. One bracket each.
11. **Phone layout, 390 px, measured.** Smallest chart text is 9.7 px (passes the 9 px floor). With the 13 px phone font some labels sit on the next line's box: the "−r_h" tick label touches the "ERROR OF R·(μ/3)^⅓" heading in the solver figure, and the three legend lines in the error-growth chart are set 13 units apart at 13 px. Legible in my capture, but tight. At 320 px chart text is 7.8 px, and the page scrolls sideways by 13 px because of the shared header (`.chrome-actions`), not this guide.
12. **Low-contrast marks in the figures:** the simulated-NRHO bar #a9a9a2 on white is 2.36:1, the dashed reference curves #b9b9b1 are 1.97:1, the forbidden-region fill #d9d9d2 is 1.42:1 (its boundary is black, so the shape is still clear). Nested subscripts in the chapter 5 formula render at 6.9 px (`sp` in `I_sp`) and 7.8 px (`h` in `r_h` in the notes).

---

## The proposed Russian names (asked for in the prompt)

| Name | Verdict | Evidence |
|---|---|---|
| Гашо (Gascheau) | Accept | Correct practical transcription of the French; I found no Russian source that prints the name, so it is a transcription, not an established form. Add to RU-STYLE as such. |
| Раус (Routh) | Accept | Established: Russian Wikipedia «Раус, Эдвард Джон»; «уравнения Рауса», «критерий Рауса — Гурвица». |
| Фаркуар (Farquhar) | Accept | Russian Wikipedia, «Гало-орбита»: «Роберт У. Фаркуар впервые использовал название „гало“…»; also «Фаркуар, Роберт» in its 2015 obituary list. |
| Хитэн (Hiten) | Accept | Russian Wikipedia title «Хитэн»; Rule A (Japanese), in «ёлочки» as written. |
| Эврибат (Eurybates) | Accept | Russian Wikipedia «(3548) Эврибат». |
| Тефия (Tethys) | Accept | Russian Wikipedia «Тефия (спутник)». |
| Телесто | Accept | Russian Wikipedia «Телесто (спутник)». |
| Калипсо | Accept | Russian Wikipedia «Калипсо (спутник)». |

Also confirmed against Russian Wikipedia titles: «(588) Ахиллес», «(617) Патрокл», «(4179) Таутатис», «(152830) Динкинеш», «(52246) Дональдджохансон», «Харон», «Цюэцяо», «Спектр-РГ», «Гало-орбита», «Орбита Лиссажу», «Сфера Хилла», «Интеграл Якоби» (the page's «постоянная Якоби» is the constant's usual name), «Подковообразная орбита». Not accepted as written: Herschel, Lucy, Aditya-L1 (S9) and «Чанъэ-5Т1» versus the site form (S13).

---

## Checked and found correct

**History and credit**
- Euler: E327 "De motu rectilineo trium corporum se mutuo attrahentium", written 1763, published 1767, *Novi Commentarii* 11, 144–151 (Euler Archive). The page's caution in ref [3] ("Euler does not say in so many words that the line of bodies can rotate rigidly") is fair.
- Euler and Lagrange credited separately, and "common but historically inaccurate": Koon, footnote, verbatim: "Euler [1767] discovered L1, L2, and L3 just a few years before Lagrange [1772] discovered L4 and L5, but it is common in the literature to refer to L1, L2, L3 as the 'Lagrangian' or 'Lagrange points' as well, despite being historically inaccurate."
- Lagrange's 1772 prize essay: NASA page, "prize winning paper (Essai sur le Problème des Trois Corps, 1772)".
- Gascheau 1843 before Routh 1875, limit 0.03852…: Sicardy, verbatim: "often referred to as the Routh value, but should actually be called Gascheau's value in view of the precedence of his result."
- Clarke 1950 and Farquhar 1966 on the lunar relay and the halo: Koon, chapter 6.
- "Lost in the Sun's glare" at L1: Koon, chapter 1.
- 588 Achilles, 22 February 1906, Max Wolf, Heidelberg; 1906 − 1772 = 134.
- ISEE-3 at Sun–Earth L1 on 20 November 1978 as the first libration-point spacecraft; WMAP 1 October 2001 as first at Sun–Earth L2; ARTEMIS P1 on 25 August 2010 as "the first time that a spacecraft had successfully entered orbit around an Earth–Moon libration point"; P2 at L1 on 22 October 2010: all in Siddiqi's text and its table of firsts.
- SOHO "about two months after launch, on 14 February 1996"; Chang'e 2 on 25 August 2011 into a 180-day Lissajous orbit; LISA Pathfinder 22 January 2016; Hiten's L4/L5 passes after 2 October 1991 with the dust counter on (and Siddiqi's "January 1991" misprint, which the page rightly avoids): Siddiqi.
- "About an hour" of solar-wind warning from L1: Siddiqi, Wind entry.
- L3 "unlikely to find any use", 23 days, 24.96: NASA page, verbatim.
- Lucy: 16 Oct 2021, 1 Nov 2023, 20 Apr 2025, Eurybates 11 Aug 2027, Patroclus 3 Mar 2033, eight Trojans: NASA Lucy page today.
- Tone: no sensational wording anywhere; the model limits are stated where they bite (L3, Earth–Moon L4/L5 under the Sun's pull, linearised path, growth curves).

**Teaching**
- A motivated reader can answer the core question: what the five points are, why three need a quintic and two do not, why L4/L5 can be stable, why nobody sits at the point, what staying costs. Each instrument's status line says what the picture means, and each note says where the model stops.
- The Hill-radius shortcut is shown beside the exact root with its error, which is the right lesson.

**Russian**
- Read every `data-ru`, `data-aria-ru`, `T()` pair, register row, timeline row, reference note, `meta.json` and `MOD.json` string (105 body strings, 221 script strings).
- Number parity EN/RU: script comparison of every paired string, then by eye; no number differs. Claim parity: one difference (NIT 5).
- Decimal commas, «ёлочки», spaced em dashes in pairs («Солнце — Земля»), unspaced en dash in caps buttons, U+2212 minus, «сут», dates («22 февраля 1906 года», compact «20 нояб. 1978»), four-digit numbers ungrouped (9823, 5942, 1048, 3366), five-digit grouped (15 765, 58 000), units kept lower-case inside upper-case labels (`.lc` spans), ё throughout, no «Вы», imperative hints, infinitive/noun buttons.
- Glossary terms: «гало-орбита», «удержание (на орбите)», «включение двигателя», «уравнение/формула Циолковского», «удельный импульс», «периселений/апоселений», «первое приближение», «прибор», «справочник» + codename. Codenames in links: ИМПУЛЬС, РАЗВЁРТЫВАНИЕ, КРОЛИК, ГАЛО, КОРОНА, СВЕЧЕНИЕ, ПАРАЛЛАКС, ТЬМА, all per §2.
- «почти прямолинейная гало-орбита» matches `the-lunar-gateway`. NASA / ЕКА / Роскосмос per §8.
- HUD and phase labels are Russian in Russian mode (measured: «ЭТАП ЗАДАЧА», «СИСТЕМА Солнце — Земля», «L4 / L5 УСТОЙЧИВЫ»).

**Access and layout** (markup, CSS, and headless Chrome at 320 / 390 / 768 / 1300 px, EN and RU, default and alternate presets)
- No horizontal page scroll at 390, 768 or 1300 px; no element outside a `.table-scroll` passes the right edge; no SVG text clipped by its viewBox.
- Chart text at 390 px: 9.7 px minimum in all four figures.
- Every slider has a `<label for>`, a live value and `aria-valuetext`; every button group is `role="group"` with a label in EN and RU and `aria-pressed`; all four SVGs are `role="img"` with EN and RU labels (11 `data-aria-ru`, all swapped by `renderAll()`); five status boxes are `aria-live="polite"`.
- Buttons and sliders are 44 px high; `:focus-visible` outlines are set; coarse pointers get 26 px thumbs.
- No animation in this guide; `site.css` handles `prefers-reduced-motion`.

**Meta**
- description 155 characters (≤ 160); `title_en` 46 (≤ 60); lede "Nine chapters and four instruments" matches 9 sections and 4 instruments; 4 related guides.
- `MOD.json`: 5 rows, each a real dated event with EN and RU name and line; dates match the register (1978-11-20, 2001-10-01, 2010-08-25, 1906-02-22, 2024-01-06). See S6 for the 1906 row.

---

## Not checked

- **Events after my own knowledge ends (mid-2026):** Roman's launch on 30 August 2026 and its transfer status, SWFO-L1's renaming, the 8 September and 26 June 2026 page-update dates, the 30 May 2026 MPC counts. I did not open those pages; reviewer B's remit.
- **Refs [8]–[13], [15]–[22], [24]–[31]** were not opened. I opened [1], [2], [4], [5], [7], [27] only, for the history and credit claims.
- **Queqiao's "first" (S1)** and **Spektr-RG's arrival date (S4)**: stated from general knowledge and a Russian Wikipedia sentence; no primary page opened. The author should confirm before writing them in.
- **Carl Charlier's role** in recognising Achilles as a Lagrange-point body (1906): I believe it is right but could not find a source today, so it is not a finding.
- **Gascheau's first name**: not in Sicardy; not confirmed.
- **Whether any Russian printed source uses «Гашо»**: none found.
- **Screen-reader behaviour, real Safari and real phones**: read from markup and a headless Chrome iframe only. The M3 claim about Safari rests on its documented behaviour (scroll containers are not in the tab order), not on a test.
- **Physics, numerics and the checks** (reviewer A), and agreement with the neighbouring guides (reviewer B).
- **For the coordinator, not the author:** `ru/lagrange-points.html` is still the old hand-made page (`ru_pages.py --check` reports it stale), so today the RU toggle on the new page leads to the old ten-chapter text; and the five `MOD.json` rows are not yet in `assets/mission-of-day.js`.
