#!/usr/bin/env bash
# talktranscript-step.sh — run ONE OVE-48 spoken-drive judged
# transcript step (one leg of the talktranscript run) on a detached
# checkout, with the fix-swap + restore discipline from the bisect
# prereg (evidence/2026-11-13/sim-culpritbisect-a-prereg.md).
# Modeled on scripts/ove48-mech-step.sh; the differences are
# pre-registered in evidence/2026-11-14/sim-talktranscript-prereg.md
# (band-3 seeds, tooling restored from branch sim-talktranscript-a
# because it is not on master, corpus under evidence/2026-11-14/).
# COMPETENT_TALK=1 is exported for BOTH legs (both are talk legs);
# the only difference from the mech step script is the instrument
# (transcript, not Game.say) and the corpus/step names.
#
# Usage: bash scripts/talktranscript-step.sh <commit> <step-id>
#   <commit>  full or short sha to test (203a32775, or
#             transplant-15a-narrowed-subject)
#   <step-id> t-talktranscript-base | t-talktranscript-subj
#
# What it does, in order:
#   1. Refuses if any TRACKED file is dirty (untracked step corpora
#      from earlier steps are fine).
#   2. Checks out <commit> detached.
#   3. Restores tooling scratch from branch sim-talktranscript-a
#      (talktranscript driver + analyzer + instrument, vetfirst
#      instrument, masterregress analyzer — none of these exist in
#      the old trees, and the talktranscript tooling is not on master).
#   4. Swaps in the fix standing.js (sha f8fda429...), verifies the
#      ROSTER CHECK marker + exact sha.
#   5. Runs the talktranscript driver (8 seeds, 150d, competent
#      own-policy; COMPETENT_TALK=1 on both talk legs) and the
#      analyzer; logs to
#      evidence/2026-11-14/talktranscript-<step>-driver.log.
#   6. Restores the commit's native standing.js byte-identical
#      (sha-verified), deletes the tooling scratch, verifies the
#      tracked tree is clean again.
#   7. Prints the step classification (survived + instrument verdict).
#
# It never commits anything. On ANY failure it restores standing.js +
# deletes scratch before exiting non-zero.
set -u
BRANCH="sim-talktranscript-a"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="190457,190458,190459,190460,190461,190462,190463,190464"

if [ "$#" -ne 2 ]; then
  echo "TALKTRANSCRIPT STEP STOP: usage: bash scripts/talktranscript-step.sh <commit> <step-id>" >&2
  exit 2
fi
COMMIT="$1"
STEP="$2"
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

restore() {
  # Restore native standing.js for $COMMIT (exact bytes) and remove
  # tooling scratch. On old trees the scratch files do not exist in
  # the commit (plain rm is correct); on newer trees (e.g. master
  # tip) vetfirst-instrument / masterregress-analyze ARE tracked, so
  # restore them from the commit instead of deleting them — the
  # kind leg failed its final clean check on exactly this (2026-11-14:
  # D scripts/masterregress-analyze-20261113.js +
  # D scripts/vetfirst-instrument-20261111.js). Never fails the run
  # further — best effort, then the caller verifies.
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  for f in scripts/talktranscript-driver-20261114.js scripts/talktranscript-analyze-20261114.js scripts/talktranscript-instrument-20261114.js scripts/vetfirst-instrument-20261111.js scripts/masterregress-analyze-20261113.js; do
    if [ -n "${COMMIT:-}" ] && git cat-file -e "$COMMIT:$f" 2>/dev/null; then
      git show "$COMMIT:$f" > "$f" 2>/dev/null || true
    else
      rm -f "$f"
    fi
  done
}
fail() {
  echo "TALKTRANSCRIPT STEP FAIL ($STEP @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "TALKTRANSCRIPT STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

# 1. Tracked tree must be clean (untracked corpora are fine).
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "TALKTRANSCRIPT STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi

# 2. Check out the step commit (detached).
git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
HEAD12="$(git rev-parse HEAD | cut -c1-12)"
echo "step $STEP: HEAD $HEAD12 ($(git log -1 --format=%s HEAD | cut -c1-100))"

# 3. Tooling scratch from the arm branch (these files do not exist in old trees).
for f in scripts/talktranscript-driver-20261114.js scripts/talktranscript-analyze-20261114.js scripts/talktranscript-instrument-20261114.js scripts/vetfirst-instrument-20261111.js scripts/masterregress-analyze-20261113.js; do
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
LOG="evidence/2026-11-14/talktranscript-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
# COMPETENT_TALK=1 on BOTH legs (both are talk legs — held
# conversations, up to 2/day, 5 turns).
echo "step $STEP: COMPETENT_TALK=1 (held conversations)"
env COMPETENT_TALK=1 LEG=talktranscript STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN=talktranscript-pilot node scripts/talktranscript-driver-20261114.js > "$LOG" 2>&1 || fail "talktranscript driver failed (see $LOG)"
STEP="$STEP" node scripts/talktranscript-analyze-20261114.js >> "$LOG" 2>&1
ANALYZER_RC=$?
SUMMARY="evidence/2026-11-14/talktranscript-$STEP-summary.json"
[ -f "$SUMMARY" ] || fail "analyzer wrote no summary $SUMMARY (see $LOG)"
if [ "$ANALYZER_RC" -ne 0 ]; then
  echo "step $STEP: WARNING analyzer exited $ANALYZER_RC (instrument errors, validity failure, or unclassifiable read — see $LOG)" >&2
fi

# 6. Restore native standing.js byte-identical; delete scratch; verify.
restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "TALKTRANSCRIPT STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

# 7. Classification from the summary.
node -e "
const s = require('./$SUMMARY');
console.log('step $STEP: ' + s.verdict + ' (survived ' + s.survived + '/8, median ' + s.wall.medianDays + 'd, errors ' + s.instrumentErrors + ', opens ' + s.convo.opens + ', aligned ' + (s.convo.alignedShare == null ? 'null' : (s.convo.alignedShare*100).toFixed(1) + '%') + ')');
"
