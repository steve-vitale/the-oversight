#!/bin/bash
# journey2-endgame-hbloop-r199.sh — re-heartbeat journey2-endgame every 5 min.
# Started by the 01:00 CST Lane B adoption run (r198 completion). Kill at closeout.
cd ~/workspace/the-scattering || exit 1
while true; do
  date -u +"[%Y-%m-%dT%H:%M:%SZ] $(bash scripts/worktree-heartbeat.sh journey2-endgame 2>&1 | tail -1)"
  sleep 300
done
