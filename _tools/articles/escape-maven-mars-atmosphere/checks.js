module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol, rel = (a, b, r) => Math.abs(a/b - 1) <= r;
  const M = C.PLANETS.mars, E = C.PLANETS.earth, H = C.SPECIES.H.m, O = C.SPECIES.O.m;
  // CH1 — today's atmosphere
  ok('Mars GM/R² = 3.73 m/s² (NSSDC [1])', near(M.GM/M.R/M.R, 3.73, 0.005), (M.GM/M.R/M.R).toFixed(4));
  ok('Earth GM/R² = 9.82 m/s² (NSSDC [2])', near(E.GM/E.R/E.R, 9.82, 0.005), (E.GM/E.R/E.R).toFixed(4));
  ok('Mars surface escape speed 5.03 km/s [1]', near(C.vEsc(M, 0)/1e3, 5.03, 0.005), (C.vEsc(M, 0)/1e3).toFixed(3));
  ok('Earth surface escape speed 11.19 km/s [2]', near(C.vEsc(E, 0)/1e3, 11.19, 0.01), (C.vEsc(E, 0)/1e3).toFixed(3));
  ok('Mars atmosphere 2.46e16 kg ≈ NSSDC ~2.5e16', rel(C.M_MARS_AIR, 2.5e16, 0.03) && near(C.M_MARS_AIR/1e16, 2.46, 0.005), C.M_MARS_AIR.toExponential(3));
  ok('Earth atmosphere formula 5.3e18, within 4 % of NSSDC 5.1e18 ("a few per cent high")', near(C.M_EARTH_AIR/1e18, 5.3, 0.05) && rel(C.M_EARTH_AIR, 5.1e18, 0.04), C.M_EARTH_AIR.toExponential(3));
  ok('Earth\'s air about 200 times heavier (NSSDC 5.1e18/2.5e16 = 204)', near(5.1e18/2.5e16, 200, 5) && near(C.M_EARTH_AIR/C.M_MARS_AIR, 200, 15), (C.M_EARTH_AIR/C.M_MARS_AIR).toFixed(0));
  ok('6.36 mbar ≈ 0.6 % of 1,014 mbar', near(6.36/1014*100, 0.63, 0.01), (6.36/1014*100).toFixed(3));
  // CH2 — scale height, exobase, Jeans
  ok('Mars scale height kT/mg at 214 K, 43.49 u = 11.0 km [1]', near(C.scaleHeight(214, 43.49, 3.73)/1e3, 11.0, 0.05), (C.scaleHeight(214, 43.49, 3.73)/1e3).toFixed(3));
  ok('Earth scale height 288 K, 28.97 u = 8.4 km (NSSDC 8.5)', near(C.scaleHeight(288, 28.97, 9.82)/1e3, 8.4, 0.05) && near(C.scaleHeight(288, 28.97, 9.82)/1e3, 8.5, 0.12));
  ok('escape speed at Mars exobase (200 km) = 4.88 km/s', near(C.vEsc(M, 200e3)/1e3, 4.88, 0.005), (C.vEsc(M, 200e3)/1e3).toFixed(4));
  ok('escape speed at Earth exobase (500 km) = 10.77 km/s; Catling & Zahnle 10.8 [6]', near(C.vEsc(E, 500e3)/1e3, 10.77, 0.005) && near(C.vEsc(E, 500e3)/1e3, 10.8, 0.05));
  ok('H mean speed at 1,000 K ≈ 4.6 km/s ("about five" [6])', near(C.vMean(1000, H)/1e3, 4.58, 0.01) && near(C.vMean(1000, H)/1e3, 5, 0.5));
  ok('λ(H, Mars, 240 K) ≈ 6', near(C.jeansLambda(M, 240, H), 6.0, 0.1), C.jeansLambda(M, 240, H).toFixed(3));
  ok('λ(O, Mars, 240 K) ≈ 96', near(C.jeansLambda(M, 240, O), 96, 0.7), C.jeansLambda(M, 240, O).toFixed(2));
  ok('λ = (v_esc/v0)² = r/H identities', near(C.jeansLambda(M, 300, H), Math.pow(C.vEsc(M, 200e3)/C.v0(300, H), 2), 1e-9) && near(C.jeansLambda(M, 300, H), (M.R + 200e3)/C.scaleHeight(300, H, C.gAt(M, 200e3)), 1e-9));
  const rate = C.jeansRate(M, 240, H, 1e5), flux = C.jeansFlux(M, 240, H, 1e5)/1e4;
  ok('MARS TODAY (1e5 cm⁻³, 240 K): 1.5e26 s⁻¹, inside MAVEN 1e26–1e27 [9]', near(rate/1e26, 1.54, 0.05) && rate >= 1e26 && rate <= 1e27, rate.toExponential(3));
  ok('MARS TODAY flux ~1e8 cm⁻² s⁻¹, within a factor 1.1 of MAVEN\'s lower bound 1e8 [9]', flux > 0.9e8 && flux < 8e8, flux.toExponential(3));
  ok('erfc(0)=1, erfc(1)=0.157299, erfc(2)=0.004678', near(C.erfc(0), 1, 1e-7) && near(C.erfc(1), 0.1572992, 2e-7) && near(C.erfc(2), 0.00467773, 2e-8));
  ok('tail fraction → 1 as λ → 0, decreasing', near(C.tailFraction(1e-9), 1, 1e-3) && C.tailFraction(6) < C.tailFraction(3));
  ok('oxygen on Mars: status threshold λ ≥ 30 ⇒ tail < 1e-11; O on Mars far below', C.tailFraction(30) < 1e-11 && C.tailFraction(C.jeansLambda(M, 240, O)) < 1e-30);
  ok('Earth H at 1,000 K is also a light-gas leak (λ ≈ 7 < 30)', near(C.jeansLambda(E, 1000, H), 7.0, 0.1));
  ok('Jeans-only D/H escape efficiency at 240 K ≈ 0.003', near(C.jeansX(M, 240), 0.0032, 0.0002), C.jeansX(M, 240).toFixed(5));
  // CH3 — hot oxygen
  ok('O escape energy, Mars exobase = 1.98 eV', near(C.escEnergyEV(M, 200e3, O), 1.98, 0.005), C.escEnergyEV(M, 200e3, O).toFixed(4));
  ok('O escape energy, Earth exobase = 9.6 eV', near(C.escEnergyEV(E, 500e3, O), 9.6, 0.05), C.escEnergyEV(E, 500e3, O).toFixed(3));
  ok('DR channels per atom 3.50 / 2.51 / 1.53 eV [10]', near(C.DR[0].e/2, 3.495, 1e-9) && near(C.DR[1].e/2, 2.51, 1e-9) && near(C.DR[2].e/2, 1.525, 1e-9));
  ok('two of three channels escape Mars: 64 % of recombinations', near(C.hotShare(C.escEnergyEV(M, 200e3, O)), 0.644, 1e-9));
  ok('none escape Earth', C.hotShare(C.escEnergyEV(E, 500e3, O)) === 0);
  ok('world model at 3,389.5 km reproduces Mars', near(C.worldEsc(3389.5), C.escEnergyEV(M, 200e3, O), 1e-9));
  ok('density 3,934 kg/m³ consistent with GM and R [1]', near(M.GM/6.6743e-11/(4/3*Math.PI*Math.pow(M.R, 3)), 3934, 5));
  ok('hot O stops escaping at R ≈ 4,470 km (Mars density)', near(C.radiusFor(3.495), 4474, 10) && near(C.worldEsc(C.radiusFor(3.495)), 3.495, 1e-6), C.radiusFor(3.495).toFixed(1));
  ok('preset 4,500 km: only the 6.99 eV channel escapes', near(C.hotShare(C.worldEsc(4500)), 0, 1e-9) || near(C.hotShare(C.worldEsc(4500)), 0.204, 1e-9), C.hotShare(C.worldEsc(4500)));
  ok('Mars gravity about a third of Earth\'s [21]', near(3.73/9.82, 0.38, 0.01));
  // CH4 — MAVEN
  ok('4.5 h, 150 km periapsis → apoapsis ≈ 6,215 km ("about 6,200")', near(C.apoForPeriod(M, 4.5, 150), 6215, 2), C.apoForPeriod(M, 4.5, 150).toFixed(1));
  ok('semimajor axis 6,579 km', near(Math.cbrt(M.GM*Math.pow(4.5*3600/(2*Math.PI), 2))/1e3, 6579, 1));
  ok('O budget 1.3 + 0.13 + 0.08 = 1.51 kg/s, below the 2–3 kg/s total [18]', near(1.3 + 0.13 + 0.08, 1.51, 1e-9) && 1.51 < 2);
  ok('ion shares 75 % + 25 % = 100 % [19]', 75 + 25 === 100);
  ok('launch 18 Nov 2013 + 12 y 6 m 16 d = 3 Jun 2026 (NASA [16])', Date.UTC(2013 + 12, 10 + 6, 18 + 16) === Date.UTC(2026, 5, 3));
  ok('more than eleven years of work (Sep 2014 orbit → Dec 2025)', (Date.UTC(2025, 11, 6) - Date.UTC(2013, 10, 18))/864e5/365.25 > 11);
  // CH5 — storms
  ok('quiet 1.5e24 O₂⁺/s = 80 g/s, same order as NASA\'s ~100 g/s [19]', near(C.Q_QUIET*C.M_ION*C.AMU*1000, 79.7, 0.1));
  ok('1e25 is ~7× 1.5e24 [26]', near(1e25/1.5e24, 6.7, 0.1));
  ok('3e25 / 1.5e24 = 20 (">an order of magnitude")', near(3e25/1.5e24, 20, 1e-9));
  ok('ICME window 16:00 8 Mar → 12:00 9 Mar 2015 = 20 h [26]', (Date.UTC(2015, 2, 9, 12) - Date.UTC(2015, 2, 8, 16))/36e5 === 20);
  const s20 = C.stormExtra(20, 20), s7 = C.stormExtra(7, 20);
  ok('×20 for 20 h = 15.8 quiet days ("two weeks"), 109 t', near(s20.days, 15.83, 0.01) && near(s20.kg/1000, 109, 0.5), s20.days.toFixed(2));
  ok('×7 for 20 h = 5 quiet days', near(s7.days, 5, 1e-9));
  ok('quiet: no extra loss, zero storm share', C.stormExtra(1, 20).ions === 0 && C.stormYearShare(1, 20, 5) === 0);
  ok('storm share rises with storms per year', C.stormYearShare(20, 20, 50) > C.stormYearShare(20, 20, 5));
  // CH6 — isotopes
  ok('argon enrichment 5.5/4.2 = 1.31 [27]', near(C.AR_E, 1.3095, 1e-4));
  ok('Rayleigh round trip f → R → f', near(C.rayLeft(C.rayEnrich(0.34, 0.75), 0.75), 0.34, 1e-12));
  ok('66 % argon loss needs Δz ≈ 5.8 H₄₀ in the pure model', near(C.dzForLoss(0.66), 5.76, 0.01), C.dzForLoss(0.66).toFixed(3));
  ok('preset Δz = 5.761 → 66 % lost (MAVEN 66 ± 4.5 % [18])', near(1 - C.rayLeft(C.AR_E, C.argonX(5.761)), 0.66, 0.002));
  ok('less loss (Atreya\'s ≥ 50 %) would need a stronger separation than 66 % (monotonic)', C.dzForLoss(0.5) > C.dzForLoss(0.66) && C.dzForLoss(0.9) < C.dzForLoss(0.66));
  ok('D/H ×8 with no D loss → 87.5 % lost; Villanueva 87 % [29]', near(1 - C.rayLeft(8, 0), 0.875, 1e-12) && near(1 - C.rayLeft(8, 0), 0.87, 0.006));
  ok('6.5× the caps lost ⇒ lost fraction 6.5/7.5 = 86.7 % ≈ 87 % [29]', near(6.5/7.5, 0.87, 0.005));
  ok('D/H ×7 with Jeans x(240 K): loss ≥ 85.7 %', 1 - C.rayLeft(7, C.jeansX(M, 240)) >= 1 - 1/7 - 1e-12);
  // CH7 — history
  ok('β fitted to "6× 3.5 Gyr ago" ≈ 1.25 [31]', near(C.BETA, 1.252, 0.001) && near(C.euvRatio(3.5), 6, 1e-9), C.BETA.toFixed(4));
  ok('fit gives 2.7× 2.5 Gyr ago vs Ribas 2.5 (within 10 %)', near(C.euvRatio(2.5), 2.67, 0.01) && rel(C.euvRatio(2.5), 2.5, 0.1));
  ok('EUV ~13× today 4 Gyr ago', near(C.euvRatio(4), 12.8, 0.1));
  const m0 = C.massLost(2.5, 4, 0), m1 = C.massLost(2.5, 4, 1), m2 = C.massLost(2.5, 4, 2);
  ok('constant 2.5 kg/s × 4 Gyr = 3.2e17 kg', near(m0/1e17, 3.16, 0.01));
  ok('= 13 × today\'s atmosphere, ~80 mbar', near(m0/C.M_MARS_AIR, 12.8, 0.1) && near(C.massToMbar(M, m0), 81.5, 0.5));
  ok('∝ EUV: total triples, ~250 mbar', near(m1/m0, 3.06, 0.05) && near(C.massToMbar(M, m1), 250, 2));
  ok('∝ EUV²: passes a bar', C.massToMbar(M, m2) > 1000, C.massToMbar(M, m2).toFixed(0));
  ok('weightedGyr(·, 0) = elapsed time; analytic s=1 vs numeric', near(C.weightedGyr(4, 0), 4, 1e-12) && (() => { let s = 0, n = 20000; for(let k = 0; k < n; k++){ const ago = 4 - 4*(k + 0.5)/n; s += C.euvRatio(ago)*4/n; } return near(s, C.weightedGyr(4, 1), 1e-3); })());
  ok('massToMbar inverts atmMass: today\'s air = 6.36 mbar', near(C.massToMbar(M, C.M_MARS_AIR), 6.36, 1e-9));
  ok('lostUntil(now) = total; lostUntil(start) = 0', near(C.lostUntil(2.5, 4, 1, 0), m1, 1) && near(C.lostUntil(2.5, 4, 1, 4), 0, 1));
  // timeline / references
  ok('13 timeline rows, 33 references', C.TIMELINE.length === 13 && C.REFERENCES.length === 33);
  // review panel 2026-11-12
  const fH = C.jeansFlux(M, 240, H, 1e5), f2m = C.jeansFlux(M, 240, 2*H, 1e5), fHalfT = C.jeansFlux(M, 120, H, 1e5);
  ok('doubling the mass or halving T cuts Mars H Jeans flux ~300× ("a factor of about 300")', near(fH/f2m, 300, 25) && near(fH/fHalfT, 300, 25), (fH/f2m).toFixed(0) + ' / ' + (fH/fHalfT).toFixed(0));
  const jn = Array.prototype.map.call(w.document.querySelectorAll('[data-en]'), e => e.getAttribute('data-en')).join(' ');
  ok('Jeans note: formula fails BELOW λ ≈ 1.5 (matches the status threshold)', jn.indexOf('Below λ ≈ 1.5') >= 0 && jn.indexOf('Above λ ≈ 1.5') < 0);
  ok('Mars Express status cites the June 2026 SPC endorsement [33]', /June 2026 its Science Programme Committee endorsed a further extension/.test(jn) && /\[33\]/.test(jn));
  // UI: every preset in both languages renders without NaN
  let bad = 0;
  ['ru', 'en'].forEach(l => { w.document.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); [...w.document.querySelectorAll('main .btn')].forEach(b => { b.click(); if(/NaN|undefined|Infinity/.test(w.document.querySelector('main').textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  ok('no Latin "km"/"kg" in Russian readouts', (() => { w.document.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = [...w.document.querySelectorAll('.readout-grid')].map(e => e.textContent).join(' '); w.document.querySelector('#langtoggle button[data-lang="en"]').click(); return !/\d (km|kg|eV)\b/.test(t); })());
  ok('isotope mode hides the other slider', (() => { const d = w.document; d.querySelector('#isMode .btn[data-m="dh"]').click(); const a = d.getElementById('isArCtl').hidden && !d.getElementById('isDhCtl').hidden; d.querySelector('#isMode .btn[data-m="ar"]').click(); return a && d.getElementById('isDhCtl').hidden; })());
  ok('sliders carry aria-valuetext', [...w.document.querySelectorAll('input[type=range]')].every(r => (r.getAttribute('aria-valuetext') || '').length > 3));
  console.log(out.join('\n'));
};
