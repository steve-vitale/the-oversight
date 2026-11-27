#!/bin/bash
# journey-succession-r291 panel RESUME — Lane B r291 adoption (20261127T2200Z).
# The 1855Z run's detached panel died mid-seed-34605 when its coordinator hit
# the 3600s limit (SIGTERM tore down the whole tree; panel log stops
# 19:54:58Z; 34605 stdout.json is 0 bytes). Seeds 34594-34604 are complete
# and valid JSON; this resume runs only the remainder: 34605-34613 +
# control 34403 + smoke 33998, then the analyzer over the full band.
# Usage (from the worktree root):
#   bash scripts/run-journey-succession-r291-panel-resume.sh > evidence/2026-11-27/journey-succession-r291-panel-resume.log 2>&1
set -u
cd "$(dirname "$0")/.." || exit 1
export PREFIX=r291 EVID_DATE=2026-11-27
EVID=evidence/2026-11-27
DRIVER=scripts/journey-succession-r291-20261127.js
ANALYZER=scripts/analyze-journey-succession-r291-20261127.js

run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  echo "=== leg r291 seed $seed (EARLY_KILL_DAY=$ekd POST_DAYS=$pd) $(date -u +%H:%M:%SZ) ==="
  SEED="$seed" EARLY_KILL_DAY="$ekd" POST_DAYS="$pd" \
    node "$DRIVER" > "$EVID/journey-succession-r291-$seed.stdout.json" \
    2> "$EVID/journey-succession-r291-$seed.stderr.log"
  local rc=$?
  echo "seed $seed exit=$rc bytes=$(stat -c%s "$EVID/journey-succession-r291-$seed.stdout.json" 2>/dev/null || echo 0)"
  if [ "$rc" -ne 0 ]; then echo "STOP: seed $seed failed (exit $rc)"; return 1; fi
  if [ ! -s "$EVID/journey-succession-r291-$seed.stdout.json" ]; then echo "STOP: seed $seed stdout.json empty"; return 1; fi
  node -e "JSON.parse(require('fs').readFileSync('$EVID/journey-succession-r291-$seed.stdout.json','utf8'))" \
    || { echo "STOP: seed $seed stdout.json is not valid JSON"; return 1; }
  return 0
}
for s in 34605 34606 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
run_seed 34403 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg r291 $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 > "$EVID/journey-succession-r291-analyzer.txt" 2> "$EVID/journey-succession-r291-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg r291 $(date -u +%H:%M:%SZ) ==="
