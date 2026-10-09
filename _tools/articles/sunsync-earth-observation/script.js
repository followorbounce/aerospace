/* ============ CONSTANTS (standard geodetic values) ============ */
var MU = 398600.4418, RE = 6378.137, J2 = 1.08263e-3, YEAR = 365.2422*86400, EQ_KM = 40075.017;
var OMEGA_SSO = 2*Math.PI/YEAR;                                                  // rad/s
function n(aKm){ return Math.sqrt(MU/(aKm*aKm*aKm)); }
function nodeRate(aKm, iDeg){ return -1.5*n(aKm)*J2*Math.pow(RE/aKm, 2)*Math.cos(iDeg*Math.PI/180); }
function ssoInc(hKm){ var a = RE + hKm, c = -OMEGA_SSO/(1.5*n(a)*J2*Math.pow(RE/a, 2)); return Math.acos(c)*180/Math.PI; }
function period(hKm){ return 2*Math.PI/n(RE + hKm); }                            // s
var REF = [[917, 99.2, 'Landsat 1'], [786, 98.62, 'Sentinel-2'], [705, 98.2, 'Landsat 9']];

/* ============ CH2 — SSO INCLINATION ============ */
var sH = document.getElementById('sH');
function renderSso(){
  var h = +sH.value, inc = ssoInc(h), T_ = period(h);
  document.getElementById('sHVal').textContent = fmtInt(h) + T(' km',' км');
  var svg = document.getElementById('ssoSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, i0 = 96, i1 = 103;
  function X(hh){ return L + (hh - 300)/1200*(R - L); }
  function Y(ii){ return B - (ii - i0)/(i1 - i0)*(B - Tp); }
  for(var ii = 96; ii <= 103; ii++){ ns('line', {x1:L, y1:Y(ii), x2:R, y2:Y(ii), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(ii) + 3, ii + '°', 'svg-small', 'end'); }
  [300,600,900,1200,1500].forEach(function(hh){ txt(svg, X(hh), B + 14, hh, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('altitude, km','высота, км'), 'svg-small', 'end'); txt(svg, L, 13, T('inclination for a sun-synchronous orbit','наклонение для солнечно-синхронной орбиты'), 'svg-small');
  var d = ''; for(var hh2 = 300; hh2 <= 1500; hh2 += 10) d += (d ? 'L' : 'M') + X(hh2).toFixed(1) + ' ' + Y(ssoInc(hh2)).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  REF.forEach(function(r){ ns('rect', {x:X(r[0]) - 4, y:Y(r[1]) - 4, width:8, height:8, fill:'#2f5aa1'}, svg); txt(svg, X(r[0]) + 7, Y(r[1]) + 14, r[2] + ' ' + r[1] + '°', 'svg-small'); });
  ns('circle', {cx:X(h), cy:Y(inc), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('ssoReadout'), [
    [T('INCLINATION NEEDED','НУЖНОЕ НАКЛОНЕНИЕ'), fmt(inc, 2) + '°'],
    [T('ORBITAL PERIOD','ПЕРИОД ОБРАЩЕНИЯ'), fmt(T_/60, 1) + T(' min',' мин')],
    [T('ORBITS PER DAY','ВИТКОВ В СУТКИ'), fmt(86400/T_, 2)],
    [T('PLANE TURNS PER DAY','ПОВОРОТ ПЛОСКОСТИ ЗА СУТКИ'), '+' + fmt(nodeRate(RE + h, inc)*86400*180/Math.PI, 4) + '°']
  ]);
  hud1.textContent = fmt(inc, 2) + '°';
  var near = REF.filter(function(r){ return Math.abs(r[0] - h) < 3; })[0];
  document.getElementById('ssoStatus').innerHTML = near
    ? near[2] + T(': published ',': опубликовано ') + String(near[1]).replace('.', T('.', ',')) + T('°; this formula gives ','°; формула даёт ') + fmt(inc, 2) + '° [' + (near[2] === 'Sentinel-2' ? 3 : near[2] === 'Landsat 9' ? 2 : 1) + '].'
    : T('Higher orbits need more tilt: the bulge\'s pull weakens with distance, so the orbit must lean further from the pole to turn fast enough.','Более высоким орбитам нужен больший наклон: притяжение вздутия ослабевает с расстоянием, и орбите приходится сильнее отклоняться от полюса, чтобы поворачиваться достаточно быстро.');
}
sH.addEventListener('input', renderSso);

/* ============ CH3 — COVERAGE ============ */
var cW = document.getElementById('cW'), cH = document.getElementById('cH');
function coverage(hKm, wKm){ var T_ = period(hKm), sp = EQ_KM*T_/86400; return {spacing:sp, perDay:86400/T_, days:Math.ceil(sp/wKm - 1e-9)}; }
function renderCov(){
  var w = +cW.value, h = +cH.value, Cv = coverage(h, w);
  document.getElementById('cWVal').textContent = fmtInt(w) + T(' km',' км');
  document.getElementById('cHVal').textContent = fmtInt(h) + T(' km',' км');
  var svg = document.getElementById('covSvg'); svg.innerHTML = '';
  var L = 20, R = 460, y0 = 60, sc = (R - L)/EQ_KM, nShow = Math.min(Cv.days, 40);
  ns('rect', {x:L, y:y0, width:R - L, height:120, fill:'#f6f6f2', stroke:'#c9c9c1'}, svg);
  txt(svg, L, y0 - 22, T('the equator unrolled (40,075 km): stripes imaged on day 1, 2, 3…','развёрнутый экватор (40 075 км): полосы, снятые в 1-й, 2-й, 3-й… день'), 'svg-small');
  for(var dd = 0; dd < nShow; dd++){
    for(var k = 0; k < Math.ceil(Cv.perDay) + 1; k++){
      var x = L + ((k*Cv.spacing + dd*w) % EQ_KM)*sc;
      ns('rect', {x:x, y:y0 + 4 + (dd % 6)*19, width:Math.max(0.8, w*sc), height:16, fill: dd === 0 ? '#b5452a' : '#0b0b0c', opacity: dd === 0 ? 0.9 : 0.25 + 0.5*(1 - dd/nShow)}, svg);
    }
  }
  txt(svg, L, y0 + 140, T('day 1 in red; each later day shifted by one swath (an idealised pattern)','1-й день — красным; каждый следующий сдвинут на ширину полосы (идеализированная схема)'), 'svg-small');
  cells(document.getElementById('covReadout'), [
    [T('ORBITS PER DAY','ВИТКОВ В СУТКИ'), fmt(Cv.perDay, 2)],
    [T('TRACK SPACING AT EQUATOR','РАССТОЯНИЕ МЕЖДУ ТРАССАМИ'), fmtInt(Cv.spacing) + T(' km',' км')],
    [T('DAYS TO COVER THE EQUATOR','ДНЕЙ ДЛЯ ПОКРЫТИЯ ЭКВАТОРА'), Cv.days],
    [T('REAL CYCLE','РЕАЛЬНЫЙ ЦИКЛ'), Math.abs(h - 705) < 3 && Math.abs(w - 185) < 3 ? T('16 days [2]','16 сут [2]') : Math.abs(h - 786) < 3 && Math.abs(w - 290) < 3 ? T('10 days [3]','10 сут [3]') : '—']
  ]);
  hud2.textContent = Cv.days + T(' d',' сут');
  document.getElementById('covStatus').innerHTML = T('A wider swath fills the gaps sooner. Real cycles come out a little longer than this estimate because stripes are made to overlap and the repeat must be a whole number of orbits.','Более широкая полоса быстрее заполняет промежутки. Реальные циклы немного длиннее этой оценки, потому что полосы делают с перекрытием, а повторение должно составлять целое число витков.');
}
[cW, cH].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('covPre'), null); renderCov(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#covPre .btn'), function(btn){ btn.addEventListener('click', function(){ cH.value = this.getAttribute('data-h'); cW.value = this.getAttribute('data-w'); pressGroup(this.parentNode, this); renderCov(); }); });

/* ============ CH4 — RESOLUTION ============ */
var rD = document.getElementById('rD'), rH = document.getElementById('rH'), lamUm = 0.65;
function gsd(lamUm, Dm, hKm){ return 1.22*lamUm*1e-6*hKm*1000/Dm; }
function renderRes(){
  var D = Math.pow(10, +rD.value), h = +rH.value, g = gsd(lamUm, D, h);
  document.getElementById('rDVal').textContent = D < 1 ? fmt(D*100, 1) + T(' cm',' см') : fmt(D, 2) + T(' m',' м');
  document.getElementById('rHVal').textContent = fmtInt(h) + T(' km',' км');
  var svg = document.getElementById('resSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 220;
  function X(lg){ return L + (lg + 2)/2.5*(R - L); }
  function Y(m){ return B - (Math.log10(m) + 1)/4*(B - Tp); }        // 0.1 m … 1 km
  [0.1,1,10,100,1000].forEach(function(m){ ns('line', {x1:L, y1:Y(m), x2:R, y2:Y(m), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(m) + 3, m >= 1 ? fmtInt(m) + T(' m',' м') : '0.1 m', 'svg-small', 'end'); });
  [0.01,0.1,1,3].forEach(function(d){ txt(svg, X(Math.log10(d)), B + 14, d >= 1 ? d + ' m' : (d*100) + ' cm', 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('aperture (log)','апертура (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('finest ground detail (log)','самая мелкая деталь на земле (лог.)'), 'svg-small');
  [[30, 'Landsat 30 m'], [10, 'Sentinel-2 10 m']].forEach(function(r){ ns('line', {x1:L, y1:Y(r[0]), x2:R, y2:Y(r[0]), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg); txt(svg, R - 2, Y(r[0]) - 4, r[1], 'svg-small', 'end'); });
  var d = ''; for(var lg = -2; lg <= 0.5001; lg += 0.02){ var v = gsd(lamUm, Math.pow(10, lg), h); d += (d ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(Math.max(0.1, Math.min(1000, v))).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(+rD.value), cy:Y(Math.max(0.1, Math.min(1000, g))), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('resReadout'), [
    [T('DIFFRACTION LIMIT ON THE GROUND','ДИФРАКЦИОННЫЙ ПРЕДЕЛ НА ЗЕМЛЕ'), g < 1 ? fmt(g*100, 0) + T(' cm',' см') : fmt(g, g < 10 ? 2 : 1) + T(' m',' м')],
    [T('ANGLE','УГОЛ'), fmt(1.22*lamUm*1e-6/D*1e6, 2) + T(' µrad',' мкрад')],
    [T('APERTURE FOR 30 m','АПЕРТУРА ДЛЯ 30 м'), fmt(1.22*lamUm*1e-6*h*1000/30*100, 1) + T(' cm',' см')],
    [T('APERTURE FOR 10 m','АПЕРТУРА ДЛЯ 10 м'), fmt(1.22*lamUm*1e-6*h*1000/10*100, 1) + T(' cm',' см')]
  ]);
  document.getElementById('resStatus').innerHTML = lamUm > 5
    ? T('In thermal infrared the same telescope is about 17 times coarser than in red light.','В тепловом ИК тот же телескоп даёт примерно в 17 раз более грубую картинку, чем в красном свете.')
    : T('In visible light a few centimetres of aperture already beats 30 m pixels — survey telescopes are limited by detector pixels and data volume, not by diffraction.','В видимом свете уже несколько сантиметров апертуры дают лучше 30-метровых пикселей — обзорные телескопы ограничены пикселями детектора и объёмом данных, а не дифракцией.');
}
[rD, rH].forEach(function(el){ el.addEventListener('input', renderRes); });
Array.prototype.forEach.call(document.querySelectorAll('#resBand .btn'), function(btn){ btn.addEventListener('click', function(){ lamUm = +this.getAttribute('data-l'); pressGroup(this.parentNode, this); renderRes(); }); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1972', '<b>23 July:</b> ERTS-1, later Landsat 1, launched: 917 km, 99.2°, 9:42 a.m. crossing, 80 m pixels, 18-day cycle [1].', '<b>23 июля:</b> запуск ERTS-1 (позже Landsat 1): 917 км, 99,2°, пересечение экватора в 9:42, пиксели 80 м, цикл 18 суток [1].'],
  ['1978', '<b>6 January:</b> Landsat 1 decommissioned [1].', '<b>6 января:</b> Landsat 1 выведен из эксплуатации [1].'],
  ['Today', 'Sentinel-2 satellites in a 786 km, 98.62°, 10:30 orbit, 290 km swath, 10 m pixels [3].', 'Спутники Sentinel-2 на орбите 786 км, 98,62°, 10:30, полоса 290 км, пиксели 10 м [3].'],
  ['2021', '<b>27 September:</b> Landsat 9 launched: 705 km, 98.2°, 10:12 a.m. crossing, 16-day cycle [2].', '<b>27 сентября:</b> запуск Landsat 9: 705 км, 98,2°, пересечение в 10:12, цикл 16 суток [2].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA, “Landsat 1” mission page', url:'https://landsat.gsfc.nasa.gov/satellites/landsat-1/', note:{en:'ERTS-1 launched 23 July 1972, decommissioned 6 January 1978; 917 km, 99.2°, sun-synchronous, 9:42 a.m. descending node, 103 min, 185 km swath, 80 m, 18-day cycle.', ru:'ERTS-1 запущен 23 июля 1972, выведен из эксплуатации 6 января 1978; 917 км, 99,2°, солнечно-синхронная, нисходящий узел в 9:42, 103 мин, полоса 185 км, 80 м, цикл 18 суток.'}},
  {title:'NASA, “Landsat 9” mission page', url:'https://landsat.gsfc.nasa.gov/satellites/landsat-9/', note:{en:'Launched 27 September 2021; 705 km, 98.2°, 10:12 a.m. (± 5 min) descending node, 99 min, ~14.5 orbits/day, 16-day cycle, 185 km swath, 30/15/100 m, WRS-2.', ru:'Запущен 27 сентября 2021; 705 км, 98,2°, нисходящий узел в 10:12 (± 5 мин), 99 мин, ~14,5 витка в сутки, цикл 16 суток, полоса 185 км, 30/15/100 м, WRS-2.'}},
  {title:'ESA / Copernicus SentiWiki, “Sentinel-2 Mission”', url:'https://sentiwiki.copernicus.eu/web/s2-mission', note:{en:'Twin satellites phased 180°; 786 km, 98.62°, 100.6 min, 10-day cycle, 10:30 MLST descending node chosen between illumination and cloud cover; 290 km swath; 10, 20 and 60 m bands.', ru:'Два спутника со сдвигом 180°; 786 км, 98,62°, 100,6 мин, цикл 10 суток, нисходящий узел в 10:30 MLST (компромисс между освещённостью и облачностью); полоса 290 км; каналы 10, 20 и 60 м.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderSso();
  renderCov();
  renderRes();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__sso = {ssoInc:ssoInc, period:period, coverage:coverage, gsd:gsd, nodeRate:nodeRate};
