#!/bin/bash
# run-mealday-caller-a.sh — DIAG runner for sim-mealday-caller-a (2026-11-07,
# run fleshout-20261107T1615Z, Loop A). Measurement only, zero src/js changes.
# Derived from run-awayconfirm-a.sh (that script is NOT modified).
#
# PRE-REG (binding): competent only, 150d death-aware, PLENTYDEPRI=1
# DEPOSITGATE=1. Pilot P1 = 98067,98052,98079,98062,98034,98095,98022,98028
# (the 8 highest-fire seeds in the awayconfirm corpus, 86 known fires).
# Each pilot seed runs TWICE: MEALDAY_TRACE=0 (neutrality baseline) then
# MEALDAY_TRACE=1 (call-site recorder). After P1, the analyzer counts
# reproduced dedupe fires; if < 4, extension P2 runs once the same way
# (98051,98029,98065,98081,98092,98093,98099,98012; 50 known fires).
# If pilot + extension reproduce 0 fires, the verdict is DIAG-NO-GO on
# sample — no further seeds are run.
# Sweep stdout/stderr stream to the caller's pipe, never redirected to a
# file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the evidence
# file — a verdict must never be followed by a re-run.
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-11-07/mealday-caller-a-corpus
EVID=evidence/2026-11-07/sim-mealday-caller-a.md
export PLENTYDEPRI=1 DEPOSITGATE=1
P1="98067 98052 98079 98062 98034 98095 98022 98028"
P2="98051 98029 98065 98081 98092 98093 98099 98012"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  # $1 = seed, $2 = trace (0|1)
  python3 - "$CORPUS" "$1" "$2" <<'PY' 2>/dev/null
import json, os, sys
corpus, s, tr = sys.argv[1], int(sys.argv[2]), sys.argv[3]
f = os.path.join(corpus, f"mealday-caller-a-competent-s{s}-trace{tr}.json")
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
      node scripts/sweep-mealday-caller-a.js
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

run_list() {
  # $1 = seed list, $2 = label: trace-off then trace-on, then analyze.
  run_missing "$1" "$2" 0 || exit 2
  run_missing "$1" "$2" 1 || exit 2
  echo "=== analyzing $2 ==="
  node scripts/analyze-mealday-caller-a.js "$CORPUS" || exit 2
}

run_list "$P1" "pilot P1"
N="$(fire_count)"
echo "PILOT P1 COMPLETE — reproduced dedupe fires: $N (extension bar: < 4)"
if [ "$N" -lt 4 ]; then
  echo "EXTENSION RULE MET — $N < 4 reproduced fires; running P2 once"
  run_list "$P2" "extension P2"
  N="$(fire_count)"
  echo "P2 COMPLETE — cumulative reproduced dedupe fires: $N"
fi
if [ "$N" -eq 0 ]; then
  echo "ZERO reproduced fires on this base — verdict will be DIAG-NO-GO on sample (recorder still proven by the proof test's synthetic fires)"
fi
echo "RUNNER DONE — reproduced fires: $N"
exit 0
