module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const E = C.PL.earth, J = C.PL.jupiter, deg = 180/Math.PI;
  // Cassini Earth flyby, 18 Aug 1999: v∞ 16.01 km/s (Anderson 2008), 1,171 km (JPL) → JPL "about 5.5 km/s"
  const dvC = C.dvVec(E.mu, E.R + 1171, 16.01);
  ok('Cassini |Δv| ≈ 5.5 km/s (JPL)', Math.abs(dvC - 5.5) < 0.05, dvC.toFixed(3));
  // one Earth radius throughout (equatorial, 6,378.137 km)
  const vpC = C.vPeri(E.mu, E.R + 1175, 16.01);
  ok('Cassini perigee speed 19.026 km/s (Anderson table)', Math.abs(vpC - 19.026) < 0.005, vpC.toFixed(3));
  // NEAR: perigee speed 12.739 at 539 km with v∞ 6.851
  const vpN = C.vPeri(E.mu, E.R + 539, 6.851);
  ok('NEAR perigee speed 12.739 km/s', Math.abs(vpN - 12.739) < 0.01, vpN.toFixed(3));
  // MESSENGER: 10.389 at 2,347 km with 4.056
  const vpM = C.vPeri(E.mu, E.R + 2347, 4.056);
  ok('MESSENGER perigee speed 10.389 km/s', Math.abs(vpM - 10.389) < 0.01, vpM.toFixed(3));
  // identities: |Δv| = 2v∞ sin(δ/2) = 2v∞/e
  const e = C.ecc(E.mu, E.R + 1171, 16.01);
  ok('|Δv| = 2v∞/e identity', Math.abs(dvC - 2*16.01/e) < 1e-9);
  // edge cases of the turn angle: far pass → 0°, grazing slow pass → 180°
  ok('turn → 0° for a very distant pass', C.turn(E.mu, 1e9, 10)*deg < 0.01);
  ok('turn → 180° as v∞ → 0', C.turn(J.mu, J.R, 1e-4)*deg > 179.9);
  // the planet frame keeps |v∞|; the Sun frame gain or loss depends on side
  const V = [C.vCirc(J.a), 0], f1 = C.flyby([V[0], 5], V, J.mu, 2*J.R, 1), f2 = C.flyby([V[0], 5], V, J.mu, 2*J.R, -1);
  ok('|v∞| conserved through the flyby', Math.abs(Math.hypot(...f1.uo) - f1.vinf) < 1e-9);
  ok('radial approach: pass behind speeds up, in front slows down', f1.gain > 0 && f2.gain < 0, f1.gain.toFixed(2) + ' / ' + f2.gain.toFixed(2));
  let worst = 1;   // exact identity |v_out|² − |v_in|² = 2 V·Δv, and sign rule, over many random geometries
  for(let i = 0; i < 2000; i++){
    const th = i*2.399, vi = 0.5 + (i % 37)/2, rp = J.R*(1.05 + (i % 11)*3), s = i % 2 ? 1 : -1;
    const g = C.flyby([V[0] + vi*Math.cos(th), vi*Math.sin(th)], V, J.mu, rp, s);
    const lhs = g.sOut**2 - g.sIn**2, rhs = 2*(V[0]*(g.uo[0] - g.u[0]) + V[1]*(g.uo[1] - g.u[1]));
    const o = C.flyby([V[0] + vi*Math.cos(th), vi*Math.sin(th)], V, J.mu, rp, -s);   // the other way round
    if(Math.abs(lhs - rhs) > 1e-7*Math.max(1, Math.abs(lhs)) || s*(g.gain - o.gain) < -1e-12) worst = 0;
  }
  ok('identity |v_out|² − |v_in|² = 2V·Δv holds and behind ≥ in front, over 2,000 geometries', worst === 1);
  ok('Sun-frame |Δv| equals planet-frame |Δv|', Math.abs(Math.hypot(f1.vout[0] - f1.vin[0], f1.vout[1] - f1.vin[1]) - f1.dv) < 1e-9);
  // energy bookkeeping in the planet frame and momentum in the Sun frame (elastic 1-D)
  const m = 721.9/J.M, b = C.bounce(m, 10, 1, -13.06);
  ok('heavy train: ball leaves at u + 2V', Math.abs(-b.v1p - (10 + 2*13.06)) < 1e-9, (-b.v1p).toFixed(3));
  const b2 = C.bounce(0.1, 10, 1, -5), p0 = 0.1*10 - 5, p1 = 0.1*b2.v1p + b2.v2p, k0 = 0.1*100 + 25, k1 = 0.1*b2.v1p**2 + b2.v2p**2;
  ok('elastic bounce conserves momentum and energy', Math.abs(p1 - p0) < 1e-12 && Math.abs(k1 - k0) < 1e-9);
  ok('Jupiter slows by ~1.75e-20 m/s for Voyager 2 at the ideal limit', Math.abs(b.dv2*1000/1.754e-20 - 1) < 0.01, (b.dv2*1000).toExponential(3));
  // periapsis geometry: for a pass behind with a gain, the closest-approach direction (−Δv) points against the planet's motion
  let geo = true;
  for(let i = 0; i < 500; i++){
    const th = i*1.7, g = C.flyby([V[0] + 6*Math.cos(th), 6*Math.sin(th)], V, J.mu, J.R*(1.1 + i % 7), 1);
    const dvx = g.uo[0] - g.u[0];
    if(g.gain > 1e-9 && !(-dvx < 0)) geo = false;
  }
  ok('gain ⇒ closest approach behind the planet (−Δv against V)', geo);
  // Van Allen (2003): Pioneer 10 at Jupiter — 9.8 km/s at 49° from the Sun line, Jupiter 13.5 km/s ⟂, v∞ 8.9 at 43° clockwise, turned 116° → 22.4 km/s at 83°
  const d2r = Math.PI/180, v0 = [9.8*Math.cos(49*d2r), 9.8*Math.sin(49*d2r)], W = [0, 13.5], u0 = [v0[0] - W[0], v0[1] - W[1]];
  ok('Pioneer 10: v∞ = 8.9 km/s at 43° clockwise (Van Allen)', Math.abs(Math.hypot(...u0) - 8.9) < 0.05 && Math.abs(Math.atan2(u0[1], u0[0])/d2r + 43) < 1, Math.hypot(...u0).toFixed(2) + ' km/s, ' + (Math.atan2(u0[1], u0[0])/d2r).toFixed(1) + '°');
  const c1 = Math.cos(116*d2r), s1 = Math.sin(116*d2r), u1 = [u0[0]*c1 - u0[1]*s1, u0[0]*s1 + u0[1]*c1], v1 = [u1[0] + W[0], u1[1] + W[1]];
  ok('Pioneer 10: 22.4 km/s at 83° after (Van Allen; ±0.4 from rounded inputs)', Math.abs(Math.hypot(...v1) - 22.4) < 0.4 && Math.abs(Math.atan2(v1[1], v1[0])/d2r - 83) < 1, Math.hypot(...v1).toFixed(2) + ' km/s, ' + (Math.atan2(v1[1], v1[0])/d2r).toFixed(1) + '°');
  ok('Pioneer 10: perijove speed ≈ 37 km/s at 2.027 × 10⁵ km', Math.abs(C.vPeri(J.mu, 2.027e5, 8.9) - 37) < 0.6, C.vPeri(J.mu, 2.027e5, 8.9).toFixed(2));
  ok('solar escape at 5.05 AU = 18.7 km/s (Van Allen)', Math.abs(C.vEsc(5.05*E.a) - 18.7) < 0.05, C.vEsc(5.05*E.a).toFixed(2));
  // Jupiter's orbit change for the Voyager 2 preset: Δa = 2aΔv/v ≈ 2.1 × 10⁻¹² m (a planet slowed drops inward and drifts ahead)
  const da = C.orbitShrink(b.dv2);
  ok('Jupiter orbit shrinks ≈ 2.1e-12 m (about 1/48 of an atom)', Math.abs(da/2.09e-12 - 1) < 0.01 && Math.round(1e-10/da) === 48, da.toExponential(3));
  // ball/train at 1:100 (slider minimum): ball leaves slower than u + 2V; train slows (Δv2 < 0 for a train moving in −x... here it is pushed back)
  const b100 = C.bounce(0.01, 10, 1, -5);
  ok('1:100 ball leaves at 19.70 < u + 2V = 20', Math.abs(-b100.v1p - 19.703) < 0.001 && -b100.v1p < 20, (-b100.v1p).toFixed(3));
  ok('1:100 train is slowed, not reversed', b100.dv2 > 0 && b100.v2p < 0, b100.v2p.toFixed(3));
  // Hohmann: Neptune ≈ 30 years (NASA), Jupiter 8.79 km/s
  const hN = C.hohmann(C.PL.neptune.a), hJ = C.hohmann(J.a);
  ok('Hohmann to Neptune ≈ 30 years (NASA: 30)', Math.abs(hN.tof/C.YEAR - 30.8) < 0.1, (hN.tof/C.YEAR).toFixed(2));
  ok('Hohmann to Jupiter needs 8.79 km/s, 2.73 years', Math.abs(hJ.vinf - 8.79) < 0.01 && Math.abs(hJ.tof/C.YEAR - 2.73) < 0.01);
  ok('Voyager 2 to Neptune = 12.0 years (NASA: 12)', Math.abs(C.v2years('neptune') - 12.0) < 0.05, C.v2years('neptune').toFixed(2));
  ok('Jupiter orbital speed 13.06 km/s (fact sheet)', Math.abs(C.vCirc(J.a) - 13.06) < 0.01);
  // escape via Jupiter: solar escape at 5.2 AU ≈ 18.5; minimum launch can escape with a close pass behind
  const j1 = C.viaJupiter(8.8, 1.05, 1), j2 = C.viaJupiter(8.8, 1.05, -1);
  ok('solar escape speed at Jupiter ≈ 18.47 km/s', Math.abs(j1.esc - 18.465) < 0.01, j1.esc.toFixed(3));
  ok('8.8 km/s launch + 1.05 R_J pass behind escapes', !j1.bound, j1.sOut.toFixed(3));
  ok('Hohmann-slow arrival: Jupiter overtakes it, so even the in-front option gains', j2.gain > 0, j2.gain.toFixed(2));
  const j3 = C.viaJupiter(12, 3, -1);
  ok('faster launch, pass in front: loses speed, perihelion drops', j3.bound && j3.gain < 0 && j3.after.rper < E.a, j3.gain.toFixed(2) + ' km/s, perihelion ' + (j3.after.rper/E.a).toFixed(2) + ' AU');
  ok('8.79 km/s cannot reach Jupiter (below Hohmann)', C.viaJupiter(8.79, 2, 1) === null);
  // conic consistency: post-flyby energy from vis-viva matches conic()
  const c = j3.after, vv = j3.sOut*j3.sOut/2 - C.GM_SUN/J.a;
  ok('post-flyby orbit energy consistent', Math.abs(c.eps - vv) < 1e-9);
  // New Horizons: 14,000 km/h ≈ 3.9 km/s
  ok('14,000 km/h = 3.89 km/s', Math.abs(14000/3600 - 3.89) < 0.005);
  console.log(out.join('\n'));
};
