#!/bin/bash
# run-sweep-gated.sh — runner-family pilot-gate pattern (gap line 888).
#
# Generic wrapper: refuse to run a confirm-stage command while a NO-GO
# analyzer report exists for the run. Usage:
#   bash scripts/run-sweep-gated.sh <report-dir-or-file> -- <command...>
#   PILOT_GATE_ALLOW_MISSING=1 bash scripts/run-sweep-gated.sh ...  (deliberate override only)
# Exit 3 (or 2 for missing verdict) comes from scripts/pilot-gate.js and
# means the command did NOT run. This is the pattern run-pdvalue-b.sh now
# follows inline for its own confirm seeds.
set -u
if [ $# -lt 3 ] || [ "$2" != "--" ]; then
  echo "usage: run-sweep-gated.sh <report> -- <command...>" >&2
  exit 2
fi
REPORT="$1"; shift 2
EXTRA=()
if [ "${PILOT_GATE_ALLOW_MISSING:-}" = "1" ]; then EXTRA+=(--allow-missing); fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if ! node "$SCRIPT_DIR/pilot-gate.js" --report "$REPORT" --stage confirm "${EXTRA[@]}"; then
  echo "run-sweep-gated: confirm command REFUSED by pilot gate (see above)" >&2
  exit 3
fi
exec "$@"
