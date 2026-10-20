#!/bin/bash
# drive-dutyfish-b-sweep.sh — drives the 32-config pilot sweep (8 seeds x
# lead/belong x control/armed) with resume support. One config per node
# invocation; the sweep script appends incrementally to OUT.
#
# Parallel: pass policy ids as args to split across processes, e.g.
#   FEASTSCALE_R13=1 SEATDRIVE=0 bash scripts/drive-dutyfish-b-sweep.sh leaddutyfish &
#   FEASTSCALE_R13=1 SEATDRIVE=0 bash scripts/drive-dutyfish-b-sweep.sh belongdutyfish &
#
# Usage: FEASTSCALE_R13=1 SEATDRIVE=0 bash scripts/drive-dutyfish-b-sweep.sh [policies...]
set -u
cd "$(dirname "$0")/.."
OUTDIR=evidence/2026-10-20/perseed-dutyfish-b
mkdir -p "$OUTDIR"
POLICIES="${*:-leaddutyfish belongdutyfish}"
for POLICY in $POLICIES; do
  for SIDE in control armed; do
    short=$(echo "$POLICY" | sed 's/dutyfish//')
    OUT="$OUTDIR/$SIDE-$short.json"
    if [ "$SIDE" = armed ]; then export DUTYFISH_B=1; else unset DUTYFISH_B; fi
    POLICY="$POLICY" SEEDS=5601,5602,5603,5604,5605,5606,5607,5608 OUT="$OUT" \
      node scripts/sweep-dutyfish-b.js 2>&1 | tail -3
  done
done
echo "SWEEP COMPLETE ($POLICIES)"
