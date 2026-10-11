# TRANQUILITY — Track B upgrade notes (2026-10-10)

**Page:** `tranquility-apollo-program.html` (hand-made, upgraded in place; the HTML is the source of truth).
**Purpose:** a bilingual (EN/RU) field guide to Apollo for interested non-specialists.
**Owner:** aerospace Track B team.
**Tests:** `_tools/check-all.sh tranquility-apollo-program` gives ALL OK. That covers 39 checks, no script errors, missingRu 0, and 13 citations for 13 references. `node --check` passes on the inline script.

## Roles and lenses
- **Historian + Applied Physicist:** fact-checked every date and number against SP-4029, the Apollo 11 Mission Report, the GOSS NET 1 transcript, Siddiqi SP-4408 and NASA mission pages.
- **Applied Mathematician:** built the three instruments, with unit conversions and checks.
- **Science Communicator + Technical Writer:** rewrote the misleading headings and claims.
- **Linguist:** full RU parity for every new string, decimal commas, spaces as thousands separators, and «…» quotes.
- **Information Designer:** log scale labelled on the ledger; linear axes from zero on the EVA chart.
- **Frontend:** 44 px buttons, a 30 px slider hit area with `aria-valuetext`, focus rings, keyboard access for the old widgets, and `aria-live` statuses. No animation was added, so reduced motion is unaffected.
- **Test Automation:** wrote `checks.js`.

## Facts corrected (old → new, source)
1. **CH1 heading.** "Eight years, four months, and change" → "Eight years and eight weeks". 25 May 1961 to 20 Jul 1969 is 8 years and 56 days. Computed, cited [1][2].
2. **CH2 heading.** "Still the most powerful rocket ever flown" is false: N1, SLS and Starship all exceed it. → "The rocket that carried 24 people to the Moon".
3. **CH2 lede.** "13 flew, every single one succeeded … largest, most powerful rocket ever to reach orbit" → 13 flights 1967–73, the last launching Skylab [3]. None lost its crew or payload, 10 were crewed, and 24 people went to the Moon. It was the only rocket to send people beyond LEO until Artemis II (1–10 April 2026) [4].
4. **CH2 card.** "2,970 t launch mass" → "2,938 t, Apollo 11 at liftoff" (6,477,875 lb, SP-4029). "13/13 successful launches" → "13 flights, 1967–73". Apollo 6 had engine shutdowns and reached the wrong orbit, so "all successful" was not defensible.
5. **CH3, LM.** "the only crewed spacecraft ever designed to fly exclusively outside the atmosphere" → "the first crewed spacecraft built to fly only in airless space".
6. **CH3, heat shield.** "nearly 11 km/s" → "11.03 km/s" (36,194.4 ft/s, SP-4029), plus a link to ENTRY.
7. **CH4.**
   - Apollo 10: "within 15 km" → "14.4 km (47,400 ft)" (SP-4029).
   - RU Apollo 8: «новогодней трансляции» → «рождественской» (it was Christmas Eve).
8. **CH5 heading.** "Thirty seconds of fuel to spare" → "Forty-five seconds of fuel, not thirty". The 30 s call counted down to the land-or-abort point, which sits 20 s before empty. The report gives 45 s indicated at cutoff and 50 s post-flight (Mission Report §9.8.3, rendered page 9-23/9-24; SP-4029 footnote 1).
9. **CH5 stage 04.** "down to roughly 30 seconds of hover time left" → explains the countdown to land-or-abort.
10. **CH5 stage 02.** "alarms nobody had trained for" → "unfamiliar computer alarms": five 1202/1201 alarms between 102:38:22 and 102:42:58 (report event table). "Each time Houston answers GO" was softened, because one reply was only "We copy it".
11. **CH5 stage 05.** 20:17 → 20:17:39 UTC (SP-4029).
12. **CH6.**
    - Apollo 12: "within walking distance" of Surveyor 3 → "535 ft (163 m)" (SP-4029).
    - Apollo 16: "some of the oldest rock samples of the program" → "rough terrain of the Descartes highlands to sample the ancient crust". SP-4029 also calls Apollo 14's site the "Fra Mauro highlands", so there is no "only/first highlands" claim.
13. **CH7, timing.** "April 13 … two days from the Moon" → "evening of April 13, Houston time — 55 h 55 min in, about 200,000 miles from Earth — less than a day before reaching the Moon".
    - The explosion was at 055:54:53 GET (SP-4029). Launch 13:13 CST on 11 April plus that GET gives 21:07 CST on 13 April.
    - LOI would have come around 77 h GET.
14. **CH7, label.** "by NASA's own account, its finest hour" → NASA's own label "successful failure" ([9]; "finest hour" is not on NASA's page).
15. **CH8.**
    - Samples now say 381.7 kg (841.54 lb, SP-4029, Lunar Sample Curator).
    - Giant-impact card reworded to NASA's hedged "perhaps a single Mars-sized body, perhaps several" [10]; the old wording called the samples "the strongest evidence".
    - Laser ranging is now "about 2 cm", with the Moon receding 3.8 cm/yr [11].
16. **CH9.**
    - "secret until 1989, eighteen years after it quietly failed" → "fifteen years after it was cancelled" (cancelled 1974; disclosed in *Izvestiya*, 18 Aug 1989; SP-4408).
    - N1-L3 cost "10+ billion rubles" → "3.6 billion rubles by Jan 1973; perhaps 4–4.5 billion in all, roughly half of Apollo" (SP-4408 pt 2, p. 838).
    - Apollo cost "~$25 billion (1960s dollars)" → "≈ $25.8 billion, 1960–73" [12].
    - Card values were English-only in RU mode; they are now bilingual.
17. **CH10.**
    - Eyebrow "CH.10 / 11" → "CH.10 / 10", matching CH.01–09 and the REFERENCES-as-appendix convention for hand-made pages.
    - Legacy "1961 Mercury & Gemini" → "1961–66". "2026+ Artemis, returning humans to the Moon" → "2026 Artemis II, four astronauts around the Moon" [4].
18. **References.**
    - 3 → 13 sources. The Wikipedia reference was dropped and primary sources added.
    - Every URL was checked. All return 200, except JPL's news page, which returns 403 to scripts but reads normally (verified via fetch). The Hansen monograph moved to `nasa.gov/wp-content/uploads/2023/04/sp-4504-enchanted-rendezvous.pdf`.

The lede still says "Ten chapters": 9 content chapters plus LEGACY, with REFERENCES as CH.11/11. No chapter was added.

## New instruments
1. **CH2, mass ledger.**
   - Nine Apollo 11 weights from SP-4029's "Selected Mission Weights", from liftoff at 6,477,875 lb to splashdown at 10,873.0 lb.
   - Readouts: mass, share of liftoff and "one kilogram in every N". Splashdown is 0.168 %, or 1 kg in 596.
   - The chart uses a log scale and says so.
2. **CH5, fuel clock.**
   - Time to empty = 116 s − (t − 102:44:30.4); the land-or-abort point is 20 s before empty (Mission Report §9.8.3).
   - Houston's land-or-abort time is taken from its own calls ("60 seconds" at 102:45:02 and "30 seconds" at 102:45:31, GOSS NET 1). Both imply about 102:46:01.5, roughly 4.9 s ahead of the gauge, so their count ran on the safe side.
   - The model reproduces the report's 45 s at engine cutoff (102:45:41.4) exactly, and 50 s post-flight.
   - Hover thrust is computed as 7,327 kg × 1.62 m/s² = 11.9 kN, which is 27 % of the 9,870 lbf maximum.
3. **CH8, six landings by the numbers.**
   - Samples, time outside, distance covered and farthest point from the LM, from SP-4029's EVA table.
   - Linear axes starting at zero. J-mission bars are drawn dark.

## Assumptions and limitations
- **Lunar gravity** is taken as 1.62 m/s², from the NASA Moon fact sheet; it is not separately cited on the page.
- **Hover thrust** treats Eagle as hovering at its landed mass. It ignores RCS use and the last few seconds of propellant.
- **Fuel-clock time** is linear, as the report's own timeline is. Real consumption depended on throttle.
- **Kilograms of propellant are deliberately not shown.**
  - SP-4029 lists 674 lb "usable at cutoff", which at hover flow would last about 77 s, not 45 s.
  - The report explains that the firing time is limited by oxidizer tank 2 emptying first: crossflow from an off-centre centre of gravity, §9.8.3.
  - Mixing the two figures would mislead the reader.
- **"About 200 feet" before the light** comes from the transcript altitude calls: 200 ft at 102:44:24, 160 ft at 102:44:31.
- **The 24-people count** (Apollo 8 and 10–17, with Lovell, Young and Cernan each flying twice) is standard history; no single page in the reference list states it.
- **Saturn V's 13 flights**: SP-4029 starts at Apollo 7 and the Skylab page doesn't give a count. The total is uncited arithmetic: Apollo 4, 6 and 8–17, plus Skylab.

## Unverified / for the reviewer
- **ALSJ link not used.** `history.nasa.gov/alsj/a11/a11.landing.html` and `nasa.gov/history/alsj/...` now redirect to a generic nasa.gov page, so the GOSS NET 1 transcript is cited instead.
- **Event-table light time.** The report's event table OCRs the low-level light as "102:42:28", sorted between 102:44:21 and 102:44:59, so it is probably 102:44:28. §9.8.3 (rendered and read) gives 102:44:30.4, and the page uses that.
- **Fjeld's 2013 *Horizons* article** (AIAA Houston) on the "20 seconds" myth was not reachable (connection refused), so it is not cited.
- **Lunar-orbit rendezvous vs direct ascent** was considered as an interactive and dropped. Engine Isp values for SPS, DPS and APS could not be sourced from primary documents here. The CH3 text cites Houbolt's 2–2.5× claim instead.

## Response to review (REVIEW.md, 2026-10-11)
The panel returned APPROVE-WITH-CHANGES. After the fixes, `check-all.sh tranquility-apollo-program` ends ALL OK: 54 checks, up from 39, with `unstyled: []`, 13 citations for 13 references, missingRu 0. `node --check` passes on the inline script.

### MUST-FIX (all 7 done)
1. **CH8 lede:** now "Each landing kept its crew outside longer than the last, and from Apollo 15 on … a rover that took them kilometres farther". The RU text follows the panel's wording. A check confirms the EVA hours rise every mission, that Apollo 16 went less far than Apollo 15, and that the old claim is gone.
2. **Ref [13] note:**
   - First acknowledged in July 1989 (Kamanin's diaries in *Poisk*), with the first in-depth N1 article in *Izvestiya* on 18 August 1989.
   - The URL now points at the final whole-volume PDF, `nasa.gov/wp-content/uploads/2023/06/sp-4408.pdf` (p. 838).
3. **Ref [12] note:** deleted the unsupported "$25.4 billion / 1.6 %" clause. The note now gives $25.8 billion, about $309 billion in 2025 dollars, as on the page.
4. **CH1:** now "Shepard's fifteen-minute suborbital flight", in EN and RU.
5. **RU tonnes:** the ledger axis ticks, bar label, MASS readout and aria-label all use `T(' t',' т')`. A check asserts there is no Latin " t" in RU mode.
6. **Fuel readout:** the two "to empty" cells are merged ("45.0 s gauge · 50.0 s post-flight"), so there are 4 normal cells plus the wide hover cell and no empty grey cell. A check counts them.
7. **Slider:** `input[type=range]` height is now 44 px, and the step is 0.5 s instead of 0.1 s.

### SHOULD items done
**(a) CH3 redrawn as the launch stack, in flight order.**
- From left to right: LES (motor and truss tower) → CM cone → heat shield (a thick arc forming the CM's blunt base) → SM cylinder with the SPS bell → SLA adapter with the LM folded inside, drawn dashed. An "S-IVB →" marker points on to the rest of the rocket.
- Each silhouette is a `.hotspot` with `role=button`, `tabindex` and `aria-pressed`, and works with Enter/Space.
- The 15 px labels sit above and below the stack on straight vertical leaders that never cross. Label widths were checked for EN and RU; the LES label moved to the bottom row so the RU labels don't collide.
- The ids were renamed from `heatshield2` to `heatshield` and from `sla` to `les`. The 44 px module-chip buttons in the panel are kept, and the default selection is the CM.

**(b) CH5 descent figure rebuilt.**
- A wide profile (viewBox 600×240), time-true from 102:33:05 to 102:45:39.9.
- Altitude is plotted on a square-root scale, which the axis states. It comes from the report's event table (50,000 ft at PDI, 30,000 ft at 102:38:50) and the crew's altitude calls in GOSS NET 1, from 2,000 ft at 102:42:31 down to 30 ft at 102:45:21.
- The active stage is drawn as a thick red segment with a filled marker.
- Per-stage annotations:
  - **Stage 01:** ignition.
  - **Stage 02:** the five 1202/1201 alarms at their times.
  - **Stage 03:** West crater and its boulders, drawn as a schematic under the stretch flown over, plus "P66: manual".
  - **Stage 04:** the low-level light and the "60 s" and "30 s" calls.
  - **Stage 05:** contact at 102:45:39.9.
- Stage 05's caption now separates contact (20:17:39 UTC) from Armstrong's report about 20 s later ("Tranquility Base here" at 102:45:59, "The Eagle has landed" at 102:46:04, GOSS NET 1).

**(c) Narrow layout.**
- When a chart is drawn narrower than 480 px, all four SVGs (ledger, fuel clock, EVA chart, descent) re-render in a 360-unit layout, so the text stays close to its nominal size. They re-render on resize.
- In that layout the ledger's row labels sit above the bars, the EVA labels shorten to "11…17", the fuel-clock labels each get their own row, and the descent figure thins its tick labels.
- A check fakes `clientWidth = 340` and asserts every viewBox is 360 wide.
- Future ledger bars are now white with a #6e6e68 outline (about 5:1 against white), replacing the 1.6:1 grey fill.

**(d) Fuel-clock wording.**
- The CH5 prose adds "That still left 25 seconds before the land-or-abort point."
- The Houston-lead figure is labelled a reconstruction three times: "(RECONSTRUCTED)" in the readout, "By this reconstruction…" in the status, and the equation-box note says the time is "our reconstruction".
- The hover cell now says "(7.33 t, LANDED MASS)".

**(e) Russian.**
- «Н1-Л3» is now all Cyrillic, in the eyebrow and the card.
- «фнт» is now «фунтов», and «ДАЛЬШЕ ВСЕГО ОТ ЛМ» is now «… ОТ ЛУННОГО МОДУЛЯ».
- The ref note's term is now «лампа «мало топлива»».
- Panel style suggestions applied: «доставившая», «стартовали», «Передвигайте ползунок по последним двум с половиной минутам» and «ещё 20 с после точки».

**(f) Headings and wording.**
- CH7 heading is now "A successful failure" / «Успешная неудача», NASA's own phrase. The film line is gone.
- CH9 heading is now "The Soviet Moon program kept out of sight" / «… которую скрывали».
- The CH9 lede says the program was "halted" in 1974 and adds the panel's NICE sentence on Luna 16, Luna 20 and the two Lunokhods, citing [13].
- The card reads "halted 1974, formally ended 1976". Siddiqi has the 24 June 1974 order suspending all N1-L3 work and the program that "ended with a few signatures in 1976", both verified in the text.
- The Skylab ref [3] note no longer claims "last flight". The main text's "the last one put Skylab into orbit" stays as common knowledge.

### Not done
- **Log-scale bars → dot plot (NICE):** declined. With the log scale labelled, the bars read clearly as a mass ledger, and the panel rated this NICE, not SHOULD.
- **Site-wide `#langtoggle` buttons (NICE):** not done. They are 30 px with no `aria-pressed`, and fixing them belongs in shared site CSS/JS, outside this page.
- **Duct-tape claim:** left uncited rather than re-attributing it. [9] attaches to the splashdown date only.
- **Not visually checked:** the narrow layouts and the two redrawn figures have not been screenshotted. The coordinator does screenshots centrally.
