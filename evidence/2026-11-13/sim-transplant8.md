# H1 transplant — family 8: PR #22 live-thread-dry-engage, UNMEASURED (conflict-STOP) (arm sim-transplant8)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 8 (coordinator decision, table order
after families 4b/5b measured, 7 unmeasured — evidence/2026-11-13/
sim-transplant-round-0215.md §Next blanks).
Arm branch: `sim-transplant8` (worktree `~/workspace/worktrees/sim-transplant8`,
base master 6df2519b9 at run start).
Prereg: evidence/2026-11-13/sim-transplant8-prereg.md — written and
committed BEFORE cutting the subject or running any judged sim
(commit 0f7f3d921, proof 62/62 at prereg stage).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon was invented or rewritten.

## The question

Does origin family 8 — merge `713eb7545` "Merge pull request #22 from
steve-vitale/cursor/live-thread-dry-engage-0c50" (dialog-coherence audit
defect #4: live unfinished Help/engage must not dry to "lost my train of
thought" while unfinished work remains) — alone collapse the far end
`203a32775` (GOOD 4/8) toward the merge's 1/8?

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` (PR #21 merge, living-garden-deed); second
  parent `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3.
  - `src/js/conversation.js` +87/−3: `convoHasLiveUnfinished` +
    `convoUnfinishedEngageLine` (new methods), goon live-unfinished
    delivery, plant-teach diegetic-act handling.
  - `src/js/convo-dialogue.js` +74/−12: dlg:more live-unfinished
    pre-check + `_sayFellBack` handling, favor-settlement
    unfinished-outing / deferred-resume guards, Help
    live-unfinished structural delivery.
  - `scripts/test-live-thread-engage-dry-20261108.js` +228/−0 (new
    file, blob `a0161cc9…`): the dialog-audit #4 proof (Dale goon→dry,
    Ruth plant-lesson resume).
- `standing.js` NOT in the family diff; `scripts/policies` NOT in the
  family diff. Merge policy sha == far-end policy sha `a7ff5c51…`
  (no policy drift). The test file is ABSENT at the far end AND at
  the first parent, present at the merge: a clean addition, not
  missing substrate.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 9f388a524 203a32775 713eb7545` predicted FOUR conflict
hunks across TWO content-conflicted files, both src/js game code,
with the test file added cleanly in remote and no DU. The live pick
reproduced the prediction exactly (see §Cherry-pick below) — the
fifth consecutive exact prediction in this program (families 2, 2b,
5, 5b, 7).

## Cherry-pick (live)

- Subject branch `transplant-8-subject` cut at the far end
  `203a32775`; `git cherry-pick -m 1 713eb7545` conflicted in exactly
  the TWO predicted files (pick_rc=1). No subject commit exists.
- Live conflict list — FOUR unmerged paths (two UU, one clean add,
  no DU):
  - **UU `src/js/conversation.js`** — 1 hunk (1/1/1 markers),
    markers at lines 7239 (`<<<<<<< HEAD`), 7249 (`=======`), 7258
    (`>>>>>>> 713eb7545 ...`). The hunk is the lesson-outcome /
    diegetic-act region (merge-tree anchor
    `@@ -7167,6 +7246,16 @@`): ours (far end) has `lessonOutcome`
    with `|| choiceId === 'teach'` + the SECRET REPLIES comment
    block (journey-deepening r120, 2026-11-08); theirs (family) has
    `lessonOutcome` without `teach` + the PLANT TEACH comment +
    `plantTeachOutcome = choiceId === 'teach'` + a different
    `diegeticAct` expression. Both sides rewrote the same lines.
  - **UU `src/js/convo-dialogue.js`** — 3 hunks (3/3/3 markers):
    - hunk A, markers at lines 482 / 486 / 509 (merge-tree anchor
      `@@ -448,9 +479,34 @@`, favor settlement): ours
      `settledFavor` + bare `if (settledFavor && [...].includes(...))`;
      theirs `pinnedFavor` / `ledgerFavor` / `helpFavor` /
      `unfinishedOuting` / `deferredAfterResume` / `liveUnfinished`
      + the guarded `if (!unfinishedOuting && !deferredAfterResume
      && ...)`.
    - hunk B, markers at lines 556 / 558 / 582 (anchor
      `@@ -497,7 +553,33 @@`, favor-line sayLine): ours
      `const said = this.sayLine(vid, composed, { tag: ... });`;
      theirs `helpStructural` pre-check + `sayLine(..., { tag,
      structural: helpStructural || undefined })`.
    - hunk C, markers at lines 590 / 592 / 617 (anchor
      `@@ -505,7 +587,34 @@`, blocked-repeat check): ours
      `if (!said) {`; theirs `if (!said || c._sayFellBack) {` +
      the UNFINISHED HELP BLOCKED block + the `if (c._sayFellBack)`
      early-return block.
  - **A `scripts/test-live-thread-engage-dry-20261108.js`** — staged
    clean (the clean addition; no far-end counterpart).
  - No DU, no other unmerged path. `git status --porcelain` at the
    stop: exactly `A` test file + `UU` × 2.
- The conflicts are NOT tooling-only: both files are src/js game
  code (conversation engine + dialogue driver), and the conflicted
  regions are live conversation grammar (diegetic-act accounting,
  favor settlement, dry-fallback handling). The narrowed-tooling
  rule (conflicts confined entirely to zero-src-reader files) does
  NOT apply to this arm in any case.
- Abort: `git update-index --refresh` then `git cherry-pick
  --abort` (abort_rc=0; the refresh printed the two "needs merge"
  lines first — the same racy-index shape the family-7 arm hit,
  cleared by the refresh before the abort, no retry needed this
  time). Subject branch verified at the far end afterwards
  (`transplant-8-subject` = `203a327750a223e0a1465dc51f5409787efdfaae`,
  no subject commit). HEAD checked back out to `sim-transplant8`
  and the tree verified clean (status empty). The abort + checkout
  took ~115s wall (box load — sibling panels running; the checkout
  itself was the slow part, not a stall).

## VERDICT: UNMEASURED (conflict-STOP)

Survived: not measured (no step ran). Wave-5, median days,
death-cause shares: not measured. Per the binding prereg and the
task brief, the run STOPS here: the family cannot be landed on the
far end as written — the far end's later journey work (r120 secret
replies, sociallife blocked-repeat, favor settlement) rewrote the
same conversation-grammar lines the family rewrote for dialog
audit #4. Resolving the four hunks by hand would be game-code
authorship, not a transplant measurement, so no resolution was
attempted and no narrowed re-run was decided by this arm.

## What this means for the H1 transplant program

Family 8 is the SIXTH family to stop on divergence (1, 2, 3, 6, 7
before it). The missing-substrate wall (families 1–3, 6, 7) now has
a sibling: the **same-lines-rewritten wall** — a family whose
game-code hunks collide with later far-end work in the same
functions, with no clean carve-out. Unlike family 7 (whose
objectives.js hunks auto-merged, leaving a mechanically possible
narrowed 7b), family 8's clean hunks (the two new methods, goon
delivery, dlg:more pre-check) sit in the SAME two files as its
conflicted hunks, so any narrowed 8b would still need a new family
definition and a coordinator decision — it is NOT this arm's call.
Proposed narrowed 8b (coordinator decision, own prereg): the
test-file-only family (dialog-audit #4 proof with no game code —
measures nothing by itself, so likely pointless) OR the clean-hunks
subset (new methods + goon + dlg:more, excluding the three
conflicted regions) — the latter is the only narrowed shape that
could carry a survival signal, and it needs the coordinator to
define exactly which hunks it includes.

Measured families so far: 2b AMBIGUOUS (2/8 twice), 4b NOT-CARRIER
(3/8), 5b NOT-CARRIER (4/8). Unmeasured: 1, 2, 3, 6, 7, 8. No
carrier identified; national / table / wins remain 0 on the
collapse band.

## Sense-testing (SENSE-TESTING LAW)

No step ran, so no sim transcripts exist for this arm — there is
nothing to sense-test. What the diffs DO show, read as a village
assessor: the family and the far end both independently repaired
the same conversation failure mode (a villager drying to "lost my
train of thought" mid-exchange) from different angles — the family
by naming the unfinished work structurally, the far end by
treating blocked repeats and secret replies as diegetic acts. The
collision is two honest repairs landing on the same lines, not a
contradiction in design. The village on the far end already
carries the r120/sociallife side of the repair; whether the
family's side (unfinished-outing naming, deferred-resume guards)
would change survival is unmeasured and stays unmeasured until a
coordinator-defined narrowed 8b runs.

## Metric review (§14)

The primary metric (survived/8) was never measured — the
conflict-STOP rule fired before any judged sim, exactly as the
prereg predicted. No re-scoring: UNMEASURED is the verdict, not a
metric miss. The 2/8 re-run rule was not exercised. No threshold
change proposed.

## Telemetry

No step corpus exists, so the deviation check did not run — there
is nothing to compare against the scale-wall baseline. Baseline
NOT rolled. (On the clean-pick path the check would have been
REFUSED as recorder-corpus class, per the prereg.)

## Proof results

- `node scripts/test-transplant8.js`: **84 passed, 0 failed**
  (family identity, merge-tree prediction with all four hunk
  anchors + signature lines, conflict-STOP rule + tooling-only
  analysis, verdict mapping, base state with worktree-aware
  branch-identity legs, seed-band identity, live conflict record
  with the exact marker line numbers, no corpus).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Host write flap: no EPERM failure struck this arm's git or file
  writes directly. Safe-commit index clobber struck the prereg
  commit (0f7f3d921): both files showed staged-as-deleted after a
  correct commit; repaired with the documented
  `git ls-tree -r HEAD | git update-index --add --index-info`
  pipe and verified (status empty, diff HEAD empty, hash-object
  matches ls-tree).
- Closeout: arm branch `sim-transplant8` tip (this commit);
  subject branch `transplant-8-subject` LEFT at
  `203a327750a223e0a1465dc51f5409787efdfaae` (the far end, no
  subject commit); worktree verified clean at closeout (tracked
  tree empty, standing.js == HEAD, no swap residue — no step ran,
  so no standing swap ever happened).

## Canon

docs/CONVERSATIONS.md covers the conversation area and was read.
It documents the thread/ledger/dry-line grammar the family
changes and the far end's later repairs. No canon doc was invented
or rewritten. The family's change (never dry while unfinished
work remains) and the far end's side (diegetic-act accounting)
are both inside the canon's "replies belong to the spoken
exchange" and "no repeats, ever" rules; the collision is in
implementation lines, not in canon.
