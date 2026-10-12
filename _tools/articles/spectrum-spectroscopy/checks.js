module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const d = w.document, get = id => d.getElementById(id);
  // CH1 — Newton
  ok('Newton: 2° 49′ ÷ 31′ ≈ 5.5', near(169/31, 5.45, 0.01), (169/31).toFixed(3));
  // CH2/3 — atlas and line matching
  const at = wl => C.ATLAS.find(a => Math.abs(a[0] - wl) < 0.0005);
  ok('atlas: Ca II K 3933.682 Å = 20,253 mÅ, about 2.0 nm', at(3933.682) && at(3933.682)[1] === 20253 && near(at(3933.682)[1]*1e-4, 2.0253, 1e-9));
  ok('atlas: Na D₂ 752 mÅ, D₁ 564 mÅ, Hα 4,020 mÅ', at(5889.973)[1] === 752 && at(5895.940)[1] === 564 && at(6562.808)[1] === 4020);
  ok('K is about 27 times D₂', Math.round(20253/752) === 27, (20253/752).toFixed(2));
  ok('no atlas line is wider than K', Math.max(...C.ATLAS.map(a => a[1])) === 20253);
  ok('every labelled line is in the atlas list', C.LABELLED.every(l => at(l[0])));
  const hits = el => C.matchLines(el).filter(m => m.sun).length + '/' + C.LAB[el].length;
  ok('hydrogen: all 7 Balmer lines land on solar lines', hits('H') === '7/7', hits('H'));
  ok('sodium: 3 of 3', hits('Na') === '3/3', hits('Na'));
  ok('magnesium: 7 of 7', hits('Mg') === '7/7', hits('Mg'));
  ok('calcium: 8 of 8', hits('Ca') === '8/8', hits('Ca'));
  ok('iron: 30 of 30 (the text says its 30 strongest)', hits('Fe') === '30/30' && C.LAB.Fe.length === 30, hits('Fe'));
  ok('helium: 0 of 8 — no helium in the dark-line spectrum', hits('He') === '0/8', hits('He'));
  const d3 = C.matchLines('He').find(m => m.lab === 587.5621);
  ok('helium 587.56 nm is more than 1 nm from any solar line in the list', d3.d > 1, d3.d.toFixed(3));
  ok('sodium D lines match the atlas D lines', C.matchLines('Na').slice(0, 2).every((m, i) => m.sun && m.sun[0] === [5889.973, 5895.940][i]));
  ok('Peck & Reeder reproduces NIST: 200.0648 nm vacuum = 200.0000 nm air', near(C.vacToAir(200.0648), 200.0000, 0.00005), C.vacToAir(200.0648).toFixed(5));
  // CH4 — helium
  ok('D₂ − D₃ = 1.433 nm', near(588.995095 - 587.5621, 1.433, 0.0005), (588.995095 - 587.5621).toFixed(4));
  ok('D₁ − D₂ = 0.597 nm', near(589.592424 - 588.995095, 0.597, 0.0005), (589.592424 - 588.995095).toFixed(4));
  ok('D₃ is more than twice as far from D₂ as D₁ is', (588.995095 - 587.5621)/(589.592424 - 588.995095) > 2);
  ok('helium on Earth 27 years after the Sun', 1895 - 1868 === 27);
  // CH5 — hydrogen ladder
  ok('R_H = 109,677.58 cm⁻¹', near(C.R_H/100, 109677.58, 0.01), (C.R_H/100).toFixed(3));
  const r90 = (C.RYDBERG_1890/(C.R_H/100) - 1)*100;
  ok('Rydberg 1890 is 0.04 % above today\'s R_H', near(r90, 0.040, 0.0005), r90.toFixed(4) + ' %');
  let mx = 0; for(const lo of [1, 2, 3]) for(const n in C.NIST_H[lo]) mx = Math.max(mx, Math.abs(C.shownWl(C.rydbergVac(lo, +n)) - C.NIST_H[lo][n]));
  ok('Rydberg formula within 0.02 nm of every NIST line (31 lines)', mx < 0.02, mx.toFixed(4));
  ok('Hα in air = 656.288 nm (NIST 656.2819)', near(C.shownWl(C.rydbergVac(2, 3)), 656.288, 0.001), C.shownWl(C.rydbergVac(2, 3)).toFixed(4));
  ok('Lyman α in vacuum = 121.568 nm (NIST 121.567)', near(C.rydbergVac(1, 2), 121.568, 0.001), C.rydbergVac(1, 2).toFixed(4));
  let mb = 0; for(let n = 3; n <= 12; n++) mb = Math.max(mb, Math.abs(C.balmer1885(n) - C.NIST_H[2][n])/C.NIST_H[2][n]*100);
  ok('Balmer 1885 within 0.012 % for n = 3–12', mb < 0.012, mb.toFixed(4) + ' %');
  ok('Balmer\'s h is 0.04 nm below the series limit in air', near(C.shownWl(4e9/C.R_H) - 364.56, 0.04, 0.005), (C.shownWl(4e9/C.R_H) - 364.56).toFixed(3));
  ok('level 2 sits 10.20 eV above level 1, matching NIST 82,259 cm⁻¹', near(C.levelEv(2) - C.levelEv(1), 82259.158*1.239841984e-4, 0.001), (C.levelEv(2) - C.levelEv(1)).toFixed(4));
  ok('Hα photon energy = 1.889 eV', near(C.levelEv(3) - C.levelEv(2), 1.889, 0.001), (C.levelEv(3) - C.levelEv(2)).toFixed(4));
  // CH6 — Harvard
  const tot = C.HD_COUNTS.reduce((s, c) => s + c[1], 0);
  ok('HD class counts add up to 225,300', tot === 225300, tot);
  ok('K and A are the two biggest classes', C.HD_COUNTS.slice().sort((a, b) => b[1] - a[1]).slice(0, 2).map(c => c[0]).join('') === 'KA');
  ok('dwarf temperatures fall from O5V to M5V', C.SPT.every((s, i) => i === 0 || s[1] < C.SPT[i - 1][1]));
  ok('O5V above 30,000 K, M0V below 4,000 K', C.SPT[0][1] > 30000 && C.SPT.find(s => s[0] === 'M0V')[1] < 4000);
  // CH7 — temperature and composition
  const tp = C.peakT(20);
  ok('Balmer strength peaks at ≈ 9,870 K for Pe = 20 Pa', near(tp, 9872, 5), tp.toFixed(0));
  ok('…within 2 % of the A0V temperature (Payne: “neighborhood of Class A0”)', Math.abs(tp/9700 - 1) < 0.02, ((tp/9700 - 1)*100).toFixed(2) + ' %');
  ok('peak moves only a few hundred K for Pe 10–100 Pa', C.peakT(10) > 9300 && C.peakT(100) < 11000, C.peakT(10).toFixed(0) + '–' + C.peakT(100).toFixed(0));
  ok('Sun: about 1 hydrogen atom in 2 × 10⁸ in level 2', near(1/C.n2Fraction(5772, 20), 2.0e8, 0.1e8), (1/C.n2Fraction(5772, 20)).toExponential(2));
  ok('the Sun\'s glow peaks near 502 nm', near(C.wienNm(5772), 502, 0.5), C.wienNm(5772).toFixed(1));
  ok('5,772 K is nearest the G2V mean', C.nearestType(5772)[0] === 'G2V');
  ok('Payne: ≈ 1.6 million H per Si', near(C.perSilicon(C.PAYNE, 'H')/1e6, 1.58, 0.01), C.perSilicon(C.PAYNE, 'H').toExponential(3));
  ok('2021: ≈ 31,000 H per Si', near(C.perSilicon(C.ASPLUND, 'H'), 30903, 5), C.perSilicon(C.ASPLUND, 'H').toFixed(0));
  ok('Asplund X + Y + Z = 1', near(0.7438 + 0.2423 + 0.0139, 1, 1e-9));
  // CH8 — wobble
  const mp = C.minMassMJ(59, 4.2293, 1);
  ok('51 Peg b: K 59 m/s, P 4.2293 d, 1 M☉ → 0.47 M_J (published 0.47 ± 0.02)', near(mp, 0.47, 0.005), mp.toFixed(4));
  ok('51 Peg b orbit ≈ 0.05 AU', near(C.orbitAU(4.2293, 1, mp), 0.0512, 0.0005), C.orbitAU(4.2293, 1, mp).toFixed(4));
  ok('Jupiter moves the Sun 12.5 m/s (Nobel background: ±13 m/s)', near(C.kAmp(1, 4332.589, 1), 12.46, 0.01), C.kAmp(1, 4332.589, 1).toFixed(3));
  ok('Jupiter\'s period ≈ 12 years', near(4332.589/365.256, 11.86, 0.01));
  ok('Earth moves the Sun 8.9 cm/s', near(C.kAmp(C.GM_EARTH/C.GM_JUP, 365.256, 1)*100, 8.95, 0.02), (C.kAmp(C.GM_EARTH/C.GM_JUP, 365.256, 1)*100).toFixed(3));
  ok('Earth preset 0.0031463 M_J = GM ratio', near(C.GM_EARTH/C.GM_JUP, 0.0031463, 1e-7), (C.GM_EARTH/C.GM_JUP).toFixed(7));
  ok('59 m/s at 589 nm = 0.116 pm', near(C.shiftNm(59, 589)*1e3, 0.116, 0.0005), (C.shiftNm(59, 589)*1e3).toFixed(4));
  ok('…1/121 of an ELODIE resolution element (R = 42,000)', Math.round(589/C.ELODIE_R/C.shiftNm(59, 589)) === 121);
  ok('59 m/s is more than four times ELODIE\'s 13 m/s', 59/13 > 4);
  // fresh load: presets render before any click
  try {
    const {JSDOM} = require('jsdom'), fs = require('fs');
    const html = fs.readFileSync(process.argv[2], 'utf8').replace(/<script src="\/aerospace\/assets\/site.js" defer><\/script>/, '').replace(/<script defer src="https:\/\/static.cloudflareinsights[^>]*><\/script>/, '');
    const f = new JSDOM(html, {runScripts:'dangerously', pretendToBeVisual:true, beforeParse(x){ x.matchMedia = () => ({matches:false, addEventListener(){}}); x.IntersectionObserver = class { observe(){} }; x.Element.prototype.scrollIntoView = function(){}; }});
    const g = id => f.window.document.getElementById(id).textContent;
    ok('fresh load: wobble shows 59.0 m/s for 51 Peg b', /59\.0 m\/s/.test(g('wbReadout')), g('wbReadout').slice(0, 40));
    ok('fresh load: thermometer shows the Sun, 5,772 K, G2V', /5,772 K/.test(g('thTVal')) && /G2V/.test(g('thReadout')));
    ok('fresh load: sodium 3 of 3 in sunlight', /3 of 3/.test(g('mtReadout')), g('mtReadout').slice(0, 50));
    ok('fresh load: ladder shows Hα 656.2883 nm', /656\.2883/.test(g('ldReadout')));
    ok('fresh load: every slider has aria-valuetext', [...f.window.document.querySelectorAll('input[type=range]')].every(r => r.getAttribute('aria-valuetext')));
    f.window.close();
  } catch(e){ ok('fresh load ran', false, e.message); }
  // page state after the smoke test clicked every button
  d.querySelector('#mtPre .btn[data-el="He"]').click();
  ok('HELIUM button: 0 of 8', /0 of 8/.test(get('mtReadout').textContent));
  d.querySelector('#mtPre .btn[data-el="Ca"]').click();
  ok('CALCIUM: strongest match is K at 393.368 nm, 2.025 nm wide', /393\.368/.test(get('mtReadout').textContent) && /2\.0253/.test(get('mtReadout').textContent));
  d.querySelector('#ldPre .btn[data-lo="1"]').click();
  ok('LYMAN: first line 121.5684 nm in vacuum', /121\.5684/.test(get('ldReadout').textContent) && /VACUUM/.test(get('ldReadout').textContent));
  d.querySelector('#wbPre .btn[data-m="1"]').click();
  ok('JUPITER–SUN preset: 12.5 m/s', /12\.5 m\/s/.test(get('wbReadout').textContent), get('wbReadout').textContent.slice(0, 40));
  d.querySelector('#thPre .btn[data-t="9700"]').click();
  ok('A0 preset: status says near the peak', /Near the peak/.test(get('thStatus').textContent));

  // ===== review fixes (REVIEW.md) =====
  const setR = (id, v) => { const el = get(id); el.value = v; el.dispatchEvent(new w.Event('input')); };
  // MUST 1: Hα status ppm matches the computed difference
  d.querySelector('#ldPre .btn[data-lo="2"]').click(); setR('ldN', 3);
  const ppmA = Math.abs(C.shownWl(C.rydbergVac(2, 3)) - C.NIST_H[2][3])/C.NIST_H[2][3]*1e6;
  const mPpm = get('ldStatus').textContent.match(/about (\d+) parts per million/);
  ok('MUST 1: Hα status says ' + Math.round(ppmA) + ' ppm, as computed', mPpm && +mPpm[1] === Math.round(ppmA) && Math.round(ppmA) === 10, mPpm && mPpm[1]);
  // MUST 2: wobble extremes
  setR('wbM', 1.5); setR('wbP', 0); setR('wbS', 0.1);
  const big = get('wbReadout').textContent;
  ok('MUST 2a: huge wobble prints "× N elements", never "1/0"', /× [\d.]+ elements/.test(big) && !/1\/0\b/.test(big), big.slice(-40));
  ok('MUST 2c: K ≥ 1000 m/s has digit grouping', /\d{1,3},\d{3} m\/s/.test(big), big.slice(0, 40));
  setR('wbM', -3.5); setR('wbP', 4); setR('wbS', 2);
  const tiny = get('wbReadout').textContent;
  ok('MUST 2b: tiny wobble never prints "0.00 fm"', !/0\.00 fm/.test(tiny) && /fm/.test(tiny), tiny.slice(0, 120));
  // MUST 3: no SVG label leaves its viewBox or overlaps another (monospace 0.6 em at the 14 px phone size), many states, both languages
  const svgs = ['mtSvg', 'ldSvg', 'hdSvg', 'thSvg', 'abSvg', 'wbSvg'];
  const layoutIssues = () => {
    const bad = [];
    svgs.forEach(id => {
      const svg = get(id), vb = svg.getAttribute('viewBox').split(' ').map(Number);
      const boxes = [...svg.querySelectorAll('text')].map(t => {
        const s = t.textContent, wdt = s.length*14*0.6, x = +t.getAttribute('x'), y = +t.getAttribute('y'), an = t.getAttribute('text-anchor');
        const x0 = an === 'end' ? x - wdt : an === 'middle' ? x - wdt/2 : x;
        return {s, x0, x1:x0 + wdt, y0:y - 11, y1:y + 2};
      });
      boxes.forEach(b => { if(b.x0 < -1 || b.x1 > vb[2] + 1 || b.y0 < 0 || b.y1 > vb[3]) bad.push(id + ' out: ' + b.s); });
      for(let i = 0; i < boxes.length; i++) for(let j = i + 1; j < boxes.length; j++){ const a = boxes[i], b = boxes[j];
        if(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) bad.push(id + ' overlap: ' + a.s + ' / ' + b.s); }
    });
    return bad;
  };
  const states = [() => {}, () => d.querySelector('#ldPre .btn[data-lo="1"]').click(), () => setR('ldN', 12), () => d.querySelector('#ldPre .btn[data-lo="3"]').click(), () => setR('ldN', 5),
    () => d.querySelector('#thPre .btn[data-t="3850"]').click(), () => d.querySelector('#thPre .btn[data-t="31400"]').click(), () => setR('thP', 3),
    () => d.querySelector('#wbPre .btn[data-m="1"]').click(), () => { setR('wbM', 1.5); setR('wbP', 0); setR('wbS', 0.1); },
    () => d.querySelector('#mtPre .btn[data-el="Fe"]').click(), () => d.querySelector('#mtPre .btn[data-el="He"]').click()];
  let issues = [];
  for(const l of ['en', 'ru']){ d.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); for(const st of states){ st(); issues = issues.concat(layoutIssues().map(x => l + ' ' + x)); } }
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  issues = [...new Set(issues)];
  ok('MUST 3: SVG labels stay inside their charts and never overlap (EN + RU, 12 states each)', issues.length === 0, issues.slice(0, 6).join(' | '));
  // MUST 4: Antonia Maury credited, cited, in the timeline
  ok('MUST 4: Maury in chapter 6 with citation [31], in the timeline (1897) and references', /Antonia Maury[^<]*\[31\]/.test(d.getElementById('ch6').textContent) && C.TIMELINE.some(e => e[0] === '1897' && /Maury/.test(e[1])) && C.REFERENCES.some(r => /Maury/.test(r.title)));
  // MUST 5: meta.json no longer overclaims
  const meta = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'meta.json'), 'utf8'));
  ok('MUST 5: meta description says found — and doubted, no "proof", no "discovery papers"', /doubted/.test(meta.description) && !/proof/.test(meta.description) && !/discovery papers/.test(meta.og));
  // MUST 6: Russian grammar
  const ruTxt = [...d.querySelectorAll('[data-ru]')].map(e => e.getAttribute('data-ru')).join(' ');
  ok('MUST 6: RU «её убедил — главным образом …», no «её убедили»', /её убедил — главным образом Генри Норрис Расселл, —/.test(ruTxt) && !/её убедили/.test(ruTxt));
  // SHOULD items
  setR('thP', 3); d.querySelector('#thPre .btn[data-t="9700"]').click();
  ok('star preset resets Pe to 20 Pa', near(Math.pow(10, +get('thP').value), 20, 1e-6) && /Near the peak/.test(get('thStatus').textContent));
  d.querySelector('#thPre .btn[data-t="5772"]').click();
  ok('Sun status explains why Hα is still strong', /Payne's discovery in miniature/.test(get('thStatus').textContent));
  setR('thT', 3.478);
  ok('3,000 K readout uses scientific notation, not 17 digits', /× 10/.test(get('thReadout').textContent) && !/\d{1,3}(,\d{3}){4,}/.test(get('thReadout').textContent));
  ok('RV axis: away is positive', /away \(\+\)/.test(get('wbSvg').textContent));
  ok('rubidium dated 1861 with a citation', /rubidium, described in their second paper of 1861 \[4\]\[34\]/.test(get('ch3').textContent));
  ok('helium: "seen in the Sun 27 years before it was recognised on Earth"', /seen in the Sun 27 years before it was recognised on Earth/.test(get('ch4').textContent));
  ok('redshift is not called a wobble', !/wobble of chapter 8 stretched/.test(d.body.textContent));
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  ok('RU: no NaN anywhere', !/NaN|undefined/.test(d.body.textContent));
  ok('RU: decimal commas and Russian units', /,\d/.test(get('wbReadout').textContent) && /м\/с/.test(get('wbReadout').textContent));
  ok('RU: button-group labels translated', get('mtPre').getAttribute('aria-label') === 'Элемент в лампе');
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  ok('EN: no NaN anywhere', !/NaN|undefined/.test(d.body.textContent));
  console.log(out.join('\n'));
};
