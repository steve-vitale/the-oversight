#!/bin/bash
# run-seasoning-tcp-sweep-b.sh — TCP-handshake sweep for sim-seasoning-b.
# Per config: spawn the TCP listener FIRST (it probes at spawn and
# writes <file>.ready only if born write-capable), sim ONLY after the
# .ready handshake, then send the record over TCP; the listener writes
# with 90s of readback-verified retries. Same driver oneRun, same
# record bytes, same paths, same validation as the other sweep
# runners — orchestration only, no measurement change.
# Why this exists: the split sweep's stdin writers are spawned AFTER
# the sim, so a group that flips mid-sim wastes the sim AND all 30
# writer spawns are born blocked (three failed attempts 14:48/14:51/
# 14:54, each after a pre-sim probe had passed). The .ready handshake
# means a born-blocked group costs <1s (no sim burned), and the
# listener's 90s post-receipt retry covers a flip-back at write time.
# NOTE (2026-11-16, proven 14:56): the TCP listener's 120s no-connection
# timer stays armed after a successful write and fires exit 1, so the
# listener's exit code is NOT the verdict — the file is. This script
# polls for a valid file and kills the lingering listener; a valid file
# is DONE whatever the listener exits with.
# GROUP RULE (proven this run): denial is per process group — a fresh
# exec call is a fresh group. This script exits 2 the moment a config
# cannot proceed, so the caller relaunches it in a fresh group.
# Usage: RUN=seasoning-b bash scripts/run-seasoning-tcp-sweep-b.sh [first-port]
#   exit 0 when all 16 files exist and validate; exit 2 when this
#   group cannot proceed (restart in a fresh group); exit 1 otherwise.
set -u
cd "$(dirname "$0")/.." || exit 1
SEEDS="102201 102202 102203 102204 102205 102206 102207 102208"
POLICIES="competent-covenant-b competent-courtship-b"
PORT_BASE=${1:-18901}
PORT=$PORT_BASE
missing() {
  local n=0
  for s in $SEEDS; do for p in $POLICIES; do
    local d=control; [ "$p" = "competent-courtship-b" ] && d=on
    local f="evidence/2026-11-16/perseed-seasoning-b-$d/seasoning-b-s${s}-${p}-seasoning-b.json"
    if [ ! -f "$f" ]; then n=$((n+1)); fi
  done; done
  echo "$n"
}
valid_file() {
  node -e "const fs=require('fs'); try{const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.exit(r&&Array.isArray(r.series)&&r.series.length>0&&Array.isArray(r.instrumentErrors)&&r.instrumentErrors.length===0?0:1);}catch(e){process.exit(1);}" "$1" 2>/dev/null
}
while [ "$(missing)" -gt 0 ]; do
  echo "=== tcp-sweep missing=$(missing) $(date -u +%H:%M:%S) ==="
  PROGRESS=0
  for s in $SEEDS; do for p in $POLICIES; do
    d=control; [ "$p" = "competent-courtship-b" ] && d=on
    f="evidence/2026-11-16/perseed-seasoning-b-$d/seasoning-b-s${s}-${p}-seasoning-b.json"
    if [ -f "$f" ]; then
      valid_file "$f" || { echo "STOP: $f exists but is invalid — inspect it first."; exit 3; }
      continue
    fi
    PORT=$((PORT + 1))
    rm -f "$f.ready" "$f".tmp-*
    echo "  seed $s $p: listener port $PORT $(date -u +%H:%M:%S)"
    node scripts/write-tcp-to-file-b.js "$f" "$PORT" 2>"$f.listener.log" &
    LPID=$!
    READY=0
    for i in $(seq 1 100); do
      [ -f "$f.ready" ] && { READY=1; break; }
      kill -0 $LPID 2>/dev/null || break
      sleep 0.1
    done
    if [ "$READY" -ne 1 ]; then
      wait $LPID; lrc=$?
      echo "  seed $s $p: listener born blocked (exit $lrc) — GROUP DENIED, exiting for a fresh-group restart"
      rm -f "$f.ready" "$f.listener.log"
      exit 2
    fi
    echo "  seed $s $p: sim $(date -u +%H:%M:%S)"
    RUN=seasoning-b node scripts/run-one-seasoning-b.js "$s" "$p" 150 "$f.ready" "$PORT"
    src=$?
    if [ "$src" -ne 0 ]; then
      echo "  seed $s $p: SIM/SEND FAILED rc=$src — killing listener, exiting for a fresh-group restart"
      kill $LPID 2>/dev/null; wait $LPID 2>/dev/null
      rm -f "$f.ready" "$f.listener.log"
      exit 2
    fi
    # The listener's exit code is NOT the verdict: its 120s no-connection
    # timer stays armed after a successful write and fires exit 1 (it
    # overwrites the 0 set by the write handler). The FILE is the verdict:
    # poll for a valid file, then kill the lingering listener. (Proven
    # 14:56: listener exited 1 yet the file was valid and complete.)
    WROTE=0
    for i in $(seq 1 200); do
      if [ -f "$f" ] && valid_file "$f"; then WROTE=1; break; fi
      kill -0 $LPID 2>/dev/null || break
      sleep 0.5
    done
    kill $LPID 2>/dev/null; wait $LPID 2>/dev/null
    if [ "$WROTE" -eq 1 ]; then
      rm -f "$f.ready" "$f.listener.log"
      echo "  seed $s $p: DONE $(date -u +%H:%M:%S)"
      PROGRESS=1
    else
      echo "  seed $s $p: WRITE FAILED (no valid file; listener log kept at $f.listener.log) — GROUP DENIED, exiting for a fresh-group restart"
      rm -f "$f.ready"
      exit 2
    fi
  done; done
  if [ "$PROGRESS" -eq 0 ] && [ "$(missing)" -gt 0 ]; then
    echo "=== tcp-sweep: no progress this pass — GROUP DENIED, exiting for a fresh-group restart ==="
    exit 2
  fi
done
echo "=== tcp-sweep finished missing=$(missing) $(date -u +%H:%M:%S) ==="
[ "$(missing)" -eq 0 ]
