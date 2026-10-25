#!/bin/bash
# run-awayration-packtail-confirm-b.sh — two-phase runner for the sim-packtail-b TAIL PACK re-try.
# Phase 1 (baseline) MUST run on unmodified code; phase 2 (armed) runs after the lever lands.
#   bash scripts/run-awayration-packtail-confirm-b.sh baseline   # before the fix
#   bash scripts/run-awayration-packtail-confirm-b.sh armed      # after the fix (sweep + analyzer + panel attempt)
# Pre-registered CONFIRM band: 94909-94924 (16 seeds), competent, 150d death-aware,
# PLENTYDEPRI=1/DEPOSITGATE=1. Corpora live in the worktree under
# evidence/2026-10-25/sim-packtail-confirm-b-corpus/{baseline,armed}/ (NEVER /tmp).
# REFUSE once a line-start "VERDICT-RENDERED:" line exists in the evidence file.
# FRESHNESS: before any sim, verify no 94901-94908 seed appears as an exact "seed"
# field in any per-seed corpus under evidence/ (excluding this run's own corpus dirs)
# or as a per-seed filename, and no dated .md file other than this run's own evidence
# file names the band as a run band; on any hit, FAIL LOUDLY (do not silently shift).
set -u
cd "$(dirname "$0")/.."
PHASE="${1:-}"
[ "$PHASE" = "baseline" ] || [ "$PHASE" = "armed" ] || { echo "USAGE: run-awayration-packtail-confirm-b.sh baseline|armed" >&2; exit 2; }
ROOT_CORPUS=evidence/2026-10-25/sim-packtail-confirm-b-corpus
CORPUS="$ROOT_CORPUS/$PHASE"
EVID=evidence/2026-10-25/sim-packtail-confirm-b.md
export PLENTYDEPRI=1 DEPOSITGATE=1
BAND="94909 94910 94911 94912 94913 94914 94915 94916 94917 94918 94919 94920 94921 94922 94923 94924"

if grep -q "^VERDICT-RENDERED:" "$EVID" 2>/dev/null; then
  echo "REFUSE: verdict already rendered in $EVID — refusing re-run after verdict." >&2
  exit 2
fi

# Freshness pre-check (python): exact "seed" fields + per-seed filenames + dated .md band mentions.
python3 - "$BAND" <<'PY' || { echo "FAIL LOUDLY: freshness pre-check failed — band 94909-94924 collides with prior evidence" >&2; exit 2; }
import json, os, re, sys
want = set(int(x) for x in sys.argv[1].split())
own_md = os.path.normpath("evidence/2026-10-25/sim-packtail-confirm-b.md")
own_dirs = {os.path.normpath("evidence/2026-10-25/sim-packtail-confirm-b-corpus")}
for root, dirs, files in os.walk("evidence"):
    if os.path.normpath(root) in own_dirs:
        dirs[:] = []
        continue
    dirs[:] = [d for d in dirs if os.path.normpath(os.path.join(root, d)) not in own_dirs]
    for f in files:
        p = os.path.join(root, f)
        if re.search(r's949(09|1[0-9]|2[0-4])\b', f):
            raise SystemExit("collision: per-seed filename " + p)
        if f.endswith(".json"):
            try: j = json.load(open(p))
            except Exception: continue
            if isinstance(j, dict):
                if j.get("seed") in want:
                    raise SystemExit("collision: seed %s in %s" % (j.get("seed"), p))
                ms = (j.get("meta") or {}).get("seeds") or []
                for s2 in ms:
                    if s2 in want:
                        raise SystemExit("collision: meta seed %s in %s" % (s2, p))
        elif f.endswith(".md") and os.path.normpath(p) != own_md:
            try: t = open(p).read()
            except Exception: continue
            for s in want:
                if re.search(r'\b%d\b' % s, t):
                    raise SystemExit("collision: seed %s named in %s" % (s, p))
print("FRESHNESS OK: band 94909-94924 absent from all prior evidence corpora and dated notes")
PY

check_seed() {
  python3 - "$CORPUS" "$1" <<'PY' 2>/dev/null
import json, os, sys
corpus, s = sys.argv[1], int(sys.argv[2])
f = os.path.join(corpus, f"packtail-confirm-b-competent-s{s}.json")
j = json.load(open(f))
assert j["seed"] == s and j["policy"] == "competent"
assert j["plentydepri"] == 1 and j["depositgate"] == 1
assert j["daysAlive"] > 0
for k in ["deathRows", "mealRows", "daySeries", "packRows", "packMealRows"]:
    assert isinstance(j.get(k), list), "missing " + k
assert len(j["mealRows"]) > 0
for rows, name in [(j["mealRows"], "meal"), (j["packRows"], "pack"), (j["packMealRows"], "packMeal")]:
    keys = set()
    for r in rows:
        k = (r["vid"], r["day"])
        assert k not in keys, "duplicate %s row" % name
        keys.add(k)
for p in j["packRows"]:
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
  local attempt=0
  while [ $attempt -lt 4 ]; do
    attempt=$((attempt+1))
    echo "=== $PHASE attempt $attempt: running seeds ${1// /, } (missing: $(missing_seeds "$1")) ==="
    SEEDS="${1// /,}" DAYS=150 \
      OUT="$CORPUS/sweep-competent.json" PERSEED_DIR="$CORPUS" \
      node scripts/sweep-awayration-packtail-confirm-b.js
    if verify_phase "$1"; then
      echo "VERIFY OK $PHASE"
      return 0
    fi
    echo "VERIFY FAIL ($PHASE attempt $attempt) — fresh-process retry of the whole band"
  done
  echo "FAIL LOUDLY: $PHASE band never verified after fresh re-invokes" >&2
  return 2
}

run_missing "$BAND" || exit 2
if [ "$PHASE" = "armed" ]; then
  echo "=== analyzer (packtail-confirm-b: baseline vs armed) ==="
  node scripts/analyze-awayration-packtail-confirm-b.js "$ROOT_CORPUS/baseline" "$ROOT_CORPUS/armed" || {
    echo "FAIL LOUDLY: packtail-b analyzer failed — cannot judge tail bar" >&2
    exit 2
  }
  echo "=== balanced panel attempt (§15; sweep corpora expected to throw, recorded as tool finding) ==="
  node scripts/balance-panel.js compare "$ROOT_CORPUS/baseline/sweep-competent.json" "$ROOT_CORPUS/armed/sweep-competent.json" 2>&1 | head -20 || true
  echo "PACKTAIL-CONFIRM-B SWEEP + ANALYZER COMPLETE"
else
  echo "PACKTAIL-CONFIRM-B BASELINE COMPLETE (armed phase runs after the lever lands)"
fi
exit 0
