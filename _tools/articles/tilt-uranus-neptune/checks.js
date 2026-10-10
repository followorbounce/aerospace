module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const U = C.PLANETS.U, N = C.PLANETS.N, E = C.PLANETS.E, D = Math.PI/180;
  // seasons
  ok('Uranus period ≈ 84.0 yr (NSSDC days)', Math.abs(U.P - 84.01) < 0.01, U.P.toFixed(3));
  ok('Neptune period ≈ 164.8 yr', Math.abs(N.P - 164.79) < 0.01, N.P.toFixed(2));
  ok('Uranus polar day at the pole = half the orbit, 42.0 yr', Math.abs(C.polarDay(90, U.eps, U.P) - 42.006) < 0.01, C.polarDay(90, U.eps, U.P).toFixed(3));
  ok('Earth polar day at 70° ≈ 62 days (analytic)', Math.abs(C.polarDay(70, E.eps, 1)*365.25 - 62.3) < 0.5, (C.polarDay(70, E.eps, 1)*365.25).toFixed(1));
  ok('Earth equinox, equator: Q = S/π = 433 W/m²', Math.abs(C.insol(0, 0, 1361) - 1361/Math.PI) < 1e-9, C.insol(0, 0, 1361).toFixed(1));
  ok('Earth solstice, pole: Q = S·sin ε = 542 W/m²', Math.abs(C.insol(90, 23.44*D, 1361) - 1361*Math.sin(23.44*D)) < 1e-6, C.insol(90, 23.44*D, 1361).toFixed(1));
  // annual mean at the pole has the closed form (S/π)·sin ε; at the equator (S/π)·(2/π)·E(sin ε)
  const poleU = C.annualMean(90, U.eps, U.S), poleE = C.annualMean(90, E.eps, 1361);
  ok('annual mean at Uranus pole = (S/π) sin ε', Math.abs(poleU - U.S/Math.PI*Math.sin(U.eps*D)) < 1e-3, poleU.toFixed(4));
  ok('annual mean at Earth pole ≈ 172 W/m²', Math.abs(poleE - 1361/Math.PI*Math.sin(23.44*D)) < 0.1, poleE.toFixed(1));
  let Ek = 0; const k = Math.sin(U.eps*D), m = 200000; for(let i = 0; i < m; i++){ const t = (i + 0.5)/m*Math.PI/2; Ek += Math.sqrt(1 - k*k*Math.sin(t)**2); } Ek *= Math.PI/2/m;
  const eqU = C.annualMean(0, U.eps, U.S);
  ok('annual mean at Uranus equator = (S/π)(2/π)E(k)', Math.abs(eqU - U.S/Math.PI*2/Math.PI*Ek) < 2e-3, eqU.toFixed(4) + ' vs ' + (U.S/Math.PI*2/Math.PI*Ek).toFixed(4));
  ok('Uranus: poles get more than equator (≈1.5×)', poleU/eqU > 1.45 && poleU/eqU < 1.56, (poleU/eqU).toFixed(3));
  ok('Earth: poles get less than equator', poleE < C.annualMean(0, E.eps, 1361));
  // far and dim
  ok('Uranus sunlight 1361/3.69 ≈ 369×', Math.round(1361/3.69) === 369);
  ok('Neptune sunlight 1361/1.508 ≈ 902× (NASA “about 900”)', Math.round(1361/1.508) === 903 || Math.round(1361/1.508) === 902, (1361/1.508).toFixed(1));
  ok('1/r² from NSSDC distance reproduces 3.69 W/m² within 1 %', Math.abs(1361/(U.a*U.a)/3.69 - 1) < 0.01, (1361/(U.a*U.a)).toFixed(3));
  const jr = 115200;
  ok('1/r² from Jupiter (5.2 AU) ≈ DESCANSO expected rates within 10 %', Math.abs(jr*(5.2/U.a)**2/9000 - 1) < 0.1 && Math.abs(jr*(5.2/N.a)**2/3200 - 1) < 0.1, Math.round(jr*(5.2/U.a)**2) + ', ' + Math.round(jr*(5.2/N.a)**2));
  ok('achieved/expected: Uranus ×3.3, Neptune ×6.8 (Table 6-1)', Math.abs(C.RATES[2].ach/C.RATES[2].exp - 3.3) < 0.05 && Math.abs(C.RATES[3].ach/C.RATES[3].exp - 6.8) < 0.05);
  ok('light time at Uranus ≈ 2.66 h, Neptune ≈ 4.18 h', Math.abs(C.lightHours(U.a) - 2.66) < 0.01 && Math.abs(C.lightHours(N.a) - 4.18) < 0.01);
  ok('350 W at Uranus, 30 % cells ≈ 316 m²', Math.abs(C.panelArea(U.a, 350, 0.3) - 316) < 2, C.panelArea(U.a, 350, 0.3).toFixed(0));
  // encounters
  const daysU = (Date.UTC(1986,0,24) - Date.UTC(1977,7,20))/864e5/365.25, daysN = (Date.UTC(1989,7,25) - Date.UTC(1977,7,20))/864e5/365.25;
  ok('Voyager 2: 8.4 yr to Uranus, 12.0 yr to Neptune', daysU.toFixed(1) === '8.4' && daysN.toFixed(1) === '12.0', daysU.toFixed(2) + ', ' + daysN.toFixed(2));
  ok('Uranus pass inside Miranda\'s orbit (4.19 R)', C.ENC.U.R + C.ENC.U.alt < C.ENC.U.moonA && Math.abs((C.ENC.U.R + C.ENC.U.alt)/C.ENC.U.R - 4.19) < 0.01);
  // transfer
  const hU = C.transfer(C.hohmannVinf(U.a) + 1e-7, U.a), hN = C.transfer(C.hohmannVinf(N.a) + 1e-7, N.a);
  ok('Hohmann to Uranus ≈ 16.0 yr (paper: ~16–17)', Math.abs(hU.tof - 16.0) < 0.05, hU.tof.toFixed(3));
  ok('Hohmann to Neptune ≈ 30.8 yr', Math.abs(hN.tof - 30.78) < 0.05, hN.tof.toFixed(3));
  ok('Hohmann v∞ to Uranus 11.28 km/s, C3 ≈ 127', Math.abs(C.hohmannVinf(U.a) - 11.28) < 0.01 && Math.abs(hU.C3 - 127.2) < 0.3, C.hohmannVinf(U.a).toFixed(3));
  ok('Hohmann arrival v∞ at Uranus ≈ 4.66 km/s', Math.abs(hU.vinfArr - 4.66) < 0.02, hU.vinfArr.toFixed(3));
  const s1 = hU.tof - C.transfer(C.hohmannVinf(U.a) + 0.1, U.a).tof;
  ok('+0.1 km/s above Hohmann saves about 4.5 years (Uranus)', s1 > 4.3 && s1 < 4.8, s1.toFixed(2));
  ok('slider snap: ceil to 0.01 still within the Hohmann band', Math.ceil(C.hohmannVinf(U.a)*100)/100 - C.hohmannVinf(U.a) < 0.006 && Math.ceil(C.hohmannVinf(N.a)*100)/100 - C.hohmannVinf(N.a) < 0.006);
  ok('below Hohmann: does not reach', C.transfer(11.0, U.a).reach === false);
  // independent RK4 integration of the 2-body problem for an elliptic and a hyperbolic case
  function rk4(vinf, rT){
    const mu = C.GM_SUN, r0 = C.AU_KM, v0 = Math.sqrt(mu/r0) + vinf;
    let s = [r0, 0, 0, v0], t = 0; const h = 3600*24;
    const f = q => { const r3 = Math.pow(q[0]*q[0] + q[1]*q[1], 1.5); return [q[2], q[3], -mu*q[0]/r3, -mu*q[1]/r3]; };
    while(Math.hypot(s[0], s[1]) < rT*C.AU_KM){
      const k1 = f(s), k2 = f(s.map((x,i)=>x + h/2*k1[i])), k3 = f(s.map((x,i)=>x + h/2*k2[i])), k4 = f(s.map((x,i)=>x + h*k3[i]));
      const prev = s; s = s.map((x,i)=>x + h/6*(k1[i] + 2*k2[i] + 2*k3[i] + k4[i])); t += h;
      if(Math.hypot(s[0], s[1]) >= rT*C.AU_KM){ const r1 = Math.hypot(prev[0], prev[1]), r2 = Math.hypot(s[0], s[1]); t -= h*(r2 - rT*C.AU_KM)/(r2 - r1); break; }
    }
    return t/C.YEAR_S;
  }
  [[11.6, U.a], [12, N.a], [13, U.a], [20, U.a], [15, N.a]].forEach(([v, r]) => {
    const a = C.transfer(v, r).tof, b = rk4(v, r);
    ok('Kepler vs RK4, v∞ ' + v + ' km/s to ' + r.toFixed(1) + ' AU (' + (C.transfer(v, r).e < 1 ? 'ellipse' : 'hyperbola') + ')', Math.abs(a - b) < 0.01, a.toFixed(3) + ' vs ' + b.toFixed(3));
  });
  // Oberth: capture burn at r_p = 1.3 R is far smaller than v∞ and grows more slowly than v∞ (review values 0.57 → 3.99 km/s)
  const rpU = C.CAPTURE_RP*U.R, c1 = C.captureDv(4.66, U.GM, rpU), c2 = C.captureDv(12.84, U.GM, rpU);
  ok('capture burn at Uranus: v∞ 4.66 → 0.57 km/s, 12.84 → 3.99 km/s', Math.abs(c1 - 0.57) < 0.01 && Math.abs(c2 - 3.99) < 0.01, c1.toFixed(3) + ', ' + c2.toFixed(3));
  ok('capture burn < v∞ and grows more slowly (Δburn < Δv∞)', c1 < 4.66 && c2 < 12.84 && (c2 - c1) < (12.84 - 4.66));
  ok('capture burn energy check: (√(v∞²+v_esc²) − v_esc) for v∞ → 0 is 0', C.captureDv(0, U.GM, rpU) === 0);
  // pole/equator orbit-average crossover near 54° tilt
  let lo = 30, hi = 80; for(let it = 0; it < 40; it++){ const mid = (lo + hi)/2; (C.annualMean(90, mid, 1) > C.annualMean(0, mid, 1)) ? hi = mid : lo = mid; }
  ok('pole = equator crossover at tilt ≈ 54°', Math.abs(lo - 54) < 1, lo.toFixed(2));
  ok('faster departure → shorter trip, faster arrival', C.transfer(15, U.a).tof < hU.tof && C.transfer(15, U.a).vinfArr > hU.vinfArr);
  console.log(out.join('\n'));
};
