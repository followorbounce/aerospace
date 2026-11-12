module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const doc = w.document, $ = id => doc.getElementById(id);
  // Constants and dates
  ok('1° of arc on Mars = 59.16 km (R = 3,389.5 km, NSSDC [27])', near(C.KM_PER_DEG, 59.157, 0.001), C.KM_PER_DEG.toFixed(3));
  ok('sol = 24.6597 h = 88,775 s', near(C.SOL_MS/1000, 88775, 1), C.SOL_MS/1000);
  ok('4 May 2022 falls on sol 1,222 (S1222a [10]), within one sol', Math.abs(C.solOf(Date.UTC(2022, 4, 4, 12)) - 1222) < 1, C.solOf(Date.UTC(2022, 4, 4, 12)).toFixed(2));
  ok('11 Dec 2022 falls on sol 1,436 ([9])', Math.round(C.solOf(Date.UTC(2022, 11, 11, 12))) === 1436, C.solOf(Date.UTC(2022, 11, 11, 12)).toFixed(2));
  ok('9 Jan 2021 falls on sol 754 (last mole test [29])', Math.abs(C.solOf(Date.UTC(2021, 0, 9, 12)) - 754) < 1, C.solOf(Date.UTC(2021, 0, 9, 12)).toFixed(2));
  ok('2 Feb 2019 falls on sol 66 (shield [6])', Math.abs(C.solOf(Date.UTC(2019, 1, 2, 12)) - 66) < 1, C.solOf(Date.UTC(2019, 1, 2, 12)).toFixed(2));
  ok('6 Apr 2019 falls on sol 128 (first marsquake [4])', Math.abs(C.solOf(Date.UTC(2019, 3, 6, 12)) - 128) < 1, C.solOf(Date.UTC(2019, 3, 6, 12)).toFixed(2));
  ok('last contact 15 Dec 2022 ≈ sol 1,440 (preset)', Math.abs(C.solOf(Date.UTC(2022, 11, 15, 12)) - 1440) < 1, C.solOf(Date.UTC(2022, 11, 15, 12)).toFixed(2));
  // CH3 — distances and moments
  ok('27°–40° = about 1,600–2,370 km (text)', near(27*C.KM_PER_DEG, 1600, 5) && near(40*C.KM_PER_DEG, 2370, 5), (27*C.KM_PER_DEG).toFixed(0) + '–' + (40*C.KM_PER_DEG).toFixed(0));
  ok('S1222a 37° ≈ 2,190 km (text)', near(37*C.KM_PER_DEG, 2190, 5), (37*C.KM_PER_DEG).toFixed(0));
  const e = id => C.EVENTS.find(x => x.id === id);
  ok('S1094b 3,532 km = 59.7° (MQS 59.7 ± 6° [17])', near(e('S1094b').d, 59.7, 0.05), e('S1094b').d.toFixed(2));
  ok('S1000a 7,460 km = 126.1°, matches 125.9° of [22] within 0.3°', near(e('S1000a').d, 125.9, 0.3), e('S1000a').d.toFixed(2));
  ok('four small impacts 85–290 km = 1.4°–4.9°', near(C.SMALL_IMPACTS.d0, 1.44, 0.01) && near(C.SMALL_IMPACTS.d1, 4.90, 0.01));
  ok('Hanks–Kanamori: M 4.7 → 1.26 × 10¹⁶ N·m', near(C.moment(4.7)/1e16, 1.259, 0.002), C.moment(4.7).toExponential(3));
  ok('one magnitude unit = ×31.6 in moment (eq-note)', near(C.moment(5)/C.moment(4), 31.62, 0.01));
  const r = C.moment(4.7)/C.moment(4.2);
  ok('S1222a vs S0976a: moment ratio 5.6 ≈ “five times” [11]', r > 4.5 && r < 6.5, r.toFixed(2));
  ok('circular crack: M4.7 at 1 MPa → rupture radius ≈ 1.77 km', near(C.ruptureRadius(C.moment(4.7), 1e6), 1765, 10), C.ruptureRadius(C.moment(4.7), 1e6).toFixed(0));
  ok('crack relation inverts: (16/7) Δσ a³ = M0', near(16/7*1e6*Math.pow(C.ruptureRadius(3e15, 1e6), 3)/3e15, 1, 1e-9));
  // CH5 — core numbers and the toy ray model
  ok('straight-ray shadow edge 114.6° for 1,830 km (eq-note)', near(C.shadowEdge(1830), 114.6, 0.05), C.shadowEdge(1830).toFixed(2));
  ok('straight-ray shadow edge 121.7° for 1,650 km (eq-note)', near(C.shadowEdge(1650), 121.7, 0.05), C.shadowEdge(1650).toFixed(2));
  ok('Khan 2023: 1,675 + 150 km layer ≈ 1,825 km, within 2021\'s 1,830 ± 40', near(1675 + 150, 1830, 40));
  ok('core shrank 1,830 → 1,650 km = 180 km (quote)', 1830 - 1650 === 180);
  const fits = [1650, 1675, 1795, 1830].map(rc => [rc, C.fitMantle(rc)]);
  fits.forEach(([rc, m]) => {
    const t = C.rayTimes(C.S1000A.d, rc);
    ok('toy reproduces S1000a SKS−PP 344.2 s and SS−SKS 401.4 s at ' + rc + ' km [22]', near(t.SKS - t.PP, 344.2, 0.3) && near(t.SS - t.SKS, 401.4, 0.3), (t.SKS - t.PP).toFixed(2) + ' / ' + (t.SS - t.SKS).toFixed(2));
  });
  ok('fitted effective speeds 6.3–6.6 and 3.8–3.9 km/s (note)', fits.every(([, m]) => m.vp > 6.25 && m.vp < 6.65 && m.vs > 3.75 && m.vs < 3.95), fits.map(([rc, m]) => rc + ':' + m.vp.toFixed(2) + '/' + m.vs.toFixed(3)).join(' '));
  const ss976 = (() => { const t = C.rayTimes(146, 1675); return t.SS - t.PP; })();
  ok('toy predicts S0976a SS−PP within 2 % of observed 858.5 s [22] (independent check)', Math.abs(ss976/858.5 - 1) < 0.02, ss976.toFixed(1));
  const sk976 = (() => { const t = C.rayTimes(146, 1675); return t.SKS - t.PP; })();
  ok('toy misses S0976a SKS−PP (311.0 s) by tens of seconds, as the status says', sk976 < 311 - 20 && sk976 > 311 - 90, sk976.toFixed(1));
  ok('mantle-speed trade-off 1,650 vs 1,830 km is a few per cent', (() => { const d = C.fitMantle(1830).vs/C.fitMantle(1650).vs - 1; return d > 0.01 && d < 0.06; })(), (C.fitMantle(1830).vs/C.fitMantle(1650).vs - 1).toFixed(4));
  ok('S1000a and S0976a lie in the straight-ray shadow for every preset core', [1650, 1675, 1795, 1830].every(rc => !C.directOK(125.9, rc) && !C.directOK(146, rc)));
  ok('S1222a (37°) has direct P and S and no SKS', (() => { const t = C.rayTimes(37, 1675); return t.P > 0 && t.S > t.P && t.SKS === null; })());
  ok('SKS geometry closes: 2·a1 + core chord angle = Δ', (() => { const m = C.fitMantle(1675), g = C.sksGeom(140, m.vs, 1675); return g && g.a1 > 0 && g.Lc > 0 && g.Lc < 2*1675; })());
  ok('shadow covers less than half the surface for straight rays (real rays: half [21])', C.shadowShare(1830) < 0.5 && C.shadowShare(1830) > 0.25, C.shadowShare(1830).toFixed(3));
  // CH6 — mole friction model
  ok('K0(35°) = 0.426, μ(35°) = 0.431', near(C.k0(35), 0.4264, 0.001) && near(C.muWall(35), 0.4314, 0.001));
  const full = C.hullFriction(0.40, 35, C.G_MARS, 0), q3 = C.hullFriction(0.30, 35, C.G_MARS, 0);
  ok('fully buried 40 cm hull on Mars grips ≈ the 5–7 N recoil [29]', full > 4.5 && full < 7.5, full.toFixed(2));
  ok('¾ buried (30 cm) on Mars stays below 5 N: springs needed until then [29]', q3 < 5, q3.toFixed(2));
  ok('Earth/Mars gravity ratio 2.63 (status)', near(C.G_EARTH/C.G_MARS, 2.633, 0.001));
  ok('on Earth the same sand holds well above 7 N when fully buried', C.hullFriction(0.40, 35, C.G_EARTH, 0) > 7, C.hullFriction(0.40, 35, C.G_EARTH, 0).toFixed(2));
  ok('with a 20 cm duricrust the grip at the final ~37 cm is below 5 N even at φ = 40°', C.hullFriction(0.37, 40, C.G_MARS, 0.20) < 5, C.hullFriction(0.37, 40, C.G_MARS, 0.20).toFixed(2));
  ok('no grip at all while the hull is within the crust', C.hullFriction(0.15, 35, C.G_MARS, 0.20) === 0);
  ok('pinning with the scoop (10 N) adds μ·10 N ≈ 4.3 N', near(C.moleForce(0, 35, C.G_MARS, 0, 10), 4.31, 0.02));
  ok('force model in the plotted range (≤ 16 N) for all slider settings', C.moleForce(0.40, 40, C.G_EARTH, 0, 10) < 21 && C.hullFriction(0.40, 40, C.G_EARTH, 0) < 16);
  // CH7 — power model
  ok('perihelion in June 2022 and aphelion in July 2021 (text)', (() => { const dp = new Date(C.solMs(C.EXT.solMin)), da = new Date(C.solMs(C.EXT.solMax)); return dp.getUTCFullYear() === 2022 && dp.getUTCMonth() === 5 && da.getUTCFullYear() === 2021 && da.getUTCMonth() === 6; })());
  ok('Mars–Sun distance range 1.381–1.666 AU (NSSDC 206.65–249.26 Gm)', near(C.EXT.rMin*149.598, 206.65, 0.5) && near(C.EXT.rMax*149.598, 249.26, 0.5), C.EXT.rMin.toFixed(4) + '–' + C.EXT.rMax.toFixed(4));
  const third = 1 - Math.pow(C.EXT.rMin/C.EXT.rMax, 2);
  ok('aphelion sunlight ~31 % below perihelion (“about a third”)', third > 0.28 && third < 0.34, third.toFixed(3));
  ok('model passes 4,588 Wh on sol 1 [31]', near(C.powerWh(1), 4588, 0.5));
  ok('model passes ~500 Wh on 17 May 2022 [32]', near(C.powerWh(C.MAY2022.sol), 500, 0.5), C.MAY2022.sol.toFixed(1));
  const oct = C.powerWh(C.solOf(Date.UTC(2022, 9, 3)));
  ok('model within a sixth (≤ 17 %) of the pre-storm 425 Wh of Oct 2022 [33]', Math.abs(oct/425 - 1) < 0.17, oct.toFixed(0));
  const sw = C.sweepGain(C.MAY2022.sol, 0.25);
  ok('sweeping 25 % clean in May 2022 adds ≈ 1,000 Wh (NASA [32]) within 15 %', Math.abs(sw/1000 - 1) < 0.15, sw.toFixed(0));
  ok('oven scale: 5,000 Wh = 100 min, 500 Wh = 10 min ([32])', near(5000/C.OVEN_WH_PER_MIN, 100, 1e-9) && near(500/C.OVEN_WH_PER_MIN, 10, 1e-9));
  ok('dust e-folding time positive and finite', C.TAU > 300 && C.TAU < 900, C.TAU.toFixed(1));
  // Text and UI consistency
  ok('9 chapters, lede says “Nine chapters and four instruments”', doc.querySelectorAll('.section .fig-num').length === 9 && /Nine chapters and four instruments/.test(doc.querySelector('.lede').getAttribute('data-en')) && /Девять глав и четыре прибора/.test(doc.querySelector('.lede').getAttribute('data-ru')));
  ok('at least 18 references', C.REFERENCES.length >= 18, C.REFERENCES.length);
  // Review panel (2026-11-12)
  ok('22 May 2021 falls on sol 884 (sand-trickling power boost [40])', Math.abs(C.solOf(Date.UTC(2021, 4, 22, 12)) - 884) < 1, C.solOf(Date.UTC(2021, 4, 22, 12)).toFixed(2));
  ok('40 references; [37] names Lognonné as SEIS PI, [38] the >1,900-event reference catalogue, [39] Jáky K0, [40] the 30 Wh boost', C.REFERENCES.length === 40 && /Lognonné/.test(C.REFERENCES[36].note.en) && /1,900/.test(C.REFERENCES[37].note.en) && /1 − sin φ/.test(C.REFERENCES[38].note.en) && /30 Wh/.test(C.REFERENCES[39].note.en), C.REFERENCES.length);
  ok('night-time detection cited to an opened JPL page, not the paywalled catalogue paper', /usually finds marsquakes at night/.test(C.REFERENCES[7].note.en));
  ok('1,319 is presented as the end-of-mission count, beside the >1,900-event reference catalogue', /over 1,900 events \[38\]/.test(doc.querySelector('#ch3').innerHTML.replace(/&amp;/g, '&')) || /1,900/.test(Array.from(doc.querySelectorAll('#ch3 [data-en]')).map(e => e.getAttribute('data-en')).join(' ')));
  ok('no unverified event name S0128a in the text', !/S0128a/.test(doc.body.innerHTML) && !Array.from(doc.querySelectorAll('[data-en]')).some(e => /S0128a/.test(e.getAttribute('data-en') + e.getAttribute('data-ru'))));
  ok('Jáky K0 = 1 − sin φ is cited in the eq-note', Array.from(doc.querySelectorAll('[data-en]')).some(e => /Jáky/.test(e.getAttribute('data-en')) && /\[39\]/.test(e.getAttribute('data-en'))));
  ok('ray-path and power charts are labelled as models (EN + RU aria)', /^Toy model/.test($('rcSvg').getAttribute('data-aria-en')) && /^Учебная модель/.test($('rcSvg').getAttribute('data-aria-ru')) && /^Model/.test($('pwSvg').getAttribute('data-aria-en')) && /^Модель/.test($('pwSvg').getAttribute('data-aria-ru')));
  ok('every reference has a URL and EN + RU notes', C.REFERENCES.every(x => /^https:\/\//.test(x.url) && x.note.en && x.note.ru));
  ok('timeline entries have EN and RU', C.TIMELINE.every(x => x[1] && x[2]));
  ok('sci() formats 1.26 × 10¹⁶', C.sci(1.2589e16, 2).indexOf('10¹⁶') > 0);
  // presets and languages render without NaN
  let bad = [];
  ['en', 'ru'].forEach(l => {
    doc.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    doc.querySelectorAll('#mqPre .btn, #rcPreR .btn, #rcPreD .btn, #mlGrav .btn, #mlSoil .btn, #pwPre .btn, #pwSweep').forEach(b => {
      b.click();
      ['mqReadout', 'rcReadout', 'mlReadout', 'pwReadout', 'mqStatus', 'rcStatus', 'mlStatus', 'pwStatus'].forEach(id => { if(/NaN|undefined|Infinity/.test($(id).textContent)) bad.push(l + ':' + id); });
    });
    [1, 60, 100, 120, 179].forEach(d => { $('rcD').value = d; $('rcD').dispatchEvent(new w.Event('input')); if(/NaN|undefined/.test($('rcReadout').textContent)) bad.push(l + ':rcD' + d); });
    [1500, 1900].forEach(v => { $('rcR').value = v; $('rcR').dispatchEvent(new w.Event('input')); if(/NaN|undefined/.test($('rcReadout').textContent + $('rcStatus').textContent)) bad.push(l + ':rcR' + v); });
  });
  doc.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('all presets and slider ends render without NaN in EN and RU', bad.length === 0, bad.join(','));
  ok('sliders have aria-valuetext', ['mqM', 'mqS', 'rcR', 'rcD', 'mlL', 'mlP', 'mlN', 'pwS'].every(id => $(id).getAttribute('aria-valuetext')));
  ok('charts have EN and RU aria labels', ['mqSvg', 'rcSvg', 'mlSvg', 'pwSvg'].every(id => $(id).getAttribute('data-aria-en') && $(id).getAttribute('data-aria-ru') && $(id).getAttribute('role') === 'img'));
  console.log(out.join('\n'));
};
