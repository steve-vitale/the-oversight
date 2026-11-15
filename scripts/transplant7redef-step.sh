#!/usr/bin/env bash
# transplant7redef-step.sh — run ONE step (sniff, baseline, or subject
# leg) for the REDEFINED family-7 ablation (arm sim-transplant7redef-a;
# matched-band rerun arm sim-transplant7redef-match-a).
#
# The culpritbisect step script cannot run this arm: it hardcodes
# SEEDS=190391,...,190398 (the matched band) and restores scratch from
# master only, while the redefined analyzer lives on the arm branch.
# This script is its fresh-band twin: SEEDS from the environment
# (default the fresh band 190581-190588), the driver + shared analyzer
# + instrument restored from master, the redefined analyzer restored
# from the arm branch. The MATCHED-band rerun passes
# SEEDS=190391,...,190398 in the environment (see
# evidence/2026-11-15/sim-transplant7redef-match-prereg.md).
#
# Usage: SEEDS=190581,... bash scripts/transplant7redef-step.sh <commit> <step-id>
#   <commit>  full or short sha to test (e.g. b4343ac9d, or the subject commit)
#   <step-id> ep-tip-7redef-match-sniff | ep-tip-7redef-match | t7redef-match
#             (1215Z ids ep-tip-7redef-sniff / ep-tip-7redef /
#              t7redef-23245d5d6 for the fresh-band run)
#
# What it does, in order:
#   1. Refuses if any TRACKED file is dirty (untracked step corpora
#      from earlier steps are fine).
#   2. Checks out <commit> detached.
#   3. Restores tooling scratch: bisect driver + masterregress analyzer
#      + vetfirst instrument from master; the redefined analyzer from
#      the arm branch (it does not exist on master).
#   4. Swaps in the fix standing.js (sha f8fda429...), verifies the
#      ROSTER CHECK marker + exact sha.
#   5. Runs the bisect driver (8 seeds, 150d, competent verbatim)
#      and the redefined analyzer; logs to
#      evidence/2026-11-13/culpritbisect-a-<step>-driver.log.
#   6. Restores the commit's native standing.js byte-identical
#      (sha-verified), restores the tooling scratch from the step
#      commit (finding #2381 fix), verifies the tracked tree is
#      clean again.
#   7. Prints the step classification (GOOD / BAD / AMBIGUOUS).
#
# It does NOT judge the transplant verdict — the proof
# (scripts/test-transplant7redef-match.js §9) applies the subject-minus-
# baseline delta mapping to the two summaries. On ANY failure it
# restores standing.js + restores scratch before exiting non-zero.
# It never commits anything.
#
# Run from a /tmp copy with REPO passed in (the detached checkout
# would otherwise unlink the running script itself).
set -u
BRANCH="master"
ARM_BRANCH="${ARM_BRANCH:-sim-transplant7redef-match-a}"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="${SEEDS:-190581,190582,190583,190584,190585,190586,190587,190588}"

if [ "$#" -ne 2 ]; then
  echo "TRANSPLANT7REDEF STEP STOP: usage: SEEDS=... bash scripts/transplant7redef-step.sh <commit> <step-id>" >&2
  exit 2
fi
COMMIT="$1"
STEP="$2"
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

restore() {
  # Restore native standing.js for $COMMIT (exact bytes) and restore
  # tooling scratch from the step commit. The scratch files are TRACKED
  # at the step commit (driver + shared analyzer + instrument on
  # master; redefined analyzer on the arm branch), so deleting them
  # leaves the tree dirty and fails the script's own clean-tree check
  # (finding #2381 — struck twice on the 1215Z arm, sniff + baseline).
  # Restore from HEAD (the detached step commit after a successful
  # checkout, the arm branch if the checkout failed); fall back to
  # delete only for a file the commit does not carry.
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  for f in scripts/culpritbisect-driver-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js scripts/transplant7redef-analyze.js; do
    git checkout HEAD -- "$f" 2>/dev/null || rm -f "$f"
  done
}
fail() {
  echo "TRANSPLANT7REDEF STEP FAIL ($STEP @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "TRANSPLANT7REDEF STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

# 1. Tracked tree must be clean (untracked corpora are fine).
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "TRANSPLANT7REDEF STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi

# 2. Check out the step commit (detached).
git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
HEAD12="$(git rev-parse HEAD | cut -c1-12)"
echo "step $STEP: HEAD $HEAD12 ($(git log -1 --format=%s HEAD | cut -c1-100))"

# 3. Tooling scratch: driver + shared analyzer + instrument from master;
# the redefined analyzer from the arm branch (it does not exist on master).
for f in scripts/culpritbisect-driver-20261113.js scripts/masterregress-analyze-20261113.js scripts/vetfirst-instrument-20261111.js; do
  git show "$BRANCH:$f" > "$f" 2>/dev/null || fail "cannot restore scratch $f from $BRANCH"
done
git show "$ARM_BRANCH:scripts/transplant7redef-analyze.js" > scripts/transplant7redef-analyze.js 2>/dev/null || fail "cannot restore scratch scripts/transplant7redef-analyze.js from $ARM_BRANCH"

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
echo "step $STEP: seeds $SEEDS"

# 5. Driver + analyzer. The log captures both. (The dated evidence
# dir does not exist at old commits — create it first, or the
# shell redirect itself fails before node starts.)
LOG="evidence/2026-11-13/culpritbisect-a-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
LEG=bisect STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN=culpritbisect-pilot node scripts/culpritbisect-driver-20261113.js > "$LOG" 2>&1 || fail "bisect driver failed (see $LOG)"
STEP="$STEP" SEEDS="$SEEDS" node scripts/transplant7redef-analyze.js >> "$LOG" 2>&1
ANALYZER_RC=$?
SUMMARY="evidence/2026-11-13/culpritbisect-a-$STEP-summary.json"
[ -f "$SUMMARY" ] || fail "analyzer wrote no summary $SUMMARY (see $LOG)"
if [ "$ANALYZER_RC" -ne 0 ]; then
  echo "step $STEP: WARNING analyzer exited $ANALYZER_RC (instrument errors or unclassifiable read — see $LOG)" >&2
fi

# 6. Restore native standing.js byte-identical; restore scratch from
# the step commit (finding #2381 fix — never delete tracked scratch);
# verify the tracked tree is clean again.
restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "TRANSPLANT7REDEF STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

# 7. Classification from the summary.
node -e "
const s = require('./$SUMMARY');
console.log('step $STEP: ' + s.verdict + ' (survived ' + s.survived + '/8, rank ' + s.rankVerdict + ', median ' + s.wall.medianDays + 'd, errors ' + s.instrumentErrors + ')');
"
