#!/bin/bash
# r295 gate batch: re-run the 3 check.js --quick timeouts standalone on the REBASED tip.
# (r293's standalones ran on the pre-rebase tip; the rebase moved master 85 commits.)
cd ~/workspace/worktrees/journey2-7 || exit 1
for t in scripts/godpath/test-living-garden-deed-attainment.js scripts/godpath/test-one-person-army-deed-attainment.js scripts/test-capable-bot-20261014.js; do
  echo "=== $t ==="
  start=$(date +%s)
  timeout 900 node "$t" > /tmp/r295-gate-$(basename $t).out 2>&1
  rc=$?
  echo "rc=$rc elapsed=$(( $(date +%s) - start ))s"
  tail -3 /tmp/r295-gate-$(basename $t).out
done
echo "=== GATE BATCH DONE ==="
