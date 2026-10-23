#!/bin/bash
# run-depinteraction-b.sh — EPERM-flap-resilient full sweep runner
# (sim-depinteraction-b, 2026-10-23).
#
# This container intermittently EPERMs file writes (same flap class as the
# jest chown EPERM in AGENTS.md — affects node fs writes AND bash
# redirection, in waves of ~10-30 min, then recovers). The sweep script
# (scripts/sweep-depinteraction-b.js STDOUT_SPLIT=1) emits all file payloads
# on stdout with @@FILE/@@SWEEP markers; this runner captures the payload
# in memory and retries the split until every file verifies. The sims run
# ONCE per cell (payload captured); only the file SPLIT retries.
#
# FAILS LOUDLY (exit 2) if a cell never verifies after 30 split attempts.
set -u
cd ~/workspace/worktrees/sim-depinteraction-b
CORPUS=evidence/2026-10-23/depinteraction-b-corpus
export FEASTSCALE_R13=1 SEATDRIVE=0
SEEDS="9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265"

split_stream() {
  local dir="$1" out="$2" f="" mode=""
  while IFS= read -r line; do
    case "$line" in
      "@@FILE "*) f="$dir/${line#@@FILE }"; mode=file ;;
      "@@SWEEP") mode=sweep ;;
      *) if [ "$mode" = sweep ]; then printf '%s\n' "$line" > "$out" || return 1; mode=""
         else printf '%s\n' "$line" > "$f" || return 1; mode=""; fi ;;
    esac
  done
  return 0
}

verify_cell() { # pd dg pol -> 0 iff all 16 per-seed + summary verify
  local pd="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  for s in 9250 9251 9252 9253 9254 9255 9256 9257 9258 9259 9260 9261 9262 9263 9264 9265; do
    local f="$CORPUS/depinteraction-b-${pd}-${dg}-${pol}-s${s}.json"
    [ -s "$f" ] || return 1
    python3 -c "
import json,sys
j=json.load(open('$f'))
assert j['seed']==$s and j['policy']=='$pol' and j['plentydepri']==$pdn and j['depositgate']==$dgn, 'field mismatch'
" 2>/dev/null || return 1
  done
  local out="$CORPUS/sweep-${pd}-${dg}-${pol}.json"
  [ -s "$out" ] || return 1
  python3 -c "
import json
j=json.load(open('$out'))
assert j['meta']['seeds']==[9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265], 'seed list mismatch'
assert j['meta']['env']['PLENTYDEPRI']=='$pdn' and j['meta']['env']['DEPOSITGATE']=='$dgn', 'env mismatch'
" 2>/dev/null || return 1
  return 0
}

run_cell() { # pd dg pol pdn dgn
  local pd="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  local out="$CORPUS/sweep-${pd}-${dg}-${pol}.json"
  if verify_cell "$pd" "$dg" "$pol" "$pdn" "$dgn"; then
    echo "CELL SKIP (already verified) $pd $dg $pol"; return 0
  fi
  local payload=""
  for noderun in 1 2 3; do
    payload=$(SEEDS="$SEEDS" POLICY="$pol" DAYS=100 SIDE="$pd" DG="$dg" \
      PLENTYDEPRI="$pdn" DEPOSITGATE="$dgn" STDOUT_SPLIT=1 \
      node scripts/sweep-depinteraction-b.js 2>"$CORPUS/progress-${pd}-${dg}-${pol}.log")
    [ -n "$payload" ] && break
    echo "node run $noderun empty for $pd $dg $pol — retrying"; sleep 10
  done
  [ -n "$payload" ] || { echo "CELL NODE-FAIL LOUDLY $pd $dg $pol"; return 2; }
  for attempt in $(seq 1 40); do
    if printf '%s\n' "$payload" | split_stream "$CORPUS" "$out" && verify_cell "$pd" "$dg" "$pol" "$pdn" "$dgn"; then
      echo "CELL OK $pd $dg $pol (split attempt $attempt)"; return 0
    fi
    echo "split verify failed $pd $dg $pol attempt $attempt — waiting out the flap"; sleep 90
  done
  echo "CELL FAILED LOUDLY $pd $dg $pol"; return 2
}

for cell in pd0-dg0 pd1-dg0 pd0-dg1 pd1-dg1; do
  pd=${cell%-*}; dg=${cell#*-}
  for pol in leadfeast belongfeast; do
    pdn=0; [ "$pd" = pd1 ] && pdn=1
    dgn=0; [ "$dg" = dg1 ] && dgn=1
    run_cell "$pd" "$dg" "$pol" "$pdn" "$dgn" || exit 2
  done
done
echo "FULL SWEEP DONE"
