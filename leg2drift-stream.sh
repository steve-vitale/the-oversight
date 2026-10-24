#!/bin/bash
# leg2drift-stream.sh — parallel sweep stream for the leg2drift adoption (NOT committed).
# Usage: bash leg2drift-stream.sh A|B|C|D
# Each stream runs a disjoint anchor set in one process, serially within the
# stream; streams run concurrently in separate processes (distinct scratch
# trees, distinct output files). Sweep output streams to the caller's pipe,
# never to a file. Skip-validation: already-valid per-seed JSONs are skipped.
set -u
WT=~/workspace/worktrees/sim-leg2drift-adopt-b
CORPUS="$WT/evidence/2026-10-24/leg2drift-b-corpus"
SEEDS="9250 9251 9252 9253 9254 9255 9256 9257"
STREAM="${1:?usage: leg2drift-stream.sh A|B|C|D}"
case "$STREAM" in
  A) ANCHORS="9ad6ef81fc9550fb6edd1f93567e32ad3d0c572e 07a3ede32d8c0eb38588994ddcd61baca1c92889 fa10e1ca8870096936f1007ad86076ae5dc2fa02" ;;
  B) ANCHORS="0b151e0e163b21f07606f9cd06dd9d675e6225d2 2c2336dd9e254406dd3db9e39cac319068c357ff 6722215c6263fc0a4a364b2981cab56883e29523" ;;
  C) ANCHORS="1f24a4ef04a857d33138fd0845cfa83df688285c 75fdd92587ad9d83bb12f05da535cdfb49255835 795156dcd052bd9578009ca3a5ba64a2875d0524" ;;
  D) ANCHORS="be55cfc2c927d77a0099264019ea299c86488c6c 1a4c9b696978ac2a099cd6b40bdfb010c9de0137 141126b07eb55ef6e0993f8edbf3ecfb7b0dd232" ;;
  *) echo "unknown stream $STREAM"; exit 2 ;;
esac
run_one() {
  local sha="$1" dir="$2" side="$3" pd="$4" seed="$5"
  local short="${sha:0:8}"
  local out="$CORPUS/leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json"
  if python3 -c "import json,sys; d=json.load(open('$out')); assert d['anchorCommit']=='$sha' and d['seed']==$seed" 2>/dev/null; then
    echo "STREAM-$STREAM SKIP $short $side s$seed (already valid)"
    return 0
  fi
  echo "STREAM-$STREAM START $short $side s$seed"
  ( cd "$dir" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$sha" SIDE="$side" PLENTYDEPRI="$pd" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$seed" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-${short}-${side}-dg1-leadfeast.json" node scripts/sweep-leg2drift-b.js )
  local rc=$?
  echo "STREAM-$STREAM DONE $short $side s$seed rc=$rc"
  return $rc
}
echo "STREAM-$STREAM START pid=$$"
for sha in $ANCHORS; do
  if [ "$sha" = "141126b07eb55ef6e0993f8edbf3ecfb7b0dd232" ]; then dir="$WT"; else dir="$WT/bisect-scratch/$sha"; fi
  for side_pd in "pd0 0" "pd1 1"; do
    set -- $side_pd
    for seed in $SEEDS; do run_one "$sha" "$dir" "$1" "$2" "$seed" || echo "STREAM-$STREAM WARN $sha $1 s$seed failed"; done
  done
done
echo "STREAM-$STREAM DONE"
