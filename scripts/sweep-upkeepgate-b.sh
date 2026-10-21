#!/bin/bash
# sweep-upkeepgate-b.sh — paired sweep for the UPKEEPGATE lever arm.
# 8 seeds x {leadfeast-upkeepgate, belongfeast-upkeepgate} x {control, armed},
# 180d death-aware, UPKEEPGATE=low, SURPLUSFEED=1 on armed rows.
# Usage: POLICIES="leadfeast-upkeepgate" bash scripts/sweep-upkeepgate-b.sh   (pilot)
#        bash scripts/sweep-upkeepgate-b.sh                                   (full: both policies)
# Env: FEASTSCALE_R13=1 SEATDRIVE=0 (required; SURPLUSFEED set per arm).
set -e
cd "$(dirname "$0")/.."
if [ "${FEASTSCALE_R13:-}" != "1" ] || [ "${SEATDRIVE:-}" != "0" ]; then
  echo "FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly" >&2; exit 2
fi
SEEDS="8801,8802,8803,8804,8805,8806,8807,8808"
POLS="${POLICIES:-leadfeast-upkeepgate belongfeast-upkeepgate}"
OUTDIR="evidence/2026-10-21/perseed-upkeepgate-b"
mkdir -p "$OUTDIR"
for POL in $POLS; do
  echo "=== CONTROL $POL (UPKEEPGATE=low) ==="
  env -u SURPLUSFEED UPKEEPGATE=low SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="$OUTDIR/uglow-control-$POL.json" \
    node scripts/probe-upkeepgate-b.js
  echo "=== ARMED $POL (UPKEEPGATE=low) ==="
  SURPLUSFEED=1 UPKEEPGATE=low SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="$OUTDIR/uglow-armed-$POL.json" \
    node scripts/probe-upkeepgate-b.js
done
echo "SWEEP COMPLETE"
