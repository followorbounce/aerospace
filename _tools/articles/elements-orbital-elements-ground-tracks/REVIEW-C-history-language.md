APPROVE WITH CHANGES — 5 MUST (two phone-layout defects in the instruments the author asked us to look at, one false status sentence in the opening state of instrument 1, one misleading "far half" figure, one Russian name that reads as an obscenity), 17 SHOULD, 20 NIT.

# Review C — history, credit, teaching, Russian, access · ELEMENTS

Reviewer C, 2026-11-15. Not the author. Read in full: NOTES.md, body.html, script.js (all strings, timeline, 28 reference
notes), meta.json, MOD.json, extra.css, RU-STYLE.md. `./check-all.sh elements-orbital-elements-ground-tracks` = ALL OK
(78 PASS). The page was rendered in headless Chrome 157 through the DevTools protocol (true device emulation, not an
iframe): 390 × 844 with touch emulation and 1300 × 900, English and Russian, every preset of every instrument pressed,
every one of the 16 decoder fields pressed for all five satellites. Scratch (scripts, JSON measurements, 81 screenshots):
`/private/tmp/claude-501/-Users-noone/15467dca-f7da-43db-80d4-657b045af751/scratchpad/w9-elements-revC/`
(`run.js`, `measure.js`, `m2.js`, `out_all.json`, `out_m2.json`, `shot_<width>_<lang>_<name>.png`).

Line numbers are for `script.js` / `body.html` in this folder.

---

## MUST

**M1. TLE decoder on a phone: 10 of the 16 field buttons highlight something the reader cannot see.**
At 390 px `.tle-box` is 322 px wide and its content 552 px (`out_all.json`: `tleBox {clientW:322, scrollW:552}`), so only
about the first 37 of the 69 columns are visible. `renderTLE()` (script.js:268–282) never scrolls the box. Measured for all
five satellites, EN and RU: after pressing ṅ/2, n̈/6, B*, TYPE, SET NO., ω, M, n, REV or CHECKSUM the `.tf.on` span lies
outside the box's visible rectangle (`out_m2.json`: `tle_* offscreen: [ndot, nddot, bstar, eph, elset, argp, M, n, rev, sum]`).
Screenshot `shot_390_ru_tlesum.png`: CHECKSUM pressed, nothing highlighted on screen. There is no visible cue that the box
scrolls sideways (the hint exists only in the aria-label; phone scrollbars are hidden until touched). The highlight is the
one thing that ties an explanation to its characters, which is the point of the chapter.
Fix: after rendering, set `box.scrollLeft` so the first `.tf.on` is in view (centre it), and add a visible one-line hint
under the box at narrow widths. At 1300 px all 16 fields are visible (checked).

**M2. Chart labels are cut at 390 px; on the ground-track map the southern latitudes lose their minus sign.**
Measured text boxes against the SVG box (`out_all.json`, `svg.*.clipped`), confirmed in the screenshots:
- `gtSvg`: "-30°" and "-60°" start 2.9 px left of the SVG edge; `overflow:hidden` removes the minus, so the axis reads
  60°, 30°, 0°, 30°, 60° (`shot_390_en_gt.png`, `shot_390_ru_gtmol.png`, `shot_390_ru_gtgeo.png`). Cause: script.js:295
  `L = 30` and labels right-aligned at x = 26, but under 520 px the font is 13 viewBox units (extra.css:8) and "-60°"
  needs about 31.
- `elSvg`, Russian only: "♈ равноденствие" runs 11.9 px past the right edge in every state → "♈ равноденств"
  (`shot_390_ru_el.png`, `shot_390_ru_elmol.png`). English "♈ equinox" fits.
- `j2Svg`: "180°" cut by 1.7 px; `erSvg`: the last tick ("72 h", "48 h", RU "72 ч") cut by 1.7 px
  (`shot_390_ru_j2.png`, `shot_390_ru_er.png`).
Fix: widen the left margin of the map (L ≈ 38) or write the labels as "60° S" / «60° ю. ш.»; anchor the last x tick
`end`; anchor the equinox label `end` or shorten the axis. The map labels also use a hyphen-minus ("-60°", "-120°",
script.js:299–300) where the rest of the page and RU-STYLE §3 use U+2212.
Everything else the author asked about is fine: no horizontal page scroll (documentElement.scrollWidth = 390 in EN and
RU), smallest SVG text 9.7 px at 390 px (13.7 px at 1300), every `.btn` at least 44 × 44, see "Checked and found correct".

**M3. Instrument 1 opens on a sentence that is false for the orbit it shows.**
script.js:223: "The satellite is 93 % of the period past perigee, yet 335.9° round in angle: that gap between M and ν is
Kepler's second law." In the opening state (ISS preset) the slider directly above reads M = 335.9° and the readout
ν = 335.87°: 93.3 % of 360° is 335.9°. There is no gap. The same sentence appears for Landsat 9 (75 % / 271.6°),
GPS (66 % / 237.8°; M = 238.2°) and GOES-19 (54 % / 193.5°): four of the five presets. Comparing a percentage with an
angle hides that the two numbers are equal. Only the Molniya preset (5 % / 84.3°) shows what the sentence claims. A
newcomer's first reading of the first instrument is a statement that the picture contradicts.
Fix: print M and ν in the same unit ("M = 335.9°, ν = 335.9°") and branch: when |ν − M| is under about 1° say that a
nearly circular orbit is swept almost evenly; otherwise say the difference is Kepler's second law.

**M4. "Nearly nine-tenths of each revolution on the far half of the ellipse" (ch. 2) is not the far half.**
body.html:49 (EN and RU «почти девять десятых каждого витка на дальней половине эллипса»). Recomputed for e = 0.6772375:
the share of the period with true anomaly between 90° and 270° is 0.8954 (this is what checks.js tests); the share on
the half of the ellipse beyond its centre (eccentric anomaly 90°–270°, the geometric far half) is 0.7156. The region with
ν in 90°–270° is everything on the apogee side of the Earth, which is far more than half of the curve. The number is
right for one definition and the words describe another. Also "It then spends" suggests the nine-tenths comes after the
quarter period, when it is the share of the whole revolution.
Fix the words, not the number: "It spends nearly nine-tenths of each revolution on the apogee side of the Earth
(true anomaly between 90° and 270°)" / «почти девять десятых каждого витка спутник проводит по ту сторону от Земли, где
апогей (истинная аномалия от 90° до 270°)»; rename the check to match.

**M5. Russian: «Ричард Хуйсак» (timeline 2006, script.js:431) contains an obscene root.**
The first three letters are the commonest Russian obscenity; a Russian reader will see that before the name. No Russian
source for this author was found (WebSearch 2026-11-15, no Russian-language hits), so there is no established form to
defend it, and the American pronunciation is unknown to me. Do not transliterate. RU-STYLE §9 already gives the pattern
«Цайтлин и др. (2013)»: write «Дэвид Валладо с соавторами публикуют исправленную и проверенную SGP4…» (chapter 7 already
says «Валладо с коллегами»); all four names stay in Latin in the title of reference [2]. The English row is fine.

---

## SHOULD

**History and credit**

S1. **Ceres recovery date is contested and Olbers is left out** (body.html:27, timeline 1801, ref [23] note). The page
follows MacTutor's Gauss biography, which I opened: "When Ceres was rediscovered by Zach on 7 December 1801 it was almost
exactly where Gauss had predicted" (https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/). Other accounts put the
confirmed recovery on 31 December 1801 (Zach) and 1 January 1802 (Heinrich Olbers, independently); the usual reconciliation
is a first sighting on 7 December that could not be confirmed until the 31st
(https://en.wikipedia.org/wiki/Franz_Xaver_von_Zach, https://ow3.math.rutgers.edu/~cherlin/History/Papers1999/weiss.html).
NOTES.md lists this as a judgment call; the reader is not told. One clause fixes it and credits Olbers: "Zach sighted it
on 7 December and, with Heinrich Olbers, confirmed it at the turn of the year". Related: "a place in the sky a year
later" is eleven months (1 January → 7 December).

S2. **Emil Buchar (Prague) published the flattening from Sputnik 2 before Merson and King-Hele.** E. Buchar, "Motion of
the Nodal Line of the Second Russian Earth Satellite (1957β) and Flattening of the Earth", Nature 182, 198–199
(July 1958), doi:10.1038/182198b0, reprinted in NASA SP-94 (https://ntrs.nasa.gov/citations/19660028057). Merson and
King-Hele is Nature 182, 640 (September 1958). The timeline's 1958 row names only the British pair for the Sputnik 2
result. The row does not say "first", so nothing is false, but this is exactly the non-US, usually-left-out credit the
brief asks about, and it is the node drift of chapter 6 used as a measurement. Add him to the 1958 row (bibliographic
record only was seen by me; I did not open the paper).

S3. **"which NASA rounds to an approximate 63-day cycle"** (body.html:223, EN). 60.6 days (NOTES) is not rounded to 63;
NASA's tutorial gives its own approximate figure, for its own altitude. The instrument's status line already says it
correctly ("NASA quotes an approximate 63-day cycle"), and the Russian says «у NASA это „примерно 63-суточный цикл“».
Make the English prose say "NASA quotes".

S4. **"it stands in for the slow pull of the Sun and Moon"** (decoder, ṅ/2 for the three high orbits, script.js:252).
No source is given and neither [1] nor [4] says this; [4] (opened) says only that the two fields "are not used by the
SGP4/SDP4 orbital models (only by the simpler SGP model)". Either cite it or say less: "for an orbit this high it is not
drag, and SDP4 does not use it". Flagged for reviewer B as well.

**Teaching** (foundation guide: weighed heavily)

S5. **The opening view of instrument 1 shows the orbit as a straight line.** The camera azimuth is fixed at −60°
(script.js:184) and the ISS node on 14 November is 277.2°; the orbit normal is 0.7° from perpendicular to the line of
sight (my calculation: normal · view = −0.012), so the "orbit drawn to scale" is a diagonal stroke across the Earth's disc
with the labels "ascending node" and "perigee" on top of each other (`shot_1300_ru_el.png`, `shot_390_ru_el.png`;
overlap also measured). Molniya 3-50 (Ω = 140.4°, 200° from the camera) is nearly edge-on too (`shot_390_ru_elmol.png`).
The reader meets the six elements through a picture in which no ellipse, no tilt and no dashed far half can be seen.
Fix: choose the azimuth from the node (for example Ω − 60°) or fix it where both presets open as ellipses, and offset the
two labels when the points are close.

S6. **Terms used before they are explained.**
- Lede: "The propagator here is Kepler plus the steady J2 drift". "Propagator" is never defined anywhere on the page
  (it returns in the ch. 7 eq-label), and J2 is defined in chapter 6. For this audience: "The orbit predictor used here…
  the steady drift caused by the Earth's bulge (called J2)". The Russian lede already avoids "propagator" («Расчёт здесь»).
- Chapter 4 decoder: "SGP4 ignores it; the older SGP model uses it", the readout "MODEL FOR THIS PERIOD: SGP4 / SDP4" and
  the TYPE field all name SGP4, SGP and SDP4 three chapters before chapter 7 introduces them; the chapter 4 prose never
  names them. Add one sentence to chapter 4 ("element sets are made for one prediction model, SGP4; chapter 07").
- "the equinox direction" (ch. 3, the decoder's Ω text, the SVG label) is never said to be the March (vernal) equinox, the
  direction from the Earth to the Sun at that moment. Russian «точка равноденствия» should be the standard
  «точка весеннего равноденствия».
- "Right ascension" is used as a name without a word on what it is (an angle along the celestial equator). One clause.

S7. **Can a reader decode a TLE by hand after chapter 4? Nearly; three things are missing from the page itself.**
- The two-digit-year rule (57–99 → 19xx, 00–56 → 20xx) is only in the notes of references [4] and [7]. The epoch and
  designator explanations say "Year 2026" and "Launch year 1998" without saying how. It belongs in both field texts;
  it also explains why "58002B" on the Vanguard 1 test set is 1958.
- The day fraction: "day 318.30312735" → "07:16:30 UTC" is given as a result. Add "0.30312735 × 24 h = 7 h 16 min 30 s".
- From n to a: the text says a "follows from Kepler's third law" and the n field shows a = 6,796.5 km, but no line does
  it. One worked line: T = 1440 / 15.49368 = 92.94 min, a = (μ T² / 4π²)^(1/3) ≈ 6,794 km, and the remark that SGP's
  correction moves it by under 3 km (NOTES has this; the page does not).
- Column numbers appear nowhere; highlighting replaces them on a wide screen, and on a phone see M1. Printing "columns
  19–32" at the start of each field text costs nothing and makes the page usable as a reference.
- Also unexplained: the leading "1"/"2" (line number) and the catalogue number repeated on line 2. The classification
  letter has an explanation in `tleExplain` (`f === 'cls'`, script.js:248) that no button reaches; it is covered inside
  the NUMBER text, so the branch is dead code.

S8. **"Kepler only" mode still says the bulge moves the node.** With KEPLER ONLY pressed the status reads "Kepler only,
not SGP4. The Earth turns 23.28° … and the bulge moves the node by another 0.32°: each pass crosses the equator 23.60°
west of the last" and the readouts still show WESTWARD SHIFT 23.60° and NODE DRIFT (J2) −4.951°/day (`out_m2.json`,
`gt_iss_kepler`), while the track drawn in that mode has no node drift (23.28° per revolution). Text and picture disagree
in the one mode whose purpose is to show the difference. Take the facts from the active mode, or say "in this mode the
node drift is switched off".

S9. **Readout labels turn symbols into other symbols.** `.readout-cell .rl` is `text-transform:uppercase` (base.css:26),
so the labels the author typed correctly are rendered as "TRUE ANOMALY Ν" (ν becomes capital nu, identical to N),
"SEMI-MAJOR AXIS (FROM N)" (n, the mean motion), "+ Ṅ/2 DRAG", "X, Y, Z (KM)" / «(КМ)» and «24 Ч / 72 Ч»
(rendered text in `out_all.json`, `readouts`). In a guide whose subject is a set of case-sensitive symbols this matters,
and RU-STYLE §2 says units stay lowercase inside uppercase labels. The labels are already typed in capitals, so
`.readout-cell .rl{text-transform:none}` in extra.css fixes it without touching the shared file.

**Russian**

S10. **Decimal years: «25,7 лет»** (J2 readouts NODE/PERIGEE GOES ROUND IN; script.js:359 `' лет'`). Rendered: GPS
«25,7 лет» and «48,0 лет», Molniya «9,6 лет» and «1235,2 лет», GOES «73,5 лет» and «36,7 лет». RU-STYLE §6: decimal years
take «года». The value always has one decimal, so «года» is right in every case.

S11. **HUD in Russian reads as a temperature: «51,6°С 12,3°В»** (script.js:318; rendered `hud-alt` «0,0°С 75,1°З»,
«5,1°С 15,8°З»). «°С» is how degrees Celsius are written. RU-STYLE §5: coordinates are «с. ш.», «ю. ш.», «в. д.»,
«з. д.». The page's own `latStr()` / `lonStr()` already produce that; use them for the HUD.

S12. **«Обе скорости убывают как размер орбиты в степени 3,5»** (ch. 6 eq-note, body.html:201). As written this says the
rates go as a^3.5. Write «убывают обратно пропорционально размеру орбиты в степени 3,5». The English "fall off as the
3.5th power" has the same looseness; "inversely as the 3.5th power" is exact (the check says a^−3.5).

S13. **Heading calque: «Три угла ставят эллипс в пространство»** (ch. 3 h2, body.html:63). Not Russian. «Три угла задают
положение эллипса в пространстве».

S14. **«только Кеплер, а не SGP4.»** starts a bold status sentence with a lowercase letter (MODE_NAME ru,
script.js:288, rendered in `gt_*_kepler`). The English "Kepler only" is capitalised. «Только Кеплер».

S15. **«В среднем за виток сжатие делает две равномерные вещи»** (ch. 6, body.html:196), calque of "does two steady
things". «…сжатие даёт два равномерных эффекта» or «…действует двояко».

S16. **«средние элементы, из которых колебания усреднены»** (ch. 7, body.html:236): «усреднены из» is not a Russian
construction. «средние элементы, из которых колебания убраны усреднением».

S17. **Qualifier dropped, RU-STYLE §11 ("never drop or strengthen one"):** EN "against as much as 469 km for the Station
with Kepler alone" → RU «против 469 км для МКС с одним Кеплером» (body.html:181). Write «против 469 км (в худшем случае,
для МКС) с одним Кеплером» or «до 469 км». Same place: «на ноябрь 2026 года» (body.html:141) should follow the §6
formula «по состоянию на ноябрь 2026 года».

---

## NIT

N1. Status text for near-zero presets: "With zero eccentricity there is no perigee" is shown for Landsat 9
(e = 0.0001) and GOES-19, and "With zero inclination there is no node" for GOES-19 (i = 0.0083°); thresholds at
script.js:208. "With an eccentricity this close to zero the perigee is barely defined" is true for both cases.
N2. Landsat 9 ground-track status: "the bulge moves the node by another −0.07°" / «ещё на −0,07°» (rendered,
`gt_sso`). Say "0.07° the other way (east)".
N3. The last clause of the same status dangles in both languages: "…west of the last, 15.25 revolutions before the
Earth has turned once under the orbit plane."
N4. Chapter 5 first gives NASA's 22.9° beside the page's 23.6° with no reason; the reason (a different altitude) comes
two paragraphs later for the repeat cycle only. Add "(for a lower orbit)".
N5. "which is what every orbit program does thousands of times a second" (ch. 2): colour, not a fact. "many times".
N6. Timeline 1959: "John O'Keefe, Ann Eckels and R. K. Squires": two first names and one pair of initials in one
list. Naming Ann Eckels is right; the earlier BEEP guide says only "John O'Keefe and colleagues", so this page is the
better one and they do not contradict.
N7. Crowded labels at 390 px (measured overlaps, still legible): J2 chart "−20" against "0°" at the origin and
"150°"/"180°" against the axis title; error chart "1" against "0 h".
N8. MOD.json row 4, Russian title «В каталоге кончились пять цифр»: digits do not run out; «В каталоге кончились
пятизначные номера» (as the timeline says).
N9. Initials with ordinary spaces: «Т. С. Келсо» (body.html:99, script.js:431), «К. Г. Хилтон и Дж. Р. Кулман»
(script.js:428), «Р. К. Сквайрс» (script.js:427). The other initials in the timeline use U+00A0 (RU-STYLE §3).
N10. «глава 06», «главы 04» in running Russian text (eight places). RU-STYLE §2: «глава 6». Site practice is mixed
(4 generated guides zero-pad, 10 do not).
N11. «2193&nbsp;км … до 38&nbsp;162&nbsp;км» in one sentence (body.html:45): RU-STYLE §4 groups all alike when a
five-digit number is in the same sentence.
N12. «однозначной контрольной суммой» (body.html:100): «однозначный» also means "unambiguous". «одной контрольной цифрой».
N13. «В готовых вариантах» for presets (body.html:89); glossary: preset → «предустановка».
N14. Revolutions: «витка в сутки» for n, «об/сут²» and «оборота в сутки в квадрате» for ṅ/2 (decoder, ch. 6, ref [4]).
Glossary: revolution → «виток». Pick one for the unit.
N15. «Для такой высокой орбиты это вовсе не торможение: он заменяет…» (script.js:252): «это … он» disagree. See S4.
N16. «Сквозной счёт каталогизированных объектов» (script.js:247): «Сквозная нумерация объектов каталога».
N17. «Центр Земли находится в фокусе» (body.html:44): the English says "at one focus"; «в одном из фокусов».
N18. «обломок ступени Delta 1» (body.html:262) adds «ступени» that the English ("a piece of Delta 1 debris") does not
have. Probably right (catalogue name DELTA 1 DEB), but make the two languages say the same.
N19. «РАЗМЕР, ФОРМА, РАСПИСАНИЕ» for "SIZE, SHAPE, TIMING" and «самое тонкое» for "the subtle one" (ch. 2): readable but
stiff. «РАЗМЕР, ФОРМА, ВРЕМЯ»; «самое неочевидное».
N20. Five `aria-live="polite"` status lines are rewritten on every slider `input` event, which is talkative for a screen
reader; the sliders already carry `aria-valuetext`. This is the site's pattern, so only a note.

---

## The author's Russian questions

| Proposed | Verdict |
|---|---|
| Kozai → **Кодзаи** | Confirmed. Russian Wikipedia's article is «Кодзаи, Ёсихидэ» and uses «Кодзаи» throughout (opened: https://ru.wikipedia.org/wiki/Кодзаи,_Ёсихидэ). The effect is also met as «резонанс Лидова — Козаи»; the page does not mention the effect, so no conflict. |
| King-Hele → **Кинг-Хили** | Accept. It matches the pronunciation and, from memory, the Soviet translation of his book («Теория орбит искусственных спутников в атмосфере», Мир, 1966). I could not confirm that record online today. |
| Hujsak → **Хуйсак** | Reject: see M5. Do not transliterate. |
| Others on the page | Брауэр (established), Хутс, Рёрих, Валладо, Кроуфорд, Келсо, Крэнфорд, Лейн, Хилтон, Кулман, Мерсон, О'Киф, Экелс, Сквайрс, Пиацци, фон Цах, Охоцимский, Энеев, Таратынова: fine. |

Proposed glossary lines: «средние элементы», «оскулирующие (элементы)», «вековой» (вековые возмущения, вековой дрейф),
«эпоха», «двухстрочный набор элементов (TLE)»: all standard, all used consistently on the page. Accept. Worth adding
from this guide's own usage: mean motion → «среднее движение»; critical inclination → «критическое наклонение»;
sub-satellite point → «подспутниковая точка»; retrograde orbit → «обратная орбита»; catalogue number → «номер в
каталоге»; checksum → «контрольная сумма»; nodal period → «драконический период» (the page describes it in words, which
is fine for this audience).

---

## Checked and found correct

- **Dates and attributions.** Kepler's laws "published in 1609 and 1619" (as MacTutor); Piazzi, 1 January 1801, 9° of
  orbit, Zach's publication in June 1801, Gauss's prediction "differed greatly from the others" (MacTutor Gauss page,
  opened; wording matches); Gauss born 30 April 1777, so "then 24" holds for autumn 1801. "Aerospace Defense Command
  proposed going from the old five-line to the current two-line format in November 1972": verbatim in Kelso 1998
  (https://celestrak.org/columns/v04n03/, opened), which also carries the 57–99 / 00–56 rule and "not used by the
  SGP4/SDP4 orbital models (only by the simpler SGP model)". Kozai and Brouwer, AJ 64, 367 and 378, November 1959; SGP
  (Hilton and Kuhlman 1966, from Kozai), SGP4 (Cranford 1970, from Lane and Cranford 1969, Brouwer); Hoots and Roehrich
  1980; Vallado, Crawford, Hujsak and Kelso 2006: consistent with what I know of Spacetrack Report No. 3 and
  AIAA 2006-6753 (not reopened; reviewer B). Vanguard 1, 17 March 1958; Molniya 3-50, 8 July 1999; GPS IIF-7,
  2 August 2014 UTC. Merson and King-Hele 1958, King-Hele and Merson 1959, O'Keefe, Eckels and Squires 1959: volumes and
  pages as I know them.
- **Credit.** The Soviet 1957 paper by Okhotsimsky, Eneev and Taratynova is in the timeline with a reference; Kozai is
  credited by name for SGP's theory; Ann Eckels is named; Molniya is called Russian and its series named. No superlative
  or "first" is claimed anywhere in the history. Nothing sensational; there is no failure story to tell here.
- **Elements defined before use.** The ch. 1 eq-note names and glosses all six before chapters 2 and 3 define a, e, M
  (with E and ν) and i, Ω, ω in that order; the first instrument comes after all six. Epoch and mean motion are defined
  where they first appear (ch. 4). Secular, osculating and mean are defined where introduced (ch. 6, ch. 7).
- **Model labelling as a reader sees it.** "not SGP4" is in the lede, both status lines, both chart aria-labels, the
  ch. 7 eq-label and two notes; "do not use it to point an antenna or predict a pass" is on the page.
- **EN/RU parity.** 102 `data-en` and 102 `data-ru` in body.html; every number in every Russian body string, timeline
  row and reference note compared with the English: all agree except the items above (S3, S17, N18). Decimal commas,
  U+2212 minus, «×», «ёлочки», no raw `"` in `data-ru`, ё present, Rule A/B names («Молния-3» № 50, «Авангард-1»,
  Landsat 9, GOES-19, Atlas V), NASA, UTC, codename links ИМПУЛЬС, СОЛНЦЕ-СИНХРОННАЯ, РЕТРАНСЛЯТОР, НАВИГАТОР (per the
  §2 table; English SUNSYNC, RELAY, IMPULSE, NAVIGATOR match the neighbours' meta.json). Glossary terms used: наклонение,
  долгота восходящего узла, аргумент перигея, средняя / истинная аномалия, трасса, сжатие, солнечно-синхронная, орбита
  типа «Молния», звёздные сутки, прибор, справочник. Rendered Russian: no English left in any instrument, SVG label,
  readout, status or aria-valuetext (shared site chrome excepted: "Index", "Site index", "More from Follow or Bounce").
- **Access.** aria-label in EN and RU on all four SVGs, all seven button groups and the TLE box, switched by language
  (rendered values read back); every range input has a `<label for>` and a spoken `aria-valuetext` in both languages;
  `aria-pressed` on every preset and field button, cleared when a slider overrides a preset; 104 tab stops, no positive
  tabindex, the scrolling TLE box is focusable (`tabindex=0`, `role=region`) with a `:focus-visible` outline; lines and
  markers in the charts differ by dash and shape, not colour alone, and the aria-labels say which is which;
  `prefers-reduced-motion` rule present (the page has no animation of its own).
- **Layout.** 390 px, EN and RU: no horizontal page scroll; no element outside the viewport except the off-screen skip
  link; no text overflowing a readout cell, status, eq-body, heading or button; SVG text 9.7 px minimum; the map is
  358 × 192 px and readable; the 16-button field row wraps into four rows of 44 px-high buttons (narrowest 44 px, 8 px
  gaps, 11 px type); sliders are 44 px high with 26 px thumbs under touch emulation. 1300 px: no clipped SVG text, TLE
  box shows all 69 columns, field row in two rows. Targets under 44 px are only shared site chrome (Search 32 × 28,
  EN/RU 40 × 29) and inline text links.
- **Geography.** "never passes over Scotland or Tierra del Fuego": Scotland begins near 54.6° N and Tierra del Fuego
  near 52.4° S; both are beyond 51.6°, including the geodetic correction.
- **Meta.** description 145 characters (≤ 160); title_en 43 (≤ 60); lede "Nine chapters and five instruments" = 9
  sections ch1–ch9 and 5 instruments (el, tle, gt, j2, er); timeline 10 rows, 28 references, highest citation 28.
  MOD.json: four rows, each a real dated event with EN and RU; trajectory type "leo" for a Molniya and a GPS satellite
  follows the widget's existing rows (Syncom 3, Molniya-1 and the first GPS satellite are "leo" too). hud1_ru, hud2_ru
  and `data-phase-ru` present.

## Not checked

- The cited sources behind numbers, statuses and "as of November 2026" claims (reviewer B); I opened only Kelso 1998,
  MacTutor's Gauss page and Russian Wikipedia's Kozai article. The 1957, 1958 and 1959 papers themselves were not opened
  by me either (bibliographic knowledge only), and Buchar 1958 was confirmed as a record, not read.
- The physics and numerics of the five instruments (reviewer A). M4 is the only number I recomputed.
- The Russian edition page `ru/elements-orbital-elements-ground-tracks.html`: it does not exist yet (the guide is not in
  site.json / pages.json). Russian was checked by pressing the page's own RU button, which is what `ru_pages.py` replays.
- A real phone, Safari and Firefox, and a real screen reader: Chrome's device emulation only. Keyboard reachability was
  checked from the DOM (tab stops, roles, focus styles), not by driving the keyboard.
- Contrast ratios were not measured.
- King-Hele's Russian spelling in a printed source, and how Hujsak is pronounced.
- Note for the coordinator: my first render pass let the page's Cloudflare analytics beacon attempt one request per load
  from 127.0.0.1 (blocked by CORS); later passes blocked it.
