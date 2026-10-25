#!/bin/bash
# sweep-one-rotdecide2-trace.sh — trace re-runs for rotdecide2 sense samples.
# Usage: bash scripts/sweep-one-rotdecide2-trace.sh <full-sha> <label> <seeds-csv>
# Same extraction + driver-copy method as sweep-one-rotdecide2-anchor.sh,
# PLUS HAULCOUNT_TRACE=1, so rotdecide2-b-trace-*.json files land beside
# the per-seed files. Sweep summaries go to sweep-trace-* files (never
# overwriting the corpus sweep summaries). Per-seed files are rewritten
# and MUST byte-compare to the corpus files (deterministic re-runs);
# verify with md5sum before/after. NEVER extracts under /tmp, NEVER
# creates a worktree, NEVER checks out an old commit in the worktree.
set -u
SHA="$1"; LABEL="$2"; SEEDS="${3:-9514,9504}"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-25/rotdecide2-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$LABEL-trace"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
(cd "$WT" && git archive "$SHA" | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $LABEL $SHA"; exit 2; }
cp "$WT/scripts/sweep-rotdecide2-b.js" "$RUNDIR/scripts/sweep-rotdecide2-b.js" || { echo "DRIVER COPY FAIL $LABEL"; exit 2; }
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && HAULCOUNT_TRACE=1 FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$SHA" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-trace-${SHA:0:8}-$SIDE-dg1-leadfeast.json" node scripts/sweep-rotdecide2-b.js) || { echo "TRACE SWEEP FAIL LOUDLY $LABEL $SIDE"; exit 2; }
  echo "trace anchor $LABEL $SIDE done"
done
rm -rf "$RUNDIR"
echo "trace anchor $LABEL DONE"
