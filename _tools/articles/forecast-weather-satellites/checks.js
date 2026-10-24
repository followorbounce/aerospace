module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document;
  // CH1 — history arithmetic
  const days = (Date.UTC(1960, 5, 18) - Date.UTC(1960, 3, 1))/864e5;
  ok('TIROS-1: 1 April to 18 June 1960 = 78 days (NOAA: 78-day life)', days === 78, days);
  ok('TIROS-1: 450 miles ≈ 720 km', near(450*1.609344, 724, 5), (450*1.609344).toFixed(0));
  const ats = new Date(Date.UTC(1966, 11, 6, 21 + 5, 12));
  ok('ATS-1: 9:12 p.m. EST on 6 Dec 1966 = 02:12 UTC on 7 Dec (NSSDC date)', ats.getUTCDate() === 7 && ats.getUTCHours() === 2, ats.toISOString());
  // CH2 — geostationary geometry
  ok('geostationary radius from one sidereal day ≈ 42,164 km', near(C.R_GEO, 42164.17, 0.05), C.R_GEO.toFixed(2));
  ok('geostationary altitude ≈ 35,786 km (NOAA: 22,236 miles)', near(C.H_GEO, 35786, 1) && near(22236*1.609344, C.H_GEO, 5), C.H_GEO.toFixed(1));
  ok('limb at 81.3° of arc from the sub-satellite point', near(C.horizonPsi(), 81.30, 0.01), C.horizonPsi().toFixed(3));
  ok('one geostationary satellite sees 42.4 % of the surface', near(C.visibleFraction(), 0.4244, 0.0002), (C.visibleFraction()*100).toFixed(2) + ' %');
  ok('zenith angle reaches 90° exactly at the limb', near(C.geoView(C.horizonPsi()).zen, 90, 0.01), C.geoView(C.horizonPsi()).zen.toFixed(3));
  const p70 = C.psiForZenith(70);
  ok('bisection: zenith(psi for 70°) = 70°', near(C.geoView(p70).zen, 70, 1e-6), p70.toFixed(3) + '°');
  ok('70° viewing limit reaches 61.8° of arc, 26.4 % of the surface', near(p70, 61.83, 0.01) && near(C.capFraction(p70), 0.264, 0.001));
  ok('N–S pixel stretch at 60° on the meridian ≈ × 2.94 (spherical)', near(C.nsStretch(60), 2.94, 0.01), C.nsStretch(60).toFixed(3));
  ok('nadir stretch = 1', near(C.nsStretch(0), 1, 1e-12));
  // CH2 — polar orbiter
  ok('NOAA-21 at 824 km: period ≈ 101.4 min', near(C.circPeriodMin(824), 101.38, 0.02), C.circPeriodMin(824).toFixed(2));
  ok('≈ 14 orbits a day (NOAA: "14 times a day")', Math.round(C.orbitsPerDay(824)) === 14, C.orbitsPerDay(824).toFixed(2));
  ok('Earth turns ≈ 25.4° per orbit', near(C.trackShiftDeg(824), 25.41, 0.02), C.trackShiftDeg(824).toFixed(2));
  const spacing = 2*Math.PI*6371/C.orbitsPerDay(824);
  ok('equatorial track spacing ≈ 2,820 km < 3,000 km VIIRS swath', near(spacing, 2818, 10) && spacing < C.VIIRS_SWATH, spacing.toFixed(0));
  ok('looks per day at the equator ≥ 2 (NOAA: global coverage twice daily)', C.polarLooksPerDay(0, 824, 3000) >= 2, C.polarLooksPerDay(0, 824, 3000).toFixed(2));
  ok('looks per day capped at one per orbit at the pole', near(C.polarLooksPerDay(90, 824, 3000), C.orbitsPerDay(824), 1e-9));
  // CH4 — fixed-grid footprints
  const ifov = C.abiStep(2);
  ok('ABI file grid steps (scale_factor): 2 km = 56 µrad, 1 km = 28, 0.5 km = 14', ifov === 5.6e-5 && C.abiStep(1) === 2.8e-5 && C.abiStep(0.5) === 1.4e-5, (ifov*1e6).toFixed(2));
  ok('nominal 2 km ÷ 35,786 km = 55.9 µrad, within 0.3 % of the file step', near(C.ifovFor(2, C.H_GEO)*1e6, 55.89, 0.01) && Math.abs(C.ifovFor(2, C.H_GEO)/ifov - 1) < 0.003, (C.ifovFor(2, C.H_GEO)*1e6).toFixed(2));
  ok('GOES-East fixed grid centred on 75.0° W (ABI file longitude_of_projection_origin)', C.GOES_EAST === -75.0);
  ok('same 56 µrad at 824 km ≈ 46 m', near(C.gsd(ifov, 824)*1000, 46, 0.5), (C.gsd(ifov, 824)*1000).toFixed(1));
  let rt = 0; [[0, -75.2], [38.5, -98], [-34.6, -58.4], [60, -75.2], [64.1, -21.9]].forEach(p => { const q = C.llToXY(p[0], p[1], C.GOES_EAST), r = C.xyToLL(q.x, q.y, C.GOES_EAST); rt = Math.max(rt, Math.abs(r.lat - p[0]), Math.abs(r.lon - p[1])); });
  ok('fixed-grid projection round trip (lat/lon → x/y → lat/lon) < 1e-9°', rt < 1e-9, rt.toExponential(1));
  const fN = C.footprint(0, -75.2, C.GOES_EAST, ifov);
  ok('nadir pixel ≈ 2.0 × 2.0 km', near(fN.ew, 2, 0.01) && near(fN.ns, 2, 0.02), fN.ew.toFixed(3) + ' × ' + fN.ns.toFixed(3));
  const fK = C.footprint(38.5, -98, C.GOES_EAST, ifov);
  ok('Kansas ≈ 2.4 × 3.1 km (CIRA simulation: ≈ 2.4 × 3.2)', near(fK.ew, 2.4, 0.05) && near(fK.ns, 3.2, 0.1), fK.ew.toFixed(2) + ' × ' + fK.ns.toFixed(2));
  const f60 = C.footprint(60, -75.2, C.GOES_EAST, ifov);
  ok('60° N on the meridian ≈ 2.2 × 5.9 km', near(f60.ew, 2.19, 0.02) && near(f60.ns, 5.87, 0.05), f60.ew.toFixed(2) + ' × ' + f60.ns.toFixed(2));
  ok('ellipsoid footprint at 60° N agrees with the spherical stretch to 1 %', near(f60.ns/fN.ns, C.nsStretch(60), 0.01*C.nsStretch(60)), (f60.ns/fN.ns).toFixed(3));
  const fR = C.footprint(64.1, -21.9, C.GOES_EAST, ifov);
  ok('Reykjavik ≈ 7.5 × 19 km', near(fR.ew, 7.45, 0.05) && near(fR.ns, 18.6, 0.1), fR.ew.toFixed(2) + ' × ' + fR.ns.toFixed(2));
  ok('Anchorage is beyond GOES-East\'s limb', C.footprint(61.2, -149.9, C.GOES_EAST, ifov) === null);
  // CH5 — Planck and the lapse rate
  ok('10.3 µm = 970.9 cm⁻¹', near(C.NU13, 970.87, 0.01), C.NU13.toFixed(2));
  let worst = 0; for(let T = 180; T <= 330; T += 0.5){ worst = Math.max(worst, Math.abs(C.brightnessT(C.NU13, C.planckNu(C.NU13, T)) - T), Math.abs(C.brightnessT(C.NU15, C.planckNu(C.NU15, T)) - T)); }
  ok('Planck inversion round trip 180–330 K exact (< 1e-9 K)', worst < 1e-9, worst.toExponential(1));
  ok('Planck integral × π = σT⁴ at 300 K (constants consistent)', near(C.sbIntegral(300)/(C.SIGMA*300**4), 1, 1e-5), C.sbIntegral(300).toFixed(3) + ' W/m²');
  ok('radiance at 10.3 µm, 300 K ≈ 104.6 mW/(m² sr cm⁻¹)', near(C.planckNu(C.NU13, 300), 104.56, 0.05), C.planckNu(C.NU13, 300).toFixed(2));
  ok('lapse 6.5 K/km vs NASA model 6.49 K/km (within 0.02)', near(6.5, 0.00649*1000, 0.02));
  ok('1 km stratus at 281.65 K; 11 km anvil at 216.65 K', near(C.stdT(1), 281.65, 1e-9) && near(C.stdT(11), 216.65, 1e-9));
  ok('opaque cloud at 5 km: height retrieved exactly', near(C.heightFromT(C.pixelBT(C.NU13, 5, 1)), 5, 1e-9));
  ok('tropopause ambiguity: 12 km and 15 km read the same', near(C.pixelBT(C.NU13, 12, 1), C.pixelBT(C.NU13, 15, 1), 1e-12));
  const b13 = C.pixelBT(C.NU13, 8, 0.5), b15 = C.pixelBT(C.NU15, 8, 0.5);
  ok('half-filled pixel at 8 km reads warmer than the mean of cloud and ground', b13 > (C.stdT(8) + 288.15)/2, b13.toFixed(2));
  ok('half-filled pixel at 8 km looks ≈ 3.4 km high', near(C.heightFromT(b13), 3.35, 0.05), C.heightFromT(b13).toFixed(2));
  ok('mixed pixel gives a positive split-window difference (≈ +1 K), overcast gives 0', near(b13 - b15, 0.98, 0.05) && near(C.pixelBT(C.NU13, 8, 1) - C.pixelBT(C.NU15, 8, 1), 0, 1e-9), (b13 - b15).toFixed(3));
  ok('Nimbus: seven launched 1964–1978 (Nimbus 7 flew on after 1978)', /launched between 1964 and 1978/.test(d.getElementById('ch1').querySelector('.body-col:nth-of-type(2)').getAttribute('data-en')));
  // freshness and references
  ok('timeline runs 1960 → 2027 with 14 entries', C.TIMELINE.length === 14 && C.TIMELINE[0][0] === '1960' && C.TIMELINE[13][0] === '2027');
  ok('41 references, all https', C.REFERENCES.length === 41 && C.REFERENCES.every(r => /^https:\/\//.test(r.url)));
  ok('the fleet chapter is dated "October 2026"', /OCTOBER 2026/.test(d.getElementById('ch6').textContent));
  ok('links to SUNSYNC instead of repeating it', /sunsync-earth-observation/.test(d.getElementById('ch1').innerHTML));
  ok('lede says nine chapters, matching the page', /Nine chapters/.test(d.querySelector('.lede').getAttribute('data-en')) && d.querySelectorAll('section[id^="ch"]').length === 9);
  // UI: every preset renders without NaN in both languages, sliders carry aria-valuetext
  let nan = 0;
  ['en', 'ru'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('.btn-row .btn').forEach(b => { b.click(); ['cvReadout', 'pxReadout', 'btReadout', 'cvStatus', 'pxStatus', 'btStatus'].forEach(id => { if(/NaN|undefined|Infinity/.test(d.getElementById(id).textContent)) nan++; }); }); });
  ok('all presets render without NaN/undefined in EN and RU', nan === 0, nan);
  ok('every slider has aria-valuetext', [...d.querySelectorAll('input[type=range]')].every(r => (r.getAttribute('aria-valuetext') || '').length > 0));
  let latinK = 0; d.querySelectorAll('[data-ru]').forEach(el => { if(/\d K(?![A-Za-z])/.test(el.getAttribute('data-ru'))) latinK++; });
  ['cvReadout', 'pxReadout', 'btReadout', 'btStatus', 'timeline', 'refList'].forEach(id => { if(/\d K(?![A-Za-z])/.test(d.getElementById(id).textContent)) latinK++; });
  ok('RU: no Latin K after a number', latinK === 0, latinK);
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  console.log(out.join('\n'));
};
