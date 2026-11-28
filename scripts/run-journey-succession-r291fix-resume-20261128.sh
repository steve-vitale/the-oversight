#!/bin/bash
# journey-succession-r291 POST-FIX panel RESUME — Lane B r292 adoption (20261128T0000Z).
# The 2300Z run's postfix panel died mid-seed-34593 (coordinator SIGTERM
# ~23:34Z tore down the detached panel; 34593 stdout.json truncated, no
# tele file). Seeds 34590-34592 completed exit=0 with valid JSON; this
# resumes at 34593 and runs the remaining band + controls + analyzer.
# Skip-if-valid: a seed is skipped only when its stdout.json exists AND
# parses as JSON. Baseline (PREFIX=r291) is never touched.
# Usage (from the worktree root):
#   setsid nohup bash scripts/run-journey-succession-r291fix-resume-20261128.sh >> evidence/2026-11-27/journey-succession-r291fix-panel.log 2>&1 < /dev/null &
# The NEXT Lane B run adopts: read the postfix log + r291fix analyzer,
# judge REL-WIT on the post-fix panel, then merge. Do NOT delete the lock
# this run holds; the next run recovers it.
set -u
cd "$(dirname "$0")/.." || exit 1
PREFIX="r291fix"
export PREFIX
export EVID_DATE="2026-11-27"
EVID=evidence/2026-11-27
DRIVER=scripts/journey-succession-r291-20261127.js
ANALYZER=scripts/analyze-journey-succession-r291-20261127.js

seed_done() {
  local f="$EVID/journey-succession-${PREFIX}-$1.stdout.json"
  [ -s "$f" ] && node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null
}

run_seed() {
  local seed="$1" ekd="$2" pd="$3"
  if seed_done "$seed"; then echo "=== leg $PREFIX seed $seed SKIPPED (valid stdout.json already present) $(date -u +%H:%M:%SZ) ==="; return 0; fi
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

for s in 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
# Positive control (replay, known supply — descriptive, not a fresh-band seed).
run_seed 34403 40 70 || exit 1
# Smoke control (standing control; snapshot MOVES on the fixed tip by design).
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
