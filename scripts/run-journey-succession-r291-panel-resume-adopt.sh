#!/bin/bash
# journey-succession-r291 panel RESUME-ADOPT — Lane B r291 adoption (20261127T2200Z).
# The 2200Z adoption's foreground resume (34605-34606 done) was killed at
# 22:16Z so the remainder could be relaunched DETACHED via setsid nohup:
# the adoption run itself cannot outlive its 3600s limit, and a foreground
# panel dies with it (the 1855Z run died the same way mid-34605). The
# setsid child survives the coordinator timeout — the r291 hbloop proved
# the mechanism by outliving the 1855Z coordinator until the VM restart.
# This script runs the remainder: 34607-34613 + control 34403, then the
# analyzer over the full band (34590-34613 + 34403 + 33998). Smoke 33998
# is NOT re-run: the adoption already ran it in parallel (exit 0) and it
# matches the r279 re-baseline exactly (d6 Heinrich -> Grace, relPost 33,
# relD14 47, relEnd 50, selfId grace_obi); its file stands.
# Launched: setsid nohup bash scripts/run-journey-succession-r291-panel-resume-adopt.sh > evidence/2026-11-27/journey-succession-r291-panel-resume-adopt.log 2>&1 < /dev/null &
# The NEXT Lane B run adopts: read the adopt log + analyzer output, gate,
# merge. Do NOT delete the lock this run holds; the next run recovers it.
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
for s in 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
run_seed 34403 40 70 || exit 1
echo "=== PANEL COMPLETE leg r291 $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 > "$EVID/journey-succession-r291-analyzer.txt" 2> "$EVID/journey-succession-r291-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg r291 $(date -u +%H:%M:%SZ) ==="
