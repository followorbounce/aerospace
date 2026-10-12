module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const P = C.PLANCK18, B = C.BURSTS, rel = (a, b) => Math.abs(a/b - 1);
  // cosmology
  ok('age of the universe today ≈ 13.80 Gyr (Planck 2018: 13.797)', Math.abs(C.ageAt(0, P) - 13.797) < 0.02, C.ageAt(0, P).toFixed(3));
  ok('low-z limit: d_L ≈ cz/H0 at z = 0.001', rel(C.lumDist(0.001, P), 299792.458*0.001/67.36) < 0.002, C.lumDist(0.001, P).toFixed(3));
  const Om1 = {H0:70, Om:1}, z = 2;            // Einstein–de Sitter closed form: d_C = 2c/H0 (1 − 1/√(1+z))
  ok('Simpson integral vs Einstein–de Sitter closed form', rel(C.comoving(z, Om1), 2*299792.458/70*(1 - 1/Math.sqrt(1 + z))) < 1e-6, C.comoving(z, Om1).toFixed(2));
  ok('age at z ≈ 8.2 ≈ 630 Myr (Tanvir: about 630)', Math.abs(C.ageAt(8.2, P)*1000 - 630) < 25, (C.ageAt(8.2, P)*1000).toFixed(0));
  ok('GRB 170817A host at 42.9 Mpc is z ≈ 0.0096', Math.abs(C.lumDist(0.0096, P) - 42.9) < 1.5, C.lumDist(0.0096, P).toFixed(1));
  ok('42.9 Mpc ≈ 140 million light-years', Math.abs(42.9*3.26156 - 140) < 1, (42.9*3.26156).toFixed(1));
  const dth = (Math.PI/2 - Math.acos(299792.458*0.03/1e5))*180/Math.PI;
  ok('Vela timing: 0.03 s at D = 10⁵ km near 90° moves θ by about 5°', Math.abs(dth - 5) < 0.3, dth.toFixed(2));
  ok('even sky: 17 % within 10° of the plane (sin 10°)', Math.abs(Math.sin(10*Math.PI/180)*100 - 17.4) < 0.1);
  // E_iso against published values
  const eB = C.eIso(B.boat.S, B.boat.z, P), eC = C.eIso(B.c16.S, B.c16.z, P), eZ = C.eIso(B.z82.S, B.z82.pubZ, P);
  ok('GRB 221009A: 0.22 erg/cm², z 0.151 → within 6 % of 1.2e55 (Frederiks)', rel(eB, 1.2e55) < 0.06, eB.toExponential(3));
  ok('GRB 221009A: within 30 % of 1.0e55 (Lesage, GBM band)', rel(eB, 1.0e55) < 0.3, (eB/1e55).toFixed(2));
  ok('GRB 080916C: 2.4e-4 erg/cm², z 4.35 → within 3 % of 8.8e54', rel(eC, 8.8e54) < 0.03, eC.toExponential(3));
  ok('GRB 090423: 1.1e-6 erg/cm², z 8.1 → within 5 % of 1.03e53 (GCN 9235)', rel(eZ, 1.03e53) < 0.05, eZ.toExponential(3));
  ok('E_iso / M☉c²: 1.2e55 → 6.7, model 1.27e55 → 7.1 ("six to seven")', Math.abs(1.2e55/C.MSUN_C2 - 6.7) < 0.1 && Math.abs(eB/C.MSUN_C2 - 7.1) < 0.05, (eB/C.MSUN_C2).toFixed(2));
  ok('M☉c² ≈ 1.8e54 erg', Math.abs(C.MSUN_C2/1e54 - 1.787) < 0.005, (C.MSUN_C2/1e54).toFixed(3));
  ok('E_iso scales linearly with fluence', rel(C.eIso(2e-6, 1, P)/C.eIso(1e-6, 1, P), 2) < 1e-12);
  // beaming
  ok('two cones of θ cover 1 − cos θ of the sky; θ = 90° → whole sky', Math.abs(C.beamFrac(90) - 1) < 1e-12);
  ok('small-angle f ≈ θ²/2 at 2°', rel(C.beamFrac(2), Math.pow(2*Math.PI/180, 2)/2) < 0.001, C.beamFrac(2).toExponential(3));
  ok('θ = 5°: f = 0.38 %, 1/f ≈ 263', Math.abs(C.beamFrac(5)*100 - 0.3805) < 0.001 && Math.round(1/C.beamFrac(5)) === 263, (C.beamFrac(5)*100).toFixed(4));
  // isotropy model
  ok('even sky ⟨sin² b⟩ = 1/3 when D ≤ disk half-thickness', Math.abs(C.expSin2(0.5) - 1/3) < 1e-12 && Math.abs(C.expSin2(1) - 1/3) < 1e-12);
  ok('model ⟨sin² b⟩ falls as we see further (D = 10 → 0.0176, hand-derived)', Math.abs(C.expSin2(10) - 0.01*(1/3 + Math.log(10))/1.495) < 1e-9 && C.expSin2(10) < C.expSin2(3), C.expSin2(10).toFixed(4));
  let mc = 0, n = 0; const r = C.sampleSky('disk', 10, 20000, 3); mc = C.meanSin2(r);
  ok('Monte Carlo disk sample matches the analytic expectation (D = 10)', Math.abs(mc - C.expSin2(10)) < 0.003, mc.toFixed(4));
  const ri = C.sampleSky('iso', 1, 20000, 5);
  ok('Monte Carlo even sky ⟨sin² b⟩ ≈ 1/3', Math.abs(C.meanSin2(ri) - 1/3) < 0.01, C.meanSin2(ri).toFixed(4));
  const h0 = C.hammer(0, 0), hp = C.hammer(Math.PI, 0);
  ok('Hammer projection: centre at origin, edge at 2√2', Math.abs(h0[0]) < 1e-12 && Math.abs(hp[0] - 2*Math.SQRT2) < 1e-9);
  // T90
  const sum = C.T90_HIST.reduce((a, b) => a + b, 0);
  ok('histogram holds all 4,391 bursts', sum === C.T90_TOTAL, sum);
  const s2 = C.t90Split(Math.log10(2));
  ok('2 s split = 741 short (exact count from the raw catalog)', s2.shortN === C.T90_SHORT_2S, s2.shortN);
  ok('short share at 2 s ≈ 16.9 %', Math.abs(s2.shortN/C.T90_TOTAL*100 - 16.9) < 0.05, (s2.shortN/C.T90_TOTAL*100).toFixed(2));
  const agg = []; for(let i = 0; i < 104; i += 4) agg.push(C.T90_HIST.slice(i, i + 4).reduce((a, b) => a + b, 0));
  const lo = -2.2, peakLong = lo + 0.2*agg.indexOf(Math.max(...agg));
  ok('long-burst peak bin at about 25–40 s', Math.abs(peakLong - 1.4) < 1e-9, peakLong.toFixed(1));
  const shortSide = agg.slice(0, 13), sMax = lo + 0.2*shortSide.indexOf(Math.max(...shortSide));
  ok('short-side maximum is just under a second (0.63–1 s bin)', Math.abs(sMax - (-0.2)) < 1e-9, sMax.toFixed(1));
  ok('the short hump is small next to the long one', Math.max(...shortSide) < Math.max(...agg)/3, Math.max(...shortSide) + ' vs ' + Math.max(...agg));
  // fresh load: instrument 3 must open in its pressed GRB 221009A preset
  try {
    const {JSDOM} = require('jsdom'), fs = require('fs');
    const html = fs.readFileSync(process.argv[2], 'utf8').replace(/<script src="\/aerospace\/assets\/site.js" defer><\/script>/, '').replace(/<script defer src="https:\/\/static.cloudflareinsights[^>]*><\/script>/, '');
    const f = new JSDOM(html, {runScripts:'dangerously', pretendToBeVisual:true, beforeParse(x){ x.matchMedia = () => ({matches:false, addEventListener(){}}); x.IntersectionObserver = class { observe(){} }; x.Element.prototype.scrollIntoView = function(){}; }});
    const fr = f.window.document.getElementById('enReadout').textContent, fs2 = f.window.document.getElementById('enStatus').textContent;
    ok('fresh load: GRB 221009A readout shows PUBLISHED 1.20 × 10⁵⁵', /1\.20 × 10⁵⁵/.test(fr), fr.slice(0, 60));
    ok('fresh load: status compares with the published value', /% from the published value/.test(fs2), fs2.slice(0, 50));
    ok('fresh load: every slider has aria-valuetext', [...f.window.document.querySelectorAll('input[type=range]')].every(r => r.getAttribute('aria-valuetext')));
    f.window.close();
  } catch(e){ ok('fresh load ran', false, e.message); }
  // page state
  const d = w.document, get = id => d.getElementById(id);
  d.querySelector('#enPre .btn[data-k="c16"]').click();
  ok('GRB 080916C preset shows its published value', /8[.,]80 × 10⁵⁴/.test(get('enReadout').textContent), get('enReadout').textContent.match(/PUBLISHED[^)]*\)/) ? 'shown' : get('enReadout').textContent.slice(0, 80));
  d.querySelector('#enPre .btn[data-k="z82"]').click();
  ok('GRB 090423 compares at the published z = 8.1 (≈ 2 %)', /z = 8\.1 this simple estimate gives 1\.0[01] × 10⁵³/.test(get('enStatus').textContent) && /\b2 %/.test(get('enStatus').textContent), get('enStatus').textContent.slice(0, 90));
  d.querySelector('#enPre .btn[data-k="boat"]').click();
  ok('GRB 221009A status reports the % difference', /% from the published value/.test(get('enStatus').textContent), get('enStatus').textContent.slice(0, 60));
  d.querySelector('#t90Pre .btn[data-t="0.30"]').click();
  ok('T90 readout at 2 s shows 741', /741/.test(get('t90Readout').textContent));
  d.querySelector('#skyPre .btn[data-m="iso"]').click();
  ok('sky: "everywhere" disables the distance slider', get('skyD').disabled === true);
  d.querySelector('#skyPre .btn[data-m="disk"]').click();
  ok('instrument table has 4 rows', d.querySelectorAll('#instTable tbody tr').length === 4);
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('RU: readouts use decimal commas and Russian units', /эрг/.test(get('enReadout').textContent) && /,\d/.test(get('enReadout').textContent));
  ok('RU: no NaN anywhere', !/NaN|undefined/.test(d.body.textContent));
  ok('RU status says «на N % отличается»', /на \d+ % отличается от опубликованного значения/.test(get('enStatus').textContent), get('enStatus').textContent.slice(0, 70));
  ok('RU: four-digit counts are not split (4391)', /4391/.test(get('t90Readout').textContent));
  ok('RU: button-group labels translated', get('enPre').getAttribute('aria-label') === 'Всплеск');
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('EN: no NaN anywhere', !/NaN|undefined/.test(d.body.textContent));
  console.log(out.join('\n'));
};
