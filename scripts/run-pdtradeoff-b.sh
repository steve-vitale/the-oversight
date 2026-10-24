#!/bin/bash
# run-pdtradeoff-b.sh — DIAG sweep runner (sim-pdtradeoff-b).
#
# Runs the 64-config sweep: seeds 9250-9265 x policies {leadfeast,belongfeast}
# x cells {pd0,pd1}x{dg0,dg1}, one node invocation per cell (16 seeds each).
# EPERM-flap note: the sweep script writes files itself (writeRobust:
# atomic temp+rename with retries + read-back). STDOUT_SPLIT is NOT used
# here — the sweep is single-pass per cell, so no cross-run summary merge
# is needed (the finding-#864 merge failure mode cannot trigger).
#
# verify_cell: 16 per-seed JSONs (non-zero, schema spot-check) + 16-row
# summary with diag. On verify failure: RE-INVOKE NODE for a fresh merge
# (finding #864 — never re-split a captured payload).
set -u
cd ~/workspace/worktrees/sim-pdtradeoff-b
CORPUS=evidence/2026-10-24/pdtradeoff-b-corpus
export FEASTSCALE_R13=1 SEATDRIVE=0
SEEDS="9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265"

run_cell() { # side dg policy
  local side="$1" dg="$2" pol="$3" pdn dgn
  if [ "$side" = pd1 ]; then pdn=1; else pdn=0; fi
  if [ "$dg" = dg1 ]; then dgn=1; else dgn=0; fi
  SIDE="$side" DG="$dg" PLENTYDEPRI="$pdn" DEPOSITGATE="$dgn" POLICY="$pol" \
    SEEDS="$SEEDS" DAYS=100 \
    node scripts/sweep-pdtradeoff-b.js 2>&1 | tail -3
}

verify_cell() { # side dg policy pdn dgn -> 0 iff 16 per-seed + 16-row summary verify
  local side="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  for s in 9250 9251 9252 9253 9254 9255 9256 9257 9258 9259 9260 9261 9262 9263 9264 9265; do
    local f="$CORPUS/pdtradeoff-b-${side}-${dg}-${pol}-s${s}.json"
    [ -s "$f" ] || return 1
    python3 -c "
import json
j=json.load(open('$f'))
assert j['seed']==$s and j['policy']=='$pol' and j['plentydepri']==$pdn and j['depositgate']==$dgn, 'field mismatch'
assert j['daysAlive']>0 and 'glutChannels' in j and 'deathCauses' in j, 'schema'
" 2>/dev/null || return 1
  done
  local out="$CORPUS/sweep-${side}-${dg}-${pol}.json"
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

for pol in leadfeast belongfeast; do
  for cell in "pd0 dg0" "pd1 dg0" "pd0 dg1" "pd1 dg1"; do
    set -- $cell
    side="$1"; dg="$2"
    pdn=0; [ "$side" = pd1 ] && pdn=1
    dgn=0; [ "$dg" = dg1 ] && dgn=1
    # RESUME: skip cells that already verify (survives VM reboots; per-seed
    # files persist on disk and re-runs are byte-identical).
    if verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
      echo "SKIP $side-$dg-$pol (already verified)"
      continue
    fi
    echo "=== cell $side-$dg policy $pol ==="
    tries=0
    while [ $tries -lt 2 ]; do
      run_cell "$side" "$dg" "$pol"
      if verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
        echo "VERIFY OK $side-$dg-$pol"
        break
      fi
      tries=$((tries+1))
      echo "VERIFY FAIL $side-$dg-$pol (attempt $tries) — re-invoking node for a fresh merge (finding #864)"
    done
    if ! verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
      echo "FAIL LOUDLY: cell $side-$dg-$pol never verified after fresh re-invoke" >&2
      exit 2
    fi
  done
done
echo "ALL CELLS VERIFIED"
