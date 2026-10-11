module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const P = C.PROBE_NOW, d = w.document;
  const isoJD = jd => new Date((jd - C.JD_UNIX) * 864e5).toISOString().slice(0, 10);

  /* escape model v(r)^2 = vinf^2 + 2GM/r, against JPL Horizons speeds at other epochs */
  [['v1', 207.7958, 16.8614, '2036'], ['v1', 136.3603, 17.0016, '2016'], ['v2', 176.1140, 15.1855, '2036'], ['v2', 112.4530, 15.3854, '2016'],
   ['p10', 82.1307, 12.2252, '23 Jan 2003'], ['p11', 44.0762, 12.2257, '30 Sep 1995'], ['p10', 167.0329, 11.7753, '2036'], ['p11', 141.3900, 11.0227, '2036']]
    .forEach(([k, r, vh, when]) => { const v = C.vAt(P[k], r); ok(`${k} speed at ${r} AU (${when}) within 0.01 km/s of Horizons ${vh}`, Math.abs(v - vh) < 0.01, v.toFixed(4)); });
  ok('escape speed at 1 AU = 42.1 km/s', Math.abs(C.vEsc(1) - 42.12) < 0.02, C.vEsc(1).toFixed(3));
  Object.keys(P).forEach(k => { const p = P[k]; ok(`${k} escaping today and right after its last flyby (v > v_esc)`, p.v > C.vEsc(p.r) && C.vAt(p, p.rMin) > C.vEsc(p.rMin)); });
  ok('Voyager 1 keeps ~16.6 km/s forever (v∞)', Math.abs(C.vInf(P.v1) - 16.61) < 0.01, C.vInf(P.v1).toFixed(3));
  /* NASA FAQ: ~3.5 AU/yr (V1) and ~3.1 AU/yr (V2) */
  const auyr = id => C.helioAU(id, C.JD0 + 365.25) - C.helioAU(id, C.JD0);
  ok('Voyager 1 recedes ~3.5 AU/yr (NASA FAQ)', Math.abs(auyr('v1') - 3.5) < 0.1, auyr('v1').toFixed(3));
  ok('Voyager 2 recedes ~3.1 AU/yr (NASA FAQ)', Math.abs(auyr('v2') - 3.1) < 0.1, auyr('v2').toFixed(3));

  /* power budget */
  ok('470 W at launch (NSSDC)', C.power(C.T_LAUNCH) === 470);
  ok('335 W at the start of 1997 (NSSDC)', Math.abs(C.power(1997.0) - 335) < 1e-9);
  ok('−4 W per year after 1997 (NASA)', Math.abs((C.power(2020) - C.power(2010)) / 10 + 4) < 1e-9);
  const p26 = C.power(C.yearOf(2026, 10, 10));
  ok('Oct 2026 ≈ 216 W (335 − 4 × 29.8), under half of 470 W', Math.abs(p26 - 215.9) < 0.1 && p26 < 235, p26.toFixed(1));
  ok('plutonium alone halves in 87.7 years', Math.abs(C.fuelOnly(C.T_LAUNCH + 87.7) - 235) < 1e-9);
  ok('plutonium alone would still give ~319 W in Oct 2026', Math.abs(C.fuelOnly(C.yearOf(2026, 10, 10)) - 319) < 1.5, C.fuelOnly(C.yearOf(2026, 10, 10)).toFixed(1));
  ok('half the launch power passed in 2022', Math.abs(C.halfPowerYear() - 2022.0) < 1e-9, C.halfPowerYear());
  const io = t => JSON.stringify(C.instrumentsOn(t));
  ok('instruments (V1/V2): mid-2024 4/5, after 26 Sep 2024 4/4 (JPL: four others still on)', io(2024.5) === '[4,5]' && io(C.yearOf(2024, 10, 1)) === '[4,4]');
  ok('instruments: after 24 Mar 2025 3/3 (JPL: three on each)', io(C.yearOf(2025, 4, 1)) === '[3,3]');
  ok('instruments: after 17 Apr 2026 2/3', io(C.yearOf(2026, 5, 1)) === '[2,3]');
  ok('no instrument count before 2024', C.instrumentsOn(2010) === null);

  /* where now: straight-line model + Earth, against Horizons geocentric light time */
  [['v1', 2461324.5, 0.995884], ['v1', 2461364.5, 1.000132], ['v1', 2462000.5, 1.029703], ['v1', 2465000.5, 1.203877],
   ['v2', 2461323.5, 0.832295], ['v2', 2463600.5, 0.951258], ['v2', 2465000.5, 1.018614]]
    .forEach(([id, jd, lt]) => { const m = C.lightDaysFromEarth(id, jd), dm = (m - lt) * 1440; ok(`${id} light time on ${isoJD(jd)} within 1 min of Horizons`, Math.abs(dm) < 1, dm.toFixed(2) + ' min'); });
  ok('Voyager 1 from the Sun on 3 Jan 2033 ≈ 194.18 AU (Horizons)', Math.abs(C.helioAU('v1', 2463600.5) - 194.183) < 0.05, C.helioAU('v1', 2463600.5).toFixed(3));
  ok('Voyager 2 from the Sun on 3 Jan 2033 ≈ 163.96 AU (Horizons)', Math.abs(C.helioAU('v2', 2463600.5) - 163.956) < 0.05, C.helioAU('v2', 2463600.5).toFixed(3));
  /* one-light-day dates, against JPL Horizons (12-h steps, interpolated) */
  const jdOf = iso => Date.parse(iso) / 864e5 + C.JD_UNIX;
  [['v1', 'Earth', C.crossingEarth('v1'), '2026-11-18T12:00Z'], ['v1', 'Sun', C.crossingSun('v1'), '2027-02-03T21:40Z'],
   ['v2', 'Earth', C.crossingEarth('v2'), '2035-11-01T07:00Z'], ['v2', 'Sun', C.crossingSun('v2'), '2035-11-27T02:30Z']]
    .forEach(([id, from, jd, hz]) => ok(`${id} one light-day from ${from} within 1 day of Horizons (${hz.slice(0, 10)})`, Math.abs(jd - jdOf(hz)) < 1, isoJD(jd)));
  const ce = C.crossingEarth('v1');
  let dips = 0; for (let jd = ce + 1; jd < ce + 800; jd += 1) if (C.lightDaysFromEarth('v1', jd) < 1) dips++;
  ok('after mid-Nov 2026 Voyager 1 never comes back inside one light-day (800 days checked; the yearly minima rise by ~3.5 AU/yr)', dips === 0);
  const pe = Math.hypot(...C.earthPos(2461408.5)), ap = Math.hypot(...C.earthPos(2461590.5));
  ok('Earth model: perihelion ~0.9833 AU (Jan), aphelion ~1.0167 AU (Jul)', Math.abs(pe - 0.9833) < 0.0005 && Math.abs(ap - 1.0167) < 0.0005, pe.toFixed(4) + ' / ' + ap.toFixed(4));
  ok('dashboard: Voyager 1 signal from Earth ≈ 23.9 h on 10 Oct 2026', Math.abs(C.lightDaysFromEarth('v1', C.JD0) * 24 - 23.90) < 0.05, (C.lightDaysFromEarth('v1', C.JD0) * 24).toFixed(2));
  ok('dashboard: Voyager 1 172.0 AU = 25.7 bn km', Math.abs(P.v1.r * C.AU_KM / 1e9 - 25.73) < 0.01);

  /* page: every control in both languages renders numbers, never NaN/undefined */
  const bad = () => /NaN|undefined|Infinity/.test(['escCells', 'escVerdict', 'pwrCells', 'pwrVerdict', 'whereCells', 'whereVerdict', 'dashGrid', 'velCompare'].map(i => d.getElementById(i).textContent).join(' '));
  let clean = true;
  ['ru', 'en'].forEach(l => {
    d.querySelector(`#langtoggle button[data-lang="${l}"]`).click();
    d.querySelectorAll('#escBtns .vg-btn').forEach(b => { b.click(); ['0', '1000', '500'].forEach(v => { const s = d.getElementById('escSlider'); s.value = v; s.dispatchEvent(new w.Event('input')); if (bad()) clean = false; }); });
    ['1977.75', '1997', '2024.8', '2026.5', '2036'].forEach(v => { const s = d.getElementById('pwrSlider'); s.value = v; s.dispatchEvent(new w.Event('input')); if (bad()) clean = false; });
    d.querySelectorAll('#whereBtns .vg-btn').forEach(b => { b.click(); ['0', '1', '61', '122'].forEach(v => { const s = d.getElementById('whereSlider'); s.value = v; s.dispatchEvent(new w.Event('input')); if (bad()) clean = false; }); });
  });
  ok('all instruments render in EN and RU without NaN', clean);
  ok('Russian readouts use decimal commas', /\d,\d/.test((() => { d.querySelector('#langtoggle button[data-lang="ru"]').click(); const t = d.getElementById('escCells').textContent; d.querySelector('#langtoggle button[data-lang="en"]').click(); return t; })()));
  ok('sliders announce values (aria-valuetext)', ['escSlider', 'pwrSlider', 'whereSlider', 'zoomSlider'].every(i => (d.getElementById(i).getAttribute('aria-valuetext') || '').length > 0));
  /* review fixes */
  ok('plutonium alone in 2036 is just under 300 W (aria says "about 300 W")', C.fuelOnly(2036) > 290 && C.fuelOnly(2036) < 300 && /about 300 W/.test(d.getElementById('pwrSvg').getAttribute('aria-label')), C.fuelOnly(2036).toFixed(1));
  const lang = l => d.querySelector(`#langtoggle button[data-lang="${l}"]`).click();
  lang('ru');
  { const s = d.getElementById('whereSlider'); s.value = '5'; s.dispatchEvent(new w.Event('input')); }
  const wv = d.getElementById('whereVal').textContent, wverd = d.getElementById('whereVerdict').textContent;
  ok('RU month without a day is nominative (март 2027)', wv === 'март 2027', wv);
  ok('RU probe name in the genitive (до «Вояджера-N»)', /до «Вояджера-[12]»/.test(wverd) && /Скорость «(Вояджера|Пионера)-[0-9]+».*до «Вояджера-[12]»/.test(d.getElementById('escSvg').getAttribute('aria-label') + d.getElementById('whereSvg').getAttribute('aria-label')));
  ok('RU pwr aria says около 300 Вт', /около 300 Вт/.test(d.getElementById('pwrSvg').getAttribute('aria-label')));
  lang('en');
  { const s = d.getElementById('whereSlider'); s.value = '0'; s.dispatchEvent(new w.Event('input')); }
  const ty = (svgId, label) => [...d.getElementById(svgId).querySelectorAll('text')].find(t => t.textContent === label);
  ok('Fig 4.2: "watts" clears the top tick "500" by ≥ 10 px', +ty('pwrSvg', '500').getAttribute('y') - +ty('pwrSvg', 'watts').getAttribute('y') >= 10);
  ok('Fig 9.1: axis title clears the top tick "30" by ≥ 10 px', +ty('whereSvg', '30').getAttribute('y') - +ty('whereSvg', 'hours, Earth to spacecraft').getAttribute('y') >= 10);
  const cards = d.querySelectorAll('#messageList .exp-card'); cards[2].dispatchEvent(new w.MouseEvent('click', {bubbles: true}));
  ok('CH6 card opens from a click dispatched on the card itself (site.js keyboard path)', cards[2].classList.contains('open'));
  const tabs = d.querySelectorAll('#planetTabs [role=tab]'); tabs[3].click();
  ok('CH5 tabs: role=tab with aria-selected following the choice', tabs.length === 4 && tabs[3].getAttribute('aria-selected') === 'true' && tabs[0].getAttribute('aria-selected') === 'false');
  d.querySelector('#pioneerPanel .module-chip[data-jump="antenna"]').click();
  ok('component chips stay in the tab order after a selection', [...d.querySelectorAll('#pioneerPanel .module-chip')].every(c => c.getAttribute('tabindex') === '0'));
  ok('no Sumer/six-thousand-years claim left', !/Sumer|Шумер/.test(d.documentElement.outerHTML));
  console.log(out.join('\n'));
};
