module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (x, pub, tol) => Math.abs(x - pub) <= tol, rel = (x, pub, f) => Math.abs(x/pub - 1) <= f;
  const B = C.B, E = B.earth, M = B.moon, S = C.GM_SUN, FT = 0.3048e-3, NMI = 1.852, MI = 1.609344, d2r = Math.PI/180;
  const r0 = E.R + 200;

  /* ---- Chapter 1: thrust, mass flow, specific impulse (published: HAER TX-116 [28], L3Harris [13]) ---- */
  const veRS = 470000*C.LBF/(1035*0.45359237)/1000;                       // km/s, from published thrust and flow at 100 %
  ok('RS-25: thrust ÷ flow = 4.45 km/s; within 1 % of the published 452.3 s', near(veRS, 4.45, 0.01) && rel(veRS, C.vex(452.3), 0.01), veRS.toFixed(3) + ' vs ' + C.vex(452.3).toFixed(3));
  ok('1,035 lb/s = 469 kg/s; 470,000 lbf = 2,091 kN', near(1035*0.45359237, 469, 0.5) && near(470000*C.LBF/1000, 2091, 0.5));
  ok('452.3 s ↔ 4.44 km/s; kerosene 303 s ↔ 2.97 km/s', near(C.vex(452.3), 4.44, 0.005) && near(C.vex(303), 2.97, 0.005));

  /* ---- Chapter 2: rocket equation and staging ---- */
  ok('mass ratio for 9.3 km/s: 8.1 at 452.3 s, 22.9 at 303 s (text)', near(C.massRatio(9.3, 452.3), 8.1, 0.05) && near(C.massRatio(9.3, 303), 22.9, 0.05), C.massRatio(9.3, 452.3).toFixed(2) + ' / ' + C.massRatio(9.3, 303).toFixed(2));
  ok('Saturn V ascent budget 7,798 + 1,534 + 40 + 243 − 348 = 9,267 m/s (Humble et al.) → the 9.3 km/s used', 7798 + 1534 + 40 + 243 - 348 === 9267 && near(C.ASCENT, 9.267, 0.05));
  // Dawn: 416 kg of xenon from 1,217.7 kg gave "almost 11.5 km/s" (Rayman & Garner 2018). Ideal at NSTAR's 3,100 s must be ABOVE that, and the implied mean Isp below 3,100 s
  const dawnIdeal = C.dvRocket(3100, 1217.7, 1217.7 - 416), dawnIsp = 11.5/Math.log(1217.7/(1217.7 - 416))*1000/C.G0;
  ok('Dawn: ideal Δv at 3,100 s exceeds the flown 11.5 km/s by under 12 %', dawnIdeal > 11.5 && dawnIdeal < 11.5*1.12, dawnIdeal.toFixed(2));
  ok('Dawn: implied mean Isp ≈ 2,800 s, between NSTAR\'s throttled range and its 3,100 s maximum', near(dawnIsp, 2800, 15) && dawnIsp < 3100, dawnIsp.toFixed(0));
  ok('Dawn mean exhaust velocity 27.5 km/s (text)', near(dawnIsp*C.G0/1000, 27.5, 0.05));
  // optimiser: identical stages → equal split; never beaten by any other split (brute force); unequal Isp → more Δv to the faster stage
  const s2 = C.stageOpt(9.3, [303, 303], [0.08, 0.08]);
  ok('identical stages get equal Δv', Math.abs(s2.stages[0].dv - s2.stages[1].dv) < 1e-6 && near(s2.stages[0].dv + s2.stages[1].dv, 9.3, 1e-6));
  let beaten = false;
  for(const [is, ep, dv] of [[[303, 303], [0.08, 0.08], 9.3], [[303, 421], [0.08, 0.08], 9.3], [[265, 452], [0.05, 0.12], 11], [[303, 421, 421], [0.06, 0.1, 0.1], 12.5]]){
    const best = C.stageOpt(dv, is, ep).payload, n = is.length;
    for(let i = 0; i <= 200; i++) for(let j = 0; j <= (n === 3 ? 200 : 0); j++){
      const a = dv*i/200, b = n === 3 ? dv*j/200 : dv - a; if(n === 3 && a + b > dv) continue;
      const p = C.stagePayload(n === 3 ? [a, b, dv - a - b] : [a, b], is, ep);
      if(p > best*(1 + 1e-9)) beaten = true;
    }
  }
  ok('no other split of the Δv carries more payload than the optimiser\'s (brute force, 4 rockets)', !beaten);
  const sm = C.stageOpt(9.3, [303, 421], [0.08, 0.08]);
  ok('kerosene + hydrogen: the hydrogen stage is given more Δv; payload 4.7 %', sm.stages[1].dv > sm.stages[0].dv && near(sm.payload, 0.0467, 0.0005), sm.stages.map(s => s.dv.toFixed(2)).join(' + ') + ', ' + (sm.payload*100).toFixed(2) + ' %');
  ok('optimiser payload equals the direct product for its own split', rel(C.stagePayload(sm.stages.map(s => s.dv), [303, 421], [0.08, 0.08]), sm.payload, 1e-9));
  ok('mass bookkeeping: propellant + empty stages + payload = lift-off mass', Math.abs(sm.stages.reduce((t, s) => t + s.prop + s.dry, 0) + sm.payload - 1) < 1e-12);
  const one = C.stageOpt(9.3, [303], [0.08]);
  ok('one kerosene stage with ε = 8 % cannot reach 9.3 km/s (limit 7.50)', !one.ok && near(one.limit, 7.50, 0.01), one.limit.toFixed(3));
  ok('single-stage limit = v_e ln(1/ε)', rel(one.limit, C.vex(303)*Math.log(1/0.08), 1e-12));
  const pN = n => C.stageOpt(9.3, Array(n).fill(303), Array(n).fill(0.08)).payload;
  ok('more stages always help, with shrinking returns, toward the infinite-stage limit', pN(2) < pN(3) && pN(3) < pN(4) && pN(3) - pN(2) > pN(4) - pN(3) && pN(4) < C.infStages(9.3, 303, 0.08), [2, 3, 4].map(n => (pN(n)*100).toFixed(2)).join(' < ') + ' < ' + (C.infStages(9.3, 303, 0.08)*100).toFixed(2));
  ok('40 identical stages come within 2 % of the infinite-stage formula', rel(pN(40), C.infStages(9.3, 303, 0.08), 0.02), (pN(40)*100).toFixed(3));
  ok('unreachable Δv is refused, not extrapolated', C.stageOpt(30, [303, 303], [0.08, 0.08]).ok === false && C.stageOpt(30, [303, 303], [0.08, 0.08]).payload === 0);

  /* ---- Chapter 3: orbits ---- */
  const v400 = C.vCirc(E.mu, E.R + 400), T400 = C.period(E.mu, E.R + 400);
  ok('400 km: 7.67 km/s, 92.6 min', near(v400, 7.67, 0.005) && near(T400/60, 92.6, 0.05), v400.toFixed(3) + ', ' + (T400/60).toFixed(2));
  ok('NASA\'s ISS round figures (5 miles/s, 90 min, 16 orbits/day) agree within 6 %', rel(v400/MI, 5, 0.06) && rel(T400/60, 90, 0.06) && rel(86400/T400, 16, 0.06), (v400/MI).toFixed(2) + ' mi/s, ' + (86400/T400).toFixed(2) + ' orbits/day');
  ok('escape = √2 × circular', rel(C.vEsc(E.mu, 7000)/C.vCirc(E.mu, 7000), Math.SQRT2, 1e-12));
  ok('surface escape speed of Earth 11.186 km/s (NSSDCA)', near(C.vEsc(E.mu, E.R), 11.186, 0.01), C.vEsc(E.mu, E.R).toFixed(3));
  ok('first / second cosmic velocity 7.910 / 11.186 km/s (BSE)', near(C.vCirc(E.mu, E.R), 7.910, 0.01) && near(C.vEsc(E.mu, E.R), 11.186, 0.01), C.vCirc(E.mu, E.R).toFixed(3));
  ok('third cosmic velocity 16.67 km/s (BSE)', near(C.thirdCosmic(), 16.67, 0.03), C.thirdCosmic().toFixed(3));
  const pubEsc = {mercury:4.3, venus:10.4, moon:2.38, mars:5.0, jupiter:59.5};
  for(const k in pubEsc) ok('escape speed of ' + k + ' = ' + pubEsc[k] + ' km/s (NSSDCA)', near(C.vEsc(B[k].mu, B[k].R), pubEsc[k], 0.06), C.vEsc(B[k].mu, B[k].R).toFixed(3));
  ok('escape speed at the Sun\'s surface 617.6 km/s (NSSDCA)', near(C.vEsc(S, C.R_SUN), 617.6, 0.3), C.vEsc(S, C.R_SUN).toFixed(1));
  const pubV = {venus:35.0, earth:29.78, mars:24.1, jupiter:13.1};
  for(const k in pubV) ok('orbital speed of ' + k + ' = ' + pubV[k] + ' km/s (NSSDCA)', near(C.vCirc(S, B[k].a), pubV[k], 0.06), C.vCirc(S, B[k].a).toFixed(2));
  ok('Earth\'s year from Kepler\'s third law = 365.256 days (NSSDCA)', near(C.period(S, E.a)/86400, 365.256, 0.15), (C.period(S, E.a)/86400).toFixed(3));
  const rG = C.rForPeriod(E.mu, C.T_SIDEREAL);
  ok('period 23.9345 h → 35,786 km altitude (ESA), 42,164 km radius (NASA EO)', near(rG - E.R, 35786, 3) && near(rG, 42164, 3), (rG - E.R).toFixed(1));
  ok('23 h 56 min 4 s (ESA) = 23.9345 h (NSSDCA)', near(23 + 56/60 + 4/3600, C.T_SIDEREAL/3600, 0.0001));
  ok('Moon: circular speed at 384,400 km 1.018 vs published mean 1.022 km/s', near(C.vCirc(E.mu, M.a), 1.022, 0.006), C.vCirc(E.mu, M.a).toFixed(4));
  ok('Moon: period with both masses 27.28 d vs published 27.3217 d', near(C.period(E.mu + M.mu, M.a)/86400, 27.3217, 0.06), (C.period(E.mu + M.mu, M.a)/86400).toFixed(3));
  const mol = C.orbit(E.mu, E.R + 500, E.R + 40000);
  ok('Molniya 500 × 40,000 km → 12-hour period (Gunter)', near(mol.T/3600, 12, 0.05), (mol.T/3600).toFixed(3));
  ok('ellipse: angular momentum the same at both ends (r_p v_p = r_a v_a)', rel((E.R + 500)*mol.vp, (E.R + 40000)*mol.va, 1e-12));
  ok('ellipse: energy from vis-viva = −GM/2a at both ends', rel(mol.vp**2/2 - E.mu/(E.R + 500), -E.mu/(2*mol.a), 1e-12) && rel(mol.va**2/2 - E.mu/(E.R + 40000), -E.mu/(2*mol.a), 1e-12));
  // Apollo 11 TLI cutoff: 35,545.6 ft/s at 180.581 n mi (Orloff)
  const rT = E.R + 180.581*NMI, vT = 35545.6*FT;
  ok('Apollo 11 TLI: 10.83 km/s = 99.4 % of local escape speed, so still bound', near(vT, 10.83, 0.005) && near(vT/C.vEsc(E.mu, rT), 0.994, 0.0005) && vT < C.vEsc(E.mu, rT), vT.toFixed(3) + ' / ' + C.vEsc(E.mu, rT).toFixed(3));
  ok('Apollo 11 TLI: its ellipse would top out beyond the Moon\'s distance', 2/(2/rT - vT*vT/E.mu) - rT > M.a, (2/(2/rT - vT*vT/E.mu) - rT).toFixed(0) + ' km');
  // Parker: 3.8 million miles above the surface, about 430,000 mph (NASA)
  const rP = C.R_SUN + 3.8e6*MI, vP = 430000*MI/3600;
  ok('Parker: 6.8 million km from the centre; 192 km/s between circular (140) and escape (197)', near(rP/1e6, 6.8, 0.05) && near(vP, 192, 0.5) && near(C.vCirc(S, rP), 140, 0.5) && near(C.vEsc(S, rP), 197, 0.5) && vP > C.vCirc(S, rP) && vP < C.vEsc(S, rP), vP.toFixed(1));

  /* ---- Chapter 4: transfers ---- */
  const hG = C.hohmann(E.mu, r0, E.R + C.GEO_ALT, 0);
  ok('200 km → GEO: 2.45 + 1.48 = 3.93 km/s, 5.26 h', near(hG.dv1, 2.45, 0.005) && near(hG.dv2, 1.48, 0.005) && near(hG.total, 3.93, 0.005) && near(hG.tof/3600, 5.26, 0.005), hG.dv1.toFixed(3) + ' + ' + hG.dv2.toFixed(3) + ', ' + (hG.tof/3600).toFixed(3) + ' h');
  ok('GEO speed 3.07 km/s', near(hG.c2, 3.07, 0.005), hG.c2.toFixed(4));
  ok('transfer time = half the period of the transfer ellipse', rel(hG.tof, C.period(E.mu, hG.a)/2, 1e-12));
  ok('Hohmann is reversible: GEO → 200 km costs the same', rel(C.hohmann(E.mu, E.R + C.GEO_ALT, r0, 0).total, hG.total, 1e-12));
  const h28 = C.hohmann(E.mu, r0, E.R + C.GEO_ALT, 28.5*d2r);
  ok('28.5° turn: 3.83 km/s alone at 200 km, 1.51 alone at GEO, +0.36 when combined', near(C.planeChange(hG.c1, 28.5*d2r), 3.83, 0.005) && near(C.planeChange(hG.c2, 28.5*d2r), 1.51, 0.005) && near(h28.dv2 - hG.dv2, 0.36, 0.005), (h28.dv2 - hG.dv2).toFixed(3));
  ok('combined burn is cheaper than circularising and turning separately, dearer than no turn', h28.dv2 < hG.dv2 + C.planeChange(hG.c2, 28.5*d2r) && h28.dv2 > hG.dv2);
  ok('180° "plane change" = reversing the orbit = 2v', rel(C.planeChange(7, Math.PI), 14, 1e-12));
  const hm = C.helio(B.mars.a), hn = C.hohmann(S, E.a, B.neptune.a, 0), hj = C.helio(B.jupiter.a);
  ok('Earth → Mars: 2.95 and 2.65 km/s, 259 days (2.9452: the text prints 2.95)', near(hm.vinfE, 2.95, 0.005) && near(hm.vinfT, 2.65, 0.005) && near(hm.tof/86400, 259, 0.5), hm.vinfE.toFixed(3) + ', ' + hm.vinfT.toFixed(3) + ', ' + (hm.tof/86400).toFixed(1));
  ok('Earth → Neptune 30.8 years (NASA: 30 years direct)', near(hn.tof/(365.25*86400), 30.8, 0.05) && rel(hn.tof/(365.25*86400), 30, 0.03), (hn.tof/(365.25*86400)).toFixed(2));
  ok('Earth → Jupiter needs 8.79 km/s beyond Earth\'s speed (same as the SLINGSHOT guide)', near(hj.vinfE, 8.79, 0.01), hj.vinfE.toFixed(3));
  ok('bi-elliptic thresholds: 11.94 (bi-parabolic = Hohmann) and 15.58 (Hohmann cost peaks) — Vallado', near(C.biThreshold(), 11.94, 0.005) && near(C.hohmannPeak(), 15.58, 0.005), C.biThreshold().toFixed(3) + ', ' + C.hohmannPeak().toFixed(3));
  ok('ratio 11: every bi-elliptic route tried is dearer than Hohmann; ratio 13: a far one is cheaper; ratio 16: even a near one is', [20, 100, 1e4].every(k => C.biElliptic(1, 1, 11, 11*k) > C.hohmann(1, 1, 11, 0).total) && C.biElliptic(1, 1, 13, 13*1e4) < C.hohmann(1, 1, 13, 0).total && C.biElliptic(1, 1, 13, 13*1.5) > C.hohmann(1, 1, 13, 0).total && C.biElliptic(1, 1, 16, 16*1.05) < C.hohmann(1, 1, 16, 0).total);
  ok('bi-elliptic with the far point at the target reduces to Hohmann', rel(C.biElliptic(E.mu, r0, 42164, 42164), C.hohmann(E.mu, r0, 42164, 0).total, 1e-12));

  /* ---- Chapter 5: Oberth ---- */
  const dep = C.depart(E.mu, r0, hm.vinfE), escDv = C.vEsc(E.mu, r0) - C.vCirc(E.mu, r0);
  ok('Mars departure from 200 km: one burn 3.61 km/s vs 3.22 + 2.95 = 6.17; saving 2.56', near(dep, 3.61, 0.005) && near(escDv, 3.22, 0.005) && near(escDv + hm.vinfE, 6.17, 0.005) && near(escDv + hm.vinfE - dep, 2.56, 0.005), dep.toFixed(3));
  ok('200 km circular speed 7.78 km/s', near(C.vCirc(E.mu, r0), 7.78, 0.005));
  const ob = C.oberth(E.mu, r0, 0, 0.39);
  ok('preset: 0.39 km/s at 200 km on a parabolic pass → 2.96 km/s far away', near(ob.vinfOut, 2.96, 0.005), ob.vinfOut.toFixed(3));
  ok('Oberth closed form for a parabolic pass: v∞′ = √(Δv² + 2 v_esc Δv)', rel(ob.vinfOut, Math.sqrt(0.39**2 + 2*C.vEsc(E.mu, r0)*0.39), 1e-12));
  ok('energy bookkeeping: v∞′²/2 − v∞²/2 = v_pΔv + Δv²/2', (() => { const o = C.oberth(B.jupiter.mu, 2*B.jupiter.R, 6, 1.3); return rel(o.vinfOut**2/2 - 18, o.dE, 1e-10); })());
  ok('far from the body the gain vanishes; deeper is always better', C.oberth(E.mu, 1e12, 3, 1).gain < 1e-6 && C.oberth(E.mu, r0, 3, 1).gain > C.oberth(E.mu, 4*r0, 3, 1).gain && C.oberth(E.mu, 4*r0, 3, 1).gain > 0);
  ok('oberth() and depart() agree: leaving a circular orbit is the same formula', rel(Math.sqrt((C.vCirc(E.mu, r0) + dep)**2 - 2*E.mu/r0), hm.vinfE, 1e-10));

  /* ---- Chapter 6: Δv map (every row) ---- */
  const map = C.dvMap(), row = id => map.find(r => r.id === id), TXT = {gto:2.45, geo:3.93, geo28:4.29, esc:3.22, tli:3.13, llo:3.95, lsurf:5.68, venus:3.50, venuslo:6.82, mars:3.61, marslo:5.70, mercury:5.55, mercurylo:13.13, jupiter:6.31, solesc:8.75};
  ok('map has 15 rows, each the sum of its legs', map.length === 15 && map.every(r => Math.abs(r.legs.reduce((t, l) => t + l[2], 0) - r.total) < 1e-12 && r.legs.every(l => l[2] > 0)));
  // independent recomputation of every row from vis-viva alone (not through hohmann()/depart()/capture())
  const vv = (mu, r, a) => Math.sqrt(mu*(2/r - 1/a)), vc0 = Math.sqrt(E.mu/r0), hyp = (mu, r, vi) => Math.sqrt(vi*vi + 2*mu/r) - Math.sqrt(mu/r);
  const rg = E.R + 35786, ag = (r0 + rg)/2, vE = Math.sqrt(S/E.a);
  const pl = k => { const a = (E.a + B[k].a)/2; return [Math.abs(vv(S, E.a, a) - vE), Math.abs(Math.sqrt(S/B[k].a) - vv(S, B[k].a, a))]; };
  const am = (r0 + M.a)/2, vim = Math.sqrt(E.mu/M.a) - vv(E.mu, M.a, am), rl = M.R + 100, ad = (rl + M.R)/2;
  const IND = {
    gto: vv(E.mu, r0, ag) - vc0,
    geo: vv(E.mu, r0, ag) - vc0 + Math.sqrt(E.mu/rg) - vv(E.mu, rg, ag),
    geo28: vv(E.mu, r0, ag) - vc0 + Math.hypot(Math.sqrt(E.mu/rg) - vv(E.mu, rg, ag)*Math.cos(28.5*d2r), vv(E.mu, rg, ag)*Math.sin(28.5*d2r)),
    esc: (Math.SQRT2 - 1)*vc0,
    tli: vv(E.mu, r0, am) - vc0,
    llo: vv(E.mu, r0, am) - vc0 + hyp(M.mu, rl, vim),
    lsurf: vv(E.mu, r0, am) - vc0 + hyp(M.mu, rl, vim) + (Math.sqrt(M.mu/rl) - vv(M.mu, rl, ad)) + vv(M.mu, M.R, ad),
    solesc: hyp(E.mu, r0, (Math.SQRT2 - 1)*vE)
  };
  for(const k of ['venus', 'mars', 'mercury', 'jupiter']){ const q = pl(k); IND[k] = hyp(E.mu, r0, q[0]); if(k !== 'jupiter') IND[k + 'lo'] = IND[k] + hyp(B[k].mu, B[k].R + 300, q[1]); }
  for(const id in TXT) ok('map row ' + id + ' = ' + TXT[id].toFixed(2) + ' km/s, and matches an independent recomputation', row(id) && near(row(id).total, TXT[id], 0.006) && Math.abs(row(id).total - IND[id]) < 1e-9, row(id) ? row(id).total.toFixed(3) : 'missing');
  ok('lunar surface (5.68) dearer than Mars entry (3.61); Mercury orbit (13.13) dearer than solar escape (8.75)', row('lsurf').total > row('mars').total && row('mercurylo').total > row('solesc').total);
  ok('solar escape from the ground equals the third cosmic velocity (16.65 here, 16.67 published)', near(Math.sqrt(((Math.SQRT2 - 1)*vE)**2 + 2*E.mu/E.R), 16.67, 0.03));
  // Apollo 11 at the Moon (Orloff): arrival 8,250.0 ft/s at 86.7 n mi; LOI-1 2,917.5 ft/s into 169.7 × 60.0 n mi; LOI-2 158.8 ft/s; ascent 6,070.1 ft/s into 48.0 × 9.4 n mi
  const rA = M.R + 86.7*NMI, vinfA = Math.sqrt((8250*FT)**2 - 2*M.mu/rA), rp = M.R + 60*NMI;
  const o1 = C.orbit(M.mu, rp, M.R + 169.7*NMI), loi1 = Math.sqrt(vinfA**2 + 2*M.mu/rp) - o1.vp, capA = C.capture(M.mu, rp, vinfA), pubLoi = (2917.5 + 158.8)*FT;
  ok('Apollo 11 arrived unbound at the Moon (v∞ ≈ 1.08 km/s)', near(vinfA, 1.08, 0.01), vinfA.toFixed(3));
  ok('Apollo 11 LOI-1: ideal 0.87 km/s, flown 0.889 (2,917.5 ft/s): real burn 1–4 % above ideal', near(2917.5*FT, 0.889, 0.001) && 2917.5*FT/loi1 > 1.01 && 2917.5*FT/loi1 < 1.04, loi1.toFixed(3));
  ok('Apollo 11 both braking burns 0.94 km/s flown vs 0.91 ideal capture into a 60 n mi circle (text)', near(pubLoi, 0.94, 0.005) && near(capA, 0.91, 0.005) && pubLoi > capA, capA.toFixed(3) + ' vs ' + pubLoi.toFixed(3));
  const oa = C.orbit(M.mu, M.R + 9.4*NMI, M.R + 48.0*NMI), asc = Math.sqrt(oa.vp**2 + 2*M.mu*(1/M.R - 1/(M.R + 9.4*NMI)));
  ok('Apollo 11 ascent: flown 1.85 km/s (6,070.1 ft/s) vs ideal 1.70, about 9 % more', near(6070.1*FT, 1.85, 0.005) && near(asc, 1.70, 0.006) && near(6070.1*FT/asc, 1.09, 0.01), asc.toFixed(3));
  ok('map\'s slower Hohmann arrival at the Moon (v∞ 0.83) brakes for less than Apollo\'s 3-day flight', row('llo').legs[1][2] < capA);

  /* ---- Chapter 7: propulsion table ---- */
  const P = C.PROP, by = s => P.find(p => p.en.indexOf(s) >= 0);
  ok('NSTAR: jet power 1.40 kW of 2.3 kW = 61 % (NASA: efficiency over 61 %)', near(C.jetPower(0.092, 3100)/1000, 1.40, 0.005) && near(C.jetPower(by('NSTAR').F, by('NSTAR').isp)/by('NSTAR').P, 0.61, 0.005), (C.jetPower(0.092, 3100)/2300).toFixed(3));
  ok('NEXT: 236 mN at the rounded 4,100 s from 6.9 kW → jet share 69 % (table value); NASA\'s "over 70 %" needs an Isp above 4,172 s, i.e. "over 4,100 s"', near(C.jetPower(by('NEXT').F, by('NEXT').isp)/by('NEXT').P, 0.69, 0.005) && near(0.70*6900/(0.5*0.236*C.G0), 4172, 2), (C.jetPower(0.236, 4100)/6900).toFixed(3));
  ok('Hall thruster: 16 km/s and 50 % of 1.35 kW → 84 mN; 16 km/s = 1,632 s', near(C.thrustFromPower(1350, 0.5, 16000)*1000, 84, 0.5) && near(by('Hall').isp, 1632, 1), (C.thrustFromPower(1350, 0.5, 16000)*1000).toFixed(1));
  ok('jet power and thrust-from-power are inverse', rel(C.thrustFromPower(C.jetPower(0.3, 2000), 1, 2000*C.G0), 0.3, 1e-12));
  ok('table values equal the published ones: RS-25 452.3 s / 512,300 lbf = 2.28 MN; F-1 265 s / 1,522,000 lbf = 6.77 MN; SRB 242 s / 2.8 Mlbf = 12.46 MN; NERVA XE-Prime 710 s and 246,663 N = 55,430 lbf (Finseth); IKAROS 1.12 mN',
    by('RS-25').isp === 452.3 && near(by('RS-25').F/1e6, 2.279, 0.001) && by('F-1').isp === 265 && near(by('F-1').F/1e6, 6.770, 0.001) && by('SRB').isp === 242 && near(by('SRB').F/1e6, 12.455, 0.001) && by('NERVA').isp === 710 && near(by('NERVA').F/1000, 55430*C.LBF/1000, 0.1) && by('IKAROS').F === 0.00112);
  ok('exhaust velocity rises down the table from solid to ion', P.filter(p => p.isp).every((p, i, a) => i === 0 || p.isp > a[i - 1].isp));
  ok('Starshot: 100 million mph = 15 % of light speed', near(1e8*MI/3600/299792.458, 0.15, 0.002), (1e8*MI/3600/299792.458).toFixed(4));
  ok('Dawn: 91 mN on 1,217.7 kg takes about 4 days for 0 → 60 mph (NASA: four days)', near(60*MI/3.6/(0.091/1217.7)/86400, 4, 0.3), (60*MI/3.6/(0.091/1217.7)/86400).toFixed(2));

  /* ---- instruments: presets, ranges, page state ---- */
  const d = w.document, txtOf = id => d.getElementById(id).textContent;
  ok('log slider mapping round-trips at both ends and in the middle', [0, 500, 1000].every(p => C.logPos(C.logVal(p, 6500, 9e5), 6500, 9e5) === p));
  ok('every orbit preset lies inside its slider range', Object.values(C.OPRE).every(q => q.p >= C.OB[q.b].lo && q.a <= C.OB[q.b].hi));
  ok('every Hohmann preset lies inside its slider range', Object.values(C.HPRE).every(q => Math.min(q.r1, q.r2) >= C.HB[q.b].lo && Math.max(q.r1, q.r2) <= C.HB[q.b].hi));
  const click = sel => d.querySelector(sel).click();
  click('#oPre .btn[data-k="geo"]');
  ok('orbit instrument, GEO preset: readout shows 3.075 km/s and a 23.93 h period', /3\.075/.test(txtOf('oReadout')) && /23\.93/.test(txtOf('oReadout')), txtOf('oPVal'));
  click('#hPre .btn[data-k="cape"]');
  ok('Hohmann instrument, 28.5° preset: total 4.291 km/s shown', /4\.291/.test(txtOf('hReadout')));
  click('#hPre .btn[data-k="nep"]');
  ok('Hohmann instrument, Neptune preset: flags the radius ratio above 11.94', /11\.94/.test(txtOf('hStatus')) && /30\.8/.test(txtOf('hReadout')));
  click('#wPre .btn[data-k="mars"]');
  ok('Oberth instrument, first preset: 2.96 km/s shown', /2\.96/.test(txtOf('wReadout')));
  click('#mPick .btn[data-id="mercurylo"]'); click('#mBasis .btn[data-g="1"]');
  ok('map instrument: Mercury orbit from the ground = 13.13 + 9.3 = 22.43 km/s shown, with the quoted leg labelled', /22\.43/.test(txtOf('mReadout')) && /QUOTED/.test(txtOf('mReadout')));
  click('#mBasis .btn[data-g="0"]');
  ok('map table has 15 data rows; propulsion table has 8', d.querySelectorAll('#mTable tr').length === 16 && d.querySelectorAll('#pTable tr').length === 9);
  click('#rStages .btn[data-n="1"]'); click('#rPre .btn[data-k="kero"]');
  ok('rocket instrument: one kerosene stage is reported as out of reach, not given a payload', /Out of reach/.test(txtOf('rStatus')) && /7\.50/.test(txtOf('rStatus')));
  click('#rStages .btn[data-n="2"]'); click('#rPre .btn[data-k="mix"]');
  ok('rocket instrument: kerosene then hydrogen, two stages → 4.67 % payload shown', /4\.67/.test(txtOf('rReadout')));
  ok('scrollable tables are keyboard-reachable regions with labels', [...d.querySelectorAll('.table-scroll')].every(e => e.getAttribute('tabindex') === '0' && e.getAttribute('role') === 'region' && e.getAttribute('aria-label')));
  ok('every slider has a label and a live value text', [...d.querySelectorAll('input[type=range]')].every(e => d.querySelector('label[for="' + e.id + '"]') && e.getAttribute('aria-valuetext')));
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('Russian: decimal comma and Russian units in the readouts', /4,67/.test(txtOf('rReadout')) && /км\/с/.test(txtOf('hReadout')) && !/km\/s/.test(txtOf('mReadout') + txtOf('wReadout') + txtOf('oReadout')));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('lede says nine chapters and five instruments; page has 9 numbered chapters and 36 references', /Nine chapters and five instruments/.test(d.querySelector('.lede').getAttribute('data-en')) && d.querySelectorAll('section[id^="ch"]').length === 9 && d.querySelectorAll('#refList .ref-item').length === 36);

  /* ---- response to review (2026-11-15) ---- */
  // A-M1: a clamped (unused) stage is reported, and the result equals the rocket without that stage
  const u3 = C.stageOpt(9.3, [303, 421, 421], [0.08, 0.08, 0.08]), h2 = C.stageOpt(9.3, [421, 421], [0.08, 0.08]);
  ok('default preset, 3 stages: the kerosene stage is unused (R = 1, Δv 0) and the result is the two-stage hydrogen rocket, 7.05 %', u3.unused === 1 && u3.stages[0].R === 1 && u3.stages[0].dv === 0 && rel(u3.payload, h2.payload, 1e-9) && near(u3.payload, 0.0705, 0.0005), (u3.payload*100).toFixed(2) + ' %');
  ok('default preset, 2 stages: nothing unused', C.stageOpt(9.3, [303, 421], [0.08, 0.08]).unused === 0);
  ok('an unused stage is never beaten by giving it some Δv (brute force)', (() => { for(let i = 1; i <= 100; i++){ const a = 9.3*i/100; for(let j = 0; j <= 100 - i; j++){ const b = 9.3*j/100; if(C.stagePayload([a, b, 9.3 - a - b], [303, 421, 421], [0.08, 0.08, 0.08]) > u3.payload*(1 + 1e-9)) return false; } } return true; })());
  click('#rStages .btn[data-n="3"]');
  ok('rocket instrument, 3 stages on the default preset: the page says a stage is unused', /unused/i.test(txtOf('rStatus')) && /STAGES LEFT UNUSED/.test(txtOf('rReadout')) && /1 unused/.test(d.getElementById('rSvg').textContent));
  click('#rStages .btn[data-n="2"]');
  // A-S1 / C-S4: the single hydrogen stage is flattered by vacuum Isp
  ok('single hydrogen stage: 4.64 % at vacuum 452 s, but at the RS-25\'s sea-level 366 s it cannot reach 9.3 km/s (limit 9.07)', near(C.stageOpt(9.3, [452], [0.08]).payload, 0.0464, 0.0005) && C.stageOpt(9.3, [366], [0.08]).ok === false && near(C.stageOpt(9.3, [366], [0.08]).limit, 9.07, 0.01), C.stageOpt(9.3, [366], [0.08]).limit.toFixed(3));
  // A-M2: Mercury's eccentric orbit (reviewer A's independent figures: 6.66 / 5.63 / 12.29 at perihelion, 4.76 / 9.87 / 14.63 at aphelion)
  const me = C.mercuryEnds();
  ok('Mercury, arrival at perihelion: 6.66 + 5.63 = 12.29 km/s', near(me[0].dep, 6.66, 0.01) && near(me[0].cap, 5.63, 0.01) && near(me[0].total, 12.29, 0.01), me[0].dep.toFixed(3) + ' + ' + me[0].cap.toFixed(3));
  ok('Mercury, arrival at aphelion: 4.76 + 9.87 = 14.63 km/s', near(me[1].dep, 4.76, 0.01) && near(me[1].cap, 9.87, 0.01) && near(me[1].total, 14.63, 0.01), me[1].dep.toFixed(3) + ' + ' + me[1].cap.toFixed(3));
  ok('text: Mercury flyby 4.8–6.7, orbit 12.3–14.6 km/s; the map\'s mean row lies inside both ranges; even the cheapest beats solar escape', near(me[1].dep, 4.8, 0.05) && near(me[0].dep, 6.7, 0.05) && near(me[0].total, 12.3, 0.05) && near(me[1].total, 14.6, 0.05) && row('mercury').total > me[1].dep && row('mercury').total < me[0].dep && row('mercurylo').total > me[0].total && row('mercurylo').total < me[1].total && me[0].total > row('solesc').total);
  ok('Mercury\'s published mean orbital speed 47.4 km/s is below the circular speed at its mean distance (47.87), as an eccentric orbit requires', C.vCirc(S, B.mercury.a) > 47.4 && near(C.vCirc(S, B.mercury.a), 47.87, 0.01));
  // B-M2 / A-S5: New Horizons left on launch energy alone (Guo & Farquhar: C3 = 157.7502 km²/s²)
  const nhV = Math.sqrt(157.7502), needV = (Math.SQRT2 - 1)*C.vCirc(S, E.a);
  ok('New Horizons: v∞ 12.56 km/s exceeds the 12.34 km/s the solar-escape row needs; equivalent burn 8.92 vs the row\'s 8.75 km/s', near(nhV, 12.56, 0.005) && near(needV, 12.34, 0.005) && nhV > needV && near(C.depart(E.mu, r0, nhV), 8.92, 0.005) && C.depart(E.mu, r0, nhV) > row('solesc').total, C.depart(E.mu, r0, nhV).toFixed(3));
  click('#mPick .btn[data-id="solesc"]');
  ok('map status for solar escape names New Horizons and no longer says every craft needed Jupiter', /New Horizons/.test(txtOf('mStatus')) && /8\.92/.test(txtOf('mStatus')) && !/Every craft/.test(txtOf('mStatus')));
  click('#mPick .btn[data-id="mercurylo"]');
  ok('map status for Mercury orbit states the 12.3–14.6 km/s spread', /12\.3/.test(txtOf('mStatus')) && /14\.6/.test(txtOf('mStatus')));
  click('#mPick .btn[data-id="mars"]');
  // C-M2: direction of the burns
  click('#hPre .btn[data-k="venus"]');
  ok('Hohmann instrument, Earth → Venus: status says both burns are against the direction of flight', /against the direction of flight/.test(txtOf('hStatus')) && !/both along/.test(txtOf('hStatus')));
  click('#hPre .btn[data-k="mars"]');
  ok('Hohmann instrument, Earth → Mars: status says both burns are along the direction of flight; readout shows 2.945', /both along the direction of flight/.test(txtOf('hStatus')) && /2\.945/.test(txtOf('hReadout')));
  click('#hPre .btn[data-k="geo"]');
  // B-M1: NERVA
  ok('XE-Prime 710 s ↔ 6.96 km/s; 55,430 lbf ↔ 246.6 kN (Finseth gives 246,663 N)', near(C.vex(710), 6.96, 0.005) && near(55430*C.LBF, 246663, 120), (55430*C.LBF).toFixed(0));
  ok('propulsion table: nuclear row shows 710 s and 247 kN, not 825 s', /710/.test(d.querySelectorAll('#pTable tr')[4].textContent) && /247/.test(d.querySelectorAll('#pTable tr')[4].textContent) && !/825/.test(d.getElementById('pTable').textContent));
  // B-S1, B-N1, A-N3 and smaller text numbers
  ok('176 km → 200 km costs about 0.01 km/s (Hohmann)', near(C.hohmann(E.mu, E.R + 176, E.R + 200, 0).total, 0.014, 0.002), C.hohmann(E.mu, E.R + 176, E.R + 200, 0).total.toFixed(4));
  ok('cosmic velocities for a 6,371 km sphere: 7.910 / 11.186 (BSE); for 6,378.137 km: 7.91 / 11.18 (text)', near(C.vCirc(E.mu, 6371), 7.910, 0.001) && near(C.vEsc(E.mu, 6371), 11.186, 0.001) && near(C.vEsc(E.mu, E.R), 11.18, 0.005));
  ok('a plain turn costs more than the far-apoapsis detour 2(√2 − 1)v above 48.9° (text: about 49°)', near(2*Math.asin(Math.SQRT2 - 1)/d2r, 48.9, 0.1) && C.planeChange(1, 50*d2r) > 2*(Math.SQRT2 - 1) && C.planeChange(1, 48*d2r) < 2*(Math.SQRT2 - 1));
  ok('28.5° at 200 km is about half the orbital speed (49 %)', near(C.planeChange(hG.c1, 28.5*d2r)/hG.c1, 0.49, 0.005));
  ok('Moon escape speed prints as 2.37 with the fact-sheet GM and radius (published 2.38)', C.vEsc(M.mu, M.R).toFixed(2) === '2.37');
  ok('Juno: 1,212 mph = 542 m/s (NASA)', near(1212*MI/3.6, 542, 0.5), (1212*MI/3.6).toFixed(1));
  // A-S2: Oberth axis ticks are round numbers at round positions
  const ticksOK = () => { const t = [...d.querySelectorAll('#wSvg text')].map(e => e.textContent).filter(x => /^[\d.,]+$/.test(x)).map(Number).filter((x, i, a) => i >= a.length - 5); return t.length === 5 && t.every((x, i) => Math.abs(x - i*t[1]) < 1e-9); };
  const wSet = (id, v) => { const e = d.getElementById(id); e.value = v; e.dispatchEvent(new w.Event('input')); };
  click('#wPre .btn[data-k="mars"]'); const tk1 = ticksOK(); wSet('wV', 15); wSet('wD', 5); const tk2 = ticksOK(); click('#wPre .btn[data-k="sun"]'); const tk3 = ticksOK(); click('#wPre .btn[data-k="mars"]');
  ok('Oberth chart: y-axis labels are exact multiples of the tick step in three states', tk1 && tk2 && tk3);
  // C-S9: no-break spaces in script-drawn Russian
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('Russian readouts and timeline use no-break spaces between number and unit', /\d км\/с/.test(txtOf('hReadout')) && /\d %/.test(txtOf('rReadout')) && /430 000/.test(d.getElementById('timeline').textContent) && !/\d км\/с/.test(txtOf('mReadout') + txtOf('wReadout') + txtOf('oReadout') + txtOf('rReadout')));
  ok('Russian map labels say «у Марса» / «с околоземной орбиты», not the planet\'s own orbit', /Орбита у Марса/.test(d.getElementById('mSvg').textContent) && /околоземной орбиты/.test(d.getElementById('mSvg').textContent) && !/Орбита Марса/.test(d.getElementById('mSvg').textContent));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('tables: header cells carry scope', [...d.querySelectorAll('#mTable th, #pTable th')].every(e => e.getAttribute('scope')));
  console.log(out.join('\n'));
  console.log(out.filter(x => x.startsWith('PASS')).length + ' passed, ' + out.filter(x => x.startsWith('FAIL')).length + ' failed');
};
