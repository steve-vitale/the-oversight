#!/bin/bash
# journey-endgame-r211-chain.sh — Lane B endgame r211, pass A pilot + analyzer.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-15/.
# Six-var probe env (r198 RELAYGREY lesson). SEEDS explicit per r131.
# PILOT FIRST (§9): pass A only. B/C/dark/C-wide launch only if pass A
# shows something interesting (see the r211 prereg) — r203 ran the full
# panel yesterday on nearly the same substrate.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
LOG=evidence/2026-11-15/journey-endgame-r211-chain.log
{
echo "CHAIN START $(date -u +%FT%TZ)"
SEEDS=89701,89702,89703,89704,89705 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211 node scripts/probe-endgame-r211-20261115.js
echo "PASS_A_RC:$?"
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211 node scripts/analyze-endgame-r211-20261115.js
echo "ANALYZER_A_RC:$?"
echo "CHAIN END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
