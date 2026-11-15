APPROVE WITH CHANGES — the physics, the equations and all four instruments are right (every model reproduced independently to 1e-8 or better); one MUST: Instrument 4 prints linear-model extrapolations far outside the model's range as results (up to "1.4 × 10²⁹ km/s").

# Review A — physics and mathematics proof: `lagrange-points` (EQUILIBRIUM)

Reviewer A, 2026-11-15. I did not write the guide.

**Method.** My own calculation in pure Python, not calling the page's functions: 50-digit bisection of the Newtonian
force balance on the axis; the quintic re-derived by hand and its residual evaluated at my roots; an analytic Hessian of Ω
and the general planar characteristic polynomial λ⁴ + (4 − Ωxx − Ωyy)λ² + ΩxxΩyy − Ωxy² = 0 for the eigenvalues at all
five points; my own RK4 of the **full nonlinear** equations to confirm growth rates and the L4 path; my own evaluation of 2Ω
on the page's 129 × 101 grid. Then the built page (`lagrange-points.html`) driven in jsdom at every preset and at both ends
of every slider, and its numbers compared with mine. `./check-all.sh lagrange-points` = ALL OK (82 PASS, no drift).
Scratch files: `/private/tmp/claude-501/-Users-noone/15467dca-f7da-43db-80d4-657b045af751/scratchpad/w9-equilibrium-revA/`
(`indep.py`, `more.py`, `koon.py`, `drive.js`).

Counts: **1 MUST · 6 SHOULD · 7 NIT**.

## Findings

### MUST

**M1. Instrument 4 reports numbers the linear model cannot give, including speeds 10²⁴ times the speed of light.**
`script.js` 380–393: `g = Math.exp(days/tau)` is printed without any limit, although the chart beside it stops at 10⁶.
Output of the built page:
- ARTEMIS P2 · Moon L1 with the **default** 21 days (so this is what a reader sees on pressing the button):
  "Wait 21 days and a 1 mm/s error has become 1.4 × 10⁰ km/s — the spacecraft is long gone." (also a malformed number: "× 10⁰").
- Same case, slider at 120 days: readout "ERROR AFTER 120 DAYS WITHOUT A BURN × 1.4 × 10³⁵"; status "a 1 mm/s error has become
  1.4 × 10²⁹ km/s". ARTEMIS P1 · Moon L2 at 120 days: "7.4 × 10¹⁹ km/s".
- The speed of light is 3.0 × 10⁵ km/s; the Moon's own orbital speed is about 1 km/s. e^(t/τ) is the solution of the
  *linearised* equations and holds only while the displacement is small beside the distance to the Moon (58,000 km) and the
  velocity error small beside ~1 km/s. With τ = 1.48 d a 1 mm/s error leaves that range after roughly 14–18 days (my run:
  12.6 m/s at 14 d, 1.4 km/s at 21 d).
- What is right: stop the number where the model stops. For example, once the factor passes 10⁴–10⁶ (the chart's own ceiling)
  print "more than 10⁶ times: the linear model no longer applies, the spacecraft has left the neighbourhood of the point"
  instead of a figure, in both the readout cell and the status line, EN and RU. Never print "× 10⁰".
- Check to add: for every case and `days` = 0…120 the status and readout contain no velocity above, say, 1 km/s and no factor
  above the stated ceiling.

### SHOULD

**S1. The μ sliders run past 0.5, and at that end the map's "OPEN L2" button does not open L2.**
`body.html` 59, 114, 150: `max="-0.301"`; 10^−0.301 = 0.500035 > 0.5, so M₂ becomes the heavier body while still drawn and
labelled as the smaller one. Then C(L3) > C(L2), `regime()` (`script.js` 124) assumes C2 ≥ C3, and the gate button computes
`C2 − min(step, 0.5·(C2 − C3))` with a negative gap. Built page, map slider at the right end: gates 0…4 give "none ; L1 ; **L1** ;
L1, L2, L3 ; all". At the exact EQUAL MASSES preset (μ = 0.5) "OPEN L2" gives "L1, L2, L3" with the status "L3 is open", which is
physically right (L2 and L3 open together by symmetry) but is not what the button says. Right: clamp μ to 0.5
(`Math.min(0.5, …)` in the three `…MuVal()` functions, or `max="-0.30103"` with a clamp), and give the equal-mass case its own
status line ("L2 and L3 open together"). Add a check at the slider maximum.

**S2. Instrument 3 cuts the *stable* Sun–Earth path short, so the default "stable" picture for that preset is an open drifting arc.**
`script.js` 75: `if(Math.hypot(s[0], s[1]) > 400) break;` is a guard for the unstable case but also fires for small μ.
Sun–Earth preset: the label reads "22.6 revolutions" although `tEnd` is 40, frame width 650 × the offset; my own integration
gives the same cut (22.6 rev, extent 347 × 198) and, over one whole long period (222 rev), a closed figure 1,159 × 670. The same
happens for every μ below about 10⁻⁴. The readout says "stable: both modes oscillate" while the drawing shows a path leaving
the frame, which is how the unstable cases look. Right: apply the 400 guard only when `!e.stable`, or say in the label that
the path shown is a tenth of one long period (222 years for Sun–Earth). A check: for a stable μ the path is not truncated.

**S3. The solver's Sun–Earth L3 e-folding time, 56.7 years, contradicts the figure readers will find elsewhere (about 150 years), and nothing on the page or in checks.js defends it.**
Wikipedia, "Lagrange point": "The Sun–Earth L3, however, is a weak saddle point and exponentially unstable with time constant
of roughly 150 years", citing N. Cornish's NASA/WMAP note (https://en.wikipedia.org/wiki/Lagrange_point, read 2026-11-15).
The page's value is the correct one for this model: at L3 c = 1 + 7μ/8, so λ² ≈ 21μ/8 and τ = T/(2π√(21μ/8)) = 56.7 yr
(150 yr corresponds to 3μ/8). I confirmed it two ways: eigenvalue of my own Hessian (λ = 0.002808) and a direct integration of
the full nonlinear equations from a 10⁻⁸ offset over 2,500 time units (fitted λ = 0.00281, τ = 20,702 d = 56.7 yr). Because the
page is right against a widely repeated number, it should (a) carry one sentence in the Chapter 3 note ("for L3 the linearised
model gives λ ≈ √(21μ/8), 57 years for Sun–Earth; the often-quoted 150 years does not follow from these equations"), worded
after reviewer B has looked at the Cornish note itself, which I did not open, and (b) get a check: `collinEig(se.L3).lam` against
√(21μ/8) to 1e-4. At present `collinEig` at L3 is tested only for c > 1.

**S4. Several checks cannot fail, or test tables the page does not use.**
- `checks.js` 122: `1906 - 1772 === 134` is arithmetic on literals; it is not connected to the page's text or data.
- 123–126: the five date intervals are computed from `DATES` (`script.js` 442), which nothing on the page reads; the register
  is rendered from the separate strings in `MISSIONS`. A wrong date in the register or timeline would pass. Derive the
  intervals from `MISSIONS`/`TIMELINE`, or drop the table.
- 120–121: the sums use `MPC` (`script.js` 440), also unused by the page; "9,823", "5,942", "15,765", "18", "35" in `body.html` 214–215
  are separate literals. Test the rendered text (`document.getElementById('ch6').textContent`) against `MPC`.
- 114: `C.SK.ace.dv === 1.0 && …` compares constants with themselves.
- 95: RK4 growth against the analytic rate passes at 3.000 vs 3.049 with a 5 % tolerance; the 1.6 % gap is the initial
  transient, not integration error. Measure between two later times (my runs agree with the analytic rates to 3–4 digits)
  and tighten to 1 %.
- Not tested at all: `series3(mu, 2)` (the L2 series; correct by my numbers, −0.0195 % for Sun–Jupiter, −0.245 % Earth–Moon),
  `l3lead` away from Sun–Earth, the drawn map against `regime()`, and any prose number in `body.html` against the model
  ("175 and 181 days", "85 %", "147 years", "0.3 % … 11 %").

**S5. The Koon comparison can be exact, and the label of the μ check is wrong.**
`checks.js` 8 says Koon's Table 2.2.1 "rounds to 3.036e-6"; 3.036e-6 differs from the page's 3.0405e-6 by 0.15 %, which is
not rounding. Koon's ten-digit worked values are reproduced to every printed digit by μ = 3.040357143e-6: my calculation gives
γ₁ = 1.001090475 × 10⁻², ω_p = 2.086453455, ω_v = 2.0152105515 (with μ = 3.036e-6 one gets 1.000613641 × 10⁻² and 2.086446287).
So lines 34–38 can call `lpoints(3.040357143e-6)` and `collinEig` and require agreement to 1e-9 instead of the present 3e-5 and
2e-5, which is a far sharper test of the solver and of the eigenvalue code than the NSSDC-mass version.

**S6. "NASA's round figure for both is 61,300 km [7], which is the leading-order value" asserts an origin the source does not give.**
`body.html` 231 and the Earth–Moon status (`script.js` 261, where the wording "is close to" is fine). NOTES.md itself records
that [7] prints "61,300 km above the lunar surface" and that the page "does not claim how NASA derived it"; the sentence in
Chapter 7 does claim it. Numerically the leading-order distance from the Moon's *centre* is 61,274 km (mine and the page's);
"above the surface" would be 63,000 km from the centre, which is neither the leading-order value nor either exact root
(58,020 / 64,515 km). Right: "…61,300 km [7], close to the leading-order value of 61,274 km from the Moon's centre".

### NIT

- N1. Eq-note, `body.html` 92: "The page finds the roots by bisection … and, as a cross-check, by Newton's method on this quintic".
  `quintic()` is called only from `checks.js`; the page itself never runs it. Say "the test suite cross-checks…". (The agreement
  claimed, better than 1 part in 10¹⁰, is true: 7.2e-14 over the slider.)
- N2. Chapter 3 heading "L1, L2 and L3 are the roots of a quintic": each point is the one real positive root of its *own* quintic
  (two are shown, L3's is not). "Each of L1, L2, L3 is the root of a quintic" is exact.
- N3. Map grid artefact: on the 0.025-wide grid the wall at a neck is missed for C just above the critical value. Counting slider
  positions where the picture and the "GATES OPEN" readout disagree: Sun–Jupiter 10 positions at L1 (250–259) and 5 at L2;
  Earth–Moon 6 and 1; Pluto–Charon 1 and 1 (of 1,001). The note already says the map is computed on a 129 × 101 grid; a clause
  "necks narrower than a grid cell are not resolved" would cover it.
- N4. Instrument 3, slider at −1.4143: label "μ = 0.03852", readout "unstable … e-fold in 159.27 rev", status "Above μ = 0.03852".
  The displayed μ equals the limit to four figures; show five figures near the limit.
- N5. Mass-ratio readouts are not grouped: "1048 : 1", "332943 : 1" (`fmt(…, 0)` at `script.js` 168 and 318) against "1,048 to 1" in
  the text. Use `fmtInt`.
- N6. Solver table, L3 rows: the error column shows "−0.000 %" / "+0.000 %" for every preset except Pluto–Charon; the sign carries no
  information. Print "< 0.001 %" or more digits.
- N7. Timeline 1996: "SOHO reaches L1 on 14 February, two months after its launch on 2 December 1995" is 74 days, nearer two and a
  half months.

## Checked and found correct

All values below are from my own calculation; the page's functions agree with them to a relative 1e-8 or better (worst case
8.9e-9, the L4 long-period frequency at μ = 3e-6, from the subtraction 1 − √(1 − ε)).

- **Constants and units.** μ from the NSSDC masses: 3.0035e-6, 3.0405e-6, 9.5369e-4, 0.012151, 0.10851; ratios 1,047.6, 81.3, 8.2.
  Times are scaled by the published sidereal period (τ = T/2πλ, period = T/ω), consistent with "τ = 1/(nλ)". Kepler's third law
  with the fact-sheet R and masses gives periods within 0.03 % of those used, except Earth–Moon (−0.14 %, the known difference
  between 384,400 km and the Keplerian semi-major axis); no effect at the precision shown.
- **Equation boxes against the code.** Ch. 1 μ and n²; Ch. 2 Ω, C = 2Ω − v² and the equations of motion (`omega`, `jacobi`, `gradOmega`);
  the quintic with both sign sets, re-derived by hand from the force balance and with residual < 1e-49 at my 50-digit roots
  (`quintic`); the series r_h(1 ∓ r_h/3 − r_h²/9) (`series3`); L3 d_B ≈ 1 + 5μ/12, d₁ ≈ 1 − 7μ/12 (`l3lead`); Ch. 4
  λ⁴ + λ² + (27/4)μ(1 − μ) = 0, the limit ½(1 − √(23/27)) = 0.0385208965 and (25 + √621)/2 = 24.95994 (`triEig`, `MU_CRIT`), the
  linearised system with Ωxx = ¾, Ωyy = 9/4, Ωxy = (3√3/4)(1 − 2μ) (`triPath`), the out-of-plane rate 1 at L4; Ch. 5 c, the
  characteristic equation, ω_v = √c, δ₀e^(t/τ) and the rocket equation (`collinEig`, `efoldDays`, `propellant`).
- **Collinear points.** Sun–Earth L1 1,491,557 km, L2 1,501,538 km, Hill value 1,496,563 km; Sun–(Earth+Moon) L1 1,497,627 km
  (+6,070 / +6,152 km); Sun–Jupiter γ = 0.066676 / 0.069780 (51.9 / 54.3 million km, 0.35 / 0.36 au); Earth–Moon 58,020 / 64,515 km
  (x = 0.836914, 1.155683, −1.005063); Pluto–Charon 5,848 / 7,271 km, barycentre 2,126 km from Pluto's centre. Hill-formula errors
  +0.336/−0.331, +2.36/−2.19, +5.61/−5.02, +10.81/−10.87 %; "L1 too far, L2 too near" holds over the whole slider (extremes
  +12.2 % at μ = 0.26 and −21.2 % at μ = 0.5, inside the chart's −24…+14 range). Third-order series errors as displayed.
- **L3, Sun–Earth.** 187.22 km, 262.10 km, 449.32 km, from the exact root and from 5μ/12, 7μ/12.
- **Koon's worked examples.** μ = 9.537e-4: r_h 6.82491e-2, exact 6.66765e-2, series 6.66611e-2, x = 0.93237. Ten-digit Sun–Earth
  values reproduced exactly (see S5).
- **Time scales.** Sun–Earth L1: λ 2.5326, e-fold 22.95 d, doubling 15.91 d, periods 175.07 / 181.26 d; L2: 23.40 d, 177.56 / 184.00 d.
  Moon L1 1.483 d, L2 2.014 d, L2 in-plane period 14.67 d. Sun–Jupiter L1/L2 257 / 293 d. Confirmed with the full nonlinear
  equations (fitted λ: Moon L1 2.933, Moon L2 2.158, Pluto–Charon L1 3.412, Sun–Earth L3 0.00281). 365.256/27.3217 = 13.37;
  2 × 29.53/9 = 6.562 d.
- **L4/L5.** Jupiter short period 11.90 yr, long 147.43 yr; Sun–Earth long 222.1 yr; Earth–Moon 28.6 / 91.6 d; Pluto–Charon growth
  0.3925 (e-fold 0.406 rev = 2.59 d), frequency 0.8087. `triPath` against my own integrator (different step): Sun–Jupiter
  maximum excursion 40.8 × the offset over 24.9 rev, and the same 40.8 from the full nonlinear equations at a 10⁻⁶ offset;
  Earth–Moon and the limit case agree with the frame widths shown (56.5, 378).
- **Zero-velocity map.** C(L4) = 3 − μ(1 − μ); Earth–Moon C = 3.18834, 3.17216, 3.01215, 2.98800; Sun–Jupiter 3.03876, 3.03748,
  3.00095, 2.99905; order C1 > C2 > C3 > C4 for μ < 0.5; the gate buttons land in the intended regime for μ from 10⁻³·⁵ to 0.1;
  slider ends give "none" and "nothing forbidden"; the status texts describe each regime correctly.
- **Other computed statements.** Earth covers 85.1 % of the Sun's disc from the exact L2 (84.9 % with the mean radius); the Moon's L2
  shifts 7,083 km between perigee and apogee by simple scaling; propellant 0.463 kg per year for 1,000 kg, 1 m/s, 220 s;
  ten-year figure uses 10 × Δv in one exponential (correct).
- **Edges.** No NaN, Infinity or "undefined" in any readout, status or SVG at any preset or at either end of any slider; no
  script errors; EN and RU number formatting both render.
- **Model labels.** Each instrument's note states the model (planar circular restricted problem; linearisation; published values
  versus reader assumptions) and where it stops applying; the NRHO case correctly shows no L2 growth rate.

## Not checked

- Sources: I opened only NASA's "What is a Lagrange Point?" (23 days, 24.96, L3 sentence: confirmed) and Wikipedia's time-scale
  sentence for S3. Every other published number (Roberts' 16 days and 1.0 m/s, the ARTEMIS 7.39 / 5.28 / 5.09 m/s, the NRHO
  figures, Fleming & Hamilton's 150 years, Siddiqi's dates and 61,300 km, MPC counts, all mission dates and statuses) is
  reviewer B's; I checked only that the code and text use the values NOTES.md records.
- The Cornish note behind the 150-year figure (S3) was not opened.
- The page in a real browser: no screenshots taken; layout, chart legibility, label collisions and the drawn shape of the
  contours were judged from the code and from jsdom output only. Slider snapping was exercised through the test harness's
  emulation, not a browser.
- Halo, Lissajous and near-rectilinear orbits themselves: the page computes none of them (it quotes published periods and
  costs), so there was no model to re-derive; I checked only that the linear periods bracket the quoted halo periods.
- Russian text, history and credit, accessibility: reviewer C.
