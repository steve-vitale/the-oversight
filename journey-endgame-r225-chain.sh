#!/bin/bash
# journey-endgame-r225-chain.sh — Lane B endgame r225, SMOKE + pass A pilot + analyzer.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-16/.
# Six-var probe env (r198 RELAYGREY lesson). SEEDS explicit per r131.
# PILOT FIRST (§9): smoke + pass A only. B/C/C-wide launch only after the
# pilot decision (see the r225 prereg) — r219 ran the full panel yesterday
# on nearly the same substrate, and the deltas are small except the
# profilegate party_launch bypass.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
unset CAPSTONE BUYOUT BUYOUT_EARLY
LOG=evidence/2026-11-16/journey-endgame-r225-chain.log
{
echo "CHAIN START $(date -u +%FT%TZ)"
echo "SMOKE START $(date -u +%FT%TZ)"
SEEDS=89706 EVIDDIR=evidence/2026-11-16/perseed-endgame-r225-smoke node scripts/probe-endgame-r225-20261116.js
echo "SMOKE_RC:$?"
echo "PASS_A START $(date -u +%FT%TZ)"
SEEDS=89701,89702,89703,89704,89705 EVIDDIR=evidence/2026-11-16/perseed-endgame-r225 node scripts/probe-endgame-r225-20261116.js
echo "PASS_A_RC:$?"
ANALYZEDIR=evidence/2026-11-16/perseed-endgame-r225 node scripts/analyze-endgame-r225-20261116.js
echo "ANALYZER_A_RC:$?"
echo "CHAIN END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
