#!/bin/bash
# journey-succession-r263 panel runner — Lane B r263 (r262 runner, rename + seeds).
# Draws panel (prereg): the r263 driver stages a second mourning sitting
# for the same witnessed death the next day (WIT-SIT v2, cap 4/seed) so
# the REL-WIT pick gets >=3 single-fresh draws. Seeds are a FRESH BAND
# 34411-34416 (0 hits in all journey/sim preregs; 34403 NOT re-run —
# replay divergence proven r262) + smoke 33998 (standing control;
# snapshot must match r233 exactly). PREFIX r263 throughout.
# Launched with nohup so it survives the coordinator's execution limit;
# the adoption coordinator analyzes + gates from the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r263-panel.sh stage > evidence/2026-11-21/journey-succession-r263-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "stage" ]; then
  echo "usage: bash scripts/run-journey-succession-r263-panel.sh <stage>" >&2
  exit 2
fi
PREFIX="r263"
export PREFIX
export EVID_DATE="2026-11-21"
EVID=evidence/2026-11-21
DRIVER=scripts/journey-succession-r263-20261121.js
ANALYZER=scripts/analyze-journey-succession-r263-20261121.js

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

# Pilot first (prereg): 34411 alone — the WIT-SIT v2 instrument test;
# expand only if it exits 0 with a valid stdout.json.
run_seed 34411 40 70 || exit 1
run_seed 34412 40 70 || exit 1
run_seed 34413 40 70 || exit 1
run_seed 34414 40 70 || exit 1
run_seed 34415 40 70 || exit 1
run_seed 34416 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34411 34412 34413 34414 34415 34416 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
