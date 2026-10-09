module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('DART kinetic energy = 10.94 GJ [Daly Table 1]', Math.abs(0.5*C.M_DART*C.U_DART**2/1e9 - 10.94) < 0.01, (0.5*C.M_DART*C.U_DART**2/1e9).toFixed(3));
  ok('orbit radius from Kepler ≈ 1.20 km', Math.abs(C.A_ORB - 1200) < 15, C.A_ORB.toFixed(0));
  ok('geometry factor ≈ 0.91', Math.abs(C.F_GEOM - 0.913) < 0.01, C.F_GEOM.toFixed(3));
  const r = C.dimo(3.61, 2400);
  ok('Dimorphos mass ≈ 4.3e9 kg', Math.abs(r.M - 4.34e9) < 0.05e9, r.M.toExponential(3));
  ok('β 3.61 @ 2400 → Δv 2.70 mm/s', Math.abs(r.dv - 2.70e-3) < 1e-6, (r.dv*1000).toFixed(3));
  ok('independent: ΔP ≈ −33.0 ± 1.0 min', Math.abs(r.dP/60 + 33.0) < 1.0, (r.dP/60).toFixed(2));
  // Cheng: β range 2.2–4.9 for 1500–3300 kg/m³ at fixed Δv
  const bAt = rho => 3.61*rho/2400;
  ok('β(1500) ≈ 2.2, β(3300) ≈ 4.9', Math.abs(bAt(1500) - 2.26) < 0.1 && Math.abs(bAt(3300) - 4.96) < 0.1, bAt(1500).toFixed(2) + ' / ' + bAt(3300).toFixed(2));
  const c = C.impactEnergy(19, 19); ok('19 m at 19 km/s (3000 kg/m³) ≈ Chelyabinsk 500 ± 100 kt', Math.abs(c.E/C.KT - 500) < 100, (c.E/C.KT).toFixed(0));
  ok('drift 1 cm/s × 10 yr ≈ 9,470 km', Math.abs(C.drift(10, 10) - 9467) < 20, C.drift(10, 10).toFixed(0));
  ok('target ≈ 1.5 Earth radii', Math.abs(C.R_TARGET/6371 - 1.50) < 0.02, (C.R_TARGET/6371).toFixed(3));
  ok('DART on whole pair ≈ 0.02 mm/s', Math.abs(C.DV_SYS*1000 - 0.023) < 0.002, (C.DV_SYS*1000).toFixed(4));
  console.log(out.join('\n'));
};
