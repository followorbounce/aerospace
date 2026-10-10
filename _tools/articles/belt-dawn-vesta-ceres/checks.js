module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  // mass budget (NSSDC): dry + xenon + hydrazine = launch mass
  ok('747.1 + 425 + 45.6 = 1,217.7 kg', near(C.M_DRY + C.M_XE + C.M_N2H4, 1217.7, 1e-9), (C.M_DRY + C.M_XE + C.M_N2H4).toFixed(1));
  // JPL: 25,700 mph = 41,360 km/h = 11.49 km/s
  ok('25,700 mph ≈ 41,360 km/h', near(25700*1.609344, 41360, 5), (25700*1.609344).toFixed(0));
  ok('41,360 km/h = 11.49 km/s', near(C.DV_END, 11.489, 0.001), C.DV_END.toFixed(3));
  // rocket equation
  const chem = C.deliverNeeded(C.DV_END, 320, C.M_NOXE);
  ok('chemical 320 s for 11.49 km/s ≈ 30 t', near(chem, 30060, 60), chem.toFixed(0));
  ok('chemical ≈ 25× Dawn launch mass', near(chem/C.M_LAUNCH, 24.7, 0.1), (chem/C.M_LAUNCH).toFixed(2));
  const ion = C.deliverNeeded(C.DV_END, 3100, C.M_NOXE);
  ok('ideal 3,100 s needs ≈ 364 kg (< 425 kg load)', near(ion, 364, 2) && ion < C.M_XE, ion.toFixed(1));
  ok('exhaust at 3,100 s ≈ 30.4 km/s', near(3100*9.80665/1000, 30.40, 0.01));
  const iV = C.impliedIsp(6.7, 250), iC = C.impliedIsp(11.0, 401), iE = C.impliedIsp(C.DV_END, 425);
  ok('implied Isp to Vesta ≈ 2,970 s, inside NSSDC 1,900–3,200 s', near(iV, 2973, 5) && iV > 1900 && iV < 3200, iV.toFixed(0));
  ok('implied Isp to Ceres 2016 ≈ 2,810 s, inside range', near(iC, 2808, 5) && iC > 1900 && iC < 3200, iC.toFixed(0));
  ok('implied Isp whole mission ≈ 2,730 s, inside range', near(iE, 2729, 5) && iE > 1900 && iE < 3200, iE.toFixed(0));
  ok('rocket eq. round trip: from 1,217.7 kg at implied Isp burns exactly the milestone xenon', ['vesta','ceres','end'].every(k => { const m = C.MILESTONES[k]; return near(C.propNeeded(m.dv, C.impliedIsp(m.dv, m.xe), C.M_LAUNCH), m.xe, 1e-6); }));
  ok('fixed m0 and fixed mf forms agree when mf = m0 − prop', near(C.deliverNeeded(6.7, 2973, 1217.7 - C.propNeeded(6.7, 2973, 1217.7)), C.propNeeded(6.7, 2973, 1217.7), 1e-6));
  ok('chemical from launch mass can never exceed 1,217.7 kg', C.propNeeded(15, 320, C.M_LAUNCH) < C.M_LAUNCH);
  // thrust
  const p = C.push(92, 1217.7);
  ok('92 mN = weight of 9.38 g', near(p.grams, 9.38, 0.01), p.grams.toFixed(3));
  ok('A4 80 g/m² sheet = 4.99 g', near(C.SHEET_G, 4.990, 0.001), C.SHEET_G.toFixed(3));
  ok('0→100 km/h at 92 mN, 1,218 kg ≈ 4.26 days', near(p.daysTo100, 4.256, 0.01), p.daysTo100.toFixed(3));
  const avg = C.DV_END*1000/(5.87*365.25*86400);
  ok('mission average accel ≈ 62 µm/s² < full thrust at launch mass (76)', near(avg*1e6, 62.0, 0.5) && avg < p.a, (avg*1e6).toFixed(1));
  // bodies vs JPL SBDB published densities
  const V = C.body('vesta'), Ce = C.body('ceres'), Mo = C.body('moon');
  ok('Vesta density within 0.5 % of SBDB 3,460', Math.abs(V.rho/3460 - 1) < 0.005, V.rho.toFixed(0));
  ok('Ceres density within 0.5 % of SBDB 2,162', Math.abs(Ce.rho/2162 - 1) < 0.005, Ce.rho.toFixed(0));
  ok('Moon g 1.62 and v_esc 2.38 (fact sheet)', near(Mo.g, 1.62, 0.005) && near(Mo.vesc/1000, 2.38, 0.01), Mo.g.toFixed(3) + ' ' + (Mo.vesc/1000).toFixed(3));
  ok('Ceres surface gravity > Vesta (text claim)', Ce.g > V.g, V.g.toFixed(4) + ' / ' + Ce.g.toFixed(4));
  ok('jump 0.5 m → Vesta ≈ 19 m, Ceres ≈ 17 m', near(C.jump('vesta', 0.5), 19.4, 0.1) && near(C.jump('ceres', 0.5), 17.3, 0.1), C.jump('vesta', 0.5).toFixed(2) + ' / ' + C.jump('ceres', 0.5).toFixed(2));
  ok('Ceres 1.8× as wide, 3.6× the mass', near(C.BODIES.ceres.R/C.BODIES.vesta.R, 1.80, 0.01) && near(Ce.M/V.M, 3.62, 0.01));
  ok('Ceres < two-thirds of Vesta’s density (text claim)', Ce.rho/V.rho < 2/3, (Ce.rho/V.rho).toFixed(3));
  ok('time in the air 22–25 s (Vesta 24.8, Ceres 22.1)', near(C.airtime('vesta', 0.5), 24.8, 0.1) && near(C.airtime('ceres', 0.5), 22.1, 0.1), C.airtime('vesta', 0.5).toFixed(2) + ' / ' + C.airtime('ceres', 0.5).toFixed(2));
  ok('Vesta ≈ Moon density (within 5 %)', Math.abs(V.rho/3344 - 1) < 0.05);
  ok('escape: Vesta ≈ 364, Ceres ≈ 516 m/s', near(V.vesc, 364, 1) && near(Ce.vesc, 516, 1), V.vesc.toFixed(1) + ' / ' + Ce.vesc.toFixed(1));
  // Kepler III vs NASA published periods (point mass; within 3 %)
  ['vesta','ceres'].forEach(k => C.ORBITS[k].forEach(o => {
    if(!o.pubH) return;
    const T = C.orbit(k, o.alt).T/3600, d = T/o.pubH - 1;
    ok(k + ' ' + o.id + ' ' + o.alt + ' km: Kepler within 3 % of ' + o.pubH.toFixed(1) + ' h', Math.abs(d) < 0.03, T.toFixed(2) + ' h (' + (d*100).toFixed(1) + ' %)');
  }));
  // Edelbaum spirals
  const s1 = C.spiralDv('ceres', 1470, 385), s2 = C.spiralDv('vesta', 680, 210);
  ok('Ceres HAMO→LAMO spiral ≈ 91 m/s', near(s1, 91.0, 0.5), s1.toFixed(2));
  ok('Vesta HAMO→LAMO spiral ≈ 56 m/s', near(s2, 56.0, 0.5), s2.toFixed(2));
  ok('spiral down = speed up (LAMO faster than HAMO)', C.orbit('ceres', 385).v > C.orbit('ceres', 1470).v);
  ok('real 45 d is > 3× full-thrust time at launch mass', 45/(s1/(C.F_MAX/C.M_LAUNCH)/86400) > 3, (45/(s1/(C.F_MAX/C.M_LAUNCH)/86400)).toFixed(2));
  // page state
  const d = w.document;
  ok('orbit buttons: RC3 hidden for Vesta', (() => { d.querySelector('#orbBody .btn[data-body="vesta"]').click(); const h = d.querySelector('#orbPick .btn[data-o="rc3"]').hidden; d.querySelector('#orbBody .btn[data-body="ceres"]').click(); return h && !d.querySelector('#orbPick .btn[data-o="rc3"]').hidden; })());
  ok('every orbit renders without NaN', ['vesta','ceres'].every(k => { d.querySelector('#orbBody .btn[data-body="' + k + '"]').click(); return C.ORBITS[k].every(o => { d.querySelector('#orbPick .btn[data-o="' + o.id + '"]').click(); return !/NaN|undefined|Infinity/.test(d.getElementById('orbReadout').textContent + d.getElementById('orbStatus').textContent + d.getElementById('orbSvg').innerHTML); }); }));
  ok('every compare layer renders without NaN', ['size','inside','marks'].every(l => ['0','1'].every(m => { d.querySelector('#cmpLayer .btn[data-l="' + l + '"]').click(); d.querySelector('#cmpMoon .btn[data-moon="' + m + '"]').click(); return !/NaN|undefined/.test(d.getElementById('cmpReadout').textContent + d.getElementById('cmpSvg').innerHTML); })));
  ok('milestone buttons set sliders', (() => { d.querySelector('#xePreset .btn[data-m="vesta"]').click(); return +d.getElementById('xDv').value === 6.7 && +d.getElementById('xIsp').value === 2970; })(), d.getElementById('xIsp').value);
  const readKg = () => +d.querySelector('#xeReadout .readout-cell').textContent.replace(/[^0-9]/g, '');
  ['vesta','ceres','end'].forEach(k => { d.querySelector('#xePreset .btn[data-m="' + k + '"]').click(); const kg = readKg(), xe = C.MILESTONES[k].xe;
    ok('milestone ' + k + ': readout equals its xenon within 1 %', Math.abs(kg/xe - 1) < 0.01, kg + ' vs ' + xe); });
  ok('Russian aria-labels applied', (() => { d.querySelector('#langtoggle button[data-lang="ru"]').click(); const a = d.getElementById('orbBody').getAttribute('aria-label'); d.querySelector('#langtoggle button[data-lang="en"]').click(); return a === 'Мир' && d.getElementById('orbBody').getAttribute('aria-label') === 'World'; })());
  console.log(out.join('\n'));
};
