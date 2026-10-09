module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('escape Δv from 1 AU ≈ 12.3 km/s', Math.abs(C.DV_ESCAPE - 12.34) < 0.1, C.DV_ESCAPE.toFixed(2));
  const p = C.dvPerihelion(9.86*C.R_S); ok('Δv to 9.86 Rs ≈ 21 km/s', Math.abs(p.dv - 20.96) < 0.1, p.dv.toFixed(2)); ok('surface dive > 2× escape', C.dvPerihelion(C.R_S).dv/C.DV_ESCAPE > 2, (C.dvPerihelion(C.R_S).dv/C.DV_ESCAPE).toFixed(2));
  ok('rp→0 Δv → vE', Math.abs(C.dvPerihelion(1).dv - p.vE) < 0.01);
  ok('Mars Hohmann departure ≈ 2.94', Math.abs(C.dvPerihelionOut(1.524*C.AU) - 2.94) < 0.05, C.dvPerihelionOut(1.524*C.AU).toFixed(2));
  const h = C.shieldT(9.86*C.R_S, 1); ok('flux at 9.86 Rs ≈ 475 × Earth', Math.abs(h.S/1361 - 476) < 5, (h.S/1361).toFixed(0));
  ok('α/ε=0.6 at 9.86 Rs ≈ 1,350 °C', Math.abs(C.shieldT(9.86*C.R_S, 0.6).T - 273.15 - 1350) < 30, (C.shieldT(9.86*C.R_S, 0.6).T - 273.15).toFixed(0));
  ok('Earth black plate ≈ 394 K', Math.abs(C.shieldT(C.AU, 1).T - 394) < 2, C.shieldT(C.AU,1).T.toFixed(1));
  const o = C.solarOrbit(9.86*C.R_S, 0.728*C.AU);
  ok('Parker final perihelion speed ≈ 192 km/s', Math.abs(o.vp - 191) < 3, o.vp.toFixed(1));
  ok('Parker final period ≈ 88 days', Math.abs(o.T/86400 - 88) < 2, (o.T/86400).toFixed(1));
  const h2 = C.solarOrbit(0.29*C.AU, 0.98*C.AU); ok('Helios 2 speed ~70 km/s', Math.abs(h2.vp - 70) < 3, h2.vp.toFixed(1));
  console.log(out.join('\n'));
};
