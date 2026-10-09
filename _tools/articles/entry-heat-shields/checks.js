module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const ft = 0.3048, VE = 36194.4*ft, gam = 6.48*Math.PI/180;
  const am = C.aMax(VE, gam)/9.80665; ok('Apollo 11 ballistic peak ≈ 36 g', Math.abs(am - 35.8) < 0.5, am.toFixed(2));
  // numerical integration of straight-line ballistic flight (RK4) must reproduce the analytic peak & altitude
  function numeric(beta){ let h = 130000, V = VE, peak = 0, hp = 0; const dt = 0.01, s = Math.sin(gam);
    const f = (h, V) => [-V*s, -C.rho(h)*V*V/(2*beta)];
    while(h > 0 && V > 50){ const k1 = f(h, V), k2 = f(h + dt/2*k1[0], V + dt/2*k1[1]), k3 = f(h + dt/2*k2[0], V + dt/2*k2[1]), k4 = f(h + dt*k3[0], V + dt*k3[1]);
      h += dt/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]); V += dt/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]); const a = C.rho(h)*V*V/(2*beta); if(a > peak){ peak = a; hp = h; } }
    return {peak, hp}; }
  [300, 3000].forEach(b => { const n = numeric(b); ok('RK4 peak = analytic (β ' + b + ')', Math.abs(n.peak - C.aMax(VE, gam))/C.aMax(VE, gam) < 1e-3, (n.peak/9.80665).toFixed(3)); ok('RK4 altitude = analytic (β ' + b + ')', Math.abs(n.hp - C.hStar(gam, b)) < 50, (n.hp/1000).toFixed(2) + ' km'); });
  ok('speed at peak = e^-1/2 V_E', Math.abs(C.speedAt(C.hStar(gam, 400), VE, gam, 400)/VE - Math.exp(-0.5)) < 1e-9);
  ok('Apollo 7 ballistic peak ≈ 5.8 g', Math.abs(C.aMax(25846.4*ft, 2.072*Math.PI/180)/9.80665 - 5.8) < 0.2);
  const P1 = C.profile(VE, gam, 400, 4), P2 = C.profile(VE, gam, 400, 1);
  ok('heating ∝ 1/√r_n', Math.abs(P2.peakQ/P1.peakQ - 2) < 1e-6, (P2.peakQ/P1.peakQ).toFixed(4));
  ok('286 BTU/ft²/s = 3.25 MW/m²', Math.abs(286*11356.5 - 3.248e6) < 5e3);
  console.log(out.join('\n'));
};
