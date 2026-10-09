/* ============ CONSTANTS: 67P (Pätzold et al. 2016 [2]) ============ */
var G_N = 6.674e-11, M_67P = 9.982e12, RHO_67P = 533;
var GM_67P = G_N*M_67P;                                           // m³/s²
var R_EQ = Math.pow(3*M_67P/(4*Math.PI*RHO_67P), 1/3);            // m, equal-volume sphere
function circ(rm){ var v = Math.sqrt(GM_67P/rm); return {v:v, T:2*Math.PI*rm/v, vesc:Math.sqrt(2*GM_67P/rm), g:GM_67P/(rm*rm)}; }

/* ============ CH2 — SOLAR POWER ============ */
var pR = document.getElementById('pR'), pNeed = document.getElementById('pNeed');
function powerFrac(au){ return 1/(au*au); }
function renderPower(){
  var r = +pR.value, need = +pNeed.value, f = powerFrac(r), rMax = 1/Math.sqrt(need);
  document.getElementById('pRVal').textContent = fmt(r, 2) + T(' AU',' а.е.');
  document.getElementById('pNeedVal').textContent = fmt(need*100, 1) + ' %';
  var svg = document.getElementById('powerSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 20, B = 250;
  function X(a){ return L + (a - 0.8)/(5.5 - 0.8)*(R - L); }
  function Y(p){ return B - Math.log10(Math.max(p, 0.01) / 0.01)/Math.log10(1.6/0.01)*(B - Tp); }
  [0.01,0.03,0.1,0.3,1].forEach(function(p){ ns('line', {x1:L, y1:Y(p), x2:R, y2:Y(p), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(p) + 3, (p*100) + '%', 'svg-small', 'end'); });
  [1,2,3,4,5].forEach(function(a){ txt(svg, X(a), B + 14, a + T(' AU',' а.е.'), 'svg-small', 'middle'); });
  txt(svg, L, 13, T('solar power, % of output at 1 AU (log)','солнечная мощность, % от выработки на 1 а.е. (лог.)'), 'svg-small');
  [[1, T('Earth','Земля')], [1.52, T('Mars','Марс')], [5.2, T('Jupiter','Юпитер')]].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) + 3, Tp + 10, m[1], 'svg-small'); });
  ns('rect', {x:Math.min(R, X(Math.max(0.8, rMax))), y:Tp, width:Math.max(0, R - X(Math.max(0.8, rMax))), height:B - Tp, fill:'#2f5aa1', opacity:0.08}, svg);
  if(rMax < 5.5) txt(svg, (X(rMax) + R)/2, B - 8, T('must hibernate','нужна спячка'), 'svg-small', 'middle');
  ns('line', {x1:L, y1:Y(need), x2:R, y2:Y(need), stroke:'#2f5aa1', 'stroke-dasharray':'5 3'}, svg);
  var d = '';
  for(var a = 0.8; a <= 5.5001; a += 0.05) d += (a === 0.8 ? 'M' : 'L') + X(a).toFixed(1) + ' ' + Y(powerFrac(a)).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(r), cy:Y(f), r:5, fill: f >= need ? '#0b0b0c' : '#b5452a'}, svg);
  cells(document.getElementById('powerReadout'), [
    [T('POWER AVAILABLE','ДОСТУПНАЯ МОЩНОСТЬ'), fmt(f*100, 1) + T(' % of 1 AU',' % от 1 а.е.')],
    [T('FARTHEST DISTANCE AWAKE','МАКС. РАССТОЯНИЕ БЕЗ СПЯЧКИ'), fmt(rMax, 2) + T(' AU',' а.е.')]
  ]);
  hud1.textContent = fmt(r, 2) + T(' AU',' а.е.');
  document.getElementById('powerStatus').innerHTML = f >= need
    ? T('Enough sunlight to keep working.','Солнечного света достаточно для работы.')
    : T('<b>Not enough power.</b> Switch off everything but the heaters and the clock, and sleep until the Sun is close again — as Rosetta did from June 2011 to January 2014.','<b>Мощности не хватает.</b> Отключить всё, кроме нагревателей и часов, и спать, пока Солнце снова не приблизится, — как «Розетта» с июня 2011 по январь 2014 года.');
}
[pR, pNeed].forEach(function(el){ el.addEventListener('input', renderPower); });

/* ============ CH3 — ORBIT AROUND 67P ============ */
var cR = document.getElementById('cR'), cAng = 0, cDot = null, cGeom = null;
function renderCOrb(){
  var rkm = +cR.value, C = circ(rkm*1000);
  document.getElementById('cRVal').textContent = fmt(rkm, 1) + T(' km',' км');
  var svg = document.getElementById('cOrbSvg'); svg.innerHTML = '';
  var cx = 240, cy = 175, sc = 140/100;      // 100 km → 140 px
  var ro = rkm*sc;
  // two-lobed nucleus to scale (about 4.1 km and 2.6 km lobes)
  ns('ellipse', {cx:cx - 1.0*sc, cy:cy, rx:2.05*sc, ry:1.6*sc, fill:'#6f6c64'}, svg);
  ns('ellipse', {cx:cx + 2.0*sc, cy:cy - 0.6*sc, rx:1.3*sc, ry:1.1*sc, fill:'#6f6c64'}, svg);
  ns('circle', {cx:cx, cy:cy, r:ro, fill:'none', stroke:'#0b0b0c', 'stroke-dasharray':'4 3'}, svg);
  cGeom = {cx:cx, cy:cy, ro:ro, T:C.T};
  cDot = ns('rect', {x:cx + ro - 4, y:cy - 4, width:8, height:8, fill:'#b5452a'}, svg);
  txt(svg, 12, 20, T('to scale: 100 km = 140 px · nucleus ≈ 4 km','в масштабе: 100 км = 140 пикс. · ядро ≈ 4 км'), 'svg-small');
  cells(document.getElementById('cOrbReadout'), [
    [T('ORBITAL SPEED','ОРБИТАЛЬНАЯ СКОРОСТЬ'), fmt(C.v*100, 1) + T(' cm/s',' см/с')],
    [T('IN KM/H','В КМ/Ч'), fmt(C.v*3.6, 2)],
    [T('ONE LAP','ОДИН ВИТОК'), fmt(C.T/86400, 1) + T(' days',' сут')],
    [T('ESCAPE SPEED HERE','СКОРОСТЬ УБЕГАНИЯ ЗДЕСЬ'), fmt(C.vesc*100, 1) + T(' cm/s',' см/с')]
  ]);
  hud2.textContent = fmt(C.v*100, 1) + T(' cm/s',' см/с');
  document.getElementById('cOrbStatus').innerHTML = T('A walking pace is about 140 cm/s. Here a single burn of a few cm/s changes the orbit completely — and the comet\'s own gas jets push harder than that.','Скорость пешехода — около 140 см/с. Здесь импульс в несколько сантиметров в секунду полностью меняет орбиту, а газовые струи самой кометы толкают сильнее.');
}
cR.addEventListener('input', renderCOrb);
visibleLoop(document.getElementById('cOrbSvg'), function(dt){
  if(!cDot || !cGeom) return;
  cAng += dt*2*Math.PI/(reduced() ? 20 : 7);
  cDot.setAttribute('x', cGeom.cx + cGeom.ro*Math.cos(cAng) - 4); cDot.setAttribute('y', cGeom.cy - cGeom.ro*Math.sin(cAng) - 4);
});

/* ============ CH4 — BOUNCE ============ */
var bV = document.getElementById('bV');
function bounce(v){ var S = circ(R_EQ), g = S.g; var esc = v >= S.vesc; return {g:g, vesc:S.vesc, esc:esc, h: esc ? Infinity : (v*v/(2*g))/(1 - v*v/(S.vesc*S.vesc)), tFlat:2*v/g}; }
function renderBounce(){
  var v = +bV.value, B = bounce(v);
  document.getElementById('bVVal').textContent = fmt(v*100, 0) + T(' cm/s',' см/с');
  var svg = document.getElementById('bounceSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 20, Bt = 270;
  function X(vv){ return L + vv/1.2*(R - L); }
  function Y(hm){ return Bt - Math.log10(Math.max(hm, 1))/4*(Bt - Tp); }      // 1 m … 10 km
  [1,10,100,1000,10000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 3, h >= 1000 ? (h/1000) + T(' km',' км') : h + T(' m',' м'), 'svg-small', 'end'); });
  [0,0.3,0.6,0.9,1.2].forEach(function(vv){ txt(svg, X(vv), Bt + 14, fmt(vv*100, 0), 'svg-small', 'middle'); });
  txt(svg, R, Bt + 28, T('rebound speed, cm/s','скорость отскока, см/с'), 'svg-small', 'end'); txt(svg, L, 13, T('peak height (log)','высота подъёма (лог.)'), 'svg-small');
  var d = '';
  for(var vv = 0.02; vv < B.vesc; vv += 0.005){ var hh = bounce(vv).h; if(hh > 1e4) break; d += (d ? 'L' : 'M') + X(vv).toFixed(1) + ' ' + Y(hh).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('rect', {x:X(B.vesc), y:Tp, width:R - X(B.vesc), height:Bt - Tp, fill:'#b5452a', opacity:0.08}, svg);
  ns('line', {x1:X(B.vesc), y1:Tp, x2:X(B.vesc), y2:Bt, stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, X(B.vesc) + 4, Tp + 12, T('escapes the comet','улетает с кометы'), 'svg-small');
  ns('line', {x1:X(1.0), y1:Tp, x2:X(1.0), y2:Bt, stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X(1.0) - 4, Bt - 6, T('Philae arrived at ~1 m/s','«Филы» подошли на ~1 м/с'), 'svg-small', 'end');
  if(!B.esc && B.h < 1e4) ns('circle', {cx:X(v), cy:Y(B.h), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('bounceReadout'), [
    [T('SURFACE GRAVITY','ТЯГОТЕНИЕ НА ПОВЕРХНОСТИ'), fmt(B.g*1e4, 2) + T(' × 10⁻⁴ m/s²',' × 10⁻⁴ м/с²')],
    [T('100 kg WEIGHS LIKE','100 кг ВЕСЯТ КАК'), fmt(100*B.g/9.80665*1000, 1) + T(' g on Earth',' г на Земле')],
    [T('ESCAPE SPEED','СКОРОСТЬ УБЕГАНИЯ'), fmt(B.vesc*100, 0) + T(' cm/s',' см/с')],
    [T('PEAK HEIGHT','ВЫСОТА ПОДЪЁМА'), B.esc ? T('gone','улетел') : (B.h < 1000 ? fmtInt(B.h) + T(' m',' м') : fmt(B.h/1000, 1) + T(' km',' км'))]
  ]);
  document.getElementById('bounceStatus').innerHTML = B.esc
    ? T('<b>Faster than escape speed:</b> the lander would leave the comet for good.','<b>Быстрее скорости убегания:</b> аппарат навсегда покинул бы комету.')
    : T('A rebound of ','Отскок на ') + fmt(v*100, 0) + T(' cm/s — about a slow shuffle — carries the lander hundreds of metres up and keeps it airborne for the better part of an hour or more. Philae\'s first hop lasted almost two hours [1].',' см/с — как медленный шаг — уносит аппарат на сотни метров вверх и держит в полёте почти час и дольше. Первый прыжок «Фил» длился почти два часа [1].');
}
bV.addEventListener('input', renderBounce);

/* ============ CH7 — TIMELINE ============ */
var TIMELINE = [
  ['2004', '<b>2 March:</b> Rosetta and Philae launch on an Ariane 5.', '<b>2 марта:</b> старт «Розетты» и «Фил» на «Ариане-5».'],
  ['2005–09', 'Gravity assists: Earth (2005), Mars at 250 km (2007), Earth (2007, 2009).', 'Гравитационные манёвры: Земля (2005), Марс на 250 км (2007), Земля (2007, 2009).'],
  ['2008', 'Flyby of asteroid Steins at 800 km.', 'Пролёт астероида Штейнс на 800 км.'],
  ['2010', 'Flyby of asteroid Lutetia at 3,162 km.', 'Пролёт астероида Лютеция на 3162 км.'],
  ['2011–14', 'Hibernation, June 2011 – 20 January 2014.', 'Спячка с июня 2011 по 20 января 2014.'],
  ['2014', '<b>6 August:</b> arrival at 67P. <b>12 November:</b> Philae lands three times and settles at Abydos.', '<b>6 августа:</b> прибытие к 67P. <b>12 ноября:</b> «Филы» трижды касаются поверхности и останавливаются у Абидоса.'],
  ['2015', 'D/H ratio published (January); Philae wakes briefly (June–July); comet perihelion on 13 August.', 'Опубликовано отношение D/H (январь); «Филы» ненадолго просыпаются (июнь–июль); перигелий кометы 13 августа.'],
  ['2016', '<b>September:</b> Philae spotted in images; <b>30 September:</b> Rosetta ends its mission on the comet.', '<b>Сентябрь:</b> «Филы» найдены на снимках; <b>30 сентября:</b> «Розетта» завершает миссию на комете.']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Rosetta and Philae: target change from 46P, flybys, Steins and Lutetia, hibernation, arrival, the 29 km orbit, the landing times, 57 h on the surface, perihelion at 186 million km and the end of mission.', ru:'«Розетта» и «Филы»: смена цели с 46P, пролёты, Штейнс и Лютеция, спячка, прибытие, орбита 29 км, время посадок, 57 ч на поверхности, перигелий на 186 млн км и завершение миссии.'}},
  {title:'M. Pätzold et al. (2016), “A homogeneous nucleus for comet 67P/Churyumov–Gerasimenko from its gravity field”, Nature 530', url:'https://doi.org/10.1038/nature16535', note:{en:'Mass (9.982 ± 0.003) × 10¹² kg and bulk density 533 ± 6 kg/m³ from Rosetta radio tracking.', ru:'Масса (9,982 ± 0,003) × 10¹² кг и средняя плотность 533 ± 6 кг/м³ по радиослежению за «Розеттой».'}},
  {title:'K. Altwegg et al. (2015), “67P/Churyumov-Gerasimenko, a Jupiter family comet with a high D/H ratio”, Science 347', url:'https://doi.org/10.1126/science.1261952', note:{en:'D/H = (5.3 ± 0.7) × 10⁻⁴ measured by ROSINA, about three times the terrestrial ocean value.', ru:'D/H = (5,3 ± 0,7) × 10⁻⁴ по измерениям ROSINA — примерно втрое больше, чем в земном океане.'}},
  {title:'A. Bieler et al. (2015), “Abundant molecular oxygen in the coma of comet 67P/Churyumov–Gerasimenko”, Nature 526', url:'https://doi.org/10.1038/nature15707', note:{en:'O₂ as a major coma species, interpreted as primordial.', ru:'O₂ как один из основных компонентов комы, интерпретируемый как первичный.'}},
  {title:'K. Altwegg et al. (2016), “Prebiotic chemicals — amino acid and phosphorus — in the coma of comet 67P/Churyumov-Gerasimenko”, Science Advances 2', url:'https://doi.org/10.1126/sciadv.1600285', note:{en:'Detection of glycine and phosphorus.', ru:'Обнаружение глицина и фосфора.'}},
  {title:'J. Biele et al. (2015), “The landing(s) of Philae and inferences about comet surface mechanical properties”, Science 349', url:'https://doi.org/10.1126/science.aaa9816', note:{en:'Reconstruction of Philae\'s multiple touchdowns, rebound parameters and the surface strength at Agilkia and Abydos.', ru:'Реконструкция многократных касаний «Фил», параметров отскока и прочности поверхности у Агилкии и Абидоса.'}},
  {title:'ESA, Rosetta mission pages', url:'https://www.esa.int/Science_Exploration/Space_Science/Rosetta', note:{en:'ESA\'s overview of the Rosetta mission, its instruments and results.', ru:'Обзор ЕКА: миссия «Розетта», её приборы и результаты.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderPower();
  renderCOrb();
  renderBounce();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__comet = {circ:circ, bounce:bounce, R_EQ:R_EQ, GM_67P:GM_67P, powerFrac:powerFrac};
