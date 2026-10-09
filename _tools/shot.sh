#!/bin/bash
# shot.sh <slug> [width] : full-page screenshot of an aerospace article (sections not forced to viewport height), split into tiles.
# Needs a local server rooted one level ABOVE the repo so /aerospace/... absolute paths resolve like production:
#   python3 -m http.server 8790 --directory "$(dirname "$REPO")"
# Tiles go to tools/shots/ (git-ignored). Uses a throwaway Firefox profile; never touches a running Firefox.
S=$1; W=${2:-1300}; D=$(cd "$(dirname "$0")"; pwd); REPO=$(dirname "$D"); OUT=$D/shots; PORT=${PORT:-8790}
mkdir -p "$OUT"; PROF=$(mktemp -d)
sed 's|</head>|<style>.section{min-height:0!important}#hero .frame{margin-top:20px}</style></head>|' "$REPO/$S.html" > "$REPO/_shot_$S.html"
timeout 150 firefox --headless --no-remote --profile "$PROF" --window-size=$W,14000 --screenshot "$OUT/${S}_${W}_full.png" "http://127.0.0.1:$PORT/$(basename "$REPO")/_shot_$S.html" >/dev/null 2>&1
rm -rf "$REPO/_shot_$S.html" "$PROF"
python3 - "$OUT/${S}_${W}_full.png" "$OUT/${S}_${W}" <<'PY'
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
