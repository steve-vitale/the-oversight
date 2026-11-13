#!/bin/bash
# journey-endgame-r194-chain.sh — runs the r194 passes sequentially.
# Usage: nohup bash evidence/2026-11-13/journey-endgame-r194-chain.sh > evidence/2026-11-13/journey-endgame-r194-chain.log 2>&1 &
# Stops on the first failing pass (exit code check after each probe) so a
# crash (e.g. write flap) is visible instead of burning hours downstream.
# Heartbeats the registered worktree every 10 min for the whole chain.
set -u
cd ~/workspace/worktrees/journey2-4 || exit 1
E=evidence/2026-11-13
BASE="FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1"

# heartbeat loop for the whole chain (killed when the chain ends)
( while true; do sleep 600; bash scripts/worktree-heartbeat.sh journey2-4 >/dev/null 2>&1; done ) &
HB_PID=$!
trap 'kill $HB_PID 2>/dev/null; exit' EXIT INT TERM

stamp() { date -u +%Y-%m-%dT%H:%M:%SZ; }
echo "=== CHAIN START $(stamp) ==="

run_probe() {
  # $1 = pass tag, $2 = seeds, $3 = extra env, $4 = outdir, $5 = analyzer args
  local tag="$1" seeds="$2" extra="$3" outdir="$4" aargs="$5"
  echo "=== PASS $tag START $(stamp) seeds=$seeds extra=[$extra] outdir=$outdir ==="
  # shellcheck disable=SC2086
  env $BASE $extra SEEDS="$seeds" EVIDDIR="$E/$outdir" \
    node scripts/probe-endgame-r194-20261113.js > "$E/journey-endgame-r194-$tag.log" 2> "$E/journey-endgame-r194-$tag.err"
  local rc=$?
  echo "=== PASS $tag PROBE EXIT $rc $(stamp) ==="
  if [ $rc -ne 0 ]; then echo "CHAIN STOPPED: pass $tag probe failed rc=$rc"; return $rc; fi
  echo "=== PASS $tag ANALYZE START $(stamp) ==="
  ANALYZEDIR="$E/$outdir" node scripts/analyze-endgame-r194-20261113.js $aargs > "$E/journey-endgame-r194-$tag-analyzer.log" 2> "$E/journey-endgame-r194-$tag-analyzer.err"
  rc=$?
  echo "=== PASS $tag ANALYZE EXIT $rc $(stamp) ==="
  grep -E "M2c-engine|CORPUS-PURITY|PRIMARY-BINDINGS|WIDE-VERDICT" "$E/journey-endgame-r194-$tag-analyzer.log" || true
  return 0
}

run_probe a 89701,89702,89703,89704,89705 "" perseed-endgame-r194 "" || exit 1
run_probe a-frozen 89701,89702,89703,89704,89705 "COMPETENT_PIN=r127" perseed-endgame-r194-frozen "" || exit 1
run_probe b 89701,89702,89703,89704,89705 "CAPSTONE=1 BUYOUT=1" perseed-endgame-r194-b "" || exit 1
run_probe c 89701,89702,89703,89704,89705 "CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1" perseed-endgame-r194-c "" || exit 1
run_probe c-wide 89706,89707,89708,89709,89710,89711,89712,89713 "CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1" perseed-endgame-r194-cwide "--wide" || exit 1

echo "=== DARK PROBE START $(stamp) ==="
node scripts/probe-darktable-r194-20261113.js > "$E/journey-endgame-r194-dark.log" 2> "$E/journey-endgame-r194-dark.err"
echo "=== DARK PROBE EXIT $? $(stamp) ==="
ls "$E/perseed-endgame-r194-dark/" | head -20
echo "=== CHAIN DONE $(stamp) ==="
