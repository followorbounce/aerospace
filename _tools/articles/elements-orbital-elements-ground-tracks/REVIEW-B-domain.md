APPROVE WITH CHANGES: the science and almost every sourced number hold, but three statements are false or contradicted by the guide's own sources (the catalogue did not "pass 99999", "no two-line element set at all", "NASA rounds").

Reviewer B (domain science and sources; orbit determination and space surveillance), ELEMENTS, 2026-11-15.
3 MUST, 6 SHOULD, 7 NIT.

How this was done: every cited web source was downloaded with curl on 2026-11-15 and read as text (PDFs text-extracted), not from search snippets. The five embedded TLEs were re-propagated independently with python-sgp4 2.25 and compared with CelesTrak's sets of 15 November. Files are in the scratch folder `w9-elements-revB/dl/`. Line numbers refer to `body.html`, `script.js`, `MOD.json` and `meta.json` in this folder. Every finding in English text applies to its Russian twin as well.

## MUST

**M1. The catalogue did not "pass 99999": it ran out at 69999 and jumped to 100000.**
- `MOD.json` row 4: "The satellite catalogue passes 99999: newly catalogued objects no longer fit the two-line element format of 1972." RU: «Каталог спутников перешёл за 99999». False.
- `body.html` L141 ("on 11 July 2026 the catalogue ran out of five-digit numbers ... six-digit numbers from 100000"), the 2026 timeline row (`script.js` L432) and the field text for NUMBER (`script.js` L247, "A running count of catalogued objects; five characters, so the format stops at 99999") never say where the count stopped, so a reader concludes 99999 → 100000.
- What is right: the last ordinary number is 69999; 70000 to 99999 are set aside (Space-Track: analyst objects use 80,000 to 89,999) and were skipped.
- Evidence:
  - The guide's own ref [6], https://celestrak.org/NORAD/documentation/gp-data-formats.php: "If you thought that happens at 99999, you may be surprised to discover that is not true ... When we run out of 5-digit catalog numbers at 69999, new data will not be able to be created using the TLE format."
  - CelesTrak SATCAT, queried 2026-11-15 (`https://celestrak.org/satcat/records.php?CATNR=<n>&FORMAT=JSON`): 69998 = STARLINK-38086 (launched 2026-07-11); 69999 = VANGUARD DEB, 1958-002D; 70000, 70001, 79999, 90000, 99999 = "No SATCAT records found"; 100000 = SARAMAGO, 2026-067CY (launched 2026-03-30); 100001 = STARLINK-38128.
  - Space-Track documentation: "The analyst range, which is denoted by a satellite number from 80,000-89,999".
- Fix: MOD.json EN + RU ("reaches 69999, the last free five-digit number, and jumps to 100000"); one clause in L141 and in the timeline row; soften "running count" in L247. Optional, and verified above: the last five-digit number went to a piece of debris from Vanguard 1, the guide's own catalogue number 5.

**M2. "get no two-line element set at all [6]" is contradicted by the guide's own ref [7].**
- `body.html` L141: "as of November 2026 newly catalogued objects carry six-digit numbers from 100000 and get no two-line element set at all [6]." Same claim in the 2026 timeline row ("and no two-line element set") and in freshness row 1 of `meta.json` ("and no TLE").
- Ref [6] speaks for CelesTrak's output only: "GP data will not be available for them using the TLE format." Confirmed today: `gp.php?CATNR=100000&FORMAT=TLE` returns "No GP data found" while `FORMAT=JSON` returns the element set (epoch 2026-11-15, ELEMENT_SET_NO 999).
- Ref [7], https://www.space-track.org/documentation, says the opposite for Space-Track: "To get just Alpha-5 formatted TLE's from space-track, request ephemerides using the TLE format for objects with a number between 100,000 and 339,999 using the GP and GP_History API classes." Alpha-5 exists to write TLE lines for exactly these objects, and the guide's next sentence describes it. The two sentences cannot both stand.
- Caveat for the author: the same Space-Track page also keeps an older FAQ line, "(note that objects > 99,999 are not available in TLE/3LE format)". The documentation is inconsistent with itself, and what the logged-in API returns today could not be checked (no account).
- Fix: attribute and narrow. For example: "CelesTrak does not issue them as two-line element sets at all [6]; Space-Track documents a stopgap, Alpha-5, that writes the number with a leading letter and reaches 339,999 [7]." Change the timeline row and freshness row 1 to match.

**M3. "which NASA rounds to an approximate 63-day cycle" is not what NASA does.**
- `body.html` L223: "that is a full cycle of orbit lighting in about 61 days, which NASA rounds to an approximate 63-day cycle [14]."
- 63 is not a rounding of 60.6. NASA's tutorial says only: "This lighting procession follows an approximate 63-day cycle" (https://eol.jsc.nasa.gov/Tools/orbitTutorial.htm), with no derivation.
- Recomputed: node −4.951°/day plus the Sun's 0.986°/day gives 360/5.937 = 60.6 days (agrees with the page). A 63-day cycle from J2 alone would need a node rate of −4.73°/day, i.e. a semi-major axis near 6,885 km (about 507 km altitude), where the Station has never flown; a lower Station gives a shorter cycle, not a longer one. So the difference is NASA's approximation, not altitude and not rounding.
- Fix: "NASA's tutorial quotes an approximate 63-day cycle [14]", as the instrument's own status line already says (`script.js` L370).

## SHOULD

**S1. Ceres: the 7 December date is one of two in the literature; say so.**
`body.html` L27 and timeline 1801: "on 7 December Franz Xaver von Zach found Ceres almost exactly where Gauss had said [23][24]". MacTutor supports it in two places (Gauss biography, opened; also https://mathshistory.st-andrews.ac.uk/HistTopics/Missing_Planet/: "Using Gauss's prediction, von Zach found Ceres on 7 December 1801"). Other accounts date the secured recovery to 31 December 1801 (Zach) with Olbers independently on 1 January 1802; the usual reconciliation is a first sighting on 7 December that weather kept Zach from confirming until 31 December. Ref [24] is cited for this sentence but was opened only as a bibliographic record. Suggested wording: "first sighted by Zach on 7 December and confirmed on 31 December 1801". Open Teets & Whitehead to settle it, or drop [24] from this sentence.

**S2. SDP4 has an author and three of the five satellites depend on it.**
`body.html` L236 and L239 name Kozai, Brouwer, Hilton, Kuhlman, Lane, Cranford, Hoots and Roehrich but give SDP4 no credit. Spacetrack Report No. 3, section 2 (opened): "The next model, SDP4, is an extension of SGP4 to be used for deep-space satellites. The deep-space equations were developed by Hujsak (1979) and model the gravitational effects of the moon and sun as well as certain sectoral and tesseral Earth harmonics which are of particular importance for half-day and one-day period orbits." The GPS, Molniya and GOES examples are all SDP4 cases, and Hujsak appears on the page only as a 2006 co-author. Add one clause in L239 and to the 1966–1970 or 1980 timeline row (ref [1] covers it; the primary is R. S. Hujsak, Spacetrack Report No. 1, 1979, listed in Vallado 2006).

**S3. The 22.9° and 23.6° steps are left unexplained, and NASA's own range reconciles them.**
`body.html` L154: "For the Station NASA gives approximately 22.9° [14]; the element set ... gives 23.6°". Recomputed: (360.986 + 4.95)°/day ÷ 1440 = 0.2541° per minute; × 90 min = 22.9°, × 93 min = 23.6°. NASA's figure is the low end of its own "90-93 minutes"; the 14 November 2026 orbit (92.94 min) is at the high end. One clause saying that turns an apparent disagreement into a check.

**S4. "Ephemeris type ... Always 0 in distributed sets" is Kelso's 1998 statement and needs a date.**
`script.js` L255. True of all five embedded sets and of CelesTrak's JSON today (EPHEMERIS_TYPE 0). But since the US Space Force released SGP4-XP, element sets of ephemeris type 4 exist and must be propagated with SGP4-XP, not SGP4 ("Type 4 indicates that the state elements are calculated and will be propagated using the SGP4-XP algorithm", https://ai-solutions.com/_help_Files/two-line_element_set_file.htm; see also ESA SDC9 paper 212). So "it does not tell you which model to use" is no longer universally true. Suggested: "0 in the public sets shown here; a 4 marks the newer SGP4-XP model".

**S5. Perigee drift "backward above it" is wrong for steep retrograde orbits.**
`body.html` L196: "forward below an inclination of 63.4°, backward above it, and not at all exactly there." 5 cos² i − 1 is negative only between 63.43° and 116.57°; above 116.57° the perigee moves forward again. The eq-box (L201) gives both zeros, so the prose contradicts it. "backward between 63.4° and 116.6°".

**S6. Early geodesy credit: Buchar came before Merson and King-Hele.**
Timeline 1958 credits Merson and King-Hele (Nature 182, 640, September 1958) for using Sputnik 2. E. Buchar of Prague published "Motion of the Nodal Line of the Second Russian Earth Satellite (1957β) and Flattening of the Earth" in Nature 182, 198–199, July 1958 (Crossref record for doi:10.1038/182198b0 opened; reprinted in NASA SP-94). The row makes no "first" claim, so nothing is false, but the usually omitted Czech result is two months earlier and fits the guide's stated aim of fair credit. Add him to the 1958 row.

## NIT

- N1. `body.html` L141: "the Orbit Mean-Elements Message, an international standard ... in XML, JSON or CSV". The CCSDS standard defines XML and KVN; CelesTrak's page says JSON and CSV use the same keywords "but not currently part of that standard". The reference note for [6] has it right; the body does not.
- N2. Okhotsimsky, Eneev and Taratynova: the Math-Net.Ru record (opened; UFN 63:1, 33–50, linked to ufn.ru/ru/articles/1957/9/c) is the September 1957 issue, so the paper predates Sputnik 1. Worth saying in the 1957 row. Full names would also be fairer than initials: Dmitry Okhotsimsky, Timur Eneev, Galina Taratynova. The credit itself is sound.
- N3. `body.html` L240: the Levit and Marshall figures are for four laser-ranged satellites with element sets from 1994 ("50 random starting dates in 1994"); "for its satellites" could say "four satellites, 1994 data".
- N4. `body.html` L142 sends the reader to NAVIGATOR for the elements a GPS satellite broadcasts; `navigator-gps` says only that each satellite "broadcasts where it is" and never describes the broadcast elements. Harmless, but the link promises more than the target has.
- N5. Molniya 3-50 is shown at 2,193 × 38,162 km, e = 0.677, while RELAY describes the Molniya orbit as e = 0.722 with a low perigee and IMPULSE uses 500 × 40,000 km. Not a contradiction (one is a design orbit, the other a 27-year-old derelict), but one clause that the perigee has risen since 1999 would stop a careful reader from thinking so. Needs a source for the launch orbit.
- N6. `body.html` L221 and `script.js` L375: the Vanguard 1 "published" rates divide (osculating node and perigee at 4,320 min in tcppver.out) minus (mean values in the TLE) by three days. Recomputed from the file: −9.207°/3 = −3.069, +13.574°/3 = +4.525, as stated. Mixing mean and osculating angles adds at most about 0.01°/day; fine at the precision quoted, but "about" would be honest.
- N7. Freshness: row 1 must change with M1 and M2. "The element sets come from the 18th Space Defense Squadron" (L99) is an organisational fact that can change and is not in any row; add it to the Space-Track row. `body.html` L239 "that most software now uses" is an unsourced superlative; "widely used" is safer.

## Checked and found correct

The seven items the author could not verify:
1. Catalogue exhaustion. CelesTrak banner today: "We ran out of 5-digit catalog numbers on 2026-07-11. The official USSF SATCAT is now at 101400. All newly cataloged objects have 6-digit catalog numbers of 100000+ and GP data will not be available for them using the TLE format." Page "Updated 2026 Jun 23". The guide's 101387 was the 14 November reading and is dated as such. SATCAT 101400 exists (2026-257N). Space-Track: "Why do all ELSETs have a constant element number of 999?" (yes; all five embedded sets carry 999); Alpha-5 "up to 339,999", range 100,000–339,999, "I" and "O" omitted; "18th Space Defense Squadron (18 SDS)". See M1 and M2 for what is wrong around these.
2. References 9, 10, 11, 18, 19, 20, 24, 28: Crossref records opened; authors, titles, journal, volume, pages and year all match the reference list (Kozai AJ 64, 367 and Brouwer AJ 64, 378, both November 1959; Hoots, Schumacher and Glover JGCD 27(2), 174–185, 2004; Merson and King-Hele Nature 182, 640–641; King-Hele and Merson Nature 183, 881–882; O'Keefe, "Eckeis" [sic, Eckels], Squires Science 129, 565–566, 27 Feb 1959; Teets and Whitehead Math. Mag. 72(2), 83–93; Curtis 2020). No number on the page rests on them.
3. Credit. Hilton and Kuhlman 1966 / Kozai; Cranford 1970 / Lane and Cranford 1969 / Brouwer; Hoots and Roehrich 1980, five models: Spacetrack Report No. 3 text, exact. Kozai / Brouwer split and the "kilometer or so at epoch" sentence: Vallado et al. 2006 text, exact. Okhotsimsky, Eneev, Taratynova: record confirmed. Gaps: S2, S6, N2.
4. Ceres: see S1.
5. ISS: NASA's 51.6°, 90–93 min, 15.5–15.9 orbits/day, 22.9°, 3-day repeat, 63-day cycle, decay and reboost all read on the NASA page. Page's own figures recomputed: period 92.94 min, node −4.951°/day, perigee +3.695°/day, step 23.6°, lighting 60.6 days, decay from ṅ/2 = 55 m/day. See M3 and S3.
6. GOES-19: NOAA NESDIS article (7 April 2025, 75.2° W, launched 25 June 2024) read; NOAA OSPO status page today: "Spacecraft Location: 75.2W, Operational Status: GOES-East". My SGP4 sub-point at the TLE epoch: 75.19° W. Landsat 9: USGS page read (27 September 2021, Atlas V 401, 705 km, 98.2°, 99 min, 16-day repeat, 10:12 a.m. ± 5 min); CelesTrak status "+", 702 × 703 km, 98.21°; my local mean time of the descending node from the TLE: 10:12.5; 233.00 nodal revolutions in 16 days.
7. The five TLEs: 69 characters, all ten checksums valid, catalogue numbers, designators and names match the SATCAT (launch dates 1998-11-20, 2021-09-27, 2014-08-02, 1999-07-08, 2024-06-25; Vanguard 1 1958-03-17, still in orbit, TLE issued today). Against CelesTrak's sets of 15 November: ISS node 277.23° → 272.12° in 1.032 days (−4.95°/day), rev counter +16; Landsat 9 node +0.986°/day; GOES-19 mean longitude advance matches n to 0.02°; the Molniya 3-50 set is still the current one, byte for byte. The embedded 24 h and 72 h reference positions reproduce with python-sgp4 to under 1 m for all five.

Other sources opened and matching: Kelso 1998 (ṅ/2, n̈/6 not used by SGP4/SDP4, B* in inverse Earth radii, 57–99 / 00–56, November 1972, node-to-node revolution); tle-fmt; Kelso 1995 (23 h 56 m 04.09054 s); STR#3 constants (6378.135, 5.413080E-4, −.253881E-5, 225 minutes, the "mean" values passage, pseudo-drag ignored by SGP4); Vallado μ = 398600.8 and TEME; tcppver.out last line for satellite 00005; PyPI sgp4 example (−6088.92, −936.13, −2866.44); Levit and Marshall (0.8 ± 0.3 km, approximately 1.5 km/day); IS-GPS-200N (7.2921151467 × 10⁻⁵ rad/s, −2.6 × 10⁻⁹ semicircles/s, 26,559,710 m); ITU-R S.484-3 (in force; "between 0.75° and 0.95° per year"); MacTutor Kepler ("published in 1609 and 1619", Heidelberg 1609) and Gauss (1 January 1801, 9°, born 30 April 1777, 1809); NSSDC Earth fact sheet (6378.137, 6356.752, J2 1082.63 × 10⁻⁶, 23.9345 h).

Science statements recomputed and right: Molniya at M = 90° (E 122.7°, ν 153.0°, r 36,264 km, 89.5 % of the period beyond ν = ±90°); J2/|J3| = 426; critical inclinations 63.43° and 116.57°; a^−3.5 scaling; GPS J2 node rate −0.0383°/day against the reference −0.0404 (the gap is consistent with lunisolar precession of about −0.0014°/day plus the inclination difference); Scotland and Tierra del Fuego lie poleward of 51.6°.

Neighbouring guides opened: no contradiction with `physics-of-spaceflight` (400 km: 7.67 km/s, 92.6 min; 23.9345 h; points here for the other elements), `sunsync-earth-observation` (705 km, 98.2°, 10:12, 0.986°/day, 16 days), `relay-telstar-syncom` (23 h 56 min 4 s, 63.4°, apogee stays north) or `navigator-gps` (55° planes). ELEMENTS uses the WGS-72 constants of SGP4 (398,600.8; 6,378.135; 0.001082616) where the neighbours use 398,600.4418, 6,378.137 and 0.00108263; it says so and why, so this is not a conflict. See N4 and N5.

No reference rests on Wikipedia. Primary sources are used where they exist, except the Kepler and Gauss history (MacTutor, a reputable tertiary source).

## Not checked

- What Space-Track's API returns today for objects above 99,999 (needs an account); see M2.
- The full texts of Kozai 1959, Brouwer 1959, Hoots et al. 2004, Merson and King-Hele 1958, King-Hele and Merson 1959, O'Keefe et al. 1959, Teets and Whitehead 1999 and Curtis 2020: records only, as the author. Teets and Whitehead matters for S1.
- The other verification points (CBERS-2, Molniya 2-14, Delta 1 debris, and all but the last Vanguard 1 line) against tcppver.out, and the instruments' own arithmetic and error figures: reviewer A's job.
- Molniya 3-50's launch orbit and whether it is still operating (the catalogue shows no status code).
- `check-all.sh` was not run, to avoid rebuilding the page from this review. Russian text, accessibility and layout: reviewer C.
