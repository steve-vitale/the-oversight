#!/bin/bash
# r293 gate adjudication batch — standalone re-runs of the 7 check.js --quick
# 120s timeouts (all showed progressing ok/seed output, zero assertion
# failures). Run from the worktree root. Logs to evidence/2026-11-27/.
# Dies with the run limit; the next run reads the log and finishes any
# test without a PASS line. measurement-cache-flags already adjudicated
# 4/4 standalone 01:43Z (see r293.md). The 3 staleness failures
# (measurement-proof-update, measurement-workflow, phone-frame-proof)
# are the carried standing set — NOT re-run here.
cd "$(dirname "$0")/.." || exit 1
LOG=evidence/2026-11-27/journey-succession-r293-gate-standalone.log
{
echo "=== r293 gate standalone batch started $(date -u +%H:%M:%SZ) ==="
for t in scripts/godpath/test-living-garden-deed-attainment.js scripts/godpath/test-occupation-panels.js scripts/godpath/test-one-person-army-deed-attainment.js scripts/godpath/test-trust-observer-neutrality.js scripts/test-synergy-stall.js scripts/test-throttlefeast-20261014.js scripts/test-capable-bot-20261014.js; do
  echo "--- $t $(date -u +%H:%M:%SZ) ---"
  timeout 600 node "$t" > /tmp/r293-standalone-one.log 2>&1
  rc=$?
  tail -3 /tmp/r293-standalone-one.log
  echo "EXIT $t rc=$rc $(date -u +%H:%M:%SZ)"
done
echo "=== batch done $(date -u +%H:%M:%SZ) ==="
} >> "$LOG" 2>&1
