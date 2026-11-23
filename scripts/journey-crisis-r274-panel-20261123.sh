#!/bin/bash
# journey-crisis-r274-panel-20261123.sh — Lane B crisis r274 panel runner.
# Usage: bash scripts/journey-crisis-r274-panel-20261123.sh [after|fresh|all]
#   after: seeds 14599-14601 (same-seed before/after; r264 BEFORE was
#     FIGHT-STALL 9 fight / 0 travel, DOWNEDTWICE 1 dup group) into
#     evidence/2026-11-23/, then the analyzer on that dir.
#   fresh: seeds 14602-14604 (fresh band) into evidence/2026-11-23/fresh/,
#     then the analyzer on that dir.
#   all (default): both phases in order.
# The driver prints the per-seed JSON to stdout; each seed's stdout goes
# straight to its JSON file (r264 method note). Never pipe the analyzer
# through head (r264 method note: SIGPIPE truncation).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EVID_BASE="${EVID_BASE:-/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-23}"
DRIVER="$ROOT/scripts/journey-crisis-r274-delayed-20261123.js"
ANALYZER="$ROOT/scripts/analyze-crisis-r274-delayed-20261123.js"
PHASE="${1:-all}"

run_seed() {
  local seed="$1" outdir="$2"
  mkdir -p "$outdir"
  echo "=== seed $seed -> $outdir"
  SEED="$seed" EVID="$outdir" node "$DRIVER" \
    > "$outdir/journey-crisis-r274-delayed-seed${seed}.json" \
    2> "$outdir/journey-crisis-r274-seed${seed}.stderr.log"
  echo "seed $seed exit $?"
}

run_phase() {
  local name="$1" outdir="$2"; shift 2
  for s in "$@"; do run_seed "$s" "$outdir"; done
  echo "=== analyzer on $outdir"
  node "$ANALYZER" "$outdir" > "$outdir/journey-crisis-r274-analyzer-$name.log" 2>&1
  echo "analyzer $name exit $?"
  grep -E "FIGHT-STALL SPLIT|STALL-GEOMETRY|DOWNEDTWICE|C3b-TRANSCRIPT" "$outdir/journey-crisis-r274-analyzer-$name.log" | tail -12
}

case "$PHASE" in
  after) run_phase after "$EVID_BASE" 14599 14600 14601 ;;
  fresh) run_phase fresh "$EVID_BASE/fresh" 14602 14603 14604 ;;
  all)
    run_phase after "$EVID_BASE" 14599 14600 14601
    run_phase fresh "$EVID_BASE/fresh" 14602 14603 14604
    ;;
  *) echo "usage: $0 [after|fresh|all]" >&2; exit 2 ;;
esac
