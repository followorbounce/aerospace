module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const I = C.impact(1, 180, 790); ok('1 cm Al bead mass 1.41 g', Math.abs(I.m*1000 - 1.414) < 0.01, (I.m*1000).toFixed(3));
  const v = C.impact(1, 103, 790).v/1000; ok('crossing at ~103° → ~11.7 km/s (Iridium–Cosmos "> 11")', v > 11 && v < 12, v.toFixed(2));
  const E10 = 0.5*C.impact(1, 0, 790).m*1e8; ok('1 cm at 10 km/s ≈ 70.7 kJ (hero claim)', Math.abs(E10 - 70686) < 50, E10.toFixed(0));
  ok('70.7 kJ = 1 t car at ~43 km/h', Math.abs(Math.sqrt(2*E10/1000)*3.6 - 42.8) < 0.5);
  ok('relative speed = 2v sin(θ/2) at 180° = 2v', Math.abs(C.impact(1, 180, 790).v/1000 - 2*C.vCirc(790)) < 1e-9);
  const B = 0.01;
  const y5 = C.lifetime(500, B, 1), y8 = C.lifetime(800, B, 1), y10 = C.lifetime(1000, B, 1);
  ok('500 km: several years (NASA)', y5 > 1 && y5 < 30, y5.toFixed(1));
  ok('800 km: centuries (NASA)', y8 > 100 && y8 < 1000, y8.toFixed(0));
  ok('1,000 km: ≥ 1,000 years (NASA)', y10 > 1000, isFinite(y10) ? y10.toFixed(0) : 'inf');
  ok('higher solar activity shortens lifetime', C.lifetime(500, B, 4) < y5/3);
  ok('density at 400 km = 2.803e-12', Math.abs(C.rho(400) - 2.803e-12) < 1e-16);
  console.log(out.join('\n'));
};
