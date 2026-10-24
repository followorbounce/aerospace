/* ============ CONSTANTS ============ */
var MU = 398600.4418e9, RE_M = 6371e3, G0 = 9.80665;               /* NASA Earth fact sheet [10] */
var MPH = 0.44704, FT = 0.3048, NMI = 1852, SMI = 1609.344;
function periodMin(perKm, apoKm){ var a = RE_M + (perKm + apoKm)/2*1000; return 2*Math.PI*Math.sqrt(a*a*a/MU)/60; }
/* local digit grouping: in Russian, four-digit numbers stay unspaced */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }

/* ============ CH1 — FREE FALL ON A SOUNDING ROCKET ============ */
/* time spent above a given height on a ballistic arc with apogee h_apo (no drag): 2√(2Δh/g) */
function freeFallMin(apoKm, aboveKm){ var g = MU/Math.pow(RE_M + aboveKm*1000, 2); return 2*Math.sqrt(2*(apoKm - aboveKm)*1000/g)/60; }

/* ============ CH2 — SPUTNIK 2 CABIN HEAT BALANCE ============ */
/* One-node model: C dT/dt = Q_dog + Q_eq + Q_sun(t) − UA (T − T_s). All parameters are assumptions (see the note),
   chosen so that the as-flown case passes 40 °C during the fourth orbit, as the published outcome requires [4][7]. */
var HEAT = {C:30000, Ts:0, T0:18, Qeq:15, fsun:0.65, P:periodMin(212, 1660)*60,
  cfg:{flown:{UA:1.5, Qsun:60}, alone:{UA:2.6, Qsun:15}}};
/* a resting mammal's heat output, Kleiber's 70 M^0.75 kcal/day, in watts */
function kleiberW(kg){ return 70*Math.pow(kg, 0.75)*4184/86400; }
function heatRun(cfg, UA, Qdog, hours){
  var c = HEAT.cfg[cfg], T = HEAT.T0, t = 0, dt = 10, tEnd = (hours || 10)*3600, cross = null, pts = [[0, T]], T7 = null;
  while(t < tEnd){
    var sun = ((t % HEAT.P)/HEAT.P) < HEAT.fsun ? 1 : 0;
    T += (Qdog + HEAT.Qeq + c.Qsun*sun - UA*(T - HEAT.Ts))/HEAT.C*dt; t += dt;
    if(cross === null && T >= 40) cross = t/3600;
    if(t % 120 === 0) pts.push([t/3600, T]);
    if(t === 7*3600) T7 = T;
  }
  return {pts:pts, cross:cross, T7:T7, Tend:T, Teq:HEAT.Ts + (Qdog + HEAT.Qeq + c.Qsun*HEAT.fsun)/UA, tau:HEAT.C/UA/3600};
}
function orbitAt(h){ return Math.floor(h*3600/HEAT.P) + 1; }

/* ============ CH4 — A BALLISTIC CAPSULE FROM REDSTONE CUTOFF ============ */
/* U.S. Standard Atmosphere 1976 densities, kg/m³, every 10 km to 100 km and at 120 km [20]; log-linear between them */
var ATM_H = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120];
var ATM_R = [1.225, 0.41351, 0.08891, 0.01841, 0.0039957, 0.0010269, 3.0968e-4, 8.2829e-5, 1.8458e-5, 3.416e-6, 5.604e-7, 2.222e-8];
function rho(hm){
  var k = hm/1000; if(k <= 0) return ATM_R[0]; if(k >= 120) return 0;
  var i = 0; while(ATM_H[i + 1] < k) i++;
  return Math.exp(Math.log(ATM_R[i]) + (Math.log(ATM_R[i + 1]) - Math.log(ATM_R[i]))*(k - ATM_H[i])/(ATM_H[i + 1] - ATM_H[i]));
}
var SCALE_H = 10/Math.log(ATM_R[3]/ATM_R[4]);                       /* km, between 30 and 40 km */
/* Cutoff state calibrated once on Freedom 7 (MR-3): 42.5 km, 50° above the horizon; ballistic coefficient assumed. */
var BAL = {h0:42500, gam:50, beta:245};
var SHEPARD_V = 7388*FT, HAM_V = 5857*MPH;                          /* MR-3 inertial cutoff speed [19]; Ham's flight speed (NASA) [1] */
function fly(v0, gdeg, beta){
  var g = gdeg*Math.PI/180, b = beta || BAL.beta;
  var px = 0, py = RE_M + BAL.h0, vx = v0*Math.cos(g), vy = v0*Math.sin(g);
  var t = 0, dt = 0.02, apo = 0, peak = 0, tPeak = 0, hPeak = 0, wt = 0, path = [], gt = [], entry = null, step = 0;
  while(t < 3000){
    var r = Math.sqrt(px*px + py*py), h = r - RE_M, v = Math.sqrt(vx*vx + vy*vy), d = 0.5*rho(h)*v*v/b;
    if(entry === null && h < 80000 && (px*vx + py*vy) < 0){ entry = {v:v, gam:Math.asin(-(px*vx + py*vy)/(r*v))*180/Math.PI}; }
    if(d/G0 < 0.05) wt += dt;
    if(d/G0 > peak){ peak = d/G0; tPeak = t; hPeak = h; }
    if(h > apo) apo = h;
    if(step % 50 === 0){ path.push([Math.atan2(px, py)*RE_M/1000, h/1000]); gt.push([t, d/G0]); }
    var ax = -MU*px/(r*r*r) - d*vx/v, ay = -MU*py/(r*r*r) - d*vy/v;
    vx += ax*dt; vy += ay*dt; px += vx*dt; py += vy*dt; t += dt; step++;
    if(h < 5000 && t > 10) break;
  }
  return {apo:apo/1000, rng:Math.atan2(px, py)*RE_M/1000, peak:peak, tPeak:tPeak, hPeak:hPeak/1000, wt:wt/60, path:path, gt:gt, entry:entry, tEnd:t};
}
/* Allen & Eggers: peak deceleration of a steep ballistic entry, a = V² sin γ / (2 e H) */
function allenEggersG(v, gamDeg){ return v*v*Math.sin(gamDeg*Math.PI/180)/(2*Math.E*SCALE_H*1000)/G0; }

/* published values the model is compared with */
var MR3 = {apo:116.5*SMI/1000, rng:302*SMI/1000, peak:11.0, hPeak:83000*FT/1000, wt:5};         /* [18][19] */
var MR2 = {apo:136.2*NMI/1000, rng:363*NMI/1000, peak:14.6, wt:6.5, launchPeak:17.0};         /* [16] */

/* ============ CH2 — RENDER ============ */
var hCfg = 'flown', hUA = document.getElementById('hUA'), hDog = document.getElementById('hDog');
function renderHeat(){
  var UA = +hUA.value, Qd = +hDog.value, r = heatRun(hCfg, UA, Qd, 10);
  document.getElementById('hUAVal').textContent = fmt(UA, 1) + T(' W per °C',' Вт на °C'); hUA.setAttribute('aria-valuetext', document.getElementById('hUAVal').textContent);
  document.getElementById('hDogVal').textContent = fmt(Qd, 0) + T(' W',' Вт'); hDog.setAttribute('aria-valuetext', document.getElementById('hDogVal').textContent);
  var svg = document.getElementById('heatSvg'); svg.innerHTML = '';
  var L = 46, R = 468, Tp = 22, B = 252, xmax = 10, ymin = 0, ymax = 60;
  function X(h){ return L + h/xmax*(R - L); } function Y(c){ return B - (c - ymin)/(ymax - ymin)*(B - Tp); }
  ns('rect', {x:X(5), y:Tp, width:X(7) - X(5), height:B - Tp, fill:'#f3e3dd', opacity:0.8}, svg);
  for(var k = 0; k*HEAT.P/3600 < xmax; k++){
    var a = k*HEAT.P/3600, e = Math.min(xmax, (k + 1)*HEAT.P/3600);
    if(k % 2 === 0) ns('rect', {x:X(a), y:Tp, width:X(e) - X(a), height:B - Tp, fill:'#f1f1ec'}, svg);
    txt(svg, (X(a) + X(e))/2, B - 6, (k + 1) + '', 'svg-small', 'middle');
  }
  txt(svg, X(6), Tp + 12, T('no life signs','нет признаков жизни'), 'svg-small svg-halo', 'middle');
  txt(svg, X(6), Tp + 25, T('after 5–7 h [6][7]','через 5–7 ч [6][7]'), 'svg-small svg-halo', 'middle');
  [0, 10, 20, 30, 40, 50, 60].forEach(function(c){ ns('line', {x1:L, y1:Y(c), x2:R, y2:Y(c), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(c) + 4, c + '', 'svg-small', 'end'); });
  [0, 2, 4, 6, 8, 10].forEach(function(h){ ns('line', {x1:X(h), y1:B, x2:X(h), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(h), B + 16, h + T(' h',' ч'), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  ns('line', {x1:L, y1:Y(40), x2:R, y2:Y(40), stroke:'#b5452a', 'stroke-dasharray':'5 3'}, svg);
  txt(svg, L + 4, Y(40) - 5, T('40 °C [4]','40 °C [4]'), 'svg-small svg-halo');
  ns('line', {x1:L, y1:Y(15), x2:R, y2:Y(15), stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, R - 4, Y(15) + 13, T('fan switches on above 15 °C [6]','вентилятор включается выше 15 °C [6]'), 'svg-small svg-halo', 'end');
  txt(svg, L, 13, T('modelled cabin temperature, °C (not telemetry)','модельная температура в кабине, °C (не телеметрия)'), 'svg-small');
  txt(svg, R, B + 36, T('hours after launch · bands = orbits 1, 2, 3…','часы после старта · полосы — витки 1, 2, 3…'), 'svg-small', 'end');
  var other = heatRun(hCfg === 'flown' ? 'alone' : 'flown', HEAT.cfg[hCfg === 'flown' ? 'alone' : 'flown'].UA, Qd, 10);
  function line(pts, col, w, dash){ var d = ''; pts.forEach(function(p, i){ d += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(Math.min(ymax, p[1])).toFixed(1); }); var o = {d:d, fill:'none', stroke:col, 'stroke-width':w}; if(dash) o['stroke-dasharray'] = dash; ns('path', o, svg); }
  line(other.pts, '#8f8f88', 1.4, '4 3');
  line(r.pts, '#0b0b0c', 2.2);
  if(r.cross !== null) ns('circle', {cx:X(r.cross), cy:Y(40), r:5, fill:'#b5452a'}, svg);
  var ttl = r.cross === null ? T('not within 10 h','не за 10 ч') : fmt(r.cross, 1) + T(' h (orbit ',' ч (виток ') + orbitAt(r.cross) + ')';
  cells(document.getElementById('heatReadout'), [
    [T('TIME TO REACH 40 °C','ВРЕМЯ ДО 40 °C'), ttl],
    [T('TEMPERATURE AT 7 h','ТЕМПЕРАТУРА ЧЕРЕЗ 7 ч'), fmt(r.T7, 1) + ' °C'],
    [T('WHERE IT IS HEADING (Tₑq)','К ЧЕМУ ИДЁТ (Tₑq)'), fmt(r.Teq, 0) + ' °C'],
    [T('HOW FAST (τ = C/UA)','КАК БЫСТРО (τ = C/UA)'), fmt(r.tau, 1) + T(' h',' ч')]
  ]);
  hud1.textContent = fmt(r.T7, 0) + T(' °C at 7 h',' °C за 7 ч');
  document.getElementById('heatStatus').innerHTML = r.cross !== null && r.cross <= 7
    ? T('In this model the cabin passes 40 °C ','В этой модели кабина переходит 40 °C через ') + fmt(r.cross, 1) + T(' hours after launch, in orbit ',' ч после старта, на ') + orbitAt(r.cross) + T('. With these assumed numbers nothing can outrun that: the temperature heads for T<sub>eq</sub> = T<sub>s</sub> + Q/UA no matter how calm the passenger is.','-м витке. При этих допущениях от этого не убежать: температура стремится к T<sub>eq</sub> = T<sub>s</sub> + Q/UA, как бы спокойно ни вёл себя пассажир.')
    : r.Teq < 40
      ? T('Heat in and heat out balance below 40 °C (equilibrium ','Приток и отвод тепла уравновешиваются ниже 40 °C (равновесие ') + fmt(r.Teq, 0) + T(' °C). That is what a cabin able to shed more heat would do; it says nothing about whether this design would have lasted seven days.',' °C). Так вела бы себя кабина, способная отдавать больше тепла; о том, проработала бы эта конструкция семь суток, это ничего не говорит.')
      : T('The cabin still overheats, but more slowly: 40 °C ','Кабина всё равно перегревается, только медленнее: 40 °C ') + (r.cross === null ? T('is reached after the 10 hours shown',' достигается позже показанных 10 ч') : T('is reached after ',' — через ') + fmt(r.cross, 1) + T(' h',' ч')) + T('. With equilibrium at ','. При равновесии ') + fmt(r.Teq, 0) + T(' °C, more time only delays the outcome.',' °C лишнее время лишь откладывает исход.');
}
hUA.addEventListener('input', function(){ renderHeat(); });
hDog.addEventListener('input', function(){ pressGroup(document.getElementById('hDogPre'), null); renderHeat(); });
Array.prototype.forEach.call(document.querySelectorAll('#hCfg .btn'), function(btn){ btn.addEventListener('click', function(){ hCfg = this.getAttribute('data-c'); hUA.value = HEAT.cfg[hCfg].UA; pressGroup(this.parentNode, this); renderHeat(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#hDogPre .btn'), function(btn){ btn.addEventListener('click', function(){ var w = this.getAttribute('data-w'); hDog.value = w === 'k' ? kleiberW(6) : w; pressGroup(this.parentNode, this); renderHeat(); }); });

/* ============ CH4 — RENDER ============ */
var bV = document.getElementById('bV'), bG = document.getElementById('bG');
bV.value = HAM_V;
function renderBal(){
  var v = +bV.value, gd = +bG.value, r = fly(v, gd);
  document.getElementById('bVVal').textContent = num(Math.round(v)) + T(' m/s (',' м/с (') + num(Math.round(v/MPH)) + T(' mph)',' миль/ч)'); bV.setAttribute('aria-valuetext', document.getElementById('bVVal').textContent);
  document.getElementById('bGVal').textContent = fmt(gd, 1) + '°'; bG.setAttribute('aria-valuetext', document.getElementById('bGVal').textContent + T(' above the horizon',' над горизонтом'));
  var svg = document.getElementById('balSvg'); svg.innerHTML = '';
  var L = 46, R = 468, Tp = 22, B = 168, xmax = 900, ymax = Math.max(350, Math.ceil(r.apo/50)*50 + 20);
  function X(x){ return L + x/xmax*(R - L); } function Y(h){ return B - h/ymax*(B - Tp); }
  [0, 100, 200, 300, 400].filter(function(h){ return h < ymax; }).forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 4, h + '', 'svg-small', 'end'); });
  [0, 200, 400, 600, 800].forEach(function(x){ txt(svg, X(x), B + 14, num(x), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 13, T('altitude, km','высота, км'), 'svg-small');
  txt(svg, R, B + 30, T('downrange, km','дальность, км'), 'svg-small', 'end');
  function mark(x, h, col, lab, anchor){ ns('circle', {cx:X(x), cy:Y(h), r:4, fill:col}, svg); txt(svg, X(x) + (anchor === 'end' ? -7 : 7), Y(h) - 6, lab, 'svg-small svg-halo', anchor || 'start'); }
  var d = ''; r.path.forEach(function(p, i){ d += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  mark(MR2.rng*0.47, MR2.apo, '#b5452a', T('Ham: 252 km [16]','Хэм: 252 км [16]'), 'end');
  mark(MR2.rng, 0, '#b5452a', T('672 km','672 км'), 'start');
  mark(MR3.rng, 0, '#2f5aa1', T('Shepard 486','Шепард 486'), 'end');
  /* g against time */
  var g2 = document.getElementById('gSvg'); g2.innerHTML = '';
  var L2 = 46, R2 = 468, T2 = 18, B2 = 150, tmax = 700, gmax = Math.max(20, Math.ceil(r.peak/5)*5);
  function X2(t){ return L2 + t/tmax*(R2 - L2); } function Y2(g){ return B2 - Math.min(g, gmax)/gmax*(B2 - T2); }
  [0, 5, 10, 15, 20, 25].filter(function(g){ return g <= gmax; }).forEach(function(g){ ns('line', {x1:L2, y1:Y2(g), x2:R2, y2:Y2(g), stroke:'#e4e4de'}, g2); txt(g2, L2 - 6, Y2(g) + 4, g + '', 'svg-small', 'end'); });
  [0, 100, 200, 300, 400, 500, 600, 700].forEach(function(t){ txt(g2, X2(t), B2 + 14, t + '', 'svg-small', 'middle'); });
  ns('line', {x1:L2, y1:B2, x2:R2, y2:B2, stroke:'#0b0b0c'}, g2);
  txt(g2, L2, 11, T('deceleration, g','перегрузка торможения, g'), 'svg-small');
  txt(g2, R2, B2 + 32, T('seconds after cutoff','секунды после выключения'), 'svg-small', 'end');
  ns('line', {x1:L2, y1:Y2(MR2.peak), x2:R2, y2:Y2(MR2.peak), stroke:'#b5452a', 'stroke-dasharray':'5 3'}, g2);
  txt(g2, L2 + 4, Y2(MR2.peak) - 4, T('Ham 14.6 g [16]','Хэм 14,6 g [16]'), 'svg-small svg-halo');
  ns('line', {x1:L2, y1:Y2(MR3.peak), x2:R2, y2:Y2(MR3.peak), stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, g2);
  txt(g2, L2 + 4, Y2(MR3.peak) + 12, T('Shepard 11.0 g [19]','Шепард 11,0 g [19]'), 'svg-small svg-halo');
  var dg = ''; r.gt.forEach(function(p, i){ dg += (i ? 'L' : 'M') + X2(p[0]).toFixed(1) + ',' + Y2(p[1]).toFixed(1); });
  ns('path', {d:dg, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, g2);
  var hasEntry = r.entry && r.apo >= 80, ae = hasEntry ? allenEggersG(r.entry.v, r.entry.gam) : 0;
  cells(document.getElementById('balReadout'), [
    [T('APOGEE','АПОГЕЙ'), num(Math.round(r.apo)) + T(' km',' км')],
    [T('RANGE (TO 5 km)','ДАЛЬНОСТЬ (ДО 5 км)'), num(Math.round(r.rng)) + T(' km',' км')],
    [T('WEIGHTLESS (< 0.05 g)','НЕВЕСОМОСТЬ (< 0,05 g)'), fmt(r.wt, 1) + T(' min',' мин')],
    [T('PEAK RE-ENTRY LOAD','ПИКОВАЯ ПЕРЕГРУЗКА ВХОДА'), fmt(r.peak, 1) + T(' g at ',' g на высоте ') + fmt(r.hPeak, 0) + T(' km',' км')],
    [T('ALLEN–EGGERS AT 80 km (NO GRAVITY)','АЛЛЕН–ЭГГЕРС НА 80 км (БЕЗ ТЯГОТЕНИЯ)'), hasEntry ? fmt(ae, 1) + ' g' : T('— (apogee below 80 km)','— (апогей ниже 80 км)')],
    [T('ENTRY AT 80 km','ВХОД НА 80 км'), hasEntry ? num(Math.round(r.entry.v)) + T(' m/s, ',' м/с, ') + fmt(r.entry.gam, 0) + '°' : '—']
  ]);
  hud2.textContent = fmt(r.peak, 1) + ' g';
  var st;
  if(r.peak > 13.5) st = T('A hotter, faster arc: the capsule climbs higher, falls back steeper and faster, and the air has to take that speed away over a shorter path. That is Ham\'s flight — 14.6 g measured, more than Shepard\'s 11.0 g on the profile MR-2 was meant to fly [16][19].','Более «горячая» и быстрая дуга: капсула поднимается выше, падает круче и быстрее, и воздуху приходится гасить эту скорость на более коротком пути. Это полёт Хэма — измерено 14,6 g, больше, чем 11,0 g у Шепарда на том профиле, по которому должен был лететь MR-2 [16][19].');
  else if(r.peak > 9.5) st = T('Close to the nominal Mercury-Redstone profile that Shepard flew on 5 May 1961: about 11 g on re-entry and about five minutes weightless [18][19].','Близко к номинальному профилю «Меркурий-Редстоун», по которому 5 мая 1961 года летал Шепард: около 11 g на входе и около пяти минут невесомости [18][19].');
  else st = T('A gentler arc: lower, shorter, less time weightless and a softer re-entry — but less of the flight was spent in the condition the test was meant to probe.','Более мягкая дуга: ниже, короче, меньше невесомости и мягче вход — но и меньше времени в том состоянии, ради которого затевалось испытание.');
  document.getElementById('balStatus').innerHTML = st;
}
bV.addEventListener('input', function(){ pressGroup(document.getElementById('bPre'), null); renderBal(); });
bG.addEventListener('input', function(){ pressGroup(document.getElementById('bPre'), null); renderBal(); });
Array.prototype.forEach.call(document.querySelectorAll('#bPre .btn'), function(btn){ btn.addEventListener('click', function(){
  var k = this.getAttribute('data-v'); bV.value = k === 'ham' ? HAM_V : k === 'shepard' ? SHEPARD_V : +k; bG.value = BAL.gam; pressGroup(this.parentNode, this); renderBal(); }); });

/* ============ CH7 — WHAT EACH FLIGHT ANSWERED ============ */
/* q: [launch loads, weightlessness, hours-days in orbit, task performance, return from orbit, radiation, beyond Earth orbit]; 2 = answered, 1 = partly */
var QS = [
  ['LAUNCH AND RE-ENTRY LOADS','ПЕРЕГРУЗКИ СТАРТА И ВХОДА'], ['MINUTES OF WEIGHTLESSNESS','МИНУТЫ НЕВЕСОМОСТИ'], ['HOURS TO DAYS IN ORBIT','ЧАСЫ И СУТКИ НА ОРБИТЕ'],
  ['DOING A TASK','ВЫПОЛНЕНИЕ ЗАДАЧИ'], ['COMING HOME FROM ORBIT','ВОЗВРАЩЕНИЕ С ОРБИТЫ'], ['RADIATION','РАДИАЦИЯ'], ['BEYOND EARTH ORBIT','ЗА ПРЕДЕЛАМИ ОКОЛОЗЕМНОЙ ОРБИТЫ']];
var FLIGHTS = [
  {y:'1947', n:['V-2 “Blossom” capsule','V-2, капсула Blossom'], w:['fruit flies, seeds','плодовые мушки, семена'], o:'alive', q:[1,0,0,0,0,1,0],
   d:['20 February 1947, White Sands: a canister of fruit flies and seeds was ejected near the top of the flight and parachuted back. The aim was cosmic radiation; the flies were recovered alive. It showed that living things could be sent up and brought back, nothing more [1][2].','20 февраля 1947 года, Уайт-Сэндс: контейнер с плодовыми мушками и семенами отделился у вершины траектории и спустился на парашюте. Цель — космические лучи; мушек нашли живыми. Полёт показал, что живое можно поднять и вернуть, — не более того [1][2].']},
  {y:'1949', n:['Albert II, V-2','Альберт II, V-2'], w:['rhesus monkey','макак-резус'], o:'died', q:[1,1,0,0,0,0,0],
   d:['14 June 1949: Albert II reached 83 miles (134 km) and was alive through the flight, but the parachute failed and he died on impact. Albert I had died a year earlier inside a cramped capsule; Albert IV also died at impact [1][2].','14 июня 1949 года: Альберт II поднялся на 83 мили (134 км) и пережил полёт, но парашют не раскрылся, и он погиб при ударе о землю. Альберт I погиб годом раньше в тесной капсуле; Альберт IV тоже погиб при ударе [1][2].']},
  {y:'1951', n:['Dezik and Tsygan, R-1V','Дезик и Цыган, Р-1В'], w:['two dogs','две собаки'], o:'alive', q:[2,1,0,0,0,0,0],
   d:['22 July 1951: two stray dogs rode a Soviet copy of the V-2 to about 110 km and were recovered unharmed [3]. Dezik died on a later flight with a dog named Lisa when the parachute failed [1]. The dog flights of 1951–52 established that a mammal comes through launch, a few minutes of free fall and a parachute return.','22 июля 1951 года: две бродячие собаки поднялись на советской копии V-2 примерно на 110 км и вернулись невредимыми [3]. Дезик погиб в следующем полёте вместе с собакой Лисой, когда не раскрылся парашют [1]. Собачьи полёты 1951–1952 годов показали, что млекопитающее переносит старт, несколько минут свободного падения и спуск на парашюте.']},
  {y:'1957', n:['Sputnik 2','«Спутник-2»'], w:['Laika (dog)','Лайка (собака)'], o:'died', q:[2,2,1,0,0,0,0],
   d:['3 November 1957: Laika\'s pulse tripled at launch and settled in weightlessness, more slowly than after a centrifuge run. Then the cabin overheated; no life signs came after 5–7 hours. There was never a way to bring her back [6][7]. It answered one question — a mammal tolerates orbital launch and hours of weightlessness — at the cost of her life.','3 ноября 1957 года: при старте пульс Лайки утроился и затем снизился в невесомости — медленнее, чем после центрифуги. Потом кабина перегрелась; через 5–7 часов признаков жизни уже не было. Способа вернуть её не существовало [6][7]. Полёт ответил на один вопрос — млекопитающее переносит выведение на орбиту и часы невесомости — ценой её жизни.']},
  {y:'1960', n:['Korabl-Sputnik 2','Второй корабль-спутник'], w:['Belka, Strelka, 40 mice, 2 rats','Белка, Стрелка, 40 мышей, 2 крысы'], o:'mixed', q:[2,2,2,0,2,1,0],
   d:['19–20 August 1960: 17–18 orbits in a test version of Vostok and the first return of animals from orbit; both dogs came back, but 28 of the 40 mice died in flight [11]. On the fourth orbit Belka moved anxiously, barked and vomited — an early sign of the space sickness humans would later feel. Air Force medical chief Vladimir Yazdovsky then demanded that the first crewed flight last no more than one orbit [11].','19–20 августа 1960 года: 17–18 витков на испытательном варианте «Востока» и первое возвращение животных с орбиты; обе собаки вернулись, но 28 из 40 мышей погибли в полёте [11]. На четвёртом витке Белка беспокойно металась, лаяла, и её вырвало — ранний признак той космической болезни, которую потом испытают люди. Начальник медицинских исследований ВВС Владимир Яздовский потребовал, чтобы первый пилотируемый полёт длился не больше одного витка [11].']},
  {y:'1960', n:['Korabl-Sputnik 3','Третий корабль-спутник'], w:['Pchyolka and Mushka','Пчёлка и Мушка'], o:'died', q:[2,2,2,0,0,0,0],
   d:['1–2 December 1960: a day in orbit went well, but the braking burn came out short and the descent module was destroyed by its self-destruct system on the way down, killing both dogs [12]. It showed the return was the least reliable part of the system — four months before Gagarin.','1–2 декабря 1960 года: сутки на орбите прошли нормально, но тормозной импульс оказался недостаточным, и спускаемый аппарат был уничтожен системой аварийного подрыва при снижении; обе собаки погибли [12]. Полёт показал, что возвращение — самое ненадёжное звено системы, за четыре месяца до Гагарина.']},
  {y:'1961', n:['Mercury-Redstone 2','«Меркурий-Редстоун-2»'], w:['Ham (chimpanzee)','Хэм (шимпанзе)'], o:'alive', q:[2,2,0,2,0,0,0],
   d:['31 January 1961: the booster over-performed, the escape rocket fired and Ham took 17 g at launch and 14.6 g on re-entry, with 6½ minutes weightless. He kept working his levers: his mean reaction time was 0.82 s against 0.80 s before flight [16]. The first proof that a primate can do a job in space — and the reason a further booster test flew before Shepard [17].','31 января 1961 года: ракета-носитель перестаралась, сработала двигательная установка системы аварийного спасения, и Хэм испытал 17 g на старте и 14,6 g на входе при 6,5 минуты невесомости. Он продолжал работать рычагами: среднее время реакции 0,82 с против 0,80 с до полёта [16]. Первое доказательство того, что примат может выполнять работу в космосе, — и причина, по которой перед полётом Шепарда понадобился ещё один испытательный пуск носителя [17].']},
  {y:'1961', n:['Korabl-Sputniks 4 and 5','Четвёртый и пятый корабли-спутники'], w:['Chernushka, Zvezdochka, mannequin','Чернушка, Звёздочка, манекен'], o:'alive', q:[2,2,0,0,2,0,0],
   d:['9 and 25 March 1961: each flew the exact one-orbit plan of Vostok 1 in a ship built for a pilot, with a mannequin in the ejection seat and a single dog alongside. Both dogs came back alive [14][15]. Two clean rehearsals were the last condition for Gagarin\'s flight on 12 April.','9 и 25 марта 1961 года: каждый корабль выполнил точную одновитковую программу «Востока-1» на аппарате, построенном для лётчика, с манекеном в катапультном кресле и одной собакой рядом. Обе собаки вернулись живыми [14][15]. Две чистые генеральные репетиции стали последним условием полёта Гагарина 12 апреля.']},
  {y:'1961', n:['Mercury-Atlas 5','«Меркурий-Атлас-5»'], w:['Enos (chimpanzee)','Энос (шимпанзе)'], o:'alive', q:[2,2,2,2,2,0,0],
   d:['29 November 1961: two orbits instead of three, cut short by a failed roll-control jet and an overheating inverter [18]; 7.8 g on re-entry [16]. Enos worked his tasks for over three hours, although a faulty lever shocked him for correct answers [16]. He died of shigella dysentery in November 1962, which NASA said was unrelated to the flight [21]. Glenn flew the same mission in February 1962.','29 ноября 1961 года: два витка вместо трёх — полёт сократили из-за отказа реактивного сопла управления по крену и перегрева инвертора [18]; 7,8 g на входе [16]. Энос выполнял задачи больше трёх часов, хотя неисправный рычаг бил его током за правильные ответы [16]. Он умер от шигеллёзной дизентерии в ноябре 1962 года; по данным NASA, болезнь не была связана с полётом [21]. Гленн выполнил ту же программу в феврале 1962 года.']},
  {y:'1963', n:['Véronique AGI 47','«Вероника» AGI 47'], w:['Félicette (cat)','Фелисетт (кошка)'], o:'killed', q:[1,1,0,1,0,0,0],
   d:['18 October 1963, Algerian Sahara: Félicette flew with electrodes in her skull to record brain activity, spent about five minutes weightless and was recovered alive [22][23]. Two months later she was killed so her brain could be examined; the autopsy taught little [22].','18 октября 1963 года, алжирская Сахара: Фелисетт летала с электродами в черепе для записи активности мозга, около пяти минут провела в невесомости и была найдена живой [22][23]. Через два месяца её умертвили, чтобы исследовать мозг; вскрытие почти ничего не дало [22].']},
  {y:'1966', n:['Kosmos 110','«Космос-110»'], w:['Veterok and Ugolyok','Ветерок и Уголёк'], o:'alive', q:[0,2,2,0,2,2,0],
   d:['22 February 1966: 21 days in orbit to study radiation effects, a canine record that still stands [1]. It came after the Vostok and Voskhod crews had already flown, and probed durations they had not.','22 февраля 1966 года: 21 сутки на орбите для изучения действия радиации — собачий рекорд, который не побит до сих пор [1]. Полёт состоялся уже после экипажей «Востоков» и «Восходов» и исследовал длительности, до которых они не дошли.']},
  {y:'1968', n:['Zond 5','«Зонд-5»'], w:['two steppe tortoises, insects, plants','две степные черепахи, насекомые, растения'], o:'alive', q:[1,2,2,0,2,1,2],
   d:['14–21 September 1968: around the Moon at 1,950 km and back to a splashdown in the Indian Ocean after a steep ballistic re-entry [24]. The tortoises lost about 10 % of their weight but stayed active [24]. The first animals to travel around the Moon, three months before Apollo 8\'s crew.','14–21 сентября 1968 года: облёт Луны на расстоянии 1950 км и приводнение в Индийском океане после крутого баллистического входа [24]. Черепахи потеряли около 10 % веса, но остались активными [24]. Первые животные, облетевшие Луну, — за три месяца до экипажа «Аполлона-8».']},
  {y:'1973–96', n:['Bion / Kosmos biosatellites','Биоспутники «Бион» («Космос»)'], w:['rats, monkeys, fish, insects, plants','крысы, обезьяны, рыбы, насекомые, растения'], o:'mixed', q:[0,2,2,0,2,2,0],
   d:['Eleven flights from Kosmos 605 (1973) to Bion 11 (1996), of five to 22 days each [1]. They asked what weeks in orbit do to animals — questions for long stays, not first flights. Not every animal survived: the monkey Multik died the day after Bion 11 landed, during his post-landing examination [1].','Одиннадцать полётов — от «Космоса-605» (1973) до «Биона-11» (1996), от 5 до 22 суток каждый [1]. Изучалось, что недели на орбите делают с животными, — вопросы долгих экспедиций, а не первых полётов. Выжили не все: обезьяна Мультик умерла на следующий день после посадки «Биона-11», во время послеполётного обследования [1].']},
  {y:'2025', n:['Bion-M No. 2','«Бион-М» № 2'], w:['75 mice, fruit flies, cells, plants','75 мышей, дрозофилы, клетки, растения'], o:'mixed', q:[0,2,2,0,2,2,0],
   d:['20 August – 19 September 2025: 30 days in a near-polar orbit at about 97° to measure radiation and weightlessness [27]. Ten of the 75 mice died during the flight; the institute attributed this partly to fighting between male mice [26]. As of October 2026 it is the most recent flight in the series.','20 августа – 19 сентября 2025 года: 30 суток на почти полярной орбите (около 97°) для изучения радиации и невесомости [27]. Десять из 75 мышей погибли в полёте; институт объяснил это в том числе драками между самцами [26]. На октябрь 2026 года это последний полёт серии.']}
];
var mxQ = -1, mxSel = 3;
function outcomeLabel(o){ return {alive:T('survived','выжили'), died:T('died','погибли'), killed:T('survived, then killed','выжила, затем умерщвлена'), mixed:T('some died','часть погибла')}[o]; }
function renderMatrix(){
  var head = '<thead><tr><th scope="col" class="mx-fl">' + T('FLIGHT','ПОЛЁТ') + '</th>' + QS.map(function(q, i){ return '<th scope="col" class="mx-q' + (i === mxQ ? ' on' : '') + '" title="' + T(q[0], q[1]) + '"><abbr title="' + T(q[0], q[1]) + '">Q' + (i + 1) + '</abbr></th>'; }).join('') + '</tr></thead>';
  var rows = FLIGHTS.map(function(f, k){
    var hit = mxQ >= 0 && f.q[mxQ] === 2, dim = mxQ >= 0 && !f.q[mxQ];
    return '<tr class="' + (k === mxSel ? 'sel ' : '') + (hit ? 'hit ' : '') + (dim ? 'dim' : '') + '"><th scope="row" class="mx-fl"><button class="mx-row" data-k="' + k + '" aria-pressed="' + (k === mxSel) + '"><span class="mx-y">' + f.y + '</span> ' + T(f.n[0], f.n[1]) + '<span class="mx-o mx-' + f.o + '">' + T(f.w[0], f.w[1]) + ' — ' + outcomeLabel(f.o) + '</span></button></th>' +
      f.q.map(function(v, i){ return '<td class="mx-c' + (i === mxQ ? ' on' : '') + '" aria-label="' + T(QS[i][0], QS[i][1]) + ': ' + (v === 2 ? T('answered','ответил') : v === 1 ? T('partly','частично') : T('no','нет')) + '">' + (v === 2 ? '●' : v === 1 ? '◐' : '·') + '</td>'; }).join('') + '</tr>';
  }).join('');
  document.getElementById('mxTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  Array.prototype.forEach.call(document.querySelectorAll('#mxTable .mx-row'), function(b){ b.addEventListener('click', function(){ mxSel = +this.getAttribute('data-k'); renderMatrix(); }); });
  var f = FLIGHTS[mxSel];
  document.getElementById('mxDetail').innerHTML = '<b>' + f.y + ' · ' + T(f.n[0], f.n[1]) + '</b> — ' + T(f.d[0], f.d[1]);
  var st;
  if(mxQ < 0) st = T('Choose a question to see which flights answered it, or a flight to read what it measured.','Выберите вопрос, чтобы увидеть, какие полёты на него ответили, или полёт — чтобы прочитать, что он измерил.');
  else {
    var hits = FLIGHTS.filter(function(x){ return x.q[mxQ] === 2; });
    st = T('“','«') + T(QS[mxQ][0], QS[mxQ][1]).toLowerCase() + T('”: answered by ','»: ответили ') + hits.length + T(' of the ',' из ') + FLIGHTS.length + T(' flights here, first by ',' полётов, первым — ') + T(hits[0].n[0], hits[0].n[1]) + ' (' + hits[0].y + ').';
  }
  document.getElementById('mxStatus').innerHTML = st;
}
Array.prototype.forEach.call(document.querySelectorAll('#mxQ .btn'), function(btn){ btn.addEventListener('click', function(){
  var q = +this.getAttribute('data-q'); mxQ = (mxQ === q) ? -1 : q; pressGroup(this.parentNode, mxQ < 0 ? null : this); renderMatrix(); }); });

/* ============ CH8 — LEGACY ============ */
var TIMELINE = [
  ['1947', '<b>20 February:</b> fruit flies ride a V-2 from White Sands and come back alive [1][2].', '<b>20 февраля:</b> плодовые мушки поднимаются на V-2 с полигона Уайт-Сэндс и возвращаются живыми [1][2].'],
  ['1948–49', 'Albert I dies in a cramped capsule; Albert II reaches 134 km and dies on impact when the parachute fails [1][2].', 'Альберт I гибнет в тесной капсуле; Альберт II достигает 134 км и гибнет при ударе — не раскрылся парашют [1][2].'],
  ['1951', '<b>22 July:</b> Dezik and Tsygan, the first dogs above 100 km, are recovered alive [3].', '<b>22 июля:</b> Дезик и Цыган — первые собаки выше 100 км — возвращаются живыми [3].'],
  ['1957', '<b>3 November:</b> Sputnik 2 carries Laika into orbit. She dies of overheating within hours [4][6].', '<b>3 ноября:</b> «Спутник-2» выводит на орбиту Лайку. Она погибает от перегрева в первые часы [4][6].'],
  ['1958', '<b>14 April:</b> Sputnik 2 re-enters after 162 days [4].', '<b>14 апреля:</b> «Спутник-2» входит в атмосферу через 162 дня [4].'],
  ['1960', '<b>28 July:</b> Lisichka and Chaika die in a launch failure. <b>19–20 August:</b> Belka and Strelka orbit and return; 28 of 40 mice die in flight. <b>1–2 December:</b> Pchyolka and Mushka are lost on re-entry [11][12].', '<b>28 июля:</b> Лисичка и Чайка гибнут в аварии носителя. <b>19–20 августа:</b> Белка и Стрелка летают на орбите и возвращаются; 28 из 40 мышей гибнут в полёте. <b>1–2 декабря:</b> Пчёлка и Мушка гибнут при спуске [11][12].'],
  ['1961', '<b>31 January:</b> Ham. <b>9 and 25 March:</b> Chernushka and Zvezdochka rehearse Vostok 1. <b>12 April:</b> Gagarin. <b>5 May:</b> Shepard. <b>29 November:</b> Enos orbits twice [14][15][16][18].', '<b>31 января:</b> Хэм. <b>9 и 25 марта:</b> Чернушка и Звёздочка репетируют «Восток-1». <b>12 апреля:</b> Гагарин. <b>5 мая:</b> Шепард. <b>29 ноября:</b> Энос делает два витка [14][15][16][18].'],
  ['1963', '<b>18 October:</b> Félicette flies from the Sahara; she is killed two months later [22].', '<b>18 октября:</b> полёт Фелисетт из Сахары; через два месяца её умерщвляют [22].'],
  ['1966', '<b>22 February:</b> Veterok and Ugolyok begin 21 days on Kosmos 110 [1].', '<b>22 февраля:</b> Ветерок и Уголёк начинают 21-суточный полёт на «Космосе-110» [1].'],
  ['1968', '<b>18 September:</b> Zond 5\'s tortoises pass 1,950 km from the Moon; recovered on 21 September [24].', '<b>18 сентября:</b> черепахи «Зонда-5» проходят в 1950 км от Луны; 21 сентября их поднимают из океана [24].'],
  ['1973–96', 'Eleven Bion biosatellites, from Kosmos 605 to Bion 11 [1].', 'Одиннадцать биоспутников «Бион» — от «Космоса-605» до «Биона-11» [1].'],
  ['1998', 'Oleg Gazenko says publicly that the Sputnik 2 mission did not justify Laika\'s death [28].', 'Олег Газенко публично говорит, что полёт «Спутника-2» не оправдал гибели Лайки [28].'],
  ['2002', 'Dimitri Malashenkov tells the World Space Congress that Laika died within 5–7 hours [6][7].', 'Дмитрий Малашенков сообщает Всемирному космическому конгрессу, что Лайка погибла в первые 5–7 часов [6][7].'],
  ['2013', 'Bion-M No. 1: fewer than half of its 53 mice and other rodents survive 30 days [25].', '«Бион-М» № 1: меньше половины из 53 мышей и других грызунов переживают 30 суток [25].'],
  ['2025', 'Bion-M No. 2: 65 of 75 mice return after 30 days in a polar orbit [26][27].', '«Бион-М» № 2: 65 из 75 мышей возвращаются после 30 суток на полярной орбите [26][27].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA History Office, “A Brief History of Animals in Space”', url:'https://www.nasa.gov/history/a-brief-history-of-animals-in-space/', note:{en:'Albert II (14 June 1949, 83 miles, died on impact); R-1 dog flights 1951–52; Laika; Ham (5,857 mph, 157 miles, 422 miles, 6.6 min weightless); Enos; Félicette; Kosmos 110 (21 days); Zond 5 (about 20 g ballistic re-entry); Bion missions. Gives 15 August 1951 for Dezik and Tsygan, against 22 July in [3].', ru:'Альберт II (14 июня 1949 года, 83 мили, погиб при ударе); собачьи полёты на Р-1 в 1951–1952 годах; Лайка; Хэм (5857 миль/ч, 157 миль, 422 мили, 6,6 мин невесомости); Энос; Фелисетт; «Космос-110» (21 сутки); «Зонд-5» (баллистический вход около 20 g); миссии «Бион». Для Дезика и Цыгана указано 15 августа 1951 года, а не 22 июля, как в [3].'}},
  {title:'White Sands Missile Range Museum, “The V-2 Program: Operation Backfire to the Hermes Project”', url:'https://wsmrmuseum.com/2020/10/06/the-v-2-program-operation-backfire-to-the-hermes-project/5/amp/', note:{en:'The Blossom series: first firing 20 February 1947 with fruit flies and seeds to study cosmic radiation; the Albert flights.', ru:'Серия Blossom: первый пуск 20 февраля 1947 года с плодовыми мушками и семенами для изучения космических лучей; полёты «Альбертов».'}},
  {title:'Guinness World Records, “First dog in space”', url:'https://www.guinnessworldrecords.com/world-records/601672-first-dog-in-space', note:{en:'Dezik and Tsygan, 22 July 1951, R-1V, about 110 km.', ru:'Дезик и Цыган, 22 июля 1951 года, Р-1В, около 110 км.'}},
  {title:'NASA NSSDCA, “Sputnik 2” (archived 29 May 2019)', url:'https://web.archive.org/web/20190529081812/https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1957-002A', note:{en:'212 × 1,660 km, 103.7 min; the Blok A core “did not separate as planned”; insulation tore loose; interior reached 40 °C; Laika about 6 kg; re-entry 14 April 1958 after 162 days. Its estimate that she lived “a day or two” predates [6].', ru:'212 × 1660 км, 103,7 мин; блок А «не отделился, как планировалось»; часть теплоизоляции оторвалась; температура внутри достигла 40 °C; Лайка весила около 6 кг; вход в атмосферу 14 апреля 1958 года через 162 дня. Оценка «день-два» жизни Лайки появилась раньше [6].'}},
  {title:'NASA History Office, Chronology of Sputnik/Vanguard/Explorer Events 1957–58', url:'https://www.nasa.gov/history/sputnik/chronology.html', note:{en:'3 November 1957: Sputnik 2 (508.3 kg) with Laika.', ru:'3 ноября 1957 года: «Спутник-2» (508,3 кг) с Лайкой.'}},
  {title:'D. Whitehouse, “First dog in space died within hours”, BBC News, 28 October 2002', url:'http://news.bbc.co.uk/2/hi/science/nature/2367681.stm', note:{en:'Malashenkov (Institute for Biomedical Problems) at the World Space Congress: fan above 15 °C; pulse tripled at launch; temperature and humidity rose; no life signs after 5–7 hours.', ru:'Малашенков (Институт медико-биологических проблем) на Всемирном космическом конгрессе: вентилятор выше 15 °C; пульс при старте утроился; температура и влажность росли; признаков жизни нет через 5–7 часов.'}},
  {title:'S. Grahn, “Sputnik-2, more news from distant history” (archived)', url:'https://web.archive.org/web/2015/http://www.svengrahn.pp.se/histind/Sputnik2/sputnik2more.html', note:{en:'Summary of Malashenkov, paper IAC-02-IAA.2.2.05 (2002): life support for 7 days; no data after 5–7 hours; post-flight simulations put death on the third or fourth orbit.', ru:'Изложение доклада Малашенкова IAC-02-IAA.2.2.05 (2002): системы жизнеобеспечения на 7 суток; данных нет после 5–7 часов; послеполётное моделирование относит гибель к третьему–четвёртому витку.'}},
  {title:'A. Zak, “Sputnik-2”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/sputnik2.html', note:{en:'Polished transfer cone, extra blankets and copper panels for thermal control; states that Sputnik 2 was designed from the outset to remain attached to the rocket\'s core stage.', ru:'Полированный переходный конус, дополнительные экраны и медные панели для терморегулирования; утверждается, что «Спутник-2» изначально проектировался неотделяемым от центрального блока.'}},
  {title:'A. Zak, “Design of Sputnik-2”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/sputnik2_design.html', note:{en:'Korolev\'s 16 October 1957 note: satellite mounted on the second stage, total 7.5 t; orbiting mass with the core stage 7.79 t.', ru:'Записка Королёва от 16 октября 1957 года: спутник установлен на второй ступени, общая масса 7,5 т; на орбите вместе с центральным блоком 7,79 т.'}},
  {title:'NASA NSSDCA, Earth Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'GM = 0.39860 × 10⁶ km³/s², mean radius 6,371 km, used for every orbit and trajectory here.', ru:'GM = 0,39860 × 10⁶ км³/с², средний радиус 6371 км — во всех расчётах орбит и траекторий.'}},
  {title:'A. Zak, “Belka and Strelka pioneer a two-way trip to orbit”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/vostok-1k-2.html', note:{en:'Korabl-Sputnik 2: 306 × 339 km, 90.6 min; 1 day 2 h 23 min (17–18 orbits); two rats, 40 mice, of which 28 died in orbit; Lisichka and Chaika lost on 28 July 1960; Belka vomited on the fourth orbit and Yazdovsky demanded a one-orbit first crewed flight.', ru:'Второй корабль-спутник: 306 × 339 км, 90,6 мин; 1 сутки 2 ч 23 мин (17–18 витков); две крысы, 40 мышей, из которых 28 погибли на орбите; Лисичка и Чайка погибли 28 июля 1960 года; Белку вырвало на четвёртом витке, и Яздовский потребовал ограничить первый пилотируемый полёт одним витком.'}},
  {title:'A. Zak, “Vostok prototype lost on reentry”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/vostok-1k-3.html', note:{en:'Korabl-Sputnik 3, 1–2 December 1960, Pchyolka and Mushka; insufficient braking burn and activation of the self-destruct system.', ru:'Третий корабль-спутник, 1–2 декабря 1960 года, Пчёлка и Мушка; недостаточный тормозной импульс и срабатывание системы подрыва.'}},
  {title:'A. Zak, “Vostok-1K No. 4”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/vostok-1k-4.html', note:{en:'22 December 1960: third-stage failure; the capsule with Kometa and Shutka landed in Siberia and the dogs survived two days in deep cold.', ru:'22 декабря 1960 года: авария третьей ступени; капсула с Кометой и Шуткой села в Сибири, и собаки пережили двое суток на сильном морозе.'}},
  {title:'A. Zak, “Vostok-3KA No. 1”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/vostok-3ka-1.html', note:{en:'9 March 1961: one-orbit test with Chernushka and the mannequin “Ivan Ivanovich”, simulating Vostok 1.', ru:'9 марта 1961 года: одновитковое испытание с Чернушкой и манекеном «Иваном Ивановичем», имитация «Востока-1».'}},
  {title:'A. Zak, “Vostok-3KA No. 2”, RussianSpaceWeb', url:'https://www.russianspaceweb.com/vostok-3ka-2.html', note:{en:'25 March 1961: final dress rehearsal with Zvezdochka; the animals were reported alive.', ru:'25 марта 1961 года: последняя генеральная репетиция со Звёздочкой; животные живы.'}},
  {title:'J. P. Henry, J. D. Mosely (eds.) (1963), “Results of the Project Mercury Ballistic and Orbital Chimpanzee Flights”, NASA SP-39', url:'https://www.nasa.gov/wp-content/uploads/static/history/PDFs/sp39chimpanzee.pdf', note:{en:'MR-2: apogee 136.2 nmi, range 363 nmi; 17.0 g when the escape rocket fired; 14.6 g at T+9 min 36 s; 6½ min weightless; heart rate 94 → 158 → 173 /min; reaction time 0.82 s vs 0.80 s. MA-5: 99.5 × 147.4 statute miles, 88 min 26 s, two orbits, 7.8 g, landing at 3 h 21 min; lever malfunction.', ru:'MR-2: апогей 136,2 морской мили, дальность 363 мили; 17,0 g при срабатывании двигателя САС; 14,6 g на T+9 мин 36 с; 6,5 мин невесомости; пульс 94 → 158 → 173 в минуту; время реакции 0,82 с против 0,80 с. MA-5: 99,5 × 147,4 сухопутной мили, 88 мин 26 с, два витка, 7,8 g, посадка через 3 ч 21 мин; неисправность рычага.'}},
  {title:'NASA SP-4001, “Project Mercury: A Chronology”, Part II (B)', url:'https://www.nasa.gov/history/SP-4001/p2b.htm', note:{en:'31 January 1961: thrust “considerably higher than planned”, early LOX depletion, escape rocket; 24 March 1961: Mercury-Redstone Booster Development flight before any crewed launch.', ru:'31 января 1961 года: тяга «значительно выше запланированной», раннее исчерпание жидкого кислорода, срабатывание САС; 24 марта 1961 года: испытательный пуск носителя «Меркурий-Редстоун» перед пилотируемыми полётами.'}},
  {title:'NASA SP-4001, “Project Mercury: A Chronology”, Part III (A)', url:'https://www.nasa.gov/history/SP-4001/p3a.htm', note:{en:'5 May 1961, Freedom 7: 116.5 statute miles, 302 miles downrange, slightly less than 12 g on re-entry, about 5 minutes weightless. 29 November 1961: MA-5 with Enos, returned after two orbits instead of three because a roll reaction jet failed and an inverter overheated.', ru:'5 мая 1961 года, «Фридом-7»: 116,5 сухопутной мили, 302 мили дальности, чуть меньше 12 g на входе, около 5 минут невесомости. 29 ноября 1961 года: MA-5 с Эносом, возвращённый после двух витков вместо трёх из-за отказа реактивного сопла управления по крену и перегрева инвертора.'}},
  {title:'NASA (1961), “Proceedings of a Conference on Results of the First U.S. Manned Suborbital Space Flight”', url:'https://ntrs.nasa.gov/api/citations/19720065957/downloads/19720065957.pdf', note:{en:'MR-3: inertial cutoff velocity 7,388 ft/s at T+2 min 22 s; peak 11.0 g at about 83,000 ft; re-entry attitude 40° heat shield down.', ru:'MR-3: инерциальная скорость в момент выключения 7388 фут/с на T+2 мин 22 с; пик 11,0 g на высоте около 83 000 футов.'}},
  {title:'NOAA, NASA, US Air Force (1976), “U.S. Standard Atmosphere, 1976”, NASA-TM-X-74335', url:'https://ntrs.nasa.gov/citations/19770009539', note:{en:'Air density at 0–120 km used in the re-entry model.', ru:'Плотность воздуха на высотах 0–120 км в модели входа.'}},
  {title:'NASA SP-4001, “Project Mercury: A Chronology”, Part III (B)', url:'https://www.nasa.gov/history/SP-4001/p3b.htm', note:{en:'4 November 1962: Enos died of shigella dysentery, “in no way related” to his flight.', ru:'4 ноября 1962 года: Энос умер от шигеллёзной дизентерии, «никак не связанной» с полётом.'}},
  {title:'Guinness World Records, “The cat who reached the Milky Way”, 17 October 2025', url:'https://www.guinnessworldrecords.com/news/2025/10/the-cat-who-reached-the-milky-way-anniversary-of-the-first-feline-to-fly-to-space', note:{en:'18 October 1963, Véronique AGI from the Sahara; about five minutes weightless; euthanised two months later; little learned from the autopsy; statue at the International Space University.', ru:'18 октября 1963 года, ракета «Вероника» AGI из Сахары; около пяти минут невесомости; умерщвлена через два месяца; вскрытие почти ничего не дало; памятник в Международном космическом университете.'}},
  {title:'National Space Society, “Corrections section: Félicette, not Félix”, 2017', url:'https://nss.org/this-space-availables-corrections-section-felicette-not-felix/', note:{en:'Launched from Hammaguir, Algeria; about 157 km; flight of about 15 minutes.', ru:'Старт с полигона Хаммагир (Алжир); около 157 км; полёт около 15 минут.'}},
  {title:'NASA NSSDCA, “Zond 5” (archived)', url:'https://web.archive.org/web/2020/https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1968-076A', note:{en:'Launch 14 September 1968; around the Moon on 18 September at 1,950 km; ballistic re-entry and Indian Ocean splashdown on 21 September; tortoises lost about 10 % of body weight but stayed active.', ru:'Запуск 14 сентября 1968 года; облёт Луны 18 сентября на расстоянии 1950 км; баллистический вход и приводнение в Индийском океане 21 сентября; черепахи потеряли около 10 % веса, но остались активными.'}},
  {title:'The Moscow Times, “Mice Die but Lizards Survive a Month in Space”, 21 May 2013', url:'https://themoscowtimes.com/archive/mice-die-but-lizards-survive-a-month-in-space', note:{en:'Bion-M No. 1: fewer than half of 53 mice and other rodents survived; all 15 lizards survived.', ru:'«Бион-М» № 1: выжило меньше половины из 53 мышей и других грызунов; все 15 ящериц выжили.'}},
  {title:'Interfax, “Ten mice didn\'t survive space flight in Bion-M No. 2 capsule”, 19 September 2025', url:'https://interfax.com/newsroom/top-stories/113900/', note:{en:'Oleg Orlov (IBMP): 10 of 75 mice died; launch 20 August from Baikonur; landing in the Orenburg region.', ru:'Олег Орлов (ИМБП): погибли 10 из 75 мышей; запуск 20 августа с Байконура; посадка в Оренбургской области.'}},
  {title:'L. David, “Russia\'s Noah\'s Ark returns to Earth”, 19 September 2025', url:'https://www.leonarddavid.com/russias-noahs-ark-returns-to-earth/', note:{en:'Bion-M No. 2: 30 days, nearly circular orbit at about 97°, radiation at least ten times that of Bion-M No. 1.', ru:'«Бион-М» № 2: 30 суток, почти круговая орбита наклонением около 97°, радиация как минимум в десять раз выше, чем у «Биона-М» № 1.'}},
  {title:'“Message from the First Dog in Space Received 45 Years Too Late”, Dogs in the News, 3 November 2002 (archived)', url:'https://web.archive.org/web/20060108184335/http://www.dogsinthenews.com/issues/0211/articles/021103a.htm', note:{en:'Quotes Oleg Gazenko at a Moscow news conference in 1998.', ru:'Цитата Олега Газенко на пресс-конференции в Москве в 1998 году.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderHeat(); renderBal(); renderMatrix();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__passenger = {periodMin:periodMin, freeFallMin:freeFallMin, heatRun:heatRun, kleiberW:kleiberW, orbitAt:orbitAt, HEAT:HEAT, rho:rho, SCALE_H:SCALE_H,
  fly:fly, allenEggersG:allenEggersG, BAL:BAL, SHEPARD_V:SHEPARD_V, HAM_V:HAM_V, MR2:MR2, MR3:MR3, FLIGHTS:FLIGHTS, QS:QS, MPH:MPH, NMI:NMI, SMI:SMI, FT:FT};
