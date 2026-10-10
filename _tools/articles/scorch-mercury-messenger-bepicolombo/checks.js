module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const P = k => C.PLANETS.find(p => p.k === k), H = k => { const p = P(k); return C.hohmann(p.r, p.mu, p.R); };
  const me = H('mercury'), ma = H('mars'), ve = H('venus'), ju = H('jupiter');
  // published Hohmann figures: Mars departure ≈ 2.94 km/s, ~259 days; Mercury ~105 days
  ok('Mars Hohmann departure ≈ 2.94 km/s', Math.abs(ma.dep - 2.94) < 0.03, ma.dep.toFixed(3));
  ok('Mars transfer ≈ 259 days', Math.abs(ma.days - 259) < 2, ma.days.toFixed(1));
  ok('Mercury departure ≈ 7.5, arrival ≈ 9.6 km/s', Math.abs(me.dep - 7.53) < 0.05 && Math.abs(me.arr - 9.61) < 0.05, me.dep.toFixed(2) + ' / ' + me.arr.toFixed(2));
  ok('Mercury total ≈ 13.9 km/s (text)', Math.abs(me.total - 13.9) < 0.05, me.total.toFixed(2));
  ok('escape from 1 AU ≈ 12.3 km/s (text)', Math.abs(C.DV_ESCAPE - 12.34) < 0.03, C.DV_ESCAPE.toFixed(3));
  ok('Mercury costs more than leaving the Solar System; most of all four', me.total > C.DV_ESCAPE && me.total > ma.total && me.total > ve.total && me.total > ju.total);
  const pl = C.hohmann(5869.656e6, 870, 1188);   // Pluto, NASA fact sheet: a 5,869.656 Mkm, GM 870 km³/s², R 1,188 km
  ok('Pluto by the same rules ≈ 14.5 km/s, slightly above Mercury (disclosed in text)', Math.abs(pl.total - 14.55) < 0.05 && pl.total > me.total, pl.total.toFixed(2));
  // MESSENGER capture [11][12]
  const dsm = C.DSM_MS.reduce((a, b) => a + b, 0);
  ok('MESSENGER DSM-1…5 total ≈ 1.04 km/s (APL)', Math.abs(dsm - 1039.75) < 0.01, dsm.toFixed(2));
  ok('12-h orbit with 200 km low point → high point ≈ 15,190 km (known 15,193)', Math.abs(C.MESS_RA - C.R_ME - 15193) < 20, (C.MESS_RA - C.R_ME).toFixed(0));
  const vinf = C.vinfFromBurn(0.862);
  ok('0.862 km/s burn ⇒ arrival v∞ ≈ 2.3 km/s (text)', Math.abs(vinf - 2.27) < 0.02, vinf.toFixed(3));
  ok('round trip: capture(v∞) = 0.862', Math.abs(C.capture(vinf) - 0.862) < 1e-9);
  ok('APL 8-h orbit 278 × 10,314 km has an 8.0 h period', Math.abs(C.orbitPeriodH(278, 10314) - 8.0) < 0.05, C.orbitPeriodH(278, 10314).toFixed(3));
  ok('Hohmann arrival without flybys needs ≈ 6.6 km/s into the 12-h orbit', Math.abs(C.capture(me.arr) - 6.63) < 0.05, C.capture(me.arr).toFixed(2));
  ok('Mio 590 × 11,640 km ≈ 9.3 h; MPO 480 × 1,500 km ≈ 2.4 h (text)', Math.abs(C.orbitPeriodH(590, 11640) - 9.3) < 0.05 && Math.abs(C.orbitPeriodH(480, 1500) - 2.36) < 0.02, C.orbitPeriodH(590, 11640).toFixed(2) + ' / ' + C.orbitPeriodH(480, 1500).toFixed(2));
  // sunlight & temperature [1][3][11]
  const sMean = C.plateT(C.A_ME/C.AU, 1).S/1361, sPeri = C.plateT(C.Q_ME/C.AU, 1).S/1361, sAph = C.plateT(C.Q2_ME/C.AU, 1).S/1361;
  ok('mean irradiance 6.674 × Earth (NASA fact sheet)', Math.abs(sMean - 6.674) < 0.005, sMean.toFixed(3));
  ok('perihelion ≈ 10.6×, aphelion ≈ 4.6× (text)', Math.abs(sPeri - 10.58) < 0.02 && Math.abs(sAph - 4.59) < 0.02, sPeri.toFixed(2) + ' / ' + sAph.toFixed(2));
  const tb = C.plateT(C.Q_ME/C.AU, 1).T;
  ok('black plate at perihelion ≈ 710 K, within 3% of Mercury max ground 725 K', Math.abs(tb - 725)/725 < 0.03, tb.toFixed(1));
  const bb = C.plateT(C.A_ME/C.AU, 1 - 0.068).T/Math.SQRT2;
  ok('fact-sheet black-body 439.6 K = sphere, Bond albedo 0.068 (T_plate·(1−A)^¼/√2)', Math.abs(bb - 439.6) < 0.5, bb.toFixed(1));
  // 3:2 resonance [1][12][13]
  ok('spin = 2/3 orbit (Colombo 58.65 d)', Math.abs(C.T_SPIN - 2/3*C.T_ORBIT) < 0.01 && Math.abs(C.T_SPIN - 58.65) < 0.01, C.T_SPIN.toFixed(3));
  ok('solar day ≈ 176 d = fact sheet 4,222.6 h', Math.abs(C.SOLAR_DAY*24 - 4222.6) < 2, (C.SOLAR_DAY*24).toFixed(1));
  const a0 = C.mercuryAt(0), a1 = C.mercuryAt(C.SOLAR_DAY);
  ok('noon at t=0 and again after one solar day', a0.hour < 1e-9 && (a1.hour < 0.01 || a1.hour > 2*Math.PI - 0.01), a1.hour.toFixed(5));
  ok('after one solar day: 2 orbits, 3 turns', Math.abs(C.SOLAR_DAY/C.T_ORBIT - 2) < 0.002 && Math.abs(C.SOLAR_DAY/C.T_SPIN - 3) < 0.003);
  ok('Sun goes backwards at perihelion, not at aphelion', a0.retro && !C.mercuryAt(C.T_ORBIT/2).retro);
  ok('retrograde Sun lasts ≈ 8 days per orbit', Math.abs(C.retroDays() - 8.1) < 0.2, C.retroDays().toFixed(2));
  const vp = C.mercuryAt(0).r;
  ok('Kepler solver puts perihelion at 46.0 million km', Math.abs(vp/1e6 - 46.0) < 0.05, (vp/1e6).toFixed(3));
  ok('aphelion at half an orbit ≈ 69.8 million km', Math.abs(C.mercuryAt(C.T_ORBIT/2).r/1e6 - 69.82) < 0.05, (C.mercuryAt(C.T_ORBIT/2).r/1e6).toFixed(3));
  // a few DOM checks
  const d = w.document;
  ok('flyby table has 6 rows', d.querySelectorAll('#flybyTable tbody tr').length === 6);
  const last = d.querySelectorAll('#flybyTable tbody tr')[5].querySelectorAll('td');
  ok('table columns: MESSENGER 2011, BepiColombo 21 Nov 2026', /2011/.test(last[0].textContent) && /21 Nov 2026/.test(last[1].textContent), last[1].textContent);
  const venus = d.querySelectorAll('#flybyTable tbody tr')[2].querySelectorAll('td')[1].textContent;
  ok('BepiColombo Venus 2 = 10 Aug 2021 (JAXA)', /10 Aug 2021/.test(venus) && !/11 Aug/.test(venus), venus);
  ok('accessible names set', d.getElementById('dvPick').getAttribute('aria-label') === 'Destination');
  ok('four destination buttons', d.querySelectorAll('#dvPick .btn').length === 4);
  console.log(out.join('\n'));
};
