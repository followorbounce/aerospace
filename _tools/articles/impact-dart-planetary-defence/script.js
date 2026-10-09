/* ============ CONSTANTS (Daly et al. 2023 [1], Thomas et al. 2023 [2], Cheng et al. 2023 [3]) ============ */
var G_N = 6.674e-11, KT = 4.185e12, RHO_STONE = 3000;
var M_DART = 579.4, U_DART = 6144.9;                      // kg, m/s
var V_DIMO = 0.00181e9, M_SYS = 5.6e11;                   // m³, kg
var P0 = 11.92148*3600;                                   // s, pre-impact period
var A_ORB = Math.pow(G_N*M_SYS*P0*P0/(4*Math.PI*Math.PI), 1/3);   // m
var V_ORB = 2*Math.PI*A_ORB/P0;                           // m/s
var DVT_MEAS = 2.70e-3, BETA_REF = 3.61, RHO_REF = 2400;
var F_GEOM = DVT_MEAS/(BETA_REF*M_DART*U_DART/(RHO_REF*V_DIMO));
function dimo(beta, rho){ var M = rho*V_DIMO, dv = F_GEOM*beta*M_DART*U_DART/M; return {M:M, dv:dv, dP:-3*dv/V_ORB*P0}; }
function impactEnergy(D, vkms){ var m = Math.PI/6*D*D*D*RHO_STONE; return {m:m, E:0.5*m*vkms*vkms*1e6}; }
var V_ESC_E = Math.sqrt(2*MU_E/R_E), V_INF = 10, R_TARGET = R_E*Math.sqrt(1 + (V_ESC_E/V_INF)*(V_ESC_E/V_INF));   // km
var YEAR = 365.25*86400, DV_SYS = BETA_REF*M_DART*U_DART/M_SYS;   // m/s, rough heliocentric push on the pair
function drift(dvMms, years){ return 3*dvMms*1e-3*years*YEAR/1000; }   // km

function energyStr(Ekt){ return Ekt >= 1e6 ? fmt(Ekt/1e6, Ekt >= 1e7 ? 0 : 1) + T(' Gt',' Гт') : Ekt >= 1e3 ? fmt(Ekt/1e3, Ekt >= 1e4 ? 0 : 1) + T(' Mt',' Мт') : Ekt >= 1 ? fmt(Ekt, Ekt >= 10 ? 0 : 1) + T(' kt',' кт') : fmt(Ekt*1000, Ekt*1000 >= 10 ? 0 : 1) + T(' t TNT',' т ТНТ'); }

/* ============ CH1 — IMPACT ENERGY ============ */
var kD = document.getElementById('kD'), kV = document.getElementById('kV');
function renderEnergy(){
  var D = Math.pow(10, +kD.value), v = +kV.value, I = impactEnergy(D, v), Ekt = I.E/KT;
  document.getElementById('kDVal').textContent = (D < 10 ? fmt(D, 1) : fmtInt(D)) + T(' m',' м');
  document.getElementById('kVVal').textContent = fmt(v, 1) + T(' km/s',' км/с');
  var svg = document.getElementById('energySvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250;
  function X(d){ return L + Math.log10(d)/3*(R - L); }
  function Y(e){ return B - (Math.log10(e) + 2)/11*(B - Tp); }       // 0.01 kt … 1e9 kt
  [[0.01,'10 t'],[1,'1 kt'],[1e3,'1 Mt'],[1e6,'1 Gt'],[1e9,'1 Tt']].forEach(function(e){ ns('line', {x1:L, y1:Y(e[0]), x2:R, y2:Y(e[0]), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(e[0]) + 3, e[1], 'svg-small', 'end'); });
  [1,10,100,1000].forEach(function(d){ txt(svg, X(d), B + 14, fmtInt(d) + T(' m',' м'), 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('diameter (log)','диаметр (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('impact energy, TNT equivalent (log)','энергия удара, тротиловый эквивалент (лог.)'), 'svg-small');
  ns('line', {x1:X(151), y1:Tp, x2:X(151), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(151) - 3, Tp + 10, T('Dimorphos-size','размер Диморфа'), 'svg-small', 'end');
  var d = '';
  for(var lg = 0; lg <= 3.0001; lg += 0.02){ var dd = Math.pow(10, lg); d += (lg === 0 ? 'M' : 'L') + X(dd).toFixed(1) + ' ' + Y(impactEnergy(dd, v).E/KT).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  var cx = X(19), cy = Y(500);
  ns('path', {d:'M' + (cx - 6) + ' ' + cy + 'L' + (cx + 6) + ' ' + cy + 'M' + cx + ' ' + (cy - 6) + 'L' + cx + ' ' + (cy + 6), stroke:'#2f5aa1', 'stroke-width':2}, svg);
  txt(svg, cx - 8, cy - 8, T('Chelyabinsk','Челябинск'), 'svg-small', 'end');
  ns('circle', {cx:X(D), cy:Y(Ekt), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('energyReadout'), [
    [T('MASS','МАССА'), I.m >= 1e9 ? fmt(I.m/1e9, 1) + T(' million t',' млн т') : I.m >= 1e3 ? fmtInt(I.m/1e3) + T(' t',' т') : fmtInt(I.m) + T(' kg',' кг')],
    [T('ENERGY','ЭНЕРГИЯ'), energyStr(Ekt)],
    [T('× CHELYABINSK (500 kt)','× ЧЕЛЯБИНСК (500 кт)'), Ekt/500 >= 10 ? fmtInt(Ekt/500) : fmt(Ekt/500, Ekt/500 < 0.1 ? 3 : 2)],
    [T('ENERGY IN JOULES','ЭНЕРГИЯ В ДЖОУЛЯХ'), I.E.toExponential(2).replace('e+', ' × 10^')]
  ]);
  document.getElementById('energyStatus').innerHTML = D < 25
    ? T('Bodies this small usually break up and explode in the air, like Chelyabinsk; the damage comes from the blast wave.','Тела такого размера обычно разрушаются и взрываются в воздухе, как челябинское; ущерб наносит ударная волна.')
    : D < 1000
      ? T('A strike like this could devastate a city or a region. Objects in this range are the ones the survey catalogue is still missing [1].','Такой удар может опустошить город или регион. Именно таких тел ещё не хватает в каталоге обзоров [1].')
      : T('Kilometre-size: global consequences. Most of these are already known [6].','Километровое тело: глобальные последствия. Большинство таких уже известно [6].');
}
[kD, kV].forEach(function(el){ el.addEventListener('input', renderEnergy); });

/* ============ CH4 — β AND PERIOD CHANGE ============ */
var bBeta = document.getElementById('bBeta'), bRho = document.getElementById('bRho');
function renderBeta(){
  var beta = +bBeta.value, rho = +bRho.value, D = dimo(beta, rho), dPmin = D.dP/60;
  document.getElementById('bBetaVal').textContent = fmt(beta, 2);
  document.getElementById('bRhoVal').textContent = fmtInt(rho) + T(' kg/m³',' кг/м³');
  var svg = document.getElementById('betaSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250;
  function X(b){ return L + (b - 1)/4*(R - L); }
  function Y(m){ return B - m/60*(B - Tp); }
  [0,10,20,30,40,50,60].forEach(function(m){ ns('line', {x1:L, y1:Y(m), x2:R, y2:Y(m), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(m) + 3, m === 0 ? '0' : '−' + m, 'svg-small', 'end'); });
  [1,2,3,4,5].forEach(function(b){ txt(svg, X(b), B + 14, b, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('momentum enhancement β','усиление импульса β'), 'svg-small', 'end'); txt(svg, L, 13, T('change in orbital period, minutes','изменение периода обращения, минуты'), 'svg-small');
  ns('rect', {x:L, y:Y(34), width:R - L, height:Y(32) - Y(34), fill:'#2f5aa1', opacity:0.15}, svg);
  txt(svg, L + 6, Y(34) - 4, T('measured −33.0 ± 1.0 min','измерено −33,0 ± 1,0 мин'), 'svg-small');
  var dd = '';
  for(var b = 1; b <= 5.0001; b += 0.05) dd += (b === 1 ? 'M' : 'L') + X(b).toFixed(1) + ' ' + Y(Math.min(60, -dimo(b, rho).dP/60)).toFixed(1);
  ns('path', {d:dd, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(beta), cy:Y(Math.min(60, -dPmin)), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('betaReadout'), [
    [T('MASS OF DIMORPHOS','МАССА ДИМОРФА'), fmt(D.M/1e9, 2) + T(' × 10⁹ kg',' × 10⁹ кг')],
    [T('ALONG-TRACK Δv','Δv ВДОЛЬ ОРБИТЫ'), fmt(D.dv*1000, 2) + T(' mm/s',' мм/с')],
    [T('PERIOD CHANGE','ИЗМЕНЕНИЕ ПЕРИОДА'), '−' + fmt(-dPmin, 1) + T(' min',' мин')],
    [T('ORBITAL SPEED OF DIMORPHOS','ОРБИТАЛЬНАЯ СКОРОСТЬ ДИМОРФА'), fmt(V_ORB*100, 1) + T(' cm/s',' см/с')]
  ]);
  hud1.textContent = fmt(D.dv*1000, 2) + T(' mm/s',' мм/с'); hud2.textContent = '−' + fmt(-dPmin, 1) + T(' min',' мин');
  var off = -dPmin - 33.0;
  document.getElementById('betaStatus').innerHTML = Math.abs(off) <= 1
    ? T('<b>Matches the measurement.</b> This pair of β and density is consistent with what telescopes saw.','<b>Совпадает с измерением.</b> Эта пара β и плотности согласуется с наблюдениями телескопов.')
    : (off < 0 ? T('Too small a change: for this density, the ejecta must have pushed harder (larger β).','Слишком малое изменение: при такой плотности выброс должен был толкнуть сильнее (β больше).')
               : T('Too large a change: for this density, β must be smaller.','Слишком большое изменение: при такой плотности β должен быть меньше.')) + T(' β = 1 would mean no help from the ejecta at all.',' β = 1 означало бы, что выброс совсем не помог.');
}
[bBeta, bRho].forEach(function(el){ el.addEventListener('input', renderBeta); });

/* ============ CH5 — WARNING TIME ============ */
var wDv = document.getElementById('wDv'), wT = document.getElementById('wT');
function renderWarn(){
  var dv = Math.pow(10, +wDv.value), yrs = +wT.value, s = drift(dv, yrs), need = R_TARGET/(3*yrs*YEAR/1000)*1000;   // mm/s
  document.getElementById('wDvVal').textContent = (dv < 1 ? fmt(dv, dv < 0.1 ? 3 : 2) : fmt(dv, dv < 10 ? 1 : 0)) + T(' mm/s',' мм/с');
  document.getElementById('wTVal').textContent = fmt(yrs, yrs < 1 ? 2 : (yrs % 1 ? 2 : 0)) + T(' years',' лет');
  var svg = document.getElementById('warnSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250;
  function X(y){ return L + y/30*(R - L); }
  function Y(re){ return B - (Math.log10(Math.max(re, 1e-3)) + 3)/6*(B - Tp); }   // 0.001 … 1000 Earth radii
  [0.001,0.01,0.1,1,10,100,1000].forEach(function(r){ ns('line', {x1:L, y1:Y(r), x2:R, y2:Y(r), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(r) + 3, r >= 1 ? fmtInt(r) : String(r).replace('.', T('.', ',')), 'svg-small', 'end'); });
  [0,5,10,15,20,25,30].forEach(function(y){ txt(svg, X(y), B + 14, y, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('warning time, years','время предупреждения, лет'), 'svg-small', 'end'); txt(svg, L, 13, T('drift along the orbit, Earth radii (log)','смещение вдоль орбиты, земные радиусы (лог.)'), 'svg-small');
  var need1 = R_TARGET/R_E;
  ns('rect', {x:L, y:Tp, width:R - L, height:Y(need1) - Tp, fill:'#2f5aa1', opacity:0.07}, svg);
  ns('line', {x1:L, y1:Y(need1), x2:R, y2:Y(need1), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(need1) - 4, T('misses Earth','промах мимо Земли'), 'svg-small', 'end');
  function curve(v, col, dash){ var p = ''; for(var y = 0.1; y <= 30.0001; y += 0.1) p += (p ? 'L' : 'M') + X(y).toFixed(1) + ' ' + Y(drift(v, y)/R_E).toFixed(1); var a = {d:p, fill:'none', stroke:col, 'stroke-width':2}; if(dash) a['stroke-dasharray'] = dash; ns('path', a, svg); }
  curve(DV_SYS*1000, '#8a8a82', '5 3');
  txt(svg, X(29), Y(drift(DV_SYS*1000, 29)/R_E) + 14, T('DART on the whole pair','DART для всей пары'), 'svg-small', 'end');
  curve(dv, '#0b0b0c');
  ns('circle', {cx:X(yrs), cy:Y(s/R_E), r:5, fill: s >= R_TARGET ? '#0b0b0c' : '#b5452a'}, svg);
  cells(document.getElementById('warnReadout'), [
    [T('DRIFT','СМЕЩЕНИЕ'), s >= 1e5 ? fmt(s/1e6, 2) + T(' million km',' млн км') : fmtInt(s) + T(' km',' км')],
    [T('IN EARTH RADII','В ЗЕМНЫХ РАДИУСАХ'), fmt(s/R_E, s/R_E < 0.1 ? 3 : 2)],
    [T('NEEDED TO MISS','НУЖНО ДЛЯ ПРОМАХА'), fmtInt(R_TARGET) + T(' km',' км')],
    [T('MINIMUM PUSH FOR THIS TIME','МИН. ТОЛЧОК ДЛЯ ЭТОГО СРОКА'), fmt(need, need < 1 ? 2 : 1) + T(' mm/s',' мм/с')]
  ]);
  document.getElementById('warnStatus').innerHTML = s >= R_TARGET
    ? T('<b>Miss.</b> The asteroid arrives far enough off schedule that Earth is somewhere else.','<b>Промах.</b> Астероид приходит настолько не вовремя, что Земли в этой точке уже нет.')
    : T('<b>Still a hit.</b> Push harder, or — far cheaper — find it earlier.','<b>Всё ещё попадание.</b> Толкните сильнее или — гораздо дешевле — найдите его раньше.');
}
[wDv, wT].forEach(function(el){ el.addEventListener('input', renderWarn); });

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1908', 'Tunguska airburst over Siberia — the last event larger than Chelyabinsk [7].', 'Тунгусский воздушный взрыв над Сибирью — последнее событие мощнее челябинского [7].'],
  ['2013', '<b>15 February:</b> the ~19 m Chelyabinsk asteroid explodes with ~500 kt [6][7].', '<b>15 февраля:</b> челябинский астероид поперечником ~19 м взрывается с энергией ~500 кт [6][7].'],
  ['2021', '<b>24 November:</b> DART launches.', '<b>24 ноября:</b> старт DART.'],
  ['2022', '<b>11 September:</b> LICIACube released. <b>26 September, 23:14 UTC:</b> DART hits Dimorphos at 6.1 km/s.', '<b>11 сентября:</b> отделение LICIACube. <b>26 сентября, 23:14 UTC:</b> DART врезается в Диморф на скорости 6,1 км/с.'],
  ['2023', 'Results published: period change −33.0 ± 1.0 min, β ≈ 3.6, Hubble images of the ejecta tail.', 'Опубликованы результаты: изменение периода −33,0 ± 1,0 мин, β ≈ 3,6, снимки «Хаббла» с хвостом выброса.'],
  ['2024', '<b>7 October:</b> ESA\'s Hera launches.', '<b>7 октября:</b> старт «Геры» ЕКА.'],
  ['2025', '<b>March:</b> Hera flies past Mars.', '<b>Март:</b> «Гера» пролетает мимо Марса.'],
  ['2026', '<b>October:</b> Hera sees Didymos for the first time; rendezvous due in November.', '<b>Октябрь:</b> «Гера» впервые видит Дидим; встреча намечена на ноябрь.'],
  ['2029', 'Apophis makes a rare close pass by Earth; OSIRIS-APEX follows it.', 'Апофис совершает редкое близкое сближение с Землёй; за ним следит OSIRIS-APEX.']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'R. T. Daly et al. (2023), “Successful kinetic impact into an asteroid for planetary defence”, Nature 616, 443–447', url:'https://doi.org/10.1038/s41586-023-05810-5', note:{en:'Launch 24 November 2021; impact 23:14:24 UTC on 26 September 2022 at 6.1449 km/s; mass 579.4 kg; 10.94 GJ; impact 25 m from the centre of figure between two boulders; Dimorphos 177 × 174 × 116 m, 151 m equivalent diameter; Didymos 761 m; system mass 5.6 × 10¹¹ kg; no known asteroid threatens Earth for at least a century.', ru:'Старт 24 ноября 2021; удар в 23:14:24 UTC 26 сентября 2022 на скорости 6,1449 км/с; масса 579,4 кг; 10,94 ГДж; удар в 25 м от центра фигуры между двумя валунами; Диморф 177 × 174 × 116 м, эквивалентный диаметр 151 м; Дидим 761 м; масса системы 5,6 × 10¹¹ кг; ни один известный астероид не угрожает Земле как минимум столетие.'}},
  {title:'C. A. Thomas et al. (2023), “Orbital period change of Dimorphos due to the DART kinetic impact”, Nature 616, 448–451', url:'https://doi.org/10.1038/s41586-023-05805-2', note:{en:'Pre-impact period 11.92148 ± 0.00013 h; post-impact 11.372 h; change −33.0 ± 1.0 (3σ) min; ~7 min expected for a perfectly inelastic collision.', ru:'Период до удара 11,92148 ± 0,00013 ч; после — 11,372 ч; изменение −33,0 ± 1,0 (3σ) мин; для абсолютно неупругого удара ожидалось ~7 мин.'}},
  {title:'A. F. Cheng et al. (2023), “Momentum transfer from the DART mission kinetic impact on asteroid Dimorphos”, Nature 616, 457–460', url:'https://doi.org/10.1038/s41586-023-05878-z', note:{en:'Along-track Δv = 2.70 ± 0.10 mm/s; β = 2.2–4.9 for densities 1,500–3,300 kg/m³; β = 3.61 (+0.19/−0.25) at 2,400 kg/m³.', ru:'Δv вдоль орбиты 2,70 ± 0,10 мм/с; β = 2,2–4,9 при плотностях 1500–3300 кг/м³; β = 3,61 (+0,19/−0,25) при 2400 кг/м³.'}},
  {title:'J.-Y. Li et al. (2023), “Ejecta from the DART-produced active asteroid Dimorphos”, Nature 616, 452–456', url:'https://doi.org/10.1038/s41586-023-05811-4', note:{en:'Hubble observations from 15 minutes to 18.5 days after impact; evolution of the ejecta into a sustained tail.', ru:'Наблюдения «Хаббла» с 15 минут до 18,5 суток после удара; превращение выброса в устойчивый хвост.'}},
  {title:'E. Dotto et al. (2024), “The Dimorphos ejecta plume properties revealed by LICIACube”, Nature 627, 505–509', url:'https://doi.org/10.1038/s41586-023-06998-2', note:{en:'LICIACube released 15 days before impact; data from 71 s before to 320 s after; plume cone 140 ± 4°; ejecta from tens of m/s to ~500 m/s; system brightened 8.3 times.', ru:'LICIACube отделён за 15 дней до удара; данные с 71 с до удара по 320 с после; конус выброса 140 ± 4°; скорости выброса от десятков м/с до ~500 м/с; блеск системы вырос в 8,3 раза.'}},
  {title:'P. G. Brown et al. (2013), “A 500-kiloton airburst over Chelyabinsk and an enhanced hazard from small impactors”, Nature 503, 238–241', url:'https://doi.org/10.1038/nature12741', note:{en:'Asteroid about 19 m (17–20 m) across; energy ~500 ± 100 kt TNT (1 kt = 4.185 × 10¹² J); most kilometre-size near-Earth asteroids now known; more 10–50 m impactors than earlier estimates.', ru:'Астероид поперечником около 19 м (17–20 м); энергия ~500 ± 100 кт ТНТ (1 кт = 4,185 × 10¹² Дж); большинство километровых астероидов уже известны; тел размером 10–50 м больше, чем считалось.'}},
  {title:'O. P. Popova et al. (2013), “Chelyabinsk Airburst, Damage Assessment, Meteorite Recovery, and Characterization”, Science 342, 1069–1073', url:'https://doi.org/10.1126/science.1242642', note:{en:'The 15 February 2013 event, the largest airburst since Tunguska in 1908, over a region of more than a million people.', ru:'Событие 15 февраля 2013 года — крупнейший воздушный взрыв со времён Тунгусского (1908) над регионом с населением больше миллиона человек.'}},
  {title:'ESA, Hera mission pages', url:'https://www.esa.int/Space_Safety/Hera', note:{en:'Launch 7 October 2024; Mars flyby March 2025; first view of Didymos October 2026; rendezvous November 2026; 12 payloads and 2 CubeSats; first survey of a binary asteroid.', ru:'Старт 7 октября 2024; пролёт Марса в марте 2025; первый снимок Дидима в октябре 2026; встреча в ноябре 2026; 12 приборов и 2 кубсата; первое исследование двойного астероида.'}},
  {title:'NASA Science, OSIRIS-REx mission page (OSIRIS-APEX)', url:'https://science.nasa.gov/mission/osiris-rex/', note:{en:'OSIRIS-APEX will study the physical changes to Apophis after its rare close encounter with Earth in 2029.', ru:'OSIRIS-APEX изучит физические изменения Апофиса после его редкого близкого сближения с Землёй в 2029 году.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderEnergy();
  renderBeta();
  renderWarn();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__impact = {dimo:dimo, impactEnergy:impactEnergy, drift:drift, A_ORB:A_ORB, V_ORB:V_ORB, F_GEOM:F_GEOM, R_TARGET:R_TARGET, DV_SYS:DV_SYS, KT:KT, M_DART:M_DART, U_DART:U_DART};
