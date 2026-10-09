var lang = 'en';
function T(en, ru){ return lang === 'en' ? en : ru; }
function ns(tag, attrs, parent){
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for(var k in attrs) el.setAttribute(k, attrs[k]);
  if(parent) parent.appendChild(el);
  return el;
}
function txt(parent, x, y, s, cls, anchor){
  var t = ns('text', {x:x, y:y, 'class':cls || 'svg-label', 'text-anchor':anchor || 'start'}, parent);
  t.textContent = s; return t;
}
function fmt(n, d){
  var s = n.toFixed(d);
  if(lang === 'ru') s = s.replace('.', ',').replace('-', '−');
  else s = s.replace('-', '−');
  return s;
}
function fmtInt(n){
  var s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'ru' ? ' ' : ',');
  return (n < 0 ? '−' : '') + s;
}
function cells(el, rows){
  el.innerHTML = rows.map(function(r){
    return '<div class="readout-cell'+(r[2] ? ' wide' : '')+'"><span class="rl">'+r[0]+'</span>'+r[1]+'</div>';
  }).join('');
}
function reduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function pressGroup(container, active){
  Array.prototype.forEach.call(container.querySelectorAll('.btn'), function(b){
    var on = b === active; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
/* Animation loops run only while their figure is on screen and the tab is visible. */
function visibleLoop(el, step){
  var on = false, raf = 0, last = 0, vis = false;
  function frame(t){ if(!on) return; var dt = Math.min(0.05, (t - last)/1000 || 0); last = t; step(dt); raf = requestAnimationFrame(frame); }
  function start(){ if(on || document.hidden || !vis) return; on = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop(){ on = false; cancelAnimationFrame(raf); }
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ vis = es[0].isIntersecting; vis ? start() : stop(); }).observe(el); }
  else { vis = true; start(); }
  document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });
}

/* ============ HUD / SCROLL ============ */
var progressEl = document.getElementById('progress');
var hudPhase = document.getElementById('hud-phase'), hud1 = document.getElementById('hud-alt'), hud2 = document.getElementById('hud-vel');
var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
function onScroll(){
  var doc = document.documentElement;
  progressEl.style.width = (doc.scrollTop/Math.max(1, doc.scrollHeight - doc.clientHeight)*100) + '%';
  var mid = window.scrollY + window.innerHeight*0.4, current = sections[0];
  sections.forEach(function(s){ if(s.offsetTop <= mid) current = s; });
  hudPhase.textContent = current.dataset.phase;
}
document.addEventListener('scroll', onScroll, {passive:true});
function applyLang(l){
  lang = l;
  document.documentElement.lang = l;
  document.querySelectorAll('[data-en]').forEach(function(el){
    var v = el.getAttribute('data-'+l);
    if(v !== null) el.innerHTML = v;
  });
  document.querySelectorAll('#langtoggle button').forEach(function(b){ b.classList.toggle('active', b.dataset.lang === l); });
  renderAll();
}
document.querySelectorAll('#langtoggle button').forEach(function(b){
  b.addEventListener('click', function(){ applyLang(b.dataset.lang); });
});
function renderTimelineFrom(list){
  var wrap = document.getElementById('timeline'); wrap.innerHTML = '';
  list.forEach(function(e){
    var row = document.createElement('div'); row.className = 'tl';
    row.innerHTML = '<div class="tl-y">'+e[0]+'</div><div class="tl-t">'+(lang === 'en' ? e[1] : e[2])+'</div>';
    wrap.appendChild(row);
  });
}
function renderRefsFrom(list){
  var wrap = document.getElementById('refList'); wrap.innerHTML = '';
  list.forEach(function(r, i){
    var item = document.createElement('div'); item.className = 'ref-item';
    item.innerHTML = '<div class="ref-num">['+(i+1)+']</div><div><div class="ref-title">'+r.title+'</div><div class="ref-url"><a href="'+r.url+'" rel="noopener">'+r.url+'</a></div><div class="ref-note">'+(lang === 'en' ? r.note.en : r.note.ru)+'</div></div>';
    wrap.appendChild(item);
  });
}
/* Physical constants (NASA Earth fact sheet) */
var MU_E = 398600.4418, R_E = 6371.0, C_LIGHT = 299792.458;
