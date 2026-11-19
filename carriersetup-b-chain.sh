#!/bin/bash
# sim-carriersetup-b: run the free + floor pilot legs after the ctl leg
# (pid 25530) finishes, sequentially. Logs to evidence/2026-11-18/.
# The driver refuses overwrites, so a re-run resumes missing seeds only.
cd ~/workspace/worktrees/sim-carriersetup-b || exit 1
while kill -0 25530 2>/dev/null; do sleep 30; done
echo "ctl leg done at $(date -u +%FT%TZ)" >> evidence/2026-11-18/carriersetup-b-chain.log
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHPARTY=1 FIELDCAPDMG=1 FIELDCAPFREE=1 MODE=free OUTDIR=perseed-carriersetup-b-free SEEDS=104931,104932,104933,104934,104935,104936,104937,104938 RUN=carriersetup-b node scripts/fieldcarrier-driver-a.js > evidence/2026-11-18/carriersetup-b-free.log 2> evidence/2026-11-18/carriersetup-b-free.err
echo "free leg exit=$? at $(date -u +%FT%TZ)" >> evidence/2026-11-18/carriersetup-b-chain.log
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHPARTY=1 FIELDCAPDMG=1 FIELDCAPFLOOR=1 MODE=floor OUTDIR=perseed-carriersetup-b-floor SEEDS=104931,104932,104933,104934,104935,104936,104937,104938 RUN=carriersetup-b node scripts/fieldcarrier-driver-a.js > evidence/2026-11-18/carriersetup-b-floor.log 2> evidence/2026-11-18/carriersetup-b-floor.err
echo "floor leg exit=$? at $(date -u +%FT%TZ)" >> evidence/2026-11-18/carriersetup-b-chain.log
echo "ALL LEGS DONE at $(date -u +%FT%TZ)" >> evidence/2026-11-18/carriersetup-b-chain.log
