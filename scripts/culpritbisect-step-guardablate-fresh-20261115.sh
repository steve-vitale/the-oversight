#!/usr/bin/env bash
# culpritbisect-step-guardablate-fresh-20261115.sh — run ONE fresh-band
# guardablate step (arm sim-guardablate-fresh-a) on a detached
# checkout, with the fix-swap + restore discipline from the bisect
# prereg (evidence/2026-11-13/sim-culpritbisect-a-prereg.md) and the
# fresh prereg (evidence/2026-11-15/sim-guardablate-fresh-a-prereg.md).
#
# Usage: bash scripts/culpritbisect-step-guardablate-fresh-20261115.sh <commit> <step-id>
#   <commit>  full or short sha to test (605d72bd4 tip, or the
#             transplant-guardablate-fresh-subject commit)
#   <step-id> ep-tip-guardablate-fresh | tguardablate-fresh | tguardablate-fresh-r
#
# Mechanics are identical to scripts/culpritbisect-step-fresh-20261115.sh
# (same SEEDS/DAYS/RUN discipline, same fix swap f8fda4295a99, same
# byte-identical standing.js restore) except: the FRESH band
# 190631–190638, the guardablate-fresh 20261115 driver/analyzer
# (restored from the ARM branch sim-guardablate-fresh-a, since they do
# not exist on master), logs/summaries under evidence/2026-11-15/, and
# RUN guardablate-fresh-pilot. Run from a /tmp copy (REPO env) so the
# detached checkout cannot unlink the running script itself.
#
# It does NOT classify the fresh verdict — the analyzer prints the
# raw instrument label (GOOD / BAD / AMBIGUOUS); the fresh verdict
# (CONFIRMED / REFUTED / AMBIGUOUS, revised bar S <= B-3 / S >= B-1)
# is judged in the evidence file per the prereg.
# On ANY failure it restores standing.js + deletes scratch before
# exiting non-zero. It never commits anything.
set -u
BRANCH="master"
ARM_BRANCH="sim-guardablate-fresh-a"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="190631,190632,190633,190634,190635,190636,190637,190638"

if [ "$#" -ne 2 ]; then
  echo "CULPRITBISECT STEP STOP: usage: bash scripts/culpritbisect-step-guardablate-fresh-20261115.sh <commit> <step-id>" >&2
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
  rm -f scripts/culpritbisect-driver-guardablate-fresh-20261115.js scripts/culpritbisect-analyze-guardablate-fresh-20261115.js scripts/culpritbisect-driver-20261113.js scripts/culpritbisect-analyze-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js
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

# 3. Tooling scratch: the shared 20261113 tooling from master, plus
# the fresh guardablate-fresh 20261115 driver/analyzer from the ARM
# branch (they do not exist on master yet). None of these exist in the
# old trees.
for f in scripts/culpritbisect-driver-20261113.js scripts/culpritbisect-analyze-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js; do
  git show "$BRANCH:$f" > "$f" 2>/dev/null || fail "cannot restore scratch $f from $BRANCH"
done
for f in scripts/culpritbisect-driver-guardablate-fresh-20261115.js scripts/culpritbisect-analyze-guardablate-fresh-20261115.js; do
  git show "$ARM_BRANCH:$f" > "$f" 2>/dev/null || fail "cannot restore scratch $f from $ARM_BRANCH"
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
LOG="evidence/2026-11-15/guardablate-fresh-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
LEG=bisect STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN=guardablate-fresh-pilot node scripts/culpritbisect-driver-guardablate-fresh-20261115.js > "$LOG" 2>&1 || fail "bisect driver failed (see $LOG)"
STEP="$STEP" node scripts/culpritbisect-analyze-guardablate-fresh-20261115.js >> "$LOG" 2>&1
ANALYZER_RC=$?
SUMMARY="evidence/2026-11-15/guardablate-fresh-$STEP-summary.json"
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

# 7. Raw instrument label from the summary (GOOD / BAD /
# AMBIGUOUS). The fresh verdict is judged in the evidence file
# relative to the fresh baseline — never from this label alone.
node -e "
const s = require('./$SUMMARY');
console.log('step $STEP: ' + s.verdict + ' (survived ' + s.survived + '/8, rank ' + s.rankVerdict + ', median ' + s.wall.medianDays + 'd, errors ' + s.instrumentErrors + ')');
"
