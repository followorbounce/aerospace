# REVIEW — TOUCHDOWN (The new lunar landers, 2019–2026)

**Date:** 2026-11-12 · **Panel:** independent cross-disciplinary review (AGENTS.md, Cross-Disciplinary Review and Peer Review processes), per `_tools/WAVE8-REVIEW-BRIEF.md`.
**Overall verdict: APPROVE WITH CHANGES.** No lens blocks. Six MUST items, all applied in the sources. The page was rebuilt with `assemble.py`.

**Headline status check:** as of 12 Nov 2026, **no lunar landing attempt has happened since Resilience (5 June 2025 UTC)**. The page's claim holds.
- Chang'e 7 was postponed on 23 Aug 2026 and has no new date. Wikipedia lists it as "2027 (planned)".
- Blue Moon MK1 Pathfinder is "early 2027 at the soonest". New Glenn's pad was damaged in May 2026.
- IM-3: "first quarter of 2027".
- Blue Ghost M2: later in 2027.
- Griffin-1: NET November 2026 (Aerospace America, 15 Sept), but the Wikipedia CLPS table lists January 2027. It has not launched.
- No other lander (Chinese, Russian, Indian or Japanese) launched in the interval.

`./check-all.sh touchdown-commercial-lunar-landers` → **ALL OK**: errors 0, brokenAttrs 0, offStep [], missingRu 0, cites 36/36, timeline 7, **61 checks PASS** (was 56; 5 added by this panel).

---

## 1. Physicist / planetary scientist — APPROVE

Independent re-derivation (GM 4902.800 km³/s², R 1737.4 km):

| Quantity | Reviewer | Page |
|---|---|---|
| v_circ at 111.12 km | 1.6291 km/s | 1.629 ✔ |
| Periapsis speed at 15.24 km (a = 1800.58 km) | 1.6946 km/s = 6,100 km/h | ✔ |
| Hohmann deorbit Δv | 22.4 m/s | "~20 m/s" ✔ |
| Apollo-style lower bound (22.4 + 1694.6 + 140 × 1.62) | 1,943.8 m/s | 1.94 km/s ✔ |
| 1 − e^(−Δv/(305 g₀)) | 0.478 | ✔ |
| Hover per 1 % of mass, 305 s | 18.5 s | ✔ |
| 5 km free fall | 127.3 m/s, 78.6 s | ✔ |
| 3σ containment, 2-D Gaussian: 1 − e^(−4.5) | 0.9889 | 98.9 % ✔ |
| Tip-over criterion | ½v²z₀²/L² = g(L − z₀) → v = (L/z₀)√(2g(L − z₀)) | ✔ (point mass, I = mL²) |
| Apollo 11, hypot(2.1, 1.7) ft/s | 0.824 m/s | ✔ |

Notes:
- The angular-momentum lever arm z₀ = h cos θ + b sin θ is the vertical offset of the CoM from the downhill pivot, which is correct for a horizontal velocity.
- Vertical touchdown speed, which the model omits, would add a stabilising term on a downhill tip. The model note says "horizontal velocity only", which is honest.
- **NIT:** the descent budget's 20 km preset keeps Apollo's 140 s vertical phase. The note says so.

## 2. Mathematician (models, units, numerics, the checks) — APPROVE

- `checks.js` tests published values (NSSDC g and v_esc, TN D-7143/D-6850 numbers, the scorecard dates), not only the code against itself.
- The scorecard tallies are derived from the data array, so they cannot drift from the table.
- The synthetic crater field is seeded, so results are reproducible. 3,000 fixed samples give a Monte Carlo standard error ≤ 0.9 percentage points on the hazard probability. That is adequate for the instrument's qualitative message.
- **SHOULD (open):** print "±1 point (sampling)" next to the hazard percentage, or state the sample size in the readout. It is now stated only in the model note.
- Added checks:
  - Athena 12 h 45 min → "about 13 hours";
  - 6 mph / 2 mph → 2.7 / 0.9 m/s;
  - the date range of the scorecard.

## 3. Historian / fact-checker — APPROVE WITH CHANGES

Opened today and confirmed:
- **JAXA 25 Jan 2024:** 0:20 JST; ~55 m east; "approximately 10m or less, possibly about 3 - 4m"; one engine's thrust lost at ~50 m; "an attitude that could not generate power"; cells facing west ✔
- **AmericaSpace:** safety switch not disabled; NDL; 6 mph (50 % above expected); 2 mph (double the desired rate); a pad caught as a fulcrum ✔. But the 1.5 km is "from its intended landing site", not "from Malapert A" (see MUST 3.2).
- **SpacePolicyOnline IM-2:** "noisy" altimeter; 250 m (IM) vs > 400 m (NASA); shadowed crater; ended 12:15 a.m. CST = 12 h 45 min after landing ✔
- **Universe Today (ispace M2 review):** 42 m/s; LRF degraded in flight; installation error unlikely ✔. It gives no altitudes, so the author was right to leave them out.
- **AP/KSAT Chang'e 7:** "does not meet the launch conditions … cannot take place during the planned window this year" ✔. AP attributes this to the "China Manned Space Agency". The ref note reproduces AP faithfully; it is probably an AP error for CNSA (NIT, left as AP wrote it).
- **Aerospace America, 15 Sept 2026:** Mark 1 "first part of 2027"; IM-3 "first quarter of 2027"; Blue Ghost 2 later in 2027; Griffin-1 NET November ✔
- **Wikipedia CLPS (2026-11-12):** Griffin Jan 2027; IM-3 and Blue Ghost M2 early 2027; outcome labels IM-1 "partial failure", IM-2 "failure", Blue Ghost "first fully successful" ✔. It also shows the ispace/Draper CLPS-12 order cancelled in July 2026, which is not relevant to the page.
- **Link check:** 33 of 36 URLs return 200. Times of Israel and Spaceflight Now return 403 to curl (bot-blocking, not dead). **ABC News [33] returns 404** (see MUST 3.3).

Findings:
1. **MUST — Chang'e 4 does not fit "launched from 2019 on" / "set out between January 2019 and June 2025".** Chang'e 4 launched in December 2018 and landed on 3 Jan 2019. *Fixed:*
   - lede: "were on their way to a landing on the Moon";
   - scorecard intro: "every lunar landing mission flown from January 2019 on (Chang'e 4, already on its way when the year began, landed on 3 January [30])";
   - the scorecard status line and the og text reworded to match;
   - EN + RU. Check added.
2. **MUST — Odysseus "about 1.5 km from Malapert A".** The source says it settled in a crater near Malapert A, 1.5 km from its *intended site*. *Fixed* in ch. 6 and in the scorecard site cell (EN + RU).
3. **MUST — ref [33] URL is 404.** *Replaced* with the same AP wire on KSAT (200, text verified). NOTES freshness URL updated.
4. **SHOULD (applied) — Griffin-1 sources conflict** (NET Nov 2026 in [34] vs Jan 2027 in [35]). Both are now stated in ch. 7 and in the 2026 timeline row.
5. **NIT — IM-3:** [34] actually says "first quarter of 2027". "First part of 2027" is the article's phrase for Mark 1. The grouped wording is acceptable.
6. **Author flags:**
   - The preliminary causes for Beresheet, Luna-25 and IM-2 are labelled preliminary or "noisy readings" only. A search today found no final reports. Acceptable.
   - The ispace findings via news are acceptable. The two news sources agree with each other and with NASA's LRO pages.

## 4. Science communicator + Educator — APPROVE WITH CHANGES

The spine is strong: four physical questions, each with an instrument, and failures told by mechanism. The models are labelled:
- the descent budget as a "lower bound";
- the altitude filter as "Model, not ispace's software";
- the terrain as "Model on synthetic terrain, not a real site", with the 3σ reading called "this guide's simplification";
- the tip-over as a "Rigid body …" model with "illustrative proportions";
- the tall preset as ASSUMED, in its button label as well.

1. **MUST — SLIM "ended upside down [36]" stated as fact.** AP wrote only "appears to be upside down", and JAXA's release [15] says "an attitude that could not generate power from the solar cells". The scorecard row and the government-filter summary also said "landed upside down", and the ch. 6 fallback said "nose-down [15]", which [15] does not say. *Fixed:*
   - ch. 6 now quotes JAXA's wording [15] and adds "upside down, as the first pictures appeared to show [36]";
   - the row and the summary say "apparently upside down";
   - EN + RU. Check added.
2. **SHOULD (open) — teach the CoM.** The tip-over chapter would teach better with one sentence on why the CoM is assumed at half height, and on what a real dry vs wet mass would change. The model note already says "illustrative".
3. **NIT — "half of them built by companies".** SpaceIL is a non-profit and IAI is state-owned. Reworded to "half of them private missions rather than government ones" (applied with MUST 3.1).

## 5. Designer + Accessibility — APPROVE

Read from the markup and CSS; no screenshots were taken this round (see the desktop memory constraints).
- `.btn` and range inputs are at least 44 px tall. `:focus-visible` outlines are present.
- On coarse pointers the range thumbs are 24–26 px on a 44 px track.
- At ≤ 520 px the SVG text grows to 11–14 px.
- The scorecard table (min-width 760 px) sits in a `role=region` `tabindex=0` scroll container with a bilingual aria-label, so it scrolls horizontally at 390 px without making the page scroll horizontally.
- All 12 sliders have `<label for>` and `aria-valuetext`.
- The button groups have `data-aria-en/ru`. The charts have translated aria-labels, and a check enforces this.
- There is no animation (no rAF or timers), so reduced motion is not applicable.
- Outcome colours are paired with text labels; colour is not the only cue.

Findings:
- **NIT:** `OUT_COLOR.side` (#a8741a) in the timeline differs from `.sc-side` (#86590f) in the table. Unify.
- **SHOULD (open):** take the 390/1300 px `shot.sh` captures before the coordinator wires the page. Use a 26,000 px height, because the page is long.

## 6. Russian editor — APPROVE WITH CHANGES

The Russian is natural and technically correct: ИИБ, предпосадочная орбита, импульс, дросселирование, «Орёл», Море Ясности/Холода/Кризисов. Parity is complete (missingRu 0).
1. **MUST — "Mons Mouton" rendered «плато Муто»** (scorecard row and ref [25] note). The feature is a *mons*, named after Melba Mouton. *Fixed:* «гора Мутон».
2. **SHOULD (applied) — «Blue Ghost M2 — на его конец / на конец 2027 года»** overstated the EN "later that year". *Fixed* to «на более поздний срок того же года / 2027 года» in ch. 7, the timeline and the ref [34] note.
3. **SHOULD (applied) — «после защиты проекта»** for "after the design review" reads as an academic defence. Changed to «после проектной экспертизы».
4. **NIT (applied) — model note «(60 миль)»** changed to «(60 морских миль)».
5. **NIT (applied) — lede «отправились садиться на Луну»** was awkward. Rewritten with MUST 3.1.

## 7. Ethicist — APPROVE

Credit is fair:
- the volunteer Shanmuga Subramanian is named for finding Vikram;
- SpaceIL and IAI are credited together;
- failures are described by mechanism, without blame or mockery;
- the closing paragraph ("almost nothing that failed was exotic") is respectful.

Company claims are attributed as company claims: IM's 250 m is set against NASA's 400 m, and Firefly's "first fully successful" is attributed to Firefly. The SLIM over-statement, now fixed under §4.1, was the one place where the page asserted more than its sources. No harm concerns.

---

## Consolidated MUST-FIX (all applied, EN + RU)
1. Chang'e 4 launched in 2018. Lede, scorecard intro, status line and og reworded (§3.1). Check added.
2. Odysseus 1.5 km is from its intended site, not from Malapert A. Body and scorecard fixed (§3.2).
3. Ref [33] was a dead ABC URL. Replaced with the AP wire on KSAT (§3.3).
4. SLIM "upside down" stated as fact. Now hedged, with JAXA quoted (§4.1). Check added.
5. RU «плато Муто» changed to «гора Мутон» (§6.1).
6. RU "later in 2027" had been rendered "at the end of 2027". Fixed (§6.2; applied as SHOULD+).

## SHOULD / NIT left open
- §2: show the Monte Carlo sampling error in the ellipse readout.
- §4.2: one sentence on the CoM assumption in the tip-over chapter.
- §5: unify the "side" colour; take the 390/1300 px screenshots before wiring.
- §3.5: IM-3 "first quarter" vs "first part" wording.
- §3: AP's "China Manned Space Agency" attribution (kept as AP wrote it).
- Author flags kept as written: the Nova-C dimensions are still unsourced (ASSUMED preset), and Blue Ghost's landing minute is given only as a date.
- Coordinator: `assemble.py` printed a `PIL` ModuleNotFoundError from `followorbounce.github.io/engine/og_cards.py`. The page itself was written, and check-all passes. The OG card was probably not regenerated.
