# Journey succession r67 — landing recovery note (2026-10-29, lane B)

This addendum records the landing path only; the run's verdicts live in
evidence/2026-10-29/journey-succession-r67.md and are unchanged by it.

1. First landing attempt: master had moved under the branch (sibling
   sim-departlag-a landing, b2f40994e). The branch was rebased onto it
   (2ac6f0d9 → 4f251f7c7), proof re-run green, worktree clean.
2. Second landing attempt: while the rebase ran, master moved again —
   twice (5d7965c96, then journey-scale r52 6c8bca856). `git merge
   --ff-only journey2-succession` in the main tree correctly REFUSED
   (not fast-forward). No force, no conflict, nothing merged.
3. Ordering slip (owned here): worktree-release.sh was run BEFORE the
   merge result was checked, and the worktree was removed while the
   branch was still unmerged. No work was lost: the branch
   (4f251f7c7) stayed intact, the registry entry was gone (release
   purges it), and the main tree stayed clean throughout.
4. Recovery: the same slug was re-registered — the register script's
   existing-branch fallback re-attached the fresh worktree to
   4f251f7c7 — then rebased onto 6c8bca856 (→ 84a1cb0d2), proof re-run
   green, proof scratch deleted, and merged with --ff-only.
5. Safe-commit index-clobber sighting (4th in this repo's lessons):
   after the first safe-commit, the worktree index showed all 63
   committed files as staged deletions (worktree files byte-identical
   to HEAD). Repaired with `git update-index --add --cacheinfo` per
   file from HEAD blobs; verified with status empty + diff HEAD empty
   + hash-object matches before rebasing. The commit itself was always
   correct.

Final state: merged locally, pending ship (the batch ship loop owns
bumps, pushes, and live verification). No version tag from this run.
