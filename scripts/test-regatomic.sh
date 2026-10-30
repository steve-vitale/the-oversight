#!/bin/bash
# test-regatomic.sh — prove atomic registry writes + clean load failures.
# Usage: bash scripts/test-regatomic.sh [script-dir]
#
# Runs the four worktree scripts with HOME pointed at a scratch directory, so
# every registry/worktree write lands under scratch — never under ~/workspace
# and never in the repo. Nothing here writes into the repo.
#
# Checks:
#   (a) a normal register/heartbeat/release/reap cycle works;
#   (b) a partial temp file (the corpse of a writer killed mid-save) leaves
#       the live registry parsing with its old entries intact, and no script
#       ever opens the live registry for writing (structural grep);
#   (c) a missing, empty, or corrupt registry makes every script fail with a
#       single clear line, a nonzero exit, no traceback — and the file is NOT
#       recreated or repaired behind the caller's back.
# Exit 0 only if every check passes.
set -u
SCRIPT_DIR="${1:-$(cd "$(dirname "$0")" && pwd)}"
SCRATCH="$(mktemp -d /tmp/regatomic-test.XXXXXX)"
trap 'rm -rf "$SCRATCH"' EXIT
export HOME="$SCRATCH"
FAIL=0
say() { printf '%s\n' "[$1] $2"; }
ok()   { if [ "$2" = 0 ]; then say PASS "$1"; else say FAIL "$1"; FAIL=1; fi; }
want_contains() { # want_contains <label> <haystack> <needle>
  if printf '%s' "$2" | grep -qF "$3"; then say PASS "$1"; else say FAIL "$1 (missing: $3)"; FAIL=1; fi
}
want_not_contains() { # want_not_contains <label> <haystack> <needle>
  if printf '%s' "$2" | grep -qF "$3"; then say FAIL "$1 (found forbidden: $3)"; FAIL=1; else say PASS "$1"; fi
}

# --- fixture: scratch git repo + valid empty registry (the explicit-rebuild shape)
mkdir -p "$SCRATCH/workspace/worktrees"
git init -q -b master "$SCRATCH/workspace/the-scattering"
git -C "$SCRATCH/workspace/the-scattering" config user.email test@test
git -C "$SCRATCH/workspace/the-scattering" config user.name test
echo hi > "$SCRATCH/workspace/the-scattering/README"
git -C "$SCRATCH/workspace/the-scattering" add README
git -C "$SCRATCH/workspace/the-scattering" commit -qm init
REG="$SCRATCH/workspace/worktrees/REGISTRY.json"
printf '{"cap": 16, "trees": []}' > "$REG"

# --- (a) full cycle
OUT=$(bash "$SCRIPT_DIR/worktree-register.sh" cycletest test-owner "regatomic cycle" 2>&1); RC=$?
want_contains "a/register exit+path" "$OUT" "$SCRATCH/workspace/worktrees/cycletest"
[ $RC = 0 ]; ok "a/register exit 0" $?
OUT=$(bash "$SCRIPT_DIR/worktree-heartbeat.sh" cycletest 2>&1); RC=$?
want_contains "a/heartbeat" "$OUT" "heartbeat cycletest"; [ $RC = 0 ]; ok "a/heartbeat exit 0" $?
OUT=$(bash "$SCRIPT_DIR/worktree-release.sh" cycletest merged 2>&1); RC=$?
want_contains "a/release" "$OUT" "released cycletest as done-merged"; [ $RC = 0 ]; ok "a/release exit 0" $?
OUT=$(bash "$SCRIPT_DIR/worktree-reap.sh" 2>&1); RC=$?
want_contains "a/reap removes released+merged tree" "$OUT" "removed worktree cycletest"
[ $RC = 0 ]; ok "a/reap exit 0" $?
[ -d "$SCRATCH/workspace/worktrees/cycletest" ]; [ $? != 0 ]; ok "a/worktree dir removed" $?
git -C "$SCRATCH/workspace/the-scattering" rev-parse --verify -q cycletest >/dev/null 2>&1
[ $? != 0 ]; ok "a/branch deleted" $?
python3 -c "import json; d=json.load(open('$REG')); assert d['trees']==[], d" 2>/dev/null
ok "a/registry empty after reap" $?

# --- (b) partial temp file must not touch the live registry
OUT=$(bash "$SCRIPT_DIR/worktree-register.sh" keeptest test-owner "regatomic keep" 2>&1); RC=$?
[ $RC = 0 ]; ok "b/register keeptest" $?
BEFORE=$(sha256sum "$REG" | awk '{print $1}')
printf 'garbage-partial-{"trees": [ ' > "$REG.tmp"
OUT=$(bash "$SCRIPT_DIR/worktree-heartbeat.sh" keeptest 2>&1); RC=$?
want_contains "b/heartbeat survives partial tmp" "$OUT" "heartbeat keeptest"; [ $RC = 0 ]; ok "b/heartbeat exit 0" $?
OUT=$(bash "$SCRIPT_DIR/worktree-reap.sh" --dry-run 2>&1); RC=$?
[ $RC = 0 ]; ok "b/reap dry-run exit 0" $?
AFTER=$(sha256sum "$REG" | awk '{print $1}')
[ "$BEFORE" != "$AFTER" ]; ok "b/registry rewritten by heartbeat (not left stale)" $?
python3 -c "import json; d=json.load(open('$REG')); assert [t['slug'] for t in d['trees']]==['keeptest'], d" 2>/dev/null
ok "b/old entries intact after partial tmp" $?
rm -f "$REG.tmp"
GREP_HITS=$(grep -c 'open(reg, "w")' "$SCRIPT_DIR"/worktree-register.sh "$SCRIPT_DIR"/worktree-heartbeat.sh "$SCRIPT_DIR"/worktree-release.sh "$SCRIPT_DIR"/worktree-reap.sh 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
[ "$GREP_HITS" = 0 ]; ok "b/no script opens live registry for writing (grep)" $?
for s in worktree-register.sh worktree-heartbeat.sh worktree-release.sh worktree-reap.sh; do
  grep -q "os.replace(tmp, reg)" "$SCRIPT_DIR/$s" || { say FAIL "b/$s uses os.replace"; FAIL=1; }
done
say PASS "b/all four scripts replace via tmp file"

# --- (c) missing / empty / corrupt registry: clean failure, no silent rebuild
for CASE in missing empty corrupt; do
  case "$CASE" in
    missing) rm -f "$REG" ;;
    empty)   : > "$REG" ;;
    corrupt) printf '{not json' > "$REG" ;;
  esac
  for S in "worktree-heartbeat.sh keeptest" "worktree-release.sh keeptest merged" "worktree-reap.sh" "worktree-register.sh newslug test-owner x"; do
    OUT=$(bash "$SCRIPT_DIR/$S" 2>&1); RC=$?
    [ $RC != 0 ]; ok "c/$CASE ${S%% *} nonzero exit" $?
    LINES=$(printf '%s' "$OUT" | grep -c .); [ "$LINES" = 1 ]; ok "c/$CASE ${S%% *} exactly one line" $?
    want_not_contains "c/$CASE ${S%% *} no traceback" "$OUT" "Traceback"
  done
  case "$CASE" in
    missing) [ ! -e "$REG" ]; ok "c/missing not recreated" $? ;;
    empty)   [ ! -s "$REG" ]; ok "c/empty left empty" $? ;;
    corrupt) [ "$(cat "$REG")" = "{not json" ]; ok "c/corrupt bytes untouched" $? ;;
  esac
  OUT=$(bash "$SCRIPT_DIR/worktree-reap.sh" 2>&1)
  want_contains "c/$CASE reap names file + rebuild" "$OUT" "cleanup cannot run until the registry is rebuilt"
  want_contains "c/$CASE reap names registry path" "$OUT" "$REG"
  printf '{"cap": 16, "trees": []}' > "$REG"
done
# restore a usable registry for the final cycle check
bash "$SCRIPT_DIR/worktree-register.sh" finaltest test-owner "regatomic final" >/dev/null 2>&1
[ $? = 0 ]; ok "c/scripts work again after explicit registry restore" $?

say RESULT "FAILURES=$FAIL"
exit $FAIL
