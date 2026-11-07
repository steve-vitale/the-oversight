#!/bin/bash
# run-awayconfirm-a.sh — batch-by-batch CASE-COUNT-SIZED CONFIRM runner for
# sim-awayconfirm-a (2026-11-07, run fleshout-20261107T1205Z).
# Measurement only, zero src/js changes. Derived from
# run-fullpantry-casecount-b.sh (casecount family); that script is NOT
# modified. Deltas: 25-seed batches from 98000, corpus
# evidence/2026-11-07/awayconfirm-a-corpus, verdict guard on this run's
# evidence file evidence/2026-11-07/sim-awayconfirm-a.md, hard cap 100 seeds.
#
# PRE-REG (binding): competent only, 150d death-aware, batches of 25
# starting at 98000 (band verified fresh against all dated preregs +
# evidence .md files + per-seed filenames + exact seed fields before sims).
# B1 98000-98024, B2 98025-98049, B3 98050-98074, B4 98075-98099.
# After each batch, count full-pantry villager starvation deaths
# (pantryKcal >= 8000 AND freshDays >= 3.0, cause starvation, not player)
# in the corpus so far; STOP at the batch boundary once n >= 8.
# The count rule (every named mechanism >= 2) is a VERDICT gate, NOT a
# stopping condition — a lone B/C case at n>=8 stops the run and fails
# the verdict on the stopped corpus; no extension batch is run.
# Hard cap 100 seeds (4 batches). If 100 seeds end with n < 8 the
# verdict is NO-GO ON SAMPLE, not a refutation.
# Sweep stdout/stderr stream to the caller's pipe, never redirected
# to a file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the
# evidence file — a verdict must never be followed by a re-run.
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-11-07/awayconfirm-a-corpus
EVID=evidence/2026-11-07/sim-awayconfirm-a.md
export PLENTYDEPRI=1 DEPOSITGATE=1
B1="$(seq 98000 98024 | tr '\n' ' ')"
B2="$(seq 98025 98049 | tr '\n' ' ')"
B3="$(seq 98050 98074 | tr '\n' ' ')"
B4="$(seq 98075 98099 | tr '\n' ' ')"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"awayconfirm-a-competent-s{s}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["daysAlive"] > 0
assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list)
assert len(j["mealRows"]) > 0
keys = set()
for m in j["mealRows"]:
    k = (m["vid"], m["day"])
    assert k not in keys, "duplicate meal row"
    keys.add(k)
PY
}

missing_seeds() {
  local miss=""
  for s in $1; do
    if ! check_seed "$s"; then miss="$miss $s"; fi
  done
  echo "$miss" | sed 's/^ //'
}

fullpantry_count() {
  python3 - "$CORPUS" <<'PY' 2>/dev/null || echo 0
import json, os, sys, glob
corpus = sys.argv[1]
n = 0
for f in glob.glob(os.path.join(corpus, "awayconfirm-a-competent-s*.json")):
    try: j = json.load(open(f))
    except Exception: continue
    for d in j.get("deathRows", []):
        if d.get("cause") != "starvation" or d.get("isPlayer"): continue
        ctx = d.get("ctx") or {}
        if (ctx.get("pantryKcal") or 0) >= 8000 and (ctx.get("freshDays") or 0) >= 3.0:
            n += 1
print(n)
PY
}

verify_phase() {
  [ -z "$(missing_seeds "$1")" ] || return 1
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null || return 1
import json, sys
corpus, want = sys.argv[1], [int(x) for x in sys.argv[2].split()]
j = json.load(open(corpus + "/sweep-competent.json"))
have = set(j["meta"]["seeds"])
assert all(s in have for s in want), "summary missing seeds"
assert j["meta"]["env"]["PLENTYDEPRI"] == "1" and j["meta"]["env"]["DEPOSITGATE"] == "1"
PY
  return 0
}

run_missing() {
  # Retry design (carried from the casecount family, where a mid-batch
  # session death stranded a batch): the sweep accepts EXACTLY one full
  # 25-seed batch, so a missing-only
  # retry list is refused by the sweep guard. Retries therefore ALWAYS
  # re-run the full batch; the sweep overwrites per-seed files by seed
  # and the harness is deterministic (test leg E proves seed 98000
  # re-runs byte-equivalent on death/meal counts), so re-running
  # completed seeds cannot change the corpus.
  local run_seeds attempt
  attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    run_seeds="${1// /,}"
    echo "=== $2 attempt $attempt: running seeds $run_seeds ==="
    SEEDS="$run_seeds" DAYS=150 \
      OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-awayconfirm-a.js
    if verify_phase "$1"; then
      echo "VERIFY OK $2"
      return 0
    fi
    echo "VERIFY FAIL ($2 attempt $attempt) — fresh-process retry with remaining seeds only"
  done
  echo "FAIL LOUDLY: $2 never verified after fresh re-invokes" >&2
  return 2
}

for BATCH in "B1" "B2" "B3" "B4"; do
  case "$BATCH" in
    B1) LIST="$B1" ;;
    B2) LIST="$B2" ;;
    B3) LIST="$B3" ;;
    B4) LIST="$B4" ;;
  esac
  run_missing "$LIST" "batch $BATCH" || exit 2
  N="$(fullpantry_count)"
  echo "BATCH $BATCH COMPLETE — cumulative full-pantry villager starvation deaths: $N (stopping bar: >= 8)"
  if [ "$N" -ge 8 ]; then
    echo "STOPPING RULE MET — n=$N >= 8 at a batch boundary; later batches not run"
    exit 0
  fi
done
echo "HARD CAP REACHED — 100 seeds swept, cumulative n=$(fullpantry_count) < 8: verdict will be NO-GO ON SAMPLE"
exit 0
