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
# of 75fdd9258 reverted in src/js/food.js). The runner VERIFIES the OFF
# tree is exactly that (see below) and FAILS LOUDLY otherwise — a wider
# diff would mean the contrast is not the widening alone.
# VERIFICATION DESIGN (fixed pre-sweep, 2026-10-25): the first version
# diffed two full HEAD archives with diff -qr — infeasible, because a
# HEAD archive is ~2.1GB (the evidence tree) and the diff never finished
# in 10+ minutes while thrashing the disk. The equivalent cheap proof:
# (1) the patch names exactly one file (src/js/food.js) — proven by
# counting its diff headers; (2) git apply --check + git apply succeed,
# so the OFF tree is archive(HEAD) plus that patch and nothing else;
# (3) git apply --check --reverse succeeds afterwards, which proves the
# tree's food.js is exactly in the post-patch (OFF) state. Together with
# (1), that proves OFF differs from ON only in food.js, without reading
# two 2.1GB trees.
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
  # (1) The patch must name exactly one file, src/js/food.js. NOTE: the
  # patch is plain `diff -u` output, NOT git-style, so it carries
  # ---/+++ file headers and no "diff --git" header — count those.
  NHDR=$(grep -c "^--- " "$WT/scripts/preserveact-off.patch" || true)
  NHDR2=$(grep -c "^+++ " "$WT/scripts/preserveact-off.patch" || true)
  [ "$NHDR" = "1" ] && [ "$NHDR2" = "1" ] || { echo "PATCH SHAPE FAIL LOUDLY: expected 1 file header pair, got $NHDR/$NHDR2"; exit 2; }
  grep -q "^--- a/src/js/food.js" "$WT/scripts/preserveact-off.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target src/js/food.js"; exit 2; }
  grep -q "^+++ b/src/js/food.js" "$WT/scripts/preserveact-off.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target src/js/food.js"; exit 2; }
  # (2) Apply; (3) reverse-check proves food.js is in the post-patch state.
  (cd "$RUNDIR" && git apply --check "$WT/scripts/preserveact-off.patch" && git apply "$WT/scripts/preserveact-off.patch" && git apply --check --reverse "$WT/scripts/preserveact-off.patch") || { echo "OFF PATCH FAIL LOUDLY"; exit 2; }
  echo "tree verified: OFF differs from ON only in src/js/food.js (single-file patch + reverse-check)"
fi
cp "$WT/scripts/sweep-preserveact-b.js" "$RUNDIR/scripts/sweep-preserveact-b.js" || { echo "DRIVER COPY FAIL $ARM"; exit 2; }
NSEEDS=$(echo "$SEEDS" | tr ',' '\n' | grep -c .)
# Trace invocations re-run a SUBSET of seeds; their main-sweep summary
# must NOT overwrite the full pilot summary. When TRACE_SEEDS is set,
# the main re-run summary goes to a distinct -mainrerun name (the
# trace-run summary itself already uses -trace). Without TRACE_SEEDS,
# the standard name holds the full sweep. (Lesson from the OFF trace
# run: it overwrote the 8-row pilot summaries with 2-row versions;
# the pilot mains were re-run afterwards to restore them.)
MAINOUT_SUFFIX=""
[ -n "${TRACE_SEEDS:-}" ] && MAINOUT_SUFFIX="-mainrerun"
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ARM="$ARM" BASE="$BASE" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$ARM-$SIDE-dg1-leadfeast$MAINOUT_SUFFIX.json" node scripts/sweep-preserveact-b.js) || { echo "SWEEP FAIL LOUDLY $ARM $SIDE"; exit 2; }
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
