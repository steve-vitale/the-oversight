#!/bin/bash
# run-awayration-size-b.sh — PILOT + pre-registered EXTENSION runner for the
# sim-awayration-size-b DIAG (2026-10-24, backlog #942 follow-up).
# Measurement only, zero src/js changes.
#
# PHASE 1 (pilot): seeds 94501-94508, competent, 150d death-aware.
# PHASE 2 (extension, pre-registered): ONLY if total away villager-days
# across the pilot is < 200 (read from the analyzer's pilot-mode
# AWAY_DAYS_TOTAL line), run seeds 94509-94516 and judge the verdict on
# the POOLED sample, strata reported separately. If the pilot already
# yields >= 200 away villager-days, phase 2 never runs.
# RETRY NOTE: the sweep mechanically refuses any seed list other than
# exactly PILOT, exactly EXT, or exactly PILOT+EXT, so a retry re-runs
# the whole phase band (not a partial list); per-seed files are
# overwritten deterministically, so re-running completed seeds is safe
# and never a re-score. The predecessor's partial-list retry would have
# tripped the sweep guard; this runner does not repeat that flaw.
# Sweep stdout/stderr stream to the caller's pipe, never redirected to
# a file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the
# evidence file — a verdict must never be followed by a re-run.
# (Anchored: pre-reg prose may mention the token, but only a
# line-start verdict line trips the guard.)
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/awayration-size-b-corpus
EVID=evidence/2026-10-24/sim-awayration-size-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
PILOT="94501 94502 94503 94504 94505 94506 94507 94508"
EXT="94509 94510 94511 94512 94513 94514 94515 94516"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"awayration-size-b-competent-s{s}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["daysAlive"] > 0
assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list) and isinstance(j.get("packRows"), list)
assert len(j["mealRows"]) > 0
# dedupe audit: one meal row per (vid,day)
keys = set()
for m in j["mealRows"]:
    k = (m["vid"], m["day"])
    assert k not in keys, "duplicate meal row"
    keys.add(k)
# pack audit: one pack row per (vid,day), packDay == day (dawn alignment)
pkeys = set()
for p in j["packRows"]:
    k = (p["vid"], p["day"])
    assert k not in pkeys, "duplicate pack row"
    pkeys.add(k)
    assert p["packDay"] == p["day"], "misaligned pack row"
PY
}

missing_seeds() {
  local miss=""
  for s in $1; do
    if ! check_seed "$s"; then miss="$miss $s"; fi
  done
  echo "$miss" | sed 's/^ //'
}

pilot_away_days() {
  # Analyzer pilot mode prints AWAY_DAYS_TOTAL=<n>; a nonzero analyzer
  # exit (missing corpus, C1 hit, pack misalignment) is a loud failure,
  # never a silent 0 that would wrongly trigger the extension.
  local out
  out="$(node scripts/analyze-awayration-size-b.js "$CORPUS" pilot)" || {
    echo "FAIL LOUDLY: pilot analyzer failed (see above) — cannot judge extension bar" >&2
    exit 2
  }
  echo "$out" | sed -n 's/^AWAY_DAYS_TOTAL=\([0-9]*\).*/\1/p' | head -1
}

verify_phase() {
  # $1 = seed list; also requires the summary to contain at least those seeds
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
  # $1 = seed list (space-separated), $2 = phase label
  # Retries re-run the WHOLE phase band: the sweep refuses partial lists,
  # and per-seed files are deterministic overwrites (see RETRY NOTE).
  local run_seeds attempt
  attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    run_seeds="${1// /,}"
    echo "=== $2 attempt $attempt: running seeds $run_seeds (missing: $(missing_seeds "$1")) ==="
    SEEDS="$run_seeds" DAYS=150 \
      OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-awayration-size-b.js
    if verify_phase "$1"; then
      echo "VERIFY OK $2"
      return 0
    fi
    echo "VERIFY FAIL ($2 attempt $attempt) — fresh-process retry of the whole band"
  done
  echo "FAIL LOUDLY: $2 never verified after fresh re-invokes" >&2
  return 2
}

run_missing "$PILOT" "pilot" || exit 2
N="$(pilot_away_days)"
echo "PILOT away villager-days: $N (pre-registered extension bar: < 200)"
if [ "$N" -ge 200 ]; then
  echo "PILOT SUFFICIENT — extension band not run (pre-registered rule)"
  exit 0
fi
echo "PILOT UNDER-POWERED (away days $N < 200) — running pre-registered extension band 94509-94516"
run_missing "$EXT" "extension" || exit 2
echo "EXTENSION COMPLETE — pooled corpus: pilot + extension (analyzer full mode)"
exit 0
