#!/bin/bash
# sweep-one-preserveact-arm.sh — run one preserveact arm (extract + both sides)
# Usage: bash scripts/sweep-one-preserveact-arm.sh <off|on> <seeds-csv>
#   e.g. bash scripts/sweep-one-preserveact-arm.sh off 9750,9751,9752,9753,9754,9755,9756,9757
# Outputs: per-seed JSONs in evidence/2026-10-25/preserveact-b-corpus/ plus a
# per-side sweep summary. Runner prints progress to stdout only — NO log
# files are written into the corpus (corpus holds per-seed files + sweep
# summaries + trace files only).
# Scratch dir is deleted after verification. NEVER extracts under /tmp,
# NEVER creates a worktree, NEVER checks out an old commit in the worktree.
# The ON tree is a HEAD archive, unmodified. The OFF tree is a HEAD archive
# with ONLY scripts/preserveact-off.patch applied (the two widening hunks
# of 75fdd9258 reverted in src/js/food.js). The runner VERIFIES the
# ON-vs-OFF tree diff is exactly that patch (diff of the two extracted
# trees, excluding the driver copy which is identical in both) and FAILS
# LOUDLY otherwise — a wider diff would mean the contrast is not the
# widening alone.
# TRACE_SEEDS="9750,..." (optional): after the main run, re-run those
# seeds with HAULCOUNT_TRACE=1; the re-run per-seed files must be
# byte-identical to the main run's (md5-verified before/after).
set -u
ARM="$1"; SEEDS="${2:-9750,9751,9752,9753,9754,9755,9756,9757}"
[ "$ARM" = "off" ] || [ "$ARM" = "on" ] || { echo "ARM must be off|on"; exit 2; }
WT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$(cd "$WT" && git rev-parse HEAD)"
CORPUS="$WT/evidence/2026-10-25/preserveact-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$ARM"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
(cd "$WT" && git archive HEAD | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $ARM $BASE"; exit 2; }
if [ "$ARM" = "off" ]; then
  (cd "$RUNDIR" && git apply --check "$WT/scripts/preserveact-off.patch" && git apply "$WT/scripts/preserveact-off.patch") || { echo "OFF PATCH FAIL LOUDLY"; exit 2; }
  # Verify the ONLY tree difference vs a fresh HEAD archive is food.js.
  ONDIR="$WT/bisect-scratch/on-check"
  rm -rf "$ONDIR"; mkdir -p "$ONDIR"
  (cd "$WT" && git archive HEAD | tar -x -C "$ONDIR") || { echo "ON-CHECK EXTRACT FAIL"; exit 2; }
  DIFFOUT="$(diff -qr "$ONDIR" "$RUNDIR" 2>/dev/null | grep -v "^Only in $RUNDIR: " || true)"
  # diff -qr lists every differing file; the OFF tree must differ ONLY in src/js/food.js.
  echo "$DIFFOUT" | grep -v "src/js/food.js" | grep -q "differ" && { echo "TREE DIFF FAIL LOUDLY: OFF tree differs beyond food.js:"; echo "$DIFFOUT"; exit 2; }
  echo "$DIFFOUT" | grep -q "src/js/food.js" || { echo "TREE DIFF FAIL LOUDLY: OFF tree food.js identical to ON (patch did not apply?)"; exit 2; }
  rm -rf "$ONDIR"
  echo "tree-diff verified: OFF differs from ON only in src/js/food.js"
fi
cp "$WT/scripts/sweep-preserveact-b.js" "$RUNDIR/scripts/sweep-preserveact-b.js" || { echo "DRIVER COPY FAIL $ARM"; exit 2; }
NSEEDS=$(echo "$SEEDS" | tr ',' '\n' | grep -c .)
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ARM="$ARM" BASE="$BASE" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$ARM-$SIDE-dg1-leadfeast.json" node scripts/sweep-preserveact-b.js) || { echo "SWEEP FAIL LOUDLY $ARM $SIDE"; exit 2; }
  N=$(ls "$CORPUS"/preserveact-b-"$ARM"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  echo "arm $ARM $SIDE: $N per-seed files present (this run asked for $NSEEDS seeds; cumulative count may exceed it across runs)"
done
if [ -n "${TRACE_SEEDS:-}" ]; then
  echo "trace re-runs for seeds: $TRACE_SEEDS"
  for SIDE in pd0 pd1; do
    PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
    for S in $(echo "$TRACE_SEEDS" | tr ',' ' '); do
      F="$CORPUS/preserveact-b-$ARM-$SIDE-dg1-leadfeast-s$S.json"
      [ -f "$F" ] || { echo "TRACE PRE-CHECK FAIL: missing $F"; exit 2; }
      md5sum "$F" >> "$CORPUS/.trace-md5-before" 2>/dev/null || md5 "$F" >> "$CORPUS/.trace-md5-before"
    done
    (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 HAULCOUNT_TRACE=1 ARM="$ARM" BASE="$BASE" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$TRACE_SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$ARM-$SIDE-dg1-leadfeast-trace.json" node scripts/sweep-preserveact-b.js) || { echo "TRACE SWEEP FAIL LOUDLY $ARM $SIDE"; exit 2; }
  done
  # Byte-compare: re-run files must match the pre-trace md5s.
  while read -r SUM FILE; do
    NOW=$(md5sum "$FILE" 2>/dev/null | cut -d' ' -f1 || md5 -q "$FILE")
    [ "$NOW" = "$SUM" ] || { echo "TRACE BYTE-COMPARE FAIL: $FILE changed under trace re-run"; exit 2; }
  done < "$CORPUS/.trace-md5-before"
  rm -f "$CORPUS/.trace-md5-before"
  echo "trace re-runs byte-identical to corpus files"
fi
rm -rf "$RUNDIR"
echo "arm $ARM DONE"
