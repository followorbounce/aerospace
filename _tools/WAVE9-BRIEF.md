# Wave 9 author brief (2026-11-14): orbits & spacecraft basics, 88 → 96 guides, plus two rebuilds

You are the author team for ONE guide on the Aerospace Knowledge Hub (`/Users/noone/code/aerospace`,
followorbounce.github.io/aerospace/). The guide is generated from sources in `_tools/articles/<slug>/`.
Wave 9 is the foundation layer of the plan to double the site: later mission guides will link to these pages,
so they must be exact, self-sufficient and teach the idea from first principles.

## Read first (in this order)
1. `CLAUDE.md` (repo; the last section describes the build as it is now) and `_tools/README.md`: layout, pipeline,
   "Adding a guide", "Rules the past waves learned the hard way".
2. `AGENTS.md`: the review lenses (Scientific, Mathematical, Design, Educational, Ethical...). Write so that panel would approve.
3. The exemplar, all of it: `_tools/articles/slingshot-gravity-assists/` (a foundations guide) and
   `_tools/articles/quake-insight-mars/` (the newest): meta.json, body.html, script.js, checks.js, extra.css, MOD.json,
   NOTES.md, REVIEW.md. Match structure, tone, HUD, chapter numbering, eq-boxes, instruments, LEGACY timeline,
   REFERENCES and bilingual markup exactly.
4. The existing guides your row names under "Do not duplicate" (read the relevant chapters) so you link to them
   instead of repeating them.
5. `_tools/helpers.js`: use its shared helpers (T(), SVG, number formatting EN/RU, the exact-value slider wrapper).
6. `_tools/RU-STYLE.md`: the house style and glossary for the Russian text.

## What to produce, in `_tools/articles/<slug>/` only
- `meta.json`: the build fields (slug, title_en, title_ru, description, og, brand, phase0, hud1, hud2, hud1_ru, hud2_ru)
  AND the site fields: `codename`, `label {en, ru}`, `llms` (one line for llms.txt), `related` (3–4 existing slugs),
  `freshness` (rows `{claim, source, review_by}`; `[]` if nothing in the guide can change).
  `description` must be 160 characters or fewer (search engines cut longer ones); `title_en` 60 characters or fewer.
- `body.html`, `script.js` (exposes its pure functions as `window.__<name>`), `checks.js`,
  `extra.css` (include the page-level 44 px button/target rule the Wave 5–8 guides have),
  `MOD.json` (3–6 mission-of-the-day entries, same 8-field format, EN + RU, real dated events tied to the subject),
  `NOTES.md` (purpose, audience, owner "Wave 9 author (agent), 2026-11-14", outline, sources per number, assumptions,
  unverified items, and a `## Freshness` section listing every dated claim with review_by date and source URL).
- 7–9 numbered chapters including LEGACY and REFERENCES; 4–5 real instruments (interactive, computed, honest);
  at least 18 references, primary where possible (NASA/NTRS/NSSDC, ESA, JAXA, Roscosmos and Russian archival sources,
  CNSA, ISRO, mission papers, standards, peer-reviewed literature, standard textbooks). The lede's "N chapters" counts
  every numbered chapter (LEGACY and REFERENCES too).
- Bilingual: every visible string has `data-en` and `data-ru`; script-drawn labels go through T(). Russian must be
  natural technical Russian per RU-STYLE.md (Russian is in scope on this site only through these bilingual attributes).

## Hard rules
- Every number in the text is cited or computed in script.js and checked in checks.js against a PUBLISHED value
  (state the published value and its source in the check's message or in NOTES). Aim for 40 or more checks.
  Models are labelled as models, with where they break down. Never invent a figure, quote or date; if you cannot
  source it, leave it out and list it in NOTES "unverified". No number may rest on Wikipedia alone.
- No toy shown as prediction. An instrument either computes from textbook physics or published data, or it displays
  published data; if neither is possible, drop it.
- Superlatives ("first", "only", "largest", "every") are where the older guides went wrong: verify each one or hedge it.
- Use web sources to verify; record retrieval dates. Today is 2026-11-14. Anything that can change is worded "as of
  November 2026" and gets a freshness row. Embed dated data (e.g. orbital elements) in the page with its epoch;
  never fetch live data at runtime.
- No reference-artist names, no filmmaker names as style references. Credit scientists and engineers fairly,
  including Soviet/Russian, European, Chinese, Indian and Japanese work and women scientists where the history involves them.
- Do not write anything outside your folder except generating your own `../<slug>.html` with assemble.py.
  Do NOT touch site.json, pages.json, index.html, llms.txt, related.json, search.json, freshness.json, sitemap.xml,
  dates.json, assets/, ru/, other guides, `_tools/handmade/`, or git (no commits, pushes, stash). Never run
  build-site.py, finalize.py, ru_pages.py, shot.sh or `assemble.py --og`. The coordinator wires, links and commits.
  Other authors are working in sibling folders at the same time.
- Build and test until clean:
  `cd _tools && python3 assemble.py articles/<slug>` then `./check-all.sh <slug>` must end in `ALL OK`
  (no drift, no errors, no missing RU, no off-step sliders, no unstyled classes, citations within the reference
  count, every check PASS). `node --check articles/<slug>/script.js`.
- Layouts must work at 390 px wide (no horizontal page scroll; wide tables/charts scroll inside their own box);
  SVG chart text must stay at 9 px or more at 390 px (let a chart scroll instead of shrinking); every control at
  least 24 px (44 px on touch layouts, per extra.css).
- Accessibility: charts have role/aria-label (EN and RU), sliders have labels and live readouts (aria-valuetext),
  reduced-motion respected, keyboard reachable, contrast as the exemplar.
- Links to other guides use `/aerospace/<slug>`. You may link to another Wave 9 guide by the slug in the table
  below even though it does not exist yet.

## Report back (final message, concise)
slug · chapters · instruments (one line each) · check count and the ALL OK line · reference count · dated claims
(with review_by) · anything unverified or risky · the 3–4 `related` slugs you chose and 2–3 existing guides that
should link to this one.

## The ten guides
| Slug | Codename | Category | Scope | Do not duplicate |
|---|---|---|---|---|
| `elements-orbital-elements-ground-tracks` | ELEMENTS | foundations | How six numbers pin down any orbit: a, e, i, Ω, ω, ν; from elements to position; two-line element sets decoded field by field; ground tracks and why they drift west; perturbations (J2 nodal and apsidal precession, drag) and what "mean elements" means. Instruments: elements → orbit and ground-track plotter; TLE decoder on embedded, dated real TLEs (ISS, a GPS satellite, a Molniya, a GEO, a Sun-synchronous one); J2 drift rates checked against published values. The propagator is Kepler + secular J2 and must be labelled as that, with its error against a published pass or SGP4 figure stated. | `physics-of-spaceflight` (vis-viva, Hohmann), `sunsync-earth-observation` (the Sun-synchronous condition), `relay-telstar-syncom` (GEO, Molniya 63.4°): link to them. |
| `pitchover-ascent-to-orbit` | PITCHOVER | rockets | Why orbit costs about 9.3 km/s (published budgets run 8.8–9.3; Saturn V 9,267 m/s per Humble, Henry & Larson, the figure the IMPULSE and THRUST guides use) when orbital speed is 7.8: gravity loss, drag loss, steering loss; the gravity turn; max-Q and throttling; staging events along a real ascent; launch-site rotation bonus in one line. Instruments: 2-D ascent integrator (thrust, gravity, exponential-atmosphere drag) that reports each loss term; max-Q vs throttle bucket; pitch-kick sensitivity; a real ascent timeline (Saturn V and Falcon 9 published events) to compare with. Check loss totals against published Saturn V / Shuttle / Falcon 9 figures. | `physics-of-spaceflight` (ideal rocket equation), `thrust-saturn-v-n1`, `return-reusable-rockets`, `nozzle-rocket-engines`. |
| `gyro-attitude-control` | GYRO | systems (new) | How a spacecraft points with nothing to push against: angular momentum, reaction wheels and their saturation, desaturation with thrusters or magnetorquers, control-moment gyros (Skylab, Mir, ISS), spin stabilisation, star trackers and gyros as sensors, gravity-gradient and solar-pressure torques. Cases: Hubble's gyro failures and one-gyro mode (status as of November 2026), Kepler's two-wheel K2 pointing balanced on sunlight, Hayabusa's wheel failures. Instruments: wheel momentum vs slew time; saturation under a constant disturbance torque and the desaturation budget; magnetorquer dipole needed vs altitude; K2 solar-pressure balance. | `beep-sputnik-explorer` ch. 7 already has Explorer 1's major-axis rule and its energy formula: link to it, do not rebuild it. `transit-kepler-telescope`, `aperture-hubble-telescopes`. |
| `radiator-thermal-control` | RADIATOR | systems (new) | How a spacecraft keeps from freezing and boiling at once: radiation as the only way out, absorptivity/emissivity, equilibrium temperature vs distance from the Sun, radiators and their area, multilayer insulation, heaters, louvres, heat pipes, sunshields. Cases: Webb's five-layer sunshield, Parker Solar Probe's shield, Spitzer's warm launch, Skylab's lost shield, lunar night survival. Instruments: equilibrium temperature vs α/ε and distance; radiator area for N watts at temperature T; MLI effective emittance vs layers; a two-node eclipse transient. | `james-webb-space-telescope`, `corona-parker-solar-orbiter`, `scorch-mercury-messenger-bepicolombo` (sunshade equilibrium), `infrared-spitzer-telescope`: link, reuse none of their instruments. |
| `isotope-rtg-nuclear-power` | ISOTOPE | systems (new) | How you make electricity where the Sun is useless: Pu-238 decay heat, thermocouples and their ageing, SNAP-27 to GPHS-RTG to MMRTG, radioisotope heater units, Soviet Polonium-210 units on Lunokhod and Orion RTGs; fission reactors in orbit (SNAP-10A, BES-5 on the radar ocean satellites, TOPAZ); Pu-238 supply and its restart; accidents told plainly (Transit 5BN-3, Nimbus B-1, Apollo 13's cask, Kosmos 954, Kosmos 1402). Instruments: electrical output over decades = isotope decay × converter ageing, fitted to published Voyager and Cassini/New Horizons power histories; specific power ladder (W/kg) by generator; solar vs RTG crossover with distance; Kosmos 954 shown as the PUBLISHED search corridor on a map (no computed debris footprint). | `voyager-and-pioner` has an RTG power budget with a shutdown log, `transfer-earth-to-mars` ch. 7 a Pu-238 heat-decay slider: link to both and go further (converter ageing, generators compared). `skycrane-curiosity-rover`, `rotor-dragonfly-titan`. |
| `fix-deep-space-navigation` | FIX | systems (new) | How you know where a probe is to within kilometres at a billion kilometres: two-way Doppler → line-of-sight velocity, ranging → distance, why angles are the hard part, ΔDOR against quasars, optical navigation, orbit determination as fitting, trajectory correction manoeuvres and the B-plane. Cases: Mars Climate Orbiter's unit error told from the mishap report, Voyager at Neptune, New Horizons at Arrokoth, the Pioneer anomaly and its thermal explanation. Instruments: Doppler shift → radial velocity with real X-band numbers; ranging light-time → distance; ΔDOR angle → cross-track error at range; B-plane miss vs correction Δv and time-to-go. | `link-deep-space-network` (link budget), `slingshot-gravity-assists`, `clock-atomic-clocks-in-space` (clock stability: link by slug), `frontier-new-horizons`. |
| `window-launch-windows-porkchop` | WINDOW | foundations | Why "now, or in two years": Lambert's problem, C3 and arrival speed, porkchop plots and how to read them, type I and II transfers, daily launch windows from site latitude and target inclination, launch periods of real missions. Instruments: a Lambert solver (universal variables, labelled) with planets on embedded dated ephemerides or mean elements (state which and its accuracy); a C3 porkchop for Earth–Mars 2026 and 2028 opportunities and one Earth–Venus, checked against published launch periods and C3 values of flown or planned missions; daily window vs launch azimuth and latitude. | `transfer-earth-to-mars` chs. 2–4 already have the synodic period and Hohmann sliders: do NOT rebuild them; this guide is the general Lambert/porkchop case. `slingshot-gravity-assists`. |
| `clock-atomic-clocks-in-space` | CLOCK | time | Why every space system ends up being a clock: quartz, rubidium, caesium, hydrogen masers, mercury-ion and optical clocks; Allan deviation and what it means for ranging; clocks on GPS, GLONASS, Galileo (and its 2017 clock failures), BeiDou; the Deep Space Atomic Clock (2019–2021); ACES on the ISS (status as of November 2026); time transfer. Instruments: Allan deviation → time error → ranging error over an interval, by clock type from published stabilities; drift per day by clock type; one-way vs two-way navigation timing; relativistic rate offset vs altitude in one compact panel that reproduces the GPS figure and links onward. | `navigator-gps` already reproduces Ashby's relativity numbers (38.6 µs/day): link to it and keep the relativity panel short. `link-deep-space-network`, `fix-deep-space-navigation`. |
| `physics-of-spaceflight` (REBUILD) | IMPULSE | foundations | Rebuild of the existing hand-made guide at the same slug, codename, labels and URL, as a generated guide. The foundation other guides lean on: Newton's laws and momentum exchange, the rocket equation and mass ratio, staging, vis-viva, circular and escape speed, Hohmann transfer, plane change, the Oberth effect, a Δv map of the Solar System on ONE stated basis, and a short honest survey of propulsion types that links onward. Instruments: rocket equation + staging optimiser; vis-viva / orbit speed calculator; Hohmann transfer between any two circular orbits; a computed Δv map (every row recomputed in script.js and checked); Oberth gain. The science audit found: no references at all, a Δv table that failed recomputation, a cancelled programme (DRACO) described as live. Read the current page and `_tools/EN-FIXES.md` (search for physics-of-spaceflight) first; keep what is sound, keep every in-page anchor id other guides link to (grep the repo for `physics-of-spaceflight#`). Copy codename, label, llms, related from `_tools/handmade/physics-of-spaceflight/meta.json` into your meta.json (improve llms/related if needed); leave the handmade folder alone. | `nozzle-rocket-engines`, `slingshot-gravity-assists`, `transfer-earth-to-mars`, `sail-solar-sails`, `pitchover-ascent-to-orbit` (ascent losses live there: link by slug), `elements-orbital-elements-ground-tracks`. |
| `lagrange-points` (REBUILD) | EQUILIBRIUM | foundations | Rebuild of the existing hand-made guide at the same slug, codename, labels and URL, as a generated guide. The restricted three-body problem done properly: the rotating frame and effective potential, an EXACT solver for L1–L3 (the quintic, by Newton or bisection) beside the leading-order formulas with their error, L4/L5 and the stability limit (mass ratio about 24.96), Euler's collinear points and Lagrange's triangular ones credited correctly, halo and Lissajous orbits and what station-keeping costs, Trojans, and a dated list of missions at Sun–Earth L1/L2 and Earth–Moon points. Instruments: exact L-point solver with presets (Sun–Earth, Sun–Jupiter, Earth–Moon, Pluto–Charon) checked against published distances; effective-potential contour map with zero-velocity curves; L4/L5 stability explorer (linearised eigenvalues vs mass ratio); halo-orbit station-keeping budget from published mission values. The science audit found an L3 error (now patched), no references, and a mission timeline that stopped in 2021. Read the current page and `_tools/EN-FIXES.md` (search for lagrange-points) first; keep every in-page anchor id other guides link to (grep the repo for `lagrange-points#`). Copy codename, label, llms, related from `_tools/handmade/lagrange-points/meta.json`; leave the handmade folder alone. | `james-webb-space-telescope`, `parallax-gaia-mission`, `dark-euclid-roman`, `the-lunar-gateway` (NRHO), `rabbit-change-far-side` (Queqiao at Earth–Moon L2), `corona-parker-solar-orbiter`. |
