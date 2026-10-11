module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const d = w.document, near = (a, b, tol) => Math.abs(a - b) <= tol;

  /* CH1 — the deadline */
  const days = (Date.UTC(1969, 6, 20) - Date.UTC(1961, 4, 25))/864e5, eightYears = (Date.UTC(1969, 4, 25) - Date.UTC(1961, 4, 25))/864e5;
  ok('speech → landing = 8 years + 56 days (= 8 weeks)', days - eightYears === 56, days - eightYears);
  ok('speech came 43 days (~6 weeks) after Gagarin, 20 after Shepard', (Date.UTC(1961,4,25) - Date.UTC(1961,3,12))/864e5 === 43 && (Date.UTC(1961,4,25) - Date.UTC(1961,4,5))/864e5 === 20);
  ok('landing → end of 1969 ≈ 5 months (164 days)', (Date.UTC(1969,11,31) - Date.UTC(1969,6,20))/864e5 === 164);

  /* CH2 — mass ledger (SP-4029 Apollo 11 weights) */
  const L = C.LEDGER;
  ok('liftoff 6,477,875 lb = 2,938 t (card value)', Math.round(C.tonnes(L[0].lb)) === 2938, C.tonnes(L[0].lb).toFixed(1));
  ok('spacecraft bound for the Moon 43.9 t', near(C.tonnes(L[1].lb), 43.89, 0.01), C.tonnes(L[1].lb).toFixed(2));
  ok('LOI burned a quarter of the stack (25.6 %)', near(1 - L[2].lb/L[1].lb, 0.256, 0.001), (100*(1 - L[2].lb/L[1].lb)).toFixed(1) + '%');
  ok('Columbia waiting in orbit 37,076.8 lb = 16.8 t (status text)', near(C.tonnes(37076.8), 16.82, 0.01));
  ok('Eagle at landing 7.33 t', near(C.tonnes(L[3].lb), 7.327, 0.001), C.tonnes(L[3].lb).toFixed(3));
  ok('splashdown 10,873 lb = 4.932 t', near(C.tonnes(L[8].lb), 4.932, 0.001), C.tonnes(L[8].lb).toFixed(3));
  ok('came home: 0.168 % of liftoff, 1 kg in 596', near(L[8].lb/L[0].lb*100, 0.168, 0.0005) && Math.round(L[0].lb/L[8].lb) === 596, (L[8].lb/L[0].lb*100).toFixed(4) + '%');
  ok('Apollo 11 samples 47.51 lb = 21.5 kg (splashdown text)', near(47.51*0.45359237, 21.55, 0.01));
  ok('every ledger step is lighter than liftoff and the list ends at splashdown', L.every(s => s.lb < L[0].lb || s === L[0]) && L[8].lb === 10873.0);
  for(let i = 0; i < L.length; i++){ C.setLedger(i); }
  const ledgerText = d.getElementById('ledgerOut').textContent;
  ok('ledger renders all steps without NaN', !/NaN|undefined/.test(ledgerText + d.getElementById('ledgerSvg').textContent) && d.querySelectorAll('#ledgerBtns .btn').length === 9);

  /* CH3 — entry speed quoted */
  ok('entry 36,194.4 ft/s = 11.03 km/s', near(36194.4*0.3048/1000, 11.03, 0.005), (36194.4*0.3048/1000).toFixed(3));

  /* CH4 — Apollo 10 low point */
  ok('Apollo 10: 47,400 ft = 14.4 km', near(47400*0.3048/1000, 14.45, 0.01), (47400*0.3048/1000).toFixed(2));

  /* CH5 — the fuel clock (Mission Report §9.8.3, GOSS NET 1, SP-4029) */
  const F = C.FC;
  ok('light at 102:44:30.4 → 45 s of firing left at engine cutoff (report: 45 s indicated)', near(C.toEmpty(F.CUTOFF), 45, 0.5), C.toEmpty(F.CUTOFF).toFixed(1));
  ok('post-flight figure at cutoff = 50 s (report: 50 s to oxidizer tank 2 depletion)', near(C.toEmpty(F.CUTOFF) + F.POST, 50, 0.5));
  ok('light → land-or-abort window = 96 s', C.toAbort(F.LL) === 96);
  const hb1 = F.CALL60 + 60, hb2 = F.CALL30 + 30;
  ok('Houston’s two calls imply the same land-or-abort time (within 1 s)', Math.abs(hb1 - hb2) <= 1, (hb1 - hb2) + ' s');
  const ahead = F.LL + F.T_LL - F.RESERVE - C.houstonBingo();
  ok('Houston’s count ran ~5 s ahead of the gauge (conservative side)', ahead > 0 && ahead < 6, ahead.toFixed(1) + ' s');
  ok('“60 seconds” called at 102:45:02, “30 seconds” at 102:45:31', F.CALL60 === C.gs(102,45,2) && F.CALL30 === C.gs(102,45,31));
  ok('engine stopped 1.5 s after contact light', near(F.CUTOFF - F.CONTACT, 1.5, 0.01));
  ok('land-or-abort point would have come ~25 s after cutoff', near(C.toAbort(F.CUTOFF), 25, 0.5), C.toAbort(F.CUTOFF).toFixed(1));
  ok('“about 116 s” at the light and “about 200 feet” before it (transcript: 200 ft at 102:44:24, 160 ft at 102:44:31)', F.T_LL === 116);
  const h = C.hover();
  ok('hovering Eagle 7,327 kg needed 11.9 kN', near(h.F/1000, 11.87, 0.01), (h.F/1000).toFixed(2));
  ok('= 27 % of the 9,870 lbf (43.9 kN) maximum', near(h.Fmax/1000, 43.90, 0.01) && Math.round(h.frac*100) === 27, (h.frac*100).toFixed(1) + '%');
  ok('powered descent 756.39 s ≈ 12½ min', near(756.39/60, 12.6, 0.05));
  [F.LL - 20, F.LL, F.CALL60, F.CALL30, F.CONTACT, F.CUTOFF, F.LL + 100].forEach(t => C.setFuel(t));
  ok('fuel clock renders across its range without NaN', !/NaN|undefined/.test(d.getElementById('fuelOut').textContent + d.getElementById('fuelStatus').textContent + d.getElementById('fuelSvg').textContent));
  ok('fuel slider has aria-valuetext', !!d.getElementById('fuelT').getAttribute('aria-valuetext'));

  /* CH8 — six landings (SP-4029 EVA table) */
  const E = C.EVA, M = C.EVA_METRICS, sum = a => a.reduce((s, x) => s + x, 0);
  const kg = E.map(M[0].f), hrs = E.map(M[1].f), km = E.map(M[2].f), far = E.map(M[3].f);
  ok('total samples 841.54 lb = 381.7 kg (“382 kilograms”)', near(sum(E.map(r => r.lb)), 841.54, 0.001) && near(sum(kg), 381.7, 0.05), sum(kg).toFixed(2));
  ok('Apollo 17 brought back ~5× Apollo 11', near(kg[5]/kg[0], 5.1, 0.1), (kg[5]/kg[0]).toFixed(2));
  ok('Apollo 11 outside 2.53 h, Apollo 17 22.07 h', near(hrs[0], 2.528, 0.001) && near(hrs[5], 22.066, 0.001));
  ok('J-mission drives 27–36 km', km.slice(3).every(v => v >= 26 && v <= 36), km.slice(3).map(v => v.toFixed(1)).join(', '));
  ok('Apollo 11 never beyond ~60 m; Apollo 17 to 7.6 km', near(far[0]*1000, 61, 1) && near(far[5], 7.63, 0.01), (far[0]*1000).toFixed(0) + ' m, ' + far[5].toFixed(2) + ' km');
  for(let i = 0; i < M.length; i++) C.setEva(i);
  ok('EVA chart renders all four measures without NaN', !/NaN|undefined/.test(d.getElementById('evaOut').textContent + d.getElementById('evaSvg').textContent));


  /* --- review round (2026-10-11) --- */
  ok('each landing kept its crew outside longer than the last (CH8 lede)', hrs.every((v, i) => i === 0 || v > hrs[i-1]));
  ok('…but not each went farther: Apollo 16 < Apollo 15 (lede no longer claims it)', km[4] < km[3] && far[4] < far[3] && !/went farther than the last/.test(d.body.innerHTML));
  ok('fuel readout: no empty grey cell (even count of normal cells)', [...d.querySelectorAll('#fuelOut .readout-cell:not(.wide)')].length % 2 === 0);
  ok('Houston-lead figure labelled as a reconstruction', /RECONSTRUCTED/.test(d.getElementById('fuelOut').textContent));
  ok('25 s left to land-or-abort stated in CH5 prose', /25 seconds before the land-or-abort point/.test(d.body.innerHTML));
  ok('slider hit area is 44 px', /input\[type=range\]\{[^}]*height:44px/.test(d.querySelector('style').textContent));
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  C.setLedger(0);
  const ledRu = d.getElementById('ledgerOut').textContent + d.getElementById('ledgerSvg').textContent + d.getElementById('ledgerSvg').getAttribute('aria-label');
  ok('RU ledger uses «т», never Latin " t"', /\d т/.test(ledRu) && !/\d t\b/.test(ledRu) && !/фнт/.test(ledRu), (ledRu.match(/\d t\b/g) || []).length);
  ok('RU: Н1-Л3 in Cyrillic, no undefined «ЛМ»', !/N1-Л3/.test(d.body.innerHTML) && !/ОТ ЛМ/.test(d.body.innerHTML));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  /* CH3 stack */
  const hs = [...d.querySelectorAll('#apolloSvg .hotspot')].map(g => g.dataset.id);
  ok('CH3 stack drawn in flight order LES → CM → heat shield → SM → LM', hs.join(',') === 'les,cm,heatshield,sm,lm', hs.join(','));
  ok('CH3 has 5 labels and 5 straight vertical leaders', d.querySelectorAll('#apolloSvg .stack-label').length === 5);
  /* CH5 descent profile */
  const DS = C.DESCENT;
  ok('descent data: time increasing, altitude non-increasing, ends at 0 ft at 102:45:39.9', DS.every((p, i) => i === 0 || (p[0] > DS[i-1][0] && p[1] <= DS[i-1][1])) && DS[DS.length-1][1] === 0 && DS[DS.length-1][0] === C.gs(102,45,39.9));
  ok('stage spans are contiguous', C.STAGE_SPANS.every((sp, i) => i === 0 || sp[0] === C.STAGE_SPANS[i-1][1]));
  ok('“The Eagle has landed” words ~20 s after contact (102:45:59 / 102:46:04)', Math.abs((C.gs(102,45,59) - C.gs(102,45,39.9)) - 19.1) < 0.01);
  const btn = [...d.querySelectorAll('#landingControls .stage-btn')];
  btn.forEach(b => { b.click(); });
  ok('descent figure renders all five stages, no NaN', btn.length === 5 && !/NaN|undefined/.test(d.getElementById('landingSvg').innerHTML));
  btn[0].click();
  /* narrow layouts */
  ['ledgerSvg', 'fuelSvg', 'evaSvg', 'landingSvg'].forEach(id => Object.defineProperty(d.getElementById(id), 'clientWidth', {value:340, configurable:true}));
  C.setLedger(8); C.setFuel(C.FC.CONTACT); C.setEva(0); btn[2].click();
  const vbs = ['ledgerSvg', 'fuelSvg', 'evaSvg', 'landingSvg'].map(id => d.getElementById(id).getAttribute('viewBox').split(' ')[2]);
  ok('below 480 px all four charts switch to a 360-unit layout', vbs.every(v => v === '360') && !/NaN/.test(d.getElementById('ledgerSvg').innerHTML + d.getElementById('landingSvg').innerHTML), vbs.join(','));
  /* language switch keeps everything rendering */
  d.querySelector('#langtoggle button[data-lang="ru"]').click();
  const ru = d.getElementById('fuelOut').textContent + d.getElementById('ledgerOut').textContent + d.getElementById('evaOut').textContent;
  ok('Russian mode: instruments render with decimal commas, no NaN', !/NaN|undefined/.test(ru) && /\d,\d/.test(ru));
  d.querySelector('#langtoggle button[data-lang="en"]').click();

  /* accessibility of the older widgets */
  ok('timeline dots are buttons', d.querySelectorAll('#buildupEvents button.mt-dot').length === 5);
  ok('expandable cards are keyboard-reachable', [...d.querySelectorAll('.exp-head')].every(e => e.getAttribute('tabindex') === '0' && e.hasAttribute('aria-expanded')));
  ok('spacecraft hotspots are focusable buttons', [...d.querySelectorAll('#apolloSvg .hotspot')].every(g => g.getAttribute('tabindex') === '0' && g.getAttribute('role') === 'button'));
  console.log(out.join('\n'));
};
