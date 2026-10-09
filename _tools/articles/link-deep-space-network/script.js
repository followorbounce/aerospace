/* ============ LINK BUDGET (calibrated on JPL's Voyager 2 tables [1]) ============ */
var AU = 1.495978707e8, KB = 1.380649e-23, ETA = 0.65, D_SC = 3.66, T_SYS = 21.12, L_MISC = 0.42;
var DATA_FRAC = -1.25, SYS_LOSS = -0.8, EBN0_REQ = 2.34;                    // dB, Voyager telemetry table [1]
function db(x){ return 10*Math.log10(x); }
function lambda(fGHz){ return C_LIGHT*1000/(fGHz*1e9); }
function gain(D, fGHz){ return db(ETA*Math.pow(Math.PI*D/lambda(fGHz), 2)); }
function spaceLoss(dKm, fGHz){ return 20*Math.log10(4*Math.PI*dKm*1000/lambda(fGHz)); }
function budget(dAU, pW, Dg, fGHz){
  var pt = db(pW*1000), gt = gain(D_SC, fGHz), gr = gain(Dg, fGHz), ls = spaceLoss(dAU*AU, fGHz);
  var pr = pt + gt + gr - ls - L_MISC, n0 = db(KB*T_SYS) + 30, prn0 = pr - n0;
  var rmax = Math.pow(10, (prn0 + DATA_FRAC + SYS_LOSS - EBN0_REQ)/10);
  return {pt:pt, gt:gt, gr:gr, ls:ls, pr:pr, n0:n0, prn0:prn0, rmax:rmax, margin160:prn0 + DATA_FRAC + SYS_LOSS - db(160) - EBN0_REQ, owlt:dAU*AU/C_LIGHT};
}
var lbD = document.getElementById('lbD'), lbP = document.getElementById('lbP'), lbDg = 70, lbF = 8.415;
var PRE = {v2:{d:Math.log10(48.62), p:12.3}, v1:{d:Math.log10(25.902e9/AU), p:12.3}};
function rateStr(r){ return r >= 1e6 ? fmt(r/1e6, 1) + T(' Mbit/s',' Мбит/с') : r >= 1e3 ? fmt(r/1e3, 1) + T(' kbit/s',' кбит/с') : fmt(r, r < 10 ? 1 : 0) + T(' bit/s',' бит/с'); }
function timeStr(s){ return s >= 86400 ? fmt(s/3600, 1) + T(' h',' ч') : s >= 3600 ? fmt(s/3600, 2) + T(' h',' ч') : s >= 60 ? fmt(s/60, 1) + T(' min',' мин') : fmt(s, 1) + T(' s',' с'); }
function renderLb(){
  var dAU = Math.pow(10, +lbD.value), p = +lbP.value, B = budget(dAU, p, lbDg, lbF);
  document.getElementById('lbDVal').textContent = (dAU < 10 ? fmt(dAU, 2) : fmt(dAU, 1)) + T(' AU',' а.е.') + ' · ' + fmt(dAU*AU/1e9, 2) + T(' bn km',' млрд км');
  document.getElementById('lbPVal').textContent = fmt(p, 1) + T(' W',' Вт') + ' (' + fmt(B.pt, 1) + T(' dBm',' дБм') + ')';
  var svg = document.getElementById('lbSvg'); svg.innerHTML = '';
  var L = 66, R = 465, Tp = 24, Bt = 250, ymin = -240, ymax = 140;
  function Y(v){ return Bt - (v - ymin)/(ymax - ymin)*(Bt - Tp); }
  [-200,-150,-100,-50,0,50,100].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 3, v, 'svg-small', 'end'); });
  txt(svg, L, 13, T('running total, dBm','нарастающий итог, дБм'), 'svg-small');
  var steps = [[T('transmit','передатчик'), B.pt], [T('+ s/c antenna','+ антенна КА'), B.gt], [T('− space','− пространство'), -B.ls], [T('+ ground dish','+ наземная'), B.gr], [T('− losses','− потери'), -L_MISC]];
  var acc = 0, w = (R - L)/steps.length;
  steps.forEach(function(s, i){
    var a0 = acc, a1 = acc + s[1], x = L + i*w + 6;
    ns('rect', {x:x, y:Math.min(Y(a0), Y(a1)), width:w - 12, height:Math.max(1.5, Math.abs(Y(a1) - Y(a0))), fill: s[1] >= 0 ? '#0b0b0c' : '#b5452a'}, svg);
    txt(svg, x + (w - 12)/2, Bt + 14, s[0], 'svg-small', 'middle');
    txt(svg, x + (w - 12)/2, Math.min(Y(a0), Y(a1)) - 4, (s[1] >= 0 ? '+' : '') + fmt(s[1], 1), 'svg-small', 'middle');
    acc = a1;
  });
  ns('line', {x1:L, y1:Y(B.n0), x2:R, y2:Y(B.n0), stroke:'#2f5aa1', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, R - 2, Y(B.n0) + 12, T('noise per Hz, ','шум на 1 Гц, ') + fmt(B.n0, 1), 'svg-small', 'end');
  cells(document.getElementById('lbReadout'), [
    [T('RECEIVED POWER','ПРИНИМАЕМАЯ МОЩНОСТЬ'), fmt(B.pr, 1) + T(' dBm',' дБм') + ' (' + (Math.pow(10, B.pr/10)/1000).toExponential(1) + T(' W',' Вт') + ')'],
    [T('SIGNAL ÷ NOISE DENSITY','СИГНАЛ ÷ ПЛОТНОСТЬ ШУМА'), fmt(B.prn0, 1) + T(' dB-Hz',' дБ·Гц')],
    [T('MAX DATA RATE (0 dB MARGIN)','МАКС. СКОРОСТЬ (ЗАПАС 0 дБ)'), rateStr(B.rmax)],
    [T('MARGIN AT 160 bit/s','ЗАПАС ПРИ 160 бит/с'), fmt(B.margin160, 1) + T(' dB',' дБ')],
    [T('ONE-WAY LIGHT TIME','ВРЕМЯ ПРОХОЖДЕНИЯ СИГНАЛА'), timeStr(B.owlt)],
    [T('ANTENNA GAINS (SPACE / GROUND)','УСИЛЕНИЯ АНТЕНН (КА / ЗЕМЛЯ)'), fmt(B.gt, 1) + ' / ' + fmt(B.gr, 1) + T(' dBi',' дБи')]
  ]);
  hud1.textContent = fmt(B.pr, 1) + T(' dBm',' дБм'); hud2.textContent = rateStr(B.rmax);
  var isV2 = Math.abs(dAU - 48.62) < 0.05 && Math.abs(p - 12.3) < 0.05 && lbDg === 70 && lbF === 8.415;
  document.getElementById('lbStatus').innerHTML = isV2
    ? T('JPL\'s table for this case: −145.5 dBm received, 39.9 dB-Hz, 13.3 dB margin at 160 bit/s [1]. This model: ','Таблица JPL для этого случая: −145,5 дБм, 39,9 дБ·Гц, запас 13,3 дБ при 160 бит/с [1]. Эта модель: ') + fmt(B.pr, 1) + ' / ' + fmt(B.prn0, 1) + ' / ' + fmt(B.margin160, 1) + '.'
    : B.margin160 >= 0 ? T('160 bit/s still closes with ','160 бит/с ещё проходит с запасом ') + fmt(B.margin160, 1) + T(' dB to spare.',' дБ.') : T('<b>160 bit/s no longer closes</b> — slow down, array several dishes, or move to a higher frequency.','<b>160 бит/с уже не проходит</b> — нужно снизить скорость, объединить несколько антенн или перейти на более высокую частоту.');
}
[lbD, lbP].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('lbPre'), null); renderLb(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#lbPre .btn'), function(btn){
  btn.addEventListener('click', function(){ var P = PRE[this.getAttribute('data-p')]; lbD.value = P.d; lbP.value = P.p; lbDg = 70; lbF = 8.415; pressGroup(document.getElementById('lbAnt'), document.querySelector('#lbAnt .btn[data-d="70"]')); pressGroup(document.getElementById('lbBand'), document.querySelector('#lbBand .btn[data-f="8.415"]')); pressGroup(this.parentNode, this); renderLb(); });
});
Array.prototype.forEach.call(document.querySelectorAll('#lbAnt .btn'), function(btn){ btn.addEventListener('click', function(){ lbDg = +this.getAttribute('data-d'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('lbPre'), null); renderLb(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#lbBand .btn'), function(btn){ btn.addEventListener('click', function(){ lbF = +this.getAttribute('data-f'); pressGroup(this.parentNode, this); pressGroup(document.getElementById('lbPre'), null); renderLb(); }); });

/* ============ CH3 — GAIN & BEAMWIDTH ============ */
var bmD = document.getElementById('bmD'), bmF = document.getElementById('bmF');
function beam(D, fGHz){ var lam = lambda(fGHz); return {g:gain(D, fGHz), bw:70*lam/D}; }
function renderBeam(){
  var D = Math.pow(10, +bmD.value), f = +bmF.value, Bm = beam(D, f);
  document.getElementById('bmDVal').textContent = fmt(D, D < 10 ? 2 : 1) + T(' m',' м');
  document.getElementById('bmFVal').textContent = fmt(f, 1) + T(' GHz',' ГГц');
  var svg = document.getElementById('beamSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 230;
  function X(lgD){ return L + (lgD + 0.3)/2.15*(R - L); }
  function Y(g){ return B - (g - 20)/70*(B - Tp); }
  [20,40,60,80].forEach(function(g){ ns('line', {x1:L, y1:Y(g), x2:R, y2:Y(g), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(g) + 3, g, 'svg-small', 'end'); });
  [0.5,1,3.66,10,34,70].forEach(function(d){ txt(svg, X(Math.log10(d)), B + 14, d, 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('dish diameter, m (log)','диаметр антенны, м (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('gain, dBi','усиление, дБи'), 'svg-small');
  [[8.415,'X','#8a8a82'],[32,'Ka','#2f5aa1'],[f, T('yours','ваша'),'#0b0b0c']].forEach(function(b){
    var d = ''; for(var lg = -0.3; lg <= 1.85001; lg += 0.05){ d += (d ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(gain(Math.pow(10, lg), b[0])).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:b[2], 'stroke-width': b[1] === 'X' || b[1] === 'Ka' ? 1.2 : 2}, svg);
  });
  ns('circle', {cx:X(Math.log10(3.66)), cy:Y(48.2), r:4, fill:'#2f5aa1'}, svg); txt(svg, X(Math.log10(3.66)) - 6, Y(48.2) - 6, T('Voyager HGA 48.2','HGA «Вояджера» 48,2'), 'svg-small', 'end');
  ns('circle', {cx:X(Math.log10(70)), cy:Y(74.01), r:4, fill:'#2f5aa1'}, svg); txt(svg, X(Math.log10(70)) - 6, Y(74.01) - 6, T('DSS 70 m 74.0','DSS 70 м 74,0'), 'svg-small', 'end');
  ns('circle', {cx:X(+bmD.value), cy:Y(Bm.g), r:5, fill:'#b5452a'}, svg);
  var spot = Bm.bw*Math.PI/180*48.62*AU;
  cells(document.getElementById('beamReadout'), [
    [T('GAIN','УСИЛЕНИЕ'), fmt(Bm.g, 1) + T(' dBi',' дБи')],
    [T('BEAMWIDTH','ШИРИНА ЛУЧА'), Bm.bw < 0.1 ? fmt(Bm.bw*1000, 1) + T(' millideg',' мград') : fmt(Bm.bw, 2) + '°'],
    [T('SPOT SIZE AT 48.6 AU','ПЯТНО НА 48,6 а.е.'), fmt(spot/1e6, 1) + T(' million km',' млн км')],
    [T('WAVELENGTH','ДЛИНА ВОЛНЫ'), fmt(lambda(f)*100, 2) + T(' cm',' см')]
  ]);
  document.getElementById('beamStatus').innerHTML = T('Every factor of two in diameter or frequency: +6 dB of gain, half the beamwidth, and twice the pointing accuracy needed.','Каждое удвоение диаметра или частоты: +6 дБ усиления, вдвое уже луч и вдвое более точное наведение.');
}
[bmD, bmF].forEach(function(el){ el.addEventListener('input', renderBeam); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1977', 'Voyager 1 and 2 launch [1].', 'Старт «Вояджеров-1» и «-2» [1].'],
  ['1996', '<b>1 January:</b> Voyager 2 at 48.62 AU — the JPL design table used here: −145.5 dBm received at a 70-m dish [1].', '<b>1 января:</b> «Вояджер-2» на 48,62 а.е. — расчётная таблица JPL, использованная здесь: −145,5 дБм на 70-метровой антенне [1].'],
  ['2007–11', 'Planned end of 1,400 bit/s playback on a 70-m dish for Voyager [1].', 'Плановое окончание воспроизведения 1400 бит/с на 70-метровой антенне для «Вояджера» [1].'],
  ['2024–29', 'Planned end of 160 bit/s on a 34-m antenna [1].', 'Плановое окончание 160 бит/с на 34-метровой антенне [1].'],
  ['2026', '<b>18 November:</b> Voyager 1 reaches one light-day from Earth, about 25.9 billion km [3].', '<b>18 ноября:</b> «Вояджер-1» достигает одного светового дня от Земли, около 25,9 млрд км [3].'],
  ['2035', '<b>November:</b> Voyager 2 is expected to reach one light-day [3].', '<b>Ноябрь:</b> «Вояджер-2» должен достичь одного светового дня [3].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'R. Ludwig, J. Taylor (2002), Voyager Telecommunications, DESCANSO Design and Performance Summary Series, JPL', url:'https://descanso.jpl.nasa.gov/DPSummary/Descanso4--Voyager_new.pdf', note:{en:'X-band 8,415/8,420 MHz; 3.66 m HGA, ~48 dBi; X-TWTA 12/18 W; data-rate capability end dates; downlink and telemetry design control tables for Voyager 2 on 1 January 1996 (48.62 AU, −145.5 dBm, 21.12 K, 39.9 dB-Hz, 13.3 dB margin at 160 bps).', ru:'Диапазон X 8415/8420 МГц; HGA 3,66 м, ~48 дБи; ЛБВ X 12/18 Вт; сроки работы скоростей передачи; расчётные таблицы радиолинии и телеметрии «Вояджера-2» на 1 января 1996 (48,62 а.е., −145,5 дБм, 21,12 К, 39,9 дБ·Гц, запас 13,3 дБ при 160 бит/с).'}},
  {title:'JPL, DSN Telecommunications Link Design Handbook 810-005, Module 101 (Rev. G): 70-m Subnet Telecommunications Interfaces', url:'https://deepspace.jpl.nasa.gov/dsndocs/810-005/101/101G.pdf', note:{en:'The three 70-m antennas DSS-14 (Goldstone), DSS-43 (Canberra), DSS-63 (Madrid); cryogenic X-band receive path; gain and noise temperature.', ru:'Три 70-метровые антенны DSS-14 (Голдстоун), DSS-43 (Канберра), DSS-63 (Мадрид); криогенный приёмный тракт диапазона X; усиление и шумовая температура.'}},
  {title:'NASA Science (2026), “Voyager 1: What Is a Light-Day”', url:'https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/', note:{en:'Voyager 1 reaches one light-day (about 26 billion km) on 18 November 2026; Voyager 2 in November 2035.', ru:'«Вояджер-1» достигает одного светового дня (около 26 млрд км) 18 ноября 2026; «Вояджер-2» — в ноябре 2035.'}},
  {title:'JPL (2015), DSN Telecommunications Link Design Handbook 810-005, Module 105: Atmospheric and Environmental Effects', url:'https://deepspace.jpl.nasa.gov/dsndocs/810-005/105/105E.pdf', note:{en:'Weather and rain statistics; Ka-band atmospheric noise temperature increases.', ru:'Статистика погоды и дождей; рост атмосферной шумовой температуры в диапазоне Ka.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderLb();
  renderBeam();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__link = {budget:budget, gain:gain, spaceLoss:spaceLoss, beam:beam, AU:AU};
