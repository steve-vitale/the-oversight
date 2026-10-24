#!/bin/bash
# run-bufferdepri-b.sh — EPERM-flap-resilient sweep runner (sim-bufferdepri-b).
#
# Adapted from scripts/run-depinteraction-b.sh (cited). This container
# intermittently EPERMs file writes (node fs AND bash redirection, in waves
# of ~10-30 min, then recovers). The sweep script
# (scripts/sweep-bufferdepri-b.js STDOUT_SPLIT=1) emits all file payloads on
# stdout with @@FILE/@@SWEEP markers; this runner captures the payload in
# memory and retries the split until every file verifies. The sims run ONCE
# per cell (payload captured); only the file SPLIT retries.
#
# The sweep merges summary rows by seed, so pilot (9250-9257) + full
# (9258-9265) invocations share one 16-row summary per cell; the verifier
# enforces 16 rows with diag present.
#
# FAILS LOUDLY (exit 2) if a cell never verifies after 30 split attempts.
set -u
cd ~/workspace/worktrees/sim-bufferdepri-b
CORPUS=evidence/2026-10-24/perseed-bufferdepri-b
export FEASTSCALE_R13=1 SEATDRIVE=0
SEEDS_PILOT="9250,9251,9252,9253,9254,9255,9256,9257"
SEEDS_FULL="9258,9259,9260,9261,9262,9263,9264,9265"
SEEDS_ALL="9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265"

split_stream() {
  local dir="$1" out="$2" f="" mode=""
  while IFS= read -r line; do
    case "$line" in
      "@@FILE "*) f="$dir/${line#@@FILE }"; mode=file ;;
      "@@SWEEP") mode=sweep ;;
      *) if [ "$mode" = sweep ]; then printf '%s\n' "$line" > "$out" || return 1; mode=""
         elif [ "$mode" = file ]; then printf '%s\n' "$line" > "$f" || return 1; mode=""; fi ;;
    esac
  done
  return 0
}

verify_cell() { # pd dg pol pdn dgn -> 0 iff all 16 per-seed + 16-row summary verify
  local pd="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  for s in 9250 9251 9252 9253 9254 9255 9256 9257 9258 9259 9260 9261 9262 9263 9264 9265; do
    local f="$CORPUS/bufferdepri-b-${pd}-${dg}-${pol}-s${s}.json"
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
assert len(j['rows'])==16, 'row count mismatch'
assert all(r.get('diag') for r in j['rows']), 'diag missing'
" 2>/dev/null || return 1
  return 0
}

run_cell() { # pd dg pol pdn dgn seeds
  local pd="$1" dg="$2" pol="$3" pdn="$4" dgn="$5" seeds="$6"
  local out="$CORPUS/sweep-${pd}-${dg}-${pol}.json"
  if verify_cell "$pd" "$dg" "$pol" "$pdn" "$dgn"; then
    echo "CELL SKIP (already verified) $pd $dg $pol"; return 0
  fi
  local payload=""
  for noderun in 1 2 3; do
    payload=$(SEEDS="$seeds" POLICY="$pol" DAYS=100 SIDE="$pd" DG="$dg" \
      PLENTYDEPRI="$pdn" DEPOSITGATE="$dgn" STDOUT_SPLIT=1 \
      node scripts/sweep-bufferdepri-b.js 2>"$CORPUS/progress-${pd}-${dg}-${pol}.log")
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

# Pass 1: pilot seeds (merges into any existing summary rows)
for pd in pd0 pd1 pd2; do
  case "$pd" in pd0) pdn=0;; pd1) pdn=1;; pd2) pdn=2;; esac
  for dg in dg0 dg1; do
    case "$dg" in dg0) dgn=0;; dg1) dgn=1;; esac
    for pol in leadfeast belongfeast; do
      run_cell "$pd" "$dg" "$pol" "$pdn" "$dgn" "$SEEDS_PILOT" || exit 2
    done
  done
done
# Pass 2: full seeds
for pd in pd0 pd1 pd2; do
  case "$pd" in pd0) pdn=0;; pd1) pdn=1;; pd2) pdn=2;; esac
  for dg in dg0 dg1; do
    case "$dg" in dg0) dgn=0;; dg1) dgn=1;; esac
    for pol in leadfeast belongfeast; do
      run_cell "$pd" "$dg" "$pol" "$pdn" "$dgn" "$SEEDS_FULL" || exit 2
    done
  done
done
echo "RUN-BUFFERDEPRI COMPLETE"
