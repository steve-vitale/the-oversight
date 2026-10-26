#!/bin/bash
# sweep-one-onzero9754-assign-arm.sh — run one onzero9754 arm (extract + both sides)
# Usage: bash scripts/sweep-one-onzero9754-assign-arm.sh <off|on> <seeds-csv>
#   e.g. bash scripts/sweep-one-onzero9754-assign-arm.sh off 9754
# Outputs: per-seed JSONs in evidence/2026-10-25/sim-onzero9754-b-corpus/
# plus a per-side sweep summary. Runner prints progress to stdout only.
# Scratch dir is deleted after verification. NEVER extracts under /tmp,
# NEVER creates a worktree, NEVER checks out an old commit in the worktree.
# The ON tree is a HEAD archive, unmodified. The OFF tree is a HEAD archive
# with ONLY scripts/preserveact-off.patch applied (the two widening hunks
# of 75fdd9258 reverted in src/js/food.js). The runner VERIFIES the OFF
# tree is exactly that (see below) and FAILS LOUDLY otherwise — a wider
# diff would mean the contrast is not the widening alone.
# VERIFICATION DESIGN (fixed pre-sweep in the preserveact run, 2026-10-25):
# (1) the patch names exactly one file (src/js/food.js) — proven by
# counting its diff headers; (2) git apply --check + git apply succeed,
# so the OFF tree is archive(HEAD) plus that patch and nothing else;
# (3) git apply --check --reverse succeeds afterwards, which proves the
# tree's food.js is exactly in the post-patch state. Together with
# (1), that proves OFF differs from ON only in food.js, without reading
# two 2.1GB trees.
set -u
ARM="$1"; SEEDS="${2:-9754}"
[ "$ARM" = "off" ] || [ "$ARM" = "on" ] || { echo "ARM must be off|on"; exit 2; }
WT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$(cd "$WT" && git rev-parse HEAD)"
CORPUS="$WT/evidence/2026-10-25/sim-onzero9754-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$ARM"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
(cd "$WT" && git archive HEAD | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $ARM $BASE"; exit 2; }
if [ "$ARM" = "off" ]; then
  NHDR=$(grep -c "^--- " "$WT/scripts/preserveact-off.patch" || true)
  NHDR2=$(grep -c "^+++ " "$WT/scripts/preserveact-off.patch" || true)
  [ "$NHDR" = "1" ] && [ "$NHDR2" = "1" ] || { echo "PATCH SHAPE FAIL LOUDLY: expected 1 file header pair, got $NHDR/$NHDR2"; exit 2; }
  grep -q "^--- a/src/js/food.js" "$WT/scripts/preserveact-off.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target src/js/food.js"; exit 2; }
  grep -q "^+++ b/src/js/food.js" "$WT/scripts/preserveact-off.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target src/js/food.js"; exit 2; }
  (cd "$RUNDIR" && git apply --check "$WT/scripts/preserveact-off.patch" && git apply "$WT/scripts/preserveact-off.patch" && git apply --check --reverse "$WT/scripts/preserveact-off.patch") || { echo "OFF PATCH FAIL LOUDLY"; exit 2; }
  echo "tree verified: OFF differs from ON only in src/js/food.js (single-file patch + reverse-check)"
fi
cp "$WT/scripts/sweep-onzero9754-assign-b.js" "$RUNDIR/scripts/sweep-onzero9754-assign-b.js" || { echo "DRIVER COPY FAIL $ARM"; exit 2; }
NSEEDS=$(echo "$SEEDS" | tr ',' '\n' | grep -c .)
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ARM="$ARM" BASE="$BASE" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-assign-$ARM-$SIDE-dg1-leadfeast.json" node scripts/sweep-onzero9754-assign-b.js) || { echo "SWEEP FAIL LOUDLY $ARM $SIDE"; exit 2; }
  N=$(ls "$CORPUS"/onzero9754-b-assign-"$ARM"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  echo "arm $ARM $SIDE: $N per-seed files present (this run asked for $NSEEDS seeds; cumulative count may exceed it across runs)"
done
rm -rf "$RUNDIR"
echo "arm $ARM DONE"
