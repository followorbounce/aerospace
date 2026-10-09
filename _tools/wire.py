"""wire.py slug codename label_en label_ru cat_id llms_line [cat_title_en cat_title_ru before_cat_id]"""
import json, sys, re, html, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
slug, code, en, ru, cat, llms = sys.argv[1:7]
newcat = sys.argv[7:10] if len(sys.argv) > 7 else None
# pages.json — text insertion, keeping the file's compact hand formatting
pj = json.load(open(R + 'pages.json'))
cats = pj['categories']
c = next((x for x in cats if x['id'] == cat), None)
txtp = open(R + 'pages.json').read()
J = lambda v: json.dumps(v, ensure_ascii=False)
line = '        { "slug": %s, "codename": %s, "label": { "en": %s, "ru": %s } }' % (J(slug), J(code), J(en), J(ru))
if '"slug": %s' % J(slug) not in txtp:
    if c is None:
        ten, tru, before = newcat
        block = '    {\n      "id": %s,\n      "title": { "en": %s, "ru": %s },\n      "pages": [\n%s\n      ]\n    },\n' % (J(cat), J(ten), J(tru), line)
        k = txtp.index('    {\n      "id": %s' % J(before))
        txtp = txtp[:k] + block + txtp[k:]
        c = {'id': cat, 'title': {'en': ten, 'ru': tru}}
        cats.insert(next(i for i, x in enumerate(cats) if x['id'] == before), c)
    else:
        k = txtp.index('"id": %s' % J(cat)); e = txtp.index('\n      ]', k)
        txtp = txtp[:e] + ',\n' + line + txtp[e:]
    json.loads(txtp)  # still valid
    open(R + 'pages.json', 'w').write(txtp)
# index.html
ix = open(R + 'index.html').read()
li = f'        <li><a href="/aerospace/{slug}"><span class="cn">{code}</span><span class="cl" data-en="{html.escape(en)}" data-ru="{html.escape(ru)}">{html.escape(en)}</span></a></li>\n'
if f'href="/aerospace/{slug}"' not in ix:
    m = re.search(r'(<div class="hub-cat" data-cat="%s">.*?<ul>\n)(.*?)(      </ul>)' % re.escape(cat), ix, re.S)
    if m is None:
        ten, tru, before = newcat
        block = f'''    <div class="hub-cat" data-cat="{cat}">
      <h2 data-en="{html.escape(ten)}" data-ru="{html.escape(tru)}">{html.escape(ten)}</h2>
      <ul>
{li}      </ul>
    </div>

'''
        k = ix.index(f'    <div class="hub-cat" data-cat="{before}">')
        ix = ix[:k] + block + ix[k:]
    else:
        ix = ix[:m.end(2)] + li + ix[m.end(2):]
    open(R + 'index.html', 'w').write(ix)
# llms.txt
ll = open(R + 'llms.txt').read()
line = f'- [{en}](https://followorbounce.github.io/aerospace/{slug}): {llms}\n'
if f'/aerospace/{slug})' not in ll:
    title = c['title']['en']
    m = re.search(r'## %s\n\n((?:- .*\n)+)' % re.escape(title), ll)
    if m is None:
        ten, tru, before = newcat
        btitle = next(x for x in cats if x['id'] == before)['title']['en']
        k = ll.index('## ' + btitle)
        ll = ll[:k] + f'## {ten}\n\n{line}\n' + ll[k:]
    else:
        ll = ll[:m.end(1)] + line + ll[m.end(1):]
    open(R + 'llms.txt', 'w').write(ll)
# sitemap.xml is regenerated from pages.json by the repo's GitHub Action (.github/workflows/sitemap.yml) — don't edit it
print('wired', slug)
