#!/bin/bash
# journey-succession-r224 panel runner — Lane B r224 (r202 runner, rename only).
# Runs pilot 34301 first; expands to 34302-34304 + smoke 33998 only if the
# pilot exits 0 with a valid stdout.json (prereg: pilot first).
# Launched with nohup so it survives the coordinator's execution limit;
# the adoption coordinator analyzes + gates from the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r224-panel.sh > evidence/2026-11-16/journey-succession-r224-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
EVID=evidence/2026-11-16
DRIVER=scripts/journey-succession-r224-20261116.js

run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  echo "=== seed $seed (EARLY_KILL_DAY=$ekd POST_DAYS=$pd) $(date -u +%H:%M:%SZ) ==="
  SEED="$seed" EARLY_KILL_DAY="$ekd" POST_DAYS="$pd" \
    node "$DRIVER" > "$EVID/journey-succession-r224-$seed.stdout.json" \
    2> "$EVID/journey-succession-r224-$seed.stderr.log"
  local rc=$?
  echo "seed $seed exit=$rc bytes=$(stat -c%s "$EVID/journey-succession-r224-$seed.stdout.json" 2>/dev/null || echo 0)"
  if [ "$rc" -ne 0 ]; then echo "STOP: seed $seed failed (exit $rc)"; return 1; fi
  if [ ! -s "$EVID/journey-succession-r224-$seed.stdout.json" ]; then echo "STOP: seed $seed stdout.json empty"; return 1; fi
  node -e "JSON.parse(require('fs').readFileSync('$EVID/journey-succession-r224-$seed.stdout.json','utf8'))" \
    || { echo "STOP: seed $seed stdout.json is not valid JSON"; return 1; }
  return 0
}

run_seed 34301 40 70 || exit 1
run_seed 34302 40 70 || exit 1
run_seed 34303 40 70 || exit 1
run_seed 34304 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE $(date -u +%H:%M:%SZ) ==="
node scripts/analyze-journey-succession-r224-20261116.js 34301 34302 34303 34304 33998 \
  > "$EVID/journey-succession-r224-analyzer.txt" 2> "$EVID/journey-succession-r224-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE $(date -u +%H:%M:%SZ) ==="
