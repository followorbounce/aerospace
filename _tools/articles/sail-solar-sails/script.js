/* ============ CONSTANTS ============ */
var S0 = 1361, C_MS = 299792458, P_IDEAL = 2*S0/C_MS;                    // W/m² at 1 AU [1]; N/m²
function force(A, eta, alphaDeg, rAU){ var c = Math.cos(alphaDeg*Math.PI/180); return eta*P_IDEAL*A*c*c/(rAU*rAU); }
function sideways(alphaDeg){ var a = alphaDeg*Math.PI/180; return Math.cos(a)*Math.cos(a)*Math.sin(a); }

/* ============ CH1 — THRUST ============ */
var fA = document.getElementById('fA'), fM = document.getElementById('fM'), fE = document.getElementById('fE');
function cur(){ return {A:Math.pow(10, +fA.value), m:Math.pow(10, +fM.value), eta:+fE.value}; }
function nStr(F){ return F >= 1e-3 ? fmt(F*1000, 2) + T(' mN',' мН') : fmt(F*1e6, 1) + T(' µN',' мкН'); }
function renderF(){
  var c = cur(), F = force(c.A, c.eta, 0, 1), a = F/c.m;
  document.getElementById('fAVal').textContent = fmt(c.A, c.A < 10 ? 1 : 0) + T(' m²',' м²') + ' (' + fmt(Math.sqrt(c.A), 1) + T(' m square',' м сторона') + ')';
  document.getElementById('fMVal').textContent = fmt(c.m, c.m < 10 ? 1 : 0) + T(' kg',' кг');
  document.getElementById('fEVal').textContent = fmt(c.eta, 2);
  var svg = document.getElementById('fSvg'); svg.innerHTML = '';
  // sail drawn to scale against a 20 m reference, with sunlight arrows
  var x0 = 40, y0 = 40, sc = 180/20, side = Math.min(200, Math.sqrt(c.A)*sc);
  ns('rect', {x:x0, y:y0, width:180, height:180, fill:'none', stroke:'#e4e4de', 'stroke-dasharray':'3 3'}, svg);
  txt(svg, x0, y0 - 8, T('20 × 20 m reference','квадрат 20 × 20 м для масштаба'), 'svg-small');
  ns('rect', {x:x0 + (180 - side)/2, y:y0 + (180 - side)/2, width:side, height:side, fill:'#e9e4cf', stroke:'#a8741a'}, svg);
  for(var k = 0; k < 5; k++){ var yy = y0 + 20 + k*35; ns('line', {x1:x0 + 230, y1:yy, x2:x0 + 196, y2:yy, stroke:'#a8741a', 'stroke-width':1.5}, svg); ns('path', {d:'M' + (x0 + 196) + ' ' + yy + 'l8 -4 l0 8 z', fill:'#a8741a'}, svg); }
  txt(svg, x0 + 240, y0 + 95, T('sunlight','свет Солнца'), 'svg-small');
  // compare thrust to weights
  var gEq = F/9.80665*1000;
  txt(svg, 300, 150, T('thrust ≈ the weight of','тяга ≈ вес'), 'svg-small');
  txt(svg, 300, 166, fmt(gEq*1000, 0) + T(' mg on Earth',' мг на Земле'), 'svg-small');
  cells(document.getElementById('fReadout'), [
    [T('THRUST AT 1 AU, FACE-ON','ТЯГА НА 1 а.е., ЛИЦОМ К СОЛНЦУ'), nStr(F)],
    [T('ACCELERATION','УСКОРЕНИЕ'), (a).toExponential(2) + T(' m/s²',' м/с²')],
    [T('Δv PER DAY','Δv ЗА СУТКИ'), fmt(a*86400, a*86400 < 1 ? 3 : 2) + T(' m/s',' м/с')],
    [T('AREAL DENSITY','ПОВЕРХНОСТНАЯ ПЛОТНОСТЬ'), fmt(c.m/c.A*1000, 0) + T(' g/m²',' г/м²')]
  ]);
  hud1.textContent = nStr(F); hud2.textContent = fmt(a*86400, 3) + T(' m/s',' м/с');
  var ik = Math.abs(c.A - 196) < 2 && Math.abs(c.m - 310) < 5 && Math.abs(c.eta - 0.63) < 0.005;
  document.getElementById('fStatus').innerHTML = ik
    ? T('JAXA measured 1.12 mN for IKAROS [3]; this setting gives ','JAXA измерило у IKAROS 1,12 мН [3]; эти параметры дают ') + nStr(F) + '.'
    : T('Tiny force, but it never stops: a year of it adds ','Сила крошечная, но непрерывная: за год она добавляет ') + fmtInt(a*86400*365.25) + T(' m/s.',' м/с.');
  renderD();
}
[fA, fM, fE].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('fPre'), null); renderF(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#fPre .btn'), function(btn){ btn.addEventListener('click', function(){ fA.value = Math.log10(+this.getAttribute('data-a')); fM.value = Math.log10(+this.getAttribute('data-m')); fE.value = this.getAttribute('data-e'); pressGroup(this.parentNode, this); renderF(); }); });

/* ============ CH2 — STEERING ============ */
var sA = document.getElementById('sA');
function renderS(){
  var al = +sA.value, sw = sideways(al), fr = Math.cos(al*Math.PI/180)*Math.cos(al*Math.PI/180);
  document.getElementById('sAVal').textContent = fmt(al, 1) + '°';
  var svg = document.getElementById('sSvg'); svg.innerHTML = '';
  var L = 56, R = 300, Tp = 22, B = 220;
  function X(a){ return L + a/90*(R - L); }
  function Y(v){ return B - v*(B - Tp); }
  [0,0.25,0.5,0.75,1].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, (v*100) + '%', 'svg-small', 'end'); });
  [0,30,60,90].forEach(function(a){ txt(svg, X(a), B + 14, a + '°', 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('sail angle α','угол паруса α'), 'svg-small', 'end'); txt(svg, L, 13, T('share of the face-on push','доля лобового толчка'), 'svg-small');
  var d1 = '', d2 = ''; for(var a = 0; a <= 90.001; a += 1){ d1 += (a ? 'L' : 'M') + X(a).toFixed(1) + ' ' + Y(Math.pow(Math.cos(a*Math.PI/180), 2)).toFixed(1); d2 += (a ? 'L' : 'M') + X(a).toFixed(1) + ' ' + Y(sideways(a)).toFixed(1); }
  ns('path', {d:d1, fill:'none', stroke:'#8a8a82', 'stroke-width':1.5}, svg); ns('path', {d:d2, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, X(8), Y(0.95), T('total push','полный толчок'), 'svg-small'); txt(svg, X(50), Y(0.42), T('sideways part','боковая часть'), 'svg-small');
  ns('line', {x1:X(35.26), y1:Tp, x2:X(35.26), y2:B, stroke:'#2f5aa1', 'stroke-dasharray':'3 3'}, svg);
  ns('circle', {cx:X(al), cy:Y(sw), r:5, fill:'#b5452a'}, svg);
  // diagram: sun rays, sail, force
  var cx = 390, cy = 120, a = al*Math.PI/180;
  for(var k = -2; k <= 2; k++) ns('line', {x1:cx - 80, y1:cy + k*16, x2:cx - 20, y2:cy + k*16, stroke:'#a8741a'}, svg);
  txt(svg, cx - 80, cy - 46, T('sunlight →','свет →'), 'svg-small');
  var nx = Math.cos(a), ny = -Math.sin(a), tx = -ny, ty = nx;
  ns('line', {x1:cx - tx*45, y1:cy - ty*45, x2:cx + tx*45, y2:cy + ty*45, stroke:'#0b0b0c', 'stroke-width':4}, svg);
  var fl = 60*fr; ns('line', {x1:cx, y1:cy, x2:cx + nx*fl, y2:cy + ny*fl, stroke:'#b5452a', 'stroke-width':2.5}, svg);
  txt(svg, cx + nx*fl + 4, cy + ny*fl, 'F', 'svg-small');
  ns('line', {x1:cx, y1:cy, x2:cx, y2:cy + ny*fl, stroke:'#2f5aa1', 'stroke-width':2, 'stroke-dasharray':'3 2'}, svg);
  txt(svg, cx + 4, cy + ny*fl - 4, T('sideways','вбок'), 'svg-small');
  cells(document.getElementById('sReadout'), [
    [T('TOTAL PUSH','ПОЛНЫЙ ТОЛЧОК'), fmt(fr*100, 1) + ' %'],
    [T('SIDEWAYS PART','БОКОВАЯ ЧАСТЬ'), fmt(sw*100, 1) + ' %'],
    [T('BEST ANGLE','ЛУЧШИЙ УГОЛ'), '35.26° → 38.5 %'.replace(/\./g, T('.', ','))],
    [T('SIDEWAYS vs BEST','ВБОК ОТНОСИТЕЛЬНО ЛУЧШЕГО'), fmt(sw/0.3849*100, 0) + ' %']
  ]);
  document.getElementById('sStatus').innerHTML = Math.abs(al - 35.26) < 2
    ? T('Close to the best tacking angle: tan α = 1/√2.','Близко к лучшему углу галса: tg α = 1/√2.')
    : al < 35 ? T('Facing the Sun more: lots of push, but mostly straight outward.','Больше лицом к Солнцу: толчок сильный, но в основном прямо от Солнца.') : T('Turned edge-on: less light caught, so less push of any kind.','Почти ребром: ловится меньше света, и толчок слабеет во всех направлениях.');
}
sA.addEventListener('input', renderS);

/* ============ CH3 — DISTANCE ============ */
var dR = document.getElementById('dR'), dT = document.getElementById('dT');
function renderD(){
  if(!dR) return;
  var c = cur(), r = +dR.value, days = +dT.value, a = force(c.A, c.eta, 0, r)/c.m, dv = a*days*86400;
  document.getElementById('dRVal').textContent = fmt(r, 2) + T(' AU',' а.е.');
  document.getElementById('dTVal').textContent = fmtInt(days) + T(' days',' сут');
  var svg = document.getElementById('dSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 220, vmax = Math.max(10, a*1000*86400*1.05);
  function X(d){ return L + d/1000*(R - L); }
  function Y(v){ return B - v/vmax*(B - Tp); }
  for(var k = 0; k <= 4; k++){ var v = vmax*k/4; ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, v >= 1000 ? fmt(v/1000, 1) + 'k' : fmtInt(v), 'svg-small', 'end'); }
  [0,250,500,750,1000].forEach(function(d){ txt(svg, X(d), B + 14, d, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('days','сутки'), 'svg-small', 'end'); txt(svg, L, 13, T('speed gained, m/s','набранная скорость, м/с'), 'svg-small');
  [[0.72, T('Venus','Венера'), '#2f5aa1'], [1, T('Earth','Земля'), '#8a8a82'], [r, T('chosen','выбрано'), '#0b0b0c']].forEach(function(p){ var ap = force(c.A, c.eta, 0, p[0])/c.m; ns('line', {x1:X(0), y1:Y(0), x2:X(1000), y2:Y(ap*1000*86400), stroke:p[2], 'stroke-width': p[1] === T('chosen','выбрано') ? 2 : 1.2}, svg); });
  ns('circle', {cx:X(days), cy:Y(dv), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('dReadout'), [
    [T('SUNLIGHT HERE','СВЕТ ЗДЕСЬ'), fmtInt(S0/(r*r)) + T(' W/m²',' Вт/м²')],
    [T('THRUST HERE','ТЯГА ЗДЕСЬ'), nStr(force(c.A, c.eta, 0, r))],
    [T('SPEED GAINED','НАБРАННАЯ СКОРОСТЬ'), fmt(dv, dv < 10 ? 2 : 0) + T(' m/s',' м/с')],
    [T('vs. AT 1 AU','ОТНОСИТЕЛЬНО 1 а.е.'), fmt(1/(r*r)*100, 0) + ' %']
  ]);
  document.getElementById('dStatus').innerHTML = r > 3 ? T('Out at Jupiter\'s distance the push is a few percent of Earth\'s — sails belong in the inner Solar System.','У Юпитера толчок — несколько процентов от земного: место парусов — во внутренней Солнечной системе.') : T('Never switching off, the sail keeps adding speed for as long as it points well.','Никогда не выключаясь, парус продолжает набирать скорость, пока правильно ориентирован.');
}
[dR, dT].forEach(function(el){ el.addEventListener('input', renderD); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['2010', '<b>21 May:</b> IKAROS launched with Akatsuki; <b>9 July:</b> JAXA confirms 1.12 mN of sunlight thrust [2][3].', '<b>21 мая:</b> запуск IKAROS вместе с «Акацуки»; <b>9 июля:</b> JAXA подтверждает тягу солнечного света 1,12 мН [2][3].'],
  ['2015', '<b>May:</b> IKAROS enters its fifth hibernation; no signal afterwards [7].', '<b>Май:</b> IKAROS в пятый раз уходит в спячку; сигналов больше нет [7].'],
  ['2019', '<b>25 June:</b> LightSail 2 launched; <b>late July:</b> apogee raised ~2 km in four days by light alone [4][5].', '<b>25 июня:</b> запуск LightSail 2; <b>конец июля:</b> апогей поднят на ~2 км за четыре дня одним светом [4][5].'],
  ['2022', '<b>17 November:</b> LightSail 2 re-enters after three and a half years [4].', '<b>17 ноября:</b> LightSail 2 входит в атмосферу после трёх с половиной лет [4].'],
  ['2024', '<b>23 April:</b> NASA\'s ACS3 launched to test composite sail booms, ~80 m² [6].', '<b>23 апреля:</b> запуск ACS3 NASA для испытания композитных штанг паруса, ~80 м² [6].'],
  ['2025', '<b>15 May:</b> JAXA ends IKAROS operations after 15 years [7].', '<b>15 мая:</b> JAXA завершает работу с IKAROS через 15 лет [7].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'G. Kopp, J. L. Lean (2011), “A new, lower value of total solar irradiance: Evidence and climate significance”, Geophysical Research Letters 38', url:'https://doi.org/10.1029/2010GL045777', note:{en:'Total solar irradiance of about 1,361 W/m² at 1 AU.', ru:'Полная солнечная освещённость около 1361 Вт/м² на 1 а.е.'}},
  {title:'JAXA ISAS, “IKAROS” mission page', url:'https://www.isas.jaxa.jp/en/missions/spacecraft/past/ikaros.html', note:{en:'Launched 21 May 2010 (JST) on H-IIA F17; about 310 kg; 14 m × 14 m square membrane; spin-deployed; thin-film solar cells; trajectory control with LCD devices.', ru:'Запущен 21 мая 2010 (JST) на H-IIA F17; около 310 кг; квадратная мембрана 14 × 14 м; раскрыт вращением; тонкоплёночные солнечные элементы; управление траекторией жидкокристаллическими элементами.'}},
  {title:'JAXA (2010), “Confirmation of Photon Acceleration” of IKAROS, press release 9 July 2010', url:'https://www.jaxa.jp/press/2010/07/20100709_ikaros_e.html', note:{en:'Thrust from solar light pressure 1.12 mN, the expected value, from Doppler tracking; about the weight of 0.114 g on Earth.', ru:'Тяга солнечного давления 1,12 мН — ожидаемое значение, по доплеровским измерениям; около веса 0,114 г на Земле.'}},
  {title:'The Planetary Society, “LightSail”', url:'https://www.planetary.org/sci-tech/lightsail', note:{en:'LightSail 2 launched 25 June 2019 on Falcon Heavy (STP-2) into a ~720 km orbit; 32 m² sail (5.6 m sides); re-entered 17 November 2022.', ru:'LightSail 2 запущен 25 июня 2019 на Falcon Heavy (STP-2) на орбиту ~720 км; парус 32 м² (сторона 5,6 м); вошёл в атмосферу 17 ноября 2022.'}},
  {title:'The Planetary Society (2019), “LightSail 2 Spacecraft Successfully Demonstrates Flight by Light”', url:'https://www.planetary.org/articles/lightsail-2-successful-flight-by-light', note:{en:'Apogee raised by about 2 km from 26 to 30 July 2019, attributable only to solar sailing.', ru:'Апогей поднят примерно на 2 км с 26 по 30 июля 2019 — только за счёт солнечного паруса.'}},
  {title:'NASA, “Advanced Composite Solar Sail System (ACS3)”', url:'https://www.nasa.gov/mission/acs3/', note:{en:'Launched 23 April 2024; CubeSat with a sail of about 80 m² on lightweight composite booms.', ru:'Запущен 23 апреля 2024; кубсат с парусом около 80 м² на лёгких композитных штангах.'}},
  {title:'JAXA ISAS (2025), “End of 15 year operation of the Small Scale Solar Powered Sail Demonstration Satellite, IKAROS”', url:'https://www.isas.jaxa.jp/en/topics/004006.html', note:{en:'Operations and search end 15 May 2025; no radio signal since the fifth hibernation in May 2015.', ru:'Работа и поиск завершены 15 мая 2025; радиосигналов нет с пятой спячки в мае 2015.'}},
  {title:'The Planetary Society (2019), “LightSail 2 Marks 1 Month of Solar Sailing”', url:'https://www.planetary.org/articles/ls2-one-month-sailing', note:{en:'Apogee raised by 7.2 km after a month of solar sailing since 23 July 2019.', ru:'Апогей поднят на 7,2 км за месяц плавания под солнечным парусом с 23 июля 2019.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderF();
  renderS();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__sail = {force:force, sideways:sideways, P_IDEAL:P_IDEAL};
