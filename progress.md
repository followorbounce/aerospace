# Progress — Aerospace Knowledge Hub

## Status
- ~60 article HTML files covering space programs, missions, telescopes, and adjacent field guides (physics, logic, music theory).
- Shared site system, cross-page nav, and SEO/a11y baseline introduced (commit `41e44f0`).
- Working tree clean; up to date with `origin/main` (checked 2026-10-02). All reference links clickable (2026-09-25).
- Remote: `github.com/followorbounce/aerospace`.

## Recent work (most recent first)
- 2026-09-22 — **Added TRANSFER — Earth to Mars** (`transfer-earth-to-mars.html`, Mars Exploration category). 9 content chapters + LEGACY + REFERENCES, bilingual EN/RU, 8 interactives: live Kepler-equation orbit viewer from JPL mean elements (validated against the 2003/2018/2020 close approaches to ~0.1 M km) + 2000–2045 distance chart; computed launch-window dates; aimable Hohmann animation (hit/miss); tangent-departure transfer family (days vs Δv); Δv/rocket-equation budget; radiation dose calculator on MSL RAD measured rates (1.84 / 0.64 mSv/day) vs NASA 600 mSv limit; Pu-238 RTG decay; light-delay signal sender; Mars-vs-Earth table + weight; real mission cruise-time bars. 12 references, URLs checked. Wired into pages.json/index.html/llms.txt/sitemap.xml. Verified in headless Firefox (desktop EN, mobile RU). Committed `fa71336` and pushed.
- 2026-09-16 — Added CLAUDE.md and progress.md for ongoing tracking.
- Added RESONANCE — The Mathematics of Music field guide page (pushed).
- Added CASCADE — Physical Computing field guide page.
- Expanded THRESHOLD (Common Ground & Basic Logic) to 13 chapters with 5 interactive elements.
- Added IMPULSE — The Physics of Spaceflight field guide page.
- Added REFERENCES sections to 22 pages, fixed 11 dead agency links.
- Added the 12 remaining field-guide articles; introduced shared site system + nav + SEO/a11y baseline.

- 2026-09-19 — Added a Cloudflare Web Analytics beacon (cross-repo rollout across every deployed followorbounce/client site). See [[cloudflare-analytics-setup]] in the assistant's memory for the account/token map.

## Next steps- 2026-10-02 — Science/maths review of interactives (Hohmann, Kepler solvers, rocket equation, radiation, music cents — all verified numerically). Fixed: `physics-of-spaceflight.html` Δv ladder GEO 12.2 → 13.3 km/s (LEO 9.4 + coplanar Hohmann 2.46 + 1.48); `iss-and-mir.html` Newton-cannon ellipse now has perigee at the launch point (e = (v/7.9)² − 1) instead of dipping inside Earth above ~9 km/s; third-cosmic-velocity text (EN+RU) corrected — 16.6 km/s is relative to Earth, ≈42.1 km/s heliocentric. No broken internal links (resolving /aerospace/ base + extensionless URLs); all 50 inline scripts pass `node --check`.

- ~~Resolve the stray/duplicate-looking files~~ — checked 2026-10-02: `build-your-own-cubsat.html`, `ISSandMir.html`, `unfold-james-webb.html`, `equilibrium-lagrange-points.html` and `time philosophy/` are all deliberate noindex redirect stubs (meta refresh + `location.replace`) to the canonical pages, kept so old/indexed URLs keep working. `lagrange-points.html` is the canonical Lagrange page. Keep the stubs; nothing to delete.
- Planned: PARABOLA — optical/RF reflector field guide (workspace roadmap P2.1, `/home/none/git/roadmaps/roadmap-2026-10.html`).
- No other open TODOs found in-repo; check `AGENTS.md` workflow protocol before larger changes.

- 2026-10-02 — **Added PARABOLA — Mirrors, Dishes & the Focus** (`parabola-mirrors-and-dishes.html`, Space Telescopes category; workspace roadmap step 2.1). The chapters:
  - CH1: ray tracer (parabola vs sphere, f/D, off-axis coma, equal-path proof).
  - CH2: sphere-vs-parabola tolerance calculator (λ/8, best focus), plus Hubble's flaw recomputed from the conic constants (ΔK·r⁴/8R³ = 2.2 µm at the edge, matching NASA).
  - CH3: Airy pattern and two stars merging (Rayleigh dip 73.5%), with instrument presets from the eye to the EHT.
  - CH4: collecting area to scale and the 8.4 m single-mirror limit.
  - CH5: Webb's 18-segment pupil with a real 256² FFT image; the commissioning stages go from 18 spots to stacked to coarse to fine phasing.
  - CH6: Ruze surface-accuracy calculator (ALMA, GBT) and the FAST sphere-to-paraboloid fit (±0.36 m computed).
  - CH7: conic-constant explorer and a traced Cassegrain.
  - CH8: focal-plane table.
  - CH9: timeline. CH10: 16 references, every URL checked.

  Bilingual EN/RU. Wired into pages.json, index.html, llms.txt and sitemap.xml.

  Verified (jsdom + Node, 25 checks): a parabola focuses every ray exactly; J₁ first zero; Rayleigh dip 0.735; Ruze λ/16 = 54%; FFT Strehl agrees with Maréchal (0.996/0.996, 0.682/0.674); every data-en has a data-ru; citations only go up to [16]; no script errors. Headless-Firefox screenshots checked at desktop and 390 px.

  Not verified: real-device touch, or how the slider interactions feel on a GPU.

## 2026-10-08 — Wave 1 of the article plan (done)
- Added BEEP (Sputnik/Explorer, new "Dawn of the Space Age" category), FIRST (Vostok & Voskhod), FURNACE (Venera & Vega, in Deep Space Probes), VESSEL (Shenzhou, in Human Spaceflight). Each: bilingual EN/RU, 3–4 interactives with jsdom numerical checks (all pass), references URL-checked; facts from NASA SP-2018-4041 *Beyond Earth*, NASA history pages, Spacefacts, ESA, peer-reviewed papers.
- **Remaining: RABBIT (Chang'e & the far side)** — body text written and fact-checked (draft in `~/.cache/aero-src/w1-drafts/rabbit/`), script not yet written: tidal-lock animation, Earth–Moon L2 relay geometry (L2 from the CR3BP quintic, γ≈0.168 → ~64,500 km beyond the Moon; offset must exceed ~2,000 km to be seen from Earth), lunar ascent rocket-equation calculator; refs: Beyond Earth, SpaceChina Queqiao 2018, Li 2019 Nature (CE-4), NAO CAS 1,731 g, Li 2021 Nature (2,030±4 Ma), Che 2021 Science, Nature news 2024, NAO CAS 1,935.3 g, Zhang 2024 Nature (2.8 Ga), STDaily Queqiao-2, NASA Moon fact sheet. Build with `w1-drafts/assemble.py`, test with `test.js`, wire with `wire.py`.
- `sitemap.xml` is regenerated by the GitHub Action from pages.json — don't hand-edit it (pull --rebase before pushing).
- Homepage aero-shader card in followorbounce.github.io still says "48 field guides" and missions with no guide (Sputnik, Explorer 1, Vostok, Voskhod 2, Venera 7, Shenzhou 5) should now get slugs (beep-sputnik-explorer, first-vostok-voskhod, furnace-venera-vega, vessel-shenzhou-program).
- 2026-10-09 — **RABBIT (Chang'e & the far side) added** in Moon Exploration: tidal-lock animation, Earth–Moon L2 relay geometry (γ = 0.1678 → 64,515 km beyond the Moon; minimum visible offset 2,029 km), lunar ascent rocket-equation calculator; 11 references; 8 jsdom checks pass. Wave 1 complete (5 articles, 48 → 53 guides).

## 2026-10-08 — Wave 2 of the article plan (done, 53 → 58 guides)
- **New category** `sun` — "The Sun & Small Bodies" / "Солнце и малые тела" (before `moon`): CORONA, COMET, SAMPLE, IMPACT. POLAR is in Deep Space Probes.
- **CORONA** (`corona-parker-solar-orbiter.html`): Δv to lower perihelion vs escape, heat-shield equilibrium temperature, vis-viva orbit; 11 refs.
- **COMET** (`comet-rosetta-philae.html`): solar power vs distance and hibernation, orbit around 67P (cm/s), Philae bounce height vs escape speed; 7 refs.
- **SAMPLE** (`sample-hayabusa-osiris-rex.html`): rocket equation (chemical vs ion), rubble-pile gravity on Itokawa/Bennu (kick a pebble), re-entry energy ∝ v² and heating ∝ v³ (OSIRIS-REx 44,500 km/h), returned-mass chart; 14 refs; 14 checks.
- **IMPACT** (`impact-dart-planetary-defence.html`): impact energy vs size (Chelyabinsk 19 m ≈ 500 kt), β/density → period change (ΔT/T = 3Δv/v with a fixed geometry factor f = 0.91; independently reproduces −33 min), warning time vs drift 3Δv·t with gravitational focusing; 9 refs; 11 checks.
- **POLAR** (`polar-juno-jupiter.html`): 53.5-day capture orbit vs the cancelled 14-day burn (≈ 0.39 km/s), time below 1 R_J per orbit, two-way Doppler shift (X/Ka), period history 53.5 → 43 → 38 → 33 d after Ganymede/Europa/Io; 9 refs; 7 checks.
- Kepler's equation: Newton's method started at E = M **diverges** for ~1 % of mean anomalies at e ≈ 0.98 (found by POLAR's numeric check); POLAR uses bisection. CORONA starts at E = π for e > 0.8 (verified robust); BEEP/TRANSFER have e ≤ 0.31 and are fine.
- Homepage (followorbounce.github.io) aero shader: +6 missions (Hayabusa return, Rosetta at 67P, Juno JOI, DART, OSIRIS-REx return, Parker perihelion) → 76, all with guides; card says 58.
- Not verified: real-device touch on the new sliders; Juno's status after the 25 Feb 2026 perijove (the page says "still at work in early 2026" only).
- Wave 3 (THRUST, RETURN, NOZZLE, ENTRY, LINK) not started — only if asked.

## 2026-10-09 — Wave 3 of the article plan (done, 58 → 63 guides)
- **New category** `rockets` — "Rockets & Engineering" / "Ракеты и техника" (before `foundations`).
- **THRUST** (`thrust-saturn-v-n1.html`): Apollo 11 ground-ignition weights (SP-2000-4029) through the staged rocket equation (ideal 12.46 km/s; one stage at 425 s = 10.40), N1 engine-out thrust-to-weight with KORD opposite-pair shutdowns (30 × 153.4 t ÷ 2,750 t), the four N1 failures (Siddiqi SP-2000-4408); 11 checks. Note: SP-4029's S-II fuel/oxidizer rows look swapped — only their sum is used.
- **RETURN** (`return-reusable-rockets.html`): illustrative two-stage model (assumed masses — SpaceX publishes none) for payload lost to a recovery Δv reserve, banded against the MIT IAC-18 ranges (downrange 10–20 %, launch site ~½); landing burn with Merlin min throttle 108,300 lbf (can't hover); FAA PEA Starship numbers; Booster 12 catch. 10 checks.
- **NOZZLE** (`nozzle-rocket-engines.html`): isentropic area–Mach, C_F vs altitude; checks: SSME 90.7/10.3 in → ε 77.5, RS-25 NASA SL/vac thrust gap implies a 90.4 in exit, model SL/vac 0.804 vs NASA 0.816, Isp 470,000/1,035 = 454 s. 9 checks.
- **ENTRY** (`entry-heat-shields.html`): Allen–Eggers ballistic entry (RK4 cross-check), Apollo 11 36 g ballistic vs 6.56 g flown (L/D 0.3), Sutton–Graves stagnation heating vs nose radius, Stardust 12.9 km/s / PICA, Orion Avcoat char loss → Artemis II (10 Apr 2026) reduced. 9 checks.
- **LINK** (`link-deep-space-network.html`): link budget reproducing JPL's Voyager 2 1996 DCT (−145.46 vs −145.5 dBm, 39.89 vs 39.9 dB-Hz) with η = 0.65; gain/beamwidth; Voyager 1 one light-day 18 Nov 2026. 10 checks.
- Homepage aero shader: +4 missions (first N1, Stardust return, first Falcon 9 landing, Super Heavy catch) → 80; card says 63. Future-dated missions deliberately not added (the panel shows "N days ago").
- Wave 3 tooling: ~/.cache/aero-src/w3/ (same scripts as w2; sources in src/, src2/, src3/).
- Not verified: real-device touch on the new sliders.

## 2026-10-09 — Wave 4 (done, 63 → 68 guides)
- **New category** `orbit` — "Earth Orbit & Applications" / "Околоземная орбита и её применение" (before `stations`): NAVIGATOR, SUNSYNC, DEBRIS. SUIT is in Human Spaceflight; SAIL in Future Exploration.
- **NAVIGATOR** (`navigator-gps.html`): 2-D pseudorange fix with/without solving for the receiver clock (Gauss–Newton), relativity per altitude (Ashby 2003: 4.4647e-10, 38.6 µs/day, factory 10.22999999543 MHz, zero at a ≈ 9,545 km — all reproduced), flat-sky DOP. 10 checks.
- **SUNSYNC** (`sunsync-earth-observation.html`): J2 sun-synchronous inclination reproduces Landsat 9 (98.21 vs 98.2), Sentinel-2 (98.54 vs 98.62), Landsat 1 (99.11 vs 99.2) within 0.1°, periods within 0.5 min; swath → revisit estimate (Sentinel-2 10 d exact, Landsat 15 vs real 16); diffraction-limited GSD. 10 checks.
- **DEBRIS** (`debris-space-junk.html`): impact energy vs fragment size and crossing angle with the ODQN 40 J/g shattering threshold; drag-decay lifetime from approximate US Std 1976 densities (NASA's 1976 PDF is a scan — values used are the standard table, flagged as approximate) matching NASA ODPO's "several years below 600 km / centuries at 800 / ≥ 1,000 years above 1,000 km"; Fengyun-1C, Iridium–Cosmos, Kessler 1978, FCC 5-year rule. 10 checks.
- **SUIT** (`suit-spacesuits-eva.html`): suit pressure vs R (11.6/P), 360-min single-compartment prebreathe; the Shuttle staged protocol (60 min O₂, 12 h at 10.2/26.5 %, 75 min) gives R = 1.652 vs NASA's 1.65 limit; ISS campout capped at 8 h 40 min. 8 checks.
- **SAIL** (`sail-solar-sails.html`): 2S/c = 9.08 µN/m²; IKAROS 196 m² with η·cos²α ≈ 0.63 reproduces JAXA's measured 1.12 mN; 35.26° tacking optimum; 1/r² Δv accumulation; LightSail 2 (+2 km apogee in 4 days, +7.2 km in a month), ACS3, IKAROS ops ended 15 May 2025. 7 checks.
- Homepage aero shader +5 missions (Landsat 1, NAVSTAR 1, first Shuttle EVA, Iridium–Cosmos, IKAROS — UTC 2010-05-20) → 85; card 68.
- Tooling in ~/.cache/aero-src/w4/ (copy `ffa/` profile into a new wave dir or shot.sh fails).
