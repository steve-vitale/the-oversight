#!/bin/bash
# r296 heartbeat loop: every 5 min, long-wait flock (registry contention lesson, r295).
while true; do
  timeout 600 bash scripts/worktree-heartbeat.sh journey2-endgame >> evidence/2026-11-28/journey-endgame-r296-heartbeat.log 2>&1
  sleep 300
done
