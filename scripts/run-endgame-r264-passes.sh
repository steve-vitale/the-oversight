#!/bin/bash
# journey-endgame r264 pass chain (lane B): pilot T(2) -> T(5) [+ C-wide T if clock allows].
# Each pass is one probe invocation; EVIDDIR set explicitly on every one
# (r237 lesson). A failure in one pass does not block the next (independent
# seed sets); every EXIT code is echoed to its log.
cd ~/workspace/worktrees/journey2-endgame || exit 1
EVID=evidence/2026-11-21
BASE="FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1"
TFLAGS="CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 TRIBUTE_FIRST=1"
mkdir -p $EVID/perseed-endgame-r264 $EVID/perseed-endgame-r264-cwide

echo "PASS T-PILOT START seeds=89701,89702 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r264-pass-t-pilot.log
env $BASE $TFLAGS SEEDS=89701,89702 EVIDDIR=$PWD/$EVID/perseed-endgame-r264 node scripts/probe-endgame-r264-20261121.js >> $EVID/journey-endgame-r264-pass-t-pilot.log 2>&1
echo "PASS-T-PILOT EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r264-pass-t-pilot.log

echo "PASS T START seeds=89703,89704,89705 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r264-pass-t.log
env $BASE $TFLAGS SEEDS=89703,89704,89705 EVIDDIR=$PWD/$EVID/perseed-endgame-r264 node scripts/probe-endgame-r264-20261121.js >> $EVID/journey-endgame-r264-pass-t.log 2>&1
echo "PASS-T EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r264-pass-t.log

echo "CHAIN DONE $(date -u +%H:%M:%S)"
# C-wide T band (8 fresh seeds) runs ONLY if the clock allows after the T5
# analysis AND the band is verified fresh per local_seed_band_freshness —
# NOT frozen in the prereg. Command (manual):
# env $BASE $TFLAGS SEEDS=<fresh-band> EVIDDIR=$PWD/$EVID/perseed-endgame-r264-cwide node scripts/probe-endgame-r264-20261121.js
