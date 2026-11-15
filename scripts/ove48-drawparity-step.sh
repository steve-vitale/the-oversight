#!/usr/bin/env bash
# ove48-drawparity-step.sh — run ONE OVE-48 RNG-draw-parity step (one leg
# of the drawparity run) on a detached checkout, with the fix-swap +
# restore discipline from the bisect prereg (evidence/2026-11-13/
# sim-culpritbisect-a-prereg.md). Modeled on scripts/ove48-mech-step.sh;
# the differences are pre-registered in
# evidence/2026-11-14/sim-ove48-drawparity-prereg.md (band-3 seeds,
# tooling restored from branch sim-ove48-drawparity-a because it is not
# on master, corpus under evidence/2026-11-14/). Competent verbatim on
# every leg (COMPETENT_TALK NOT set).
#
# Usage: bash scripts/ove48-drawparity-step.sh <commit> <step-id> [seeds]
#   <commit>  full or short sha to test (203a32775, or
#             transplant-15a-narrowed-subject)
#   <step-id> t-ove48-drawparity-base | t-ove48-drawparity-subj |
#             t-ove48-drawparity-base-r2 | t-ove48-drawparity-subj-r2
#   [seeds]   comma list; default 190457..190464 (r2 steps default
#             190457,190464)
#
# What it does, in order:
#   1. Refuses if any TRACKED file is dirty (untracked step corpora
#      from earlier steps are fine).
#   2. Checks out <commit> detached.
#   3. Restores tooling scratch from branch sim-ove48-drawparity-a
#      (drawparity driver + analyzer + instrument, vetfirst
#      instrument — none of these exist in the old trees).
#   4. Swaps in the fix standing.js (sha f8fda429...), verifies the
#      ROSTER CHECK marker + exact sha.
#   5. Runs the drawparity driver (8 seeds, 150d, competent
#      own-policy) and, if BOTH leg corpora now exist, the compare
#      analyzer; logs to
#      evidence/2026-11-14/ove48-drawparity-<step>-driver.log.
#   6. Restores the commit's native standing.js byte-identical
#      (sha-verified), deletes the tooling scratch, verifies the
#      tracked tree is clean again.
#   7. Prints the step's per-leg draw totals.
#
# It never commits anything. On ANY failure it restores standing.js +
# deletes scratch before exiting non-zero. Run from a /tmp copy with
# REPO set to the worktree (the checkout would unlink the running
# script itself otherwise).
set -u
BRANCH="sim-ove48-drawparity-a"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS_DEFAULT="190457,190458,190459,190460,190461,190462,190463,190464"

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "OVE48DRAWPARTY STEP STOP: usage: bash scripts/ove48-drawparity-step.sh <commit> <step-id> [seeds]" >&2
  exit 2
fi
COMMIT="$1"
STEP="$2"
case "$STEP" in
  t-ove48-drawparity-base-r2|t-ove48-drawparity-subj-r2) SEEDS="${3:-190457,190464}" ;;
  *) SEEDS="${3:-$SEEDS_DEFAULT}" ;;
esac
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

restore() {
  # Restore native standing.js for $COMMIT (exact bytes) and remove
  # tooling scratch. On old trees the scratch files do not exist in
  # the commit (plain rm is correct); on newer trees (e.g. master
  # tip) vetfirst-instrument IS tracked, so restore it from the
  # commit instead of deleting it — the kind leg failed its final
  # clean check on exactly this (2026-11-14). Never fails the run
  # further — best effort, then the caller verifies.
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  for f in scripts/ove48-drawparity-driver-20261114.js scripts/ove48-drawparity-analyze-20261114.js scripts/ove48-drawparity-instrument-20261114.js scripts/vetfirst-instrument-20261111.js; do
    if [ -n "${COMMIT:-}" ] && git cat-file -e "$COMMIT:$f" 2>/dev/null; then
      git show "$COMMIT:$f" > "$f" 2>/dev/null || true
    else
      rm -f "$f"
    fi
  done
}
fail() {
  echo "OVE48DRAWPARTY STEP FAIL ($STEP @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "OVE48DRAWPARTY STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

# 1. Tracked tree must be clean (untracked corpora are fine).
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "OVE48DRAWPARTY STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi

# 2. Check out the step commit (detached).
git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
HEAD12="$(git rev-parse HEAD | cut -c1-12)"
echo "step $STEP: HEAD $HEAD12 ($(git log -1 --format=%s HEAD | cut -c1-100))"

# 3. Tooling scratch from the arm branch (these files do not exist in old trees).
for f in scripts/ove48-drawparity-driver-20261114.js scripts/ove48-drawparity-analyze-20261114.js scripts/ove48-drawparity-instrument-20261114.js scripts/vetfirst-instrument-20261111.js; do
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

# 5. Driver + (when both legs exist) compare analyzer. The log captures
# both. (The dated evidence dir does not exist at old commits — create
# it first, or the shell redirect itself fails before node starts.)
LOG="evidence/2026-11-14/ove48-drawparity-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
echo "step $STEP: verbatim walk-out policy (COMPETENT_TALK not set)"
env LEG=drawparity STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN=drawparity-pilot node scripts/ove48-drawparity-driver-20261114.js > "$LOG" 2>&1 || fail "drawparity driver failed (see $LOG)"
BASE_DIR="evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-base"
SUBJ_DIR="evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-subj"
if [ -d "$BASE_DIR" ] && [ -d "$SUBJ_DIR" ]; then
  R2_ARGS=""
  if [ -d "evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-base-r2" ] && [ -d "evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-subj-r2" ]; then
    R2_ARGS="--baseR2 evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-base-r2 --subjR2 evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-subj-r2"
  fi
  # shellcheck disable=SC2086
  node scripts/ove48-drawparity-analyze-20261114.js --base "$BASE_DIR" --subj "$SUBJ_DIR" $R2_ARGS --out evidence/2026-11-14/ove48-drawparity-comparison.json >> "$LOG" 2>&1
  echo "step $STEP: compare analyzer ran (see $LOG tail + evidence/2026-11-14/ove48-drawparity-comparison.json)"
else
  echo "step $STEP: compare pending — other leg corpus not present yet"
fi

# 6. Restore native standing.js byte-identical; delete scratch; verify.
restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "OVE48DRAWPARTY STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

# 7. Per-leg draw totals from this step's corpus.
node -e "
const fs = require('fs'), path = require('path');
const dir = 'evidence/2026-11-14/perseed-ove48-drawparity-$STEP';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
let total = 0, days = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  total += (d.draws && d.draws.totalDraws) || 0;
  days.push(d.days);
}
console.log('step $STEP: ' + files.length + ' seeds, total draws ' + total + ', days [' + days.join(',') + ']');
"
