#!/bin/bash
# run-fullpantry-confirm-b.sh — PILOT + pre-registered EXTENSION runner for the
# sim-fullpantry-confirm-b DIAG (2026-10-24, backlog #910 follow-up).
# Measurement only, zero src/js changes.
#
# PHASE 1 (pilot): seeds 94421-94428, competent, 150d death-aware.
# PHASE 2 (extension, pre-registered): ONLY if the pilot yields < 8
# full-pantry villager starvation deaths (gate: pantryKcal >= 8000 AND
# freshDays >= 3.0 at death, cause starvation, not the player), run
# seeds 94429-94436. The extension exists because sim-pantrystarve-b
# went DIAG-NO-GO on n=5 < 8 — this run fixes the power by design,
# not by re-scoring. If the pilot already yields >= 8, phase 2 never runs.
# Sweep stdout/stderr stream to the caller's pipe, never redirected to
# a file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the
# evidence file — a verdict must never be followed by a re-run.
# (Anchored: pre-reg prose may mention the token, but only a
# line-start verdict line trips the guard.)
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/fullpantry-confirm-b-corpus
EVID=evidence/2026-10-24/sim-fullpantry-confirm-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
PILOT="94421 94422 94423 94424 94425 94426 94427 94428"
EXT="94429 94430 94431 94432 94433 94434 94435 94436"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"fullpantry-confirm-b-competent-s{s}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["daysAlive"] > 0
assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list)
assert len(j["mealRows"]) > 0
# dedupe audit: one meal row per (vid,day)
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
import json, os, sys
corpus = sys.argv[1]
n = 0
for s in range(94421, 94429):
    f = os.path.join(corpus, f"fullpantry-confirm-b-competent-s{s}.json")
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
  local miss run_seeds attempt
  attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    miss="$(missing_seeds "$1")"
    if [ -n "$miss" ]; then
      run_seeds="${miss// /,}"
    else
      run_seeds="${1// /,}"
    fi
    echo "=== $2 attempt $attempt: running seeds $run_seeds ==="
    SEEDS="$run_seeds" DAYS=150 \
      OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-fullpantry-confirm-b.js
    if verify_phase "$1"; then
      echo "VERIFY OK $2"
      return 0
    fi
    echo "VERIFY FAIL ($2 attempt $attempt) — fresh-process retry with remaining seeds only"
  done
  echo "FAIL LOUDLY: $2 never verified after fresh re-invokes" >&2
  return 2
}

run_missing "$PILOT" "pilot" || exit 2
N="$(fullpantry_count)"
echo "PILOT full-pantry villager starvation deaths: $N (pre-registered extension bar: < 8)"
if [ "$N" -ge 8 ]; then
  echo "PILOT SUFFICIENT — extension band not run (pre-registered rule)"
  exit 0
fi
echo "PILOT UNDER-POWERED (n=$N < 8) — running pre-registered extension band 94429-94436"
run_missing "$EXT" "extension" || exit 2
echo "EXTENSION COMPLETE — pooled corpus: pilot + extension (analyzer full mode)"
exit 0
