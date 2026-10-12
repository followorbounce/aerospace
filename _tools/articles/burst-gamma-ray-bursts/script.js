/* ============ CONSTANTS ============ */
var C_KMS = 299792.458, MPC_CM = 3.0856775814913673e24, GYR_S = 3.15576e16, LY_PER_MPC = 3.26156e6;
var MSUN_C2 = 1.98847e33*Math.pow(2.99792458e10, 2);            /* Sun's rest-mass energy, erg */
var PLANCK18 = {H0:67.36, Om:0.3153};                            /* flat ΛCDM, TT,TE,EE+lowE+lensing [17] */

/* Fermi GBM T90 histogram: 0.05-dex bins from log10(T90/s) = −2.2, all 4,391 bursts with T90 > 0
   in HEASARC FERMIGBRST, queried 11 October 2026 (July 2008 – 8 October 2026) [6] */
var T90_LO = -2.2, T90_W = 0.05;
var T90_HIST = [0,0,1,0,0,0,0,0,3,0,0,1,0,0,9,0,1,4,0,0,14,1,7,10,6,0,24,7,17,42,3,8,35,9,42,34,6,32,29,36,55,27,32,51,28,15,44,26,43,39,25,45,42,31,40,42,40,51,54,72,74,113,72,118,81,123,130,114,134,128,146,154,151,132,147,156,131,136,126,130,119,84,95,67,67,62,39,36,32,19,19,18,11,13,9,6,4,7,2,1,0,0,1,1,0,0,0,0,0,0,0,0];
var T90_TOTAL = 4391, T90_SHORT_2S = 741;                          /* exact counts from the raw catalog */

/* Record bursts: fluence S (erg/cm²), redshift z, published E_iso (erg) [15][18][19][20][21] */
var BURSTS = {
  boat:{name:'GRB 221009A', S:0.22, z:0.151, pub:1.2e55, pubZ:0.151, band:'20 keV–10 MeV'},
  c16:{name:'GRB 080916C', S:2.4e-4, z:4.35, pub:8.8e54, pubZ:4.35, band:'10 keV–10 GeV'},
  z82:{name:'GRB 090423', S:1.1e-6, z:8.2, pub:1.03e53, pubZ:8.1, band:'8–1000 keV'}
};

/* ============ NUMBER FORMATTING ============ */
var SUPS = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(x, d){
  if(!(x > 0)) return '0';
  var e = Math.floor(Math.log10(x)), m = x/Math.pow(10, e);
  if(+m.toFixed(d) >= 10){ m /= 10; e += 1; }
  return fmt(m, d) + ' × 10' + String(e).split('').map(function(c){ return SUPS[c]; }).join('');
}

/* ============ COSMOLOGY ============ */
function Ez(z, c){ return Math.sqrt(c.Om*Math.pow(1 + z, 3) + (1 - c.Om)); }
/* comoving distance, Mpc (Simpson's rule) */
function comoving(z, c){
  if(z <= 0) return 0;
  var n = 400, s = 0;
  for(var i = 0; i <= n; i++){ var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w/Ez(z*i/n, c); }
  return C_KMS/c.H0*s*z/(3*n);
}
function lumDist(z, c){ return (1 + z)*comoving(z, c); }
/* age of a flat matter + Λ universe at redshift z, Gyr (closed form) */
function ageAt(z, c){
  var Hs = c.H0*1e5/MPC_CM, OL = 1 - c.Om;
  return 2/(3*Hs*Math.sqrt(OL))*Math.asinh(Math.sqrt(OL/c.Om)*Math.pow(1 + z, -1.5))/GYR_S;
}
function eIso(S, z, c){ var d = lumDist(z, c)*MPC_CM; return 4*Math.PI*d*d*S/(1 + z); }

/* ============ BEAMING ============ */
function beamFrac(thetaDeg){ return 1 - Math.cos(thetaDeg*Math.PI/180); }

/* ============ ISOTROPY MODEL ============ */
/* Expected ⟨sin² b⟩ for sources uniform in a sphere of radius D around the Sun, kept within a slab |z| < h (h = 1). */
function expSin2(D){
  var k = Math.min(1, 1/D);
  return k*k*(1/3 + Math.log(1/k))/(1.5 - 0.5*k*k);
}
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
function sampleSky(mode, D, n, seed){
  var r = rng(seed), out = [];
  while(out.length < n){
    if(mode === 'iso'){ out.push({u:2*r() - 1, l:2*Math.PI*r() - Math.PI}); continue; }
    var x = 2*r() - 1, y = 2*r() - 1, z = 2*r() - 1, q = x*x + y*y + z*z;
    if(q > 1 || q === 0) continue;
    if(Math.abs(z*D) >= 1) continue;
    var rr = Math.sqrt(q); out.push({u:z/rr, l:Math.atan2(y, x)});
  }
  return out;
}
function meanSin2(pts){ var s = 0; pts.forEach(function(p){ s += p.u*p.u; }); return s/pts.length; }
function hammer(l, b){ var den = Math.sqrt(1 + Math.cos(b)*Math.cos(l/2)); return [2*Math.SQRT2*Math.cos(b)*Math.sin(l/2)/den, Math.SQRT2*Math.sin(b)/den]; }

/* ============ T90 ============ */
function t90Split(cutLog){
  var k = Math.round((cutLog - T90_LO)/T90_W), s = 0;
  for(var i = 0; i < k && i < T90_HIST.length; i++) s += T90_HIST[i];
  return {shortN:s, longN:T90_TOTAL - s};
}
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function secStr(v){ return v < 10 ? fmt(v, v < 1 ? 2 : 1) : fmtInt(v); }

/* ============ CH2 — SKY ============ */
var skyMode = 'disk', skySeed = 7, skyD = document.getElementById('skyD'), SKY_N = 600;
function renderSky(){
  var D = Math.pow(10, +skyD.value), pts = sampleSky(skyMode, D, SKY_N, skySeed), m = meanSin2(pts);
  var expv = skyMode === 'iso' ? 1/3 : expSin2(D), sig = Math.sqrt(4/45/SKY_N);
  var low = pts.filter(function(p){ return Math.abs(p.u) < Math.sin(10*Math.PI/180); }).length/SKY_N;
  document.getElementById('skyDVal').textContent = skyMode === 'iso' ? '—' : (D < 10 ? fmt(D, 2) : num(D)) + ' ×';
  skyD.setAttribute('aria-valuetext', (D < 10 ? fmt(D, 2) : num(D)) + T(' times the disk half-thickness',' полутолщины диска'));
  document.getElementById('skyPre').setAttribute('aria-label', T('Population','Население'));
  skyD.disabled = skyMode === 'iso';
  var svg = document.getElementById('skySvg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', T('All-sky map of 600 simulated bursts in galactic coordinates; the Milky Way runs along the middle','Карта всего неба с 600 модельными всплесками в галактических координатах; Млечный Путь проходит посередине'));
  var cx = 240, cy = 150, sx = 225/(2*Math.SQRT2), sy = 120/Math.SQRT2;
  var e = ns('ellipse', {cx:cx, cy:cy, rx:225, ry:120, fill:'#fbfbf8', stroke:'#0b0b0c', 'stroke-width':1}, svg);
  [-60, -30, 30, 60].forEach(function(bd){
    var d = ''; for(var i = 0; i <= 60; i++){ var xy = hammer(-Math.PI + 2*Math.PI*i/60, bd*Math.PI/180); d += (i ? 'L' : 'M') + (cx - xy[0]*sx).toFixed(1) + ' ' + (cy - xy[1]*sy).toFixed(1); }
    ns('path', {d:d, fill:'none', stroke:'#e4e4de'}, svg);
  });
  ns('line', {x1:cx - 225, y1:cy, x2:cx + 225, y2:cy, stroke:'#a8741a', 'stroke-width':1.5}, svg);
  pts.forEach(function(p){ var xy = hammer(p.l, Math.asin(p.u)); ns('circle', {cx:(cx - xy[0]*sx).toFixed(1), cy:(cy - xy[1]*sy).toFixed(1), r:2.2, fill:'#2f5aa1', 'fill-opacity':0.75}, svg); });
  txt(svg, cx + 6, cy - 6, T('Milky Way plane','плоскость Млечного Пути'), 'svg-small svg-halo');
  txt(svg, 12, 292, T('galactic coordinates, Hammer projection · illustration','галактические координаты, проекция Хаммера · иллюстрация'), 'svg-small');
  cells(document.getElementById('skyReadout'), [
    [T('⟨sin² b⟩ IN THIS SAMPLE','⟨sin² b⟩ В ВЫБОРКЕ'), fmt(m, 3)],
    [T('MODEL EXPECTS','МОДЕЛЬ ОЖИДАЕТ'), fmt(expv, 3)],
    [T('EVEN SKY, ± 2 σ','РАВНОМЕРНОЕ НЕБО, ± 2 σ'), fmt(1/3, 3) + ' ± ' + fmt(2*sig, 3)],
    [T('WITHIN 10° OF THE PLANE','В ПРЕДЕЛАХ 10° ОТ ПЛОСКОСТИ'), fmtInt(low*100) + ' % ' + T('(even sky: 17 %)','(равномерно: 17 %)')]
  ]);
  var even = Math.abs(m - 1/3) < 2*sig;
  document.getElementById('skyStatus').textContent = skyMode === 'iso'
    ? T('Sources spread through the universe: an even sky, as BATSE saw.','Источники по всей Вселенной: равномерное небо, как у BATSE.')
    : even ? T('Even to this test: we see only nearby sources, well inside the disk, so the disk does not show. Look further and it will.','По этому тесту равномерно: видны лишь близкие источники глубоко внутри диска, и диск не проявляется. Посмотрите дальше — и он проявится.')
    : T('The sources crowd towards the Milky Way. BATSE saw no such band, so bursts are not a disk population seen this far out.','Источники теснятся к Млечному Пути. BATSE такой полосы не видел — значит, всплески не дисковое население, видимое на такую глубину.');
}
skyD.addEventListener('input', renderSky);
document.getElementById('skyNew').addEventListener('click', function(){ skySeed += 1; renderSky(); });
Array.prototype.forEach.call(document.querySelectorAll('#skyPre .btn'), function(btn){ btn.addEventListener('click', function(){ skyMode = this.getAttribute('data-m'); pressGroup(this.parentNode, this); renderSky(); }); });

/* ============ CH3 — T90 ============ */
var t90Cut = document.getElementById('t90Cut');
function renderT90(){
  var c = +t90Cut.value, sp = t90Split(c), cutS = Math.pow(10, c);
  document.getElementById('t90CutVal').textContent = secStr(cutS) + T(' s',' с');
  t90Cut.setAttribute('aria-valuetext', secStr(cutS) + T(' seconds',' с'));
  document.getElementById('t90Pre').setAttribute('aria-label', T('Dividing line','Граница'));
  var svg = document.getElementById('t90Svg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Histogram of 4,391 Fermi GBM burst durations on a logarithmic axis, with the chosen dividing line','Гистограмма 4391 длительности всплесков Fermi GBM на логарифмической оси с выбранной границей'));
  var L = 52, R = 465, Tp = 28, B = 240, x0 = -2.2, x1 = 3.0, agg = [], i, ymax = 650;
  for(i = 0; i < (x1 - x0)/0.2 - 1e-9; i++){ var s4 = 0; for(var j = 0; j < 4; j++) s4 += T90_HIST[i*4 + j] || 0; agg.push(s4); }
  function X(lg){ return L + (lg - x0)/(x1 - x0)*(R - L); }
  function Y(v){ return B - v/ymax*(B - Tp); }
  [0, 200, 400, 600].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, num(v), 'svg-small', 'end'); });
  agg.forEach(function(v, k){
    var a = x0 + 0.2*k, isShort = a + 0.2 <= c + 1e-9, part = !isShort && a < c - 1e-9;
    ns('rect', {x:X(a) + 0.5, y:Y(v), width:Math.max(0, X(a + 0.2) - X(a) - 1), height:B - Y(v), fill:isShort ? '#b5452a' : part ? '#9a8f7a' : '#2f5aa1'}, svg);
  });
  [-2, -1, 0, 1, 2, 3].forEach(function(lg){ ns('line', {x1:X(lg), y1:B, x2:X(lg), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(lg), B + 17, lg < 0 ? fmt(Math.pow(10, lg), -lg) : fmtInt(Math.pow(10, lg)), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  ns('line', {x1:X(c), y1:Tp - 6, x2:X(c), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'4 3', 'stroke-width':1.5}, svg);
  txt(svg, X(c) - 6, Tp + 6, T('short','короткие'), 'svg-small svg-halo', 'end');
  txt(svg, X(c) + 6, Tp + 6, T('long','длинные'), 'svg-small svg-halo', 'start');
  txt(svg, L, 14, T('number of bursts','число всплесков'), 'svg-small');
  txt(svg, R, B + 34, T('T90, seconds (log scale)','T90, секунды (лог. шкала)'), 'svg-small', 'end');
  cells(document.getElementById('t90Readout'), [
    [T('SHORT (BELOW THE LINE)','КОРОТКИЕ (ДО ГРАНИЦЫ)'), num(sp.shortN) + ' · ' + fmt(sp.shortN/T90_TOTAL*100, 1) + ' %'],
    [T('LONG','ДЛИННЫЕ'), num(sp.longN) + ' · ' + fmt(sp.longN/T90_TOTAL*100, 1) + ' %'],
    [T('ALL BURSTS WITH A T90','ВСЕ ВСПЛЕСКИ С T90'), num(T90_TOTAL), true]
  ]);
  hud2.textContent = num(sp.shortN) + ' / ' + num(T90_TOTAL);
  document.getElementById('t90Status').textContent = Math.abs(c - 0.3) < 1e-9
    ? T('At the usual 2 s line, 741 of 4,391 Fermi bursts are short. The bars show a small hump just under a second and a much larger one near half a minute, and they overlap.','При обычной границе 2 с короткие — 741 из 4391 всплеска Fermi. На столбцах видны небольшой горб чуть меньше секунды и гораздо больший — около полуминуты, и они перекрываются.')
    : T('Moving the line shifts hundreds of bursts between the families: the dip between the two humps is shallow, so any single cut misclassifies some.','Сдвиг границы перебрасывает сотни всплесков из семейства в семейство: провал между горбами неглубокий, и любая граница часть всплесков относит не туда.');
}
t90Cut.addEventListener('input', function(){ pressGroup(document.getElementById('t90Pre'), null); renderT90(); });
Array.prototype.forEach.call(document.querySelectorAll('#t90Pre .btn'), function(btn){ btn.addEventListener('click', function(){ t90Cut.value = this.getAttribute('data-t'); pressGroup(this.parentNode, this); renderT90(); }); });

/* ============ CH4 — INSTRUMENT TABLE ============ */
function renderInst(){
  var rows = [
    [T('Swift BAT','Swift BAT'), T('coded mask','кодирующая маска'), '15–150 keV', '1.4–2 sr', T('1–3′ (4′ design)','1–3′ (4′ по проекту)'), '≈ 80–90'],
    [T('Swift XRT','Swift XRT'), T('grazing-incidence mirror','зеркало косого падения'), '0.3–10 keV', '23.6′ × 23.6′', '1–3″', T('follows BAT','по наводке BAT')],
    [T('Fermi GBM','Fermi GBM'), T('detectors facing many ways','детекторы в разные стороны'), '8 keV–30 MeV', '8.8 sr', '≳ 1–10°', '≈ 235–240'],
    [T('Fermi LAT','Fermi LAT'), T('pair-conversion telescope','телескоп с конверсией в электрон-позитронные пары'), T('20 MeV–>300 GeV','20 МэВ — >300 ГэВ'), '2.5 sr', '≤ 1°', '15–20']
  ];
  var head = [T('INSTRUMENT','ПРИБОР'), T('HOW IT IMAGES','КАК СТРОИТ ИЗОБРАЖЕНИЕ'), T('BAND','ДИАПАЗОН'), T('FIELD OF VIEW','ПОЛЕ ЗРЕНИЯ'), T('POSITION','ТОЧНОСТЬ ПОЛОЖЕНИЯ'), T('BURSTS / YEAR','ВСПЛЕСКОВ В ГОД')];
  var ru = function(s){ return lang === 'ru' ? s.replace(/keV/g, 'кэВ').replace(/MeV/g, 'МэВ').replace(/GeV/g, 'ГэВ').replace(/ sr/g, ' ср').replace(/(\d)\.(\d)/g, '$1,$2') : s; };
  document.getElementById('instTable').innerHTML = '<thead><tr>' + head.map(function(h){ return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function(r){ return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td>' + r.slice(2).map(function(v){ return '<td class="n">' + ru(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
}

/* ============ CH5 — ENERGY ============ */
var enZ = document.getElementById('enZ'), enS = document.getElementById('enS'), enKey = 'boat';
function renderEn(){
  var z = Math.pow(10, +enZ.value), S = Math.pow(10, +enS.value), dl = lumDist(z, PLANCK18), E = eIso(S, z, PLANCK18);
  var age = ageAt(z, PLANCK18), age0 = ageAt(0, PLANCK18);
  document.getElementById('enZVal').textContent = fmt(z, z < 0.1 ? 3 : z < 1 ? 3 : 2);
  document.getElementById('enSVal').textContent = sci(S, 2) + T(' erg/cm²',' эрг/см²');
  enZ.setAttribute('aria-valuetext', 'z = ' + document.getElementById('enZVal').textContent);
  enS.setAttribute('aria-valuetext', document.getElementById('enSVal').textContent);
  document.getElementById('enPre').setAttribute('aria-label', T('Burst','Всплеск'));
  var svg = document.getElementById('enSvg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Isotropic energy against redshift for the chosen fluence, with three record bursts marked','Изотропная энергия в зависимости от красного смещения при выбранном флюенсе; отмечены три рекордных всплеска'));
  var L = 56, R = 465, Tp = 26, B = 244, zl0 = -2, zl1 = 1.1, el0 = 46, el1 = 56;
  function X(lz){ return L + (lz - zl0)/(zl1 - zl0)*(R - L); }
  function Y(le){ return B - (le - el0)/(el1 - el0)*(B - Tp); }
  for(var le = 46; le <= 56; le += 2){ ns('line', {x1:L, y1:Y(le), x2:R, y2:Y(le), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(le) + 4, '10' + String(le).split('').map(function(ch){ return SUPS[ch]; }).join(''), 'svg-small', 'end'); }
  [-2, -1, 0, 1].forEach(function(lz){ ns('line', {x1:X(lz), y1:B, x2:X(lz), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(lz), B + 17, fmt(Math.pow(10, lz), lz < 0 ? -lz : 0), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  var ms = Math.log10(MSUN_C2);
  ns('line', {x1:L, y1:Y(ms), x2:R, y2:Y(ms), stroke:'#a8741a', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, L + 4, Y(ms) - 4, T('Sun’s mass as energy, M☉c²','масса Солнца как энергия, M☉c²'), 'svg-small svg-halo');
  var d = '', first = true;
  for(var k = 0; k <= 120; k++){ var lz = zl0 + (zl1 - zl0)*k/120, ee = Math.log10(eIso(S, Math.pow(10, lz), PLANCK18)); if(ee < el0 || ee > el1){ first = true; continue; } d += (first ? 'M' : 'L') + X(lz).toFixed(1) + ' ' + Y(ee).toFixed(1); first = false; }
  if(d) ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.5, 'stroke-dasharray':'5 4'}, svg);
  Object.keys(BURSTS).forEach(function(key){
    var b = BURSTS[key], px = X(Math.log10(b.pubZ)), py = Y(Math.log10(b.pub));
    ns('rect', {x:px - 4, y:py - 4, width:8, height:8, fill:'#fff', stroke:'#0b0b0c', 'stroke-width':1.5}, svg);
    txt(svg, px + (key === 'z82' ? -8 : 8), py - 8, b.name, 'svg-small svg-halo', key === 'z82' ? 'end' : 'start');
  });
  var le2 = Math.log10(E);
  if(le2 >= el0 && le2 <= el1) ns('circle', {cx:X(Math.log10(z)), cy:Y(le2), r:6, fill:'#b5452a'}, svg);
  txt(svg, L, 14, T('isotropic energy E_iso, erg','изотропная энергия E_iso, эрг'), 'svg-small');
  txt(svg, R, B + 34, T('redshift z (log scale) · squares: published values','красное смещение z (лог. шкала) · квадраты: опубликованные значения'), 'svg-small', 'end');
  var b = BURSTS[enKey], exact = b && Math.abs(z - b.z) < 1e-9 && Math.abs(S - b.S) < 1e-15*Math.max(1, b.S), Ecmp = exact ? eIso(S, b.pubZ, PLANCK18) : E;
  var zStr = function(v){ return lang === 'ru' ? String(v).replace('.', ',') : String(v); };
  var dGly = dl*LY_PER_MPC/1e9;
  cells(document.getElementById('enReadout'), [
    [T('LUMINOSITY DISTANCE','ФОТОМЕТРИЧЕСКОЕ РАССТОЯНИЕ'), num(dl) + T(' Mpc',' Мпк')],
    [T('LIGHT LEFT WHEN THE UNIVERSE WAS','СВЕТ УШЁЛ, КОГДА ВСЕЛЕННОЙ БЫЛО'), age < 1 ? num(age*1000) + T(' million years',' млн лет') : fmt(age, 2) + T(' billion years',' млрд лет')],
    [T('LIGHT TRAVEL TIME','ВРЕМЯ В ПУТИ'), fmt(age0 - age, 2) + T(' billion years',' млрд лет')],
    [T('E_iso','E_iso'), sci(E, 2) + T(' erg',' эрг')],
    [T('IN UNITS OF M☉c²','В ЕДИНИЦАХ M☉c²'), E/MSUN_C2 >= 0.01 ? fmt(E/MSUN_C2, 2) : sci(E/MSUN_C2, 1)],
    [T('PUBLISHED','ОПУБЛИКОВАНО'), exact ? sci(b.pub, 2) + T(' erg (z = ',' эрг (z = ') + zStr(b.pubZ) + ')' : '—']
  ]);
  hud1.textContent = fmt(dGly, 1) + T(' Gly',' млрд св. лет');
  hud2.textContent = sci(E, 1) + T(' erg',' эрг');
  document.getElementById('enStatus').textContent = exact
    ? (b.name + T(': at z = ',': при z = ') + zStr(b.pubZ) + T(' this simple estimate gives ',' эта простая оценка даёт ') + sci(Ecmp, 2) + T(' erg, ',' эрг — на ') + fmt(Math.abs(Ecmp/b.pub - 1)*100, 0) + T(' % from the published value, which also corrects for the detector’s energy band.',' % отличается от опубликованного значения, в котором учтён ещё и энергетический диапазон детектора.'))
    : T('Move the same fluence further away and the energy needed to produce it climbs steeply, as the dashed curve shows.','Перенесите тот же флюенс дальше — и требуемая энергия резко растёт, как показывает пунктир.');
}
function enFree(){ enKey = null; pressGroup(document.getElementById('enPre'), null); renderEn(); }
enZ.addEventListener('input', enFree); enS.addEventListener('input', enFree);
Array.prototype.forEach.call(document.querySelectorAll('#enPre .btn'), function(btn){ btn.addEventListener('click', function(){
  enKey = this.getAttribute('data-k'); var b = BURSTS[enKey]; enZ.value = Math.log10(b.z); enS.value = Math.log10(b.S); pressGroup(this.parentNode, this); renderEn(); }); });

/* ============ CH6 — JETS ============ */
var jetE = document.getElementById('jetE'), jetT = document.getElementById('jetT');
function renderJet(){
  var Ei = Math.pow(10, +jetE.value), th = +jetT.value, f = beamFrac(th), Et = f*Ei;
  document.getElementById('jetEVal').textContent = sci(Ei, 2) + T(' erg',' эрг');
  document.getElementById('jetTVal').textContent = fmt(th, 1) + '°';
  jetE.setAttribute('aria-valuetext', document.getElementById('jetEVal').textContent);
  jetT.setAttribute('aria-valuetext', fmt(th, 1) + T(' degrees',' градуса'));
  document.getElementById('jetPre').setAttribute('aria-label', T('Starting energy','Начальная энергия'));
  var svg = document.getElementById('jetSvg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', T('Two opposite jets of the chosen half-angle, and a scale comparing isotropic and true energy','Две противоположные струи с выбранным полууглом и шкала сравнения изотропной и истинной энергии'));
  var cx = 130, cy = 140, Lj = 110, a = th*Math.PI/180;
  [1, -1].forEach(function(s){
    ns('path', {d:'M' + cx + ' ' + cy + ' L' + (cx + s*Lj*Math.cos(a)) + ' ' + (cy - Lj*Math.sin(a)) + ' A' + Lj + ' ' + Lj + ' 0 0 ' + (s > 0 ? 1 : 0) + ' ' + (cx + s*Lj*Math.cos(a)) + ' ' + (cy + Lj*Math.sin(a)) + ' Z', fill:'#b5452a', 'fill-opacity':0.35, stroke:'#b5452a'}, svg);
  });
  ns('circle', {cx:cx, cy:cy, r:Lj, fill:'none', stroke:'#c9c9c1', 'stroke-dasharray':'3 3'}, svg);
  ns('circle', {cx:cx, cy:cy, r:4, fill:'#0b0b0c'}, svg);
  txt(svg, cx, cy + Lj + 22, T('two jets, side view','две струи, вид сбоку'), 'svg-small', 'middle');
  /* energy scale */
  var X0 = 280, X1 = 460, l0 = 49, l1 = 56;
  function Yv(le){ return 262 - (le - l0)/(l1 - l0)*230; }
  ns('line', {x1:X0, y1:Yv(l0), x2:X0, y2:Yv(l1), stroke:'#0b0b0c'}, svg);
  for(var le = 49; le <= 56; le++){ ns('line', {x1:X0 - 4, y1:Yv(le), x2:X0, y2:Yv(le), stroke:'#0b0b0c'}, svg); txt(svg, X0 - 8, Yv(le) + 4, '10' + String(le).split('').map(function(ch){ return SUPS[ch]; }).join(''), 'svg-small', 'end'); }
  var fr = Math.log10(5e50);
  ns('rect', {x:X0, y:Yv(fr + 0.15), width:X1 - X0, height:Yv(fr - 0.15) - Yv(fr + 0.15), fill:'#a8741a', 'fill-opacity':0.25}, svg);
  txt(svg, X1, Yv(fr) + 16, T('Frail et al.: 5 × 10⁵⁰','Фрейл и др.: 5 × 10⁵⁰'), 'svg-small', 'end');
  var yi = Yv(Math.log10(Ei)), yt = Yv(Math.max(l0, Math.log10(Et)));
  ns('line', {x1:X0, y1:yi, x2:X1 - 70, y2:yi, stroke:'#2f5aa1', 'stroke-width':2}, svg);
  txt(svg, X1 - 66, yi + 4, 'E_iso', 'svg-small', 'start');
  ns('line', {x1:X0, y1:yt, x2:X1 - 70, y2:yt, stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, X1 - 66, yt + 4, 'E_true', 'svg-small', 'start');
  ns('line', {x1:X0 + 40, y1:yi, x2:X0 + 40, y2:yt, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X0, 20, T('energy, erg (log)','энергия, эрг (лог.)'), 'svg-small');
  cells(document.getElementById('jetReadout'), [
    [T('SKY LIT BY BOTH JETS','ДОЛЯ НЕБА ПОД ОБЕИМИ СТРУЯМИ'), f < 0.01 ? fmt(f*100, 2) + ' %' : fmt(f*100, 1) + ' %'],
    [T('TRUE ENERGY','ИСТИННАЯ ЭНЕРГИЯ'), sci(Et, 2) + T(' erg',' эрг')],
    [T('BURSTS PER ONE AIMED AT US','ВСПЛЕСКОВ НА ОДИН, НАПРАВЛЕННЫЙ НА НАС'), num(1/f)],
    [T('TRUE ENERGY IN M☉c²','ИСТИННАЯ ЭНЕРГИЯ В M☉c²'), Et/MSUN_C2 >= 0.01 ? fmt(Et/MSUN_C2, 3) : sci(Et/MSUN_C2, 1)]
  ]);
  var ratio = Et/5e50;
  document.getElementById('jetStatus').textContent = ratio > 3
    ? T('Even beamed this way, the true energy is well above the 5 × 10⁵⁰ erg cluster: a narrower jet would bring it closer.','Даже с такой коллимацией истинная энергия заметно выше 5 × 10⁵⁰ эрг: более узкая струя приблизила бы её к этому значению.')
    : ratio < 1/3 ? T('Beamed this narrowly, the true energy falls well below the cluster.','При такой узкой струе истинная энергия заметно ниже этого значения.')
    : T('With this jet the true energy lands near the 5 × 10⁵⁰ erg that Frail and colleagues found typical.','С такой струёй истинная энергия близка к 5 × 10⁵⁰ эрг — типичному значению у Фрейла и коллег.');
}
jetE.addEventListener('input', function(){ pressGroup(document.getElementById('jetPre'), null); renderJet(); });
jetT.addEventListener('input', renderJet);
Array.prototype.forEach.call(document.querySelectorAll('#jetPre .btn'), function(btn){ btn.addEventListener('click', function(){ jetE.value = this.getAttribute('data-e'); pressGroup(this.parentNode, this); renderJet(); }); });

/* ============ CH8 — TIMELINE ============ */
var TIMELINE = [
  ['1967', '<b>2 July:</b> Vela 4a and 4b record the first known gamma-ray burst [2].', '<b>2 июля:</b> «Вела-4А» и «Вела-4Б» регистрируют первый известный гамма-всплеск [2].'],
  ['1973', 'Klebesadel, Strong and Olson publish sixteen bursts of cosmic origin [3].', 'Клебесадел, Стронг и Олсон публикуют шестнадцать всплесков космического происхождения [3].'],
  ['1991', '<b>5 April:</b> the Compton Gamma Ray Observatory, carrying BATSE, is launched [2].', '<b>5 апреля:</b> запущена обсерватория «Комптон» с прибором BATSE [2].'],
  ['1992', 'BATSE: bursts are spread evenly over the sky, and faint ones are too few [2][4].', 'BATSE: всплески равномерно распределены по небу, а слабых слишком мало [2][4].'],
  ['1993', 'Kouveliotou and colleagues separate short and long bursts at about 2 s [5].', 'Кувелиоту с коллегами разделяет короткие и длинные всплески по границе около 2 с [5].'],
  ['1997', 'BeppoSAX finds the first X-ray afterglow (GRB 970228); Keck spectra put GRB 970508 at redshift 0.835 or beyond [2][13].', 'BeppoSAX находит первое рентгеновское послесвечение (GRB 970228); спектры телескопа Кека помещают GRB 970508 на красное смещение 0,835 или дальше [2][13].'],
  ['2003', '<b>29 March:</b> a long burst is followed, at the same spot, by a very energetic supernova [8].', '<b>29 марта:</b> за длинным всплеском в той же точке следует очень мощная сверхновая [8].'],
  ['2004', '<b>20 November:</b> Swift is launched [2].', '<b>20 ноября:</b> запуск Swift [2].'],
  ['2008', '<b>11 June:</b> Fermi is launched [2]. <b>16 September:</b> GRB 080916C, about 8.8 × 10⁵⁴ erg [19].', '<b>11 июня:</b> запуск Fermi [2]. <b>16 сентября:</b> GRB 080916C, около 8,8 × 10⁵⁴ эрг [19].'],
  ['2009', '<b>23 April:</b> GRB 090423 at redshift about 8.2 [16].', '<b>23 апреля:</b> GRB 090423 с красным смещением около 8,2 [16].'],
  ['2017', '<b>17 August:</b> GRB 170817A arrives 1.74 s after the neutron-star merger GW170817 [9].', '<b>17 августа:</b> GRB 170817A приходит через 1,74 с после слияния нейтронных звёзд GW170817 [9].'],
  ['2022', '<b>9 October:</b> GRB 221009A, the brightest burst Fermi has seen [14].', '<b>9 октября:</b> GRB 221009A, самый яркий всплеск за всю работу Fermi [14].'],
  ['2024', '<b>22 June:</b> SVOM is launched [28].', '<b>22 июня:</b> запуск SVOM [28].'],
  ['2026', '<b>19 August:</b> the LINK boost is called off [25]; Swift resumes science while its orbit decays [27].', '<b>19 августа:</b> от подъёма орбиты аппаратом LINK отказываются [25]; Swift возобновляет наблюдения, пока его орбита снижается [27].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'Los Alamos National Laboratory, “The mystery flash that changed astrophysics”, National Security Science', url:'https://www.lanl.gov/media/publications/national-security-science/0720-the-mystery-flash-that-changed-astrophysics', note:{en:'Vela detectors were built to monitor space for nuclear explosions; Klebesadel found the event in 1967 data from two satellites; the result was declassified before publication.', ru:'Детекторы «Вела» создавались для наблюдения за ядерными взрывами в космосе; Клебесадел нашёл событие в данных двух спутников за 1967 год; результат рассекретили до публикации.'}},
  {title:'NASA HEASARC, “A History of Gamma-Ray Astronomy Including Related Discoveries”', url:'https://heasarc.gsfc.nasa.gov/docs/history/', note:{en:'Vela 4a,b launched 28 April 1967; first burst 2 July 1967; CGRO launched 5 April 1991; BATSE isotropy (1992); BeppoSAX afterglows and z = 0.835 for GRB 970508 (1997); Swift launched 20 November 2004; Fermi 11 June 2008.', ru:'«Вела-4a,b» запущены 28 апреля 1967 года; первый всплеск 2 июля 1967 года; «Комптон» запущен 5 апреля 1991 года; изотропия BATSE (1992); послесвечения BeppoSAX и z = 0,835 для GRB 970508 (1997); Swift запущен 20 ноября 2004 года; Fermi — 11 июня 2008 года.'}},
  {title:'R. W. Klebesadel, I. B. Strong, R. A. Olson (1973), “Observations of Gamma-Ray Bursts of Cosmic Origin”, ApJ 182, L85 (INSPIRE record)', url:'https://inspirehep.net/literature/87981', note:{en:'Sixteen bursts at 0.2–1.5 MeV, July 1969 – July 1972, durations from under 0.1 s to 30 s; directions rule out the Earth and Sun.', ru:'Шестнадцать всплесков в диапазоне 0,2–1,5 МэВ, июль 1969 — июль 1972 года, длительность от менее 0,1 с до 30 с; направления исключают Землю и Солнце.'}},
  {title:'NASA HEASARC, “CGRO SSC: BATSE All-Sky Plot of Gamma-Ray Burst Locations”', url:'https://heasarc.gsfc.nasa.gov/docs/cgro/cgro/batse_src.html', note:{en:'2,704 bursts in nine years; isotropic, no significant dipole or quadrupole; a deficiency of faint bursts; naturally explained at cosmological distances.', ru:'2704 всплеска за девять лет; изотропны, без значимого диполя или квадруполя; недостаток слабых всплесков; естественно объясняется космологическими расстояниями.'}},
  {title:'C. Kouveliotou et al. (1993), “Identification of two classes of gamma-ray bursts”, ApJ 413, L101 (INSPIRE record)', url:'https://inspirehep.net/literature/370019', note:{en:'Bimodal BATSE durations: short (less than 2 s) and long (more than 2 s); short bursts predominantly harder.', ru:'Бимодальные длительности BATSE: короткие (менее 2 с) и длинные (более 2 с); короткие преимущественно жёстче.'}},
  {title:'NASA HEASARC, FERMIGBRST — Fermi GBM Burst Catalog (queried 11 October 2026)', url:'https://heasarc.gsfc.nasa.gov/W3Browse/fermi/fermigbrst.html', note:{en:'4,391 bursts with T90 > 0, 14 July 2008 – 8 October 2026; 741 have T90 below 2 s. Queried via the HEASARC TAP service.', ru:'4391 всплеск с T90 > 0, 14 июля 2008 — 8 октября 2026 года; у 741 T90 меньше 2 с. Запрос через сервис TAP архива HEASARC.'}},
  {title:'A. von Kienlin et al. (2020), “The Fourth Fermi-GBM Gamma-Ray Burst Catalog: A Decade of Data”, ApJ 893, 46', url:'https://arxiv.org/abs/2002.11460', note:{en:'Catalog methods, including T90 measured in 50–300 keV.', ru:'Методы каталога, в том числе T90, измеряемая в диапазоне 50–300 кэВ.'}},
  {title:'J. Hjorth et al. (2003), “A very energetic supernova associated with the γ-ray burst of 29 March 2003”, Nature 423, 847', url:'https://arxiv.org/abs/astro-ph/0306347', note:{en:'A hypernova coincident in time and place with a burst at z = 0.1685 — support for the collapsar model.', ru:'Гиперновая, совпавшая по времени и месту со всплеском при z = 0,1685, — подтверждение модели коллапсара.'}},
  {title:'B. P. Abbott et al. (2017), “Gravitational Waves and Gamma-Rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A”, ApJL 848, L13', url:'https://arxiv.org/abs/1710.05834', note:{en:'Delay (+1.74 ± 0.05) s; host NGC 4993 at (42.9 ± 3.2) Mpc; E_iso ≈ 3–5 × 10⁴⁶ erg, orders of magnitude below other short bursts.', ru:'Задержка (+1,74 ± 0,05) с; родительская галактика NGC 4993 на расстоянии (42,9 ± 3,2) Мпк; E_iso ≈ 3–5 × 10⁴⁶ эрг — на порядки ниже других коротких всплесков.'}},
  {title:'NASA Swift, “The Burst Alert Telescope (BAT)”', url:'https://swift.gsfc.nasa.gov/about_swift/bat_desc.html', note:{en:'15–150 keV imaging; 1.4 sr half-coded; 32,768 CdZnTe pieces; about 54,000 lead tiles, random 50 % open pattern, about 1 m above the detectors; 4′ centroiding; initial position within several seconds.', ru:'Изображения в диапазоне 15–150 кэВ; 1,4 ср при половинном кодировании; 32 768 элементов CdZnTe; около 54 000 свинцовых пластинок, случайный узор с 50 % открытых, примерно в 1 м над детекторами; точность 4′; первое положение за несколько секунд.'}},
  {title:'NASA GCN, “Neil Gehrels Swift Observatory” mission table', url:'https://gcn.nasa.gov/missions/swift', note:{en:'BAT 15–350 keV, about 2 sr, ≤ 1–3′; XRT 0.3–10 keV, 23.6′ × 23.6′, 1–3″; BAT on-board triggers 70–80 long and 7–9 short bursts per year.', ru:'BAT 15–350 кэВ, около 2 ср, ≤ 1–3′; XRT 0,3–10 кэВ, 23,6′ × 23,6′, 1–3″; бортовых срабатываний BAT в год: 70–80 длинных и 7–9 коротких всплесков.'}},
  {title:'NASA GCN, “Fermi Gamma-ray Space Telescope” mission table', url:'https://gcn.nasa.gov/missions/fermi', note:{en:'GBM 8 keV–30 MeV, 8.8 sr, ≳ 1–10°, about 200 long and 35–40 short bursts per year; LAT 20 MeV to over 300 GeV, 2.5 sr, ≤ 1°, 15–20 per year.', ru:'GBM 8 кэВ — 30 МэВ, 8,8 ср, ≳ 1–10°, около 200 длинных и 35–40 коротких всплесков в год; LAT от 20 МэВ до более 300 ГэВ, 2,5 ср, ≤ 1°, 15–20 в год.'}},
  {title:'M. R. Metzger et al. (1997), “Spectral constraints on the redshift of the optical counterpart to the γ-ray burst of 8 May 1997”, Nature 387, 878 (Caltech record)', url:'https://resolver.caltech.edu/CaltechAUTHORS:20130419-091322811', note:{en:'Keck spectra show an absorption system at z = 0.835, so the burst lies at 0.835 ≲ z ≲ 2.3 — the first direct limits on a burst’s distance.', ru:'Спектры телескопа Кека показывают систему поглощения при z = 0,835, значит, всплеск находится при 0,835 ≲ z ≲ 2,3 — первые прямые ограничения на расстояние до всплеска.'}},
  {title:'S. Lesage et al. (2023), “Fermi-GBM Discovery of GRB 221009A: An Extraordinarily Bright GRB from Onset to Afterglow”, ApJL 952, L42', url:'https://arxiv.org/abs/2303.14172', note:{en:'The highest-flux burst Fermi GBM has observed; E_iso = 1.0 × 10⁵⁵ erg at z = 0.151, the highest in the GBM sample.', ru:'Самый яркий по потоку всплеск за всю работу Fermi GBM; E_iso = 1,0 × 10⁵⁵ эрг при z = 0,151 — максимум в выборке GBM.'}},
  {title:'D. D. Frederiks et al. (2023), “Properties of the extremely energetic GRB 221009A from Konus-WIND and SRG/ART-XC observations”, ApJL 949, L7', url:'https://arxiv.org/abs/2302.13383', note:{en:'Total fluence ≈ 0.22 erg/cm² (20 keV–10 MeV); at z = 0.151, E_iso ≈ 1.2 × 10⁵⁵ erg.', ru:'Полный флюенс ≈ 0,22 эрг/см² (20 кэВ — 10 МэВ); при z = 0,151 E_iso ≈ 1,2 × 10⁵⁵ эрг.'}},
  {title:'N. R. Tanvir et al. (2009), “A γ-ray burst at a redshift of z ≈ 8.2”, Nature 461, 1254 (doi:10.1038/nature08459; arXiv preprint)', url:'https://arxiv.org/abs/0906.1577', note:{en:'Redshift about 8.2, about 630 million years after the Big Bang (the published Nature version; the preprint’s title gives 8.3).', ru:'Красное смещение около 8,2, примерно через 630 млн лет после Большого взрыва (опубликованная в Nature версия; в заголовке препринта — 8,3).'}},
  {title:'Planck Collaboration (2020), “Planck 2018 results. VI. Cosmological parameters”, A&A 641, A6', url:'https://arxiv.org/abs/1807.06209', note:{en:'H₀ = 67.36 km/s/Mpc, Ω_m = 0.3153 (TT,TE,EE+lowE+lensing); age 13.797 Gyr.', ru:'H₀ = 67,36 км/с/Мпк, Ω_m = 0,3153 (TT,TE,EE+lowE+lensing); возраст 13,797 млрд лет.'}},
  {title:'A. A. Abdo et al. (2009), “Fermi Observations of High-Energy Gamma-Ray Emission from GRB 080916C”, Science 323, 1688', url:'https://doi.org/10.1126/science.1169101', note:{en:'Fluence about 2.4 × 10⁻⁴ erg/cm² at 10 keV–10 GeV; with z ≈ 4.35, the largest apparent isotropic energy then known.', ru:'Флюенс около 2,4 × 10⁻⁴ эрг/см² в диапазоне 10 кэВ — 10 ГэВ; при z ≈ 4,35 — самая большая из известных тогда изотропных энергий.'}},
  {title:'H. Tajima et al. (2009), “Fermi Observations of high-energy gamma-ray emissions from GRB 080916C”, arXiv:0907.0714', url:'https://arxiv.org/abs/0907.0714', note:{en:'z ≈ 4.35 from GROND; E_iso ≈ 8.8 × 10⁵⁴ erg.', ru:'z ≈ 4,35 по данным GROND; E_iso ≈ 8,8 × 10⁵⁴ эрг.'}},
  {title:'A. von Kienlin (2009), “GRB 090423: Fermi GBM observation”, GCN Circular 9229', url:'https://gcn.nasa.gov/circulars/9229', note:{en:'Fluence (1.1 ± 0.3) × 10⁻⁶ erg/cm² at 8–1000 keV; T90 about 12 s.', ru:'Флюенс (1,1 ± 0,3) × 10⁻⁶ эрг/см² в диапазоне 8–1000 кэВ; T90 около 12 с.'}},
  {title:'L. Nava et al. (2009), “GRB 090423: energetic, luminosity and jet break”, GCN Circular 9235', url:'https://gcn.nasa.gov/circulars/9235', note:{en:'From the Fermi parameters and z = 8.1, E_iso = 1.03 × 10⁵³ erg.', ru:'По параметрам Fermi и z = 8,1: E_iso = 1,03 × 10⁵³ эрг.'}},
  {title:'D. A. Frail et al. (2001), “Beaming in gamma-ray bursts: evidence for a standard energy reservoir”, ApJ 562, L55', url:'https://arxiv.org/abs/astro-ph/0102282', note:{en:'Corrected for jet geometry, gamma-ray energies narrowly cluster around 5 × 10⁵⁰ erg.', ru:'С поправкой на геометрию струи энергии гамма-излучения тесно группируются около 5 × 10⁵⁰ эрг.'}},
  {title:'NASA Swift, “Swift GRB Stats” (Swift GRB table)', url:'https://swift.gsfc.nasa.gov/archive/grb_table/stats/', note:{en:'Swift GRBs: 1,765 in the table.', ru:'Всплесков Swift в таблице: 1765.'}},
  {title:'NASA Science (2026), “NASA’s Swift Restarts Science Observations”, 28 August 2026', url:'https://science.nasa.gov/blogs/swift/2026/08/28/nasas-swift-restarts-science-observations/', note:{en:'UVOT and XRT off since February to minimize drag; BAT halted in April; UVOT and XRT back on 26 August.', ru:'UVOT и XRT выключены с февраля, чтобы уменьшить сопротивление; BAT остановлен в апреле; UVOT и XRT включены снова 26 августа.'}},
  {title:'NASA Science (2026), “NASA Updates Next Steps for Commercial Swift Boost Mission”, 19 August 2026', url:'https://science.nasa.gov/blogs/swift/2026/08/19/nasa-updates-next-steps-for-commercial-swift-boost-mission/', note:{en:'The LINK spacecraft will not capture or boost Swift to a higher altitude.', ru:'Аппарат LINK не будет захватывать Swift и поднимать его орбиту.'}},
  {title:'SpacePolicyOnline (2026), “Swift Rescue Mission May Not Have Succeeded, But No Regrets”, 23 September 2026 (updated 26 September)', url:'https://spacepolicyonline.com/news/swift-rescue-mission-may-not-have-succeeded-but-no-regrets/', note:{en:'LINK did not reboost Swift and has re-entered (Katalyst: 25 September); Swift is expected to re-enter later this year; NASA had wanted to raise it to 600 km.', ru:'LINK не поднял Swift и уже вошёл в атмосферу (по данным Katalyst — 25 сентября); вход Swift в атмосферу ожидается в этом году; NASA хотело поднять его до 600 км.'}},
  {title:'NASA Science (2026), “NASA’s Swift Powers On Third Instrument, Restarts Automated Slewing”, 25 September 2026', url:'https://science.nasa.gov/blogs/swift/2026/09/25/nasas-swift-powers-on-third-instrument-restarts-automated-slewing/', note:{en:'BAT detecting gamma rays again on 18 September; automated pointing from 21 September; about 325 km up; below 300 km (expected early to mid-October) science will likely cease.', ru:'BAT снова регистрирует гамма-излучение с 18 сентября; автоматическое наведение с 21 сентября; высота около 325 км; ниже 300 км (ожидается в начале — середине октября) наблюдения, вероятно, прекратятся.'}},
  {title:'CNES / CNSA, “The SVOM mission”', url:'https://www.svom.eu/en/the-svom-mission/', note:{en:'Chinese–French gamma-ray burst mission launched on 22 June 2024 from Xichang; ECLAIRs coded-mask telescope.', ru:'Китайско-французская миссия для изучения гамма-всплесков, запущена 22 июня 2024 года с космодрома Сичан; телескоп ECLAIRs с кодирующей маской.'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderSky(); renderT90(); renderInst(); renderEn(); renderJet();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
enZ.value = Math.log10(BURSTS.boat.z); enS.value = Math.log10(BURSTS.boat.S);   /* load in the pressed GRB 221009A preset */
applyLang('en');
window.__burst = {lumDist:lumDist, comoving:comoving, ageAt:ageAt, eIso:eIso, beamFrac:beamFrac, expSin2:expSin2, sampleSky:sampleSky, meanSin2:meanSin2,
  t90Split:t90Split, hammer:hammer, sci:sci, PLANCK18:PLANCK18, BURSTS:BURSTS, T90_HIST:T90_HIST, T90_TOTAL:T90_TOTAL, T90_SHORT_2S:T90_SHORT_2S, MSUN_C2:MSUN_C2};
