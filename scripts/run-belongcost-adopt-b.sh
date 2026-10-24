#!/bin/bash
# run-belongcost-adopt-b.sh — ADOPTION runner completing the dead 1130Z
# belongcost pilot (sim-belongcost-adopt-b, backlog #889).
#
# ADOPTION RULE: run ONLY missing/invalid per-seed configs. Complete
# configs are never re-run (their files were copied verbatim from the dead
# tree ~/workspace/worktrees/sim-belongcost-b, which this script never
# touches). The dead runner re-ran a whole cell when its sweep summary was
# short; this runner runs only the missing seeds and lets the sweep's own
# merge (by seed, into the existing summary) rebuild the summary to 8 rows.
# PILOT ONLY: seeds 94101-94108, 6 configs (belongfeast {pd0,pd1}x{dg0,dg1}
# + leadfeast {pd0,pd1}x{dg1}). No confirm spend.
# Sweep stdout/stderr are NEVER redirected to a file (write-hazard: a
# redirect can silently kill node during an EPERM flap) — they stream to
# the caller's pipe. Per-seed JSONs go directly into the corpus dir
# (never /tmp). EPERM write failures exit the sweep with code 2; this
# runner retries with a fresh process, and already-written seeds are
# skipped on the next attempt, so progress is preserved across flap windows.
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/belongcost-b-corpus
REPORT="evidence/2026-10-24/belongcost-b-analyzer-report.txt"
export FEASTSCALE_R13=1 SEATDRIVE=0
PILOT="94101 94102 94103 94104 94105 94106 94107 94108"

if [ -s "$REPORT" ]; then
  echo "REFUSE: belongcost verdict report already exists ($REPORT) — refusing re-run after verdict." >&2
  exit 2
fi

# missing_seeds side dg pol pdn dgn -> space-separated missing seed list (empty = none)
missing_seeds() {
  local side="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  python3 - "$side" "$dg" "$pol" "$pdn" "$dgn" "$CORPUS" <<'PY' 2>/dev/null || echo "ALL"
import json, os, sys
side, dg, pol, pdn, dgn, corpus = sys.argv[1:7]
pdn, dgn = int(pdn), int(dgn)
missing = []
for s in range(94101, 94109):
    f = os.path.join(corpus, f"belongcost-b-{side}-{dg}-{pol}-s{s}.json")
    try:
        j = json.load(open(f))
        assert j["seed"] == s and j["policy"] == pol and j["plentydepri"] == pdn and j["depositgate"] == dgn
        assert j["daysAlive"] > 0 and "glutChannels" in j and "deathCauses" in j
        assert isinstance(j.get("deathRows"), list) and isinstance(j.get("daySeries"), list)
    except Exception:
        missing.append(str(s))
print(" ".join(missing))
PY
}

verify_cell() { # side dg pol pdn dgn
  local side="$1" dg="$2" pol="$3" pdn="$4" dgn="$5"
  [ -z "$(missing_seeds "$side" "$dg" "$pol" "$pdn" "$dgn")" ] || return 1
  local out="$CORPUS/sweep-${side}-${dg}-${pol}.json"
  [ -s "$out" ] || return 1
  python3 -c "
import json
j=json.load(open('$out'))
assert j['meta']['seeds']==[94101,94102,94103,94104,94105,94106,94107,94108], 'seed list mismatch'
assert j['meta']['env']['PLENTYDEPRI']=='$pdn' and j['meta']['env']['DEPOSITGATE']=='$dgn', 'env mismatch'
assert len(j['rows'])==8, 'row count mismatch'
assert all(r.get('diag') for r in j['rows']), 'diag missing'
" 2>/dev/null || return 1
  return 0
}

for spec in "belongfeast pd0 dg0" "belongfeast pd1 dg0" "belongfeast pd0 dg1" "belongfeast pd1 dg1" "leadfeast pd0 dg1" "leadfeast pd1 dg1"; do
  set -- $spec; pol="$1"; side="$2"; dg="$3"
  pdn=0; [ "$side" = pd1 ] && pdn=1
  dgn=0; [ "$dg" = dg1 ] && dgn=1
  if verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
    echo "SKIP $side-$dg-$pol (already verified)"
    continue
  fi
  echo "=== cell $side-$dg policy $pol ==="
  attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    miss="$(missing_seeds "$side" "$dg" "$pol" "$pdn" "$dgn")"
    if [ -n "$miss" ]; then
      run_seeds="${miss// /,}"
    else
      # Per-seed files complete but summary short/missing: re-run all seeds
      # so the sweep merge rebuilds the summary (idempotent, same RNG).
      run_seeds="94101,94102,94103,94104,94105,94106,94107,94108"
    fi
    echo "--- attempt $attempt: running seeds $run_seeds ---"
    SIDE="$side" DG="$dg" PLENTYDEPRI="$pdn" DEPOSITGATE="$dgn" POLICY="$pol" \
      SEEDS="$run_seeds" DAYS=100 \
      OUT="$CORPUS/sweep-${side}-${dg}-${pol}.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-belongcost-b.js
    if verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
      echo "VERIFY OK $side-$dg-$pol"
      break
    fi
    echo "VERIFY FAIL $side-$dg-$pol (attempt $attempt) — fresh-process retry with remaining seeds only"
  done
  if ! verify_cell "$side" "$dg" "$pol" "$pdn" "$dgn"; then
    echo "FAIL LOUDLY: cell $side-$dg-$pol never verified after fresh re-invokes" >&2
    exit 2
  fi
done
echo "ALL CELLS VERIFIED (8 seeds x 6 configs)"
