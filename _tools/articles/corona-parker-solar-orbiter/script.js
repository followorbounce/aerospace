/* ============ CONSTANTS [1][2] ============ */
var MU_S = 132712e6, AU = 149597870.7, R_S = 695700, S_EARTH = 1361, SIGMA = 5.670374e-8, V_EARTH = 29.78;
/* log slider helpers */
function logMap(v, a, b){ return a*Math.pow(b/a, v); }
function logInv(x, a, b){ return Math.log(x/a)/Math.log(b/a); }

/* ============ CH1 — Δv TO LOWER PERIHELION ============ */
function dvPerihelion(rpKm){
  var rE = AU, vE = Math.sqrt(MU_S/rE), vAp = Math.sqrt(MU_S*2*rpKm/(rE*(rE + rpKm)));
  return {vE:vE, vAp:vAp, dv:vE - vAp};
}
var V_ESC_1AU = Math.sqrt(2*MU_S/AU), DV_ESCAPE = V_ESC_1AU - Math.sqrt(MU_S/AU);
var dvR = document.getElementById('dvR');
function rpFromSlider(){ return logMap(+dvR.value, 1.0, 215); }      // in solar radii (centre distance), 1 … 215 (≈1 AU)
function renderDv(){
  var rRs = rpFromSlider(), D = dvPerihelion(rRs*R_S);
  document.getElementById('dvRVal').textContent = fmt(rRs, rRs < 10 ? 2 : 1) + T(' R☉',' R☉') + ' · ' + fmt(rRs*R_S/AU, 3) + T(' AU',' а.е.');
  var bars = [
    [T('Hohmann to Mars (departure)','Гоман к Марсу (старт)'), dvPerihelionOut(1.524*AU)],
    [T('Escape the Solar System','Покинуть Солнечную систему'), DV_ESCAPE],
    [T('Mercury\'s distance','Расстояние Меркурия'), dvPerihelion(0.387*AU).dv],
    [T('Parker 2024 (9.86 R☉)','Parker 2024 (9,86 R☉)'), dvPerihelion(9.86*R_S).dv],
    [T('Your target','Ваша цель'), D.dv]
  ];
  var svg = document.getElementById('dvSvg'); svg.innerHTML = '';
  var L = 210, R = 460, Tp = 24, rowH = 52, vMax = 32;
  function X(v){ return L + v/vMax*(R - L); }
  [0,10,20,30].forEach(function(v){ ns('line', {x1:X(v), y1:Tp - 6, x2:X(v), y2:Tp + rowH*bars.length, stroke:'#e4e4de'}, svg); txt(svg, X(v), Tp + rowH*bars.length + 14, v + T(' km/s',' км/с'), 'svg-small', 'middle'); });
  bars.forEach(function(b, i){
    var y = Tp + i*rowH, last = i === bars.length - 1;
    txt(svg, L - 10, y + 18, b[0], 'svg-label', 'end');
    ns('rect', {x:L, y:y + 6, width:Math.max(1, X(b[1]) - L), height:18, fill: last ? '#b5452a' : '#0b0b0c'}, svg);
    txt(svg, X(b[1]) + 6, y + 19, fmt(b[1], 1), 'svg-small');
  });
  ns('line', {x1:X(V_EARTH), y1:Tp - 6, x2:X(V_EARTH), y2:Tp + rowH*bars.length, stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, X(V_EARTH) - 4, Tp - 10, T('Earth\'s 29.78 km/s','29,78 км/с Земли'), 'svg-small', 'end');
  cells(document.getElementById('dvReadout'), [
    [T('EARTH\'S ORBITAL SPEED','ОРБИТАЛЬНАЯ СКОРОСТЬ ЗЕМЛИ'), fmt(D.vE, 2) + T(' km/s',' км/с')],
    [T('SPEED LEFT AT 1 AU','ОСТАВШАЯСЯ СКОРОСТЬ НА 1 а.е.'), fmt(D.vAp, 2) + T(' km/s',' км/с')],
    [T('Δv NEEDED','НУЖНОЕ Δv'), fmt(D.dv, 2) + T(' km/s',' км/с')],
    [T('VERSUS ESCAPING','ОТНОСИТЕЛЬНО УХОДА ИЗ СИСТЕМЫ'), '×' + fmt(D.dv/DV_ESCAPE, 2)]
  ]);
  document.getElementById('dvStatus').innerHTML = D.dv > DV_ESCAPE
    ? T('Diving this close costs <b>more</b> than leaving the Solar System altogether.','Нырнуть так близко стоит <b>дороже</b>, чем вовсе покинуть Солнечную систему.')
    : T('Still cheaper than escaping the Solar System — the Sun\'s gravity does most of the work once the orbit is lowered.','Пока дешевле, чем уйти из Солнечной системы: стоит опустить орбиту — и основную работу делает тяготение Солнца.');
}
function dvPerihelionOut(raKm){ var rE = AU, vE = Math.sqrt(MU_S/rE), vP = Math.sqrt(MU_S*2*raKm/(rE*(rE + raKm))); return vP - vE; }
dvR.addEventListener('input', renderDv);

/* ============ CH4 — HEAT SHIELD ============ */
var hR = document.getElementById('hR'), hAE = document.getElementById('hAE');
function shieldT(rKm, ae){ var S = S_EARTH*Math.pow(AU/rKm, 2); return {S:S, T:Math.pow(ae*S/SIGMA, 0.25)}; }
function renderHeat(){
  var rRs = logMap(+hR.value, 5, 215), ae = +hAE.value, H = shieldT(rRs*R_S, ae);
  document.getElementById('hRVal').textContent = fmt(rRs, 1) + T(' R☉',' R☉') + ' · ' + fmt(rRs*R_S/AU, 3) + T(' AU',' а.е.');
  document.getElementById('hAEVal').textContent = fmt(ae, 2);
  var svg = document.getElementById('heatSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 20, B = 280, tMax = 2200;
  function X(rs){ return L + logInv(rs, 5, 215)*(R - L); }
  function Y(c){ return B - c/tMax*(B - Tp); }
  [0,500,1000,1500,2000].forEach(function(c){ ns('line', {x1:L, y1:Y(c), x2:R, y2:Y(c), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(c) + 3, c, 'svg-small', 'end'); });
  [5,10,20,50,100,215].forEach(function(rs){ txt(svg, X(rs), B + 14, rs, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('distance, solar radii (log)','расстояние, солнечные радиусы (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('front-face temperature, °C','температура лицевой стороны, °C'), 'svg-small');
  ns('line', {x1:L, y1:Y(1377), x2:R, y2:Y(1377), stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(1377) - 5, T('Parker shield rating ~1,377 °C [4]','предел щита Parker ~1377 °C [4]'), 'svg-small', 'end');
  [[9.86, T('Parker 2024','Parker 2024')], [0.29*AU/R_S, 'Helios 2'], [0.387*AU/R_S, T('Mercury','Меркурий')], [AU/R_S, T('Earth','Земля')]].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) + 3, Tp + 10, m[1], 'svg-small'); });
  var d = '';
  for(var v = 0; v <= 1.0001; v += 0.01){ var rs = logMap(v, 5, 215); d += (v === 0 ? 'M' : 'L') + X(rs).toFixed(1) + ' ' + Y(shieldT(rs*R_S, ae).T - 273.15).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(rRs), cy:Y(H.T - 273.15), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('heatReadout'), [
    [T('SUNLIGHT','СОЛНЕЧНЫЙ ПОТОК'), fmtInt(H.S/1000) + T(' kW/m²',' кВт/м²')],
    [T('TIMES EARTH\'S','РАЗ БОЛЬШЕ ЗЕМНОГО'), '×' + fmtInt(H.S/S_EARTH)],
    [T('FRONT-FACE TEMPERATURE','ТЕМПЕРАТУРА ЛИЦЕВОЙ СТОРОНЫ'), fmtInt(H.T - 273.15) + ' °C'],
    [T('IN KELVIN','В КЕЛЬВИНАХ'), fmtInt(H.T) + ' K']
  ]);
  hud1.textContent = fmt(rRs, 1) + ' R☉';
  document.getElementById('heatStatus').innerHTML = H.T - 273.15 > 1377
    ? T('<b>Above the shield\'s rating.</b> Lower α/ε (a whiter, more emissive surface) or stay farther out.','<b>Выше предела щита.</b> Уменьшите α/ε (более белая и сильнее излучающая поверхность) или держитесь дальше.')
    : T('Within the rating. At 9.86 R☉ a surface with α/ε ≈ 0.6 settles near 1,350 °C in this model — close to the shield\'s design figure.','В пределах допуска. На 9,86 R☉ поверхность с α/ε ≈ 0,6 в этой модели нагревается примерно до 1350 °C — близко к расчётному значению щита.');
}
[hR, hAE].forEach(function(el){ el.addEventListener('input', renderHeat); });

/* ============ CH5 — ORBIT SPEED ============ */
var ORB_PRESETS = [
  {k:'psp', en:'PARKER FINAL', ru:'PARKER, ФИНАЛ', rp:9.86, ra:0.728},
  {k:'psp1', en:'PARKER FIRST (~35 R☉)', ru:'PARKER, ПЕРВЫЙ (~35 R☉)', rp:35.7, ra:1.0},
  {k:'he2', en:'HELIOS 2', ru:'«ГЕЛИОС-2»', rp:0.29*AU/R_S, ra:0.98},
  {k:'so', en:'SOLAR ORBITER (~0.28–0.9 AU)', ru:'SOLAR ORBITER (~0,28–0,9 а.е.)', rp:0.28*AU/R_S, ra:0.9}
];
var oP = document.getElementById('oP'), oA = document.getElementById('oA'), orbPreset = 'psp', orbM = 0, orbDot = null, orbGeom = null;
function rpRs(){ return logMap(+oP.value, 9.86, 70); }
function setRpRs(rs){ oP.value = logInv(Math.min(70, Math.max(9.86, rs)), 9.86, 70); }
function solarOrbit(rpKm, raKm){
  var a = (rpKm + raKm)/2, e = (raKm - rpKm)/(raKm + rpKm);
  return {a:a, e:e, T:2*Math.PI*Math.sqrt(a*a*a/MU_S), vp:Math.sqrt(MU_S*(2/rpKm - 1/a)), va:Math.sqrt(MU_S*(2/raKm - 1/a))};
}
function renderOrbPresets(){
  var w = document.getElementById('orbPresets'); w.innerHTML = '';
  ORB_PRESETS.forEach(function(p){
    var b = document.createElement('button'); b.className = 'btn' + (orbPreset === p.k ? ' active' : ''); b.setAttribute('aria-pressed', orbPreset === p.k ? 'true' : 'false');
    b.textContent = lang === 'en' ? p.en : p.ru;
    b.addEventListener('click', function(){ orbPreset = p.k; setRpRs(p.rp); oA.value = p.ra; renderOrbPresets(); renderOrb(); });
    w.appendChild(b);
  });
}
function renderOrb(){
  var rp = rpRs()*R_S, ra = Math.max(+oA.value*AU, rp*1.01), O = solarOrbit(rp, ra);
  document.getElementById('oPVal').textContent = fmt(rp/R_S, 2) + ' R☉';
  document.getElementById('oAVal').textContent = fmt(ra/AU, 3) + T(' AU',' а.е.');
  var svg = document.getElementById('orbSvg'); svg.innerHTML = '';
  var sc = 160/AU, cx = 300, cy = 180;
  ns('circle', {cx:cx, cy:cy, r:AU*sc, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'2 4'}, svg); txt(svg, cx + AU*sc - 4, cy - 4, T('Earth','Земля'), 'svg-small', 'end');
  ns('circle', {cx:cx, cy:cy, r:0.723*AU*sc, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'2 4'}, svg); txt(svg, cx, cy - 0.723*AU*sc - 4, T('Venus','Венера'), 'svg-small', 'middle');
  ns('circle', {cx:cx, cy:cy, r:Math.max(2.5, R_S*sc), fill:'#e0a020'}, svg);
  var b = O.a*Math.sqrt(1 - O.e*O.e);
  ns('ellipse', {cx:cx - O.a*O.e*sc, cy:cy, rx:O.a*sc, ry:b*sc, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.4}, svg);
  orbGeom = {cx:cx, cy:cy, sc:sc, O:O};
  orbDot = ns('circle', {cx:cx + rp*sc, cy:cy, r:5, fill:'#b5452a', stroke:'#fff', 'stroke-width':1.5}, svg);
  txt(svg, 12, 20, T('scale: Earth\'s orbit = 1 AU','масштаб: орбита Земли = 1 а.е.'), 'svg-small');
  cells(document.getElementById('orbReadout'), [
    [T('SPEED AT PERIHELION','СКОРОСТЬ В ПЕРИГЕЛИИ'), fmt(O.vp, 1) + T(' km/s',' км/с')],
    [T('IN KM/H','В КМ/Ч'), fmtInt(O.vp*3600)],
    [T('SPEED AT APHELION','СКОРОСТЬ В АФЕЛИИ'), fmt(O.va, 1) + T(' km/s',' км/с')],
    [T('ORBITAL PERIOD','ПЕРИОД ОБРАЩЕНИЯ'), fmt(O.T/86400, 1) + T(' days',' сут')]
  ]);
  hud2.textContent = fmt(O.vp, 1) + T(' km/s',' км/с');
  document.getElementById('orbStatus').innerHTML = orbPreset === 'psp'
    ? T('Model: <b>','Модель: <b>') + fmt(O.vp, 1) + T(' km/s</b> at perihelion. Measured on 24 December 2024: <b>192.22 km/s</b> [8].',' км/с</b> в перигелии. Измерено 24 декабря 2024 года: <b>192,22 км/с</b> [8].')
    : T('Perihelion speed ÷ aphelion speed = aphelion distance ÷ perihelion distance (Kepler\'s second law).','Скорость в перигелии ÷ скорость в афелии = расстояние афелия ÷ расстояние перигелия (второй закон Кеплера).');
}
function keplerE(M, e){ var E = e > 0.8 ? Math.PI : M; for(var i = 0; i < 30; i++) E -= (E - e*Math.sin(E) - M)/(1 - e*Math.cos(E)); return E; }
oP.addEventListener('input', function(){ orbPreset = ''; renderOrbPresets(); renderOrb(); });
oA.addEventListener('input', function(){ orbPreset = ''; renderOrbPresets(); renderOrb(); });
visibleLoop(document.getElementById('orbSvg'), function(dt){
  if(!orbDot || !orbGeom) return;
  var g = orbGeom, O = g.O;
  orbM = (orbM + dt*2*Math.PI/(reduced() ? 24 : 8)) % (2*Math.PI);
  var E = keplerE(orbM, O.e), r = O.a*(1 - O.e*Math.cos(E));
  var nu = 2*Math.atan2(Math.sqrt(1 + O.e)*Math.sin(E/2), Math.sqrt(1 - O.e)*Math.cos(E/2));
  orbDot.setAttribute('cx', g.cx + r*Math.cos(nu)*g.sc); orbDot.setAttribute('cy', g.cy - r*Math.sin(nu)*g.sc);
});

/* ============ CH7 — TIMELINE ============ */
var TIMELINE = [
  ['1958', 'Eugene Parker predicts the solar wind.', 'Юджин Паркер предсказывает солнечный ветер.'],
  ['1975', '<b>15 March:</b> Helios 1 passes 46 million km from the Sun.', '<b>15 марта:</b> «Гелиос-1» проходит в 46 млн км от Солнца.'],
  ['1976', '<b>17 April:</b> Helios 2 reaches 0.29 AU, a record for 42 years.', '<b>17 апреля:</b> «Гелиос-2» достигает 0,29 а.е. — рекорд на 42 года.'],
  ['2018', '<b>12 August:</b> Parker Solar Probe launches; first perihelion in November at about 35 solar radii.', '<b>12 августа:</b> старт Parker Solar Probe; первый перигелий в ноябре — около 35 солнечных радиусов.'],
  ['2020', '<b>February:</b> Solar Orbiter launches.', '<b>Февраль:</b> старт Solar Orbiter.'],
  ['2021', '<b>28 April:</b> Parker crosses the Alfvén critical surface at 18.8 solar radii — the first spacecraft inside the corona.', '<b>28 апреля:</b> Parker пересекает альвеновскую поверхность на 18,8 солнечного радиуса — первый аппарат внутри короны.'],
  ['2024', '<b>6 November:</b> Parker\'s seventh and last Venus flyby. <b>24 December:</b> closest approach, 6.17 million km at 192.2 km/s.', '<b>6 ноября:</b> седьмой и последний пролёт Венеры. <b>24 декабря:</b> наибольшее сближение, 6,17 млн км при 192,2 км/с.'],
  ['2025', '<b>March:</b> Solar Orbiter reaches 17° and photographs the Sun\'s south pole (released in June).', '<b>Март:</b> Solar Orbiter поднимается на 17° и фотографирует южный полюс Солнца (опубликовано в июне).'],
  ['2026–29', 'Venus flybys tilt Solar Orbiter to 24° (from 24 December 2026) and 33° (from June 2029).', 'Пролёты Венеры наклоняют Solar Orbiter до 24° (с 24 декабря 2026) и 33° (с июня 2029).']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA, Sun Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note:{en:'GM = 132,712 × 10⁶ km³/s², volumetric mean radius 695,700 km.', ru:'GM = 132 712 × 10⁶ км³/с², средний радиус 695 700 км.'}},
  {title:'NASA, Earth Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'Solar irradiance 1,361 W/m²; mean orbital velocity 29.78 km/s.', ru:'Солнечная постоянная 1361 Вт/м²; средняя орбитальная скорость 29,78 км/с.'}},
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Helios 1 (46 million km, 238,000 km/h, 15 March 1975) and Helios 2 (0.29 AU, 17 April 1976).', ru:'«Гелиос-1» (46 млн км, 238 000 км/ч, 15 марта 1975) и «Гелиос-2» (0,29 а.е., 17 апреля 1976).'}},
  {title:'NASA Science, Parker Solar Probe mission page', url:'https://science.nasa.gov/mission/parker-solar-probe/', note:{en:'Launch 12 August 2018 on a Delta IV Heavy; 685 kg; 24 orbits in seven years; 11.43 cm carbon-composite shield rated to nearly 1,377 °C; about 700,000 km/h.', ru:'Старт 12 августа 2018 на «Дельте IV Хэви»; 685 кг; 24 витка за семь лет; углеродный композитный щит 11,43 см с пределом почти 1377 °C; около 700 000 км/ч.'}},
  {title:'NASA Scientific Visualization Studio, “Parker Solar Probe Orbit From August 2018 – March 2019”', url:'https://svs.gsfc.nasa.gov/12998', note:{en:'Venus gravity assists; first perihelion about 35 solar radii; the final three perihelia (December 2024 – June 2025) under 10 solar radii.', ru:'Гравитационные манёвры у Венеры; первый перигелий около 35 солнечных радиусов; последние три перигелия (декабрь 2024 – июнь 2025) — менее 10 солнечных радиусов.'}},
  {title:'NASA (2021), “NASA Enters the Solar Atmosphere for the First Time, Bringing New Discoveries”', url:'https://www.nasa.gov/solar-system/nasa-enters-the-solar-atmosphere-for-the-first-time-bringing-new-discoveries/', note:{en:'Crossing of the Alfvén critical surface on 28 April 2021 at 18.8 solar radii during the eighth perihelion.', ru:'Пересечение альвеновской критической поверхности 28 апреля 2021 года на 18,8 солнечного радиуса во время восьмого перигелия.'}},
  {title:'NASA Scientific Visualization Studio, “Parker Solar Probe Towards its Ultimate Perihelion”', url:'https://svs.gsfc.nasa.gov/5428', note:{en:'From the last Venus flyby on 6 November 2024 to the closest perihelion on 24 December 2024.', ru:'От последнего пролёта Венеры 6 ноября 2024 года до наибольшего сближения 24 декабря 2024 года.'}},
  {title:'Guinness World Records, “Closest approach to the Sun by a spacecraft”', url:'https://www.guinnessworldrecords.com/world-records/sun-closest-approach-by-spacecraft', note:{en:'6,167,590 km from the surface at 11:53:48 UTC on 24 December 2024; 192.22 km/s relative to the Sun.', ru:'6 167 590 км от поверхности в 11:53:48 UTC 24 декабря 2024 года; 192,22 км/с относительно Солнца.'}},
  {title:'ESA, Solar Orbiter factsheet', url:'https://www.esa.int/Science_Exploration/Space_Science/Solar_Orbiter/Solar_Orbiter_factsheet', note:{en:'1,800 kg, launched February 2020 on an Atlas V; ten instruments; close approach every six months, from inside Mercury\'s orbit to near Earth\'s; inclination 24° (nominal) to 33° (extended).', ru:'1800 кг, старт в феврале 2020 на «Атласе V»; десять приборов; сближение каждые полгода, от области внутри орбиты Меркурия почти до земной; наклон 24° (основная миссия) — 33° (продлённая).'}},
  {title:'D. Müller et al. (2020), “The Solar Orbiter mission. Science overview”, Astronomy & Astrophysics 642', url:'https://doi.org/10.1051/0004-6361/202038467', note:{en:'Mission design, remote-sensing and in-situ payload, and the science goals including the polar views.', ru:'Схема миссии, приборы дистанционного зондирования и прямых измерений, научные цели, включая наблюдения полюсов.'}},
  {title:'ESA (2025), “Solar Orbiter gets world-first views of the Sun\'s poles”', url:'https://www.esa.int/Science_Exploration/Space_Science/Solar_Orbiter/Solar_Orbiter_gets_world-first_views_of_the_Sun_s_poles', note:{en:'South-pole images from 16–17 March 2025 at 15° and 23 March at 17°; tilt to 24° from 24 December 2026 and 33° from 10 June 2029.', ru:'Снимки южного полюса 16–17 марта 2025 года под углом 15° и 23 марта под углом 17°; наклон 24° с 24 декабря 2026 и 33° с 10 июня 2029.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderDv();
  renderHeat();
  if(orbPreset === 'psp' && +oP.value === 0) setRpRs(9.86);
  renderOrbPresets(); renderOrb();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__corona = {dvPerihelion:dvPerihelion, DV_ESCAPE:DV_ESCAPE, shieldT:shieldT, solarOrbit:solarOrbit, R_S:R_S, AU:AU, dvPerihelionOut:dvPerihelionOut};
