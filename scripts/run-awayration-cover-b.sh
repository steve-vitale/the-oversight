#!/bin/bash
# run-awayration-cover-b.sh — single-band runner for the sim-awayration-cover-b
# COVERAGE re-registration (2026-10-24, oversight-flesh-out-loop-b).
# Measurement only, zero src/js changes. Pre-registered band: 94701-94732
# (32 seeds), competent, 150d death-aware, PLENTYDEPRI=1/DEPOSITGATE=1.
# Sweep stdout/stderr stream to the caller's pipe, never redirected to a
# file. Per-seed JSONs go directly into the corpus dir (never /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the evidence
# file — a verdict must never be followed by a re-run. (Anchored: pre-reg
# prose may mention the token, but only a line-start verdict line trips it.)
# FRESHNESS: before any sim, verify no 94701-94732 seed appears as an exact
# "seed" field in any other per-seed corpus under evidence/2026-10-24 and
# no such corpus filename exists; on any hit, FAIL LOUDLY (do not silently
# shift — the pre-registered band binds the analyzer constants).
set -u
cd "$(dirname "$0")/.."
CORPUS=evidence/2026-10-24/awayration-cover-b-corpus
EVID=evidence/2026-10-24/sim-awayration-cover-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
BAND="94701 94702 94703 94704 94705 94706 94707 94708 94709 94710 94711 94712 94713 94714 94715 94716 94717 94718 94719 94720 94721 94722 94723 94724 94725 94726 94727 94728 94729 94730 94731 94732"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

# Freshness pre-check (python): exact "seed" fields + corpus filenames.
python3 - "$BAND" <<'PY' || { echo "FAIL LOUDLY: freshness pre-check failed — band 94701-94732 collides with prior evidence" >&2; exit 2; }
import json, os, sys
want = set(int(x) for x in sys.argv[1].split())
ev = "evidence/2026-10-24"
for d in sorted(os.listdir(ev)):
    if not d.endswith("-corpus") or d == "awayration-cover-b-corpus":
        continue
    dd = os.path.join(ev, d)
    if not os.path.isdir(dd):
        continue
    for f in sorted(os.listdir(dd)):
        if f.startswith("awayration-cover-b-"):
            raise SystemExit("collision: cover-b filename in " + d)
        if f.endswith(".json") and not f.startswith("sweep-"):
            try:
                j = json.load(open(os.path.join(dd, f)))
            except Exception:
                continue
            if j.get("seed") in want:
                raise SystemExit("collision: seed %s already in %s/%s" % (j.get("seed"), d, f))
print("FRESHNESS OK: band 94701-94732 absent from all prior evidence/2026-10-24 corpora")
PY

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"awayration-cover-b-competent-s{s}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["daysAlive"] > 0
assert isinstance(j.get("deathRows"), list) and isinstance(j.get("mealRows"), list) and isinstance(j.get("daySeries"), list) and isinstance(j.get("packRows"), list)
assert len(j["mealRows"]) > 0
keys = set()
for m in j["mealRows"]:
    k = (m["vid"], m["day"])
    assert k not in keys, "duplicate meal row"
    keys.add(k)
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
  local run_seeds attempt
  attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    run_seeds="${1// /,}"
    echo "=== band attempt $attempt: running seeds $run_seeds (missing: $(missing_seeds "$1")) ==="
    SEEDS="$run_seeds" DAYS=150 \
      OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-awayration-cover-b.js
    if verify_phase "$1"; then
      echo "VERIFY OK band"
      return 0
    fi
    echo "VERIFY FAIL (band attempt $attempt) — fresh-process retry of the whole band"
  done
  echo "FAIL LOUDLY: band never verified after fresh re-invokes" >&2
  return 2
}

run_missing "$BAND" || exit 2
echo "=== analyzer (cover-b) ==="
node scripts/analyze-awayration-cover-b.js "$CORPUS" full || {
  echo "FAIL LOUDLY: cover-b analyzer failed — cannot judge coverage bar" >&2
  exit 2
}
echo "COVER-B SWEEP + ANALYZER COMPLETE"
exit 0
