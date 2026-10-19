#!/bin/bash
# sweep launcher: 10 (arm, policy) combos, 2 parallel (nproc=2, ~1.5GB RAM).
# Each combo runs 16 seeds x 180d death-aware in-process (sequential).
cd ~/workspace/worktrees/sim-winsupport-decomp
export FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1
combos=(
  "control leadfeast" "control belongfeast"
  "winsupport-full leadfeast" "winsupport-full belongfeast"
  "winsupport-triage leadfeast" "winsupport-triage belongfeast"
  "winsupport-posture leadfeast" "winsupport-posture belongfeast"
  "winsupport-gated leadfeast" "winsupport-gated belongfeast"
)
run_one() {
  local arm=$1 policy=$2
  local log=/tmp/sweep-wsd-${arm}-${policy}.log
  echo "[$(date -u +%FT%TZ)] START $arm/$policy" | tee -a "$log"
  ARM=$arm ONLY=$policy node scripts/probe-winsupportdecomp-20261019.js >>"$log" 2>&1
  echo "[$(date -u +%FT%TZ)] DONE $arm/$policy exit=$?" | tee -a "$log"
}
for combo in "${combos[@]}"; do
  set -- $combo
  # gate parallelism at 2
  while [ "$(jobs -r | wc -l)" -ge 2 ]; do sleep 20; done
  run_one "$1" "$2" &
done
wait
echo "ALL SWEEP COMBOS DONE"
