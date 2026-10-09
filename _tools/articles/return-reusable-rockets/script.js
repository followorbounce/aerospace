/* ============ CH2 — PAYLOAD MODEL (illustrative, assumed masses — not SpaceX data) ============ */
var G0 = 9.80665;
var RK = {p1:410000, d1:25000, i1:300, p2:110000, d2:4500, i2:348, req:9400};
function payload(dvRec, hwKg){
  var c1 = RK.i1*G0, c2 = RK.i2*G0, d1 = RK.d1 + hwKg, res = d1*(Math.exp(dvRec/c1) - 1);
  if(res >= RK.p1) return {P:0, res:res};
  function dv(P){ var m0 = RK.p1 + d1 + RK.p2 + RK.d2 + P, m1 = m0 - (RK.p1 - res); return c1*Math.log(m0/m1) + c2*Math.log((RK.p2 + RK.d2 + P)/(RK.d2 + P)); }
  if(dv(0) < RK.req) return {P:0, res:res};
  var lo = 0, hi = 200000;
  for(var k = 0; k < 70; k++){ var m = 0.5*(lo + hi); if(dv(m) >= RK.req) lo = m; else hi = m; }
  return {P:lo, res:res};
}
var P_EXP = payload(0, 0).P;
var pDv = document.getElementById('pDv'), pHw = document.getElementById('pHw');
function renderPay(){
  var dvk = +pDv.value, hw = +pHw.value, R = payload(dvk*1000, hw*1000), pen = 1 - R.P/P_EXP;
  document.getElementById('pDvVal').textContent = fmt(dvk, 2) + T(' km/s',' км/с');
  document.getElementById('pHwVal').textContent = fmt(hw, 2) + T(' t',' т');
  var svg = document.getElementById('paySvg'); svg.innerHTML = '';
  var L = 56, Rr = 465, Tp = 22, B = 250;
  function X(v){ return L + v/5*(Rr - L); }
  function Y(p){ return B - p*(B - Tp); }
  [0,0.25,0.5,0.75,1].forEach(function(p){ ns('line', {x1:L, y1:Y(p), x2:Rr, y2:Y(p), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(p) + 3, (p*100) + '%', 'svg-small', 'end'); });
  [0,1,2,3,4,5].forEach(function(v){ txt(svg, X(v), B + 14, v, 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('Δv kept for recovery, km/s','Δv на возвращение, км/с'), 'svg-small', 'end');
  txt(svg, L, 13, T('payload, % of the expendable rocket','полезная нагрузка, % от одноразовой ракеты'), 'svg-small');
  // MIT ranges [2]
  ns('rect', {x:L, y:Y(0.9), width:Rr - L, height:Y(0.8) - Y(0.9), fill:'#2f5aa1', opacity:0.12}, svg);
  txt(svg, Rr - 4, Y(0.9) - 4, T('MIT: downrange landing, −10 to −20 %','MIT: посадка вдали, −10…−20 %'), 'svg-small', 'end');
  ns('line', {x1:L, y1:Y(0.5), x2:Rr, y2:Y(0.5), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, Rr - 4, Y(0.5) - 4, T('MIT: back to launch site, about half','MIT: к месту старта, около половины'), 'svg-small', 'end');
  var d = '';
  for(var v = 0; v <= 5.0001; v += 0.05) d += (v === 0 ? 'M' : 'L') + X(v).toFixed(1) + ' ' + Y(payload(v*1000, hw*1000).P/P_EXP).toFixed(1);
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(dvk), cy:Y(R.P/P_EXP), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('payReadout'), [
    [T('PAYLOAD','ПОЛЕЗНАЯ НАГРУЗКА'), fmt(R.P/1000, 1) + T(' t',' т')],
    [T('EXPENDABLE','ОДНОРАЗОВАЯ'), fmt(P_EXP/1000, 1) + T(' t',' т')],
    [T('PAYLOAD LOST','ПОТЕРЯ НАГРУЗКИ'), fmt(pen*100, 1) + ' %'],
    [T('PROPELLANT KEPT IN STAGE 1','ТОПЛИВО, ОСТАВЛЕННОЕ В 1-Й СТУПЕНИ'), fmt(R.res/1000, 1) + T(' t',' т')]
  ]);
  hud1.textContent = fmt(R.P/1000, 1) + T(' t',' т');
  document.getElementById('payStatus').innerHTML = R.P <= 0
    ? T('<b>Nothing left:</b> the booster would need more propellant for the way home than it can spare.','<b>Ничего не осталось:</b> ступени понадобилось бы больше топлива на возвращение, чем она может выделить.')
    : T('The booster keeps ','Ступень оставляет ') + fmt(R.res/1000, 1) + T(' t of propellant (',' т топлива (') + fmt(R.res/RK.p1*100, 1) + T(' % of its load). That mass rides all the way to staging, so the upper stage starts slower, and the payload pays.',' % загрузки). Эта масса едет до самого разделения, вторая ступень стартует медленнее, и расплачивается полезная нагрузка.');
}
[pDv, pHw].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('payMode'), null); renderPay(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#payMode .btn'), function(btn){
  btn.addEventListener('click', function(){ pDv.value = this.getAttribute('data-dv'); pHw.value = this.getAttribute('data-hw'); pressGroup(this.parentNode, this); renderPay(); });
});

/* ============ CH3 — LANDING BURN ============ */
var F_MAX = 190000*4.4482216, F_MIN = 108300*4.4482216;   // N, one Merlin 1D at sea level [1]
var lM = document.getElementById('lM'), lV = document.getElementById('lV'), lH = document.getElementById('lH');
function landing(mT, v0, h0){
  var m = mT*1000, a = F_MAX/m - G0, stop = v0*v0/(2*a);
  return {a:a, stop:stop, twMin:F_MIN/(m*G0), result: h0 > stop ? 'early' : 'late', gap:h0 - stop, vHit: h0 >= stop ? 0 : Math.sqrt(v0*v0 - 2*a*h0), t:v0/a};
}
function renderLand(){
  var mT = +lM.value, v0 = +lV.value, h0 = +lH.value, Ld = landing(mT, v0, h0);
  document.getElementById('lMVal').textContent = fmt(mT, 1) + T(' t',' т');
  document.getElementById('lVVal').textContent = fmtInt(v0) + T(' m/s',' м/с');
  document.getElementById('lHVal').textContent = fmtInt(h0) + T(' m',' м');
  var svg = document.getElementById('landSvg'); svg.innerHTML = '';
  var L = 56, Rr = 465, Tp = 22, B = 270, hmax = 3000;
  function X(v){ return L + v/300*(Rr - L); }
  function Y(h){ return B - h/hmax*(B - Tp); }
  [0,500,1000,1500,2000,2500,3000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:Rr, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 3, fmtInt(h), 'svg-small', 'end'); });
  [0,100,200,300].forEach(function(v){ txt(svg, X(v), B + 14, v, 'svg-small', 'middle'); });
  txt(svg, Rr, B + 28, T('falling speed, m/s','скорость падения, м/с'), 'svg-small', 'end'); txt(svg, L, 13, T('height, m','высота, м'), 'svg-small');
  // ideal curve: h = v²/2a (speed that reaches zero exactly at the ground)
  var d = '';
  for(var v = 0; v <= 300; v += 2){ var h = v*v/(2*Ld.a); if(h > hmax) break; d += (d ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(h).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-dasharray':'4 3', 'stroke-width':1.5}, svg);
  txt(svg, X(Math.min(290, Math.sqrt(2*Ld.a*hmax))) - 4, Tp + 12, T('perfect burn','идеальный импульс'), 'svg-small', 'end');
  // this burn: from (v0,h0) decelerating at a
  var p = '', end = Math.max(0, Ld.gap);
  for(var vv = v0; vv >= 0; vv -= 1){ var hh = h0 - (v0*v0 - vv*vv)/(2*Ld.a); if(hh < 0){ p += 'L' + X(Ld.vHit).toFixed(1) + ' ' + Y(0).toFixed(1); break; } p += (p ? 'L' : 'M') + X(vv).toFixed(1) + ' ' + Y(hh).toFixed(1); }
  ns('path', {d:p, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(v0), cy:Y(h0), r:5, fill:'#b5452a'}, svg);
  ns('circle', {cx:X(Ld.result === 'early' ? 0 : Ld.vHit), cy:Y(end), r:4, fill: Math.abs(Ld.gap) < 3 || (Ld.result === 'late' && Ld.vHit < 2) ? '#0b0b0c' : '#b5452a'}, svg);
  cells(document.getElementById('landReadout'), [
    [T('DECELERATION','ТОРМОЖЕНИЕ'), fmt(Ld.a/G0, 2) + ' g'],
    [T('LOWEST THRUST ÷ WEIGHT','МИН. ТЯГА ÷ ВЕС'), fmt(Ld.twMin, 2)],
    [T('PERFECT IGNITION HEIGHT','ИДЕАЛЬНАЯ ВЫСОТА ВКЛЮЧЕНИЯ'), fmtInt(Ld.stop) + T(' m',' м')],
    [T('BURN TIME','ДЛИТЕЛЬНОСТЬ ИМПУЛЬСА'), fmt(Ld.t, 1) + T(' s',' с')]
  ]);
  var ok = Ld.result === 'early' ? Ld.gap < 3 : Ld.vHit < 2;
  hud2.textContent = ok ? T('LANDED','ПОСАДКА') : Ld.result === 'early' ? T('TOO EARLY','РАНО') : T('TOO LATE','ПОЗДНО');
  document.getElementById('landStatus').innerHTML = ok
    ? T('<b>Landed.</b> Zero speed at zero height.','<b>Посадка.</b> Нулевая скорость на нулевой высоте.')
    : Ld.result === 'early'
      ? T('<b>Too early:</b> it stops ','<b>Слишком рано:</b> ступень останавливается в ') + fmtInt(Ld.gap) + T(' m above the pad and, with thrust still greater than weight even at minimum throttle (' ,' м над площадкой и, поскольку даже на минимальном режиме тяга больше веса (') + fmt(Ld.twMin, 2) + T('), starts to rise again.','), начинает снова подниматься.')
      : T('<b>Too late:</b> it hits the pad at ','<b>Слишком поздно:</b> ступень ударяется о площадку на скорости ') + fmtInt(Ld.vHit) + T(' m/s.',' м/с.');
}
[lM, lV, lH].forEach(function(el){ el.addEventListener('input', renderLand); });

/* ============ CH5 — THRUST COMPARISON ============ */
var LBF = 4.4482216, THR = [
  ['Falcon 9', 'Falcon 9', 7.686, 'reuse', '[1]'],
  ['Falcon Heavy', 'Falcon Heavy', 22.819, 'reuse', '[1]'],
  ['Saturn V', '«Сатурн-5»', 7610000*LBF/1e6, 'exp', '[9]'],
  ['N1', 'Н-1', 30*153.4*G0/1000, 'exp', '[10]'],
  ['Super Heavy', 'Super Heavy', 74, 'reuse', '[7]']
], thrUnit = 'mn';
function renderThr(){
  var svg = document.getElementById('thrSvg'); svg.innerHTML = '';
  var L = 110, Rr = 420, Tp = 24, row = 40, max = 90;
  function X(v){ return L + v/max*(Rr - L); }
  THR.forEach(function(r, i){
    var y = Tp + i*row, v = thrUnit === 'mn' ? r[2] : r[2]*1e6/G0/1000;
    txt(svg, L - 8, y + 17, T(r[0], r[1]), 'svg-small', 'end');
    ns('rect', {x:L, y:y + 4, width:X(r[2]) - L, height:20, fill: r[3] === 'reuse' ? '#0b0b0c' : '#8a8a82'}, svg);
    txt(svg, X(r[2]) + 6, y + 18, (thrUnit === 'mn' ? fmt(v, 1) + T(' MN',' МН') : fmtInt(v) + T(' t',' т')) + ' ' + r[4], 'svg-small');
  });
  ns('rect', {x:L, y:Tp + 5*row + 4, width:10, height:10, fill:'#0b0b0c'}, svg); txt(svg, L + 14, Tp + 5*row + 13, T('first stage built to be reused','первая ступень многоразовая'), 'svg-small');
  ns('rect', {x:L + 200, y:Tp + 5*row + 4, width:10, height:10, fill:'#8a8a82'}, svg); txt(svg, L + 214, Tp + 5*row + 13, T('expendable','одноразовая'), 'svg-small');
  document.getElementById('thrStatus').innerHTML = T('Super Heavy\'s figure is the FAA document\'s maximum (\"up to 74 MN\") [7]. Thrust in tonnes-force is the mass it could hold up against Earth\'s gravity.','Значение для Super Heavy — максимум из документа FAA («до 74 МН») [7]. Тяга в тоннах-силы — масса, которую она могла бы удерживать против земного тяготения.');
}
Array.prototype.forEach.call(document.querySelectorAll('#thrUnit .btn'), function(btn){
  btn.addEventListener('click', function(){ thrUnit = this.getAttribute('data-u'); pressGroup(this.parentNode, this); renderThr(); });
});

/* ============ CH6 — TIMELINE ============ */
var TIMELINE = [
  ['2015', '<b>21 December (local time):</b> Orbcomm-2 launch; first landing of an orbital-class booster, at Landing Zone 1 [3].', '<b>21 декабря (местное время):</b> пуск Orbcomm-2; первая посадка ступени орбитальной ракеты, на Landing Zone 1 [3].'],
  ['2016', '<b>8 April:</b> CRS-8 booster lands on a drone ship about 300 km offshore [4].', '<b>8 апреля:</b> ступень CRS-8 садится на баржу примерно в 300 км от берега [4].'],
  ['2017', '<b>30 March:</b> SES-10 — the CRS-8 booster flies again, the first Falcon 9 reflight [5].', '<b>30 марта:</b> SES-10 — ступень CRS-8 летит снова, первый повторный полёт Falcon 9 [5].'],
  ['2018', 'Falcon 9 Block 5, designed for rapid reuse, enters service [1].', 'В строй входит Falcon 9 Block 5, рассчитанный на быстрое повторное использование [1].'],
  ['2022', '<b>June:</b> FAA environmental assessment for Starship/Super Heavy at Boca Chica [7].', '<b>Июнь:</b> экологическая оценка FAA для Starship/Super Heavy в Бока-Чике [7].'],
  ['2024', '<b>13 October:</b> Starship flight 5 — Super Heavy Booster 12 caught by the launch tower [8].', '<b>13 октября:</b> пятый полёт Starship — ускоритель Super Heavy Booster 12 пойман стартовой башней [8].'],
  ['2025', '<b>August:</b> the 450th launch of a flight-proven Falcon booster [6].', '<b>Август:</b> 450-й запуск уже летавшей ступени Falcon [6].']
];

/* ============ CH7 — REFERENCES ============ */
var REFERENCES = [
  {title:'SpaceX (2025), Falcon User\'s Guide (May 2025)', url:'https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf', note:{en:'Merlin 1D: 845 kN (190,000 lbf) sea-level thrust, throttle to 108,300 lbf; Falcon 9 7,686 kN and Falcon Heavy 22,819 kN at liftoff; recoverable first stage; Full Thrust (2015) and Block 5 (2018); mass-to-orbit figures available on request.', ru:'Merlin 1D: 845 кН (190 000 фунтов) у земли, дросселирование до 108 300 фунтов; стартовая тяга Falcon 9 — 7686 кН, Falcon Heavy — 22 819 кН; возвращаемая первая ступень; версии Full Thrust (2015) и Block 5 (2018); характеристики по выведению — по запросу.'}},
  {title:'M. Vernacchia, K. Mathesius (2018), “Strategies for Re-Use of Launch Vehicle First Stages”, IAC-18-D2.4.3 (MIT)', url:'https://iafastro.directory/iac/archive/browse/IAC-18/D2/4/47508/', note:{en:'Payload penalty under common assumptions: propulsive return to the launch site about half; air-breathing fly-back 15–45 %; downrange propulsive or glider landing 10–20 %; engines-only parachute recovery almost none.', ru:'Потеря полезной нагрузки при общих допущениях: реактивное возвращение к месту старта — около половины; возвращение на воздушно-реактивных двигателях — 15–45 %; посадка вдали от старта (реактивная или планирующая) — 10–20 %; спасение только двигателей на парашюте — почти ноль.'}},
  {title:'Spaceflight Now (2015), “Round-trip rocket flight gives SpaceX a trifecta of successes”', url:'https://spaceflightnow.com/2015/12/22/round-trip-rocket-flight-gives-spacex-a-trifecta-of-successes/', note:{en:'Orbcomm-2: staging at nearly 4,000 mph and 50 miles altitude; landing about six miles south of the pad, reaching zero velocity just as it hit the pad.', ru:'Orbcomm-2: разделение на скорости почти 4000 миль/ч и высоте 50 миль; посадка примерно в шести милях к югу от старта с нулевой скоростью в момент касания.'}},
  {title:'Spaceflight Now (2016), “SpaceX lands rocket on ocean-going drone ship”', url:'https://spaceflightnow.com/2016/04/08/spacex-lands-rocket-on-floating-platform-after-station-resupply-launch/', note:{en:'CRS-8: first successful drone-ship landing after four failed attempts, about 300 km northeast of Cape Canaveral.', ru:'CRS-8: первая успешная посадка на баржу после четырёх неудачных попыток, примерно в 300 км к северо-востоку от мыса Канаверал.'}},
  {title:'Spaceflight Now (2017), “SpaceX flies rocket for second time in historic test of cost-cutting technology”', url:'https://spaceflightnow.com/2017/03/31/spacex-flies-rocket-for-second-time-in-historic-test-of-cost-cutting-technology/', note:{en:'SES-10 on 30 March 2017: first reflight; about four months of refurbishment.', ru:'SES-10, 30 марта 2017: первый повторный полёт; около четырёх месяцев подготовки.'}},
  {title:'Spaceflight Now (2025), “Starlink mission marks SpaceX\'s 450th flight-proven Falcon booster launched”', url:'https://spaceflightnow.com/2025/08/03/live-coverage-spacex-to-launch-28-starlink-satellites-on-falcon-9-rocket-from-cape-canaveral-8/', note:{en:'The 450th launch of a previously flown Falcon booster, August 2025.', ru:'450-й запуск ранее летавшей ступени Falcon, август 2025.'}},
  {title:'FAA (2022), Final Programmatic Environmental Assessment for the SpaceX Starship/Super Heavy Launch Vehicle Program at the Boca Chica Launch Site', url:'https://www.faa.gov/sites/faa.gov/files/2022-06/PEA_for_SpaceX_Starship_Super_Heavy_at_Boca_Chica_FINAL.pdf', note:{en:'Super Heavy: up to 37 Raptors, up to 3,700 t of propellant, up to 74 MN; Starship: six Raptors, up to 1,500 t, 12 MN; LOX/methane 3.6:1; no separable fairings or parachutes.', ru:'Super Heavy: до 37 двигателей Raptor, до 3700 т топлива, до 74 МН; Starship: шесть Raptor, до 1500 т, 12 МН; кислород/метан 3,6:1; без сбрасываемых обтекателей и парашютов.'}},
  {title:'Spaceflight Now (2024), “SpaceX pulls off mid-air launch pad capture of descending Super Heavy booster”', url:'https://spaceflightnow.com/2024/10/13/spacex-pulls-off-mid-air-launch-pad-capture-of-descending-super-heavy-booster/', note:{en:'Flight 5, 13 October 2024: Booster 12 caught by the tower arms about seven minutes after liftoff.', ru:'Пятый полёт, 13 октября 2024: Booster 12 пойман руками башни примерно через семь минут после старта.'}},
  {title:'R. W. Orloff (2000), Apollo by the Numbers, NASA SP-2000-4029', url:'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4029.pdf', note:{en:'Saturn V S-IC rated thrust 7,610,000 lbf.', ru:'Номинальная тяга S-IC «Сатурна-5» — 7 610 000 фунтов.'}},
  {title:'A. A. Siddiqi (2000), Challenge to Apollo, NASA SP-2000-4408', url:'https://history.nasa.gov/SP-4408pt2.pdf', note:{en:'N1 first stage: 30 NK-15 engines of 153.4 t sea-level thrust.', ru:'Первая ступень Н-1: 30 двигателей НК-15 по 153,4 т тяги у земли.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderPay();
  renderLand();
  renderThr();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__return = {payload:payload, P_EXP:P_EXP, landing:landing, F_MIN:F_MIN, F_MAX:F_MAX, THR:THR};
