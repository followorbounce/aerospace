APPROVE WITH CHANGES: two statements are wrong or misleading as written (the NERVA XE "reached 825 s" figure; the solar-escape note that leaves out New Horizons). Everything else that could be opened checks out against its source.

# REVIEW B: domain science and sources. `physics-of-spaceflight` (IMPULSE)

Reviewer B (astrodynamics and propulsion), 2026-11-15. I did not write the guide.
Method: every cited URL was fetched and read as a page or PDF (not a search snippet); PDFs were text-extracted locally and, where column order mattered, the slide was rendered and read as an image. Quoted figures were recomputed in a separate Python script. `check-all.sh` was not run (see "Not checked").

Counts: 2 MUST, 9 SHOULD, 6 NIT.

---

## The five items the author could not verify: settled

### 1. Δv to low Earth orbit: 9.3 (this guide) against 9.4 (THRUST)

What the sources say:

| Source | Figure | Opened? |
|---|---|---|
| Humble, Henry & Larson (1995), Table 2.10, as reproduced on slide 8 of Seitzman's AE 4451 handout, https://seitzman.gatech.edu/classes/ae4451/vehicle_acceleration.pdf | Saturn V 7,798 + 1,534 + 40 + 243 − 348 = **9,267 m/s** (176 × 176 km, 28.5°); Shuttle 9,086 (+144); Atlas I 9,243; Delta 7925 8,814; Ariane 44L 9,138; Titan IV/Centaur 9,207. "Ascent varies between 8.8 and 9.3 km/s for these selected launch vehicles." | Handout opened; all six rows re-added and they sum correctly. The book itself is not online (archive.org search: no copy), so it stays a reproduction. |
| A. V. Zimmerman, NASA Lewis, "Exploring in Aerospace Rocketry, 11: Launch Vehicles" (1968), https://ntrs.nasa.gov/api/citations/19680010821/downloads/19680010821.pdf | "an ideal velocity capability of 30 000 feet per second: 25 750 feet per second to acquire orbital velocity and 4250 feet per second to account for the losses" = **9.14 km/s** | Opened. |
| Karabeyoglu, Stanford AA 284A Lecture 7, https://web.stanford.edu/~cantwell/AA284A_Course_Material/Karabeyoglu%20AA%20284A%20Lectures/AA284a_Lecture7.pdf | Orbital 7.67 + potential 0.47 + gravity loss 2.2 + drag 0.1 = **10.44 km/s** (a deliberately conservative teaching budget to a higher orbit, no rotation credit) | Opened. |

No source I could open gives 9.4 km/s. It is the usual round figure in secondary writing and sits inside the published spread (about 9.1 to 10.4 depending on orbit, vehicle and whether Earth's rotation is credited), so it is not wrong as a generic number, but it has no citation on this site.

What each guide should state:

- **IMPULSE (this guide): keep 9.3 km/s.** It is the only figure on the site tied to a published budget, and the page already presents it correctly as one rocket's quoted figure, net of the rotation credit, with the source's 8.8–9.3 range. Two wording fixes are in SHOULD-1 below.
- **THRUST (`thrust-saturn-v-n1`): change to "about 9.3 km/s".** That guide is about the Saturn V, the same rocket the 9,267 m/s belongs to, and its sentence sends the reader here for the number ("about 9.4 km/s … (see The Physics of Spaceflight)"), where the reader now finds 9.3. Three places: the prose in `body.html` (EN and RU "около 9,4"), the chart label `orbit ≈ 9.4` / `орбита ≈ 9,4` in `script.js`, and the comment in `checks.js` ("orbit 9.4 + TLI ~3.1"). THRUST's own model does not contradict this: its three-stage ideal total is 12.46 km/s (my recomputation from its constants, 3,405 + 4,769 + 4,284 m/s), and it describes the split only loosely.
- **RETURN (`return-reusable-rockets`): may keep 9.4.** There it is a labelled assumption for a Falcon-9-like model ("Assumed, not SpaceX data … 9.4 km/s to low orbit including losses"), not a claim about a published budget. If the coordinator wants one site-wide number, 9.3 with the HHL citation is the defensible one, but RETURN's payload figures would then need recomputing and its checks updating.
- **PITCHOVER (Wave 9 brief row: "Why orbit costs about 9.4 km/s"):** the brief should say "about 9.3 km/s (8.8–9.3 for six launch vehicles, Humble et al.)". PITCHOVER is the guide that will itemise the losses, so it should carry the HHL rows and not a different total.

### 2. F-1 303 s and J-2 421 s from NTRS 20190033337: confirmed, with one caveat

Slide 5 ("Current engine architectures") rendered as an image and read directly. Columns in order: SRB-SS, SRB-SLS, F-1, J-2, RS-25, Ion NEP, NTP. Row "Vacuum ISP (s)": –, –, **303.1**, **421**, 452.3, 2000-8000, 800-1000. Row "Vacuum Thrust (klbf)": –, –, 2020.7, 232.3, 512.3. The assignment is unambiguous: 303.1 belongs to the F-1 column and 421 to J-2. SRB 242 s and 2,800 klbf at sea level also confirmed.

Caveat (SHOULD-6): that "F-1" column carries the uprated engine's ratings: sea-level thrust 1,800 klbf and sea-level Isp 269.7 s. The guide's own reference [12] says in footnote 4 "F-1A was rated at 1.8 million pounds force of thrust", and gives the flown F-1 as 1,522,000 lbf and 265 s. So the page pairs a flown-engine sea-level figure (265 s, [12]) with a vacuum figure from a column that is not the flown engine. The number barely moves, but the attribution "303 s for kerosene (F-1) … from NASA's comparison table [19]" should say so.

### 3. Soviet "cosmic velocities" 7.910 / 11.186 / 16.67 km/s: confirmed from the page itself

https://booksite.ru/FullText/1/001/008/065/144.htm returns HTTP 200 to a browser user-agent (windows-1251). The article «Космические скорости» (Ю. А. Рябов) reads: «первая К. с. равна 7,910 км/сек, вторая — 11,186 км/сек, третья — 16,67 км/сек». All three as cited.

Context the page leaves out (NIT-1): the article gives these for «самой поверхности шаровой однородной модели Земли (радиусом 6371 км)». The same article's Table 1, for h = 0 with r = 6378 km, gives 7,90 and 11,18. So the 11.19-against-11.18 gap the page reports is only the radius (my recomputation: 6371 km → 7.910 / 11.186; 6378.137 km → 7.905 / 11.180). Third velocity: I get 16.65 km/s with either radius, as the page does; the encyclopedia's 16,67 is its own figure and the page words that correctly.

### 4. Sternfeld's 1934 bi-elliptic credit: citation confirmed, credit only partly supported

- Briot (arXiv:1207.1491), reference list, opened: "Sternfeld A.J. (1934b) Sur les trajectoires permettant d'approcher d'un corps attractif central à partir d'une orbite keplérienne donnée. Comptes Rendus de l'Académie des Sciences, Paris, 198:711-713." Title, journal, volume and pages in [8] are right.
- Briot does **not** mention the bi-elliptic transfer anywhere. It says only "In 1934, he sent two notes at the French Science Academy". The first (1934a, 198:333-334) is "Méthode de détermination de la trajectoire d'un corps en mouvement dans l'espace interplanétaire par un observateur lié au système mobile", a different subject.
- A published source that does make the credit: Lingam & Loeb, "What's in a name: the etymology of astrobiology", arXiv:2004.11312, p. 4: "Sternfeld is known to have presented the mathematical details underpinning bi-elliptic transfer (Sternfeld, 1934)".
- The primary note is on Gallica (the link Wikipedia cites is `gallica.bnf.fr/ark:/12148/bpt6k31506/f711`); Gallica did not answer my fetches, so I could not read it. Wikipedia itself tags "first" as needing a citation, so "usually credited to" is the right strength.

Result: the hedged wording can stay; see SHOULD-7 for the plural "notes" and the supporting reference.

### 5. Textbook figures taken from a handout

- **[10] Humble, Henry & Larson.** The handout says what the page says, with attribution to "Table 2.10 in Space Propulsion Analysis and Design, Humble, Henry and Larson, McGraw Hill, 1995". The book was not opened by me either. The reference is honestly worded ("as reproduced in"), which is acceptable; an independent NASA figure (Zimmerman, 9.14 km/s) falls inside the handout's range.
- **[9] Vallado.** Not opened. Both thresholds recomputed independently: bi-parabolic equals Hohmann at a radius ratio of 11.9388; Hohmann's cost peaks at 15.582, and a bi-elliptic with its far point just beyond the target beats Hohmann from 15.58 up (sign change between 15.5 and 15.58). The numbers are right; the link is the problem (NIT-3).

---

## MUST

### MUST-1. "the NERVA XE reached 825 s on a test stand in 1969" is not what the source says, and not what the engine did

Where: `body.html` ch7 first paragraph (EN "the NERVA XE reached 825 s on a test stand in 1969 [19]"; RU «NERVA XE показал на стенде в 1969 году 825 с»); `script.js` `PROP` row `Nuclear thermal (NERVA XE)` with `isp:825` (table shows 825 s and 8.09 km/s, status "ground-tested 1969"); reference [19] note "825 s tested on NERVA XE, 850 s chosen for the flight engine"; the chapter note "Specific impulse and thrust are the published figures of one example of each type".

What [19] says (slide 12, opened): "Isp capability: 825-850 sec ('hot bleed cycle' tested on NERVA-XE); 850-875 sec ('expander cycle' chosen for NERVA flight engine)". That is a capability range for an engine cycle; the cycle was tested on XE. It is not a measured 825 s, and the flight-engine range is 850–875, not 850.

What the engine did: J. L. Finseth, "Rover Nuclear Rocket Engine Program: Overview of Rover Engine Tests", NASA CR-184270 (1991), https://ntrs.nasa.gov/api/citations/19920005899/downloads/19920005899.pdf, PDF p. 123: "The engine was designed to produce a nominal thrust of 246663 N (55430 lb) with the reactor operating at a power level of approximately 1140 MW … The engine had an overall specific impulse of **710 seconds** at rated conditions", with a 10:1 nozzle. Robbins & Finger, NASA CR-187154, https://ntrs.nasa.gov/api/citations/19910017902/downloads/19910017902.pdf, give 825 s as the design value of the flight baseline: "a single flight baseline engine was defined with a thrust level of 75,000 pounds and 825 seconds of specific impulse".

Fix (either):
- Use the tested engine: XE-Prime, 710 s (6.96 km/s), about 55,000 lbf (247 kN), cited to Finseth; then the thrust cell no longer needs the "25–250 thousand lbf engines tested" workaround; or
- Keep 825 s but call it what it is: "designed for 825 s; the XE ground engine ran at about 710 s with a short nozzle", and mark the table cell as a design value.
Correct the [19] note to "825–850 s capability for the cycle tested on XE; 850–875 s for the cycle chosen for the flight engine". Add a check.

Side note, no change needed: Finseth counts "24 separate startups" for XE-Prime; [19] and Robbins & Finger both say 28. The page follows two NASA sources.

### MUST-2. Solar-escape note leaves out New Horizons and contradicts SLINGSHOT

Where: `script.js` `NOTE.solesc`: "No flybys. Every craft that has actually left took part of its speed from Jupiter instead." (RU: «Все аппараты, которые действительно ушли, часть скорости взяли у Юпитера.»)

"Instead" tells the reader that no craft has ever made the direct departure this row prices. New Horizons did. Guo & Farquhar, "New Horizons Mission Design", Table 7, https://www2.boulder.swri.edu/pkb/ssr/ssr-mission-design.pdf: achieved launch C3 = 157.7502 km²/s², so v∞ = 12.56 km/s, above the 12.34 km/s this very row requires (the equivalent burn from a 200 km orbit is 8.92 km/s against the row's 8.75). The same paper: "the highest Earth departure speed, estimated at 16.2 km/s". The linked guide SLINGSHOT already says it: "New Horizons was launched fast enough to escape anyway; passing Jupiter … added about 14,000 km/h".

Fix: for example "No flybys. Four of the five craft now leaving the Solar System needed Jupiter to get there; New Horizons (2006) left Earth already fast enough, and used Jupiter to save three years." New Horizons is then a flown check on the row, which the page currently lacks.

---

## SHOULD

**SHOULD-1. Wording of the 9.3 km/s.** (a) ch2: "The Saturn V spent 9.3 km/s reaching low orbit [10]" reads as a flight measurement. It is a textbook budget for a 176 × 176 km orbit at 28.5°; Apollo's parking orbits were not that orbit. Say "needed about 9.3 km/s by one published budget". (b) The budget has four terms (gravity, drag, steering, rotation) and no term for the thrust lost to air pressure at the nozzle, so it belongs with trajectory-averaged specific impulse. Instrument 1 feeds it vacuum values (303 / 421 s). The note already warns that the F-1 gave 265 s in air; add that this makes the bars optimistic, not just "a comparison". (c) The map adds a 176 km figure to a 200 km basis; the difference is about 15 m/s and worth one clause.

**SHOULD-2. Breakthrough Starshot's status.** ch7: "…is a study, not hardware." True, but the freshness row calls this the "status of the initiative" and cites only the initiative's own page, which still describes the programme as live. James Benford (a former Starshot sail-team lead), Centauri Dreams, 3 March 2026, https://www.centauri-dreams.org/2026/03/03/starshot-is-a-success-part-i/: Starshot "was put 'on hold, paused' in 2024"; he disputes that it was cancelled. Scientific American ran a cover story on its fading in October 2025 (Sarah Scoles, "Voyage to Nowhere"; I could not open the article itself). Say "a study that was paused in 2024, not hardware", and give the freshness row an independent source.

**SHOULD-3. "no spacecraft has made such a burn there" (ch5 note).** Engines have been fired near closest approach to Jupiter: Juno's orbit insertion on 4 July 2016 was a 35-minute burn "decreasing the spacecraft's velocity by 1,212 miles per hour (542 meters per second)" (https://www.nasa.gov/news-release/nasas-juno-spacecraft-in-orbit-around-mighty-jupiter/). That is the same effect run backwards: braking where the craft is fastest. Reword to "no spacecraft has made a speeding-up burn there; Juno's 542 m/s braking burn close to Jupiter in 2016 used the same effect in reverse". I did not open a primary page for Juno's altitude during the burn, so the author should source that before quoting radii. For the Sun the statement holds.

**SHOULD-4. Table statuses not supported by the cited references.** `PROP`: "Hall thruster (1.35 kW SPT) … flown [17]" and "Ion thruster (NEXT) … flown [14]". [17] (Brophy 1992, abstract opened) says only that "more than fifty of the 660-W thrusters have been flown"; it does not say the 1.35 kW thruster had flown. [14] is a 2008 development paper, written before any NEXT flight. Both statuses are true today as far as I know (the 1.35 kW class later flew; NEXT-C flew on DART), but each needs its own source, or the Hall row should say "660 W model flown by 1992 [17]".

**SHOULD-5. Two guides, two prices for the same two destinations.** ch6 says Mercury orbit 13.13 km/s against leaving the Solar System 8.75 km/s, and links to SCORCH in the same sentence. SCORCH says "Mercury's total, about 13.9 km/s, is more than the 12.3 km/s needed to leave the Solar System". Both are right on their own basis (SCORCH counts the speed change around the Sun plus a minimum capture; this guide counts burns from a 200 km orbit with capture to a 300 km circle), and the conclusion is the same, but a reader following the link meets different numbers with no warning. Add a clause: "SCORCH counts the same trip without the help of a burn in low Earth orbit, so its figures are 13.9 and 12.3".

**SHOULD-6. F-1 vacuum figure and J-2 figure.** See item 2: the [19] "F-1" column is the 1.8-million-lbf rating. Either say so in the instrument note or cite the flown engine's vacuum value from a Saturn V source. Related: THRUST uses "J-2 ≈ 425 s"; this guide uses 421 s. Both appear in NASA documents for different mixture ratios and ratings; one clause would stop a reader thinking one guide is wrong.

**SHOULD-7. Sternfeld: one note, not "notes", and a reference that makes the claim.** ch4 ("notes Ary Sternfeld sent to the French Academy of Sciences in 1934") and the 1934 timeline row ("sends … notes on transfers that go far out and come back") credit both 1934 notes. Only the second (198:711–713) is about these trajectories. Make it "a note". Add Lingam & Loeb (arXiv:2004.11312) beside Briot in [8], since Briot never mentions the transfer, and add the Gallica link to the note itself if it can be opened.

**SHOULD-8. DRACO has a primary source.** [18]'s note says "no primary DARPA statement was found". Two exist: (a) the cited article itself quotes DARPA's deputy director on the record ("Rob McHenry, DARPA deputy director, told the Mitchell Institute on Wednesday", article dated 27 June 2025, and it calls the decision DARPA's "to kill" the project); (b) the President's Budget for FY 2027, NASA chapter, https://www.govinfo.gov/content/pkg/BUDGET-2027-BUD/pdf/BUDGET-2027-BUD-21.pdf: "The closeout of the Demonstration Rocket for Agile Cislunar Operations, known as DRACO, an in-space nuclear thermal rocket engine demonstration in collaboration with the Defense Advanced Research Projects Agency". Cite (b) and correct the note. "Cancelled in 2025" and "none has flown as of November 2026" both stand; I found no later flight or revived flight programme.

**SHOULD-9. Freshness rows.** Missing or thin: (a) the Starshot row needs the independent source of SHOULD-2; (b) "no spacecraft has made such a burn there" and "every craft that has actually left" are open-ended status claims with no row; (c) the Parker row should record that the record has been matched, not beaten: NASA, 10 September 2026, https://science.nasa.gov/blogs/parker-solar-probe/2026/09/10/after-latest-swing-past-sun-nasas-parker-solar-probe-checks-in/: 29th close approach on 4 September, "again matching its record speed and distance", matched "during seven flybys since", mission "extended into 2029". The record still holds today.

---

## NIT

**NIT-1.** ch3: say that the encyclopedia's 7.910 / 11.186 are for a 6,371 km sphere and the page's 7.91 / 11.18 use the 6,378 km equatorial radius (item 3). "Russian textbooks" is cited to an encyclopedia; "Soviet reference books", as in ch6, is the accurate phrase in both places.

**NIT-2.** ch1: "At full rated power the Space Shuttle's RS-25 burned 1,035 lb…". [28] says "At 100 percent power level", and in the same document "full power level (FPL)" means 109 %. Write "at 100 % rated power".

**NIT-3.** [9] links to CelesTrak's software page for the book, not to the book, and gives no page. Give the chapter and page, or link the publisher.

**NIT-4.** ch2 and the 1903 timeline row: "wrote it down in 1898". [4], PDF p. 233 (opened), has Tsiolkovsky's own words: "An accidentally preserved yellowed page with the final equations is dated 25 August 1898. But … I began to be concerned with rocket theory even earlier". Publication "in 1903 in Nauchnoye Obozreniye (No. 5)" is confirmed in the same volume. "Had it on paper by 1898" is the safer wording. [4]'s title and "translation of the 1954 Academy of Sciences edition" match the PDF's title page.

**NIT-5.** `MOD.json`, 2024-12-24: "Parker Solar Probe's fastest pass". Seven later passes were equally fast. "First pass at its record speed" is exact.

**NIT-6.** [16] note says "about the force needed to hold up a sheet of paper"; NASA's words are "about the amount of force involved in holding a single piece of notebook paper in your hand". Fine as a paraphrase; just not a quotation.

---

## Checked and found correct

Each line: opened the source page or PDF and found the figure as cited.

- [1][2] NSSDCA: Earth GM 0.39860 × 10⁶, 6378.137 km, escape 11.186, 149.598 × 10⁶ km, 29.78 km/s, 23.9345 h, 365.256 d; Moon GM 0.00490 × 10⁶, escape 2.38, 0.3844 × 10⁶ km, 1.022 km/s, 27.3217 d; Sun GM 132,712 × 10⁶, 695,700 km, 617.6 km/s; summary table escape 4.3 / 10.4 / 11.2 / 2.4 / 5.0 / 59.5 and orbital 47.4 / 35.0 / 29.8 / 24.1 / 13.1.
- [3] JPL Basics of Space Flight ch. 3: Newton's cannon on a mountain.
- [4] Tsiolkovsky, NASA TT F-237: title page, 1954 edition, 1898 and 1903 (see NIT-4).
- [5] NASA Goddard page: 16 March 1926, Auburn, Massachusetts, liquid oxygen and gasoline; Smithsonian Miscellaneous Publication No. 2540 (January 1920).
- [6][7] archive.org records: "The Attainability of Heavenly Bodies", 1960, "originally published in 1925"; "Ways to spaceflight", 1972.
- [10] Seitzman slide 8: all figures and the 8.8–9.3 sentence.
- [11] Orloff SP-4029: TLI 180.581 n mi and 35,545.6 ft/s; lunar arrival 86.7 n mi and 8,250.0 ft/s; LOI 2,917.5 ft/s into 169.7 × 60.0; 158.8 ft/s; LM ascent 6,070.1 ft/s into 48.0 × 9.4.
- [12] NTRS 20100027316 (PDF opened): F-1 "1.5 million pounds force", uprated to 1,522,000; "specific impulse … was 265 seconds".
- [13] L3Harris sheet 07/2024: 418,000 lb, 512,300 lb at 109 %, 452.3 s vacuum.
- [14] NASA/TM-2008-214986 Table 1: NEXT 0.5–6.9 kW, >4100 s, 236 mN, >70 %; NSTAR 0.5–2.3 kW, >3100 s, 92 mN, >61 %.
- [15] Rayman & Garner abstract: "approximately 51,250 hours … approximately 416 kg of xenon … almost 11.5 km/s, a record for an on-board propulsion system".
- [16] NASA Dawn page: 91 millinewtons, four days 0 to 60, 425 kg; NSSDCA 2007-043A: launch mass 1217.7 kg.
- [17] Brophy abstract: 1.35 kW, 16,000 m/s, 50 %, "close to the claimed performance", fifty 660 W thrusters.
- [18] Breaking Defense, 27 June 2025: DARPA's decision to end DRACO.
- [19] Wilkerson: Rover/NERVA 1955–1972, 20 reactors, ~1.4 B$, 25/50/75/250 klbf, XE "28 start-up / shut-down cycles during tests in 1969", the comparison table (item 2). The 825 s reading is MUST-1.
- [20] JAXA, 9 July 2010: "1.12 mili-Newton", Doppler measurement.
- [21] NASA: 24 Dec 2024, 3.8 million miles, 430,000 mph, "faster than any human-made object has ever moved".
- [22] NASA ISS: "five miles per second, orbiting Earth about every 90 minutes", 16 orbits in 24 hours.
- [23] ESA: 35 786 km; 23 hours 56 minutes and 4 seconds.
- [24] Great Soviet Encyclopedia: item 3.
- [25] Breakthrough Initiatives: "ground-based light beamer", "up to 100 million miles an hour", "just over 20 years from launch".
- [26] NIHF: U.S. Patent No. 3,807,657, RCA Astro Electronics, "30% increase in efficiency", communications satellites.
- [27] Gunter: "500 km × 40000 km with 12 hour period".
- [28] HAER TX-116: 100 % power, 1,035 pounds per second, 470,000 pounds at vacuum.
- [29] NASA Voyager: "reduced from 30 years to 12".

Recomputed independently and matching the page: RS-25 4.45 km/s from thrust ÷ flow; Dawn 27.5 km/s ≈ 2,806 s; 400 km orbit 7.669 km/s, 92.56 min, 4.77 miles/s; Apollo 11 TLI 10.834 km/s = 99.42 % of escape; Parker 6.81 million km, 192.2 km/s between 139.6 and 197.4; LEO→GEO 2.455 + 1.477 km/s, 5.26 h; plane change 1.514 and +0.359 km/s; Mars 2.94 / 2.65 km/s, 258.9 d; Neptune 30.8 yr; map rows Venus 3.50 / 6.82, Mars 3.61 / 5.70, Mercury 5.55 / 13.13, Jupiter 6.31, solar escape 8.75; third cosmic velocity 16.65; Apollo LOI 0.938 km/s and ascent 1.850 km/s; NSTAR 61 %; SPT 84 mN; Starshot 14.9 % of c; bi-elliptic thresholds 11.94 and 15.58.

Status claims as of 2026-11-15: no nuclear thermal rocket has flown (true); DRACO ended in 2025 (true; primary source in SHOULD-8); Parker's speed record stands, matched seven times since (SHOULD-9, NIT-5); Dawn's record is worded "at the time", which is safe, and I found no report of it being exceeded; Starshot (SHOULD-2).

Neighbour guides opened and compared: TRANSFER (2.94 / 2.65 km/s, 259 d: agree); SLINGSHOT (30.8 years to Neptune: agrees; New Horizons: MUST-2); BELT (11.49 km/s, 425 kg load, 1,217.7 kg: agree); SAIL (IKAROS 1.12 mN: agrees); NOZZLE (470,000 lbf ÷ 1,035 lb/s ≈ 454 s: agrees with the 4.45 km/s here); RELAY (35,786 km, 23 h 56 min 4 s: agree); SCORCH (SHOULD-5); THRUST (9.4: item 1; J-2 425 s: SHOULD-6); RETURN (9.4 as a labelled assumption: item 1).

## Not checked

- Humble, Henry & Larson (1995) and Vallado: the books themselves. Not available online; the first rests on the Georgia Tech reproduction, the second on recomputation.
- Sternfeld's 1934 note on Gallica: the server did not respond to my fetches.
- Scientific American, October 2025, on Starshot: the article itself would not open; its existence and title come from Benford's post and search listings.
- Hohmann (TT F-44) and Oberth (TT F-622): only the archive.org records were read, not the texts, so "Oberth set this out in the 1920s" is not tied to a page.
- Per-planet NSSDCA sheets for Mercury, Venus, Mars, Jupiter, Neptune (GM, radius, semi-major axis to full precision): only the summary table and the Earth, Moon and Sun sheets were opened. The escape- and orbital-speed recomputations agree with the summary table.
- Juno's altitude during orbit insertion (SHOULD-3), and the first-flight facts for the 1.35 kW Hall thruster and NEXT-C (SHOULD-4): stated from knowledge, no page opened.
- `check-all.sh`, the generated `physics-of-spaceflight.html`, instrument behaviour at slider edges, Russian text quality, accessibility and meta lengths: reviewers A and C. I read the Russian only far enough to confirm the two MUST statements appear in both languages.
