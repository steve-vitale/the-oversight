#!/bin/bash
# contactrec2-det-20261031.sh — det-gate for sim-contactrec2-a (D3).
# Recorder ON vs OFF (candidate contactrec2 recorder), seeds 87104/87127.
# Compares dayHash arrays + end fields (gameDays, won, national, table,
# maxWave, endScaleRank). Any difference fails the gate (exit nonzero).
# Touches NO src/ file: the candidate recorder is policy-side only, so
# there is no emission ON/OFF leg to run (unlike contactrec-a's D2).
# Worktree scratch dirs only (never /tmp, never the judged corpus).
# Usage: bash scripts/contactrec2-det-20261031.sh
set -u
cd "$(dirname "$0")/.." || exit 2
REPO=$PWD
SCRATCH=$REPO/scratch-contactrec2-det
rm -rf "$SCRATCH"
mkdir -p "$SCRATCH/on" "$SCRATCH/off"
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
echo "== det ON (87104,87127) =="
CONTACTREC2=1 SEEDS=87104,87127 node scripts/contactrec2-sweep-20261031.js > "$SCRATCH/on.jsonl" 2> "$SCRATCH/on.err" || { echo "DET FAIL: ON sweep error"; cat "$SCRATCH/on.err"; exit 1; }
cat "$SCRATCH/on.err"
node scripts/contactrec2-split-20261031.js "$SCRATCH/on.jsonl" "$SCRATCH/on" || { echo "DET FAIL: ON split error"; exit 1; }
echo "== det OFF (87104,87127) =="
SEEDS=87104,87127 node scripts/contactrec2-sweep-20261031.js > "$SCRATCH/off.jsonl" 2> "$SCRATCH/off.err" || { echo "DET FAIL: OFF sweep error"; cat "$SCRATCH/off.err"; exit 1; }
cat "$SCRATCH/off.err"
node scripts/contactrec2-split-20261031.js "$SCRATCH/off.jsonl" "$SCRATCH/off" || { echo "DET FAIL: OFF split error"; exit 1; }
echo "== det compare =="
node scripts/contactrec2-det-compare-20261031.js "$SCRATCH/on" "$SCRATCH/off" 87104 87127
RC=$?
if [ $RC -ne 0 ]; then echo "DET-GATE FAILED"; exit $RC; fi
echo "DET-GATE PASSED"
