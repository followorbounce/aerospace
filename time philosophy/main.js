(function(){
  'use strict';

  /* ---------------- language switch ---------------- */
  const LANG_KEY = 'vhts_lang';
  function applyLang(lang){
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.langsw button').forEach(function(b){
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });
    const titleEl = document.querySelector('title');
    if (titleEl){
      const t = titleEl.getAttribute('data-title-' + lang);
      if (t) titleEl.textContent = t;
    }
    localStorage.setItem(LANG_KEY, lang);
  }
  function initLang(){
    const stored = localStorage.getItem(LANG_KEY);
    const lang = stored || 'en';
    applyLang(lang);
    document.querySelectorAll('.langsw button').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyLang(btn.dataset.lang);
      });
    });
  }

  /* ---------------- active nav ---------------- */
  function markActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.pages-nav a').forEach(function(a){
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')){
        a.classList.add('is-active');
      }
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  function initReveal(){
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !items.length){
      items.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---------------- telemetry readout (scroll position framed as coordinate) ---------------- */
  function initTelemetry(){
    const el = document.querySelector('[data-telemetry]');
    if (!el) return;
    function update(){
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      const au = (progress * (window.__TELEMETRY_MAX_AU || 160)).toFixed(2);
      el.textContent = 'Δ ' + au + ' AU  ·  ' + (progress*100).toFixed(1) + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------------- maya long count block ---------------- */
  function initMaya(){
    const host = document.querySelector('[data-maya-count]');
    if (!host || !window.MayaLongCount) return;
    const now = new Date();
    const lc = window.MayaLongCount.compute(now);
    const str = window.MayaLongCount.format(lc);
    const parts = str.split('.');
    host.innerHTML = parts.map(function(p, i){
      return '<b>' + p + '</b>' + (i < parts.length - 1 ? '<span class="sep">.</span>' : '');
    }).join('');

    const units = document.querySelector('[data-maya-units]');
    if (units){
      const labels = ['baktun','katun','tun','uinal','kin'];
      const vals = [lc.baktun, lc.katun, lc.tun, lc.uinal, lc.kin];
      units.innerHTML = labels.map(function(l, i){
        return '<div><div class="u-label">' + l + '</div><div class="u-val">' + vals[i] + '</div></div>';
      }).join('');
    }

    const greg = document.querySelector('[data-maya-gregorian]');
    if (greg){
      const opts = { year:'numeric', month:'long', day:'numeric' };
      const en = now.toLocaleDateString('en-US', opts);
      const ru = now.toLocaleDateString('ru-RU', opts);
      const enEl = greg.querySelector('[data-lang="en"]');
      const ruEl = greg.querySelector('[data-lang="ru"]');
      if (enEl) enEl.textContent = en;
      if (ruEl) ruEl.textContent = ru;
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initLang();
    markActiveNav();
    initReveal();
    initTelemetry();
    initMaya();
  });
})();
