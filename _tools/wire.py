"""Retired 2026-11-14. Wiring a guide into the site is no longer a set of insertions into pages.json, index.html and llms.txt."""
import sys
sys.exit("""wire.py is retired. To add or change a guide:
  1. put codename, label {en, ru}, llms, related and freshness in the guide's meta.json
     (_tools/articles/<slug>/ for a generated guide, _tools/handmade/<slug>/ otherwise)
  2. add the slug to its category in _tools/site.json (the position there is the display order)
  3. python3 _tools/finalize.py --touch <slug> && python3 _tools/build-site.py
See "Adding a guide" in _tools/README.md.""")
