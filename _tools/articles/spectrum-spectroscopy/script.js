/* ============ CONSTANTS ============ */
var H_PL = 6.62607015e-34, K_B = 1.380649e-23, C_SI = 299792458, EV = 1.602176634e-19;   // exact SI values [15]
var M_E = 9.1093837139e-31;                                         // electron mass, CODATA 2022 [15]
var R_INF = 10973731.568157, MP_ME = 1836.152673426;                // m⁻¹; proton/electron mass ratio, CODATA 2022 [15]
var R_H = R_INF/(1 + 1/MP_ME);                                      // hydrogen's own Rydberg constant (reduced mass)
var CHI_H = 13.598434599702;                                        // eV, ionization energy of H I, NIST ASD [25]
var E2_CM = 82259.158;                                              // cm⁻¹, mean energy of the n = 2 level, NIST ASD [6]
var BALMER_H = 364.56;                                              // nm: Balmer's 1885 constant, 3645.6 × 10⁻⁸ cm [13]
var RYDBERG_1890 = 109721.6;                                        // cm⁻¹: Rydberg's N0 of 1890 [14]
/* scientific notation for readouts: 3.1 × 10¹⁶ */
function sci(v){ var e = Math.floor(Math.log10(v)), m = v/Math.pow(10, e); if(m >= 9.95){ m /= 10; e += 1; }
  var sup = String(e).replace(/-/g, '⁻').replace(/\d/g, function(c){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }); return fmt(m, 1) + ' × 10' + sup; }
function num(n){ var s = fmtInt(n); return (lang === 'ru' && Math.abs(n) < 10000) ? s.replace(/\s/g, '') : s; }

/* Refractive index of standard air (Peck & Reeder 1972, the formula NIST ASD uses) [7]; λ in vacuum, nm */
function nAir(lvacNm){ var s = 1000/lvacNm, s2 = s*s; return 1 + (8060.51 + 2480990/(132.274 - s2) + 17455.7/(39.32957 - s2))*1e-8; }
function vacToAir(lvacNm){ return lvacNm/nAir(lvacNm); }
/* NIST convention: air wavelengths between 200 and 2000 nm, vacuum outside [7] */
function shownWl(lvacNm){ return (lvacNm > 200 && lvacNm < 2000) ? vacToAir(lvacNm) : lvacNm; }

/* ============ DATA ============ */
/* 1966 solar atlas (Moore, Minnaert & Houtgast, NBS Monograph 61) [5]: [wavelength in air, Å; equivalent width, mÅ].
   Labelled lines checked by eye on the scanned pages; the rest are every line ≥ 100 mÅ whose row reads consistently in the scan. */
var ATLAS = [[3805.349,171],[3806.718,209],[3807.151,193],[3807.937,111],[3808.734,114],[3809.586,132],[3812.962,322],[3813.394,138],[3815.851,1272],[3820.436,1712],[3823.514,116],[3824.452,519],[3825.891,1519],[3827.832,897],[3832.31,1685],[3834.233,624],[3835.39,2362],[3838.302,1920],[3841.058,517],[3842.054,126],[3843.715,145],[3845.47,135],[3846.417,105],[3846.809,160],[3847.848,146],[3849.006,121],[3849.977,608],[3850.826,222],[3851.291,102],[3852.579,148],[3853.483,148],[3854.37,130],[3854.571,189],[3856.381,648],[3857.667,149],[3858.303,202],[3859.922,1554],[3871.392,764],[3871.758,132],[3872.51,612],[3873.767,105],[3876.051,141],[3878.58,724],[3881.875,117],[3882.996,118],[3886.294,920],[3889.05,2346],[3895.667,361],[3899.719,436],[3905.532,816],[3915.811,110],[3920.269,341],[3922.923,414],[3930.308,108],[3933.682,20253],[3955.343,107],[3956.339,110],[3956.686,133],[3968.492,15467],[3969.268,52],[3970.076,76],[3981.775,101],[3987.096,163],[4005.254,416],[4013.816,102],[4024.732,104],[4032.641,106],[4044.615,105],[4045.825,1174],[4055.551,114],[4057.515,197],[4058.221,101],[4063.605,787],[4066.984,130],[4067.988,133],[4071.749,723],[4074.794,110],[4076.637,127],[4084.501,156],[4085.013,107],[4086.316,104],[4092.396,108],[4092.669,115],[4101.748,3133],[4104.133,100],[4111.787,106],[4114.451,100],[4118.555,154],[4118.782,148],[4121.325,125],[4123.753,109],[4126.191,113],[4128.098,107],[4132.908,123],[4134.685,129],[4137.005,104],[4143.416,134],[4143.878,466],[4147.675,110],[4149.37,111],[4152.176,107],[4153.906,138],[4154.505,126],[4156.806,126],[4157.788,127],[4158.798,103],[4167.277,200],[4172.759,110],[4174.917,103],[4175.643,110],[4176.577,124],[4179.383,126],[4181.764,148],[4183.998,131],[4187.047,204],[4188.737,120],[4191.437,181],[4195.34,127],[4199.105,183],[4202.04,326],[4206.702,122],[4210.967,100],[4215.539,233],[4216.191,130],[4222.221,180],[4224.178,135],[4226.74,1476],[4229.774,115],[4235.949,385],[4238.029,111],[4240.38,101],[4243.365,151],[4245.264,118],[4247.432,162],[4254.346,393],[4254.979,108],[4260.486,595],[4271.774,756],[4274.806,196],[4275.386,104],[4283.014,133],[4285.45,120],[4286.015,119],[4286.477,114],[4289.372,131],[4289.729,230],[4290.226,117],[4290.956,137],[4291.121,110],[4294.142,217],[4295.226,107],[4296.584,105],[4298.994,112],[4299.249,212],[4300.053,166],[4300.573,126],[4301.103,179],[4301.927,128],[4302.297,135],[4302.539,165],[4302.754,101],[4303.177,103],[4303.937,119],[4304.571,108],[4305.456,124],[4305.918,156],[4306.855,120],[4307.912,723],[4309.04,131],[4309.383,126],[4310.106,108],[4310.467,126],[4310.984,104],[4311.509,171],[4312.875,153],[4315.098,153],[4323.512,105],[4324.998,117],[4325.775,793],[4337.055,120],[4340.475,2855],[4351.921,283],[4352.743,142],[4359.623,139],[4367.594,143],[4371.286,110],[4374.472,110],[4375.944,152],[4384.712,110],[4395.04,135],[4399.778,115],[4401.298,101],[4401.552,115],[4404.761,898],[4408.425,130],[4434.967,171],[4435.688,127],[4443.812,124],[4454.793,176],[4455.893,106],[4461.66,116],[4466.562,125],[4494.573,139],[4501.278,111],[4526.442,107],[4531.158,106],[4554.036,159],[4556.137,100],[4703.003,326],[4707.285,107],[4754.039,130],[4762.375,105],[4783.424,157],[4786.542,110],[4861.342,3680],[4871.325,228],[4872.144,195],[4890.763,220],[4891.502,312],[4918.998,278],[4924.777,101],[4938.82,119],[4946.395,113],[4966.095,114],[4982.507,138],[4983.859,123],[4985.259,101],[4985.554,103],[4991.072,102],[5006.12,190],[5018.45,210],[5022.241,114],[5027.13,105],[5035.37,109],[5040.89,116],[5041.076,112],[5049.827,135],[5068.771,129],[5098.707,102],[5123.73,101],[5125.128,100],[5139.473,152],[5142.53,117],[5151.917,100],[5166.284,115],[5167.327,935],[5168.908,114],[5169.05,154],[5171.61,160],[5172.698,1259],[5183.619,1584],[5192.353,176],[5194.949,126],[5195.48,114],[5208.432,247],[5208.601,117],[5216.283,108],[5217.396,102],[5226.87,160],[5227.192,277],[5229.86,124],[5263.314,121],[5265.56,112],[5269.55,478],[5273.17,103],[5298.283,110],[5328.051,375],[5328.542,210],[5339.937,161],[5367.476,157],[5369.974,182],[5371.501,294],[5393.176,153],[5404.145,239],[5405.785,266],[5410.918,169],[5455.624,219],[5463.289,118],[5465.465,112],[5476.576,104],[5506.791,120],[5528.418,293],[5569.631,162],[5572.851,205],[5576.099,113],[5594.471,117],[5682.647,104],[5688.217,121],[5709.386,103],[5711.095,107],[5763.002,101],[5857.459,132],[5889.973,752],[5895.94,564],[6005.719,136],[6400.009,181],[6439.083,156],[6462.57,216],[6493.788,133],[6494.994,165],[6546.252,103],[6562.808,4020],[6867.547,154],[6868.105,137],[6868.245,174],[6869.096,216],[6871.285,264],[6872.247,257],[6872.843,272],[6873.798,258],[6874.653,268],[6875.59,249],[6876.715,241],[6877.637,200],[6883.833,146],[6885.754,175],[6886.743,208],[6888.948,190],[6889.903,222],[6892.369,208],[6893.309,213],[6904.117,165],[6914.09,107]];
var LABELLED = [
  [3933.682, 'K', 'Ca⁺'], [3968.492, 'H', 'Ca⁺'], [4045.825, '', 'Fe'], [4101.748, '', 'Hδ'], [4226.740, '', 'Ca'], [4307.912, '', 'Fe'],
  [4340.475, '', 'Hγ'], [4861.342, 'F', 'Hβ'], [5172.698, '', 'Mg'], [5183.619, '', 'Mg'], [5269.550, '', 'Fe'],
  [5889.973, 'D', 'Na'], [5895.940, '', 'Na'], [6562.808, 'C', 'Hα']
];
/* Laboratory lines, NIST Atomic Spectra Database, observed wavelengths in standard air, nm [6] */
var LAB = {
  H:  [656.279, 486.135, 434.0472, 410.1734, 397.0075, 388.9064, 383.5397],
  Na: [588.995095, 589.592424, 568.82046],
  Mg: [383.23037, 383.82918, 470.29909, 516.73216, 517.26843, 518.36042, 552.84047],
  Ca: [393.366, 396.847, 422.673, 445.478, 585.745, 643.907, 646.257, 649.378],
  Fe: [381.29643, 381.584, 382.44435, 382.58809, 382.78224, 383.42222, 384.10477, 385.63713, 387.8573, 388.6282, 389.56562, 389.97071,
       392.02578, 392.29115, 393.02964, 396.9257, 404.58122, 406.35939, 407.17377, 427.17602, 430.7902, 432.57616, 440.47501, 516.74881,
       522.71891, 526.9537, 532.80383, 537.14893, 640.00008, 649.498],
  He: [388.8648, 402.61914, 447.14802, 471.31457, 492.19313, 501.56783, 587.5621, 667.8151]
};
var MATCH_TOL = 0.03;                                               // nm
/* each lab line → the nearest atlas line within MATCH_TOL, or null */
function matchLines(el){
  return LAB[el].map(function(w){
    var best = null, bd = 1e9;
    ATLAS.forEach(function(a){ var d = Math.abs(a[0]/10 - w); if(d < bd){ bd = d; best = a; } });
    return {lab:w, sun:bd <= MATCH_TOL ? best : null, d:bd};
  });
}

/* Hydrogen ladder */
function rydbergVac(lo, hi){ return 1e9/(R_H*(1/(lo*lo) - 1/(hi*hi))); }   // nm, vacuum
function levelEv(n){ return -CHI_H/(n*n); }
function balmer1885(m){ return BALMER_H*m*m/(m*m - 4); }
/* NIST ASD H I wavelengths [6], Ritz values (from the measured energy levels, the database's most accurate):
   Lyman in vacuum, Balmer and Paschen in standard air */
var NIST_H = {
  1: {2:121.56701, 3:102.57220, 4:97.253650, 5:94.974287, 6:93.780331, 7:93.0748142, 8:92.6225605, 9:92.3150275, 10:92.0963006, 11:91.9351334, 12:91.8129300},
  2: {3:656.2819, 4:486.1333, 5:434.0471, 6:410.17415, 7:397.00788, 8:388.90557, 9:383.53909, 10:379.79044, 11:377.06368, 12:375.01584},
  3: {4:1875.0976, 5:1281.8070, 6:1093.8086, 7:1004.9369, 8:954.5969, 9:922.9014, 10:901.4910, 11:886.2783, 12:875.0472}
};

/* Stellar thermometer: Saha + Boltzmann for hydrogen (Z_I = 2, Z_II = 1, local thermodynamic equilibrium) */
function sahaRatio(T, Pe){                                          // N(H⁺)/N(H), Pe in Pa
  return 2*(1/2)*Math.pow(2*Math.PI*M_E*K_B*T/(H_PL*H_PL), 1.5)*K_B*T/Pe*Math.exp(-CHI_H*EV/(K_B*T));
}
function n2Fraction(T, Pe){                                          // share of all hydrogen sitting in level n = 2
  var b = 8/2*Math.exp(-E2_CM*100*H_PL*C_SI/(K_B*T));
  return b/(1 + b)/(1 + sahaRatio(T, Pe));
}
function peakT(Pe){                                                 // golden-section search on log T
  var a = Math.log(3000), c = Math.log(40000), g = (Math.sqrt(5) - 1)/2;
  for(var i = 0; i < 80; i++){ var x1 = c - g*(c - a), x2 = a + g*(c - a); if(n2Fraction(Math.exp(x1), Pe) > n2Fraction(Math.exp(x2), Pe)) c = x2; else a = x1; }
  return Math.exp((a + c)/2);
}
function planckLam(lamNm, T){ var l = lamNm*1e-9; return 2*H_PL*C_SI*C_SI/Math.pow(l, 5)/(Math.exp(H_PL*C_SI/(l*K_B*T)) - 1); }
var WIEN_B = 2.897771955e-3;                                        // m·K [15]
function wienNm(T){ return WIEN_B/T*1e9; }
/* Mean dwarf (main-sequence) effective temperatures, Pecaut & Mamajek table v2022.04.16 [20] */
var SPT = [['O5V',41400],['B0V',31400],['B5V',15700],['A0V',9700],['A5V',8100],['F0V',7220],['F5V',6550],['G0V',5930],['G2V',5770],['G5V',5660],['K0V',5270],['K5V',4440],['M0V',3850],['M5V',3060]];
function nearestType(T){ var best = SPT[0]; SPT.forEach(function(s){ if(Math.abs(Math.log(s[1]/T)) < Math.abs(Math.log(best[1]/T))) best = s; }); return best; }
var T_SUN = 5772;                                                    // K, NASA Sun fact sheet [30]

/* Henry Draper Catalogue, HD 1–225300: first letter of the spectral type, counted from the VizieR file [19] */
var HD_COUNTS = [['O',169],['B',16789],['A',57852],['F',42988],['G',41994],['K',60615],['M',4396],['other',497]];
/* Abundances on a log scale: Payne 1925, Table XXVIII (log a_r) [21]; Asplund, Amarsi & Grevesse 2021, Table 2 (log ε, H = 12) [24] */
var PAYNE = {H:11, He:8.3, Na:5.2, Mg:5.6, Si:4.8, Ca:4.8, Fe:4.8};
var ASPLUND = {H:12.00, He:10.914, Na:6.22, Mg:7.55, Si:7.51, Ca:6.30, Fe:7.46};
function perSilicon(tab, el){ return Math.pow(10, tab[el] - tab.Si); }

/* Doppler wobble */
var GM_SUN = 1.32712e20, GM_JUP = 1.26687e17, GM_EARTH = 3.9860e14; // m³/s², NASA fact sheets [29][30]
var AU = 1.495978707e11;
function kAmp(mpMJ, Pdays, MsMsun){                                 // m/s, circular orbit seen edge-on
  var P = Pdays*86400, gp = mpMJ*GM_JUP, gs = MsMsun*GM_SUN;
  return Math.pow(2*Math.PI/P, 1/3)*gp/Math.pow(gs + gp, 2/3);
}
function orbitAU(Pdays, MsMsun, mpMJ){ var P = Pdays*86400; return Math.pow((MsMsun*GM_SUN + mpMJ*GM_JUP)*P*P/(4*Math.PI*Math.PI), 1/3)/AU; }
function minMassMJ(K, Pdays, MsMsun){                                // invert kAmp by bisection
  var lo = 0, hi = 100; for(var i = 0; i < 200; i++){ var m = (lo + hi)/2; if(kAmp(m, Pdays, MsMsun) > K) hi = m; else lo = m; } return (lo + hi)/2;
}
function shiftNm(vMs, lamNm){ return lamNm*vMs/C_SI; }
var ELODIE_R = 42000, ELODIE_MS = 13;                                // resolving power and velocity accuracy [27]
var PEG = {K:59, P:4.2293, M:1.0};                                   // IAUC 6251 [26]; star mass assumed 1 M☉

/* ============ colour of a wavelength (display only) ============ */
function wlRGB(nm){
  var r = 0, g = 0, b = 0;
  if(nm < 440){ r = -(nm - 440)/60; b = 1; } else if(nm < 490){ g = (nm - 440)/50; b = 1; } else if(nm < 510){ g = 1; b = -(nm - 510)/20; }
  else if(nm < 580){ r = (nm - 510)/70; g = 1; } else if(nm < 645){ r = 1; g = -(nm - 645)/65; } else { r = 1; }
  var f = nm < 420 ? 0.35 + 0.65*(nm - 380)/40 : nm > 680 ? 0.35 + 0.65*(750 - nm)/70 : 1;
  f = Math.max(0.25, Math.min(1, f));
  function c(v){ return Math.round(255*Math.pow(v*f, 0.8)); }
  return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
}
function gradientStops(defs, id, a, b){
  var grad = ns('linearGradient', {id:id, x1:'0', x2:'1', y1:'0', y2:'0'}, defs);
  for(var i = 0; i <= 16; i++){ var nm = a + (b - a)*i/16; ns('stop', {offset:(i/16*100) + '%', 'stop-color':wlRGB(nm)}, grad); }
}

/* ============ CH3 — LINE MATCHER ============ */
var EL_NAMES = {H:['HYDROGEN','ВОДОРОД'], Na:['SODIUM','НАТРИЙ'], Mg:['MAGNESIUM','МАГНИЙ'], Ca:['CALCIUM','КАЛЬЦИЙ'], Fe:['IRON','ЖЕЛЕЗО'], He:['HELIUM','ГЕЛИЙ']};
var mtEl = 'Na';
function renderMT(){
  var svg = document.getElementById('mtSvg'); svg.innerHTML = '';
  var L = 20, R = 455, a = 380, b = 700;
  function X(nm){ return L + (nm - a)/(b - a)*(R - L); }
  var defs = ns('defs', {}, svg); gradientStops(defs, 'mtGrad', a, b);
  var y1 = 34, h1 = 70, y2 = 150, h2 = 40;
  txt(svg, L, 18, T('SUNLIGHT — 1966 solar atlas [5]','СОЛНЕЧНЫЙ СВЕТ — атлас 1966 года [5]'), 'svg-small');
  ns('rect', {x:L, y:y1, width:R - L, height:h1, fill:'url(#mtGrad)'}, svg);
  ATLAS.forEach(function(p){
    var nm = p[0]/10; if(nm < a || nm > b) return;
    var w = Math.min(3.2, 0.5 + Math.sqrt(p[1])/45), op = Math.min(0.95, 0.25 + Math.log10(p[1])/5);
    ns('rect', {x:(X(nm) - w/2).toFixed(2), y:y1, width:w.toFixed(2), height:h1, fill:'#0b0b0c', 'fill-opacity':op.toFixed(2)}, svg);
  });
  LABELLED.forEach(function(p){
    var nm = p[0]/10; if(!p[1]) return;
    var dx = p[1] === 'K' ? -2 : p[1] === 'H' ? 2 : p[1] === 'D' ? 0.4 : 0;
    txt(svg, X(nm) + dx, y1 + h1 + 12, p[1], 'svg-small', p[1] === 'K' ? 'end' : p[1] === 'H' ? 'start' : 'middle');
  });
  txt(svg, L, y2 - 8, T('LAB LAMP — ','ЛАБОРАТОРНАЯ ЛАМПА — ') + T(EL_NAMES[mtEl][0], EL_NAMES[mtEl][1]) + T(', NIST [6]',', NIST [6]'), 'svg-small');
  ns('rect', {x:L, y:y2, width:R - L, height:h2, fill:'#111114'}, svg);
  var res = matchLines(mtEl);
  res.forEach(function(m){
    if(m.lab < a || m.lab > b) return;
    ns('rect', {x:(X(m.lab) - 1.1).toFixed(2), y:y2, width:2.2, height:h2, fill:wlRGB(m.lab)}, svg);
    if(m.sun) ns('line', {x1:X(m.lab), y1:y1 + h1 + 16, x2:X(m.lab), y2:y2 - 14, stroke:'#2f5aa1', 'stroke-width':1.2, 'stroke-dasharray':'3 2'}, svg);
  });
  [400, 450, 500, 550, 600, 650, 700].forEach(function(v){ ns('line', {x1:X(v), y1:y2 + h2, x2:X(v), y2:y2 + h2 + 4, stroke:'#0b0b0c'}, svg); txt(svg, X(v), y2 + h2 + 16, v + '', 'svg-small', 'middle'); });
  txt(svg, R, y2 + h2 + 32, T('wavelength in air, nm','длина волны в воздухе, нм'), 'svg-small', 'end');
  var shown = res.filter(function(m){ return m.lab >= a && m.lab <= b; }), hits = shown.filter(function(m){ return m.sun; });
  var strongest = hits.slice().sort(function(p, q){ return q.sun[1] - p.sun[1]; })[0];
  cells(document.getElementById('mtReadout'), [
    [T('LAB LINES SHOWN','ЛИНИЙ В ЛАМПЕ'), shown.length + ''],
    [T('FOUND IN SUNLIGHT','НАЙДЕНО В СОЛНЕЧНОМ СВЕТЕ'), hits.length + T(' of ',' из ') + shown.length],
    [T('STRONGEST MATCH','САМОЕ СИЛЬНОЕ СОВПАДЕНИЕ'), strongest ? fmt(strongest.sun[0]/10, 3) + T(' nm',' нм') : '—'],
    [T('ITS EQUIVALENT WIDTH','ЕЁ ЭКВИВАЛЕНТНАЯ ШИРИНА'), strongest ? fmt(strongest.sun[1]/10000, 4) + T(' nm',' нм') : '—']
  ]);
  var S = {
    H: T('Every Balmer line in this range sits on a solar dark line — the red one is Fraunhofer\'s C [8], and Hε at 397.0 nm is a weak line in the wing of calcium\'s broad H [5]. Hydrogen is the commonest element in the Sun — first glimpsed in 1925 and accepted only after 1929 (chapter 7).','Каждая линия серии Бальмера в этом диапазоне совпадает с тёмной линией Солнца: красная — это линия C Фраунгофера [8], а Hε на 397,0 нм — слабая линия в крыле широкой линии H кальция [5]. Водород — самый распространённый элемент Солнца: впервые это увидели в 1925 году, а признали лишь после 1929 года (глава 7).'),
    Na: T('The two yellow lines of a sodium flame land exactly on Fraunhofer\'s D lines — the coincidence Kirchhoff turned into proof that there is sodium in the Sun [4].','Две жёлтые линии натриевого пламени точно попадают на линии D Фраунгофера — именно это совпадение Кирхгоф превратил в доказательство того, что на Солнце есть натрий [4].'),
    Mg: T('Magnesium\'s green triplet near 517 nm is one of the strongest groups in the visible solar spectrum [5].','Зелёный триплет магния около 517 нм — одна из самых сильных групп в видимом спектре Солнца [5].'),
    Ca: T('Ionized calcium makes H and K, the two widest dark lines of all: K is 2.0 nm wide in equivalent width, about 27 times sodium\'s D₂ [5].','Ионизованный кальций даёт H и K — две самые широкие тёмные линии из всех: эквивалентная ширина K — 2,0 нм, примерно в 27 раз больше, чем у D₂ натрия [5].'),
    Fe: T('Iron fills the Sun\'s spectrum with lines — these are its 30 strongest in this range. Before 1925 that was taken as a sign of how much iron there is; chapter 7 shows why it was not [21][22].','Железо заполняет спектр Солнца линиями — здесь 30 самых сильных в этом диапазоне. До 1925 года это считали признаком обилия железа; почему это не так — в главе 7 [21][22].'),
    He: T('None of helium\'s lines appears in the Sun\'s dark-line spectrum, not even its bright yellow 587.6 nm line. Helium shows up in the chromosphere above it, as bright lines — which is how it was found there in 1868 (chapter 4) [5][8].','Ни одной линии гелия нет в спектре тёмных линий Солнца — даже яркой жёлтой линии 587,6 нм. Гелий виден выше, в хромосфере, в виде ярких линий — так его и нашли там в 1868 году (глава 4) [5][8].')
  };
  document.getElementById('mtStatus').innerHTML = S[mtEl];
}
Array.prototype.forEach.call(document.querySelectorAll('#mtPre .btn'), function(btn){ btn.addEventListener('click', function(){ mtEl = this.getAttribute('data-el'); pressGroup(this.parentNode, this); renderMT(); }); });

/* ============ CH5 — HYDROGEN LADDER ============ */
var ldLo = 2, ldN = document.getElementById('ldN');
function seriesName(lo){ return [[],['LYMAN','ЛАЙМАНА'],['BALMER','БАЛЬМЕРА'],['PASCHEN','ПАШЕНА']][lo]; }
function renderLD(){
  var n = +ldN.value;
  if(n <= ldLo){ n = ldLo + 1; ldN.value = n; }
  ldN.min = ldLo + 1;
  var lv = rydbergVac(ldLo, n), lw = shownWl(lv), obs = NIST_H[ldLo][n], air = lv > 200 && lv < 2000, ppm = Math.abs(lw - obs)/obs*1e6;
  document.getElementById('ldNVal').textContent = 'n = ' + n + ' → ' + ldLo;
  ldN.setAttribute('aria-valuetext', T('from level ','с уровня ') + n + T(' down to level ',' на уровень ') + ldLo + ', ' + fmt(lw, 2) + T(' nanometres',' нанометра'));
  var svg = document.getElementById('ldSvg'); svg.innerHTML = '';
  var L = 40, R = 190, Tp = 22, B = 262;
  function Y(e){ return Tp + (-e)/CHI_H*(B - Tp); }
  for(var k = 1; k <= 12; k++){
    var y = Y(levelEv(k)), on = (k === n || k === ldLo);
    ns('line', {x1:L, y1:y, x2:R, y2:y, stroke:on ? '#0b0b0c' : '#b9b9b2', 'stroke-width':on ? 1.6 : 1}, svg);
    if(k <= 3) txt(svg, L - 6, y + 4, 'n=' + k, 'svg-small', 'end');
  }
  ns('line', {x1:L, y1:Tp, x2:R, y2:Tp, stroke:'#0b0b0c', 'stroke-dasharray':'4 3'}, svg);
  txt(svg, L - 6, Tp + 4, 'n=∞', 'svg-small', 'end');
  [[0, '0'], [-13.6, '−13.6'], [-3.4, '−3.40'], [-1.51, '−1.51']].forEach(function(e){ txt(svg, R + 6, Y(e[0]) + 4, (lang === 'ru' ? e[1].replace('.', ',') : e[1]) + T(' eV',' эВ'), 'svg-small'); });
  var x = (L + R)/2, col = lw >= 380 && lw <= 700 ? wlRGB(lw) : '#5f5f59';
  ns('line', {x1:x, y1:Y(levelEv(n)), x2:x, y2:Y(levelEv(ldLo)) - 7, stroke:col, 'stroke-width':3}, svg);
  ns('path', {d:'M' + (x - 6) + ',' + (Y(levelEv(ldLo)) - 9) + 'L' + x + ',' + Y(levelEv(ldLo)) + 'L' + (x + 6) + ',' + (Y(levelEv(ldLo)) - 9) + 'Z', fill:col}, svg);
  if(n > 3) txt(svg, x + 8, Y(levelEv(n)) + 14, 'n=' + n, 'svg-small');
  /* series strip: where this line falls */
  var sx0 = 280, sx1 = 470, ranges = {1:[90, 125], 2:[360, 670], 3:[800, 1900]}, rg = ranges[ldLo];
  function SX(l){ return sx0 + (l - rg[0])/(rg[1] - rg[0])*(sx1 - sx0); }
  txt(svg, sx0, Tp + 4, T('SERIES OF ','СЕРИЯ ') + T(seriesName(ldLo)[0], seriesName(ldLo)[1]), 'svg-small');
  var defs = ns('defs', {}, svg); gradientStops(defs, 'ldGrad', 380, 700);
  ns('rect', {x:sx0, y:Tp + 14, width:sx1 - sx0, height:46, fill:ldLo === 2 ? '#111114' : '#26262b'}, svg);
  if(ldLo === 2) ns('rect', {x:SX(380), y:Tp + 62, width:SX(670) - SX(380), height:5, fill:'url(#ldGrad)'}, svg);
  for(var m = ldLo + 1; m <= 40; m++){
    var l = shownWl(rydbergVac(ldLo, m)); if(l < rg[0] || l > rg[1]) continue;
    ns('line', {x1:SX(l), y1:Tp + 14, x2:SX(l), y2:Tp + 60, stroke:m === n ? '#ffffff' : '#8d8d86', 'stroke-width':m === n ? 2.4 : 0.8}, svg);
  }
  var lim = shownWl(1e9/(R_H/(ldLo*ldLo)));
  txt(svg, sx0, Tp + 84, T('limit ','предел ') + fmt(lim, 1) + T(' nm',' нм'), 'svg-small');
  txt(svg, sx0, Tp + 102, fmt(rg[0], 0) + '–' + fmt(rg[1], 0) + T(' nm',' нм'), 'svg-small');
  var desc = ldLo === 1 ? [T('ultraviolet —','ультрафиолет —'), T('blocked by our air','поглощается воздухом')]
    : ldLo === 2 ? [T('visible and','видимый и ближний'), T('near-ultraviolet','ультрафиолет')] : [T('infrared','инфракрасный'), ''];
  txt(svg, sx0, Tp + 126, desc[0], 'svg-small'); if(desc[1]) txt(svg, sx0, Tp + 144, desc[1], 'svg-small');
  hud1.textContent = fmt(lw, 2) + T(' nm',' нм');
  var rows = [
    [T('RYDBERG FORMULA','ФОРМУЛА РИДБЕРГА') + (air ? T(' (AIR)',' (ВОЗДУХ)') : T(' (VACUUM)',' (ВАКУУМ)')), fmt(lw, 4) + T(' nm',' нм')],
    [T('NIST','NIST'), fmt(obs, 4) + T(' nm',' нм')],
    [T('DIFFERENCE','РАЗНИЦА'), fmt(lw - obs, 4) + T(' nm',' нм') + ' (' + fmt(ppm, 0) + T(' ppm',' ppm') + ')'],
    [T('PHOTON ENERGY','ЭНЕРГИЯ ФОТОНА'), fmt(levelEv(n) - levelEv(ldLo), 3) + T(' eV',' эВ')]
  ];
  if(ldLo === 2) rows.push([T('BALMER 1885 (h = 364.56 nm)','БАЛЬМЕР, 1885 (h = 364,56 нм)'), fmt(balmer1885(n), 2) + T(' nm',' нм') + ' (' + fmt((balmer1885(n) - obs)/obs*100, 3) + ' %)', true]);
  cells(document.getElementById('ldReadout'), rows);
  var st = ldLo === 2 && n >= 4 && n <= 6
    ? T('Hβ, Hγ and Hδ — one green-blue and two blue-violet lines, almost certainly the “three broad stripes, one in the green and two in the blue” that Fraunhofer saw in the light of Sirius in 1814–17 without knowing what they were [2].','Hβ, Hγ и Hδ — одна зелёно-голубая и две сине-фиолетовые линии; почти наверняка это те «три широкие полосы, одна в зелёной и две в синей части», которые Фраунгофер в 1814–1817 годах видел в свете Сириуса, не зная, что это такое [2].')
    : ldLo === 2 && n === 3 ? T('Hα, the red line: the level 3 → 2 jump. Two integers and one constant give its wavelength to about ' + fmt(ppm, 0) + ' parts per million.','Hα, красная линия: переход 3 → 2. Два целых числа и одна константа дают её длину волны с точностью около ' + fmt(ppm, 0) + ' миллионных.')
    : ldLo === 1 ? T('Lyman lines end on the ground state. They are ultraviolet, so the hydrogen of the Sun absorbs them where no ground telescope can look.','Линии Лаймана заканчиваются на основном уровне. Это ультрафиолет, и водород Солнца поглощает их там, куда не заглянуть наземному телескопу.')
    : ldLo === 3 ? T('Paschen lines end on level 3, deep in the infrared — the series Balmer guessed would exist when the lower number is not 2 [13].','Линии Пашена заканчиваются на уровне 3, глубоко в инфракрасной области, — существование таких серий Бальмер предполагал, когда нижнее число не равно 2 [13].')
    : T('Higher up the ladder the rungs crowd together and the lines pile up towards the series limit.','Чем выше по лестнице, тем теснее ступени, и линии сгущаются к пределу серии.');
  document.getElementById('ldStatus').innerHTML = st + T(' The model leaves out the fine structure of the levels, so it differs from NIST by about 10 parts per million throughout.',' Модель не учитывает тонкую структуру уровней, поэтому везде расходится с NIST примерно на 10 миллионных.');
}
ldN.addEventListener('input', renderLD);
Array.prototype.forEach.call(document.querySelectorAll('#ldPre .btn'), function(btn){ btn.addEventListener('click', function(){ ldLo = +this.getAttribute('data-lo'); ldN.value = ldLo + 1; pressGroup(this.parentNode, this); renderLD(); }); });

/* ============ CH6 — HARVARD COUNTS ============ */
function renderHD(){
  var svg = document.getElementById('hdSvg'); svg.innerHTML = '';
  var L = 70, R = 440, Tp = 18, rowH = 26, max = 60615;
  var temps = {O:'O5V', B:'B0V', A:'A0V', F:'F0V', G:'G0V', K:'K0V', M:'M0V'}, teff = {}; SPT.forEach(function(s){ teff[s[0]] = s[1]; });
  HD_COUNTS.forEach(function(c, i){
    var y = Tp + i*rowH, w = c[1]/max*(R - L);
    txt(svg, L - 10, y + 15, c[0] === 'other' ? T('other','прочие') : c[0], 'svg-small', 'end');
    ns('rect', {x:L, y:y + 3, width:Math.max(1, w), height:16, fill:c[0] === 'other' ? '#b9b9b2' : '#2f5aa1'}, svg);
    var lab = num(c[1]) + (temps[c[0]] ? '  · ' + temps[c[0]] + ' ≈ ' + num(teff[temps[c[0]]]) + T(' K',' К') : ''), inside = w > R - L - 170;
    var t = txt(svg, inside ? L + w - 6 : L + w + 6, y + 15, lab, 'svg-small', inside ? 'end' : 'start'); if(inside) t.setAttribute('style', 'fill:#ffffff');
  });
  txt(svg, L, Tp + 8*rowH + 16, T('stars per class, HD 1–225,300 [19]','звёзд в классе, HD 1–225 300 [19]'), 'svg-small');
  txt(svg, L, Tp + 8*rowH + 34, T('hottest at top; dwarf temperatures [20]','горячие сверху; температуры карликов [20]'), 'svg-small');
}

/* ============ CH7 — STELLAR THERMOMETER ============ */
var thT = document.getElementById('thT'), thP = document.getElementById('thP');
function renderTH(){
  var Tk = Math.pow(10, +thT.value), Pe = Math.pow(10, +thP.value);
  document.getElementById('thTVal').textContent = num(Math.round(Tk)) + T(' K',' К');
  document.getElementById('thPVal').textContent = (Pe < 10 ? fmt(Pe, 1) : num(Math.round(Pe))) + T(' Pa',' Па');
  thT.setAttribute('aria-valuetext', document.getElementById('thTVal').textContent);
  thP.setAttribute('aria-valuetext', T('electron pressure ','электронное давление ') + document.getElementById('thPVal').textContent);
  var svg = document.getElementById('thSvg'); svg.innerHTML = '';
  /* top: blackbody shape 100–2000 nm, normalized to its peak */
  var L = 46, R = 465, Tp = 22, B = 110;
  function X(nm){ return L + (nm - 100)/(1900)*(R - L); }
  var pk = Math.min(Math.max(wienNm(Tk), 100), 2000), peakVal = planckLam(wienNm(Tk), Tk);
  ns('rect', {x:X(380), y:Tp, width:X(700) - X(380), height:B - Tp, fill:'#f1efe6'}, svg);
  txt(svg, (X(380) + X(700))/2, Tp + 10, T('visible','видимый'), 'svg-small', 'middle');
  var d = '';
  for(var i = 0; i <= 200; i++){ var nm = 100 + 1900*i/200; d += (i ? 'L' : 'M') + X(nm).toFixed(1) + ',' + (B - planckLam(nm, Tk)/peakVal*(B - Tp - 14)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#b5452a', 'stroke-width':2}, svg);
  ns('line', {x1:X(pk), y1:Tp + 12, x2:X(pk), y2:B, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  [100, 500, 1000, 1500, 2000].forEach(function(v){ txt(svg, X(v), B + 14, num(v), 'svg-small', v === 100 ? 'start' : v === 2000 ? 'end' : 'middle'); });
  txt(svg, R, B + 31, T('wavelength, nm (glow shape)','длина волны, нм (форма свечения)'), 'svg-small', 'end');
  /* bottom: share of hydrogen in level 2 against temperature */
  var Tp2 = 190, B2 = 282, xa = Math.log10(3000), xb = Math.log10(40000);
  function X2(t){ return L + (Math.log10(t) - xa)/(xb - xa)*(R - L); }
  var fmax = n2Fraction(peakT(Pe), Pe);
  function Y2(f){ return B2 - f/fmax*(B2 - Tp2 - 10); }
  var d2 = '';
  for(var j = 0; j <= 200; j++){ var t = Math.pow(10, xa + (xb - xa)*j/200); d2 += (j ? 'L' : 'M') + X2(t).toFixed(1) + ',' + Y2(n2Fraction(t, Pe)).toFixed(1); }
  ns('path', {d:d2, fill:'none', stroke:'#2f5aa1', 'stroke-width':2}, svg);
  ns('line', {x1:L, y1:B2, x2:R, y2:B2, stroke:'#0b0b0c'}, svg);
  SPT.forEach(function(s){ if(!/^(B0|A0|F0|G2|M0)V$/.test(s[0])) return; ns('line', {x1:X2(s[1]), y1:B2, x2:X2(s[1]), y2:B2 + 4, stroke:'#0b0b0c'}, svg); txt(svg, X2(s[1]), B2 + 15, s[0], 'svg-small', 'middle'); });
  txt(svg, L, Tp2 - 24, T('H atoms in level 2 (peak = 1): the main','атомы H на уровне 2 (максимум = 1) —'), 'svg-small');
  txt(svg, L, Tp2 - 8, T('driver of Balmer-line strength','главный фактор силы линий Бальмера'), 'svg-small');
  ns('circle', {cx:X2(Tk), cy:Y2(n2Fraction(Tk, Pe)), r:5.5, fill:'#b5452a'}, svg);
  var tp = peakT(Pe); ns('line', {x1:X2(tp), y1:Tp2 + 4, x2:X2(tp), y2:B2, stroke:'#0b0b0c', 'stroke-dasharray':'2 3'}, svg);
  txt(svg, R, B2 + 32, T('temperature, K (log); dwarf types [20]','температура, К (лог.); типы карликов [20]'), 'svg-small', 'end');
  var f2 = n2Fraction(Tk, Pe), ion = sahaRatio(Tk, Pe), typ = nearestType(Tk);
  hud2.textContent = num(Math.round(Tk)) + T(' K',' К');
  cells(document.getElementById('thReadout'), [
    [T('GLOW PEAKS AT','МАКСИМУМ СВЕЧЕНИЯ'), (wienNm(Tk) < 1000 ? fmt(wienNm(Tk), 0) : num(Math.round(wienNm(Tk)))) + T(' nm',' нм')],
    [T('NEAREST DWARF TYPE','БЛИЖАЙШИЙ ТИП КАРЛИКА'), typ[0] + ' (' + num(typ[1]) + T(' K)',' К)')],
    [T('HYDROGEN IONIZED','ИОНИЗОВАНО ВОДОРОДА'), fmt(ion/(1 + ion)*100, ion/(1 + ion) < 0.001 ? 4 : 1) + ' %'],
    [T('ATOMS IN LEVEL 2','АТОМОВ НА УРОВНЕ 2'), T('1 in ','1 из ') + (1/f2 < 1e6 ? num(Math.round(1/f2)) : sci(1/f2))],
    [T('BALMER STRENGTHS PEAK AT','МАКСИМУМ ЛИНИЙ БАЛЬМЕРА'), num(Math.round(tp/10)*10) + T(' K',' К'), true]
  ]);
  document.getElementById('thStatus').innerHTML = Tk < tp*0.8
    ? T('Too cool for strong Balmer lines: almost every hydrogen atom sits in level 1, and a Balmer line needs an atom already in level 2.','Слишком холодно для сильных линий Бальмера: почти все атомы водорода на уровне 1, а для линии Бальмера атом должен уже находиться на уровне 2.')
      + (Tk >= 5000 && Tk <= 7000 ? T(' Only 1 hydrogen atom in ' + sci(1/f2) + ' is in level 2 — yet Hα is still a strong line in sunlight, because there is so much hydrogen. That is Payne\'s discovery in miniature.',' На уровне 2 лишь один атом водорода из ' + sci(1/f2) + ' — и всё же Hα в солнечном свете сильная линия, потому что водорода очень много. Это открытие Пейн в миниатюре.') : '')
    : Tk > tp*1.25
    ? T('Too hot: ' + fmt(ion/(1 + ion)*100, 1) + ' % of the hydrogen has lost its electron, so there are few atoms left to absorb. The lines fade even though the star is full of hydrogen.','Слишком горячо: ' + fmt(ion/(1 + ion)*100, 1) + ' % водорода потеряли электрон, и поглощать почти некому. Линии слабеют, хотя звезда полна водорода.')
    : T('Near the peak: enough atoms are lifted to level 2, but not yet ionized. Payne found the hydrogen lines strongest “in the neighborhood of Class A0” [21].','Около максимума: достаточно атомов поднято на уровень 2, но ещё не ионизовано. Пейн нашла, что линии водорода сильнее всего «в окрестности класса A0» [21].');
}
thT.addEventListener('input', function(){ pressGroup(document.getElementById('thPre'), null); renderTH(); });
thP.addEventListener('input', renderTH);
Array.prototype.forEach.call(document.querySelectorAll('#thPre .btn'), function(btn){ btn.addEventListener('click', function(){ thT.value = Math.log10(+this.getAttribute('data-t')); thP.value = Math.log10(20); pressGroup(this.parentNode, this); renderTH(); }); });

/* ============ CH7 — ABUNDANCES ============ */
function renderAB(){
  var svg = document.getElementById('abSvg'); svg.innerHTML = '';
  var L = 60, R = 465, Tp = 30, rowH = 30, els = ['H','He','Mg','Na','Ca','Fe'];
  function X(lg){ return L + (lg + 2)/9*(R - L); }
  txt(svg, L, 14, T('atoms per silicon atom (log scale)','атомов на один атом кремния (лог. шкала)'), 'svg-small');
  [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7].forEach(function(v){ ns('line', {x1:X(v), y1:Tp - 6, x2:X(v), y2:Tp + els.length*rowH, stroke:v === 0 ? '#0b0b0c' : '#e4e4de'}, svg); if(v % 2 === 0 || v === 7 || v === -1) txt(svg, X(v), Tp + els.length*rowH + 14, v === 0 ? '1' : v === 1 ? '10' : '10' + (v < 0 ? '⁻' : '') + '⁰¹²³⁴⁵⁶⁷'[Math.abs(v)], 'svg-small', 'middle'); });
  els.forEach(function(e, i){
    var y = Tp + i*rowH, p = Math.log10(perSilicon(PAYNE, e)), a = Math.log10(perSilicon(ASPLUND, e));
    txt(svg, L - 10, y + 15, e, 'svg-small', 'end');
    ns('rect', {x:X(Math.min(0, p)), y:y + 2, width:Math.max(1.5, Math.abs(X(p) - X(0))), height:10, fill:'#a8741a'}, svg);
    ns('rect', {x:X(Math.min(0, a)), y:y + 13, width:Math.max(1.5, Math.abs(X(a) - X(0))), height:10, fill:'#2f5aa1'}, svg);
  });
  var ly = Tp + els.length*rowH + 36;
  ns('rect', {x:L, y:ly - 9, width:12, height:10, fill:'#a8741a'}, svg); txt(svg, L + 18, ly, T('Payne 1925, stars [21]','Пейн, 1925, звёзды [21]'), 'svg-small');
  ns('rect', {x:L, y:ly + 9, width:12, height:10, fill:'#2f5aa1'}, svg); txt(svg, L + 18, ly + 18, T('Sun today, 2021 [24]','Солнце сегодня, 2021 [24]'), 'svg-small');
  txt(svg, L, ly + 40, T('left of 1 = rarer than silicon','левее 1 — реже кремния'), 'svg-small');
}

/* ============ CH8 — WOBBLE ============ */
var wbM = document.getElementById('wbM'), wbP = document.getElementById('wbP'), wbS = document.getElementById('wbS'), wbPhase = 0;
function renderWB(){
  var mp = Math.pow(10, +wbM.value), P = Math.pow(10, +wbP.value), Ms = +wbS.value;
  document.getElementById('wbMVal').textContent = (mp < 0.01 ? fmt(mp*317.83, 2) + T(' Earth masses',' массы Земли') : fmt(mp, mp < 1 ? 3 : 2) + T(' Jupiter masses',' массы Юпитера'));
  document.getElementById('wbPVal').textContent = (P < 1000 ? fmt(P, P < 10 ? 4 : 1) + T(' days',' сут') : num(Math.round(P)) + T(' days',' сут'));
  document.getElementById('wbSVal').textContent = fmt(Ms, 2) + T(' Sun masses',' массы Солнца');
  wbM.setAttribute('aria-valuetext', document.getElementById('wbMVal').textContent);
  wbP.setAttribute('aria-valuetext', document.getElementById('wbPVal').textContent);
  wbS.setAttribute('aria-valuetext', document.getElementById('wbSVal').textContent);
  var K = kAmp(mp, P, Ms), a = orbitAU(P, Ms, mp), dl = shiftNm(K, 589), res = 589/ELODIE_R;
  var svg = document.getElementById('wbSvg'); svg.innerHTML = '';
  var L = 60, R = 465, Tp = 24, B = 214, ymax = K > 80 ? Math.ceil(K*1.25/50)*50 : 80;
  function X(ph){ return L + ph/2*(R - L); } function Y(v){ return (Tp + B)/2 - v/ymax*(B - Tp)/2; }
  ns('rect', {x:L, y:Y(ELODIE_MS), width:R - L, height:Y(-ELODIE_MS) - Y(ELODIE_MS), fill:'#f3e3dd'}, svg);
  [-ymax, -ymax/2, 0, ymax/2, ymax].forEach(function(v){ ns('line', {x1:L, y1:Y(v), x2:R, y2:Y(v), stroke:'#e4e4de'}, svg); txt(svg, L - 6, Y(v) + 4, ymax >= 10000 ? fmt(v/1000, 0) : fmt(v, 0), 'svg-small', 'end'); });
  var d = ''; for(var i = 0; i <= 200; i++){ var ph = 2*i/200; d += (i ? 'L' : 'M') + X(ph).toFixed(1) + ',' + Y(K*Math.sin(2*Math.PI*ph)).toFixed(1); }
  ns('path', {d:d, fill:'none', stroke:'#0b0b0c', 'stroke-width':2}, svg);
  ns('line', {x1:L, y1:B, x2:R, y2:B, stroke:'#0b0b0c'}, svg);
  [0, 0.5, 1, 1.5, 2].forEach(function(v){ txt(svg, v === 0 ? X(0) + 2 : X(v), B + 14, v === 0 ? '0' : fmt(v, 1), 'svg-small', v === 0 ? 'start' : 'middle'); });
  txt(svg, L - 50, 14, T('star\'s speed away (+) / towards (−), ','скорость звезды от нас (+) / к нам (−), ') + (ymax >= 10000 ? T('km/s','км/с') : T('m/s','м/с')), 'svg-small');
  txt(svg, R, B + 30, T('time, in orbits of the planet','время, в оборотах планеты'), 'svg-small', 'end');
  ns('rect', {x:L - 50, y:B + 41, width:14, height:10, fill:'#f3e3dd', stroke:'#b5452a', 'stroke-width':0.6}, svg);
  txt(svg, L - 30, B + 50, T('± 13 m/s: ELODIE\'s accuracy [27]','± 13 м/с: точность ELODIE [27]'), 'svg-small');
  ns('circle', {cx:X(wbPhase % 2), cy:Y(K*Math.sin(2*Math.PI*wbPhase)), r:5, fill:'#b5452a', id:'wbDot'}, svg);
  hud2.textContent = fmt(K, K < 1 ? 3 : 1) + T(' m/s',' м/с');
  cells(document.getElementById('wbReadout'), [
    [T('STAR\'S WOBBLE K','КОЛЕБАНИЕ ЗВЕЗДЫ K'), (K < 1 ? fmt(K*100, 1) + T(' cm/s',' см/с') : K >= 1000 ? num(Math.round(K)) + T(' m/s',' м/с') : fmt(K, 1) + T(' m/s',' м/с'))],
    [T('ORBIT RADIUS','РАДИУС ОРБИТЫ'), fmt(a, a < 0.1 ? 4 : 2) + T(' AU',' а. е.')],
    [T('SHIFT OF THE 589 nm LINE','СДВИГ ЛИНИИ 589 нм'), (dl*1e3 >= 1000 ? fmt(dl*1e3, 0) + T(' pm',' пм') : dl*1e3 >= 0.1 ? fmt(dl*1e3, 3) + T(' pm',' пм') : dl*1e6 >= 0.1 ? fmt(dl*1e6, 2) + T(' fm',' фм') : sci(dl*1e6) + T(' fm',' фм'))],
    [T('SHARE OF ONE ELODIE RESOLUTION ELEMENT','ДОЛЯ ЭЛЕМЕНТА РАЗРЕШЕНИЯ ELODIE'), dl >= res ? '× ' + fmt(dl/res, 1) + T(' elements',' элемента') : '1/' + (res/dl < 1e6 ? num(Math.round(res/dl)) : sci(res/dl))]
  ]);
  document.getElementById('wbStatus').innerHTML = K > 3*ELODIE_MS
    ? T('A wobble of ' + num(Math.round(K)) + ' m/s is ' + (K/ELODIE_MS < 1000 ? fmt(K/ELODIE_MS, 1) : num(Math.round(K/ELODIE_MS))) + ' times ELODIE\'s 13 m/s accuracy: detectable in a few nights, the way 51 Pegasi b was.','Колебание ' + num(Math.round(K)) + ' м/с в ' + (K/ELODIE_MS < 1000 ? fmt(K/ELODIE_MS, 1) : num(Math.round(K/ELODIE_MS))) + ' раза больше точности ELODIE 13 м/с: его видно за несколько ночей, как это было с 51 Пегаса b.')
    : K > ELODIE_MS
    ? T('Just above ELODIE\'s 13 m/s: it needs many orbits to stand out.','Чуть выше 13 м/с ELODIE: чтобы сигнал выделился, нужно много оборотов.')
    : T('Below ELODIE\'s 13 m/s: lost in the measurement scatter. A Jupiter around the Sun would need ±13 m/s measured steadily for 12 years [27].','Меньше 13 м/с ELODIE: теряется в разбросе измерений. Юпитер у Солнца потребовал бы стабильно измерять ±13 м/с в течение 12 лет [27].');
}
[wbM, wbP, wbS].forEach(function(el){ el.addEventListener('input', function(){ pressGroup(document.getElementById('wbPre'), null); renderWB(); }); });
Array.prototype.forEach.call(document.querySelectorAll('#wbPre .btn'), function(btn){ btn.addEventListener('click', function(){
  var dm = this.getAttribute('data-m'); wbM.value = Math.log10(dm === 'peg' ? minMassMJ(PEG.K, PEG.P, PEG.M) : +dm); wbP.value = Math.log10(+this.getAttribute('data-p')); wbS.value = this.getAttribute('data-s');
  pressGroup(this.parentNode, this); renderWB(); }); });
visibleLoop(document.getElementById('wbSvg'), function(dt){
  if(reduced()) return;
  wbPhase = (wbPhase + dt*0.25) % 2;
  var dot = document.getElementById('wbDot'); if(!dot) return;
  var mp = Math.pow(10, +wbM.value), P = Math.pow(10, +wbP.value), K = kAmp(mp, P, +wbS.value);
  var ymax = K > 80 ? Math.ceil(K*1.25/50)*50 : 80, L = 60, R = 465, Tp = 24, B = 214;
  dot.setAttribute('cx', (L + wbPhase/2*(R - L)).toFixed(1)); dot.setAttribute('cy', ((Tp + B)/2 - K*Math.sin(2*Math.PI*wbPhase)/ymax*(B - Tp)/2).toFixed(1));
});

/* initial preset values (the pressed buttons) */
thT.value = Math.log10(T_SUN); thP.value = Math.log10(20);
wbM.value = Math.log10(minMassMJ(PEG.K, PEG.P, PEG.M)); wbP.value = Math.log10(PEG.P); wbS.value = PEG.M;

/* ============ TIMELINE / REFERENCES ============ */
var TIMELINE = [
  ['1666', 'Isaac Newton spreads sunlight with a prism into a band about five times longer than it is wide; his letter is published in February 1672 [1].', 'Исаак Ньютон раскладывает солнечный свет призмой в полосу примерно в пять раз длиннее её ширины; его письмо опубликовано в феврале 1672 года [1].'],
  ['1802', 'William Wollaston sees a few dark lines in a narrow beam of daylight and takes them for boundaries between colours [33].', 'Уильям Волластон видит в узком пучке дневного света несколько тёмных линий и принимает их за границы между цветами [33].'],
  ['1814–17', 'Joseph Fraunhofer counts about 574 dark lines in sunlight between B and H and letters the strongest; his paper is presented in Munich on 12 April 1817 [2].', 'Йозеф Фраунгофер насчитывает в солнечном свете около 574 тёмных линий между B и H и обозначает буквами самые сильные; его работа представлена в Мюнхене 12 апреля 1817 года [2].'],
  ['1859', '<b>Autumn:</b> Gustav Kirchhoff darkens the D lines of sunlight by passing it through a sodium flame — a gas absorbs the colours it emits [4].', '<b>Осень:</b> Густав Кирхгоф делает линии D солнечного света темнее, пропуская его через натриевое пламя: газ поглощает те цвета, которые сам излучает [4].'],
  ['1860', 'Kirchhoff and Robert Bunsen publish “Chemical analysis by spectral observations”; caesium (1860) and rubidium (1861) follow from the method [3][4][34].', 'Кирхгоф и Роберт Бунзен публикуют «Химический анализ посредством спектральных наблюдений»; метод приводит к открытию цезия (1860) и рубидия (1861) [3][4][34].'],
  ['1868', '<b>18 August:</b> Pierre Janssen sees bright lines in the prominences at the eclipse at Guntur, India; <b>20 October:</b> Norman Lockyer sees them from London without an eclipse. A yellow line, D₃, matches no known element [8].', '<b>18 августа:</b> Пьер Жансен видит яркие линии в протуберанцах во время затмения в Гунтуре (Индия); <b>20 октября:</b> Норман Локьер наблюдает их из Лондона без затмения. Жёлтая линия D₃ не совпадает ни с одним известным элементом [8].'],
  ['1885', 'Johann Balmer fits the four visible hydrogen lines with one formula and predicts the next [12][13].', 'Иоганн Бальмер описывает четыре видимые линии водорода одной формулой и предсказывает следующую [12][13].'],
  ['1890', 'Johannes Rydberg writes spectral series in wavenumbers with a constant common to all — the Rydberg constant [14]. Williamina Fleming\'s Draper Catalogue classifies 10,351 stars [17].', 'Иоганнес Ридберг записывает спектральные серии в волновых числах с общей для всех константой — постоянной Ридберга [14]. Каталог Дрейпера Вильямины Флеминг классифицирует 10 351 звезду [17].'],
  ['1895', 'William Ramsay finds the gas of the D₃ line in the uranium mineral cleveite; William Crookes confirms the spectrum. Per Teodor Cleve finds it independently. Helium is recognised on Earth 27 years after it was seen in the Sun [8][9].', 'Уильям Рамзай находит газ с линией D₃ в урановом минерале клевеите; Уильям Крукс подтверждает спектр. Пер Теодор Клеве находит его независимо. Гелий распознан на Земле через 27 лет после того, как его увидели на Солнце [8][9].'],
  ['1897', 'Antonia Maury publishes her finer classification of 681 bright stars, with a division c of sharp-lined spectra [31].', 'Антония Мори публикует свою более подробную классификацию 681 яркой звезды с подразделением c — спектрами с резкими линиями [31].'],
  ['1901', 'Annie Jump Cannon describes the spectra of 1,122 bright stars, ordering the classes into one continuous sequence [18].', 'Энни Джамп Кэннон описывает спектры 1122 ярких звёзд и выстраивает классы в одну непрерывную последовательность [18].'],
  ['1904', 'Ramsay receives the Nobel Prize in Chemistry for the discovery of the inert gases [11].', 'Рамзай получает Нобелевскую премию по химии за открытие инертных газов [11].'],
  ['1918–24', 'The Henry Draper Catalogue: 225,300 stars, classified by Cannon between 1911 and 1915 [18][19].', 'Каталог Генри Дрейпера: 225 300 звёзд, классифицированных Кэннон в 1911–1915 годах [18][19].'],
  ['1909', 'Ejnar Hertzsprung shows that Maury\'s c stars are exceptionally luminous [32].', 'Эйнар Герцшпрунг показывает, что c-звёзды Мори обладают исключительно высокой светимостью [32].'],
  ['1922', 'Niels Bohr receives the Nobel Prize in Physics for his work on the structure of atoms and the radiation they emit [16].', 'Нильс Бор получает Нобелевскую премию по физике за исследование строения атомов и их излучения [16].'],
  ['1925', 'Cecilia Payne\'s thesis <i>Stellar Atmospheres</i>: star spectra differ by temperature, not composition, and hydrogen and helium come out enormously abundant [21][22].', 'Диссертация Сесилии Пейн «Звёздные атмосферы»: спектры звёзд различаются температурой, а не составом, а водород и гелий оказываются чрезвычайно обильными [21][22].'],
  ['1929', 'Henry Norris Russell finds 60 parts of hydrogen by volume in the Sun\'s atmosphere to 1 of metals, in “very gratifying agreement” with Payne [23].', 'Генри Норрис Расселл находит в атмосфере Солнца 60 частей водорода по объёму на 1 часть металлов — в «весьма отрадном согласии» с Пейн [23].'],
  ['1966', 'Moore, Minnaert and Houtgast publish about 24,000 measured solar lines, 73 % of them identified, from 63 elements [5].', 'Мур, Миннарт и Хаутгаст публикуют около 24 000 измеренных линий Солнца, 73 % из них отождествлены, — от 63 элементов [5].'],
  ['1995', '<b>6 October:</b> Michel Mayor and Didier Queloz announce a planet around 51 Pegasi from a 59 m/s wobble; <i>Nature</i> publishes it on 23 November [26][27].', '<b>6 октября:</b> Мишель Майор и Дидье Кело объявляют о планете у звезды 51 Пегаса по колебанию 59 м/с; <i>Nature</i> публикует статью 23 ноября [26][27].'],
  ['2019', 'Mayor and Queloz share the Nobel Prize in Physics “for the discovery of an exoplanet orbiting a solar-type star” [28].', 'Майор и Кело разделяют Нобелевскую премию по физике «за открытие экзопланеты, обращающейся вокруг звезды солнечного типа» [28].'],
  ['2021', 'Asplund, Amarsi and Grevesse: the Sun\'s surface is 74.4 % hydrogen, 24.2 % helium and 1.4 % everything else, by mass [24].', 'Асплунд, Амарси и Гревесс: поверхность Солнца по массе — 74,4 % водорода, 24,2 % гелия и 1,4 % всего остального [24].']
];
var REFERENCES = [
  {title:'I. Newton (1672), “A Letter … containing his New Theory about Light and Colors”, Philosophical Transactions 6, 3075–3087 (The Newton Project transcription)', url:'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00006', note:{en:'Prism bought “in the beginning of the Year 1666”; the coloured image was “about five times” longer than wide, 2° 49′ long against the Sun\'s 31′; the experimentum crucis.', ru:'Призма приобретена «в начале 1666 года»; цветное изображение было «примерно в пять раз» длиннее ширины, 2° 49′ в длину против 31′ Солнца; experimentum crucis («решающий опыт»).'}},
  {title:'J. Fraunhofer (1817), “Bestimmung des Brechungs- und Farbenzerstreuungs-Vermögens verschiedener Glasarten …”, reprinted in Ostwalds Klassiker 150 (1905), ed. A. von Oettingen', url:'https://archive.org/details/bestimmungdesbr00oettgoog', note:{en:'About 574 lines between B and H (p. 14); a lamp shows a bright line exactly at D; Sirius shows three broad stripes, one in the green and two in the blue; presented to the Bavarian Academy on 12 April 1817.', ru:'Около 574 линий между B и H (с. 14); лампа даёт яркую линию точно на месте D; у Сириуса — три широкие полосы, одна в зелёной и две в синей части; представлено Баварской академии 12 апреля 1817 года.'}},
  {title:'G. Kirchhoff & R. Bunsen (1860), “Chemische Analyse durch Spectralbeobachtungen”, Annalen der Physik 186, 161–189', url:'https://doi.org/10.1002/andp.18601860602', note:{en:'The founding paper of spectral analysis (bibliographic data checked at Crossref).', ru:'Основополагающая статья спектрального анализа (библиографические данные проверены по Crossref).'}},
  {title:'Complete Dictionary of Scientific Biography, “Kirchhoff, Gustav Robert”', url:'https://mathshistory.st-andrews.ac.uk/DSB/kirchhoff.pdf', note:{en:'Autumn 1859: a sodium flame made the solar D lines darker; “a substance capable of emitting a certain spectral line has a strong absorptive power for the same line”; caesium and rubidium, which the DSB dates to 1860 (rubidium was described in the 1861 paper [34]).', ru:'Осень 1859 года: натриевое пламя сделало линии D Солнца темнее; «вещество, способное излучать некоторую спектральную линию, сильно поглощает ту же линию»; цезий и рубидий, которые словарь датирует 1860 годом (рубидий описан в статье 1861 года [34]).'}},
  {title:'C. E. Moore, M. G. J. Minnaert & J. Houtgast (1966), “The Solar Spectrum 2935 Å to 8770 Å”, NBS Monograph 61', url:'https://nvlpubs.nist.gov/nistpubs/Legacy/MONO/nbsmonograph61.pdf', note:{en:'About 24,000 lines with measured equivalent widths, wavelengths in air; 73 % identified; 63 elements. Read here: Ca II K 3933.682 Å, 20,253 mÅ; Na D₂ 5889.973 Å, 752 mÅ; Hα 6562.808 Å, 4,020 mÅ; no helium in the photospheric table — “Lines of He I and He II conspicuous in the spectrum of the chromosphere”.', ru:'Около 24 000 линий с измеренными эквивалентными ширинами, длины волн в воздухе; 73 % отождествлены; 63 элемента. Использовано: Ca II K 3933,682 Å, 20 253 мÅ; Na D₂ 5889,973 Å, 752 мÅ; Hα 6562,808 Å, 4020 мÅ; гелия в фотосферной таблице нет — линии He I и He II «заметны в спектре хромосферы».'}},
  {title:'A. Kramida, Yu. Ralchenko, J. Reader & NIST ASD Team, NIST Atomic Spectra Database (lines)', url:'https://physics.nist.gov/PhysRefData/ASD/lines_form.html', note:{en:'Observed wavelengths of H I, He I, Na I, Mg I, Ca I, Ca II and Fe I used for every laboratory line in the line matcher, and Ritz wavelengths for the hydrogen ladder (air between 200 and 2000 nm, vacuum outside); the H I n = 2 level at 82,259.158 cm⁻¹.', ru:'Наблюдаемые длины волн H I, He I, Na I, Mg I, Ca I, Ca II и Fe I для всех лабораторных линий в сравнении спектров и длины волн Ритца для лестницы водорода (в воздухе от 200 до 2000 нм, в вакууме вне этого диапазона); уровень H I n = 2 — 82 259,158 см⁻¹.'}},
  {title:'NIST ASD, “Conversion between air and vacuum wavelengths”', url:'https://physics.nist.gov/PhysRefData/ASD/Html/lineshelp.html', note:{en:'ASD uses the five-parameter refractive index of Peck & Reeder (1972); 200.0648 nm in vacuum = 200.0000 nm in standard air.', ru:'ASD использует пятипараметрическую формулу показателя преломления Пека и Ридера (1972); 200,0648 нм в вакууме = 200,0000 нм в стандартном воздухе.'}},
  {title:'J. L. Marshall & V. R. Marshall (2012), “Rediscovery of the Elements: Helium”, The HEXAGON (summer), 20–24', url:'https://cos.unt.edu/chemistry/system/files/james-l-marshall-pdfs/helium.pdf', note:{en:'Janssen at Guntur on 18 August 1868 saw the red C and blue F hydrogen lines and a yellow line; Lockyer saw them on 20 October 1868; both announced to the Académie on 26 October; Lockyer\'s D₃; Ramsay\'s cleveite; Crookes\'s confirmation.', ru:'Жансен в Гунтуре 18 августа 1868 года увидел красную линию C и синюю F водорода и жёлтую линию; Локьер — 20 октября 1868 года; оба результата оглашены в Академии 26 октября; линия D₃ Локьера; клевеит Рамзая; подтверждение Крукса.'}},
  {title:'W. Ramsay (1895), “On a gas showing the spectrum of helium, the reputed cause of D₃ …”, Proceedings of the Royal Society 58, 65–67', url:'https://doi.org/10.1098/rspl.1895.0006', note:{en:'Ramsay\'s preliminary note (bibliographic data checked at Crossref).', ru:'Предварительное сообщение Рамзая (библиографические данные проверены по Crossref).'}},
  {title:'Encyclopædia Britannica (1911), “Helium”, by R. J. Strutt (Wikisource)', url:'https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Helium', note:{en:'A bright yellow line “near to, but not identical with, the D line of sodium”, identified with the D₃ line of the solar chromosphere observed in 1868 by Lockyer.', ru:'Яркая жёлтая линия «вблизи линии D натрия, но не совпадающая с ней», отождествлённая с линией D₃ солнечной хромосферы, которую в 1868 году наблюдал Локьер.'}},
  {title:'The Nobel Prize in Chemistry 1904 — Summary', url:'https://www.nobelprize.org/prizes/chemistry/1904/summary/', note:{en:'Sir William Ramsay “in recognition of his services in the discovery of the inert gaseous elements in air”.', ru:'Сэр Уильям Рамзай — «в знак признания его заслуг в открытии инертных газообразных элементов воздуха».'}},
  {title:'J. J. Balmer (1885), “Notiz über die Spectrallinien des Wasserstoffs”, Annalen der Physik 261, 80–87', url:'https://doi.org/10.1002/andp.18852610506', note:{en:'Balmer\'s formula (bibliographic data checked at Crossref).', ru:'Формула Бальмера (библиографические данные проверены по Crossref).'}},
  {title:'Complete Dictionary of Scientific Biography, “Balmer, Johann Jakob”', url:'https://mathshistory.st-andrews.ac.uk/DSB/balmer.pdf', note:{en:'λ = h m²/(m² − n²) with n = 2 and h = 3645.6 × 10⁻⁸ cm; he knew Ångström\'s four lines and predicted the fifth; agreement within about one part in a thousand; other series for other n.', ru:'λ = h m²/(m² − n²) при n = 2 и h = 3645,6 × 10⁻⁸ см; он знал четыре линии Ангстрема и предсказал пятую; согласие примерно до одной тысячной; другие серии при других n.'}},
  {title:'Complete Dictionary of Scientific Biography, “Rydberg, Johannes (Janne) Robert”', url:'https://mathshistory.st-andrews.ac.uk/DSB/rydberg.pdf', note:{en:'His 1890 work wrote series in wave numbers with N₀ = 109,721.6 cm⁻¹ common to all series and all elements.', ru:'В работе 1890 года серии записаны в волновых числах с постоянной N₀ = 109 721,6 см⁻¹, общей для всех серий и всех элементов.'}},
  {title:'NIST, “Fundamental Physical Constants” (CODATA 2022)', url:'https://physics.nist.gov/cuu/Constants/index.html', note:{en:'Rydberg constant 10,973,731.568157 m⁻¹; proton–electron mass ratio 1836.152673426; electron mass 9.1093837139 × 10⁻³¹ kg; exact h, k, c, e; Wien constant 2.897771955 × 10⁻³ m·K.', ru:'Постоянная Ридберга 10 973 731,568157 м⁻¹; отношение масс протона и электрона 1836,152673426; масса электрона 9,1093837139 × 10⁻³¹ кг; точные h, k, c, e; постоянная Вина 2,897771955 × 10⁻³ м·К.'}},
  {title:'The Nobel Prize in Physics 1922 — Summary', url:'https://www.nobelprize.org/prizes/physics/1922/summary/', note:{en:'Niels Bohr “for his services in the investigation of the structure of atoms and of the radiation emanating from them”.', ru:'Нильс Бор — «за заслуги в исследовании строения атомов и испускаемого ими излучения».'}},
  {title:'O. Gingerich, “Fleming, Williamina Paton”, Complete Dictionary of Scientific Biography', url:'https://mathshistory.st-andrews.ac.uk/DSB/fleming.pdf', note:{en:'10,351 stars in the Draper Catalogue of Stellar Spectra (Harvard Annals 27, 1890), in classes lettered A to Q; 99.3 % fell in A, B, F, G, K and M.', ru:'10 351 звезда в Каталоге звёздных спектров Дрейпера (Анналы Гарварда, т. 27, 1890), классы обозначены буквами от A до Q; 99,3 % попали в A, B, F, G, K и M.'}},
  {title:'O. Gingerich, “Cannon, Annie Jump”, Complete Dictionary of Scientific Biography', url:'https://mathshistory.st-andrews.ac.uk/DSB/cannon.pdf', note:{en:'1901: spectra of 1,122 brighter stars; the Henry Draper Catalogue (Annals 91–99), 225,300 stars, classified 1911–1915 at more than three stars a minute, last volume 1924.', ru:'1901: спектры 1122 ярких звёзд; Каталог Генри Дрейпера (Анналы, т. 91–99), 225 300 звёзд, классифицированных в 1911–1915 годах со скоростью более трёх звёзд в минуту, последний том — 1924.'}},
  {title:'A. J. Cannon & E. C. Pickering (1918–1924), Henry Draper Catalogue, machine-readable version, VizieR III/135A', url:'https://cdsarc.cds.unistra.fr/viz-bin/cat/III/135A', note:{en:'Counted here from catalog.dat for HD 1–225300 by the first letter of the spectral type: K 60,615; A 57,852; F 42,988; G 41,994; B 16,789; M 4,396; O 169; other 497.', ru:'Подсчитано по файлу catalog.dat для HD 1–225300 по первой букве спектрального типа: K 60 615; A 57 852; F 42 988; G 41 994; B 16 789; M 4396; O 169; прочие 497.'}},
  {title:'E. Mamajek, “A Modern Mean Dwarf Stellar Color and Effective Temperature Sequence”, v2022.04.16 (after Pecaut & Mamajek 2013, ApJS 208, 9)', url:'https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt', note:{en:'Mean effective temperatures: O5V 41,400 K, B0V 31,400, A0V 9,700, F0V 7,220, G2V 5,770, K0V 5,270, M0V 3,850, M5V 3,060.', ru:'Средние эффективные температуры: O5V 41 400 К, B0V 31 400, A0V 9700, F0V 7220, G2V 5770, K0V 5270, M0V 3850, M5V 3060.'}},
  {title:'C. H. Payne (1925), Stellar Atmospheres, Harvard Observatory Monographs 1 (Internet Archive scan)', url:'https://archive.org/details/in.ernet.dli.2015.212833', note:{en:'Hydrogen lines at a maximum “in the neighborhood of Class A0”; Table XXVIII (p. 184): log abundance H 11, He 8.3, Mg 5.6, Na 5.2, Si 4.8, Ca 4.8, Fe 4.8; p. 188: “The enormous abundance derived for these elements in the stellar atmosphere is almost certainly not real.”', ru:'Линии водорода максимальны «в окрестности класса A0»; табл. XXVIII (с. 184): логарифм обилия H 11, He 8,3, Mg 5,6, Na 5,2, Si 4,8, Ca 4,8, Fe 4,8; с. 188: «Огромное обилие этих элементов, полученное для звёздной атмосферы, почти наверняка не соответствует действительности».'}},
  {title:'Complete Dictionary of Scientific Biography, “Payne-Gaposchkin, Cecilia Helena”', url:'https://mathshistory.st-andrews.ac.uk/DSB/payne-gaposchkin.pdf', note:{en:'Arrived at Harvard in 1923; differences between spectra come from physical conditions, not abundance; persuaded largely by Henry Norris Russell that the hydrogen result was amiss; Struve: “undoubtedly the most brilliant PhD thesis ever written in astronomy”.', ru:'Приехала в Гарвард в 1923 году; различия спектров — следствие физических условий, а не обилия; в основном Генри Норрис Расселл убедил её, что результат по водороду ошибочен; Струве: «несомненно, самая блестящая диссертация, когда-либо написанная по астрономии».'}},
  {title:'H. N. Russell (1929), “On the Composition of the Sun\'s Atmosphere”, Astrophysical Journal 70, 11–82 (ADS scan)', url:'https://articles.adsabs.harvard.edu/pdf/1929ApJ....70...11R', note:{en:'Abstract: “60 parts of hydrogen (by volume), 2 of helium, 2 of oxygen, 1 of metallic vapors, and 0.8 of free electrons”; p. 65: comparison with Payne for 16 elements, “a very gratifying agreement”.', ru:'Аннотация: «60 частей водорода (по объёму), 2 — гелия, 2 — кислорода, 1 — паров металлов и 0,8 — свободных электронов»; с. 65: сравнение с Пейн по 16 элементам — «весьма отрадное согласие».'}},
  {title:'M. Asplund, A. M. Amarsi & N. Grevesse (2021), “The chemical make-up of the Sun: A 2020 vision”, Astronomy & Astrophysics 653, A141', url:'https://arxiv.org/abs/2105.01661', note:{en:'Table 2, log ε (H = 12): He 10.914, Mg 7.55, Si 7.51, Fe 7.46, Ca 6.30, Na 6.22; surface mass fractions X = 0.7438, Y = 0.2423, Z = 0.0139.', ru:'Табл. 2, log ε (H = 12): He 10,914, Mg 7,55, Si 7,51, Fe 7,46, Ca 6,30, Na 6,22; массовые доли на поверхности X = 0,7438, Y = 0,2423, Z = 0,0139.'}},
  {title:'NIST ASD, “Ionization Energies” — H I', url:'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html', note:{en:'13.598434599702 eV (109,678.77174307 cm⁻¹).', ru:'13,598434599702 эВ (109 678,77174307 см⁻¹).'}},
  {title:'IAU Circular 6251 (1995), “51 Pegasi”', url:'https://tamkin3.eps.harvard.edu/iauc/06200/06251.html', note:{en:'Announced in Florence on 6 October; 18 months of ELODIE data; P = 4.2293 ± 0.0011 days, e = 0 (assumed), K = 0.059 ± 0.003 km/s; minimum mass 0.47 ± 0.02 Jupiter masses; confirmed at Lick and by a CfA/HAO team.', ru:'Объявлено во Флоренции 6 октября; 18 месяцев измерений ELODIE; P = 4,2293 ± 0,0011 сут, e = 0 (принято), K = 0,059 ± 0,003 км/с; минимальная масса 0,47 ± 0,02 массы Юпитера; подтверждено в Лике и группой CfA/HAO.'}},
  {title:'Royal Swedish Academy of Sciences (2019), “Scientific Background on the Nobel Prize in Physics 2019”', url:'https://www.nobelprize.org/uploads/2019/10/advanced-physicsprize2019.pdf', note:{en:'ELODIE: resolving power 42,000, 390–680 nm, accuracy 13 m/s, about 5,000 lines used; Jupiter moves the Sun ±13 m/s over 12 years; 51 Peg b: 59 m/s, 4.23 days, 0.47 M_J/sin i; 142 stars; published 23 November 1995.', ru:'ELODIE: разрешающая сила 42 000, 390–680 нм, точность 13 м/с, около 5000 линий; Юпитер качает Солнце на ±13 м/с за 12 лет; 51 Пегаса b: 59 м/с, 4,23 сут, 0,47 M_J/sin i; 142 звезды; опубликовано 23 ноября 1995 года.'}},
  {title:'The Nobel Prize in Physics 2019 — Summary', url:'https://www.nobelprize.org/prizes/physics/2019/summary/', note:{en:'Michel Mayor and Didier Queloz “for the discovery of an exoplanet orbiting a solar-type star” (shared with James Peebles).', ru:'Мишель Майор и Дидье Кело — «за открытие экзопланеты, обращающейся вокруг звезды солнечного типа» (вместе с Джеймсом Пиблсом).'}},
  {title:'NASA NSSDC, “Jupiter Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html', note:{en:'GM 126.687 × 10⁶ km³/s²; sidereal orbit period 4,332.589 days; mass 317.83 Earths; Earth GM 0.39860 × 10⁶ km³/s², year 365.256 days.', ru:'GM 126,687 × 10⁶ км³/с²; сидерический период 4332,589 сут; масса 317,83 земной; GM Земли 0,39860 × 10⁶ км³/с², год 365,256 сут.'}},
  {title:'NASA NSSDC, “Sun Fact Sheet”', url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note:{en:'GM 132,712 × 10⁶ km³/s²; effective temperature 5,772 K.', ru:'GM 132 712 × 10⁶ км³/с²; эффективная температура 5772 К.'}},
  {title:'A. C. Maury & E. C. Pickering (1897), “Spectra of Bright Stars Photographed with the 11-inch Draper Telescope”, Annals of Harvard College Observatory 28, Part I (ADS scan)', url:'https://articles.adsabs.harvard.edu/pdf/1897AnHar..28....1M', note:{en:'Preface: assigned to Miss Antonia C. Maury in 1888, “she is alone responsible for the classification”; ch. I: about 4,800 photographs of 681 of the brightest stars north of −30°; 22 groups and divisions a, b, c; division c stars “must differ more decidedly in constitution”.', ru:'Предисловие: работа поручена мисс Антонии К. Мори в 1888 году, «она единственный автор классификации»; гл. I: около 4800 снимков 681 самой яркой звезды севернее −30°; 22 группы и подразделения a, b, c; звёзды подразделения c «должны сильнее отличаться по строению».'}},
  {title:'E. Hertzsprung (1909), “Über die Sterne der Unterabteilungen c und ac nach der Spektralklassifikation von Antonia C. Maury”, Astronomische Nachrichten 179, 373 (ADS scan)', url:'https://articles.adsabs.harvard.edu/pdf/1909AN....179..373H', note:{en:'Maury\'s c stars have unmeasurably small parallaxes and proper motions, so they must be very luminous; an extract of his 1905 and 1907 papers.', ru:'У c-звёзд Мори параллаксы и собственные движения неизмеримо малы, значит, их светимость очень велика; выдержка из его работ 1905 и 1907 годов.'}},
  {title:'W. H. Wollaston (1802), “A Method of examining refractive and dispersive Powers, by prismatic Reflection”, Philosophical Transactions 92, 365–380 (Internet Archive scan of the 1802 volume)', url:'https://archive.org/details/s3id13528400', note:{en:'p. 378: through a narrow crevice and a flint-glass prism, daylight separates into four colours bounded by distinct lines A–E, with “other distinct dark lines, f and g”.', ru:'с. 378: через узкую щель и призму из флинтгласа дневной свет разделяется на четыре цвета, ограниченные чёткими линиями A–E, с «другими отчётливыми тёмными линиями f и g».'}},
  {title:'G. Kirchhoff & R. Bunsen (1861), “Chemische Analyse durch Spectralbeobachtungen” (second paper), Annalen der Physik 189, 337–381', url:'https://doi.org/10.1002/andp.18611890702', note:{en:'Bibliographic data checked at Crossref; the 1911 Britannica “Rubidium” article cites p. 337 of this paper for the discovery, and its “Caesium” article dates Bunsen\'s caesium announcement to 1860.', ru:'Библиографические данные проверены по Crossref; статья «Рубидий» Британники 1911 года ссылается на с. 337 этой работы как на открытие, а статья «Цезий» датирует сообщение Бунзена о цезии 1860 годом.'}},
  {title:'A. Baranne, D. Queloz, M. Mayor et al. (1996), “ELODIE: A spectrograph for accurate radial velocity measurements”, Astronomy & Astrophysics Supplement 119, 373–390', url:'https://doi.org/10.1051/aas:1996251', note:{en:'The instrument paper (bibliographic data checked at Crossref).', ru:'Статья с описанием прибора (библиографические данные проверены по Crossref).'}}
];

/* ============ RENDER ALL ============ */
function renderAll(){
  renderMT(); renderLD(); renderHD(); renderTH(); renderAB(); renderWB();
  document.querySelectorAll('[data-aria-en]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
  renderTimelineFrom(TIMELINE); renderRefsFrom(REFERENCES);
  onScroll();
}
applyLang('en');
window.__spectrum = {nAir:nAir, vacToAir:vacToAir, shownWl:shownWl, ATLAS:ATLAS, LAB:LAB, LABELLED:LABELLED, matchLines:matchLines, rydbergVac:rydbergVac, levelEv:levelEv,
  balmer1885:balmer1885, NIST_H:NIST_H, R_H:R_H, RYDBERG_1890:RYDBERG_1890, sahaRatio:sahaRatio, n2Fraction:n2Fraction, peakT:peakT, planckLam:planckLam, wienNm:wienNm,
  SPT:SPT, nearestType:nearestType, HD_COUNTS:HD_COUNTS, PAYNE:PAYNE, ASPLUND:ASPLUND, perSilicon:perSilicon, kAmp:kAmp, orbitAU:orbitAU, minMassMJ:minMassMJ,
  shiftNm:shiftNm, ELODIE_R:ELODIE_R, PEG:PEG, GM_JUP:GM_JUP, GM_EARTH:GM_EARTH, GM_SUN:GM_SUN, T_SUN:T_SUN, TIMELINE:TIMELINE, REFERENCES:REFERENCES};
