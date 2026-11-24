#!/bin/bash
# journey-scale r279 heartbeat loop — every 10 min until killed.
# Recreated 2026-11-24 07:28Z after a VM restart killed the original loop.
cd /home/hatch/workspace/worktrees/journey-scale || exit 1
while true; do bash scripts/worktree-heartbeat.sh journey-scale >> /home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-24/journey-scale-r279-hb.log 2>&1; sleep 600; done
