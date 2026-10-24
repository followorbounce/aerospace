/* ============ CONSTANTS ============ */
var MU = 398600.4418, RE = 6378.137, G0 = 9.80665, FT = 0.3048, MILE = 1.609344;   // km³/s², km (equatorial), m/s², m, km
var LAMBDA_UM = 0.62;                                                               // Petzval design optimum [4]
/* 1976 U.S. Standard Atmosphere, density kg/m³ (PDAS tables [16]); log-interpolated */
var DENS = [[0,1.225],[10,0.4135],[20,0.08891],[30,0.01841],[40,0.003996],[50,1.027e-3],[60,3.097e-4],[70,8.283e-5],[80,1.846e-5],[90,3.44e-6],[100,5.604e-7],[110,9.674e-8],[120,2.22e-8],[130,8.15e-9],[140,3.831e-9],[150,2.075e-9],[160,1.234e-9],[170,7.816e-10],[180,5.194e-10],[190,3.581e-10],[200,2.541e-10],[250,6.073e-11],[300,1.916e-11],[350,6.98e-12],[400,2.803e-12],[450,1.184e-12],[500,5.215e-13],[600,1.137e-13],[700,3.07e-14],[800,1.136e-14],[900,5.759e-15],[1000,3.561e-15]];
function rho(h){
  if(h <= 0) return DENS[0][1];
  for(var i = 1; i < DENS.length; i++){ if(h <= DENS[i][0]){ var a = DENS[i - 1], b = DENS[i], f = (h - a[0])/(b[0] - a[0]); return Math.exp(Math.log(a[1]) + f*(Math.log(b[1]) - Math.log(a[1]))); } }
  return DENS[DENS.length - 1][1];
}
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function period(hp, ha){ var a = RE + (hp + ha)/2; return 2*Math.PI*Math.sqrt(a*a*a/MU); }   // s
function daysBetween(a, b){ return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2]))/86400000); }

/* ============ CH3 — RECOVERY ============ */
var H_EI = 120, H_CHUTE = 60000*FT/1000, BETA_SRV = 200;                         // km, km (60,000 ft [1]), kg/m² (assumed)
var WIN_TOP = 15000*FT, WIN_BOT = 5000*FT, H_SINKREF = 8500*FT, PASS_S = 150;      // m; illustrative assumptions
/* coast from a circular orbit h0 (km) after a backward burn dv (m/s) to the entry interface */
function coast(h0, dv){
  var r0 = RE + h0, v0 = Math.sqrt(MU/r0), v1 = v0 - dv/1000, a = 1/(2/r0 - v1*v1/MU), hh = r0*v1, p = hh*hh/MU;
  var e = Math.sqrt(Math.max(0, 1 - p/a)), re = RE + H_EI;
  if(a*(1 - e) >= re || e < 1e-9) return null;
  var nu = Math.acos(Math.max(-1, Math.min(1, (p/re - 1)/e)));                 // true anomaly at entry (before perigee: −nu)
  var ve = Math.sqrt(v1*v1 + 2*MU*(1/re - 1/r0)), gam = -Math.acos(Math.min(1, hh/(re*ve)));
  var n = Math.sqrt(MU/(a*a*a));
  function tPeri(f){ var E = 2*Math.atan(Math.sqrt((1 - e)/(1 + e))*Math.tan(f/2)); return (E - e*Math.sin(E))/n; }
  var T = 2*Math.PI/n, t = T/2 - tPeri(nu);
  var path = [];                                                                 // [t s, h km]
  for(var k = 0; k <= 40; k++){ var f = Math.PI - k/40*(Math.PI - nu), r = p/(1 + e*Math.cos(f)); path.push([T/2 - tPeri(f), r - RE]); }
  return {v0:v0, v1:v1, ve:ve, gam:gam, range:Math.PI - nu, t:t, rp:a*(1 - e) - RE, e:e, a:a, path:path};
}
/* planar point-mass flight from the entry interface to parachute opening, RK4; drag optional (for the vacuum check) */
function entry(ve, gam, beta, noDrag, hStop){
  var stop = hStop === undefined ? H_CHUTE : hStop, s = [RE + H_EI, ve*1000, gam, 0], t = 0, dt = 0.25, pk = 0, path = [[0, H_EI]];
  function der(q){
    var R = q[0], V = q[1], Gm = q[2], D = noDrag ? 0 : 0.5*rho(R - RE)*V*V/beta, g = MU*1e9/(R*R*1e6);
    return [V*Math.sin(Gm)/1000, -D - g*Math.sin(Gm), (-g*Math.cos(Gm) + V*V*Math.cos(Gm)/(R*1000))/V, V*Math.cos(Gm)/(R*1000), D];
  }
  function add(q, k, h){ return [q[0] + h*k[0], q[1] + h*k[1], q[2] + h*k[2], q[3] + h*k[3]]; }
  while(s[0] - RE > stop && t < 5000){
    var k1 = der(s), k2 = der(add(s, k1, dt/2)), k3 = der(add(s, k2, dt/2)), k4 = der(add(s, k3, dt));
    for(var i = 0; i < 4; i++) s[i] += dt/6*(k1[i] + 2*k2[i] + 2*k3[i] + k4[i]);
    pk = Math.max(pk, k1[4]/G0); t += dt;
    if(Math.round(t/dt) % 8 === 0) path.push([t, s[0] - RE]);
  }
  path.push([t, s[0] - RE]);
  return {t:t, peakG:pk, range:s[3], v:s[1], gam:s[2], r:s[0], path:path};
}
/* parachute: sink rate vRef (m/s) quoted at H_SINKREF, scaled by √(ρref/ρ); time (s) to fall from hTop to hBot (m) */
function sinkAt(vRef, hm){ return vRef*Math.sqrt(rho(H_SINKREF/1000)/rho(hm/1000)); }
function descentTime(vRef, hTop, hBot){ var t = 0, dh = 5; for(var h = hTop; h > hBot + 1e-9; h -= dh){ var d = Math.min(dh, h - hBot); t += d/sinkAt(vRef, h - d/2); } return t; }
function recover(h0, dv, sinkFt){
  var C = coast(h0, dv); if(!C) return null;
  var E = entry(C.ve, C.gam, BETA_SRV), vRef = sinkFt*FT;
  var tChute = C.t + E.t, toWin = descentTime(vRef, H_CHUTE*1000, WIN_TOP), inWin = descentTime(vRef, WIN_TOP, WIN_BOT), toSea = descentTime(vRef, H_CHUTE*1000, 0);
  return {C:C, E:E, tChute:tChute, tWin:tChute + toWin, inWin:inWin, passes:inWin/PASS_S, tSea:tChute + toSea, rangeKm:(C.range + E.range)*RE};
}
var REC_NOM = recover(200, 150, 20);                                             // aim point of the illustrative burn
/* map geometry: zone ~250 mi south of Honolulu, 250 mi N–S, ±550 mi E–W [1] */
var HNL = [21.307, -157.858], ZONE_C = [HNL[0] - 250*MILE/111.195, HNL[1]], ZONE_NS = 125*MILE, ZONE_EW = 550*MILE;
var D13 = (function(){ var d = 330*MILE, az = 315*Math.PI/180; return [HNL[0] + d*Math.cos(az)/111.195, HNL[1] + d*Math.sin(az)/(111.195*Math.cos(HNL[0]*Math.PI/180))]; })();
var INC_D14 = 77.6;                                                               // [1]
function trackAz(latDeg){ return 180 - Math.asin(Math.cos(INC_D14*Math.PI/180)/Math.cos(latDeg*Math.PI/180))*180/Math.PI; }   // southbound pass, deg from north
function shiftPoint(dKm){ var az = trackAz(ZONE_C[0])*Math.PI/180; return [ZONE_C[0] + dKm*Math.cos(az)/111.195, ZONE_C[1] + dKm*Math.sin(az)/(111.195*Math.cos(ZONE_C[0]*Math.PI/180))]; }
function inZone(pt){ var dy = (pt[0] - ZONE_C[0])*111.195, dx = (pt[1] - ZONE_C[1])*111.195*Math.cos(ZONE_C[0]*Math.PI/180); return Math.abs(dy) <= ZONE_NS && Math.abs(dx) <= ZONE_EW; }
function dRangeDdv(h0, dv){ return (recover(h0, dv + 1, 20).rangeKm - recover(h0, dv - 1, 20).rangeKm)/2; }

var recDv = document.getElementById('recDv'), recH = document.getElementById('recH'), recSinkFt = 20;
function minStr(s){ return fmt(s/60, s < 600 ? 1 : 0) + T(' min',' мин'); }
function renderRec(){
  var dv = +recDv.value, h0 = +recH.value, R = recover(h0, dv, recSinkFt);
  document.getElementById('recDvVal').textContent = fmtInt(dv) + T(' m/s',' м/с');
  document.getElementById('recHVal').textContent = fmtInt(h0) + T(' km',' км');
  recDv.setAttribute('aria-valuetext', document.getElementById('recDvVal').textContent);
  recH.setAttribute('aria-valuetext', document.getElementById('recHVal').textContent);
  var svg = document.getElementById('recSvg'), map = document.getElementById('mapSvg'); svg.innerHTML = ''; map.innerHTML = '';
  /* altitude–time chart, log altitude */
  var L = 52, Rt = 465, Tp = 24, B = 256, tmax = R ? Math.max(30, Math.ceil(R.tSea/60/10)*10) : 60;
  function X(tm){ return L + Math.min(tm, tmax)/tmax*(Rt - L); } function Y(hk){ return B - (Math.log10(Math.max(hk, 1)) - 0)/(Math.log10(400) - 0)*(B - Tp); }
  [1, 3, 10, 30, 100, 300].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:Rt, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, fmtInt(v), 'svg-small', 'end'); });
  for(var m = 0; m <= tmax; m += 10){ ns('line', {x1:X(m), y1:B, x2:X(m), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(m), B + 16, String(m), 'svg-small', 'middle'); }
  ns('line', {x1:L, y1:B, x2:Rt, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('altitude, km (log)','высота, км (лог.)'), 'svg-small');
  txt(svg, Rt, B + 32, T('minutes after the retro-burn','минуты после тормозного импульса'), 'svg-small', 'end');
  ns('rect', {x:L, y:Y(WIN_TOP/1000), width:Rt - L, height:Y(WIN_BOT/1000) - Y(WIN_TOP/1000), fill:'#f3e3dd'}, svg);
  txt(svg, L + 4, Y(WIN_TOP/1000) - 4, T('catch window 15,000–5,000 ft','окно подхвата 15 000–5000 футов'), 'svg-small svg-halo');
  ns('line', {x1:L, y1:Y(H_EI), x2:Rt, y2:Y(H_EI), stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, Rt - 4, Y(H_EI) - 4, T('entry interface 120 km','граница входа 120 км'), 'svg-small svg-halo', 'end');
  if(R){
    var d = '';
    R.C.path.forEach(function(p, i){ d += (i ? 'L' : 'M') + X(p[0]/60).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
    R.E.path.forEach(function(p){ d += 'L' + X((R.C.t + p[0])/60).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
    for(var hh = H_CHUTE*1000; hh >= 1000; hh -= 500){ var tt = R.tChute + descentTime(recSinkFt*FT, H_CHUTE*1000, hh); d += 'L' + X(tt/60).toFixed(1) + ',' + Y(hh/1000).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
    [[R.C.t, H_EI, T('entry','вход')], [R.tChute, H_CHUTE, T('chute 60,000 ft','парашют 60 000 футов')]].forEach(function(q){ ns('circle', {cx:X(q[0]/60), cy:Y(q[1]), r:4, fill:'#b5452a'}, svg); txt(svg, X(q[0]/60) + 6, Y(q[1]) - 6, q[2], 'svg-small svg-halo'); });
    ns('line', {x1:X(R.tWin/60), y1:Y(WIN_TOP/1000), x2:X((R.tWin + R.inWin)/60), y2:Y(WIN_BOT/1000), stroke:'#b5452a', 'stroke-width':4}, svg);
  } else {
    txt(svg, (L + Rt)/2, (Tp + B)/2, T('perigee stays above 120 km — no re-entry','перигей выше 120 км — входа нет'), 'svg-label', 'middle');
  }
  /* map */
  var lon0 = -171, lon1 = -144, lat0 = 12.5, lat1 = 27.5, kx = (465 - 15)/(lon1 - lon0), ky = kx/Math.cos(20*Math.PI/180);
  function MX(lon){ return 15 + (lon - lon0)*kx; } function MY(lat){ return 280 - (lat - lat0)*ky; }
  ns('rect', {x:15, y:MY(lat1), width:450, height:280 - MY(lat1), fill:'#eef2f8', stroke:'#c9c9c1'}, map);
  for(var la = 15; la <= 25; la += 5){ ns('line', {x1:15, y1:MY(la), x2:465, y2:MY(la), stroke:'#dde3ec'}, map); txt(map, 18, MY(la) - 3, la + '°' + T('N','с. ш.'), 'svg-small'); }
  for(var lo = -170; lo <= -145; lo += 5){ ns('line', {x1:MX(lo), y1:MY(lat1), x2:MX(lo), y2:280, stroke:'#dde3ec'}, map); txt(map, MX(lo), 294, (-lo) + '°' + T('W','з. д.'), 'svg-small', 'middle'); }
  var dLat = ZONE_NS/111.195, dLon = ZONE_EW/(111.195*Math.cos(ZONE_C[0]*Math.PI/180));
  ns('rect', {x:MX(ZONE_C[1] - dLon), y:MY(ZONE_C[0] + dLat), width:MX(ZONE_C[1] + dLon) - MX(ZONE_C[1] - dLon), height:MY(ZONE_C[0] - dLat) - MY(ZONE_C[0] + dLat), fill:'rgba(181,69,42,0.10)', stroke:'#b5452a', 'stroke-dasharray':'4 3'}, map);
  txt(map, MX(ZONE_C[1] + dLon) - 4, MY(ZONE_C[0] - dLat) + 13, T('recovery zone [1]','район поиска [1]'), 'svg-small svg-halo', 'end');
  [[22.05,-159.5],[21.45,-157.95],[20.8,-156.33],[19.6,-155.5]].forEach(function(p){ ns('circle', {cx:MX(p[1]), cy:MY(p[0]), r:p[1] > -156 ? 6 : 4, fill:'#5f5f59'}, map); });
  txt(map, MX(HNL[1]) + 8, MY(HNL[0]) - 6, T('Honolulu','Гонолулу'), 'svg-small svg-halo');
  ns('path', {d:'M' + (MX(D13[1]) - 5) + ',' + (MY(D13[0]) - 5) + 'l10,10m0,-10l-10,10', stroke:'#2f5aa1', 'stroke-width':2}, map);
  txt(map, MX(D13[1]) + 8, MY(D13[0]) + 4, T('Discoverer XIII splash-down [1]','приводнение «Дискаверера-13» [1]'), 'svg-small svg-halo');
  var az = trackAz(ZONE_C[0])*Math.PI/180, a1 = shiftPoint(-1400), a2 = shiftPoint(700);
  ns('line', {x1:MX(a1[1]), y1:MY(a1[0]), x2:MX(a2[1]), y2:MY(a2[0]), stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, map);
  txt(map, MX(a1[1]) + 6, MY(a1[0]) + 26, T('capsule track ↓','трасса капсулы ↓'), 'svg-small svg-halo');
  var shift = R ? R.rangeKm - REC_NOM.rangeKm : null, pt = R ? shiftPoint(shift) : null, ok = pt && inZone(pt);
  if(pt){
    var px = Math.max(20, Math.min(460, MX(pt[1]))), py = Math.max(MY(lat1) + 5, Math.min(275, MY(pt[0])));
    ns('circle', {cx:px, cy:py, r:6, fill:ok ? '#b5452a' : '#ffffff', stroke:'#b5452a', 'stroke-width':2}, map);
    if(px !== MX(pt[1]) || py !== MY(pt[0])) txt(map, px, py + (py > 150 ? -10 : 18), T('off the map','за краем карты'), 'svg-small svg-halo', 'middle');
  }
  /* readouts */
  var rows = R ? [
    [T('ENTRY SPEED / ANGLE','СКОРОСТЬ / УГОЛ ВХОДА'), fmt(R.C.ve, 2) + T(' km/s · ',' км/с · ') + fmt(R.C.gam*180/Math.PI, 2) + '°'],
    [T('BURN → ENTRY','ТОРМОЖЕНИЕ → ВХОД'), minStr(R.C.t)],
    [T('PEAK DECELERATION','ПИКОВАЯ ПЕРЕГРУЗКА'), fmt(R.E.peakG, 1) + ' g'],
    [T('ENTRY → PARACHUTE','ВХОД → ПАРАШЮТ'), minStr(R.E.t)],
    [T('PARACHUTE → WINDOW','ПАРАШЮТ → ОКНО'), minStr(R.tWin - R.tChute)],
    [T('TIME IN WINDOW','ВРЕМЯ В ОКНЕ'), minStr(R.inWin) + T(' · ~',' · ~') + fmt(R.passes, 1) + T(' passes',' захода')],
    [T('SPLASH POINT vs AIM','ТОЧКА ПАДЕНИЯ ОТНОСИТЕЛЬНО ЦЕЛИ'), (shift >= 0 ? '+' : '−') + fmtInt(Math.abs(shift)) + T(' km (',' км (') + fmtInt(Math.abs(shift)/MILE) + T(' mi) along track',' миль) вдоль трассы'), true]
  ] : [[T('PERIGEE AFTER BURN','ПЕРИГЕЙ ПОСЛЕ ТОРМОЖЕНИЯ'), T('above 120 km','выше 120 км'), true]];
  cells(document.getElementById('recReadout'), rows);
  if(R) hud2.textContent = minStr(R.inWin);
  var sens = R ? Math.abs(dRangeDdv(h0, dv)) : 0;
  document.getElementById('recStatus').innerHTML = !R
    ? T('Too gentle: the new orbit still clears the atmosphere and the capsule stays up — a failed recovery.','Слишком слабо: новая орбита по-прежнему проходит над атмосферой, капсула остаётся на орбите — возвращение сорвано.')
    : (ok ? T('Inside the zone. ','Внутри района. ') : T('Outside the zone — the aircraft are in the wrong place. ','За пределами района — самолёты не там. '))
      + T('Here each 1 m/s of retro Δv moves the splash point about ','Здесь каждый 1 м/с тормозного импульса сдвигает точку падения примерно на ') + fmtInt(sens) + T(' km, so the zone\'s 250-mile depth allows an error of only about ±',' км, поэтому глубина района в 250 миль допускает ошибку лишь около ±') + fmtInt(ZONE_NS/sens) + T(' m/s.',' м/с.')
      + (recSinkFt === 33 ? T(' At 33 ft/s the window passes in under five minutes: one or two tries.',' При 33 фут/с окно пролетает меньше чем за пять минут: одна-две попытки.') : T(' At 20 ft/s the crews get the three or four passes they asked for.',' При 20 фут/с у экипажей есть три-четыре захода, о которых они просили.'));
}
recDv.addEventListener('input', renderRec); recH.addEventListener('input', renderRec);
Array.prototype.forEach.call(document.querySelectorAll('#recSink .btn'), function(btn){ btn.addEventListener('click', function(){ recSinkFt = +this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderRec(); }); });

/* ============ CH4 — RESOLUTION ============ */
var F_MM = 609.6;                                                                  // 24 in [3][4]
/* lowest operating altitude, film resolution (low end of range), f-number [3]; USGS best resolution, ft [2] */
var KH = [
  {n:'KH-1', H:192, lp:50, N:5, ft:40}, {n:'KH-2', H:252, lp:50, N:5, ft:30}, {n:'KH-3', H:217, lp:50, N:3.5, ft:25},
  {n:'KH-4', H:211, lp:50, N:3.5, ft:25}, {n:'KH-4A', H:180, lp:120, N:3.5, ft:9}, {n:'KH-4B', H:150, lp:160, N:3.5, ft:6}
];
function grFilm(Hkm, fmm, lp){ return Hkm*1000/(fmm*lp); }                         // m, one line pair on the ground
function grDiff(Hkm, fmm, N, lamUm){ return 1.22*(lamUm || LAMBDA_UM)*1e-6*Hkm*1000/(fmm/N/1000); }   // m, Rayleigh
function lensLp(N, lamUm){ return 1/(1.22*(lamUm || LAMBDA_UM)*1e-3*N); }           // lp/mm on the film
var resH = document.getElementById('resH'), resLp = document.getElementById('resLp'), resN = document.getElementById('resN'), resK = 5;
function resPresetMatch(){ if(resK < 0) return null; var k = KH[resK]; return (+resH.value === k.H && +resLp.value === k.lp && Math.abs(+resN.value - k.N) < 1e-9) ? k : null; }
function renderRes(){
  var H = +resH.value, lp = +resLp.value, N = +resN.value, g = grFilm(H, F_MM, lp), gd = grDiff(H, F_MM, N), k = resPresetMatch();
  document.getElementById('resHVal').textContent = fmtInt(H) + T(' km',' км');
  document.getElementById('resLpVal').textContent = fmtInt(lp) + T(' lp/mm',' пар лин./мм');
  document.getElementById('resNVal').textContent = 'f/' + fmt(N, 1);
  resH.setAttribute('aria-valuetext', document.getElementById('resHVal').textContent);
  resLp.setAttribute('aria-valuetext', document.getElementById('resLpVal').textContent);
  resN.setAttribute('aria-valuetext', document.getElementById('resNVal').textContent);
  var svg = document.getElementById('resSvg'); svg.innerHTML = '';
  var L = 46, R = 465, Tp = 24, B = 256, ymax = 16;
  function X(h){ return L + (h - 100)/400*(R - L); } function Y(m){ return B - Math.min(m, ymax)/ymax*(B - Tp); }
  [0, 4, 8, 12, 16].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, String(v), 'svg-small', 'end'); });
  [100, 200, 300, 400, 500].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, String(v), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('ground resolution, m (one line pair)','разрешение на местности, м (пара линий)'), 'svg-small');
  txt(svg, R, B + 32, T('altitude, km','высота, км'), 'svg-small', 'end');
  var d1 = '', d2 = '';
  for(var h = 100; h <= 500; h += 5){ d1 += (h === 100 ? 'M' : 'L') + X(h).toFixed(1) + ',' + Y(grFilm(h, F_MM, lp)).toFixed(1); d2 += (h === 100 ? 'M' : 'L') + X(h).toFixed(1) + ',' + Y(grDiff(h, F_MM, N)).toFixed(1); }
  ns('path', {d:d1, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  ns('path', {d:d2, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.6, 'stroke-dasharray':'5 3'}, svg);
  KH.forEach(function(q, i){ var y = Y(q.ft*FT); ns('rect', {x:X(q.H) - 4, y:y - 4, width:8, height:8, fill:i === resK ? '#0b0b0c' : '#ffffff', stroke:'#0b0b0c'}, svg); txt(svg, i === 2 ? X(q.H) - 7 : X(q.H) + 7, y + (i === 3 ? 13 : -5), q.n, 'svg-small svg-halo', i === 2 ? 'end' : 'start'); });
  ns('circle', {cx:X(H), cy:Y(g), r:5, fill:'#b5452a'}, svg);
  ns('line', {x1:R - 175, y1:Tp + 12, x2:R - 160, y2:Tp + 12, stroke:'#b5452a', 'stroke-width':2}, svg); txt(svg, R - 155, Tp + 16, T('film + lens limit','предел плёнки и объектива'), 'svg-small');
  ns('line', {x1:R - 175, y1:Tp + 28, x2:R - 160, y2:Tp + 28, stroke:'#2f5aa1', 'stroke-width':1.6, 'stroke-dasharray':'5 3'}, svg); txt(svg, R - 155, Tp + 32, T('diffraction limit','дифракционный предел'), 'svg-small');
  ns('rect', {x:R - 172, y:Tp + 40, width:8, height:8, fill:'#fff', stroke:'#0b0b0c'}, svg); txt(svg, R - 155, Tp + 48, T('USGS best figure [2]','лучшее значение USGS [2]'), 'svg-small');
  var D = F_MM/N;
  var rows = [
    [T('FILM-LIMITED GROUND RESOLUTION','РАЗРЕШЕНИЕ, ПРЕДЕЛ ПЛЁНКИ'), fmt(g, 2) + T(' m',' м')],
    [T('DIFFRACTION LIMIT ON THE GROUND','ДИФРАКЦИОННЫЙ ПРЕДЕЛ НА ЗЕМЛЕ'), fmt(gd, 2) + T(' m',' м')],
    [T('APERTURE / LENS LIMIT ON FILM','АПЕРТУРА / ПРЕДЕЛ ОБЪЕКТИВА'), fmtInt(D) + T(' mm · ',' мм · ') + fmtInt(lensLp(N)) + T(' lp/mm',' пар лин./мм')],
    [T('PHOTO SCALE','МАСШТАБ СНИМКА'), '1 : ' + fmtInt(H*1e6/F_MM)]
  ];
  if(k) rows.push([T('PUBLISHED BEST (USGS) / MODEL','ОПУБЛИКОВАНО (USGS) / МОДЕЛЬ'), fmt(k.ft*FT, 1) + T(' m (',' м (') + k.ft + T(' ft) · model ',' футов) · модель ') + fmtInt(g/(k.ft*FT)*100) + ' %', true]);
  cells(document.getElementById('resReadout'), rows);
  hud1.textContent = fmt(g, 2) + T(' m',' м');
  document.getElementById('resStatus').innerHTML = k
    ? (k.n === 'KH-1'
      ? T('The film formula gives about half of KH-1\'s published 40 ft. The sources do not say why; the first camera\'s image-motion compensation, fixed for one altitude, and its acetate-based film are likely contributors [4]. The lens alone cannot explain it: KH-2 had the same f/5 Tessar.','Формула для плёнки даёт около половины опубликованных для KH-1 40 футов. Источники не объясняют почему; вероятные причины — компенсация сдвига изображения первой камеры, рассчитанная на одну высоту, и плёнка на ацетатной основе [4]. Один объектив этого не объясняет: у KH-2 был тот же «Тессар» f/5.')
      : T('The simple film limit comes out at ','Простой предел плёнки составляет ') + fmtInt(g/(k.ft*FT)*100) + T(' % of the published figure — the rest is image motion, haze and low contrast. The lens could resolve ',' % опубликованного значения — остальное дают сдвиг изображения, дымка и низкий контраст. Объектив мог бы разрешить ') + fmt(gd, 2) + T(' m: the film, not the optics, was the bottleneck.',' м: узким местом была плёнка, а не оптика.'))
    : (gd > g ? T('Now diffraction is coarser than the film: a bigger aperture (smaller f-number) would be needed to use this film.','Теперь дифракция грубее плёнки: чтобы использовать такую плёнку, нужна большая апертура (меньшее диафрагменное число).')
      : T('Film-limited: the optics could do better than the film records. Halving the altitude halves the ground resolution.','Предел — плёнка: оптика способна на большее, чем записывает плёнка. Вдвое меньшая высота — вдвое лучшее разрешение.'));
}
function resInput(){ resK = -1; pressGroup(document.getElementById('resPre'), null); var m = KH.findIndex(function(q){ return +resH.value === q.H && +resLp.value === q.lp && Math.abs(+resN.value - q.N) < 1e-9; }); if(m >= 0) resK = m; renderRes(); }
[resH, resLp, resN].forEach(function(el){ el.addEventListener('input', resInput); });
Array.prototype.forEach.call(document.querySelectorAll('#resPre .btn'), function(btn){ btn.addEventListener('click', function(){ resK = +this.getAttribute('data-k'); var k = KH[resK]; resH.value = k.H; resLp.value = k.lp; resN.value = k.N; pressGroup(this.parentNode, this); renderRes(); }); });

/* ============ CH4 — PANORAMIC SWEEP ============ */
var FILM_W_MM = 2.18*25.4, FRAME_L_MM = 29.8*25.4;                                // [3][2]
function swathTrue(Hkm, scanDeg){ var a = scanDeg/2*Math.PI/180, s = (RE + Hkm)/RE*Math.sin(a); if(s >= 1) return NaN; return 2*RE*(Math.asin(s) - a); }
function swathFlat(Hkm, scanDeg){ return 2*Hkm*Math.tan(scanDeg/2*Math.PI/180); }
function swathArc(Hkm, scanDeg){ return Hkm*scanDeg*Math.PI/180; }
function frameWidth(Hkm){ return FILM_W_MM*Hkm/F_MM; }                                 // km along track
function panAngle(){ return FRAME_L_MM/F_MM*180/Math.PI; }
var swH = document.getElementById('swH'), swA = document.getElementById('swA');
function renderSw(){
  var H = +swH.value, A = +swA.value, half = A/2*Math.PI/180, st = swathTrue(H, A), c = Math.cos(half);
  document.getElementById('swHVal').textContent = fmtInt(H) + T(' km',' км');
  document.getElementById('swAVal').textContent = fmt(A, 2) + '°';
  swH.setAttribute('aria-valuetext', document.getElementById('swHVal').textContent);
  swA.setAttribute('aria-valuetext', document.getElementById('swAVal').textContent);
  var svg = document.getElementById('swSvg'); svg.innerHTML = '';
  var cx = 240, k = 300/700, sy = 60;                                /* satellite at (240, 60); ground arc below, 300 px = 700 km */
  var gy = sy + H*k, Rk = RE*k, ecy = gy + Rk;
  var d = '', span = 0.12;
  for(var i = 0; i <= 60; i++){ var th = -span + 2*span*i/60; d += (i ? 'L' : 'M') + (cx + Rk*Math.sin(th)).toFixed(1) + ',' + (ecy - Rk*Math.cos(th)).toFixed(1); }
  ns('path', {d:d + 'L' + (cx + Rk*Math.sin(span)).toFixed(1) + ',300L' + (cx - Rk*Math.sin(span)).toFixed(1) + ',300Z', fill:'#e8e6dc', stroke:'#0b0b0c'}, svg);
  ns('circle', {cx:cx, cy:sy, r:5, fill:'#0b0b0c'}, svg); txt(svg, cx + 8, sy - 6, T('satellite, ','спутник, ') + fmtInt(H) + T(' km',' км'), 'svg-small svg-halo');
  if(isFinite(st) && A > 0){
    var lam = st/2/RE;
    [-1, 1].forEach(function(sg){ var ex = cx + sg*Rk*Math.sin(lam), ey = ecy - Rk*Math.cos(lam); ns('line', {x1:cx, y1:sy, x2:ex, y2:ey, stroke:'#b5452a', 'stroke-width':1.5}, svg); });
    var arc = ''; for(var j = 0; j <= 30; j++){ var t2 = -lam + 2*lam*j/30; arc += (j ? 'L' : 'M') + (cx + Rk*Math.sin(t2)).toFixed(1) + ',' + (ecy - Rk*Math.cos(t2)).toFixed(1); }
    ns('path', {d:arc, fill:'none', stroke:'#b5452a', 'stroke-width':4}, svg);
    txt(svg, cx, ecy - Rk + 22, fmtInt(st) + T(' km on the ground',' км на земле'), 'svg-small svg-halo', 'middle');
    ns('path', {d:'M' + cx + ',' + sy + 'L' + (cx - 40*Math.sin(half)) + ',' + (sy + 40*Math.cos(half)) + 'A40,40 0 0,0 ' + (cx + 40*Math.sin(half)) + ',' + (sy + 40*Math.cos(half)) + 'Z', fill:'rgba(181,69,42,0.15)'}, svg);
  }
  ns('line', {x1:cx, y1:sy, x2:cx, y2:gy, stroke:'#5f5f59', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, 20, 290, T('cross-section across the track, to scale','разрез поперёк трассы, в масштабе'), 'svg-small');
  var rows = [
    [T('GROUND SWATH (SPHERICAL EARTH)','ПОЛОСА НА ЗЕМЛЕ (СФЕРА)'), isFinite(st) ? fmtInt(st) + T(' km',' км') : T('beyond the horizon','за горизонтом')],
    [T('FLAT-EARTH 2H tan(θ/2)','ПЛОСКАЯ ЗЕМЛЯ 2H tg(θ/2)'), fmtInt(swathFlat(H, A)) + T(' km',' км')],
    [T('H × θ (TABLE CONVENTION)','H × θ (КАК В ТАБЛИЦЕ)'), fmtInt(swathArc(H, A)) + T(' km',' км')],
    [T('FRAME WIDTH ALONG TRACK','ШИРИНА КАДРА ВДОЛЬ ТРАССЫ'), fmt(frameWidth(H), 1) + T(' km',' км')],
    [T('DETAIL STRETCH AT THE EDGE','РАСТЯЖЕНИЕ ДЕТАЛЕЙ НА КРАЮ'), T('along ×','вдоль ×') + fmt(1/c, 2) + T(' · across ×',' · поперёк ×') + fmt(1/(c*c), 2), true]
  ];
  cells(document.getElementById('swReadout'), rows);
  document.getElementById('swStatus').innerHTML = A === 0
    ? T('A fixed lens of the same focal length would see only the film width straight down — the sweep is what made one camera cover a whole region per frame.','Неподвижный объектив с тем же фокусом видел бы под собой только ширину плёнки — именно качание позволяло одной камере снимать за кадр целый район.')
    : T('At the end of the sweep the ground is ','На краю качания земля в ') + fmt(1/c, 2) + T(' times farther away and seen at a slant, so small objects across the track look ',' раза дальше и видна наклонно, поэтому мелкие предметы поперёк трассы выглядят в ') + fmt(1/(c*c), 2) + T(' times coarser than at nadir.',' раза грубее, чем в надире.');
}
swH.addEventListener('input', function(){ pressGroup(document.getElementById('swPre'), null); renderSw(); });
swA.addEventListener('input', function(){ pressGroup(document.getElementById('swPre'), null); renderSw(); });
Array.prototype.forEach.call(document.querySelectorAll('#swPre .btn'), function(btn){ btn.addEventListener('click', function(){ swH.value = this.getAttribute('data-h'); swA.value = this.getAttribute('data-a'); pressGroup(this.parentNode, this); renderSw(); }); });

/* ============ CH5 — ORBIT TRADE ============ */
/* orbit-averaged Gauss drag equations (a km, e), β kg/m²; returns [da/dt km/s, de/dt 1/s] */
function rates(a, e, beta){
  var n = 48, sa = 0, se = 0;
  for(var k = 0; k < n; k++){
    var E = (k + 0.5)/n*2*Math.PI, ce = Math.cos(E), r = a*(1 - e*ce), v = Math.sqrt(MU*(2/r - 1/a)), cosv = (ce - e)/(1 - e*ce), w = (1 - e*ce)/n, rk = rho(r - RE)*1e9;   // kg/km³
    sa += w*(-a*a*rk*v*v*v/(MU*beta*1e6)); se += w*(-rk*v*(e + cosv)/(beta*1e6));
  }
  return [sa, se];
}
var LIFE_CAP = 3652.5;                                                             // days (10 years)
function lifetime(hp, ha, beta){                                                   // days until perigee falls to 100 km
  var rp = RE + hp, ra = RE + Math.max(ha, hp), a = (rp + ra)/2, e = (ra - rp)/(ra + rp), t = 0;
  for(var it = 0; it < 20000 && a*(1 - e) - RE > 100; it++){
    var r = rates(a, e, beta), dt = Math.min(30*86400, 1/Math.abs(r[0]));
    a += r[0]*dt; e = Math.max(0, e + r[1]*dt); t += dt;
    if(t/86400 > LIFE_CAP) return Infinity;
  }
  return t/86400;
}
/* circular-orbit reference integrator (same density table) for the check */
function lifetimeCirc(h, beta){ var t = 0, dh = 0.05; while(h > 100){ var a = (RE + h)*1000, dadt = rho(h)/beta*Math.sqrt(MU*1e9*a); t += dh*1000/dadt; h -= dh; } return t/86400; }
function lifeStr(dd){
  if(!isFinite(dd)) return T('more than 10 years','больше 10 лет');
  if(dd < 2) return fmt(dd*24, dd*24 < 10 ? 1 : 0) + T(' hours',' ч');
  if(dd < 365) return fmt(dd, dd < 20 ? 1 : 0) + T(' days',' сут');
  return fmt(dd/365.25, 1) + T(' years',' лет');
}
var orbP = document.getElementById('orbP'), orbA = document.getElementById('orbA'), orbB = document.getElementById('orbB');
function renderOrb(){
  var hp = +orbP.value, ha = Math.max(+orbA.value, hp), beta = +orbB.value, life = lifetime(hp, ha, beta), g = grFilm(hp, F_MM, 160);
  document.getElementById('orbPVal').textContent = fmtInt(hp) + T(' km',' км');
  document.getElementById('orbAVal').textContent = fmtInt(ha) + T(' km',' км');
  document.getElementById('orbBVal').textContent = fmtInt(beta) + T(' kg/m²',' кг/м²');
  [orbP, orbA, orbB].forEach(function(el){ el.setAttribute('aria-valuetext', document.getElementById(el.id + 'Val').textContent); });
  var svg = document.getElementById('orbSvg'); svg.innerHTML = '';
  var L = 46, R = 430, Tp = 24, B = 256;
  function X(h){ return L + (h - 120)/280*(R - L); } function Y(dd){ return B - (Math.log10(Math.max(0.01, Math.min(dd, 10000))) + 2)/6*(B - Tp); } function Y2(m){ return B - m/4*(B - Tp); }
  [[0.01,T('15 min','15 мин')],[0.1,T('2.4 h','2,4 ч')],[1,T('1 d','1 сут')],[10,T('10 d','10 сут')],[100,T('100 d','100 сут')],[1000,T('2.7 yr','2,7 г.')],[10000,T('27 yr','27 лет')]].forEach(function(p){ ns('line', {x1:L, y1:Y(p[0]), x2:R, y2:Y(p[0]), stroke:'#e4e4de'}, svg); txt(svg, L - 4, Y(p[0]) + 4, p[1], 'svg-small', 'end'); });
  [120, 200, 300, 400].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, String(v), 'svg-small', 'middle'); });
  [0, 1, 2, 3, 4].forEach(function(v){ txt(svg, R + 6, Y2(v) + 4, v + T(' m',' м'), 'svg-small'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L - 40, 14, T('lifetime (log)','срок жизни (лог.)'), 'svg-small');
  txt(svg, R + 46, 14, T('KH-4B resolution','разрешение KH-4B'), 'svg-small', 'end');
  txt(svg, R, B + 32, T('perigee altitude, km','высота перигея, км'), 'svg-small', 'end');
  var d = '', d2 = '';
  for(var h = 120; h <= 400; h += 10){ var lh = lifetime(h, Math.max(ha, h), beta); d += (d ? 'L' : 'M') + X(h).toFixed(1) + ',' + Y(isFinite(lh) ? lh : LIFE_CAP).toFixed(1); d2 += (d2 ? 'L' : 'M') + X(h).toFixed(1) + ',' + Y2(grFilm(h, F_MM, 160)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('path', {d:d2, fill:'none', stroke:'#b5452a', 'stroke-width':1.6, 'stroke-dasharray':'5 3'}, svg);
  ns('line', {x1:L, y1:Y(LIFE_CAP), x2:R, y2:Y(LIFE_CAP), stroke:'#5f5f59', 'stroke-dasharray':'2 3'}, svg); txt(svg, R - 4, Y(LIFE_CAP) - 4, T('10 years: calculation stops','10 лет: расчёт останавливается'), 'svg-small svg-halo', 'end');
  ns('circle', {cx:X(hp), cy:Y(isFinite(life) ? life : LIFE_CAP), r:5.5, fill:'#0b0b0c'}, svg);
  ns('circle', {cx:X(hp), cy:Y2(g), r:4.5, fill:'#b5452a'}, svg);
  ns('line', {x1:X(150), y1:Y(19), x2:X(150) + 8, y2:Y(19), stroke:'#2f5aa1', 'stroke-width':3}, svg); txt(svg, X(150) + 11, Y(19) + 4, T('KH-4B: 19 days at 150 km, with make-up burns [3]','KH-4B: 19 сут на 150 км, с подъёмами орбиты [3]'), 'svg-small svg-halo');
  var r0 = rates(RE + (hp + ha)/2, (ha - hp)/(2*RE + hp + ha), beta);
  cells(document.getElementById('orbReadout'), [
    [T('LIFETIME WITHOUT MAKE-UP BURNS','СРОК ЖИЗНИ БЕЗ ПОДЪЁМОВ ОРБИТЫ'), lifeStr(life)],
    [T('PERIOD','ПЕРИОД'), fmt(period(hp, ha)/60, 1) + T(' min',' мин')],
    [T('KH-4B RESOLUTION AT PERIGEE','РАЗРЕШЕНИЕ KH-4B В ПЕРИГЕЕ'), fmt(g, 2) + T(' m',' м')],
    [T('INITIAL DECAY OF a','НАЧАЛЬНОЕ СНИЖЕНИЕ a'), fmt(-r0[0]*86400, -r0[0]*86400 < 10 ? 2 : 0) + T(' km/day',' км/сут')]
  ]);
  document.getElementById('orbStatus').innerHTML = life < 2
    ? T('Razor-sharp and doomed: an unpowered orbit this low lasts hours. CORONA dipped its perigee over the targets and fired drag make-up rockets to stay up [1].','Предельно резко — и обречено: такая низкая орбита без двигателя живёт часы. CORONA опускала перигей над целями и включала компенсаторы торможения, чтобы удержаться [1].')
    : life < 60 ? T('A workable compromise for a film satellite: weeks of life, and the film runs out about as fast.','Работоспособный компромисс для плёночного спутника: недели жизни, а плёнка кончается примерно так же быстро.')
    : T('Long-lived but softer pictures: every 50 km of extra perigee costs about half a metre of KH-4B resolution.','Долгая жизнь, но менее резкие снимки: каждые 50 км перигея стоят около полуметра разрешения KH-4B.');
}
function orbInput(e){ pressGroup(document.getElementById('orbPre'), null); if(+orbA.value < +orbP.value){ if(e && e.target === orbP) orbA.value = orbP.value; else orbP.value = orbA.value; } renderOrb(); }
[orbP, orbA, orbB].forEach(function(el){ el.addEventListener('input', orbInput); });
Array.prototype.forEach.call(document.querySelectorAll('#orbPre .btn'), function(btn){ btn.addEventListener('click', function(){ orbP.value = this.getAttribute('data-p'); orbA.value = this.getAttribute('data-a'); pressGroup(this.parentNode, this); renderOrb(); }); });

/* ============ CH8 — LEGACY ============ */
var TIMELINE = [
  ['1956', 'The U-2 begins overflying the Soviet Union [1].', 'U-2 начинает полёты над Советским Союзом [1].'],
  ['1959', '<b>February:</b> the first Discoverer launch. Twelve attempts to June 1960; no capsule comes back [1].', '<b>Февраль:</b> первый пуск «Дискаверера». Двенадцать попыток до июня 1960 года; ни одна капсула не вернулась [1].'],
  ['1960', '<b>1 May:</b> Francis Gary Powers shot down near Sverdlovsk [1]. <b>11 August:</b> Discoverer XIII\'s capsule lifted from the sea — the first object recovered from orbit [6]. <b>19 August:</b> Discoverer XIV\'s film caught in mid-air at 8,500 ft [1].', '<b>1 мая:</b> под Свердловском сбит Фрэнсис Гэри Пауэрс [1]. <b>11 августа:</b> капсулу «Дискаверера-13» поднимают из моря — первый предмет, возвращённый с орбиты [6]. <b>19 августа:</b> плёнку «Дискаверера-14» подхватывают в воздухе на высоте 8500 футов [1].'],
  ['1961', '<b>11 December:</b> the first Zenit-2 launch fails [12].', '<b>11 декабря:</b> первый пуск «Зенита-2» — авария [12].'],
  ['1962', '<b>February:</b> KH-4 brings stereo pairs [3]. <b>26 April:</b> Kosmos 4, the first Zenit in orbit; <b>28 July:</b> Kosmos 7, the first full success [9][11].', '<b>Февраль:</b> KH-4 даёт стереопары [3]. <b>26 апреля:</b> «Космос-4» — первый «Зенит» на орбите; <b>28 июля:</b> «Космос-7» — первый полный успех [9][11].'],
  ['1963', 'KH-4A: two film capsules per mission [1][3].', 'KH-4A: две капсулы с плёнкой за полёт [1][3].'],
  ['1967', '<b>September:</b> first KH-4B with the J-3 constant-rotator camera; about 1.8 m at best [2][3].', '<b>Сентябрь:</b> первый KH-4B с камерой J-3 постоянного вращения; лучшее разрешение около 1,8 м [2][3].'],
  ['1972', '<b>31 May:</b> the last CORONA capsule recovered — the 145th launch, the 165th recovery [1].', '<b>31 мая:</b> подобрана последняя капсула CORONA — 145-й пуск, 165-е возвращение [1].'],
  ['1976', '<b>19 December:</b> KENNEN (KH-11), the NRO\'s first electro-optical imaging satellite [7].', '<b>19 декабря:</b> KENNEN (KH-11) — первый оптико-электронный спутник видовой разведки NRO [7].'],
  ['1982', '<b>28 December:</b> Yantar-4KS1 “Terilen”, the first Soviet real-time digital system [13].', '<b>28 декабря:</b> «Янтарь-4КС1» («Терилен») — первая советская система цифровой съёмки в реальном времени [13].'],
  ['1994', 'The last Zenit flies [9].', 'Последний полёт «Зенита» [9].'],
  ['1995', '<b>22 February:</b> Executive Order 12951 declassifies CORONA, ARGON and LANYARD imagery [1][2].', '<b>22 февраля:</b> указ 12951 рассекречивает снимки CORONA, ARGON и LANYARD [1][2].'],
  ['2008', 'KH-4 frames from 1962 measure the retreat of the Khumbu glaciers near Everest [15].', 'Кадры KH-4 1962 года позволяют измерить отступание ледников Кхумбу у Эвереста [15].'],
  ['2014', 'The CORONA Atlas of the Middle East: about 10,000 new archaeological sites [14].', 'Атлас CORONA Ближнего Востока: около 10 000 новых археологических памятников [14].'],
  ['2021', 'The NRO releases more than 3,000 documents on the move “From Buckets to Bits” [8].', 'NRO публикует более 3000 документов о переходе «От капсул к битам» [8].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'K. C. Ruffner (ed.) (1995), “CORONA: America\'s First Satellite Program”, CIA Center for the Study of Intelligence', url:'https://www.cia.gov/resources/csi/static/corona.pdf', note:{en:'Preface and the 1973 programme history: U-2 gap, 110 days; twelve launches Feb 1959 – June 1960, none recovered; recovery sequence; drop tests (33 vs 20 ft/s); recovery zone; Discoverer XIII (330 miles NW of Hawaii) and XIV (17th pass, 60,000 ft, 8,506 ft on the third pass, 77.6°, 502 × 116 miles, 94.5 min); definition of ground resolution; the 1995 introduction\'s resolutions (KH-1 40 ft nominal, KH-2/KH-3 10 ft, KH-4B 5 ft) and Gore\'s unveiling on 24 February 1995; low perigees and drag make-up units; 145 launches, 165 recoveries, final recovery 31 May 1972; EO of 22 February 1995, more than 800,000 images.', ru:'Предисловие и история программы 1973 года: разрыв после U-2, 110 дней; двенадцать пусков с февраля 1959 по июнь 1960 года без возвращения; последовательность возвращения; испытательные сбросы (33 и 20 фут/с); район поиска; «Дискаверер-13» (330 миль к северо-западу от Гавайев) и «Дискаверер-14» (17-й виток, 60 000 футов, 8506 футов с третьего захода, 77,6°, 502 × 116 миль, 94,5 мин); определение разрешения на местности; разрешения во введении 1995 года (KH-1 — номинально 40 футов, KH-2/KH-3 — 10 футов, KH-4B — 5 футов) и показ снимков Гором 24 февраля 1995 года; низкие перигеи и компенсаторы торможения; 145 пусков, 165 возвращений, последнее 31 мая 1972 года; указ от 22 февраля 1995 года, более 800 000 снимков.'}},
  {title:'USGS EROS, “Declassified Satellite Imagery – 1”', url:'https://www.usgs.gov/centers/eros/science/usgs-eros-archive-declassified-data-declassified-satellite-imagery-1', note:{en:'Best ground resolution KH-1 40 ft, KH-2 30 ft, KH-3 and KH-4 25 ft, KH-4A 9 ft, KH-4B 6 ft; 70 mm × 29.8 in frames; two panoramic cameras 30° apart from KH-4; more than 860,000 images 1960–1972; Executive Order 12951 (1995); 7 or 14 µm scans; existing scans free on EarthExplorer, on-demand scans $30 per frame (checked 22 October 2026).', ru:'Лучшее разрешение: KH-1 — 40 футов, KH-2 — 30, KH-3 и KH-4 — 25, KH-4A — 9, KH-4B — 6 футов; кадры 70 мм × 29,8 дюйма; с KH-4 — две панорамные камеры под углом 30°; более 860 000 снимков 1960–1972 годов; указ 12951 (1995); сканы 7 или 14 мкм; готовые сканы бесплатно в EarthExplorer, сканирование по заказу — 30 долларов за кадр (проверено 22 октября 2026 года).'}},
  {title:'N. Galiatsatos (2009), “The Shift from Film to Digital Product: Focus on CORONA Imagery”, PFG 3/2009, 251–260', url:'https://dgpf.de/pfg/2009/pfg2009_3_Galiatsatos.pdf', note:{en:'Table 1: periods of operation, mission life (1 → 19 days), lowest altitudes (KH-1 192 km … KH-4B 150 km), pan angle 71.16°, ground resolution KH-2 7.6 m and KH-4B 1.8–7.6 m, f/5 Tessar → f/3.5 Petzval, 61 cm focal length, film 50–100 → 120 → 160 lp/mm, coverage 13.8 × 188 km (KH-4B), 17 × 232 km (KH-4A).', ru:'Табл. 1: периоды работы, длительность полёта (от 1 до 19 суток), наименьшие высоты (KH-1 — 192 км … KH-4B — 150 км), угол панорамирования 71,16°, разрешение KH-2 — 7,6 м, KH-4B — 1,8–7,6 м, «Тессар» f/5 → Пецваль f/3,5, фокус 61 см, плёнка 50–100 → 120 → 160 пар линий/мм, охват 13,8 × 188 км (KH-4B), 17 × 232 км (KH-4A).'}},
  {title:'A. Dashora, B. Lohani, J. N. Malik (2007), “A repository of earth resource information – CORONA satellite programme”, Current Science 92(7), 926–932', url:'https://www.iitg.ac.in/abd/CORONA_Program_Current_Science_2007.pdf', note:{en:'Focal length 609.602 mm (24 in); image format 2.18 × 29.8 in; acetate film base on KH-1 only; Tessar f/5 replaced by Petzval f/3.5 to remove residual chromatic blur; fore and aft cameras 15° from vertical; KH-1\'s constant image-motion compensation for one altitude; Petzval design wavelengths 0.5461–0.7100 µm, optimum 0.62 and 0.65 µm.', ru:'Фокусное расстояние 609,602 мм (24 дюйма); формат кадра 2,18 × 29,8 дюйма; ацетатная основа плёнки только у KH-1; «Тессар» f/5 заменён объективом Пецваля f/3,5, чтобы убрать остаточное хроматическое размытие; передняя и задняя камеры отклонены на 15° от вертикали; постоянная компенсация сдвига изображения у KH-1 — для одной высоты; расчётные длины волн объектива Пецваля 0,5461–0,7100 мкм, оптимальные — 0,62 и 0,65 мкм.'}},
  {title:'Smithsonian National Air and Space Museum, “Camera, Lens, Petzval, Corona”', url:'https://airandspace.si.edu/collection-objects/camera-lens-petzval-corona/nasm_A19960624000', note:{en:'Petzval lens of the KH-4 to KH-4B cameras, 1962–1972; “about two meters (six feet)” by May 1972; made by Itek.', ru:'Объектив Пецваля камер KH-4 — KH-4B, 1962–1972; «около двух метров (шести футов)» к маю 1972 года; изготовлен компанией Itek.'}},
  {title:'Smithsonian National Air and Space Museum, “Reentry Capsule, Satellite, Discoverer XIII”', url:'https://airandspace.si.edu/collection-objects/discoverer-13/nasm_A19610100000', note:{en:'Recovered north of Hawaii by the U.S. Navy on 11 August 1960; “the first man-made object to be recovered from orbit”; 73.7 × 47 cm, 136.1 kg.', ru:'Подобрана ВМС США к северу от Гавайев 11 августа 1960 года; «первый рукотворный объект, возвращённый с орбиты»; 73,7 × 47 см, 136,1 кг.'}},
  {title:'J. T. Page II (2017), “Piecing the puzzle by piercing the veil: The declassification of KENNEN”, The Space Review', url:'https://thespacereview.com/article/3245/1', note:{en:'Quotes the NRO: “On December 19, 1976, the NRO launched the KENNEN (KH-11) near real-time electro-optical satellite”, its first electro-optical imaging satellite.', ru:'Цитирует NRO: «19 декабря 1976 года NRO запустило KENNEN (KH-11) — оптико-электронный спутник, работающий почти в реальном времени», его первый оптико-электронный спутник видовой разведки.'}},
  {title:'Intelligence Community News (2021), “NRO releases collection of previously classified documents”', url:'https://intelligencecommunitynews.com/nro-releases-collection-of-previously-classified-documents/', note:{en:'17 November 2021: “From Buckets to Bits”, more than 3,000 documents on the transition from film to electro-optical imaging.', ru:'17 ноября 2021 года: «From Buckets to Bits» («От капсул к битам») — более 3000 документов о переходе от плёнки к оптико-электронной съёмке.'}},
  {title:'Wikipedia, “Zenit (satellite)”', url:'https://en.wikipedia.org/wiki/Zenit_(satellite)', note:{en:'Vostok-derived; 2.3 m, ~2,400 kg capsule with cameras and film; four 1,000 mm and one 200 mm camera on most flights; 10–15 m stated resolution; perigee ~200 km, apogee 250–350 km, 8–15 days; Kosmos 7 a success; last Zenit 1994. Tertiary source, citing Gorin (1998).', ru:'На базе «Востока»; капсула 2,3 м, ~2400 кг с фотоаппаратами и плёнкой; на большинстве полётов — четыре аппарата 1000 мм и один 200 мм; заявленное разрешение 10–15 м; перигей ~200 км, апогей 250–350 км, 8–15 суток; «Космос-7» — успех; последний «Зенит» — 1994 год. Третичный источник со ссылкой на Gorin (1998).'}},
  {title:'Russian-language Wikipedia, “Zenit (spacecraft)”', url:'https://ru.wikipedia.org/wiki/%D0%97%D0%B5%D0%BD%D0%B8%D1%82_%28%D0%BA%D0%BE%D1%81%D0%BC%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%B0%D0%BF%D0%BF%D0%B0%D1%80%D0%B0%D1%82%29', note:{en:'Russian article: Zenit-2 «Ftor-2» set with a 200 mm «Orion» and two 1,000 mm «Leningrad-9» cameras, a third long-focus camera added later («Ftor-2R»); 150 km coverage from 250 km; resolution presumed about 10 m; 81 Zenit-2 launches; accepted into service in 1964.', ru:'Комплект «Фтор-2» на «Зените-2»: аппарат «Орион» 200 мм и два аппарата «Ленинград-9» 1000 мм, позже добавлен третий длиннофокусный аппарат («Фтор-2Р»); полоса 150 км с высоты 250 км; разрешение предположительно около 10 м; 81 пуск «Зенита-2»; принят на вооружение в 1964 году.'}},
  {title:'Wikipedia, “Kosmos 4”', url:'https://en.wikipedia.org/wiki/Kosmos_4', note:{en:'Launched 26 April 1962, 10:02 GMT, from Baikonur on a Vostok-K; returned 29 April 1962 in the Kazakh steppe after an orientation-system problem; previous attempt failed on 11 December 1961.', ru:'Запущен 26 апреля 1962 года в 10:02 по Гринвичу с Байконура ракетой «Восток-К»; возвращён 29 апреля 1962 года в казахстанскую степь после неполадки системы ориентации; предыдущая попытка 11 декабря 1961 года закончилась аварией.'}},
  {title:'Gunter\'s Space Page, “Zenit-2 (11F61)”', url:'https://space.skyrocket.de/doc_sdat/zenit-2.htm', note:{en:'Launch list of 81 Zenit-2 flights from 11 December 1961; Ftor-2 camera package.', ru:'Список 81 пуска «Зенита-2» начиная с 11 декабря 1961 года; фотоаппаратура «Фтор-2».'}},
  {title:'Wikipedia, “Yantar (satellite)”', url:'https://en.wikipedia.org/wiki/Yantar_(satellite)', note:{en:'Yantar-2K with two film-return capsules for about a month in orbit; Yantar-4KS1 Terilen, first launched 28 December 1982, the first Soviet real-time digital system.', ru:'«Янтарь-2К» с двумя капсулами для возврата плёнки, около месяца на орбите; «Янтарь-4КС1» («Терилен»), впервые запущенный 28 декабря 1982 года, — первая советская система цифровой съёмки в реальном времени.'}},
  {title:'D. Vergano (2014), “Cold War Spy-Satellite Images Unveil Lost Cities”, National Geographic, 26 April 2014', url:'https://www.nationalgeographic.com/adventure/article/140425-corona-spy-satellite-archaeology-science', note:{en:'J. Casana\'s CORONA Atlas of the Middle East: started from about 4,500 known sites and found about 10,000 previously unknown ones.', ru:'Атлас CORONA Ближнего Востока Дж. Касаны: начав примерно с 4500 известных памятников, нашли около 10 000 ранее неизвестных.'}},
  {title:'T. Bolch, M. Buchroithner, T. Pieczonka, A. Kunert (2008), “Planimetric and volumetric glacier changes in the Khumbu Himal, Nepal, since 1962 using Corona, Landsat TM and ASTER data”, Journal of Glaciology 54(187), 592–600', url:'https://doi.org/10.3189/002214308786570782', note:{en:'1962 Corona KH-4 imagery; ice coverage decreased by about 5 % between 1962 and 2005; clean-ice area by more than 10 %.', ru:'Снимки Corona KH-4 1962 года; площадь льда сократилась примерно на 5 % с 1962 по 2005 год, площадь чистого льда — более чем на 10 %.'}},
  {title:'Public Domain Aeronautical Software, “Tables of the U.S. Standard Atmosphere, 1976” (0–1000 km)', url:'https://www.pdas.com/bigtables.html', note:{en:'Density from the tabulated number density and molecular weight: 1.225 kg/m³ at sea level, 5.60 × 10⁻⁷ at 100 km, 2.08 × 10⁻⁹ at 150 km, 2.54 × 10⁻¹⁰ at 200 km; mean solar conditions.', ru:'Плотность из табличных концентрации частиц и молекулярной массы: 1,225 кг/м³ у уровня моря, 5,60 × 10⁻⁷ на 100 км, 2,08 × 10⁻⁹ на 150 км, 2,54 × 10⁻¹⁰ на 200 км; средние солнечные условия.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderRec(); renderRes(); renderSw(); renderOrb();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__bucket = {rho:rho, period:period, daysBetween:daysBetween, coast:coast, entry:entry, recover:recover, descentTime:descentTime, sinkAt:sinkAt, dRangeDdv:dRangeDdv,
  shiftPoint:shiftPoint, inZone:inZone, trackAz:trackAz, ZONE_C:ZONE_C, ZONE_NS:ZONE_NS, D13:D13, REC_NOM:REC_NOM, grFilm:grFilm, grDiff:grDiff, lensLp:lensLp, KH:KH, F_MM:F_MM,
  swathTrue:swathTrue, swathFlat:swathFlat, swathArc:swathArc, frameWidth:frameWidth, panAngle:panAngle, rates:rates, lifetime:lifetime, lifetimeCirc:lifetimeCirc,
  MU:MU, RE:RE, FT:FT, MILE:MILE, H_CHUTE:H_CHUTE, WIN_TOP:WIN_TOP, WIN_BOT:WIN_BOT, PASS_S:PASS_S};
