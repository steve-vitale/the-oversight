#!/bin/bash
# run-seasoning-sweep-split-b.sh — split-pipeline sweep for sim-seasoning-b.
# Per config: run the sim ONCE, capture its record into a shell variable
# (memory, never a file), then feed it to a FRESH writer process that
# writes the file immediately. The writer retries are cheap (no sim
# re-run) because the record stays in $REC.
# Why: the write flap is per-process-GROUP and sticky once denied
# (proven 12:26-12:56: concurrent A/B loops 112/112 vs 0/115; a writer
# that probed OK at spawn could not write 2 min later while fresh
# probes wrote fine in the same minute; a fresh group whose probe
# passed still had all writers fail after a ~40s sim). Pipelining
# runner|writer spawns the writer ~20-40s before it can write — long
# enough for its group to flip. Spawning the writer AFTER the sim,
# with the record already in memory, means it writes within ~1s of
# spawn. The writer still probes first and exits 2 if born blocked.
# GROUP-DENIAL EXITS: if a config's writer loop exhausts, or a round
# runs zero sims, this group is presumed denied and the script exits 2
# at once — no further write in this group will ever succeed. The
# caller restarts the sweep in a FRESH group; valid files are skipped,
# so restarts resume cleanly. A sweep needs ~10 min of continuous
# able-group time for 16 configs, but OFF windows run 1-3 min, so
# expect several restarts, each landing a few files.
# Usage: bash scripts/run-seasoning-sweep-split-b.sh
#   exit 0 when all 16 files exist and validate; exit 2 when this
#   group is denied (restart in a fresh group); exit 1 otherwise.
set -u
cd "$(dirname "$0")/.." || exit 1
SEEDS="102201 102202 102203 102204 102205 102206 102207 102208"
POLICIES="competent-covenant-b competent-courtship-b"
MAX_ROUNDS=200
ROUND=0
missing() {
  local n=0
  for s in $SEEDS; do for p in $POLICIES; do
    local d=control; [ "$p" = "competent-courtship-b" ] && d=on
    local f="evidence/2026-11-16/perseed-seasoning-b-$d/seasoning-b-s${s}-${p}-seasoning-b.json"
    if [ ! -f "$f" ]; then n=$((n+1)); fi
  done; done
  echo "$n"
}
probe_ok() {
  # Write-only probe: only write() proves writeability (a denied
  # write leaves a 0-byte file — open() succeeds, write() is refused).
  # Unlink is best-effort in a separate step. One fixed filename.
  node -e "const fs=require('fs'); const f='evidence/2026-11-16/.probe'; let ok=false; try{fs.writeFileSync(f,'p'); ok=true;}catch(e){} try{fs.unlinkSync(f);}catch(e){} process.exit(ok?0:1);" 2>/dev/null
}
while [ "$(missing)" -gt 0 ] && [ "$ROUND" -lt "$MAX_ROUNDS" ]; do
  ROUND=$((ROUND+1))
  MISS_BEFORE=$(missing)
  SIMS_THIS_ROUND=0
  echo "=== split-sweep round $ROUND missing=$MISS_BEFORE $(date -u +%H:%M:%S) ==="
  for s in $SEEDS; do for p in $POLICIES; do
    d=control; [ "$p" = "competent-courtship-b" ] && d=on
    f="evidence/2026-11-16/perseed-seasoning-b-$d/seasoning-b-s${s}-${p}-seasoning-b.json"
    if [ -f "$f" ]; then continue; fi
    # Pre-sim gate: during a long blocked window a sim is wasted (its
    # record would have nowhere to go). One probe sample; if it fails,
    # skip the sim this round — the next round retries it. A single
    # failed probe during flicker only costs one round, not a sim.
    if ! probe_ok; then echo "  seed $s $p: gate blocked, skipping sim this round $(date -u +%H:%M:%S)"; continue; fi
    echo "  seed $s $p: sim $(date -u +%H:%M:%S)"
    REC=$(node scripts/run-one-seasoning-b.js "$s" "$p" 150)
    rrc=$?
    if [ "$rrc" -ne 0 ] || [ -z "$REC" ]; then echo "  seed $s $p: SIM FAILED rc=$rrc (retry next round)"; continue; fi
    SIMS_THIS_ROUND=$((SIMS_THIS_ROUND+1))
    echo "  seed $s $p: write attempts $(date -u +%H:%M:%S)"
    wtry=0
    while [ ! -f "$f" ] && [ "$wtry" -lt 30 ]; do
      wtry=$((wtry+1))
      printf '%s' "$REC" | node scripts/write-stdin-to-file-b.js "$f"
      wrc=$?
      if [ "$wrc" -eq 0 ]; then break; fi
      if [ "$wrc" -eq 3 ]; then echo "  seed $s $p: writer refused (file exists?)"; break; fi
      sleep 0.25
    done
    if [ -f "$f" ]; then echo "  seed $s $p: DONE writer-tries=$wtry"
    else
      # A config whose writer loop exhausts means this process GROUP
      # has flipped to denied (sticky per group — proven by the A/B
      # loops and the 12:44 writer). No further write in this group
      # will ever succeed: exit at once so the caller restarts the
      # sweep in a fresh group. Checkpoints (valid files) resume it.
      echo "  seed $s $p: FAILED writer-tries=$wtry — GROUP DENIED, exiting for a fresh-group restart"
      rm -f evidence/2026-11-16/.probe evidence/2026-11-16/.writer-probe-* evidence/2026-11-16/perseed-seasoning-b-*/*.ready
      exit 2
    fi
    REC=""
  done; done
  # A round that ran zero sims (every pre-sim probe failed) means this
  # group is denied too — exit for a fresh-group restart.
  if [ "$SIMS_THIS_ROUND" -eq 0 ] && [ "$(missing)" -gt 0 ]; then
    echo "=== round $ROUND: zero sims ran — GROUP DENIED, exiting for a fresh-group restart ==="
    rm -f evidence/2026-11-16/.probe evidence/2026-11-16/.writer-probe-* evidence/2026-11-16/perseed-seasoning-b-*/*.ready
    exit 2
  fi
  # If the round made no progress (long blocked window), wait for a
  # clear window instead of spinning: probe every 2s, break out the
  # moment one passes (the gate flips on a ~1-min timescale, so a
  # fixed 60s rest would sleep through OFF windows). Cap the wait at
  # 120s per round; the round loop itself retries after that.
  if [ "$(missing)" -ge "$MISS_BEFORE" ] && [ "$(missing)" -gt 0 ]; then
    echo "=== round $ROUND: no progress, waiting for a clear window $(date -u +%H:%M:%S) ==="
    waited=0
    until probe_ok || [ "$waited" -ge 120 ]; do sleep 2; waited=$((waited+2)); done
    echo "=== clear window seen after ${waited}s (or timeout) $(date -u +%H:%M:%S) ==="
  fi
done
echo "=== split-sweep finished rounds=$ROUND missing=$(missing) $(date -u +%H:%M:%S) ==="
rm -f evidence/2026-11-16/.probe evidence/2026-11-16/.probe-* evidence/2026-11-16/.writer-probe-* evidence/2026-11-16/perseed-seasoning-b-*/*.ready
[ "$(missing)" -eq 0 ]
