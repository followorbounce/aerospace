/* ============ CONSTANTS (NASA planetary fact sheets) ============ */
var GM_SUN = 1.32712e11;                                     // km³/s²
var PL = {
  mercury:{en:'Mercury', ru:'Меркурий', mu:22032,     R:2440.5,  a:57.909e6},
  venus:  {en:'Venus',   ru:'Венера',   mu:324860,    R:6051.8,  a:108.210e6},
  earth:  {en:'Earth',   ru:'Земля',    mu:398600,    R:6378.137,a:149.598e6, M:5.9722e24},
  jupiter:{en:'Jupiter', ru:'Юпитер',   mu:126687000, R:71492,   a:778.479e6, M:1898.13e24},
  saturn: {en:'Saturn',  ru:'Сатурн',   mu:37931000,  R:60268,   a:1432.041e6},
  uranus: {en:'Uranus',  ru:'Уран',     a:2867.043e6},
  neptune:{en:'Neptune', ru:'Нептун',   a:4514.953e6}
};
var YEAR = 365.25*86400;
function vCirc(a){ return Math.sqrt(GM_SUN/a); }            // planet speed, circular-orbit model
function vEsc(r){ return Math.sqrt(2*GM_SUN/r); }

/* Turn angle of a hyperbolic flyby: δ = 2·asin(1/e), e = 1 + r_p v∞²/μ */
function ecc(mu, rp, vinf){ return 1 + rp*vinf*vinf/mu; }
function turn(mu, rp, vinf){ return 2*Math.asin(1/ecc(mu, rp, vinf)); }
function vPeri(mu, rp, vinf){ return Math.sqrt(vinf*vinf + 2*mu/rp); }
/* Size of the velocity change (same in every frame): |Δv| = 2 v∞ sin(δ/2) = 2 v∞ / e */
function dvVec(mu, rp, vinf){ return 2*vinf*Math.sin(turn(mu, rp, vinf)/2); }

function add(a, b){ return [a[0] + b[0], a[1] + b[1]]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1]]; }
function len(a){ return Math.hypot(a[0], a[1]); }
function rot(a, t){ var c = Math.cos(t), s = Math.sin(t); return [a[0]*c - a[1]*s, a[0]*s + a[1]*c]; }

/* In-plane flyby. vin: heliocentric velocity, Vp: planet velocity (km/s vectors).
   Gravity pulls toward the planet, so Δv = u_out − u_in points from closest approach to the planet's centre.
   Because |u_in| = |u_out|:  |v_out|² − |v_in|² = 2 Vp·Δv  — exactly.
   side = +1: closest approach BEHIND the planet (Δv along its motion: speeds up);
   side = −1: IN FRONT of it (Δv against its motion: slows down). */
function flyby(vin, Vp, mu, rp, side){
  var u = sub(vin, Vp), vinf = len(u), d = turn(mu, rp, vinf);
  var a = rot(u, d), b = rot(u, -d);
  var ga = Vp[0]*(a[0] - u[0]) + Vp[1]*(a[1] - u[1]), gb = Vp[0]*(b[0] - u[0]) + Vp[1]*(b[1] - u[1]);
  var dir = (side > 0 ? ga >= gb : ga <= gb) ? 1 : -1;        // +1 = counter-clockwise; if both ways pass on the same side, take the one closer to the request
  var uo = dir > 0 ? a : b, vout = add(Vp, uo);
  return {u:u, uo:uo, vinf:vinf, d:d, dir:dir, vout:vout, vin:vin, sIn:len(vin), sOut:len(vout), gain:len(vout) - len(vin), dv:len(sub(uo, u))};
}

/* Exact 1-D elastic collision (ball m, v1; train M, v2). Δv2 is computed directly to keep tiny values exact. */
function bounce(m, v1, M, v2){
  var f = m/M;                                                 // mass ratio, may be ~1e-24
  var v1p = ((f - 1)*v1 + 2*v2)/(f + 1), dv2 = 2*f*(v1 - v2)/(f + 1);
  return {v1p:v1p, dv2:dv2, v2p:v2 + dv2};
}

/* Heliocentric orbit from 1 AU (tangential departure with excess speed vinfE) out to radius r */
function departState(vinfE, r){
  var rE = PL.earth.a, v0 = vCirc(rE) + vinfE, h = rE*v0, eps = v0*v0/2 - GM_SUN/rE;
  var v2 = 2*(eps + GM_SUN/r); if(v2 <= 0) return null;
  var vt = h/r, vr2 = v2 - vt*vt; if(vr2 < -1e-9) return null;
  return {v:Math.sqrt(v2), vt:vt, vr:Math.sqrt(Math.max(0, vr2)), h:h, eps:eps};
}
/* Orbit elements from position radius r and velocity (vt, vr) */
function conic(r, vt, vr){
  var v2 = vt*vt + vr*vr, eps = v2/2 - GM_SUN/r, h = r*vt;
  var e = Math.sqrt(Math.max(0, 1 + 2*eps*h*h/(GM_SUN*GM_SUN)));
  var p = h*h/GM_SUN, rper = p/(1 + e), rap = e < 1 ? p/(1 - e) : Infinity;
  return {eps:eps, h:h, e:e, rper:rper, rap:rap};
}
/* Earth → Jupiter → out, one in-plane flyby; returns null if the launch can't reach Jupiter */
function viaJupiter(vinfE, rpRJ, side){
  var J = PL.jupiter, rJ = J.a, s = departState(vinfE, rJ); if(!s) return null;
  var VJ = vCirc(rJ), vin = [s.vt, s.vr], f = flyby(vin, [VJ, 0], J.mu, rpRJ*J.R, side);
  var vt = f.vout[0], vr = f.vout[1], c = conic(rJ, vt, vr);
  f.state = s; f.esc = vEsc(rJ); f.after = c; f.VJ = VJ; f.bound = c.eps < 0;
  return f;
}
/* Hohmann transfer from Earth: departure v∞ and time of flight */
function hohmann(rTo){
  var r1 = PL.earth.a, a = (r1 + rTo)/2;
  return {vinf:Math.sqrt(GM_SUN*(2/r1 - 1/a)) - vCirc(r1), tof:Math.PI*Math.sqrt(a*a*a/GM_SUN), arrive:Math.sqrt(GM_SUN*(2/rTo - 1/a))};
}
/* Voyager 2: launch 20 Aug 1977; Jupiter 9 Jul 1979; Saturn 25 Aug 1981; Uranus 24 Jan 1986; Neptune 25 Aug 1989 */
var V2_LAUNCH = Date.UTC(1977, 7, 20);
var V2 = {jupiter:Date.UTC(1979, 6, 9), saturn:Date.UTC(1981, 7, 25), uranus:Date.UTC(1986, 0, 24), neptune:Date.UTC(1989, 7, 25)};
function v2years(k){ return (V2[k] - V2_LAUNCH)/1000/YEAR; }

/* ============ CH2 — THE TURN ============ */
var tPlanet = 'earth', tAlt = null;
var tV = document.getElementById('tV'), tA = document.getElementById('tA'), tH = document.getElementById('tH');
function altFromSlider(R){ return R*Math.pow(10, -2 + 3.5*(+tH.value)/1000); }
function sliderFromAlt(R, h){ return Math.round((Math.log10(h/R) + 2)/3.5*1000); }
function bestAngle(P, vinf, rp, side){                          // approach direction giving the largest gain
  var V = [vCirc(P.a), 0], best = -1e9, ba = 0;
  for(var a = 0; a < 360; a += 0.5){
    var th = a*Math.PI/180, f = flyby(add(V, [vinf*Math.cos(th), vinf*Math.sin(th)]), V, P.mu, rp, side);
    var g = side > 0 ? f.gain : -f.gain;
    if(g > best){ best = g; ba = a; }
  }
  return ba;
}
var tSide = 1;
function arrow(svg, x1, y1, x2, y2, col, w, dash){
  var L = Math.hypot(x2 - x1, y2 - y1); if(L < 0.5) return;
  ns('line', {x1:x1, y1:y1, x2:x2, y2:y2, stroke:col, 'stroke-width':w || 2, 'stroke-dasharray':dash || ''}, svg);
  var ang = Math.atan2(y2 - y1, x2 - x1), hl = Math.min(9, L*0.4);
  ns('path', {d:'M' + x2 + ',' + y2 + ' L' + (x2 - hl*Math.cos(ang - 0.4)) + ',' + (y2 - hl*Math.sin(ang - 0.4)) + ' L' + (x2 - hl*Math.cos(ang + 0.4)) + ',' + (y2 - hl*Math.sin(ang + 0.4)) + ' Z', fill:col}, svg);
}
function renderTurn(){
  var P = PL[tPlanet], vinf = +tV.value, th = (+tA.value)*Math.PI/180;
  var h = tAlt !== null ? tAlt : altFromSlider(P.R), rp = P.R + h;
  var V = [vCirc(P.a), 0], vin = add(V, [vinf*Math.cos(th), vinf*Math.sin(th)]);
  var f = flyby(vin, V, P.mu, rp, tSide), e = ecc(P.mu, rp, vinf);
  document.getElementById('tVVal').textContent = fmt(vinf, 2) + T(' km/s',' км/с');
  document.getElementById('tAVal').textContent = fmtInt(+tA.value) + '°';
  document.getElementById('tHVal').textContent = (h < 10000 ? fmtInt(h) : fmt(h/1000, 0) + T(' thousand',' тыс.')) + T(' km',' км');
  tV.setAttribute('aria-valuetext', document.getElementById('tVVal').textContent);
  tA.setAttribute('aria-valuetext', document.getElementById('tAVal').textContent);
  tH.setAttribute('aria-valuetext', document.getElementById('tHVal').textContent);
  var svg = document.getElementById('turnSvg'); svg.innerHTML = '';
  /* left: path past the planet, in the planet's frame, to scale */
  var cx = 118, cy = 150, f8 = Math.acos(-1/e), p = rp*(1 + e), rMax = Math.max(6*rp, 2.6*P.R), sc = 100/rMax;
  var phiIn = Math.atan2(e - 1/e, Math.sin(f8));               // incoming velocity direction in the perifocal frame
  var mir = f.dir, base = Math.atan2(f.u[1], f.u[0]);
  function toS(x, y){ var yy = y*mir, q = rot([x, yy], base - mir*phiIn); return [cx + q[0]*sc, cy - q[1]*sc]; }
  ns('rect', {x:6, y:6, width:224, height:288, fill:'none', stroke:'#c9c9c1'}, svg);
  txt(svg, 14, 22, T('PLANET\'S VIEW (to scale)','ВИД ОТ ПЛАНЕТЫ (в масштабе)'), 'svg-small');
  ns('circle', {cx:cx, cy:cy, r:Math.max(2, P.R*sc), fill:'#a8741a'}, svg);
  var d = '', first = true;
  for(var k = 0; k <= 240; k++){
    var nu = -f8*0.999 + 2*f8*0.999*k/240, r = p/(1 + e*Math.cos(nu)); if(r > rMax*1.5) continue;
    var s = toS(r*Math.cos(nu), r*Math.sin(nu)); d += (first ? 'M' : 'L') + s[0].toFixed(1) + ',' + s[1].toFixed(1); first = false;
  }
  var clip = ns('clipPath', {id:'pvClip'}, ns('defs', {}, svg)); ns('rect', {x:7, y:30, width:222, height:263}, clip);  // keep the path off the title and inside the box
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.6, 'clip-path':'url(#pvClip)'}, svg);
  var pp = toS(rp, 0); ns('circle', {cx:pp[0], cy:pp[1], r:3.5, fill:'#b5452a'}, svg);
  arrow(svg, 14, 310, 14 + 46, 310, '#a8741a', 2);
  txt(svg, 66, 314, T('planet moves →','планета движется →'), 'svg-small');
  /* right: velocity triangle in the Sun's frame, fitted inside its box (one scale for all vectors) */
  var xs = [0, V[0], f.vin[0], f.vout[0], V[0] - vinf, V[0] + vinf], ys = [0, V[1], f.vin[1], f.vout[1], V[1] - vinf, V[1] + vinf];
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var vs = Math.min(206/(x1 - x0), 250/(y1 - y0)), bx = 252 + (206 - (x1 - x0)*vs)/2, by = 34 + (250 - (y1 - y0)*vs)/2;
  var ox = bx - x0*vs, oy = by + y1*vs;
  function P2(v){ return [ox + v[0]*vs, oy - v[1]*vs]; }
  ns('rect', {x:240, y:6, width:234, height:288, fill:'none', stroke:'#c9c9c1'}, svg);
  txt(svg, 248, 22, T('SUN\'S VIEW (velocities)','ВИД ОТ СОЛНЦА (скорости)'), 'svg-small');
  var pv = P2(V), pi = P2(f.vin), po = P2(f.vout);
  arrow(svg, ox, oy, pv[0], pv[1], '#a8741a', 2.5);
  arrow(svg, pv[0], pv[1], pi[0], pi[1], '#7a7a74', 1.6, '4 3');
  arrow(svg, pv[0], pv[1], po[0], po[1], '#2f5aa1', 1.6, '4 3');
  arrow(svg, ox, oy, pi[0], pi[1], '#7a7a74', 2);
  arrow(svg, ox, oy, po[0], po[1], '#2f5aa1', 2.5);
  ns('circle', {cx:pv[0], cy:pv[1], r:vinf*vs, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, 248, 314, T('gold: planet · grey: in · blue: out','золото: планета · серый: до · синий: после'), 'svg-small');
  txt(svg, 248, 328, T('dashed: v∞ seen by the planet','пунктир: v∞ относительно планеты'), 'svg-small');
  txt(svg, 248, 342, T('dotted: same v∞, any direction','точки: тот же v∞, любое направление'), 'svg-small');
  cells(document.getElementById('turnReadout'), [
    [T('TURN ANGLE δ','УГОЛ ПОВОРОТА δ'), fmt(f.d*180/Math.PI, 1) + '°'],
    [T('SPEED AT CLOSEST APPROACH','СКОРОСТЬ В ПЕРИЦЕНТРЕ'), fmt(vPeri(P.mu, rp, vinf), 2) + T(' km/s',' км/с')],
    [T('VELOCITY CHANGE |Δv|','ИЗМЕНЕНИЕ СКОРОСТИ |Δv|'), fmt(f.dv, 2) + T(' km/s',' км/с')],
    [T('PLANET\'S ORBITAL SPEED','ОРБИТАЛЬНАЯ СКОРОСТЬ ПЛАНЕТЫ'), fmt(V[0], 2) + T(' km/s',' км/с')],
    [T('SPEED AROUND THE SUN: IN → OUT','СКОРОСТЬ ОТНОСИТЕЛЬНО СОЛНЦА: ДО → ПОСЛЕ'), fmt(f.sIn, 2) + ' → ' + fmt(f.sOut, 2) + T(' km/s',' км/с'), 1],
    [T('GAIN AROUND THE SUN','ПРИБАВКА ОТНОСИТЕЛЬНО СОЛНЦА'), (f.gain >= 0 ? '+' : '') + fmt(f.gain, 2) + T(' km/s',' км/с'), 1]
  ]);
  hud1.textContent = fmt(f.d*180/Math.PI, 0) + '°'; hud2.textContent = (f.gain >= 0 ? '+' : '') + fmt(f.gain, 1) + T(' km/s',' км/с');
  var st = tSide < 0 && f.gain > 0.05
    ? T('From this approach direction, both ways round the planet pass behind it, so the craft speeds up either way. Turn the approach direction to fly in front.','При таком направлении подлёта оба пути вокруг планеты проходят позади неё, и аппарат разгоняется в любом случае. Поверните направление подлёта, чтобы пройти впереди.')
    : tSide > 0 && f.gain < -0.05
      ? T('From this approach direction, both ways round the planet pass in front of it, so the craft slows down either way. Turn the approach direction to pass behind.','При таком направлении подлёта оба пути вокруг планеты проходят перед ней, и аппарат тормозится в любом случае. Поверните направление подлёта, чтобы пройти позади.')
    : Math.abs(f.gain) < 0.05
    ? T('The direction changed, but the speed around the Sun barely did: the turn swung the velocity across the planet\'s motion, not along it.','Направление изменилось, а скорость относительно Солнца почти нет: поворот пришёлся поперёк движения планеты, а не вдоль.')
    : f.gain > 0
      ? T('Relative to the planet the craft leaves exactly as fast as it came (' + fmt(vinf, 2) + ' km/s). Relative to the Sun it gained ' + fmt(f.gain, 2) + ' km/s, because its exit is aimed more along the planet\'s motion.','Относительно планеты аппарат уходит ровно с той же скоростью, с какой пришёл (' + fmt(vinf, 2) + ' км/с). Относительно Солнца он прибавил ' + fmt(f.gain, 2) + ' км/с, потому что выход направлен больше вдоль движения планеты.')
      : T('Passing in front, the exit is aimed against the planet\'s motion: the craft loses ' + fmt(-f.gain, 2) + ' km/s around the Sun. That is how missions brake on the way to Mercury.','Пролёт перед планетой направляет выход против её движения: аппарат теряет ' + fmt(-f.gain, 2) + ' км/с относительно Солнца. Так тормозят миссии на пути к Меркурию.');
  document.getElementById('turnStatus').innerHTML = st;
}
tV.addEventListener('input', renderTurn); tA.addEventListener('input', renderTurn);
tH.addEventListener('input', function(){ tAlt = null; renderTurn(); });
Array.prototype.forEach.call(document.querySelectorAll('#tPlanet .btn'), function(b){
  b.addEventListener('click', function(){ tPlanet = b.dataset.p; tAlt = null; pressGroup(document.getElementById('tPlanet'), b); pressGroup(document.getElementById('tPreset'), null); renderTurn(); });
});
Array.prototype.forEach.call(document.querySelectorAll('#tSide .btn'), function(b){
  b.addEventListener('click', function(){ tSide = +b.dataset.s; pressGroup(document.getElementById('tSide'), b); renderTurn(); });
});
var PRESETS = {cassini:{p:'earth', v:16.01, h:1171}, near:{p:'earth', v:6.851, h:539}, messenger:{p:'earth', v:4.056, h:2347}};
Array.prototype.forEach.call(document.querySelectorAll('#tPreset .btn'), function(b){
  b.addEventListener('click', function(){
    var q = PRESETS[b.dataset.k], P = PL[q.p]; tPlanet = q.p; tSide = 1;
    tV.value = q.v; tAlt = q.h; tH.value = sliderFromAlt(P.R, q.h);
    tA.value = bestAngle(P, q.v, P.R + q.h, 1);
    pressGroup(document.getElementById('tPlanet'), document.querySelector('#tPlanet .btn[data-p="' + q.p + '"]'));
    pressGroup(document.getElementById('tSide'), document.querySelector('#tSide .btn[data-s="1"]'));
    pressGroup(document.getElementById('tPreset'), b); renderTurn();
  });
});
document.getElementById('tBest').addEventListener('click', function(){
  var P = PL[tPlanet], h = tAlt !== null ? tAlt : altFromSlider(P.R);
  tA.value = bestAngle(P, +tV.value, P.R + h, tSide); renderTurn();
});

/* ============ CH3 — THE TRAIN ============ */
var bU = document.getElementById('bU'), bV = document.getElementById('bV'), bM = document.getElementById('bM'), bJup = false, bT = 0;
function bRatio(){ return bJup ? 721.9/PL.jupiter.M : Math.pow(10, -(+bM.value)); }
function renderBounce(){
  var u = +bU.value, V = +bV.value, f = bRatio(), r = bounce(f, u, 1, -V);
  document.getElementById('bUVal').textContent = fmt(u, 1) + T(' km/s',' км/с');
  document.getElementById('bVVal').textContent = fmt(V, 2) + T(' km/s',' км/с');
  document.getElementById('bMVal').textContent = bJup ? T('Voyager 2 : Jupiter','«Вояджер-2» : Юпитер') : '1 : ' + fmtInt(1/f);
  [bU, bV, bM].forEach(function(el){ el.setAttribute('aria-valuetext', document.getElementById(el.id + 'Val').textContent); });
  var dvBall = -r.v1p - u;                                       // extra speed of the ball (km/s)
  var pBefore = f*u - V, pAfter = f*r.v1p + r.v2p;              // momentum per unit train mass
  var eBefore = f*u*u + V*V, eAfter = f*r.v1p*r.v1p + r.v2p*r.v2p;
  var rows = [
    [T('BALL SPEED BEFORE → AFTER','СКОРОСТЬ МЯЧА ДО → ПОСЛЕ'), fmt(u, 2) + ' → ' + fmt(-r.v1p, 2) + T(' km/s',' км/с'), 1],
    [T('BALL GAINS','МЯЧ ПРИБАВИЛ'), (dvBall >= 0 ? '+' : '') + fmt(dvBall, 2) + T(' km/s',' км/с')],
    [T('IDEAL LIMIT u + 2V','ПРЕДЕЛ u + 2V'), fmt(u + 2*V, 2) + T(' km/s',' км/с')],
    [T('TRAIN SLOWS BY','ПОЕЗД ЗАМЕДЛИЛСЯ НА'), sci(r.dv2*1000) + T(' m/s',' м/с'), 1],
    [T('MOMENTUM BEFORE = AFTER','ИМПУЛЬС ДО = ПОСЛЕ'), Math.abs(pAfter - pBefore) <= 1e-9*Math.abs(pBefore) + 1e-15 ? T('conserved','сохраняется') : T('NOT conserved','НЕ сохраняется')],
    [T('ENERGY BEFORE = AFTER','ЭНЕРГИЯ ДО = ПОСЛЕ'), Math.abs(eAfter - eBefore) <= 1e-9*eBefore ? T('conserved','сохраняется') : T('NOT conserved','НЕ сохраняется')]
  ];
  if(bJup){
    /* a planet slowed along its track drops to a slightly smaller orbit: Δa = 2aΔv/v (it then drifts ahead, not behind) */
    var da = orbitShrink(r.dv2);
    rows.push([T('JUPITER\'S ORBIT SHRINKS BY','ОРБИТА ЮПИТЕРА УМЕНЬШИТСЯ НА'), sci(da) + T(' m (about 1/',' м (около 1/') + fmtInt(1e-10/da) + T(' of an atom\'s width)',' ширины атома)'), 1]);
  }
  cells(document.getElementById('bReadout'), rows);
  document.getElementById('bStatus').innerHTML = bJup
    ? T('Every bit of speed the spacecraft gains, Jupiter loses, in proportion to the masses. The books balance exactly; Jupiter\'s side of them is just too small to ever measure.','Каждую долю скорости, которую получает аппарат, теряет Юпитер — пропорционально массам. Баланс сходится точно; просто доля Юпитера слишком мала, чтобы её когда-нибудь измерить.')
    : T('Seen from the train, the ball arrives at u + V and leaves at u + V: a perfect bounce changes only its direction. Seen from the platform, it leaves at ' + fmt(-r.v1p, 2) + ' km/s; the lighter the ball compared with the train, the closer that gets to u + 2V = ' + fmt(u + 2*V, 2) + ' km/s.','С точки зрения поезда мяч прилетает со скоростью u + V и улетает с u + V: идеальный отскок меняет только направление. С точки зрения платформы он улетает со скоростью ' + fmt(-r.v1p, 2) + ' км/с; чем легче мяч по сравнению с поездом, тем ближе это к u + 2V = ' + fmt(u + 2*V, 2) + ' км/с.');
  bGeom = {u:u, V:V, out:-r.v1p};
}
function orbitShrink(dvKm){ return 2*PL.jupiter.a*1e3*dvKm*1000/(vCirc(PL.jupiter.a)*1000); }   // metres
function sci(x){
  if(x === 0) return '0';
  var ex = Math.floor(Math.log10(Math.abs(x))), m = x/Math.pow(10, ex);
  if(ex >= -2 && ex <= 3) return fmt(x, ex >= 1 ? 1 : 3);
  return fmt(m, 2) + ' × 10' + String(ex).replace('-', '⁻').replace(/\d/g, function(c){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
}
var bGeom = null;
function drawBounce(t){
  if(reduced()) t = 1.5;
  var svg = document.getElementById('bSvg'); svg.innerHTML = '';
  ns('line', {x1:10, y1:150, x2:470, y2:150, stroke:'#0b0b0c'}, svg);
  if(!bGeom) return;
  /* one cycle: 0–1 approach, 1–2 depart; positions in a toy scale */
  var cyc = t % 2, sc = 70/Math.max(bGeom.out, 1), hit = 330;
  var trainX = hit - (cyc - 1)*bGeom.V*sc, ballX = cyc < 1 ? hit - (1 - cyc)*bGeom.u*sc*3 : hit - (cyc - 1)*bGeom.out*sc*3;
  ns('rect', {x:trainX, y:110, width:120, height:40, fill:'#a8741a'}, svg);
  txt(svg, trainX + 10, 134, T('TRAIN ←','ПОЕЗД ←'), 'svg-label');
  ns('circle', {cx:Math.max(14, ballX - 10), cy:140, r:10, fill:'#2f5aa1'}, svg);
  txt(svg, 14, 30, reduced() ? T('ball: ','мяч: ') + fmt(bGeom.u, 1) + T(' → in, out ← ',' → до, после ← ') + fmt(bGeom.out, 1) + T(' km/s',' км/с') : T('ball: ','мяч: ') + (cyc < 1 ? fmt(bGeom.u, 1) + ' →' : '← ' + fmt(bGeom.out, 1)) + T(' km/s',' км/с'), 'svg-label');
  txt(svg, 14, 46, T('train: ← ','поезд: ← ') + fmt(bGeom.V, 2) + T(' km/s',' км/с'), 'svg-label');
  txt(svg, 14, 180, T('platform (the Sun\'s) view · toy scale','вид с платформы (от Солнца) · условный масштаб'), 'svg-small');
}
[bU, bV].forEach(function(el){ el.addEventListener('input', function(){ renderBounce(); drawBounce(bT); }); });
bM.addEventListener('input', function(){ bJup = false; pressGroup(document.getElementById('bPre'), null); renderBounce(); drawBounce(bT); });
document.getElementById('bJ').addEventListener('click', function(){ bJup = true; bV.value = 13.06; pressGroup(document.getElementById('bPre'), document.getElementById('bJ')); renderBounce(); drawBounce(bT); });
visibleLoop(document.getElementById('bSvg'), function(dt){ if(reduced()) return; bT += dt*0.6; drawBounce(bT); });

/* ============ CH5 — ESCAPE VIA JUPITER ============ */
var jE = document.getElementById('jE'), jR = document.getElementById('jR'), jSide = 1;
function renderJup(){
  var vE = +jE.value, rpR = +jR.value, f = viaJupiter(vE, rpR, jSide);
  document.getElementById('jEVal').textContent = fmt(vE, 2) + T(' km/s',' км/с');
  document.getElementById('jRVal').innerHTML = fmt(rpR, 2) + ' R<sub>J</sub>';
  jE.setAttribute('aria-valuetext', fmt(vE, 2) + T(' km/s',' км/с'));
  jR.setAttribute('aria-valuetext', fmt(rpR, 2) + T(' Jupiter radii',' радиуса Юпитера'));
  var svg = document.getElementById('jSvg'); svg.innerHTML = '';
  var L = 46, Rr = 470, Tp = 16, B = 230, rMax = 40, vMax = 45;
  function X(rAU){ return L + Math.log10(rAU)/Math.log10(rMax)*(Rr - L); }
  function Y(v){ return B - v/vMax*(B - Tp); }
  [1, 2, 5, 10, 20, 40].forEach(function(a){ ns('line', {x1:X(a), y1:B, x2:X(a), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(a), B + 15, String(a), 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('distance from the Sun, AU (log)','расстояние от Солнца, а. е. (лог.)'), 'svg-small', 'end');
  [0, 10, 20, 30, 40].forEach(function(v){ ns('line', {x1:L - 4, y1:Y(v), x2:L, y2:Y(v), stroke:'#0b0b0c'}, svg); txt(svg, L - 7, Y(v) + 3, String(v), 'svg-small', 'end'); });
  txt(svg, 6, 10, T('km/s','км/с'), 'svg-small');
  ns('line', {x1:L, y1:Tp, x2:L, y2:B, stroke:'#0b0b0c'}, svg); ns('line', {x1:L, y1:B, x2:Rr, y2:B, stroke:'#0b0b0c'}, svg);
  var AU = PL.earth.a, d = '';
  for(var k = 0; k <= 120; k++){ var a = Math.pow(rMax, k/120); d += (k ? 'L' : 'M') + X(a).toFixed(1) + ',' + Y(vEsc(a*AU)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-dasharray':'5 4', 'stroke-width':1.5}, svg);
  txt(svg, X(1.3), Y(vEsc(1.3*AU)) - 6, T('escape from the Sun','уход от Солнца'), 'svg-small');
  ns('line', {x1:X(PL.jupiter.a/AU), y1:Tp, x2:X(PL.jupiter.a/AU), y2:B, stroke:'#c9c9c1'}, svg);
  txt(svg, X(PL.jupiter.a/AU) + 4, Tp + 10, T('Jupiter','Юпитер'), 'svg-small');
  var rows;
  if(!f){
    rows = [[T('RESULT','РЕЗУЛЬТАТ'), T('too slow: this launch never reaches Jupiter\'s orbit','слишком медленно: при таком старте аппарат не долетит до орбиты Юпитера'), 1]];
    document.getElementById('jStatus').innerHTML = T('At least 8.79 km/s beyond Earth\'s own speed is needed even to reach 5.2 AU.','Даже чтобы добраться до 5,2 а. е., нужно не меньше 8,79 км/с сверх собственной скорости Земли.');
    cells(document.getElementById('jReadout'), rows); return;
  }
  /* before the flyby: 1 AU → 5.2 AU */
  var d1 = '';
  for(k = 0; k <= 80; k++){ var r = AU*Math.pow(PL.jupiter.a/AU, k/80), s = departState(vE, r); d1 += (k ? 'L' : 'M') + X(r/AU).toFixed(1) + ',' + Y(s.v).toFixed(1); }
  ns('path', {d:d1, fill:'none', stroke:'#7a7a74', 'stroke-width':2}, svg);
  /* after: from 5.2 AU outward (to aphelion or 40 AU) */
  var c = f.after, rEnd = Math.min(rMax*AU, c.rap*0.9999), d2 = '';
  var rJ = PL.jupiter.a;
  if(rEnd > rJ){
    for(k = 0; k <= 80; k++){ var r2 = rJ*Math.pow(rEnd/rJ, k/80), v = Math.sqrt(2*(c.eps + GM_SUN/r2)); d2 += (k ? 'L' : 'M') + X(r2/AU).toFixed(1) + ',' + Y(v).toFixed(1); }
    ns('path', {d:d2, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.5}, svg);
  }
  ns('line', {x1:X(rJ/AU), y1:Y(f.sIn), x2:X(rJ/AU), y2:Y(f.sOut), stroke:'#2f5aa1', 'stroke-width':2.5}, svg);
  ns('circle', {cx:X(rJ/AU), cy:Y(f.sOut), r:3.5, fill:'#2f5aa1'}, svg);
  var gam = Math.atan2(f.state.vr, f.state.vt)*180/Math.PI;
  rows = [
    [T('ARRIVAL SPEED AT JUPITER','СКОРОСТЬ У ЮПИТЕРА'), fmt(f.sIn, 2) + T(' km/s',' км/с')],
    [T('v∞ RELATIVE TO JUPITER','v∞ ОТНОСИТЕЛЬНО ЮПИТЕРА'), fmt(f.vinf, 2) + T(' km/s',' км/с')],
    [T('TURN ANGLE δ','УГОЛ ПОВОРОТА δ'), fmt(f.d*180/Math.PI, 1) + '°'],
    [T('PATH ANGLE ON ARRIVAL','УГОЛ ТРАЕКТОРИИ'), fmt(gam, 1) + '°'],
    [T('SPEED AFTER vs ESCAPE','СКОРОСТЬ ПОСЛЕ / СКОРОСТЬ УХОДА'), fmt(f.sOut, 2) + ' / ' + fmt(f.esc, 2) + T(' km/s',' км/с'), 1],
    [T('NEW ORBIT','НОВАЯ ОРБИТА'), f.bound ? T('bound · aphelion ','замкнутая · афелий ') + fmt(c.rap/AU, 1) + T(' AU',' а. е.') + T(' · perihelion ',' · перигелий ') + fmt(c.rper/AU, 2) + T(' AU',' а. е.') + (c.rper < 696000 ? T(' — inside the Sun',' — внутри Солнца') : '') : T('hyperbolic: leaves the Solar System, ','гипербола: уходит из Солнечной системы, ') + fmt(Math.sqrt(2*c.eps), 1) + T(' km/s at infinity',' км/с на бесконечности'), 1]
  ];
  cells(document.getElementById('jReadout'), rows);
  document.getElementById('jStatus').innerHTML = jSide < 0 && f.gain > 0
    ? T('Jupiter is overtaking this slow probe from behind, so both ways round pass behind it and the flyby speeds the probe up either way. Launch faster, so it crosses Jupiter\'s orbit at a steeper angle, to be able to pass in front and brake.','Юпитер догоняет этот медленный зонд сзади, поэтому оба пути вокруг него проходят позади планеты, и пролёт разгоняет зонд в любом случае. Стартуйте быстрее, чтобы зонд пересекал орбиту Юпитера круче, — тогда можно пройти впереди и затормозить.')
    : f.bound
    ? (jSide > 0 ? T('Still bound to the Sun. Launch a little faster, or pass closer to Jupiter, to cross the red line.','Аппарат всё ещё связан с Солнцем. Стартуйте чуть быстрее или пройдите ближе к Юпитеру, чтобы пересечь красную линию.') : T('Passing in front of Jupiter takes speed away and drops the perihelion toward the Sun: braking with a planet.','Пролёт перед Юпитером отнимает скорость и опускает перигелий к Солнцу: торможение с помощью планеты.'))
    : T('Above the red line: the flyby alone has turned a closed orbit into an escape. Pioneer 10 and 11 and both Voyagers reached solar escape with Jupiter\'s help.','Выше красной линии: один пролёт превратил замкнутую орбиту в уход. Так вышли на траекторию ухода от Солнца «Пионеры-10 и -11» и оба «Вояджера» — с помощью Юпитера.');
}
[jE, jR].forEach(function(el){ el.addEventListener('input', renderJup); });
Array.prototype.forEach.call(document.querySelectorAll('#jSide .btn'), function(b){
  b.addEventListener('click', function(){ jSide = +b.dataset.s; pressGroup(document.getElementById('jSide'), b); renderJup(); });
});

/* ============ CH7 — GRAND TOUR ============ */
var gSel = 'neptune', GT = ['jupiter','saturn','uranus','neptune'];
function renderTour(){
  var svg = document.getElementById('gSvg'); svg.innerHTML = '';
  var L = 92, Rr = 460, top = 34, rowH = 46, sc = (Rr - L)/32;
  ns('line', {x1:L, y1:top - 8, x2:L, y2:top + rowH*4, stroke:'#0b0b0c'}, svg);
  [0, 5, 10, 15, 20, 25, 30].forEach(function(y){ txt(svg, L + y*sc, top + rowH*4 + 14, String(y), 'svg-small', 'middle'); });
  txt(svg, Rr, top + rowH*4 + 28, T('years after launch','лет после старта'), 'svg-small', 'end');
  GT.forEach(function(k, i){
    var y = top + i*rowH, h = hohmann(PL[k].a), ty = h.tof/YEAR, vy = v2years(k), on = k === gSel;
    txt(svg, L - 8, y + 16, T(PL[k].en, PL[k].ru), on ? 'svg-label' : 'svg-small', 'end');
    ns('rect', {x:L, y:y, width:ty*sc, height:14, fill:on ? '#5f5f59' : '#8f8f88', stroke:on ? '#0b0b0c' : 'none', 'stroke-width':1.5}, svg);
    ns('rect', {x:L, y:y + 17, width:vy*sc, height:14, fill:on ? '#2f5aa1' : '#6f8fc4', stroke:on ? '#0b0b0c' : 'none', 'stroke-width':1.5}, svg);
    txt(svg, L + ty*sc + 5, y + 11, fmt(ty, 1), 'svg-small');
    txt(svg, L + vy*sc + 5, y + 28, fmt(vy, 1), 'svg-small');
  });
  txt(svg, L, 16, T('grey: direct Hohmann transfer from Earth · blue: Voyager 2','серый: прямой гомановский перелёт от Земли · синий: «Вояджер-2»'), 'svg-small');
  var h = hohmann(PL[gSel].a);
  cells(document.getElementById('gReadout'), [
    [T('DIRECT, MINIMUM-ENERGY','НАПРЯМУЮ, С МИНИМУМОМ ЭНЕРГИИ'), fmt(h.tof/YEAR, 1) + T(' years',' лет')],
    [T('VOYAGER 2 ARRIVED AFTER','«ВОЯДЖЕР-2» ДОЛЕТЕЛ ЗА'), fmt(v2years(gSel), 1) + T(' years',' лет')],
    [T('DIRECT: SPEED BEYOND EARTH\'S','НАПРЯМУЮ: СКОРОСТЬ СВЕРХ ЗЕМНОЙ'), fmt(h.vinf, 2) + T(' km/s',' км/с')],
    [T('DIRECT: ARRIVAL SPEED','НАПРЯМУЮ: СКОРОСТЬ ПРИБЫТИЯ'), fmt(h.arrive, 2) + T(' km/s vs planet\'s ',' км/с при скорости планеты ') + fmt(vCirc(PL[gSel].a), 2)]
  ]);
}
Array.prototype.forEach.call(document.querySelectorAll('#gPick .btn'), function(b){
  b.addEventListener('click', function(){ gSel = b.dataset.p; pressGroup(document.getElementById('gPick'), b); renderTour(); });
});

/* ============ TIMELINE ============ */
var TIMELINE = [
  ['1959', 'Luna 3 swings past the Moon\'s south pole on 6 October and climbs northward over the Earth–Moon plane, photographing the far side on the way.', '«Луна-3» 6 октября проходит над южным полюсом Луны и поднимается к северу над плоскостью Земля — Луна, по пути фотографируя обратную сторону.'],
  ['1961', 'Michael Minovitch, a UCLA graduate student working summers at JPL, computes gravity-assisted trajectories in detail and champions the technique.', 'Майкл Минович, аспирант Калифорнийского университета в Лос-Анджелесе, работающий летом в JPL, подробно рассчитывает траектории с гравитационными манёврами и отстаивает этот метод.'],
  ['1965', 'Gary Flandro, a Caltech graduate student at JPL, finds that Jupiter, Saturn, Uranus and Neptune will line up for one spacecraft between 1976 and 1979.', 'Гэри Фландро, аспирант Калтеха в JPL, обнаруживает, что Юпитер, Сатурн, Уран и Нептун выстроятся для одного аппарата в 1976–1979 годах.'],
  ['1972', 'NASA cancels the four-spacecraft Grand Tour in January over its projected $1 billion cost; two Mariner-based craft, later named Voyager, replace it.', 'В январе NASA отменяет «Большой тур» из четырёх аппаратов из-за прогнозной стоимости в 1 млрд долларов; вместо него — два аппарата на базе «Маринеров», позже названные «Вояджерами».'],
  ['1973', 'Pioneer 10 passes Jupiter on 4 December (UT); the flyby puts it on a path out of the Solar System.', '«Пионер-10» 4 декабря (UT) пролетает Юпитер; пролёт выводит его на траекторию ухода из Солнечной системы.'],
  ['1974', 'Mariner 10 passes Venus on 5 February at 5,768 km and reaches Mercury on 29 March: the first spacecraft to use one planet\'s gravity to reach another.', '«Маринер-10» 5 февраля проходит Венеру на расстоянии 5768 км и 29 марта достигает Меркурия: первый аппарат, долетевший до одной планеты с помощью тяготения другой.'],
  ['1977', 'Voyager 2 launches on 20 August, Voyager 1 on 5 September.', '«Вояджер-2» стартует 20 августа, «Вояджер-1» — 5 сентября.'],
  ['1989', 'Voyager 2 passes Neptune on 25 August, twelve years after launch, after assists at Jupiter, Saturn and Uranus.', '«Вояджер-2» 25 августа пролетает Нептун — через двенадцать лет после старта, после манёвров у Юпитера, Сатурна и Урана.'],
  ['1990', 'ESA\'s Giotto makes the first Earth gravity assist on 2 July; NASA\'s Galileo follows on 8 December.', '«Джотто» ЕКА 2 июля совершает первый гравитационный манёвр у Земли; «Галилео» NASA повторяет его 8 декабря.'],
  ['1999', 'Cassini passes 1,171 km above Earth on 18 August and gains a 5.5 km/s boost toward Saturn.', '«Кассини» 18 августа проходит в 1171 км над Землёй и получает прибавку 5,5 км/с на пути к Сатурну.'],
  ['2007', 'New Horizons passes Jupiter on 28 February: +14,000 km/h, three years off the trip to Pluto.', '«Новые горизонты» 28 февраля пролетают Юпитер: +14 000 км/ч и на три года короче путь к Плутону.'],
  ['2011', 'MESSENGER enters orbit around Mercury on 18 March after six braking flybys: Earth once, Venus twice, Mercury three times.', '«Мессенджер» 18 марта выходит на орбиту Меркурия после шести тормозящих пролётов: Земли один раз, Венеры два, Меркурия три.'],
  ['2013', 'Juno passes Earth on 9 October and gains about 3.9 km/s around the Sun; its speed relative to Earth is the same before and after.', '«Юнона» 9 октября пролетает Землю и прибавляет около 3,9 км/с относительно Солнца; её скорость относительно Земли до и после одинакова.']
];

/* ============ REFERENCES ============ */
var REFERENCES = [
  {title:'NASA JPL, Basics of Space Flight, Chapter 4: Interplanetary Trajectories', url:'https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/', note:{en:'How a gravity assist works: same speed in and out relative to the planet, angular momentum taken from it (approach from behind) or given to it (pass in front); the planet\'s loss too small to measure; Minovitch in the early 1960s; Galileo\'s Io pass saving 90 kg of propellant.', ru:'Как работает гравитационный манёвр: одинаковая скорость на входе и выходе относительно планеты, момент импульса забирается у неё (подход сзади) или отдаётся ей (пролёт впереди); потеря планеты слишком мала для измерения; Минович в начале 1960-х; пролёт «Галилео» у Ио, сэкономивший 90 кг топлива.'}},
  {title:'NASA Science, Voyager: Planetary Voyage', url:'https://science.nasa.gov/mission/voyager/planetary-voyage/', note:{en:'The outer-planet layout recurring about every 175 years; flight time to Neptune cut from 30 years to 12; launch and encounter dates; gravity assist first demonstrated by Mariner 10.', ru:'Расположение внешних планет, повторяющееся примерно раз в 175 лет; время полёта к Нептуну сокращено с 30 лет до 12; даты старта и пролётов; гравитационный манёвр впервые применён «Маринером-10».'}},
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Luna 3\'s path past the Moon; Mariner 10 (Venus 5 Feb 1974 at 5,768 km, Mercury 29 Mar 1974); Grand Tour cancelled January 1972 at a projected $1 billion; Voyager 2 mass 721.9 kg and encounter dates; Giotto\'s first Earth assist; New Horizons +14,000 km/h; MESSENGER\'s six flybys.', ru:'Траектория «Луны-3» у Луны; «Маринер-10» (Венера 5 февраля 1974, 5768 км; Меркурий 29 марта 1974); отмена «Большого тура» в январе 1972 при прогнозе 1 млрд долларов; масса «Вояджера-2» 721,9 кг и даты пролётов; первый манёвр у Земли — «Джотто»; «Новые горизонты» +14 000 км/ч; шесть пролётов «Мессенджера».'}},
  {title:'D. Smith (2013), “The Other Side”, Engineering & Science (Caltech)', url:'https://calteches.library.caltech.edu/4695/1/Smith-Other%20Side.pdf', note:{en:'Spring 1965: Gary Flandro, working part-time at JPL on gravity-assist trajectories, finds the 1976–1979 four-planet alignment that recurs once every 175 years.', ru:'Весна 1965 года: Гэри Фландро, работая по совместительству в JPL над траекториями с гравитационными манёврами, находит выравнивание четырёх планет 1976–1979 годов, повторяющееся раз в 175 лет.'}},
  {title:'NASA JPL (1999), “Cassini successfully completes flyby of Earth”', url:'https://www.jpl.nasa.gov/news/cassini-successfully-completes-flyby-of-earth/', note:{en:'Closest approach 03:28 UT on 18 August 1999 at about 1,171 km; a speed boost of about 5.5 km/s.', ru:'Наибольшее сближение в 03:28 UT 18 августа 1999 на высоте около 1171 км; прибавка скорости около 5,5 км/с.'}},
  {title:'J. D. Anderson et al. (2008), “Anomalous orbital-energy changes observed during spacecraft flybys of Earth”, Physical Review Letters 100, 091102', url:'https://doi.org/10.1103/PhysRevLett.100.091102', note:{en:'Primary source for the Earth-flyby parameters (excess speed, perigee altitude and speed) of Galileo, NEAR, Cassini, Rosetta and MESSENGER.', ru:'Первоисточник параметров пролётов Земли (гиперболический избыток скорости, высота и скорость в перигее) для «Галилео», NEAR, «Кассини», «Розетты» и «Мессенджера».'}},
  {title:'O. Bertolami, F. Francisco, P. J. S. Gil (2016), “Hyperbolic orbits of Earth flybys and effects of ungravity-inspired conservative potentials”, Classical and Quantum Gravity 33, 125021 (open preprint: arXiv:1507.08457)', url:'https://arxiv.org/abs/1507.08457', note:{en:'Table 1, from Anderson et al.: Cassini 16.01 km/s and 19.026 km/s at 1,175 km; NEAR 6.851 km/s at 539 km; MESSENGER 4.056 km/s at 2,347 km.', ru:'Таблица 1 по данным Андерсона и др.: «Кассини» 16,01 км/с и 19,026 км/с на высоте 1175 км; NEAR 6,851 км/с на 539 км; «Мессенджер» 4,056 км/с на 2347 км.'}},
  {title:'NASA JPL (2013), “NASA\'s Juno gives starship-like view of Earth flyby”', url:'https://www.jpl.nasa.gov/news/nasas-juno-gives-starship-like-view-of-earth-flyby/', note:{en:'Flyby on 9 October 2013 increased Juno\'s speed relative to the Sun by about 3.9 km/s; its speed relative to Earth before and after was unchanged.', ru:'Пролёт 9 октября 2013 увеличил скорость «Юноны» относительно Солнца примерно на 3,9 км/с; её скорость относительно Земли до и после не изменилась.'}},
  {title:'NASA NSSDCA, Planetary Fact Sheets', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note:{en:'GM, equatorial radius, semimajor axis and mass of each planet; GM of the Sun, 132,712 × 10⁶ km³/s².', ru:'GM, экваториальный радиус, большая полуось и масса каждой планеты; GM Солнца 132 712 × 10⁶ км³/с².'}},
  {title:'J. A. Van Allen (2003), “Gravitational assist in celestial mechanics — a tutorial”, American Journal of Physics 71, 448–451', url:'https://doi.org/10.1119/1.1539102', note:{en:'Pioneer 10 at Jupiter, 4 December 1973: 9.8 km/s around the Sun before, 8.9 km/s relative to Jupiter, closest approach 2.84 Jupiter radii at 37 km/s, 22.4 km/s around the Sun after — above the 18.7 km/s needed to escape at 5.05 AU.', ru:'«Пионер-10» у Юпитера 4 декабря 1973 года: 9,8 км/с относительно Солнца до пролёта, 8,9 км/с относительно Юпитера, наибольшее сближение 2,84 радиуса Юпитера при 37 км/с, 22,4 км/с относительно Солнца после — больше 18,7 км/с, нужных для ухода на 5,05 а. е.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', T(el.getAttribute('data-aria-en'), el.getAttribute('data-aria-ru'))); });
  renderTurn();
  renderBounce(); drawBounce(bT);
  renderJup();
  renderTour();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__slingshot = {orbitShrink:orbitShrink, PL:PL, GM_SUN:GM_SUN, vCirc:vCirc, vEsc:vEsc, ecc:ecc, turn:turn, vPeri:vPeri, dvVec:dvVec, flyby:flyby, bounce:bounce, departState:departState, conic:conic, viaJupiter:viaJupiter, hohmann:hohmann, v2years:v2years, bestAngle:bestAngle, YEAR:YEAR};
