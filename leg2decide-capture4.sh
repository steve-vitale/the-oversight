#!/bin/bash
# leg2decide-capture4.sh — probe-first, fresh-session capture runner for sim-leg2decide-b.
#
# Why a fourth runner: the 2026-10-24 EPERM flap defeats every in-session
# retry design — long-running sessions that start bad never recover, and
# writer loops inside them burn their budget for nothing, while fresh
# sessions spawned moments later write fine. The retry unit must therefore
# be a FRESH SESSION, and each session must prove itself before burning
# sim time: this runner (1) probe-writes the corpus dir FIRST and exits
# immediately (code 2) if the probe fails — a bad session costs ~1s, not
# a 10-minute writer budget; (2) on a good probe, runs cells with a SHORT
# writer budget (30 fresh-process attempts ≈ 30s) and ABORTS the batch on
# the first cell failure (the session flipped; re-probe in a new session).
# The caller (the agent) re-runs this script in a NEW session until every
# cell lands; the per-cell skip-valid check makes re-runs cheap.
# Usage: bash leg2decide-capture4.sh pilot-missing|rest
# Exit 0 = batch complete (or all cells already valid); 1 = batch aborted
# on a cell failure (re-run); 2 = probe failed, session bad (re-run).
set -u
WT=~/workspace/worktrees/sim-leg2decide-b
CORPUS="$WT/evidence/2026-10-24/leg2decide-b-corpus"
PARENT=1f24a4ef04a857d33138fd0845cfa83df688285c
COMMIT=75fdd92587ad9d83bb12f05da535cdfb49255835
MAX_ATTEMPTS=30

PROBE="$CORPUS/.cap4-probe-$$"
if ! echo probe > "$PROBE" 2>/dev/null; then
  echo "CAP4-PROBE-FAIL (this session cannot write; re-run in a new session)"
  exit 2
fi
rm -f "$PROBE"
echo "CAP4-PROBE-OK (this session can write; running batch)"

run_one() { # $1=sha $2=side $3=pd $4=seed
  local sha="$1" side="$2" pd="$3" seed="$4"
  local short="${sha:0:8}"
  local out="$CORPUS/leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json"
  if python3 -c "import json,sys; d=json.load(open('$out')); assert d['anchorCommit']=='$sha' and d['seed']==$seed" 2>/dev/null; then
    echo "SKIP $short $side s$seed (already valid)"
    return 0
  fi
  echo "CAP4-START $short $side s$seed"
  local raw
  raw=$(cd "$WT/bisect-scratch/$sha" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$sha" SIDE="$side" PLENTYDEPRI="$pd" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$seed" DAYS=100 STDOUT_SPLIT=1 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-${short}-${side}-dg1-leadfeast.json" node scripts/sweep-leg2drift-b.js)
  local payload sweep
  payload=$(printf '%s\n' "$raw" | awk '/^@@FILE /{getline; print; exit}')
  sweep=$(printf '%s\n' "$raw" | awk '/^@@SWEEP/{getline; print; exit}')
  if [ -z "$payload" ]; then
    echo "CAP4-NO-PAYLOAD $short $side s$seed"
    return 1
  fi
  local n=0
  while true; do
    if LEG2DECIDE_PAYLOAD="$payload" LEG2DECIDE_SWEEP="$sweep" python3 "$WT/scripts/write-leg2decide-payload.py" "$CORPUS" "$sha" "$side" "$seed" 2>/dev/null; then
      echo "CAP4-DONE $short $side s$seed (writer attempt $((n + 1)))"
      return 0
    fi
    n=$((n + 1))
    if [ "$n" -ge "$MAX_ATTEMPTS" ]; then
      echo "CAP4-ABORT $short $side s$seed after $n attempts (session flipped; re-run in a new session)"
      return 1
    fi
    sleep 1
  done
}

SUBSET="${1:?usage: leg2decide-capture4.sh pilot-missing|rest}"
echo "CAP4 RUNNER START subset=$SUBSET pid=$$"
case "$SUBSET" in
  pilot-missing)
    for seed in 9272 9273; do run_one "$PARENT" pd1 1 "$seed" || exit 1; done
    for side_pd in "pd0 0" "pd1 1"; do
      set -- $side_pd
      for seed in 9266 9267 9268 9269 9270 9271 9272 9273; do run_one "$COMMIT" "$1" "$2" "$seed" || exit 1; done
    done
    ;;
  rest)
    for sha in "$PARENT" "$COMMIT"; do
      for side_pd in "pd0 0" "pd1 1"; do
        set -- $side_pd
        for seed in 9274 9275 9276 9277 9278 9279 9280 9281; do run_one "$sha" "$1" "$2" "$seed" || exit 1; done
      done
    done
    ;;
  *) echo "unknown subset $SUBSET"; exit 2 ;;
esac
echo "CAP4 RUNNER DONE subset=$SUBSET"
