# REVIEW — QUAKE (InSight & the inside of Mars)

**Date:** 2026-11-12 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes)
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. There are seven MUST items, all applied. Most are sourcing problems the author had flagged; one is a factual overstatement about wind cleaning, one is a model label. Every computed number re-derives independently.
`./check-all.sh quake-insight-mars` → **ALL OK** (errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 40/40, timeline 7, unstyled [], 67 checks PASS, 0 FAIL).

---

## 1. Planetary scientist / physicist — APPROVE WITH CHANGES

Hand re-derivations (own arithmetic, not the page's code):

| Quantity | Reviewer | Page |
|---|---|---|
| Hanks–Kanamori in SI: log M₀[dyn·cm] = 1.5 M + 16.05 → N·m | 1.5 M + 9.05 | ✔ |
| M₀(4.7) | 1.259 × 10¹⁶ N·m | ✔ |
| Moment ratio 4.7 vs 4.2 | 10^0.75 = 5.62 ("five times", Kawamura) | ✔ |
| Circular crack a at 1 MPa | (7·1.259e16/16e6)^⅓ = 1,765 m | ✔ |
| Straight-ray shadow edge 2 arccos(rc/R) | 114.6° (1,830), 121.7° (1,650) | ✔ |
| Shadow-cap share (1 − cos 65.4°)/2 | 0.292 | 29 % ✔ |
| Hull friction μ K₀ ρ g π D L²/2, φ 35°, L 0.40 m, Mars | 0.4314 · 0.4264 · 1211 · 3.73 · π · 0.027 · 0.08 = 5.64 N | 5.6 N ✔ |
| (r_peri/r_aph)² | (1.3814/1.6660)² = 0.687 | 31 % less ✔ |
| Khan 2023 1,675 + 150 km | 1,825 km, inside 1,830 ± 40 | ✔ |

- The physics in the text is sound. The core-radius history (1,830 ScS → RISE 1,835 → SKS 1,780–1,810 → 1,675/1,650 under a molten layer) matches the papers. The full texts of Samuel 2023 (PMC10600000: "1,650 ± 20 km … BML set Rc ≈ 170 km smaller") and Bi 2025 (PMC12408336: "613 ± 67 km, … jump of around 30 %"; "Most Martian seismicity is at … 27°–40°") were re-read.
- **Status of the core as of 2026-11-12:** I found no 2026 Matters Arising, comment or independent confirmation of the inner core. News items dated January 2026 only re-report Bi/Sun et al. 2025. "Working answer ~1,650–1,675 km, inner core an open question" stays right. The NSSDC fact-sheet footnote is unchanged.
1. **MUST — "No gust of wind ever cleaned them" is an overstatement.** On 22 May 2021 (sol 884) the arm trickled sand beside a panel so the wind would carry dust off, and JPL reports about 30 Wh/sol gained (JPL, 3 Jun 2021, https://www.jpl.nasa.gov/news/nasas-insight-mars-lander-gets-a-power-boost/). The May 2022 release says only that a *dust devil* never came. *Fixed* (EN + RU, text and instrument status): "No dust devil ever swept them clean …", plus a sentence on the 2021 sand trick, new ref [40], and a check that 22 May 2021 = sol 884.
2. NIT — Line 45, "The hard distances in this story are tiny ones", reads oddly. It means the hard *measurements* are tiny displacements. Left as is.

## 2. Mathematician (models, units, numerics, the checks) — APPROVE

- The S1000a fit is two equations in two unknowns (V_P, V_S) per core radius, so it reproduces S1000a exactly by construction. The page says so ("by construction"), and the honest out-of-sample test is S0976a (SS−PP within 1.1 %; SKS−PP misses by ~50 s, stated). Good practice.
- The bisection in `fitMantle` scans V_S on 3.0–5.0 km/s and then bisects 60 times. It converges for every preset, and a check covers 1,650/1,675/1,795/1,830.
- The dust τ is fitted to two points (sol 1 and 17 May 2022). The October 2022 point (359 vs 425 Wh, −16 %) is an out-of-sample comparison and is shown "not fitted". ✔
- Units are consistent throughout (N·m, MPa, km/s, Wh). The sol/date mapping (landing epoch + 24.6597 h) reproduces six published sol–date pairs within one sol, and now seven (sol 884).
- NIT: sol 884 comes out as 883.4. This is the documented "within one sol" behaviour, because the landing local time is not modelled.

## 3. Historian / fact-checker — APPROVE WITH CHANGES

Opened today (2026-11-12):
- JPL retirement page: 1,319 marsquakes; last contact 15 Dec; image 11 Dec = sol 1,436 ✔
- JPL mole page (no longer 404): 14 Jan 2021; "500 additional hammer strokes on Saturday, Jan. 9"; "Since Feb. 28, 2019"; "principal investigator, Tilman Spohn of DLR"; friction ✔. [30] is now confirmed first-hand.
- JPL May 2022: 5,000 Wh / oven 1 h 40; 500 Wh / 10 min; 25 % → 1,000 Wh; arm parked ✔
- NASA Science first-quake page: CNES, "principal investigator at IPGP" (unnamed) ✔
- AIAA reprint: Hoffman quote "4,588 watt-hours we produced during sol 1" ✔. It credits space.com, not NASA. The JPL original (`nasas-insight-lander-sets-solar-power-record`) still returns 404.

Findings:
1. **MUST — Lognonné as SEIS PI had no source that names him.** *Fixed:* new ref [37], CNRS News, 24 July 2021 (https://news.cnrs.fr/articles/insight-probes-the-martian-interior): "… a Professor at the University of Paris, and Principal Investigator for the SEIS seismometer". The text now cites [4][37].
2. **MUST — "quiet evening and night hours" was cited to Giardini et al. 2020, which nobody had opened.** I tried the Nature Geoscience paper, the HAL copy (Anubis block, and a 9 MB download stalled) and the IPGP author copy (stalled), and could not open it. *Replaced:* ref [8] is now JPL, 22 Sep 2021: "InSight's seismometer usually finds marsquakes at night, when the planet cools off and winds are low". The text was reworded to match (EN + RU). JPL, 1 Oct 2019 ("twilight hours are one of the best times") also supports it.
3. **MUST — "S0128a" was inferred, not quoted.** Searches of the web, Sita & van der Lee 2022 and the MarsQuakeNet paper found no occurrence. *Removed.* The naming sentence now uses only S1222a, which Durán et al. [28] and JPL support.
4. **MUST — 1,319 presented as final.** The Marsquake Service's 2025 abstract (Clinton et al., EGU25-13152) says earlier catalogue versions listed over 1,300 events. It also says the reference catalogue being finalised "includes over 1900 events with improved locations and new interpretation types". 1,319 stays as NASA's end-of-mission count, now labelled as such, with ref [38] (EN + RU). I found no journal publication of the reference catalogue.
5. **MUST — Jáky named without a reference.** *Fixed:* ref [39], Mayne & Kulhawy 1982, J. Geotech. Eng. Div. 108(6) 851–872, doi 10.1061/AJGEB6.0001306 (verified on Crossref). It is the standard validation of K₀ = 1 − sin φ for normally consolidated soil. The eq-note now gives the formula and cites [39].
6. SHOULD — 4,588 Wh rests on a secondary reprint [31]. The figure and the quote match several outlets, and NASA's later "around 5,000 Wh" agrees. Replace it if a NASA URL resurfaces.
7. NIT — The second-largest event: Kawamura says "five times the moment of the second-largest". The page attaches that to S0976a, which is consistent with the M4.2 catalogue value.

## 4. Science communicator + Educator — APPROVE WITH CHANGES

- The chapters teach the method, not just the results: one station, known impact sources as calibrators, and core size trading off against mantle speed. The closing line ("That is not a failure of the method. It is the method.") is earned.
- The status text says where the toy fails (S0976a SKS). That is good teaching.
1. **MUST — model labels inside the instruments.** The ray-tracer's "Toy model" disclaimer sat only in the note under the figure, and its readouts (P, S, SKS times) looked like Mars predictions. *Fixed:* the SVG now carries "TOY MODEL · STRAIGHT RAYS" / «УЧЕБНАЯ МОДЕЛЬ · ПРЯМЫЕ ЛУЧИ». The aria labels begin "Toy model:" / «Учебная модель:», and the power chart's begin "Model:" / «Модель:». The power instrument already says "model with dust" and "MODEL ENERGY". The mole eq-label says "(MODEL)". A check was added.
2. SHOULD — The ray readout labels "P", "S" could read "P (toy)". This is redundant now that the figure is labelled. Not applied.

## 5. Designer + Accessibility — APPROVE

- Read from markup and CSS. All sliders have `<label for>`, live readouts and `aria-valuetext` in EN and RU (checked). Preset groups are `role=group` with `aria-pressed`. `.btn` and range inputs have a 44 px minimum, and coarse pointers get 26 px thumbs. Focus-visible outlines are present. There is no animation, so reduced motion is not an issue.
- 390 px: the SVGs use a viewBox and scale. Below 520 px the small text is enlarged to 13 px and tiny text to 11 px. The new top-right SVG label (end-anchored at x 472, y 14) clears the planet disc (the disc reaches y 38 at x 312) and the "InSight" label at x 240.
- NIT: the power chart's "May 2022: ~500" label is offset 24 px up so it does not collide with the curve. That is fine at both widths.

## 6. Russian editor — APPROVE WITH CHANGES

- The Russian is natural technical prose, with correct terms (волны Лява, борозды Цербера, равнина Амазония, Фарсида, сброс напряжений, коэффициент бокового давления покоя). EN/RU parity holds paragraph by paragraph, including every new sentence.
1. **SHOULD (applied) — Tempe Terra is «Земля Темпе»** in Russian planetary nomenclature, not «область Темпе». Fixed in the text and in the note to ref [28].
2. NIT — «ставят в шахты глубиной около 1,2 м» for vaults: «в подземные камеры» would be closer. Left as is.

## 7. Ethicist — APPROVE

- Credit is fair and international: CNES/IPGP, Imperial, ETH, MPS, JPL, DLR; Lognonné, Spohn, Banerdt, Smrekar; the USTC team for the 2025 inner core, with the doubts attributed. The mole failure is told plainly and without blame, along with what it did yield. The core revision is framed as science working, not as an error.
- The wind-cleaning fix also gives due credit to the team's 2021 improvisation.

---

## Consolidated MUST (all applied)
1. Wind cleaning overstated → dust-devil wording + 2021 sand trick, ref [40], sol-884 check.
2. Lognonné PI → ref [37] CNRS News 2021.
3. Night-time detection → ref [8] replaced by the opened JPL 2021 page, text matched.
4. S0128a → removed.
5. 1,319 → labelled as the end-of-mission count; >1,900 in the 2025 reference catalogue, ref [38].
6. Jáky → formula given, ref [39] Mayne & Kulhawy 1982.
7. Toy and dust models labelled inside the figures and their aria labels.

## Open SHOULD
- [31] 4,588 Wh is from a secondary reprint (the JPL original is 404).
- The Marsquake Service reference-catalogue count (>1,900) is from a 2025 conference abstract. Update it when the catalogue paper appears (Freshness row added).
- Optionally add "(toy)" to the ray readout labels.
