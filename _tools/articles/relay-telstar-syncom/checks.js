module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const MI = 1.609344, c = 299792.458;
  // CH1-2 — the geostationary radius
  ok('sidereal day from IERS ω = 23 h 56 min 4 s (ESA [15])', near(C.SID, 86164, 0.5), C.SID.toFixed(3));
  ok('sidereal day matches NASA 23.9345 h', near(C.SID/3600, 23.9345, 0.0001), (C.SID/3600).toFixed(5));
  ok('geosynchronous radius = 42,164 km (NASA EO [13])', near(C.R_GEO, 42164, 1), C.R_GEO.toFixed(2));
  ok('geostationary altitude = 35,786 km (ESA [15])', near(C.H_GEO, 35786, 1), C.H_GEO.toFixed(2));
  ok('GEO speed ≈ 3.075 km/s; Potočnik 3,080 m/s within 0.2 %', near(C.circV(C.R_GEO), 3.080, 0.006), C.circV(C.R_GEO).toFixed(4));
  ok('Potočnik 42,300 km: period within 0.25 % of a day', Math.abs(C.periodS(42300)/86400 - 1) < 0.0025, (C.periodS(42300)/3600).toFixed(3) + ' h');
  ok('Clarke 42,000 km: period within 1 % of 24 h', Math.abs(C.periodS(42000)/86400 - 1) < 0.01, (C.periodS(42000)/3600).toFixed(3) + ' h');
  ok('Potočnik 35,900 km ≈ 42,300 − 6,400', 42300 - 6400 === 35900);
  ok('Echo 1 1,524 × 1,684 km → 118.3 min (NSSDC)', near(C.periodS(C.RE + 1604)/60, 118.3, 0.1), (C.periodS(C.RE + 1604)/60).toFixed(2));
  ok('Relay 1 1,322 × 7,439 km → 185 min (NSSDC)', near(C.periodS(C.RE + 4380.5)/60, 185.0, 0.15), (C.periodS(C.RE + 4380.5)/60).toFixed(2));
  ok('NASA 593 × 3,503 miles = 954 × 5,637 km', near(593*MI, 954, 0.5) && near(3503*MI, 5637, 0.6), (593*MI).toFixed(1) + ' × ' + (3503*MI).toFixed(1));
  ok('Telstar 954 × 5,637 km → ~158 min, CelesTrak 1440/9.12893 = 157.74', near(C.periodS(C.RE + 3295.5)/60, 1440/9.1289336, 0.15), (C.periodS(C.RE + 3295.5)/60).toFixed(2));
  ok('Telstar TLE semimajor axis gives 954–5,637 km within 25 km (orbit unchanged since 1962)', near(C.TELSTAR.a*(1 - C.TELSTAR.e) - C.RE, 954, 25) && near(C.TELSTAR.a*(1 + C.TELSTAR.e) - C.RE, 5637, 25), (C.TELSTAR.a*(1 - C.TELSTAR.e) - C.RE).toFixed(0) + ' × ' + (C.TELSTAR.a*(1 + C.TELSTAR.e) - C.RE).toFixed(0));
  ok('GEO drift is zero; below drifts east, above west', Math.abs(C.driftDegDay(C.R_GEO)) < 0.01 && C.driftDegDay(C.R_GEO - 1000) > 0 && C.driftDegDay(C.R_GEO + 1000) < 0);
  ok('Syncom 3 35,670 × 35,908 km: mean within 5 km of GEO, drift < 0.1°/day', near((35670 + 35908)/2, C.H_GEO, 5) && Math.abs(C.driftDegDay(C.RE + 35789)) < 0.1);
  ok('chart markers within the plotted range', C.MARKS.every(m => m.h > 158 && m.h < 100000));
  // Kepler solver and propagator
  let worst = 0; for(const e of [0, 0.3, 0.722, 0.98, 0.999]) for(let M = 0.001; M < 6.3; M += 0.37){ const E = C.kepler(M, e); const d = E - e*Math.sin(E) - M; worst = Math.max(worst, Math.abs(Math.atan2(Math.sin(d), Math.cos(d)))); }
  ok('Kepler solver residual < 1e-10 up to e = 0.999', worst < 1e-10, worst.toExponential(2));
  const circ = {a:7000, e:0, i:30, O:10, w:0, M:0, n:Math.sqrt(C.GM/343e9), t0:0};
  ok('propagator keeps a circular orbit at radius a', [0, 1e6, 5e6].every(t => { const r = C.eciAt(circ, t); return near(Math.hypot(...r), 7000, 1e-6); }));
  // CH3 — Telstar passes vs SGP4 (python-sgp4 2.27, same elements, minute steps; see NOTES)
  const ref = {and:[[544,556],[706,727],[870,901],[1035,1078],[1201,1245]], ple:[[389,408],[553,580],[717,755],[882,925],[1056,1073]], both:[[553,556],[717,727],[882,901],[1056,1073]]};
  const P = C.PASSES.telstar;
  ['and', 'ple', 'both'].forEach(k => ok('Telstar ' + k + ' windows match SGP4 to 2 min', P[k].length === ref[k].length && P[k].every((x, j) => near(x[0], ref[k][j][0], 2) && near(x[1], ref[k][j][1], 2)), JSON.stringify(P[k])));
  const lensA = P.and.map(x => x[1] - x[0]), lensB = P.both.map(x => x[1] - x[0]);
  ok('Andover passes 12–44 min (meta)', Math.min(...lensA) === 12 && Math.max(...lensA) === 44, lensA.join(','));
  ok('longest shared window today (2026 orientation, not 1962) is of the order of NASA\'s "about 18 minutes" (±3)', near(Math.max(...lensB), 18, 3), Math.max(...lensB));
  const geoA = C.TRACKS.geo.map(x => x.a);
  ok('GEO at 28° W: constant elevation at Andover all day', Math.max(...geoA) - Math.min(...geoA) < 1e-9 && geoA[0] > 0, geoA[0].toFixed(2));
  ok('Telstar altitude over the day stays within perigee–apogee', C.TRACKS.telstar.every(x => x.alt > 900 && x.alt < 5700));
  // CH4 — figure eight
  ok('figure-eight latitude reaches ±i', near(C.f8Point(33, Math.PI/2)[0], 33, 1e-9));
  ok('Syncom 3 at 0.1°: east–west swing < 0.001°', C.f8Swing(0.1) < 0.001, C.f8Swing(0.1).toExponential(2));
  ok('Syncom 2 at 33°: swing ±5.0° east–west, fits the ±6° plot', near(C.f8Swing(33), 5.03, 0.05) && C.f8Swing(35) < 6, C.f8Swing(33).toFixed(3));
  ok('seen from below, a 33° orbit swings more than 33° from zenith', C.f8Zenith(33) > 33, C.f8Zenith(33).toFixed(1));
  ok('drift model peaks at 14.6° after 26.5 yr', near(C.driftIncl(26.5), 14.6, 1e-9));
  ok('Syncom 3 (Aug 1964 → Oct 2026): model vs CelesTrak 7.27° within 0.6°', near(C.driftIncl(2026.80 - 1964.63), 7.27, 0.6), C.driftIncl(2026.80 - 1964.63).toFixed(2));
  ok('Early Bird (Apr 1965 → Oct 2026): model vs CelesTrak 7.46° within 0.6°', near(C.driftIncl(2026.80 - 1965.26), 7.46, 0.6), C.driftIncl(2026.80 - 1965.26).toFixed(2));
  // CH5 — Molniya
  ok('critical inclination 63.43°', near(C.critIncl(), 63.435, 0.001), C.critIncl().toFixed(4));
  ok('perigee drift vanishes at 63.435°, + below, − above', Math.abs(C.mlRates(63.435).dw) < 0.01 && C.mlRates(50).dw > 0 && C.mlRates(75).dw < 0);
  ok('Molniya period = half a sidereal day (12 h orbit [13])', near(C.periodS(C.ML_A)*2, C.SID, 1e-6));
  ok('Molniya apogee "nearly 40,000 km" (39,361) and perigee ~1,000 km', near(C.ML_A*(1 + C.ML_E) - C.RE, 39361, 2) && near(C.ML_A*(1 - C.ML_E) - C.RE, 1006, 2));
  ok('Molniya north of equator 91.6 % of each orbit', near(C.mlFracNorth(63.435, 0), 0.9158, 0.002), C.mlFracNorth(63.435, 0));
  const tr = C.mlTrack(63.435, 1440);
  ok('early Molniya-1 at ~65° ([24]): perigee drift only a few °/yr (≈ −5.8)', near(C.mlRates(65).dw, -5.76, 0.1), C.mlRates(65).dw.toFixed(2));
  ok('50° and 75°: apogee moves 30° within a year ("within months")', 30/Math.abs(C.mlRates(50).dw) < 1 && 30/Math.abs(C.mlRates(75).dw) < 1);
  ok('NASA "about two-thirds over one hemisphere" ≈ time north of 45° (0.676)', near(C.mlFracNorth(63.435, 45), 2/3, 0.02), C.mlFracNorth(63.435, 45));
  ok('apogees fall at 65° E and 115° W', near(tr[360][1], 65, 0.01) && near(tr[1080][1], -115, 0.01));
  // CH6 — coverage and delay
  ok('Earth spans 17.4° from GEO', near(C.earthAngDeg(), 17.4, 0.05), C.earthAngDeg().toFixed(2));
  ok('horizon footprint 81.3° of arc; max latitude ≈ 81°', near(C.coverLambda(0), 81.30, 0.01), C.coverLambda(0).toFixed(3));
  ok('footprint covers 42 % of Earth', near(C.capFraction(C.coverLambda(0)), 0.424, 0.001));
  ok('Clarke: three satellites 120° apart overlap at 5° and 10° elevation', C.coverLambda(5) > 60 && C.coverLambda(10) > 60 && C.satsForRing(10) === 3);
  ok('four satellites needed above ~21.9° minimum elevation', C.satsForRing(21.5) === 3 && C.satsForRing(22.5) === 4);
  ok('up and down at nadir 71,572 km = 0.239 s', near(2*C.H_GEO, 71572, 1) && near(2*C.H_GEO/c, 0.2387, 0.0005));
  ok('edge of footprint ≈ 0.278 s ("nearly 0.28")', near(2*C.slantKm(0)/c, 0.278, 0.001), (2*C.slantKm(0)/c).toFixed(4));
  ok('question and answer 0.48–0.56 s', near(4*C.H_GEO/c, 0.48, 0.005) && near(4*C.slantKm(0)/c, 0.56, 0.005), (4*C.H_GEO/c).toFixed(3) + '–' + (4*C.slantKm(0)/c).toFixed(3));
  ok('slant range at latitude matches elevation formula', near(C.rangeAtLat(30), C.slantKm(C.elevAtLat(30)), 1e-6));
  ok('Moscow 55.75° → 26° elevation; Norilsk 69.35° → 12°', near(C.elevAtLat(55.75), 26.5, 0.1) && near(C.elevAtLat(69.35), 12.1, 0.1), C.elevAtLat(55.75).toFixed(2) + ' / ' + C.elevAtLat(69.35).toFixed(2));
  ok('0.05° at GEO ≈ 37 km', near(C.R_GEO*0.05*Math.PI/180, 37, 0.5), (C.R_GEO*0.05*Math.PI/180).toFixed(2));
  ok('ring circumference ≈ 265,000 km', near(2*Math.PI*C.R_GEO, 265000, 500), (2*Math.PI*C.R_GEO).toFixed(0));
  ok('568 satellites → one per 0.63°', near(360/568, 0.63, 0.005));
  ok('time slider has aria-valuetext with UTC and elevation', /UTC, .*Andover/.test(w.document.getElementById('tsT').getAttribute('aria-valuetext') || ''), w.document.getElementById('tsT').getAttribute('aria-valuetext'));
  // UI: every preset in both languages renders without NaN
  let bad = 0;
  ['ru', 'en'].forEach(l => { w.document.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); [...w.document.querySelectorAll('main .btn')].forEach(b => { if(b.id !== 'tsPlay') b.click(); if(/NaN|undefined|Infinity/.test(w.document.querySelector('main').textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  ok('no Latin "km" in Russian readouts', (() => { w.document.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = [...w.document.querySelectorAll('.readout-grid')].map(e => e.textContent).join(' '); w.document.querySelector('#langtoggle button[data-lang="en"]').click(); return !/\d km/.test(t); })());
  ok('RU drift status keeps the degree sign', (() => { const d = w.document; d.querySelector('#langtoggle button[data-lang="ru"]').click(); const h = d.getElementById('pdH'); const v = h.value; h.value = Math.log10(1000); h.dispatchEvent(new w.Event('input')); const t = d.getElementById('pdStatus').textContent; h.value = v; h.dispatchEvent(new w.Event('input')); d.querySelector('#langtoggle button[data-lang="en"]').click(); return /\d° в сутки/.test(t); })());
  ok('RU year plural: 1 год / 2 года / 5 лет', (() => { const d = w.document; d.querySelector('#langtoggle button[data-lang="ru"]').click(); const f = d.getElementById('f8I'), v = f.value; const got = [1.0, 1.6, 4.5].map(x => { f.value = x; f.dispatchEvent(new w.Event('input')); return d.getElementById('f8Status').textContent; }); f.value = v; f.dispatchEvent(new w.Event('input')); d.querySelector('#langtoggle button[data-lang="en"]').click(); return !got.some(t => /\b[1-4] лет|\b1 года/.test(t)); })());
  console.log(out.join('\n'));
};
