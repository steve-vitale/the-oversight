#!/bin/bash
# journey2-succession r230 heartbeat loop — every 5 min until killed.
cd ~/workspace/worktrees/journey2-succession || exit 1
while true; do bash scripts/worktree-heartbeat.sh journey2-succession >> evidence/2026-11-17/journey-succession-r230-heartbeat.log 2>&1; sleep 300; done
