module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document, lang = l => d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
  // CH1 — constants and orbital speed
  ok('GM/R² reproduces the fact-sheet surface gravity 1.62 m/s² [1][2]', near(C.gSurf(), 1.62, 0.006), C.gSurf().toFixed(4));
  ok('escape velocity 2.38 km/s (NASA fact sheet [2])', near(C.escapeV(), 2.38, 0.006), C.escapeV().toFixed(4));
  ok('60 nmi = 111.12 km; 50,000 ft = 15.24 km [3]', near(C.H_APOLLO, 111.12, 1e-9) && near(C.HP_APOLLO, 15.24, 1e-9));
  ok('circular speed at 60 nmi ≈ 1.63 km/s ("about 1.6 km/s")', near(C.vCirc(C.H_APOLLO), 1.629, 0.001), C.vCirc(C.H_APOLLO).toFixed(4));
  ok('eq-box shows the computed value', d.getElementById('eqV').textContent === '1.629', d.getElementById('eqV').textContent);
  const bA = C.descentBudget(C.H_APOLLO, C.HP_APOLLO, 140);
  ok('periapsis speed at 15.24 km ≈ 1.69 km/s ≈ 6,100 km/h', near(bA.brake/1000, 1.69, 0.006) && near(bA.brake*3.6, 6100, 30), (bA.brake*3.6).toFixed(0));
  const b20 = C.descentBudget(C.H_APOLLO, 20, 0);
  ok('braking from 20 km starts near ispace\'s "about 6,000 km/h" [27] (within 2 %)', Math.abs(b20.brake*3.6/6000 - 1) < 0.02, (b20.brake*3.6).toFixed(0));
  ok('vis-viva at apoapsis + periapsis conserve angular momentum', near(C.visViva(C.R_M + C.H_APOLLO, C.R_M + (C.H_APOLLO + C.HP_APOLLO)/2)*(C.R_M + C.H_APOLLO), C.visViva(C.R_M + C.HP_APOLLO, C.R_M + (C.H_APOLLO + C.HP_APOLLO)/2)*(C.R_M + C.HP_APOLLO), 1e-9));
  ok('Hohmann deorbit burn is small (~20 m/s)', bA.deorbit > 15 && bA.deorbit < 30, bA.deorbit.toFixed(2));
  ok('one-way light time over 384,400 km ≈ 1.3 s [2]', near(384400/299792.458, 1.28, 0.01));
  // CH2 — Beresheet
  ok('500 km/h = 138.9 m/s ("about 139 m/s") [5]', near(500/3.6, 138.9, 0.05));
  // CH3 — descent budget
  ok('gravity toll 1.62 m/s per second; a minute ≈ 97 m/s', near(C.descentBudget(C.H_APOLLO, C.HP_APOLLO, 60).grav, 97.2, 1e-9));
  ok('Apollo 11 hover phase 140 s → 226.8 m/s of gravity loss', near(bA.grav, 226.8, 1e-9));
  ok('lower-bound Apollo-style budget ≈ 1.94 km/s', near(bA.total, 1943, 2), bA.total.toFixed(1));
  ok('rocket equation: 305 s Isp burns ≈ 48 % of start mass for that Δv', near(C.propFrac(bA.total, 305), 0.478, 0.002), C.propFrac(bA.total, 305).toFixed(4));
  ok('propFrac inverts the rocket equation', near(-305*C.G0*Math.log(1 - C.propFrac(1500, 305)), 1500, 1e-6));
  ok('hover time: 1 % of mass ≈ 18.6 s at 305 s; consistent with thrust = weight', near(C.hoverTime(0.01, 305), 18.56, 0.02) && near(C.hoverTime(0.01, 305)*C.G_M, 305*C.G0*Math.log(1/0.99), 1e-9), C.hoverTime(0.01, 305).toFixed(3));
  // CH4 — altitude filter, free fall
  ok('5 km free fall: ≈ 127 m/s after ≈ 79 s (body text)', near(C.fallSpeed(5000), 127.3, 0.1) && near(C.fallTime(5000), 78.6, 0.1), C.fallSpeed(5000).toFixed(2) + ' / ' + C.fallTime(5000).toFixed(2));
  ok('v = g t for the fall', near(C.fallSpeed(1234), C.G_M*C.fallTime(1234), 1e-9));
  const r1 = C.altFilter(5, 2, 0.03, 305), r2 = C.altFilter(0.5, 2, 0.03, 305);
  ok('step above threshold is rejected and becomes the altitude error', r1.rejected && r1.err === 5000 && near(r1.impact, 127.28, 0.01));
  ok('step below threshold is accepted (no error, no fall)', !r2.rejected && r2.err === 0 && r2.impact === 0);
  ok('3 % reserve hovers ≈ 56 s at 305 s', near(r1.hover, 56.2, 0.1), r1.hover.toFixed(2));
  // CH5 — ellipse
  ok('3σ ellipse holds 98.9 % of a 2-D Gaussian', near(C.inK(3), 0.98889, 0.00001), C.inK(3).toFixed(5));
  ok('Chandrayaan-3 box 4 × 2.4 km ↔ 3σ along 666.7 m, cross 0.6 ×', near(6*666.6667, 4000, 0.01) && near(6*666.6667*C.CROSS, 2400, 0.01));
  ok('synthetic field: 6,000 craters ≤ 500 m, target kept 40 m clear', C.CRATERS.length === 6000 && C.CRATERS.every(c => c.r <= 250 && Math.hypot(c.x, c.y) >= c.r + C.CLEAR));
  ok('hazard cover of the field 5–20 % (illustrative density)', C.hazFraction() > 0.05 && C.hazFraction() < 0.2, C.hazFraction().toFixed(4));
  const eBox = C.ellipseRisk(666.6667, 0), eGoal = C.ellipseRisk(33.3333, 0), eHit = C.ellipseRisk(3.3333, 0), eDiv = C.ellipseRisk(666.6667, 150);
  ok('pinpoint (3σ = 10 m) never lands on a hazard', eHit.p === 0);
  ok('risk falls as the ellipse shrinks: box > 100 m goal > 10 m', eBox.p > eGoal.p && eGoal.p > eHit.p, eBox.p.toFixed(3) + ' > ' + eGoal.p.toFixed(3));
  ok('a 150 m divert cuts the box risk at least tenfold', eDiv.pDivert*10 < eBox.p, eDiv.pDivert.toFixed(4));
  ok('off-field points are treated as unsafe', C.hazAt(4000, 0) === 1 && C.hazAt(0, 0) === 0);
  // CH6 — tip-over
  ok('flat ground: static tip at atan(b/h); b = h → 45°', near(C.staticTip(1, 1), 45, 1e-9));
  ok('at the static limit the critical speed is zero', near(C.vCrit(2, 1, C.staticTip(2, 1) + 1e-6), 0, 1e-6) && C.vCrit(2, 1, C.staticTip(2, 1) - 1) > 0);
  ok('flat ground formula: v = (L/h)√(2g(L−h))', near(C.vCrit(1, 1.75, 0), Math.hypot(1, 1.75)*Math.sqrt(2*C.G_M*(Math.hypot(1, 1.75) - 1)), 1e-9));
  ok('energy check: ½ v² (z₀/L)² = g (L − z₀) at v_crit on 10°', (() => { const g = C.tipGeom(2.15, 1.3, 10), v = C.vCrit(2.15, 1.3, 10); return near(0.5*v*v*(g.rz/g.L)**2, C.G_M*(g.L - g.rz), 1e-9); })());
  ok('wider stance and lower CoM raise the critical speed; slope lowers it', C.vCrit(1, 1.75, 0) > C.vCrit(2.15, 1.3, 0) && C.vCrit(2.15, 1.3, 10) < C.vCrit(2.15, 1.3, 0));
  ok('illustrative tall lander on 10° tips at IM-1\'s 2 mph; low-wide one does not', C.vCrit(2.15, 1.3, 10) < 0.89 && C.vCrit(1, 1.75, 10) > 0.89, C.vCrit(2.15, 1.3, 10).toFixed(3) + ' / ' + C.vCrit(1, 1.75, 10).toFixed(3));
  ok('2 mph = 0.89 m/s; 6 mph = 2.7 m/s [19]', near(2*C.MPH, 0.894, 0.001) && near(6*C.MPH, 2.68, 0.01));
  ok('LM: 10 ft/s = 3.05 m/s, 4 ft/s = 1.22 m/s, 167 in = 4.24 m [21]', near(10*C.FT, 3.048, 1e-9) && near(4*C.FT, 1.2192, 1e-9) && near(167*0.0254, 4.24, 0.002));
  ok('Apollo 11 horizontal 2.1 & 1.7 ft/s → 0.82 m/s combined [21]', near(Math.hypot(2.1, 1.7)*C.FT, 0.82, 0.005), (Math.hypot(2.1, 1.7)*C.FT).toFixed(4));
  // CH7 — scorecard
  const t = C.tally(C.ATTEMPTS);
  ok('14 missions listed, sorted by date', C.ATTEMPTS.length === 14 && C.ATTEMPTS.every((a, i, A) => !i || A[i - 1].d <= a.d));
  ok('outcomes: 5 upright, 3 down-not-upright, 5 crashed, 1 never arrived', t.up === 5 && t.side === 3 && t.crash === 5 && t.none === 1, JSON.stringify(t));
  ok('7 government, 7 private ("half of them private missions")', C.ATTEMPTS.filter(a => a.who === 'gov').length === 7);
  ok('private: one upright (Blue Ghost M1) of six arrivals', (() => { const p = C.ATTEMPTS.filter(a => a.who === 'priv'), c = C.tally(p); return c.up === 1 && p.length - c.none === 6 && p.find(a => a.out === 'up').en === 'Blue Ghost M1'; })());
  ok('government: China three of three upright', C.ATTEMPTS.filter(a => /Chang/.test(a.en)).every(a => a.out === 'up') && C.ATTEMPTS.filter(a => /Chang/.test(a.en)).length === 3);
  ok('last attempt 5 June 2025 → 525 days to 12 Nov 2026', C.daysBetween('2025-06-05', C.AS_OF) === 525 && C.ATTEMPTS[13].d === '2025-06-05');
  ok('every scorecard row cites a reference within range', C.ATTEMPTS.every(a => { const n = [...(a.t[0] + a.t[1]).matchAll(/\[(\d+)\]/g)].map(m => +m[1]); return n.length > 0 && n.every(k => k >= 1 && k <= C.REFERENCES.length); }));
  ok('Luna-25: burn 127 s vs 84 s planned (43 s over) [10]', 127 - 84 === 43);
  ok('SLIM: 0:20 JST 20 Jan = 15:20 UTC 19 Jan', Date.UTC(2024, 0, 20, 0, 20) - 9*3600e3 === Date.UTC(2024, 0, 19, 15, 20) && C.ATTEMPTS.find(a => a.en === 'SLIM').d === '2024-01-19');
  ok('Chang\'e 6: 06:23 Beijing 2 Jun = 22:23 UTC 1 Jun', Date.UTC(2024, 5, 2, 6, 23) - 8*3600e3 === Date.UTC(2024, 5, 1, 22, 23));
  // review panel (2026-11-12)
  ok('scorecard starts with Chang\'e 4 (landed 3 Jan 2019) and the intro says it launched in 2018', C.ATTEMPTS[0].d === '2019-01-03' && /already on its way/.test(d.querySelector('#ch7').innerHTML) && /2018/.test(d.querySelector('#ch7').innerHTML));
  ok('no scorecard row predates January 2019 or postdates AS_OF', C.ATTEMPTS.every(a => a.d >= '2019-01-01' && a.d <= C.AS_OF));
  ok('SLIM "upside down" is hedged (AP: "appears"), never stated bare', /apparently upside down/.test(C.ATTEMPTS.find(a => a.en === 'SLIM').t[0]) && !/ended upside down|landed upside down/.test(d.querySelector('main').innerHTML));
  ok('Athena: 17:30 UTC 6 Mar → 06:15 UTC 7 Mar = 12 h 45 min ("about 13 hours") [25][26]', (Date.UTC(2025, 2, 7, 6, 15) - Date.UTC(2025, 2, 6, 17, 30))/3600e3 === 12.75);
  ok('Odysseus 6 mph and 2 mph → 2.7 and 0.9 m/s [19]', near(6*0.44704, 2.7, 0.03) && near(2*0.44704, 0.9, 0.02));
  // UI
  let bad = 0;
  ['ru', 'en'].forEach(l => { lang(l); [...d.querySelectorAll('main .btn')].forEach(b => { b.click(); if(/NaN|undefined|Infinity/.test(d.querySelector('main').textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  ok('sliders have aria-valuetext', [...d.querySelectorAll('main input[type=range]')].every(r => (r.getAttribute('aria-valuetext') || '').length > 2));
  ok('every chart has a translated aria-label', (() => { lang('ru'); const ru = [...d.querySelectorAll('svg.sim-svg')].every(s => /[а-я]/.test(s.getAttribute('aria-label'))); lang('en'); return ru && [...d.querySelectorAll('svg.sim-svg')].every(s => /[a-z]/.test(s.getAttribute('aria-label'))); })());
  ok('no Latin units in Russian readouts', (() => { lang('ru'); const t = [...d.querySelectorAll('.readout-grid')].map(e => e.textContent).join(' '); lang('en'); return !/\d (km|m\/s|m|s|kg)\b/.test(t); })());
  ok('scorecard table has 14 rows and filters to 7 private', (() => { d.querySelector('#scPre .btn[data-w="all"]').click(); const n = d.querySelectorAll('#scTable tbody tr').length; d.querySelector('#scPre .btn[data-w="priv"]').click(); const p = d.querySelectorAll('#scTable tbody tr').length; d.querySelector('#scPre .btn[data-w="all"]').click(); return n === 14 && p === 7; })());
  ok('tip preset that sets only speed keeps the geometry', (() => { d.querySelector('#tpPre .btn[data-h="2.15"]').click(); d.querySelector('#tpPre .btn[data-v="0.89"]').click(); return d.getElementById('tpH').value === '2.15' && d.getElementById('tpV').value === '0.89'; })());
  ok('Apollo preset puts the slider at exactly 15.24 km', (() => { d.querySelector('#dbPre .btn[data-p="apollo"]').click(); return near(+d.getElementById('dbP').value, 15.24, 1e-9); })());
  console.log(out.join('\n'));
};
