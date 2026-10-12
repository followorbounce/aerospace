module.exports = (w, C) => {
  // fresh load in a separate window (test.js has already clicked every button in w)
  let initPs = '', initAria = [], initStH = '', initBdM = '';
  try {
    const {JSDOM} = require('jsdom'), fs = require('fs');
    const html = fs.readFileSync(process.argv[2], 'utf8').replace(/<script src="\/aerospace\/assets\/site.js" defer><\/script>/, '').replace(/<script defer src="https:\/\/static.cloudflareinsights[^>]*><\/script>/, '');
    const f = new JSDOM(html, {runScripts:'dangerously', pretendToBeVisual:true, beforeParse(x){ x.matchMedia = () => ({matches:false, addEventListener(){}}); x.IntersectionObserver = class { observe(){} }; x.Element.prototype.scrollIntoView = function(){}; }});
    const d0 = f.window.document; initPs = d0.getElementById('psReadout').textContent;
    initAria = ['stH', 'chM', 'chF', 'psE', 'psY', 'bdM'].map(id => d0.getElementById(id).getAttribute('aria-valuetext'));
    initStH = initAria[0] || ''; initBdM = initAria[5] || ''; f.window.close();
  } catch(e){ initPs = 'fresh load failed: ' + e.message; }
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const rel = (a, b) => Math.abs(a/b - 1);
  // constants
  ok('T☉ = GM☉/c³ ≈ 4.9255 µs', Math.abs(C.T_SUN*1e6 - 4.9255) < 0.0005, (C.T_SUN*1e6).toFixed(5));
  ok('M☉c² ≈ 1.787 × 10⁴⁷ J', Math.abs(C.E_SUN/1e47 - 1.787) < 0.002, (C.E_SUN/1e47).toFixed(4));
  ok('parsec = 3.0857 × 10¹⁶ m', Math.abs(C.PC/1e16 - 3.0857) < 0.0001, (C.PC/1e16).toFixed(5));
  // strain (GWOSC factsheet: peak arm displacement ±0.002 fm)
  const s = C.strain(1e-21, 4000);
  ok('h = 10⁻²¹ on 4 km: each arm ±0.002 fm [2]', Math.abs(s.perArm*1e15 - 0.002) < 1e-9, (s.perArm*1e15).toFixed(4) + ' fm');
  ok('that is ~1/840 of a proton width', Math.abs(s.protonRatio - 840.75) < 0.5, s.protonRatio.toFixed(1));
  ok('LISA arm light time ≈ 8.34 s', Math.abs(C.strain(1e-21, 2.5e9).lightTime - 8.339) < 0.001, C.strain(1e-21, 2.5e9).lightTime.toFixed(3));
  // chirp (leading order)
  const t35 = C.tauOf(30, 35);
  ok('GW150914: 𝓜 = 30, from 35 Hz → ~0.2 s to coalescence [1]', t35 > 0.15 && t35 < 0.25, t35.toFixed(3) + ' s');
  const n = C.cycles(30, 35, 150);
  ok('GW150914: ~8 cycles from 35 to 150 Hz [1]', n > 7.5 && n < 9.5, n.toFixed(2));
  const t24 = C.tauOf(1.1977, 24);
  ok('GW170817: 𝓜det = 1.1977, ~100 s from 24 Hz [10]', rel(t24, 100) < 0.02, t24.toFixed(1) + ' s');
  ok('fOfTau inverts tauOf', rel(C.fOfTau(30, C.tauOf(30, 77.7)), 77.7) < 1e-12);
  ok('chirp mass recovered from f and ḟ (formula in [1])', rel(C.mcFromF(60, C.fdot(30, 60)), 30) < 1e-12, C.mcFromF(60, C.fdot(30, 60)).toFixed(6));
  ok('f(ISCO) = 4.4 kHz × M☉/M [9]', Math.abs(C.fIsco(1) - 4397) < 2, C.fIsco(1).toFixed(0) + ' Hz');
  ok('𝓜 = 30 equal masses → M ≈ 69 (paper: ≳ 70) [1]', Math.abs(C.mtotEqual(30) - 68.9) < 0.1, C.mtotEqual(30).toFixed(2));
  const sep = C.separation(70, 75)/1000;
  ok('70 M☉ at 75 Hz orbital → ≈ 350 km apart [1]', Math.abs(sep - 350) < 15, sep.toFixed(0) + ' km');
  ok('chirp model stops when start ≥ ISCO', C.chirp(80, 60).past === true && C.chirp(30, 35).past === false);
  // energy [1][11]
  const e = C.energy();
  ok('3.0 M☉c² ≈ 5.4 × 10⁴⁷ J', Math.abs(e.E/1e47 - 5.36) < 0.01, (e.E/1e47).toFixed(3));
  ok('200 M☉c²/s reproduces the paper\'s 3.6 × 10⁴⁹ W', rel(e.P, 3.6e49) < 0.01, (e.P/1e49).toFixed(3));
  ok('peak ≈ 10²³ Suns', e.suns > 8e22 && e.suns < 1.1e23, e.suns.toExponential(2));
  ok('≈ 4,400 Sun lifetimes (10 Gyr)', Math.abs(e.lifetimes - 4430) < 60, e.lifetimes.toFixed(0));
  // Hulse–Taylor [13]
  const B = C.B1913, pd = C.pdot(B.Pb, B.e, B.mp, B.mc);
  ok('Peters–Mathews Ṗb within 0.05 % of the paper\'s −2.40263 × 10⁻¹²', rel(pd, B.gr) < 5e-4, pd.toExponential(5));
  ok('f(e = 0.617) ≈ 11.86', Math.abs(C.fe(B.e) - 11.857) < 0.01, C.fe(B.e).toFixed(3));
  ok('f(0) = 1', Math.abs(C.fe(0) - 1) < 1e-15);
  ok('measured −2.398 / published GR −2.40263 within the paper\'s 0.9983 ± 0.0016', Math.abs(B.obs/B.gr - B.ratio) < B.ratioErr, (B.obs/B.gr).toFixed(4));
  const sh30 = C.shiftAfter(pd, B.Pb, 30);
  ok('shift grows as t²: 30 yr = 9 × 10 yr', rel(sh30, 9*C.shiftAfter(pd, B.Pb, 10)) < 1e-12, sh30.toFixed(1) + ' s');
  const a = C.semiMajor(B.Pb, B.mp + B.mc);
  ok('orbit a ≈ 1.95 × 10⁶ km (Kepler)', a > 1.9e9 && a < 2.0e9, (a/1e9).toFixed(3) + ' × 10⁶ km');
  ok('orbit shrinks ≈ 3.5 m per year', Math.abs(-C.shrinkPerYear(B.Pb, B.mp + B.mc, pd) - 3.5) < 0.2, (-C.shrinkPerYear(B.Pb, B.mp + B.mc, pd)).toFixed(2));
  // bands
  ok('GW150914 (65 M☉) merges in the ground band', C.bandOf(C.fIsco(65)).k === 'ground', C.fIsco(65).toFixed(1) + ' Hz');
  ok('10⁶ M☉ merges in the LISA band', C.bandOf(C.fIsco(1e6)).k === 'lisa', (C.fIsco(1e6)*1e3).toFixed(2) + ' mHz');
  ok('PTA band starts at 1/(15 yr) ≈ 2.1 nHz [15]', Math.abs(C.BANDS[0].lo*1e9 - 2.11) < 0.01, (C.BANDS[0].lo*1e9).toFixed(2));
  // speed of gravity [16]
  const sb = C.speedBound(1.74, 26);
  ok('1.74 s over 26 Mpc ≈ 6.5 × 10⁻¹⁶ (published upper bound 7 × 10⁻¹⁶)', sb > 6e-16 && sb <= 7e-16, sb.toExponential(2));
  // formatting
  ok('sci(1e-21) reads 1.0 × 10⁻²¹', C.sci(1e-21, 1) === '1.0 × 10⁻²¹', C.sci(1e-21, 1));
  ok('sci rounds up across a decade', C.sci(9.96e-5, 1) === '1.0 × 10⁻⁴', C.sci(9.96e-5, 1));
  // UI: every preset in both languages, no NaN / undefined
  const d = w.document, bad = () => /NaN|undefined|Infinity/.test(d.querySelector('main').textContent);
  let clean = true;
  ['en', 'ru'].forEach(l => {
    d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('#stPre .btn, #chPre .btn, #psPre .btn, #bdPre .btn').forEach(b => { b.click(); if(bad()) clean = false; });
  });
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('every preset renders without NaN in both languages', clean);
  d.querySelector('#chPre .btn:nth-child(2)').click();
  ok('GW170817 preset keeps 𝓜 = 1.1977 exactly (slider step 0.1)', +d.getElementById('chM').value === 1.1977, d.getElementById('chM').value);
  ok('GW170817 readout ~100 s in band', /9\d s|10\d s/.test(d.getElementById('chReadout').textContent), d.getElementById('chReadout').textContent.match(/TIME IN BAND\s*([\d.,]+ s)/) ? d.getElementById('chReadout').textContent.match(/TIME IN BAND\s*([\d.,]+ s)/)[1] : '?');

  // ---- review MUST-FIX checks ----
  const tx = id => d.getElementById(id).textContent;
  const setR = (id, v) => { const el = d.getElementById(id); el.value = String(v); el.dispatchEvent(new w.Event('input')); };
  // fresh-load state (before any preset click) was captured at the top: see initPs/initAria
  ok('MUST 2: pulsar on load shows the exact-e prediction −2.4021 × 10⁻¹²', /2\.4021/.test(initPs), initPs.match(/PREDICTED Ṗb\s*([^A-Z]+)/) ? initPs.match(/PREDICTED Ṗb\s*([^A-Z]+)/)[1] : '?');
  ok('MUST 5: every slider has aria-valuetext on load', initAria.every(Boolean), initAria.map(x => x ? 1 : 0).join(''));
  ok('MUST 5: log sliders announce values, not exponents', /×\s*10/.test(initStH) && /M☉|solar/.test(initBdM), initStH + ' | ' + initBdM);
  // MUST 1: sweep the strain slider on every detector, both languages
  let wrong = [];
  ['en', 'ru'].forEach(l => {
    d.querySelector('#langtoggle button[data-lang="' + l + '"]').click();
    d.querySelectorAll('#stPre .btn').forEach(b => {
      b.click(); const lisa = /LISA/.test(b.textContent);
      for(let h = -24; h <= -18.001; h += 0.1){
        setR('stH', h.toFixed(1));
        const t = tx('stStatus') + ' ' + tx('stReadout');
        if(/\b1\/1(?![\d.,])|× 1(?![\d.,])|\b1 (billion|млрд)\b|\b1 proton widths|\b1 диаметров|NaN|undefined/.test(t) || (!lisa && /2[.,]5[- ](million|млн)/.test(tx('stStatus'))) || (lisa && !/LISA/.test(tx('stStatus')))) wrong.push(l + ' ' + b.textContent.trim() + ' h=' + h.toFixed(1));
        if(l === 'ru' && !/1\//.test(tx('stStatus')) && /(^|\s)(\d+ )*\d*([05-9]|1[1-4]) диаметра протона/.test(tx('stStatus'))) wrong.push('ru agreement ' + h.toFixed(1));   /* 5, 10, 11–14 … take диаметров */
      }
    });
  });
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('MUST 1: strain status matches the detector, no "1/1", "× 1" or "1 billion" anywhere in the sweep', wrong.length === 0, wrong.slice(0, 3).join('; '));
  d.querySelector('#stPre .btn').click(); setR('stH', '-21');
  ok('MUST 1: LIGO at 10⁻²¹ reads 1/841 of a proton', /1\/841/.test(tx('stStatus')), tx('stStatus').slice(0, 70));
  setR('stH', '-18.1');
  ok('MUST 1: near one proton width shows 2 significant figures', /0\.\d\d of a proton/.test(tx('stStatus')) || /\d\.\d proton widths/.test(tx('stStatus')), tx('stStatus').slice(0, 70));
  d.querySelector('#stPre .btn:nth-child(4)').click(); setR('stH', '-21');
  ok('MUST 1: LISA at 10⁻²¹ is 743 proton widths', /743 proton widths/.test(tx('stStatus')), tx('stStatus').slice(0, 80));
  // MUST 3: GW150914 chirp readout shows time to coalescence 0.17 s next to 0.14 s
  d.querySelector('#chPre .btn').click();
  ok('MUST 3: GW150914 readout gives time to coalescence 0.17 s', /TIME TO COALESCENCE \(FORMULA\)\s*0\.17 s/.test(tx('chReadout')), tx('chReadout').match(/COALESCENCE \(FORMULA\)\s*[\d.]+ s/) + '');
  ok('MUST 3: status mentions the 0.17 s to coalescence', /0\.17 s/.test(tx('chStatus')));
  // MUST 4: stale "most powerful ever" heading gone; GW190521 credited
  const main = d.querySelector('main').textContent;
  ok('MUST 4: no "most powerful event ever measured"', !/most powerful event ever measured/i.test(main) && !/Самое мощное из измеренных/.test(d.body.innerHTML));
  ok('MUST 4: GW190521 7.6 M☉ cited', /GW190521[^.]*7\.6 solar masses \[20\]/.test(main));
  // MUST 6: pulsar axis stays readable at every e
  let maxLab = 0;
  for(let e = 0; e <= 0.9001; e += 0.025){ setR('psE', e.toFixed(3)); maxLab = Math.max(maxLab, [...d.querySelectorAll('#psSvg text')].filter(t => t.getAttribute('x') === '56').length); }
  ok('MUST 6: pulsar y-axis keeps ≤ 7 labels (0 plus 4–6 steps) for e in [0, 0.9]', maxLab <= 7 && maxLab >= 3, maxLab);
  d.querySelector('#psPre .btn').click();
  ok('pulsar preset restores −2.4021', /2\.4021/.test(tx('psReadout')));
  // SHOULD: bands, aria labels in RU, RU wording
  d.querySelector('#bdPre .btn').click();
  ok('bands: a neutron-star pair does not list pulsar timing', !/pulsar timing/i.test(tx('bdReadout')), tx('bdReadout').slice(-60));
  ok('bands: row says frequency, not loudness', /NOT LOUDNESS/.test(tx('bdReadout')));
  d.querySelector('#bdPre .btn:nth-child(4)').click();
  ok('bands: a 10⁹ M☉ pair merges in the µHz gap but its inspiral sweeps pulsar timing', /no detector/.test(tx('bdReadout')) && /“pulsar timing”/.test(tx('bdReadout')), tx('bdReadout').slice(-50));
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  const labs = ['stPre', 'chPre', 'chListen', 'psPre', 'bdPre'].map(id => d.getElementById(id).getAttribute('aria-label'));
  ok('RU: button-group labels translated', labs.every(x => /[а-яё]/i.test(x)), labs.join(' / '));
  ok('RU: no «отдач Солнца», «10²¹-ю часть», «приравнивает», «постройки»', !/отдач Солнца|10²¹-ю|приравнивает|постройки/.test(d.querySelector('main').textContent));
  ok('RU: no capitalised «Пульсарный тайминг» mid-sentence', !/\S\s+Пульсарный тайминг/.test(d.querySelector('main').textContent));
  ok('RU: four-digit numbers ungrouped (9257, 4430 → «в 4400 раз»)', /в 4400 раз/.test(d.getElementById('enBody').textContent), d.getElementById('enBody').textContent.slice(-60));
  ok('RU: no NaN', !/NaN|undefined/.test(d.querySelector('main').textContent));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('lede says within 0.2 %, not "exactly"', /to within 0\.2 %/.test(main) && !/decay exactly/.test(main));
  ok('credit: Gertsenshtein, Pustovoit, Weiss 1972, Drever', /Gertsenshtein and Vladislav Pustovoit in 1962/.test(main) && /Weiss's 1972/.test(main) && /Drever/.test(main));
  console.log(out.join('\n'));
};
