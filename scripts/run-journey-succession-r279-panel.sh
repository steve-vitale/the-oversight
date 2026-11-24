#!/bin/bash
# journey-succession-r279 panel runner — Lane B r279 (r263 runner, rename + seeds).
# SUPPLY SCREEN: a wide fresh band (34542-34565, 24 seeds) with WIT-SIT v4
# staging LIVE, so any supplied seed stages in-trajectory (r262 proved
# replay divergence — a two-phase re-run would not reproduce supply).
# Plus positive control 34403 (replay, known supply — descriptive) and
# smoke 33998 (standing control; snapshot must match r268 exactly).
# PREFIX r279 throughout. Launched with nohup so it survives the
# coordinator's execution limit; the coordinator analyzes + gates from
# the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r279-panel.sh stage > evidence/2026-11-24/journey-succession-r279-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "stage" ]; then
  echo "usage: bash scripts/run-journey-succession-r279-panel.sh <stage>" >&2
  exit 2
fi
PREFIX="r279"
export PREFIX
export EVID_DATE="2026-11-24"
EVID=evidence/2026-11-24
DRIVER=scripts/journey-succession-r279-20261124.js
ANALYZER=scripts/analyze-journey-succession-r279-20261124.js

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

# Pilot first (prereg): 34542 alone — the instrument test on this base;
# expand only if it exits 0 with a valid stdout.json.
run_seed 34542 40 70 || exit 1
for s in 34543 34544 34545 34546 34547 34548 34549 34550 34551 34552 34553 34554 34555 34556 34557 34558 34559 34560 34561 34562 34563 34564 34565; do
  run_seed "$s" 40 70 || exit 1
done
# Positive control (replay, known supply — descriptive, not a fresh-band seed).
run_seed 34403 40 70 || exit 1
# Smoke control (standing control; snapshot must match r268 exactly).
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34542 34543 34544 34545 34546 34547 34548 34549 34550 34551 34552 34553 34554 34555 34556 34557 34558 34559 34560 34561 34562 34563 34564 34565 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
