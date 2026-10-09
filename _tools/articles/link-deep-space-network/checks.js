module.exports = (w, C) => {
  const out = [], ok = (n, c, v) => out.push((c ? 'PASS ' : 'FAIL ') + n + (v !== undefined ? ' = ' + v : ''));
  ok('space loss 7.273e9 km @ 8415 MHz = 308.19 dB [JPL]', Math.abs(C.spaceLoss(7.273e9, 8.415) - 308.19) < 0.02, C.spaceLoss(7.273e9, 8.415).toFixed(2));
  ok('HGA 3.66 m gain ≈ 48.2 dBi', Math.abs(C.gain(3.66, 8.415) - 48.2) < 0.15, C.gain(3.66, 8.415).toFixed(2));
  ok('70 m gain ≈ 74.01 dBi', Math.abs(C.gain(70, 8.415) - 74.01) < 0.15, C.gain(70, 8.415).toFixed(2));
  const B = C.budget(48.62, 12.3, 70, 8.415);
  ok('received ≈ −145.5 dBm', Math.abs(B.pr + 145.5) < 0.3, B.pr.toFixed(2));
  ok('N0 = −185.35 dBm/Hz', Math.abs(B.n0 + 185.35) < 0.01, B.n0.toFixed(2));
  ok('Pr/N0 ≈ 39.9 dB-Hz', Math.abs(B.prn0 - 39.9) < 0.3, B.prn0.toFixed(2));
  ok('160 bps margin ≈ 13.3 dB', Math.abs(B.margin160 - 13.3) < 0.3, B.margin160.toFixed(2));
  ok('one light-day: OWLT = 24 h', Math.abs(C.budget(25.902e9/C.AU, 12.3, 70, 8.415).owlt/3600 - 24) < 0.01);
  ok('Ka vs X gain per dish ≈ 11.6 dB', Math.abs(C.gain(70, 32) - C.gain(70, 8.415) - 11.6) < 0.05);
  ok('distance ×2 costs 6.02 dB', Math.abs(C.budget(10, 10, 70, 8.415).pr - C.budget(20, 10, 70, 8.415).pr - 6.0206) < 1e-6);
  console.log(out.join('\n'));
};
