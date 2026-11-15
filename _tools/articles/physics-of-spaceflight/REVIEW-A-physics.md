APPROVE WITH CHANGES — the mathematics is right everywhere I could test it (all 15 Δv-map rows, the Lagrange staging solution, Hohmann + plane change, Oberth, vis-viva and every number in the text reproduce independently), but two things on the page mislead: the staging instrument silently drops the kerosene first stage on its own default preset while still labelling the result "3 stages" / "4 stages", and the stated accuracy of the Δv map ("several per cent") is wrong for the Mercury rows.

Reviewer A (physics and mathematics proof), `physics-of-spaceflight` (IMPULSE, rebuild), 2026-11-15.
Counts: **2 MUST · 7 SHOULD · 6 NIT.**

Method. I did not call the page's functions for the reference values. My own calculation is in Python
(`/private/tmp/claude-501/-Users-noone/15467dca-f7da-43db-80d4-657b045af751/scratchpad/w9-impulse-revA/a.py` for every
text number, the map, Hohmann, bi-elliptic, Oberth and the propulsion table; `s.py` is an independent optimiser for the
staging problem: 4,000 random splits plus a pattern search per case). The page's output was then read two ways and
compared: its pure functions (`run.js`) and the real page driven in jsdom at preset values and at both ends of every
slider (`probe.js`, `probe2.js`, run through `_tools/test.js`). `./check-all.sh physics-of-spaceflight` = 111 passed,
0 failed, ALL OK, no drift (page md5 unchanged before and after).

---

## MUST

### M1. Staging optimiser: the default preset with 3 or 4 stages has a first stage of zero size, shown as "3 stages" / "4 stages" with no explanation

Evidence (real page, default "KEROSENE, THEN HYDROGEN", Δv 9.3 km/s, ε 8 %):

| Stages pressed | Δv given to each stage | Mass ratio of each stage | Payload |
|---|---|---|---|
| 2 | 2.51 · 6.79 | 2.33 · 5.18 | 4.67 % |
| 3 | **0.00** · 4.65 · 4.65 | **1.00** · 3.08 · 3.08 | 7.05 % |
| 4 | **0.00** · 3.10 · 3.10 · 3.10 | **1.00** · 2.12 · 2.12 · 2.12 | 7.73 % |

The mathematics is correct: `stageOpt()` (script.js lines 36–51) clamps `R_i` to 1 when the Lagrange condition gives
less, which is the right Kuhn–Tucker corner, and my independent search confirms nothing beats it (the objective
Σ ln π_i is concave in the stage Δv's, so the corner is the global optimum). With one ε for all stages and vacuum
I_sp from the ground, a 303 s stage is simply worse than a 421 s stage, so the optimiser deletes it. What is wrong is
what the reader is shown:

- The top chart labels these bars "3 stages 7.05 %" and "4 stages 7.73 %". They are a 2-stage and a 3-stage
  all-hydrogen rocket. (7.05 % is not a kerosene + hydrogen + hydrogen rocket.)
- The mass bar draws a zero-width stage 1; the status line still says "a stage with a faster exhaust is given more of
  the work", never that a slower stage can be given none.
- The corner is not rare. With the default 303 / 421 s and ε = 8 % the kerosene stage is unused for Δv 1.0–5.9 km/s
  at 2 stages, 1.0–11.8 km/s at 3 stages and over the **whole slider** (1.0–16.0) at 4 stages. Over a grid of 540
  slider combinations (Δv 1/3/9.3/12.5/16; I_sp 200/303/470 each; ε 3/8/20 %; 1–4 stages) 189 of the 442 reachable
  cases contain an unused stage.
- The page text never mentions it. The eq-note says only "The best split makes 1 − εR_i proportional to 1/v_e,i";
  the "unused stage" rule exists only as a code comment (script.js line 35). The model note says the bars are "a
  comparison between designs", but the designs compared are not the ones labelled.

What is right: either say so wherever it happens (readout "stage 1 not used: with these numbers the rocket is better
without it", chart label "3 stages (1 unused)", one sentence in the eq-note: "if that would give a stage a mass ratio
below 1, the stage is left out", and one in the model note explaining why a real first stage is nevertheless kerosene:
thrust, density, tank mass, none of which the model sees), or change the model so the default does not collapse
(e.g. separate ε for the first stage and upper stages, hydrogen stages heavier). A check should cover this branch:
none of the 111 checks exercises a clamped stage.

### M2. Δv map: "each planetary row is a mean and real launch opportunities are several per cent cheaper or dearer" is not true for the Mercury rows

Text (body.html, Chapter 6 note): "planets on circular orbits in one plane, so each planetary row is a mean and real
launch opportunities are several per cent cheaper or dearer". Mercury's eccentricity is 0.2056 and its inclination
7.0°; the circular-coplanar model is much rougher there. My recomputation with the same method (tangent transfer from
a circular Earth orbit, 200 km departure, 300 km capture) but arriving at Mercury's perihelion or aphelion:

| | page (circular, a = 57.909 × 10⁶ km) | arrive at perihelion | arrive at aphelion |
|---|---|---|---|
| Departure from LEO ("To Mercury (flyby)") | 5.55 | 6.66 (+20 %) | 4.76 (−14 %) |
| Capture into 300 km orbit | 7.58 | 5.63 (−26 %) | 9.87 (+30 %) |
| "Low Mercury orbit" total | 13.13 | 12.29 (−6 %) | 14.63 (+11 %) |

(The plane change for 7° is on top of this and not included.) For comparison the same test on Mars gives 3.46–3.77
for the flyby row (±4 %) and 5.57–5.88 for the orbit row (±3 %), so "several per cent" is fair for Mars, Venus and
Jupiter, and wrong by a factor of three to five for Mercury. A sign that the author met this: the reference note [1]
lists Mercury's published orbital speed 47.4 km/s among the values "used as checks", but checks.js (line 57) checks
only Venus, Earth, Mars and Jupiter; the model's circular speed at Mercury is 47.87 km/s, 1 % off the published mean,
and would fail the 0.06 km/s tolerance used for the others.

What is right: state the Mercury spread explicitly in the note and in the Mercury status line (for example "for
Mercury, whose orbit is far from circular, the flyby row ranges from about 4.8 to 6.7 km/s and the orbit row from
about 12.3 to 14.6"), keep the qualitative conclusion (it survives: 12.3 > 8.75), add a check for the two extremes,
and correct the reference note about 47.4.

---

## SHOULD

### S1. The text says no single stage can reach orbit with a useful load; the instrument beside it says 4.64 %
Text (Chapter 2): "With hydrogen and oxygen at 4.44 km/s that needs a rocket 8.1 times heavier full than empty … No
single tank-and-engine stage can be that light when empty and still carry a useful load". Instrument, HYDROGEN
THROUGHOUT + 1 STAGE, Δv 9.3, ε 8 %: "PAYLOAD SHARE OF LIFT-OFF MASS 4.64 % … One stage must carry its empty tanks all
the way. At this Δv, 4.64 % of the lift-off mass is payload." My figure: (1/8.15 − 0.08)/0.92 = 4.64 %, the same as
the default two-stage kerosene + hydrogen rocket (4.67 %). The instrument is computing correctly; the cause is vacuum
I_sp from the ground and ε = 8 % for a hydrogen stage that must also lift off. The model note covers this in general
terms, but the reader meets a direct contradiction on a preset button. Either soften the sentence ("no stage built so
far…") and say in the note that the hydrogen single-stage result is the model's optimism, or give the hydrogen preset
a larger ε.

### S2. Oberth chart: y-axis tick labels are rounded to whole numbers at positions that are not whole numbers
script.js line 371: ticks sit at yMax·g/4 and are printed with `fmt(v, yMax < 8 ? 1 : 0)`. Read from the real page:
Earth, v∞ 15, Δv 5 → labels "0 6 12 17 23" (ticks at 5.75, 11.5, 17.25); Jupiter, v∞ 15, Δv 5 → "0 8 17 25 33";
Sun, v∞ 0, Δv 0.05 → "0 2 5 7 9" (ticks at 2.25, 4.5, 6.75); small cases "0.0 0.8 1.5 2.3 3.0". Evenly spaced ticks
carry unevenly spaced numbers and a value read off the axis can be wrong by up to 0.5 km/s (11 % at the "2" tick).
Round yMax up to a multiple of 4, or print one decimal.

### S3. Map table and legend call the geostationary circularisation burn "braking"
The table column "Braking" (and the chart legend "hatched: braking") contains 1.48 km/s for "Geostationary orbit,
equatorial start" and 1.84 km/s for the 28.5° row. That burn speeds the craft up from 1.60 to 3.07 km/s (the Hohmann
readout on the same page shows exactly that). Rename the column and legend ("Arrival burn" / "second burn"), or
footnote the two GEO rows.

### S4. Oberth note: "no spacecraft has made such a burn there" (Jupiter)
The note under instrument 4 says "The Jupiter and Sun presets show the size of the effect; no spacecraft has made
such a burn there." Juno's orbit-insertion burn on 4 July 2016 was a 35-minute, 542 m/s main-engine burn at closest
approach to Jupiter (https://www.jpl.nasa.gov/news/juno-enters-orbit-around-jupiter/ : "35-minute main-engine burn",
"mean change in velocity of 1,212 mph (542 meters a second)"), i.e. the same effect used in reverse to be captured.
The sentence is true only if "such a burn" means a 1 km/s speed-up. Reword: no departure burn of this kind has been
made at Jupiter or the Sun; capture burns at closest approach (Juno 2016, 0.54 km/s) use the same arithmetic. The
instrument would give a nice flown check there (I did not find the perijove altitude on that page; the author should
source it before using it).

### S5. Solar-escape status line: "Every craft that has actually left took part of its speed from Jupiter instead"
The row is "Escape from the Sun, direct" = 8.75 km/s from a 200 km orbit, which is v∞ = 12.34 km/s, C3 = 152.2 km²/s²
(my figure). New Horizons' launch was designed for C3 between 157.7 and 163.9 km²/s² and put it on a solar-escape
path before Jupiter; Jupiter then added speed. "Instead" tells the reader the direct burn has never been flown. I
could not open a primary page for the C3 figures (they come from search summaries of pluto.jhuapl.edu
`Mission/Spacecraft/docs/FountainMission.pdf` and Guo & Farquhar, Acta Astronautica 56, 2005; both fetches failed), so
this is tagged SHOULD and reviewer B should confirm; if confirmed it is a false statement and should be treated as a
MUST. Suggested wording: "Four of the five craft now leaving needed Jupiter to get there; New Horizons was launched
at about this energy and still used Jupiter to shorten the trip."

### S6. Mars v∞ is 2.945 km/s with the page's constants; the text says 2.94 three times and the check is loosened to let it pass
√(GM☉/a) Hohmann with the page's own constants gives 2.9452 km/s (the Hohmann instrument shows "2.945"), which is
2.95 to two places. Text: Chapter 4 "speed changes of 2.94 and 2.65 km/s"; Chapter 5 "2.94 km/s faster than the
Earth" and "3.22 km/s, and then add 2.94 km/s out in open space: 6.17 km/s" (3.22 + 2.94 = 6.16; with 2.95 the sum
reads correctly). checks.js line 88 uses `near(hm.vinfE, 2.94, 0.006)`, a tolerance wider than the half-unit of the
last digit, which is why it passes; line 79 does the same for 2.45. TRANSFER also prints 2.94, so the simplest
consistent fix is to print 2.95 here (and tighten both tolerances to 0.005), or to print three decimals.

### S7. NEXT row shows 69 % where the cited table says "over 70 %"
Table: "Ion thruster (NEXT) | 4,100 s | 236 mN | 69 %", computed as ½ × 0.236 × 4,100 × 9.80665 / 6,900 = 0.688.
The reference note for [14] on the same page says "efficiency over 70 %". The difference is only the rounded-down
I_sp ("over 4,100 s"): 4,190 s gives 70.3 %. The check (line 141) accepts 0.70 ± 0.02 and so hides the mismatch. Say
in the note that the 69 % uses the round 4,100 s, or use the exact full-power I_sp from the source.

---

## NIT

- **N1. Moon escape speed.** Chapter 3 eq-note gives the computed value as "Moon 2.38"; with GM 4,900 and R 1,737.4
  it is 2.37500 (2.3749973), which prints as 2.37. Write 2.375 or "2.37–2.38".
- **N2. Inward transfers with a plane change.** `hohmann()` correctly puts the turn in the burn at the larger orbit,
  which for r₂ < r₁ is burn 1. The status line still says "The plane is turned in the same burn that circularises"
  (seen at 120,004 km → 16,866 km, 28.5°), and the eq-box writes the combined formula as Δv₂ only.
- **N3. Large turns.** The Δi slider runs to 90°. At equal radii and 90° the page reports 11.05 km/s (150 km orbit)
  as the turn "where the craft is slowest"; going out to a very high apoapsis, turning there and returning costs at
  most 2(√2 − 1)v = 6.47 km/s, and that detour wins for any turn above 48.9° on a circular orbit (lower with a finite
  apoapsis). One clause in the model note would cover it.
- **N4. "Most Δv these stages could reach with no payload"** is Σ v_e ln(1/ε), a limit approached only as each stage
  becomes negligible beside the one below it; for a single stage it is exact. Harmless, but "upper limit" is the
  accurate label.
- **N5. Orbit-calculator note** gives the reason for the range limit for Earth and Moon only; Mars (500,000 km) and
  the Sun (0.03–40 AU) are capped without comment. "Pulls harder" is loose (the Sun pulls harder on the Moon than the
  Earth does); "disturbs the orbit more" is what the sphere-of-influence argument says.
- **N6. Oberth preset vs text.** Chapter 5 says 3.61 km/s from low orbit gives 2.94 (2.95) km/s, then that 0.39 km/s
  added at escape speed gives 2.96. Both are right (3.611 − 3.224 = 0.387, and the slider step is 0.01), but the two
  numbers for what the reader takes as the same manoeuvre differ; "about 0.39" or a remark would help.

---

## Checked and found correct

Constants and units: g₀, lbf, lb, ft, n mi, statute mile, sidereal day; GM, radii and semi-major axes as listed in
NOTES; all conversions in the text (469 kg/s, 2,091 kN, 12.46 / 6.77 / 2.28 MN, 192 km/s, 6.8 million km, 15 % of c).

Text numbers recomputed (mine → page): RS-25 4.453 / 4.436 km/s → 4.45 / 4.44; mass ratios 8.14, 22.87 → 8.1, 22.9;
Dawn 27.51 km/s, 2,806 s → 27.5, "near 2,800"; 400 km 7.669 km/s, 92.56 min, 4.765 mi/s → 7.67, 92.6, 4.77; surface
7.905 / 11.180 → 7.91 / 11.18; GEO from 23.9345 h: 35,786.05 km; Apollo 11 TLI 10.834 km/s = 99.42 % of 10.898;
Parker 139.6 / 192.2 / 197.4 → 140 / 192 / 197; escape speeds 4.249, 10.361, 5.022, 59.53, 617.67; Molniya 12.01 h; Moon's distance 1.0183 km/s.
Chapter 4: 2.4546 + 1.4773 = 3.9319 km/s, 5.259 h; 28.5°: 3.832 alone at 200 km (0.492 of orbital speed), 1.514 alone
at GEO, +0.359 combined, total 4.291; Mars 258.9 d, 2.649; Neptune 30.78 yr; Jupiter 8.793. Chapter 5: 3.224, 3.611,
6.170, saving 2.558; preset 0.39 → 2.956; Jupiter preset 12.40; Sun preset 19.79. Chapter 6 cross-checks: Apollo 11
v∞ 1.077, ideal capture 0.914 vs flown 0.938; LOI-1 ideal 0.872 vs 0.889; ascent 1.704 (energy only) or 1.7043 (two
burns) vs flown 1.850, +8.6 %; third cosmic velocity 16.649. Chapter 7: NSTAR 1.398 kW = 60.8 %; SPT 84.4 mN, 1,632 s;
Starshot 14.9 % of c; Dawn 0–60 mph in 4.15 days.

Δv map, every row, my recomputation (km/s) against the page table: GTO 2.4546 / 2.45; GEO 3.9319 / 3.93; GEO 28.5°
4.2911 / 4.29; Earth escape 3.2243 / 3.22; Moon flyby 3.1313 / 3.13; lunar orbit 3.9529 / 3.95; lunar surface
5.6786 / 5.68 (legs 3.131, 0.822, 1.726); Venus 3.5036 / 3.50; Venus orbit 6.8217 / 6.82; Mars 3.6115 / 3.61; Mars
orbit 5.7023 / 5.70; Mercury 5.5549 / 5.55; Mercury orbit 13.1339 / 13.13; Jupiter 6.3051 / 6.31; solar escape
8.7504 / 8.75. Agreement with `dvMap()` to 1e-9. The "from the ground" column is each row + 9.3 exactly. The basis
stated in the text is the basis the code uses.

Staging: derivation of π = (1/R − ε)/(1 − ε) and of the Lagrange condition 1 − εR_i = 1/(λ v_e,i) redone by hand;
540 slider combinations, page vs independent search, page never beaten (largest relative difference 5 × 10⁻⁸); refusal
exactly when Δv ≥ Σ v_e ln(1/ε); mass bookkeeping sums to 1; infinite-stage formula exp(−Δv / (v_e(1 − ε))) matches
a 20,000-stage product to 3 × 10⁻⁵; bisection bounds and 200 iterations are adequate over the slider ranges.

Hohmann: eq-box matches code for outward transfers; vector form of the combined burn equals the cosine-rule form;
reversibility; equal radii give 0, and 2v sin(Δi/2) with a turn; slider ends around Earth (150 km–443,622 km) and the
Sun (0.3–40 AU) give finite, correct values in both directions. "Whole turn at the larger orbit" is labelled; the
optimal split for LEO→GEO 28.5° is 2.17° at the first burn and saves 0.024 km/s, so "slightly" is fair. Bi-elliptic:
bi-parabolic crossover 11.9388; Hohmann cost peaks at 15.5817 and that is also where a bi-elliptic with the far point
just beyond the target becomes cheaper (dearer at 15.57, cheaper at 15.59); at 11.94–11.95 only very distant far
points win.

Oberth: eq-box matches code; energy identity; gain → 0 far out; all three bodies at 1.02 and 100 radii, v∞ 0 and 15,
Δv 0.05 and 5: readouts equal my values; curve, dot and dashed line are placed consistently.

Orbit calculator: eq-box matches code; both slider ends for Earth, Moon, Mars and Sun; all ten presets; drawing
geometry (focus, ellipse centre, apsides) is right.

Equation boxes of Chapters 1 and 7 match the code (`vex`, `jetPower`, `thrustFromPower`). Every instrument carries a
model note with limits (subject to M1, M2, N3, N5). The checks in checks.js test real quantities against published
values and would fail on a wrong model, with the gaps named above (no clamped-stage case; tolerances 0.006 at lines 79
and 88; NEXT ± 0.02; Mercury's orbital speed left out).

## Not checked

- Whether the cited sources say what the page says (reviewer B): none of the 29 references was opened by me except the
  JPL Juno release used in S4. The New Horizons C3 range in S5 rests on search summaries; two fetches failed.
- Juno's perijove altitude at orbit insertion (not on the page I opened).
- The published thresholds 11.94 / 15.58 in Vallado and the Humble et al. ascent table: recomputed or summed only,
  books not opened.
- Rendering in a real browser: the instruments were driven in jsdom, so pixel layout, the hatch pattern and text
  overlap in the SVGs were not seen. Russian text, accessibility, history and credit are reviewer C's.
- The Russian edition page `ru/physics-of-spaceflight.html` and the neighbour guides' own numbers, beyond noting that
  TRANSFER prints 2.94 km/s and THRUST 9.4 km/s (the latter already raised in NOTES).
