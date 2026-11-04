#!/usr/bin/env python3
"""Toggle-b variant constructor (Loop B, 2026-11-04).

Revert-from-current, never forward-apply: base = current master at
registration (arm 2, commit d8f334da8, fully ON). Each variant reverts
ONLY its sub-lever's hunks from that commit:

  sigoff    SIGDMG    — every sigW4.js hunk in d8f334da8
  gearoff   GEAR      — fieldFights.js ally gear parity (allyGear fn +
                        both call sites, ally strike formula, ally armor)
  moraleoff MORALE    — fieldFights.js party morale (rtd party-HP-pool)
  trickoff  TRICKHOLD — fieldFights.js known-trick hold only
                        (pre-existing trickLog hold is NOT arm 2)
  alloff              — all four (control)

The header-comment hunk (@@ -17) carries one GEAR line and one MORALE
line; those two lines are deleted individually (comments only, no
behavior). Every other hunk is classified by its added lines and
reverted with `git apply -R` on the exact commit diff subset, so a
hunk that does not revert cleanly fails loudly instead of being
hand-edited (DRIFT-BLOCKED per the brief).

Usage (from the worktree root):
  python3 scripts/apply-toggle-variant-20261104.py <sigoff|gearoff|moraleoff|trickoff|alloff>
  python3 scripts/apply-toggle-variant-20261104.py restore   # git checkout -- src/js/
  python3 scripts/apply-toggle-variant-20261104.py verify-alloff  # after alloff: files must equal d8f334da8^ blobs

Variant game code is NEVER committed; restore before finishing.
"""
import subprocess
import sys

COMMIT = "d8f334da8"
FILES = ["src/js/fieldFights.js", "src/js/sigW4.js"]
GEAR_COMMENT = "//   - ally gear parity (code: fieldFight, WINFIELD-DMG 2026-11-03): the ally re-equips at join and strikes with their own weapon on the same tactical formula, and their own armor absorbs hits on them on the same curve — the old flat [3,6] ally strike and unarmored ally body made every party solo in practice."
MORALE_COMMENT = "//   - party morale (code: fieldFight, WINFIELD-DMG 2026-11-03): with a live ally standing, hopeless/winning compare party HP pool vs total incoming, not the leader alone. Solo fights are unchanged."


def run(args, input_text=None, check=True):
    p = subprocess.run(args, input=input_text, capture_output=True, text=True)
    if check and p.returncode != 0:
        raise SystemExit("FAILED: %s\n%s%s" % (" ".join(args), p.stdout, p.stderr))
    return p


def classify_hunk(header, body):
    """Return lever name for one diff hunk, or None for the header hunk."""
    if "src/js/sigW4.js" in header:
        return "sigoff"
    added = [ln[1:] for ln in body.splitlines() if ln.startswith("+") and not ln.startswith("+++")]
    text = "\n".join(added)
    if "ally gear parity" in text or "party morale" in text:
        return None  # header-comment hunk: handled line by line
    if any(m in text for m in ("allyGear", "allyWb", "allyArmor", "allyStrikeMult", "absorbedA", "their own armor")):
        return "gearoff"
    if "_allyTakenLive" in text:
        return "moraleoff"
    if "they know how this one is fought" in text:
        return "trickoff"
    raise SystemExit("UNMAPPED HUNK (brief: STOP, do not improvise):\n%s\n%s" % (header, body))


def build_patches():
    diff = run(["git", "show", COMMIT, "--"] + FILES).stdout
    patches = {"sigoff": [], "gearoff": [], "moraleoff": [], "trickoff": []}
    cur_file = None
    cur_hunk_head = None
    cur_hunk = []
    file_head = {}

    def flush():
        if cur_hunk_head is None:
            return
        # git apply ends a hunk at a bare empty line; git's own diff
        # emits empty context lines bare, so re-space them.
        body = [ln if ln != "" else " " for ln in cur_hunk]
        lever = classify_hunk(cur_file, "\n".join(body))
        if lever:
            patches[lever].append(cur_hunk_head + "\n" + "\n".join(body))

    for line in diff.splitlines():
        if line.startswith("diff --git"):
            flush()
            cur_file = line
            cur_hunk_head = None
            cur_hunk = []
            file_head[line] = line
        elif line.startswith("@@"):
            flush()
            cur_hunk_head = line
            cur_hunk = []
        elif cur_hunk_head is not None:
            cur_hunk.append(line)
        elif line.startswith("--- ") or line.startswith("+++ "):
            pass
    flush()
    # Rebuild full patch text per lever: diff header lines for its files.
    out = {}
    for lever, hunks in patches.items():
        if not hunks:
            raise SystemExit("EMPTY lever patch: %s (commit drift?)" % lever)
        # Collect per-file headers from the original diff.
        parts = []
        # headers: 'diff --git a/... b/...' + 'index ...' + '--- a/...' + '+++ b/...'
        segs = {}
        cur = None
        for line in diff.splitlines():
            if line.startswith("diff --git"):
                cur = line
                segs[cur] = [line]
            elif cur is not None and (line.startswith("index ") or line.startswith("--- ") or line.startswith("+++ ")):
                segs[cur].append(line)
        # Attach each hunk to its file's header by matching the hunk's
        # position: hunks were recorded in diff order; headers in order.
        # Simpler: include ALL file headers, git apply tolerates hunks
        # only for files present; a header with no hunks is skipped by
        # git apply only if no hunk follows it — so build per-file groups.
        # Group hunks by file via the @@ context is not stored, so instead
        # re-derive: sigW4 hunks belong to sigW4 header, fieldFights to
        # fieldFights header, using the hunk's added-line markers.
        by_file = {}
        for h in hunks:
            # sigoff hunks are all sigW4; others are fieldFights.
            key = "sigW4" if lever == "sigoff" else "fieldFights"
            by_file.setdefault(key, []).append(h)
        for key, hs in by_file.items():
            hdr = [v for k, v in segs.items() if key in k]
            if not hdr:
                raise SystemExit("no file header for %s" % key)
            parts.append("\n".join(hdr[0]) + "\n" + "\n".join(hs))
        out[lever] = "\n".join(parts) + "\n"
    return out


def delete_comment_line(path, line):
    with open(path) as f:
        lines = f.read().splitlines(keepends=True)
    hits = [i for i, ln in enumerate(lines) if ln.rstrip("\n") == line]
    if len(hits) != 1:
        raise SystemExit("comment line found %d times in %s (expected 1)" % (len(hits), path))
    del lines[hits[0]]
    with open(path, "w") as f:
        f.writelines(lines)


def check_clean():
    p = run(["git", "diff", "--quiet", "--", "src/js/"], check=False)
    if p.returncode != 0:
        raise SystemExit("src/js/ is dirty vs HEAD — restore first, refusing to apply on top of edits")


def apply_variant(name):
    check_clean()
    patches = build_patches()
    levers = ["sigoff", "gearoff", "moraleoff", "trickoff"] if name == "alloff" else [name]
    for lever in levers:
        run(["git", "apply", "-R"], input_text=patches[lever])
        print("reverted %s (%d hunks)" % (lever, patches[lever].count("@@ ")))
    ff = "src/js/fieldFights.js"
    if name in ("gearoff", "alloff"):
        delete_comment_line(ff, GEAR_COMMENT)
        print("deleted GEAR header comment line")
    if name in ("moraleoff", "alloff"):
        delete_comment_line(ff, MORALE_COMMENT)
        print("deleted MORALE header comment line")
    print("variant %s applied; verify with: git diff --stat" % name)


def verify_alloff():
    p = run(["git", "diff", COMMIT + "^", "--"] + FILES, check=False)
    if p.stdout.strip():
        raise SystemExit("ALLOFF MISMATCH vs pre-arm2 blobs:\n%s" % p.stdout[:3000])
    print("ALLOFF VERIFIED: src/js/fieldFights.js + src/js/sigW4.js byte-equal to d8f334da8^")


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    cmd = sys.argv[1]
    if cmd == "restore":
        run(["git", "checkout", "--", "src/js/"])
        print("src/js/ restored to HEAD")
    elif cmd == "verify-alloff":
        verify_alloff()
    elif cmd in ("sigoff", "gearoff", "moraleoff", "trickoff", "alloff"):
        apply_variant(cmd)
    else:
        raise SystemExit("unknown command: %s" % cmd)


if __name__ == "__main__":
    main()
