#!/bin/bash
# journey2-succession r248 heartbeat loop — every 5 min until killed.
cd ~/workspace/worktrees/journey2-7 || exit 1
while true; do bash scripts/worktree-heartbeat.sh journey2-7 >> evidence/2026-11-19/journey-succession-r248-heartbeat.log 2>&1; sleep 300; done
