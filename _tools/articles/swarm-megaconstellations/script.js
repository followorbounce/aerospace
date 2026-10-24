/* ============ CONSTANTS ============ */
var MU = 398600.4418, RE = 6378.137, RM = 6371.0, C_KMS = 299792.458, N_FIBRE = 1.47, D2R = Math.PI/180;
var T_SID = 86164.0905;                                                         // sidereal day, s
var A_GEO = Math.cbrt(MU*Math.pow(T_SID/(2*Math.PI), 2));                       // km from Earth's centre
var H_GEO = A_GEO - RE;
function vCirc(r){ return Math.sqrt(MU/r); }
/* number with RU-style grouping; four-digit numbers unspaced in Russian, as in the body text */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }

/* ============ SNAPSHOT: McDowell, 15 Oct 2026 [9][10] ============ */
var SNAP = {date:'2026-10-15', slLaunched:13015, slInOrbit:11154, slOp:9726, slDown:1861, slDisposed:1508, g47:49, g47lost:38};
/* Starlink operational satellites by shell [10]: [label EN, label RU, altitude text, inclination, count] */
var SHELLS = [
  ['Main shells, 53°', 'Основные оболочки, 53°', '463–540', '53.0–53.2', 372 + 44 + 2 + 275 + 100 + 786 + 322 + 2416],
  ['43° shells', 'Оболочки 43°', '483', '43.0', 641 + 2581],
  ['Polar shells', 'Полярные оболочки', '465–549', '97.3–97.6', 1220 + 6],
  ['70° shells', 'Оболочки 70°', '438–572', '70.0', 192 + 132 + 1],
  ['Direct-to-cell', 'Прямая связь с телефонами', '357–359', '43.0 / 53.2', 309 + 327]
];
/* [name EN, name RU, launched, operational, planned, first launch] [7][9][10] */
var FLEET = [
  ['Starlink (SpaceX)', 'Starlink (SpaceX)', 13015, 9726, 34864, '2019-05-24'],
  ['OneWeb (Eutelsat)', 'OneWeb (Eutelsat)', 660, 636, 588, '2019-02-27'],
  ['Amazon Leo', 'Amazon Leo', 398, 355, 3232, '2023-10-06'],
  ['Guowang', '«Гован»', 261, 213, 12992 + 960, '2024-12-16'],
  ['Qianfan', '«Цяньфань»', 258, 178, 16000, '2024-08-06']
];
var MANEUVERS = {h2_2025:148696, h1_2026:207152, days:182};                       // Dec 2025–May 2026 = 182 days [24]

/* ============ CH2 — COVERAGE ============ */
function footprint(hKm, eDeg){ var e = eDeg*D2R; return Math.acos(RE*Math.cos(e)/(RE + hKm)) - e; }      // Earth-central angle, rad
function slantMax(hKm, eDeg){ var l = footprint(hKm, eDeg), r = RE + hKm; return Math.sqrt(RE*RE + r*r - 2*RE*r*Math.cos(l)); }
function capArea(hKm, eDeg){ return 2*Math.PI*RE*RE*(1 - Math.cos(footprint(hKm, eDeg))); }               // km²
function nHoneycomb(hKm, eDeg){ return 4*Math.PI*RE*RE/(capArea(hKm, eDeg)*3*Math.sqrt(3)/(2*Math.PI)); }
function streets(hKm, eDeg){
  var l = footprint(hKm, eDeg), best = null;
  for(var S = 3; S <= 600; S++){
    var q = Math.cos(l)/Math.cos(Math.PI/S); if(q >= 1) continue;
    var c = Math.acos(q), P = Math.max(1, Math.ceil(1 + (Math.PI - 2*c)/(l + c) - 1e-9)), N = P*S;
    if(!best || N < best.N) best = {N:N, P:P, S:S, c:c/D2R};
  }
  return best;
}
var cvH = document.getElementById('cvH'), cvE = document.getElementById('cvE'), cvKey = 'iri';
var REAL = {iri:[66, 'Iridium: 6 × 11 = 66 [2]', 'Iridium: 6 × 11 = 66 [2]'], ow:[636, 'OneWeb: 12 planes × 49 planned, 636 operational [10]', 'OneWeb: 12 плоскостей × 49 по плану, 636 рабочих [10]'], sl:[9726, 'Starlink: 9,726 operational in all shells [9]', 'Starlink: 9726 рабочих во всех оболочках [9]']};
function renderCov(){
  var h = +cvH.value, e = +cvE.value, l = footprint(h, e), st = streets(h, e), nh = nHoneycomb(h, e);
  document.getElementById('cvHVal').textContent = fmtInt(h) + T(' km',' км');
  document.getElementById('cvEVal').textContent = fmt(e, 1) + '°';
  cvH.setAttribute('aria-valuetext', fmtInt(h) + T(' km',' км'));
  cvE.setAttribute('aria-valuetext', fmt(e, 1) + T(' degrees',' градуса'));
  var svg = document.getElementById('cvSvg'); svg.innerHTML = '';
  /* cross-section, true scale (zoom follows the altitude so the cone always fills the panel) */
  var span = (RE + h) - RE*Math.cos(l), s = Math.min(0.06, 118/span), cx = 240, rp = (RE + h)*s, cy = 46 + rp, Rp = RE*s;
  var thMax = Math.min(80, l/D2R + 25);
  var d = ''; for(var th = -thMax; th <= thMax + 1e-9; th += thMax/40){ d += (d ? 'L' : 'M') + (cx + Rp*Math.sin(th*D2R)).toFixed(1) + ' ' + (cy - Rp*Math.cos(th*D2R)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.5}, svg);
  var ds = ''; for(var th2 = -thMax; th2 <= thMax + 1e-9; th2 += thMax/40){ ds += (ds ? 'L' : 'M') + (cx + rp*Math.sin(th2*D2R)).toFixed(1) + ' ' + (cy - rp*Math.cos(th2*D2R)).toFixed(1); }
  ns('path', {d:ds, fill:'none', stroke:'#9a9a92', 'stroke-dasharray':'3 4'}, svg);
  var fp = ''; for(var t3 = -l; t3 <= l + 1e-9; t3 += l/20){ fp += (fp ? 'L' : 'M') + (cx + Rp*Math.sin(t3)).toFixed(1) + ' ' + (cy - Rp*Math.cos(t3)).toFixed(1); }
  var sx = cx, sy = cy - rp, ex1 = cx - Rp*Math.sin(l), ey = cy - Rp*Math.cos(l), ex2 = cx + Rp*Math.sin(l);
  ns('path', {d:'M' + ex1.toFixed(1) + ' ' + ey.toFixed(1) + 'L' + sx + ' ' + sy.toFixed(1) + 'L' + ex2.toFixed(1) + ' ' + ey.toFixed(1), fill:'rgba(181,69,42,0.08)', stroke:'#b5452a'}, svg);
  ns('path', {d:fp, fill:'none', stroke:'#b5452a', 'stroke-width':5, opacity:0.85}, svg);
  ns('rect', {x:sx - 5, y:sy - 5, width:10, height:10, fill:'#0b0b0c'}, svg);
  /* local horizon at the footprint's edge, and the elevation angle above it */
  var hx = Math.cos(l), hy = Math.sin(l);
  ns('line', {x1:ex2 - 40*hx, y1:ey - 40*hy, x2:ex2 + 40*hx, y2:ey + 40*hy, stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, Math.min(470, ex2 + 10), ey - 6, 'ε = ' + fmt(e, 1) + '°', 'svg-small svg-halo');
  txt(svg, sx + 10, sy + 4, fmtInt(h) + T(' km',' км'), 'svg-small svg-halo');
  txt(svg, cx, Math.min(190, ey + 34), T('footprint ','пятно обзора ') + fmtInt(RE*l*2) + T(' km across',' км в поперечнике'), 'svg-small svg-halo', 'middle');
  txt(svg, 14, 16, T('cross-section, true scale','разрез, в истинном масштабе'), 'svg-small');
  /* satellite counts on a log axis */
  var L = 128, R = 466, y0 = 214;
  function X(n){ return L + (Math.log10(n) - 1)/(4.3 - 1)*(R - L); }
  ns('rect', {x:0, y:y0 - 12, width:480, height:150, fill:'#fff'}, svg);
  [10, 100, 1000, 10000].forEach(function(n){ ns('line', {x1:X(n), y1:y0, x2:X(n), y2:y0 + 92, stroke:'#e4e4de'}, svg); txt(svg, X(n), y0 + 106, num(n), 'svg-small', 'middle'); });
  [[nh, T('honeycomb bound','граница «сот»'), '#9a9a92'], [st.N, T('streets: ','«улицы»: ') + st.P + ' × ' + st.S, '#0b0b0c']].forEach(function(b, i){
    var y = y0 + 6 + i*24; ns('rect', {x:L, y:y, width:Math.max(1, X(Math.max(10, b[0])) - L), height:16, fill:b[2]}, svg);
    txt(svg, L - 6, y + 12, b[1], 'svg-small', 'end'); txt(svg, X(Math.max(10, b[0])) + 5, y + 12, num(Math.ceil(b[0])), 'svg-small');
  });
  [[66, 'Iridium'], [636, 'OneWeb'], [9726, 'Starlink']].forEach(function(m){ var x = X(m[0]); ns('line', {x1:x, y1:y0 + 56, x2:x, y2:y0 + 92, stroke:'#2f5aa1', 'stroke-width':2}, svg); txt(svg, m[0] > 5000 ? x - 5 : x + 5, m[0] === 636 ? y0 + 86 : y0 + 68, m[1] + ' ' + num(m[0]), 'svg-small svg-halo', m[0] > 5000 ? 'end' : 'start'); });
  txt(svg, L - 6, y0 + 78, T('real fleets','реальные'), 'svg-small', 'end');
  txt(svg, R, y0 + 124, T('satellites (log scale)','спутников (лог. шкала)'), 'svg-small', 'end');
  cells(document.getElementById('cvReadout'), [
    [T('FOOTPRINT RADIUS','РАДИУС ПЯТНА'), fmtInt(RE*l) + T(' km',' км') + ' (' + fmt(l/D2R, 1) + '°)'],
    [T('LONGEST SLANT RANGE','НАИБОЛЬШАЯ НАКЛОННАЯ ДАЛЬНОСТЬ'), fmtInt(slantMax(h, e)) + T(' km',' км')],
    [T('AREA SERVED','ПЛОЩАДЬ ОБЗОРА'), fmt(capArea(h, e)/1e6, 2) + T(' million km²',' млн км²')],
    [T('SHARE OF EARTH','ДОЛЯ ЗЕМЛИ'), fmt(100*(1 - Math.cos(l))/2, 2) + ' %'],
    [T('HONEYCOMB BOUND','ГРАНИЦА «СОТ»'), num(Math.ceil(nh))],
    [T('STREETS OF COVERAGE','«УЛИЦЫ ПОКРЫТИЯ»'), st.P + ' × ' + st.S + ' = ' + num(st.N)]
  ]);
  hud1.textContent = num(st.N);
  var r = REAL[cvKey];
  document.getElementById('cvStatus').innerHTML = r
    ? T(r[1], r[2]) + (cvKey === 'iri' ? T(' — the street formula reproduces it exactly.',' — формула «улиц» воспроизводит её точно.') : T(' — ',' — ') + fmt(r[0]/st.N, 0) + T(' times the coverage minimum: the rest is capacity.',' раз больше минимума для покрытия: остальное — пропускная способность.'))
    : T('Raise the altitude or lower the elevation mask and the footprint grows — fewer satellites, but longer paths and weaker signals.','Поднимите орбиту или опустите угол места — пятно растёт: спутников меньше, но пути длиннее, а сигнал слабее.');
}
[cvH, cvE].forEach(function(el){ el.addEventListener('input', function(){ cvKey = null; pressGroup(document.getElementById('cvPre'), null); renderCov(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#cvPre .btn'), function(btn){ btn.addEventListener('click', function(){ cvH.value = this.getAttribute('data-h'); cvE.value = this.getAttribute('data-e'); cvKey = this.getAttribute('data-k'); pressGroup(this.parentNode, this); renderCov(); }); });

/* ============ CH3 / CH5 — TABLES ============ */
function renderTables(){
  var sh = '<thead><tr><th>' + T('Shell group','Группа оболочек') + '</th><th>' + T('Altitude, km','Высота, км') + '</th><th>' + T('Inclination','Наклонение') + '</th><th>' + T('Operational','Рабочих') + '</th></tr></thead><tbody>';
  SHELLS.forEach(function(r){ sh += '<tr><td>' + T(r[0], r[1]) + '</td><td>' + r[2] + '</td><td>' + (lang === 'ru' ? r[3].replace(/\./g, ',') : r[3]) + '°</td><td>' + num(r[4]) + '</td></tr>'; });
  sh += '<tr class="tot"><td>' + T('Total','Всего') + '</td><td></td><td></td><td>' + num(SHELLS.reduce(function(a, r){ return a + r[4]; }, 0)) + '</td></tr></tbody>';
  document.getElementById('shellTable').innerHTML = sh;
  var ft = '<thead><tr><th>' + T('Constellation','Созвездие') + '</th><th>' + T('First launch','Первый запуск') + '</th><th>' + T('Launched','Запущено') + '</th><th>' + T('Operational','Рабочих') + '</th><th>' + T('Filed for','По заявкам') + '</th></tr></thead><tbody>';
  FLEET.forEach(function(r){ ft += '<tr><td>' + T(r[0], r[1]) + '</td><td>' + r[5].slice(0, 4) + '</td><td>' + num(r[2]) + '</td><td>' + num(r[3]) + '</td><td>' + num(r[4]) + '</td></tr>'; });
  document.getElementById('fleetTable').innerHTML = ft + '</tbody>';
}

/* ============ CH4 — LATENCY ============ */
var CITIES = {LON:[51.51, -0.13], NYC:[40.71, -74.01], FRA:[50.11, 8.68], SIN:[1.35, 103.82], LAX:[34.05, -118.24], SYD:[-33.87, 151.21], TYO:[35.68, 139.69], SAO:[-23.55, -46.63], PAR:[48.86, 2.35]};
var PAIRS = [['LON','NYC'], ['FRA','SIN'], ['LAX','SYD'], ['TYO','SAO'], ['LON','PAR']];
function unit(lat, lon){ lat *= D2R; lon *= D2R; return [Math.cos(lat)*Math.cos(lon), Math.cos(lat)*Math.sin(lon), Math.sin(lat)]; }
function dot(a, b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function scl(a, k){ return [a[0]*k, a[1]*k, a[2]*k]; }
function len(a){ return Math.sqrt(dot(a, a)); }
function centralAngle(p, q){ var a = unit(p[0], p[1]), b = unit(q[0], q[1]); return Math.atan2(len([a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]), dot(a, b)); }
function gcKm(p, q){ return RM*centralAngle(p, q); }
function slerp(a, b, f){ var w = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))), s = Math.sin(w); if(s < 1e-9) return a; var k1 = Math.sin((1 - f)*w)/s, k2 = Math.sin(f*w)/s; return [a[0]*k1 + b[0]*k2, a[1]*k1 + b[1]*k2, a[2]*k1 + b[2]*k2]; }
/* GEO slant range and elevation from a ground unit vector g to a satellite at longitude L (rad) */
function geoLook(g, L){ var sat = [A_GEO*Math.cos(L), A_GEO*Math.sin(L), 0], p = scl(g, RM), d = sub(sat, p), rho = len(d); return {rho:rho, el:Math.asin(dot(d, g)/rho)/D2R}; }
function geoPath(p, q){
  var a = unit(p[0], p[1]), b = unit(q[0], q[1]);
  for(var n = 1; n <= 4; n++){
    var tot = 0, ok = true;
    for(var k = 0; k < n; k++){
      var g1 = slerp(a, b, k/n), g2 = slerp(a, b, (k + 1)/n), m = [g1[0] + g2[0], g1[1] + g2[1], 0], L = Math.atan2(m[1], m[0]);
      var l1 = geoLook(g1, L), l2 = geoLook(g2, L); if(l1.el < 0 || l2.el < 0){ ok = false; break; } tot += l1.rho + l2.rho;
    }
    if(ok) return {km:tot, hops:n};
  }
  return {km:NaN, hops:0};
}
function latency(p, q, hKm, k){
  var d = gcKm(p, q), g = geoPath(p, q);
  var fibre = N_FIBRE*k*d/C_KMS*1000;
  var bent = 2*hKm/C_KMS*1000 + fibre;
  var laser = (2*hKm + (RM + hKm)*d/RM)/C_KMS*1000;
  return {d:d, fibre:2*fibre, bent:2*bent, laser:2*laser, geo:2*g.km/C_KMS*1000, hops:g.hops};      // round trips, ms
}
function crossover(hKm){ return 2*hKm/(N_FIBRE - (RM + hKm)/RM); }                  // km, ideal fibre = ideal laser
var ltH = document.getElementById('ltH'), ltK = document.getElementById('ltK'), ltP = 0;
var CITY_NAMES = {LON:['London','Лондон'], NYC:['New York','Нью-Йорк'], FRA:['Frankfurt','Франкфурт'], SIN:['Singapore','Сингапур'], LAX:['Los Angeles','Лос-Анджелес'], SYD:['Sydney','Сидней'], TYO:['Tokyo','Токио'], SAO:['São Paulo','Сан-Паулу'], PAR:['Paris','Париж']};
function msStr(ms){ return ms >= 100 ? fmtInt(ms) + T(' ms',' мс') : fmt(ms, 1) + T(' ms',' мс'); }
function renderLat(){
  var h = +ltH.value, k = +ltK.value, pr = PAIRS[ltP], p = CITIES[pr[0]], q = CITIES[pr[1]], Lr = latency(p, q, h, k);
  document.getElementById('ltHVal').textContent = fmtInt(h) + T(' km',' км');
  document.getElementById('ltKVal').textContent = '× ' + fmt(k, 2);
  ltH.setAttribute('aria-valuetext', fmtInt(h) + T(' km',' км'));
  ltK.setAttribute('aria-valuetext', T('cable ',' кабель ') + fmt(k, 2) + T(' times the great circle',' дуги большого круга'));
  var svg = document.getElementById('ltSvg'); svg.innerHTML = '';
  var L = 120, R = 430, y0 = 52;
  function X(ms){ return L + (Math.log10(Math.max(1, ms)))/Math.log10(2000)*(R - L); }
  [1, 10, 100, 1000].forEach(function(m){ ns('line', {x1:X(m), y1:y0 - 6, x2:X(m), y2:y0 + 222, stroke:'#e4e4de'}, svg); txt(svg, X(m), y0 + 238, num(m) + T(' ms',' мс'), 'svg-small', 'middle'); });
  txt(svg, 14, 20, T(CITY_NAMES[pr[0]][0], CITY_NAMES[pr[0]][1]) + ' – ' + T(CITY_NAMES[pr[1]][0], CITY_NAMES[pr[1]][1]) + ': ' + fmtInt(Lr.d) + T(' km',' км'), 'svg-small'); txt(svg, 14, 34, T('round trip, log scale','туда и обратно, лог. шкала'), 'svg-small');
  var rows = [
    [T('fibre','волокно') + (k > 1.001 ? ' × ' + fmt(k, 2) : ''), Lr.fibre, '#0b0b0c'],
    [T('LEO + fibre','НОО + волокно'), Lr.bent, '#5f5f59'],
    [T('LEO laser','НОО, лазер'), Lr.laser, '#b5452a'],
    [T('GEO','ГСО') + (Lr.hops > 1 ? T(', ',', ') + Lr.hops + T(' hops',' скачка') : ''), Lr.geo, '#2f5aa1']
  ];
  var best = Math.min(Lr.fibre, Lr.laser);
  rows.forEach(function(r, i){ var y = y0 + 8 + i*54; ns('rect', {x:L, y:y, width:Math.max(1, X(r[1]) - L), height:26, fill:r[2], opacity: r[1] === best ? 1 : 0.8}, svg); txt(svg, L - 8, y + 17, r[0], 'svg-small', 'end'); txt(svg, Math.min(X(r[1]) + 6, R - 2), y + 17, msStr(r[1]), 'svg-small svg-halo', X(r[1]) + 60 > R + 30 ? 'end' : 'start'); });
  cells(document.getElementById('ltReadout'), [
    [T('GREAT-CIRCLE DISTANCE','ПО ДУГЕ БОЛЬШОГО КРУГА'), fmtInt(Lr.d) + T(' km',' км')],
    [T('FIBRE ROUND TRIP','ОПТОВОЛОКНО, ТУДА-ОБРАТНО'), msStr(Lr.fibre)],
    [T('LEO LASER ROUND TRIP','НОО, ЛАЗЕР, ТУДА-ОБРАТНО'), msStr(Lr.laser)],
    [T('GEO ROUND TRIP','ГСО, ТУДА-ОБРАТНО'), msStr(Lr.geo)],
    [T('LASER BEATS STRAIGHT FIBRE BEYOND','ЛАЗЕР ОБГОНЯЕТ ПРЯМОЕ ВОЛОКНО ДАЛЬШЕ'), fmtInt(crossover(h)) + T(' km',' км'), true]
  ]);
  hud2.textContent = msStr(Lr.laser);
  document.getElementById('ltStatus').innerHTML = Lr.laser < Lr.fibre
    ? T('Through vacuum the laser path wins by ','В вакууме лазерный путь выигрывает ') + msStr(Lr.fibre - Lr.laser) + T(' even though it climbs ',', хотя поднимается на ') + fmtInt(h) + T(' km and comes back down.',' км и спускается обратно.')
    : T('Too short a route: the climb to orbit and back costs more than the slower glass. Over short distances fibre wins.','Слишком короткий маршрут: подъём на орбиту и обратно обходится дороже, чем более медленное стекло. На коротких расстояниях выигрывает волокно.');
}
[ltH, ltK].forEach(function(el){ el.addEventListener('input', renderLat); });
Array.prototype.forEach.call(document.querySelectorAll('#ltPair .btn'), function(btn){ btn.addEventListener('click', function(){ ltP = +this.getAttribute('data-p'); pressGroup(this.parentNode, this); renderLat(); }); });

/* ============ CH6 — SKY, SHADOW AND STREAKS ============ */
var RUBIN_LAT = -30.24, OBLIQ = 23.44;                                           // [20]; solstice declination
function midnightDepression(latDeg, decDeg){ return 90 - Math.abs(latDeg + decDeg); }   // Sun's depth at lower culmination
function shadowHeightZenith(dDeg){ return RM*(1/Math.cos(dDeg*D2R) - 1); }
/* observer at (0,0,RM); x axis toward the Sun's azimuth; returns the point on the shell along (E, A) */
function shellPoint(hKm, eDeg, aDeg){
  var E = eDeg*D2R, A = aDeg*D2R, r = RM + hKm, se = Math.sin(E);
  var rho = -RM*se + Math.sqrt(RM*RM*se*se + 2*RM*hKm + hKm*hKm);
  var u = [Math.cos(E)*Math.cos(A), Math.cos(E)*Math.sin(A), se], P = [rho*u[0], rho*u[1], RM + rho*u[2]];
  return {rho:rho, P:P, cz:dot(P, u)/r};
}
function sunlit(P, dDeg){ var s = [Math.cos(dDeg*D2R), 0, -Math.sin(dDeg*D2R)], k = dot(P, s); return k > 0 || len(sub(P, scl(s, k))) > RM; }
function skyCounts(N, hKm, dDeg){
  var r = RM + hKm, sig = N/(4*Math.PI*r*r), dE = 0.5, dA = 2, all = 0, a30 = 0, lit30 = 0, litAll = 0;
  for(var e = dE/2; e < 90; e += dE){ for(var a = dA/2; a < 360; a += dA){
    var sp = shellPoint(hKm, e, a), n = sig*sp.rho*sp.rho*Math.cos(e*D2R)*dE*dA*D2R*D2R/sp.cz, lit = sunlit(sp.P, dDeg);
    all += n; if(lit) litAll += n; if(e >= 30){ a30 += n; if(lit) lit30 += n; }
  } }
  return {all:all, a30:a30, lit30:lit30, litAll:litAll};
}
function perSqDeg(N, hKm, eDeg){ var r = RM + hKm, sp = shellPoint(hKm, eDeg, 0); return N/(4*Math.PI*r*r)*Math.pow(sp.rho*D2R, 2)/sp.cz; }
function streaks(N, hKm, eDeg, aDeg, fovDeg, tSec, dDeg){
  var r = RM + hKm, sig = N/(4*Math.PI*r*r), sp = shellPoint(hKm, eDeg, aDeg), th = fovDeg*D2R, v = vCirc(r);
  var a1 = th*sp.rho/2, a2 = a1/sp.cz, A = Math.PI*a1*a2;
  var per = Math.PI*(3*(a1 + a2) - Math.sqrt((3*a1 + a2)*(a1 + 3*a2)));            // Ramanujan
  var lit = sunlit(sp.P, dDeg), n = sig*(A + v*tSec*per/Math.PI);
  return {n: lit ? n : 0, nIfLit:n, lit:lit, rho:sp.rho, cross: th/(v/sp.rho), v:v};
}
/* fixed-seed satellite positions, uniform over the sphere (unit vectors) */
var SKY_DOTS = (function(){ var s = 20261022, out = []; function rnd(){ s = (s*1664525 + 1013904223) % 4294967296; return s/4294967296; }
  for(var i = 0; i < 5000; i++){ var z = 2*rnd() - 1, ph = 2*Math.PI*rnd(), q = Math.sqrt(1 - z*z); out.push([q*Math.cos(ph), q*Math.sin(ph), z]); } return out; })();
var skD = document.getElementById('skD'), skN = document.getElementById('skN'), skH = document.getElementById('skH'), skE = document.getElementById('skE'), skA = document.getElementById('skA'), skT = document.getElementById('skT'), skF = 3.5;
function renderSky(){
  var dd = +skD.value, N = Math.round(Math.pow(10, +skN.value)), h = +skH.value, E = +skE.value, A = +skA.value, t = +skT.value;
  var sc = skyCounts(N, h, dd), st = streaks(N, h, E, A, skF, t, dd), zs = shadowHeightZenith(dd);
  document.getElementById('skDVal').textContent = fmt(dd, 1) + '°';
  document.getElementById('skNVal').textContent = num(N);
  document.getElementById('skHVal').textContent = fmtInt(h) + T(' km',' км');
  document.getElementById('skEVal').textContent = E + '°';
  document.getElementById('skAVal').textContent = A + '°';
  document.getElementById('skTVal').textContent = t + T(' s',' с');
  skD.setAttribute('aria-valuetext', T('Sun ',' Солнце на ') + fmt(dd, 1) + T(' degrees below the horizon',' градуса под горизонтом'));
  skN.setAttribute('aria-valuetext', num(N) + T(' satellites',' спутников'));
  skH.setAttribute('aria-valuetext', fmtInt(h) + T(' km',' км'));
  skE.setAttribute('aria-valuetext', E + T(' degrees above the horizon',' градусов над горизонтом'));
  skA.setAttribute('aria-valuetext', A + T(' degrees from the Sun’s direction',' градусов от направления на Солнце'));
  skT.setAttribute('aria-valuetext', t + T(' seconds',' секунд'));
  var svg = document.getElementById('skSvg'); svg.innerHTML = '';
  var cx = 240, cy = 206, Rs = 168;
  function XY(e, a){ var rr = (90 - e)/90*Rs; return [cx + rr*Math.sin(a*D2R), cy - rr*Math.cos(a*D2R)]; }
  /* lit / shadow cells */
  for(var e = 0; e < 90; e += 6){ for(var a = 0; a < 360; a += 10){
    var sp = shellPoint(h, e + 3, a + 5), lit = sunlit(sp.P, dd);
    var p1 = XY(e, a), p2 = XY(e, a + 10), p3 = XY(e + 6, a + 10), p4 = XY(e + 6, a);
    ns('path', {d:'M' + p1.join(' ') + 'L' + p2.join(' ') + 'L' + p3.join(' ') + 'L' + p4.join(' ') + 'Z', fill: lit ? '#f3dfb3' : '#dfe3ea', stroke: lit ? '#f3dfb3' : '#dfe3ea', 'stroke-width':0.6}, svg);
  } }
  [30, 60].forEach(function(e2){ ns('circle', {cx:cx, cy:cy, r:(90 - e2)/90*Rs, fill:'none', stroke:'#9a9a92', 'stroke-dasharray':'2 3'}, svg); txt(svg, cx + 3, cy - (90 - e2)/90*Rs - 3, e2 + '°', 'svg-small svg-halo'); });
  ns('circle', {cx:cx, cy:cy, r:Rs, fill:'none', stroke:'#0b0b0c'}, svg);
  /* satellites: fixed-seed sample, one dot per k satellites */
  var r = RM + h, k = Math.max(1, N/5000), nd = Math.min(5000, N), O = [0, 0, RM];
  for(var i = 0; i < nd; i++){ var u = SKY_DOTS[i], P = scl(u, r), dv = sub(P, O), dl = len(dv), sinE = dv[2]/dl; if(sinE <= 0) continue;
    var el = Math.asin(sinE)/D2R, az = Math.atan2(dv[1], dv[0])/D2R, xy = XY(el, az), lt = sunlit(P, dd);
    ns('circle', lt ? {cx:xy[0].toFixed(1), cy:xy[1].toFixed(1), r:2.2, fill:'#0b0b0c'} : {cx:xy[0].toFixed(1), cy:xy[1].toFixed(1), r:1.6, fill:'none', stroke:'#8a8f99', 'stroke-width':0.8}, svg); }
  /* telescope field */
  var fp = XY(E, A); ns('circle', {cx:fp[0], cy:fp[1], r:Math.max(4, skF/2/90*Rs), fill:'none', stroke:'#b5452a', 'stroke-width':2.5}, svg);
  txt(svg, cx, cy - Rs - 8, T('toward the Sun (below the horizon)','в сторону Солнца (под горизонтом)'), 'svg-small', 'middle');
  txt(svg, 8, 382, T('yellow: sunlit at this altitude · grey: Earth’s shadow','жёлтое: освещено на этой высоте · серое: тень Земли'), 'svg-small');
  txt(svg, 8, 396, T('● lit satellite   ○ satellite in shadow','● освещённый спутник   ○ спутник в тени') + (k > 1.001 ? T(' · 1 dot = ',' · 1 точка = ') + fmt(k, 1) : ''), 'svg-small');
  cells(document.getElementById('skReadout'), [
    [T('ABOVE THE HORIZON','НАД ГОРИЗОНТОМ'), num(Math.round(sc.all))],
    [T('ABOVE 30°','ВЫШЕ 30°'), num(Math.round(sc.a30))],
    [T('SUNLIT, ABOVE 30°','ОСВЕЩЕНО, ВЫШЕ 30°'), num(Math.round(sc.lit30))],
    [T('SHADOW HEIGHT AT ZENITH','ВЫСОТА ТЕНИ В ЗЕНИТЕ'), dd >= 89.9 ? '∞' : fmtInt(zs) + T(' km',' км')],
    [T('STREAKS PER EXPOSURE','ТРЕКОВ ЗА ЭКСПОЗИЦИЮ'), fmt(st.n, st.n < 10 ? 2 : 0)],
    [T('TIME TO CROSS THE FIELD','ВРЕМЯ ПЕРЕСЕЧЕНИЯ ПОЛЯ'), '≈ ' + fmt(st.cross, 1) + T(' s',' с')]
  ]);
  document.getElementById('skStatus').innerHTML = !st.lit
    ? T('The field looks into Earth’s shadow at this altitude: satellites cross it unseen. Without the Sun they would streak ',' Поле смотрит в земную тень на этой высоте: спутники пересекают его невидимыми. Будь они освещены, треков было бы ') + fmt(st.nIfLit, 2) + T(' times per exposure.',' за экспозицию.')
    : st.n >= 1
      ? T('About ','Около ') + fmt(st.n, st.n < 10 ? 1 : 0) + T(' streaks cross every exposure; the field is sunlit at ',' треков на каждой экспозиции; поле освещено на высоте ') + fmtInt(h) + T(' km.',' км.')
      : T('About one exposure in ','Примерно на одной экспозиции из ') + fmtInt(1/st.n) + T(' catches a streak; the field is sunlit at ',' есть трек; поле освещено на высоте ') + fmtInt(h) + T(' km.',' км.');
}
[skD, skN, skH, skE, skA, skT].forEach(function(el){ el.addEventListener('input', function(){ if(el === skD) pressGroup(document.getElementById('skSun'), null); renderSky(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#skSun .btn'), function(btn){ btn.addEventListener('click', function(){ var v = this.getAttribute('data-d'); skD.value = v === 'dec' ? midnightDepression(RUBIN_LAT, -OBLIQ) : v === 'jun' ? midnightDepression(RUBIN_LAT, OBLIQ) : +v; pressGroup(this.parentNode, this); renderSky(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#skFov .btn'), function(btn){ btn.addEventListener('click', function(){ skF = +this.getAttribute('data-f'); pressGroup(this.parentNode, this); renderSky(); }); });

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1997', '<b>5 May:</b> the first five Iridium satellites launched on a Delta II; 66 are up within a year [7][1].', '<b>5 мая:</b> на Delta II запущены первые пять спутников Iridium; через год на орбите 66 [7][1].'],
  ['1998', '<b>14 February:</b> the first four Globalstar satellites launched [7].', '<b>14 февраля:</b> запущены первые четыре спутника Globalstar [7].'],
  ['1999', '<b>August:</b> Iridium bankrupt after about $5 billion spent [1].', '<b>Август:</b> Iridium обанкротился, потратив около 5 млрд долларов [1].'],
  ['2002', '<b>15 February:</b> Globalstar files for bankruptcy [5]. <b>October:</b> Teledesic suspends work on its constellation [6].', '<b>15 февраля:</b> банкротство Globalstar [5]. <b>Октябрь:</b> Teledesic останавливает работу над созвездием [6].'],
  ['2017–19', 'Iridium NEXT replaces the first generation in eight launches, January 2017 to January 2019; the flares fade [2][3].', 'Iridium NEXT заменяет первое поколение за восемь запусков, с января 2017 по январь 2019 года; вспышки уходят в прошлое [2][3].'],
  ['2019', '<b>27 February:</b> first OneWeb satellites [7]. <b>24 May:</b> the first 60 Starlinks on one Falcon 9 [7].', '<b>27 февраля:</b> первые спутники OneWeb [7]. <b>24 мая:</b> первые 60 спутников Starlink на одном Falcon 9 [7].'],
  ['2020', '<b>March:</b> OneWeb bankrupt; rescued by the UK government and Bharti Global [15]. McDowell models Starlink’s effect on astronomy [18].', '<b>Март:</b> банкротство OneWeb; её спасают правительство Великобритании и Bharti Global [15]. Макдауэлл моделирует влияние Starlink на астрономию [18].'],
  ['2021', '<b>23 April:</b> the FCC lets Starlink move lower and serve terminals down to 25° [8].', '<b>23 апреля:</b> FCC разрешает Starlink опуститься ниже и работать с терминалами начиная с 25° [8].'],
  ['2022', '<b>3 February:</b> 49 Starlinks released at a 210 km perigee into a geomagnetic storm; 38 re-enter [25][12][9].', '<b>3 февраля:</b> 49 спутников Starlink выпущены с перигеем 210 км в геомагнитную бурю; 38 входят в атмосферу [25][12][9].'],
  ['2023', 'OneWeb merges with Eutelsat [16]. <b>6 October:</b> Amazon’s two prototypes launched [7]. LOFAR detects radio leakage from Starlinks [22].', 'OneWeb объединяется с Eutelsat [16]. <b>6 октября:</b> запуск двух прототипов Amazon [7]. LOFAR обнаруживает радиоутечку спутников Starlink [22].'],
  ['2024', '<b>January:</b> over 9,000 Starlink lasers carry 42 PB a day [11]. <b>6 August:</b> first 18 Qianfan satellites [7]. <b>16 December:</b> first Guowang batch [7].', '<b>Январь:</b> более 9000 лазеров Starlink передают 42 ПБ в сутки [11]. <b>6 августа:</b> первые 18 спутников «Цяньфаня» [7]. <b>16 декабря:</b> первая партия «Гована» [7].'],
  ['2025', '<b>28 April:</b> first 27 production Kuiper satellites [7]. <b>13 November:</b> Kuiper becomes Amazon Leo [17].', '<b>28 апреля:</b> первые 27 серийных спутников Kuiper [7]. <b>13 ноября:</b> Kuiper становится Amazon Leo [17].'],
  ['2026', '<b>December 2025 – May 2026:</b> 207,152 Starlink avoidance manoeuvres [24]. <b>15 October:</b> 13,015 Starlinks launched, 11,154 in orbit [9].', '<b>Декабрь 2025 – май 2026:</b> 207 152 манёвра уклонения Starlink [24]. <b>15 октября:</b> запущено 13 015 спутников Starlink, на орбите 11 154 [9].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'Air & Space / Smithsonian, “The Rise and Fall and Rise of Iridium”', url:'https://www.smithsonianmag.com/air-space-magazine/the-rise-and-fall-and-rise-of-iridium-5615034/', note:{en:'Launches began May 1997, 66 satellites plus spares within a year; $5 billion; $3,000 phone, $6–30 a minute; bankrupt by August 1999; bought for $25 million plus investment; “a triumph of engineering over common sense” (on Iridium and Globalstar).', ru:'Запуски с мая 1997 года, 66 спутников плюс резерв за год; 5 млрд долларов; телефон за 3000 долларов, 6–30 долларов в минуту; банкротство к августу 1999 года; выкуп за 25 млн долларов плюс вложения; «триумф инженерии над здравым смыслом» (об Iridium и Globalstar).'}},
  {title:'ESA eoPortal, “Iridium NEXT”', url:'https://www.eoportal.org/satellite-missions/iridium-next', note:{en:'66 operational satellites in 6 polar planes of 11, 780 km, 86.4°, 101 min; launched in eight stages, January 2017 to January 2019.', ru:'66 рабочих спутников в 6 полярных плоскостях по 11, 780 км, 86,4°, 101 мин; запущены в восемь этапов, с января 2017 по январь 2019 года.'}},
  {title:'A. Fazekas, “Amazing Sky Bursts Are About to End” — National Geographic, 25 January 2017', url:'https://www.nationalgeographic.com/science/article/skywatching-iridium-flares-spacex-satellites-space-science', note:{en:'Iridium flares: sunlight glinting off three large silver-coated antennas; can outshine the ISS and Venus; the new satellites are far less reflective.', ru:'Вспышки «Иридиумов»: блики солнца на трёх больших посеребрённых антеннах; ярче МКС и Венеры; новые спутники отражают гораздо слабее.'}},
  {title:'FCC Public Notice, Report No. SAT-00115, 1 August 2002', url:'https://docs.fcc.gov/public/attachments/DOC-224926A1.pdf', note:{en:'Globalstar modification: 48 in-service satellites in eight planes, 52°, orbital height 1,414 km.', ru:'Изменение Globalstar: 48 рабочих спутников в восьми плоскостях, 52°, высота орбиты 1414 км.'}},
  {title:'Globalstar, L.P., Form 8-K, US Securities and Exchange Commission, filed 19 February 2002', url:'https://www.sec.gov/Archives/edgar/data/1037927/000095012302001711/y57723e8-k.txt', note:{en:'“On February 15, 2002 … Globalstar, L.P. … and certain of its direct subsidiaries filed voluntary petitions under Chapter 11” in the US Bankruptcy Court for the District of Delaware.', ru:'«15 февраля 2002 года … Globalstar, L.P. … и ряд её дочерних компаний подали добровольные заявления по главе 11» в Суд по делам о банкротстве округа Делавэр (США).'}},
  {title:'S. P. Chan, “The birth and demise of an idea: Teledesic’s ‘Internet in the sky’” — Seattle Times, 7 October 2002', url:'https://archive.seattletimes.com/archive/20021007/teledesic070/the-birth-and-demise-of-an-idea-teledesics-internet-in-the-sky', note:{en:'840 satellites, $9 billion; McCaw and Gates each invested $5 million in 1994; design shrank to 300 (1997) and later 30; satellite contract suspended, October 2002.', ru:'840 спутников, 9 млрд долларов; Маккоу и Гейтс вложили по 5 млн долларов в 1994 году; проект сокращён до 300 (1997) и затем до 30; контракт на спутники приостановлен в октябре 2002 года.'}},
  {title:'J. McDowell, GCAT — General Catalog of Artificial Space Objects, launch list', url:'https://planet4589.org/space/gcat/', note:{en:'Launch dates (UTC): Iridium MS-1A 1997-05-05; Globalstar D-1 1998-02-14; OneWeb F6 2019-02-27; Starlink V0.9 2019-05-24; Starlink Group 4-7 2022-02-03; KuiperSat-1/2 2023-10-06; Qianfan 01 2024-08-06; first Guowang low-orbit batch 2024-12-16; Kuiper KA-01 2025-04-28. Launch list updated 17 October 2026.', ru:'Даты запусков (UTC): Iridium MS-1A 1997-05-05; Globalstar D-1 1998-02-14; OneWeb F6 2019-02-27; Starlink V0.9 2019-05-24; Starlink Group 4-7 2022-02-03; KuiperSat-1/2 2023-10-06; «Цяньфань» 01 2024-08-06; первая низкоорбитальная партия «Гована» 2024-12-16; Kuiper KA-01 2025-04-28. Список обновлён 17 октября 2026 года.'}},
  {title:'FCC 21-48, Order and Authorization on SpaceX’s third modification (adopted 23 April 2021)', url:'https://docs.fcc.gov/public/attachments/FCC-21-48A1.pdf', note:{en:'Earth-station elevation angles as low as 25° for user terminals and gateways; 1,584 satellites at 550 km, 53°, 72 planes × 22, plus 540 km/53.2°, 570 km/70°, 560 km/97.6° shells; OneWeb terminals operate down to 40° (as stated in the order).', ru:'Углы места земных станций от 25° для терминалов и шлюзов; 1584 спутника на 550 км, 53°, 72 плоскости × 22, плюс оболочки 540 км/53,2°, 570 км/70°, 560 км/97,6°; терминалы OneWeb работают от 40° (по тексту решения).'}},
  {title:'J. McDowell, “Starlink Statistics” — Jonathan’s Space Report', url:'https://planet4589.org/space/con/star/stats.html', note:{en:'Updated 15 October 2026: 13,015 launched, 1,861 down (1,508 disposal complete), 11,154 in orbit, 9,726 in operational orbit; Group 4-7: 49 launched, 38 early deorbit.', ru:'Обновлено 15 октября 2026 года: запущено 13 015, сошли с орбиты 1861 (1508 — завершённая утилизация), на орбите 11 154, на рабочей орбите 9726; Group 4-7: запущено 49, 38 — ранний сход.'}},
  {title:'J. McDowell, “Enormous (‘Mega’) Satellite Constellations — Constellation List”', url:'https://planet4589.org/space/con/conlist.html', note:{en:'Updated 15 October 2026. Shell altitudes, inclinations and satellites on station; OneWeb 87.9°, ~1,180–1,220 km, 588 planned, 660 up, 636 operational; Kuiper KP1 3,232 planned, 398 up, 355 operational; Xingwang (Guowang) 960 + 12,992 planned, 261 up, 213 operational; Qianfan 16,000 planned, 258 up, 178 operational.', ru:'Обновлено 15 октября 2026 года. Высоты и наклонения оболочек, спутники на позициях; OneWeb 87,9°, ~1180–1220 км, план 588, запущено 660, рабочих 636; Kuiper KP1 план 3232, запущено 398, рабочих 355; Xingwang («Гован») план 960 + 12 992, запущено 261, рабочих 213; «Цяньфань» план 16 000, запущено 258, рабочих 178.'}},
  {title:'M. Posch, “Starlink’s Inter-Satellite Laser Links Are Setting New Record With 42 Million GB Per Day” — Hackaday, 5 February 2024', url:'https://hackaday.com/2024/02/05/starlinks-inter-satellite-laser-links-are-setting-new-record-with-42-million-gb-per-day/', note:{en:'Report of T. Brashears (SpaceX), SPIE Photonics West, 30 January 2024: over 9,000 lasers, over 42 PB a day, 100 Gbps links, maximum link distance 5,400 km; first enabled with v1.5 satellites.', ru:'Доклад Т. Брашерса (SpaceX), SPIE Photonics West, 30 января 2024 года: более 9000 лазеров, свыше 42 ПБ в сутки, каналы 100 Гбит/с, наибольшая дальность связи 5400 км; впервые на спутниках v1.5.'}},
  {title:'R. Kataoka et al., “Unexpected space weather causing the reentry of 38 Starlink satellites in February 2022” — J. Space Weather Space Clim. 12 (2022)', url:'https://doi.org/10.1051/swsc/2022034', note:{en:'Moderate magnetic storms; “up to 50%” enhancement of air drag at ~200 km; NRLMSIS2.0 predicted under 25%.', ru:'Умеренные магнитные бури; рост сопротивления воздуха «до 50 %» на высоте ~200 км; модель NRLMSIS2.0 предсказывала менее 25 %.'}},
  {title:'iTWire, “Starlink claims dramatic improvement in network performance” (2025)', url:'https://itwire.com/business-it-news/business-technology/starlink-claims-dramatic-improvement-in-network-performance', note:{en:'Quoting Starlink: as of June 2025, median peak-hour latency 25.7 ms across all US customers; fewer than 1 % of measurements above 55 ms.', ru:'Цитата Starlink: на июнь 2025 года медианная задержка в часы пик 25,7 мс для всех абонентов в США; менее 1 % измерений выше 55 мс.'}},
  {title:'M. Handley, “Delay is Not an Option: Low Latency Routing in Space” — ACM HotNets 2018', url:'https://discovery.ucl.ac.uk/id/eprint/10062262/', note:{en:'Simulation of SpaceX’s initial phase as then filed — 1,600 satellites at 1,150 km, 53° — giving lower latency than any possible terrestrial fibre network beyond about 3,000 km; c in vacuum is “≈ 47% higher” than in glass (index ≈ 1.47).', ru:'Моделирование начальной фазы SpaceX по тогдашним заявкам — 1600 спутников на 1150 км, 53°: меньшая задержка, чем у любой возможной наземной оптоволоконной сети, на расстояниях более 3000 км; скорость света в вакууме «примерно на 47 % выше», чем в стекле (показатель преломления ≈ 1,47).'}},
  {title:'E. Howell, “OneWeb eyes merger with Eutelsat amid SpaceX Starlink expansion” — Space.com, 27 July 2022', url:'https://www.space.com/oneweb-merger-eutelsat-spacex-starlink', note:{en:'Chapter 11 in March 2020; re-emerged owned by the British government and Bharti Global.', ru:'Банкротство в марте 2020 года; вернулась под контролем правительства Великобритании и Bharti Global.'}},
  {title:'Eutelsat, “Our History”', url:'https://www.eutelsat.com/en/group/our-history.html', note:{en:'2023: Eutelsat and OneWeb merge.', ru:'2023: Eutelsat и OneWeb объединяются.'}},
  {title:'Amazon, “What is Amazon Leo?” (FAQ)', url:'https://www.aboutamazon.com/news/innovation-at-amazon/what-is-amazon-project-kuiper', note:{en:'Project Kuiper retired as a name on 13 November 2025 and renamed Amazon Leo.', ru:'Название Project Kuiper упразднено 13 ноября 2025 года, сеть переименована в Amazon Leo.'}},
  {title:'J. McDowell, “The Low Earth Orbit Satellite Population and Impacts of the SpaceX Starlink Constellation” — ApJL 892, L36 (2020)', url:'https://doi.org/10.3847/2041-8213/ab8016', note:{en:'~12,000 Starlinks: 0.005–0.01 objects per square degree at airmass < 2; hundreds visible near twilight at latitudes 45°–55°.', ru:'~12 000 Starlink: 0,005–0,01 объекта на квадратный градус при воздушной массе < 2; в сумерки на широтах 45°–55° видны сотни.'}},
  {title:'J. A. Tyson et al., “Mitigation of LEO Satellite Brightness and Trail Effects on the Rubin Observatory LSST” — AJ 160, 226 (2020)', url:'https://doi.org/10.3847/1538-3881/abba3e', note:{en:'Starlink v0.9 g ≈ 4.5 mag, DarkSat ≈ 6.1, darkening plans ≈ 7; 48,000 satellites of mag 4.5 → about 1 % of pixels masked in nautical-twilight images.', ru:'Starlink v0.9 g ≈ 4,5ᵐ, DarkSat ≈ 6,1ᵐ, планы затемнения ≈ 7ᵐ; 48 000 спутников 4,5ᵐ → около 1 % пикселей маскируется на снимках в навигационные сумерки.'}},
  {title:'Vera C. Rubin Observatory, “Key Numbers”', url:'https://rubinobservatory.org/for-scientists/rubin-101/key-numbers', note:{en:'8.4 m primary mirror; 9.6 deg² field of view; standard visit exposure 30 s; site latitude −30:14:40.68 (−30.24°), longitude −70:44:57.90.', ru:'Главное зеркало 8,4 м; поле зрения 9,6 кв. градуса; стандартная экспозиция 30 с; широта −30:14:40,68 (−30,24°), долгота −70:44:57,90.'}},
  {title:'S. R. Pratt, R. A. Raines, C. E. Fossa Jr. & M. A. Temple, “An Operational and Performance Overview of the IRIDIUM Low Earth Orbit Satellite System” — IEEE Communications Surveys 2 (2), 1999', url:'https://kt.agh.edu.pl/~kulakowski/satelity/Iridium-Leo.pdf', note:{en:'“The minimum elevation angle for an earth station is 8.2 degrees”; co-rotating planes 31.6° apart, counter-rotating planes 22° apart.', ru:'«Минимальный угол места для земной станции — 8,2 градуса»; плоскости, движущиеся в одну сторону, разнесены на 31,6°, встречные — на 22°.'}},
  {title:'F. Di Vruno et al., “Unintended electromagnetic radiation from Starlink satellites detected with LOFAR between 110 and 188 MHz” — A&A 676, A75 (2023)', url:'https://doi.org/10.1051/0004-6361/202346374', note:{en:'47 of 68 Starlink satellites observed show intrinsic radiation at 110–188 MHz, far below the 10.7–12.7 GHz downlinks.', ru:'У 47 из 68 наблюдавшихся спутников Starlink — собственное излучение на 110–188 МГц, намного ниже нисходящих каналов 10,7–12,7 ГГц.'}},
  {title:'C. G. Bassa et al., “Bright unintended electromagnetic radiation from second-generation Starlink satellites” — A&A 689 (2024)', url:'https://doi.org/10.1051/0004-6361/202451856', note:{en:'v2-Mini emission up to a factor of 32 stronger than the first generation; exceeds ITU-R thresholds protecting 150.05–153 MHz.', ru:'Излучение v2-Mini до 32 раз сильнее, чем у первого поколения; превышает пороги МСЭ-R для защиты полосы 150,05–153 МГц.'}},
  {title:'T. Pultarova, “Every SpaceX Starlink satellite has to dodge a collision almost weekly…” — Space.com, 15 July 2026', url:'https://www.space.com/space-exploration/satellites/every-spacex-starlink-satellite-has-to-dodge-a-collision-almost-weekly-and-experts-fear-the-worst', note:{en:'From SpaceX’s semiannual FCC report: 207,152 manoeuvres December 2025 – May 2026, 148,696 the previous half-year; over 40 per satellite per year; threshold 3 in 10 million.', ru:'По полугодовому отчёту SpaceX в FCC: 207 152 манёвра с декабря 2025 по май 2026 года, 148 696 за предыдущее полугодие; более 40 на спутник в год; порог 3 на 10 миллионов.'}},
  {title:'SpaceX, “Geomagnetic storm and recently deployed Starlink satellites” (8 February 2022), reposted by TelecomTV, 9 February 2022', url:'https://www.telecomtv.com/content/access-evolution/geomagnetic-storm-and-recently-deployed-starlink-satellites-43563/', note:{en:'Falcon 9 deployed 49 satellites “with a perigee of approximately 210 kilometers above Earth”; drag “up to 50 percent higher than during previous launches”; “up to 40” expected to re-enter (McDowell later counts 38).', ru:'Falcon 9 вывел 49 спутников «с перигеем около 210 километров над Землёй»; сопротивление «до 50 процентов выше, чем при предыдущих запусках»; ожидался вход в атмосферу «до 40» (по позднейшему подсчёту Макдауэлла — 38).'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  Array.prototype.forEach.call(document.querySelectorAll('[data-aria-en]'), function(el){ el.setAttribute('aria-label', T(el.getAttribute('data-aria-en'), el.getAttribute('data-aria-ru'))); });
  renderCov();
  renderTables();
  renderLat();
  renderSky();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__swarm = {footprint:footprint, slantMax:slantMax, capArea:capArea, nHoneycomb:nHoneycomb, streets:streets, gcKm:gcKm, latency:latency, geoPath:geoPath, crossover:crossover,
  shellPoint:shellPoint, sunlit:sunlit, skyCounts:skyCounts, perSqDeg:perSqDeg, streaks:streaks, shadowHeightZenith:shadowHeightZenith, midnightDepression:midnightDepression,
  CITIES:CITIES, SNAP:SNAP, SHELLS:SHELLS, FLEET:FLEET, MANEUVERS:MANEUVERS, H_GEO:H_GEO, A_GEO:A_GEO, RUBIN_LAT:RUBIN_LAT, OBLIQ:OBLIQ, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
