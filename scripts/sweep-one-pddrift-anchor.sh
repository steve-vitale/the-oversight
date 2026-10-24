#!/bin/bash
# sweep-one-pddrift-anchor.sh — run one pddrift-b anchor (extract + both sides)
# Usage: bash scripts/sweep-one-pddrift-anchor.sh <full-sha> <label> [MASTER]
#   MASTER=1 skips extraction and runs the driver in this worktree (the
#   master anchor: this worktree's src/js IS the master tree's src/js —
#   local master tip equals this branch HEAD, pdtradeoff commits are
#   evidence/scripts only, zero src/js).
# Outputs: per-seed JSONs in evidence/2026-10-24/pddrift-b-corpus/ and a
# per-side log in the same dir. Scratch dir is deleted after verification.
# NEVER extracts under /tmp, NEVER creates a worktree, NEVER checks out.
set -u
SHA="$1"; LABEL="$2"; MASTER="${3:-0}"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-24/pddrift-b-corpus"
mkdir -p "$CORPUS"
if [ "$MASTER" = "1" ]; then
  RUNDIR="$WT"
else
  RUNDIR="$WT/bisect-scratch/$LABEL"
  mkdir -p "$RUNDIR"
  (cd "$WT" && git archive "$SHA" | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $LABEL $SHA"; exit 2; }
  cp "$WT/scripts/sweep-pddrift-b.js" "$RUNDIR/scripts/sweep-pddrift-b.js" || { echo "DRIVER COPY FAIL $LABEL"; exit 2; }
fi
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$SHA" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="9250,9251,9252,9253,9254,9255,9256,9257" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$LABEL-$SIDE-dg1-leadfeast.json" node scripts/sweep-pddrift-b.js > "$CORPUS/log-$LABEL-$SIDE.txt" 2>&1) || { echo "SWEEP FAIL LOUDLY $LABEL $SIDE"; tail -5 "$CORPUS/log-$LABEL-$SIDE.txt"; exit 2; }
  N=$(ls "$CORPUS"/pddrift-b-"${SHA:0:8}"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  # master anchor uses the full sha in filenames too (driver slices 8) — same count check
  if [ "$N" -ne 8 ]; then echo "COUNT FAIL LOUDLY $LABEL $SIDE: $N/8 per-seed files"; exit 2; fi
  echo "anchor $LABEL $SIDE: 8/8 per-seed files"
done
if [ "$MASTER" != "1" ]; then rm -rf "$RUNDIR"; fi
echo "anchor $LABEL DONE"
