APPROVE WITH CHANGES — the science and almost every date check out against the cited sources; three statements must be fixed (a planned Chinese L5 mission left out of "what is next", a citation that does not carry the claim made for it, and "first at" where the source and the page's own text only support "first to orbit").

# REVIEW B — domain science and sources: `lagrange-points` (EQUILIBRIUM)

Reviewer B (celestial mechanics and mission design), 2026-11-15. Not the author. Sources were opened as pages or full PDFs
(Koon et al., Siddiqi, Sicardy and five NTRS papers were downloaded and searched as text), not read from search snippets,
except where "Not checked" says otherwise. `./check-all.sh lagrange-points` = ALL OK on 2026-11-15.

Counts: **3 MUST, 7 SHOULD, 8 NIT.**

## The author's five open items, settled

1. **Gascheau 1843 / Routh 1875, ref [5]: confirmed from the paper itself.** Full text read (author's copy,
   https://lesia.obspm.fr/perso/bruno-sicardy/biblio/biblio/Sicardy_Gascheau_CelMec10.pdf). Abstract: "Gascheau's value
   µG = … 0.0385208… (also known as the Routh value)". Section 1: "Gascheau was the first to study the stability of the L4
   and L5 points (Gascheau 1843) … This result was published more than thirty years earlier than Routh (1875) … Routh
   actually extended the result to a general attraction law". Footnote 1: "Gabriel Gascheau was born in 1798, he was a
   professor at Toulouse University, France. His thesis … was published in Paris in 1843." The initial "G." is right; the
   full first name (Gabriel) can now be used. The same paper carries the eq-note sentence about special mass ratios below
   the limit (µ = 0.01352… and 0.02429…, Deprit & Deprit-Bartholomé 1967), so the [5] there is sound.
2. **Earth Trojans, refs [25][26]: confirmed, both at L4.** Connors, Wiegert & Veillet, Nature 475, 481–483 (July 2011),
   abstract: "2010 TK7 is a Trojan companion of Earth, librating around the leading Lagrange triangular point, L4"
   (https://www.nature.com/articles/nature10233). Santana-Ros et al., Nat. Commun. 13, 447 (2022), abstract: "2020 XL5 will
   remain in L4 for at least 4 000 years" (https://www.nature.com/articles/s41467-022-27988-4). The MPC Earth list (dated
   2026 May 30) has one object, (614689) 2020 XL5, L4.
3. **Euclid launch date: confirmed.** ESA Euclid page: "Launch: 1 July 2023 · Launch vehicle: SpaceX Falcon 9 ·
   Destination: Sun-Earth Lagrange point 2, 1.5 million km from Earth"
   (https://www.esa.int/Science_Exploration/Space_Science/Euclid). Same date as DARK. The register note can cite this page.
4. **Roman's status: the page is true today.** NASA launch page (updated 8 Sep 2026): launched "Aug. 30, 2026 at 7:26 a.m.
   EDT" on a Falcon Heavy, "three-month, million-mile journey". NASA Roman blog, 14 Sep 2026: insertion at L2
   "approximately 100 days after launch, or about early December"
   (https://science.nasa.gov/blogs/roman/2026/09/14/fuel-savings-double-potential-lifetime-for-nasas-roman-mission/). The
   newest post on https://science.nasa.gov/blogs/roman/ is dated 13 Nov 2026 (instrument commissioning) and none reports
   an insertion. So "still on its three-month transfer" holds on 15 Nov 2026; see NIT 8 for the more exact wording.
5. **"61,300 km": the figure is real, but the page's sentence is not what the cited source says.** See MUST 2.

## Findings

### MUST

**MUST 1 — "next" at the triangular points leaves out the mission planned to get there first.**
body.html ch7: "The triangular points of the Sun–Earth system are next: ESA's Vigil is planned for launch in 2031 to L5 …
(as of November 2026) [30]." Vigil's 2031 is confirmed (https://www.esa.int/Space_Safety/Vigil: "planned for launch in
2031"). But China's Xihe-2 solar observatory is an approved mission to the same point with an earlier date: CASC/CGTN,
updated 9 Feb 2026, "between 2028 and 2029 … Xihe-2 will be the world's first artificial probe sent to the fifth Lagrange
point" (https://english.spacechina.com/n17212/c4541181/content.html); CGTN 24 Apr 2026, "scheduled for launch to the
sun-Earth Lagrangian L5 point"
(https://news.cgtn.com/news/2026-04-24/China-opens-15kg-payload-on-Xihe-2-solar-mission-to-global-partners-1MBn7Mve5yM/p.html).
As written, a reader concludes that Vigil will be the first spacecraft at a Sun–Earth triangular point; on today's plans
it will be the second. Name both with their planned dates, and add a freshness row for Xihe-2.

**MUST 2 — "NASA's round figure for both is 61,300 km [7], which is the leading-order value" is not supported by [7].**
body.html ch7; also the label of the check at checks.js:63 ("NASA's round figure for both ARTEMIS points (Siddiqi)").
- Siddiqi [7] gives the number for L2 only, and as a height: "into orbit around the Earth–Moon L2 Lagrange point, located
  on the far side of the Moon, about 61,300 kilometers above the lunar surface" (p. 2010 entry, ARTEMIS). NASA's mission
  page has the same sentence, L2 only (https://science.nasa.gov/mission/themis-artemis).
- "Both" does have a NASA source, but a different one: Folta & Woodard (NASA Goddard), 14 Sep 2010: L1 and L2 "each about
  61,300 km (38,100 miles) above the lunar surface"
  (https://phys.org/news/2010-09-artemis-earth-moon-libration-orbiter.html, a repost of the Goddard feature).
- Every source says "above the lunar surface". The page drops that and states as fact that the number "is the
  leading-order value". My recomputation: R·(μ/3)^⅓ = 61,274 km from the Moon's centre, i.e. 59,537 km above the surface;
  the exact points are 56,283 km (L1) and 62,778 km (L2) above the surface. So the published figure matches the
  leading-order distance from the centre, not a height. That is a reasonable inference; it is the author's, not NASA's.
Fix: cite the Goddard feature (or its NTRS equivalent) for "both"; quote "above the lunar surface"; say that the number
equals the leading-order distance from the Moon's centre, as the page's own observation. Reword the check label.

**MUST 3 — "first at" where the source says "first to orbit", and the page contradicts itself.**
- script.js:455 (timeline 2010): "the first spacecraft at the Moon's libration points"; script.js:419 (register): "the
  first at an Earth–Moon point". The same chapter says Hiten "was sent through the Moon's L4 and L5 regions after October
  1991" (Siddiqi: "a looping orbit that passed the Earth–Moon L4 and L5 Lagrange Points"). Hiten was at Earth–Moon
  libration points nineteen years before ARTEMIS.
- Siddiqi's wording, which is the cited authority for all three firsts, is "First spacecraft to orbit a libration point"
  (ISEE-3), "First spacecraft to orbit libration point L2 (Sun–Earth)" (WMAP), "… L2 (Earth–Moon)" (ARTEMIS P1), "… L1
  (Earth–Moon)" (P2); and for ARTEMIS "the first time that a spacecraft had successfully entered orbit around an
  Earth–Moon libration point".
- MOD.json already has it right for ARTEMIS ("The first spacecraft to orbit a libration point of the Earth–Moon system").
Fix: "first to orbit" in script.js:401, 411, 419, 452, 454, 455 and in MOD.json rows 1 and 2 (EN and RU).

### SHOULD

**SHOULD 1 — Gateway is described without its present status.** body.html ch5: "the near-rectilinear halo orbit chosen
for the Gateway station"; script.js:390: "a simulation for Gateway's orbit". The linked guide HALO opens with "NASA's 2026
decision to pause it" (24 March 2026, status as of 10 October 2026). The pointer "(see HALO for the station's status)" is
there, but a reader who does not follow it takes Gateway as going ahead. Add four words ("paused by NASA in March 2026").

**SHOULD 2 — the NRHO cost range is narrower than the cited paper's.** script.js:390 and ref [10]: "about 1 m/s per year
and up to 2.3 with poorer navigation". Davis et al. 2020 (NTRS 20200000733, full text): baseline "mean annual cost … is
0.9 m/s" and "1.0 m/s" with phase control; "Mean annual costs range from just over 1 m/s to 2.3 m/s assuming 5
desaturations over perilune"; and also a worst case, "an annual Δv of about 4 m/s", and a best case with ARTEMIS-level
navigation and no desaturations, "a mean annual cost of 0.43 m/s". "Up to 2.3" is therefore not the paper's upper end.
Say "about 0.4 to 4 depending on navigation errors and wheel desaturations, about 1 in the baseline case"; this also
agrees better with [31] ("a few meters per second per year").

**SHOULD 3 — a known end date is shown as a dash, and one arrival date is missing.** LISA Pathfinder ended in 2017: ESA
sent the final commands on 18 July 2017, after leaving L1 in April 2017 (ESA operations blog,
https://blogs.esa.int/rocketscience/?p=3374; JPL, https://www.jpl.nasa.gov/news/a-final-farewell-to-lisa-pathfinder/).
The table's note says a dash is no claim of operation, but this is the one row where the end is nine years old and
documented; the freshness row that lists the open-ended missions does not include it either. Spektr-RG has no arrival
date; 21 October 2019 is widely given (I found it only in secondary sources, so confirm with IKI or MPE before adding).

**SHOULD 4 — mixed time zones in one date column.** All Siddiqi launch dates in the register are UT. Queqiao is listed as
"21 May 2018", which is Beijing time; the cited source itself says "May 21 at 5:28 a.m. Beijing time (21:28 UTC May 20)"
(https://www.planetary.org/articles/20180615-queqiao-orbit-explainer). Only the reference note carries "(Beijing time)";
the table does not. Either give 20 May 2018 (UTC) or mark the cell. Same kind, smaller: Lucy's "11 August 2027" for
Eurybates is NASA's date in Eastern Time (the page lists flybys in ET); CAPSTONE's 13 November 2022 is US time; Aditya-L1's
6 January 2024 is IST (same UT date).

**SHOULD 5 — Earth–Moon "passes" the stability test with no word about the Sun.** body.html ch4: "Sun–Jupiter (1,048 to
1) and Earth–Moon (81 to 1) pass". Chapter 1 promises "other bodies pull too; where that matters, the text says so". At
the Earth–Moon L4 and L5 it matters: the Sun's perturbation is the dominant effect there, and the page's own reference
[11] treats those points as "a quasi-stable location" whose motion depends on "the Earth-Moon mass ratio and solar gravity
perturbation" (Folta & Vaughn 2004, section C). One clause is enough: the two-primary criterion is met, but the Sun
disturbs motion there strongly, which is one reason no natural Trojan of the Moon is known. (The Kordylewski dust clouds
are contested; the page rightly does not assert them.)

**SHOULD 6 — a freshness row attributes "Earth 2" to the Minor Planet Center.** meta.json row 2 and the NOTES table:
"Minor Planet Center Trojan counts …: Jupiter 9,823 + 5,942, Mars 18, Neptune 35, Earth 2". The MPC page says "1 Earth
Trojan, 18 Mars Trojans, 15765 Jupiter Trojans, 0 Uranus Trojan and 35 Neptune Trojans"
(https://www.minorplanetcenter.net/iau/lists/Trojans.html, lists updated 2026 May 30); 2010 TK7 is not on its list. The
reader-facing text is right (it cites [25][26] for the two), so this is a register error only: write "Earth 1 on the MPC
list (2020 XL5); two known with 2010 TK7 [25]". Tagged SHOULD rather than MUST because no reader sees it.

**SHOULD 7 — the year Farquhar named the halo orbit.** body.html ch5 and script.js:451 put both the discovery and the
name in 1966. The cited textbook says two things: §6.2, "Robert Farquhar discovered trajectories around L2 … (Farquhar
[1966]). He named such a trajectory a 'halo orbit'"; and chapter 1, "Such orbits were originally named for lunar halo
orbits by Farquhar [1968]" (his thesis). The safe wording is "found them in 1966 and named them halo orbits (the name is
in print by his 1968 thesis)".

### NIT

1. body.html ch8 heading: "the busiest places in deep space" is a superlative with no source. Lunar orbit and Mars orbit
   hold comparable numbers of working spacecraft. "Among the busiest" is safe.
2. body.html ch6: "a period the linear theory puts at 147 years; a published value is about 150 [24]". Fleming & Hamilton's
   "∼150 years for Jupiter's current mass" is the same small-amplitude formula (their Eq. 5), not an independent
   measurement (https://ar5iv.labs.arxiv.org/html/astro-ph/0007296). Say "the same formula is quoted as about 150".
3. body.html ch5: "the ACE, SOHO and Wind flight team … spend about 1 m/s a year [8]". Roberts: "around 1.0 m/sec for ACE
   and WIND, and much less than that for SOHO". The reference note has it right; the sentence should too.
4. body.html ch7: "Their halo orbits are wide enough to stay out of Earth's shadow [12]". [12] is about Webb only, and
   WMAP, Herschel, Planck and Chang'e 2 flew Lissajous orbits (Siddiqi; the register says so). "Their orbits".
5. Secondary sources where a primary exists: [21] The Planetary Society for Queqiao (primary: CNSA/CLEP or Xinhua, as
   RABBIT uses CASC); [29] a NASA Marshall instrument page for the Russian–German Spektr-RG (primary: IKI, Roscosmos or
   MPE). Both say what the page says; this is about whose record is cited.
6. Credit: 2020 XL5 was first identified as an Earth Trojan by Hui, Wiegert, Tholen & Föhring (2021, ApJL,
   arXiv:2111.05058); [26] is the confirmation and characterisation. "Confirmed in 2022" is accurate; a co-citation would
   be fairer. Both Earth Trojans are temporary (TK7 "stable over at least ten thousand years", XL5 "at least 4 000 years").
7. Hero: "a lunar relay … live at these points" is a present-tense status for Queqiao, while the notes say no
   still-operating claim is made. The latest confirmation I found that Queqiao (2018) was working is from 2024.
8. Roman: NASA's own figure is "approximately 100 days after launch, or about early December" (8 Dec 2026 by count).
   "Three-month transfer" is NASA's phrase too; adding "insertion expected in early December 2026" would make the row
   self-checking. Also, the freshness row for open-ended missions cites ESA's explainer page, which carries no end dates.

## Checked and found correct

Opened and matched to the page (source in brackets):
- **Koon, Lo, Marsden, Ross [1]** (PDF, full text): quintic (2.5.2) and series (2.5.3) as printed in the eq-box; r_h =
  6.825 × 10⁻², γ₁ = 6.666 × 10⁻² (series), 6.668 × 10⁻² (exact), x_L1 = 0.9324; γ₁ = 1.001090475 × 10⁻² and
  1.497610041 × 10⁶ km; µ0 ≃ 0.038521; "Euler [1767] discovered L1, L2, and L3 just a few years before Lagrange [1772] …
  despite being historically inaccurate"; Clarke 1950; a spacecraft exactly at L1 "would be lost in the Sun's glare".
- **Euler Archive E327 [2]**: written 1763, published 1767, Novi Commentarii 11, 144–151. **NASA [4]**: "approximately 23
  days", "exceeds 24.96", the 1772 Essai, "NASA is unlikely to find any use for the L3 point"; page dated 27 Mar 2018,
  updated 1 Nov 2024.
- **NSSDCA fact sheets [6]**: every mass, distance and period in the reference note (Sun 1,988,400; Earth 5.9722; Moon
  0.07346; Jupiter 1,898.13; Pluto 0.01303; 149.598; 778.479; 0.3844; Charon 19,596 km and 6.3872 d; 365.256; 4,332.589;
  27.3217; synodic 29.53). Mass ratios 1,048, 81 and 8.2 and the four μ values follow.
- **Siddiqi [7]** (PDF, full text): launch dates of ISEE-3, Wind, SOHO, ACE, WMAP, Genesis, THEMIS, Herschel/Planck,
  Chang'e 2, Gaia, Chang'e 5-T1, DSCOVR, LISA Pathfinder; ISEE-3 halo 20 Nov 1978 and departure from 10 Jun 1982; Wind
  "by November 1996" and "By 2004 … back at L1"; "about an hour warning"; SOHO 14 Feb 1996, "approximately six months";
  ACE operational 21 Jan 1998; WMAP 1 Oct 2001 and graveyard orbit Oct 2010; Genesis 22 Apr 2004; Herschel mid-July 2009
  and 29 Apr 2013; Planck 3 Jul 2009 and 23 Oct 2013; Chang'e 2 25 Aug 2011, 180-day Lissajous; Gaia 8 Jan 2014,
  263,000 × 707,000 km; Chang'e 5-T1 27 Nov 2014 – 4 Jan 2015, 14 days; LISA Pathfinder 22 Jan 2016; ARTEMIS 25 Aug and
  22 Oct 2010; Hiten's L4/L5 passes with the dust counter on (and the "January 1991" misprint the author noted).
- **Roberts [8]**: 178 days; "doubling time constant is approximately 16 days"; "about three months"; at L1 since 1997,
  1996, 2004. **Folta et al. [9]**: 7.39, 5.28, 5.09 m/s per year; 25 Aug / 22 Oct 2010; 27 Jun / 17 Jul 2011; weekly
  manoeuvres; "for 11 months". **Davis et al. [10]**: 9:2, 6.56 d (6.26–6.76), 3,366 km, 71,100 km. **Folta & Vaughn
  [11]** and **Parrish et al. [31]**: quoted ranges as stated.
- **NASA Webb orbit [12]**, **Logan et al. [13]** (NTRS record: launch 25 Dec 2021, L2 insertion 24 Jan 2022), **ESA
  [14]**, **ISRO [16]** (2 Sep 2023; 6 Jan 2024 IST; "about 177.86 earth days"), **JHUAPL [17]** (final manoeuvre
  confirmed 10 Jan 2026), **NOAA [18]** (24 Sep 2025 with IMAP and Carruthers; final burn 23 Jan 2026; renamed SOLAR-1),
  **NASA CAPSTONE [20]** (28 Jun 2022; 13 Nov 2022; "first spacecraft successfully inserted into a cislunar near
  rectilinear halo orbit"; updated 26 Jun 2026), **Planetary Society [21]** (14 June 2018; about 65,000 km).
- **MPC [22]**: I downloaded the four lists and counted the rows: Jupiter 9,823 L4 + 5,942 L5 = 15,765; Mars 2 + 16;
  Neptune 28 + 7; all "last updated on 2026 May 30". **JPL SBDB [23]**: "Discovered 1906-02-22 by Wolf, M. at
  Heidelberg"; (588) Achilles is L4 on the MPC list. **NASA Lucy [27]**: 16 Oct 2021; 1 Nov 2023; 20 Apr 2025; 11 Aug
  2027; 3 Mar 2033; "eight Trojan asteroids". **NASA Telesto [28]**: Telesto about 60° ahead, Calypso about 60° behind.
  **NASA MSFC [29]**: Baikonur, 13 July 2019, halo orbit about L2. **ESA Vigil [30]**: 2031, L5.
- **Neighbouring guides**, opened: UNFOLD (1.5 million km, about six months, as wide as the Moon's orbit, 24 Jan 2022),
  PARALLAX (19 Dec 2013, L2), DARK (Euclid 1 July 2023; Roman 30 Aug 2026 at 7:26 a.m. EDT, in commissioning on the way to
  L2), HALO (about 6.5 days; 1,500 km altitude and 70,000 km, consistent with 3,366 km radius and 71,100 km), RABBIT (exact
  L2 root 0.168 of 384,400 km = this page's 64,500 km; Queqiao launched May 2018), GLOW (WMAP 30 June 2001, Planck 14 May
  2009 and 23 Oct 2013). No contradiction found other than SHOULD 1.
- Own arithmetic: Sun–Earth Hill distance 1.497 million km; 5μ/12 and 7μ/12 give 187 and 262 km; Earth covers 85 % of the
  Sun's disc from L2; 365.256/2.0865 = 175 d and /2.0152 = 181 d; 2 × 29.53/9 = 6.56 d; 1906 − 1772 = 134.
- Freshness rows exist for every "as of" statement on the page (Roman, MPC counts, Vigil, Lucy, the open-ended register
  rows, Gateway), subject to MUST 1 and SHOULD 6.

## Not checked

- **Bistafa [3]**: only the arXiv record was opened. I did not read the translation, so the reference note's sentence that
  Euler "does not say in so many words that the line of bodies can rotate rigidly" and "presented December 1763" are
  unconfirmed by me. (Sicardy cites "Euler 1763, 1764, 1765" for the collinear points, which supports the dating.)
- **Lagrange's 1772 essay** was not opened; the date and "prize essay" rest on NASA [4], Koon [1] and Sicardy [5].
- **ESA Gaia passivation [15]**: the page was fetched but the extract did not return the date in so many words; 27 March
  2025 came back only as the date of the final disposal burn, with passivation "after" it; I know the date from memory to
  be right, but that is not a quotation.
- **LISA Pathfinder's end date** (SHOULD 3) and **Spektr-RG's arrival date** come from search results over ESA, JPL and
  AEI pages; I did not open those pages themselves.
- **Spektr-RG's arrival date and present status, Queqiao's present status, DSCOVR/ACE/Wind/SOHO present status**: not
  checked; the page makes no operating claim in the register.
- **Xihe-2**: the 2028–2029 window is from CASC/CGTN pages of February and April 2026; I found no later statement and did
  not look for a Chinese-language primary.
- **Instrument numerics** (solver, eigenvalues, contour tracer, propellant) are reviewer A's; I checked only the few
  values listed above. **Russian text, history of credit in detail, markup and access** are reviewer C's.
- Roberts [8] on NTRS is a two-page draft abstract; the full conference paper was not found, so nothing beyond the
  abstract is verified.
