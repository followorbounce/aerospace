"""Assemble a self-contained aerospace article: shared <head>, base.css and chrome + per-article parts.
usage: assemble.py <dir with meta.json, body.html, extra.css, script.js> [out.html] [--og]
The output defaults to <repo>/<slug>.html. The page comes out complete: blocks.place() writes the hreflang, analytics,
JSON-LD and network-footer blocks in their fixed slots, so a rebuild of an unchanged guide is byte-identical to the
committed page (check-all.sh relies on that). --og also renders the share picture through engine/og_cards.py in the
followorbounce.github.io repo; that is a coordinator step, never something a guide author runs."""
import json, re, subprocess, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import blocks
ROOT = os.path.dirname(HERE)
OG = '--og' in sys.argv
sys.argv = [a for a in sys.argv if a != '--og']
style = open(os.path.join(HERE, 'base.css'), encoding='utf-8').read()      # the shared guide CSS (was read live from PARABOLA)
d = sys.argv[1]; m = json.load(open(os.path.join(d, 'meta.json')))
body = open(os.path.join(d, 'body.html')).read()
extra = open(os.path.join(d, 'extra.css')).read() if os.path.exists(os.path.join(d, 'extra.css')) else ''
script = open(os.path.join(d, 'script.js')).read()
helpers = open(os.path.join(os.path.dirname(__file__), 'helpers.js')).read()
esc = lambda s: s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
# HUD labels: meta.json 'hud1'/'hud2' (English) with optional 'hud1_ru'/'hud2_ru'; without a Russian label it stays as before
hudlab = lambda m, k: ('<span data-en="%s" data-ru="%s">%s</span>' % (esc(m[k]), esc(m[k + '_ru']), m[k])) if m.get(k + '_ru') else m[k]
url = 'https://followorbounce.github.io/aerospace/' + m['slug']
title = m['title_en'] + ' / ' + m['title_ru']
out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(m['description'])}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#f6f6f2">
<link rel="icon" href="/aerospace/assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(m['og'])}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Aerospace Knowledge Hub">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="ru_RU">
<meta property="og:image" content="{url.replace("/aerospace/", "/aerospace/og/")}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{url.replace("/aerospace/", "/aerospace/og/")}.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/aerospace/assets/site.css">
<style>
{m.get('root_css','')}
{style}{extra}</style>
<script src="/aerospace/assets/site.js" defer></script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "bba4e16a7d9b4d9985eda0cda2624e60"}}'></script>
</head>
<body>

<a class="skip-link" href="#hero" data-en="Skip to content" data-ru="Перейти к содержанию">Skip to content</a>
<div id="progress"></div>

<div id="chrome">
  <div class="brand">{m['brand']}</div>
  <div id="langtoggle">
    <button data-lang="en" class="active">EN</button>
    <button data-lang="ru">RU</button>
  </div>
</div>

<div id="hud">
  <div class="hud-row"><span class="hud-label"><span class="hud-dot"></span><span data-en="PHASE" data-ru="ЭТАП">PHASE</span></span><span id="hud-phase">{m['phase0']}</span></div>
  <div class="hud-row"><span class="hud-label">{hudlab(m, 'hud1')}</span><span id="hud-alt">—</span></div>
  <div class="hud-row"><span class="hud-label">{hudlab(m, 'hud2')}</span><span id="hud-vel">—</span></div>
</div>

<main>
{body}
</main>

<script>
(function(){{
"use strict";
{helpers}
{script}
}})();
</script>
</body>
</html>
'''
out = blocks.place(out, m['slug'] + '.html')
dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, m['slug'] + '.html')
open(dest, 'w').write(out)
print('wrote', dest, len(out.splitlines()), 'lines')
if OG:
    og_pass = os.path.join(ROOT, '..', 'followorbounce.github.io', 'engine', 'og_cards.py')
    if os.path.exists(og_pass):
        subprocess.run([sys.executable, og_pass, 'aerospace', '--only', m['slug']])
