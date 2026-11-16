APPROVE WITH CHANGES: every model and every stated number reproduces independently; two error statements mislead (MUST 2, SHOULD 6, NIT 4).

# Review A (physics and mathematics): elements-orbital-elements-ground-tracks

Reviewer A, 2026-11-15. I did not write the guide.

Method: my own Python implementation (TLE parser and checksum, Kepler solver with a bisection safeguard, rotation-matrix
elements-to-state, SGP semi-major axis, secular J2 rates, SGP drag terms, IAU-82 GMST, Bowring geodetic sub-point) plus
python-sgp4 2.25 in a scratch virtual environment (both the compiled `sgp4.api.Satrec` and the pure-Python
`sgp4.model.Satrec`, whose internal rates I read). The page's pure functions (script.js lines 1–156) were run in Node
only to dump their outputs for comparison. `./check-all.sh elements-orbital-elements-ground-tracks` ends in `ALL OK`
(78 checks PASS). Scratch files: `/private/tmp/claude-501/-Users-noone/15467dca-f7da-43db-80d4-657b045af751/scratchpad/w9-elements-revA/`
(`mine.py`, `run1.py` … `run8.py`, `cmp.py`, `page_core.js`).

## MUST

### M1. The stated error of the propagator for the five current TLEs is sampled at one orbital phase and understates it (GPS by a factor of five)
Text (body.html line 181, ch. 5 note): "5 to 27 km after a day with the J2 drift"; readout row "MODEL ERROR AGAINST
SGP4 · 24 H / 72 H" (script.js line 316); NOTES line 15; check "five current TLEs, J2 model vs python-sgp4 after 24 h:
5 to 27 km".

The numbers at exactly 24 h and 72 h are right (I reproduce all of them, see "Checked"). But for three of the five
satellites 24 h and 72 h are whole numbers of revolutions (GPS 2.006 and 6.02, Molniya 2.006 and 6.02, GOES 1.003 and
3.01), so the error is always sampled at the same point of the orbit as the epoch (the ascending node), and the part
that varies round the orbit is never seen. Sampling my python-sgp4 run every 2 minutes, J2 mode, 3-D distance in km:

| TLE | page, at 24 h | max over 0–24 h | page, at 72 h | max over 0–72 h | where the max is |
|---|---|---|---|---|---|
| ISS | 15.0 | 15.0 | 46.7 | 46.7 | 72 h |
| Landsat 9 | 14.9 | 15.2 | 9.4 | 16.3 | 71.7 h |
| GPS IIF-7 | 5.6 | **27.2** | 6.8 | **27.2** | 6.1 h after epoch |
| Molniya 3-50 | 19.3 | **28.8** | 9.9 | **28.8** | at the epoch itself |
| GOES-19 | 27.2 | 27.2 | 41.0 | 41.0 | 72 h |

So the honest range for the first day is about 15 to 29 km, not 5 to 27, and the GPS readout "6 km / 7 km" shows a
model that is 27 km out a quarter of a revolution later. The error at the epoch itself is already 11.8 (ISS), 14.9
(Landsat 9), 5.7 (GPS), 28.8 (Molniya) and 21.9 km (GOES-19).
Fix: state the largest error over the first day and over the 72 h (embed those five pairs of numbers, or more reference
points per satellite), or say in the note and the readout label that the figure is at one instant and give the
within-revolution maximum beside it. Add a check for the maxima.

### M2. The explanation of the Molniya 2-14 error is not what the numbers show
Text (script.js line 413, status of instrument 5): "A Molniya orbit dives to a low perigee at high speed, where the
terms this model leaves out are largest: it is 97 km out near perigee, at the epoch itself, and the J2 drift barely
helps." Check message: "worst near perigee at the epoch".

What I find for TLE 08195 (run5.py, run6.py):
- At the epoch the satellite is not at perigee: M = 20.2°, true anomaly 95.6°, r = 14,972 km (height about 8,600 km),
  40 minutes after perigee; the perigee radius is 8,297 km. With 1-minute sampling over the two days the largest J2-mode
  error is 97.3 km at t = 710 min, r = 13,168 km, again after perigee, not at it. (The published points are 120 min
  apart and the period is 718 min, so they hit the same phase every sixth point: 96.4, 96.6, 96.4, 94.8 km.)
- The error is 96.4 km at the epoch, 96.6 km at 720 min: "97 km at the epoch itself" is the 720-min value.
- Cause: with SDP4's lunisolar periodic correction switched off (pure-Python sgp4, `_dpper` replaced by the identity),
  the page's model is 26.8 km from SGP4 at the epoch instead of 96.4 km; the lunisolar periodic term alone moves the
  SGP4 position by 71.6 km there (44 km at 120 min, 25 km near apogee). Three quarters of the miss is the Sun–Moon
  periodic correction of the deep-space model, an offset in the angles that becomes more kilometres where the
  satellite moves fast. It is not a group of omitted terms that are "largest at a low perigee".
Fix: reword, e.g. "40 minutes after perigee … about three quarters of the 97 km is the periodic pull of the Sun and
Moon that SDP4 adds for orbits this high; the rest is the J2 wobble; the J2 drift cannot remove either". Correct the
check message too.

## SHOULD

### S1. GOES-19: the explanation is right in substance but leaves out the larger half of the error
Text (script.js line 321): "For this orbit the J2 correction does not help: the Sun, the Moon and the uneven equator
matter as much, and SGP4's deep-space version models them." NOTES line 15: "the J2 correction makes it worse than
Kepler alone".

I confirm the result (J2 mode 27.2 km at 24 h and 41.0 km at 72 h; Kepler only 17.6 and 12.7 km) and, in substance, the
explanation:
- The page's J2 rates are exactly SDP4's own secular J2 rates for this TLE: node −0.01341, perigee +0.02683°/day in
  both (pure-Python Satrec `nodedot`, `argpdot`). Their sum moves the satellite along the orbit by +0.0134°/day =
  9.9 km/day.
- SDP4 then adds lunisolar secular rates (`dmdt` −0.00885, `domdt` +0.00294, `dnodt` 0: sum −0.0059°/day) and the
  synchronous-resonance acceleration (measured from its output: −0.0022°/day²). Its net along-track drift relative to
  n·t is about +4.8 km/day (linear fit over 72 h), so the J2-only model runs ahead of SGP4 by 5 to 6 km/day and
  Kepler-only falls behind by 3.5 to 5 km/day. "Matter as much" is fair: −0.009 against +0.013°/day.
- What the text does not say: both modes start 21.9 km from SGP4 at the epoch (21.5 km along-track, 4.2 km
  cross-track), and that offset is entirely SDP4's lunisolar periodic term. With that term switched off the page's J2
  model agrees with SGP4 to 0.0 km at the epoch, 5.0 km at 24 h and 10.9 km at 48 h. Kepler-only looks better at 72 h
  because its drift error has the sign that eats into the +21.5 km offset (21.5 → 10.9 km along-track) while the J2
  drift error adds to it (21.5 → 40.5 km). With the opposite phase of the Sun–Moon term the ranking would reverse.
So the check "J2 error ≥ Kepler error at 72 h" is true for this element set but is not a property of the orbit. Say
that the 22 km at the epoch is the Sun–Moon periodic term, and that the J2 drift is then about as wrong as no drift,
with the opposite sign.

### S2. "Published SGP4 output moves Vanguard 1's node by −3.07°/day and its perigee by +4.52°/day" mixes two kinds of element
Text (body.html line 221; script.js line 375; check "Vanguard 1: published SGP4 output −3.07 and +4.52°/day").
The rate is (osculating angle in the last line of tcppver.out at 4320 min − mean angle in the TLE) / 3 days. I get the
same arithmetic (−3.0690, +4.5246), but an osculating element minus a mean element contains the short-period offset
(for the perigee of this e = 0.186 orbit about 0.14°). SGP4's own secular rates for this TLE are node −3.0669 and
perigee **+4.4795°/day**; the page's first-order formulas give −3.0640 and +4.4765, i.e. they agree to 0.1 %, not the
1.1 % the page reports. The "+4.52" is not a rate SGP4 uses and is not printed in [2]. The same mixing is in the
CBERS-2 (+0.975) and Delta 1 debris (−4.253) node checks; SGP4's secular node rates there are +0.97685 and −4.26362
against the formula's +0.97796 and −4.26456.
Fix: either word it as what it is ("the node and perigee angles in the published output, three days on, differ from
the element set's by …, which includes the periodic wobble") or compare with the secular rates of the SGP4 code
itself. For all ten TLEs the formula is within 0.12 % of SGP4's node rate and within 0.6 % of its perigee rate, except
near the critical inclination where the rate is nearly zero (Molniya 3-50: −0.00080 against −0.00085°/day; Molniya 2-14: −0.00608 against −0.00614).

### S3. "Within about 10 to 25 km of SGP4 in low orbits" is true only of the four chosen cases
Text (body.html line 262). The page's own instrument 3 shows the ISS 47 km out at 72 h in the same J2 mode, and with
1-minute sampling the Delta 1 debris case reaches 26.2 km (24.3 km at the published points). Scope the sentence ("in
these test cases, over two to three days; with strong drag it grows: 47 km in three days for the Station's current
set") or drop "in low orbits".

### S4. In "Kepler only" mode the ground-track readout and status still report the J2 numbers
script.js lines 291, 313–315, 322–323: `f = s.facts` is the J2 result whatever the mode. With KEPLER ONLY pressed the
track is drawn with a fixed node, but the panel still says "WESTWARD SHIFT PER REVOLUTION 23.60°", "NODE DRIFT (J2)
−4.951°/day", counts revolutions with the J2 nodal period, and the status says "the bulge moves the node by another
0.32°". Either show the two-body values in that mode (step 23.28°, no node drift) or label those rows as the J2 values.

### S5. The equation box of chapter 7 does not match the code in drag mode
Box: "M = M0 + n t + (ṅ/2) t²", note: "The element set's a (from n), e and i are held fixed". Code (`meanAt`,
script.js line 77): in drag mode a shrinks as a0·(n0/(n0 + 2(ṅ/2)t + 3(n̈/6)t²))^(2/3), e is recomputed to keep the
perigee radius fixed (e = 1 − q0/a), and M also gets the (n̈/6) t³ term. That is the SGP rule and I agree with it
(my own version gives the same positions), but the box and note should say so: a and e are fixed only without the drag
term. Units also deserve a word: ṅ/2 is in revolutions per day², so M here is in revolutions with t in days.

### S6. "For an orbit this high it is not drag at all: it stands in for the slow pull of the Sun and Moon" is unsupported
Text (script.js line 252, ṅ/2 field for GPS, Molniya and GOES-19). I know of no source that gives the ṅ/2 field of a
deep-space element set that meaning; the cited field descriptions say only that SGP4/SDP4 do not use it. The page then
offers "+ ṅ/2 DRAG" for these three orbits, where it acts on a field that is not drag (GOES-19's is negative; the
page's own `decayPerDay` would read it as the orbit rising 132 m a day). The mode changes GOES-19 from 41.0 to 35.3 km
at 72 h for no physical reason. Either say "not used by SGP4; for a high orbit it is not drag and has no simple
meaning" and disable or relabel the drag mode above 225 minutes, or cite a source.

## NIT

- N1. "It never goes beyond the latitude equal to the inclination" and the dashed line "highest latitude = 51.6°": the
  sub-point is computed on the WGS 84 ellipsoid (geodetic latitude), which reaches 51.81° for the ISS in the page's
  model (51.79° from SGP4) and 81.84° for Landsat 9 (180° − i = 81.79°). The readout can therefore show 51.8° N above
  a line labelled 51.6°. The rule is exact for geocentric latitude; one clause would cover it.
- N2. Chapter 6: the perigee creeps "forward below an inclination of 63.4°, backward above it": backward only between
  63.43° and 116.57°, forward again above (the eq-note gives both angles; the body text does not).
- N3. J2 instrument at exactly i = 90.0° (reachable, step 0.1): node rate 0.000°/day is labelled "eastward" and the
  status says "Above 90° the node drifts east" (script.js lines 361, 376: `nd < 0 ? west : east`, `inc < 90`).
- N4. Checks that cannot fail or were loosened to pass: "the format has been public for half a century" (2026 − 1972 ≥
  50), "NASA's 22.9° is the Earth's rotation in a 91.3-min orbit" (arithmetic on a constant), "equatorial bulge … = 21
  km" (arithmetic on two literals plus a regex), and "ISS revolutions per day 15.49 within NASA's 15.5–15.9 to
  rounding" (the bound is set at 15.45; 15.49 is outside NASA's stated range, which is fine, but the check should say
  so). The "highest latitude" checks use a 0.3° tolerance and so cannot tell geodetic from geocentric latitude.

## Checked and found correct

Independent recomputation agrees with the page in every case below.

- **Constants**: μ 398600.8 km³/s², R 6378.135 km, J2 0.001082616 (= 2 × CK2), ω⊕ 7.2921151467e-5 rad/s → sidereal day
  86,164.0989 s; critical inclination 63.4349°; J2/|J3| = 426; Sun rate 0.98565°/day.
- **Kepler's equation**: 150 (e, M) pairs with e up to 0.999999 and M at 0, 1e-9°, 180° ± 0.001°, 359.999999999°, 360°:
  residual at most 8.9e-16, same E as my safeguarded solver. Newton from E = π does converge for every e < 1 (the
  function is convex on [0, π] and concave on [π, 2π], so the iteration is monotone from π on either side). The
  slider stops at e = 0.9.
- **Elements → state**: eight element sets including both ends of every slider of instrument 1 (a 6500 and 45,000 km,
  e 0 and 0.9, i 0 and 180°, angles 0 and 360°): position within 3e-11 km and velocity within 1e-13 km/s of my
  rotation-matrix version; periods agree. Equation box of ch. 2 matches the code (the code uses p/(1 + e cos ν), which
  is the same r).
- **TLE decoding**: column positions of all 16 fields on both lines; the exponent notation (6 cases including signs and
  "00000+0"); two-digit year rule; epoch day-of-year → UTC (ISS 2026-11-14 07:16:30, Molniya 2026-11-12 13:16:55);
  checksums of all twenty embedded lines (ten element sets) recomputed (digits + 1 per minus sign, mod 10): all valid.
- **SGP semi-major axis**: a0 = 6796.46, 7082.11, 26,559.98, 26,555.86, 42,164.32 km, heights 413 × 423, 703 × 705,
  20,085 × 20,279, 2,193 × 38,162, 35,783 × 35,789 km; the a1/a0 formula matches Spacetrack Report No. 3's SGP.
- **J2 rates**: equation box of ch. 6 matches `j2Rates`; nine (a, e, i) points including slider edges match my
  values (e.g. 6500 km, 0, 0°: −9.3253 / +18.6506°/day; 45,000 km, 0.8, 180°: +0.0824 / +0.1648). ISS node −4.9514,
  perigee +3.6949; Landsat 9 node +0.98696; GPS −0.03834; Molniya 3-50 perigee −0.00080; GOES-19 −0.01341 / +0.02683;
  Vanguard 1 −3.0640 / +4.4765°/day. Against SGP4's own internal secular rates: within 0.12 % (node) for all ten TLEs.
- **Propagator against SGP4, five current TLEs**: my python-sgp4 2.25 run gives the page's embedded 24 h and 72 h
  reference positions to within 0.6 m (all ten vectors). My own Kepler + secular J2 code gives the page's errors:
  J2 mode 15.0 / 14.9 / 5.6 / 19.3 / 27.2 km at 24 h and 46.7 / 9.4 / 6.8 / 9.9 / 41.0 km at 72 h; Kepler only for
  the ISS 469.2 km at 24 h (1403.5 km at 72 h); ISS with the ṅ/2 term 11.1 and 10.9 km. ISS error at the epoch 11.8 km
  (SGP4 epoch position 854.970, −6738.853, −0.002 km, as in the check).
- **Propagator against the published cases**: the 88 embedded points equal the bundled tcppver.out to under 1 m, and my
  SGP4 run reproduces that file exactly. Maximum errors: Vanguard 1 1376.6 km Kepler, 10.0 km J2; CBERS-2 776.7 / 15.1;
  Molniya 2-14 139.3 / 96.6; Delta 1 debris 766.5 / 24.3 / 13.9 with drag. ISS 2019 example: 243.51 min after epoch,
  66.9 km Kepler, 11.1 km J2, 2.62 revolutions.
- **Ground track**: GMST polynomial at five dates equals mine to 1e-9 rad; sub-point (latitude, longitude, height) at
  six positions equals my Bowring solution to 1e-6° and 0.1 m; longitude wrapped to ±180° and the pen lifted across the
  seam; track of all five satellites in all three modes at 0, 0.25, 3, 24, 47.75 and 72 h equals mine to 1e-6°.
  Equation box of ch. 5 matches `trackFacts`. ISS: nodal period 92.880 min and step 23.603° per revolution in the page;
  measured from SGP4 output (62 node crossings over 4 days) 92.877 min and 23.602°; closure after 61 revolutions is
  0.26° (3.93 days). Landsat 9: 233.001 revolutions in 16 days; descending-node local mean time 10:12.5 (my separate
  mean-Sun estimate: 10.21 h). GPS 2.00005 and Molniya 2.00014 revolutions per turn. GOES-19 at 75.157° W in the model
  (75.186° W from SGP4).
- **Text numbers**: Molniya 3-50 at M = 90°: E 122.67°, ν 153.03°, r 36,262.8 km, 89.5 % of the period with ν between
  90° and 270°; ISS speed 7.66 km/s; lighting cycle 60.6 days; decay 55.0 m/day from ṅ/2 (SGP4's own B* drag for the
  same set: 57.7 m/day, consistent).
- **Labelling**: every instrument says what model it is and where it stops (two-body geometry; parsing only; "not SGP4"
  on both charts, both status lines and the lede; first-order J2 only; "do not use it to point an antenna").
- **Singular cases**: i = 0 and e = 0 are explained in the status line and the markers removed; perigee below 100 km is
  flagged in instruments 1 and 4; the J2 chart never clips (largest possible rate 18.7°/day against a 20°/day axis).

## Not checked

- What the cited sources say (Spacetrack Report No. 3, Vallado 2006, Kelso, NASA, USGS, NOAA, IS-GPS-200, ITU): reviewer
  B's job. I used only the copies of SGP4-VER.TLE and tcppver.out bundled with python-sgp4 2.25, not Vallado's own
  distribution.
- That the five embedded TLEs are the ones CelesTrak served on 14 November 2026: I checked their format and checksums
  only; the SATCAT heights used in the checks were not re-fetched.
- Rendering in a browser (the drawn orbit, map, charts, phone layout), accessibility and the Russian text: not my lens;
  no screenshots taken. The drawing code was read, not viewed.
- `stateToElements` is used only by one check, not by any instrument; I did not test it beyond that check.
- UT1 − UTC, polar motion and the TEME-to-true-equator difference are ignored by the page and by me (effect on
  longitude well under 0.01°).
