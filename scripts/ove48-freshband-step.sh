#!/usr/bin/env bash
# ove48-freshband-step.sh — run ONE OVE-48 fresh-band step (one leg of
# the fresh-band survival re-test) on a detached checkout, with the
# fix-swap + restore discipline from the bisect prereg
# (evidence/2026-11-13/sim-culpritbisect-a-prereg.md). Adapted from
# scripts/ove48-conv-step.sh; the differences are pre-registered in
# evidence/2026-11-14/sim-ove48-freshband-prereg.md (fresh band
# 190561–190568, fresh STEP ids, RUN ove48-freshband-pilot, scratch
# analyzer patch for the band + V5-not-applicable).
#
# Usage: bash scripts/ove48-freshband-step.sh <commit> <step-id>
#   <commit>  full or short sha to test (203a32775, or
#             transplant-15a-narrowed-subject)
#   <step-id> t-ove48-freshband-base | t-ove48-freshband-subj
#
# What it does, in order:
#   1. Refuses if any TRACKED file is dirty (untracked step corpora
#      from earlier steps are fine).
#   2. Checks out <commit> detached.
#   3. Restores tooling scratch from branch sim-ove48-freshband-a
#      (ove48-conv driver + analyzer + instrument, vetfirst
#      instrument, masterregress analyzer — none of these exist in
#      the old trees).
#   4. Swaps in the fix standing.js (sha f8fda429...), verifies the
#      ROSTER CHECK marker + exact sha.
#   5. Runs the ove48-conv driver (8 fresh-band seeds, 150d,
#      competent verbatim, RUN ove48-freshband-pilot) and the
#      SCRATCH-PATCHED analyzer; logs to
#      evidence/2026-11-14/ove48-conv-<step>-driver.log.
#   6. Restores the commit's native standing.js byte-identical
#      (sha-verified), deletes the tooling scratch, verifies the
#      tracked tree is clean again.
#   7. Prints the step classification (survived + instrument verdict).
#
# It never commits anything. On ANY failure it restores standing.js +
# deletes scratch before exiting non-zero.
set -u
BRANCH="sim-ove48-freshband-a"
FIX_SHA="f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078"
SEEDS="190561,190562,190563,190564,190565,190566,190567,190568"
RUN="ove48-freshband-pilot"

if [ "$#" -ne 2 ]; then
  echo "OVE48FRESHBAND STEP STOP: usage: bash scripts/ove48-freshband-step.sh <commit> <step-id>" >&2
  exit 2
fi
COMMIT="$1"
STEP="$2"
# REPO may be passed in (run the script from a /tmp copy so the
# detached checkout cannot unlink the running script itself).
REPO="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || exit 2

SCRATCH="scripts/ove48-conv-driver-20261114.js scripts/ove48-conv-analyze-20261114.js scripts/ove48-conv-instrument-20261114.js scripts/vetfirst-instrument-20261111.js scripts/masterregress-analyze-20261113.js"

restore() {
  # Restore native standing.js for $COMMIT (exact bytes) and remove
  # tooling scratch. A scratch file that is TRACKED at the step
  # commit is restored from HEAD instead of deleted (mech-a lesson:
  # on newer trees vetfirst/masterregress are tracked files).
  if [ -n "${COMMIT:-}" ]; then
    git show "$COMMIT:src/js/standing.js" > src/js/standing.js 2>/dev/null || true
  fi
  for f in $SCRATCH; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      git checkout -- "$f" 2>/dev/null || true
    else
      rm -f "$f"
    fi
  done
}
fail() {
  echo "OVE48FRESHBAND STEP FAIL ($STEP @ $COMMIT): $1" >&2
  restore
  if [ -n "${NATIVE_SHA:-}" ]; then
    NOW_SHA="$(sha256sum src/js/standing.js 2>/dev/null | cut -d' ' -f1)"
    if [ "$NOW_SHA" != "$NATIVE_SHA" ]; then
      echo "OVE48FRESHBAND STEP FAIL: standing.js restore mismatch (have ${NOW_SHA:-?}, want $NATIVE_SHA) — DO NOT COMMIT EVIDENCE" >&2
    fi
  fi
  exit 1
}

# 1. Tracked tree must be clean (untracked corpora are fine).
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "OVE48FRESHBAND STEP STOP: tracked tree dirty — refusing to check out $COMMIT" >&2
  git status --porcelain --untracked-files=no >&2
  exit 2
fi

# 2. Check out the step commit (detached).
git checkout --quiet "$COMMIT" 2>/dev/null || fail "cannot check out $COMMIT"
HEAD12="$(git rev-parse HEAD | cut -c1-12)"
echo "step $STEP: HEAD $HEAD12 ($(git log -1 --format=%s HEAD | cut -c1-100))"

# 3. Tooling scratch from the arm branch (these files do not exist in old trees).
for f in $SCRATCH; do
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

# 5. Driver. The log captures driver + analyzer. (The dated evidence
# dir does not exist at old commits — create it first, or the
# shell redirect itself fails before node starts.)
LOG="evidence/2026-11-14/ove48-conv-$STEP-driver.log"
mkdir -p "$(dirname "$LOG")"
LEG=ove48conv STEP="$STEP" DAYS=150 SEEDS="$SEEDS" RUN="$RUN" node scripts/ove48-conv-driver-20261114.js > "$LOG" 2>&1 || fail "ove48-conv driver failed (see $LOG)"

# 5b. Analyzer, SCRATCH-PATCHED (pre-registered adaptation — the repo
# analyzer hardcodes the band-3 band, RUN ove48-conv-pilot, the
# t-ove48-conv-* step ids, and a V5 replication that requires a
# band-3 mapping). The patch is exactly five replacements, each
# asserted to occur exactly once; the diff vs the branch copy is
# printed to the log for audit. The repo analyzer is NOT modified.
node -e "
const fs = require('fs');
const f = 'scripts/ove48-conv-analyze-20261114.js';
let s = fs.readFileSync(f, 'utf8');
function once(before, after) {
  const n = s.split(before).length - 1;
  if (n !== 1) { console.error('ANALYZER PATCH FAIL: expected exactly 1 occurrence of ' + JSON.stringify(before.slice(0, 60)) + ', found ' + n); process.exit(1); }
  s = s.replace(before, after);
}
once('const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];', 'const SEEDS = [190561, 190562, 190563, 190564, 190565, 190566, 190567, 190568];');
once(\"const RUN = 'ove48-conv-pilot';\", \"const RUN = 'ove48-freshband-pilot';\");
once(\"const isSubj = step === 't-ove48-conv-subj';\", \"const isSubj = step === 't-ove48-freshband-subj';\");
once(\"const isBase = step === 't-ove48-conv-base';\", \"const isBase = step === 't-ove48-freshband-base';\");
once(\"if (!b3) { out.mismatches.push('no band-3 mapping for step ' + step); return out; }\", \"if (!b3) { return out; } // fresh band: V5 does not apply (no band-3 counterpart on fresh seeds); band3Step stays null\");
fs.writeFileSync(f, s);
console.log('analyzer scratch patched (SEEDS + RUN + step ids + V5-not-applicable)');
" >> "$LOG" 2>&1 || fail "analyzer scratch patch failed (see $LOG)"
diff <(git show "$BRANCH:scripts/ove48-conv-analyze-20261114.js") scripts/ove48-conv-analyze-20261114.js >> "$LOG" 2>&1 || true
STEP="$STEP" node scripts/ove48-conv-analyze-20261114.js >> "$LOG" 2>&1
ANALYZER_RC=$?
SUMMARY="evidence/2026-11-14/ove48-conv-$STEP-summary.json"
[ -f "$SUMMARY" ] || fail "analyzer wrote no summary $SUMMARY (see $LOG)"
if [ "$ANALYZER_RC" -ne 0 ]; then
  echo "step $STEP: WARNING analyzer exited $ANALYZER_RC (instrument errors, validity failure, or unclassifiable read — see $LOG)" >&2
fi

# 6. Restore native standing.js byte-identical; delete scratch; verify.
restore
NOW_SHA="$(sha256sum src/js/standing.js | cut -d' ' -f1)"
[ "$NOW_SHA" = "$NATIVE_SHA" ] || fail "standing.js restore mismatch (have ${NOW_SHA:0:12}, want ${NATIVE_SHA:0:12})"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "OVE48FRESHBAND STEP FAIL: tracked tree dirty after restore:" >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

# 7. Classification from the summary.
node -e "
const s = require('./$SUMMARY');
console.log('step $STEP: ' + s.verdict + ' (survived ' + s.survived + '/8, median ' + s.wall.medianDays + 'd, errors ' + s.instrumentErrors + ', opens ' + s.convo.opens + ', aligned ' + (s.convo.alignedShare == null ? 'null' : (s.convo.alignedShare*100).toFixed(1) + '%') + ')');
"
