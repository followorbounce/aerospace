/* ============ CONSTANTS ============ */
var GM_M = 4902.80011526323;      // km³/s², GRGM1200A header (PDS [17]); NASA fact sheet 4,902.8 [20]
var R_REF = 1738.0;               // km, reference radius of the GRAIL fields [17]
var R_M = 1737.4;                 // km, mean radius (NASA Moon fact sheet [20])
var M_MOON = 7.346e22;            // kg [20]
var G_N = 6.6743e-11;             // m³ kg⁻¹ s⁻², CODATA 2018 [21]
var GM_E = 398600.4, D_EM = 384400;   // Earth GM (km³/s²) and mean Earth–Moon distance (km) [20]
var W_M = 2*Math.PI/(655.720*3600);   // Moon's sidereal rotation, 655.720 h [20]
var MGAL = 1e8;                   // 1 km/s² = 10⁸ mGal
var D2R = Math.PI/180;
var G_SURF = GM_M/(R_M*R_M);      // km/s², mean surface gravity
function gmKg(kg){ return G_N*kg*1e-9; }          // kg → km³/s²
function vCirc(hKm){ return Math.sqrt(GM_M/(R_M + hKm)); }
function aria(svg){ svg.setAttribute('aria-label', svg.getAttribute('data-aria-' + lang)); }
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }
function km(v, d){ return (d ? fmt(v, d) : num(Math.round(v))) + T(' km',' км'); }
function sig(v, d){                 // a positive number with about d significant figures, localised
  if(v === 0) return '0';
  var e = Math.floor(Math.log10(Math.abs(v))), p = Math.max(0, d - 1 - e);
  return p > 6 ? sci(v, d) : (Math.abs(v) >= 1000 ? num(v) : fmt(v, p));
}
function sci(v, d){                 // 3.7 × 10¹⁷
  if(v === 0) return '0';
  var e = Math.floor(Math.log10(Math.abs(v))), m = v/Math.pow(10, e);
  if(+m.toFixed(d - 1) >= 10){ m /= 10; e++; }
  var sup = String(e).replace(/-/g, '⁻').replace(/\d/g, function(c){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
  return fmt(m, d - 1) + ' × 10' + sup;
}
function days(n){ return fmt(n, n < 10 ? 1 : 0) + T(' days',' сут'); }

/* ============ CH1–2 — A BURIED MASS ============ */
/* vertical gravity anomaly (mGal) at height h above a point mass buried at depth d, horizontal offset x (flat-Moon model) */
function dgPoint(gm, dKm, hKm, xKm){ var D = dKm + hKm; return gm*D/Math.pow(xKm*xKm + D*D, 1.5)*MGAL; }
function halfWidth(dKm, hKm){ return (dKm + hKm)*Math.sqrt(Math.pow(2, 2/3) - 1); }   // x where Δg = peak/2
/* Murphy & Siry (1969) Apollo 8 point mass near Sinus Aestuum: 5 × 10⁻⁶ lunar masses, ~100 km deep [3] */
var AESTUUM = {m:5e-6*M_MOON, d:100};

var bmM = document.getElementById('bmM'), bmD = document.getElementById('bmD'), bmH = document.getElementById('bmH');
bmM.value = Math.log10(AESTUUM.m);
function renderBM(){
  var kg = Math.pow(10, +bmM.value), gm = gmKg(kg), d = +bmD.value, h = +bmH.value;
  document.getElementById('bmMVal').textContent = sci(kg, 2) + T(' kg',' кг');
  document.getElementById('bmDVal').textContent = km(d);
  document.getElementById('bmHVal').textContent = km(h);
  bmM.setAttribute('aria-valuetext', sci(kg, 2) + T(' kilograms',' килограммов'));
  bmD.setAttribute('aria-valuetext', km(d)); bmH.setAttribute('aria-valuetext', km(h));
  var svg = document.getElementById('bmSvg'); svg.innerHTML = ''; aria(svg);
  var L = 54, R = 466, Tp = 26, B = 196, X0 = 400;
  var p0 = dgPoint(gm, d, 0, 0), ph = dgPoint(gm, d, h, 0), top = p0*1.08;
  function X(x){ return L + (x + X0)/(2*X0)*(R - L); } function Y(g){ return B - g/top*(B - Tp); }
  [0, 0.25, 0.5, 0.75, 1].forEach(function(f){ var g = top*f; ns('line', {x1:L, y1:Y(g), x2:R, y2:Y(g), stroke:'#e4e4de'}, svg); txt(svg, L - 5, Y(g) + 4, sig(g, 2), 'svg-small', 'end'); });
  [-400, -200, 0, 200, 400].forEach(function(x){ ns('line', {x1:X(x), y1:B, x2:X(x), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(x), B + 16, num(x), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 14, T('gravity anomaly, mGal','аномалия силы тяжести, мГал'), 'svg-small');
  txt(svg, R, B + 32, T('distance along the ground, km','расстояние по поверхности, км'), 'svg-small', 'end');
  function curve(hh, col, dash, w){ var s = ''; for(var k = 0; k <= 200; k++){ var x = -X0 + 2*X0*k/200; s += (k ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(dgPoint(gm, d, hh, x)).toFixed(1); } ns('path', {d:s, fill:'none', stroke:col, 'stroke-width':w, 'stroke-dasharray':dash || ''}, svg); }
  curve(0, '#8a8a82', '5 4', 1.4); curve(h, '#2f5aa1', '', 2.2);
  txt(svg, X(0) + 8, Y(p0) + 4, T('at the surface','на поверхности'), 'svg-small svg-halo');
  txt(svg, X(halfWidth(d, h)) + 6, Y(ph/2) - 6, T('at ','на высоте ') + km(h), 'svg-small svg-halo');
  var hw = halfWidth(d, h);
  ns('line', {x1:X(-hw), y1:Y(ph/2), x2:X(hw), y2:Y(ph/2), stroke:'#b5452a', 'stroke-width':1.4}, svg);
  cells(document.getElementById('bmReadout'), [
    [T('PEAK AT THE SURFACE','ПИК НА ПОВЕРХНОСТИ'), sig(p0, 3) + T(' mGal',' мГал')],
    [T('PEAK AT ALTITUDE','ПИК НА ВЫСОТЕ'), sig(ph, 3) + T(' mGal',' мГал')],
    [T('WIDTH AT HALF HEIGHT','ШИРИНА НА ПОЛУВЫСОТЕ'), km(2*hw)],
    [T('SHARE OF LUNAR GRAVITY (SURFACE)','ДОЛЯ ЛУННОЙ СИЛЫ ТЯЖЕСТИ (ПОВЕРХНОСТЬ)'), sig(p0/(G_SURF*MGAL)*100, 2) + ' %']
  ]);
  hud1.textContent = km(h); hud2.textContent = sig(ph, 3) + T(' mGal',' мГал');
  if(h === 0){ document.getElementById('bmStatus').innerHTML = T('At the surface the bump is as tall and as narrow as it gets. Raise the observer to see what an orbiter would feel.','На поверхности бугор максимально высок и узок. Поднимите наблюдателя, чтобы увидеть, что почувствует орбитальный аппарат.'); return; }
  document.getElementById('bmStatus').innerHTML = T('Seen from ','С высоты ') + km(h) + T(' the bump is ',' бугор в ') + fmt(p0/ph, p0/ph < 10 ? 1 : 0) + T('× weaker and ','× слабее и в ') + fmt((d + h)/Math.max(d, 0.5), 1) + T('× wider than at the surface. Every kilometre of height blurs it: to see small lumps, fly low.','× шире, чем на поверхности. Каждый километр высоты размывает его: чтобы увидеть мелкие неоднородности, надо летать низко.');
}
[bmM, bmD, bmH].forEach(function(el){ el.addEventListener('input', function(){ if(el !== bmH) pressGroup(document.getElementById('bmPre'), null); else pressGroup(document.getElementById('bmAlt'), null); renderBM(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#bmPre .btn'), function(b){ b.addEventListener('click', function(){ bmM.value = Math.log10(+this.getAttribute('data-m')); bmD.value = this.getAttribute('data-d'); pressGroup(this.parentNode, this); renderBM(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#bmAlt .btn'), function(b){ b.addEventListener('click', function(){ bmH.value = this.getAttribute('data-h'); pressGroup(this.parentNode, this); renderBM(); }); });

/* ============ CH3 — ORBITS THAT FALL ============ */
/* GRGM1200A normalised coefficients C̄nm S̄nm for n = 2…30, m = 0…n (PDS Geosciences [17]) */
var COEF = '-9.088434e-5 0,1.466412e-11 1.173276e-9,3.467310e-5 9.079190e-10,-3.197331e-6 0,2.636801e-5 5.454546e-6,1.417153e-5 4.878037e-6,1.227521e-5 -1.774222e-6,3.234781e-6 0,-6.013483e-6 1.664320e-6,-7.116162e-6 -6.777047e-6,-1.349870e-6 -1.344498e-5,-6.006962e-6 3.926413e-6,-2.237853e-7 0,-1.011596e-6 -4.118908e-6,4.399524e-6 1.057139e-6,4.661372e-7 8.698882e-6,2.754254e-6 6.767752e-8,3.110552e-6 -2.754411e-6,3.818428e-6 0,1.528259e-6 -2.599595e-6,-4.397305e-6 -2.167692e-6,-3.317510e-6 -3.427424e-6,3.412360e-7 -4.058056e-6,1.454417e-6 -1.034178e-5,-4.684226e-6 7.229855e-6,5.593414e-6 0,7.471669e-6 -1.197327e-7,-6.501484e-7 2.411107e-6,5.994192e-7 2.357327e-6,-8.436742e-7 7.565275e-7,-2.068619e-7 1.069314e-6,-1.065233e-6 1.100497e-6,-1.820447e-6 -1.600259e-6,2.346829e-6 0,4.168355e-9 1.098038e-6,3.009312e-6 1.930574e-6,-1.889040e-6 9.544758e-7,3.408693e-6 -5.282504e-7,-1.248065e-6 2.918561e-6,-1.660418e-6 -2.114683e-6,-1.509690e-6 3.268856e-6,-2.485685e-6 2.116347e-6,-3.530909e-6 0,1.866977e-6 8.104274e-8,1.927811e-6 -1.387563e-6,-1.992424e-6 2.201754e-6,-1.884429e-6 -1.425795e-6,-1.562527e-6 -3.524681e-6,-2.127199e-6 -3.002613e-6,-3.914824e-6 -1.068839e-7,-1.311981e-6 -2.203454e-6,-9.381998e-7 2.488140e-6,-1.069296e-6 0,8.416002e-7 -9.540712e-7,3.572438e-7 -2.651124e-7,4.841989e-7 6.688371e-7,-3.572971e-6 1.578914e-6,6.997015e-7 -3.145793e-7,-1.272921e-7 -2.095297e-6,-3.998645e-6 -9.107481e-7,-3.559436e-6 2.848851e-6,-4.753152e-6 -5.154737e-8,9.479303e-7 -1.719393e-6,-8.852086e-7 0,-1.946262e-8 6.142454e-7,6.995224e-7 -1.968045e-6,4.084189e-7 7.362656e-7,-1.086770e-6 2.190871e-6,5.032110e-8 2.588024e-6,5.243367e-7 -1.367000e-6,-8.452896e-8 -2.841098e-6,-2.095279e-6 -3.829448e-7,-2.334874e-6 2.526361e-7,-4.680589e-6 -1.736319e-7,-2.888804e-6 -1.746400e-6,-2.012261e-6 0,-7.068758e-7 1.647790e-6,-1.052102e-7 1.507817e-6,8.557076e-7 -4.058955e-6,8.130153e-7 -3.446070e-7,2.129515e-10 8.936261e-7,1.089069e-6 5.452466e-7,2.140001e-6 -9.675523e-7,3.985698e-7 -2.206534e-6,-1.345184e-6 1.095025e-6,-3.075479e-6 -1.273935e-6,-9.818267e-7 -3.284593e-7,3.027613e-7 1.246894e-6,2.564863e-7 0,1.354460e-6 -7.666400e-8,-3.425239e-6 3.839610e-7,-4.333416e-7 -1.456311e-6,7.772681e-7 -5.819235e-7,-1.186350e-6 1.021337e-6,-2.767674e-8 1.384238e-6,-1.621319e-7 -6.726681e-7,-2.922825e-7 -1.210525e-6,-1.699283e-7 5.275009e-7,-6.743047e-7 4.528617e-7,-1.305697e-6 4.390463e-7,-5.743834e-7 -1.522352e-6,2.499414e-6 -2.668797e-6,4.922538e-7 0,5.654275e-7 -6.821060e-7,3.644189e-7 3.552114e-7,5.578909e-7 1.679990e-7,-3.905251e-7 -2.582063e-6,-7.823883e-7 -2.159995e-7,-6.096177e-7 1.862283e-6,-5.154270e-7 1.161511e-6,3.061478e-7 4.414689e-7,8.051041e-8 -1.638037e-6,-7.782120e-7 5.930328e-7,-1.928512e-6 1.937220e-6,-1.448544e-6 -5.395014e-7,-3.214098e-7 -1.017799e-6,-6.135142e-7 1.071094e-6,-2.280910e-7 0,-7.975291e-7 3.536186e-7,-5.401531e-8 7.446558e-7,-1.378244e-6 -6.307093e-7,-9.560531e-7 -1.323374e-6,7.737643e-9 -8.933912e-7,-6.441733e-8 -3.306667e-7,1.125278e-6 1.489415e-6,1.315085e-6 1.886562e-6,-8.519312e-8 -1.011631e-6,-6.015947e-8 4.227152e-7,-1.426274e-6 -1.502442e-6,-1.767212e-6 -4.717907e-7,-4.049272e-7 3.095074e-7,8.234664e-7 5.614538e-7,5.483980e-7 7.778713e-7,5.568507e-7 0,1.155900e-7 8.252512e-7,1.455235e-6 7.655553e-9,-1.942729e-7 5.233354e-7,6.859524e-7 3.124413e-7,7.634285e-7 -6.484840e-7,7.298091e-7 -7.280731e-7,-2.807007e-7 -5.804000e-7,2.371406e-8 3.200972e-7,-7.806750e-7 -8.233661e-7,2.272161e-7 3.356480e-8,-3.314713e-7 7.721900e-7,-1.294188e-6 9.158356e-7,-1.798967e-7 -1.630012e-7,-6.798851e-7 1.776103e-7,-3.647553e-7 -1.015804e-6,-9.053454e-7 -9.187908e-7,-1.033031e-6 0,5.020203e-7 7.626027e-8,-2.907236e-7 -8.725841e-7,-2.676951e-8 -5.022520e-7,1.285118e-6 2.037549e-6,1.906641e-7 -6.042887e-7,7.212453e-7 -1.245855e-6,-1.298781e-6 -1.556269e-6,-2.114575e-7 -4.704485e-7,3.282213e-7 1.371644e-6,4.162786e-7 6.136973e-7,1.143966e-6 -2.020027e-7,9.594684e-7 1.795589e-7,-3.972403e-8 -2.222950e-7,4.031244e-7 3.045648e-7,-6.430612e-8 -5.045859e-7,-3.169488e-7 -2.515118e-7,-3.808106e-7 1.504751e-6,-5.203180e-7 0,3.604174e-7 2.683947e-8,-3.166166e-7 -7.261189e-7,9.952248e-7 4.326754e-7,-8.030661e-7 1.091316e-6,-5.193010e-7 7.319151e-8,-1.701311e-6 7.338975e-7,-2.182982e-7 -1.133726e-6,4.445937e-7 2.868093e-7,5.507299e-7 -6.373991e-7,3.581960e-7 -5.500996e-7,4.212976e-7 -1.297976e-6,8.308532e-7 2.347683e-7,-1.215843e-6 -1.001882e-7,6.111314e-8 -1.132050e-6,2.432224e-7 -1.084453e-6,8.988189e-7 -2.135834e-7,1.230032e-6 -4.712529e-7,-2.097003e-7 -2.851295e-7,2.156513e-7 0,-5.912414e-7 1.313155e-7,1.730047e-7 -3.717781e-7,-6.319855e-7 9.766073e-7,-9.934845e-7 -1.053905e-6,-2.584511e-7 1.483266e-6,1.587153e-7 3.800667e-7,1.223446e-6 4.911577e-7,6.511911e-7 8.666788e-7,-6.537435e-8 -4.222207e-7,-7.824357e-7 -2.260043e-7,9.200583e-9 -1.752671e-7,-1.104393e-7 -2.871755e-7,7.449836e-7 2.231846e-6,-1.260514e-7 5.398921e-7,8.390422e-8 8.251104e-8,-5.516799e-8 6.894774e-7,-1.069018e-6 -1.868679e-6,1.123823e-6 -2.165106e-8,6.020267e-7 3.653780e-7,3.355610e-7 0,-1.970530e-7 -3.825722e-7,8.127989e-7 3.411877e-9,6.352120e-7 -2.654923e-7,4.635535e-7 -4.888530e-7,2.189857e-7 -3.031429e-7,-1.913205e-7 3.299421e-7,-6.759399e-7 -7.314908e-7,2.345694e-7 6.928530e-8,-3.846563e-7 1.098745e-7,3.259881e-7 4.890625e-8,2.452900e-7 1.129431e-6,1.311388e-7 -9.832390e-7,8.304647e-7 6.176679e-7,-1.462415e-7 8.283403e-8,-3.247110e-7 9.198306e-8,9.283543e-7 -6.115909e-7,7.932749e-7 -1.185055e-6,8.449755e-7 -3.418473e-8,-2.172547e-7 3.051703e-7,-1.352270e-7 -3.587909e-7,-5.601326e-8 0,3.774274e-8 5.530587e-7,-1.363840e-6 -3.909918e-7,3.452782e-7 -9.283110e-7,-7.638066e-7 7.418800e-7,3.333216e-7 9.014954e-8,-6.229105e-8 -4.021874e-7,-3.753397e-7 6.192337e-7,-8.112983e-7 -3.254725e-8,6.076438e-8 -5.416266e-7,4.792790e-7 -5.735829e-8,-3.149733e-7 -1.730794e-7,-2.937700e-7 4.039470e-7,-2.713787e-7 -1.768859e-7,-1.590828e-7 3.486774e-7,-3.768316e-7 1.926466e-7,1.135234e-6 -2.919708e-7,8.690941e-7 1.466795e-6,-1.115543e-7 -6.063909e-7,1.872105e-6 1.489511e-7,-4.321475e-7 2.544081e-6,-3.340968e-7 3.240973e-7,-8.414185e-8 0,-3.028757e-7 2.514720e-7,-3.629236e-7 -9.016555e-8,5.907286e-7 6.582274e-7,3.559488e-7 7.156254e-8,4.767017e-7 -7.716430e-7,-2.359551e-7 1.839207e-7,3.693204e-7 6.640288e-7,1.750216e-7 -4.071331e-7,7.384659e-7 1.188617e-7,-3.856850e-7 6.046424e-7,-3.651361e-7 -7.102532e-7,-2.247930e-9 4.021394e-8,-3.394154e-7 2.015735e-7,-9.273262e-7 1.189012e-6,-2.127172e-7 -1.768917e-7,-6.187379e-7 4.793549e-7,-7.096492e-7 -7.660672e-8,5.180195e-7 -2.667041e-7,-4.981156e-7 3.254145e-7,6.666300e-7 -5.140593e-7,-1.686397e-7 7.622884e-8,3.561389e-7 6.564621e-7,-3.854359e-7 0,2.835896e-7 -8.344229e-7,4.572670e-7 -8.720172e-8,-6.957936e-7 3.190714e-7,4.113741e-7 -6.001254e-7,-2.263635e-7 7.308593e-7,4.021693e-7 9.624947e-8,4.155010e-7 -7.767472e-7,3.487662e-7 -3.505172e-7,1.014264e-6 7.236804e-8,-6.990224e-7 1.724769e-7,2.963069e-8 1.583217e-7,3.164216e-7 -4.733191e-7,-7.794704e-7 2.260819e-7,7.523208e-7 -4.321206e-7,2.736380e-7 6.543759e-8,-5.725404e-7 2.636145e-7,-3.306555e-7 -3.834521e-7,-3.369496e-8 3.045959e-7,-4.345610e-9 -6.096670e-8,-1.992519e-8 3.810317e-7,-5.911936e-7 3.042009e-7,-9.859829e-7 -4.888969e-7,-1.061363e-6 2.494206e-7,3.989770e-9 0,3.390389e-7 -2.729043e-7,4.213811e-7 3.630442e-7,-1.046905e-7 -9.526701e-7,5.201606e-7 1.966598e-7,4.707572e-8 -1.013799e-7,-3.801467e-7 2.973337e-8,3.511120e-7 1.465882e-7,5.363202e-7 2.126618e-7,-6.108196e-7 -7.016595e-8,-4.291170e-7 1.348453e-7,2.068937e-7 -3.809193e-7,1.204886e-6 -4.163125e-8,3.326007e-7 -3.834698e-7,8.169139e-7 -6.480080e-7,-1.837527e-7 3.807218e-7,2.619306e-7 -2.137912e-7,5.849803e-7 2.515766e-7,-9.956076e-7 -6.533803e-7,4.641826e-7 -6.313432e-7,-3.492955e-7 -1.687718e-7,2.985541e-7 1.577336e-7,1.206852e-7 7.238917e-7,-1.770554e-8 -3.568967e-7,9.708767e-7 -9.445481e-7,-2.157608e-7 0,-4.856659e-8 5.291860e-7,-6.613621e-7 5.391517e-8,6.743638e-7 -1.457316e-7,-5.790547e-7 -7.099806e-8,2.006092e-7 8.101727e-7,-2.538738e-7 3.345101e-7,6.908561e-7 9.665573e-7,-9.987421e-7 9.957573e-7,-3.555429e-7 9.835240e-8,-2.236948e-8 7.126116e-7,-2.591038e-8 -3.992673e-7,1.279320e-7 4.430341e-9,3.179860e-7 2.737897e-7,-6.398479e-7 6.848391e-7,1.474326e-7 3.707908e-8,2.204991e-7 -5.942386e-7,3.118191e-8 -4.867877e-7,-8.457826e-8 1.324655e-7,-8.187418e-7 -1.334028e-7,-4.563254e-8 -4.007678e-7,6.825347e-7 -2.907623e-7,-3.386906e-7 -7.880867e-7,9.260048e-7 -3.587994e-7,9.225050e-7 -3.066127e-8,-1.316382e-7 5.601454e-7,2.838722e-8 0,1.639394e-7 2.222332e-7,6.585249e-7 -1.962622e-7,1.932724e-7 6.644720e-7,3.465881e-7 2.447326e-7,6.030201e-8 -7.765562e-7,-5.199152e-7 -1.350482e-7,1.154371e-8 -4.393228e-7,-1.141347e-9 1.521589e-7,5.844652e-8 7.009027e-7,-3.097459e-7 -1.092212e-8,1.635457e-7 3.232913e-7,-4.246346e-7 -7.900947e-7,1.320943e-7 4.266594e-7,-1.204984e-7 8.898874e-8,4.412984e-8 -2.542920e-7,-1.028945e-7 4.005613e-7,-3.584973e-7 8.401913e-8,1.051122e-8 2.997082e-7,-1.941331e-7 2.114133e-7,-2.601232e-7 6.826494e-7,-5.301535e-7 -5.377484e-7,-9.320697e-7 8.594699e-7,1.034635e-7 -6.273908e-8,-7.251357e-7 -1.172158e-8,7.446142e-8 -3.400433e-8,1.097206e-7 4.780230e-7,-6.354851e-7 0,6.163245e-7 2.292939e-8,-2.049862e-7 -4.292209e-7,5.601071e-7 8.740391e-8,-4.007192e-7 3.213614e-7,-6.904476e-7 1.390995e-8,6.476248e-9 4.631896e-7,2.573385e-7 -3.585574e-7,4.125673e-8 -7.588039e-8,-6.175777e-7 1.002231e-7,6.557479e-8 -6.361350e-7,3.453490e-7 -4.384867e-7,-4.400939e-7 -5.205195e-7,2.356866e-7 -1.492461e-7,4.593037e-7 -7.281927e-7,6.182551e-8 4.102791e-7,1.514024e-7 3.910655e-7,1.881066e-7 6.809298e-7,2.055247e-7 -6.787940e-7,6.839190e-8 -1.923142e-7,3.941839e-7 -5.218718e-7,4.419618e-7 -4.587500e-7,7.905792e-7 8.756325e-7,-6.487494e-8 -6.418446e-7,7.645928e-7 -1.642080e-7,-3.737438e-7 5.777841e-7,-4.488833e-7 -7.206062e-7,-4.229406e-7 -2.770774e-7,8.388634e-7 0,3.286849e-8 7.939172e-7,-3.379923e-8 7.104742e-7,-3.093696e-7 -8.397200e-8,-9.168637e-7 6.436863e-8,1.480551e-7 4.895083e-8,4.680858e-7 3.445671e-8,-3.764468e-7 2.630320e-7,-1.411190e-7 3.033078e-8,-4.297180e-7 -9.158727e-8,-3.481602e-7 -9.021909e-7,1.869369e-7 -4.182522e-8,1.144237e-7 -5.158494e-8,3.917663e-7 -3.461152e-7,3.618279e-7 -2.946972e-7,-4.414163e-7 3.429533e-7,-2.387247e-7 -8.449622e-7,-7.974334e-8 -1.887999e-7,-8.597921e-8 6.461395e-7,-1.629443e-7 -3.748671e-8,2.799715e-7 -5.683814e-7,-2.576027e-7 7.202768e-8,-6.204540e-7 -9.253053e-8,-4.755442e-9 2.450083e-7,4.065227e-7 7.529302e-9,4.813540e-7 -5.169160e-7,1.333998e-7 9.087018e-7,-1.596384e-7 6.720722e-7,1.338352e-7 -4.422568e-9,-6.023930e-7 0,-1.595912e-7 -4.383550e-7,-2.032706e-7 -7.004601e-7,-1.966916e-7 2.659387e-7,-3.026307e-7 1.473544e-7,2.196228e-7 1.690152e-8,-1.277202e-7 -1.881119e-7,-1.076123e-7 -3.852899e-7,4.441174e-7 -2.266417e-7,6.017034e-8 -6.360338e-7,6.209976e-7 3.447018e-7,-7.845848e-8 4.354530e-7,-6.437390e-7 -4.918695e-7,3.622961e-7 3.843000e-7,1.882219e-8 8.077077e-7,-1.994288e-7 6.884937e-8,2.676236e-7 -8.700793e-8,-4.044488e-7 -3.072612e-7,-1.314924e-7 -5.153117e-9,1.090870e-8 -7.609982e-8,-6.747764e-9 3.850003e-7,6.295616e-8 2.933436e-7,-2.440648e-7 -4.748952e-7,1.576477e-7 3.299125e-7,1.557390e-8 3.719711e-8,-1.393150e-7 2.249272e-7,2.643241e-7 -3.946828e-7,2.061025e-7 1.912102e-7,-1.151642e-7 2.493255e-7,1.842935e-7 -1.460302e-7,1.013249e-7 0,-2.944807e-7 -4.291414e-9,-2.164404e-7 -2.322815e-7,-3.616709e-7 3.514297e-7,-6.226173e-8 -2.222789e-7,1.857948e-7 -3.126400e-7,2.400143e-8 3.477868e-7,-3.448234e-7 -3.079963e-7,-3.853668e-7 -3.359041e-7,-2.676133e-7 5.051760e-8,-1.147782e-7 -1.008720e-7,7.086905e-9 -2.348203e-7,-2.738043e-7 2.386437e-7,1.114340e-7 3.914470e-7,4.997235e-7 -2.057107e-7,-3.408157e-7 1.659479e-7,2.355954e-7 -2.693511e-7,3.276896e-7 3.503312e-7,2.961871e-7 3.205206e-8,-1.617171e-7 5.729473e-8,-1.544609e-7 -2.556394e-8,-2.536388e-7 -1.951742e-8,-1.397640e-8 3.929145e-7,-4.382366e-7 1.438948e-7,1.346223e-7 4.529644e-8,1.578001e-7 2.461151e-7,5.512217e-8 -3.705457e-7,-1.221448e-7 3.390721e-7,-1.378822e-7 -6.169940e-7,1.692752e-7 -1.404496e-7,-3.242223e-7 9.582900e-7';
var NMAX = 30;
var CNM = (function(){
  var rows = COEF.split(','), out = [], k = 0;
  for(var n = 2; n <= NMAX; n++) for(var m = 0; m <= n; m++){ var p = rows[k++].split(' '); out.push([n, m, +p[0], +p[1]]); }
  return out;
})();
/* spherical-harmonic acceleration in the Moon-fixed frame (Cunningham recursion, unnormalised coefficients) */
function makeField(N){
  var N1 = N + 2, C = new Float64Array(N1*N1), S = new Float64Array(N1*N1);
  function lf(k){ var f = 0; for(var i = 2; i <= k; i++) f += Math.log(i); return f; }
  C[0] = 1;
  CNM.forEach(function(r){ if(r[0] > N) return; var n = r[0], m = r[1], f = Math.sqrt((m ? 2 : 1)*(2*n + 1)*Math.exp(lf(n - m) - lf(n + m))); C[n*N1 + m] = r[2]*f; S[n*N1 + m] = r[3]*f; });
  var V = new Float64Array(N1*N1), W = new Float64Array(N1*N1), out = new Float64Array(3), K = GM_M/(R_REF*R_REF);
  function accel(x, y, z){
    var r2 = x*x + y*y + z*z, rho = R_REF*R_REF/r2, x0 = R_REF*x/r2, y0 = R_REF*y/r2, z0 = R_REF*z/r2, M = N + 1, n, m, i;
    V[0] = R_REF/Math.sqrt(r2); W[0] = 0; V[N1] = z0*V[0]; W[N1] = 0;
    for(n = 2; n <= M; n++){ V[n*N1] = ((2*n - 1)*z0*V[(n - 1)*N1] - (n - 1)*rho*V[(n - 2)*N1])/n; W[n*N1] = 0; }
    for(m = 1; m <= M; m++){
      var mm = m*N1 + m, pp = (m - 1)*N1 + m - 1;
      V[mm] = (2*m - 1)*(x0*V[pp] - y0*W[pp]); W[mm] = (2*m - 1)*(x0*W[pp] + y0*V[pp]);
      if(m < M){ V[mm + N1] = (2*m + 1)*z0*V[mm]; W[mm + N1] = (2*m + 1)*z0*W[mm]; }
      for(n = m + 2; n <= M; n++){ i = n*N1 + m; V[i] = ((2*n - 1)*z0*V[i - N1] - (n + m - 1)*rho*V[i - 2*N1])/(n - m); W[i] = ((2*n - 1)*z0*W[i - N1] - (n + m - 1)*rho*W[i - 2*N1])/(n - m); }
    }
    var ax = 0, ay = 0, az = 0, c, s, j, f;
    for(n = 0; n <= N; n++){ c = C[n*N1]; j = (n + 1)*N1; ax -= c*V[j + 1]; ay -= c*W[j + 1]; az -= (n + 1)*c*V[j]; }
    for(m = 1; m <= N; m++) for(n = m; n <= N; n++){
      c = C[n*N1 + m]; s = S[n*N1 + m]; f = 0.5*(n - m + 1)*(n - m + 2); j = (n + 1)*N1 + m;
      ax += 0.5*(-c*V[j + 1] - s*W[j + 1]) + f*(c*V[j - 1] + s*W[j - 1]);
      ay += 0.5*(-c*W[j + 1] + s*V[j + 1]) + f*(-c*W[j - 1] + s*V[j - 1]);
      az += (n - m + 1)*(-c*V[j] - s*W[j]);
    }
    out[0] = K*ax; out[1] = K*ay; out[2] = K*az; return out;
  }
  return accel;
}
var FIELDS = {};
function field(N){ return FIELDS[N] || (FIELDS[N] = makeField(N)); }
/* a satellite released at perilune; integrates in an inertial frame, the field turns with the Moon; Earth's tide added.
   el = {hp, ha (km above mean radius), i, O, w (deg)}, N = field degree. Returns a stepper. */
function orbitRun(el, N){
  var acc = field(N), rp = R_M + el.hp, ra = R_M + el.ha, a = (rp + ra)/2, e = (ra - rp)/(ra + rp), p = a*(1 - e*e);
  var i = el.i*D2R, O = el.O*D2R, w = el.w*D2R, cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  var P = [cO*cw - sO*sw*ci, sO*cw + cO*sw*ci, sw*si], Q = [-cO*sw - sO*cw*ci, -sO*sw + cO*cw*ci, cw*si], vq = Math.sqrt(GM_M/p)*(1 + e);
  var s = new Float64Array([rp*P[0], rp*P[1], rp*P[2], vq*Q[0], vq*Q[1], vq*Q[2]]);
  var k1 = new Float64Array(6), k2 = new Float64Array(6), k3 = new Float64Array(6), k4 = new Float64Array(6), tmp = new Float64Array(6);
  var dt = 60, t = 0, rmin = 1e9, day = 0, hist = [], crash = null, de2 = 1/(D_EM*D_EM);
  function deriv(tt, st, o){
    var th = W_M*tt, c = Math.cos(th), sn = Math.sin(th), bx = c*st[0] + sn*st[1], by = -sn*st[0] + c*st[1], bz = st[2];
    var g = acc(bx, by, bz), a0 = g[0], a1 = g[1], a2 = g[2];
    var dx = D_EM - bx, dy = -by, dz = -bz, d2 = dx*dx + dy*dy + dz*dz, d3 = d2*Math.sqrt(d2);   // Earth fixed on the Moon's +x axis
    a0 += GM_E*(dx/d3 - de2); a1 += GM_E*dy/d3; a2 += GM_E*dz/d3;
    o[0] = st[3]; o[1] = st[4]; o[2] = st[5]; o[3] = c*a0 - sn*a1; o[4] = sn*a0 + c*a1; o[5] = a2;
  }
  function advance(nDays){
    var stop = Math.min(t + nDays*86400, 400*86400), j;     // from the current time, so fractional pieces always progress
    while(crash === null && t < stop){
      deriv(t, s, k1); for(j = 0; j < 6; j++) tmp[j] = s[j] + dt/2*k1[j];
      deriv(t + dt/2, tmp, k2); for(j = 0; j < 6; j++) tmp[j] = s[j] + dt/2*k2[j];
      deriv(t + dt/2, tmp, k3); for(j = 0; j < 6; j++) tmp[j] = s[j] + dt*k3[j];
      deriv(t + dt, tmp, k4); for(j = 0; j < 6; j++) s[j] += dt/6*(k1[j] + 2*k2[j] + 2*k3[j] + k4[j]);
      t += dt;
      var r = Math.sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2]);
      if(r < rmin) rmin = r;
      if(r < R_M){ crash = t/86400; hist.push(0); break; }
      if(t >= (day + 1)*86400){ day++; hist.push(rmin - R_M); rmin = 1e9; }
    }
    return crash !== null;
  }
  return {advance:advance, hist:hist, get crash(){ return crash; }, get t(){ return t/86400; }};
}
function lifetime(el, N, maxDays){ var r = orbitRun(el, N); r.advance(maxDays); return {crash:r.crash, hist:r.hist.slice(), minAlt:Math.min.apply(null, r.hist)}; }

/* Precomputed with orbitRun (degree 30, Earth on): a 100 km circular orbit started over the Moon's Earth-facing meridian
   (node 0°), for every whole inclination 0–180°: day of impact within 365 days, or 0 if it survived. Regenerated by NOTES §strip. */
var STRIP = [0,0,0,0,39.2,14.8,13.8,13.1,12.4,12,11.9,11.9,12.6,13.7,15,34.6,36.5,38,39.7,64.5,67.2,0,0,0,0,0,0,0,0,0,0,56.6,53.2,33.5,32.3,31.8,31.6,31.5,31.7,31.8,32.2,32.7,33.9,34.9,54.1,57.7,61.4,109.1,0,0,0,0,0,223.9,180.5,155.8,148.3,131.1,127.2,123.4,103.5,102.1,101.3,100.7,101.5,102.9,127.1,131,183.1,289.6,0,0,0,0,0,0,0,0,0,0,334.5,254,281,0,0,0,0,0,212.9,158.5,150.6,150.7,176.5,289.5,0,0,0,0,0,333,0,0,0,0,0,0,0,0,0,0,0,0,179.5,123.1,95.4,93.3,69.3,69.3,69.9,92.7,95.3,97.4,98.8,99.8,100.5,125.2,127.1,128.4,157.5,217.3,0,0,0,0,211.2,137.6,86.8,81.4,57.4,53.5,51.7,50.5,49.4,47.6,41.3,41.5,47.3,48.6,51.2,54.2,82.9,94.9,0,0,0,0,0,0,0,80.8,78.3,52.1,50.6,49.5,48.6,48.1,47.7,47.5,47.3,47.2,47.1,47.1,47.2,47.5,48.1,49.3,51.2,79.8,0,0,0];
/* PFS-2 (90 × 130 km, 10° from the equator, retrograde [5]): impact day for 32 starting orientations (node 0–315° by 45°, perilune 0–270° by 90°) */
var PFS2_SCAN = [46.6,50.9,50.2,47.3,30.1,51.3,51.1,30.1,28.4,33.4,33.4,29.2,28.1,30.9,32,29.3,12.7,32.1,34.1,31.2,13.2,33.2,37.2,33.9,18.9,38.1,43.2,39.1,42.3,49.4,50.9,44.8];
var FROZEN = [27, 50, 76, 86];        // NASA / Konopliv [6]
var LIFE_DAYS = 365;

var lfI = document.getElementById('lfI'), lfP = document.getElementById('lfP'), lfA = document.getElementById('lfA');
var lfN = 30, lfRun = null, lfToken = 0;
function isPFS1(el){ return el.i === 28.5 && el.hp === 102 && el.ha === 139; }
function lfEl(){ var hp = +lfP.value, ha = Math.max(hp, +lfA.value); return {hp:hp, ha:ha, i:+lfI.value, O:0, w:0}; }
/* The year-long run costs ~4–5 s of arithmetic on a desktop (several times more on a phone), so it is cut into pieces of
   0.1 simulated day and each frame does only as many pieces as fit in ~10 ms; the chart redraws once per frame. The run
   does not start until the chart is near the viewport. */
var LF_BUDGET_MS = 10, LF_PIECE_DAYS = 0.1, lfVisible = !('IntersectionObserver' in window), lfPending = null;
function now(){ return (window.performance && performance.now) ? performance.now() : Date.now(); }
function startLF(){
  var token = ++lfToken; lfRun = orbitRun(lfEl(), lfN); drawLF();
  function chunk(){
    if(token !== lfToken) return;
    var t0 = now(), done = false;
    do { done = lfRun.advance(Math.min(LF_PIECE_DAYS, LIFE_DAYS - lfRun.t)); } while(!done && lfRun.t < LIFE_DAYS && now() - t0 < LF_BUDGET_MS);
    drawLF(); if(!done && lfRun.t < LIFE_DAYS) schedule(chunk);
  }
  if(lfVisible) schedule(chunk); else lfPending = chunk;
}
if(!lfVisible){
  var lfObs = new IntersectionObserver(function(es){ if(!lfVisible && (es || []).some(function(e){ return e.isIntersecting; })){ lfVisible = true; if(lfObs && lfObs.disconnect) lfObs.disconnect(); if(lfPending){ var f = lfPending; lfPending = null; schedule(f); } } }, {rootMargin:'300px 0px'});
  lfObs.observe(document.getElementById('lfSvg'));
}
function schedule(f){ (window.requestAnimationFrame || function(g){ return setTimeout(g, 16); })(f); }
function drawLF(){
  var el = lfEl(), run = lfRun;
  document.getElementById('lfIVal').textContent = fmt(el.i, el.i % 1 ? 1 : 0) + '°' + (el.i > 90 ? T(' (retrograde)',' (обратное)') : '');
  document.getElementById('lfPVal').textContent = km(el.hp); document.getElementById('lfAVal').textContent = km(el.ha);
  lfI.setAttribute('aria-valuetext', fmt(el.i, 1) + '°'); lfP.setAttribute('aria-valuetext', km(el.hp)); lfA.setAttribute('aria-valuetext', km(el.ha));
  var svg = document.getElementById('lfSvg'); svg.innerHTML = ''; aria(svg);
  var L = 50, R = 466, Tp = 22, B = 182, ymax = 200;
  function X(dd){ return L + dd/LIFE_DAYS*(R - L); } function Y(h){ return B - Math.min(h, ymax)/ymax*(B - Tp); }
  [0, 50, 100, 150, 200].forEach(function(h){ ns('line', {x1:L, y1:Y(h), x2:R, y2:Y(h), stroke:'#e4e4de'}, svg); txt(svg, L - 5, Y(h) + 4, num(h), 'svg-small', 'end'); });
  [0, 60, 120, 180, 240, 300, 365].forEach(function(dd){ ns('line', {x1:X(dd), y1:B, x2:X(dd), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(dd), B + 16, num(dd), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c', 'stroke-width':1.6}, svg);
  txt(svg, L, 12, T('lowest altitude each day, km','наименьшая высота за сутки, км'), 'svg-small');
  txt(svg, R, B + 30, T('days after release','сутки после отделения'), 'svg-small', 'end');
  txt(svg, R - 4, B - 6, T('surface','поверхность'), 'svg-small svg-halo', 'end');
  var h = run.hist, d = '';
  for(var k = 0; k < h.length; k++) d += (k ? 'L' : 'M') + X(k + 1).toFixed(1) + ',' + Y(h[k]).toFixed(1);
  if(d) ns('path', {d:d, fill:'none', stroke:'#2f5aa1', 'stroke-width':1.8}, svg);
  if(run.crash !== null){ ns('circle', {cx:X(run.crash), cy:B, r:5.5, fill:'#b5452a'}, svg); var lateC = run.crash > 250; txt(svg, X(run.crash) + (lateC ? -8 : 8), B - 10, T('impact, day ' + fmt(run.crash, 0), 'падение: ' + fmt(run.crash, 0) + ' сут'), 'svg-small svg-halo', lateC ? 'end' : 'start'); }
  /* strip: lifetime vs inclination */
  var s2 = document.getElementById('lfStrip'); s2.innerHTML = ''; aria(s2);
  var sL = 50, sR = 466, sT = 22, sB = 82;
  function SX(i){ return sL + i/180*(sR - sL); }
  txt(s2, sL, 12, T('100 km circular orbit (model): days to impact · blue = survives a year','орбита 100 км (модель): сутки до падения · синее — живёт год'), 'svg-tiny');
  STRIP.forEach(function(c, i){
    var hgt = c ? (sB - sT)*Math.min(c, LIFE_DAYS)/LIFE_DAYS : sB - sT;
    ns('rect', {x:SX(i) - 1.1, y:sB - hgt, width:2.2, height:hgt, fill:c ? '#c9a46a' : '#2f5aa1'}, s2);
  });
  ns('line', {x1:sL, y1:sB, x2:sR, y2:sB, stroke:'#0b0b0c'}, s2);
  [0, 30, 60, 90, 120, 150, 180].forEach(function(i){ txt(s2, SX(i), sB + 14, i + '°', 'svg-small', 'middle'); });
  FROZEN.forEach(function(i){ ns('path', {d:'M' + SX(i) + ',' + (sB + 18) + 'l-4,7h8z', fill:'#0b0b0c'}, s2); });
  txt(s2, sR, sB + 36, T('▲ frozen inclinations found by JPL: 27°, 50°, 76°, 86°','▲ «замороженные» наклонения по данным JPL: 27°, 50°, 76°, 86°'), 'svg-tiny', 'end');
  ns('line', {x1:SX(el.i), y1:sT - 4, x2:SX(el.i), y2:sB + 4, stroke:'#b5452a', 'stroke-width':2}, s2);
  var minA = h.length ? Math.min.apply(null, h) : el.hp;
  cells(document.getElementById('lfReadout'), [
    [T('DAYS COMPUTED','РАССЧИТАНО СУТОК'), fmt(Math.min(run.t, LIFE_DAYS), 0) + ' / ' + LIFE_DAYS],
    [T('LOWEST ALTITUDE SO FAR','НАИМЕНЬШАЯ ВЫСОТА'), km(Math.max(0, minA), 1)],
    [T('IMPACT','ПАДЕНИЕ'), run.crash !== null ? T('day ' + fmt(run.crash, 1), fmt(run.crash, 1) + ' сут') : (run.t >= LIFE_DAYS ? T('none within a year','за год — нет') : '…')],
    [T('FIELD','ПОЛЕ'), T('degree ','степень ') + lfN + (lfN === 2 ? T(' (smooth, slightly squashed Moon)',' (гладкая, слегка сплюснутая Луна)') : '')]
  ]);
  var st = document.getElementById('lfStatus');
  if(run.crash !== null) st.innerHTML = T('The lumps pump the orbit\'s eccentricity: perilune sinks until the satellite hits the Moon on day ','Неоднородности раскачивают эксцентриситет: периселений опускается, и на ') + fmt(Math.ceil(run.crash), 0) + T('.','-е сутки спутник падает на Луну.');
  else if(run.t >= LIFE_DAYS) st.innerHTML = T('Still in orbit after a year. The lowest point wanders, but the pulls of the lumps largely cancel at this tilt.','Через год всё ещё на орбите. Нижняя точка гуляет, но при таком наклоне притяжения неоднородностей в основном компенсируют друг друга.')
    + (isPFS1(el) ? T(' A limit of the model: the real PFS-1 came down in January 1973, after less than a year and a half [6].',' Это ограничение модели: настоящий PFS-1 упал в январе 1973 года, не продержавшись и полутора лет [6].')
      : (lfN === 30 && (el.i < 3.5 || el.i > 176.5)) ? T(' A limit of the model: this near-equatorial band is not among the frozen inclinations JPL found [6].',' Это ограничение модели: такой почти экваториальной зоны нет среди «замороженных» наклонений, найденных в JPL [6].') : '');
  else { var msg = T('Integrating a year of orbit…','Идёт расчёт орбиты на год…'); if(st.textContent !== msg) st.textContent = msg; }   // progress lives in the readout, not the live region
}
[lfI, lfP, lfA].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('lfPre'), null); if(+lfA.value < +lfP.value) lfA.value = lfP.value; startLF(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#lfPre .btn'), function(b){ b.addEventListener('click', function(){ lfI.value = this.getAttribute('data-i'); lfP.value = this.getAttribute('data-p'); lfA.value = this.getAttribute('data-a'); pressGroup(this.parentNode, this); startLF(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#lfDeg .btn'), function(b){ b.addEventListener('click', function(){ lfN = +this.getAttribute('data-n'); pressGroup(this.parentNode, this); startLF(); }); });

/* ============ CH5 — TWO SPACECRAFT, ONE SIGNAL ============ */
/* first-order range-rate change between two co-orbiting spacecraft passing over a point mass (energy conservation:
   each speeds up by GM_m/(v s)); midpoint at x km past the mass, separation Lk km, mass at slant depth D = d + h. µm/s */
function rangeRate(gm, D, Lk, v, x){
  var sL = Math.sqrt((x + Lk/2)*(x + Lk/2) + D*D), sT = Math.sqrt((x - Lk/2)*(x - Lk/2) + D*D);
  return gm/v*(1/sL - 1/sT)*1e9;
}
function rrPeak(gm, D, Lk, v){ var best = 0; for(var x = -600; x <= 600; x += 0.5){ var r = Math.abs(rangeRate(gm, D, Lk, v, x)); if(r > best) best = r; } return best; }
/* the same pass integrated numerically in the orbit plane (central field + point mass), minus the unperturbed pair: a check of the formula */
function rangeRateNumeric(gm, dKm, hKm, Lk){
  var r0 = R_M + hKm, v0 = Math.sqrt(GM_M/r0), mp = [0, R_M - dKm], dth = 2*Math.asin(Lk/(2*r0)), w0 = v0/r0, th0 = -1.2;
  function st(th){ return [r0*Math.sin(th), r0*Math.cos(th), v0*Math.cos(th), -v0*Math.sin(th)]; }
  function f(y, o){ var r2 = y[0]*y[0] + y[1]*y[1], r3 = r2*Math.sqrt(r2), dx = mp[0] - y[0], dy = mp[1] - y[1], q2 = dx*dx + dy*dy, q3 = q2*Math.sqrt(q2);
    o[0] = y[2]; o[1] = y[3]; o[2] = -GM_M*y[0]/r3 + gm*dx/q3; o[3] = -GM_M*y[1]/r3 + gm*dy/q3; }
  function stepAll(ys, dt){ ys.forEach(function(y){ var k1 = [], k2 = [], k3 = [], k4 = [], t = [], j; f(y, k1); for(j = 0; j < 4; j++) t[j] = y[j] + dt/2*k1[j]; f(t, k2); for(j = 0; j < 4; j++) t[j] = y[j] + dt/2*k2[j]; f(t, k3); for(j = 0; j < 4; j++) t[j] = y[j] + dt*k3[j]; f(t, k4); for(j = 0; j < 4; j++) y[j] += dt/6*(k1[j] + 2*k2[j] + 2*k3[j] + k4[j]); }); }
  /* start far from the mass on circular orbits of the perturbed field's local energy: subtract the far-field offset at the start */
  var lead = st(th0 + dth/2), trail = st(th0 - dth/2), out = [], dt = 1, T = 2*1.2/w0;
  function rr(){ var dx = lead[0] - trail[0], dy = lead[1] - trail[1], d = Math.hypot(dx, dy); return ((lead[2] - trail[2])*dx + (lead[3] - trail[3])*dy)/d*1e9; }
  var base = rr();
  for(var t = 0; t < T; t += dt){ stepAll([lead, trail], dt); out.push({x:(t + dt)*v0 - 1.2*r0, rr:rr() - base}); }
  return out;
}
var KBR_NOISE = 0.05;      // µm/s, upper end of the GRAIL primary-mission RMS range-rate residuals, 0.02–0.05 µm/s [11]
var LO_SIGNAL = 50e3;      // µm/s: the ~50 mm/s Lunar Orbiter velocity variations that revealed mascons [2]
var rrM = document.getElementById('rrM'), rrD = document.getElementById('rrD'), rrH = document.getElementById('rrH'), rrL = document.getElementById('rrL');
rrM.value = Math.log10(AESTUUM.m);
function renderRR(){
  var kg = Math.pow(10, +rrM.value), gm = gmKg(kg), d = +rrD.value, h = +rrH.value, Lk = +rrL.value, v = vCirc(h), D = d + h;
  document.getElementById('rrMVal').textContent = sci(kg, 2) + T(' kg',' кг');
  document.getElementById('rrDVal').textContent = km(d); document.getElementById('rrHVal').textContent = km(h); document.getElementById('rrLVal').textContent = km(Lk);
  rrM.setAttribute('aria-valuetext', sci(kg, 2) + T(' kilograms',' килограммов')); rrD.setAttribute('aria-valuetext', km(d)); rrH.setAttribute('aria-valuetext', km(h)); rrL.setAttribute('aria-valuetext', km(Lk));
  var pk = rrPeak(gm, D, Lk, v);
  var svg = document.getElementById('rrSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 22, B = 202, Mid = (Tp + B)/2, X0 = 500, top = Math.max(pk*1.15, KBR_NOISE*3);
  function X(x){ return L + (x + X0)/(2*X0)*(R - L); } function Y(r){ return Mid - r/top*(B - Tp)/2; }
  ns('rect', {x:L, y:Y(KBR_NOISE), width:R - L, height:Math.max(1, Y(-KBR_NOISE) - Y(KBR_NOISE)), fill:'#f1dcd3'}, svg);
  [-1, -0.5, 0, 0.5, 1].forEach(function(f){ ns('line', {x1:L, y1:Y(top*f), x2:R, y2:Y(top*f), stroke:f ? '#e4e4de' : '#9aa3aa'}, svg); txt(svg, L - 5, Y(top*f) + 4, (f < 0 ? '−' : '') + sig(Math.abs(top*f), 2), 'svg-small', 'end'); });
  [-450, -300, -150, 0, 150, 300, 450].forEach(function(x){ ns('line', {x1:X(x), y1:B, x2:X(x), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(x), B + 16, fmt(x/v/60, 1), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 12, T('change in range rate, µm/s','изменение скорости сближения, мкм/с'), 'svg-small');
  txt(svg, R, B + 32, T('minutes from passing over the mass','минуты от пролёта над массой'), 'svg-small', 'end');
  var s = ''; for(var k = 0; k <= 300; k++){ var x = -X0 + 2*X0*k/300; s += (k ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(rangeRate(gm, D, Lk, v, x)).toFixed(1); }
  ns('path', {d:s, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  txt(svg, R - 4, Y(KBR_NOISE) - 4, T('GRAIL noise ±0.05 µm/s','шум GRAIL ±0,05 мкм/с'), 'svg-tiny svg-halo', 'end');
  cells(document.getElementById('rrReadout'), [
    [T('PEAK SIGNAL','ПИК СИГНАЛА'), sig(pk, 3) + T(' µm/s',' мкм/с')],
    [T('SIGNAL ÷ NOISE','СИГНАЛ ÷ ШУМ'), sig(pk/KBR_NOISE, 2)],
    [T('ORBITAL SPEED','ОРБИТАЛЬНАЯ СКОРОСТЬ'), fmt(v, 3) + T(' km/s',' км/с')],
    [T('VS. LUNAR ORBITER\'S 50 mm/s','ПО СРАВНЕНИЮ С 50 мм/с LUNAR ORBITER'), sig(pk/LO_SIGNAL*100, 2) + ' %']
  ]);
  document.getElementById('rrStatus').innerHTML = pk > KBR_NOISE
    ? T('Detectable: the peak is ','Обнаружимо: пик в ') + sig(pk/KBR_NOISE, 2) + T(' times the noise of GRAIL\'s Ka-band link. The lead spacecraft is pulled ahead first, then the trailing one catches up.',' раз больше шума Ka-диапазонной линии GRAIL. Сначала масса тянет вперёд ведущий аппарат, затем догоняет ведомый.')
    : T('Lost in the noise: the signal is below the 0.05 µm/s scatter of the measurements. Fly lower, or look for a bigger mass.','Тонет в шуме: сигнал меньше разброса измерений 0,05 мкм/с. Летите ниже или ищите массу побольше.');
}
[rrM, rrD, rrH, rrL].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById(el === rrH ? 'rrAlt' : 'rrPre'), null); renderRR(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rrPre .btn'), function(b){ b.addEventListener('click', function(){ rrM.value = Math.log10(+this.getAttribute('data-m')); rrD.value = this.getAttribute('data-d'); pressGroup(this.parentNode, this); renderRR(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rrAlt .btn'), function(b){ b.addEventListener('click', function(){ rrH.value = this.getAttribute('data-h'); pressGroup(this.parentNode, this); renderRR(); }); });

/* ============ CH6 — DEGREE AND ALTITUDE ============ */
function blockKm(l){ return Math.PI*R_REF/l; }                         // half-wavelength, the "block size" of [11]
function atten(l, hKm){ return Math.pow(R_REF/(R_REF + hKm), l + 2); }  // degree-l gravity at altitude vs at the surface
function eFoldKm(l){ return R_REF*(Math.exp(1/(l + 2)) - 1); }         // altitude at which degree l is weakened e-fold
function kaula(l){ return 2.5e-4/(l*l); }                               // RMS coefficient power law of [11]
var MODELS = [
  {l:150, en:'Lunar Prospector', ru:'Lunar Prospector'},
  {l:420, en:'GL0420A', ru:'GL0420A'},
  {l:900, en:'GL0900D', ru:'GL0900D'},
  {l:1200, en:'GRGM1200A', ru:'GRGM1200A'},
  {l:1800, en:'GL1800F', ru:'GL1800F'}
];
var rsL = document.getElementById('rsL'), rsH = document.getElementById('rsH');
function renderRS(){
  var l = Math.round(Math.pow(10, +rsL.value)), h = +rsH.value;
  document.getElementById('rsLVal').textContent = num(l); document.getElementById('rsHVal').textContent = km(h);
  rsL.setAttribute('aria-valuetext', T('degree ','степень ') + num(l) + ', ' + km(blockKm(l), 1)); rsH.setAttribute('aria-valuetext', km(h));
  var svg = document.getElementById('rsSvg'); svg.innerHTML = ''; aria(svg);
  var L = 58, R = 466, Tp = 26, B = 206, xa = 1, xb = Math.log10(2000), ya = -12, yb = 0;
  function X(ll){ return L + (Math.log10(ll) - xa)/(xb - xa)*(R - L); } function Y(a){ return B - (Math.max(ya, Math.log10(a)) - ya)/(yb - ya)*(B - Tp); }
  [0, -3, -6, -9, -12].forEach(function(e){ ns('line', {x1:L, y1:Y(Math.pow(10, e)), x2:R, y2:Y(Math.pow(10, e)), stroke:'#e4e4de'}, svg); txt(svg, L - 5, Y(Math.pow(10, e)) + 4, e ? '10' + String(e).replace('-', '⁻').replace(/\d/g, function(c){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; }) : '1', 'svg-small', 'end'); });
  [10, 30, 100, 300, 1000].forEach(function(ll){ ns('line', {x1:X(ll), y1:B, x2:X(ll), y2:B + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(ll), B + 16, num(ll), 'svg-small', 'middle'); });
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  txt(svg, L, 12, T('signal left at altitude (fraction of the surface value)','остаток сигнала на высоте (доля от поверхностного)'), 'svg-small');
  txt(svg, R, B + 32, T('spherical-harmonic degree (log)','степень сферической гармоники (лог.)'), 'svg-small', 'end');
  MODELS.forEach(function(md, j){ ns('line', {x1:X(md.l), y1:Tp, x2:X(md.l), y2:B, stroke:'#c9c9c1', 'stroke-dasharray':'3 3'}, svg); txt(svg, X(md.l) - 3, Tp + 10 + (j % 2)*12, T(md.en, md.ru), 'svg-tiny svg-halo', 'end'); });
  [[100, '#9aa3aa'], [55, '#7d8a96'], [23, '#5f6f7d'], [11, '#3f4e5b']].forEach(function(p){
    var s = ''; for(var k = 0; k <= 120; k++){ var ll = Math.pow(10, xa + (xb - xa)*k/120); s += (k ? 'L' : 'M') + X(ll).toFixed(1) + ',' + Y(atten(ll, p[0])).toFixed(1); }
    ns('path', {d:s, fill:'none', stroke:p[1], 'stroke-width':1.1}, svg);
    var lx = Math.min(1950, 13.8/Math.log(1 + p[0]/R_REF)), edge = lx > 1500; txt(svg, X(lx) + (edge ? -4 : 4), Y(atten(lx, p[0])) + (edge ? -5 : 0), km(p[0]), 'svg-tiny svg-halo', edge ? 'end' : 'start');
  });
  var s2 = ''; for(var k2 = 0; k2 <= 120; k2++){ var l2 = Math.pow(10, xa + (xb - xa)*k2/120); s2 += (k2 ? 'L' : 'M') + X(l2).toFixed(1) + ',' + Y(atten(l2, h)).toFixed(1); }
  ns('path', {d:s2, fill:'none', stroke:'#2f5aa1', 'stroke-width':2.2}, svg);
  ns('circle', {cx:X(l), cy:Y(atten(l, h)), r:6, fill:'none', stroke:'#b5452a', 'stroke-width':2.4}, svg);
  var a = atten(l, h);
  cells(document.getElementById('rsReadout'), [
    [T('SMALLEST FEATURE (HALF-WAVELENGTH)','МЕЛЬЧАЙШАЯ ДЕТАЛЬ (ПОЛУВОЛНА)'), km(blockKm(l), blockKm(l) < 10 ? 1 : 0)],
    [T('SIGNAL LEFT AT ALTITUDE','ОСТАТОК СИГНАЛА НА ВЫСОТЕ'), a > 1e-3 ? sig(a*100, 2) + ' %' : sci(a, 2)],
    [T('ALTITUDE THAT WEAKENS IT e-FOLD','ВЫСОТА ОСЛАБЛЕНИЯ В e РАЗ'), km(eFoldKm(l), eFoldKm(l) < 10 ? 1 : 0)],
    [T('TYPICAL COEFFICIENT SIZE','ТИПИЧНЫЙ КОЭФФИЦИЕНТ'), sci(kaula(l), 2)]
  ]);
  document.getElementById('rsStatus').innerHTML = T('Degree ','Степень ') + num(l) + T(' describes features about ',' описывает детали размером около ') + km(blockKm(l), blockKm(l) < 10 ? 1 : 0) + T(' across. From ','. С высоты ') + km(h) + T(' only ',' от них остаётся лишь ') + (a > 1e-3 ? sig(a*100, 2) + ' %' : sci(a, 2)) + T(' of their pull is left to measure.',' притяжения.');
}
[rsL, rsH].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById(el === rsL ? 'rsPre' : 'rsAlt'), null); renderRS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rsPre .btn'), function(b){ b.addEventListener('click', function(){ rsL.value = Math.log10(+this.getAttribute('data-l')); pressGroup(this.parentNode, this); renderRS(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#rsAlt .btn'), function(b){ b.addEventListener('click', function(){ rsH.value = this.getAttribute('data-h'); pressGroup(this.parentNode, this); renderRS(); }); });

/* ============ CH7 — THE CRUST ============ */
function bouguerPerKm(rho){ return 2*Math.PI*G_N*rho*1000*1e5; }   // mGal per km of rock: 2πGρ
function porosity(bulk, grain){ return 1 - bulk/grain; }

/* ============ CH8 — LEGACY ============ */
var TIMELINE = [
  ['1968', 'Paul Muller and William Sjogren at JPL turn the Doppler record of 74 consecutive Lunar Orbiter 5 orbits into a gravity map of the near side: “mascons” under the ringed maria; published in <i>Science</i> in August [1][2].', 'Пол Мюллер и Уильям Сьогрен в JPL превращают доплеровские записи 74 последовательных витков Lunar Orbiter 5 в гравиметрическую карту видимой стороны: «масконы» под кольцевыми морями; публикация в <i>Science</i> в августе [1][2].'],
  ['1969', 'From Apollo 8 tracking, James Murphy and Joseph Siry model a mascon near Sinus Aestuum as a point mass of 5 × 10⁻⁶ Moons about 100 km deep, about 250 mGal at the surface [3].', 'По траекторным данным «Аполлона-8» Джеймс Мёрфи и Джозеф Сайри описывают маскон у Залива Зноя точечной массой 5 × 10⁻⁶ массы Луны на глубине около 100 км — около 250 мГал на поверхности [3].'],
  ['1971', 'Apollo 15 releases the subsatellite PFS-1 on 4 August, 102 × 139 km, inclined 28.5°; it returns data until January 1973 [4].', '4 августа «Аполлон-15» отделяет субспутник PFS-1: 102 × 139 км, наклонение 28,5°; данные приходят до января 1973 года [4].'],
  ['1972', 'Apollo 16 releases PFS-2 on 24 April, 10° from the lunar equator; it hits the Moon on 29 May after 425 revolutions [5][6].', '24 апреля «Аполлон-16» отделяет PFS-2 — в 10° от лунного экватора; 29 мая, после 425 витков, он падает на Луну [5][6].'],
  ['1998–99', 'Lunar Prospector maps gravity from 100 km and then 30 km, firing its engine every two months — more than once a month when low [6]; its field reaches degree 150 [7].', 'Lunar Prospector картирует гравитацию с высоты 100 км, затем 30 км, включая двигатель раз в два месяца, а на малой высоте — чаще раза в месяц [6]; его модель поля доходит до степени 150 [7].'],
  ['2009', 'Japan\'s Kaguya (SELENE) tracks the main orbiter over the far side through the small relay satellite Okina; the far-side gravity results appear in <i>Science</i> in February [8].', 'Японский «Кагуя» (SELENE) отслеживает основной аппарат над обратной стороной через малый спутник-ретранслятор «Окина»; результаты по гравитации обратной стороны выходят в <i>Science</i> в феврале [8].'],
  ['2011', 'GRAIL launches on 10 September; Ebb and Flow reach lunar orbit on 31 December and 1 January [9][11].', '10 сентября стартует GRAIL; Ebb и Flow выходят на окололунную орбиту 31 декабря и 1 января [9][11].'],
  ['2012', 'Primary mapping 1 March – 29 May at about 55 km; extended mission 30 August – 14 December at 23 km, then 11 km; on 17 December both spacecraft hit a mountain near Goldschmidt crater, named for Sally K. Ride [12][15].', 'Основное картирование 1 марта – 29 мая на высоте около 55 км; расширенная миссия 30 августа – 14 декабря на 23 км, затем на 11 км; 17 декабря оба аппарата врезаются в гору у кратера Гольдшмидт, названную в честь Салли К. Райд [12][15].'],
  ['2013', 'First results: a field to degree 420; a crust of density 2,550 kg/m³, 12 % porous and 34–43 km thick on average; and a model of how mascon basins form [11][13][14].', 'Первые результаты: поле до степени 420; кора плотностью 2550 кг/м³ с пористостью 12 % и средней толщиной 34–43 км; модель образования масконных бассейнов [11][13][14].'],
  ['2025', 'JPL\'s field GL1800F, to degree 1800, and a tidal analysis showing the near-side mantle is likely warmer than the far side\'s [17][19].', 'Поле JPL GL1800F до степени 1800 и анализ приливов: мантия видимой стороны, вероятно, теплее, чем обратной [17][19].']
];

/* ============ CH9 — REFERENCES ============ */
var REFERENCES = [
  {title:'P. M. Muller, W. L. Sjogren (1968), “Mascons: Lunar Mass Concentrations”, Science 161, 680–684', url:'https://doi.org/10.1126/science.161.3842.680', note:{en:'The discovery paper (JPL): Lunar Orbiter tracking data processed into a gravimetric map of the near side show large mass concentrations under the ringed maria.', ru:'Статья об открытии (JPL): траекторные данные Lunar Orbiter, обработанные в гравиметрическую карту видимой стороны, показывают крупные концентрации массы под кольцевыми морями.'}},
  {title:'P. M. Muller, W. L. Sjogren (1969), “Information from deep-space tracking”, Physics Today 22 (7), 46', url:'https://aip.brightspotcdn.com/PTO.v22.i7.46_1.online.pdf', note:{en:'Variations in spacecraft speed of about 50 mm/s separated from an orbital speed of 2 × 10⁶ mm/s; map from 74 consecutive orbits of Lunar Orbiter 5; positive anomalies under Imbrium, Serenitatis, Crisium, Nectaris, Humorum and Aestuum.', ru:'Вариации скорости аппарата около 50 мм/с, выделенные на фоне орбитальной скорости 2 × 10⁶ мм/с; карта по 74 последовательным виткам Lunar Orbiter 5; положительные аномалии под морями Дождей, Ясности, Кризисов, Нектара, Влажности и Заливом Зноя.'}},
  {title:'J. P. Murphy, J. W. Siry (1969), “Lunar Mascon Evidence from Apollo Orbits”, NASA GSFC X-550-69-312', url:'https://ntrs.nasa.gov/api/citations/19690027604/downloads/19690027604.pdf', note:{en:'Apollo 8 tracking interpreted as a mascon near Sinus Aestuum at a depth of about 100 km, mass of order 5 × 10⁻⁶ lunar masses, roughly 250 mGal at the surface; Muller and Sjogren had identified six mascons under major ringed maria.', ru:'Данные сопровождения «Аполлона-8» объяснены масконом у Залива Зноя на глубине около 100 км с массой порядка 5 × 10⁻⁶ лунной и аномалией около 250 мГал на поверхности; Мюллер и Сьогрен выделили шесть масконов под крупными кольцевыми морями.'}},
  {title:'NASA NSSDCA, “Apollo 15 Subsatellite” (1971-063D)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063D', note:{en:'Deployed 4 August 1971; first orbit 102 × 139 km, inclination 28.5°, period about 120 min; 36.3 kg; data until January 1973; impact site unknown.', ru:'Отделён 4 августа 1971 года; первый виток 102 × 139 км, наклонение 28,5°, период около 120 мин; 36,3 кг; данные до января 1973 года; место падения неизвестно.'}},
  {title:'NASA NSSDCA, “Apollo 16 Subsatellite” (1972-031D)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-031D', note:{en:'Deployed 24 April 1972; initial 90 × 130 km, inclination 10°, about 120 min, clockwise as seen from the north; impacted on 29 May 1972 after 34 days (425 revolutions).', ru:'Отделён 24 апреля 1972 года; начальная орбита 90 × 130 км, наклонение 10°, около 120 мин, по часовой стрелке при взгляде с севера; упал 29 мая 1972 года через 34 дня (425 витков).'}},
  {title:'T. Bell (2006), “Bizarre Lunar Orbits”, Science@NASA, 6 November 2006 (archived copy)', url:'https://webarchive.library.unt.edu/eot2008/20090512014231/http:/science.nasa.gov/headlines/y2006/06nov_loworbit.htm', note:{en:'A. Konopliv (JPL): PFS-2 crashed 35 days and 425 orbits after release, orbit 97–120 km at 11°; “Lunar mascons make most low lunar orbits unstable”; frozen orbits at 27°, 50°, 76° and 86°; PFS-1 at 28°; Lunar Prospector manoeuvred every two months at 100 km. (Text also mirrored at moon-daily/energy-daily, 7 Nov 2006.)', ru:'А. Коноплив (JPL): PFS-2 упал через 35 суток и 425 витков, орбита 97–120 км при 11°; «масконы делают большинство низких лунных орбит неустойчивыми»; «замороженные» орбиты при 27°, 50°, 76° и 86°; PFS-1 — при 28°; Lunar Prospector на 100 км корректировал орбиту раз в два месяца.'}},
  {title:'A. S. Konopliv et al. (2001), “Recent gravity models as a result of the Lunar Prospector mission”, Icarus 150, 1–18', url:'https://doi.org/10.1006/icar.2000.6573', note:{en:'The LP150Q lunar gravity field, to degree and order 150.', ru:'Модель гравитационного поля Луны LP150Q до степени и порядка 150.'}},
  {title:'JAXA press release (13 February 2009), “KAGUYA (SELENE) special edition research reports published in Science Magazine”', url:'https://global.jaxa.jp/press/2009/02/20090213_kaguya_e.html', note:{en:'Includes “Farside Gravity Field of the Moon from the Four-way Doppler Measurements of the SELENE (Kaguya)” (Namiki et al.); the relay satellite Okina (Rstar) completed the four-way Doppler mission and hit the Moon on 12 February 2009 (JST).', ru:'Среди статей — «Гравитационное поле обратной стороны Луны по четырёхпутевым доплеровским измерениям SELENE (Kaguya)» (Намики и др.); спутник-ретранслятор «Окина» (Rstar) завершил четырёхпутевые доплеровские измерения и упал на Луну 12 февраля 2009 года (по японскому времени).'}},
  {title:'NASA Science, “GRAIL” mission page', url:'https://science.nasa.gov/mission/grail/', note:{en:'Launch 10 September 2011 on a Delta II; 202.4 kg each; names Ebb and Flow from fourth-graders at Emily Dickinson Elementary School in Bozeman, Montana; MoonKAM run with Sally Ride Science; impact 17 December 2012 at 75.62° N, 26.63° W; mascons discovered at JPL in 1968; GRACE heritage.', ru:'Запуск 10 сентября 2011 года на Delta II; масса каждого аппарата 202,4 кг; имена Ebb и Flow придумали четвероклассники школы Эмили Дикинсон в Бозмене (Монтана); MoonKAM вместе с Sally Ride Science; падение 17 декабря 2012 года в точке 75,62° с. ш., 26,63° з. д.; масконы открыты в JPL в 1968 году; наследие GRACE.'}},
  {title:'NASA NSSDCA, “GRAIL-A (Ebb)” (2011-046A)', url:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2011-046A', note:{en:'Near-circular polar orbits of about 50 km and 113 minutes, separated by 175–225 km; Ka-band Lunar Gravity Ranging System derived from GRACE; impacts at 75.6088° N 26.5940° W and 75.6508° N 26.8341° W.', ru:'Почти круговые полярные орбиты около 50 км и 113 минут на расстоянии 175–225 км друг от друга; Ka-диапазонная система LGRS на основе GRACE; места падения 75,6088° с. ш. 26,5940° з. д. и 75,6508° с. ш. 26,8341° з. д.'}},
  {title:'M. T. Zuber et al. (2013), “Gravity Field of the Moon from the Gravity Recovery and Interior Laboratory (GRAIL) Mission”, Science 339, 668–671', url:'https://doi.org/10.1126/science.1231507', note:{en:'Low-energy trajectories via Earth–Moon L1; ~55 km mean altitude; primary mission 1 March – 30 May 2012; separation 82–218 km; RMS Ka-band (32 GHz) range-rate residuals 0.02–0.05 µm/s; field GL0420A, degree 420 = 13 km block size; earlier models degree 100–150 (54–36 km); 98.5 % of the signal between degrees 80 and 320 comes from topography; power law 2.5 × 10⁻⁴ l⁻².', ru:'Низкоэнергетические траектории через точку L1 системы Земля — Луна; средняя высота ~55 км; основная миссия 1 марта – 30 мая 2012 года; расстояние между аппаратами 82–218 км; СКО невязок скорости сближения в Ka-диапазоне (32 ГГц) 0,02–0,05 мкм/с; поле GL0420A, степень 420 = блок 13 км; прежние модели — степень 100–150 (54–36 км); 98,5 % сигнала на степенях 80–320 дают рельефы; степенной закон 2,5 × 10⁻⁴ l⁻².'}},
  {title:'M. T. Zuber et al. (2013), “GRAIL: Extended Mission and Endgame Status”, 44th Lunar and Planetary Science Conference, NASA NTRS 20130013623', url:'https://ntrs.nasa.gov/api/citations/20130013623/downloads/20130013623.pdf', note:{en:'Primary mission 1 March – 29 May 2012 (55 km); extended mission 30 August – 14 December 2012 at 23 km average, three manoeuvres a week; lowered to 11 km on 6 December for Orientale; controlled deorbit 17 December; a 660 × 660 field.', ru:'Основная миссия 1 марта – 29 мая 2012 года (55 км); расширенная 30 августа – 14 декабря 2012 года на средней высоте 23 км, три манёвра в неделю; 6 декабря снижение до 11 км над Восточным морем; управляемый сход с орбиты 17 декабря; поле 660 × 660.'}},
  {title:'M. A. Wieczorek et al. (2013), “The Crust of the Moon as Seen by GRAIL”, Science 339, 671–675 (summary: NASA NTRS 20130013613)', url:'https://doi.org/10.1126/science.1231530', note:{en:'Bulk density of the highlands crust 2,550 kg/m³; mean porosity about 12 % to depths of at least a few kilometres; average crustal thickness 34–43 km, 10–20 km less than several previous estimates.', ru:'Объёмная плотность коры материков 2550 кг/м³; средняя пористость около 12 % до глубины по крайней мере нескольких километров; средняя толщина коры 34–43 км — на 10–20 км меньше ряда прежних оценок.'}},
  {title:'H. J. Melosh et al. (2013), “The Origin of Lunar Mascon Basins”, Science 340, 1552–1555; Purdue University release, 30 May 2013', url:'https://www.purdue.edu/newsroom/archive/releases/2013/Q2/purdue-led-team-solves-one-of-the-moons-mysteries.html', note:{en:'GRAIL shows bull\'s-eye anomalies: a central positive, a negative collar, a positive outer ring; modelled from the impact through cooling, flexure and isostatic adjustment of the melt pool (Freundlich-Sharonov and Humorum basins).', ru:'GRAIL показывает аномалии «мишень»: положительный центр, отрицательное кольцо, положительное внешнее кольцо; смоделировано от удара до остывания, изгиба и изостатического выравнивания расплава (бассейны Фрейндлиха — Шаронова и Влажности).'}},
  {title:'NASA JPL news (17 December 2012), “NASA\'s GRAIL Lunar Impact Site Named for Astronaut Sally Ride”', url:'https://www.jpl.nasa.gov/news/nasas-grail-lunar-impact-site-named-for-astronaut-sally-ride/', note:{en:'Impacts at 2:28:51 and 2:29:21 p.m. PST on the southern face of a mountain about 2.5 km tall near Goldschmidt crater, at 1.7 km/s; engines fired to depletion beforehand; MoonKAM returned more than 115,000 images; Ride led MoonKAM.', ru:'Падения в 14:28:51 и 14:29:21 по тихоокеанскому времени на южный склон горы высотой около 2,5 км у кратера Гольдшмидт, со скоростью 1,7 км/с; перед этим топливо выработано до конца; MoonKAM передала более 115 000 снимков; руководила MoonKAM Салли Райд.'}},
  {title:'MIT News (September 2011), GRAIL launch announcement', url:'https://news.mit.edu/2011/grail-launch-0908', note:{en:'Maria Zuber, GRAIL principal investigator, becomes the first woman to lead a planetary spacecraft mission.', ru:'Мария Зубер, научный руководитель GRAIL, — первая женщина во главе планетной космической миссии.'}},
  {title:'PDS Geosciences Node, GRAIL LGRS derived gravity models (SHADR)', url:'https://pds-geosciences.wustl.edu/grail/grail-l-lgrs-5-rdr-v1/grail_1001/shadr/', note:{en:'Archived fields include GL0420A, GL0660B, GL0900D, GRGM900C, GRGM1200A/B, GL1500E and GL1800F (degree 1800, posted 2025). This guide\'s orbit model uses GRGM1200A (Lemoine et al. 2014; GM 4,902.80011526 km³/s², reference radius 1,738.0 km) truncated at degree 30.', ru:'В архиве — поля GL0420A, GL0660B, GL0900D, GRGM900C, GRGM1200A/B, GL1500E и GL1800F (степень 1800, выложено в 2025 году). Модель орбиты в этом справочнике использует GRGM1200A (Lemoine и др., 2014; GM 4902,80011526 км³/с², опорный радиус 1738,0 км), усечённую до степени 30.'}},
  {title:'A. S. Konopliv et al. (2014), “High-resolution lunar gravity fields from the GRAIL Primary and Extended Missions”, Geophysical Research Letters 41', url:'https://doi.org/10.1002/2013GL059066', note:{en:'Degree-900 fields GL0900C/D; surface resolution varies across the Moon because the lowest spacecraft altitude ranged from 3 to 23 km.', ru:'Поля степени 900 GL0900C/D; разрешение у поверхности разное в разных местах, потому что минимальная высота аппаратов составляла от 3 до 23 км.'}},
  {title:'R. S. Park et al. (2025), “Thermal asymmetry in the Moon\'s mantle inferred from monthly tidal response”, Nature 641, 1188–1192', url:'https://doi.org/10.1038/s41586-025-08949-5', note:{en:'GRAIL data give a degree-3 tidal Love number k₃ = 0.0163, about 72 % above that of a symmetric Moon; explained by a nearside mantle 100–200 K warmer; field GL1800F.', ru:'Данные GRAIL дают приливное число Лява третьей степени k₃ = 0,0163 — примерно на 72 % больше, чем у симметричной Луны; объясняется мантией видимой стороны, тёплой на 100–200 K; поле GL1800F.'}},
  {title:'NASA NSSDCA, “Moon Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html', note:{en:'Mass 0.07346 × 10²⁴ kg; mean radius 1,737.4 km; surface gravity 1.62 m/s²; J₂ = 202.7 × 10⁻⁶; semimajor axis 384,400 km; sidereal rotation 655.720 h; Earth GM 0.39860 × 10⁶ km³/s².', ru:'Масса 0,07346 × 10²⁴ кг; средний радиус 1737,4 км; ускорение свободного падения 1,62 м/с²; J₂ = 202,7 × 10⁻⁶; большая полуось 384 400 км; звёздный период вращения 655,720 ч; GM Земли 0,39860 × 10⁶ км³/с².'}},
  {title:'NIST, CODATA 2018 value: Newtonian constant of gravitation', url:'https://physics.nist.gov/cgi-bin/cuu/Value?bg', note:{en:'G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻².', ru:'G = 6,67430 × 10⁻¹¹ м³ кг⁻¹ с⁻².'}}
];

/* numbers printed inside translated paragraphs (re-filled after every language switch) */
function median(a){ var b = a.slice().sort(function(x, y){ return x - y; }), n = b.length; return n % 2 ? b[(n - 1)/2] : (b[n/2 - 1] + b[n/2])/2; }
function fillSpans(){
  function put(id, v){ var e = document.getElementById(id); if(e) e.textContent = v; }
  var P55 = 2*Math.PI*Math.sqrt(Math.pow(R_M + 55, 3)/GM_M)/60;
  put('eqP', fmt(P55, 1)); put('eqV', fmt(vCirc(55), 2));
  var sc = PFS2_SCAN.filter(function(x){ return x > 0; });
  if(sc.length){ put('pfsMin', days(Math.min.apply(null, sc))); put('pfsMax', days(Math.max.apply(null, sc))); put('pfsMed', days(median(sc))); }
  put('eqBg', fmt(bouguerPerKm(2550), 0)); put('eqGrain', num(Math.round(2550/(1 - 0.12)/10)*10));
}
/* ============ RENDER ALL ============ */
function renderAll(){
  fillSpans(); renderBM(); renderRR(); renderRS(); if(lfRun) drawLF();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
startLF();
window.__mascon = {GM_M:GM_M, R_M:R_M, R_REF:R_REF, M_MOON:M_MOON, G_N:G_N, G_SURF:G_SURF, gmKg:gmKg, vCirc:vCirc, dgPoint:dgPoint, halfWidth:halfWidth, AESTUUM:AESTUUM,
  CNM:CNM, makeField:makeField, orbitRun:orbitRun, lifetime:lifetime, STRIP:STRIP, PFS2_SCAN:PFS2_SCAN, FROZEN:FROZEN,
  rangeRate:rangeRate, rrPeak:rrPeak, rangeRateNumeric:rangeRateNumeric, KBR_NOISE:KBR_NOISE, LO_SIGNAL:LO_SIGNAL,
  blockKm:blockKm, atten:atten, eFoldKm:eFoldKm, kaula:kaula, MODELS:MODELS, bouguerPerKm:bouguerPerKm, porosity:porosity, median:median, isPFS1:isPFS1, LF_PIECE_DAYS:LF_PIECE_DAYS, LF_BUDGET_MS:LF_BUDGET_MS, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
