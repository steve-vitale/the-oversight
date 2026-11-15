#!/bin/bash
# journey-endgame-r211-chain2.sh — Lane B endgame r211, passes B + C + C-wide.
# Pass A (v1/v2/v3) showed TWO interesting findings per the prereg, so B/C
# are warranted: (a) 89704 DIED before d90 (village-lost, no successor);
# (b) 89702/89703 reached wave 5 (w5max 1 and 2 — previously w5:0 on r203),
# and 89703's missedSit shows deedGateOk=true with military_tribute ready
# — the exact case pass B tests (r203 pass B was VACUOUS: gate never ok).
# Dark probe SKIPPED: no delta touched the dark table; r203 was bit-identical
# to r198. C-wide uses the prereg's fresh band 89722-89729.
# Run NOHUP-DETACHED from the worktree root; logs to evidence/2026-11-15/.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
LOG=evidence/2026-11-15/journey-endgame-r211-chain2.log
{
echo "CHAIN2 START $(date -u +%FT%TZ)"
echo "=== PASS B (capstone leg, 5 pilot seeds) ==="
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211-b node scripts/probe-endgame-r211-20261115.js
echo "PASS_B_RC:$?"
echo "=== PASS C (buyout-early leg, 5 pilot seeds) ==="
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211-c node scripts/probe-endgame-r211-20261115.js
echo "PASS_C_RC:$?"
echo "=== PASS C-WIDE (buyout-early leg, 8 fresh seeds 89722-89729) ==="
SEEDS=89722,89723,89724,89725,89726,89727,89728,89729 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211-cwide node scripts/probe-endgame-r211-20261115.js
echo "PASS_CWIDE_RC:$?"
echo "=== ANALYZER B (full corpus) ==="
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211-b node scripts/analyze-endgame-r211-20261115.js | tee evidence/2026-11-15/journey-endgame-r211-b-analyzer.log
echo "ANALYZER_B_RC:${PIPESTATUS[0]}"
echo "=== ANALYZER C (full corpus) ==="
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211-c node scripts/analyze-endgame-r211-20261115.js | tee evidence/2026-11-15/journey-endgame-r211-c-analyzer.log
echo "ANALYZER_C_RC:${PIPESTATUS[0]}"
echo "=== ANALYZER C-WIDE (full corpus) ==="
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211-cwide node scripts/analyze-endgame-r211-20261115.js | tee evidence/2026-11-15/journey-endgame-r211-cwide-analyzer.log
echo "ANALYZER_CWIDE_RC:${PIPESTATUS[0]}"
echo "CHAIN2 END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
