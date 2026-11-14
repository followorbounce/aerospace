#!/bin/bash
# check-all.sh [slug...] : the whole test suite. Exit status is non-zero if anything drifts, errors or fails.
#   generated guides (_tools/articles/<slug>/)   rebuild into a temp file, require it to match the committed page byte for
#                                                 byte, then run the jsdom smoke test + the guide's numerical checks
#   hand-made guides with _tools/handmade/<slug>/checks.js   smoke test + checks against the committed page
#   every other guide in pages.json               smoke test only (script errors, broken bilingual attributes, missing RU)
#   citations                                     the highest [n] in a page must not exceed its reference count
#   whole-site (only when no slug is given)       finalize.py --check, ru_pages.py --check, search-index.py --check, site-check.py
# Pages run in parallel (JOBS, default 4); output is printed in a stable order.
D=$(cd "$(dirname "$0")"; pwd); REPO=$(dirname "$D"); TMP=$(mktemp -d); JOBS=${JOBS:-4}
OKLINE='"errors":\[\],"brokenAttrs":0,"offStep":\[\],"missingRu":0'
one() {
  s=$1; out=$TMP/$(echo "$s" | tr / _).out; bad=0
  cites() { echo "$1" | head -1 | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.exit(j.refs>0&&j.maxCite>j.refs?1:0)}catch(e){process.exit(0)}})'; }
  {
  if [ -d "$D/articles/$s" ]; then
    A=$D/articles/$s; echo "== $s"
    if python3 "$D/assemble.py" "$A" "$TMP/$s.html" >/dev/null 2>"$TMP/$s.err"; then
      cmp -s "$TMP/$s.html" "$REPO/$s.html" || { echo "DRIFT $s (committed page differs from its source; rebuild with assemble.py)"; bad=1; }
      hook=$(grep -o 'window\.__[A-Za-z0-9_]* *=' "$A/script.js" | head -1 | sed 's/window\.//; s/ *=//')
      r=$(cd "$D" && node test.js "$TMP/$s.html" "$hook" "$A/checks.js" 2>&1); echo "$r" | sed 's/^/   /'
    else echo "BUILD-FAIL $s"; sed 's/^/   /' "$TMP/$s.err"; r=''; bad=1; fi
  elif [ -d "$D/handmade/$s" ] && [ -f "$D/handmade/$s/checks.js" ]; then
    H=$D/handmade/$s; echo "== $s (hand-made)"
    hook=$(grep -o 'window\.__[A-Za-z0-9_]* *=' "$REPO/$s.html" | head -1 | sed 's/window\.//; s/ *=//')
    r=$(cd "$D" && node test.js "$REPO/$s.html" "$hook" "$H/checks.js" 2>&1); echo "$r" | sed 's/^/   /'
  else
    echo "== $s (smoke)"
    r=$(cd "$D" && node test.js "$REPO/$s.html" 2>&1 | head -1); echo "$r" | sed 's/^/   /'
  fi
  if [ -n "$r" ]; then
    echo "$r" | head -1 | grep -q "$OKLINE" || { echo "   SMOKE-FAIL $s (script errors, broken attributes, off-step sliders or missing RU above)"; bad=1; }
    echo "$r" | grep -q '^FAIL' && bad=1
    echo "$r" | head -1 | grep -q '"unstyled":\[\]' || { echo "   UNSTYLED classes above have no CSS rule"; bad=1; }
    cites "$r" || { echo "   CITATION $s cites a reference number higher than its reference count"; bad=1; }
  fi
  } > "$out" 2>&1
  [ $bad -eq 0 ] || touch "$out.bad"
}
export -f one; export D REPO TMP OKLINE
slugs=("$@"); site=0
if [ ${#slugs[@]} -eq 0 ]; then
  site=1
  slugs=($(python3 -c "
import json,os,sys
m=json.load(open('$REPO/pages.json'))
print(' '.join(p['slug'] for c in m['categories'] for p in c['pages'] if os.path.exists('$REPO/'+p['slug']+'.html')))"))
fi
printf '%s\n' "${slugs[@]}" | xargs -P "$JOBS" -I{} bash -c 'one "$1"' _ {}
bad=0
for s in "${slugs[@]}"; do f=$TMP/$(echo "$s" | tr / _).out; cat "$f"; [ -f "$f.bad" ] && bad=1; done
if [ $site -eq 1 ]; then
  echo "== site"
  python3 "$D/finalize.py" --check | sed 's/^/   /'; [ ${PIPESTATUS[0]} -eq 0 ] || bad=1
  python3 "$D/ru_pages.py" --check | sed 's/^/   /'; [ ${PIPESTATUS[0]} -eq 0 ] || bad=1
  python3 "$D/search-index.py" --check | sed 's/^/   /'; [ ${PIPESTATUS[0]} -eq 0 ] || bad=1
  python3 "$D/site-check.py" | sed 's/^/   /'; [ ${PIPESTATUS[0]} -eq 0 ] || bad=1
fi
rm -rf "$TMP"; [ $bad -eq 0 ] && echo "ALL OK" || { echo "PROBLEMS FOUND"; exit 1; }
