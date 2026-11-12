# TOUCHDOWN — The new lunar landers, 2019–2026 (Wave 8)

**Purpose:** explain why the 2019–2025 wave of robotic lunar landers so often failed (and how five succeeded), organised by the four physical problems of a landing (propellant margin, knowing your height, landing accuracy, staying upright), with a dated scorecard of every attempt. Every number is cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes, models labelled as models.
**Owner:** Wave 8 author (agent), 2026-11-12. **Category:** moon. Neighbours not duplicated: VALOR (Chandrayaan-2/3, only in the scorecard here, linked), RABBIT (Chang'e 4/5/6, scorecard only, linked), TRANQUILITY (Apollo; LM numbers used only as engineering reference), DESCENT/luna-programs (linked from the Luna-25 sentence).

## Outline (9 chapters, lede "Nine chapters and five instruments")
1. No air, no GPS, no second try. Eq-box: circular speed at Apollo's 60-nmi orbit (computed 1.629 km/s, printed live); periapsis speed at 15.24 km ≈ 1.69 km/s ≈ 6,100 km/h vs ispace's "about 6,000 km/h".
2. 2019: Beresheet (IMU restart → engine off; 14 km; 150 m at 500 km/h; LRO 10 m smudge), Vikram (brief, link VALOR), Chang'e 4 (brief, link RABBIT).
3. The braking burn. **Instrument 1**: descent Δv budget (Hohmann deorbit from 111.12 km + periapsis speed + g × vertical-phase seconds), rocket equation → propellant share, hover seconds per 1 % of mass. Presets: Apollo 11 profile (15.24 km, 140 s, 305 s), braking from 20 km (ispace M2, periapsis only).
4. Knowing your height: HAKUTO-R M1 (filter rejects true readings at a crater rim, ~5 km error, fuel out, free fall), IM-1 safety switch + NDL, IM-2 noisy altimeter, Resilience late LRF (42 m/s). **Instrument 2**: altitude-filter model — step vs rejection threshold, reserve → hover time, fall time and impact speed.
5. Landing ellipse vs pinpoint: Chandrayaan-3 4 × 2.4 km box, SLIM crater matching, 100 m goal, ~10 m before avoidance, engine lost at 50 m, 55 m east; Blue Ghost 100 m target. **Instrument 3**: 3σ ellipse on a synthetic crater field, blind hazard probability and with a last-moment divert.
6. Staying upright: IM-1 (6 mph down, 2 mph sideways, pad caught), IM-2 on its side in shadow, SLIM two-step landing and upside-down end, LM envelope (167 in, 10/4 ft/s, 12°, Apollo 11 2.1/1.7 ft/s), Blue Ghost 2 × 3.5 m. Eq-box tip-over energy criterion. **Instrument 4**: tip-over envelope (h, b, slope, sideways speed; side view + v_crit vs slope chart).
7. Scorecard: Luna-25 (127 vs 84 s), Peregrine (valve, re-entry), status of future missions as of 12 Nov 2026. **Instrument 5**: timeline + table of all 14 missions, filter all/government/private, counts, days since last attempt.
8. Legacy — timeline 1969, 2019–2026 (7 rows) + quote.
9. References — 36 sources.

## Sources per number
- GM_Moon 4,902.800 km³/s² — Park et al. 2021 DE440 [1]. R 1,737.4 km, g 1.62 m/s², v_esc 2.38 km/s, semimajor axis 384,400 km — NSSDC Moon fact sheet [2] (fetched 2026-11-12).
- Apollo: 60 nmi circular → 60 nmi × 50,000 ft descent orbit; powered descent from 50,000 ft; 10:1 throttling; Isp 305 lbf·s/lbm (end of duty cycle); hover phase = last 140 s of Apollo 11's PDI burn; 63.5 s hover remaining — TN D-7143 [3] (NTRS PDF downloaded, text extracted).
- LM landing gear: 167-in tread radius; 10 ft/s vertical, 4 ft/s horizontal (Vv ≤ 7 ft/s); effective slope ≤ 12° incl. protuberances/penetration; friction 0.4; Apollo 11 ≈ 2.1 and 1.7 ft/s horizontal — TN D-6850 [21] (NTRS PDF, text extracted).
- Beresheet: IMU shutdown, activation command → chain reaction → engine shutdown — Planetary Society [4]; problems from ~14 km, 5–6 restart attempts, contact lost at 150 m and 500 km/h — Times of Israel [5]; 11 April 2019, LRO image 22 April, ~10 m smudge — NASA [6].
- Vikram: 6 Sept (7 Sept India), 70.8810° S 22.7840° E, debris ~750 m NW, Shanmuga Subramanian — NASA [7].
- HAKUTO-R M1: LRO image 26 April "the day after the attempted landing" (→ 25 April UTC), debris 47.581° N 44.094° E — NASA [8]; ~5 km altitude while estimating zero, filter rejected sensor, crater rim, descended until fuel ran out, free fall, site changed after design review — Universe Today reporting ispace's 26 May 2023 findings [9] (ispace's own release URL now 404s; see unverified).
- Luna-25: 127 s instead of 84 s, pre-landing orbit, landing planned 21 Aug — SpacePolicyOnline quoting Borisov/TASS [10]; impact 19 Aug, Pontécoulant G inner rim, ~400 km short, ~10 m crater — NASA LRO [11].
- Chandrayaan-3: 4 km × 2.4 km at 69.367621° S 32.348126° E, LASA/LDV/LHDAC, 1,752 kg incl. 26 kg rover — ISRO details [12]; soft landing 23 Aug 2023, sleep mode 4 Sept — ISRO updates [13].
- SLIM: 100 m goal, crater matching, 50 m hazard imaging, radar → LRF at 50 m, two-step landing, 6–7° average slope, five 3-D-printed lattice legs — ISAS [14]; 0:20 JST 20 Jan 2024, ~55 m east, ≤10 m (possibly 3–4 m) before avoidance, one engine's thrust lost at 50 m, wrong attitude, solar cells west, 100 m achieved — JAXA 25 Jan 2024 [15]; ended 22:40 JST 23 Aug 2024, last contact 28 April, three lunar nights, ~10 m from target point — JAXA 26 Aug 2024 [16]; "appears to be upside down" — AP 25 Jan 2024 [36].
- Peregrine: launched 8 Jan 2024, propulsion problem, controlled re-entry South Pacific ~4:04 p.m. EST 18 Jan after 10 d 13 h — NASA [17]; pressure-control valve, helium into oxidiser tank, rupture, reproduced on ground — SpacePolicyOnline on the review board [18].
- IM-1: safety switch not disabled, NDL substituted, 6 mph down, 2 mph sideways (both above plan), footpad caught, ~1.5 km from Malapert A — AmericaSpace [19]; 22 Feb 2024, NDL data, 7 days of operations — NASA [20].
- Blue Ghost M1: launch 15 Jan 2025 with Resilience, 2 March, 18.562° N 61.810° E, ~4 km from Mons Latreille, 346 h daylight + 5 h night, last signal 16 March — NSSDC [22] (NSSDC says 08:45 UT; Firefly says 2:34 a.m. CST = 08:34 UTC; the guide gives the date only); 2 m tall, 3.5 m wide, low CoM/wide footprint, vision TRN + hazard avoidance, ten payloads — Firefly mission page [23]; "within its 100-meter landing target", first fully successful commercial soft landing — Firefly release [24].
- IM-2/Athena: six legs, tall hexagonal cylinder, launch 27 Feb 2025, touchdown 6 March ~17:30 UT, 84.7906° S 29.1957° E, on its side — NSSDC [25]; 250 m (IM) vs >400 m (NASA), crater shadow, "noisy" altimeter, ended ~12 h 45 min after landing — SpacePolicyOnline [26].
- Resilience: Mare Frigoris ~60.5° N 4.6° W, braking from ~20 km at ~6,000 km/h, LRF "delays in obtaining valid measurement values", Tenacious rover — Spaceflight Now [27]; hard landing 5 June 2025 UTC — NASA LRO [28]; 42 m/s impact, installation error judged unlikely — Universe Today on ispace's 24 June 2025 review [29].
- Chang'e 4: 3 Jan 2019, Von Kármán — Li et al. 2019 [30]. Chang'e 5: 11:11 p.m. Beijing 1 Dec 2020, 43.1° N 51.8° W — CASC/Xinhua [31]. Chang'e 6: 6:23 a.m. Beijing 2 June 2024 (= 22:23 UTC 1 June), Apollo crater — Space.com [32].
- Future missions: Chang'e 7 "does not meet the launch conditions", 23 Aug 2026 — AP [33]; Blue Moon MK1 and IM-3 "first part of 2027", Blue Ghost 2 later 2027, Griffin-1 then NET November — Aerospace America 15 Sept 2026 [34]; Griffin Mission One January 2027, Blue Moon Pathfinder early 2027, outcome labels — Wikipedia CLPS table retrieved 2026-11-12 [35] (secondary).

## Computed (checks.js, 56 checks, all PASS)
Surface gravity from GM/R², escape speed, unit conversions (nmi, ft, mph, ft/s, in), circular and periapsis speeds, 6,100 vs ispace 6,000 km/h (<2 %), deorbit Δv, gravity toll per minute (97.2 m/s), Apollo-style lower-bound budget (~1.94 km/s), rocket-equation inversion, hover time (thrust = weight), 5 km free fall (127 m/s, 79 s), filter accept/reject logic, 3σ containment 98.9 %, Chandrayaan box ↔ 3σ, synthetic field properties, monotonic ellipse risk and divert, tip-over statics/energy identity/monotonicity, Apollo 11 combined horizontal speed 0.82 m/s, scorecard tallies (5/3/5/1; 7 gov/7 private; 1 private upright of 6 arrivals; China 3/3), 525 days since 5 June 2025, JST/Beijing → UTC conversions, one-way light time ~1.28 s, UI (no NaN in EN/RU, aria-valuetext, translated chart labels, no Latin units in RU readouts, filters, presets).

## Assumptions / limitations
- Descent budget is a lower bound (no steering/gravity losses during the braking burn, no reserve). Start orbit fixed at Apollo's 60 nmi.
- Altitude filter is a cartoon of the failure mode, not ispace's software; threshold and reserve are free parameters; the hover time uses the Apollo engine's 305 s, not HAKUTO-R's engine.
- Landing-ellipse terrain is synthetic (seeded; N(>D) ∝ D⁻², 10–500 m, 6,000 craters, ~10 % hazard cover), every crater interior counts as hazard; cross-track σ = 0.6 × along-track; reading the 4 × 2.4 km box and the 100 m / 10 m figures as 3σ ellipses is a simplification (stated in the note).
- Tip-over: rigid point-mass, pivot at the downhill pad, no sliding/stroke/bounce, horizontal velocity only. Preset proportions are illustrative: CoM at half published height; Blue Ghost half-span = half its 3.5 m width; the 'tall & narrow' preset (h 2.15 m, b 1.3 m) is an assumed design standing in for Nova-C, whose dimensions/leg spread I could not source directly.
- Beresheet counted as "private" (privately funded non-profit with IAI).

## Unverified / judgment calls
- ispace's own press releases (M1 26 May 2023, M2 24 June 2025) return 404 from ispace-inc.com on 2026-11-12; their content is cited through Universe Today, Spaceflight Now and NASA. The M1 crater-rim height and M2 LRF altitudes were not published in what I could reach; left out.
- Nova-C dimensions (search snippet: 4.3 m tall, 1.6 m across; the same page also says 1.57 m × 4 m) not used in the text because I could not fetch the page; the tall preset is labelled ASSUMED.
- IM-2 root cause: no final report found; text says only "noisy" altimeter readings.
- Peregrine review findings via SpacePolicyOnline/search summaries; the Astrobotic PDF (PM1 post-mission report) downloaded but could not be text-extracted here.
- Luna-25 final commission report not found; the 127/84 s figure is Borisov's preliminary statement.
- Blue Ghost landing minute differs (NSSDC 08:45 UT vs Firefly 08:34 UTC); date only is used.
- SLIM "upside down" rests on AP's wire report [36]; JAXA's own release says only "different attitude than planned".
- Chang'e 4/5/6 details deliberately minimal (RABBIT covers them).

## Freshness
claim | source URL | review-by date
--- | --- | ---
"As of 12 November 2026 no lander has attempted a lunar landing since Resilience on 5 June 2025 (UTC)"; 525 days (AS_OF in script.js) | https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services , https://aerospaceamerica.aiaa.org/nasa-expects-one-lunar-launch-this-year-moon-base-manager-says/ | 2027-01-15
Griffin-1 (Astrobotic) listed for no earlier than January 2027 (Aerospace America 15 Sept 2026 said NET November 2026) | https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services , https://aerospaceamerica.aiaa.org/nasa-expects-one-lunar-launch-this-year-moon-base-manager-says/ | 2027-01-15
Blue Moon MK1 and IM-3 slipped to "the first part of 2027"; Blue Ghost M2 later in 2027 (as of 15 Sept 2026) | https://aerospaceamerica.aiaa.org/nasa-expects-one-lunar-launch-this-year-moon-base-manager-says/ | 2027-02-15
Chang'e 7 missed its August 2026 window, no new date announced | https://www.ksat.com/tech/2026/08/23/china-abruptly-postpones-ambitious-change-7-lunar-mission-launch/ | 2027-02-15
Scorecard of 14 missions, 5 upright / 3 down-not-upright / 5 crashed / 1 never arrived (add rows when new attempts happen; update AS_OF, the lede "fourteen…five", ch.7 status text, timeline 2026 row and checks) | (rows' own refs) | 2027-01-15
Outcome labels (IM-1 "partial failure", IM-2 "failure", Blue Ghost "first fully successful CLPS landing") | https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services | 2027-05-12
Beresheet, Luna-25, IM-2 causes are preliminary/company statements; check for final reports | https://www.timesofisrael.com/5-6-attempts-to-restart-israeli-moon-landers-engine-failed-investigation-finds/ , https://spacepolicyonline.com/news/luna-25s-engines-fired-longer-than-planned/ , https://spacepolicyonline.com/news/im-2-mission-ends-one-day-after-lunar-landing/ | 2027-05-12

## Wiring (for the coordinator)
- Index label EN: `The New Lunar Landers, 2019–2026` · RU: `Новые лунные посадочные аппараты, 2019–2026` · codename `TOUCHDOWN`, category `moon`.
- llms.txt: `The lunar landing attempts of 2019–2025 (Beresheet, Vikram, HAKUTO-R M1, Luna-25, SLIM, Peregrine, Odysseus, Blue Ghost M1, Athena, Resilience, with Chang'e and Chandrayaan in the scorecard): descent Δv budget and hover margin, an altitude-filter model of HAKUTO-R's 5 km fall, landing ellipse vs pinpoint on a synthetic crater field, a tip-over envelope from centre-of-mass height, stance, slope and sideways speed, and a dated scorecard of every attempt as of November 2026.`
- MOD.json: 4 rows (Beresheet, SLIM, Odysseus, Blue Ghost M1), type `land`/`moon`.
- related.json suggestion: valor-the-chandrayaan-mission, rabbit-change-far-side, tranquility-apollo-program, campaign-artemis-program. Neighbours that should link here: valor-the-chandrayaan-mission, rabbit-change-far-side, campaign-artemis-program (CLPS), scout-lunar-reconnaissance-orbiter (LRO found most of these impact sites).

## Response to review (2026-11-12, independent panel — see REVIEW.md)
Status re-verified today: no lunar landing attempt since Resilience (5 June 2025 UTC); Chang'e 7 still undated after the 23 Aug 2026 postponement; Griffin-1 NET Nov 2026 (Aerospace America) vs Jan 2027 (Wikipedia), not launched.
Changed (EN + RU):
- Chang'e 4 launched in Dec 2018: lede ("were on their way to a landing"), scorecard intro ("flown from January 2019 on … already on its way"), status line and og text reworded; "half of them private missions" instead of "built by companies".
- Odysseus: "in a crater near Malapert A, about 1.5 km from its intended site" (was "1.5 km from Malapert A") in body and scorecard.
- SLIM: JAXA's wording quoted [15]; "upside down" now "as the first pictures appeared to show [36]" / "apparently upside down" in row and summary.
- Ref [33] URL (ABC, 404) → same AP wire on KSAT; Freshness rows updated.
- Griffin-1 conflict between [34] and [35] stated in ch. 7 and the 2026 timeline row.
- RU: «гора Мутон» (was «плато Муто»), Blue Ghost M2 «на более поздний срок» (was «на конец»), «проектной экспертизы», «60 морских миль».
- checks.js: +5 checks (Chang'e 4 first row + 2018 disclosure, scorecard date range, SLIM hedge, Athena 12 h 45 min, mph conversions) → 61 PASS, ALL OK.
Left as SHOULD: Monte Carlo sampling error in the ellipse readout; CoM-assumption sentence; unify "side" colour; 390/1300 px screenshots before wiring; AP's "China Manned Space Agency" kept as quoted.
