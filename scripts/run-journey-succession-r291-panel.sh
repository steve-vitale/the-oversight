#!/bin/bash
# journey-succession-r291 panel runner — Lane B r291 (r280 runner, rename + seeds).
# SUPPLY SCREEN: a wide fresh band (34542-34565, 24 seeds) with WIT-SIT v4
# staging LIVE, so any supplied seed stages in-trajectory (r262 proved
# replay divergence — a two-phase re-run would not reproduce supply).
# Plus positive control 34403 (replay, known supply — descriptive) and
# smoke 33998 (standing control; snapshot must match r268 exactly).
# PREFIX r280 throughout. Launched with nohup so it survives the
# coordinator's execution limit; the coordinator analyzes + gates from
# the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r291-panel.sh stage > evidence/2026-11-27/journey-succession-r291-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "stage" ]; then
  echo "usage: bash scripts/run-journey-succession-r280-panel.sh <stage>" >&2
  exit 2
fi
PREFIX="r291"
export PREFIX
export EVID_DATE="2026-11-27"
EVID=evidence/2026-11-27
DRIVER=scripts/journey-succession-r291-20261127.js
ANALYZER=scripts/analyze-journey-succession-r291-20261127.js

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

# Pilot first (prereg): 34590 alone — the instrument test on this base;
# expand only if it exits 0 with a valid stdout.json.
run_seed 34590 40 70 || exit 1
for s in 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
# Positive control (replay, known supply — descriptive, not a fresh-band seed).
run_seed 34403 40 70 || exit 1
# Smoke control (standing control; snapshot must match r268 exactly).
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
