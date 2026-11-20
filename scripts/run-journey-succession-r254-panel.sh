#!/bin/bash
# journey-succession-r254 panel runner — Lane B r254 (r248 runner, rename + leg).
# Two-leg matched panel (prereg §15): control (game change absent) and arm
# (game change present) run identical seeds with the identical driver; the
# leg name separates their evidence files via PREFIX (r254ctl / r254arm).
# Runs pilot 34371 first; expands to 34362 (dedicated re-run) + 34372-34374
# + smoke 33998 only if the pilot exits 0 with a valid stdout.json
# (prereg: pilot first). Launched with nohup so it survives the
# coordinator's execution limit; the adoption coordinator analyzes +
# gates from the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r254-panel.sh ctl > evidence/2026-11-20/journey-succession-r254ctl-panel.log 2>&1 &
#   nohup bash scripts/run-journey-succession-r254-panel.sh arm > evidence/2026-11-20/journey-succession-r254arm-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
LEG="${1:-}"
if [ "$LEG" != "ctl" ] && [ "$LEG" != "arm" ]; then
  echo "usage: bash scripts/run-journey-succession-r254-panel.sh <ctl|arm>" >&2
  exit 2
fi
PREFIX="r254${LEG}"
export PREFIX
export EVID_DATE="2026-11-20"
EVID=evidence/2026-11-20
DRIVER=scripts/journey-succession-r254-20261120.js
ANALYZER=scripts/analyze-journey-succession-r254-20261120.js

run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  echo "=== leg $LEG seed $seed (EARLY_KILL_DAY=$ekd POST_DAYS=$pd) $(date -u +%H:%M:%SZ) ==="
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

run_seed 34371 40 70 || exit 1
run_seed 34362 40 70 || exit 1
run_seed 34372 40 70 || exit 1
run_seed 34373 40 70 || exit 1
run_seed 34374 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $LEG $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34371 34362 34372 34373 34374 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $LEG $(date -u +%H:%M:%SZ) ==="
