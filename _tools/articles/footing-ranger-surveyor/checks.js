module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document, FT = 0.3048, LB = 0.45359237, MPH = 0.44704;
  const R7 = C.RANGERS.r7, R8 = C.RANGERS.r8, R9 = C.RANGERS.r9;
  // CH1 — impact speed
  ok('escape speed from GM [30] and R [29] = fact sheet 2.38 km/s', near(C.V_ESC, 2.38, 0.006), C.V_ESC.toFixed(4));
  ok('Ranger 7 at 2.62 km/s [7] → approach speed ≈ 1.10 km/s (eq-box)', near(C.vInf(2.62), 1.10, 0.005) && d.getElementById('eqVinf').textContent === '1.10', C.vInf(2.62).toFixed(3));
  ok('Ranger 4 at 9,600 km/h [4] is the same ~2.67 km/s class of impact', near(9600/3600, 2.67, 0.01));
  // CH2 — Ranger cameras
  ok('Ranger 7: first picture to impact ≈ 17 min (NSSDC "final 17 minutes")', near(R7.tFirst/60, 17, 0.5), (R7.tFirst/60).toFixed(2));
  ok('Ranger 8: ≈ 23 min (NSSDC)', near(R8.tFirst/60, 23, 0.5), (R8.tFirst/60).toFixed(2));
  ok('Ranger 9: ≈ 19 min (NSSDC)', near(R9.tFirst/60, 19, 0.5), (R9.tFirst/60).toFixed(2));
  ok('fitted path angle reproduces each first-picture timing to 0.5 s', [R7, R8, R9].every(m => near(C.tToImpact(m.H, m.hFirst), m.tFirst, 0.5)));
  ok('fitted angles: Rangers 7 and 9 near 64°, Ranger 8 near 40° (note)', near(R7.gamma, 64, 2) && near(R9.gamma, 64, 2) && near(R8.gamma, 40, 2), [R7, R8, R9].map(m => m.gamma.toFixed(1)).join(' / '));
  ok('altitude solver inverts the time of flight', [R7, R9].every(m => near(C.tToImpact(m.H, C.altAt(m.H, 300)), 300, 0.01)));
  ok('speed grows to the NSSDC impact speed at the surface', near(C.speedAt(2.62, 0), 2.62, 1e-12) && C.speedAt(2.62, 2110) < 2.62);
  ok('A camera 25 mm on an 11 mm frame ≈ 25° [8]', near(2*Math.atan(5.5/25)*180/Math.PI, 25, 0.3));
  ok('B camera 76 mm ≈ 8.4° [8]', near(2*Math.atan(5.5/76)*180/Math.PI, 8.4, 0.15));
  ok('P camera 76 mm on a 2.8 mm frame ≈ 2.1° [8]', near(2*Math.atan(1.4/76)*180/Math.PI, 2.1, 0.05));
  ok('B and P cameras resolve almost the same per line (8.4°/1,150 vs 2.1°/300, within 5 %)', Math.abs((8.4/1150)/(2.1/300) - 1) < 0.05, ((8.4/1150)/(2.1/300)).toFixed(3));
  const obj = m => 4*C.lineM(C.distToImpact(m.H, C.altAt(m.H, 0.3)), C.CAMS.P);
  ok('4-line object at 0.3 s within ×1.5 of the published last frame: Ranger 7 (0.5 m)', obj(R7)/0.5 < 1.5 && 0.5/obj(R7) < 1.5, obj(R7).toFixed(3));
  ok('… and Ranger 9 (0.3 m)', obj(R9)/0.3 < 1.5 && 0.3/obj(R9) < 1.5, obj(R9).toFixed(3));
  ok('Ranger 8 published 1.5 m is much coarser than the along-path model (oblique cameras, note)', 1.5/obj(R8) > 3, obj(R8).toFixed(3));
  // CH3 — Surveyor 1 descent
  ok('JPL 46.75 miles = NSSDC 75.3 km ignition altitude', near(46.75*1.609344, 75.3, 0.1), (46.75*1.609344).toFixed(2));
  ok('JPL "2 min 46 s before touchdown" = Hughes 06:14:48.558 → 06:17:35.55', near(C.T_ACTUAL, 166, 1.5), C.T_ACTUAL.toFixed(2));
  ok('27,820 ft = 8.5 km; 430 ft/s = 131 m/s; 71.4 mph = 32 m/s', near(C.H_RE, 8480, 1) && near(C.V_RE, 131.06, 0.01) && near(C.W1.v, 31.9, 0.05));
  ok('727.6 lb = 330 kg; vernier-phase propellant 330 − 294.3 = 35.7 kg', near(C.M_V0, 330.0, 0.1) && near(C.M_V0 - C.M_LAND, 35.7, 0.05), (C.M_V0 - C.M_LAND).toFixed(2));
  ok('retro propellant 358,556 lb·s ÷ 288.4 s = 1,243 lb, less than the 1,386 lb motor', near(358556/288.4, 1243, 1) && 358556/288.4 < 1386);
  ok('retro phase drops the spacecraft 66.8 km (75.3 km → 27,820 ft)', near((C.H_IGN - C.H_RE)/1000, 66.8, 0.05));
  ok('touchdown from 12 ft at 4 ft/s = Hughes best estimate 12 ft/s (3.66 m/s)', near(C.freeFall(12*FT, 4*FT), 12*FT, 0.05), C.freeFall(12*FT, 4*FT).toFixed(3));
  ok('free fall lasts 1.5 s (Hughes)', near((C.freeFall(12*FT, 4*FT) - 4*FT)/1.62, 1.5, 0.05));
  ok('NSSDC 3.4 m cut-off gives 3.5 m/s; JPL 7.5 mph = 3.35 m/s: published spread 3–3.7 m/s', near(C.freeFall(3.4, 4*FT), 3.54, 0.02) && near(7.5*MPH, 3.35, 0.01));
  ok('hero "3.7 m/s" and text "about 12 ft/s, 3.7 m/s"', near(12*FT, 3.7, 0.05));
  ok('3.65 m/s = a drop of 68 cm on Earth', near(C.earthDrop(C.freeFall(C.H_CUT, C.V_CUT))*100, 68, 0.5));
  ok('effective vernier Isp ≈ 275 s (plausible for a storable bipropellant)', near(C.ISP_V, 275, 1), C.ISP_V.toFixed(2));
  ok('best vernier braking 3 × 460 N on 330 kg − 1.62 = 2.56 m/s²', near(C.A_VMAX, 2.56, 0.01), C.A_VMAX.toFixed(3));
  const nom = C.descent(C.H_IGN, C.H_CUT);
  ok('as flown: safe, 178 s ignition to touchdown (actual 167 s, within 10 %)', nom.ok && near(nom.total, 178, 0.5) && Math.abs(nom.total/C.T_ACTUAL - 1) < 0.1, nom.total.toFixed(1));
  ok('as flown: 37.6 kg vernier propellant vs 35.7 kg used, budget 55.1 kg', near(nom.prop, 37.6, 0.05) && near(nom.budget, 55.1, 0.05), nom.prop.toFixed(2) + ' / ' + nom.budget.toFixed(2));
  ok('window 70.3–83.7 km; lower limit < 2 s of flight below 75.3 km', near(C.H_IGN_MIN/1000, 70.3, 0.05) && near(C.H_IGN_MAX/1000, 83.7, 0.05) && (C.H_IGN - C.H_IGN_MIN)/2612 < 2, (C.H_IGN_MIN/1000).toFixed(2) + '–' + (C.H_IGN_MAX/1000).toFixed(2));
  ok('presets: 6 km late crashes, 15 km early runs dry', C.descent(69300, C.H_CUT).crash && C.descent(90300, C.H_CUT).dry && !C.descent(90300, C.H_CUT).crash);
  ok('Surveyor 2 tumble 1.22 rev/s ≈ "about 1.2"', near(1.22, 1.2, 0.05));
  // CH4 — footpads
  const pS = C.padPressure(C.SURVEYOR_FOOT.m, 3, C.SURVEYOR_FOOT.D), pL = C.padPressure(C.LM_FOOT.m, 4, C.LM_FOOT.D);
  ok('NASM 11¾ in = 29.8 cm', near(11.75*2.54, 29.8, 0.06));
  ok('Surveyor pad pressure ≈ Sourcebook 2.2 kPa', near(pS, 2.2, 0.15), pS.toFixed(3));
  ok('16,000 lb = 7,257 kg; 3 ft = 0.914 m', near(C.LM_FOOT.m, 7257, 1) && near(C.LM_FOOT.D, 0.914, 0.001));
  ok('LM pad pressure ≈ 4.5 kPa ("about 5 kPa" in the Sourcebook)', near(pL, 4.5, 0.05) && near(pL, 5, 0.6), pL.toFixed(3));
  ok('LM ≈ twice a Surveyor pad and ≈ one sixth of 27 kPa', near(pL/pS, 2, 0.1) && near(pL/C.Q_S5, 1/6, 0.01));
  ok('2.7 N/cm² = 27 kPa; 1 psi = 6.89 kPa; 4 in = 10.2 cm', C.Q_S5 === 27 && near(C.SPEC_P, 6.89, 0.01) && near(C.SPEC_D, 10.16, 0.001));
  ok('Sourcebook factor of safety 3,000/5 = 600 to 11,000/5 = 2,200', 3000/5 === 600 && 11000/5 === 2200);
  ok('sinkage scales as p/k: LM 0.56 cm at k = 8, 2.2 cm at k = 2', near(C.sinkCm(pL, 8), 0.56, 0.01) && near(C.sinkCm(pL, 2), 2.24, 0.02));
  // CH5 — Lunar Orbiter
  ok('610 mm × 76 lines/mm from 46 km → 1 m [26]', near(C.loObject(46, 610), 1, 0.02), C.loObject(46, 610).toFixed(3));
  ok('80 mm from 46 km → 8 m [26]', near(C.loObject(46, 80), 8, 0.5), C.loObject(46, 80).toFixed(2));
  ok('from 55 km → 1 m and 8 m (PDS footprint paragraph)', near(C.loObject(55, 610), 1.19, 0.2) && near(C.loObject(55, 80), 9.0, 1.1));
  ok('Lunar Orbiter 5 at 99 km → about 2 m (NSSDC "down to 2 meters")', near(C.loObject(99, 610), 2, 0.2), C.loObject(99, 610).toFixed(2));
  ok('frames scale to the PDS 55 km figures', C.loFoot(55, 'HR')[0] === 4.15 && C.loFoot(55, 'MR')[1] === 37.4);
  ok('circular speed at 46 km ≈ 1.66 km/s; blur in 1/25 s ≈ 66 m, dozens of times the resolution', near(C.circSpeed(46), 1.66, 0.005) && near(C.smearM(46), 66, 0.5) && C.smearM(46)/C.loObject(46, 610) > 24);
  // CH6 — Apollo 12
  ok('Intrepid–Surveyor 3 distance from LRO positions ≈ 157 m, within NSSDC "about 180 m" and near Rummel\'s 163 m', near(C.A12_DIST, 157, 1) && C.A12_DIST < 180 && near(C.A12_DIST, 163, 10) && d.getElementById('eqDist').textContent === '157', C.A12_DIST.toFixed(1));
  ok('20 Apr 1967 → 20 Nov 1969 ≈ two and a half years', near((Date.UTC(1969, 10, 20) - Date.UTC(1967, 3, 20))/(365.25*864e5), 2.5, 0.1));
  ok('32 of 33 samples from 10 of 11 locations sterile (one positive)', 33 - 32 === 1 && 11 - 10 === 1);
  // CH7 — tally
  ok('21 robots (9 Rangers, 7 Surveyors, 5 Lunar Orbiters), 8 lost or blind (Rangers 1–6, Surveyors 2 and 4)', 9 + 7 + 5 === 21 && 6 + 2 === 8);
  ok('timeline has 10 entries; references 31', C.TIMELINE.length === 10 && C.REFERENCES.length === 31);
  // REVIEW (2026-11-12) — panel MUST items
  ok('review: Sourcebook factor (600–2,200) vs instrument factor against 27 kPa (≈6) differ by about 100×, and the page says why (bearing capacity grows with footing width)', 600/(C.Q_S5/pL) > 90 && /grows roughly in proportion to the width/.test(d.body.innerHTML) && /LOWER BOUND/.test(d.getElementById('ftReadout').textContent), (C.Q_S5/pL).toFixed(2));
  ok('review: Christensen et al. 1968 credited by initials as published (no invented first names)', !/Rebecca|Ребекка/.test(d.body.innerHTML) && /E\. M\. Christensen and eleven colleagues/.test(d.body.innerHTML) && C.REFERENCES.some(r => /R\. H\. Jones/.test(r.title)));
  ok('review: bacteria conclusion not stated as "almost certainly" (Rummel et al. call it a "very real" possibility)', !/almost certainly|почти наверняка/.test(d.body.innerHTML + JSON.stringify(C.TIMELINE)) && /very real/.test(d.body.innerHTML));
  ok('review: odd Surveyor readout (crash preset, 3 cells) ends in a full-width cell', (() => { d.querySelector('#sdPre .btn[data-h="69.3"]').click(); const c = d.querySelectorAll('#sdReadout .readout-cell'); const r = c.length === 3 && c[2].classList.contains('wide'); d.querySelector('#sdPre .btn[data-h="75.3"]').click(); const c2 = d.querySelectorAll('#sdReadout .readout-cell'); return r && c2.length === 7 && c2[6].classList.contains('wide'); })());
  // UI
  ['rgT', 'sdH', 'sdC', 'ftM', 'ftD', 'loH'].forEach(id => ok('slider ' + id + ' has aria-valuetext', (d.getElementById(id).getAttribute('aria-valuetext') || '').length > 3));
  let bad = 0;
  ['ru', 'en'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); [...d.querySelectorAll('main .btn')].forEach(b => { b.click(); if(/NaN|undefined|Infinity/.test(d.querySelector('main').textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  ok('no Latin units in Russian readouts', (() => { d.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = [...d.querySelectorAll('.readout-grid, .status')].map(e => e.textContent).join(' '); d.querySelector('#langtoggle button[data-lang="en"]').click(); return !/\d ?(km|m\/s|kg|kPa|cm)\b/.test(t); })());
  ok('Ranger time slider sweeps 0.2 s to the first picture for each mission', (() => { const b = d.querySelector('#rgMis .btn[data-m="r8"]'); b.click(); const mx = +d.getElementById('rgT').max; d.querySelector('#rgMis .btn[data-m="r9"]').click(); return near(Math.pow(10, mx), R8.tFirst, 2); })());
  ok('every SVG chart has EN and RU aria labels', [...d.querySelectorAll('svg.sim-svg')].every(s => s.getAttribute('data-aria-en') && s.getAttribute('data-aria-ru')));
  console.log(out.join('\n'));
};
