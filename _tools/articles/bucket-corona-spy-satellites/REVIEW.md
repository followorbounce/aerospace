# REVIEW — BUCKET (CORONA, Zenit & the first spy satellites)

**Date:** 2026-10-23 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. All the physics re-derives independently, and every reference link resolves (HTTP 200). There are six MUST-FIX items, all applied in the sources. The most important one is the resolution conflict the author flagged: the page used the USGS figures but never told the reader that the CIA history gives different ones. The others are a cause stated as fact (KH-1), a recovery detail the cited sources do not support, a misdescribed Wikipedia disagreement, an altitude attributed to a table that does not contain it, and a heading that counts the wrong number of days.

Scripts and data: `/tmp/claude-1000/-home-none-git/98d54dca-fa8e-4aef-8d4f-2f576b4a6497/scratchpad/wave7/review-bucket/`. It holds `phys.py` (recovery, scipy `solve_ivp` at rtol 1e-10), `phys2.py` (resolution, swath, and a lifetime integrator with `quad` orbit-averaging plus LSODA), `probe.js` (a jsdom probe at presets and slider extremes), `shot-tall.sh`, `dl/` (the CIA, Galiatsatos and Dashora PDFs, the USGS page, the archived NRO fact sheet and every other reference), and `img/` (CIA pp. 12, 21, 22, 24 rendered from the page images).
After the fixes, `./check-all.sh bucket-corona-spy-satellites` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 16/16, timeline 15, 63 checks PASS).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

| Quantity | Reviewer | Page |
|---|---|---|
| 1 May → 19 Aug 1960 | 110 d | 110 ✔ |
| 116 / 502 mi; period (R_eq) | 186.68 / 807.89 km; 94.560 min (94.41 with R_mean) | 187 / 808; 94.56 ✔ |
| 150 m/s from 200 km: v_e, γ_e, burn→entry | 7.7314 km/s, −1.6258°, 11.53 min | 7.73, −1.63, 12 min ✔ |
| Entry (β 200): peak g at h; entry→chute; v at 60,000 ft | 8.558 g at 43 km; 6.40 min; 210 m/s | 8.6 g; 6.4 min; 210 ✔ |
| β 100 / 400: peak g; v at chute | 8.13 / 9.08 g; 141 / 331 m/s | (assumption; trend only) |
| Sink √(ρ) scaling at 60,000 ft (20 ft/s ref) | 56.5 ft/s | 56.5 ✔ |
| Window 15k–5k ft at 20 / 33 ft/s | 8.14 / 4.93 min → 3.26 / 1.97 passes | 8.1 / 4.9; 3.3 / 2.0 ✔ |
| Chute → window (20 ft/s); chute → sea | 22.75; 35.5 min | 23 min ✔ |
| dRange/dΔv; ± tolerance for 250 mi | 26.32 km per m/s; ±7.64 m/s | 26; ±8 (7.6) ✔ |
| +20 m/s shift | −476 km (> 201 km half-depth) | outside ✔ |
| Zone centre; track azimuth at 77.6° | 17.689° N; 166.97° | ✔ |
| Film-limited GR KH-1…KH-4B | 6.30 / 8.27 / 7.12 / 6.92 / 2.46 / 1.538 m (52/90/93/91/90/84 % of USGS) | ✔ |
| f/3.5 aperture; lens limit (λ 0.62 µm); KH-4B diffraction on ground | 174.2 mm; 377.7 lp/mm; 0.651 m | ✔ |
| Scale KH-4B; Zenit; Zenit lp/mm for 10 m | 1:246,063; 1:250,000; 25 | ✔ |
| Pan angle 29.8″/24″ | 71.142° | 71.1 ✔ |
| H·θ (150 / 185 km); true spherical swath; ratio | 186.3 / 229.8; 215.9 / 266.7 km; 0.863 | 186 / 230; 216; "13 % shorter" → 13.7 % (SHOULD 5, fixed to 14 %) |
| Stretch at 35.58° flat / sphere | 1.230, 1.512 / 1.228, 1.517 | 1.23, 1.51 ✔ |
| ρ(150)/ρ(200), ρ(150)/ρ(300) | 8.166, 108.3 | "eight", "a hundred" ✔ |
| Lifetime 300 circ / 150 circ / 187×808 / 150×400 (β 400) | 187.1 d / 0.589 d / 247.2 d / 14.98 d | 189.6 / 0.61 / 248 / 15.1 (≤ 3.9 %; the page's explicit step) ✔ |
| Lifetime ∝ β (200×300, β 400 → 800) | 35.16 → 70.32 d (×2.000) | ✔ |
| 50 km of perigee ↔ KH-4B GR | 0.513 m | "about half a metre" ✔ |
| Scan: 160 lp/mm; 7 µm on ground; lp kept | 6.25 µm / 3.125 µm; 1.72 m; 71.4 lp/mm | ✔ |

- **The Gauss equations are correct:** da/dt = −a²ρv³/(μβ) and de/dt = −ρv(e + cos ν)/β, averaged with weight (1 − e cos E) dE. The units check (kg/km³ and kg/km²). The vacuum run conserves energy and angular momentum to 1e-14, and the coast arc is the closed-form Kepler solution, not a numerical one.
- **checks.js mostly tests published values:** the 94.5 min period, the USGS figures, the 71.16° pan angle, 13.8/17 km frames, 188/232 km coverage and the 3–4 passes. A few checks are arithmetic only and never call page code ("Zenit 250e6/1000", "10 m → 25 lp/mm", "6 ft = 1.83 m"). That is harmless (NICE 1).

Findings:
1. **SHOULD — the edge-stretch readout and status are flat-Earth.** The swath beside them is spherical. At the defaults the difference is under 0.5 %, but at 500 km and 120° the status says "2.00 times farther" while the spherical slant range is far larger. Either compute it on the sphere (incidence i = asin((R+H)/R·sin a); slant = R·sin(i − a)/sin a; across factor = slant/(H cos i)) or label it "(flat-Earth approximation)". **Left open.**
2. **SHOULD — at extreme burns the recovery status says "allows an error of only about ±44 m/s"** (400 m/s from 150 km), and it quotes a local tolerance when the splash point is 3,800 km off. Drop "only" when the tolerance exceeds about 15 m/s, or skip that clause when outside the zone. **Left open.**
3. **NICE — the lifetime readout prints "0.1 hours"** at 120 km and β 50. Switch to minutes below 1 h.
4. **NICE — the label of the check "true swath … ~13 % longer"** tests a ratio of 1.16. Make the label agree.

## 2. Historian / fact-check — APPROVE WITH CHANGES

Opened and confirmed (✔ unless noted):
- **Ruffner/CIA 1995 (PDF, 41 pp.).** Where the OCR has gaps the reviewer read the page images: pp. 12, 21, 22 and 24 of the history.
  - Sequence: Agena "pitched down through 60 degrees", spin-up, retro, de-spin, thrust cone and heat shield, drogue then main; C-119 then C-130 ✔.
  - Drop tests: "sink rate of about 33 feet per second … approaching 20 feet per second … three or four passes" ✔.
  - Nominal impact "approximately 250 miles south of Honolulu", "north-south axis of some 250 miles and an east-west axis extending about 550 miles to either side" ✔.
  - Discoverer XIII: no camera, ejected on the 17th orbit, splash-down "about 330 miles northwest of Hawaii", "beyond the range of the airborne recovery aircraft" ✔.
  - Discoverer XIV: launched 18 Aug, ejected on the 17th pass, Capt. Harold E. Mitchell, 6593rd Test Squadron, C-119 "Pelican 9", third pass ✔. Press release: 77.6°, 502/116 mi, 94.5 min, chute at 60,000 ft, 84 lb, **8,506 ft** ✔.
  - "Greater area than the total produced by all of the U-2 missions" ✔; "110 days", seven passes over denied territory, 17 orbits ✔; twelve launches Feb 1959 – Jun 1960 (8 cameras: 4 no orbit, 3 camera/film, 1 spin rockets) ✔; drag make-up units ✔.
  - 145th and final launch; final recovery 31 May 1972, the 165th ✔. EO of 22 February 1995, "more than 800,000" ✔. KH-1 "nominal ground resolution of 40 feet" and the definition of ground resolution ✔.
- **The 24 Feb 1995 unveiling is in the PDF text itself.** The Foreword says: "Vice President Albert Gore … unveiled the first CORONA photographs for the American press and public at CIA Headquarters on 24 February 1995." The flag is resolved, and ref [1]'s note now says so.
- **nro.gov still returns 403** (curl and WebFetch), and the Wayback Machine refused automated access. The alternative route worked: the NRO Fact Sheet (2009), archived at the UNT web archive (`https://webarchive.library.unt.edu/web/20090813044320id_/http://nro.gov/NRO_Fact_Sheet.pdf`). It says CORONA was "declassified in 1995, along with ARGON and LANYARD. CORONA collected over 800,000 images and flew a total of 145 missions." That corroborates [1]. KH-11's 19 Dec 1976 date is confirmed through the NRO brochure quoted verbatim in [7] ("On December 19, 1976, the NRO launched the KENNEN (KH-11) near real-time electro-optical satellite") ✔. [8]: "From Buckets to Bits", more than 3,000 documents ✔.
- **USGS [2] (opened today):** 40/30/25/25/9/6 ft; 70 mm × 29.8 in; 30° separation; >860,000 images 1960–1972; EO 12951; 7/14 µm; $30.00 per frame; existing files free on EarthExplorer ✔. Note that the KH-1 row is a single mission (9009, 8/1960), which is Discoverer XIV's film.
- **Galiatsatos [3], Table 1:** 192/252/217/211/180/150 km; mission life 1 … 19 d; pan angle 71.16°; Tessar → Petzval; 50–100/120/160 lp/mm; 13.8 × 188 and 17 × 232 km; 1:247,500 ✔. **But** the table's ground resolution is KH-2 7.60 m and KH-4B 1.80–7.60 m, and its aperture width is 5.265° (see MUST 5 and SHOULD 6).
- **Dashora [4]:** 609.602 mm; Tessar → Petzval for chromatic blur; ±15°; constant IMC on KH-1; 0.5461–0.71 µm with 0.62/0.65 optimum ✔. The 2.18 × 29.8 in format and the acetate base on KH-1 only both come from this table, not from [3].
- NASM [5] "about two meters (six feet)" ✔. NASM [6]: "recovered north of Hawaii by the U.S. Navy on August 11, 1960"; 73.7 × 47 cm, 136.1 kg ✔.
- NatGeo [14]: ~4,500 known → 10,000 new ✔. Bolch [15] abstract: ~5 % 1962–2005, clean ice > 10 % ✔. PDAS [16] ✔.
- **Zenit sources.** EN WP [9]: 2.3 m, ~2,400 kg; "most flights carried four cameras of 1000 mm"; 10–15 m; perigee ~200 km, apogee 250–350 km, 8–15 days; first launch 11 Dec 1961 failed; Kosmos 4 26–29 Apr 1962; Kosmos 7 28 Jul 1962; last launch 7 Jun 1994; Zenit-2 table runs to no. 81 ✔. RU WP [10]: «Фтор-2» with an «Орион» 200 mm and **two** «Ленинград-9» 1000 mm cameras, "**later** («Фтор-2Р») one more large-scale camera was added" (so three); 150 km strip from 250 km; ~10 m; 81 launches; in service from 1964 ✔. Gunter [12]: launch list, Ftor-2 ✔. Kosmos 4 [11]: orientation-system gas leak, uncontrollable for most of the flight, recovered 29 Apr ✔. Yantar [13]: Yantar-2K a month in orbit with two film-return capsules; Terilen first launched 28 Dec 1982, "first real-time digital system" ✔.

Findings:
1. **MUST — resolution conflict not shown on the page.** Ruffner's 1995 introduction gives KH-2/KH-3 "10 feet" and KH-4B "5 feet"; Galiatsatos gives 7.6 m for KH-2. The page used the USGS figures without saying sources differ, and the model's "90–93 % of the published figure" looks like a validation only against that one list (and only because the low end of 50–100 lp/mm was chosen). **Fixed** (EN + RU, ch. 4): "Published figures disagree, so read every resolution here with that in mind: the CIA's 1995 introduction gives KH-2 and KH-3 “10 feet” and KH-4B “5 feet” [1], and Galiatsatos gives 7.6 m for KH-2 and ranges such as 1.8–7.6 m for KH-4B [3]. This guide uses the USGS list throughout because it gives one figure for every version." Also in the eq-note: "(the low end is used; that choice is what brings the model close to the USGS figures — at 100 lp/mm it would come out twice as sharp)". The notes of refs [1] and [3] now list those figures. A check was added.
2. **MUST — "a Navy ship's helicopter lifted it from the sea" is not in [1] or [6].** The CIA text says "A ship reached the scene before the capsule sank and fished it out of the ocean". The helicopter paragraph there describes the general backup method, not this recovery. **Fixed** (EN + RU): "a Navy recovery ship fished it out of the sea".
3. **MUST — the heading "two firsts in nine days" is wrong.** 11 → 19 August is eight days, and the body says "a week later". (The CIA's "nine days" is how far CORONA beat Sputnik 5's recovery on 20 August.) **Fixed** to "eight days" / «восемь дней», with a check.
4. **MUST — the Zenit camera disagreement is misdescribed.** RU WP says two at first and later three, not "two or four". **Fixed** (EN + RU) to "two at first and later three according to the Russian-language Wikipedia, four on most flights according to the English one"; ref [10]'s note now records «Фтор-2Р».
5. **MUST — "17 × 232 km for KH-4A at 185 km — are from Galiatsatos's table".** The table gives 180 km as KH-4A's lowest altitude; 185 km is back-solved from the coverage. **Fixed** (EN + RU): the 185 km preset is now described as the height that reproduces the coverage, labelled as our inference. The 2.18 in film width now cites [4], which is where it comes from.
6. **SHOULD — use Galiatsatos's 5.265° aperture width for the frame width** instead of 2.18 in (55.4 mm). 150 km × 5.265° = 13.78 km and 185 km × 5.265° = 17.0 km reproduce the table exactly and strengthen the "coverage = H·θ" reading. This would change one constant, two checks and the note. **Left open.**
7. **SHOULD — say 8,506 ft once.** The press release gives **8,506 ft** (in ref [1]'s note). The body, hero and MOD row round it to 8,500. Say "about 8,500 ft (8,506 in the press release)" once in ch. 2. **Left open.**
8. **NICE — Discoverer XIV overshot the prime recovery area.** Ruffner p. 24, footnote: Mitchell had been sent "to the boondocks some 500 miles downrange" and the capsule "overshot the prime recovery area". That is a perfect real example for the range-sensitivity instrument.
9. **NICE — the NASM capsule figures.** 136 kg next to the 84 lb Discoverer XIV capsule may puzzle readers. NASM's dimensions entry covers the object as catalogued (capsule, with cover and parachute per its description). One clause would help.
10. **NICE — "Soviet territory".** "The film had crossed Soviet territory on seven of its seventeen orbits": the CIA says "denied territory".

## 3. Science communication & Education — APPROVE WITH CHANGES

The guide teaches well. One numbered thread runs from the press release (Kepler check) to the zone (range sensitivity) to the camera (H/(f·R)) to the orbit (drag), and each instrument has a single, clear lesson. Assumptions are labelled at the point of use, as the author promised:
- β 200 and β 400 are "*assumed*", "an *assumption* you can vary", "not a published CORONA value";
- the 15,000–5,000 ft window, the pass every 2½ min and the 150 m/s from 200 km aim point sit under "Illustrative assumptions, not documented values";
- H·θ is "our inference, not stated in the source".

The 390 px captions match what the instruments show.

1. **MUST — the KH-1 explanation was stated as fact** ("its early camera corrected image motion for a single preset altitude and used the colour-smeared Tessar [4]"; the status said "… not the film, set its limit"). [4] states the IMC and Tessar facts but does not connect them to the 40 ft figure. KH-2 had the same f/5 Tessar and the model lands at 90 % of its figure, so the Tessar cannot be the explanation. **Fixed** (body + status, EN + RU): "The sources do not say why. Likely contributors are that its early camera corrected image motion for a single preset altitude only and that it flew the first, acetate-based film [4]; the Tessar alone cannot explain it, because KH-2 used the same lens and comes much closer." A check was added.
2. **SHOULD — "about 13 % shorter"** is 13.7 %. **Fixed** to 14 % (EN + RU).

## 4. Design, UX & Accessibility — APPROVE

- **The 390 px gap is closed.** Using a taller-window copy of shot.sh (`review-bucket/shot-tall.sh`, window 30,000 px; the page is 22,139 px, now 22,679 px), the whole page from CH.07 to the end was captured and looked at: the eq-box, timeline, closing quote and all 16 references (long URLs wrap and do not overflow). There is no horizontal overflow.
- Re-shot after the fixes with `_tools/shot.sh … 390 30000` and `… 1300 40000`. (At 1300 px the fixed HUD sits at the window bottom, so the tile trimmer cannot crop the blank tail. That is a tool artefact, not a page defect.)
- All 10 sliders have `<label for>` and `aria-valuetext` that mirror the readouts (checked). The button groups and SVGs have translated `aria-label`s and `role="img"`. Statuses are live. `.btn` and the range inputs are ≥ 44 px with visible focus. There is no animation, so reduced motion is not an issue.
1. **NICE** — the CH.07 scan eq-body wraps mid-phrase at 390 px ("… to sample it · a / 7 µm"). Splitting it into two lines with `<br>` would read better.

## 5. Linguist (Russian) — APPROVE WITH CHANGES

The Russian is natural and technically right: тормозной импульс, баллистический коэффициент, пары линий/мм, компенсаторы торможения (with the English original given), спускаемый аппарат, приборный отсек, «Тессар», «Космос-4», decimal commas and Cyrillic units. EN/RU parity was checked string by string, and no string is missing.
1. **SHOULD (applied) — «сфотографировал большую часть Советского Союза, чем все…»** is ungrammatical (a comparison built on «часть»). Changed to «большую площадь Советского Союза, чем…».
2. **SHOULD (applied) — «увеличивает её в отношение высоты к фокусному расстоянию».** Changed to «в H/f раз — во столько, во сколько высота больше фокусного расстояния».
3. **SHOULD — «НРУ (NRO)» is not an established abbreviation.** Use «Национальное управление военно-космической разведки США (NRO)» on first use, then «NRO». **Left open.**

## 6. Ethicist — APPROVE WITH CHANGES

The treatment is fair and historical: Powers, the Soviet radar and the Zenit programme are described without loaded language. "Nothing about later or current systems is assumed here" is a good guard, and nothing beyond published NRO material on KH-11 appears. The Zenit is given credit for a genuinely different design ("bring the whole camera home"). The only issue was speculation presented as fact (KH-1 cause, §3.1) and the undisclosed source conflict (§2.1). Both are fixed.

---

## Consolidated MUST-FIX (all applied)

1. **Resolution conflict not shown on the page.** Added the CIA 10 ft / 5 ft and Galiatsatos 7.6 m figures, why USGS is used, and that the low-end lp/mm choice is what makes the model match. EN + RU; ref notes [1][3]; check added (§2.1).
2. **KH-1 cause stated as fact.** Hedged in the body and the status; noted that KH-2 had the same Tessar. EN + RU; check added (§3.1).
3. **Discoverer XIII "helicopter" unsupported** → "a Navy recovery ship fished it out of the sea" (§2.2).
4. **"Two firsts in nine days"** → eight days; check added (§2.3).
5. **Zenit "two or four" cameras** → two then three (RU WP) vs four (EN WP); ref [10] note (§2.4).
6. **KH-4A "at 185 km" attributed to the table** → labelled as inferred (the table says 180 km); 2.18 in cited to [4] (§2.5).

**Left open (SHOULD):**
- spherical edge stretch (§1.1);
- extreme-burn tolerance wording (§1.2);
- the 5.265° frame width (§2.6);
- 8,506 ft (§2.7);
- «НРУ» (§5.3).

**NICE:**
- §1.3–1.4
- §2.8–2.10
- §4.1
- arithmetic-only checks
