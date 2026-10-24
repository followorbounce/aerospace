# FORECAST — TIROS, GOES, Meteosat & weather from orbit (Wave 7)

**Purpose:** explain weather satellites from TIROS-1 to the 2026 fleet: the two orbits and what each sees, why geostationary pixels stretch, and how infrared radiance becomes cloud-top temperature and height. Every quoted number is either cited or computed in `script.js` and checked in `checks.js`.
**Audience:** interested non-specialists; equations in eq-boxes. **Owner:** Wave 7 author (fork), 2026-10-22. **Category:** Earth orbit.
**Neighbours, not duplicated:** sun-synchronous orbit mechanics, swath/revisit for Landsat/Sentinel-2 and the diffraction limit stay in SUNSYNC (linked from CH.01); GPS and debris not touched.

## Outline (9 chapters, lede "Nine chapters and three instruments")
1. First pictures — TIROS-1, Nimbus 1/3 (SIRS soundings), Kosmos/Meteor-1; link to SUNSYNC.
2. Two ways to watch — **instrument 1:** latitude + "usable viewing angle" sliders; GEO 10-min line vs one polar orbiter's average gap (log), readouts: GEO zenith angle, N–S stretch, polar looks/day, GEO visible fraction 42.4 % and usable fraction at the limit.
3. "The weather moves, not the satellite" — ATS-1 spin-scan, SMS-1, GOES-1, Meteosat-1; 30 min → 10 min → 30 s.
4. A pixel is an angle — **instrument 2:** ABI band (0.5/1/2 km), places (nadir, Miami, Kansas, 60° N, Reykjavik, Anchorage), lat/lon sliders, altitude slider for the same IFOV; Earth disk in fixed-grid scan angles + footprint to scale; exact GOES fixed-grid projection on GRS80.
5. A cloud's height from its glow — **instrument 3:** cloud-top height + pixel fill; Planck in wavenumber at 10.3 and 12.3 µm, inversion, lapse-rate height, tropopause ambiguity, mixed-pixel bias and the split-window difference from Planck curvature alone.
6. The fleet (as of October 2026) — GOES-19/18/16, GLM, Meteosat-12, MTG-S1/Sentinel-4, MTG-I2, Himawari-9, FY-4C; JPSS, Metop-SG-A1/B1, Meteor-M 2-4.
7. From radiances to forecasts — ECMWF FEC (AMSU-A ~21 %, AMVs 6 %), hurricanes, Dvorak.
8. Legacy — 14 timeline entries 1960–2027.
9. References — 39.

## Sources per number
- TIROS-1: 1 Apr 1960, Red Sea first frame, two cameras, ~450 miles, ~23,000 images, to 18 June [1]; 122.5 kg, vidicon cameras, tape recorder, normal to 15 June [2]; 78 days, 19,389 usable [3]. (Page uses 78 days / 19,389; NASA's 23,000 is all images.)
- Nimbus 1 28 Aug 1964, HRIR [4]; Nimbus 1–7 dates, Nimbus 3 14 Apr 1969 [5]; SIRS first satellite profiles, operational 24 May 1969 [6].
- Kosmos 44 (28 Aug 1964), Kosmos 122 (25 Jun 1966), Meteor-1 1 (26 Mar 1969), ~81° [7]; Meteor-M 2-4 29 Feb 2024, 820.7 km, instruments [8].
- ATS-1: 9:12 p.m. EST 6 Dec 1966, Suomi & Parent, strip per rotation, < 30 min, first full disk 11 Dec 1966 [9]; quote and Jan 1967 movie, 20-min frames [10]; 7 Dec (UTC), 151.16° W [11].
- SMS-1 17 May 1974, GOES-1 16 Oct 1975, VISSR [12]; Meteosat-1 23 Nov 1977 13:35 GMT, first image 9 Dec, 30 min, 3 channels incl. water vapour [13].
- ABI bands/resolutions, 10.3 "clean"/12.3 "dirty", 10-min mode from ~2 Apr 2019, CONUS 5 min, meso 60/30 s [14]; 16 bands 2/4/10, full disk 10 min [15]; GLM 777.4 nm, 2 ms, 8/14 km, 52° N [16].
- GOES-19 East 7 Apr 2025, 75.2° W, 22,236 mi, launched 25 Jun 2024 [17]; status page 3 Sep 2026 (GOES-18 West 137.0° W since 4 Jan 2023; GOES-16 104.7° W backup) [18]; July 2026 safe hold [19]; GOES-R launch months [38].
- Meteosat-12: 4 Dec 2024, 10 min, 500 m–2 km, lightning imager [20]; launch 13 Dec 2022, 0.3° W [21]; MTG-S1 commissioning 2 Jul 2026, 0°, IRS 30 min, Sentinel-4 hourly, MTG-I2 9.5° E/150 s [22]; MTG-S1 launch 1 Jul 2025 Falcon 9 [37]; MTG-I2 launch 27 Aug 2026 [23].
- Himawari-8 ops 7 Jul 2015, Himawari-9 primary 13 Dec 2022, AHI 16 bands [24]; FY-4C 27 Dec 2025 Beijing time [25].
- JPSS: 14 orbits/day, twice-daily coverage, "majority of data", JPSS-4/NOAA-22 2027 [26]; NOAA-21 10 Nov 2022, 824 km, 13:25 asc [27]; VIIRS 3,000 km, 375/750 m [28]; Metop-SG-A1 13 Aug 2025, commissioning, 835 km, 09:30 [29]; Metop-SG-B1 at Kourou 16 Oct 2026, launch end of year [39].
- ECMWF: AMSU-A ~21 % of 24-h forecast-error reduction, AMVs 6 % (June 2011) [30]. Dvorak eye vs cloud-top temperature [31]. Split-window signs [32]. NASA lapse 6.49 K/km to 11 km [33]. Fixed grid, GRS80 [34]. Kansas 2.4 × 3.2 km [35]. Constants [36].

## Computed (and checked, 46 checks in checks.js)
r_GEO 42,164.17 km from one sidereal day (h = 35,786 km = NOAA's 22,236 mi); limb 81.30°; visible fraction 42.44 %; 70° limit → 61.83°, 26.4 %; spherical N–S stretch ×2.94 at 60°; NOAA-21 period 101.38 min, 14.2 orbits/day, 25.41° per orbit, track spacing 2,818 km (< 3,000 km swath), 2.13 looks/day at the equator; IFOV 56/28/14 µrad (official L1b grid steps, ref [40]; nominal 2 km ÷ h = 55.9); 46 m at 824 km; fixed-grid round trip < 1e-9°; footprints on the official grid (origin 75.0° W): nadir 2.00 × 2.02, Kansas 2.40 × 3.14 (CIRA 2.4 × 3.2), 60° N 2.20 × 5.88, Reykjavik 7.45 × 18.6 km, Anchorage beyond limb; 10.3 µm = 970.87 cm⁻¹; Planck round trip; ∫πB dν = σT⁴ at 300 K to 1e-5; B(970.87 cm⁻¹, 300 K) = 104.56 mW/(m² sr cm⁻¹); half-cloudy 8 km pixel reads 266.4 K → 3.35 km, split-window +0.98 K; tropopause ambiguity; TIROS 78 days; ATS-1 02:12 UTC 7 Dec; UI presets without NaN in EN/RU; aria-valuetext; no Latin K in RU.

## Assumptions / limitations
- Instrument 1: spherical Earth, point on the satellite's meridian; the "usable" viewing-angle limit is a reader-set assumption (default 70°), not a published standard. Polar looks/day = 2 × orbits × swath ÷ parallel length capped at one per orbit — an average, ignoring pass clustering and swath obliquity at high latitude; one satellite only.
- Instrument 2: grid spacing equals the nominal nadir resolution ÷ 35,786 km (the commonly quoted 56/28/14 µrad were derived, not read from the PUG, which could not be downloaded); no point-spread function, so real effective footprints are a bit larger (CIRA's 3.2 vs our 3.13 km). Distances are local flat-earth on the mean sphere between edge midpoints.
- Instrument 3: monochromatic (band centre), no spectral response or band-correction coefficients; no atmospheric absorption; black surface at 288.15 K; standard atmosphere (−6.5 K/km to 11 km, isothermal above). The split-window difference shown is only the Planck-curvature (mixed-pixel) effect; the moisture and ash effects are described with [32], not modelled.

## Unverified / judgment calls
- "Five or six" GEO satellites claim was removed; ring described qualitatively. Statement that GOES-R are three-axis stabilised with two scan mirrors removed (not opened in a source).
- Polar microwave imagery "looks through cloud tops at rain bands and eyewall" is qualitative and unsourced; a reviewer may want a NOAA/NRL citation.
- "Microwaves pass through most clouds; channels across an oxygen band sense different layers" — textbook physics, uncited.
- Sentinel-4 data-release status as of Oct 2026 not verified; only its hourly measurement design is stated.
- GOES-19 July 2026 outage: WTOP says it lasted nearly a day; other outlets differ on the start day (Wednesday vs Thursday), so no weekday is given.
- MTG-I2's arrival at 9.5° E / start of rapid scanning not verified; stated as "bound for".
- JPSS ordering: NOAA's page names JPSS-4 as next (2027); NASA pages elsewhere list JPSS-3 for 2027. The page quotes NOAA and dates it.
- Russian names: FORECAST → «ПРОГНОЗ»; Himawari «Химавари», Fengyun «Фэнъюнь», Meteosat «Метеосат», Nimbus «Нимбус».

## Freshness
GOES-19 is GOES-East at 75.2° W; GOES-18 GOES-West at 137.0° W; GOES-16 backup at 104.7° W | https://www.ospo.noaa.gov/operations/goes/status.html | 2027-04-01
GOES-19 safe hold, mid-July 2026 | https://wtop.com/weather-news/2026/07/noaa-weather-satellite-outage-highlights-how-much-forecasters-depend-on-space-based-data/ | 2027-04-01
MTG-S1 commissioned 2 Jul 2026, at 0°, IRS every 30 min | https://www.esa.int/Applications/Observing_the_Earth/Meteorological_missions/meteosat_third_generation/MTG-S1_commissioned_and_in_position_for_weather_forecasting | 2027-01-31
MTG-I2 launched 27 Aug 2026, bound for 9.5° E | https://www.esa.int/ESA_Multimedia/Images/2026/08/MTG-I2_is_launched_from_Europe_s_Spaceport | 2027-01-31
Meteosat-12 operational at 0.3° W | https://space.oscar.wmo.int/satellites/view/meteosat_12 | 2027-04-01
Himawari-9 primary since 13 Dec 2022 | https://www.jma.go.jp/jma/jma-eng/satellite/himawari89.html | 2027-04-01
FY-4C launched 27 Dec 2025, to replace FY-4A | https://wmo.int/node/38159 | 2027-01-31
JPSS-4 (NOAA-22) next, launch readiness 2027 | https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system | 2027-01-31
NOAA-21 operational, 824 km | https://space.oscar.wmo.int/satellites/view/noaa_21 | 2027-04-01
Metop-SG-A1 in commissioning (Aug 2026) | https://space.oscar.wmo.int/satellites/view/metop_sg_a1 | 2026-12-31
Metop-SG-B1 at Kourou, launch expected end of 2026 | https://www.esa.int/Applications/Observing_the_Earth/Meteorological_missions/MetOp_Second_Generation/MetOp-SG-B1_weather_satellite_arrives_at_Europe_s_Spaceport | 2026-12-31
Meteor-M No. 2-4 operational | https://space.oscar.wmo.int/satellites/view/meteor_m_n2_4 | 2027-04-01

## Wiring (for the coordinator)
- Index label EN: `Weather Satellites: TIROS, GOES & Meteosat` · RU: `Метеоспутники: TIROS, GOES и «Метеосат»` · codename `FORECAST`, category Earth orbit.
- llms.txt: `Weather satellites from TIROS-1's first cloud picture (1960) to GOES-19, Meteosat Third Generation, Himawari and JPSS (as of October 2026): geostationary vs polar coverage and revisit by latitude, ABI pixel growth computed on the GOES fixed grid (2 km at nadir, 2.4 × 3.1 km over Kansas, 2.2 × 5.9 km at 60° N), and Planck inversion of 10.3 µm radiance to cloud-top temperature and height, with the split window.`
- MOD.json: TIROS-1, ATS-1, GOES-1, Meteosat-1 (type `leo` — the widget has no geostationary type; the coordinator may prefer another).

## Response to review (2026-10-23)
The REVIEW.md verdict is APPROVE WITH CHANGES. All six MUST items were applied; `./check-all.sh forecast-weather-satellites` → ALL OK (50 checks, 41 refs).
1. **Fixed grid.** The reviewer read a GOES-19 ABI L1b header: x/y scale_factor 5.6e-05 / 2.8e-05 / 1.4e-05 rad, longitude_of_projection_origin −75.0°, height 35,786,023 m, GRS80. `abiStep()` now uses 56/28/14 µrad, and `GOES_EAST` (the grid origin) is −75.0. The chapter-4 text, eq-note and instrument note now say the files give the step and that the grid is centred on 75.0° W (the satellite stays at 75.2° W). New ref [40]. Three new checks; Reykjavik updated to 7.45 × 18.6. The "derived, not from the PUG" caveat is resolved.
2. **Nimbus.** "flown until 1978" → "launched between 1964 and 1978" (Nimbus 7 launched on 24 Oct 1978), EN + RU, plus a check.
3. **ECMWF.** The 6 % AMV share includes MODIS (polar) winds, so the text now reads "tracked in satellite images (geostationary, and polar near the poles)". "Polar sounders" → "NOAA's polar satellites" for the NOAA "majority of data" quote.
4. **Microwave sentences.** Both are now cited to the NOAA ATMS page (new ref [41]). The uncited oxygen-band and eyewall specifics were trimmed.
5. **390 px labels.** "too oblique" moved to the bottom of the band. The pixel box title is now two lines, and its caption is "dashed: nadir pixel".
6. **Also applied (SHOULD):** the polar-formula note now admits the obliquity underestimate at high latitude. In RU, «дневных» → «послеполуденных» orbits and «радиометр-изображатель» → «сканирующий радиометр».
Still open (SHOULD, see REVIEW.md): the exact GOES-19 safe-hold date (16 July 2026, WTOP); ref [17] on the hurricane sentence; a JPSS-3 ~2032 note; the LEGACY heading wording; a one-decimal latitude readout; a clear-sky absorption clause; the MOD.json ATS-1 RU wording; `shot.sh`'s 14,000 px limit (a shared tool).
