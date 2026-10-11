module.exports = (w, A) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const d = w.document;
  // distances: NASA gives miles [14]; 1 mi = 1.609344 km exactly [18]
  ok('Artemis II farthest 252,756 mi = 406,771 km', Math.round(A.miToKm(252756)) === 406771, A.miToKm(252756).toFixed(1));
  ok('Apollo 13 record 248,655 mi = 400,171 km', Math.round(A.miToKm(248655)) === 400171, A.miToKm(248655).toFixed(1));
  ok('margin over Apollo 13: 4,101 mi ≈ 6,600 km', Math.round(A.miToKm(252756 - 248655)) === 6600, A.miToKm(4101).toFixed(1));
  ok('closest approach 4,067 mi ≈ 6,545 km', Math.round(A.miToKm(4067)) === 6545);
  ok('695,081 mi flown ≈ 1.12 million km', Math.abs(A.miToKm(695081)/1e6 - 1.12) < 0.005, (A.miToKm(695081)/1e6).toFixed(4));
  ok('km→mi round trip', Math.abs(A.kmToMi(A.miToKm(252756)) - 252756) < 1e-6);
  // light time at c = 299,792.458 km/s [17]
  ok('one-way light time at 406,771 km ≈ 1.357 s', Math.abs(A.lightTime(406771) - 1.3568) < 0.0005, A.lightTime(406771).toFixed(4));
  ok('Moon mean 384,400 km: 1.282 s one way', Math.abs(A.lightTime(384400) - 1.2822) < 0.0005, A.lightTime(384400).toFixed(4));
  ok('Artemis II maximum lies beyond the Moon\'s mean distance by ~22,371 km', Math.round(A.miToKm(252756) - A.MOON_KM) === 22371);
  // Accords counts and dates [3]-[9]
  ok('first point: 8 founding signatories, 13 Oct 2020', A.ACC[0].n === 8 && A.ACC[0].d === '2020-10-13');
  ok('last point: 76 on 25 Sep 2026 (San Marino)', A.ACC[A.ACC.length-1].n === 76 && A.ACC[A.ACC.length-1].d === '2026-09-25');
  ok('counts and dates strictly increase', A.ACC.every((p, i) => i === 0 || (p.n > A.ACC[i-1].n && p.d > A.ACC[i-1].d)));
  const all = A.accordsRate(0, 7);
  ok('whole history: 68 nations in 2,173 days (5.949 years) ≈ 11.43 a year, one every 32 days', all.added === 68 && all.days === 2173 && Math.abs(all.perYear - 11.43) < 0.01 && Math.round(all.daysPer) === 32, all.perYear.toFixed(3));
  const late = A.accordsRate(3, 7);
  ok('26 Oct 2025 → 25 Sep 2026: 17 nations in 334 days ≈ 18.59 a year', late.added === 17 && late.days === 334 && Math.abs(late.perYear - 18.59) < 0.01, late.perYear.toFixed(2));
  ok('Oct 2020 → Dec 2024: 42 nations in 1,520 days ≈ 10.09 a year', A.accordsRate(0, 2).added === 42 && A.accordsRate(0, 2).days === 1520 && Math.abs(A.accordsRate(0, 2).perYear - 10.09) < 0.01, A.accordsRate(0, 2).perYear.toFixed(3));
  ok('order of the two picks does not matter', A.accordsRate(7, 3).added === 17);
  ok('same point twice gives no rate', A.accordsRate(4, 4).perYear === 0);
  // page behaviour: presets, sliders, both languages, no NaN
  let bad = 0;
  d.querySelectorAll('#accPresets .btn, #distPresets .btn').forEach(b => { b.click(); if(/NaN|undefined/.test(d.getElementById('accReadout').textContent + d.getElementById('distReadout').textContent)) bad++; });
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  d.querySelectorAll('#accPresets .btn, #distPresets .btn').forEach(b => { b.click(); if(/NaN|undefined/.test(d.getElementById('accReadout').textContent + d.getElementById('distReadout').textContent)) bad++; });
  ok('every preset in both languages renders without NaN', bad === 0);
  ok('RU: Artemis II preset reads 406\u00a0771 km (no-break space) and decimal comma', /406\u00a0771/.test(d.getElementById('distReadout').textContent) && /1,357/.test(d.getElementById('distReadout').textContent));
  ok('aria labels switch language', /Ступенчатый/.test(d.getElementById('accSvg').getAttribute('aria-label')));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  const s = d.getElementById('distKm'); s.value = '200000'; s.dispatchEvent(new w.Event('input'));
  ok('slider sets aria-valuetext', /200,000 kilometres/.test(s.getAttribute('aria-valuetext')));
  ok('Orion chips keep keyboard access after re-render', [...d.querySelectorAll('#orionPanel .module-chip')].every(c => c.getAttribute('tabindex') === '0'));

  // M1: browsers snap a range value to min + k*step; jsdom does not, so compute the snap here and require that it
  // changes nothing, then require each preset's readout to show the figure the page quotes.
  const inp = d.getElementById('distKm'), step = +inp.step || 1, min = +inp.min || 0;
  const snap = v => min + Math.round((v - min)/step)*step;
  ok('initial distance value survives step snapping', snap(+inp.getAttribute('value')) === +inp.getAttribute('value'), inp.step);
  const want = {'MOON, MEAN': [384400, '384,400', '238,855'], 'APOLLO 13, 1970': [400171, '400,171', '248,655'], 'ARTEMIS II, 2026': [406771, '406,771', '252,756']};
  d.querySelectorAll('#distPresets .btn').forEach(b => {
    b.click();
    const v = +inp.value, w = want[b.textContent.trim()];
    const cellsTxt = [...d.querySelectorAll('#distReadout .readout-cell')].map(c => c.textContent);
    ok('preset ' + b.textContent.trim() + ': value is a step multiple and equals ' + w[0], snap(v) === v && v === w[0], v);
    ok('preset ' + b.textContent.trim() + ': readout shows ' + w[1] + ' km and ' + w[2] + ' mi', cellsTxt[0].endsWith(w[1]) && cellsTxt[1].endsWith(w[2]), cellsTxt[0] + ' / ' + cellsTxt[1]);
  });
  d.querySelectorAll('#distPresets .btn')[1].click();
  ok('Apollo 13 preset shows +0 km against its own record', /RECORD\+?0 km$/.test([...d.querySelectorAll('#distReadout .readout-cell')][5].textContent), [...d.querySelectorAll('#distReadout .readout-cell')][5].textContent);
  // P2: no per-year figure for spans under MIN_DAYS
  const short = A.accordsRate(6, 7);
  ok('21 → 25 Sep 2026 (4 days): count shown, no annual rate', short.added === 3 && short.days === 4 && short.annualised === false && short.perYear === 0);
  const f = d.getElementById('accFrom'), t = d.getElementById('accTo');
  f.value = '6'; t.value = '7'; f.dispatchEvent(new w.Event('input')); f.dispatchEvent(new w.Event('change'));
  ok('short span: readout shows — and status says too short to annualise', [...d.querySelectorAll('#accReadout .readout-cell')][4].textContent.endsWith('—') && /Too short a span/.test(d.getElementById('accStatus').textContent));
  ok('readout grids are not live regions; status lines are', !d.getElementById('accReadout').hasAttribute('aria-live') && d.getElementById('distStatus').getAttribute('aria-live') === 'polite');
  ok('Accords presets start with aria-pressed', [...d.querySelectorAll('#accPresets .btn')].every(b => b.hasAttribute('aria-pressed')));
  console.log(out.join('\n'));
};
