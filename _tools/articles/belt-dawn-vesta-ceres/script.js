/* ============ CONSTANTS ============ */
var G0 = 9.80665, G_N = 6.6743e-11;
var M_LAUNCH = 1217.7, M_DRY = 747.1, M_XE = 425, M_N2H4 = 45.6;   // kg, NSSDC [2]
var M_NOXE = M_DRY + M_N2H4;                                        // 792.7 kg: Dawn with every kg of xenon gone
var F_MAX = 0.092;                                                  // N, one engine at 2.6 kW [2]
var DV_END = 41360/3600;                                            // km/s, 41,360 km/h [5]
var ISP_CHEM = 320, ISP_ION = 3100;                                 // s; 320 typical chemical, 3,100 Dawn nominal [1]
var MILESTONES = {
  vesta: {dv:6.7,    xe:250, en:'At Vesta orbit capture, July 2011', ru:'Выход на орбиту Весты, июль 2011'},       // [3]
  ceres: {dv:11.0,   xe:401, en:'At Ceres, June 2016',               ru:'У Цереры, июнь 2016'},                     // [4]
  end:   {dv:DV_END, xe:M_XE, en:'Whole mission, 2007–2018',         ru:'Вся миссия, 2007–2018'}                    // [5], load [2]
};
/* GM and mean diameters from JPL SBDB [9]; equal-volume spheres */
var BODIES = {
  vesta: {en:'Vesta', ru:'Веста', GM:17.2882844e9, R:522.77e3/2, rhoPub:3460},
  ceres: {en:'Ceres', ru:'Церера', GM:62.6284e9,   R:939.4e3/2,  rhoPub:2162},
  moon:  {en:'Moon',  ru:'Луна',  GM:4900e9,       R:1737.4e3,   rhoPub:3344}   // NASA fact sheet [17]
};
/* Mapping orbits: altitude km, published period h, real transfer from the previous orbit in days — all [1] */
var ORBITS = {
  vesta: [
    {id:'survey', alt:2700, pubH:null,   days:null},
    {id:'hamo',   alt:680,  pubH:12.3,   days:null},
    {id:'lamo',   alt:210,  pubH:4.3,    days:36}     // 2 Nov → 8 Dec 2011
  ],
  ceres: [
    {id:'rc3',    alt:13600, pubH:null,  days:null},
    {id:'survey', alt:4400,  pubH:3.1*24, days:25},   // 9 May → 3 Jun 2015
    {id:'hamo',   alt:1470,  pubH:19,    days:44},    // 30 Jun → 13 Aug 2015
    {id:'lamo',   alt:385,   pubH:5.4,   days:45}     // 23 Oct → 7 Dec 2015
  ]
};
var ORBIT_NAMES = {rc3:['RC3','RC3'], survey:['Survey','Обзорная'], hamo:['HAMO','HAMO'], lamo:['LAMO','LAMO']};
var ORBIT_FROM_RU = {rc3:'RC3', survey:'обзорной', hamo:'HAMO', lamo:'LAMO'};   // genitive after «от»

function propNeeded(dvKms, isp, m0){ return m0*(1 - Math.exp(-dvKms*1000/(isp*G0))); }     // propellant burned from a fixed starting mass
function deliverNeeded(dvKms, isp, mf){ return mf*(Math.exp(dvKms*1000/(isp*G0)) - 1); }  // propellant to give a fixed final mass the Δv
function impliedIsp(dvKms, xe){ return dvKms*1000/(G0*Math.log(M_LAUNCH/(M_LAUNCH - xe))); }
function push(FmN, m){ var F = FmN/1000, a = F/m; return {a:a, grams:F/G0*1000, daysTo100:(100/3.6)/a/86400, perDay:a*86400, perYear:a*86400*365.25/1000}; }
function body(key){ var b = BODIES[key], V = 4/3*Math.PI*Math.pow(b.R, 3), M = b.GM/G_N; return {M:M, rho:M/V, g:b.GM/(b.R*b.R), vesc:Math.sqrt(2*b.GM/b.R), R:b.R}; }
function orbit(key, altKm){ var b = BODIES[key], r = b.R + altKm*1000, v = Math.sqrt(b.GM/r); return {r:r, v:v, T:2*Math.PI*Math.sqrt(r*r*r/b.GM)}; }
function spiralDv(key, alt1, alt2){ return Math.abs(orbit(key, alt2).v - orbit(key, alt1).v); }
function jump(key, hEarth){ return hEarth*G0/body(key).g; }
function airtime(key, hEarth){ return 2*Math.sqrt(2*jump(key, hEarth)/body(key).g); }
var SHEET_G = 0.210*0.297*80;                                       // A4 at 80 g/m² = 4.99 g

/* ============ CH3 — XENON LEDGER ============ */
var xDv = document.getElementById('xDv'), xIsp = document.getElementById('xIsp'), xeMile = 'end';
function renderXe(){
  var dv = +xDv.value, isp = +xIsp.value, p = propNeeded(dv, isp, M_LAUNCH), pc = propNeeded(dv, ISP_CHEM, M_LAUNCH), dc = deliverNeeded(dv, ISP_CHEM, M_NOXE);
  document.getElementById('xDvVal').textContent = fmt(dv, 2) + T(' km/s',' км/с');
  document.getElementById('xIspVal').textContent = fmtInt(isp) + T(' s',' с');
  var svg = document.getElementById('xeSvg'); svg.innerHTML = '';
  var L = 60, R = 465, Tp = 24, B = 252;
  function X(v){ return L + v/15*(R - L); }
  function Y(kg){ return B - (Math.log10(Math.max(kg, 10)) - 1)/2.2*(B - Tp); }   // 10 kg … ~1.6 t
  [10,30,100,300,1000].forEach(function(k){ ns('line', {x1:L, y1:Y(k), x2:R, y2:Y(k), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(k) + 3, fmtInt(k) + T(' kg',' кг'), 'svg-small', 'end'); });
  [0,3,6,9,12,15].forEach(function(v){ txt(svg, X(v), B + 14, v, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('change of speed Δv, km/s','изменение скорости Δv, км/с'), 'svg-small', 'end');
  txt(svg, L, 14, T('propellant burned from Dawn’s 1,217.7 kg launch mass, log scale','топливо, сожжённое из стартовых 1217,7 кг Dawn, лог. шкала'), 'svg-small');
  ns('line', {x1:L, y1:Y(M_LAUNCH), x2:R, y2:Y(M_LAUNCH), stroke:'#0b0b0c', 'stroke-dasharray':'1 3'}, svg);
  txt(svg, R - 4, Y(M_LAUNCH) - 5, T('the whole spacecraft, 1,217.7 kg','весь аппарат, 1217,7 кг'), 'svg-small', 'end');
  ns('line', {x1:L, y1:Y(M_XE), x2:R, y2:Y(M_XE), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(M_XE) + 13, T('425 kg of xenon on board','425 кг ксенона на борту'), 'svg-small', 'end');
  function curve(I, stroke, w, dash){
    var d = '';
    for(var v = 0.05; v <= 15.0001; v += 0.05){ var k = propNeeded(v, I, M_LAUNCH); d += (d ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(k).toFixed(1); }
    var at = {d:d, fill:'none', stroke:stroke, 'stroke-width':w}; if(dash) at['stroke-dasharray'] = dash; ns('path', at, svg);
  }
  curve(ISP_CHEM, '#b5452a', 1.5, '5 3'); curve(ISP_ION, '#7a7a74', 1.5, '2 3'); curve(isp, '#0b0b0c', 2.2);
  Object.keys(MILESTONES).forEach(function(k){ var m = MILESTONES[k]; ns('rect', {x:X(m.dv) - 3.5, y:Y(m.xe) - 3.5, width:7, height:7, fill:'#2f5aa1'}, svg); });
  ns('circle', {cx:X(dv), cy:Y(p), r:5, fill:'#b5452a'}, svg);
  var m = MILESTONES[xeMile], mi = impliedIsp(m.dv, m.xe);
  cells(document.getElementById('xeReadout'), [
    [T('PROPELLANT BURNED','СОЖЖЕНО ТОПЛИВА'), fmtInt(p) + T(' kg',' кг')],
    [T('LEFT OF 1,217.7 kg','ОСТАЁТСЯ ИЗ 1217,7 кг'), fmtInt(M_LAUNCH - p) + T(' kg',' кг')],
    [T('EXHAUST SPEED','СКОРОСТЬ ИСТЕЧЕНИЯ'), fmt(isp*G0/1000, 1) + T(' km/s',' км/с')],
    [T('CHEMICAL 320 s, SAME START','ХИМИЯ 320 с, ТОТ ЖЕ СТАРТ'), fmtInt(pc) + T(' kg burned, ',' кг сожжено, ') + fmtInt(M_LAUNCH - pc) + T(' kg left',' кг осталось')],
    [T('CHEMICAL TO DELIVER 792.7 kg','ХИМИЯ, ЧТОБЫ ДОСТАВИТЬ 792,7 кг'), fmtInt(dc) + T(' kg of propellant = ',' кг топлива = ') + fmt(dc/M_LAUNCH, 1) + T('× Dawn’s launch mass','× стартовой массы Dawn'), true],
    [T('MILESTONE: ','ВЕХА: ') + T(m.en, m.ru), fmt(m.dv, 2) + T(' km/s, ',' км/с, ') + fmtInt(m.xe) + T(' kg Xe → I',' кг Xe → I') + '<sub>sp</sub> ' + (xeMile === 'end' ? '≈ ' : '≤ ') + fmtInt(mi) + T(' s',' с'), true]
  ]);
  hud1.textContent = fmtInt(p) + T(' kg',' кг');
  document.getElementById('xeStatus').innerHTML = p <= M_XE
    ? T('<b>Fits in Dawn’s tank:</b> ','<b>Помещается в бак Dawn:</b> ') + fmtInt(p) + T(' kg of 425. A chemical engine starting from the same 1,217.7 kg would burn ',' кг из 425. Химический двигатель с той же стартовой массой сжёг бы ') + fmtInt(pc) + T(' kg and leave only ',' кг и оставил бы всего ') + fmtInt(M_LAUNCH - pc) + T(' kg of spacecraft.',' кг аппарата.')
    : T('<b>More than Dawn carried:</b> ','<b>Больше, чем вёз Dawn:</b> ') + fmtInt(p) + T(' kg, against 425 kg of xenon on board. Raise the specific impulse, or ask for less Δv.',' кг против 425 кг ксенона на борту. Поднимите удельный импульс или уменьшите Δv.');
}
[xDv, xIsp].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('xePreset'), null); renderXe(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#xePreset .btn'), function(btn){
  btn.addEventListener('click', function(){
    xeMile = this.getAttribute('data-m'); var m = MILESTONES[xeMile];
    xDv.value = m.dv.toFixed(2); xIsp.value = Math.round(impliedIsp(m.dv, m.xe)/10)*10;
    pressGroup(this.parentNode, this); renderXe();
  });
});

/* ============ CH4 — THE GENTLEST PUSH ============ */
var tF = document.getElementById('tF'), tM = document.getElementById('tM');
function renderThrust(){
  var F = +tF.value, m = +tM.value, P = push(F, m), P0 = push(92, M_LAUNCH);
  document.getElementById('tFVal').textContent = fmtInt(F) + T(' mN',' мН');
  document.getElementById('tMVal').textContent = fmtInt(m) + T(' kg',' кг');
  var svg = document.getElementById('thrSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 24, B = 250, dmax = 30, vmax = 300;
  function X(d){ return L + d/dmax*(R - L); }
  function Y(v){ return B - Math.min(v, vmax)/vmax*(B - Tp); }
  [0,50,100,150,200,250,300].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, v, 'svg-small', 'end'); });
  [0,5,10,15,20,25,30].forEach(function(d){ txt(svg, X(d), B + 14, d, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('days of continuous thrust','дни непрерывной работы'), 'svg-small', 'end');
  txt(svg, L, 14, T('speed gained, m/s','набранная скорость, м/с'), 'svg-small');
  ns('line', {x1:L, y1:Y(100/3.6), x2:R, y2:Y(100/3.6), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 4, Y(100/3.6) - 5, T('100 km/h','100 км/ч'), 'svg-small', 'end');
  ns('line', {x1:X(0), y1:Y(0), x2:X(dmax), y2:Y(P0.perDay*dmax), stroke:'#7a7a74', 'stroke-dasharray':'2 3'}, svg);
  var dEnd = Math.min(dmax, vmax/P.perDay);
  ns('line', {x1:X(0), y1:Y(0), x2:X(dEnd), y2:Y(P.perDay*dEnd), stroke:'#0b0b0c', 'stroke-width':2.2}, svg);
  if(P.daysTo100 <= dmax) ns('circle', {cx:X(P.daysTo100), cy:Y(100/3.6), r:5, fill:'#b5452a'}, svg);
  var sheets = P.grams/SHEET_G;
  cells(document.getElementById('thrReadout'), [
    [T('ACCELERATION','УСКОРЕНИЕ'), fmt(P.a*1e6, 0) + T(' µm/s²',' мкм/с²')],
    [T('SAME AS THE WEIGHT OF','КАК ВЕС'), fmt(P.grams, 1) + T(' g ≈ ',' г ≈ ') + fmt(sheets, 1) + T(' sheets of A4',' листа A4')],
    [T('0 → 100 km/h','0 → 100 км/ч'), fmt(P.daysTo100, 1) + T(' days',' сут')],
    [T('Δv PER DAY','Δv ЗА СУТКИ'), fmt(P.perDay, 2) + T(' m/s',' м/с')],
    [T('Δv PER 30 DAYS','Δv ЗА 30 СУТОК'), fmt(P.perDay*30, 0) + T(' m/s',' м/с')],
    [T('Δv PER YEAR','Δv ЗА ГОД'), fmt(P.perYear, 2) + T(' km/s',' км/с')]
  ]);
  var avg = DV_END*1000/(5.87*365.25*86400);
  document.getElementById('thrStatus').innerHTML = T('A year at this setting adds ','Год работы в таком режиме добавляет ') + fmt(P.perYear, 2) + T(' km/s. Over the real mission, 11.49 km/s in 5.87 years of firing is an average of ',' км/с. За реальную миссию 11,49 км/с за 5,87 года работы — это в среднем ') + fmt(avg*1e6, 0) + T(' µm/s²: less than full thrust, because far from the Sun there was less power for the engine.',' мкм/с²: меньше полной тяги, потому что вдали от Солнца двигателю доставалось меньше мощности.');
}
[tF, tM].forEach(function(el){ el.addEventListener('input', renderThrust); });

/* ============ CH6 — ORBITS AND SPIRALS ============ */
var orbKey = 'ceres', orbId = 'lamo', orbDot = null, orbAng = 0, orbGeo = null;
function orbIndex(){ var list = ORBITS[orbKey]; for(var i = 0; i < list.length; i++) if(list[i].id === orbId) return i; return list.length - 1; }
function renderOrbit(){
  var list = ORBITS[orbKey], i = orbIndex(), o = list[i], prev = i > 0 ? list[i - 1] : null, b = BODIES[orbKey];
  Array.prototype.forEach.call(document.querySelectorAll('#orbPick .btn'), function(btn){
    var ok = list.some(function(x){ return x.id === btn.getAttribute('data-o'); });
    btn.hidden = !ok; var on = btn.getAttribute('data-o') === orbId; btn.classList.toggle('active', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  var O = orbit(orbKey, o.alt), Op = prev ? orbit(orbKey, prev.alt) : null;
  var svg = document.getElementById('orbSvg'); svg.innerHTML = '';
  var cx = 240, cy = 178, outer = Op ? Op.r : O.r, k = 148/outer;
  ns('circle', {cx:cx, cy:cy, r:Math.max(2, b.R*k), fill:'#d9d6cc', stroke:'#0b0b0c', 'stroke-width':1}, svg);
  if(Op){
    ns('circle', {cx:cx, cy:cy, r:Op.r*k, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'3 3'}, svg);
    var d = '', turns = 4;
    for(var s = 0; s <= 1.0001; s += 0.005){ var rr = (Op.r + (O.r - Op.r)*s)*k, th = -Math.PI/2 + s*turns*2*Math.PI; d += (d ? 'L' : 'M') + (cx + rr*Math.cos(th)).toFixed(1) + ' ' + (cy + rr*Math.sin(th)).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':1, opacity:0.7}, svg);
  }
  ns('circle', {cx:cx, cy:cy, r:O.r*k, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  orbGeo = {cx:cx, cy:cy, r:O.r*k, T:O.T};
  orbDot = ns('circle', {cx:cx + orbGeo.r*Math.cos(orbAng), cy:cy + orbGeo.r*Math.sin(orbAng), r:4.5, fill:'#b5452a'}, svg);
  var bar = Math.pow(10, Math.floor(Math.log10(outer/1000))), barPx = bar*1000*k;
  ns('line', {x1:18, y1:326, x2:18 + barPx, y2:326, stroke:'#0b0b0c', 'stroke-width':2}, svg);
  txt(svg, 18, 318, fmtInt(bar) + T(' km',' км'), 'svg-small');
  txt(svg, 18, 16, T(b.en, b.ru) + ' · ' + T(ORBIT_NAMES[o.id][0], ORBIT_NAMES[o.id][1]) + ' · ' + fmtInt(o.alt) + T(' km up',' км над поверхностью'), 'svg-small');
  if(Op) txt(svg, 18, 30, T('dashed: previous orbit; blue: spiral (schematic, 4 turns)','пунктир — предыдущая орбита; синим — спираль (схема, 4 витка)'), 'svg-small');
  var Th = O.T/3600, rows = [
    [T('ORBIT SPEED','ОРБИТАЛЬНАЯ СКОРОСТЬ'), fmtInt(O.v) + T(' m/s',' м/с')],
    [T('PERIOD (KEPLER)','ПЕРИОД (КЕПЛЕР)'), Th < 48 ? fmt(Th, 1) + T(' h',' ч') : fmt(Th/24, 1) + T(' days',' сут')],
    [T('PUBLISHED PERIOD','ОПУБЛИКОВАННЫЙ ПЕРИОД'), o.pubH ? (o.pubH < 48 ? fmt(o.pubH, 1) + T(' h',' ч') : fmt(o.pubH/24, 1) + T(' days',' сут')) + ' (' + (Th >= o.pubH ? '+' : '') + fmt((Th/o.pubH - 1)*100, 1) + ' %)' : T('not given [1]','не указан [1]')]
  ];
  if(Op){
    var dv = spiralDv(orbKey, prev.alt, o.alt), fullDays = dv/(F_MAX/M_LAUNCH)/86400;
    rows.push([T('SPIRAL Δv FROM ','Δv СПИРАЛИ ОТ ') + T(ORBIT_NAMES[prev.id][0], ORBIT_FROM_RU[prev.id]).toUpperCase(), fmt(dv, 0) + T(' m/s',' м/с')]);
    rows.push([T('AT FULL THRUST (92 mN, 1,218 kg)','НА ПОЛНОЙ ТЯГЕ (92 мН, 1218 кг)'), fmt(fullDays, 1) + T(' days',' сут')]);
    rows.push([T('REAL TRANSFER','РЕАЛЬНЫЙ ПЕРЕХОД'), o.days ? fmtInt(o.days) + T(' days',' сут') : T('—','—')]);
  } else {
    rows.push([T('SPIRAL Δv','Δv СПИРАЛИ'), T('first orbit','первая орбита')]);
  }
  cells(document.getElementById('orbReadout'), rows);
  hud2.textContent = Th < 48 ? fmt(Th, 1) + T(' h',' ч') : fmt(Th/24, 1) + T(' d',' сут');
  var st;
  if(Op && o.days){
    st = T('The spiral needs only ','Спирали нужно всего ') + fmt(spiralDv(orbKey, prev.alt, o.alt), 0) + T(' m/s, yet took ',' м/с, но она заняла ') + fmtInt(o.days) + T(' days: ',' сут: ') + fmt(o.days/(spiralDv(orbKey, prev.alt, o.alt)/(F_MAX/M_LAUNCH)/86400), 1) + T('× longer than full thrust would need even at launch mass. There was far less than full power so far from the Sun, and thrusting paused for navigation and communication [2][8].','× дольше, чем потребовалось бы на полной тяге даже со стартовой массой. Так далеко от Солнца мощности было гораздо меньше полной, а работа двигателей прерывалась для навигации и связи [2][8].');
  } else if(Op){
    st = T('Going down to this orbit means speeding up by ','Спуск на эту орбиту означает ускорение на ') + fmt(spiralDv(orbKey, prev.alt, o.alt), 0) + T(' m/s.',' м/с.');
  } else {
    st = T('The first mapping orbit at ','Первая картографическая орбита у ') + T(b.en, b.ru) + T(': one lap every ',': один виток за ') + (Th < 48 ? fmt(Th, 1) + T(' hours.',' ч.') : fmt(Th/24, 1) + T(' days.',' сут.'));
  }
  document.getElementById('orbStatus').innerHTML = st;
}
Array.prototype.forEach.call(document.querySelectorAll('#orbBody .btn'), function(btn){
  btn.addEventListener('click', function(){ orbKey = this.getAttribute('data-body'); orbId = 'lamo'; pressGroup(this.parentNode, this); renderOrbit(); });
});
Array.prototype.forEach.call(document.querySelectorAll('#orbPick .btn'), function(btn){
  btn.addEventListener('click', function(){ orbId = this.getAttribute('data-o'); renderOrbit(); });
});
/* the dot laps at one screen second per real hour */
if(!reduced()) visibleLoop(document.getElementById('orbSvg'), function(dt){
  if(!orbDot || !orbGeo) return;
  orbAng = (orbAng + dt*3600/orbGeo.T*2*Math.PI) % (2*Math.PI);
  orbDot.setAttribute('cx', (orbGeo.cx + orbGeo.r*Math.cos(orbAng)).toFixed(1));
  orbDot.setAttribute('cy', (orbGeo.cy + orbGeo.r*Math.sin(orbAng)).toFixed(1));
});

/* ============ CH8 — TWO WORLDS COMPARED ============ */
var cmpLayer = 'size', cmpMoon = false;
function renderCmp(){
  var svg = document.getElementById('cmpSvg'); svg.innerHTML = '';
  var keys = cmpMoon ? ['moon','ceres','vesta'] : ['ceres','vesta'], gap = 30, W = 440, base = 268;
  var total = keys.reduce(function(s, kk){ return s + 2*BODIES[kk].R; }, 0), k = Math.min((W - gap*(keys.length - 1))/total, 230/(2*BODIES[keys[0]].R));
  var x = 20 + (W - gap*(keys.length - 1) - total*k)/2;
  keys.forEach(function(kk){
    var b = BODIES[kk], r = b.R*k, cx = x + r, cy = base - r;
    ns('circle', {cx:cx, cy:cy, r:r, fill:kk === 'ceres' ? '#bdb9ae' : (kk === 'vesta' ? '#d9d6cc' : '#ecebe6'), stroke:'#0b0b0c', 'stroke-width':1}, svg);
    if(cmpLayer === 'inside' && kk === 'vesta'){
      ns('circle', {cx:cx, cy:cy, r:113e3*k, fill:'#7a7a74', opacity:0.35}, svg);
      ns('circle', {cx:cx, cy:cy, r:107e3*k, fill:'#5a5a55'}, svg);
      if(r >= 40) txt(svg, cx, cy + 3, T('iron core','железное ядро'), 'svg-small', 'middle').setAttribute('style', 'fill:#fff');
    }
    if(cmpLayer === 'inside' && kk === 'ceres'){
      ns('circle', {cx:cx, cy:cy, r:(b.R - 70e3)*k, fill:'#8a8378', opacity:0.35}, svg);
      ns('circle', {cx:cx, cy:cy, r:(b.R - 190e3)*k, fill:'#5a5a55'}, svg);
      if(r >= 40){ txt(svg, cx, cy + 3, T('rocky core','каменное ядро'), 'svg-small', 'middle').setAttribute('style', 'fill:#fff');
      txt(svg, cx, cy - r + 14, T('shell 70–190 km thick (range of estimates)','оболочка 70–190 км (диапазон оценок)'), 'svg-small', 'middle'); }
    }
    if(cmpLayer === 'marks' && kk === 'vesta'){
      var hc = 250e3/b.R, yy = Math.sqrt(Math.max(0, 1 - hc*hc))*r;
      var ang = Math.asin(hc);
      ns('path', {d:'M' + (cx - hc*r).toFixed(1) + ' ' + (cy + yy).toFixed(1) + ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 0 ' + (cx + hc*r).toFixed(1) + ' ' + (cy + yy).toFixed(1) + ' Z', fill:'#b5452a', opacity:0.25}, svg);
      ns('line', {x1:cx - hc*r, y1:cy + yy, x2:cx + hc*r, y2:cy + yy, stroke:'#b5452a', 'stroke-width':1.5}, svg);
      txt(svg, cx, base + 16, T('Rheasilvia 500 km','Реасильвия 500 км'), 'svg-small', 'middle');
    }
    if(cmpLayer === 'marks' && kk === 'ceres'){
      var oc = 46e3*k, ox = cx + r*0.3, oy = cy - r*0.35;
      ns('circle', {cx:ox, cy:oy, r:Math.max(oc, 2), fill:'none', stroke:'#0b0b0c', 'stroke-width':1}, svg);
      ns('circle', {cx:ox, cy:oy, r:Math.max(oc*0.25, 1.5), fill:'#ffffff', stroke:'#2f5aa1', 'stroke-width':0.8}, svg);
      txt(svg, ox + oc + 4, oy - oc - 2, T('Occator 92 km','Оккатор 92 км'), 'svg-small');
    }
    txt(svg, cx, base + (cmpLayer === 'marks' && kk === 'vesta' ? 30 : 16), T(b.en, b.ru) + ' · ' + fmtInt(2*b.R/1000) + T(' km',' км'), 'svg-label', 'middle');
    x += 2*r + gap;
  });
  var V = body('vesta'), C = body('ceres'), Mo = body('moon');
  function pair(a, c, f){ return f(a) + ' / ' + f(c); }
  var rows = [
    [T('MASS, VESTA / CERES','МАССА, ВЕСТА / ЦЕРЕРА'), pair(V, C, function(o){ return fmt(o.M/1e20, 2); }) + T(' × 10²⁰ kg',' × 10²⁰ кг'), true],
    [T('DENSITY','ПЛОТНОСТЬ'), pair(V, C, function(o){ return fmtInt(o.rho); }) + T(' kg/m³',' кг/м³')],
    [T('SURFACE GRAVITY','УСКОРЕНИЕ СВОБ. ПАДЕНИЯ'), pair(V, C, function(o){ return fmt(o.g, 3); }) + T(' m/s²',' м/с²')],
    [T('ESCAPE SPEED','СКОРОСТЬ УБЕГАНИЯ'), pair(V, C, function(o){ return fmtInt(o.vesc); }) + T(' m/s',' м/с')],
    [T('0.5 m EARTH JUMP','ЗЕМНОЙ ПРЫЖОК 0,5 м'), fmt(jump('vesta', 0.5), 1) + ' / ' + fmt(jump('ceres', 0.5), 1) + T(' m',' м')],
    [T('TIME IN THE AIR','ВРЕМЯ В ВОЗДУХЕ'), fmt(airtime('vesta', 0.5), 1) + ' / ' + fmt(airtime('ceres', 0.5), 1) + T(' s',' с')]
  ];
  if(cmpMoon) rows.push([T('THE MOON','ЛУНА'), fmtInt(Mo.rho) + T(' kg/m³ · ',' кг/м³ · ') + fmt(Mo.g, 2) + T(' m/s² · ',' м/с² · ') + fmtInt(Mo.vesc) + T(' m/s',' м/с'), true]);
  cells(document.getElementById('cmpReadout'), rows);
  var st = {
    size: T('Ceres is 1.8 times as wide and holds 3.6 times the mass, but it is far less dense: ','Церера в 1,8 раза шире и в 3,6 раза массивнее, но гораздо менее плотная: ') + fmtInt(C.rho) + T(' against ',' против ') + fmtInt(V.rho) + T(' kg/m³. The extra size more than makes up for it: Ceres’s surface gravity is a little stronger.',' кг/м³. Размер с лихвой это компенсирует: на поверхности Цереры тяготение чуть сильнее.'),
    inside: T('Vesta melted early and its iron sank into a core [10]. Ceres separated only partly: rock below, a lighter shell rich in ice above [12].','Веста рано расплавилась, и её железо опустилось в ядро [10]. Церера расслоилась лишь частично: внизу камень, сверху более лёгкая оболочка, богатая льдом [12].'),
    marks: T('Rheasilvia’s rim spans almost the whole width of Vesta, 19 km deep [11]. Occator is a 92 km crater with the brightest salt deposits on Ceres [15].','Вал Реасильвии охватывает почти всю ширину Весты, её глубина 19 км [11]. Оккатор — 92-километровый кратер с самыми яркими солевыми отложениями на Церере [15].')
  };
  document.getElementById('cmpStatus').innerHTML = st[cmpLayer];
}
Array.prototype.forEach.call(document.querySelectorAll('#cmpLayer .btn'), function(btn){
  btn.addEventListener('click', function(){ cmpLayer = this.getAttribute('data-l'); pressGroup(this.parentNode, this); renderCmp(); });
});
Array.prototype.forEach.call(document.querySelectorAll('#cmpMoon .btn'), function(btn){
  btn.addEventListener('click', function(){ cmpMoon = this.getAttribute('data-moon') === '1'; pressGroup(this.parentNode, this); renderCmp(); });
});

/* ============ CH9 — TIMELINE ============ */
var TIMELINE = [
  ['2007', '<b>27 September:</b> launch on a Delta II Heavy from Cape Canaveral. <b>17 December:</b> long-term ion cruise begins.', '<b>27 сентября:</b> старт на Delta II Heavy с мыса Канаверал. <b>17 декабря:</b> начало долгого полёта на ионной тяге.'],
  ['2009', '<b>17 February:</b> Mars flyby at 542 km.', '<b>17 февраля:</b> пролёт Марса на высоте 542 км.'],
  ['2010', '<b>17 June:</b> the first of four reaction wheels fails.', '<b>17 июня:</b> отказ первого из четырёх маховиков.'],
  ['2011', '<b>16 July:</b> in orbit around Vesta, the first spacecraft to orbit a main-belt object.', '<b>16 июля:</b> на орбите вокруг Весты — первый аппарат на орбите объекта главного пояса.'],
  ['2012', '<b>8 August:</b> second wheel fails. <b>5 September:</b> Dawn leaves Vesta for Ceres.', '<b>8 августа:</b> отказ второго маховика. <b>5 сентября:</b> Dawn покидает Весту и летит к Церере.'],
  ['2015', '<b>6 March:</b> in orbit around Ceres, the first mission to a dwarf planet. <b>December:</b> low mapping orbit, 385 km.', '<b>6 марта:</b> на орбите вокруг Цереры — первая миссия к карликовой планете. <b>Декабрь:</b> низкая картографическая орбита, 385 км.'],
  ['2016', '<b>30 June:</b> end of the primary mission; the first of two extensions follows.', '<b>30 июня:</b> конец основной миссии; затем первое из двух продлений.'],
  ['2018', '<b>June:</b> the ion engines fire for the last time — 5.87 years in all, 11.49 km/s. Final orbit dips below 35 km. <b>31 October – 1 November:</b> hydrazine exhausted, mission over.', '<b>Июнь:</b> последнее включение ионных двигателей — всего 5,87 года работы, 11,49 км/с. Конечная орбита опускается ниже 35 км. <b>31 октября – 1 ноября:</b> гидразин исчерпан, миссия окончена.'],
  ['2020', '<b>10 August:</b> Dawn data reveal deep brine under Occator.', '<b>10 августа:</b> данные Dawn указывают на глубокий рассол под Оккатором.'],
  ['2038 →', 'Dawn stays in orbit around Ceres at least until 2038, and with more than 99 % confidence until 2068.', 'Dawn остаётся на орбите Цереры не меньше чем до 2038 года, а с уверенностью больше 99 % — до 2068-го.']
];

/* ============ CH10 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Siddiqi (2018), Beyond Earth: A Chronicle of Deep Space Exploration, 1958–2016, NASA SP-2018-4041, pp. 253–256', url:'https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf', note:{en:'Dawn: launch mass, Delta II Heavy, ion cruise dates, Mars flyby at 542 km, Vesta and Ceres orbit insertions, every mapping-orbit altitude and period, transfer dates, reaction-wheel failures, Rheasilvia and Veneneia, 13,000 Vesta images. It gives Ceres orbit entry as 00:39 UT on 7 March 2015; JPL [19] gives 6 March, used here.', ru:'Dawn: стартовая масса, Delta II Heavy, даты полёта на ионной тяге, пролёт Марса на 542 км, выходы на орбиты Весты и Цереры, высоты и периоды всех картографических орбит, даты переходов, отказы маховиков, Реасильвия и Вененея, 13 000 снимков Весты. Выход на орбиту Цереры здесь датирован 00:39 UT 7 марта 2015 года; JPL [19] даёт 6 марта — эта дата и использована.'}},
  {title:'NASA NSSDCA Master Catalog, Dawn (2007-043A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A', note:{en:'Dry mass 747.1 kg, launch mass 1,217.7 kg, 425 kg xenon, 45.6 kg hydrazine; solar arrays 19.7 m, 10.3 kW at 1 AU and 1.3 kW at 3 AU; 92 mN per engine at 2.6 kW, I<sub>sp</sub> 3,200–1,900 s.', ru:'Сухая масса 747,1 кг, стартовая 1217,7 кг, 425 кг ксенона, 45,6 кг гидразина; солнечные батареи 19,7 м, 10,3 кВт на 1 а. е. и 1,3 кВт на 3 а. е.; 92 мН на двигатель при 2,6 кВт, I<sub>уд</sub> 3200–1900 с.'}},
  {title:'C. E. Garner, M. D. Rayman, J. R. Brophy, S. C. Mikes (2011), “In-Flight Operation of the Dawn Ion Propulsion System Through Orbit Capture at Vesta”, NASA NTRS 20150008816', url:'https://ntrs.nasa.gov/citations/20150008816', note:{en:'To Vesta orbit capture: about 23,400 h of operation, about 250 kg of xenon, about 6.7 km/s; the Mars flyby is the only needed velocity change after launch not made by the ion engines.', ru:'До выхода на орбиту Весты: около 23 400 ч работы, около 250 кг ксенона, около 6,7 км/с; пролёт Марса — единственное нужное изменение скорости после старта, сделанное не ионными двигателями.'}},
  {title:'C. E. Garner, M. D. Rayman (2016), “In-Flight Operation of the Dawn Ion Propulsion System Through the Low Altitude Mapping Orbit at Ceres”, NASA NTRS 20190002063', url:'https://ntrs.nasa.gov/citations/20190002063', note:{en:'By June 2016: about 48,458 h of operation, about 401 kg of xenon, over 11.0 km/s; LAMO at a mean altitude of about 385 km; primary mission to end 30 June 2016.', ru:'К июню 2016: около 48 458 ч работы, около 401 кг ксенона, больше 11,0 км/с; LAMO на средней высоте около 385 км; основная миссия заканчивается 30 июня 2016.'}},
  {title:'NASA JPL (28 June 2018), “Dawn’s Engines Complete Firing, Science Continues”', url:'https://www.jpl.nasa.gov/news/dawns-engines-complete-firing-science-continues/', note:{en:'Record total firing time of 5.87 years and record total effective velocity change of 25,700 mph (41,360 km/h).', ru:'Рекордное суммарное время работы 5,87 года и рекордное суммарное изменение скорости 25 700 миль/ч (41 360 км/ч).'}},
  {title:'M. D. Rayman (2013), “Dawn Journal: Breaking Velocity Records”, The Planetary Society', url:'https://www.planetary.org/articles/20130702-dawn-journal-breaking-velocity-records', note:{en:'The push of an ion engine compared to a sheet of paper in your hand; at the reduced thrust of mid-2013, more than five days from zero to 60 mph; an average of less than 2.7 mg of xenon per second over the first 3.6 years of thrusting.', ru:'Тяга ионного двигателя сравнивается с листом бумаги на ладони; при пониженной тяге середины 2013 года — больше пяти дней от нуля до 60 миль/ч; в среднем меньше 2,7 мг ксенона в секунду за первые 3,6 года работы двигателей.'}},
  {title:'T. N. Edelbaum (1961), “Propulsion Requirements for Controllable Satellites”, ARS Journal 31 (8), 1079–1089', url:'https://doi.org/10.2514/8.5723', note:{en:'The low-thrust result used here: a slow spiral between coplanar circular orbits costs the difference of the two circular speeds.', ru:'Использованный здесь результат для малой тяги: медленная спираль между компланарными круговыми орбитами стоит разности двух круговых скоростей.'}},
  {title:'D. Han (2012), “Orbit Transfers for Dawn’s Vesta Operations: Navigation and Mission Design Experience”, NASA NTRS 20150004633', url:'https://ntrs.nasa.gov/citations/20150004633', note:{en:'How the transfers between Vesta mapping orbits were planned: thrust sequences, orbit determination between them, and Deep Space Network coverage.', ru:'Как планировались переходы между картографическими орбитами Весты: последовательности работы двигателей, определение орбиты между ними и сеансы Сети дальней космической связи.'}},
  {title:'NASA JPL Small-Body Database: 4 Vesta and 1 Ceres', url:'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1', note:{en:'Vesta: GM 17.2882844 km³/s², mean diameter 522.77 km, density 3.460 g/cm³ (Park et al. 2025). Ceres: GM 62.6284 km³/s², diameter 939.4 km, density 2.162 g/cm³ (Park et al. 2016). Look up Vesta with sstr=4.', ru:'Веста: GM 17,2882844 км³/с², средний диаметр 522,77 км, плотность 3,460 г/см³ (Park et al. 2025). Церера: GM 62,6284 км³/с², диаметр 939,4 км, плотность 2,162 г/см³ (Park et al. 2016). Весту можно найти по sstr=4.'}},
  {title:'C. T. Russell et al. (2012), “Dawn at Vesta: Testing the Protoplanetary Paradigm”, Science 336, 684–686', url:'https://doi.org/10.1126/science.1219381', note:{en:'Vesta is a differentiated protoplanet and the parent body of the HED meteorites; core radius 107–113 km.', ru:'Веста — дифференцированная протопланета и родительское тело метеоритов HED; радиус ядра 107–113 км.'}},
  {title:'P. Schenk et al. (2012), “The Geologically Recent Giant Impact Basins at Vesta’s South Pole”, Science 336, 694–697', url:'https://doi.org/10.1126/science.1223272', note:{en:'Rheasilvia 500 km wide and 19 km deep, overlapping the 400 km Veneneia; both roughly 1–2 billion years old; source of the Vestoids and HED meteorites.', ru:'Реасильвия шириной 500 км и глубиной 19 км перекрывает 400-километровую Вененею; обоим примерно 1–2 млрд лет; источник вестоидов и метеоритов HED.'}},
  {title:'R. S. Park et al. (2016), “A partially differentiated interior for (1) Ceres deduced from its gravity field and shape”, Nature 537, 515–517', url:'https://doi.org/10.1038/nature18955', note:{en:'Ceres in hydrostatic equilibrium; rocky core of 2,460–2,900 kg/m³ under a volatile-rich shell 70–190 km thick.', ru:'Церера в гидростатическом равновесии; каменное ядро плотностью 2460–2900 кг/м³ под оболочкой, богатой летучими веществами, толщиной 70–190 км.'}},
  {title:'M. C. De Sanctis et al. (2016), “Bright carbonate deposits as evidence of aqueous alteration on (1) Ceres”, Nature 536, 54–57', url:'https://doi.org/10.1038/nature18290', note:{en:'Occator’s bright areas are rich in sodium carbonate, the most concentrated known extraterrestrial carbonate on kilometre scales; residue of crystallised brines.', ru:'Яркие области Оккатора богаты карбонатом натрия — самое концентрированное известное внеземное скопление карбонатов километрового масштаба; остаток кристаллизации рассолов.'}},
  {title:'C. A. Raymond et al. (2020), “Impact-driven mobilization of deep crustal brines on dwarf planet Ceres”, Nature Astronomy 4, 741–747', url:'https://doi.org/10.1038/s41550-020-1168-2', note:{en:'Gravity and geology of Occator point to a deep brine reservoir feeding the bright deposits.', ru:'Гравиметрия и геология Оккатора указывают на глубокий резервуар рассола, питающий яркие отложения.'}},
  {title:'NASA JPL (10 August 2020), “Mystery Solved: Bright Areas on Ceres Come From Salty Water Below”', url:'https://www.jpl.nasa.gov/news/mystery-solved-bright-areas-on-ceres-come-from-salty-water-below/', note:{en:'Occator 92 km wide, about 20 million years old; brine reservoir about 40 km deep and hundreds of km wide; some deposits under 2 million years old; Dawn below 35 km at the end.', ru:'Оккатор шириной 92 км, возрастом около 20 млн лет; резервуар рассола на глубине около 40 км и шириной в сотни километров; некоторым отложениям меньше 2 млн лет; в конце Dawn опускался ниже 35 км.'}},
  {title:'NASA JPL (1 November 2018), “NASA’s Dawn Mission to Asteroid Belt Comes to End”', url:'https://www.jpl.nasa.gov/news/nasas-dawn-mission-to-asteroid-belt-comes-to-end/', note:{en:'Missed contacts on 31 October and 1 November 2018, out of hydrazine; orbit to last at least 20 years, with more than 99 % confidence at least 50; planetary protection; about 6.9 billion km travelled.', ru:'Пропущенные сеансы 31 октября и 1 ноября 2018, гидразин исчерпан; орбита продержится не меньше 20 лет, с уверенностью больше 99 % — не меньше 50; планетарная защита; пройдено около 6,9 млрд км.'}},
  {title:'NASA NSSDCA, Moon Fact Sheet', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'GM 0.00490 × 10⁶ km³/s², mean radius 1,737.4 km, density 3,344 kg/m³, surface gravity 1.62 m/s², escape speed 2.38 km/s.', ru:'GM 0,00490 × 10⁶ км³/с², средний радиус 1737,4 км, плотность 3344 кг/м³, ускорение свободного падения 1,62 м/с², скорость убегания 2,38 км/с.'}},
  {title:'NASA Science, Dawn mission page', url:'https://science.nasa.gov/mission/dawn/', note:{en:'“NASA’s first truly interplanetary spaceship”, with extended stays at two very different extraterrestrial bodies.', ru:'«Первый по-настоящему межпланетный корабль NASA», надолго задержавшийся у двух очень разных внеземных тел.'}},
  {title:'NASA JPL (6 March 2015), “NASA Spacecraft Becomes First to Orbit a Dwarf Planet”', url:'https://www.jpl.nasa.gov/news/nasa-spacecraft-becomes-first-to-orbit-a-dwarf-planet/', note:{en:'Captured by Ceres at about 4:39 a.m. PST on Friday 6 March 2015 (12:39 UTC); the first mission to orbit two extraterrestrial targets.', ru:'Захват Церерой около 4:39 по тихоокеанскому времени в пятницу 6 марта 2015 года (12:39 UTC); первая миссия, вышедшая на орбиты двух внеземных целей.'}},
  {title:'M. D. Rayman (2008), “Dawn Journal: Cruising Past Mars’ Orbit”, The Planetary Society', url:'https://www.planetary.org/articles/1529', note:{en:'“The spacecraft is outfitted with three ion thrusters but will never use more than one at a time.”', ru:'«Аппарат оснащён тремя ионными двигателями, но никогда не использует больше одного одновременно».'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  Array.prototype.forEach.call(document.querySelectorAll('[data-aria-en]'), function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderXe();
  renderThrust();
  renderOrbit();
  renderCmp();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__belt = {propNeeded:propNeeded, deliverNeeded:deliverNeeded, airtime:airtime, impliedIsp:impliedIsp, push:push, body:body, orbit:orbit, spiralDv:spiralDv, jump:jump, ORBITS:ORBITS, BODIES:BODIES, MILESTONES:MILESTONES,
  M_LAUNCH:M_LAUNCH, M_DRY:M_DRY, M_XE:M_XE, M_N2H4:M_N2H4, M_NOXE:M_NOXE, DV_END:DV_END, ISP_CHEM:ISP_CHEM, ISP_ION:ISP_ION, F_MAX:F_MAX, SHEET_G:SHEET_G};
