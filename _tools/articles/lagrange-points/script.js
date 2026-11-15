/* ============ EQUILIBRIUM — the circular restricted three-body problem ============
   Units: distance = separation R of the two bodies, time = 1/n (one revolution = 2π), masses 1−μ and μ.
   Rotating frame, origin at the barycentre: M1 at (−μ, 0), M2 at (1−μ, 0). */
var G0 = 9.80665;                                              // m/s², standard gravity
/* Masses in 10²⁴ kg, separations in km, periods in days: NASA NSSDC planetary fact sheets */
var MASS = {sun:1988400, earth:5.9722, moon:0.07346, jupiter:1898.13, pluto:0.01303, charon:0.001586};
var SYS = {
  se: {ga:'Солнца', gb:'Земли', en:'Sun–Earth', ru:'Солнце — Земля', a:['Sun','Солнце'], b:['Earth','Земля'], mu:MASS.earth/(MASS.sun + MASS.earth), R:149.598e6, T:365.256},
  seb:{ga:'Солнца', gb:'пары Земля + Луна', en:'Sun–(Earth+Moon)', ru:'Солнце — (Земля + Луна)', a:['Sun','Солнце'], b:['Earth+Moon','Земля + Луна'], mu:(MASS.earth + MASS.moon)/(MASS.sun + MASS.earth + MASS.moon), R:149.598e6, T:365.256},
  sj: {ga:'Солнца', gb:'Юпитера', en:'Sun–Jupiter', ru:'Солнце — Юпитер', a:['Sun','Солнце'], b:['Jupiter','Юпитер'], mu:MASS.jupiter/(MASS.sun + MASS.jupiter), R:778.479e6, T:4332.589},
  em: {ga:'Земли', gb:'Луны', en:'Earth–Moon', ru:'Земля — Луна', a:['Earth','Земля'], b:['Moon','Луна'], mu:MASS.moon/(MASS.earth + MASS.moon), R:384400, T:27.3217},
  pc: {ga:'Плутона', gb:'Харона', en:'Pluto–Charon', ru:'Плутон — Харон', a:['Pluto','Плутон'], b:['Charon','Харон'], mu:MASS.charon/(MASS.pluto + MASS.charon), R:19596, T:6.3872}
};
var SYNODIC_MONTH = 29.53, R_SUN = 695700, R_EARTH = 6378.137, MOON_PERIGEE = 363300, MOON_APOGEE = 405500;   // km, NSSDC fact sheets
/* Fraction of the Sun's disc covered by Earth as seen from the exact Sun–Earth L2 */
function l2Cover(){ var S = SYS.se, p = lpoints(S.mu), aE = R_EARTH/(p.g2*S.R), aS = R_SUN/((p.L2 + S.mu)*S.R); return (aE/aS)*(aE/aS); }

/* Effective potential Ω = ½(x²+y²) + (1−μ)/r1 + μ/r2 and Jacobi constant C = 2Ω − v² */
function omega(x, y, mu){ var r1 = Math.hypot(x + mu, y), r2 = Math.hypot(x - 1 + mu, y); return 0.5*(x*x + y*y) + (1 - mu)/r1 + mu/r2; }
function jacobi(x, y, mu, v){ return 2*omega(x, y, mu) - (v || 0)*(v || 0); }
/* ∂Ω/∂x on the x axis: zero at L1, L2, L3 */
function dOmegaX(x, mu){ var r1 = Math.abs(x + mu), r2 = Math.abs(x - 1 + mu); return x - (1 - mu)*(x + mu)/(r1*r1*r1) - mu*(x - 1 + mu)/(r2*r2*r2); }
function gradOmega(x, y, mu){
  var r1 = Math.hypot(x + mu, y), r2 = Math.hypot(x - 1 + mu, y), a = (1 - mu)/(r1*r1*r1), b = mu/(r2*r2*r2);
  return [x - a*(x + mu) - b*(x - 1 + mu), y - a*y - b*y];
}
function bisect(f, a, b){
  var fa = f(a);
  for(var i = 0; i < 200; i++){ var m = 0.5*(a + b), fm = f(m); if((fm > 0) === (fa > 0)){ a = m; fa = fm; } else b = m; }
  return 0.5*(a + b);
}
/* Exact collinear points by bisection of the force balance (x from the barycentre) */
function lpoints(mu){
  var e = 1e-13, f = function(x){ return dOmegaX(x, mu); };
  var L1 = bisect(f, -mu + e, 1 - mu - e), L2 = bisect(f, 1 - mu + e, 3), L3 = bisect(f, -3, -mu - e);
  return {L1:L1, L2:L2, L3:L3, g1:1 - mu - L1, g2:L2 - (1 - mu), d1:-L3 - mu, dB:-L3, L4:[0.5 - mu, Math.sqrt(3)/2], L5:[0.5 - mu, -Math.sqrt(3)/2]};
}
/* The same roots from the quintic γ⁵ ∓ (3−μ)γ⁴ + (3−2μ)γ³ − μγ² ± 2μγ − μ = 0 (upper sign L1, lower L2), Newton from the Hill radius */
function quintic(mu, which){
  var s = which === 1 ? 1 : -1, g = Math.cbrt(mu/3);
  for(var i = 0; i < 100; i++){
    var f = Math.pow(g, 5) - s*(3 - mu)*Math.pow(g, 4) + (3 - 2*mu)*g*g*g - mu*g*g + s*2*mu*g - mu;
    var d = 5*Math.pow(g, 4) - s*4*(3 - mu)*g*g*g + 3*(3 - 2*mu)*g*g - 2*mu*g + s*2*mu, st = f/d;
    g -= st; if(Math.abs(st) < 1e-16) break;
  }
  return g;
}
function hill(mu){ return Math.cbrt(mu/3); }                   // leading order for both L1 and L2
function series3(mu, which){ var r = hill(mu); return which === 1 ? r*(1 - r/3 - r*r/9) : r*(1 + r/3 - r*r/9); }
function l3lead(mu){ return {dB:1 + 5*mu/12, d1:1 - 7*mu/12}; }   // from the barycentre, from M1

/* Linear stability of a collinear point at x: λ⁴ + (2 − c)λ² + (1 + 2c)(1 − c) = 0, c = (1−μ)/r1³ + μ/r2³ */
function collinEig(x, mu){
  var r1 = Math.abs(x + mu), r2 = Math.abs(x - 1 + mu), c = (1 - mu)/(r1*r1*r1) + mu/(r2*r2*r2);
  var b = 2 - c, q = (1 + 2*c)*(1 - c), disc = Math.sqrt(b*b - 4*q);
  return {c:c, lam:Math.sqrt((-b + disc)/2), wp:Math.sqrt((b + disc)/2), wv:Math.sqrt(c)};
}
/* Linear stability of L4/L5: λ⁴ + λ² + (27/4)μ(1−μ) = 0 */
var MU_CRIT = (1 - Math.sqrt(23/27))/2;
function triEig(mu){
  var d = 1 - 27*mu*(1 - mu);
  if(d >= 0) return {stable:true, ws:Math.sqrt((1 + Math.sqrt(d))/2), wl:Math.sqrt((1 - Math.sqrt(d))/2), growth:0};
  var re = -0.5, im = Math.sqrt(-d)/2, mod = Math.hypot(re, im);
  return {stable:false, growth:Math.sqrt((mod + re)/2), w:Math.sqrt((mod - re)/2)};
}
/* Linearised motion near L4: ξ″ − 2η′ = ¾ξ + kη, η″ + 2ξ′ = kξ + 9/4 η, k = (3√3/4)(1 − 2μ). RK4. */
function triPath(mu, tEnd, dt, noCap){
  var k = 0.75*Math.sqrt(3)*(1 - 2*mu), s = [1, 0, 0, 0], out = [[1, 0]], n = Math.round(tEnd/dt), unstable = !triEig(mu).stable;
  function f(u){ return [u[2], u[3], 2*u[3] + 0.75*u[0] + k*u[1], -2*u[2] + k*u[0] + 2.25*u[1]]; }
  function ax(u, d, h){ return [u[0] + d[0]*h, u[1] + d[1]*h, u[2] + d[2]*h, u[3] + d[3]*h]; }
  for(var i = 0; i < n; i++){
    var k1 = f(s), k2 = f(ax(s, k1, dt/2)), k3 = f(ax(s, k2, dt/2)), k4 = f(ax(s, k3, dt));
    for(var j = 0; j < 4; j++) s[j] += dt/6*(k1[j] + 2*k2[j] + 2*k3[j] + k4[j]);
    out.push([s[0], s[1]]);
    if(unstable && !noCap && Math.hypot(s[0], s[1]) > 400) break;   // a growing spiral is cut off; a stable path is always drawn in full
  }
  return out;
}
/* Time scales in days for a system with period T (days) */
function efoldDays(lam, T){ return T/(2*Math.PI*lam); }
function periodDays(w, T){ return T/w; }
/* Tsiolkovsky: propellant used for Δv (m/s) by a spacecraft of mass m (kg) at specific impulse isp (s) */
function propellant(m, dv, isp){ return m*(1 - Math.exp(-dv/(G0*isp))); }
function daysBetween(a, b){ return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2]))/86400000); }

/* Marching squares: segments of the level set v = level on a regular grid (row-major vals, nx × ny nodes) */
function contour(vals, nx, ny, level, X, Y){
  var d = '';
  function P(i, j, i2, j2){
    var a = vals[j*nx + i] - level, b = vals[j2*nx + i2] - level, t = a/(a - b);
    return (X(i + (i2 - i)*t)).toFixed(1) + ',' + (Y(j + (j2 - j)*t)).toFixed(1);
  }
  for(var j = 0; j < ny - 1; j++) for(var i = 0; i < nx - 1; i++){
    var a = vals[j*nx + i] > level, b = vals[j*nx + i + 1] > level, c = vals[(j + 1)*nx + i + 1] > level, e = vals[(j + 1)*nx + i] > level;
    var code = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (e ? 8 : 0);
    if(code === 0 || code === 15) continue;
    var pts = [];
    if(a !== b) pts.push(P(i, j, i + 1, j));
    if(b !== c) pts.push(P(i + 1, j, i + 1, j + 1));
    if(c !== e) pts.push(P(i + 1, j + 1, i, j + 1));
    if(e !== a) pts.push(P(i, j + 1, i, j));
    for(var k = 0; k + 1 < pts.length; k += 2) d += 'M' + pts[k] + 'L' + pts[k + 1];
  }
  return d;
}
function sci(x, dgt){
  if(x === 0) return '0';
  if(Math.abs(x) >= 1 && Math.abs(x) < 10) return fmt(x, dgt === undefined ? 2 : dgt);
  var ex = Math.floor(Math.log10(Math.abs(x))), m = x/Math.pow(10, ex);
  if(+m.toFixed(dgt === undefined ? 2 : dgt) >= 10){ m /= 10; ex += 1; }
  return fmt(m, dgt === undefined ? 2 : dgt) + ' × 10' + String(ex).replace('-', '⁻').replace(/\d/g, function(c){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
}
function fmtMu(mu){ return mu >= 0.001 ? fmt(mu, mu >= 0.1 ? 4 : 5) : sci(mu, 3); }
function km(x){ return (Math.abs(x) >= 1e6 ? fmt(x/1e6, 4) + T(' million km',' млн км') : fmtInt(x) + T(' km',' км')); }
function setVal(id, s){ document.getElementById(id).textContent = s; }
function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
var NB = '\u00a0';

/* ============ CH2 — ZERO-VELOCITY MAP ============ */
var pMu = document.getElementById('pMu'), pC = document.getElementById('pC'), pMuExact = SYS.em.mu;
function pMuVal(){ return pMuExact !== null ? pMuExact : Math.min(0.5, Math.pow(10, +pMu.value)); }
function critC(mu){ var p = lpoints(mu); return {p:p, C1:jacobi(p.L1, 0, mu), C2:jacobi(p.L2, 0, mu), C3:jacobi(p.L3, 0, mu), C4:3 - mu*(1 - mu)}; }
function pRange(c){ var hi = c.C1 + 0.35*(c.C1 - c.C4); return {hi:hi, lo:c.C4}; }
function pCval(c){ var r = pRange(c); return r.hi - (r.hi - r.lo)*(+pC.value)/1000; }
function regime(C, c){ return C > c.C1 ? 0 : C > c.C2 ? 1 : C > c.C3 ? 2 : C > c.C4 ? 3 : 4; }   // for equal masses C2 = C3: regime 2 never occurs
function renderMap(){
  var mu = pMuVal(), c = critC(mu), C = pCval(c), p = c.p;
  setVal('pMuVal', fmtMu(mu)); pMu.setAttribute('aria-valuetext', 'μ = ' + fmtMu(mu));
  setVal('pCVal', fmt(C, 4)); pC.setAttribute('aria-valuetext', 'C = ' + fmt(C, 4));
  var svg = document.getElementById('pSvg'); svg.innerHTML = '';
  var W = 480, H = 375, x0 = -1.6, y0 = -1.25, sc = 150, nx = 129, ny = 101, dx = 3.2/(nx - 1), dy = 2.5/(ny - 1);
  function X(i){ return i*dx*sc; } function Y(j){ return H - j*dy*sc; }
  function PX(x){ return (x - x0)*sc; } function PY(y){ return H - (y - y0)*sc; }
  var vals = new Float64Array(nx*ny);
  for(var j = 0; j < ny; j++) for(var i = 0; i < nx; i++) vals[j*nx + i] = 2*omega(x0 + i*dx, y0 + j*dy, mu);
  /* forbidden region (2Ω < C): run-length rectangles, then a crisp boundary from marching squares */
  var d = '';
  for(j = 0; j < ny; j++){
    var run = -1;
    for(i = 0; i <= nx; i++){
      var inside = i < nx && vals[j*nx + i] < C;
      if(inside && run < 0) run = i;
      if(!inside && run >= 0){ d += 'M' + (X(run) - dx*sc/2).toFixed(1) + ',' + (Y(j) - dy*sc/2).toFixed(1) + 'h' + ((i - run)*dx*sc).toFixed(1) + 'v' + (dy*sc).toFixed(1) + 'h' + (-(i - run)*dx*sc).toFixed(1) + 'z'; run = -1; }
    }
  }
  if(d) ns('path', {d:d, fill:'#d9d9d2'}, svg);
  [c.C1, c.C2, c.C3].forEach(function(lv){ if(Math.abs(lv - C) > 1e-9) ns('path', {d:contour(vals, nx, ny, lv, X, Y), fill:'none', stroke:'#8f8f88', 'stroke-width':0.8, 'stroke-dasharray':'3 3'}, svg); });
  var cd = contour(vals, nx, ny, C, X, Y);
  if(cd) ns('path', {d:cd, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.6}, svg);
  ns('path', {d:'M' + PX(-mu) + ',' + PY(0) + 'L' + PX(p.L4[0]) + ',' + PY(p.L4[1]) + 'L' + PX(1 - mu) + ',' + PY(0) + 'L' + PX(p.L5[0]) + ',' + PY(p.L5[1]) + 'Z', fill:'none', stroke:'#7a7a74', 'stroke-width':0.8, 'stroke-dasharray':'2 3'}, svg);
  ns('circle', {cx:PX(-mu), cy:PY(0), r:7, fill:'#a8741a'}, svg);
  ns('circle', {cx:PX(1 - mu), cy:PY(0), r:4.5, fill:'#2f5aa1'}, svg);
  var pts = [['L1', p.L1, 0, 0, -9], ['L2', p.L2, 0, 0, -9], ['L3', p.L3, 0, 0, -9], ['L4', p.L4[0], p.L4[1], 9, 4], ['L5', p.L5[0], p.L5[1], 9, 4]];
  var near = p.g2 < 0.08;                                        // L1 and L2 too close to M2 to label apart
  pts.forEach(function(q){
    ns('circle', {cx:PX(q[1]), cy:PY(q[2]), r:3, fill:'#b5452a'}, svg);
    if(near && (q[0] === 'L1' || q[0] === 'L2')) return;
    var t = txt(svg, PX(q[1]) + q[3], PY(q[2]) + q[4], q[0], 'svg-label svg-halo', q[3] ? 'start' : 'middle');
    t.setAttribute('font-weight', '600');
  });
  if(near) txt(svg, PX(1 - mu), PY(0) - 10, 'L1 · L2', 'svg-label svg-halo', 'middle');
  txt(svg, PX(-mu), PY(0) + 20, 'M₁', 'svg-small svg-halo', 'middle');
  txt(svg, PX(1 - mu), PY(0) + 18, 'M₂', 'svg-small svg-halo', 'middle');
  txt(svg, 8, 16, T('ROTATING FRAME · grey: forbidden at this C','ВРАЩАЮЩАЯСЯ СИСТЕМА · серое: запрещено при данном C'), 'svg-small svg-halo');
  txt(svg, 8, H - 8, T('dashed: the curves through L1, L2, L3','пунктир: кривые через L1, L2, L3'), 'svg-small svg-halo');
  var rg = regime(C, c), eqm = Math.abs(c.C2 - c.C3) < 1e-9;
  cells(document.getElementById('pReadout'), [
    [T('JACOBI CONSTANT C','ПОСТОЯННАЯ ЯКОБИ C'), fmt(C, 4)],
    [T('MASS RATIO M₁ : M₂','ОТНОШЕНИЕ МАСС M₁ : M₂'), ((1 - mu)/mu < 100 ? fmt((1 - mu)/mu, 2) : fmtInt((1 - mu)/mu)) + ' : 1'],
    ['C(L1)', fmt(c.C1, 4)], ['C(L2)', fmt(c.C2, 4)], ['C(L3)', fmt(c.C3, 4)], ['C(L4) = C(L5) = 3 − <span class="lc">μ</span>(1 − <span class="lc">μ</span>)', fmt(c.C4, 4)],
    [T('GATES OPEN','ОТКРЫТЫЕ ПРОХОДЫ'), [T('none','нет'), 'L1', 'L1, L2', 'L1, L2, L3', T('all: nothing is forbidden','все: запретных областей нет')][rg], 1]
  ]);
  document.getElementById('pStatus').innerHTML = [
    T('<b>Three separate rooms.</b> A body with this much energy stays where it starts: near M₁, near M₂, or far outside. The grey wall cannot be crossed at any speed, because crossing it would need v² &lt; 0.','<b>Три отдельные области.</b> Тело с такой энергией остаётся там, где начало движение: у M₁, у M₂ или далеко снаружи. Серую стену нельзя пересечь ни с какой скоростью: для этого потребовалось бы v² &lt; 0.'),
    T('<b>The neck at L1 is open.</b> A body can now pass between M₁ and M₂, but still cannot leave the pair: this is the route of a transfer from one body to the other.','<b>Горловина у L1 открыта.</b> Теперь тело может переходить от M₁ к M₂ и обратно, но покинуть пару не может: это путь перелёта от одного тела к другому.'),
    T('<b>L2 is open too.</b> There is now a way out past the smaller body. Capture and escape of comets and spacecraft go through these two necks.','<b>Открыта и L2.</b> Появился выход наружу мимо меньшего тела. Через эти две горловины проходят захват и уход комет и космических аппаратов.'),
    T('<b>L3 is open.</b> Only two islands around L4 and L5 are still out of reach. They are the summits of the potential: the last places a slow body can get to.','<b>Открыта L3.</b> Недоступными остались лишь два острова вокруг L4 и L5. Это вершины потенциала — последние места, куда может попасть медленное тело.'),
    T('<b>Nothing is forbidden.</b> At C below 3 − μ(1 − μ) a body can be anywhere in the plane. The map says where it <i>may</i> go, not where it will.','<b>Запретных областей нет.</b> При C меньше 3 − μ(1 − μ) тело может оказаться в любой точке плоскости. Карта показывает, где оно <i>может</i> быть, а не куда оно пойдёт.')
  ][rg] + (eqm && rg === 3 ? T(' With equal masses L2 and L3 are mirror images and open together.',' При равных массах L2 и L3 зеркально симметричны и открываются одновременно.') : '') + (near ? T(' At this mass ratio L1 and L2 sit too close to M₂ to draw apart: use the solver in Chapter 3.',' При таком отношении масс L1 и L2 слишком близки к M₂, чтобы показать их раздельно: см. прибор в главе 3.') : '');
}
pMu.addEventListener('input', function(){ pMuExact = null; pressGroup(document.getElementById('pPre'), null); renderMap(); });
pC.addEventListener('input', function(){ pressGroup(document.getElementById('pGate'), null); renderMap(); });
each('#pPre .btn', function(b){
  b.addEventListener('click', function(){
    pMuExact = b.dataset.k === 'eq' ? 0.5 : SYS[b.dataset.k].mu; pMu.value = Math.log10(pMuExact);
    pressGroup(document.getElementById('pPre'), b); renderMap();
  });
});
each('#pGate .btn', function(b){
  b.addEventListener('click', function(){
    var c = critC(pMuVal()), r = pRange(c), g = +b.dataset.g, step = 0.04*(c.C1 - c.C4);
    var C = g === 0 ? c.C1 + 0.2*(c.C1 - c.C4) : g === 4 ? c.C4 : [0, c.C1, c.C2, c.C3][g] - Math.min(step, 0.5*([0, c.C1 - c.C2, c.C2 - c.C3 > 1e-9 ? c.C2 - c.C3 : c.C3 - c.C4, c.C3 - c.C4][g]));
    pC.value = (r.hi - C)/(r.hi - r.lo)*1000;
    pressGroup(document.getElementById('pGate'), b); renderMap();
  });
});

/* ============ CH3 — EXACT SOLVER ============ */
var sMu = document.getElementById('sMu'), sKey = 'se';
function sMuVal(){ return sKey ? SYS[sKey].mu : Math.min(0.5, Math.pow(10, +sMu.value)); }
function pct(x){ return Math.abs(x) < 0.0005 ? '< 0' + T('.', ',') + '001' + NB + '%' : (x >= 0 ? '+' : '') + fmt(x, Math.abs(x) < 0.1 ? 3 : 2) + NB + '%'; }
function renderSolver(){
  var mu = sMuVal(), S = sKey ? SYS[sKey] : null, p = lpoints(mu), rh = hill(mu), l3 = l3lead(mu);
  setVal('sMuVal', fmtMu(mu)); sMu.setAttribute('aria-valuetext', 'μ = ' + fmtMu(mu));
  function D(x){ return S ? km(x*S.R) : fmt(x, 6) + ' R'; }
  function D3(x){ return S ? fmtInt(x*S.R) + T(' km',' км') : fmt(x, 8) + ' R'; }   // L3 differs from R only in the last digits
  var e1 = (rh/p.g1 - 1)*100, e2 = (rh/p.g2 - 1)*100, e3 = (l3.d1/p.d1 - 1)*100;
  var n2 = S ? T(S.b[0], S.b[1]) : 'M₂', n1 = S ? T(S.a[0], S.a[1]) : 'M₁';
  var f2 = T('from ', 'от ') + (S ? T(S.b[0], S.gb) : 'M₂'), f1 = T('from ', 'от ') + (S ? T(S.a[0], S.ga) : 'M₁');
  var rows = [
    ['L1', f2, D(p.g1), D(rh), pct(e1)],
    ['L2', f2, D(p.g2), D(rh), pct(e2)],
    ['L3', f1, D3(p.d1), D3(l3.d1), pct(e3)],
    ['L3', T('from the barycentre','от барицентра'), D3(p.dB), D3(l3.dB), pct((l3.dB/p.dB - 1)*100)]
  ];
  document.getElementById('sTable').innerHTML = '<caption class="vh">' + T('Exact and leading-order distances of L1, L2 and L3','Точные расстояния до L1, L2 и L3 и значения первого приближения') + '</caption><thead><tr><th>' + T('POINT','ТОЧКА') + '</th><th>' + T('MEASURED','ОТ ЧЕГО') + '</th><th>' + T('EXACT (QUINTIC)','ТОЧНО (УРАВНЕНИЕ 5-Й СТЕПЕНИ)') + '</th><th>' + T('LEADING ORDER','ПЕРВОЕ ПРИБЛИЖЕНИЕ') + '</th><th>' + T('ERROR','ОШИБКА') + '</th></tr></thead><tbody>' +
    rows.map(function(r){ return '<tr><td class="n">' + r[0] + '</td><td>' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="n">' + r[3] + '</td><td class="n">' + r[4] + '</td></tr>'; }).join('') + '</tbody>';
  /* figure: top, the neighbourhood of M2 in Hill radii; bottom, error of the leading-order formula against μ */
  var svg = document.getElementById('sSvg'); svg.innerHTML = '';
  var cx = 240, uy = 70, u = 150/Math.max(1.25, p.g2/rh*1.08);    // px per Hill radius
  txt(svg, 10, 16, T('NEAR M₂, IN HILL RADII r_h = R·(μ/3)^⅓','ОКРЕСТНОСТЬ M₂ В РАДИУСАХ ХИЛЛА r_h = R·(μ/3)^⅓'), 'svg-small');
  ns('line', {x1:20, y1:uy, x2:460, y2:uy, stroke:'#0b0b0c'}, svg);
  [-1, 1].forEach(function(s){ ns('line', {x1:cx + s*u, y1:uy - 22, x2:cx + s*u, y2:uy + 22, stroke:'#7a7a74', 'stroke-dasharray':'3 3'}, svg); });
  txt(svg, cx - u, uy + 34, '−r_h', 'svg-small', 'middle'); txt(svg, cx + u, uy + 34, '+r_h', 'svg-small', 'middle');
  ns('circle', {cx:cx, cy:uy, r:6, fill:'#2f5aa1'}, svg); txt(svg, cx, uy + 34, n2, 'svg-small', 'middle');
  ns('circle', {cx:cx - p.g1/rh*u, cy:uy, r:4, fill:'#b5452a'}, svg); txt(svg, cx - p.g1/rh*u, uy - 27, 'L1', 'svg-label', 'middle');
  ns('circle', {cx:cx + p.g2/rh*u, cy:uy, r:4, fill:'#b5452a'}, svg); txt(svg, cx + p.g2/rh*u, uy - 27, 'L2', 'svg-label', 'middle');
  txt(svg, 20, uy - 12, '← ' + n1, 'svg-small');
  var L = 50, Rr = 466, Tp = 128, B = 300, m0 = -7, m1 = Math.log10(0.5), yMin = -24, yMax = 14;
  function X(lm){ return L + (lm - m0)/(m1 - m0)*(Rr - L); } function Y(v){ return B - (v - yMin)/(yMax - yMin)*(B - Tp); }
  txt(svg, 10, Tp - 10, T('ERROR OF R·(μ/3)^⅓, %','ОШИБКА ФОРМУЛЫ R·(μ/3)^⅓, %'), 'svg-small');
  ns('line', {x1:L, y1:Tp, x2:L, y2:B, stroke:'#0b0b0c'}, svg); ns('line', {x1:L, y1:Y(0), x2:Rr, y2:Y(0), stroke:'#0b0b0c'}, svg);
  [-20, -10, 0, 10].forEach(function(v){ ns('line', {x1:L - 4, y1:Y(v), x2:L, y2:Y(v), stroke:'#0b0b0c'}, svg); txt(svg, L - 7, Y(v) + 3, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), 'svg-small', 'end'); });
  [-6, -5, -4, -3, -2, -1].forEach(function(k){ ns('line', {x1:X(k), y1:B, x2:X(k), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(k), B + 15, '10' + '⁻' + '⁰¹²³⁴⁵⁶'[-k], 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('mass parameter μ (log scale)','параметр масс μ (лог. шкала)'), 'svg-small', 'end');
  var d1 = '', d2 = '';
  for(var k = 0; k <= 140; k++){
    var lm = m0 + (m1 - m0)*k/140, m = Math.pow(10, lm), q = lpoints(m), r = hill(m);
    d1 += (k ? 'L' : 'M') + X(lm).toFixed(1) + ',' + Y((r/q.g1 - 1)*100).toFixed(1);
    d2 += (k ? 'L' : 'M') + X(lm).toFixed(1) + ',' + Y((r/q.g2 - 1)*100).toFixed(1);
  }
  ns('path', {d:d1, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg); ns('path', {d:d2, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  txt(svg, X(-2.2), Y(9), T('L1: formula too far','L1: формула завышает'), 'svg-small', 'end');
  txt(svg, X(-2.2), Y(-11), T('L2: formula too near','L2: формула занижает'), 'svg-small', 'end');
  var lmNow = Math.max(m0, Math.log10(mu));
  ns('line', {x1:X(lmNow), y1:Tp, x2:X(lmNow), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  ns('circle', {cx:X(lmNow), cy:Y(e1), r:3.5, fill:'#b5452a'}, svg); ns('circle', {cx:X(lmNow), cy:Y(e2), r:3.5, fill:'#2f5aa1'}, svg);
  var a1 = collinEig(p.L1, mu), a2 = collinEig(p.L2, mu), a3 = collinEig(p.L3, mu);
  function tm(days){ return days >= 730 ? fmt(days/365.25, 1) + T(' years',' года') : fmt(days, days < 10 ? 2 : 1) + T(' days',' сут'); }
  function ef(e){ return S ? tm(efoldDays(e.lam, S.T)) : fmt(1/(2*Math.PI*e.lam), 3) + T(' rev',' об.'); }
  cells(document.getElementById('sReadout'), [
    [T('MASS PARAMETER <span class="lc">μ</span> = M₂/(M₁+M₂)','ПАРАМЕТР МАСС <span class="lc">μ</span> = M₂/(M₁+M₂)'), fmtMu(mu)],
    [T('HILL RADIUS','РАДИУС ХИЛЛА'), D(rh)],
    [T('L2 FARTHER THAN L1 BY','L2 ДАЛЬШЕ, ЧЕМ L1, НА'), fmt((p.g2/p.g1 - 1)*100, 2) + NB + '%'],
    [T('THIRD-ORDER SERIES, ERROR L1 / L2','РЯД ДО 3-ГО ПОРЯДКА, ОШИБКА L1 / L2'), pct((series3(mu, 1)/p.g1 - 1)*100) + ' / ' + pct((series3(mu, 2)/p.g2 - 1)*100)],
    [T('DRIFT GROWS <span class="lc">e</span>-FOLD IN: L1 / L2 / L3','УХОД РАСТЁТ В <span class="lc">e</span> РАЗ ЗА: L1 / L2 / L3'), ef(a1) + ' / ' + ef(a2) + ' / ' + ef(a3), 1]
  ]);
  hud1.textContent = S ? T(S.en, S.ru) : 'μ = ' + fmtMu(mu);
  document.getElementById('sStatus').innerHTML = sKey === 'se'
    ? T('Earth alone: L1 is ' + km(p.g1*S.R) + ' sunward of Earth and L2 ' + km(p.g2*S.R) + ' beyond it — the “1.5 million km” of every mission page. L3 lies ' + fmt((1 - p.d1)*S.R, 0) + ' km closer to the Sun than Earth is, and ' + fmt((p.dB - 1)*S.R, 0) + ' km farther from the centre of mass than R, because the Sun itself sits ' + fmt(mu*S.R, 0) + ' km from that centre.','Только Земля: L1 лежит на ' + km(p.g1*S.R) + ' ближе к Солнцу, чем Земля, а L2 — на ' + km(p.g2*S.R) + ' дальше: те самые «1,5 млн км» из описания любой миссии. L3 на ' + fmt((1 - p.d1)*S.R, 0) + ' км ближе к Солнцу, чем Земля, и на ' + fmt((p.dB - 1)*S.R, 0) + ' км дальше от центра масс, чем R, потому что само Солнце отстоит от этого центра на ' + fmt(mu*S.R, 0) + ' км.')
    : sKey === 'seb' ? T('The Moon orbits far inside L1 and L2, so for these points its mass counts with Earth\'s: both move about 6,000 km outward. Mission designers use this value; Koon and co-authors give 1.4976 million km for L1 [1].','Луна обращается глубоко внутри L1 и L2, поэтому для этих точек её масса складывается с земной: обе точки отодвигаются примерно на 6000 км. Баллистики используют именно это значение; у Куна с соавторами для L1 приведено 1,4976 млн км [1].')
    : sKey === 'em' ? T('The Moon is a large fraction of Earth\'s mass, so the two points are no longer symmetric: L2 is ' + fmt((p.g2/p.g1 - 1)*100, 0) + ' % farther from the Moon than L1. The single leading-order value, ' + km(rh*S.R) + ' from the Moon\'s centre, is the same number as the “about 61,300 km above the lunar surface” that NASA Goddard quoted for both points [32].','Масса Луны составляет заметную долю земной, и две точки уже несимметричны: L2 на ' + fmt((p.g2/p.g1 - 1)*100, 0) + ' % дальше от Луны, чем L1. Единое значение первого приближения, ' + km(rh*S.R) + ' от центра Луны, совпадает по величине с «примерно 61 300 км над поверхностью Луны», которые Центр Годдарда NASA приводил для обеих точек [32].')
    : sKey === 'sj' ? T('Jupiter\'s L1 and L2 lie about a third of an astronomical unit from the planet. The formula is ' + fmt(Math.abs(e1), 1) + ' % off; a spacecraft or comet passing these necks can be captured by Jupiter for a few orbits.','L1 и L2 Юпитера лежат примерно в трети астрономической единицы от планеты. Формула ошибается на ' + fmt(Math.abs(e1), 1) + ' %; аппарат или комета, проходящие через эти горловины, могут на несколько витков оказаться захваченными Юпитером.')
    : sKey === 'pc' ? T('Charon holds a ninth of the pair\'s mass. The formula is now ' + fmt(Math.abs(e1), 0) + ' % off at both points, and the barycentre lies outside Pluto: use the exact roots.','На Харон приходится девятая часть массы пары. Формула ошибается уже на ' + fmt(Math.abs(e1), 0) + ' % в обеих точках, а барицентр лежит вне Плутона: нужны точные корни.')
    : T('Distances are in units of the separation R. Pick a real pair to see kilometres and days.','Расстояния даны в долях расстояния R между телами. Выберите реальную пару, чтобы увидеть километры и сутки.');
}
sMu.addEventListener('input', function(){ sKey = null; pressGroup(document.getElementById('sPre'), null); renderSolver(); });
each('#sPre .btn', function(b){
  b.addEventListener('click', function(){ sKey = b.dataset.k; sMu.value = Math.log10(SYS[sKey].mu); pressGroup(document.getElementById('sPre'), b); renderSolver(); });
});

/* ============ CH4 — STABILITY OF L4 / L5 ============ */
var tMu = document.getElementById('tMu'), tKey = 'sj';
function tMuVal(){ return tKey === 'crit' ? MU_CRIT : tKey ? SYS[tKey].mu : Math.min(0.5, Math.pow(10, +tMu.value)); }
function renderTri(){
  var mu = tMuVal(), S = tKey && tKey !== 'crit' ? SYS[tKey] : null, e = triEig(mu);
  setVal('tMuVal', fmtMu(mu)); tMu.setAttribute('aria-valuetext', 'μ = ' + fmtMu(mu));
  var svg = document.getElementById('tSvg'); svg.innerHTML = '';
  var L = 44, Rr = 466, Tp = 26, B = 150, xm = 0.12;
  function X(m){ return L + m/xm*(Rr - L); } function Y(v){ return B - v/1.05*(B - Tp); }
  txt(svg, 8, 14, T('FREQUENCIES NEAR L4/L5, in units of the orbital rate','ЧАСТОТЫ У L4/L5 в долях орбитальной угловой скорости'), 'svg-small');
  ns('line', {x1:L, y1:Tp, x2:L, y2:B, stroke:'#0b0b0c'}, svg); ns('line', {x1:L, y1:B, x2:Rr, y2:B, stroke:'#0b0b0c'}, svg);
  [0, 0.5, 1].forEach(function(v){ ns('line', {x1:L - 4, y1:Y(v), x2:L, y2:Y(v), stroke:'#0b0b0c'}, svg); txt(svg, L - 7, Y(v) + 3, fmt(v, 1), 'svg-small', 'end'); });
  [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12].forEach(function(m){ ns('line', {x1:X(m), y1:B, x2:X(m), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(m), B + 15, fmt(m, 2), 'svg-small', m > 0.11 ? 'end' : 'middle'); });
  txt(svg, Rr, B + 28, 'μ', 'svg-small', 'end');
  var ds = '', dl = '', dg = '', dw = '';
  for(var k = 0; k <= 240; k++){
    var m = xm*k/240, q = triEig(Math.max(m, 1e-9));
    if(q.stable){ ds += (ds ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(q.ws).toFixed(1); dl += (dl ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(q.wl).toFixed(1); }
    else { dg += (dg ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(q.growth).toFixed(1); dw += (dw ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(q.w).toFixed(1); }
  }
  var yc = Y(Math.SQRT1_2), xc = X(MU_CRIT);
  ns('path', {d:ds + 'L' + xc.toFixed(1) + ',' + yc.toFixed(1), fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  ns('path', {d:dl + 'L' + xc.toFixed(1) + ',' + yc.toFixed(1), fill:'none', stroke:'#3d7a4a', 'stroke-width':2, 'stroke-dasharray':'7 3'}, svg);
  ns('path', {d:'M' + xc.toFixed(1) + ',' + yc.toFixed(1) + dw.replace(/^M/, 'L'), fill:'none', stroke:'#7a7a74', 'stroke-width':2}, svg);
  ns('path', {d:'M' + xc.toFixed(1) + ',' + Y(0).toFixed(1) + dg.replace(/^M/, 'L'), fill:'none', stroke:'#b5452a', 'stroke-width':2, 'stroke-dasharray':'2 3'}, svg);
  ns('line', {x1:xc, y1:Tp, x2:xc, y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, xc + 4, Tp + 8, 'μ = ' + fmt(MU_CRIT, 5), 'svg-small');
  txt(svg, Rr, Y(0.2), T('growth rate','скорость роста'), 'svg-small', 'end');
  if(mu <= xm){ ns('line', {x1:X(mu), y1:Tp, x2:X(mu), y2:B, stroke:'#0b0b0c', 'stroke-width':1.5}, svg); }
  else txt(svg, Rr, Tp + 8, T('this μ is off the chart →','это μ за краем графика →'), 'svg-small', 'end');
  /* linearised path */
  var rev = 2*Math.PI, tEnd = e.stable ? Math.min(Math.max(2*rev/e.wl, 6*rev), 40*rev) : 7*rev;
  var path = triPath(mu, tEnd, 0.02), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  path.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  var bx = 30, by = 212, bw = 420, bh = 128, s = Math.min(bw/(x1 - x0 || 1), bh/(y1 - y0 || 1)), ox = bx + (bw - (x1 - x0)*s)/2, oy = by + (bh - (y1 - y0)*s)/2;
  ns('rect', {x:6, y:188, width:468, height:176, fill:'none', stroke:'#c9c9c1'}, svg);
  var d = '', stepN = Math.max(1, Math.floor(path.length/1400));
  for(k = 0; k < path.length; k += stepN) d += (k ? 'L' : 'M') + (ox + (path[k][0] - x0)*s).toFixed(1) + ',' + (oy + (y1 - path[k][1])*s).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:e.stable ? '#2f5aa1' : '#b5452a', 'stroke-width':1.2}, svg);
  ns('circle', {cx:ox + (0 - x0)*s, cy:oy + (y1 - 0)*s, r:3.5, fill:'#b5452a'}, svg);
  txt(svg, ox + (0 - x0)*s + 6, oy + y1*s - 5, 'L4', 'svg-label svg-halo');
  ns('circle', {cx:ox + (1 - x0)*s, cy:oy + y1*s, r:2.5, fill:'#0b0b0c'}, svg);
  txt(svg, 12, 202, T('LINEARISED PATH near L4 · ','ЛИНЕАРИЗОВАННЫЙ ПУТЬ у L4 · ') + fmt((path.length - 1)*0.02/rev, 1) + T(' revolutions',' оборота') + (e.stable && 2*rev/e.wl > 40*rev ? T(' (part of one long period)',' (часть длинного периода)') : ''), 'svg-small svg-halo');
  txt(svg, 12, 358, T('frame width ≈ ','ширина поля ≈ ') + fmt(Math.max(x1 - x0, bw/s), 1) + T(' × the starting offset',' × начальное смещение'), 'svg-small svg-halo');
  function per(w){ return fmt(1/w, 1/w < 10 ? 3 : 1) + T(' rev',' об.') + (S ? ' = ' + (S.T/w >= 730 ? fmt(S.T/w/365.25, 1) + T(' years',' года') : fmt(S.T/w, 1) + T(' days',' сут')) : ''); }
  var rows = [
    [T('MASS PARAMETER <span class="lc">μ</span>','ПАРАМЕТР МАСС <span class="lc">μ</span>'), Math.abs(mu - MU_CRIT) < 2e-3 ? fmt(mu, 6) : fmtMu(mu)],
    [T('MASS RATIO M₁ : M₂','ОТНОШЕНИЕ МАСС M₁ : M₂'), ((1 - mu)/mu < 100 ? fmt((1 - mu)/mu, 2) : fmtInt((1 - mu)/mu)) + ' : 1'],
    [T('LINEAR STABILITY','ЛИНЕЙНАЯ УСТОЙЧИВОСТЬ'), Math.abs(mu - MU_CRIT) < 1e-12 ? T('exactly at the limit','ровно на границе') : e.stable ? T('stable: both modes oscillate','устойчиво: обе моды — колебания') : T('unstable: oscillation that grows','неустойчиво: колебания нарастают'), 1]
  ];
  if(e.stable){ rows.push([T('SHORT PERIOD','КОРОТКИЙ ПЕРИОД'), per(e.ws)]); rows.push([T('LONG PERIOD','ДЛИННЫЙ ПЕРИОД'), e.wl > 1e-12 ? per(e.wl) : '∞']); }
  else rows.push([T('AMPLITUDE GROWS <span class="lc">e</span>-FOLD IN','АМПЛИТУДА РАСТЁТ В <span class="lc">e</span> РАЗ ЗА'), fmt(1/(rev*e.growth), 2) + T(' rev',' об.') + (S ? ' = ' + fmt(S.T/(rev*e.growth), 1) + T(' days',' сут') : ''), 1]);
  cells(document.getElementById('tReadout'), rows);
  hud2.textContent = e.stable ? T('STABLE','УСТОЙЧИВЫ') : T('UNSTABLE','НЕУСТОЙЧИВЫ');
  document.getElementById('tStatus').innerHTML = tKey === 'sj'
    ? T('Sun–Jupiter: a body near L4 circles it once per Jupiter year while the centre of that loop drifts round a long ellipse every ' + fmt(S.T/e.wl/365.25, 0) + ' years. Published libration periods of Jupiter\'s Trojans are about 150 years [24].','Солнце — Юпитер: тело у L4 описывает петлю за один год Юпитера, а центр петли обходит вытянутый эллипс за ' + fmt(S.T/e.wl/365.25, 0) + ' лет. Опубликованный период либрации троянцев Юпитера — около 150 лет [24].')
    : tKey === 'em' ? T('Earth–Moon: 81 to 1 is well above 24.96, so in this model L4 and L5 are stable. In reality the Sun\'s pull disturbs them strongly; the circular three-body model cannot show that.','Земля — Луна: 81 к 1 заметно больше 24,96, поэтому в этой модели L4 и L5 устойчивы. В действительности их сильно возмущает притяжение Солнца; круговая модель трёх тел этого показать не может.')
    : tKey === 'pc' ? T('Pluto–Charon: about 8 to 1. The two periods have merged and turned into one oscillation that grows: nothing can stay at Charon\'s L4 or L5.','Плутон — Харон: примерно 8 к 1. Два периода слились в одно нарастающее колебание: в точках L4 и L5 Харона ничто удержаться не может.')
    : tKey === 'crit' ? T('At the limit the two frequencies meet at 1/√2 of the orbital rate. One step to the right and the pair splits into a growing and a decaying spiral.','На границе обе частоты сходятся к 1/√2 орбитальной угловой скорости. Шаг вправо — и пара распадается на раскручивающуюся и затухающую спирали.')
    : e.stable ? T('Below μ = 0.03852 a body pushed off the summit is turned by the Coriolis force and circles back: two oscillations, one fast, one slow.','При μ меньше 0,03852 тело, столкнутое с вершины, разворачивается силой Кориолиса и возвращается: два колебания, быстрое и медленное.')
    : T('Above μ = 0.03852 the Coriolis force no longer wins: the loops widen on every turn.','При μ больше 0,03852 сила Кориолиса уже не справляется: петли расширяются с каждым оборотом.');
}
tMu.addEventListener('input', function(){ tKey = null; pressGroup(document.getElementById('tPre'), null); renderTri(); });
each('#tPre .btn', function(b){
  b.addEventListener('click', function(){ tKey = b.dataset.k; tMu.value = Math.log10(tMuVal()); pressGroup(document.getElementById('tPre'), b); renderTri(); });
});

/* ============ CH5 — STATION-KEEPING ============ */
/* Published annual station-keeping cost, m/s per year */
var SK = {
  ace:  {en:'ACE, Wind', ru:'ACE, Wind', dv:1.0, sys:'seb', pt:'L1', flown:true, ref:8},
  p1l2: {en:'ARTEMIS P1 · L2', ru:'ARTEMIS P1 · L2', dv:7.39, sys:'em', pt:'L2', flown:true, ref:9},
  p1l1: {en:'ARTEMIS P1 · L1', ru:'ARTEMIS P1 · L1', dv:5.28, sys:'em', pt:'L1', flown:true, ref:9},
  p2l1: {en:'ARTEMIS P2 · L1', ru:'ARTEMIS P2 · L1', dv:5.09, sys:'em', pt:'L1', flown:true, ref:9},
  nrho: {en:'NRHO (simulated)', ru:'NRHO (расчёт)', dv:1.0, sys:'em', pt:null, flown:false, ref:10}
};
var SK_ORDER = ['ace', 'p2l1', 'p1l1', 'p1l2', 'nrho'], kKey = 'ace';
var GROWTH_CEIL = 1e6;                                         // beyond this factor the linearised growth law is not shown as a number
/* Growth factor of an uncorrected error after `days`; null where the linear model no longer applies */
function growth(days, tau){ var g = Math.exp(days/tau); return g > GROWTH_CEIL ? null : g; }
var kM = document.getElementById('kM'), kI = document.getElementById('kI'), kD = document.getElementById('kD');
function skTau(k){ var q = SK[k]; if(!q.pt) return null; var S = SYS[q.sys], p = lpoints(S.mu); return efoldDays(collinEig(p[q.pt], S.mu).lam, S.T); }
function renderSK(){
  var q = SK[kKey], m = +kM.value, isp = +kI.value, days = +kD.value, tau = skTau(kKey);
  setVal('kMVal', fmtInt(m) + T(' kg',' кг')); setVal('kIVal', fmtInt(isp) + T(' s',' с')); setVal('kDVal', fmtInt(days) + T(' days',' сут'));
  [kM, kI, kD].forEach(function(el){ el.setAttribute('aria-valuetext', document.getElementById(el.id + 'Val').textContent); });
  var svg = document.getElementById('kSvg'); svg.innerHTML = '';
  var L = 150, Rr = 440, top = 30, rowH = 22, sc = (Rr - L)/8;
  txt(svg, 8, 14, T('PUBLISHED STATION-KEEPING COST, m/s per year','ОПУБЛИКОВАННЫЕ ЗАТРАТЫ НА УДЕРЖАНИЕ, м/с в год'), 'svg-small');
  SK_ORDER.forEach(function(k, i){
    var r = SK[k], y = top + i*rowH, on = k === kKey;
    txt(svg, L - 8, y + 12, T(r.en, r.ru), on ? 'svg-label' : 'svg-small', 'end');
    ns('rect', {x:L, y:y, width:r.dv*sc, height:15, fill:r.flown ? (on ? '#2f5aa1' : '#6f8fc4') : (on ? '#5f5f59' : '#8a8a84'), stroke:on ? '#0b0b0c' : 'none', 'stroke-width':1.5}, svg);
    txt(svg, L + r.dv*sc + 6, y + 12, fmt(r.dv, r.dv === 1 ? 1 : 2), 'svg-small');
  });
  [0, 2, 4, 6, 8].forEach(function(v){ txt(svg, L + v*sc, top + 5*rowH + 12, String(v), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:top - 4, x2:L, y2:top + 5*rowH, stroke:'#0b0b0c'}, svg);
  /* growth of an uncorrected error */
  var gl = 50, gr = 466, gt = 192, gb = 300, dMax = 120, yMax = 6;
  function X(d){ return gl + d/dMax*(gr - gl); } function Y(lg){ return gb - Math.min(lg, yMax)/yMax*(gb - gt); }
  txt(svg, 8, gt - 12, T('GROWTH OF AN UNCORRECTED ERROR (linear model), ×','РОСТ НЕИСПРАВЛЕННОЙ ОШИБКИ (линейная модель), раз'), 'svg-small');
  ns('line', {x1:gl, y1:gt, x2:gl, y2:gb, stroke:'#0b0b0c'}, svg); ns('line', {x1:gl, y1:gb, x2:gr, y2:gb, stroke:'#0b0b0c'}, svg);
  [0, 2, 4, 6].forEach(function(v){ ns('line', {x1:gl - 4, y1:Y(v), x2:gl, y2:Y(v), stroke:'#0b0b0c'}, svg); txt(svg, gl - 7, Y(v) + 3, v === 0 ? '1' : '10' + '⁰¹²³⁴⁵⁶'[v], 'svg-small', 'end'); });
  [0, 30, 60, 90, 120].forEach(function(v){ ns('line', {x1:X(v), y1:gb, x2:X(v), y2:gb + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), gb + 15, String(v), 'svg-small', 'middle'); });
  txt(svg, gr, gb + 28, T('days since the last correction','сутки после последней коррекции'), 'svg-small', 'end');
  [['em', 'L1', '#b5452a', T('Moon L1','лунная L1'), '2 3'], ['em', 'L2', '#3d7a4a', T('Moon L2','лунная L2'), '7 3'], ['seb', 'L1', '#2f5aa1', T('Sun–Earth L1','Солнце–Земля, L1'), '']].forEach(function(c, i){
    var S = SYS[c[0]], t = efoldDays(collinEig(lpoints(S.mu)[c[1]], S.mu).lam, S.T), dEnd = Math.min(dMax, yMax*Math.LN10*t);
    var act = q.pt && q.sys === c[0] && q.pt === c[1];
    ns('line', {x1:X(0), y1:Y(0), x2:X(dEnd), y2:Y(dEnd/t/Math.LN10), stroke:c[2], 'stroke-width':act ? 3 : 1.8, 'stroke-dasharray':c[4]}, svg);
    /* legend, left to right as the lines stand: a sample of the line's own dash pattern, then black text */
    ns('line', {x1:gr - 176, y1:gt + 9 + i*15, x2:gr - 148, y2:gt + 9 + i*15, stroke:c[2], 'stroke-width':2.2, 'stroke-dasharray':c[4]}, svg);
    txt(svg, gr - 142, gt + 13 + i*15, c[3], 'svg-small svg-halo');
  });
  if(tau){ ns('line', {x1:X(days), y1:gt, x2:X(days), y2:gb, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg); ns('circle', {cx:X(days), cy:Y(days/tau/Math.LN10), r:4, fill:'#0b0b0c'}, svg); }
  var prop = propellant(m, q.dv, isp), g = tau ? growth(days, tau) : null, over = !!tau && g === null;
  var OVER = T('more than 10⁶ times: the linear model no longer applies','больше чем в 10⁶ раз: линейная модель уже неприменима');
  cells(document.getElementById('kReadout'), [
    [T('PUBLISHED COST','ОПУБЛИКОВАННЫЕ ЗАТРАТЫ'), fmt(q.dv, q.dv === 1 ? 1 : 2) + T(' m/s per year',' м/с в год') + ' [' + q.ref + ']'],
    [T('SOURCE','ИСТОЧНИК ЗНАЧЕНИЯ'), q.flown ? T('flown mission','реальный полёт') : T('simulation','моделирование')],
    [T('PROPELLANT PER YEAR (YOUR MASS AND SPECIFIC IMPULSE)','ТОПЛИВО В ГОД (ПРИ ВАШИХ МАССЕ И УДЕЛЬНОМ ИМПУЛЬСЕ)'), fmt(prop, prop < 10 ? 2 : 1) + T(' kg',' кг'), 1],
    [T('TEN YEARS OF STATION-KEEPING','ДЕСЯТЬ ЛЕТ УДЕРЖАНИЯ'), fmt(propellant(m, 10*q.dv, isp), 1) + T(' kg',' кг')],
    [T('<span class="lc">e</span>-FOLDING / DOUBLING TIME','ВРЕМЯ РОСТА В <span class="lc">e</span> РАЗ / ВДВОЕ'), tau ? fmt(tau, tau < 10 ? 2 : 1) + ' / ' + fmt(tau*Math.LN2, tau < 10 ? 2 : 1) + T(' days',' сут') : '—'],
    [T('ERROR AFTER ','ОШИБКА ЧЕРЕЗ ') + fmtInt(days) + T(' DAYS WITHOUT A BURN',' <span class="lc">сут</span> БЕЗ КОРРЕКЦИИ'), !tau ? '—' : over ? OVER : '× ' + (g < 1000 ? fmt(g, g < 10 ? 2 : 0) : sci(g, 1)), 1]
  ]);
  document.getElementById('kStatus').innerHTML = !q.pt
    ? T('The near-rectilinear halo orbit is a different animal: it is only slightly unstable, so the linear growth rate of L2 does not apply and none is shown. The published figure is a simulation for the orbit designed for Gateway: about 1 m/s per year in the baseline case, and from 0.4 to about 4 depending on navigation errors and on how often the reaction wheels are unloaded [10].','Почти прямолинейная гало-орбита устроена иначе: она лишь слабо неустойчива, поэтому линейная скорость роста для L2 к ней неприменима и здесь не показана. Опубликованное значение получено моделированием орбиты, спроектированной для станции Gateway: около 1 м/с в год в базовом варианте и от 0,4 до примерно 4 в зависимости от навигационных ошибок и частоты разгрузки маховиков [10].')
    : q.sys === 'em'
      ? T('Near the Moon the error multiplies by e every ' + fmt(tau, 1) + ' days, which is why ARTEMIS corrected its orbit about once a week [9]. ','У Луны ошибка умножается на e каждые ' + fmt(tau, 1) + ' сут — поэтому ARTEMIS корректировал орбиту примерно раз в неделю [9]. ')
        + (over ? T('After ' + fmtInt(days) + ' days the linear law gives a factor above a million: long before that the spacecraft has left the neighbourhood of the point and the law has stopped applying.','Через ' + fmtInt(days) + ' сут линейный закон даёт множитель больше миллиона: задолго до этого аппарат покинул окрестность точки, и закон перестал действовать.')
                : T('Wait ' + fmtInt(days) + ' days and a 1 mm/s error has become ' + (g < 1000 ? fmt(g, g < 10 ? 1 : 0) + ' mm/s' : fmt(g/1000, 1) + ' m/s') + '.','Подождите ' + fmtInt(days) + ' сут, и ошибка в 1 мм/с превратится в ' + (g < 1000 ? fmt(g, g < 10 ? 1 : 0) + ' мм/с' : fmt(g/1000, 1) + ' м/с') + '.'))
      : T('At Sun–Earth L1 an error doubles every ' + fmt(tau*Math.LN2, 1) + ' days — the flight team\'s own figure is about 16 [8] — so ACE and Wind get by with a burn about every three months. After ' + fmtInt(days) + ' days a 1 mm/s error has grown ' + fmt(g, 1) + ' times.','У точки L1 системы Солнце — Земля ошибка удваивается каждые ' + fmt(tau*Math.LN2, 1) + ' сут (оценка самих баллистиков — около 16 [8]), так что ACE и Wind хватает коррекции примерно раз в три месяца. За ' + fmtInt(days) + ' сут ошибка в 1 мм/с вырастает в ' + fmt(g, 1) + ' раза.');
}
[kM, kI, kD].forEach(function(el){ el.addEventListener('input', renderSK); });
each('#kPre .btn', function(b){ b.addEventListener('click', function(){ kKey = b.dataset.k; pressGroup(document.getElementById('kPre'), b); renderSK(); }); });

/* ============ CH7 — MISSION REGISTER ============ */
/* [point, name EN, name RU, agency EN, agency RU, launched, arrived EN, arrived RU, until EN, until RU, ref] — dates as published in the cited source */
var MISSIONS = [
  ['se1','ISEE-3','ISEE-3','NASA / ESA','NASA / ЕКА','12 Aug 1978','20 Nov 1978, halo: the first spacecraft to orbit a libration point','20 нояб. 1978, гало-орбита: первый аппарат на орбите у точки либрации','left from 10 Jun 1982','уход с 10 июня 1982',7],
  ['se1','Wind','Wind','NASA','NASA','1 Nov 1994','halo-type orbit by Nov 1996; back for good by 2004','орбита типа гало к нояб. 1996; окончательно с 2004','','',7],
  ['se1','SOHO','SOHO','ESA / NASA','ЕКА / NASA','2 Dec 1995','14 Feb 1996; about six months per orbit','14 февр. 1996; оборот примерно за полгода','','',7],
  ['se1','ACE','ACE','NASA','NASA','25 Aug 1997','Lissajous orbit; operational 21 Jan 1998','орбита Лиссажу; в работе с 21 янв. 1998','','',7],
  ['se1','Genesis','Genesis','NASA','NASA','8 Aug 2001','16 Nov 2001, halo','16 нояб. 2001, гало-орбита','left 22 Apr 2004; capsule crash-landed in Utah 8 Sep 2004 (parachute did not open)','уход 22 апр. 2004; капсула разбилась при посадке в Юте 8 сент. 2004 (парашют не раскрылся)',7],
  ['se1','DSCOVR','DSCOVR','NASA / NOAA / USAF','NASA / NOAA / ВВС США','11 Feb 2015','8 Jun 2015, Lissajous','8 июня 2015, орбита Лиссажу','','',7],
  ['se1','LISA Pathfinder','LISA Pathfinder','ESA','ЕКА','3 Dec 2015','22 Jan 2016, Lissajous','22 янв. 2016, орбита Лиссажу','switched off 18 Jul 2017','выключен 18 июля 2017','7, 35'],
  ['se1','Aditya-L1','«Адитья-L1»','ISRO','ISRO','2 Sep 2023','6 Jan 2024, halo of 177.86 days','6 янв. 2024, гало-орбита с периодом 177,86 сут','','',16],
  ['se1','IMAP','IMAP','NASA','NASA','24 Sep 2025','10 Jan 2026','10 янв. 2026','','',17],
  ['se1','SWFO-L1 (SOLAR-1)','SWFO-L1 (SOLAR-1)','NOAA','NOAA','24 Sep 2025','23 Jan 2026','23 янв. 2026','','',18],
  ['se2','WMAP','WMAP','NASA','NASA','30 Jun 2001','1 Oct 2001, Lissajous: the first to orbit Sun–Earth L2','1 окт. 2001, орбита Лиссажу: первый на орбите у L2 системы Солнце — Земля','moved to a graveyard orbit Oct 2010','увод на орбиту захоронения в окт. 2010',7],
  ['se2','Herschel','«Гершель»','ESA','ЕКА','14 May 2009','mid-July 2009, Lissajous','середина июля 2009, орбита Лиссажу','helium exhausted 29 Apr 2013','гелий закончился 29 апр. 2013',7],
  ['se2','Planck','«Планк»','ESA','ЕКА','14 May 2009','3 Jul 2009, Lissajous','3 июля 2009, орбита Лиссажу','switched off 23 Oct 2013','выключен 23 окт. 2013',7],
  ['se2','Chang\'e 2','«Чанъэ-2»','CNSA','CNSA','1 Oct 2010','25 Aug 2011, from lunar orbit','25 авг. 2011, с окололунной орбиты','left 15 Apr 2012 for asteroid Toutatis','уход 15 апр. 2012 к астероиду Таутатис',7],
  ['se2','Gaia','«Гайя»','ESA','ЕКА','19 Dec 2013','8 Jan 2014','8 янв. 2014','retired 27 Mar 2025','выведена из работы 27 марта 2025',15],
  ['se2','Spektr-RG','«Спектр-РГ»','Roscosmos / DLR','Роскосмос / DLR','13 Jul 2019','21 Oct 2019, halo','21 окт. 2019, гало-орбита','','','29, 36'],
  ['se2','James Webb Space Telescope','«Джеймс Уэбб»','NASA / ESA / CSA','NASA / ЕКА / CSA','25 Dec 2021','24 Jan 2022, halo of about six months','24 янв. 2022, гало-орбита с периодом около полугода','','',13],
  ['se2','Euclid','Euclid','ESA','ЕКА','1 Jul 2023','by 28 Jul 2023','к 28 июля 2023','','',37],
  ['se2','Roman','Roman','NASA','NASA','30 Aug 2026','in transfer; insertion expected about early Dec 2026','в перелёте; выход на орбиту ожидается в начале дек. 2026','','','19, 38'],
  ['em','ARTEMIS P1','ARTEMIS P1','NASA','NASA','17 Feb 2007 (as THEMIS)','25 Aug 2010 at L2: the first to orbit an Earth–Moon point; later L1','25 авг. 2010 у L2: первый на орбите у точки системы Земля — Луна; затем L1','to lunar orbit 27 Jun 2011','на окололунную орбиту 27 июня 2011',9],
  ['em','ARTEMIS P2','ARTEMIS P2','NASA','NASA','17 Feb 2007 (as THEMIS)','22 Oct 2010 at L1','22 окт. 2010 у L1','to lunar orbit 17 Jul 2011','на окололунную орбиту 17 июля 2011',9],
  ['em','Chang\'e 5-T1 service module','Служебный модуль «Чанъэ-5-T1»','CNSA','CNSA','23 Oct 2014','27 Nov 2014 at L2, 14-day Lissajous','27 нояб. 2014 у L2, орбита Лиссажу с периодом 14 сут','left 4 Jan 2015','уход 4 янв. 2015',7],
  ['em','Queqiao','«Цюэцяо»','CNSA','CNSA','20 May 2018','14 Jun 2018, halo about L2: the first communications satellite to work in that orbit','14 июня 2018, гало-орбита у L2: первый спутник связи, работающий на такой орбите','','','21, 33'],
  ['em','CAPSTONE','CAPSTONE','NASA / Advanced Space','NASA / Advanced Space','28 Jun 2022','13 Nov 2022, near-rectilinear halo orbit','13 нояб. 2022, почти прямолинейная гало-орбита','','',20]
];
var mFilter = 'all';
function renderMissions(){
  var names = {se1:T('Sun–Earth L1','Солнце — Земля, L1'), se2:T('Sun–Earth L2','Солнце — Земля, L2'), em:T('Earth–Moon','Земля — Луна')};
  var rows = MISSIONS.filter(function(m){ return mFilter === 'all' || m[0] === mFilter; });
  document.getElementById('mTable').innerHTML = '<caption class="vh">' + T('Spacecraft sent to Sun–Earth L1 and L2 and to the Earth–Moon points','Аппараты, отправленные к точкам L1 и L2 системы Солнце — Земля и к точкам системы Земля — Луна') + '</caption><thead><tr><th>' + T('SPACECRAFT','АППАРАТ') + '</th><th>' + T('POINT','ТОЧКА') + '</th><th>' + T('LAUNCHED','СТАРТ') + '</th><th>' + T('ARRIVED','ПРИБЫТИЕ') + '</th><th>' + T('LEFT OR ENDED','УХОД ИЛИ ЗАВЕРШЕНИЕ') + '</th><th>' + T('SOURCE','ИСТОЧНИК') + '</th></tr></thead><tbody>' +
    rows.map(function(m){
      return '<tr><td><b>' + T(m[1], m[2]) + '</b><br><span class="m-ag">' + T(m[3], m[4]) + '</span></td><td class="nw">' + names[m[0]] + '</td><td class="n">' + T(m[5], ruDate(m[5])) + '</td><td>' + T(m[6], m[7]) + '</td><td>' + (T(m[8], m[9]).trim() || '—') + '</td><td class="n">' + String(m[10]).split(', ').map(function(n){ return '[' + n + ']'; }).join('') + '</td></tr>';
    }).join('') + '</tbody>';
  document.getElementById('mCount').textContent = fmtInt(rows.length) + T(' of ',' из ') + fmtInt(MISSIONS.length) + T(' spacecraft shown',' аппаратов в таблице');
}
/* Launch dates are UT where the source gives UT (Queqiao: 21:28 UTC on 20 May = 21 May in Beijing). */
var RU_MON = {Jan:'янв.', Feb:'февр.', Mar:'марта', Apr:'апр.', May:'мая', Jun:'июня', Jul:'июля', Aug:'авг.', Sep:'сент.', Oct:'окт.', Nov:'нояб.', Dec:'дек.'};
function ruDate(s){ return s.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, function(m){ return RU_MON[m]; }).replace('(as THEMIS)', '(как THEMIS)'); }
each('#mPick .btn', function(b){ b.addEventListener('click', function(){ mFilter = b.dataset.f; pressGroup(document.getElementById('mPick'), b); renderMissions(); }); });

/* Minor Planet Center lists dated 30 May 2026 (downloaded 14 Nov 2026) */
var MPC = {jupiter:[9823, 5942], mars:[2, 16], neptune:[28, 7], earth:[1, 0]};

/* ============ TIMELINE ============ */
var TIMELINE = [
  ['1763', 'Leonhard Euler writes “On the rectilinear motion of three bodies mutually attracting each other”, printed in St Petersburg in 1767: three bodies can stay on one line, and their spacing obeys an equation of the fifth degree.', 'Леонард Эйлер пишет работу «О прямолинейном движении трёх взаимно притягивающихся тел», напечатанную в Петербурге в 1767 году: три тела могут оставаться на одной прямой, а расстояния между ними подчиняются уравнению пятой степени.'],
  ['1772', 'Joseph-Louis Lagrange\'s prize essay on the three-body problem adds the equilateral solution: three bodies at the corners of a triangle with equal sides.', 'Жозеф Луи Лагранж в премированном «Опыте о задаче трёх тел» добавляет равностороннее решение: три тела в вершинах треугольника с равными сторонами.'],
  ['1843', 'Gabriel Gascheau, in a thesis published in Paris, shows that the triangle is stable only when one mass dominates; Edward Routh obtains the limit again in 1875 and extends it to other laws of attraction.', 'Габриэль Гашо в диссертации, изданной в Париже, показывает, что треугольник устойчив, только если одна масса преобладает; в 1875 году Эдвард Раус получает ту же границу заново и распространяет её на другие законы притяжения.'],
  ['1906', 'Max Wolf at Heidelberg discovers 588 Achilles on 22 February: the first asteroid found at a triangular point, ahead of Jupiter at L4.', 'Макс Вольф в Гейдельберге 22 февраля открывает астероид (588) Ахиллес — первый астероид, найденный в треугольной точке: он движется впереди Юпитера, у L4.'],
  ['1950', 'Arthur C. Clarke suggests the point beyond the Moon as a place to relay broadcasts to the lunar far side.', 'Артур Кларк предлагает использовать точку за Луной для ретрансляции передач на обратную сторону Луны.'],
  ['1966', 'Robert Farquhar finds orbits around that point that stay in view of Earth; he names them halo orbits, a name in print by his 1968 thesis.', 'Роберт Фаркуар находит вокруг этой точки орбиты, с которых всегда видна Земля; он называет их гало-орбитами — в печати это название появляется не позднее его диссертации 1968 года.'],
  ['1984', 'Kathleen Howell and John Breakwell describe the “almost rectilinear” halo orbits, the family later chosen for a lunar station.', 'Кэтлин Хауэлл и Джон Брейкуэлл описывают «почти прямолинейные» гало-орбиты — семейство, позже выбранное для окололунной станции.'],
  ['1978', 'ISEE-3 enters a halo orbit around Sun–Earth L1 on 20 November: the first spacecraft to orbit a libration point.', 'ISEE-3 20 ноября выходит на гало-орбиту у точки L1 системы Солнце — Земля: первый аппарат на орбите у точки либрации.'],
  ['1996', 'SOHO reaches L1 on 14 February, ten weeks after its launch on 2 December 1995.', 'SOHO 14 февраля достигает L1 — через десять недель после старта 2 декабря 1995 года.'],
  ['2001', 'WMAP arrives at Sun–Earth L2 on 1 October, the first spacecraft to orbit that point.', 'WMAP 1 октября прибывает к точке L2 системы Солнце — Земля — первым выходит на орбиту у этой точки.'],
  ['2010', 'ARTEMIS P1 enters orbit around Earth–Moon L2 on 25 August and P2 around L1 on 22 October: the first spacecraft to orbit the Moon\'s libration points.', 'ARTEMIS P1 25 августа выходит на орбиту у точки L2 системы Земля — Луна, а P2 22 октября — у L1: первые аппараты на орбитах у лунных точек либрации.'],
  ['2011', 'Chang\'e 2 flies from lunar orbit to Sun–Earth L2, arriving on 25 August: China becomes the third to send a spacecraft to a Lagrange point, after the United States and ESA. The first Earth Trojan, 2010 TK7, is announced.', '«Чанъэ-2» перелетает с окололунной орбиты к точке L2 системы Солнце — Земля и прибывает 25 августа: Китай третьим, после США и ЕКА, отправляет аппарат к точке Лагранжа. Объявлено об открытии первого троянца Земли, 2010 TK7.'],
  ['2018', 'Queqiao settles into a halo orbit behind the Moon on 14 June, the first communications satellite to work there: the relay Clarke proposed in 1950, ready for Chang\'e 4 on the far side.', '«Цюэцяо» 14 июня занимает гало-орбиту за Луной — первый спутник связи, работающий там: ретранслятор, предложенный Кларком в 1950 году, готов обслуживать «Чанъэ-4» на обратной стороне.'],
  ['2021', 'Lucy leaves on 16 October for Jupiter\'s Trojans; the James Webb Space Telescope launches on 25 December and reaches L2 on 24 January 2022.', '«Люси» 16 октября отправляется к троянцам Юпитера; телескоп «Джеймс Уэбб» стартует 25 декабря и 24 января 2022 года достигает L2.'],
  ['2022', 'CAPSTONE enters a near-rectilinear halo orbit at the Moon on 13 November, the first spacecraft to fly one.', 'CAPSTONE 13 ноября выходит на почти прямолинейную гало-орбиту у Луны — первым из космических аппаратов.'],
  ['2024', 'India\'s Aditya-L1 enters its halo orbit around L1 on 6 January.', 'Индийский аппарат «Адитья-L1» 6 января выходит на гало-орбиту у L1.'],
  ['2025', 'Gaia is switched off on 27 March after more than ten years at L2 and sent into orbit around the Sun.', '«Гайя» 27 марта выключена после более чем десяти лет работы у L2 и уведена на орбиту вокруг Солнца.'],
  ['2026', 'IMAP reaches L1 on 10 January; Roman launches toward L2 on 30 August.', 'IMAP 10 января достигает L1; Roman 30 августа стартует к L2.']
];

/* ============ REFERENCES ============ */
var REFERENCES = [
  {title:'W. S. Koon, M. W. Lo, J. E. Marsden, S. D. Ross, Dynamical Systems, the Three-Body Problem and Space Mission Design (online edition, 12 October 2022)', url:'https://ross.aoe.vt.edu/books/Ross_3BodyProblem_Book_2022.pdf', note:{en:'The textbook this guide follows: rotating frame, effective potential and Hill\'s region; the quintic for L1 and L2 and its series; worked Sun–Jupiter values (Hill radius 6.825 × 10⁻², γ₁ = 6.668 × 10⁻², L1 at x = 0.9324); Sun–Earth L1 at 1.001090475 × 10⁻² (1.497610041 million km) with frequencies 2.086453455 and 2.0152105515; stability limit μ ≈ 0.038521; Euler (1767) and Lagrange (1772) credited separately; Clarke (1950) and Farquhar (1966) on the lunar relay and the name “halo orbit”.', ru:'Учебник, которому следует этот справочник: вращающаяся система, эффективный потенциал и область Хилла; уравнение пятой степени для L1 и L2 и его разложение в ряд; пример для системы Солнце — Юпитер (радиус Хилла 6,825 × 10⁻², γ₁ = 6,668 × 10⁻², L1 при x = 0,9324); L1 системы Солнце — Земля на 1,001090475 × 10⁻² (1,497610041 млн км) с частотами 2,086453455 и 2,0152105515; граница устойчивости μ ≈ 0,038521; раздельное упоминание заслуг Эйлера (1767) и Лагранжа (1772); Кларк (1950) и Фаркуар (1966) — о лунном ретрансляторе и названии «гало-орбита».'}},
  {title:'L. Euler, “De motu rectilineo trium corporum se mutuo attrahentium” (E327), Novi Commentarii academiae scientiarum Petropolitanae 11 (1767), 144–151 — The Euler Archive', url:'https://scholarlycommons.pacific.edu/euler-works/327/', note:{en:'Written in 1763, published in 1767: the three-body problem on a straight line.', ru:'Написана в 1763 году, опубликована в 1767-м: задача трёх тел на прямой.'}},
  {title:'S. R. Bistafa (2021), A translation of L. Euler\'s “On the rectilinear motion of three bodies mutually attracting each other”, arXiv:2104.13373', url:'https://arxiv.org/abs/2104.13373', note:{en:'Annotated English translation of E327; the spacing of the three bodies is the root of a quintic. Euler does not say in so many words that the line of bodies can rotate rigidly; later readers drew that conclusion.', ru:'Комментированный английский перевод E327; расстояния между тремя телами определяются корнем уравнения пятой степени. Сам Эйлер прямо не пишет, что прямая с телами может вращаться как целое; этот вывод сделали позднейшие читатели.'}},
  {title:'NASA Science, “What is a Lagrange Point?” (27 March 2018, updated 1 November 2024)', url:'https://science.nasa.gov/resource/what-is-a-lagrange-point/', note:{en:'Lagrange\'s 1772 “Essai sur le Problème des Trois Corps”; L1 and L2 unstable on a time scale of about 23 days; L4 and L5 stable when the mass ratio exceeds 24.96; L3 hidden behind the Sun.', ru:'«Опыт о задаче трёх тел» Лагранжа (1772); L1 и L2 неустойчивы на временах около 23 сут; L4 и L5 устойчивы, если отношение масс больше 24,96; L3 скрыта за Солнцем.'}},
  {title:'B. Sicardy (2010), “Stability of the triangular Lagrange points beyond Gascheau\'s value”, Celestial Mechanics and Dynamical Astronomy 107, 145–155', url:'https://doi.org/10.1007/s10569-010-9259-5', note:{en:'The stability limit 0.0385208… is due to Gabriel Gascheau, professor at Toulouse (thesis published in Paris, 1843); it is also known as Routh\'s value, after Routh (1875), who extended the result to a general law of attraction. Special mass ratios below the limit behave differently in the full equations.', ru:'Граница устойчивости 0,0385208… найдена Габриэлем Гашо, профессором в Тулузе (диссертация издана в Париже в 1843 году); её называют также значением Рауса — по работе Рауса (1875), распространившего результат на общий закон притяжения. При особых отношениях масс ниже границы полные уравнения ведут себя иначе.'}},
  {title:'NASA NSSDCA, Planetary Fact Sheets (Sun, Earth, Moon, Jupiter, Pluto)', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note:{en:'Masses (Sun 1,988,400; Earth 5.9722; Moon 0.07346; Jupiter 1,898.13; Pluto 0.01303 × 10²⁴ kg; Charon 1.586 × 10²¹ kg), separations (149.598 and 778.479 million km; 384,400 km; 19,596 km) and periods (365.256, 4,332.589, 27.3217 and 6.3872 days; synodic month 29.53 days). Retrieved 14 November 2026.', ru:'Массы (Солнце 1 988 400; Земля 5,9722; Луна 0,07346; Юпитер 1898,13; Плутон 0,01303 × 10²⁴ кг; Харон 1,586 × 10²¹ кг), расстояния (149,598 и 778,479 млн км; 384 400 км; 19 596 км) и периоды (365,256; 4332,589; 27,3217 и 6,3872 сут; синодический месяц 29,53 сут). Данные получены 14 ноября 2026 года.'}},
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Dates and orbits of ISEE-3, Wind, SOHO, ACE, WMAP, Genesis, Herschel, Planck, ARTEMIS, Chang\'e 2, Gaia, Chang\'e 5-T1, DSCOVR and LISA Pathfinder; the “firsts” at each libration point; Hiten\'s passes through the Earth–Moon L4 and L5 regions.', ru:'Даты и орбиты ISEE-3, Wind, SOHO, ACE, WMAP, Genesis, «Гершеля», «Планка», ARTEMIS, «Чанъэ-2», «Гайи», «Чанъэ-5-T1», DSCOVR и LISA Pathfinder; первые аппараты у каждой точки либрации; проходы аппарата «Хитэн» через окрестности L4 и L5 системы Земля — Луна.'}},
  {title:'C. E. Roberts (2011), “Long Term Missions at the Sun-Earth Libration Point L1: ACE, SOHO, and WIND”, NASA NTRS 20110008638', url:'https://ntrs.nasa.gov/citations/20110008638', note:{en:'SOHO\'s halo orbit repeats about every 178 days; station-keeping cost doubles about every 16 days of delay; burns about every three months; about 1.0 m/s per year for ACE and Wind, less for SOHO.', ru:'Гало-орбита SOHO повторяется примерно каждые 178 сут; затраты на коррекцию удваиваются примерно за 16 сут промедления; коррекции — примерно раз в три месяца; около 1,0 м/с в год для ACE и Wind, меньше для SOHO.'}},
  {title:'D. C. Folta, M. A. Woodard, D. Cosgrove (2011), “Stationkeeping of the First Earth-Moon Libration Orbiters: The ARTEMIS Mission”, AAS 11-515, NASA NTRS 20110015252', url:'https://ntrs.nasa.gov/citations/20110015252', note:{en:'P1 and P2 entered Earth–Moon Lissajous orbits on 25 August and 22 October 2010 and left for lunar orbit on 27 June and 17 July 2011; manoeuvres about weekly; projected cost 7.39 m/s per year at L2 and 5.28 at L1 for P1, 5.09 for P2.', ru:'P1 и P2 вышли на орбиты Лиссажу в системе Земля — Луна 25 августа и 22 октября 2010 года и ушли на окололунные орбиты 27 июня и 17 июля 2011 года; коррекции примерно раз в неделю; расчётные затраты 7,39 м/с в год у L2 и 5,28 у L1 для P1, 5,09 для P2.'}},
  {title:'D. C. Davis, F. S. Khoury, K. C. Howell, D. J. Sweeney (2020), “Phase Control and Eclipse Avoidance in Near Rectilinear Halo Orbits”, NASA NTRS 20200000733', url:'https://ntrs.nasa.gov/citations/20200000733', note:{en:'Gateway\'s baseline 9:2 southern L2 near-rectilinear halo orbit: mean period 6.56 days, perilune radius about 3,366 km, apolune about 71,100 km; simulated orbit maintenance about 0.9–1.0 m/s per year in the baseline case; 0.43 with the best navigation and no wheel desaturations, about 4 in the worst case studied.', ru:'Базовая для Gateway южная почти прямолинейная гало-орбита семейства L2 с резонансом 9:2: средний период 6,56 сут, радиус периселения около 3366 км, апоселения — около 71 100 км; расчётные затраты на поддержание около 0,9–1,0 м/с в год в базовом варианте; 0,43 при наилучшей навигации без разгрузок маховиков и около 4 в худшем из рассмотренных случаев.'}},
  {title:'D. Folta, F. Vaughn (2004), “A Survey of Earth-Moon Libration Orbits: Stationkeeping Strategies and Intra-Orbit Transfers”, NASA NTRS 20040171140', url:'https://ntrs.nasa.gov/citations/20040171140', note:{en:'Earlier studies put costs from centimetres per second per year at L3, L4 and L5 to tens or hundreds of metres per second at the Moon\'s L1 and L2.', ru:'Ранние оценки затрат: от сантиметров в секунду в год у L3, L4 и L5 до десятков и сотен метров в секунду у лунных L1 и L2.'}},
  {title:'NASA Science, Webb: Orbit', url:'https://science.nasa.gov/mission/webb/orbit/', note:{en:'Webb is 1.5 million km from Earth, on an orbit around L2 about the size of the Moon\'s orbit that takes about six months and keeps it out of the shadows of Earth and Moon.', ru:'«Уэбб» находится в 1,5 млн км от Земли, на орбите вокруг L2 размером примерно с орбиту Луны; оборот занимает около полугода, и телескоп не попадает в тень Земли и Луны.'}},
  {title:'J. Logan, A. K. Verma, S. Cavanaugh, A. Yu, “James Webb Space Telescope Navigation Optimization Challenges” (abstract), NASA NTRS 20230018630', url:'https://ntrs.nasa.gov/citations/20230018630', note:{en:'Launch on 25 December 2021; insertion into the L2 libration orbit on 24 January 2022; station-keeping thrust along the Sun line.', ru:'Старт 25 декабря 2021 года; выход на орбиту у L2 24 января 2022 года; корректирующие импульсы — вдоль направления на Солнце.'}},
  {title:'ESA, “What are Lagrange points?”', url:'https://www.esa.int/Enabling_Support/Operations/What_are_Lagrange_points', note:{en:'L1 and L2 lie 1.5 million km from Earth; SOHO at L1; Herschel, Planck, Gaia and Webb at L2.', ru:'L1 и L2 лежат в 1,5 млн км от Земли; SOHO у L1; «Гершель», «Планк», «Гайя» и «Уэбб» у L2.'}},
  {title:'ESA, Gaia: Spacecraft passivation (27 March 2025)', url:'https://www.cosmos.esa.int/web/gaia/spacecraft-passivation', note:{en:'Gaia was switched off on 27 March 2025 and placed in an orbit around the Sun.', ru:'«Гайя» выключена 27 марта 2025 года и переведена на орбиту вокруг Солнца.'}},
  {title:'ISRO, “Halo-Orbit Insertion of Aditya-L1 Successfully Accomplished” (6 January 2024)', url:'https://www.isro.gov.in/halo-orbit-insertion-adtya-l1.html', note:{en:'Launched by PSLV-C57 on 2 September 2023; halo-orbit insertion on 6 January 2024; orbital period about 177.86 days.', ru:'Запуск «Адитьи-L1» ракетой PSLV-C57 2 сентября 2023 года; выход на гало-орбиту 6 января 2024 года; период около 177,86 сут.'}},
  {title:'Johns Hopkins APL (12 January 2026), “NASA\'s IMAP Arrives at L1”', url:'https://www.jhuapl.edu/news/news-releases/260112-imap-arrives-l1', note:{en:'Launched on 24 September 2025; final manoeuvre into orbit around L1 confirmed on 10 January 2026.', ru:'Старт 24 сентября 2025 года; завершающий манёвр выхода на орбиту у L1 подтверждён 10 января 2026 года.'}},
  {title:'NOAA NESDIS, SOLAR-1 (SWFO-L1) press kit', url:'https://www.nesdis.noaa.gov/our-satellites/future-programs/swfo/solar-1-press-kit', note:{en:'SWFO-L1 launched with IMAP and the Carruthers Geocorona Observatory on 24 September 2025, made its final burn at L1 on 23 January 2026 and was renamed SOLAR-1.', ru:'SWFO-L1 запущен вместе с IMAP и обсерваторией Carruthers 24 сентября 2025 года, 23 января 2026 года выполнил завершающее включение двигателя у L1 и переименован в SOLAR-1.'}},
  {title:'NASA Science, Roman Space Telescope: launch (updated 8 September 2026)', url:'https://science.nasa.gov/mission/roman-space-telescope/roman-launch/', note:{en:'Launched on a Falcon Heavy at 7:26 a.m. EDT on 30 August 2026 on a three-month journey to an orbit around Sun–Earth L2.', ru:'Запущен ракетой Falcon Heavy 30 августа 2026 года в 7:26 по летнему восточному времени США; перелёт к орбите у точки L2 системы Солнце — Земля занимает три месяца.'}},
  {title:'NASA, CAPSTONE (updated 26 June 2026)', url:'https://www.nasa.gov/capstone/', note:{en:'Launched on 28 June 2022; first orbit-insertion manoeuvre on 13 November 2022; the first spacecraft in a cislunar near-rectilinear halo orbit.', ru:'Старт 28 июня 2022 года; первый манёвр выхода на орбиту 13 ноября 2022 года; первый аппарат на окололунной почти прямолинейной гало-орбите.'}},
  {title:'L. Xu (15 June 2018), “How China\'s lunar relay satellite arrived in its final orbit”, The Planetary Society', url:'https://www.planetary.org/articles/20180615-queqiao-orbit-explainer', note:{en:'Queqiao was launched at 21:28 UTC on 20 May 2018 (21 May in Beijing), completed its last burn on 14 June 2018 and entered its halo orbit around Earth–Moon L2, about 65,000 km from the Moon.', ru:'«Цюэцяо» запущен 20 мая 2018 года в 21:28 UTC (21 мая по пекинскому времени), 14 июня 2018 года выполнил последнее включение двигателя и вышел на гало-орбиту у точки L2 системы Земля — Луна, примерно в 65 000 км от Луны.'}},
  {title:'IAU Minor Planet Center, Lists of Trojan minor planets (lists dated 30 May 2026)', url:'https://www.minorplanetcenter.net/iau/lists/Trojans.html', note:{en:'Jupiter: 9,823 at L4 and 5,942 at L5; Mars: 2 and 16; Neptune: 28 and 7; Earth: one, 2020 XL5 at L4 (2010 TK7 is not on the list). Retrieved 14 November 2026.', ru:'Юпитер: 9823 у L4 и 5942 у L5; Марс: 2 и 16; Нептун: 28 и 7; Земля: один, 2020 XL5 у L4 (2010 TK7 в списке нет). Данные получены 14 ноября 2026 года.'}},
  {title:'NASA JPL Small-Body Database, 588 Achilles', url:'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=588', note:{en:'Discovered on 22 February 1906 by Max Wolf at Heidelberg.', ru:'Открыт 22 февраля 1906 года Максом Вольфом в Гейдельберге.'}},
  {title:'H. J. Fleming, D. P. Hamilton (2000), “On the Origin of the Trojan Asteroids: Effects of Jupiter\'s Mass Accretion and Radial Migration”, Icarus 148, 479–493', url:'https://doi.org/10.1006/icar.2000.6523', note:{en:'The libration period of a Trojan is about 150 years for Jupiter\'s present mass.', ru:'Период либрации троянца при нынешней массе Юпитера — около 150 лет.'}},
  {title:'M. Connors, P. Wiegert, C. Veillet (2011), “Earth\'s Trojan asteroid”, Nature 475, 481–483', url:'https://doi.org/10.1038/nature10233', note:{en:'2010 TK7, the first Earth Trojan found, librates around the leading point L4.', ru:'2010 TK7 — первый обнаруженный троянец Земли; либрирует вокруг передней точки L4.'}},
  {title:'T. Santana-Ros et al. (2022), “Orbital stability analysis and photometric characterization of the second Earth Trojan asteroid 2020 XL5”, Nature Communications 13, 447', url:'https://doi.org/10.1038/s41467-022-27988-4', note:{en:'2020 XL5 confirmed as the second Earth Trojan; it will stay at L4 for at least 4,000 years.', ru:'2020 XL5 подтверждён как второй троянец Земли; он останется у L4 не менее 4000 лет.'}},
  {title:'NASA Science, Lucy', url:'https://science.nasa.gov/mission/lucy/', note:{en:'Launched on 16 October 2021; flew past Dinkinesh on 1 November 2023 and Donaldjohanson on 20 April 2025; Trojan flybys planned from Eurybates on 11 August 2027 to Patroclus on 3 March 2033; eight Trojans in all.', ru:'Старт «Люси» 16 октября 2021 года; пролёты астероидов Динкинеш 1 ноября 2023 года и Дональдджохансон 20 апреля 2025 года; пролёты троянцев запланированы от Эврибата 11 августа 2027 года до Патрокла 3 марта 2033 года; всего восемь троянцев.'}},
  {title:'NASA Science, Saturn\'s moons: Telesto', url:'https://science.nasa.gov/saturn/moons/telesto/', note:{en:'Telesto and Calypso circle Saturn in the same orbit as Tethys; Calypso follows about 60° behind.', ru:'Телесто и Калипсо обращаются вокруг Сатурна по орбите Тефии; Калипсо следует примерно в 60° позади.'}},
  {title:'NASA Marshall Space Flight Center, ART-XC on Spektr-RG', url:'https://wwwastro.msfc.nasa.gov/artxc/', note:{en:'The Russian–German Spektr-RG observatory was launched from Baikonur on 13 July 2019 and works in a halo orbit about Sun–Earth L2.', ru:'Российско-германская обсерватория «Спектр-РГ» запущена с Байконура 13 июля 2019 года и работает на гало-орбите у точки L2 системы Солнце — Земля.'}},
  {title:'ESA, Vigil', url:'https://www.esa.int/Space_Safety/Vigil', note:{en:'Space-weather mission to Sun–Earth L5, planned for launch in 2031 (page read 14 November 2026).', ru:'Миссия по наблюдению космической погоды из точки L5 системы Солнце — Земля; запуск запланирован на 2031 год (страница прочитана 14 ноября 2026 года).'}},
  {title:'N. L. Parrish et al. (2020), “Near Rectilinear Halo Orbit Determination with Simulated DSN Observations”, NASA NTRS 20200011550', url:'https://ntrs.nasa.gov/citations/20200011550', note:{en:'Near-rectilinear halo orbits are a subset of the L1 and L2 halo families; the 9:2 orbit is slightly unstable and can be held for a few metres per second per year.', ru:'Почти прямолинейные гало-орбиты — часть семейств гало-орбит у L1 и L2; орбита 9:2 слабо неустойчива, и на её поддержание хватает нескольких метров в секунду в год.'}},
  {title:'D. Folta, M. Woodard, NASA Goddard Space Flight Center (14 September 2010), “ARTEMIS – The First Earth-Moon Libration Orbiter” (as reposted by Phys.org)', url:'https://phys.org/news/2010-09-artemis-earth-moon-libration-orbiter.html', note:{en:'The Moon\'s L1 and L2 are “each about 61,300 km (38,100 miles) above the lunar surface”; one revolution about either point takes 14 to 15 days.', ru:'Лунные L1 и L2 — «каждая примерно в 61 300 км (38 100 миль) над поверхностью Луны»; оборот вокруг любой из точек занимает 14–15 сут.'}},
  {title:'Xinhua via China Aerospace Science and Technology Corporation (2018), “China launches relay satellite to explore Moon\'s far side”', url:'https://english.spacechina.com/n17212/c1872815/content.html', note:{en:'Queqiao is to enter a halo orbit around the Earth–Moon L2 point, about 455,000 km from Earth, as “the world\'s first communication satellite operating in that orbit”.', ru:'«Цюэцяо» должен выйти на гало-орбиту у точки L2 системы Земля — Луна, примерно в 455 000 км от Земли, как «первый в мире спутник связи, работающий на такой орбите».'}},
  {title:'K. C. Howell, J. V. Breakwell (1984), “Almost rectilinear halo orbits”, Celestial Mechanics 32, 29–52', url:'https://doi.org/10.1007/BF01358402', note:{en:'The near-rectilinear end of the halo families. The textbook [1] credits the study of halo families to Breakwell and Brown (1979), Howell and Breakwell (1984) and Howell (1984).', ru:'Почти прямолинейный край семейств гало-орбит. В учебнике [1] изучение семейств гало-орбит связывается с работами Брейкуэлла и Брауна (1979), Хауэлл и Брейкуэлла (1984) и Хауэлл (1984).'}},
  {title:'ESA (18 July 2017), “Last command” (LISA Pathfinder)', url:'https://www.esa.int/ESA_Multimedia/Images/2017/07/Last_command', note:{en:'The final command was sent to LISA Pathfinder at 19:57 CEST on 18 July 2017, shutting it down for good.', ru:'Последняя команда отправлена на LISA Pathfinder 18 июля 2017 года в 19:57 по центральноевропейскому летнему времени; аппарат окончательно выключен.'}},
  {title:'Max Planck Institute for Extraterrestrial Physics (22 October 2019), eROSITA first light (Spektr-RG at L2)', url:'https://www.mpe.mpg.de/7362095/news20191022', note:{en:'Spektr-RG completed its 1.5 million km journey to Sun–Earth L2 on 21 October 2019, 100 days after launch, and entered its orbit around the point.', ru:'«Спектр-РГ» 21 октября 2019 года, через 100 суток после старта, завершил перелёт в 1,5 млн км к точке L2 системы Солнце — Земля и вышел на орбиту вокруг неё.'}},
  {title:'ESA, Euclid mission page and news archive 2023', url:'https://www.esa.int/Science_Exploration/Space_Science/Euclid', note:{en:'Launched on 1 July 2023 on a Falcon 9 to Sun–Earth L2. ESA\'s Euclid news of 28 July 2023 (cosmos.esa.int/web/euclid/news-archive-2023) reports that it had by then “arrived” at its destination orbit.', ru:'Запущен 1 июля 2023 года ракетой Falcon 9 к точке L2 системы Солнце — Земля. В новостях ЕКА о Euclid от 28 июля 2023 года (cosmos.esa.int/web/euclid/news-archive-2023) сообщается, что к этому дню аппарат «прибыл» на рабочую орбиту.'}},
  {title:'NASA Roman blog (14 September 2026), “Fuel Savings Double Potential Lifetime for NASA\'s Roman Mission”', url:'https://science.nasa.gov/blogs/roman/2026/09/14/fuel-savings-double-potential-lifetime-for-nasas-roman-mission/', note:{en:'Roman is to manoeuvre into its final orbit at L2 “approximately 100 days after launch, or about early December”.', ru:'Roman должен выйти на рабочую орбиту у L2 «примерно через 100 суток после старта, то есть в начале декабря».'}},
  {title:'CGTN via China Aerospace Science and Technology Corporation (updated 9 February 2026), “China to launch first-ever solar probe at Sun-Earth L5 point”', url:'https://english.spacechina.com/n17212/c4541181/content.html', note:{en:'China plans to launch the Xihe-2 solar observatory to the Sun–Earth L5 point between 2028 and 2029.', ru:'Китай планирует в 2028–2029 годах запустить солнечную обсерваторию «Сихэ-2» к точке L5 системы Солнце — Земля.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', T(el.getAttribute('data-aria-en'), el.getAttribute('data-aria-ru'))); });
  renderMap(); renderSolver(); renderTri(); renderSK(); renderMissions();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__equilibrium = {growth:growth, GROWTH_CEIL:GROWTH_CEIL, l2Cover:l2Cover, MOON_PERIGEE:MOON_PERIGEE, MOON_APOGEE:MOON_APOGEE, R_SUN:R_SUN, R_EARTH:R_EARTH, SYS:SYS, MASS:MASS, SYNODIC_MONTH:SYNODIC_MONTH, omega:omega, jacobi:jacobi, dOmegaX:dOmegaX, gradOmega:gradOmega, lpoints:lpoints, quintic:quintic, hill:hill, series3:series3, l3lead:l3lead, collinEig:collinEig, triEig:triEig, MU_CRIT:MU_CRIT, triPath:triPath, efoldDays:efoldDays, periodDays:periodDays, propellant:propellant, daysBetween:daysBetween, contour:contour, critC:critC, regime:regime, SK:SK, skTau:skTau, MISSIONS:MISSIONS, MPC:MPC, REFERENCES:REFERENCES, TIMELINE:TIMELINE, G0:G0};
