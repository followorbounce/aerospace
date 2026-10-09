module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('equal-volume radius ≈ 1.65 km', Math.abs(C.R_EQ - 1650) < 20, C.R_EQ.toFixed(0));
  const o = C.circ(30000); ok('orbit at 30 km ≈ 15 cm/s', Math.abs(o.v - 0.149) < 0.003, (o.v*100).toFixed(2));
  ok('period at 30 km ≈ 14.6 days', Math.abs(o.T/86400 - 14.6) < 0.3, (o.T/86400).toFixed(2));
  const s = C.circ(C.R_EQ); ok('surface escape ≈ 0.9 m/s', Math.abs(s.vesc - 0.90) < 0.03, s.vesc.toFixed(3));
  ok('surface g ≈ 2.45e-4', Math.abs(s.g - 2.45e-4) < 0.05e-4, s.g.toExponential(3));
  const b = C.bounce(0.38); const exact = C.R_EQ*(0.38**2/s.vesc**2)/(1 - 0.38**2/s.vesc**2);
  ok('bounce height energy-exact', Math.abs(b.h - exact) < 1e-6, b.h.toFixed(0) + ' m');
  ok('above vesc escapes', C.bounce(1.0).esc && !C.bounce(0.5).esc);
  ok('power at 5.2 AU ≈ 3.7%', Math.abs(C.powerFrac(5.2) - 0.037) < 0.001, (C.powerFrac(5.2)*100).toFixed(2));
  console.log(out.join('\n'));
};
