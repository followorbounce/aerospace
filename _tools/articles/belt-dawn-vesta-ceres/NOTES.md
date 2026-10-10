# BELT — Dawn at Vesta & Ceres: author notes

**Owner:** Wave 5 author team (2026-10-09). **Category:** `sun` (The Sun & Small Bodies). **Status:** built and checked (`check-all.sh` ALL OK, 44 checks after review). No screenshots yet: the parent runs `shot.sh` at 1300 and 390.

## Purpose and audience
Explain how Dawn became the first spacecraft to orbit two worlds beyond Earth, and why it needed ion propulsion to do it. The audience is the site's usual curious adult or student: no calculus needed, but every number is real.
Ion propulsion is covered only as far as Dawn needed it. The general survey is left for the planned ION guide (Wave 8).

## Structure (10 chapters; the lede says "Ten chapters", counting REFERENCES like Waves 2–4)
1. Why Vesta and Ceres
2. The spacecraft and the cruise
3. **Instrument 1: xenon ledger.** Rocket equation with the milestone buttons.
4. **Instrument 2: gentlest push.** Thrust and mass give acceleration, the sheet-of-paper comparison, and Δv per day and per year.
5. Vesta
6. **Instrument 3: spirals.** Kepler periods vs NASA's published periods, Edelbaum spiral Δv, and the real transfer durations. Animated dot; static when reduced motion is on.
7. Ceres and the end of the mission
8. **Instrument 4: two worlds.** Scale, interior and landmarks, with an optional Moon for scale.
9. LEGACY timeline
10. REFERENCES (20)

## Key numbers and sources
| Number | Source |
|---|---|
| 1,217.7 kg launch; 747.1 dry; 425 Xe; 45.6 N₂H₄ (they sum exactly) | NSSDC [2] |
| 92 mN at 2.6 kW, I_sp 3,200–1,900 s; 10.3 kW at 1 AU / 1.3 kW at 3 AU | NSSDC [2] |
| 91 mN, 3,100 s nominal | Beyond Earth [1] (NSSDC's 92 mN is used as the slider maximum) |
| 6.7 km/s / 250 kg Xe at Vesta capture | Garner et al. 2011 [3] |
| > 11.0 km/s / 401 kg by June 2016 | Garner & Rayman 2016 [4] |
| 5.87 years of firing, 41,360 km/h = 11.49 km/s | JPL 2018 [5] |
| Sheet of paper; > 5 days to 60 mph; < 2.7 mg/s | Rayman 2013 [6] |
| All orbit altitudes, periods and transfer dates | Beyond Earth [1] |
| GM and diameters for Vesta and Ceres | JPL SBDB [9] (Vesta: Park et al. 2025; Ceres: Park et al. 2016) |
| Rheasilvia 500 km × 19 km, Veneneia 400 km, 1–2 Gyr | Schenk et al. 2012 [11] |
| Occator 92 km, ~20 Myr; brine ~40 km deep; deposits < 2 Myr; < 35 km final altitude | JPL 2020 [15] |
| ≥ 20 yr orbit, > 99 % for ≥ 50 yr; 6.9 billion km | JPL 2018 [16] |

## Computed values, all checked in checks.js
- **Chemical alternative:** 30,045 kg of propellant at 320 s for 11.49 km/s, which is 24.7× Dawn's launch mass.
- **Ideal ion case:** 364 kg at a constant 3,100 s.
- **Implied I_sp at the milestones:** 2,973 / 2,808 / 2,729 s, all inside NSSDC's range of 1,900–3,200 s.
- **Push:** 92 mN equals the weight of 9.38 g, about 1.9 A4 sheets. 0 → 100 km/h takes 4.26 days at launch mass. The mission-average acceleration was 62 µm/s².
- **Kepler periods vs the published ones:** within −1.4 % to +2.1 % for the 5 orbits that have a published period.
- **Spirals:** 91 m/s for Ceres HAMO → LAMO, 56 m/s for Vesta. The real 45-day Ceres transfer took 3.2× the full-thrust time at launch mass.
- **Densities:** within 0.5 % of SBDB (3,463 vs 3,460; 2,162 vs 2,162). Jump heights are 19.4 m on Vesta and 17.3 m on Ceres. Escape speeds are 364 and 516 m/s.

## Assumptions and known limitations
- Both bodies are treated as point masses or equal-volume spheres. Vesta is strongly non-spherical, which is why its HAMO period comes out 1.4 % short.
- The Edelbaum spiral ignores solar gravity and coast periods. The "full thrust at launch mass" figure is a deliberately generous upper bound on the push.
- Milestone I_sp is an upper bound: the hydrazine burned along the way is ignored. The whole-mission point uses the 425 kg *load*, because the xenon actually consumed by 2018 was not published in a source I found.
- The 320 s chemical I_sp is labelled as a typical value, not a Dawn figure.
- The spiral drawing is schematic (4 turns), and the page says so. The real spirals had many more revolutions.
- Vesta's survey orbit and Ceres's RC3 have no published period in [1]. Only computed values are shown for them (JPL quotes ~69 h and ~15 days elsewhere; not used).
- Some transfer dates were left out because [1] is ambiguous about them: Vesta capture → survey, and survey → HAMO.

## Unverified / judgment calls
- **Two sources differ on Ceres LAMO arrival.** [1] says the engine was off on 7 Dec 2015, with trim burns on 11–13 Dec. [4] gives arrival on 13 Dec. The page uses 7 Dec for the transfer length (45 days) and "December" in the timeline.
- **Two sources differ on what the Mars flyby gave.** [3] says it provided "1 km/s of heliocentric energy increase"; [4] says "an additional ΔV of 2.6 km/s". The page states neither number, only that it was the one speed change the engines did not make [3].
- **The paper comparison.** Rayman's "single sheet" holds only at reduced thrust. At 92 mN the computed weight is about 1.9 A4 sheets, and the page shows the computed value.
- **Shared-CSS touch targets.** The shared CSS does not meet 44 px targets on touch screens. This page's `extra.css` adds a `pointer:coarse` override. Not tested on a real device.
- **Wording borrowed from NASA.** "First truly interplanetary spaceship" is NASA's own phrase [18].

## Wiring suggestions (for the parent)
- **index label:** EN "Dawn at Vesta & Ceres" / RU "Dawn у Весты и Цереры"; codename BELT; category `sun`.
- **llms.txt:** `Dawn's ion engines and the first spacecraft to orbit two worlds beyond Earth: rocket-equation ledger (11.49 km/s from 425 kg of xenon vs ~30 t chemical), thrust-and-mass push calculator, Kepler periods and Edelbaum spirals for every Vesta/Ceres mapping orbit checked against NASA, Vesta vs Ceres scale/interior/landmarks (Rheasilvia, Occator brines).`

## Response to review (2026-10-09)
The panel's verdict was APPROVE-WITH-CHANGES. All 4 MUST-FIX items are done. After the fixes, `check-all.sh belt-dawn-vesta-ceres` is ALL OK with 44 checks, up from 37.

**MUST-FIX**
1. **Xenon ledger consistency.** The ledger now models a fixed *initial* mass: m_prop = m₀(1 − e^(−Δv/I_sp g₀)), with m₀ = 1,217.7 kg.
   - Each milestone lies on the curve for its implied I_sp. The readout now shows 250 / 401 / 425 kg (it showed 205 and 389 before).
   - The 792.7 kg chemical case ("30,045 kg = 24.7× launch mass") is now a separate readout row.
   - A dotted line marks the whole 1,217.7 kg, which the chemical curve can only approach.
   - New checks: clicking each milestone must give a readout equal to its xenon within 1 %. The round trip is checked for all three milestones. The fixed-m₀ and fixed-m_f forms of the equation must agree. The chemical curve must stay below m₀.
2. **Ceres orbit date is now 6 March 2015.** Changed in the hero kicker, Ch.7 (text and fallback) and the timeline, in EN and RU.
   - Source: the JPL release of 6 March 2015 (new ref [19], URL verified). It gives capture at about 4:39 a.m. PST on Friday, which is 12:39 UTC on 6 March.
   - Beyond Earth gives "00:39 UT on 7 March". The ref [1] note now records this conflict, so the next editor doesn't change it back.
3. **"Two bodies other than the Sun" is now "two destinations beyond Earth".** The new wording is cited to [19], whose phrasing is "first mission to orbit two extraterrestrial targets".
   - The ref [1] note no longer makes the claim.
   - The Ch.9 quote now reads: "Every earlier deep-space probe had either flown past its targets or orbited just one of them" (RU to match).
   - Citing [19] instead of [16]: I didn't confirm the exact phrase "two destinations beyond Earth" in [16].
4. **Rayman's figures are now in context.** Ch.4 and the ref [6] note say the 5 days to 60 mph was at the reduced thrust of 2013, and that 2.7 mg/s is an average over the first 3.6 years of thrusting. RU also uses «Директор миссии Марк Рэйман».

**SHOULD / NICE items done**
- The whole-mission I_sp is shown with "≈"; the dated milestones keep "≤". The equation note now explains which is a bound and which is only an estimate.
- "No spacecraft had ever done more" (RU «до него»).
- Ch.1 now says "1.8 times" in both languages.
- The density wording now says "Ceres has less than two-thirds of Vesta's density", and the check tests < 2/3, which is what the text claims.
- "Hang in the air for about 22–25 seconds": the time in the air is computed (24.8 / 22.1 s), checked, and added to the readout.
- Ch.2 now says only one engine fired at a time. This is verified in Rayman's 2008 Dawn Journal, added as new ref [20].
- RU fixes:
  - the lede's two calques;
  - «самый мягкий толчок» (in the lede and the Ch.4 eyebrow);
  - «УСКОРЕНИЕ СВОБ. ПАДЕНИЯ»;
  - «ЗЕМНОЙ ПРЫЖОК 0,5 м»;
  - the 2038/2068 hedges.
- The Ceres core fill is now #5a5a55, for white-label contrast. The shell label reads "range of estimates". Core labels are hidden when the drawn body is under 40 px across, which applies when the Moon is shown.
- `extra.css` changes: `.sim-svg{touch-action:auto}`, since no chart on this page takes pointer input, and `.svg-small` fill #5f5f59 for AA contrast.
- Accessible names are now bilingual: groups and SVGs carry `data-aria-en/ru`, applied in `renderAll`. A check confirms the RU names.
- Screenshot pass:
  - The on-chart curve labels in CH3 are replaced by an HTML legend under the chart.
  - The "92 mN, launch mass" label in CH4 also moved into a legend.
  - The CH3 "425 kg" label now sits below its line, at the right.

**Declined**
- **Mars flyby date of 18 Feb UTC (NICE).** I did not independently verify the 00:28 UTC closest-approach time, so the page keeps [1]'s 17 February.
- **Debouncing the aria-live status (NICE).** Every generated guide behaves the same way, so this is better fixed site-wide than on one page.
