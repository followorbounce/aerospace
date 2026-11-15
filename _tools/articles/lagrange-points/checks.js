module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const S = C.SYS, near = (a, b, rel) => Math.abs(a/b - 1) < rel;
  const se = C.lpoints(S.se.mu), seb = C.lpoints(S.seb.mu), sj = C.lpoints(S.sj.mu), em = C.lpoints(S.em.mu), pc = C.lpoints(S.pc.mu);

  // --- mass parameters from the NSSDC masses
  ok('Sun–Earth μ = 3.00e-6 (NSSDC masses)', near(S.se.mu, 3.0035e-6, 1e-4), S.se.mu.toExponential(4));
  ok('Sun–(Earth+Moon) μ = 3.0405e-6 from NSSDC masses (Koon\'s worked values use 3.0404e-6; his Table 2.2.1 prints 3.036e-6)', near(S.seb.mu, 3.0404e-6, 1e-4), S.seb.mu.toExponential(4));
  ok('Sun–Jupiter μ = 9.54e-4 (Koon: 9.537e-4)', near(S.sj.mu, 9.537e-4, 1e-3), S.sj.mu.toExponential(4));
  ok('Earth–Moon μ = 0.01215 (Koon: 1.215e-2)', near(S.em.mu, 1.215e-2, 1e-3), S.em.mu.toFixed(6));
  ok('Pluto–Charon μ = 0.1085', near(S.pc.mu, 0.1085, 1e-3), S.pc.mu.toFixed(5));
  ok('mass ratios 1,048 : 1 (Sun–Jupiter), 81 : 1 (Earth–Moon), about 8 : 1 (Pluto–Charon)', Math.round((1 - S.sj.mu)/S.sj.mu) === 1048 && Math.round((1 - S.em.mu)/S.em.mu) === 81 && Math.round((1 - S.pc.mu)/S.pc.mu) === 8);

  // --- the exact solver: force balance really vanishes, and the quintic gives the same roots
  let worst = 0, worstQ = 0;
  for(let k = 0; k <= 60; k++){
    const mu = Math.pow(10, -7 + k*(7 - 0.30103)/60), p = C.lpoints(mu);
    worst = Math.max(worst, Math.abs(C.dOmegaX(p.L1, mu)), Math.abs(C.dOmegaX(p.L2, mu)), Math.abs(C.dOmegaX(p.L3, mu)));
    worstQ = Math.max(worstQ, Math.abs(C.quintic(mu, 1)/p.g1 - 1), Math.abs(C.quintic(mu, 2)/p.g2 - 1));
  }
  ok('force balance at L1, L2, L3 is zero over μ = 1e-7 … 0.5', worst < 1e-8, worst.toExponential(1));
  ok('bisection and Newton-on-the-quintic agree to 1e-10 over the whole slider', worstQ < 1e-10, worstQ.toExponential(1));
  ok('μ = 0.5: L1 at the centre, L2 and L3 mirror images', Math.abs(C.lpoints(0.5).L1) < 1e-12 && Math.abs(C.lpoints(0.5).L2 + C.lpoints(0.5).L3) < 1e-12, C.lpoints(0.5).L2.toFixed(6));
  ok('L4 is a stationary point of Ω for any μ', [1e-6, 0.01, 0.2, 0.5].every(mu => Math.hypot(...C.gradOmega(0.5 - mu, Math.sqrt(3)/2, mu)) < 1e-12));
  ok('L4 is at distance 1 from both bodies', Math.abs(Math.hypot(se.L4[0] + S.se.mu, se.L4[1]) - 1) < 1e-12 && Math.abs(Math.hypot(se.L4[0] - 1 + S.se.mu, se.L4[1]) - 1) < 1e-12);

  // --- Koon, Lo, Marsden, Ross: worked Sun–Jupiter example with μ = 9.537e-4
  const k = C.lpoints(9.537e-4);
  ok('Koon example: Hill radius 6.825e-2', Math.abs(C.hill(9.537e-4) - 6.825e-2) < 5e-6, C.hill(9.537e-4).toExponential(4));
  ok('Koon example: exact γ1 = 6.668e-2', Math.abs(k.g1 - 6.668e-2) < 5e-6, k.g1.toExponential(4));
  ok('Koon example: third-order series γ1 = 6.666e-2', Math.abs(C.series3(9.537e-4, 1) - 6.666e-2) < 5e-6, C.series3(9.537e-4, 1).toExponential(4));
  ok('Koon example: L1 at x = 0.9324', Math.abs(k.L1 - 0.9324) < 5e-5, k.L1.toFixed(5));
  // --- Koon: ten-digit Sun–Earth L1 values, reproduced with the μ they imply (3.040357143e-6)
  { const MUK = 3.040357143e-6, pk = C.lpoints(MUK), ek = C.collinEig(pk.L1, MUK);
    ok('Koon Sun–Earth L1: γ1 = 1.001090475e-2 to 1e-9', Math.abs(pk.g1/1.001090475e-2 - 1) < 1e-9, pk.g1.toExponential(9));
    ok('Koon Sun–Earth L1: in-plane frequency 2.086453455 to 1e-9', Math.abs(ek.wp - 2.086453455) < 1e-9, ek.wp.toFixed(9));
    ok('Koon Sun–Earth L1: out-of-plane frequency 2.0152105515 to 1e-9', Math.abs(ek.wv - 2.0152105515) < 1e-9, ek.wv.toFixed(10));
    ok('quintic root agrees with it too', Math.abs(C.quintic(MUK, 1)/1.001090475e-2 - 1) < 1e-9); }
  ok('page preset Sun–(Earth+Moon): L1 = 1.4976 million km (Koon 1.497610041e6 km; μ and R differ in the 5th digit)', near(seb.g1*S.seb.R, 1.497610041e6, 3e-5), (seb.g1*S.seb.R).toFixed(0));
  ok('third-order series for L2 (Szebehely/Koon 2.5.3): −0.02 % for Sun–Jupiter, −0.25 % for Earth–Moon', Math.abs((C.series3(S.sj.mu, 2)/sj.g2 - 1)*100 + 0.0195) < 0.002 && Math.abs((C.series3(S.em.mu, 2)/em.g2 - 1)*100 + 0.245) < 0.005, ((C.series3(S.sj.mu, 2)/sj.g2 - 1)*100).toFixed(4) + ' / ' + ((C.series3(S.em.mu, 2)/em.g2 - 1)*100).toFixed(3));
  ok('L3 leading order 1 + 5μ/12 and 1 − 7μ/12 away from Sun–Earth: Sun–Jupiter to 1e-6, Earth–Moon to 2e-5', Math.abs(C.l3lead(S.sj.mu).dB - sj.dB) < 1e-6 && Math.abs(C.l3lead(S.sj.mu).d1 - sj.d1) < 1e-6 && Math.abs(C.l3lead(S.em.mu).dB - em.dB) < 2e-5);

  // --- Sun–Earth (Earth alone): the quoted 1.5 million km, and the L3 values of the 2026-11-14 fix
  ok('Sun–Earth L1 = 1.4916 million km', Math.abs(se.g1*S.se.R/1e6 - 1.4916) < 5e-5, (se.g1*S.se.R).toFixed(0));
  ok('Sun–Earth L2 = 1.5015 million km', Math.abs(se.g2*S.se.R/1e6 - 1.5015) < 5e-5, (se.g2*S.se.R).toFixed(0));
  ok('both round to the published 1.5 million km (NASA, ESA)', Math.round(se.g1*S.se.R/1e5) === 15 && Math.round(se.g2*S.se.R/1e5) === 15);
  ok('Hill value 1.497 million km', Math.abs(C.hill(S.se.mu)*S.se.R/1e6 - 1.497) < 5e-4, (C.hill(S.se.mu)*S.se.R).toFixed(0));
  ok('L3 is 187 km farther from the barycentre than R (exact)', Math.round((se.dB - 1)*S.se.R) === 187, ((se.dB - 1)*S.se.R).toFixed(2));
  ok('L3 is 262 km closer to the Sun than Earth is (exact)', Math.round((1 - se.d1)*S.se.R) === 262, ((1 - se.d1)*S.se.R).toFixed(2));
  ok('the Sun sits 449 km from the barycentre; 187 + 262 = 449', Math.round(S.se.mu*S.se.R) === 449 && Math.abs((se.dB - 1) + (1 - se.d1) - S.se.mu) < 1e-12, (S.se.mu*S.se.R).toFixed(2));
  ok('leading order 5μ/12 and 7μ/12 give the same 187 and 262 km', Math.round(5*S.se.mu/12*S.se.R) === 187 && Math.round(7*S.se.mu/12*S.se.R) === 262);
  ok('adding the Moon moves L1 and L2 outward by about 6,000 km', Math.abs((seb.g1 - se.g1)*S.se.R - 6000) < 300 && Math.abs((seb.g2 - se.g2)*S.se.R - 6000) < 300, ((seb.g1 - se.g1)*S.se.R).toFixed(0) + ' / ' + ((seb.g2 - se.g2)*S.se.R).toFixed(0));
  ok('Earth covers about 85 % of the Sun seen from the exact L2', Math.abs(C.l2Cover() - 0.85) < 0.01, (C.l2Cover()*100).toFixed(1) + ' %');

  // --- errors of the Hill formula quoted in the text
  const err = (p, mu) => [(C.hill(mu)/p.g1 - 1)*100, (C.hill(mu)/p.g2 - 1)*100];
  ok('Sun–Earth: formula 0.3 % off (L1 too far, L2 too near)', Math.abs(err(se, S.se.mu)[0] - 0.33) < 0.03 && Math.abs(err(se, S.se.mu)[1] + 0.33) < 0.03, err(se, S.se.mu).map(x => x.toFixed(2)).join(' / '));
  ok('Sun–Jupiter: about 2 %', Math.abs(err(sj, S.sj.mu)[0] - 2.3) < 0.2 && Math.abs(err(sj, S.sj.mu)[1] + 2.2) < 0.2, err(sj, S.sj.mu).map(x => x.toFixed(2)).join(' / '));
  ok('Earth–Moon: 5–6 %', Math.abs(err(em, S.em.mu)[0] - 5.6) < 0.1 && Math.abs(err(em, S.em.mu)[1] + 5.0) < 0.1, err(em, S.em.mu).map(x => x.toFixed(2)).join(' / '));
  ok('Pluto–Charon: 11 %', Math.round(err(pc, S.pc.mu)[0]) === 11 && Math.round(-err(pc, S.pc.mu)[1]) === 11, err(pc, S.pc.mu).map(x => x.toFixed(2)).join(' / '));
  ok('the formula always puts L1 too far and L2 too near', [1e-7, 1e-4, 0.01, 0.3, 0.5].every(mu => { const p = C.lpoints(mu); return C.hill(mu) > p.g1 && C.hill(mu) < p.g2; }));

  // --- Earth–Moon distances against published round figures
  ok('Earth–Moon L1 58,000 km and L2 64,500 km from the Moon', Math.abs(em.g1*S.em.R - 58000) < 100 && Math.abs(em.g2*S.em.R - 64500) < 100, (em.g1*S.em.R).toFixed(0) + ' / ' + (em.g2*S.em.R).toFixed(0));
  ok('standard dimensionless Earth–Moon roots 0.8369, 1.1557, −1.0051', Math.abs(em.L1 - 0.8369) < 1e-4 && Math.abs(em.L2 - 1.1557) < 1e-4 && Math.abs(em.L3 + 1.0051) < 1e-4, [em.L1, em.L2, em.L3].map(x => x.toFixed(5)).join(' '));
  ok('leading-order distance from the Moon\'s centre, 61,274 km, is the same number as Goddard\'s "about 61,300 km above the lunar surface" for both points [32]', Math.round(C.hill(S.em.mu)*S.em.R) === 61274 && Math.abs(C.hill(S.em.mu)*S.em.R - 61300) < 100, (C.hill(S.em.mu)*S.em.R).toFixed(0));
  ok('as heights the exact points are 56,283 km (L1) and 62,778 km (L2) above the surface (Moon radius 1,737 km): neither is 61,300', Math.abs(em.g1*S.em.R - 1737 - 56283) < 5 && Math.abs(em.g2*S.em.R - 1737 - 62778) < 5, (em.g1*S.em.R - 1737).toFixed(0) + ' / ' + (em.g2*S.em.R - 1737).toFixed(0));
  ok('Queqiao "about 65,000 km from the Moon": exact L2 within 1 %', near(em.g2*S.em.R, 65000, 0.01));
  ok('Moon\'s L2 moves several thousand km between perigee and apogee', em.g2*(C.MOON_APOGEE - C.MOON_PERIGEE) > 3000 && em.g2*(C.MOON_APOGEE - C.MOON_PERIGEE) < 9000, (em.g2*(C.MOON_APOGEE - C.MOON_PERIGEE)).toFixed(0));

  // --- Jacobi constant and the order in which the gates open
  ok('C(L4) = 3 − μ(1 − μ) exactly', [1e-5, 0.01215, 0.3].every(mu => Math.abs(C.jacobi(0.5 - mu, Math.sqrt(3)/2, mu) - (3 - mu*(1 - mu))) < 1e-12));
  ok('C(L1) > C(L2) > C(L3) > C(L4) for μ < 0.5', [1e-6, 1e-3, 0.01215, 0.1, 0.4].every(mu => { const c = C.critC(mu); return c.C1 > c.C2 && c.C2 > c.C3 && c.C3 > c.C4; }));
  ok('equal masses: C(L2) = C(L3)', Math.abs(C.critC(0.5).C2 - C.critC(0.5).C3) < 1e-10);
  const cem = C.critC(S.em.mu);
  ok('Earth–Moon C(L1) = 3.1883, C(L2) = 3.1722', Math.abs(cem.C1 - 3.1883) < 1e-4 && Math.abs(cem.C2 - 3.1722) < 1e-4, cem.C1.toFixed(5) + ' / ' + cem.C2.toFixed(5));
  ok('regimes: closed above C(L1), everything open below C(L4)', C.regime(cem.C1 + 0.01, cem) === 0 && C.regime(cem.C2 + 1e-4, cem) === 1 && C.regime(cem.C3 + 1e-4, cem) === 2 && C.regime(cem.C4 + 1e-4, cem) === 3 && C.regime(cem.C4 - 1e-4, cem) === 4);
  // marching squares: the unit circle traced on a grid has the right length
  { const n = 81, v = new Float64Array(n*n); for(let j = 0; j < n; j++) for(let i = 0; i < n; i++) v[j*n + i] = Math.hypot(-2 + i*0.05, -2 + j*0.05);
    const d = C.contour(v, n, n, 1, i => i, j => j), segs = [...d.matchAll(/M([\d.]+),([\d.]+)L([\d.]+),([\d.]+)/g)], len = segs.reduce((s, m) => s + Math.hypot(m[3] - m[1], m[4] - m[2]), 0)*0.05;
    ok('contour tracer: circumference of the unit circle', Math.abs(len/(2*Math.PI) - 1) < 0.02, len.toFixed(3)); }

  // --- stability of L4/L5
  ok('critical μ = 0.03852 (Koon 0.038521; Sicardy 0.0385208…)', Math.abs(C.MU_CRIT - 0.0385208965) < 1e-9, C.MU_CRIT.toFixed(10));
  ok('critical mass ratio 24.96 (NASA) = (25 + √621)/2', Math.abs((1 - C.MU_CRIT)/C.MU_CRIT - 24.96) < 0.001 && Math.abs((1 - C.MU_CRIT)/C.MU_CRIT - (25 + Math.sqrt(621))/2) < 1e-9, ((1 - C.MU_CRIT)/C.MU_CRIT).toFixed(4));
  ok('27μ(1 − μ) = 1 at the limit', Math.abs(27*C.MU_CRIT*(1 - C.MU_CRIT) - 1) < 1e-12);
  ok('at the limit both frequencies equal 1/√2', Math.abs(C.triEig(C.MU_CRIT - 1e-9).ws - Math.SQRT1_2) < 1e-3 && Math.abs(C.triEig(C.MU_CRIT - 1e-9).wl - Math.SQRT1_2) < 1e-3);
  ok('Sun–Jupiter and Earth–Moon stable, Pluto–Charon unstable', C.triEig(S.sj.mu).stable && C.triEig(S.em.mu).stable && !C.triEig(S.pc.mu).stable);
  const tj = C.triEig(S.sj.mu);
  ok('roots satisfy λ⁴ + λ² + (27/4)μ(1 − μ) = 0', [tj.ws, tj.wl].every(x => Math.abs(x**4 - x*x + 6.75*S.sj.mu*(1 - S.sj.mu)) < 1e-12));
  ok('Jupiter Trojans: long period 147 years (Fleming & Hamilton: ∼150)', Math.round(S.sj.T/tj.wl/365.25) === 147 && near(S.sj.T/tj.wl/365.25, 150, 0.03), (S.sj.T/tj.wl/365.25).toFixed(1));
  ok('short period ≈ Jupiter\'s year (11.86 years)', near(S.sj.T/tj.ws/365.25, 11.862, 0.005), (S.sj.T/tj.ws/365.25).toFixed(3));
  { const p = C.triPath(S.sj.mu, 2*Math.PI*30, 0.02), far = Math.max(...p.map(q => Math.hypot(q[0], q[1])));
    const u = C.triPath(S.pc.mu, 2*Math.PI*7, 0.02), farU = Math.max(...u.map(q => Math.hypot(q[0], q[1])));
    ok('linearised path stays bounded for Sun–Jupiter (30 revolutions) and grows for Pluto–Charon', far < 60 && farU > 300, far.toFixed(1) + ' / ' + farU.toFixed(0)); }
  { // integrator against the analytic growth rate above the limit, measured after the initial transient
    const te = C.triEig(S.pc.mu), per = 2*Math.PI/te.w, a = C.triPath(S.pc.mu, 4*per, 0.005, true), b = C.triPath(S.pc.mu, 5*per, 0.005, true);   // uncapped, well after the decaying mode has died
    const ra = Math.hypot(...a[a.length - 1]), rb = Math.hypot(...b[b.length - 1]);
    ok('RK4 growth over one oscillation matches e^(growth·period) to 1 %', near(Math.log(rb/ra), te.growth*per, 0.01), Math.log(rb/ra).toFixed(4) + ' vs ' + (te.growth*per).toFixed(4)); }
  { // A-S2: a stable path is never cut short, even where it wanders far (Sun–Earth, 40 revolutions)
    const p40 = C.triPath(S.se.mu, 40*2*Math.PI, 0.02);
    ok('stable Sun–Earth path is drawn in full (40 revolutions, not truncated at 22.6)', p40.length === Math.round(40*2*Math.PI/0.02) + 1, ((p40.length - 1)*0.02/(2*Math.PI)).toFixed(1) + ' rev'); }


  // --- collinear points: time scales against published values
  const e1 = C.collinEig(se.L1, S.se.mu), e2 = C.collinEig(se.L2, S.se.mu);
  const t1 = C.efoldDays(e1.lam, S.se.T), t2 = C.efoldDays(e2.lam, S.se.T);
  ok('Sun–Earth L1/L2 e-folding time ≈ 23 days (NASA)', Math.abs(t1 - 23) < 0.5 && Math.abs(t2 - 23) < 0.5, t1.toFixed(2) + ' / ' + t2.toFixed(2));
  ok('doubling time ≈ 16 days (Roberts 2011)', Math.abs(t1*Math.LN2 - 16) < 0.5, (t1*Math.LN2).toFixed(2));
  ok('L1 periods 175 and 181 days; SOHO\'s halo ≈ 178 d, Aditya-L1 177.86 d lie between', Math.round(C.periodDays(e1.wp, S.se.T)) === 175 && Math.round(C.periodDays(e1.wv, S.se.T)) === 181 && 177.86 > C.periodDays(e1.wp, S.se.T) && 178 < C.periodDays(e1.wv, S.se.T), C.periodDays(e1.wp, S.se.T).toFixed(1) + ' / ' + C.periodDays(e1.wv, S.se.T).toFixed(1));
  ok('L2 periods ≈ 180 days ("6-month" orbits of WMAP, Gaia, Chang\'e 2)', near(C.periodDays(e2.wp, S.se.T), 180, 0.03) && near(C.periodDays(e2.wv, S.se.T), 180, 0.03), C.periodDays(e2.wp, S.se.T).toFixed(1) + ' / ' + C.periodDays(e2.wv, S.se.T).toFixed(1));
  ok('characteristic roots satisfy λ⁴ + (2 − c)λ² + (1 + 2c)(1 − c) = 0', Math.abs(e1.lam**4 + (2 - e1.c)*e1.lam**2 + (1 + 2*e1.c)*(1 - e1.c)) < 1e-9 && Math.abs(e1.wp**4 - (2 - e1.c)*e1.wp**2 + (1 + 2*e1.c)*(1 - e1.c)) < 1e-9);
  { const l3 = C.collinEig(se.L3, S.se.mu), yrs = C.efoldDays(l3.lam, S.se.T)/365.25;
    ok('Sun–Earth L3: λ = √(21μ/8) to 1e-4, e-folding 56.7 years', near(l3.lam, Math.sqrt(21*S.se.mu/8), 1e-4) && Math.abs(yrs - 56.7) < 0.1, l3.lam.toExponential(4) + ', ' + yrs.toFixed(1) + ' yr');
    ok('the often-quoted ~150 years corresponds to √(3μ/8), not to these equations', Math.abs(S.se.T/(2*Math.PI*Math.sqrt(3*S.se.mu/8))/365.25 - 150) < 1 && yrs < 60, (S.se.T/(2*Math.PI*Math.sqrt(3*S.se.mu/8))/365.25).toFixed(1) + ' yr'); }
  ok('c > 1 at all three collinear points (saddles)', [se, em, pc].every((p, i) => { const mu = [S.se.mu, S.em.mu, S.pc.mu][i]; return C.collinEig(p.L1, mu).c > 1 && C.collinEig(p.L2, mu).c > 1 && C.collinEig(p.L3, mu).c > 1; }));
  const m1 = C.efoldDays(C.collinEig(em.L1, S.em.mu).lam, S.em.T), m2 = C.efoldDays(C.collinEig(em.L2, S.em.mu).lam, S.em.T);
  ok('Moon L1/L2 e-folding 1.5 and 2.0 days', Math.abs(m1 - 1.48) < 0.02 && Math.abs(m2 - 2.01) < 0.02, m1.toFixed(2) + ' / ' + m2.toFixed(2));
  ok('Chang\'e 5-T1 Lissajous "period of 14 days" (Siddiqi): model in-plane 14.7 d', near(C.periodDays(C.collinEig(em.L2, S.em.mu).wp, S.em.T), 14, 0.06), C.periodDays(C.collinEig(em.L2, S.em.mu).wp, S.em.T).toFixed(2));
  ok('the Moon system runs 13 times faster than Sun–Earth', Math.round(S.se.T/S.em.T) === 13, (S.se.T/S.em.T).toFixed(2));
  ok('9:2 NRHO: 2 synodic months / 9 = 6.56 days (Davis et al.: mean 6.56)', Math.abs(2*C.SYNODIC_MONTH/9 - 6.56) < 0.005, (2*C.SYNODIC_MONTH/9).toFixed(3));
  ok('skTau picks the right point', Math.abs(C.skTau('p1l2') - m2) < 1e-9 && Math.abs(C.skTau('p2l1') - m1) < 1e-9 && C.skTau('nrho') === null);

  // --- station-keeping data and the rocket equation
  ok('rocket equation: small Δv limit m·Δv/(g₀·Isp)', near(C.propellant(1000, 1, 220), 1000/(C.G0*220), 1e-3), C.propellant(1000, 1, 220).toFixed(4) + ' kg');
  ok('rocket equation: Δv = g₀·Isp·ln 2 burns half the mass', Math.abs(C.propellant(1000, C.G0*300*Math.LN2, 300) - 500) < 1e-9);
  ok('ARTEMIS-size probe (126 kg, Siddiqi) at 7.39 m/s per year uses under half a kilogram', C.propellant(126, 7.39, 220) < 0.5, C.propellant(126, 7.39, 220).toFixed(3) + ' kg');

  // --- dates and counts, read from what the page renders (register rows and chapter text), not from side tables
  const d = w.document, q = id => d.getElementById(id);
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  const MON = {Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12};
  const date = t => { const m = /(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})/.exec(t); return m ? [+m[3], MON[m[2]], +m[1]] : null; };
  const row = name => C.MISSIONS.find(m => m[1] === name), span = name => C.daysBetween(date(row(name)[5]), date(row(name)[6]));
  ok('register: Webb 30 days from launch to L2 insertion', span('James Webb Space Telescope') === 30, span('James Webb Space Telescope'));
  ok('register: ISEE-3 100 days from launch to halo insertion', span('ISEE-3') === 100, span('ISEE-3'));
  ok('register: Aditya-L1 126 days; IMAP 108 days; WMAP 93 days', span('Aditya-L1') === 126 && span('IMAP') === 108 && span('WMAP') === 93);
  ok('register: Spektr-RG reached L2 100 days after launch (MPE: "100 days after launch")', span('Spektr-RG') === 100, span('Spektr-RG'));
  ok('register: Queqiao launch given in UT (20 May 2018), 25 days before halo insertion', row('Queqiao')[5] === '20 May 2018' && span('Queqiao') === 25);
  ok('register: Roman\'s 100 days after launch falls on 8 Dec 2026 ("about early December")', C.daysBetween([2026, 8, 30], [2026, 12, 8]) === 100 && /early Dec 2026/.test(row('Roman')[6]) && date(row('Roman')[5]).join('-') === '2026-8-30');
  ok('register: Genesis recorded as a crash landing, LISA Pathfinder with its 2017 end, Euclid present', /crash-landed/.test(row('Genesis')[8]) && /18 Jul 2017/.test(row('LISA Pathfinder')[8]) && !!row('Euclid'));
  ok('register and timeline say "first to orbit", never "first at"', !C.MISSIONS.some(m => /first (spacecraft )?at /.test(m[6])) && !C.TIMELINE.some(t => /first spacecraft (at|there)/.test(t[1])));
  const ch6 = q('ch6').textContent, num = n => n.toLocaleString('en-US');
  ok('chapter 6 text carries the MPC counts: 9,823 + 5,942 = 15,765; 18 Mars; 35 Neptune', ch6.includes(num(C.MPC.jupiter[0])) && ch6.includes(num(C.MPC.jupiter[1])) && ch6.includes(num(C.MPC.jupiter[0] + C.MPC.jupiter[1])) && ch6.includes((C.MPC.mars[0] + C.MPC.mars[1]) + ' Trojans of Mars') && ch6.includes((C.MPC.neptune[0] + C.MPC.neptune[1]) + ' of Neptune'));
  ok('chapter 6 text: 1906 − 1772 = the "134 years" of the quote; long period 147 years as computed', ch6.includes(String(1906 - 1772) + ' years') && ch6.includes(Math.round(S.sj.T/C.triEig(S.sj.mu).wl/365.25) + ' years'));
  const ch5 = q('ch5').textContent, ch3 = q('ch3').textContent;
  ok('chapter 5 text: "175 and 181 days" and "about 85 %" match the model', ch5.includes(Math.round(C.periodDays(e1.wp, S.se.T)) + ' and ' + Math.round(C.periodDays(e1.wv, S.se.T)) + ' days') && ch5.includes(Math.round(C.l2Cover()*100) + '\u00a0%'));
  ok('chapter 3 text: 1.4916 and 1.5015 million km, 187 / 262 / 449 km, "57 years" for L3', ['1.4916 million km', '1.5015 million km', '187 km', '262 km', '449 km', Math.round(C.efoldDays(C.collinEig(se.L3, S.se.mu).lam, S.se.T)/365.25) + ' years'].every(t => ch3.replace(/\u00a0/g, ' ').includes(t)));
  ok('mission register: 24 rows, every reference number exists', C.MISSIONS.length === 24 && C.MISSIONS.every(m => m.length === 11 && String(m[10]).split(', ').every(n => +n >= 1 && +n <= C.REFERENCES.length)));
  ok('at least 18 references, every one with URL and both notes', C.REFERENCES.length >= 18 && C.REFERENCES.every(r => /^https:\/\//.test(r.url) && r.note.en && r.note.ru), C.REFERENCES.length);

  // --- the rendered page
  d.querySelector('#sPre .btn[data-k="se"]').click(); d.querySelector('#mPick .btn[data-f="all"]').click();
  ok('solver table shows the Sun–Earth values for the Sun–Earth preset', /1\.4916 million km/.test(q('sTable').textContent) && /1\.5015 million km/.test(q('sTable').textContent));
  ok('all five figures are drawn', ['pSvg', 'sSvg', 'tSvg', 'kSvg'].every(id => q(id).childNodes.length > 10) && q('mTable').querySelectorAll('tbody tr').length === 24);
  ok('timeline and reference list rendered', d.querySelectorAll('#timeline .tl').length === C.TIMELINE.length && d.querySelectorAll('#refList .ref-item').length === C.REFERENCES.length);
  // --- A-M1: the growth readout never leaves the linear model's range
  { let worstV = 0, bad = '', overSeen = false;
    const kD = q('kD'), fire = () => kD.dispatchEvent(new w.Event('input'));
    for(const k of ['ace', 'p2l1', 'p1l1', 'p1l2', 'nrho']){
      d.querySelector('#kPre .btn[data-k="' + k + '"]').click();
      for(let days = 0; days <= 120; days += 3){
        kD.value = days; fire();
        const txt = q('kStatus').textContent + ' ' + q('kReadout').textContent;
        if(/km\/s/.test(txt) || /10⁰/.test(txt) || /× 10[⁷⁸⁹]|× 10[¹²³][⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(txt)) bad = k + '@' + days;
        const m = /has become ([\d.,]+) (mm\/s|m\/s)/.exec(txt); if(m) worstV = Math.max(worstV, parseFloat(m[1].replace(/,/g, ''))*(m[2] === 'm/s' ? 1 : 0.001));
        if(/no longer applies/.test(txt)) overSeen = true;
      }
    }
    kD.value = 21; fire(); d.querySelector('#kPre .btn[data-k="ace"]').click();
    ok('instrument 4 prints no km/s, no "× 10⁰" and no factor above 10⁶ at any case and any day 0–120', bad === '', bad || 'clean');
    ok('largest velocity it prints is below 1 km/s; past the ceiling it says the linear model no longer applies', worstV <= 1000 && overSeen, worstV.toFixed(0) + ' m/s');
    ok('growth(): e^(t/τ) below the ceiling, null above', Math.abs(C.growth(23, 23) - Math.E) < 1e-12 && C.growth(21, 1.483) === null && C.growth(20, 1.483) !== null && C.GROWTH_CEIL === 1e6); }
  // --- A-S1: μ never exceeds 0.5; equal masses open L2 and L3 together
  { const pMu = q('pMu'); pMu.value = pMu.max; pMu.dispatchEvent(new w.Event('input'));
    ok('map slider at its maximum gives μ = 0.5 exactly (mass ratio 1.00 : 1)', /1\.00 : 1/.test(q('pReadout').textContent));
    d.querySelector('#pPre .btn[data-k="eq"]').click(); d.querySelector('#pGate .btn[data-g="2"]').click();
    ok('equal masses: the status says L2 and L3 open together', /open together/.test(q('pStatus').textContent));
    d.querySelector('#pPre .btn[data-k="em"]').click(); d.querySelector('#pGate .btn[data-g="2"]').click();
    ok('Earth–Moon: OPEN L2 opens L1 and L2 only', /L1, L2$/.test(q('pReadout').textContent.trim()) || /GATES OPENL1, L2$/.test(q('pReadout').textContent)); }
  // --- drawn map against regime(): at C(L1) + 0.01 the necks are closed on the grid as well
  { const mu = S.em.mu, c = C.critC(mu), closedAt = (x, Cv) => C.jacobi(x, 0, mu) < Cv;
    ok('wall present at L1 just above C(L1), absent just below', closedAt(c.p.L1, c.C1 + 1e-6) && !closedAt(c.p.L1, c.C1 - 1e-6) && closedAt(c.p.L2, c.C2 + 1e-6) && !closedAt(c.p.L2, c.C2 - 1e-6)); }
  // --- access: scrollable tables are focusable regions with names in both languages
  ok('both scrollable tables are focusable named regions with captions', [...d.querySelectorAll('.table-scroll')].length === 2 && [...d.querySelectorAll('.table-scroll')].every(t => t.getAttribute('tabindex') === '0' && t.getAttribute('role') === 'region' && t.getAttribute('data-aria-ru') && t.querySelector('caption')));
  console.log(out.join('\n'));
};
