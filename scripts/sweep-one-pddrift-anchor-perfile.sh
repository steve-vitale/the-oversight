#!/bin/bash
# sweep-one-pddrift-anchor-perfile.sh — per-file anchor fill + sweep.
# Usage: bash scripts/sweep-one-pddrift-anchor-perfile.sh <full-sha> <label>
#
# WHY per-file + gated + round-looped: the 2026-10-24 container EPERM flap
# flickers at second-scale AND sustains bad phases for 10-30+ min, hitting
# BOTH file writes and .git object reads (git cat-file exits 128). Any
# multi-file tar burst hits a bad moment and leaves 0-byte casualties, and
# a fixed 40-tries-per-file budget burns out inside one bad phase. So:
#   1. FLAP GATE: wait until a probe write AND a git cat-file both succeed
#      (up to 30 min, 30s cadence) before starting the fill.
#   2. FILL ROUNDS (up to 20): each round writes every still-missing file
#      by its own `git cat-file -p > tmp && mv` redirect (5 tries/file);
#      after each round, verify in-memory (no list files on disk — even
#      `sort > file` flaps). A round that lands during a bad phase simply
#      leaves files for the next round; convergence needs only one quiet
#      stretch, not one quiet burst.
# Subset (everything the node sweep reads): scripts/sim-harness.js,
# scripts/policies/*, index.html, src/js/*, src/data/*. Audio, evidence,
# playtests, tools are never read by the sweep and are skipped.
# Then the driver is copied in (same retry pattern), both sides run (the
# driver's writeRobust retries cover corpus-write flaps), 8/8 per side is
# verified, and the scratch tree is removed. NEVER under /tmp, NEVER a
# worktree, NEVER a checkout.
set -u
SHA="$1"; LABEL="$2"
WT="$(cd "$(dirname "$0")/.." && pwd)"
CORPUS="$WT/evidence/2026-10-24/pddrift-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$LABEL"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
PATHS="scripts/sim-harness.js scripts/policies index.html src/js src/data"
EXPECTED=""
for TRY in $(seq 1 20); do
  EXPECTED=$(cd "$WT" && git ls-tree -r --name-only "$SHA" -- $PATHS 2>/dev/null)
  [ -n "$EXPECTED" ] && [ "$(echo "$EXPECTED" | wc -l)" -ge 200 ] && break
  sleep 10
done
[ -z "$EXPECTED" ] && { echo "LSTREE FAIL LOUDLY $LABEL"; exit 2; }
# --- flap gate (probe write + git read must BOTH succeed) ---
GATED=0
for TRY in $(seq 1 60); do
  if printf "gate\n" > "$RUNDIR/gate.txt" 2>/dev/null && [ -s "$RUNDIR/gate.txt" ] && (cd "$WT" && git cat-file -p "$SHA:index.html" > "$RUNDIR/gate2.txt" 2>/dev/null) && [ -s "$RUNDIR/gate2.txt" ]; then
    GATED=1; echo "flap gate open for $LABEL (try $TRY)"; break
  fi
  sleep 30
done
rm -f "$RUNDIR/gate.txt" "$RUNDIR/gate2.txt" 2>/dev/null || true
[ "$GATED" != "1" ] && { echo "FLAP GATE FAIL LOUDLY $LABEL (30 min)"; exit 2; }
# --- fill rounds ---
FILLED=0
for ROUND in $(seq 1 20); do
  echo "$EXPECTED" | while IFS= read -r F; do
    [ -z "$F" ] && continue
    # Size-exact skip only: a flap EPERM mid-stream can leave a PARTIAL
    # file (size>0 but < blob size) — skipping on non-empty alone would
    # silently keep a truncated script. If the blob-size read flaps, do
    # NOT skip (retry the file); a false skip is worse than a rewrite.
    SZ=$(cd "$WT" && git cat-file -s "$SHA:$F" 2>/dev/null || echo FAIL)
    if [ "$SZ" != "FAIL" ] && [ -f "$RUNDIR/$F" ]; then
      ACT=$(stat -c %s "$RUNDIR/$F" 2>/dev/null || echo -1)
      [ "$ACT" = "$SZ" ] && continue
    fi
    DIR=$(dirname "$F")
    for TRY in $(seq 1 5); do
      mkdir -p "$RUNDIR/$DIR" 2>/dev/null || true
      BSZ=$(cd "$WT" && git cat-file -s "$SHA:$F" 2>/dev/null || echo FAIL)
      [ "$BSZ" = "FAIL" ] && { sleep 2; continue; }
      if (cd "$WT" && git cat-file -p "$SHA:$F" > "$RUNDIR/$F.tmp" 2>/dev/null); then
        TSZ=$(stat -c %s "$RUNDIR/$F.tmp" 2>/dev/null || echo -1)
        if [ "$TSZ" = "$BSZ" ]; then mv "$RUNDIR/$F.tmp" "$RUNDIR/$F" 2>/dev/null && break; fi
      fi
      rm -f "$RUNDIR/$F.tmp" 2>/dev/null || true
      sleep 2
    done
  done
  MISSING_N=0
  while IFS= read -r F; do
    [ -z "$F" ] && continue
    if [ ! -f "$RUNDIR/$F" ]; then MISSING_N=$((MISSING_N + 1)); continue; fi
    if [ ! -s "$RUNDIR/$F" ]; then
      SZ=$(cd "$WT" && git cat-file -s "$SHA:$F" 2>/dev/null || echo 0)
      [ "${SZ:-0}" != "0" ] && MISSING_N=$((MISSING_N + 1))
    fi
  done <<EOF
$EXPECTED
EOF
  echo "fill $LABEL round $ROUND: $MISSING_N files still missing (quick check)"
  # STRICT verify (size-exact vs git blobs, one ls-tree call): the quick
  # check's per-file `git cat-file -s` can flap to 0 and falsely pass a
  # 0-byte casualty as legit-empty — a 0-byte src/js file would SILENTLY
  # drop a system from the sweep. Only a size-exact pass breaks the loop.
  STRICT_OK=0
  for VTRY in $(seq 1 10); do
    MAP=$(cd "$WT" && git ls-tree -r -l "$SHA" -- $PATHS 2>/dev/null | awk '{print $4"\t"$5}')
    [ -z "$MAP" ] && { sleep 5; continue; }
    # BAD list via command substitution (pipe, never a file — a file-based
    # BAD list could flap to empty and falsely pass a casualty).
    BADLIST=$(echo "$MAP" | while IFS="$(printf '\t')" read -r SZ P; do
      [ -z "$P" ] && continue
      ACT=$(stat -c %s "$RUNDIR/$P" 2>/dev/null || echo -1)
      [ "$ACT" != "$SZ" ] && echo "BAD $P"
    done)
    if [ -z "$BADLIST" ]; then STRICT_OK=1; break; fi
    sleep 5
  done
  if [ "$STRICT_OK" = "1" ] && [ -f "$RUNDIR/scripts/sim-harness.js" ] && [ -f "$RUNDIR/src/js/game.js" ]; then
    FILLED=1; echo "perfile $LABEL filled on round $ROUND (strict size-exact)"; break
  fi
  sleep 30
done
[ "$FILLED" != "1" ] && { echo "PERFILE FILL FAIL LOUDLY $LABEL (20 rounds)"; exit 2; }
for TRY in $(seq 1 40); do
  SSZ=$(stat -c %s "$WT/scripts/sweep-pddrift-b.js" 2>/dev/null || echo -1)
  if cp "$WT/scripts/sweep-pddrift-b.js" "$RUNDIR/scripts/sweep-pddrift-b.js" 2>/dev/null; then
    DSZ=$(stat -c %s "$RUNDIR/scripts/sweep-pddrift-b.js" 2>/dev/null || echo -1)
    [ "$DSZ" = "$SSZ" ] && break
  fi
  sleep 2
  [ "$TRY" = "40" ] && { echo "DRIVER COPY FAIL LOUDLY $LABEL"; exit 2; }
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
