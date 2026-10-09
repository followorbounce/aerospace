module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('ideal pressure 2S/c = 9.08 µN/m²', Math.abs(C.P_IDEAL*1e6 - 9.08) < 0.01, (C.P_IDEAL*1e6).toFixed(3));
  ok('IKAROS ideal face-on ≈ 1.78 mN', Math.abs(C.force(196, 1, 0, 1)*1000 - 1.780) < 0.005, (C.force(196, 1, 0, 1)*1000).toFixed(3));
  ok('η 0.63 → 1.12 mN (JAXA)', Math.abs(C.force(196, 0.63, 0, 1)*1000 - 1.12) < 0.01, (C.force(196, 0.63, 0, 1)*1000).toFixed(3));
  ok('1.12 mN ≈ weight of 0.114 g (JAXA)', Math.abs(1.12e-3/9.80665*1000 - 0.114) < 0.001);
  let best = 0, ba = 0; for(let a = 0; a <= 90; a += 0.01){ const s = C.sideways(a); if(s > best){ best = s; ba = a; } }
  ok('best sideways angle 35.26°, 38.5 %', Math.abs(ba - 35.26) < 0.02 && Math.abs(best - 0.3849) < 0.001, ba.toFixed(2) + '° ' + (best*100).toFixed(1) + '%');
  ok('1/r²: Venus (0.72 AU) ≈ 1.93×', Math.abs(C.force(1, 1, 0, 0.72)/C.force(1, 1, 0, 1) - 1.929) < 0.01);
  ok('IKAROS areal density ≈ 1.6 kg/m²', Math.abs(310/196 - 1.58) < 0.01);
  console.log(out.join('\n'));
};
