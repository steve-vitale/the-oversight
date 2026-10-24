#!/bin/bash
# run-pantrystarve-b.sh — PILOT-ONLY runner for the sim-pantrystarve-b DIAG.
# (2026-10-24, backlog #910. Measurement only, zero src/js changes.)
#
# PILOT ONLY: seeds 94301-94308, competent policy, 150d death-aware.
# The sweep itself refuses any other seed list / horizon; this runner
# runs missing seeds only, with fresh-process retries (EPERM lesson
# #904: never force ref surgery, never truncate-rewrite a script
# during a flap). Sweep stdout/stderr stream to the caller's pipe,
# never redirected to a file. Per-seed JSONs go directly into the
# corpus dir (never /tmp).
# REFUSE once VERDICT-RENDERED (DIAG-GO or DIAG-NO-GO) exists in the
# evidence file — a verdict must never be followed by a re-run.
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/pantrystarve-b-corpus
EVID=evidence/2026-10-24/sim-pantrystarve-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
PILOT="94301 94302 94303 94304 94305 94306 94307 94308"

if grep -q "VERDICT-RENDERED" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

missing_seeds() {
  python3 - "$CORPUS" <<'PY' 2>/dev/null || echo "ALL"
import json, os, sys
corpus = sys.argv[1]
missing = []
for s in range(94301, 94309):
    f = os.path.join(corpus, f"pantrystarve-b-competent-s{s}.json")
    try:
        j = json.load(open(f))
        assert j["seed"] == s and j["policy"] == "competent"
        assert j["plentydepri"] == 1 and j["depositgate"] == 1
        assert j["daysAlive"] > 0
        assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list)
        assert len(j["mealRows"]) > 0
    except Exception:
        missing.append(str(s))
print(" ".join(missing))
PY
}

verify_pilot() {
  [ -z "$(missing_seeds)" ] || return 1
  local out="$CORPUS/sweep-competent.json"
  [ -s "$out" ] || return 1
  python3 -c "
import json
j=json.load(open('$out'))
assert j['meta']['seeds']==[94301,94302,94303,94304,94305,94306,94307,94308], 'seed list mismatch'
assert j['meta']['env']['PLENTYDEPRI']=='1' and j['meta']['env']['DEPOSITGATE']=='1', 'env mismatch'
assert len(j['rows'])==8, 'row count mismatch'
assert all(r.get('diag') for r in j['rows']), 'diag missing'
" 2>/dev/null || return 1
  return 0
}

if verify_pilot; then
  echo "SKIP (pilot already verified)"
  exit 0
fi

attempt=0
while [ $attempt -lt 4 ]; do
  attempt=$((attempt+1))
  miss="$(missing_seeds)"
  if [ -n "$miss" ]; then
    run_seeds="${miss// /,}"
  else
    run_seeds="94301,94302,94303,94304,94305,94306,94307,94308"
  fi
  echo "=== attempt $attempt: running seeds $run_seeds ==="
  SEEDS="$run_seeds" DAYS=150 \
    OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
    node scripts/sweep-pantrystarve-b.js
  if verify_pilot; then
    echo "VERIFY OK pilot (8 seeds, competent, 150d)"
    exit 0
  fi
  echo "VERIFY FAIL (attempt $attempt) — fresh-process retry with remaining seeds only"
done
echo "FAIL LOUDLY: pilot never verified after fresh re-invokes" >&2
exit 2
