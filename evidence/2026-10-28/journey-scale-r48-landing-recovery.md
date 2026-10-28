# journey-scale r48 — landing recovery (2026-10-28, lane A successor run)

**What this note is:** the r48 run itself (evidence/2026-10-28/journey-scale-r48.md)
was complete and its verdicts stand unchanged. Only its landing was blocked by
the container EPERM write flap at closeout (12:05Z). This successor run, which
read rotation 3 again, did the recovery the r48 note prescribed instead of
playing a new leg — the registered dirty `journey-scale` tree was the tripwire,
and deleting it would have destroyed the uncommitted r48 evidence.

**Recovery checks, all passed before committing:**
- `docs/ONTOLOGY.md`: `git hash-object` == `git rev-parse HEAD:docs/ONTOLOGY.md`
  (8cafd691ac714ee81a28935e6a301115780de54f) — the r48 rm+ln restore held.
- `git diff --stat -- src/js/` empty — zero game-code change in this commit,
  as r48 promised.
- `node --check` clean on all three new scripts (r48 driver, r48 compare,
  r48abl driver).
- Main-tree preflight via `GIT_OPTIONAL_LOCKS=0 git status` (plain `git status`
  still fails on the flap's index-lock write): clean. Disk 19%.
- Worktree stray `probe-r48.tmp` (untracked, left by r48) removed before
  committing; it is not in this commit.
- Base moved during r48's block: master 5ddd06a84 → a55b293ca
  (sim-fullseat-stage-a, docs/TABLE.md + evidence + one test script, zero
  src/js). The branch was therefore rebased onto a55b293ca before merging,
  per the loop's step 8, and the commit contents re-verified with
  `git show --stat` after the rebase. No behavior re-proof is needed: the
  rebase base change touches no src/js.

**Landing:** safe-commit in the worktree, `git merge --ff-only journey-scale`
in the main tree, worktree released and removed, branch deleted, main tree
verified clean, rotation-a written 3→0, lock deleted. Merged locally,
pending ship — no version bump, no push, no live verification (ship loop owns
those).

**Verdicts carried forward (r48, unchanged):** SCALE-PARITY-R48 diverged on
85001 (proven w4tbkill world-HP cause, ablation restores r47 byte-for-byte)
and full parity on 85003; arena chain 13 deaths on both bases with a worse
tail on 85001 (village dies out day 111, not day 117); table approach still
voiced and priced at the lesser seat, arc 4, on both seeds; full seat still
unreached on this band (w5 0 both seeds); people-sense GO (Daniyar day-90
talk read in full).
