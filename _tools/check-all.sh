#!/bin/bash
# check-all.sh [slug...] : for every article source in tools/articles/, rebuild into a temp file,
# confirm it matches the committed page byte for byte, then run the jsdom smoke test + its numerical checks.
# Exit status is non-zero if anything drifts, errors or fails.
D=$(cd "$(dirname "$0")"; pwd); REPO=$(dirname "$D"); TMP=$(mktemp -d); bad=0
slugs=("$@"); [ ${#slugs[@]} -eq 0 ] && slugs=($(ls "$D/articles"))
for s in "${slugs[@]}"; do
  A=$D/articles/$s
  python3 "$D/assemble.py" "$A" "$TMP/$s.html" >/dev/null || { echo "BUILD-FAIL $s"; bad=1; continue; }
  cmp -s "$TMP/$s.html" "$REPO/$s.html" || { echo "DRIFT $s (committed page differs from its source; rebuild with assemble.py)"; bad=1; }
  hook=$(grep -o 'window\.__[A-Za-z0-9_]* *=' "$A/script.js" | head -1 | sed 's/window\.//; s/ *=//')
  out=$(cd "$D" && node test.js "$TMP/$s.html" "$hook" "$A/checks.js" 2>&1)
  echo "== $s"; echo "$out" | sed 's/^/   /'
  echo "$out" | head -1 | grep -q '"errors":\[\],"missingRu":0' || bad=1
  echo "$out" | grep -q '^FAIL' && bad=1
done
rm -rf "$TMP"; [ $bad -eq 0 ] && echo "ALL OK" || { echo "PROBLEMS FOUND"; exit 1; }
