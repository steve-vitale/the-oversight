#!/bin/bash
# journey-endgame r263 pass chain (lane B): A -> C -> C-wide -> D, sequential.
# Each pass is one probe invocation; EVIDDIR set explicitly on every one
# (r237 lesson). A failure in one pass does not block the next (independent
# seed sets); every EXIT code is echoed to its log. Started only after the
# smoke (seed 89706) exits 0.
cd ~/workspace/worktrees/journey2-endgame || exit 1
EVID=evidence/2026-11-21
BASE="FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1"
mkdir -p $EVID/perseed-endgame-r263 $EVID/perseed-endgame-r263-c $EVID/perseed-endgame-r263-cwide $EVID/perseed-endgame-r263-d

echo "PASS A START seeds=89701-89705 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r263-pass-a.log
env $BASE SEEDS=89701,89702,89703,89704,89705 EVIDDIR=$PWD/$EVID/perseed-endgame-r263 node scripts/probe-endgame-r263-20261121.js >> $EVID/journey-endgame-r263-pass-a.log 2>&1
echo "PASS-A EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r263-pass-a.log

echo "PASS C START seeds=89701-89705 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r263-pass-c.log
env $BASE CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 SEEDS=89701,89702,89703,89704,89705 EVIDDIR=$PWD/$EVID/perseed-endgame-r263-c node scripts/probe-endgame-r263-20261121.js >> $EVID/journey-endgame-r263-pass-c.log 2>&1
echo "PASS-C EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r263-pass-c.log

echo "PASS C-WIDE START seeds=89850-89857 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r263-pass-cwide.log
env $BASE CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 SEEDS=89850,89851,89852,89853,89854,89855,89856,89857 EVIDDIR=$PWD/$EVID/perseed-endgame-r263-cwide node scripts/probe-endgame-r263-20261121.js >> $EVID/journey-endgame-r263-pass-cwide.log 2>&1
echo "PASS-CWIDE EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r263-pass-cwide.log

echo "PASS D START seeds=89701-89706 $(date -u +%H:%M:%S)" | tee $EVID/journey-endgame-r263-pass-d.log
env $BASE FIGHTALLY2=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 SEEDS=89701,89702,89703,89704,89705,89706 EVIDDIR=$PWD/$EVID/perseed-endgame-r263-d node scripts/probe-endgame-r263-20261121.js >> $EVID/journey-endgame-r263-pass-d.log 2>&1
echo "PASS-D EXIT:$? $(date -u +%H:%M:%S)" | tee -a $EVID/journey-endgame-r263-pass-d.log

echo "CHAIN DONE $(date -u +%H:%M:%S)"
