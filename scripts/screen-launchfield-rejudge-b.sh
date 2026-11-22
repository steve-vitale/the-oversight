#!/bin/bash
# screen-launchfield-rejudge-b.sh — frozen screen for arm sim-launchfield-rejudge-b.
# Runs bands B1..B4 (107399-107406, 107407-107414, 107415-107422, 107423-107430)
# in order at the full 150d death-aware horizon under the frozen substrate,
# analyzes each band, and STOPS at the first band whose Leg S whyNot tally
# has field-encounter >= 1 (the frozen supply rule, prereg "Screen design").
# That band becomes the JUDGED band. If no band supplies after all 32 seeds,
# exits 2 (DIAG-NO-GO on supply; the four-band screen is the evidence).
# Resume-safe: a band dir already holding 8 corpora is analyzed, not re-run
# (the driver refuses to overwrite, exit 3); a partial band runs the driver
# for only the missing seeds (same seeds/substrate/OUTDIR — determinism
# makes this identical to a full re-run).
# Usage: bash scripts/screen-launchfield-rejudge-b.sh
#   Logs to evidence/2026-11-22/launchfield-rejudge-b-screen.log (tee).
set -u
set -o pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 1
LOG="evidence/2026-11-22/launchfield-rejudge-b-screen.log"
mkdir -p evidence/2026-11-22
{
echo "== screen start $(date -u +%Y-%m-%dT%H:%M:%SZ) base $(git rev-parse HEAD | cut -c1-12) =="
export SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1
export MODE=vre EVIDENCE_DATE=2026-11-22 RUN=launchfield-rejudge-b
BANDS="107399-107406:107399,107400,107401,107402,107403,107404,107405,107406
107407-107414:107407,107408,107409,107410,107411,107412,107413,107414
107415-107422:107415,107416,107417,107418,107419,107420,107421,107422
107423-107430:107423,107424,107425,107426,107427,107428,107429,107430"
JUDGED=""
for spec in $BANDS; do
  RANGE="${spec%%:*}"
  SEEDS="${spec#*:}"
  OUTDIR="perseed-launchfield-rejudge-b-$RANGE"
  DIR="evidence/2026-11-22/$OUTDIR"
  echo "== band $RANGE seeds $SEEDS =="
  NFILES=0
  if [ -d "$DIR" ]; then NFILES=$(ls "$DIR"/*.json 2>/dev/null | wc -l); fi
  if [ "$NFILES" -eq 8 ]; then
    echo "band $RANGE: corpora already present (8 files) — resume, driver skipped"
  else
    # Resume-safe partial band: run the driver for ONLY the seeds whose
    # corpora are missing (the driver refuses to overwrite, exit 3).
    # Same seeds, same substrate, same OUTDIR — determinism (proof-test
    # D1 + the §4/107399 count match) makes this identical to a full
    # re-run. Written after the 2026-11-22 ~17:19Z machine restart
    # killed the first screen run mid-band (2/8 seeds done).
    MISSING=""
    for s in $(echo "$SEEDS" | tr ',' ' '); do
      F="$DIR/launchfield-rejudge-b-s${s}-launchfield-rejudge-b-vre.json"
      if [ ! -f "$F" ]; then MISSING="${MISSING:+$MISSING,}$s"; fi
    done
    echo "band $RANGE: corpora present $NFILES/8, missing seeds: ${MISSING:-none}"
    if [ -n "$MISSING" ]; then
      echo "band $RANGE: driver start $(date -u +%Y-%m-%dT%H:%M:%SZ) (resume, seeds $MISSING)"
      OUTDIR="$OUTDIR" SEEDS="$MISSING" node scripts/launchfield-rejudge-driver-b.js
      DRC=$?
      if [ "$DRC" -ne 0 ]; then
        echo "SCREEN FAIL: driver exit $DRC on band $RANGE — stopping (see log)"
        exit 1
      fi
      echo "band $RANGE: driver done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    fi
  fi
  ANALYSIS="launchfield-rejudge-b-analysis-$RANGE.json"
  echo "band $RANGE: analyzer start"
  # Analyzer exit code reflects its own bars (completeness/reproduction/
  # instrument), NOT the supply clause — it always writes the JSON first.
  # Do not fail the screen on its exit code; read the tally from the JSON.
  ANALYSIS_OUT="$ANALYSIS" node "scripts/analyze-launchfield-rejudge-b.js" "$DIR"
  AC=$?
  echo "band $RANGE: analyzer exit $AC (bars, not supply)"
  TALLY=$(node -e "
const a=require('./evidence/2026-11-22/$ANALYSIS');
const b=a.band;
console.log(JSON.stringify({fe:(b.sWhyNot||{})['field-encounter']||0, notBid:b.notBidInstances, churn:b.churnInstances, parts:b.sPartsTotal, scored:b.sScored, unexplained:b.sUnexplained, unknown:b.unknown, verdict:a.verdict, mechanism:b.mechanism, wall:b.wall}));")
  echo "band $RANGE: tally $TALLY"
  FE=$(node -e "const a=require('./evidence/2026-11-22/$ANALYSIS'); console.log((a.band.sWhyNot||{})['field-encounter']||0);")
  if [ "$FE" -ge 1 ]; then
    echo "SUPPLY: band $RANGE supplies field-encounter=$FE — JUDGED BAND"
    cp "evidence/2026-11-22/$ANALYSIS" evidence/2026-11-22/launchfield-rejudge-b-analysis.json
    echo "judged band analysis copied to launchfield-rejudge-b-analysis.json"
    JUDGED="$RANGE"
    break
  else
    echo "NO-SUPPLY: band $RANGE field-encounter=0 — continuing screen"
  fi
done
if [ -n "$JUDGED" ]; then
  echo "== screen end $(date -u +%Y-%m-%dT%H:%M:%SZ) JUDGED=$JUDGED =="
  exit 0
else
  echo "== screen end $(date -u +%Y-%m-%dT%H:%M:%SZ) NO SUPPLY in 32 seeds — DIAG-NO-GO on supply =="
  exit 2
fi
} 2>&1 | tee -a "$LOG"
