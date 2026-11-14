#!/bin/bash
# journey-endgame-r199-chain2.sh — r198 completion chain, CORRECTED (Lane B 01:00 CST run).
# Fixes the r199-chain.sh omission: RELAYGREY=1 is REQUIRED for the forcedrift
# plan (89704); the probe exits 2 without it (probe header line 283 names the
# canonical env; the r198 adoption note's recovery commands omitted it).
# Runs only the seeds the first chain could not reach: 89704 (forcedrift) +
# 89705 (wavesnw), on both passes, then the full-corpus analyzers.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] PASS B remainder corrected (89704,89705) ==="
SEEDS=89704,89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/probe-endgame-r198-20261114.js
echo "PASS_B2_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] PASS C remainder corrected (89702,89703,89704,89705) ==="
# 89701 already completed by the first chain (07:05Z) before the 07:06Z VM
# replacement killed that chain; 89702/89703 never ran there.
SEEDS=89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/probe-endgame-r198-20261114.js
echo "PASS_C2_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] ANALYZER B (full corpus) ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/analyze-endgame-r198-20261114.js
echo "ANALYZER_B2_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] ANALYZER C (full corpus) ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/analyze-endgame-r198-20261114.js
echo "ANALYZER_C2_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] CHAIN2 DONE ==="
