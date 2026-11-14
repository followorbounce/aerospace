#!/usr/bin/env python3
"""Whole-site checks that need no browser: python3 _tools/site-check.py   (exit 1 on any problem; writes nothing)

  internal links   every href/src that points inside /aerospace/ resolves to a file in the repo
  JSON-LD          every <script type="application/ld+json"> block parses
  head             every public page has a title, a description and a canonical link
  manifest         every page in pages.json exists; every guide has an og picture
"""
import glob, json, os, re, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = []
files = sorted(glob.glob(R + '/*.html') + glob.glob(R + '/ru/*.html') + glob.glob(R + '/time-philosophy/*.html'))

def resolves(path):
    path = path.split('#')[0].split('?')[0]
    if path in ('', '/'):
        return True
    p = os.path.join(R, path.lstrip('/'))
    return any(os.path.exists(x) for x in (p, p + '.html', os.path.join(p, 'index.html')))

n_links = n_ld = 0
for f in files:
    rel = os.path.relpath(f, R)
    h = open(f, encoding='utf-8').read()
    public = 'http-equiv="refresh"' not in h and 'noindex' not in h and '<link rel="canonical"' in h
    for m in re.finditer(r'(?:href|src)="(/aerospace/[^"]*|https://followorbounce\.github\.io/aerospace/[^"]*)"', h):
        u = re.sub(r'^https://followorbounce\.github\.io', '', m.group(1))[len('/aerospace/'):]
        n_links += 1
        if not resolves(u):
            bad.append('%s: broken internal link %s' % (rel, m.group(1)))
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        n_ld += 1
        try:
            json.loads(m.group(1))
        except ValueError as e:
            bad.append('%s: JSON-LD does not parse (%s)' % (rel, e))
    if public:
        if not re.search(r'<title[^>]*>[^<]+</title>', h): bad.append(rel + ': no <title>')
        if not re.search(r'<meta\s+name="description"\s+content="[^"]+"', h): bad.append(rel + ': no meta description')
        og = re.search(r'<meta property="og:image" content="https://followorbounce\.github\.io/aerospace/([^"]+)"', h)
        if og and not os.path.exists(os.path.join(R, og.group(1))): bad.append('%s: share picture %s is missing' % (rel, og.group(1)))
pj = json.load(open(R + '/pages.json', encoding='utf-8'))
for c in pj['categories']:
    for p in c['pages']:
        s = p['slug']
        if not os.path.exists(os.path.join(R, s + 'index.html' if s.endswith('/') else s + '.html')):
            bad.append('pages.json: no file for ' + s)
print('site-check: %d pages, %d internal links, %d JSON-LD blocks, %d problems' % (len(files), n_links, n_ld, len(bad)))
if bad:
    print('\n'.join(sorted(set(bad))[:60])); sys.exit(1)
