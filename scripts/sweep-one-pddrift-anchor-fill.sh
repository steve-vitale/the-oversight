#!/bin/bash
# sweep-one-pddrift-anchor-fill.sh — EPERM-flap-resilient anchor sweep.
# Usage: bash scripts/sweep-one-pddrift-anchor-fill.sh <full-sha> <label>
#
# WHY: the 2026-10-24 container EPERM flap kills whole-tree tar extractions
# (tar exits nonzero after hundreds of failed writes) and also kills
# single-pass subset extractions when the flap is in a bad phase. A single
# clean pass is NOT required: tar passes ACCUMULATE (files written before a
# failure persist; a failed write leaves a 0-byte casualty that the next
# pass overwrites). So this script fills by convergence:
#   - expected = `git ls-tree` file list for the subset (scripts/sim-
#     harness.js, scripts/policies/*, index.html, src/js/*, src/data/* —
#     everything the node sweep reads; audio/evidence/playtests/tools are
#     never read by the sweep and are skipped).
#   - each pass: full subset tar (failures ignored), then missing =
#     expected-minus-actual plus 0-byte files whose git blob is non-empty;
#     missing-only tar for exactly those paths.
#   - success = missing empty (verified by name + non-empty check).
# Then the driver is copied in, both sides run (the driver's own
# writeRobust retries cover corpus-write flaps), 8/8 per side is verified,
# and the scratch tree is removed. NEVER under /tmp, NEVER a worktree,
# NEVER a checkout.
set -u
SHA="$1"; LABEL="$2"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-24/pddrift-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$LABEL"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
PATHS="scripts/sim-harness.js scripts/policies index.html src/js src/data"
# ALL list handling is in-memory (pipes/variables): the EPERM flap also
# kills `sort > file` redirects, so no step here writes a list to disk.
EXPECTED=""
for TRY in $(seq 1 20); do
  EXPECTED=$(cd "$WT" && git ls-tree -r --name-only "$SHA" -- $PATHS 2>/dev/null)
  if [ -n "$EXPECTED" ] && [ "$(echo "$EXPECTED" | wc -l)" -ge 200 ]; then break; fi
  echo "lstree $LABEL try $TRY failed, waiting 10s"; sleep 10
done
if [ -z "$EXPECTED" ]; then echo "LSTREE FAIL LOUDLY $LABEL"; exit 2; fi
# Legit-empty files in the subset (blob size 0) — also via pipe only.
LEGIT_EMPTY=$(cd "$WT" && git ls-tree -r -l "$SHA" -- $PATHS 2>/dev/null | awk '$4 == 0 {print $5}')
FILLED=0
for PASS in $(seq 1 60); do
  # Full tar only on pass 1; later passes refill ONLY the missing files
  # (rewriting all 297 files per pass wastes the flap's quiet windows).
  if [ "$PASS" = "1" ]; then
    (cd "$WT" && git archive "$SHA" $PATHS | tar -x -C "$RUNDIR") 2>/dev/null || true
  fi
  MISSING=""
  while IFS= read -r F; do
    [ -z "$F" ] && continue
    if [ ! -f "$RUNDIR/$F" ]; then MISSING="$MISSING $F"; continue; fi
    if [ ! -s "$RUNDIR/$F" ] && ! echo "$LEGIT_EMPTY" | grep -qx "$F"; then MISSING="$MISSING $F"; fi
  done <<EOF
$EXPECTED
EOF
  if [ -z "$MISSING" ] && [ -f "$RUNDIR/scripts/sim-harness.js" ] && [ -f "$RUNDIR/src/js/game.js" ]; then
    FILLED=1; echo "fill $LABEL converged on pass $PASS"; break
  fi
  if [ -n "$MISSING" ]; then
    echo "fill $LABEL pass $PASS: refilling $(echo "$MISSING" | wc -w) files"
    # shellcheck disable=SC2086
    (cd "$WT" && git archive "$SHA" $MISSING | tar -x -C "$RUNDIR") 2>/dev/null || true
  fi
  sleep 3
done
if [ "$FILLED" != "1" ]; then echo "FILL FAIL LOUDLY $LABEL $SHA (60 passes)"; exit 2; fi
for TRY in $(seq 1 20); do
  if cp "$WT/scripts/sweep-pddrift-b.js" "$RUNDIR/scripts/sweep-pddrift-b.js" 2>/dev/null && [ -s "$RUNDIR/scripts/sweep-pddrift-b.js" ]; then break; fi
  echo "driver copy $LABEL try $TRY failed, waiting 10s"; sleep 10
  [ "$TRY" = "20" ] && { echo "DRIVER COPY FAIL LOUDLY $LABEL"; exit 2; }
done
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$SHA" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="9250,9251,9252,9253,9254,9255,9256,9257" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$LABEL-$SIDE-dg1-leadfeast.json" node scripts/sweep-pddrift-b.js > "$CORPUS/log-$LABEL-$SIDE.txt" 2>&1) || { echo "SWEEP FAIL LOUDLY $LABEL $SIDE"; tail -5 "$CORPUS/log-$LABEL-$SIDE.txt"; exit 2; }
  N=$(ls "$CORPUS"/pddrift-b-"${SHA:0:8}"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  if [ "$N" -ne 8 ]; then echo "COUNT FAIL LOUDLY $LABEL $SIDE: $N/8 per-seed files"; exit 2; fi
  echo "anchor $LABEL $SIDE: 8/8 per-seed files"
done
rm -rf "$RUNDIR"
echo "anchor $LABEL DONE"
