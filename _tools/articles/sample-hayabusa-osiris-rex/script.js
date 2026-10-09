/* ============ CONSTANTS ============ */
var G0 = 9.80665, G_N = 6.674e-11, M0_SC = 600;                      // kg, ≈ Hayabusa2 launch mass [3]
var BODIES = {
  itokawa: {en:'Itokawa', ru:'Итокава', GM:G_N*3.51e10, rho:1900},    // Fujiwara et al. 2006 [2]
  bennu:   {en:'Bennu',   ru:'Бенну',   GM:4.89045,     rho:1190}     // Scheeres et al. 2020 [8]
};
function eqRadius(b){ return Math.pow(3*(b.GM/G_N)/(4*Math.PI*b.rho), 1/3); }
function surface(key){ var b = BODIES[key], R = eqRadius(b); return {R:R, g:b.GM/(R*R), vesc:Math.sqrt(2*b.GM/R)}; }

/* ============ CH2 — ROCKET EQUATION ============ */
var rDv = document.getElementById('rDv'), rIsp = document.getElementById('rIsp');
function propFrac(dvKms, isp){ return 1 - Math.exp(-dvKms*1000/(isp*G0)); }
function renderRocket(){
  var dv = +rDv.value, isp = +rIsp.value, f = propFrac(dv, isp), fc = propFrac(dv, 300), fi = propFrac(dv, 3000);
  document.getElementById('rDvVal').textContent = fmt(dv, 1) + T(' km/s',' км/с');
  document.getElementById('rIspVal').textContent = fmtInt(isp) + T(' s',' с');
  var svg = document.getElementById('rocketSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250;
  function X(i){ return L + (i - 200)/(4000 - 200)*(R - L); }
  function Y(p){ return B - p*(B - Tp); }
  [0,0.25,0.5,0.75,1].forEach(function(p){ ns('line', {x1:L, y1:Y(p), x2:R, y2:Y(p), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(p) + 3, (p*100) + '%', 'svg-small', 'end'); });
  [500,1000,2000,3000,4000].forEach(function(i){ txt(svg, X(i), B + 14, fmtInt(i), 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('specific impulse, s','удельный импульс, с'), 'svg-small', 'end');
  txt(svg, L, 13, T('share of launch mass that must be propellant','доля стартовой массы, которая должна быть топливом'), 'svg-small');
  [[300, T('chemical','химический')], [3000, T('ion','ионный')]].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) + 4, Tp + 10, m[1], 'svg-small'); });
  var d = '';
  for(var i = 200; i <= 4000; i += 20) d += (i === 200 ? 'M' : 'L') + X(i).toFixed(1) + ' ' + Y(propFrac(dv, i)).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(isp), cy:Y(f), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('rocketReadout'), [
    [T('PROPELLANT SHARE','ДОЛЯ ТОПЛИВА'), fmt(f*100, 1) + ' %'],
    [T('PROPELLANT FOR 600 kg','ТОПЛИВО ДЛЯ 600 кг'), fmtInt(f*M0_SC) + T(' kg',' кг')],
    [T('EXHAUST SPEED','СКОРОСТЬ ИСТЕЧЕНИЯ'), fmt(isp*G0/1000, 1) + T(' km/s',' км/с')],
    [T('CHEMICAL vs ION','ХИМИЧЕСКИЙ / ИОННЫЙ'), fmtInt(fc*M0_SC) + ' / ' + fmtInt(fi*M0_SC) + T(' kg',' кг')]
  ]);
  hud1.textContent = fmtInt(f*M0_SC) + T(' kg',' кг');
  document.getElementById('rocketStatus').innerHTML = isp >= 1500
    ? T('An electric engine: little propellant, but it must run for months or years, because its thrust is tiny.','Электрический двигатель: топлива мало, но работать ему месяцы и годы — тяга крошечная.')
    : T('A chemical engine: a quick, strong push, but much of the spacecraft has to be propellant for the same Δv.','Химический двигатель: быстрый мощный толчок, но для той же Δv значительная часть аппарата должна быть топливом.');
}
[rDv, rIsp].forEach(function(el){ el.addEventListener('input', renderRocket); });

/* ============ CH3 — RUBBLE-PILE GRAVITY ============ */
var pV = document.getElementById('pV'), pileKey = 'itokawa', pDot = null, pAnim = null;
function kick(key, v){ var S = surface(key), esc = v >= S.vesc; return {R:S.R, g:S.g, vesc:S.vesc, esc:esc, h: esc ? Infinity : S.R*(v*v/(S.vesc*S.vesc))/(1 - v*v/(S.vesc*S.vesc))}; }
function renderPile(){
  var v = +pV.value/100, K = kick(pileKey, v), b = BODIES[pileKey];
  document.getElementById('pVVal').textContent = fmt(v*100, 1) + T(' cm/s',' см/с');
  var svg = document.getElementById('pileSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 20, Bt = 270;
  function X(vv){ return L + vv/0.30*(R - L); }
  function Y(hm){ return Bt - Math.log10(Math.max(hm, 0.1)/0.1)/4*(Bt - Tp); }   // 0.1 m … 1 km
  [0.1,1,10,100,1000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 3, h >= 1000 ? (h/1000) + T(' km',' км') : fmt(h, h < 1 ? 1 : 0) + T(' m',' м'), 'svg-small', 'end'); });
  [0,0.05,0.1,0.15,0.2,0.25,0.3].forEach(function(vv){ txt(svg, X(vv), Bt + 14, fmtInt(vv*100), 'svg-small', 'middle'); });
  txt(svg, R, Bt + 28, T('kick speed, cm/s','скорость броска, см/с'), 'svg-small', 'end'); txt(svg, L, 13, T('peak height (log) — ','высота подъёма (лог.) — ') + T(b.en, b.ru), 'svg-small');
  var d = '';
  for(var vv = 0.002; vv < K.vesc; vv += 0.0005){ var hh = kick(pileKey, vv).h; if(hh > 1000) break; d += (d ? 'L' : 'M') + X(vv).toFixed(1) + ' ' + Y(hh).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('rect', {x:X(K.vesc), y:Tp, width:Math.max(0, R - X(K.vesc)), height:Bt - Tp, fill:'#b5452a', opacity:0.08}, svg);
  ns('line', {x1:X(K.vesc), y1:Tp, x2:X(K.vesc), y2:Bt, stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, X(K.vesc) + 4, Tp + 12, T('never comes back','не вернётся'), 'svg-small');
  if(!K.esc && K.h <= 1000) ns('circle', {cx:X(v), cy:Y(K.h), r:5, fill:'#b5452a'}, svg);
  var hMoon = v*v/(2*1.62);
  cells(document.getElementById('pileReadout'), [
    [T('SURFACE GRAVITY','ТЯГОТЕНИЕ НА ПОВЕРХНОСТИ'), fmt(K.g*1e5, 1) + T(' × 10⁻⁵ m/s²',' × 10⁻⁵ м/с²')],
    [T('ESCAPE SPEED','СКОРОСТЬ УБЕГАНИЯ'), fmt(K.vesc*100, 1) + T(' cm/s',' см/с')],
    [T('PEAK HEIGHT','ВЫСОТА ПОДЪЁМА'), K.esc ? T('gone','улетел') : (K.h < 1000 ? fmt(K.h, K.h < 10 ? 1 : 0) + T(' m',' м') : fmt(K.h/1000, 1) + T(' km',' км'))],
    [T('SAME KICK ON THE MOON','ТОТ ЖЕ БРОСОК НА ЛУНЕ'), fmt(hMoon*1000, 1) + T(' mm',' мм')]
  ]);
  document.getElementById('pileStatus').innerHTML = K.esc
    ? T('<b>Faster than escape speed:</b> the pebble leaves ','<b>Быстрее скорости убегания:</b> камешек навсегда покидает ') + T(b.en, b.ru) + T(' for good — at the speed of a slow crawl.',' — со скоростью медленного ползка.')
    : T('A ','Бросок на ') + fmt(v*100, 1) + T(' cm/s flick lifts the pebble ',' см/с поднимает камешек на ') + (K.h < 1000 ? fmt(K.h, K.h < 10 ? 1 : 0) + T(' m',' м') : fmt(K.h/1000, 1) + T(' km',' км')) + T(' and keeps it in the air for minutes or hours; on the Moon it would rise ',' и держит его в воздухе минуты или часы; на Луне он поднялся бы на ') + fmt(hMoon*1000, 1) + T(' mm.',' мм.');
}
pV.addEventListener('input', renderPile);
Array.prototype.forEach.call(document.querySelectorAll('#pileBody .btn'), function(btn){
  btn.addEventListener('click', function(){ pileKey = this.getAttribute('data-body'); pressGroup(this.parentNode, this); renderPile(); });
});

/* ============ CH6 — RE-ENTRY ENERGY ============ */
var eV = document.getElementById('eV');
var V_LEO = Math.sqrt(MU_E/(R_E + 200)), V_ESC = Math.sqrt(2*MU_E/(R_E + 125)), V_OREX = 44500/3600, TNT = 4.184;
var PRESETS = {leo:V_LEO, esc:V_ESC, orex:V_OREX};
function entry(v){ return {e:0.5*v*v, tnt:0.5*v*v/TNT, kRatio:(v*v)/(V_LEO*V_LEO), qRatio:Math.pow(v/V_LEO, 3)}; }
function renderEntry(){
  var v = +eV.value, E = entry(v);
  document.getElementById('eVVal').textContent = fmt(v, 2) + T(' km/s',' км/с');
  var svg = document.getElementById('entrySvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, vmin = 7, vmax = 13, ymax = 5;
  function X(x){ return L + (x - vmin)/(vmax - vmin)*(R - L); }
  function Y(r){ return B - r/ymax*(B - Tp); }
  [0,1,2,3,4,5].forEach(function(r){ ns('line', {x1:L, y1:Y(r), x2:R, y2:Y(r), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(r) + 3, r + '×', 'svg-small', 'end'); });
  [7,8,9,10,11,12,13].forEach(function(x){ txt(svg, X(x), B + 14, x, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('entry speed, km/s','скорость входа, км/с'), 'svg-small', 'end');
  txt(svg, L, 13, T('relative to a return from low orbit','относительно возвращения с низкой орбиты'), 'svg-small');
  [[V_LEO, T('orbit','орбита')], [V_ESC, T('Moon','Луна')], [V_OREX, 'OSIRIS-REx']].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) - 3, Tp + 10, m[1], 'svg-small', 'end'); });
  var dk = '', dq = '';
  for(var x = vmin; x <= vmax + 1e-9; x += 0.05){ var e = entry(x); dk += (dk ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(e.kRatio).toFixed(1); dq += (dq ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(Math.min(e.qRatio, ymax)).toFixed(1); }
  ns('path', {d:dk, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('path', {d:dq, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, X(8.2), Y(entry(8.2).kRatio) - 8, T('energy ∝ v²','энергия ∝ v²'), 'svg-small', 'end');
  txt(svg, X(10.6), Y(entry(10.6).qRatio) - 6, T('heating ∝ v³','нагрев ∝ v³'), 'svg-small', 'end');
  ns('circle', {cx:X(v), cy:Y(E.kRatio), r:4, fill:'#0b0b0c'}, svg);
  ns('circle', {cx:X(v), cy:Y(Math.min(E.qRatio, ymax)), r:4, fill:'#b5452a'}, svg);
  cells(document.getElementById('entryReadout'), [
    [T('ENERGY PER kg','ЭНЕРГИЯ НА 1 кг'), fmt(E.e, 1) + T(' MJ',' МДж')],
    [T('TNT EQUIVALENT','ТРОТИЛОВЫЙ ЭКВИВАЛЕНТ'), fmt(E.tnt, 1) + T(' kg TNT per kg',' кг ТНТ на 1 кг')],
    [T('ENERGY vs ORBIT','ЭНЕРГИЯ К ОРБИТЕ'), fmt(E.kRatio, 2) + '×'],
    [T('HEATING vs ORBIT','НАГРЕВ К ОРБИТЕ'), fmt(E.qRatio, 2) + '×']
  ]);
  hud2.textContent = fmt(v, 2) + T(' km/s',' км/с');
  document.getElementById('entryStatus').innerHTML = v > V_ESC
    ? T('Faster than escape speed: a capsule that skipped off the air would leave Earth for good, so it gets one chance to enter at the right angle.','Быстрее скорости убегания: капсула, отскочившая от атмосферы, навсегда улетела бы от Земли, поэтому у неё одна попытка войти под нужным углом.')
    : T('At this speed a capsule that grazed the air too shallowly would stay bound to Earth and come back around.','При такой скорости капсула, слишком полого задевшая атмосферу, останется связанной с Землёй и вернётся на следующем витке.');
}
eV.addEventListener('input', function(){ pressGroup(document.getElementById('entryPreset'), null); renderEntry(); });
Array.prototype.forEach.call(document.querySelectorAll('#entryPreset .btn'), function(btn){
  btn.addEventListener('click', function(){ eV.value = PRESETS[this.getAttribute('data-v')].toFixed(2); pressGroup(this.parentNode, this); renderEntry(); });
});

/* ============ CH7 — SAMPLE MASSES ============ */
var massScale = 'log';
var MASSES = [
  ['Hayabusa2 · Ryugu', 'Хаябуса-2 · Рюгу', 5.424, '#b5452a'],
  ['OSIRIS-REx · Bennu', 'OSIRIS-REx · Бенну', 121.6, '#b5452a'],
  ['Chang\'e 5 · Moon', 'Чанъэ-5 · Луна', 1731, '#8a8a82'],
  ['Chang\'e 6 · Moon', 'Чанъэ-6 · Луна', 1935.3, '#8a8a82']
];
function renderMass(){
  var svg = document.getElementById('massSvg'); svg.innerHTML = '';
  var L = 150, R = 440, Tp = 30, row = 46;
  function X(g){ return massScale === 'log' ? L + Math.log10(g/1)/Math.log10(3000)*(R - L) : L + g/2000*(R - L); }
  (massScale === 'log' ? [1,10,100,1000] : [0,500,1000,1500,2000]).forEach(function(g){ ns('line', {x1:X(Math.max(g, 1e-9)), y1:Tp - 8, x2:X(Math.max(g, 1e-9)), y2:Tp + row*4 - 10, stroke:'#e4e4de'}, svg); txt(svg, X(Math.max(g, 1e-9)), Tp + row*4 + 4, fmtInt(g) + T(' g',' г'), 'svg-small', 'middle'); });
  if(massScale === 'lin') ns('line', {x1:X(0), y1:Tp - 8, x2:X(0), y2:Tp + row*4 - 10, stroke:'#e4e4de'}, svg);
  MASSES.forEach(function(m, i){
    var y = Tp + i*row, x0 = massScale === 'log' ? X(1) : X(0);
    txt(svg, L - 8, y + 16, T(m[0], m[1]), 'svg-small', 'end');
    ns('rect', {x:x0, y:y + 4, width:Math.max(1.5, X(m[2]) - x0), height:18, fill:m[3]}, svg);
    var inside = X(m[2]) + 50 > R + 30, lab = txt(svg, inside ? X(m[2]) - 5 : X(m[2]) + 6, y + 17, fmt(m[2], m[2] < 10 ? 3 : 1).replace(/[.,]0$/, '') + T(' g',' г'), 'svg-small', inside ? 'end' : 'start');
    if(inside) lab.style.fill = '#fff';
  });
  ns('line', {x1:X(60), y1:Tp + row - 4, x2:X(60), y2:Tp + row*2 - 14, stroke:'#2f5aa1', 'stroke-dasharray':'3 2'}, svg);
  txt(svg, X(60) - 3, Tp + row - 6, T('required 60 g','требовалось 60 г'), 'svg-small', 'end');
  document.getElementById('massStatus').innerHTML = massScale === 'log'
    ? T('On a log scale every step is ten times more. OSIRIS-REx brought back 22 times as much as Hayabusa2.','На логарифмической шкале каждый шаг — в десять раз больше. OSIRIS-REx привёз в 22 раза больше, чем «Хаябуса-2».')
    : T('On a linear scale the asteroid samples almost vanish next to the lunar ones — the Moon is much easier to reach and land on.','На линейной шкале образцы астероидов почти исчезают рядом с лунными: до Луны гораздо проще долететь и сесть на неё.');
}
Array.prototype.forEach.call(document.querySelectorAll('#massScale .btn'), function(btn){
  btn.addEventListener('click', function(){ massScale = this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderMass(); });
});

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['2003', '<b>9 May:</b> Hayabusa launches on an M-V rocket.', '<b>9 мая:</b> старт «Хаябусы» на ракете M-V.'],
  ['2005', '<b>12 September:</b> arrival at Itokawa. <b>19 and 25 November:</b> two touchdowns; then a fuel leak and tumbling.', '<b>12 сентября:</b> прибытие к Итокаве. <b>19 и 25 ноября:</b> два касания; затем утечка топлива и кувыркание.'],
  ['2006', '<b>23 January:</b> contact with Hayabusa re-established.', '<b>23 января:</b> связь с «Хаябусой» восстановлена.'],
  ['2010', '<b>13 June:</b> Hayabusa\'s capsule lands at Woomera; in November ~1,500 grains of Itokawa are confirmed.', '<b>13 июня:</b> капсула «Хаябусы» садится в Вумере; в ноябре подтверждено ~1500 частиц Итокавы.'],
  ['2014', '<b>3 December:</b> Hayabusa2 launches.', '<b>3 декабря:</b> старт «Хаябусы-2».'],
  ['2016', '<b>8 September:</b> OSIRIS-REx launches.', '<b>8 сентября:</b> старт OSIRIS-REx.'],
  ['2018', '<b>27 June:</b> Hayabusa2 at Ryugu. <b>3 December:</b> OSIRIS-REx at Bennu; in orbit on 31 December.', '<b>27 июня:</b> «Хаябуса-2» у Рюгу. <b>3 декабря:</b> OSIRIS-REx у Бенну; на орбите с 31 декабря.'],
  ['2019', '<b>22 February:</b> first touchdown on Ryugu. <b>5 April:</b> SCI crater. <b>11 July:</b> second touchdown. <b>13 November:</b> Hayabusa2 leaves.', '<b>22 февраля:</b> первое касание Рюгу. <b>5 апреля:</b> кратер SCI. <b>11 июля:</b> второе касание. <b>13 ноября:</b> «Хаябуса-2» улетает.'],
  ['2020', '<b>20 October:</b> OSIRIS-REx touch-and-go at Nightingale. <b>6 December:</b> Hayabusa2 capsule lands at Woomera.', '<b>20 октября:</b> касание OSIRIS-REx на площадке «Найтингейл». <b>6 декабря:</b> капсула «Хаябусы-2» садится в Вумере.'],
  ['2021', '<b>10 May:</b> OSIRIS-REx leaves Bennu.', '<b>10 мая:</b> OSIRIS-REx покидает Бенну.'],
  ['2023', '<b>24 September:</b> Bennu capsule lands in Utah; the spacecraft becomes OSIRIS-APEX.', '<b>24 сентября:</b> капсула с образцом Бенну садится в Юте; аппарат становится OSIRIS-APEX.'],
  ['2026 →', 'Hayabusa2 flies by Torifune (2026); OSIRIS-APEX to Apophis (2029); Hayabusa2 to 1998 KY26 (2031).', '«Хаябуса-2» пролетает Торифунэ (2026); OSIRIS-APEX — к Апофису (2029); «Хаябуса-2» — к 1998 KY26 (2031).']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Hayabusa: launch, ion-engine failures, 10,400 h of operation, the touchdowns and lift-off, the leak and tumbling, the engine cross-wiring, the Woomera landing and ~1,500 grains. Hayabusa2 and OSIRIS-REx: launch, payloads, the SCI design (2 kg copper at ~2 km/s) and the TAGSAM principle.', ru:'«Хаябуса»: старт, отказы ионных двигателей, 10 400 ч работы, касания и взлёт, утечка и кувыркание, перекоммутация двигателей, посадка в Вумере и ~1500 частиц. «Хаябуса-2» и OSIRIS-REx: старт, полезная нагрузка, устройство SCI (2 кг меди на ~2 км/с) и принцип TAGSAM.'}},
  {title:'A. Fujiwara et al. (2006), “The Rubble-Pile Asteroid Itokawa as Observed by Hayabusa”, Science 312, 1330–1334', url:'https://doi.org/10.1126/science.1125841', note:{en:'Itokawa\'s axes 535 × 294 × 209 m, mass 3.51 × 10¹⁰ kg, bulk density 1.9 ± 0.13 g/cm³; rubble-pile interpretation.', ru:'Оси Итокавы 535 × 294 × 209 м, масса 3,51 × 10¹⁰ кг, средняя плотность 1,9 ± 0,13 г/см³; интерпретация как «груды щебня».'}},
  {title:'JAXA ISAS, Hayabusa2 mission page', url:'https://www.isas.jaxa.jp/en/missions/spacecraft/current/hayabusa2.html', note:{en:'Mass ~600 kg; arrival 27 June 2018; touchdowns 22 February and 11 July 2019; SCI crater 5 April 2019; departure 13 November 2019; capsule 6 December 2020 (JST); extended mission: Torifune flyby 2026, Earth swing-bys 2027–28, 1998 KY26 in 2031, about half the xenon left.', ru:'Масса ~600 кг; прибытие 27 июня 2018; касания 22 февраля и 11 июля 2019; кратер SCI 5 апреля 2019; отлёт 13 ноября 2019; капсула 6 декабря 2020 (JST); расширенная миссия: пролёт Торифунэ в 2026, гравитационные манёвры у Земли в 2027–28, 1998 KY26 в 2031, осталось около половины ксенона.'}},
  {title:'S. Watanabe et al. (2019), “Hayabusa2 arrives at the carbonaceous asteroid 162173 Ryugu — A spinning top–shaped rubble pile”, Science 364, 268–272', url:'https://doi.org/10.1126/science.aav8032', note:{en:'Ryugu\'s spinning-top shape, bulk density 1.19 ± 0.02 g/cm³ and porosity above 50 %; boulder-covered surface.', ru:'Форма Рюгу в виде волчка, средняя плотность 1,19 ± 0,02 г/см³ и пористость более 50 %; поверхность, покрытая валунами.'}},
  {title:'M. Arakawa et al. (2020), “An artificial impact on the asteroid (162173) Ryugu formed a crater in the gravity-dominated regime”, Science 368, 67–71', url:'https://doi.org/10.1126/science.aaz1701', note:{en:'The SCI experiment: crater formed in the gravity-dominated regime, exposing subsurface material suitable for sampling.', ru:'Эксперимент SCI: кратер образовался в режиме, где определяющую роль играет тяготение, и обнажил подповерхностное вещество, пригодное для отбора.'}},
  {title:'M. Jutzi, S. D. Raducan et al. (2022), “Constraining surface properties of asteroid (162173) Ryugu from numerical simulations of Hayabusa2 mission impact experiment”, Nature Communications 13', url:'https://doi.org/10.1038/s41467-022-34540-x', note:{en:'The SCI crater is about 14.5 m in diameter; surface cohesion below about 1 Pa.', ru:'Диаметр кратера SCI около 14,5 м; сцепление поверхностного слоя меньше примерно 1 Па.'}},
  {title:'T. Yada et al. (2022), “Preliminary analysis of the Hayabusa2 samples returned from C-type asteroid Ryugu”, Nature Astronomy 6, 214–220', url:'https://doi.org/10.1038/s41550-021-01550-6', note:{en:'5.424 ± 0.217 g returned, 3.237 g from the first touchdown; recovery at Woomera; dark, porous particles most similar to CI chondrites.', ru:'Доставлено 5,424 ± 0,217 г, из них 3,237 г с первого касания; поиск капсулы в Вумере; тёмные пористые частицы, больше всего похожие на хондриты CI.'}},
  {title:'D. J. Scheeres et al. (2020), “Heterogeneous mass distribution of the rubble-pile asteroid (101955) Bennu”, Science Advances 6', url:'https://doi.org/10.1126/sciadv.abc3350', note:{en:'Bennu\'s GM = 4.89045 m³/s² from tracking ejected particles in orbit; bulk density ~1.2 g/cm³.', ru:'GM Бенну = 4,89045 м³/с² по слежению за выброшенными частицами на орбите; средняя плотность ~1,2 г/см³.'}},
  {title:'D. S. Lauretta et al. (2022), “Spacecraft sample collection and subsurface excavation of asteroid (101955) Bennu”, Science 377, 285–291', url:'https://doi.org/10.1126/science.abm1018', note:{en:'TAG excavated a 9 m elliptical crater; displaced subsurface material had a bulk density of 500–700 kg/m³.', ru:'TAG выкопал эллиптический кратер длиной 9 м; плотность вытесненного подповерхностного вещества 500–700 кг/м³.'}},
  {title:'K. J. Walsh et al. (2022), “Near-zero cohesion and loose packing of Bennu\'s near subsurface revealed by spacecraft contact”, Science Advances 8', url:'https://doi.org/10.1126/sciadv.abm6229', note:{en:'Contact forces best matched by a granular bed with near-zero cohesion, half as dense as the bulk asteroid.', ru:'Силы при контакте лучше всего описываются рыхлым слоем с почти нулевым сцеплением и вдвое меньшей плотностью, чем у астероида в целом.'}},
  {title:'NASA Science, OSIRIS-REx mission page', url:'https://science.nasa.gov/mission/osiris-rex/', note:{en:'Arrival 3 December 2018; orbit 31 December 2018 (smallest body orbited); Nightingale selected 12 December 2019; TAG 20 October 2020; departure 10 May 2021; delivery 24 September 2023; OSIRIS-APEX to Apophis after 2029.', ru:'Прибытие 3 декабря 2018; орбита с 31 декабря 2018 (самое маленькое тело, вокруг которого летал аппарат); выбор площадки «Найтингейл» 12 декабря 2019; TAG 20 октября 2020; отлёт 10 мая 2021; доставка 24 сентября 2023; OSIRIS-APEX — к Апофису после 2029.'}},
  {title:'NASA (2023), “NASA\'s First Asteroid Sample Has Landed, Now Secure in Clean Room”', url:'https://www.nasa.gov/news-release/nasas-first-asteroid-sample-has-landed-now-secure-in-clean-room/', note:{en:'Capsule released 102,000 km out; entry at 44,500 km/h at 133 km altitude; landing in Utah at 8:52 a.m. MDT on 24 September 2023.', ru:'Капсула отделена в 102 000 км; вход со скоростью 44 500 км/ч на высоте 133 км; посадка в Юте в 8:52 MDT 24 сентября 2023.'}},
  {title:'NASA (2024), “NASA Announces OSIRIS-REx Bulk Sample Mass”', url:'https://science.nasa.gov/blogs/osiris-rex/2024/02/15/nasa-announces-osiris-rex-bulk-sample-mass/', note:{en:'121.6 g in total, including 51.2 g poured from the TAGSAM top plate; requirement at least 60 g.', ru:'Всего 121,6 г, включая 51,2 г, ссыпанные с верхней пластины TAGSAM; требование — не менее 60 г.'}},
  {title:'D. P. Glavin et al. (2025), “Abundant ammonia and nitrogen-rich soluble organic matter in samples from asteroid (101955) Bennu”, Nature Astronomy 9, 199–210', url:'https://doi.org/10.1038/s41550-024-02472-9', note:{en:'14 of the 20 protein amino acids, all five nucleobases, ~10,000 N-bearing species; racemic amino acids; formation in NH₃-rich fluids in the outer Solar System.', ru:'14 из 20 белковых аминокислот, все пять азотистых оснований, ~10 000 азотсодержащих соединений; рацемические аминокислоты; образование в богатых NH₃ растворах во внешней Солнечной системе.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderRocket();
  renderPile();
  renderEntry();
  renderMass();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__sample = {propFrac:propFrac, surface:surface, kick:kick, entry:entry, V_LEO:V_LEO, V_ESC:V_ESC, V_OREX:V_OREX, eqRadius:eqRadius, BODIES:BODIES};
