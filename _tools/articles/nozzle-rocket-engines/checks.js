module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('A/A* = 1 at M = 1', Math.abs(C.areaRatio(1, 1.4) - 1) < 1e-12);
  ok('γ 1.4, M 2 → A/A* 1.6875 (textbook)', Math.abs(C.areaRatio(2, 1.4) - 1.6875) < 1e-4, C.areaRatio(2, 1.4).toFixed(4));
  ok('γ 1.4, M 2 → p/p0 0.1278 (textbook)', Math.abs(C.pRatio(2, 1.4) - 0.1278) < 1e-4, C.pRatio(2, 1.4).toFixed(4));
  ok('inverse Mach solver', Math.abs(C.machFromArea(C.areaRatio(3.7, 1.2), 1.2) - 3.7) < 1e-9);
  ok('SSME 90.7/10.3 diameters → ε 77.5', Math.abs((90.7/10.3)**2 - 77.5) < 0.1, ((90.7/10.3)**2).toFixed(2));
  // RS-25: ΔF = p_a A_e (NASA fact sheet 512,300 − 418,000 lbf) → exit diameter
  const Ae = (512300 - 418000)/14.696, D = Math.sqrt(4*Ae/Math.PI);
  ok('RS-25 implied exit diameter ≈ 90.7 in (within 1 %)', Math.abs(D - 90.7)/90.7 < 0.01, D.toFixed(1));
  // model sea-level/vacuum thrust ratio vs NASA 418,000/512,300
  const r = C.cF(77.5, 1.2, 3000*C.PSI, C.P0).cf/C.cF(77.5, 1.2, 3000*C.PSI, 0).cf;
  ok('model RS-25 SL/vac within 3 % of NASA 0.816', Math.abs(r - 418000/512300) < 0.03*0.816, r.toFixed(3));
  ok('RS-25 Isp = 470,000 / 1,035 ≈ 454 s', Math.abs(470000/1035 - 454.1) < 0.2, (470000/1035).toFixed(1));
  // matched nozzle: C_F maximum where p_e = p_a
  const g = 1.2, pc = 1100*C.PSI, pa = 0.02*pc; let best = 0, bestE = 0;
  for(let e = 2; e < 60; e += 0.05){ const c = C.cF(e, g, pc, pa).cf; if(c > best){ best = c; bestE = e; } }
  const pe = C.cF(bestE, g, pc, pa).pe; ok('C_F peaks where p_e = p_a', Math.abs(pe/pa - 1) < 0.02, (pe/pa).toFixed(3));
  console.log(out.join('\n'));
};
