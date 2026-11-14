#!/bin/bash
# journey-endgame-r203-chain.sh — Lane B endgame r203, passes A/B/C sequential.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-14/.
# Six-var probe env (r198 RELAYGREY lesson). SEEDS explicit per r131.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
LOG=evidence/2026-11-14/journey-endgame-r203-chain.log
{
echo "CHAIN START $(date -u +%FT%TZ)"
SEEDS=89701,89702,89703,89704,89705 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203 node scripts/probe-endgame-r203-20261114.js
echo "PASS_A_RC:$?"
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203-b node scripts/probe-endgame-r203-20261114.js
echo "PASS_B_RC:$?"
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203-c node scripts/probe-endgame-r203-20261114.js
echo "PASS_C_RC:$?"
echo "CHAIN END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
