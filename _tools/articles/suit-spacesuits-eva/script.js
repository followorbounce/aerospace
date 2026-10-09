/* ============ CONSTANTS (NASA [1]–[4]) ============ */
var PN2_SEA = 11.6, K = Math.LN2/360, PN2_STAGED = 0.735*10.2, R_EMU = 1.65, P_EMU = 4.3;   // psi, per minute
function decay(P0, Pa, minutes){ return Pa + (P0 - Pa)*Math.exp(-K*minutes); }
function protocol(kind, hStage, mO2, pSuit){
  var pts = [], P = PN2_SEA, t = 0; pSuit = pSuit || P_EMU;
  function step(Pa, mins, label){ for(var m = 0; m < mins; m += 5){ var dm = Math.min(5, mins - m); P = decay(P, Pa, dm); t += dm; pts.push([t, P/pSuit, label]); } }
  pts.push([0, P/pSuit, 'start']);
  if(kind !== 'o2'){ step(0, 60, 'mask'); step(PN2_STAGED, (kind === 'camp' ? Math.min(hStage, 8 + 40/60) : hStage)*60, 'stage'); }
  step(0, mO2, 'o2');
  return {pts:pts, R:P/pSuit, total:t};
}

/* ============ CH2 — PRESSURE TRADE ============ */
var pP = document.getElementById('pP');
function renderPr(){
  var p = +pP.value, R = PN2_SEA/p;
  document.getElementById('pPVal').textContent = fmt(p, 2) + T(' psi',' psi') + ' (' + fmt(p*6.894757, 1) + T(' kPa',' кПа') + ')';
  var svg = document.getElementById('prSvg'); svg.innerHTML = '';
  var L = 56, Rr = 440, Tp = 22, B = 250;
  function X(pp){ return L + (pp - 3)/5.3*(Rr - L); }
  function Y(r){ return B - (r - 1)/3*(B - Tp); }                  // R 1 … 4
  [1,1.5,2,2.5,3,3.5,4].forEach(function(r){ ns('line', {x1:L, y1:Y(r), x2:Rr, y2:Y(r), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(r) + 3, fmt(r, 1), 'svg-small', 'end'); });
  [3,4,5,6,7,8].forEach(function(pp){ txt(svg, X(pp), B + 14, pp, 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('suit pressure, psi','давление в скафандре, psi'), 'svg-small', 'end'); txt(svg, L, 13, T('tissue ratio R with no prebreathe','тканевый коэффициент R без десатурации'), 'svg-small');
  var d = ''; for(var pp = 3; pp <= 8.3001; pp += 0.05) d += (d ? 'L' : 'M') + X(pp).toFixed(1) + ' ' + Y(Math.min(4, PN2_SEA/pp)).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('line', {x1:L, y1:Y(R_EMU), x2:Rr, y2:Y(R_EMU), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg); txt(svg, Rr - 2, Y(R_EMU) - 4, T('EMU limit 1.65','предел EMU 1,65'), 'svg-small', 'end');
  [[3.75, T('Apollo','«Аполлон»')], [4.3, 'EMU'], [5.8, T('Orlan','«Орлан»')]].forEach(function(s){ ns('line', {x1:X(s[0]), y1:Tp, x2:X(s[0]), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(s[0]) + 3, Tp + 10, s[1], 'svg-small'); });
  // stiffness bar (proportional to pressure)
  var bx = 452, sh = (p/8.3)*(B - Tp);
  ns('rect', {x:bx, y:B - sh, width:16, height:sh, fill:'#a8741a'}, svg); txt(svg, bx + 8, B + 14, T('stiff','жёстк.'), 'svg-small', 'middle');
  ns('circle', {cx:X(p), cy:Y(Math.min(4, R)), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('prReadout'), [
    [T('R STRAIGHT FROM THE CABIN','R СРАЗУ ИЗ КАБИНЫ'), fmt(R, 2)],
    [T('OXYGEN PRESSURE vs SEA-LEVEL AIR','ДАВЛЕНИЕ O₂ К ВОЗДУХУ У МОРЯ'), fmt(p/3.087, 2) + '×'],
    [T('PREBREATHE TO REACH R 1.65 (O₂ ONLY)','ДЕСАТУРАЦИЯ ДО R 1,65 (ТОЛЬКО O₂)'), R <= R_EMU ? T('none','не нужна') : fmt(Math.log(PN2_SEA/(R_EMU*p))/K/60, 1) + T(' h',' ч')],
    [T('RELATIVE STIFFNESS vs EMU','ЖЁСТКОСТЬ ОТНОСИТЕЛЬНО EMU'), fmt(p/P_EMU, 2) + '×']
  ]);
  hud1.textContent = fmt(p, 2) + ' psi';
  document.getElementById('prStatus').innerHTML = p >= PN2_SEA/R_EMU
    ? T('High enough to skip prebreathe against the 1.65 rule — but stiff: every grip and bend now costs more effort.','Достаточно высоко, чтобы обойтись без десатурации по правилу 1,65, — но скафандр жёсткий: каждый захват и сгиб требует больше сил.')
    : T('Easy to move in, but the nitrogen dissolved at cabin pressure is far above the suit pressure: without prebreathe, R is ','Двигаться легко, но азот, растворённый при давлении кабины, намного выше давления в скафандре: без десатурации R = ') + fmt(R, 2) + '.';
}
pP.addEventListener('input', renderPr);

/* ============ CH3 — PREBREATHE ============ */
var pbS = document.getElementById('pbS'), pbO = document.getElementById('pbO'), pbKind = 'staged';
var PRESET = {o2:[0, 240], staged:[12, 75], camp:[8 + 40/60, 50]};
function renderPb(){
  var hS = +pbS.value, mO = +pbO.value, Pr = protocol(pbKind, hS, mO);
  document.getElementById('pbSVal').textContent = pbKind === 'o2' ? '—' : fmt(pbKind === 'camp' ? Math.min(hS, 8 + 40/60) : hS, 2) + T(' h',' ч') + (pbKind === 'camp' && hS > 8.67 ? T(' (capped at 8 h 40 min)',' (не более 8 ч 40 мин)') : '');
  document.getElementById('pbOVal').textContent = fmtInt(mO) + T(' min',' мин');
  var svg = document.getElementById('pbSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, tmax = Math.max(300, Math.ceil(Pr.total/60)*60);
  function X(t){ return L + t/tmax*(R - L); }
  function Y(r){ return B - (r - 1)/2*(B - Tp); }                  // 1 … 3
  [1,1.5,2,2.5,3].forEach(function(r){ ns('line', {x1:L, y1:Y(r), x2:R, y2:Y(r), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(r) + 3, fmt(r, 1), 'svg-small', 'end'); });
  for(var hh = 0; hh <= tmax/60; hh += Math.max(1, Math.round(tmax/60/6))) txt(svg, X(hh*60), B + 14, hh + T(' h',' ч'), 'svg-small', 'middle');
  txt(svg, L, 13, T('tissue ratio R if the suit were entered now (4.3 psi)','коэффициент R при переходе в скафандр сейчас (4,3 psi)'), 'svg-small');
  ns('line', {x1:L, y1:Y(R_EMU), x2:R, y2:Y(R_EMU), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg); txt(svg, R - 2, Y(R_EMU) - 4, T('R ≤ 1.65','R ≤ 1,65'), 'svg-small', 'end');
  var cols = {start:'#0b0b0c', mask:'#2f5aa1', stage:'#a8741a', o2:'#b5452a'}, prev = Pr.pts[0];
  Pr.pts.slice(1).forEach(function(p){ ns('line', {x1:X(prev[0]), y1:Y(prev[1]), x2:X(p[0]), y2:Y(p[1]), stroke:cols[p[2]], 'stroke-width':2.5}, svg); prev = p; });
  [['mask', T('O₂ mask','маска O₂')], ['stage', T('10.2 psi','10,2 psi')], ['o2', T('O₂ in suit','O₂ в скафандре')]].forEach(function(k, i){ ns('rect', {x:L + 10 + i*120, y:B + 22, width:10, height:4, fill:cols[k[0]]}, svg); txt(svg, L + 24 + i*120, B + 27, k[1], 'svg-small'); });
  ns('circle', {cx:X(Pr.total), cy:Y(Pr.R), r:5, fill: Pr.R < R_EMU + 0.005 ? '#0b0b0c' : '#b5452a'}, svg);
  cells(document.getElementById('pbReadout'), [
    [T('FINAL R','ИТОГОВЫЙ R'), fmt(Pr.R, 3)],
    [T('TISSUE NITROGEN','АЗОТ В ТКАНЯХ'), fmt(Pr.R*P_EMU, 2) + T(' psi',' psi')],
    [T('TOTAL TIME','ОБЩЕЕ ВРЕМЯ'), fmt(Pr.total/60, 1) + T(' h',' ч')],
    [T('VERDICT','ИТОГ'), Pr.R < R_EMU + 0.005 ? T('within 1.65','в пределах 1,65') : T('too much nitrogen','слишком много азота')]
  ]);
  hud2.textContent = fmt(Pr.R, 2);
  document.getElementById('pbStatus').innerHTML = pbKind === 'staged' && hS === 12 && mO === 75
    ? T('NASA\'s Shuttle staged protocol: 60 min mask, ≥ 12 h at 10.2 psi, then 40–75 min in the suit [3]. This simple model lands right at ','Ступенчатый протокол шаттла NASA: 60 мин маски, ≥ 12 ч при 10,2 psi, затем 40–75 мин в скафандре [3]. Эта простая модель попадает ровно в ') + fmt(Pr.R, 2) + '.'
    : Pr.R < R_EMU + 0.005 ? T('Enough nitrogen is gone for the 1.65 rule.','Азота ушло достаточно для правила 1,65.') : T('Not yet — keep breathing oxygen, or spend longer at 10.2 psi.','Пока нет — продолжайте дышать кислородом или проведите дольше при 10,2 psi.');
}
[pbS, pbO].forEach(function(el){ el.addEventListener('input', renderPb); });
Array.prototype.forEach.call(document.querySelectorAll('#pbPro .btn'), function(btn){ btn.addEventListener('click', function(){ pbKind = this.getAttribute('data-p'); var pr = PRESET[pbKind]; pbS.value = pr[0]; pbO.value = pr[1]; pressGroup(this.parentNode, this); renderPb(); }); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1981', '<b>12 April:</b> the first Space Shuttle flight [2].', '<b>12 апреля:</b> первый полёт «Спейс шаттла» [2].'],
  ['1982', '<b>August:</b> NASA tests 3.5- and 4-hour oxygen prebreathes at Johnson Space Center; 4 h cuts DCS from 42 % to 21 % in those trials [2].', '<b>Август:</b> NASA испытывает 3,5- и 4-часовую десатурацию в Космическом центре Джонсона; 4 часа снижают ДКБ с 42 % до 21 % в этих испытаниях [2].'],
  ['1983', '<b>7 April:</b> first spacewalk from the Shuttle, after a 3.5-hour in-suit prebreathe [2].', '<b>7 апреля:</b> первый выход из шаттла после 3,5-часовой десатурации в скафандре [2].'],
  ['2001', '<b>July:</b> the ISS Quest airlock arrives; exercise-enhanced prebreathe becomes possible [3].', '<b>Июль:</b> на МКС прибывает шлюз Quest; становится возможной десатурация с упражнениями [3].'],
  ['2006', '<b>September:</b> first ISS spacewalks using the overnight campout protocol [3].', '<b>Сентябрь:</b> первые выходы с МКС по протоколу ночёвки в шлюзе [3].'],
  ['2013', 'About 145 person-EVAs completed with the campout protocol by 1 August [3].', 'К 1 августа по протоколу ночёвки выполнено около 145 человеко-выходов [3].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'M. L. Gernhardt, J. P. Dervay, J. M. Waligora, D. T. Fitzpatrick, J. Conkin (2013), “Extravehicular Activities”, chapter 5.4 in Biomedical Results of the Space Shuttle Program (NASA)', url:'https://www.nasa.gov/wp-content/uploads/2023/03/gernhardt-eva-ops-chp-5.4-2013.pdf', note:{en:'EMU at 29.6 kPa (4.3 psi), like a basketball; cabin 14.5 psia, 79 % N₂; Apollo suits at 25.8 kPa (3.75 psia); stiffness causing shoulder, wrist and fingernail injuries; cooling for up to 1,600 BTU/h; R = 1.65 with a 360-min compartment.', ru:'EMU при 29,6 кПа (4,3 psi), как баскетбольный мяч; кабина 14,5 psia, 79 % N₂; скафандры «Аполлона» 25,8 кПа (3,75 psia); жёсткость, травмирующая плечи, запястья и ногти; охлаждение до 1600 БТЕ/ч; R = 1,65 для 360-минутной ткани.'}},
  {title:'J. Conkin (2011), Preventing Decompression Sickness Over Three Decades of Extravehicular Activity, NASA/TP-2011-216147', url:'https://www.nasa.gov/wp-content/uploads/2023/03/conkin-prebreathe-overview-tp216147-2011.pdf', note:{en:'Tissue ratio P1N2/P2 with sea-level tissue N₂ of 11.6 psia; 360-min compartment; R ≤ 1.65 for the 4.3 psia EMU, ~1.85 for the 5.8 psia Orlan; 1982 prebreathe tests; first Shuttle EVA 7 April 1983.', ru:'Тканевый коэффициент P1N2/P2 при азоте в тканях 11,6 psia на уровне моря; 360-минутная ткань; R ≤ 1,65 для EMU при 4,3 psia, ~1,85 для «Орлана» при 5,8 psia; испытания десатурации 1982 г.; первый выход из шаттла 7 апреля 1983.'}},
  {title:'J. Conkin, J. R. Norcross, J. H. Wessel III (2014), Evidence Report: Risk of Decompression Sickness (DCS), NASA Human Research Program', url:'https://ntrs.nasa.gov/citations/20140003729', note:{en:'Shuttle staged protocol (60 min O₂ mask, ≥ 12 h at 10.2 psia / 26.5 % O₂, 40–75 min in-suit), tissues equilibrating to ~7.5 psia; ISS campout limited to 8 h 40 min, first used September 2006, ~145 person-EVAs by August 2013; exercise prebreathe after the Quest airlock (July 2001); ambulation increases DCS.', ru:'Ступенчатый протокол шаттла (60 мин маски O₂, ≥ 12 ч при 10,2 psia / 26,5 % O₂, 40–75 мин в скафандре), ткани выравниваются к ~7,5 psia; ночёвка на МКС не дольше 8 ч 40 мин, впервые в сентябре 2006, ~145 человеко-выходов к августу 2013; десатурация с упражнениями после шлюза Quest (июль 2001); ходьба повышает риск ДКБ.'}},
  {title:'NASA Office of the Chief Health and Medical Officer (2023), Technical Brief: Decompression Sickness (OCHMO-TB-037)', url:'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-037-decompression-sickness.pdf', note:{en:'R = PN₂ / P_suit; exponential nitrogen elimination with a 360-minute half-time; EMU historically R ≤ 1.65.', ru:'R = PN₂ / P_скаф; экспоненциальное выведение азота с периодом 360 минут; для EMU исторически R ≤ 1,65.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderPr();
  renderPb();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__suit = {protocol:protocol, decay:decay, K:K};
