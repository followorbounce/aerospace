module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const g = C.clockRate(26561.75);
  ok('GPS net rate = 4.4647e-10 [Ashby]', Math.abs(g.net - 4.4647e-10) < 0.0005e-10, (g.net*1e10).toFixed(4));
  ok('3GM/2ac² = 2.5046e-10 [Ashby]', Math.abs((6.9693e-10 - g.net) - 2.5046e-10) < 0.0005e-10 && Math.abs(g.grav + g.vel - g.net) < 1e-22, ((6.9693e-10 - g.net)*1e10).toFixed(4));
  ok('38.6 µs/day', Math.abs(g.net*86400e6 - 38.58) < 0.05, (g.net*86400e6).toFixed(2));
  ok('factory freq 10.22999999543 MHz', Math.abs(10.23*(1 - 4.4647e-10) - 10.22999999543) < 1e-11);
  // zero crossing at a ≈ 9,545 km
  let lo = 6600, hi = 20000; for(let k = 0; k < 60; k++){ const m = (lo + hi)/2; C.clockRate(m).net < 0 ? lo = m : hi = m; }
  ok('effects cancel at a ≈ 9,545 km', Math.abs(lo - 9545) < 5, lo.toFixed(0));
  ok('ISS clock runs slow', C.clockRate(6378 + 420).net < 0);
  const S = C.solve(C.pseudoranges(0.4), true);
  ok('clock solution recovers truth (< 1 mm)', Math.hypot(S.x, S.y) < 1e-3, Math.hypot(S.x, S.y).toExponential(1));
  ok('recovered clock = 0.4 µs', Math.abs(S.b/C.C_M*1e6 - 0.4) < 1e-9);
  const P = C.solve(C.pseudoranges(0.4), false); ok('position-only fix is wrong by ~100 m', Math.hypot(P.x, P.y) > 20, Math.hypot(P.x, P.y).toFixed(0));
  ok('bunched geometry → larger DOP', C.dop(30).h > 3*C.dop(150).h, C.dop(30).h.toFixed(2) + ' vs ' + C.dop(150).h.toFixed(2));
  console.log(out.join('\n'));
};
