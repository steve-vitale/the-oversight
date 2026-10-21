#!/bin/bash
# sweep-linkdissolve-b.sh — 32-run paired sweep on the current tip.
# 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware.
# Usage: bash scripts/sweep-linkdissolve-b.sh
# Env: FEASTSCALE_R13=1 SEATDRIVE=0 (required; SURPLUSFEED set per arm).
set -e
cd "$(dirname "$0")/.."
if [ "${FEASTSCALE_R13:-}" != "1" ] || [ "${SEATDRIVE:-}" != "0" ]; then
  echo "FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly" >&2; exit 2
fi
SEEDS="8801,8802,8803,8804,8805,8806,8807,8808"
for POL in leadfeast belongfeast; do
  echo "=== CONTROL $POL ==="
  env -u SURPLUSFEED SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="evidence/2026-10-20/perseed-linkdissolve-b/control-$POL.json" \
    node scripts/probe-linkdissolve-b.js
  echo "=== ARMED $POL ==="
  SURPLUSFEED=1 SEEDS="$SEEDS" POLICY="$POL" DAYS=180 \
    OUT="evidence/2026-10-20/perseed-linkdissolve-b/armed-$POL.json" \
    node scripts/probe-linkdissolve-b.js
done
echo "SWEEP COMPLETE"
