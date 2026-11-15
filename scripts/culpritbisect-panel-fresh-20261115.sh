#!/usr/bin/env bash
# culpritbisect-panel-fresh-20261115.sh — build ONE balance panel leg
# for the fresh-band transplant arm (sim-transplant2b-fresh-a) on a
# detached checkout, with the fix-swap + restore discipline from the
# bisect prereg (evidence/2026-11-13/sim-culpritbisect-a-prereg.md)
# and the fresh prereg
# (evidence/2026-11-15/sim-transplant2b-fresh-prereg.md).
#
# Usage: bash scripts/culpritbisect-panel-fresh-20261115.sh <commit> <label>
#   <commit>  203a32775 (before) or 385a9f7b6 (after)
#   <label>   before | after
# Run from a /tmp copy (REPO env) so the detached checkout cannot
# unlink the running script itself.
#
# What it does:
#   1. Refuses if any TRACKED file is dirty, or if legacy sweep env
#      overrides (REGION/ORIGIN/SEEDS/POLICIES/DAYS) are set.
#   2. Checks out <commit> detached.
#   3. Restores the CURRENT panel tooling as scratch from the ARM
#      branch (the old trees predate / differ from it).
#   4. Swaps in the fix standing.js (sha f8fda429...), verified —
#      the panel must observe the SAME substrate the judged legs ran
#      on. The swap is identical on both legs, so it cannot mask
#      the family diff in the source manifest.
#   5. Builds the panel (8 fresh seeds, competent only, 150d) to
#      /tmp/t2b-fresh-panel-<label>/ (cases/ cache stays in /tmp,
#      never committed).
#   6. Restores native standing.js byte-identical (sha-verified),
#      restores the native panel files, verifies the tracked tree
#      clean.
# It never commits anything.
set -u
ARM_BRANCH="sim-transplant2b-fresh-a"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="190621,190622,190623,190624,190625,190626,190627,190628"

if [ "$#" -ne 2 ]; then
  echo "PANEL STEP STOP: usage: bash scripts/culpritbisect-panel-fresh-20261115.sh <commit> <label>" >&2
  exit 2
fi
COMMIT="$1"
LABEL="$2"
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

restore() {
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  # The panel files EXIST at the old commits (2026-10-17 tooling), so
  # restore their native versions — deleting them would dirty the tree.
  # If one is absent at the commit, delete the scratch copy instead.
  for f in scripts/balance-panel.js scripts/gear-usage-audit.js scripts/lib/balance-scorecard.js scripts/lib/simulation-flags.js scripts/lib/balance-cohorts.js scripts/lib/source-text.js scripts/lib/luck-instrument.js scripts/balance-metrics.json; do
    git show "$COMMIT:$f" > "$f" 2>/dev/null || rm -f "$f"
  done
}
fail() {
  echo "PANEL STEP FAIL ($LABEL @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "PANEL STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "PANEL STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi
if env | grep -q -E '^(REGION|ORIGIN|SEEDS|POLICIES|DAYS)='; then
  echo "PANEL STEP STOP: legacy sweep env overrides are set — unset REGION/ORIGIN/SEEDS/POLICIES/DAYS" >&2
  exit 2
fi

git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
echo "panel $LABEL: HEAD $(git rev-parse HEAD | cut -c1-12) ($(git log -1 --format=%s HEAD | cut -c1-100))"

for f in scripts/balance-panel.js scripts/gear-usage-audit.js scripts/lib/balance-scorecard.js scripts/lib/simulation-flags.js scripts/lib/balance-cohorts.js scripts/lib/source-text.js scripts/lib/luck-instrument.js scripts/balance-metrics.json; do
  git show "$ARM_BRANCH:$f" > "$f" 2>/dev/null || fail "cannot restore scratch $f from $ARM_BRANCH"
done

NATIVE_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
echo "panel $LABEL: native standing.js sha ${NATIVE_SHA:0:12}"
git show 5157782a4:src/js/standing.js > src/js/standing.js || fail "cannot extract fix standing.js"
SWAP_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$SWAP_SHA" = "$FIX_SHA" ] || fail "swapped standing.js sha ${SWAP_SHA:0:12} is not the fix sha f8fda4295a99"
grep -q "ROSTER CHECK" src/js/standing.js || fail "swapped standing.js lacks the ROSTER CHECK marker"
echo "panel $LABEL: fix standing.js swapped in (f8fda4295a99)"

OUT="/tmp/t2b-fresh-panel-$LABEL"
rm -rf "$OUT"
node scripts/balance-panel.js --root "$REPO" --out "$OUT" --seeds "$SEEDS" --policies competent --days 150 > "/tmp/t2b-fresh-panel-$LABEL.log" 2>&1
PANEL_RC=$?
tail -5 "/tmp/t2b-fresh-panel-$LABEL.log"
[ "$PANEL_RC" -eq 0 ] || fail "panel build failed with exit $PANEL_RC (see /tmp/t2b-fresh-panel-$LABEL.log)"
[ -f "$OUT/panel.json.gz" ] || fail "panel build wrote no $OUT/panel.json.gz"

restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "PANEL STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi
echo "panel $LABEL: built OK ($OUT/panel.json.gz), standing restored, tree clean"
