#!/bin/bash
# wave3enc-det-20261031.sh — det-gate for sim-wave3enc-a.
# Runs 2 pilot seeds (87104, 87127) recorder ON vs OFF (same stack,
# same seeds) to worktree scratch dirs (NEVER /tmp, never the judged
# corpus) and compares dayHash arrays + end fields. Any difference
# fails the gate (exit nonzero) — the run stops until explained.
# Usage: bash scripts/wave3enc-det-20261031.sh
set -u
cd "$(dirname "$0")/.." || exit 2
REPO=$PWD
SCRATCH=$REPO/scratch-wave3enc-det
rm -rf "$SCRATCH"
mkdir -p "$SCRATCH/on" "$SCRATCH/off"
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
echo "== det ON (87104,87127) =="
WAVE3ENC=1 SEEDS=87104,87127 node scripts/wave3enc-sweep-20261031.js > "$SCRATCH/on.jsonl" 2> "$SCRATCH/on.err" || { echo "DET FAIL: ON sweep error"; cat "$SCRATCH/on.err"; exit 1; }
cat "$SCRATCH/on.err"
node scripts/wave3enc-split-20261031.js "$SCRATCH/on.jsonl" "$SCRATCH/on" || { echo "DET FAIL: ON split error"; exit 1; }
echo "== det OFF (87104,87127) =="
SEEDS=87104,87127 node scripts/wave3enc-sweep-20261031.js > "$SCRATCH/off.jsonl" 2> "$SCRATCH/off.err" || { echo "DET FAIL: OFF sweep error"; cat "$SCRATCH/off.err"; exit 1; }
cat "$SCRATCH/off.err"
node scripts/wave3enc-split-20261031.js "$SCRATCH/off.jsonl" "$SCRATCH/off" || { echo "DET FAIL: OFF split error"; exit 1; }
echo "== det compare =="
node scripts/wave3enc-det-compare-20261031.js "$SCRATCH/on" "$SCRATCH/off" 87104 87127
RC=$?
if [ $RC -ne 0 ]; then echo "DET-GATE FAILED"; exit $RC; fi
echo "DET-GATE PASSED"
