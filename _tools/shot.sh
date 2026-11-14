#!/bin/bash
# shot.sh <slug> [width] [height] : full-page screenshot of a guide (sections not forced to viewport height), split into tiles.
# Self-contained: starts its own local server on a free port, rooted one level ABOVE the repo so /aerospace/... absolute paths
# resolve like production, and stops it afterwards. The temporary page lives in _tools/shots/ (git-ignored, never published).
# Browser: $BROWSER = firefox | chrome (default: firefox if installed, else Google Chrome / Chromium). Tiles go to _tools/shots/.
# Chrome caps a headless window at 16,384 px, so a taller page is captured in several scrolled passes of that height.
S=$1; W=${2:-1300}; D=$(cd "$(dirname "$0")"; pwd); REPO=$(dirname "$D"); OUT=$D/shots; H=${3:-28000}
[ -n "$S" ] && [ -f "$REPO/$S.html" ] || { echo "usage: shot.sh <slug> [width] [height]"; exit 2; }
mkdir -p "$OUT"; PROF=$(mktemp -d)
CHROME=""; for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "$(command -v google-chrome)" "$(command -v chromium)" "$(command -v chromium-browser)"; do [ -x "$c" ] && { CHROME=$c; break; }; done
B=${BROWSER:-$(command -v firefox >/dev/null && echo firefox || echo chrome)}
PORT=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1])")
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$(dirname "$REPO")" >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV 2>/dev/null; rm -rf "$PROF" "$OUT/_shot_$S.html"' EXIT
sed 's|</head>|<style>.section{min-height:0!important}#hero .frame{margin-top:20px}</style></head>|' "$REPO/$S.html" > "$OUT/_shot_$S.html"
URL="http://127.0.0.1:$PORT/$(basename "$REPO")/_tools/shots/_shot_$S.html"
for i in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null "$URL" && break; sleep 0.3; done
FULL="$OUT/${S}_${W}_full.png"; rm -f "$FULL"
if [ "$B" = firefox ]; then
  firefox --headless --no-remote --profile "$PROF" --window-size=$W,$H --screenshot "$FULL" "$URL" >/dev/null 2>&1
else
  [ -n "$CHROME" ] || { echo "no browser found (install Firefox or Chrome, or set BROWSER)"; exit 1; }
  [ "$H" -gt 16384 ] && H=16384
  # Chrome will not make a window narrower than 500 px, so the page is shown in an iframe of the asked width (media queries
  # follow the iframe); the picture is then 500 px wide with the page in its left part.
  WW=$W; [ "$W" -lt 500 ] && WW=500
  printf '<!doctype html><body style="margin:0;background:#fff"><iframe src="_shot_%s.html" style="border:0;display:block;width:%spx;height:%spx"></iframe>' "$(basename "$S")" "$W" "$H" > "$OUT/_shot_wrap.html"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$PROF" --force-device-scale-factor=1 \
    --virtual-time-budget=6000 --window-size=$WW,$H --screenshot="$FULL" "${URL%/*}/_shot_wrap.html" >/dev/null 2>&1
  rm -f "$OUT/_shot_wrap.html"
fi
[ -f "$FULL" ] || { echo "screenshot failed"; exit 1; }
python3 - "$FULL" "$OUT/${S}_${W}" <<'PY' || echo "full page saved: $FULL (install Pillow to split it into tiles)"
import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); w,h=im.size
px=im.load(); bottom=h
for y in range(h-1,0,-20):
    if any(px[x,y]!=px[0,y] for x in range(0,w,7)): bottom=min(h,y+40); break
n=0
for y in range(0,bottom,2400):
    im.crop((0,y,w,min(bottom,y+2400))).resize((w//2, (min(bottom,y+2400)-y)//2)).save(f'{sys.argv[2]}_{n}.png'); n+=1
print('tiles',n,'height',bottom)
PY
