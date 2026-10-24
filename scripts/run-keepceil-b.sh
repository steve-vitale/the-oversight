#!/bin/bash
# run-keepceil-b.sh — KEEPCEIL pilot/confirm runner (sim-keepceil-b).
# Pilot: seeds 9250-9257, all cells (kc4000/kc6000/kc8000 x leadfeast/
# belongfeast) + kcoff leadfeast (OFF-identity control). Confirm: seeds
# 9258-9265, same cells (kcoff leadfeast optional — already proven at
# pilot; re-run only if the pilot identity check fails).
# Usage: STAGE=pilot|confirm bash scripts/run-keepceil-b.sh
# The sweep merges summaries by seed, so pilot + confirm share one 16-row
# summary per cell.
set -u
cd ~/workspace/worktrees/sim-keepceil-b
export FEASTSCALE_R13=1 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
if [ "${STAGE:-pilot}" = "pilot" ]; then
  SEEDS="9250,9251,9252,9253,9254,9255,9256,9257"
else
  SEEDS="9258,9259,9260,9261,9262,9263,9264,9265"
fi
run_cell() { # side keepceil_or_UNSET policy
  local side="$1" kc="$2" pol="$3"
  if [ "$kc" = "UNSET" ]; then unset KEEPCEIL; else export KEEPCEIL="$kc"; fi
  echo "=== cell $side $pol seeds $SEEDS ==="
  SIDE="$side" POLICY="$pol" SEEDS="$SEEDS" DAYS=100 node scripts/sweep-keepceil-b.js || { echo "CELL FAIL LOUDLY $side $pol"; return 1; }
}
for pol in leadfeast belongfeast; do
  run_cell kc4000 4000 "$pol" || exit 2
  run_cell kc6000 6000 "$pol" || exit 2
  run_cell kc8000 8000 "$pol" || exit 2
done
if [ "${STAGE:-pilot}" = "pilot" ]; then
  run_cell kcoff UNSET leadfeast || exit 2
fi
echo "RUNNER DONE stage=${STAGE:-pilot}"
