/* ============ ISENTROPIC NOZZLE (NASA Glenn [1][2]) ============ */
function areaRatio(M, g){ return (1/M)*Math.pow((2/(g + 1))*(1 + (g - 1)/2*M*M), (g + 1)/(2*(g - 1))); }
function machFromArea(eps, g){ var lo = 1, hi = 50; for(var k = 0; k < 100; k++){ var m = 0.5*(lo + hi); if(areaRatio(m, g) < eps) lo = m; else hi = m; } return 0.5*(lo + hi); }
function pRatio(M, g){ return Math.pow(1 + (g - 1)/2*M*M, -g/(g - 1)); }
function tRatio(M, g){ return 1/(1 + (g - 1)/2*M*M); }
function cF(eps, g, pc, pa){
  var Me = machFromArea(eps, g), pe = pRatio(Me, g)*pc;
  var mom = Math.sqrt(2*g*g/(g - 1)*Math.pow(2/(g + 1), (g + 1)/(g - 1))*(1 - Math.pow(pe/pc, (g - 1)/g)));
  return {cf:mom + eps*(pe - pa)/pc, Me:Me, pe:pe};
}
var PSI = 6894.757, P0 = 101325, H_SCALE = 7200;
function pAir(hkm){ return P0*Math.exp(-hkm*1000/H_SCALE); }
var nE = document.getElementById('nE'), nG = document.getElementById('nG');

/* ============ CH1 — NOZZLE SHAPE ============ */
function renderNoz(){
  var eps = +nE.value, g = +nG.value, Me = machFromArea(eps, g), pr = pRatio(Me, g), tr = tRatio(Me, g);
  document.getElementById('nEVal').textContent = fmt(eps, 1);
  document.getElementById('nGVal').textContent = fmt(g, 2);
  var svg = document.getElementById('nozSvg'); svg.innerHTML = '';
  var cy = 190, rt = 9, re = rt*Math.sqrt(eps), xc = 40, xt = 110, xe = 450, rc = 34;
  var scaleR = Math.min(1, 95/re); re *= scaleR; var rts = rt*scaleR;
  // conical-ish bell: radius grows with a smooth curve from throat to exit
  function rAt(x){ if(x <= xt){ var u = (x - xc)/(xt - xc); return rc*scaleR + (rts - rc*scaleR)*(1 - Math.pow(1 - u, 2)); } var s = (x - xt)/(xe - xt); return rts + (re - rts)*Math.sqrt(s); }
  var top = '', bot = '';
  for(var x = xc; x <= xe; x += 4){ top += (x === xc ? 'M' : 'L') + x + ' ' + (cy - rAt(x)).toFixed(1); bot += (x === xc ? 'M' : 'L') + x + ' ' + (cy + rAt(x)).toFixed(1); }
  var shape = top; for(var x2 = xe; x2 >= xc; x2 -= 4) shape += 'L' + x2 + ' ' + (cy + rAt(x2)).toFixed(1);
  ns('path', {d:shape + 'Z', fill:'#f3e3d6'}, svg);
  ns('path', {d:top, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg); ns('path', {d:bot, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('line', {x1:xt, y1:cy - rts - 14, x2:xt, y2:cy + rts + 14, stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, xt, cy + rts + 26, T('throat, M = 1','горло, M = 1'), 'svg-small', 'middle');
  txt(svg, xc, cy + rc*scaleR + 26, T('chamber','камера'), 'svg-small');
  if(scaleR < 1) txt(svg, xe, 296, T('radius compressed to fit','радиус сжат по размеру'), 'svg-small', 'end');
  // Mach along the nozzle (area ∝ r², true geometry before compression)
  var dM = '';
  function Y(M){ return 60 - M/6*50; }
  for(var x3 = xt; x3 <= xe; x3 += 4){ var s3 = (x3 - xt)/(xe - xt), rr = rt + (rt*Math.sqrt(eps) - rt)*Math.sqrt(s3), M3 = machFromArea(Math.max(1.0001, rr*rr/(rt*rt)), g); dM += (dM ? 'L' : 'M') + x3 + ' ' + Y(M3).toFixed(1); }
  ns('line', {x1:xt, y1:Y(0), x2:xe, y2:Y(0), stroke:'#e4e4de'}, svg);
  ns('path', {d:dM, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, xe, Y(Me) - 5, 'M = ' + fmt(Me, 2), 'svg-small', 'end');
  txt(svg, xt, 14, T('Mach number along the bell','число Маха вдоль колокола'), 'svg-small');
  cells(document.getElementById('nozReadout'), [
    [T('EXIT MACH NUMBER','ЧИСЛО МАХА НА СРЕЗЕ'), fmt(Me, 2)],
    [T('EXIT ÷ CHAMBER PRESSURE','ДАВЛЕНИЕ СРЕЗ ÷ КАМЕРА'), pr < 0.001 ? pr.toExponential(2) : fmt(pr, 4)],
    [T('EXIT ÷ CHAMBER TEMPERATURE','ТЕМПЕРАТУРА СРЕЗ ÷ КАМЕРА'), fmt(tr, 2)],
    [T('EXIT DIAMETER ÷ THROAT','ДИАМЕТР СРЕЗА ÷ ГОРЛО'), fmt(Math.sqrt(eps), 2)]
  ]);
  hud1.textContent = fmt(Me, 2);
  document.getElementById('nozStatus').innerHTML = T('The gas leaves at ','Газ выходит при ') + fmt(tr*100, 0) + T(' % of the chamber\'s absolute temperature: heat has been turned into directed speed. Each doubling of the area ratio adds less Mach number than the last.',' % абсолютной температуры камеры: тепло превратилось в направленную скорость. Каждое удвоение степени расширения добавляет меньше числа Маха, чем предыдущее.');
  renderAlt();
}
[nE, nG].forEach(function(el){ el.addEventListener('input', renderNoz); });

/* ============ CH2 — ALTITUDE ============ */
var aH = document.getElementById('aH');
var NOZ = [
  {en:'F-1, ε 16, 1,100 psi', ru:'F-1, ε 16, 1100 psi', eps:16, pc:1100*PSI, col:'#8a8a82'},
  {en:'RS-25, ε 77.5, 3,000 psi', ru:'RS-25, ε 77,5, 3000 psi', eps:77.5, pc:3000*PSI, col:'#0b0b0c'}
];
function renderAlt(){
  if(!aH) return;
  var h = +aH.value, g = +nG.value, mine = {en:T('your nozzle','ваше сопло'), ru:'', eps:+nE.value, pc:1100*PSI, col:'#b5452a'}, all = NOZ.concat([mine]);
  document.getElementById('aHVal').textContent = fmt(h, 1) + T(' km',' км');
  var svg = document.getElementById('altSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, cmin = 0.8, cmax = 2.0;
  function X(k){ return L + k/60*(R - L); }
  function Y(c){ return B - (c - cmin)/(cmax - cmin)*(B - Tp); }
  [0.8,1.1,1.4,1.7,2.0].forEach(function(c){ ns('line', {x1:L, y1:Y(c), x2:R, y2:Y(c), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(c) + 3, fmt(c, 1), 'svg-small', 'end'); });
  [0,10,20,30,40,50,60].forEach(function(k){ txt(svg, X(k), B + 14, k, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('altitude, km','высота, км'), 'svg-small', 'end'); txt(svg, L, 13, T('thrust coefficient C_F','коэффициент тяги C_F'), 'svg-small');
  var rows = [];
  all.forEach(function(n, i){
    var d = '';
    for(var k = 0; k <= 60.001; k += 0.5){ var c = cF(n.eps, g, n.pc, pAir(k)).cf; d += (k === 0 ? 'M' : 'L') + X(k).toFixed(1) + ' ' + Y(Math.max(cmin, Math.min(cmax, c))).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:n.col, 'stroke-width':2}, svg);
    var here = cF(n.eps, g, n.pc, pAir(h)), vac = cF(n.eps, g, n.pc, 0);
    ns('circle', {cx:X(h), cy:Y(Math.max(cmin, Math.min(cmax, here.cf))), r:4, fill:n.col}, svg);
    txt(svg, R - 2, Y(Math.min(cmax, vac.cf)) - 5 + (i === 0 ? 12 : 0), i === 2 ? T('your nozzle','ваше сопло') : T(n.en, n.ru), 'svg-small', 'end');
    rows.push([i === 2 ? T('YOUR NOZZLE (ε ','ВАШЕ СОПЛО (ε ') + fmt(n.eps, 1) + ')' : T(n.en, n.ru), fmt(here.cf, 3) + ' · ' + (here.pe > pAir(h)*1.02 ? T('under-expanded','недорасширено') : here.pe < pAir(h)*0.98 ? T('over-expanded','перерасширено') : T('matched','расчётный режим'))]);
  });
  var rs = cF(77.5, g, 3000*PSI, P0).cf/cF(77.5, g, 3000*PSI, 0).cf;
  rows.push([T('RS-25 SEA LEVEL ÷ VACUUM','RS-25: ЗЕМЛЯ ÷ ВАКУУМ'), fmt(rs, 3) + T(' (NASA: 0.816)',' (NASA: 0,816)')]);
  cells(document.getElementById('altReadout'), rows);
  hud2.textContent = fmt(cF(mine.eps, g, mine.pc, pAir(h)).cf, 3);
  document.getElementById('altStatus').innerHTML = h < 5
    ? T('Near the ground the large RS-25 bell is over-expanded and loses thrust, while the F-1\'s short nozzle is only mildly over-expanded and comes out ahead — the reason first-stage engines have short nozzles.','У земли большой колокол RS-25 перерасширен и теряет тягу, а короткое сопло F-1 перерасширено лишь слегка и выигрывает — поэтому у двигателей первых ступеней короткие сопла.')
    : T('As the air thins, the bigger nozzle pulls ahead. In vacuum, the larger the area ratio, the higher the thrust coefficient — limited only by the nozzle\'s size and weight.','По мере разрежения воздуха большое сопло вырывается вперёд. В вакууме чем больше степень расширения, тем выше коэффициент тяги — ограничивают лишь размер и масса сопла.');
}
aH.addEventListener('input', renderAlt);

/* ============ CH3 — CYCLES ============ */
var cyc = 'gg';
var CYC = {
  press:{name:['Pressure-fed','Вытеснительная подача'], ex:['small thrusters and upper stages','малые двигатели и верхние ступени'], pros:['simplest: no pumps','проще всего: нет насосов'], cons:['heavy tanks, low chamber pressure','тяжёлые баки, низкое давление в камере']},
  gg:{name:['Gas generator','С газогенератором'], ex:['F-1 [3], Merlin 1D [6]','F-1 [3], Merlin 1D [6]'], pros:['simpler turbomachinery','проще турбонасосный агрегат'], cons:['turbine exhaust thrown away','выхлоп турбины выбрасывается']},
  sc:{name:['Staged combustion','С дожиганием'], ex:['RS-25 (fuel-rich) [7]','RS-25 (с избытком горючего) [7]'], pros:['nothing wasted, high chamber pressure','ничего не теряется, высокое давление в камере'], cons:['hot, high-pressure plumbing, hard to build','горячие магистрали под высоким давлением, сложно построить']}
};
function renderCyc(){
  var svg = document.getElementById('cycSvg'); svg.innerHTML = '';
  function box(x, y, w, h, label, col){ ns('rect', {x:x, y:y, width:w, height:h, fill:col || '#f6f6f2', stroke:'#0b0b0c'}, svg); txt(svg, x + w/2, y + h/2 + 4, label, 'svg-small', 'middle'); }
  function line(d, col, dash){ var a = {d:d, fill:'none', stroke:col || '#0b0b0c', 'stroke-width':2}; if(dash) a['stroke-dasharray'] = dash; ns('path', a, svg); }
  box(30, 30, 90, 50, T('FUEL','ГОРЮЧЕЕ'), '#e9e9e3'); box(360, 30, 90, 50, T('OXIDIZER','ОКИСЛИТЕЛЬ'), '#e9e9e3');
  box(190, 200, 100, 50, T('MAIN CHAMBER','КАМЕРА'), '#f3e3d6');
  ns('path', {d:'M205 250 L275 250 L300 292 L180 292 Z', fill:'#f3e3d6', stroke:'#0b0b0c'}, svg);
  if(cyc === 'press'){
    box(200, 30, 80, 50, T('HELIUM','ГЕЛИЙ'));
    line('M200 55 L120 55'); line('M280 55 L360 55');
    line('M75 80 L75 225 L190 225'); line('M405 80 L405 225 L290 225');
  } else {
    box(195, 110, 90, 40, T('TURBOPUMPS','ТНА'));
    line('M75 80 L75 130 L195 130'); line('M405 80 L405 130 L285 130');
    line('M215 150 L215 200'); line('M265 150 L265 200');
    if(cyc === 'gg'){
      box(60, 160, 90, 36, T('GAS GENERATOR','ГАЗОГЕНЕРАТОР'), '#fbefe6');
      line('M105 160 L105 145 L195 145', '#b5452a');
      line('M105 196 L105 262 L30 262', '#b5452a', '4 3');
      txt(svg, 30, 280, T('turbine exhaust dumped','выхлоп турбины'), 'svg-small');
      txt(svg, 30, 292, T('','сбрасывается'), 'svg-small');
    } else {
      box(330, 160, 110, 36, T('PREBURNER','ГАЗОГЕНЕРАТОР'), '#fbefe6');
      line('M385 160 L385 145 L285 145', '#b5452a');
      line('M240 110 L240 95 L320 95 L320 225 L290 225', '#b5452a');
      txt(svg, 330, 214, T('all gas to the chamber','весь газ — в камеру'), 'svg-small');
    }
  }
  var c = CYC[cyc];
  cells(document.getElementById('cycReadout'), [
    [T('CYCLE','ЦИКЛ'), T(c.name[0], c.name[1])],
    [T('EXAMPLES','ПРИМЕРЫ'), T(c.ex[0], c.ex[1])],
    [T('GAIN','ПЛЮС'), T(c.pros[0], c.pros[1])],
    [T('PRICE','ЦЕНА'), T(c.cons[0], c.cons[1])]
  ]);
  document.getElementById('cycStatus').innerHTML = T('Schematic only: real engines add valves, heat exchangers and separate fuel and oxidizer pumps.','Только схема: в реальных двигателях есть клапаны, теплообменники и отдельные насосы горючего и окислителя.');
}
Array.prototype.forEach.call(document.querySelectorAll('#cycSel .btn'), function(btn){
  btn.addEventListener('click', function(){ cyc = this.getAttribute('data-c'); pressGroup(this.parentNode, this); renderCyc(); });
});

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1960s', 'The F-1 doubles the highest chamber pressure of its day to 1,100 psi; 16:1 nozzle, gas-generator cycle [3].', 'F-1 удваивает самое высокое давление в камере своего времени — до 1100 фунтов на кв. дюйм; сопло 16:1, цикл с газогенератором [3].'],
  ['1981–2011', 'The Space Shuttle main engine (RS-25) flies 135 missions, reusable, with more than 3,000 starts in all [5][7].', 'Главный двигатель шаттла (RS-25) совершает 135 полётов, многоразово, и всего более 3000 запусков [5][7].'],
  ['2015', '<b>9 January:</b> first RS-25 test for the Space Launch System, 500 s at Stennis [5]. Falcon 9 Full Thrust enters service [6].', '<b>9 января:</b> первое испытание RS-25 для SLS, 500 с в Стеннисе [5]. В строй входит Falcon 9 Full Thrust [6].'],
  ['2018', 'Falcon 9 Block 5, with upgraded Merlin engines, built for reuse [6].', 'Falcon 9 Block 5 с улучшенными двигателями Merlin, рассчитанный на повторное использование [6].'],
  ['2022', 'Four former Shuttle RS-25s launch Artemis I on the SLS core stage [5].', 'Четыре бывших двигателя RS-25 шаттлов выводят «Артемиду-1» на центральной ступени SLS [5].'],
  ['2024', '<b>3 April:</b> final certification test fire of new-production RS-25s; 24 new engines on order [5].', '<b>3 апреля:</b> последнее сертификационное испытание RS-25 новой постройки; заказано 24 новых двигателя [5].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA Glenn Research Center, “Rocket Thrust Summary”', url:'https://www.grc.nasa.gov/www/k-12/rocket/rktthsum.html', note:{en:'Thrust equation F = ṁv_e + (p_e − p_0)A_e, choked throat and the nozzle relations.', ru:'Уравнение тяги F = ṁv_e + (p_e − p_0)A_e, запирание в горле и соотношения для сопла.'}},
  {title:'NASA Glenn Research Center, “Isentropic Flow Equations”', url:'https://www.grc.nasa.gov/www/k-12/airplane/isentrop.html', note:{en:'Area–Mach, pressure and temperature relations for isentropic flow.', ru:'Соотношения площадь — число Маха, давления и температуры для изоэнтропического течения.'}},
  {title:'Rocketdyne / NASA MSFC, “F-1 Saturn V First Stage Engine” (NTRS 20100027316)', url:'https://ntrs.nasa.gov/citations/20100027316', note:{en:'F-1: chamber pressure 1,100 psi (double the 520 psi of the day), nozzle area ratio 16:1, tube wall to 10:1 with turbine exhaust injected below, specific impulse 265 s.', ru:'F-1: давление в камере 1100 фунтов на кв. дюйм (вдвое больше тогдашних 520), степень расширения 16:1, трубчатая стенка до 10:1 с вдувом выхлопа турбины ниже, удельный импульс 265 с.'}},
  {title:'NASA (2015), Space Transportation System, Historic American Engineering Record HAER No. TX-116', url:'https://www.nasa.gov/wp-content/uploads/2015/12/3.pdf', note:{en:'SSME nozzle: 10.3 in throat, 90.7 in exit, area ratio 77.5:1; 1,080 hydrogen-cooled stainless tubes; 1,035 lb/s and 470,000 lbf vacuum at 100 % power; chamber pressure about 3,000 psi.', ru:'Сопло SSME: горло 10,3 дюйма, срез 90,7 дюйма, степень расширения 77,5:1; 1080 охлаждаемых водородом трубок из нержавеющей стали; 1035 фунтов/с и 470 000 фунтов тяги в вакууме на 100 % мощности; давление в камере около 3000 фунтов на кв. дюйм.'}},
  {title:'NASA (2025), “RS-25 Core Stage Engine”, SLS fact sheet', url:'https://www.nasa.gov/wp-content/uploads/2025/04/sls-4963-sls-rs-25-engine-fact-sheet-508.pdf', note:{en:'418,000 lbf sea level and 512,300 lbf vacuum at 109 %; 135 Shuttle missions; SLS testing from 9 January 2015; final certification test 3 April 2024; 24 new engines.', ru:'418 000 фунтов у земли и 512 300 фунтов в вакууме на 109 %; 135 полётов шаттлов; испытания для SLS с 9 января 2015; последнее сертификационное испытание 3 апреля 2024; 24 новых двигателя.'}},
  {title:'SpaceX (2025), Falcon User\'s Guide', url:'https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf', note:{en:'Merlin 1D and MVac: gas-generator cycle, regeneratively cooled nozzle; Full Thrust (2015) and Block 5 (2018).', ru:'Merlin 1D и MVac: цикл с газогенератором, регенеративно охлаждаемое сопло; Full Thrust (2015) и Block 5 (2018).'}},
  {title:'J. Ballard et al. (2017), “Next-Generation RS-25 Engines for the NASA Space Launch System” (NTRS 20170008958)', url:'https://ntrs.nasa.gov/citations/20170008958', note:{en:'RS-25 as a pump-fed, fuel-rich staged-combustion LOX/LH₂ engine; 135 missions, 3,000+ ground tests, over a million seconds of hot fire.', ru:'RS-25 — насосный кислородно-водородный двигатель с дожиганием богатого горючим газа; 135 полётов, 3000+ наземных испытаний, более миллиона секунд работы.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderNoz();
  renderCyc();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__nozzle = {areaRatio:areaRatio, machFromArea:machFromArea, pRatio:pRatio, cF:cF, PSI:PSI, P0:P0};
