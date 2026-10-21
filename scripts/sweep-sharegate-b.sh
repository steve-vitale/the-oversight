#!/bin/bash
# sweep-sharegate-b.sh — pilot sweep driver for sim-sharegate-b.
# 8 fresh seeds 9011-9018 x {leadfeast,belongfeast} x {control,armed} = 32 runs,
# 180d death-aware. Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit.
# Usage: bash scripts/sweep-sharegate-b.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUTDIR="evidence/2026-10-21/perseed-sharegate-b"
mkdir -p "$OUTDIR"
LOG="evidence/2026-10-21/sharegate-b-sweep.log"
export FEASTSCALE_R13=1 SEATDRIVE=0
SEEDS="9011,9012,9013,9014,9015,9016,9017,9018"
run_cell() { # side, policy, sharegate_env
  local side="$1" policy="$2" sgenv="$3"
  local out="$OUTDIR/${side}-${policy%-sharegate}.json"
  echo "== $side $policy -> $out"
  if [ -n "$sgenv" ]; then
    SIDE="$side" POLICY="$policy" SEEDS="$SEEDS" DAYS=180 OUT="$out" \
      SURPLUSFEED=1 SHAREGATE_B="$sgenv" node scripts/sweep-sharegate-b.js 2>&1 | tee -a "$LOG"
  else
    SIDE="$side" POLICY="$policy" SEEDS="$SEEDS" DAYS=180 OUT="$out" \
      SURPLUSFEED=1 node scripts/sweep-sharegate-b.js 2>&1 | tee -a "$LOG"
  fi
}
: > "$LOG"
run_cell control leadfeast ""
run_cell control belongfeast ""
run_cell armed leadfeast-sharegate 1
run_cell armed belongfeast-sharegate 1
echo "pilot sweep complete"
