/* ============ CONSTANTS ============ */
var GM = 398600.4418;                 // km³/s², IERS conventions [16]
var OMEGA_E = 7.292115e-5;            // rad/s, Earth's rotation rate, IERS [16]
var RE = 6378.137, F_E = 1/298.257223563;   // equatorial radius [17], WGS84 flattening
var J2 = 1.08263e-3;                  // NASA Earth fact sheet [17]
var C_KMS = 299792.458, D2R = Math.PI/180;
var SID = 2*Math.PI/OMEGA_E;          // one sidereal day (stellar), s
function periodS(a){ return 2*Math.PI*Math.sqrt(a*a*a/GM); }
function aForPeriod(T){ return Math.cbrt(GM*Math.pow(T/(2*Math.PI), 2)); }
var R_GEO = aForPeriod(SID), H_GEO = R_GEO - RE;
function circV(r){ return Math.sqrt(GM/r); }
/* change in the longitude below a circular equatorial orbit per 24 h, degrees; + = eastward */
function driftDegDay(r){ return (Math.sqrt(GM/(r*r*r)) - OMEGA_E)/D2R*86400; }
/* in Russian, four-digit numbers stay unspaced, as in the body text */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function deg(v, d){ return fmt(v, d) + '°'; }
function km(v){ return num(Math.round(v)) + T(' km',' км'); }
function hms(s){
  var h = Math.floor(s/3600), m = Math.floor((s - h*3600)/60), sec = Math.round(s - h*3600 - m*60);
  if(sec === 60){ sec = 0; m++; } if(m === 60){ m = 0; h++; }
  return (h ? h + T(' h ',' ч ') : '') + m + T(' min ',' мин ') + sec + T(' s',' с');
}
/* Russian plural for years: 1 год, 2 года, 5 лет */
function yearsWord(n){ if(lang !== 'ru') return n === 1 ? ' year' : ' years'; var a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? ' год' : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? ' года' : ' лет'; }
function hm(min){ var m = ((Math.round(min) % 1440) + 1440) % 1440, h = Math.floor(m/60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }

/* ============ ORBIT MACHINERY ============ */
/* Kepler's equation by Newton's method from E = π (converges for every e < 1) */
function kepler(M, e){
  M = ((M % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  var E = Math.PI;
  for(var k = 0; k < 60; k++){ var dE = (E - e*Math.sin(E) - M)/(1 - e*Math.cos(E)); E -= dE; if(Math.abs(dE) < 1e-13) break; }
  return E;
}
/* mean elements → Earth-centred inertial position (km) at time tMs, with J₂ secular drift of node and perigee */
function rates(a, e, iDeg){
  var n = Math.sqrt(GM/(a*a*a)), p = a*(1 - e*e), k = n*J2*(RE/p)*(RE/p), ci = Math.cos(iDeg*D2R);
  return {n:n, dO:-1.5*k*ci, dw:0.75*k*(5*ci*ci - 1)};            // rad/s
}
function eciAt(el, tMs){
  var dt = (tMs - el.t0)/1000, r = rates(el.a, el.e, el.i);
  var O = el.O*D2R + r.dO*dt, w = el.w*D2R + r.dw*dt, M = el.M*D2R + el.n*dt, i = el.i*D2R;
  var E = kepler(M, el.e), xp = el.a*(Math.cos(E) - el.e), yp = el.a*Math.sqrt(1 - el.e*el.e)*Math.sin(E);
  var cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  return [(cO*cw - sO*sw*ci)*xp + (-cO*sw - sO*cw*ci)*yp, (sO*cw + cO*sw*ci)*xp + (-sO*sw + cO*cw*ci)*yp, sw*si*xp + cw*si*yp];
}
function gmst(tMs){ var d = tMs/864e5 + 2440587.5 - 2451545.0; return (((280.46061837 + 360.98564736629*d) % 360) + 360) % 360*D2R; }
function toEcef(r, tMs){ var g = gmst(tMs), c = Math.cos(g), s = Math.sin(g); return [r[0]*c + r[1]*s, -r[0]*s + r[1]*c, r[2]]; }
function station(latDeg, lonDeg){
  var e2 = F_E*(2 - F_E), la = latDeg*D2R, lo = lonDeg*D2R, N = RE/Math.sqrt(1 - e2*Math.sin(la)*Math.sin(la));
  return {p:[N*Math.cos(la)*Math.cos(lo), N*Math.cos(la)*Math.sin(lo), N*(1 - e2)*Math.sin(la)], u:[Math.cos(la)*Math.cos(lo), Math.cos(la)*Math.sin(lo), Math.sin(la)]};
}
function elevDeg(sat, st){
  var d = [sat[0] - st.p[0], sat[1] - st.p[1], sat[2] - st.p[2]], dn = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);
  return Math.asin((d[0]*st.u[0] + d[1]*st.u[1] + d[2]*st.u[2])/dn)/D2R;
}
function subPoint(r){ return [Math.atan2(r[2], Math.sqrt(r[0]*r[0] + r[1]*r[1]))/D2R, Math.atan2(r[1], r[0])/D2R]; }
function norm(r){ return Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]); }

/* Telstar 1 (NORAD 340), CelesTrak elements, epoch 2026 day 294.50630661 UTC [21] */
var TELSTAR_TLE = {n:9.12893360, e:0.2425019, i:44.7918, O:84.9629, w:33.3692, M:8.5932, t0:Date.UTC(2026, 0, 1) + 293.50630661*864e5};
function fromTle(o){ var n = o.n*2*Math.PI/86400; return {a:Math.cbrt(GM/(n*n)), e:o.e, i:o.i, O:o.O, w:o.w, M:o.M, n:n, t0:o.t0}; }
var TELSTAR = fromTle(TELSTAR_TLE);
var DAY0 = Date.UTC(2026, 9, 22);                                  // 22 October 2026, 00:00 UTC
var ANDOVER = station(44.633, -70.700), PLEUMEUR = station(48.786, -3.524);
var GEO_LON = -28;                                                  // Early Bird's planned slot [10]
function geoEcef(lonDeg){ return [R_GEO*Math.cos(lonDeg*D2R), R_GEO*Math.sin(lonDeg*D2R), 0]; }
function dayTrack(mode){
  var out = [];
  for(var m = 0; m <= 1440; m++){
    var t = DAY0 + m*60000, r = mode === 'geo' ? geoEcef(GEO_LON) : toEcef(eciAt(TELSTAR, t), t);
    out.push({m:m, r:r, alt:norm(r) - RE, ll:subPoint(r), a:elevDeg(r, ANDOVER), p:elevDeg(r, PLEUMEUR)});
  }
  return out;
}
/* [start, end) minute windows where f(sample) > 0 */
function windows(track, f){
  var out = [], s = null;
  track.forEach(function(x, k){ var on = f(x) > 0; if(on && s === null) s = k; if(!on && s !== null){ out.push([s, k]); s = null; } });
  if(s !== null) out.push([s, track.length - 1]);
  return out;
}
var TRACKS = {telstar:dayTrack('telstar'), geo:dayTrack('geo')};
function passInfo(mode){
  var tr = TRACKS[mode];
  return {and:windows(tr, function(x){ return x.a; }), ple:windows(tr, function(x){ return x.p; }), both:windows(tr, function(x){ return Math.min(x.a, x.p); })};
}
var PASSES = {telstar:passInfo('telstar'), geo:passInfo('geo')};

/* ============ CH1 ============ */
document.getElementById('eqA').textContent = fmtInt(Math.floor(R_GEO)) + (lang === 'ru' ? ',' : '.') + Math.round((R_GEO % 1)*10);

/* ============ CH2 — PERIOD VS ALTITUDE ============ */
var MARKS = [
  {h:(1524 + 1684)/2, en:'Echo 1', ru:'«Эхо-1»'},
  {h:(954 + 5637)/2, en:'Telstar', ru:'«Телстар»'},
  {h:(1322 + 7439)/2, en:'Relay 1', ru:'«Релей-1»'},
  {h:aForPeriod(SID/2) - RE, en:'Molniya', ru:'«Молния»'},
  {h:H_GEO, en:'GEO', ru:'ГСО'}
];
var pdH = document.getElementById('pdH');
pdH.value = Math.log10(H_GEO);                                    /* exact GEO, not the step-rounded attribute */
function renderPD(){
  var h = Math.pow(10, +pdH.value), r = RE + h, Ts = periodS(r), dr = driftDegDay(r);
  document.getElementById('pdHVal').textContent = km(h); pdH.setAttribute('aria-valuetext', km(h) + ', ' + hms(Ts));
  var svg = document.getElementById('pdSvg'); svg.innerHTML = ''; aria(svg);
  var L = 56, R = 465, Tp = 24, B = 252, xa = 2.2, xb = 5, ya = 0, yb = 2;
  function X(hh){ return L + (Math.log10(hh) - xa)/(xb - xa)*(R - L); } function Y(th){ return B - (Math.log10(th) - ya)/(yb - ya)*(B - Tp); }
  [1, 2, 5, 10, 20, 50, 100].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, v + T(' h',' ч'), 'svg-small', 'end'); });
  [[200,'200'],[1000,'1,000'],[10000,'10,000'],[100000,'100,000']].forEach(function(p){ ns('line', {x1:X(p[0]), y1:B, x2:X(p[0]), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(p[0]), B + 16, num(p[0]), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('period (log)','период (лог.)'), 'svg-small');
  txt(svg, R, B + 34, T('altitude, km (log)','высота, км (лог.)'), 'svg-small', 'end');
  var yS = Y(SID/3600);
  ns('line', {x1:L, y1:yS, x2:R, y2:yS, stroke:'#b5452a', 'stroke-dasharray':'5 4', 'stroke-width':1.3}, svg);
  txt(svg, L + 4, yS - 6, T('one sidereal day, 23 h 56 min 4 s','одни звёздные сутки, 23 ч 56 мин 4 с'), 'svg-small svg-halo');
  var d = '';
  for(var k = 0; k <= 160; k++){ var hh = Math.pow(10, xa + (xb - xa)*k/160); d += (k ? 'L' : 'M') + X(hh).toFixed(1) + ',' + Y(periodS(RE + hh)/3600).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  MARKS.forEach(function(mk, j){
    var x = X(mk.h), y = Y(periodS(RE + mk.h)/3600);
    ns('circle', {cx:x, cy:y, r:4, fill:'#2f5aa1'}, svg);
    txt(svg, x + (j === 4 ? -8 : 7), y + (j % 2 ? 14 : -7), T(mk.en, mk.ru), 'svg-small svg-halo', j === 4 ? 'end' : 'start');
  });
  ns('circle', {cx:X(h), cy:Y(Ts/3600), r:6.5, fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  var ow = 2*h/C_KMS*1000;
  cells(document.getElementById('pdReadout'), [
    [T('PERIOD','ПЕРИОД'), hms(Ts)],
    [T('SPEED (CIRCULAR)','СКОРОСТЬ (КРУГОВАЯ)'), fmt(circV(r), 3) + T(' km/s',' км/с')],
    [T('DRIFT OVER THE GROUND','СМЕЩЕНИЕ НАД ЗЕМЛЁЙ'), Math.abs(dr) < 0.05 ? T('none','нет') : fmt(Math.abs(dr), Math.abs(dr) < 10 ? 2 : 0) + T('° a day ','° в сутки ') + (dr > 0 ? T('east','к востоку') : T('west','к западу'))],
    [T('LIGHT TIME, UP AND DOWN','СВЕТ ТУДА И ОБРАТНО'), fmt(ow, ow < 10 ? 1 : 0) + T(' ms',' мс')]
  ]);
  hud1.textContent = km(h); hud2.textContent = hms(Ts);
  var st = document.getElementById('pdStatus');
  if(Math.abs(Ts - SID) < 30) st.innerHTML = T('Geosynchronous: one lap per turn of the Earth. Over the equator this satellite would hang over one longitude — Clarke\'s relay, Syncom 3\'s orbit.','Геосинхронная орбита: один виток за оборот Земли. Над экватором такой спутник висел бы над одной долготой — ретранслятор Кларка, орбита «Синкома-3».');
  else if(dr > 0) st.innerHTML = T('Faster than the Earth turns: the satellite gains ','Быстрее вращения Земли: спутник уходит на ') + fmt(dr, dr < 10 ? 1 : 0) + T('° a day on the ground below. A station sees it rise, cross and set — ','° в сутки вперёд над Землёй. Станция видит, как он восходит, проходит по небу и заходит, — ') + fmt(86400/Ts, 1) + T(' laps every 24 hours.',' витка за 24 часа.');
  else st.innerHTML = T('Slower than the Earth turns: the satellite falls behind and drifts ','Медленнее вращения Земли: спутник отстаёт и смещается на ') + fmt(-dr, -dr < 10 ? 1 : 0) + T('° a day westward.','° в сутки к западу.');
}
pdH.addEventListener('input', function(){ pressGroup(document.getElementById('pdPre'), null); renderPD(); });
Array.prototype.forEach.call(document.querySelectorAll('#pdPre .btn'), function(btn){ btn.addEventListener('click', function(){ pdH.value = Math.log10(+this.getAttribute('data-h')); pressGroup(this.parentNode, this); renderPD(); }); });

/* ============ CH3 — TELSTAR VS GEO ============ */
var tsT = document.getElementById('tsT'), tsMode = 'telstar', tsPlaying = false;
function mapXY(L, R, Tp, B){ return {X:function(lon){ return L + (lon + 180)/360*(R - L); }, Y:function(lat){ return Tp + (90 - lat)/180*(B - Tp); }}; }
function drawGraticule(svg, P, L, R, Tp, B){
  ns('rect', {x:L, y:Tp, width:R - L, height:B - Tp, fill:'#f3f5f7', stroke:'#0b0b0c', 'stroke-width':0.8}, svg);
  for(var lo = -150; lo <= 150; lo += 30) ns('line', {x1:P.X(lo), y1:Tp, x2:P.X(lo), y2:B, stroke:'#dfe3e6'}, svg);
  [-60, -30, 30, 60].forEach(function(la){ ns('line', {x1:L, y1:P.Y(la), x2:R, y2:P.Y(la), stroke:'#dfe3e6'}, svg); });
  ns('line', {x1:L, y1:P.Y(0), x2:R, y2:P.Y(0), stroke:'#9aa3aa', 'stroke-dasharray':'3 3'}, svg);
  [-60, -30, 0, 30, 60].forEach(function(la){ txt(svg, L - 4, P.Y(la) + 4, (la > 0 ? la + '°N' : la < 0 ? -la + '°S' : '0°').replace('N', T('N','с')).replace('S', T('S','ю')), 'svg-tiny', 'end'); });
}
function trackPath(pts, P){                                         /* breaks at the date line */
  var d = '', prev = null;
  pts.forEach(function(ll){ var x = P.X(ll[1]), y = P.Y(ll[0]); d += (prev === null || Math.abs(ll[1] - prev) > 180 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1); prev = ll[1]; });
  return d;
}
function renderTS(){
  var m = +tsT.value, tr = TRACKS[tsMode], ps = PASSES[tsMode], cur = tr[Math.min(1440, Math.max(0, Math.round(m)))];
  document.getElementById('tsTVal').textContent = hm(m) + ' UTC';
  tsT.setAttribute('aria-valuetext', hm(m) + ' UTC, ' + (tsMode === 'geo' ? T('geostationary satellite elevation: Andover ','угол места геостационарного спутника: Андовер ') : T('Telstar elevation: Andover ','угол места «Телстара»: Андовер ')) + (cur.a > 0 ? deg(cur.a, 1) : T('below horizon','под горизонтом')) + T(', Pleumeur-Bodou ',', Плёмёр-Боду ') + (cur.p > 0 ? deg(cur.p, 1) : T('below horizon','под горизонтом')));
  /* map */
  var svg = document.getElementById('tsMap'); svg.innerHTML = ''; aria(svg);
  var L = 30, R = 470, Tp = 10, B = 230, P = mapXY(L, R, Tp, B);
  drawGraticule(svg, P, L, R, Tp, B);
  if(tsMode === 'telstar'){
    ns('path', {d:trackPath(tr.map(function(x){ return x.ll; }), P), fill:'none', stroke:'#8f8f88', 'stroke-width':1}, svg);
    var seg = tr.slice(Math.max(0, Math.round(m) - 15), Math.min(1441, Math.round(m) + 1)).map(function(x){ return x.ll; });
    ns('path', {d:trackPath(seg, P), fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  }
  [[ANDOVER, 44.633, -70.7, T('ANDOVER','АНДОВЕР'), '#2f5aa1', 'end'], [PLEUMEUR, 48.786, -3.524, T('PLEUMEUR-BODOU','ПЛЁМЁР-БОДУ'), '#b5452a', 'start']].forEach(function(s){
    ns('rect', {x:P.X(s[2]) - 4, y:P.Y(s[1]) - 4, width:8, height:8, fill:s[4]}, svg);
    txt(svg, P.X(s[2]) + (s[5] === 'end' ? -7 : 7), P.Y(s[1]) - 6, s[3], 'svg-small svg-halo', s[5]);
  });
  ns('circle', {cx:P.X(cur.ll[1]), cy:P.Y(cur.ll[0]), r:6, fill:'#0b0b0c', stroke:'#fff', 'stroke-width':2}, svg);
  txt(svg, R - 4, B + 15, T('ground track over 24 h; red: the last 15 minutes','трасса за 24 ч; красным — последние 15 минут'), 'svg-tiny', 'end');
  /* elevation chart */
  var es = document.getElementById('tsEl'); es.innerHTML = ''; aria(es);
  var l2 = 44, r2 = 470, t2 = 14, b2 = 156;
  function X(mm){ return l2 + mm/1440*(r2 - l2); } function Y(el){ return b2 - Math.max(0, el)/90*(b2 - t2); }
  ps.both.forEach(function(w){ ns('rect', {x:X(w[0]), y:t2, width:Math.max(1.5, X(w[1]) - X(w[0])), height:b2 - t2, fill:'#f3e3dd'}, es); });
  [0, 30, 60, 90].forEach(function(v){ ns('line', {x1:l2, y1:Y(v), x2:r2, y2:Y(v), stroke:'#e4e4de'}, es); txt(es, l2 - 5, Y(v) + 4, v + '°', 'svg-small', 'end'); });
  for(var hh = 0; hh <= 24; hh += 6){ ns('line', {x1:X(hh*60), y1:b2, x2:X(hh*60), y2:b2 + 4, stroke:'#0b0b0c'}, es); txt(es, X(hh*60), b2 + 16, (hh < 10 ? '0' : '') + hh + ':00', 'svg-small', 'middle'); }
  ns('line', {x1:l2, y1:b2, x2:r2, y2:b2, stroke:'#0b0b0c'}, es);
  txt(es, l2, 10, T('elevation above the horizon','угол места над горизонтом'), 'svg-small');
  [['a', '#2f5aa1'], ['p', '#b5452a']].forEach(function(c){
    var d = '', on = false;
    tr.forEach(function(x){ if(x[c[0]] > 0){ d += (on ? 'L' : 'M') + X(x.m).toFixed(1) + ',' + Y(x[c[0]]).toFixed(1); on = true; } else on = false; });
    ns('path', {d:d, fill:'none', stroke:c[1], 'stroke-width':1.8}, es);
  });
  ns('line', {x1:X(m), y1:t2, x2:X(m), y2:b2, stroke:'#0b0b0c', 'stroke-width':1.2}, es);
  txt(es, r2, b2 + 32, T('blue: Andover · red: Pleumeur-Bodou · shaded: both see it','синий: Андовер · красный: Плёмёр-Боду · закрашено: видят обе'), 'svg-tiny', 'end');
  /* readouts */
  function elStr(e){ return e > 0 ? deg(e, 1) : T('below horizon','под горизонтом'); }
  function lens(ws){ return ws.map(function(w){ return w[1] - w[0]; }); }
  var la = lens(ps.and), lb = lens(ps.both), geo = tsMode === 'geo';
  cells(document.getElementById('tsReadout'), [
    [T('SATELLITE ALTITUDE','ВЫСОТА СПУТНИКА'), km(cur.alt)],
    [T('RANGE FROM ANDOVER','ДАЛЬНОСТЬ ОТ АНДОВЕРА'), km(norm([cur.r[0] - ANDOVER.p[0], cur.r[1] - ANDOVER.p[1], cur.r[2] - ANDOVER.p[2]]))],
    [T('ELEVATION AT ANDOVER','УГОЛ МЕСТА В АНДОВЕРЕ'), elStr(cur.a)],
    [T('ELEVATION AT PLEUMEUR-BODOU','УГОЛ МЕСТА В ПЛЁМЁР-БОДУ'), elStr(cur.p)],
    [T('PASSES OVER ANDOVER TODAY','ПРОЛЁТОВ НАД АНДОВЕРОМ ЗА СУТКИ'), geo ? T('always in view','виден всегда') : la.length + ' · ' + Math.min.apply(null, la) + '–' + Math.max.apply(null, la) + T(' min',' мин')],
    [T('SHARED WINDOWS TODAY','ОБЩИХ ОКОН ЗА СУТКИ'), geo ? T('24 hours','24 часа') : lb.length + T(', longest ',', самое длинное ') + Math.max.apply(null, lb) + T(' min',' мин')]
  ]);
  hud1.textContent = km(cur.alt); hud2.textContent = geo ? hms(SID) : hms(periodS(TELSTAR.a));
  var st = document.getElementById('tsStatus');
  if(geo){ st.innerHTML = T('A dish at Andover points ','Антенна в Андовере смотрит на ') + deg(cur.a, 1) + T(' above the horizon, the one at Pleumeur-Bodou ',' над горизонтом, в Плёмёр-Боду — на ') + deg(cur.p, 1) + T(' — all day, every day. No tracking, no waiting: this is what Early Bird gave the Atlantic in 1965.',' — весь день, каждый день. Ни слежения, ни ожидания: это и дал Атлантике «Эрли Бёрд» в 1965 году.'); return; }
  var inBoth = null; ps.both.forEach(function(w){ if(m >= w[0] && m < w[1]) inBoth = w; });
  if(inBoth) st.innerHTML = T('Both stations see Telstar: a live picture can cross the Atlantic for another ','Обе станции видят «Телстар»: прямая картинка может пересекать Атлантику ещё ') + (inBoth[1] - Math.round(m)) + T(' min (window ',' мин (окно ') + hm(inBoth[0]) + '–' + hm(inBoth[1]) + ').';
  else {
    var nx = nextWindow(m);
    st.innerHTML = (cur.a > 0 ? T('Only Andover sees Telstar now. ','Сейчас «Телстар» видит только Андовер. ') : cur.p > 0 ? T('Only Pleumeur-Bodou sees Telstar now. ','Сейчас «Телстар» видит только Плёмёр-Боду. ') : T('Neither station sees Telstar. ','Ни одна станция не видит «Телстар». ')) +
      (nx ? T('Next shared window: ','Следующее общее окно: ') + hm(nx[0]) + '–' + hm(nx[1]) + ' UTC.' : T('No more shared windows today.','Общих окон сегодня больше нет.'));
  }
}
function nextWindow(m){ var ws = PASSES[tsMode].both, r = null; ws.forEach(function(w){ if(!r && w[0] > m) r = w; }); return r; }
tsT.addEventListener('input', renderTS);
Array.prototype.forEach.call(document.querySelectorAll('#tsSat .btn'), function(btn){ btn.addEventListener('click', function(){ tsMode = this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderTS(); }); });
var tsPlay = document.getElementById('tsPlay');
function setPlay(on){ tsPlaying = on; tsPlay.setAttribute('aria-pressed', on ? 'true' : 'false'); tsPlay.classList.toggle('active', on); tsPlay.innerHTML = on ? T('❚❚ PAUSE','❚❚ ПАУЗА') : T('▶ PLAY','▶ ПУСК'); }
tsPlay.addEventListener('click', function(){
  if(reduced()){ tsT.value = (+tsT.value + 15) % 1440; renderTS(); return; }    /* reduced motion: step 15 minutes per press */
  setPlay(!tsPlaying);
});
document.getElementById('tsNext').addEventListener('click', function(){
  var w = nextWindow(+tsT.value) || PASSES[tsMode].both[0];
  if(tsMode === 'geo') return;
  if(w){ tsT.value = w[0]; renderTS(); }
});
visibleLoop(document.getElementById('tsMap'), function(dt){ if(!tsPlaying) return; tsT.value = (+tsT.value + dt*20) % 1440; renderTS(); });

/* ============ CH4 — FIGURE EIGHT ============ */
var f8I = document.getElementById('f8I');
/* ground track of a circular orbit with a period of exactly one sidereal day: [lat, lon offset] in degrees */
function f8Point(iDeg, u){ var i = iDeg*D2R, lat = Math.asin(Math.sin(i)*Math.sin(u)), lon = Math.atan2(Math.cos(i)*Math.sin(u), Math.cos(u)) - u; lon = Math.atan2(Math.sin(lon), Math.cos(lon)); return [lat/D2R, lon/D2R]; }
function f8Swing(iDeg){ var mx = 0; for(var k = 0; k < 720; k++){ mx = Math.max(mx, Math.abs(f8Point(iDeg, k/720*2*Math.PI)[1])); } return mx; }
/* largest angle between the satellite and the zenith of the equator point under its mean position */
function f8Zenith(iDeg){
  var mx = 0;
  for(var k = 0; k < 720; k++){
    var p = f8Point(iDeg, k/720*2*Math.PI), la = p[0]*D2R, lo = p[1]*D2R;
    var s = [R_GEO*Math.cos(la)*Math.cos(lo) - RE, R_GEO*Math.cos(la)*Math.sin(lo), R_GEO*Math.sin(la)];
    mx = Math.max(mx, Math.acos(s[0]/norm(s))/D2R);
  }
  return mx;
}
var DRIFT_AMP = 14.6, DRIFT_YEARS = 53;                             // [18]: up to ~14.5–15° over ~53 years
function driftIncl(years){ return DRIFT_AMP*Math.abs(Math.sin(Math.PI*years/DRIFT_YEARS)); }
function yearsToIncl(iDeg){ return iDeg > DRIFT_AMP ? null : DRIFT_YEARS/Math.PI*Math.asin(iDeg/DRIFT_AMP); }
function renderF8(){
  var iD = +f8I.value, sw = f8Swing(iD), zen = f8Zenith(iD), yrs = yearsToIncl(iD);
  document.getElementById('f8IVal').textContent = deg(iD, 2); f8I.setAttribute('aria-valuetext', deg(iD, 2) + ', ' + T('east–west swing ±','качание восток–запад ±') + deg(sw, 2));
  var svg = document.getElementById('f8Svg'); svg.innerHTML = ''; aria(svg);
  var L = 70, R = 450, Tp = 20, B = 284, LON = 6, LAT = 40;
  function X(lo){ return (L + R)/2 + lo/LON*(R - L)/2; } function Y(la){ return (Tp + B)/2 - la/LAT*(B - Tp)/2; }
  ns('rect', {x:L, y:Tp, width:R - L, height:B - Tp, fill:'#f3f5f7', stroke:'#0b0b0c', 'stroke-width':0.8}, svg);
  [-30, -20, -10, 10, 20, 30].forEach(function(la){ ns('line', {x1:L, y1:Y(la), x2:R, y2:Y(la), stroke:'#dfe3e6'}, svg); txt(svg, L - 5, Y(la) + 4, Math.abs(la) + '°' + (la > 0 ? T('N','с') : T('S','ю')), 'svg-small', 'end'); });
  [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].forEach(function(lo){ ns('line', {x1:X(lo), y1:Tp, x2:X(lo), y2:B, stroke:'#dfe3e6'}, svg); txt(svg, X(lo), B + 15, (lo > 0 ? '+' : '−') + Math.abs(lo) + '°', 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:Y(0), x2:R, y2:Y(0), stroke:'#9aa3aa', 'stroke-dasharray':'3 3'}, svg); txt(svg, L - 5, Y(0) + 4, '0°', 'svg-small', 'end');
  ns('line', {x1:X(0), y1:Tp, x2:X(0), y2:B, stroke:'#9aa3aa', 'stroke-dasharray':'3 3'}, svg);
  var d = '';
  for(var k = 0; k <= 360; k++){ var p = f8Point(iD, k/360*2*Math.PI); d += (k ? 'L' : 'M') + X(p[1]).toFixed(1) + ',' + Y(p[0]).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  for(var hh = 0; hh < 24; hh++){ var q = f8Point(iD, hh/24*2*Math.PI); ns('circle', {cx:X(q[1]), cy:Y(q[0]), r:hh % 6 ? 2.2 : 3.6, fill:'#2f5aa1'}, svg); }
  var stretch = ((R - L)/2/LON)/((B - Tp)/2/LAT);
  txt(svg, R, 12, T('east–west stretched ×','восток–запад растянуто ×') + fmt(stretch, 1) + T(' · dots every hour',' · точки через час'), 'svg-tiny', 'end');
  txt(svg, (L + R)/2, B + 30, T('longitude from the mean position','долгота от среднего положения'), 'svg-small', 'middle');
  cells(document.getElementById('f8Readout'), [
    [T('NORTH–SOUTH SWING','КАЧАНИЕ СЕВЕР–ЮГ'), '±' + deg(iD, 2)],
    [T('EAST–WEST SWING','КАЧАНИЕ ВОСТОК–ЗАПАД'), '±' + deg(sw, sw < 0.01 ? 4 : 2)],
    [T('SEEN FROM BELOW: SWING FROM ZENITH','ВИДНО СНИЗУ: ОТКЛОНЕНИЕ ОТ ЗЕНИТА'), '±' + deg(zen, 1)],
    [T('A DEAD SATELLITE DRIFTS TO THIS IN','БРОШЕННЫЙ СПУТНИК ДРЕЙФУЕТ ДО ЭТОГО ЗА'), yrs === null ? T('never (cycle tops out at ~15°)','никогда (цикл не выше ~15°)') : (yrs < 1 ? fmt(yrs*12, 0) + T(' months',' мес.') : '≈ ' + fmt(yrs, 0) + yearsWord(Math.round(yrs)))]
  ]);
  hud1.textContent = km(H_GEO); hud2.textContent = hms(SID);
  document.getElementById('f8Status').innerHTML = iD < 0.2
    ? T('Practically geostationary: the satellite stays put to within a fraction of a degree, and a fixed dish never has to move.','Практически геостационарная орбита: спутник стоит на месте с точностью до долей градуса, и неподвижной антенне никогда не нужно поворачиваться.')
    : iD <= DRIFT_AMP ? T('Geosynchronous but not geostationary: each day the satellite swings ','Геосинхронная, но не геостационарная орбита: каждые сутки спутник качается на ') + deg(iD, 1) + T(' north and south and loops ±',' к северу и к югу и описывает петли ±') + deg(sw, 2) + T(' east and west. A dead satellite gets this tilted in about ',' к востоку и западу. Брошенный спутник наклоняется так примерно за ') + (yrs < 1 ? fmt(yrs*12, 0) + T(' months.',' мес.') : fmt(yrs, 0) + yearsWord(Math.round(yrs)) + '.')
    : T('More than the Moon and Sun ever give an abandoned satellite — a tilt like this is put there by the launch, as with Syncom 2. A dish must swing ±','Больше, чем Луна и Солнце когда-либо дают брошенному спутнику: такой наклон задаёт запуск, как у «Синкома-2». Антенна должна качаться на ±') + deg(zen, 0) + T(' to follow it.',', чтобы за ним следить.');
}
f8I.addEventListener('input', function(){ pressGroup(document.getElementById('f8Pre'), null); renderF8(); });
Array.prototype.forEach.call(document.querySelectorAll('#f8Pre .btn'), function(btn){ btn.addEventListener('click', function(){ f8I.value = this.getAttribute('data-i'); pressGroup(this.parentNode, this); renderF8(); }); });

/* ============ CH5 — MOLNIYA ============ */
var ML_E = 0.722, ML_A = aForPeriod(SID/2), ML_W = 270, ML_APO_LON = 65;   // e and 12 h [13]
var mlI = document.getElementById('mlI');
function critIncl(){ return Math.acos(Math.sqrt(0.2))/D2R; }
function mlRates(iDeg){ var r = rates(ML_A, ML_E, iDeg); return {dw:r.dw/D2R*86400*365.25, dO:r.dO/D2R*86400}; }   // °/yr, °/day
/* one day of ground track starting at perigee; Earth turns at OMEGA_E; longitudes shifted so the first apogee sits at ML_APO_LON */
function mlTrack(iDeg, steps){
  var P = periodS(ML_A), n = 2*Math.PI/P, i = iDeg*D2R, w = ML_W*D2R, pts = [];
  for(var k = 0; k <= steps; k++){
    var t = k/steps*SID, E = kepler(n*t, ML_E), nu = 2*Math.atan2(Math.sqrt(1 + ML_E)*Math.sin(E/2), Math.sqrt(1 - ML_E)*Math.cos(E/2)), u = w + nu;
    var lat = Math.asin(Math.sin(i)*Math.sin(u)), lon = Math.atan2(Math.cos(i)*Math.sin(u), Math.cos(u)) - OMEGA_E*t;
    pts.push([lat/D2R, lon/D2R, t]);
  }
  var lonA = Math.atan2(Math.cos(i)*Math.sin(w + Math.PI), Math.cos(w + Math.PI)) - OMEGA_E*P/2;
  var shift = ML_APO_LON - lonA/D2R;
  pts.forEach(function(p){ var l = p[1] + shift; p[1] = ((l + 180) % 360 + 360) % 360 - 180; });
  return pts;
}
/* fraction of each orbit spent north of a latitude */
function mlFracNorth(iDeg, latDeg){ var pts = mlTrack(iDeg, 4000), c = 0; for(var k = 0; k < 4000; k++) if(pts[k][0] > latDeg) c++; return c/4000; }
function renderML(){
  var iD = +mlI.value, rt = mlRates(iD), f50 = mlFracNorth(iD, 50), fEq = mlFracNorth(iD, 0);
  document.getElementById('mlIVal').textContent = deg(iD, 2); mlI.setAttribute('aria-valuetext', deg(iD, 2) + ', ' + T('perigee drift ','дрейф перигея ') + fmt(rt.dw, 1) + T('° a year','° в год'));
  var svg = document.getElementById('mlSvg'); svg.innerHTML = ''; aria(svg);
  var L = 30, R = 470, Tp = 10, B = 230, P = mapXY(L, R, Tp, B);
  drawGraticule(svg, P, L, R, Tp, B);
  ns('rect', {x:L, y:Tp, width:R - L, height:P.Y(50) - Tp, fill:'#2f5aa1', opacity:0.07}, svg);
  txt(svg, R - 4, P.Y(50) - 4, T('north of 50°','севернее 50°'), 'svg-tiny', 'end');
  var pts = mlTrack(iD, 1440);
  ns('path', {d:trackPath(pts, P), fill:'none', stroke:'#b5452a', 'stroke-width':1.8}, svg);
  for(var hh = 0; hh <= 24; hh++){ var p = pts[Math.round(hh/24*1440)]; ns('circle', {cx:P.X(p[1]), cy:P.Y(p[0]), r:2.6, fill:'#0b0b0c'}, svg); }
  [[55.75, 37.62, T('Moscow','Москва')], [69.35, 88.2, T('Norilsk','Норильск')]].forEach(function(c){ ns('rect', {x:P.X(c[1]) - 3, y:P.Y(c[0]) - 3, width:6, height:6, fill:'#2f5aa1'}, svg); txt(svg, P.X(c[1]) + 6, P.Y(c[0]) + 12, c[2], 'svg-tiny svg-halo'); });
  txt(svg, R - 4, B + 15, T('24 h of ground track, dots every hour; apogees over 65° E and 115° W','24 ч трассы, точки через час; апогеи над 65° в. д. и 115° з. д.'), 'svg-tiny', 'end');
  cells(document.getElementById('mlReadout'), [
    [T('PERIGEE · APOGEE','ПЕРИГЕЙ · АПОГЕЙ'), km(ML_A*(1 - ML_E) - RE) + ' · ' + km(ML_A*(1 + ML_E) - RE)],
    [T('PERIGEE DRIFT FROM J₂','ДРЕЙФ ПЕРИГЕЯ ИЗ-ЗА J₂'), (Math.abs(rt.dw) < 0.05 ? '0' : (rt.dw > 0 ? '+' : '') + fmt(rt.dw, 1)) + T('° a year','° в год')],
    [T('NORTH OF THE EQUATOR','СЕВЕРНЕЕ ЭКВАТОРА'), fmt(fEq*100, 1) + T(' % of each orbit',' % каждого витка')],
    [T('NORTH OF 50°','СЕВЕРНЕЕ 50°'), fmt(f50*12, 1) + T(' h of every 12',' ч из каждых 12')]
  ]);
  hud1.textContent = km(ML_A*(1 + ML_E) - RE); hud2.textContent = hms(periodS(ML_A));
  var st = document.getElementById('mlStatus');
  if(Math.abs(rt.dw) < 0.5) st.innerHTML = T('The critical inclination: the bulge no longer turns the orbit, so the apogee stays over the north year after year.','Критическое наклонение: вздутие больше не поворачивает орбиту, и апогей год за годом остаётся над севером.');
  else st.innerHTML = T('At this tilt the bulge turns the perigee ','При таком наклоне вздутие поворачивает перигей на ') + fmt(Math.abs(rt.dw), 1) + T('° a year; in about ','° в год; примерно за ') + fmt(30/Math.abs(rt.dw)*12, 0) + T(' months the apogee would slide 30° away from the top of the orbit, and the long northern dwell would start to fade.',' мес. апогей сместится на 30° от верхней точки орбиты, и долгое «зависание» над севером начнёт исчезать.');
}
mlI.addEventListener('input', function(){ pressGroup(document.getElementById('mlPre'), null); renderML(); });
Array.prototype.forEach.call(document.querySelectorAll('#mlPre .btn'), function(btn){ btn.addEventListener('click', function(){ mlI.value = this.getAttribute('data-i'); pressGroup(this.parentNode, this); renderML(); }); });

/* ============ CH6 — COVERAGE AND DELAY ============ */
var cvE = document.getElementById('cvE'), cvL = document.getElementById('cvL');
function coverLambda(epsDeg){ var e = epsDeg*D2R; return (Math.acos(RE*Math.cos(e)/R_GEO) - e)/D2R; }       // Earth-central angle, °
function slantKm(epsDeg){ var e = epsDeg*D2R; return Math.sqrt(R_GEO*R_GEO - RE*RE*Math.cos(e)*Math.cos(e)) - RE*Math.sin(e); }
function capFraction(lamDeg){ return (1 - Math.cos(lamDeg*D2R))/2; }
function satsForRing(epsDeg){ return Math.ceil(180/coverLambda(epsDeg) - 1e-9); }
function elevAtLat(latDeg){ var p = latDeg*D2R; return Math.atan2(Math.cos(p) - RE/R_GEO, Math.sin(p))/D2R; }
function rangeAtLat(latDeg){ var p = latDeg*D2R; return Math.sqrt(RE*RE + R_GEO*R_GEO - 2*RE*R_GEO*Math.cos(p)); }
function earthAngDeg(){ return 2*Math.asin(RE/R_GEO)/D2R; }
function renderCV(){
  var eps = +cvE.value, lat = +cvL.value, lam = coverLambda(eps), el = elevAtLat(lat), d = rangeAtLat(lat);
  document.getElementById('cvEVal').textContent = deg(eps, 1); cvE.setAttribute('aria-valuetext', deg(eps, 1) + ', ' + T('coverage radius ','радиус зоны ') + deg(lam, 1));
  document.getElementById('cvLVal').textContent = deg(lat, 2); cvL.setAttribute('aria-valuetext', deg(lat, 2) + ', ' + T('elevation ','угол места ') + deg(el, 1));
  var svg = document.getElementById('cvSvg'); svg.innerHTML = ''; aria(svg);
  var cx = 62, cy = 136, rp = 56, k = rp/RE, sx = cx + R_GEO*k, sy = cy;
  ns('circle', {cx:cx, cy:cy, r:rp, fill:'#dfe7ef', stroke:'#0b0b0c', 'stroke-width':1}, svg);
  ns('line', {x1:cx, y1:cy, x2:sx, y2:sy, stroke:'#9aa3aa', 'stroke-dasharray':'3 3'}, svg);
  /* usable footprint arc and lines of sight to its edges */
  var a0 = lam*D2R, arc = 'M' + (cx + rp*Math.cos(a0)).toFixed(1) + ',' + (cy - rp*Math.sin(a0)).toFixed(1) + ' A' + rp + ',' + rp + ' 0 0 1 ' + (cx + rp*Math.cos(a0)).toFixed(1) + ',' + (cy + rp*Math.sin(a0)).toFixed(1);
  ns('path', {d:arc, fill:'none', stroke:'#b5452a', 'stroke-width':4}, svg);
  [1, -1].forEach(function(sg){ ns('line', {x1:sx, y1:sy, x2:cx + rp*Math.cos(a0), y2:cy - sg*rp*Math.sin(a0), stroke:'#b5452a', 'stroke-width':1, opacity:0.7}, svg); });
  /* station at the chosen latitude, line of sight */
  var p = lat*D2R, px = cx + rp*Math.cos(p), py = cy - rp*Math.sin(p);
  ns('line', {x1:px, y1:py, x2:sx, y2:sy, stroke:el > 0 ? '#2f5aa1' : '#8f8f88', 'stroke-width':1.6, 'stroke-dasharray':el > 0 ? '' : '4 3'}, svg);
  ns('circle', {cx:px, cy:py, r:4.5, fill:'#2f5aa1'}, svg);
  ns('rect', {x:sx - 5, y:sy - 5, width:10, height:10, fill:'#0b0b0c'}, svg);
  txt(svg, sx + 4, sy + 26, T('satellite, 35,786 km up','спутник, 35 786 км'), 'svg-small svg-halo', 'end');
  txt(svg, 8, cy + rp + 20, T('Earth (to scale)','Земля (в масштабе)'), 'svg-small');
  txt(svg, 20, 24, T('red: usable footprint at ≥ ','красное: рабочая зона при ≥ ') + deg(eps, 1) + T(' elevation',' над горизонтом'), 'svg-small');
  txt(svg, 20, 40, T('blue: line of sight from the station','синее: линия визирования со станции'), 'svg-small');
  var one = 2*d/C_KMS*1000;
  cells(document.getElementById('cvReadout'), [
    [T('FOOTPRINT RADIUS (ARC)','РАДИУС ЗОНЫ (ДУГА)'), deg(lam, 1)],
    [T('SHARE OF EARTH\'S SURFACE','ДОЛЯ ПОВЕРХНОСТИ ЗЕМЛИ'), fmt(capFraction(lam)*100, 1) + ' %'],
    [T('SATELLITES FOR A FULL RING','СПУТНИКОВ ДЛЯ ПОЛНОГО КОЛЬЦА'), String(satsForRing(eps))],
    [T('ELEVATION AT THIS LATITUDE','УГОЛ МЕСТА НА ЭТОЙ ШИРОТЕ'), el > 0 ? deg(el, 1) : T('below horizon','под горизонтом')],
    [T('ONE WAY, STATION TO TWIN STATION','В ОДНУ СТОРОНУ, ОТ СТАНЦИИ ДО ТАКОЙ ЖЕ'), el > 0 ? fmt(one, 0) + T(' ms',' мс') : '—'],
    [T('QUESTION AND ANSWER','ВОПРОС И ОТВЕТ'), el > 0 ? fmt(2*one/1000, 2) + T(' s',' с') : '—']
  ]);
  hud1.textContent = km(H_GEO); hud2.textContent = hms(SID);
  var st = document.getElementById('cvStatus');
  st.innerHTML = el <= 0 ? T('Below the horizon: beyond ','Под горизонтом: севернее ') + deg(coverLambda(0), 1) + T(' of latitude no geostationary satellite can be seen at all.',' широты ни один геостационарный спутник вообще не виден.')
    : el < eps ? T('Visible, but only ','Виден, но лишь на ') + deg(el, 1) + T(' up — lower than the ',' над горизонтом — ниже требуемых ') + deg(eps, 1) + T(' this link needs. This is the gap Molniya filled.',' для этой линии. Этот пробел и закрыла «Молния».')
    : T('Usable: the dish points ','Пригодно: антенна смотрит на ') + deg(el, 1) + T(' above the horizon, and each hop up and down adds ',' над горизонтом, и каждый путь вверх-вниз добавляет ') + fmt(one, 0) + T(' ms. With ',' мс. При ') + deg(eps, 1) + T(' minimum elevation, ',' минимального угла ') + satsForRing(eps) + T(' satellites close the ring around the equator.',' спутника замыкают кольцо вокруг экватора.');
}
cvE.addEventListener('input', renderCV);
cvL.addEventListener('input', function(){ pressGroup(document.getElementById('cvPre'), null); renderCV(); });
Array.prototype.forEach.call(document.querySelectorAll('#cvPre .btn'), function(btn){ btn.addEventListener('click', function(){ cvL.value = this.getAttribute('data-lat'); pressGroup(this.parentNode, this); renderCV(); }); });

/* ============ CH7 — LEGACY ============ */
var TIMELINE = [
  ['1929', 'Herman Potočnik (“Hermann Noordung”) places a space station 35,900 km above the equator, where it keeps pace with the turning Earth [1].', 'Герман Поточник («Герман Нордунг») помещает космическую станцию в 35 900 км над экватором, где она не отстаёт от вращения Земли [1].'],
  ['1945', 'Arthur C. Clarke\'s “Extra-Terrestrial Relays” in <i>Wireless World</i>: three stations at 42,000 km radius for a world radio service [2].', 'Статья Артура Кларка «Внеземные ретрансляторы» в <i>Wireless World</i>: три станции на радиусе 42 000 км для всемирной радиосвязи [2].'],
  ['1960', 'Echo 1, a 30.48 m reflecting balloon, launched on 12 August [3].', '12 августа запущен «Эхо-1» — отражающий шар диаметром 30,48 м [3].'],
  ['1962', 'Starfish Prime explodes 400 km above the Pacific on 9 July; Telstar 1 launches on 10 July; first transatlantic TV signal to Pleumeur-Bodou on 11 July; first public live broadcast on 23 July [5][6].', '9 июля — взрыв «Старфиш Прайм» в 400 км над Тихим океаном; 10 июля — запуск «Телстара-1»; 11 июля — первый трансатлантический телесигнал в Плёмёр-Боду; 23 июля — первая публичная прямая трансляция [5][6].'],
  ['1962', 'Relay 1 launched on 13 December into a 1,322 × 7,439 km orbit [7].', '13 декабря «Релей-1» выведен на орбиту 1322 × 7439 км [7].'],
  ['1963', 'Telstar 1 falls silent in February, its transistors ruined by radiation [6]. Syncom 2, the first geosynchronous satellite, launched on 26 July [8].', 'В феврале «Телстар-1» замолкает: его транзисторы разрушены радиацией [6]. 26 июля запущен «Синком-2» — первый геосинхронный спутник [8].'],
  ['1964', 'Syncom 3, the first geostationary satellite, launched on 19 August; live television of the Tokyo Olympics across the Pacific [9].', '19 августа запущен «Синком-3» — первый геостационарный спутник; прямые телетрансляции Олимпиады в Токио через Тихий океан [9].'],
  ['1965', 'Early Bird (Intelsat I), the first commercial communications satellite, launched on 6 April and in service from 28 June [10][11]. Molniya-1 launched on 23 April [12].', '6 апреля запущен «Эрли Бёрд» («Интелсат-1») — первый коммерческий спутник связи; в строю с 28 июня [10][11]. 23 апреля запущена «Молния-1» [12].'],
  ['1967', 'The Orbita network opens with 20 receiving stations across the Soviet north and east [14].', 'Открывается сеть «Орбита» — 20 приёмных станций на севере и востоке СССР [14].'],
  ['1969', 'Early Bird, in reserve since January, is briefly reactivated for Apollo 11 [10]; Syncom 3 is switched off in April [9].', '«Эрли Бёрд», с января в резерве, ненадолго включают для «Аполлона-11» [10]; в апреле «Синком-3» выключен [9].'],
  ['2026', 'CelesTrak lists 568 active geosynchronous satellites; Telstar 1, Syncom 3 and Early Bird are still in orbit, silent [21].', 'В списке CelesTrak — 568 активных геосинхронных спутников; «Телстар-1», «Синком-3» и «Эрли Бёрд» по-прежнему на орбите и молчат [21].']
];
var REFERENCES = [
  {title:'H. Noordung (H. Potočnik), “The Problem of Space Travel: The Rocket Motor”, NASA SP-4026 (1995, translation of the 1929 original)', url:'https://www.nasa.gov/wp-content/uploads/2023/03/sp-4026.pdf', note:{en:'pp. 72–74: an object 42,300 km from Earth\'s centre in the equatorial plane, orbiting at 3,080 m/s, “precisely 35,900 km above the Earth\'s surface”, stays over one point (“stationary orbit”); the preface discusses short-wave links and Clarke\'s later comments.', ru:'С. 72–74: объект в плоскости экватора в 42 300 км от центра Земли, движущийся со скоростью 3080 м/с, «ровно в 35 900 км над поверхностью Земли», остаётся над одной точкой («стационарная орбита»); в предисловии — связь на коротких волнах и позднейшие замечания Кларка.'}},
  {title:'A. C. Clarke (1945), “Extra-Terrestrial Relays: Can Rocket Stations Give World-wide Radio Coverage?”, Wireless World, October 1945 (transcription)', url:'https://rfcafe.com/references/wireless-world/extra-terrestrial-relays-arthur-c-clarke-oct-1945-wireless-world.htm', note:{en:'“One orbit, with a radius of 42,000 km, has a period of exactly 24 hours”; three stations at 30° E, 150° E and 90° W; a single station covers half the globe; about 1.2 kW for broadcasting.', ru:'«Одна орбита радиусом 42 000 км имеет период ровно 24 часа»; три станции на 30° в. д., 150° в. д. и 90° з. д.; одна станция покрывает полушарие; для вещания около 1,2 кВт.'}},
  {title:'NASA NSSDCA Master Catalog, “Echo 1” (1960-009A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1960-009A', note:{en:'Launched 12 August 1960; 30.48 m balloon of 0.0127 mm Mylar; passive reflector; orbit 1,524 × 1,684 km, 47.2°, 118.3 min (orbital information page).', ru:'Запуск 12 августа 1960 года; шар диаметром 30,48 м из майлара толщиной 0,0127 мм; пассивный отражатель; орбита 1524 × 1684 км, 47,2°, 118,3 мин (страница орбитальных данных).'}},
  {title:'NASA, “Telstar Opened Era of Global Satellite Television”', url:'https://www.nasa.gov/content/telstar-opened-era-of-global-satellite-television', note:{en:'Launched 10 July 1962 on a Delta; a 171-pound, 34.5-inch sphere; 3,503-by-593-mile orbit; available for broadcasts “for only about 18 minutes at a time”.', ru:'Запуск 10 июля 1962 года на ракете «Дельта»; шар массой 171 фунт и диаметром 34,5 дюйма; орбита 3503 × 593 мили; пригоден для трансляций «лишь примерно по 18 минут».'}},
  {title:'IEEE ETHW, “Milestones: First Transatlantic Transmission of a Television Signal via Satellite, 1962”', url:'https://ethw.org/Milestones:First_Transatlantic_Transmission_of_a_Television_Signal_via_Satellite,_1962', note:{en:'Andover, Maine, transmitted the first transatlantic TV signal to Pleumeur-Bodou on 11 July 1962; horn antenna about seven stories tall, 340 tons, in a radome 160 ft high; Telstar amplified the signal about ten billion times.', ru:'Андовер (штат Мэн) передал первый трансатлантический телесигнал в Плёмёр-Боду 11 июля 1962 года; рупорная антенна высотой около семи этажей, 340 тонн, под куполом высотой 160 футов; «Телстар» усиливал сигнал примерно в десять миллиардов раз.'}},
  {title:'Scientific American, “How the U.S. Accidentally Nuked Its Own Communications Satellite”', url:'https://www.scientificamerican.com/article/how-us-accidentally-nuked-own-communications-satellite', note:{en:'Starfish Prime the day before Telstar\'s launch: 1.4 Mt at 400 km; electron flux a hundred times the prediction; Telstar\'s transistors failed for good in February 1963; first public broadcast 23 July 1962; John Pierce\'s estimate of about 25 satellites for continuous coverage.', ru:'«Старфиш Прайм» за день до запуска «Телстара»: 1,4 Мт на высоте 400 км; поток электронов в сто раз больше предсказанного; транзисторы «Телстара» окончательно отказали в феврале 1963 года; первая публичная трансляция 23 июля 1962 года; оценка Джона Пирса — около 25 спутников для непрерывной связи.'}},
  {title:'NASA NSSDCA Master Catalog, “Relay 1” (1962-068A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1962-068A', note:{en:'Launched 13 December 1962; radiation-belt experiments; orbit 1,322 × 7,439 km, 47.5°, 185 min (orbital information page); usable data until 10 February 1965.', ru:'Запуск 13 декабря 1962 года; эксперименты по радиационным поясам; орбита 1322 × 7439 км, 47,5°, 185 мин (страница орбитальных данных); пригодные данные до 10 февраля 1965 года.'}},
  {title:'NASA NSSDCA Master Catalog, “Syncom 2” (1963-031A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1963-031A', note:{en:'First geosynchronous satellite, launched 26 July 1963; inclined 33°, figure eight 33° north and south; at 55° longitude from 16 August; 71 × 39 cm cylinder, 68 kg fuelled, 29 W; one two-way telephone channel.', ru:'Первый геосинхронный спутник, запуск 26 июля 1963 года; наклонение 33°, восьмёрка на 33° к северу и югу; на долготе 55° с 16 августа; цилиндр 71 × 39 см, 68 кг с топливом, 29 Вт; один двусторонний телефонный канал.'}},
  {title:'NASA NSSDCA Master Catalog, “Syncom 3” (1964-047A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-047A', note:{en:'First geostationary satellite, launched 19 August 1964; 35,670 × 35,908 km, inclination 0.1°, at 180° longitude; live television of the 1964 Tokyo Olympics; turned off in April 1969.', ru:'Первый геостационарный спутник, запуск 19 августа 1964 года; 35 670 × 35 908 км, наклонение 0,1°, долгота 180°; прямые телетрансляции Олимпиады 1964 года в Токио; выключен в апреле 1969 года.'}},
  {title:'Gunter\'s Space Page, “Intelsat 1 (Early Bird)”', url:'https://space.skyrocket.de/doc_sdat/intelsat-1.htm', note:{en:'Launched 6 April 1965; 240 circuits or one TV channel; planned station 28° W; commercial service from 28 June 1965; designed for 18 months, about 4 years achieved; in reserve from January 1969, reactivated for Apollo 11.', ru:'Запуск 6 апреля 1965 года; 240 каналов или один телевизионный; планируемая точка 28° з. д.; коммерческая эксплуатация с 28 июня 1965 года; рассчитан на 18 месяцев, проработал около 4 лет; в резерве с января 1969 года, включён для «Аполлона-11».'}},
  {title:'IEEE Communications Society, “History of Communications”: Early Bird (1965)', url:'https://www.comsoc.org/node/19396', note:{en:'The first commercial communications satellite, launched 6 April 1965; planned life 18 months, lasted four years.', ru:'Первый коммерческий спутник связи, запуск 6 апреля 1965 года; расчётный срок 18 месяцев, проработал четыре года.'}},
  {title:'IEEE Communications Society, “History of Communications”: Molniya 1 (1965)', url:'https://www.comsoc.org/node/19421', note:{en:'23 April 1965: the Soviet Union launches its first communications satellite and carries out television transmissions.', ru:'23 апреля 1965 года: Советский Союз запускает свой первый спутник связи и проводит телевизионные передачи.'}},
  {title:'NASA Earth Observatory, “Catalog of Earth Satellite Orbits”', url:'https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits', note:{en:'Geosynchronous at 42,164 km from Earth\'s centre; the Molniya orbit combines inclination 63.4° with eccentricity 0.722 and a 12-hour period and works well for high latitudes.', ru:'Геосинхронная орбита — 42 164 км от центра Земли; орбита «Молния» сочетает наклонение 63,4°, эксцентриситет 0,722 и период 12 часов и удобна для высоких широт.'}},
  {title:'ComNews (2021), “Космическая одиссея телесигнала” (in Russian)', url:'https://www.comnews.ru/content/214004/2021-04-08/2021-w14/kosmicheskaya-odisseya-telesignala', note:{en:'The Orbita ground network began work in 1967 with 20 stations, 73 ten years later, in the Far North, Far East, Siberia, the Urals and Central Asia.', ru:'Наземная сеть «Орбита» заработала в 1967 году: 20 станций, через десять лет — 73, на Крайнем Севере, Дальнем Востоке, в Сибири, на Урале и в Средней Азии.'}},
  {title:'ESA, “Types of orbits”', url:'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits', note:{en:'Geostationary altitude 35,786 km; one orbit takes 23 hours 56 minutes 4 seconds; three evenly spaced satellites give near-global coverage.', ru:'Высота геостационарной орбиты 35 786 км; виток длится 23 часа 56 минут 4 секунды; три равномерно расставленных спутника дают почти глобальное покрытие.'}},
  {title:'IERS Conventions (2010), Chapter 1, “General definitions and numerical standards”', url:'https://iers-conventions.obspm.fr/content/chapter1/icc1.pdf', note:{en:'GM⊕ = 3.986004418 × 10¹⁴ m³/s²; nominal mean angular velocity of the Earth ω = 7.292115 × 10⁻⁵ rad/s.', ru:'GM⊕ = 3,986004418 × 10¹⁴ м³/с²; номинальная средняя угловая скорость Земли ω = 7,292115 × 10⁻⁵ рад/с.'}},
  {title:'NASA NSSDCA, “Earth Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'Equatorial radius 6,378.137 km; J₂ = 1,082.63 × 10⁻⁶; sidereal rotation period 23.9345 h.', ru:'Экваториальный радиус 6378,137 км; J₂ = 1082,63 × 10⁻⁶; звёздный период вращения 23,9345 ч.'}},
  {title:'S. Proietti, R. Flores, E. Fantino, M. Pontani (2021), “Long-Term Orbit Dynamics of Decommissioned Geostationary Satellites”, Acta Astronautica 182, 559–573', url:'https://arxiv.org/abs/2104.01240', note:{en:'Reviews earlier work: the orbit pole of an uncontrolled geostationary satellite precesses with a period of about 53 years around a point about 7.3° from Earth\'s axis; simulations show an inclination cycle with a maximum of 14.5–15°.', ru:'Обзор предшествующих работ: полюс орбиты неуправляемого геостационарного спутника прецессирует с периодом около 53 лет вокруг точки примерно в 7,3° от оси Земли; моделирование даёт цикл наклонения с максимумом 14,5–15°.'}},
  {title:'N. L. Johnson (2011), “A New Look at the GEO and Near-GEO Regimes: Operations, Disposals, and Debris”, NASA JSC', url:'https://ntrs.nasa.gov/api/citations/20110006974/downloads/20110006974.pdf', note:{en:'The IADC GEO protected region: 200 km below to 200 km above geostationary altitude, and 15° either side of the equator.', ru:'Защищённая область ГСО по определению IADC: от 200 км ниже до 200 км выше геостационарной высоты и 15° по обе стороны экватора.'}},
  {title:'47 CFR § 25.210(j), “Technical requirements for space stations” (Cornell LII)', url:'https://www.law.cornell.edu/cfr/text/47/25.210', note:{en:'Geostationary space stations “must be maintained within 0.05° of their assigned orbital longitude in the east/west direction” unless authorised otherwise.', ru:'Геостационарные космические станции «должны удерживаться в пределах 0,05° от назначенной орбитальной долготы в направлении восток–запад», если не разрешено иное.'}},
  {title:'CelesTrak, “Current GP Element Sets” — Active Geosynchronous; Telstar 1 (340), Syncom 3 (858), Intelsat 1-F1 (1317)', url:'https://celestrak.org/NORAD/elements/', note:{en:'Retrieved 22 October 2026: 568 active geosynchronous satellites (326 below 0.1° inclination, 369 below 1°); Telstar 1 at 9.12893 revolutions a day, e = 0.2425, 44.79° (epoch 21 October 2026); Syncom 3 at 7.27° and Early Bird at 7.46°.', ru:'Получено 22 октября 2026 года: 568 активных геосинхронных спутников (326 с наклонением меньше 0,1°, 369 — меньше 1°); «Телстар-1»: 9,12893 оборота в сутки, e = 0,2425, 44,79° (эпоха 21 октября 2026 года); «Синком-3» — 7,27°, «Эрли Бёрд» — 7,46°.'}},
  {title:'IEEE ETHW, “Milestones: First Transatlantic Reception of a Television Signal via Satellite, 1962”', url:'https://ethw.org/Milestones:First_Transatlantic_Reception_of_a_Television_Signal_via_Satellite,_1962', note:{en:'Pleumeur-Bodou received the first transatlantic transmission of a TV signal on 11 July 1962; its radome is 64 m across and is now a museum.', ru:'Плёмёр-Боду принял первую трансатлантическую передачу телесигнала 11 июля 1962 года; его купол диаметром 64 м сегодня — музей.'}},
  {title:'Gunter\'s Space Page, “Syncom 1, 2, 3”', url:'https://space.skyrocket.de/doc_sdat/syncom-1.htm', note:{en:'Contractor: Hughes.', ru:'Подрядчик: Hughes.'}},
  {title:'Gunter\'s Space Page, “Molniya-1”', url:'https://space.skyrocket.de/doc_sdat/molniya-1.htm', note:{en:'Orbit “500 km × 40000 km, 65° (typical)”, 12-hour period; the payload served the Orbita network or TV broadcast.', ru:'Орбита «500 км × 40 000 км, 65° (типичная)», период 12 часов; полезная нагрузка работала в сети «Орбита» или для телевещания.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderPD(); renderTS(); renderF8(); renderML(); renderCV();
  if(tsPlay) setPlay(tsPlaying);
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__relay = {GM:GM, RE:RE, SID:SID, R_GEO:R_GEO, H_GEO:H_GEO, periodS:periodS, aForPeriod:aForPeriod, circV:circV, driftDegDay:driftDegDay,
  kepler:kepler, rates:rates, eciAt:eciAt, toEcef:toEcef, gmst:gmst, station:station, elevDeg:elevDeg, TELSTAR:TELSTAR, TRACKS:TRACKS, PASSES:PASSES,
  ANDOVER:ANDOVER, PLEUMEUR:PLEUMEUR, geoEcef:geoEcef, f8Point:f8Point, f8Swing:f8Swing, f8Zenith:f8Zenith, driftIncl:driftIncl, yearsToIncl:yearsToIncl,
  critIncl:critIncl, mlRates:mlRates, mlTrack:mlTrack, mlFracNorth:mlFracNorth, ML_A:ML_A, ML_E:ML_E, coverLambda:coverLambda, slantKm:slantKm,
  capFraction:capFraction, satsForRing:satsForRing, elevAtLat:elevAtLat, rangeAtLat:rangeAtLat, earthAngDeg:earthAngDeg, MARKS:MARKS, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
