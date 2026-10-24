#!/bin/bash
# run-pdvalue-b.sh — LEVER verdict sweep runner (sim-pdvalue-b, backlog #871).
#
# Runs the pdvalue sweep: seeds x policies {leadfeast,belongfeast} x cells
# {pd0,pd1}x{dg0,dg1}, one node invocation per cell. SEEDS env selects the
# stage: pilot "94001,...,94008" (64 configs) or full
# "94001,...,94008,94011,...,94026" (192 configs; the sweep script merges
# by seed, so the full run extends the pilot summaries idempotently).
# EPERM-flap note: the sweep script writes files itself (writeRobust:
# atomic temp+rename with retries + read-back).
#
# verify_cell: N per-seed JSONs (non-zero, schema spot-check) + N-row
# summary with diag. On verify failure: RE-INVOKE NODE for a fresh merge
# (finding #864 — never re-split a captured payload).
set -u
cd ~/workspace/worktrees/sim-pdvalue-b
CORPUS=evidence/2026-10-24/pdvalue-b-corpus
export FEASTSCALE_R13=1 SEATDRIVE=0
SEEDS="${SEEDS:-94001,94002,94003,94004,94005,94006,94007,94008}"
# seed list as space-separated array for verify loops
read -ra SEED_ARR <<< "${SEEDS//,/ }"
NSEEDS="${#SEED_ARR[@]}"

run_cell() { # side dg policy
  local side="$1" dg="$2" pol="$3" pdn dgn
  if [ "$side" = pd1 ]; then pdn=1; else pdn=0; fi
  if [ "$dg" = dg1 ]; then dgn=1; else dgn=0; fi
  SIDE="$side" DG="$dg" PLENTYDEPRI="$pdn" DEPOSITGATE="$dgn" POLICY="$pol" \
    SEEDS="$SEEDS" DAYS=100 \
    node scripts/sweep-pdvalue-b.js 2>&1 | tail -3
}

verify_cell() { # side dg policy pdn dgn -> 0 iff N per-seed + N-row summary verify
  local side="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  for s in "${SEED_ARR[@]}"; do
    local f="$CORPUS/pdvalue-b-${side}-${dg}-${pol}-s${s}.json"
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
want=[int(x) for x in '''$SEEDS'''.split(',')]
assert j['meta']['seeds']==want, 'seed list mismatch'
assert j['meta']['env']['PLENTYDEPRI']=='$pdn' and j['meta']['env']['DEPOSITGATE']=='$dgn', 'env mismatch'
assert len(j['rows'])==$NSEEDS, 'row count mismatch'
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
echo "ALL CELLS VERIFIED ($NSEEDS seeds x 2 policies x 4 cells)"
