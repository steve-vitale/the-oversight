#!/usr/bin/env bash
# culpritbisect-step.sh — run ONE bisect step (or endpoint verification)
# on a detached checkout, with the fix-swap + restore discipline from
# the prereg (evidence/2026-11-13/sim-culpritbisect-a-prereg.md).
#
# Usage: bash scripts/culpritbisect-step.sh <commit> <step-id>
#   <commit>  full or short sha to test (e.g. 203a32775, e4dbe581b,
#             or a git-bisect candidate)
#   <step-id> sNN-<sha9> (e.g. s01-447085506) or ep-far / ep-merge
#             for the endpoint verification runs.
#
# What it does, in order:
#   1. Refuses if any TRACKED file is dirty (untracked step corpora
#      from earlier steps are fine).
#   2. Checks out <commit> detached.
#   3. Restores tooling scratch from master
#      (bisect driver + analyzer + masterregress analyzer, which the
#      bisect analyzer requires, + vetfirst instrument — none of
#      these exist in the old trees). The tooling lives on master
#      (landed with the round-11 merge); the old BRANCH
#      sim-culpritbisect-a was deleted after that merge, so
#      restoring from it fails. (Round 12 fix, 2026-11-13.)
#   4. Swaps in the fix standing.js (sha f8fda429...), verifies the
#      ROSTER CHECK marker + exact sha.
#   5. Runs the bisect driver (8 seeds, 150d, competent verbatim)
#      and the analyzer; logs to
#      evidence/2026-11-13/culpritbisect-a-<step>-driver.log.
#   6. Restores the commit's native standing.js byte-identical
#      (sha-verified), deletes the tooling scratch, verifies the
#      tracked tree is clean again.
#   7. Prints the step classification (GOOD / BAD / AMBIGUOUS).
#
# It does NOT run `git bisect good|bad` — the operator classifies
# (2/8 AMBIGUOUS needs a manual re-run decision) and runs bisect.
# On ANY failure it restores standing.js + deletes scratch before
# exiting non-zero. It never commits anything.
set -u
BRANCH="master"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="190391,190392,190393,190394,190395,190396,190397,190398"

if [ "$#" -ne 2 ]; then
  echo "CULPRITBISECT STEP STOP: usage: bash scripts/culpritbisect-step.sh <commit> <step-id>" >&2
  exit 2
fi
COMMIT="$1"
STEP="$2"
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

restore() {
  # Restore native standing.js for $COMMIT (exact bytes) and delete
  # tooling scratch. Never fails the run further — best effort, then
  # the caller verifies.
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  rm -f scripts/culpritbisect-driver-20261113.js scripts/culpritbisect-analyze-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js
}
fail() {
  echo "CULPRITBISECT STEP FAIL ($STEP @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "CULPRITBISECT STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

# 1. Tracked tree must be clean (untracked corpora are fine).
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "CULPRITBISECT STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi

# 2. Check out the step commit (detached).
git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
HEAD12="$(git rev-parse HEAD | cut -c1-12)"
echo "step $STEP: HEAD $HEAD12 ($(git log -1 --format=%s HEAD | cut -c1-100))"

# 3. Tooling scratch from the branch (these files do not exist in old trees).
for f in scripts/culpritbisect-driver-20261113.js scripts/culpritbisect-analyze-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js; do
  git show "$BRANCH:$f" > "$f" 2>/dev/null || fail "cannot restore scratch $f from $BRANCH"
done

# Native standing sha (for the byte-identical restore later).
NATIVE_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
echo "step $STEP: native standing.js sha ${NATIVE_SHA:0:12}"

# 4. Swap in the fix standing.js; verify marker + exact sha.
git show 5157782a4:src/js/standing.js > src/js/standing.js || fail "cannot extract fix standing.js"
SWAP_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$SWAP_SHA" = "$FIX_SHA" ] || fail "swapped standing.js sha ${SWAP_SHA:0:12} is not the fix sha f8fda4295a99"
grep -q "ROSTER CHECK" src/js/standing.js || fail "swapped standing.js lacks the ROSTER CHECK marker"
echo "step $STEP: fix standing.js swapped in (f8fda4295a99)"

# Policy on record (own-policy per step; the driver records the sha).
POLICY_SHA="$(sha256sum scripts/policies/competent.js | cut -d' ' -f1)"
echo "step $STEP: own policy sha ${POLICY_SHA:0:12}"

# 5. Driver + analyzer. The log captures both. (The dated evidence
# dir does not exist at old commits — create it first, or the
# shell redirect itself fails before node starts.)
LOG="evidence/2026-11-13/culpritbisect-a-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
LEG=bisect STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN=culpritbisect-pilot node scripts/culpritbisect-driver-20261113.js > "$LOG" 2>&1 || fail "bisect driver failed (see $LOG)"
STEP="$STEP" node scripts/culpritbisect-analyze-20261113.js >> "$LOG" 2>&1
ANALYZER_RC=$?
SUMMARY="evidence/2026-11-13/culpritbisect-a-$STEP-summary.json"
[ -f "$SUMMARY" ] || fail "analyzer wrote no summary $SUMMARY (see $LOG)"
if [ "$ANALYZER_RC" -ne 0 ]; then
  echo "step $STEP: WARNING analyzer exited $ANALYZER_RC (instrument errors or unclassifiable read — see $LOG)" >&2
fi

# 6. Restore native standing.js byte-identical; delete scratch; verify.
restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "CULPRITBISECT STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

# 7. Classification from the summary.
node -e "
const s = require('./$SUMMARY');
console.log('step $STEP: ' + s.verdict + ' (survived ' + s.survived + '/8, rank ' + s.rankVerdict + ', median ' + s.wall.medianDays + 'd, errors ' + s.instrumentErrors + ')');
"
