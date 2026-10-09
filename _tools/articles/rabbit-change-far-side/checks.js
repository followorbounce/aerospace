module.exports = (w, R) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const mu = R.MU_EM, g = R.GAMMA2;
  const f = g**5 + (3-mu)*g**4 + (3-2*mu)*g**3 - mu*g*g - 2*mu*g - mu;
  ok('L2 quintic residual ~0', Math.abs(f) < 1e-14, f.toExponential(2));
  ok('gamma2 ≈ 0.168', Math.abs(g - 0.1678) < 0.001, g.toFixed(4));
  const r = R.relay(0);
  ok('L2 ~ 64,500 km beyond Moon', Math.abs(r.beyond - 64500) < 500, r.beyond.toFixed(0));
  ok('L2 ~449,000 km from Earth (Queqiao quoted ~455,000 incl. halo)', Math.abs(r.dL2 - 449000) < 2000, r.dL2.toFixed(0));
  ok('relay at exact L2 hidden', !r.visible);
  ok('min offset ~2,000 km', Math.abs(r.minOff - 2030) < 50, r.minOff.toFixed(0));
  ok('offset 13,000 km visible', R.relay(13000).visible);
  const a = R.ascent(250, 315, 1.9);
  ok('rocket eq: m0/mf = exp(dv/(Isp g0))', Math.abs(a.ratio - Math.exp(1900/(315*9.80665))) < 1e-12, a.ratio.toFixed(3));
  console.log(out.join('\n'));
};
