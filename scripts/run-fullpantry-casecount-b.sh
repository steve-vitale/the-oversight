#!/bin/bash
# ADOPTED (sim-casecount-adopt-b, run fleshout-loop-b-20261025T0335Z):
# copied verbatim from the dead run fleshout-loop-b-20261025T0030Z tree
# ~/workspace/worktrees/sim-fullpantry-casecount-b (read-only source,
# never edited there) with exactly two deltas: (1) the post-verdict
# refusal guard now points at this adoption's evidence file
# evidence/2026-10-24/sim-casecount-adopt-b.md instead of the dead run's
# sim-fullpantry-casecount-b.md, so the guard still bites in this tree;
# (2) this header note. Instrument filenames, batches, gates, and the
# stopping rule are unchanged. The dead run's corpus (B1 complete + B2
# through seed 94653) was copied, never moved, into this tree.
# run-fullpantry-casecount-b.sh — batch-by-batch CASE-COUNT runner for
# sim-fullpantry-casecount-b (2026-10-24, run fleshout-loop-b-20261025T0030Z).
# Measurement only, zero src/js changes.
#
# PRE-REG (binding): competent only, 150d death-aware, batches of 32
# starting at 94601 (shifted +100 from the brief's 94501 start because
# awayration-size-b already used 94501-94508; shift verified fresh
# against evidence/2026-10-24 corpus filenames + *.md before sims).
# B1 94601-94632, B2 94633-94664, B3 94665-94696, B4 94697-94728.
# After each batch, count full-pantry villager starvation deaths
# (pantryKcal >= 8000 AND freshDays >= 3.0, cause starvation, not player)
# in the corpus so far; STOP at the batch boundary once n >= 8.
# Hard cap 128 seeds (4 batches). If 128 seeds end with n < 8 the
# verdict is NO-GO ON SAMPLE, not a refutation.
# Sweep stdout/stderr stream to the caller's pipe, never redirected
# to a file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the
# evidence file — a verdict must never be followed by a re-run.
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/fullpantry-casecount-b-corpus
EVID=evidence/2026-10-24/sim-casecount-adopt-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
B1="$(seq 94601 94632 | tr '\n' ' ')"
B2="$(seq 94633 94664 | tr '\n' ' ')"
B3="$(seq 94665 94696 | tr '\n' ' ')"
B4="$(seq 94697 94728 | tr '\n' ' ')"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"fullpantry-casecount-b-competent-s{s}.json")
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
for f in glob.glob(os.path.join(corpus, "fullpantry-casecount-b-competent-s*.json")):
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
  # Retry design (fixed after a mid-batch session death at seed 94610):
  # the sweep accepts EXACTLY one full 32-seed batch, so a missing-only
  # retry list is refused by the sweep guard. Retries therefore ALWAYS
  # re-run the full batch; the sweep overwrites per-seed files by seed
  # and the harness is deterministic (test leg E proves seed 94601
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
      node scripts/sweep-fullpantry-casecount-b.js
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
echo "HARD CAP REACHED — 128 seeds swept, cumulative n=$(fullpantry_count) < 8: verdict will be NO-GO ON SAMPLE"
exit 0
