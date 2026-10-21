#!/bin/bash
# sweep-repairrate-b.sh — paired sweep for the REPAIRRATE repair-rate arm.
# 8 seeds x {leadfeast-repairrate, belongfeast-repairrate} x {control, armed},
# 180d death-aware, SURPLUSFEED=1 on BOTH arms, REPAIRRATE=1 + SUCCPOLITY=1 on
# armed only. Control = base policies (the SURPLUSFEED substrate as-is).
# Usage: POLICIES="leadfeast-repairrate" SEEDS="8801,8802,8803,8804" bash scripts/sweep-repairrate-b.sh   (pilot)
#        bash scripts/sweep-repairrate-b.sh                                                                (full)
# Env: FEASTSCALE_R13=1 SEATDRIVE=0 (required).
set -e
cd "$(dirname "$0")/.."
if [ "${FEASTSCALE_R13:-}" != "1" ] || [ "${SEATDRIVE:-}" != "0" ]; then
  echo "FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly" >&2; exit 2
fi
SEEDS="${SEEDS:-8801,8802,8803,8804,8805,8806,8807,8808}"
POLS="${POLICIES:-leadfeast-repairrate belongfeast-repairrate}"
OUTDIR="evidence/2026-10-21/perseed-repairrate-b"
mkdir -p "$OUTDIR"
for POL in $POLS; do
  echo "=== CONTROL $POL (SURPLUSFEED=1, base policy) ==="
  env -u REPAIRRATE -u SUCCPOLITY SURPLUSFEED=1 SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="$OUTDIR/rr-control-$POL.json" \
    node scripts/probe-repairrate-b.js
  echo "=== ARMED $POL (SURPLUSFEED=1, REPAIRRATE=1, SUCCPOLITY=1) ==="
  SURPLUSFEED=1 REPAIRRATE=1 SUCCPOLITY=1 SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="$OUTDIR/rr-armed-$POL.json" \
    node scripts/probe-repairrate-b.js
done
echo "SWEEP COMPLETE"
