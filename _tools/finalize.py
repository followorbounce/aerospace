#!/usr/bin/env python3
"""Put the shared blocks (hreflang, analytics, JSON-LD, network footer) in their fixed slots on hand-made pages.

  python3 _tools/finalize.py [--check] [--touch <slug> ...]

Generated guides get the blocks from assemble.py and the Russian edition from ru_pages.py; this covers every other
public page at the repo root and in time-philosophy/. It rewrites a page only when its bytes change.
--touch <slug> sets that page's "modified" date in dates.json to today (and "published" if it has none) before
writing: use it when a guide's content changes; a new guide gets its dates this way too. Then run ru_pages.py.
--check reports pages whose blocks are missing, stale or out of place, and writes nothing.
"""
import datetime, glob, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import blocks

def main():
    args = sys.argv[1:]
    check = '--check' in args
    touch = [a for a in args if not a.startswith('--')]
    if touch and '--touch' not in args:
        print(__doc__.strip()); sys.exit(2)
    today = datetime.date.today().isoformat()
    for slug in touch:
        for rel in (slug + '.html', 'ru/' + slug + '.html'):
            if os.path.exists(os.path.join(blocks.ROOT, rel)) or rel.startswith('ru/'):
                d = blocks.dates().setdefault(rel, {})
                d.setdefault('published', today); d['modified'] = today
    if touch:
        blocks.save_dates()
    bad, wrote = [], []
    files = sorted(glob.glob(os.path.join(blocks.ROOT, '*.html')) + glob.glob(os.path.join(blocks.ROOT, 'time-philosophy', '*.html')))
    for f in files:
        rel = os.path.relpath(f, blocks.ROOT)
        h = open(f, encoding='utf-8').read()
        n = blocks.place(h, rel)
        if n != h:
            (bad if check else wrote).append(rel)
            if not check:
                open(f, 'w', encoding='utf-8').write(n)
    if check:
        print('pages with stale or misplaced blocks: %s' % (', '.join(bad) or 'none')); sys.exit(1 if bad else 0)
    print('finalize: %d pages checked, %d rewritten%s' % (len(files), len(wrote), (': ' + ', '.join(wrote)) if wrote else ''))

if __name__ == '__main__':
    main()
