#!/bin/bash
# journey-endgame r263 RECOVERY chain (lane B): the 09:51Z write flap
# (EPERM, ~5 min) killed passes C/C-wide/D at startup (tee + probe
# redirects denied) and ate Pass A seed 89705's files. Writes verified
# OK at 09:54Z. This chain re-runs ONLY what is missing, with a retry
# on short file counts (flap-resilient: a pass that produces no new
# per-seed JSONs is retried after 60s, up to 3 attempts).
cd ~/workspace/worktrees/journey2-endgame || exit 1
EVID=evidence/2026-11-21
BASE="FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1"

run_pass() { # name seeds extra_env outdir logfile expected_jsons
  local name="$1" seeds="$2" extra="$3" outdir="$4" logf="$5" expected="$6"
  local attempt=1
  while [ $attempt -le 3 ]; do
    echo "PASS $name START seeds=$seeds attempt=$attempt $(date -u +%H:%M:%S)" >> "$EVID/$logf"
    # shellcheck disable=SC2086
    env $BASE $extra SEEDS="$seeds" EVIDDIR="$PWD/$EVID/$outdir" node scripts/probe-endgame-r263-20261121.js >> "$EVID/$logf" 2>&1
    local rc=$?
    echo "PASS-$name attempt=$attempt EXIT:$rc $(date -u +%H:%M:%S)" >> "$EVID/$logf"
    local got
    got=$(ls "$EVID/$outdir"/endgame-r263-*.json 2>/dev/null | wc -l)
    echo "PASS-$name attempt=$attempt files=$got expected=$expected" >> "$EVID/$logf"
    if [ "$got" -ge "$expected" ]; then return 0; fi
    echo "PASS-$name SHORT ($got/$expected) — sleeping 60s, retrying" >> "$EVID/$logf"
    sleep 60
    attempt=$((attempt + 1))
  done
  echo "PASS-$name FAILED after 3 attempts" >> "$EVID/$logf"
  return 1
}

# 1. Pass A seed 89705 only (regenerates the JSON + transcript the flap ate).
run_pass "A-89705" "89705" "" "perseed-endgame-r263" "journey-endgame-r263-pass-a-89705.log" 5
# 2. Pass C (matched, buyout).
run_pass "C" "89701,89702,89703,89704,89705" "CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1" "perseed-endgame-r263-c" "journey-endgame-r263-pass-c.log" 5
# 3. Pass C-wide (fresh 89850-89857, buyout).
run_pass "C-WIDE" "89850,89851,89852,89853,89854,89855,89856,89857" "CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1" "perseed-endgame-r263-cwide" "journey-endgame-r263-pass-cwide.log" 8
# 4. Pass D (FIGHTALLY2 + buyout, matched 89701-89706).
run_pass "D" "89701,89702,89703,89704,89705,89706" "FIGHTALLY2=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1" "perseed-endgame-r263-d" "journey-endgame-r263-pass-d.log" 6

echo "RECOVERY CHAIN DONE $(date -u +%H:%M:%S)"
