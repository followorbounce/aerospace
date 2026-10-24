# REVIEW — SWARM (Starlink, OneWeb & the megaconstellations)

**Date:** 2026-10-23 · **Panel:** independent cross-disciplinary review (AGENTS.md: Peer Review and Cross-Disciplinary Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. The geometry, latency and shadow models re-derive cleanly, and an independent Monte Carlo confirms the streak counts. There are seven MUST-FIX items. The main one is that the page compares its 550 km crossover with Handley's "about 3,000 km" without saying that Handley simulated a 1,150 km constellation. The others are a streak status that reads "one exposure in 1" when several streaks are expected, three numbers that had no primary source or no source at all (Iridium 8.2°, the 210 km perigee, fibre index 1.47), two weak sources (Wikipedia for the Globalstar bankruptcy and for Rubin), and SVG and button-group labels that have no Russian version. All seven were fixed in the sources (see "Response to review" in NOTES.md).

Reviewer scripts and downloaded sources are in `/tmp/claude-1000/-home-none-git/98d54dca-fa8e-4aef-8d4f-2f576b4a6497/scratchpad/review-swarm/`:
- `phys.py`: geometry, streets, GEO and crossover.
- `mc.py` / `mc3.py`: 3-D Monte Carlo of streaks on a sphere.
- `mc2.py`: flat-frame Monte Carlo.
- `probe.js`: jsdom probe of the page at slider extremes.
- `dl/`: Handley 2018 PDF, FCC 21-48 PDF, Pratt et al. 1999 PDF, Globalstar 8-K, McDowell stats and conlist as fetched today.

After the fixes, `./check-all.sh swarm-megaconstellations` returns **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 25/25, timeline 13, 55 checks PASS).

---

## 1. Physics & Mathematics + Statistician — APPROVE WITH CHANGES

| Quantity | Reviewer | Page |
|---|---|---|
| Iridium λ at 780 km / 8.2° | 19.925°; cap 15.30 M km² | 19.9°, 15.30 ✔ |
| Streets 780 / 8.2 | 6 × 11 = 66 (c = 11.53°) | ✔ |
| Iridium mask range giving 6 × 11 | **7.0°–8.2°** (6.9° → fewer, 8.3° → 72) | the note said "at exactly that angle" (see finding 3) |
| Iridium plane spacing λ + c; seam 2c | 31.45°; 23.05° | Pratt et al. 1999: 31.6°, 22° ✔ (now checked) |
| OneWeb 1,200 / 40 | 12 × 22 = 264 | P = 12 ✔ |
| Starlink 550 / 25 | 15 × 24 = 360; honeycomb 222.7 | ✔; 9,726 / 360 = 27× ✔ |
| H_GEO; 4h/c | 35,786.03 km; 477.48 ms | ✔ |
| London–NY great circle; fibre RTT; laser RTT | 5,570.4 km; 54.63; 47.71 ms | ✔ |
| London–Paris fibre / laser RTT | 3.37 / 9.83 ms | ✔ |
| Crossover, vertical path: 340 / 550 / 1,150 km | 1,632 / **2,867** / **7,945** km | 2,867 ✔ (but see finding 1) |
| Crossover, slant legs (ε 25°–40°): 550 / 1,150 km | 529–986 / 1,226–2,590 km | (shows that the vertical model is pessimistic) |
| Shadow height at zenith, Sun −18° / −12° | 327.9 / 142.3 km | ✔ |
| Rubin midnight depression, Dec / Jun | 36.32° / 83.20° | ✔ |
| Uniform density, 12,000 at 550 km, elev. 30° / zenith | 0.00991 / 0.00184 per deg² | ✔ |
| Streaks, zenith, 12,000, 550 km, 3.5°, 30 s | formula 0.1702; flat MC 0.1695; sphere MC 0.163 ± 0.003 | 0.170 ✔ |
| Streaks, elev. 60°, 10,000, 3.5°, 30 s | MC 0.178 ± 0.003 | 0.1757 ✔ |
| Streaks, elev. 30°, 12,000, 10°, 30 s | MC 1.86 ± 0.01 | 1.839 ✔ |
| Dec 2025–May 2026 days; per day | 182; 1,138.2 | ✔ |

- **Cylindrical-shadow model re-derived.** A point P is lit if it is on the day side (P·ŝ > 0) or farther than R from the anti-Sun axis. At the zenith this gives H = R(sec d − 1). The page's sky integral reproduces N(1 − R/r)/2 within 0.5 %.
- **Streak formula.** σ(A + vT·W̄) with W̄ = perimeter/π (Cauchy) is exact for random headings. The 3-D sphere Monte Carlo agrees within 1–4 %. Its small low bias at the zenith comes from my 0.25 s time step clipping grazing chords.
- **checks.js** tests published values: Iridium 6 × 11, OneWeb's 12 planes, the GEO altitude, McDowell's 0.005–0.01 per deg², Rubin's 9.6 deg², and the arithmetic of the snapshot sums. The crossover check was the exception (finding 1).

Findings:
1. **MUST — the Handley comparison mixes two altitudes.** Handley's full text (downloaded) says: "In Starlink's initial phase, 1,600 satellites in 1,150 km altitude orbits". His result of "beyond about 3,000 km" is therefore for 1,150 km. Our idealised straight-up path gives 2,867 km at 550 km and **7,945 km at 1,150 km**. The agreement the check claimed, "≈ 2,900 km (Handley: about 3,000 km)", is a coincidence. The vertical path is pessimistic: slant legs at ε = 25–40° give 1,200–2,600 km at 1,150 km, which brackets Handley. Fix: say what Handley's constellation was, state that the instrument's model is pessimistic and give both crossovers (EN and RU), relabel the check, and add a 1,150 km check.
2. **MUST — the streak status contradicts the readout when n ≥ 1.** With the Sun up, 100,000 satellites and the 10° field, the readout shows 6.16 streaks while the status says "About one exposure in 1 catches a streak". Fix: when n ≥ 1, say "About N streaks cross every exposure" (EN and RU), and add a check.
3. **SHOULD — "returns 6 × 11 at exactly that angle"** reads as if the angle were unique. 6 × 11 holds from 7.0° to 8.2°, so 8.2° is the *steepest* mask that the 66 satellites can still serve. This is a better consistency argument, so state it (applied with finding 4 below).
4. **NICE** — the Rubin note gave the depth as "|φ + δ| − 90°", which is the (negative) altitude. The depth is 90° − |φ + δ|. Applied.
5. **NICE** — the McDowell density check compares a single uniform shell with McDowell's multi-shell model. It is acceptable as an order-of-magnitude anchor, and the note already says that real shells crowd towards their inclination latitude.

## 2. Historian / fact-check — APPROVE WITH CHANGES

Opened and confirmed today:
- **FCC 21-48 (PDF).** Adopted 23 April 2021. "Earth station elevation angles as low as 25 degrees". 1,584 at 550 km/53° in 72 × 22; 1,584 at 540/53.2°; 720 at 570/70°; 348 + 172 at 560/97.6° ✔. The 1,584 were "previously authorized to operate at an altitude of 1,150 km", which confirms the altitude behind finding 1.1.
- **OneWeb 40°.** ¶23: "Kepler's user terminals operate with a minimum elevation angle of 10 degrees, while OneWeb's operate with a minimum elevation angle of 40 degrees, so Kepler argues…" ✔. This is the FCC summarising Kepler's argument, so the wording should say so (SHOULD, applied).
- **McDowell (fetched 2026-10-23).** Both pages still carry the data of 15 October 2026. Stats: total 13,015 / down 1,861 / disposal complete 1,508 / in orbit 11,154 / operational 9,726; Group 4-7: 49, early deorbit 38 ✔. Conlist: OneWeb 636/18/6/660, planned 588; Kuiper 355/398/3,232; Xingwang 213/261/960 + Xingwang2 12,992; Qianfan 178/258/16,000; Starlink planned 34,864 ✔. The counts are still current and correctly dated "15 October 2026".
- **Iridium 8.2°.** Pratt, Raines, Fossa & Temple, "An Operational and Performance Overview of the IRIDIUM Low Earth Orbit Satellite System", *IEEE Communications Surveys* 2(2), 1999 (PDF opened): "The minimum elevation angle for an earth station is 8.2 degrees"; "co-rotating planes spaced 31.6 degrees apart and counter-rotating planes … 22 degrees apart" ✔. This is peer-reviewed, not an Iridium document but an authoritative one, and its plane spacings match our streets solution.
- **210 km perigee.** SpaceX's 8 February 2022 update, reposted verbatim by TelecomTV on 9 February 2022: "with a perigee of approximately 210 kilometers above Earth"; drag "up to 50 percent higher than during previous launches"; "up to 40" to re-enter ✔. The JSWSC full text still returns 403.
- **Handley 2018** (full-text PDF): "≈ 47% higher [than] in glass", which supplies the fibre index of 1.47 ✔; "about 3000 km" ✔; 1,600 satellites at 1,150 km.
- **Globalstar.** Form 8-K filed with the SEC on 19 February 2002: "On February 15, 2002 … Globalstar, L.P. … filed voluntary petitions under Chapter 11" ✔.
- **Rubin "Key Numbers"** (rubinobservatory.org): 9.6 deg², 8.4 m, 30 s visit exposure, latitude −30:14:40.68 ✔. It replaces both Sky at Night and Wikipedia.
- **Space.com, 15 July 2026** (datePublished confirmed): 207,152 (Dec 2025–May 2026), 148,696 the half-year before, "more than 40 … per year between June 1, 2025 and May 31, 2026", "3 in 10 million" ✔.
- **Amazon:** "On November 13, 2025, Project Kuiper was renamed as Amazon Leo." ✔
- **Latency.** No newer official figure than June 2025's 25.7 ms was found (Starlink's network update). Independent 2026 indices are not comparable, because they cover all hours and self-selected users. The text already dates the figure; "latest published figure" was added (SHOULD, applied). The laser figures are dated "January 2024" in the text and in the timeline ✔.

Findings:
1. **MUST — Iridium 8.2° had no source and was described as "not from an Iridium document".** Cite Pratt et al. 1999 as [21] and rewrite the note (EN and RU), including the matching plane spacings. Add a check against 31.6° / 22°.
2. **MUST — the 210 km perigee was cited to [12][9], neither of which states it in an accessible form.** Add SpaceX's update (TelecomTV repost) as [25] in chapter 3 and in the 2022 timeline entry.
3. **MUST — weak sources.** Replace [5] (Wikipedia, Globalstar) with the SEC 8-K. Replace [20] (Sky at Night) and [21] (Wikipedia, Rubin latitude) with Rubin's "Key Numbers" page as [20], which frees [21] for Pratt et al.
4. **MUST — the fibre index 1.47 was uncited.** Cite Handley [14] ("≈ 47% higher").
5. **SHOULD** — OneWeb 40° is the FCC's summary of Kepler's filing. Reword to "summarising a rival operator's filing" (applied).

## 3. Science communication & Education — APPROVE

The thesis "coverage is cheap, capacity is not" is set up in chapter 2 by the instrument, paid off in chapter 3, and closed by the quote. The latency instrument teaches why lasers beat glass at long range and why fibre wins London–Paris. The sky map makes the rising shadow visible. Captions match the instruments, apart from §1.2, which is now fixed. As the coordinator asked, a RELAY link now sits where chapter 4 introduces GEO's 477 ms. It explains why that orbit was worth the delay, in EN and RU, in the same link format as DEBRIS.

1. **SHOULD (open)** — the default sky state (Sun −18°, elevation 60°, azimuth 180°) points into Earth's shadow, so the first view shows "0.00 streaks". This is physically right and instructive, but azimuth 0° (towards the Sun) would show streaks on first view. It is left to the author.

## 4. Design, UX & Accessibility — APPROVE WITH CHANGES

New captures were taken at 390 px with the 28,000 px window (shot.sh's new third argument), so the bottom of the page is now visible: references [15]–[25] render cleanly with no overflow. Also fine:
- Every slider has `aria-valuetext` with units, in EN and RU.
- Buttons have `aria-pressed`.
- Statuses are `aria-live`.
- `.btn` and range inputs are 44 px.
- Focus-visible outlines are set.
- The SVG text is 13 px under 520 px.
- There is no animation, so reduced motion does not apply.

1. **MUST — the role="img" SVGs and role="group" button rows had English-only `aria-label`s.** In RU a screen reader announced English. Fix: `data-aria-en`/`data-aria-ru` on all seven, applied in `renderAll()` as GLOW does, plus a check.
2. **SHOULD (open)** — at 390 px the shell table scrolls sideways, and the "Operational" column (the key number) starts off-screen. Consider dropping the inclination column under 520 px or abbreviating the headers.

## 5. Linguist (Russian) — APPROVE

The Russian is natural and the terms are correct: угол места, пятно обзора, наклонная дальность, НОО/ГСО, прозрачный ретранслятор, воздушная масса. Commercial names stay Latin and the Chinese names take «»; both follow DEBRIS. Four-digit numbers are unspaced and five-digit numbers spaced, consistently in the body and in `num()`. Plural agreement is right in the readouts («60,0 градуса», «60 градусов»). The new strings follow the same rules: РЕТРАНСЛЯТОРЕ is in the prepositional, like «в ОБЛОМКАХ».
1. **NICE (open)** — «Пресеты для Рубин» → «Пресеты для обсерватории Рубин» reads better.

## 6. Ethicist — APPROVE

The Chinese, European and US operators are treated neutrally. The bankruptcies are factual and sourced. The astronomy and radio-interference harms are stated with their numbers and not overstated: "faint enough to correct the artefacts, though the trails still remain". Filings are labelled "not promises". The SpaceX collision-avoidance figures come from SpaceX's own report and are attributed to it.

---

## Consolidated MUST-FIX (all applied)
1. Handley's ~3,000 km is for 1,150 km. State it, call the instrument's model pessimistic, give 2,900 km at 550 km and about 8,000 km at 1,150 km, and fix and add checks (§1.1).
2. The streak status reads "one exposure in 1" when n ≥ 1. Give a count instead, and add a check (§1.2).
3. Iridium 8.2°: cite Pratt et al. 1999 [21], rewrite the note with the 7.0–8.2° range and the plane spacings, and add checks (§2.1, §1.3).
4. 210 km perigee: add SpaceX's update [25] in chapter 3 and the timeline (§2.2).
5. Weak sources: [5] becomes the SEC 8-K, and [20] becomes Rubin "Key Numbers", which also covers the latitude formerly cited to [21] (§2.3).
6. Fibre index 1.47: cite [14] (§2.4).
7. Russian `aria-label`s on the SVGs and button groups (§4.1).

## SHOULD — applied
OneWeb 40° framing (§2.5); "latest published" latency; the Rubin depth formula (§1.4); the RELAY sentence (requested by the coordinator).

## SHOULD — left open
The shell table at 390 px (§4.2); the default sky aim (§3.1); «обсерватории Рубин» (§5.1).
