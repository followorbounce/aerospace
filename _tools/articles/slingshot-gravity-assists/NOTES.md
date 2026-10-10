# SLINGSHOT — Gravity assists & the Grand Tour — authoring notes

Owner: Wave 5 author team (generated guide). Category: `foundations`. Built 2026-10-09.

## Purpose and audience
The canonical explainer for gravity assists on the site. It is for curious non-specialists (secondary school physics and up),
and it carries enough formulas for an engineering student. SCORCH (Mercury braking) and TILT (Jupiter → Uranus) mention
this guide in plain text and should link here once they're wired.

## Structure
9 chapters, "Nine chapters" / «Девять глав» in the lede (the coordinator's change: generated guides count every chapter, REFERENCES included, as in Waves 2–4).
1. The problem: Hohmann to Neptune, 30.8 yr / 11.7 km/s (computed), NASA "30 → 12" years.
2. The turn: **instrument 1**, a flyby path to scale (planet frame) plus the velocity triangle (Sun frame). Presets: Cassini/NEAR/MESSENGER Earth flybys.
3. The bookkeeping: misconception chapter. Juno 2013 (same speed relative to Earth, +3.9 km/s relative to the Sun). **Instrument 2**, an exact elastic ball/train with a Voyager 2–Jupiter preset.
4. Faster or slower: behind vs in front, MESSENGER's six flybys, Galileo at Io (90 kg), Juno moons, Cassini/Titan.
5. Out of the Sun's grip: **instrument 3**, Earth → one Jupiter flyby → escape-or-bound, a speed-vs-distance plot against the escape curve.
6. Who thought of it: Luna 3, Minovitch, Flandro, Mariner 10.
7. The Grand Tour: **instrument 4**, Hohmann-direct vs Voyager 2 arrival times per planet.
8. LEGACY timeline (12 rows). 9. REFERENCES (9).

## Model assumptions (stated on the page)
- Patched conics: an instantaneous, in-plane flyby. Planets on circular, coplanar orbits with v = √(GM☉/a).
- Instrument 3 has a tangential launch from 1 AU and is labelled "Model, not a flown trajectory".
- The presets use the published v∞ and altitude, then aim the approach direction for maximum gain. The Sun-relative gain shown is an
  upper bound, not the flown value (said in the note under the instrument). The turn angle and |Δv| don't depend on aim.
- The ball/train is a 1-D head-on elastic collision, the ideal u+2V limit. The text says a real flyby can't turn 180°.

## Physics findings during the build (worth knowing)
- "Behind = speed up, in front = slow down" is exact when defined by where the closest approach is:
  |v_out|² − |v_in|² = 2V·Δv, and Δv points from periapsis to the planet's centre. A definition based on which way the
  rotation starts is wrong for large turn angles; the first version had that bug, and a check caught it.
- From some approach directions **both** in-plane ways round pass behind (or both in front). A Hohmann-slow probe
  at Jupiter is overtaken by the planet, so it can only be sped up in the plane. The page says so in the CH5 text and the status lines.
- The minimum launch that reaches Jupiter (8.79 km/s beyond Earth's speed) plus a 1.05 R_J pass behind already escapes the Sun
  (18.61 vs 18.47 km/s); at 2 R_J it stays bound.

## Source per key number
| Number | Source |
|---|---|
| Cassini Earth flyby 18 Aug 1999, ~1,171 km, ~5.5 km/s boost | [5] JPL 1999 release (fetched via WebFetch; curl gets 403 bot-block) |
| Cassini v∞ 16.01, v_p 19.026 at 1,175 km; NEAR 6.851/12.739/539; MESSENGER 4.056/10.389/2,347 | [7] Bertolami et al. Table 1, from [6] Anderson et al. 2008 |
| Computed: Cassini δ 19.67°, \|Δv\| 5.47 km/s; v_p 19.025 | checks.js |
| Juno 2013: +3.9 km/s around the Sun, the same speed relative to Earth | [8] JPL 2013 |
| 175-year alignment, 30 → 12 years to Neptune, launch/encounter dates, Mariner 10 first | [2] NASA Voyager page |
| Flandro spring 1965, 1976–1979 alignment | [4] Caltech E&S (Smith 2013) |
| Minovitch early 1960s; Galileo Io 90 kg; planet's loss unmeasurable; behind/in-front rule | [1] JPL Basics of Space Flight ch. 4 |
| Luna 3 path; Mariner 10 5,768 km on 5 Feb 1974, Mercury 29 Mar; Grand Tour cancelled Jan 1972 ($1 billion); Voyager 2 721.9 kg; Giotto first Earth assist 2 Jul 1990; New Horizons +14,000 km/h, 3 yr; MESSENGER six flybys | [3] Beyond Earth SP-2018-4041 (local text ~/.cache/aero-src/raw.txt) |
| GM, radii, semimajor axes, Jupiter mass, GM☉ | [9] NSSDCA fact sheets (individual planet sheets fetched) |

## Unverified or judgment calls
- **Luna 3 as a "gravity assist"**: Beyond Earth only describes its path past the Moon. The page says the path was bent and
  "climbed northward" and does **not** call it the first gravity assist; that claim is common but would need a better source.
- **Minovitch's priority** is disputed (Battin, Crocco, Soviet work). The page says only that he "computed such trajectories and
  championed the technique", per [1]. Crocco 1956 is omitted for lack of a primary source we could open.
- **Year of Flandro's discovery**: 1965 per Caltech [4]; some sources say 1964.
- **Galileo's first Earth flyby on 8 Dec 1990** (timeline) comes from [7]/[6]'s table, not Beyond Earth.
- **Anderson's deflection-angle column** (NEAR 66.9°, MESSENGER 94.7°) was recalled from memory, not seen in the paper. The computed values
  match it but are not cited as a check.
- "Every spacecraft that has left the Solar System got there on a planet's borrowed momentum" (LEGACY quote): true for the five
  (Pioneer 10/11, Voyager 1/2, New Horizons), which all used Jupiter. Revisit if a new escape mission flies without an assist.
- **Not done:** headless-Firefox screenshots at 1300/390 px (out of scope for this pass) and real-device touch.
- `extra.css` raises `.btn` to 44 px min-height and gives range inputs a 28 px hit area, per the iPhone guideline. Older guides don't have this.

## Wiring suggestions (not done here)
- index label EN: `Gravity Assists & the Grand Tour` · RU: `Гравитационные манёвры и «Большой тур»`
- codename: `SLINGSHOT`
- llms.txt: `How gravity assists work: same speed relative to the planet, kilometres per second gained or lost relative to the Sun, why the planet pays, braking toward Mercury, escaping via Jupiter, and Voyager 2's 12-year Grand Tour vs a 30-year direct flight; checked against Cassini's 1999 Earth flyby.`
- wire: `python3 _tools/wire.py slingshot-gravity-assists SLINGSHOT "Gravity Assists & the Grand Tour" "Гравитационные манёвры и «Большой тур»" foundations "<llms line>"`

## Response to review (REVIEW.md, 2026-10-09)

### MUST-FIX: all applied
1. **Jupiter "falls one atom behind"**: removed. The readout now gives the orbit change Δa = 2aΔv/v = 2.09 × 10⁻¹² m
   ("about 1/48 of an atom's width"), computed by `orbitShrink()`. A code comment notes that the planet then drifts *ahead*. Check added.
2. **Ball/train status**: the platform speed is now computed and shown with the mass ratio ("…leaves at X km/s; the lighter the ball…, the closer to
   u + 2V = Y"). The mass slider now runs from 1 : 100 to 1 : 10⁸ (default 1 : 1,000), so the 1 : 1 reversal case is gone. The gain is
   shown with its real sign. Checks added: at 1 : 100 the ball leaves at 19.70 < 20, and the train is slowed, not reversed.
3. **Mercury**: now "stopping at Mercury — entering orbit around it — takes more propellant than leaving the Solar System" (EN/RU).
4. **New Horizons / "left the Solar System"**: CH5 now says Pioneer 10/11 and both Voyagers reached solar escape with Jupiter's help (Pioneer 11 and the Voyagers
   with Saturn's too), and that New Horizons was launched fast enough to escape anyway. The jStatus line drops New Horizons. The LEGACY quote follows the review's wording.
5. **Mariner 10 "first"**: now "first to use one planet's gravity to reach another". A 1973 Pioneer 10 timeline row is added (4 December UT, the date in
   Beyond Earth and Van Allen; the US date was 3 December).
   - **New source [10]**: Van Allen (2003), AJP 71, 448, which documents that Jupiter turned Pioneer 10's bound orbit into an escape (9.8 → 22.4 km/s,
     escape 18.7 at 5.05 AU). CH5 and CH6 cite it. Beyond Earth [3] doesn't state that Jupiter caused the escape, so the claim needed its own source.
   - **Four new checks** reproduce Van Allen's vectors through the page's frame transformation: v∞ 8.86 km/s at −43.5°, 22.1 km/s at 83.1° after a
     116° turn, a perijove speed of 36.5 vs 37, and escape at 5.05 AU of 18.74 vs 18.7.
   - Note: from his v∞ (8.9) and r_p (2.84 R_J) the turn angle formula gives about 125°, not his quoted 116°. That is probably an ecliptic projection of a
     3-D turn. It isn't used on the page or checked.

### SHOULD / NICE: applied
- **One Earth radius**: 6,378.137 km everywhere (instrument and checks). The eq-note now says so and quotes v_p = 19.02 vs 19.026.
- **Wording**: "has a component along the planet's motion" (EN/RU); "takes back" in CH3.
- **Minovitch**: "a UCLA graduate student working summers at JPL" (CH6 and timeline), with a hedge ("had been suggested before…; computed in detail"). One
  neutral sentence on credit: "How much credit each man deserves is still argued over" / «Чья заслуга больше — спорят до сих пор».
- **RU terms**: «метод сопряжённых конических сечений» (all three places); «гиперболический избыток скорости, v∞»; EN adds "the hyperbolic excess
  speed". Mission names in RU are now in Cyrillic: «Кассини», «Галилео», «Мессенджер», «Джотто», «БепиКоломбо», «Розетта».
  Exception: NEAR stays as the Latin acronym, the usual form in Russian too. RU kicker: «БОЛЬШОЙ ТУР» АППАРАТА «ВОЯДЖЕР-2».
- **[7] citation**: now cites the published *Classical and Quantum Gravity* 33, 125021 (2016), verified via Crossref, and keeps the arXiv link as the open copy.
- **Accessibility**:
  - `aria-valuetext` on every slider, set from the displayed value.
  - The SVG and group `aria-label`s are bilingual (`data-aria-en`/`data-aria-ru`, applied in renderAll; page-local, helpers.js untouched).
  - `.svg-small` is darker (#5f5f59, ≈ 6.5 : 1) and 10.5 px.
  - Grand Tour inactive bars darkened (#8f8f88, #6f8fc4, ≈ 3.2–3.4 : 1); the active bars are outlined.
  - Under reduced motion the bounce is drawn after the hit, with both speeds in the label.
- **CH.02 Sun's-view legend overlap (coordinator)**: the vectors are now fitted inside the panel box (x 252–458, y 34–284, one scale), the legend moved
  below the drawing (y 314–342), and the viewBox grew to 480 × 350. In jsdom the vector extent stays ≤ y 203 for the default view.
- **Voyager 2 dates**: the note says they are "the dates given by NASA" (the Saturn date is the US date).
- **Extra check**: when a pass behind gains speed, the closest approach (−Δv) lies against the planet's motion; it holds over 500 geometries.

### Declined / deferred
- **aria-live chattiness (NICE)**: the status regions still update on `input`. Debouncing would change behaviour shared with the other guides' pattern; better
  done once, site-wide.
- **Zander / Kondratyuk / Crocco named in the text**: the review only asked for a hedge, and I couldn't open primary sources for them, so they're not named.
- **Narrower viewBox under 600 px for SVG text size**: not done. I raised the font size modestly instead; a phone-width screenshot should confirm it reads well.

Checks: `_tools/check-all.sh slingshot-gravity-assists` → ALL OK (33 checks, 10 refs, 13 timeline rows, 0 missing RU).
