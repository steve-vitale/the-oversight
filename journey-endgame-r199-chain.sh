#!/bin/bash
# journey-endgame-r199-chain.sh — r198 completion chain (Lane B 01:00 CST run).
# Pass B remainder (89703/89704/89705) -> Pass C full (89701-89705) -> analyzers B + C.
# Each step runs even if the previous failed; rc is echoed after each step.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] PASS B remainder (89703,89704,89705) ==="
SEEDS=89703,89704,89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/probe-endgame-r198-20261114.js
echo "PASS_B_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] PASS C full (89701-89705) ==="
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/probe-endgame-r198-20261114.js
echo "PASS_C_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] ANALYZER B ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/analyze-endgame-r198-20261114.js
echo "ANALYZER_B_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] ANALYZER C ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/analyze-endgame-r198-20261114.js
echo "ANALYZER_C_RC=$?"

echo "=== [$(date -u +%Y-%m-%dT%H:%M:%SZ)] CHAIN DONE ==="
