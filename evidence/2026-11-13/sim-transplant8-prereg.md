# H1 transplant — family 8 prereg: PR #22 live-thread-dry-engage (arm sim-transplant8)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8` (worktree `~/workspace/worktrees/sim-transplant8`,
base master 6df2519b9 at run start — the 0215Z coordinator evidence tip).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ evidence/2026-11-13/sim-transplant-round-0215.md (last run's coordinator
evidence — arms 4b/5b/7, conflict-STOP outcome, proof-on-master
branch-identity note).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon is invented or rewritten.

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant8.js, stage 1, green at prereg stage).

## The question

Does origin family 8 — merge `713eb7545` "Merge pull request #22 from
steve-vitale/cursor/live-thread-dry-engage-0c50" (dialog-coherence audit
defect #4: live unfinished Help/engage must not dry to "lost my train of
thought" while unfinished work remains) — alone collapse the far end
`203a32775` (GOOD 4/8) toward the merge's 1/8?

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` ("Merge pull request #21 from
  steve-vitale/cursor/living-garden-deed-master"); second parent
  `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3.
  - `src/js/conversation.js` +87/−3: `convoHasLiveUnfinished` +
    `convoUnfinishedEngageLine` (new methods), goon live-unfinished
    delivery, plant-teach diegetic-act handling in the lesson-outcome
    region.
  - `src/js/convo-dialogue.js` +74/−12: dlg:more live-unfinished
    pre-check + `_sayFellBack` handling, favor-settlement
    unfinished-outing / deferred-resume guards, Help
    live-unfinished structural delivery.
  - `scripts/test-live-thread-engage-dry-20261108.js` +228/−0 (new
    file, blob `a0161cc9…`): the dialog-audit #4 proof (Dale goon→dry,
    Ruth plant-lesson resume).
- `standing.js` NOT in the family diff; `scripts/policies` NOT in the
  family diff. The subject's native standing.js would be the far-end
  one (sha256 `75762cb2…`), so the standing-fix swap mechanics are
  exactly as in the bisect prereg. Merge policy sha == far-end policy
  sha `a7ff5c51…` (no policy drift — the family touches no policy).
- The test file is ABSENT at the far end AND at the first parent,
  present at the merge: a clean addition, not missing substrate.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 9f388a524 203a32775 713eb7545` predicts FOUR conflict
hunks across TWO content-conflicted files, both src/js game code:

1. `src/js/conversation.js` — 1 hunk (3 markers), in the
   lesson-outcome / diegetic-act region (merged-output hunk
   `@@ -7167,6 +7246,16 @@`): ours (far end) has `lessonOutcome`
   with `|| choiceId === 'teach'` + the SECRET REPLIES comment block
   (journey-deepening r120, 2026-11-08); theirs (family) has
   `lessonOutcome` without `teach` + the PLANT TEACH comment +
   `plantTeachOutcome = choiceId === 'teach'` + a different
   `diegeticAct` expression. Both sides rewrote the same lines.
2. `src/js/convo-dialogue.js` — 3 hunks (9 markers):
   - hunk A (`@@ -448,9 +479,34 @@`, favor settlement): ours
     `settledFavor` + bare `if (settledFavor && [...].includes(...))`;
     theirs `pinnedFavor` / `ledgerFavor` / `helpFavor` /
     `unfinishedOuting` / `deferredAfterResume` / `liveUnfinished` +
     the guarded `if (!unfinishedOuting && !deferredAfterResume && ...)`.
   - hunk B (`@@ -497,7 +553,33 @@`, favor-line sayLine): ours
     `const said = this.sayLine(vid, composed, { tag: ... });`;
     theirs `helpStructural` pre-check + `sayLine(..., { tag,
     structural: helpStructural || undefined })`.
   - hunk C (`@@ -505,7 +587,34 @@`, blocked-repeat check): ours
     `if (!said) {`; theirs `if (!said || c._sayFellBack) {` +
     the UNFINISHED HELP BLOCKED block + the `if (c._sayFellBack)`
     early-return block.
3. `scripts/test-live-thread-engage-dry-20261108.js` — "added in
   remote", merges cleanly (new file, no far-end counterpart).
4. NO 'merged' sections, NO delete/modify (DU) entries, NO other
   changed-in-both file. The two clean family hunks in
   conversation.js (`@@ -1163,6 +1163,55 @@` — the two new methods;
   `@@ -6069,9 +6118,38 @@` — goon delivery) and the dlg:more
   hunk in convo-dialogue.js (`@@ -288,15 +288,30 @@`) merge
   without markers — they are NOT the conflict; the conflict is
   confined to the four hunks above.

## Conflict-STOP rule (binding on this arm)

Per the task brief and the transplant prereg: apply via
`git cherry-pick -m 1 713eb7545` on the scratch branch
`transplant-8-subject` (cut at the far end). On ANY conflict: STOP,
report the exact conflict list (which paths, UU/DU, which hunks),
do NOT hand-resolve game code, do NOT decide a narrowed re-run
yourself (narrowed families are a coordinator decision only).

The conflicts predicted here are NOT tooling-only: both files are
src/js game code (conversation engine + dialogue driver), and the
conflicted regions are live conversation grammar (diegetic-act
accounting, favor settlement, dry-fallback handling) — the narrowed-
tooling rule (conflicts confined entirely to zero-src-reader files)
does not apply to this arm in any case. A narrowed 8b (e.g. the
clean hunks only, or the test file only) would be a NEW family
definition needing its own prereg and a coordinator decision, NOT
this arm's call.

PREDICTED OUTCOME — UNMEASURED (conflict-STOP): the merge-tree
pre-check predicts the four hunks above; the live cherry-pick is
expected to reproduce them exactly (the fifth consecutive exact
prediction in this program, families 2, 2b, 5, 5b, 7), the run
STOPS, no subject commit exists, no step ran, no survival number
was measured. The live pick is the authority — if it comes back
clean (contradicting the prediction), the run proceeds to measure
per the thresholds below.

## If the pick is clean (not expected) — measurement plan

- Subject branch `transplant-8-subject` left in place; subject
  commit hash recorded in evidence. Measured diff (src/js) verified
  byte-identical to the family diff.
- STEP id `t8-713eb7545`, via `scripts/culpritbisect-step.sh` run
  from a /tmp copy with REPO passed in (the script is absent at the
  far end; copy from the arm branch via `git show`). Seeds
  190391–190398, 150d death-aware, competent verbatim own-policy
  (family touches no policy — subject policy IS the far-end policy
  `a7ff5c51…`), fix standing swapped in every step, native restored
  byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated
  as NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER. Secondary (diagnostic only): wave-5 unlocks, median
  days, death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline. (No
  corpus exists on the conflict-STOP path, so no check runs.)
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts.

## Proof

`scripts/test-transplant8.js` (stage 1, before the pick):
family identity, merge-tree prediction (2 conflicted files, 4
hunks, marker counts per file, test file added cleanly, no DU),
conflict-STOP rule + tooling-only analysis, verdict mapping,
base state (branch-identity legs worktree-aware per the 0215
coordinator note — they assert the arm branch in the worktree and
the merged tip on master, so the proof stays green on master),
seed-band identity. Sections 7 (live conflict record) and 8 (no
corpus) are added after the pick attempt; on the clean-pick path
they become subject-state / step-corpus sections instead.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
branch as the reused-tooling check.
