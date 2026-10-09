module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  // rocket equation: 2 km/s at 300 s → 1 − e^(−0.680) = 49.3 %; at 3000 s → 6.6 %
  ok('Δv 2 km/s, Isp 300 s ≈ 49.3 %', Math.abs(C.propFrac(2, 300) - 0.4934) < 0.001, (C.propFrac(2,300)*100).toFixed(2));
  ok('Δv 2 km/s, Isp 3000 s ≈ 6.6 %', Math.abs(C.propFrac(2, 3000) - 0.0657) < 0.001, (C.propFrac(2,3000)*100).toFixed(2));
  const it = C.surface('itokawa'), be = C.surface('bennu');
  ok('Itokawa equal-volume radius ≈ 164 m', Math.abs(it.R - 164) < 2, it.R.toFixed(1));
  ok('Bennu equal-volume radius ≈ 245 m', Math.abs(be.R - 245) < 2, be.R.toFixed(1));
  ok('Bennu escape ≈ 20 cm/s', Math.abs(be.vesc - 0.200) < 0.003, (be.vesc*100).toFixed(2));
  ok('Itokawa escape ≈ 17 cm/s', Math.abs(it.vesc - 0.169) < 0.003, (it.vesc*100).toFixed(2));
  ok('Bennu g ≈ 8.1e-5', Math.abs(be.g - 8.15e-5) < 0.1e-5, be.g.toExponential(3));
  const k = C.kick('bennu', 0.1), ex = be.R*(0.01/be.vesc**2)/(1 - 0.01/be.vesc**2);
  ok('kick height energy-exact', Math.abs(k.h - ex) < 1e-9, k.h.toFixed(1) + ' m');
  ok('kick above vesc escapes', C.kick('bennu', 0.25).esc && !C.kick('bennu', 0.15).esc);
  ok('LEO speed at 200 km ≈ 7.78 km/s', Math.abs(C.V_LEO - 7.784) < 0.01, C.V_LEO.toFixed(3));
  ok('escape at 125 km ≈ 11.07 km/s', Math.abs(C.V_ESC - 11.07) < 0.02, C.V_ESC.toFixed(3));
  ok('OSIRIS-REx 44,500 km/h = 12.36 km/s', Math.abs(C.V_OREX - 12.361) < 0.002, C.V_OREX.toFixed(3));
  const e = C.entry(C.V_OREX);
  ok('energy at 12.36 km/s ≈ 76.4 MJ/kg', Math.abs(e.e - 76.4) < 0.2, e.e.toFixed(2));
  ok('heating ratio = (v/vLEO)^3', Math.abs(e.qRatio - (C.V_OREX/C.V_LEO)**3) < 1e-9, e.qRatio.toFixed(2));
  console.log(out.join('\n'));
};
