/* ============ CONSTANTS ============ */
var C = 299792458;                                               // m/s, exact
var GM_SUN = 1.32712e20;                                         // m³/s² — NSSDC Sun fact sheet: 132,712 × 10⁶ km³/s² [11]
var M_SUN = 1.9885e30, L_SUN = 3.828e26;                         // kg, W [11]
var T_SUN = GM_SUN/(C*C*C);                                      // GM☉/c³ ≈ 4.9255 µs
var E_SUN = M_SUN*C*C;                                           // M☉c² in joules
var PC = 648000/Math.PI*149597870700;                            // parsec in metres (IAU definition from the exact au)
var YEAR = 365.25*86400;
var PROTON_D = 2*0.84075e-15;                                    // m — CODATA 2022 proton rms charge radius × 2 [3]
var LASER = 1064e-9;                                             // m — Advanced LIGO's Nd:YAG laser [1]

/* Superscript exponents and scientific notation (decimal comma in Russian through fmt) */
var SUP = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
function sup(n){ return String(n).split('').map(function(ch){ return SUP[ch] || ch; }).join(''); }
function sci(x, d){
  if(x === 0) return '0';
  var e = Math.floor(Math.log10(Math.abs(x))), m = x/Math.pow(10, e);
  if(Math.abs(+m.toFixed(d)) >= 10){ e += 1; m = x/Math.pow(10, e); }
  return fmt(m, d) + ' × 10' + sup(e);
}

/* Integers: EN groups with commas; RU groups only from five digits (9257, but 203 000), matching the body text */
function num(n){ var r = Math.round(Math.abs(n)); return (lang === 'ru' && r < 10000) ? (n < 0 ? '−' : '') + r : fmtInt(n); }
/* Two significant figures between 0.1 and 10, whole numbers above */
function sig2(x){ return x < 10 ? fmt(x, x < 1 ? 2 : 1) : num(x); }
/* nice axis step: 1, 2 or 5 × 10ⁿ, at least the given size */
function niceStep(x){ var p = Math.pow(10, Math.floor(Math.log10(x))), m = x/p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10)*p; }

/* ---- strain ---- */
function strain(h, L){ var d = h*L; return {dL:d, perArm:d/2, protonRatio:PROTON_D/(d/2), lightTime:L/C}; }

/* ---- chirp (leading order, detector-frame masses) [1][9] ---- */
function tauOf(Mc, f){ return 5/256*Math.pow(T_SUN*Mc, -5/3)*Math.pow(Math.PI*f, -8/3); }        // seconds to coalescence
function fOfTau(Mc, tau){ return Math.pow(256*tau/5, -3/8)*Math.pow(T_SUN*Mc, -5/8)/Math.PI; }   // inverse of tauOf
function cycles(Mc, f1, f2){ return Math.pow(T_SUN*Mc, -5/3)*(Math.pow(f1, -5/3) - Math.pow(f2, -5/3))/(32*Math.pow(Math.PI, 8/3)); }
function fdot(Mc, f){ return 96/5*Math.pow(Math.PI, 8/3)*Math.pow(T_SUN*Mc, 5/3)*Math.pow(f, 11/3); }
function mcFromF(f, fd){ return Math.pow(5/96*Math.pow(Math.PI, -8/3)*Math.pow(f, -11/3)*fd, 3/5)/T_SUN; }
function mtotEqual(Mc){ return Mc*Math.pow(2, 6/5); }                                               // m₁ = m₂
function fIsco(M){ return 1/(Math.pow(6, 1.5)*Math.PI*T_SUN*M); }                                   // ≈ 4.4 kHz × (M☉/M) [9]
function separation(M, fOrb){ var w = 2*Math.PI*fOrb; return Math.pow(GM_SUN*M/(w*w), 1/3); }      // Newtonian point masses
function chirp(Mc, f0){
  var M = mtotEqual(Mc), fe = fIsco(M), out = {M:M, fEnd:fe, past:f0 >= fe};
  if(!out.past){ out.band = tauOf(Mc, f0) - tauOf(Mc, fe); out.tc = tauOf(Mc, f0); out.n = cycles(Mc, f0, fe); }
  return out;
}

/* ---- energy of GW150914 [1][11] ---- */
var GW150914 = {Erad:3.0, peakMsunPerS:200, peakW:3.6e49, Mpc:410};
function energy(){
  var E = GW150914.Erad*E_SUN, P = GW150914.peakMsunPerS*E_SUN, life = L_SUN*1e10*YEAR;
  return {E:E, P:P, suns:P/L_SUN, lifetimes:E/life};
}

/* ---- Hulse–Taylor pulsar, Peters–Mathews decay [13] ---- */
var B1913 = {Pb:0.322997448918, e:0.6171340, mp:1.438, mc:1.390, obs:-2.398e-12, obsErr:0.004e-12, gr:-2.40263e-12, ratio:0.9983, ratioErr:0.0016};
function fe(e){ var e2 = e*e; return (1 + 73/24*e2 + 37/96*e2*e2)/Math.pow(1 - e2, 3.5); }
function pdot(PbDays, e, mp, mc){
  var Pb = PbDays*86400;
  return -192*Math.PI/5*Math.pow(2*Math.PI*T_SUN/Pb, 5/3)*fe(e)*mp*mc/Math.pow(mp + mc, 1/3);
}
function shiftAfter(pd, PbDays, years){ var t = years*YEAR; return 0.5*pd/(PbDays*86400)*t*t; }       // seconds
function semiMajor(PbDays, M){ var Pb = PbDays*86400; return Math.pow(GM_SUN*M*Pb*Pb/(4*Math.PI*Math.PI), 1/3); }
function shrinkPerYear(PbDays, M, pd){ return 2/3*semiMajor(PbDays, M)*pd/(PbDays*86400)*YEAR; }   // metres per year (negative)

/* ---- detector bands (Hz) ---- */
var BANDS = [
  {k:'pta', en:'pulsar timing', ru:'хронометраж пульсаров', lo:1/(15*YEAR), hi:1e-7, approx:true},
  {k:'lisa', en:'LISA', ru:'LISA', lo:1e-4, hi:0.1},
  {k:'ground', en:'LIGO · Virgo · KAGRA', ru:'LIGO · Virgo · KAGRA', lo:10, hi:2000}
];
function cap(x){ return x.charAt(0).toUpperCase() + x.slice(1); }
function bandOf(f){ for(var i = 0; i < BANDS.length; i++) if(f >= BANDS[i].lo && f <= BANDS[i].hi) return BANDS[i]; return null; }

/* ---- speed of gravity from GW170817 [16] ---- */
function speedBound(dt, Dmpc){ return dt/(Dmpc*1e6*PC/C); }

/* ============ CH1 — STRAIN ============ */
var stH = document.getElementById('stH'), stL = 4000, stName = 'LIGO', stPhase = 0;
function stDraw(){
  var h = Math.pow(10, +stH.value), s = strain(h, stL), svg = document.getElementById('stSvg');
  svg.innerHTML = '';
  svg.setAttribute('aria-label', T('A ring of free-floating test masses stretched and squeezed by a passing wave, and the arm-length change on a logarithmic ruler','Кольцо свободных пробных масс, растягиваемое и сжимаемое проходящей волной, и изменение длины плеча на логарифмической линейке'));
  var cx = 240, cy = 112, R = 72, A = 0.28*Math.sin(stPhase), i;
  ns('line', {x1:cx - 110, y1:cy, x2:cx + 110, y2:cy, stroke:'#e4e4de'}, svg);
  ns('line', {x1:cx, y1:cy - 100, x2:cx, y2:cy + 100, stroke:'#e4e4de'}, svg);
  ns('circle', {cx:cx, cy:cy, r:R, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'3 3'}, svg);
  for(i = 0; i < 16; i++){
    var a = i/16*2*Math.PI, x = R*Math.cos(a), y = R*Math.sin(a);
    ns('circle', {cx:cx + x*(1 + A), cy:cy + y*(1 - A), r:5, fill:'#2f5aa1'}, svg);
  }
  txt(svg, 12, 18, T('test masses, deformation ×10²⁰','пробные массы, деформация ×10²⁰'), 'svg-small');
  /* log ruler: 10⁻²² m … 10¹⁰ m */
  var L0 = 30, R0 = 450, Y = 262, lo = -22, hi = 10;
  function X(m){ return L0 + (Math.log10(m) - lo)/(hi - lo)*(R0 - L0); }
  ns('line', {x1:L0, y1:Y, x2:R0, y2:Y, stroke:'#0b0b0c'}, svg);
  for(i = lo; i <= hi; i += 4){ ns('line', {x1:X(Math.pow(10, i)), y1:Y - 4, x2:X(Math.pow(10, i)), y2:Y + 4, stroke:'#0b0b0c'}, svg); var tl = txt(svg, X(Math.pow(10, i)), Y + 18, '10' + sup(i), 'svg-small', 'middle'); if((i - lo) % 8) tl.setAttribute('class', 'svg-small tick-alt'); }
  var marks = [
    [s.perArm, T('each arm moves','сдвиг плеча'), '#b5452a', -1],
    [PROTON_D, T('proton','протон'), '#0b0b0c', 1],
    [LASER, T('laser wavelength','длина волны лазера'), '#0b0b0c', 1],
    [stL, T('arm','плечо'), '#0b0b0c', -1]
  ];
  /* all tick lines first, then haloed labels on top, so no line runs through a label */
  marks.forEach(function(m){ var x = X(m[0]), yy = m[3] < 0 ? Y - 30 : Y - 52; ns('line', {x1:x, y1:yy + 6, x2:x, y2:Y, stroke:m[2], 'stroke-width':m[2] === '#b5452a' ? 2.5 : 1}, svg); });
  marks.forEach(function(m){ var yy = m[3] < 0 ? Y - 30 : Y - 52; txt(svg, X(m[0]), yy, m[1], (m[2] === '#b5452a' ? 'svg-label' : 'svg-small') + ' svg-halo', 'middle'); });
  txt(svg, R0, Y + 34, T('metres, logarithmic: each tick is 10⁴ times the last','метры, логарифмическая шкала: каждое деление в 10⁴ раз больше предыдущего'), 'svg-small', 'end');
}
function renderSt(){
  var h = Math.pow(10, +stH.value), s = strain(h, stL);
  document.getElementById('stHVal').textContent = sci(h, 1);
  document.getElementById('stPre').setAttribute('aria-label', T('Detector arm','Плечо детектора'));
  stDraw();
  cells(document.getElementById('stReadout'), [
    [T('ARM LENGTH','ДЛИНА ПЛЕЧА'), stL >= 1e6 ? fmt(stL/1e9, 1) + T(' million km',' млн км') : num(stL/1000) + T(' km',' км')],
    [T('ΔL = h·L','ΔL = h·L'), sci(s.dL, 1) + T(' m',' м')],
    [T('EACH ARM MOVES','СДВИГ КАЖДОГО ПЛЕЧА'), '± ' + sci(s.perArm, 1) + T(' m',' м')],
    [T('vs PROTON WIDTH','ОТНОСИТЕЛЬНО ДИАМЕТРА ПРОТОНА'), protonStr(s.protonRatio)],
    [T('LIGHT TIME ALONG ONE ARM','ВРЕМЯ ПРОХОДА СВЕТА ПО ПЛЕЧУ'), s.lightTime >= 1 ? fmt(s.lightTime, 2) + T(' s',' с') : fmt(s.lightTime*1e6, 1) + T(' µs',' мкс'), true]
  ]);
  hud1.textContent = sci(h, 1);
  stH.setAttribute('aria-valuetext', T('strain ',' деформация ') + sci(h, 1));
  var wl = LASER/s.perArm, wlStr = wl < 1e10 || wl >= 1e12 ? sci(wl, 1) : num(wl/1e9) + T(' billion',' млрд');
  var space = stL > 1e6, frac = s.protonRatio >= 1;
  var amount = frac ? (s.protonRatio < 10 ? fmt(1/s.protonRatio, 2) : s.protonRatio >= 1e5 ? sci(1/s.protonRatio, 1) : '1/' + num(s.protonRatio)) + T(' of a proton\'s width',' диаметра протона')
                    : sig2(1/s.protonRatio) + T(' proton widths',' ' + ruDiam(1/s.protonRatio) + ' протона');
  document.getElementById('stStatus').innerHTML = space
    ? T('On LISA\'s 2.5-million-km arms each test mass moves <b>' + amount + '</b> — measured between free-floating test masses in different spacecraft, with light whose wavelength is ' + wlStr + ' times ' + (wl >= 1 ? 'larger' : 'smaller') + '.',
        'На плечах LISA длиной 2,5 млн км каждая пробная масса сдвигается на <b>' + amount + '</b> — это измеряют между свободно парящими пробными массами в разных аппаратах светом с длиной волны в ' + wlStr + ' раз ' + (wl >= 1 ? 'больше' : 'меньше') + '.')
    : T('On ' + stName + '\'s ' + num(stL/1000) + ' km arms each mirror moves <b>' + amount + '</b> — measured with light whose wavelength is ' + wlStr + ' times larger.',
        'На плечах ' + stName + ' длиной ' + num(stL/1000) + ' км каждое зеркало сдвигается на <b>' + amount + '</b> — и это измеряют светом с длиной волны в ' + wlStr + ' раз больше.');
}
/* "1/841" below one proton width ("× 8.9 × 10⁻⁷" below 1/100,000), "0.84" near one, "743" above */
function protonStr(r){ return r >= 1e5 ? '× ' + sci(1/r, 1) : r >= 10 ? '1/' + num(r) : r >= 0.1 ? '× ' + fmt(1/r, 1/r < 1 ? 2 : 1) : '× ' + num(1/r); }
/* Russian noun agreement after a number: 1 диаметр, 2–4 диаметра, 5+ диаметров; fractions take диаметра */
function ruDiam(x){ if(Math.round(x) !== x && x < 10) return 'диаметра'; var n = Math.round(x) % 100, d = n % 10; return (n > 10 && n < 20) ? 'диаметров' : d === 1 ? 'диаметр' : (d >= 2 && d <= 4) ? 'диаметра' : 'диаметров'; }
stH.addEventListener('input', renderSt);
Array.prototype.forEach.call(document.querySelectorAll('#stPre .btn'), function(btn){ btn.addEventListener('click', function(){ stL = +this.getAttribute('data-l'); stName = this.textContent.split(' ·')[0]; pressGroup(this.parentNode, this); renderSt(); }); });
if(!reduced()) visibleLoop(document.getElementById('stSvg'), function(dt){ stPhase += dt*2*Math.PI*0.5; stDraw(); });
else stPhase = Math.PI/2;

/* ============ CH3 — CHIRP ============ */
var chM = document.getElementById('chM'), chF = document.getElementById('chF'), audio = null;
function renderCh(){
  var Mc = +chM.value, f0 = +chF.value, r = chirp(Mc, f0), svg = document.getElementById('chSvg');
  document.getElementById('chMVal').textContent = fmt(Mc, Mc < 10 ? 4 : 1) + ' M☉';
  document.getElementById('chFVal').textContent = num(f0) + T(' Hz',' Гц');
  chM.setAttribute('aria-valuetext', T('chirp mass ','чирп-масса ') + document.getElementById('chMVal').textContent.replace('M☉', T('solar masses','масс Солнца')));
  chF.setAttribute('aria-valuetext', document.getElementById('chFVal').textContent);
  document.getElementById('chPre').setAttribute('aria-label', T('Event preset','Событие'));
  document.getElementById('chListen').setAttribute('aria-label', T('Listen','Прослушать'));
  svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Gravitational-wave frequency against time before the innermost stable orbit for the chosen chirp mass','Частота гравитационной волны в зависимости от времени до последней устойчивой орбиты для выбранной чирп-массы'));
  var L = 62, Rr = 462, Tp = 26, B = 238, flo = 10, fhi = 3000;
  function Y(f){ return B - (Math.log10(f) - Math.log10(flo))/(Math.log10(fhi) - Math.log10(flo))*(B - Tp); }
  [10, 30, 100, 300, 1000, 3000].forEach(function(f){ ns('line', {x1:L, y1:Y(f), x2:Rr, y2:Y(f), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(f) + 3, num(f), 'svg-small', 'end'); });
  txt(svg, L, 14, T('frequency, Hz (log scale)','частота, Гц (лог. шкала)'), 'svg-small');
  if(r.past){
    txt(svg, (L + Rr)/2, (Tp + B)/2, T('already past the last stable orbit','уже после последней устойчивой орбиты'), 'svg-label', 'middle');
  } else {
    var tb = r.band;
    function X(s){ return Rr - s/tb*(Rr - L); }                    // s = seconds before the end
    for(var k = 0; k <= 4; k++){ var sv = tb*k/4; txt(svg, X(sv), B + 16, k === 0 ? '0' : '−' + (sv < 1 ? fmt(sv, 2) : fmt(sv, sv < 10 ? 1 : 0)), 'svg-small', k === 0 ? 'end' : 'middle'); }
    txt(svg, Rr, B + 32, T('seconds before the last stable orbit','секунды до последней устойчивой орбиты'), 'svg-small', 'end');
    var d = '', tEnd = tauOf(Mc, r.fEnd), n = 300;
    for(var i = 0; i <= n; i++){ var s = tb*(1 - i/n), f = fOfTau(Mc, tEnd + s); d += (i ? 'L' : 'M') + X(s).toFixed(1) + ' ' + Y(f).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.2}, svg);
    ns('circle', {cx:X(tb), cy:Y(f0), r:5, fill:'#0b0b0c'}, svg);
    ns('circle', {cx:X(0), cy:Y(r.fEnd), r:5, fill:'#b5452a'}, svg);
    txt(svg, X(0) - 8, Y(r.fEnd) - 9, T('last stable orbit ','последняя устойчивая орбита ') + num(r.fEnd) + T(' Hz',' Гц'), 'svg-small svg-halo', 'end');
  }
  var rows = [[T('TOTAL MASS (EQUAL MASSES)','СУММАРНАЯ МАССА (РАВНЫЕ МАССЫ)'), fmt(r.M, r.M < 10 ? 2 : 1) + ' M☉'], [T('LAST STABLE ORBIT','ПОСЛЕДНЯЯ УСТОЙЧИВАЯ ОРБИТА'), num(r.fEnd) + T(' Hz',' Гц')]];
  if(!r.past){
    rows.push([T('TIME TO LAST STABLE ORBIT','ВРЕМЯ ДО ПОСЛЕДНЕЙ УСТОЙЧИВОЙ ОРБИТЫ'), r.band < 10 ? fmt(r.band, 2) + T(' s',' с') : num(r.band) + T(' s',' с')]);
    rows.push([T('TIME TO COALESCENCE (FORMULA)','ВРЕМЯ ДО СЛИЯНИЯ (ПО ФОРМУЛЕ)'), r.tc < 10 ? fmt(r.tc, 2) + T(' s',' с') : num(r.tc) + T(' s',' с')]);
    rows.push([T('WAVE CYCLES TO LAST STABLE ORBIT','ЦИКЛОВ ДО ПОСЛЕДНЕЙ УСТОЙЧИВОЙ ОРБИТЫ'), num(r.n), true]);
    rows.push([T('RISE RATE AT START','СКОРОСТЬ РОСТА В НАЧАЛЕ'), fmt(fdot(Mc, f0), fdot(Mc, f0) < 10 ? 3 : 0) + T(' Hz/s',' Гц/с'), true]);
  }
  cells(document.getElementById('chReadout'), rows);
  hud2.textContent = num(r.fEnd) + T(' Hz',' Гц');
  var tStr = function(x){ return x < 10 ? fmt(x, 2) : num(x); };
  document.getElementById('chStatus').innerHTML = r.past
    ? T('At this chirp mass the pair is already merging below ' + num(f0) + ' Hz.','При такой чирп-массе пара сливается ещё ниже ' + num(f0) + ' Гц.')
    : T('From ' + num(f0) + ' Hz the pair has <b>' + tStr(r.band) + ' s</b> and about ' + num(r.n) + ' cycles left before the last stable orbit at ' + num(r.fEnd) + ' Hz; to coalescence the formula gives ' + tStr(r.tc) + ' s. The real signal keeps rising past that orbit through the merger. Heavier pairs chirp faster and end lower.',
        'С ' + num(f0) + ' Гц у пары остаётся <b>' + tStr(r.band) + ' с</b> и около ' + num(r.n) + ' циклов до последней устойчивой орбиты на ' + num(r.fEnd) + ' Гц; до слияния формула даёт ' + tStr(r.tc) + ' с. Настоящий сигнал продолжает расти и после этой орбиты, вплоть до слияния. Тяжёлые пары «чирпают» быстрее и заканчивают ниже.');
}
function playChirp(slow, shift){
  shift = shift || 1;
  var st = document.getElementById('chStatus'), AC = window.AudioContext || window.webkitAudioContext;
  if(!AC){ st.textContent = T('This browser has no Web Audio, so the chirp cannot be played.','В этом браузере нет Web Audio, поэтому чирп нельзя проиграть.'); return; }
  var Mc = +chM.value, r = chirp(Mc, +chF.value);
  if(r.past){ st.textContent = T('Nothing to play: at this chirp mass the pair merges below the start frequency.','Проигрывать нечего: при такой чирп-массе пара сливается ниже начальной частоты.'); return; }
  if(!audio) audio = new AC();
  if(audio.state === 'suspended') audio.resume();                 // iOS/Safari: unlock on the user's tap
  var W = Math.min(r.band, 4/slow), dur = W*slow, N = 512, fr = new Float32Array(N), gn = new Float32Array(N), tEnd = tauOf(Mc, r.fEnd), i;
  for(i = 0; i < N; i++){ var s = W*(1 - i/(N - 1)), f = fOfTau(Mc, tEnd + s); fr[i] = Math.min(f*shift, 4000); gn[i] = 0.25*Math.pow(f/r.fEnd, 2/3); }
  gn[N - 1] = 0;
  var o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + 0.05;
  o.type = 'sine'; o.connect(g); g.connect(audio.destination);
  o.frequency.setValueCurveAtTime(fr, t0, dur); g.gain.setValueCurveAtTime(gn, t0, dur);
  o.start(t0); o.stop(t0 + dur + 0.05);
  st.innerHTML = T('Playing the last ' + fmt(W, W < 1 ? 2 : 1) + ' s before the last stable orbit' + (shift > 1 ? ', pitch-shifted 4 octaves up (16×) so phone speakers can play it.' : slow > 1 ? ', 4× slower (same pitch).' : ', in real time.'),
                   'Звучат последние ' + fmt(W, W < 1 ? 2 : 1) + ' с до последней устойчивой орбиты' + (shift > 1 ? ', на 4 октавы выше (в 16 раз), чтобы их воспроизвёл динамик телефона.' : slow > 1 ? ', в 4 раза медленнее (высота та же).' : ', в реальном времени.'));
}
chM.addEventListener('input', function(){ pressGroup(document.getElementById('chPre'), null); renderCh(); });
chF.addEventListener('input', function(){ pressGroup(document.getElementById('chPre'), null); renderCh(); });
Array.prototype.forEach.call(document.querySelectorAll('#chPre .btn'), function(btn){ btn.addEventListener('click', function(){ chM.value = this.getAttribute('data-m'); chF.value = this.getAttribute('data-f'); pressGroup(this.parentNode, this); renderCh(); }); });
document.getElementById('chPlay').addEventListener('click', function(){ playChirp(1); });
document.getElementById('chSlow').addEventListener('click', function(){ playChirp(4); });
document.getElementById('chHigh').addEventListener('click', function(){ playChirp(1, 16); });

/* ============ CH4 — ENERGY ============ */
function renderEn(){
  var e = energy();
  document.getElementById('enBody').innerHTML = T(
    '3.0 M☉c² = ' + sci(e.E, 1) + ' J &nbsp;·&nbsp; peak 200 M☉c²/s = ' + sci(e.P, 1) + ' W ≈ ' + sci(e.suns, 0) + ' Suns &nbsp;·&nbsp; ≈ ' + num(Math.round(e.lifetimes/100)*100) + ' times the Sun\'s 10-billion-year output',
    '3,0 M☉c² = ' + sci(e.E, 1) + ' Дж &nbsp;·&nbsp; пик 200 M☉c²/с = ' + sci(e.P, 1) + ' Вт ≈ ' + sci(e.suns, 0) + ' Солнц &nbsp;·&nbsp; ≈ в ' + num(Math.round(e.lifetimes/100)*100) + ' раз больше, чем Солнце излучит за 10 млрд лет');
}

/* ============ CH5 — PULSAR ============ */
var psE = document.getElementById('psE'), psY = document.getElementById('psY');
function renderPs(){
  var e = +psE.value, yr = +psY.value, M = B1913.mp + B1913.mc;
  var pd = pdot(B1913.Pb, e, B1913.mp, B1913.mc), pdRef = pdot(B1913.Pb, B1913.e, B1913.mp, B1913.mc);
  document.getElementById('psEVal').textContent = fmt(e, 3);
  document.getElementById('psYVal').textContent = yr;
  psE.setAttribute('aria-valuetext', T('eccentricity ','эксцентриситет ') + fmt(e, 3));
  psY.setAttribute('aria-valuetext', String(yr));
  document.getElementById('psPre').setAttribute('aria-label', T('Orbit preset','Орбита'));
  var svg = document.getElementById('psSvg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Cumulative shift of periastron time against year, predicted by general relativity','Накопленный сдвиг момента периастра по годам, предсказанный общей теорией относительности'));
  var L = 62, Rr = 462, Tp = 26, B = 236, y0 = 1975, y1 = 2026;
  var minS = Math.min(shiftAfter(pd, B1913.Pb, y1 - y0), shiftAfter(pdRef, B1913.Pb, y1 - y0));
  var step = niceStep(Math.max(2, -minS/5)), bottom = Math.min(-step, Math.floor(minS/step)*step);   /* 4–6 labelled gridlines at any e */
  function X(y){ return L + (y - y0)/(y1 - y0)*(Rr - L); }
  function Yv(s){ return Tp + s/bottom*(B - Tp); }
  for(var s = 0; s >= bottom; s -= step){ ns('line', {x1:L, y1:Yv(s), x2:Rr, y2:Yv(s), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Yv(s) + 3, num(s), 'svg-small', 'end'); }
  [1975, 1985, 1995, 2005, 2015, 2025].forEach(function(y){ txt(svg, X(y), B + 16, String(y), 'svg-small', 'middle'); });
  txt(svg, L, 14, T('shift of periastron time, seconds','сдвиг момента периастра, секунды'), 'svg-small');
  function curve(p, col, dash){ var d = ''; for(var i = 0; i <= 120; i++){ var y = y0 + (y1 - y0)*i/120; d += (i ? 'L' : 'M') + X(y).toFixed(1) + ' ' + Yv(shiftAfter(p, B1913.Pb, y - y0)).toFixed(1); } var a = {d:d, fill:'none', stroke:col, 'stroke-width':2}; if(dash) a['stroke-dasharray'] = '5 4'; ns('path', a, svg); }
  ns('line', {x1:L, y1:Yv(0), x2:Rr, y2:Yv(0), stroke:'#0b0b0c'}, svg);
  txt(svg, Rr, Yv(0) + 14, T('no gravitational waves','без гравитационных волн'), 'svg-small svg-halo', 'end');
  if(Math.abs(e - B1913.e) > 0.0005) curve(pdRef, '#77776f', true);
  curve(pd, '#2f5aa1', false);
  var sh = shiftAfter(pd, B1913.Pb, yr - y0);
  ns('circle', {cx:X(yr), cy:Yv(sh), r:5, fill:'#b5452a'}, svg);
  if(Math.abs(e - B1913.e) > 0.0005){ ns('line', {x1:L + 8, y1:B + 30, x2:L + 30, y2:B + 30, stroke:'#77776f', 'stroke-width':2, 'stroke-dasharray':'5 4'}, svg); txt(svg, L + 36, B + 34, T('B1913+16 as it is (e = 0.617)','B1913+16 как есть (e = 0,617)'), 'svg-small'); }
  var isRef = Math.abs(e - B1913.e) < 0.0005;
  var rows = [
    [T('ENHANCEMENT f(e)','УСИЛЕНИЕ f(e)'), '× ' + fmt(fe(e), 2)],
    [T('PREDICTED Ṗb','ПРЕДСКАЗАННОЕ Ṗb'), sci(pd, 4)],
    [T('SHIFT BY ','СДВИГ К ') + yr, fmt(sh, 1) + T(' s',' с')],
    [T('ORBIT SHRINKS BY','ОРБИТА СОКРАЩАЕТСЯ НА'), fmt(-shrinkPerYear(B1913.Pb, M, pd), 2) + T(' m/yr',' м/год')]
  ];
  if(isRef) rows.push([T('MEASURED ÷ PREDICTED [13]','ИЗМЕРЕНО ÷ ПРЕДСКАЗАНО [13]'), fmt(B1913.ratio, 4) + ' ± ' + fmt(B1913.ratioErr, 4), true]);
  cells(document.getElementById('psReadout'), rows);
  document.getElementById('psStatus').innerHTML = isRef
    ? T('This is the real orbit: general relativity predicts ' + sci(pd, 3) + ' s/s, and timing measured −2.398 × 10⁻¹² — the same to within 0.2 %.','Это реальная орбита: общая теория относительности предсказывает ' + sci(pd, 3) + ' с/с, а измерено −2,398 × 10⁻¹² — совпадение в пределах 0,2 %.')
    : T('Same stars and period, e = ' + fmt(e, 3) + ': the decay is ' + fmt(fe(e)/fe(B1913.e)*100, 0) + ' % of the real orbit\'s. Close passes at periastron are where most of the waves are made.','Те же звёзды и период, e = ' + fmt(e, 3) + ': затухание составляет ' + fmt(fe(e)/fe(B1913.e)*100, 0) + ' % от затухания реальной орбиты. Больше всего волн излучается при тесных сближениях в периастре.');
}
psE.addEventListener('input', function(){ pressGroup(document.getElementById('psPre'), null); renderPs(); });
psY.addEventListener('input', renderPs);
Array.prototype.forEach.call(document.querySelectorAll('#psPre .btn'), function(btn){ btn.addEventListener('click', function(){ psE.value = this.getAttribute('data-e'); pressGroup(this.parentNode, this); renderPs(); }); });

/* ============ CH6 — BANDS ============ */
var bdM = document.getElementById('bdM');
function massStr(M){ return M >= 1e4 ? sci(M, 1) + ' M☉' : fmt(M, M < 10 ? 2 : 0) + ' M☉'; }
function freqStr(f){ return f >= 1 ? (f < 10 ? fmt(f, 2) : num(f)) + T(' Hz',' Гц') : f >= 1e-3 ? fmt(f*1e3, f < 0.01 ? 2 : 1) + T(' mHz',' мГц') : f >= 1e-6 ? fmt(f*1e6, 2) + T(' µHz',' мкГц') : fmt(f*1e9, 2) + T(' nHz',' нГц'); }
function periodStr(s){ return s < 1 ? fmt(s*1000, s < 0.01 ? 2 : 1) + T(' ms',' мс') : s < 120 ? fmt(s, 1) + T(' s',' с') : s < 7200 ? fmt(s/60, 1) + T(' min',' мин') : s < 172800 ? fmt(s/3600, 1) + T(' h',' ч') : fmt(s/86400, 1) + T(' days',' сут'); }
function renderBd(){
  var M = Math.pow(10, +bdM.value), f = fIsco(M), b = bandOf(f), svg = document.getElementById('bdSvg');
  document.getElementById('bdMVal').textContent = massStr(M);
  bdM.setAttribute('aria-valuetext', T('total mass ','суммарная масса ') + massStr(M).replace('M☉', T('solar masses','масс Солнца')));
  document.getElementById('bdPre').setAttribute('aria-label', T('Binary preset','Двойная система'));
  svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Frequency bands of pulsar timing, LISA and ground detectors, with the merger frequency of the chosen binary','Частотные полосы хронометража пульсаров, LISA и наземных детекторов с частотой слияния выбранной пары'));
  var L = 20, Rr = 460, lo = -10, hi = 4;
  function X(v){ return L + (Math.log10(v) - lo)/(hi - lo)*(Rr - L); }
  BANDS.forEach(function(q, i){
    var y = 46 + i*50, x1 = X(q.lo), x2 = X(q.hi);
    ns('rect', {x:x1, y:y, width:x2 - x1, height:30, fill:b === q ? '#2f5aa1' : '#dcdcd5', opacity:b === q ? 0.85 : 1}, svg);
    txt(svg, x2 + 6 > Rr - 120 ? x1 - 6 : x2 + 6, y + 19, T(cap(q.en), cap(q.ru)) + (q.approx ? ' ≈' : ''), 'svg-label', x2 + 6 > Rr - 120 ? 'end' : 'start');
  });
  ns('line', {x1:L, y1:206, x2:Rr, y2:206, stroke:'#0b0b0c'}, svg);
  for(var e = lo; e <= hi; e += 2){ ns('line', {x1:X(Math.pow(10, e)), y1:202, x2:X(Math.pow(10, e)), y2:210, stroke:'#0b0b0c'}, svg); txt(svg, X(Math.pow(10, e)), 226, '10' + sup(e), 'svg-small', 'middle'); }
  txt(svg, Rr, 244, T('gravitational-wave frequency, Hz (log scale)','частота гравитационной волны, Гц (лог. шкала)'), 'svg-small', 'end');
  var xf = X(Math.min(Math.max(f, 1e-10), 1e4));
  ns('line', {x1:xf, y1:30, x2:xf, y2:206, stroke:'#b5452a', 'stroke-width':2.5}, svg);
  txt(svg, xf, 22, freqStr(f), 'svg-label svg-halo', xf > Rr - 60 ? 'end' : xf < L + 60 ? 'start' : 'middle');
  /* frequency ranges the inspiral sweeps through; pulsar timing only for supermassive pairs (lighter binaries form at far shorter periods and are far too faint at nanohertz) */
  var crossed = BANDS.filter(function(q){ return q.lo < f && (q.k !== 'pta' || M >= 1e5); }).map(function(q){ return T('“' + q.en + '”', '«' + q.ru + '»'); });
  cells(document.getElementById('bdReadout'), [
    [T('TOTAL MASS','СУММАРНАЯ МАССА'), massStr(M)],
    [T('LAST STABLE ORBIT','ПОСЛЕДНЯЯ УСТОЙЧИВАЯ ОРБИТА'), freqStr(f)],
    [T('ONE WAVE TAKES','ПЕРИОД ВОЛНЫ'), periodStr(1/f)],
    [T('MERGER HEARD BY','СЛИЯНИЕ СЛЫШИТ'), b ? T(cap(b.en), cap(b.ru)) : T('no detector','ни один детектор')],
    [T('FREQUENCIES THE INSPIRAL SWEEPS (NOT LOUDNESS)','ЧАСТОТЫ, ЧЕРЕЗ КОТОРЫЕ ПРОХОДИТ СБЛИЖЕНИЕ (НЕ ГРОМКОСТЬ)'), crossed.length ? crossed.join(', ') : '—', true]
  ]);
  document.getElementById('bdStatus').innerHTML = b
    ? T('The final orbits of a ' + massStr(M) + ' pair sing at ' + freqStr(f) + ', inside the “' + b.en + '” band.','Последние витки пары массой ' + massStr(M) + ' звучат на ' + freqStr(f) + ' — в полосе «' + b.ru + '».')
    : f > 2000 ? T('Above the ground detectors\' most sensitive range: too light for a black-hole pair — neutron stars like this collide before reaching that orbit, and their inspiral is what the ground detectors hear.','Выше самого чувствительного диапазона наземных детекторов: слишком лёгкая пара для чёрных дыр — такие нейтронные звёзды сталкиваются раньше, и наземные детекторы слышат их сближение.')
    : T('The merger falls in a gap between bands; its earlier, slower inspiral still sweeps through the frequencies of ' + (crossed.length ? crossed.join(', ') : T('no band','ни одной полосы')) + ' — being in a band\'s range is necessary, not sufficient: the signal must also be loud enough.','Слияние попадает в промежуток между полосами; его более раннее и медленное сближение всё же проходит через частоты полос ' + (crossed.length ? crossed.join(', ') : 'ни одной') + ' — попасть в диапазон полосы необходимо, но недостаточно: сигнал должен быть ещё и достаточно громким.');
}
bdM.addEventListener('input', function(){ pressGroup(document.getElementById('bdPre'), null); renderBd(); });
Array.prototype.forEach.call(document.querySelectorAll('#bdPre .btn'), function(btn){ btn.addEventListener('click', function(){ bdM.value = Math.log10(+this.getAttribute('data-m')); pressGroup(this.parentNode, this); renderBd(); }); });
bdM.value = Math.log10(65);
psE.value = B1913.e;                                            // exact 0.6171340, not the HTML's step-rounded 0.617

/* ============ CH7 — SPEED ============ */
function renderSp(){
  var b = speedBound(1.74, 26), tr = 26*1e6*PC/C/YEAR;
  document.getElementById('spBody').innerHTML = T(
    'Δv/c ≲ 1.74 s ÷ (26 Mpc / c ≈ ' + num(Math.round(tr/1e6)) + ' million years) = ' + sci(b, 1) + ' &nbsp;·&nbsp; published: +7 × 10⁻¹⁶',
    'Δv/c ≲ 1,74 с ÷ (26 Мпк / c ≈ ' + num(Math.round(tr/1e6)) + ' млн лет) = ' + sci(b, 1) + ' &nbsp;·&nbsp; опубликовано: +7 × 10⁻¹⁶');
}

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1916', 'Einstein predicts gravitational waves from the linearised field equations [1].', 'Эйнштейн предсказывает гравитационные волны из линеаризованных уравнений поля [1].'],
  ['1957', 'The Chapel Hill conference; until then their physical reality was still debated [1].', 'Конференция в Чапел-Хилле; до неё физическая реальность волн ещё оспаривалась [1].'],
  ['1962', 'Mikhail Gertsenshtein and Vladislav Pustovoit first suggest detecting gravitational waves with a light interferometer [1].', 'Михаил Герценштейн и Владислав Пустовойт впервые предлагают регистрировать гравитационные волны оптическим интерферометром [1].'],
  ['1969', 'Joseph Weber publishes “Evidence for Discovery of Gravitational Radiation” from his resonant bars [7].', 'Джозеф Вебер публикует «Свидетельства открытия гравитационного излучения», полученные на резонансных брусках [7].'],
  ['1972', 'Rainer Weiss works out the noise and performance of a laser-interferometer detector [1].', 'Райнер Вайсс подробно рассчитывает шумы и чувствительность лазерного интерферометра [1].'],
  ['1974', 'Hulse and Taylor discover the binary pulsar PSR 1913+16 at Arecibo [12].', 'Халс и Тейлор открывают двойной пульсар PSR 1913+16 в Аресибо [12].'],
  ['1989', 'Drever, Raab, Thorne, Vogt and Weiss propose LIGO [1].', 'Древер, Рааб, Торн, Фогт и Вайсс предлагают проект LIGO [1].'],
  ['1993', 'Nobel Prize in Physics to Hulse and Taylor [12].', 'Нобелевская премия по физике — Халсу и Тейлору [12].'],
  ['2002–11', 'TAMA 300, GEO 600, LIGO and Virgo observe together and set upper limits [1].', 'TAMA 300, GEO 600, LIGO и Virgo наблюдают вместе и устанавливают верхние пределы [1].'],
  ['2015', '<b>14 September:</b> GW150914, the first direct detection, from two merging black holes [1].', '<b>14 сентября:</b> GW150914 — первая прямая регистрация, слияние двух чёрных дыр [1].'],
  ['2016', 'Weisberg and Huang: 35 years of timing match general relativity to 0.9983 ± 0.0016 [13].', 'Вайсберг и Хуан: 35 лет тайминга совпадают с общей теорией относительности с точностью 0,9983 ± 0,0016 [13].'],
  ['2017', '<b>17 August:</b> GW170817, two neutron stars, seen also as GRB 170817A and a kilonova [10][17]. <b>October:</b> Nobel Prize to Weiss, Barish and Thorne [8].', '<b>17 августа:</b> GW170817 — две нейтронные звезды, видимые также как GRB 170817A и килоновая [10][17]. <b>Октябрь:</b> Нобелевская премия Вайссу, Бэришу и Торну [8].'],
  ['2020', 'GW190521, recorded on 21 May 2019, is published: about 7.6 solar masses radiated, the most energetic event recorded to that date [20].', 'Опубликовано событие GW190521, записанное 21 мая 2019 года: излучено около 7,6 массы Солнца — самое энергичное из зарегистрированных к тому времени [20].'],
  ['2023', 'NANOGrav reports evidence for a nanohertz gravitational-wave background [15].', 'NANOGrav сообщает о свидетельствах наногерцевого гравитационно-волнового фона [15].'],
  ['2024', '<b>25 January:</b> ESA adopts LISA, launch planned for 2035 [6].', '<b>25 января:</b> ЕКА утверждает LISA, запуск запланирован на 2035 год [6].'],
  ['2025', '<b>18 November:</b> O4 ends after about 300 significant signals [18].', '<b>18 ноября:</b> завершается O4 — около 300 значимых сигналов [18].'],
  ['2026', '<b>5 May:</b> with NASA\'s share in doubt, ESA orders back-up LISA telescopes from Thales Alenia Space [21]. Upgrades; a six-month run, IR1, planned from early to mid-November [19].', '<b>5 мая:</b> из-за неопределённости с вкладом NASA ЕКА заказывает у Thales Alenia Space запасной вариант телескопов LISA [21]. Модернизация; шестимесячный цикл IR1 запланирован с начала–середины ноября [19].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'B. P. Abbott et al. (LIGO Scientific and Virgo Collaborations) (2016), “Observation of Gravitational Waves from a Binary Black Hole Merger”, Phys. Rev. Lett. 116, 061102', url:'https://arxiv.org/abs/1602.03837', note:{en:'14 Sep 2015, 09:50:45 UTC; 35 → 250 Hz; peak strain 1.0 × 10⁻²¹; L1 6.9 ms before H1; 8 cycles in 0.2 s; chirp mass ≃ 30 M☉; 36 + 29 → 62 M☉; 3.0 M☉c² radiated; peak 3.6 × 10⁵⁶ erg/s = 200 M☉c²/s; 410 Mpc; SNR 24; FAR < 1/203,000 yr, > 5.1σ; 4 km arms, 1064 nm, 20 W → 700 W → 100 kW; isolation above 10 Hz; history from Einstein 1916 and Weber.', ru:'14 сент. 2015, 09:50:45 UTC; 35 → 250 Гц; пиковая деформация 1,0 × 10⁻²¹; L1 на 6,9 мс раньше H1; 8 циклов за 0,2 с; чирп-масса ≃ 30 M☉; 36 + 29 → 62 M☉; излучено 3,0 M☉c²; пик 3,6 × 10⁵⁶ эрг/с = 200 M☉c²/с; 410 Мпк; с/ш 24; ложные тревоги < 1/203 000 лет, > 5,1σ; плечи 4 км, 1064 нм, 20 Вт → 700 Вт → 100 кВт; изоляция выше 10 Гц; история от Эйнштейна (1916) и Вебера.'}},
  {title:'Gravitational Wave Open Science Center, “GW150914 Factsheet”', url:'https://gwosc.org/s/events/GW150914/GW150914-FactSheet-BW.pdf', note:{en:'Peak displacement of the interferometer arms ±0.002 fm; ~200 ms and ~10 cycles from 30 Hz; peak speed of the black holes ~0.6c.', ru:'Пиковое смещение плеч интерферометра ±0,002 фм; ~200 мс и ~10 циклов от 30 Гц; пиковая скорость чёрных дыр ~0,6c.'}},
  {title:'NIST, CODATA 2022, “proton rms charge radius”', url:'https://physics.nist.gov/cgi-bin/cuu/Value?rp', note:{en:'r<sub>p</sub> = 8.4075(64) × 10⁻¹⁶ m.', ru:'r<sub>p</sub> = 8,4075(64) × 10⁻¹⁶ м.'}},
  {title:'Virgo Collaboration, “The Virgo detector”', url:'https://www.virgo-gw.eu/science/detector/', note:{en:'Two perpendicular 3 km arms; European Gravitational Observatory near Pisa, Italy.', ru:'Два перпендикулярных плеча по 3 км; Европейская гравитационная обсерватория около Пизы, Италия.'}},
  {title:'NAOJ Gravitational Wave Project Office, “KAGRA Project”', url:'https://gwpo.nao.ac.jp/en/research/kagra.html', note:{en:'3 km arms in the Kamioka mine, Gifu; sapphire mirrors cooled to 20 K (−250 °C).', ru:'Плечи 3 км в шахте Камиока, Гифу; сапфировые зеркала, охлаждённые до 20 К (−250 °C).'}},
  {title:'ESA (2024), “Capturing the ripples of spacetime: LISA gets go-ahead”, 25 January 2024', url:'https://www.esa.int/Science_Exploration/Space_Science/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead', note:{en:'Adopted 25 Jan 2024; three spacecraft, triangle sides 2.5 million km; launch planned 2035 on Ariane 6; NASA provides lasers, telescopes and UV light sources.', ru:'Утверждена 25 янв. 2024; три аппарата, стороны треугольника 2,5 млн км; запуск запланирован на 2035 год на Ariane 6; NASA поставляет лазеры, телескопы и УФ-источники.'}},
  {title:'J. Weber (1969), “Evidence for Discovery of Gravitational Radiation”, Phys. Rev. Lett. 22, 1320', url:'https://doi.org/10.1103/PhysRevLett.22.1320', note:{en:'Weber\'s report from his resonant-bar detectors, 16 June 1969.', ru:'Сообщение Вебера по данным его резонансных детекторов, 16 июня 1969.'}},
  {title:'NobelPrize.org, “The Nobel Prize in Physics 2017”', url:'https://www.nobelprize.org/prizes/physics/2017/summary/', note:{en:'One half to Rainer Weiss, the other half jointly to Barry C. Barish and Kip S. Thorne, “for decisive contributions to the LIGO detector and the observation of gravitational waves”.', ru:'Половина — Райнеру Вайссу, другая половина совместно — Барри Бэришу и Кипу Торну «за решающий вклад в создание детектора LIGO и наблюдение гравитационных волн».'}},
  {title:'LIGO Scientific and Virgo Collaborations (2017), “The basic physics of the binary black hole merger GW150914”, Ann. Phys. (Berlin) 529, 1600209', url:'https://arxiv.org/abs/1608.01940', note:{en:'Chirp mass from f and ḟ, and the integrated form f<sup>−8/3</sup>(t) = (8π)<sup>8/3</sup>/5·(G𝓜/c³)<sup>5/3</sup>·(t<sub>c</sub> − t); 𝓜 = 30 M☉ adopted; innermost-stable-orbit frequency 4.4 kHz × (M☉/M) for a non-spinning black hole.', ru:'Чирп-масса по f и ḟ и интегральная форма f<sup>−8/3</sup>(t) = (8π)<sup>8/3</sup>/5·(G𝓜/c³)<sup>5/3</sup>·(t<sub>c</sub> − t); принято 𝓜 = 30 M☉; частота последней устойчивой орбиты 4,4 кГц × (M☉/M) для невращающейся чёрной дыры.'}},
  {title:'B. P. Abbott et al. (2017), “GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral”, Phys. Rev. Lett. 119, 161101', url:'https://arxiv.org/abs/1710.05832', note:{en:'17 Aug 2017, ended 12:41:04.4 UTC; ~100 s in band from 24 Hz; ~3000 cycles; detector-frame chirp mass 1.1977 M☉; total 2.74 M☉; 40 Mpc; SNR 32.4; data shown band-passed 30 Hz – 2 kHz.', ru:'17 авг. 2017, окончание в 12:41:04,4 UTC; ~100 с в полосе от 24 Гц; ~3000 циклов; чирп-масса в системе детектора 1,1977 M☉; суммарно 2,74 M☉; 40 Мпк; с/ш 32,4; данные показаны в полосе 30 Гц — 2 кГц.'}},
  {title:'NASA NSSDC, “Sun Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note:{en:'Mass 1,988,500 × 10²⁴ kg; GM 132,712 × 10⁶ km³/s²; luminosity 382.8 × 10²⁴ J/s.', ru:'Масса 1 988 500 × 10²⁴ кг; GM 132 712 × 10⁶ км³/с²; светимость 382,8 × 10²⁴ Дж/с.'}},
  {title:'NobelPrize.org, “The Nobel Prize in Physics 1993 — Press release”', url:'https://www.nobelprize.org/prizes/physics/1993/press-release/', note:{en:'Hulse and Taylor discovered the first binary pulsar, PSR 1913+16, in 1974 with the 300 m Arecibo radio telescope; prize “for the discovery of a new type of pulsar”.', ru:'Халс и Тейлор открыли первый двойной пульсар PSR 1913+16 в 1974 году на 300-метровом радиотелескопе Аресибо; премия «за открытие пульсара нового типа».'}},
  {title:'J. M. Weisberg, Y. Huang (2016), “Relativistic Measurements from Timing the Binary Pulsar PSR B1913+16”, ApJ 829, 55', url:'https://arxiv.org/abs/1606.02744', note:{en:'9,257 arrival times over 35 years; m<sub>p</sub> = 1.438, m<sub>c</sub> = 1.390 M☉; e = 0.6171340; P<sub>b</sub> = 0.322997448918 d; Ṗ<sub>b</sub> observed −2.423 × 10⁻¹², intrinsic −2.398(4) × 10⁻¹², GR −2.40263 × 10⁻¹²; ratio 0.9983 ± 0.0016.', ru:'9257 моментов прихода за 35 лет; m<sub>p</sub> = 1,438, m<sub>c</sub> = 1,390 M☉; e = 0,6171340; P<sub>b</sub> = 0,322997448918 сут; Ṗ<sub>b</sub> наблюдаемое −2,423 × 10⁻¹², собственное −2,398(4) × 10⁻¹², ОТО −2,40263 × 10⁻¹²; отношение 0,9983 ± 0,0016.'}},
  {title:'ESA Cosmos, “LISA”', url:'https://www.cosmos.esa.int/web/lisa', note:{en:'Designed to measure gravitational radiation from about 0.1 mHz to 0.1 Hz.', ru:'Рассчитана на измерение гравитационного излучения примерно от 0,1 мГц до 0,1 Гц.'}},
  {title:'G. Agazie et al. (NANOGrav) (2023), “The NANOGrav 15 yr Data Set: Evidence for a Gravitational-wave Background”, ApJL 951, L8', url:'https://arxiv.org/abs/2306.16213', note:{en:'67 pulsars over 15 years; Hellings–Downs correlations at about 3.5–4σ; amplitude 2.4 × 10⁻¹⁵ at 1/(1 yr); consistent with supermassive black-hole binaries.', ru:'67 пульсаров за 15 лет; корреляции Хеллингса — Даунса примерно на уровне 3,5–4σ; амплитуда 2,4 × 10⁻¹⁵ на частоте 1/(1 год); согласуется с двойными сверхмассивными чёрными дырами.'}},
  {title:'B. P. Abbott et al. (2017), “Gravitational Waves and Gamma-Rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A”, ApJL 848, L13', url:'https://arxiv.org/abs/1710.05834', note:{en:'GRB 170817A arrived 1.74 ± 0.05 s after the merger; with D = 26 Mpc and emission up to 10 s later, −3 × 10⁻¹⁵ ≤ Δv/c ≤ +7 × 10⁻¹⁶.', ru:'GRB 170817A пришёл через 1,74 ± 0,05 с после слияния; при D = 26 Мпк и излучении до 10 с позже −3 × 10⁻¹⁵ ≤ Δv/c ≤ +7 × 10⁻¹⁶.'}},
  {title:'B. P. Abbott et al. (2017), “Multi-messenger Observations of a Binary Neutron Star Merger”, ApJL 848, L12', url:'https://arxiv.org/abs/1710.05833', note:{en:'Optical counterpart in NGC 4993 found less than 11 hours after the merger; followed in ultraviolet, optical, infrared, X-rays (~9 days) and radio (~16 days).', ru:'Оптический источник в NGC 4993 найден менее чем через 11 часов после слияния; наблюдался в ультрафиолете, оптике, инфракрасном, рентгене (~9 сут) и радио (~16 сут).'}},
  {title:'KAGRA / ICRR Gravitational Wave Center (2025), “Completion of LIGO-Virgo-KAGRA\'s Fourth Observing Run”', url:'https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069', note:{en:'O4 ran from 25 May 2023, 00:00 JST, to 19 November 2025, 01:00 JST (24 May and 18 November UTC); about 300 significant signals; O5 then planned for 2028.', ru:'O4 шёл с 25 мая 2023, 00:00 JST, по 19 ноября 2025, 01:00 JST (24 мая и 18 ноября по UTC); около 300 значимых сигналов; O5 тогда планировался на 2028 год.'}},
  {title:'LIGO, Virgo and KAGRA, “Observing Run Plans” (updated 3 September 2026)', url:'https://observing.docs.ligo.org/plan', note:{en:'Checked 11 Oct 2026; the page says its next update is due 15 Oct 2026. Six-month Intermediate Run 1 (IR1) planned to begin early to mid-November 2026, with both LIGO detectors, Virgo with possible interruptions and KAGRA joining later; O5 plans in discussion.', ru:'Проверено 11 окт. 2026; следующее обновление страницы обещано 15 окт. 2026. Шестимесячный промежуточный цикл IR1 планируется начать в начале–середине ноября 2026 года с обоими детекторами LIGO, Virgo с возможными перерывами и KAGRA, который присоединится позже; планы O5 обсуждаются.'}},
  {title:'LIGO Scientific and Virgo Collaborations (2020), “Properties and Astrophysical Implications of the 150 M☉ Binary Black Hole Merger GW190521”, ApJL 900, L13', url:'https://arxiv.org/abs/2009.01190', note:{en:'Radiated energy 7.6 (+2.2/−1.9) M☉c², “making GW190521 the most energetic GW event recorded to date”; peak luminosity 3.7 × 10⁵⁶ erg/s; remnant 142 M☉.', ru:'Излучённая энергия 7,6 (+2,2/−1,9) M☉c² — «самое энергичное гравитационно-волновое событие из зарегистрированных на сегодня»; пиковая светимость 3,7 × 10⁵⁶ эрг/с; остаток 142 M☉.'}},
  {title:'European Spaceflight (2026), “ESA Begins Developing Replacements for NASA\'s Contributions to LISA”, 8 May 2026', url:'https://europeanspaceflight.com/esa-begins-developing-replacements-for-nasas-contributions-to-lisa/', note:{en:'€26.1 million contract to Thales Alenia Space on 5 May 2026 for LISA\'s telescopes; the White House FY2026 request sought to end NASA\'s LISA support, Congress restored $80.5 million, the FY2027 request again proposes cuts; ESA: “budget discussions are ongoing”, risk mitigation started.', ru:'Контракт на 26,1 млн евро с Thales Alenia Space от 5 мая 2026 года на телескопы LISA; бюджетный запрос Белого дома на 2026 ф. г. предлагал прекратить участие NASA, Конгресс восстановил 80,5 млн долларов, запрос на 2027 ф. г. снова предлагает сокращения; ЕКА: «обсуждение бюджета продолжается», начаты меры по снижению рисков.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderSt(); renderCh(); renderEn(); renderPs(); renderBd(); renderSp();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__ripple = {C:C, GM_SUN:GM_SUN, T_SUN:T_SUN, E_SUN:E_SUN, L_SUN:L_SUN, PC:PC, YEAR:YEAR, PROTON_D:PROTON_D,
  strain:strain, tauOf:tauOf, fOfTau:fOfTau, cycles:cycles, fdot:fdot, mcFromF:mcFromF, mtotEqual:mtotEqual, fIsco:fIsco, separation:separation, chirp:chirp,
  energy:energy, GW150914:GW150914, B1913:B1913, fe:fe, pdot:pdot, shiftAfter:shiftAfter, semiMajor:semiMajor, shrinkPerYear:shrinkPerYear,
  BANDS:BANDS, bandOf:bandOf, speedBound:speedBound, sci:sci};
