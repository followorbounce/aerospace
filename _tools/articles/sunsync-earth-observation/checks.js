module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  [[705, 98.2, 'Landsat 9'], [786, 98.62, 'Sentinel-2'], [917, 99.2, 'Landsat 1']].forEach(r => { const i = C.ssoInc(r[0]); ok(r[2] + ' inclination within 0.1° of published ' + r[1], Math.abs(i - r[1]) < 0.1, i.toFixed(3)); });
  ok('Landsat 9 period ≈ 99 min', Math.abs(C.period(705)/60 - 99) < 0.5, (C.period(705)/60).toFixed(2));
  ok('Sentinel-2 period ≈ 100.6 min', Math.abs(C.period(786)/60 - 100.6) < 0.3, (C.period(786)/60).toFixed(2));
  ok('Landsat 1 period ≈ 103 min', Math.abs(C.period(917)/60 - 103) < 0.6, (C.period(917)/60).toFixed(2));
  const rate = C.nodeRate(6378.137 + 705, C.ssoInc(705))*86400*180/Math.PI;
  ok('node turns 0.9856°/day at SSO', Math.abs(rate - 0.98565) < 1e-4, rate.toFixed(5));
  ok('Sentinel-2 estimate = 10 days', C.coverage(786, 290).days === 10);
  ok('Landsat estimate 15 vs real 16 (overlap)', C.coverage(705, 185).days === 15);
  ok('diffraction 0.65 µm, 10 cm, 705 km ≈ 5.6 m', Math.abs(C.gsd(0.65, 0.1, 705) - 5.59) < 0.02, C.gsd(0.65, 0.1, 705).toFixed(2));
  console.log(out.join('\n'));
};
