#!/bin/bash
# run-nationalsticky-sweep-b.sh — sweep runner, arm sim-nationalsticky-b
# (DIAG: is reached-national lost, and how? — findings #2452).
# Two legs, identical seeds, sequential in-process runs (one node
# process per leg — never two harnesses in one process):
#   MODE=off  -> evidence/2026-11-16/perseed-nationalsticky-b-off/
#   MODE=on   -> evidence/2026-11-16/perseed-nationalsticky-b-on/
# Band 103011–103018 (frozen in sim-nationalsticky-b-prereg.md),
# competent verbatim, 200d death-aware. The driver refuses to
# overwrite an existing corpus file; a re-run after a crash resumes
# by deleting only the missing seed files (never the whole dir).
# Usage: bash scripts/run-nationalsticky-sweep-b.sh [off|on|both]
set -u
cd "$(dirname "$0")/.." || exit 1
SEEDS="${SEEDS:-103011,103012,103013,103014,103015,103016,103017,103018}"
DAYS="${DAYS:-200}"
LEG="${1:-both}"
run_leg() {
  local mode="$1"
  echo "=== nationalsticky-b leg $mode seeds $SEEDS days $DAYS ==="
  MODE="$mode" OUTDIR="perseed-nationalsticky-b-$mode" SEEDS="$SEEDS" DAYS="$DAYS" RUN=nationalsticky-b \
    node scripts/nationalsticky-driver-20261116.js
}
case "$LEG" in
  off) run_leg off ;;
  on) run_leg on ;;
  both) run_leg off && run_leg on ;;
  *) echo "usage: bash scripts/run-nationalsticky-sweep-b.sh [off|on|both]" >&2; exit 2 ;;
esac
