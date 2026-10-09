module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('expendable payload ≈ 21 t (model)', Math.abs(C.P_EXP - 21259) < 50, C.P_EXP.toFixed(0));
  const ship = 1 - C.payload(1400, 2000).P/C.P_EXP, site = 1 - C.payload(4500, 2000).P/C.P_EXP;
  ok('ship preset inside MIT 10–20 %', ship > 0.10 && ship < 0.20, (ship*100).toFixed(1));
  ok('~4.5 km/s reserve ≈ MIT "about half"', site > 0.40 && site < 0.55, (site*100).toFixed(1));
  // reserve formula self-check: reserve propellant gives exactly the recovery Δv on the empty stage
  const r = C.payload(1200, 2000).res; ok('reserve gives 1.2 km/s', Math.abs(300*9.80665*Math.log((27000 + r)/27000) - 1200) < 1e-6, r.toFixed(0));
  ok('Merlin min throttle 108,300 lbf = 481.7 kN', Math.abs(C.F_MIN - 481742) < 10, C.F_MIN.toFixed(0));
  ok('30 t booster cannot hover (min T/W > 1)', C.landing(30, 200, 1000).twMin > 1, C.landing(30, 200, 1000).twMin.toFixed(2));
  const L = C.landing(30, 200, 1000), a = C.F_MAX/30000 - 9.80665;
  ok('stop height = v²/2a', Math.abs(L.stop - 200*200/(2*a)) < 1e-9, L.stop.toFixed(1));
  ok('ignite at stop height → land', Math.abs(C.landing(30, 200, L.stop).vHit) < 1e-6);
  ok('Saturn V 7.61 Mlbf = 33.85 MN', Math.abs(C.THR[2][2] - 33.85) < 0.01, C.THR[2][2].toFixed(2));
  ok('N1 30 × 153.4 tf = 45.13 MN', Math.abs(C.THR[3][2] - 45.13) < 0.01, C.THR[3][2].toFixed(2));
  console.log(out.join('\n'));
};
