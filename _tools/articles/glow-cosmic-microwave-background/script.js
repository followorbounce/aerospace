/* ============ CONSTANTS ============ */
var H_PL = 6.62607015e-34, K_B = 1.380649e-23, C_SI = 299792458;   // exact SI values [15]
var ZETA3 = 1.2020569031595942, WIEN_B = 2.897771955e-3, X_NU = 2.821439372122079;
var T0 = 2.72548;                                                   // Fixsen 2009 [7]
var YEAR_S = 3.15576e7, MPC_KM = 3.0856775814913673e19;
/* Planck 2018, TT,TE,EE+lowE+lensing [11]; radiation from T0 with N_eff = 3.046 massless neutrinos */
var COSMO = (function(){
  var h = 0.6736, Om = 0.3153, Neff = 3.046;
  var Og = 2.4728e-5*Math.pow(T0/2.7255, 4)/(h*h);                 // photons: Ωγ h² = 2.4728e-5 at 2.7255 K
  var Or = Og*(1 + 0.22711*Neff);                                   // + neutrinos: (7/8)(4/11)^(4/3) N_eff
  return {h:h, H0:h*100/MPC_KM, Om:Om, Or:Or, OL:1 - Om - Or, zStar:1089.92, zEq:3402, age:13.797};
})();

/* COBE/FIRAS monopole: [wavenumber cm⁻¹, brightness MJy/sr (2.725 K blackbody + residual), residual kJy/sr, 1σ kJy/sr] [5] */
var FIRAS = [
  [2.27,200.723,5,14],[2.72,249.508,9,19],[3.18,293.024,15,25],[3.63,327.770,4,23],[4.08,354.081,19,22],
  [4.54,372.079,-30,21],[4.99,381.493,-30,18],[5.45,383.478,-10,18],[5.90,378.901,32,16],[6.35,368.833,4,14],
  [6.81,354.063,-2,13],[7.26,336.278,13,12],[7.71,316.076,-22,11],[8.17,293.924,8,10],[8.62,271.432,8,11],
  [9.08,248.239,-21,12],[9.53,225.940,9,14],[9.98,204.327,12,16],[10.44,183.262,11,18],[10.89,163.830,-29,22],
  [11.34,145.750,-46,22],[11.80,128.835,58,23],[12.25,113.568,6,23],[12.71,99.451,-6,23],[13.16,87.036,6,22],
  [13.61,75.876,-17,21],[14.07,65.766,6,20],[14.52,57.008,26,19],[14.97,49.223,-12,19],[15.43,42.267,-19,19],
  [15.88,36.352,8,21],[16.34,31.062,7,23],[16.79,26.580,14,26],[17.24,22.644,-33,28],[17.70,19.255,6,30],
  [18.15,16.391,26,32],[18.61,13.811,-26,33],[19.06,11.716,-6,35],[19.51,9.921,8,41],[19.97,8.364,26,55],
  [20.42,7.087,57,88],[20.87,5.801,-116,155],[21.33,4.523,-432,282]
];

/* Planck's law, I(ν) in MJy/sr for wavenumber ν in cm⁻¹ */
function planckMJy(nuCm, T){
  var nu = nuCm*100*C_SI;
  return 2*H_PL*nu*nu*nu/(C_SI*C_SI)/(Math.exp(H_PL*nu/(K_B*T)) - 1)/1e-20;
}
function nuPeakGHz(T){ return X_NU*K_B*T/H_PL/1e9; }
function wienMM(T){ return WIEN_B/T*1e3; }
function photonsPerCm3(T){ var x = K_B*T/(H_PL*C_SI); return 16*Math.PI*ZETA3*x*x*x/1e6; }
/* root-mean-square difference between the curve and the 43 FIRAS points, each weighted by 1/σ² as FIRAS did, kJy/sr */
function misfit(T){
  var s = 0, w = 0; FIRAS.forEach(function(p){ var d = (planckMJy(p[0], T) - p[1])*1000; s += d*d/(p[3]*p[3]); w += 1/(p[3]*p[3]); }); return Math.sqrt(s/w);
}
var FIRAS_ERR = 20;                                                 // typical weighted error, kJy/sr (≈ 50 ppm of the peak)
var PEAK_KJY = 383670;                                              // peak brightness of the 2.725 K curve, kJy/sr
/* local digit grouping: in Russian, four-digit numbers stay unspaced, as in the body text */
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function bestFitT(){
  var a = 2.6, b = 2.9, g = (Math.sqrt(5) - 1)/2;                  // golden-section search
  for(var i = 0; i < 80; i++){ var c = b - g*(b - a), d = a + g*(b - a); if(misfit(c) < misfit(d)) b = d; else a = c; }
  return (a + b)/2;
}

/* Age of a flat universe at redshift z, years: t = (1/H0) ∫0^a a' da' / √(Ωm a' + Ωr + ΩΛ a'⁴) (Simpson) */
function ageAt(z, noRadiation){
  var Or = noRadiation ? 0 : COSMO.Or, OL = noRadiation ? 1 - COSMO.Om : COSMO.OL;
  var am = 1/(1 + z), n = 4000, hh = am/n, s = 0;
  function f(a){ return a === 0 ? 0 : a/Math.sqrt(COSMO.Om*a + Or + OL*a*a*a*a); }
  for(var i = 0; i <= n; i++){ var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w*f(i*hh); }
  return s*hh/3/COSMO.H0/YEAR_S;
}
function tempAt(z){ return T0*(1 + z); }

/* Doppler dipole */
function skyT(thetaDeg, vKms){
  var b = vKms/(C_SI/1000), g = 1/Math.sqrt(1 - b*b);
  return T0/(g*(1 - b*Math.cos(thetaDeg*Math.PI/180)));
}
function dipoleMK(vKms){ return T0*vKms/(C_SI/1000)*1000; }
var RIPPLE_UK = 30;                                                 // COBE DMR, 10° smoothing [9]

/* Ripple strength ΔT_ℓ = √(ℓ(ℓ+1)C_ℓ/2π) in µK. Anchors: WMAP peak/trough/peak [14]; the rest is illustrative. */
var PEAKS = [[220.1,74.7],[411.7,41.0],[546,48.8]];
var SPEC = [[2,30],[20,32],[60,40],[120,56],[220.1,74.7],[300,62],[411.7,41.0],[546,48.8],[680,38],[810,40],[1000,28],[1400,16],[2000,7],[3000,2]];
function dTl(l){
  if(l <= SPEC[0][0]) return SPEC[0][1];
  for(var i = 1; i < SPEC.length; i++){
    if(l <= SPEC[i][0]){
      var a = SPEC[i - 1], b = SPEC[i], u = (Math.log(l) - Math.log(a[0]))/(Math.log(b[0]) - Math.log(a[0]));
      var w = (1 - Math.cos(Math.PI*u))/2;                        // smooth (cosine) step between anchors
      return a[1] + (b[1] - a[1])*w;
    }
  }
  return SPEC[SPEC.length - 1][1];
}
function beamSigmaRad(fwhmArcmin){ return fwhmArcmin/60*Math.PI/180/Math.sqrt(8*Math.LN2); }
function beamB(l, fwhmArcmin){ if(!fwhmArcmin) return 1; var s = beamSigmaRad(fwhmArcmin); return Math.exp(-l*(l + 1)*s*s/2); }
function lHalf(fwhmArcmin){ var s = beamSigmaRad(fwhmArcmin); return (-1 + Math.sqrt(1 + 8*Math.LN2/(s*s)))/2; }
var MOON_DEG = 3474.8/384400*180/Math.PI;                           // NASA Moon fact sheet [16]

/* ============ SKY PATCH: flat-sky Gaussian random field, 128², 10° × 10° ============ */
var NPIX = 128, PATCH_DEG = 10, PATCH_RAD = PATCH_DEG*Math.PI/180;
function fft1(re, im, inv){                                         // in-place radix-2
  var n = re.length, i, j, k, len;
  for(i = 1, j = 0; i < n; i++){ var bit = n >> 1; for(; j & bit; bit >>= 1) j ^= bit; j ^= bit; if(i < j){ var t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for(len = 2; len <= n; len <<= 1){
    var ang = 2*Math.PI/len*(inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
    for(i = 0; i < n; i += len){ var cr = 1, ci = 0;
      for(k = 0; k < len/2; k++){
        var ur = re[i + k], ui = im[i + k], vr = re[i + k + len/2]*cr - im[i + k + len/2]*ci, vi = re[i + k + len/2]*ci + im[i + k + len/2]*cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len/2] = ur - vr; im[i + k + len/2] = ui - vi;
        var nr = cr*wr - ci*wi; ci = cr*wi + ci*wr; cr = nr;
      }
    }
  }
}
function fft2(re, im, inv){
  var n = NPIX, r = new Float64Array(n), q = new Float64Array(n), x, y;
  for(y = 0; y < n; y++){ for(x = 0; x < n; x++){ r[x] = re[y*n + x]; q[x] = im[y*n + x]; } fft1(r, q, inv); for(x = 0; x < n; x++){ re[y*n + x] = r[x]; im[y*n + x] = q[x]; } }
  for(x = 0; x < n; x++){ for(y = 0; y < n; y++){ r[y] = re[y*n + x]; q[y] = im[y*n + x]; } fft1(r, q, inv); for(y = 0; y < n; y++){ re[y*n + x] = r[y]; im[y*n + x] = q[y]; } }
}
function modeL(x, y){ var fx = x <= NPIX/2 ? x : x - NPIX, fy = y <= NPIX/2 ? y : y - NPIX; return 2*Math.PI*Math.sqrt(fx*fx + fy*fy)/PATCH_RAD; }
function cl(l){ var d = dTl(l); return 2*Math.PI*d*d/(l*(l + 1)); }   // µK²
/* white noise (fixed seed) → Fourier space, shaped by √C_ℓ: a_k = W_k · N√(C_ℓ/A) / N² */
var SKY_K = (function(){
  var n = NPIX*NPIX, re = new Float64Array(n), im = new Float64Array(n), seed = 20261011;
  function rnd(){ seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return (((t ^ (t >>> 14)) >>> 0) + 0.5)/4294967296; }   /* mulberry32 */
  for(var i = 0; i < n; i += 2){ var u = rnd(), v = rnd(), r = Math.sqrt(-2*Math.log(u)); re[i] = r*Math.cos(2*Math.PI*v); re[i + 1] = r*Math.sin(2*Math.PI*v); }
  fft2(re, im, false);
  var A = PATCH_RAD*PATCH_RAD;
  for(var y = 0; y < NPIX; y++) for(var x = 0; x < NPIX; x++){
    var k = y*NPIX + x, l = modeL(x, y), f = l === 0 ? 0 : NPIX*Math.sqrt(cl(l)/A)/n;
    re[k] *= f; im[k] *= f;
  }
  return {re:re, im:im};
})();
/* expected pixel variance through a beam: Σ_k C_ℓ B_ℓ² / A */
function expectedVar(fwhm){
  var s = 0, A = PATCH_RAD*PATCH_RAD;
  for(var y = 0; y < NPIX; y++) for(var x = 0; x < NPIX; x++){ var l = modeL(x, y); if(l > 0){ var b = beamB(l, fwhm); s += cl(l)*b*b/A; } }
  return s;
}
function skyMap(fwhm){
  var n = NPIX*NPIX, re = new Float64Array(SKY_K.re), im = new Float64Array(SKY_K.im);
  for(var y = 0; y < NPIX; y++) for(var x = 0; x < NPIX; x++){ var k = y*NPIX + x, b = beamB(modeL(x, y), fwhm); re[k] *= b; im[k] *= b; }
  fft2(re, im, true);
  return re;                                                        // inverse without 1/N²: a_k already carries it
}
function rms(arr){ var s = 0; for(var i = 0; i < arr.length; i++) s += arr[i]*arr[i]; return Math.sqrt(s/arr.length); }

/* ============ CH2 — BLACKBODY ============ */
var FIT_T = bestFitT();
var bbT = document.getElementById('bbT');
function renderBB(){
  var tK = +bbT.value;
  document.getElementById('bbTVal').textContent = fmt(tK, 5) + T(' K',' К'); bbT.setAttribute('aria-valuetext', document.getElementById('bbTVal').textContent);
  var svg = document.getElementById('bbSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T(svg.getAttribute('data-aria-en'), svg.getAttribute('data-aria-ru')));
  var L = 54, R = 465, Tp = 24, B = 256, xmax = 22, ymax = 600;
  function X(v){ return L + v/xmax*(R - L); } function Y(v){ return B - Math.min(v, ymax)/ymax*(B - Tp); }
  [0, 100, 200, 300, 400, 500, 600].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, fmtInt(v), 'svg-small', 'end'); });
  [0, 5, 10, 15, 20].forEach(function(v){ ns('line', {x1:X(v), y1:B, x2:X(v), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), B + 16, v + T(' cm⁻¹',' см⁻¹'), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('brightness, MJy/sr','яркость, МЯн/ср'), 'svg-small');
  txt(svg, R, B + 32, T('frequency (1 cm⁻¹ = 29.98 GHz)','частота (1 см⁻¹ = 29,98 ГГц)'), 'svg-small', 'end');
  var d = '';
  for(var i = 1; i <= 220; i++){ var nu = i/220*xmax; d += (i === 1 ? 'M' : 'L') + X(nu).toFixed(1) + ',' + Y(planckMJy(nu, tK)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  FIRAS.forEach(function(p){ ns('circle', {cx:X(p[0]), cy:Y(p[1]), r:2.6, fill:'#2f5aa1'}, svg); });
  var np = nuPeakGHz(tK)/29.9792458;
  ns('line', {x1:X(np), y1:Tp, x2:X(np), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, X(np) + 5, Tp + 10, T('peak ','максимум ') + fmt(nuPeakGHz(tK), 1) + T(' GHz',' ГГц'), 'svg-small svg-halo');
  ns('circle', {cx:R - 150, cy:Tp + 30, r:3, fill:'#2f5aa1'}, svg); txt(svg, R - 142, Tp + 34, T('COBE/FIRAS [5]','COBE/FIRAS [5]'), 'svg-small');
  ns('line', {x1:R - 156, y1:Tp + 48, x2:R - 144, y2:Tp + 48, stroke:'#b5452a', 'stroke-width':2}, svg); txt(svg, R - 142, Tp + 52, T('blackbody at ','чёрное тело при ') + fmt(tK, 3) + T(' K',' К'), 'svg-small');
  var m = misfit(tK);
  cells(document.getElementById('bbReadout'), [
    [T('PEAK FREQUENCY','МАКСИМУМ ПО ЧАСТОТЕ'), fmt(nuPeakGHz(tK), 1) + T(' GHz',' ГГц')],
    [T('WIEN PEAK (WAVELENGTH)','МАКСИМУМ ВИНА (ДЛИНА ВОЛНЫ)'), fmt(wienMM(tK), 3) + T(' mm',' мм')],
    [T('PHOTONS PER cm³','ФОТОНОВ НА СМ³'), fmt(photonsPerCm3(tK), 1)],
    [T('MISFIT TO FIRAS (RMS)','РАСХОЖДЕНИЕ С FIRAS (СКО)'), (m < 1000 ? fmt(m, 0) + T(' kJy/sr',' кЯн/ср') : fmt(m/1000, 1) + T(' MJy/sr',' МЯн/ср'))]
  ]);
  hud1.textContent = fmt(tK, 3) + T(' K',' К');
  var best = FIT_T, mb = misfit(best);
  document.getElementById('bbStatus').innerHTML = m < 1.5*mb
    ? T('The curve runs through every point: the misfit is ','Кривая проходит через каждую точку: расхождение — ') + fmt(m/PEAK_KJY*100, 3) + T(' % (',' % (') + fmt(m/PEAK_KJY*1e6, 0) + T(' parts per million) of the peak brightness. FIRAS\'s own calibration puts the best fit at ',' миллионных долей) яркости в максимуме. По собственной калибровке FIRAS наилучшее значение — ') + fmt(best, 4) + T(' K [5].',' К [5].')
    : m < 500 ? T('Still a superb fit (','По-прежнему превосходное совпадение (') + fmt(m/PEAK_KJY*100, 3) + T(' % of the peak). This is ',' % от максимума). Это на ') + fmt(Math.abs(tK - best)*1000, 2) + T(' mK from FIRAS\'s own 2.725 K scale — inside its absolute uncertainty; recalibrated against WMAP, FIRAS gives 2.7260 ± 0.0013 K [7].',' мК отличается от собственной шкалы FIRAS 2,725 К — в пределах её абсолютной погрешности; после перекалибровки по WMAP FIRAS даёт 2,7260 ± 0,0013 К [7].')
    : Math.abs(tK - best) < 0.015
      ? T('Off by ','Отклонение ') + fmt(Math.abs(tK - best)*1000, 0) + T(' mK — by eye the curve still passes close, but the misfit is now ',' мК — на глаз кривая ещё проходит рядом, но расхождение уже в ') + fmtInt(Math.round(m/FIRAS_ERR)) + T(' times FIRAS\'s typical error bar: the data reject it. Only one temperature fits all 43 at once.',' раз больше типичной погрешности FIRAS: данные её отвергают. Все 43 точки сразу описывает только одна температура.')
      : T('Off by ','Отклонение ') + fmt(Math.abs(tK - best)*1000, 0) + T(' mK — the points no longer sit on the curve. Only one temperature fits all 43 at once.',' мК — точки больше не ложатся на кривую. Все 43 точки сразу описывает только одна температура.');
}
bbT.addEventListener('input', function(){ pressGroup(document.getElementById('bbPre'), null); renderBB(); });
Array.prototype.forEach.call(document.querySelectorAll('#bbPre .btn'), function(btn){ btn.addEventListener('click', function(){ bbT.value = this.getAttribute('data-t'); pressGroup(this.parentNode, this); renderBB(); }); });

/* ============ CH3 — COOLING ============ */
var cvZ = document.getElementById('cvZ');
cvZ.value = Math.log10(1 + COSMO.zStar);                         /* start exactly at last scattering */
var CURVE = (function(){ var pts = []; for(var i = 0; i <= 120; i++){ var u = 3.6*i/120, z = Math.pow(10, u) - 1; pts.push([z, ageAt(z), tempAt(z)]); } return pts; })();
function ageStr(y){
  if(y >= 1e9) return fmt(y/1e9, 3) + T(' billion years',' млрд лет');
  if(y >= 1e6) return fmt(y/1e6, 0) + T(' million years',' млн лет');
  return num(Math.round(y/1000)*1000) + T(' years',' лет');
}
function renderCV(){
  var u = +cvZ.value, z = Math.pow(10, u) - 1, t = ageAt(z), Tz = tempAt(z);
  document.getElementById('cvZVal').textContent = 'z = ' + (z < 100 ? fmt(z, 2) : num(Math.round(z)));
  cvZ.setAttribute('aria-valuetext', document.getElementById('cvZVal').textContent + ', ' + ageStr(t));
  var svg = document.getElementById('cvSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T(svg.getAttribute('data-aria-en'), svg.getAttribute('data-aria-ru')));
  var L = 54, R = 465, Tp = 24, B = 256, xa = 4, xb = 10.3, ya = 0, yb = 4;
  function X(age){ return L + (Math.log10(age) - xa)/(xb - xa)*(R - L); } function Y(T){ return B - (Math.log10(T) - ya)/(yb - ya)*(B - Tp); }
  [1, 10, 100, 1000, 10000].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, num(v), 'svg-small', 'end'); });
  [[1e4,'10⁴'],[1e5,'10⁵'],[1e6,'10⁶'],[1e7,'10⁷'],[1e8,'10⁸'],[1e9,'10⁹'],[1e10,'10¹⁰']].forEach(function(p){ ns('line', {x1:X(p[0]), y1:B, x2:X(p[0]), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(p[0]), B + 16, p[1], 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('temperature, K (log)','температура, К (лог.)'), 'svg-small');
  txt(svg, R, B + 32, T('age of the universe, years (log)','возраст Вселенной, лет (лог.)'), 'svg-small', 'end');
  ns('rect', {x:L, y:Tp, width:R - L, height:Y(3000) - Tp, fill:'#f3e3dd'}, svg);
  txt(svg, R - 4, Tp + 12, T('hotter than ~3,000 K: opaque','горячее ~3000 К: непрозрачно'), 'svg-small', 'end');
  var d = ''; CURVE.forEach(function(p, i){ if(p[1] < Math.pow(10, xa)) return; d += (d ? 'L' : 'M') + X(p[1]).toFixed(1) + ',' + Y(p[2]).toFixed(1); });
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':1.8}, svg);
  if(t >= Math.pow(10, xa)) ns('circle', {cx:X(t), cy:Y(Tz), r:5.5, fill:'#b5452a'}, svg);
  cells(document.getElementById('cvReadout'), [
    [T('TEMPERATURE THEN','ТЕМПЕРАТУРА ТОГДА'), (Tz >= 100 ? num(Math.round(Tz)) : fmt(Tz, Tz < 10 ? 3 : 1)) + T(' K',' К')],
    [T('AGE THEN','ВОЗРАСТ ТОГДА'), ageStr(t)],
    [T('SHARE OF TODAY\'S AGE','ДОЛЯ НЫНЕШНЕГО ВОЗРАСТА'), (t/ageAt(0)*100 < 0.1 ? fmt(t/ageAt(0)*100, 4) : fmt(t/ageAt(0)*100, 1)) + ' %'],
    [T('SIZE vs TODAY','РАЗМЕР ПО СРАВНЕНИЮ С СЕГОДНЯ'), '1/' + fmt(1 + z, z < 10 ? 2 : 0)]
  ]);
  hud1.textContent = (Tz >= 100 ? num(Math.round(Tz)) : fmt(Tz, 2)) + T(' K',' К'); hud2.textContent = ageStr(t);
  document.getElementById('cvStatus').innerHTML = Tz >= 3000
    ? T('Still opaque: at this temperature hydrogen is ionized and light keeps scattering off free electrons.','Ещё непрозрачно: при такой температуре водород ионизован и свет продолжает рассеиваться на свободных электронах.')
    : z > 1000 ? T('About the moment of last scattering: the light we see as the microwave background sets off here.','Примерно момент последнего рассеяния: отсюда отправляется свет, который мы видим как реликтовое излучение.')
    : T('Transparent: the background light is travelling freely and cooling as space stretches.','Прозрачно: реликтовый свет летит свободно и остывает по мере растяжения пространства.');
}
cvZ.addEventListener('input', function(){ pressGroup(document.getElementById('cvPre'), null); renderCV(); });
Array.prototype.forEach.call(document.querySelectorAll('#cvPre .btn'), function(btn){ btn.addEventListener('click', function(){ cvZ.value = Math.log10(1 + +this.getAttribute('data-z')); pressGroup(this.parentNode, this); renderCV(); }); });

/* ============ CH4 — DIPOLE AND RIPPLES ============ */
var dpV = document.getElementById('dpV'), dpS = 1;
function lenStr(m){
  if(m >= 1000) return fmt(m/1000, 1) + T(' km',' км');
  if(m >= 1) return fmt(m, 0) + T(' m',' м');
  if(m >= 1e-3) return fmt(m*1000, 1) + T(' mm',' мм');
  return fmt(m*1e6, 0) + T(' µm',' мкм');
}
function renderDP(){
  var v = +dpV.value, dm = dipoleMK(v);
  document.getElementById('dpVVal').textContent = fmt(v, 2) + T(' km/s',' км/с'); dpV.setAttribute('aria-valuetext', document.getElementById('dpVVal').textContent);
  var svg = document.getElementById('dpSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T(svg.getAttribute('data-aria-en'), svg.getAttribute('data-aria-ru')));
  var L = 64, R = 465, Tp = 24, B = 256, span = 10;                // ±10 mK around T0
  function X(th){ return L + th/180*(R - L); } function Y(mK){ return (Tp + B)/2 - mK/span*(B - Tp)/2; }
  [-10, -5, 0, 5, 10].forEach(function(v2){ ns('line', {x1:L, y1:Y(v2), x2:R, y2:Y(v2), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v2) + 4, (v2 > 0 ? '+' : '') + fmt(v2, 0), 'svg-small', 'end'); });
  [0, 45, 90, 135, 180].forEach(function(th){ ns('line', {x1:X(th), y1:B, x2:X(th), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(th), B + 16, th + '°', 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('sky temperature − 2.72548 K, mK','температура неба − 2,72548 К, мК'), 'svg-small');
  txt(svg, R, B + 32, T('angle from the direction of motion','угол к направлению движения'), 'svg-small', 'end');
  var top = '', bot = '', mid = '';
  for(var i = 0; i <= 90; i++){ var th = i*2, y = (skyT(th, v) - T0)*1000; mid += (i ? 'L' : 'M') + X(th).toFixed(1) + ',' + Y(y).toFixed(2); top += (i ? 'L' : 'M') + X(th).toFixed(1) + ',' + Y(y + RIPPLE_UK/1000).toFixed(2); bot = 'L' + X(th).toFixed(1) + ',' + Y(y - RIPPLE_UK/1000).toFixed(2) + bot; }
  ns('path', {d:top + bot + 'Z', fill:'#2f5aa1', opacity:0.35}, svg);
  ns('path', {d:mid, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  txt(svg, X(4), Y((skyT(0, v) - T0)*1000) - 10, T('ahead: warmer','впереди: теплее'), 'svg-small svg-halo');
  txt(svg, X(176), Y((skyT(180, v) - T0)*1000) + 18, T('behind: cooler','позади: холоднее'), 'svg-small svg-halo', 'end');
  var bump = dpS*RIPPLE_UK*1e-6/T0;
  cells(document.getElementById('dpReadout'), [
    [T('HOTTEST POINT','САМАЯ ТЁПЛАЯ ТОЧКА'), '+' + fmt((skyT(0, v) - T0)*1000, 3) + T(' mK',' мК')],
    [T('COLDEST POINT','САМАЯ ХОЛОДНАЯ ТОЧКА'), (v > 0 ? '−' : '') + fmt(Math.abs(skyT(180, v) - T0)*1000, 3) + T(' mK',' мК')],
    [T('DIPOLE ÷ T₀','ДИПОЛЬ ÷ T₀'), v > 0 ? T('1 part in ','1/') + num(Math.round(1/(dm/1000/T0))) : '—'],
    [T('RIPPLES (30 µK) ON THIS LENGTH','РЯБЬ (30 мкК) НА ЭТОЙ ДЛИНЕ'), lenStr(bump)]
  ]);
  document.getElementById('dpStatus').innerHTML = v === 0
    ? T('At rest relative to the background the dipole vanishes; only the ±30 µK ripples remain — a band thinner than a pixel on this scale, which is the point.','В покое относительно фона диполь исчезает; остаётся только рябь ±30 мкК — полоса тоньше пикселя в этом масштабе, в этом и суть.')
    : T('At ','При ') + fmt(v, 2) + T(' km/s the dipole (',' км/с диполь (') + fmt(dm, 3) + T(' mK) is about ',' мК) примерно в ') + num(Math.round(dm*1000/RIPPLE_UK)) + T(' times bigger than the ripples it has to be removed to reveal.',' раз больше ряби, которую под ним нужно разглядеть.');
}
dpV.addEventListener('input', function(){ pressGroup(document.getElementById('dpPre'), null); renderDP(); });
Array.prototype.forEach.call(document.querySelectorAll('#dpPre .btn'), function(btn){ btn.addEventListener('click', function(){ dpV.value = this.getAttribute('data-v'); pressGroup(this.parentNode, this); renderDP(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#dpObj .btn'), function(btn){ btn.addEventListener('click', function(){ dpS = +this.getAttribute('data-s'); pressGroup(this.parentNode, this); renderDP(); }); });

/* ============ CH5 — SKY PATCH ============ */
var skB = 5, SKY_CACHE = {};
function renderSK(){
  if(!SKY_CACHE[skB]) SKY_CACHE[skB] = skyMap(skB);
  var map = SKY_CACHE[skB], cv = document.getElementById('skyCv'), ctx = cv.getContext && cv.getContext('2d');
  cv.setAttribute('aria-label', T(cv.getAttribute('data-aria-en'), cv.getAttribute('data-aria-ru')));
  if(ctx && ctx.createImageData){
    var img = ctx.createImageData(NPIX, NPIX), px = img.data;
    for(var i = 0; i < map.length; i++){
      var u = Math.max(-1, Math.min(1, map[i]/250)), r, g, b;
      if(u >= 0){ r = 255 + (181 - 255)*u; g = 255 + (69 - 255)*u; b = 255 + (42 - 255)*u; } else { r = 255 + (47 - 255)*-u; g = 255 + (90 - 255)*-u; b = 255 + (161 - 255)*-u; }
      px[4*i] = r; px[4*i + 1] = g; px[4*i + 2] = b; px[4*i + 3] = 255;
    }
    if(ctx.putImageData) ctx.putImageData(img, 0, 0);
  }
  /* spectrum chart */
  var svg = document.getElementById('psSvg'); svg.innerHTML = ''; svg.setAttribute('aria-label', T(svg.getAttribute('data-aria-en'), svg.getAttribute('data-aria-ru')));
  var L = 44, R = 465, Tp = 22, Bt = 186, la = Math.log10(2), lb = Math.log10(2500), ymax = 90;
  function X(l){ return L + (Math.log10(l) - la)/(lb - la)*(R - L); } function Y(v){ return Bt - v/ymax*(Bt - Tp); }
  [0, 30, 60, 90].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, v, 'svg-small', 'end'); });
  [2, 10, 100, 1000].forEach(function(l){ ns('line', {x1:X(l), y1:Bt, x2:X(l), y2:Bt + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(l), Bt + 15, 'ℓ = ' + l, 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:Bt, x2:R, y2:Bt, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 12, T('ripple strength ΔT_ℓ, µK','сила ряби ΔT_ℓ, мкК'), 'svg-small');
  txt(svg, L, Bt + 30, T('multipole ℓ (log; ≈ 180°/ℓ)','мультиполь ℓ (лог.; ≈ 180°/ℓ)'), 'svg-small');
  var d0 = '', d1 = '';
  for(var i2 = 0; i2 <= 200; i2++){ var l = Math.pow(10, la + (lb - la)*i2/200); d0 += (i2 ? 'L' : 'M') + X(l).toFixed(1) + ',' + Y(dTl(l)).toFixed(1); d1 += (i2 ? 'L' : 'M') + X(l).toFixed(1) + ',' + Y(dTl(l)*beamB(l, skB)).toFixed(1); }
  ns('path', {d:d0, fill:'none', stroke:'#8f8f88', 'stroke-width':1.4, 'stroke-dasharray':'4 3'}, svg);
  ns('path', {d:d1, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  PEAKS.forEach(function(p){ ns('circle', {cx:X(p[0]), cy:Y(p[1]), r:4, fill:'#2f5aa1'}, svg); });
  txt(svg, X(220.1) + 6, Y(74.7) - 6, T('WMAP peak, ℓ 220 [14]','пик WMAP, ℓ 220 [14]'), 'svg-small svg-halo');
  ns('line', {x1:R - 168, y1:Bt + 26, x2:R - 154, y2:Bt + 26, stroke:'#8f8f88', 'stroke-dasharray':'4 3', 'stroke-width':1.4}, svg); txt(svg, R - 150, Bt + 30, T('sky','небо'), 'svg-small');
  ns('line', {x1:R - 110, y1:Bt + 26, x2:R - 96, y2:Bt + 26, stroke:'#b5452a', 'stroke-width':2}, svg); txt(svg, R - 92, Bt + 30, T('after the beam','через луч'), 'svg-small');
  var sm = rms(map);
  document.getElementById('skyMid').textContent = T('10° × 10°, rms ','10° × 10°, СКО ') + fmt(sm, 0) + T(' µK',' мкК');
  cells(document.getElementById('skReadout'), [
    [T('BEAM WIDTH (FWHM)','ШИРИНА ЛУЧА (FWHM)'), skB ? (skB >= 60 ? fmt(skB/60, 0) + '°' : fmt(skB, 0) + '′') : T('none','нет')],
    [T('IN MOON WIDTHS','В ДИАМЕТРАХ ЛУНЫ'), skB ? fmt(skB/60/MOON_DEG, skB >= 60 ? 1 : 2) : '—'],
    [T('FIRST PEAK KEPT (ℓ = 220)','ПЕРВЫЙ ПИК СОХРАНЁН (ℓ = 220)'), fmt(beamB(220.1, skB)*100, skB >= 60 ? 1 : 0) + ' %'],
    [T('BEAM HALVES THE RIPPLES AT','ЛУЧ ВДВОЕ ОСЛАБЛЯЕТ РЯБЬ ПРИ'), skB ? 'ℓ ≈ ' + num(Math.round(lHalf(skB))) + T(' (≈ ',' (≈ ') + fmt(180/lHalf(skB), 2) + '°)' : '—']
  ]);
  document.getElementById('skStatus').innerHTML = skB >= 60
    ? T('COBE\'s 7° beam smooths this whole 10° patch almost flat (rms ≈ ','Луч COBE шириной 7° почти полностью выглаживает этот участок 10° (СКО ≈ ') + fmt(sm, 0) + T(' µK). The ~30 µK ripples COBE did detect are swells 10° across and larger — bigger than this patch. At ℓ = 220 nothing survives.',' мкК). Рябь около 30 мкК, которую COBE действительно обнаружил, — это волны размером 10° и больше, крупнее всего участка. На ℓ = 220 не остаётся ничего.')
    : skB ? T('The degree-sized spots of the first peak come through; the beam only softens the smallest scales.','Пятна размером в градус — первый пик — проходят; луч лишь сглаживает самые мелкие масштабы.')
    : T('The simulated sky with nothing in the way, at this picture\'s 4.7′ pixel size.','Смоделированное небо без всяких помех, при размере пикселя этой картинки 4,7′.');
}
Array.prototype.forEach.call(document.querySelectorAll('#skPre .btn'), function(btn){ btn.addEventListener('click', function(){ skB = +this.getAttribute('data-b'); pressGroup(this.parentNode, this); renderSK(); }); });

/* ============ CH7 — LEGACY ============ */
var TIMELINE = [
  ['1948–49', 'Ralph Alpher and Robert Herman, following George Gamow, predict that the Big Bang left a relic glow now a few kelvin warm [19].', 'Ральф Алфер и Роберт Херман вслед за Георгием Гамовым предсказывают, что Большой взрыв оставил реликтовое свечение с температурой в несколько кельвинов [19].'],
  ['1964', 'Andrei Doroshkevich and Igor Novikov point out that the relic radiation should be detectable at microwave wavelengths, naming the Crawford Hill horn as the best instrument [19].', 'Андрей Дорошкевич и Игорь Новиков указывают, что реликтовое излучение можно обнаружить в микроволновом диапазоне, и называют лучшим инструментом рупорную антенну в Кроуфорд-Хилле [19].'],
  ['1965', 'Penzias and Wilson report about 3.5 K of unexplained antenna noise at 4,080 MHz; Dicke, Peebles, Roll and Wilkinson explain it as the cooled light of the Big Bang [1][2].', 'Пензиас и Вильсон сообщают о необъяснимом шуме антенны около 3,5 К на 4080 МГц; Дикке, Пиблс, Ролл и Уилкинсон объясняют его как остывший свет Большого взрыва [1][2].'],
  ['1978', 'Half of the Nobel Prize in Physics to Penzias and Wilson [3].', 'Половина Нобелевской премии по физике — Пензиасу и Вильсону [3].'],
  ['1983', '<b>1 July:</b> Prognoz 9 launched with the Soviet RELIKT-1 experiment, which maps the sky at 37 GHz and measures the dipole [20].', '<b>1 июля:</b> запуск «Прогноза-9» с советским экспериментом «Реликт-1», который картографирует небо на 37 ГГц и измеряет диполь [20].'],
  ['1989', '<b>18 November:</b> COBE launched [18].', '<b>18 ноября:</b> запуск COBE [18].'],
  ['1992', 'COBE\'s DMR team announces ripples of about 30 µK — one part in 100,000 [9].', 'Команда DMR на COBE объявляет о ряби около 30 мкК — одной стотысячной [9].'],
  ['1996', 'Full FIRAS analysis: deviations from a blackbody below 50 parts per million of the peak [6].', 'Полный анализ FIRAS: отклонения от абсолютно чёрного тела меньше 50 миллионных долей максимума [6].'],
  ['2001', '<b>30 June:</b> WMAP launched towards the Sun–Earth L2 point [12].', '<b>30 июня:</b> запуск WMAP к точке L2 системы Солнце–Земля [12].'],
  ['2003', 'WMAP pins the first acoustic peak at ℓ = 220.1 ± 0.8 [14].', 'WMAP определяет положение первого акустического пика: ℓ = 220,1 ± 0,8 [14].'],
  ['2006', 'Nobel Prize in Physics to John Mather and George Smoot [8].', 'Нобелевская премия по физике — Джону Мазеру и Джорджу Смуту [8].'],
  ['2009', '<b>14 May:</b> Planck launched [10]. A review of all measurements gives T₀ = 2.72548 ± 0.00057 K [7].', '<b>14 мая:</b> запуск «Планка» [10]. Сводка всех измерений даёт T₀ = 2,72548 ± 0,00057 К [7].'],
  ['2010', '<b>19 August:</b> WMAP ends science observations [12].', '<b>19 августа:</b> WMAP завершает научные наблюдения [12].'],
  ['2012', '<b>January:</b> Planck\'s coolant runs out; the six HFI bands stop, the three LFI bands continue [10].', '<b>Январь:</b> на «Планке» заканчивается хладагент; шесть диапазонов HFI прекращают работу, три диапазона LFI продолжают [10].'],
  ['2013', '<b>23 October:</b> Planck stops scanning the sky in its three lowest bands [10].', '<b>23 октября:</b> «Планк» прекращает сканирование неба в трёх нижних диапазонах [10].'],
  ['2018', 'Planck\'s final release: six-parameter ΛCDM fits the maps; age 13.797 ± 0.023 billion years [10][11].', 'Итоговый выпуск «Планка»: шестипараметрическая модель ΛCDM описывает карты; возраст 13,797 ± 0,023 млрд лет [10][11].']
];

/* ============ CH8 — REFERENCES ============ */
var REFERENCES = [
  {title:'A. A. Penzias, R. W. Wilson (1965), “A Measurement of Excess Antenna Temperature at 4080 Mc/s”, Astrophysical Journal 142, 419–421', url:'https://articles.adsabs.harvard.edu/pdf/1965ApJ...142..419P', note:{en:'About 3.5 K above expectation at 4,080 MHz with the 20-foot horn-reflector at Crawford Hill; “isotropic, unpolarized, and free from seasonal variations (July, 1964 – April, 1965)”.', ru:'Около 3,5 К сверх ожидаемого на 4080 МГц с 20-футовой рупорно-параболической антенной в Кроуфорд-Хилле; «изотропный, неполяризованный и свободный от сезонных колебаний (июль 1964 — апрель 1965)».'}},
  {title:'R. H. Dicke, P. J. E. Peebles, P. G. Roll, D. T. Wilkinson (1965), “Cosmic Black-Body Radiation”, Astrophysical Journal 142, 414–419', url:'https://articles.adsabs.harvard.edu/pdf/1965ApJ...142..414D', note:{en:'The companion letter in the same issue interpreting the excess as relic radiation from a hot early universe.', ru:'Сопутствующее письмо в том же номере, объясняющее избыток как реликтовое излучение горячей ранней Вселенной.'}},
  {title:'The Nobel Prize in Physics 1978 — Summary', url:'https://www.nobelprize.org/prizes/physics/1978/summary/', note:{en:'Half to Penzias and Wilson “for their discovery of cosmic microwave background radiation”; the other half to Pyotr Kapitsa.', ru:'Половина премии — Пензиасу и Вильсону «за открытие реликтового микроволнового излучения»; другая половина — Петру Капице.'}},
  {title:'NASA LAMBDA, “The COBE Differential Microwave Radiometers (DMR)”', url:'https://lambda.gsfc.nasa.gov/product/cobe/about_dmr.html', note:{en:'Six radiometers at 31.5, 53 and 90 GHz; each compares two directions 60° apart; 7° FWHM beams.', ru:'Шесть радиометров на 31,5, 53 и 90 ГГц; каждый сравнивает два направления в 60° друг от друга; лучи 7° (FWHM).'}},
  {title:'NASA LAMBDA, “COBE/FIRAS CMB monopole spectrum” (Fixsen et al. 1996, Table 4), firas_monopole_spec_v1.txt', url:'https://lambda.gsfc.nasa.gov/data/cobe/firas/monopole_spec/firas_monopole_spec_v1.txt', note:{en:'43 frequencies from 2.27 to 21.33 cm⁻¹: monopole brightness (2.725 K blackbody + residual), residual and 1σ uncertainty. The 2.725 K absolute scale is from Fixsen & Mather 2002 (ApJ 581, 817), the file\'s second reference. Plotted on this page.', ru:'43 частоты от 2,27 до 21,33 см⁻¹: яркость монополя (чёрное тело 2,725 К + остаток), остаток и погрешность 1σ. Абсолютная шкала 2,725 К — из работы Fixsen и Mather 2002 (ApJ 581, 817), второй ссылки файла. Показаны на этой странице.'}},
  {title:'D. J. Fixsen et al. (1996), “The Cosmic Microwave Background Spectrum from the Full COBE FIRAS Data Set”, Astrophysical Journal 473, 576', url:'https://arxiv.org/abs/astro-ph/9605054', note:{en:'RMS deviations from a blackbody below 50 parts per million of the peak; T = 2.728 ± 0.004 K (95 %); dipole 3.372 ± 0.007 mK.', ru:'Среднеквадратичные отклонения от чёрного тела меньше 50 миллионных долей максимума; T = 2,728 ± 0,004 К (95 %); диполь 3,372 ± 0,007 мК.'}},
  {title:'D. J. Fixsen (2009), “The Temperature of the Cosmic Microwave Background”, Astrophysical Journal 707, 916', url:'https://arxiv.org/abs/0911.1955', note:{en:'From all measurements in the literature: T₀ = 2.72548 ± 0.00057 K.', ru:'По всем опубликованным измерениям: T₀ = 2,72548 ± 0,00057 К.'}},
  {title:'The Nobel Prize in Physics 2006 — Summary', url:'https://www.nobelprize.org/prizes/physics/2006/summary/', note:{en:'John C. Mather and George F. Smoot “for their discovery of the blackbody form and anisotropy of the cosmic microwave background radiation”.', ru:'Джон Мазер и Джордж Смут «за открытие формы спектра абсолютно чёрного тела и анизотропии реликтового микроволнового излучения».'}},
  {title:'E. L. Wright (1994), “COBE Tutorial and Recent Results”, arXiv:astro-ph/9407056', url:'https://arxiv.org/abs/astro-ph/9407056', note:{en:'The DMR anisotropy, with the monopole and dipole removed and smoothed to about 10°, is 30 µK (Smoot et al. 1992, Bennett et al. 1992 and companions).', ru:'Анизотропия DMR после вычитания монополя и диполя и сглаживания примерно до 10° составляет 30 мкК (Smoot и др. 1992, Bennett и др. 1992 и сопутствующие статьи).'}},
  {title:'Planck Collaboration (2020), “Planck 2018 results. I. Overview and the cosmological legacy of Planck”, Astronomy & Astrophysics 641, A1', url:'https://arxiv.org/abs/1807.06205', note:{en:'Launch 14 May 2009; scanning 12 Aug 2009 – 23 Oct 2013; nine bands 30–857 GHz; effective beams 32.29′ (30 GHz) to 4.22′ (857 GHz), 4.90′ at 217 GHz; end of the cryogenic (HFI) mission 14 January 2012; dipole 3,362.08 ± 0.99 µK, v = 369.82 ± 0.11 km/s towards (l, b) = (264.021°, 48.253°); 18 peaks; “over a billion map pixels”.', ru:'Запуск 14 мая 2009; сканирование 12 авг. 2009 — 23 окт. 2013; девять диапазонов 30–857 ГГц; эффективные лучи от 32,29′ (30 ГГц) до 4,22′ (857 ГГц), 4,90′ на 217 ГГц; конец криогенной миссии (HFI) — 14 января 2012; диполь 3362,08 ± 0,99 мкК, v = 369,82 ± 0,11 км/с в направлении (l, b) = (264,021°, 48,253°); 18 пиков; «более миллиарда пикселей карты».'}},
  {title:'Planck Collaboration (2020), “Planck 2018 results. VI. Cosmological parameters”, Astronomy & Astrophysics 641, A6', url:'https://arxiv.org/abs/1807.06209', note:{en:'Table 2 (TT,TE,EE+lowE+lensing): H₀ = 67.36 ± 0.54, Ωm = 0.3153 ± 0.0073, age 13.797 ± 0.023 Gyr, z* = 1089.92 ± 0.25, z_eq = 3402 ± 26, r* = 144.43 ± 0.26 Mpc; abstract (full version): 100θ* = 1.0411 ± 0.0003, ΩK = 0.001 ± 0.002 with BAO, tension with local H₀ measurements.', ru:'Табл. 2 (TT,TE,EE+lowE+lensing): H₀ = 67,36 ± 0,54, Ωm = 0,3153 ± 0,0073, возраст 13,797 ± 0,023 млрд лет, z* = 1089,92 ± 0,25, z_eq = 3402 ± 26, r* = 144,43 ± 0,26 Мпк; аннотация (полная версия): 100θ* = 1,0411 ± 0,0003, ΩK = 0,001 ± 0,002 вместе с BAO, расхождение с локальными измерениями H₀.'}},
  {title:'NASA, “WMAP Mission Overview”', url:'https://map.gsfc.nasa.gov/mission', note:{en:'Launched 30 June 2001 towards Sun–Earth L2; science data until 19 August 2010; the first fine-resolution (0.2 degree) full-sky map of the microwave sky.', ru:'Запущен 30 июня 2001 года к точке L2 Солнце–Земля; научные данные до 19 августа 2010 года; первая подробная (0,2 градуса) карта всего микроволнового неба.'}},
  {title:'NASA LAMBDA, “WMAP Products”', url:'https://lambda.gsfc.nasa.gov/product/wmap/current/', note:{en:'A 13 arcminute FWHM full-sky map of the temperature anisotropy; 33 times the angular resolution of COBE DMR.', ru:'Карта анизотропии температуры всего неба с разрешением 13 угловых минут (FWHM); в 33 раза выше углового разрешения COBE DMR.'}},
  {title:'L. Page et al. (2003), “First Year WMAP Observations: Interpretation of the TT and TE Angular Power Spectrum Peaks”, ApJS 148, 233', url:'https://arxiv.org/abs/astro-ph/0302220', note:{en:'First peak at ℓ = 220.1 ± 0.8, 74.7 ± 0.5 µK; first trough ℓ = 411.7 ± 3.5, 41.0 ± 0.5 µK; second peak ℓ = 546 ± 10, 48.8 ± 0.9 µK.', ru:'Первый пик при ℓ = 220,1 ± 0,8, 74,7 ± 0,5 мкК; первый провал ℓ = 411,7 ± 3,5, 41,0 ± 0,5 мкК; второй пик ℓ = 546 ± 10, 48,8 ± 0,9 мкК.'}},
  {title:'NIST, “Fundamental Physical Constants”', url:'https://physics.nist.gov/cuu/Constants/index.html', note:{en:'Exact SI values of h, k and c; Wien wavelength displacement constant b = 2.897771955 × 10⁻³ m·K.', ru:'Точные значения h, k и c в СИ; постоянная Вина b = 2,897771955 × 10⁻³ м·К.'}},
  {title:'NASA NSSDC, “Moon Fact Sheet” (with Earth comparison column)', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'Moon volumetric mean radius 1,737.4 km (diameter 3,474.8 km); orbit semimajor axis 0.3844 × 10⁶ km (384,400 km); Earth volumetric mean radius 6,371.0 km (diameter 12,742 km).', ru:'Средний объёмный радиус Луны 1737,4 км (диаметр 3474,8 км); большая полуось орбиты 0,3844 × 10⁶ км (384 400 км); средний объёмный радиус Земли 6371,0 км (диаметр 12 742 км).'}},
  {title:'ESA, “Planck”', url:'https://www.esa.int/Science_Exploration/Space_Science/Planck', note:{en:'ESA\'s Planck mission page.', ru:'Страница миссии «Планк» на сайте ЕКА.'}},
  {title:'NASA Science, “COBE”', url:'https://science.nasa.gov/mission/cobe/', note:{en:'COBE rocketed into Earth orbit on 18 November 1989.', ru:'COBE выведен на околоземную орбиту 18 ноября 1989 года.'}},
  {title:'A. A. Penzias (1978), “The Origin of Elements”, Nobel Lecture', url:'https://www.nobelprize.org/uploads/2018/06/penzias-lecture.pdf', note:{en:'Recounts the prediction: Alpher and Herman (1949) traced the relict radiation to “a temperature of a few degrees Kelvin”; Doroshkevich and Novikov (1964) “explicitly focus upon the Bell Laboratories twenty-foot horn reflector at Crawford Hill”.', ru:'История предсказания: Алфер и Херман (1949) оценили температуру реликтового излучения в «несколько градусов Кельвина»; Дорошкевич и Новиков (1964) «прямо указывают на 20-футовую рупорную антенну Bell Laboratories в Кроуфорд-Хилле».'}},
  {title:'NASA LAMBDA, “The Relikt Experiment”', url:'https://lambda.gsfc.nasa.gov/product/relikt/', note:{en:'Relikt-1 on Prognoz 9, launched 1 July 1983, at 37 GHz: the galactic microwave flux was measured and the CMB dipole observed; a quadrupole between 17 and 95 µK rms at 90 % confidence (Strukov et al. 1992).', ru:'«Реликт-1» на «Прогнозе-9», запущенном 1 июля 1983 года, на 37 ГГц: измерен микроволновый поток Галактики и наблюдён диполь реликтового излучения; квадруполь от 17 до 95 мкК (СКО) при доверительной вероятности 90 % (Strukov и др., 1992).'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderBB(); renderCV(); renderDP(); renderSK();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__glow = {planckMJy:planckMJy, nuPeakGHz:nuPeakGHz, wienMM:wienMM, photonsPerCm3:photonsPerCm3, misfit:misfit, bestFitT:bestFitT, FIT_T:FIT_T,
  ageAt:ageAt, tempAt:tempAt, skyT:skyT, dipoleMK:dipoleMK, dTl:dTl, beamB:beamB, lHalf:lHalf, beamSigmaRad:beamSigmaRad, expectedVar:expectedVar,
  skyMap:skyMap, rms:rms, fft1:fft1, MOON_DEG:MOON_DEG, COSMO:COSMO, FIRAS:FIRAS, T0:T0, PEAKS:PEAKS, RIPPLE_UK:RIPPLE_UK, NPIX:NPIX, PATCH_DEG:PATCH_DEG};
