# TRANQUILITY — Apollo: cross-disciplinary review

**Date:** 2026-10-10
**Page:** `tranquility-apollo-program.html`, upgraded in place (compared against HEAD)
**Panel:** Physics & Mathematics · Research / fact-check · Science Communication & Education · Linguist · Information Design & Frontend a11y · Ethics
**Overall verdict: APPROVE-WITH-CHANGES.** The page has 7 MUST-FIX items. Each is a small text or CSS change, and none needs a redesign.

**What was run:**
- `check-all.sh tranquility-apollo-program` gives **ALL OK**.
- All numbers were re-derived independently in `scratchpad/review-apollo/derive.py`.
- Primary sources were downloaded and read as text:
  - SP-4029 (full PDF)
  - Apollo 11 Mission Report MSC-00171 (NTRS 19700008096)
  - Siddiqi SP-4408 (full volume)
  - Hansen SP-4504
- These NASA and Planetary Society pages were fetched and checked: Artemis II, Apollo 13, Skylab, JPL LLR, Moon formation, Kennedy 60 years, and the Planetary Society cost page.

---

## 1. Physics & Mathematics: APPROVE

Everything below was re-derived independently and matches the page and `checks.js`.

1. **Mass ledger.**
   - All nine weights match SP-4029 "Selected Mission Weights" exactly:
     - 6,477,875 lb at liftoff
     - 96,767.5 lb at "CSM/LM at Transposition & Docking"
     - 72,037.6 lb at LOI cutoff
     - 16,153.2 lb, 10,776.6 lb and 5,738.0 lb for the LM stages
     - 26,792.7 lb at TEI
     - 12,095.5 lb at entry
     - 10,873.0 lb at landing
   - Columbia at separation is 37,076.8 lb = 16.82 t.
   - Liftoff is 2,938.3 t and splashdown is 4.932 t. That is 0.168 %, or 1 kg in 596. LOI used 25.6 % of the stack.
   - LOI lasted 357.53 s, so "six-minute" is right.
2. **Fuel clock.**
   - §9.8.3 (p. 9-24/25) reads: "low level light came on at 102:44:30.4, indicating approximately 116 seconds of total firing time remaining". The figure shows the go/no-go point at 20 s, and the text says "indicated 45 seconds … postflight calculated value of 50 seconds to oxidizer tank 2 depletion".
   - Cutoff is at 102:45:41.4 (SP-4029). 116 − 71.0 = **45.0 s** to empty, which leaves **25.0 s** to land-or-abort.
   - Houston's calls imply a bingo time of 102:46:02 and 102:46:01, averaging 102:46:01.5. The gauge-based point is 102:46:06.4, so Houston's count ran **4.9 s** ahead.
   - Hover thrust: 7,327 kg × 1.62 m/s² = 11.87 kN, against the 9,870 lbf (43.90 kN) maximum rated thrust (SP-4029). That is **27.0 %**.
   - Powered descent lasted 756.39 s, so "12½ min" is right.
3. **Samples.**
   - SP-4029's EVA table (Lunar Sample Curator) gives 47.51 + 75.73 + 93.21 + 170.44 + 211.00 + 243.65 = 841.54 lb = **381.72 kg**. Apollo 17 ÷ Apollo 11 = 5.13.
   - Distances: 15.1, 14.5 and 19.3 nmi = 28.0, 26.9 and 35.7 km. Farthest from the LM: 200 ft = 61 m, and 25,029 ft = 7.63 km.
4. **Other conversions.**
   - 8 years + 56 days (exactly 8 weeks); 43 days after Gagarin; 20 days after Shepard.
   - 47,400 ft = 14.45 km; 535 ft = 163 m; 36,194.4 ft/s = 11.03 km/s.
   - Apollo 13: 13:13 CST launch + 055:54:53 GET = 21:07 CST on 13 April.
5. **checks.js tests the right numbers, but a few checks are weak (NICE).**
   - "about 200 feet" is only checked as `T_LL === 116`.
   - "every ledger step lighter than liftoff" is a tautology.
   - Nothing checks the prose claim that each landing "went farther". It is false (see 2.1), and a check would have caught it.
   - Add a monotonicity assertion for any "each … more than the last" text, and an RU unit check (see 4.1).
6. **Hover thrust limitation (NICE).** The model uses the landed mass. That limitation is in NOTES only. Add "(at landed mass)" to the hover cell label: EN "HOVERING EAGLE (7.33 t, LANDED MASS) NEEDED", RU «ДЛЯ ЗАВИСАНИЯ «ОРЛА» (7,33 т, ПОСАДОЧНАЯ МАССА) НУЖНО».

## 2. Research / fact-check: APPROVE-WITH-CHANGES

### Corrections verified against primary sources (all correct)

- **8 years 56 days:** computed (1.4).
- **Saturn V wording:** "until Artemis II in April 2026 it was the only rocket that had ever sent anyone beyond low Earth orbit". The Artemis II page gives "April 1, 2026" to "April 10, 2026", "Crewed Lunar Flyby", and the right crew. Correct.
- **45 s vs 30 s:** Mission Report §9.8.3, quoted above. Correct.
- **Apollo 13:** "200,000 miles from Earth" is on NASA's Apollo 13 page, and 055:54:53 is in SP-4029. "Finest hour" is indeed absent from that page; "The Successful Failure" is its heading. Correct.
- **Soviet secrecy and cost:** Siddiqi p. 838 gives "3.6 billion rubles [to] January 1, 1973 … may have been as high as 4.0–4.5 billion … $12–13.5 billion … about half of that spent on the Apollo program". Correct.
- **Apollo 10:** SP-4029 gives "47,400 feet (7.8 n mi)". Correct.
- **Apollo 12:** SP-4029 gives "535 feet" and "535 ft NW". Correct.
- **Houbolt:** Hansen p. 16 says "a 'whopping' 2 to 2.5", from 14 Dec 1960. Correct.
- **Other checks:**
  - The alarms are five, between 102:38:22 and 102:42:58 (report event table: four 1202 and one 1201).
  - Landing was at 20:17:39 UTC.
  - LLR: "about two centimeters" and "3.8 centimeters … every year".
  - Moon formation: "perhaps a single object the size of Mars … perhaps a series of objects".
  - The Kennedy page has Shepard's "15-minute suborbital spaceflight".
- **URLs:** the NTRS GOSS NET 1 citation resolves to the correct title.

### Findings

1. **MUST-FIX: CH8 lede contradicts the page's own chart.**
   - The lede says "Each landing stayed longer and went farther than the last." Apollo 16 went *less* far than Apollo 15 on both measures: 14.5 vs 15.1 nmi covered, and 15,092 vs 16,470 ft from the LM (SP-4029).
   - EN fix: "Each landing kept its crew outside longer than the last, and from Apollo 15 on the rover took them kilometres farther."
   - RU fix: «Каждая следующая экспедиция работала на поверхности дольше предыдущей, а начиная с «Аполлона-15» луноход уносил экипаж на километры дальше.»
2. **MUST-FIX: ref [13] note misstates Siddiqi on the first disclosure.**
   - The note says "first disclosed in Izvestiya in August 1989". Siddiqi gives a different order:
     - July 1989: *Poisk* ran the first disclosure, Kamanin's diary entries.
     - The next month: Bykovskiy's biography admitted the program.
     - "Within weeks": *Izvestiya* (Leskov, 18 Aug 1989) ran the first in-depth N1 article.
   - EN fix: "…first acknowledged in print in July 1989 (Kamanin's diaries in *Poisk*), with the first in-depth N1 article in *Izvestiya* on 18 August 1989."
   - RU fix: «…впервые признана в печати в июле 1989 года (дневники Каманина в «Поиске»); первая подробная статья о Н1 — в «Известиях» 18 августа 1989 года.»
   - The main text ("kept secret until 1989") is fine.
3. **MUST-FIX: ref [12] note claims something the cited page does not say.**
   - The note says "within 1.6% of the $25.4 billion NASA reported to Congress in 1973". The Planetary Society page has no $25.4 billion figure and no 1.6 % comparison. Its only 1973 reference is the FY1974 budget line.
   - Fix: delete the clause.
     - EN: "A reconstruction from NASA budget records: $25.8 billion on Project Apollo, 1960–1973 (about $309 billion in 2025 dollars)."
     - RU: «Реконструкция по бюджетным документам NASA: 25,8 млрд долларов на проект «Аполлон» в 1960–1973 годах (около 309 млрд в долларах 2025 года).»
4. **MUST-FIX: CH1 has a pre-existing factual error that is still shipped.**
   - The text says "Alan Shepard's fifteen minutes above the atmosphere". Freedom 7 lasted 15 min 22 s from launch to splashdown. Only about 5 minutes of that was in space; the rest was ascent, re-entry and parachute descent. The cited Kennedy page says "15-minute suborbital spaceflight".
   - EN fix: "…just twenty days after Alan Shepard's fifteen-minute suborbital flight…"
   - RU fix: «…всего через двадцать дней после пятнадцатиминутного суборбитального полёта Алана Шепарда…»
   - The later sentence, "fifteen minutes of crewed spaceflight experience", can stay.
5. **SHOULD: ref [3] note goes beyond its source.**
   - The note says "— the rocket's last flight." The Skylab page says only "modified Saturn V" and never calls it the last flight.
   - Either drop that phrase from the note and keep the claim as common knowledge, or add a source that states it.
6. **SHOULD: "cancelled 1974".**
   - Per Siddiqi, the N1-L3 program was suspended by an order signed 24 June 1974, and the program "ended with a few signatures in 1976".
   - "Cancelled 1974" is defensible, but more accurate wording is: EN "halted in 1974 (formally ended 1976)"; RU «остановлена в 1974-м (официально закрыта в 1976-м)».
   - "Fifteen years after" still holds against 1974.
7. **NICE: ref [13] URL redirects.**
   - `history.nasa.gov/SP-4408pt2.pdf` returns 301 to `nasa.gov/wp-content/uploads/2023/06/sp-4408.pdf`, which is the whole volume (263 MB). Point the link at the final URL.
   - Page 838 is still correct.
8. **NICE: the duct-tape and CO₂ claim is not on NASA's Apollo 13 page [9].** The claim is true (Apollo 13 Mission Report). Either cite the Apollo 13 Mission Report or leave the claim uncited, rather than appearing to rest on [9].

## 3. Science Communication & Education: APPROVE-WITH-CHANGES

The upgrade improves the page a great deal. It replaces myth-level claims with sourced, hedged ones (giant impact, LLR, alarms, record wording) and makes no regressions in tone. The three instruments teach well, and the ledger's "one kilogram in every 596" is a strong hook.

1. **SHOULD: state the real margin in prose.**
   - The heading "Forty-five seconds of fuel, not thirty" is correct, but a reader can take 45 s as the margin. The margin to the decision point at cutoff was **25 s**, and only the instrument says so.
   - Append to the CH5 prose after "post-flight analysis found 50 [6][7]."
     - EN: "That left Eagle 25 seconds short of the land-or-abort point."
     - RU: «То есть до точки «садиться или прерывать» оставалось ещё 25 секунд.»
2. **SHOULD: label the reconstruction as a reconstruction.**
   - The fuel status says "Houston's count runs about 5 s ahead of the gauge, on the safe side". This is the authors' inference from two callout times, not a documented fact.
   - EN: "By this reconstruction, Houston's count ran about 5 s ahead of the gauge…"
   - RU: «По этой реконструкции отсчёт Хьюстона опережал датчик примерно на 5 с…»
3. **NICE: stage 05 caption timing.** "'The Eagle has landed' — Apollo 11 touches down … at 20:17:39" makes it sound as if the words came at contact. Armstrong said them about 18 s later, at 102:45:58. Suggested wording: "Touchdown at 20:17:39 UTC; seconds later Armstrong reports 'The Eagle has landed.'"

## 4. Linguist (RU): APPROVE-WITH-CHANGES

Parity is complete (missingRu 0), and the conventions are right: decimal commas, «…» quotes, thin-space thousands. The Christmas fix («рождественской») is correct.

1. **MUST-FIX: Latin "t" appears in Russian mode in the mass ledger.**
   - `renderLedger` hard-codes `' t'` in four places: the axis ticks (`fmtInt(t) + ' t'` gives "10 000 t"), the bar value label, the MASS readout, and the svg aria-label.
   - Use `T(' t', ' т')` in each place. The hover cell already uses «т» correctly.
2. **SHOULD: Russian name of the N1-L3.**
   - The eyebrow «… И N1-Л3» and the card «N1-Л3 (СССР)» mix a Latin N with Cyrillic Л, while the RU ref note uses «Н1-Л3» and «Н-1».
   - Use **«Н1-Л3»** (all Cyrillic) throughout the RU text.
3. **SHOULD: unusual abbreviations.**
   - «фнт» for pounds is not a standard abbreviation. Use «фунтов» or «фунт.».
   - «ДАЛЬШЕ ВСЕГО ОТ ЛМ»: the abbreviation «ЛМ» is never introduced. Use «ДАЛЬШЕ ВСЕГО ОТ ЛУННОГО МОДУЛЯ».
4. **NICE: stylistic improvements.**
   - «Ракета, отвёзшая к Луне 24 человека» → «Ракета, доставившая к Луне 24 человека».
   - «С 1967 по 1973 год слетали тринадцать «Сатурнов V»» is colloquial → «С 1967 по 1973 год стартовали тринадцать «Сатурнов V»».
   - «Проведите часы через последние две с половиной минуты» is a calque → «Передвигайте ползунок по последним двум с половиной минутам».
   - «ещё 20 с сверх точки» → «ещё 20 с после точки».
   - The ref note says «лампа низкого уровня» while the page says «лампа «мало топлива»». Pick one term.

## 5. Information Design & Frontend accessibility: APPROVE-WITH-CHANGES

**What works:**
- `check-all.sh` is ALL OK, with 0 script errors.
- The log scale is labelled in both the caption and on the axis ("tonnes, logarithmic scale").
- The EVA chart has linear axes from zero, with the J-mission legend.
- SVG `role="img"` elements have dynamic aria-labels that list the values.
- Button groups have `aria-pressed`, and the old widgets (dots, cards, hotspots) are now keyboard-operable.
- `aria-live` statuses are present.
- Reduced motion is handled in site.css (`prefers-reduced-motion` zeroes animation and transition), and no new animation was added.
- Text contrast is fine: #5e5e58 and #b5452a on white are both above 4.5:1.

### Findings

1. **MUST-FIX: the fuel-clock readout grid leaves an empty grey cell.**
   - `#fuelOut` has 5 normal cells plus 1 `wide` cell in a 2-column grid. Row 3 holds a single cell, and the grid background (`var(--line)`) shows through as an empty grey cell.
   - Fix: merge the two "to empty" cells into one. That gives 4 normal cells plus the wide hover cell.
     - EN: `['FIRING TIME TO EMPTY', '45.0 s gauge · 50.0 s post-flight']`
     - RU: `['ДО ПУСТЫХ БАКОВ', '45,0 с по датчику · 50,0 с по анализу']`
   - Alternative: mark the post-flight cell `wide`.
2. **MUST-FIX: the slider hit area is below 44 px.**
   - `input[type=range]{height:30px}` misses the 44 pt standing rule for every web UI.
   - Set `height:44px` (the track gradient stays 2 px).
   - Also consider `step` = 0.5. At 0.1 s, arrow keys need 1,360 presses across the range. The event buttons do soften this.
3. **SHOULD: the CH3 spacecraft diagram is weak (pre-existing).**
   - The five component boxes are scattered around a central circle, and their dashed leaders cross each other. The Command Module box (x 280–430, y 110–144) overlaps the r=24 circle at (360,130). Nothing reads as a docked stack.
   - The part with `id:'sla'` is labelled Launch Escape System, which is confusing.
   - **Fix: redraw `apolloSvg` as a simple side-view of the launch stack in flight order.**
     - Order, left to right: LES tower → CM cone → (heat shield as the CM's base, drawn as a thick arc) → SM cylinder with the SPS bell → SLA fairing with the LM folded inside (dashed).
     - Make each silhouette itself the `.hotspot` (`role=button`).
     - Put the labels above and below the stack with short, straight, non-crossing leaders.
     - Optional: a second small inset of the trans-lunar configuration (LM docked nose-to-nose to the CM) makes "three vehicles docked together" visible.
     - Rename `id:'sla'` to `les`.
   - On a 390 px screen the current rects are only about 17 px tall. The 44 px `module-chip` buttons remain the accessible path; keep them.
4. **SHOULD: the CH5 descent figure is mostly an empty white box.**
   - `#landingSvg` is a 300×300 square that holds a ground line, a small triangle stepping down 40 units per stage, and one word.
   - **Fix:**
     - Change it to a wide profile: viewBox about 600×220, `.sim-viewport` aspect-ratio 600/220.
     - Draw the real descent as a curve from left to right, with the five stage markers on it at their report times:
       - ignition 102:33:05
       - first 1202 at 102:38:22
       - P64 at 102:41:32
       - P66 / manual at 102:43:22
       - low-level light at 102:44:30
       - landing at 102:45:40
     - Highlight the active stage (thicker segment and filled marker).
     - In stage 03, draw West crater and its boulder field under the original target, with the redesignation arc carrying past it.
   - This reuses the event table already cited [6] and fills the frame with information rather than whitespace.
5. **SHOULD: SVG text is unreadable on phones.**
   - The three new charts use a 640-unit viewBox with 10–11-unit text. At 390 px (about 358 px of content) that renders at roughly **5.6–6 px**.
   - The readouts and aria-labels carry the data, but the axis and row labels are illegible.
   - Fix: re-render with a narrow layout when `svg.clientWidth < 480`. For example, viewBox width 360, ledger row labels above the bars instead of to the left, and EVA labels as "11…17".
   - Alternative: at ≤600 px, set the SVG text size to about 18 units and thin out the tick labels.
6. **SHOULD: low contrast on ledger data bars.**
   - Bars after the selected step are filled `#c9c9c1`, about 1.6:1 against white. They are data, so WCAG 1.4.11 asks for 3:1.
   - Use `#8f8f88` (about 3.3:1) or keep them white with a 1 px ink outline.
7. **NICE: bars on a log axis.**
   - On a log axis, bar *length* implies a ratio it doesn't encode. The caption is honest, but a dot or lollipop plot (dot at the value, thin line from the left edge) is the standard honest form for log data.
   - Optionally, draw the 1 t baseline explicitly as "1 t (axis start)".
8. **NICE (site-wide, pre-existing): the `#langtoggle` buttons** are about 30 px tall and have no `aria-pressed`.

## 6. Ethics: APPROVE-WITH-CHANGES

**What works:**
- The Apollo 1 framing is good: the crew is named, it is called the program's "worst day", and the consequences are concrete without sensationalism.
- Apollo 13 is framed around the crew's survival and the ground teams' work.
- The new cost comparison with Siddiqi's hedges ("perhaps", "roughly half") is fair.
- Making the CH9 cards bilingual fixes a real parity issue.

### Findings

1. **SHOULD: the CH7 heading carries a film line without attribution.**
   - "Failure is not an option" / «Неудача — не вариант» comes from the 1995 film *Apollo 13*, which put it in Gene Kranz's mouth. It was not said during the mission. The body correctly uses NASA's "successful failure".
   - Either attribute it or replace it:
     - EN: "A successful failure"
     - RU: «Успешная неудача»
   - Or keep the line in quotes and add: EN "— a line written for the 1995 film", RU «— фраза, написанная для фильма 1995 года».
2. **SHOULD: "The Soviet Moon program nobody saw" is hyperbole.**
   - Siddiqi documents a 1966 *New York Times* report on the giant rocket and CIA satellite imagery of the N1 pads. The program was hidden from the *public*, not unseen.
   - EN: "The Soviet Moon program kept out of sight"
   - RU: «Советская лунная программа, которую скрывали»
3. **NICE: give the Soviet side one sentence of credit.**
   - The comparison currently reduces the USSR to "0 launches succeeded" in a black status badge.
   - Add one sentence to the CH9 lede.
     - EN: "Its uncrewed side did fly: Luna 16, 20 and 24 returned lunar soil robotically, and two Lunokhod rovers drove on the Moon."
     - RU: «Её беспилотная часть летала: «Луна-16, -20, -24» автоматически доставили лунный грунт, а два «Лунохода» ездили по Луне.»
   - Cite Siddiqi or NSSDCA for it.

---

## Consolidated MUST-FIX

1. **CH8 lede:** "Each landing stayed longer and went farther than the last" is false for Apollo 16 (SP-4029; the page's own chart). Reword per §2.1, EN and RU.
2. **Ref [13] note:** "first disclosed in Izvestiya in August 1989" is wrong. Per Siddiqi, the first disclosure was *Poisk*, July 1989, and Izvestiya ran the first in-depth N1 article on 18 Aug 1989. Wording in §2.2.
3. **Ref [12] note:** delete "within 1.6% of the $25.4 billion NASA reported to Congress in 1973". It is not on the cited page. Wording in §2.3.
4. **CH1:** "Shepard's fifteen minutes above the atmosphere" → "fifteen-minute suborbital flight" (EN and RU in §2.4).
5. **RU units:** replace the Latin `' t'` with `T(' t',' т')` in four places in `renderLedger` (axis ticks, bar label, MASS readout, aria-label).
6. **Fuel-clock readout:** remove the empty grey cell by merging the two "to empty" cells, or by making the post-flight cell `wide`.
7. **Slider:** `input[type=range]` height 30 px → 44 px.

SHOULD-level items, in brief:
- Redraw the CH3 stack diagram.
- Make the CH5 descent figure a wide, time-true profile.
- Make SVG text legible at 390 px.
- Raise contrast on the ledger's future bars.
- Say "25 s to land-or-abort" in the CH5 prose.
- Label the Houston-lead figure as a reconstruction.
- Use «Н1-Л3» in Cyrillic.
- Fix «фнт» and «ЛМ».
- Attribute or replace the CH7 film heading.
- Soften "nobody saw".
- Fix the Skylab "last flight" sourcing.
- Say "halted 1974 / formally 1976".
