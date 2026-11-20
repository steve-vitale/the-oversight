#!/bin/bash
# journey-succession-r258 panel runner — Lane B r258 (r254 runner, rename + modes).
# Supply-first panel (prereg §15): Phase 1 SCREEN runs the fresh band on
# the base (fix present, PREFIX r258scr); Phase 2 CONTROL runs the supply
# seeds named by the screen's WITNESS-CENSUS with the r254 fix reverted
# in the worktree (PREFIX r258ctl). The arm leg for the pair is the
# screen's runs on those seeds, re-analyzed (PREFIX=r258scr, output to
# the r258arm analyzer filename) — no re-run unless a game fix lands
# mid-run (see prereg).
# Launched with nohup so it survives the coordinator's execution limit;
# the adoption coordinator analyzes + gates from the on-disk files.
# Usage (from the worktree root):
#   nohup bash scripts/run-journey-succession-r258-panel.sh screen > evidence/2026-11-20/journey-succession-r258scr-panel.log 2>&1 &
#   nohup bash scripts/run-journey-succession-r258-panel.sh ctl 34403 34407 > evidence/2026-11-20/journey-succession-r258ctl-panel.log 2>&1 &
set -u
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-}"
if [ "$MODE" != "screen" ] && [ "$MODE" != "ctl" ]; then
  echo "usage: bash scripts/run-journey-succession-r258-panel.sh <screen|ctl> [seeds...]" >&2
  exit 2
fi
if [ "$MODE" = "screen" ]; then
  PREFIX="r258scr"
  SEEDS="34401 34402 34403 34404 34405 34406 34407 34408"
else
  PREFIX="r258ctl"
  shift
  if [ "$#" -eq 0 ]; then echo "ctl mode needs at least one supply seed" >&2; exit 2; fi
  SEEDS="$*"
fi
export PREFIX
export EVID_DATE="2026-11-20"
EVID=evidence/2026-11-20
DRIVER=scripts/journey-succession-r258-20261120.js
ANALYZER=scripts/analyze-journey-succession-r258-20261120.js

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

if [ "$MODE" = "screen" ]; then
  # Pilot first (prereg): 34401 alone; expand only if it exits 0.
  run_seed 34401 40 70 || exit 1
  run_seed 34402 40 70 || exit 1
  run_seed 34403 40 70 || exit 1
  run_seed 34404 40 70 || exit 1
  run_seed 34405 40 70 || exit 1
  run_seed 34406 40 70 || exit 1
  run_seed 34407 40 70 || exit 1
  run_seed 34408 40 70 || exit 1
  run_seed 33998 5 25 || exit 1
else
  for s in $SEEDS; do run_seed "$s" 40 70 || exit 1; done
  run_seed 33998 5 25 || exit 1
fi
echo "=== PANEL COMPLETE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
if [ "$MODE" = "screen" ]; then
  node "$ANALYZER" 34401 34402 34403 34404 34405 34406 34407 34408 33998 \
    > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
else
  node "$ANALYZER" $SEEDS 33998 \
    > "$EVID/journey-succession-${PREFIX}-analyzer.txt" 2> "$EVID/journey-succession-${PREFIX}-analyzer.stderr.log"
fi
echo "analyzer exit=$?"
echo "=== DONE leg $PREFIX $(date -u +%H:%M:%SZ) ==="
