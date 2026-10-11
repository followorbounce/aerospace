module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const d = w.document;

  /* ---- CH2 cosmic velocities ---- */
  ok('first cosmic velocity at the surface ≈ 7.9 km/s', Math.abs(C.vCirc(0) - 7.9) < 0.01, C.vCirc(0).toFixed(3));
  ok('second cosmic velocity at the surface ≈ 11.2 km/s', Math.abs(C.vEsc(0) - 11.2) < 0.03, C.vEsc(0).toFixed(3));
  ok('solar escape at 1 AU = √2 × 29.78 ≈ 42.1 km/s', Math.abs(Math.SQRT2*29.78 - 42.1) < 0.05, (Math.SQRT2*29.78).toFixed(2));
  const v3 = Math.sqrt(12.3*12.3 + C.vEsc(0)*C.vEsc(0));
  ok('third cosmic velocity √(12.3² + v_esc²) ≈ 16.6 km/s', Math.abs(v3 - 16.6) < 0.05, v3.toFixed(2));

  /* ---- CH1 Newton's cannonball ---- */
  ok('100 km mountain: circular 7.84, escape 11.09 km/s', Math.abs(C.vCirc(100) - 7.844) < 0.0005 && Math.abs(C.vEsc(100) - 11.093) < 0.0005, C.vCirc(100).toFixed(3) + ' / ' + C.vEsc(100).toFixed(3));
  ok('7.85 km/s is classed circular', C.newton(7.85, 100).type === 'circ');
  const e9 = C.newton(9, 100), r0 = C.R_E + 100, ra = 1/(2/r0 - 81/C.MU_E)*2 - r0;   /* vis-viva: a = 1/(2/r - v²/μ) */
  ok('9 km/s: apogee matches vis-viva', e9.type === 'ell' && Math.abs(e9.apoAlt + C.R_E - ra) < 1, e9.apoAlt.toFixed(0) + ' km');
  const e12 = C.newton(12, 100);
  ok('12 km/s escapes with v∞ = √(v² − v_esc²)', e12.type === 'esc' && Math.abs(e12.vinf - Math.sqrt(144 - C.vEsc(100)**2)) < 1e-9, e12.vinf.toFixed(3));
  /* independent check of the suborbital range and flight time with an RK4 integration */
  function rk4(v0, h){
    let x = 0, y = C.R_E + h, vx = v0, vy = 0, t = 0; const dt = 0.5;
    const acc = (x, y) => { const r3 = Math.pow(x*x + y*y, 1.5); return [-C.MU_E*x/r3, -C.MU_E*y/r3]; };
    while(Math.hypot(x, y) > C.R_E && t < 20000){
      const k1 = acc(x, y), k1v = [vx, vy];
      const k2 = acc(x + k1v[0]*dt/2, y + k1v[1]*dt/2), k2v = [vx + k1[0]*dt/2, vy + k1[1]*dt/2];
      const k3 = acc(x + k2v[0]*dt/2, y + k2v[1]*dt/2), k3v = [vx + k2[0]*dt/2, vy + k2[1]*dt/2];
      const k4 = acc(x + k3v[0]*dt, y + k3v[1]*dt), k4v = [vx + k3[0]*dt, vy + k3[1]*dt];
      x += dt/6*(k1v[0] + 2*k2v[0] + 2*k3v[0] + k4v[0]); y += dt/6*(k1v[1] + 2*k2v[1] + 2*k3v[1] + k4v[1]);
      vx += dt/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]); vy += dt/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]); t += dt;
    }
    return {range: C.R_E*Math.atan2(x, y), tmin: t/60};
  }
  for(const v of [5, 7]){
    const a = C.newton(v, 100), b = rk4(v, 100);
    ok('suborbital ' + v + ' km/s: Kepler range/time match RK4', a.type === 'sub' && Math.abs(a.rangeKm - b.range)/b.range < 0.005 && Math.abs(a.flightMin - b.tmin) < 0.05, a.rangeKm.toFixed(0) + ' vs ' + b.range.toFixed(0) + ' km, ' + a.flightMin.toFixed(2) + ' vs ' + b.tmin.toFixed(2) + ' min');
  }

  /* ---- CH5 orbit at 415 km ---- */
  const o = C.orbit(415);
  ok('415 km: 7.66 km/s (NASA rounds to "five miles per second")', Math.abs(o.v - 7.66) < 0.005 && Math.abs(o.v/1.609344 - 5) < 0.3, o.v.toFixed(3));
  ok('415 km: about 93 minutes a lap', Math.abs(o.periodMin - 92.9) < 0.05, o.periodMin.toFixed(2));
  ok('415 km: ~15.5 laps a day (NASA: "16 orbits")', Math.abs(o.lapsPerDay - 15.5) < 0.05 && Math.round(o.lapsPerDay) === 16, o.lapsPerDay.toFixed(2));
  const g200 = C.orbit(200*1.609344).gFrac, g250 = C.orbit(250*1.609344).gFrac;
  ok('gravity at 200–250 miles ≈ 90 % (NASA)', Math.abs(g200 - 0.9) < 0.02 && Math.abs(g250 - 0.9) < 0.02, (g200*100).toFixed(1) + '–' + (g250*100).toFixed(1) + ' %');
  ok('fall in one second = g_local / 2', Math.abs(o.fallPerSecond_m - 9.80665*o.gFrac/2) < 0.01, o.fallPerSecond_m.toFixed(2) + ' m');
  const rho = C.horizonAngle(415, 10);
  ok('10° elevation reaches ~1,400 km from the ground track', Math.abs(C.R_E*rho - 1400) < 60, (C.R_E*rho).toFixed(0) + ' km');
  ok('overhead possible inside 51.6°', Math.abs(C.maxElevation(21.3, 415, 51.6) - 90) < 1e-6);
  const mosc = C.maxElevation(55.8, 415, 51.6), rey = C.maxElevation(64.1, 415, 51.6), sval = C.maxElevation(78.2, 415, 51.6);
  ok('Moscow sees it high but never overhead', mosc > 30 && mosc < 70, mosc.toFixed(1) + '°');
  ok('Reykjavík: near the 10° limit', rey > 5 && rey < 15, rey.toFixed(1) + '°');
  ok('Svalbard: never rises', sval < 0, sval.toFixed(1) + '°');
  for(const lat of [21.3, 55.8]){
    const sim = C.passesPerDay(lat, 415, 51.6, 10), ana = C.timeInViewShare(lat, 415, 51.6, 10);
    ok('time in view at ' + lat + '°: simulation matches the analytic latitude integral', Math.abs(sim.share - ana)/ana < 0.06, (sim.share*100).toFixed(2) + ' vs ' + (ana*100).toFixed(2) + ' %');
  }
  const pN = C.passesPerDay(33.9, 415, 51.6, 10).passes, pS = C.passesPerDay(-33.9, 415, 51.6, 10).passes;
  ok('north/south symmetry of pass counts', Math.abs(pN - pS) < 0.3, pN.toFixed(2) + ' / ' + pS.toFixed(2));
  ok('no passes above 10° from Svalbard', C.passesPerDay(78.2, 415, 51.6, 10).passes === 0);

  /* ---- CH9 Mir's burns (ESA SP-498) ---- */
  C.BURN_PRESETS.filter(p => p.flown).forEach(p => {
    const dv = C.deorbitDv(p.ha, p.hp, p.ht);
    ok(p.id + ': ideal apogee burn below the flown ' + p.flown + ' m/s', dv > 0 && dv < p.flown, dv.toFixed(2) + ' m/s');
  });
  const b3 = C.deorbitDv(213.2, 156.1, 80.0);
  ok('burn 3 ideal within 20 % of the flown 28 m/s', Math.abs(b3 - 28)/28 < 0.2, b3.toFixed(2));
  const vb = (C.vApogee(213.2, 156.1) - C.vApogee(213.2, 80))*1000;
  ok('deorbitDv equals the vis-viva difference at apogee', Math.abs(vb - b3) < 1e-9);
  ok('ISS: one burn from 415 km to a 50 km perigee ≈ 106 m/s', Math.abs(C.deorbitDv(415, 415, 50) - 106.5) < 0.5, C.deorbitDv(415, 415, 50).toFixed(1));
  ok('NASA 57 m/s ⇔ final burn from ~241 km to 50 km (model)', Math.abs(C.deorbitDv(241, 241, 50) - 57) < 0.5, C.deorbitDv(241, 241, 50).toFixed(1));

  /* ---- CH9 boost vs deorbit (NASA transition FAQ) ---- */
  ok('Hohmann 415 → 2,000 km = NASA\'s 760 m/s', Math.abs(C.hohmann(415, 2000).total - 760) < 2, C.hohmann(415, 2000).total.toFixed(1));
  ok('120–140 m/s spans ~633–670 km', Math.abs(C.hohmann(415, 633).total - 120) < 0.5 && Math.abs(C.hohmann(415, 670).total - 140) < 0.5,
     C.hohmann(415, 633).total.toFixed(1) + ' / ' + C.hohmann(415, 670).total.toFixed(1));

  /* ---- page behaviour ---- */
  const bad = (el) => /NaN|undefined|Infinity/.test(el.textContent);
  ['newtonVerdict', 'altReadout', 'altStatus', 'flyReadout', 'flyoverResult', 'burnReadout', 'burnStatus', 'boostReadout', 'boostStatus', 'st415T'].forEach(id => {
    ok('#' + id + ' rendered, no NaN', d.getElementById(id) && d.getElementById(id).textContent.trim().length > 0 && !bad(d.getElementById(id)));
  });
  ok('stats at 415 km read 92.9 / 15.5', d.getElementById('st415T').textContent === '92.9' && d.getElementById('st415N').textContent === '15.5');
  const sel = d.getElementById('citySelect'); let allOk = true;
  for(let i = 0; i < sel.options.length; i++){ sel.value = String(i); sel.dispatchEvent(new w.Event('change')); if(bad(d.getElementById('flyReadout')) || bad(d.getElementById('flyoverResult'))) allOk = false; }
  ok('every city renders', allOk && sel.options.length === 6);
  const burnBtns = d.querySelectorAll('#burnBtns .btn');
  burnBtns.forEach(b => { b.click(); if(bad(d.getElementById('burnReadout'))) allOk = false; });
  ok('every burn preset renders', allOk && burnBtns.length === 4);
  d.querySelectorAll('#burnBtns .btn')[0].click();
  ok('burn 1 preset shows the flown 9.27 m/s', /9\.27/.test(d.getElementById('burnReadout').textContent));
  d.querySelectorAll('#boostBtns .btn')[1].click();
  ok('2,000 km preset cites 760 m/s', /760/.test(d.getElementById('boostStatus').textContent));
  const ns = d.getElementById('newtonSlider');
  [4, 6, 7.85, 9, 11.1, 13].forEach(v => { ns.value = v; ns.dispatchEvent(new w.Event('input')); if(bad(d.getElementById('newtonVerdict'))) allOk = false; });
  ok('cannonball renders 4–13 km/s', allOk);
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('Russian mode: decimal comma, no NaN', /\d,\d/.test(d.getElementById('altReadout').textContent) && !bad(d.getElementById('burnReadout')) && !bad(d.getElementById('flyReadout')));
  ok('Russian mode: aria-labels switch', /Траектория/.test(d.getElementById('newtonSvg').getAttribute('aria-label')));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  const labels = [...d.querySelectorAll('.eyebrow .fig-num')].map(e => e.textContent);
  ok('every chapter label is "/ 11"', labels.length === 11 && labels.every(t => / \/ 11$/.test(t)), labels.length);
  ok('Mir timeline in date order', (() => { const ys = [...d.querySelectorAll('.mt-year')].map(e => +e.textContent); return ys.every((y, i) => !i || y > ys[i - 1]); })());
  ok('sliders announce values', [...d.querySelectorAll('input[type=range]')].every(r => r.getAttribute('aria-valuetext')));

  /* ---- review fixes (2026-10-11) ---- */
  ok('Canadarm2 (CSA) on the ISS module map', [...d.querySelectorAll('#issSvg .hotspot')].some(g => g.dataset.id === 'canadarm2'));
  sel.value = '0'; sel.dispatchEvent(new w.Event('change'));
  ok('in-track city: passes every day (no "pause")', /every day/.test(d.getElementById('flyoverResult').textContent) && !/pause/.test(d.getElementById('flyoverResult').textContent));
  sel.value = '4'; sel.dispatchEvent(new w.Event('change'));
  ok('Reykjavík max elevation shown with a decimal', /9\.8°/.test(d.getElementById('flyReadout').textContent), d.getElementById('flyReadout').textContent.match(/[\d.]+°/g).join(' '));
  const bh = d.getElementById('boostH'); bh.value = 480; bh.dispatchEvent(new w.Event('input'));
  ok('boost below 57 m/s says "only", not "times"', /only/.test(d.getElementById('boostStatus').textContent) && !/times/.test(d.getElementById('boostStatus').textContent), C.hohmann(415, 480).total.toFixed(1) + ' m/s');
  const eb = [...d.querySelectorAll('.exp-btn')];
  ok('experiment headings are h4 > button with aria-expanded', eb.length === 4 && eb.every(b => b.parentElement.tagName === 'H4' && b.hasAttribute('aria-expanded')));
  eb[1].click();
  ok('opening a card un-hides its body', eb[1].getAttribute('aria-expanded') === 'true' && !d.getElementById('expBody-1').hidden && d.getElementById('expBody-2').hidden);
  ok('language buttons expose aria-pressed', [...d.querySelectorAll('#langtoggle button')].every(b => b.hasAttribute('aria-pressed')));
  const ticks = [...d.querySelectorAll('.sim-ticks span')].map(e => parseFloat(e.style.left));
  ok('slider ticks sit at their true positions', [4, 7.844, 11.093, 13].every((v, i) => Math.abs((v - 4)/9*100 - ticks[i]) < 0.15), ticks.join(' / '));
  console.log(out.join('\n'));
};
