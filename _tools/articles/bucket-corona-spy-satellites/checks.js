module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  // CH1 — the gap
  ok('1 May → 19 August 1960 = 110 days (CIA history)', C.daysBetween([1960, 5, 1], [1960, 8, 19]) === 110, C.daysBetween([1960, 5, 1], [1960, 8, 19]));
  // CH2 — Discoverer XIV orbit
  const hp14 = 116*C.MILE, ha14 = 502*C.MILE, T14 = C.period(hp14, ha14)/60;
  ok('116 and 502 miles = 187 and 808 km', Math.round(hp14) === 187 && Math.round(ha14) === 808, hp14.toFixed(1) + ' / ' + ha14.toFixed(1));
  ok('Discoverer XIV period from Kepler within 0.1 % of the announced 94.5 min', Math.abs(T14/94.5 - 1) < 0.001, T14.toFixed(3));
  // CH3 — recovery physics
  const c = C.coast(200, 150), vac = C.entry(c.ve, c.gam, 200, true, 50);
  const en0 = c.ve*c.ve/2 - C.MU/(C.RE + 120), en1 = (vac.v/1000)**2/2 - C.MU/vac.r;
  ok('integrator conserves orbital energy with drag off (< 1e-9)', Math.abs((en1 - en0)/en0) < 1e-9, ((en1 - en0)/en0).toExponential(1));
  const h0 = (C.RE + 120)*c.ve*Math.cos(c.gam), h1 = vac.r*(vac.v/1000)*Math.cos(vac.gam);
  ok('integrator conserves angular momentum with drag off (< 1e-9)', Math.abs((h1 - h0)/h0) < 1e-9, ((h1 - h0)/h0).toExponential(1));
  const vis = Math.sqrt(c.v1*c.v1 + 2*C.MU*(1/(C.RE + 120) - 1/(C.RE + 200)));
  ok('entry speed obeys vis-viva', near(c.ve, vis, 1e-9) && near(c.ve, 7.731, 0.001), c.ve.toFixed(4));
  ok('150 m/s from 200 km: shallow entry, −1.6°', near(c.gam*180/Math.PI, -1.63, 0.02), (c.gam*180/Math.PI).toFixed(3));
  ok('perigee after a 150 m/s burn from 200 km is below the ground (it will enter)', c.rp < 0, c.rp.toFixed(1));
  ok('a 40 m/s burn from 350 km does not reach 120 km', C.coast(350, 40) === null);
  const R20 = C.recover(200, 150, 20), R33 = C.recover(200, 150, 33);
  ok('peak deceleration of a shallow ballistic entry is 6–12 g', R20.E.peakG > 6 && R20.E.peakG < 12, R20.E.peakG.toFixed(2));
  ok('capsule is subsonic (< 295 m/s, speed of sound at 60,000 ft) when the chute opens', R20.E.v < 295, R20.E.v.toFixed(0));
  ok('sink rate at 8,500 ft is the quoted value', near(C.sinkAt(20*C.FT, 8500*C.FT), 20*C.FT, 1e-9));
  ok('sink rate is faster in thin air (60,000 ft vs 8,500 ft)', C.sinkAt(20*C.FT, C.H_CHUTE*1000) > 2.5*20*C.FT, (C.sinkAt(20*C.FT, C.H_CHUTE*1000)/C.FT).toFixed(1) + ' ft/s');
  ok('time in the catch window scales close to 33/20', near(R20.inWin/R33.inWin, 33/20, 1e-6), (R20.inWin/R33.inWin).toFixed(4));
  ok('20 ft/s gives the 3–4 passes the crews asked for; 33 ft/s about 2', R20.passes >= 3 && R20.passes < 4 && R33.passes < 2.5, R20.passes.toFixed(2) + ' / ' + R33.passes.toFixed(2));
  const sens = Math.abs(C.dRangeDdv(200, 150));
  ok('range sensitivity ≈ 26 km per m/s', near(sens, 26, 2), sens.toFixed(1));
  ok('a 250-mile-deep zone tolerates only ≈ ±8 m/s', near(C.ZONE_NS/sens, 7.6, 0.6), (C.ZONE_NS/sens).toFixed(2));
  ok('the illustrative aim burn lands at the zone centre', C.inZone(C.shiftPoint(0)) && near(C.REC_NOM.rangeKm, R20.rangeKm, 1e-6));
  ok('+20 m/s burn lands outside the zone', !C.inZone(C.shiftPoint(C.recover(200, 170, 20).rangeKm - C.REC_NOM.rangeKm)));
  ok('zone centre 250 mi south of Honolulu ≈ 17.7°N', near(C.ZONE_C[0], 17.69, 0.01), C.ZONE_C[0].toFixed(3));
  ok('southbound track on a 77.6° orbit heads ≈ 167°', near(C.trackAz(C.ZONE_C[0]), 167, 0.5), C.trackAz(C.ZONE_C[0]).toFixed(2));
  ok('Discoverer XIII splash point is outside the zone (it was beyond the aircraft)', !C.inZone(C.D13));
  // CH4 — resolution
  const KH = C.KH, pct = KH.map(k => C.grFilm(k.H, C.F_MM, k.lp)/(k.ft*C.FT));
  ok('KH-4B: 150 km, 609.6 mm, 160 lp/mm → 1.54 m', near(C.grFilm(150, 609.6, 160), 1.538, 0.001), C.grFilm(150, 609.6, 160).toFixed(3));
  ok('KH-2 to KH-4B film limit is 84–93 % of the USGS best figures', pct.slice(1).every(p => p > 0.83 && p < 0.94), pct.slice(1).map(p => (p*100).toFixed(0)).join(', '));
  ok('KH-1 film limit is about half the published 40 ft', near(pct[0], 0.52, 0.02), pct[0].toFixed(3));
  ok('USGS 6 ft = 1.83 m and 40 ft = 12.19 m', near(6*C.FT, 1.829, 0.001) && near(40*C.FT, 12.19, 0.01));
  ok('f/3.5 Petzval: 174 mm aperture, lens limit ≈ 378 lp/mm', near(609.6/3.5, 174.2, 0.1) && near(C.lensLp(3.5), 377.7, 0.5), C.lensLp(3.5).toFixed(1));
  ok('lens limit is more than twice KH-4B film (160 lp/mm)', C.lensLp(3.5)/160 > 2.3, (C.lensLp(3.5)/160).toFixed(2));
  ok('KH-4B diffraction limit on the ground ≈ 0.65 m', near(C.grDiff(150, 609.6, 3.5), 0.651, 0.002), C.grDiff(150, 609.6, 3.5).toFixed(3));
  ok('KH-4B photo scale 1 : 246,000 (table 1 : 247,500)', near(150e6/609.6, 246063, 1) && Math.abs(150e6/609.6/247500 - 1) < 0.01);
  ok('Zenit-2 1,000 mm from 250 km = 1 : 250,000', 250e6/1000 === 250000);
  ok('10 m at 1 : 250,000 = 40 µm → 25 lp/mm', near(1/(10/250000*1000), 25, 1e-9));
  // CH4 — panoramic sweep
  ok('29.8-inch frame on a 24-inch lens = 71.1° of arc (table 71.16°)', near(C.panAngle(), 71.16, 0.05), C.panAngle().toFixed(3));
  ok('KH-4B frame width 13.6 km (table 13.8)', near(C.frameWidth(150), 13.8, 0.3), C.frameWidth(150).toFixed(2));
  ok('KH-4A frame width 16.8 km (table 17)', near(C.frameWidth(185), 17, 0.3), C.frameWidth(185).toFixed(2));
  ok('table coverage = H × θ: 186 km (188) and 230 km (232)', near(C.swathArc(150, 71.16), 188, 2.5) && near(C.swathArc(185, 71.16), 232, 2.5), C.swathArc(150, 71.16).toFixed(1) + ' / ' + C.swathArc(185, 71.16).toFixed(1));
  const st = C.swathTrue(150, 71.16);
  ok('true swath ≈ 216 km, ~13 % longer than H × θ, close to flat 2H tan(θ/2)', near(st, 216, 1) && near(st/C.swathArc(150, 71.16), 1.16, 0.02) && near(st, C.swathFlat(150, 71.16), 2), st.toFixed(1));
  ok('detail stretch at 35.58°: 1.23 along, 1.51 across', near(1/Math.cos(35.58*Math.PI/180), 1.229, 0.001) && near(1/Math.cos(35.58*Math.PI/180)**2, 1.511, 0.002));
  // CH5 — orbit trade
  ok('density 150 km ÷ 200 km ≈ 8, ÷ 300 km ≈ 108', near(C.rho(150)/C.rho(200), 8.17, 0.05) && near(C.rho(150)/C.rho(300), 108.3, 0.5));
  ok('USSA 1976 anchors: 1.225 at 0 km, 5.604e-7 at 100 km', Math.abs(C.rho(0)/1.225 - 1) < 1e-12 && Math.abs(C.rho(100)/5.604e-7 - 1) < 1e-12);
  const lc = C.lifetimeCirc(300, 400), le = C.lifetime(300, 300, 400);
  ok('orbit-averaged integrator matches the circular integrator within 3 %', Math.abs(le/lc - 1) < 0.03, le.toFixed(1) + ' vs ' + lc.toFixed(1) + ' d');
  ok('lower perigee always shortens life', C.lifetime(150, 400, 400) < C.lifetime(200, 400, 400) && C.lifetime(200, 400, 400) < C.lifetime(250, 400, 400));
  ok('150 km circular, β 400: under a day', C.lifetime(150, 150, 400) < 1, C.lifetime(150, 150, 400).toFixed(2));
  ok('lifetime ∝ β (doubling β doubles life within 3 %)', Math.abs(C.lifetime(200, 300, 800)/C.lifetime(200, 300, 400) - 2) < 0.06);
  // UI: every preset in both languages renders without NaN/undefined
  const d = w.document; let bad = 0;
  ['en', 'ru'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('#recSink .btn, #resPre .btn, #swPre .btn, #orbPre .btn').forEach(b => { b.click();
      ['recReadout', 'resReadout', 'swReadout', 'orbReadout', 'recStatus', 'resStatus', 'swStatus', 'orbStatus'].forEach(id => { if(/NaN|undefined|Infinity/.test(d.getElementById(id).textContent)) bad++; }); }); });
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('every preset in both languages renders without NaN', bad === 0, bad);
  ['recDv', 'recH', 'resH', 'resLp', 'resN', 'swH', 'swA', 'orbP', 'orbA', 'orbB'].forEach(id => { const el = d.getElementById(id), vt = el.getAttribute('aria-valuetext') || '';
    ok(id + ' has aria-valuetext mirroring its readout', vt.length > 0 && vt === d.getElementById(id + 'Val').textContent, vt); });
  d.querySelector('#resPre .btn[data-k="5"]').click();
  ok('KH-4B preset reads 1.54 m and 84 %', /1\.54 m/.test(d.getElementById('resReadout').textContent) && /84 %/.test(d.getElementById('resReadout').textContent));
  const dv = d.getElementById('recDv'); dv.value = '40'; d.getElementById('recH').value = '350'; dv.dispatchEvent(new w.Event('input'));
  ok('too-gentle burn reports the capsule stays in orbit', /stays up/.test(d.getElementById('recStatus').textContent));
  dv.value = '150'; d.getElementById('recH').value = '200'; dv.dispatchEvent(new w.Event('input'));
  ok('default burn reports inside the zone', /^Inside the zone/.test(d.getElementById('recStatus').textContent));
  const lede = d.querySelector('.lede').getAttribute('data-en'), nCh = d.querySelectorAll('section[id^="ch"]').length;
  ok('lede says nine chapters and four instruments; page has 9 chapters', /Nine chapters and four instruments/.test(lede) && nCh === 9, nCh);
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  let latin = 0; ['recReadout', 'resReadout', 'swReadout', 'orbReadout'].forEach(id => { if(/\d (km|m|min|days)\b/.test(d.getElementById(id).textContent)) latin++; });
  ok('RU readouts use Cyrillic units', latin === 0, latin);
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  // review fixes
  ok('11 → 19 August 1960 is eight days, as the CH.02 heading says', C.daysBetween([1960, 8, 11], [1960, 8, 19]) === 8 && /two firsts in eight days/.test(d.querySelector('#ch2 h2').getAttribute('data-en')));
  ok('CH.04 discloses the CIA 10 ft / 5 ft resolutions alongside the USGS list', /“10 feet”/.test(d.querySelector('#ch4').innerHTML.replace(/&nbsp;/g,' ')) || [...d.querySelectorAll('#ch4 [data-en]')].some(e => /“10 feet”.*“5 feet”/.test(e.getAttribute('data-en'))));
  d.querySelector('#resPre .btn[data-k="0"]').click();
  ok('KH-1 status hedges the cause of its shortfall', /sources do not say why/.test(d.getElementById('resStatus').textContent));
  d.querySelector('#resPre .btn[data-k="5"]').click();
  console.log(out.join('\n'));
};
