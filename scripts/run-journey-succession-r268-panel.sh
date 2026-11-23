#!/bin/bash
# journey-succession-r268 panel runner — Lane B r268 (r263 runner, rename + seeds).
# SUPPLY SCREEN: a wide fresh band (34518-34541, 24 seeds) with WIT-SIT v3
# staging LIVE, so any supplied seed stages in-trajectory (r262 proved
# replay divergence — a two-phase re-run would not reproduce supply).
# Plus positive control 34403 (replay, known supply — descriptive) and
# smoke 33998 (standing control; snapshot must match r267 exactly).
# PREFIX r268 throughout. Launched with nohup so it survives the
# coordinator's execution limit; the coordinator analyzes + gates from
# the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r268-panel.sh stage > evidence/2026-11-23/journey-succession-r268-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "stage" ]; then
  echo "usage: bash scripts/run-journey-succession-r268-panel.sh <stage>" >&2
  exit 2
fi
PREFIX="r268"
export PREFIX
export EVID_DATE="2026-11-23"
EVID=evidence/2026-11-23
DRIVER=scripts/journey-succession-r268-20261123.js
ANALYZER=scripts/analyze-journey-succession-r268-20261123.js

run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  echo "=== leg $PREFIX seed $seed (EARLY_KILL_DAY=$ekd POST_DAYS=$pd) $(date -u +%H:%M:%SZ) ==="
  SEED="$seed" EARLY_KILL_DAY="$ekd" POST_DAYS="$pd" \
    node "$DRIVER" > "$EVID/journey-succession-${PREFIX}-$seed.stdout.json" \
    2> "$EVID/journey-succession-${PREFIX}-$seed.stderr.log"
  local rc=$?
  echo "seed $seed exit=$rc bytes=$(stat -c%s "$EVID/journey-succession-${PREFIX}-$seed.stdout.json" 2>/dev/null || echo 0)"
  if [ "$rc" -ne 0 ]; then echo "STOP: seed $seed failed (exit $rc)"; return 1; fi
  if [ ! -s "$EVID/journey-succession-${PREFIX}-$seed.stdout.json" ]; then echo "STOP: seed $seed stdout.json empty"; return 1; fi
  node -e "JSON.parse(require('fs').readFileSync('$EVID/journey-succession-${PREFIX}-$seed.stdout.json','utf8'))" \
    || { echo "STOP: seed $seed stdout.json is not valid JSON"; return 1; }
  return 0
}

# Pilot first (prereg): 34518 alone — the instrument test on this base;
# expand only if it exits 0 with a valid stdout.json.
run_seed 34518 40 70 || exit 1
for s in 34519 34520 34521 34522 34523 34524 34525 34526 34527 34528 34529 34530 34531 34532 34533 34534 34535 34536 34537 34538 34539 34540 34541; do
  run_seed "$s" 40 70 || exit 1
done
# Positive control (replay, known supply — descriptive, not a fresh-band seed).
run_seed 34403 40 70 || exit 1
# Smoke control (standing control; snapshot must match r267 exactly).
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34518 34519 34520 34521 34522 34523 34524 34525 34526 34527 34528 34529 34530 34531 34532 34533 34534 34535 34536 34537 34538 34539 34540 34541 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
