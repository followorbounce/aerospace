/* ============ CONSTANTS ============ */
var KB = 1.380649e-23, AMU = 1.66053907e-27, EV = 1.602176634e-19, YEAR = 3.15576e7, SQPI = Math.sqrt(Math.PI);
/* NSSDC fact sheets [1][2]: GM (m³/s²), volumetric mean radius (m), mean surface gravity, surface pressure (Pa),
   mean temperature (K), mean molecular weight; exobase altitudes from [8] (Mars, 200 km) and [6] (Earth, ~500 km) */
var PLANETS = {
  mars:  {GM:4.2828e13, R:3389.5e3, Req:3396.2e3, g:3.73, p0:636, T0:214, mu:43.49, zExo:200e3, en:'Mars', ru:'Марс'},
  earth: {GM:3.98600e14, R:6371.0e3, Req:6378.1e3, g:9.82, p0:101400, T0:288, mu:28.97, zExo:500e3, en:'Earth', ru:'Земля'}
};
/* atomic masses, u */
var SPECIES = {
  H:{m:1.00794, en:'H', ru:'H'}, D:{m:2.01410, en:'D', ru:'D'}, He:{m:4.002602, en:'He', ru:'He'}, O:{m:15.999, en:'O', ru:'O'}
};
var AR36 = 35.967545, AR38 = 37.962732, AR40 = 39.962383;

/* ============ FORMATTING ============ */
var SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sup(n){ return String(n).split('').map(function(c){ return SUP[c] || c; }).join(''); }
function sci(x, d){
  if(!isFinite(x)) return '—';
  if(x === 0) return '0';
  var e = Math.floor(Math.log10(Math.abs(x))), m = x/Math.pow(10, e);
  if(+Math.abs(m).toFixed(d) >= 10){ m /= 10; e++; }
  if(e >= -2 && e <= 3) return fmt(x, Math.max(0, d - e));
  return fmt(m, d) + ' × 10' + sup(e);
}
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }
function pct(x, d){ return fmt(100*x, d) + ' %'; }

/* ============ PHYSICS ============ */
function gAt(P, z){ return P.GM/Math.pow(P.R + z, 2); }
function vEsc(P, z){ return Math.sqrt(2*P.GM/(P.R + z)); }                 // m/s
function scaleHeight(T, mAmu, g){ return KB*T/(mAmu*AMU*g); }               // m
function atmMass(P){ return P.p0*4*Math.PI*P.R*P.R/P.g; }                  // kg
function massToMbar(P, M){ return M*P.g/(4*Math.PI*P.R*P.R)/100; }          // as a layer of today's air
function v0(T, mAmu){ return Math.sqrt(2*KB*T/(mAmu*AMU)); }                // most probable speed
function vMean(T, mAmu){ return Math.sqrt(8*KB*T/(Math.PI*mAmu*AMU)); }
/* Jeans escape parameter at the exobase: gravitational energy over kT = (v_esc/v0)² = r/H */
function jeansLambda(P, T, mAmu){ return P.GM*mAmu*AMU/(KB*T*(P.R + P.zExo)); }
/* Jeans effusion velocity Φ/n (m/s) [7] */
function jeansVel(P, T, mAmu){ var l = jeansLambda(P, T, mAmu); return v0(T, mAmu)/(2*SQPI)*(1 + l)*Math.exp(-l); }
function jeansFlux(P, T, mAmu, nCm3){ return nCm3*1e6*jeansVel(P, T, mAmu); }   // m⁻² s⁻¹
function jeansRate(P, T, mAmu, nCm3){ var r = P.R + P.zExo; return jeansFlux(P, T, mAmu, nCm3)*4*Math.PI*r*r; }  // s⁻¹
/* complementary error function (Numerical Recipes erfcc, |error| < 1.2e-7 relative) */
function erfc(x){
  var z = Math.abs(x), t = 1/(1 + 0.5*z);
  var r = t*Math.exp(-z*z - 1.26551223 + t*(1.00002368 + t*(0.37409196 + t*(0.09678418 + t*(-0.18628806 + t*(0.27886807 + t*(-1.13520398 + t*(1.48851587 + t*(-0.82215223 + t*0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
/* fraction of a Maxwellian gas moving faster than v_esc (any direction) */
function tailFraction(l){ return erfc(Math.sqrt(l)) + 2*Math.sqrt(l/Math.PI)*Math.exp(-l); }
/* D escapes this many times less efficiently per atom than H, by Jeans escape alone */
function jeansX(P, T){ return jeansVel(P, T, SPECIES.D.m)/jeansVel(P, T, SPECIES.H.m); }
function escEnergyEV(P, z, mAmu){ return P.GM*mAmu*AMU/(P.R + z)/EV; }

/* ============ HOT OXYGEN ============ */
/* O₂⁺ + e → O + O, excess energy (eV) and branching (%) [10]; equal masses share the energy equally */
var DR = [{e:6.99, b:20.4, en:'O(³P) + O(³P)', ru:'O(³P) + O(³P)'}, {e:5.02, b:44.0, en:'O(³P) + O(¹D)', ru:'O(³P) + O(¹D)'}, {e:3.05, b:31.5, en:'O(¹D) + O(¹D)', ru:'O(¹D) + O(¹D)'}];
function hotShare(Eesc){ return DR.reduce(function(s, c){ return s + (c.e/2 > Eesc ? c.b : 0); }, 0)/100; }
/* a Mars-density world (3,934 kg/m³ [1]) of radius R: escape energy of O at 200 km */
var RHO_MARS = 3934;
function worldEsc(Rkm){ var R = Rkm*1e3, GM = PLANETS.mars.GM*Math.pow(R/PLANETS.mars.R, 3); return GM*SPECIES.O.m*AMU/(R + 200e3)/EV; }
function radiusFor(Eev){ var a = 500, b = 20000; for(var k = 0; k < 80; k++){ var c = (a + b)/2; if(worldEsc(c) < Eev) a = c; else b = c; } return (a + b)/2; }

/* ============ MAVEN ORBIT ============ */
function apoForPeriod(P, Th, periKm){ var a = Math.cbrt(P.GM*Math.pow(Th*3600/(2*Math.PI), 2)); return (2*a - 2*P.Req)/1e3 - periKm; }

/* ============ STORMS ============ */
var Q_QUIET = 1.5e24, M_ION = 32;            // model ion escape before the 8 March 2015 ICME, dominated by O₂⁺ [26]
function stormExtra(boost, hours){ var ions = Q_QUIET*(boost - 1)*hours*3600; return {ions:ions, kg:ions*M_ION*AMU, days:(boost - 1)*hours/24}; }
function stormYearShare(boost, hours, perYear){ var quiet = Q_QUIET*YEAR, extra = Q_QUIET*(boost - 1)*hours*3600*perYear; return extra/(quiet + extra); }

/* ============ ISOTOPES ============ */
/* Rayleigh distillation: the heavy isotope escapes x times as readily as the light one. R/R₀ = f^(x−1), f = light fraction left */
function rayEnrich(f, x){ return Math.pow(f, x - 1); }
function rayLeft(E, x){ return Math.pow(E, 1/(x - 1)); }
/* diffusive separation above the homopause: Δz in units of the ⁴⁰Ar scale height */
function argonX(dzH40){ return Math.exp(-(AR38 - AR36)/AR40*dzH40); }
var AR_SUN = 5.5, AR_MARS = 4.2;            // ³⁶Ar/³⁸Ar: solar [27], Curiosity SAM [27]
var AR_E = AR_SUN/AR_MARS;                  // enrichment of ³⁸Ar relative to ³⁶Ar
function dzForLoss(lost){ var x = 1 + Math.log(AR_E)/Math.log(1 - lost); return -Math.log(x)*AR40/(AR38 - AR36); }

/* ============ HISTORY ============ */
var SUN_AGE = 4.6;                           // Gyr [21]
/* Ribas et al. [31]: 1–1200 Å flux ≈ 6× today 3.5 Gyr ago and ≈ 2.5× 2.5 Gyr ago. Fit F ∝ τ^−β to the first point. */
var BETA = Math.log(6)/Math.log(SUN_AGE/(SUN_AGE - 3.5));
function euvRatio(gyrAgo){ return Math.pow(SUN_AGE/(SUN_AGE - gyrAgo), BETA); }
/* ∫ (F/F_now)^s dt from `start` Gyr ago to now, in Gyr */
function weightedGyr(start, s){
  var k = BETA*s, t1 = SUN_AGE - start, t2 = SUN_AGE;
  if(Math.abs(k - 1) < 1e-9) return SUN_AGE*Math.log(t2/t1);
  return Math.pow(SUN_AGE, k)*(Math.pow(t2, 1 - k) - Math.pow(t1, 1 - k))/(1 - k);
}
function massLost(rateKgS, start, s){ return rateKgS*weightedGyr(start, s)*1e9*YEAR; }
function lostUntil(rateKgS, start, s, gyrAgo){ return massLost(rateKgS, start, s) - massLost(rateKgS, gyrAgo, s); }

/* ============ CH1 ============ */
var M_MARS_AIR = atmMass(PLANETS.mars), M_EARTH_AIR = atmMass(PLANETS.earth);

/* ============ CH2 — JEANS ============ */
var jsP = 'mars', jsS = 'H';
var jsT = document.getElementById('jsT'), jsN = document.getElementById('jsN');
function renderJS(){
  var P = PLANETS[jsP], S = SPECIES[jsS], Tk = +jsT.value, n = Math.pow(10, +jsN.value);
  var l = jeansLambda(P, Tk, S.m), ve = vEsc(P, P.zExo), vo = v0(Tk, S.m), H = scaleHeight(Tk, S.m, gAt(P, P.zExo));
  var rate = jeansRate(P, Tk, S.m, n), fl = jeansFlux(P, Tk, S.m, n)/1e4;
  document.getElementById('jsTVal').textContent = num(Tk) + ' K'; jsT.setAttribute('aria-valuetext', num(Tk) + T(' kelvin, Jeans parameter ',' кельвинов, параметр Джинса ') + fmt(l, 1));
  document.getElementById('jsNVal').innerHTML = sci(n, 1) + T(' cm⁻³',' см⁻³'); jsN.setAttribute('aria-valuetext', sci(n, 1) + T(' per cubic centimetre',' в кубическом сантиметре'));
  var svg = document.getElementById('jsSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 465, Tp = 22, B = 250, xa = 100, xb = 2000, ya = -40, yb = 6;
  function X(t){ return L + (t - xa)/(xb - xa)*(R - L); } function Y(v){ return B - (Math.max(ya, Math.min(yb, v)) - ya)/(yb - ya)*(B - Tp); }
  [-40, -30, -20, -10, 0, 5].forEach(function(e){ ns('line', {x1:L, y1:Y(e), x2:R, y2:Y(e), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(e) + 4, '10' + sup(e), 'svg-small', 'end'); });
  [100, 500, 1000, 1500, 2000].forEach(function(t){ ns('line', {x1:X(t), y1:B, x2:X(t), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(t), B + 16, num(t), 'svg-small', t === 2000 ? 'end' : 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 13, T('escape speed of the gas, Φ/n, cm/s (log)','скорость ухода газа Φ/n, см/с (лог.)'), 'svg-small');
  txt(svg, R, B + 32, T('exobase temperature, K','температура экзобазы, К'), 'svg-small', 'end');
  ['earth', 'mars'].forEach(function(pk){
    var PP = PLANETS[pk], d = '';
    for(var k = 0; k <= 190; k++){ var t = xa + (xb - xa)*k/190; d += (k ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(Math.log10(jeansVel(PP, t, S.m)*100)).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:pk === 'mars' ? '#b5452a' : '#2f5aa1', 'stroke-width':pk === jsP ? 2.4 : 1.4, 'stroke-dasharray':pk === jsP ? '' : '5 4'}, svg);
    var yEnd = Y(Math.log10(jeansVel(PP, xb, S.m)*100));
    txt(svg, R - 4, yEnd + (pk === 'mars' ? -7 : 14), T(PP.en, PP.ru), 'svg-small svg-halo', 'end');
  });
  var yv = Math.log10(jeansVel(P, Tk, S.m)*100);
  ns('circle', {cx:X(Tk), cy:Y(yv), r:6, fill:'none', stroke:'#0b0b0c', 'stroke-width':2.2}, svg);
  txt(svg, R - 6, B - 10, T('gas: ','газ: ') + S.en, 'svg-small svg-halo', 'end');   // lower right: the curves run along the top
  cells(document.getElementById('jsReadout'), [
    [T('SCALE HEIGHT AT THE EXOBASE','ВЫСОТА ОДНОРОДНОЙ АТМОСФЕРЫ У ЭКЗОБАЗЫ'), fmt(H/1e3, H < 1e5 ? 1 : 0) + T(' km',' км')],
    [T('ESCAPE SPEED AT THE EXOBASE','СКОРОСТЬ УБЕГАНИЯ У ЭКЗОБАЗЫ'), fmt(ve/1e3, 2) + T(' km/s',' км/с')],
    [T('MOST PROBABLE THERMAL SPEED','НАИВЕРОЯТНЕЙШАЯ ТЕПЛОВАЯ СКОРОСТЬ'), fmt(vo/1e3, 2) + T(' km/s',' км/с')],
    [T('JEANS PARAMETER λ = r/H','ПАРАМЕТР ДЖИНСА λ = r/H'), fmt(l, 1)],
    [T('ATOMS FASTER THAN ESCAPE SPEED','АТОМОВ БЫСТРЕЕ СКОРОСТИ УБЕГАНИЯ'), sci(tailFraction(l), 1)],
    [T('ESCAPE FLUX','ПОТОК УХОДА'), sci(fl, 1) + T(' cm⁻² s⁻¹',' см⁻² с⁻¹')],
    [T('WHOLE PLANET','СО ВСЕЙ ПЛАНЕТЫ'), sci(rate, 1) + T(' atoms/s',' атомов/с') + ' · ' + sci(rate*S.m*AMU, 1) + T(' kg/s',' кг/с'), 1]
  ]);
  hud1.textContent = fmt(l, 1); hud2.textContent = sci(rate, 1) + T(' /s',' /с');
  document.getElementById('jsStatus').innerHTML = l < 1.5
    ? T('λ is below about 1.5: the gas is no longer bound at the top — it would stream away as a planetary wind, which the Jeans formula does not describe.','λ меньше примерно 1,5: газ у верхней границы уже не удерживается и уходил бы сплошным «планетным ветром», который формула Джинса не описывает.')
    : l < 30 ? T('Light gas, weak grip: the tail of the speed distribution is thick enough that a steady trickle leaves. This is how hydrogen leaves Mars — and Earth — today.','Лёгкий газ, слабое притяжение: «хвост» распределения скоростей достаточно толст, и газ уходит непрерывной струйкой. Так сегодня водород покидает Марс — и Землю.')
    : T('Effectively bound: fewer than one atom in 10¹¹ is fast enough, and the flux is negligible over the age of the Solar System. Heavier gases need a non-thermal kick (chapter 3).','Практически удерживается: быстрых атомов меньше одного на 10¹¹, и за время существования Солнечной системы поток ничтожен. Тяжёлым газам нужен нетепловой «толчок» (глава 3).');
}
jsT.addEventListener('input', function(){ pressGroup(document.getElementById('jsPre'), null); renderJS(); });
jsN.addEventListener('input', renderJS);
Array.prototype.forEach.call(document.querySelectorAll('#jsPre .btn'), function(btn){ btn.addEventListener('click', function(){
  jsP = this.getAttribute('data-p'); jsS = this.getAttribute('data-s'); jsT.value = this.getAttribute('data-t');
  pressGroup(this.parentNode, this); pressGroup(document.getElementById('jsGas'), document.querySelector('#jsGas .btn[data-s="' + jsS + '"]')); renderJS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#jsGas .btn'), function(btn){ btn.addEventListener('click', function(){
  jsS = this.getAttribute('data-s'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('jsPre'), null); renderJS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#jsPlanet .btn'), function(btn){ btn.addEventListener('click', function(){
  jsP = this.getAttribute('data-p'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('jsPre'), null); renderJS(); }); });

/* ============ CH3 — HOT OXYGEN ============ */
var hoR = document.getElementById('hoR');
function renderHO(){
  var Rkm = +hoR.value, Ee = worldEsc(Rkm), sh = hotShare(Ee);
  document.getElementById('hoRVal').textContent = num(Math.round(Rkm)) + T(' km',' км');
  hoR.setAttribute('aria-valuetext', num(Math.round(Rkm)) + T(' km radius, oxygen escape energy ',' км, энергия убегания кислорода ') + fmt(Ee, 2) + T(' eV',' эВ'));
  var svg = document.getElementById('hoSvg'); svg.innerHTML = ''; aria(svg);
  var L = 150, R = 465, Tp = 26, rowH = 46, xb = 10;
  function X(e){ return L + Math.min(e, xb)/xb*(R - L); }
  [0, 2, 4, 6, 8, 10].forEach(function(e){ ns('line', {x1:X(e), y1:Tp - 6, x2:X(e), y2:Tp + rowH*3 + 4, stroke:'#e4e4de'}, svg); txt(svg, X(e), Tp + rowH*3 + 20, fmt(e, 0), 'svg-small', 'middle'); });
  txt(svg, R, Tp + rowH*3 + 36, T('energy per oxygen atom, eV','энергия на атом кислорода, эВ'), 'svg-small', 'end');
  DR.forEach(function(c, j){
    var y = Tp + j*rowH, esc = c.e/2 > Ee;
    ns('rect', {x:L, y:y, width:X(c.e/2) - L, height:22, fill:esc ? '#b5452a' : '#9aa3aa'}, svg);
    txt(svg, L - 8, y + 11, c.en, 'svg-small', 'end');
    txt(svg, L - 8, y + 24, fmt(c.b, 1) + T(' % of recombinations',' % рекомбинаций'), 'svg-tiny', 'end');
    txt(svg, X(c.e/2) + 6, y + 15, fmt(c.e/2, 2) + T(' eV',' эВ') + (esc ? T(' · escapes upward',' · уходит, если летит вверх') : T(' · bound',' · удерживается')), 'svg-small svg-halo');
  });
  var xe = X(Ee);
  ns('line', {x1:xe, y1:Tp - 10, x2:xe, y2:Tp + rowH*3 + 4, stroke:'#0b0b0c', 'stroke-width':2, 'stroke-dasharray':'5 3'}, svg);
  txt(svg, Math.min(xe, R - 2), 14, (Ee > xb ? '→ ' : '') + T('escape energy ','энергия убегания ') + fmt(Ee, 2) + T(' eV',' эВ'), 'svg-small svg-halo', xe > R - 120 ? 'end' : 'middle');
  cells(document.getElementById('hoReadout'), [
    [T('WORLD RADIUS','РАДИУС ПЛАНЕТЫ'), num(Math.round(Rkm)) + T(' km',' км') + ' (' + fmt(Rkm/3389.5, 2) + T(' × Mars',' × Марс') + ')'],
    [T('O ESCAPE ENERGY AT 200 KM','ЭНЕРГИЯ УБЕГАНИЯ O НА 200 КМ'), fmt(Ee, 2) + T(' eV',' эВ')],
    [T('RECOMBINATIONS GIVING ESCAPERS','РЕКОМБИНАЦИИ, ДАЮЩИЕ БЕГЛЕЦОВ'), pct(sh, 1)],
    [T('HOT O STOPS ESCAPING ABOVE','ГОРЯЧИЙ O ПЕРЕСТАЁТ УХОДИТЬ ПРИ R >'), num(Math.round(radiusFor(3.495)/10)*10) + T(' km',' км')]
  ]);
  hud1.textContent = fmt(Ee, 2) + T(' eV',' эВ'); hud2.textContent = pct(sh, 0);
  document.getElementById('hoStatus').innerHTML = sh > 0.6
    ? T('Two of the three channels throw oxygen out: this is Mars today, and the largest single loss process MAVEN measured.','Два из трёх каналов выбрасывают кислород: это сегодняшний Марс и самый крупный канал потерь, измеренный MAVEN.')
    : sh > 0 ? T('Only the most energetic channel still escapes: a world this size keeps most of its hot oxygen.','Уходит только самый энергичный канал: планета такого размера удерживает большую часть горячего кислорода.')
    : T('No channel is fast enough. Earth\'s oxygen (9.6 eV to escape from its 500 km exobase) is safe from this process.','Ни один канал не даёт нужной скорости. Кислороду Земли (9,6 эВ, чтобы уйти с экзобазы на 500 км) этот процесс не грозит.');
}
hoR.addEventListener('input', function(){ pressGroup(document.getElementById('hoPre'), null); renderHO(); });
Array.prototype.forEach.call(document.querySelectorAll('#hoPre .btn'), function(btn){ btn.addEventListener('click', function(){ hoR.value = this.getAttribute('data-r'); pressGroup(this.parentNode, this); renderHO(); }); });

/* ============ CH5 — STORMS ============ */
var stB = document.getElementById('stB'), stH = document.getElementById('stH'), stY = document.getElementById('stY');
function renderST(){
  var b = +stB.value, h = +stH.value, yr = +stY.value, x = stormExtra(b, h), share = stormYearShare(b, h, yr);
  document.getElementById('stBVal').textContent = '× ' + fmt(b, 1); stB.setAttribute('aria-valuetext', T('escape ',' уход в ') + fmt(b, 1) + T(' times the quiet rate',' раза выше спокойного'));
  document.getElementById('stHVal').textContent = num(h) + T(' h',' ч'); stH.setAttribute('aria-valuetext', num(h) + T(' hours',' ч'));
  document.getElementById('stYVal').textContent = num(yr); stY.setAttribute('aria-valuetext', num(yr) + T(' storms a year',' бурь в год'));
  var svg = document.getElementById('stSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 465, Tp = 24, B = 180, days = 4, ymax = 32;
  function X(hh){ return L + hh/(days*24)*(R - L); } function Y(v){ return B - Math.min(v, ymax)/ymax*(B - Tp); }
  [1, 10, 20, 30].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, '×' + v, 'svg-small', 'end'); });
  for(var d = 0; d <= days; d++){ ns('line', {x1:X(d*24), y1:B, x2:X(d*24), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(d*24), B + 16, T('day ','сут. ') + d, 'svg-small', 'middle'); }
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  var t0 = 24, t1 = Math.min(days*24, t0 + h);
  ns('rect', {x:X(t0), y:Y(b), width:X(t1) - X(t0), height:Y(1) - Y(b), fill:'#b5452a', opacity:0.25}, svg);
  ns('path', {d:'M' + X(0) + ',' + Y(1) + 'L' + X(t0) + ',' + Y(1) + 'L' + X(t0) + ',' + Y(b) + 'L' + X(t1) + ',' + Y(b) + 'L' + X(t1) + ',' + Y(1) + 'L' + X(days*24) + ',' + Y(1), fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, L, 13, T('ion escape rate, × quiet (model)','скорость ухода ионов, × спокойная (модель)'), 'svg-small');
  if(h > days*24 - t0) txt(svg, R, Y(b) - 5, T('storm continues →','буря продолжается →'), 'svg-tiny svg-halo', 'end');
  cells(document.getElementById('stReadout'), [
    [T('QUIET ION ESCAPE (MODEL)','СПОКОЙНЫЙ УХОД ИОНОВ (МОДЕЛЬ)'), sci(Q_QUIET, 1) + T(' ions/s ≈ ',' ионов/с ≈ ') + fmt(Q_QUIET*M_ION*AMU*1000, 0) + T(' g/s',' г/с')],
    [T('EXTRA IONS LOST IN THE STORM','ДОПОЛНИТЕЛЬНО ПОТЕРЯНО ИОНОВ'), sci(x.ions, 1)],
    [T('EXTRA MASS (AS O₂⁺)','ДОПОЛНИТЕЛЬНАЯ МАССА (КАК O₂⁺)'), fmt(x.kg/1000, x.kg < 1e4 ? 1 : 0) + T(' t',' т')],
    [T('= QUIET DAYS OF LOSS','= СУТОК СПОКОЙНОГО УХОДА'), fmt(x.days, 1)],
    [T('STORMS\' SHARE OF A YEAR\'S ION LOSS','ДОЛЯ БУРЬ В ГОДОВОМ УХОДЕ ИОНОВ'), pct(share, 0), 1]
  ]);
  hud1.textContent = '× ' + fmt(b, 1); hud2.textContent = fmt(x.kg/1000, 0) + T(' t',' т');
  document.getElementById('stStatus').innerHTML = b <= 1
    ? T('No storm: the ion leak runs at its quiet rate, a few tens of grams a second.','Бури нет: ионы утекают со спокойной скоростью — несколько десятков граммов в секунду.')
    : T('One storm of ','Одна буря длительностью ') + num(h) + T(' hours at ×',' ч при ×') + fmt(b, 1) + T(' removes as many ions as ',' уносит столько же ионов, сколько уходит за ') + fmt(x.days, 1) + T(' quiet days. With ',' спокойных суток. При ') + num(yr) + T(' such storms a year, storms carry ',' таких бурях в год на них приходится ') + pct(share, 0) + T(' of the ion loss — the young Sun stormed far more often.',' ухода ионов, — а молодое Солнце бушевало гораздо чаще.');
}
[stB, stH, stY].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('stPre'), null); renderST(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#stPre .btn'), function(btn){ btn.addEventListener('click', function(){ stB.value = this.getAttribute('data-b'); stH.value = this.getAttribute('data-h'); pressGroup(this.parentNode, this); renderST(); }); });

/* ============ CH6 — ISOTOPES ============ */
var isMode = 'ar', isE = 8;
var isZ = document.getElementById('isZ'), isX = document.getElementById('isX');
function isState(){
  if(isMode === 'ar'){ var x = argonX(+isZ.value); return {x:x, E:AR_E, left:rayLeft(AR_E, x)}; }
  var xx = +isX.value; return {x:xx, E:isE, left:rayLeft(isE, xx)};
}
function renderIS(){
  var s = isState();
  document.getElementById('isArCtl').hidden = isMode !== 'ar'; document.getElementById('isDhCtl').hidden = isMode === 'ar';
  document.getElementById('isZVal').textContent = fmt(+isZ.value, 2) + ' H₄₀'; isZ.setAttribute('aria-valuetext', fmt(+isZ.value, 2) + T(' argon scale heights',' высот однородной атмосферы аргона'));
  document.getElementById('isXVal').textContent = fmt(+isX.value, 3); isX.setAttribute('aria-valuetext', fmt(+isX.value, 3));
  var svg = document.getElementById('isSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 465, Tp = 22, B = 230, ymax = isMode === 'ar' ? 2 : 12;
  function X(lost){ return L + lost*(R - L); } function Y(e){ return B - (Math.min(e, ymax) - 1)/(ymax - 1)*(B - Tp); }
  (isMode === 'ar' ? [1, 1.25, 1.5, 1.75, 2] : [1, 2, 4, 6, 8, 10, 12]).forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, '×' + fmt(v, v % 1 ? 2 : 0), 'svg-small', 'end'); });
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, fmt(100*v, 0) + ' %', 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 13, isMode === 'ar' ? T('³⁸Ar/³⁶Ar relative to the start','³⁸Ar/³⁶Ar относительно начального') : T('D/H relative to the start','D/H относительно начального'), 'svg-small');
  txt(svg, R, B + 32, T('fraction of the light isotope lost to space','доля лёгкого изотопа, ушедшая в космос'), 'svg-small', 'end');
  var d = '';
  for(var k = 0; k <= 200; k++){ var lost = Math.min(0.995, k/200); d += (k ? 'L' : 'M') + X(lost).toFixed(1) + ',' + Y(rayEnrich(1 - lost, s.x)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  ns('line', {x1:L, y1:Y(s.E), x2:R, y2:Y(s.E), stroke:'#b5452a', 'stroke-dasharray':'5 4', 'stroke-width':1.3}, svg);
  txt(svg, L + 4, Y(s.E) - 6, isMode === 'ar' ? T('measured: 5.5 → 4.2 (×1.31)','измерено: 5,5 → 4,2 (×1,31)') : T('measured: ×','измерено: ×') + fmt(s.E, 0), 'svg-small svg-halo');
  ns('circle', {cx:X(1 - s.left), cy:Y(s.E), r:6, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.4}, svg);
  cells(document.getElementById('isReadout'), [
    [T('HEAVY/LIGHT ESCAPE EFFICIENCY x','ОТНОСИТЕЛЬНАЯ ЛЁГКОСТЬ УХОДА x'), fmt(s.x, 3)],
    [T('ENRICHMENT TO EXPLAIN','ОБЪЯСНЯЕМОЕ ОБОГАЩЕНИЕ'), '×' + fmt(s.E, 2)],
    [T('LEFT TODAY','ОСТАЛОСЬ СЕГОДНЯ'), pct(s.left, 1)],
    [T('LOST TO SPACE','УШЛО В КОСМОС'), pct(1 - s.left, 1)]
  ]);
  hud1.textContent = '×' + fmt(s.E, 2); hud2.textContent = pct(1 - s.left, 0);
  document.getElementById('isStatus').innerHTML = isMode === 'ar'
    ? T('With the heavy isotope thinned out by ','Если тяжёлый изотоп разрежен на ') + pct(1 - s.x, 0) + T(' at the exobase, the measured shift needs ',' у экзобазы, измеренный сдвиг требует потери ') + pct(1 - s.left, 0) + T(' of the argon gone. Pure Rayleigh model: no volcanic resupply, no impacts.',' аргона. Чистая модель Рэлея: без вулканического пополнения и ударов.')
    : T('Even if deuterium never escaped at all (x = 0), a ×','Даже если дейтерий не уходил вовсе (x = 0), обогащение ×') + fmt(s.E, 0) + T(' enrichment means at least ',' означает, что ушло как минимум ') + pct(1 - 1/s.E, 1) + T(' of the hydrogen is gone; letting D escape too raises it to ',' водорода; если уходит и D, получается ') + pct(1 - s.left, 1) + '.';
}
isZ.addEventListener('input', function(){ pressGroup(document.getElementById('isPre'), null); renderIS(); });
isX.addEventListener('input', function(){ pressGroup(document.getElementById('isPre'), null); renderIS(); });
Array.prototype.forEach.call(document.querySelectorAll('#isMode .btn'), function(btn){ btn.addEventListener('click', function(){ isMode = this.getAttribute('data-m'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('isPre'), null); renderIS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#isPre .btn'), function(btn){ btn.addEventListener('click', function(){
  var m = this.getAttribute('data-m'); isMode = m; pressGroup(document.getElementById('isMode'), document.querySelector('#isMode .btn[data-m="' + m + '"]'));
  if(m === 'ar') isZ.value = this.getAttribute('data-z');
  else { isE = +this.getAttribute('data-e'); isX.value = this.getAttribute('data-x') === 'jeans' ? jeansX(PLANETS.mars, 240) : this.getAttribute('data-x'); }
  pressGroup(this.parentNode, this); renderIS(); }); });

/* ============ CH7 — FOUR BILLION YEARS ============ */
var hsR = document.getElementById('hsR'), hsS = document.getElementById('hsS'), hsT = document.getElementById('hsT');
function renderHS(){
  var P = PLANETS.mars, r = +hsR.value, s = +hsS.value, st = +hsT.value, M = massLost(r, st, s), mb = massToMbar(P, M);
  document.getElementById('hsRVal').textContent = fmt(r, 1) + T(' kg/s',' кг/с'); hsR.setAttribute('aria-valuetext', fmt(r, 1) + T(' kilograms a second today',' кг в секунду сегодня'));
  document.getElementById('hsSVal').textContent = fmt(s, 2); hsS.setAttribute('aria-valuetext', T('loss rate scales as solar EUV to the power ','потери растут как степень ') + fmt(s, 2) + T('',' потока ЭУФ'));
  document.getElementById('hsTVal').textContent = fmt(st, 1) + T(' Gyr ago',' млрд лет назад'); hsT.setAttribute('aria-valuetext', fmt(st, 1) + T(' billion years ago',' млрд лет назад'));
  var svg = document.getElementById('hsSvg'); svg.innerHTML = ''; aria(svg);
  var L = 62, R = 465, Tp = 22, B = 240, ya = -1, yb = 4;
  function X(ago){ return L + (4.2 - ago)/4.2*(R - L); } function Y(m){ return B - (Math.log10(Math.max(m, 0.1)) - ya)/(yb - ya)*(B - Tp); }
  [0.1, 1, 10, 100, 1000, 10000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, v < 1 ? fmt(v, 1) : num(v), 'svg-small', 'end'); });
  [4, 3, 2, 1, 0].forEach(function(a){ ns('line', {x1:X(a), y1:B, x2:X(a), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(a), B + 16, fmt(a, 0), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 13, T('mass lost so far, as mbar of today\'s air (log)','потеряно к этому времени, мбар нынешнего воздуха (лог.)'), 'svg-small');
  txt(svg, R, B + 32, T('billion years ago','млрд лет назад'), 'svg-small', 'end');
  [[P.p0/100, T('today\'s whole atmosphere, 6.36 mbar','вся нынешняя атмосфера, 6,36 мбар'), '#2f5aa1'], [800, T('MAVEN team estimate, ≥ 0.8 bar CO₂','оценка команды MAVEN: ≥ 0,8 бар CO₂'), '#5f5f59']].forEach(function(q){
    ns('line', {x1:L, y1:Y(q[0]), x2:R, y2:Y(q[0]), stroke:q[2], 'stroke-dasharray':'5 4', 'stroke-width':1.2}, svg); txt(svg, L + 4, Y(q[0]) - 5, q[1], 'svg-small svg-halo'); });
  var d = '';
  for(var k = 0; k <= 160; k++){ var ago = st - st*k/160; d += (k ? 'L' : 'M') + X(ago).toFixed(1) + ',' + Y(massToMbar(P, lostUntil(r, st, s, ago))).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2.2}, svg);
  cells(document.getElementById('hsReadout'), [
    [T('SOLAR EUV AT THE START','ЭУФ СОЛНЦА В НАЧАЛЕ'), '×' + fmt(euvRatio(st), 1) + T(' today',' от нынешнего')],
    [T('LOSS RATE AT THE START','СКОРОСТЬ ПОТЕРЬ В НАЧАЛЕ'), fmt(r*Math.pow(euvRatio(st), s), 1) + T(' kg/s',' кг/с')],
    [T('MASS LOST','ПОТЕРЯННАЯ МАССА'), sci(M, 2) + T(' kg',' кг')],
    [T('× TODAY\'S ATMOSPHERE','× НЫНЕШНЯЯ АТМОСФЕРА'), fmt(M/M_MARS_AIR, M/M_MARS_AIR < 10 ? 1 : 0)],
    [T('AS A LAYER OF AIR','КАК СЛОЙ ВОЗДУХА'), num(Math.round(mb)) + T(' mbar',' мбар'), 1]
  ]);
  hud1.textContent = fmt(6.36, 2) + T(' mbar',' мбар'); hud2.textContent = num(Math.round(mb)) + T(' mbar',' мбар');
  document.getElementById('hsStatus').innerHTML = (s === 0 ? T('At today\'s rate, unchanged for ','С сегодняшней скоростью, без изменений за ') + fmt(st, 1) + T(' billion years, Mars would have lost ',' млрд лет, Марс потерял бы в ') : T('With loss growing as EUV to the power ','Если потери растут как степень ') + fmt(s, 2) + T(', Mars has lost ',' потока ЭУФ, Марс потерял в ')) + fmt(M/M_MARS_AIR, 0) + T(' times the air it has now — a layer of ',' раз больше воздуха, чем у него есть, — слой в ') + num(Math.round(mb)) + T(' mbar. A model, not a measurement: one Mars year of data, stretched over four billion.',' мбар. Это модель, а не измерение: один марсианский год данных, растянутый на четыре миллиарда лет.');
}
[hsR, hsS, hsT].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('hsPre'), null); renderHS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#hsPre .btn'), function(btn){ btn.addEventListener('click', function(){ hsS.value = this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderHS(); }); });

/* ============ TIMELINE ============ */
var TIMELINE = [
  ['1969–72', 'Mariner 6, 7 and 9 record the ultraviolet glow of a hydrogen cloud around Mars: the first sign of gas leaving the planet today [9][24].', '«Маринеры-6, -7 и -9» регистрируют ультрафиолетовое свечение водородного облака вокруг Марса — первый признак того, что газ уходит с планеты и сейчас [9][24].'],
  ['1973', 'Donald Hunten\'s review “The escape of light gases from planetary atmospheres” sets out thermal and non-thermal escape as they are still taught [7].', 'Обзор Дональда Хантена «Убегание лёгких газов из планетных атмосфер» излагает тепловое и нетепловое убегание так, как его преподают до сих пор [7].'],
  ['1999', 'Mars Global Surveyor\'s magnetometer team, led by Mario Acuña, finds strongly magnetised ancient crust — the fossil of a global field Mars no longer has [12].', 'Группа магнитометра Mars Global Surveyor под руководством Марио Акуньи находит сильно намагниченную древнюю кору — окаменелость глобального поля, которого у Марса больше нет [12].'],
  ['2003', 'ESA\'s Mars Express launches on 2 June; from 2004 its ASPERA-3 instrument monitors escaping ions through a solar cycle [21][24].', '2 июня запущен Mars Express ЕКА; с 2004 года его прибор ASPERA-3 следит за уходящими ионами на протяжении солнечного цикла [21][24].'],
  ['2013', 'Curiosity\'s SAM measures ³⁶Ar/³⁸Ar = 4.2 ± 0.1 at the surface [27]. MAVEN launches on 18 November [15].', 'Прибор SAM марсохода Curiosity измеряет у поверхности ³⁶Ar/³⁸Ar = 4,2 ± 0,1 [27]. 18 ноября запущен MAVEN [15].'],
  ['2014', 'MAVEN enters Mars orbit on 22 September (UTC) [15].', '22 сентября (UTC) MAVEN выходит на орбиту Марса [15].'],
  ['2015', 'A coronal mass ejection hits Mars on 8 March [26]; in November NASA reports the solar wind stripping about 100 g of gas a second [19]. Villanueva and Mumma\'s team reads an ocean\'s worth of lost water in D/H [29].', '8 марта Марс накрывает корональный выброс массы [26]; в ноябре НАСА сообщает, что солнечный ветер уносит около 100 г газа в секунду [19]. Группа Вильянуэвы и Маммы по D/H восстанавливает потерянный океан воды [29].'],
  ['2017', 'Argon isotopes at 200 km: about two-thirds of Mars\'s argon has been lost to space [28]. On 10 September the largest solar event MAVEN would see in its first years hits [18].', 'Изотопы аргона на высоте 200 км: около двух третей аргона Марса ушло в космос [28]. 10 сентября приходит самое мощное солнечное событие за первые годы работы MAVEN [18].'],
  ['2018', 'A full Mars year of data: 2–3 kg/s lost today, as much as 0.8 bar of CO₂ over history, probably a lower limit [5]. A global dust storm lofts water and speeds hydrogen loss [20].', 'Полный марсианский год данных: сегодня теряется 2–3 кг/с, за историю — до 0,8 бар CO₂, и это, вероятно, нижний предел [5]. Глобальная пылевая буря поднимает воду вверх и ускоряет уход водорода [20].'],
  ['2020', 'The UAE\'s Hope (19 July) and China\'s Tianwen-1 (23 July) launch, both carrying instruments for the upper atmosphere or its plasma [24].', 'Стартуют «Надежда» ОАЭ (19 июля) и китайский «Тяньвэнь-1» (23 июля), оба с приборами для верхней атмосферы или её плазмы [24].'],
  ['2021', 'Shannon Curry succeeds Bruce Jakosky as MAVEN\'s principal investigator on 31 August [17]; Tianwen-1\'s magnetometer starts routine measurements on 13 November [23].', '31 августа Шеннон Карри сменяет Брюса Якоски на посту научного руководителя MAVEN [17]; 13 ноября магнитометр «Тяньвэня-1» начинает регулярные измерения [23].'],
  ['2025', '6 December: MAVEN passes behind Mars and is not heard from again [16].', '6 декабря: MAVEN заходит за Марс и больше не выходит на связь [16].'],
  ['2026', '3 June: NASA declares the mission over; the spacecraft is not recoverable [16][25].', '3 июня: НАСА объявляет миссию завершённой — аппарат восстановить нельзя [16][25].']
];

/* ============ REFERENCES ============ */
var REFERENCES = [
  {title:'NASA NSSDCA, “Mars Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html', note:{en:'Retrieved 12 November 2026: GM 42,828 km³/s², mean radius 3,389.5 km, gravity 3.73 m/s², escape velocity 5.03 km/s, density 3,934 kg/m³; surface pressure 6.36 mb (4.0–8.7 mb with season), scale height 11.0 km, mean temperature ~214 K, mean molecular weight 43.49, atmosphere ~2.5 × 10¹⁶ kg; CO₂ 95.1 %, Ar 1.94 %.', ru:'Получено 12 ноября 2026 года: GM 42 828 км³/с², средний радиус 3389,5 км, ускорение свободного падения 3,73 м/с², скорость убегания 5,03 км/с, плотность 3934 кг/м³; давление у поверхности 6,36 мбар (4,0–8,7 мбар по сезонам), высота однородной атмосферы 11,0 км, средняя температура ~214 K, средняя молярная масса 43,49, масса атмосферы ~2,5 × 10¹⁶ кг; CO₂ 95,1 %, Ar 1,94 %.'}},
  {title:'NASA NSSDCA, “Earth Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', note:{en:'Surface pressure 1,014 mb, scale height 8.5 km, mean temperature 288 K, mean molecular weight 28.97, atmosphere 5.1 × 10¹⁸ kg; escape velocity 11.19 km/s.', ru:'Давление у поверхности 1014 мбар, высота однородной атмосферы 8,5 км, средняя температура 288 K, средняя молярная масса 28,97, масса атмосферы 5,1 × 10¹⁸ кг; скорость убегания 11,19 км/с.'}},
  {title:'N. Mangold et al. (2021), “Perseverance rover reveals an ancient delta-lake system and flood deposits at Jezero crater, Mars”, Science 374, 711–717', url:'https://doi.org/10.1126/science.abl4051', note:{en:'Inclined layers of the Jezero fan are deltas built into a lake; boulder beds on top record later floods.', ru:'Наклонные слои конуса выноса в кратере Езеро — дельты, выдвигавшиеся в озеро; валунные слои сверху говорят о более поздних паводках.'}},
  {title:'E. S. Kite, J.-P. Williams, A. Lucas, O. Aharonson (2014), “Low palaeopressure of the martian atmosphere estimated from the size distribution of ancient craters”, Nature Geoscience 7, 335–339', url:'https://arxiv.org/abs/1304.4043', note:{en:'Upper limit on the air pressure when rivers flowed near Gale crater: 0.9 ± 0.1 bar, or 1.9 ± 0.2 bar if one class of landforms is excluded.', ru:'Верхний предел давления воздуха в эпоху рек близ кратера Гейл: 0,9 ± 0,1 бар или 1,9 ± 0,2 бар, если исключить один класс форм рельефа.'}},
  {title:'B. M. Jakosky et al. (2018), “Loss of the Martian atmosphere to space: Present-day loss rates determined from MAVEN observations and integrated loss through time”, Icarus 315, 146–157', url:'https://doi.org/10.1016/j.icarus.2018.05.030', note:{en:'One Mars year of MAVEN data (Nov 2014 – Oct 2016): H and O loss removes ~2–3 kg/s; extrapolated back, up to ~0.8 bar of CO₂ or a 23 m global layer of water lost, probably lower limits; no large CO₂ reservoirs on or under the surface, so loss to space dominated the climate change.', ru:'Один марсианский год данных MAVEN (ноябрь 2014 – октябрь 2016): уход H и O — ~2–3 кг/с; при экстраполяции в прошлое потеряно до ~0,8 бар CO₂ или 23-метровый глобальный слой воды, вероятно, это нижние пределы; крупных запасов CO₂ на поверхности и под ней нет, так что изменение климата определил уход в космос.'}},
  {title:'D. C. Catling and K. J. Zahnle (2009), “The Planetary Air Leak”, Scientific American 300(5), 36–43 (authors\' copy)', url:'https://faculty.washington.edu/dcatling/Catling2009_SciAm.pdf', note:{en:'Jeans escape and the exobase (on Earth about 500 km, typically about 1,000 K, where hydrogen averages about 5 km/s against an escape speed of 10.8 km/s); Earth loses about 3 kg of hydrogen and 50 g of helium a second; photochemical escape and sputtering on Mars.', ru:'Джинсовское убегание и экзобаза (у Земли около 500 км, обычно около 1000 K, где средняя скорость водорода около 5 км/с при скорости убегания 10,8 км/с); Земля теряет около 3 кг водорода и 50 г гелия в секунду; фотохимическое убегание и распыление на Марсе.'}},
  {title:'D. M. Hunten (1973), “The Escape of Light Gases from Planetary Atmospheres”, Journal of the Atmospheric Sciences 30, 1481–1494', url:'https://doi.org/10.1175/1520-0469(1973)030%3C1481:TEOLGF%3E2.0.CO;2', note:{en:'The Jeans flux from a Maxwellian exobase, Φ = n v₀ (1 + λ) e^−λ / 2√π, and the limits set by diffusion below.', ru:'Джинсовский поток с максвелловской экзобазы, Φ = n v₀ (1 + λ) e^−λ / 2√π, и ограничения, которые задаёт диффузия ниже.'}},
  {title:'M. S. Chaffin et al. (2015), “Three-dimensional structure in the Mars H corona revealed by IUVS on MAVEN”, Geophysical Research Letters 42, 9001–9008', url:'https://doi.org/10.1002/2015GL065287', note:{en:'The H corona model takes the density and temperature of hydrogen at an assumed exobase altitude of 200 km; published exobase retrievals span 10⁴–10⁶ cm⁻³ and 100–1,500 K.', ru:'Модель водородной короны задаётся плотностью и температурой водорода на принятой высоте экзобазы 200 км; опубликованные оценки — 10⁴–10⁶ см⁻³ и 100–1500 K.'}},
  {title:'M. S. Chaffin et al., “Seasonal Variability of Mars H Escape from MAVEN/IUVS”, 52nd ESLAB Symposium, ESA/ESTEC, 17 May 2018 (slides)', url:'https://www.cosmos.esa.int/documents/1700208/1718761/08_Chaffin_Seasonal+variations+of+H+escape+from+IUVS-MAVEN.pdf/284de21f-bf2a-fb8f-d78d-9577f8a49656', note:{en:'H is escaping thermally; MAVEN-derived escape fluxes 1–8 × 10⁸ cm⁻² s⁻¹ (10²⁶–10²⁷ per second), a model with 10⁵ cm⁻³ at 240 K, large seasonal change; earlier corona observations by Mariner 6, 7, 9, Mars Express, Rosetta and Hubble.', ru:'Водород уходит тепловым путём; по данным MAVEN потоки ухода 1–8 × 10⁸ см⁻² с⁻¹ (10²⁶–10²⁷ в секунду), модель с 10⁵ см⁻³ при 240 K, сильные сезонные изменения; более ранние наблюдения короны — «Маринеры-6, -7, -9», Mars Express, «Розетта» и «Хаббл».'}},
  {title:'H. Gröller, H. Lichtenegger, H. Lammer, V. I. Shematovich (2014), “Hot oxygen and carbon escape from the martian atmosphere”, Planetary and Space Science 98, 93–105', url:'https://arxiv.org/abs/1911.01107', note:{en:'O₂⁺ dissociative recombination channels: 6.99 eV (20.4 %), 5.02 eV (44.0 %), 3.05 eV (31.5 %); total hot-O loss 2.3–2.9 × 10²⁵ s⁻¹ in their model.', ru:'Каналы диссоциативной рекомбинации O₂⁺: 6,99 эВ (20,4 %), 5,02 эВ (44,0 %), 3,05 эВ (31,5 %); полный уход горячего O в их модели — 2,3–2,9 × 10²⁵ с⁻¹.'}},
  {title:'R. J. Lillis et al. (2017), “Photochemical escape of oxygen from Mars: First results from MAVEN in situ data”, JGR Space Physics 122, 3815–3836', url:'https://doi.org/10.1002/2016JA023525', note:{en:'Hot oxygen from O₂⁺ dissociative recombination, computed from MAVEN\'s measurements of the ionosphere, is the main source of escaping neutral oxygen.', ru:'Горячий кислород от диссоциативной рекомбинации O₂⁺, рассчитанный по измерениям ионосферы MAVEN, — главный источник уходящего нейтрального кислорода.'}},
  {title:'M. H. Acuña et al. (1999), “Global Distribution of Crustal Magnetization Discovered by the Mars Global Surveyor MAG/ER Experiment”, Science 284, 790–793', url:'https://doi.org/10.1126/science.284.5415.790', note:{en:'Intense magnetic anomalies in the ancient southern crust; Mars has no global field today.', ru:'Интенсивные магнитные аномалии в древней южной коре; глобального поля у Марса сейчас нет.'}},
  {title:'A. Mittelholz, C. L. Johnson, J. M. Feinberg, B. Langlais, R. J. Phillips (2020), “Timing of the martian dynamo: New constraints for a core field 4.5 and 3.7 Ga ago”, Science Advances 6, eaba0513', url:'https://doi.org/10.1126/sciadv.aba0513', note:{en:'MAVEN low-altitude data: weak fields over the 4.5-Ga Borealis basin and near-surface magnetisation over 3.7-Ga Lucus Planum, so a dynamo ran at both times.', ru:'Данные MAVEN с малых высот: слабые поля над бассейном Борейлис возрастом 4,5 млрд лет и приповерхностная намагниченность над плато Лукус возрастом 3,7 млрд лет — динамо работало в обе эпохи.'}},
  {title:'H. Gunell et al. (2018), “Why an intrinsic magnetic field does not protect a planet against atmospheric escape”, Astronomy & Astrophysics 614, L3', url:'https://doi.org/10.1051/0004-6361/201832934', note:{en:'Observed escape rates from Earth, Venus and Mars are similar; over a wide range of field strengths a magnetised planet can lose more, through its polar caps and cusps.', ru:'Наблюдаемые скорости ухода с Земли, Венеры и Марса близки; в широком диапазоне напряжённости поля намагниченная планета может терять больше — через полярные шапки и каспы.'}},
  {title:'NASA NSSDCA Master Catalog, “Mars Atmosphere and Volatile EvolutioN (MAVEN)”, 2013-063A', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2013-063A', note:{en:'Launched 18 November 2013, 18:28 UT, Atlas V 401; orbit insertion completed 02:24 UT on 22 September 2014; 4.5-hour science orbit, 75°, periapsis 150 km, “deep dips” to 125 km; eight instruments; PI Bruce Jakosky.', ru:'Запуск 18 ноября 2013 года в 18:28 UT, Atlas V 401; выход на орбиту — 22 сентября 2014 года в 02:24 UT; научная орбита с периодом 4,5 ч, наклонение 75°, перицентр 150 км, «глубокие погружения» до 125 км; восемь приборов; научный руководитель — Брюс Якоски.'}},
  {title:'NASA Science, “MAVEN” mission page', url:'https://science.nasa.gov/mission/maven/', note:{en:'Retrieved 12 November 2026: last heard from on 6 December 2025 after an unexpected loss of signal behind Mars; end of mission declared 3 June 2026; a review board found the spacecraft not recoverable.', ru:'Получено 12 ноября 2026 года: последний сигнал 6 декабря 2025 года, после неожиданной потери связи за Марсом; 3 июня 2026 года объявлено о завершении миссии; комиссия признала аппарат невосстановимым.'}},
  {title:'LASP, “NASA\'s MAVEN mission begins a new chapter with a new leader” (9 September 2021)', url:'https://lasp.colorado.edu/2021/09/09/nasas-maven-mission-begins-a-new-chapter-with-a-new-leader/', note:{en:'Shannon Curry became principal investigator on 31 August 2021, succeeding Bruce Jakosky, PI since the mission\'s inception in 2003.', ru:'Шеннон Карри стала научным руководителем 31 августа 2021 года, сменив Брюса Якоски, руководившего миссией с её зарождения в 2003 году.'}},
  {title:'B. M. Jakosky and the MAVEN Science Team, “Mars Atmospheric Loss at the Present and Integrated Loss Through Time As Observed by MAVEN”, 52nd ESLAB Symposium, ESA/ESTEC, 14–18 May 2018 (slides; the day of the talk is not printed)', url:'https://www.cosmos.esa.int/documents/1700208/1718761/15_Jakosky_Mars+atmospheric+loss+from+Maven+observations.pdf/8c6036e3-61ef-3fed-955a-cc97164b4f9b', note:{en:'Present-day oxygen loss: photochemical ~1.3 kg/s (largest), ions ~130 g/s, sputtering ~80 g/s; total ~2–3 kg/s; 10 Sept 2017 event: models give 3–20× more heavy-ion loss; argon: average fraction lost 66 ± 4.5 %.', ru:'Сегодняшний уход кислорода: фотохимический ~1,3 кг/с (крупнейший), ионный ~130 г/с, распыление ~80 г/с; всего ~2–3 кг/с; событие 10 сентября 2017 года: модели дают в 3–20 раз больший уход тяжёлых ионов; аргон: средняя потерянная доля 66 ± 4,5 %.'}},
  {title:'NASA, “NASA Mission Reveals Speed of Solar Wind Stripping Martian Atmosphere” (5 November 2015)', url:'https://www.nasa.gov/news-release/nasa-mission-reveals-speed-of-solar-wind-stripping-martian-atmosphere/', note:{en:'The solar wind strips away gas at about 100 grams a second; almost 75 % of escaping ions leave down the tail and nearly 25 % in a polar plume; erosion increases significantly during solar storms.', ru:'Солнечный ветер уносит газ со скоростью около 100 граммов в секунду; почти 75 % уходящих ионов покидают Марс через хвост и почти 25 % — через полярный шлейф; во время солнечных бурь эрозия резко усиливается.'}},
  {title:'S. W. Stone et al. (2020), “Hydrogen escape from Mars is driven by seasonal and dust storm transport of water”, Science 370, 824–831', url:'https://doi.org/10.1126/science.aba5229', note:{en:'MAVEN NGIMS: water carried into the upper atmosphere by season and by dust storms (including the 2018 global storm) dominates today\'s loss of hydrogen.', ru:'MAVEN NGIMS: вода, поднимаемая в верхнюю атмосферу сезонами и пылевыми бурями (в том числе глобальной бурей 2018 года), определяет сегодняшний уход водорода.'}},
  {title:'ESA, “Leaky atmosphere linked to lightweight planet” (8 February 2018), on R. Ramstad et al. (2017), JGR Space Physics 122, 8051–8062', url:'https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/Leaky_atmosphere_linked_to_lightweight_planet', note:{en:'Mars Express (launched 2 June 2003) has monitored escaping ions since 2004, from solar minimum to maximum; Mars\'s gravity is about a third of Earth\'s; the planets\' atmospheres diverged over 4.6 billion years.', ru:'Mars Express (запущен 2 июня 2003 года) следит за уходящими ионами с 2004 года, от минимума солнечной активности до максимума; притяжение Марса — около трети земного; атмосферы планет разошлись за 4,6 млрд лет.'}},
  {title:'R. Thomas et al., “Seasonal variability of atomic hydrogen and oxygen in the EMM/EMUS cross-exospheric observations during Mars year 36”, EGU General Assembly 2023, EGU23-13324', url:'https://meetingorganizer.copernicus.org/EGU23/EGU23-13324.html', note:{en:'Hope\'s ultraviolet spectrometer, 130 km to beyond 35,000 km: hydrogen emission changes by an order of magnitude or more between perihelion and aphelion, oxygen at high altitude by about a factor of two.', ru:'Ультрафиолетовый спектрометр «Надежды», от 130 км до более чем 35 000 км: излучение водорода меняется на порядок и более между перигелием и афелием, кислорода на больших высотах — примерно вдвое.'}},
  {title:'Y. Wang et al. (2023), “The Mars Orbiter Magnetometer of Tianwen-1: In-flight Performance and First Science Results”, Earth and Planetary Physics', url:'https://arxiv.org/abs/2301.00677', note:{en:'MOMAG has measured the field around Mars routinely since 13 November 2021; it agrees with MAVEN in the solar wind; 158 bow-shock crossings, 5 of them simultaneous with MAVEN.', ru:'MOMAG регулярно измеряет поле вокруг Марса с 13 ноября 2021 года; в солнечном ветре совпадает с MAVEN; 158 пересечений головной ударной волны, 5 — одновременно с MAVEN.'}},
  {title:'NASA NSSDCA, “Chronology of Mars Exploration”', url:'https://nssdc.gsfc.nasa.gov/planetary/chronology_mars.html', note:{en:'Launch dates: Mariner 6 and 7 in 1969, Mariner 9 in 1971; Mars Express 2 June 2003, MAVEN 18 November 2013, Hope 19 July 2020, Tianwen-1 23 July 2020.', ru:'Даты запусков: «Маринер-6» и «-7» — 1969 год, «Маринер-9» — 1971 год; Mars Express — 2 июня 2003 года, MAVEN — 18 ноября 2013 года, «Надежда» — 19 июля 2020 года, «Тяньвэнь-1» — 23 июля 2020 года.'}},
  {title:'collectSPACE, “NASA ends MAVEN Mars atmosphere probe mission” (3 June 2026)', url:'https://www.collectspace.com/news/news-060326a-maven-mars-atmosphere-probe-end-mission.html', note:{en:'A telemetry fragment showed the spacecraft spinning faster than normal; the review board\'s preliminary finding is that the rotation drained the batteries and cut power to the radio; root cause not yet determined, final report expected later in 2026; more than 800 publications.', ru:'Фрагмент телеметрии показал, что аппарат вращался быстрее обычного; по предварительному выводу комиссии вращение разрядило аккумуляторы и обесточило радиосистему; первопричина не установлена, итоговый отчёт ожидался позднее в 2026 году; более 800 публикаций.'}},
  {title:'B. M. Jakosky et al. (2015), “MAVEN observations of the response of Mars to an interplanetary coronal mass ejection”, Science 350, aad0210', url:'https://doi.org/10.1126/science.aad0210', note:{en:'ICME on 8 March 2015; modelled ion escape ~1.5 × 10²⁴ s⁻¹ before (mostly O₂⁺), ~10²⁵ s⁻¹ (seven times) at four times the solar-wind pressure, 3 × 10²⁵ s⁻¹ at ~15 times; earlier studies: 10–100 times during storms.', ru:'Корональный выброс 8 марта 2015 года; модельный уход ионов ~1,5 × 10²⁴ с⁻¹ до него (в основном O₂⁺), ~10²⁵ с⁻¹ (в семь раз больше) при вчетверо большем давлении солнечного ветра, 3 × 10²⁵ с⁻¹ — примерно при 15-кратном; прежние работы: в 10–100 раз во время бурь.'}},
  {title:'S. K. Atreya et al. (2013), “Primordial argon isotope fractionation in the atmosphere of Mars measured by the SAM instrument on Curiosity”, Geophysical Research Letters 40, 5605–5609', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4373143', note:{en:'³⁶Ar/³⁸Ar = 4.2 ± 0.1 in the atmosphere at Gale crater, against 5.5 in the Sun; at least 50 % and perhaps 85–95 % of the argon lost.', ru:'³⁶Ar/³⁸Ar = 4,2 ± 0,1 в атмосфере у кратера Гейл против 5,5 у Солнца; потеряно не меньше 50 % аргона, а возможно, 85–95 %.'}},
  {title:'B. M. Jakosky et al. (2017), “Mars\' atmospheric history derived from upper-atmosphere measurements of ³⁸Ar/³⁶Ar”, Science 355, 1408–1410; LASP release, 30 March 2017', url:'https://lasp.colorado.edu/maven/2017/03/30/maven-reveals-most-of-mars-atmosphere-was-lost-to-space/', note:{en:'About 65 % of the argon that was ever in the atmosphere has been lost to space by sputtering; the majority of the CO₂ was lost too.', ru:'Около 65 % всего аргона, когда-либо бывшего в атмосфере, ушло в космос через распыление; ушла и бо́льшая часть CO₂.'}},
  {title:'G. L. Villanueva et al. (2015), “Strong water isotopic anomalies in the martian atmosphere”, Science 348, 218–221; NASA release, 5 March 2015', url:'https://www.nasa.gov/news-release/nasa-research-suggests-mars-once-had-more-water-than-earths-arctic-ocean', note:{en:'Mars lost a volume of water 6.5 times the present polar caps, a global layer about 137 m deep (19 % of the surface as a northern ocean); 87 % lost to space.', ru:'Марс потерял объём воды в 6,5 раза больше нынешних полярных шапок — глобальный слой глубиной около 137 м (северный океан на 19 % поверхности); 87 % ушло в космос.'}},
  {title:'W. M. Keck Observatory, “Mars Lost an Ocean\'s Worth of Water” (March 2015)', url:'https://keckobservatory.org/mars_lost_an_oceans_worth_of_water/', note:{en:'Atmospheric water near the pole is enriched in deuterium seven-fold relative to Earth\'s oceans; the permanent ice caps eight-fold.', ru:'Атмосферная вода у полюса обогащена дейтерием в семь раз относительно земного океана, вечные полярные шапки — в восемь.'}},
  {title:'I. Ribas, E. F. Guinan, M. Güdel, M. Audard (2005), “Evolution of the Solar Activity over Time and Effects on Planetary Atmospheres. I. High-Energy Irradiances (1–1700 Å)”, ApJ 622, 680–694', url:'https://arxiv.org/abs/astro-ph/0412253', note:{en:'From young Sun-like stars: the integrated 1–1200 Å flux was about 6 times today\'s 3.5 billion years ago and about 2.5 times 2.5 billion years ago.', ru:'По молодым солнцеподобным звёздам: суммарный поток в диапазоне 1–1200 Å 3,5 млрд лет назад был примерно в 6 раз больше нынешнего, 2,5 млрд лет назад — примерно в 2,5 раза.'}},
  {title:'ESA Science, “Extended life for ESA\'s science missions” (7 March 2023)', url:'https://sci.esa.int/web/director-desk/-/extended-life-for-esa-s-science-missions', note:{en:'Mars Express operations confirmed to the end of 2026, with an indicative extension to 31 December 2028 to support JAXA\'s MMX.', ru:'Работа Mars Express подтверждена до конца 2026 года с ориентировочным продлением до 31 декабря 2028 года для поддержки миссии MMX JAXA.'}},
  {title:'ESA, “ESA science missions get green light for new discoveries” (11 June 2026)', url:'https://www.esa.int/Science_Exploration/Space_Science/ESA_science_missions_get_green_light_for_new_discoveries', note:{en:'Retrieved 12 November 2026: at its 10–11 June 2026 meeting the Science Programme Committee endorsed extensions for all 13 missions whose current science phase ends before the end of 2026, Mars Express among them; no new end dates are given.', ru:'Проверено 12 ноября 2026 года: на заседании 10–11 июня 2026 года Комитет научной программы одобрил продление всех 13 миссий, у которых текущий научный этап заканчивается до конца 2026 года, в том числе Mars Express; новые даты окончания не названы.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderJS(); renderHO(); renderST(); renderIS(); renderHS();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__escape = {PLANETS:PLANETS, SPECIES:SPECIES, KB:KB, AMU:AMU, EV:EV, gAt:gAt, vEsc:vEsc, scaleHeight:scaleHeight, atmMass:atmMass, massToMbar:massToMbar,
  v0:v0, vMean:vMean, jeansLambda:jeansLambda, jeansVel:jeansVel, jeansFlux:jeansFlux, jeansRate:jeansRate, erfc:erfc, tailFraction:tailFraction, jeansX:jeansX,
  escEnergyEV:escEnergyEV, DR:DR, hotShare:hotShare, worldEsc:worldEsc, radiusFor:radiusFor, apoForPeriod:apoForPeriod, Q_QUIET:Q_QUIET, M_ION:M_ION,
  stormExtra:stormExtra, stormYearShare:stormYearShare, rayEnrich:rayEnrich, rayLeft:rayLeft, argonX:argonX, AR_E:AR_E, dzForLoss:dzForLoss,
  BETA:BETA, euvRatio:euvRatio, weightedGyr:weightedGyr, massLost:massLost, lostUntil:lostUntil, M_MARS_AIR:M_MARS_AIR, M_EARTH_AIR:M_EARTH_AIR,
  TIMELINE:TIMELINE, REFERENCES:REFERENCES};
