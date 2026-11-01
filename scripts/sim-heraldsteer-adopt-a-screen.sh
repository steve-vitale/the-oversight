#!/bin/bash
# sim-heraldsteer-adopt-a-screen.sh — longevity screen for the heraldsteer
# adoption pilot band. Same rule as sim-heraldarr2-a-screen.sh, extended
# qualifier cap (24) so the confirm can run 12–16 seeds on pilot GO.
# Substrate-only runs (SIMHERALDARR2 unset): the parser reads ONLY seed,
# days, gameDays, won, endReason — never any Herald field.
# Usage: bash scripts/sim-heraldsteer-adopt-a-screen.sh <startSeed> <maxScan> <outDir>
# Stops after 24 qualifiers. Writes per-seed JSON + .err into <outDir>,
# and qualifiers (one seed per line, scan order) to <outDir>/qualifiers.txt.
set -u
START=${1:?start seed required}
MAXSCAN=${2:?max scan count required}
OUT=${3:?out dir required}
mkdir -p "$OUT"
: > "$OUT/qualifiers.txt"
scanned=0
qualified=0
seed=$START
while [ "$scanned" -lt "$MAXSCAN" ] && [ "$qualified" -lt 24 ]; do
  LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 DAYS=180 SEEDS=$seed \
    node scripts/sim-heraldarr2-a-sweep.js > "$OUT/s$seed.json" 2> "$OUT/s$seed.err"
  q=$(node -e "const s=require('fs').readFileSync(process.argv[1],'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); const j=s[0]; console.log((j.gameDays>120 && !j.won)?1:0);" "$OUT/s$seed.json" 2>/dev/null || echo 0)
  if [ "$q" = "1" ]; then
    echo "$seed" >> "$OUT/qualifiers.txt"
    qualified=$((qualified + 1))
  fi
  scanned=$((scanned + 1))
  seed=$((seed + 1))
done
echo "screened=$scanned qualified=$qualified lastSeed=$((seed - 1))"
cat "$OUT/qualifiers.txt"
