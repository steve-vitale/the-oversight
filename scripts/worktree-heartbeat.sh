#!/bin/bash
# worktree-heartbeat.sh — mark a registered worktree as still alive.
# Usage: bash scripts/worktree-heartbeat.sh <slug>
# Workers/coordinators should heartbeat at least every 30 min while active.
#
# REGISTRY SAFETY (2026-10-30): the registry is NEVER rewritten in place.
# Every save goes to a temp file in the same directory (fsynced) and is then
# os.replace()d onto the live file, so a writer killed mid-save (or hit by a
# write refusal) leaves the old registry intact. A missing, empty, or corrupt
# registry is a loud failure, never a silent fresh start.
set -u
WTBASE=~/workspace/worktrees
REG="$WTBASE/REGISTRY.json"
LOCK="$WTBASE/REGISTRY.lock"
slug="${1:?usage: worktree-heartbeat.sh <slug>}"

exec 200>"$LOCK"
# FLOCK TIMEOUT (journey-landing r151 2026-11-21): a bare `flock -x` blocks
# indefinitely on a held registry lock — r149's beat hung ~19 min silently
# behind live sibling registrations. Bound the wait: fail loud after
# FLOCK_TIMEOUT seconds (default 120; HEARTBEAT_FLOCK_TIMEOUT overrides,
# used by the proof test) so the caller retries instead of hanging. The
# 15-minute staleness threshold leaves room for several retries.
FLOCK_TIMEOUT="${HEARTBEAT_FLOCK_TIMEOUT:-120}"
if ! flock -w "$FLOCK_TIMEOUT" -x 200; then
  echo "FAIL: registry lock held > ${FLOCK_TIMEOUT}s — heartbeat skipped, retry later" >&2
  exit 1
fi
python3 - "$slug" "$REG" <<'EOF'
import json, os, sys, datetime
slug, reg = sys.argv[1:3]

def atomic_write_json(reg, data):
    tmp = reg + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, reg)

def load_registry(reg, what):
    try:
        with open(reg) as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"FAIL: registry missing: {reg} — {what}", file=sys.stderr); sys.exit(1)
    except json.JSONDecodeError:
        print(f"FAIL: registry unreadable (empty or corrupt): {reg} — {what}", file=sys.stderr); sys.exit(1)
    except OSError as e:
        print(f"FAIL: cannot read registry {reg}: {e} — {what}", file=sys.stderr); sys.exit(1)
    if not isinstance(data, dict) or not isinstance(data.get("trees"), list):
        print(f"FAIL: registry malformed (no trees list): {reg} — {what}", file=sys.stderr); sys.exit(1)
    return data

data = load_registry(reg, "cannot heartbeat until the registry is rebuilt")
for t in data["trees"]:
    if t["slug"] == slug:
        t["heartbeat_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
        atomic_write_json(reg, data)
        print(f"heartbeat {slug}")
        sys.exit(0)
print(f"FAIL: slug '{slug}' not registered", file=sys.stderr); sys.exit(1)
EOF
rc=$?
flock -u 200
exit $rc
