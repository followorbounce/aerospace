/* ============ CONSTANTS ============ */
var MU_M = 4902.800118;               // km³/s², lunar GM, JPL SSD astrodynamic parameters [30]
var R_M = 1737.4;                     // km, volumetric mean radius, NASA Moon fact sheet [29]
var G_M = 1.62;                       // m/s², lunar surface gravity [29]
var G0 = 9.80665;                     // m/s², standard gravity (defines Isp and "Earth pounds")
var LB = 0.45359237, LBF = 4.4482216152605, FT = 0.3048, MPH = 0.44704, IN = 0.0254, PSI_KPA = 6.894757;
var D2R = Math.PI/180;
/* escape speed from the surface, km/s (fact sheet: 2.38) */
var V_ESC = Math.sqrt(2*MU_M/R_M);
/* speed far from the Moon for a given impact speed (km/s) */
function vInf(vImp){ return Math.sqrt(Math.max(0, vImp*vImp - V_ESC*V_ESC)); }

/* ============ RANGER: THE LAST MINUTES ON A HYPERBOLA ============ */
/* NSSDC [7][9][10]: impact speed, first F-channel image (altitude, UT) and impact time */
var RANGERS = {
  r7:{en:'Ranger 7', ru:'«Рейнджер-7»', v:2.62, hFirst:2110, tFirst:(13*3600 + 25*60 + 48.82) - (13*3600 + 8*60 + 45), res:0.5, n:4308},
  r8:{en:'Ranger 8', ru:'«Рейнджер-8»', v:2.68, hFirst:2510, tFirst:(9*3600 + 57*60 + 36.756) - (9*3600 + 34*60 + 32), res:1.5, n:7137},
  r9:{en:'Ranger 9', ru:'«Рейнджер-9»', v:2.67, hFirst:2363, tFirst:(14*3600 + 8*60 + 19.994) - (13*3600 + 49*60 + 41), res:0.3, n:5814}
};
/* camera fields of view and scan lines, Ranger 7 TV experiment [8]: A 25°, B 8.4° (1150 lines); narrow P camera 2.1° (300 lines) */
var CAMS = {A:{fov:25, lines:1150}, B:{fov:8.4, lines:1150}, P:{fov:2.1, lines:300}};
/* inbound hyperbola that meets the surface (r = R_M) at speed v (km/s) and path angle g (degrees below the horizontal) */
function hyper(v, gDeg){
  var eps = v*v/2 - MU_M/R_M, a = -MU_M/(2*eps), hA = R_M*v*Math.cos(gDeg*D2R);
  var p = hA*hA/MU_M, e = Math.sqrt(1 + 2*eps*hA*hA/(MU_M*MU_M));
  return {a:a, p:p, e:e, v:v};
}
/* |true anomaly| at radius r, and time from r to periapsis (s) */
function nuAt(H, r){ return Math.acos(Math.max(-1, Math.min(1, (H.p/r - 1)/H.e))); }
function tPeri(H, r){
  var nu = nuAt(H, r), F = 2*Math.atanh(Math.sqrt((H.e - 1)/(H.e + 1))*Math.tan(nu/2));
  return Math.sqrt(Math.pow(-H.a, 3)/MU_M)*(H.e*Math.sinh(F) - F);
}
/* seconds from altitude h (km) to impact */
function tToImpact(H, h){ return tPeri(H, R_M + h) - tPeri(H, R_M); }
/* straight-line distance (km) from altitude h to the impact point */
function distToImpact(H, h){ var r = R_M + h, dn = nuAt(H, r) - nuAt(H, R_M); return Math.sqrt(r*r + R_M*R_M - 2*r*R_M*Math.cos(dn)); }
function speedAt(v, h){ return Math.sqrt(v*v - 2*MU_M*(1/R_M - 1/(R_M + h))); }
/* path angle at impact that reproduces NSSDC's timing of the first picture (a fit, not a published value) */
function fitGamma(m){
  var lo = 5, hi = 89.9;
  for(var k = 0; k < 80; k++){ var mid = (lo + hi)/2; if(tToImpact(hyper(m.v, mid), m.hFirst) > m.tFirst) lo = mid; else hi = mid; }
  return (lo + hi)/2;
}
for(var rk in RANGERS){ RANGERS[rk].gamma = fitGamma(RANGERS[rk]); RANGERS[rk].H = hyper(RANGERS[rk].v, RANGERS[rk].gamma); }
/* altitude (km) at t seconds before impact */
function altAt(H, t){
  var lo = 0, hi = 20000;
  for(var k = 0; k < 90; k++){ var mid = (lo + hi)/2; if(tToImpact(H, mid) > t) hi = mid; else lo = mid; }
  return (lo + hi)/2;
}
/* ground size of one scan line and of the whole picture (m), camera looking at the impact point from distance d (km) */
function lineM(d, cam){ return d*1000*cam.fov*D2R/cam.lines; }
function widthM(d, cam){ return 2*d*1000*Math.tan(cam.fov*D2R/2); }

/* ============ SURVEYOR 1: TERMINAL DESCENT ============ */
/* retro ignition: NSSDC [11] 75.3 km, 2612 m/s; end of retro phase: Hughes report [13], 27,820 ft, 430 ft/s, 54.68 s */
var H_IGN = 75300, V_IGN = 2612, H_RE = 27820*FT, V_RE = 430*FT, T_RE = 54.68;
var DH_RETRO = H_IGN - H_RE;
/* descent contour points: 71.4 mph at 1,000 ft (JPL [12]); "10 ft/s mark" at 43 ft; cut-off at 4 ft/s, 12 ft above the surface (Hughes [13]) */
var W1 = {h:1000*FT, v:71.4*MPH}, W2 = {h:43*FT, v:10*FT}, V_CUT = 4*FT, H_CUT = 12*FT;
/* masses: 727.6 lb at the start of the vernier phase [13]; 294.3 kg landed [11]; 42.79 lb usable propellant left [13] */
var M_V0 = 727.6*LB, M_LAND = 294.3, M_LEFT = 42.79*LB;
var F_VMAX = 3*460;                   // N, three verniers at full thrust (130–460 N each) [11]
var A_VMAX = F_VMAX/M_V0 - G_M;       // best net deceleration at the start of the vernier phase, m/s²
/* retro ignition 06:14:48.558, touchdown 06:17:35.55 GMT [13] */
var T_ACTUAL = (17*60 + 35.55) - (14*60 + 48.558), T_FALL_ACTUAL = 1.5;
/* effective vernier specific impulse from Surveyor 1's own numbers: mass ratio 727.6 lb → 294.3 kg over the thrusting time */
var ISP_V = ((V_RE - V_CUT) + G_M*(T_ACTUAL - T_RE - T_FALL_ACTUAL))/(G0*Math.log(M_V0/M_LAND));
function freeFall(hc, vc){ return Math.sqrt(vc*vc + 2*G_M*hc); }
function earthDrop(v){ return v*v/(2*G0); }
/* the whole descent for a given retro ignition altitude (m) and cut-off height (m) */
function descent(hIgn, hc){
  var hs = hIgn - DH_RETRO, out = {hs:hs, vs:V_RE, hc:hc};
  if(hs <= W1.h + 1){ out.ok = false; out.crash = true; out.aNeed = Infinity; return out; }
  var a1 = (V_RE*V_RE - W1.v*W1.v)/(2*(hs - W1.h)), t1 = (V_RE - W1.v)/a1;
  var a2 = (W1.v*W1.v - W2.v*W2.v)/(2*(W1.h - W2.h)), t2 = (W1.v - W2.v)/a2;
  var a3 = (W2.v*W2.v - V_CUT*V_CUT)/(2*(W2.h - hc)), t3 = (W2.v - V_CUT)/a3;
  var vt = freeFall(hc, V_CUT), tf = (vt - V_CUT)/G_M;
  var tThrust = t1 + t2 + t3, dv = (V_RE - V_CUT) + G_M*tThrust;
  var prop = M_V0*(1 - Math.exp(-dv/(ISP_V*G0)));
  out.a1 = a1; out.aNeed = a1; out.t1 = t1; out.t2 = t2; out.t3 = t3; out.tf = tf; out.vt = vt; out.dv = dv; out.prop = prop;
  out.budget = (M_V0 - M_LAND) + M_LEFT; out.total = T_RE + tThrust + tf;
  out.crash = a1 > A_VMAX; out.dry = prop > out.budget; out.ok = !out.crash && !out.dry;
  return out;
}
/* lowest ignition altitude from which the verniers can still meet the contour */
var H_IGN_MIN = DH_RETRO + W1.h + (V_RE*V_RE - W1.v*W1.v)/(2*A_VMAX);
/* highest ignition altitude before the vernier propellant runs out (bisection) */
var H_IGN_MAX = (function(){ var lo = H_IGN, hi = 200000; for(var k = 0; k < 80; k++){ var mid = (lo + hi)/2; if(descent(mid, H_CUT).dry) hi = mid; else lo = mid; } return (lo + hi)/2; })();

/* ============ WILL THE LM SINK? ============ */
var Q_S5 = 2.7*10;                    // kPa: Surveyor 5's static bearing capacity, 2.7 N/cm² [20]
var K_AVG = 8, K_95 = 2;              // kPa/cm, modulus of subgrade reaction from Apollo bootprints [21]
var SPEC_P = 1.0*PSI_KPA, SPEC_D = 4*IN*100;   // 1964 LM design soil: 1.0 psi → at most 4 in [22]
/* contact pressure under each pad (kPa) */
function padPressure(m, n, D){ return m*G_M/n/(Math.PI*D*D/4)/1000; }
function sinkCm(p, k){ return p/k; }
var SURVEYOR_FOOT = {m:294.3, n:3, D:0.298};   // landed mass [11], NASM pad 29.8 cm [23]
var LM_FOOT = {m:16000*LB, n:4, D:3*FT};       // 16,000 Earth pounds, pads "approximately 3 feet" [22]

/* ============ LUNAR ORBITER CAMERAS ============ */
/* PDS [26]: 610 mm and 80 mm lenses, 76 lines/mm required on the film; footprints 4.15 × 16.6 km (HR) and 31.6 × 37.4 km (MR) from 55 km */
var LO_LENS = {HR:610, MR:80}, LO_LPMM = 76, LO_FP = {HR:[4.15, 16.6], MR:[31.6, 37.4]}, LO_FP_H = 55, LO_EXP = 1/25;
function loObject(hKm, f){ return hKm*1000/(f*LO_LPMM); }          // m
function loFoot(hKm, which){ var s = hKm/LO_FP_H; return [LO_FP[which][0]*s, LO_FP[which][1]*s]; }
function circSpeed(hKm){ return Math.sqrt(MU_M/(R_M + hKm)); }     // km/s
function smearM(hKm){ return circSpeed(hKm)*1000*LO_EXP; }

/* ============ APOLLO 12 AND SURVEYOR 3 ============ */
/* LRO-derived positions, NSSDC [15][27] */
var S3_POS = [-3.0162, 336.582 - 360], A12_POS = [-3.0128, -23.4219];
function surfDist(p, q){
  var la1 = p[0]*D2R, la2 = q[0]*D2R, dla = la2 - la1, dlo = (q[1] - p[1])*D2R;
  var s = Math.sin(dla/2)*Math.sin(dla/2) + Math.cos(la1)*Math.cos(la2)*Math.sin(dlo/2)*Math.sin(dlo/2);
  return 2*R_M*1000*Math.asin(Math.sqrt(s));
}
var A12_DIST = surfDist(S3_POS, A12_POS);

/* ============ FORMATTING ============ */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
/* sensible significant figures for sizes in metres */
function metres(m){
  if(m >= 10000) return num(m/1000) + T(' km',' км');
  if(m >= 1000) return fmt(m/1000, 1) + T(' km',' км');
  if(m >= 100) return num(m) + T(' m',' м');
  if(m >= 10) return fmt(m, 0) + T(' m',' м');
  if(m >= 1) return fmt(m, 1) + T(' m',' м');
  if(m >= 0.1) return fmt(m, 2) + T(' m',' м');
  return fmt(m*100, 1) + T(' cm',' см');
}
function secs(s){
  if(s >= 60){ var mm = Math.floor(s/60), ss = Math.round(s - mm*60); if(ss === 60){ mm++; ss = 0; } return mm + T(' min ',' мин ') + ss + T(' s',' с'); }
  return (s >= 10 ? fmt(s, 0) : s >= 1 ? fmt(s, 1) : fmt(s, 2)) + T(' s',' с');
}
function kpa(p){ return (p >= 10 ? fmt(p, 0) : p >= 1 ? fmt(p, 1) : fmt(p, 2)) + T(' kPa',' кПа'); }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }
function logTicks(a, b){ var out = []; for(var e = Math.floor(a); e <= Math.ceil(b); e++) [1, 2, 5].forEach(function(k){ var v = k*Math.pow(10, e); if(Math.log10(v) >= a - 1e-9 && Math.log10(v) <= b + 1e-9) out.push(v); }); return out; }
function tickLabel(v){ return v >= 1 ? num(v) : fmt(v, v >= 0.1 ? 1 : 2); }

/* ============ CH1 ============ */
document.getElementById('eqVinf').textContent = fmt(vInf(2.62), 2);

/* ============ CH2 — RANGER CAMERAS ============ */
var rgT = document.getElementById('rgT'), rgMission = 'r9', rgCam = 'P';
function rgSetRange(){
  var m = RANGERS[rgMission];
  rgT.min = String(-0.7); rgT.max = String(Math.log10(m.tFirst).toFixed(3));
}
function renderRG(){
  var m = RANGERS[rgMission], cam = CAMS[rgCam], t = Math.pow(10, +rgT.value);
  var h = altAt(m.H, t), d = distToImpact(m.H, h), ln = lineM(d, cam), wd = widthM(d, cam), sp = speedAt(m.v, h);
  document.getElementById('rgTVal').textContent = secs(t);
  rgT.setAttribute('aria-valuetext', secs(t) + T(' before impact, altitude ',' до удара, высота ') + metres(h*1000) + T(', one scan line covers ',', одна строка развёртки покрывает ') + metres(ln));
  var svg = document.getElementById('rgSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 22, B = 250, xa = -0.7, xb = 3.2, ya = -2, yb = 4;
  function X(tt){ return R - (Math.log10(tt) - xa)/(xb - xa)*(R - L); } function Y(v){ return B - (Math.log10(v) - ya)/(yb - ya)*(B - Tp); }
  [0.01, 0.1, 1, 10, 100, 1000, 10000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, v >= 1000 ? num(v/1000) + T(' km',' км') : v >= 1 ? num(v) + T(' m',' м') : num(v*100) + T(' cm',' см'), 'svg-small', 'end'); });
  [[0.2,'0.2'],[1,'1'],[10,'10'],[100,'100'],[1000,'1000']].forEach(function(p){ ns('line', {x1:X(p[0]), y1:B, x2:X(p[0]), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(p[0]), B + 16, p[0] < 1 ? fmt(p[0], 1) : num(p[0]), 'svg-small', p[0] < 1 ? 'end' : 'middle'); });   // 0.2 s sits on the right edge
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('ground covered by one scan line (log)','участок поверхности на одну строку (лог.)'), 'svg-small');
  txt(svg, R, B + 34, T('seconds before impact (log) — impact is to the right →','секунды до удара (лог.) — удар справа →'), 'svg-small', 'end');
  var cols = {A:'#8f8f88', B:'#2f5aa1', P:'#b5452a'};
  ['A', 'B', 'P'].forEach(function(c){
    var dd = '';
    for(var k = 0; k <= 120; k++){ var tt = Math.pow(10, xa + (Math.log10(m.tFirst) - xa)*k/120), hh = altAt(m.H, tt); dd += (k ? 'L' : 'M') + X(tt).toFixed(1) + ',' + Y(lineM(distToImpact(m.H, hh), CAMS[c])).toFixed(1); }
    ns('path', {d:dd, fill:'none', stroke:cols[c], 'stroke-width':c === rgCam ? 2.4 : 1.1, 'stroke-dasharray':c === rgCam ? '' : '4 3'}, svg);
    var tl = Math.pow(10, {A:2.6, B:1.6, P:2.6}[c]), hl = altAt(m.H, tl);
    txt(svg, X(tl), Y(lineM(distToImpact(m.H, hl), CAMS[c])) + (c === 'P' ? 18 : -8), T('camera ','камера ') + c, 'svg-small svg-halo', 'middle');
  });
  /* published resolution of the last picture, plotted at 0.3 s (NSSDC: last P frame 0.2–0.4 s before impact) */
  ns('path', {d:'M' + (X(0.3) - 5) + ',' + Y(m.res) + 'l5,-5l5,5l-5,5z', fill:'#0b0b0c'}, svg);
  txt(svg, X(0.3) + 4, Y(m.res) + 22, T('published: last picture ','опубликовано: последний кадр ') + metres(m.res), 'svg-small svg-halo', 'end');
  ns('circle', {cx:X(t), cy:Y(ln), r:6.5, fill:'none', stroke:'#0b0b0c', 'stroke-width':2.4}, svg);
  cells(document.getElementById('rgReadout'), [
    [T('ALTITUDE','ВЫСОТА'), metres(h*1000)],
    [T('DISTANCE TO THE IMPACT POINT','ДО ТОЧКИ УДАРА'), metres(d*1000)],
    [T('SPEED','СКОРОСТЬ'), fmt(sp, 2) + T(' km/s',' км/с')],
    [T('PICTURE WIDTH, CAMERA ','ШИРИНА КАДРА, КАМЕРА ') + rgCam, metres(wd)],
    [T('ONE SCAN LINE COVERS','ОДНА СТРОКА ПОКРЫВАЕТ'), metres(ln)],
    [T('SMALLEST OBJECT (≈4 LINES)','НАИМЕНЬШИЙ ОБЪЕКТ (≈4 СТРОКИ)'), metres(4*ln)],
    [T('PATH ANGLE AT IMPACT (FITTED)','УГОЛ ТРАЕКТОРИИ ПРИ УДАРЕ (ПОДОБРАН)'), fmt(m.gamma, 0) + T('° below horizontal','° к горизонту'), 1]
  ]);
  hud1.textContent = metres(h*1000); hud2.textContent = fmt(sp, 2) + T(' km/s',' км/с');
  var st = document.getElementById('rgStatus');
  if(t > 60) st.innerHTML = T('Still ','Ещё ') + metres(h*1000) + T(' up: camera ',' над поверхностью: камера ') + rgCam + T(' frames a patch ',' охватывает участок ') + metres(wd) + T(' wide — better than any telescope on Earth once one scan line covers less than about a kilometre.',' в ширину — лучше любого земного телескопа, как только одна строка покрывает меньше километра.');
  else if(t > 2) st.innerHTML = T('Each second now removes a large share of what is left, and the pictures sharpen in proportion to the distance remaining: ','Теперь каждая секунда отнимает заметную долю оставшегося пути, и снимки становятся резче пропорционально оставшемуся расстоянию: ') + metres(d*1000) + T(' to go.',' до цели.');
  else st.innerHTML = T('The last frames. ','Последние кадры. ') + T(m.en, m.ru) + T(' saw objects down to about ',' различал объекты размером примерно до ') + metres(m.res) + T(' — the model\'s scan line is ','; строка развёртки в модели — ') + metres(ln) + T(', so a resolvable object spans a few lines.',', то есть различимый объект занимает несколько строк.');
}
rgT.addEventListener('input', renderRG);
Array.prototype.forEach.call(document.querySelectorAll('#rgMis .btn'), function(btn){ btn.addEventListener('click', function(){ rgMission = this.getAttribute('data-m'); pressGroup(this.parentNode, this); rgSetRange(); if(+rgT.value > +rgT.max) rgT.value = rgT.max; renderRG(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rgCam .btn'), function(btn){ btn.addEventListener('click', function(){ rgCam = this.getAttribute('data-c'); pressGroup(this.parentNode, this); renderRG(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rgTPre .btn'), function(btn){ btn.addEventListener('click', function(){ rgT.value = Math.log10(Math.min(RANGERS[rgMission].tFirst, +this.getAttribute('data-t'))); pressGroup(this.parentNode, this); renderRG(); }); });
rgSetRange();

/* ============ CH3 — SURVEYOR DESCENT ============ */
var sdH = document.getElementById('sdH'), sdC = document.getElementById('sdC');
function renderSD(){
  var hIgn = +sdH.value*1000, hc = +sdC.value, D = descent(hIgn, hc);
  document.getElementById('sdHVal').textContent = fmt(hIgn/1000, 1) + T(' km',' км');
  document.getElementById('sdCVal').textContent = fmt(hc, 2) + T(' m',' м');
  var svg = document.getElementById('sdSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 44, B = 250, xa = 0, xb = 5.2, ya = -0.3, yb = 3.6;
  function X(h){ return L + (Math.log10(Math.max(1, h)) - xa)/(xb - xa)*(R - L); } function Y(v){ return B - (Math.log10(Math.max(0.5, v)) - ya)/(yb - ya)*(B - Tp); }
  [1, 10, 100, 1000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, v >= 1000 ? '1' + T(' km/s',' км/с') : num(v) + T(' m/s',' м/с'), 'svg-small', 'end'); });
  txt(svg, R, 14, T('dotted: retro · black: verniers · red: free fall','пунктир: РДТТ · чёрный: верньеры · красный: свободное падение'), 'svg-tiny', 'end');
  txt(svg, R, 27, T('blue dashed: above it the verniers cannot stop in time','синяя штриховая: выше неё верньеры не успевают затормозить'), 'svg-tiny', 'end');
  [[1,'1 m'],[10,'10 m'],[100,'100 m'],[1000,'1 km'],[10000,'10 km'],[100000,'100 km']].forEach(function(p){ ns('line', {x1:X(p[0]), y1:B, x2:X(p[0]), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(p[0]), B + 16, p[0] >= 1000 ? num(p[0]/1000) + T(' km',' км') : num(p[0]) + T(' m',' м'), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 38, T('speed (log)','скорость (лог.)'), 'svg-small');
  txt(svg, R, B + 34, T('altitude (log)','высота (лог.)'), 'svg-small', 'end');
  /* the vernier limit: fastest speed at each altitude from which full thrust still reaches 71.4 mph at 1,000 ft */
  var lim = '';
  for(var k = 0; k <= 100; k++){ var hh = W1.h*Math.pow(150000/W1.h, k/100); lim += (k ? 'L' : 'M') + X(hh).toFixed(1) + ',' + Y(Math.sqrt(W1.v*W1.v + 2*A_VMAX*(hh - W1.h))).toFixed(1); }
  ns('path', {d:lim, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.3, 'stroke-dasharray':'5 4'}, svg);
  /* retro burn: published end points joined by a straight line (the shape in between is not modelled) */
  ns('line', {x1:X(hIgn), y1:Y(V_IGN), x2:X(Math.max(1, D.hs)), y2:Y(V_RE), stroke:'#8f8f88', 'stroke-width':2, 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X(hIgn) - 6, Y(V_IGN) - 8, T('retro ignition','включение РДТТ'), 'svg-small svg-halo', 'end');
  if(!D.crash){
    var pts = [[D.hs, V_RE]];
    for(var j = 1; j <= 60; j++){ var hh2 = D.hs + (W1.h - D.hs)*j/60; pts.push([hh2, Math.sqrt(W1.v*W1.v + 2*D.a1*(hh2 - W1.h))]); }
    pts.push([W2.h, W2.v]); pts.push([hc, V_CUT]);
    var dd = ''; pts.forEach(function(p, q){ dd += (q ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
    ns('path', {d:dd, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
    ns('line', {x1:X(hc), y1:Y(V_CUT), x2:X(1), y2:Y(freeFall(Math.max(0, hc - 1), V_CUT)), stroke:'#b5452a', 'stroke-width':2.2}, svg);
    txt(svg, X(2), Y(D.vt) - 10, T('free fall','свободное падение'), 'svg-small svg-halo', 'middle');
    ns('circle', {cx:X(D.hs), cy:Y(V_RE), r:5, fill:'#0b0b0c'}, svg);
  } else {
    ns('circle', {cx:X(Math.max(1, D.hs)), cy:Y(V_RE), r:6, fill:'#b5452a'}, svg);
    txt(svg, X(Math.max(1, D.hs)) + 8, Y(V_RE) + 16, T('too low, too fast','слишком низко и быстро'), 'svg-small svg-halo');
  }
  var rows = [
    [T('RETRO PHASE ENDS AT','ФАЗА РДТТ ЗАКАНЧИВАЕТСЯ НА'), D.hs > 0 ? metres(D.hs) + ', ' + fmt(V_RE, 0) + T(' m/s',' м/с') : T('below the surface','под поверхностью')],
    [T('VERNIER DECELERATION NEEDED','НУЖНОЕ ТОРМОЖЕНИЕ ВЕРНЬЕРАМИ'), isFinite(D.aNeed) ? fmt(D.aNeed, 2) + T(' m/s²',' м/с²') : '—'],
    [T('BEST THE VERNIERS CAN DO','МАКСИМУМ ВЕРНЬЕРОВ'), fmt(A_VMAX, 2) + T(' m/s²',' м/с²')]
  ];
  if(!D.crash) rows = rows.concat([
    [T('VERNIER PROPELLANT USED','РАСХОД ТОПЛИВА ВЕРНЬЕРОВ'), fmt(D.prop, 1) + T(' of ',' из ') + fmt(D.budget, 1) + T(' kg',' кг')],
    [T('IGNITION TO TOUCHDOWN','ОТ ВКЛЮЧЕНИЯ ДО КАСАНИЯ'), secs(D.total)],
    [T('TOUCHDOWN SPEED','СКОРОСТЬ КАСАНИЯ'), fmt(D.vt, 2) + T(' m/s',' м/с')],
    [T('SAME AS A DROP ON EARTH FROM','КАК ПАДЕНИЕ НА ЗЕМЛЕ С ВЫСОТЫ'), fmt(earthDrop(D.vt)*100, 0) + T(' cm',' см'), 1]
  ]);
  if(rows.length % 2) rows[rows.length - 1][2] = 1; /* an odd last cell spans the 2-column grid */
  cells(document.getElementById('sdReadout'), rows);
  sdH.setAttribute('aria-valuetext', fmt(hIgn/1000, 1) + T(' km; ',' км; ') + (D.crash ? T('the verniers cannot stop in time','верньеры не успевают затормозить') : D.dry ? T('propellant runs out','топливо заканчивается') : T('safe landing at ','мягкая посадка со скоростью ') + fmt(D.vt, 2) + T(' m/s',' м/с')));
  sdC.setAttribute('aria-valuetext', fmt(hc, 2) + T(' m; touchdown at ',' м; касание со скоростью ') + fmt(freeFall(hc, V_CUT), 2) + T(' m/s',' м/с'));
  hud1.textContent = metres(hIgn); hud2.textContent = fmt(V_IGN, 0) + T(' m/s',' м/с');
  var st = document.getElementById('sdStatus');
  if(D.crash) st.innerHTML = T('Crash. The retro burn ends only ','Крушение. Фаза РДТТ заканчивается всего в ') + metres(Math.max(0, D.hs)) + T(' up at 131 m/s; three verniers at full thrust cannot brake hard enough. Anything below ',' над поверхностью при скорости 131 м/с; трём верньерам на полной тяге не хватает торможения. Ниже ') + fmt(H_IGN_MIN/1000, 1) + T(' km is fatal — less than two seconds of flight below the planned ignition point.',' км — гибель: это меньше двух секунд полёта ниже расчётной точки включения.');
  else if(D.dry) st.innerHTML = T('Lands too slowly: the verniers hover down for so long that they need ','Спуск слишком медленный: верньеры зависают так долго, что им нужно ') + fmt(D.prop, 1) + T(' kg of propellant, more than the ',' кг топлива — больше, чем ') + fmt(D.budget, 1) + T(' kg Surveyor 1 had. Gravity takes its toll every second of hovering.',' кг, которые были у «Сервейера-1». Каждая секунда зависания — потери на тяготение.');
  else st.innerHTML = T('Safe. Touchdown at ','Мягкая посадка. Касание со скоростью ') + fmt(D.vt, 2) + T(' m/s after a free fall from ',' м/с после свободного падения с ') + fmt(hc, 2) + T(' m; ',' м; ') + fmt(D.budget - D.prop, 1) + T(' kg of vernier propellant left over. The window that works: retro ignition between ',' кг топлива верньеров в остатке. Рабочее окно: включение РДТТ между ') + fmt(H_IGN_MIN/1000, 1) + T(' and ',' и ') + fmt(H_IGN_MAX/1000, 1) + T(' km.',' км.');
}
sdH.addEventListener('input', function(){ pressGroup(document.getElementById('sdPre'), null); renderSD(); });
sdC.addEventListener('input', renderSD);
Array.prototype.forEach.call(document.querySelectorAll('#sdPre .btn'), function(btn){ btn.addEventListener('click', function(){ sdH.value = this.getAttribute('data-h'); pressGroup(this.parentNode, this); renderSD(); }); });

/* ============ CH4 — FOOTPADS ============ */
var ftM = document.getElementById('ftM'), ftD = document.getElementById('ftD'), ftN = 3, ftK = K_AVG;
function renderFT(){
  var m = Math.pow(10, +ftM.value), D = +ftD.value, p = padPressure(m, ftN, D);
  document.getElementById('ftMVal').textContent = num(m) + T(' kg',' кг');
  document.getElementById('ftDVal').textContent = fmt(D*100, 1) + T(' cm',' см');
  ftM.setAttribute('aria-valuetext', num(m) + T(' kg, pressure ',' кг, давление ') + kpa(p));
  ftD.setAttribute('aria-valuetext', fmt(D*100, 1) + T(' cm, pressure ',' см, давление ') + kpa(p));
  var svg = document.getElementById('ftSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 22, B = 250, xa = -1.1, xb = 0.3, ya = -1, yb = 2.3;
  function X(d){ return L + (Math.log10(d) - xa)/(xb - xa)*(R - L); } function Y(v){ return B - (Math.log10(v) - ya)/(yb - ya)*(B - Tp); }
  [0.1, 1, 10, 100].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, tickLabel(v) + T(' kPa',' кПа'), 'svg-small', 'end'); });
  [0.1, 0.2, 0.5, 1, 2].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, v < 1 ? num(v*100) + T(' cm',' см') : num(v) + T(' m',' м'), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('pressure under each pad (log)','давление под каждой опорой (лог.)'), 'svg-small');
  txt(svg, R, B + 34, T('pad diameter (log)','диаметр опоры (лог.)'), 'svg-small', 'end');
  [[Q_S5, '#2f5aa1', T('Surveyor 5: soil bearing capacity 2.7 N/cm²','«Сервейер-5»: несущая способность грунта 2,7 Н/см²')], [SPEC_P, '#8f8f88', T('1964 design soil: 1 psi sinks ≤ 4 in','расчётный грунт (1964): 1 psi — осадка ≤ 4 дюймов')]].forEach(function(l){
    ns('line', {x1:L, y1:Y(l[0]), x2:R, y2:Y(l[0]), stroke:l[1], 'stroke-width':1.3, 'stroke-dasharray':'5 4'}, svg);
    txt(svg, R - 4, Y(l[0]) - 6, l[2], 'svg-small svg-halo', 'end');
  });
  var dd = '', pen = false;
  for(var k = 0; k <= 160; k++){ var dk = Math.pow(10, xa + (xb - xa)*k/160), pk = padPressure(m, ftN, dk), inR = pk >= Math.pow(10, ya) && pk <= Math.pow(10, yb); if(inR){ dd += (pen ? 'L' : 'M') + X(dk).toFixed(1) + ',' + Y(pk).toFixed(1); } pen = inR; }
  ns('path', {d:dd, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  [SURVEYOR_FOOT, LM_FOOT].forEach(function(f){
    var pf = padPressure(f.m, f.n, f.D);
    ns('rect', {x:X(f.D) - 4, y:Y(pf) - 4, width:8, height:8, fill:'#2f5aa1'}, svg);
  });
  txt(svg, X(SURVEYOR_FOOT.D) + 10, Y(padPressure(SURVEYOR_FOOT.m, 3, SURVEYOR_FOOT.D)) + 22, T('Surveyor','«Сервейер»'), 'svg-small svg-halo');
  txt(svg, X(LM_FOOT.D) - 8, Y(padPressure(LM_FOOT.m, 4, LM_FOOT.D)) + 15, T('LM','ЛМ'), 'svg-small svg-halo', 'end');
  var cx = Math.min(R - 8, Math.max(L + 8, X(D))), cy = Y(Math.min(Math.pow(10, yb), Math.max(Math.pow(10, ya), p)));
  ns('circle', {cx:cx, cy:cy, r:6.5, fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  var s = sinkCm(p, ftK);
  cells(document.getElementById('ftReadout'), [
    [T('WEIGHT ON THE MOON','ВЕС НА ЛУНЕ'), num(m*G_M) + T(' N',' Н')],
    [T('PRESSURE UNDER EACH PAD','ДАВЛЕНИЕ ПОД ОПОРОЙ'), kpa(p) + ' · ' + fmt(p/PSI_KPA, 2) + ' psi'],
    [T('MARGIN OVER SURVEYOR 5\'S 27 kPa (LOWER BOUND)','ЗАПАС ПО 27 кПа «СЕРВЕЙЕРА-5» (НИЖНЯЯ ОЦЕНКА)'), '×' + fmt(Q_S5/p, 1)],
    [T('STATIC SINKAGE (k = ','СТАТИЧЕСКАЯ ОСАДКА (k = ') + ftK + T(' kPa/cm)',' кПа/см)'), fmt(s, s < 1 ? 2 : 1) + T(' cm',' см')]
  ]);
  var st = document.getElementById('ftStatus');
  if(p > Q_S5) st.innerHTML = T('This pad presses harder than the 2.7 N/cm² the soil under Surveyor 5 carried: expect it to punch in. Spread the load — a bigger pad or more legs.','Эта опора давит сильнее 2,7 Н/см², которые выдержал грунт под «Сервейером-5»: она продавит поверхность. Распределите нагрузку: опора крупнее или опор больше.');
  else if(p > SPEC_P) st.innerHTML = T('Heavier than the 1964 design case for the Lunar Module: by that pessimistic standard it could sink more than 4 inches, although the measured soil would hold it with a margin of ×','Нагрузка выше расчётного случая 1964 года для лунного модуля: по тому пессимистичному стандарту осадка могла бы превысить 4 дюйма, хотя измеренный грунт выдержал бы опору с запасом ×') + fmt(Q_S5/p, 1) + '.';
  else st.innerHTML = T('Comfortable. Each pad presses with ','Надёжно. Каждая опора создаёт давление ') + kpa(p) + T('; on the bootprint-derived soil it settles about ','; на грунте, оценённом по следам ботинок, она осядет примерно на ') + fmt(s, s < 1 ? 2 : 1) + T(' cm (at the pessimistic 95 % value, k = 2 kPa/cm: ',' см (по пессимистичной оценке с вероятностью 95 %, k = 2 кПа/см: ') + fmt(sinkCm(p, K_95), 1) + T(' cm).',' см).');
}
ftM.addEventListener('input', function(){ pressGroup(document.getElementById('ftPre'), null); renderFT(); });
ftD.addEventListener('input', function(){ pressGroup(document.getElementById('ftPre'), null); renderFT(); });
Array.prototype.forEach.call(document.querySelectorAll('#ftPre .btn'), function(btn){ btn.addEventListener('click', function(){
  var f = this.getAttribute('data-f') === 'lm' ? LM_FOOT : SURVEYOR_FOOT;
  ftM.value = Math.log10(f.m); ftD.value = f.D; ftN = f.n; pressGroup(this.parentNode, this);
  pressGroup(document.getElementById('ftLegs'), document.querySelector('#ftLegs .btn[data-n="' + f.n + '"]')); renderFT(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#ftLegs .btn'), function(btn){ btn.addEventListener('click', function(){ ftN = +this.getAttribute('data-n'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('ftPre'), null); renderFT(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#ftSoil .btn'), function(btn){ btn.addEventListener('click', function(){ ftK = +this.getAttribute('data-k'); pressGroup(this.parentNode, this); renderFT(); }); });
ftM.value = Math.log10(SURVEYOR_FOOT.m);

/* ============ CH5 — LUNAR ORBITER ============ */
var loH = document.getElementById('loH');
function renderLO(){
  var h = Math.pow(10, +loH.value), hr = loObject(h, LO_LENS.HR), mr = loObject(h, LO_LENS.MR), fh = loFoot(h, 'HR'), fm = loFoot(h, 'MR'), sm = smearM(h);
  document.getElementById('loHVal').textContent = fmt(h, h < 100 ? 1 : 0) + T(' km',' км');
  loH.setAttribute('aria-valuetext', fmt(h, h < 100 ? 1 : 0) + T(' km; telephoto sees ',' км; телеобъектив различает ') + metres(hr));
  var svg = document.getElementById('loSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 22, B = 250, xa = 1.5, xb = 3.4, ya = -0.3, yb = 2.7;
  function X(v){ return L + (Math.log10(v) - xa)/(xb - xa)*(R - L); } function Y(v){ return B - (Math.log10(v) - ya)/(yb - ya)*(B - Tp); }
  [1, 10, 100].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, num(v) + T(' m',' м'), 'svg-small', 'end'); });
  [50, 100, 200, 500, 1000, 2000].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, num(v), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('smallest object on the film (log)','наименьший объект на плёнке (лог.)'), 'svg-small');
  txt(svg, R, B + 34, T('altitude, km (log)','высота, км (лог.)'), 'svg-small', 'end');
  [['HR', '#b5452a', T('610 mm telephoto','телеобъектив 610 мм')], ['MR', '#2f5aa1', T('80 mm wide angle','широкоугольный 80 мм')]].forEach(function(c){
    ns('line', {x1:X(Math.pow(10, xa)), y1:Y(loObject(Math.pow(10, xa), LO_LENS[c[0]])), x2:X(Math.pow(10, xb)), y2:Y(loObject(Math.pow(10, xb), LO_LENS[c[0]])), stroke:c[1], 'stroke-width':1.8}, svg);
    txt(svg, X(700), Y(loObject(700, LO_LENS[c[0]])) - 8, c[2], 'svg-small svg-halo', 'end');
  });
  ns('line', {x1:X(46), y1:Tp, x2:X(46), y2:B, stroke:'#8f8f88', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, X(46) + 4, Tp + 12, T('requirement: 1 m from 46 km','требование: 1 м с 46 км'), 'svg-small svg-halo');
  ns('line', {x1:X(h), y1:Tp + 20, x2:X(h), y2:B, stroke:'#0b0b0c', 'stroke-width':1.2}, svg);
  ns('circle', {cx:X(h), cy:Y(hr), r:5.5, fill:'#b5452a'}, svg); ns('circle', {cx:X(h), cy:Y(mr), r:5.5, fill:'#2f5aa1'}, svg);
  cells(document.getElementById('loReadout'), [
    [T('TELEPHOTO: SMALLEST OBJECT','ТЕЛЕОБЪЕКТИВ: НАИМЕНЬШИЙ ОБЪЕКТ'), metres(hr)],
    [T('WIDE ANGLE: SMALLEST OBJECT','ШИРОКОУГОЛЬНЫЙ: НАИМЕНЬШИЙ ОБЪЕКТ'), metres(mr)],
    [T('TELEPHOTO FRAME','КАДР ТЕЛЕОБЪЕКТИВА'), fmt(fh[0], 1) + ' × ' + fmt(fh[1], 1) + T(' km',' км')],
    [T('WIDE-ANGLE FRAME','ШИРОКОУГОЛЬНЫЙ КАДР'), fmt(fm[0], 0) + ' × ' + fmt(fm[1], 0) + T(' km',' км')],
    [T('ORBITAL SPEED (CIRCULAR)','ОРБИТАЛЬНАЯ СКОРОСТЬ (КРУГОВАЯ)'), fmt(circSpeed(h), 2) + T(' km/s',' км/с')],
    [T('BLUR IN 1/25 s WITHOUT MOVING FILM','СМАЗ ЗА 1/25 с БЕЗ ДВИЖЕНИЯ ПЛЁНКИ'), metres(sm) + ' (×' + fmt(sm/hr, 0) + ')']
  ]);
  hud1.textContent = fmt(h, h < 100 ? 1 : 0) + T(' km',' км'); hud2.textContent = fmt(circSpeed(h), 2) + T(' km/s',' км/с');
  document.getElementById('loStatus').innerHTML = T('From ','С высоты ') + fmt(h, h < 100 ? 1 : 0) + T(' km the telephoto resolves ',' км телеобъектив различает ') + metres(hr) + T(' in a strip ',' в полосе ') + fmt(fh[0], 1) + ' × ' + fmt(fh[1], 1) + T(' km. Without image-motion compensation the ground would slide ',' км. Без компенсации сдвига изображения поверхность сместилась бы за выдержку на ') + metres(sm) + T(' during the exposure — the film had to move with it.',' — плёнке приходилось двигаться вслед за ней.');
}
loH.addEventListener('input', function(){ pressGroup(document.getElementById('loPre'), null); renderLO(); });
Array.prototype.forEach.call(document.querySelectorAll('#loPre .btn'), function(btn){ btn.addEventListener('click', function(){ loH.value = Math.log10(+this.getAttribute('data-h')); pressGroup(this.parentNode, this); renderLO(); }); });
loH.value = Math.log10(46);

/* ============ CH6 ============ */
function renderA12(){ document.getElementById('eqDist').textContent = num(Math.round(A12_DIST)); }

/* ============ TIMELINE & REFERENCES ============ */
var TIMELINE = [
  ['1961', 'Rangers 1 (23 August) and 2 (18 November) are stranded in low Earth orbit when their Agena stages fail to restart [1][2].', '«Рейнджеры-1» (23 августа) и «-2» (18 ноября) остаются на низкой околоземной орбите: верхняя ступень «Аджена» не включается повторно [1][2].'],
  ['1962', 'Ranger 3 misses the Moon by about 36,800 km; Ranger 4 hits the far side blind on 26 April; Ranger 5 loses power and misses by 725 km [3][4][5].', '«Рейнджер-3» проходит мимо Луны примерно в 36 800 км; «Рейнджер-4» 26 апреля вслепую падает на обратную сторону; «Рейнджер-5» теряет питание и промахивается на 725 км [3][4][5].'],
  ['1964', 'Ranger 6 hits Mare Tranquillitatis on 2 February with dead cameras; Ranger 7 returns 4,308 pictures on 31 July [6][7].', '«Рейнджер-6» 2 февраля падает в Море Спокойствия с неработающими камерами; «Рейнджер-7» 31 июля передаёт 4308 снимков [6][7].'],
  ['1965', 'Ranger 8 (20 February, 7,137 pictures) and Ranger 9 (24 March, Alphonsus, shown live on television) [9][10].', '«Рейнджер-8» (20 февраля, 7137 снимков) и «Рейнджер-9» (24 марта, кратер Альфонс, в прямом телеэфире) [9][10].'],
  ['1966', 'Luna 9 makes the first survivable landing in February [31]; Surveyor 1 lands on 2 June [11]; Lunar Orbiter 1 starts photographing landing sites in August [24]; Surveyor 2 tumbles and crashes in September [14].', 'В феврале «Луна-9» совершает первую посадку, после которой аппарат продолжил работу [31]; 2 июня садится «Сервейер-1» [11]; в августе «Лунар орбитер-1» начинает съёмку мест посадки [24]; в сентябре «Сервейер-2» кувыркается и разбивается [14].'],
  ['1967', 'Surveyor 3 bounces twice and digs the first trenches (April); Surveyor 4 falls silent (July); Lunar Orbiter 5 completes coverage of 99 % of the Moon (August); Surveyors 5 and 6 land, and 6 makes the first hop (17 November) [15][16][17][18][25].', '«Сервейер-3» дважды подпрыгивает и роет первые траншеи (апрель); «Сервейер-4» умолкает (июль); «Лунар орбитер-5» доводит съёмку до 99 % Луны (август); садятся «Сервейеры-5» и «-6», и «-6» совершает первый подскок (17 ноября) [15][16][17][18][25].'],
  ['1968', 'Surveyor 7 lands in the highlands north of Tycho on 10 January [19].', '10 января «Сервейер-7» садится в материковой области к северу от Тихо [19].'],
  ['1969', 'Apollo 12 lands about 160 m from Surveyor 3 on 19 November; Conrad and Bean bring back its camera [15][27].', '19 ноября «Аполлон-12» садится примерно в 160 м от «Сервейера-3»; Конрад и Бин забирают его камеру [15][27].'],
  ['1971', 'Mitchell and Ellis report Streptococcus mitis cultured from foam inside the camera [28].', 'Митчелл и Эллис сообщают о культуре Streptococcus mitis из пенопласта внутри камеры [28].'],
  ['2011', 'Rummel, Allton and Morrison review the films of the 1970 sampling and conclude that contamination on Earth, quite possibly during the sampling itself, is far likelier than survival on the Moon [28].', 'Раммел, Аллтон и Моррисон изучают киносъёмку отбора проб 1970 года и заключают, что загрязнение на Земле — вполне возможно, при самом отборе — гораздо вероятнее, чем выживание на Луне [28].']
];
var REFERENCES = [
  {title:'NASA NSSDCA, “Ranger 1” (1961-021A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1961-021A', note:{en:'Launched 23 August 1961; failure of the Agena B to re-ignite left Ranger 1 stranded in low Earth orbit.', ru:'Запуск 23 августа 1961 года; «Аджена-Б» не включилась повторно, и «Рейнджер-1» остался на низкой околоземной орбите.'}},
  {title:'NASA NSSDCA, “Ranger 2” (1961-032A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1961-032A', note:{en:'Launched 18 November 1961; an inoperative roll gyro prevented the Agena restart; re-entered on 19 November.', ru:'Запуск 18 ноября 1961 года; отказ гироскопа крена не дал «Аджене» включиться повторно; сошёл с орбиты 19 ноября.'}},
  {title:'NASA NSSDCA, “Ranger 3” (1962-001A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1962-001A', note:{en:'Launched 26 January 1962; booster guidance fault, reversed commands; missed the Moon by about 36,800 km. Rangers 1–9 cost about $170 million.', ru:'Запуск 26 января 1962 года; сбой системы наведения ракеты и перепутанные команды; прошёл мимо Луны примерно в 36 800 км. «Рейнджеры» 1–9 обошлись примерно в 170 млн долларов.'}},
  {title:'NASA NSSDCA, “Ranger 4” (1962-012A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1962-012A', note:{en:'A timer in the central computer and sequencer failed after launch; impacted the far side at 9,600 km/h on 26 April 1962.', ru:'После запуска отказал таймер центрального программного устройства; 26 апреля 1962 года аппарат упал на обратную сторону со скоростью 9600 км/ч.'}},
  {title:'NASA NSSDCA, “Ranger 5” (1962-055A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1962-055A', note:{en:'Launched 18 October 1962; lost power, batteries ran down after 8 h 44 min; missed the Moon by 725 km.', ru:'Запуск 18 октября 1962 года; потеря питания, батареи сели через 8 ч 44 мин; промах мимо Луны — 725 км.'}},
  {title:'NASA NSSDCA, “Ranger 6” (1964-007A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-007A', note:{en:'Impacted Mare Tranquillitatis on 2 February 1964 on target, but no video: the TV system had arced over when it switched on for 67 s during booster separation.', ru:'2 февраля 1964 года точно попал в Море Спокойствия, но без видео: в телесистеме произошёл дуговой пробой, когда она включилась на 67 с при отделении ускорителей.'}},
  {title:'NASA NSSDCA, “Ranger 7” (1964-041A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-041A', note:{en:'First image at 13:08:45 UT from 2,110 km; 4,308 photographs over the final 17 minutes; final image 0.5 m resolution; impact at 13:25:48.82 UT at 2.62 km/s in Mare Cognitum.', ru:'Первый снимок в 13:08:45 UT с высоты 2110 км; 4308 снимков за последние 17 минут; разрешение последнего кадра 0,5 м; удар в 13:25:48,82 UT со скоростью 2,62 км/с в Море Познанном.'}},
  {title:'NASA NSSDCA, “Ranger 7 Television” experiment (1964-041A-01)', url:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1964-041A-01', note:{en:'Six vidicon cameras: A (25°, 25 mm) and B (8.4°, 76 mm) with 1,150 lines; four P cameras with 300 lines, fields down to 2.1°; last P picture 0.2–0.4 s before impact. PI Gerard P. Kuiper; co-investigators E. M. Shoemaker, E. A. Whitaker, H. C. Urey, R. L. Heacock.', ru:'Шесть видиконных камер: A (25°, 25 мм) и B (8,4°, 76 мм) с 1150 строками; четыре камеры P с 300 строками и полем зрения до 2,1°; последний кадр P — за 0,2–0,4 с до удара. Руководитель Джерард П. Койпер; соисследователи Ю. М. Шумейкер, Ю. А. Уитакер, Г. К. Юри, Р. Л. Хикок.'}},
  {title:'NASA NSSDCA, “Ranger 8” (1965-010A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1965-010A', note:{en:'First image 09:34:32 UT from 2,510 km; 7,137 photographs over 23 minutes; final image 1.5 m; impact 09:57:36.756 UT at slightly under 2.68 km/s; terminal pointing manoeuvre cancelled to cover more area.', ru:'Первый снимок в 09:34:32 UT с 2510 км; 7137 снимков за 23 минуты; последний кадр — 1,5 м; удар в 09:57:36,756 UT со скоростью чуть меньше 2,68 км/с; разворот камер перед ударом отменили ради большей площади.'}},
  {title:'NASA NSSDCA, “Ranger 9” (1965-023A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1965-023A', note:{en:'Cameras turned to look along the flight path; first image 13:49:41 UT from 2,363 km; 5,814 photographs; final image 0.3 m; impact in Alphonsus at 14:08:19.994 UT, 2.67 km/s; live network television.', ru:'Камеры развёрнуты вдоль траектории; первый снимок в 13:49:41 UT с 2363 км; 5814 снимков; последний кадр — 0,3 м; удар в кратере Альфонс в 14:08:19,994 UT, 2,67 км/с; прямая трансляция по телевидению.'}},
  {title:'NASA NSSDCA, “Surveyor 1” (1966-045A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A', note:{en:'Retro ignition at 75.3 km and 2,612 m/s, a 40 s burn, jettisoned at roughly 11 km and 110 m/s; engines off 3.4 m up; landed 2 June 1966 at about 3 m/s; 294.3 kg landed; verniers 130–460 N each; footpads 4.3 m from the centre; 11,240 pictures. Programme cost $469 million.', ru:'Включение РДТТ на 75,3 км при 2612 м/с, работа 40 с, сброс примерно на 11 км при 110 м/с; двигатели выключены на высоте 3,4 м; посадка 2 июня 1966 года со скоростью около 3 м/с; посадочная масса 294,3 кг; верньеры по 130–460 Н; опоры в 4,3 м от центра; 11 240 снимков. Программа стоила 469 млн долларов.'}},
  {title:'NASA JPL news release, “Surveyor I lands on the Moon” (16 June 1966)', url:'https://www.jpl.nasa.gov/news/surveyor-i-lands-on-the-moon/', note:{en:'Retro ignited 2 min 46 s before touchdown, 46.75 miles up; 38 s burn; verniers slowed it to 71.4 mph at 1,000 ft; free fall over the last 10 ft; landing speed about 7.5 mph; a bounce of four or five inches.', ru:'РДТТ включён за 2 мин 46 с до касания на высоте 46,75 мили; работа 38 с; верньеры снизили скорость до 71,4 мили/ч на высоте 1000 футов; последние 10 футов — свободное падение; скорость посадки около 7,5 мили/ч; отскок на 4–5 дюймов.'}},
  {title:'K. C. Beall (Hughes Aircraft), “Surveyor spacecraft system — Surveyor 1 flight performance, vol. 3, final report”, SSD-68223R / NASA CR-93494 (1968)', url:'https://ntrs.nasa.gov/citations/19680009187', note:{en:'Retro total impulse 358,556 lb·s, Isp 288.4 s, max thrust 9,850 lb; vernier phase from 27,820 ft at 430 ft/s with 727.6 lb after a 54.68 s retro phase; retro ignition 06:14:48.558, touchdown 06:17:35.55 GMT; best estimates: cut-off at 4 ft/s, 12 ft high, 1.5 s fall, 12 ft/s at touchdown; 42.79 lb of usable propellant left.', ru:'Полный импульс РДТТ 358 556 фунт·с, удельный импульс 288,4 с, максимальная тяга 9850 фунтов; фаза верньеров с высоты 27 820 футов при 430 фут/с и массе 727,6 фунта после 54,68 с фазы РДТТ; включение РДТТ в 06:14:48,558, касание в 06:17:35,55 GMT; лучшие оценки: отсечка при 4 фут/с на высоте 12 футов, падение 1,5 с, скорость касания 12 фут/с; осталось 42,79 фунта рабочего топлива.'}},
  {title:'NASA NSSDCA, “Surveyor 2” (1966-084A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-084A', note:{en:'One vernier failed to ignite at midcourse on 21 September 1966; the spacecraft tumbled at about 1.22 rev/s and hit the Moon near Copernicus on 22 September.', ru:'21 сентября 1966 года при коррекции не включился один верньер; аппарат закрутился примерно на 1,22 оборота в секунду и 22 сентября упал на Луну близ Коперника.'}},
  {title:'NASA NSSDCA, “Surveyor 3” (1967-035A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A', note:{en:'Landed 20 April 1967; radars lost lock and the verniers kept firing: three touchdowns, 20 m and 11 m apart, engines shut off from Earth after 34 s; 14° slope; surface sampler (12 × 5 cm scoop) dug trenches up to 18 cm; 6,326 pictures; Apollo 12 removed about 10 kg of parts including the camera.', ru:'Посадка 20 апреля 1967 года; радары потеряли захват, и верньеры продолжали работать: три касания с промежутками 20 и 11 м, двигатели выключили с Земли через 34 с; склон 14°; грунтозаборник (ковш 12 × 5 см) рыл траншеи глубиной до 18 см; 6326 снимков; экипаж «Аполлона-12» снял около 10 кг деталей, в том числе камеру.'}},
  {title:'NASA NSSDCA, “Surveyor 4” (1967-068A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-068A', note:{en:'Signals ceased 41 s after retro ignition on 17 July 1967, about 2.5 min before touchdown; whether it crashed or the retro exploded is unknown.', ru:'Сигнал пропал через 41 с после включения РДТТ 17 июля 1967 года, примерно за 2,5 минуты до касания; разбился ли аппарат или взорвался двигатель, неизвестно.'}},
  {title:'NASA NSSDCA, “Surveyor 5” (1967-084A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-084A', note:{en:'Helium leak after midcourse; retro burn moved down to end at 1,300 m and 30 m/s instead of 10,700 m at 120–150 m/s; landed 11 September 1967 on a 20° slope; first in-situ analysis by alpha scattering; a 0.55 s vernier firing on the ground.', ru:'Утечка гелия после коррекции; работу РДТТ перенесли так, чтобы она закончилась на 1300 м при 30 м/с вместо 10 700 м при 120–150 м/с; посадка 11 сентября 1967 года на склон 20°; первый анализ грунта на месте методом альфа-рассеяния; включение верньеров на 0,55 с на грунте.'}},
  {title:'NASA NSSDCA, “Surveyor 6” (1967-112A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-112A', note:{en:'Landed in Sinus Medii on 10 November 1967; on 17 November a 2.5 s vernier firing lifted it 3–4 m and set it down about 2.4 m west — the first powered take-off from the Moon; 29,952 images.', ru:'Посадка в Центральном Заливе 10 ноября 1967 года; 17 ноября верньеры, включённые на 2,5 с, подняли его на 3–4 м и опустили примерно в 2,4 м к западу — первый взлёт с Луны на двигателях; 29 952 снимка.'}},
  {title:'NASA NSSDCA, “Surveyor 7” (1968-001A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1968-001A', note:{en:'Landed 10 January 1968 on the ejecta north of Tycho; the surface sampler dug trenches and moved four rocks; highland crust poorer in iron-group elements than the maria; 21,038 pictures.', ru:'Посадка 10 января 1968 года на выбросах к северу от Тихо; грунтозаборник рыл траншеи и передвинул четыре камня; материковая кора беднее элементами группы железа, чем моря; 21 038 снимков.'}},
  {title:'E. M. Christensen, S. A. Batterson, H. E. Benson, R. Choate, R. E. Hutton, L. D. Jaffe, R. H. Jones, H. Y. Ko, F. N. Schmidt, R. F. Scott, R. L. Spencer, G. H. Sutton (1968), “Lunar surface mechanical properties”, J. Geophys. Res. 73(22), 7169–7192', url:'https://doi.org/10.1029/JB073i022p07169', note:{en:'Surveyor 5 footpad trenching: granular, slightly cohesive soil; a compressible-soil model fits best with a static bearing capacity of about 2.7 N/cm².', ru:'Траншеи от опор «Сервейера-5»: зернистый, слабо связный грунт; модель сжимаемого грунта лучше всего совпадает с наблюдениями при статической несущей способности около 2,7 Н/см².'}},
  {title:'W. D. Carrier III, G. R. Olhoeft, W. Mendell (1991), “Physical properties of the lunar surface”, ch. 9 in Lunar Sourcebook (Heiken, Vaniman, French, eds.), Cambridge University Press', url:'https://www.lpi.usra.edu/publications/books/lunar_sourcebook/pdf/Chapter09.pdf', note:{en:'Surveyor pads were sized for 2.2 kPa; Apollo 11 LM pads pressed about 5 kPa against an ultimate capacity of 3,000–11,000 kPa; modulus of subgrade reaction k ≈ 8 kPa/cm on average, 2 kPa/cm at 95 % confidence; Christensen et al. (1967) found 1.5 g/cm³ at the Surveyor 1 site.', ru:'Опоры «Сервейеров» рассчитаны на 2,2 кПа; опоры лунного модуля «Аполлона-11» давили около 5 кПа при предельной несущей способности 3000–11 000 кПа; коэффициент постели k ≈ 8 кПа/см в среднем и 2 кПа/см с вероятностью 95 %; Кристенсен и др. (1967) получили 1,5 г/см³ на месте посадки «Сервейера-1».'}},
  {title:'W. F. Rogers (1972), “Apollo experience report — Lunar Module landing gear subsystem”, NASA TN D-6850', url:'https://ntrs.nasa.gov/citations/19720018253', note:{en:'Design soil: a static 1.0 psi would sink at most 4 in, a dynamic 12 psi at most 24 in; Surveyor and Lunar Orbiter data verified the specification; footpads about 3 ft across; design touchdown weight 16,000 Earth pounds; Apollo 11 simulated penetration 0.5–1.5 in.', ru:'Расчётный грунт: статическая нагрузка 1,0 фунта на кв. дюйм даёт осадку не больше 4 дюймов, динамическая 12 фунтов на кв. дюйм — не больше 24 дюймов; данные «Сервейеров» и «Лунар орбитеров» подтвердили эту спецификацию; опоры около 3 футов в диаметре; расчётный посадочный вес 16 000 земных фунтов; моделирование для «Аполлона-11» — погружение 0,5–1,5 дюйма.'}},
  {title:'Smithsonian National Air and Space Museum, “Pad, Landing Leg, Surveyor” (A19721105000)', url:'https://airandspace.si.edu/collection-objects/pad-landing-leg-surveyor/nasm_A19721105000', note:{en:'Backup crushable aluminium-honeycomb footpad, 29.8 cm (11¾ in) in diameter, identical to those on the five landed Surveyors.', ru:'Запасная сминаемая опора из алюминиевых сот диаметром 29,8 см (11¾ дюйма), такая же, как у пяти севших «Сервейеров».'}},
  {title:'NASA NSSDCA, “Lunar Orbiter 1” (1966-073A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-073A', note:{en:'Launched 10 August 1966 to photograph landing sites for Surveyor and Apollo; perilune lowered to 40.5 km; 42 high- and 187 medium-resolution frames; first pictures of the Earth from the Moon\'s distance.', ru:'Запущен 10 августа 1966 года для съёмки мест посадки «Сервейеров» и «Аполлонов»; периселений снижен до 40,5 км; 42 кадра высокого и 187 среднего разрешения; первые снимки Земли с расстояния Луны.'}},
  {title:'NASA NSSDCA, “Lunar Orbiter 5” (1967-075A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-075A', note:{en:'Near-polar orbit, perilune lowered to 99 km; cumulative coverage by the five Lunar Orbiters 99 % of the Moon, down to 1 m; 2,180 high- and 882 medium-resolution frames in all; programme cost $163 million.', ru:'Почти полярная орбита, периселений снижен до 99 км; пять «Лунар орбитеров» вместе сняли 99 % Луны с разрешением до 1 м; всего 2180 кадров высокого и 882 среднего разрешения; программа стоила 163 млн долларов.'}},
  {title:'PDS Geosciences Node, Lunar Orbiter III instrument description (L. Gaddis, C. Isbell, 2009–2010; after Kosofsky & El-Baz 1970, Bowker & Hughes 1971)', url:'https://pds-geosciences.wustl.edu/geocopy/imaging/lunar_orbiter/LO3_0001/catalog/lo3_inst.cat.txt', note:{en:'610 mm and 80 mm lenses on one 70 mm film; detect 1 m and 8 m objects from 46 km, requiring 76 lines/mm on the film; shutter 1/25, 1/50 or 1/100 s; film moved during exposure for image-motion compensation; from 55 km frames of 4.15 × 16.6 km and 31.6 × 37.4 km; film developed on board and scanned.', ru:'Объективы 610 и 80 мм на одной 70-мм плёнке; обнаружение объектов 1 м и 8 м с высоты 46 км, для чего на плёнке нужно 76 линий/мм; выдержка 1/25, 1/50 или 1/100 с; плёнка двигалась во время экспозиции для компенсации сдвига изображения; с высоты 55 км кадры 4,15 × 16,6 км и 31,6 × 37,4 км; плёнку проявляли на борту и сканировали.'}},
  {title:'NASA NSSDCA, “Apollo 12 Lunar Module / ALSEP” (1969-099C)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C', note:{en:'Intrepid landed at 06:54:35 UT on 19 November 1969 within about 180 m of Surveyor 3 (LRO-derived position 3.0128 S, 23.4219 W); Conrad and Bean visited Surveyor 3 on the second moonwalk and brought back about 10 kg of parts.', ru:'«Интрепид» сел в 06:54:35 UT 19 ноября 1969 года примерно в 180 м от «Сервейера-3» (координаты по снимкам LRO: 3,0128° ю. ш., 23,4219° з. д.); Конрад и Бин осмотрели «Сервейер-3» во время второго выхода и привезли около 10 кг деталей.'}},
  {title:'J. D. Rummel, J. H. Allton, D. Morrison (2011), “A microbe on the Moon? Surveyor III and lessons learned for future sample return missions” (presentation slides, NASA)', url:'https://smd-cms.nasa.gov/wp-content/uploads/2023/04/A_Microbe_on_the_Moon_TAGGED.pdf', note:{en:'No viable microbes from 10 of 11 sampling locations (32 of 33 samples); S. mitis grew from one piece of polyurethane foam; S. mitis was also found on the crew; no negative control; workers in short-sleeved scrubs; camera estimated to have reached about 70 °C; cites Mitchell & Ellis (1971), Proc. Second Lunar Sci. Conf. 3, 2721–2733.', ru:'Ни одного жизнеспособного микроба в 10 из 11 мест отбора (32 из 33 проб); S. mitis вырос из одного кусочка пенополиуретана; S. mitis находили и у экипажа; отрицательного контроля не было; сотрудники работали в хирургических костюмах с короткими рукавами; камера, по оценке, нагревалась примерно до 70 °C; ссылка на Mitchell & Ellis (1971), Proc. Second Lunar Sci. Conf. 3, 2721–2733.'}},
  {title:'NASA NSSDCA, “Moon Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'Volumetric mean radius 1,737.4 km; surface gravity 1.62 m/s²; escape velocity 2.38 km/s.', ru:'Средний радиус 1737,4 км; ускорение свободного падения 1,62 м/с²; вторая космическая скорость 2,38 км/с.'}},
  {title:'NASA JPL Solar System Dynamics, “Astrodynamic parameters”', url:'https://ssd.jpl.nasa.gov/astro_par.html', note:{en:'Lunar GM = 4,902.800118 km³/s².', ru:'GM Луны = 4902,800118 км³/с².'}},
  {title:'NASA Science, “First photo from the surface of the Moon” (Luna 9)', url:'https://science.nasa.gov/resource/first-photo-from-the-surface-of-the-moon-2', note:{en:'Luna 9, February 1966: the first survivable landing on the Moon and the first photos from its surface.', ru:'«Луна-9», февраль 1966 года: первая посадка на Луну, после которой аппарат продолжил работу, и первые снимки с её поверхности.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderRG(); renderSD(); renderFT(); renderLO(); renderA12();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__footing = {MU_M:MU_M, R_M:R_M, G_M:G_M, V_ESC:V_ESC, vInf:vInf, RANGERS:RANGERS, CAMS:CAMS, hyper:hyper, tToImpact:tToImpact, distToImpact:distToImpact,
  speedAt:speedAt, fitGamma:fitGamma, altAt:altAt, lineM:lineM, widthM:widthM, H_IGN:H_IGN, V_IGN:V_IGN, H_RE:H_RE, V_RE:V_RE, T_RE:T_RE, W1:W1, W2:W2,
  V_CUT:V_CUT, H_CUT:H_CUT, M_V0:M_V0, M_LAND:M_LAND, M_LEFT:M_LEFT, A_VMAX:A_VMAX, T_ACTUAL:T_ACTUAL, ISP_V:ISP_V, freeFall:freeFall, earthDrop:earthDrop,
  descent:descent, H_IGN_MIN:H_IGN_MIN, H_IGN_MAX:H_IGN_MAX, Q_S5:Q_S5, K_AVG:K_AVG, K_95:K_95, SPEC_P:SPEC_P, SPEC_D:SPEC_D, padPressure:padPressure,
  sinkCm:sinkCm, SURVEYOR_FOOT:SURVEYOR_FOOT, LM_FOOT:LM_FOOT, loObject:loObject, loFoot:loFoot, circSpeed:circSpeed, smearM:smearM, A12_DIST:A12_DIST,
  surfDist:surfDist, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
