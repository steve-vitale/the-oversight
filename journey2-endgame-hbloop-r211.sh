#!/bin/bash
# journey2-endgame-hbloop-r211.sh — re-heartbeat the r211 adoption worktree every 5 min.
# Run SETSID-DETACHED from the worktree root (r212 lesson: nohup & dies with parent exec).
cd ~/workspace/worktrees/journey2-endgame || exit 1
while true; do
  bash scripts/worktree-heartbeat.sh journey2-endgame >> evidence/2026-11-15/journey-endgame-r211-hb.log 2>&1
  sleep 300
done
