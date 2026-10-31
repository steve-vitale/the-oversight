#!/bin/bash
# contactrec-det-20261031.sh — det-gates for sim-contactrec-a.
# D1: recorder ON vs OFF (emission ON in both), seeds 87104/87127.
# D2: emission ON vs OFF (recorder OFF in both), seeds 87104/87127.
# Each leg compares dayHash arrays + end fields (gameDays, won,
# national, table, maxWave, endScaleRank) via contactrec-det-compare.
# Any difference fails the gate (exit nonzero) — the run stops.
# Emission OFF is produced by swapping in the HEAD copy of
# src/js/fieldFights.js, then restoring the worktree copy from a
# scratch backup and verifying its hash matches the pre-swap hash.
# Worktree scratch dirs only (never /tmp, never the judged corpus).
# Usage: bash scripts/contactrec-det-20261031.sh
set -u
cd "$(dirname "$0")/.." || exit 2
REPO=$PWD
SCRATCH=$REPO/scratch-contactrec-det
rm -rf "$SCRATCH"
mkdir -p "$SCRATCH/d1on" "$SCRATCH/d1off" "$SCRATCH/d2on" "$SCRATCH/d2off"
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
echo "== D1 recorder ON (87104,87127) =="
CONTACTREC=1 SEEDS=87104,87127 node scripts/contactrec-sweep-20261031.js > "$SCRATCH/d1on.jsonl" 2> "$SCRATCH/d1on.err" || { echo "DET FAIL: D1 ON sweep error"; cat "$SCRATCH/d1on.err"; exit 1; }
cat "$SCRATCH/d1on.err"
node scripts/contactrec-split-20261031.js "$SCRATCH/d1on.jsonl" "$SCRATCH/d1on" || { echo "DET FAIL: D1 ON split error"; exit 1; }
echo "== D1 recorder OFF (87104,87127) =="
SEEDS=87104,87127 node scripts/contactrec-sweep-20261031.js > "$SCRATCH/d1off.jsonl" 2> "$SCRATCH/d1off.err" || { echo "DET FAIL: D1 OFF sweep error"; cat "$SCRATCH/d1off.err"; exit 1; }
cat "$SCRATCH/d1off.err"
node scripts/contactrec-split-20261031.js "$SCRATCH/d1off.jsonl" "$SCRATCH/d1off" || { echo "DET FAIL: D1 OFF split error"; exit 1; }
echo "== D1 compare =="
node scripts/contactrec-det-compare-20261031.js "$SCRATCH/d1on" "$SCRATCH/d1off" 87104 87127 || { echo "DET-GATE D1 FAILED"; exit 1; }
echo "D1 PASSED"
echo "== D2 emission ON, recorder OFF (87104,87127) =="
SEEDS=87104,87127 node scripts/contactrec-sweep-20261031.js > "$SCRATCH/d2on.jsonl" 2> "$SCRATCH/d2on.err" || { echo "DET FAIL: D2 ON sweep error"; cat "$SCRATCH/d2on.err"; exit 1; }
cat "$SCRATCH/d2on.err"
node scripts/contactrec-split-20261031.js "$SCRATCH/d2on.jsonl" "$SCRATCH/d2on" || { echo "DET FAIL: D2 ON split error"; exit 1; }
echo "== D2 emission OFF: swap in HEAD fieldFights.js, run, restore =="
cp src/js/fieldFights.js "$SCRATCH/fieldFights.contactrec.bak"
BEFORE=$(git hash-object src/js/fieldFights.js)
git show HEAD:src/js/fieldFights.js > src/js/fieldFights.js || { echo "DET FAIL: HEAD checkout failed"; cp "$SCRATCH/fieldFights.contactrec.bak" src/js/fieldFights.js; exit 1; }
SEEDS=87104,87127 node scripts/contactrec-sweep-20261031.js > "$SCRATCH/d2off.jsonl" 2> "$SCRATCH/d2off.err"
RC=$?
cp "$SCRATCH/fieldFights.contactrec.bak" src/js/fieldFights.js
AFTER=$(git hash-object src/js/fieldFights.js)
if [ "$BEFORE" != "$AFTER" ]; then echo "DET FAIL: fieldFights.js restore hash mismatch ($BEFORE vs $AFTER)"; exit 1; fi
if [ $RC -ne 0 ]; then echo "DET FAIL: D2 OFF sweep error"; cat "$SCRATCH/d2off.err"; exit 1; fi
cat "$SCRATCH/d2off.err"
node scripts/contactrec-split-20261031.js "$SCRATCH/d2off.jsonl" "$SCRATCH/d2off" || { echo "DET FAIL: D2 OFF split error"; exit 1; }
echo "== D2 compare =="
node scripts/contactrec-det-compare-20261031.js "$SCRATCH/d2on" "$SCRATCH/d2off" 87104 87127 || { echo "DET-GATE D2 FAILED"; exit 1; }
echo "D2 PASSED"
echo "DET-GATES PASSED (D1 + D2)"
