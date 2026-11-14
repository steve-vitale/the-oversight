#!/bin/bash
# journey-endgame-r203-chain2.sh — Lane B endgame r203 resume (12:00 CST run adopts r203).
# r203 coordinator died ~17:53Z mid-pass-B (seed 89705 unrun; heartbeat
# 17:32:56Z, lock 2026-11-14T16:55:39Z; stale-lock recovery by the 12:00 CST
# run, new lock oversight-playtest-loop-2-20261114T1810Z). Pass A complete +
# analyzer ALL GO (journey-endgame-r203-a-analyzer.log). Runs only the
# seeds/passes the first chain could not reach, then the analyzers.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-14/.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
LOG=evidence/2026-11-14/journey-endgame-r203-chain2.log
{
echo "CHAIN2 START $(date -u +%FT%TZ) — adoption resume of r203"
echo "=== PASS B remainder (89705) ==="
SEEDS=89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203-b node scripts/probe-endgame-r203-20261114.js
echo "PASS_B2_RC:$?"
echo "=== PASS C (5 seeds) ==="
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203-c node scripts/probe-endgame-r203-20261114.js
echo "PASS_C_RC:$?"
echo "=== PASS C-WIDE (8 fresh seeds 89714-89721) ==="
SEEDS=89714,89715,89716,89717,89718,89719,89720,89721 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r203-cwide node scripts/probe-endgame-r203-20261114.js
echo "PASS_CWIDE_RC:$?"
echo "=== DARK PROBE ==="
node scripts/probe-darktable-r203-20261114.js
echo "DARK_RC:$?"
echo "=== ANALYZER B (full corpus) ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r203-b node scripts/analyze-endgame-r203-20261114.js | tee evidence/2026-11-14/journey-endgame-r203-b-analyzer.log
echo "ANALYZER_B_RC:${PIPESTATUS[0]}"
echo "=== ANALYZER C (full corpus) ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r203-c node scripts/analyze-endgame-r203-20261114.js | tee evidence/2026-11-14/journey-endgame-r203-c-analyzer.log
echo "ANALYZER_C_RC:${PIPESTATUS[0]}"
echo "=== ANALYZER C-WIDE (full corpus) ==="
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r203-cwide node scripts/analyze-endgame-r203-20261114.js | tee evidence/2026-11-14/journey-endgame-r203-cwide-analyzer.log
echo "ANALYZER_CWIDE_RC:${PIPESTATUS[0]}"
echo "CHAIN2 END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
