/* ============ CONSTANTS ============ */
var GM_SUN = 1.32712440018e11, AU_KM = 1.495978707e8, YEAR_S = 365.25*86400, LIGHT_S_PER_AU = 499.004784;
var S_EARTH = 1361;                                              // W/m² at 1 AU [1]
/* Planets: tilt ε (deg), sidereal period (Julian years, from NSSDC days / 365.25), sunlight S (W/m²), semimajor axis (AU) [1][2] */
var PLANETS = {
  U:{eps:97.77, P:30685.4/365.25, S:3.69, a:2867.043e6/AU_KM, GM:5.7940e6, R:25559},
  N:{eps:28.32, P:60189.018/365.25, S:1.508, a:4514.953e6/AU_KM, GM:6.8351e6, R:24764},
  E:{eps:23.44, P:1, S:1361, a:1}
};

/* Daily-mean top-of-atmosphere sunlight at latitude φ for solar declination δ. */
function insol(latDeg, decRad, S){
  var p = latDeg*Math.PI/180, x = -Math.tan(p)*Math.tan(decRad), H;
  if(x >= 1) return 0;                                           // polar night
  H = x <= -1 ? Math.PI : Math.acos(x);                          // polar day: H₀ = π
  return Math.max(0, S/Math.PI*(H*Math.sin(p)*Math.sin(decRad) + Math.cos(p)*Math.cos(decRad)*Math.sin(H)));
}
/* Declination after a fraction f of the orbit since the equinox (circular orbit, even pace). */
function decl(f, epsDeg){ return Math.asin(Math.sin(epsDeg*Math.PI/180)*Math.sin(2*Math.PI*f)); }
/* Length of continuous polar day at latitude φ (same length as the polar night), in the planet's years × P. */
function polarDay(latDeg, epsDeg, P){
  var x = Math.cos(latDeg*Math.PI/180)/Math.abs(Math.sin(epsDeg*Math.PI/180));
  return x >= 1 ? 0 : P*(Math.PI - 2*Math.asin(x))/(2*Math.PI);
}
function annualMean(latDeg, epsDeg, S){
  var n = 720, s = 0; for(var i = 0; i < n; i++) s += insol(latDeg, decl((i + 0.5)/n, epsDeg), S); return s/n;
}

/* Two-body transfer from Earth's orbit (1 AU, departing along Earth's motion) out to rTarget AU. */
function transfer(vinf, rTargetAU){
  var r1 = AU_KM, r2 = rTargetAU*AU_KM, vE = Math.sqrt(GM_SUN/r1), v0 = vE + vinf;
  var e = r1*v0*v0/GM_SUN - 1, h = r1*v0, p = h*h/GM_SUN, out = {e:e, vE:vE, v0:v0, C3:vinf*vinf, p:p};
  if(Math.abs(e - 1) < 1e-9) e = 1 + 1e-9;
  if(e < 1){
    var a = r1/(1 - e); out.a = a; out.aphelion = a*(1 + e)/AU_KM;
    if(a*(1 + e) < r2){ out.reach = false; return out; }
    var E = Math.acos(Math.min(1, Math.max(-1, (1 - r2/a)/e)));
    out.tof = Math.sqrt(a*a*a/GM_SUN)*(E - e*Math.sin(E))/YEAR_S;
  } else {
    var A = r1/(e - 1); out.a = -A;
    var F = Math.acosh((r2/A + 1)/e);
    out.tof = Math.sqrt(A*A*A/GM_SUN)*(e*Math.sinh(F) - F)/YEAR_S;
  }
  out.reach = true;
  var v = Math.sqrt(GM_SUN*(2/r2 - 1/out.a)), vt = h/r2, vr = Math.sqrt(Math.max(0, v*v - vt*vt)), vP = Math.sqrt(GM_SUN/r2);
  out.vArr = v; out.vinfArr = Math.sqrt((vt - vP)*(vt - vP) + vr*vr);
  out.nuArr = Math.acos(Math.min(1, Math.max(-1, (p/r2 - 1)/e)));
  return out;
}
/* Smallest capture burn: at periapsis r_p, from the arrival hyperbola down to an orbit that only just stays bound.
   Oberth effect: it is much smaller than v∞ and grows more slowly than v∞. */
function captureDv(vinf, GM, rp){ var ve2 = 2*GM/rp; return Math.sqrt(vinf*vinf + ve2) - Math.sqrt(ve2); }
var CAPTURE_RP = 1.3;                                             // periapsis in planet radii (assumed)
function hohmannVinf(rTargetAU){ var r1 = AU_KM, r2 = rTargetAU*AU_KM; return Math.sqrt(GM_SUN/r1)*(Math.sqrt(2*r2/(r1 + r2)) - 1); }

/* Voyager 2 data rates (bit/s): expected with the 1979–81 ground system vs achieved maximum [6] */
var RATES = [
  {k:'J', en:'Jupiter', ru:'Юпитер', exp:115200, ach:115200},
  {k:'S', en:'Saturn', ru:'Сатурн', exp:29000, ach:44800},
  {k:'U', en:'Uranus', ru:'Уран', exp:9000, ach:29900},
  {k:'N', en:'Neptune', ru:'Нептун', exp:3200, ach:21600}
];
function panelArea(rAU, watts, eff){ return watts/(S_EARTH/(rAU*rAU)*eff); }
function lightHours(rAU){ return rAU*LIGHT_S_PER_AU/3600; }

/* Encounter geometry (km) [1][2][5][16][17] */
var ENC = {
  U:{R:25559, alt:81500, moonA:129900, moonR:235, moonEn:'Miranda', moonRu:'Миранда', date:'1986-01-24 17:59 UT'},
  N:{R:24764, alt:4800, moonA:354760, moonR:1353, moonEn:'Triton', moonRu:'Тритон', date:'1989-08-25 03:56 UT'}
};

/* ============ CH1 — SEASONS ============ */
var seaP = 'U', seaLat = document.getElementById('seaLat'), seaT = document.getElementById('seaT');
function yrsStr(y){ return y >= 2 ? fmt(y, 1) + T(' years',' года') : fmtInt(y*365.25) + T(' days',' сут'); }
function renderSea(){
  var P = PLANETS[seaP], lat = +seaLat.value, f = +seaT.value, d = decl(f, P.eps), q = insol(lat, d, P.S);
  document.getElementById('seaLatVal').textContent = fmtInt(lat) + '°';
  document.getElementById('seaTVal').textContent = yrsStr(f*P.P) + ' (' + fmtInt(f*100) + ' %)';
  var svg = document.getElementById('seaSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T('Daily-mean sunlight at the chosen latitude through one orbit','Среднесуточная освещённость на выбранной широте за один оборот'));
  var L = 56, R = 465, Tp = 26, B = 250, n = 360, qs = [], qmax = 0, i;
  for(i = 0; i <= n; i++){ qs.push(insol(lat, decl(i/n, P.eps), P.S)); qmax = Math.max(qmax, qs[i]); }
  var top = P.S*Math.abs(Math.sin(P.eps*Math.PI/180))*1.08;      // fixed per planet: the pole at solstice is the brightest day
  function X(fr){ return L + fr*(R - L); }
  function Y(v){ return B - v/top*(B - Tp); }
  for(i = 0; i <= 4; i++){ var v = top*i/4; ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, fmt(v, P.S < 10 ? 2 : 0), 'svg-small', 'end'); }
  // night shading where q = 0
  for(i = 0; i < n; i++) if(qs[i] === 0 && qs[i + 1] === 0) ns('rect', {x:X(i/n), y:Tp, width:(R - L)/n + 0.5, height:B - Tp, fill:'#0b0b0c', opacity:0.08}, svg);
  [0, 0.25, 0.5, 0.75, 1].forEach(function(fr){ txt(svg, X(fr), B + 14, fmt(fr*P.P, P.P < 2 ? 2 : 0), 'svg-small', 'middle'); });
  txt(svg, R, B + 30, T('years since equinox','лет после равноденствия'), 'svg-small', 'end');
  txt(svg, L, 14, T('daily-mean sunlight, W/m²','среднесуточная освещённость, Вт/м²'), 'svg-small');
  var dpath = ''; for(i = 0; i <= n; i++) dpath += (i ? 'L' : 'M') + X(i/n).toFixed(1) + ' ' + Y(qs[i]).toFixed(1);
  ns('path', {d:dpath, fill:'none', stroke:'#a8741a', 'stroke-width':2}, svg);
  var am = annualMean(lat, P.eps, P.S);
  ns('line', {x1:L, y1:Y(am), x2:R, y2:Y(am), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(am) - 4, T('orbit average','среднее за оборот'), 'svg-small', 'end');
  ns('line', {x1:X(f), y1:Tp, x2:X(f), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  ns('circle', {cx:X(f), cy:Y(q), r:5, fill:'#b5452a'}, svg);
  var pd = polarDay(lat, P.eps, P.P), am0 = annualMean(0, P.eps, P.S), am90 = annualMean(90, P.eps, P.S);
  cells(document.getElementById('seaReadout'), [
    [T('SUNLIGHT NOW','ОСВЕЩЁННОСТЬ СЕЙЧАС'), fmt(q, P.S < 10 ? 3 : 0) + T(' W/m²',' Вт/м²')],
    [T('SUN\'S DECLINATION','СКЛОНЕНИЕ СОЛНЦА'), fmt(d*180/Math.PI, 1) + '°'],
    [T('CONTINUOUS DAY (AND NIGHT)','НЕПРЕРЫВНЫЙ ДЕНЬ (И НОЧЬ)'), pd > 0 ? yrsStr(pd) : T('none','нет')],
    [T('POLE vs EQUATOR, ORBIT AVERAGE','ПОЛЮС К ЭКВАТОРУ, СРЕДНЕЕ ЗА ОБОРОТ'), fmt(am90/am0, 2) + ' ×']
  ]);
  hud1.textContent = fmt(q, P.S < 10 ? 2 : 0) + T(' W/m²',' Вт/м²');
  var xh = -Math.tan(lat*Math.PI/180)*Math.tan(d);
  document.getElementById('seaStatus').innerHTML = xh >= 1
    ? T('Polar night: here it lasts ','Полярная ночь: здесь она длится ') + yrsStr(pd) + '.'
    : xh <= -1 ? T('Polar day: the Sun circles the sky without setting, for ','Полярный день: Солнце ходит по небу, не заходя, ') + yrsStr(pd) + '.'
    : T('Ordinary days and nights at this point in the orbit.','В этой точке орбиты — обычная смена дня и ночи.');
}
seaLat.addEventListener('input', renderSea); seaT.addEventListener('input', renderSea);
Array.prototype.forEach.call(document.querySelectorAll('#seaPre .btn'), function(btn){ btn.addEventListener('click', function(){ seaP = this.getAttribute('data-p'); pressGroup(this.parentNode, this); renderSea(); }); });

/* ============ CH2 — FAR AND DIM ============ */
var farR = document.getElementById('farR');
function renderFar(){
  var r = +farR.value, S = S_EARTH/(r*r);
  document.getElementById('farRVal').textContent = fmt(r, r < 10 ? 2 : 1) + T(' AU',' а.е.');
  var svg = document.getElementById('farSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T('Voyager 2 data rates at each planet: expected with the 1979–81 ground system and achieved maximum','Скорости передачи «Вояджера-2» у каждой планеты: ожидаемые с наземными средствами 1979–1981 гг. и достигнутый максимум'));
  var L = 70, R = 465, Tp = 34, B = 236, lmin = 3, lmax = Math.log10(200000);
  function Y(v){ return B - (Math.log10(v) - lmin)/(lmax - lmin)*(B - Tp); }
  [1000, 10000, 100000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, fmtInt(v), 'svg-small', 'end'); });
  txt(svg, L, 14, T('Voyager 2 data rate, bit/s (log scale) [6]','скорость передачи «Вояджера-2», бит/с (лог. шкала) [6]'), 'svg-small');
  var w = (R - L)/RATES.length;
  RATES.forEach(function(q, i){
    var xc = L + (i + 0.5)*w;                                      // dots on a log axis (bar length would mean nothing here)
    ns('line', {x1:xc, y1:Y(q.exp), x2:xc, y2:Y(q.ach), stroke:'#8f8f88', 'stroke-width':1.5}, svg);
    ns('circle', {cx:xc, cy:Y(q.exp), r:5, fill:'#fff', stroke:'#77776f', 'stroke-width':2}, svg);
    ns('circle', {cx:xc, cy:Y(q.ach), r:5, fill:'#2f5aa1'}, svg);
    txt(svg, xc, B + 14, T(q.en, q.ru), 'svg-small', 'middle');
    if(q.ach > q.exp) txt(svg, xc + 9, (Y(q.ach) + Y(q.exp))/2 + 3, '×' + fmt(q.ach/q.exp, 1), 'svg-small');
  });
  ns('circle', {cx:L + 5, cy:B + 31, r:4.5, fill:'#fff', stroke:'#77776f', 'stroke-width':2}, svg); txt(svg, L + 14, B + 35, T('expected with the 1979–81 ground system [6]','ожидалось с наземными средствами 1979–1981 гг. [6]'), 'svg-small');
  ns('circle', {cx:L + 5, cy:B + 47, r:4.5, fill:'#2f5aa1'}, svg); txt(svg, L + 14, B + 51, T('achieved maximum (arraying, upgrades) [6]','достигнутый максимум (объединение антенн, модернизация) [6]'), 'svg-small');
  cells(document.getElementById('farReadout'), [
    [T('SUNLIGHT','ОСВЕЩЁННОСТЬ'), fmt(S, S < 10 ? 2 : 0) + T(' W/m²',' Вт/м²')],
    [T('vs. EARTH','ОТНОСИТЕЛЬНО ЗЕМЛИ'), r < 1.01 ? '1' : '1/' + fmtInt(r*r)],
    [T('PANELS FOR 350 W','БАТАРЕИ НА 350 Вт'), fmt(panelArea(r, 350, 0.3), r < 3 ? 1 : 0) + T(' m²',' м²')],
    [T('LIGHT TIME, ONE WAY','ВРЕМЯ ПРОХОЖДЕНИЯ СИГНАЛА В ОДНУ СТОРОНУ'), lightHours(r) < 1 ? fmt(lightHours(r)*60, 1) + T(' min',' мин') : fmt(lightHours(r), 2) + T(' h',' ч')]
  ]);
  document.getElementById('farStatus').innerHTML = r > 15
    ? T('A question sent from Earth gets its answer back after ','Вопрос, отправленный с Земли, получит ответ через ') + fmt(2*lightHours(r), 1) + T(' hours at the earliest — far too late to steer a fast flyby from the ground.',' ч в лучшем случае — слишком поздно, чтобы управлять быстрым пролётом с Земли.')
    : T('Sunlight is still strong enough here for large solar arrays.','Здесь солнечного света ещё хватает для больших солнечных батарей.');
}
farR.addEventListener('input', function(){ pressGroup(document.getElementById('farPre'), null); renderFar(); });
Array.prototype.forEach.call(document.querySelectorAll('#farPre .btn'), function(btn){ btn.addEventListener('click', function(){ farR.value = this.getAttribute('data-r'); pressGroup(this.parentNode, this); renderFar(); }); });

/* ============ CH3 — ENCOUNTER TO SCALE ============ */
var encP = 'U';
function renderEnc(){
  var g = ENC[encP], svg = document.getElementById('encSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T('Voyager 2\'s closest approach drawn to scale with the planet and a moon\'s orbit','Наибольшее сближение «Вояджера-2» в масштабе с планетой и орбитой спутника'));
  var cx = 200, cy = 160, sc = 140/g.moonA, rp = g.R*sc, rca = (g.R + g.alt)*sc;
  ns('circle', {cx:cx, cy:cy, r:g.moonA*sc, fill:'none', stroke:'#8a8a82', 'stroke-dasharray':'3 3'}, svg);
  ns('circle', {cx:cx + g.moonA*sc*Math.cos(-0.6), cy:cy + g.moonA*sc*Math.sin(-0.6), r:Math.max(2.5, g.moonR*sc), fill:'#8a8a82'}, svg);
  txt(svg, cx + g.moonA*sc*Math.cos(-0.6) + 8, cy + g.moonA*sc*Math.sin(-0.6), T(g.moonEn, g.moonRu), 'svg-small');
  ns('circle', {cx:cx, cy:cy, r:rp, fill: encP === 'U' ? '#bfe0e0' : '#9db7e6', stroke:'#0b0b0c'}, svg);
  // schematic flyby path, tangent to the closest-approach circle
  ns('line', {x1:cx - 190, y1:cy - rca, x2:cx + 250, y2:cy - rca, stroke:'#b5452a', 'stroke-width':1.8}, svg);
  ns('circle', {cx:cx, cy:cy - rca, r:4, fill:'#b5452a'}, svg);
  ns('line', {x1:cx, y1:cy, x2:cx, y2:cy - rca, stroke:'#b5452a', 'stroke-dasharray':'2 2'}, svg);
  txt(svg, cx + 8, cy - rca - 12, T('Voyager 2, closest approach','«Вояджер-2», наибольшее сближение'), 'svg-small svg-halo');
  txt(svg, 10, 312, T('to scale: planet, closest approach, moon orbit','в масштабе: планета, сближение, орбита спутника'), 'svg-small');
  var dc = g.R + g.alt;
  cells(document.getElementById('encReadout'), [
    [T('DATE','ДАТА'), g.date],
    [T('ABOVE THE CLOUDS','НАД ОБЛАКАМИ'), fmtInt(g.alt) + T(' km',' км')],
    [T('FROM THE CENTRE','ОТ ЦЕНТРА'), fmt(dc/g.R, 2) + T(' planet radii',' радиуса планеты')],
    [T('MOON ORBIT','ОРБИТА СПУТНИКА'), fmtInt(g.moonA) + T(' km',' км')]
  ]);
  document.getElementById('encStatus').innerHTML = dc < g.moonA
    ? (encP === 'U' ? T('Voyager passed inside Miranda\'s orbit, about 4 planet radii from the centre.','«Вояджер» прошёл внутри орбиты Миранды, примерно в 4 радиусах планеты от центра.')
                    : T('Just above the cloud tops: the closest of Voyager 2\'s four planetary flybys.','Над самыми облаками: ближайший из четырёх планетных пролётов «Вояджера-2».'))
    : '';
}
Array.prototype.forEach.call(document.querySelectorAll('#encPre .btn'), function(btn){ btn.addEventListener('click', function(){ encP = this.getAttribute('data-p'); pressGroup(this.parentNode, this); renderEnc(); }); });

/* ============ CH5 — TRANSFER ============ */
var trP = 'U', trV = document.getElementById('trV');
function renderTr(){
  var P = PLANETS[trP], vinf = +trV.value, hv = hohmannVinf(P.a);
  if(Math.abs(vinf - hv) < 0.006) vinf = hv + 1e-7;            // the slider's 0.01 steps snap onto the exact Hohmann speed
  var t = transfer(vinf, P.a);
  document.getElementById('trVVal').textContent = fmt(vinf, 2) + T(' km/s',' км/с');
  var svg = document.getElementById('trSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T('Transfer orbit from Earth to the chosen planet for the chosen departure speed','Траектория перелёта от Земли к выбранной планете при выбранной скорости старта'));
  var cx = 240, cy = 190, sc = 160/(P.a*1.04);
  ns('circle', {cx:cx, cy:cy, r:P.a*sc, fill:'none', stroke:'#8a8a82'}, svg);
  ns('circle', {cx:cx, cy:cy, r:5.2*sc, fill:'none', stroke:'#e4e4de', 'stroke-dasharray':'3 3'}, svg);
  ns('circle', {cx:cx, cy:cy, r:Math.max(2, sc), fill:'none', stroke:'#2f5aa1'}, svg);
  ns('circle', {cx:cx, cy:cy, r:3, fill:'#a8741a'}, svg);
  txt(svg, cx + 5.2*sc*0.72, cy + 5.2*sc*0.72 + 10, T('Jupiter\'s orbit','орбита Юпитера'), 'svg-small');
  txt(svg, cx - P.a*sc, cy + P.a*sc + 14, T(trP === 'U' ? 'Uranus\'s orbit' : 'Neptune\'s orbit', trP === 'U' ? 'орбита Урана' : 'орбита Нептуна'), 'svg-small');
  // path: r(ν) = p/(1 + e cos ν), departing at ν = 0 on the +x axis, moving counter-clockwise (up on screen)
  var nuEnd = t.reach ? t.nuArr : Math.PI, d = '';
  for(var i = 0; i <= 200; i++){ var nu = nuEnd*i/200, rr = t.p/(1 + t.e*Math.cos(nu))/AU_KM; d += (i ? 'L' : 'M') + (cx + rr*sc*Math.cos(nu)).toFixed(1) + ' ' + (cy - rr*sc*Math.sin(nu)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  if(t.reach){ var ra = P.a; ns('circle', {cx:cx + ra*sc*Math.cos(nuEnd), cy:cy - ra*sc*Math.sin(nuEnd), r:5, fill:'#b5452a'}, svg); }
  var rows = [[T('LAUNCH ENERGY C3','ЭНЕРГИЯ ЗАПУСКА C3'), fmtInt(t.C3) + T(' km²/s²',' км²/с²')]];
  if(t.reach){
    rows.push([T('FLIGHT TIME','ВРЕМЯ ПОЛЁТА'), fmt(t.tof, 1) + T(' years',' года')]);
    rows.push([T('ARRIVAL SPEED vs PLANET','СКОРОСТЬ ОТНОСИТЕЛЬНО ПЛАНЕТЫ'), fmt(t.vinfArr, 1) + T(' km/s',' км/с')]);
    rows.push([T('SMALLEST CAPTURE BURN','МИНИМАЛЬНЫЙ ТОРМОЗНОЙ ИМПУЛЬС'), fmt(captureDv(t.vinfArr, P.GM, CAPTURE_RP*P.R), 2) + T(' km/s',' км/с')]);
    rows.push([T('PATH','ТРАЕКТОРИЯ'), t.e < 1 ? T('ellipse, e = ','эллипс, e = ') + fmt(t.e, 3) : T('escapes the Sun, e = ','уходит от Солнца, e = ') + fmt(t.e, 3)]);
    hud2.textContent = fmt(t.tof, 1) + T(' yr',' года');
  } else {
    rows.push([T('HIGHEST POINT','ДАЛЬНЯЯ ТОЧКА'), fmt(t.aphelion, 1) + T(' AU',' а.е.')]);
    rows.push([T('NEEDED AT LEAST','НУЖНО НЕ МЕНЕЕ'), fmt(hv, 2) + T(' km/s',' км/с')]);
    hud2.textContent = '—';
  }
  cells(document.getElementById('trReadout'), rows);
  document.getElementById('trStatus').innerHTML = !t.reach
    ? T('Falls short: the orbit turns back before reaching the planet.','Не хватает: орбита разворачивается, не дойдя до планеты.')
    : Math.abs(vinf - hv) < 0.006 ? T('About the Hohmann minimum: the slowest, cheapest way there.','Около гомановского минимума: самый медленный и дешёвый путь.')
    : T('Faster than Hohmann: ','Быстрее гомановского: ') + fmt(transfer(hv + 1e-7, P.a).tof - t.tof, 1) + T(' years saved, but ',' года экономии, но прибытие на ') + fmt(t.vinfArr - transfer(hv + 1e-7, P.a).vinfArr, 1) + T(' km/s faster on arrival (more braking needed to enter orbit: ',' км/с быстрее (нужно сильнее тормозить для выхода на орбиту: ') + fmt(captureDv(t.vinfArr, P.GM, CAPTURE_RP*P.R), 2) + T(' vs ',' вместо ') + fmt(captureDv(transfer(hv + 1e-7, P.a).vinfArr, P.GM, CAPTURE_RP*P.R), 2) + T(' km/s).',' км/с).');
}
trV.addEventListener('input', renderTr);
Array.prototype.forEach.call(document.querySelectorAll('#trPre .btn'), function(btn){ btn.addEventListener('click', function(){ trP = this.getAttribute('data-p'); trV.value = (Math.ceil(hohmannVinf(PLANETS[trP].a)*100)/100).toFixed(2); pressGroup(this.parentNode, this); renderTr(); }); });

/* ============ CH7 — TIMELINE ============ */
var TIMELINE = [
  ['1977', '<b>20 August:</b> Voyager 2 launched from Cape Canaveral [5].', '<b>20 августа:</b> запуск «Вояджера-2» с мыса Канаверал [5].'],
  ['1986', '<b>24 January:</b> Voyager 2 passes 81,500 km above Uranus: 10 new moons, 2 new rings, a tilted, off-centre magnetic field [5].', '<b>24 января:</b> «Вояджер-2» проходит в 81 500 км над Ураном: 10 новых спутников, 2 новых кольца, наклонённое и смещённое магнитное поле [5].'],
  ['1989', '<b>25 August:</b> Voyager 2 passes about 4,800 km over the cloud tops near Neptune\'s north pole; the Great Dark Spot and Triton\'s plumes are seen [4][5][8].', '<b>25 августа:</b> «Вояджер-2» проходит примерно в 4800 км над облаками у северного полюса Нептуна; замечены Большое тёмное пятно и шлейфы Тритона [4][5][8].'],
  ['1994', 'Hubble images show the Great Dark Spot has vanished [10].', 'Снимки «Хаббла» показывают, что Большое тёмное пятно исчезло [10].'],
  ['2007', '<b>December:</b> Uranus passes equinox; the whole planet is lit as the Sun crosses its equator [19].', '<b>Декабрь:</b> Уран проходит равноденствие; Солнце пересекает экватор и освещает всю планету [19].'],
  ['2022', '<b>April:</b> the planetary Decadal Survey (2023–2032) ranks a Uranus Orbiter and Probe the top new flagship [12][20].', '<b>Апрель:</b> Десятилетний обзор планетологии (2023–2032) ставит Uranus Orbiter and Probe на первое место среди новых флагманских миссий [12][20].'],
  ['2024', '<b>November:</b> re-analysis shows Voyager met Uranus during a rare solar-wind squeeze [7].', '<b>Ноябрь:</b> повторный анализ показывает, что «Вояджер» встретил Уран во время редкого сжатия солнечным ветром [7].'],
  ['2025', '<b>August:</b> Webb\'s 29th Uranian moon, found in images taken on 2 February, is announced [11].', '<b>Август:</b> объявлено об открытии «Уэббом» 29-го спутника Урана по снимкам от 2 февраля [11].'],
  ['2026', '<b>January:</b> Congress funds mission formulation with $10 million [14]. <b>June:</b> concept update moves launch to 2035–2040 [13]. <b>September:</b> stopgap funding through 11 December [18].', '<b>Январь:</b> Конгресс выделяет 10 млн долларов на проработку миссии [14]. <b>Июнь:</b> обновлённая концепция переносит запуск на 2035–2040 годы [13]. <b>Сентябрь:</b> временное финансирование до 11 декабря [18].']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA NSSDC, “Uranus Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html', note:{en:'Semimajor axis 2,867.043 × 10⁶ km; sidereal period 30,685.4 days; obliquity 97.77°; solar irradiance 3.69 W/m²; equatorial radius 25,559 km; e = 0.0469.', ru:'Большая полуось 2867,043 × 10⁶ км; сидерический период 30 685,4 сут; наклон оси 97,77°; солнечная освещённость 3,69 Вт/м²; экваториальный радиус 25 559 км; e = 0,0469.'}},
  {title:'NASA NSSDC, “Neptune Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html', note:{en:'Semimajor axis 4,514.953 × 10⁶ km; sidereal period 60,189.018 days; obliquity 28.32°; solar irradiance 1.508 W/m²; equatorial radius 24,764 km.', ru:'Большая полуось 4514,953 × 10⁶ км; сидерический период 60 189,018 сут; наклон оси 28,32°; солнечная освещённость 1,508 Вт/м²; экваториальный радиус 24 764 км.'}},
  {title:'NASA Science, “Uranus: Facts”', url:'https://science.nasa.gov/uranus/facts/', note:{en:'Tilt 97.77°; 84-year orbit; each pole has a 21-year dark winter; magnetic axis tilted nearly 60° from the rotation axis.', ru:'Наклон 97,77°; оборот 84 года; на каждом полюсе 21-летняя тёмная зима; магнитная ось наклонена почти на 60° к оси вращения.'}},
  {title:'NASA Science, “Neptune: Facts”', url:'https://science.nasa.gov/neptune/facts/', note:{en:'Winds over 1,200 mph (about 2,000 km/h); the 1989 Great Dark Spot was large enough to contain Earth; Earth\'s sunlight about 900 times brighter.', ru:'Ветры более 1200 миль/ч (около 2000 км/ч); Большое тёмное пятно 1989 года вместило бы Землю; свет на Земле примерно в 900 раз ярче.'}},
  {title:'NASA Science, “Voyager 2”', url:'https://science.nasa.gov/mission/voyager/voyager-2/', note:{en:'Launch 20 Aug 1977; Uranus closest approach 24 Jan 1986, 17:59 UT, 81,500 km, 10 new moons, 2 new rings; Neptune 25 Aug 1989, 03:56 UT, about 4,800 km, the closest of its four flybys.', ru:'Старт 20 авг. 1977; наибольшее сближение с Ураном 24 янв. 1986, 17:59 UT, 81 500 км, 10 новых спутников, 2 новых кольца; Нептун 25 авг. 1989, 03:56 UT, около 4800 км — ближайший из четырёх пролётов.'}},
  {title:'R. Ludwig, J. Taylor (2002), “Voyager Telecommunications”, DESCANSO Design and Performance Summary Series, JPL', url:'https://descanso.jpl.nasa.gov/DPSummary/Descanso4--Voyager_new.pdf', note:{en:'Table 6-1: expected vs achieved maximum rates — Jupiter 115,200; Saturn ~29,000 / 44,800; Uranus ~9,000 / 29,900; Neptune ~3,200 / 21,600 bit/s; 64 → 70 m upgrade, Parkes and VLA arraying.', ru:'Табл. 6-1: ожидаемые и достигнутые максимальные скорости — Юпитер 115 200; Сатурн ~29 000 / 44 800; Уран ~9000 / 29 900; Нептун ~3200 / 21 600 бит/с; модернизация 64 → 70 м, объединение с Парксом и VLA.'}},
  {title:'NASA JPL (2024), “Mining Old Data From NASA\'s Voyager 2 Solves Several Uranus Mysteries”, 11 November 2024', url:'https://www.jpl.nasa.gov/news/mining-old-data-from-nasas-voyager-2-solves-several-uranus-mysteries/', note:{en:'A solar wind event compressed the magnetosphere just before the flyby; “conditions that only occur about 4% of the time” (J. Jasinski, Nature Astronomy); moons may be geologically active.', ru:'Событие солнечного ветра сжало магнитосферу перед пролётом; «условия, которые бывают лишь около 4 % времени» (Дж. Ясински, Nature Astronomy); спутники могут быть геологически активны.'}},
  {title:'L. A. Soderblom et al. (1990), “Triton\'s geyser-like plumes: Discovery and basic characterization”, Science 250, 410–415', url:'https://pubs.usgs.gov/publication/70015940', note:{en:'At least four active plumes; the two best documented rise as columns to about 8 km, with clouds trailing more than 100 km downwind.', ru:'Не менее четырёх активных шлейфов; два лучше всего изученных поднимаются столбами примерно на 8 км, облака тянутся по ветру более чем на 100 км.'}},
  {title:'NASA Science, “Triton”', url:'https://science.nasa.gov/neptune/moons/triton/', note:{en:'Diameter 2,700 km; the only large moon orbiting opposite to its planet\'s rotation; probably a captured Kuiper Belt object; Voyager 2 measured −235 °C and found active geysers.', ru:'Диаметр 2700 км; единственный крупный спутник, обращающийся против вращения планеты; вероятно, захваченный объект пояса Койпера; «Вояджер-2» измерил −235 °C и нашёл активные гейзеры.'}},
  {title:'NASA Science, “Hubble Tracks the Lifecycle of Giant Storms on Neptune”', url:'https://science.nasa.gov/missions/hubble/hubble-tracks-the-lifecycle-of-giant-storms-on-neptune/', note:{en:'Hubble images in 1994 showed that the Great Dark Spot and a second dark spot seen by Voyager 2 had vanished.', ru:'Снимки «Хаббла» 1994 года показали, что Большое тёмное пятно и второе тёмное пятно, увиденные «Вояджером-2», исчезли.'}},
  {title:'NASA Science (2025), “New Moon Discovered Orbiting Uranus Using NASA\'s Webb Telescope”, 19 August 2025', url:'https://science.nasa.gov/blogs/webb/2025/08/19/new-moon-discovered-orbiting-uranus-using-nasas-webb-telescope/', note:{en:'S/2025 U1, seen on 2 February 2025, about 10 km across, brings the known count to 29; likely too small for Voyager 2.', ru:'S/2025 U1, замечен 2 февраля 2025 года, около 10 км в поперечнике, доводит число известных спутников до 29; вероятно, слишком мал для «Вояджера-2».'}},
  {title:'National Academies of Sciences, Engineering, and Medicine (2023), “Origins, Worlds, and Life: A Decadal Strategy for Planetary Science and Astrobiology 2023–2032”', url:'https://nap.nationalacademies.org/catalog/26522/origins-worlds-and-life-a-decadal-strategy-for-planetary-science-and-astrobiology-2023-2032', note:{en:'The planetary Decadal Survey; released 19 April 2022 (NAP catalogue year 2023); its 2021 Uranus Orbiter and Probe concept study assumed a 2031–2032 launch with a Jupiter gravity assist and about 13 years of flight.', ru:'Десятилетний обзор планетологии; опубликован 19 апреля 2022 года (в каталоге NAP — 2023); концептуальное исследование Uranus Orbiter and Probe 2021 года предполагало старт в 2031–2032 годах с гравитационным манёвром у Юпитера и около 13 лет полёта.'}},
  {title:'A. A. Simon et al. (2026), “Uranus Orbiter and Probe: Mission Challenges and Concept Updates Since the Origins, Worlds, and Life Decadal Survey”, Planetary Science Journal 7, 143', url:'https://doi.org/10.3847/PSJ/ae680c', note:{en:'Highest-priority new flagship; no Jupiter alignment for launches after 2033 through 2044; Hohmann ~16–17 yr, SEP ~12–14 yr, Starship as few as 10 yr; launches 2035–2040 after a project start no earlier than 2027; two Next Gen RTGs, 350 W end of mission (2021: three RTGs, ~708 W at launch, ~530 W end of mission); 19.5 kbit/s Ka; 13–15 Gbit per ~34-day orbit; probe entry 50 g (was 110 g).', ru:'Высший приоритет среди новых флагманских миссий; Юпитер не в нужном положении для запусков после 2033 г. и до 2044 г.; Гоман ~16–17 лет, СЭДУ ~12–14 лет, Starship — от 10 лет; запуски 2035–2040 после начала проекта не ранее 2027 г.; два РИТЭГа Next Gen, 350 Вт в конце миссии (2021: три РИТЭГа, ~708 Вт при старте, ~530 Вт в конце миссии); 19,5 кбит/с в Ka; 13–15 Гбит за виток ~34 сут; перегрузка зонда 50 g (было 110 g).'}},
  {title:'The Planetary Society (2026), “You just saved NASA\'s budget”, 15 January 2026', url:'https://www.planetary.org/articles/advocacy-success-fy2026-nasa-budget', note:{en:'FY2026 table: Uranus Orbiter & Probe — White House request “Delayed Indefinitely”, enacted $10.0 million.', ru:'Таблица 2026 ф. г.: Uranus Orbiter & Probe — запрос Белого дома «отложено на неопределённый срок», принято 10,0 млн долларов.'}},
  {title:'The Planetary Society (2026), “House Appropriators advance key NASA funding bill”, 14 May 2026', url:'https://www.planetary.org/articles/house-appropriators-advance-key-nasa-funding-bill', note:{en:'FY2027: request $0.0; House bill “Supported” with no amount set aside; the mission “was first funded in the minibus that passed in January”.', ru:'2027 ф. г.: запрос 0,0; законопроект Палаты — «поддержано» без выделенной суммы; миссия «впервые получила финансирование в пакете, принятом в январе».'}},
  {title:'NASA NSSDC, “Uranian Satellite Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/uraniansatfact.html', note:{en:'Miranda: semimajor axis 129,900 km, radius about 235 km.', ru:'Миранда: большая полуось 129 900 км, радиус около 235 км.'}},
  {title:'NASA NSSDC, “Neptunian Satellite Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptuniansatfact.html', note:{en:'Triton: semimajor axis 354,760 km, radius 1,353.4 km, inclination 157.3° (retrograde).', ru:'Тритон: большая полуось 354 760 км, радиус 1353,4 км, наклонение 157,3° (обратное движение).'}},
  {title:'SpacePolicyOnline (2026), “House Clears FY2027 CR, Now to the President”, updated 3 September 2026', url:'https://spacepolicyonline.com/news/house-clears-fy2027-cr-now-to-the-president/', note:{en:'Continuing resolution through 11 December 2026, signed 2 September; keeps NASA at its FY2026 level of $24.4 billion.', ru:'Временный закон о финансировании до 11 декабря 2026, подписан 2 сентября; сохраняет NASA на уровне 2026 ф. г. — 24,4 млрд долларов.'}},
  {title:'NASA Science, “Uranus: Exploration”', url:'https://science.nasa.gov/uranus/exploration/', note:{en:'Voyager 2 gathered much of its key data in about six hours; Uranus reached equinox in December 2007.', ru:'«Вояджер-2» собрал основную часть ключевых данных примерно за шесть часов; Уран прошёл равноденствие в декабре 2007 года.'}},
  {title:'SpacePolicyOnline (2022), “Decadal Survey: After Europa and Mars Sample Return — Uranus”, 19 April 2022', url:'https://spacepolicyonline.com/news/decadal-survey-after-europa-and-mars-sample-return-uranus/', note:{en:'The planetary Decadal Survey was released on 19 April 2022 and ranked the Uranus Orbiter and Probe as the next flagship.', ru:'Десятилетний обзор планетологии опубликован 19 апреля 2022 года и поставил Uranus Orbiter and Probe следующей флагманской миссией.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderSea(); renderFar(); renderEnc(); renderTr();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__tilt = {captureDv:captureDv, CAPTURE_RP:CAPTURE_RP, insol:insol, decl:decl, polarDay:polarDay, annualMean:annualMean, transfer:transfer, hohmannVinf:hohmannVinf,
  panelArea:panelArea, lightHours:lightHours, PLANETS:PLANETS, RATES:RATES, ENC:ENC, GM_SUN:GM_SUN, AU_KM:AU_KM, YEAR_S:YEAR_S};
