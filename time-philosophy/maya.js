/* Maya Long Count — computed live, not hard-coded.
   Uses the Goodman–Martínez–Thompson (GMT) correlation constant 584283,
   the value most widely adopted by contemporary Maya epigraphers, which
   places 13.0.0.0.0 on 21 December 2012 (proleptic Gregorian). */

(function(){
  const GMT_CORRELATION = 584283;

  function gregorianToJDN(y, m, d){
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
      Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
  }

  function longCountToday(date){
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const jdn = gregorianToJDN(y, m, d);
    const lc = jdn - GMT_CORRELATION;

    const baktun = Math.floor(lc / 144000);
    let r = lc % 144000;
    const katun = Math.floor(r / 7200); r %= 7200;
    const tun   = Math.floor(r / 360);  r %= 360;
    const uinal = Math.floor(r / 20);   r %= 20;
    const kin   = r;

    return { baktun, katun, tun, uinal, kin, jdn, lc };
  }

  function pad(n){ return String(n).padStart(2,'0'); }

  window.MayaLongCount = {
    compute: longCountToday,
    format(lc){ return `${lc.baktun}.${pad(lc.katun)}.${pad(lc.tun)}.${pad(lc.uinal)}.${pad(lc.kin)}`; }
  };
})();
