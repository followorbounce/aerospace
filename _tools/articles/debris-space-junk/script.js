/* ============ CONSTANTS ============ */
var MU = 398600.4418, RE = 6378.137, RHO_AL = 2700, J_PER_G = 40;               // 40 J/g: ODQN 13-2 [3]
// approximate mean densities, 1976 U.S. Standard Atmosphere (kg/m³) — log-interpolated
var DENS = [[200,2.541e-10],[250,6.073e-11],[300,1.916e-11],[350,6.98e-12],[400,2.803e-12],[450,1.184e-12],[500,5.215e-13],[600,1.137e-13],[700,3.07e-14],[800,1.136e-14],[900,5.759e-15],[1000,3.561e-15],[1100,2.4e-15]];
function rho(h){ if(h <= DENS[0][0]) return DENS[0][1]*Math.exp((DENS[0][0] - h)/37); for(var i = 1; i < DENS.length; i++){ if(h <= DENS[i][0]){ var a = DENS[i - 1], b = DENS[i], f = (h - a[0])/(b[0] - a[0]); return Math.exp(Math.log(a[1]) + f*(Math.log(b[1]) - Math.log(a[1]))); } } return DENS[DENS.length - 1][1]; }
function vCirc(hKm){ return Math.sqrt(MU/(RE + hKm)); }                            // km/s
function impact(dCm, angDeg, hKm){ var r = dCm/200, m = RHO_AL*4/3*Math.PI*r*r*r, v = 2*vCirc(hKm)*Math.sin(angDeg*Math.PI/360)*1000, E = 0.5*m*v*v; return {m:m, v:v, E:E, shatter:E/J_PER_G/1000}; }
function lifetime(hKm, B, f){                                                     // years, integrate down to 150 km
  var h = hKm, t = 0;
  while(h > 150){ var a = (RE + h)*1000, dadt = B*rho(h)*f*Math.sqrt(MU*1e9*a), dh = h > 400 ? 2 : 0.5; t += dh*1000/dadt; h -= dh; if(t > 3.2e11) return Infinity; }
  return t/(365.25*86400);
}

/* ============ CH2 — IMPACT ============ */
var iD = document.getElementById('iD'), iA = document.getElementById('iA'), iH = document.getElementById('iH');
function eStr(E){ return E >= 1e9 ? fmt(E/1e9, 1) + T(' GJ',' ГДж') : E >= 1e6 ? fmt(E/1e6, 1) + T(' MJ',' МДж') : E >= 1e3 ? fmt(E/1e3, 1) + T(' kJ',' кДж') : fmt(E, 0) + T(' J',' Дж'); }
function mStr(kg){ return kg >= 1000 ? fmt(kg/1000, 1) + T(' t',' т') : kg >= 1 ? fmt(kg, 1) + T(' kg',' кг') : fmt(kg*1000, kg*1000 < 1 ? 3 : 1) + T(' g',' г'); }
function renderImp(){
  var d = Math.pow(10, +iD.value), ang = +iA.value, h = +iH.value, I = impact(d, ang, h);
  document.getElementById('iDVal').textContent = d < 1 ? fmt(d*10, 1) + T(' mm',' мм') : fmt(d, 1) + T(' cm',' см');
  document.getElementById('iAVal').textContent = ang + '°';
  document.getElementById('iHVal').textContent = fmtInt(h) + T(' km',' км');
  var svg = document.getElementById('impSvg'); svg.innerHTML = '';
  var L = 56, R = 465, Tp = 22, B = 230;
  function X(lg){ return L + (lg + 1)/2*(R - L); }
  function Y(E){ return B - (Math.log10(Math.max(E, 0.1)) + 1)/9*(B - Tp); }     // 0.1 J … 100 MJ
  [1,1e3,1e6,1e8].forEach(function(e){ ns('line', {x1:L, y1:Y(e), x2:R, y2:Y(e), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(e) + 3, eStr(e), 'svg-small', 'end'); });
  [0.1,0.3,1,3,10].forEach(function(c){ txt(svg, X(Math.log10(c)), B + 14, c < 1 ? (c*10) + ' mm' : c + ' cm', 'svg-small', 'middle'); });
  txt(svg, R, B + 28, T('fragment diameter (log)','диаметр обломка (лог.)'), 'svg-small', 'end'); txt(svg, L, 13, T('impact energy (log)','энергия удара (лог.)'), 'svg-small');
  [[1, T('to shatter 1 kg','чтобы разбить 1 кг')], [100, T('… 100 kg','… 100 кг')], [1000, T('… 1 t','… 1 т')]].forEach(function(t){ var e = t[0]*J_PER_G*1000; ns('line', {x1:L, y1:Y(e), x2:R, y2:Y(e), stroke:'#b5452a', 'stroke-dasharray':'3 3', opacity:0.6}, svg); txt(svg, L + 4, Y(e) - 4, t[1], 'svg-small'); });
  var dd = ''; for(var lg = -1; lg <= 1.0001; lg += 0.02){ dd += (dd ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(impact(Math.pow(10, lg), ang, h).E).toFixed(1); }
  ns('path', {d:dd, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(+iD.value), cy:Y(I.E), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('impReadout'), [
    [T('FRAGMENT MASS','МАССА ОБЛОМКА'), mStr(I.m)],
    [T('IMPACT SPEED','СКОРОСТЬ УДАРА'), fmt(I.v/1000, 2) + T(' km/s',' км/с')],
    [T('ENERGY','ЭНЕРГИЯ'), eStr(I.E)],
    [T('CAN SHATTER UP TO (40 J/g)','МОЖЕТ РАЗБИТЬ ДО (40 Дж/г)'), mStr(I.shatter)]
  ]);
  hud1.textContent = eStr(I.E);
  document.getElementById('impStatus').innerHTML = I.shatter >= 100
    ? T('<b>Catastrophic:</b> enough to break up a whole small satellite, adding hundreds of new fragments.','<b>Катастрофа:</b> хватит, чтобы разрушить целый небольшой спутник и добавить сотни новых обломков.')
    : I.m < 1e-3 ? T('Too small to track, but enough to pit a window or puncture an unshielded line — the ISS carries shields against particles like this.','Слишком мал, чтобы отслеживать, но способен выбить кратер в иллюминаторе или пробить незащищённую магистраль; на МКС есть экраны от таких частиц.')
    : T('Lethal to whatever part of a spacecraft it hits, even if it cannot shatter the whole thing.','Смертельно для той части аппарата, в которую попадёт, даже если не разрушит его целиком.');
}
[iD, iA, iH].forEach(function(el){ el.addEventListener('input', renderImp); });

/* ============ CH3 — LIFETIME ============ */
var lH = document.getElementById('lH'), lB = document.getElementById('lB'), sunF = 1;
function yStr(y){ return !isFinite(y) || y > 1e4 ? T('> 10,000 years','> 10 000 лет') : y >= 100 ? fmtInt(y) + T(' years',' лет') : y >= 1 ? fmt(y, 1) + T(' years',' лет') : fmtInt(y*365.25) + T(' days',' сут'); }
function renderLife(){
  var h = +lH.value, B = Math.pow(10, +lB.value), Y0 = lifetime(h, B, sunF);
  document.getElementById('lHVal').textContent = fmtInt(h) + T(' km',' км');
  document.getElementById('lBVal').textContent = fmt(B, 3) + T(' m²/kg',' м²/кг');
  var svg = document.getElementById('lifeSvg'); svg.innerHTML = '';
  var L = 72, R = 465, Tp = 22, B2 = 250;
  function X(hh){ return L + (hh - 250)/750*(R - L); }
  function Y(y){ return B2 - (Math.log10(Math.max(y, 0.01)) + 2)/6*(B2 - Tp); }   // 0.01 … 10,000 yr
  [[0.01,'4 d'],[0.1,'1 mo'],[1,'1 yr'],[10,'10 yr'],[100,'100 yr'],[1000,'1,000 yr'],[10000,'10,000 yr']].forEach(function(t){ ns('line', {x1:L, y1:Y(t[0]), x2:R, y2:Y(t[0]), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(t[0]) + 3, t[1], 'svg-small', 'end'); });
  [250,400,600,800,1000].forEach(function(hh){ txt(svg, X(hh), B2 + 14, hh, 'svg-small', 'middle'); });
  txt(svg, R, B2 + 28, T('starting altitude, km','начальная высота, км'), 'svg-small', 'end'); txt(svg, L, 13, T('time to re-enter (log)','время до входа в атмосферу (лог.)'), 'svg-small');
  // NASA statement bands [1]
  ns('rect', {x:X(250), y:Y(10), width:X(600) - X(250), height:Y(1) - Y(10), fill:'#2f5aa1', opacity:0.08}, svg); txt(svg, X(260), Y(10) - 4, T('NASA: < 600 km → several years','NASA: < 600 км → несколько лет'), 'svg-small');
  ns('rect', {x:X(790), y:Y(1000), width:X(810) - X(790), height:Y(100) - Y(1000), fill:'#2f5aa1', opacity:0.2}, svg); txt(svg, X(780), Y(1000) - 4, T('800 km → centuries','800 км → века'), 'svg-small', 'end');
  var d = ''; for(var hh = 250; hh <= 1000; hh += 10){ var y = lifetime(hh, B, sunF); d += (d ? 'L' : 'M') + X(hh).toFixed(1) + ' ' + Y(Math.min(1e4, isFinite(y) ? y : 1e4)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('circle', {cx:X(h), cy:Y(Math.min(1e4, isFinite(Y0) ? Y0 : 1e4)), r:5, fill:'#b5452a'}, svg);
  cells(document.getElementById('lifeReadout'), [
    [T('TIME TO RE-ENTER','ВРЕМЯ ДО ВХОДА'), yStr(Y0)],
    [T('AIR DENSITY HERE','ПЛОТНОСТЬ ВОЗДУХА'), (rho(h)*sunF).toExponential(1) + T(' kg/m³',' кг/м³')],
    [T('INITIAL DECAY','НАЧАЛЬНОЕ СНИЖЕНИЕ'), fmt(B*rho(h)*sunF*Math.sqrt(MU*1e9*(RE + h)*1000)*365.25*86400/1000, 2) + T(' km/yr',' км/год')],
    [T('MEETS FCC 5-YEAR RULE ON ITS OWN?','УКЛАДЫВАЕТСЯ В 5 ЛЕТ FCC САМО?'), Y0 <= 5 ? T('yes','да') : T('no — needs a deorbit burn','нет — нужен импульс схода')]
  ]);
  hud2.textContent = yStr(Y0);
  document.getElementById('lifeStatus').innerHTML = T('A typical intact satellite has about 0.01 m²/kg; a thin panel or a fragment of foil much more. Above about 600 km, natural decay alone cannot meet a five-year deadline.','У типичного целого спутника около 0,01 м²/кг; у тонкой панели или клочка фольги — намного больше. Выше примерно 600 км одного естественного торможения не хватает, чтобы уложиться в пять лет.');
}
[lH, lB].forEach(function(el){ el.addEventListener('input', renderLife); });
Array.prototype.forEach.call(document.querySelectorAll('#lSun .btn'), function(btn){ btn.addEventListener('click', function(){ sunF = +this.getAttribute('data-f'); pressGroup(this.parentNode, this); renderLife(); }); });

/* ============ CH5 — TIMELINE ============ */
var TIMELINE = [
  ['1978', 'Kessler and Cour-Palais publish “Collision frequency of artificial satellites: the creation of a debris belt” [4].', 'Кесслер и Кур-Пале публикуют статью «Частота столкновений искусственных спутников: образование пояса обломков» [4].'],
  ['2007', '<b>11 January:</b> anti-satellite test destroys Fengyun-1C at about 850 km; 1,613 fragments tracked by 31 March [2].', '<b>11 января:</b> противоспутниковое испытание уничтожает «Фэнъюнь-1C» на высоте около 850 км; к 31 марта отслеживается 1613 обломков [2].'],
  ['2009', '<b>10 February:</b> Iridium 33 and Cosmos 2251 collide at 790 km and more than 11 km/s; 823 fragments catalogued by end of March [3].', '<b>10 февраля:</b> Iridium 33 и «Космос-2251» сталкиваются на высоте 790 км на скорости более 11 км/с; к концу марта каталогизировано 823 обломка [3].'],
  ['2022', '<b>January:</b> more than 9,000 tonnes in orbit [1]. <b>29 September:</b> FCC adopts the five-year deorbit rule [5].', '<b>Январь:</b> на орбите более 9000 тонн [1]. <b>29 сентября:</b> FCC принимает правило пяти лет [5].']
];

/* ============ CH6 — REFERENCES ============ */
var REFERENCES = [
  {title:'NASA Orbital Debris Program Office, “Frequently Asked Questions”', url:'https://orbitaldebris.jsc.nasa.gov/faq/', note:{en:'> 25,000 objects > 10 cm, ~500,000 of 1–10 cm, > 100 million > 1 mm, > 9,000 t (January 2022); 7–8 km/s, average impact ~10 km/s, up to ~15; lifetimes: several years below 600 km, centuries at 800 km, a thousand years or more above 1,000 km.', ru:'> 25 000 объектов > 10 см, ~500 000 размером 1–10 см, > 100 млн > 1 мм, > 9000 т (январь 2022); 7–8 км/с, средняя скорость удара ~10 км/с, до ~15; сроки: несколько лет ниже 600 км, века на 800 км, тысяча лет и больше выше 1000 км.'}},
  {title:'NASA ODPO (2007), Orbital Debris Quarterly News 11(2), “Chinese Anti-satellite Test Creates Most Severe Orbital Debris Cloud in History”', url:'https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv11i2.pdf', note:{en:'Fengyun-1C, 960 kg, 845 × 865 km, 98.6°, struck 11 January 2007; debris from 200 to > 4,000 km; 1,613 fragments tracked by 31 March 2007.', ru:'«Фэнъюнь-1C», 960 кг, 845 × 865 км, 98,6°, поражён 11 января 2007; обломки от 200 до > 4000 км; к 31 марта 2007 отслеживалось 1613 обломков.'}},
  {title:'NASA ODPO (2009), Orbital Debris Quarterly News 13(2), “Satellite Collision Leaves Significant Debris Clouds”', url:'https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf', note:{en:'Iridium 33 (560 kg) and Cosmos 2251 (~900 kg), 10 February 2009, 16:56 GMT, 790 km, > 11 km/s; 823 catalogued by end of March; fragmentation tests at ~40 J/g.', ru:'Iridium 33 (560 кг) и «Космос-2251» (~900 кг), 10 февраля 2009, 16:56 GMT, 790 км, > 11 км/с; к концу марта 823 в каталоге; испытания на разрушение при ~40 Дж/г.'}},
  {title:'D. J. Kessler, B. G. Cour-Palais (1978), “Collision frequency of artificial satellites: The creation of a debris belt”, Journal of Geophysical Research 83, 2637–2646', url:'https://doi.org/10.1029/JA083iA06p02637', note:{en:'Collision frequency rising with the square of the population; the possibility of a self-sustaining debris belt.', ru:'Частота столкновений растёт как квадрат численности; возможность самоподдерживающегося пояса обломков.'}},
  {title:'FCC (2022), “FCC Adopts New ‘5-Year Rule’ for Deorbiting Satellites”', url:'https://docs.fcc.gov/public/attachments/DOC-387720A1.pdf', note:{en:'Satellites ending missions in or passing through LEO (below 2,000 km) must be disposed of as soon as practicable and no later than five years after mission completion; replaces the 25-year guideline.', ru:'Спутники, завершающие миссию на низкой орбите (ниже 2000 км) или проходящие через неё, должны утилизироваться как можно скорее и не позднее пяти лет после завершения миссии; заменяет 25-летний ориентир.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderImp();
  renderLife();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__debris = {impact:impact, lifetime:lifetime, rho:rho, vCirc:vCirc};
