module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document;
  // CH1 — the discovery
  ok('Lunar Orbiter: 50 mm/s on 2 × 10⁶ mm/s = one part in 40,000 [2]', near(2e6/50, 40000, 0));
  ok('Moon mass × G matches the GRAIL GM within 0.1 % (fact sheet [20], CODATA [21], PDS [17])', near(C.gmKg(C.M_MOON)/C.GM_M, 1, 1e-3), (C.gmKg(C.M_MOON)/C.GM_M).toFixed(5));
  ok('mean surface gravity ≈ 1.62 m/s² = 162,000 mGal [20]', near(C.G_SURF*1e3, 1.62, 0.005) && near(C.G_SURF*1e8, 162000, 1000), (C.G_SURF*1e8).toFixed(0));
  // CH2 — buried mass
  const gmA = C.gmKg(C.AESTUUM.m), pA = C.dgPoint(gmA, 100, 0, 0);
  ok('Apollo 8 point mass 5 × 10⁻⁶ Moons at 100 km → about 250 mGal at the surface (Murphy & Siry [3]); text says 245', near(pA, 250, 25) && near(pA, 245, 0.5), pA.toFixed(1));
  ok('245 mGal is about 0.15 % of lunar gravity', near(pA/(C.G_SURF*1e8)*100, 0.15, 0.005), (pA/(C.G_SURF*1e8)*100).toFixed(3));
  ok('half height at x = 0.766 (d + h)', near(C.halfWidth(100, 55)/155, 0.766, 0.0005) && near(C.dgPoint(gmA, 100, 55, C.halfWidth(100, 55))/C.dgPoint(gmA, 100, 55, 0), 0.5, 1e-9));
  ok('anomaly weakens and widens with altitude', C.dgPoint(gmA, 20, 100, 0) < C.dgPoint(gmA, 20, 23, 0) && C.halfWidth(20, 100) > C.halfWidth(20, 23));
  // CH3 — the field and the orbits
  const c20 = C.CNM[0][2]*Math.sqrt(5);
  ok('GRGM1200A J₂ (unnormalised −C₂₀) = 203.2 × 10⁻⁶ vs fact sheet 202.7 × 10⁻⁶ (tide-free vs. with tide; within 0.6)', near(-c20*1e6, 202.7, 0.6), (-c20*1e6).toFixed(2));
  ok('coefficient table complete to degree 30 (2 ≤ n ≤ 30)', C.CNM.length === 493 && C.CNM[492][0] === 30 && C.CNM[492][1] === 30);
  const f0 = C.makeField(0)(1838, 0, 0), f2 = C.makeField(2);
  ok('degree-0 field = GM/r²', near(-f0[0], C.GM_M/1838/1838, 1e-15) && Math.abs(f0[1]) < 1e-18);
  const a30 = C.makeField(30)(0, 0, 1900), a2p = f2(0, 0, 1900);
  ok('over the pole the degree-2 field pulls almost straight down', Math.abs(a2p[0]) < 1e-9 && Math.abs(a2p[1]) < 1e-9 && a2p[2] < 0);
  ok('degree-30 field at 162 km differs from a point mass by < 0.1 %', near(Math.hypot(...a30)/(C.GM_M/1900/1900), 1, 1e-3), (Math.hypot(...a30)/(C.GM_M/1900/1900)).toFixed(6));
  ok('PFS-2: 24 April → 29 May 1972 = 35 days [6]; NSSDC 34 days [5]', (Date.UTC(1972, 4, 29) - Date.UTC(1972, 3, 24))/864e5 === 35);
  const sc = C.PFS2_SCAN, med = C.median(sc);
  ok('model PFS-2 (90 × 130 km, 10° retrograde): every one of 32 orientations hits the Moon within a year', sc.length === 32 && sc.every(x => x > 0 && x < 365));
  ok('model PFS-2 median impact day within 5 days of the real 35 [6]', near(med, 35, 5), med);
  ok('model PFS-2 range spans the real 34–35 days', Math.min(...sc) < 34 && Math.max(...sc) > 35, Math.min(...sc) + '–' + Math.max(...sc));
  ok('strip has 181 inclinations', C.STRIP.length === 181);
  C.FROZEN.forEach(i => ok('frozen inclination ' + i + '° [6]: a 100 km model orbit within ±1° survives a year', [i - 1, i, i + 1].some(j => C.STRIP[j] === 0), [i - 1, i, i + 1].map(j => C.STRIP[j]).join('/')));
  ok('between the bands orbits fall: 10° → ' + C.STRIP[10] + ' d, 40° → ' + C.STRIP[40] + ' d, 62° → ' + C.STRIP[62] + ' d', C.STRIP[10] > 0 && C.STRIP[10] < 20 && C.STRIP[40] > 25 && C.STRIP[40] < 45 && C.STRIP[62] > 0);
  const t0 = Date.now();
  const live40 = C.lifetime({hp:100, ha:100, i:40, O:0, w:0}, 30, 365), live10 = C.lifetime({hp:100, ha:100, i:10, O:0, w:0}, 30, 365);
  ok('live integration reproduces the stored strip at 40° and 10° (±0.1 day)', near(live40.crash, C.STRIP[40], 0.1) && near(live10.crash, C.STRIP[10], 0.1), live40.crash.toFixed(2) + ' / ' + live10.crash.toFixed(2));
  const live27 = C.lifetime({hp:100, ha:100, i:27, O:0, w:0}, 30, 365);
  ok('live 27° orbit survives the year, lowest point stays above 40 km', live27.crash === null && live27.minAlt > 40, live27.minAlt.toFixed(1));
  const smooth = C.lifetime({hp:90, ha:130, i:170, O:0, w:0}, 2, 120);
  ok('same PFS-2 orbit in a smooth degree-2 Moon survives 120 days', smooth.crash === null && smooth.minAlt > 60, smooth.minAlt.toFixed(1));
  const pfs1 = C.lifetime({hp:102, ha:139, i:28.5, O:0, w:0}, 30, 365);
  ok('PFS-1 preset survives the model year (note says the real one did not; stated as a limitation)', pfs1.crash === null, pfs1.minAlt.toFixed(1));
  // review panel 2026-11-12: responsiveness and honest model limits
  const piece = C.orbitRun({hp:90, ha:130, i:170, O:0, w:0}, 30); let tp = Date.now(); for(let k = 0; k < 10; k++) piece.advance(C.LF_PIECE_DAYS); tp = (Date.now() - tp)/10;
  ok('one ' + C.LF_PIECE_DAYS + '-day piece of the degree-30 run is far below a frame budget here (' + tp.toFixed(1) + ' ms), so a slow phone still yields every frame', tp < C.LF_BUDGET_MS/2 && piece.t > 0.99 && piece.t < 1.01);
  const pw = C.orbitRun({hp:90, ha:130, i:170, O:0, w:0}, 30); let guard = 0; while(!pw.advance(C.LF_PIECE_DAYS) && pw.t < 365 && guard++ < 5000);
  ok('PFS-2 run cut into 0.1-day pieces gives the same impact day as the stored scan (' + C.PFS2_SCAN[0] + ' d)', pw.crash !== null && near(pw.crash, C.PFS2_SCAN[0], 0.1), pw.crash && pw.crash.toFixed(2));
  ok('PFS-1 preset is recognised for the "limit of the model" status', C.isPFS1({i:28.5, hp:102, ha:139}) && !C.isPFS1({i:27, hp:100, ha:100}));
  ok('orbit integrations ran (' + (Date.now() - t0) + ' ms)', true);
  // CH4 — GRAIL
  const P55 = 2*Math.PI*Math.sqrt(Math.pow(C.R_M + 55, 3)/C.GM_M)/60;
  ok('55 km circular orbit: period 113.5 min vs NSSDC 113 min [10]', near(P55, 113, 1), P55.toFixed(2));
  ok('speed at 55 km 1.65 km/s; 13 km passes in about eight seconds', near(C.vCirc(55), 1.654, 0.001) && near(13/C.vCirc(55), 8, 0.2), (13/C.vCirc(55)).toFixed(2));
  ok('10 September → 31 December 2011 = 112 days', (Date.UTC(2011, 11, 31) - Date.UTC(2011, 8, 10))/864e5 === 112);
  ok('impacts 2:28:51 and 2:29:21 p.m. PST = thirty seconds apart [15]', (14*3600 + 29*60 + 21) - (14*3600 + 28*60 + 51) === 30);
  // CH5 — range rate
  const v55 = C.vCirc(55);
  ok('range-rate signal is antisymmetric about the mass', [10, 80, 200].every(x => near(C.rangeRate(gmA, 155, 200, v55, x), -C.rangeRate(gmA, 155, 200, v55, -x), 1e-9)));
  ok('range-rate signal scales linearly with mass', near(C.rrPeak(2*gmA, 155, 200, v55)/C.rrPeak(gmA, 155, 200, v55), 2, 1e-9));
  const gmS = C.gmKg(1e15), num = C.rangeRateNumeric(gmS, 5, 55, 100), pkNum = Math.max(...num.map(p => Math.abs(p.rr))), pkF = C.rrPeak(gmS, 60, 100, v55);
  ok('first-order formula matches full 2-D integration within 15 % (10¹⁵ kg at 5 km, 55 km up, 100 km apart)', near(pkNum/pkF, 1, 0.15), pkF.toFixed(2) + ' vs ' + pkNum.toFixed(2) + ' µm/s');
  const pkA = C.rrPeak(gmA, 155, 200, v55);
  ok('Apollo 8 mascon at 55 km is thousands of times above the 0.05 µm/s noise', pkA/C.KBR_NOISE > 1000, pkA.toFixed(0) + ' µm/s');
  ok('10¹³ kg at 5 km is detectable at 55 km; 10¹⁰ kg at 2 km is below the noise (presets)', C.rrPeak(C.gmKg(1e13), 60, 200, v55) > C.KBR_NOISE && C.rrPeak(C.gmKg(1e10), 57, 200, v55) < C.KBR_NOISE);
  ok('GRAIL 0.05 µm/s vs Lunar Orbiter 50 mm/s: a million times finer [2][11]', near(C.LO_SIGNAL/C.KBR_NOISE, 1e6, 1));
  // CH6 — degree and altitude
  [[420, 13, 0.1], [100, 54, 1], [150, 36, 0.5], [60, 90, 1.1], [80, 68, 0.5], [320, 17, 0.1], [1800, 3, 0.05]].forEach(r => ok('degree ' + r[0] + ' → ' + r[1] + ' km block [11]', near(C.blockKm(r[0]), r[1], r[2]), C.blockKm(r[0]).toFixed(2)));
  ok('degree 420 weakens e-fold in about 4 km of altitude', near(C.eFoldKm(420), 4, 0.15), C.eFoldKm(420).toFixed(2));
  ok('attenuation: 1 at the surface, falls with degree and altitude', C.atten(420, 0) === 1 && C.atten(420, 55) < C.atten(420, 23) && C.atten(900, 23) < C.atten(420, 23));
  ok('power law 2.5 × 10⁻⁴ l⁻² at l = 100', near(C.kaula(100), 2.5e-8, 1e-15));
  // CH7 — crust
  ok('2πGρ at 2,550 kg/m³ = 107 mGal per km', near(C.bouguerPerKm(2550), 107, 0.5), C.bouguerPerKm(2550).toFixed(2));
  ok('12 % porosity at 2,550 kg/m³ ↔ grain density ≈ 2,900 kg/m³', near(2550/0.88, 2900, 5) && near(C.porosity(2550, 2900), 0.12, 0.002));
  ok('1968 → 2025 = fifty-seven years (legacy heading)', 2025 - 1968 === 57);
  ok('timeline 10 entries, references ≥ 18', C.TIMELINE.length === 10 && C.REFERENCES.length >= 18, C.REFERENCES.length);
  // UI
  ok('filled spans: period, PFS-2 range, Bouguer', /113,?\.?5/.test(d.getElementById('eqP').textContent) && /\d/.test(d.getElementById('pfsMed').textContent) && d.getElementById('eqBg').textContent === '107', d.getElementById('eqP').textContent + ' · ' + d.getElementById('pfsMed').textContent);
  let bad = 0;
  ['ru', 'en'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); [...d.querySelectorAll('main .btn')].forEach(b => { b.click(); if(/NaN|undefined|Infinity/.test(d.querySelector('main').textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  ok('no Latin km / mGal in Russian readouts', (() => { d.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = [...d.querySelectorAll('.readout-grid, .status')].map(e => e.textContent).join(' '); d.querySelector('#langtoggle button[data-lang="en"]').click(); return !/\d km|mGal|µm\/s/.test(t); })());
  ok('orbit status (aria-live) shows no running day count while integrating', !/\d/.test(d.getElementById('lfStatus').textContent) || /\d/.test(d.getElementById('lfStatus').textContent) && !/…/.test(d.getElementById('lfStatus').textContent), d.getElementById('lfStatus').textContent.slice(0, 40));
  ok('lede and ch3 text keep the model limits visible: PFS-1 real fall and the < 3° band', /January 1973/.test(d.getElementById('ch3').textContent) && /below about 3°/.test(d.getElementById('ch3').textContent));
  ok('every slider has aria-valuetext', [...d.querySelectorAll('input[type=range]')].every(r => (r.getAttribute('aria-valuetext') || '').length > 0));
  ok('every chart has a translated aria-label', [...d.querySelectorAll('svg.sim-svg')].every(s => s.getAttribute('data-aria-en') && s.getAttribute('data-aria-ru') && s.getAttribute('aria-label')));
  console.log(out.join('\n'));
};
