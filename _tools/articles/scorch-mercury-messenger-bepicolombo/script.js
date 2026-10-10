/* ============ CONSTANTS [1][2][5][6] ============ */
var MU_S = 132712e6, AU = 149597870.7, R_EARTH_ORBIT = 149.598e6, S_EARTH = 1361, SIGMA = 5.670374e-8;
var MU_ME = 22032, R_ME = 2439.7, T_ORBIT = 87.969, T_SPIN = 1407.6/24, ECC = 0.2056, A_ME = 57.909e6, Q_ME = 46.000e6, Q2_ME = 69.818e6;
var PLANETS = [
  {k:'venus', en:'Venus', ru:'Венера', r:108.210e6, mu:324860, R:6051.8},
  {k:'mars', en:'Mars', ru:'Марс', r:227.956e6, mu:42828, R:3389.5},
  {k:'mercury', en:'Mercury', ru:'Меркурий', r:A_ME, mu:MU_ME, R:R_ME},
  {k:'jupiter', en:'Jupiter', ru:'Юпитер', r:778.479e6, mu:126.687e6, R:69911}
];
var CAPTURE_ALT = 200;

/* ============ CH1 — HOHMANN + MINIMUM CAPTURE ============ */
function hohmann(r2, mu, R){
  var r1 = R_EARTH_ORBIT, a = (r1 + r2)/2;
  var dep = Math.abs(Math.sqrt(MU_S*(2/r1 - 1/a)) - Math.sqrt(MU_S/r1));
  var arr = Math.abs(Math.sqrt(MU_S/r2) - Math.sqrt(MU_S*(2/r2 - 1/a)));
  var rp = R + CAPTURE_ALT, vesc = Math.sqrt(2*mu/rp), cap = Math.sqrt(arr*arr + vesc*vesc) - vesc;
  return {dep:dep, arr:arr, days:Math.PI*Math.sqrt(a*a*a/MU_S)/86400, cap:cap, total:dep + cap};
}
var DV_ESCAPE = Math.sqrt(2*MU_S/R_EARTH_ORBIT) - Math.sqrt(MU_S/R_EARTH_ORBIT);
var dvSel = 'mercury';
function renderDv(){
  var pick = document.getElementById('dvPick'); pick.innerHTML = '';
  PLANETS.forEach(function(p){
    var b = document.createElement('button'); b.className = 'btn' + (p.k === dvSel ? ' active' : ''); b.setAttribute('aria-pressed', p.k === dvSel ? 'true' : 'false');
    b.textContent = T(p.en, p.ru).toUpperCase();
    b.addEventListener('click', function(){ dvSel = p.k; renderDv(); });
    pick.appendChild(b);
  });
  var svg = document.getElementById('dvSvg'); svg.innerHTML = '';
  var L = 96, R = 462, Tp = 34, rowH = 58, vMax = 16;
  function X(v){ return L + v/vMax*(R - L); }
  [0,4,8,12,16].forEach(function(v){ ns('line', {x1:X(v), y1:Tp - 8, x2:X(v), y2:Tp + rowH*PLANETS.length, stroke:'#e4e4de'}, svg); txt(svg, X(v), Tp + rowH*PLANETS.length + 14, v, 'svg-small', 'middle'); });
  txt(svg, R, Tp + rowH*PLANETS.length + 28, T('km/s, heliocentric departure + capture','км/с, гелиоцентрический старт + захват'), 'svg-small', 'end');
  PLANETS.forEach(function(p, i){
    var H = hohmann(p.r, p.mu, p.R), y = Tp + i*rowH, sel = p.k === dvSel;
    txt(svg, L - 10, y + 20, T(p.en, p.ru), sel ? 'svg-label' : 'svg-small', 'end');
    ns('rect', {x:L, y:y + 8, width:Math.max(1, X(H.dep) - L), height:18, fill:'#0b0b0c', opacity: sel ? 1 : 0.55}, svg);
    ns('rect', {x:X(H.dep), y:y + 8, width:Math.max(1, X(H.total) - X(H.dep)), height:18, fill:'#b5452a', opacity: sel ? 1 : 0.55}, svg);
    txt(svg, X(H.total) + 6, y + 21, fmt(H.total, 1), 'svg-small');
  });
  ns('line', {x1:X(DV_ESCAPE), y1:Tp - 8, x2:X(DV_ESCAPE), y2:Tp + rowH*PLANETS.length, stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, X(DV_ESCAPE) - 4, Tp + rowH*PLANETS.length - 6, T('leave the Solar System: ','покинуть Солнечную систему: ') + fmt(DV_ESCAPE, 1), 'svg-small', 'end');
  ns('rect', {x:L, y:4, width:10, height:8, fill:'#0b0b0c'}, svg); txt(svg, L + 14, 12, T('start the transfer','начать перелёт'), 'svg-small');
  ns('rect', {x:L + 130, y:4, width:10, height:8, fill:'#b5452a'}, svg); txt(svg, L + 144, 12, T('brake to be captured','затормозить для захвата'), 'svg-small');
  var p = PLANETS.filter(function(q){ return q.k === dvSel; })[0], H = hohmann(p.r, p.mu, p.R);
  cells(document.getElementById('dvReadout'), [
    [T('START OF TRANSFER','НАЧАЛО ПЕРЕЛЁТА'), fmt(H.dep, 2) + T(' km/s',' км/с')],
    [T('TRANSFER TIME','ВРЕМЯ ПЕРЕЛЁТА'), fmtInt(H.days) + T(' days',' сут')],
    [T('ARRIVAL SPEED v∞','СКОРОСТЬ ПРИБЫТИЯ v∞'), fmt(H.arr, 2) + T(' km/s',' км/с')],
    [T('MINIMUM CAPTURE','МИНИМАЛЬНЫЙ ЗАХВАТ'), fmt(H.cap, 2) + T(' km/s',' км/с')],
    [T('TOTAL','ИТОГО'), fmt(H.total, 2) + T(' km/s',' км/с'), true]
  ]);
  hud2.textContent = fmt(H.total, 1) + T(' km/s',' км/с');
  document.getElementById('dvStatus').innerHTML = p.k === 'mercury'
    ? T('Mercury\'s small mass is the problem: its escape speed at 200 km is only ','Беда в малой массе Меркурия: вторая космическая на высоте 200 км — всего ') + fmt(Math.sqrt(2*MU_ME/(R_ME + CAPTURE_ALT)), 2) + T(' km/s, so almost all of the ',' км/с, поэтому почти все ') + fmt(H.arr, 1) + T(' km/s of arrival speed has to be burned off.',' км/с скорости прибытия приходится гасить.')
    : (p.k === 'jupiter'
      ? T('Jupiter\'s huge gravity makes capture almost free; the cost is in getting there.','Огромное тяготение Юпитера делает захват почти бесплатным; дорого — долететь.')
      : T('Cheap at both ends: modest speed changes and a planet heavy enough to help with the braking.','Дёшево с обеих сторон: скромные изменения скорости и планета, достаточно массивная, чтобы помочь затормозить.'));
}

/* ============ CH3 — CAPTURE INTO MESSENGER'S ORBIT ============ */
var MESS_T = 12*3600, MESS_RP = R_ME + 200;
var MESS_A = Math.pow(MU_ME*MESS_T*MESS_T/(4*Math.PI*Math.PI), 1/3), MESS_RA = 2*MESS_A - MESS_RP;
var MESS_VP = Math.sqrt(MU_ME*(2/MESS_RP - 1/MESS_A)), MESS_VESC = Math.sqrt(2*MU_ME/MESS_RP), MOI_DV = 0.862;
function capture(vinf){ return Math.sqrt(vinf*vinf + MESS_VESC*MESS_VESC) - MESS_VP; }
function captureCirc(vinf){ return Math.sqrt(vinf*vinf + MESS_VESC*MESS_VESC) - Math.sqrt(MU_ME/MESS_RP); }
function vinfFromBurn(dv){ var vh = MESS_VP + dv; return Math.sqrt(vh*vh - MESS_VESC*MESS_VESC); }
function orbitPeriodH(periAlt, apoAlt){ var a = (2*R_ME + periAlt + apoAlt)/2; return 2*Math.PI*Math.sqrt(a*a*a/MU_ME)/3600; }
var VINF_MESS = vinfFromBurn(MOI_DV), VINF_HOH = hohmann(A_ME, MU_ME, R_ME).arr;
var capV = document.getElementById('capV');
function renderCap(){
  var v = +capV.value, dv = capture(v), dvc = captureCirc(v);
  document.getElementById('capVVal').textContent = fmt(v, 2) + T(' km/s',' км/с');
  capV.setAttribute('aria-valuetext', fmt(v, 2) + T(' km/s',' км/с'));
  var pre = document.getElementById('capPre'); pre.innerHTML = '';
  [[VINF_HOH, T('NO FLYBYS (HOHMANN)','БЕЗ ПРОЛЁТОВ (ГОМАН)')], [VINF_MESS, T('MESSENGER AFTER ITS FLYBYS','MESSENGER ПОСЛЕ ПРОЛЁТОВ')]].forEach(function(q){
    var on = Math.abs(v - q[0]) < 0.006, b = document.createElement('button'); b.className = 'btn' + (on ? ' active' : ''); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.textContent = q[1]; b.addEventListener('click', function(){ capV.value = q[0].toFixed(2); renderCap(); }); pre.appendChild(b);
  });
  var svg = document.getElementById('capSvg'); svg.innerHTML = '';
  var L = 50, R = 465, Tp = 20, B = 280, vMax = 10, dMax = 8;
  function X(x){ return L + x/vMax*(R - L); }
  function Y(y){ return B - y/dMax*(B - Tp); }
  [0,2,4,6,8].forEach(function(y){ ns('line', {x1:L, y1:Y(y), x2:R, y2:Y(y), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(y) + 3, y, 'svg-small', 'end'); });
  [0,2,4,6,8,10].forEach(function(x){ txt(svg, X(x), B + 14, x, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('arrival speed v∞, km/s','скорость прибытия v∞, км/с'), 'svg-small', 'end'); txt(svg, L, 12, T('braking Δv, km/s','тормозной Δv, км/с'), 'svg-small');
  var d1 = '', d2 = '';
  for(var x = 0; x <= vMax + 1e-9; x += 0.1){ d1 += (x === 0 ? 'M' : 'L') + X(x).toFixed(1) + ' ' + Y(capture(x)).toFixed(1); d2 += (x === 0 ? 'M' : 'L') + X(x).toFixed(1) + ' ' + Y(captureCirc(x)).toFixed(1); }
  ns('path', {d:d2, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.5, 'stroke-dasharray':'5 3'}, svg);
  ns('path', {d:d1, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  txt(svg, X(5.6), Y(captureCirc(5.6)) - 10, T('circular, 200 km','круговая, 200 км'), 'svg-small', 'end');
  txt(svg, X(6.4), Y(capture(6.4)) + 18, T('12-hour orbit','12-часовая орбита'), 'svg-small', 'start');
  [[VINF_MESS, 'MESSENGER'], [VINF_HOH, T('Hohmann','Гоман')]].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) - 4, Tp + 10, m[1], 'svg-small', 'end'); });
  ns('circle', {cx:X(v), cy:Y(dv), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('capReadout'), [
    [T('BURN INTO 12-H ORBIT','ИМПУЛЬС НА 12-Ч ОРБИТУ'), fmt(dv, 2) + T(' km/s',' км/с')],
    [T('BURN INTO 200 KM CIRCLE','ИМПУЛЬС НА КРУГ 200 КМ'), fmt(dvc, 2) + T(' km/s',' км/с')],
    [T('SPEED AT 200 KM','СКОРОСТЬ НА 200 КМ'), fmt(Math.sqrt(v*v + MESS_VESC*MESS_VESC), 2) + T(' km/s',' км/с')],
    [T('VERSUS MESSENGER\'S 0.862','ОТНОСИТЕЛЬНО 0,862 У MESSENGER'), '×' + fmt(dv/MOI_DV, 1)]
  ]);
  hud2.textContent = fmt(dv, 2) + T(' km/s',' км/с');
  document.getElementById('capStatus').innerHTML = v > 6
    ? T('Without flybys the burn alone would need about ','Без пролётов один только импульс потребовал бы около ') + fmt(capture(VINF_HOH), 1) + T(' km/s — almost eight times MESSENGER\'s actual 0.862 km/s burn, far more than its propellant could supply.',' км/с — почти в восемь раз больше реального импульса MESSENGER 0,862 км/с и гораздо больше, чем позволял его запас топлива.')
    : T('MESSENGER\'s 0.862 km/s burn [11] implies it arrived at about ','Импульс MESSENGER 0,862 км/с [11] означает, что он прибыл со скоростью около ') + fmt(VINF_MESS, 2) + T(' km/s; the high point of a 12-hour orbit with a 200 km low point is ',' км/с; верхняя точка 12-часовой орбиты с нижней точкой 200 км — ') + fmtInt(MESS_RA - R_ME) + T(' km.',' км.');
}
capV.addEventListener('input', renderCap);

/* ============ CH4 — SUNSHADE TEMPERATURE ============ */
var hR = document.getElementById('hR'), hAE = document.getElementById('hAE');
var SHADE_C = 370, GROUND_MAX_K = 725;
function plateT(rAU, ae){ var S = S_EARTH/(rAU*rAU); return {S:S, T:Math.pow(ae*S/SIGMA, 0.25)}; }
function renderHeat(){
  var r = +hR.value, ae = +hAE.value, H = plateT(r, ae);
  document.getElementById('hRVal').textContent = fmt(r, 3) + T(' AU',' а.е.') + ' · ' + fmt(r*AU/1e6, 1) + T(' million km',' млн км');
  document.getElementById('hAEVal').textContent = fmt(ae, 2);
  hR.setAttribute('aria-valuetext', fmt(r, 3) + T(' AU',' а.е.')); hAE.setAttribute('aria-valuetext', fmt(ae, 2));
  var svg = document.getElementById('heatSvg'); svg.innerHTML = '';
  var L = 50, R = 465, Tp = 20, B = 280, x0 = 0.25, x1 = 1.05, tMax = 700;
  function X(x){ return L + (x - x0)/(x1 - x0)*(R - L); }
  function Y(c){ return B - c/tMax*(B - Tp); }
  [0,100,200,300,400,500,600,700].forEach(function(c){ ns('line', {x1:L, y1:Y(c), x2:R, y2:Y(c), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(c) + 3, c, 'svg-small', 'end'); });
  [0.3,0.5,0.7,0.9].forEach(function(x){ txt(svg, X(x), B + 14, fmt(x, 1), 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('distance from the Sun, AU','расстояние от Солнца, а.е.'), 'svg-small', 'end'); txt(svg, L, 12, T('plate temperature, °C','температура пластины, °C'), 'svg-small');
  ns('rect', {x:X(Q_ME/AU), y:Tp, width:X(Q2_ME/AU) - X(Q_ME/AU), height:B - Tp, fill:'#b5452a', opacity:0.08}, svg);
  txt(svg, (X(Q_ME/AU) + X(Q2_ME/AU))/2, B - 6, T('Mercury\'s orbit','орбита Меркурия'), 'svg-small', 'middle');
  [[0.723, T('Venus','Венера')], [1.0, T('Earth','Земля')]].forEach(function(m){ ns('line', {x1:X(m[0]), y1:Tp, x2:X(m[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(m[0]) + 3, B - 6, m[1], 'svg-small'); });
  ns('line', {x1:L, y1:Y(SHADE_C), x2:R, y2:Y(SHADE_C), stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(SHADE_C) - 5, T('MESSENGER shade, predicted 370 °C [9]','экран MESSENGER, расчёт 370 °C [9]'), 'svg-small', 'end');
  ns('line', {x1:L, y1:Y(GROUND_MAX_K - 273.15), x2:R, y2:Y(GROUND_MAX_K - 273.15), stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, R - 4, Y(GROUND_MAX_K - 273.15) - 5, T('hottest Mercury ground, 725 K [1]','самый горячий грунт Меркурия, 725 К [1]'), 'svg-small', 'end');
  var d = '';
  for(var x = x0; x <= x1 + 1e-9; x += 0.005){ d += (x === x0 ? 'M' : 'L') + X(x).toFixed(1) + ' ' + Math.max(Tp, Y(plateT(x, ae).T - 273.15)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(r), cy:Math.max(Tp, Y(H.T - 273.15)), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('heatReadout'), [
    [T('SUNLIGHT','СОЛНЕЧНЫЙ ПОТОК'), fmtInt(H.S) + T(' W/m²',' Вт/м²')],
    [T('TIMES EARTH\'S','РАЗ БОЛЬШЕ ЗЕМНОГО'), '×' + fmt(H.S/S_EARTH, 2)],
    [T('PLATE TEMPERATURE','ТЕМПЕРАТУРА ПЛАСТИНЫ'), fmtInt(H.T - 273.15) + ' °C'],
    [T('IN KELVIN','В КЕЛЬВИНАХ'), fmtInt(H.T) + ' K']
  ]);
  hud1.textContent = '×' + fmt(H.S/S_EARTH, 1);
  document.getElementById('heatStatus').innerHTML = ae > 0.9 && r < 0.48
    ? T('A dark plate at Mercury\'s distance gets about as hot as Mercury\'s own sunlit ground. Lower α/ε — a whiter, more emissive surface — to see what a ceramic shade buys.','Тёмная пластина на расстоянии Меркурия нагревается примерно как освещённый грунт самой планеты. Уменьшите α/ε — более белая и сильнее излучающая поверхность, — чтобы увидеть, что даёт керамический экран.')
    : T('Halving α/ε lowers the absolute temperature by a factor of 2^¼ ≈ 1.19; moving from aphelion to perihelion raises it by √(69.8/46.0) ≈ 1.23.','Уменьшение α/ε вдвое снижает абсолютную температуру в 2^¼ ≈ 1,19 раза; переход из афелия в перигелий повышает её в √(69,8/46,0) ≈ 1,23 раза.');
}
[hR, hAE].forEach(function(el){ el.addEventListener('input', renderHeat); });

/* ============ CH5 — 3:2 SPIN–ORBIT ============ */
var N_ORB = 2*Math.PI/T_ORBIT, W_SPIN = 2*Math.PI/T_SPIN;
var SOLAR_DAY = 1/(1/T_SPIN - 1/T_ORBIT);
function keplerE(M, e){ var lo = M - e, hi = M + e; for(var i = 0; i < 60; i++){ var mid = (lo + hi)/2; if(mid - e*Math.sin(mid) < M) lo = mid; else hi = mid; } return (lo + hi)/2; }
function mercuryAt(t){
  var M = ((N_ORB*t) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI), E = keplerE(M, ECC);
  var nu = 2*Math.atan2(Math.sqrt(1 + ECC)*Math.sin(E/2), Math.sqrt(1 - ECC)*Math.cos(E/2)), r = A_ME*(1 - ECC*Math.cos(E));
  var spin = Math.PI + W_SPIN*t;                      // the marker faces the Sun at t = 0 (perihelion noon)
  var hour = ((spin - (nu + Math.PI)) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);   // 0 = local noon
  var nuRate = N_ORB*Math.pow(1 + ECC*Math.cos(nu), 2)/Math.pow(1 - ECC*ECC, 1.5);
  return {nu:nu, r:r, spin:spin, hour:hour, retro:nuRate > W_SPIN, nuRate:nuRate};
}
function retroDays(){
  var lo = 0, hi = Math.PI;
  for(var i = 0; i < 60; i++){ var m = (lo + hi)/2; if(N_ORB*Math.pow(1 + ECC*Math.cos(m), 2)/Math.pow(1 - ECC*ECC, 1.5) > W_SPIN) lo = m; else hi = m; }
  var E = 2*Math.atan(Math.sqrt((1 - ECC)/(1 + ECC))*Math.tan(lo/2)), M = E - ECC*Math.sin(E);
  return 2*M/N_ORB;
}
var dayT = document.getElementById('dayT'), dayPlay = document.getElementById('dayPlay'), dayOn = false, dayEls = null;
function clockStr(h){ var hrs = (h/(2*Math.PI)*24 + 12) % 24, hh = Math.floor(hrs), mm = Math.floor((hrs - hh)*60); return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; }
function partOfDay(h){
  var d = h/(2*Math.PI);
  if(d < 0.02 || d > 0.98) return T('noon','полдень');
  if(d < 0.23) return T('afternoon','после полудня');
  if(d < 0.27) return T('sunset','закат');
  if(d < 0.73) return T('night','ночь');
  if(d < 0.77) return T('sunrise','восход');
  return T('morning','утро');
}
function buildDay(){
  var svg = document.getElementById('daySvg'); svg.innerHTML = '';
  var sc = 150/A_ME, cx = 270, cy = 175, b = A_ME*Math.sqrt(1 - ECC*ECC);
  ns('ellipse', {cx:cx - A_ME*ECC*sc, cy:cy, rx:A_ME*sc, ry:b*sc, fill:'none', stroke:'#c9c9c1', 'stroke-width':1.2}, svg);
  ns('circle', {cx:cx, cy:cy, r:12, fill:'#e0a020'}, svg);
  txt(svg, cx + Q_ME*sc + 6, cy + 4, T('perihelion','перигелий'), 'svg-small');
  txt(svg, cx - Q2_ME*sc - 6, cy + 4, T('aphelion','афелий'), 'svg-small', 'end');
  txt(svg, 12, 18, T('Mercury enlarged; orbit to scale','Меркурий увеличен; орбита в масштабе'), 'svg-small');
  var g = ns('g', {}, svg);
  var night = ns('path', {fill:'#0b0b0c', opacity:0.75}, g);
  ns('circle', {cx:0, cy:0, r:20, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.2}, g);
  var mark = ns('line', {x1:0, y1:0, x2:20, y2:0, stroke:'#b5452a', 'stroke-width':2.5}, g);
  var dot = ns('circle', {cx:20, cy:0, r:4.5, fill:'#b5452a', stroke:'#fff', 'stroke-width':1.2}, g);
  dayEls = {svg:svg, sc:sc, cx:cx, cy:cy, g:g, night:night, mark:mark, dot:dot};
}
function drawDay(){
  if(!dayEls) buildDay();
  var t = +dayT.value, S = mercuryAt(t), E = dayEls;
  var x = E.cx + S.r*Math.cos(S.nu)*E.sc, y = E.cy - S.r*Math.sin(S.nu)*E.sc;
  E.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
  var sunDir = Math.atan2(E.cy - y, E.cx - x), a1 = sunDir + Math.PI/2, a2 = sunDir - Math.PI/2;
  E.night.setAttribute('d', 'M' + (20*Math.cos(a1)).toFixed(2) + ' ' + (20*Math.sin(a1)).toFixed(2) + ' A20 20 0 0 1 ' + (20*Math.cos(a2)).toFixed(2) + ' ' + (20*Math.sin(a2)).toFixed(2) + ' Z');
  var mx = 20*Math.cos(-S.spin), my = 20*Math.sin(-S.spin);
  E.mark.setAttribute('x2', mx.toFixed(2)); E.mark.setAttribute('y2', my.toFixed(2));
  E.dot.setAttribute('cx', mx.toFixed(2)); E.dot.setAttribute('cy', my.toFixed(2));
  document.getElementById('dayTVal').textContent = fmt(t, 1) + T(' days',' сут');
  cells(document.getElementById('dayReadout'), [
    [T('ORBITS OF THE SUN','ВИТКОВ ВОКРУГ СОЛНЦА'), fmt(t/T_ORBIT, 2)],
    [T('TURNS ON ITS AXIS','ОБОРОТОВ ВОКРУГ ОСИ'), fmt(t/T_SPIN, 2)],
    [T('LOCAL SOLAR TIME','МЕСТНОЕ СОЛНЕЧНОЕ ВРЕМЯ'), clockStr(S.hour)],
    [T('AT THE RED MARKER','У КРАСНОЙ МЕТКИ'), partOfDay(S.hour)],
    [T('SOLAR DAYS COMPLETED','ПРОШЛО СОЛНЕЧНЫХ СУТОК'), fmt(t/SOLAR_DAY, 2), true]
  ]);
  var dayMsg = S.retro
    ? T('<b>Near perihelion:</b> Mercury is moving around the Sun faster than it spins, so the Sun drifts backwards in the sky — for about ','<b>Возле перигелия:</b> Меркурий движется вокруг Солнца быстрее, чем вращается, и Солнце смещается по небу назад — примерно ') + fmt(retroDays(), 0) + T(' Earth days each orbit.',' земных суток на каждом витке.')
    : T('A Mercury day (noon to noon) lasts ','Меркурианские сутки (от полудня до полудня) длятся ') + fmt(SOLAR_DAY, 1) + T(' Earth days = 2 orbits = 3 turns.',' земных суток = 2 витка = 3 оборота.');
  var st = document.getElementById('dayStatus'); if(st.innerHTML !== dayMsg) st.innerHTML = dayMsg;
  dayT.setAttribute('aria-valuetext', fmt(t, 1) + T(' Earth days',' земных суток'));
}
dayT.addEventListener('input', drawDay);
function setPlay(on){ dayOn = on; dayPlay.setAttribute('aria-pressed', on ? 'true' : 'false'); dayPlay.classList.toggle('active', on); dayPlay.innerHTML = on ? T('❚❚ PAUSE','❚❚ ПАУЗА') : T('▶ PLAY','▶ ПУСК'); }
dayPlay.addEventListener('click', function(){ setPlay(!dayOn); });
document.getElementById('dayReset').addEventListener('click', function(){ setPlay(false); dayT.value = 0; drawDay(); });
visibleLoop(document.getElementById('daySvg'), function(dt){
  if(!dayOn) return;
  var max = +dayT.max, v = +dayT.value + dt*SOLAR_DAY/(reduced() ? 40 : 16);
  dayT.value = (v > max ? v - max : v).toFixed(1); drawDay();
});

/* ============ CH7 — FLYBY TABLE [7][10][16] ============ */
function renderFlybys(){
  var rows = [
    [T('Launch','Старт'), T('3 Aug 2004, Delta II','3 авг 2004, «Дельта II»'), T('20 Oct 2018, Ariane 5','20 окт 2018, «Ариан-5»')],
    [T('Earth flybys','Пролёты Земли'), T('2 Aug 2005','2 авг 2005'), T('10 Apr 2020','10 апр 2020')],
    [T('Venus flybys','Пролёты Венеры'), T('24 Oct 2006 · 5 Jun 2007','24 окт 2006 · 5 июн 2007'), T('15 Oct 2020 · 10 Aug 2021','15 окт 2020 · 10 авг 2021')],
    [T('Mercury flybys','Пролёты Меркурия'), T('14 Jan 2008 · 6 Oct 2008 · 29 Sep 2009','14 янв 2008 · 6 окт 2008 · 29 сен 2009'), T('1 Oct 2021 · 23 Jun 2022 · 19 Jun 2023 · 4 Sep 2024 · 1 Dec 2024 · 8 Jan 2025','1 окт 2021 · 23 июн 2022 · 19 июн 2023 · 4 сен 2024 · 1 дек 2024 · 8 янв 2025')],
    [T('Braking','Торможение'), T('flybys + 0.862 km/s chemical burn','пролёты + химический импульс 0,862 км/с'), T('flybys + ion engines, then chemical thrusters','пролёты + ионные двигатели, затем химические')],
    [T('Mercury orbit','Орбита Меркурия'), T('18 Mar 2011','18 мар 2011'), T('21 Nov 2026 (planned)','21 ноя 2026 (план)')]
  ];
  var h = '<thead><tr><th></th><th>MESSENGER</th><th>BepiColombo</th></tr></thead><tbody>';
  rows.forEach(function(r){ h += '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; });
  document.getElementById('flybyTable').innerHTML = h + '</tbody>';
}

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1965', '<b>April:</b> Arecibo radar measures Mercury\'s spin at about 59 ± 5 days. <b>November:</b> Giuseppe Colombo shows it is two-thirds of the year — the 3:2 resonance.', '<b>Апрель:</b> радар Аресибо измеряет период вращения Меркурия — около 59 ± 5 суток. <b>Ноябрь:</b> Джузеппе Коломбо показывает, что это две трети года, — резонанс 3:2.'],
  ['1974–75', 'Mariner 10: Venus gravity assist, then three Mercury flybys (29 March 1974, 21 September 1974, 16 March 1975).', '«Маринер-10»: гравитационный манёвр у Венеры, затем три пролёта Меркурия (29 марта 1974, 21 сентября 1974, 16 марта 1975).'],
  ['2004', '<b>3 August:</b> MESSENGER launches.', '<b>3 августа:</b> старт MESSENGER.'],
  ['2008–09', 'MESSENGER\'s three Mercury flybys.', 'Три пролёта Меркурия аппаратом MESSENGER.'],
  ['2011', '<b>18 March:</b> MESSENGER becomes the first Mercury orbiter.', '<b>18 марта:</b> MESSENGER становится первым искусственным спутником Меркурия.'],
  ['2013', '<b>January:</b> MESSENGER results on water ice in the north polar craters published.', '<b>Январь:</b> опубликованы данные MESSENGER о водяном льде в северных полярных кратерах.'],
  ['2015', '<b>30 April:</b> out of propellant, MESSENGER strikes Mercury.', '<b>30 апреля:</b> исчерпав топливо, MESSENGER падает на Меркурий.'],
  ['2018', '<b>20 October:</b> BepiColombo launches.', '<b>20 октября:</b> старт BepiColombo.'],
  ['2021–25', 'BepiColombo\'s six Mercury flybys; in 2024 a power fault forces a new route.', 'Шесть пролётов Меркурия аппаратом BepiColombo; в 2024 году сбой питания вынуждает сменить маршрут.'],
  ['2026', '<b>3 September:</b> transfer module separates. <b>21 November (planned):</b> orbit insertion.', '<b>3 сентября:</b> отделение перелётного модуля. <b>21 ноября (план):</b> выход на орбиту.'],
  ['2027', '<b>April (planned):</b> BepiColombo science operations begin.', '<b>Апрель (план):</b> начало научной работы BepiColombo.']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA, Mercury Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html', note:{en:'GM 22,032 km³/s², mean radius 2,439.7 km; semi-major axis 57.909, perihelion 46.000, aphelion 69.818 million km; e = 0.2056; 47.36 km/s; orbit 87.969 d; spin 1,407.6 h; day 4,222.6 h; irradiance 6.674 × Earth; surface 590–725 K sunward; obliquity 0.034°.', ru:'GM 22 032 км³/с², средний радиус 2439,7 км; большая полуось 57,909, перигелий 46,000, афелий 69,818 млн км; e = 0,2056; 47,36 км/с; год 87,969 сут; вращение 1407,6 ч; сутки 4222,6 ч; освещённость в 6,674 раза больше земной; поверхность 590–725 К на дневной стороне; наклон оси 0,034°.'}},
  {title:'NASA, Earth Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'Semi-major axis 149.598 million km; mean orbital velocity 29.78 km/s; solar irradiance 1,361 W/m².', ru:'Большая полуось 149,598 млн км; средняя орбитальная скорость 29,78 км/с; солнечная постоянная 1361 Вт/м².'}},
  {title:'ESA, “Why does it take so long to get to Mercury?”', url:'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Why_does_it_take_so_long_to_get_to_Mercury', note:{en:'Falling toward the Sun speeds a spacecraft up; the excess must be shed by flybys because thrusters alone would need too much propellant; Colombo\'s 1970 idea for Mariner 10.', ru:'Падение к Солнцу разгоняет аппарат; избыток гасят пролётами, так как одним двигателям понадобилось бы слишком много топлива; идея Коломбо 1970 года для «Маринера-10».'}},
  {title:'ESA, “Journey to Mercury”', url:'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Journey_to_Mercury', note:{en:'Reaching Mercury orbit needs more energy than a mission to Pluto; final orbits: Mio 590 × 11,640 km, MPO 480 × 1,500 km.', ru:'Выход на орбиту Меркурия требует больше энергии, чем полёт к Плутону; конечные орбиты: Mio 590 × 11 640 км, MPO 480 × 1500 км.'}},
  {title:'NASA, Sun Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note:{en:'GM = 132,712 × 10⁶ km³/s².', ru:'GM = 132 712 × 10⁶ км³/с².'}},
  {title:'NASA, Planetary Fact Sheets (Venus, Mars, Jupiter)', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note:{en:'GM, mean radius and semi-major axis used for the comparison planets.', ru:'GM, средний радиус и большая полуось для планет сравнения.'}},
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Mariner 10 (entry 144): launch, Venus gravity assist, three Mercury flybys, −183/187 °C. MESSENGER (entry 206): 1,107.9 kg, launch 3 August 2004, all six flyby dates, orbit 18 March 2011 00:45 UT, discoveries, 25 km orbits, impact 30 April 2015 at about 14,080 km/h.', ru:'«Маринер-10» (статья 144): запуск, манёвр у Венеры, три пролёта Меркурия, −183/187 °C. MESSENGER (статья 206): 1107,9 кг, старт 3 августа 2004, даты всех шести пролётов, орбита 18 марта 2011 в 00:45 UT, открытия, орбиты высотой 25 км, падение 30 апреля 2015 со скоростью около 14 080 км/ч.'}},
  {title:'NASA History (2019), “45 Years Ago: Mariner 10 First to Explore Mercury”', url:'https://www.nasa.gov/history/45-years-ago-mariner-10-first-to-explore-mercury/', note:{en:'Colombo\'s 176-day re-encounter orbit, twice Mercury\'s year; the 3:2 resonance meant the same hemisphere was lit each time, so only about 40–45% was imaged.', ru:'Орбита Коломбо с повторными встречами каждые 176 суток — дважды за год Меркурия; из-за резонанса 3:2 каждый раз освещалось одно и то же полушарие, и снято было лишь 40–45%.'}},
  {title:'JHU/APL, MESSENGER: “Spacecraft and Instruments”', url:'https://messenger.jhuapl.edu/About/Spacecraft-and-Instruments.html', note:{en:'About 600 kg of propellant, 54% of launch mass; 2.5 × 2 m ceramic-fabric sunshade, front predicted to reach 370 °C, spacecraft behind near 20 °C; radiators and diode heat pipes.', ru:'Около 600 кг топлива — 54% стартовой массы; солнцезащитный экран 2,5 × 2 м из керамической ткани, лицевая сторона — до 370 °C по расчёту, аппарат за ним — около 20 °C; радиаторы и диодные тепловые трубы.'}},
  {title:'NASA Science, MESSENGER mission page', url:'https://science.nasa.gov/mission/messenger/', note:{en:'Mission summary, flyby dates, orbit insertion, discoveries including polar deposits that are dominantly water ice, and the 30 April 2015 impact.', ru:'Сводка миссии, даты пролётов, выход на орбиту, открытия, включая полярные отложения преимущественно из водяного льда, и падение 30 апреля 2015.'}},
  {title:'JHU/APL, MESSENGER: “Orbit Insertion & Station Keeping”', url:'https://messenger.jhuapl.edu/About/stationkeeping.html', note:{en:'15-minute burn on 17 March 2011 EDT (18 March UTC), just over 0.86 km/s, about 31% of the launch propellant; 12-hour orbit; minimum altitude kept near 200 km; later 8-hour orbit of 278 × 10,314 km.', ru:'15-минутное включение 17 марта 2011 по EDT (18 марта по UTC), чуть более 0,86 км/с, около 31% стартового топлива; 12-часовая орбита; минимальная высота около 200 км; позже 8-часовая орбита 278 × 10 314 км.'}},
  {title:'JHU/APL, MESSENGER: “Mission Design”', url:'https://messenger.jhuapl.edu/About/Mission-Design.html', note:{en:'Deep-space manoeuvres DSM-1 to DSM-5: 315.6, 227.4, 72.2, 222.1 + 24.7 and 177.75 m/s (≈ 1.04 km/s in all).', ru:'Манёвры в дальнем космосе DSM-1 — DSM-5: 315,6, 227,4, 72,2, 222,1 + 24,7 и 177,75 м/с (всего ≈ 1,04 км/с).'}},
  {title:'G. H. Pettengill & R. B. Dyce (1965), “A Radar Determination of the Rotation of the Planet Mercury”, Nature 206, 1240', url:'https://doi.org/10.1038/2061240a0', note:{en:'Arecibo radar observations, April 1965; rotation period about 59 ± 5 days.', ru:'Радарные наблюдения в Аресибо, апрель 1965; период вращения около 59 ± 5 суток.'}},
  {title:'G. Colombo (1965), “Rotational Period of the Planet Mercury”, Nature 208, 575', url:'https://doi.org/10.1038/208575a0', note:{en:'Proposes a uniform rotation of 58.65 days, two-thirds of the orbital period.', ru:'Предлагает равномерное вращение с периодом 58,65 суток — две трети орбитального периода.'}},
  {title:'D. J. Lawrence et al. (2013), “Evidence for Water Ice Near Mercury\'s North Pole from MESSENGER Neutron Spectrometer Measurements”, Science 339, 292–296', url:'https://doi.org/10.1126/science.1229953', note:{en:'Hydrogen-rich deposits in permanently shadowed polar craters, consistent with water ice.', ru:'Богатые водородом отложения в вечно затенённых полярных кратерах, согласующиеся с водяным льдом.'}},
  {title:'ESA, BepiColombo factsheet', url:'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/BepiColombo_factsheet', note:{en:'Launch 20 October 2018 on Ariane 5; 4,100 kg; MPO 1,230 kg, Mio 255 kg; ESA and JAXA roles; all nine flyby dates; milestones to April 2027.', ru:'Старт 20 октября 2018 на «Ариане-5»; 4100 кг; MPO 1230 кг, Mio 255 кг; роли ЕКА и JAXA; даты всех девяти пролётов; этапы до апреля 2027.'}},
  {title:'ESA (2024), “Fourth Mercury flyby begins BepiColombo\'s new trajectory”', url:'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Fourth_Mercury_flyby_begins_BepiColombo_s_new_trajectory', note:{en:'April 2024 power fault in the transfer module; new route with arrival in November 2026; fourth flyby 4 September 2024 at about 165 km.', ru:'Сбой питания перелётного модуля в апреле 2024; новый маршрут с прибытием в ноябре 2026; четвёртый пролёт 4 сентября 2024 на высоте около 165 км.'}},
  {title:'ESA, “Latest updates: BepiColombo\'s arrival at Mercury” (checked 9 October 2026)', url:'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Latest_updates_BepiColombo_s_arrival_at_Mercury', note:{en:'Transfer module separation 3 September 2026; 11.4 m/s correction on 24 September; orbit insertion 21 November 2026; MPO–Mio separation 9–10 December; science from April 2027.', ru:'Отделение перелётного модуля 3 сентября 2026; коррекция 11,4 м/с 24 сентября; выход на орбиту 21 ноября 2026; разделение MPO и Mio 9–10 декабря; научная работа с апреля 2027.'}},
  {title:'JAXA ISAS (2021), “The BepiColombo spacecraft completes the Venus swing-bys and finally approaches Mercury”', url:'https://www.isas.jaxa.jp/en/topics/002748.html', note:{en:'Second Venus swing-by: closest approach 10 August 2021, 22:51:53 JST (13:51 UTC), at 552 km altitude.', ru:'Второй пролёт Венеры: наибольшее сближение 10 августа 2021 года в 22:51:53 по японскому времени (13:51 UTC) на высоте 552 км.'}}
];

/* ============ ACCESSIBLE NAMES (EN/RU) ============ */
var ARIA = [
  ['dvSvg', 'Bar chart: speed change to start a Hohmann transfer plus minimum capture speed change, for Venus, Mars, Mercury and Jupiter', 'Диаграмма: изменение скорости для начала гомановского перелёта и минимальный импульс захвата для Венеры, Марса, Меркурия и Юпитера'],
  ['dvPick', 'Destination', 'Цель'],
  ['capSvg', 'Braking speed change needed to enter MESSENGER\'s orbit, against arrival speed', 'Тормозной импульс для выхода на орбиту MESSENGER в зависимости от скорости прибытия'],
  ['capPre', 'Arrival presets', 'Готовые варианты прибытия'],
  ['heatSvg', 'Plate temperature against distance from the Sun, with Mercury\'s orbit marked', 'Температура пластины в зависимости от расстояния до Солнца, с отмеченной орбитой Меркурия'],
  ['daySvg', 'Mercury orbiting the Sun while spinning three times per two orbits; a red marker shows one place on the surface', 'Меркурий обращается вокруг Солнца, делая три оборота за два витка; красная метка — одна точка на поверхности']
];
function renderAria(){ ARIA.forEach(function(a){ var el = document.getElementById(a[0]); if(el) el.setAttribute('aria-label', T(a[1], a[2])); }); }

/* ============ RENDER ALL ============ */
function renderAll(){
  renderAria();
  renderDv();
  renderCap();
  renderHeat();
  drawDay(); setPlay(dayOn);
  renderFlybys();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
var DSM_MS = [315.6, 227.4, 72.2, 222.1, 24.7, 177.75];   // APL Mission Design [12]
window.__scorch = {DSM_MS:DSM_MS, hohmann:hohmann, DV_ESCAPE:DV_ESCAPE, PLANETS:PLANETS, capture:capture, captureCirc:captureCirc, vinfFromBurn:vinfFromBurn, MESS_RA:MESS_RA, R_ME:R_ME, MU_ME:MU_ME, orbitPeriodH:orbitPeriodH,
  plateT:plateT, SOLAR_DAY:SOLAR_DAY, T_SPIN:T_SPIN, T_ORBIT:T_ORBIT, mercuryAt:mercuryAt, retroDays:retroDays, Q_ME:Q_ME, Q2_ME:Q2_ME, A_ME:A_ME, AU:AU};
