/* ============ CONSTANTS ============ */
var MU = 398600.4418;                       // km³/s², Earth (standard value)
var T_SID = 86164.0905;                     // s, one sidereal day: a geostationary orbit's period
var R_EQ = 6378.137, R_POL = 6356.752314;   // km, GRS80 ellipsoid used by the ABI fixed grid [34]
var R_MEAN = 6371.0;                        // km, mean radius for the spherical estimates
var C1 = 1.191042972e-5;                    // 2hc², mW m⁻² sr⁻¹ cm⁴  (from exact SI h, c [36])
var C2 = 1.438776877;                       // hc/k, cm·K            (from exact SI h, c, k [36])
var SIGMA = 5.670374419e-8;                 // Stefan–Boltzmann, W m⁻² K⁻⁴ [36]
var DEG = Math.PI/180;

/* Geostationary radius from Kepler's third law: one orbit per sidereal day */
function geoRadius(){ return Math.pow(MU*T_SID*T_SID/(4*Math.PI*Math.PI), 1/3); }
var R_GEO = geoRadius(), H_GEO = R_GEO - R_EQ;

/* ============ SPHERICAL GEO GEOMETRY (instrument 1) ============ */
/* psi = Earth-central angle between the sub-satellite point and the ground point */
function geoView(psiDeg, R){
  R = R || R_EQ;
  var p = psiDeg*DEG, d = Math.sqrt(R*R + R_GEO*R_GEO - 2*R*R_GEO*Math.cos(p));
  var eta = Math.asin(Math.min(1, R*Math.sin(p)/d));            // nadir angle seen from the satellite
  var zen = p + eta;                                              // satellite zenith angle seen from the ground
  return {d:d, eta:eta/DEG, zen:zen/DEG, visible:Math.cos(p) > R/R_GEO};
}
function horizonPsi(){ return Math.acos(R_EQ/R_GEO)/DEG; }
function capFraction(psiDeg){ return (1 - Math.cos(psiDeg*DEG))/2; }
function visibleFraction(){ return capFraction(horizonPsi()); }   // = (1 − R/r)/2
function psiForZenith(zMax){                                       // bisection: largest psi with zenith ≤ zMax
  var a = 0, b = horizonPsi();
  for(var i = 0; i < 60; i++){ var m = (a + b)/2; if(geoView(m).zen < zMax) a = m; else b = m; }
  return (a + b)/2;
}
/* North–south stretch of a pixel along the sub-satellite meridian, relative to nadir (spherical) */
function nsStretch(latDeg){
  var v = geoView(latDeg); if(!v.visible) return Infinity;
  return (v.d/H_GEO)/Math.cos(v.zen*DEG);
}

/* ============ POLAR ORBITER (instrument 1) ============ */
function circPeriodMin(hKm){ var a = R_EQ + hKm; return 2*Math.PI*Math.sqrt(a*a*a/MU)/60; }
function orbitsPerDay(hKm){ return 1440/circPeriodMin(hKm); }
function trackShiftDeg(hKm){ return 360*circPeriodMin(hKm)*60/T_SID; }   // Earth turns under the orbit
/* Rough looks per day at a latitude for one satellite: swaths (ascending + descending) over the length of the parallel,
   capped at one look per orbit near the poles where every pass sees the point. */
function polarLooksPerDay(latDeg, hKm, swathKm){
  var n = orbitsPerDay(hKm), circ = 2*Math.PI*R_MEAN*Math.cos(latDeg*DEG);
  if(circ < 1e-6) return n;
  return Math.min(n, 2*n*swathKm/circ);
}
var NOAA21_H = 824, VIIRS_SWATH = 3000;     // WMO OSCAR [27][28]

/* ============ ABI FIXED GRID (instrument 2) ============ */
/* GOES fixed-grid projection on the GRS80 ellipsoid (the equations in the GOES-R Product User's Guide).
   x = east–west scan angle, y = north–south elevation angle, radians. lon0 = satellite longitude. */
var E2 = 1 - (R_POL/R_EQ)*(R_POL/R_EQ);
function llToXY(lat, lon, lon0){
  var phi = lat*DEG, lam = (lon - lon0)*DEG;
  var phic = Math.atan((R_POL*R_POL)/(R_EQ*R_EQ)*Math.tan(phi));
  var rc = R_POL/Math.sqrt(1 - E2*Math.cos(phic)*Math.cos(phic));
  var sx = R_GEO - rc*Math.cos(phic)*Math.cos(lam), sy = -rc*Math.cos(phic)*Math.sin(lam), sz = rc*Math.sin(phic);
  return {x:Math.asin(-sy/Math.sqrt(sx*sx + sy*sy + sz*sz)), y:Math.atan(sz/sx), visible:geoVisible(lat, lon, lon0)};
}
function geoVisible(lat, lon, lon0){
  /* the ground point sees the satellite above its (geocentric, spherical-equivalent) horizon */
  var c = Math.cos(lat*DEG)*Math.cos((lon - lon0)*DEG);
  return c > R_EQ/R_GEO;
}
function xyToLL(x, y, lon0){
  var a = Math.sin(x)*Math.sin(x) + Math.cos(x)*Math.cos(x)*(Math.cos(y)*Math.cos(y) + (R_EQ*R_EQ)/(R_POL*R_POL)*Math.sin(y)*Math.sin(y));
  var b = -2*R_GEO*Math.cos(x)*Math.cos(y), c = R_GEO*R_GEO - R_EQ*R_EQ, disc = b*b - 4*a*c;
  if(disc < 0) return null;
  var rs = (-b - Math.sqrt(disc))/(2*a);
  var sx = rs*Math.cos(x)*Math.cos(y), sy = -rs*Math.sin(x), sz = rs*Math.cos(x)*Math.sin(y);
  return {lat:Math.atan((R_EQ*R_EQ)/(R_POL*R_POL)*sz/Math.sqrt((R_GEO - sx)*(R_GEO - sx) + sy*sy))/DEG, lon:lon0 - Math.atan(sy/(R_GEO - sx))/DEG};
}
function surfDist(p, q){                                         // short distances on the mean sphere, km
  var la = (p.lat + q.lat)/2*DEG, dy = (q.lat - p.lat)*DEG*R_MEAN, dx = (q.lon - p.lon)*DEG*R_MEAN*Math.cos(la);
  return Math.sqrt(dx*dx + dy*dy);
}
/* Ground footprint of one fixed-grid cell (angular size ifov, radians) centred on lat/lon: east–west and north–south, km */
function footprint(lat, lon, lon0, ifov){
  if(!geoVisible(lat, lon, lon0)) return null;
  var c = llToXY(lat, lon, lon0), h = ifov/2;
  var w1 = xyToLL(c.x - h, c.y, lon0), w2 = xyToLL(c.x + h, c.y, lon0), n1 = xyToLL(c.x, c.y - h, lon0), n2 = xyToLL(c.x, c.y + h, lon0);
  if(!w1 || !w2 || !n1 || !n2) return null;
  var v = geoView(Math.acos(Math.cos(lat*DEG)*Math.cos((lon - lon0)*DEG))/DEG);
  return {ew:surfDist(w1, w2), ns:surfDist(n1, n2), x:c.x, y:c.y, zen:v.zen};
}
function ifovFor(gsdKm, hKm){ return gsdKm/hKm; }                 // radians: small-angle IFOV that gives this nadir pixel
/* Official fixed-grid steps from the ABI L1b files (x/y scale_factor, radians): 2 km bands 56 µrad, 1 km 28, 0.5 km 14 [40] */
var ABI_STEP = {'0.5':14e-6, '1':28e-6, '2':56e-6};
function abiStep(km){ return ABI_STEP[String(km)]; }
function gsd(ifovRad, hKm){ return ifovRad*hKm; }
var GOES_EAST = -75.0;                                            // fixed-grid projection origin in GOES-East ABI files [40]; the satellite itself is kept at 75.2° W [17]

/* ============ BRIGHTNESS TEMPERATURE (instrument 3) ============ */
/* Planck radiance per unit wavenumber, mW m⁻² sr⁻¹ (cm⁻¹)⁻¹, and its exact inverse */
function planckNu(nuCm, T){ return C1*nuCm*nuCm*nuCm/(Math.exp(C2*nuCm/T) - 1); }
function brightnessT(nuCm, L){ return C2*nuCm/Math.log(1 + C1*nuCm*nuCm*nuCm/L); }
function umToCm(um){ return 1e4/um; }
var NU13 = umToCm(10.3), NU15 = umToCm(12.3);                    // ABI bands 13 and 15, nominal centres [14]
/* Standard atmosphere: 288.15 K at sea level, −6.5 K/km to 11 km, then isothermal (216.65 K) to 20 km [33] */
var T_SURF = 288.15, LAPSE = 6.5, TROPO_KM = 11, T_TROPO = 288.15 - 6.5*11;
function stdT(hKm){ return hKm <= TROPO_KM ? T_SURF - LAPSE*hKm : T_TROPO; }
function heightFromT(Tk){ return (T_SURF - Tk)/LAPSE; }           // lapse-rate inversion (troposphere only)
/* A pixel with a fraction f of opaque cloud top at hKm over a black surface at sea level */
function pixelBT(nuCm, hKm, f){
  var L = f*planckNu(nuCm, stdT(hKm)) + (1 - f)*planckNu(nuCm, T_SURF);
  return brightnessT(nuCm, L);
}
/* Stefan–Boltzmann from integrating Planck over wavenumber (W m⁻²): a check on the constants */
function sbIntegral(T){
  var s = 0, n = 20000, top = 20000, dn = top/n;                 // cm⁻¹, 0–20,000 (Simpson)
  for(var i = 0; i <= n; i++){ var nu = i*dn, w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w*(nu === 0 ? 0 : planckNu(nu, T)); }
  return Math.PI*s*dn/3/1000;
}

/* ============ SMALL FORMATTERS ============ */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function km(v){ return (v < 10 ? fmt(v, 2) : v < 100 ? fmt(v, 1) : num(Math.round(v))) + T(' km',' км'); }
function minStr(m){
  if(m < 60) return fmt(m, m < 10 ? 1 : 0) + T(' min',' мин');
  if(m < 1440) return fmt(m/60, 1) + T(' h',' ч');
  return fmt(m/1440, 1) + T(' days',' сут');
}
function kStr(t){ return fmt(t, 1) + T(' K',' К') + ' (' + fmt(t - 273.15, 1) + ' °C)'; }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }

/* ============ CH2 — TWO WAYS TO WATCH ============ */
var cvLat = document.getElementById('cvLat'), cvZen = document.getElementById('cvZen');
function renderCV(){
  var lat = +cvLat.value, zMax = +cvZen.value;
  document.getElementById('cvLatVal').textContent = fmt(lat, 0) + '°';
  cvLat.setAttribute('aria-valuetext', T('latitude ','широта ') + fmt(lat, 0) + '°');
  document.getElementById('cvZenVal').textContent = fmt(zMax, 0) + '°';
  cvZen.setAttribute('aria-valuetext', T('usable up to a viewing angle of ','пригодно до угла обзора ') + fmt(zMax, 0) + '°');
  var psiMax = psiForZenith(zMax), v = geoView(lat), usable = v.visible && v.zen <= zMax;
  var looks = polarLooksPerDay(lat, NOAA21_H, VIIRS_SWATH), gap = 1440/looks;
  var svg = document.getElementById('cvSvg'); svg.innerHTML = ''; aria(svg);
  var Lx = 58, Rx = 465, Tp = 26, B = 250;
  function X(la){ return Lx + la/90*(Rx - Lx); } function Y(m){ return Tp + (Math.log10(1440) - Math.log10(Math.max(1, m)))/(Math.log10(1440))*(B - Tp); }
  [[1,'1 '+T('min','мин')],[10,'10 '+T('min','мин')],[60,'1 '+T('h','ч')],[360,'6 '+T('h','ч')],[1440,'24 '+T('h','ч')]].forEach(function(p){
    ns('line', {x1:Lx, y1:Y(p[0]), x2:Rx, y2:Y(p[0]), stroke:'#e4e4de'}, svg); txt(svg, Lx - 6, Y(p[0]) + 4, p[1], 'svg-small', 'end'); });
  [0, 15, 30, 45, 60, 75, 90].forEach(function(la){ ns('line', {x1:X(la), y1:B, x2:X(la), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(la), B + 16, la + '°', 'svg-small', 'middle'); });
  ns('line', {x1:Lx, y1:B, x2:Rx, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, Lx, 14, T('time between looks (log)','время между снимками (лог.)'), 'svg-small');
  txt(svg, Rx, B + 32, T('latitude, along the satellite\'s meridian','широта вдоль меридиана спутника'), 'svg-small', 'end');
  /* GEO: 10 minutes wherever the view is usable */
  var la0 = 0, la1 = Math.min(90, psiMax), laH = horizonPsi();
  ns('rect', {x:X(la1), y:Tp, width:X(Math.min(90, laH)) - X(la1), height:B - Tp, fill:'#f3e3dd'}, svg);
  ns('line', {x1:X(la0), y1:Y(10), x2:X(la1), y2:Y(10), stroke:'#b5452a', 'stroke-width':2.4}, svg);
  txt(svg, X(2), Y(10) - 7, T('geostationary: full disk every 10 min','геостационарный: весь диск каждые 10 мин'), 'svg-small svg-halo');
  txt(svg, X(Math.min(laH, 89)) - 3, B - 8, T('too oblique','слишком полого'), 'svg-small', 'end');
  /* polar: mean gap */
  var d = ''; for(var i = 0; i <= 180; i++){ var la = i/2, m = 1440/polarLooksPerDay(la, NOAA21_H, VIIRS_SWATH); d += (i ? 'L' : 'M') + X(la).toFixed(1) + ',' + Y(m).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  txt(svg, X(3), Y(1440/polarLooksPerDay(3, NOAA21_H, VIIRS_SWATH)) - 9, T('one polar orbiter (average gap)','один полярный спутник (средний интервал)'), 'svg-small svg-halo');
  ns('line', {x1:X(lat), y1:Tp, x2:X(lat), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  if(usable) ns('circle', {cx:X(lat), cy:Y(10), r:5, fill:'#b5452a'}, svg);
  ns('circle', {cx:X(lat), cy:Y(gap), r:5, fill:'#2f5aa1'}, svg);
  var st = nsStretch(lat);
  cells(document.getElementById('cvReadout'), [
    [T('GEO VIEWING ANGLE','УГОЛ ОБЗОРА С ГСО'), v.visible ? fmt(v.zen, 1) + '°' : T('below horizon','за горизонтом')],
    [T('GEO PIXEL, N–S STRETCH','ПИКСЕЛЬ С ГСО, РАСТЯЖЕНИЕ С–Ю'), isFinite(st) ? '× ' + fmt(st, 2) : '—'],
    [T('GEO: TIME BETWEEN LOOKS','ГСО: ИНТЕРВАЛ'), usable ? '10' + T(' min',' мин') : T('not usable','непригодно')],
    [T('POLAR: LOOKS PER DAY','ПОЛЯРНЫЙ: СНИМКОВ В СУТКИ'), fmt(looks, 1) + ' · ' + T('every ','раз в ') + minStr(gap)],
    [T('GEO SEES (GEOMETRY)','ГСО ВИДИТ (ГЕОМЕТРИЯ)'), fmt(visibleFraction()*100, 1) + T(' % of Earth',' % Земли')],
    [T('GEO USABLE AT THIS LIMIT','ГСО ПРИГОДНО ПРИ ЭТОМ ПРЕДЕЛЕ'), fmt(capFraction(psiMax)*100, 1) + ' % · ' + T('to ','до ') + fmt(psiMax, 1) + '°']
  ]);
  hud1.textContent = isFinite(st) ? '× ' + fmt(st, 2) : '—';
  hud2.textContent = minStr(gap);
  document.getElementById('cvStatus').innerHTML = !v.visible
    ? T('Beyond the geostationary satellite\'s horizon (more than ' + fmt(horizonPsi(), 1) + '° from the point below it): only polar orbiters see here — about ' + fmt(looks, 0) + ' passes a day, roughly one per orbit.','За горизонтом геостационарного спутника (дальше ' + fmt(horizonPsi(), 1) + '° от подспутниковой точки): сюда смотрят только полярные спутники — около ' + fmt(looks, 0) + ' пролётов в сутки, примерно один за виток.')
    : !usable
      ? T('The geostationary satellite can still see this latitude, but at ' + fmt(v.zen, 0) + '° from the vertical its pixels are stretched ' + fmt(st, 1) + ' times north–south and it looks through a long slant of atmosphere — above your chosen limit. Here the polar orbiters do better.','Геостационарный спутник ещё видит эту широту, но под углом ' + fmt(v.zen, 0) + '° к вертикали его пиксели растянуты с севера на юг в ' + fmt(st, 1) + ' раза, и он смотрит сквозь длинный косой слой атмосферы — это за выбранным пределом. Здесь полярные спутники справляются лучше.')
      : T('Both see this latitude. The geostationary imager refreshes it every 10 minutes (pixels × ' + fmt(st, 2) + ' north–south); one polar orbiter passes about ' + fmt(looks, 1) + ' times a day, closer and from straight above.','Эту широту видят оба. Геостационарный спутник обновляет её каждые 10 минут (пиксели × ' + fmt(st, 2) + ' с севера на юг); один полярный спутник пролетает около ' + fmt(looks, 1) + ' раза в сутки — ближе и прямо сверху.');
}
cvLat.addEventListener('input', function(){ pressGroup(document.getElementById('cvPre'), null); renderCV(); });
cvZen.addEventListener('input', renderCV);
Array.prototype.forEach.call(document.querySelectorAll('#cvPre .btn'), function(btn){ btn.addEventListener('click', function(){ cvLat.value = this.getAttribute('data-lat'); pressGroup(this.parentNode, this); renderCV(); }); });

/* ============ CH4 — PIXELS FROM ORBIT ============ */
var pxH = document.getElementById('pxH'), pxLat = document.getElementById('pxLat'), pxLon = document.getElementById('pxLon');
var pxBand = 2;                                                   // nadir km at GEO height
pxH.value = Math.log10(H_GEO);
function renderPX(){
  var h = Math.pow(10, +pxH.value), lat = +pxLat.value, lon = +pxLon.value;
  var ifov = abiStep(pxBand), g = gsd(ifov, h);
  document.getElementById('pxHVal').textContent = km(h);
  pxH.setAttribute('aria-valuetext', T('altitude ','высота ') + km(h));
  document.getElementById('pxLatVal').textContent = fmt(Math.abs(lat), 1) + '°' + (lat >= 0 ? T(' N',' с. ш.') : T(' S',' ю. ш.'));
  pxLat.setAttribute('aria-valuetext', document.getElementById('pxLatVal').textContent);
  document.getElementById('pxLonVal').textContent = fmt(Math.abs(lon), 1) + '°' + (lon < 0 ? T(' W',' з. д.') : T(' E',' в. д.'));
  pxLon.setAttribute('aria-valuetext', document.getElementById('pxLonVal').textContent);
  var fp = footprint(lat, lon, GOES_EAST, ifov);
  var svg = document.getElementById('pxSvg'); svg.innerHTML = ''; aria(svg);
  /* left: Earth as GOES-East sees it, in fixed-grid scan angles */
  var cx = 120, cy = 150, sc = 118/(0.1527);                       // ~8.7° limb → 118 px
  function P(x, y){ return [cx + x*sc, cy - y*sc]; }
  ns('circle', {cx:cx, cy:cy, r:0.1519*sc, fill:'#eef1f6', stroke:'#0b0b0c'}, svg);
  for(var la = -75; la <= 75; la += 15){ var d = '', on = false;
    for(var lo = -180; lo <= 180; lo += 2){ var L2 = GOES_EAST + lo; if(!geoVisible(la, L2, GOES_EAST)){ on = false; continue; } var q = llToXY(la, L2, GOES_EAST), pt = P(q.x, q.y); d += (on ? 'L' : 'M') + pt[0].toFixed(1) + ',' + pt[1].toFixed(1); on = true; }
    ns('path', {d:d, fill:'none', stroke:la === 0 ? '#8a8a84' : '#c9c9c1', 'stroke-width':la === 0 ? 1.2 : 0.8}, svg); }
  for(var lo2 = -90; lo2 <= 90; lo2 += 15){ var d2 = '', on2 = false;
    for(var la2 = -90; la2 <= 90; la2 += 2){ var L3 = GOES_EAST + lo2; if(!geoVisible(la2, L3, GOES_EAST)){ on2 = false; continue; } var q2 = llToXY(la2, L3, GOES_EAST), pt2 = P(q2.x, q2.y); d2 += (on2 ? 'L' : 'M') + pt2[0].toFixed(1) + ',' + pt2[1].toFixed(1); on2 = true; }
    ns('path', {d:d2, fill:'none', stroke:'#c9c9c1', 'stroke-width':0.8}, svg); }
  txt(svg, cx, 16, T('as GOES-East sees it','так видит GOES-East'), 'svg-small', 'middle');
  if(fp){ var pp = P(fp.x, fp.y); ns('circle', {cx:pp[0], cy:pp[1], r:5, fill:'#b5452a', stroke:'#fff', 'stroke-width':1.5}, svg); }
  /* right: the footprint to scale against the nadir square */
  var bx = 270, by = 40, bw = 190, bh = 220, s2 = Math.min(bw, bh)/12;  // 12 km frame
  ns('rect', {x:bx, y:by, width:bw, height:bh, fill:'#fff', stroke:'#c9c9c1'}, svg);
  txt(svg, bx + bw/2, by - 22, T('one pixel, to scale','пиксель в масштабе'), 'svg-small', 'middle');
  txt(svg, bx + bw/2, by - 6, T('(12 km box)','(рамка 12 км)'), 'svg-small', 'middle');
  var mx = bx + bw/2, my = by + bh/2;
  ns('rect', {x:mx - pxBand*s2/2, y:my - pxBand*s2/2, width:pxBand*s2, height:pxBand*s2, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.5, 'stroke-dasharray':'3 2'}, svg);
  if(fp){
    var w = Math.min(fp.ew, 12)*s2, hh = Math.min(fp.ns, 18)*s2;
    ns('rect', {x:mx - w/2, y:Math.max(by + 2, my - hh/2), width:w, height:Math.min(bh - 4, hh), fill:'rgba(181,69,42,0.18)', stroke:'#b5452a', 'stroke-width':2}, svg);
  }
  txt(svg, bx + bw/2, by + bh + 16, T('dashed: nadir pixel','пунктир: пиксель в надире'), 'svg-small', 'middle');
  cells(document.getElementById('pxReadout'), [
    [T('IFOV (ANGLE PER PIXEL)','МГНОВЕННОЕ ПОЛЕ ЗРЕНИЯ'), fmt(ifov*1e6, 0) + T(' µrad',' мкрад')],
    [T('PIXEL STRAIGHT DOWN AT THIS ALTITUDE','ПИКСЕЛЬ ПОД СОБОЙ НА ЭТОЙ ВЫСОТЕ'), g < 1 ? fmt(g*1000, 0) + T(' m',' м') : km(g)],
    [T('PIXEL HERE FROM GOES-EAST, E–W','ПИКСЕЛЬ ЗДЕСЬ С GOES-EAST, В–З'), fp ? km(fp.ew) : '—'],
    [T('PIXEL HERE FROM GOES-EAST, N–S','ПИКСЕЛЬ ЗДЕСЬ С GOES-EAST, С–Ю'), fp ? km(fp.ns) : '—'],
    [T('AREA vs NADIR','ПЛОЩАДЬ ОТНОСИТЕЛЬНО НАДИРА'), fp ? '× ' + fmt(fp.ew*fp.ns/(pxBand*pxBand), 2) : '—'],
    [T('VIEWING ANGLE','УГОЛ ОБЗОРА'), fp ? fmt(fp.zen, 1) + '°' : T('below horizon','за горизонтом')]
  ]);
  document.getElementById('pxStatus').innerHTML = !fp
    ? T('GOES-East cannot see this place: it is beyond the limb. A polar orbiter, or another geostationary satellite, has to cover it.','GOES-East не видит это место — оно за краем диска. Его должен закрывать полярный спутник или другой геостационарный.')
    : T('The same ' + fmt(ifov*1e6, 0) + ' µrad pixel is ' + km(fp.ew) + ' wide and ' + km(fp.ns) + ' tall here, against ' + km(pxBand) + ' straight below the satellite. North–south grows fastest because the view grazes the curving Earth from the equator.','Тот же пиксель в ' + fmt(ifov*1e6, 0) + ' мкрад здесь имеет ширину ' + km(fp.ew) + ' и высоту ' + km(fp.ns) + ' — против ' + km(pxBand) + ' прямо под спутником. Быстрее всего растёт размер с севера на юг: от экватора взгляд всё более полого скользит по выпуклой Земле.');
}
[pxH, pxLat, pxLon].forEach(function(el){ el.addEventListener('input', function(){ if(el !== pxH) pressGroup(document.getElementById('pxPlace'), null); else pressGroup(document.getElementById('pxAlt'), null); renderPX(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#pxBand .btn'), function(btn){ btn.addEventListener('click', function(){ pxBand = +this.getAttribute('data-km'); pressGroup(this.parentNode, this); renderPX(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#pxPlace .btn'), function(btn){ btn.addEventListener('click', function(){ pxLat.value = this.getAttribute('data-lat'); pxLon.value = this.getAttribute('data-lon'); pressGroup(this.parentNode, this); renderPX(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#pxAlt .btn'), function(btn){ btn.addEventListener('click', function(){ pxH.value = Math.log10(+this.getAttribute('data-h')); pressGroup(this.parentNode, this); renderPX(); }); });

/* ============ CH5 — BRIGHTNESS TEMPERATURE ============ */
var btH = document.getElementById('btH'), btF = document.getElementById('btF');
function renderBT(){
  var h = +btH.value, f = +btF.value/100, Tc = stdT(h);
  document.getElementById('btHVal').textContent = fmt(h, 1) + T(' km',' км');
  btH.setAttribute('aria-valuetext', T('cloud top at ','верхняя граница облака на ') + fmt(h, 1) + T(' km',' км') + ', ' + kStr(Tc));
  document.getElementById('btFVal').textContent = fmt(f*100, 0) + ' %';
  btF.setAttribute('aria-valuetext', T('cloud fills ','облако заполняет ') + fmt(f*100, 0) + T(' % of the pixel',' % пикселя'));
  var L13 = f*planckNu(NU13, Tc) + (1 - f)*planckNu(NU13, T_SURF), bt13 = brightnessT(NU13, L13), bt15 = pixelBT(NU15, h, f);
  var hRet = heightFromT(bt13);
  var svg = document.getElementById('btSvg'); svg.innerHTML = ''; aria(svg);
  var Lx = 58, Rx = 465, Tp = 26, B = 256, t0 = 200, t1 = 300, z1 = 16;
  function X(t){ return Lx + (t - t0)/(t1 - t0)*(Rx - Lx); } function Y(z){ return B - z/z1*(B - Tp); }
  [0, 4, 8, 12, 16].forEach(function(z){ ns('line', {x1:Lx, y1:Y(z), x2:Rx, y2:Y(z), stroke:'#e4e4de'}, svg); txt(svg, Lx - 6, Y(z) + 4, z + T(' km',' км'), 'svg-small', 'end'); });
  [200, 220, 240, 260, 280, 300].forEach(function(t){ ns('line', {x1:X(t), y1:B, x2:X(t), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(t), B + 16, num(t) + T(' K',' К'), 'svg-small', 'middle'); });
  ns('line', {x1:Lx, y1:B, x2:Rx, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, Lx, 14, T('height','высота'), 'svg-small');
  txt(svg, Rx, B + 32, T('temperature','температура'), 'svg-small', 'end');
  ns('rect', {x:Lx, y:Tp, width:Rx - Lx, height:Y(TROPO_KM) - Tp, fill:'#f1f1ec'}, svg);
  txt(svg, Rx - 4, Tp + 12, T('above 11 km: no longer colder with height','выше 11 км: с высотой уже не холоднее'), 'svg-small', 'end');
  var d = ''; for(var i = 0; i <= 160; i++){ var z = i/10; d += (i ? 'L' : 'M') + X(stdT(z)).toFixed(1) + ',' + Y(z).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  /* cloud */
  var cw = Math.max(8, f*120);
  ns('rect', {x:X(Tc) - cw/2, y:Y(h) - 7, width:cw, height:14, rx:7, fill:'#ffffff', stroke:'#5f5f59'}, svg);
  ns('circle', {cx:X(Tc), cy:Y(h), r:4.5, fill:'#0b0b0c'}, svg);
  /* what the satellite reads */
  ns('line', {x1:X(bt13), y1:Tp, x2:X(bt13), y2:B, stroke:'#b5452a', 'stroke-width':1.6, 'stroke-dasharray':'4 3'}, svg);
  txt(svg, X(bt13) + (bt13 > 280 ? -5 : 5), Tp + 30, T('reads ','показывает ') + fmt(bt13, 1) + T(' K',' К'), 'svg-small svg-halo', bt13 > 280 ? 'end' : 'start');
  if(bt13 > T_TROPO + 1e-6){ ns('line', {x1:Lx, y1:Y(hRet), x2:Rx, y2:Y(hRet), stroke:'#b5452a', 'stroke-width':1}, svg); }
  cells(document.getElementById('btReadout'), [
    [T('CLOUD-TOP TEMPERATURE','ТЕМПЕРАТУРА ВЕРХНЕЙ ГРАНИЦЫ'), kStr(Tc), true],
    [T('RADIANCE AT 10.3 µm','ЯРКОСТЬ НА 10,3 мкм'), fmt(L13, 2) + T(' mW/(m² sr cm⁻¹)',' мВт/(м²·ср·см⁻¹)')],
    [T('BRIGHTNESS TEMPERATURE','ЯРКОСТНАЯ ТЕМПЕРАТУРА'), fmt(bt13, 2) + T(' K',' К')],
    [T('HEIGHT FROM 6.5 K/km','ВЫСОТА ПО 6,5 К/км'), bt13 <= T_TROPO + 1e-6 ? T('11 km or higher: ambiguous','11 км или выше: неоднозначно') : fmt(Math.max(0, hRet), 2) + T(' km',' км')],
    [T('SPLIT WINDOW 10.3 − 12.3 µm','РАСЩЕПЛЁННОЕ ОКНО 10,3 − 12,3 мкм'), (bt13 - bt15 >= 0 ? '+' : '') + fmt(bt13 - bt15, 2) + T(' K',' К')]
  ]);
  var err = h - hRet;
  document.getElementById('btStatus').innerHTML = f >= 0.999
    ? (h >= TROPO_KM
       ? T('The cloud fills the pixel and is at the tropopause or above: 216.65 K could be anywhere from 11 to 20 km in this atmosphere, so temperature alone cannot say how high it reaches.','Облако заполняет пиксель и стоит на тропопаузе или выше: 216,65 К в этой атмосфере может означать любую высоту от 11 до 20 км, так что одна температура не скажет, насколько высоко оно поднялось.')
       : T('Opaque cloud filling the pixel: Planck\'s law turns the radiance back into exactly the cloud-top temperature, and the lapse rate turns that into ' + fmt(hRet, 2) + ' km. The two window bands agree.','Непрозрачное облако на весь пиксель: закон Планка переводит яркость ровно в температуру верхней границы, а вертикальный градиент — в высоту ' + fmt(hRet, 2) + ' км. Оба оконных канала сходятся.'))
    : f <= 0.001
      ? T('Clear sky: the satellite reads the surface, 288.15 K. (A real atmosphere would add some water-vapour cooling, most at 12.3 µm.)','Ясное небо: спутник видит поверхность, 288,15 К. (Реальная атмосфера добавила бы охлаждение водяным паром, сильнее всего на 12,3 мкм.)')
      : T('A pixel only ' + fmt(f*100, 0) + ' % cloudy reads ' + fmt(bt13, 1) + ' K — the warm ground leaks in, so the cloud seems ' + fmt(Math.max(0, err), 1) + ' km lower than it is. Because Planck\'s law is curved, the mix also reads warmer at 10.3 than at 12.3 µm, by ' + fmt(bt13 - bt15, 2) + ' K, with no water vapour at all.','Пиксель, заполненный облаком лишь на ' + fmt(f*100, 0) + ' %, показывает ' + fmt(bt13, 1) + ' К: тёплая земля «просвечивает», и облако кажется на ' + fmt(Math.max(0, err), 1) + ' км ниже, чем есть. Из-за кривизны закона Планка такая смесь к тому же на 10,3 мкм выглядит теплее, чем на 12,3 мкм, — на ' + fmt(bt13 - bt15, 2) + ' К, вовсе без водяного пара.');
}
btH.addEventListener('input', function(){ pressGroup(document.getElementById('btPre'), null); renderBT(); });
btF.addEventListener('input', function(){ pressGroup(document.getElementById('btPre'), null); renderBT(); });
Array.prototype.forEach.call(document.querySelectorAll('#btPre .btn'), function(btn){ btn.addEventListener('click', function(){ btH.value = this.getAttribute('data-h'); btF.value = this.getAttribute('data-f'); pressGroup(this.parentNode, this); renderBT(); }); });

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1960', '<b>1 April:</b> TIROS-1 launched; its two small TV cameras send the first television pictures of clouds from orbit. It works for 78 days [1][2][3].', '<b>1 апреля:</b> запуск TIROS-1; две его маленькие телекамеры передают первые телевизионные снимки облаков с орбиты. Он работает 78 дней [1][2][3].'],
  ['1964', '<b>28 August:</b> Nimbus 1, the first of seven NASA research weather satellites, with an infrared radiometer for night-time pictures [4][5]. The same day the USSR launches Kosmos 44, the first experimental satellite of what becomes the Meteor system [7].', '<b>28 августа:</b> «Нимбус-1» — первый из семи исследовательских метеоспутников NASA, с инфракрасным радиометром для ночных снимков [4][5]. В тот же день СССР запускает «Космос-44» — первый экспериментальный спутник будущей системы «Метеор» [7].'],
  ['1966', '<b>25 June:</b> Kosmos 122 [7]. <b>7 December (UTC):</b> ATS-1 launched; on 11 December its spin-scan camera takes the first full-disk picture of Earth from geostationary orbit [9][11].', '<b>25 июня:</b> «Космос-122» [7]. <b>7 декабря (UTC):</b> запуск ATS-1; 11 декабря его камера со сканированием вращением делает первый снимок всего диска Земли с геостационарной орбиты [9][11].'],
  ['1969', '<b>26 March:</b> Meteor-1 No. 1, the first satellite to carry the Meteor name [7]. <b>24 May:</b> temperature soundings from SIRS on Nimbus 3 enter operational use — the first from a satellite [6].', '<b>26 марта:</b> «Метеор-1» № 1 — первый спутник под именем «Метеор» [7]. <b>24 мая:</b> температурные профили прибора SIRS на «Нимбусе-3» начинают использовать в оперативной работе — первые со спутника [6].'],
  ['1974–75', '<b>17 May 1974:</b> SMS-1, the first geostationary satellite built for weather; <b>16 October 1975:</b> GOES-1 [12].', '<b>17 мая 1974:</b> SMS-1 — первый геостационарный спутник, построенный для метеорологии; <b>16 октября 1975:</b> GOES-1 [12].'],
  ['1977', '<b>23 November:</b> Meteosat-1, Europe\'s first weather satellite, scanning the full disc every 30 minutes; first image on 9 December [13].', '<b>23 ноября:</b> «Метеосат-1», первый европейский метеоспутник, снимающий весь диск каждые 30 минут; первый снимок — 9 декабря [13].'],
  ['2015', '<b>7 July:</b> Himawari-8 begins operations with a 16-band imager and a full disk every 10 minutes [24].', '<b>7 июля:</b> начинает работу «Химавари-8» с 16-канальным радиометром и снимком всего диска каждые 10 минут [24].'],
  ['2016–19', 'GOES-16 launched in November 2016, the first of four GOES-R satellites [38]; from 2 April 2019 its ABI scans the full disk every 10 minutes instead of 15 [14].', 'В ноябре 2016 года запущен GOES-16 — первый из четырёх спутников серии GOES-R [38]; со 2 апреля 2019 года его ABI снимает весь диск каждые 10 минут вместо 15 [14].'],
  ['2022', '<b>10 November:</b> NOAA-21 (JPSS-2) launched [27]. <b>13 December:</b> MTG-I1 launched [21]; the same day Himawari-9 takes over from Himawari-8 [24].', '<b>10 ноября:</b> запуск NOAA-21 (JPSS-2) [27]. <b>13 декабря:</b> запуск MTG-I1 [21]; в тот же день «Химавари-9» сменяет «Химавари-8» [24].'],
  ['2023', '<b>4 January:</b> GOES-18 becomes GOES-West at 137.0° W [18].', '<b>4 января:</b> GOES-18 становится GOES-West на 137,0° з. д. [18].'],
  ['2024', '<b>29 February:</b> Meteor-M No. 2-4 launched [8]. <b>25 June:</b> GOES-U, the last GOES-R satellite, launched [17]. <b>4 December:</b> MTG-I1 becomes Meteosat-12, Europe\'s first geostationary lightning imager in service [20][21].', '<b>29 февраля:</b> запуск «Метеора-М» № 2-4 [8]. <b>25 июня:</b> запуск GOES-U, последнего спутника серии GOES-R [17]. <b>4 декабря:</b> MTG-I1 становится «Метеосатом-12» — в строй входит первый европейский геостационарный регистратор молний [20][21].'],
  ['2025', '<b>7 April:</b> GOES-19 becomes GOES-East [17]. <b>1 July:</b> MTG-S1 with Sentinel-4 launched [37]. <b>13 August:</b> Metop-SG-A1 launched [29]. <b>27 December</b> (Beijing time): Fengyun-4C launched [25].', '<b>7 апреля:</b> GOES-19 становится GOES-East [17]. <b>1 июля:</b> запуск MTG-S1 с прибором Sentinel-4 [37]. <b>13 августа:</b> запуск Metop-SG-A1 [29]. <b>27 декабря</b> (по пекинскому времени): запуск «Фэнъюнь-4C» [25].'],
  ['2026', '<b>2 July:</b> MTG-S1 commissioned and moved to 0° [22]. <b>Mid-July:</b> GOES-19 spends most of a day in safe hold, then returns [19]. <b>27 August:</b> MTG-I2 launched on Ariane 6 [23]. <b>October:</b> Metop-SG-B1 arrives in Kourou for a launch expected at the end of the year [39].', '<b>2 июля:</b> MTG-S1 введён в строй и переведён на 0° [22]. <b>Середина июля:</b> GOES-19 почти сутки находится в защитном режиме, затем возвращается к работе [19]. <b>27 августа:</b> запуск MTG-I2 на «Ариане-6» [23]. <b>Октябрь:</b> Metop-SG-B1 прибывает в Куру для запуска, ожидаемого в конце года [39].'],
  ['2027', 'JPSS-4 (to become NOAA-22) has a launch readiness date in 2027, per NOAA as of October 2026 [26].', 'Готовность JPSS-4 (будущего NOAA-22) к запуску — 2027 год, по данным NOAA на октябрь 2026 года [26].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA Earth Observatory, “50th Anniversary of the TIROS Satellite”', url:'https://science.nasa.gov/earth/earth-observatory/50th-anniversary-of-the-tiros-satellite-43401', note:{en:'Launched 1 April 1960; first image (“frame 2”) of the Red Sea region; two small TV cameras, one wide and one narrow; about 450 miles up; about 23,000 images over 1 April – 18 June 1960.', ru:'Запуск 1 апреля 1960; первый снимок («кадр 2») — район Красного моря; две маленькие телекамеры, широкоугольная и узкоугольная; высота около 450 миль; около 23 000 снимков с 1 апреля по 18 июня 1960 года.'}},
  {title:'NASA NSSDC, “TIROS 1” (1960-002B)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1960-002B', note:{en:'Mass 122.5 kg; two 1.27 cm vidicon TV cameras, wide and narrow angle; tape recorder for pictures taken out of range; normal operation until 15 June 1960.', ru:'Масса 122,5 кг; две видиконные телекамеры диаметром 1,27 см, широко- и узкоугольная; магнитофон для снимков вне зоны связи; штатная работа до 15 июня 1960 года.'}},
  {title:'NOAA NESDIS, “60 Years Ago Today, First Successful Weather Satellite Was Launched”', url:'https://nesdis.noaa.gov/content/60-years-ago-today-first-successful-weather-satellite-was-launched', note:{en:'The world\'s first successful weather satellite; a lifespan of 78 days; 19,389 usable images.', ru:'Первый в мире успешный метеоспутник; срок работы — 78 дней; 19 389 пригодных снимков.'}},
  {title:'NASA NSSDC, “Nimbus 1” (1964-052A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-052A', note:{en:'Launched 28 August 1964; AVCS camera, APT real-time camera and High-Resolution Infrared Radiometer for night-time temperatures; worked until 22 September 1964.', ru:'Запуск 28 августа 1964; камера AVCS, камера APT для передачи в реальном времени и инфракрасный радиометр высокого разрешения для ночных измерений; работал до 22 сентября 1964 года.'}},
  {title:'NASA NSSDC, “Nimbus Program”', url:'https://nssdc.gsfc.nasa.gov/earth/nimbus.html', note:{en:'Launch dates of Nimbus 1–7, 1964–1978 (Nimbus 3: 14 April 1969).', ru:'Даты запуска «Нимбусов» 1–7, 1964–1978 («Нимбус-3» — 14 апреля 1969).'}},
  {title:'CIRA / RAMMB Virtual Lab, “Polar satellite tutorial: SIRS”', url:'https://ramsdis.cira.colostate.edu/rammb/wmovl/VRL/Tutorials/poes/txt76.html', note:{en:'SIRS on Nimbus 3 “enabled the first temperature profile retrievals from a satellite” and “was put into operational use on 24 May 1969”.', ru:'SIRS на «Нимбусе-3» «позволил впервые восстановить температурный профиль со спутника» и «был введён в оперативное использование 24 мая 1969 года».'}},
  {title:'Gunter\'s Space Page, “Meteor-1”', url:'https://space.skyrocket.de/doc_sdat/meteor-1.htm', note:{en:'The first series of Soviet meteorological satellites (VNIIEM); TV and 8–12 µm infrared imagers; Kosmos 44 (28 Aug 1964), Kosmos 122 (25 Jun 1966), Kosmos 144 (28 Feb 1967), Meteor-1 1 (26 Mar 1969); orbits near 81°.', ru:'Первая серия советских метеоспутников (ВНИИЭМ); телевизионная и ИК-аппаратура 8–12 мкм; «Космос-44» (28.08.1964), «Космос-122» (25.06.1966), «Космос-144» (28.02.1967), «Метеор-1» № 1 (26.03.1969); наклонение около 81°.'}},
  {title:'WMO OSCAR/Space, “Meteor-M N2-4”', url:'https://space.oscar.wmo.int/satellites/view/meteor_m_n2_4', note:{en:'Launched 29 February 2024; operational; sun-synchronous, 820.7 km; MSU-MR imager, MTVZA-GY microwave imager/sounder, IKFS-2 infrared sounder (page updated 23 January 2026).', ru:'Запуск 29 февраля 2024; работает; солнечно-синхронная орбита 820,7 км; радиометр МСУ-МР, микроволновый радиометр МТВЗА-ГЯ, ИК-фурье-спектрометр ИКФС-2 (страница обновлена 23 января 2026).'}},
  {title:'NOAA NESDIS, “The 50th Anniversary of ATS-1”', url:'https://www.nesdis.noaa.gov/news/the-50th-anniversary-of-ats-1', note:{en:'Launched 9:12 p.m. Eastern on 6 December 1966; spin-scan cloud-cover camera by Verner Suomi and Robert Parent scanned a strip with each rotation, building an image in under 30 minutes; first full-disk image from geostationary orbit on 11 December 1966; 18-year life.', ru:'Запуск 6 декабря 1966 в 21:12 по восточному времени; камера облачности со сканированием вращением Вернера Суоми и Роберта Парента снимала полосу за каждый оборот и строила снимок менее чем за 30 минут; первый снимок всего диска с геостационарной орбиты — 11 декабря 1966; срок службы 18 лет.'}},
  {title:'UW–Madison SSEC, “Weather in Motion: A 50-year lookback at Earth\'s first movie debut”', url:'https://www.ssec.wisc.edu/news/articles/9433', note:{en:'“The weather moves, not the satellite” (Suomi); a full-disk image every 20 minutes; the first cloud movie over the Pacific in January 1967.', ru:'«Движется погода, а не спутник» (Суоми); снимок всего диска каждые 20 минут; первый «фильм» облаков над Тихим океаном — январь 1967.'}},
  {title:'NASA NSSDC, “ATS 1” (1966-110A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-110A', note:{en:'Launch date 7 December 1966 (UTC); 352 kg; spin-stabilized; first placed at 151.16° W over the Pacific.', ru:'Дата запуска 7 декабря 1966 (UTC); 352 кг; стабилизация вращением; сначала размещён на 151,16° з. д. над Тихим океаном.'}},
  {title:'Gunter\'s Space Page, “SMS 1, 2 / GOES 1, 2, 3”', url:'https://space.skyrocket.de/doc_sdat/goes-a_sms.htm', note:{en:'SMS 1 on 17 May 1974, SMS 2 on 6 February 1975, GOES 1 on 16 October 1975, all on Delta 2914; spin-stabilized, with the VISSR visible/infrared spin-scan radiometer.', ru:'SMS 1 — 17 мая 1974, SMS 2 — 6 февраля 1975, GOES 1 — 16 октября 1975, все на «Дельте-2914»; стабилизация вращением, сканирующий радиометр VISSR видимого и ИК-диапазонов.'}},
  {title:'ESA, “Forty years of Meteosat”', url:'https://www.esa.int/About_Us/ESA_history/Forty_years_of_Meteosat', note:{en:'Meteosat-1 lifted off at 13:35 GMT on 23 November 1977; first image 9 December; full disc every 30 minutes; three spectral channels including water vapour; MSG has 12.', ru:'«Метеосат-1» стартовал 23 ноября 1977 года в 13:35 GMT; первый снимок — 9 декабря; весь диск каждые 30 минут; три спектральных канала, включая канал водяного пара; у MSG их 12.'}},
  {title:'NOAA NESDIS, “ABI Scan Mode Information and Channel Summary”', url:'https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/abi-scan-mode-information-and-channel-summary', note:{en:'16 bands with central wavelengths and best resolutions: band 2 (0.64 µm) 0.5 km; bands 1, 3, 5 at 1 km; band 13 (10.3 µm “clean” window) and band 15 (12.3 µm “dirty” window) at 2 km (after Schmit et al. 2018). 10-minute full-disk mode from about 2 April 2019; CONUS every 5 minutes; two 1,000 km mesoscale boxes every 60 s, or one every 30 s.', ru:'16 каналов с центральными длинами волн и лучшим разрешением: канал 2 (0,64 мкм) — 0,5 км; каналы 1, 3, 5 — 1 км; канал 13 (10,3 мкм, «чистое» окно) и канал 15 (12,3 мкм, «грязное» окно) — 2 км (по Schmit и др., 2018). Режим с полным диском каждые 10 минут — примерно со 2 апреля 2019; США — каждые 5 минут; два мезомасштабных квадрата по 1000 км — каждые 60 с или один — каждые 30 с.'}},
  {title:'NOAA NESDIS, “Advanced Baseline Imager (ABI)”', url:'https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi', note:{en:'16 spectral bands (2 visible, 4 near-infrared, 10 infrared); a full-disk image every 10 minutes, the continental US every 5 minutes, mesoscale areas every 30–60 seconds; four times the resolution of the previous GOES imager.', ru:'16 спектральных каналов (2 видимых, 4 ближних ИК, 10 инфракрасных); снимок всего диска каждые 10 минут, континентальных США — каждые 5 минут, мезомасштабных участков — каждые 30–60 секунд; разрешение в четыре раза выше, чем у прежнего радиометра GOES.'}},
  {title:'NOAA NESDIS, “Geostationary Lightning Mapper (GLM)”', url:'https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/geostationary-lightning-mapper-glm', note:{en:'Single band at 777.4 nm; 2 ms frames (about 500 a second); in-cloud, cloud-to-cloud and cloud-to-ground lightning; 8 km at nadir, 14 km at the edge; coverage to 52° N; the first instrument to map lightning continuously from geostationary orbit.', ru:'Один канал 777,4 нм; кадр 2 мс (около 500 в секунду); внутриоблачные, межоблачные молнии и разряды облако–земля; 8 км в надире, 14 км на краю; охват до 52° с. ш.; первый прибор, непрерывно картирующий молнии с геостационарной орбиты.'}},
  {title:'NOAA NESDIS, “NOAA\'s GOES-19 Now Operational as GOES East” (7 April 2025)', url:'https://www.nesdis.noaa.gov/news/noaas-goes-19-now-operational-goes-east-providing-critical-new-data-forecasters', note:{en:'GOES-19 began operations as GOES East on 7 April 2025 at 75.2° W, 22,236 miles above the equator; launched 25 June 2024; GOES-16 becomes a backup.', ru:'GOES-19 начал работу как GOES East 7 апреля 2025 года на 75,2° з. д., в 22 236 милях над экватором; запущен 25 июня 2024; GOES-16 переходит в резерв.'}},
  {title:'NOAA OSPO, “GOES Performance” status page', url:'https://www.ospo.noaa.gov/operations/goes/status.html', note:{en:'As updated 3 September 2026: GOES-19 GOES-East at 75.2° W; GOES-18 GOES-West at 137.0° W since 4 January 2023; GOES-16 in on-orbit storage at 104.7° W as backup; GOES-17 in storage.', ru:'По состоянию на 3 сентября 2026: GOES-19 — GOES-East на 75,2° з. д.; GOES-18 — GOES-West на 137,0° з. д. с 4 января 2023; GOES-16 — в орбитальном резерве на 104,7° з. д.; GOES-17 — на хранении.'}},
  {title:'WTOP News, “Major NOAA satellite outage tested eastern US weather forecasting” (16 July 2026)', url:'https://wtop.com/weather-news/2026/07/noaa-weather-satellite-outage-highlights-how-much-forecasters-depend-on-space-based-data/', note:{en:'GOES-19 went into a protective safe mode, halting imagery for nearly a whole day before returning to service; the cause had not been announced.', ru:'GOES-19 перешёл в защитный режим и почти сутки не передавал снимки, затем вернулся к работе; причина не была объявлена.'}},
  {title:'Met Office, “Operational satellite a ‘landmark moment’ for weather forecasts” (4 December 2024)', url:'https://www.metoffice.gov.uk/blog/2024/operational-satellite-a-landmark-moment-for-weather-forecasts', note:{en:'MTG-I1, now Meteosat-12, operational: full disc every 10 minutes; up to 500 m on some channels, 1–2 km on others; the first lightning imager covering Europe and Africa.', ru:'MTG-I1, теперь «Метеосат-12», введён в строй: весь диск каждые 10 минут; до 500 м в некоторых каналах, 1–2 км в остальных; первый регистратор молний над Европой и Африкой.'}},
  {title:'WMO OSCAR/Space, “Meteosat-12”', url:'https://space.oscar.wmo.int/satellites/view/meteosat_12', note:{en:'Launched 13 December 2022; commissioning until 4 December 2024, when MTG-I1 became Meteosat-12; operational at 0.3° W; FCI and LI (page updated 19 March 2026).', ru:'Запуск 13 декабря 2022; ввод в строй до 4 декабря 2024 года, когда MTG-I1 стал «Метеосатом-12»; работает на 0,3° з. д.; FCI и LI (страница обновлена 19 марта 2026).'}},
  {title:'ESA, “MTG-S1 commissioned and in position for weather forecasting” (15 July 2026)', url:'https://www.esa.int/Applications/Observing_the_Earth/Meteorological_missions/meteosat_third_generation/MTG-S1_commissioned_and_in_position_for_weather_forecasting', note:{en:'Commissioning closed on 2 July 2026; handed over to EUMETSAT and moved from 3.4° W to 0°; the Infrared Sounder gives temperature and humidity profiles over Europe every 30 minutes; Sentinel-4 measures every hour; MTG-I2 to use 9.5° E for 150-second rapid scans of Europe.', ru:'Ввод в строй завершён 2 июля 2026; аппарат передан EUMETSAT и переведён с 3,4° з. д. на 0°; ИК-зондировщик даёт профили температуры и влажности над Европой каждые 30 минут; Sentinel-4 измеряет каждый час; MTG-I2 займёт точку 9,5° в. д. для быстрого сканирования Европы раз в 150 секунд.'}},
  {title:'ESA, “MTG-I2 is launched from Europe\'s Spaceport” (27 August 2026)', url:'https://www.esa.int/ESA_Multimedia/Images/2026/08/MTG-I2_is_launched_from_Europe_s_Spaceport', note:{en:'MTG-I2 lifted off on an Ariane 6 from French Guiana on 27 August 2026 at 22:10 CEST.', ru:'MTG-I2 стартовал на «Ариане-6» из Французской Гвианы 27 августа 2026 года в 22:10 CEST.'}},
  {title:'Japan Meteorological Agency, “Outline of Himawari-8/9”', url:'https://www.jma.go.jp/jma/jma-eng/satellite/himawari89.html', note:{en:'Himawari-8 entered operation on 7 July 2015; Himawari-9 launched 2 November 2016 and took over on 13 December 2022; AHI has 16 bands (3 visible, 3 near-infrared, 10 infrared), a full disk every 10 minutes, 0.5–1 km visible and 1–2 km infrared.', ru:'«Химавари-8» начал работу 7 июля 2015; «Химавари-9» запущен 2 ноября 2016 и стал основным 13 декабря 2022; у AHI 16 каналов (3 видимых, 3 ближних ИК, 10 ИК), весь диск каждые 10 минут, 0,5–1 км в видимом и 1–2 км в ИК.'}},
  {title:'WMO, “FENGYUN-4C meteorological satellite lifted off” (27 December 2025)', url:'https://wmo.int/node/38159', note:{en:'Launched at 0:07 on 27 December 2025 (Beijing time) from Xichang; will replace FY-4A and work with FY-4B in a dual-satellite arrangement with in-orbit backup.', ru:'Запуск 27 декабря 2025 года в 0:07 по пекинскому времени с космодрома Сичан; заменит FY-4A и будет работать вместе с FY-4B по схеме «два спутника и резерв на орбите».'}},
  {title:'NOAA NESDIS, “Joint Polar Satellite System”', url:'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system', note:{en:'Suomi NPP, NOAA-20 and NOAA-21 in orbit; ATMS, CrIS, VIIRS, OMPS; pole to pole 14 times a day, full global coverage twice daily; “the majority of data” for US forecasting; JPSS-4 (NOAA-22) next, launch readiness 2027.', ru:'На орбите Suomi NPP, NOAA-20 и NOAA-21; приборы ATMS, CrIS, VIIRS, OMPS; 14 витков от полюса к полюсу в сутки, полный охват Земли дважды в сутки; «большая часть данных» для прогнозов США; следующий — JPSS-4 (NOAA-22), готовность к запуску в 2027 году.'}},
  {title:'WMO OSCAR/Space, “NOAA-21”', url:'https://space.oscar.wmo.int/satellites/view/noaa_21', note:{en:'Launched 10 November 2022; operational; sun-synchronous, 824 km, 13:25 ascending; ATMS, CrIS, OMPS, VIIRS (page updated 24 August 2026).', ru:'Запуск 10 ноября 2022; работает; солнечно-синхронная орбита 824 км, восходящий узел в 13:25; ATMS, CrIS, OMPS, VIIRS (страница обновлена 24 августа 2026).'}},
  {title:'WMO OSCAR/Space, “VIIRS”', url:'https://space.oscar.wmo.int/instruments/view/viirs', note:{en:'22 channels; swath about 3,000 km; 375 m in five channels and the day/night band, 750 m in the others.', ru:'22 канала; полоса обзора около 3000 км; 375 м в пяти каналах и в канале «день/ночь», 750 м в остальных.'}},
  {title:'WMO OSCAR/Space, “Metop-SG-A1”; ESA, “First MetOp-SG satellite and Sentinel-5A launched”', url:'https://space.oscar.wmo.int/satellites/view/metop_sg_a1', note:{en:'Launched on Ariane 6 on 13 August 2025 (02:37 CEST); in commissioning; 835 km, 09:30 descending; IASI-NG, MWS microwave sounder, METimage, 3MI, radio occultation, Sentinel-5 (OSCAR, updated 24 August 2026). Six satellites in three A/B pairs (ESA).', ru:'Запуск на «Ариане-6» 13 августа 2025 (02:37 CEST); идёт ввод в строй; 835 км, нисходящий узел в 09:30; IASI-NG, микроволновый зондировщик MWS, METimage, 3MI, радиозатменный приёмник, Sentinel-5 (OSCAR, обновлено 24 августа 2026). Шесть спутников — три пары A/B (ЕКА).'}},
  {title:'C. Cardinali & S. Healy (2012), “Forecast sensitivity to observation error variance”, ECMWF Newsletter 133, 30–33', url:'https://www.ecmwf.int/sites/default/files/elibrary/2012/17416-forecast-sensitivity-observation-error-variance.pdf', note:{en:'June 2011 experiments with ECMWF 4D-Var: “The largest contribution in decreasing the forecast error is provided by AMSU-A radiances (~21%)”; atmospheric motion vectors from geostationary and other platforms add 6 %.', ru:'Эксперименты июня 2011 года с 4D-Var ЕЦСПП: «наибольший вклад в уменьшение ошибки прогноза дают яркости AMSU-A (~21 %)»; векторы движения облаков с геостационарных и других спутников добавляют 6 %.'}},
  {title:'NOAA AOML Hurricane Research Division, “What is the Dvorak technique?” (Tropical cyclone FAQ)', url:'https://www.aoml.noaa.gov/hrd/tcfaq/H1.html', note:{en:'Intensity estimates from satellite pictures; with infrared imagery of an eye, the scheme uses “the difference between the temperature of the warm eye and the surrounding cold cloud tops”: the larger the difference, the more intense the cyclone.', ru:'Оценка интенсивности по спутниковым снимкам; при наличии ИК-снимков глаза метод использует «разность между температурой тёплого глаза и окружающих холодных вершин облаков»: чем больше разность, тем интенсивнее циклон.'}},
  {title:'S. Lindstrom, T. Schmit, J. Gerth (2017), “ABI Band 15 (12.3 µm) Quick Guide”, UW–Madison CIMSS / NOAA', url:'https://goes.noaa.gov/documents/ABIQuickGuide_Band15.pdf', note:{en:'Water vapour cools 12.3 µm brightness temperatures more than 10.3 µm, “the more water vapor, the greater the BT difference”; the split window difference (10.3 − 12.3 µm) is positive in moist air and negative for dust and volcanic ash.', ru:'Водяной пар понижает яркостную температуру на 12,3 мкм сильнее, чем на 10,3 мкм, — «чем больше водяного пара, тем больше разность»; разность расщеплённого окна (10,3 − 12,3 мкм) положительна во влажном воздухе и отрицательна для пыли и вулканического пепла.'}},
  {title:'NASA Glenn Research Center, “Earth Atmosphere Model — Metric Units”', url:'https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html', note:{en:'Troposphere, surface to 11,000 m: T = 15.04 − 0.00649 h (°C, h in metres).', ru:'Тропосфера от поверхности до 11 000 м: T = 15,04 − 0,00649 h (°C, h в метрах).'}},
  {title:'NOAA OSPO, “Beginner\'s Guide to GOES-R Series Data”', url:'https://www.ospo.noaa.gov/resources/documents/PDFs/Beginners_Guide_to_GOES-R_Series_Data.pdf', note:{en:'ABI L1b data sit on a fixed grid of east–west scan and north–south elevation angles in radians from the satellite, rectified to the GRS80 ellipsoid; full equations in the Product User\'s Guide, Vol. 3.', ru:'Данные ABI уровня 1b заданы на фиксированной сетке углов сканирования (восток–запад) и возвышения (север–юг) в радианах относительно спутника и привязаны к эллипсоиду GRS80; полные формулы — в руководстве пользователя продуктов, т. 3.'}},
  {title:'CIRA / RAMMB, “GOES-R AWG Proxy Data — Fire Weather”', url:'https://rammb.cira.colostate.edu/research/goes-r/awg_proxy_data/fire_weather.asp', note:{en:'Simulated ABI imagery over Kansas at approximately 2.4 × 3.2 km pixels (2 × 2 km at the sub-satellite point), with the satellite at 75° W.', ru:'Смоделированные снимки ABI над Канзасом с пикселями примерно 2,4 × 3,2 км (2 × 2 км в подспутниковой точке) при положении спутника на 75° з. д.'}},
  {title:'NIST, “Fundamental Physical Constants”', url:'https://physics.nist.gov/cuu/Constants/index.html', note:{en:'Exact SI values of h, c and k, from which c₁ = 2hc² and c₂ = hc/k; Stefan–Boltzmann constant σ = 5.670374419 × 10⁻⁸ W m⁻² K⁻⁴.', ru:'Точные значения h, c и k в СИ, из которых c₁ = 2hc² и c₂ = hc/k; постоянная Стефана–Больцмана σ = 5,670374419 × 10⁻⁸ Вт·м⁻²·К⁻⁴.'}},
  {title:'ESA, “MTG-S1 and Sentinel-4 launch to change how we see our atmosphere” (1 July 2025)', url:'https://www.esa.int/Newsroom/Press_Releases/MTG-S1_and_Sentinel-4_launch_to_change_how_we_see_our_atmosphere', note:{en:'Launched on a Falcon 9 from Cape Canaveral on 1 July 2025 at 23:04 CEST; the Infrared Sounder is the first European hyperspectral sounder in geostationary orbit; Sentinel-4 is an ultraviolet–visible–near-infrared imaging spectrometer for air quality.', ru:'Запуск на Falcon 9 с мыса Канаверал 1 июля 2025 года в 23:04 CEST; ИК-зондировщик — первый европейский гиперспектральный зондировщик на геостационарной орбите; Sentinel-4 — спектрометр ультрафиолетового, видимого и ближнего ИК-диапазонов для контроля качества воздуха.'}},
  {title:'NASA, “GOES Satellite Network”', url:'https://science.nasa.gov/?p=41319', note:{en:'The GOES-R series: GOES-16 launched November 2016, GOES-17 March 2018, GOES-18 March 2022, GOES-19 (GOES-U) June 2024, the last of the series; NASA builds and launches them, NOAA operates them.', ru:'Серия GOES-R: GOES-16 запущен в ноябре 2016, GOES-17 — в марте 2018, GOES-18 — в марте 2022, GOES-19 (GOES-U) — в июне 2024, последний в серии; NASA строит и запускает, NOAA эксплуатирует.'}},
  {title:'ESA, “MetOp-SG-B1 weather satellite arrives at Europe\'s Spaceport” (20 October 2026)', url:'https://www.esa.int/Applications/Observing_the_Earth/Meteorological_missions/MetOp_Second_Generation/MetOp-SG-B1_weather_satellite_arrives_at_Europe_s_Spaceport', note:{en:'Arrived on 16 October 2026 for an Ariane 6 launch “expected at the end of the year”; carries a scatterometer, a microwave imager and an ice cloud imager.', ru:'Прибыл 16 октября 2026 года для запуска на «Ариане-6», «ожидаемого в конце года»; несёт скаттерометр, микроволновый сканирующий радиометр и радиометр ледяных облаков.'}},
  {title:'NOAA, GOES-19 ABI Level 1b radiance file, band 13, mesoscale sector 1, 17 October 2026 12:00 UTC (NOAA Open Data Dissemination on AWS)', url:'https://noaa-goes19.s3.amazonaws.com/ABI-L1b-RadM/2026/290/12/OR_ABI-L1b-RadM1-M6C13_G19_s20262901200282_e20262901200351_c20262901200388.nc', note:{en:'Header read by the review panel: x and y scale_factor 5.6 × 10⁻⁵ rad (bands 1 and 2: 2.8 × 10⁻⁵ and 1.4 × 10⁻⁵); goes_imager_projection longitude_of_projection_origin −75.0°, perspective_point_height 35,786,023 m, semi-axes 6,378,137 and 6,356,752.31414 m (GRS80); nominal_satellite_subpoint_lon −75.2°.', ru:'Заголовок, прочитанный рецензентами: scale_factor по x и y — 5,6 × 10⁻⁵ рад (каналы 1 и 2 — 2,8 × 10⁻⁵ и 1,4 × 10⁻⁵); в goes_imager_projection долгота начала проекции −75,0°, высота точки перспективы 35 786 023 м, полуоси 6 378 137 и 6 356 752,31414 м (GRS80); номинальная подспутниковая долгота −75,2°.'}},
  {title:'NOAA NESDIS, “Advanced Technology Microwave Sounder (ATMS)”', url:'https://www.nesdis.noaa.gov/our-satellites/currently-flying/joint-polar-satellite-system/advanced-technology-microwave-sounder-atms', note:{en:'“ATMS observes Earth in the microwave portion of the electromagnetic spectrum, which allows it to see through clouds”; it “provides a view inside and below clouds and can be used to produce images inside storms, including hurricanes”; all-weather temperature and moisture data for three-dimensional profiles.', ru:'«ATMS наблюдает Землю в микроволновой части спектра, что позволяет ему видеть сквозь облака»; он «даёт вид внутрь облаков и под них и может использоваться для получения изображений внутри штормов, в том числе ураганов»; всепогодные данные о температуре и влажности для трёхмерных профилей.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderCV(); renderPX(); renderBT();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__forecast = {geoRadius:geoRadius, R_GEO:R_GEO, H_GEO:H_GEO, R_EQ:R_EQ, geoView:geoView, horizonPsi:horizonPsi, capFraction:capFraction,
  visibleFraction:visibleFraction, psiForZenith:psiForZenith, nsStretch:nsStretch, circPeriodMin:circPeriodMin, orbitsPerDay:orbitsPerDay,
  trackShiftDeg:trackShiftDeg, polarLooksPerDay:polarLooksPerDay, llToXY:llToXY, xyToLL:xyToLL, footprint:footprint, ifovFor:ifovFor, abiStep:abiStep, gsd:gsd,
  planckNu:planckNu, brightnessT:brightnessT, NU13:NU13, NU15:NU15, stdT:stdT, heightFromT:heightFromT, pixelBT:pixelBT, sbIntegral:sbIntegral,
  SIGMA:SIGMA, GOES_EAST:GOES_EAST, NOAA21_H:NOAA21_H, VIIRS_SWATH:VIIRS_SWATH, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
