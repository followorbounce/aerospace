/* ============ CONSTANTS — Apollo 11 ground-ignition weights, lb (Apollo by the Numbers [1]) ============ */
var LB = 0.45359237, G0 = 9.80665;
var W = {total:6477875, sicProp:1424889 + 3305786, sicDrop:287531 + 5442, ic2:11477, les:8910,
         siiProp:977166, siiDrop:79714 + 1260, ic3:8076, sivbProp:43608 + 192497, spacecraft:109646 - 8910};
var ISP = [265, 425, 425];                                 // F-1 [3]; J-2 ≈ 425 s [2]
function stages(k){                                       // k = spacecraft-mass factor
  var m0 = W.total + (k - 1)*W.spacecraft, out = [];
  var props = [W.sicProp, W.siiProp, W.sivbProp], drops = [W.sicDrop + W.ic2 + W.les, W.siiDrop + W.ic3, 0];
  for(var i = 0; i < 3; i++){ var mf = m0 - props[i]; out.push({m0:m0, mf:mf, dv:ISP[i]*G0*Math.log(m0/mf)}); m0 = mf - drops[i]; }
  return out;
}
function oneStage(k, isp){ var m0 = W.total + (k - 1)*W.spacecraft, mf = m0 - W.sicProp - W.siiProp - W.sivbProp; return {m0:m0, mf:mf, dv:isp*G0*Math.log(m0/mf)}; }
var NK15 = 153.4, N1_MASS = 2750;                          // tonnes-force, tonnes [4]
var SV_TW = 7610000/6477875;                               // rated thrust / ignition weight [1]
function n1tw(on){ return on*NK15/N1_MASS; }

/* ============ CH2 — STAGING ============ */
var sPay = document.getElementById('sPay'), sIsp = document.getElementById('sIsp'), stageMode = 3;
function renderStage(){
  var k = +sPay.value, isp = +sIsp.value, S = stages(k), tot = S[0].dv + S[1].dv + S[2].dv, O = oneStage(k, isp);
  document.getElementById('sPayVal').textContent = fmtInt(k*W.spacecraft*LB/1000) + T(' t',' т') + ' (' + fmt(k*100, 0) + ' %)';
  document.getElementById('sIspVal').textContent = fmtInt(isp) + T(' s',' с');
  document.getElementById('sIspCtl').style.opacity = stageMode === 1 ? 1 : 0.45;
  var svg = document.getElementById('stageSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, vmax = 16;
  function Y(v){ return B - v/vmax*(B - Tp); }
  [0,4,8,12,16].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, v, 'svg-small', 'end'); });
  txt(svg, L, 13, T('ideal velocity gained, km/s','идеальный прирост скорости, км/с'), 'svg-small');
  [[9.4, T('orbit ≈ 9.4','орбита ≈ 9,4')], [12.5, T('Moon ≈ 12.5','Луна ≈ 12,5')]].forEach(function(t){ ns('line', {x1:L, y1:Y(t[0]), x2:R, y2:Y(t[0]), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg); txt(svg, R - 2, Y(t[0]) - 4, t[1], 'svg-small', 'end'); });
  var cols = ['#0b0b0c', '#8a8a82', '#b5452a'], names = [['S-IC','S-IC'],['S-II','S-II'],['S-IVB','S-IVB']];
  var bx = 90, bw = 90, acc = 0;
  S.forEach(function(s, i){ var y0 = Y(acc), y1 = Y(acc + s.dv/1000); ns('rect', {x:bx, y:y1, width:bw, height:y0 - y1, fill:cols[i]}, svg); var t = txt(svg, bx + bw/2, (y0 + y1)/2 + 4, names[i][0] + ' ' + fmt(s.dv/1000, 2), 'svg-small', 'middle'); t.style.fill = '#fff'; acc += s.dv/1000; });
  txt(svg, bx + bw/2, B + 14, T('three stages','три ступени'), 'svg-small', 'middle');
  var bx2 = 230; ns('rect', {x:bx2, y:Y(O.dv/1000), width:bw, height:B - Y(O.dv/1000), fill:'#c9c9c1', stroke: stageMode === 1 ? '#b5452a' : 'none', 'stroke-width':2}, svg);
  txt(svg, bx2 + bw/2, Y(O.dv/1000) - 5, fmt(O.dv/1000, 2), 'svg-small', 'middle');
  txt(svg, bx2 + bw/2, B + 14, T('one stage, ','одна ступень, ') + isp + T(' s',' с'), 'svg-small', 'middle');
  var shown = stageMode === 3 ? tot : O.dv;
  cells(document.getElementById('stageReadout'), stageMode === 3 ? [
    [T('S-IC (F-1 × 5)','S-IC (F-1 × 5)'), fmt(S[0].dv/1000, 2) + T(' km/s',' км/с') + ' · ' + T('mass ratio ','отношение масс ') + fmt(S[0].m0/S[0].mf, 2)],
    [T('S-II (J-2 × 5)','S-II (J-2 × 5)'), fmt(S[1].dv/1000, 2) + T(' km/s',' км/с') + ' · ' + fmt(S[1].m0/S[1].mf, 2)],
    [T('S-IVB (J-2 × 1)','S-IVB (J-2 × 1)'), fmt(S[2].dv/1000, 2) + T(' km/s',' км/с') + ' · ' + fmt(S[2].m0/S[2].mf, 2)],
    [T('TOTAL','ВСЕГО'), fmt(tot/1000, 2) + T(' km/s',' км/с')]
  ] : [
    [T('MASS RATIO','ОТНОШЕНИЕ МАСС'), fmt(O.m0/O.mf, 2)],
    [T('EMPTY MASS CARRIED TO THE END','ПУСТАЯ МАССА ДО КОНЦА'), fmtInt(O.mf*LB/1000) + T(' t',' т')],
    [T('ONE STAGE','ОДНА СТУПЕНЬ'), fmt(O.dv/1000, 2) + T(' km/s',' км/с')],
    [T('THREE STAGES','ТРИ СТУПЕНИ'), fmt(tot/1000, 2) + T(' km/s',' км/с')]
  ]);
  hud1.textContent = fmt(shown/1000, 2) + T(' km/s',' км/с');
  document.getElementById('stageStatus').innerHTML = stageMode === 1
    ? T('Same propellant, no staging: every empty tank rides to the end. Even with the J-2\'s efficiency throughout, one stage falls well short of the Moon.','То же топливо без разделения ступеней: все пустые баки летят до конца. Даже с экономичностью J-2 на всём пути одна ступень сильно не дотягивает до Луны.')
    : (tot >= 12200 ? T('About what reaching orbit and leaving for the Moon needs (≈ 12.5 km/s, a rough figure) — the Saturn V was sized for exactly this job, with little to spare.','Примерно столько и нужно, чтобы выйти на орбиту и уйти к Луне (≈ 12,5 км/с, грубая оценка): «Сатурн-5» был рассчитан именно на эту задачу, почти без запаса.')
                    : T('Not enough for the Moon. Every extra tonne of spacecraft is carried by all three stages, so it costs speed at every step.','Для Луны не хватает. Каждую лишнюю тонну корабля несут все три ступени, поэтому она отнимает скорость на каждом этапе.'));
}
[sPay, sIsp].forEach(function(el){ el.addEventListener('input', renderStage); });
Array.prototype.forEach.call(document.querySelectorAll('#stageMode .btn'), function(btn){
  btn.addEventListener('click', function(){ stageMode = +this.getAttribute('data-m'); pressGroup(this.parentNode, this); renderStage(); });
});

/* ============ CH3 — N1 ENGINES ============ */
var eOut = document.getElementById('eOut');
// order in which opposite pairs are switched off: outer ring (12 pairs) spread around, then the inner ring (3 pairs)
var PAIR_ORDER = [];
[0,6,3,9,1,7,4,10,2,8,5,11].forEach(function(i){ PAIR_ORDER.push(['o', i]); });
[0,1,2].forEach(function(i){ PAIR_ORDER.push(['i', i]); });
function renderEng(){
  var n = +eOut.value, on = 30 - 2*n, tw = n1tw(on);
  document.getElementById('eOutVal').textContent = n + ' (' + 2*n + T(' engines',' дв.') + ')';
  var off = {o:{}, i:{}};
  for(var k = 0; k < n; k++){ var p = PAIR_ORDER[k]; off[p[0]][p[1]] = true; off[p[0]][p[1] + (p[0] === 'o' ? 12 : 3)] = true; }
  var svg = document.getElementById('engSvg'); svg.innerHTML = '';
  var cx = 165, cy = 182, Ro = 118, Ri = 48;
  ns('circle', {cx:cx, cy:cy, r:Ro + 26, fill:'none', stroke:'#c9c9c1'}, svg);
  function eng(x, y, isOff){ ns('circle', {cx:x, cy:y, r:15, fill: isOff ? '#f6f6f2' : '#0b0b0c', stroke: isOff ? '#b5452a' : '#0b0b0c', 'stroke-width':1.5}, svg); if(isOff){ ns('path', {d:'M' + (x - 7) + ' ' + (y - 7) + 'L' + (x + 7) + ' ' + (y + 7) + 'M' + (x + 7) + ' ' + (y - 7) + 'L' + (x - 7) + ' ' + (y + 7), stroke:'#b5452a', 'stroke-width':1.5}, svg); } }
  for(var a = 0; a < 24; a++){ var th = a/24*2*Math.PI; eng(cx + Ro*Math.cos(th), cy + Ro*Math.sin(th), off.o[a]); }
  for(var b = 0; b < 6; b++){ var th2 = b/6*2*Math.PI + Math.PI/6; eng(cx + Ri*Math.cos(th2), cy + Ri*Math.sin(th2), off.i[b]); }
  txt(svg, cx, 20, T('N1 first stage, seen from below: 24 outer + 6 inner NK-15','первая ступень Н-1 снизу: 24 внешних + 6 внутренних НК-15'), 'svg-small', 'middle');
  // T/W gauge
  var gx = 375, gy0 = 300, gy1 = 60;
  function GY(v){ return gy0 - v/2*(gy0 - gy1); }
  ns('rect', {x:gx, y:gy1, width:28, height:gy0 - gy1, fill:'none', stroke:'#0b0b0c'}, svg);
  ns('rect', {x:gx, y:GY(tw), width:28, height:gy0 - GY(tw), fill: tw >= 1 ? '#0b0b0c' : '#b5452a'}, svg);
  [0,0.5,1,1.5,2].forEach(function(v){ txt(svg, gx + 34, GY(v) + 3, fmt(v, 1), 'svg-small'); });
  ns('line', {x1:gx - 6, y1:GY(1), x2:gx + 34, y2:GY(1), stroke:'#2f5aa1', 'stroke-width':1.5}, svg);
  ns('line', {x1:gx - 6, y1:GY(SV_TW), x2:gx, y2:GY(SV_TW), stroke:'#8a8a82', 'stroke-width':3}, svg);
  txt(svg, gx - 9, GY(SV_TW) + 3, T('Saturn V','«Сатурн-5»'), 'svg-small', 'end');
  txt(svg, gx + 14, gy1 - 8, T('thrust ÷ weight','тяга ÷ вес'), 'svg-small', 'middle');
  cells(document.getElementById('engReadout'), [
    [T('ENGINES FIRING','РАБОТАЕТ ДВИГАТЕЛЕЙ'), on + ' / 30'],
    [T('THRUST','ТЯГА'), fmtInt(on*NK15) + T(' t',' т')],
    [T('THRUST ÷ WEIGHT AT LIFTOFF','ТЯГОВООРУЖЁННОСТЬ НА СТАРТЕ'), fmt(tw, 2)],
    [T('SATURN V, FOR COMPARISON','«САТУРН-5» ДЛЯ СРАВНЕНИЯ'), fmt(SV_TW, 2)]
  ]);
  hud2.textContent = fmt(tw, 2);
  document.getElementById('engStatus').innerHTML = tw >= 1.3
    ? T('Plenty of margin: on paper the N1 could lose several pairs and still climb. That was the whole idea of thirty engines.','Запас велик: на бумаге Н-1 могла потерять несколько пар и всё равно подниматься. В этом и был смысл тридцати двигателей.')
    : tw >= 1 ? T('Still climbing, but slowly — more of the thrust goes into holding the rocket up against gravity, and less into speed.','Ещё поднимается, но медленно: всё больше тяги уходит на то, чтобы удерживать ракету против тяготения, и всё меньше — на разгон.')
    : T('<b>Thrust is less than weight:</b> the rocket cannot leave the ground — or, already in the air, it falls back. On 3 July 1969 KORD shut down all but one engine within about ten seconds [4].','<b>Тяга меньше веса:</b> ракета не может оторваться от земли, а уже взлетевшая падает обратно. 3 июля 1969 года КОРД примерно за десять секунд выключила все двигатели, кроме одного [4].');
}
eOut.addEventListener('input', renderEng);

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1962', '<b>July:</b> the N1 engine contract goes to Kuznetsov\'s bureau; Korolev and Glushko split [4].', '<b>Июль:</b> заказ на двигатели Н-1 получает бюро Кузнецова; разрыв Королёва и Глушко [4].'],
  ['1964', '<b>December:</b> the uprated N1 for a single-launch lunar landing: 30 first-stage engines, 2,750 t [4].', '<b>Декабрь:</b> усиленная Н-1 для высадки на Луну одним пуском: 30 двигателей первой ступени, 2750 т [4].'],
  ['1967', '<b>November:</b> first Saturn V launch (Apollo 4).', '<b>Ноябрь:</b> первый пуск «Сатурна-5» («Аполлон-4»).'],
  ['1968', '<b>21 December:</b> Apollo 8, first crew on a Saturn V, goes around the Moon [1].', '<b>21 декабря:</b> «Аполлон-8» — первый экипаж на «Сатурне-5» — облетает Луну [1].'],
  ['1969', '<b>21 February:</b> N1 3L lost at T+68.7 s. <b>3 July:</b> N1 5L destroys its pad. <b>16 July:</b> Apollo 11 launches [1][4].', '<b>21 февраля:</b> Н-1 3Л потеряна на T+68,7 с. <b>3 июля:</b> Н-1 5Л разрушает стартовый комплекс. <b>16 июля:</b> старт «Аполлона-11» [1][4].'],
  ['1971', '<b>27 June:</b> N1 6L lost to uncontrolled roll at T+50.1 s [4].', '<b>27 июня:</b> Н-1 6Л потеряна из-за неуправляемого вращения на T+50,1 с [4].'],
  ['1972', '<b>23 November:</b> N1 7L explodes at about T+107 s, seconds before staging [4]. <b>7 December:</b> Apollo 17, the last Moon landing launch [1].', '<b>23 ноября:</b> Н-1 7Л взрывается около T+107 с, за секунды до разделения [4]. <b>7 декабря:</b> «Аполлон-17» — последний старт к Луне с высадкой [1].'],
  ['1974', '<b>24 June:</b> N1 work suspended [4].', '<b>24 июня:</b> работы по Н-1 приостановлены [4].'],
  ['1976', '<b>18 February:</b> the N1 programme is formally terminated [4].', '<b>18 февраля:</b> программа Н-1 официально прекращена [4].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'R. W. Orloff (2000), Apollo by the Numbers: A Statistical Reference, NASA SP-2000-4029', url:'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4029.pdf', note:{en:'Launch vehicle key facts (F-1 rated at 1,522,000 lbf, J-2 at 230,000 lbf) and ground-ignition weights for every Saturn V: Apollo 11 total 6,477,875 lb, stage dry and propellant weights, spacecraft 109,646 lb. (The table\'s S-II fuel and oxidizer rows appear swapped; only their sum is used here.)', ru:'Ключевые данные ракет (F-1 — 1 522 000 фунтов тяги, J-2 — 230 000) и массы при зажигании для каждого «Сатурна-5»: «Аполлон-11» — 6 477 875 фунтов, сухие массы и топливо ступеней, корабль — 109 646 фунтов. (Строки горючего и окислителя S-II в таблице, по-видимому, переставлены; здесь используется только их сумма.)'}},
  {title:'NASA MSFC (1968), Saturn V Flight Manual SA-503, NASA TM X-72151', url:'https://ntrs.nasa.gov/citations/19750063889', note:{en:'Vehicle height 363 ft; engine data and burn times; J-2 specific impulse about 425 s against mixture ratio (figure 5-8); the S-IVB\'s two burns.', ru:'Высота ракеты 363 фута; данные двигателей и время работы; удельный импульс J-2 около 425 с в зависимости от соотношения компонентов (рис. 5-8); два включения S-IVB.'}},
  {title:'Rocketdyne / NASA MSFC, “F-1 Saturn V First Stage Engine” (NTRS 20100027316)', url:'https://ntrs.nasa.gov/citations/20100027316', note:{en:'History of the F-1: about 1.5 million lbf of thrust and a specific impulse of 265 s.', ru:'История F-1: около 1,5 млн фунтов тяги и удельный импульс 265 с.'}},
  {title:'A. A. Siddiqi (2000), Challenge to Apollo: The Soviet Union and the Space Race, 1945–1974, NASA SP-2000-4408', url:'https://history.nasa.gov/SP-4408pt2.pdf', note:{en:'The N1: Kuznetsov\'s NK-15 (153.4 t), NK-15V and NK-21 engines; 30 first-stage engines and 2,750 t; KORD; lack of integrated first-stage ground testing; the four launches (3L, 5L, 6L, 7L) and their causes; suspension in 1974 and termination in 1976; the NK-33 and its 1993 import by Aerojet.', ru:'Н-1: двигатели Кузнецова НК-15 (153,4 т), НК-15В и НК-21; 30 двигателей первой ступени и 2750 т; КОРД; отсутствие комплексных наземных испытаний первой ступени; четыре пуска (3Л, 5Л, 6Л, 7Л) и их причины; приостановка в 1974 и прекращение в 1976; НК-33 и его импорт Aerojet в 1993.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderStage();
  renderEng();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__thrust = {stages:stages, oneStage:oneStage, n1tw:n1tw, W:W, SV_TW:SV_TW};
