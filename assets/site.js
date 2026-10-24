/* ============================================================
   AEROSPACE — SHARED SITE SCRIPT
   Purely additive: enhances pages that were authored as
   standalone documents. Never replaces a page's own logic.

     - cross-site navigation (index overlay + prev/next + crumb)
     - site search (/ or the Search button; search.json) and
       "See also" links at the end of each guide (related.json)
     - language-choice persistence across pages
     - keyboard access for the interactive primitives
     - BreadcrumbList / TechArticle structured data

   Safe to load on any page. If pages.json is unreachable the
   navigation features quietly no-op and the rest still runs.
   ============================================================ */
(function () {
  "use strict";

  var BASE = "/aerospace/";
  var MANIFEST = BASE + "pages.json";
  var LANG_KEY = "aero-lang";
  var SEARCH = BASE + "search.json";      // descriptions + chapter titles, written by _tools/search-index.py
  var RELATED = BASE + "related.json";    // slug -> related slugs, edited by hand

  /* ---- helpers ------------------------------------------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function currentLang() {
    var b = document.querySelector('#langtoggle button.active');
    return (b && b.getAttribute('data-lang')) || document.documentElement.lang || 'en';
  }
  // slug of the page relative to BASE, without extension or trailing slash
  function currentSlug() {
    var p = location.pathname;
    if (p.indexOf(BASE) === 0) p = p.slice(BASE.length);
    p = p.replace(/index\.html?$/, '').replace(/\.html?$/, '').replace(/\/$/, '');
    return p;
  }

  /* ---- language persistence ----------------------------- */
  // Applied before other work so a restored choice is in place early.
  function initLangPersistence() {
    var toggle = document.getElementById('langtoggle');
    if (!toggle) return;
    var saved;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { saved = null; }

    if (saved && saved !== currentLang()) {
      var btn = toggle.querySelector('button[data-lang="' + saved + '"]');
      if (btn) btn.click();               // drives the page's own handler
    }
    toggle.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-lang]');
      if (!b) return;
      try { localStorage.setItem(LANG_KEY, b.getAttribute('data-lang')); } catch (e2) {}
      document.documentElement.lang = b.getAttribute('data-lang');
    });
    // label the control for assistive tech
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Language / Язык');
    [].forEach.call(toggle.querySelectorAll('button[data-lang]'), function (b) {
      var code = b.getAttribute('data-lang');
      b.setAttribute('aria-label', code === 'ru' ? 'Русский' : 'English');
      b.setAttribute('type', 'button');
      var sync = function () { b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'); };
      sync();
      new MutationObserver(sync).observe(b, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ---- keyboard access for interactive primitives ------- */
  function stampInteractive() {
    [].forEach.call(document.querySelectorAll('.hotspot, .mt-dot, .module-chip'), function (n) {
      if (!n.hasAttribute('tabindex')) n.setAttribute('tabindex', '0');
      if (!n.hasAttribute('role')) n.setAttribute('role', 'button');
    });
    [].forEach.call(document.querySelectorAll('.exp-card'), function (card) {
      if (card.dataset.a11y) return;
      card.dataset.a11y = '1';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      var sync = function () {
        card.setAttribute('aria-expanded', card.classList.contains('open') ? 'true' : 'false');
      };
      sync();
      new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['class'] });
    });
  }
  function initKeyboard() {
    stampInteractive();
    // primitives are re-rendered on language switch — restamp after
    var toggle = document.getElementById('langtoggle');
    if (toggle) toggle.addEventListener('click', function () { setTimeout(stampInteractive, 60); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var t = e.target;
      if (!t || !t.closest) return;
      var hit = t.closest('.hotspot, .mt-dot, .module-chip, .exp-card');
      if (!hit) return;
      e.preventDefault();
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  }

  /* ---- navigation (needs the manifest) ------------------ */
  function flatten(manifest) {
    var list = [];
    (manifest.categories || []).forEach(function (cat) {
      (cat.pages || []).forEach(function (pg) {
        list.push({ cat: cat, page: pg });
      });
    });
    return list;
  }
  function href(slug) {
    return BASE + slug + (slug.charAt(slug.length - 1) === '/' ? '' : '');
  }
  function pick(obj, lang) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || '';
  }

  function buildOverlay(manifest, here) {
    var overlay = el('div', { 'class': 'site-overlay', id: 'site-overlay', hidden: '', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Site index' });
    var close = el('button', { 'class': 'so-close', type: 'button' });
    var title = el('span', { 'class': 'so-title' });
    overlay.appendChild(el('div', { 'class': 'so-top' }, [title, close]));
    var cats = el('div', { 'class': 'so-cats' });
    overlay.appendChild(cats);
    document.body.appendChild(overlay);

    function render() {
      var lang = currentLang();
      close.textContent = (lang === 'ru' ? 'Закрыть' : 'Close') + ' ✕';
      title.textContent = pick(manifest.site && manifest.site.title, lang) || 'Aerospace';
      cats.textContent = '';

      (manifest.categories || []).forEach(function (cat) {
        var ul = el('ul');
        (cat.pages || []).forEach(function (pg) {
          var a = el('a', { href: href(pg.slug) }, [
            el('span', { 'class': 'cn', text: pg.codename || '' }),
            el('span', { 'class': 'cl', text: pick(pg.label, lang) })
          ]);
          if (here && pg.slug === here.page.slug) a.setAttribute('aria-current', 'page');
          ul.appendChild(el('li', null, [a]));
        });
        (cat.planned || []).forEach(function (pl) {
          ul.appendChild(el('li', { 'class': 'so-soon' }, [el('span', { 'class': 'np' }, [
            el('span', { 'class': 'cn', text: lang === 'ru' ? 'СКОРО' : 'SOON' }),
            el('span', { 'class': 'cl', text: pick(pl.label, lang) })
          ])]));
        });
        cats.appendChild(el('div', { 'class': 'so-cat' }, [el('h2', { text: pick(cat.title, lang) }), ul]));
      });

      if (manifest.external && manifest.external.length) {
        var eul = el('ul');
        manifest.external.forEach(function (x) {
          eul.appendChild(el('li', { 'class': 'so-ext' }, [el('a', { href: x.url, rel: 'external noopener', target: '_blank' }, [
            el('span', { 'class': 'cn', text: 'EXT↗' }),
            el('span', { 'class': 'cl', text: x.label })
          ])]));
        });
        cats.appendChild(el('div', { 'class': 'so-cat' }, [
          el('h2', { text: lang === 'ru' ? 'Внешние ресурсы' : 'External' }), eul
        ]));
      }
    }
    render();

    var btn = document.querySelector('.site-menu-btn');
    function setOpen(open) {
      overlay.hidden = !open;
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) close.focus(); else if (btn) btn.focus();
    }
    if (btn) btn.addEventListener('click', function () { setOpen(overlay.hidden); });
    close.addEventListener('click', function () { setOpen(false); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) setOpen(false); });
    var toggle = document.getElementById('langtoggle');
    if (toggle) toggle.addEventListener('click', function () { setTimeout(render, 60); });
  }

  function buildChrome(manifest) {
    var chrome = document.getElementById('chrome');
    if (!chrome) return;
    chrome.setAttribute('role', 'banner');

    // brand -> home link
    var brand = chrome.querySelector('.brand');
    if (brand && brand.tagName !== 'A') {
      var a = el('a', { 'class': 'brand', href: BASE, 'aria-label': 'Aerospace — home' });
      a.innerHTML = brand.innerHTML;
      brand.parentNode.replaceChild(a, brand);
    }

    // right-hand cluster: [menu button] [langtoggle]
    var actions = el('div', { 'class': 'chrome-actions' });
    var menuBtn = el('button', {
      'class': 'site-menu-btn', type: 'button',
      'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'site-overlay',
      text: 'Index'
    });
    var searchBtn = el('button', {
      'class': 'site-menu-btn site-search-btn', type: 'button',
      'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'site-search',
      'aria-keyshortcuts': '/', 'aria-label': 'Search'
    });
    // magnifier + label; the label hides on narrow screens (site.css) and the aria-label carries the name
    searchBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="6.5" cy="6.5" r="4.75" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 10l4.5 4.5" stroke="currentColor" stroke-width="1.6"/></svg><span class="ssb-t">Search</span>';
    actions.appendChild(searchBtn);
    actions.appendChild(menuBtn);
    var lt = document.getElementById('langtoggle');
    if (lt) actions.appendChild(lt);           // move existing toggle into the cluster
    chrome.appendChild(actions);
  }

  function buildPageNav(manifest, here) {
    if (!here) return;
    var lang = currentLang();
    var main = document.querySelector('main');
    if (!main) return;

    var siblings = here.cat.pages;
    var idx = siblings.indexOf(here.page);
    var prev = idx > 0 ? siblings[idx - 1] : null;
    var next = idx > -1 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

    var crumb = el('div', { 'class': 'pn-crumb' });
    crumb.appendChild(el('a', { href: BASE, text: 'Aerospace' }));
    crumb.appendChild(document.createTextNode('  /  ' + pick(here.cat.title, lang)));

    var links = el('div', { 'class': 'pn-links' });
    if (prev) links.appendChild(el('a', { 'class': 'pn-prev', href: href(prev.slug) }, [
      el('span', { 'class': 'pn-dir', text: '← Previous' }),
      el('span', { 'class': 'pn-t', text: (prev.codename ? prev.codename + ' — ' : '') + pick(prev.label, lang) })
    ]));
    if (next) links.appendChild(el('a', { 'class': 'pn-next', href: href(next.slug) }, [
      el('span', { 'class': 'pn-dir', text: 'Next →' }),
      el('span', { 'class': 'pn-t', text: (next.codename ? next.codename + ' — ' : '') + pick(next.label, lang) })
    ]));

    var nav = el('nav', { 'class': 'page-nav', 'aria-label': 'Within ' + pick(here.cat.title, 'en') }, [crumb, links]);
    if (main.nextSibling) main.parentNode.insertBefore(nav, main.nextSibling);
    else main.parentNode.appendChild(nav);
  }

  /* ---- search ------------------------------------------ */
  // Folds case, accents and ё so "Марс", "марс" and "Mars" behave the same way within each language.
  function fold(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е');
  }
  function buildSearch(manifest, here) {
    var lang = currentLang();
    var dlg = el('div', { 'class': 'site-overlay site-search', id: 'site-search', hidden: '', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ss-label' });
    var close = el('button', { 'class': 'so-close', type: 'button' });
    var label = el('label', { 'class': 'so-title', id: 'ss-label', 'for': 'ss-q' });
    var input = el('input', { id: 'ss-q', type: 'search', autocomplete: 'off', spellcheck: 'false',
      role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'ss-list', 'aria-autocomplete': 'list' });
    var status = el('p', { 'class': 'ss-status', role: 'status', 'aria-live': 'polite' });
    var list = el('ul', { 'class': 'ss-list', id: 'ss-list', role: 'listbox' });
    dlg.appendChild(el('div', { 'class': 'so-top' }, [label, close]));
    dlg.appendChild(el('div', { 'class': 'ss-body' }, [input, status, list]));
    document.body.appendChild(dlg);

    var extra = null, active = -1, hits = [];
    var all = flatten(manifest);
    function load() {
      if (extra) return Promise.resolve(extra);
      return fetch(SEARCH, { cache: 'default' }).then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; }).then(function (j) { extra = j; return j; });
    }
    function texts() {
      label.textContent = lang === 'ru' ? 'Поиск по справочнику' : 'Search the guides';
      close.textContent = (lang === 'ru' ? 'Закрыть' : 'Close') + ' ✕';
      input.setAttribute('placeholder', lang === 'ru' ? 'Марс, гравитационный манёвр, Хаббл…' : 'Mars, gravity assist, Hubble…');
    }
    function score(x, words) {
      var e = (extra && extra[x.page.slug]) || {};
      var title = fold([x.page.codename, pick(x.page.label, 'en'), pick(x.page.label, 'ru')].join(' '));
      var cat = fold(pick(x.cat.title, 'en') + ' ' + pick(x.cat.title, 'ru'));
      var heads = (e.h || []).concat(e.hr || []);
      var body = fold(e.d) + ' ' + fold(heads.join(' | '));
      var total = 0, snip = '';
      for (var i = 0; i < words.length; i++) {
        var w = words[i], s = 0;
        if (title.indexOf(w) > -1) s = 10;
        else if (cat.indexOf(w) > -1) s = 6;
        else if (body.indexOf(w) > -1) s = 2;
        if (!s) return null;               // every word has to match somewhere
        total += s;
        if (!snip) for (var j = 0; j < heads.length; j++) if (fold(heads[j]).indexOf(w) > -1) { snip = heads[j]; break; }
      }
      return { x: x, s: total, snip: snip };
    }
    function show(i) {
      var items = list.querySelectorAll('[role="option"]');
      [].forEach.call(items, function (n, k) { n.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      active = i;
      if (items[i]) { input.setAttribute('aria-activedescendant', items[i].id); if (items[i].scrollIntoView) items[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function run() {
      var q = fold(input.value).trim();
      var words = q.split(/\s+/).filter(Boolean);
      list.textContent = '';
      hits = !words.length ? [] : all.map(function (x) { return score(x, words); }).filter(Boolean)
        .sort(function (a, b) { return b.s - a.s; });
      hits.forEach(function (h, i) {
        var a = el('a', { href: href(h.x.page.slug), tabindex: '-1' }, [
          el('span', { 'class': 'cn', text: h.x.page.codename || '' }),
          el('span', { 'class': 'cl' }, [
            el('span', { 'class': 'ss-t', text: pick(h.x.page.label, lang) }),
            el('span', { 'class': 'ss-c', text: pick(h.x.cat.title, lang) + (h.snip ? ' · ' + h.snip : '') })
          ])
        ]);
        list.appendChild(el('li', { role: 'option', id: 'ss-o' + i, 'aria-selected': 'false' }, [a]));
      });
      status.textContent = !words.length ? '' : hits.length
        ? (lang === 'ru' ? 'Найдено: ' + hits.length : hits.length + (hits.length === 1 ? ' guide' : ' guides'))
        : (lang === 'ru' ? 'Ничего не найдено' : 'No guide matches');
      show(hits.length ? 0 : -1);
    }
    var btn = document.querySelector('.site-search-btn');
    function name() {
      if (!btn) return;
      var t = lang === 'ru' ? 'Поиск' : 'Search';
      btn.setAttribute('aria-label', t);
      var sp = btn.querySelector('.ssb-t'); if (sp) sp.textContent = t;
    }
    function setOpen(open) {
      dlg.hidden = !open;
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) { lang = currentLang(); texts(); input.focus(); input.select(); load().then(run); }
      else if (btn) btn.focus();
    }
    texts();
    if (btn) btn.addEventListener('click', function () { setOpen(dlg.hidden); });
    close.addEventListener('click', function () { setOpen(false); });
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); show(Math.min(active + 1, hits.length - 1)); }
      else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); show(Math.max(active - 1, 0)); }
      else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); location.href = href(hits[active].x.page.slug); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dlg.hidden) { setOpen(false); return; }
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (dlg.hidden && !typing && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k'))) { e.preventDefault(); setOpen(true); }
    });
    var toggle = document.getElementById('langtoggle');
    if (toggle) toggle.addEventListener('click', function () { setTimeout(function () { lang = currentLang(); name(); texts(); run(); }, 60); });
    name();
  }

  /* ---- see also ----------------------------------------- */
  function buildSeeAlso(manifest, here) {
    var nav = document.querySelector('.page-nav');
    if (!here || !nav) return;
    var bySlug = {};
    flatten(manifest).forEach(function (x) { bySlug[x.page.slug] = x; });
    fetch(RELATED, { cache: 'default' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (rel) {
      var list = (rel[here.page.slug] || []).map(function (s) { return bySlug[s]; }).filter(Boolean);
      if (!list.length) return;
      var head = el('h2', { 'class': 'sa-h', id: 'see-also' });
      var ul = el('ul', { 'class': 'sa-list' });
      var box = el('section', { 'class': 'see-also', 'aria-labelledby': 'see-also' }, [head, ul]);
      function render() {
        var lang = currentLang();
        head.textContent = lang === 'ru' ? 'См. также' : 'See also';
        ul.textContent = '';
        list.forEach(function (x) {
          ul.appendChild(el('li', null, [el('a', { href: href(x.page.slug) }, [
            el('span', { 'class': 'cn', text: x.page.codename || '' }),
            el('span', { 'class': 'cl', text: pick(x.page.label, lang) }),
            el('span', { 'class': 'sa-c', text: pick(x.cat.title, lang) })
          ])]));
        });
      }
      render();
      nav.insertBefore(box, nav.firstChild);
      var toggle = document.getElementById('langtoggle');
      if (toggle) toggle.addEventListener('click', function () { setTimeout(render, 60); });
    }).catch(function () {});
  }

  function structuredData(manifest, here) {
    var lang = currentLang();
    var url = location.origin + location.pathname;
    var blocks = [{
      "@context": "https://schema.org", "@type": "TechArticle",
      "headline": document.title,
      "inLanguage": lang,
      "isPartOf": { "@type": "WebSite", "name": pick(manifest.site && manifest.site.title, 'en') || 'Aerospace', "url": location.origin + BASE }
    }];
    if (here) {
      blocks.push({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Aerospace", "item": location.origin + BASE },
          { "@type": "ListItem", "position": 2, "name": pick(here.cat.title, 'en') },
          { "@type": "ListItem", "position": 3, "name": (here.page.codename ? here.page.codename + ' — ' : '') + pick(here.page.label, 'en'), "item": url }
        ]
      });
    }
    var s = el('script', { type: 'application/ld+json' });
    s.textContent = JSON.stringify(blocks);
    document.head.appendChild(s);
  }

  function initNav() {
    buildChrome();                                  // works even without the manifest
    fetch(MANIFEST, { cache: 'default' })
      .then(function (r) { if (!r.ok) throw new Error('manifest ' + r.status); return r.json(); })
      .then(function (manifest) {
        var slug = currentSlug();
        var here = flatten(manifest).filter(function (x) { return x.page.slug === slug || x.page.slug === slug + '/'; })[0] || null;
        buildOverlay(manifest, here);
        buildPageNav(manifest, here);
        buildSeeAlso(manifest, here);
        buildSearch(manifest, here);
        structuredData(manifest, here);
      })
      .catch(function () { /* navigation stays minimal; page is unaffected */ });
  }

  /* ---- boot -------------------------------------------- */
  function boot() {
    initLangPersistence();
    initKeyboard();
    initNav();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
