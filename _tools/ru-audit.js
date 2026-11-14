// ru-audit.js [slug ...] : how much English is still visible in the Russian edition (ru/<slug>.html).
// Loads each page in jsdom like test.js, switches it to RU (site.js does this in a browser), lets the scripts draw,
// then lists visible text (HTML and SVG) plus aria-label / title / alt / placeholder values that read as English:
// two or more Latin words of 3+ letters in a row and no Cyrillic. The reference list is skipped (English titles
// of English sources are correct there). Output: one JSON line per page {slug, english, samples}, then a total.
// Proper names written in Latin (InSight, GRAIL, SEIS) are single words and so are not counted; a few false
// positives remain (Latin quotes, code), which is why samples are printed.
const {JSDOM, VirtualConsole} = require('jsdom');
const fs = require('fs'), path = require('path');
const REPO = path.join(__dirname, '..');
let slugs = process.argv.slice(2);
if(!slugs.length) slugs = fs.readdirSync(path.join(REPO, 'ru')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => f.replace(/\.html$/, ''));
const LATIN = /\b[A-Za-z][A-Za-z'’-]{2,}\b(?:[\s,:;()\/–—-]+\b[A-Za-z][A-Za-z'’-]{2,}\b)+/;
const CYR = /[А-Яа-яЁё]/;
function englishy(s){ s = (s || '').replace(/\s+/g, ' ').trim(); return s && !CYR.test(s) && LATIN.test(s) && !/^https?:|^[\w.-]+\.(com|org|gov|int|edu)\b/.test(s); }
function audit(slug){
  return new Promise(resolve => {
    const file = path.join(REPO, 'ru', slug + '.html');
    const html = fs.readFileSync(file, 'utf8').replace(/<script src="\/aerospace\/assets\/site.js" defer><\/script>/, '').replace(/<script[^>]*(cloudflareinsights|googletagmanager)[^>]*><\/script>/g, '').replace(/<script>window\.dataLayer[\s\S]*?<\/script>/, '');
    const vc = new VirtualConsole();
    const dom = new JSDOM(html, {runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'https://followorbounce.github.io/aerospace/ru/' + slug,
      beforeParse(w){ w.Element.prototype.scrollIntoView = function(){}; w.matchMedia = () => ({matches:false, addEventListener(){}});
        w.IntersectionObserver = class { constructor(cb){ this.cb = cb; } observe(){ setTimeout(() => this.cb([{isIntersecting:true}]), 10); } unobserve(){} disconnect(){} };
        w.HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, {get:(t,k)=> k === 'createImageData' || k === 'getImageData' ? (a,b)=>({data:new Uint8ClampedArray((a||1)*(b||1)*4), width:a, height:b}) : (k === 'canvas' ? this : (typeof k === 'string' ? function(){ return {addColorStop(){}}; } : undefined)), set:()=>true}); }; }});
    const w = dom.window, d = w.document;
    setTimeout(() => {
      try { const b = d.querySelector('#langtoggle button[data-lang="ru"]'); if(b) b.click(); } catch(e){}
      setTimeout(() => {
        const found = [];
        const skip = el => el.closest('#refList, script, style, noscript, [aria-hidden="true"], .vh');
        const walker = d.createTreeWalker(d.body, w.NodeFilter.SHOW_TEXT);
        for(let n = walker.nextNode(); n; n = walker.nextNode()){ const p = n.parentElement; if(p && !skip(p) && englishy(n.nodeValue)) found.push(n.nodeValue.replace(/\s+/g, ' ').trim()); }
        d.querySelectorAll('[aria-label],[title],[alt],[placeholder]').forEach(el => { if(el.closest('#refList')) return;
          ['aria-label', 'title', 'alt', 'placeholder'].forEach(a => { const v = el.getAttribute(a); if(englishy(v)) found.push('@' + a + ': ' + v.trim()); }); });
        const uniq = [...new Set(found)];
        resolve({slug, english: uniq.length, samples: uniq.slice(0, 6).map(s => s.slice(0, 90))});
        w.close();
      }, 700);
    }, 400);
  });
}
(async () => {
  let total = 0; const rows = [];
  for(const s of slugs){ const r = await audit(s); rows.push(r); total += r.english; console.log(JSON.stringify(r)); }
  console.log(JSON.stringify({pages: rows.length, englishStrings: total, worst: rows.sort((a, b) => b.english - a.english).slice(0, 10).map(r => r.slug + ':' + r.english)}));
  process.exit(0);
})();
