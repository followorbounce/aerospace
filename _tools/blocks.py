"""The blocks every public page carries outside its own content, owned by this repo and written in fixed slots:

  before </head>, in this order:  <!-- hreflang -->   EN / RU / x-default alternates (pages that have a Russian edition)
                                  <!-- fob-ga -->     the Google Analytics tag
                                  <!-- fob-ld -->     schema.org JSON-LD (Article + BreadcrumbList; WebSite on the index)
  before </body>:                 <!-- fob-network --> the "More from Follow or Bounce" footer (blocks/network-<lang>.html)

place(html, rel) removes the four blocks wherever they are and writes them back in those slots, so it is idempotent
and a page comes out the same no matter which script touched it last. assemble.py (generated guides), ru_pages.py
(the Russian edition) and finalize.py (hand-made pages) all call it; nothing else should write these blocks.

Dates in the JSON-LD come from dates.json ({"<rel path>": {"published": "YYYY-MM-DD", "modified": "YYYY-MM-DD"}}),
never from git: a page's output must not depend on when it was committed. finalize.py --touch <slug> sets "modified".
The followorbounce.github.io scripts (engine/og_cards.py, engine/structured_data.py) used to write these blocks;
they now only render share pictures for this site.
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = 'https://followorbounce.github.io/aerospace/'
GA_ID = 'G-CE86H6X7Z7'
NET = {'@type': 'Organization', 'name': 'Follow or Bounce', 'url': 'https://followorbounce.github.io/'}
W, H = 1200, 630

RX = {
    'hreflang': re.compile(r'<!-- hreflang -->[\s\S]*?<!-- /hreflang -->\n?'),
    'ga': re.compile(r'[ \t]*<!-- fob-ga -->[\s\S]*?<!-- /fob-ga -->\n?'),
    'ld': re.compile(r'<!-- fob-ld -->[\s\S]*?<!-- /fob-ld -->\n?'),
    'network': re.compile(r'[ \t]*<!-- fob-network -->[\s\S]*?<!-- /fob-network -->\n?'),
}
OG_TAGS = re.compile(r'[ \t]*<meta (?:property="og:image(?::[a-z]+)?"|name="twitter:(?:card|image)")[^>]*>\n?')
U = html.unescape
_dates = None


def dates():
    global _dates
    if _dates is None:
        p = os.path.join(HERE, 'dates.json')
        _dates = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    return _dates


def save_dates():
    with open(os.path.join(HERE, 'dates.json'), 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(dates().items())), f, ensure_ascii=False, indent=0)
        f.write('\n')


def meta(h, attr, name):
    m = re.search(r'<meta %s="%s" content="([^"]*)"' % (attr, re.escape(name)), h)
    return U(m.group(1)) if m else ''


def canonical(h):
    m = re.search(r'<link rel="canonical" href="([^"]+)"', h)
    return m.group(1) if m else ''


def title(h):
    m = re.search(r'<title>(.*?)</title>', h, re.S)
    return U(m.group(1)).strip() if m else ''


def is_public(h):
    """Redirect stubs, noindex pages and pages without a canonical carry none of the blocks."""
    return bool(canonical(h)) and 'http-equiv="refresh"' not in h and not re.search(r'name="robots" content="[^"]*noindex', h)


def slug_of(rel):
    s = rel[:-5] if rel.endswith('.html') else rel
    if s.startswith('ru/'):
        s = s[3:]
    return '' if s == 'index' else s


def has_edition(rel):
    """True when the page has a Russian twin at ru/<slug>.html (or is that twin)."""
    if rel.startswith('ru/'):
        return True
    s = slug_of(rel)
    if '/' in s:
        return False
    src = os.path.join(ROOT, (s or 'index') + '.html')
    return os.path.exists(src) and 'data-ru=' in open(src, encoding='utf-8').read() and s in edition_slugs()


_slugs = None


def edition_slugs():
    global _slugs
    if _slugs is None:
        m = json.load(open(os.path.join(ROOT, 'pages.json'), encoding='utf-8'))
        _slugs = {''} | {p['slug'] for c in m['categories'] for p in c['pages'] if os.path.exists(os.path.join(ROOT, p['slug'] + '.html'))}
    return _slugs


def hreflang_block(rel):
    s = slug_of(rel)
    en, ru = SITE + s, SITE + 'ru/' + s
    return ('<!-- hreflang -->\n<link rel="alternate" hreflang="en" href="%s">\n<link rel="alternate" hreflang="ru" href="%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s">\n<!-- /hreflang -->\n' % (en, ru, en))


def ga_block():
    return ('<!-- fob-ga --><script async src="https://www.googletagmanager.com/gtag/js?id=%s"></script>\n'
            "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','%s');</script>"
            '<!-- /fob-ga -->\n' % (GA_ID, GA_ID))


def crumbs(*trail):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(trail)]}


def ld_items(rel, h):
    canon = canonical(h)
    ru = rel.startswith('ru/')
    home = SITE + ('ru/' if ru else '')
    site = 'Аэрокосмический справочник' if ru else 'Aerospace Knowledge Hub'
    if canon.rstrip('/') == home.rstrip('/'):
        return [{'@type': 'WebSite', 'name': site, 'url': home, 'inLanguage': 'ru' if ru else 'en', 'publisher': NET}]
    t = meta(h, 'property', 'og:title') or title(h)
    head = re.split(r'\s+/\s+', t)[0].strip()               # "BOUNCE — MARS PATHFINDER & SOJOURNER / «…»" -> English half
    head = re.sub(r'\s*[—|-]\s*(Aerospace Knowledge Hub|Аэрокосмический справочник)$', '', head)
    art = {'@type': 'Article', 'headline': head[:110], 'description': meta(h, 'name', 'description'), 'url': canon,
           'mainEntityOfPage': canon, 'image': meta(h, 'property', 'og:image'), 'author': NET, 'publisher': NET,
           'inLanguage': 'ru' if ru else 'en', 'isPartOf': {'@type': 'WebSite', 'name': site, 'url': home}}
    d = dates().get(rel)
    if d and d.get('published'):
        art.update(datePublished=d['published'], dateModified=d.get('modified') or d['published'])
    return [art, crumbs((site, home), (head, canon))]


def ld_block(rel, h):
    return '<!-- fob-ld -->\n' + ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(
        dict({'@context': 'https://schema.org'}, **it), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        for it in ld_items(rel, h)) + '<!-- /fob-ld -->\n'


def network_block(ru):
    return open(os.path.join(HERE, 'blocks', 'network-%s.html' % ('ru' if ru else 'en')), encoding='utf-8').read()


def strip(h):
    """The page without any of the four blocks."""
    for rx in RX.values():
        h = rx.sub('', h)
    return h


def place(h, rel):
    """The page with its blocks in their fixed slots (idempotent). Pages that are not public are returned unchanged."""
    if not is_public(h) or '</head>' not in h:
        return h
    h = strip(h)
    head = (hreflang_block(rel) if has_edition(rel) else '') + ga_block() + ld_block(rel, h)
    h = h.replace('</head>', head + '</head>', 1)
    i = h.lower().rindex('</body>')
    return h[:i] + network_block('data-edition="ru"' in h) + h[i:]


def share_tags(h, img, alt):
    """og:image (+ size, alt) and twitter card tags after the page's last og:/twitter: tag, as the card script placed them."""
    block = ('<meta property="og:image" content="%s">\n<meta property="og:image:width" content="%d">\n'
             '<meta property="og:image:height" content="%d">\n<meta property="og:image:alt" content="%s">\n'
             '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="%s">\n'
             % (img, W, H, html.escape(alt, quote=True), img))
    h = OG_TAGS.sub('', h)
    last = None
    for m in re.finditer(r'<meta (?:property="og:[a-z:_]+"|name="twitter:[a-z:]+")[^>]*>\n?', h):
        last = m
    if last and h[last.end() - 1] == '\n':
        return h[:last.end()] + block + h[last.end():]
    i = h.lower().index('</head>')
    return h[:i] + block + h[i:]
