# PASSENGER — Animals in space and the biology flights (Wave 7)

**Purpose:** what the animal flights of 1947–1968 (and the later biosatellites) actually measured and proved for the first human flights, with each animal's fate stated plainly. **Audience:** interested non-specialists; equations sit in eq-boxes. **Owner:** Wave 7 author (agent), 2026-10-22. **Category:** `dawn`. **Codename:** PASSENGER («ПАССАЖИР»).

## Outline (written before drafting)
9 chapters, lede "Nine chapters and three instruments" (every chapter counts, LEGACY and REFERENCES included).
1. Sounding rockets — V-2 fruit flies (Blossom, 1947), Albert I/II/IV, Dezik & Tsygan (1951), Dezik's death; eq-box: free-fall time on a 110 km arc.
2. Sputnik 2 — Laika; **instrument 1:** one-node cabin heat balance, as-flown vs satellite-alone toggle, UA slider, dog-heat slider (Kleiber at rest / agitated), orbits shaded, 5–7 h window, 40 °C line.
3. Round trip — Korabl-Sputniks: 28 Jul 1960 failure, Belka & Strelka (vomiting → one-orbit limit), Pchyolka & Mushka, Kometa & Shutka, Chernushka, Zvezdochka; eq-box: 17.4 orbits.
4. Ham — MR-2 from SP-39 and the Mercury chronology; **instrument 2:** 2-D ballistic integration from Redstone cutoff (1976 atmosphere), speed + angle sliders, presets Ham / Shepard / slower; Allen–Eggers eq-box (links ENTRY guide).
5. Enos — MA-5, lever malfunction, death in 1962 (unrelated); orbit-period check; links ASCENT guide.
6. Beyond — Félicette, Kosmos 110, Zond 5 tortoises, Bion, Bion-M No. 1 and No. 2.
7. What it proved — **instrument 3:** 14 flights × 7 questions matrix with filters and a detail panel; text on what was and was not proven; ethics, Gazenko 1998 quote.
8. Legacy — timeline (15 entries) + closing line.
9. References — 28 sources.

Links instead of duplication: BEEP (Sputnik 2 launch story), FIRST (Vostok, Titov's sickness), ASCENT (Glenn/Shepard), ENTRY (Allen–Eggers derivation).

## Sources per number
- Fruit flies 20 Feb 1947, Blossom, radiation purpose — WSMR Museum [2], NASA [1]. Albert II 14 Jun 1949, 83 mi, died on impact; Albert I/IV; R-1 dogs 1951–52 (nine dogs); Dezik & Lisa; Kosmos 110 (21 days); Zond 5 ~20 g; Bion list incl. Multik — NASA "Brief History of Animals in Space" [1].
- Dezik & Tsygan 22 Jul 1951, R-1V, ~110 km — Guinness [3]. NASA [1] gives 15 Aug 1951: discrepancy stated in the text.
- Sputnik 2: 508.3 kg — NASA chronology [5]; 212 × 1,660 km, 103.7 min, "Blok A core did not separate as planned", insulation tore loose, interior 40 °C, Laika ~6 kg, re-entry 14 Apr 1958 after 162 days — NSSDCA (archived 2019) [4]. Fan above 15 °C, pulse tripled, temperature/humidity rose, no life signs after 5–7 h, previous "about a week" story — BBC 2002 [6] (fetched with curl; WebFetch was blocked). 7-day life support, 3rd/4th orbit from post-flight simulation, paper IAC-02-IAA.2.2.05 — Grahn (archived) [7]. "Designed from the outset to remain attached" — RussianSpaceWeb [8]; 7.5 t / 7.79 t — [9].
- Korabl-Sputnik 2: 306 × 339 km, 90.6 min, 1 d 2 h 23 min (17–18 orbits), 2 rats, 40 mice, Belka's vomiting on orbit 4 and Yazdovsky's one-orbit demand, 28 July failure — RSW [11]. KS-3 [12], 22 Dec 1960 [13], Chernushka [14], Zvezdochka [15].
- MR-2: apogee 136.2 nmi, range 363 nmi, 17.0 g (escape rocket), 14.6 g at T+9:36, 6½ min, HR 94/158/173, RT 0.82 vs 0.80 s — SP-39 [16]. Thrust "considerably higher than planned", 24 Mar 1961 booster development flight — SP-4001 p2b [17]. 5,857 mph — NASA [1].
- MR-3: 116.5 mi, 302 mi, slightly < 12 g, ~5 min weightless — SP-4001 p3a [18]; 7,388 ft/s inertial at cutoff, 11.0 g at ~83,000 ft — MR-3 proceedings [19].
- MA-5: 99.5 × 147.4 mi, 88 min 26 s, two orbits, 7.8 g, 3 h 21 min, 200 mi south of Bermuda, 1,263 h training, lever malfunction, "virtually meaningless" — SP-39 [16]; Enos's death 4 Nov 1962, unrelated — SP-4001 p3b [21].
- Félicette 18 Oct 1963, ~5 min weightless, euthanised 2 months later, little learned, ISU statue — Guinness 2025 [22]; ~157 km, Hammaguir — NSS [23].
- Zond 5: launch 14 Sep 1968, 1,950 km on 18 Sep, Indian Ocean 21 Sep, tortoises −10 % weight — NSSDCA archived [24].
- Bion-M No. 1: fewer than half of 53 rodents — Moscow Times 2013 [25]. Bion-M No. 2: 75 mice, 10 died, 20 Aug launch, Orenburg landing — Interfax [26]; 30 days, ~97° — L. David [27].
- Gazenko 1998 quote — Dogs in the News 2002 (archived) [28]; also matches moscowanimals.org (archived), not cited.
- GM, R — NASA Earth fact sheet [10]; densities — U.S. Standard Atmosphere 1976 [20] (values typed from the standard table; the NTRS record was opened, the PDF table was not re-read).

## Computed (checks.js, 57 checks — 50 by the author + 7 added in review)
Free fall 3.4 min above 60 km on a 110 km arc; Sputnik 2 period 103.6 min; Kleiber 13.0 W; heat model crosses 40 °C at 5.55 h (orbit 4), 42 °C at 7 h, Teq 52.7 °C, τ 5.6 h, alone ≤ 19.4 °C; KS-2 period 90.8 min (RSW 90.6) and 17.4 orbits; unit conversions (7,388 ft/s = 2,252 m/s; 5,857 mph = 2,618 m/s; nmi/mi to km); ballistic model: Shepard 187.4 km / 492 km (fitted), 11.17 g at 26.3 km and 5.3 min (independent); Ham 241.8 km (−4 %), 664.7 km (−1 %), 14.61 g, 6.49 min (all independent); Allen–Eggers at 80 km 20–35 % low, gap narrowing with speed; MA-5 period 88.3 min.

## Assumptions / known limitations
- **Heat model is a teaching model, not a reconstruction.** C = 30 kJ/°C, Q_eq = 15 W, T_s = 0 °C, 65 % sunlit, as-flown 60 W extra in sunlight + UA 1.5 W/°C, alone 15 W + UA 2.6 W/°C, start 18 °C — all invented and tuned so the as-flown case crosses 40 °C in orbit 4. No published temperature telemetry was found. Stated on the page.
- Ballistic model: point mass, spherical non-rotating Earth, still air, β = 245 kg/m² assumed, cutoff 42.5 km / 50° fitted to Shepard's apogee and range. NASA's speed figures mix inertial/max-speed definitions (Shepard 5,036 mph inertial at cutoff [19] vs 5,180 mph max [18]; Ham 5,857 mph [1]); the model uses Ham's 5,857 mph as the cutoff speed — the good fit to SP-39 may be partly fortuitous. Peak g is sensitive to β (≈ ±1 g for β 150–400 kg/m²).
- The matrix grades (●/◐/·) are editorial judgement, labelled as such.

## Unverified / judgment calls (reviewer: look hardest here)
- **Separation of Sputnik 2**: NSSDCA says failed separation; RussianSpaceWeb says by design. Both presented; the toggle is labelled "as flown / satellite alone (hypothetical)" rather than "separation failed / succeeded".
- "40 °C" is NSSDCA's number with no time attached; "by the 4th orbit" combines it with Malashenkov via Grahn. Malashenkov's paper itself was not opened.
- Laika's pre/peak pulse 103 → 240 (Wikipedia, West 2001) not used: source not opened.
- Dezik/Tsygan date conflict (22 Jul vs 15 Aug 1951) shown in text.
- Belka vomiting → one-orbit demand: RussianSpaceWeb only (citing Siddiqi); Siddiqi PDF download failed.
- MR-2 "planned" apogee/range/g not used (Wikipedia only); Shepard's MR-3 stands in as "the nominal profile", which the chronology supports only implicitly.
- Félicette altitude 157 km from the National Space Society (a light-toned piece); Guinness gives 13 min flight, NSS 15 min — duration not stated in the text.
- US Standard Atmosphere densities typed from memory of the standard table; check against the NTRS PDF.
- Bion-M No. 2 fly count (1,000 vs 1,500) varies by outlet — not stated.

## Freshness
claim | source URL | review-by date
- Bion-M No. 2 (Aug–Sep 2025) is the most recent flight in the Bion series "as of October 2026" | https://interfax.com/newsroom/top-stories/113900/ (and web search 2026-10-22: Bion-M No. 3 preparations to start in 2026, no launch found) | 2027-04-01
- Ten of 75 mice died on Bion-M No. 2 (preliminary institute statement) | https://interfax.com/newsroom/top-stories/113900/ | 2027-04-01

## Wiring (for the coordinator)
- `python3 wire.py passenger-animals-in-space PASSENGER "Animals in Space: Laika, Belka & Strelka, Ham" "Животные в космосе: Лайка, Белка и Стрелка, Хэм" dawn "<llms line>"`
- llms.txt: `The animals that flew before people, 1947–2025: Sputnik 2's cabin heat balance and why Laika died within hours, Belka and Strelka's first return from orbit, Ham's Mercury-Redstone 2 ballistic arc (14.6 g instead of Shepard's 11) from a checked trajectory model, Enos, Félicette, the Zond 5 tortoises and the Bion biosatellites — and what each answered for Gagarin and Shepard.`
- MOD.json: 4 candidate rows (Sputnik 2, Korabl-Sputnik 2, MR-2, Zond 5); none of these dates exist in mission-of-day.js.

## Response to review (2026-10-23)
Independent panel verdict: APPROVE WITH CHANGES (see REVIEW.md). All MUST items applied:
1. Heat instrument labelled as a model: the axis reads "modelled cabin temperature, °C (not telemetry)", the status begins "In this model…", and the HUD label reads "CABIN (MODEL)". The note now says the parameters were chosen by us to cross NASA's 40 °C (which has no time attached) in the orbit where the simulations put her death, and that no source dates 40 °C.
2. Ballistic note: Shepard's 7,388 ft/s is inertial at cutoff, while NASA does not define Ham's 5,857 mph. It is read as an inertial peak, since the ground-relative 7,540 ft/s plus the Earth's rotation comes to about 2,600 m/s. Fed 7,540 ft/s, the model gives 11.6 g; β from 150 to 400 kg/m² gives 13.2–15.6 g. Three checks cover these numbers.
3. Below an 80 km apogee, the entry and Allen–Eggers readouts show "—". The trajectory and g axes extend at the slider extremes. Two checks cover this.
4. Separation: neutral wording ("on what matters here the sources agree…"). The 7.5-tonne core stage is replaced by the 7.79 t orbiting mass. The "satellite alone" status no longer implies a design intent.
5. Korabl-Sputnik 2: 28 of 40 mice died in flight (RSW [11]). This is now in the ch.3 text, the matrix (outcome "mixed" plus detail), the 1960 timeline entry, the ref [11] note and the MOD.json row. One check covers it. Lisichka and Chaika (28 July 1960) are named.
6. MA-5 ended because a roll reaction jet failed and an inverter overheated (SP-4001 p3a [18]). The cabin temperature rose and then levelled off (SP-39 [16]). Fixed in the body, the matrix and the ref [18] note.
7. Closing line changed to "short by choice…", so it no longer contradicts ch.3. "That is why" became "That is a large part of why". "Blown up by design" became "destroyed by its own self-destruct charge".
8. "No way to bring her back" now cites [4][7].
SHOULD items left open are listed at the end of REVIEW.md. Verified in review: SP-39, the MR-3 proceedings, Grahn (3rd/4th orbit from post-flight simulations; Malashenkov's paper itself is still not online), NSSDCA, BBC, the RSW pages, Guinness/NSS, Interfax. The 1976 densities match the standard's layer equations to ≤ 0.002 %.
