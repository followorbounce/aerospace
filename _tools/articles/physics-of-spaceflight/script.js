/* ============ CONSTANTS (NASA NSSDCA fact sheets [1][2]) ============ */
var G0 = 9.80665;                                            // m/s², standard gravity (defines the second of specific impulse)
var GM_SUN = 1.32712e11, AU = 149.598e6, R_SUN = 695700;     // km³/s², km, km
var B = {
  earth:  {en:'Earth',   ru:'Земля',    mu:398600,    R:6378.137, a:149.598e6},
  moon:   {en:'Moon',    ru:'Луна',     mu:4900,      R:1737.4,   a:384400},      // a: around Earth
  mercury:{en:'Mercury', ru:'Меркурий', mu:22032,     R:2440.5,   a:57.909e6},
  venus:  {en:'Venus',   ru:'Венера',   mu:324860,    R:6051.8,   a:108.210e6},
  mars:   {en:'Mars',    ru:'Марс',     mu:42828,     R:3396.2,   a:227.956e6},
  jupiter:{en:'Jupiter', ru:'Юпитер',   mu:126687000, R:71492,    a:778.479e6},
  neptune:{en:'Neptune', ru:'Нептун',   a:4514.953e6},
  sun:    {en:'Sun',     ru:'Солнце',   mu:GM_SUN,    R:R_SUN}
};
var LEO_ALT = 200, GEO_ALT = 35786, T_SIDEREAL = 23.9345*3600;   // km, km, s
var ASCENT = 9.3;                                            // km/s, quoted (Saturn V: 9,267 m/s [10]), not computed here

/* ============ PURE PHYSICS ============ */
function vCirc(mu, r){ return Math.sqrt(mu/r); }
function vEsc(mu, r){ return Math.sqrt(2*mu/r); }
function visViva(mu, r, a){ return Math.sqrt(mu*(2/r - 1/a)); }
function period(mu, a){ return 2*Math.PI*Math.sqrt(a*a*a/mu); }
function orbit(mu, rp, ra){
  var a = (rp + ra)/2;
  return {a:a, e:(ra - rp)/(ra + rp), vp:visViva(mu, rp, a), va:visViva(mu, ra, a), T:period(mu, a), vc:vCirc(mu, rp), ve:vEsc(mu, rp)};
}
/* Radius of a circular orbit with a given period (Kepler's third law) */
function rForPeriod(mu, T){ return Math.pow(mu*T*T/(4*Math.PI*Math.PI), 1/3); }

/* Rocket equation */
function vex(isp){ return isp*G0/1000; }                                   // km/s
function dvRocket(isp, m0, mf){ return vex(isp)*Math.log(m0/mf); }          // km/s
function massRatio(dv, isp){ return Math.exp(dv/vex(isp)); }
/* Optimal split of a total Δv between stages (each with its own Isp and structural fraction ε = dry/(dry + propellant)).
   Maximise Σ ln π_i with π_i = (1/R_i − ε_i)/(1 − ε_i), subject to Σ v_i ln R_i = Δv.
   Lagrange: 1 − ε_i R_i = 1/(λ v_i)  →  R_i = (1 − 1/(λ v_i))/ε_i ; λ found by bisection. A stage whose R_i would be < 1 is left unused. */
function stageOpt(dv, isps, eps){
  var n = isps.length, v = isps.map(vex), i;
  var lim = 0; for(i = 0; i < n; i++) lim += v[i]*Math.log(1/eps[i]);
  if(!(dv < lim)) return {ok:false, limit:lim, payload:0};
  function Rs(lam){ return v.map(function(vi, k){ return Math.max(1, (1 - 1/(lam*vi))/eps[k]); }); }
  function tot(lam){ var R = Rs(lam), s = 0; for(var k = 0; k < n; k++) s += v[k]*Math.log(R[k]); return s; }
  var lo = 1e-6, hi = 1e9;
  for(i = 0; i < 200; i++){ var mid = Math.sqrt(lo*hi); if(tot(mid) < dv) lo = mid; else hi = mid; }
  var R = Rs(Math.sqrt(lo*hi)), pay = 1, st = [], m = 1;
  for(i = 0; i < n; i++){
    var pi = (1/R[i] - eps[i])/(1 - eps[i]);
    st.push({R:R[i], dv:v[i]*Math.log(R[i]), pi:pi, m0:m, prop:m*(1 - pi)*(1 - eps[i]), dry:m*(1 - pi)*eps[i]});
    m *= pi; pay *= pi;
  }
  return {ok:true, limit:lim, payload:pay, stages:st, unused:st.filter(function(q){ return q.R < 1 + 1e-9; }).length};
}
/* Payload fraction for a given (not optimised) split */
function stagePayload(dvs, isps, eps){
  var p = 1;
  for(var i = 0; i < dvs.length; i++){ var R = Math.exp(dvs[i]/vex(isps[i])), pi = (1/R - eps[i])/(1 - eps[i]); if(pi <= 0) return 0; p *= pi; }
  return p;
}
/* Limit of infinitely many identical stages: payload = exp(−Δv / (v_e (1 − ε))) */
function infStages(dv, isp, eps){ return Math.exp(-dv/(vex(isp)*(1 - eps))); }

/* Hohmann transfer between circular orbits r1 → r2 with a plane change di (rad) folded into the burn at the larger radius */
function hohmann(mu, r1, r2, di){
  di = di || 0;
  var a = (r1 + r2)/2, c1 = vCirc(mu, r1), c2 = vCirc(mu, r2), t1 = visViva(mu, r1, a), t2 = visViva(mu, r2, a);
  function comb(u, w){ return Math.sqrt(u*u + w*w - 2*u*w*Math.cos(di)); }
  var d1 = r2 >= r1 ? Math.abs(t1 - c1) : comb(t1, c1), d2 = r2 >= r1 ? comb(t2, c2) : Math.abs(t2 - c2);
  return {a:a, e:Math.abs(r2 - r1)/(r1 + r2), dv1:d1, dv2:d2, total:d1 + d2, tof:Math.PI*Math.sqrt(a*a*a/mu), c1:c1, c2:c2, t1:t1, t2:t2,
          flat:Math.abs(t1 - c1) + Math.abs(t2 - c2)};
}
function planeChange(v, di){ return 2*v*Math.sin(di/2); }
/* Bi-elliptic transfer r1 → rb → r2 (coplanar), total Δv */
function biElliptic(mu, r1, r2, rb){
  var a1 = (r1 + rb)/2, a2 = (r2 + rb)/2;
  return Math.abs(visViva(mu, r1, a1) - vCirc(mu, r1)) + Math.abs(visViva(mu, rb, a2) - visViva(mu, rb, a1)) + Math.abs(vCirc(mu, r2) - visViva(mu, r2, a2));
}
/* Hohmann total in units of the inner circular speed, as a function of the radius ratio; and the bi-parabolic limit */
function hohmannNorm(R){ return Math.sqrt(2*R/(1 + R)) - 1 + Math.sqrt(1/R) - Math.sqrt(2/(R*(1 + R))); }
function biParabolicNorm(R){ return (Math.SQRT2 - 1)*(1 + Math.sqrt(1/R)); }
function biThreshold(){ var lo = 5, hi = 20; for(var i = 0; i < 80; i++){ var m = (lo + hi)/2; if(hohmannNorm(m) < biParabolicNorm(m)) lo = m; else hi = m; } return (lo + hi)/2; }
function hohmannPeak(){ var lo = 5, hi = 40; for(var i = 0; i < 200; i++){ var a = lo + (hi - lo)/3, b = hi - (hi - lo)/3; if(hohmannNorm(a) < hohmannNorm(b)) lo = a; else hi = b; } return (lo + hi)/2; }

/* Patched conics */
function depart(mu, r, vinf){ return Math.sqrt(vinf*vinf + 2*mu/r) - Math.sqrt(mu/r); }      // from a circular orbit to a given v∞
function capture(mu, r, vinf){ return Math.sqrt(vinf*vinf + 2*mu/r) - Math.sqrt(mu/r); }     // from v∞ into a circular orbit (same size, by symmetry)
function helio(rTo){                                                                          // Hohmann from Earth's orbit: v∞ at both ends, time
  var h = hohmann(GM_SUN, B.earth.a, rTo, 0);
  return {vinfE:Math.abs(h.t1 - h.c1), vinfT:Math.abs(h.c2 - h.t2), tof:h.tof};
}
/* Oberth: a burn dv at periapsis rp of a pass with excess speed vinf */
function oberth(mu, rp, vinf, dv){
  var vp = Math.sqrt(vinf*vinf + 2*mu/rp), e2 = (vp + dv)*(vp + dv) - 2*mu/rp;
  var out = Math.sqrt(Math.max(0, e2)), far = vinf + dv;
  return {vp:vp, vinfOut:out, far:far, gain:out - far, dE:vp*dv + dv*dv/2, dEfar:vinf*dv + dv*dv/2};
}
/* Mercury's orbit is far from circular (e = 0.2056 [1]): the same method with arrival at its perihelion and at its aphelion */
var E_MERCURY = 0.2056;
function mercuryEnds(){
  var E = B.earth, P = B.mercury, r0 = E.R + LEO_ALT, vE = vCirc(GM_SUN, E.a);
  return [P.a*(1 - E_MERCURY), P.a*(1 + E_MERCURY)].map(function(r){
    var aT = (E.a + r)/2, vinfE = Math.abs(visViva(GM_SUN, E.a, aT) - vE), vinfT = Math.abs(visViva(GM_SUN, r, P.a) - visViva(GM_SUN, r, aT));
    var d = depart(E.mu, r0, vinfE), c = capture(P.mu, P.R + 300, vinfT);
    return {dep:d, cap:c, total:d + c};
  });
}
/* New Horizons: achieved launch energy C3 = 157.7502 km²/s² (Guo & Farquhar [32]) */
var C3_NEW_HORIZONS = 157.7502;
function thirdCosmic(){ var vE = vCirc(GM_SUN, B.earth.a), vi = (Math.SQRT2 - 1)*vE; return Math.sqrt(vi*vi + 2*B.earth.mu/B.earth.R); }

/* ============ Δv MAP: every row from a 200 km circular low Earth orbit, impulsive burns, Hohmann transfers,
   circular coplanar orbits, patched conics, no losses, no margins ============ */
function dvMap(){
  var E = B.earth, r0 = E.R + LEO_ALT, rG = E.R + GEO_ALT, rows = [];
  function row(id, en, ru, legs, note){ var t = 0; legs.forEach(function(l){ t += l[2]; }); rows.push({id:id, en:en, ru:ru, legs:legs, total:t, note:note || null}); }
  var hG = hohmann(E.mu, r0, rG, 0), hG28 = hohmann(E.mu, r0, rG, 28.5*Math.PI/180);
  var L1 = ['Raise apogee to geostationary height','Подъём апогея до геостационарной высоты', hG.dv1];
  row('gto', 'Geostationary transfer orbit', 'Геопереходная орбита', [L1]);
  row('geo', 'Geostationary orbit, equatorial start', 'Геостационарная орбита, старт с экватора', [L1, ['Circularise at 35,786 km','Скругление на высоте 35 786 км', hG.dv2]]);
  row('geo28', 'Geostationary orbit, from a 28.5° orbit', 'Геостационарная орбита с орбиты наклонением 28,5°', [L1, ['Circularise and turn the plane 28.5°','Скругление и поворот плоскости на 28,5°', hG28.dv2]]);
  row('esc', 'Earth escape (just)', 'Уход от Земли (на пределе)', [['Reach escape speed','Разгон до скорости убегания', vEsc(E.mu, r0) - vCirc(E.mu, r0)]]);
  /* Moon: Hohmann ellipse to the Moon's distance, then the Moon's own gravity (patched conic) */
  var M = B.moon, hM = hohmann(E.mu, r0, M.a, 0), vinfM = hM.c2 - hM.t2, rL = M.R + 100;
  var Lt = ['Trans-lunar injection','Выход на траекторию полёта к Луне', hM.dv1];
  var Lc = ['Brake into a 100 km lunar orbit','Торможение для выхода на окололунную орбиту 100 км', capture(M.mu, rL, vinfM)];
  var hD = hohmann(M.mu, rL, M.R, 0);
  var Ld = ['Descend and stop at the surface','Спуск и остановка у поверхности', hD.dv1 + hD.t2];
  row('tli', 'To the Moon (flyby or impact)', 'К Луне (пролёт или падение)', [Lt]);
  row('llo', 'Low lunar orbit', 'Низкая окололунная орбита', [Lt, Lc]);
  row('lsurf', 'Lunar surface', 'Поверхность Луны', [Lt, Lc, Ld]);
  /* Planets: heliocentric Hohmann, hyperbolic departure from LEO, capture into a 300 km circular orbit */
  function planet(k, enT, ruT, enO, ruO){
    var P = B[k], h = helio(P.a), d = ['Departure burn from low Earth orbit','Разгонный импульс с низкой околоземной орбиты', depart(E.mu, r0, h.vinfE)];
    row(k, enT, ruT, [d]);
    if(enO) row(k + 'lo', enO, ruO, [d, ['Brake into a 300 km orbit on engines alone','Торможение одними двигателями для выхода на орбиту 300 км', capture(P.mu, P.R + 300, h.vinfT)]]);
    return h;
  }
  planet('venus', 'To Venus (flyby or entry)', 'К Венере (пролёт или вход в атмосферу)', 'Low Venus orbit', 'Низкая орбита вокруг Венеры');
  planet('mars', 'To Mars (flyby or entry)', 'К Марсу (пролёт или вход в атмосферу)', 'Low Mars orbit', 'Низкая орбита вокруг Марса');
  planet('mercury', 'To Mercury (flyby)', 'К Меркурию (пролёт)', 'Low Mercury orbit', 'Низкая орбита вокруг Меркурия');
  planet('jupiter', 'To Jupiter (flyby)', 'К Юпитеру (пролёт)');
  var vE = vCirc(GM_SUN, E.a);
  row('solesc', 'Escape from the Sun, direct', 'Уход от Солнца напрямую', [['Departure burn from low Earth orbit','Разгонный импульс с низкой околоземной орбиты', depart(E.mu, r0, (Math.SQRT2 - 1)*vE)]]);
  return rows;
}
function mapRow(id){ return dvMap().filter(function(r){ return r.id === id; })[0]; }

/* ============ SHARED UI HELPERS ============ */
var KMS = function(){ return T(' km/s',' км/с'); };
function $(id){ return document.getElementById(id); }
function logPos(r, lo, hi){ return Math.round(1000*Math.log(r/lo)/Math.log(hi/lo)); }
function logVal(p, lo, hi){ return lo*Math.pow(hi/lo, p/1000); }
function durText(s){
  if(s < 3*3600) return fmt(s/60, 1) + T(' min',' мин');
  if(s < 3*86400) return fmt(s/3600, 2) + T(' h',' ч');
  if(s < 3*365.25*86400) return fmt(s/86400, 1) + T(' days',' сут');
  return fmt(s/(365.25*86400), 1) + T(' years',' года');
}
function pct(x){ return x >= 0.1 ? fmt(x*100, 1) : x >= 0.001 ? fmt(x*100, 2) : fmt(x*100, 4); }
function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

/* ============ CH2 — ROCKET EQUATION + STAGING ============ */
var rDv = $('rDv'), rI1 = $('rI1'), rI2 = $('rI2'), rEps = $('rEps'), rN = 2;
function rSetup(){
  var isps = [], eps = [], e = (+rEps.value)/100;
  for(var i = 0; i < rN; i++){ isps.push(i === 0 ? +rI1.value : +rI2.value); eps.push(e); }
  return {isps:isps, eps:eps, e:e};
}
function renderRocket(){
  var dv = +rDv.value, s = rSetup(), res = stageOpt(dv, s.isps, s.eps), i;
  $('rDvVal').textContent = fmt(dv, 1) + KMS();
  $('rI1Val').textContent = fmtInt(+rI1.value) + T(' s',' с') + ' · ' + fmt(vex(+rI1.value), 2) + KMS();
  $('rI2Val').textContent = fmtInt(+rI2.value) + T(' s',' с') + ' · ' + fmt(vex(+rI2.value), 2) + KMS();
  $('rEpsVal').textContent = fmt(+rEps.value, 1) + (lang === 'ru' ? ' %' : '%');
  [rDv, rI1, rI2, rEps].forEach(function(el){ el.setAttribute('aria-valuetext', $(el.id + 'Val').textContent); });
  var svg = $('rSvg'); svg.innerHTML = '';
  /* top: payload fraction for 1–4 stages at these settings (log scale, 0.01 % … 100 %) */
  var L = 86, R = 440, top = 30, rowH = 26;
  txt(svg, 10, 16, T('PAYLOAD AS A SHARE OF LIFT-OFF MASS (log scale)','ДОЛЯ ПОЛЕЗНОЙ НАГРУЗКИ В СТАРТОВОЙ МАССЕ (лог. шкала)'), 'svg-small');
  function X(f){ return L + (Math.log10(Math.max(f, 1e-4)) + 4)/4*(R - L); }
  [1e-4, 1e-3, 1e-2, 1e-1, 1].forEach(function(f){
    ns('line', {x1:X(f), y1:top - 4, x2:X(f), y2:top + rowH*4 + 2, stroke:'#d8d8d0'}, svg);
    txt(svg, X(f), top + rowH*4 + 14, (f >= 0.01 ? fmtInt(f*100) : fmt(f*100, f < 0.001 ? 2 : 1)) + (lang === 'ru' ? ' %' : '%'), 'svg-small', 'middle');
  });
  for(i = 1; i <= 4; i++){
    var is = [], ep = []; for(var k = 0; k < i; k++){ is.push(k === 0 ? +rI1.value : +rI2.value); ep.push(s.e); }
    var q = stageOpt(dv, is, ep), y = top + (i - 1)*rowH, on = i === rN;
    txt(svg, L - 6, y + 14, i + T(i === 1 ? ' stage' : ' stages', i === 1 ? ' ступень' : i < 5 ? ' ступени' : ' ступеней'), on ? 'svg-label' : 'svg-small', 'end');
    if(q.ok && q.payload > 1e-4){
      ns('rect', {x:L, y:y + 3, width:Math.max(1, X(q.payload) - L), height:15, fill:on ? '#2f5aa1' : '#9a9a92', stroke:on ? '#0b0b0c' : 'none', 'stroke-width':1.5}, svg);
      txt(svg, X(q.payload) + 5, y + 14, pct(q.payload) + (lang === 'ru' ? ' %' : '%') + (q.unused ? ' · ' + q.unused + T(' unused',' не исп.') : ''), on ? 'svg-label' : 'svg-small');
    } else txt(svg, L + 5, y + 14, q.ok ? T('below 0.01 %','меньше 0,01 %') : T('cannot reach this Δv','такой Δv недостижим'), on ? 'svg-label' : 'svg-small');
  }
  /* bottom: where the lift-off mass goes for the chosen number of stages */
  var by = top + rowH*4 + 44;
  txt(svg, 10, by - 10, T('LIFT-OFF MASS OF THE CHOSEN ROCKET','СТАРТОВАЯ МАССА ВЫБРАННОЙ РАКЕТЫ'), 'svg-small');
  var x0 = 10, W = 460;
  if(res.ok){
    var x = x0;
    res.stages.forEach(function(st, j){
      var wp = st.prop*W, wd = st.dry*W;
      ns('rect', {x:x, y:by, width:wp, height:26, fill:['#c9c9c1','#a9a9a0','#8a8a82','#6c6c66'][j], stroke:'#0b0b0c', 'stroke-width':0.8}, svg);
      if(wp > 26) txt(svg, x + wp/2, by + 17, String(j + 1), 'svg-label', 'middle');
      x += wp;
      ns('rect', {x:x, y:by, width:wd, height:26, fill:'#0b0b0c'}, svg); x += wd;
    });
    ns('rect', {x:x, y:by, width:Math.max(1.5, res.payload*W), height:26, fill:'#b5452a'}, svg);
    txt(svg, x0, by + 42, T('grey, numbered: propellant of each stage','серое с номером: топливо ступени'), 'svg-small');
    txt(svg, x0, by + 56, T('black: empty stages · red, at the right end: payload','чёрное: пустые ступени · красное, справа: полезная нагрузка'), 'svg-small');
  } else {
    ns('rect', {x:x0, y:by, width:W, height:26, fill:'none', stroke:'#0b0b0c', 'stroke-dasharray':'4 3'}, svg);
    txt(svg, x0 + 8, by + 17, T('no payload: this Δv is out of reach','полезной нагрузки нет: такой Δv недостижим'), 'svg-small');
  }
  var e1 = stageOpt(dv, [s.isps[0]], [s.e]);
  var rows = [
    [T('PAYLOAD SHARE OF LIFT-OFF MASS','ДОЛЯ ПОЛЕЗНОЙ НАГРУЗКИ'), res.ok ? pct(res.payload) + (lang === 'ru' ? ' %' : '%') : '—'],
    [T('LIFT-OFF MASS PER TONNE OF PAYLOAD','СТАРТОВАЯ МАССА НА ТОННУ ГРУЗА'), res.ok ? (1/res.payload < 1e5 ? fmtInt(1/res.payload) + T(' t',' т') : T('over 100,000 t','больше 100 000 т')) : '—'],
    [T('Δv GIVEN TO EACH STAGE','Δv, ОТВЕДЁННЫЙ КАЖДОЙ СТУПЕНИ'), res.ok ? res.stages.map(function(st){ return fmt(st.dv, 2); }).join(' · ') + KMS() : '—', 1],
    [T('MASS RATIO OF EACH STAGE (FULL ÷ EMPTY)','ОТНОШЕНИЕ МАСС КАЖДОЙ СТУПЕНИ (ПОЛНАЯ ÷ ПУСТАЯ)'), res.ok ? res.stages.map(function(st){ return fmt(st.R, 2); }).join(' · ') : '—', 1],
    [T('UPPER LIMIT OF Δv FOR THESE STAGES, NO PAYLOAD','ВЕРХНИЙ ПРЕДЕЛ Δv ЭТИХ СТУПЕНЕЙ БЕЗ ГРУЗА'), fmt(res.limit, 2) + KMS()],
    [T('SINGLE STAGE, NO PAYLOAD','ОДНА СТУПЕНЬ БЕЗ ГРУЗА'), fmt(e1.limit, 2) + KMS()]
  ];
  if(res.ok && res.unused) rows.push([T('STAGES LEFT UNUSED','НЕИСПОЛЬЗОВАННЫЕ СТУПЕНИ'), res.stages.map(function(st, j){ return st.R < 1 + 1e-9 ? String(j + 1) : ''; }).filter(String).join(', ') + T(' (mass ratio 1: no tanks, no burn)',' (отношение масс 1: ни баков, ни работы двигателя)'), 1]);
  if(+rI1.value === +rI2.value) rows.push([T('LIMIT OF ENDLESSLY MANY STAGES','ПРЕДЕЛ БЕСКОНЕЧНОГО ЧИСЛА СТУПЕНЕЙ'), pct(infStages(dv, +rI1.value, s.e)) + (lang === 'ru' ? ' %' : '%'), 1]);
  cells($('rReadout'), rows);
  hud1.textContent = fmt(dv, 1) + KMS(); hud2.textContent = res.ok ? pct(res.payload) + (lang === 'ru' ? ' %' : '%') : '—';
  $('rStatus').innerHTML = !res.ok
    ? T('<b>Out of reach.</b> Even with no payload at all, ' + rN + (rN === 1 ? ' stage' : ' stages') + ' like this top out at ' + fmt(res.limit, 2) + ' km/s. Add a stage, raise the exhaust velocity or build lighter tanks.',
        '<b>Недостижимо.</b> Даже совсем без груза такая ракета (ступеней: ' + rN + ') набирает не больше ' + fmt(res.limit, 2) + ' км/с. Добавьте ступень, повысьте скорость истечения или облегчите баки.')
    : res.unused
      ? T('<b>A stage is left unused.</b> With the same ε for every stage, a slower-exhaust stage only adds dead weight here, so the best rocket in this model has ' + (rN - res.unused) + (rN - res.unused === 1 ? ' working stage' : ' working stages') + ', not ' + rN + '. Real first stages earn their place with thrust and compact tanks, which the model does not see.',
          '<b>Одна из ступеней не используется.</b> При одном и том же ε для всех ступеней ступень с меньшей скоростью истечения здесь лишь добавляет мёртвый груз, поэтому у лучшей ракеты в этой модели рабочих ступеней ' + (rN - res.unused) + ', а не ' + rN + '. Реальные первые ступени оправданы тягой и компактными баками, которых модель не видит.')
    : rN === 1
      ? T('One stage must carry its empty tanks all the way. At this Δv, ' + pct(res.payload) + '% of the lift-off mass is payload. The figure flatters a single stage: it assumes vacuum specific impulse all the way from the ground. Press 2 or 3 stages and compare.',
          'Одна ступень везёт свои пустые баки до самого конца. При таком Δv полезная нагрузка — ' + pct(res.payload) + ' % стартовой массы. Это число льстит одной ступени: принят удельный импульс в вакууме на всём пути от земли. Выберите 2 или 3 ступени и сравните.')
      : T('The optimiser splits the ' + fmt(dv, 1) + ' km/s so that no other split carries more payload. With equal engines and tanks every stage gets the same share; a stage with a faster exhaust is given more of the work.',
          'Оптимизатор делит ' + fmt(dv, 1) + ' км/с так, что никакое другое деление не даёт большей полезной нагрузки. При одинаковых двигателях и баках доли ступеней равны; ступени с более высокой скоростью истечения достаётся больше работы.');
}
[rDv, rI1, rI2, rEps].forEach(function(el){ el.addEventListener('input', function(){ pressGroup($('rPre'), null); renderRocket(); }); });
each('#rStages .btn', function(b){ b.addEventListener('click', function(){ rN = +b.dataset.n; pressGroup($('rStages'), b); renderRocket(); }); });
var RPRE = {kero:[303, 303], mix:[303, 421], hydro:[452, 452]};
each('#rPre .btn', function(b){ b.addEventListener('click', function(){ var q = RPRE[b.dataset.k]; rI1.value = q[0]; rI2.value = q[1]; pressGroup($('rPre'), b); renderRocket(); }); });

/* ============ CH3 — VIS-VIVA / ORBIT CALCULATOR ============ */
var OB = {
  earth:{lo:B.earth.R + 150, hi:900000},
  moon: {lo:B.moon.R + 10,   hi:60000},
  mars: {lo:B.mars.R + 100,  hi:500000},
  sun:  {lo:0.03*AU,         hi:40*AU}
};
var oBody = 'earth', oR1 = B.earth.R + 400, oR2 = B.earth.R + 400, oP = $('oP'), oA = $('oA');
function distText(body, r){
  if(body === 'sun') return fmt(r/AU, r/AU < 1 ? 3 : 2) + T(' AU from the centre',' а. е. от центра');
  var h = r - B[body].R; return fmtInt(h) + T(' km',' км');
}
function renderOrbit(){
  var P = B[oBody], rp = Math.min(oR1, oR2), ra = Math.max(oR1, oR2), o = orbit(P.mu, rp, ra);
  $('oPVal').textContent = distText(oBody, oR1); $('oAVal').textContent = distText(oBody, oR2);
  oP.setAttribute('aria-valuetext', $('oPVal').textContent); oA.setAttribute('aria-valuetext', $('oAVal').textContent);
  var svg = $('oSvg'); svg.innerHTML = '';
  var cx = 240, cy = 150, sc = 205/(ra + rp), ax = o.a*sc, bx = ax*Math.sqrt(1 - o.e*o.e), fx = cx - 205/2 + rp*sc + (205 - 2*ax)/2;
  /* ellipse centred so that the focus (the body) sits at fx */
  var ex = fx + (o.a - rp)*sc;
  ns('ellipse', {cx:ex, cy:cy, rx:ax, ry:bx, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  ns('circle', {cx:fx, cy:cy, r:Math.max(2.5, P.R*sc), fill:'#a8741a'}, svg);
  ns('circle', {cx:fx - rp*sc, cy:cy, r:4, fill:'#b5452a'}, svg);
  ns('rect', {x:fx + ra*sc - 4, y:cy - 4, width:8, height:8, fill:'#0b0b0c'}, svg);
  txt(svg, 10, 18, T('ORBIT TO SCALE · ','ОРБИТА В МАСШТАБЕ · ') + T(P.en, P.ru).toUpperCase(), 'svg-small');
  txt(svg, 10, 272, T('red dot: lowest point, ','красная точка: нижняя точка, ') + fmt(o.vp, 2) + KMS(), 'svg-label');
  txt(svg, 10, 288, T('black square: highest point, ','чёрный квадрат: верхняя точка, ') + fmt(o.va, 2) + KMS(), 'svg-label');
  var ru = lang === 'ru';
  cells($('oReadout'), [
    [T('SPEED AT THE LOWEST POINT','СКОРОСТЬ В НИЖНЕЙ ТОЧКЕ'), fmt(o.vp, 3) + KMS()],
    [T('SPEED AT THE HIGHEST POINT','СКОРОСТЬ В ВЕРХНЕЙ ТОЧКЕ'), fmt(o.va, 3) + KMS()],
    [T('CIRCULAR SPEED AT THE LOWEST POINT','КРУГОВАЯ СКОРОСТЬ В НИЖНЕЙ ТОЧКЕ'), fmt(o.vc, 3) + KMS()],
    [T('ESCAPE SPEED AT THE LOWEST POINT','СКОРОСТЬ УБЕГАНИЯ В НИЖНЕЙ ТОЧКЕ'), fmt(o.ve, 3) + KMS()],
    [T('PERIOD','ПЕРИОД ОБРАЩЕНИЯ'), durText(o.T)],
    [T('ECCENTRICITY','ЭКСЦЕНТРИСИТЕТ'), fmt(o.e, 3)],
    [T('SEMI-MAJOR AXIS','БОЛЬШАЯ ПОЛУОСЬ'), oBody === 'sun' ? fmt(o.a/AU, 3) + T(' AU',' а. е.') : fmtInt(o.a) + T(' km',' км'), 1]
  ]);
  var k = o.vp/o.vc;
  $('oStatus').innerHTML = o.e < 0.0005
    ? T('<b>Circle.</b> The speed is the same all the way round, ' + fmt(o.vp, 2) + ' km/s, and escape speed here is exactly √2 times that: ' + fmt(o.ve, 2) + ' km/s.',
        '<b>Окружность.</b> Скорость одна и та же на всём витке, ' + fmt(o.vp, 2) + ' км/с, а скорость убегания здесь ровно в √2 раз больше: ' + fmt(o.ve, 2) + ' км/с.')
    : T('<b>Ellipse.</b> At the lowest point the craft moves ' + fmt(k, 3) + ' times the local circular speed, so it climbs; at the top it is too slow to stay and falls back. Between 1 and √2 ≈ 1.414 times circular speed the orbit stays closed.',
        '<b>Эллипс.</b> В нижней точке аппарат движется в ' + fmt(k, 3) + ' раза быстрее местной круговой скорости и потому поднимается; наверху он слишком медленный, чтобы остаться, и падает обратно. Пока скорость между 1 и √2 ≈ 1,414 круговой, орбита замкнута.');
}
function oSync(){ var q = OB[oBody]; oP.value = logPos(oR1, q.lo, q.hi); oA.value = logPos(oR2, q.lo, q.hi); }
oP.addEventListener('input', function(){ var q = OB[oBody]; oR1 = logVal(+oP.value, q.lo, q.hi); pressGroup($('oPre'), null); renderOrbit(); });
oA.addEventListener('input', function(){ var q = OB[oBody]; oR2 = logVal(+oA.value, q.lo, q.hi); pressGroup($('oPre'), null); renderOrbit(); });
var OPRE = {
  leo:   {b:'earth', p:B.earth.R + 400,   a:B.earth.R + 400},
  gto:   {b:'earth', p:B.earth.R + 200,   a:B.earth.R + GEO_ALT},
  geo:   {b:'earth', p:B.earth.R + GEO_ALT, a:B.earth.R + GEO_ALT},
  mol:   {b:'earth', p:B.earth.R + 500,   a:B.earth.R + 40000},
  moond: {b:'earth', p:384400,            a:384400},
  llo:   {b:'moon',  p:B.moon.R + 100,    a:B.moon.R + 100},
  a11:   {b:'moon',  p:B.moon.R + 60.0*1.852, a:B.moon.R + 169.7*1.852},
  lmo:   {b:'mars',  p:B.mars.R + 300,    a:B.mars.R + 300},
  eorb:  {b:'sun',   p:AU,                a:AU},
  tmars: {b:'sun',   p:AU,                a:B.mars.a}
};
each('#oPre .btn', function(b){ b.addEventListener('click', function(){
  var q = OPRE[b.dataset.k]; oBody = q.b; oR1 = q.p; oR2 = q.a; oSync(); pressGroup($('oPre'), b); renderOrbit();
}); });

/* ============ CH4 — HOHMANN ============ */
var HB = {earth:{mu:B.earth.mu, lo:B.earth.R + 150, hi:450000}, sun:{mu:GM_SUN, lo:0.3*AU, hi:40*AU}};
var hBody = 'earth', hR1 = B.earth.R + 200, hR2 = B.earth.R + GEO_ALT, h1 = $('h1'), h2 = $('h2'), hI = $('hI');
function hDist(r){ return hBody === 'sun' ? fmt(r/AU, 3) + T(' AU',' а. е.') : fmtInt(r - B.earth.R) + T(' km altitude',' км над Землёй'); }
function renderHoh(){
  var q = HB[hBody], di = (+hI.value)*Math.PI/180, h = hohmann(q.mu, hR1, hR2, di), out = hR2 >= hR1, ratio = Math.max(hR1, hR2)/Math.min(hR1, hR2);
  $('h1Val').textContent = hDist(hR1); $('h2Val').textContent = hDist(hR2); $('hIVal').textContent = fmt(+hI.value, 1) + '°';
  [h1, h2, hI].forEach(function(el){ el.setAttribute('aria-valuetext', $(el.id + 'Val').textContent); });
  var svg = $('hSvg'); svg.innerHTML = '';
  var cx = 150, cy = 150, rO = Math.max(hR1, hR2), rI = Math.min(hR1, hR2), sc = 120/rO;
  txt(svg, 10, 18, T('TO SCALE · AROUND ','В МАСШТАБЕ · ВОКРУГ ') + (hBody === 'sun' ? T('THE SUN','СОЛНЦА') : T('EARTH','ЗЕМЛИ')), 'svg-small');
  ns('circle', {cx:cx, cy:cy, r:rO*sc, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.2}, svg);
  ns('circle', {cx:cx, cy:cy, r:Math.max(1, rI*sc), fill:'none', stroke:'#0b0b0c', 'stroke-width':1.2, 'stroke-dasharray':'3 3'}, svg);
  ns('circle', {cx:cx, cy:cy, r:Math.max(2, (hBody === 'sun' ? R_SUN : B.earth.R)*sc), fill:'#a8741a'}, svg);
  /* transfer half-ellipse: periapsis on the left of the focus, apoapsis on the right */
  var a = h.a*sc, e = h.e, b = a*Math.sqrt(1 - e*e), ecx = cx + (a - rI*sc);
  ns('path', {d:'M' + (cx - rI*sc) + ',' + cy + ' A' + a + ',' + b + ' 0 0 1 ' + (cx + rO*sc) + ',' + cy, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.5}, svg);
  ns('circle', {cx:cx - rI*sc, cy:cy, r:4, fill:'#b5452a'}, svg);
  ns('rect', {x:cx + rO*sc - 4, y:cy - 4, width:8, height:8, fill:'#b5452a'}, svg);
  txt(svg, 10, 290, T('dashed: inner orbit · solid: outer orbit · blue: transfer','пунктир: внутренняя · сплошная: внешняя · синяя: перелёт'), 'svg-small');
  /* bars */
  var bx = 318, bw = 44, base = 250, mx = Math.max(h.dv1, h.dv2, 0.5), bs = 190/mx;
  ns('line', {x1:bx - 10, y1:base, x2:470, y2:base, stroke:'#0b0b0c'}, svg);
  [[h.dv1, T('burn 1','импульс 1'), '#5f5f59'], [h.dv2, T('burn 2','импульс 2'), '#2f5aa1']].forEach(function(d, i){
    var x = bx + i*(bw + 26), hgt = d[0]*bs;
    ns('rect', {x:x, y:base - hgt, width:bw, height:hgt, fill:d[2], stroke:'#0b0b0c', 'stroke-width':i ? 1.5 : 0.5}, svg);
    txt(svg, x + bw/2, base - hgt - 5, fmt(d[0], 2), 'svg-label', 'middle');
    txt(svg, x + bw/2, base + 14, d[1], 'svg-small', 'middle');
  });
  txt(svg, 470, 18, T('km/s','км/с'), 'svg-small', 'end');
  var outerV = hR2 >= hR1 ? h.c2 : h.c1;
  var rows = [
    [T('BURN 1, AT THE START','ИМПУЛЬС 1, НА ИСХОДНОЙ ОРБИТЕ'), fmt(h.dv1, 3) + KMS()],
    [T('BURN 2, ON ARRIVAL','ИМПУЛЬС 2, ПО ПРИБЫТИИ'), fmt(h.dv2, 3) + KMS()],
    [T('TOTAL Δv','СУММАРНЫЙ Δv'), fmt(h.total, 3) + KMS()],
    [T('TIME OF FLIGHT','ВРЕМЯ ПЕРЕЛЁТА'), durText(h.tof)],
    [T('SPEED: START ORBIT → TRANSFER','СКОРОСТЬ: ИСХОДНАЯ ОРБИТА → ПЕРЕЛЁТ'), fmt(h.c1, 2) + ' → ' + fmt(h.t1, 2) + KMS(), 1],
    [T('SPEED: TRANSFER → FINAL ORBIT','СКОРОСТЬ: ПЕРЕЛЁТ → КОНЕЧНАЯ ОРБИТА'), fmt(h.t2, 2) + ' → ' + fmt(h.c2, 2) + KMS(), 1]
  ];
  if(di > 0) rows.push([T('SAME TURN MADE ALONE ON THE OUTER ORBIT','ТОТ ЖЕ ПОВОРОТ ОТДЕЛЬНО НА ВНЕШНЕЙ ОРБИТЕ'), fmt(planeChange(outerV, di), 3) + KMS() + T(' extra (combined: ',' дополнительно (совмещённый: ') + fmt(h.total - h.flat, 3) + ')', 1]);
  cells($('hReadout'), rows);
  $('hStatus').innerHTML = ratio > biThreshold()
    ? T('<b>Radius ratio ' + fmt(ratio, 1) + '.</b> Above 11.94 a three-burn route that first swings far outside the target can cost less Δv than this two-burn transfer, at the price of a much longer flight.',
        '<b>Отношение радиусов ' + fmt(ratio, 1) + '.</b> Выше 11,94 трёхимпульсный маршрут, сначала уходящий далеко за цель, может стоить меньше Δv, чем этот двухимпульсный перелёт, — ценой гораздо более долгого полёта.')
    : di > 0
      ? T('The plane is turned in the burn made on the larger orbit, where the craft is slowest: the turn adds ' + fmt(h.total - h.flat, 2) + ' km/s. Made as a separate burn on the outer orbit it would add ' + fmt(planeChange(outerV, di), 2) + ' km/s.',
          'Плоскость поворачивают импульсом на большей орбите — там, где аппарат медленнее всего: поворот добавляет ' + fmt(h.total - h.flat, 2) + ' км/с. Отдельным импульсом на внешней орбите он добавил бы ' + fmt(planeChange(outerV, di), 2) + ' км/с.')
      : out
        ? T('Two burns, both along the direction of flight. For radius ratios below 11.94 no other route between two circular orbits in the same plane needs less Δv.',
            'Два импульса, оба вдоль направления полёта. При отношении радиусов меньше 11,94 ни один другой маршрут между двумя круговыми орбитами в одной плоскости не требует меньшего Δv.')
        : T('Two burns, both against the direction of flight: to drop to a lower orbit the craft must slow down twice. For radius ratios below 11.94 no other route between two circular orbits in the same plane needs less Δv.',
            'Два импульса, оба против направления полёта: чтобы опуститься на более низкую орбиту, аппарат должен дважды затормозить. При отношении радиусов меньше 11,94 ни один другой маршрут между двумя круговыми орбитами в одной плоскости не требует меньшего Δv.');
}
function hSync(){ var q = HB[hBody]; h1.value = logPos(hR1, q.lo, q.hi); h2.value = logPos(hR2, q.lo, q.hi); }
h1.addEventListener('input', function(){ var q = HB[hBody]; hR1 = logVal(+h1.value, q.lo, q.hi); pressGroup($('hPre'), null); renderHoh(); });
h2.addEventListener('input', function(){ var q = HB[hBody]; hR2 = logVal(+h2.value, q.lo, q.hi); pressGroup($('hPre'), null); renderHoh(); });
hI.addEventListener('input', function(){ pressGroup($('hPre'), null); renderHoh(); });
var HPRE = {
  geo:   {b:'earth', r1:B.earth.R + 200, r2:B.earth.R + GEO_ALT, i:0},
  cape:  {b:'earth', r1:B.earth.R + 200, r2:B.earth.R + GEO_ALT, i:28.5},
  moon:  {b:'earth', r1:B.earth.R + 200, r2:384400, i:0},
  venus: {b:'sun', r1:AU, r2:B.venus.a, i:0},
  mars:  {b:'sun', r1:AU, r2:B.mars.a, i:0},
  jup:   {b:'sun', r1:AU, r2:B.jupiter.a, i:0},
  nep:   {b:'sun', r1:AU, r2:B.neptune.a, i:0}
};
each('#hPre .btn', function(b){ b.addEventListener('click', function(){
  var q = HPRE[b.dataset.k]; hBody = q.b; hR1 = q.r1; hR2 = q.r2; hI.value = q.i; hSync(); pressGroup($('hPre'), b); renderHoh();
}); });

/* ============ CH5 — OBERTH ============ */
var WB = {earth:B.earth, jupiter:B.jupiter, sun:B.sun};
var wBody = 'earth', wRp = B.earth.R + 200, wR = $('wR'), wV = $('wV'), wD = $('wD'), W_LO = 1.02, W_HI = 100;
function renderOb(){
  var P = WB[wBody], vinf = +wV.value, dv = +wD.value, o = oberth(P.mu, wRp, vinf, dv);
  $('wRVal').textContent = fmt(wRp/P.R, 2) + T(' radii (',' радиуса (') + fmtInt(wRp - P.R) + T(' km up)',' км над поверхностью)');
  $('wVVal').textContent = fmt(vinf, 1) + KMS(); $('wDVal').textContent = fmt(dv, 2) + KMS();
  [wR, wV, wD].forEach(function(el){ el.setAttribute('aria-valuetext', $(el.id + 'Val').textContent); });
  var svg = $('wSvg'); svg.innerHTML = '';
  var L = 46, R = 466, top = 26, bot = 236, oMin = oberth(P.mu, W_LO*P.R, vinf, dv);
  var need = oMin.vinfOut*1.05, step = 50;
  [25, 10, 5, 2.5, 2, 1, 0.5, 0.25].forEach(function(q){ if(4*q >= need) step = q; });
  var yMax = 4*step, tickDec = step < 0.5 ? 2 : (step % 1 ? 1 : 0);
  function X(x){ return L + Math.log(x/W_LO)/Math.log(W_HI/W_LO)*(R - L); }
  function Y(v){ return bot - v/yMax*(bot - top); }
  ns('line', {x1:L, y1:top, x2:L, y2:bot, stroke:'#0b0b0c'}, svg); ns('line', {x1:L, y1:bot, x2:R, y2:bot, stroke:'#0b0b0c'}, svg);
  [1.02, 2, 5, 10, 20, 50, 100].forEach(function(x){ ns('line', {x1:X(x), y1:bot, x2:X(x), y2:bot + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(x), bot + 15, x === 1.02 ? '1' : String(x), 'svg-small', 'middle'); });
  for(var g = 0; g <= 4; g++){ var v = yMax*g/4; ns('line', {x1:L - 4, y1:Y(v), x2:L, y2:Y(v), stroke:'#0b0b0c'}, svg); txt(svg, L - 7, Y(v) + 3, fmt(v, tickDec), 'svg-small', 'end'); }
  txt(svg, 8, 14, T('speed far away after the burn, km/s','скорость вдали после импульса, км/с'), 'svg-small');
  txt(svg, R, bot + 30, T('distance of the burn from the centre, in body radii (log)','расстояние точки импульса от центра, в радиусах тела (лог.)'), 'svg-small', 'end');
  var d = '';
  for(var k = 0; k <= 100; k++){ var x = W_LO*Math.pow(W_HI/W_LO, k/100), q = oberth(P.mu, x*P.R, vinf, dv); d += (k ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(q.vinfOut).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.5}, svg);
  ns('line', {x1:L, y1:Y(o.far), x2:R, y2:Y(o.far), stroke:'#b5452a', 'stroke-dasharray':'6 4', 'stroke-width':1.5}, svg);
  txt(svg, R - 4, Y(o.far) - 5, T('same burn far from the body','тот же импульс вдали от тела'), 'svg-small', 'end');
  ns('circle', {cx:X(wRp/P.R), cy:Y(o.vinfOut), r:5, fill:'#0b0b0c'}, svg);
  txt(svg, 8, 286, T('solid blue: burn at closest approach · dot: your choice','сплошная синяя: импульс в перицентре · точка: ваш выбор'), 'svg-small');
  txt(svg, 8, 300, T('dashed red: the same burn made far away','красный пунктир: тот же импульс вдали'), 'svg-small');
  cells($('wReadout'), [
    [T('SPEED AT CLOSEST APPROACH','СКОРОСТЬ В ПЕРИЦЕНТРЕ'), fmt(o.vp, 2) + KMS()],
    [T('BURN','ИМПУЛЬС'), fmt(dv, 2) + KMS()],
    [T('SPEED FAR AWAY, BURN AT CLOSEST APPROACH','СКОРОСТЬ ВДАЛИ, ИМПУЛЬС В ПЕРИЦЕНТРЕ'), fmt(o.vinfOut, 2) + KMS(), 1],
    [T('SPEED FAR AWAY, SAME BURN MADE FAR AWAY','СКОРОСТЬ ВДАЛИ, ТОТ ЖЕ ИМПУЛЬС ВДАЛИ'), fmt(o.far, 2) + KMS(), 1],
    [T('GAINED BY BURNING DEEP','ВЫИГРЫШ ОТ ИМПУЛЬСА В ГЛУБИНЕ'), '+' + fmt(o.gain, 2) + KMS()],
    [T('ENERGY PER KILOGRAM: DEEP ÷ FAR','ЭНЕРГИЯ НА КИЛОГРАММ: В ГЛУБИНЕ ÷ ВДАЛИ'), '× ' + fmt(o.dE/o.dEfar, 1)]
  ]);
  $('wStatus').innerHTML = T('The engine gives the same ' + fmt(dv, 2) + ' km/s wherever it fires. Fired at ' + fmt(o.vp, 1) + ' km/s it adds ' + fmt(o.dE, 1) + ' MJ to every kilogram of spacecraft; fired far away, where the craft moves at only ' + fmt(vinf, 1) + ' km/s, it adds ' + fmt(o.dEfar, 2) + ' MJ.',
    'Двигатель даёт одни и те же ' + fmt(dv, 2) + ' км/с, где бы он ни включался. При включении на скорости ' + fmt(o.vp, 1) + ' км/с каждый килограмм аппарата получает ' + fmt(o.dE, 1) + ' МДж; вдали, где скорость аппарата всего ' + fmt(vinf, 1) + ' км/с, — ' + fmt(o.dEfar, 2) + ' МДж.');
}
wR.addEventListener('input', function(){ wRp = WB[wBody].R*logVal(+wR.value, W_LO, W_HI); pressGroup($('wPre'), null); renderOb(); });
[wV, wD].forEach(function(el){ el.addEventListener('input', function(){ pressGroup($('wPre'), null); renderOb(); }); });
function wSync(){ wR.value = logPos(wRp/WB[wBody].R, W_LO, W_HI); }
each('#wBody .btn', function(b){ b.addEventListener('click', function(){
  var x = wRp/WB[wBody].R; wBody = b.dataset.b; wRp = x*WB[wBody].R; pressGroup($('wBody'), b); pressGroup($('wPre'), null); renderOb();
}); });
var WPRE = {mars:{b:'earth', rp:B.earth.R + 200, v:0, d:0.39}, jup:{b:'jupiter', rp:1.05*B.jupiter.R, v:6, d:1}, sun:{b:'sun', rp:10*R_SUN, v:0, d:1}};
each('#wPre .btn', function(b){ b.addEventListener('click', function(){
  var q = WPRE[b.dataset.k]; wBody = q.b; wRp = q.rp; wV.value = q.v; wD.value = q.d; wSync();
  pressGroup($('wBody'), document.querySelector('#wBody .btn[data-b="' + q.b + '"]')); pressGroup($('wPre'), b); renderOb();
}); });

/* ============ CH6 — Δv MAP ============ */
var mSel = 'mars', mGround = false, MAP = dvMap();
function renderMap(){
  var rows = MAP.slice().sort(function(a, b){ return a.total - b.total; }), add = mGround ? ASCENT : 0;
  var svg = $('mSvg'); svg.innerHTML = '';
  var L = 168, R = 430, top = 30, rowH = 20, mx = 14 + add, sc = (R - L)/mx;
  svg.setAttribute('viewBox', '0 0 480 ' + (top + rowH*rows.length + 54));
  txt(svg, 10, 16, mGround ? T('Δv FROM THE GROUND, km/s','Δv ОТ ПОВЕРХНОСТИ ЗЕМЛИ, км/с') : T('Δv FROM A 200 km LOW EARTH ORBIT, km/s','Δv С НИЗКОЙ ОКОЛОЗЕМНОЙ ОРБИТЫ 200 км, км/с'), 'svg-small');
  for(var g = 0; g <= mx; g += (mGround ? 4 : 2)){ ns('line', {x1:L + g*sc, y1:top - 4, x2:L + g*sc, y2:top + rowH*rows.length, stroke:'#d8d8d0'}, svg); txt(svg, L + g*sc, top + rowH*rows.length + 13, String(g), 'svg-small', 'middle'); }
  var SHORT = {gto:['GTO','ГПО'], geo:['GEO (equatorial)','ГСО (с экватора)'], geo28:['GEO (from 28.5°)','ГСО (с 28,5°)'], esc:['Earth escape','Уход от Земли'], tli:['Moon flyby','Пролёт Луны'], llo:['Lunar orbit','Орбита у Луны'], lsurf:['Lunar surface','Поверхность Луны'],
    venus:['Venus flyby','Пролёт Венеры'], venuslo:['Venus orbit','Орбита у Венеры'], mars:['Mars flyby / entry','Марс: пролёт / вход'], marslo:['Mars orbit','Орбита у Марса'], mercury:['Mercury flyby','Пролёт Меркурия'], mercurylo:['Mercury orbit','Орбита у Меркурия'], jupiter:['Jupiter flyby','Пролёт Юпитера'], solesc:['Solar escape','Уход от Солнца']};
  var defs = ns('defs', {}, svg), pat = ns('pattern', {id:'mHatch', width:5, height:5, patternUnits:'userSpaceOnUse', patternTransform:'rotate(45)'}, defs);
  ns('rect', {width:5, height:5, fill:'#d0d0c8'}, pat); ns('rect', {width:2, height:5, fill:'#55554f'}, pat);
  var FILL = ['#2f5aa1', 'url(#mHatch)', '#0b0b0c'];
  rows.forEach(function(r, i){
    var y = top + i*rowH, on = r.id === mSel, x = L;
    txt(svg, L - 6, y + 13, T(SHORT[r.id][0], SHORT[r.id][1]), on ? 'svg-label' : 'svg-small', 'end');
    if(mGround){ ns('rect', {x:x, y:y + 3, width:ASCENT*sc, height:12, fill:'#fff', stroke:'#0b0b0c', 'stroke-dasharray':'3 2'}, svg); x += ASCENT*sc; }
    r.legs.forEach(function(l, j){ ns('rect', {x:x, y:y + 3, width:l[2]*sc, height:12, fill:FILL[j], stroke:'#0b0b0c', 'stroke-width':0.5}, svg); x += l[2]*sc; });
    if(on) ns('rect', {x:L - 1, y:y + 1, width:x - L + 2, height:16, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
    txt(svg, x + 5, y + 13, fmt(r.total + add, 2), on ? 'svg-label' : 'svg-small');
  });
  txt(svg, 10, top + rowH*rows.length + 30, T('blue: leaving Earth orbit · hatched: burn on arrival','синее: уход с околоземной орбиты · штриховка: импульс по прибытии'), 'svg-small');
  txt(svg, 10, top + rowH*rows.length + 44, T('black: landing','чёрное: посадка') + (mGround ? T(' · dashed box: ascent, quoted',' · пунктирная рамка: выведение, по источнику') : ''), 'svg-small');
  var r = MAP.filter(function(q){ return q.id === mSel; })[0];
  var rws = [[T('DESTINATION','ЦЕЛЬ'), T(r.en, r.ru), 1]];
  if(mGround) rws.push([T('GROUND TO 200 km ORBIT (QUOTED, NOT COMPUTED)','ОТ ЗЕМЛИ ДО ОРБИТЫ 200 км (ПО ИСТОЧНИКУ, НЕ РАСЧЁТ)'), fmt(ASCENT, 1) + KMS(), 1]);
  r.legs.forEach(function(l){ rws.push([T(l[0], l[1]).toUpperCase().replace(/KM/g, 'km').replace(/КМ/g, 'км'), fmt(l[2], 2) + KMS(), 1]); });
  rws.push([T('TOTAL','ИТОГО'), fmt(r.total + add, 2) + KMS(), 1]);
  cells($('mReadout'), rws);
  var me = mercuryEnds(), nhV = Math.sqrt(C3_NEW_HORIZONS), nhDv = depart(B.earth.mu, B.earth.R + LEO_ALT, nhV);
  var NOTE = {
    mars:T('A lander that flies straight into the atmosphere needs only this burn: Mars\'s air removes the arrival speed. The short powered landing at the end is not counted.','Посадочному аппарату, который входит прямо в атмосферу, нужен только этот импульс: скорость подлёта гасит воздух Марса. Короткий заключительный участок посадки на двигателях не учтён.'),
    marslo:T('Dearer than landing through the atmosphere. Real orbiters brake into a long ellipse, which costs far less than this all-engine figure; several have then lowered it by aerobraking.','Дороже, чем посадка через атмосферу. Реальные орбитальные аппараты тормозят на вытянутый эллипс — это гораздо дешевле, чем здесь, где всё до низкой орбиты делают двигатели; некоторые затем снижали его аэроторможением.'),
    mercury:T('A mean for a circular orbit at Mercury\'s average distance. Its real orbit is far from circular: by the same method this burn is ' + fmt(me[1].dep, 1) + ' km/s for arrival at aphelion and ' + fmt(me[0].dep, 1) + ' at perihelion.','Среднее значение для круговой орбиты на среднем расстоянии Меркурия. Его реальная орбита далека от круговой: тем же методом этот импульс равен ' + fmt(me[1].dep, 1) + ' км/с при прибытии в афелий и ' + fmt(me[0].dep, 1) + ' — в перигелий.'),
    venus:T('As for Mars, an entry probe needs only the departure burn.','Как и для Марса, спускаемому аппарату нужен только разгонный импульс.'),
    mercurylo:T('Dearer than leaving the Solar System: the craft arrives much faster than Mercury moves and the small planet does little to hold it. Mercury\'s orbit is far from circular, so the total ranges from ' + fmt(me[0].total, 1) + ' km/s (arrival at perihelion) to ' + fmt(me[1].total, 1) + ' (aphelion), before the cost of its 7° tilt. Real missions shed the speed with years of flybys.','Дороже, чем уход из Солнечной системы: аппарат подлетает намного быстрее, чем движется Меркурий, а маленькая планета его почти не удерживает. Орбита Меркурия далека от круговой, поэтому сумма меняется от ' + fmt(me[0].total, 1) + ' км/с (прибытие в перигелий) до ' + fmt(me[1].total, 1) + ' (в афелий), не считая затрат на наклонение 7°. Реальные миссии годами гасят скорость пролётами планет.'),
    solesc:T('No flybys. Of the five craft now leaving the Solar System, four needed Jupiter to get there. New Horizons (2006) was launched fast enough on its own: its launch energy corresponds to ' + fmt(nhV, 2) + ' km/s beyond the Earth, a burn of ' + fmt(nhDv, 2) + ' km/s from this orbit, and it used Jupiter only to shorten the trip.','Без пролётов планет. Из пяти аппаратов, которые сейчас уходят из Солнечной системы, четырём для этого понадобился Юпитер. «Новые горизонты» (2006) стартовали достаточно быстро сами: энергия их запуска соответствует ' + fmt(nhV, 2) + ' км/с сверх скорости Земли, то есть импульсу ' + fmt(nhDv, 2) + ' км/с с этой орбиты, а Юпитер они использовали только чтобы сократить путь.'),
    lsurf:T('Ideal, with no hover and no gravity loss. Apollo 11\'s ascent, the same trip in reverse, used about 9 % more than the ideal figure.','Идеальный случай, без зависания и гравитационных потерь. Взлёт «Аполлона-11» — тот же путь в обратную сторону — потребовал примерно на 9 % больше идеального значения.'),
    geo28:T('The 28.5° is the latitude of Cape Canaveral: a launch due east from there enters an orbit tilted by that much.','28,5° — широта мыса Канаверал: при пуске оттуда точно на восток орбита получает такое наклонение.')
  };
  $('mStatus').innerHTML = NOTE[mSel] || T('Ideal impulsive burns under the stated assumptions; real missions add losses, margins and course corrections.','Идеальные мгновенные импульсы при названных допущениях; реальные миссии добавляют потери, запасы и коррекции траектории.');
  /* data table */
  var tb = $('mTable'), hd = '<tr><th scope="col">' + T('Destination','Цель') + '</th><th scope="col">' + T('Leaving Earth orbit','Уход с околоземной орбиты') + '</th><th scope="col">' + T('Burn on arrival','Импульс по прибытии') + '</th><th scope="col">' + T('Landing','Посадка') + '</th><th scope="col">' + T('From 200 km orbit','С орбиты 200 км') + '</th><th scope="col">' + T('From the ground (+9.3)','От Земли (+9,3)') + '</th></tr>';
  tb.innerHTML = '<caption class="sr-cap">' + T('Δv map, km/s','Карта Δv, км/с') + '</caption>' + hd + rows.map(function(q){
    return '<tr><th scope="row">' + T(q.en, q.ru) + '</th>' + [0, 1, 2].map(function(j){ return '<td class="n">' + (q.legs[j] ? fmt(q.legs[j][2], 2) : '—') + '</td>'; }).join('') + '<td class="n">' + fmt(q.total, 2) + '</td><td class="n">' + fmt(q.total + ASCENT, 2) + '</td></tr>';
  }).join('');
}
each('#mPick .btn', function(b){ b.addEventListener('click', function(){ mSel = b.dataset.id; pressGroup($('mPick'), b); renderMap(); }); });
each('#mBasis .btn', function(b){ b.addEventListener('click', function(){ mGround = b.dataset.g === '1'; pressGroup($('mBasis'), b); renderMap(); }); });

/* ============ CH7 — PROPULSION TABLE (published figures; exhaust velocity and jet power computed) ============ */
var LBF = 4.4482216;                                         // N per pound-force
var PROP = [
  {en:'Solid booster (Space Shuttle SRB)', ru:'Твердотопливный ускоритель (шаттл)', isp:242, at:'sl', F:2800e3*LBF, ref:19, sEn:'flown', sRu:'летал'},
  {en:'Kerosene + oxygen (F-1, Saturn V)', ru:'Керосин + кислород (F-1, «Сатурн-5»)', isp:265, at:'sl', F:1522000*LBF, ref:'11][12', sEn:'flown', sRu:'летал'},
  {en:'Hydrogen + oxygen (RS-25)', ru:'Водород + кислород (RS-25)', isp:452.3, at:'vac', F:512300*LBF, ref:13, sEn:'flown', sRu:'летал'},
  {en:'Nuclear thermal (NERVA XE-Prime)', ru:'Ядерный ракетный двигатель (NERVA XE-Prime)', isp:710, at:'vac', F:246663, ref:31, sEn:'ground-tested 1969, never flown', sRu:'наземные испытания 1969 года, не летал'},
  {en:'Hall thruster (1.35 kW SPT)', ru:'Холловский двигатель (СПД, 1,35 кВт)', isp:16000/G0, at:'vac', F:null, P:1350, eff:0.5, ref:'17][30', sEn:'type flown since 1972', sRu:'тип летает с 1972 года'},
  {en:'Ion thruster (NSTAR)', ru:'Ионный двигатель (NSTAR)', isp:3100, at:'vac', F:0.092, P:2300, ref:14, sEn:'flown', sRu:'летал'},
  {en:'Ion thruster (NEXT)', ru:'Ионный двигатель (NEXT)', isp:4100, at:'vac', F:0.236, P:6900, ref:14, sEn:'in ground testing in the 2008 source', sRu:'по источнику 2008 года — наземные испытания'},
  {en:'Solar sail (IKAROS)', ru:'Солнечный парус (IKAROS)', isp:null, at:'', F:0.00112, ref:20, sEn:'flown; uses no propellant', sRu:'летал; топливо не расходует'}
];
function jetPower(F, isp){ return 0.5*F*isp*G0; }                           // W
function thrustFromPower(P, eff, ve){ return 2*eff*P/ve; }                 // N, ve in m/s
function fText(F){ return F >= 1e6 ? fmt(F/1e6, 2) + T(' MN',' МН') : F >= 1e3 ? fmt(F/1e3, 0) + T(' kN',' кН') : F >= 1 ? fmt(F, 1) + T(' N',' Н') : fmt(F*1000, F < 0.01 ? 2 : 0) + T(' mN',' мН'); }
function renderProp(){
  var hd = '<tr>' + [T('Type (example)','Тип (пример)'), T('Specific impulse','Удельный импульс'), T('Exhaust velocity','Скорость истечения'), T('Thrust','Тяга'), T('Jet power ÷ input power','Мощность струи ÷ потребляемая'), T('Status','Статус'), T('Source','Источник')].map(function(h){ return '<th scope="col">' + h + '</th>'; }).join('') + '</tr>';
  $('pTable').innerHTML = '<caption class="sr-cap">' + T('Propulsion types compared','Сравнение типов двигателей') + '</caption>' + hd + PROP.map(function(p){
    var F = p.F !== null ? p.F : (p.P ? thrustFromPower(p.P, p.eff, p.isp*G0) : null);
    var eff = p.P ? (p.eff ? p.eff : jetPower(p.F, p.isp)/p.P) : null;
    return '<tr><th scope="row">' + T(p.en, p.ru) + '</th><td class="n">' + (p.isp ? fmtInt(p.isp) + T(' s',' с') + (p.at === 'sl' ? T(' (sea level)',' (у земли)') : '') : '—') + '</td><td class="n">' + (p.isp ? fmt(vex(p.isp), 2) + KMS() : '—') + '</td><td class="n">' +
      (p.F === null ? '≈ ' : '') + fText(F) + '</td><td class="n">' + (eff ? fmtInt(eff*100) + (lang === 'ru' ? ' %' : '%') + (p.eff ? T(' (claimed)',' (заявлено)') : '') : '—') + '</td><td>' + T(p.sEn, p.sRu) + '</td><td class="n">[' + p.ref + ']</td></tr>';
  }).join('');
}

/* ============ TIMELINE ============ */
var TIMELINE = [
  ['1687', 'Isaac Newton publishes the laws of motion and of gravitation in the Principia. Between them they contain both the rocket and the orbit.', 'Исаак Ньютон публикует в «Началах» законы движения и закон тяготения. В них уже заключены и ракета, и орбита.'],
  ['1903', 'Konstantin Tsiolkovsky publishes “Exploration of the Universe with Reaction Machines” in the journal Nauchnoe Obozrenie, with the rocket equation; a surviving page with the final equations is dated 25 August 1898.', 'Константин Циолковский публикует в журнале «Научное обозрение» статью «Исследование мировых пространств реактивными приборами» с уравнением ракеты; сохранившийся лист с окончательными формулами датирован 25 августа 1898 года.'],
  ['1913', 'The Journal de physique prints Robert Esnault-Pelterie\'s lecture of 15 November 1912 to the French Physical Society, on what a rocket\'s continuous loss of mass makes possible; he finds the mass ratios for a trip to the Moon out of reach of ordinary fuels.', '«Journal de physique» печатает доклад Робера Эсно-Пельтри, прочитанный 15 ноября 1912 года во Французском физическом обществе, — о том, что даёт ракете непрерывная потеря массы; отношения масс для полёта к Луне он находит недостижимыми на обычных топливах.'],
  ['1920', 'The Smithsonian Institution publishes Robert Goddard\'s “A Method of Reaching Extreme Altitudes”.', 'Смитсоновский институт публикует работу Роберта Годдарда «Метод достижения предельных высот».'],
  ['1925', 'Walter Hohmann publishes “The Attainability of Heavenly Bodies”, with the two-burn transfer that now carries his name.', 'Вальтер Гоман публикует книгу «Достижимость небесных тел» с двухимпульсным перелётом, который теперь носит его имя.'],
  ['1926', 'On 16 March Goddard flies the first liquid-fuel rocket, burning gasoline and liquid oxygen, at Auburn, Massachusetts.', '16 марта в Оберне (штат Массачусетс) Годдард запускает первую ракету на жидком топливе — бензине и жидком кислороде.'],
  ['1929', 'Hermann Oberth\'s “Ways to Spaceflight” sets out, among much else, why a burn made deep in a gravity well is worth more.', 'Книга Германа Оберта «Пути осуществления космического полёта» объясняет, среди прочего, почему импульс в глубине гравитационного колодца ценнее.'],
  ['1929', 'Yuri Kondratyuk (born Aleksandr Shargei) publishes “The Conquest of Interplanetary Space” at his own expense. For a Moon landing he proposes leaving the main craft in orbit around the Moon and descending in a smaller one.', 'Юрий Кондратюк (при рождении Александр Шаргей) на собственные средства издаёт книгу «Завоевание межпланетных пространств». Для посадки на Луну он предлагает оставить основной корабль на орбите вокруг Луны и спускаться на меньшем аппарате.'],
  ['1934', 'Ary Sternfeld sends the French Academy of Sciences a note on transfers that go far out and come back; for distant targets they can beat the two-burn route.', 'Ари Штернфельд направляет во Французскую академию наук заметку о перелётах, уходящих далеко и возвращающихся обратно; для далёких целей они могут быть выгоднее двухимпульсного маршрута.'],
  ['1957', 'Sputnik 1 reaches orbit on 4 October: for the first time a rocket gives its payload orbital speed.', '«Спутник-1» 4 октября выходит на орбиту: ракета впервые сообщает грузу орбитальную скорость.'],
  ['1969', 'Apollo 11 leaves Earth orbit on 16 July at 10.83 km/s, 99.4 % of escape speed at that height. The same year the NERVA XE-Prime nuclear engine is run on a test stand.', '«Аполлон-11» 16 июля уходит с околоземной орбиты на скорости 10,83 км/с — 99,4 % скорости убегания на этой высоте. В том же году на стенде работает ядерный двигатель NERVA XE-Prime.'],
  ['1972', 'A Soviet Meteor satellite, launched in December 1971, carries out the first flight test of a Hall thruster, developed by Alexey Morozov\'s group at the Kurchatov Institute and built by the Fakel design bureau.', 'Советский спутник «Метеор», запущенный в декабре 1971 года, проводит первое лётное испытание холловского двигателя, разработанного группой Алексея Морозова в Курчатовском институте и изготовленного в ОКБ «Факел».'],
  ['2006', 'New Horizons leaves the Earth with a launch energy of 157.75 km²/s², enough to escape the Sun with no help from a planet.', '«Новые горизонты» покидают Землю с энергией запуска 157,75 км²/с² — этого достаточно, чтобы уйти от Солнца без помощи планет.'],
  ['2010', 'Japan\'s IKAROS measures 1.12 mN of thrust from sunlight on its sail: propulsion with no propellant.', 'Японский IKAROS измеряет тягу 1,12 мН от солнечного света на парусе: движение без расхода топлива.'],
  ['2018', 'Dawn runs out of hydrazine after its ion engines have changed its velocity by almost 11.5 km/s, a record for an on-board propulsion system at the time.', 'У аппарата Dawn заканчивается гидразин; к этому времени ионные двигатели изменили его скорость почти на 11,5 км/с — на тот момент рекорд для бортовой двигательной установки.'],
  ['2024', 'Parker Solar Probe passes 3.8 million miles above the Sun on 24 December at about 430,000 mph, roughly 192 km/s: its record speed, matched on later passes.', 'Parker Solar Probe 24 декабря проходит в 3,8 млн миль над Солнцем со скоростью около 430 000 миль в час — примерно 192 км/с: это его рекордная скорость, повторённая на следующих витках.'],
  ['2025', 'DARPA and NASA end DRACO, the planned flight test of a nuclear thermal rocket, before it flies.', 'DARPA и NASA закрывают DRACO — запланированное лётное испытание ядерного ракетного двигателя — до полёта.']
];

/* ============ REFERENCES ============ */
var REFERENCES = [
  {title:'NASA NSSDCA, Planetary Fact Sheet (metric)', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note:{en:'GM, radius and semi-major axis of each planet; published escape velocities (Mercury 4.3, Venus 10.4, Earth 11.2, Moon 2.4, Mars 5.0, Jupiter 59.5 km/s) and orbital velocities (Venus 35.0, Earth 29.8, Mars 24.1, Jupiter 13.1 km/s) used as checks; Mercury\'s eccentricity 0.2056 (its fact sheet, mercuryfact.html), which is why its mean speed of 47.4 km/s is not the circular speed at its mean distance.', ru:'GM, радиус и большая полуось каждой планеты; опубликованные скорости убегания (Меркурий 4,3, Венера 10,4, Земля 11,2, Луна 2,4, Марс 5,0, Юпитер 59,5 км/с) и орбитальные скорости (Венера 35,0, Земля 29,8, Марс 24,1, Юпитер 13,1 км/с), использованные для проверки; эксцентриситет Меркурия 0,2056 (его справочный лист, mercuryfact.html) — поэтому его средняя скорость 47,4 км/с не равна круговой на среднем расстоянии.'}},
  {title:'NASA NSSDCA, Earth, Moon and Sun Fact Sheets', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'Earth: GM 0.39860 × 10⁶ km³/s², equatorial radius 6,378.137 km, escape velocity 11.186 km/s, 29.78 km/s around the Sun, sidereal rotation 23.9345 h. Moon (moonfact.html): GM 0.00490 × 10⁶, radius 1,737.4 km, escape 2.38 km/s, semi-major axis 384,400 km, 1.022 km/s, 27.3217 days. Sun (sunfact.html): GM 132,712 × 10⁶, radius 695,700 km, escape 617.6 km/s.', ru:'Земля: GM 0,39860 × 10⁶ км³/с², экваториальный радиус 6378,137 км, скорость убегания 11,186 км/с, 29,78 км/с вокруг Солнца, звёздные сутки 23,9345 ч. Луна (moonfact.html): GM 0,00490 × 10⁶, радиус 1737,4 км, скорость убегания 2,38 км/с, большая полуось 384 400 км, 1,022 км/с, 27,3217 сут. Солнце (sunfact.html): GM 132 712 × 10⁶, радиус 695 700 км, скорость убегания 617,6 км/с.'}},
  {title:'NASA JPL, Basics of Space Flight, Chapter 3: Gravity & Mechanics', url:'https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/', note:{en:'Newton\'s cannon as the picture of an orbit; raising the apoapsis by adding energy at periapsis.', ru:'Пушка Ньютона как образ орбиты; подъём апоцентра добавлением энергии в перицентре.'}},
  {title:'K. E. Tsiolkovskiy, Collected Works, Vol. II: Reactive Flying Machines, NASA Technical Translation TT F-237 (1965)', url:'https://www.tsiolkovsky.org/wp-content/uploads/2021/10/288-tsiolkovsky-collected-works-volume-2-reactive-flying-machines-english-1948.pdf', note:{en:'English translation of the 1954 USSR Academy of Sciences edition; includes “Exploration of the Universe with Reaction Machines”, first published in 1903 in Nauchnoe Obozrenie (No. 5), with the rocket equation; Tsiolkovsky\'s own note there says a surviving page with the final equations is dated 25 August 1898 and that he had been working on rocket theory earlier still.', ru:'Английский перевод издания Академии наук СССР 1954 года; содержит работу «Исследование мировых пространств реактивными приборами», впервые опубликованную в 1903 году в «Научном обозрении» (№ 5), с уравнением ракеты; в примечании самого Циолковского сказано, что сохранившийся лист с окончательными формулами датирован 25 августа 1898 года, а теорией ракет он занимался и раньше.'}},
  {title:'NASA, “Dr. Robert H. Goddard, American Rocketry Pioneer”', url:'https://www.nasa.gov/dr-robert-h-goddard-american-rocketry-pioneer/', note:{en:'First liquid-fuel rocket flight on 16 March 1926 at Auburn, Massachusetts, on liquid oxygen and gasoline; “A Method of Reaching Extreme Altitudes”, Smithsonian Miscellaneous Publication No. 2540, January 1920.', ru:'Первый полёт ракеты на жидком топливе 16 марта 1926 года в Оберне (Массачусетс), на жидком кислороде и бензине; «Метод достижения предельных высот», издание Смитсоновского института № 2540, январь 1920 года.'}},
  {title:'W. Hohmann (1925), Die Erreichbarkeit der Himmelskörper; English: The Attainability of Heavenly Bodies, NASA Technical Translation F-44 (1960)', url:'https://archive.org/details/nasa_techdoc_19980230631', note:{en:'The original account of the minimum-energy two-burn transfer between circular orbits.', ru:'Первое изложение двухимпульсного перелёта с минимумом энергии между круговыми орбитами.'}},
  {title:'H. Oberth (1929), Wege zur Raumschiffahrt; English: Ways to Spaceflight, NASA Technical Translation F-622 (1972)', url:'https://archive.org/details/nasa_techdoc_19720008133', note:{en:'Oberth\'s treatise on rocket and trajectory theory, the source of the effect named after him.', ru:'Труд Оберта по теории ракет и траекторий — источник эффекта, названного его именем.'}},
  {title:'A. Sternfeld (1934), “Sur les trajectoires permettant d\'approcher d\'un corps attractif central à partir d\'une orbite keplérienne donnée”, Comptes rendus de l\'Académie des sciences 198, 711–713; cited from D. Briot (2012), “Is it the first use of the word Astrobiology?”, arXiv:1207.1491', url:'https://arxiv.org/abs/1207.1491', note:{en:'The 1934 note to the French Academy of Sciences usually cited for the bi-elliptic transfer; the note itself was not consulted. The link is to a paper on another subject, used here for its biographical paragraph and its reference list, which give the note\'s title and pages; the credit itself is stated by M. Lingam and A. Loeb, arXiv:2004.11312 (“Sternfeld is known to have presented the mathematical details underpinning bi-elliptic transfer”). The thresholds 11.94 and 15.58 on this page are recomputed in the page\'s own checks.', ru:'Заметка 1934 года во Французской академии наук, на которую обычно ссылаются как на источник биэллиптического перелёта; сама заметка не просматривалась. Ссылка ведёт на статью на другую тему, из которой взяты биографический абзац и список литературы с названием и страницами заметки; саму заслугу называют М. Лингам и А. Лёб, arXiv:2004.11312. Пороги 11,94 и 15,58 пересчитаны в проверках этой страницы.'}},
  {title:'D. A. Vallado, Fundamentals of Astrodynamics and Applications, 5th ed. (Microcosm Press, 2022), chapter on orbital manoeuvres', url:'https://celestrak.org/software/vallado-sw.php', note:{en:'Standard textbook: vis-viva, Hohmann and bi-elliptic transfers (Hohmann cheaper below a radius ratio of 11.94; any bi-elliptic cheaper above 15.58), combined plane changes.', ru:'Стандартный учебник: интеграл энергии, гомановский и биэллиптический перелёты (гомановский дешевле при отношении радиусов меньше 11,94; любой биэллиптический дешевле выше 15,58), совмещённый поворот плоскости.'}},
  {title:'R. W. Humble, G. N. Henry, W. J. Larson (1995), Space Propulsion Analysis and Design (McGraw-Hill), LEO velocity budgets, as reproduced in J. Seitzman, Georgia Tech AE 4451 “Rocket Vehicle Acceleration”', url:'https://seitzman.gatech.edu/classes/ae4451/vehicle_acceleration.pdf', note:{en:'Ascent Δv after the credit for Earth\'s rotation: Saturn V 9,267 m/s (7,798 orbital + 1,534 gravity + 40 drag + 243 steering − 348 rotation), Space Shuttle 9,086 (+144 to circularise), Atlas I 9,243, Delta 7925 8,814; “between 8.8 and 9.3 km/s for these selected launch vehicles”.', ru:'Δv выведения с учётом вращения Земли: «Сатурн-5» 9267 м/с (7798 орбитальная + 1534 гравитационные + 40 аэродинамические + 243 на управление − 348 вращение), шаттл 9086 (+144 на скругление), Atlas I 9243, Delta 7925 8814; «от 8,8 до 9,3 км/с для этих носителей».'}},
  {title:'R. W. Orloff (2000), Apollo by the Numbers, NASA SP-2000-4029: Apollo 11 translunar and lunar-orbit phases', url:'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11f_Translunar_Phase.htm', note:{en:'Translunar injection cutoff at 180.581 nautical miles and 35,545.6 ft/s (space-fixed). Lunar orbit (Apollo_11g_Lunar_Orbit_Phase.htm): arrival at 8,250.0 ft/s at 86.7 n mi; insertion burn 2,917.5 ft/s into 169.7 × 60.0 n mi; circularisation 158.8 ft/s; lunar-module ascent 6,070.1 ft/s into 48.0 × 9.4 n mi. F-1 rated thrust 1,522,000 lbf.', ru:'Отсечка двигателя при выходе на траекторию к Луне: высота 180,581 морской мили, 35 545,6 фута/с (в инерциальной системе). Окололунная орбита (Apollo_11g_Lunar_Orbit_Phase.htm): подлёт 8250,0 фута/с на высоте 86,7 мор. мили; тормозной импульс 2917,5 фута/с, орбита 169,7 × 60,0 мор. мили; скругление 158,8 фута/с; взлёт лунного модуля 6070,1 фута/с на орбиту 48,0 × 9,4 мор. мили. Номинальная тяга F-1 — 1 522 000 фунтов силы.'}},
  {title:'Rocketdyne / NASA MSFC, “F-1 Saturn V First Stage Engine” (NTRS 20100027316)', url:'https://ntrs.nasa.gov/citations/20100027316', note:{en:'F-1: about 1.5 million lbf of thrust and a specific impulse of 265 s.', ru:'F-1: тяга около 1,5 млн фунтов силы и удельный импульс 265 с.'}},
  {title:'L3Harris (2024), RS-25 Propulsion System specification sheet', url:'https://l3harris.com/sites/default/files/2024-07/l3harris-ar-rs-25-spec-sheet.pdf', note:{en:'Maximum thrust at 109 % power: 418,000 lb at sea level, 512,300 lb in vacuum; specific impulse in vacuum 452.3 s.', ru:'Максимальная тяга на режиме 109 %: 418 000 фунтов у земли, 512 300 фунтов в вакууме; удельный импульс в вакууме 452,3 с.'}},
  {title:'M. J. Patterson, S. W. Benson (2008), “NEXT Ion Propulsion System Development Status and Performance”, NASA/TM-2008-214986', url:'https://ntrs.nasa.gov/api/citations/20080010688/downloads/20080010688.pdf', note:{en:'Table 1: NEXT 0.5–6.9 kW, over 4,100 s, 236 mN, efficiency over 70 %; NSTAR 0.5–2.3 kW, over 3,100 s, 92 mN, over 61 %.', ru:'Таблица 1: NEXT — 0,5–6,9 кВт, более 4100 с, 236 мН, КПД выше 70 %; NSTAR — 0,5–2,3 кВт, более 3100 с, 92 мН, выше 61 %.'}},
  {title:'M. D. Rayman, C. E. Garner (2018), “In-Flight Operation of the Dawn Ion Propulsion System Through Completion of the Final Orbit Around Dwarf Planet Ceres” (NTRS 20210008613)', url:'https://ntrs.nasa.gov/citations/20210008613', note:{en:'About 51,250 hours of thrusting, about 416 kg of xenon, almost 11.5 km/s: “a record for an on-board propulsion system”.', ru:'Около 51 250 часов работы, около 416 кг ксенона, почти 11,5 км/с — «рекорд для бортовой двигательной установки».'}},
  {title:'NASA Science, Dawn: Ion Propulsion; NSSDCA Master Catalog, Dawn (2007-043A)', url:'https://science.nasa.gov/mission/dawn/technology/ion-propulsion/', note:{en:'91 mN at full thrust, about the force needed to hold up a sheet of paper; four days from 0 to 60 mph; 425 kg of xenon at launch. Launch mass 1,217.7 kg from the NSSDCA record (nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A).', ru:'91 мН на полной тяге — примерно сила, нужная, чтобы удержать лист бумаги; четверо суток от 0 до 60 миль в час; 425 кг ксенона на старте. Стартовая масса 1217,7 кг — по записи NSSDCA (nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A).'}},
  {title:'J. R. Brophy (1992), “Stationary Plasma Thruster Evaluation in Russia”, JPL (NTRS 19930016017)', url:'https://ntrs.nasa.gov/citations/19930016017', note:{en:'A 1.35 kW Soviet-developed Hall thruster: claimed exhaust velocity 16,000 m/s and efficiency 50 %, measured close to the claims; more than fifty of the 660 W thrusters reported flown.', ru:'Холловский двигатель советской разработки мощностью 1,35 кВт: заявленная скорость истечения 16 000 м/с и КПД 50 %, измерения близки к заявленным; сообщается о более чем пятидесяти лётных двигателях мощностью 660 Вт.'}},
  {title:'Budget of the U.S. Government, Fiscal Year 2027, NASA chapter; and Breaking Defense (27 June 2025), “DARPA\'s DRACO nuclear propulsion project roars no more”', url:'https://www.govinfo.gov/content/pkg/BUDGET-2027-BUD/pdf/BUDGET-2027-BUD-21.pdf', note:{en:'The budget records “the closeout of the Demonstration Rocket for Agile Cislunar Operations, known as DRACO, an in-space nuclear thermal rocket engine demonstration” with DARPA. The trade-press report (breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/) quotes DARPA\'s deputy director on the decision to end it.', ru:'В бюджете записано «закрытие проекта DRACO — демонстрации ядерного ракетного двигателя в космосе» совместно с DARPA. В сообщении отраслевого издания (breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/) о решении закрыть проект говорит заместитель директора DARPA.'}},
  {title:'R. Wilkerson (2019), “Nuclear Thermal Propulsion: An Overview of NASA Development Efforts” (NTRS 20190033337)', url:'https://ntrs.nasa.gov/api/citations/20190033337/downloads/20190033337.pdf', note:{en:'Rover/NERVA 1955–1972: 20 reactors built and tested for about $1.4 billion; specific-impulse capability 825–850 s for the engine cycle tested on NERVA XE and 850–875 s for the cycle chosen for the flight engine; engines of 25 to 250 thousand lbf; XE started 28 times in 1969. Comparison table: Shuttle solid booster 242 s and 2.8 million lbf at sea level; ion engines 2,000–8,000 s.', ru:'Rover/NERVA, 1955–1972: 20 реакторов построено и испытано примерно за 1,4 млрд долларов; достижимый удельный импульс 825–850 с для схемы, испытанной на NERVA XE, и 850–875 с для схемы, выбранной для лётного двигателя; двигатели на 25–250 тыс. фунтов силы; XE запускали 28 раз в 1969 году. Сравнительная таблица: твердотопливный ускоритель шаттла — 242 с и 2,8 млн фунтов силы у земли; ионные двигатели — 2000–8000 с.'}},
  {title:'JAXA (2010), “Confirmation of Photon Acceleration” of IKAROS, press release 9 July 2010', url:'https://www.jaxa.jp/press/2010/07/20100709_ikaros_e.html', note:{en:'Thrust from sunlight on the sail: 1.12 mN, measured by Doppler tracking.', ru:'Тяга солнечного света на парусе: 1,12 мН, по доплеровским измерениям.'}},
  {title:'NASA (2024), “NASA\'s Parker Solar Probe Makes History With Closest Pass to Sun”', url:'https://science.nasa.gov/science-research/heliophysics/nasas-parker-solar-probe-makes-history-with-closest-pass-to-sun/', note:{en:'24 December 2024: 3.8 million miles above the Sun\'s surface at about 430,000 mph, faster than any human-made object had moved.', ru:'24 декабря 2024 года: 3,8 млн миль над поверхностью Солнца при скорости около 430 000 миль в час — быстрее любого рукотворного объекта до этого.'}},
  {title:'NASA, “International Space Station Facts and Figures”', url:'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/', note:{en:'The station travels at five miles per second and circles the Earth about every 90 minutes, 16 orbits in 24 hours.', ru:'Станция движется со скоростью пять миль в секунду и облетает Землю примерно каждые 90 минут — 16 витков за 24 часа.'}},
  {title:'ESA, “Types of orbits”', url:'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits', note:{en:'Geostationary altitude 35,786 km; one orbit takes 23 hours 56 minutes 4 seconds.', ru:'Высота геостационарной орбиты 35 786 км; виток длится 23 часа 56 минут 4 секунды.'}},
  {title:'Большая советская энциклопедия, 3-е изд., статья «Космические скорости»', url:'https://booksite.ru/FullText/1/001/008/065/144.htm', note:{en:'Great Soviet Encyclopedia: first, second and third cosmic velocities at the Earth\'s surface, 7.910, 11.186 and 16.67 km/s.', ru:'Первая, вторая и третья космические скорости у поверхности Земли: 7,910, 11,186 и 16,67 км/с.'}},
  {title:'Breakthrough Initiatives, “Breakthrough Starshot”', url:'https://breakthroughinitiatives.org/initiative/3', note:{en:'The proposal: miniature probes on light sails pushed by a ground-based light beamer to “up to 100 million miles an hour”, for a flyby of Alpha Centauri “in just over 20 years from launch”.', ru:'Предложение: миниатюрные зонды на световых парусах, разгоняемые наземным излучателем до «100 миллионов миль в час», для пролёта альфы Центавра «чуть более чем через 20 лет после старта».'}},
  {title:'National Inventors Hall of Fame, “Yvonne Brill”', url:'https://www.invent.org/inductees/yvonne-brill', note:{en:'The electrothermal hydrazine thruster (U.S. Patent 3,807,657), developed at RCA Astro Electronics: electrically heated hydrazine, about 30 % more efficient, used on communications satellites.', ru:'Электротермический гидразиновый двигатель (патент США 3 807 657), разработанный в RCA Astro Electronics: гидразин с электрическим подогревом, примерно на 30 % экономичнее, применялся на спутниках связи.'}},
  {title:'Gunter\'s Space Page, “Molniya-1”', url:'https://space.skyrocket.de/doc_sdat/molniya-1.htm', note:{en:'Orbit “500 km × 40000 km, 65° (typical)”, 12-hour period.', ru:'Орбита «500 км × 40 000 км, 65° (типичная)», период 12 часов.'}},
  {title:'NASA (2015), Space Transportation System, Historic American Engineering Record HAER No. TX-116', url:'https://www.nasa.gov/wp-content/uploads/2015/12/3.pdf', note:{en:'Space Shuttle main engine (RS-25) at 100 % rated power: propellant flow 1,035 lb/s and 470,000 lbf of thrust in vacuum.', ru:'Маршевый двигатель шаттла (RS-25) на режиме 100 %: расход топлива 1035 фунтов в секунду и тяга 470 000 фунтов силы в вакууме.'}},
  {title:'NASA Science, Voyager: Planetary Voyage', url:'https://science.nasa.gov/mission/voyager/planetary-voyage/', note:{en:'Gravity assists cut the flight time to Neptune from 30 years to 12.', ru:'Гравитационные манёвры сократили время полёта к Нептуну с 30 лет до 12.'}},
  {title:'V. Kim, K. N. Kozubsky, V. M. Murashko, A. V. Semenkin (2007), “History of the Hall Thrusters Development in USSR”, IEPC-2007-142', url:'https://electricrocket.org/IEPC/IEPC-2007-142.pdf', note:{en:'Stationary plasma thruster work began in 1962 at the Institute of Atomic Energy under Alexey Morozov; the flight system was built in 1970–1971 at the Fakel design bureau under chief designer Roald Snarsky and lead designer K. Kozubsky; the Meteor satellite carrying it was launched in December 1971 and the first flight test followed in 1972; the SPT-70 has been in service since 1982 and the SPT-100 since 1995.', ru:'Работы над стационарным плазменным двигателем начались в 1962 году в Институте атомной энергии под руководством Алексея Морозова; лётный образец создан в 1970–1971 годах в ОКБ «Факел» под руководством главного конструктора Роальда Снарского и ведущего конструктора К. Козубского; спутник «Метеор» с ним запущен в декабре 1971 года, первое лётное испытание прошло в 1972 году; СПД-70 в эксплуатации с 1982 года, СПД-100 — с 1995 года.'}},
  {title:'J. L. Finseth (1991), “Rover Nuclear Rocket Engine Program: Overview of Rover Engine Tests”, NASA CR-184270', url:'https://ntrs.nasa.gov/api/citations/19920005899/downloads/19920005899.pdf', note:{en:'XE-Prime: nominal thrust 246,663 N (55,430 lb) at about 1,140 MW and “an overall specific impulse of 710 seconds at rated conditions”, with a 10:1 nozzle. (A scanned report: the figures are as read and quoted by this guide\'s reviewer from PDF page 123.)', ru:'XE-Prime: номинальная тяга 246 663 Н (55 430 фунтов) при мощности около 1140 МВт и «общий удельный импульс 710 секунд на номинальном режиме», сопло со степенью расширения 10:1. (Отчёт сканированный: числа приведены так, как их прочитал и процитировал рецензент этого справочника со страницы 123 PDF.)'}},
  {title:'Y. Guo, R. W. Farquhar, “New Horizons Mission Design”, Space Science Reviews 140 (2008), Table 7', url:'https://www2.boulder.swri.edu/pkb/ssr/ssr-mission-design.pdf', note:{en:'Achieved launch energy C3 = 157.7502 km²/s²; “the highest Earth departure speed, estimated at 16.2 km/s”.', ru:'Достигнутая энергия запуска C3 = 157,7502 км²/с²; «наибольшая скорость ухода от Земли, оцениваемая в 16,2 км/с».'}},
  {title:'NASA (2016), “NASA\'s Juno Spacecraft in Orbit Around Mighty Jupiter”', url:'https://www.nasa.gov/news-release/nasas-juno-spacecraft-in-orbit-around-mighty-jupiter/', note:{en:'4 July 2016: a 35-minute engine burn slowed Juno by 1,212 mph (542 m/s) so that Jupiter could capture it.', ru:'4 июля 2016 года: 35-минутное включение двигателя замедлило «Юнону» на 1212 миль в час (542 м/с), и Юпитер смог её захватить.'}},
  {title:'J. Benford (3 March 2026), “Starshot is a Success, Part I”, Centauri Dreams', url:'https://www.centauri-dreams.org/2026/03/03/starshot-is-a-success-part-i/', note:{en:'A former leader of Starshot\'s sail work writes that the project “was put on hold, paused” in 2024, and disputes that it was cancelled.', ru:'Бывший руководитель работ по парусу в проекте Starshot пишет, что в 2024 году проект был «поставлен на паузу», и оспаривает, что он закрыт.'}},
  {title:'Linda Hall Library, “Scientist of the Day: Yuri Kondratyuk”', url:'https://www.lindahall.org/about/news/scientist-of-the-day/yuri-kondratyuk', note:{en:'Born Aleksandr Ignatyevich Shargei; self-published “The Conquest of Interplanetary Space” (1929); proposed that a Moon craft “should go into orbit around the Moon, with a smaller lander making the descent”. The author finds no evidence for the often-repeated claim that Apollo\'s planners took the idea from him.', ru:'Родился Александром Игнатьевичем Шаргеем; за свой счёт издал «Завоевание межпланетных пространств» (1929); предложил выводить корабль на орбиту вокруг Луны, а спуск выполнять на меньшем аппарате. Автор не находит подтверждений часто повторяемому утверждению, будто проектировщики «Аполлона» взяли идею у него.'}},
  {title:'Encyclopædia Universalis, “Esnault-Pelterie, Robert (1881–1957): un visionnaire de l\'espace”', url:'https://www.universalis.fr/encyclopedie/robert-esnault-pelterie/2-un-visionnaire-de-l-espace/', note:{en:'Lecture of 15 November 1912 to the Société française de physique, printed in the Journal de physique in March 1913 as “Considérations sur les résultats d\'un allègement indéfini des moteurs”: interplanetary travel by rocket, with mass ratios he judged unattainable with ordinary fuels. Whether he then knew Tsiolkovsky\'s 1903 paper is not established.', ru:'Доклад 15 ноября 1912 года во Французском физическом обществе, напечатанный в «Journal de physique» в марте 1913 года под названием «Considérations sur les résultats d\'un allègement indéfini des moteurs»: межпланетные полёты на ракете и отношения масс, которые он счёл недостижимыми на обычных топливах. Знал ли он тогда о статье Циолковского 1903 года, не установлено.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  each('[data-aria-en]', function(el){ el.setAttribute('aria-label', T(el.getAttribute('data-aria-en'), el.getAttribute('data-aria-ru'))); });
  renderRocket(); renderOrbit(); renderHoh(); renderOb(); renderMap(); renderProp();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
oSync(); hSync(); wSync();
applyLang('en');
window.__impulse = {B:B, G0:G0, GM_SUN:GM_SUN, AU:AU, R_SUN:R_SUN, LEO_ALT:LEO_ALT, GEO_ALT:GEO_ALT, T_SIDEREAL:T_SIDEREAL, ASCENT:ASCENT, LBF:LBF,
  vCirc:vCirc, vEsc:vEsc, visViva:visViva, period:period, orbit:orbit, rForPeriod:rForPeriod, vex:vex, dvRocket:dvRocket, massRatio:massRatio,
  stageOpt:stageOpt, stagePayload:stagePayload, infStages:infStages, hohmann:hohmann, planeChange:planeChange, biElliptic:biElliptic,
  hohmannNorm:hohmannNorm, biParabolicNorm:biParabolicNorm, biThreshold:biThreshold, hohmannPeak:hohmannPeak, depart:depart, capture:capture, helio:helio,
  oberth:oberth, thirdCosmic:thirdCosmic, mercuryEnds:mercuryEnds, C3_NEW_HORIZONS:C3_NEW_HORIZONS, dvMap:dvMap, mapRow:mapRow, PROP:PROP, jetPower:jetPower, thrustFromPower:thrustFromPower,
  logPos:logPos, logVal:logVal, OPRE:OPRE, HPRE:HPRE, WPRE:WPRE, OB:OB, HB:HB};
