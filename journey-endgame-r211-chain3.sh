#!/bin/bash
# journey-endgame-r211-chain3.sh — Lane B endgame r211 adoption (08:00 CST occurrence).
# Finishes what the 04:00 run + 05:00 adoption left: v3 full pass-A panel
# (fix live verification; 89704 single-seed already 0 hits + JSON-identical),
# then C-wide remainder (89723-89729; 89722 done), then analyzers v3 + C-wide.
# Run SETSID-DETACHED from the worktree root; log to evidence/2026-11-15/.
cd ~/workspace/worktrees/journey2-endgame || exit 1
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1
LOG=evidence/2026-11-15/journey-endgame-r211-chain3.log
{
echo "CHAIN3 START $(date -u +%FT%TZ)"
echo "=== V3 FULL (pass-A re-run, 5 pilot seeds, fix live) ==="
SEEDS=89701,89702,89703,89704,89705 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211-v3fix node scripts/probe-endgame-r211-20261115.js
echo "PASS_V3_RC:$?"
echo "=== ANALYZER V3 ==="
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211-v3fix node scripts/analyze-endgame-r211-20261115.js | tee evidence/2026-11-15/journey-endgame-r211-v3fix-analyzer.log
echo "ANALYZER_V3_RC:${PIPESTATUS[0]}"
echo "=== C-WIDE REMAINDER (7 fresh seeds 89723-89729) ==="
SEEDS=89723,89724,89725,89726,89727,89728,89729 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-15/perseed-endgame-r211-cwide node scripts/probe-endgame-r211-20261115.js
echo "PASS_CWIDE_RC:$?"
echo "=== ANALYZER C-WIDE ==="
ANALYZEDIR=evidence/2026-11-15/perseed-endgame-r211-cwide node scripts/analyze-endgame-r211-20261115.js | tee evidence/2026-11-15/journey-endgame-r211-cwide-analyzer.log
echo "ANALYZER_CWIDE_RC:${PIPESTATUS[0]}"
echo "CHAIN3 END $(date -u +%FT%TZ)"
} 2>&1 | tee "$LOG"
