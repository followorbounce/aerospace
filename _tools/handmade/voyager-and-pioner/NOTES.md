# DEPARTURE — Voyager & Pioneer (`voyager-and-pioner.html`) — Track B upgrade, 2026-10-10

Hand-made page, upgraded **in place** (the HTML is the source of truth; the slug's typo is the live URL and stays).
Tests: `_tools/check-all.sh voyager-and-pioner` → smoke test + `checks.js` (57 checks, ALL OK).

## Purpose & audience
Interested non-specialists: the four probes on solar-escape trajectories, what they found, the messages they carry,
and where they are now. Bilingual EN/RU with full parity.

## What changed
- **Three new computed instruments** (pure functions exposed as `window.__voyager`):
  1. **FIG. 1.2 Escape check** (CH1): pick a probe, slide from its last planetary flyby to 1,000 AU. Speed from energy
     conservation v(r)² = v∞² + 2GM/r using today's Horizons speed and distance; compared with the local escape speed;
     v∞ shown as the speed kept forever. Log-scale chart computed, not drawn.
  2. **FIG. 4.2 Power budget** (CH4): year slider 1977–2036. Model through the published 470 W (launch) and ≈335 W
     (start of 1997), then −4 W/yr; dashed curve = plutonium decay alone (87.7-yr half-life); readouts for the gap
     lost to thermocouple ageing, share of launch power, instruments still on (from 2024) and the shutdown log.
  3. **FIG. 9.1 How far is "now"?** (CH9): date slider Oct 2026 – Dec 2036, Voyager 1/2. Motion under the Sun's
     gravity (velocity-Verlet, ½-day steps) from the Horizons state of 10 Oct 2026 + Earth on its real orbit → distance from Sun/Earth, one-way and round-trip
     light time, and the computed dates each probe first sits one light-day from Earth and from the Sun.
- **Removed** the CH2 "gravity assist" slider: its Δv was an invented linear function of approach angle (±3.2 km/s),
  not physics. CH2 now explains the trailing/leading-side rule in words and links to SLINGSHOT, which does it properly.
- CH1 cards now use Horizons speeds for 10 Oct 2026 (computed from `PROBE_NOW`) instead of "illustrative" values.
- CH9 dashboard: Voyager rows are computed from the same model (so they agree with the checks); Pioneer rows corrected.
- References: 4 (one Wikipedia) → 19 primary sources, numbered by first appearance, with in-text citations.
- Accessibility: 44 px buttons/tabs/stage buttons; slider hit area 44 px tall; focus-visible outlines; `aria-pressed`
  on toggle buttons; `aria-valuetext` on all sliders (incl. the existing zoom slider); `aria-live` on verdicts;
  SVG `aria-label`s switch language; small chart text #55554f on white (≈7:1). No autoplaying motion was added.
- Cross-links: SLINGSHOT (CH2), TILT (Uranus/Neptune tabs), LINK (CH9).
- Chapter eyebrows were inconsistent (CH.01–09 "/ 10", CH.10–11 "/ 11"); all now "/ 11". Lede still "Ten chapters"
  (hand-made convention: REFERENCES not counted; no chapter added).

## Facts corrected (old → new, source)
| Where | Old | New | Source |
|---|---|---|---|
| CH1 | "every probe that has managed [escape] borrowed the rest from the planets"; "no spacecraft launches with that much fuel" | limited to the four in this guide (New Horizons left on launch speed) | SLINGSHOT review; [1] |
| CH1 cards | 12.2 / 11.6 / 17.0 / 15.4 km/s "illustrative" | 11.8 / 11.1 / 16.9 / 15.3 km/s on 10 Oct 2026 | Horizons [1] |
| CH2 | alignment "176 years" | 175 years | JPL Grand Tour poster [2] |
| CH2 cards | Saturn "1980" for Voyager 2 | 26 Aug 1981 (+ all four dates) | NSSDC 1977-076A [3] |
| CH3 | "launched March 2, 1972" | 3 Mar 1972 UTC (2 Mar local); Jupiter 4 Dec 1973 | NASA [4], NSSDC [6] |
| CH3 part | "2× SNAP-19", power "indefinitely" | 4 SNAP-19 on two booms; P10 fell silent in 2003 for lack of power | NSSDC [6], NASA [4] |
| CH4 part | memory "less than a single text message" | ~68 KB in all; 80 µs per instruction | NASA FAQ [7] |
| CH4 part | RTG "roughly half" now | 470 W → ~335 W (1997) → −4 W/yr; under half by 2026 | NSSDC [8], FAQ [7] |
| CH5 | Uranus field "59 degrees" | "nearly 60 degrees" (matches TILT) | TILT guide |
| CH6 | 116 images; "roughly ninety minutes" | 115 images; 90-minute selection; 55 languages, Akkadian → Wu | NASA [14] |
| CH6 | "map of pulsars" | map of 14 pulsars | NASA [4] |
| CH7 | "a single pixel" | "a point of light about one pixel across"; 14 Feb 1990, 6 bn km / 40 AU; 60 frames | NASA [15], Horizons [1] |
| CH7 HUD | 17.3 km/s | 17.9 km/s (Horizons 17.883 on 14 Feb 1990) | [1] |
| CH8 | termination shock "~80–94 AU" | V1 94 AU, 16 Dec 2004; V2 84 AU, Aug 2007 | Stone 2005 [16], NASA SVS [17]; Horizons 94.02 / 83.66 |
| CH8 | heliopause "121 AU in 2012", "solar wind speed falls to zero" | 121.6 AU on 25 Aug 2012; V1's density jump came from plasma waves (its plasma instrument was dead); V2 measured it directly, transition < 1 day | Gurnett 2013 [18], Richardson 2019 [19], Horizons 121.60 |
| CH9 | "~171 AU / 25.6 bn km, ~23.5 h" (mid-2026) | 172.0 AU / 25.7 bn km, 23.9 h from Earth (10 Oct 2026) | Horizons [1] |
| CH9 | V2 "~143 AU, 19.75 h, 15.4 km/s" | 144.2 AU, model light time, 15.3 km/s | [1] |
| CH9 | Pioneer 10 "~80 AU / 12 bn km" | 12.23 bn km from Earth | NASA [4] |
| CH9 | Pioneer 11 last contact "24 Nov 1995", "~44 AU", "Aquila" | 30 Sep 1995 at 44.1 AU from Earth (brief data 24 Nov); Lambda Aquilae | NASA [5] |
| CH9 | status "ACTIVE" | V1 2 instruments, V2 3 (Oct 2026) | JPL [10][11][12], NASA blog [13] |
| CH10 | "roughly 40,000 years" | V1 within 1.7 ly of AC+79 3888 ~AD 40,272; V2 near Ross 248 in ~40,000 yr | NASA FAQ [7] |

## Sources per new number
- Positions/speeds/state vectors (10 Oct 2026 00:00 TDB) and every model check value: JPL Horizons API, centre 500@10
  (heliocentric) and 500@399 (geocentric), ecliptic J2000. Queried 2026-10-10.
- Last-flyby distances (rMin): Horizons (P10 ≈ 5.0 AU Dec 1973, P11 9.4 AU Sep 1979, V1 9.5 AU Nov 1980, V2 30.2 AU Aug 1989).
- GM_sun = 1.32712440018 × 10¹¹ km³/s²; AU = 1.495978707 × 10⁸ km; light time 499.004784 s/AU (IAU values).
- Earth position: Astronomical Almanac low-precision solar coordinates (good to ~0.01°); checked against perihelion /
  aphelion distances.
- Power: 470 W and ~335 W (NSSDC 1977-084A / 1977-076A); 4 W/yr (NASA FAQ; NASA Voyager blog 4 Aug 2026);
  Pu-238 half-life 87.7 yr (NASA NTRS 20080047411).
- Instrument counts: JPL 2024 ("four other instruments"), JPL 2025 ("three on each"), JPL 2026 (V1 LECP off,
  7 of 10 off), NASA blog Aug 2026 (V2 three instruments, +≥1 yr).

## Assumptions / limitations
- Escape model is two-body (Sun only) after the last flyby; accurate to 0.01 km/s against Horizons 1995–2036.
- Position model is two-body (Sun only) from one state; within ~1 min of light time and ~1 day on the light-day dates to 2036.
- Power model joins published points with straight lines; the real 1977–1997 decline was not linear, and post-2026
  values are extrapolations. The two Voyagers are treated as identical (both 470 W at launch per NSSDC).
- Instrument counts are shown only from 2024; earlier switch-offs/failures (e.g. cameras 1990) are in the text, not counted.
- Light-time from Earth ignores the few-minute Earth-rotation/DSN-station offset.

## Not verified / left as is
- The heliosphere stage text "solar wind 300–800 km/s" is standard but uncited.
- CH5 "expected/found" texts (Io's volcanoes first seen beyond Earth, Neptune's winds the fastest measured, Great Red
  Spot as a centuries-old storm) were left uncited; they are well established but no source was added this round.
- JPL news URLs [2][10][11][12] return 403 to curl (bot blocking); their content was read via a browser fetch.
- DOI links [16][18][19] resolve via doi.org; abstracts confirmed via Crossref / Semantic Scholar.
- Voyager 1's planned "Big Bang" power swap date (NASA: "in the coming months" after Aug 2026) — not stated as done.
- Not screenshotted (no Firefox per instructions); layout at 390 px reasoned from CSS only.

## Response to review (REVIEW.md, 2026-10-10)
All 7 MUST-FIX items done; `check-all.sh voyager-and-pioner` ALL OK (57 checks, `unstyled` empty); inline scripts pass `node --check`.
1. **V2 light-day dates.** Fig. 9.1 now propagates under the Sun's gravity (velocity-Verlet, ½-day steps, tabulated daily)
   instead of a straight line. Model vs Horizons (12-h steps): V1 Earth 18 Nov 2026 / Sun 3 Feb 2027; V2 Earth 31 Oct 2035
   (Horizons 1 Nov 07:00) / Sun 26 Nov 2035 (Horizons 27 Nov 02:30). All four are asserted in checks.js (±1 day). The
   vg-note now says "motion under the Sun's gravity alone".
2. Fig. 4.2 aria-label: "about 300 W" / «около 300 Вт» (fuel-only 296.4 W in 2036); asserted.
3. Akkadian: "spoken in Mesopotamia more than four thousand years ago" (EN + RU); no "Sumer" left (asserted).
4. RU genitive: `ruGen` added (Пионера-10 … Вояджера-2), used in whereVerdict and both chart aria-labels; asserted.
5. RU month + year uses nominative months (март, май, июнь, июль); asserted ("март 2027").
6. Plot tops moved to y = 36 in Figs 4.2 and 9.1, axis titles at y = 14 and left of the tick column; asserted (≥ 10 px gap).
7. CH6 cards: the toggle listener is now on the `.exp-card` (site.js dispatches Enter/Space clicks there); asserted.

SHOULD items done:
- Credit to Carl Sagan: the music card ("chosen by a committee chaired by Carl Sagan" [14]); CH7 ("at Carl Sagan's
  suggestion" [15]); the zoom caption's closing line is attributed ("after Carl Sagan, Pale Blue Dot (1994)"); ref notes too.
- "68 kilobytes on each spacecraft" (lede and the computers card); "now losing about 4 W a year" on the RTG card.
- CH9 sentence rewritten: yearly swing of up to ~0.8 AU either way, about seven minutes of light time.
- The 24 Mar 2025 V2 shutdown is cited [11][13] (announced in [11], confirmed as done by [13]).
- RU: «Похищая импульс у планеты»; plaque «Алюминий, анодированный под золото»; «к звезде Росс 248»; non-breaking
  spaces in 40 272 / 40 000; «СКОРОСТЬ ÷ СКОР. УБЕГАНИЯ»; «ОСТАНЕТСЯ НАВСЕГДА, v∞»; fig-2.1 caption reworded;
  «в 2024 году»; escape-slider valuetext uses «а. е.» (no plural agreement problem).
- Component chips keep tabindex/role (and aria-pressed) after every re-render; asserted.
- CH5 tabs are a tablist: role=tab, aria-selected, aria-controls; panels role=tabpanel; asserted.
- Escape-check prose adds why: speed levels off at v∞ while escape speed keeps falling as 1/√r.
- Chart text is 14 px at ≤ 500 px viewport width.

Declined or deferred:
- Plaque designer credit (Sagan, Drake, Salzman Sagan): no source on the page states it; not added without one.
- Visible label for the pre-existing Fig. 7 zoom slider (NICE).
- Pioneer 10 just after Jupiter differs from Horizons by ~0.3 km/s (model ignores Jupiter's pull right after the flyby);
  the page's accuracy claim (1995–2036) already excludes that region.
