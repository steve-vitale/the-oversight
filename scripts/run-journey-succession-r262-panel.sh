#!/bin/bash
# journey-succession-r262 panel runner — Lane B r262 (r258 runner, rename + modes).
# Staging panel (prereg): the r262 driver stages a mourning sitting on a
# witnessed death in EITHER phase (pre-death scan added). Seeds are
# declared replays, not a fresh band — the point is staging, not supply
# screening: 34403 (KNOWN supply — Karimi ambush, witnesses Giulia +
# Grace) + smoke 33998 (standing control; snapshot must match r233
# exactly). PREFIX r262 throughout; no control leg (the M12 fix does
# not touch mourning; the driver change is instrument-only).
# Launched with nohup so it survives the coordinator's execution limit;
# the adoption coordinator analyzes + gates from the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r262-panel.sh stage > evidence/2026-11-21/journey-succession-r262-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "stage" ]; then
  echo "usage: bash scripts/run-journey-succession-r262-panel.sh <stage>" >&2
  exit 2
fi
PREFIX="r262"
export PREFIX
export EVID_DATE="2026-11-21"
EVID=evidence/2026-11-21
DRIVER=scripts/journey-succession-r262-20261121.js
ANALYZER=scripts/analyze-journey-succession-r262-20261121.js

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

# Pilot first (prereg): 34403 alone; expand to the smoke only if it exits 0.
run_seed 34403 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
