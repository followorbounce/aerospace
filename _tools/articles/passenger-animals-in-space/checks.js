module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document;
  // CH1
  const ff = C.freeFallMin(110, 60);
  ok('free fall above 60 km on a 110 km arc ≈ 3.4 min', near(ff, 3.4, 0.1), ff.toFixed(2));
  ok('Albert II 83 miles = 134 km', near(83*C.SMI/1000, 134, 0.5), (83*C.SMI/1000).toFixed(1));
  // CH2 — Sputnik 2
  const p2 = C.periodMin(212, 1660);
  ok('Sputnik 2 period from 212 × 1,660 km = 103.7 min (NSSDCA)', near(p2, 103.7, 0.2), p2.toFixed(2));
  const kw = C.kleiberW(6);
  ok('Kleiber resting heat of a 6 kg mammal ≈ 13 W', near(kw, 13.0, 0.3), kw.toFixed(2));
  ok('heat capacity 30 kJ/°C ≥ a 6 kg dog (≈ 21 kJ/°C)', C.HEAT.C >= 6*3470, C.HEAT.C);
  const fl = C.heatRun('flown', 1.5, 25, 10);
  ok('MUST: as flown, cabin passes 40 °C inside the 4th orbit (5.19–6.92 h)', fl.cross > 3*p2/60 && fl.cross <= 4*p2/60, fl.cross.toFixed(2) + ' h');
  ok('as flown, orbit number at 40 °C = 4', C.orbitAt(fl.cross) === 4, C.orbitAt(fl.cross));
  ok('as flown, above 40 °C by the end of the 5–7 h window', fl.T7 > 40, fl.T7.toFixed(1));
  const al = C.heatRun('alone', 2.6, 25, 10);
  ok('satellite alone stays below 25 °C for 10 h', al.cross === null && Math.max(...al.pts.map(p => p[1])) < 25, Math.max(...al.pts.map(p => p[1])).toFixed(1));
  ok('equilibrium formula Teq = Ts + Q̄/UA (as flown 52.7 °C)', near(fl.Teq, 0 + (25 + 15 + 60*0.65)/1.5, 1e-9) && near(fl.Teq, 52.7, 0.1), fl.Teq.toFixed(2));
  ok('model settles to its equilibrium (orbit-mean at 60 h within 1 °C)', (() => { const r = C.heatRun('flown', 1.5, 25, 60); const last = r.pts.filter(p => p[0] > 60 - p2/60); const m = last.reduce((s, p) => s + p[1], 0)/last.length; return near(m, r.Teq, 1); })());
  const rest = C.heatRun('flown', 1.5, kw, 10);
  ok('a resting dog only delays 40 °C, equilibrium still above 40 °C', rest.cross > fl.cross && rest.Teq > 40, rest.Teq.toFixed(1));
  ok('τ = C/UA as flown = 5.6 h', near(fl.tau, 5.56, 0.01), fl.tau.toFixed(2));
  // CH3 — Korabl-Sputnik 2
  const p3 = C.periodMin(306, 339);
  ok('Korabl-Sputnik 2 period from 306 × 339 km ≈ 90.6 min (within 0.5)', near(p3, 90.6, 0.5), p3.toFixed(2));
  const orbs = (26*60 + 23)/p3;
  ok('1 d 2 h 23 min = 17–18 orbits', orbs > 17 && orbs < 18, orbs.toFixed(2));
  // CH4 — ballistic model
  ok('Shepard cutoff 7,388 ft/s = 2,252 m/s', near(C.SHEPARD_V, 2252, 1), C.SHEPARD_V.toFixed(1));
  ok('Ham 5,857 mph = 2,618 m/s', near(C.HAM_V, 2618, 1), C.HAM_V.toFixed(1));
  ok('MR-2 apogee 136.2 nmi = 252 km; range 363 nmi = 672 km', near(C.MR2.apo, 252.2, 0.3) && near(C.MR2.rng, 672.3, 0.3), C.MR2.apo.toFixed(1) + ' / ' + C.MR2.rng.toFixed(1));
  ok('MR-3 116.5 mi = 187.5 km, 302 mi = 486 km', near(C.MR3.apo, 187.5, 0.2) && near(C.MR3.rng, 486.0, 0.2));
  const s = C.fly(C.SHEPARD_V, 50), h = C.fly(C.HAM_V, 50);
  ok('calibration: Shepard apogee within 2 % of 187.5 km', Math.abs(s.apo/C.MR3.apo - 1) < 0.02, s.apo.toFixed(1));
  ok('calibration: Shepard range within 2 % of 486 km', Math.abs(s.rng/C.MR3.rng - 1) < 0.02, s.rng.toFixed(1));
  ok('independent: Shepard peak within 0.5 g of 11.0 g', near(s.peak, 11.0, 0.5), s.peak.toFixed(2));
  ok('independent: Shepard peak altitude near 83,000 ft (25.3 km ± 4)', near(s.hPeak, C.MR3.hPeak, 4), s.hPeak.toFixed(1) + ' km');
  ok('independent: Shepard weightless ≈ 5 min (± 0.6)', near(s.wt, 5, 0.6), s.wt.toFixed(2));
  ok('MUST: Ham apogee within 5 % of 252 km', Math.abs(h.apo/C.MR2.apo - 1) < 0.05, h.apo.toFixed(1));
  ok('MUST: Ham range within 2 % of 672 km', Math.abs(h.rng/C.MR2.rng - 1) < 0.02, h.rng.toFixed(1));
  ok('MUST: Ham peak re-entry load within 0.2 g of 14.6 g', near(h.peak, 14.6, 0.2), h.peak.toFixed(2));
  ok('Ham weightless ≈ 6½ min (± 0.3)', near(h.wt, 6.5, 0.3), h.wt.toFixed(2));
  ok('faster cutoff → higher, longer, harder (monotonic 2,000 → 2,252 → 2,618 m/s)', (() => { const a = C.fly(2000, 50); return a.apo < s.apo && s.apo < h.apo && a.peak < s.peak && s.peak < h.peak && a.rng < s.rng && s.rng < h.rng; })());
  const rat = [2000, C.SHEPARD_V, C.HAM_V, 2900].map(v => { const r = C.fly(v, 50); return C.allenEggersG(r.entry.v, r.entry.gam)/r.peak; });
  ok('Allen–Eggers at 80 km is 20–35 % low for Shepard and Ham (gravity ignored)', rat[1] > 0.65 && rat[1] < 0.8 && rat[2] > 0.65 && rat[2] < 0.8, rat.map(x => x.toFixed(2)).join(' '));
  ok('Allen–Eggers gap narrows as the speed rises', rat[0] < rat[1] && rat[1] < rat[2] && rat[2] < rat[3]);
  ok('scale height 30–40 km = 6.6 km', near(C.SCALE_H, 6.55, 0.05), C.SCALE_H.toFixed(3));
  ok('1976 atmosphere: density at 0 km 1.225, interpolation continuous at 40 km', C.rho(0) === 1.225 && near(C.rho(39999.9), C.rho(40000.1), 1e-6));
  const hh = C.fly(C.HAM_V, 50, 245); ok('time step converged (peak g, dt 0.02 s, repeatable)', near(hh.peak, h.peak, 1e-12));
  // review additions (2026-10-23)
  const gr = C.fly(7540*C.FT, 50);
  ok('review: Ham fed the ground-relative 7,540 ft/s as if inertial gives ≈ 11.6 g (as the note says)', near(gr.peak, 11.6, 0.15), gr.peak.toFixed(2));
  const b150 = C.fly(C.HAM_V, 50, 150), b400 = C.fly(C.HAM_V, 50, 400);
  ok('review: Ham peak for β 150 / 400 kg/m² ≈ 13.2 / 15.6 g (as the note says)', near(b150.peak, 13.2, 0.15) && near(b400.peak, 15.6, 0.15), b150.peak.toFixed(2) + ' / ' + b400.peak.toFixed(2));
  ok('review: ground-relative 7,540 ft/s + Earth rotation at the Cape ≈ 2,600 m/s inertial (within 2 % of 5,857 mph)', (() => { const v = 7540*C.FT, om = 465.1*Math.cos(28.5*Math.PI/180), g = 45*Math.PI/180, az = 105*Math.PI/180, vh = v*Math.cos(g); const vi = Math.hypot(vh*Math.sin(az) + om, vh*Math.cos(az), v*Math.sin(g)); return Math.abs(vi/C.HAM_V - 1) < 0.02; })());
  ok('review: Korabl-Sputnik 2 marked "some died" (28 of 40 mice) in the matrix', C.FLIGHTS.find(f => f.n[0] === 'Korabl-Sputnik 2').o === 'mixed' && /28 of the 40 mice/.test(C.FLIGHTS.find(f => f.n[0] === 'Korabl-Sputnik 2').d[0]) && /28 of the 40 mice/.test(d.getElementById('ch3').textContent));
  d.querySelector('#hCfg .btn[data-c="flown"]').click(); d.querySelector('#hDogPre .btn[data-w="25"]').click();
  ok('review: heat chart is labelled as a model, not telemetry', /not telemetry/.test(d.getElementById('heatSvg').textContent) && /In this model/.test(d.getElementById('heatStatus').textContent));
  d.getElementById('bV').value = 1800; d.getElementById('bG').value = 30; d.getElementById('bV').dispatchEvent(new w.Event('input'));
  ok('review: arc below 80 km shows no Allen–Eggers entry value', /apogee below 80 km/.test(d.getElementById('balReadout').textContent), d.getElementById('balReadout').textContent.slice(-60));
  d.getElementById('bV').value = 2900; d.getElementById('bG').value = 70; d.getElementById('bV').dispatchEvent(new w.Event('input'));
  ok('review: steepest, fastest arc stays inside the trajectory chart', (() => { const p = d.querySelector('#balSvg path').getAttribute('d'); return !/,-/.test(p); })());
  d.querySelector('#bPre .btn[data-v="ham"]').click();
  // CH5 — MA-5
  const p5 = C.periodMin(99.5*C.SMI/1000, 147.4*C.SMI/1000);
  ok('MA-5 period from 99.5 × 147.4 statute miles ≈ 88 min 26 s (± 0.3 min)', near(p5, 88 + 26/60, 0.3), p5.toFixed(2));
  // CH7 — matrix
  ok('matrix has 14 flights × 7 questions', C.FLIGHTS.length === 14 && C.FLIGHTS.every(f => f.q.length === 7));
  ok('every death in the guide is labelled (Albert II, Laika, KS-3 died; Félicette killed)', ['Albert II, V-2', 'Sputnik 2', 'Korabl-Sputnik 3'].every(n => C.FLIGHTS.find(f => f.n[0] === n).o === 'died') && C.FLIGHTS.find(f => f.w[0].indexOf('Félicette') === 0).o === 'killed');
  const q7 = d.querySelector('#mxQ .btn[data-q="6"]'); q7.click(); if(q7.getAttribute('aria-pressed') !== 'true') q7.click();
  ok('Q7 (beyond Earth orbit): first answered by Zond 5', /Zond 5/.test(d.getElementById('mxStatus').textContent), d.getElementById('mxStatus').textContent);
  q7.click();
  d.querySelector('#mxTable .mx-row[data-k="3"]').click();
  ok('selecting Sputnik 2 shows its detail', /Laika/.test(d.getElementById('mxDetail').textContent));
  // text consistency
  const txtAll = d.querySelector('main').textContent;
  ok('Gazenko 1998 quote present with ref [28]', /We did not learn enough from this mission to justify the death of the dog/.test(txtAll) && /\[28\]/.test(d.getElementById('ch7').textContent));
  ok('lede counts nine chapters', /Nine chapters/.test(d.querySelector('.lede').textContent) && d.querySelectorAll('section[id^="ch"]').length === 9);
  ok('28 references rendered', d.querySelectorAll('#refList .ref-item').length === 28, d.querySelectorAll('#refList .ref-item').length);
  ['hUA', 'hDog', 'bV', 'bG'].forEach(id => { const el = d.getElementById(id), vt = el.getAttribute('aria-valuetext') || '';
    ok('aria-valuetext on ' + id + ' mirrors its readout', vt.length > 0 && vt.indexOf(d.getElementById(id + 'Val').textContent) === 0, vt); });
  d.querySelector('#bPre .btn[data-v="shepard"]').click();
  ok('Shepard preset sets 2,252 m/s', /^2,252 m\/s/.test(d.getElementById('bVVal').textContent), d.getElementById('bVVal').textContent);
  d.querySelector('#bPre .btn[data-v="ham"]').click();
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('RU: readouts in Russian units (км, мин)', /км/.test(d.getElementById('balReadout').textContent) && /ч/.test(d.getElementById('heatReadout').textContent));
  ok('RU: decimal comma in the heat readout', /\d,\d/.test(d.getElementById('heatReadout').textContent), d.getElementById('heatReadout').textContent.slice(0, 60));
  let latin = 0; ['heatReadout', 'balReadout', 'heatStatus', 'balStatus', 'mxStatus', 'mxDetail', 'timeline'].forEach(id => { if(/\d (km|min|h)\b/.test(d.getElementById(id).textContent)) latin++; });
  ok('RU: no Latin units after numbers in rendered Russian', latin === 0, latin);
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  console.log(out.join('\n'));
};
