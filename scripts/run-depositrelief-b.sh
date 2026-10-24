#!/bin/bash
# run-depositrelief-b.sh — EPERM-flap-resilient sweep runner (sim-depositrelief-b).
#
# Adapted from scripts/run-bufferdepri-b.sh (cited). This container
# intermittently EPERMs file writes (node fs AND bash redirection, in waves
# of ~10-30 min, then recovers). The sweep script
# (scripts/sweep-depositrelief-b.js STDOUT_SPLIT=1) emits all file payloads on
# stdout with @@FILE/@@SWEEP markers; this runner captures the payload in
# memory and retries the split until every file verifies. The sims run ONCE
# per cell (payload captured); only the file SPLIT retries.
#
# The sweep merges summary rows by seed, so pilot (9250-9257) + full
# (9258-9265) invocations share one 16-row summary per cell; the verifier
# enforces 16 rows with diag present.
#
# FAILS LOUDLY (exit 2) if a cell never verifies after 40 split attempts.
# Finding #864: on verify failure re-invoke node for a fresh merge — never
# re-split a captured payload (the bufferdepri merge-READ failed silently in
# STDOUT_SPLIT mode). This runner's retry loop already re-invokes node on
# empty payload only; if a merge overwrite is suspected, delete the summary
# and re-run the cell fresh.
set -u
cd ~/workspace/worktrees/sim-depositrelief-b
CORPUS=evidence/2026-10-24/depositrelief-b-corpus
mkdir -p "$CORPUS" || { echo "CORPUS MKDIR FAIL LOUDLY"; exit 2; }
export FEASTSCALE_R13=1 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
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

verify_cell() { # side pol drn seeds_csv -> 0 iff the expected per-seed files + summary verify
  local side="$1" pol="$2" drn="$3" seeds_csv="$4"
  local nseeds=0
  local IFS=,
  for s in $seeds_csv; do
    nseeds=$((nseeds+1))
    local f="$CORPUS/depositrelief-b-${side}-${pol}-s${s}.json"
    [ -s "$f" ] || return 1
    python3 -c "
import json,sys
j=json.load(open('$f'))
assert j['seed']==$s and j['policy']=='$pol' and j['depositrelief']==$drn and j['depositgate']==1 and j['plentydepri']==0, 'field mismatch'
" 2>/dev/null || return 1
  done
  local out="$CORPUS/sweep-${side}-${pol}.json"
  [ -s "$out" ] || return 1
  python3 -c "
import json
j=json.load(open('$out'))
want=[$seeds_csv]
assert sorted(j['meta']['seeds'])==sorted(want), 'seed list mismatch: '+str(j['meta']['seeds'])
assert j['meta']['env']['DEPOSITRELIEF']=='$drn' and j['meta']['env']['DEPOSITGATE']=='1' and j['meta']['env']['PLENTYDEPRI']=='0', 'env mismatch'
assert len(j['rows'])==$nseeds, 'row count mismatch'
assert all(r.get('diag') for r in j['rows']), 'diag missing'
" 2>/dev/null || return 1
  return 0
}

run_cell() { # side pol drn seeds expect_seeds
  local side="$1" pol="$2" drn="$3" seeds="$4" expect="${5:-$4}"
  local out="$CORPUS/sweep-${side}-${pol}.json"
  if verify_cell "$side" "$pol" "$drn" "$expect"; then
    echo "CELL SKIP (already verified) $side $pol"; return 0
  fi
  # Finding #864: the node-side summary merge can fail silently in
  # STDOUT_SPLIT mode (the shell verifier re-splitting a captured payload
  # cannot fix a bad merge). So each node re-invocation does a FRESH merge;
  # split retries within one invocation only ride out the EPERM flap.
  for noderun in 1 2 3; do
    local payload
    payload=$(SEEDS="$seeds" POLICY="$pol" DAYS=100 SIDE="$side" \
      DEPOSITRELIEF="$drn" STDOUT_SPLIT=1 \
      node scripts/sweep-depositrelief-b.js 2>"$CORPUS/progress-${side}-${pol}.log")
    if [ -z "$payload" ]; then
      echo "node run $noderun empty for $side $pol — retrying"; sleep 10; continue
    fi
    for attempt in $(seq 1 15); do
      if printf '%s\n' "$payload" | split_stream "$CORPUS" "$out" && verify_cell "$side" "$pol" "$drn" "$expect"; then
        echo "CELL OK $side $pol (node run $noderun, split attempt $attempt)"; return 0
      fi
      echo "split verify failed $side $pol (node run $noderun attempt $attempt) — waiting out the flap"; sleep 90
    done
    echo "node run $noderun for $side $pol never verified — fresh merge re-invocation (#864)"
  done
  echo "CELL FAILED LOUDLY $side $pol"; return 2
}

pilot_engage() { # engagement sniff on the 8-seed pilot: relief stand-down fires on >=6/16 DR=1 pilot configs
  local n=0
  for pol in leadfeast belongfeast; do
    for s in 9250 9251 9252 9253 9254 9255 9256 9257; do
      local f="$CORPUS/depositrelief-b-dr1-${pol}-s${s}.json"
      [ -s "$f" ] || { echo "PILOT SNIFF MISSING $f"; return 2; }
      local dec
      dec=$(python3 -c "import json;print(json.load(open('$f'))['reliefStandDownDec'])" 2>/dev/null) || return 2
      [ "${dec:-0}" -gt 0 ] && n=$((n+1))
    done
  done
  echo "PILOT ENGAGEMENT SNIFF: relief stand-down fired on $n/16 DR=1 pilot configs (bar >=6)"
  [ "$n" -ge 6 ]
}

# Pass 1: pilot seeds (merges into the 16-seed summaries)
for side in dr0 dr1; do
  case "$side" in dr0) drn=0;; dr1) drn=1;; esac
  for pol in leadfeast belongfeast; do
    run_cell "$side" "$pol" "$drn" "$SEEDS_PILOT" || exit 2
  done
done
pilot_engage || { echo "PILOT NO-GO (engagement sniff failed) — full run gated"; exit 1; }
# Pass 2: full seeds (merges into the 8-row pilot summaries; verify expects all 16)
for side in dr0 dr1; do
  case "$side" in dr0) drn=0;; dr1) drn=1;; esac
  for pol in leadfeast belongfeast; do
    run_cell "$side" "$pol" "$drn" "$SEEDS_FULL" "$SEEDS_ALL" || exit 2
  done
done
echo "RUN-DEPOSITRELIEF COMPLETE"
