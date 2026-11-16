module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const doc = w.document, $ = id => doc.getElementById(id), D = C.D2R;
  const en = sel => Array.from(doc.querySelectorAll(sel + ' [data-en]')).map(e => e.getAttribute('data-en')).join(' ');
  const ru = sel => Array.from(doc.querySelectorAll(sel + ' [data-ru]')).map(e => e.getAttribute('data-ru')).join(' ');
  const S = id => C.sat(id), V = id => C.verif(id);
  const dayRate = r => r/D*86400;

  // ---- constants against their sources
  ok('J2 = 2 × CK2 of Spacetrack Report No. 3 (5.413080e-4) [1]', near(C.J2, 2*5.413080e-4, 1e-12), C.J2);
  ok('J2 agrees with the NSSDC Earth fact sheet value 1082.63e-6 to 3e-8 [25]', near(C.J2, 1082.63e-6, 3e-8));
  ok('sidereal day from the IS-GPS-200 rotation rate = 23 h 56 min 4 s (Kelso: 23h56m04.09s [27]) within 0.02 s', near(C.SID_DAY, 23*3600 + 56*60 + 4.09054, 0.02), C.SID_DAY.toFixed(4));
  ok('sidereal day = 23.9345 h of the NSSDC fact sheet [25]', near(C.SID_DAY/3600, 23.9345, 0.0001), (C.SID_DAY/3600).toFixed(5));
  ok('critical inclination 63.43° and 116.57° (eq-note)', near(C.CRIT_INC, 63.43, 0.005) && near(180 - C.CRIT_INC, 116.57, 0.005), C.CRIT_INC.toFixed(4));
  ok('perigee rate is zero at the critical inclination and changes sign across it', Math.abs(C.ratesFor(26560, 0.7, C.CRIT_INC*D).peri) < 1e-18 && C.ratesFor(26560, 0.7, 60*D).peri > 0 && C.ratesFor(26560, 0.7, 67*D).peri < 0);
  ok('node rate: zero for a polar orbit, westward below 90°, eastward above', Math.abs(C.ratesFor(7000, 0, 90*D).node) < 1e-18 && C.ratesFor(7000, 0, 50*D).node < 0 && C.ratesFor(7000, 0, 98*D).node > 0);
  ok('both J2 rates scale as a^-3.5 (eq-note)', near(Math.log(C.ratesFor(7000, 0, 0.5).node/C.ratesFor(14000, 0, 0.5).node)/Math.log(2), 3.5, 1e-9));

  ok('J2 is about four hundred times J3 = -0.253881e-5 of Spacetrack Report No. 3 [1] (text)', near(C.J2/0.253881e-5, 426, 1) && /about four hundred times/.test(en('#ch6')), (C.J2/0.253881e-5).toFixed(1));
  // ---- Kepler's equation and the element conversions
  let worst = 0; for(let e = 0; e <= 0.99; e += 0.03) for(let m = 0; m < 360; m += 7){ const E = C.kepler(m*D, e); worst = Math.max(worst, Math.abs(E - e*Math.sin(E) - m*D)); }
  ok('Kepler solver satisfies M = E − e sin E to 1e-12 for e up to 0.99', worst < 1e-12, worst.toExponential(2));
  const mol = S('mol').t, Em = C.kepler(Math.PI/2, mol.ecc), num = C.trueFromE(Em, mol.ecc)/D;
  ok('Molniya 3-50: M = 90° gives ν = 153° and r = 36,263 km (text)', near(num, 153.0, 0.1) && near(mol.a*(1 - mol.ecc*Math.cos(Em)), 36263, 1.5), num.toFixed(2) + ' / ' + (mol.a*(1 - mol.ecc*Math.cos(Em))).toFixed(1));
  const Mof = (nu, e) => { const E = 2*Math.atan2(Math.sqrt(1 - e)*Math.sin(nu/2), Math.sqrt(1 + e)*Math.cos(nu/2)); return E - e*Math.sin(E); };
  const far = 1 - 2*Mof(Math.PI/2, mol.ecc)/(2*Math.PI);
  ok('Molniya spends nearly nine-tenths (0.895) of a revolution with true anomaly between 90° and 270°, the apogee side of the Earth; the geometric far half of the ellipse (E 90°–270°) would be 0.716 (review C, M4)', near(far, 0.895, 0.001) && near(0.5 + mol.ecc/Math.PI, 0.716, 0.001) && /apogee side of the Earth \(true anomaly between 90° and 270°\)/.test(en('#ch2')) && !/far half/.test(en('#ch2')), far.toFixed(4));
  let rt = 0; [[7000, 0.01, 51.6, 277, 24, 100], [26555, 0.677, 63.5, 140, 276, 200], [42164, 0.0003, 2, 61, 235, 300], [8635, 0.186, 34.3, 349, 332, 19]].forEach(q => {
    const st = C.elementsToState(q[0], q[1], q[2]*D, q[3]*D, q[4]*D, q[5]*D), b = C.stateToElements(st.r, st.v);
    rt = Math.max(rt, Math.abs(b.a/q[0] - 1), Math.abs(b.e - q[1]), Math.abs(b.i/D - q[2]), Math.abs(b.O/D - q[3]), Math.abs(b.w/D - q[4])/100, Math.abs(b.nu/D - q[5])/100); });
  ok('elements → position and velocity → elements returns the same six numbers', rt < 1e-7, rt.toExponential(2));
  const stp = C.elementsToState(8000, 0.2, 0.7, 1, 2, 0), sta = C.elementsToState(8000, 0.2, 0.7, 1, 2, Math.PI);
  ok('perigee at a(1 − e), apogee at a(1 + e) (text)', near(C.norm(stp.r), 6400, 1e-6) && near(C.norm(sta.r), 9600, 1e-6));
  ok('speed obeys vis-viva at perigee', near(C.norm(stp.v), Math.sqrt(C.MU*(2/6400 - 1/8000)), 1e-9));
  const iss = S('iss').t, vIss = C.norm(C.elementsToState(iss.a, iss.ecc, iss.inc*D, 0, 0, 1).v);
  ok('the Station moves almost 8 km each second (ch. 1)', vIss > 7.5 && vIss < 8, vIss.toFixed(3));

  // ---- the five embedded element sets
  ok('five embedded TLEs: both checksums valid, lines 69 characters', C.SATS.length === 5 && C.SATS.every(s => s.t.ok1 && s.t.ok2 && s.l1.length === 69 && s.l2.length === 69));
  ok('a corrupted digit fails the checksum', C.tleChecksum(S('iss').l1.replace('26318', '26319')) !== S('iss').t.sum1);
  ok('TLE exponent notation: " 17615-3" = 0.17615e-3, "-12345-6" = -0.12345e-6 (Kelso\'s example [4])', near(C.tleExp(' 17615-3'), 1.7615e-4, 1e-15) && near(C.tleExp('-12345-6'), -1.2345e-7, 1e-18));
  ok('catalogue numbers 25544, 49260, 40105, 25847, 60133 (note in ch. 4)', C.SATS.map(s => +s.t.cat).join() === '25544,49260,40105,25847,60133');
  const iso = id => new Date(S(id).t.epochMs).toISOString().slice(0, 10);
  ok('epochs fall on 12–14 November 2026 (lede)', ['iss', 'sso', 'gps', 'geo'].every(id => iso(id) === '2026-11-14') && iso('mol') === '2026-11-12', C.SATS.map(s => iso(s.id)).join(' '));
  ok('designators decode to the catalogue\'s launch years: 1998, 2021, 2014, 1999, 2024 [8]', C.SATS.map(s => s.t.launchYear).join() === '1998,2021,2014,1999,2024' && S('iss').t.launchNo === 67 && S('iss').t.piece === 'A');
  const hp = id => S(id).t.a*(1 - S(id).t.ecc) - C.RE, ha = id => S(id).t.a*(1 + S(id).t.ecc) - C.RE;
  ok('Molniya 3-50 heights 2,193 × 38,162 km = CelesTrak SATCAT 2193 × 38162 [8]', near(hp('mol'), 2193, 1) && near(ha('mol'), 38162, 1), hp('mol').toFixed(1) + ' × ' + ha('mol').toFixed(1));
  ok('GPS heights within 1 km of SATCAT 20085 × 20279; "about 20,200 km" (text)', near(hp('gps'), 20085, 1) && near(ha('gps'), 20279, 1), hp('gps').toFixed(1) + ' × ' + ha('gps').toFixed(1));
  ok('ISS heights within 2 km of SATCAT 414 × 424', near(hp('iss'), 414, 2) && near(ha('iss'), 424, 2), hp('iss').toFixed(1) + ' × ' + ha('iss').toFixed(1));
  ok('Landsat 9 height within 3 km of the 705 km of USGS [15]', near((hp('sso') + ha('sso'))/2, 705, 3), ((hp('sso') + ha('sso'))/2).toFixed(1));
  ok('GOES-19 heights within 2 km of SATCAT 35784 × 35790', near(hp('geo'), 35784, 2) && near(ha('geo'), 35790, 2));
  ok('semi-major axes 26,560 km (GPS) and 26,556 km (Molniya) (text); GPS within 1 km of the IS-GPS-200 reference 26,559.71 km [13]', Math.round(S('gps').t.a) === 26560 && Math.round(mol.a) === 26556 && near(S('gps').t.a, 26559.71, 1));
  ok('periods: ISS 92.9 min within NASA\'s 90–93 [14]; Landsat 9 98.8 ≈ 99 min [15]', near(1440/iss.n, 92.9, 0.05) && 1440/iss.n > 90 && 1440/iss.n < 93 && Math.round(1440/S('sso').t.n) === 99);
  ok('ISS 15.49 revolutions a day on 14 Nov 2026: just under NASA\'s general 15.5–15.9 [14], because the orbit was high (period at the top of 90–93 min)', iss.n > 15.45 && iss.n < 15.5 && 1440/iss.n > 92.5, iss.n);

  // ---- ground tracks
  const g = S('geo'), lon0 = C.subpoint(C.propagate(g.t, 0, 'j2'), g.t.jd).lon;
  ok('GOES-19 sits at 75.2° W by its TLE and GMST = NOAA\'s GOES East longitude [16], within 0.1°', near(lon0, -75.2, 0.1), lon0.toFixed(3));
  ok('GOES-19 stays within 0.2° of that longitude for 72 h in the J2 model', [24, 48, 72].every(h => near(C.subpoint(C.propagate(g.t, h*3600, 'j2'), g.t.jd + h/24).lon, -75.2, 0.2)));
  const lt = C.descNodeLocalTime(S('sso').t), ltMin = (lt - 10)*60;
  ok('Landsat 9 descending-node local time 10:12, inside USGS\'s 10:12 a.m. ± 5 min [15]', near(ltMin, 12, 5), '10:' + ltMin.toFixed(1));
  const fi = S('iss').facts, fs = S('sso').facts, fg = S('gps').facts, fm = S('mol').facts;
  ok('ISS westward step 23.6° = 23.3° Earth + 0.3° node (text); NASA\'s approximate 22.9° within 4 % [14]', near(fi.shift, 23.6, 0.05) && near(fi.shiftEarthOnly, 23.3, 0.05) && near(fi.shift - fi.shiftEarthOnly, 0.3, 0.05) && Math.abs(fi.shift/22.9 - 1) < 0.04, fi.shift.toFixed(3));
  ok('NASA\'s 22.9° is this orbit\'s drift rate over 90 min and 23.6° over 93 min: the two ends of NASA\'s own 90–93 min [14] (text)', (() => { const perMin = (C.OMEGA_E/D*86400 - fi.nodeDegDay)/1440; return near(perMin*90, 22.9, 0.05) && near(perMin*93, 23.6, 0.05) && /low end of the 90 to 93 minutes/.test(en('#ch5')); })(), ((C.OMEGA_E/D*86400 - fi.nodeDegDay)/1440*90).toFixed(3));
  ok('ISS track nearly closes after 61 revolutions in 4 days (text)', near(4*fi.revsPerNodalDay, 61, 0.05), (4*fi.revsPerNodalDay).toFixed(3));
  ok('Landsat 9: 233 revolutions in 16 days (eq-note; 16-day repeat [15])', near(16*fs.revsPerNodalDay, 233, 0.02), (16*fs.revsPerNodalDay).toFixed(4));
  ok('GPS and Molniya: two revolutions per turn of the Earth (eq-note)', near(fg.revsPerNodalDay, 2, 0.001) && near(fm.revsPerNodalDay, 2, 0.001), fg.revsPerNodalDay.toFixed(5) + ' / ' + fm.revsPerNodalDay.toFixed(5));
  ok('highest map (geodetic) latitude of the ISS track is 51.8°, about 0.2° above the inclination 51.63°, as the text says', (() => { let mx = 0; for(let k = 0; k < 2800; k++) mx = Math.max(mx, Math.abs(C.subpoint(C.propagate(iss, k*2, 'j2'), iss.jd + k*2/86400).lat)); return near(mx, 51.81, 0.02) && near(mx - iss.inc, 0.18, 0.03); })());
  ok('Landsat 9 reaches 81.84° geodetic; 180° − 98.2127° = 81.79° geocentric', (() => { let mx = 0; const t = S('sso').t; for(let k = 0; k < 3000; k++) mx = Math.max(mx, Math.abs(C.subpoint(C.propagate(t, k*2, 'j2'), t.jd + k*2/86400).lat)); return near(mx, 81.84, 0.02); })());
  ok('coastline data: 30 rings, every vertex inside the map', C.LAND.length === 30 && C.LAND.every(r => r.length % 2 === 0 && r.every((v, k) => k % 2 ? Math.abs(v) <= 90 : Math.abs(v) <= 180)));

  // ---- J2 rates against published values
  ok('Landsat 9 node +0.987°/day vs the Sun-synchronous +0.986 (note), within 0.3 %', near(fs.nodeDegDay, 0.987, 0.0005) && near(C.SUN_RATE, 0.986, 0.0005) && Math.abs(fs.nodeDegDay/C.SUN_RATE - 1) < 0.003, fs.nodeDegDay.toFixed(4));
  const van = V('van'), vr = C.tleRates(van.t), pubN = (van.pubNode - van.t.raan)/3, pubP = (van.pubPeri - van.t.argp)/3;
  ok('Vanguard 1: published output angles 3 days on differ from the TLE by −9.21° and +13.57°, i.e. about −3.07 and +4.52°/day including the periodic wobble [2]; formulas −3.06 and +4.48 (note), within 1.5 %', near(pubN, -3.07, 0.005) && near(pubP, 4.52, 0.005) && near(dayRate(vr.node), -3.06, 0.005) && near(dayRate(vr.peri), 4.48, 0.005) && Math.abs(dayRate(vr.node)/pubN - 1) < 0.015 && Math.abs(dayRate(vr.peri)/pubP - 1) < 0.015, dayRate(vr.node).toFixed(3) + ' / ' + dayRate(vr.peri).toFixed(3));
  const cb = V('cbers'), db = V('deb');
  ok('CBERS-2 node: published +0.975°/day over 2 days [2], formula within 0.5 %', Math.abs(dayRate(C.tleRates(cb.t).node)/((cb.pubNode - cb.t.raan)/2) - 1) < 0.005, dayRate(C.tleRates(cb.t).node).toFixed(4));
  ok('Delta 1 debris node: published −4.253°/day over 2 days [2], formula within 0.5 %', Math.abs(dayRate(C.tleRates(db.t).node)/((db.pubNode - db.t.raan)/2) - 1) < 0.005, dayRate(C.tleRates(db.t).node).toFixed(4));
  const gpsRef = -2.6e-9*180*86400;
  ok('GPS reference rate −2.6e-9 semicircles/s = −0.0404°/day [13]; J2 alone −0.0383 (note), within 6 %', near(gpsRef, -0.0404, 0.00005) && near(fg.nodeDegDay, -0.0383, 0.00005) && Math.abs(fg.nodeDegDay/gpsRef - 1) < 0.06, fg.nodeDegDay.toFixed(5));
  ok('Molniya 3-50 perigee drift under 0.001°/day at 63.53° (status)', Math.abs(fm.periDegDay) < 0.001, fm.periDegDay.toFixed(5));
  ok('ISS node −4.95°/day; lighting cycle 61 days vs NASA\'s approximate 63 [14], within 5 %', near(fi.nodeDegDay, -4.95, 0.005) && Math.round(fi.sunCycleDays) === 61 && Math.abs(fi.sunCycleDays/63 - 1) < 0.05, fi.sunCycleDays.toFixed(2));
  ok('ISS ṅ/2 = 0.00009396 read as drag = about 55 m/day (text)', iss.ndot2 === 0.00009396 && near(C.decayPerDay(iss)*1000, 55, 0.5), (C.decayPerDay(iss)*1000).toFixed(2));

  // ---- the propagator against published SGP4 positions
  const i19 = V('iss19');
  ok('ISS 2019 example: time after epoch 4 h 04 min; the J2 model is 11 km from the published SGP4 position [3], Kepler alone 67 km', near(i19.pts[0][0], 243.51, 0.01) && near(i19.err[0].j2, 11.1, 0.2) && near(i19.err[0].kepler, 66.9, 0.2), i19.err[0].j2.toFixed(2) + ' / ' + i19.err[0].kepler.toFixed(2));
  ok('verification TLEs have valid checksums and 13 + 25 + 25 + 25 + 1 published points', C.VERIF.every(c => c.t.ok1 && c.t.ok2) && C.VERIF.map(c => c.pts.length).join() === '13,25,25,25,1');
  ok('Vanguard 1, 3 days: Kepler alone 1,377 km out; with J2 at most 10 km (note)', near(C.maxErr(van, 'kepler'), 1377, 1) && C.maxErr(van, 'j2') < 10.5, C.maxErr(van, 'kepler').toFixed(1) + ' / ' + C.maxErr(van, 'j2').toFixed(2));
  ok('the four low-orbit test cases with J2 stay within about 10–25 km of SGP4 at the published times (note)', [van, cb, db, i19].every(c => C.maxErr(c, 'j2') > 9 && C.maxErr(c, 'j2') < 25), [van, cb, db, i19].map(c => C.maxErr(c, 'j2').toFixed(1)).join(' '));
  ok('Molniya 2-14: 96 km out at the epoch, up to 97 km at the published times (note); at the epoch it is 40 min past perigee at ν = 95.6°, r = 15,000 km, not at perigee (review A, M2)', (() => { const c = V('mol2'), t = c.t, E = C.kepler(t.M*D, t.ecc); return near(c.err[0].j2, 96.4, 0.3) && near(C.maxErr(c, 'j2'), 96.6, 0.3) && near(C.trueFromE(E, t.ecc)/D, 95.6, 0.1) && near(t.M/360*1440/t.n, 40.4, 0.2) && t.a*(1 - t.ecc*Math.cos(E)) > 1.7*t.a*(1 - t.ecc); })(), C.maxErr(V('mol2'), 'j2').toFixed(1));
  ok('drag case: the ṅ/2 term improves on J2 alone (status)', C.maxErr(db, 'drag') < C.maxErr(db, 'j2') - 5, C.maxErr(db, 'j2').toFixed(1) + ' → ' + C.maxErr(db, 'drag').toFixed(1));
  ok('J2 always beats Kepler alone at the last published time of each multi-day case', [van, cb, db].every(c => c.err[c.err.length - 1].j2 < c.err[c.err.length - 1].kepler/20));
  const d1 = C.SATS.map(s => s.err.j2.d1);
  ok('reference grid: 145 SGP4 positions per satellite every 30 min; its 24 h and 72 h points equal the separately embedded ones', C.SATS.every(s => s.grid.length === 145 && C.dist(s.grid[48], s.ref24) < 0.02 && C.dist(s.grid[144], s.ref72) < 0.02));
  const m1 = C.SATS.map(s => s.err.j2.max1), m3 = C.SATS.map(s => s.err.j2.max3), e0 = C.SATS.map(s => s.err.j2.d0);
  ok('J2 model, largest error round the orbit in the first day: 15.0 / 15.2 / 27.2 / 28.8 / 27.2 km = “between 15 and 29 km” (note; review A, M1)', [15.0, 15.2, 27.2, 28.8, 27.2].every((v, k) => near(m1[k], v, 0.15)) && Math.min(...m1) >= 15 && Math.max(...m1) < 29 && /between 15 and 29 km/.test(en('#ch5')), m1.map(x => x.toFixed(1)).join(' '));
  ok('J2 model, largest error over 72 h: 46.7 / 16 / 27.2 / 28.8 / 41 km (reviewer\'s 2-min sampling: 46.7 / 16.3 / 27.2 / 28.8 / 41.0)', [46.7, 16.3, 27.2, 28.8, 41.0].every((v, k) => near(m3[k], v, 0.4)), m3.map(x => x.toFixed(1)).join(' '));
  ok('the whole-day samples understate it: GPS is 5.6 km out at exactly 24 h but 27 km a quarter-revolution later', near(d1[2], 5.6, 0.1) && m1[2] > 4*d1[2], d1[2].toFixed(1) + ' vs ' + m1[2].toFixed(1));
  ok('error at the epoch itself 6 to 29 km (note): 11.8 / 14.9 / 5.7 / 28.8 / 21.9', [11.8, 14.9, 5.7, 28.8, 21.9].every((v, k) => near(e0[k], v, 0.1)), e0.map(x => x.toFixed(1)).join(' '));
  ok('ṅ/2 drag is applied only below a 225-min period: for GPS, Molniya and GOES-19 the drag mode equals the J2 mode exactly', ['gps', 'mol', 'geo'].every(id => S(id).err.drag.max3 === S(id).err.j2.max3) && S('iss').err.drag.max3 < 14 && C.maxErr(V('mol2'), 'drag') === C.maxErr(V('mol2'), 'j2'));
  ok('Kepler-only track facts carry no node drift: ISS step 23.30° (Earth\'s rotation in one 92.94-min period) instead of 23.60°', near(S('iss').factsKepler.shift, 23.30, 0.01) && near(S('iss').factsKepler.shift, C.OMEGA_E/D*86400/iss.n, 1e-9) && S('iss').factsKepler.nodeDegDay === 0 && near(fi.shift, 23.60, 0.01));
  ok('ISS, Kepler alone after 24 h: 469 km (note)', near(S('iss').err.kepler.d1, 469, 1), S('iss').err.kepler.d1.toFixed(1));
  ok('ISS after 72 h: drag term cuts the J2 model\'s 47 km to about 11 km', near(S('iss').err.j2.d3, 46.7, 1) && S('iss').err.drag.d3 < 13, S('iss').err.drag.d3.toFixed(1));
  ok('GOES-19: both modes start 21.9 km from SGP4 at the epoch (the Sun–Moon periodic term, per review A); for this element set J2 then ends worse than Kepler alone at 72 h', near(g.err.j2.d0, 21.9, 0.1) && near(g.err.kepler.d0, 21.9, 0.1) && g.err.j2.d3 > g.err.kepler.d3, g.err.j2.d3.toFixed(1) + ' vs ' + g.err.kepler.d3.toFixed(1));
  ok('mean elements read as ordinary ones miss the SGP4 position by 11–12 km at the ISS epoch itself', (() => { const e0 = C.dist(C.propagate(iss, 0, 'j2'), [854.970, -6738.853, -0.002]); return e0 > 10 && e0 < 13; })());
  ok('SGP semi-major axis differs from the plain Kepler one by under 3 km (the Kozai correction)', C.SATS.every(s => Math.abs(s.t.a - s.t.aKepler) < 3 && s.t.a !== s.t.aKepler));

  // ---- text, UI and accessibility
  ok('9 chapters; lede says “Nine chapters and five instruments” (EN + RU)', doc.querySelectorAll('.section .fig-num').length === 9 && /Nine chapters and five instruments/.test(doc.querySelector('.lede').getAttribute('data-en')) && /Девять глав и пять приборов/.test(doc.querySelector('.lede').getAttribute('data-ru')));
  ok('five instruments present', ['elSvg', 'tleBox', 'gtSvg', 'j2Svg', 'erSvg'].every(id => $(id)));
  ok('at least 18 references, each with an https URL and EN + RU notes', C.REFERENCES.length >= 18 && C.REFERENCES.every(x => /^https:\/\//.test(x.url) && x.note.en && x.note.ru), C.REFERENCES.length);
  ok('catalogue numbers: text, timeline and MOD say 69999 then 100000, never “passes 99999” (review B, M1)', /ran only to 69999/.test(en('#ch4')) && /69999/.test(C.TIMELINE[9][1]) && /69999/.test(C.TIMELINE[9][2]) && /100000/.test(C.TIMELINE[9][1]) && (() => { const m = require('fs').readFileSync(require('path').join(__dirname, 'MOD.json'), 'utf8'); return /69999/.test(m) && !/passes 99999|перешёл за 99999/.test(m); })());
  ok('“no TLE” is attributed to CelesTrak only, with Space-Track\'s Alpha-5 beside it (review B, M2)', /CelesTrak does not issue the six-digit objects as two-line element sets/.test(en('#ch4')) && !/get no two-line element set at all/.test(en('#ch4')) && /CelesTrak does not issue/.test(C.TIMELINE[9][1]) && /Alpha-5/.test(C.TIMELINE[9][1]));
  ok('NASA “quotes” the 63-day cycle; nothing says it rounds 61 to 63 (review B, M3)', /NASA\'s tutorial quotes an approximate 63-day cycle/.test(en('#ch6')) && !/rounds/.test(en('#ch6')));
  ok('the 2006 timeline row in Russian names Валладо с соавторами and transliterates no co-author; Hujsak stays in Latin script in Russian text (review C, M5)', /Валладо с соавторами/.test(C.TIMELINE[8][2]) && !/Хуйсак|Хужак|Хьюсак/.test(JSON.stringify(C.TIMELINE) + JSON.stringify(C.REFERENCES) + ru('body')) && /Hujsak/.test(ru('#ch7')) && /Hujsak/.test(C.TIMELINE[5][2]));
  ok('Ceres: both dates given, 7 December (Zach) and 31 December (Olbers), in text and timeline', /7 December/.test(en('#ch1')) && /Olbers on 31 December/.test(en('#ch1')) && /eleven months later/.test(en('#ch1')) && /31 December/.test(C.TIMELINE[1][1]) && /Ольберс/.test(C.TIMELINE[1][2]));
  ok('perigee drift: backward only between 63.4° and 116.6° (text) and forward again above', /backward between 63.4° and 116.6°/.test(en('#ch6')) && C.ratesFor(8000, 0.1, 100*D).peri < 0 && C.ratesFor(8000, 0.1, 130*D).peri > 0);
  ok('31 references; Buchar 1958 [29] and the SGP4-XP note [30] are present and cited', C.REFERENCES.length === 31 && /BUCHAR|Buchar/.test(C.REFERENCES[28].title) && /SGP4-XP/.test(C.REFERENCES[29].note.en) && /\[29\]/.test(C.TIMELINE[3][1]));
  ok('timeline entries have EN and RU', C.TIMELINE.length === 10 && C.TIMELINE.every(x => x[1] && x[2]));
  ok('the propagator is labelled “not SGP4” in the lede, the track and error charts and their status lines (EN + RU)', /It is not SGP4, the model the element sets were made for/.test(doc.querySelector('.lede').getAttribute('data-en')) && /Это не SGP4/.test(doc.querySelector('.lede').getAttribute('data-ru')) && /not SGP4/.test($('gtSvg').getAttribute('data-aria-en')) && /не SGP4/.test($('gtSvg').getAttribute('data-aria-ru')) && /not SGP4/.test($('gtStatus').textContent) && /not SGP4/.test($('erStatus').textContent));
  ok('dated claim worded “as of November 2026” (EN + RU)', /As of November 2026/.test(en('#ch4')) && /По состоянию на ноябрь 2026 года/.test(ru('#ch4')));
  doc.querySelector('#tlePre .btn').click();
  ok('every field explanation starts with its line and columns, and the epoch text gives the year rule and the day fraction (review C, S7)', (() => { let okAll = true; doc.querySelectorAll('#tleFld .btn').forEach(b => { b.click(); if(!/^(Line [12], columns? \d+|Both lines, columns? \d+)/.test($('tleStatus').textContent)) okAll = false; }); doc.querySelector('#tleFld .btn[data-f="epoch"]').click(); const t = $('tleStatus').textContent; return okAll && /Line 1, columns 19–32/.test(t) && /57–99 mean 1957–1999/.test(t) && /0\.30312735 × 24 h = 7 h 16 min 30 s/.test(t); })());
  ok('the n field works the size out: T = 1,440 ÷ 15.49368 = 92.94 min, Kepler a = 6796.7 km, SGP a = 6796.5 km', (() => { doc.querySelector('#tleFld .btn[data-f="n"]').click(); const t = $('tleStatus').textContent; return /92\.94/.test(t) && /6796\.7/.test(t) && /6796\.5/.test(t) && near(Math.cbrt(C.MU*Math.pow(86400/iss.n, 2)/(4*Math.PI*Math.PI)), iss.aKepler, 1e-6); })());
  ok('the decoder scrolls the highlighted field into view when the box is narrower than the lines (review C, M1)', (() => { const box = $('tleBox'); Object.defineProperty(box, 'clientWidth', {value:322, configurable:true}); Object.defineProperty(box, 'scrollWidth', {value:552, configurable:true}); doc.querySelector('#tleFld .btn[data-f="sum"]').click(); const on = box.querySelector('.tf.on'); Object.defineProperty(on, 'offsetLeft', {value:500, configurable:true}); Object.defineProperty(on, 'offsetWidth', {value:8, configurable:true}); doc.querySelector('#tleFld .btn[data-f="rev"]').click(); const on2 = box.querySelector('.tf.on'); Object.defineProperty(on2, 'offsetLeft', {value:460, configurable:true}); Object.defineProperty(on2, 'offsetWidth', {value:40, configurable:true}); box.scrollLeft = 0; w.__elements.tleReveal(); const moved = box.scrollLeft; delete box.clientWidth; delete box.scrollWidth; return moved === 230 && !!doc.querySelector('.tle-hint[data-ru]'); })());
  ok('instrument 1 status compares M and ν in degrees: “almost the same” for the ISS, a gap for the Molniya (review C, M3)', (() => { doc.querySelector('#elPre .btn[data-s="iss"]').click(); const a = $('elStatus').textContent; doc.querySelector('#elPre .btn[data-s="mol"]').click(); const b = $('elStatus').textContent; doc.querySelector('#elPre .btn[data-s="iss"]').click(); return /M = 335\.9° and ν = 335\.9°: almost the same/.test(a) && /M = 16\.7° but ν = 84\.3°/.test(b) && /ahead/.test(b); })());
  ok('instrument 1 opens with the ISS orbit seen as an ellipse, not edge-on: |normal · view| > 0.3 for the four inclined presets', (() => { const el = 25*D, az = 270*D, view = [Math.cos(el)*Math.cos(az), Math.cos(el)*Math.sin(az), Math.sin(el)]; return ['iss', 'sso', 'gps', 'mol'].every(id => { const t = S(id).t, i = t.inc*D, O = t.raan*D; return Math.abs(Math.sin(i)*Math.sin(O)*view[0] - Math.sin(i)*Math.cos(O)*view[1] + Math.cos(i)*view[2]) > 0.3; }) && /EL_VIEW_AZ = 270/.test(doc.documentElement.innerHTML); })());
  ok('map labels fit at 390 px: left margin 42 units for a 13-unit font, U+2212 minus on southern and western labels, last time tick anchored at its end (review C, M2)', (() => { doc.querySelector('#erPre .btn[data-c="van"]').click(); const tx = Array.from($('gtSvg').querySelectorAll('text')).map(x => x.textContent); const er = Array.from($('erSvg').querySelectorAll('text')).filter(x => /72 h/.test(x.textContent)); return tx.includes('−60°') && tx.includes('−120°') && !tx.some(s => /^-\d/.test(s)) && er.length === 1 && er[0].getAttribute('text-anchor') === 'end' && Array.from($('elSvg').querySelectorAll('text')).some(x => /March equinox/.test(x.textContent) && x.getAttribute('text-anchor') === 'end' && +x.getAttribute('x') <= 474); })());
  ok('Kepler-only mode says the plane does not move and shows no node drift (reviews A S4, C S8)', (() => { doc.querySelector('#gtPre .btn[data-s="iss"]').click(); doc.querySelector('#gtMode .btn[data-m="kepler"]').click(); const s1 = $('gtStatus').textContent, r1 = $('gtReadout').textContent; doc.querySelector('#gtMode .btn[data-m="j2"]').click(); return /the orbit plane does not move/.test(s1) && /23\.30°/.test(r1) && /none/.test(r1) && !/bulge moves the node/.test(s1) && /23\.60°/.test($('gtReadout').textContent); })());
  ok('readout labels keep their case: ν, n and km are not upper-cased by CSS (review C, S9)', /\.readout-cell \.rl\{text-transform:none;\}/.test(Array.from(doc.querySelectorAll('style')).map(x => x.textContent).join('')));
  ok('Russian: decimal years take «года», the HUD uses «с. ш.» and not «°С», Kepler-only status starts with a capital (review C, S10, S11, S14)', (() => { doc.querySelector('#langtoggle button[data-lang="ru"]').click(); doc.querySelector('#j2PreRow .btn[data-s="gps"]').click(); const a = $('j2Readout').textContent; doc.querySelector('#gtMode .btn[data-m="kepler"]').click(); const hud = doc.getElementById('hud-alt').textContent, st = $('gtStatus').textContent; doc.querySelector('#gtMode .btn[data-m="j2"]').click(); doc.querySelector('#j2PreRow .btn[data-s="iss"]').click(); doc.querySelector('#langtoggle button[data-lang="en"]').click(); return /25,7\u00a0года/.test(a) && !/\d\u00a0лет/.test(a) && /с\.\u00a0ш\.|ю\.\u00a0ш\./.test(hud) && !/°С/.test(hud) && /^Только Кеплер/.test(st); })());
  doc.querySelector('#tleFld .btn[data-f="epoch"]').click();
  ok('TLE lines render all 69 characters with the chosen field highlighted', $('tleL1').textContent.replace(/ /g, ' ') === S('iss').l1 && $('tleL2').textContent.replace(/ /g, ' ') === S('iss').l2 && doc.querySelectorAll('#tleBox .tf.on').length >= 1);
  let bad = [];
  const outs = ['elReadout', 'elStatus', 'tleReadout', 'tleStatus', 'gtReadout', 'gtStatus', 'j2Readout', 'j2Status', 'erReadout', 'erStatus'];
  const scan = tag => outs.forEach(id => { if(/NaN|undefined|Infinity|null/.test($(id).textContent)) bad.push(tag + ':' + id); });
  ['en', 'ru'].forEach(l => {
    doc.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    doc.querySelectorAll('#elPre .btn, #tlePre .btn, #tleFld .btn, #gtPre .btn, #gtMode .btn, #j2PreRow .btn, #erPre .btn').forEach(b => { b.click(); scan(l + ':' + (b.getAttribute('data-s') || b.getAttribute('data-f') || b.getAttribute('data-m') || b.getAttribute('data-c'))); });
    doc.querySelectorAll('#tlePre .btn').forEach(b => { b.click(); doc.querySelectorAll('#tleFld .btn').forEach(f => { f.click(); scan(l + ':tle'); }); });
    doc.querySelectorAll('#erPre .btn').forEach(b => { b.click(); const k = $('erK'); [0, +k.max].forEach(v => { k.value = v; k.dispatchEvent(new w.Event('input')); scan(l + ':erK'); }); });
    doc.querySelectorAll('input[type=range]').forEach(r => { if(r.id === 'erK') return; [r.min, r.max].forEach(v => { r.value = v; r.dispatchEvent(new w.Event('input')); scan(l + ':' + r.id + '=' + v); }); });
  });
  ok('all presets, fields and slider ends render without NaN in EN and RU', bad.length === 0, bad.slice(0, 6).join(','));
  $('elA').value = 6500; $('elE').value = 0.5; $('elE').dispatchEvent(new w.Event('input'));
  ok('a perigee below 100 km is called “Not an orbit” (EN) and stops the J2 instrument', /Это не орбита/.test($('elStatus').textContent) || /Not an orbit/.test($('elStatus').textContent));
  $('j2A').value = 6500; $('j2E').value = 0.5; $('j2E').dispatchEvent(new w.Event('input'));
  ok('J2 instrument shows no rates out of range', /—/.test($('j2Readout').textContent) && /(Out of range|Вне области)/.test($('j2Status').textContent));
  doc.querySelector('#langtoggle button[data-lang="en"]').click();
  doc.querySelector('#elPre .btn').click(); doc.querySelector('#j2PreRow .btn').click(); doc.querySelector('#gtPre .btn').click(); doc.querySelector('#erPre .btn').click(); doc.querySelector('#tlePre .btn').click();
  ok('sliders have aria-valuetext', ['elA', 'elE', 'elI', 'elO', 'elW', 'elM', 'gtH', 'j2A', 'j2E', 'j2I', 'erK'].every(id => $(id).getAttribute('aria-valuetext')));
  ok('charts have role=img and EN + RU aria labels; the TLE box is a focusable labelled region', ['elSvg', 'gtSvg', 'j2Svg', 'erSvg'].every(id => $(id).getAttribute('data-aria-en') && $(id).getAttribute('data-aria-ru') && $(id).getAttribute('role') === 'img') && $('tleBox').getAttribute('tabindex') === '0' && $('tleBox').getAttribute('role') === 'region' && $('tleBox').getAttribute('data-aria-ru'));
  ok('chart lines differ by dash pattern, not colour alone', (() => { const p = Array.from($('erSvg').querySelectorAll('path[fill="none"]')).map(x => x.getAttribute('stroke-dasharray') || ''); return new Set(p).size === 3; })() && (() => { const p = Array.from($('j2Svg').querySelectorAll('path[fill="none"]')).map(x => x.getAttribute('stroke-dasharray') || ''); return p.length === 2 && p[0] !== p[1]; })());
  ok('no raw English month or unit left in Russian status lines', (() => { doc.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = outs.map(id => $(id).textContent).join(' '); doc.querySelector('#langtoggle button[data-lang="en"]').click(); return !/ km\b| days\b| min\b|Nov /.test(t); })());
  console.log(out.join('\n'));
};
