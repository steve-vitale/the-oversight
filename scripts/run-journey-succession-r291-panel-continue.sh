#!/bin/bash
cd ~/workspace/worktrees/journey2-7 || exit 1
EVID=evidence/2026-11-27
export PREFIX=r291 EVID_DATE=2026-11-27
run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  echo "=== leg r291 seed $seed (EARLY_KILL_DAY=$ekd POST_DAYS=$pd) $(date -u +%H:%M:%SZ) ==="
  SEED="$seed" EARLY_KILL_DAY="$ekd" POST_DAYS="$pd" node scripts/journey-succession-r291-20261127.js > "$EVID/journey-succession-r291-$seed.stdout.json" 2> "$EVID/journey-succession-r291-$seed.stderr.log"
  local rc=$?
  echo "seed $seed exit=$rc bytes=$(stat -c%s "$EVID/journey-succession-r291-$seed.stdout.json" 2>/dev/null || echo 0)"
  if [ "$rc" -ne 0 ]; then echo "STOP: seed $seed failed (exit $rc)"; return 1; fi
  if [ ! -s "$EVID/journey-succession-r291-$seed.stdout.json" ]; then echo "STOP: seed $seed stdout.json empty"; return 1; fi
  node -e "JSON.parse(require('fs').readFileSync('$EVID/journey-succession-r291-$seed.stdout.json','utf8'))" || { echo "STOP: seed $seed stdout.json is not valid JSON"; return 1; }
  return 0
}
for s in 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
run_seed 34403 40 70 || exit 1
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg r291 $(date -u +%H:%M:%SZ) ==="
node scripts/analyze-journey-succession-r291-20261127.js 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 > "$EVID/journey-succession-r291-analyzer.txt" 2> "$EVID/journey-succession-r291-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg r291 $(date -u +%H:%M:%SZ) ==="
