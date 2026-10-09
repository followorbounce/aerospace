/* ============ CONSTANTS ============ */
var C_M = 299792458, GM = 3.986004418e14, PHI0 = -6.9693e-10, RE_EQ = 6378.137;   // Ashby [1]
function clockRate(aKm){ var a = aKm*1000; return {net:-PHI0 - 1.5*GM/(a*C_M*C_M), grav:-PHI0 - GM/(a*C_M*C_M), vel:-0.5*GM/(a*C_M*C_M)}; }

/* ============ CH2 — FIX ============ */
var SATS = [[-17000, 6000], [17000, 6000], [1500, 19500]];                         // km, receiver at (0,0)
function pseudoranges(bUs){ return SATS.map(function(s){ return Math.hypot(s[0], s[1])*1000 + C_M*bUs*1e-6; }); }   // m
function solve(rho, withClock){
  var x = 300, y = -200, b = 0;                                                     // start a little off (m)
  for(var it = 0; it < 30; it++){
    var H = [], r = [];
    SATS.forEach(function(s, i){ var dx = x - s[0]*1000, dy = y - s[1]*1000, d = Math.hypot(dx, dy); H.push(withClock ? [dx/d, dy/d, 1] : [dx/d, dy/d]); r.push(rho[i] - (d + (withClock ? b : 0))); });
    var n = H[0].length, A = [], g = [];
    for(var i = 0; i < n; i++){ A.push([]); g.push(0); for(var j = 0; j < n; j++){ var sum = 0; for(var k = 0; k < H.length; k++) sum += H[k][i]*H[k][j]; A[i].push(sum); } for(var k2 = 0; k2 < H.length; k2++) g[i] += H[k2][i]*r[k2]; }
    var dxv = solveLin(A, g); x += dxv[0]; y += dxv[1]; if(withClock) b += dxv[2];
  }
  return {x:x, y:y, b:b};
}
function solveLin(A, g){ var n = g.length, M = A.map(function(r, i){ return r.concat([g[i]]); });
  for(var c = 0; c < n; c++){ var p = c; for(var r = c + 1; r < n; r++) if(Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; var t = M[c]; M[c] = M[p]; M[p] = t;
    for(var r2 = 0; r2 < n; r2++){ if(r2 === c) continue; var f = M[r2][c]/M[c][c]; for(var k = c; k <= n; k++) M[r2][k] -= f*M[c][k]; } }
  return M.map(function(r, i){ return r[n]/r[i]; }); }
var fB = document.getElementById('fB'), fixMode = 0;
function renderFix(){
  var bUs = +fB.value, rho = pseudoranges(bUs), S = solve(rho, fixMode === 1), err = Math.hypot(S.x, S.y);
  document.getElementById('fBVal').textContent = (bUs >= 0 ? '+' : '') + fmt(bUs, 2) + T(' µs',' мкс') + ' = ' + fmtInt(C_M*bUs*1e-6) + T(' m',' м');
  var svg = document.getElementById('fixSvg'); svg.innerHTML = '';
  var cx = 240, cy = 180, sc = 0.25;                                                // 1 px = 4 m (window ≈ 1.9 km)
  function P(xm, ym){ return [cx + xm*sc, cy - ym*sc]; }
  ns('rect', {x:10, y:20, width:460, height:310, fill:'none', stroke:'#e4e4de'}, svg);
  var cols = ['#2f5aa1', '#a8741a', '#0b0b0c'];
  SATS.forEach(function(s, i){
    var sx = s[0]*1000, sy = s[1]*1000, R = rho[i], th0 = Math.atan2(-sy, -sx), d = '';
    for(var k = -60; k <= 60; k++){ var th = th0 + k*1.2e-6*(18000e3/R)*80/60; var p = P(sx + R*Math.cos(th), sy + R*Math.sin(th)); d += (d ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:cols[i], 'stroke-width':1.5}, svg);
    var ux = sx/Math.hypot(sx, sy), uy = sy/Math.hypot(sx, sy), dir = P(ux*560, uy*560);
    txt(svg, Math.max(40, Math.min(440, dir[0])), Math.max(34, Math.min(320, dir[1])), T('to sat ','к спутнику ') + (i + 1), 'svg-small', 'middle');
  });
  var t = P(0, 0); ns('path', {d:'M' + (t[0] - 6) + ' ' + t[1] + 'L' + (t[0] + 6) + ' ' + t[1] + 'M' + t[0] + ' ' + (t[1] - 6) + 'L' + t[0] + ' ' + (t[1] + 6), stroke:'#0b0b0c', 'stroke-width':2}, svg);
  var q = P(S.x, S.y); ns('circle', {cx:q[0], cy:q[1], r:5, fill:'#b5452a'}, svg);
  txt(svg, 16, 14, T('close-up around the receiver: 1 km = 250 px · + true position · ● solution','крупный план у приёмника: 1 км = 250 пикс. · + истинное место · ● решение'), 'svg-small');
  cells(document.getElementById('fixReadout'), [
    [T('RANGE ERROR (EVERY SATELLITE)','ОШИБКА ДАЛЬНОСТИ (ВСЕ СПУТНИКИ)'), fmtInt(C_M*bUs*1e-6) + T(' m',' м')],
    [T('POSITION ERROR','ОШИБКА ПОЛОЖЕНИЯ'), err < 0.01 ? '0' + T(' m',' м') : fmtInt(err) + T(' m',' м')],
    [T('RECOVERED CLOCK ERROR','НАЙДЕННАЯ ОШИБКА ЧАСОВ'), fixMode === 1 ? fmt(S.b/C_M*1e6, 3) + T(' µs',' мкс') : '—'],
    [T('UNKNOWNS / SATELLITES','НЕИЗВЕСТНЫХ / СПУТНИКОВ'), fixMode === 1 ? '3 / 3' : '2 / 3']
  ]);
  hud1.textContent = fmt(bUs, 2) + T(' µs',' мкс'); hud2.textContent = fmtInt(err) + T(' m',' м');
  document.getElementById('fixStatus').innerHTML = fixMode === 1
    ? T('<b>Fixed.</b> Treating the clock as an unknown removes its error completely — the receiver now knows the time almost as well as the satellites.','<b>Решено.</b> Если считать часы неизвестным, их ошибка полностью исчезает — теперь приёмник знает время почти так же точно, как спутники.')
    : T('The three circles miss each other; the best compromise is ','Три окружности не сходятся; лучший компромисс отстоит на ') + fmtInt(err) + T(' m from the truth.',' м от истины.');
}
fB.addEventListener('input', renderFix);
Array.prototype.forEach.call(document.querySelectorAll('#fMode .btn'), function(btn){ btn.addEventListener('click', function(){ fixMode = +this.getAttribute('data-m'); pressGroup(this.parentNode, this); renderFix(); }); });

/* ============ CH3 — RELATIVITY ============ */
var rA = document.getElementById('rA');
function renderRel(){
  var alt = Math.pow(10, +rA.value), a = alt + RE_EQ, R = clockRate(a), day = 86400e6;
  document.getElementById('rAVal').textContent = fmtInt(alt) + T(' km',' км');
  var svg = document.getElementById('relSvg'); svg.innerHTML = '';
  var L = 56, Rr = 465, Tp = 22, B = 250, ymin = -30, ymax = 60;
  function X(lg){ return L + (lg - 2.3)/2.3*(Rr - L); }
  function Y(us){ return B - (us - ymin)/(ymax - ymin)*(B - Tp); }
  [-30,-15,0,15,30,45,60].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:Rr, y2:Y(v), stroke: v === 0 ? '#c9c9c1' : '#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, v, 'svg-small', 'end'); });
  [200,1000,5000,20000].forEach(function(h){ txt(svg, X(Math.log10(h)), B + 14, fmtInt(h), 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('altitude, km (log)','высота, км (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('clock gain per day vs. the ground, µs','уход часов за сутки относительно Земли, мкс'), 'svg-small');
  [['net','#0b0b0c',2],['grav','#2f5aa1',1.2],['vel','#b5452a',1.2]].forEach(function(k){ var d = ''; for(var lg = 2.3; lg <= 4.6001; lg += 0.01){ var v = clockRate(Math.pow(10, lg) + RE_EQ)[k[0]]*day; d += (d ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(Math.max(ymin, Math.min(ymax, v))).toFixed(1); } ns('path', {d:d, fill:'none', stroke:k[1], 'stroke-width':k[2]}, svg); });
  txt(svg, X(3.9), Y(clockRate(Math.pow(10, 3.9) + RE_EQ).grav*day) - 8, T('gravity: faster','тяготение: быстрее'), 'svg-small', 'end');
  txt(svg, X(4.55), Y(clockRate(Math.pow(10, 4.55) + RE_EQ).vel*day) + 14, T('speed: slower','скорость: медленнее'), 'svg-small', 'end');
  [[20184, 'GPS'], [420, T('ISS','МКС')], [35786, 'GEO']].forEach(function(m){ ns('line', {x1:X(Math.log10(m[0])), y1:Tp, x2:X(Math.log10(m[0])), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(Math.log10(m[0])) + 3, Tp + 10, m[1], 'svg-small'); });
  ns('circle', {cx:X(+rA.value), cy:Y(R.net*day), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('relReadout'), [
    [T('NET, PER DAY','ИТОГО ЗА СУТКИ'), (R.net >= 0 ? '+' : '') + fmt(R.net*day, 2) + T(' µs',' мкс')],
    [T('FRACTIONAL RATE','ОТНОСИТЕЛЬНЫЙ ХОД'), (R.net*1e10).toFixed(4).replace('.', T('.', ',')) + ' × 10⁻¹⁰'],
    [T('RANGE DRIFT IF UNCORRECTED','УХОД ДАЛЬНОСТИ БЕЗ ПОПРАВКИ'), fmt(Math.abs(R.net)*86400*C_M/1000, 2) + T(' km/day',' км/сут')],
    [T('FACTORY CLOCK SETTING','ЗАВОДСКАЯ НАСТРОЙКА ЧАСОВ'), (10.23*(1 - R.net)).toFixed(11) + T(' MHz',' МГц')]
  ]);
  document.getElementById('relStatus').innerHTML = Math.abs(alt - 20184) < 300
    ? T('GPS: Ashby gives 4.4647 × 10⁻¹⁰ and a factory setting of 10.229 999 995 43 MHz [1].','GPS: у Эшби 4,4647 × 10⁻¹⁰ и заводская настройка 10,229 999 995 43 МГц [1].')
    : R.net < 0 ? T('Low orbit: speed wins, and the orbiting clock runs slow.','Низкая орбита: побеждает скорость, и часы на орбите отстают.') : T('High orbit: gravity wins, and the orbiting clock runs fast.','Высокая орбита: побеждает тяготение, и часы на орбите спешат.');
}
rA.addEventListener('input', renderRel);

/* ============ CH4 — DOP ============ */
var dS = document.getElementById('dS'), dU = document.getElementById('dU');
function dop(spreadDeg){
  var th = [0,1,2,3].map(function(i){ return (90 - spreadDeg/2 + spreadDeg*i/3)*Math.PI/180; });
  var H = th.map(function(t){ return [-Math.cos(t), -Math.sin(t), 1]; }), A = [[0,0,0],[0,0,0],[0,0,0]];
  H.forEach(function(r){ for(var i = 0; i < 3; i++) for(var j = 0; j < 3; j++) A[i][j] += r[i]*r[j]; });
  var inv = [0,1,2].map(function(c){ var e = [0,0,0]; e[c] = 1; return solveLin(A, e); });     // columns of A⁻¹
  return {th:th, h:Math.sqrt(inv[0][0] + inv[1][1]), t:Math.sqrt(inv[2][2]), g:Math.sqrt(inv[0][0] + inv[1][1] + inv[2][2])};
}
function renderDop(){
  var s = +dS.value, u = +dU.value, D = dop(s);
  document.getElementById('dSVal').textContent = fmtInt(s) + '°';
  document.getElementById('dUVal').textContent = fmt(u, 2) + T(' m',' м');
  var svg = document.getElementById('dopSvg'); svg.innerHTML = '';
  var cx = 190, cy = 255, R = 165;
  ns('path', {d:'M' + (cx - R) + ' ' + cy + ' A ' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy, fill:'#f6f6f2', stroke:'#c9c9c1'}, svg);
  ns('line', {x1:cx - R - 10, y1:cy, x2:cx + R + 10, y2:cy, stroke:'#0b0b0c'}, svg);
  D.th.forEach(function(t, i){ var x = cx + R*0.9*Math.cos(t), y = cy - R*0.9*Math.sin(t); ns('line', {x1:cx, y1:cy, x2:x, y2:y, stroke:'#c9c9c1', 'stroke-dasharray':'3 3'}, svg); ns('rect', {x:x - 5, y:y - 5, width:10, height:10, fill:'#2f5aa1'}, svg); });
  ns('circle', {cx:cx, cy:cy, r:5, fill:'#b5452a'}, svg);
  txt(svg, cx, cy + 18, T('receiver','приёмник'), 'svg-small', 'middle');
  // error ellipse-ish bar
  var bx = 390, by0 = 250, err = D.h*u, h = Math.min(220, err/20*220);
  ns('rect', {x:bx, y:by0 - h, width:30, height:h, fill: D.h < 2 ? '#0b0b0c' : '#b5452a'}, svg);
  txt(svg, bx + 15, by0 + 14, T('horizontal error','гориз. ошибка'), 'svg-small', 'middle');
  txt(svg, bx + 15, by0 - h - 6, fmt(err, 1) + T(' m',' м'), 'svg-small', 'middle');
  cells(document.getElementById('dopReadout'), [
    [T('HORIZONTAL DOP','ГОРИЗОНТАЛЬНЫЙ DOP'), fmt(D.h, 2)],
    [T('TIME DOP','DOP ВРЕМЕНИ'), fmt(D.t, 2)],
    [T('POSITION ERROR ≈ DOP × URE','ОШИБКА ≈ DOP × URE'), fmt(D.h*u, 1) + T(' m',' м')],
    [T('GEOMETRIC DOP','ГЕОМЕТРИЧЕСКИЙ DOP'), fmt(D.g, 2)]
  ]);
  document.getElementById('dopStatus').innerHTML = s < 50
    ? T('<b>Bunched up:</b> the range lines cross at shallow angles, and a small range error becomes a large position error — like a street canyon.','<b>Скучены:</b> линии дальности пересекаются под пологими углами, и малая ошибка дальности становится большой ошибкой положения — как в уличном «каньоне».')
    : T('Well spread: the lines cross cleanly and the error stays close to the range error itself.','Хорошо разнесены: линии пересекаются чётко, и ошибка остаётся близкой к самой ошибке дальности.');
}
[dS, dU].forEach(function(el){ el.addEventListener('input', renderDop); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1978', 'The first NAVSTAR GPS satellite is launched [2].', 'Запуск первого спутника NAVSTAR GPS [2].'],
  ['1993', 'The 24-satellite GPS system becomes fully operational [2].', 'Система GPS из 24 спутников полностью вводится в строй [2].'],
  ['2000', '<b>1–2 May:</b> Selective Availability switched off; civil accuracy 10–20 m or better [4].', '<b>1–2 мая:</b> режим Selective Availability отключён; гражданская точность 10–20 м и лучше [4].'],
  ['2003', 'Ashby\'s review sets out the relativistic corrections built into GPS [1].', 'Обзор Эшби излагает релятивистские поправки, встроенные в GPS [1].'],
  ['2021', '<b>20 April:</b> global average user range error ≤ 0.643 m, 95 % of the time [3].', '<b>20 апреля:</b> среднемировая ошибка дальности ≤ 0,643 м с вероятностью 95 % [3].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'N. Ashby (2003), “Relativity in the Global Positioning System”, Living Reviews in Relativity 6, 1', url:'https://doi.org/10.12942/lrr-2003-1', note:{en:'24 satellites in six planes at 55°; L1/L2 at 154 and 120 × 10.23 MHz; net clock rate −4.4647 × 10⁻¹⁰ (Φ₀/c² = −6.9693 × 10⁻¹⁰, 3GM/2ac² = 2.5046 × 10⁻¹⁰); factory frequency 10.229 999 995 43 MHz; effects cancel at a ≈ 9,545 km; GLONASS and Galileo.', ru:'24 спутника в шести плоскостях под 55°; L1/L2 — 154 и 120 × 10,23 МГц; итоговый ход часов −4,4647 × 10⁻¹⁰ (Φ₀/c² = −6,9693 × 10⁻¹⁰, 3GM/2ac² = 2,5046 × 10⁻¹⁰); заводская частота 10,229 999 995 43 МГц; эффекты компенсируются при a ≈ 9545 км; ГЛОНАСС и Galileo.'}},
  {title:'NASA, “Global Positioning System History”', url:'https://www.nasa.gov/general/global-positioning-system-history/', note:{en:'First NAVSTAR satellite launched in 1978; the 24-satellite system fully operational in 1993.', ru:'Первый спутник NAVSTAR запущен в 1978; система из 24 спутников полностью работает с 1993.'}},
  {title:'GPS.gov, “GPS Accuracy”', url:'https://archive.gps.gov/systems/gps/performance/accuracy/', note:{en:'Signal-in-space URE ≤ 2.0 m (95 %); 0.643 m on 20 April 2021; smartphones typically within 4.9 m under open sky.', ru:'Ошибка дальности сигнала ≤ 2,0 м (95 %); 0,643 м 20 апреля 2021; смартфоны обычно в пределах 4,9 м под открытым небом.'}},
  {title:'GPS.gov, “Frequently Asked Questions About Selective Availability”', url:'https://archive.gps.gov/systems/gps/modernization/sa/faq/', note:{en:'SA ended a few minutes past midnight EDT after the end of 1 May 2000, across the whole constellation; civil accuracy 10–20 m or better.', ru:'SA отключён через несколько минут после полуночи (EDT) в конце 1 мая 2000 на всей группировке; гражданская точность 10–20 м и лучше.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderFix();
  renderRel();
  renderDop();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__nav = {clockRate:clockRate, solve:solve, pseudoranges:pseudoranges, dop:dop, C_M:C_M};
