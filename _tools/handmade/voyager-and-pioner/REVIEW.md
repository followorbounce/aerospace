# REVIEW — DEPARTURE / Voyager & Pioneer (`voyager-and-pioner.html`), Track B upgrade

Date: 2026-10-10. Independent cross-disciplinary panel (AGENTS.md: Cross-Disciplinary Review, Peer Review).
Reviewed: working-tree page vs HEAD (`git diff`), NOTES.md, checks.js, `check-all.sh voyager-and-pioner` (ALL OK, 45 PASS).

**Overall verdict: APPROVE-WITH-CHANGES.** No lens blocks. The physics is sound and the corrections are well sourced.
The fixes needed before ship are small: wrong V2 crossing dates in Fig. 9.1, one wrong number in a chart's
aria-label, one inherited historical error (Akkadian/Sumer), Russian case errors in the readouts, two chart-label
collisions, and a keyboard bug in the CH6 cards that predates this upgrade.

Independent scripts: `/tmp/claude-1000/-home-none-git/c08a888d-36f6-489f-bebf-b7fcbf302f74/scratchpad/review-voyager/`
(`hz.py` = live JPL Horizons API queries; `twobody.py` = two-body vs straight-line crossing dates; `power.py`).

---

## 1. Physics & Mathematics: APPROVE-WITH-CHANGES

What I re-derived and found correct:
- **10 Oct 2026 states.** I queried Horizons myself. Heliocentric r/v come back exactly as in the page's `PROBE_NOW`:
  P10 141.9902 AU / 11.8495; P11 118.0092 / 11.1416; V1 172.0048 / 16.9180; V2 144.1638 / 15.2635 km/s.
  The `STATE` vectors for V1 match to every digit. Geocentric one-way light time: V1 23.898 h, V2 19.975 h.
  The dashboard shows 23.9 h and 20.0 h, both correct.
- **Escape model.** v∞(V1) = 16.610 km/s and v_esc(1 AU) = 42.122 km/s. All four probes are above local escape at
  their last flyby and today (ratios today 3.35 / 2.87 / 5.27 / 4.35). The flyby distances agree with Horizons
  (5.05, 9.38, 9.51, 30.21 AU). Checked against Horizons a few months after each flyby, the model is within
  ≈0.05 km/s, except Pioneer 10 just after Jupiter (model 21.8 vs Horizons 22.1 km/s at 5.1 AU). The page only
  claims "within 0.01 km/s from 1995 to 2036", so this is fine (see NICE-1).
- **Power.** 335 − 4 × 29.78 = 215.9 W (Oct 2026); half power (235 W) at 2022.0; plutonium-only 318.8 W (Oct 2026).
  The 1977–97 slope is 7.0 W/yr, which honestly shows thermocouple ageing was the larger loss early on.
- **Boundary distances (Horizons).** V1 1990-02-14: 40.36 AU, 17.883 km/s. TS V1: 94.02 AU. TS V2: 83.66 AU.
  HP V1: 121.60 AU. HP V2: 119.02 AU. All match the text.
- **V1 light-day crossings.** Horizons (12-h steps) gives 1.000006 LD on 18 Nov 2026 12:00 TDB, so the model's
  18 Nov is right. From the Sun it crosses on 3 Feb 2027 ≈ 21:40 (model 3 Feb). After November it never dips back:
  the June 2027 minimum is 1.0011 LD.

Findings:
1. **MUST: Fig. 9.1 shows wrong Voyager 2 crossing dates.** The straight-line model ignores solar deceleration
   (V2 slows from 15.26 to 15.19 km/s by 2035). Its error is small in light time but large in the *date* where the
   curve crosses 1 LD:
   - model: **28 Oct 2035** (from Earth) · **18 Nov 2035** (from the Sun);
   - Horizons: ≈**1 Nov 2035** · ≈**27 Nov 2035**.
   The page prints these to the day in the wide readout cell. Rounding to the month does not help, because the
   Earth crossing would still read Oct instead of Nov.
   Fix: propagate two-body (Sun only) from `STATE`, e.g. velocity-Verlet with a 0.5-day step, or a Kepler
   hyperbola. My `twobody.py` gives 31 Oct 2035 22:43 / 26 Nov 2035 23:04, both within a day of Horizons. V1 stays
   18 Nov 2026 / 3 Feb 2027.
   Add checks.js assertions for the V2 crossings (±1 day of 1 Nov 2035 and 27 Nov 2035). Today the file only
   `console.log`s them.
   If the model changes, update the vg-note: "straight-line motion" becomes "motion under the Sun's gravity alone".
2. **MUST: wrong number in the Fig. 4.2 aria-label.** It says plutonium alone "would leave over 300 W"
   (RU "больше 300 Вт"). In 2036, fuelOnly = 296.4 W.
   Fix: EN "about 300 W" / "just under 300 W"; RU "около 300 Вт".
3. SHOULD: the CH4 RTG card text is ambiguous: "about 470 watts at launch [8], losing about 4 W a year [7]". The
   4 W/yr rate holds since ~1997; it was ≈7 W/yr before.
   Fix: "now losing about 4 W a year" / RU "а теперь теряющих около 4 Вт в год".
4. checks.js mostly tests what the text claims. Gaps: the V2 crossing dates (finding 1); the aria-label value
   (finding 2); and the "never comes back inside one light-day" loop, which covers only 800 days. That is enough
   (the minima rise by about 1 AU/yr), but say so in the check's label.

## 2. Research / fact-check: APPROVE-WITH-CHANGES

I spot-checked 14 claims against primary sources (fetched 2026-10-10). All of these are verified:

| Claim | Source checked | Result |
|---|---|---|
| V1 LECP off 17 Apr 2026; 7 of 10 off | JPL 2026 [12] | ✔ |
| Aug 2026 "Big Bang" swap on V2, 3 instruments, +≥1 yr, V1 "in the coming months", ~4 W/yr | NASA blog [13] | ✔ (not stated as done for V1, correctly) |
| V1 CRS off 25 Feb 2025; three instruments left on each | JPL 2025 [11] | ✔ (see 2) |
| V2 PLS off 26 Sep 2024; four others operating; ≥1 into the 2030s | JPL 2024 [10] | ✔ |
| 470 W launch, ≈335 W by start of 1997; three redundant computers | NSSDC 1977-084A [8] | ✔ |
| 8,000 instr/s, 80 µs, ≈68 KB, 3.7 m, DSN to ≈2036, 3.5/3.1 AU/yr, AD 40,272 / 1.7 ly / Ross 248 ≈40,000 yr | NASA FAQ [7] | ✔ |
| 4 SNAP-19 on two trusses, 155 W, 2.74 m, 6.6 m boom | NSSDC 1972-012A [6] | ✔ |
| P11 last contact 30 Sep 1995 at 44.1 AU; Lambda Aquila(e) ~4 Myr | NASA [5] | ✔ (NASA spells it "Aquila"; the page's "Aquilae" is the correct genitive) |
| V2 flybys 9 Jul 1979, 26 Aug 1981, 24 Jan 1986, 25 Aug 1989 | NSSDC 1977-076A [3] | ✔ |
| 175-year alignment | JPL poster [2] | ✔ |
| 115 images, 55 languages, 90 min, jacket + cartridge + needle | Golden Record [14] | ✔ (see 1) |
| 14 Feb 1990, 6 bn km, 60 frames, "about a pixel", cameras off (34 min later) | PBD [15] | ✔ |
| V2 TS 30 Aug 2007, 84 AU | SVS [17] | ✔ |
| Pu-238 87.7 yr; Pioneer/Voyager RTGs | NTRS 20080047411 [9] | ✔ (title/authors correct) |

Science DOIs [16][18] return 403 to curl (publisher bot-blocking) and [19] resolves. Their cited values
(94.01 AU; 25 Aug 2012 / 121.6 AU; 5 Nov 2018 / 119 AU) agree with Horizons.

Findings:
1. **MUST: inherited historical error in CH6.** The page says "from Akkadian, spoken in Sumer some six thousand
   years ago". This is NASA's own copy, but it is wrong:
   - Akkadian is first attested ≈2500 BCE, about 4,500 years ago;
   - Sumer's language was Sumerian, an unrelated isolate.
   The upgrade newly adds this claim in the page's own voice.
   Fix: EN "from Akkadian, spoken in Mesopotamia more than four thousand years ago, to Wu, a modern Chinese
   dialect". RU "от аккадского, на котором говорили в Месопотамии более четырёх тысяч лет назад, до у —
   современного китайского диалекта". Optionally also fix the [14] ref note.
2. SHOULD: [11] only *announces* the 24 Mar 2025 V2 LECP shutdown ("will shut off … on March 24"). The page states
   it as done. Later sources ([13]: "two per spacecraft have been turned off since 2024") support that it happened.
   Fix: cite [11][13] on that clause, or note in the [11] ref "scheduled for 24 March 2025".
3. SHOULD: "roughly 68 kilobytes of memory between them" (CH4 lede) reads as if both spacecraft are combined. The
   FAQ's 68 KB is the total for the six computers on *each* spacecraft.
   Fix: "…with roughly 68 kilobytes of memory on each spacecraft" / RU "…и примерно 68 килобайт памяти на каждом
   аппарате".
4. NICE: the [7] memory figure is the FAQ author's own calculation ("According to my calculations…"). That is fine
   for "roughly".
5. Notes "Not verified" items: agreed. The uncited CH5 discoveries and the 300–800 km/s figure are textbook-level.
   A citation round later would be good.

## 3. Science Communication & Education: APPROVE-WITH-CHANGES

The upgrade is a clear net gain:
- Removing the invented ±3.2 km/s assist slider was the right call, and it is honestly replaced by text plus a
  SLINGSHOT link.
- "Single pixel" became "a point of light about one pixel across".
- The heliopause text now distinguishes V1's plasma-wave inference from V2's direct measurement.
- The models state their limits ("between them it interpolates, after 2026 it extrapolates").

The voice (short declaratives, engineering-guide tone) is preserved.

Findings:
1. SHOULD: one CH9 sentence is confusing. It reads "…adds a yearly wobble of up to about one astronomical unit as
   Earth circles the Sun — and light, carrying every command, needs that long to cross." "That long" has no
   antecedent; RU "нужно столько же времени, чтобы его пройти" is no clearer. Also, the swing is about ±0.8 AU,
   because the Voyagers are 35–38° off the ecliptic.
   Fix: EN "…adds a yearly swing of up to about 0.8 AU either way as Earth circles the Sun — about seven minutes of
   light time, added to or taken from every command." RU "…каждый год колеблется ещё примерно на 0,8 а.е. в обе
   стороны, пока Земля обходит Солнце, — это около семи минут светового времени, которые прибавляются к каждой
   команде или вычитаются из неё."
2. SHOULD (regression): the old CH7 text said Voyager 1 turned its camera back "on request", and the old music
   card said "selected by committee". Both hints at human authorship were dropped. See Ethics 1–2 for the
   replacement wording.
3. NICE: the escape-check prose "which shrinks faster with distance than the probe slows down" is correct. One
   more clause would help learners: "because the probe's speed levels off at v∞ while escape speed keeps falling
   as 1/√r".
4. No other regressions: every removed claim was either wrong or is restated more precisely.

## 4. Linguist (Russian): APPROVE-WITH-CHANGES

Parity: `missingRu: 0`. All new prose has RU counterparts of equal content. Decimal commas are correct in readouts
and prose (0,01; 1,327 × 10¹¹; 121,6).

Findings:
1. **MUST: probe names stay in the nominative where Russian needs another case.** Generated strings put `p.ru` /
   `P.ru` in quotes in the nominative:
   - `whereVerdict` (visible): "дойдёт до «Вояджер-1»" and "чтобы дойти до «Вояджер-1»" should be «Вояджера-1».
   - `drawWhere` aria-label: "…от Земли до «Вояджер-1»…".
   - `drawEsc` aria-label: "Скорость «Вояджер-1» в зависимости…". This one needs the genitive too, and for the
     Pioneers it reads «Пионер-10» where «Пионера-10» is needed.
   Fix: add `ruGen` to `PROBE_NOW` (Пионера-10, Пионера-11, Вояджера-1, Вояджера-2) and use it in these three
   strings. `escVerdict` ("«Вояджер-1» летит") is nominative and correct.
2. **MUST: wrong month case in the date readout.** `MON_RU` holds genitive forms ('марта', 'мая', 'июня', 'июля').
   That is right after a day number ("18 марта 2027") but wrong in `whereVal`, which prints month + year only:
   "марта 2027" should be "март 2027".
   Fix: a second nominative array for `jdDate(jd, false)`: ['янв.','февр.','март','апр.','май','июнь','июль',
   'авг.','сент.','окт.','нояб.','дек.'].
3. SHOULD: wrong number agreement in the escape slider's aria-valuetext, "… астрономических единиц". It is wrong
   after numbers ending in 1 or 2–4 ("172 астрономических единиц" should be "единицы") and after decimals
   ("9,5 … единицы").
   Fix: use "а. е." in the valuetext, or a plural helper.
4. SHOULD (pre-existing): the CH2 heading "Похищая момент у планеты" uses the wrong term. Momentum is «импульс»;
   «момент» means moment or torque. Fix: "Похищая импульс у планеты" (or "Занимая скорость у планеты").
5. SHOULD (pre-existing): the Pioneer plaque card has "Позолоченный анодированный алюминий" (cRu). That means
   "gilded", which contradicts the body text "Анодированная под золото" and the EN "gold-anodised".
   Fix: "Алюминий, анодированный под золото".
6. NICE:
   - "40 272 году" and the `fmtN` thousands separator use a plain space. Use U+00A0 (or U+202F) so the number
     cannot wrap.
   - "к Россу 248" would read better as "к звезде Росс 248".
   - "СКОРОСТЬ ÷ УБЕГАНИЕ" would read better as "ЗАПАС ПО СКОРОСТИ" or "СКОРОСТЬ ÷ СКОР. УБЕГАНИЯ".
   - "НАВСЕГДА, v∞" would read better as "ОСТАНЕТСЯ НАВСЕГДА, v∞".
   - In the fig caption, "ВЫРАВНИВАНИЕ РАЗ В 175 ЛЕТ" is a calque. Prefer "РАСПОЛОЖЕНИЕ ПЛАНЕТ, ПОВТОРЯЮЩЕЕСЯ РАЗ
     В 175 ЛЕТ".
   - "(череда отключений начинается в 2024)" needs "…в 2024 году".

## 5. Information Design & Frontend accessibility: APPROVE-WITH-CHANGES

`check-all.sh voyager-and-pioner`: ALL OK (errors [], 19 refs, maxCite 19).

The charts are honest:
- Fig. 1.1 bars start at 0 on a labelled 20 km/s scale.
- Fig. 4.2 has a zero baseline, the model and plutonium-only curves are distinguished by dash *and* label, and the
  extrapolation is stated.
- Fig. 1.2 is labelled "log scale".
- The Fig. 9.1 y-axis starts at 18 h. That is acceptable for a line chart whose subject is the 24 h crossing, and
  it is labelled.

Contrast (on white):
- #55554f text: 7.5:1.
- Graphical strokes: #b5452a 5.5:1, #a8741a 4.1:1, #2f5aa1 6.8:1. All ≥ 3:1.

Controls:
- 44 px targets on .vg-btn, .stage-btn, .tab-btn and slider hit areas.
- `aria-pressed`, labelled `role=group`, `aria-valuetext` on all four sliders, `aria-live` verdicts.
- `buttons()` keeps focus across clicks.

Reduced motion: nothing new animates, and site.css already zeroes transitions.

Findings:
1. **MUST: axis-title collisions (coordinator's screenshot, confirmed from code).**
   - In `drawPower`, the title "watts" is at (46, 12, start-anchored). The top tick "500" is end-anchored at
     (40, Y(500)+4 = 24). The two boxes meet at the axis corner, so they touch.
   - `drawWhere` has the same geometry: "hours, Earth to spacecraft" at (46, 12) against tick "30" at (40, 24).
   Fix (both): move the plot top down, `y1 = 34` (keep the title at y = 14). Or right-align the tick labels at
   `x0 - 8` and put the title at y = 10 with a ≥ 10 px gap. `drawEsc` is fine (top tick 40 sits at y ≈ 48).
2. **MUST (pre-existing; WCAG 2.1.1): the CH6 message cards cannot be opened from the keyboard.**
   - site.js makes each `.exp-card` focusable (role=button). On Enter/Space it dispatches `click` *on the card*.
   - `renderMessages()` listens only on the child `.exp-head`, and a click dispatched on the parent never reaches
     the child.
   - Result: 5 of the 6 cards (the content this upgrade rewrote) stay collapsed for keyboard users. The
     `aria-expanded` state is announced but never changes.
   Fix: attach the toggle listener to `card` itself instead of `card.querySelector('.exp-head')`.
3. SHOULD (pre-existing): CH3/CH4 `selectPart()` rebuilds the `.module-chip`s on every selection. The new chips
   lack the tabindex/role that site.js stamps only at load and on language change, so after the first keyboard
   selection the chips drop out of the tab order.
   Fix: render chips as `<button type="button">`, or set `tabindex="0" role="button"` in the template string.
4. SHOULD: at 390 px the 480-unit SVGs render about 358 px wide (scale ≈ 0.75), so the 11-unit chart text becomes
   ≈ 8 px. Fix: raise `.vg-t`/`.vg-tb` to 13–14 units, or add `@media (max-width:500px){.vg-t,.vg-tb{font-size:14px}}`.
5. SHOULD (pre-existing): the CH5 planet tabs are plain buttons with a visual "active" state and no programmatic
   state. Fix: `aria-pressed` (as done for the stage buttons), or full tablist/tab/aria-selected.
6. NICE: the pre-existing Fig. 7 zoom slider has an aria-label but no visible label.

## 6. Ethics: APPROVE-WITH-CHANGES (no blocks)

There are no misleading claims about mission status:
- "two still speaking" with instrument counts is correct as of Oct 2026.
- V1's "Big Bang" swap is correctly *not* claimed as done.
- Extrapolations are labelled.

Attribution is the gap.

Findings:
1. SHOULD: the Golden Record has no human credit, and the old "selected by committee" was dropped. NASA's own
   page [14] credits "a committee chaired by Carl Sagan of Cornell University".
   Fix (Music or CH6 lede): EN "chosen by a committee chaired by Carl Sagan [14]" / RU "отобранные комиссией под
   руководством Карла Сагана [14]".
2. SHOULD: the Pale Blue Dot text drops the old "on request". Two things need credit:
   - the image was Carl Sagan's idea (NASA [15]: proposed in 1981);
   - the closing line "Everyone who has ever lived, on that point" paraphrases Sagan's *Pale Blue Dot* (1994)
     without attribution.
   Fix: EN "…turned its camera back towards the Sun at Carl Sagan's suggestion [15]…". End the zoom caption with
   "— after Carl Sagan, Pale Blue Dot (1994)" (RU "— по Карлу Сагану, «Бледно-голубая точка», 1994"). Image credit
   if one is ever shown: NASA/JPL-Caltech.
3. NICE: the Pioneer plaque card could credit its designers, Carl Sagan and Frank Drake, with artwork by Linda
   Salzman Sagan. No source on the page states this yet; add one if credited.
4. The Akkadian/Sumer error (Research 1) is also an accuracy-to-the-public issue. It is fixed there.

---

## Consolidated MUST-FIX

1. **Fig. 9.1 V2 crossing dates:** the straight-line model gives 28 Oct / 18 Nov 2035; Horizons gives ≈1 Nov /
   ≈27 Nov 2035. Propagate under the Sun's gravity (two-body), update the vg-note, and add checks.js assertions
   (±1 day). [Physics 1]
2. **Fig. 4.2 aria-label:** "over 300 W" is wrong (296 W in 2036). Use "about 300 W" / "около 300 Вт". [Physics 2]
3. **CH6 Akkadian:** replace "spoken in Sumer some six thousand years ago" with "spoken in Mesopotamia more than
   four thousand years ago" (EN + RU). [Research 1]
4. **RU genitive probe names** in `whereVerdict`, the `drawWhere` aria-label and the `drawEsc` aria-label
   («Вояджера-1», «Пионера-10»…). [Linguist 1]
5. **RU month without a day** in `whereVal` must be nominative ("март 2027", "май", "июнь", "июль"). [Linguist 2]
6. **Axis-title collisions:** "watts"/"500" in Fig. 4.2 and "hours…"/"30" in Fig. 9.1. Move the plot top down
   (y1 ≈ 34). [Info design 1]
7. **CH6 cards not keyboard-operable** (pre-existing, WCAG 2.1.1). Bind the toggle to `.exp-card`, not
   `.exp-head`. [Accessibility 2]

The SHOULD items (68 KB "on each spacecraft", "now losing 4 W/yr", the CH9 "that long" sentence, Sagan credits,
«импульс», the plaque cRu, chip tabindex, mobile chart text size, tab state) are recommended in the same pass but
do not gate shipping.
