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
  // classes used in the rendered page that no stylesheet (assets/site.css + the page's <style>) mentions
  const css = fs.readFileSync(require('path').join(__dirname, '..', 'assets', 'site.css'), 'utf8') + [...w.document.querySelectorAll('style')].map(x => x.textContent).join('\n');
  const used = new Set(); w.document.querySelectorAll('[class]').forEach(e => { const c = e.getAttribute('class'); if(typeof c === 'string') c.split(/\s+/).forEach(k => k && used.add(k)); });
  const watch = ['readout', 'readout-cell', 'rl', 'ctl', 'ctl-row', 'btn', 'btn-row', 'sim-wrap', 'sim-svg', 'eq-box', 'status', 'note'];
  const unstyled = [...used].filter(k => watch.includes(k) && !new RegExp('\\.' + k.replace(/-/g, '\\-') + '(?![\\w-])').test(css));
  // a stray " inside a bilingual attribute ends it early; the leftover words become empty attributes on the element
  const BOOL = new Set(['hidden','disabled','checked','open','defer','async','selected','readonly','multiple','novalidate','autofocus','required']);
  const brokenAttrs = [...w.document.querySelectorAll('[data-en]')].filter(e => [...e.attributes].some(a => a.value === '' && !BOOL.has(a.name) && !/^(data-|aria-)/.test(a.name))).length;
  console.log(JSON.stringify({errors, brokenAttrs, missingRu: miss, maxCite: Math.max(...cites), refs, timeline: w.document.querySelectorAll('#timeline .tl').length, unstyled}));
  if(process.argv[4]) require(require('path').resolve(process.argv[4]))(w, w[hook]);
  setTimeout(() => process.exit(0), 300);
}, 600);
