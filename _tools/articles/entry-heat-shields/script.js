/* ============ ALLEN–EGGERS BALLISTIC ENTRY [1] ============ */
var RHO0 = 1.225, H = 7200, G0 = 9.80665, KSG = 1.7415e-4;     // SI; Sutton–Graves air constant [2]
function rho(h){ return RHO0*Math.exp(-h/H); }
function speedAt(h, VE, gam, beta){ return VE*Math.exp(-RHO0*H*Math.exp(-h/H)/(2*beta*Math.sin(gam))); }
function aMax(VE, gam){ return VE*VE*Math.sin(gam)/(2*Math.E*H); }
function hStar(gam, beta){ return H*Math.log(RHO0*H/(beta*Math.sin(gam))); }
function profile(VE, gam, beta, rn){
  var pts = [], peakA = 0, hA = 0, peakQ = 0, hQ = 0, Q = 0, t = 0, prev = null;
  for(var h = 130000; h >= 0; h -= 100){
    var V = speedAt(h, VE, gam, beta), r = rho(h), a = r*V*V/(2*beta), q = KSG*Math.sqrt(r/rn)*V*V*V;
    if(prev){ var dt = 100/(0.5*(V + prev.V)*Math.sin(gam)); Q += 0.5*(q + prev.q)*dt; t += dt; }
    if(a > peakA){ peakA = a; hA = h; } if(q > peakQ){ peakQ = q; hQ = h; }
    pts.push({h:h, V:V, a:a, q:q}); prev = {V:V, q:q};
  }
  return {pts:pts, peakA:peakA, hA:hA, peakQ:peakQ, hQ:hQ, Q:Q, t:t, vGround:pts[pts.length - 1].V};
}
var dV = document.getElementById('dV'), dG = document.getElementById('dG'), dB = document.getElementById('dB'), hR = document.getElementById('hR');
function cur(){ return {VE:+dV.value*1000, gam:+dG.value*Math.PI/180, beta:Math.pow(10, +dB.value), rn:Math.pow(10, +hR.value)}; }

/* ============ CH2 — DECELERATION ============ */
function renderDec(){
  var c = cur(), P = profile(c.VE, c.gam, c.beta, c.rn), am = aMax(c.VE, c.gam), hs = hStar(c.gam, c.beta);
  document.getElementById('dVVal').textContent = fmt(c.VE/1000, 2) + T(' km/s',' км/с');
  document.getElementById('dGVal').textContent = fmt(+dG.value, 2) + '°';
  document.getElementById('dBVal').textContent = fmtInt(c.beta) + T(' kg/m²',' кг/м²');
  var svg = document.getElementById('decSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, gmax = Math.max(10, Math.ceil(am/G0/10)*10);
  function X(g){ return L + g/gmax*(R - L); }
  function Y(h){ return B - h/100000*(B - Tp); }
  [0,20000,40000,60000,80000,100000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 3, h/1000, 'svg-small', 'end'); });
  for(var gg = 0; gg <= gmax; gg += gmax/5) txt(svg, X(gg), B + 14, fmtInt(gg), 'svg-small', 'middle');
  txt(svg, R, B + 28, T('deceleration, g','перегрузка, g'), 'svg-small', 'end'); txt(svg, L, 13, T('altitude, km','высота, км'), 'svg-small');
  // other β for comparison (same peak height in g)
  [Math.pow(10, 1.9), Math.pow(10, 3.6)].forEach(function(b){
    var Q = profile(c.VE, c.gam, b, c.rn), d = '';
    Q.pts.forEach(function(p, i){ if(p.h <= 100000) d += (d ? 'L' : 'M') + X(p.a/G0).toFixed(1) + ' ' + Y(p.h).toFixed(1); });
    ns('path', {d:d, fill:'none', stroke:'#c9c9c1', 'stroke-width':1.2}, svg);
  });
  var d = '';
  P.pts.forEach(function(p){ if(p.h <= 100000) d += (d ? 'L' : 'M') + X(p.a/G0).toFixed(1) + ' ' + Y(p.h).toFixed(1); });
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('line', {x1:X(am/G0), y1:Tp, x2:X(am/G0), y2:B, stroke:'#b5452a', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, X(am/G0) - 4, Tp + 10, T('Allen–Eggers peak','пик по Аллену — Эггерсу'), 'svg-small', 'end');
  if(6.56 < gmax){ ns('line', {x1:X(6.56), y1:Tp, x2:X(6.56), y2:B, stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg); txt(svg, X(6.56) + 4, B - 6, T('Apollo 11 actual, with lift: 6.56 g','«Аполлон-11» реально, с подъёмной силой: 6,56 g'), 'svg-small'); }
  var ok = hs > 0;
  cells(document.getElementById('decReadout'), [
    [T('PEAK DECELERATION','ПИКОВАЯ ПЕРЕГРУЗКА'), fmt(am/G0, 1) + ' g'],
    [T('ALTITUDE OF THE PEAK','ВЫСОТА ПИКА'), ok ? fmt(hs/1000, 1) + T(' km',' км') : T('below ground','ниже земли')],
    [T('SPEED AT THE PEAK','СКОРОСТЬ В ПИКЕ'), fmt(c.VE*Math.exp(-0.5)/1000, 2) + T(' km/s (61 %)',' км/с (61 %)')],
    [T('SPEED AT 10 km (NO GRAVITY)','СКОРОСТЬ НА 10 км (БЕЗ ТЯГОТЕНИЯ)'), fmtInt(speedAt(10000, c.VE, c.gam, c.beta)) + T(' m/s',' м/с')]
  ]);
  hud1.textContent = fmt(am/G0, 1) + ' g';
  document.getElementById('decStatus').innerHTML = !ok
    ? T('<b>Too dense to slow down:</b> this body would reach the ground before its peak deceleration — like a heavy warhead.','<b>Слишком «плотное» тело:</b> оно достигнет земли раньше пика перегрузки — как тяжёлая боеголовка.')
    : T('The grey curves are much lighter and much heavier bodies on the same path: their peaks sit higher or lower in the sky, but reach the same g.','Серые кривые — гораздо более лёгкое и гораздо более тяжёлое тело на том же пути: их пики выше или ниже в небе, но перегрузка та же.');
  renderHeat();
}
[dV, dG, dB].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('decPre'), null); renderDec(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#decPre .btn'), function(btn){
  btn.addEventListener('click', function(){ dV.value = this.getAttribute('data-v'); dG.value = this.getAttribute('data-g'); pressGroup(this.parentNode, this); renderDec(); });
});

/* ============ CH4 — HEATING ============ */
function renderHeat(){
  if(!hR) return;
  var c = cur(), P = profile(c.VE, c.gam, c.beta, c.rn), P2 = profile(c.VE, c.gam, c.beta, 0.1);
  document.getElementById('hRVal').textContent = fmt(c.rn, c.rn < 1 ? 2 : 1) + T(' m',' м');
  var svg = document.getElementById('heatSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 250, qmax = Math.max(1, Math.ceil(Math.max(P.peakQ, P2.peakQ)/1e6/5)*5);
  function X(q){ return L + q/1e6/qmax*(R - L); }
  function Y(h){ return B - h/100000*(B - Tp); }
  [0,20000,40000,60000,80000,100000].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(h) + 3, h/1000, 'svg-small', 'end'); });
  for(var k = 0; k <= qmax + 1e-9; k += qmax/5) txt(svg, X(k*1e6), B + 14, fmt(k, qmax < 10 ? 1 : 0), 'svg-small', 'middle');
  txt(svg, R, B + 28, T('heating rate, MW/m²','тепловой поток, МВт/м²'), 'svg-small', 'end'); txt(svg, L, 13, T('altitude, km','высота, км'), 'svg-small');
  function path(Pr, col, w){ var d = ''; Pr.pts.forEach(function(p){ if(p.h <= 100000) d += (d ? 'L' : 'M') + X(p.q).toFixed(1) + ' ' + Y(p.h).toFixed(1); }); ns('path', {d:d, fill:'none', stroke:col, 'stroke-width':w}, svg); }
  path(P2, '#c9c9c1', 1.2); txt(svg, X(P2.peakQ) - 4, Y(P2.hQ) - 6, T('10 cm nose','нос 10 см'), 'svg-small', 'end');
  path(P, '#b5452a', 2);
  ns('line', {x1:X(3.25e6), y1:Tp, x2:X(3.25e6), y2:B, stroke:'#2f5aa1', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X(3.25e6) + 4, Tp + 10, T('Apollo 11 measured peak','измеренный пик «Аполлона-11»'), 'svg-small');
  cells(document.getElementById('heatReadout'), [
    [T('PEAK HEATING RATE','ПИКОВЫЙ ТЕПЛОВОЙ ПОТОК'), fmt(P.peakQ/1e6, 2) + T(' MW/m²',' МВт/м²')],
    [T('AT ALTITUDE','НА ВЫСОТЕ'), fmt(P.hQ/1000, 1) + T(' km',' км')],
    [T('TOTAL HEAT LOAD','ПОЛНАЯ ТЕПЛОВАЯ НАГРУЗКА'), fmtInt(P.Q/1e6) + T(' MJ/m²',' МДж/м²')],
    [T('VS. A 10 cm NOSE','ПРОТИВ НОСА 10 см'), fmt(P.peakQ/P2.peakQ*100, 0) + ' %']
  ]);
  hud2.textContent = fmt(P.peakQ/1e6, 1) + T(' MW/m²',' МВт/м²');
  document.getElementById('heatStatus').innerHTML = T('Heating ∝ 1/√r<sub>n</sub>: a nose ','Нагрев ∝ 1/√r<sub>n</sub>: нос в ') + fmt(c.rn/0.1, 1) + T(' times wider than 10 cm feels ',' раз шире 10 см получает ') + fmt(P.peakQ/P2.peakQ*100, 0) + T(' % of the heating. Capsules use the widest nose they can carry.',' % нагрева. Капсулы делают с самым широким носом, какой могут нести.');
}
hR.addEventListener('input', renderHeat);

/* ============ CH6 — TIMELINE ============ */
var TIMELINE = [
  ['1958', 'Allen and Eggers publish the ballistic entry analysis and the case for blunt bodies (NACA Report 1381) [1].', 'Аллен и Эггерс публикуют анализ баллистического входа и обоснование тупых тел (доклад NACA 1381) [1].'],
  ['1968', '<b>22 October:</b> Apollo 7 returns from orbit, 25,846 ft/s, peak 3.33 g. <b>27 December:</b> Apollo 8, the first crewed return from the Moon, 36,221 ft/s, 6.84 g [3].', '<b>22 октября:</b> «Аполлон-7» возвращается с орбиты, 25 846 фут/с, пик 3,33 g. <b>27 декабря:</b> «Аполлон-8» — первое возвращение экипажа от Луны, 36 221 фут/с, 6,84 g [3].'],
  ['1969', '<b>24 July:</b> Apollo 11 enters at 36,194 ft/s, −6.48°, peak 6.56 g [3].', '<b>24 июля:</b> «Аполлон-11» входит со скоростью 36 194 фут/с под углом −6,48°, пик 6,56 g [3].'],
  ['1971', 'Sutton and Graves publish a stagnation-point heating equation for arbitrary gas mixtures (NASA TR R-376) [2].', 'Саттон и Грейвс публикуют формулу нагрева в точке торможения для произвольных газовых смесей (NASA TR R-376) [2].'],
  ['2006', '<b>15 January:</b> Stardust returns at 12.9 km/s under a PICA heat shield, the fastest Earth entry [4][5].', '<b>15 января:</b> Stardust возвращается со скоростью 12,9 км/с под экраном PICA — самый быстрый вход в атмосферу Земли [4][5].'],
  ['2022', 'Artemis I: Orion\'s skip entry; char loss found on the Avcoat heat shield [6].', '«Артемида-1»: вход «Ориона» с рикошетом; обнаружены потери обугленного слоя экрана Avcoat [6].'],
  ['2024', '<b>December:</b> NASA identifies the cause — trapped gas in the Avcoat [6].', '<b>Декабрь:</b> NASA устанавливает причину — газ, запертый в Avcoat [6].'],
  ['2026', '<b>10 April:</b> Artemis II splashes down; char loss significantly reduced [7].', '<b>10 апреля:</b> приводнение «Артемиды-2»; потери обугленного слоя значительно меньше [7].']
];

/* ============ CH7 — REFERENCES ============ */
var REFERENCES = [
  {title:'H. J. Allen, A. J. Eggers Jr. (1958), “A study of the motion and aerodynamic heating of ballistic missiles entering the earth\'s atmosphere at high supersonic speeds”, NACA Report 1381', url:'https://ntrs.nasa.gov/citations/19930091020', note:{en:'Maximum deceleration independent of mass, size and drag coefficient — set only by entry speed and flight-path angle; blunt, high-drag shapes minimise heat delivered to light bodies.', ru:'Максимальная перегрузка не зависит от массы, размера и коэффициента сопротивления — её задают только скорость и угол входа; тупые формы с большим сопротивлением минимизируют тепло, передаваемое лёгким телам.'}},
  {title:'K. Sutton, R. A. Graves Jr. (1971), “A general stagnation-point convective heating equation for arbitrary gas mixtures”, NASA TR R-376', url:'https://ntrs.nasa.gov/citations/19720003329', note:{en:'Stagnation-point heating ∝ √(ρ/r_n), with a heat-transfer coefficient for air of about 0.11 in the report\'s units.', ru:'Нагрев в точке торможения ∝ √(ρ/r_n), коэффициент теплопередачи для воздуха около 0,11 в единицах доклада.'}},
  {title:'R. W. Orloff (2000), Apollo by the Numbers, NASA SP-2000-4029 — “Entry, Splashdown, and Recovery”', url:'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4029.pdf', note:{en:'Entry speeds, flight-path angles, peak g, lift-to-drag ratio (~0.3), peak heating rates and heat loads for Apollo 7–17: Apollo 11 36,194.4 ft/s, −6.48°, 6.56 g, 286 BTU/ft²/s, 26,482 BTU/ft², 929.3 s.', ru:'Скорости и углы входа, пиковые перегрузки, аэродинамическое качество (~0,3), пиковые потоки и тепловые нагрузки «Аполлонов» 7–17: «Аполлон-11» — 36 194,4 фут/с, −6,48°, 6,56 g, 286 БТЕ/фут²/с, 26 482 БТЕ/фут², 929,3 с.'}},
  {title:'P. N. Desai et al. (2006), “Entry, Descent, and Landing Operations Analysis for the Stardust Re-Entry Capsule”, AIAA-2006-6410', url:'https://ntrs.nasa.gov/citations/20060028186', note:{en:'Landing 15 January 2006 in Utah; entry at 12.9 km/s inertial, the highest of any Earth-returning mission; Apollo 11.0 km/s; 0.8 m capsule, 60° sphere-cone.', ru:'Посадка 15 января 2006 в Юте; вход на 12,9 км/с (инерциальная), самый быстрый среди возвращаемых аппаратов; у «Аполлонов» 11,0 км/с; капсула 0,8 м, сфера-конус 60°.'}},
  {title:'NASA Ames, Thermal Protection Materials Branch — Low Density Ablators', url:'https://www.nasa.gov/general/thermal-protection-materials-branch-low-density-ablators/', note:{en:'PICA developed at Ames in the 1980s for Stardust, density ~0.27 g/cm³; heritage on Dragon (2012) and the 4.5 m MSL heat shield.', ru:'PICA создан в Ames в 1980-х для Stardust, плотность ~0,27 г/см³; применялся на Dragon (2012) и 4,5-метровом экране MSL.'}},
  {title:'NASA (2024), “NASA Identifies Cause of Artemis I Orion Heat Shield Char Loss”', url:'https://www.nasa.gov/missions/artemis/nasa-identifies-cause-of-artemis-i-orion-heat-shield-char-loss/', note:{en:'Skip entry; gases inside the Avcoat could not vent, causing cracking and char loss; 121 tests in eight campaigns.', ru:'Вход с рикошетом; газы внутри Avcoat не могли выйти, что вызвало растрескивание и потерю обугленного слоя; 121 испытание в восьми сериях.'}},
  {title:'NASA (2026), “NASA on Track for Future Missions with Initial Artemis II Assessments”', url:'https://www.nasa.gov/missions/nasa-on-track-for-future-missions-with-initial-artemis-ii-assessments/', note:{en:'Artemis II launched 1 April and splashed down 10 April 2026; nearly 35 times the speed of sound at entry; char loss significantly reduced.', ru:'«Артемида-2» стартовала 1 апреля и приводнилась 10 апреля 2026; почти 35 скоростей звука при входе; потери обугленного слоя значительно меньше.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderDec();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__entry = {profile:profile, aMax:aMax, hStar:hStar, speedAt:speedAt, rho:rho, KSG:KSG};
