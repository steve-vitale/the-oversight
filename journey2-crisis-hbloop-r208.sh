#!/bin/bash
# journey2-crisis r208 heartbeat loop — every 7 min until killed.
cd ~/workspace/worktrees/journey2-crisis || exit 1
while true; do
  bash scripts/worktree-heartbeat.sh journey2-crisis >> evidence/2026-11-14/journey-crisis-r208-hb.log 2>&1
  sleep 420
done
