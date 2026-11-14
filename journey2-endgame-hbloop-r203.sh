#!/bin/bash
# journey2-endgame-hbloop-r203.sh — re-heartbeat the r203 worktree every 5 min.
# Run NOHUP-DETACHED from the worktree root; log lives in the worktree
# evidence dir and is committed with the run's work (r198/r199 pattern).
cd ~/workspace/worktrees/journey2-endgame || exit 1
while true; do
  bash scripts/worktree-heartbeat.sh journey2-endgame >> evidence/2026-11-14/journey-endgame-r203-hb.log 2>&1
  sleep 300
done
