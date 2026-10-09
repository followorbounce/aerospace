module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('half-time 360 min', Math.abs(C.decay(10, 0, 360) - 5) < 1e-12);
  ok('no prebreathe R = 11.6/4.3 = 2.70', Math.abs(C.protocol('o2', 0, 0).R - 2.698) < 0.001);
  const st = C.protocol('staged', 12, 75); ok('Shuttle staged (60 min, 12 h, 75 min) ≈ 1.65', Math.abs(st.R - 1.65) < 0.02, st.R.toFixed(3));
  const need = h => { let m = 0; while(C.protocol('staged', h, m).R > 1.65 && m < 600) m += 1; return m; };
  ok('longer stay at 10.2 psi → shorter final O₂ (NASA: 40–75 min by stay)', need(16) < need(12) && need(48) < need(16), need(12) + ' / ' + need(16) + ' / ' + need(48) + ' min');
  ok('10.2 psi/26.5 % O₂ → N₂ 7.5 psi', Math.abs(0.735*10.2 - 7.497) < 0.001);
  const o4 = C.protocol('o2', 0, 240).R; ok('4 h O₂ only ≈ 1.70 (just above 1.65)', Math.abs(o4 - 1.70) < 0.01, o4.toFixed(3));
  const camp = C.protocol('camp', 20, 50); ok('campout capped at 8 h 40 min', Math.abs(camp.total - (60 + 520 + 50)) < 1e-9);
  ok('Orlan 5.8 psi: no-prebreathe R = 2.0', Math.abs(11.6/5.8 - 2) < 1e-12);
  console.log(out.join('\n'));
};
