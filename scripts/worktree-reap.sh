#!/bin/bash
# worktree-reap.sh — automated cleanup of dead worktrees. Safe by construction.
# Usage: bash scripts/worktree-reap.sh [--dry-run]
#
# CORE INSIGHT (Steve 2026-10-08): agents won't delete without 100% confidence,
# and that timidity is what blocks the pipeline. So separate the two operations:
#
#   REMOVE THE WORKTREE — safe whenever the tree is CLEAN (no uncommitted
#     changes). The branch and all its commits survive; nothing is lost. The
#     only thing a worktree holds that a branch doesn't is uncommitted dirt.
#
#   DELETE THE BRANCH — needs real confidence: only when fully merged to master.
#
# AUTO-REMOVE worktree when ALL hold:
#   1. `git status --short` inside the tree is EMPTY (the only hard rule —
#      uncommitted work is never auto-deleted, period)
#   2. registry status is released (done-merged/done-abandoned), OR heartbeat
#      is stale > 4h (owner run is dead or forgot it)
# On removal:
#   - branch fully merged to master  -> `git branch -d`, drop registry entry
#   - branch NOT merged               -> KEEP the branch, note it in the registry
#     (work preserved as a branch; anyone can re-checkout it)
# NEVER touches: trees with uncommitted changes (LOUD), active trees with a
# fresh heartbeat (< 4h).
#
# REGISTRY SAFETY (2026-10-30): the registry is NEVER rewritten in place.
# Every save goes to a temp file in the same directory (fsynced) and is then
# os.replace()d onto the live file, so a writer killed mid-save (or hit by a
# write refusal) leaves the old registry intact. A missing, empty, or corrupt
# registry is a loud failure — cleanup cannot run until the registry is
# rebuilt — never a silent fresh start (which would drop every live entry).
set -u
REPO=~/workspace/the-scattering
WTBASE=~/workspace/worktrees
REG="$WTBASE/REGISTRY.json"
LOCK="$WTBASE/REGISTRY.lock"
DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1
STALE_H=4

exec 200>"$LOCK"
flock -x 200
python3 - "$REPO" "$WTBASE" "$REG" "$DRY" "$STALE_H" <<'EOF'
import json, os, subprocess, sys, datetime

repo, wtbase, reg, dry, stale_h = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] == "1", float(sys.argv[5])
now = datetime.datetime.now(datetime.timezone.utc)

def sh(*args, cwd=repo):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    return r.returncode, r.stdout.strip(), r.stderr.strip()

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

data = load_registry(reg, "cleanup cannot run until the registry is rebuilt")

merged = set()
rc, out, _ = sh("git", "branch", "--merged", "master", "--format=%(refname:short)")
if rc == 0:
    merged = set(out.split())

removed, loud = [], []
for t in data["trees"]:
    slug, path, branch, status = t["slug"], t["path"], t["branch"], t.get("status", "active")
    is_merged = branch in merged
    hb = t.get("heartbeat_at", t.get("created_at", ""))
    try:
        age_h = (now - datetime.datetime.fromisoformat(hb)).total_seconds() / 3600
    except Exception:
        age_h = 9999

    if path is None:
        # Tree already removed (status tree-removed-branch-kept); branch kept as
        # a record. Finish the lifecycle: delete the branch if it has since
        # been merged to master, then drop the entry. Never crash here — a
        # None path used to abort the entire reaper before any removal ran
        # (TypeError in os.path.isdir, caught 2026-10-08).
        if is_merged:
            sh("git", "branch", "-d", branch)
            t["status"] = "gone"
            removed.append(f"branch {branch} (tree already removed) was merged — deleted.")
        else:
            note = t.get('note', '')
            if '[still unmerged; branch kept]' not in note:
                t['note'] = f"{note} [still unmerged; branch kept]".strip()
        continue
    if not os.path.isdir(path):
        t["status"] = "gone"
        continue
    rc, dirty, _ = sh("git", "status", "--short", cwd=path)
    is_clean = (rc == 0 and dirty == "")
    released = status in ("done-merged", "done-abandoned", "gone")
    stale = (status == "active" and age_h > stale_h)

    if not is_clean:
        loud.append(f"LOUD: {slug} has UNCOMMITTED changes — never auto-removing. Owner ({t.get('owner')}) must commit or release.")
        continue
    if not (released or stale):
        continue  # active with fresh heartbeat — respect it

    why = "released by owner" if released else f"heartbeat {age_h:.1f}h stale"
    # Count commits ahead of master for the report (informational only)
    rc, cnt, _ = sh("git", "rev-list", "--count", f"master..{branch}")
    ahead = cnt if rc == 0 else "?"

    if dry:
        removed.append(f"[dry-run] would remove worktree {slug} ({why}; branch {branch}: {'merged' if is_merged else f'{ahead} commits ahead, KEPT'})")
        continue

    r1 = sh("git", "worktree", "remove", "--force", path)
    if r1[0] != 0:
        loud.append(f"LOUD: failed to remove worktree {slug}: {r1[2][:200]}")
        continue
    if is_merged:
        sh("git", "branch", "-d", branch)
        t["status"] = "gone"
        removed.append(f"removed worktree {slug} ({why}); branch {branch} was merged — deleted.")
    else:
        t["status"] = "tree-removed-branch-kept"
        t["path"] = None
        t["note"] = f"worktree auto-removed {now.isoformat(timespec='seconds')} ({why}); branch kept with {ahead} commits ahead of master"
        removed.append(f"removed worktree {slug} ({why}); branch {branch} KEPT ({ahead} commits ahead of master) — no work lost.")

# Drop fully-gone entries, keep branch-kept ones as records
data["trees"] = [t for t in data["trees"] if t.get("status") != "gone"]
if not dry:
    atomic_write_json(reg, data)
sh("git", "worktree", "prune")

print("=== worktree-reap ===")
for line in removed: print(line)
for line in loud: print(line)
active = [t["slug"] for t in data["trees"] if t.get("status") == "active"]
print(f"active: {len(active)}/{data.get('cap', 6)} — {', '.join(active) or 'none'}")
if not removed and not loud:
    print("nothing to reap.")
EOF
rc=$?
flock -u 200
exit $rc
