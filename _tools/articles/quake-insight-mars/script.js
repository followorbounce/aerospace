/* ============ CONSTANTS ============ */
var R_M = 3389.5;                      // km, Mars volumetric mean radius, NSSDC fact sheet [27]
var G_MARS = 3.73, G_EARTH = 9.82;     // m/s², mean surface gravity, NSSDC [27]
var D2R = Math.PI/180;
var KM_PER_DEG = R_M*D2R;              // km along the surface per degree of arc
var SOL_MS = 24.6597*3600e3;           // length of a Mars solar day, NSSDC [27]
var LANDING = Date.UTC(2018, 10, 26, 19, 52, 59);   // touchdown, NSSDC [1]
/* in Russian, four-digit numbers stay unspaced, as in the body text */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function oddCells(el, rows){ var col = 0; rows.forEach(function(r){ col = r[2] ? 0 : 1 - col; }); if(col && rows.length) rows[rows.length - 1][2] = 1; cells(el, rows); }   /* a last cell left alone in its row spans the 2-column grid (wide cells take a whole row) */
function deg(v, d){ return fmt(v, d) + '°'; }
function km(v){ return num(Math.round(v)) + T(' km','\u00a0км'); }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }
var SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(x, d){
  var e = Math.floor(Math.log10(x)), m = x/Math.pow(10, e);
  if(+m.toFixed(d) >= 10){ m /= 10; e++; }
  return fmt(m, d) + ' × 10' + String(e).split('').map(function(c){ return SUP[c]; }).join('');
}
function mmss(s){ var m = Math.floor(s/60), sec = Math.round(s - m*60); if(sec === 60){ sec = 0; m++; } return m + T(' min ','\u00a0мин ') + (sec < 10 ? '0' : '') + sec + T(' s','\u00a0с'); }
function solOf(ms){ return (ms - LANDING)/SOL_MS; }

/* ============ CH3 — HOW BIG IS A MARSQUAKE? ============ */
/* Hanks & Kanamori (1979) [35]: Mw = (2/3) log10 M0 − 10.7 with M0 in dyne·cm  →  M0 = 10^(1.5 Mw + 9.05) N·m */
function moment(mw){ return Math.pow(10, 1.5*mw + 9.05); }
/* circular crack (Eshelby 1957 [36]): M0 = (16/7) Δσ a³  →  rupture radius a */
function ruptureRadius(m0, dsigPa){ return Math.cbrt(7*m0/(16*dsigPa)); }
var EVENTS = [
  {id:'S1222a', M:4.7, d:37, kind:'quake', en:'S1222a, 4 May 2022', ru:'S1222a, 4 мая 2022'},          // M [11], distance [12]
  {id:'S0976a', M:4.2, d:146, kind:'quake', en:'S0976a, 25 Aug 2021', ru:'S0976a, 25 авг. 2021'},     // M [10][22], distance [22]
  {id:'S1000a', M:4.1, d:7460/KM_PER_DEG, kind:'impact', en:'S1000a, impact', ru:'S1000a, удар'},      // M [28], 7,460 km [17]
  {id:'S1094b', M:4.0, d:3532/KM_PER_DEG, kind:'impact', en:'S1094b, impact', ru:'S1094b, удар'}       // M and 3,532 km [17]
];
var SMALL_IMPACTS = {M:2.0, d0:85/KM_PER_DEG, d1:290/KM_PER_DEG};                                    // [14]
var mqM = document.getElementById('mqM'), mqS = document.getElementById('mqS');
function renderMQ(){
  var mw = +mqM.value, ds = Math.pow(10, +mqS.value), m0 = moment(mw), a = ruptureRadius(m0, ds*1e6);
  document.getElementById('mqMVal').textContent = 'M ' + fmt(mw, 2);
  mqM.setAttribute('aria-valuetext', T('magnitude ','магнитуда ') + fmt(mw, 2) + ', ' + sci(m0, 2) + T(' newton metres',' ньютон-метров'));
  document.getElementById('mqSVal').textContent = fmt(ds, ds < 1 ? 2 : ds < 10 ? 1 : 0) + T(' MPa',' МПа');
  mqS.setAttribute('aria-valuetext', fmt(ds, ds < 1 ? 2 : ds < 10 ? 1 : 0) + T(' megapascals',' мегапаскаля'));
  var svg = document.getElementById('mqSvg'); svg.innerHTML = ''; aria(svg);
  var L = 46, R = 466, Tp = 20, B = 250, ya = 1.5, yb = 5.0;
  function X(dd){ return L + dd/180*(R - L); } function Y(m){ return B - (m - ya)/(yb - ya)*(B - Tp); }
  [2, 3, 4, 5].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, 'M' + v, 'svg-small', 'end'); });
  [0, 30, 60, 90, 120, 150, 180].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, v + '°', 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 12, T('Mars-calibrated moment magnitude','моментная магнитуда (марсианская калибровка)'), 'svg-small');
  txt(svg, R, B + 34, T('distance from InSight, degrees of arc (1° ≈ 59 km)','расстояние от InSight, градусы дуги (1° ≈ 59\u00a0км)'), 'svg-small', 'end');
  ns('rect', {x:X(27), y:Tp, width:X(40) - X(27), height:B - Tp, fill:'#2f5aa1', 'fill-opacity':0.08}, svg);
  txt(svg, (X(27) + X(40))/2, B - 6, T('most events','большинство'), 'svg-tiny', 'middle');   // foot of the band: the top is where S1222a's label sits
  ns('rect', {x:X(SMALL_IMPACTS.d0), y:Y(SMALL_IMPACTS.M) - 4, width:Math.max(3, X(SMALL_IMPACTS.d1) - X(SMALL_IMPACTS.d0)), height:8, fill:'#a8741a'}, svg);
  txt(svg, X(SMALL_IMPACTS.d1) + 6, Y(SMALL_IMPACTS.M) + 4, T('four small impacts, ≤ M2.0','четыре малых удара, ≤ M2,0'), 'svg-small svg-halo');
  var yM = Y(Math.max(ya, Math.min(yb, mw)));
  ns('line', {x1:L, y1:yM, x2:R, y2:yM, stroke:'#b5452a', 'stroke-dasharray':'5 4', 'stroke-width':1.4}, svg);
  txt(svg, R - 4, yM - 6, 'M ' + fmt(mw, 1), 'svg-small svg-halo', 'end');
  EVENTS.forEach(function(e, j){
    var x = X(e.d), y = Y(e.M);
    if(e.kind === 'impact') ns('rect', {x:x - 4.5, y:y - 4.5, width:9, height:9, fill:'#a8741a'}, svg);
    else ns('circle', {cx:x, cy:y, r:5, fill:'#2f5aa1'}, svg);
    var right = e.kind !== 'impact' && e.d > 120;   // impact labels always run right, so S1000a's and S1094b's don't meet
    txt(svg, x + (right ? -9 : 9), y + (e.kind === 'impact' ? 16 : -7), T(e.en, e.ru), 'svg-small svg-halo', right ? 'end' : 'start');
  });
  var r1222 = m0/moment(4.7), rSmall = m0/moment(2.0);
  oddCells(document.getElementById('mqReadout'), [
    [T('SEISMIC MOMENT','СЕЙСМИЧЕСКИЙ МОМЕНТ'), sci(m0, 2) + T(' N·m','\u00a0Н·м')],
    [T('× S1222a','× S1222a'), r1222 >= 0.995 && r1222 < 100 ? fmt(r1222, r1222 < 10 ? 2 : 0) : sci(r1222, 1)],
    [T('× A SMALL IMPACT (M2.0)','× МАЛЫЙ УДАР (M2,0)'), rSmall < 1000 ? fmt(rSmall, rSmall < 10 ? 2 : 0) : sci(rSmall, 1)],
    [T('RUPTURE RADIUS (MODEL)','РАДИУС РАЗРЫВА (МОДЕЛЬ)'), a < 1000 ? num(Math.round(a)) + T(' m','\u00a0м') : fmt(a/1000, a < 10000 ? 2 : 1) + T(' km','\u00a0км')]
  ]);
  var st = document.getElementById('mqStatus');
  st.innerHTML = T('One step of magnitude is 10<sup>1.5</sup> ≈ ','Шаг в одну единицу магнитуды — это 10<sup>1,5</sup> ≈ ') + fmt(Math.pow(10, 1.5), 1) +
    T(' times the moment. S1222a against S0976a, half a step apart: ',' раза по моменту. S1222a против S0976a, разница в полшага: ') + fmt(moment(4.7)/moment(4.2), 1) +
    T(' times — the “five times” of [11]. At a stress drop of ',' раза — те самые «в пять раз» из [11]. При сбросе напряжений ') + fmt(ds, ds < 1 ? 2 : ds < 10 ? 1 : 0) +
    T(' MPa the fault patch would be about ',' МПа площадка разлома была бы около ') + (a < 1000 ? num(Math.round(a)) + T(' m','\u00a0м') : fmt(a/1000, 1) + T(' km','\u00a0км')) + T(' across in radius; the stress drop is your assumption, not a measurement.',' в радиусе; сброс напряжений — ваше допущение, а не измерение.');
}
mqM.addEventListener('input', function(){ pressGroup(document.getElementById('mqPre'), null); renderMQ(); });
mqS.addEventListener('input', renderMQ);
Array.prototype.forEach.call(document.querySelectorAll('#mqPre .btn'), function(btn){ btn.addEventListener('click', function(){ mqM.value = this.getAttribute('data-m'); pressGroup(this.parentNode, this); renderMQ(); }); });

/* ============ CH5 — RAYS THROUGH MARS (TOY MODEL) ============ */
/* Uniform mantle with effective P and S speeds, straight rays, crust ignored; the core carries P at V_CORE.
   For each core radius the two mantle speeds are fitted so that the toy reproduces S1000a's SKS−PP and SS−SKS times. */
var V_CORE = 4.95;                     // km/s, middle of 4.9–5.0 at the top of the core [22]
var S1000A = {d:125.9, sksPP:344.2, ssSKS:401.4};   // distance from the imaged crater; method A times [22]
var S0976A = {d:146, ssPP:858.5, sksPP:311.0};      // MQS distance ±7°; method A times [22]
var INNER_CORE = 613, LSL = 150;        // km: inner-core radius claimed in [25]; molten silicate layer [23]
function chord(a){ return 2*R_M*Math.sin(a/2); }          // straight path between two surface points a radians apart
function shadowEdge(rc){ return 2*Math.acos(rc/R_M)/D2R; }   // farthest distance a straight direct ray can reach past the core
function shadowShare(rc){ return (1 + Math.cos(shadowEdge(rc)*D2R))/2; }
function directOK(dDeg, rc){ return R_M*Math.cos(dDeg*D2R/2) >= rc; }
function scsLen(dDeg, rc){ var h = dDeg*D2R/2; return 2*Math.sqrt(R_M*R_M + rc*rc - 2*R_M*rc*Math.cos(h)); }
/* SKS: mantle leg leaves the core at angle j from the radius (S, speed vs), crosses the core as P at angle k (Snell: sin k = vc/vs sin j) */
function sksGeom(dDeg, vs, rc){
  var d = dDeg*D2R, jmax = Math.asin(Math.min(1, vs/V_CORE)) - 1e-9;
  function delta(j){ var i = Math.asin(rc*Math.sin(j)/R_M), k = Math.asin(Math.min(1, V_CORE/vs*Math.sin(j))); return 2*(j - i) + Math.PI - 2*k; }
  var lo = 0, hi = jmax, dlo = delta(lo), dhi = delta(hi);
  if((d - dlo)*(d - dhi) > 0) return null;
  for(var n = 0; n < 80; n++){ var mid = (lo + hi)/2, dm = delta(mid); if((dm - d)*(dlo - d) > 0){ lo = mid; dlo = dm; } else hi = mid; }
  var j = (lo + hi)/2, i = Math.asin(rc*Math.sin(j)/R_M), k = Math.asin(V_CORE/vs*Math.sin(j));
  return {a1:j - i, Lm:Math.sqrt(R_M*R_M + rc*rc - 2*R_M*rc*Math.cos(j - i)), Lc:2*rc*Math.cos(k)};
}
function sksTime(dDeg, vs, rc){ var g = sksGeom(dDeg, vs, rc); return g ? 2*g.Lm/vs + g.Lc/V_CORE : null; }
function ppLen(dDeg){ return 2*chord(dDeg*D2R/2); }
var FITS = {};
function fitMantle(rc){
  rc = Math.round(rc); if(FITS[rc]) return FITS[rc];
  function f(vs){ var t = sksTime(S1000A.d, vs, rc); return t === null ? null : ppLen(S1000A.d)/vs - t - S1000A.ssSKS; }
  var a = null, fa = null, b = null;
  for(var k = 0; k <= 400; k++){ var vs = 3.0 + k*0.005, fv = f(vs); if(fv === null) continue; if(fa !== null && fa*fv <= 0){ b = vs; break; } a = vs; fa = fv; }
  if(b === null) return null;
  for(var n = 0; n < 60; n++){ var m = (a + b)/2, fm = f(m); if(fm*fa > 0){ a = m; fa = fm; } else b = m; }
  var vsF = (a + b)/2, vpF = ppLen(S1000A.d)/(sksTime(S1000A.d, vsF, rc) - S1000A.sksPP);
  return (FITS[rc] = {vp:vpF, vs:vsF});
}
function rayTimes(dDeg, rc){
  var m = fitMantle(rc), ok = directOK(dDeg, rc), L = chord(dDeg*D2R), Lpp = ppLen(dDeg), sks = sksTime(dDeg, m.vs, rc);
  return {vp:m.vp, vs:m.vs, P:ok ? L/m.vp : null, S:ok ? L/m.vs : null, PP:Lpp/m.vp, SS:Lpp/m.vs, ScS:ok ? scsLen(dDeg, rc)/m.vs : null, SKS:sks};
}
var rcR = document.getElementById('rcR'), rcD = document.getElementById('rcD');
function renderRC(){
  var rc = +rcR.value, dd = +rcD.value, t = rayTimes(dd, rc);
  document.getElementById('rcRVal').textContent = km(rc); rcR.setAttribute('aria-valuetext', km(rc) + T(', shadow edge ',', край тени ') + deg(shadowEdge(rc), 1));
  document.getElementById('rcDVal').textContent = deg(dd, 1) + ' · ' + km(dd*KM_PER_DEG); rcD.setAttribute('aria-valuetext', deg(dd, 1) + ', ' + km(dd*KM_PER_DEG) + (t.P === null ? T(', in the core shadow',', в тени ядра') : ''));
  var svg = document.getElementById('rcSvg'); svg.innerHTML = ''; aria(svg);
  var cx = 240, cy = 170, s = 150/R_M;
  function P(th, r){ return [cx + r*s*Math.sin(th), cy - r*s*Math.cos(th)]; }
  function line(pts, attrs){ ns('path', Object.assign({d:'M' + pts.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L'), fill:'none'}, attrs), svg); }
  ns('circle', {cx:cx, cy:cy, r:R_M*s, fill:'#f1efe8', stroke:'#0b0b0c', 'stroke-width':1.4}, svg);
  if(rc <= 1700){ ns('circle', {cx:cx, cy:cy, r:(rc + LSL)*s, fill:'#efe3cf', stroke:'#a8741a', 'stroke-dasharray':'3 3'}, svg); }
  ns('circle', {cx:cx, cy:cy, r:rc*s, fill:'#e4e4de', stroke:'#0b0b0c'}, svg);
  ns('circle', {cx:cx, cy:cy, r:INNER_CORE*s, fill:'none', stroke:'#5f5f59', 'stroke-dasharray':'2 3'}, svg);
  var se = shadowEdge(rc)*D2R;
  [se, -se].forEach(function(th){ var p = P(th, R_M); ns('line', {x1:p[0] - 6*Math.sin(th), y1:p[1] + 6*Math.cos(th), x2:p[0] + 8*Math.sin(th), y2:p[1] - 8*Math.cos(th), stroke:'#b5452a', 'stroke-width':2}, svg); });
  var th = dd*D2R, st0 = P(0, R_M), src = P(th, R_M);
  line([st0, P(th/2, R_M), src], {stroke:'#a8741a', 'stroke-width':1.3});                                // PP / SS
  if(t.P !== null){ line([st0, src], {stroke:'#2f5aa1', 'stroke-width':1.8}); line([st0, P(th/2, rc), src], {stroke:'#5f5f59', 'stroke-width':1.2, 'stroke-dasharray':'4 3'}); }
  else line([st0, src], {stroke:'#b5452a', 'stroke-width':1.2, 'stroke-dasharray':'2 4'});
  var g = sksGeom(dd, t.vs, rc);
  if(g) line([st0, P(g.a1, rc), P(th - g.a1, rc), src], {stroke:'#0b0b0c', 'stroke-width':1.6});
  ns('rect', {x:st0[0] - 5, y:st0[1] - 10, width:10, height:8, fill:'#0b0b0c'}, svg);
  ns('circle', {cx:src[0], cy:src[1], r:5, fill:'#b5452a'}, svg);
  txt(svg, st0[0], st0[1] - 14, 'InSight', 'svg-small svg-halo', 'middle');
  txt(svg, cx, cy + 4, T('core','ядро'), 'svg-small svg-halo', 'middle');
  txt(svg, 472, 14, T('TOY MODEL · STRAIGHT RAYS','УЧЕБНАЯ МОДЕЛЬ · ПРЯМЫЕ ЛУЧИ'), 'svg-tiny svg-halo', 'end');
  txt(svg, cx, cy + INNER_CORE*s + 12, T('inner core? (2025)','внутреннее ядро? (2025)'), 'svg-tiny svg-halo', 'middle');
  var lx = 8, ly = 22;
  [['#2f5aa1', T('P, S direct','P, S прямые')], ['#a8741a', T('PP, SS (bounce midway)','PP, SS (отраж. посередине)')], ['#5f5f59', T('ScS (off the core)','ScS (от ядра)')], ['#0b0b0c', T('SKS (through the core)','SKS (сквозь ядро)')], ['#b5452a', T('shadow edge','край тени')]].forEach(function(e, k){
    ns('line', {x1:lx, y1:ly + k*15 - 4, x2:lx + 16, y2:ly + k*15 - 4, stroke:e[0], 'stroke-width':2}, svg); txt(svg, lx + 20, ly + k*15, e[1], 'svg-tiny');
  });
  function tt(x){ return x === null ? T('shadowed','в тени') : mmss(x); }
  oddCells(document.getElementById('rcReadout'), [
    ['P', tt(t.P)], ['S', tt(t.S)],
    ['S − P', t.P === null ? '—' : mmss(t.S - t.P)], ['ScS', tt(t.ScS)],
    ['PP / SS', mmss(t.PP) + ' / ' + mmss(t.SS)], ['SKS', t.SKS === null ? T('no path','нет пути') : mmss(t.SKS)],
    [T('SHADOW EDGE · SHARE OF SURFACE','КРАЙ ТЕНИ · ДОЛЯ ПОВЕРХНОСТИ'), deg(shadowEdge(rc), 1) + ' · ' + fmt(shadowShare(rc)*100, 0) + ' %'],
    [T('EFFECTIVE MANTLE V<sub>P</sub> / V<sub>S</sub>','ЭФФЕКТИВНЫЕ V<sub>P</sub> / V<sub>S</sub> МАНТИИ'), fmt(t.vp, 2) + ' / ' + fmt(t.vs, 2) + T(' km/s','\u00a0км/с'), true]
  ]);
  hud2.textContent = km(rc);
  var st = document.getElementById('rcStatus'), m1650 = fitMantle(1650), m1830 = fitMantle(1830);
  var near = function(a){ return Math.abs(dd - a) < 0.05; };
  var tail = T(' Between a 1,650 km and a 1,830 km core, the fitted mantle S speed changes by only ',' Между ядром 1650\u00a0км и 1830\u00a0км подобранная скорость S в мантии меняется всего на ') + fmt((m1830.vs/m1650.vs - 1)*100, 1) + T(' % — core size and mantle speed trade off, which is why the answer depends on the mantle model.','\u00a0% — размер ядра и скорость в мантии компенсируют друг друга, поэтому ответ зависит от модели мантии.');
  if(near(S1000A.d)) st.innerHTML = T('S1000a, distance fixed by its crater: the toy reproduces the observed SKS − PP of ','S1000a, расстояние известно по кратеру: модель воспроизводит наблюдённое SKS − PP = ') + fmt(S1000A.sksPP, 1) + T(' s by construction (here ','\u00a0с по построению (здесь ') + fmt(t.SKS - t.PP, 1) + T(' s).','\u00a0с).') + tail;
  else if(near(S0976A.d)) st.innerHTML = T('S0976a: observed SS − PP ','S0976a: наблюдённое SS − PP ') + fmt(S0976A.ssPP, 1) + T(' s, toy ','\u00a0с, модель ') + fmt(t.SS - t.PP, 1) + T(' s; observed SKS − PP ','\u00a0с; наблюдённое SKS − PP ') + fmt(S0976A.sksPP, 1) + T(' s, toy ','\u00a0с, модель ') + fmt(t.SKS - t.PP, 1) + T(' s. Straight rays miss this one by tens of seconds; its distance is also uncertain by ±7°. Real inversions bend the rays.','\u00a0с. Прямые лучи промахиваются здесь на десятки секунд; к тому же расстояние известно лишь с точностью ±7°. Настоящие инверсии искривляют лучи.');
  else if(t.P === null) st.innerHTML = T('Beyond ','Дальше ') + deg(shadowEdge(rc), 1) + T(' the straight path from the source to InSight would cross the core: no direct P or S. What arrives is PP, SS and the core phases.',' прямой путь от источника до InSight пересёк бы ядро: прямых P и S нет. Приходят PP, SS и волны через ядро.') + tail;
  else st.innerHTML = T('S arrives ','S приходит через ') + mmss(t.S - t.P) + T(' after P. With one station, that gap is the distance — once you trust the speeds.',' после P. С одной станцией этот промежуток и есть расстояние — если доверять скоростям.') + tail;
}
rcR.addEventListener('input', function(){ pressGroup(document.getElementById('rcPreR'), null); renderRC(); });
rcD.addEventListener('input', function(){ pressGroup(document.getElementById('rcPreD'), null); renderRC(); });
Array.prototype.forEach.call(document.querySelectorAll('#rcPreR .btn'), function(btn){ btn.addEventListener('click', function(){ rcR.value = this.getAttribute('data-r'); pressGroup(this.parentNode, this); renderRC(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rcPreD .btn'), function(btn){ btn.addEventListener('click', function(){ rcD.value = this.getAttribute('data-d'); pressGroup(this.parentNode, this); renderRC(); }); });

/* ============ CH6 — THE MOLE'S FRICTION PROBLEM (MODEL) ============ */
var RHO_SOIL = 1211, D_MOLE = 0.027, L_MOLE = 0.40, CRUST = 0.20;   // kg/m³, m, m, m — all from [29]
var RECOIL = [5, 7], PIN_MAX = 10;                                     // N, recoil on the hull and the arm's lateral push [29]
function k0(phiDeg){ return 1 - Math.sin(phiDeg*D2R); }              // Jáky's at-rest earth-pressure coefficient
function muWall(phiDeg){ return Math.tan(2/3*phiDeg*D2R); }          // hull–soil friction, assumed 2/3 of φ
/* friction on the buried length L (m) of a vertical cylinder in cohesionless soil; no lateral pressure in the top c metres */
function hullFriction(L, phiDeg, g, c){
  var a = Math.min(c, L);
  return muWall(phiDeg)*k0(phiDeg)*RHO_SOIL*g*Math.PI*D_MOLE*(L*L - a*a)/2;
}
function moleForce(L, phiDeg, g, c, pinN){ return hullFriction(L, phiDeg, g, c) + muWall(phiDeg)*pinN; }
var mlL = document.getElementById('mlL'), mlP = document.getElementById('mlP'), mlN = document.getElementById('mlN'), mlG = G_MARS, mlC = 0;
function renderML(){
  var L = +mlL.value/100, phi = +mlP.value, pin = +mlN.value, F = moleForce(L, phi, mlG, mlC, pin);
  document.getElementById('mlLVal').textContent = fmt(L*100, 1) + T(' cm','\u00a0см'); mlL.setAttribute('aria-valuetext', fmt(L*100, 1) + T(' centimetres buried, grip ','\u00a0см в грунте, удержание ') + fmt(F, 1) + T(' newtons','\u00a0Н'));
  document.getElementById('mlPVal').textContent = deg(phi, 1); mlP.setAttribute('aria-valuetext', deg(phi, 1));
  document.getElementById('mlNVal').textContent = fmt(pin, 1) + T(' N','\u00a0Н'); mlN.setAttribute('aria-valuetext', fmt(pin, 1) + T(' newtons',' ньютона'));
  var svg = document.getElementById('mlSvg'); svg.innerHTML = ''; aria(svg);
  var Lx = 46, R = 466, Tp = 20, B = 240, yMax = 16;
  function X(cm){ return Lx + cm/40*(R - Lx); } function Y(f){ return B - Math.min(f, yMax)/yMax*(B - Tp); }
  [0, 4, 8, 12, 16].forEach(function(v){ ns('line', {x1:Lx, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, Lx - 6, Y(v) + 4, v + T(' N','\u00a0Н'), 'svg-small', 'end'); });
  [0, 10, 20, 30, 40].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, v + T(' cm','\u00a0см'), 'svg-small', 'middle'); });
  ns('line', {x1:Lx, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  ns('rect', {x:Lx, y:Y(RECOIL[1]), width:R - Lx, height:Y(RECOIL[0]) - Y(RECOIL[1]), fill:'#b5452a', 'fill-opacity':0.16}, svg);
  txt(svg, R - 4, Y(RECOIL[1]) - 5, T('recoil to resist, 5–7 N','отдача, которую надо удержать, 5–7\u00a0Н'), 'svg-small svg-halo', 'end');
  if(mlC > 0){ ns('rect', {x:X(0), y:Tp, width:X(CRUST*100) - X(0), height:B - Tp, fill:'#a8741a', 'fill-opacity':0.10}, svg); txt(svg, X(CRUST*100/2), Tp + 12, T('duricrust: no grip','корка: нет сцепления'), 'svg-tiny', 'middle'); }
  [[G_MARS, '#0b0b0c', T('Mars','Марс')], [G_EARTH, '#5f5f59', T('Earth','Земля')]].forEach(function(gg){
    var d = '';
    for(var k = 0; k <= 80; k++){ var l = k/80*L_MOLE; d += (k ? 'L' : 'M') + X(l*100).toFixed(1) + ',' + Y(moleForce(l, phi, gg[0], mlC, pin)).toFixed(1); }
    var on = gg[0] === mlG;
    ns('path', {d:d, fill:'none', stroke:gg[1], 'stroke-width':on ? 2.2 : 1.2, 'stroke-dasharray':on ? '' : '5 4'}, svg);
    var fEnd = moleForce(L_MOLE, phi, gg[0], mlC, pin);
    txt(svg, X(40) - 4, Math.max(Tp + 10, Y(fEnd) - 6), gg[2], 'svg-small svg-halo', 'end');
  });
  ns('line', {x1:X(37), y1:B, x2:X(37), y2:Tp + 18, stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X(37) - 4, B - 8, T('final tip depth, ~37 cm','итоговая глубина острия ~37\u00a0см'), 'svg-tiny svg-halo', 'end');
  ns('circle', {cx:X(L*100), cy:Y(F), r:6, fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  var verdict = F >= RECOIL[1] ? T('holds: the mole moves forward','держит: крот идёт вперёд') : F >= RECOIL[0] ? T('marginal','на грани') : T('bounces in place','подпрыгивает на месте');
  oddCells(document.getElementById('mlReadout'), [
    [T('SOIL GRIP ON THE HULL','СЦЕПЛЕНИЕ ГРУНТА С КОРПУСОМ'), fmt(hullFriction(L, phi, mlG, mlC), 2) + T(' N','\u00a0Н')],
    [T('FROM THE SCOOP','ОТ КОВША'), fmt(muWall(phi)*pin, 2) + T(' N','\u00a0Н')],
    [T('K₀ · μ','K₀ · μ'), fmt(k0(phi), 3) + ' · ' + fmt(muWall(phi), 3)],
    [T('VERDICT','ИТОГ'), verdict]
  ]);
  var full = hullFriction(L_MOLE, phi, G_MARS, 0);
  document.getElementById('mlStatus').innerHTML = T('Fully buried in loose sand on Mars, the whole 40 cm hull grips with only ','Полностью погружённый в рыхлый песок на Марсе, корпус длиной 40\u00a0см удерживается всего ') + fmt(full, 1) +
    T(' N at this friction angle — about the size of the recoil. In Earth\'s gravity the same sand presses ',' Н при этом угле трения — примерно столько же, сколько отдача. В земной гравитации тот же песок давит в ') + fmt(G_EARTH/G_MARS, 2) +
    T(' times harder. A crust that stands open around the hull takes even that away.',' раза сильнее. Корка, которая не смыкается вокруг корпуса, отнимает и это.');
}
mlL.addEventListener('input', renderML); mlP.addEventListener('input', renderML); mlN.addEventListener('input', renderML);
Array.prototype.forEach.call(document.querySelectorAll('#mlGrav .btn'), function(btn){ btn.addEventListener('click', function(){ mlG = +this.getAttribute('data-g'); pressGroup(this.parentNode, this); renderML(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#mlSoil .btn'), function(btn){ btn.addEventListener('click', function(){ mlC = +this.getAttribute('data-c'); pressGroup(this.parentNode, this); renderML(); }); });

/* ============ CH7 — DUST ON THE PANELS (MODEL) ============ */
/* Mars–Sun distance from JPL's approximate Keplerian elements (Table 1, 1800–2050) [34] */
function marsSunAU(ms){
  var T_ = (ms/864e5 + 2440587.5 - 2451545)/36525;
  var a = 1.52371034 + 0.00001847*T_, e = 0.09339410 + 0.00007882*T_, Lm = -4.55343205 + 19140.30268499*T_, w = -23.94362959 + 0.44441088*T_;
  var M = (((Lm - w) % 360) + 360) % 360*D2R, E = Math.PI;                 // Kepler's equation by Newton from E = π
  for(var k = 0; k < 40; k++) E -= (E - e*Math.sin(E) - M)/(1 - e*Math.cos(E));
  return a*(1 - e*Math.cos(E));
}
function solMs(sol){ return LANDING + sol*SOL_MS; }
var E_SOL1 = 4588;                                     // Wh on sol 1 [31]
var MAY2022 = {sol:solOf(Date.UTC(2022, 4, 17)), wh:500};    // “roughly 500 watt-hours per sol”, 17 May 2022 [32]
var R_SOL1 = marsSunAU(solMs(1));
function sunFactor(sol){ var r = marsSunAU(solMs(sol)); return R_SOL1*R_SOL1/(r*r); }
var TAU = -(MAY2022.sol - 1)/Math.log(MAY2022.wh/(E_SOL1*sunFactor(MAY2022.sol)));   // dust e-folding time, sols (fitted)
function cleanWh(sol){ return E_SOL1*sunFactor(sol); }
function dustFactor(sol){ return Math.exp(-(sol - 1)/TAU); }
function powerWh(sol){ return cleanWh(sol)*dustFactor(sol); }
function sweepGain(sol, frac){ return frac*(cleanWh(sol) - powerWh(sol)); }
var OVEN_WH_PER_MIN = 5000/100;                        // NASA: ~5,000 Wh ≈ 1 h 40 min of an electric oven [32]
var PW_POINTS = [
  {sol:1, wh:4588, en:'sol 1: 4,588 Wh', ru:'сол 1: 4588\u00a0Вт·ч'},
  {sol:MAY2022.sol, wh:500, en:'May 2022: ~500', ru:'май 2022: ~500'},
  {sol:solOf(Date.UTC(2022, 9, 3)), wh:425, en:'Oct 2022: 425 → 275 in a storm', ru:'окт. 2022: 425 → 275 в бурю'}
];
var pwS = document.getElementById('pwS'), pwSweep = false;
function sunExtremes(){
  var mn = 9, mx = 0, smn = 0, smx = 0;
  for(var s = 0; s <= 1450; s += 0.5){ var r = marsSunAU(solMs(s)); if(r < mn){ mn = r; smn = s; } if(r > mx){ mx = r; smx = s; } }
  return {rMin:mn, solMin:smn, rMax:mx, solMax:smx};
}
var EXT = sunExtremes();
function dateStr(ms){
  var d = new Date(ms), mo = lang === 'en' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : ['янв.','февр.','марта','апр.','мая','июня','июля','авг.','сент.','окт.','нояб.','дек.'];
  return d.getUTCDate() + ' ' + mo[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}
function renderPW(){
  var sol = +pwS.value, e = powerWh(sol), c = cleanWh(sol), g = sweepGain(sol, 0.25), show = pwSweep ? e + g : e;
  document.getElementById('pwSVal').textContent = T('sol ','сол ') + num(sol) + ' · ' + dateStr(solMs(sol));
  pwS.setAttribute('aria-valuetext', T('sol ','сол ') + sol + ', ' + dateStr(solMs(sol)) + ', ' + num(Math.round(show)) + T(' watt-hours',' ватт-часов'));
  var svg = document.getElementById('pwSvg'); svg.innerHTML = ''; aria(svg);
  var L = 52, R = 466, Tp = 20, B = 240, yMax = 5500;
  function X(s){ return L + s/1450*(R - L); } function Y(w){ return B - Math.min(w, yMax)/yMax*(B - Tp); }
  [0, 1000, 2000, 3000, 4000, 5000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, num(v), 'svg-small', 'end'); });
  [0, 250, 500, 750, 1000, 1250].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, num(v), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 12, T('energy per sol, Wh','энергия за сол, Вт·ч'), 'svg-small');
  txt(svg, R, B + 34, T('sols after landing','солы после посадки'), 'svg-small', 'end');
  [[EXT.solMax, T('aphelion','афелий')], [EXT.solMin, T('perihelion','перигелий')]].forEach(function(p){ ns('line', {x1:X(p[0]), y1:Tp + 14, x2:X(p[0]), y2:B, stroke:'#a8741a', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(p[0]), Tp + 10, p[1], 'svg-tiny', 'middle'); });
  var d1 = '', d2 = '';
  for(var k = 0; k <= 290; k++){ var s = 1 + k*5; d1 += (k ? 'L' : 'M') + X(s).toFixed(1) + ',' + Y(cleanWh(s)).toFixed(1); d2 += (k ? 'L' : 'M') + X(s).toFixed(1) + ',' + Y(powerWh(s)).toFixed(1); }
  ns('path', {d:d1, fill:'none', stroke:'#5f5f59', 'stroke-width':1.2, 'stroke-dasharray':'5 4'}, svg);
  ns('path', {d:d2, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  txt(svg, X(760), Y(cleanWh(760)) - 8, T('clean panels (Sun distance only)','чистые панели (только расстояние до Солнца)'), 'svg-small svg-halo', 'middle');   // right of the sol-1 label
  txt(svg, X(330), Y(powerWh(330)) + 18, T('model with dust','модель с пылью'), 'svg-small svg-halo', 'start');
  PW_POINTS.forEach(function(p, j){
    ns('rect', {x:X(p.sol) - 4, y:Y(p.wh) - 4, width:8, height:8, fill:'#2f5aa1'}, svg);
    if(!j){ txt(svg, X(p.sol) + 8, Y(p.wh) - 8, T(p.en, p.ru), 'svg-small svg-halo', 'start'); return; }
    // late points sit on the curve near the axis: label them above it, with a thin leader down to the point
    var ly = Y(j === 1 ? 1600 : 2300);
    ns('line', {x1:X(p.sol), y1:ly + 3, x2:X(p.sol), y2:Y(p.wh) - 6, stroke:'#2f5aa1', 'stroke-width':0.8}, svg);
    txt(svg, X(p.sol) - 4, ly, T(p.en, p.ru), 'svg-small svg-halo', 'end');
  });
  ns('circle', {cx:X(sol), cy:Y(show), r:6, fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  oddCells(document.getElementById('pwReadout'), [
    [T('MODEL ENERGY','ЭНЕРГИЯ (МОДЕЛЬ)'), num(Math.round(show)) + T(' Wh/sol','\u00a0Вт·ч/сол')],
    [T('MINUTES OF ELECTRIC OVEN','МИНУТ ЭЛЕКТРОДУХОВКИ'), fmt(show/OVEN_WH_PER_MIN, 0)],
    [T('SUNLIGHT VS SOL 1 · DUST LETS THROUGH','СОЛНЦЕ К СОЛУ 1 · ПЫЛЬ ПРОПУСКАЕТ'), fmt(sunFactor(sol)*100, 0) + ' % · ' + fmt(dustFactor(sol)*100, 0) + ' %', true],
    [T('A 25 % SWEEP WOULD ADD','ОЧИСТКА 25\u00a0% ДОБАВИЛА БЫ'), num(Math.round(g)) + T(' Wh/sol','\u00a0Вт·ч/сол')]
  ]);
  hud1.textContent = num(sol);
  document.getElementById('pwStatus').innerHTML = T('Dust e-folding time fitted to the two NASA figures: ','Время ослабления в e раз, подобранное по двум цифрам NASA: ') + num(Math.round(TAU)) +
    T(' sols. The Sun alone moves sunlight between ',' солов. Одно только расстояние до Солнца меняет освещённость от ') + fmt(EXT.rMin, 3) + T(' and ',' до ') + fmt(EXT.rMax, 3) + T(' AU — ','\u00a0а. е. — ') +
    fmt((1 - Math.pow(EXT.rMin/EXT.rMax, 2))*100, 0) + T(' % less at aphelion than at perihelion. ','\u00a0% меньше в афелии, чем в перигелии. ') +
    (pwSweep ? T('Shown with a quarter of the panels swept clean.','Показано с очищенной четвертью панелей.') : T('No dust devil ever swept InSight\'s panels clean.','Ни один пылевой вихрь так и не очистил панели InSight.'));
}
pwS.addEventListener('input', function(){ pressGroup(document.getElementById('pwPre'), null); renderPW(); });
Array.prototype.forEach.call(document.querySelectorAll('#pwPre .btn'), function(btn){ btn.addEventListener('click', function(){ pwS.value = this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderPW(); }); });
var pwSw = document.getElementById('pwSweep');
pwSw.addEventListener('click', function(){ pwSweep = !pwSweep; pwSw.classList.toggle('active', pwSweep); pwSw.setAttribute('aria-pressed', pwSweep ? 'true' : 'false'); renderPW(); });

/* ============ CH8 — LEGACY ============ */
var TIMELINE = [
  ['1976', 'Viking 2 lands with a seismometer on its deck; the wind dominates its records, and one candidate marsquake is found, on sol 80 [3].', '«Викинг-2» садится с сейсмометром на палубе; в записях господствует ветер, найдено одно возможное марсотрясение — на 80-й сол [3].'],
  ['2018', 'InSight launches on 5 May from Vandenberg and lands on 26 November in Elysium Planitia [1]. SEIS is set on the ground on 19 December [6].', 'InSight стартует 5 мая с Ванденберга и 26 ноября садится на равнине Элизий [1]. 19 декабря SEIS опущен на грунт [6].'],
  ['2019', 'The Wind and Thermal Shield goes over SEIS on 2 February [6]; the mole starts hammering on 28 February [30]; the first marsquake from inside the planet, 6 April (sol 128) [4].', '2 февраля SEIS накрыт ветро- и теплозащитным колпаком [6]; 28 февраля крот начинает забиваться [30]; 6 апреля (сол 128) — первое марсотрясение из недр планеты [4].'],
  ['2021', 'The mole is given up on 9–14 January at about 37 cm [29][30]. July: crust, mantle and a 1,830 km core from InSight data [19][20][21]. S0976a (M4.2) on 25 August [10]; impacts on 5 September, 18 September and 24 December, seen from orbit [14][15][18].', '9–14 января от крота отказываются на глубине около 37\u00a0см [29][30]. Июль: кора, мантия и ядро 1830\u00a0км по данным InSight [19][20][21]. 25 августа — S0976a (M4,2) [10]; удары 5 сентября, 18 сентября и 24 декабря, увиденные с орбиты [14][15][18].'],
  ['2022', 'S1222a, magnitude 4.7, the largest marsquake recorded, on 4 May [10][11]. Last contact on 15 December; NASA ends the mission on 21 December after 1,319 marsquakes [9].', '4 мая — S1222a магнитудой 4,7, крупнейшее зарегистрированное марсотрясение [10][11]. Последний сеанс связи 15 декабря; 21 декабря NASA завершает миссию — 1319 марсотрясений [9].'],
  ['2023', 'SKS through the core: 1,780–1,810 km [22]. RISE: 1,835 ± 55 km [24]. A molten silicate layer above a smaller core of 1,650–1,675 km [12][23].', 'SKS сквозь ядро: 1780–1810\u00a0км [22]. RISE: 1835 ± 55\u00a0км [24]. Слой расплавленных силикатов над меньшим ядром 1650–1675\u00a0км [12][23].'],
  ['2025', 'A team reports a solid inner core about 613 km in radius; others are not yet convinced [25][26].', 'Группа учёных сообщает о твёрдом внутреннем ядре радиусом около 613\u00a0км; остальные пока не убеждены [25][26].']
];
var REFERENCES = [
  {title:'NASA NSSDCA Master Catalog, “InSight Mars Lander” (2018-042A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A', note:{en:'Launched 5 May 2018, 11:05 UT, Atlas V 401, Vandenberg; landed in western Elysium Planitia on 26 November 2018 at 19:52:59 UT; landed mass 360 kg; SEIS, HP³, RISE; two solar arrays each 2.2 m across; PI W. B. Banerdt, deputy S. E. Smrekar (JPL); surface operations until December 2022.', ru:'Запуск 5 мая 2018 года в 11:05 UT, Atlas V 401, Ванденберг; посадка в западной части равнины Элизий 26 ноября 2018 года в 19:52:59 UT; посадочная масса 360\u00a0кг; SEIS, HP³, RISE; две солнечные батареи диаметром по 2,2\u00a0м; научный руководитель У. Б. Банердт, заместитель С. Э. Смрекар (JPL); работа на поверхности до декабря 2022 года.'}},
  {title:'M. Golombek et al. (2020), “Geology of the InSight landing site on Mars”, Nature Communications 11, 1014', url:'https://doi.org/10.1038/s41467-020-14679-1', note:{en:'Lander at 4.502° N, 135.623° E, in a degraded impact crater on a smooth sandy, granule- and pebble-rich surface; dust over thin sand over a variable duricrust.', ru:'Посадочный модуль в точке 4,502° с. ш., 135,623° в. д., в разрушенном ударном кратере на ровной песчаной поверхности с гранулами и галькой; пыль поверх тонкого песка поверх корки переменной толщины.'}},
  {title:'R. D. Lorenz, Y. Nakamura, J. R. Murphy (2017), “Viking-2 Seismometer Measurements on Mars: PDS Data Archive and Meteorological Applications”, Earth and Space Science 4', url:'https://doi.org/10.1002/2017EA000306', note:{en:'The Viking Lander 2 seismometer records, their correlation with wind, and the “sol 80” candidate seismic event.', ru:'Записи сейсмометра «Викинга-2», их связь с ветром и возможное сейсмическое событие «сола 80».'}},
  {title:'NASA Science (2019), “NASA\'s InSight Detects First Likely ‘Quake’ on Mars”', url:'https://science.nasa.gov/missions/insight/nasas-insight-detects-first-likely-quake-on-mars/', note:{en:'Signal of 6 April 2019, sol 128, apparently from inside the planet; size and duration like Apollo moonquakes; Apollo astronauts installed five seismometers that measured thousands of quakes; SEIS provided by CNES, principal investigator at IPGP; shield built by JPL.', ru:'Сигнал 6 апреля 2019 года, сол 128, по-видимому из недр планеты; по размеру и длительности похож на лунотрясения «Аполлонов»; астронавты установили пять сейсмометров, записавших тысячи толчков; SEIS предоставлен CNES, научный руководитель в IPGP; колпак построен JPL.'}},
  {title:'DLR, “Mission InSight: the SEIS seismometer”', url:'https://www.dlr.de/en/research-and-transfer/projects-and-missions/insight/seis-seismometer', note:{en:'VBB sensors (0.01–10 Hz, evacuated container) by IPGP; SP sensors (0.1–50 Hz) by Imperial College; control electronics by ETH Zürich; levelling system by MPS Göttingen; vacuum container, Wind and Thermal Shield and tether (almost 300 wires) by JPL.', ru:'Датчики VBB (0,01–10\u00a0Гц, вакуумированный корпус) — IPGP; короткопериодные SP (0,1–50\u00a0Гц) — Имперский колледж; управляющая электроника — ETH Цюрих; система выравнивания — MPS (Гёттинген); вакуумный корпус, колпак и кабель (почти 300 жил) — JPL.'}},
  {title:'NASA JPL (2019), “InSight\'s Seismometer Now Has a Cozy Shelter on Mars”', url:'https://www.jpl.nasa.gov/news/insights-seismometer-now-has-a-cozy-shelter-on-mars/', note:{en:'Shield deployed 2 February 2019 (sol 66); SEIS on the ground since 19 December; daily swing of about 94 °C; seismometers on Earth often in vaults about 1.2 m underground; three insulating barriers, titanium vacuum sphere.', ru:'Колпак установлен 2 февраля 2019 года (сол 66); SEIS на грунте с 19 декабря; суточный перепад около 94\u00a0°C; на Земле сейсмометры часто ставят в шахты глубиной около 1,2\u00a0м; три теплоизолирующих барьера, титановая вакуумная сфера.'}},
  {title:'P. Lognonné et al. (2019), “SEIS: Insight\'s Seismic Experiment for Internal Structure of Mars”, Space Science Reviews 215, 12', url:'https://doi.org/10.1007/s11214-018-0574-6', note:{en:'The instrument paper: VBB and SP sensors, levelling, shield, noise model; P. Lognonné, IPGP, first author and SEIS principal investigator.', ru:'Описание прибора: датчики VBB и SP, выравнивание, колпак, модель шумов; П. Лоньонне (IPGP) — первый автор и научный руководитель SEIS.'}},
  {title:'NASA JPL (2021), “NASA\'s InSight Finds Three Big Marsquakes, Thanks to Solar-Panel Dusting”', url:'https://www.jpl.nasa.gov/news/nasas-insight-finds-three-big-marsquakes-thanks-to-solar-panel-dusting/', note:{en:'22 September 2021: “InSight\'s seismometer usually finds marsquakes at night, when the planet cools off and winds are low”; sand trickled across a panel to keep the seismometer powered.', ru:'22 сентября 2021 года: сейсмометр InSight обычно находит марсотрясения ночью, когда планета остывает и ветер слабеет; песок, просыпанный на панель, помог сохранить питание сейсмометра.'}},
  {title:'NASA JPL (2022), “NASA Retires InSight Mars Lander Mission After Years of Science”', url:'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/', note:{en:'Last communication 15 December 2022; mission ended after two missed contacts (21 December); 1,319 marsquakes; one of the last images on 11 December, sol 1,436; mole meant for 5 m buried its 40 cm probe just below the surface.', ru:'Последний сеанс связи 15 декабря 2022 года; миссия завершена после двух пропущенных сеансов (21 декабря); 1319 марсотрясений; один из последних снимков — 11 декабря, сол 1436; крот, рассчитанный на 5\u00a0м, лишь чуть погрузил свой 40-сантиметровый зонд.'}},
  {title:'NASA JPL (2022), “NASA\'s InSight Records Monster Quake on Mars”', url:'https://www.jpl.nasa.gov/news/nasas-insight-records-monster-quake-on-mars/', note:{en:'4 May 2022, sol 1,222, estimated magnitude 5; previous largest magnitude 4.2 on 25 August 2021; more than 1,313 quakes so far.', ru:'4 мая 2022 года, сол 1222, предварительная магнитуда 5; прежний рекорд — магнитуда 4,2, 25 августа 2021 года; к тому времени более 1313 толчков.'}},
  {title:'T. Kawamura et al. (2023), “S1222a — The Largest Marsquake Detected by InSight”, Geophysical Research Letters 50, e2022GL101543', url:'https://doi.org/10.1029/2022GL101543', note:{en:'Moment magnitude 4.7, five times the seismic moment of the second-largest event; Love waves, overtones and multi-orbit surface waves; long-period coda over 10 h; energy from below 1/30 Hz to 35 Hz; located near the dichotomy, outside Cerberus Fossae.', ru:'Моментная магнитуда 4,7 — в пять раз больше сейсмический момент, чем у второго по величине события; волны Лява, обертоны и многократно обогнувшие планету поверхностные волны; длиннопериодная кода дольше 10\u00a0ч; энергия от менее 1/30\u00a0Гц до 35\u00a0Гц; очаг у границы дихотомии, вне борозд Цербера.'}},
  {title:'H. Samuel et al. (2023), “Geophysical evidence for an enriched molten silicate layer above Mars\'s core”, Nature 622, 712–717', url:'https://doi.org/10.1038/s41586-023-06601-8', note:{en:'Core radius 1,650 ± 20 km and density 6.5 g/cm³ with a molten basal layer; S1222a at an estimated epicentral distance of 37°.', ru:'Радиус ядра 1650 ± 20\u00a0км и плотность 6,5\u00a0г/см³ при расплавленном слое в основании мантии; S1222a на расчётном эпицентральном расстоянии 37°.'}},
  {title:'B. Fernando et al. (2023), “A Tectonic Origin for the Largest Marsquake Observed by InSight”, Geophysical Research Letters 50, e2023GL103619', url:'https://doi.org/10.1029/2023GL103619', note:{en:'A multi-mission search for a fresh crater about 300 m across and a blast zone about 180 km wide found none: S1222a was “highly likely of tectonic origin”.', ru:'Поиск свежего кратера около 300\u00a0м и зоны выброса около 180\u00a0км силами нескольких миссий ничего не нашёл: S1222a «весьма вероятно тектонического происхождения».'}},
  {title:'NASA JPL (2022), “NASA\'s InSight Hears Its First Meteoroid Impacts on Mars” (Garcia et al., Nature Geoscience 15, 774)', url:'https://www.jpl.nasa.gov/news/nasas-insight-hears-its-first-meteoroid-impacts-on-mars/', note:{en:'Four impacts (27 May 2020, 18 February 2021, 31 August 2021, 5 September 2021) 85–290 km away, quakes no larger than magnitude 2.0; the 5 September meteoroid broke into at least three pieces; CTX found the spots, HiRISE imaged the craters.', ru:'Четыре удара (27 мая 2020, 18 февраля 2021, 31 августа 2021, 5 сентября 2021) в 85–290\u00a0км, толчки не сильнее магнитуды 2,0; метеороид 5 сентября распался минимум на три части; CTX нашла пятна, HiRISE сняла кратеры.'}},
  {title:'NASA JPL (2022), “NASA\'s InSight Lander Detects Stunning Meteoroid Impact on Mars”', url:'https://www.jpl.nasa.gov/news/nasas-insight-lander-detects-stunning-meteoroid-impact-on-mars/', note:{en:'24 December 2021, magnitude 4; crater about 150 m across and 21 m deep in Amazonis Planitia; boulder-size chunks of ice; the first marsquake observed with surface waves; MRO before-and-after images.', ru:'24 декабря 2021 года, магнитуда 4; кратер около 150\u00a0м в поперечнике и 21\u00a0м глубиной на равнине Амазония; глыбы льда размером с валун; первое марсотрясение с поверхностными волнами; снимки MRO «до и после».'}},
  {title:'L. V. Posiolova et al. (2022), “Largest recent impact craters on Mars: Orbital imaging and surface seismic co-investigation”, Science 378, 412–417', url:'https://doi.org/10.1126/science.abq7704', note:{en:'Two craters over 130 m formed in late 2021, the largest fresh craters MRO had found in 16 years; both events above magnitude 4; the impact at 35° N excavated water ice.', ru:'Два кратера больше 130\u00a0м, образовавшиеся во второй половине 2021 года, — крупнейшие свежие кратеры, найденные MRO за 16 лет; оба события сильнее магнитуды 4; удар на 35° с. ш. обнажил водяной лёд.'}},
  {title:'D. Kim et al. (2022), “Surface waves and crustal structure on Mars”, Science 378, 417–421 (open copy, eScholarship)', url:'https://escholarship.org/uc/item/2767881b', note:{en:'S1094b, Mw 4.0 ± 0.2, crater 3,532 km from the lander (MQS distance 59.7 ± 6°); S1000a near Tharsis about 7,460 km away; crustal shear speed about 3.2 km/s at 5–30 km depth north of the dichotomy.', ru:'S1094b, Mw 4,0 ± 0,2, кратер в 3532\u00a0км от посадочного модуля (по MQS — 59,7 ± 6°); S1000a у Фарсиды, около 7460\u00a0км; скорость поперечных волн в коре около 3,2\u00a0км/с на глубинах 5–30\u00a0км к северу от дихотомии.'}},
  {title:'DLR (2022), “Meteorite impact provides a glimpse beneath Mars\' surface”', url:'https://www.dlr.de/en/latest/news/2022/04/meteorite-impact-provides-a-glimpse-beneath-mars-surface', note:{en:'Second impact on 18 September 2021, crater more than 100 m across; Cerberus Fossae epicentres about 1,500 km east of InSight; SEIS recorded 1,318 quakes.', ru:'Второй удар 18 сентября 2021 года, кратер более 100\u00a0м; эпицентры в бороздах Цербера примерно в 1500\u00a0км к востоку от InSight; SEIS записал 1318 толчков.'}},
  {title:'B. Knapmeyer-Endrun et al. (2021), “Thickness and structure of the martian crust from InSight seismic data”, Science 373, 438–443', url:'https://doi.org/10.1126/science.abf8966', note:{en:'Crust under the lander 20 ± 5 km or 39 ± 8 km, depending on which interface is its base; planetary average 24–72 km; lithosphere close to 500 km (issue summary).', ru:'Кора под посадочным модулем 20 ± 5\u00a0км или 39 ± 8\u00a0км в зависимости от того, какая граница считается её подошвой; в среднем по планете 24–72\u00a0км; литосфера около 500\u00a0км (сводка выпуска).'}},
  {title:'A. Khan et al. (2021), “Upper mantle structure of Mars from InSight seismic data”, Science 373, 434–438', url:'https://doi.org/10.1126/science.abf2966', note:{en:'Low-velocity zone under a thermal lithosphere much thicker than Earth\'s; crust enriched in heat-producing elements by a factor of 13 to 20 relative to the primitive mantle.', ru:'Зона пониженных скоростей под термической литосферой, намного более толстой, чем у Земли; кора обогащена теплогенерирующими элементами в 13–20 раз относительно первичной мантии.'}},
  {title:'S. C. Stähler et al. (2021), “Seismic detection of the martian core”, Science 373, 443–448', url:'https://doi.org/10.1126/science.abi7730', note:{en:'Core-reflected S waves: liquid core 1,830 ± 40 km, mean density 5.7–6.3 g/cm³; the core shadow seen from InSight covers half of Mars, including most of Tharsis.', ru:'S-волны, отражённые от ядра: жидкое ядро 1830 ± 40\u00a0км, средняя плотность 5,7–6,3\u00a0г/см³; тень ядра, видимая с InSight, покрывает половину Марса, включая большую часть Фарсиды.'}},
  {title:'J. C. E. Irving et al. (2023), “First observations of core-transiting seismic phases on Mars”, PNAS 120, e2217090120', url:'https://doi.org/10.1073/pnas.2217090120', note:{en:'SKS from S0976a (146 ± 7°, M4.2) and S1000a (impact at 125.9°, M4.1); method A: S0976a SS−PP 858.5 s, SKS−PP 311.0 s; S1000a SKS−PP 344.2 s, SS−SKS 401.4 s; core radius 1,780–1,810 km, density 6.2–6.3 g/cm³, P speed 4.9–5.0 km/s at the top of the core.', ru:'SKS от S0976a (146 ± 7°, M4,2) и S1000a (удар на 125,9°, M4,1); метод A: S0976a SS−PP 858,5\u00a0с, SKS−PP 311,0\u00a0с; S1000a SKS−PP 344,2\u00a0с, SS−SKS 401,4\u00a0с; радиус ядра 1780–1810\u00a0км, плотность 6,2–6,3\u00a0г/см³, скорость P на кровле ядра 4,9–5,0\u00a0км/с.'}},
  {title:'A. Khan et al. (2023), “Evidence for a liquid silicate layer atop the Martian core”, Nature 622, 718–723', url:'https://doi.org/10.1038/s41586-023-06586-4', note:{en:'Core radius 1,675 ± 30 km, density 6.65 ± 0.1 g/cm³; molten silicate layer 150 ± 15 km thick, 4.05 g/cm³; the reflection earlier read as ScS comes from the top of that layer.', ru:'Радиус ядра 1675 ± 30\u00a0км, плотность 6,65 ± 0,1\u00a0г/см³; слой расплавленных силикатов толщиной 150 ± 15\u00a0км, 4,05\u00a0г/см³; отражение, принятое ранее за ScS, приходит от кровли этого слоя.'}},
  {title:'S. Le Maistre et al. (2023), “Spin state and deep interior structure of Mars from InSight radio tracking”, Nature 619, 733–737', url:'https://doi.org/10.1038/s41586-023-06150-0', note:{en:'RISE: for a solid mantle, liquid core radius 1,835 ± 55 km; the radio data argue against a solid inner core.', ru:'RISE: при твёрдой мантии радиус жидкого ядра 1835 ± 55\u00a0км; радиоданные говорят против твёрдого внутреннего ядра.'}},
  {title:'H. Bi et al. (2025), “Seismic detection of a 600-km solid inner core in Mars”, Nature 645, 67–72', url:'https://doi.org/10.1038/s41586-025-09361-9', note:{en:'PKKP and PKiKP phases; inner core radius about 613 ± 67 km, P-speed jump of about 30 % at its boundary; most Martian seismicity lies 27°–40° from InSight; S0976a at 146 ± 7° is still in the shadow zone.', ru:'Фазы PKKP и PKiKP; радиус внутреннего ядра около 613 ± 67\u00a0км, скачок скорости P на его границе около 30\u00a0%; основная сейсмичность Марса — в 27–40° от InSight; S0976a на 146 ± 7° всё ещё в зоне тени.'}},
  {title:'Eos (1 October 2025), “Scientists May Have Finally Detected a Solid Inner Core on Mars”', url:'https://eos.org/articles/scientists-may-have-finally-detected-a-solid-inner-core-on-mars', note:{en:'Reaction to [25]: InSight team member A. Khan, not involved, doubts it — the light-element budget is hard to explain and it conflicts with earlier models.', ru:'Реакция на [25]: участник команды InSight А. Хан, не входивший в авторы, сомневается — трудно объяснить содержание лёгких элементов, и результат противоречит прежним моделям.'}},
  {title:'NASA NSSDCA, “Mars Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html', note:{en:'Mean radius 3,389.5 km; mean surface gravity 3.73 m/s² (Earth 9.82); length of day 24.6597 h; core radius 1,830 km with the footnote “Recent results indicate the radius of the core of Mars may only be 1650 – 1675 km” (retrieved 12 November 2026).', ru:'Средний радиус 3389,5\u00a0км; среднее ускорение свободного падения 3,73\u00a0м/с² (Земля 9,82); продолжительность суток 24,6597\u00a0ч; радиус ядра 1830\u00a0км со сноской «по последним данным радиус ядра Марса может составлять всего 1650–1675\u00a0км» (на 12 ноября 2026 года).'}},
  {title:'C. Durán et al. (2022), “Observation of a Core-Diffracted P-Wave From a Farside Impact With Implications for the Lower-Mantle Structure of Mars”, Geophysical Research Letters 49, e2022GL100887', url:'https://doi.org/10.1029/2022GL100887', note:{en:'S1000a, Mars-calibrated Mw 4.1 ± 0.2, an impact in Tempe Terra about 126° away; events are labelled by sol and a letter; Pdiff along the core.', ru:'S1000a, моментная магнитуда (марсианская калибровка) 4,1 ± 0,2, удар в Земле Темпе в ~126°; события называют по номеру сола и букве; Pdiff вдоль ядра.'}},
  {title:'T. Spohn et al. (2022), “The InSight HP³ Penetrator (Mole) on Mars: Soil Properties Derived from the Penetration Attempts and Related Activities”, Space Science Reviews 218, 72', url:'https://doi.org/10.1007/s11214-022-00941-z', note:{en:'Mole 400 mm × 27 mm, target 3–5 m; forward force 1,100 ± 150 N, recoil on the hull 5–7 N; support-structure springs up to 30 N until about ¾ buried; pit 7 cm deep, 5–6 cm wide; final tip depth about 37 cm; ~20 cm cohesive duricrust; density 1,211 kg/m³; friction angles of Martian soils 30°–40°; scoop lateral force about 10 N; last test on sol 754.', ru:'Крот 400 × 27\u00a0мм, цель 3–5\u00a0м; усилие вперёд 1100 ± 150\u00a0Н, отдача на корпус 5–7\u00a0Н; пружины опорной конструкции до 30\u00a0Н, пока крот не погрузится примерно на ¾; яма глубиной 7\u00a0см и шириной 5–6\u00a0см; итоговая глубина острия около 37\u00a0см; связная корка около 20\u00a0см; плотность 1211\u00a0кг/м³; углы трения марсианских грунтов 30–40°; боковое усилие ковша около 10\u00a0Н; последняя проба на сол 754.'}},
  {title:'NASA JPL (2021), “NASA InSight\'s ‘Mole’ Ends Its Journey on Mars”', url:'https://www.jpl.nasa.gov/news/nasa-insights-mole-ends-its-journey-on-mars/', note:{en:'14 January 2021: the soil\'s tendency to clump deprived the mole of friction; final attempt on 9 January with 500 strokes; first hammering on 28 February 2019; T. Spohn (DLR) principal investigator.', ru:'14 января 2021 года: склонность грунта слипаться лишила крота трения; последняя попытка 9 января — 500 ударов; первое забивание 28 февраля 2019 года; научный руководитель — Т. Шпон (DLR).'}},
  {title:'AIAA (2018), “NASA\'s InSight Lander Set Solar Power Record” (NASA release)', url:'https://aiaa.org/2018/12/03/nasa-s-insight-lander-set-solar-power-record/', note:{en:'4,588 watt-hours on sol 1, more energy in one day than any previous Mars vehicle.', ru:'4588 ватт-часов за первый сол — больше энергии за день, чем у любого прежнего аппарата на Марсе.'}},
  {title:'NASA JPL (2022), “NASA\'s InSight Still Hunting Marsquakes as Power Levels Diminish”', url:'https://www.jpl.nasa.gov/news/nasas-insight-still-hunting-marsquakes-as-power-levels-diminish', note:{en:'Around 5,000 Wh a sol after landing (an oven for 1 h 40 min), roughly 500 Wh in May 2022 (10 minutes); a 25 % cleaning would add about 1,000 Wh a sol; arm parked in May; seismometer off by the end of summer expected.', ru:'Около 5000\u00a0Вт·ч за сол после посадки (духовка на 1\u00a0ч 40\u00a0мин), около 500\u00a0Вт·ч в мае 2022 года (10 минут); очистка 25\u00a0% добавила бы около 1000\u00a0Вт·ч за сол; манипулятор уложен в мае; сейсмометр ожидали выключить к концу лета.'}},
  {title:'NASA JPL (2022), “NASA\'s InSight Waits Out Dust Storm”', url:'https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm', note:{en:'7 October 2022: a storm about 3,500 km away; output fell from 425 to 275 Wh a sol; the seismometer had been running about 24 hours every other sol; end expected between late October 2022 and January 2023.', ru:'7 октября 2022 года: буря примерно в 3500\u00a0км; выработка упала с 425 до 275\u00a0Вт·ч за сол; сейсмометр работал около 24 часов через сол; конец ожидался между концом октября 2022 и январём 2023 года.'}},
  {title:'NASA JPL Solar System Dynamics, “Approximate Positions of the Planets” (E. M. Standish), Table 1', url:'https://ssd.jpl.nasa.gov/planets/approx_pos.html', note:{en:'Keplerian elements and rates for Mars, valid 1800–2050: a = 1.52371034 AU, e = 0.09339410, L = −4.55343205° + 19,140.30268499°/century, ϖ = −23.94362959°.', ru:'Кеплеровы элементы Марса и их скорости изменения, 1800–2050 гг.: a = 1,52371034\u00a0а. е., e = 0,09339410, L = −4,55343205° + 19\u00a0140,30268499° за столетие, ϖ = −23,94362959°.'}},
  {title:'T. C. Hanks, H. Kanamori (1979), “A moment magnitude scale”, Journal of Geophysical Research 84(B5), 2348–2350', url:'https://doi.org/10.1029/JB084iB05p02348', note:{en:'M<sub>W</sub> = (2/3) log<sub>10</sub> M<sub>0</sub> − 10.7, with M<sub>0</sub> in dyne·cm.', ru:'M<sub>W</sub> = (2/3) lg M<sub>0</sub> − 10,7, где M<sub>0</sub> в дин·см.'}},
  {title:'J. D. Eshelby (1957), “The determination of the elastic field of an ellipsoidal inclusion, and related problems”, Proceedings of the Royal Society A 241, 376–396', url:'https://doi.org/10.1098/rspa.1957.0133', note:{en:'The circular-crack relation used for the rupture radius: M<sub>0</sub> = (16/7) Δσ a³.', ru:'Соотношение для круговой трещины, по которому оценён радиус разрыва: M<sub>0</sub> = (16/7) Δσ a³.'}},
  {title:'CNRS News (24 July 2021), “InSight probes the Martian interior” (interview with P. Lognonné)', url:'https://news.cnrs.fr/articles/insight-probes-the-martian-interior', note:{en:'Philippe Lognonné, geophysicist at IPGP and professor at the Université de Paris, “Principal Investigator for the SEIS seismometer”.', ru:'Филипп Лоньонне, геофизик IPGP и профессор Парижского университета, — «научный руководитель сейсмометра SEIS».'}},
  {title:'J. Clinton et al. (2025), “The Marsquake Service Reference Catalogue”, EGU General Assembly 2025, EGU25-13152', url:'https://meetingorganizer.copernicus.org/EGU25/EGU25-13152.html', note:{en:'Earlier catalogue versions listed over 1,300 events; the reference catalogue the Marsquake Service was finalising in 2025 includes over 1,900 events, with improved locations and new interpretation types.', ru:'Прежние версии каталога содержали больше 1300 событий; эталонный каталог, который Служба марсотрясений завершала в 2025 году, — больше 1900 событий с уточнёнными координатами и новыми типами интерпретации.'}},
  {title:'P. W. Mayne, F. H. Kulhawy (1982), “K<sub>0</sub>–OCR relationships in soil”, Journal of the Geotechnical Engineering Division (ASCE) 108(6), 851–872', url:'https://doi.org/10.1061/AJGEB6.0001306', note:{en:'A review of laboratory data confirming Jáky\'s (1944) at-rest coefficient K<sub>0</sub> = 1 − sin φ for normally consolidated soils.', ru:'Обзор лабораторных данных, подтверждающий формулу Яки (1944) для коэффициента бокового давления покоя K<sub>0</sub> = 1 − sin φ в нормально уплотнённых грунтах.'}},
  {title:'NASA JPL (2021), “NASA\'s InSight Mars Lander Gets a Power Boost”', url:'https://www.jpl.nasa.gov/news/nasas-insight-mars-lander-gets-a-power-boost/', note:{en:'3 June 2021: on 22 May 2021, sol 884, the robotic arm trickled sand next to a solar panel so that the wind carried some dust off; a gain of about 30 Wh per sol.', ru:'3 июня 2021 года: 22 мая 2021 года, на сол 884, манипулятор сыпал песок рядом с солнечной панелью, и ветер унёс часть пыли; прирост около 30\u00a0Вт·ч за сол.'}}

];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderMQ(); renderML(); renderRC(); renderPW();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__quake = {R_M:R_M, G_MARS:G_MARS, G_EARTH:G_EARTH, KM_PER_DEG:KM_PER_DEG, SOL_MS:SOL_MS, LANDING:LANDING, solOf:solOf, moment:moment, ruptureRadius:ruptureRadius,
  EVENTS:EVENTS, SMALL_IMPACTS:SMALL_IMPACTS, V_CORE:V_CORE, S1000A:S1000A, S0976A:S0976A, shadowEdge:shadowEdge, shadowShare:shadowShare, directOK:directOK,
  sksGeom:sksGeom, sksTime:sksTime, ppLen:ppLen, fitMantle:fitMantle, rayTimes:rayTimes, k0:k0, muWall:muWall, hullFriction:hullFriction, moleForce:moleForce,
  RHO_SOIL:RHO_SOIL, D_MOLE:D_MOLE, L_MOLE:L_MOLE, CRUST:CRUST, marsSunAU:marsSunAU, solMs:solMs, sunFactor:sunFactor, TAU:TAU, powerWh:powerWh, cleanWh:cleanWh,
  dustFactor:dustFactor, sweepGain:sweepGain, MAY2022:MAY2022, EXT:EXT, OVEN_WH_PER_MIN:OVEN_WH_PER_MIN, sci:sci, mmss:mmss, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
