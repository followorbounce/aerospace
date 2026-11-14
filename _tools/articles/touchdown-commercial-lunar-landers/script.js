/* ============ CONSTANTS ============ */
var GM_M = 4902.800;                 // km³/s², lunar GM, JPL DE440 (Park et al. 2021) [1]
var R_M = 1737.4;                    // km, volumetric mean radius, NASA Moon fact sheet [2]
var G_M = 1.62;                      // m/s², lunar surface gravity, NASA Moon fact sheet [2]
var G0 = 9.80665;                    // m/s², standard gravity (defines Isp in seconds)
var NMI = 1.852, FT = 0.3048, MPH = 0.44704;
var H_APOLLO = 60*NMI, HP_APOLLO = 50000*FT/1000;   // 60 nmi parking orbit, 50,000 ft descent periapsis [3]
var ISP_DPS = 305;                   // s, Apollo descent engine requirement at end of duty cycle [3]
var D2R = Math.PI/180;
/* in Russian, four-digit numbers stay unspaced, as in the body text */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function deg(v, d){ return fmt(v, d) + '°'; }
function ms(v, d){ return fmt(v, d === undefined ? 1 : d) + T(' m/s','\u00a0м/с'); }
function mtr(v){ return num(Math.round(v)) + T(' m','\u00a0м'); }
function kmx(v, d){ return fmt(v, d === undefined ? 1 : d) + T(' km','\u00a0км'); }
function sec(v){ return num(Math.round(v)) + T(' s','\u00a0с'); }
function pct(v, d){ return fmt(100*v, d === undefined ? 1 : d) + ' %'; }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }
/* Russian plural: 1 посадка, 2 посадки, 5 посадок */
function plural(n, one, few, many){ var a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? few : many; }

/* ============ ORBITS ============ */
function vCirc(hKm){ return Math.sqrt(GM_M/(R_M + hKm)); }                       // km/s
function visViva(rKm, aKm){ return Math.sqrt(GM_M*(2/rKm - 1/aKm)); }             // km/s
function escapeV(){ return Math.sqrt(2*GM_M/R_M); }
function gSurf(){ return GM_M/(R_M*R_M)*1000; }                                    // m/s²
/* descent from a circular orbit at hA: Hohmann burn to periapsis hP, then kill the periapsis speed,
   then hold a vertical/hover phase of tV seconds against lunar gravity. A lower bound: the real braking burn
   also pays steering and gravity losses, which this sum leaves out. */
function descentBudget(hA, hP, tV){
  var rA = R_M + hA, rP = R_M + hP, a = (rA + rP)/2;
  var deorbit = (vCirc(hA) - visViva(rA, a))*1000, brake = visViva(rP, a)*1000, grav = G_M*tV;
  return {deorbit:deorbit, brake:brake, grav:grav, total:deorbit + brake + grav};
}
function propFrac(dv, isp){ return 1 - Math.exp(-dv/(isp*G0)); }
/* hovering at thrust = weight: dm/dt = −m g/(Isp g0), so a fraction f of the mass lasts (Isp g0/g) ln(1/(1−f)) */
function hoverTime(f, isp){ return isp*G0/G_M*Math.log(1/(1 - f)); }
function fallSpeed(hM){ return Math.sqrt(2*G_M*hM); }
function fallTime(hM){ return Math.sqrt(2*hM/G_M); }

/* ============ CH3 — DESCENT BUDGET ============ */
var dbP = document.getElementById('dbP'), dbV = document.getElementById('dbV'), dbI = document.getElementById('dbI');
dbP.value = HP_APOLLO;                                              /* exact 50,000 ft, not the step-rounded attribute */
function renderDB(){
  var hP = +dbP.value, tV = +dbV.value, isp = +dbI.value, b = descentBudget(H_APOLLO, hP, tV), f = propFrac(b.total, isp);
  document.getElementById('dbPVal').textContent = kmx(hP, 2); dbP.setAttribute('aria-valuetext', kmx(hP, 2) + ', ' + T('braking from ','торможение с ') + ms(b.brake, 0));
  document.getElementById('dbVVal').textContent = sec(tV); dbV.setAttribute('aria-valuetext', sec(tV) + ', ' + T('gravity cost ','гравитационные потери ') + ms(b.grav, 0));
  document.getElementById('dbIVal').textContent = sec(isp); dbI.setAttribute('aria-valuetext', sec(isp) + ', ' + T('propellant ','топливо ') + pct(f, 1));
  var svg = document.getElementById('dbSvg'); svg.innerHTML = ''; aria(svg);
  var L = 120, R = 462, top = 30, bh = 30, gap = 22, max = 2400;
  function X(v){ return L + v/max*(R - L); }
  [0, 500, 1000, 1500, 2000].forEach(function(v){ ns('line', {x1:X(v), y1:top - 6, x2:X(v), y2:top + 3*(bh + gap), stroke:'#e4e4de'}, svg); txt(svg, X(v), top + 3*(bh + gap) + 14, num(v), 'svg-small', 'middle'); });
  txt(svg, R, top + 3*(bh + gap) + 30, T('Δv, m/s','Δv, м/с'), 'svg-small', 'end');
  var rows = [[T('deorbit','сход с орбиты'), b.deorbit, '#2f5aa1'], [T('braking','торможение'), b.brake, '#0b0b0c'], [T('vertical phase','вертикальный участок'), b.grav, '#b5452a']];
  var acc = 0;
  rows.forEach(function(r, j){
    var y = top + j*(bh + gap);
    txt(svg, L - 8, y + bh/2 + 4, r[0], 'svg-small', 'end');
    ns('rect', {x:X(acc), y:y, width:Math.max(1, X(acc + r[1]) - X(acc)), height:bh, fill:r[2]}, svg);
    txt(svg, X(acc + r[1]) + 5, y + bh/2 + 4, num(r[1]) + T(' m/s','\u00a0м/с'), 'svg-small svg-halo');
    acc += r[1];
  });
  ns('line', {x1:X(b.total), y1:top - 10, x2:X(b.total), y2:top + 3*(bh + gap) - gap + 4, stroke:'#b5452a', 'stroke-dasharray':'4 3', 'stroke-width':1.4}, svg);
  txt(svg, Math.min(X(b.total), R) - 4, top - 14, T('total ','всего ') + num(b.total) + T(' m/s','\u00a0м/с'), 'svg-small svg-halo', 'end');
  cells(document.getElementById('dbReadout'), [
    [T('SPEED AT PERIAPSIS','СКОРОСТЬ В ПЕРИЦЕНТРЕ'), ms(b.brake, 0) + ' · ' + num(b.brake*3.6) + T(' km/h','\u00a0км/ч')],
    [T('TOTAL Δv (LOWER BOUND)','ПОЛНАЯ Δv (НИЖНЯЯ ОЦЕНКА)'), ms(b.total, 0)],
    [T('PROPELLANT, SHARE OF START MASS','ТОПЛИВО, ДОЛЯ НАЧАЛЬНОЙ МАССЫ'), pct(f, 1)],
    [T('LANDED PER TONNE AT START','НА ПОВЕРХНОСТИ С КАЖДОЙ ТОННЫ'), num((1 - f)*1000) + T(' kg','\u00a0кг')],
    [T('HOVER BOUGHT BY 1 % OF MASS','ЗАВИСАНИЕ НА 1\u00a0% МАССЫ'), sec(hoverTime(0.01, isp)), true]
  ]);
  hud1.textContent = kmx(hP, 1); hud2.textContent = ms(b.brake, 0);
  document.getElementById('dbStatus').innerHTML = T('Every second spent going straight down costs ','Каждая секунда вертикального спуска стоит ') + ms(G_M, 2) + T(' of Δv just to stand still against lunar gravity: a minute of hovering is ',' Δv только на то, чтобы не падать: минута зависания — это ') + ms(60*G_M, 0) + T(', about ',', около ') + pct(propFrac(60*G_M, isp), 1) + T(' of the lander\'s mass at this Isp.',' массы аппарата при таком удельном импульсе.');
}
[dbP, dbV, dbI].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('dbPre'), null); renderDB(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#dbPre .btn'), function(btn){ btn.addEventListener('click', function(){
  var p = this.getAttribute('data-p');
  dbP.value = p === 'apollo' ? HP_APOLLO : +p;
  if(this.hasAttribute('data-v')) dbV.value = this.getAttribute('data-v');
  if(this.hasAttribute('data-i')) dbI.value = this.getAttribute('data-i');
  pressGroup(this.parentNode, this); renderDB(); }); });

/* ============ CH4 — THE ALTITUDE FILTER ============ */
/* A model of the HAKUTO-R M1 failure mode: the onboard filter compares each altimeter reading with its own prediction and
   rejects any reading that differs by more than a threshold. If the ground falls away suddenly (a crater rim) by more than the
   threshold, the true reading is thrown out and the estimate stays wrong by that amount. */
function altFilter(stepKm, threshKm, f, isp){
  var rejected = stepKm > threshKm, err = rejected ? stepKm*1000 : 0;
  var tH = hoverTime(f, isp);
  return {rejected:rejected, err:err, hover:tH, fall:rejected ? fallTime(err) : 0, impact:rejected ? fallSpeed(err) : 0};
}
var afS = document.getElementById('afS'), afT = document.getElementById('afT'), afF = document.getElementById('afF');
function renderAF(){
  var s = +afS.value, th = +afT.value, f = +afF.value/100, r = altFilter(s, th, f, ISP_DPS);
  document.getElementById('afSVal').textContent = kmx(s, 2); afS.setAttribute('aria-valuetext', kmx(s, 2) + ', ' + (r.rejected ? T('reading rejected','показание отброшено') : T('reading accepted','показание принято')));
  document.getElementById('afTVal').textContent = kmx(th, 2); afT.setAttribute('aria-valuetext', kmx(th, 2));
  document.getElementById('afFVal').textContent = pct(f, 1); afF.setAttribute('aria-valuetext', pct(f, 1) + ', ' + T('hover ','зависание ') + sec(r.hover));
  var svg = document.getElementById('afSvg'); svg.innerHTML = ''; aria(svg);
  var L = 46, R = 466, top = 24, B = 226, hMax = 8;   // km
  function X(u){ return L + u*(R - L); } function Y(h){ return B - h/hMax*(B - top); }
  [0, 2, 4, 6, 8].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, num(v), 'svg-small', 'end'); });
  txt(svg, L, 14, T('height, km (schematic)','высота, км (схема)'), 'svg-small');
  var rim = 0.32, ground0 = 0.6 + s;    // ground before the rim sits s km above the crater floor (both drawn above the floor at 0.6)
  // true ground: plateau, rim, crater floor
  ns('path', {d:'M' + X(0) + ',' + Y(ground0) + ' L' + X(rim) + ',' + Y(ground0) + ' L' + X(rim + 0.05) + ',' + Y(0.6) + ' L' + X(1) + ',' + Y(0.6) + ' L' + X(1) + ',' + Y(0) + ' L' + X(0) + ',' + Y(0) + 'Z', fill:'#e9e6dc', stroke:'#0b0b0c', 'stroke-width':1.2}, svg);
  txt(svg, X(0.66), Y(0.3) + 4, T('crater floor','дно кратера'), 'svg-small', 'middle');
  txt(svg, X(0.12), Y(ground0) + 14, T('ground before the rim','поверхность до вала'), 'svg-small');
  // believed ground
  var believed = r.rejected ? 0.6 + s : 0.6;
  ns('line', {x1:X(rim), y1:Y(believed), x2:X(1), y2:Y(believed), stroke:'#b5452a', 'stroke-dasharray':'6 4', 'stroke-width':1.6}, svg);
  txt(svg, X(0.98), Y(believed) - 6, T('where the lander thinks the ground is','где аппарат «видит» поверхность'), 'svg-small svg-halo', 'end');
  // trajectory: descending diagonal, then (if rejected) slow vertical descent ends at believed ground, then free fall
  var hStart = Math.min(7.6, ground0 + 1.6), xEnd = 0.8;
  var d = 'M' + X(0.02) + ',' + Y(hStart) + ' L' + X(xEnd) + ',' + Y(believed + 0.02);
  ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  if(r.rejected){
    ns('line', {x1:X(xEnd), y1:Y(believed), x2:X(xEnd), y2:Y(0.6), stroke:'#b5452a', 'stroke-width':2, 'stroke-dasharray':'2 3'}, svg);
    ns('polygon', {points:X(xEnd) + ',' + (Y(0.6) - 1) + ' ' + (X(xEnd) - 5) + ',' + (Y(0.6) - 10) + ' ' + (X(xEnd) + 5) + ',' + (Y(0.6) - 10), fill:'#b5452a'}, svg);
    txt(svg, X(xEnd) - 8, Y(0.6) - 10, T('free fall ','свободное падение ') + kmx(r.err/1000, 2), 'svg-small svg-halo', 'end');   // left of the drop, just above the floor: on the right it runs off a phone-width chart, higher up it meets the step label
  } else {
    ns('circle', {cx:X(xEnd), cy:Y(0.6) - 4, r:4, fill:'#2f5aa1'}, svg);
    txt(svg, X(xEnd) + 8, Y(0.6) - 8, T('touchdown','касание'), 'svg-small svg-halo');
  }
  ns('line', {x1:X(rim + 0.025), y1:Y(ground0) - 4, x2:X(rim + 0.025), y2:Y(0.6) + 4, stroke:'#5f5f59', 'stroke-width':1}, svg);
  txt(svg, X(rim + 0.035), (Y(ground0) + Y(0.6))/2 + 4, T('step ','скачок ') + kmx(s, 1), 'svg-small svg-halo');
  cells(document.getElementById('afReadout'), [
    [T('NEW READING','НОВОЕ ПОКАЗАНИЕ'), r.rejected ? T('rejected as a sensor fault','отброшено как сбой датчика') : T('accepted','принято')],
    [T('ALTITUDE ERROR','ОШИБКА ВЫСОТЫ'), r.rejected ? kmx(r.err/1000, 2) : T('none','нет')],
    [T('HOVER UNTIL DRY','ЗАВИСАНИЕ ДО ОПУСТОШЕНИЯ БАКОВ'), sec(r.hover)],
    [T('FALL TIME','ВРЕМЯ ПАДЕНИЯ'), r.rejected ? sec(r.fall) : '—'],
    [T('IMPACT SPEED','СКОРОСТЬ УДАРА'), r.rejected ? ms(r.impact, 0) + ' · ' + num(r.impact*3.6) + T(' km/h','\u00a0км/ч') : T('soft landing','мягкая посадка'), true]
  ]);
  hud1.textContent = r.rejected ? kmx(r.err/1000, 2) : kmx(0, 0); hud2.textContent = r.rejected ? ms(r.impact, 0) : '—';
  document.getElementById('afStatus').innerHTML = r.rejected
    ? T('The real reading jumps by more than the filter allows, so the software decides the sensor has failed and keeps its own estimate. It slows to a hover over ground that is not there, burns its reserve for ','Настоящее показание скачет сильнее, чем допускает фильтр: программа решает, что отказал датчик, и оставляет собственную оценку. Аппарат зависает над поверхностью, которой нет, сжигает запас за ') + sec(r.hover) + T(' and then falls the whole error.',' и падает с высоты, равной всей ошибке.')
    : T('The jump is within the threshold, so the reading is accepted and the estimate snaps to the real ground. Make the step bigger than the threshold to see the failure.','Скачок в пределах допуска: показание принято, и оценка сразу привязывается к настоящей поверхности. Сделайте скачок больше допуска, чтобы увидеть отказ.');
}
[afS, afT, afF].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('afPre'), null); renderAF(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#afPre .btn'), function(btn){ btn.addEventListener('click', function(){
  afS.value = this.getAttribute('data-s'); if(this.hasAttribute('data-t')) afT.value = this.getAttribute('data-t'); pressGroup(this.parentNode, this); renderAF(); }); });

/* ============ CH5 — LANDING ELLIPSE ON A SYNTHETIC HAZARD FIELD ============ */
/* Synthetic terrain, not a real site: craters with a cumulative size distribution N(>D) ∝ D⁻², 10–500 m, over 6 × 6 km.
   Any point inside a crater counts as a hazard (steep walls). The target is kept 40 m clear, as planners pick it from orbit. */
var FIELD = 6000, CELL = 5, NC = FIELD/CELL, CLEAR = 40;
function lcg(seed){ var s = seed >>> 0; return function(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }; }
var CRATERS = (function(){
  var rnd = lcg(20240119), out = [];
  while(out.length < 6000){
    var D = Math.min(500, 10/Math.sqrt(1 - rnd()*(1 - 0.0004))), x = (rnd() - 0.5)*FIELD, y = (rnd() - 0.5)*FIELD;
    if(Math.hypot(x, y) < D/2 + CLEAR) continue;
    out.push({x:x, y:y, r:D/2});
  }
  return out;
})();
var HAZ = (function(){
  var g = new Uint8Array(NC*NC);
  CRATERS.forEach(function(c){
    var i0 = Math.max(0, Math.floor((c.x - c.r + FIELD/2)/CELL)), i1 = Math.min(NC - 1, Math.floor((c.x + c.r + FIELD/2)/CELL));
    var j0 = Math.max(0, Math.floor((c.y - c.r + FIELD/2)/CELL)), j1 = Math.min(NC - 1, Math.floor((c.y + c.r + FIELD/2)/CELL));
    for(var i = i0; i <= i1; i++) for(var j = j0; j <= j1; j++){
      var cx = (i + 0.5)*CELL - FIELD/2, cy = (j + 0.5)*CELL - FIELD/2;
      if((cx - c.x)*(cx - c.x) + (cy - c.y)*(cy - c.y) <= c.r*c.r) g[j*NC + i] = 1;
    }
  });
  return g;
})();
function hazAt(x, y){
  var i = Math.floor((x + FIELD/2)/CELL), j = Math.floor((y + FIELD/2)/CELL);
  if(i < 0 || j < 0 || i >= NC || j >= NC) return 1;               // off the mapped field: treat as unknown = unsafe
  return HAZ[j*NC + i];
}
function hazFraction(){ var n = 0; for(var k = 0; k < HAZ.length; k++) n += HAZ[k]; return n/HAZ.length; }
/* fixed Gaussian samples (Box–Muller from a seeded generator) so the numbers do not flicker */
var GAUSS = (function(){ var rnd = lcg(7), out = []; for(var k = 0; k < 3000; k++){ var u = 1 - rnd(), v = rnd(), m = Math.sqrt(-2*Math.log(u)); out.push([m*Math.cos(2*Math.PI*v), m*Math.sin(2*Math.PI*v)]); } return out; })();
var CROSS = 0.6;   // cross-track σ = 0.6 × along-track σ (the 2.4 : 4 shape of ISRO's site [12]; an assumption for the others)
function safeWithin(x, y, d){
  if(!hazAt(x, y)) return true;
  if(d <= 0) return false;
  for(var ring = 1; ring <= 4; ring++){ var rr = d*ring/4; for(var a = 0; a < 12; a++){ var t = a*Math.PI/6 + ring*0.26; if(!hazAt(x + rr*Math.cos(t), y + rr*Math.sin(t))) return true; } }
  return false;
}
function ellipseRisk(sAlong, divert){
  var bad = 0, badD = 0;
  GAUSS.forEach(function(g){ var x = g[0]*sAlong, y = g[1]*sAlong*CROSS; if(hazAt(x, y)) bad++; if(!safeWithin(x, y, divert)) badD++; });
  return {p:bad/GAUSS.length, pDivert:badD/GAUSS.length};
}
/* fraction of a 2-D Gaussian inside its k-sigma ellipse */
function inK(k){ return 1 - Math.exp(-k*k/2); }
var elS = document.getElementById('elS'), elD = document.getElementById('elD');
elS.value = Math.log10(4000/6);                                    /* Chandrayaan-3's 4 km box read as ±3σ */
function renderEL(){
  var sA = Math.pow(10, +elS.value), dv = +elD.value, rk = ellipseRisk(sA, dv);
  var lenA = 6*sA, lenC = 6*sA*CROSS;
  document.getElementById('elSVal').textContent = sA < 100 ? fmt(sA, 1) + T(' m','\u00a0м') : mtr(sA); elS.setAttribute('aria-valuetext', (sA < 100 ? fmt(sA, 1) + T(' m','\u00a0м') : mtr(sA)) + ', ' + T('3-sigma ellipse ','эллипс 3σ ') + (lenA < 1000 ? mtr(lenA) : kmx(lenA/1000, 1)) + T(' long',' в длину'));
  document.getElementById('elDVal').textContent = mtr(dv); elD.setAttribute('aria-valuetext', mtr(dv));
  var svg = document.getElementById('elSvg'); svg.innerHTML = ''; aria(svg);
  var S = 300, cx = 240, cy = 165, view = Math.min(FIELD, Math.max(160, lenA*1.5)), k = S/view;
  ns('rect', {x:cx - S/2, y:cy - S/2, width:S, height:S, fill:'#f3f1ea', stroke:'#0b0b0c'}, svg);
  var clip = ns('clipPath', {id:'elClip'}, svg); ns('rect', {x:cx - S/2, y:cy - S/2, width:S, height:S}, clip);
  var g = ns('g', {'clip-path':'url(#elClip)'}, svg), minR = view/600;
  CRATERS.forEach(function(c){ if(c.r < minR || Math.abs(c.x) > view/2 + c.r || Math.abs(c.y) > view/2 + c.r) return; ns('circle', {cx:cx + c.x*k, cy:cy - c.y*k, r:Math.max(0.6, c.r*k), fill:'#cfc8b6', stroke:'#8a8474', 'stroke-width':0.5}, g); });
  if(dv > 0) ns('ellipse', {cx:cx, cy:cy, rx:3*sA*k + dv*k, ry:3*sA*CROSS*k + dv*k, fill:'none', stroke:'#2f5aa1', 'stroke-dasharray':'3 3', 'stroke-width':1}, g);
  ns('ellipse', {cx:cx, cy:cy, rx:Math.max(1.5, 3*sA*k), ry:Math.max(1.5, 3*sA*CROSS*k), fill:'rgba(181,69,42,0.10)', stroke:'#b5452a', 'stroke-width':1.8}, g);
  ns('circle', {cx:cx, cy:cy, r:2.5, fill:'#0b0b0c'}, g);
  // scale bar
  var bar = [10, 20, 50, 100, 200, 500, 1000, 2000].filter(function(v){ return v*k <= 110; }).pop() || 10;
  ns('line', {x1:cx - S/2 + 10, y1:cy + S/2 + 14, x2:cx - S/2 + 10 + bar*k, y2:cy + S/2 + 14, stroke:'#0b0b0c', 'stroke-width':2}, svg);
  txt(svg, cx - S/2 + 14 + bar*k, cy + S/2 + 18, bar >= 1000 ? kmx(bar/1000, 0) : mtr(bar), 'svg-small');
  txt(svg, cx + S/2, cy + S/2 + 18, T('view ','обзор ') + (view >= 1000 ? kmx(view/1000, 1) : mtr(view)) + T(' across',' в поперечнике'), 'svg-small', 'end');
  txt(svg, cx - S/2, cy - S/2 - 8, T('synthetic crater field · target at centre','синтетическое поле кратеров · цель в центре'), 'svg-small');
  cells(document.getElementById('elReadout'), [
    [T('3σ ELLIPSE','ЭЛЛИПС 3σ'), (lenA < 1000 ? mtr(lenA) : kmx(lenA/1000, 1)) + ' × ' + (lenC < 1000 ? mtr(lenC) : kmx(lenC/1000, 1))],
    [T('SHARE INSIDE IT','ДОЛЯ ВНУТРИ'), pct(inK(3), 1)],
    [T('LANDS ON A HAZARD, BLIND','ПОПАДАНИЕ В ОПАСНОСТЬ ВСЛЕПУЮ'), pct(rk.p, 1)],
    [T('… WITH THIS DIVERT','… С ТАКИМ УВОДОМ'), pct(rk.pDivert, 1)],
    [T('HAZARD COVER OF THE WHOLE FIELD','ДОЛЯ ОПАСНОЙ ПЛОЩАДИ ПОЛЯ'), pct(hazFraction(), 1), true]
  ]);
  document.getElementById('elStatus').innerHTML = (sA*3 < CLEAR
    ? T('The whole ellipse fits inside the cleared spot around the target: this is what “pinpoint” buys — you can aim between the craters.','Весь эллипс помещается в чистое пятно вокруг цели: вот что даёт «точная» посадка — можно целиться между кратерами.')
    : T('The ellipse is bigger than any clear spot, so the landing point is a lottery over the terrain. Hazard detection and a divert at the end turn it back into a choice.','Эллипс больше любого чистого пятна, и точка посадки превращается в лотерею. Обнаружение опасностей и увод в конце снова превращают её в выбор.'));
}
[elS, elD].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('elPre'), null); renderEL(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#elPre .btn'), function(btn){ btn.addEventListener('click', function(){
  elS.value = Math.log10(+this.getAttribute('data-s')); elD.value = this.getAttribute('data-d'); pressGroup(this.parentNode, this); renderEL(); }); });

/* ============ CH6 — TIP-OVER ============ */
/* Rigid lander, point mass at height h above the middle of its base, footpads b either side, standing square to a slope θ.
   Moving sideways downhill at v, the downhill footpad catches and becomes a pivot (no sliding, no leg stroke, no bounce).
   It tips if the rotational energy about the pad can lift the centre of mass over it. */
function tipGeom(h, b, thDeg){
  var t = thDeg*D2R, rx = h*Math.sin(t) - b*Math.cos(t), rz = h*Math.cos(t) + b*Math.sin(t);
  return {rx:rx, rz:rz, L:Math.hypot(rx, rz)};
}
function staticTip(h, b){ return Math.atan(b/h)/D2R; }
function vCrit(h, b, thDeg){
  var g = tipGeom(h, b, thDeg);
  if(g.rx >= 0) return 0;                                            // already past the pad: tips standing still
  return g.L/g.rz*Math.sqrt(2*G_M*(g.L - g.rz));
}
var tpH = document.getElementById('tpH'), tpB = document.getElementById('tpB'), tpS = document.getElementById('tpS'), tpV = document.getElementById('tpV');
function renderTP(){
  var h = +tpH.value, b = +tpB.value, th = +tpS.value, v = +tpV.value, vc = vCrit(h, b, th), st = staticTip(h, b), tips = v >= vc;
  document.getElementById('tpHVal').textContent = fmt(h, 2) + T(' m','\u00a0м'); tpH.setAttribute('aria-valuetext', fmt(h, 2) + T(' m','\u00a0м'));
  document.getElementById('tpBVal').textContent = fmt(b, 2) + T(' m','\u00a0м'); tpB.setAttribute('aria-valuetext', fmt(b, 2) + T(' m','\u00a0м'));
  document.getElementById('tpSVal').textContent = deg(th, 1); tpS.setAttribute('aria-valuetext', deg(th, 1));
  document.getElementById('tpVVal').textContent = ms(v, 2); tpV.setAttribute('aria-valuetext', ms(v, 2) + ', ' + (tips ? T('tips over','опрокидывается') : T('stays up','устоит')));
  /* side view */
  var svg = document.getElementById('tpSvg'); svg.innerHTML = ''; aria(svg);
  var cx = 150, cy = 190, k = 30, t = th*D2R, ux = Math.cos(t), uy = Math.sin(t);          // along-slope (downhill = +x, down = +y in SVG)
  function P(s, n){ return [cx + (s*ux + n*Math.sin(t))*k, cy + (s*uy - n*Math.cos(t))*k]; }  // s along slope, n normal
  var g0 = P(-4.5, 0), g1 = P(4.5, 0);
  ns('polygon', {points:g0[0] + ',' + g0[1] + ' ' + g1[0] + ',' + g1[1] + ' ' + g1[0] + ',300 ' + g0[0] + ',300', fill:'#e9e6dc', stroke:'#0b0b0c'}, svg);
  var bodyW = Math.min(b*0.55, 1.2), top = Math.min(2*h, 6.2);
  var c1 = P(-bodyW, 0.5), c2 = P(bodyW, 0.5), c3 = P(bodyW, top), c4 = P(-bodyW, top);
  ns('polygon', {points:[c1, c2, c3, c4].map(function(p){ return p[0] + ',' + p[1]; }).join(' '), fill:'#ffffff', stroke:'#0b0b0c', 'stroke-width':1.4}, svg);
  [[-1, -bodyW], [1, bodyW]].forEach(function(s){ var a = P(s[1], 1.0), f = P(s[0]*b, 0); ns('line', {x1:a[0], y1:a[1], x2:f[0], y2:f[1], stroke:'#0b0b0c', 'stroke-width':2}, svg); ns('circle', {cx:f[0], cy:f[1], r:3.5, fill:'#0b0b0c'}, svg); });
  var cm = P(0, h), pad = P(b, 0);
  ns('line', {x1:pad[0], y1:pad[1], x2:cm[0], y2:cm[1], stroke:'#5f5f59', 'stroke-dasharray':'3 3'}, svg);
  ns('line', {x1:cm[0], y1:cm[1], x2:cm[0], y2:Math.max(cm[1] + 4, pad[1] + 40), stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  ns('circle', {cx:cm[0], cy:cm[1], r:6, fill:'#2f5aa1'}, svg);
  txt(svg, cm[0] - 10, cm[1] - 8, T('centre of mass','центр масс'), 'svg-small svg-halo', 'end');
  txt(svg, pad[0] + 6, pad[1] - 8, T('pivot','ось'), 'svg-small svg-halo');
  if(v > 0){ ns('line', {x1:cm[0] + 10, y1:cm[1], x2:cm[0] + 10 + Math.min(70, v*30), y2:cm[1], stroke:'#b5452a', 'stroke-width':2.2}, svg); ns('polygon', {points:(cm[0] + 14 + Math.min(70, v*30)) + ',' + cm[1] + ' ' + (cm[0] + 6 + Math.min(70, v*30)) + ',' + (cm[1] - 5) + ' ' + (cm[0] + 6 + Math.min(70, v*30)) + ',' + (cm[1] + 5), fill:'#b5452a'}, svg); }
  txt(svg, 12, 18, T('side view, downhill to the right','вид сбоку, склон вниз вправо'), 'svg-small');
  /* envelope: critical speed vs slope */
  var L = 330, R = 468, Tp = 30, B = 230, vMax = 4, sMax = 30;
  function X(s){ return L + s/sMax*(R - L); } function Y(u){ return B - Math.min(u, vMax)/vMax*(B - Tp); }
  [0, 1, 2, 3, 4].forEach(function(u){ ns('line', {x1:L, y1:Y(u), x2:R, y2:Y(u), stroke:'#e4e4de'}, svg); txt(svg, L - 5, Y(u) + 4, num(u), 'svg-small', 'end'); });
  [0, 10, 20, 30].forEach(function(s){ txt(svg, X(s), B + 14, s + '°', 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L - 26, Tp - 12, T('tip-over speed, m/s','скорость опрокидывания, м/с'), 'svg-small');   // short enough to stay inside the chart and clear of the side-view title
  txt(svg, R, B + 30, T('slope','уклон'), 'svg-small', 'end');
  var d = '', area = 'M' + X(0) + ',' + B;
  for(var s = 0; s <= sMax; s += 0.25){ var y = Y(vCrit(h, b, s)); d += (s ? 'L' : 'M') + X(s).toFixed(1) + ',' + y.toFixed(1); area += 'L' + X(s).toFixed(1) + ',' + y.toFixed(1); }
  ns('path', {d:area + 'L' + X(sMax) + ',' + B + 'Z', fill:'rgba(47,90,161,0.10)'}, svg);
  ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.8}, svg);
  if(st <= sMax){ ns('line', {x1:X(st), y1:Tp, x2:X(st), y2:B, stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg); txt(svg, X(st) - 3, Tp + 10, T('static limit','статический предел'), 'svg-tiny svg-halo', 'end'); }
  ns('circle', {cx:X(Math.min(th, sMax)), cy:Y(v), r:5.5, fill:tips ? '#b5452a' : '#0b0b0c', stroke:'#fff', 'stroke-width':1.5}, svg);
  txt(svg, (L + R)/2, Tp + 6, T('stays up below the curve','ниже кривой — устоит'), 'svg-tiny svg-halo', 'middle');
  cells(document.getElementById('tpReadout'), [
    [T('STATIC TIP-OVER SLOPE','СТАТИЧЕСКИЙ УГОЛ ОПРОКИДЫВАНИЯ'), deg(st, 1)],
    [T('CRITICAL SPEED ON THIS SLOPE','КРИТИЧЕСКАЯ СКОРОСТЬ НА ЭТОМ УКЛОНЕ'), ms(vc, 2)],
    [T('HEIGHT ÷ HALF-WIDTH','ВЫСОТА ÷ ПОЛУШИРИНА'), fmt(h/b, 2)],
    [T('VERDICT','ИТОГ'), tips ? T('tips over','опрокидывается') : T('stays upright','остаётся стоять')]
  ]);
  hud1.textContent = fmt(h, 2) + T(' m','\u00a0м'); hud2.textContent = ms(v, 2);
  document.getElementById('tpStatus').innerHTML = tips
    ? T('The sideways speed carries the centre of mass over the downhill footpad. Lower the centre of mass, widen the stance, or arrive slower.','Боковая скорость переносит центр масс за нижнюю опору. Опустите центр масс, расставьте опоры шире или садитесь медленнее.')
    : T('The centre of mass rises toward the pad, stops short and falls back: the lander rocks and settles. Margin: ','Центр масс поднимается к опоре, не доходит и падает назад: аппарат качнётся и встанет. Запас: ') + ms(vc - v, 2) + '.';
}
[tpH, tpB, tpS, tpV].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('tpPre'), null); renderTP(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#tpPre .btn'), function(btn){ btn.addEventListener('click', function(){
  ['h', 'b', 's', 'v'].forEach(function(key){ var val = this.getAttribute('data-' + key); if(val !== null) document.getElementById('tp' + key.toUpperCase()).value = val; }, this);
  pressGroup(this.parentNode, this); renderTP(); }); });

/* ============ CH7 — SCORECARD ============ */
/* out: up = landed upright, mission done; side = touched down but not upright; crash = destroyed; none = never reached the Moon */
var ATTEMPTS = [
  {d:'2019-01-03', en:'Chang\'e 4', ru:'«Чанъэ-4»', op:['CNSA (China)','CNSA (Китай)'], who:'gov', out:'up', site:['Von Kármán crater, far side','кратер фон Карман, обратная сторона'], t:['Soft landing; first on the far side. Rover Yutu-2 [30].','Мягкая посадка, первая на обратной стороне. Луноход «Юйту-2» [30].']},
  {d:'2019-04-11', en:'Beresheet', ru:'«Берешит»', op:['SpaceIL & IAI (Israel)','SpaceIL и IAI (Израиль)'], who:'priv', out:'crash', site:['Mare Serenitatis','Море Ясности'], t:['Crashed: main engine shut down after an IMU restart command; contact lost 150 m up at 500 km/h [4][5].','Разбился: главный двигатель выключился после команды перезапустить инерциальный измерительный блок; связь потеряна на высоте 150\u00a0м при 500\u00a0км/ч [4][5].']},
  {d:'2019-09-06', en:'Vikram (Chandrayaan-2)', ru:'«Викрам» («Чандраян-2»)', op:['ISRO (India)','ISRO (Индия)'], who:'gov', out:'crash', site:['south polar highlands','южное полярное высокогорье'], t:['Crashed in the final braking phase; debris found 750 m from the impact by a volunteer, confirmed by LRO [7].','Разбился на последнем участке торможения; обломки в 750\u00a0м от места удара нашёл доброволец, подтвердил LRO [7].']},
  {d:'2020-12-01', en:'Chang\'e 5', ru:'«Чанъэ-5»', op:['CNSA (China)','CNSA (Китай)'], who:'gov', out:'up', site:['near Mons Rümker, Oceanus Procellarum','у горы Рюмкер, Океан Бурь'], t:['Soft landing; returned samples to Earth [31].','Мягкая посадка; образцы доставлены на Землю [31].']},
  {d:'2023-04-25', en:'HAKUTO-R M1', ru:'HAKUTO-R M1', op:['ispace (Japan)','ispace (Япония)'], who:'priv', out:'crash', site:['Atlas crater','кратер Атлас'], t:['Crashed: the software rejected true altimeter readings at a crater rim, thought it was down about 5 km up, ran dry and fell [8][9].','Разбился: программа отбросила верные показания высотомера над валом кратера, «села» примерно в 5\u00a0км над поверхностью, израсходовала топливо и упала [8][9].']},
  {d:'2023-08-19', en:'Luna-25', ru:'«Луна-25»', op:['Roscosmos (Russia)','Роскосмос (Россия)'], who:'gov', out:'crash', site:['crashed before descent (Pontécoulant G)','упал до начала спуска (кратер Понтекулан G)'], t:['Crashed: the burn into the pre-landing orbit ran 127 s instead of 84 s; impact about 400 km short of the planned site [10][11].','Разбился: импульс перехода на предпосадочную орбиту длился 127\u00a0с вместо 84\u00a0с; удар примерно в 400\u00a0км от намеченного места [10][11].']},
  {d:'2023-08-23', en:'Chandrayaan-3', ru:'«Чандраян-3»', op:['ISRO (India)','ISRO (Индия)'], who:'gov', out:'up', site:['near 69.4° S, 32.3° E','около 69,4° ю. ш., 32,3° в. д.'], t:['Soft landing; Vikram and Pragyan worked until put to sleep on 4 September [12][13].','Мягкая посадка; «Викрам» и «Прагьян» работали до перевода в спящий режим 4 сентября [12][13].']},
  {d:'2024-01-08', en:'Peregrine Mission One', ru:'Peregrine Mission One («Перегрин»)', op:['Astrobotic (USA, CLPS)','Astrobotic (США, CLPS)'], who:'priv', out:'none', site:['never attempted (Sinus Viscositatis planned)','посадка не предпринималась (планировалась в Заливе Вязкости)'], t:['No landing attempt: a stuck pressure-control valve ruptured the oxidiser tank after launch; burned up over the South Pacific on 18 January [17][18].','Посадки не было: после старта из-за заклинившего клапана регулирования давления разорвался бак окислителя; 18 января аппарат сгорел над южной частью Тихого океана [17][18].']},
  {d:'2024-01-19', en:'SLIM', ru:'SLIM', op:['JAXA (Japan)','JAXA (Япония)'], who:'gov', out:'side', site:['slope of Shioli crater','склон кратера Сиоли'], t:['Pinpoint landing about 55 m from target (about 10 m from its chosen point) after losing one main engine at 50 m; came to rest in the wrong attitude, apparently upside down, solar cells facing west; survived three lunar nights [15][16][36].','Точная посадка примерно в 55\u00a0м от цели (около 10\u00a0м от выбранной точки) после потери одного главного двигателя на высоте 50\u00a0м; аппарат замер в нерасчётном положении, по-видимому вверх дном, солнечными элементами на запад; пережил три лунные ночи [15][16][36].']},
  {d:'2024-02-22', en:'Odysseus (IM-1)', ru:'«Одиссей» (IM-1)', op:['Intuitive Machines (USA, CLPS)','Intuitive Machines (США, CLPS)'], who:'priv', out:'side', site:['near Malapert A, about 1.5 km from its intended site','у кратера Малаперт A, примерно в 1,5\u00a0км от намеченного места'], t:['Landed too fast sideways after its laser rangefinders were left disabled; a footpad caught and it tipped onto its side; worked about seven days [19][20].','Сел со слишком большой боковой скоростью — лазерные дальномеры остались отключены; опора зацепилась, и аппарат лёг на бок; работал около семи суток [19][20].']},
  {d:'2024-06-01', en:'Chang\'e 6', ru:'«Чанъэ-6»', op:['CNSA (China)','CNSA (Китай)'], who:'gov', out:'up', site:['Apollo crater, far side','кратер Аполлон, обратная сторона'], t:['Soft landing (2 June, Beijing time); returned the first far-side samples [32].','Мягкая посадка (2 июня по пекинскому времени); доставлены первые образцы с обратной стороны [32].']},
  {d:'2025-03-02', en:'Blue Ghost M1', ru:'Blue Ghost M1', op:['Firefly Aerospace (USA, CLPS)','Firefly Aerospace (США, CLPS)'], who:'priv', out:'up', site:['Mare Crisium, near Mons Latreille','Море Кризисов, у горы Латрей'], t:['Upright, within its 100 m target; 346 hours of daylight operations plus 5 hours into the night; all ten payloads worked [22][24].','Сел стоя, в пределах 100-метровой цели; 346 часов работы днём и ещё 5 часов ночью; все десять приборов отработали [22][24].']},
  {d:'2025-03-06', en:'Athena (IM-2)', ru:'«Афина» (IM-2)', op:['Intuitive Machines (USA, CLPS)','Intuitive Machines (США, CLPS)'], who:'priv', out:'side', site:['Mons Mouton, near the south pole','гора Мутон, у южного полюса'], t:['Landed on its side in a shadowed crater about 250 m from target (NASA: about 400 m) after noisy altimeter readings; ended about 13 hours later [25][26].','Лёг на бок в затенённом кратере примерно в 250\u00a0м от цели (по данным NASA — около 400\u00a0м) после «шумных» показаний высотомера; работа завершилась примерно через 13 часов [25][26].']},
  {d:'2025-06-05', en:'Resilience (HAKUTO-R M2)', ru:'«Резилиенс» (HAKUTO-R M2)', op:['ispace (Japan)','ispace (Япония)'], who:'priv', out:'crash', site:['Mare Frigoris','Море Холода'], t:['Crashed (6 June, Japan time): the laser rangefinder was late to give valid readings, so it could not slow down in time [27][28][29].','Разбился (6 июня по японскому времени): лазерный дальномер слишком поздно выдал верные показания, и аппарат не успел затормозить [27][28][29].']}
];
var AS_OF = '2026-11-12';
function daysBetween(a, b){ return Math.round((Date.parse(b) - Date.parse(a))/864e5); }
function tally(list){ var c = {up:0, side:0, crash:0, none:0}; list.forEach(function(x){ c[x.out]++; }); return c; }
var OUT_LABEL = {up:['upright','стоя'], side:['down, not upright','сел, но не стоя'], crash:['crashed','разбился'], none:['never got there','не долетел']};
var OUT_COLOR = {up:'#2f5aa1', side:'#a8741a', crash:'#b5452a', none:'#5f5f59'};
var scWho = 'all';
function renderSC(){
  var list = ATTEMPTS.filter(function(x){ return scWho === 'all' || x.who === scWho; }), c = tally(list);
  var svg = document.getElementById('scSvg'); svg.innerHTML = ''; aria(svg);
  var L = 30, R = 460, y0 = 120, t0 = Date.UTC(2019, 0, 1), t1 = Date.UTC(2027, 0, 1);
  function X(iso){ return L + (Date.parse(iso) - t0)/(t1 - t0)*(R - L); }
  ns('line', {x1:L, y1:y0, x2:R, y2:y0, stroke:'#0b0b0c'}, svg);
  for(var yr = 2019; yr <= 2027; yr++){ var x = X(yr + '-01-01'); ns('line', {x1:x, y1:y0 - 4, x2:x, y2:y0 + 4, stroke:'#0b0b0c'}, svg); if(yr < 2027) txt(svg, x + (X((yr + 1) + '-01-01') - x)/2, y0 + 18, String(yr), 'svg-small', 'middle'); }
  ns('line', {x1:X(AS_OF), y1:28, x2:X(AS_OF), y2:y0, stroke:'#5f5f59', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, X(AS_OF) - 3, 24, T('12 Nov 2026','12 нояб. 2026'), 'svg-tiny svg-halo', 'end');
  var stack = {};
  list.forEach(function(a){
    var key = a.d.slice(0, 4) + (+a.d.slice(5, 7) > 6 ? 'b' : 'a'); stack[key] = (stack[key] || 0) + 1;
    var x = X(a.d), y = y0 - 12 - (stack[key] - 1)*17, col = OUT_COLOR[a.out];
    if(a.out === 'up') ns('circle', {cx:x, cy:y, r:6, fill:col}, svg);
    else if(a.out === 'side') ns('rect', {x:x - 5.5, y:y - 5.5, width:11, height:11, fill:col, transform:'rotate(45 ' + x + ' ' + y + ')'}, svg);
    else if(a.out === 'crash'){ ns('line', {x1:x - 5.5, y1:y - 5.5, x2:x + 5.5, y2:y + 5.5, stroke:col, 'stroke-width':3}, svg); ns('line', {x1:x - 5.5, y1:y + 5.5, x2:x + 5.5, y2:y - 5.5, stroke:col, 'stroke-width':3}, svg); }
    else ns('circle', {cx:x, cy:y, r:5.5, fill:'none', stroke:col, 'stroke-width':2}, svg);
  });
  var lx = L, ly = 160;
  ['up', 'side', 'crash', 'none'].forEach(function(k, j){
    var x = lx + (j % 2)*215, y = ly + Math.floor(j/2)*20, col = OUT_COLOR[k];
    if(k === 'up') ns('circle', {cx:x + 6, cy:y - 4, r:5, fill:col}, svg);
    else if(k === 'side') ns('rect', {x:x + 1.5, y:y - 8.5, width:9, height:9, fill:col, transform:'rotate(45 ' + (x + 6) + ' ' + (y - 4) + ')'}, svg);
    else if(k === 'crash'){ ns('line', {x1:x + 1, y1:y - 9, x2:x + 11, y2:y + 1, stroke:col, 'stroke-width':2.6}, svg); ns('line', {x1:x + 1, y1:y + 1, x2:x + 11, y2:y - 9, stroke:col, 'stroke-width':2.6}, svg); }
    else ns('circle', {cx:x + 6, cy:y - 4, r:4.5, fill:'none', stroke:col, 'stroke-width':2}, svg);
    txt(svg, x + 18, y, T(OUT_LABEL[k][0], OUT_LABEL[k][1]) + ' — ' + c[k], 'svg-small');
  });
  /* table */
  var h = '<caption class="sr-cap">' + T('Lunar landing attempts 2019–2026','Попытки посадки на Луну в 2019–2026 годах') + '</caption><thead><tr><th scope="col">' + T('Date (UTC)','Дата (UTC)') + '</th><th scope="col">' + T('Mission','Миссия') + '</th><th scope="col">' + T('Who','Кто') + '</th><th scope="col">' + T('Outcome','Итог') + '</th><th scope="col">' + T('What happened','Что произошло') + '</th></tr></thead><tbody>';
  list.forEach(function(a){
    var p = a.d.split('-');
    h += '<tr><td class="mono">' + p[2] + '.' + p[1] + '.' + p[0] + '</td><th scope="row">' + T(a.en, a.ru) + '<span class="sc-site">' + T(a.site[0], a.site[1]) + '</span></th><td>' + T(a.op[0], a.op[1]) + '</td><td><span class="sc-out sc-' + a.out + '">' + T(OUT_LABEL[a.out][0], OUT_LABEL[a.out][1]) + '</span></td><td>' + T(a.t[0], a.t[1]) + '</td></tr>';
  });
  document.getElementById('scTable').innerHTML = h + '</tbody>';
  var reached = list.length - c.none, last = ATTEMPTS[ATTEMPTS.length - 1];
  cells(document.getElementById('scReadout'), [
    [T('MISSIONS LISTED','МИССИЙ В СПИСКЕ'), String(list.length)],
    [T('UPRIGHT AND WORKING','СТОЯ И В РАБОТЕ'), c.up + ' ' + T('of','из') + ' ' + reached + T(' that reached the Moon',' долетевших')],
    [T('DOWN BUT NOT UPRIGHT','СЕЛИ, НО НЕ СТОЯ'), String(c.side)],
    [T('CRASHED','РАЗБИЛИСЬ'), String(c.crash)],
    [T('DAYS SINCE THE LAST ATTEMPT','ДНЕЙ С ПОСЛЕДНЕЙ ПОПЫТКИ'), num(daysBetween(last.d, AS_OF)) + T(' (as of 12 Nov 2026)',' (на 12 нояб. 2026)'), true]
  ]);
  document.getElementById('scStatus').innerHTML = scWho === 'priv'
    ? T('Privately built landers: one upright success (Blue Ghost M1) in ',"Частные аппараты: один успех «стоя» (Blue Ghost M1) из ") + reached + T(' arrivals; two more touched down on their sides and kept working for a while.',' прилётов; ещё два сели на бок и какое-то время работали.')
    : scWho === 'gov'
    ? T('Government landers: China went three for three; India crashed in 2019 and landed in 2023; Russia\'s first attempt since the Soviet Luna programme crashed; Japan\'s SLIM hit its target but came to rest apparently upside down.','Государственные аппараты: Китай — три из трёх; Индия разбилась в 2019-м и села в 2023-м; первая со времён советских «Лун» попытка России закончилась ударом; японский SLIM попал в цель, но замер, по-видимому, вверх дном.')
    : T('Fourteen landing missions flew between January 2019 and mid-2025; five ended upright and working. No lander has tried since 5 June 2025.','С января 2019 по середину 2025 года к Луне летели четырнадцать посадочных миссий; пять закончились стоя и в работе. С 5 июня 2025 года попыток больше не было.');
}
Array.prototype.forEach.call(document.querySelectorAll('#scPre .btn'), function(btn){ btn.addEventListener('click', function(){ scWho = this.getAttribute('data-w'); pressGroup(this.parentNode, this); renderSC(); }); });

/* ============ CH8 — LEGACY ============ */
var TIMELINE = [
  ['1969', 'Apollo 11\'s descent stage lands with 63.5 seconds of hover propellant left [3]; the LM\'s legs were designed for 10 ft/s down and 4 ft/s sideways on slopes up to 12° [21].', 'Посадочная ступень «Аполлона-11» садится с запасом топлива на 63,5 секунды зависания [3]; опоры ЛМ рассчитаны на 10 фут/с по вертикали и 4 фут/с вбок на уклонах до 12° [21].'],
  ['2019', 'Chang\'e 4 lands on the far side on 3 January [30]; Beresheet, the first privately funded attempt, crashes on 11 April [4]; Vikram crashes on 6 September [7].', '3 января «Чанъэ-4» садится на обратной стороне [30]; 11 апреля разбивается «Берешит» — первая попытка на частные средства [4]; 6 сентября разбивается «Викрам» [7].'],
  ['2020', 'Chang\'e 5 lands near Mons Rümker on 1 December and returns samples [31].', '1 декабря «Чанъэ-5» садится у горы Рюмкер и доставляет образцы [31].'],
  ['2023', 'HAKUTO-R M1 falls from about 5 km on 25 April [9]; Luna-25 crashes on 19 August [11]; Chandrayaan-3 lands on 23 August [13].', '25 апреля HAKUTO-R M1 падает примерно с 5\u00a0км [9]; 19 августа разбивается «Луна-25» [11]; 23 августа садится «Чандраян-3» [13].'],
  ['2024', 'Peregrine never reaches the Moon and re-enters on 18 January [17]; SLIM lands within about 55 m of its target on 19 January (UTC) [15]; Odysseus tips over on 22 February [19]; Chang\'e 6 lands in Apollo crater on 1 June (UTC) [32]; SLIM is switched off on 23 August [16].', '18 января Peregrine, так и не долетев до Луны, сгорает в атмосфере [17]; 19 января (UTC) SLIM садится примерно в 55\u00a0м от цели [15]; 22 февраля «Одиссей» ложится на бок [19]; 1 июня (UTC) «Чанъэ-6» садится в кратере Аполлон [32]; 23 августа SLIM выключают [16].'],
  ['2025', 'Blue Ghost M1 lands upright in Mare Crisium on 2 March [24]; Athena lands on its side near the south pole on 6 March [25]; Resilience crashes in Mare Frigoris on 5 June (UTC) [28].', '2 марта Blue Ghost M1 садится стоя в Море Кризисов [24]; 6 марта «Афина» ложится на бок у южного полюса [25]; 5 июня (UTC) «Резилиенс» разбивается в Море Холода [28].'],
  ['2026', 'As of 12 November no further landing has been tried. Chang\'e 7 misses its August window [33]; Blue Moon MK1 and IM-3 slip to the first part of 2027 and Blue Ghost M2 to later in 2027 [34]; Griffin-1, expected in September no earlier than November [34], is now listed for no earlier than January 2027 [35].', 'На 12 ноября новых попыток посадки не было. «Чанъэ-7» пропускает августовское окно [33]; Blue Moon MK1 и IM-3 переносятся на начало 2027 года, Blue Ghost M2 — на более поздний срок 2027 года [34]; Griffin-1, которого в сентябре ждали не раньше ноября [34], теперь значится не раньше января 2027 года [35].']
];
var REFERENCES = [
  {title:'R. S. Park, W. M. Folkner, J. G. Williams, D. H. Boggs (2021), “The JPL Planetary and Lunar Ephemerides DE440 and DE441”, Astronomical Journal 161, 105', url:'https://doi.org/10.3847/1538-3881/abd414', note:{en:'Lunar GM = 4,902.800 km³/s², used for every orbital speed here.', ru:'GM Луны = 4902,800\u00a0км³/с², используется для всех орбитальных скоростей в справочнике.'}},
  {title:'NASA NSSDCA, “Moon Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'Volumetric mean radius 1,737.4 km; surface gravity 1.62 m/s²; escape velocity 2.38 km/s; mean distance from Earth (semimajor axis) 384,400 km.', ru:'Средний объёмный радиус 1737,4\u00a0км; ускорение свободного падения 1,62\u00a0м/с²; вторая космическая скорость 2,38\u00a0км/с; среднее расстояние от Земли (большая полуось) 384\u00a0400\u00a0км.'}},
  {title:'W. R. Hammock, E. C. Currie, A. E. Fisher (1973), “Apollo Experience Report: Descent Propulsion System”, NASA TN D-7143', url:'https://ntrs.nasa.gov/citations/19730011150', note:{en:'Hohmann transfer from a 60-nmi circular orbit to a 60-nmi × 50,000-ft descent orbit, then powered descent from 50,000 ft; engine requirements 10:1 throttling and 305 lbf·s/lbm specific impulse; the hover phase was the last 140 s of Apollo 11\'s burn, which ended with 63.5 s of hover time left.', ru:'Гомановский перелёт с круговой орбиты 60\u00a0миль на орбиту спуска 60\u00a0миль × 50\u00a0000\u00a0футов, затем активный спуск с 50\u00a0000\u00a0футов; требования к двигателю — дросселирование 10:1 и удельный импульс 305\u00a0с; зависание — последние 140\u00a0с работы двигателя «Аполлона-11», после посадки оставалось 63,5\u00a0с зависания.'}},
  {title:'J. Davis (2019), “Software Command to Fix Faulty Sensor Doomed Beresheet”, The Planetary Society, 17 April 2019', url:'https://www.planetary.org/articles/software-command-doomed-beresheet', note:{en:'An inertial measurement unit shut down; the activation command sent to restart it set off a chain reaction that shut the engine down during descent.', ru:'Отключился один инерциальный измерительный блок; команда на его повторное включение запустила цепочку событий, выключившую двигатель во время спуска.'}},
  {title:'Times of Israel (2019), “5-6 attempts to restart Israeli moon lander\'s engine failed, investigation finds”, 17 April 2019', url:'https://www.timesofisrael.com/5-6-attempts-to-restart-israeli-moon-landers-engine-failed-investigation-finds/', note:{en:'Problems began about 14 km up; five or six attempts to restart the engine; contact lost 150 m above the surface at 500 km/h.', ru:'Проблемы начались примерно на высоте 14\u00a0км; пять-шесть попыток перезапустить двигатель; связь потеряна в 150\u00a0м над поверхностью при скорости 500\u00a0км/ч.'}},
  {title:'NASA (2019), “Beresheet Impact Site Spotted”, 15 May 2019', url:'https://www.nasa.gov/feature/goddard/2019/lro-beresheet-impact-site-spotted', note:{en:'The landing attempt of 11 April 2019; LRO imaged the site on 22 April and found a dark smudge about 10 m wide.', ru:'Попытка посадки 11 апреля 2019 года; LRO снял место 22 апреля и нашёл тёмное пятно шириной около 10\u00a0м.'}},
  {title:'NASA (2019), “Vikram Lander Found”, 2 December 2019', url:'https://www.nasa.gov/image-article/vikram-lander-found/', note:{en:'Touchdown scheduled for 6 September (7 September in India); impact at 70.8810° S, 22.7840° E; Shanmuga Subramanian spotted debris about 750 m northwest of the main crash site.', ru:'Посадка была назначена на 6 сентября (7 сентября по индийскому времени); удар в точке 70,8810° ю. ш., 22,7840° в. д.; Шанмуга Субраманиан заметил обломки примерно в 750\u00a0м к северо-западу от места падения.'}},
  {title:'NASA (2023), “NASA\'s LRO Views Impact Site of HAKUTO-R Mission 1 Moon Lander”, 23 May 2023', url:'https://www.nasa.gov/centers-and-facilities/goddard/nasas-lro-views-impact-site-of-hakuto-r-mission-1-moon-lander/', note:{en:'LRO imaged the area on 26 April 2023, the day after the attempted landing; debris at 47.581° N, 44.094° E.', ru:'LRO снял район 26 апреля 2023 года, на следующий день после попытки посадки; обломки в точке 47,581° с. ш., 44,094° в. д.'}},
  {title:'Universe Today (2023), “HAKUTO-R\'s Software Got Confused at the Last Minute, Causing it to Crash into the Moon”', url:'https://universetoday.com/161661/hakuto-rs-software-got-confused-at-the-last-minute-causing-it-to-crash-into-the-moon', note:{en:'Reports ispace\'s findings: the lander estimated its altitude as zero while about 5 km up, after its software rejected the altimeter as faulty over a crater rim; it descended slowly until the propellant ran out, then fell; the landing site had been changed after the design review.', ru:'Изложение выводов ispace: аппарат считал свою высоту нулевой, находясь примерно в 5\u00a0км над поверхностью, после того как программа над валом кратера сочла высотомер неисправным; он медленно снижался, пока не кончилось топливо, и упал; место посадки сменили после защиты проекта.'}},
  {title:'SpacePolicyOnline (2023), “Luna-25\'s Engines Fired Longer Than Planned”', url:'https://spacepolicyonline.com/news/luna-25s-engines-fired-longer-than-planned/', note:{en:'Roscosmos head Yuri Borisov (via TASS): the engine fired for 127 seconds instead of 84 when commanded on 19 August to enter the pre-landing orbit; landing had been scheduled for 21 August.', ru:'Глава Роскосмоса Юрий Борисов (по данным ТАСС): 19 августа при переходе на предпосадочную орбиту двигатель проработал 127 секунд вместо 84; посадка планировалась на 21 августа.'}},
  {title:'NASA (2023), “NASA\'s LRO Observes Crater Likely from Luna 25 Impact”, 31 August 2023', url:'https://www.nasa.gov/humans-in-space/nasas-lro-observes-crater-likely-from-luna-25-impact/', note:{en:'Impact on 19 August 2023 on the inner rim of Pontécoulant G crater, about 400 km short of the intended site; a new crater about 10 m across.', ru:'Удар 19 августа 2023 года о внутренний склон кратера Понтекулан G, примерно в 400\u00a0км от намеченного места; новый кратер около 10\u00a0м в поперечнике.'}},
  {title:'ISRO, “Chandrayaan-3 Details”', url:'https://www.isro.gov.in/Chandrayaan3_Details.html', note:{en:'Prime landing site 4 km × 2.4 km at 69.367621° S, 32.348126° E; lander sensors include a laser altimeter, laser Doppler velocimeter and hazard detection and avoidance camera; lander module 1,752 kg including the 26 kg rover.', ru:'Основное место посадки 4 × 2,4\u00a0км в точке 69,367621° ю. ш., 32,348126° в. д.; среди датчиков посадочного модуля — лазерный высотомер, лазерный доплеровский измеритель скорости и камера обнаружения и обхода опасностей; модуль 1752\u00a0кг вместе с луноходом массой 26\u00a0кг.'}},
  {title:'ISRO, “Chandrayaan-3” mission updates', url:'https://www.isro.gov.in/Chandrayaan3.html', note:{en:'23 August 2023: “Chandrayaan-3 has successfully soft-landed on the moon”; 4 September: lander and rover in sleep mode.', ru:'23 августа 2023 года: «Чандраян-3» успешно совершил мягкую посадку на Луну; 4 сентября: посадочный модуль и луноход переведены в спящий режим.'}},
  {title:'ISAS/JAXA (2023), “20 minutes of terror: SLIM will attempt a pinpoint accurate landing on the lunar surface”, 25 August 2023', url:'https://cosmos.isas.jaxa.jp/?p=7409', note:{en:'Goal: landing within 100 m; crater-matching navigation against stored maps; hazard images at 50 m; two-step landing (rear leg first, then tipping forward onto the upper supports) on a slope averaging 6–7°; five crushable 3-D-printed aluminium lattice legs.', ru:'Цель — посадка с точностью до 100\u00a0м; навигация по сопоставлению кратеров с бортовыми картами; съёмка опасностей с высоты 50\u00a0м; двухэтапная посадка (сначала задняя опора, затем наклон вперёд на верхние опоры) на склон со средним уклоном 6–7°; пять сминаемых опор из алюминиевой решётки, напечатанной на 3D-принтере.'}},
  {title:'JAXA (2024), “Results of the SLIM lunar landing and the current status”, press release, 25 January 2024', url:'https://global.jaxa.jp/press/2024/01/20240125-1_e.html', note:{en:'Landed at 0:20 JST on 20 January 2024 about 55 m east of the original target; position accuracy before the avoidance manoeuvre about 10 m or less, possibly 3–4 m; thrust from one main engine most likely lost at 50 m; not at the planned attitude, solar cells facing west; 100 m goal achieved.', ru:'Посадка в 0:20 по японскому времени 20 января 2024 года примерно в 55\u00a0м к востоку от исходной цели; точность до манёвра уклонения — около 10\u00a0м или лучше, возможно 3–4\u00a0м; тяга одного из главных двигателей, по всей видимости, пропала на высоте 50\u00a0м; ориентация не та, что планировалась, солнечные элементы смотрят на запад; цель 100\u00a0м достигнута.'}},
  {title:'JAXA (2024), “Conclusion of SLIM lunar surface operations”, press release, 26 August 2024', url:'https://global.jaxa.jp/press/2024/08/20240826-1_e.html', note:{en:'Operations concluded at 22:40 JST on 23 August 2024 after no contact since 28 April; SLIM survived three lunar nights; landing precision about 10 m from the target point.', ru:'Работа завершена в 22:40 по японскому времени 23 августа 2024 года — связи не было с 28 апреля; SLIM пережил три лунные ночи; точность посадки — около 10\u00a0м от точки прицеливания.'}},
  {title:'NASA (2024), “NASA Science, Astrobotic Peregrine Mission One Concludes”', url:'https://www.nasa.gov/news-release/nasa-science-astrobotic-peregrine-mission-one-concludes/', note:{en:'A propulsion problem after launch on 8 January prevented a soft landing; controlled re-entry over the South Pacific at about 4:04 p.m. EST on 18 January 2024, after 10 days 13 hours in space.', ru:'Неисправность двигательной установки после старта 8 января сделала мягкую посадку невозможной; управляемый вход в атмосферу над южной частью Тихого океана около 16:04 по восточному времени 18 января 2024 года, после 10 суток 13 часов полёта.'}},
  {title:'SpacePolicyOnline (2024), “Independent Review Confirms Bad Valve Doomed Astrobotic\'s Peregrine-1 Mission”', url:'https://spacepolicyonline.com/news/independent-review-confirms-bad-valve-doomed-astrobotics-peregrine-1-mission/', note:{en:'The review board found a pressure control valve failed to seal, letting helium flow into the oxidiser tank until it ruptured; the failure was reproduced on the ground.', ru:'Комиссия установила, что клапан регулирования давления потерял герметичность и гелий поступал в бак окислителя, пока тот не разорвался; отказ воспроизведён на Земле.'}},
  {title:'AmericaSpace (2024), “IM-1 Struggles With Communications After Tipping Over”, 26 February 2024', url:'https://www.americaspace.com/2024/02/26/im-1-struggles-with-communications-after-tipping-over/', note:{en:'A safety switch on the laser rangefinders was not disabled before launch; engineers fed NASA\'s Navigation Doppler Lidar into the guidance instead; touchdown at about 6 mph down and 2 mph sideways; a footpad caught and the lander tipped; it settled about 1.5 km from Malapert A.', ru:'Перед стартом не сняли предохранительную блокировку лазерных дальномеров; инженеры подключили к навигации доплеровский лидар NASA; касание на скорости около 6\u00a0миль/ч вниз и 2\u00a0миль/ч вбок; опора зацепилась, и аппарат опрокинулся; он остановился примерно в 1,5\u00a0км от кратера Малаперт A.'}},
  {title:'NASA (2024), “NASA Collects First Surface Science in Decades via Commercial Moon Mission”, 1 March 2024', url:'https://www.nasa.gov/missions/artemis/clps/nasa-collects-first-surface-science-in-decades-via-commercial-moon-mission/', note:{en:'Odysseus touched down on 22 February; the Navigation Doppler Lidar collected data during powered descent; the instruments ceased operations seven days after landing.', ru:'«Одиссей» сел 22 февраля; доплеровский лидар собирал данные на активном спуске; приборы прекратили работу через семь суток после посадки.'}},
  {title:'W. F. Rogers (1972), “Apollo Experience Report: Lunar Module Landing Gear Subsystem”, NASA TN D-6850', url:'https://ntrs.nasa.gov/citations/19720018253', note:{en:'Final design: 167-inch tread radius; touchdown envelope 10 ft/s vertical and 4 ft/s horizontal (for vertical speed up to 7 ft/s); effective slope up to 12° including protuberances and footpad penetration; sliding friction 0.4; Apollo 11 touched down at about 2.1 and 1.7 ft/s horizontally.', ru:'Окончательный вариант: радиус расстановки опор 167\u00a0дюймов; допустимые скорости касания — 10 фут/с по вертикали и 4 фут/с по горизонтали (при вертикальной до 7 фут/с); эффективный уклон до 12° с учётом неровностей и погружения опор; коэффициент трения скольжения 0,4; «Аполлон-11» коснулся поверхности при горизонтальных скоростях около 2,1 и 1,7 фут/с.'}},
  {title:'NASA NSSDCA Master Catalog, “Blue Ghost Mission 1 (Firefly)” (2025-010A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2025-010A', note:{en:'Launched 15 January 2025 with Resilience; landed 2 March in Mare Crisium at 18.562° N, 61.810° E, about 4 km from Mons Latreille; 346 hours of daylight operations and 5 hours into the night; last signal about 23:15 UT on 16 March.', ru:'Запуск 15 января 2025 года вместе с «Резилиенс»; посадка 2 марта в Море Кризисов в точке 18,562° с. ш., 61,810° в. д., примерно в 4\u00a0км от горы Латрей; 346 часов работы днём и 5 часов ночью; последний сигнал около 23:15 UT 16 марта.'}},
  {title:'Firefly Aerospace, “Blue Ghost Mission 1”', url:'https://fireflyspace.com/missions/blue-ghost-mission-1/', note:{en:'2 m (6.6 ft) tall and 3.5 m (11.5 ft) wide, “designed for stability with shock absorbing feet, a low center of mass, and a wide footprint”; vision-based terrain-relative navigation and hazard avoidance in the final hour; ten payloads.', ru:'Высота 2\u00a0м, ширина 3,5\u00a0м; аппарат «спроектирован устойчивым: амортизирующие опоры, низкий центр масс и широкая база»; в последний час — навигация по изображениям рельефа и обход опасностей; десять приборов.'}},
  {title:'Firefly Aerospace (2025), “Firefly Aerospace Becomes First Commercial Company to Successfully Land on the Moon”, 2 March 2025', url:'https://fireflyspace.com/news/firefly-aerospace-becomes-first-commercial-company-to-successfully-land-on-the-moon/', note:{en:'Touchdown at 2:34 a.m. CST on 2 March “within its 100-meter landing target”; the first fully successful commercial soft landing.', ru:'Касание в 2:34 по центральному времени США 2 марта «в пределах 100-метровой зоны»; первая полностью успешная мягкая посадка коммерческого аппарата.'}},
  {title:'NASA NSSDCA Master Catalog, “Intuitive Machines 2 (PRIME-1)”', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=PRIME-1', note:{en:'Nova-C “Athena”, a tall hexagonal cylinder on six legs; launched 27 February 2025; touched down 6 March at about 17:30 UT on Mons Mouton at 84.7906° S, 29.1957° E, resting on its side.', ru:'Nova-C «Афина» — высокий шестигранный цилиндр на шести опорах; запуск 27 февраля 2025 года; касание 6 марта около 17:30 UT на горе Мутон в точке 84,7906° ю. ш., 29,1957° в. д.; аппарат лежит на боку.'}},
  {title:'SpacePolicyOnline (2025), “IM-2 Mission Ends Less Than A Day After Lunar Landing”', url:'https://spacepolicyonline.com/news/im-2-mission-ends-one-day-after-lunar-landing/', note:{en:'Intuitive Machines: 250 m from the intended spot, on its side, in a crater where sunlight could not reach the solar cells; NASA: more than 400 m; “noisy” readings from a laser altimeter; mission ended about 12 h 45 min after landing.', ru:'Intuitive Machines: 250\u00a0м от намеченной точки, на боку, в кратере, куда не попадает солнце; NASA: более 400\u00a0м; «шумные» показания лазерного высотомера; работа завершилась примерно через 12\u00a0ч 45\u00a0мин после посадки.'}},
  {title:'Spaceflight Now (2025), “ispace\'s Resilience lander crash lands on the Moon”, 6 June 2025', url:'https://spaceflightnow.com/2025/06/06/ispaces-resilience-lander-crash-lands-on-the-moon/', note:{en:'Target Mare Frigoris at about 60.5° N, 4.6° W; braking burn from about 20 km at about 6,000 km/h; the laser rangefinder “experienced delays in obtaining valid measurement values” and the lander could not decelerate enough; it carried the Tenacious micro-rover.', ru:'Цель — Море Холода около 60,5° с. ш., 4,6° з. д.; торможение примерно с 20\u00a0км при скорости около 6000\u00a0км/ч; лазерный дальномер «с задержкой выдавал достоверные значения», и аппарат не смог затормозить; на борту был микроровер Tenacious.'}},
  {title:'NASA (2025), “NASA\'s LRO Views ispace HAKUTO-R Mission 2 Moon Lander Impact Site”, 20 June 2025', url:'https://www.nasa.gov/missions/lro/nasas-lro-views-ispace-hakuto-r-mission-2-moon-lander-impact-site/', note:{en:'Hard landing on 5 June 2025, UTC; a dark smudge with a faint bright halo where the lander hit.', ru:'Жёсткая посадка 5 июня 2025 года по UTC; тёмное пятно со слабым светлым ореолом в месте удара.'}},
  {title:'Universe Today (2025), “HAKUTO-R Mission 2\'s Crash was Caused by its Laser Range Finder”', url:'https://www.universetoday.com/articles/hakuto-r-mission-2s-crash-was-caused-by-its-laser-range-finder', note:{en:'Reports ispace\'s review: rangefinder performance degraded in flight (installation error judged unlikely); the lander hit at about 42 m/s.', ru:'Изложение выводов ispace: характеристики дальномера ухудшились в полёте (ошибку установки сочли маловероятной); аппарат ударился на скорости около 42\u00a0м/с.'}},
  {title:'C. Li et al. (2019), “Chang\'E-4 initial spectroscopic identification of lunar far-side mantle-derived materials”, Nature 569, 378–382', url:'https://doi.org/10.1038/s41586-019-1189-0', note:{en:'Chang\'e 4 landed on 3 January 2019 in Von Kármán crater, South Pole–Aitken basin; Yutu-2\'s first spectra.', ru:'«Чанъэ-4» сел 3 января 2019 года в кратере фон Карман бассейна Южный полюс — Эйткен; первые спектры «Юйту-2».'}},
  {title:'China Aerospace Science and Technology Corporation / Xinhua (2020), “China\'s Chang\'e-5 lands on moon to retrieve samples”', url:'https://english.spacechina.com/n17212/c3071222/content.html', note:{en:'Landed at 11:11 p.m. Beijing time on 1 December 2020 near 43.1° N, 51.8° W, north of Mons Rümker.', ru:'Посадка в 23:11 по пекинскому времени 1 декабря 2020 года около 43,1° с. ш., 51,8° з. д., к северу от горы Рюмкер.'}},
  {title:'Space.com (2024), “China lands Chang\'e 6 sample-return probe on far side of the moon”', url:'https://www.space.com/china-change-6-lands-on-moon-far-side-sample-return-mission', note:{en:'Touchdown inside Apollo crater at 6:23 a.m. Beijing time on 2 June 2024 (1 June in UTC), with Queqiao-2 relaying.', ru:'Касание в кратере Аполлон в 6:23 по пекинскому времени 2 июня 2024 года (1 июня по UTC) при ретрансляции через «Цюэцяо-2».'}},
  {title:'Associated Press via KSAT (2026), “China abruptly postpones ambitious Chang\'e-7 lunar mission launch”, 23 August 2026', url:'https://www.ksat.com/tech/2026/08/23/china-abruptly-postpones-ambitious-change-7-lunar-mission-launch/', note:{en:'The China Manned Space Agency said the mission “does not meet the launch conditions” for this year\'s window and gave no reason.', ru:'Китайское агентство пилотируемой космонавтики сообщило, что миссия «не отвечает условиям запуска» в окне этого года, и причин не назвало.'}},
  {title:'P. Brinkmann (2026), “NASA expects one lunar launch this year, Moon Base manager says”, Aerospace America, 15 September 2026', url:'https://aerospaceamerica.aiaa.org/nasa-expects-one-lunar-launch-this-year-moon-base-manager-says/', note:{en:'Blue Origin\'s Mark 1 and Intuitive Machines\' IM-3 Nova-C slated for “the first part of 2027”; Firefly\'s Blue Ghost 2 later in 2027; Griffin-1 then expected no earlier than November 2026.', ru:'Mark 1 компании Blue Origin и Nova-C миссии IM-3 компании Intuitive Machines перенесены на «начало 2027 года»; Blue Ghost 2 компании Firefly — на более поздний срок 2027 года; Griffin-1 тогда ожидался не раньше ноября 2026 года.'}},
  {title:'Wikipedia, “Commercial Lunar Payload Services” (mission table, retrieved 12 November 2026)', url:'https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services', note:{en:'A secondary status source: Griffin Mission One listed for January 2027, Blue Moon Pathfinder Mission 1 for early 2027; IM-2 listed as a failure, IM-1 as a partial failure, Blue Ghost M1 as the first fully successful CLPS landing.', ru:'Вторичный источник статусов: Griffin Mission One значится на январь 2027 года, Blue Moon Pathfinder Mission 1 — на начало 2027 года; IM-2 — неудача, IM-1 — частичная неудача, Blue Ghost M1 — первая полностью успешная посадка CLPS.'}},
  {title:'Associated Press (2024), “Japan\'s precision moon lander has hit its target but it appears to be upside down”, 25 January 2024', url:'https://www.news4jax.com/news/world/2024/01/25/japans-precision-moon-lander-has-hit-its-target-but-it-appears-to-be-upside-down/', note:{en:'Wire report of JAXA\'s 25 January briefing: SLIM landed within its target but appears to be upside down.', ru:'Агентское сообщение о брифинге JAXA 25 января: SLIM сел в пределах цели, но, по-видимому, вверх дном.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderDB(); renderAF(); renderEL(); renderTP(); renderSC();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  document.getElementById('eqV').textContent = fmt(vCirc(H_APOLLO), 3);
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__touchdown = {GM_M:GM_M, R_M:R_M, G_M:G_M, G0:G0, H_APOLLO:H_APOLLO, HP_APOLLO:HP_APOLLO, ISP_DPS:ISP_DPS, vCirc:vCirc, visViva:visViva,
  escapeV:escapeV, gSurf:gSurf, descentBudget:descentBudget, propFrac:propFrac, hoverTime:hoverTime, fallSpeed:fallSpeed, fallTime:fallTime,
  altFilter:altFilter, hazAt:hazAt, hazFraction:hazFraction, ellipseRisk:ellipseRisk, inK:inK, CRATERS:CRATERS, CROSS:CROSS, CLEAR:CLEAR,
  tipGeom:tipGeom, staticTip:staticTip, vCrit:vCrit, ATTEMPTS:ATTEMPTS, tally:tally, daysBetween:daysBetween, AS_OF:AS_OF, plural:plural,
  TIMELINE:TIMELINE, REFERENCES:REFERENCES, MPH:MPH, FT:FT};
