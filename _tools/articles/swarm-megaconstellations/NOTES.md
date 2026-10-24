# SWARM — Starlink, OneWeb & the megaconstellations (Wave 7)

**Purpose:** explain satellite megaconstellations, from the 1990s bankruptcies to Starlink, with three instruments where the reader works out the physics: the coverage-versus-capacity gap, latency through fibre, LEO and GEO, and satellite streaks on telescope images.
**Audience:** interested non-specialists; the equations sit in eq-boxes. **Owner:** Wave 7 author (agent), 2026-10-22/23. **Category:** Earth orbit.
**Russian codename:** SWARM → «РОЙ». Commercial names stay Latin in RU (Iridium, Starlink, OneWeb, Amazon Leo), following DEBRIS; Chinese names in «»: «Гован», «Цяньфань».

## Outline (9 chapters, lede "Nine chapters and three instruments")
1. First swarms — Iridium (66, 6×11, 780 km, 86.4°, flares), Globalstar (48, 1,414 km, 52°), Teledesic (840 → 300 → 30); bankruptcies 1999/2002.
2. Coverage — **instrument 1:** altitude + minimum elevation → footprint angle λ, radius, slant range, area; honeycomb lower bound and the polar streets-of-coverage optimum (P × S). Presets Iridium / OneWeb / Starlink 550; log bar chart vs the real fleets.
3. Starlink — FCC 2021 plan, counts as of 15 Oct 2026, shell table (computed into 5 groups from McDowell's list), lasers, drag disposal (links DEBRIS), Feb 2022 storm.
4. Latency — **instrument 2:** five city pairs; ideal fibre (×route factor), LEO bent pipe + fibre, LEO laser mesh, GEO with exact slant ranges and multi-hop when needed; crossover distance.
5. The others — OneWeb/Eutelsat, Amazon Leo, Guowang, Qianfan; fleet table.
6. Dark skies — **instrument 3:** sky map of the sunlit/shadowed shell for any Sun depression, sampled satellites, counts above horizon/30°/sunlit, streaks per exposure for a field of view and exposure; Rubin presets; radio interference (LOFAR).
7. Dodging — collision-avoidance manoeuvres (links DEBRIS for Kessler and the 5-year rule; not duplicated).
8. Legacy — timeline 1997–2026 (13 entries). 9. References — 24.

## Sources per number
- Iridium: launches from May 1997, 66 + spares in a year, $5 bn, $3,000 phone, $6–30/min, bankrupt Aug 1999, bought for $25 M, "triumph of engineering over common sense" — Air & Space [1]. 6×11, 780 km, 86.4°, NEXT launches Jan 2017–Jan 2019 — eoPortal [2]. Flares: three silver-coated antennas, outshine Venus — NatGeo [3]. First launch date 1997-05-05 — GCAT [7].
- Globalstar 48 sats, 8 planes, 52°, 1,414 km — FCC public notice 2002 [4]; Chapter 11 15 Feb 2002 — SEC Form 8-K [5]; first launch 1998-02-14 — GCAT [7].
- Teledesic 840, $9 bn, 300 (1997), 30, suspended Oct 2002, McCaw & Gates $5 M each 1994 — Seattle Times [6].
- FCC 21-48 (adopted 23 Apr 2021): 25° minimum elevation, OneWeb 40° (as stated in the order, from Kepler's filing), 1,584 at 550 km/53° in 72×22 and other shells [8].
- Starlink counts 13,015 / 11,154 / 9,726 / 1,861 down / 1,508 disposal complete; Group 4-7 49 launched, 38 early deorbit — McDowell stats [9]. Shell groups summed from McDowell's conlist sub-shell "on station" numbers [10] (main 53°: 372+44+2+275+100+786+322+2416; 43°: 641+2581; polar: 1220+6; 70°: 192+132+1; DTC: 309+327) — sums to 9,726 (checked).
- Lasers: >9,000, >42 PB/day, 100 Gbps, 5,400 km, since v1.5 — Hackaday report of Brashears' SPIE talk [11].
- Storm: up to 50 % drag at ~200 km — Kataoka et al. 2022 abstract [12]; 210 km perigee — SpaceX's 8 Feb 2022 update, reposted verbatim by TelecomTV [25].
- Latency 25.7 ms median (June 2025), < 1 % above 55 ms — iTWire quoting Starlink [13]. Fibre-beating beyond ~3,000 km — Handley 2018 abstract [14].
- OneWeb: 1,200 km, 87.9°, 588 planned, 660/636 — McDowell [10]; first launch 2019-02-27 [7]; bankruptcy March 2020, UK government + Bharti — Space.com [15]; merger 2023 — Eutelsat history [16].
- Amazon: prototypes 2023-10-06, KA-01 2025-04-28 (27 sats) [7]; rename 13 Nov 2025 [17]; 3,232 planned, 398/355 [10].
- Guowang (McDowell "Xingwang"): first low-orbit batch 2024-12-16 (GCAT 2024-240 "WHDW 01") [7]; 960 + 12,992 filings, 261/213 [10]. Qianfan: 2024-08-06, 18 sats [7]; 16,000 filed, 258/178 [10].
- Astronomy: 0.005–0.01 per deg² at airmass < 2 for ~12,000 Starlinks — McDowell 2020 [18]; g 4.5 / 6.1 / 7, 48,000 sats → ~1 % pixels masked in twilight — Tyson et al. 2020 [19]; Rubin 8.4 m, 9.6 deg², 30 s exposures, latitude −30:14:40.68 — Rubin Observatory Key Numbers [20]; Iridium 8.2° minimum elevation and plane spacings 31.6°/22° — Pratt et al. 1999 [21]; LOFAR 47/68, 110–188 MHz, downlinks 10.7–12.7 GHz — Di Vruno 2023 [22]; ×32 for v2-Mini — Bassa 2024 [23].
- Manoeuvres 148,696 (Jun–Nov 2025), 207,152 (Dec 2025–May 2026), >40 per satellite per year, threshold 3 in 10 million — Space.com, 15 Jul 2026 [24].

## Computed (checked in checks.js, 49 checks)
Iridium streets 6×11 = 66 at 780 km/8.2° (λ = 19.92°, 15.3 M km²); OneWeb 1,200 km/40° → 12 planes; Starlink 550/25° → 360 (honeycomb 223), fleet 27× that; GEO altitude 35,786 km and 477.5 ms minimum bent-pipe RTT; 2h/c = 3.2–3.7 ms; London–NY 5,570 km, straight fibre RTT 54.6 ms vs laser 47.7 ms; London–Paris fibre wins; Tokyo–São Paulo needs 3 GEO hops; crossover 2,867 km at 550 km; shadow height at zenith 328 km for −18°; Rubin midnight depression 36.3° (Dec) / 83.2° (Jun); sky integral = N(1 − R/r)/2 within 0.5 %; uniform density at 30° elevation 0.0099/deg² (inside McDowell's range), 0.0018 at zenith; 3.5° field = 9.62 deg²; 4.4 s to cross at zenith; 0.17 streaks per 30 s at zenith for 12,000 at 550 km; 355,848 manoeuvres/yr, 182 days, 1,138/day; UI presets render without NaN in EN and RU.

## Assumptions / known limitations
- Coverage: spherical Earth, single coverage, polar streets formula (Adams–Rider style with one counter-rotating seam); inclined shells are only indicative. No capacity model — the text says capacity is why fleets are larger.
- Latency: idealised straight-up/along-shell/straight-down laser path, no routing zig-zag, processing or queueing; fibre index 1.47 (Handley [14]: c is ≈ 47 % higher in vacuum than in glass); city centres rounded to 0.01°; GEO satellite placed over the midpoint longitude of each segment.
- Sky: satellites spread uniformly over a single shell (real shells concentrate near their inclination latitude), cylindrical shadow (no penumbra, no atmospheric refraction), random motion directions, Earth rotation ignored; the dots are a fixed-seed sample (1 dot = N/5000 when N > 5000). Brightness/phase angle not modelled — a lit satellite counts as a streak regardless of magnitude.
- Drag lifetime instrument deliberately omitted: DEBRIS already has one; CH3 and CH7 link to it.

## Freshness
claim | source URL | review-by date
- Starlink 13,015 launched / 11,154 in orbit / 9,726 operational / 1,861 down / 1,508 disposed (15 Oct 2026) | https://planet4589.org/space/con/star/stats.html | 2027-01-15
- Starlink shell table counts (15 Oct 2026) | https://planet4589.org/space/con/conlist.html | 2027-01-15
- OneWeb 660/636, Amazon Leo 398/355, Guowang 261/213, Qianfan 258/178, filing totals (15 Oct 2026) | https://planet4589.org/space/con/conlist.html | 2027-01-15
- Collision-avoidance manoeuvres 207,152 (Dec 2025–May 2026) — next SpaceX semiannual report due ~Jan 2027 | https://www.space.com/space-exploration/satellites/every-spacex-starlink-satellite-has-to-dodge-a-collision-almost-weekly-and-experts-fear-the-worst | 2027-02-01
- Starlink median latency 25.7 ms (June 2025) — already >1 year old | https://itwire.com/business-it-news/business-technology/starlink-claims-dramatic-improvement-in-network-performance | 2026-12-31
- Laser figures (>9,000 lasers, 42 PB/day, Jan 2024) — dated in text | https://hackaday.com/2024/02/05/starlinks-inter-satellite-laser-links-are-setting-new-record-with-42-million-gb-per-day/ | 2026-12-31
- Amazon Leo name and status | https://www.aboutamazon.com/news/innovation-at-amazon/what-is-amazon-project-kuiper | 2027-04-01
- Hero kicker "11,154 Starlinks in orbit, 15 October 2026" | https://planet4589.org/space/con/star/stats.html | 2027-01-15

## Unverified / judgment calls (reviewer: look here hardest)
- Resolved in review (2026-10-23): Iridium 8.2° → Pratt et al. 1999 [21]; 210 km → SpaceX update [25]; Handley's constellation was 1,150 km (now stated); Globalstar → SEC 8-K [5]; Rubin → Key Numbers [20].
- OneWeb 40° is the FCC's summary of Kepler's argument inside FCC 21-48, not a OneWeb document (worded as such).
- "Planned/filed" numbers are regulatory filings as listed by McDowell (Starlink 34,864 = Gen1 4,408 + Gen2 30,456; excludes the 100,000-satellite Gen3 filing).

## Wiring (for the coordinator)
- `wire.py swarm-megaconstellations SWARM "Megaconstellations: Starlink, OneWeb & Amazon Leo" "Мегасозвездия: Starlink, OneWeb и Amazon Leo" <earth-orbit-category-id> "<llms line>"`
- llms.txt: `Satellite megaconstellations from Iridium's 66 satellites and the 1990s bankruptcies to Starlink's 11,000+ (October 2026): footprint and streets-of-coverage satellite counts, LEO vs GEO vs fibre latency for real city pairs (laser links beat fibre beyond ~3,000 km), a telescope streak simulator with Earth-shadow geometry for Rubin Observatory, and Starlink's collision-avoidance numbers.`
- MOD.json: 3 rows (1997-05-05 Iridium, 2019-02-27 OneWeb, 2019-05-24 Starlink), dates from GCAT.

## Response to review (2026-10-23)
Independent panel review: `REVIEW.md` (APPROVE WITH CHANGES). All seven MUST items applied:
1. Handley: chapter 4 now says his ~3,000 km was for SpaceX's then-filed 1,600 satellites at 1,150 km, that the instrument's straight-up path is deliberately pessimistic, and gives its crossover at 550 km (about 2,900 km) and 1,150 km (near 8,000 km), EN + RU; ref [14] note updated; checks relabelled + a 1,150 km check (7,945 km).
2. Streak status: when ≥ 1 streak is expected it now reads "About N streaks cross every exposure" (was "one exposure in 1"); check added.
3. Iridium 8.2°: sourced to Pratt et al., IEEE Communications Surveys 1999 (new [21]); note rewritten (6 × 11 holds for 7.0°–8.2°; spacings 31.5°/23° vs the paper's 31.6°/22°), EN + RU; two checks added.
4. 210 km perigee: new ref [25] (SpaceX update, TelecomTV repost) cited in CH3 and the 2022 timeline row.
5. Weak sources: [5] Wikipedia → SEC 8-K of Globalstar, L.P.; [20] Sky at Night → Rubin Observatory "Key Numbers" (also covers latitude; note now cites [20]); old [21] (Wikipedia Rubin) replaced by Pratt et al.
6. Fibre index 1.47 cited to Handley [14].
7. `data-aria-en/ru` on all role=img SVGs and role=group button rows, applied in renderAll(); check added.
Also applied (SHOULD): OneWeb 40° framed as the FCC's summary of a rival's filing; latency marked as SpaceX's latest published figure; Rubin depth formula corrected to 90° − |φ + δ|; coordinator-requested sentence linking RELAY (`/aerospace/relay-telstar-syncom`) where CH4 introduces GEO, EN + RU.
Fleet counts re-checked on planet4589.org 2026-10-23: unchanged (data still dated 15 Oct 2026). Open SHOULDs: shell table at 390 px, default sky aim, «обсерватории Рубин».
References 24 → 25; checks 49 → 55; `./check-all.sh swarm-megaconstellations` → ALL OK. Screenshots retaken at 1300 and 390 (28,000 px window), bottom of page verified at 390.
