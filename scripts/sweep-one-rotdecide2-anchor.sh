#!/bin/bash
# sweep-one-rotdecide2-anchor.sh — run one rotdecide2 anchor (extract + both sides)
# Usage: bash scripts/sweep-one-rotdecide2-anchor.sh <full-sha> <label> <seeds-csv>
#   e.g. bash scripts/sweep-one-rotdecide2-anchor.sh 1f24a4ef... parent 9500,9501,9502,9503,9504,9505,9506,9507
# Outputs: per-seed JSONs in evidence/2026-10-25/rotdecide2-b-corpus/ plus a
# per-side sweep summary. Runner prints progress to stdout only — NO log
# files are written into the corpus (leg2decide convention: corpus holds
# per-seed files + sweep summaries only).
# Scratch dir is deleted after verification. NEVER extracts under /tmp,
# NEVER creates a worktree, NEVER checks out an old commit in the worktree.
set -u
SHA="$1"; LABEL="$2"; SEEDS="${3:-9500,9501,9502,9503,9504,9505,9506,9507}"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-25/rotdecide2-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$LABEL"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
(cd "$WT" && git archive "$SHA" | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $LABEL $SHA"; exit 2; }
cp "$WT/scripts/sweep-rotdecide2-b.js" "$RUNDIR/scripts/sweep-rotdecide2-b.js" || { echo "DRIVER COPY FAIL $LABEL"; exit 2; }
NSEEDS=$(echo "$SEEDS" | tr ',' '\n' | grep -c .)
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$SHA" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-${SHA:0:8}-$SIDE-dg1-leadfeast.json" node scripts/sweep-rotdecide2-b.js) || { echo "SWEEP FAIL LOUDLY $LABEL $SIDE"; exit 2; }
  N=$(ls "$CORPUS"/rotdecide2-b-"${SHA:0:8}"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  echo "anchor $LABEL $SIDE: $N per-seed files present (this run asked for $NSEEDS seeds; cumulative count may exceed it across runs)"
done
rm -rf "$RUNDIR"
echo "anchor $LABEL DONE"
