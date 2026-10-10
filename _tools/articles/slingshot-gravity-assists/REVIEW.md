# SLINGSHOT: cross-disciplinary review

Date: 2026-10-09 · Reviewed: `_tools/articles/slingshot-gravity-assists/*` and the generated `slingshot-gravity-assists.html`
`./check-all.sh slingshot-gravity-assists`: ALL OK (25/25 checks, 0 missing RU, 9 refs, 12 timeline rows).
Independent re-derivations: `scratchpad/review-slingshot/verify.py`.

**Overall verdict: APPROVE WITH CHANGES.** The core physics is right and well checked. Five MUST-FIX items: one false orbital-mechanics readout, one false Mercury comparison, one false New Horizons claim, one "first" that the page contradicts itself, and a ball/train status line that contradicts its own readout at the default setting. Each one is a wording or one-line code change.

---

## 1. Mathematics & Physics: approve-with-changes

Independently confirmed:
- Turn angle and Δv. Cassini (16.01 km/s, 1,171 km, R⊕ 6,378.137): δ = 19.67°, |Δv| = 5.469 km/s. JPL says "about 5.5". NEAR: δ = 66.9°. MESSENGER: δ = 94.7°.
- Hohmann figures. Neptune: 11.656 km/s, 30.78 yr. Jupiter: 8.793 km/s, 2.732 yr. Voyager 2 launch to Neptune: 12.01 yr.
- Escape speeds. Solar escape at Jupiter's distance is 18.465 km/s; the 8.8 km/s launch with a 1.05 R_J pass leaves at 18.605 km/s.
- Jupiter's speed change in the train model is 1.754 × 10⁻²⁰ m/s.
- The frame transformation and the identity |v_out|² − |v_in|² = 2V·Δv are exact because |u_in| = |u_out|.
- Δv lies along the apse line and points from periapsis toward the planet's centre, so "periapsis behind ⇒ gain" is exact.
- Edge case: the two in-plane Δv directions are θ ± (90° + δ/2), not opposite. When the approach direction u is within δ/2 of anti-parallel to V, both have a component along V. The CH5 text and the status lines describe this correctly.
- The hyperbola drawing is correct: the asymptote angle is atan2(e − 1/e, sin f∞), and the mirroring matches the rotation sense.

Findings:
1. **MUST — Jupiter "falls one atom behind" is wrong orbital mechanics.** The readout row is `JUPITER FALLS ONE ATOM (0.1 nm) BEHIND AFTER … years` (≈181 yr, computed as 0.1 nm ÷ Δv). A planet slowed along its track drops to a lower orbit with a shorter period, so over time it drifts **ahead** of where it would have been. The secular along-track drift is about 3|Δv|·t (Clohessy–Wiltshire), so it is one atom *ahead* after about 60 yr. It is never behind. This also contradicts the guide's own correct line, "drops very slightly in its orbit". Fix: replace the row with the orbit change, Δa = 2aΔv/v ≈ 2 × 10⁻¹² m.
   EN: `JUPITER'S ORBIT SHRINKS BY` → `2.1 × 10⁻¹² m (about a fiftieth of an atom)`
   RU: `ОРБИТА ЮПИТЕРА УМЕНЬШИТСЯ НА` → `2,1 × 10⁻¹² м (около пятидесятой доли атома)`
   Compute it as `2*PL.jupiter.a*1e3*r.dv2*1000/(vCirc(PL.jupiter.a)*1000)`, and add a check.
2. **MUST — the ball/train status contradicts the readout.** The mass slider defaults to `value="1"`, which is 1 : 10. With u = 10 and V = 5, the ball leaves at 17.27 km/s. The status line still says "Seen from the platform, it leaves at u + 2V" (= 20). At 1 : 1 the ball leaves at 5 km/s, the readout shows `BALL GAINS +−5.00 km/s`, and `TRAIN SLOWS BY 1.50 × 10⁴ m/s`, although the train actually reverses. (The "seen from the train … u + V in and out" half is true for any mass, because an elastic collision preserves relative speed.)
   Fix: when f > 1e-3, say "…from the platform it leaves at [value]; the lighter the ball compared with the train, the closer that gets to u + 2V". Also format the gain with its real sign. Simplest fix: set the slider minimum to 2 (1 : 100) and change the default to 3.
3. SHOULD — two different Earth radii. `checks.js` and the eq-note ("Cassini at 1,175 km gives v_p = 19.025") use R = 6,371 km. The instrument and the Δv check use 6,378.137 km. With the page's own radius, v_p = 19.023, and the preset shows 19.02. Either say "with the mean radius 6,371 km used in the table" in the note (EN/RU) or use one radius throughout.
4. SHOULD — imprecise wording. "The speed grows exactly when the velocity change Δv points along the planet's motion" → "…when Δv has a component along the planet's motion" / RU "…когда у Δv есть составляющая вдоль движения планеты". The identity uses a dot product, and Δv is almost never parallel to V.
5. NICE — `checks.js` checks whether "behind ≥ in front", but not the stated geometric rule. Add a check that, for side = +1 with gain > 0, the periapsis direction (−Δv̂) has a negative component along V.

## 2. Professor of Physics (misconceptions): approve-with-changes

The "not free energy" chapter is good. It refutes the "keeps the infall speed" story, uses the planet frame versus the Sun frame, gives the momentum bookkeeping, and is honest that the 180° bounce is an ideal limit.
1. **MUST** — finding 1.1 above. It plants the "slower ⇒ falls behind" intuition, which is the classic orbital-mechanics misconception, in a guide about orbits.
2. **MUST — the Mercury claim is false as written.** The text says "Falling toward the Sun, a probe gains speed all the way, so reaching Mercury is harder than leaving the Solar System." A Hohmann flight to Mercury needs a v∞ of 7.53 km/s. Escaping the Sun from 1 AU needs 12.34 km/s. *Reaching* Mercury is easier. *Stopping* there is harder: the arrival v∞ is 9.6 km/s, and capture needs at least 6.4 km/s more.
   EN: "…so stopping at Mercury — entering orbit around it — takes more propellant than leaving the Solar System."
   RU: "…поэтому остановиться у Меркурия — выйти на орбиту вокруг него — требует больше топлива, чем покинуть Солнечную систему."
3. SHOULD — EN says "a planet's gravity alone **gives back** on the way out exactly what it gave on the way in". Gravity *takes back* speed on the way out, so as written this reads as the misconception being refuted. Fix: "…**takes back** on the way out exactly what it gave on the way in". The RU line ("отнимает ровно столько, сколько дало") is already correct.

## 3. Research / fact-check: approve-with-changes

Verified against primary sources:
- [2] NASA Voyager: "about every 175 years", "30 years to 12", launch 20 Aug 1977, Jupiter 9 Jul 1979, Saturn 25 Aug 1981, Uranus 24 Jan 1986, Neptune 25 Aug 1989, "first demonstrated with … Mariner 10".
- [4] Caltech E&S: "spring of 1965 … grad student Gary Flandro … part-time … JPL … between 1976 and 1979", "once every 175 years".
- [1] Basics of Space Flight: Minovitch "championed … early 1960s", Io 90 kg, approach from behind/in front, "too small to be measured".
- [3] Siddiqi: Mariner 10 at 5,768 km on 5 Feb, "first to use gravity-assist to change its flight-path", Grand Tour cancelled in January 1972 at a projected $1 billion, 721.9 kg, Giotto as the first Earth assist (2 Jul 1990).
- [8] JPL Juno: speed relative to Earth unchanged, "boost … about 3.9 km/s" (the release says the flyby was meant to raise speed relative to the Sun).

The Anderson/Bertolami table values reproduce to within 0.004 km/s.

1. **MUST — New Horizons did not escape via Jupiter.** It launched directly onto a solar-escape trajectory at 16.26 km/s relative to Earth (C3 ≈ 158 km²/s²); Jupiter only made it faster. The page is wrong in three places:
   - CH5: "That is how Pioneer 10 and 11, Voyager 1 and 2 and New Horizons left the planets behind" (after "One pass of Jupiter turns a closed orbit into an escape").
   - jStatus: "Pioneer 10 and 11, both Voyagers and New Horizons all left this way".
   - LEGACY quote: "Every spacecraft that has left the Solar System got there on a planet's borrowed momentum". Besides New Horizons, no spacecraft has *left the Solar System* (the Voyagers have crossed the heliopause, not the Oort cloud).

   Fixes:
   - CH5 EN: "Pioneer 10 and 11 and both Voyagers reached solar escape with Jupiter's help (Pioneer 11 and the Voyagers with Saturn's too); New Horizons was launched fast enough to escape anyway, and Jupiter added about 14,000 km/h." RU: "«Пионеры-10 и -11» и оба «Вояджера» вышли на траекторию ухода от Солнца с помощью Юпитера (а «Пионер-11» и «Вояджеры» — ещё и Сатурна); «Новые горизонты» стартовали достаточно быстро, чтобы уйти и так, а Юпитер добавил около 14 000 км/ч."
   - jStatus: drop New Horizons.
   - LEGACY EN: "Every spacecraft now heading out of the Sun's grip took some of its speed from Jupiter — and Jupiter has never noticed." RU: "Каждый аппарат, уходящий сейчас из-под власти Солнца, взял часть скорости у Юпитера — а Юпитер этого так и не заметил."
2. **MUST — the Mariner 10 "first" contradicts the page's own Pioneer 10 claim.** The page says "The first spacecraft to use a gravity assist to change course was Mariner 10" (and the 1974 timeline row repeats it). Siddiqi and NASA do say this. But Pioneer 10's Jupiter flyby on 3 Dec 1973 (UTC 4 Dec) bent its path onto solar escape two months earlier, and the guide credits Pioneer 10 with exactly that in CH5.
   EN: "The first spacecraft to use one planet's gravity to reach another was **Mariner 10**…" RU: "Первым аппаратом, долетевшим до одной планеты с помощью тяготения другой, стал **«Маринер-10»**…"
   Also add a timeline row: "1973 — Pioneer 10 passes Jupiter on 3 December; the flyby puts it on a path out of the Solar System." / "1973 — «Пионер-10» 3 декабря пролетает Юпитер; пролёт выводит его на траекторию ухода из Солнечной системы."
3. SHOULD — Minovitch was a **UCLA** graduate student working summers at JPL ([1] says UCLA). The page's "a graduate student working at JPL" invites confusion with JPL staff. EN: "Michael Minovitch, a UCLA graduate student working summers at JPL" / RU: "Майкл Минович, аспирант Калифорнийского университета в Лос-Анджелесе, работавший летом в JPL". Apply the same change to the 1961 timeline row.
4. SHOULD — ref [7] has been published: Bertolami, Francisco & Gil, *Class. Quantum Grav.* 33 (2016). Cite the journal and keep the arXiv link.
5. NICE — Voyager 2 at Saturn: 25 Aug 1981 is the US date, as in [2]; the closest approach was 26 Aug UTC. This is consistent with the source, so no change is needed. Optionally add "(US dates)" to the note.

## 4. Science Communication, Education & Linguist: approve-with-changes

The text is clear and well paced, with a good analogy and honest model labels. EN/RU parity is complete (0 missing). RU number formatting (decimal comma, thin-space thousands, "а. е.") is correct.
1. SHOULD — the Russian term. "сшитые конические сечения" is not the established term. Russian astrodynamics uses "метод сопряжённых конических сечений" (or "метод сфер действия"). Replace it everywhere: eq label, eq-note, CH5 note.
2. SHOULD — v∞ in RU: "её называют v∞ («вэ-бесконечность»)" → "её называют гиперболическим избытком скорости, v∞". The reference note already uses that term. In EN, consider adding "(the hyperbolic excess speed)".
3. SHOULD — mission names in RU are mixed. Cassini, Galileo, MESSENGER and Giotto are left in Latin script, while «Юнона», «Новые горизонты», «Маринер-10» and «Вояджер» are in Cyrillic. Pick one convention; the Cyrillic forms «Кассини», «Галилео», «Мессенджер», «Джотто» are standard in Russian media.
4. NICE — RU kicker "«БОЛЬШОЙ ТУР» «ВОЯДЖЕРА-2»" has two quoted names back to back. "«БОЛЬШОЙ ТУР» АППАРАТА «ВОЯДЖЕР-2»" reads better.
5. NICE — NOTES.md says "Eight chapters … REFERENCES isn't counted", but the page (correctly, per site convention) says Nine. Update NOTES.

## 5. Information Design & Frontend accessibility: approve-with-changes

Honest: the flyby panel really is to scale (planet and hyperbola share one scale, and it is labelled). The velocity triangle uses one scale for all vectors, with a v∞ circle. The escape plot labels its log axis. The bounce is labelled "toy scale". The Grand Tour bars start at 0. There are no drag-only interactions; everything is a slider or a button. Groups use aria-pressed, labels are tied to sliders with `for`, buttons are ≥ 44 px (extra.css), the slider hit area is 28 px, and the animation stops under reduced motion and off screen.
1. SHOULD — sliders announce raw values. `tH` is a 0–1000 logarithmic index and `bM` is an exponent from 0 to 8, so a screen reader reads meaningless numbers. Set `aria-valuetext` from the same string written to `#tHVal`, `#bMVal` and the others in each render.
2. SHOULD — screen-reader text is English-only. SVG `aria-label`s and group `aria-label`s ("Planet", "Which side", "Real flybys", "Preset") stay English in RU mode. Add `data-en-aria`/`data-ru-aria` handled in `applyLang` (a helpers.js change benefits every guide), or set them in each render with `T()`.
3. SHOULD — small SVG text at phone width. `.svg-small` is 9.5 px in a 480-unit viewBox, which renders at about 7 px at 390 px width. Its fill #7a7a74 is about 3.9:1 on paper, below AA for small text. Non-selected Grand Tour bars (#c9c9c1 ≈ 1.5:1, #9fb3d6 ≈ 1.9:1) fail the 3:1 non-text contrast rule. Raise the SVG font size (or switch to a narrower viewBox under 600 px), darken the small text to ≥ 4.5:1, and darken the inactive bars to ≥ 3:1.
4. NICE — `aria-live="polite"` status regions rewrite on every slider `input` event, which is chatty. Update the live text on `change`, or debounce it.
5. NICE — under reduced motion the bounce freezes in the approach phase (bT = 0), so the outgoing ball is never drawn. Draw both states statically.

## 6. Ethics (attribution, misleading claims): approve-with-changes

1. SHOULD — "The idea of using planets as stepping stones was worked out in the early 1960s" erases earlier proposals: Friedrich Zander (1920s) and Yuri Kondratyuk on using planetary gravity, and Gaetano Crocco's 1956 one-flyby Mars–Venus tour. Russian-speaking readers will know Цандер and Кондратюк. Even without opening those primary sources, hedge the claim.
   EN: "The idea had been floated before; in the early 1960s Michael Minovitch … computed such trajectories in detail and championed the technique [1]."
   RU: "Идею высказывали и раньше; в начале 1960-х Майкл Минович … подробно рассчитал такие траектории и отстаивал этот метод [1]."
2. SHOULD — the Minovitch–Flandro priority dispute is real: Minovitch long argued that his work underpinned the Grand Tour. The page presents both men without favouring either, which is fair. Add one neutral sentence so readers aren't left with an implied hierarchy. EN: "How much credit each deserves is still argued over." RU: "Чья заслуга больше — спорят до сих пор."
3. The New Horizons / "left the Solar System" overstatement (3.1) is also a misleading-claim issue; it is covered there.
4. Luna 3 is handled carefully: the page does not call it the first gravity assist. Good.

---

## Consolidated MUST-FIX
1. **Jupiter "falls one atom behind" readout** (script.js, `bJup` row): this is wrong, because a slowed planet drifts *ahead*. Replace it with the orbit shrinking by ≈2 × 10⁻¹² m (EN/RU text in 1.1).
2. **Ball/train status contradicts the readout at the default 1 : 10 ratio**, and the readout shows "+−5.00" at 1 : 1. Make the status mass-dependent and fix the sign, or set the slider minimum to 1 : 100 (1.2).
3. **"reaching Mercury is harder than leaving the Solar System"** → "stopping at / entering orbit around Mercury…" (2.2).
4. **New Horizons did not escape via Jupiter**, and nothing has "left the Solar System": fix the CH5 text, jStatus and the LEGACY quote (3.1).
5. **Mariner 10 "first to use a gravity assist to change course"** conflicts with Pioneer 10's Jupiter flyby in Dec 1973, which the page itself credits. Change to "first to use one planet's gravity to reach another" and add a 1973 timeline row (3.2).
