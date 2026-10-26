#!/bin/bash
 # sweep-one-stafffallback-arm.sh — run one stafffallback arm (extract + both sides)
# Usage: bash scripts/sweep-one-stafffallback-arm.sh <off|on> <seeds-csv>
 #   e.g. bash scripts/sweep-one-stafffallback-arm.sh off 9750,9751,9752,9753,9754,9755,9756,9757
# Outputs: per-seed JSONs in evidence/2026-10-25/sim-stafffallback-b-corpus/
# plus a per-side sweep summary. Runner prints progress to stdout only.
# Scratch dir is deleted after verification. NEVER extracts under /tmp,
# NEVER creates a worktree, NEVER checks out an old commit in the worktree.
# The OFF tree is a HEAD archive, unmodified (single-pick staffing). The ON
# tree is a HEAD archive with ONLY scripts/stafffallback-on.patch applied
# (the smoke-racks fallback hunk in scripts/policies/competent.js). The
# runner VERIFIES the ON tree is exactly that (see below) and FAILS LOUDLY
# otherwise — a wider diff would mean the contrast is not the fallback alone.
# VERIFICATION DESIGN (fixed pre-sweep in the preserveact run, 2026-10-25):
# (1) the patch names exactly one file (src/js/food.js) — proven by
# counting its diff headers; (2) git apply --check + git apply succeed,
# so the OFF tree is archive(HEAD) plus that patch and nothing else;
# (3) git apply --check --reverse succeeds afterwards, which proves the
# tree's food.js is exactly in the post-patch state. Together with
# (1), that proves OFF differs from ON only in food.js, without reading
# two 2.1GB trees.
set -u
ARM="$1"; SEEDS="${2:-9754}"
[ "$ARM" = "off" ] || [ "$ARM" = "on" ] || { echo "ARM must be off|on"; exit 2; }
WT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$(cd "$WT" && git rev-parse HEAD)"
CORPUS="$WT/evidence/2026-10-25/sim-stafffallback-b-corpus"
mkdir -p "$CORPUS"
RUNDIR="$WT/bisect-scratch/$ARM"
rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
(cd "$WT" && git archive HEAD | tar -x -C "$RUNDIR") || { echo "EXTRACT FAIL LOUDLY $ARM $BASE"; exit 2; }
if [ "$ARM" = "on" ]; then
  NHDR=$(grep -c "^--- " "$WT/scripts/stafffallback-on.patch" || true)
  NHDR2=$(grep -c "^+++ " "$WT/scripts/stafffallback-on.patch" || true)
  [ "$NHDR" = "1" ] && [ "$NHDR2" = "1" ] || { echo "PATCH SHAPE FAIL LOUDLY: expected 1 file header pair, got $NHDR/$NHDR2"; exit 2; }
  grep -q "^--- a/scripts/policies/competent.js" "$WT/scripts/stafffallback-on.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target scripts/policies/competent.js"; exit 2; }
  grep -q "^+++ b/scripts/policies/competent.js" "$WT/scripts/stafffallback-on.patch" || { echo "PATCH SHAPE FAIL LOUDLY: patch does not target scripts/policies/competent.js"; exit 2; }
  # PATCH TOOL (fixed 2026-10-26 after the first ON run was voided): git
  # apply from a subdirectory of a repo SILENTLY SKIPS patches whose path
  # is outside the cwd ("Skipped patch" only with --verbose; exit 0) — the
  # first ON run therefore swept UNPATCHED trees mislabeled "on" and was
  # discarded in full. patch(1) is cwd-relative and has no such rule.
  (cd "$RUNDIR" && patch --dry-run -p1 < "$WT/scripts/stafffallback-on.patch" >/dev/null && patch -p1 < "$WT/scripts/stafffallback-on.patch" >/dev/null && patch -R --dry-run -p1 < "$WT/scripts/stafffallback-on.patch" >/dev/null) || { echo "ON PATCH FAIL LOUDLY"; exit 2; }
  # CONTENT VERIFICATION (the check the old runner lacked — exit codes
  # alone proved nothing): the extracted file must carry the fallback
  # marker and must NOT carry the old single-pick line.
  grep -q "STAFFING FALLBACK" "$RUNDIR/scripts/policies/competent.js" || { echo "ON CONTENT FAIL LOUDLY: fallback marker missing from extracted tree"; exit 2; }
  grep -q "bestSkill" "$RUNDIR/scripts/policies/competent.js" && { echo "ON CONTENT FAIL LOUDLY: old single-pick code still in extracted tree"; exit 2; }
  echo "tree verified: ON differs from OFF only in scripts/policies/competent.js (patch(1) + reverse dry-run + content marker)"
fi
cp "$WT/scripts/sweep-stafffallback-b.js" "$RUNDIR/scripts/sweep-stafffallback-b.js" || { echo "DRIVER COPY FAIL $ARM"; exit 2; }
NSEEDS=$(echo "$SEEDS" | tr ',' '\n' | grep -c .)
for SIDE in pd0 pd1; do
  PDV=0; [ "$SIDE" = "pd1" ] && PDV=1
  (cd "$RUNDIR" && FEASTSCALE_R13=1 SEATDRIVE=0 ARM="$ARM" BASE="$BASE" SIDE="$SIDE" PLENTYDEPRI="$PDV" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$SEEDS" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-$ARM-$SIDE-dg1-leadfeast.json" node scripts/sweep-stafffallback-b.js) || { echo "SWEEP FAIL LOUDLY $ARM $SIDE"; exit 2; }
  N=$(ls "$CORPUS"/stafffallback-b-"$ARM"-"$SIDE"-dg1-leadfeast-s*.json 2>/dev/null | wc -l)
  echo "arm $ARM $SIDE: $N per-seed files present (this run asked for $NSEEDS seeds; cumulative count may exceed it across runs)"
done
rm -rf "$RUNDIR"
echo "arm $ARM DONE"
