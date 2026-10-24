module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const D = Math.PI/180;
  // CH2 — coverage
  const st = C.streets(780, 8.2);
  ok('Iridium 780 km / 8.2°: streets of coverage give 6 planes × 11 = 66 (eoPortal [2])', st.P === 6 && st.S === 11 && st.N === 66, st.P + '×' + st.S);
  const sp = C.streets(780, 8.2); ok('Iridium plane spacing λ + c ≈ 31.5° and seam 2c ≈ 23° vs Pratt et al. 31.6° / 22° [21]', near((C.footprint(780, 8.2)/D) + sp.c, 31.6, 0.3) && near(2*sp.c, 22, 1.2), ((C.footprint(780, 8.2)/D) + sp.c).toFixed(2) + ' / ' + (2*sp.c).toFixed(2));
  ok('6 × 11 holds for masks 7.0°–8.2° only (8.2° is the steepest the 66 can serve)', [7.0, 7.5, 8.0, 8.2].every(e => C.streets(780, e).N === 66) && C.streets(780, 6.9).N !== 66 && C.streets(780, 8.3).N !== 66);
  ok('Iridium footprint half-angle ≈ 19.9°', near(C.footprint(780, 8.2)/D, 19.92, 0.02), (C.footprint(780, 8.2)/D).toFixed(3));
  ok('Iridium footprint ≈ 15 million km² (figure commonly quoted for the system)', near(C.capArea(780, 8.2)/1e6, 15.3, 0.1), (C.capArea(780, 8.2)/1e6).toFixed(2));
  ok('elevation 0° footprint = arccos(R/r)', near(C.footprint(550, 0), Math.acos(6378.137/6928.137), 1e-12));
  ok('slant range at 90° elevation = altitude', near(C.slantMax(550, 90), 550, 1e-6), C.slantMax(550, 90).toFixed(6));
  ok('OneWeb 1,200 km / 40°: streets choose 12 planes (OneWeb flies 12 [10])', C.streets(1200, 40).P === 12, JSON.stringify(C.streets(1200, 40)));
  const sl = C.streets(550, 25);
  ok('Starlink 550 km / 25°: coverage needs only a few hundred (< 500)', sl.N < 500 && C.nHoneycomb(550, 25) < sl.N, sl.N + ' / honeycomb ' + C.nHoneycomb(550, 25).toFixed(0));
  ok('Starlink operational fleet is > 20× the coverage minimum', C.SNAP.slOp/sl.N > 20, (C.SNAP.slOp/sl.N).toFixed(1));
  ok('honeycomb bound always below the streets count (grid of presets)', [[780, 8.2], [1200, 40], [550, 25], [1500, 10], [400, 40]].every(p => C.nHoneycomb(p[0], p[1]) < C.streets(p[0], p[1]).N));
  // CH3 — snapshot arithmetic [9][10]
  ok('Starlink launched − down = in orbit (13,015 − 1,861 = 11,154)', C.SNAP.slLaunched - C.SNAP.slDown === C.SNAP.slInOrbit);
  ok('shell table sums to McDowell’s 9,726 operational', C.SHELLS.reduce((a, r) => a + r[4], 0) === C.SNAP.slOp, C.SHELLS.reduce((a, r) => a + r[4], 0));
  ok('Group 4-7: 38 of 49 lost', C.SNAP.g47 === 49 && C.SNAP.g47lost === 38);
  ok('fleet table: operational ≤ launched for every constellation', C.FLEET.every(r => r[3] <= r[2]));
  // CH4 — latency
  ok('GEO altitude from one sidereal day = 35,786 km', near(C.H_GEO, 35786, 1), C.H_GEO.toFixed(1));
  ok('minimum GEO bent-pipe round trip 4h/c ≈ 477 ms', near(4*C.H_GEO/299792.458*1000, 477.5, 0.5), (4*C.H_GEO/299792.458*1000).toFixed(1));
  ok('Starlink 480–550 km adds 3.2–3.7 ms per up-and-down', near(2*480/299792.458*1000, 3.2, 0.05) && near(2*550/299792.458*1000, 3.67, 0.05));
  const LN = C.gcKm(C.CITIES.LON, C.CITIES.NYC);
  ok('London–New York great circle ≈ 5,570 km', near(LN, 5570, 15), LN.toFixed(0));
  ok('great-circle distance is symmetric', near(C.gcKm(C.CITIES.SYD, C.CITIES.LAX), C.gcKm(C.CITIES.LAX, C.CITIES.SYD), 1e-9));
  ok('antipodes are πR apart', near(C.gcKm([10, 20], [-10, -160]), Math.PI*6371, 1e-6));
  const lt = C.latency(C.CITIES.LON, C.CITIES.NYC, 550, 1);
  ok('London–New York: straight fibre RTT ≈ 54.6 ms', near(lt.fibre, 54.6, 0.3), lt.fibre.toFixed(2));
  ok('London–New York: LEO laser beats straight fibre', lt.laser < lt.fibre, lt.laser.toFixed(2) + ' < ' + lt.fibre.toFixed(2));
  ok('London–New York: one GEO hop, RTT > 477 ms', lt.hops === 1 && lt.geo > 477, lt.geo.toFixed(0));
  const lp = C.latency(C.CITIES.LON, C.CITIES.PAR, 550, 1);
  ok('London–Paris: fibre beats the LEO laser over a short route', lp.fibre < lp.laser, lp.fibre.toFixed(2) + ' < ' + lp.laser.toFixed(2));
  ok('Tokyo–São Paulo needs more than one GEO hop', C.latency(C.CITIES.TYO, C.CITIES.SAO, 550, 1).hops > 1, C.latency(C.CITIES.TYO, C.CITIES.SAO, 550, 1).hops);
  ok('every pair gets a finite GEO path', Object.keys(C.CITIES).length === 9 && [['LON','NYC'],['FRA','SIN'],['LAX','SYD'],['TYO','SAO'],['LON','PAR']].every(p => isFinite(C.latency(C.CITIES[p[0]], C.CITIES[p[1]], 550, 1).geo)));
  ok('idealised vertical-path crossover at 550 km ≈ 2,867 km (text: about 2,900 km)', near(C.crossover(550), 2867, 2), C.crossover(550).toFixed(0));
  ok('same model at Handley’s 1,150 km ≈ 7,900 km (text: near 8,000) — pessimistic next to his ~3,000 km [14]', near(C.crossover(1150), 7945, 10) && C.crossover(1150) > 3000, C.crossover(1150).toFixed(0));
  const lc = C.latency([0, 0], [0, C.crossover(550)/6371/D], 550, 1);
  ok('at the crossover distance laser and straight fibre tie', near(lc.laser, lc.fibre, 1e-6));
  // CH6 — shadow, density, streaks
  ok('shadow at zenith with the Sun 18° down ≈ 330 km', near(C.shadowHeightZenith(18), 328, 2), C.shadowHeightZenith(18).toFixed(1));
  ok('cylindrical-shadow test flips at that height', C.sunlit(C.shellPoint(335, 90, 0).P, 18) && !C.sunlit(C.shellPoint(320, 90, 0).P, 18));
  ok('Rubin midnight, December: Sun ≈ 36° down', near(C.midnightDepression(C.RUBIN_LAT, -C.OBLIQ), 36.3, 0.1), C.midnightDepression(C.RUBIN_LAT, -C.OBLIQ).toFixed(2));
  ok('Rubin midnight, June: Sun ≈ 83° down', near(C.midnightDepression(C.RUBIN_LAT, C.OBLIQ), 83.2, 0.1), C.midnightDepression(C.RUBIN_LAT, C.OBLIQ).toFixed(2));
  ok('mid-latitude summer check: 50° N in June, Sun only ~17° down at midnight', near(C.midnightDepression(50, 23.44), 16.56, 0.01));
  const sc = C.skyCounts(10000, 550, 90);
  const exact = 10000*(1 - 6371/6921)/2;
  ok('sky integral of satellites above the horizon = N(1 − R/r)/2', near(sc.all, exact, exact*0.005), sc.all.toFixed(1) + ' vs ' + exact.toFixed(1));
  ok('Sun 90° down: nothing above 30° is lit at 550 km', sc.lit30 < 1e-9);
  ok('Sun 0°: everything is lit', near(C.skyCounts(10000, 550, 0).litAll, exact, exact*0.005));
  const pd30 = C.perSqDeg(12000, 550, 30);
  ok('12,000 at 550 km, 30° elevation (airmass 2): density within McDowell’s 0.005–0.01 per deg² [18]', pd30 >= 0.005 && pd30 <= 0.0105, pd30.toFixed(4));
  ok('uniform-shell density at zenith is lower (~0.0018 per deg²)', near(C.perSqDeg(12000, 550, 90), 0.00184, 0.0001), C.perSqDeg(12000, 550, 90).toFixed(5));
  ok('Rubin field 3.5° diameter = 9.6 deg² [20]', near(Math.PI*1.75*1.75, 9.62, 0.01), (Math.PI*1.75*1.75).toFixed(2));
  const sk = C.streaks(12000, 550, 90, 0, 3.5, 30, 0);
  ok('zenith, 550 km: crossing a 3.5° field takes ≈ 4.4 s', near(sk.cross, 4.43, 0.05), sk.cross.toFixed(2));
  ok('zenith, 12,000 at 550 km, 30 s, Rubin field, lit: ≈ 0.17 streaks', near(sk.n, 0.17, 0.01), sk.n.toFixed(3));
  ok('streaks scale linearly with N', near(C.streaks(24000, 550, 60, 180, 3.5, 30, 0).n, 2*C.streaks(12000, 550, 60, 180, 3.5, 30, 0).n, 1e-12));
  ok('streak count with a zero-second exposure = satellites already in the field', near(C.streaks(12000, 550, 90, 0, 3.5, 0, 0).n, 12000/(4*Math.PI*6921*6921)*Math.PI*Math.pow(3.5*D*550/2, 2), 1e-9));
  ok('field in shadow: zero streaks counted', C.streaks(12000, 550, 90, 0, 3.5, 30, 60).n === 0);
  // CH7 — manoeuvres [24]
  ok('148,696 + 207,152 = 355,848 manoeuvres in a year', C.MANEUVERS.h2_2025 + C.MANEUVERS.h1_2026 === 355848);
  ok('Dec 2025–May 2026 is 182 days; ≈ 1,138 manoeuvres a day', (Date.UTC(2026, 5, 1) - Date.UTC(2025, 11, 1))/864e5 === C.MANEUVERS.days && Math.round(C.MANEUVERS.h1_2026/C.MANEUVERS.days) === 1138);
  // structure
  ok('25 references', C.REFERENCES.length === 25);
  ok('links to RELAY and DEBRIS', !!w.document.querySelector('a[href="/aerospace/relay-telstar-syncom"]') && !!w.document.querySelector('a[href="/aerospace/debris-space-junk"]'));
  ok('every role=img/group label has a Russian version', [...w.document.querySelectorAll('[role=img],[role=group]')].filter(e => !e.closest('#langtoggle')).every(e => e.hasAttribute('data-aria-ru')));
  ok('lede says nine chapters and there are 9 numbered chapters', /Nine chapters/.test(w.document.querySelector('.lede').getAttribute('data-en')) && w.document.querySelectorAll('.fig-num').length === 9);
  ok('RU readouts use the Cyrillic millisecond unit', (() => { w.document.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = w.document.getElementById('ltReadout').textContent; w.document.querySelector('#langtoggle button[data-lang="en"]').click(); return /мс/.test(t) && !/ ms/.test(t); })());
  // UI: every preset in both languages renders without NaN/undefined
  const d = w.document; let bad = 0;
  ['en', 'ru'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('#cvPre .btn, #ltPair .btn, #skSun .btn, #skFov .btn').forEach(b => { b.click();
      ['cvReadout', 'ltReadout', 'skReadout', 'cvStatus', 'ltStatus', 'skStatus', 'shellTable', 'fleetTable'].forEach(id => { if(/NaN|undefined|Infinity/.test(d.getElementById(id).textContent)) bad++; }); }); });
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('all presets render without NaN in EN and RU', bad === 0, bad);
  // streak status reads as a count once more than one streak per exposure is expected
  d.querySelector('#skSun .btn[data-d="12"]').click(); d.getElementById('skD').value = 0; d.getElementById('skD').dispatchEvent(new w.Event('input'));
  d.getElementById('skN').value = 5; d.getElementById('skN').dispatchEvent(new w.Event('input')); d.querySelector('#skFov .btn[data-f="10"]').click();
  ok('Sun up, 100,000 satellites, wide field: status gives a count, not “one exposure in 1”', /^About [\d.,]+ streaks cross every exposure/.test(d.getElementById('skStatus').textContent) && !/one exposure in 1 /.test(d.getElementById('skStatus').textContent), d.getElementById('skStatus').textContent.slice(0, 40));
  console.log(out.join('\n'));
};
