module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const rel = (a, b) => Math.abs(a/b - 1), P = C.PLANCK18, d = w.document;
  // CH1 budget from Planck 2018 [2]
  const b = C.budget(P);
  ok('Ω_b = 0.02237/h² ≈ 0.0493 (4.9 %)', Math.abs(b.b - 0.0493) < 0.0002, b.b.toFixed(4));
  ok('Ω_c = 0.1200/h² ≈ 0.2645 (26.5 %)', Math.abs(b.c - 0.2645) < 0.0003, b.c.toFixed(4));
  ok('Ω_b + Ω_c ≈ Ω_m = 0.3153 (within 0.1 %, neutrinos)', Math.abs(b.b + b.c - P.Om) < 0.002, (b.b + b.c).toFixed(4));
  ok('dark : ordinary matter ≈ 5.4', Math.abs(b.ratio - 5.36) < 0.02, b.ratio.toFixed(3));
  // CH2 rotation curve, SPARC NGC 3198 [5][6]
  ok('SPARC table: 43 points, last at 44.08 kpc', C.N3198.length === 43 && C.N3198.slice(-1)[0][0] === 44.08);
  const s5 = C.rotSummary(0.5), f5 = C.fitHalo(0.5);
  ok('mass inside 44.08 kpc at 149 km/s ≈ 2.28e11 M☉', rel(s5.Mtot, 2.275e11) < 0.002, s5.Mtot.toExponential(3));
  ok('Υ = 0.5: visible speed at the edge ≈ 65 km/s', Math.abs(s5.vVis - 64.7) < 0.5, s5.vVis.toFixed(1));
  ok('Υ = 0.5: dark share inside 44 kpc ≈ 81 %', Math.abs(s5.dark - 0.811) < 0.003, (s5.dark*100).toFixed(1));
  ok('Kepler from the visible mass inside 14 kpc gives ≈ 51 km/s at 44 kpc', Math.abs(s5.vKep - 51.0) < 0.5, s5.vKep.toFixed(1));
  ok('Υ = 0.5 halo fit is good: χ²/dof < 1.5', f5.chi/f5.dof < 1.5, (f5.chi/f5.dof).toFixed(2));
  ok('Υ = 0.9 (heavy stars) fits worse than Υ = 0.5', C.fitHalo(0.9).chi > f5.chi, (C.fitHalo(0.9).chi/f5.dof).toFixed(2));
  ok('every Υ from 0.1 to 1.2 still leaves > 60 % dark at the edge', [0.1, 0.3, 0.5, 0.7, 0.9, 1.2].every(Y => C.rotSummary(Y).dark > 0.6));
  // halo formula: large R → flat at v² = 4πGρ₀Rc²; analytic check against direct integration of the isothermal-core density
  const Rc = 2, rho = 0.05, vinf2 = 4*Math.PI*4.30091e-3*rho*Math.pow(2000, 2);
  ok('halo speed tends to the flat value far out', rel(rho*C.haloUnit(1e4, Rc), vinf2) < 0.001);
  let M = 0; const R = 10, n = 20000; for(let i = 0; i < n; i++){ const r = (i + 0.5)/n*R*1000; M += 4*Math.PI*r*r*rho/(1 + Math.pow(r/2000, 2))*(R*1000/n); }
  ok('halo v² = GM(<R)/R from integrating ρ₀/(1 + (r/Rc)²)', rel(4.30091e-3*M/(R*1000), rho*C.haloUnit(R, Rc)) < 1e-4, (Math.sqrt(4.30091e-3*M/(R*1000))).toFixed(2));
  // CH3 cosmology
  const pl = {Om:P.Om, OL:P.OL};
  ok('Planck 2018 age today ≈ 13.80 Gyr (paper: 13.797)', Math.abs(C.age(pl) - 13.797) < 0.02, C.age(pl).toFixed(3));
  ok('Einstein–de Sitter age = 2/(3H₀) ≈ 9.68 Gyr', Math.abs(C.age({Om:1, OL:0}) - 2/3*3.0856775814913673e19/67.36/3.15576e16) < 0.01, C.age({Om:1, OL:0}).toFixed(3));
  ok('empty universe d_L = z(1 + z/2): Δμ = 0', Math.abs(C.dMuEmpty(0.7, {Om:0, OL:0})) < 1e-9);
  ok('EdS closed form d_L = 2(1+z)(1 − 1/√(1+z))', rel(C.dLunit(1, {Om:1, OL:0}), 2*2*(1 - 1/Math.SQRT2)) < 1e-7, C.dLunit(1, {Om:1, OL:0}).toFixed(5));
  const r05 = C.dLunit(0.5, pl)/C.dLunit(0.5, C.RIESS_CMP);
  ok('z = 0.5: Planck universe ≈ 8 % farther than Ω_m = 0.2, no Λ (text: "about 8 %")', Math.abs(r05 - 1.084) < 0.003, ((r05 - 1)*100).toFixed(1));
  ok('Planck ΛCDM supernova at z = 0.5 is farther than in an empty universe (acceleration)', C.dMuEmpty(0.5, pl) > 0.1, C.dMuEmpty(0.5, pl).toFixed(3));
  ok('matter-only universe puts it closer than empty', C.dMuEmpty(0.5, {Om:1, OL:0}) < 0, C.dMuEmpty(0.5, {Om:1, OL:0}).toFixed(3));
  ok('Ω_m = 0, Ω_Λ = 1.2 bounced (no Big Bang): age and d_L(1.5) are NaN', isNaN(C.age({Om:0, OL:1.2})) && isNaN(C.dLunit(1.5, {Om:0, OL:1.2})));
  // review MUST 1: Ω_m = 0 universes start from a Big Bang (empty: age = 1/H₀ ≈ 14.52 Gyr; Ω_Λ 0.5: 18.09 Gyr)
  const H0inv = 3.0856775814913673e19/67.36/3.15576e16;
  ok('empty universe (Ω_m 0, Ω_Λ 0): age = 1/H₀ ≈ 14.52 Gyr', Math.abs(C.age({Om:0, OL:0}) - H0inv) < 0.01, C.age({Om:0, OL:0}).toFixed(3));
  ok('Ω_m 0, Ω_Λ 0.5: age ≈ 18.09 Gyr (not "no Big Bang")', Math.abs(C.age({Om:0, OL:0.5}) - 18.09) < 0.02, C.age({Om:0, OL:0.5}).toFixed(3));
  ok('Ω_m = 0.3, Ω_Λ = 0.7 has a Big Bang (age defined)', !isNaN(C.age({Om:0.3, OL:0.7})));
  ok('open universe uses sinh: Ω_m = 0.2 d_L(1) between EdS and empty', C.dLunit(1, C.RIESS_CMP) > C.dLunit(1, {Om:1, OL:0}) && C.dLunit(1, C.RIESS_CMP) < 1.5);
  let tr = 0; const nz = 200000; for(let i = 0; i < nz; i++){ const zz = (i + 0.5)/nz*0.5; tr += 1/Math.sqrt(P.Om*Math.pow(1 + zz, 3) + P.OL)*0.5/nz; }
  const dlInd = 1.5*tr*299792.458/67.36;
  ok('d_L(0.5, Planck) matches an independent midpoint integration', rel(C.dLmpc(0.5, pl), dlInd) < 1e-6, (C.dLmpc(0.5, pl)*3.26156e6/1e9).toFixed(2) + ' billion ly');
  // CH4 lensing [11][12]
  ok('Euclid density 1.5e9 / 14,000 deg² ≈ 30 per arcmin²', Math.abs(C.EUCLID_DENSITY - 29.76) < 0.01, C.EUCLID_DENSITY.toFixed(2));
  ok('one galaxy: noise 0.26 ≫ 2 % shear (S/N 0.08)', Math.abs(C.snr(0.02, 1) - 0.0769) < 0.001);
  ok('S/N = 10 at γ = 2 % needs 16,900 galaxies', Math.abs(C.galaxiesFor(10, 0.02) - 16900) < 1, C.galaxiesFor(10, 0.02).toFixed(0));
  ok('Euclid wide: noise on the mean ≈ 6.7e-6', Math.abs(C.shapeNoise(1.5e9) - 6.713e-6) < 1e-8, C.shapeNoise(1.5e9).toExponential(3));
  const sam = C.sampleGalaxies(20000, 0.02, 3), m1 = sam.reduce((a, p) => a + p.e1, 0)/sam.length;
  ok('random shapes average back to the shear (20,000 drawn)', Math.abs(m1 - 0.02) < 4*0.26/Math.sqrt(20000), m1.toFixed(4));
  // CH5 fields of view [12][18]
  const F = C.FOV;
  ok('Roman WFI is ≈ 225× WFC3-IR (NASA: about 200×)', Math.abs(F[3].deg2/F[0].deg2 - 224.8) < 0.5, (F[3].deg2/F[0].deg2).toFixed(1));
  ok('1,000 deg²: Euclid 1,852 pointings, Roman 3,559', Math.round(C.pointings(1000, 0.54)) === 1852 && Math.round(C.pointings(1000, 0.281)) === 3559);
  ok('1,000 deg² with NIRCam ≈ 371,000 pointings', Math.abs(C.pointings(1000, 9.7/3600) - 371134) < 1);
  // CH6 significance
  ok('3σ two-sided ≈ 1 in 370', Math.abs(1/C.twoSidedP(3) - 370.4) < 1, (1/C.twoSidedP(3)).toFixed(1));
  ok('4σ ≈ 1 in 15,800', Math.abs(1/C.twoSidedP(4) - 15787) < 30, (1/C.twoSidedP(4)).toFixed(0));
  ok('5σ ≈ 1 in 1.7 million', Math.abs(1/C.twoSidedP(5) - 1.744e6) < 5e3, (1/C.twoSidedP(5)).toExponential(3));
  // page behaviour: presets render without NaN in both languages
  const clickAll = () => d.querySelectorAll('#rotPre .btn, #snPre .btn, #wlPre .btn, #rotHalo, #wlNew').forEach(b => b.click());
  let bad = 0;
  // review MUST 1 + 2 on the live page: the empty-universe preset and Planck at z = 1.4
  const setSN = (z, m, l) => { d.getElementById('snZ').value = z; d.getElementById('snM').value = m; d.getElementById('snL').value = l; d.getElementById('snZ').dispatchEvent(new w.Event('input')); };
  setSN(0.5, 0, 0);
  ok('page: Ω_m 0, Ω_Λ 0 shows an age, not "no Big Bang"', !/no Big Bang|без Большого/.test(d.getElementById('snReadout').textContent) && /14[.,]5/.test(d.getElementById('snReadout').textContent), d.getElementById('snReadout').textContent.slice(0, 80));
  setSN(1.4, 0.3153, 0.6847);
  const st14 = d.getElementById('snStatus').textContent;
  ok('page: Planck at z = 1.4 is "closer" but does not say the 1998 supernovae "said otherwise"', /Closer|Ближе/.test(st14) && !/said otherwise|показали обратное/.test(st14), st14.slice(0, 60));
  setSN(1.4, 1, 0);
  ok('page: matter-only at z = 1.4 keeps the "said otherwise" text', /said otherwise|показали обратное/.test(d.getElementById('snStatus').textContent));
  setSN(0.5, 0.3153, 0.6847);
  // review MUST 3 + 4: Roman status wording and the RU CH.04 sentence
  const html = d.body.innerHTML;
  ok('Roman: coronagraph first light 22 September; "first science images" by early 2027; no "switched on on 15 September"', /first light on 22 September/.test(html) && /first science images by early 2027/.test(html) && !/switched on on 15 September/.test(html) && /первый свет 22 сентября/.test(html));
  ok('RU CH.04: the Q1 sentence has its subject', /дал в марте 2025 года быстрый выпуск данных Q1/.test(html));
  ok('23 references, all cited', d.querySelectorAll('#refList .ref-item').length === 23 && /\[23\]/.test(html) && /\[7\]/.test(html) && /\[20\]/.test(html));
  ['ru', 'en'].forEach(l => { d.querySelector('#langtoggle button[data-lang="' + l + '"]').click(); clickAll(); ['rotReadout', 'snReadout', 'wlReadout', 'fovTable'].forEach(id => { if(/NaN|undefined/.test(d.getElementById(id).textContent)) bad++; }); });
  ok('all presets render without NaN/undefined in EN and RU', bad === 0, bad);
  d.querySelector('#snPre .btn[data-m="0.3153"]').click();
  ok('Planck preset keeps Ω_m = 0.3153 exactly (not rounded to the step)', d.getElementById('snMVal').textContent === '0.315' && +d.getElementById('snM').value === 0.3153, d.getElementById('snM').value);
  ok('Euclid-wide preset reads 1.50 billion galaxies', (d.querySelector('#wlPre .btn[data-n="9.176091"]').click(), /1\.50 billion/.test(d.getElementById('wlNVal').textContent)), d.getElementById('wlNVal').textContent);
  ok('aria labels switch to Russian', (d.querySelector('#langtoggle button[data-lang="ru"]').click(), /Кривая вращения/.test(d.getElementById('rotSvg').getAttribute('aria-label'))));
  d.querySelector('#langtoggle button[data-lang="en"]').click();
  console.log(out.join('\n'));
};
