module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  const W = C.W;
  // the component weights must add up to the published total (SP-4029)
  const parts = 5023648 + 11477 + 1058140 + 8076 + 262613 + 4275 + 109646;
  ok('Apollo 11 parts sum to 6,477,875 lb', parts === 6477875, parts);
  ok('S-IC parts = 5,023,648', 287531 + 1424889 + 3305786 + 5442 === 5023648);
  ok('S-II parts = 1,058,140', 79714 + 819050 + 158116 + 1260 === 1058140);
  ok('S-IVB parts = 262,613', 24852 + 43608 + 192497 + 1656 === 262613);
  const S = C.stages(1), tot = S.reduce((a, s) => a + s.dv, 0);
  ok('ideal total Δv ≈ 12.5 km/s (orbit 9.4 + TLI ~3.1)', Math.abs(tot/1000 - 12.4) < 0.3, (tot/1000).toFixed(3));
  ok('stage 3 starts with S-IVB + IU + spacecraft (no LES)', Math.abs(S[2].m0 - (262613 + 4275 + 100736)) < 1, S[2].m0);
  const O = C.oneStage(1, 425); ok('single stage at 425 s ≈ 10.4 km/s', Math.abs(O.dv/1000 - 10.40) < 0.05, (O.dv/1000).toFixed(3));
  ok('heavier payload lowers Δv', C.stages(2).reduce((a, s) => a + s.dv, 0) < tot);
  ok('N1 liftoff T/W = 30 × 153.4 / 2750 ≈ 1.67', Math.abs(C.n1tw(30) - 1.6735) < 0.001, C.n1tw(30).toFixed(4));
  ok('N1 needs ≥ 18 engines for T/W > 1', C.n1tw(18) > 1 && C.n1tw(17) < 1);
  ok('Saturn V T/W ≈ 1.17; 4 of 5 F-1 < 1', Math.abs(C.SV_TW - 1.175) < 0.002 && C.SV_TW*0.8 < 1, C.SV_TW.toFixed(3));
  console.log(out.join('\n'));
};
