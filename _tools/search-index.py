#!/usr/bin/env python3
"""Write /aerospace/search.json (what the site search looks through) and check related.json.

  python3 _tools/search-index.py

For every guide in pages.json: its meta description and its chapter headings (EN and RU, from the
h2 data-en / data-ru attributes). Labels, codenames and category titles are read from pages.json by
the page itself, so they are not repeated here. Also fails if related.json names a slug that is not
in pages.json, or a guide has fewer than 3 related links. wire.py runs this after adding a guide.
"""
import html, json, os, re, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
pj = json.load(open(R + 'pages.json'))
slugs = [p['slug'] for c in pj['categories'] for p in c['pages']]


def page_file(slug):
    return R + (slug + 'index.html' if slug.endswith('/') else slug + '.html')


out = {}
for s in slugs:
    f = page_file(s)
    if not os.path.exists(f):
        sys.exit('missing page for ' + s)
    t = open(f, encoding='utf-8').read()
    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', t)
    en, ru = [], []
    for h in re.findall(r'<h2\b[^>]*>', t):
        a = re.search(r'data-en="([^"]*)"', h); b = re.search(r'data-ru="([^"]*)"', h)
        if a: en.append(html.unescape(a.group(1)))
        if b: ru.append(html.unescape(b.group(1)))
    out[s] = {'d': html.unescape(m.group(1)) if m else '', 'h': en, 'hr': ru}

open(R + 'search.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n')

rel = json.load(open(R + 'related.json'))
bad = []
for k, v in rel.items():
    if k.startswith('_'):
        continue
    if k not in slugs:
        bad.append('related.json key not in pages.json: ' + k)
    bad += ['%s -> unknown %s' % (k, x) for x in v if x not in slugs]
    if k in v:
        bad.append(k + ' links to itself')
bad += ['no related links: ' + s for s in slugs if len(rel.get(s, [])) < 3]
print('search.json: %d guides, %d KB' % (len(out), os.path.getsize(R + 'search.json') // 1024))
if bad:
    print('\n'.join(bad)); sys.exit(1)
print('related.json OK')
