# H1 transplant — family 15C SPLIT, OVE-52 ALONE (arm sim-transplant15c-split-a)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-split-a` (worktree
`~/workspace/worktrees/sim-transplant15c-split-a`).
Prereg: evidence/2026-11-14/sim-transplant15c-split-prereg.md —
**a TRUE pre-registration, written and committed BEFORE the subject
was cut** (commit 520a5f94). The merge-tree prediction in it predates
the live pick, and the pick confirmed it exactly.

## Verdict: STOPPED-BY-CONFLICT — no measurement, no verdict

**The OVE-52 split arm could not run.** Cherry-picking OVE-52 alone
onto the far end conflicts on a test file, and the coordinator's
tooling-resolution rule puts test-file conflicts in the STOP class.
The pick was aborted; no subject was cut, no STEP ran, no survival
number was measured. **There is no CARRIER / NOT-CARRIER read for
OVE-52 alone from this arm.** The group CARRIER (1/8, OVE-49 +
OVE-52 together) stands un-split.

## The conflict (predicted, then confirmed by the live pick)

Merge-tree pre-check (base = the pick's first parent 748cce3b8,
ours = far end 203a32775, theirs = pick 1c1b23482), run before the
pick, exit 1:

```
CONFLICT (modify/delete): scripts/test-fight-brain-knowledge-probe.js deleted in 203a32775 and modified in 1c1b23482.  Version 1c1b23482 of scripts/test-fight-brain-knowledge-probe.js left in tree.
```

Live pick (`git checkout -b transplant-15c-split-subject 203a32775`,
then `git cherry-pick 1c1b23482`), exit 1 — the identical conflict:

```
CONFLICT (modify/delete): scripts/test-fight-brain-knowledge-probe.js deleted in HEAD and modified in 1c1b23482 (OVE-52: wire shared fighterState into both fight brains).  Version 1c1b23482 (OVE-52: wire shared fighterState into both fight brains) of scripts/test-fight-brain-knowledge-probe.js left in tree.
```

Exact conflict list (from `git diff --name-only --diff-filter=U`
at the conflicted state): **one file only** —
`scripts/test-fight-brain-knowledge-probe.js` (unmerged state `DU`;
stages 1 and 3 present, blobs `602c7a7d` / `453520db`, identical to
the merge-tree output). Everything else auto-merged clean:
docs/ONTOLOGY.md, src/js/engine/combat.js, src/js/fieldFights.js,
src/js/game.js, src/js/villager-agency.js — all four js files and
the ontology line applied with no conflict.

Per the coordinator's tooling-resolution rule (2026-11-14 ~10:00Z),
the pick was aborted immediately (`git cherry-pick --abort`,
status clean, HEAD back at 203a32775, `git diff 203a32775` empty):
no hand-resolution, no `git checkout --ours`, no narrowed re-run
decided by this arm. The scratch branch `transplant-15c-split-subject`
pointed at the bare far end (no pick applied) and was deleted — a
branch at that hash would falsely imply a subject exists. **There
is no subject branch and no subject hash to record.**

## Why the conflict exists (verified, not assumed)

- The probe test file was CREATED on the origin line by OVE-49
  (9bc88d85d, +352 lines; the only `--diff-filter=A` hit for the
  file on the origin first-parent line). It never existed on the
  master line: ABSENT at the merge-base d229b58f5, ABSENT at
  OVE-49's parent, ABSENT at the far end 203a32775.
- OVE-49 is an ancestor of OVE-52's parent 748cce3b8, so at the
  pick base the file exists — and OVE-52 modifies it (+286/−).
- Cherry-picking OVE-52 alone onto the far end therefore asks the
  merge to modify a file the far-end side never had: modify/delete,
  structurally, not a content disagreement. The js hunks — the
  actual fighterState wiring — merge clean; only OVE-52's refresh
  of OVE-49's test blocks the pick.

## What this means for the program

- OVE-52 alone is **unmeasured, not exonerated and not a carrier**.
  The split question is still open.
- The natural narrowed route is to pick OVE-52's js hunks only,
  dropping its refresh of the probe test (the test file does not
  exist at the far end, so the refresh has nothing to refresh; the
  probe test itself lives on current master, where it passes
  against the landed OVE-52 code). **That is a coordinator
  decision, not this arm's** — per the rule, this arm decides no
  narrowed re-run. The coordinator may also route the split
  through OVE-49-first ordering (pick OVE-49, then OVE-52 — the
  narrowed arm's chain, which applied clean) with OVE-49's
  test-only content held constant, or declare the split
  unmeasurable-by-conflict with the conflict itself as the
  evidence.
- The group arm's CARRIER stands: OVE-49 + OVE-52 together
  collapse the far end to 1/8. The split only determines which
  commit carries it; the collapse itself is unaffected by this
  stop.

## Per-seed numbers

None — no STEP ran. STEP `t15c-split` was reserved in the prereg
and never executed. No corpus
(`evidence/2026-11-13/perseed-culpritbisect-a-t15c-split/` does
not exist), no driver log, no per-seed table, no wall numbers.
Nothing to report on national / table / wins / wave-4/5 / median /
deaths for OVE-52 alone.

## Sense-testing

None performed — there is no corpus and no transcript to read.
No villager behavior was observed on this arm.

## Secondary check (Blooded beat vs end-state)

Not measured — it needs the step's corpus, which does not exist.
The group arm's observation (Blooded beat fires in transcripts
yet end-state `blooded` reads false on all 8 seeds) is carried
forward to the next arm that runs a step on this band.

## Metric review (§14)

No metric was exercised: the arm stopped before any sim. The
binding thresholds (≤1/8 CARRIER, 2/8 AMBIGUOUS → one fresh-STEP
re-run, ≥3/8 NOT-CARRIER) are untested for OVE-52 alone and
carry forward unchanged to the coordinator's narrowed route. No
metric revision is proposed — there is no measurement to revise
against.

## Infrastructure

- **Safe-commit index clobber (struck, repaired).** The prereg +
  stage-1 proof commit (520a5f94) is correct — both files present,
  351 insertions — but the worktree's main index showed them as
  staged-deleted with the worktree copies untracked (the documented
  clobber class, AGENTS.md 2026-10-22/23). It surfaced as a
  refused `git checkout -b transplant-15c-split-subject 203a32775`
  ("untracked working tree files would be removed"), before any
  pick ran. Repaired with the documented pipe (`git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info`);
  verified `git status --short` empty, `git diff HEAD` empty,
  disk blobs equal HEAD blobs for both files
  (c1d01f49… / 841f10a1…). No work lost; the commit was never in
  doubt. **Second strike, same class:** the stage-2 commit
  (7416d1fa8) clobbered the index the same way (evidence file
  staged-deleted, proof file `MM`); same pipe repair, same
  verification (status empty, diff HEAD empty, disk blobs equal
  HEAD blobs for all three arm files).
- **No write flap struck this run.** All writes (prereg, proof,
  evidence) landed first try. Worktree heartbeat landed at arm
  start (registry `heartbeat_at` 2026-11-14T14:15:06Z, exit 0)
  despite the reaper holding REGISTRY.lock — the heartbeat queued
  and completed (~70s), lock contention, not failure.
- **Telemetry deviation check: N/A — no corpus exists.** The
  check takes a per-seed evidence glob; with no step run there
  is nothing to check, and the baseline is NOT rolled.
- `scripts/test-culpritbisect-a.js` re-run at closeout (the arm
  touched no step tooling, but the run closes the loop):
  **116 passed, 0 failed** (see §Files).
- Tree at closeout: arm branch `sim-transplant15c-split-a` only;
  `git status --short` empty; no src/js change; no subject
  branch; no uncommitted leftovers.

## Files

- Prereg (true pre-registration):
  `evidence/2026-11-14/sim-transplant15c-split-prereg.md`
- Evidence (this file):
  `evidence/2026-11-14/sim-transplant15c-split.md`
- Proof: `scripts/test-transplant15c-split.js` (stage 1: 45/0
  with the prereg; stage 2: STOP-state legs — no subject branch,
  no corpus, evidence records the conflict, culpritbisect-a
  116/116)
- Corpus: none. STEP `t15c-split` never executed.
