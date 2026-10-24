# REVIEW — PASSENGER (Animals in space and the biology flights)

**Date:** 2026-10-23 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There are eight MUST-FIX items, and all have been applied. The physics re-derives cleanly. Every orbit, the heat model, the 1976 atmosphere and both ballistic arcs match an independent RK4 integration to within 0.1 %. The MUST items fall into three groups:
- **Animal deaths left out or blurred.** 28 of the 40 mice on Korabl-Sputnik 2 died in flight, and the guide did not say so.
- **One account of the Sputnik 2 separation quietly preferred.** Two sentences took NASA's side over RussianSpaceWeb's.
- **Wording that went beyond the sources:**
  - the heat model could read as data;
  - "40 °C by the 4th orbit" was presented as what the sources "require";
  - the MA-5 abort cause was misattributed;
  - the closing line contradicted chapter 3;
  - an entry readout broke at the slider extremes.

Scripts and data: `/tmp/claude-1000/-home-none-git/98d54dca-fa8e-4aef-8d4f-2f576b4a6497/scratchpad/review-passenger/`. It contains `phys.py` (orbits, Kleiber, a fresh RK2 1-s heat integration), `bal.py` (the 1976 atmosphere rebuilt from its layer definitions, plus an RK4 ballistic integrator at dt 0.01 s), `bal2.py`, and `data/`, which holds the SP-39 PDF and text, the MR-3 proceedings PDF, and the BBC, Grahn, NSSDCA, RussianSpaceWeb, SP-4001 and Dogs-in-the-News pages as fetched today.
`./check-all.sh passenger-animals-in-space` → **ALL OK**: errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 28/28, timeline 15, and 57 checks PASS (50 by the author plus 7 added in review).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

| Quantity | Reviewer | Page |
|---|---|---|
| Free fall above 60 km on a 110 km arc | 3.395 min | 3.4 ✔ |
| Sputnik 2 period, 212 × 1,660 km | 103.60 min | 103.6 computed; 103.7 quoted ✔ |
| Kleiber, 6 kg | 12.995 W | 13 ✔ |
| Heat model as flown (UA 1.5, 25 W): 40 °C crossing | 5.553 h, orbit 4 (window 5.18–6.91 h) | 5.55 h, orbit 4 ✔ |
| T at 7 h / Teq / τ | 42.06 °C / 52.67 °C / 5.556 h | 42.1 / 53 / 5.6 ✔ |
| At rest (13 W) | crosses at 8.00 h (orbit 5), Teq 44.7 °C | "only delays" ✔ |
| Satellite alone (25 W / 13 W) | max ≈ 19.1 / 14.5 °C, never 40 °C | ✔ |
| Slider extremes (UA 0.5, 40 W) | Teq 188 °C, 40 °C at 2.19 h | chart clips at 60 °C, readout honest ✔ |
| KS-2 period; 26 h 23 min ÷ T | 90.83 min; 17.43 orbits | 90.8; 17.4 ✔ |
| MA-5 period, 99.5 × 147.4 mi | 88.32 min (published 88.43) | 88.3 ✔ |
| Conversions: 7,388 ft/s, 5,857 mph, 136.2 / 363 nmi, 116.5 / 302 mi | 2,251.9 m/s, 2,618.3 m/s, 252.2 / 672.3 km, 187.5 / 486.0 km | ✔ |
| 1976 Standard Atmosphere, 0–80 km every 10 km | rebuilt from the layer lapse rates; all nine values agree to ≤ 0.002 % | ✔ (90/100/120 km match the published table) |
| Scale height 30–40 km | 6.546 km | 6.6 ✔ |
| Shepard (fit): apogee / range / peak / h / weightless | 187.44 km / 492.1 km / 11.17 g at 26.3 km / 5.32 min | 187.4 / 492 / 11.17 at 26.3 / 5.3 ✔ |
| Ham (not fitted) | 241.9 km (−4.1 %) / 665.0 km (−1.1 %) / 14.61 g / 6.50 min | 241.8 / 664.7 / 14.61 / 6.49 ✔ |
| Allen–Eggers ÷ integrated peak (2,000 / Shepard / Ham / 2,900 m/s) | 0.628 / 0.701 / 0.777 / 0.818 | "20–35 % low, narrowing" ✔ |
| β sensitivity, Ham peak at β 150 / 200 / 300 / 400 | 13.21 / 14.09 / 15.06 / 15.59 g | NOTES "≈ ±1 g" ✔ |
| Ham at the ground-relative 7,540 ft/s (2,298 m/s) | 11.57 g, 194 km, 512 km | — (see finding 2) |
| 2,298 m/s ground-relative + Earth rotation at 28.5° N, az 105°, γ 40–50° | 2,572–2,615 m/s inertial | consistent with 5,857 mph = 2,618 ✔ |

- **The checks really test published values.** The Ham apogee, range, peak and weightless time, and Shepard's peak, height of peak and weightless time, are all compared with SP-39 and the MR-3 proceedings. They are not compared with the code itself. The only self-referential checks are the formula identities, and those are labelled as such.
- **Heat model.** It is a one-node model whose parameters are invented and tuned. NOTES says so, and the note under the chart says it too. But the visible chart label, the status line and the HUD all read like measurements (finding 1).

Findings:
1. **MUST — the heat instrument read as data.** The axis said "cabin temperature, °C", the status said "The cabin passes 40 °C 5.6 hours after launch", and the HUD said "CABIN 42 °C at 7 h". On top of that, the note said the parameters were tuned "as the sources require [4][7]". No source gives a time for 40 °C: NSSDCA gives 40 °C with no time, and Grahn gives the 3rd–4th orbit for her death from post-flight simulation. **Fixed:**
   - The axis now reads "modelled cabin temperature, °C (not telemetry)" / «модельная температура в кабине, °C (не телеметрия)».
   - The status now begins "In this model…" / «В этой модели…», and "With these assumed numbers…" replaces "Nothing in a sealed box this size…".
   - The HUD label is now "CABIN (MODEL)".
   - The note now says the parameters were "chosen by us" so that the curve crosses NASA's 40 °C (no time given) in the orbit where the simulations put her death. It adds "No source says when the cabin reached 40 °C, and no curve here is measured data" (RU in parallel).
2. **MUST — the ballistic note presented a possibly fortuitous fit as validation.** Shepard's 7,388 ft/s is an *inertial cutoff* speed [19]. NASA's 5,857 mph for Ham [1] is undefined. The often-quoted MR-2 figure, 7,540 ft/s, is *ground-relative*, and fed that speed the model gives 11.6 g, not 14.6 g. The reviewer's vector sum shows that 7,540 ft/s plus the Earth's rotation is about 2,600 m/s inertial. That means using 5,857 mph as an inertial speed is defensible, but the page must say so. **Fixed:** the note now states the definitions, the inertial reading and its basis, the 11.6 g alternative, and the β range (13.2–15.6 g). Three checks lock these numbers to the page's own model.
3. **MUST — slider-extreme readout bug.** At 1,800 m/s and 30° the apogee is 79.9 km. The 80 km "entry" then fired at apogee, and the readout showed "ENTRY 1,404 m/s, 0°" and Allen–Eggers "0.0 g". **Fixed:** both readouts now show "— (apogee below 80 km)" when the apogee is below 80 km. A check was added.
4. **SHOULD (fixed with 3)** — at 2,900 m/s and 70°, the apogee (418 km) left the 350 km chart and the peak (22 g) was clipped at 20 g. Both axes now extend with the data, and a check was added.
5. **SHOULD (open)** — the status branch "> 13.5 g" always says "That is Ham's flight", even at 2,900 m/s (17.6 g). Suggest "This is Ham's regime — …" for values far above 14.6 g.
6. **NICE** — NSSDCA says life support was planned for "ten days" [4], while Grahn/Malashenkov say 7 days [7]. The page uses 7 without noting the difference.

## 2. Historian / fact-check — APPROVE WITH CHANGES

Opened and confirmed (✔ unless noted). All 28 URLs return 200 today.
- **NASA "Brief History"** — every claim checked against it: Albert I (11 June 1948), Albert II at 83 miles, nine R-1 dogs with three flying twice, Ham at 157 miles, 5,857 mph, 422 miles and 6.6 min, Kosmos 110 on 22 February 1966, Zond 5 at "20G", Bion 1973–96 and Multik ✔. NASA gives 15 August 1951 for Dezik and Tsygan.
- **Dezik and Tsygan date.** Guinness, Wikipedia and most secondary sources give 22 July 1951, and 29 July for Dezik and Lisa. NASA's 15 August is the outlier. The page uses 22 July and names the discrepancy ✔.
- **SP-39 (PDF, text extracted)** ✔:
  - MR-2: 136.2 nmi, 363 nmi, 17.0 g when the escape rocket fired at T+2:18, 14.6 g at T+9:36, "6½-minute" weightlessness, heart rate 94 → 158 → 173, reaction time 0.82 s against 0.80 s.
  - MA-5: 99.5 × 147.4 mi, 88 min 26 s, 7.8 g, landing at 3 h 21 min, 200 miles south of Bermuda, "approximately 1,263 hours", "virtually meaningless".
- **MR-3 proceedings** — "inertial velocity was 7,388 feet per second or 5,036 miles per hour", 11.0 g at about 83,000 ft ✔. **SP-4001 p3a** — 5,180 mph maximum, 116.5 mi, 302 mi, "slightly less than 12 g's", about 5 min ✔. **SP-4001 p2b** — "considerably higher than planned", early LOX depletion, escape rocket; the 24 March entry: the MR-BD test "was scheduled and flown… man-rated" ✔. **SP-4001 p3b** — Enos, 4 November 1962 ✔.
- **NSSDCA Sputnik 2 (archived)** — "Blok A core did not separate as planned… some of the thermal insulation tore loose so the interior temperatures reached 40 C"; 212 × 1,660, 103.7 min, 6 kg, 14 April 1958 after 162 days; "no capability of returning a payload" ✔. The live NSSDCA URL now returns an error page, so citing the archive is right.
- **BBC 2002** — fan above 15 °C, pulse ×3, three times longer than after a centrifuge run, temperature and humidity rising, "after five to seven hours… no lifesigns", "By the fourth orbit it was apparent that Laika had died from overheating and stress" ✔. (The BBC's "4 April 1958" re-entry date is wrong; the page correctly uses NSSDCA's 14 April.)
- **"40 °C by the 4th orbit"** — Malashenkov's IAC-02-IAA.2.2.05 is not online, and today's search found only secondary coverage. Grahn's archived summary is the most authoritative available, and it confirms: "Post-flight simulations showed that Laika probably overheated an[d] died on the third or fourth orbit", plus "life-support system and the food was designed for a 7-day flight". The 40 °C figure itself is NSSDCA's and has no time attached. Hence MUST 1.
- **Separation.**
  - RussianSpaceWeb's main page says: "Sputnik-2 failed to separate from its rocket. Not true. From the outset, Sputnik-2 was designed to remain attached to the 2nd stage".
  - Its design page gives 7.5 t for satellite plus stage (Korolev's note), and a 7.79 t orbiting mass including the core stage.
  - The page presented both accounts, which is good, but then concluded that the cabin flew on a stage "it had not been designed around". That is NASA's account stated as fact (MUST 4).
  - "7.5-tonne core stage" was also slightly wrong: 7.5 t is the combined figure.
- **Belka's vomiting and the one-orbit limit** — RussianSpaceWeb ✔, which cites Siddiqi (its note 51). It is a single source in the reference list, but it traces back to Siddiqi's *Challenge to Apollo*. Acceptable.
- **The same RussianSpaceWeb page:** "Also, 28 out of the 40 mice which were onboard the spacecraft died in orbit." The page omitted this (MUST 5). The 28 July 1960 dogs are named there as Lisichka and Chaika.
- **KS-3, KS-4 (Kometa and Shutka), 3KA-1 and 3KA-2** — RussianSpaceWeb ✔. On KS-3 RSW is more nuanced: the braking engine fired, the modules failed to separate, and APO triggered. "Braking burn came out short" matches RSW's own later analysis ✔.
- **MA-5 cause — MUST 6.** The page said the flight ended because of "mechanical trouble, with a cabin temperature that rose sharply on the second orbit". SP-39 says the temperature rose and then "leveled off… a three-orbit flight could have been accomplished", and that mechanical trouble ended the flight. SP-4001 p3a names "the failure of a roll reaction jet and… the overheating of an inverter".
- **Félicette** — Guinness 2025: Véronique AGI, about 5 min weightless, 13-min flight, euthanised, "no useful information", statue at ISU ✔. NSS: Hammaguir, 157 km, 15 min ✔. The altitude rests on one light-toned source but agrees with other references; acceptable.
- **Zond 5 (NSSDCA archived)** — 1,950 km on 18 September, ballistic entry, Indian Ocean on 21 September, tortoises lost about 10 % and stayed active ✔.
- **Bion-M No. 2** — Interfax: 10 of 75, Orlov, 20 August from Baikonur, Orenburg ✔. No later revision of the death count was found. Bion-M No. 3: Roscosmos (December 2025) says preparations start in 2026, and the RAS president has said 2030; no launch. "Most recent flight as of October 2026" holds ✔.
- **Gazenko quote** — matches the archived Dogs in the News page word for word ✔.

## 3. Science communication & Education — APPROVE WITH CHANGES

This is a strong guide. Each chapter asks one question. The three instruments are well chosen: one shows equilibrium versus time constant, one shows why speed raises the g-load on the way down, and one maps flights to what they proved. The matrix legend says its grades are editorial. The "how do we know" thread runs through the guide.
- **MUST 7 — the closing line contradicted chapter 3.** It read "Gagarin's single orbit and Shepard's fifteen minutes were short because animals had shown exactly that much, and no more, to be survivable." But Korabl-Sputnik 2 had shown that a full day was survivable, and chapter 3 says exactly that. Gagarin's single orbit was a choice made from caution (Yazdovsky's demand, re-entry failures). **Fixed:** "…were short by choice: the animals had shown that much to be survivable, and Belka's sickness and the dogs lost on the way home had shown how much was still unknown." RU in parallel. In the same spirit, "That is why Gagarin's flight was one orbit" now reads "That is a large part of why" / «Во многом поэтому».
- SHOULD (open) — "more than Shepard's 11.0 g on the profile MR-2 was meant to fly". Shepard's profile stands in for MR-2's planned one: planned 115 mi / 290 mi against Shepard's 116.5 / 302, and secondary sources say about 3 g above plan. Consider "close to the profile MR-2 was meant to fly".
- Captions match the instruments at default and preset states. They were re-checked after the fixes.

## 4. Design, UX & Accessibility — APPROVE

- Screenshots retaken at 1300 and 390 after the fixes. The new shot.sh height reaches the end of the page, including references [24]–[28] at 390. No overlap. The new axis label fits at both widths, in EN and in RU length.
- All four sliders have `aria-valuetext` that mirrors the readout (checked). Buttons are 44 px or more, and matrix row buttons are at least 44 px high. Focus-visible outlines are defined. There is no animation, so no reduced-motion handling is needed. The status areas use `aria-live`.
- SHOULD (open) — matrix cells carry `aria-label` on a non-interactive `<td>`. Some screen readers ignore that and read "black circle". Add visually hidden text such as "answered / partly / no".
- SHOULD (open) — dimmed rows (`opacity:0.45`) push secondary text below AA contrast. Acceptable as a de-emphasis state, but 0.6 would keep AA.
- SHOULD (open) — the SVG text is small at 390 px (about 10 px effective, even after the 14 px override), as in other guides.

## 5. Linguist — APPROVE

The Russian is natural technical Russian. Names follow site style («Спутник-2», «Меркурий-Редстоун-2», «Бион-М» № 2). Units, decimal commas and four-digit numbers without a space are all correct, and the RU unit checks pass. EN/RU parity holds for every changed string (missingRu 0).
- SHOULD (open) — «собачий рекорд» is colloquial. «рекорд для собак» is better (body and matrix).
- SHOULD (open) — «Второй корабль-спутник» in body text could take «» for consistency with the other craft names.
- NICE — «приятным он не будет» is firmer than the EN "would not necessarily be comfortable". «не обязательно будет приятным» keeps parity.

## 6. Ethicist — APPROVE WITH CHANGES

The guide does what it promises for most animals. It names them, says how each died, includes Félicette's killing and Enos's shocks, and quotes Gazenko's regret in full. It treats the Soviet and US programmes even-handedly.
- **MUST 5 — the Korabl-Sputnik 2 mice deaths were omitted.** The chapter, the matrix ("survived") and the MOD row all present the flight as a clean success, while the cited source says 28 of 40 mice died in orbit. **Fixed** in five places: the ch. 3 text (EN/RU), the matrix outcome (now "some died", with the detail text), the 1960 timeline entry, the ref [11] note, and the MOD.json KS-2 row. A check was added.
- **MUST 4 — the separation dispute was quietly resolved in NASA's favour.** Two places did this: the sentence "a rocket stage it had not been designed around", and the "satellite alone" status "This is the margin the cabin was meant to have". **Fixed:**
  - EN: "…designed from the outset to stay attached to the core stage, making a 7.79-tonne object in orbit [8][9]. On what matters here the sources agree: the cabin flew joined to a large, sunlit rocket stage, and its thermal control could not keep it cool."
  - The status now reads "That is what a cabin able to shed more heat would do; it says nothing about whether this design would have lasted seven days."
  - RU in parallel.
- **MUST 8 — "there was no way to bring her back [7]".** Grahn does not say this. NSSDCA does ("no capability of returning a payload"). The citation now reads [4][7].
- Applied as SHOULD: the two dogs killed on 28 July 1960 are now named, Lisichka and Chaika (body, timeline, ref note), because every other lost animal is named. "A capsule blown up by design" read as deliberate killing; it is now "a capsule destroyed by its own self-destruct charge" / «уничтоженной её собственным зарядом самоподрыва».
- SHOULD (open) — the BBC says Laika died "from overheating and stress/panic". The page says overheating alone. Consider "overheating and stress".

---

## MUST-FIX summary (all applied 2026-10-23)
1. Heat instrument labelled as a model in the axis, status and HUD; the note no longer says the sources "require" 40 °C in orbit 4.
2. Ballistic note discloses the mixed speed definitions, the 11.6 g ground-relative alternative and the β range (3 checks).
3. Entry and Allen–Eggers readouts show "—" when the apogee is below 80 km; the chart axes extend at the extremes (2 checks).
4. Separation: neutral wording; the 7.79 t figure corrected; the "satellite alone" status no longer implies a design intent.
5. Korabl-Sputnik 2: 28 of 40 mice died, stated in the body, matrix, timeline, reference note and MOD.json (1 check).
6. MA-5 abort cause: failed roll jet and overheating inverter [18]; the cabin temperature "levelled off" [16] (body and matrix, EN/RU, ref [18] note).
7. Closing line no longer contradicts chapter 3; "That is why" softened.
8. "No way to bring her back" now cites [4][7].

## SHOULD items left open
1.5 "That is Ham's flight" at any speed above 13.5 g · 1.6 the 7 vs 10 days life-support difference · 3 MR-2's planned profile vs Shepard's · 4 matrix cell text for screen readers, dimmed-row contrast, small SVG text at 390 · 5 «собачий рекорд», «» around «Второй корабль-спутник», «приятным он не будет» · 6 "overheating and stress".
