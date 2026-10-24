#!/bin/bash
# sweep-one-pddrift-anchor-subset.sh — retry-capable subset extraction + sweep
# for one pddrift-b anchor, used after the 2026-10-24 EPERM flap killed two
# full-tree extractions (tar could not write the bulk of either tree).
# Usage: bash scripts/sweep-one-pddrift-anchor-subset.sh <full-sha> <label>
#
# SUBSET (not the full tree): the node sweep needs only
#   scripts/sim-harness.js, scripts/policies/*, index.html (script order),
#   src/js/*, src/data/* — the harness reads index.html + src/js + src/data
#   from the tree root and nothing else (verified in sim-harness.js:
#   fs reads + grep over index.html only). Audio, evidence, playtests,
#   sweep-out, tools, docs are never read by the sweep, so skipping them
#   cuts the write count by an order of magnitude and with it the flap
#   exposure. Per-seed outputs still land in the worktree corpus dir.
# Extraction retries up to 6 times (30s backoff) and verifies key files
# after each attempt; a sweep side that crashes fails loudly via the
# 8/8 count check. NEVER under /tmp, NEVER a worktree, NEVER a checkout.
set -u
SHA="$1"; LABEL="$2"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-24/pddrift-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$LABEL"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
OK=0
for TRY in 1 2 3 4 5 6; do
  if (cd "$WT" && git archive "$SHA" scripts/sim-harness.js scripts/policies index.html src/js src/data | tar -x -C "$RUNDIR") 2>/dev/null; then
    if [ -f "$RUNDIR/scripts/sim-harness.js" ] && [ -f "$RUNDIR/scripts/policies/feastscale.js" ] && [ -f "$RUNDIR/index.html" ] && [ -f "$RUNDIR/src/js/game.js" ] && [ -f "$RUNDIR/src/data/plants.json" ]; then
      OK=1; echo "extract $LABEL ok on try $TRY"; break
    fi
  fi
  echo "extract $LABEL try $TRY failed, waiting 30s"; sleep 30
done
if [ "$OK" != "1" ]; then echo "EXTRACT FAIL LOUDLY $LABEL $SHA (subset, 6 tries)"; exit 2; fi
cp "$WT/scripts/sweep-pddrift-b.js" "$RUNDIR/scripts/sweep-pddrift-b.js" || { echo "DRIVER COPY FAIL $LABEL"; exit 2; }
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$SHA" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="9250,9251,9252,9253,9254,9255,9256,9257" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$LABEL-$SIDE-dg1-leadfeast.json" node scripts/sweep-pddrift-b.js > "$CORPUS/log-$LABEL-$SIDE.txt" 2>&1) || { echo "SWEEP FAIL LOUDLY $LABEL $SIDE"; tail -5 "$CORPUS/log-$LABEL-$SIDE.txt"; exit 2; }
  N=$(ls "$CORPUS"/pddrift-b-"${SHA:0:8}"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  if [ "$N" -ne 8 ]; then echo "COUNT FAIL LOUDLY $LABEL $SIDE: $N/8 per-seed files"; exit 2; fi
  echo "anchor $LABEL $SIDE: 8/8 per-seed files"
done
rm -rf "$RUNDIR"
echo "anchor $LABEL DONE"
