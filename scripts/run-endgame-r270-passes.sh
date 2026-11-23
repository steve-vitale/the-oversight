#!/bin/bash
# journey-endgame r270 pass chain (lane B): pilot T(4) only.
# The EXPAND to the remaining 4 seeds runs ONLY after pilot analysis
# (prereg: pilot engages iff >=1 tribute delivery OR >=1 deedGate-ok day).
# Each pass is one probe invocation; EVIDDIR set explicitly on every one
# (r237 lesson). A failure in one pass does not block the next (independent
# seed sets); every EXIT code is echoed to its log.
cd ~/workspace/worktrees/journey2-endgame || exit 1
EVID=evidence/2026-11-22
BASE="FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1"
TFLAGS="CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 TRIBUTE_FIRST=1"
mkdir -p $EVID/perseed-endgame-r270

echo "PASS T-PILOT START seeds=107501,107502,107503,107504 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r270-pass-t-pilot.log
env $BASE $TFLAGS SEEDS=107501,107502,107503,107504 EVIDDIR=$PWD/$EVID/perseed-endgame-r270 node scripts/probe-endgame-r270-20261122.js >> $EVID/journey-endgame-r270-pass-t-pilot.log 2>&1
echo "PASS-T-PILOT EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r270-pass-t-pilot.log

echo "CHAIN DONE $(date -u +%H:%M:%S)"
# EXPAND (manual, only if the pilot engages per the prereg):
# env $BASE $TFLAGS SEEDS=107505,107506,107507,107508 EVIDDIR=$PWD/$EVID/perseed-endgame-r270 node scripts/probe-endgame-r270-20261122.js
