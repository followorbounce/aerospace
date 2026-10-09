/* ============ CONSTANTS (NASA Moon fact sheet [6]) ============ */
var D_EM = 384400, R_M = 1737.4, GM_M = 4902.8, MU_EM = 0.0123/(1 + 0.0123);

/* ============ CH3 — TIDAL LOCK ============ */
var lockMode = 'on', lockT = 0;
function drawLock(){
  var svg = document.getElementById('lockSvg'); svg.innerHTML = '';
  var cx = 240, cy = 190, ro = 140, re = 34, rm = 18;
  ns('circle', {cx:cx, cy:cy, r:ro, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'4 4'}, svg);
  ns('circle', {cx:cx, cy:cy, r:re, fill:'#e9eef5', stroke:'#0b0b0c'}, svg);
  txt(svg, cx, cy + 4, T('EARTH','ЗЕМЛЯ'), 'svg-small', 'middle');
  var a = lockT*2*Math.PI;                         // orbital angle (one orbit = 1 unit of lockT)
  var mx = cx + ro*Math.cos(a), my = cy - ro*Math.sin(a);
  // body rotation angle: locked → same as orbital angle; none → 0; fast → 5× orbital
  var spin = lockMode === 'on' ? a : lockMode === 'off' ? 0 : 5*a;
  ns('circle', {cx:mx, cy:my, r:rm, fill:'#d8d4c8', stroke:'#0b0b0c'}, svg);
  // near-side hemisphere shading: the half facing "spin + π" direction (toward Earth when locked)
  var nearDir = spin + Math.PI;
  var p1x = mx + rm*Math.cos(nearDir - Math.PI/2), p1y = my - rm*Math.sin(nearDir - Math.PI/2);
  var p2x = mx + rm*Math.cos(nearDir + Math.PI/2), p2y = my - rm*Math.sin(nearDir + Math.PI/2);
  ns('path', {d:'M' + p1x + ' ' + p1y + ' A' + rm + ' ' + rm + ' 0 0 0 ' + p2x + ' ' + p2y + ' Z', fill:'#9a978d', opacity:0.55}, svg);
  // far-side marker (Chang'e 4 site) on the far hemisphere
  var fx = mx + rm*Math.cos(spin), fy = my - rm*Math.sin(spin);
  ns('circle', {cx:fx, cy:fy, r:4.5, fill:'#b5452a', stroke:'#fff', 'stroke-width':1.2}, svg);
  // line of sight test: does the marker face Earth? (angle between outward normal and direction to Earth)
  var toE = Math.atan2(-(cy - my), cx - mx);         // math-angle toward Earth
  var dot = Math.cos(spin - toE);
  var sees = dot > 0;
  ns('line', {x1:fx, y1:fy, x2:cx, y2:cy, stroke: sees ? '#2f5aa1' : '#c9c9c1', 'stroke-dasharray': sees ? '' : '3 3'}, svg);
  txt(svg, 14, 20, T('shaded half: the side that faces Earth when locked · red dot: a far-side lander','затенённая половина — сторона, обращённая к Земле при захвате · красная точка — аппарат на обратной стороне'), 'svg-small');
  cells(document.getElementById('lockReadout'), [
    [T('ORBIT','ОРБИТА'), fmt((lockT % 1)*27.3, 1) + T(' of 27.3 days',' из 27,3 сут')],
    [T('LANDER SEES EARTH?','АППАРАТ ВИДИТ ЗЕМЛЮ?'), sees ? T('yes','да') : T('no','нет')]
  ]);
  document.getElementById('lockStatus').innerHTML = lockMode === 'on'
    ? T('Locked: the red dot <b>never</b> faces Earth. A far-side lander needs a relay for every message.','Захват: красная точка <b>никогда</b> не смотрит на Землю. Аппарату на обратной стороне нужен ретранслятор для каждого сообщения.')
    : lockMode === 'off'
      ? T('Without spin the Moon would show us every side once a month, and the “far side” would see Earth half the time.','Без вращения Луна раз в месяц показывала бы нам все стороны, а «обратная сторона» видела бы Землю половину времени.')
      : T('Spinning fast, like the young Moon before tides slowed it: every point sees Earth several times per orbit.','При быстром вращении, как у молодой Луны до приливного торможения, каждая точка видит Землю несколько раз за виток.');
}
function setLock(m, btn){ lockMode = m; pressGroup(btn.parentNode, btn); drawLock(); }
document.getElementById('lockOn').addEventListener('click', function(){ setLock('on', this); });
document.getElementById('lockOff').addEventListener('click', function(){ setLock('off', this); });
document.getElementById('lockFast').addEventListener('click', function(){ setLock('fast', this); });
var lockAcc = 0;
visibleLoop(document.getElementById('lockSvg'), function(dt){ lockT += dt/(reduced() ? 30 : 10); lockAcc += dt; drawLock(); });

/* ============ CH4 — EARTH–MOON L2 ============ */
function solveL2(mu){
  var g = Math.pow(mu/3, 1/3);
  for(var i = 0; i < 50; i++){
    var f = Math.pow(g,5) + (3 - mu)*Math.pow(g,4) + (3 - 2*mu)*Math.pow(g,3) - mu*g*g - 2*mu*g - mu;
    var df = 5*Math.pow(g,4) + 4*(3 - mu)*Math.pow(g,3) + 3*(3 - 2*mu)*g*g - 2*mu*g - 2*mu;
    var s = f/df; g -= s; if(Math.abs(s) < 1e-15) break;
  }
  return g;
}
var GAMMA2 = solveL2(MU_EM);
function relay(offsetKm){
  var dL2 = D_EM*(1 + GAMMA2);                     // from Earth (taken at the barycentre-free Earth–Moon line)
  var minOff = R_M*dL2/D_EM;                       // offset at which the relay clears the Moon's limb seen from Earth
  var dEarth = Math.hypot(dL2, offsetKm), dMoon = Math.hypot(D_EM*GAMMA2, offsetKm);
  var visible = offsetKm > minOff;
  var delay = (dEarth + dMoon)/C_LIGHT;            // Earth → relay → lander (approx. lander at the far-side centre)
  return {dL2:dL2, beyond:D_EM*GAMMA2, minOff:minOff, visible:visible, dEarth:dEarth, dMoon:dMoon, delay:delay};
}
var hA = document.getElementById('hA');
function renderL2(){
  var off = +hA.value, R = relay(off);
  document.getElementById('hAVal').textContent = fmtInt(off) + T(' km',' км');
  var svg = document.getElementById('l2Svg'); svg.innerHTML = '';
  var L = 40, Rr = 450, cy = 180, k = (Rr - L)/R.dL2, vs = 8;      // vertical stretch ×8
  var xE = L, xM = L + D_EM*k, xL = L + R.dL2*k;
  function Y(km){ return cy - km*k*vs; }
  // Moon's shadow cone (as seen from Earth): rays from Earth past the Moon's limb
  var lim = R_M*k*vs;
  ns('path', {d:'M' + xE + ' ' + cy + ' L' + (Rr + 20) + ' ' + (cy - lim*(Rr + 20 - xE)/(xM - xE)) + ' L' + (Rr + 20) + ' ' + (cy + lim*(Rr + 20 - xE)/(xM - xE)) + ' Z', fill:'#0b0b0c', opacity:0.06}, svg);
  ns('line', {x1:xE, y1:cy, x2:Rr + 20, y2:cy, stroke:'#c9c9c1', 'stroke-dasharray':'3 4'}, svg);
  ns('circle', {cx:xE, cy:cy, r:9, fill:'#e9eef5', stroke:'#0b0b0c'}, svg); txt(svg, xE, cy + 24, T('Earth','Земля'), 'svg-small', 'middle');
  ns('ellipse', {cx:xM, cy:cy, rx:Math.max(3, R_M*k), ry:lim, fill:'#d8d4c8', stroke:'#0b0b0c'}, svg); txt(svg, xM, cy + lim + 16, T('Moon','Луна'), 'svg-small', 'middle');
  ns('line', {x1:xL - 5, y1:cy - 5, x2:xL + 5, y2:cy + 5, stroke:'#0b0b0c'}, svg); ns('line', {x1:xL - 5, y1:cy + 5, x2:xL + 5, y2:cy - 5, stroke:'#0b0b0c'}, svg);
  txt(svg, xL, cy + 22, 'L2', 'svg-label', 'middle');
  // halo loop (schematic ellipse through the chosen offset)
  if(off > 0) ns('ellipse', {cx:xL, cy:cy, rx:12, ry:off*k*vs, fill:'none', stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  var ry = Y(off);
  ns('line', {x1:xE, y1:cy, x2:xL, y2:ry, stroke: R.visible ? '#2f5aa1' : '#b5452a', 'stroke-width':1.5}, svg);
  ns('line', {x1:xL, y1:ry, x2:xM + R_M*k, y2:cy, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  ns('rect', {x:xL - 6, y:ry - 6, width:12, height:12, fill: R.visible ? '#2f5aa1' : '#b5452a'}, svg);
  txt(svg, 14, 20, T('vertical scale ×8 · shaded: hidden behind the Moon as seen from Earth','вертикаль ×8 · тень — область, закрытая Луной для наблюдателя с Земли'), 'svg-small');
  cells(document.getElementById('l2Readout'), [
    [T('L2 BEYOND THE MOON','L2 ЗА ЛУНОЙ'), fmtInt(R.beyond) + T(' km',' км')],
    [T('L2 FROM EARTH','L2 ОТ ЗЕМЛИ'), fmtInt(R.dL2) + T(' km',' км')],
    [T('MINIMUM OFFSET TO BE SEEN','МИН. ОТСТУП ДЛЯ ВИДИМОСТИ'), fmtInt(R.minOff) + T(' km',' км')],
    [T('EARTH → RELAY → LANDER DELAY','ЗАДЕРЖКА ЗЕМЛЯ → РЕТРАНСЛЯТОР → АППАРАТ'), fmt(R.delay, 2) + T(' s',' с')]
  ]);
  hud1.textContent = fmtInt(R.dEarth) + T(' km',' км'); hud2.textContent = fmt(R.delay, 2) + T(' s',' с');
  document.getElementById('l2Status').innerHTML = R.visible
    ? T('<b>Link closed.</b> Earth can see the relay past the Moon\'s edge, and the relay can see the whole far side.','<b>Связь есть.</b> С Земли ретранслятор виден из-за края Луны, а он сам видит всю обратную сторону.')
    : T('<b>Hidden.</b> From Earth the relay is behind the Moon: it needs to swing at least ','<b>Скрыт.</b> С Земли ретранслятор находится за Луной: ему нужно отойти от линии хотя бы на ') + fmtInt(R.minOff) + T(' km off the line — that is why Queqiao flies a halo orbit.',' км — поэтому «Цюэцяо» летает по гало-орбите.');
}
hA.addEventListener('input', renderL2);

/* ============ CH6 — ASCENT ============ */
var aMf = document.getElementById('aMf'), aIsp = document.getElementById('aIsp'), aDv = document.getElementById('aDv');
function ascent(mf, isp, dvKms){ var r = Math.exp(dvKms*1000/(isp*9.80665)); return {prop:mf*(r - 1), m0:mf*r, ratio:r}; }
function renderAscent(){
  var mf = +aMf.value, isp = +aIsp.value, dv = +aDv.value, A = ascent(mf, isp, dv);
  document.getElementById('aMfVal').textContent = fmtInt(mf) + T(' kg',' кг');
  document.getElementById('aIspVal').textContent = fmtInt(isp) + T(' s',' с');
  document.getElementById('aDvVal').textContent = fmt(dv, 2) + T(' km/s',' км/с');
  var svg = document.getElementById('ascentSvg'); svg.innerHTML = '';
  var L = 60, Rr = 465, Tp = 20, B = 280, iMin = 200, iMax = 460, pMax = ascent(mf, 200, 2.4).prop*1.05;
  function X(i){ return L + (i - iMin)/(iMax - iMin)*(Rr - L); }
  function Y(p){ return B - p/pMax*(B - Tp); }
  for(var j = 0; j <= 4; j++){ var pv = pMax*j/4; ns('line', {x1:L, y1:Y(pv), x2:Rr, y2:Y(pv), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(pv) + 3, fmtInt(pv), 'svg-small', 'end'); }
  [200,260,320,380,440].forEach(function(i){ txt(svg, X(i), B + 14, i + T(' s',' с'), 'svg-small', 'middle'); });
  txt(svg, L, 13, T('propellant, kg','топливо, кг'), 'svg-small'); txt(svg, Rr, B + 28, T('specific impulse','удельный импульс'), 'svg-small', 'end');
  var d = '';
  for(var i = iMin; i <= iMax; i += 2){ d += (i === iMin ? 'M' : 'L') + X(i).toFixed(1) + ' ' + Y(ascent(mf, i, dv).prop).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(isp), cy:Y(A.prop), r:5, fill:'#b5452a'}, svg);
  var perKg = A.prop/mf;
  cells(document.getElementById('ascentReadout'), [
    [T('PROPELLANT','ТОПЛИВО'), fmtInt(A.prop) + T(' kg',' кг')],
    [T('LIFT-OFF MASS','СТАРТОВАЯ МАССА'), fmtInt(A.m0) + T(' kg',' кг')],
    [T('MASS RATIO m₀/m_f','ОТНОШЕНИЕ МАСС m₀/m_f'), fmt(A.ratio, 2)],
    [T('PROPELLANT PER KG TO ORBIT','ТОПЛИВА НА 1 КГ НА ОРБИТЕ'), fmt(perKg, 2) + T(' kg',' кг')]
  ]);
  document.getElementById('ascentStatus').innerHTML = T('Every kilogram that reaches lunar orbit costs <b>','Каждый килограмм на окололунной орбите стоит <b>') + fmt(perKg, 2) + T(' kg</b> of propellant at lift-off — and all of it had to be carried to the Moon first. On Earth the same exponent would apply to ~9.4 km/s instead of 1.9.',' кг</b> топлива на старте — и всё это сначала нужно было доставить на Луну. На Земле та же экспонента относилась бы к ~9,4 км/с вместо 1,9.');
}
[aMf, aIsp, aDv].forEach(function(el){ el.addEventListener('input', renderAscent); });

/* ============ CH9 — TIMELINE ============ */
var TIMELINE = [
  ['2007', '<b>24 October:</b> Chang\'e 1 launches; enters lunar orbit on 5 November.', '<b>24 октября:</b> старт «Чанъэ-1»; выход на окололунную орбиту 5 ноября.'],
  ['2010', 'Chang\'e 2 maps the Moon at 7 m resolution, then leaves for the Sun–Earth L2 point.', '«Чанъэ-2» картографирует Луну с разрешением 7 м, затем улетает в точку L2 системы Солнце — Земля.'],
  ['2012', '<b>13 December:</b> Chang\'e 2 passes asteroid Toutatis at 1.9 km.', '<b>13 декабря:</b> «Чанъэ-2» пролетает астероид Таутатис на расстоянии 1,9 км.'],
  ['2013', '<b>14 December:</b> Chang\'e 3 and Yutu land in Mare Imbrium.', '<b>14 декабря:</b> «Чанъэ-3» и «Юйту» садятся в Море Дождей.'],
  ['2014', 'Chang\'e 5-T1 flies around the Moon and returns a capsule with a skip re-entry.', '«Чанъэ-5-T1» облетает Луну и возвращает капсулу рикошетным входом.'],
  ['2018', '<b>May:</b> Queqiao relay launched to the Earth–Moon L2 point.', '<b>Май:</b> ретранслятор «Цюэцяо» запущен к точке L2 системы Земля — Луна.'],
  ['2019', '<b>3 January:</b> Chang\'e 4 makes the first landing on the far side, in Von Kármán crater.', '<b>3 января:</b> «Чанъэ-4» совершает первую посадку на обратной стороне, в кратере фон Карман.'],
  ['2020', '<b>1 December:</b> Chang\'e 5 lands near Mons Rümker; <b>16–17 December:</b> 1,731 g returned.', '<b>1 декабря:</b> «Чанъэ-5» садится у горы Рюмкер; <b>16–17 декабря:</b> доставлено 1731 г.'],
  ['2021', 'Chang\'e 5 basalts dated to 2,030 ± 4 million years — the youngest lunar volcanic rocks known.', 'Базальты «Чанъэ-5» датированы 2030 ± 4 млн лет — самые молодые известные лунные вулканические породы.'],
  ['2024', '<b>20 March:</b> Queqiao-2. <b>June:</b> Chang\'e 6 lands in Apollo crater; <b>25 June:</b> 1,935.3 g of far-side samples returned.', '<b>20 марта:</b> «Цюэцяо-2». <b>Июнь:</b> «Чанъэ-6» садится в кратере Аполлон; <b>25 июня:</b> доставлено 1935,3 г образцов обратной стороны.']
];

/* ============ CH10 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Chang\'e 1, Chang\'e 2 (7 m map, L2, Toutatis at 1.9 km), Chang\'e 3 and Yutu (landing 14 December 2013, 13:11 UT, Mare Imbrium) and the Chang\'e 5-T1 skip re-entry test.', ru:'«Чанъэ-1», «Чанъэ-2» (карта 7 м, L2, Таутатис на 1,9 км), «Чанъэ-3» и «Юйту» (посадка 14 декабря 2013, 13:11 UT, Море Дождей) и испытание рикошетного входа «Чанъэ-5-T1».'}},
  {title:'Xinhua via China Aerospace Science and Technology Corporation (2018), “China launches relay satellite to explore Moon\'s far side”', url:'https://english.spacechina.com/n17212/c1872815/content.html', note:{en:'Queqiao\'s launch on a Long March-4C and its planned halo orbit around the Earth–Moon L2 point, about 455,000 km from Earth.', ru:'Запуск «Цюэцяо» ракетой «Чанчжэн-4C» и планируемая гало-орбита вокруг точки L2 системы Земля — Луна, около 455 000 км от Земли.'}},
  {title:'C. Li et al. (2019), “Chang\'E-4 initial spectroscopic identification of lunar far-side mantle-derived materials”, Nature 569', url:'https://doi.org/10.1038/s41586-019-1189-0', note:{en:'The landing in Von Kármán crater in the South Pole–Aitken basin and Yutu-2\'s olivine- and low-calcium-pyroxene-rich spectra.', ru:'Посадка в кратере фон Карман в бассейне Южный полюс — Эйткен и спектры «Юйту-2», богатые оливином и низкокальциевым пироксеном.'}},
  {title:'National Astronomical Observatories, CAS (2020), “China\'s Chang\'e-5 retrieves 1,731 grams of moon samples”', url:'https://english.nao.cas.cn/ne2015/News2015/202012/t20201221_260671.html', note:{en:'CNSA\'s announcement of the 1,731 g Chang\'e 5 sample and its handover to the Chinese Academy of Sciences.', ru:'Объявление CNSA о 1731 г образцов «Чанъэ-5» и их передаче Академии наук Китая.'}},
  {title:'Q.-L. Li et al. (2021), “Two-billion-year-old volcanism on the Moon from Chang\'e-5 basalts”, Nature 600', url:'https://doi.org/10.1038/s41586-021-04100-2', note:{en:'Lead–lead age of 2,030 ± 4 million years for Chang\'e 5 basalt clasts — the youngest radiometric age for lunar basalt.', ru:'Свинец-свинцовый возраст 2030 ± 4 млн лет для обломков базальта «Чанъэ-5» — самый молодой радиометрический возраст лунного базальта.'}},
  {title:'X. Che et al. (2021), “Age and composition of young basalts on the Moon, measured from samples returned by Chang\'e-5”, Science 374', url:'https://doi.org/10.1126/science.abl7957', note:{en:'Independent dating to about 2 billion years and the puzzle of a heat source for such late volcanism.', ru:'Независимая датировка около 2 млрд лет и загадка источника тепла для столь позднего вулканизма.'}},
  {title:'L. Xin (2024), “China\'s Chang\'e-6 collects first rock samples from Moon\'s far side”, Nature (news)', url:'https://doi.org/10.1038/d41586-024-01625-0', note:{en:'The Chang\'e 6 landing in the Apollo crater of the South Pole–Aitken basin and its sampling.', ru:'Посадка «Чанъэ-6» в кратере Аполлон бассейна Южный полюс — Эйткен и сбор образцов.'}},
  {title:'National Astronomical Observatories, CAS (2024), “Chinese Scientists analyze first lunar farside samples collected from the other half of the Moon”', url:'https://english.nao.cas.cn/focus/202409/t20240924_690449.html', note:{en:'1,935.3 g of samples from the South Pole–Aitken basin, returned 25 June 2024, gathered by drilling and scooping.', ru:'1935,3 г образцов из бассейна Южный полюс — Эйткен, доставлены 25 июня 2024 года, собраны бурением и зачерпыванием.'}},
  {title:'Q. W. L. Zhang et al. (2024), “Lunar farside volcanism 2.8 billion years ago from Chang\'e-6 basalts”, Nature', url:'https://doi.org/10.1038/s41586-024-08382-0', note:{en:'Dating of far-side mare basalt from the Chang\'e 6 samples to about 2.8 billion years.', ru:'Датирование базальта обратной стороны из образцов «Чанъэ-6» — около 2,8 млрд лет.'}},
  {title:'Science and Technology Daily (2024), “Queqiao 2 Paves the Way for Future Lunar Missions”', url:'https://stdaily.com/web/English/2024-03/26/content_1955436.html', note:{en:'Queqiao-2\'s launch on 20 March 2024 on a Long March 8 from Wenchang, to relay for Chang\'e 6 and the later Chang\'e 7 and 8.', ru:'Запуск «Цюэцяо-2» 20 марта 2024 года ракетой «Чанчжэн-8» с Вэньчана для ретрансляции «Чанъэ-6» и последующих «Чанъэ-7» и «Чанъэ-8».'}},
  {title:'NASA, Moon Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'Mean Earth–Moon distance 384,400 km, mean radius 1,737.4 km, GM 4,902.8 km³/s², mass ratio 0.0123, orbital period 27.3 days.', ru:'Среднее расстояние Земля — Луна 384 400 км, средний радиус 1737,4 км, GM 4902,8 км³/с², отношение масс 0,0123, период обращения 27,3 сут.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  drawLock();
  renderL2();
  renderAscent();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__rabbit = {solveL2:solveL2, GAMMA2:GAMMA2, relay:relay, ascent:ascent, MU_EM:MU_EM};
