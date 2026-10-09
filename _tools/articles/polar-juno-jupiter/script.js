/* ============ CONSTANTS ============ */
var GM_J = 1.26687e8, R_J = 71492;                          // km³/s², km (equatorial)
var DAY = 86400;
function orbit(Tdays, hkm){
  var T = Tdays*DAY, rp = R_J + hkm, a = Math.pow(GM_J*T*T/(4*Math.PI*Math.PI), 1/3), ra = 2*a - rp, e = (ra - rp)/(ra + rp);
  var vp = Math.sqrt(GM_J*(2/rp - 1/a)), va = Math.sqrt(GM_J*(2/ra - 1/a));
  return {T:T, rp:rp, a:a, ra:ra, e:e, vp:vp, va:va, b:a*Math.sqrt(1 - e*e)};
}
function timeBelow(O, r){                                    // seconds per orbit spent inside radius r
  if(r <= O.rp) return 0; if(r >= O.ra) return O.T;
  var E = Math.acos((1 - r/O.a)/O.e), M = E - O.e*Math.sin(E); return 2*M/(2*Math.PI)*O.T;
}
function keplerPos(O, frac){                                 // position at fraction of period after perijove
  // Kepler's equation by bisection: E − e·sin E is monotonic, and Newton's method can diverge at e ≈ 0.98
  var M = 2*Math.PI*(frac - Math.floor(frac)), lo = 0, hi = 2*Math.PI, E = M;
  for(var k = 0; k < 52; k++){ E = 0.5*(lo + hi); if(E - O.e*Math.sin(E) < M) lo = E; else hi = E; }
  return {x:O.a*(Math.cos(E) - O.e), y:O.b*Math.sin(E)};
}
var MOONS = [['Io','Ио',421700],['Europa','Европа',671100],['Ganymede','Ганимед',1070400],['Callisto','Каллисто',1882700]];

/* ============ CH3 — ORBIT ============ */
var oT = document.getElementById('oT'), oH = document.getElementById('oH'), oDot = null, oGeom = null, oFrac = 0;
function renderOrbit(){
  var Td = +oT.value, h = +oH.value, O = orbit(Td, h), O0 = orbit(53.5, h), dv = O0.vp - O.vp;
  document.getElementById('oTVal').textContent = fmt(Td, 1) + T(' days',' сут');
  document.getElementById('oHVal').textContent = fmtInt(h) + T(' km',' км');
  var svg = document.getElementById('orbSvg'); svg.innerHTML = '';
  var jx = 440, jy = 170, sc = 400/9.0e6;
  MOONS.forEach(function(m, i){ ns('circle', {cx:jx, cy:jy, r:m[2]*sc, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, jx, jy - m[2]*sc - 3, T(m[0], m[1]), 'svg-small', 'middle'); });
  var cx = jx + (O.rp - O.a)*sc;
  ns('ellipse', {cx:cx, cy:jy, rx:O.a*sc, ry:O.b*sc, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.5}, svg);
  if(Math.abs(Td - 53.5) > 0.6){ var cx0 = jx + (O0.rp - O0.a)*sc; ns('ellipse', {cx:cx0, cy:jy, rx:O0.a*sc, ry:O0.b*sc, fill:'none', stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg); }
  ns('circle', {cx:jx, cy:jy, r:Math.max(3, R_J*sc), fill:'#a8741a'}, svg);
  txt(svg, 12, 20, T('to scale: 1 million km = 44 px · moon orbits for distance only','в масштабе: 1 млн км = 44 пикс. · орбиты спутников — только для расстояний'), 'svg-small');
  if(Math.abs(Td - 53.5) > 0.6) txt(svg, 12, 34, T('dashed: Juno\'s 53.5-day orbit','пунктир: 53,5-суточная орбита «Юноны»'), 'svg-small');
  oGeom = {O:O, jx:jx, jy:jy, sc:sc};
  oDot = ns('rect', {x:jx + O.rp*sc - 4, y:jy - 4, width:8, height:8, fill:'#b5452a'}, svg);
  var tb = timeBelow(O, 2*R_J);
  cells(document.getElementById('orbReadout'), [
    [T('APOJOVE','АПОЙОВИЙ'), fmt(O.ra/1e6, 2) + T(' million km',' млн км') + ' · ' + fmtInt(O.ra/R_J) + ' R<sub>J</sub>'],
    [T('SPEED AT PERIJOVE','СКОРОСТЬ В ПЕРИЙОВИИ'), fmt(O.vp, 2) + T(' km/s',' км/с')],
    [T('SPEED AT APOJOVE','СКОРОСТЬ В АПОЙОВИИ'), fmt(O.va*1000, 0) + T(' m/s',' м/с')],
    [T('Δv FROM 53.5-DAY ORBIT','Δv ОТ 53,5-СУТОЧНОЙ ОРБИТЫ'), Math.abs(dv) < 0.0005 ? '0' + T(' m/s',' м/с') : fmt(Math.abs(dv)*1000, 0) + T(' m/s',' м/с') + (dv > 0 ? T(' (brake)',' (торможение)') : T(' (boost)',' (разгон)'))],
    [T('TIME LOWER THAN 1 R<sub>J</sub>','ВРЕМЯ НИЖЕ 1 R<sub>J</sub>'), fmt(tb/3600, 1) + T(' h per orbit',' ч за виток')],
    [T('CLOSE PASSES PER YEAR','БЛИЗКИХ ПРОЛЁТОВ В ГОД'), fmt(365.25/Td, 1)]
  ]);
  hud1.textContent = fmt(Td, 1) + T(' d',' сут'); hud2.textContent = fmt(O.vp, 1) + T(' km/s',' км/с');
  var st = Math.abs(Td - 53.5) <= 0.6
    ? T('Juno\'s real capture orbit: 8.1 million × 4,200 km. It stayed here for its whole primary mission.','Настоящая орбита захвата «Юноны»: 8,1 млн × 4200 км. На ней аппарат провёл всю основную миссию.')
    : Math.abs(Td - 14) <= 0.6
      ? T('The planned 14-day science orbit. Getting here needed one more main-engine burn of about ','Запланированная 14-суточная научная орбита. Для перехода нужно было ещё раз включить главный двигатель примерно на ') + fmtInt(dv*1000) + T(' m/s — the burn that was cancelled.',' м/с — этот манёвр и отменили.')
      : T('Most of each orbit is spent far out and slow; the close pass lasts only hours. Shorter orbits mean more passes, but each costs propellant to reach.','Большую часть витка аппарат проводит далеко и медленно, а близкий пролёт длится лишь часы. Короткие орбиты дают больше пролётов, но на переход к ним нужно топливо.');
  document.getElementById('orbStatus').innerHTML = st;
}
[oT, oH].forEach(function(el){ el.addEventListener('input', renderOrbit); });
visibleLoop(document.getElementById('orbSvg'), function(dt){
  if(!oDot || !oGeom) return;
  oFrac = (oFrac + dt/(reduced() ? 24 : 9)) % 1;
  var p = keplerPos(oGeom.O, oFrac);
  oDot.setAttribute('x', oGeom.jx + p.x*oGeom.sc - 4); oDot.setAttribute('y', oGeom.jy - p.y*oGeom.sc - 4);
});

/* ============ CH4 — DOPPLER ============ */
var dV = document.getElementById('dV'), dopF = 32;
function doppler(dvms, fGHz){ return 2*fGHz*1e9*dvms/(C_LIGHT*1000); }   // Hz
function hzStr(f){ return f >= 1 ? fmt(f, f >= 10 ? 1 : 2) + T(' Hz',' Гц') : f >= 1e-3 ? fmt(f*1000, f*1000 >= 10 ? 1 : 2) + T(' mHz',' мГц') : fmt(f*1e6, 1) + T(' µHz',' мкГц'); }
function speedStr(v){ return v >= 1e-3 ? fmt(v*1000, v*1000 >= 10 ? 0 : 2) + T(' mm/s',' мм/с') : fmt(v*1e6, v*1e6 >= 10 ? 0 : 2) + T(' µm/s',' мкм/с'); }
function renderDop(){
  var v = Math.pow(10, +dV.value), f = doppler(v, dopF);
  document.getElementById('dVVal').textContent = speedStr(v);
  var svg = document.getElementById('dopSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 230;
  function X(lv){ return L + (lv + 6)/5*(R - L); }
  function Y(f){ return B - (Math.log10(f) + 5)/7*(B - Tp); }          // 1e-5 … 1e2 Hz
  [[1e-5,'10 µHz'],[1e-3,'1 mHz'],[1e-1,'0.1 Hz'],[10,'10 Hz']].forEach(function(t){ ns('line', {x1:L, y1:Y(t[0]), x2:R, y2:Y(t[0]), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(t[0]) + 3, t[1], 'svg-small', 'end'); });
  [[-6,'1 µm/s'],[-5,'10 µm/s'],[-4,'0.1 mm/s'],[-3,'1 mm/s'],[-2,'1 cm/s'],[-1,'10 cm/s']].forEach(function(t){ txt(svg, X(t[0]), B + 14, t[1], 'svg-small', 'middle'); });
  txt(svg, L, 13, T('two-way frequency shift (log)','двусторонний сдвиг частоты (лог.)'), 'svg-small');
  [[8.4,'X','#8a8a82'],[32,'Ka','#0b0b0c']].forEach(function(b){
    var d = 'M' + X(-6).toFixed(1) + ' ' + Y(doppler(1e-6, b[0])).toFixed(1) + 'L' + X(-1).toFixed(1) + ' ' + Y(doppler(0.1, b[0])).toFixed(1);
    ns('path', {d:d, fill:'none', stroke:b[2], 'stroke-width': b[0] === dopF ? 2.5 : 1.2}, svg);
    txt(svg, X(-1.15), Y(doppler(Math.pow(10, -1.15), b[0])) + (b[0] === 32 ? -8 : 14), b[1], 'svg-small', 'end');
  });
  ns('circle', {cx:X(+dV.value), cy:Y(f), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('dopReadout'), [
    [T('FREQUENCY SHIFT','СДВИГ ЧАСТОТЫ'), hzStr(f)],
    [T('ONE EXTRA CYCLE EVERY','ЛИШНИЙ ПЕРИОД КАЖДЫЕ'), (1/f >= 3600 ? fmt(1/f/3600, 1) + T(' h',' ч') : 1/f >= 60 ? fmt(1/f/60, 1) + T(' min',' мин') : fmt(1/f, 2) + T(' s',' с'))],
    [T('WAVELENGTH','ДЛИНА ВОЛНЫ'), fmt(C_LIGHT*1e5/(dopF*1e9)*1e1, 2) + T(' cm',' см')],
    [T('SPEED AS A FRACTION OF c','СКОРОСТЬ В ДОЛЯХ c'), (v/(C_LIGHT*1000)).toExponential(1)]
  ]);
  document.getElementById('dopStatus').innerHTML = T('A higher frequency turns the same tiny speed change into a bigger shift, which is one reason gravity experiments like Juno\'s use Ka band. The signal also has to be clean of noise from the solar wind and Earth\'s atmosphere.','Чем выше частота, тем больший сдвиг даёт то же крошечное изменение скорости, — одна из причин, по которым гравитационные эксперименты вроде «Юноны» используют диапазон Ka. Сигнал ещё нужно очистить от помех солнечного ветра и земной атмосферы.');
}
dV.addEventListener('input', renderDop);
Array.prototype.forEach.call(document.querySelectorAll('#dopBand .btn'), function(btn){
  btn.addEventListener('click', function(){ dopF = +this.getAttribute('data-f'); pressGroup(this.parentNode, this); renderDop(); });
});

/* ============ CH6 — PERIOD HISTORY ============ */
var PERIODS = [
  [53.5, '2016', '2016', T, 'Capture orbit after Jupiter orbit insertion', 'Орбита захвата после выхода на орбиту Юпитера', '4 July 2016', '4 июля 2016'],
  [43, 'Ganymede', 'Ганимед', T, 'Ganymede flyby at 1,049 km', 'Пролёт Ганимеда на 1049 км', '7 June 2021', '7 июня 2021'],
  [38, 'Europa', 'Европа', T, 'Europa flyby at about 360 km', 'Пролёт Европы примерно на 360 км', '29 September 2022', '29 сентября 2022'],
  [33, 'Io', 'Ио', T, 'Io flybys at about 1,500 km', 'Пролёты Ио примерно на 1500 км', '30 December 2023 and 3 February 2024', '30 декабря 2023 и 3 февраля 2024']
];
var perIdx = 3;
function renderPer(){
  var svg = document.getElementById('perSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 26, B = 210, w = (R - L)/4;
  function Y(d){ return B - d/60*(B - Tp); }
  [0,20,40,60].forEach(function(d){ ns('line', {x1:L, y1:Y(d), x2:R, y2:Y(d), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(d) + 3, d, 'svg-small', 'end'); });
  txt(svg, L, 13, T('orbital period, days','период обращения, сутки'), 'svg-small');
  PERIODS.forEach(function(p, i){
    var x = L + i*w + w*0.2;
    ns('rect', {x:x, y:Y(p[0]), width:w*0.6, height:B - Y(p[0]), fill: i === perIdx ? '#b5452a' : '#8a8a82'}, svg);
    txt(svg, x + w*0.3, Y(p[0]) - 5, fmt(p[0], p[0] % 1 ? 1 : 0), 'svg-small', 'middle');
    txt(svg, x + w*0.3, B + 14, T(p[1], p[2]), 'svg-small', 'middle');
  });
  ns('line', {x1:L, y1:Y(14), x2:R, y2:Y(14), stroke:'#2f5aa1', 'stroke-width':1.5, 'stroke-dasharray':'4 3'}, svg);
  ns('line', {x1:R - 150, y1:9, x2:R - 132, y2:9, stroke:'#2f5aa1', 'stroke-width':1.5, 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 128, 13, T('original 14-day plan','исходный план — 14 суток'), 'svg-small');
  var p = PERIODS[perIdx];
  cells(document.getElementById('perReadout'), [
    [T('EVENT','СОБЫТИЕ'), T(p[4], p[5])],
    [T('DATE','ДАТА'), T(p[6], p[7])],
    [T('PERIOD AFTER','ПЕРИОД ПОСЛЕ'), fmt(p[0], p[0] % 1 ? 1 : 0) + T(' days',' сут')],
    [T('ORBITS PER YEAR','ВИТКОВ В ГОД'), fmt(365.25/p[0], 1)]
  ]);
  document.getElementById('perStatus').innerHTML = T('No engine burn: each moon\'s gravity bent the trajectory and took a little orbital energy away, a gravity assist in reverse.','Без включения двигателя: тяготение каждого спутника изгибало траекторию и отнимало немного орбитальной энергии — гравитационный манёвр наоборот.');
}
Array.prototype.forEach.call(document.querySelectorAll('#perStep .btn'), function(btn){
  btn.addEventListener('click', function(){ perIdx = +this.getAttribute('data-i'); pressGroup(this.parentNode, this); renderPer(); });
});

/* ============ CH7 — TIMELINE ============ */
var TIMELINE = [
  ['2011', '<b>5 August:</b> Juno launches on an Atlas V 551.', '<b>5 августа:</b> старт «Юноны» на «Атласе-5» 551.'],
  ['2013', '<b>October:</b> Earth gravity assist.', '<b>Октябрь:</b> гравитационный манёвр у Земли.'],
  ['2016', '<b>13 January:</b> solar-power distance record, 793 million km. <b>4 July:</b> 35-minute burn, capture into a 53.5-day orbit. <b>27 August:</b> first science perijove at 4,200 km. <b>October:</b> helium valve problem.', '<b>13 января:</b> рекорд дальности для солнечной энергии — 793 млн км. <b>4 июля:</b> 35-минутное включение, захват на 53,5-суточную орбиту. <b>27 августа:</b> первый научный перийовий на 4200 км. <b>Октябрь:</b> неполадка клапанов гелия.'],
  ['2017', '<b>February:</b> NASA decides to stay in the 53-day orbit. First results: polar chaos, deep ammonia plume, a more precise gravity field.', '<b>Февраль:</b> NASA решает остаться на 53-суточной орбите. Первые результаты: хаос у полюсов, глубокий аммиачный поток, более точное гравитационное поле.'],
  ['2018', 'Asymmetric gravity field; jets 3,000 km deep; polar cyclone clusters; maps of the lopsided magnetic field.', 'Асимметричное гравитационное поле; струйные течения на 3000 км вглубь; скопления полярных циклонов; карты «кривого» магнитного поля.'],
  ['2021', 'Mission extended. <b>7 June:</b> Ganymede flyby; period 53 → 43 days.', 'Миссия продлена. <b>7 июня:</b> пролёт Ганимеда; период 53 → 43 суток.'],
  ['2022', '<b>29 September:</b> Europa flyby at ~360 km; period → 38 days.', '<b>29 сентября:</b> пролёт Европы на ~360 км; период → 38 суток.'],
  ['2023–24', '<b>30 December, 3 February:</b> Io flybys at ~1,500 km; period → 33 days.', '<b>30 декабря, 3 февраля:</b> пролёты Ио на ~1500 км; период → 33 суток.'],
  ['2026', 'Europa ice shell ~29 km thick (published December 2025); 81st perijove scheduled for 25 February; ten years in orbit on 4 July.', 'Толщина ледяной оболочки Европы ~29 км (опубликовано в декабре 2025); 81-й перийовий намечен на 25 февраля; 4 июля — десять лет на орбите.']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Juno: 3,625 kg, launch 5 August 2011, goals, 450 W from three arrays, the 793 million km solar record, the 35 min 1 s insertion burn, the 8.1 million × 4,200 km 53.5-day capture orbit, the helium check valves, the February 2017 decision, 57.8 km/s at perijove.', ru:'«Юнона»: 3625 кг, старт 5 августа 2011, цели, 450 Вт от трёх батарей, рекорд 793 млн км, включение на 35 мин 1 с, орбита захвата 8,1 млн × 4200 км с периодом 53,5 сут, обратные клапаны гелия, решение февраля 2017, 57,8 км/с в перийовии.'}},
  {title:'NASA Science, Juno mission pages', url:'https://science.nasa.gov/mission/juno/', note:{en:'4 % sunlight, 9 m arrays, 180 kg titanium vault, 2 rpm spin, pole-to-pole orbit between the belts and the planet, original end-of-mission plan, Ganymede (1,049 km), Europa and Io flybys and the 53 → 43 → 38 → 33-day periods, end by burning up in Jupiter.', ru:'4 % солнечного света, батареи по 9 м, титановый сейф 180 кг, вращение 2 об/мин, орбита от полюса к полюсу между поясами и планетой, исходный план завершения, пролёты Ганимеда (1049 км), Европы и Ио и периоды 53 → 43 → 38 → 33 сут, завершение сгоранием в Юпитере.'}},
  {title:'S. J. Bolton et al. (2017), “Jupiter\'s interior and deep atmosphere: The initial pole-to-pole passes with the Juno spacecraft”, Science 356, 821–825', url:'https://doi.org/10.1126/science.aal2108', note:{en:'Arrival 4 July 2016; first close pass 27 August 2016; chaotic poles; ammonia-rich plume below 100 bar; gravity an order of magnitude more precise; magnetic field.', ru:'Прибытие 4 июля 2016; первый близкий пролёт 27 августа 2016; хаотичные полюса; богатый аммиаком поток глубже 100 бар; гравитационное поле на порядок точнее; магнитное поле.'}},
  {title:'L. Iess et al. (2018), “Measurement of Jupiter\'s asymmetric gravity field”, Nature 555, 220–222', url:'https://doi.org/10.1038/nature25776', note:{en:'Even and odd gravity harmonics from Doppler tracking; north–south asymmetry as a signature of flows.', ru:'Чётные и нечётные гравитационные гармоники по доплеровским измерениям; асимметрия север — юг как признак течений.'}},
  {title:'Y. Kaspi et al. (2018), “Jupiter\'s atmospheric jet streams extend thousands of kilometres deep”, Nature 555, 223–226', url:'https://doi.org/10.1038/nature25793', note:{en:'Jets extend to about 3,000 km; the dynamical atmosphere is about 1 % of Jupiter\'s mass.', ru:'Струйные течения уходят примерно на 3000 км; динамическая атмосфера — около 1 % массы Юпитера.'}},
  {title:'S. M. Wahl et al. (2017), “Comparing Jupiter interior structure models to Juno gravity measurements and the role of a dilute core”, Geophysical Research Letters 44, 4649–4659', url:'https://doi.org/10.1002/2017GL073160', note:{en:'A dilute core extending through a significant fraction of the radius; 7–25 Earth masses of heavy elements.', ru:'Размытое ядро, занимающее значительную часть радиуса; 7–25 масс Земли тяжёлых элементов.'}},
  {title:'A. Adriani et al. (2018), “Clusters of cyclones encircling Jupiter\'s poles”, Nature 555, 216–219', url:'https://doi.org/10.1038/nature25491', note:{en:'Eight circumpolar cyclones around a polar cyclone in the north, five in the south; a configuration without precedent.', ru:'Восемь околополярных циклонов вокруг полярного на севере, пять на юге; конфигурация без прецедентов.'}},
  {title:'K. M. Moore et al. (2018), “A complex dynamo inferred from the hemispheric dichotomy of Jupiter\'s magnetic field”, Nature 561, 76–78', url:'https://doi.org/10.1038/s41586-018-0468-5', note:{en:'Most flux emerges in a narrow northern band and returns through an intense patch near the equator; the southern field is mainly dipolar.', ru:'Основной поток выходит узкой северной полосой и возвращается через мощное пятно у экватора; поле южного полушария в основном дипольное.'}},
  {title:'NASA JPL (2026), “NASA\'s Juno Measures Thickness of Europa\'s Ice Shell”', url:'https://www.nasa.gov/missions/juno/nasas-juno-measures-thickness-of-europas-ice-shell/', note:{en:'Europa flyby on 29 September 2022 at about 360 km; ice shell about 29 km thick in the observed region (Nature Astronomy, December 2025); 81st Jupiter flyby on 25 February 2026; Europa Clipper arrives 2030, Juice 2031.', ru:'Пролёт Европы 29 сентября 2022 примерно на 360 км; толщина ледяной оболочки около 29 км в наблюдавшемся районе (Nature Astronomy, декабрь 2025); 81-й пролёт Юпитера 25 февраля 2026; Europa Clipper прибудет в 2030, Juice — в 2031.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderOrbit();
  renderDop();
  renderPer();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__polar = {orbit:orbit, timeBelow:timeBelow, keplerPos:keplerPos, doppler:doppler, R_J:R_J};
