# ISS & Mir (`iss-and-mir.html`) — Track B upgrade notes (2026-10-11)

**Purpose:** the ORBIT field guide (orbital mechanics, the ISS, Mir) upgraded in place to the wave standard:
verified facts, numbered citations, and computed interactives with jsdom checks.
**Audience:** curious non-specialists; bilingual EN/RU.
**Owner:** aerospace Track B. The HTML page is the source of truth; this folder holds `checks.js`, these notes and
(after review) `REVIEW.md`. Test: `cd _tools && ./check-all.sh iss-and-mir` → ALL OK (54 PASS, 14 refs = max cite 14,
no errors, no missing RU, no unstyled classes); `node --check` on the inline script passes.

## What changed

- **CH1 Newton's cannonball — rebuilt on real physics.** The old drawing used invented Bézier curves for the
  suborbital and escape cases (the ellipse case had been fixed in Oct 2026). Now every path is a true two-body conic
  from a horizontal launch on an imaginary 100 km mountain (circular 7.84 km/s, escape 11.09 km/s there), with range
  and flight time for suborbital shots, apogee/perigee/period for orbits, and v∞ for escapes. Range/time checked
  against an independent RK4 integration (935 vs 938 km, 2,245 vs 2,246 km).
- **CH2 third cosmic velocity — explanation corrected.** The old text said Earth's 29.8 km/s "supplies the rest" of the
  42.1 km/s, which doesn't add up (16.6 + 29.8 ≠ 42.1). Now: the craft must leave Earth's gravity with 12.3 km/s to
  spare, and √(12.3² + 11.2²) ≈ 16.6 km/s. Card 1 now says 7.9 km/s is the surface value (7.66 at 415 km).
- **CH3 stats** now from NASA's facts page, each cited (see corrections below).
- **CH4 communications** corrected (TDRS gives near-continuous contact, not "brief windows").
- **CH5:** the three orbit stats are computed for 415 km; the old canned city texts were replaced by a **computed
  pass model** (one-day ground-track simulation over 36 node longitudes, cross-checked against an analytic
  latitude-distribution integral: 1.11 vs 1.08 % time in view at 21.3°). **New instrument "Why the crew floats":**
  altitude slider 150–2,000 km → speed, lap time, laps/day, gravity vs surface (NASA's "about 90 percent"),
  fall per second (= g_local/2), weight on a tower; Earth and orbit drawn to scale.
- **CH6 experiment cards** rewritten where they overclaimed, with sources.
- **CH7/CH8 Mir** facts corrected; timeline reordered; uncited 2000 "last crew" entry replaced by the sourced
  1989–1999 continuous-habitation record.
- **CH9:** stage captions rewritten from ESA's reconstruction. **New instrument "The braking burns, by the numbers":**
  apogee/perigee/target sliders and presets for Mir's three real burns and the ISS; computes the ideal single apogee
  burn and compares it with what Mir flew. **New subsection "The ISS will end the same way"** with dated status and a
  **new boost-vs-deorbit instrument** (Hohmann transfer from 415 km) reproducing NASA's 760 m/s figure.
- **CH10:** legacy "Gateway & beyond" replaced by commercial stations (NASA's stated transition); links to SALUTE and
  PALACE. Cross-links also to SLINGSHOT (CH2) and DEBRIS (CH9).
- **References:** 3 (two Wikipedia) → 14 primary/official sources, numbered in order of first use.
- **Accessibility:** 44 px targets (buttons, tabs, stage buttons, module chips, timeline dots via 44 px wrapper
  buttons), sliders 28 px tall hit area + `aria-valuetext`, keyboard access for SVG module hotspots (Enter/Space),
  module chips are now buttons, expandable experiment cards are `role=button` with `aria-expanded`, `aria-pressed` on
  toggles, `aria-live` status boxes, chart `aria-label`s switch with the language (`data-aria-en/ru`), floating-object
  animation off under reduced motion, `--mid` darkened from #7a7a74 to #63635d for contrast, select at 16 px (no iOS
  zoom). Chapter labels unified to "/ 11" (lede still "Ten chapters": hand-made pages don't count REFERENCES).
- CSS for the new instruments (`.sim-wrap`, `.ctl`, `.btn`, `.readout-*`, `.status`, `.note`, range styling) copied
  from `parabola-mirrors-and-dishes.html` into this page's `<style>`.

## Facts corrected (old → new, source)

| Where | Old | New | Source |
|---|---|---|---|
| CH3 | "TRUSS SPAN 109 m" | 109 m **end to end** | [1] NASA facts |
| CH3 | solar power "~215 kW" | **75–90 kW** (8 arrays) | [1] |
| CH3 | "16 pressurised modules" (uncited) | pressurised volume **1,005 m³** | [1] |
| CH3 | crew "7–8" | usual crew **7** | [1] |
| CH3 | "Fifteen more major elements … the largest cooperative engineering project ever flown" | uncited count and superlative removed | — |
| CH3 | Zvezda "began life as a backup Mir core" | "its design comes straight from Mir's core module" (lineage only) | — |
| CH4 | Ku-band "only brief windows of signal each orbit" | TDRS relays give near-continuous contact | [3] |
| CH5 | "92.68 min/orbit" | **92.9** min at 415 km (computed) | [2] for altitude |
| CH5 | "27,600 KM/H GROUND TRACK" | 27,580 km/h **orbital speed** (ground-track speed is lower) | computed |
| CH5 | Moscow "frequent ground-track crossings" | the track never reaches 55.8°; max elevation ≈ 39° | computed |
| CH5 | Nairobi/Singapore "crossed on a large share of orbits" | removed (track density is *lowest* near the equator); computed pass counts instead | computed |
| CH6 | twins: changes in "gut microbiome … most reversed within months" | most measures normal within six months; some immune/DNA-repair genes not | [5] |
| CH6 | protein crystals "used in the design of treatments for cancer, Parkinson's, and muscular dystrophy" | projects incl. Keytruda and LRRK2 — aimed at better drugs, not proven treatments (no Duchenne source found) | [6] |
| CH6 | cool flames "cannot exist under Earth gravity" | invisible cool flame kept burning after the visible flame went out, ~200–540 °C, unexpected | [7] |
| CH6 | ECOSTRESS "mounted on the truss … feeds early-warning systems" | on Kibo's exposed facility (July 2018), ~70 m, different times of day | [8] |
| CH7 | "fifteen years, twice its planned lifetime" | **three times** its five-year design life | [9] |
| CH7 | "28 long-duration crews from twelve countries" | 28 long-duration expeditions; 125 cosmonauts and astronauts from 12 countries | [10] |
| CH7 | core launch "February 20" | **19 Feb 1986** (20 Feb Moscow time) | [10], [11] |
| CH7 | Priroda docks **1998** (timeline) | **1996** (module panel already said 1996) | [11] |
| CH7 | 2000 "final resident crew leaves in June" (uncited) | replaced by 1999 entry: continuous habitation Sep 1989 – Aug 1999 | [10] |
| CH8 | "six pressurised compartments docked around a single node" | five research modules 1987–1996, most around the core's forward node | [11] |
| CH8 | Spektr "partially depressurised" | punctured and sealed off | — |
| CH9 | "By 1999 … failing faster than crews could repair them" | autumn-2000 funding failure → RKK Energia decision | [12] |
| CH9 | orbit "350–400 km" | ~300–340 km at end of 2000, decayed to ~220 km before the burns | [11] Fig. 3, §1 |
| CH9 | "drag and small burns" to lower the orbit | drag alone, then three burns on 23 Mar: −9.27, −10.4, −28.0 m/s, perigee to ~80 km | [11] Tab. 3 |
| CH9 | "137-tonne structure … breakup around 100 km" | **135 t**; first pieces 110–100 km, main structure 90–70 km | [11], [12] |
| CH9 | "near Point Nemo" | impact zone ±2,500 km along track centred near **40° S, 160° W** (≈3,000 km from Point Nemo) | [11] Fig. 9–10 |
| CH10 | "2030s+ Gateway & beyond" | commercial stations (NASA's stated transition) | [13] |

## Sources per new number

- 415 km, >430,000 kg, 51.6°, 1–2 yr life without reboost, 51 yr vs <4 yr impact interval, through ≥30 Sep 2030 —
  NASA ISS Deorbit Analysis Summary [2].
- "About 90 percent" of surface gravity at 200–250 miles — NASA "What Is Microgravity?" [4]; model gives 90.6–88.5 %.
- Mir burns and orbits — Klinkrad et al. 2002, ESA SP-498, Tables 2–3 (scanned PDF read page by page) [11].
- Breakup heights 110–100 / 90–70 km — RussianSpaceWeb pre-entry plan [12].
- USDV contract (26 Jun 2024, up to $843M), partner commitments — NASA release [13].
- 57 / 120–140 / 760 m/s — NASA transition FAQ [14].
- Everything else on the instruments is computed (GM = 398,600.4418 km³/s², R = 6,378.137 km, g₀ = 9.80665).

## Assumptions and limitations

- Two-body Kepler orbits, spherical Earth, no drag (labelled on every instrument).
- The ideal deorbit burn is a single impulse exactly at apogee, so it is a **lower bound**: Mir's real burns were
  5.6 / 9.5 / 22.9 m/s ideal vs 9.27 / 10.4 / 28.0 flown, because they also placed the perigee over the target
  (burn 1 also swung the perigee ~180°). The page says so.
- "57 m/s ⇔ final burn from ~241 km to a 50 km perigee" and "120–140 m/s ⇔ 633–670 km", "760 m/s ⇔ 2,000 km" are
  this model's inferences; NASA does not state those altitudes. The 2,000 km match (760.4 m/s) is exact enough to
  suggest NASA used the same Hohmann calculation. Both notes say "this model's inference".
- Pass counts are above 10° elevation, day or night (not naked-eye visibility); J2 precession ignored (it shifts
  timing, not the long-run average).
- ESA's altitudes are mean altitudes from TLE elements; the burn presets use them directly.
- The cannonball's "mountain" is drawn exaggerated (100 km is 1.1 px at this scale).

## Unverified / judgment calls

- Module launch years in the ISS schematic (Zarya/Unity 1998, Zvezda 2000, Destiny 2001, Columbus 2008, Cupola 2010)
  and Kibo "largest single module" are standard history but not individually cited.
- Shuttle–Mir "1995" entry and the 1997 fire/collision details are unchanged and uncited.
- The ESA paper counts 71 cosmonauts and astronauts; NASA's 2021 article says 125 (probably counting visits). The page
  uses NASA's figure with NASA's wording.
- ISS end-of-life status is dated "as of 10 October 2026" and based on NASA's 2024 documents; Russia's own station
  plans and any 2025–26 changes to the commercial-station programme were **not** verified and are not stated.
- The ADS abstract page for [11] returns 405 to scripts; the PDF link used in the references returns 200.
- No screenshots taken (left for the central pass); 390 px layout reasoned from the CSS only.

## Cross-links added

SLINGSHOT (CH2), DEBRIS (CH9), SALUTE and PALACE (CH10).

## Response to review (REVIEW.md, 2026-10-11)

Verdict was APPROVE-WITH-CHANGES; all 5 MUST-FIX items applied. `check-all.sh iss-and-mir` → ALL OK
(errors [], brokenAttrs 0, missingRu 0, unstyled [], 15 refs = max cite 15, 62 PASS incl. 8 new review checks);
`node --check` passes.

**MUST-FIX**
1. CH5 pass status: "bunch up … then pause" replaced — passes above 10° come every day, in runs on consecutive
   orbits; only naked-eye-visible passes come and go over weeks (EN/RU). Check added.
2. ISS status: Russia agreed in July 2026 (Bakanov–Isaacman, Baikonur) to support operations through 2030; NASA
   confirmed the account. New ref [14] SpacePolicyOnline, 16 Jul 2026 (verified by fetch). Worded as "agreed in July
   2026 talks … NASA confirmed the account" — not "signed", not "in principle" (the article says neither). Ref [13]
   note now labels "through at least 2028" as the June-2024 position. The NASA-transition FAQ moved to [15].
3. CH9 stage 05: 40° S, 160° W is now ESA's **reconstructed** impact point inside a ±2,500 km footprint (EN/RU and
   ref [11] note). The planned 44.2° S, 150° W was not added (it comes from RussianSpaceWeb and I did not re-verify it).
4. Ref [7]: the NASA blog URL now redirects to the blogs index. Replaced with NASA SVS "Great Balls of Fire"
   (svs.gsfc.nasa.gov/11318), which states the 2,200–3,100 °F ball flame and the 400–1,000 °F cool flame — the
   page's 200–540 °C is that range converted. (The archived blog itself says cool flames for n-heptane appear "just
   above 600 °F", consistent with the range.) Card text now says "faint" rather than "invisible" (SVS: "with no
   flame visible, unused fuel … begins to glow").
5. RU CH7: the name explanation rewritten (мир = peace and world) instead of «покой»/«вселенную».

**SHOULD/NICE applied:** deorbit decision attributed to RKK Energia and the Russian government [11][12]; Keytruda
framed as uniform crystals for an injectable formulation; Twins "Mars transit crews" softened; Canadarm2 (CSA)
added to the module map with a "map stops at 2010" note; Newton ticks at true positions (0/42.7/78.8/100 %);
"air is ignored, as in Newton's drawing"; CH2 lede (orbit / escape Earth / escape Sun); HUD "340 → 0 KM" and
"~415 KM"; boost status says "only X of 57 m/s" below 57 m/s; max elevation shows a decimal below 15°;
experiment cards now `<h4><button aria-expanded aria-controls>` with `hidden` bodies; language toggle 44 px +
`aria-pressed`; RU: МОЩНОСТЬ СОЛНЕЧНЫХ БАТАРЕЙ, «Купол», gravity sentence, «с разрешением», «ядро» in verdicts,
«пристыкованный к «Миру» «Прогресс»», «выдал импульс», «сведения станции с орбиты», «где она продержится»,
no-break spaces in static RU numbers. Coordinator's screenshot notes: cannonball path now blue 2.4 px over a
light-grey Earth; burn chart breakup label moved to the bottom-left of the band and the legend above the plot.

**Declined / not done:** Mir timeline wrappers min-width 44 px (would force horizontal scroll at 390 px; current
overlap still passes WCAG 2.5.8); the EO-28 June 2000 entry (no primary source fetched); Nauka (2021) on the map
(only noted that later modules are omitted); SVG text size at 390 px (readouts carry the same data).
