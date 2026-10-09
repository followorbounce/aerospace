"""Assemble a self-contained aerospace article: shared <head>/<style>/chrome from PARABOLA + per-article parts.
usage: assemble.py <dir with meta.json, body.html, extra.css, script.js> [out.html]
The output defaults to <repo>/<slug>.html."""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'parabola-mirrors-and-dishes.html')).read()
style = re.search(r'<style>\n(.*?)</style>', src, re.S).group(1)
style = style.replace(':root{--gold:#a8741a; --ray:#2f5aa1; --err:#b5452a;}\n', '')
d = sys.argv[1]; m = json.load(open(os.path.join(d, 'meta.json')))
body = open(os.path.join(d, 'body.html')).read()
extra = open(os.path.join(d, 'extra.css')).read() if os.path.exists(os.path.join(d, 'extra.css')) else ''
script = open(os.path.join(d, 'script.js')).read()
helpers = open(os.path.join(os.path.dirname(__file__), 'helpers.js')).read()
esc = lambda s: s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
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
<meta name="twitter:card" content="summary">
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

<a class="skip-link" href="#hero">Skip to content</a>
<div id="progress"></div>

<div id="chrome">
  <div class="brand">{m['brand']}</div>
  <div id="langtoggle">
    <button data-lang="en" class="active">EN</button>
    <button data-lang="ru">RU</button>
  </div>
</div>

<div id="hud">
  <div class="hud-row"><span class="hud-label"><span class="hud-dot"></span>PHASE</span><span id="hud-phase">{m['phase0']}</span></div>
  <div class="hud-row"><span class="hud-label">{m['hud1']}</span><span id="hud-alt">—</span></div>
  <div class="hud-row"><span class="hud-label">{m['hud2']}</span><span id="hud-vel">—</span></div>
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
dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, m['slug'] + '.html')
open(dest, 'w').write(out)
print('wrote', dest, len(out.splitlines()), 'lines')
