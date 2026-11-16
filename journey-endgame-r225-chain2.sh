#!/bin/bash
# journey-endgame-r225-chain2.sh — Lane B endgame r225, pass C + pass C-wide + analyzers.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-16/.
# Pass A pilot showed something interesting (M3b NO-GO, M23b 1/5 first
# pass-A gate-ok, 89704 faced wave 5 three times) — the full panel is
# warranted per the r225 prereg §PILOT FIRST. Six-var probe env (r198
# RELAYGREY lesson). SEEDS explicit per r131.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1
LOG=evidence/2026-11-16/journey-endgame-r225-chain2.log
{
echo "CHAIN2 START $(date -u +%FT%TZ)"
echo "PASS_C START $(date -u +%FT%TZ)"
SEEDS=89701,89702,89703,89704,89705 EVIDDIR=evidence/2026-11-16/perseed-endgame-r225-c node scripts/probe-endgame-r225-20261116.js
echo "PASS_C_RC:$?"
ANALYZEDIR=evidence/2026-11-16/perseed-endgame-r225-c node scripts/analyze-endgame-r225-20261116.js
echo "ANALYZER_C_RC:$?"
echo "PASS_CWIDE START $(date -u +%FT%TZ)"
SEEDS=89740,89741,89742,89743,89744,89745,89746,89747 EVIDDIR=evidence/2026-11-16/perseed-endgame-r225-cwide node scripts/probe-endgame-r225-20261116.js
echo "PASS_CWIDE_RC:$?"
ANALYZEDIR=evidence/2026-11-16/perseed-endgame-r225-cwide node scripts/analyze-endgame-r225-20261116.js --wide
echo "ANALYZER_CWIDE_RC:$?"
echo "CHAIN2 END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
