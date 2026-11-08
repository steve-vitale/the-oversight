#!/bin/bash
# run-doublenight-fix-a.sh — FIX-ARM runner for sim-doublenight-fix-a
# (2026-11-07/08, run fleshout-20261108T0015Z, Loop A, axis food-economy).
# Derived from run-mealday-caller-a.sh (that script is NOT modified).
#
# Usage:
#   bash scripts/run-doublenight-fix-a.sh <corpus-dir>            # BEFORE mode
#   bash scripts/run-doublenight-fix-a.sh <corpus-dir> <before-corpus-dir>  # AFTER mode
#
# BEFORE mode (unfixed code): pilot P1 trace-off then trace-on, analyze;
# if reproduced fires < 4, extension P2 once the same way; if P1+P2
# reproduce 0 fires total, exit 3 NO-GO-ON-SAMPLE (no F1, arm killed —
# the fix is unproven live); else confirm F1 trace-on only, analyze, and
# write phases.json recording which lists ran.
# AFTER mode (fixed code): reads phases.json from the before corpus and
# repeats EXACTLY the same lists in the same order, then runs the analyzer
# in diff mode (before vs after).
#
# PRE-REG (binding): competent only, 150d death-aware, PLENTYDEPRI=1
# DEPOSITGATE=1. P1 = 98067,98052,98079,98062,98034,98095,98022,98028
# (deliberate reuse of the diag pilot — reproduction requires the same
# seeds). P2 = 98051,98029,98065,98081,98092,98093,98099,98012.
# F1 = 17901,17902,17903,17904,17905,17906,17907,17908 (fresh band).
# Sweep stdout/stderr stream to the caller's pipe, never redirected to a
# file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the evidence
# file — a verdict must never be followed by a re-run.
set -u
cd "$(dirname "$0")/.."
CORPUS="${1:?usage: run-doublenight-fix-a.sh <corpus-dir> [before-corpus-dir]}"
BEFORE_CORPUS="${2:-}"
EVID=evidence/2026-11-07/sim-doublenight-fix-a.md
export PLENTYDEPRI=1 DEPOSITGATE=1
P1="98067 98052 98079 98062 98034 98095 98022 98028"
P2="98051 98029 98065 98081 98092 98093 98099 98012"
F1="17901 17902 17903 17904 17905 17906 17907 17908"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  # $1 = seed, $2 = trace (0|1)
  python3 - "$CORPUS" "$1" "$2" <<'PY' 2>/dev/null
import json, os, sys
corpus, s, tr = sys.argv[1], int(sys.argv[2]), sys.argv[3]
f = os.path.join(corpus, f"doublenight-fix-a-competent-s{s}-trace{tr}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["mealdayTrace"] == int(tr)
assert j["daysAlive"] > 0
assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list)
assert len(j["mealRows"]) > 0
keys = set()
for m in j["mealRows"]:
    k = (m["vid"], m["day"])
    assert k not in keys, "duplicate meal row"
    keys.add(k)
if tr == "1":
    calls = j.get("mealCalls")
    assert isinstance(calls, list) and len(calls) > 0
    assert all(c.get("site") for c in calls), "a recorded call has no call site"
    assert all("eatsInv" in c and "seq" in c for c in calls), "a recorded call lacks invocation identity"
PY
}

missing_seeds() {
  local miss=""
  for s in $1; do
    if ! check_seed "$s" "$2"; then miss="$miss $s"; fi
  done
  echo "$miss" | sed 's/^ //'
}

verify_phase() {
  [ -z "$(missing_seeds "$1" "$2")" ] || return 1
  python3 - "$CORPUS" "$2" <<'PY' 2>/dev/null || return 1
import json, os, sys
corpus, tr = sys.argv[1], sys.argv[2]
j = json.load(open(os.path.join(corpus, f"sweep-competent-trace{tr}.json")))
assert j["meta"]["env"]["PLENTYDEPRI"] == "1" and j["meta"]["env"]["DEPOSITGATE"] == "1"
assert j["meta"]["env"]["MEALDAY_TRACE"] == tr
PY
  return 0
}

run_missing() {
  # $1 = seed list (space-separated), $2 = label, $3 = trace (0|1).
  # The sweep accepts EXACTLY one full 8-seed list, so retries ALWAYS
  # re-run the full list; the sweep overwrites per-seed files by seed and
  # the harness is deterministic, so re-running completed seeds cannot
  # change the corpus.
  local run_seeds attempt
  attempt=0
  while [ $attempt -lt 3 ]; do
    attempt=$((attempt+1))
    run_seeds="${1// /,}"
    echo "=== $2 trace=$3 attempt $attempt: running seeds $run_seeds ==="
    SEEDS="$run_seeds" DAYS=150 MEALDAY_TRACE="$3" \
      OUT="$CORPUS/sweep-competent-trace$3.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-doublenight-fix-a.js
    if verify_phase "$1" "$3"; then
      echo "VERIFY OK $2 trace=$3"
      return 0
    fi
    echo "VERIFY FAIL ($2 trace=$3 attempt $attempt) — fresh-process retry of the full list"
  done
  echo "FAIL LOUDLY: $2 trace=$3 never verified after fresh re-invokes" >&2
  return 2
}

fire_count() {
  python3 - "$CORPUS" <<'PY' 2>/dev/null || echo 0
import json, os, sys
corpus = sys.argv[1]
f = os.path.join(corpus, "analysis.json")
print(json.load(open(f)).get("reproducedFires", 0))
PY
}

analyze_here() {
  echo "=== analyzing $CORPUS ==="
  node scripts/analyze-doublenight-fix-a.js "$CORPUS" || exit 2
}

run_list() {
  # $1 = seed list, $2 = label: trace-off then trace-on, then analyze.
  run_missing "$1" "$2" 0 || exit 2
  run_missing "$1" "$2" 1 || exit 2
  analyze_here
}

run_list_trace1() {
  # $1 = seed list, $2 = label: trace-on only (fresh confirm band — the
  # recorder's neutrality is proven on P1, not re-proven per band).
  run_missing "$1" "$2" 1 || exit 2
  analyze_here
}

if [ -n "$BEFORE_CORPUS" ]; then
  # ---- AFTER mode: repeat exactly the before run's lists ----
  PHASES="$BEFORE_CORPUS/phases.json"
  if [ ! -f "$PHASES" ]; then
    echo "FAIL LOUDLY: no phases.json in before corpus $BEFORE_CORPUS — run BEFORE mode first." >&2
    exit 2
  fi
  RUN_P2="$(python3 -c "import json;print(json.load(open('$PHASES')).get('p2',False))" 2>/dev/null)"
  RUN_F1="$(python3 -c "import json;print(json.load(open('$PHASES')).get('f1',False))" 2>/dev/null)"
  echo "AFTER mode: phases from $PHASES (p2=$RUN_P2 f1=$RUN_F1)"
  run_list "$P1" "pilot P1 (after)"
  if [ "$RUN_P2" = "True" ]; then run_list "$P2" "extension P2 (after)"; fi
  if [ "$RUN_F1" = "True" ]; then run_list_trace1 "$F1" "confirm F1 (after)"; fi
  echo "=== analyzing before vs after ==="
  node scripts/analyze-doublenight-fix-a.js "$BEFORE_CORPUS" "$CORPUS" || exit 2
  echo "RUNNER DONE (after) — see diff analysis in $CORPUS/analysis.json"
  exit 0
fi

# ---- BEFORE mode: decide phases, write phases.json ----
run_list "$P1" "pilot P1 (before)"
N="$(fire_count)"
echo "PILOT P1 COMPLETE — reproduced dedupe fires: $N (extension bar: < 4)"
RUN_P2=0
if [ "$N" -lt 4 ]; then
  echo "EXTENSION RULE MET — $N < 4 reproduced fires; running P2 once"
  run_list "$P2" "extension P2 (before)"
  N="$(fire_count)"
  RUN_P2=1
  echo "P2 COMPLETE — cumulative reproduced dedupe fires: $N"
fi
if [ "$N" -eq 0 ]; then
  echo "ZERO reproduced fires on this base — NO-GO ON SAMPLE (fix unproven live); F1 confirm does not run."
  printf '{"p1": true, "p2": %s, "f1": false, "beforeFires": 0}\n' "$([ "$RUN_P2" = 1 ] && echo true || echo false)" > "$CORPUS/phases.json"
  exit 3
fi
run_list_trace1 "$F1" "confirm F1 (before)"
echo "BEFORE COMPLETE — reproduced fires: $N; F1 confirm ran."
printf '{"p1": true, "p2": %s, "f1": true, "beforeFires": %s}\n' "$([ "$RUN_P2" = 1 ] && echo true || echo false)" "$N" > "$CORPUS/phases.json"
echo "RUNNER DONE (before) — phases written to $CORPUS/phases.json"
exit 0
