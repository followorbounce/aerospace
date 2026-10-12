/* ============ CONSTANTS ============ */
var G_KPC = 4.30091e-6;                 /* G in kpc (km/s)² / M☉ */
var G_PC = 4.30091e-3;                  /* G in pc (km/s)² / M☉ */
var C_KMS = 299792.458, MPC_LY = 3.26156e6, GYR_S = 3.15576e16, MPC_KM = 3.0856775814913673e19;
var PLANCK18 = {H0:67.36, Om:0.3153, OL:0.6847, obh2:0.02237, och2:0.1200};   /* TT,TE,EE+lowE+lensing [2] */
var SIGMA_E = 0.26;                                                             /* Euclid intrinsic-ellipticity spread [13] */
var EUCLID = {area:14000, gal:1.5e9, fov:0.54};                                 /* deg², galaxies, deg² [13] */
var EUCLID_DENSITY = EUCLID.gal/(EUCLID.area*3600);                             /* galaxies per arcmin² */

/* NGC 3198 mass model from SPARC (Lelli, McGaugh & Schombert 2016), D = 13.8 Mpc [5][6]:
   [R kpc, V_obs km/s, error km/s, V_gas km/s, V_disk km/s for Υ = 1 at 3.6 µm] */
var N3198 = [[0.32,24.40,35.90,0.00,63.28],[0.64,43.30,16.30,0.00,73.66],[0.96,45.50,16.10,0.00,78.98],[1.28,58.50,15.40,0.35,82.70],[1.61,68.80,7.61,0.15,84.22],[1.93,76.90,10.30,-0.05,83.17],[2.24,82.00,8.09,-0.47,87.04],[2.57,86.90,7.60,-0.95,88.91],[2.89,97.60,3.03,-1.43,88.98],[3.21,100.00,5.31,-1.14,93.81],[3.54,107.00,7.51,-0.39,101.22],[3.85,113.00,7.32,0.36,108.53],[4.17,117.00,5.21,1.52,115.51],[4.50,119.00,5.67,3.07,120.51],[4.82,127.00,5.39,4.63,125.42],[5.15,132.00,4.34,6.02,129.40],[5.46,134.00,2.36,7.16,133.15],[5.78,137.00,0.89,8.31,136.45],[6.10,140.00,2.84,9.46,139.41],[6.43,142.00,0.88,10.61,141.85],[6.74,144.00,1.23,11.77,142.32],[7.06,146.00,1.57,12.87,140.94],[8.04,147.00,3.00,16.39,135.68],[9.04,148.00,3.00,20.03,130.79],[10.04,152.00,2.00,23.68,128.10],[11.04,155.00,2.00,27.08,126.67],[12.05,156.00,2.00,30.11,124.98],[14.05,157.00,2.00,34.48,118.12],[16.07,153.00,2.00,36.43,108.22],[18.13,153.00,2.00,37.76,101.10],[20.05,154.00,2.00,39.83,96.40],[22.12,153.00,2.00,40.92,91.56],[24.03,150.00,2.00,41.77,87.03],[26.10,149.00,2.00,43.71,82.67],[28.16,148.00,2.00,45.41,79.06],[30.08,146.00,2.00,45.29,76.07],[32.14,147.00,2.00,44.56,73.27],[34.06,148.00,2.00,44.81,70.91],[36.12,148.00,2.00,45.90,68.62],[38.19,149.00,2.00,46.75,66.59],[40.10,150.00,2.00,47.48,64.84],[42.17,150.00,3.00,48.93,63.10],[44.08,149.00,3.00,47.84,61.63]];

/* ============ NUMBER FORMATTING ============ */
var SUPS = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(x, d){
  if(!(x > 0)) return '0';
  var e = Math.floor(Math.log10(x)), m = x/Math.pow(10, e);
  if(+m.toFixed(d) >= 10){ m /= 10; e += 1; }
  return fmt(m, d) + ' × 10' + String(e).split('').map(function(c){ return SUPS[c]; }).join('');
}
function big(n){ return n >= 1e9 ? fmt(n/1e9, 2) + T(' billion',' млрд') : n >= 1e6 ? fmt(n/1e6, 2) + T(' million',' млн') : fmtInt(n); }
function ariaLang(){
  Array.prototype.forEach.call(document.querySelectorAll('[data-aria-en]'), function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
}

/* ============ CH1 — BUDGET ============ */
function budget(p){
  var h = p.H0/100, ob = p.obh2/(h*h), oc = p.och2/(h*h);
  return {b:ob, c:oc, L:p.OL, ratio:oc/ob};
}

/* ============ CH2 — ROTATION CURVE ============ */
function vVis2(r, Y){ return r[3]*Math.abs(r[3]) + Y*r[4]*r[4]; }
/* pseudo-isothermal halo: v² = 4πGρ₀Rc²[1 − (Rc/R) arctan(R/Rc)]; returns v² per unit ρ₀ (M☉/pc³), R and Rc in kpc */
function haloUnit(R, Rc){ var rc = Rc*1000; return 4*Math.PI*G_PC*rc*rc*(1 - (Rc/R)*Math.atan(R/Rc)); }
/* weighted least squares in v²: for each trial Rc, ρ₀ is linear; keep the Rc with the lowest χ² in v */
function fitHalo(Y){
  var best = null;
  for(var i = 0; i <= 400; i++){
    var Rc = Math.pow(10, -0.5 + 2*i/400), num = 0, den = 0;
    N3198.forEach(function(r){ var s = 2*r[1]*r[2], w = 1/(s*s), f = haloUnit(r[0], Rc), d = r[1]*r[1] - vVis2(r, Y); num += w*f*d; den += w*f*f; });
    var rho = Math.max(0, num/den), chi = 0;
    N3198.forEach(function(r){ var v = Math.sqrt(Math.max(0, vVis2(r, Y) + rho*haloUnit(r[0], Rc))); chi += Math.pow((r[1] - v)/r[2], 2); });
    if(!best || chi < best.chi) best = {Rc:Rc, rho:rho, chi:chi};
  }
  best.dof = N3198.length - 2;
  return best;
}
function massInside(v, R){ return v*v*R/G_KPC; }
function rotSummary(Y){
  var last = N3198[N3198.length - 1], r14 = N3198.filter(function(r){ return r[0] === 14.05; })[0];
  var Mtot = massInside(last[1], last[0]), Mvis = vVis2(last, Y)*last[0]/G_KPC;
  var M14 = vVis2(r14, Y)*r14[0]/G_KPC;
  return {R:last[0], vObs:last[1], vVis:Math.sqrt(Math.max(0, vVis2(last, Y))), Mtot:Mtot, Mvis:Mvis, dark:1 - Mvis/Mtot, M14:M14, vKep:Math.sqrt(G_KPC*M14/last[0])};
}

var rotY = document.getElementById('rotY'), showHalo = true, hud1 = document.getElementById('hud-alt'), hud2 = document.getElementById('hud-vel');
function renderRot(){
  var Y = +rotY.value, fit = fitHalo(Y), s = rotSummary(Y), svg = document.getElementById('rotSvg');
  document.getElementById('rotYVal').textContent = fmt(Y, 2);
  rotY.setAttribute('aria-valuetext', fmt(Y, 2));
  svg.innerHTML = '';
  var L = 46, R = 466, Tp = 24, B = 270, xmax = 46, ymax = 200;
  function X(r){ return L + r/xmax*(R - L); }
  function Yv(v){ return B - v/ymax*(B - Tp); }
  [0, 50, 100, 150, 200].forEach(function(v){ ns('line', {x1:L, y1:Yv(v), x2:R, y2:Yv(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Yv(v) + 4, fmtInt(v), 'svg-small', 'end'); });
  [0, 10, 20, 30, 40].forEach(function(r){ txt(svg, X(r), B + 16, fmtInt(r), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  function curve(fn, attrs){
    var d = '', pen = false;
    for(var r = 0.3; r <= 44.2; r += 0.2){ var v = fn(r); if(isNaN(v)){ pen = false; continue; } d += (pen ? 'L' : 'M') + X(r).toFixed(1) + ',' + Yv(Math.min(ymax, v)).toFixed(1); pen = true; }
    attrs.d = d; attrs.fill = 'none'; ns('path', attrs, svg);
  }
  /* interpolate the tabulated gas and disk speeds */
  function interp(r, k){
    for(var i = 1; i < N3198.length; i++){ if(N3198[i][0] >= r){ var a = N3198[i - 1], b = N3198[i], t = (r - a[0])/(b[0] - a[0]); return a[k] + t*(b[k] - a[k]); } }
    return N3198[N3198.length - 1][k];
  }
  function visAt(r){ var g = interp(r, 3), dk = interp(r, 4); return Math.sqrt(Math.max(0, g*Math.abs(g) + Y*dk*dk)); }
  /* Keplerian fall-off from the visible mass inside 14 kpc */
  curve(function(r){ return r < 14.05 ? NaN : Math.sqrt(G_KPC*s.M14/r); }, {stroke:'#7a7a74', 'stroke-dasharray':'2 3', 'stroke-width':1.4});
  curve(visAt, {stroke:'#a8741a', 'stroke-width':2});
  if(showHalo){
    curve(function(r){ return Math.sqrt(fit.rho*haloUnit(r, fit.Rc)); }, {stroke:'#2f5aa1', 'stroke-dasharray':'5 3', 'stroke-width':1.6});
    curve(function(r){ var v = visAt(r); return Math.sqrt(v*v + fit.rho*haloUnit(r, fit.Rc)); }, {stroke:'#b5452a', 'stroke-width':2.2});
  }
  N3198.forEach(function(p){
    ns('line', {x1:X(p[0]), y1:Yv(Math.min(ymax, p[1] + p[2])), x2:X(p[0]), y2:Yv(Math.max(0, p[1] - p[2])), stroke:'#0b0b0c', 'stroke-width':0.8}, svg);
    ns('circle', {cx:X(p[0]), cy:Yv(p[1]), r:2.4, fill:'#0b0b0c'}, svg);
  });
  txt(svg, L, 14, T('speed, km/s','скорость, км/с'), 'svg-small');
  txt(svg, R, B + 32, T('distance from the centre, kpc','расстояние от центра, кпк'), 'svg-small', 'end');
  /* legend under the plot, two columns, so it never covers the data */
  [[T('● observed','● наблюдения'), '#0b0b0c'], [T('— visible matter','— видимое вещество'), '#8a5f12'], [T('┄ Kepler from 14 kpc','┄ Кеплер от 14 кпк'), '#5f5f59']].concat(showHalo ? [[T('╌ dark halo','╌ тёмное гало'), '#2f5aa1'], [T('— visible + halo','— видимое + гало'), '#b5452a']] : []).forEach(function(l, i){
    var t = txt(svg, i < 3 ? L : 270, 318 + 16*(i % 3), l[0], 'svg-small'); t.setAttribute('fill', l[1]);
  });
  cells(document.getElementById('rotReadout'), [
    [T('OBSERVED AT 44 kpc','НАБЛЮДАЕТСЯ НА 44 кпк'), fmtInt(s.vObs) + T(' km/s',' км/с')],
    [T('VISIBLE MATTER ALONE','ОДНО ВИДИМОЕ ВЕЩЕСТВО'), fmtInt(s.vVis) + T(' km/s',' км/с')],
    [T('MASS NEEDED INSIDE 44 kpc','НУЖНАЯ МАССА ВНУТРИ 44 кпк'), sci(s.Mtot, 2) + ' M☉'],
    [T('VISIBLE MASS','ВИДИМАЯ МАССА'), sci(s.Mvis, 2) + ' M☉'],
    [T('DARK SHARE','ДОЛЯ ТЁМНОГО'), fmt(s.dark*100, 0) + ' %'],
    [T('HALO FIT χ² / DOF','КАЧЕСТВО ПОДГОНКИ χ² / СТ. СВ.'), fmt(fit.chi/fit.dof, 2)],
    [T('HALO CORE R_c · DENSITY ρ₀','ЯДРО ГАЛО R_c · ПЛОТНОСТЬ ρ₀'), fmt(fit.Rc, 2) + T(' kpc · ',' кпк · ') + fmt(fit.rho, 3) + T(' M☉/pc³',' M☉/пк³'), true]
  ]);
  hud1.textContent = fmt(s.dark*100, 0) + ' %';
  document.getElementById('rotStatus').textContent = fit.chi/fit.dof > 2
    ? T('With this Υ the fit is poor: the visible matter alone overshoots or undershoots the inner curve, and no halo of this shape can fix it.','При таком Υ подгонка плохая: одно видимое вещество завышает или занижает внутреннюю часть кривой, и гало такой формы этого не исправит.')
    : T('The visible matter would give ' + fmtInt(s.vVis) + ' km/s at the edge; Kepler from the inner mass even less, ' + fmtInt(s.vKep) + ' km/s. Holding ' + fmtInt(s.vObs) + ' km/s needs about ' + fmt(s.dark*100, 0) + ' % of the mass to be dark.','Видимое вещество дало бы на краю ' + fmtInt(s.vVis) + ' км/с, а по Кеплеру от внутренней массы — ещё меньше, ' + fmtInt(s.vKep) + ' км/с. Чтобы удерживать ' + fmtInt(s.vObs) + ' км/с, около ' + fmt(s.dark*100, 0) + ' % массы должно быть тёмным.');
}
rotY.addEventListener('input', function(){ pressGroup(document.getElementById('rotPre'), null); renderRot(); });
Array.prototype.forEach.call(document.querySelectorAll('#rotPre .btn'), function(btn){ btn.addEventListener('click', function(){ rotY.value = this.getAttribute('data-y'); pressGroup(this.parentNode, this); renderRot(); }); });
document.getElementById('rotHalo').addEventListener('click', function(){
  showHalo = !showHalo; this.classList.toggle('active', showHalo); this.setAttribute('aria-pressed', showHalo ? 'true' : 'false');
  renderRot();
});

/* ============ CH3 — COSMOLOGY ============ */
function Ez2(z, c){ var a = 1 + z, Ok = 1 - c.Om - c.OL; return c.Om*a*a*a + Ok*a*a + c.OL; }
/* comoving integral ∫₀^z dz/E in units of c/H₀ (Simpson); NaN if E² ≤ 0 anywhere on the way (no Big Bang in that universe) */
function chiInt(z, c){
  var n = 600, s = 0;
  for(var i = 0; i <= n; i++){ var e2 = Ez2(z*i/n, c); if(e2 <= 0) return NaN; var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w/Math.sqrt(e2); }
  return s*z/(3*n);
}
/* luminosity distance in units of c/H₀ */
function dLunit(z, c){
  var x = chiInt(z, c), Ok = 1 - c.Om - c.OL;
  if(isNaN(x)) return NaN;
  if(Ok > 1e-9) x = Math.sinh(Math.sqrt(Ok)*x)/Math.sqrt(Ok);
  else if(Ok < -1e-9) x = Math.sin(Math.sqrt(-Ok)*x)/Math.sqrt(-Ok);
  return (1 + z)*x;
}
function dLmpc(z, c){ return dLunit(z, c)*C_KMS/PLANCK18.H0; }
/* distance modulus difference against the empty universe (Ω = 0), whose d_L = z(1 + z/2) */
function dMuEmpty(z, c){ return 5*Math.log10(dLunit(z, c)/(z*(1 + z/2))); }
/* age today in Gyr: t₀ = ∫ 2u² du / (H₀ √(Ω_m + Ω_k u² + Ω_Λ u⁶)), a = u² */
function age(c){
  var n = 2000, s = 0, Ok = 1 - c.Om - c.OL;
  for(var i = 0; i <= n; i++){ var u = i/n, q = c.Om + Ok*u*u + c.OL*Math.pow(u, 6); if(q < 0) return NaN; if(q === 0){ if(i === 0 && Ok > 0) continue; return NaN; } var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w*2*u*u/Math.sqrt(q); }
  return s/(3*n)*MPC_KM/PLANCK18.H0/GYR_S;
}
var RIESS_CMP = {Om:0.2, OL:0};
var snZ = document.getElementById('snZ'), snM = document.getElementById('snM'), snL = document.getElementById('snL');
function renderSN(){
  var z = +snZ.value, c = {Om:+snM.value, OL:+snL.value}, svg = document.getElementById('snSvg');
  document.getElementById('snZVal').textContent = fmt(z, 2);
  document.getElementById('snMVal').textContent = fmt(c.Om, 3);
  document.getElementById('snLVal').textContent = fmt(c.OL, 3);
  snZ.setAttribute('aria-valuetext', fmt(z, 2)); snM.setAttribute('aria-valuetext', fmt(c.Om, 3)); snL.setAttribute('aria-valuetext', fmt(c.OL, 3));
  svg.innerHTML = '';
  var L = 52, R = 466, Tp = 24, B = 270, zmax = 1.5, ylo = -0.8, yhi = 0.6;
  function X(zz){ return L + zz/zmax*(R - L); }
  function Yd(d){ return B - (d - ylo)/(yhi - ylo)*(B - Tp); }
  [-0.8, -0.4, 0, 0.4].forEach(function(d){ ns('line', {x1:L, y1:Yd(d), x2:R, y2:Yd(d), stroke:d === 0 ? '#0b0b0c' : '#e4e4de'}, svg); txt(svg, L - 6, Yd(d) + 4, (d > 0 ? '+' : '') + fmt(d, 1), 'svg-small', 'end'); });
  [0, 0.5, 1, 1.5].forEach(function(zz){ txt(svg, X(zz), B + 16, fmt(zz, 1), 'svg-small', 'middle'); });
  function curve(cc, attrs){
    var d = '';
    for(var zz = 0.02; zz <= zmax + 1e-9; zz += 0.02){ var v = dMuEmpty(zz, cc); if(isNaN(v)) break; var vc = Math.max(ylo, Math.min(yhi, v)); d += (d ? 'L' : 'M') + X(zz).toFixed(1) + ',' + Yd(vc).toFixed(1); if(vc !== v){ txt(svg, X(zz), Yd(vc) + (v > yhi ? 12 : -4), v > yhi ? '▲' : '▼', 'svg-small', 'middle'); break; } }
    if(d){ attrs.d = d; attrs.fill = 'none'; ns('path', attrs, svg); }
    return d;
  }
  curve({Om:PLANCK18.Om, OL:PLANCK18.OL}, {stroke:'#7a7a74', 'stroke-dasharray':'5 3', 'stroke-width':1.3});
  curve(RIESS_CMP, {stroke:'#7a7a74', 'stroke-dasharray':'1.5 3', 'stroke-width':1.6});
  curve({Om:1, OL:0}, {stroke:'#7a7a74', 'stroke-dasharray':'7 3 1.5 3', 'stroke-width':1.3});
  [[{Om:PLANCK18.Om, OL:PLANCK18.OL}, 'Planck', 'Planck'], [RIESS_CMP, 'Ω_m 0.2', 'Ω_m 0,2'], [{Om:1, OL:0}, T('matter only','только вещество'), T('matter only','только вещество')]].map(function(k){
    var v = dMuEmpty(zmax, k[0]); return isNaN(v) ? null : {y: Yd(Math.max(ylo, Math.min(yhi, v))) - 5, t: T(k[1], k[2])};
  }).filter(Boolean).sort(function(a, b){ return a.y - b.y; }).forEach(function(l, i, a){
    /* keep the end labels at least 13 px apart so they never overprint each other */
    if(i && l.y < a[i-1].y + 13) l.y = a[i-1].y + 13;
    var e = txt(svg, R - 2, l.y, l.t, 'svg-small', 'end'); if(e && e.classList) e.classList.add('svg-halo');
  });
  curve(c, {stroke:'#b5452a', 'stroke-width':2.4});
  var dm = dMuEmpty(z, c);
  if(!isNaN(dm)) ns('circle', {cx:X(z), cy:Yd(Math.max(ylo, Math.min(yhi, dm))), r:5, fill:'#b5452a', stroke:'#fff', 'stroke-width':1.5}, svg);
  txt(svg, L, 14, T('Δμ vs an empty universe, mag (+ = farther)','Δμ относительно пустой Вселенной, зв. вел. (+ = дальше)'), 'svg-small');
  txt(svg, R, B + 32, T('redshift z','красное смещение z'), 'svg-small', 'end');
  var dl = dLmpc(z, c), ratio = dLunit(z, c)/dLunit(z, RIESS_CMP), t0 = age(c);
  /* E² reaches zero somewhere in the past (the age integral fails): that universe bounced instead of starting from a Big Bang */
  if(isNaN(t0) || isNaN(dl)){
    cells(document.getElementById('snReadout'), [[T('THIS UNIVERSE','ЭТА ВСЕЛЕННАЯ'), T('no Big Bang: it would have bounced','без Большого взрыва: она бы «отскочила»'), true]]);
    document.getElementById('snStatus').textContent = T('So much dark energy and so little matter that the universe would have contracted and re-expanded instead of starting from a Big Bang: no distances to compute.','Так много тёмной энергии и так мало вещества, что Вселенная сжалась бы и снова расширилась вместо того, чтобы начаться с Большого взрыва: считать расстояния нечего.');
    return;
  }
  cells(document.getElementById('snReadout'), [
    [T('DISTANCE (LUMINOSITY)','РАССТОЯНИЕ (ФОТОМЕТРИЧЕСКОЕ)'), fmt(dl*MPC_LY/1e9, 2) + T(' billion ly',' млрд св. лет')],
    [T('VS LOW DENSITY, NO Λ','ОТНОСИТЕЛЬНО МАЛОЙ ПЛОТНОСТИ БЕЗ Λ'), (ratio >= 1 ? '+' : '−') + fmt(Math.abs(ratio - 1)*100, 1) + ' %'],
    [T('Δμ VS EMPTY','Δμ ОТНОСИТЕЛЬНО ПУСТОЙ'), (dm >= 0 ? '+' : '−') + fmt(Math.abs(dm), 3) + T(' mag',' зв. вел.')],
    [T('AGE TODAY','ВОЗРАСТ СЕГОДНЯ'), isNaN(t0) ? '—' : fmt(t0, 2) + T(' Gyr',' млрд лет')]
  ]);
  var flat = Math.abs(1 - c.Om - c.OL) < 0.005;
  document.getElementById('snStatus').textContent = dm > 0.005
    ? T('Farther than in an empty universe: along this supernova\'s light path, the speeding-up has outweighed any earlier slowing-down' + (flat ? ' (flat universe).' : '.'),'Дальше, чем в пустой Вселенной: на пути света этой сверхновой ускорение расширения перевесило более раннее замедление' + (flat ? ' (плоская Вселенная).' : '.'))
    : dm < -0.005 && c.OL > 0 ? T('Closer than in an empty universe: this light set out while matter still dominated and gravity was slowing the expansion, and the later speeding-up has not yet made up for it. That happens even in an accelerating universe — the 1998 supernovae, below z = 1, saw the net speeding-up.','Ближе, чем в пустой Вселенной: этот свет вышел, когда ещё преобладало вещество и гравитация тормозила расширение, и позднейшее ускорение пока не возместило торможения. Так бывает и в ускоряющейся Вселенной: сверхновые 1998 года, на z меньше 1, увидели итоговое ускорение.')
    : dm < -0.005 ? T('Closer than in an empty universe: gravity has been slowing the expansion. The 1998 supernovae said otherwise.','Ближе, чем в пустой Вселенной: гравитация замедляла расширение. Сверхновые 1998 года показали обратное.')
    : T('About as far as in an empty universe: speeding up and slowing down roughly cancel at this redshift.','Примерно как в пустой Вселенной: ускорение и замедление на этом красном смещении примерно уравновешиваются.');
}
[snZ, snM, snL].forEach(function(el){ el.addEventListener('input', function(){ if(el !== snZ) pressGroup(document.getElementById('snPre'), null); renderSN(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#snPre .btn'), function(btn){ btn.addEventListener('click', function(){ snM.value = this.getAttribute('data-m'); snL.value = this.getAttribute('data-l'); pressGroup(this.parentNode, this); renderSN(); }); });

/* ============ CH4 — WEAK LENSING ============ */
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
function gauss(r){ var u = 1 - r(), v = r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function shapeNoise(N){ return SIGMA_E/Math.sqrt(N); }
function snr(g, N){ return g*Math.sqrt(N)/SIGMA_E; }
function galaxiesFor(target, g){ return Math.pow(target*SIGMA_E/g, 2); }
function sampleGalaxies(n, g, seed){
  var r = rng(seed), out = [];
  for(var i = 0; i < n; i++){
    var e1, e2;
    do { e1 = SIGMA_E*gauss(r); e2 = SIGMA_E*gauss(r); } while(e1*e1 + e2*e2 > 0.81);
    out.push({e1:e1 + g, e2:e2, x:r(), y:r(), s:0.6 + 0.8*r()});
  }
  return out;
}
var wlN = document.getElementById('wlN'), wlG = document.getElementById('wlG'), wlSeed = 7;
function renderWL(){
  var N = Math.pow(10, +wlN.value), g = +wlG.value/100, svg = document.getElementById('wlSvg');
  var Nr = Math.max(1, Math.round(N));
  document.getElementById('wlNVal').textContent = big(Nr);
  document.getElementById('wlGVal').textContent = fmt(g*100, 1) + ' %';
  wlN.setAttribute('aria-valuetext', big(Nr)); wlG.setAttribute('aria-valuetext', fmt(g*100, 1) + ' %');
  svg.innerHTML = '';
  var gal = sampleGalaxies(48, g, wlSeed), W = 300, H = 230, ox = 14, oy = 30;
  ns('rect', {x:ox, y:oy, width:W, height:H, fill:'#0b0b0c'}, svg);
  var cols = 8, rows = 6;
  gal.forEach(function(p, i){
    var e = Math.sqrt(p.e1*p.e1 + p.e2*p.e2), q = (1 - e)/(1 + e), ang = 0.5*Math.atan2(p.e2, p.e1)*180/Math.PI;
    var cx = ox + (i % cols + 0.5)*W/cols + (p.x - 0.5)*10, cy = oy + (Math.floor(i/cols) + 0.5)*H/rows + (p.y - 0.5)*8, a = 11*p.s;
    ns('ellipse', {cx:cx.toFixed(1), cy:cy.toFixed(1), rx:(a/Math.sqrt(q)).toFixed(2), ry:(a*Math.sqrt(q)).toFixed(2), fill:'#e8dcc0', opacity:0.9, transform:'rotate(' + (-ang).toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')'}, svg);
  });
  txt(svg, ox, 20, T('48 galaxies, shear γ = ','48 галактик, сдвиг γ = ') + fmt(g*100, 1) + T(' % (to scale)',' % (в масштабе)'), 'svg-small');
  /* gauge: true shear, average of the 48 drawn, ±1σ for N */
  var mean48 = gal.reduce(function(a, p){ return a + p.e1; }, 0)/gal.length, sig = shapeNoise(Nr), gx = 340, gw = 120, gy0 = 40, gy1 = 250, lo = -0.08, hi = 0.12;
  function GY(v){ return gy1 - (Math.max(lo, Math.min(hi, v)) - lo)/(hi - lo)*(gy1 - gy0); }
  ns('line', {x1:gx + 40, y1:gy0, x2:gx + 40, y2:gy1, stroke:'#0b0b0c'}, svg);
  [-0.05, 0, 0.05, 0.1].forEach(function(v){ ns('line', {x1:gx + 36, y1:GY(v), x2:gx + 44, y2:GY(v), stroke:'#0b0b0c'}, svg); txt(svg, gx + 32, GY(v) + 4, fmt(v*100, 0) + ' %', 'svg-small', 'end'); });
  ns('rect', {x:gx + 52, y:GY(g + sig), width:22, height:Math.max(1, GY(g - sig) - GY(g + sig)), fill:'#2f5aa1', opacity:0.25}, svg);
  ns('line', {x1:gx + 48, y1:GY(g), x2:gx + 78, y2:GY(g), stroke:'#b5452a', 'stroke-width':2.5}, svg);
  ns('circle', {cx:gx + 63, cy:GY(mean48), r:4, fill:'#0b0b0c'}, svg);
  txt(svg, gx + 82, GY(g) + 4, T('true','истинный'), 'svg-small svg-halo');
  txt(svg, gx + 82, GY(mean48) + 16, T('mean','среднее'), 'svg-small svg-halo');
  txt(svg, gx + 40, gy1 + 22, T('shaded: ±1σ for N','заливка: ±1σ для N'), 'svg-small', 'middle');
  var S = snr(g, Nr), need = galaxiesFor(10, g), area = need/EUCLID_DENSITY;
  cells(document.getElementById('wlReadout'), [
    [T('NOISE ON THE AVERAGE','ШУМ СРЕДНЕГО'), '± ' + (sig >= 0.001 ? fmt(sig*100, 2) : fmt(sig*100, 4)) + ' %'],
    [T('SIGNAL / NOISE','СИГНАЛ / ШУМ'), S < 100 ? fmt(S, 1) : fmtInt(S)],
    [T('GALAXIES FOR S/N = 10','ГАЛАКТИК ДЛЯ S/N = 10'), big(Math.ceil(need))],
    [T('SKY FOR THAT, EUCLID DENSITY','ПЛОЩАДЬ НЕБА ПРИ ПЛОТНОСТИ EUCLID'), area < 3600 ? fmtInt(area) + T(' arcmin²',' угл. мин²') : fmt(area/3600, 2) + T(' deg²',' кв. град.')]
  ]);
  hud2.textContent = S < 100 ? fmt(S, 1) : fmtInt(S);
  document.getElementById('wlStatus').textContent = S < 1
    ? T('The galaxies\' own shapes swamp the shear: the average is noise.','Собственные формы галактик заглушают сдвиг: среднее — это шум.')
    : S < 10 ? T('A hint of the shear, not yet a measurement.','Намёк на сдвиг, но ещё не измерение.')
    : T('Averaging has beaten the shape noise: the shear is measured. Euclid maps how it changes across the whole sky.','Усреднение победило шум форм: сдвиг измерен. Euclid картографирует, как он меняется по всему небу.');
}
[wlN, wlG].forEach(function(el){ el.addEventListener('input', function(){ if(el === wlN) pressGroup(document.getElementById('wlPre'), null); renderWL(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#wlPre .btn'), function(btn){ btn.addEventListener('click', function(){ wlN.value = this.getAttribute('data-n'); pressGroup(this.parentNode, this); renderWL(); }); });
document.getElementById('wlNew').addEventListener('click', function(){ wlSeed += 1; renderWL(); });

/* ============ CH5 — FIELDS OF VIEW ============ */
var FOV = [
  {en:'Hubble WFC3 (infrared)', ru:'«Хаббл», WFC3 (ИК)', mirror:2.4, deg2:4.5/3600},
  {en:'Webb NIRCam', ru:'«Уэбб», NIRCam', mirror:6.5, deg2:9.7/3600},
  {en:'Euclid VIS / NISP', ru:'Euclid, VIS / NISP', mirror:1.2, deg2:0.54},
  {en:'Roman WFI', ru:'Roman, WFI', mirror:2.4, deg2:0.281}
];
function pointings(area, fov){ return area/fov; }
function renderFov(){
  var head = [T('CAMERA','КАМЕРА'), T('MIRROR','ЗЕРКАЛО'), T('FIELD OF VIEW','ПОЛЕ ЗРЕНИЯ'), T('POINTINGS FOR 1,000 deg²','НАВЕДЕНИЙ НА 1000 КВ. ГРАД.')];
  document.getElementById('fovTable').innerHTML = '<thead><tr>' + head.map(function(h){ return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
    FOV.map(function(f){
      var fv = f.deg2 < 0.01 ? fmt(f.deg2*3600, 1) + T(' arcmin²',' угл. мин²') : fmt(f.deg2, f.deg2 < 0.5 ? 3 : 2) + T(' deg²',' кв. град.');
      return '<tr><th scope="row">' + T(f.en, f.ru) + '</th><td class="n">' + fmt(f.mirror, 1) + T(' m',' м') + '</td><td class="n">' + fv + '</td><td class="n">' + fmtInt(pointings(1000, f.deg2)) + '</td></tr>';
    }).join('') + '</tbody>';
}

/* ============ CH6 — SIGNIFICANCE ============ */
/* two-sided Gaussian tail probability; erfc by the Chebyshev fit of Numerical Recipes (fractional error < 1.2e-7) */
function erfc(x){
  var t = 1/(1 + 0.5*Math.abs(x));
  var y = t*Math.exp(-x*x - 1.26551223 + t*(1.00002368 + t*(0.37409196 + t*(0.09678418 + t*(-0.18628806 + t*(0.27886807 + t*(-1.13520398 + t*(1.48851587 + t*(-0.82215223 + t*0.17087277)))))))));
  return x >= 0 ? y : 2 - y;
}
function twoSidedP(sigma){ return erfc(sigma/Math.SQRT2); }

/* ============ CH7 — TIMELINE ============ */
var TIMELINE = [
  ['1933', 'Zwicky: the Coma cluster needs at least 400 times more mass than its light shows [1].', 'Цвикки: скоплению Волос Вероники нужно по меньшей мере в 400 раз больше массы, чем видно по свету [1].'],
  ['1970', 'Rubin and Ford: the Andromeda galaxy\'s mass keeps growing with radius [3].', 'Рубин и Форд: масса галактики Андромеды продолжает расти с радиусом [3].'],
  ['1980', 'Rubin, Ford and Thonnard: flat rotation curves in 21 spiral galaxies [4].', 'Рубин, Форд и Тоннард: плоские кривые вращения у 21 спиральной галактики [4].'],
  ['1998', 'Riess and colleagues: distant supernovae are farther than a slowing universe allows [8]; Perlmutter\'s team agrees [9].', 'Рисс с коллегами: далёкие сверхновые дальше, чем допускает замедляющаяся Вселенная [8]; команда Перлмуттера подтверждает [9].'],
  ['2011', 'Nobel Prize in Physics to Perlmutter, Schmidt and Riess [10].', 'Нобелевская премия по физике Перлмуттеру, Шмидту и Риссу [10].'],
  ['2018', 'Planck\'s final results: 4.9 % ordinary matter, 26.5 % dark matter, 68.5 % dark energy [2].', 'Итоговые результаты Planck: 4,9 % обычного вещества, 26,5 % тёмной материи, 68,5 % тёмной энергии [2].'],
  ['2023', '<b>1 July:</b> Euclid launches [12].', '<b>1 июля:</b> запуск Euclid [12].'],
  ['2024', '<b>14 February:</b> Euclid\'s survey begins [13].', '<b>14 февраля:</b> начало обзора Euclid [13].'],
  ['2025', '<b>March:</b> Euclid\'s quick release, 63.1 deg² [14]; DESI hints that dark energy may be weakening [22].', '<b>Март:</b> быстрый выпуск данных Euclid, 63,1 кв. градуса [14]; DESI намекает, что тёмная энергия может ослабевать [22].'],
  ['2026', '<b>30 August:</b> Roman launches [16]. <b>November (planned):</b> Euclid DR1, first stage [15].', '<b>30 августа:</b> запуск Roman [16]. <b>Ноябрь (план):</b> первый этап выпуска Euclid DR1 [15].'],
  ['2027', '<b>Planned:</b> Roman\'s first science images expected [16]; Euclid\'s full DR1 lensing products [15].', '<b>План:</b> ожидаются первые научные изображения Roman [16]; полные продукты Euclid DR1 для линзирования [15].']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'F. Zwicky (1933), “Die Rotverschiebung von extragalaktischen Nebeln”, Helv. Phys. Acta 6, 110 — English translation by H. Andernach (2017), arXiv:1711.01693', url:'https://arxiv.org/abs/1711.01693', note:{en:'Coma cluster: Doppler velocities of 1,000 km/s or more need an average density at least 400 times that of luminous matter; “dark matter exists in much greater density than luminous matter”; expansion rate of his day 558 km/s per million parsecs (Hubble & Humason 1931).', ru:'Скопление Волос Вероники: доплеровские скорости 1000 км/с и более требуют средней плотности, по меньшей мере в 400 раз превышающей плотность светящегося вещества; «тёмного вещества гораздо больше, чем светящегося»; скорость расширения того времени — около 500 км/с на миллион парсек.'}},
  {title:'Planck Collaboration (2020), “Planck 2018 results. VI. Cosmological parameters”, A&A 641, A6', url:'https://arxiv.org/abs/1807.06209', note:{en:'TT,TE,EE+lowE+lensing: Ω_b h² = 0.02237, Ω_c h² = 0.1200, H₀ = 67.36 km/s/Mpc, Ω_Λ = 0.6847, Ω_m = 0.3153.', ru:'TT,TE,EE+lowE+lensing: Ω_b h² = 0,02237, Ω_c h² = 0,1200, H₀ = 67,36 км/с/Мпк, Ω_Λ = 0,6847, Ω_m = 0,3153.'}},
  {title:'V. C. Rubin, W. K. Ford (1970), “Rotation of the Andromeda Nebula from a Spectroscopic Survey of Emission Regions”, ApJ 159, 379', url:'https://articles.adsabs.harvard.edu/pdf/1970ApJ...159..379R', note:{en:'67 H II regions from 3 to 24 kpc; beyond 4 kpc the mass inside R grows roughly linearly to 14 kpc.', ru:'67 областей H II на расстояниях от 3 до 24 кпк; за пределами 4 кпк масса внутри R растёт примерно линейно до 14 кпк.'}},
  {title:'V. C. Rubin, W. K. Ford, N. Thonnard (1980), “Rotational properties of 21 Sc galaxies with a large range of luminosities and radii”, ApJ 238, 471', url:'https://articles.adsabs.harvard.edu/pdf/1980ApJ...238..471R', note:{en:'Rotation curves of 21 Sc galaxies with radii from 4 to 122 kpc.', ru:'Кривые вращения 21 галактики типа Sc радиусом от 4 до 122 кпк.'}},
  {title:'F. Lelli, S. S. McGaugh, J. M. Schombert (2016), “SPARC: Mass Models for 175 Disk Galaxies with Spitzer Photometry at 3.6 µm and Accurate Rotation Curves”, AJ 152, 157', url:'https://arxiv.org/abs/1606.09251', note:{en:'Method: observed rotation curves with gas and stellar-disk contributions; disk speeds given for Υ = 1 at 3.6 µm.', ru:'Метод: наблюдаемые кривые вращения с вкладами газа и звёздного диска; скорости диска даны для Υ = 1 на 3,6 мкм.'}},
  {title:'SPARC database (Case Western Reserve University), Rotmod_LTG mass models — NGC 3198 (downloaded 11 October 2026)', url:'https://astroweb.cwru.edu/SPARC/', note:{en:'NGC3198_rotmod.dat: distance 13.8 Mpc; 43 radii from 0.32 to 44.08 kpc with V_obs, error, V_gas, V_disk.', ru:'NGC3198_rotmod.dat: расстояние 13,8 Мпк; 43 радиуса от 0,32 до 44,08 кпк со значениями V_obs, погрешности, V_gas, V_disk.'}},
  {title:'T. S. van Albada, J. N. Bahcall, K. Begeman, R. Sancisi (1985), “Distribution of dark matter in the spiral galaxy NGC 3198”, ApJ 295, 305', url:'https://articles.adsabs.harvard.edu/pdf/1985ApJ...295..305V', note:{en:'Disk-plus-halo models fitted to a new 21 cm (H I) rotation curve reaching 11 disk scale lengths; inside the last point (30 kpc) dark matter outweighs visible matter at least 4 times.', ru:'Модели «диск + гало», подогнанные к новой кривой вращения по линии 21 см (H I), доходящей до 11 шкал диска; внутри последней точки (30 кпк) тёмного вещества по меньшей мере в 4 раза больше, чем видимого.'}},
  {title:'A. G. Riess et al. (1998), “Observational Evidence from Supernovae for an Accelerating Universe and a Cosmological Constant”, AJ 116, 1009', url:'https://arxiv.org/abs/astro-ph/9805201', note:{en:'Distances of high-redshift SNe Ia 10–15 % farther than expected with Ω_M = 0.2 and no cosmological constant; with a flat prior, Ω_Λ > 0 at 7σ and 9σ; without it, at 3.0σ and 4.0σ.', ru:'Расстояния до далёких сверхновых Ia на 10–15 % больше ожидаемых при Ω_M = 0,2 без космологической постоянной; с предположением плоскости Ω_Λ > 0 на уровне 7σ и 9σ; без него — 3,0σ и 4,0σ.'}},
  {title:'S. Perlmutter et al. (1999), “Measurements of Ω and Λ from 42 High-Redshift Supernovae”, ApJ 517, 565', url:'https://arxiv.org/abs/astro-ph/9812133', note:{en:'42 SNe Ia at z = 0.18–0.83; for a flat universe Ω_M = 0.28 (+0.09/−0.08).', ru:'42 сверхновые Ia на z = 0,18–0,83; для плоской Вселенной Ω_M = 0,28 (+0,09/−0,08).'}},
  {title:'NobelPrize.org, “The Nobel Prize in Physics 2011” press release', url:'https://www.nobelprize.org/prizes/physics/2011/press-release/', note:{en:'Saul Perlmutter, Brian P. Schmidt and Adam G. Riess, for the discovery of the accelerating expansion of the Universe through observations of distant supernovae.', ru:'Сол Перлмуттер, Брайан Шмидт и Адам Рисс — за открытие ускоренного расширения Вселенной по наблюдениям далёких сверхновых.'}},
  {title:'M. Kilbinger (2015), “Cosmology with cosmic shear observations: a review”, Rep. Prog. Phys. 78, 086901', url:'https://arxiv.org/abs/1411.0115', note:{en:'Typical distortions of high-redshift galaxies by the cosmic web are of the order of a few per cent, much smaller than the spread of intrinsic shapes.', ru:'Типичные искажения далёких галактик космической паутиной — порядка нескольких процентов, гораздо меньше разброса собственных форм.'}},
  {title:'ESA (2023), “ESA’s Euclid lifts off on quest to unravel the cosmic mystery of dark matter and dark energy”', url:'https://www.esa.int/Science_Exploration/Space_Science/Euclid/ESA_s_Euclid_lifts_off_on_quest_to_unravel_the_cosmic_mystery_of_dark_matter_and_dark_energy', note:{en:'Launched on a SpaceX Falcon 9 from Cape Canaveral at 17:12 CEST on 1 July 2023.', ru:'Запущен на SpaceX Falcon 9 с мыса Канаверал в 17:12 по центральноевропейскому летнему времени 1 июля 2023 года.'}},
  {title:'Euclid Collaboration: Y. Mellier et al. (2025), “Euclid. I. Overview of the Euclid mission”, A&A 697, A1', url:'https://arxiv.org/abs/2405.13491', note:{en:'1.2 m Korsch telescope; VIS and NISP share about 0.54 deg²; about 14,000 deg² in six years; shapes of about 1.5 billion galaxies, 35 million redshifts; σ_ε = 0.26; w to about 1 %; survey started 14 February 2024; HST WFC3 4.5 arcmin², JWST NIRCam 9.7 arcmin².', ru:'Телескоп Корша 1,2 м; VIS и NISP делят поле около 0,54 кв. градуса; около 14 000 кв. градусов за шесть лет; формы около 1,5 млрд галактик, 35 млн красных смещений; σ_ε = 0,26; w с точностью около 1 %; обзор начат 14 февраля 2024 года; HST WFC3 — 4,5 угл. мин², JWST NIRCam — 9,7 угл. мин².'}},
  {title:'Euclid Collaboration: H. Aussel et al. (2025), “Euclid Quick Data Release (Q1): Data release overview”', url:'https://arxiv.org/abs/2503.15302', note:{en:'63.1 deg² of the Euclid Deep Fields at nominal wide-survey depth; about 30 million objects.', ru:'63,1 кв. градуса глубоких полей Euclid на номинальной глубине широкого обзора; около 30 млн объектов.'}},
  {title:'ESA Cosmos, “Euclid DR1 timeline” (update of 15 June 2026)', url:'https://www.cosmos.esa.int/web/euclid/dr1-timeline', note:{en:'Two stages: November 2026, raw data, calibrated images, catalogues and spectra over about 1,900 deg² (DR1-Foundation); complete DR1 with clustering and weak-lensing products in mid-2027.', ru:'Два этапа: ноябрь 2026 года — необработанные данные, откалиброванные изображения, каталоги и спектры для около 1900 кв. градусов (DR1-Foundation); полный DR1 с продуктами для кластеризации и слабого линзирования — в середине 2027 года.'}},
  {title:'NASA (2026), “NASA’s Dark Universe-Seeking Nancy Grace Roman Space Telescope Launches”, 30 August 2026', url:'https://www.nasa.gov/news-release/nasas-dark-universe-seeking-nancy-grace-roman-space-telescope-launches/', note:{en:'Launched at 7:26 a.m. EDT on a Falcon Heavy from Launch Complex 39A, Kennedy Space Center; bound for Sun–Earth L2; first images expected by early 2027.', ru:'Запуск в 7:26 по восточному летнему времени США на Falcon Heavy со стартового комплекса 39A Космического центра Кеннеди; курс на точку L2 системы Солнце — Земля; первые изображения ожидаются к началу 2027 года.'}},
  {title:'NASA Science, “Roman — Frequently Asked Questions”', url:'https://science.nasa.gov/mission/roman-space-telescope/frequently-asked-questions/', note:{en:'Primary mirror 7.9 feet (2.4 m) across, the same size as Hubble’s.', ru:'Главное зеркало диаметром 7,9 фута (2,4 м), такого же размера, как у «Хаббла».'}},
  {title:'NASA Science, “Roman WFI Performance” (v1.4, March 2026)', url:'https://science.nasa.gov/mission/roman-space-telescope/wfi-technical', note:{en:'18 H4RG-10 detectors of 4096 × 4096 pixels; 0.8° × 0.4° (0.281 deg², excluding gaps); 0.11″ per pixel; about 200 times Hubble WFC3-IR’s field.', ru:'18 детекторов H4RG-10 по 4096 × 4096 пикселей; 0,8° × 0,4° (0,281 кв. градуса без промежутков); 0,11″ на пиксель; поле примерно в 200 раз больше, чем у WFC3-IR «Хаббла».'}},
  {title:'NASA Science, “Roman — High Latitude Wide Area Survey”', url:'https://science.nasa.gov/mission/roman-space-telescope/high-latitude-wide-area-survey', note:{en:'More than 5,000 square degrees (about 12 % of the sky) in just under a year and a half; weak lensing and galaxy spectroscopy.', ru:'Более 5000 кв. градусов (около 12 % неба) чуть менее чем за полтора года; слабое линзирование и спектроскопия галактик.'}},
  {title:'NASA Science (2026), “NASA Activates Roman’s Primary Instrument, Checks Out Coronagraph”, 15 September 2026', url:'https://science.nasa.gov/blogs/roman/2026/09/15/nasa-activates-romans-primary-instrument-checks-out-coronagraph/', note:{en:'The instrument heater was turned off on 11 September; once the Wide Field Instrument had cooled to −143 °C its 18 infrared detectors were activated; the post reports the instrument operational in space.', ru:'Нагреватель прибора отключили 11 сентября; когда широкоугольный прибор остыл до −143 °C, включили его 18 инфракрасных детекторов; в сообщении прибор назван работающим в космосе.'}},
  {title:'NASA Science (2026), “NASA Checks Roman Guidance System, Takes First Coronagraph Observation”, 30 September 2026', url:'https://science.nasa.gov/blogs/roman/2026/09/30/nasa-checks-roman-guidance-system-takes-first-coronagraph-observation/', note:{en:'Commissioning status: fine-guidance tests 15–21 September; the Coronagraph Instrument saw cosmic light for the first time on 22 September.', ru:'Ход ввода в эксплуатацию: испытания системы точного наведения 15–21 сентября; коронограф впервые получил космический свет 22 сентября.'}},
  {title:'DESI Collaboration (2025), “DESI DR2 Results II: Measurements of Baryon Acoustic Oscillations and Cosmological Constraints”, arXiv:2503.14738', url:'https://arxiv.org/abs/2503.14738', note:{en:'BAO alone well described by flat ΛCDM; with CMB, evolving dark energy preferred at 3.1σ; adding Pantheon+, Union3 or DESY5 supernovae gives 2.8σ, 3.8σ or 4.2σ.', ru:'Одни BAO хорошо описываются плоской ΛCDM; вместе с реликтовым излучением эволюционирующая тёмная энергия предпочтительна на 3,1σ; добавление сверхновых Pantheon+, Union3 или DESY5 даёт 2,8σ, 3,8σ или 4,2σ.'}},
  {title:'B. Popovic et al. (2025), “The Dark Energy Survey Supernova Program: a reanalysis of cosmology results and evidence for evolving dark energy with an updated type Ia supernova calibration” (DES-Dovekie), arXiv:2511.07517', url:'https://arxiv.org/abs/2511.07517', note:{en:'Recalibrated sample: combined with CMB and DESI DR2, the preference for evolving dark energy is 3.2σ, down from 4.2σ — “only a weak preference”.', ru:'Перекалиброванная выборка: вместе с реликтовым излучением и DESI DR2 предпочтение эволюционирующей тёмной энергии — 3,2σ вместо 4,2σ, «лишь слабое предпочтение».'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  ariaLang();
  renderRot(); renderSN(); renderWL(); renderFov();
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
/* start values set from script: browsers round an off-step value attribute, but not a value set through the wrapper in helpers.js */
snM.value = PLANCK18.Om; snL.value = PLANCK18.OL;
wlN.value = Math.log10(EUCLID_DENSITY*3600);
applyLang('en');
window.__dark = {budget:budget, fitHalo:fitHalo, rotSummary:rotSummary, vVis2:vVis2, haloUnit:haloUnit, massInside:massInside,
  dLunit:dLunit, dLmpc:dLmpc, dMuEmpty:dMuEmpty, age:age, shapeNoise:shapeNoise, snr:snr, galaxiesFor:galaxiesFor, sampleGalaxies:sampleGalaxies,
  pointings:pointings, twoSidedP:twoSidedP, FOV:FOV, N3198:N3198, PLANCK18:PLANCK18, EUCLID:EUCLID, EUCLID_DENSITY:EUCLID_DENSITY, SIGMA_E:SIGMA_E, RIESS_CMP:RIESS_CMP};
