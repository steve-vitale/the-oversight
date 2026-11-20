#!/usr/bin/env bash
# journey-landing r149 — run the 15 standing analyzers (r144/r145 order)
# against one corpus DIR, appending to LOG. Single AFTER corpus (no
# before/after pair this run); the bridge analyzers take the AFTER dir
# as their "before" arg, as on r145.
# Usage: bash evidence/2026-11-20/journey-landing-r149-analyzers.sh <DIR> <LOG>
set -u
DIR=${1:?usage: $0 <DIR> <LOG>}
LOG=${2:?usage: $0 <DIR> <LOG>}
cd "$(dirname "$0")/../../../.." || exit 1
# cd to the worktree root (this script lives in evidence/2026-11-19/)
cd ~/workspace/worktrees/journey-landing || exit 1
run() {
  local name="$1"; shift
  echo "=== $name ===" >> "$LOG"
  node "scripts/$name.js" "$@" >> "$LOG" 2>&1
  echo "[exit $?]" >> "$LOG"
}
run analyze-landing-r132-nodloop "$DIR"
run analyze-landing-q1-dialogue "$DIR"
run analyze-landing-r118-outingchain "$DIR"
run analyze-landing-r126-presshop "$DIR"
run analyze-landing-r125-personal-bridge "$DIR"
run analyze-landing-r126-bridge-pools "$DIR"
run analyze-landing-r104-20261105 "$DIR"
run analyze-landing-r112-practice "$DIR"
run analyze-landing-r117-huntpractice "$DIR"
run analyze-landing-r149-zerodmg-v3 "$DIR"  # v3: B-shape split (r148 metric-review item 1)
run analyze-landing-r120-scholar-turns "$DIR"
run analyze-landing-r107-commit-offer "$DIR"
run analyze-landing-r127-topic-dwell "$DIR"
run analyze-landing-r128-move-refusals "$DIR"
run analyze-landing-r129-pocket "$DIR"
echo "analyzers done" >> "$LOG"
