#!/bin/bash
# Whiffguard sweep driver: 8 seeds x 2 policies x 3 runs (A1, A2 guard-off; B guard-on).
# s44 guard-off is expected to STALL (precondition) — 150s timeout, timeouts recorded.
cd ~/workspace/worktrees/sim-inffight2 || exit 1
mkdir -p /tmp/wg
for seed in 11 22 33 44 55 66 77 88; do
  for pol in leadcourt belongseek; do
    for run in a1 a2; do
      out=/tmp/wg/${run}-${pol}-${seed}.json
      if [ -f "$out" ]; then echo "skip $out (exists)"; continue; fi
      to=300; [ "$seed" = "44" ] && to=150
      echo "--- $run $pol $seed (guard OFF, timeout ${to}s)"
      SEED=$seed POLICY=$pol OUT=$out WHIFFGUARD=0 timeout $to node scripts/sweep-whiffguard-20261014.js 2>&1 | tail -1
      echo "exit=$?"
    done
    out=/tmp/wg/b-${pol}-${seed}.json
    if [ -f "$out" ]; then echo "skip $out (exists)"; continue; fi
    echo "--- b $pol $seed (guard ON, timeout 300s)"
    SEED=$seed POLICY=$pol OUT=$out timeout 300 node scripts/sweep-whiffguard-20261014.js 2>&1 | tail -1
    echo "exit=$?"
  done
done
echo "SWEEP DONE"
