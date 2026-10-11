module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const K = C.K, doc = w.document;
  /* Wien's law and the drawn Planck curve agree: c2 / b is the Wien x = 4.965114 */
  ok('Wien: Sun 5,772 K peaks at 0.502 µm', Math.abs(C.wienPeak(5772) - 0.50204) < 0.0001, C.wienPeak(5772).toFixed(5));
  ok('Wien: human 310 K peaks near 9.35 µm (MIRI band)', Math.abs(C.wienPeak(310) - 9.3477) < 0.001 && C.sees(C.wienPeak(310)).webb && !C.sees(C.wienPeak(310)).hubble);
  ok('Wien: a 300 K telescope glows at 9.66 µm, inside Webb\'s own band', C.sees(C.wienPeak(300)).webb, C.wienPeak(300).toFixed(2));
  ok('Wien: Webb mirror 40 K peaks at 72 µm, beyond its 28.5 µm band', C.wienPeak(40) > K.WEBB_MAX, C.wienPeak(40).toFixed(1));
  ok('c2 / b = 4.965114 (curve and Wien law consistent)', Math.abs(K.C2_UM / K.WIEN_UM - 4.965114) < 1e-6);
  /* hydrogen lines from the Rydberg constant vs the standard vacuum wavelengths */
  ok('Lyman-alpha 121.567 nm (vacuum)', Math.abs(C.LYA*1000 - 121.567) < 0.002, (C.LYA*1000).toFixed(4));
  ok('H-alpha 656.46 nm (vacuum)', Math.abs(C.HALPHA*1000 - 656.46) < 0.02, (C.HALPHA*1000).toFixed(3));
  ok('MoM-z14: Lyα at z = 14.44 arrives at 1.877 µm — past Hubble, inside NIRSpec', Math.abs(C.observed(C.LYA, 14.44) - 1.877) < 0.001 && !C.sees(C.observed(C.LYA, 14.44)).hubble && C.sees(C.observed(C.LYA, 14.44)).nirspec);
  ok('Hubble WFC3 loses Lyα beyond z ≈ 12.98', Math.abs(C.zLimit(C.LYA, K.HUBBLE_MAX) - 12.984) < 0.002, C.zLimit(C.LYA, K.HUBBLE_MAX).toFixed(3));
  ok('Hα leaves NIRSpec at z ≈ 7.07', Math.abs(C.zLimit(C.HALPHA, K.NIRSPEC_MAX) - 7.074) < 0.002);
  /* cosmology vs published ages */
  const a0 = C.ageGyr(0);
  ok('Planck 2018 model: age today 13.797 Gyr', Math.abs(a0 - 13.797) < 0.01, a0.toFixed(3));
  ok('MoM-z14 (z 14.44) ≈ 280 Myr after the Big Bang (Naidu 2025)', Math.abs(C.ageGyr(14.44)*1000 - 280) < 10, (C.ageGyr(14.44)*1000).toFixed(0));
  ok('JADES-GS-z14-0 (ALMA z 14.18) ≈ 290 Myr (Carniani 2025)', Math.abs(C.ageGyr(14.18)*1000 - 290) < 10, (C.ageGyr(14.18)*1000).toFixed(0));
  ok('UHZ1 (z ≈ 10) seen at about 3% of today\'s age (Chandra)', C.ageGyr(10)/a0 > 0.025 && C.ageGyr(10)/a0 < 0.039, (100*C.ageGyr(10)/a0).toFixed(1) + '%');
  ok('age falls monotonically with z', C.ageGyr(1) > C.ageGyr(5) && C.ageGyr(5) > C.ageGyr(14));
  /* resolution and light */
  const tw2 = C.rayleigh(2, K.D_WEBB);
  ok('Webb at 2 µm: 1.22 λ/D = 0.077″, finer than NASA\'s quoted ~0.1″', Math.abs(tw2 - 0.0774) < 0.0005 && tw2 < 0.1, tw2.toFixed(4));
  ok('Hubble at 0.5 µm: 0.052″', Math.abs(C.rayleigh(0.5, K.D_HUBBLE) - 0.0524) < 0.0005);
  ok('same wavelength: Webb 2.71× sharper', Math.abs(C.rayleigh(1, K.D_HUBBLE)/C.rayleigh(1, K.D_WEBB) - 6.5/2.4) < 1e-9);
  ok('measured Webb area 25.44 m² ≥ 25 m² requirement (Rigby; NASA fact sheet 25 m²)', K.A_WEBB >= 25 && Math.abs(K.A_WEBB - 25) / 25 < 0.02);
  ok('Hubble 2.4 m disc = 4.52 m²; Webb collects 5.6×', Math.abs(C.discArea(2.4) - 4.524) < 0.001 && Math.abs(K.A_WEBB/C.discArea(2.4) - 5.62) < 0.01, (K.A_WEBB/C.discArea(2.4)).toFixed(2));
  /* sunshield */
  ok('sunshield difference 85 − (−233) = 318 °C', C.sunshieldDrop() === 318);
  ok('the 318 °C card matches the computation', doc.getElementById('sunshieldDrop').textContent.indexOf(String(C.sunshieldDrop())) === 0);
  /* DOM: instruments react and never show NaN, in both languages */
  C.setZ(14.44);
  ok('IR readout shows Lyα at 1.88 µm', doc.getElementById('irReadout').textContent.indexOf('1.88 µm') >= 0);
  ok('IR status names NIRSpec at z 14.44', doc.getElementById('irStatus').textContent.indexOf('NIRSpec') >= 0);
  C.setT(5772);
  ok('IR readout shows the Sun\'s peak as 502 nm', doc.getElementById('irReadout').textContent.indexOf('502 nm') >= 0);
  C.setLam(21);
  ok('at 21 µm Hubble is out of range', doc.getElementById('resReadout').textContent.indexOf('out of range') >= 0);
  C.setLam(0.8);
  ok('at 0.8 µm Webb is not quite diffraction-limited', doc.getElementById('resReadout').textContent.indexOf('not quite') >= 0);
  C.setLam(0.5);
  ok('at 0.5 µm Webb cannot observe: no diffraction verdict', doc.getElementById('resReadout').textContent.indexOf('not quite') < 0 && doc.getElementById('resReadout').textContent.indexOf('yes (') < 0);
  ok('Hubble-equivalent (185 nm) below WFC3 is flagged', doc.getElementById('resReadout').textContent.indexOf('below WFC3') >= 0);
  C.setLam(0.6);
  ok('at 0.6 µm the equivalent 222 nm is inside WFC3, no flag', doc.getElementById('resReadout').textContent.indexOf('WFC3)') < 0);
  C.setZ(0.3);
  ok('z 0.3: Lyα is still far-UV (status says so, never MIRI)', doc.getElementById('irStatus').textContent.indexOf('far ultraviolet') >= 0 && doc.getElementById('irStatus').textContent.indexOf('MIRI') < 0);
  C.setZ(0.7);
  ok('z 0.7: Lyα inside Hubble WFC3', doc.getElementById('irStatus').textContent.indexOf('Hubble can still see it') >= 0);
  let nan = 0;
  ['ru', 'en'].forEach(l => {
    doc.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    [0.2, 0.6, 1.1, 2, 5.3, 28.5].forEach(x => { C.setLam(x); if(/NaN|undefined|Infinity/.test(doc.getElementById('resReadout').textContent + doc.getElementById('resStatus').textContent)) nan++; });
    [3, 6.4, 40, 310, 5772, 10000].forEach(t => { C.setT(t); if(/NaN|undefined|Infinity/.test(doc.getElementById('irReadout').textContent)) nan++; });
    [0, 0.5, 6, 10, 14.44, 20].forEach(z => { C.setZ(z); if(/NaN|undefined|Infinity/.test(doc.getElementById('irReadout').textContent + doc.getElementById('irStatus').textContent)) nan++; });
    doc.querySelectorAll('#tPresets .btn, #zPresets .btn, #lamPresets .btn').forEach(b => { b.click(); if(/NaN|undefined/.test(doc.getElementById('irReadout').textContent + doc.getElementById('resReadout').textContent)) nan++; });
  });
  ok('no NaN/undefined in any state, EN and RU', nan === 0, nan);
  doc.querySelector('#langtoggle button[data-lang="ru"]').click();
  C.setZ(14.44);
  ok('RU uses a decimal comma (1,88 мкм)', doc.getElementById('irReadout').textContent.indexOf('1,88 мкм') >= 0);
  ok('RU aria-label switched', doc.getElementById('irSvg').getAttribute('aria-label').indexOf('Шкала') === 0);
  doc.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('sliders expose aria-valuetext', ['tSlider', 'zSlider', 'lamSlider'].every(id => (doc.getElementById(id).getAttribute('aria-valuetext') || '').length > 0));
  ok('five first-light cards', doc.querySelectorAll('#firstLightList .exp-card').length === 5);
  ok('card headings stay headings (button inside h4)', doc.querySelectorAll('#discoveryList h4 > button.exp-btn[aria-expanded]').length === 5);
  const css = Array.from(doc.querySelectorAll('style')).map(x => x.textContent).join('');
  ok('instrument CSS present (.btn, .readout-grid, .readout-cell, .rl, .wide, range thumb)', ['.btn{', '.readout-grid{', '.readout-cell{', '.readout-cell .rl{', '.readout-cell.wide{', '::-webkit-slider-thumb', '::-moz-range-thumb', 'appearance:none'].every(k => css.indexOf(k) >= 0));
  ok('small instrument text uses the AA colour #5f5f59', /\.ctl-head\{[^}]*#5f5f59/.test(css) && /\.inst-kicker\{[^}]*#5f5f59/.test(css) && /\.rl\{[^}]*#5f5f59/.test(css));
  ok('deploy caption is announced', doc.getElementById('deployCaption').getAttribute('aria-live') === 'polite');
  doc.querySelector('#langtoggle button[data-lang="ru"]').click();
  C.setT(5772);
  ok('RU leaves 4-digit numbers unseparated (5772 К)', doc.getElementById('tVal').textContent === '5772 К', doc.getElementById('tVal').textContent);
  doc.querySelector('#langtoggle button[data-lang="en"]').click();
  console.log(out.join('\n'));
};
