module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const O = C.orbit(53.5, 4200);
  ok('53.5 d, 4,200 km → apojove ≈ 8.1 million km [BE]', Math.abs(O.ra/1e6 - 8.1) < 0.1, (O.ra/1e6).toFixed(3));
  const O2 = C.orbit(53.5, 4300);
  ok('perijove speed ≈ 57.8 km/s within 0.5 % [BE, 4,300 km]', Math.abs(O2.vp - 57.8)/57.8 < 0.005, O2.vp.toFixed(2));
  ok('perijove speed ≈ 208,000 km/h within 0.5 %', Math.abs(O.vp*3600 - 208000)/208000 < 0.005, (O.vp*3600).toFixed(0));
  const O14 = C.orbit(14, 4200);
  ok('Δv 53.5 → 14 d ≈ 0.39 km/s', Math.abs((O.vp - O14.vp) - 0.39) < 0.02, (O.vp - O14.vp).toFixed(3));
  // vis-viva energy consistency
  const eps = O.vp**2/2 - 1.26687e8/O.rp, eps2 = O.va**2/2 - 1.26687e8/O.ra;
  ok('energy conserved peri/apo', Math.abs(eps - eps2) < 1e-6*Math.abs(eps), eps.toFixed(3));
  // time below 2 R_J by numerical integration of Kepler
  let n = 200000, inside = 0; for(let i = 0; i < n; i++){ const p = C.keplerPos(O, i/n); if(Math.hypot(p.x, p.y) < 2*C.R_J) inside++; }
  const tNum = inside/n*O.T, tAn = C.timeBelow(O, 2*C.R_J);
  ok('time inside 2 R_J: analytic = numeric', Math.abs(tNum - tAn) < 60, (tAn/3600).toFixed(3) + ' h vs ' + (tNum/3600).toFixed(3));
  ok('Ka 1 mm/s two-way ≈ 213 mHz', Math.abs(C.doppler(1e-3, 32) - 0.2135) < 0.001, C.doppler(1e-3, 32).toFixed(4));
  console.log(out.join('\n'));
};
