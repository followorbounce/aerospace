#!/usr/bin/env python3
"""Russian edition: one static page per guide at /aerospace/ru/<slug> (+ /aerospace/ru/ for the index).

  python3 _tools/ru_pages.py [--check]

Every guide holds both languages: elements carry data-en and data-ru, and the page's applyLang() swaps their
innerHTML. Search engines only saw the English, so this writes ru/<slug>.html from <slug>.html doing at build time
what applyLang('ru') does in the browser (outermost [data-en][data-ru] element's content := its data-ru), and:
  <html lang="ru" data-edition="ru">, the RU toggle button active, title/description/og in Russian
  (title = pages.json Russian label + site title; description = the hero lede's data-ru), canonical = itself,
  hreflang en / ru / x-default on both editions (the English page gets them between <!-- hreflang --> markers),
  links to /aerospace/<slug> pointing at the Russian edition, no copied JSON-LD or share-image tags
  (engine/structured_data.py and engine/og_cards.py in followorbounce.github.io write the edition's own).
assets/site.js does the rest at runtime: on data-edition pages it runs the page's own RU handler so script-drawn
text is Russian too, keeps navigation inside the edition, and turns the EN/RU toggle into a link between editions.
Run after assemble.py/wire.py and after editing a hand-authored guide; ru/ is generated, never edit it.
--check reports pages whose Russian copy is missing or out of date.
"""
import html, json, os, re, sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = 'https://followorbounce.github.io/aerospace/'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
INDEX_DESC_RU = ('Независимая двуязычная коллекция интерактивных технических справочников по истории и инженерии космонавтики: '
                 'орбитальные станции, межпланетные зонды, исследование Луны и Марса, космические телескопы и пилотируемые полёты.')
HL_START, HL_END = '<!-- hreflang -->', '<!-- /hreflang -->'


class Spans(HTMLParser):
    """Source offsets of the inner content of every outermost element that has both data-en and data-ru."""

    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src, self.stack, self.spans = src, [], []
        self.lines = [0]
        for line in src.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))

    def off(self):
        ln, col = self.getpos()
        return self.lines[ln - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        a = dict(attrs)
        start = self.off() + len(self.get_starttag_text())
        inside = any(s[2] is not None for s in self.stack)
        ru = a.get('data-ru') if ('data-en' in a and 'data-ru' in a and not inside) else None
        self.stack.append((tag, start, ru))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                t, start, ru = self.stack[i]
                del self.stack[i:]
                if ru is not None:
                    self.spans.append((start, self.off(), ru))
                return


def manifest():
    m = json.load(open(os.path.join(ROOT, 'pages.json'), encoding='utf-8'))
    labels = {p['slug']: p for c in m['categories'] for p in c['pages']}
    return m['site'], labels


def clip(text, n=200):
    text = re.sub(r'\s+', ' ', text).strip()
    return text if len(text) <= n else text[:n - 1].rsplit(' ', 1)[0].rstrip(',;:—-') + '…'


def plain(fragment):
    return html.unescape(re.sub(r'<[^>]+>', ' ', fragment))


def hreflang(en_url, ru_url):
    return (HL_START + '\n<link rel="alternate" hreflang="en" href="%s">\n<link rel="alternate" hreflang="ru" href="%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s">\n' % (en_url, ru_url, en_url) + HL_END + '\n')


def set_meta(h, attr, name, value):
    pat = r'(<meta %s="%s" content=")[^"]*(">)' % (attr, re.escape(name))
    return re.sub(pat, lambda m: m.group(1) + html.escape(value, quote=True) + m.group(2), h, count=1)


def russian(src, slug, site, label, slugs):
    """The Russian edition of one page's source."""
    p = Spans(src)
    p.feed(src)
    p.close()
    out, last = [], 0
    for start, end, ru in sorted(p.spans):
        out += [src[last:start], ru]               # the parser already unescaped the attribute: this is the HTML applyLang sets
        last = end
    h = ''.join(out) + src[last:]

    en_url = SITE + (slug if slug else '')
    ru_url = SITE + 'ru/' + (slug if slug else '')
    if slug:
        t_ru = '%s — %s' % (label['label']['ru'], site['title']['ru']) if label else None
    else:
        t_ru = site['title']['ru']
    if not t_ru:
        t = re.search(r'<title>(.*?)</title>', src, re.S).group(1)
        t_ru = html.unescape(t.split(' / ', 1)[-1])
    lede = re.search(r'<(?:p|div)[^>]*class="[^"]*\blede\b[^"]*"[^>]*\bdata-ru="([^"]*)"', src) or \
        re.search(r'<p[^>]*\bdata-ru="([^"]{80,})"', src)
    desc = clip(plain(html.unescape(lede.group(1)))) if lede else t_ru
    if not slug:                                   # the index has no hero lede: its English description, in Russian
        desc = INDEX_DESC_RU

    h = re.sub(r'<html lang="[^"]*"', '<html lang="ru" data-edition="ru"', h, count=1)
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % html.escape(t_ru, quote=False), h, count=1, flags=re.S)
    h = set_meta(h, 'name', 'description', desc)
    h = set_meta(h, 'property', 'og:title', t_ru)
    h = set_meta(h, 'property', 'og:description', desc)
    h = set_meta(h, 'property', 'og:url', ru_url)
    h = set_meta(h, 'property', 'og:locale', 'ru_RU')
    h = set_meta(h, 'property', 'og:locale:alternate', 'en_US')
    h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % ru_url, h, count=1)
    h = re.sub(re.escape(HL_START) + r'[\s\S]*?' + re.escape(HL_END) + r'\n?', '', h)
    h = re.sub(r'<!-- fob-ld -->[\s\S]*?<!-- /fob-ld -->\n?', '', h)        # structured_data.py writes the edition's own
    h = re.sub(r'<meta (?:property="og:image[^"]*"|name="twitter:(?:card|image)") content="[^"]*">\n?', '', h)  # og_cards.py
    h = h.replace('</head>', hreflang(en_url, ru_url) + '</head>', 1)
    # the toggle starts on RU
    h = re.sub(r'(<button[^>]*data-lang="en"[^>]*class=")([^"]*)\bactive\b', r'\1\2', h)
    h = re.sub(r'(<button[^>]*class=")([^"]*)\bactive\b([^"]*)("[^>]*data-lang="en")', r'\1\2\3\4', h)
    def ru_on(m):
        tag = m.group(0)
        c = re.search(r'class="([^"]*)"', tag)
        if c:
            return tag if re.search(r'\bactive\b', c.group(1)) else tag.replace(c.group(0), 'class="%s"' % (c.group(1) + ' active').strip(), 1)
        return tag[:-1] + ' class="active">'
    h = re.sub(r'<button[^>]*data-lang="ru"[^>]*>', ru_on, h, count=1)
    # links between guides stay in the edition
    h = re.sub(r'href="/aerospace/([a-z0-9-]*)(["#])', lambda m: 'href="/aerospace/ru/%s%s' % (m.group(1), m.group(2))
               if (m.group(1) in slugs or m.group(1) == '') else m.group(0), h)
    return h, len(p.spans)


def english(src, slug):
    """The English page with its hreflang block (idempotent)."""
    en_url, ru_url = SITE + slug, SITE + 'ru/' + slug
    h = re.sub(re.escape(HL_START) + r'[\s\S]*?' + re.escape(HL_END) + r'\n?', '', src)
    return h.replace('</head>', hreflang(en_url, ru_url) + '</head>', 1)


def main():
    check = '--check' in sys.argv
    site, labels = manifest()
    slugs = [s for s in labels if os.path.exists(os.path.join(ROOT, s + '.html'))]
    os.makedirs(os.path.join(ROOT, 'ru'), exist_ok=True)
    stale, n_el = [], 0
    for slug in [''] + slugs:
        f = os.path.join(ROOT, (slug or 'index') + '.html')
        src = open(f, encoding='utf-8').read()
        if 'data-ru=' not in src:
            continue
        en = english(src, slug)
        ru, n = russian(en, slug, site, labels.get(slug), set(slugs))
        n_el += n
        target = os.path.join(ROOT, 'ru', (slug or 'index') + '.html')
        old = open(target, encoding='utf-8').read() if os.path.exists(target) else None
        if check:
            if en != src or (old is None or re.sub(r'<!-- fob-ld -->[\s\S]*?<!-- /fob-ld -->\n?|<meta (?:property="og:image[^"]*"|name="twitter:(?:card|image)") content="[^"]*">\n?', '', old) != ru):
                stale.append(slug or 'index')
            continue
        if en != src:
            open(f, 'w', encoding='utf-8').write(en)
        # keep what the network scripts added to the edition (JSON-LD, share image) when nothing else changed
        keep = old if old and re.sub(r'<!-- fob-ld -->[\s\S]*?<!-- /fob-ld -->\n?|<meta (?:property="og:image[^"]*"|name="twitter:(?:card|image)") content="[^"]*">\n?', '', old) == ru else ru
        open(target, 'w', encoding='utf-8').write(keep)
    if check:
        print('stale or missing Russian pages: %s' % (', '.join(stale) or 'none'))
        sys.exit(1 if stale else 0)
    print('Russian edition: %d pages, %d translated elements' % (len(slugs) + 1, n_el))


if __name__ == '__main__':
    main()
