// usage: node test.js <file.html> <hookName> [checks.js] ; loads page in jsdom with scripts, reports errors, then runs checks file if exists
const {JSDOM, VirtualConsole} = require('jsdom');  // npm install in tools/
const fs = require('fs');
const file = process.argv[2], hook = process.argv[3];
const html = fs.readFileSync(file, 'utf8').replace(/<script src="\/aerospace\/assets\/site.js" defer><\/script>/, '').replace(/<script defer src="https:\/\/static.cloudflareinsights[^>]*><\/script>/, '');
const errors = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(String(e.message || e))); vc.on('error', e => errors.push('console.error ' + e));
const dom = new JSDOM(html, {runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'https://followorbounce.github.io/aerospace/x',
  beforeParse(w){ w.matchMedia = () => ({matches:false, addEventListener(){}}); w.IntersectionObserver = class { constructor(cb){ this.cb = cb; } observe(el){ setTimeout(() => this.cb([{isIntersecting:true}]), 10); } };
    w.HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, {get:(t,k)=> k === 'createImageData' || k === 'getImageData' ? (w2,h2)=>({data:new Uint8ClampedArray((w2||1)*(h2||1)*4), width:w2, height:h2}) : (k==='canvas'? this : (typeof k === 'string' ? function(){ return {addColorStop(){}}; } : undefined)), set:()=>true}); };
  }});
const w = dom.window;
setTimeout(() => {
  // switch language both ways
  try { w.document.querySelector('#langtoggle button[data-lang="ru"]').click(); w.document.querySelector('#langtoggle button[data-lang="en"]').click(); } catch(e){ errors.push('lang ' + e.message); }
  // every data-en has data-ru
  const miss = [...w.document.querySelectorAll('[data-en]')].filter(e => !e.hasAttribute('data-ru')).length;
  // highest citation number vs reference count
  const body = fs.readFileSync(file, 'utf8');
  const cites = [...body.matchAll(/\[(\d+)\]/g)].map(m => +m[1]).filter(n => n < 100);
  const refs = w.document.querySelectorAll('#refList .ref-item').length;
  console.log(JSON.stringify({errors, missingRu: miss, maxCite: Math.max(...cites), refs, timeline: w.document.querySelectorAll('#timeline .tl').length}));
  if(process.argv[4]) require(require('path').resolve(process.argv[4]))(w, w[hook]);
  setTimeout(() => process.exit(0), 300);
}, 600);
