# REVIEW: ISS & Mir (`iss-and-mir.html`), Track B upgrade

**Date:** 2026-10-11 · **Panel:** independent cross-disciplinary review (AGENTS.md "Cross-Disciplinary Review" and "Peer Review")
**Overall verdict: APPROVE WITH CHANGES.** There are 5 MUST-FIX items. Each one is a small text or URL edit, and none needs an instrument rebuilt. The physics checks out. All 14 references were checked and 13 support their citations.

How this was checked:
- `./check-all.sh iss-and-mir` gives ALL OK.
- Every model number was re-derived independently in Python. The scripts are in the session scratchpad `review-iss/` (`phys.py`, `passes.py`), using a Verlet integrator and a J2-perturbed ground-track simulation.
- Primary sources were fetched: NASA Facts, the NASA Deorbit Analysis Summary PDF (text extracted), the NASA transition FAQ, the NASA USDV release, NASA's Mir-35 article, SP-4225, ScienceDaily (Twins), ISS NL (protein crystals) and RussianSpaceWeb. ESA SP-498 was read from the scanned pages, pp. 57, 64 and 65.
- No browser was launched.

---

## 1. Physics & Mathematics: approve-with-changes

Independent re-derivation matches the page in every case:

| Quantity | Page | Independent result |
|---|---|---|
| v_circ / v_esc at 100 km | 7.84 / 11.09 km/s | 7.844 / 11.093 |
| Cannonball at 5 / 7 km/s (Verlet, dt = 0.05 s) | 935 / 2,245 km | 935 km, 3.13 min / 2,245 km, 5.37 min |
| 415 km orbit | 7.66 km/s, 92.9 min, 15.5 laps/day, 27,580 km/h | 7.660, 92.87, 15.51, 27,576 |
| Gravity at 200–250 mi | "about 90 %" | 90.6–88.5 % (88.2 % at 415 km) |
| Fall per second | g_local/2 | 4.32 m |
| 10° visibility radius | ~1,400 km | 1,379 km |
| Maximum elevation, Moscow / Reykjavík / Svalbard | — | 38.6° / 9.8° / −5.7° |
| Third cosmic velocity | 16.6 km/s | 16.65 km/s, with solar escape at 1 AU = 42.12 km/s |
| Ideal apogee burns vs flown | — | 5.62 / 9.48 / 22.86 m/s vs 9.27 / 10.4 / 28.0 m/s |
| ISS 415 → 50 km in one burn | 106 m/s | 106.5 m/s |
| Final burn from 241 km to 50 km | 57 m/s | 57.0 m/s |
| Hohmann 415 → 633 / 670 / 2,000 km | — | 120.0 / 139.8 / 760.4 m/s |

Other checks:
- At the slider maximum of 3,000 km the boost costs 1,133 m/s. That is below the chart's 1,200 m/s cap, so the bar is never clipped.
- ESA Tab. 2 says the burns were modelled at u = 40°. The text also says burn 1 "moved the perigee location by almost 180°". Both support the page's explanation that real burns were not apogee burns.
- checks.js tests what the text claims, and the RK4 cross-check is genuine.

1. **MUST-FIX: the pass-pattern sentence is false for the quantity the instrument counts.**
   - Text: `"Within the track: the ISS can pass straight overhead here. Passes bunch up for a few days at a time, then pause as the track drifts."`
   - The readout counts passes above 10°, day or night. A 20-day simulation with J2 gives 2–5 such passes **every** day at 21.3°, −1.3°, −33.9° and 55.8°. There are no pause days.
   - Only *naked-eye visible* passes come and go over weeks, because visibility depends on the lighting.
   - Fix EN: "Within the track: the ISS can pass straight overhead here. Passes come every day, in runs on consecutive orbits about 90 minutes apart; the ones you can see by eye (station sunlit, sky dark) come and go over a few weeks as the lighting shifts."
   - Fix RU: "В пределах трассы: здесь МКС может пройти прямо над головой. Пролёты бывают каждый день, сериями на соседних витках с интервалом около 90 минут; видимые глазом (станция освещена, небо тёмное) появляются и пропадают на несколько недель вместе со сменой освещения."
2. SHOULD: the Newton slider tick labels `4 · 7.84 · 11.09 · 13` are spread evenly with `space-between`. Their true positions on the 4–13 range are 0 %, 43 %, 79 % and 100 %. Position each label absolutely at `(v−4)/9`.
3. SHOULD: the HUD data in ch9 (`data-alt="400 → 0 KM"`) contradicts the new text, which says the orbit was ~300–340 km and then ~220 km. Use `340 → 0 KM`. In ch3–6, `~400 KM` could read `~415 KM`.
4. NICE: Reykjavík shows `HIGHEST IN YOUR SKY 10°` next to "never climbing above 10°", because 9.8° is rounded to 10°. Show one decimal below 15°.
5. NICE: `"fired from the top of an imaginary mountain 100 km high so that air can be ignored"` implies air is negligible at 100 km. Write "…100 km high; as in Newton's drawing, air is ignored." (RU: «…высотой 100 км; как и у Ньютона, воздух не учитывается.»)

## 2. Research / fact-check: approve-with-changes

**Verified against primary sources (11 claims):**
- NASA Facts:
  - 419,725 kg
  - "109 meters end-to-end"
  - "8 solar arrays provide 75 to 90 kilowatts"
  - "1,005 cubic meters"
  - crew of seven
  - "five space agencies from 15 countries"
  - continuously occupied since November 2000
- NASA Deorbit Analysis Summary:
  - 415 km, >430,000 kg, 51.6°
  - "roughly one-to-two years without reboosts"
  - ~51 years → under 4 years at 800 km
  - "through at least September 30, 2030"
  - natural decay is used first, then a re-entry burn
- NASA FAQ: 120–140 m/s for 100 years, 760 m/s for more than 10,000 years, 57 m/s for deorbit.
- NASA USDV release: 26 Jun 2024, up to $843M.
- NASA Mir-35 article:
  - core launched 19 Feb 1986
  - 28 expeditions
  - 125 people from 12 countries
  - Sep 1989 – Aug 1999, record broken Oct 2010
- SP-4225: designed for five years, so three times its design life holds.
- ESA SP-498:
  - Priroda launched Apr 1996
  - 135 tonnes
  - burns of −9.27 / −10.4 / −28.0 m/s, perigee ≈ 80 km
  - Tab. 3 values match the presets
- RussianSpaceWeb: break-up at 110–100 km and 90–70 km.
- ScienceDaily/NASA Twins: most measures normal within six months, while immune and DNA-repair genes were not.
- ISS NL: Keytruda and LRRK2, and no Duchenne mention.

The pre-upgrade corrections in NOTES are all confirmed.

1. **MUST-FIX: the dated ISS status is out of date.**
   - Text: `"Status as of 10 October 2026 … and Russia through at least 2028 [13]"`.
   - On 14–16 July 2026, Roscosmos head Bakanov agreed with NASA Administrator Isaacman to support ISS operations **through 2030**. This was an in-principle agreement; no signed document is public. NASA confirmed the account to SpacePolicyOnline: "Russia Agrees to ISS Operations, Seat-Swaps, Through 2030", 16 Jul 2026, https://spacepolicyonline.com/?p=89970.
   - A status line dated October 2026 cannot keep the 2028 figure.
   - Fix EN: "…have committed to operating the station through 2030 [13]; Russia, committed only through 2028 until then, agreed in principle in July 2026 to support operations through 2030 as well [15]…"
   - Fix RU: "…обязались эксплуатировать станцию до 2030 года [13]; Россия, до этого обязавшаяся лишь до 2028-го, в июле 2026 года в принципе согласилась поддерживать работу станции тоже до 2030 года [15]…"
   - Add a reference [15] for SpacePolicyOnline (or TASS).
   - Update the ref [13] note, which reads "(Russia — по меньшей мере до 2028-го)", so it is labelled as the 2024 position.
   - Update NOTES, which says 2025–26 changes were "not verified".
2. **MUST-FIX: the impact-zone description misstates what ESA reports.**
   - Text: `"the planned impact zone stretched ±2,500 km along the track, centred near 40° S, 160° W [11]"`. The same wording appears in the RU caption.
   - ESA p. 65 says this is a *conservative 2σ dispersion footprint* (±2,500 km along track, ±100 km across), "centred at 40°S and 160°W", which is the **reconstructed** impact location.
   - The *planned* ellipse was centred at 44.2° S, 150° W. The longer-than-planned final burn shifted it (RussianSpaceWeb [12]).
   - Fix EN: "Surviving fragments fell into the South Pacific. ESA's reconstruction put the impact near 40° S, 160° W, inside a footprint of about ±2,500 km along the track [11]."
   - Fix RU: "Уцелевшие обломки упали в южную часть Тихого океана. По реконструкции ЕКА, место падения — около 40° ю. ш., 160° з. д., в пределах зоны около ±2 500 км вдоль трассы [11]."
   - Adjust the ref [11] note to match.
3. **MUST-FIX: reference [7] does not resolve.** The `blogs.nasa.gov/ISS_Science_Blog/2013/11/25/cool-flames-…` URL returns 301 to the generic `https://www.nasa.gov/blogs/` index for both scripts and browsers. Replace it with a Wayback Machine snapshot of the same URL (confirm the snapshot by hand), or with the UC San Diego release "Researchers discover cool burning flames in space…" (today.ucsd.edu). Re-check that the 200–540 °C (400–1,000 °F) figure appears in whichever source is used.
4. SHOULD: decision attribution. Text: `"RKK Energia decided to bring it down [12]"`. RussianSpaceWeb says Energia made the final decision by October 2000. ESA [11] p. 57 says the operations followed "a decision by the Russian government to conclude the mission".
   - Fix EN: "…RKK Energia and the Russian government decided to bring it down [11][12]."
   - Fix RU: "…РКК «Энергия» и российское правительство приняли решение свести станцию с орбиты [11][12]."
5. SHOULD: the Keytruda project. Merck grew *millions of tiny uniform crystals* to improve the drug's formulation, not larger crystals for structure work. The RESULT/IMPACT pairing implies the latter.
   - Fix EN impact: "Projects have included Merck's work on uniform crystals of the cancer drug Keytruda, for an easier-to-inject formulation, and LRRK2, a protein linked to Parkinson's — aimed at better drugs, not yet proven treatments [6]."
   - Fix RU: "Среди проектов — работа Merck над однородными кристаллами противоракового препарата Keytruda (для более удобной инъекционной формы) и белок LRRK2, связанный с болезнью Паркинсона; цель — более совершенные лекарства, а не уже доказанные методы лечения [6]."
6. NICE: the third burn used the main engine together with the attitude thrusters (RSW: "DPO + SKD"; ESA Tab. 3 lists "main engine"). The caption is acceptable as written.
7. Note: the ISS NL, JPL and RSW URLs return 403/406 to curl (bot blocking) but load in WebFetch. These are OK.

## 3. Science Communication & Education: approve-with-changes

The upgrade is a clear improvement. Invented Bézier "orbits" are now true conics, the third-cosmic-velocity arithmetic is fixed, the "no gravity up there" misconception is addressed head-on, and the instruments label their model limits. The voice is consistent with the rest of the guide. No accuracy regressions vs HEAD apart from the items above.

1. (MUST-FIX 1.1 above also belongs to this lens. The pause-for-days claim teaches a misconception.)
2. SHOULD: `"Directly informs health protocols for multi-year Mars transit crews."` This overclaims, and "multi-year transit" is wrong: transit is about 7–9 months each way.
   - Fix EN: "Informs health planning for future multi-year Mars missions."
   - Fix RU: "Учитывается при планировании охраны здоровья в будущих многолетних марсианских экспедициях."
3. NICE: `"Each one is the minimum required to escape one gravitational well and fall into the next."` This does not fit the first velocity, which is about orbiting, not escaping. Write "Each is a threshold: to orbit Earth, to escape it, and to escape the Sun."
4. NICE: a true fact was lost. The final Mir crew (EO-28) did leave in June 2000. It could return as a cited 2000 timeline entry; NASA's Mir pages or SP-4225 would serve as the source.
5. NICE: `"Small, controlled flames are burned inside sealed chambers"` → "lit inside sealed chambers". This wording is pre-existing.

## 4. Linguist (Russian): approve-with-changes

The Russian is mostly natural, with correct terminology (гермообъём, двигатели причаливания и ориентации, наклонение, 40° ю. ш.). The dynamic numbers use a comma and a no-break thousands separator.

1. **MUST-FIX: mistranslation of the station's name.** `"«Мир» — станция, чьё название означает и «покой», и «вселенную»"`. "Мир" does not mean «покой» or «вселенная», and the EN says peace/world. This sentence was edited in this upgrade but the error was kept.
   - Fix RU: "Название «Мир» значит и «мир» как отсутствие войны, и «мир» как весь свет (по-английски — peace и world). Станция провела на орбите пятнадцать лет…"
2. SHOULD: the boost status reads `"в 0,1 раза больше, чем 57 м/с"` for targets below about 516 km, where the boost costs less than 57 m/s. When `b.total < 57`, branch to "— это лишь X от 57 м/с на спуск" (EN: "only X of NASA's 57 m/s").
3. SHOULD: the stat label `СОЛНЕЧНАЯ ЭНЕРГИЯ` sits on a kW value, which is power, not energy. Use `МОЩНОСТЬ СОЛНЕЧНЫХ БАТАРЕЙ` (or `МОЩНОСТЬ СБ`).
4. SHOULD: `«Купола»` → `«Купол»`, the module's established Russian name. This is pre-existing.
5. SHOULD: `"Земля притягивает примерно на 90 процентов так же сильно, как у поверхности"` → "притяжение Земли составляет около 90 процентов от того, что у поверхности".
6. SHOULD: `"Карты расхода воды растениями с элементом около 70 м"` → "…с разрешением около 70 м".
7. SHOULD: Newton verdict `"это уходит от Земли с запасом"` → "это ядро уходит от Земли с запасом". In the elliptical case, "аппарат" → "ядро" for consistency.
8. SHOULD: static RU numbers use a plain space (`1 005`, `1 400`, `2 500`, `10 000`, `6 378`, `2 000 КМ`), so a number can break across lines. Use `&nbsp;` (or ` ` in JS strings), as `fmt()` already does.
9. NICE:
   - `"«Прогресс» «Мира»"` → "пристыкованный к «Миру» «Прогресс»".
   - `"«Прогресс» выдал 9,27 м/с"` → "выдал импульс 9,27 м/с".
   - `"американский корабль для свода станции"` → "для сведения станции с орбиты", matching «свести» in ch9.
   - `"орбиту больше чем на 10 000 лет"` → "орбиту, где она продержится больше 10 000 лет".
   - `"Небольшие контролируемые пламена сжигаются"` → "В герметичных камерах зажигают небольшие контролируемые пламёна…"

EN/RU parity is complete. checks.js confirms there is no missing RU.

## 5. Information Design & Frontend accessibility: approve-with-changes

What passes:
- `check-all` is ALL OK, and the inline script passes `node --check`.
- All charts start from zero: the burn altitude chart, the boost bars and the gravity bars. The boost bars are never clipped (maximum 1,133 m/s under a 1,200 m/s cap). Before and after are distinguished by dash pattern as well as colour.
- Contrast: `--mid` #63635d is 6.05:1 on white and 5.58:1 on paper. `.svg-small` is 8.9:1. Chart blue is 6.8:1 and the grey line 4.3:1, both above 3:1 for graphics.
- Keyboard: SVG hotspots work with Enter/Space, module chips are real buttons, experiment heads have `aria-expanded`, and toggles have `aria-pressed`.
- Live regions are present, sliders have `aria-valuetext`, aria-labels switch with the language, the select is 16 px and 44 px tall, and reduced motion stops the floaters, the globe and smooth scroll.

1. SHOULD: the language toggle buttons (site.css `padding:7px 12px`, 12 px font) are about 30 px tall, below the 44 px the NOTES claim. They also lack `aria-pressed`. Add `min-height:44px` and set `aria-pressed` in `applyLang()`. This may be a site-wide change.
2. SHOULD: the experiment card head is `role="button"` on a `div` that contains an `<h4>`. Button children are presentational, so the four experiment headings drop out of heading navigation. Use `<h4><button aria-expanded aria-controls>…</button></h4>`. Closed bodies (max-height only) are still read by screen readers while `aria-expanded="false"`; add `hidden` or `aria-hidden` when closed.
3. NICE: at 390 px the nine Mir timeline wrappers are about 40 px wide while the hit buttons are 44 px, so neighbouring targets overlap by about 4 px. This still passes WCAG 2.5.8; set the wrappers to `min-width:44px` with horizontal scroll, or shrink the hit area to the wrapper width.
4. NICE: at 390 px the SVG text scales to about 7–8 px in the burn and boost charts, and to about 5 px for the module labels in the 720-wide schematics. The readouts and chips carry the same information, so this is not blocking.
5. NICE: on the burn chart, the legend at y = 32 collides with the "before" line once apogee is ≥ about 440 km (slider max 500). Move the legend below the axis title or into the note.

## 6. Ethics: approve-with-changes

The upgrade removed real overclaims: the protein-crystal "treatments", the cool flames that "cannot exist", ECOSTRESS "feeds early-warning", and the "largest cooperative project ever". Attribution is careful: inferences are labelled "this model's inference", and the ESA/NASA counts discrepancy is noted. Russia's role is presented factually and without loaded framing. There are no blocking concerns.

1. (MUST-FIX 2.1 above is also a fairness issue. The page should not understate Russia's current commitment against a self-declared October 2026 status.)
2. SHOULD: CSA, one of the five agencies, is invisible in the ISS chapter. The module map has US ×3, Russia ×2, ESA ×2, JAXA ×1 and Canada ×0. Add a Canadarm2 entry: "Canadarm2 — CSA / Canada — the station's 17 m robotic arm, installed 2001, used to catch visiting cargo craft and move hardware" / RU "Canadarm2 — ККА / Канада — 17-метровый манипулятор станции, установлен в 2001 году; захватывает грузовые корабли и перемещает оборудование". Optionally note that the map stops at 2010, so it omits later modules such as Russia's Nauka (2021).
3. SHOULD: the decision attribution in 2.4 (Energia vs the Russian government) is also an accuracy-of-responsibility issue.
4. SHOULD: the Mars overclaim in 3.2.

---

## Consolidated MUST-FIX (5)

1. **CH5 flyover status (EN + RU):** replace "Passes bunch up for a few days at a time, then pause as the track drifts" with the every-day wording in 1.1. Day-or-night passes above 10° happen every day.
2. **CH9 ISS status (EN + RU, ref [13] note, new ref [15]):** Russia agreed in principle in July 2026 to support ISS through 2030 (SpacePolicyOnline, 16 Jul 2026). "Through at least 2028" is stale for a status dated October 2026.
3. **CH9 stage 05 caption (EN + RU, ref [11] note):** 40° S, 160° W is ESA's *reconstructed* impact point, and the ±2,500 km is a 2σ footprint around it, not the planned zone. The plan was 44.2° S, 150° W.
4. **Ref [7]:** the cool-flames blog URL now redirects to the NASA blogs index. Replace it with an archived copy or another source, and re-verify 400–1,000 °F.
5. **RU CH7 lede:** fix «покой»/«вселенную», the mistranslation of "peace/world".
