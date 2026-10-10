/* ============ CONSTANTS ============ */
var R_V = 6051.8, GM_V = 324860, T_ROT = 5832.6;                        // km, km³/s², sidereal rotation in hours [5]
var LAMBDA = 0.126, D_ANT = 3.7, BW = 2.26e6, DR_SLANT = 88, D_AZ = 120;  // m, m, Hz, m, m [4]
var ALT_P = 289, ALT_A = 8458, LAT_P = 9.5, P_MAP = 3.259;              // mapping orbit, Table 1-1 [4]
var G0 = 9.80665, ISP_N2H4 = 220;                                        // Isp is an assumption for monopropellant hydrazine
/* Cycle 1 incidence-angle profile, Table 4-1 of [4]: [latitude, degrees] */
var INC1 = [[90,16.5],[85,18.5],[80,20.2],[75,22.0],[70,23.9],[65,26.0],[60,28.3],[55,30.8],[50,33.3],[45,35.8],[40,38.1],[35,40.3],[30,42.1],[25,43.6],[20,44.8],[15,45.5],[10,45.7],[5,45.6],[0,44.9],[-5,43.8],[-10,42.3],[-15,40.4],[-20,38.1],[-25,35.5],[-30,32.8],[-35,30.1],[-40,27.5],[-45,25.1],[-50,23.1],[-55,21.6],[-60,20.5],[-65,19.7],[-70,18.5],[-75,16.3]];
var D2R = Math.PI/180;

function incidence(lat){
  for(var i = 0; i < INC1.length - 1; i++){
    var a = INC1[i], b = INC1[i + 1];
    if(lat <= a[0] && lat >= b[0]) return a[1] + (b[1] - a[1])*(a[0] - lat)/(a[0] - b[0]);
  }
  return lat > 90 ? INC1[0][1] : INC1[INC1.length - 1][1];
}
function period(rp, ra){ var a = (rp + ra)/2; return 2*Math.PI*Math.sqrt(a*a*a/GM_V); }   // seconds
function altitude(lat){
  var rp = R_V + ALT_P, ra = R_V + ALT_A, a = (rp + ra)/2, e = (ra - rp)/(ra + rp);
  return a*(1 - e*e)/(1 + e*Math.cos((lat - LAT_P)*D2R)) - R_V;
}
/* Spherical geometry: incidence θ at the surface, look angle φ from nadir, central angle γ = θ − φ. */
function geometry(lat){
  var h = altitude(lat), th = incidence(lat)*D2R, rs = R_V + h;
  var phi = Math.asin(R_V*Math.sin(th)/rs), gam = th - phi;
  var rho = Math.sqrt(rs*rs + R_V*R_V - 2*R_V*rs*Math.cos(gam));                           // km
  return {h:h, theta:th/D2R, phi:phi/D2R, gamma:gam/D2R, rho:rho,
    delay:2*rho/299792.458*1000,                                                              // ms
    beam:rho*LAMBDA/D_ANT,                                                                    // km, real-aperture footprint along track
    synth:rho*1000*LAMBDA/(2*D_AZ)/1000,                                                      // km, synthetic aperture for 120 m
    ground:DR_SLANT/Math.sin(th)};                                                            // m
}
function spacing(lat, Ph){ return 2*Math.PI*R_V*Math.cos(lat*D2R)*Ph/T_ROT; }                  // km between successive strips
function sizeParam(a, lam){ return 2*Math.PI*a/lam; }
/* Aerobraking: periapsis held at 197 km, the same speed loss dv (m/s) at every pass. */
var RP_AB = R_V + 197, RA0 = R_V + 8467, RA1 = R_V + 541;
function vPeri(ra){ return Math.sqrt(GM_V*2*ra/(RP_AB*(RP_AB + ra))); }
function aerobrake(dv){
  var ra = RA0, t = 0, n = 0, hist = [[0, ra - R_V]];
  while(ra > RA1 && n < 20000){
    t += period(RP_AB, ra);
    var v = vPeri(ra) - dv/1000, a = 1/(2/RP_AB - v*v/GM_V);
    ra = 2*a - RP_AB; n++;
    if(n % 5 === 0 || ra <= RA1) hist.push([t/86400, Math.max(ra, RA1) - R_V]);
  }
  return {passes:n, days:t/86400, hist:hist};
}
function dvPropulsive(){ return (vPeri(RA0) - vPeri(RA1))*1000; }                          // m/s
function propellant(m0, dv, isp){ return m0*(1 - Math.exp(-dv/(G0*isp))); }
function dvFromProp(m0, mp, isp){ return G0*isp*Math.log(m0/(m0 - mp)); }
/* Craters: deterministic generator, uniform on the sphere (z = sin latitude uniform). */
var N_CRATERS = 912;                                                     // catalogue at ~98% coverage [16]
function mulberry(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
function craters(n, seed){ var r = mulberry(seed), out = []; for(var i = 0; i < n; i++) out.push([r()*360, r()*2 - 1]); return out; }
function bandSd(n, f){ return Math.sqrt(n*f*(1 - f)); }          // binomial: the total is fixed
function countBand(list, f){ var c = 0; list.forEach(function(p){ if(Math.abs(p[1]) < f) c++; }); return c; }

/* ============ CH1 — RESOLUTION LADDER + DROPLETS ============ */
var LADDER = [
  ['Pioneer Venus', 'Pioneer Venus', 50000, 140000, '1978'],
  ['Venera 15/16', '«Венера-15/16»', 1200, 2400, '1983'],
  ['Magellan', '«Магеллан»', 120, 300, '1990'],
  ['VERITAS', 'VERITAS', 30, 30, '2031+']
];
var rLam = 0.126;
function renderR(){
  var svg = document.getElementById('rSvg'); svg.innerHTML = '';
  var L = 130, R = 465, lo = 10, hi = 200000;
  function X(m){ return L + (Math.log10(m) - Math.log10(lo))/(Math.log10(hi) - Math.log10(lo))*(R - L); }
  [10, 100, 1000, 10000, 100000].forEach(function(m){
    ns('line', {x1:X(m), y1:24, x2:X(m), y2:214, stroke:'#e4e4de'}, svg);
    txt(svg, X(m), 230, m >= 1000 ? fmtInt(m/1000) + T(' km',' км') : m + T(' m',' м'), 'svg-small', 'middle');
  });
  txt(svg, R, 246, T('smallest visible feature (log scale)','наименьшая различимая деталь (логарифмическая шкала)'), 'svg-small', 'end');
  LADDER.forEach(function(r, i){
    var y = 40 + i*46;
    txt(svg, 8, y + 4, T(r[0], r[1]), 'svg-label');
    txt(svg, 8, y + 18, r[4], 'svg-small');
    var x1 = X(r[2]), x2 = Math.max(X(r[3]), x1 + 6);
    ns('rect', {x:x1, y:y - 8, width:x2 - x1, height:16, fill: i === 2 ? '#b5452a' : '#8a8a82', rx:2}, svg);
  });
  var a = 1e-6, x = sizeParam(a, rLam), rel = Math.pow(0.126/rLam, 4);
  cells(document.getElementById('rReadout'), [
    [T('WAVELENGTH','ДЛИНА ВОЛНЫ'), rLam >= 0.01 ? fmt(rLam*100, 1) + T(' cm',' см') : fmt(rLam*1e6, 2) + T(' µm',' мкм')],
    [T('SIZE PARAMETER 2πa/λ','ПАРАМЕТР РАЗМЕРА 2πa/λ'), x < 0.01 ? x.toExponential(1).replace('.', T('.', ',')) : fmt(x, 1)],
    [T('RAYLEIGH (a/λ)⁴ vs 12.6 cm','РЭЛЕЙ (a/λ)⁴ ОТНОСИТЕЛЬНО 12,6 см'), rel < 10 ? fmt(rel, 0) + '×' : '10' + supNum(Math.round(Math.log10(rel))) + '×', true]
  ]);
  document.getElementById('rStatus').innerHTML = x > 1
    ? (rLam > 1e-6 ? T('Scattered over and over but hardly absorbed: the surface\'s heat glow leaks through, blurred to tens of kilometres — too coarse for a map.','Свет многократно рассеивается, но почти не поглощается: тепловое свечение поверхности просачивается наружу, размытое до десятков километров, — для карты слишком грубо.')
       : T('The droplet is as large as the wave or larger: sunlight is scattered over and over, and the clouds show only themselves.','Капля не меньше длины волны: солнечный свет рассеивается снова и снова, и видны только сами облака.'))
    : T('The droplet is a speck compared with the wave: scattering is negligible, and the radar sees the ground.','Капля — пылинка по сравнению с волной: рассеяние ничтожно, и радиолокатор видит грунт.');
}
function supNum(n){ var s = '⁰¹²³⁴⁵⁶⁷⁸⁹'; return String(n).split('').map(function(c){ return s[+c]; }).join(''); }
Array.prototype.forEach.call(document.querySelectorAll('#rPre .btn'), function(btn){
  btn.addEventListener('click', function(){ rLam = +this.getAttribute('data-l'); pressGroup(this.parentNode, this); renderR(); });
});

/* ============ CH2 — SAR GEOMETRY ============ */
var gLat = document.getElementById('gLat');
function latStr(l){ return fmt(Math.abs(l), Math.abs(l) % 1 ? 1 : 0) + '° ' + (l >= 0 ? T('N','с. ш.') : T('S','ю. ш.')); }
function renderG(){
  var lat = +gLat.value, g = geometry(lat);
  document.getElementById('gLatVal').textContent = latStr(lat);
  var svg = document.getElementById('gSvg'); svg.innerHTML = '';
  var s = 0.085, cx = 150, top = 255, cy = top + R_V*s;
  ns('circle', {cx:cx, cy:cy, r:R_V*s, fill:'#efe7d4', stroke:'#a8741a'}, svg);
  var sy = top - g.h*s, gm = g.gamma*D2R;
  var px = cx + R_V*s*Math.sin(gm), py = cy - R_V*s*Math.cos(gm);
  ns('line', {x1:cx, y1:sy, x2:cx, y2:top, stroke:'#8a8a82', 'stroke-dasharray':'3 3'}, svg);
  ns('line', {x1:cx, y1:sy, x2:px, y2:py, stroke:'#2f5aa1', 'stroke-width':2}, svg);
  ns('rect', {x:cx - 6, y:sy - 5, width:12, height:10, fill:'#0b0b0c'}, svg);
  ns('circle', {cx:px, cy:py, r:4, fill:'#b5452a'}, svg);
  txt(svg, cx - 10, sy - 10, fmtInt(g.h) + T(' km',' км'), 'svg-small', 'end');
  txt(svg, (cx + px)/2 + 8, (sy + py)/2, 'ρ = ' + fmtInt(g.rho) + T(' km',' км'), 'svg-small');
  txt(svg, cx + 6, top - 4, T('nadir','надир'), 'svg-small');
  // footprint comparison bars, to scale against each other
  var bx = 300, by = 60, kmPx = 140/Math.max(20, g.beam);
  txt(svg, bx, by - 22, T('along-track size, to scale','размер вдоль трассы, в масштабе'), 'svg-small');
  ns('rect', {x:bx, y:by, width:g.beam*kmPx, height:14, fill:'#8a8a82'}, svg);
  txt(svg, bx, by + 28, T('real 3.7 m dish: ','реальная антенна 3,7 м: ') + fmt(g.beam, 1) + T(' km',' км'), 'svg-small');
  ns('rect', {x:bx, y:by + 44, width:Math.max(1.5, D_AZ/1000*kmPx), height:14, fill:'#b5452a'}, svg);
  txt(svg, bx, by + 72, T('SAR resolution cell: 120 m','элемент разрешения РСА: 120 м'), 'svg-small');
  // echo timing
  var tb = 190, tw = 160, tmax = 30;
  txt(svg, bx, tb - 12, T('echo round trip, ms','время эха туда и обратно, мс'), 'svg-small');
  ns('line', {x1:bx, y1:tb, x2:bx + tw, y2:tb, stroke:'#e4e4de', 'stroke-width':6}, svg);
  ns('line', {x1:bx, y1:tb, x2:bx + Math.min(1, g.delay/tmax)*tw, y2:tb, stroke:'#2f5aa1', 'stroke-width':6}, svg);
  txt(svg, bx, tb + 18, '0', 'svg-small'); txt(svg, bx + tw, tb + 18, tmax, 'svg-small', 'end');
  cells(document.getElementById('gReadout'), [
    [T('ALTITUDE','ВЫСОТА'), fmtInt(g.h) + T(' km',' км')],
    [T('INCIDENCE ANGLE','УГОЛ ПАДЕНИЯ'), fmt(g.theta, 1) + '°'],
    [T('SLANT RANGE','НАКЛОННАЯ ДАЛЬНОСТЬ'), fmtInt(g.rho) + T(' km',' км')],
    [T('ECHO DELAY','ЗАДЕРЖКА ЭХА'), fmt(g.delay, 2) + T(' ms',' мс')],
    [T('REAL-APERTURE FOOTPRINT','ПЯТНО РЕАЛЬНОЙ АПЕРТУРЫ'), fmt(g.beam, 1) + T(' km',' км')],
    [T('SYNTHETIC APERTURE NEEDED','НУЖНАЯ СИНТЕЗИРОВАННАЯ АПЕРТУРА'), fmt(g.synth*1000, 0) + T(' m',' м')],
    [T('GROUND-RANGE RESOLUTION','РАЗРЕШЕНИЕ ПО ДАЛЬНОСТИ НА ГРУНТЕ'), fmtInt(g.ground) + T(' m',' м')],
    [T('ALONG-TRACK RESOLUTION','РАЗРЕШЕНИЕ ВДОЛЬ ТРАССЫ'), '120' + T(' m',' м')]
  ]);
  hud1.textContent = fmtInt(g.h) + T(' km',' км'); hud2.textContent = fmtInt(g.ground) + T(' m',' м');
  document.getElementById('gStatus').innerHTML = g.theta > 40
    ? T('Near periapsis the spacecraft is low, so it can look farther off to the side (a larger, more oblique incidence angle): the best ground resolution of the pass.','У перицентра аппарат низко и может смотреть дальше вбок (больший, более пологий угол падения): лучшее разрешение на грунте за виток.')
    : T('High above the poles the echo is weak, so the dish looks closer to straight down; a small incidence angle stretches each 88 m range cell over more ground.','Высоко над полюсами эхо слабое, и антенна смотрит ближе к отвесу; малый угол падения растягивает каждый 88-метровый элемент дальности на больший участок грунта.');
}
gLat.addEventListener('input', function(){ pressGroup(document.getElementById('gPre'), null); renderG(); });
Array.prototype.forEach.call(document.querySelectorAll('#gPre .btn'), function(btn){
  btn.addEventListener('click', function(){ gLat.value = this.getAttribute('data-v'); pressGroup(this.parentNode, this); renderG(); });
});

/* ============ CH3 — MAPPING STRIPS ============ */
var mLat = document.getElementById('mLat'), mP = document.getElementById('mP'), mW = document.getElementById('mW');
var CYCLES = [[1, 83.7, '15.05.1991'], [2, 96, '15.01.1992'], [3, 98, '13.09.1992']];
function renderM(){
  var lat = +mLat.value, P = +mP.value, W = +mW.value, sp = spacing(lat, P), gap = sp - W;
  document.getElementById('mLatVal').textContent = fmt(lat, 0) + '°';
  document.getElementById('mPVal').textContent = fmt(P, 2) + T(' h',' ч');
  document.getElementById('mWVal').textContent = fmt(W, 1) + T(' km',' км');
  var svg = document.getElementById('mSvg'); svg.innerHTML = '';
  var x0 = 20, y0 = 30, h = 120, k = 1.3;
  txt(svg, x0, y0 - 10, T('8 successive strips, west to east, to scale','8 полос подряд, с запада на восток, в масштабе'), 'svg-small');
  for(var i = 0; i < 8; i++){
    var x = x0 + i*sp*k;
    if(x > 470) break;
    ns('rect', {x:x, y:y0 + (i % 2)*6, width:Math.min(W*k, 470 - x), height:h, fill:'#2f5aa1', 'fill-opacity':0.28, stroke:'#2f5aa1', 'stroke-width':0.6}, svg);
    if(gap > 0 && x + W*k < 470) ns('rect', {x:x + W*k, y:y0 + h + 10, width:Math.min(gap*k, 470 - x - W*k), height:5, fill:'#b5452a'}, svg);
  }
  ns('line', {x1:x0, y1:y0 + h + 24, x2:x0 + 50*k, y2:y0 + h + 24, stroke:'#0b0b0c'}, svg);
  txt(svg, x0, y0 + h + 38, '50' + T(' km',' км'), 'svg-small');
  // coverage per cycle
  var cb = 222;
  txt(svg, 150, cb - 12, T('surface mapped after each cycle [1]','отснято поверхности после каждого цикла [1]'), 'svg-small');
  CYCLES.forEach(function(c, j){
    var y = cb + j*16;
    txt(svg, 150, y + 9, T('cycle ','цикл ') + c[0], 'svg-small');
    ns('rect', {x:205, y:y, width:240, height:10, fill:'#e4e4de'}, svg);
    ns('rect', {x:205, y:y, width:240*c[1]/100, height:10, fill:'#b5452a'}, svg);
    txt(svg, 450, y + 9, fmt(c[1], c[1] % 1 ? 1 : 0) + '%', 'svg-small');
  });
  cells(document.getElementById('mReadout'), [
    [T('VENUS TURNS PER ORBIT','ПОВОРОТ ВЕНЕРЫ ЗА ВИТОК'), fmt(360*P/T_ROT, 3) + '°'],
    [T('STRIP SPACING HERE','ШАГ ПОЛОС ЗДЕСЬ'), fmt(sp, 1) + T(' km',' км')],
    [gap > 0 ? T('GAP BETWEEN STRIPS','ЗАЗОР МЕЖДУ ПОЛОСАМИ') : T('OVERLAP','ПЕРЕКРЫТИЕ'), fmt(Math.abs(gap), 1) + T(' km',' км')],
    [T('ORBITS PER 243-DAY CYCLE','ВИТКОВ ЗА ЦИКЛ 243 СУТ'), fmtInt(T_ROT/P)]
  ]);
  document.getElementById('mStatus').innerHTML = gap > 0
    ? T('Gaps: the planet turns more than one strip width per orbit, and stripes of Venus are never seen. A shorter orbit or a wider strip would close them.','Зазоры: за виток планета поворачивается больше чем на ширину полосы, и часть Венеры так и не попадает в кадр. Закрыть их можно более коротким периодом или более широкой полосой.')
    : (lat > 60 ? T('Near the pole the strips converge and pile up: each place is imaged many times over.','У полюса полосы сходятся и наслаиваются: каждое место снимается многократно.')
                : T('Each strip overlaps the last — continuous coverage, as Magellan flew it.','Каждая полоса перекрывает предыдущую — непрерывное покрытие, как летал «Магеллан».'));
}
[mLat, mP, mW].forEach(function(el){ el.addEventListener('input', renderM); });

/* ============ CH4 — CRATERS ============ */
var kF = document.getElementById('kF'), kSeed = 1990, kList = craters(N_CRATERS, kSeed);
function renderK(){
  var f = +kF.value, n = countBand(kList, f), exp = N_CRATERS*f, sd = bandSd(N_CRATERS, f), z = (n - exp)/sd;
  document.getElementById('kFVal').textContent = fmt(f*100, 0) + '%';
  var svg = document.getElementById('kSvg'); svg.innerHTML = '';
  var x0 = 20, y0 = 20, w = 440, h = 200;
  ns('rect', {x:x0, y:y0, width:w, height:h, fill:'#efe7d4', stroke:'#a8741a'}, svg);
  ns('rect', {x:x0, y:y0 + h*(1 - f)/2, width:w, height:h*f, fill:'#2f5aa1', 'fill-opacity':0.18, stroke:'#2f5aa1'}, svg);
  kList.forEach(function(p){ ns('circle', {cx:x0 + p[0]/360*w, cy:y0 + (1 - p[1])/2*h, r:1.4, fill: Math.abs(p[1]) < f ? '#b5452a' : '#0b0b0c'}, svg); });
  txt(svg, x0, y0 + h + 16, T('equal-area map: north at top, equator in the middle','равновеликая карта: север сверху, экватор посередине'), 'svg-small');
  txt(svg, x0 + w, y0 + h + 32, fmtInt(N_CRATERS) + T(' craters, random',' кратеров, случайно'), 'svg-small', 'end');
  var lat = Math.asin(f)/D2R;
  cells(document.getElementById('kReadout'), [
    [T('BAND','ПОЛОСА'), '±' + fmt(lat, 1) + '°'],
    [T('EXPECTED','ОЖИДАЕТСЯ'), fmt(exp, 0) + ' ± ' + fmt(sd, 0)],
    [T('COUNTED','НАСЧИТАНО'), fmtInt(n)],
    [T('DENSITY, PER MILLION km²','ПЛОТНОСТЬ НА МИЛЛИОН км²'), fmt(N_CRATERS/(4*Math.PI*R_V*R_V)*1e6, 2)]
  ]);
  document.getElementById('kStatus').innerHTML = Math.abs(z) < 2
    ? T('Within about two standard deviations of the expected count — what pure chance looks like.','В пределах примерно двух стандартных отклонений от ожидаемого — так выглядит чистая случайность.')
    : T('More than two standard deviations off — it happens by chance about one time in twenty. Throw again.','Отклонение больше двух стандартных — случайно так бывает примерно в одном случае из двадцати. Бросьте снова.');
}
kF.addEventListener('input', renderK);
document.getElementById('kThrow').addEventListener('click', function(){ kSeed += 1; kList = craters(N_CRATERS, kSeed); renderK(); });

/* ============ CH5 — AEROBRAKING ============ */
var aDv = document.getElementById('aDv'), aM = document.getElementById('aM');
function renderA(){
  var dv = +aDv.value, m0 = +aM.value, r = aerobrake(dv), DV = dvPropulsive(), mp = propellant(m0, DV, ISP_N2H4);
  document.getElementById('aDvVal').textContent = fmt(dv, 2) + T(' m/s',' м/с');
  document.getElementById('aMVal').textContent = fmtInt(m0) + T(' kg',' кг');
  var svg = document.getElementById('aSvg'); svg.innerHTML = '';
  // orbits to scale, Venus at the focus
  var s = 0.0085, fx = 165, fy = 140;
  function ell(ra, col, wd){
    var a = (RP_AB + ra)/2, c = a - RP_AB, b = Math.sqrt(a*a - c*c);
    ns('ellipse', {cx:fx - c*s, cy:fy, rx:a*s, ry:b*s, fill:'none', stroke:col, 'stroke-width':wd}, svg);
  }
  ns('circle', {cx:fx, cy:fy, r:R_V*s, fill:'#efe7d4', stroke:'#a8741a'}, svg);
  ell(RA0, '#8a8a82', 1.2); ell(RA1, '#b5452a', 2);
  txt(svg, 8, 20, T('before: 8,467 km high point','до: апоцентр 8467 км'), 'svg-small');
  txt(svg, 8, 262, T('after: 541 × 197 km','после: 541 × 197 км'), 'svg-small');
  // apoapsis vs day
  var L = 270, R = 468, Tp = 30, B = 230, dmax = Math.max(80, Math.ceil(r.days/20)*20);
  function X(d){ return L + d/dmax*(R - L); }
  function Y(h){ return B - h/9000*(B - Tp); }
  [0, 3000, 6000, 9000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 4, Y(h) + 3, fmtInt(h), 'svg-small', 'end'); });
  [0, dmax/2, dmax].forEach(function(d){ txt(svg, X(d), B + 14, fmtInt(d), 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('days','сутки'), 'svg-small', 'end'); txt(svg, L - 30, 18, T('high point, km','апоцентр, км'), 'svg-small');
  if(70 <= dmax){ ns('line', {x1:X(70), y1:Tp, x2:X(70), y2:B, stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg); txt(svg, X(70) + 3, Tp + 10, T('70 days, 1993','70 суток, 1993'), 'svg-small'); }
  var d = ''; r.hist.forEach(function(p, i){ d += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); });
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  cells(document.getElementById('aReadout'), [
    [T('PASSES THROUGH THE AIR','ПРОХОДОВ ЧЕРЕЗ АТМОСФЕРУ'), fmtInt(r.passes)],
    [T('DURATION','ДЛИТЕЛЬНОСТЬ'), fmt(r.days, 0) + T(' days',' сут')],
    [T('TOTAL Δv REMOVED','ВСЕГО ПОГАШЕНО Δv'), fmt(DV/1000, 2) + T(' km/s',' км/с')],
    [T('FINAL PERIOD','ИТОГОВЫЙ ПЕРИОД'), fmt(period(RP_AB, RA1)/60, 1) + T(' min',' мин')],
    [T('HYDRAZINE TO DO IT WITH THRUSTERS','ГИДРАЗИНА ДЛЯ ДВИГАТЕЛЕЙ'), fmtInt(mp) + T(' kg',' кг')],
    [T('HYDRAZINE AT LAUNCH (MUCH SPENT BY 1993)','ГИДРАЗИНА ПРИ ЗАПУСКЕ (К 1993 Г. БОЛЬШАЯ ЧАСТЬ ИЗРАСХОДОВАНА)'), T('132.5 kg','132,5 кг'), true],
    [T('Δv THAT FULL LOAD COULD GIVE','Δv ОТ ВСЕГО ЗАПАСА'), fmtInt(dvFromProp(m0, 132.5, ISP_N2H4)) + T(' m/s',' м/с') + ' (' + fmt(dvFromProp(m0, 132.5, ISP_N2H4)/DV*100, 0) + T('% of what was needed)','% от нужного)'), true]
  ]);
  document.getElementById('aStatus').innerHTML = Math.abs(r.days - 70) < 6
    ? T('About 1.6 m/s per pass reproduces the real campaign: 70 days and more than 700 passes [6][7].','Около 1,6 м/с за проход воспроизводят реальную кампанию: 70 суток и более 700 проходов [6][7].')
    : r.days > 70 ? T('Gentler passes are safer for the hardware but take longer.','Более мягкие проходы безопаснее для аппарата, но занимают больше времени.')
    : T('Deeper dips finish sooner but heat and load a spacecraft never built for it.','Более глубокие погружения быстрее, но нагревают и нагружают аппарат, не созданный для этого.');
}
[aDv, aM].forEach(function(el){ el.addEventListener('input', renderA); });

/* ============ CH6 — TIMELINE ============ */
var TIMELINE = [
  ['1978', 'Pioneer Venus Orbiter maps 92% of Venus by radar at 50–140 km [3].', 'Pioneer Venus Orbiter снимает радиолокатором 92% Венеры с разрешением 50–140 км [3].'],
  ['1983', 'Venera 15 and 16 image about a quarter of the planet at 1.2–2.4 km [3].', '«Венера-15» и «Венера-16» снимают около четверти планеты с разрешением 1,2–2,4 км [3].'],
  ['1989', '<b>4 May:</b> Magellan launched from Space Shuttle Atlantis (STS-30) [1].', '<b>4 мая:</b> запуск «Магеллана» с шаттла «Атлантис» (STS-30) [1].'],
  ['1990', '<b>10 August:</b> Venus orbit, 297 × 8,463 km at 85.5°; <b>15 September:</b> mapping begins [1].', '<b>10 августа:</b> выход на орбиту Венеры, 297 × 8463 км, наклон 85,5°; <b>15 сентября:</b> начало съёмки [1].'],
  ['1991', '<b>15 May:</b> Cycle 1 ends, 83.7% mapped [1].', '<b>15 мая:</b> конец цикла 1, отснято 83,7% [1].'],
  ['1992', '<b>15 January:</b> Cycle 2, 96%; <b>13 September:</b> Cycle 3 (stereo), 98% [1].', '<b>15 января:</b> цикл 2, 96%; <b>13 сентября:</b> цикл 3 (стерео), 98% [1].'],
  ['1993', '<b>25 May – 3 August:</b> 70 days of aerobraking, dipping to about 140 km, to a 541 × 197 km orbit for gravity mapping [6][17].', '<b>25 мая – 3 августа:</b> 70 суток аэроторможения с погружением примерно до 140 км, до орбиты 541 × 197 км для гравиметрии [6][17].'],
  ['1994', '<b>13 October:</b> sent into the atmosphere to gather aerodynamic data; contact lost [1].', '<b>13 октября:</b> направлен в атмосферу для сбора аэродинамических данных; связь потеряна [1].'],
  ['2023', 'A vent that changed shape between two Magellan images points to active volcanism [12].', 'Жерло, изменившее форму между двумя снимками «Магеллана», указывает на действующий вулканизм [12].'],
  ['2031', 'Planned: ESA\'s EnVision (November) [11]; NASA\'s VERITAS no earlier than 2031 [10].', 'В планах: EnVision ЕКА (ноябрь) [11]; VERITAS NASA — не ранее 2031 года [10].']
];

/* ============ CH7 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041, entry 173 “Magellan”', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Launch 4 May 1989 on STS-30R; Venus orbit 10 August 1990, 297 × 8,463 km at 85.5°; designed to map 70% at 120–300 m; cycles to 83.7%, 96%, 98%; 1,200 Gbit returned; aerobraking in summer 1993; contact lost 13 October 1994; at least 85% volcanic flows; first deep-space probe launched by the Shuttle; bus from Voyager, Galileo, Ulysses and Mariner 9 spares.', ru:'Запуск 4 мая 1989 на STS-30R; орбита Венеры 10 августа 1990, 297 × 8463 км, 85,5°; проект — 70% поверхности при 120–300 м; циклы до 83,7%, 96%, 98%; передано 1200 Гбит; аэроторможение летом 1993; связь потеряна 13 октября 1994; не менее 85% — вулканические потоки; первый зонд, запущенный с шаттла; модуль из запчастей «Вояджера», «Галилео», «Улисса» и «Маринера-9».'}},
  {title:'NASA Science, “Magellan” mission page', url:'https://science.nasa.gov/mission/magellan/', note:{en:'Mission summary: mapping cycles and coverage, resolution 120–300 m, first spacecraft to image the entire surface of Venus.', ru:'Обзор миссии: циклы съёмки и охват, разрешение 120–300 м, первый аппарат, отснявший всю поверхность Венеры.'}},
  {title:'C. Young (ed.) (1990), The Magellan Venus Explorer\'s Guide, JPL Publication 90-24', url:'https://ntrs.nasa.gov/citations/19900019276', note:{en:'Pioneer Venus 92% at 50–140 km; Venera 15/16 about 25% at 1.2–2.4 km; 3,453 kg in the Shuttle bay; 132.5 kg hydrazine; Star 48B 2,146 kg; SAR principle and at least four looks; 25 km × 16,000 km strips, ~5 km overlap; mapping-pass altitudes.', ru:'Pioneer Venus — 92% при 50–140 км; «Венера-15/16» — около 25% при 1,2–2,4 км; 3453 кг в отсеке шаттла; 132,5 кг гидразина; Star 48B 2146 кг; принцип РСА и не менее четырёх «взглядов»; полосы 25 × 16 000 км, перекрытие ~5 км; высоты на съёмочном витке.'}},
  {title:'J. P. Ford, J. J. Plaut, C. M. Weitz, T. G. Farr, D. A. Senske, E. R. Stofan, G. Michaels, T. J. Parker (1993), Guide to Magellan Image Interpretation, JPL Publication 93-24', url:'https://ntrs.nasa.gov/citations/19940013181', note:{en:'Table 1-1: 12.6 cm, 2.385 GHz, 2.26 MHz, 26.5 µs, beam 2.1° × 2.5°, 88 m slant range, 120 m along track; orbit 289 km periapsis at 9.5° N, 85.5°, 3.259 h. Table 4-1: incidence angles by latitude. Superior conjunction cost 110 of 1,790 orbits in Cycle 1; Cycle 2 right-looking.', ru:'Табл. 1-1: 12,6 см, 2,385 ГГц, 2,26 МГц, 26,5 мкс, луч 2,1° × 2,5°, 88 м по наклонной дальности, 120 м вдоль трассы; перицентр 289 км на 9,5° с. ш., 85,5°, 3,259 ч. Табл. 4-1: углы падения по широтам. Верхнее соединение отняло 110 из 1790 витков цикла 1; в цикле 2 — взгляд вправо.'}},
  {title:'NASA Goddard, “Venus Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html', note:{en:'Mean radius 6,051.8 km; GM 0.32486 × 10⁶ km³/s²; sidereal rotation −5,832.6 h; surface 92 bar, 737 K.', ru:'Средний радиус 6051,8 км; GM 0,32486 × 10⁶ км³/с²; звёздный период вращения −5832,6 ч; у поверхности 92 бар, 737 К.'}},
  {title:'D. G. Griffith, R. S. Saunders, D. T. Lyons (1993), “The Magellan Venus Mapping Mission: Aerobraking Operations”', url:'https://ntrs.nasa.gov/citations/20210004680', note:{en:'70-day aerobraking ending 3 August 1993; apoapsis 8,467 → 541 km; final orbit 541 × 197 km; on-board propellant at least an order of magnitude too small to circularize propulsively.', ru:'70 суток аэроторможения, окончание 3 августа 1993; апоцентр 8467 → 541 км; итоговая орбита 541 × 197 км; бортового топлива как минимум на порядок меньше, чем нужно для скругления двигателями.'}},
  {title:'D. Doody (1994), “Aerobraking the Magellan Spacecraft in Venus Orbit”', url:'https://ntrs.nasa.gov/citations/20060038314', note:{en:'A spacecraft not designed for atmospheric entry flew more than 700 periapsis passes; first to use aerobraking to significantly alter its orbit at another planet; apoapsis lowered by nearly 8,000 km.', ru:'Аппарат, не рассчитанный на вход в атмосферу, совершил более 700 проходов перицентра; первое применение аэроторможения для существенного изменения орбиты у другой планеты; апоцентр понижен почти на 8000 км.'}},
  {title:'G. G. Schaber et al. (1992), “Geology and distribution of impact craters on Venus: What are they telling us?”, JGR Planets 97(E8)', url:'https://doi.org/10.1029/92JE01246', note:{en:'842 craters, 1.5–280 km, on 89% of the surface through orbit 2578; highly uniform distribution; average age about 0.5 Ga; 62% pristine, 4% embayed by lava; small craters depleted by atmospheric filtering.', ru:'842 кратера, 1,5–280 км, на 89% поверхности к витку 2578; очень равномерное распределение; средний возраст около 0,5 млрд лет; 62% свежих, 4% залиты лавой; мелкие кратеры отсеяны атмосферой.'}},
  {title:'R. J. Phillips et al. (1992), “Impact craters and Venus resurfacing history”, JGR Planets 97(E10)', url:'https://doi.org/10.1029/92JE01696', note:{en:'Complete spatial randomness of crater locations cannot be rejected; catastrophic-resurfacing age ~500 Ma; equilibrium-resurfacing end member.', ru:'Гипотезу полной пространственной случайности кратеров отвергнуть нельзя; возраст при катастрофическом обновлении ~500 млн лет; модель равновесного обновления как крайний случай.'}},
  {title:'The Planetary Society, “VERITAS, NASA\'s Venus mapper”', url:'https://www.planetary.org/space-missions/veritas', note:{en:'Radar mapping at 30 m per pixel, at least three times sharper than Magellan; launch no earlier than 2031; mission flagged as in danger.', ru:'Радиолокационная съёмка 30 м на пиксель, минимум втрое резче «Магеллана»; запуск не ранее 2031; миссия под угрозой.'}},
  {title:'ESA, “EnVision”', url:'https://www.esa.int/Science_Exploration/Space_Science/Envision', note:{en:'Planned launch November 2031; 11 months of aerobraking to reach the science orbit.', ru:'Запуск запланирован на ноябрь 2031; 11 месяцев аэроторможения до научной орбиты.'}},
  {title:'R. R. Herrick, S. Hensley (2023), “Surface changes observed on a Venusian volcano during the Magellan mission”, Science 379', url:'https://doi.org/10.1126/science.abm7735', note:{en:'A ~2.2 km² vent changed shape in the 8 months between two Magellan images; interpreted as ongoing volcanism.', ru:'Жерло площадью ~2,2 км² изменило форму за 8 месяцев между двумя снимками «Магеллана»; истолковано как продолжающийся вулканизм.'}},
  {title:'Royal Belgian Institute for Space Aeronomy (BIRA-IASB), “Venus atmosphere: a stable cloud layer covers the planet”', url:'https://bira-iasb.be/en/encyclopedia/venus-atmosphere-stable-cloud-layer-covers-planet', note:{en:'Clouds and hazes from 30 to 90 km; particle modes of about 0.1, 1 and 10 µm; droplets 75% sulphuric acid, 25% water.', ru:'Облака и дымки от 30 до 90 км; моды частиц около 0,1, 1 и 10 мкм; капли — 75% серной кислоты, 25% воды.'}},
  {title:'D. T. Lyons (1999), “Aerobraking at Venus and Mars: A Comparison of the Magellan and Mars Global Surveyor Aerobraking Phases”', url:'https://ntrs.nasa.gov/citations/20210002999', note:{en:'Both spacecraft aerobraked from elliptical initial orbits to nearly circular final orbits.', ru:'Оба аппарата аэроторможением перешли с эллиптических начальных орбит на почти круговые.'}},
  {title:'B. E. Wood et al. (2022), “Parker Solar Probe Imaging of the Night Side of Venus”, Geophysical Research Letters 49', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9286398/', note:{en:'WISPR imaged thermal emission from the night-side surface in July 2020 and February 2021, below 0.8 µm; consistent with earlier observations at 1 µm, cooler highlands appear fainter.', ru:'WISPR снял тепловое излучение ночной поверхности в июле 2020 и феврале 2021 года на волнах короче 0,8 мкм; в согласии с прежними наблюдениями на 1 мкм более холодные возвышенности выглядят тусклее.'}},
  {title:'J. F. Russell, G. G. Schaber (1993), “Named Venusian craters”, LPSC XXIV abstract', url:'https://ntrs.nasa.gov/citations/19940016252', note:{en:'The crater database, from about 98% coverage, expanded to 912 craters of 1.5–280 km.', ru:'База данных кратеров по охвату около 98% расширена до 912 кратеров поперечником 1,5–280 км.'}},
  {title:'JPL (1993), “JPL explains successful aerobraking experiment”, news release, 10 August 1993', url:'https://www.jpl.nasa.gov/news/jpl-explains-successful-aerobraking-experiment/', note:{en:'Periapsis lowered to about 140 km, skimming the upper atmosphere; orbit changed from 3 h 15 min to a nearly circular 94-minute orbit.', ru:'Перицентр опущен примерно до 140 км, в верхние слои атмосферы; орбита изменилась с 3 ч 15 мин на почти круговую с периодом 94 минуты.'}},
  {title:'S. R. Kane et al. (2019), “Venus as a Laboratory for Exoplanetary Science”, JGR Planets 124 (arXiv:1908.02783)', url:'https://arxiv.org/abs/1908.02783', note:{en:'Only ~1,000 impact craters are preserved, giving an average surface age of ~750 Ma (citing Schaber et al. 1992; McKinnon et al. 1997).', ru:'Сохранилось лишь ~1000 ударных кратеров, что даёт средний возраст поверхности ~750 млн лет (по Schaber et al. 1992; McKinnon et al. 1997).'}},
  {title:'ESA (2007), “Venus surface as seen by the VMC”', url:'https://www.esa.int/ESA_Multimedia/Images/2007/11/Venus_surface_as_seen_by_the_VMC', note:{en:'Venus Express camera images of the surface in the 1 µm window; atmospheric blurring limits spatial resolution to about 50 km.', ru:'Снимки поверхности камерой «Венеры-экспресс» в окне 1 мкм; размытие атмосферой ограничивает разрешение примерно 50 км.'}}
];

/* Screen readers announce the formatted value shown next to each slider. */
function valueTexts(){ ['gLat','mLat','mP','mW','kF','aDv','aM'].forEach(function(id){ document.getElementById(id).setAttribute('aria-valuetext', document.getElementById(id + 'Val').textContent); }); }
document.addEventListener('input', valueTexts); document.addEventListener('click', valueTexts);

/* ============ RENDER ALL ============ */
function renderAll(){
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderR(); renderG(); renderM(); renderK(); renderA();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  valueTexts(); onScroll();
}
applyLang('en');
window.__veil = {incidence:incidence, altitude:altitude, geometry:geometry, period:period, spacing:spacing, sizeParam:sizeParam,
  aerobrake:aerobrake, dvPropulsive:dvPropulsive, propellant:propellant, craters:craters, countBand:countBand, bandSd:bandSd, dvFromProp:dvFromProp, GM_V:GM_V,
  N_CRATERS:N_CRATERS, R_V:R_V, T_ROT:T_ROT, BW:BW, LAMBDA:LAMBDA, D_ANT:D_ANT, ALT_P:ALT_P, ALT_A:ALT_A, RP_AB:RP_AB, RA1:RA1};
