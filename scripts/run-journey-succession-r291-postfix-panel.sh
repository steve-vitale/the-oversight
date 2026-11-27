#!/bin/bash
# journey-succession-r291 POST-FIX panel runner — Lane B r291 (20261127T2300Z).
# Re-runs the FULL r291 band on the FIXED tip (mourning above naming in
# t2LatelyEvent) to judge REL-WIT after the fix. Same seeds, same driver,
# same analyzer — PREFIX=r291fix separates every output file (transcripts,
# tele, stdout, analyzer) from the instrument-only baseline (PREFIX=r291),
# which must NOT be overwritten: the before/after comparison needs both.
# Launched DETACHED via setsid nohup so it survives the coordinator's
# execution limit (the 1855Z panel died mid-seed-34605 the same way).
# Usage (from the worktree root):
#   setsid nohup bash scripts/run-journey-succession-r291-postfix-panel.sh > evidence/2026-11-27/journey-succession-r291fix-panel.log 2>&1 < /dev/null &
# The NEXT Lane B run adopts: read the postfix log + r291fix analyzer,
# judge REL-WIT on the post-fix panel, then merge. Do NOT delete the lock
# this run holds; the next run recovers it.
# SMOKE NOTE: control 33998 WILL move on the fixed tip (the fix changes
# which lately kind fires, which changes downstream RNG) — that is
# movement-by-design, not drift. Report the new smoke snapshot; do not
# judge it against the r279/r280 baseline.
set -u
cd "$(dirname "$0")/.." || exit 1
PREFIX="r291fix"
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

# Pilot first: 34590 alone — the fix check on this base; expand only if
# it exits 0 with a valid stdout.json.
run_seed 34590 40 70 || exit 1
for s in 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613; do
  run_seed "$s" 40 70 || exit 1
done
# Positive control (replay, known supply — descriptive, not a fresh-band seed).
run_seed 34403 40 70 || exit 1
# Smoke control (standing control; snapshot MOVES on the fixed tip by design — see header).
run_seed 33998 5 25 || exit 1
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
node "$ANALYZER" 34590 34591 34592 34593 34594 34595 34596 34597 34598 34599 34600 34601 34602 34603 34604 34605 34606 34607 34608 34609 34610 34611 34612 34613 34403 33998 \
  > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
