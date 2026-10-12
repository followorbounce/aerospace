module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  // CH1
  ok('4,080 MHz is 7.35 cm', near(299792458/4.08e9*100, 7.35, 0.005), (299792458/4.08e9*100).toFixed(3));
  // CH2 — blackbody
  ok('FIRAS table has 43 points', C.FIRAS.length === 43);
  ok('FIRAS range 68–640 GHz', near(C.FIRAS[0][0]*29.9792458, 68, 0.5) && near(C.FIRAS[42][0]*29.9792458, 640, 0.6), (C.FIRAS[0][0]*29.9792458).toFixed(1) + '–' + (C.FIRAS[42][0]*29.9792458).toFixed(1));
  const worst = Math.max(...C.FIRAS.map(p => Math.abs(C.planckMJy(p[0], 2.725) - (p[1] - p[2]/1000))));
  ok('every FIRAS point = 2.725 K blackbody + its residual (within 0.02 MJy/sr)', worst < 0.02, worst.toFixed(4));
  ok('peak frequency at 2.72548 K = 160.2 GHz', near(C.nuPeakGHz(C.T0), 160.23, 0.01), C.nuPeakGHz(C.T0).toFixed(3));
  ok('Wien peak at 2.72548 K = 1.063 mm', near(C.wienMM(C.T0), 1.0632, 0.0002), C.wienMM(C.T0).toFixed(4));
  ok('photons per cm³ = 410.7', near(C.photonsPerCm3(C.T0), 410.7, 0.1), C.photonsPerCm3(C.T0).toFixed(2));
  ok('best fit to the FIRAS table = 2.7250 K (its own calibration)', near(C.FIT_T, 2.7250, 0.0001), C.FIT_T.toFixed(5));
  const peakKJy = C.planckMJy(C.nuPeakGHz(2.725)/29.9792458, 2.725)*1000;
  ok('FIRAS peak brightness ≈ 383.7 MJy/sr', near(peakKJy/1000, 383.67, 0.05), (peakKJy/1000).toFixed(2));
  ok('error-weighted misfit at best fit ≈ 19 kJy/sr (reviewer 19.8 from the residual column)', near(C.misfit(C.FIT_T), 19, 1), C.misfit(C.FIT_T).toFixed(2));
  ok('MUST 1: misfit at best fit < 55 ppm of the peak (FIRAS: < 50 ppm)', C.misfit(C.FIT_T)/peakKJy*1e6 < 55, (C.misfit(C.FIT_T)/peakKJy*1e6).toFixed(1) + ' ppm');
  ok('weighted misfit at 2.72548 K ≈ 174 kJy/sr, under 0.05 % of the peak', near(C.misfit(C.T0), 174, 2) && C.misfit(C.T0)/peakKJy < 5e-4, C.misfit(C.T0).toFixed(1));
  ok('3.5 K and 2.5 K miss badly (> 10 MJy/sr)', C.misfit(3.5) > 10000 && C.misfit(2.5) > 10000);
  // CH3 — cooling
  ok('age today ≈ 13.795 Gyr (Planck 13.797 ± 0.023)', near(C.ageAt(0)/1e9, 13.797, 0.023), (C.ageAt(0)/1e9).toFixed(4));
  const tRec = C.ageAt(C.COSMO.zStar);
  ok('age at last scattering ≈ 370,000 yr', tRec > 365000 && tRec < 376000, Math.round(tRec));
  const noRad = C.ageAt(C.COSMO.zStar, true)/tRec - 1;
  ok('without radiation that age comes out ~30 % too long', near(noRad, 0.29, 0.02), (noRad*100).toFixed(1) + ' %');
  ok('T at z* = 1089.92 ≈ 2,970 K', near(C.tempAt(C.COSMO.zStar), 2973.3, 0.5), C.tempAt(C.COSMO.zStar).toFixed(1));
  ok('JADES-GS-z14-0 (z 14.18) ≈ 290 million years', near(C.ageAt(14.18)/1e6, 290, 3), (C.ageAt(14.18)/1e6).toFixed(1));
  ok('matter = radiation from these densities within 1 % of Planck z_eq 3402', near(C.COSMO.Om/C.COSMO.Or - 1, 3402, 34), (C.COSMO.Om/C.COSMO.Or - 1).toFixed(0));
  // CH4 — dipole
  ok('dipole T₀ v/c at 369.82 km/s = 3.362 mK (Planck 3.36208 ± 0.00099)', near(C.dipoleMK(369.82), 3.36208, 0.001), C.dipoleMK(369.82).toFixed(5));
  ok('exact Doppler extremes = T₀(β ± β²/2): +3.3642 / −3.3600 mK', near((C.skyT(0, 369.82) - C.T0)*1000, 3.36212 + 0.00207, 0.0002) && near((C.T0 - C.skyT(180, 369.82))*1000, 3.36212 - 0.00207, 0.0002), ((C.skyT(0, 369.82) - C.T0)*1000).toFixed(4) + ' / ' + ((C.T0 - C.skyT(180, 369.82))*1000).toFixed(4));
  ok('dipole ≈ 1 part in 800', near(C.T0/(C.dipoleMK(369.82)/1000), 811, 2), (C.T0/(C.dipoleMK(369.82)/1000)).toFixed(0));
  const f = C.RIPPLE_UK*1e-6/C.T0;
  ok('30 µK ÷ T₀ = 1.10 × 10⁻⁵', near(f, 1.10e-5, 0.005e-5), f.toExponential(3));
  ok('on Earth\'s diameter: ≈ 140 m', near(12742000*f, 140, 1), (12742000*f).toFixed(1));
  ok('dipole ≈ 112 times the ripples', Math.round(C.dipoleMK(369.82)*1000/30) === 112);
  // CH5 — beams and the sky patch
  ok('WMAP anchors reproduced exactly', C.PEAKS.every(p => near(C.dTl(p[0]), p[1], 1e-9)));
  ok('Moon apparent width 0.518°', near(C.MOON_DEG, 0.518, 0.001), C.MOON_DEG.toFixed(4));
  ok('COBE 7° ≈ 13 Moon widths (13.5)', near(7/C.MOON_DEG, 13.5, 0.1), (7/C.MOON_DEG).toFixed(2));
  ok('ℓ = 220 ↔ ≈ 0.8° ≈ 1.6 Moon widths', near(180/220, 0.818, 0.001) && near(180/220/C.MOON_DEG, 1.58, 0.01));
  ok('COBE 7° beam keeps essentially none of the first peak', C.beamB(220.1, 420) < 1e-20, C.beamB(220.1, 420).toExponential(1));
  ok('WMAP 13′ keeps ≈ 94 % at ℓ 220', near(C.beamB(220.1, 13), 0.94, 0.01), C.beamB(220.1, 13).toFixed(3));
  ok('Planck 5′ keeps ≈ 99 % at ℓ 220', near(C.beamB(220.1, 5), 0.991, 0.003), C.beamB(220.1, 5).toFixed(4));
  ok('half-response ℓ: B(ℓ½) = 0.5', [420, 13, 5].every(b => near(C.beamB(C.lHalf(b), b), 0.5, 1e-9)));
  ok('WMAP 13′ ÷ COBE 7° ≈ 1/33 (LAMBDA: 33× the resolution)', near(420/13, 32.3, 0.1));
  const N = 64, re = new Float64Array(N), im = new Float64Array(N), keep = []; for(let i = 0; i < N; i++){ re[i] = Math.sin(i*1.7) + i % 5; keep.push(re[i]); }
  C.fft1(re, im, false); C.fft1(re, im, true);
  ok('FFT round trip returns N × input', keep.every((v, i) => near(re[i]/N, v, 1e-9)));
  const m0 = C.skyMap(0), m5 = C.skyMap(5), m13 = C.skyMap(13), m420 = C.skyMap(420);
  const r0 = C.rms(m0), e0 = Math.sqrt(C.expectedVar(0));
  ok('simulated sky rms matches its spectrum within 8 %', near(r0/e0, 1, 0.08), r0.toFixed(1) + ' vs ' + e0.toFixed(1) + ' µK');
  ok('each beam lowers the rms: none > Planck > WMAP > COBE', r0 > C.rms(m5) && C.rms(m5) > C.rms(m13) && C.rms(m13) > C.rms(m420), [r0, C.rms(m5), C.rms(m13), C.rms(m420)].map(x => x.toFixed(1)).join(' > '));
  ok('COBE leaves under a third of the ripple rms', C.rms(m420) < r0/3, (C.rms(m420)/r0).toFixed(3));
  // UI: every preset in both languages renders without NaN/undefined
  const d = w.document; let bad = 0;
  ['en', 'ru'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('#bbPre .btn, #cvPre .btn, #dpPre .btn, #dpObj .btn, #skPre .btn').forEach(b => { b.click();
      ['bbReadout', 'cvReadout', 'dpReadout', 'skReadout', 'bbStatus', 'cvStatus', 'dpStatus', 'skStatus'].forEach(id => { if(/NaN|undefined|Infinity/.test(d.getElementById(id).textContent)) bad++; }); }); });
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('every preset in both languages renders without NaN', bad === 0, bad);
  d.querySelector('#bbPre .btn[data-t="2.72548"]').click();
  ok('2.72548 K preset reports a superb fit, not a miss', /superb/.test(d.getElementById('bbStatus').textContent));
  d.querySelector('#cvPre .btn[data-z="1089.92"]').click();
  ok('last-scattering preset reads 2,973 K', /2,973 K/.test(d.getElementById('cvReadout').textContent), d.getElementById('cvReadout').textContent.slice(0, 40));
  // review MUST fixes
  ok('MUST 1: 2.725 K preset status says 0.005 % (≤ 55 parts per million), cites [5]', (d.querySelector('#bbPre .btn[data-t="2.725"]').click(), ((m) => !!m && +m[1] <= 55 && /\[5\]/.test(d.getElementById('bbStatus').textContent))(/0\.005 % \((\d+) parts per million\)/.exec(d.getElementById('bbStatus').textContent))), d.getElementById('bbStatus').textContent.slice(0, 70));
  ok('MUST 1: body note says weighted, 20 kJy/sr, 174 kJy/sr', /weighted by its error bar/.test(d.body.innerHTML) && /about 19 kJy\/sr/.test(d.body.innerHTML) && /174 kJy\/sr/.test(d.body.innerHTML) && !/0\.02 %/.test(d.body.innerHTML));
  const bbT = d.getElementById('bbT'); bbT.value = '2.7268'; bbT.dispatchEvent(new w.Event('input'));
  ok('off-by status no longer claims the points visibly left the curve at a few mK', /by eye the curve still passes close/.test(d.getElementById('bbStatus').textContent), d.getElementById('bbStatus').textContent.slice(0, 60));
  d.querySelector('#skPre .btn[data-b="420"]').click();
  const cobeTxt = d.getElementById('skStatus').textContent;
  ok('MUST 2: COBE status says the patch is smoothed almost flat and the swells are bigger than the patch', /almost flat/.test(cobeTxt) && /bigger than this patch/.test(cobeTxt) && !/blurs them into broad/.test(cobeTxt), cobeTxt.slice(0, 60));
  ok('MUST 2: note explains the patch holds only ℓ ≳ 36', /ℓ ≳ 36/.test(d.getElementById('ch5').textContent));
  ok('MUST 2: 10° patch fundamental mode is ℓ = 36', Math.round(2*Math.PI/(C.PATCH_DEG*Math.PI/180)) === 36);
  d.querySelector('#skPre .btn[data-b="5"]').click();
  const zBtn = d.querySelector('#cvPre .btn[data-z="14.18"]');
  ok('MUST 3: z 14.18 button is labelled JADES-GS-z14-0, not "farthest"', /JADES-GS-z14-0/.test(zBtn.getAttribute('data-en')) && /JADES-GS-z14-0/.test(zBtn.getAttribute('data-ru')) && !/FARTHEST|ДАЛЁКАЯ/.test(d.body.innerHTML));
  const refs = d.querySelectorAll('#refList > *').length;
  ok('MUST 4: prediction credited (Alpher, Herman, Doroshkevich, Novikov) with ref [19]', ['Alpher', 'Herman', 'Doroshkevich', 'Novikov'].every(n => d.getElementById('ch1').textContent.includes(n)) && /\[19\]/.test(d.getElementById('ch1').textContent) && refs >= 20, refs + ' refs');
  ok('MUST 4: timeline has 1948–49 and 1964 prediction entries', /1948–49/.test(d.getElementById('timeline').textContent) && /1964/.test(d.getElementById('timeline').textContent));
  ['bbT', 'cvZ', 'dpV'].forEach(id => { const el = d.getElementById(id), vt = el.getAttribute('aria-valuetext') || '';
    ok('MUST 5: ' + id + ' has aria-valuetext mirroring its readout', vt.length > 0 && vt.indexOf(d.getElementById(id + 'Val').textContent) === 0, vt); });
  d.querySelector('#cvPre .btn[data-z="1089.92"]').click();
  ok('MUST 5: cvZ aria-valuetext reads "z = 1,090, 371,000 years"', /^z = 1,090, 371,000 years$/.test(d.getElementById('cvZ').getAttribute('aria-valuetext')), d.getElementById('cvZ').getAttribute('aria-valuetext'));
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('RU: cvZ readout 2973 К (Cyrillic К, four digits unspaced)', /2973 К/.test(d.getElementById('cvReadout').textContent), d.getElementById('cvReadout').textContent.slice(0, 40));
  let latinK = 0; d.querySelectorAll('[data-ru]').forEach(el => { if(/\d K(?![A-Za-z])/.test(el.getAttribute('data-ru'))) latinK++; });
  ['bbReadout', 'cvReadout', 'dpReadout', 'skReadout', 'bbStatus', 'cvStatus', 'dpStatus', 'skStatus', 'timeline', 'refList'].forEach(id => { if(/\d K(?![A-Za-z])/.test(d.getElementById(id).textContent)) latinK++; });
  ok('RU: no Latin K after a number', latinK === 0, latinK);
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  console.log(out.join('\n'));
};
