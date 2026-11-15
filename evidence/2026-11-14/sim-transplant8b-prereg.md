# H1 transplant — narrowed family 8b prereg: clean-hunks subset of PR #22 (arm sim-transplant8b-a)

Run: fleshout-20261114T2315Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8b-a` (worktree `~/workspace/worktrees/sim-transplant8b-a`,
base master 910bff7f4 at run start — the batch-ship version bump).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step mechanics,
far-end baseline 4/8 with per-seed days 86/144/150/43/150/87/150/150)
+ evidence/2026-11-13/sim-transplant8-prereg.md (full family 8 prereg —
family identity, merge-tree prediction, conflict-STOP outcome)
+ evidence/2026-11-14/sim-transplant-round-0608.md arm 3 (coordinator
adoption: narrowed 8b proposed, coordinator decision, own prereg).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). This arm measures a conversation
family; no canon is invented or rewritten.

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant8b.js, stage 1, green at prereg stage).

## The question

Does origin family 8's clean-hunks subset — narrowed family 8b, defined
by the coordinator in the 0608Z adoption and fixed EXACTLY below —
alone collapse the far end `203a32775` (GOOD 4/8) toward the merge's
1/8? Family 8 itself stopped on conflict-STOP (UNMEASURED): its
game-code hunks collide with later far-end work in the same functions
(the same-lines-rewritten wall). This arm measures ONLY the hunks
that merge cleanly, under their own prereg, per the coordinator's
decision. This arm does NOT redefine the narrowed family.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `713eb7545` (full `713eb754524458be067c79fbfd3c89ee814dde80`).
  First parent `9f388a524` ("Merge pull request #21 from
  steve-vitale/cursor/living-garden-deed-master"); second parent
  `10724c18d` ("Fix live unfinished Help/engage drying to
  train-of-thought"). Second-parent side is 1 commit.
- `git diff --stat 713eb7545^1 713eb7545`: 3 files, +389/−15.
  `src/js`: 2 files — js=2, pol=0. Table reading (js=2, pol=0)
  CONFIRMED by this arm — matches round-2115 §3 and the family-8
  prereg.
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
  family diff. The subject's native standing.js is the far-end
  one (sha256 `75762cb2…`), so the standing-fix swap mechanics are
  exactly as in the bisect prereg. Merge policy sha == far-end policy
  sha `a7ff5c51…` (no policy drift — the family touches no policy).
- The test file is ABSENT at the far end AND at the first parent,
  present at the merge: a clean addition, not missing substrate.
- `713eb7545` is NOT an ancestor of the far end `203a32775` (verified
  by this arm — the family is origin-side, absent from the far end),
  and IS an ancestor of master HEAD (the origin line was merged to
  master after the far end; the family lives on master today).

## Narrowed 8b definition (COORDINATOR-DEFINED — do not redefine)

Include ONLY these hunks from the family diff, plus the test file.
Hunk headers are cited in MERGE-TREE numbering (far-end/result side,
from `git merge-tree 9f388a524 203a32775 713eb7545`); the family-diff
numbering for the same hunks is given in parentheses.

- `src/js/conversation.js @@ -1163,6 +1163,55 @@` (family-diff
  `@@ -1163,6 +1163,55 @@` — identical) — the two new methods
  `convoHasLiveUnfinished` + `convoUnfinishedEngageLine` (pure
  addition, 49 added lines).
- `src/js/conversation.js @@ -6069,9 +6118,38 @@` (family-diff
  `@@ -5995,9 +6044,38 @@`) — goon live-unfinished delivery
  (pre-check before sayLine, alternate-thread fallback, honest
  unfinished name).
- `src/js/convo-dialogue.js @@ -288,15 +288,30 @@` (family-diff
  `@@ -273,15 +273,30 @@`) — dlg:more live-unfinished pre-check
  (check before sayLine, `if (said && !c._sayFellBack)`).
- `scripts/test-live-thread-engage-dry-20261108.js` (new file, full
  content, blob `a0161cc9…`) — the family's proof for the clean
  hunks. It exercises the new methods + goon path directly; it is
  part of the subject because the clean hunks are untestable in
  isolation without it, and it merges cleanly (new file, no far-end
  counterpart).

EXCLUDE all four conflicted hunks (the family-8 conflict-STOP set):

- `src/js/conversation.js @@ -7167,6 +7246,16 @@` (family-diff
  `@@ -7017,7 +7095,13 @@`) — lesson-outcome / diegetic-act
  (plant-teach outcome).
- `src/js/convo-dialogue.js` hunk A `@@ -448,9 +479,34 @@`
  (family-diff `@@ -444,6 +475,10 @@`) — favor settlement
  (`liveUnfinished` guard).
- `src/js/convo-dialogue.js` hunk B `@@ -497,7 +553,33 @@`
  (family-diff `@@ -495,10 +530,25 @@`) — favor-line sayLine
  (Help structural pre-check).
- `src/js/convo-dialogue.js` hunk C `@@ -505,7 +587,34 @@`
  (family-diff `@@ -510,18 +560,30 @@`) — blocked-repeat check
  (`_sayFellBack` handling).

EXCLUDED BUT CLEAN — documented, not forgotten: the family diff's
second dlg:more hunk, `src/js/convo-dialogue.js @@ -293,11 +308,27 @@`
(merge-tree `@@ -308,11 +323,27 @@`) — the `_sayFellBack`
early-return + thread-dry unfinished-name block — merges WITHOUT
markers in the full-family merge-tree output, but it is NOT one of
the three hunks the coordinator named, and the task's include list
says ONLY. It stays OUT of 8b. Consequence, stated up front: the
subject's dlg:more carries the pre-check and the
`if (said && !c._sayFellBack)` success-branch guard, but NOT the
fell-back early return and NOT the dry-branch unfinished-name block.
If 8b reads survival-inert, the excluded continuation hunk is a
candidate follow-up (a further narrowed 8c would need its own
prereg + coordinator decision — NOT this arm's call).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree 9f388a524 203a32775 713eb7545` (re-run by THIS arm at
run start; full output saved at /tmp/mt8.txt during prereg work —
the proof re-runs it live):

- The three included hunks appear as MARKER-FREE hunks in the
  merged output: conversation.js `@@ -1163,6 +1163,55 @@`,
  `@@ -6069,9 +6118,38 @@`; convo-dialogue.js
  `@@ -288,15 +288,30 @@`. (The `@@ -7158,6 +7236,7 @@`
  fragment is only the context split immediately before the
  conflict markers of the lesson-outcome hunk, not a separate
  clean hunk.)
- The unlisted clean dlg:more hunk also appears marker-free at
  `@@ -308,11 +323,27 @@` — confirming it is clean, and
  confirming it is a SEPARATE hunk from the included pre-check.
- The four excluded hunks carry ALL the conflict markers:
  conversation.js 3 markers (1 hunk), convo-dialogue.js 9 markers
  (3 hunks). No other markers anywhere in the output.
- `scripts/test-live-thread-engage-dry-20261108.js` — "added in
  remote", merges cleanly (new file, no far-end counterpart).
- NO 'merged' sections for the conflicted files (a conflicted
  file's clean hunks ride inside its 'changed in both' section),
  NO delete/modify (DU) entries, NO other changed-in-both file.

PREDICTED OUTCOME — MEASURABLE: the filtered patch (three clean
hunks + test file) applies cleanly to the far end with ZERO
conflicts, because each included hunk's context lines are byte-
identical between the first parent and the far end (that is what
"marker-free in the merge-tree output" means). The live `git apply`
is the authority — if it conflicts, the conflict-STOP rule below
fires.

## Conflict-STOP rule (binding on this arm)

Apply the filtered patch to the scratch branch `transplant-8b-subject`
(cut at the far end). On ANY conflict: STOP, report the exact
conflict list (which paths, which hunks), do NOT hand-resolve game
code, do NOT silently drop a conflicting hunk and proceed (dropping
would redefine the family mid-run), report UNMEASURED with the
exact conflict list. The four excluded hunks are excluded from the
patch entirely, so ANY conflict is by definition beyond them.

## Measurement plan

- Subject branch `transplant-8b-subject` left in place; subject
  commit hash recorded in evidence. Measured diff (src/js) verified
  byte-identical to the family's clean hunks: the subject diff's
  added/removed lines (modulo hunk-header line numbers, which shift
  with the far end) must equal the family diff's clean-hunk
  added/removed lines exactly; the test file blob must be
  `a0161cc9…`; subject policy == far-end policy `a7ff5c51…`;
  subject native standing == far-end standing `75762cb2…`.
- BASELINE LEG FIRST: STEP `ep-far-8b` on the far end `203a32775`,
  via `scripts/culpritbisect-step.sh` run from a /tmp copy with
  REPO passed in (the script is absent at the far end; copy from
  the arm branch). Expect 4/8, per-seed days
  86/144/150/43/150/87/150/150 (masterregress far leg, per the
  bisect prereg). The step id is `ep-far-8b`, NOT a re-run of
  `ep-far`: the bisect arm's `ep-far` corpus is committed on
  master (settled baseline, 4/8, same days) and this run
  re-verifies it with a fresh id rather than overwriting the
  settled record. Gate: the fresh baseline leg reads ≥3/8 — if it
  reads ≤2/8, STOP and report loudly (the settled localization
  would be in question; no subject step is cut).
- SUBJECT LEG: STEP id `t8b`, via `scripts/culpritbisect-step.sh`
  run from a /tmp copy with REPO passed in. Seeds 190391–190398,
  150d death-aware, competent verbatim own-policy (family touches
  no policy — subject policy IS the far-end policy `a7ff5c51…`),
  fix standing swapped in every step, native restored
  byte-identical afterwards, sha-verified.
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id (2/8 again → recorded AMBIGUOUS,
  treated as NOT-CARRIER for ordering but kept on the suspect
  list); ≥3/8 NOT-CARRIER. Secondary (diagnostic only): wave-5
  unlocks, median days, death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Sense-testing: read transcripts from the step corpus; judge
  coherence/meaning/consequences, not just counts. Precedent
  warning: the 15E p3conv arm found its dialogue paths
  unexercised on the survival band (0 resume-opener matches in
  225 vetSays lines), and arm 9 found its family's new lines
  never fire under the competent policy (0 mentions across
  98,590 sayCount lines). Census the 8b lines in the corpus:
  the new-methods outputs ("Still on …"), the goon-delivery
  path, the dlg:more pre-check. A survival verdict proves
  survival-inertness, not dialogue behavior.

## Proof

`scripts/test-transplant8b.js` (stage 1, before the subject):
family identity (incl. merge NOT an ancestor of the far end, IS an
ancestor of master), narrowed-definition hunk inventory (family
diff has exactly 3 conversation.js hunks + 5 convo-dialogue.js
hunks; included/excluded sets named exactly), merge-tree
prediction (marker-free included hunks, all markers confined to
the four excluded hunks, test file added cleanly, no DU),
conflict-STOP rule + tooling-only analysis (n/a — the rule here
is any-conflict-stops, since the patch is pre-filtered),
verdict mapping, base state (branch-identity legs worktree-aware
per the 0215 coordinator note — they assert the arm branch in the
worktree and the merged tip on master, so the proof stays green on
master), seed-band identity. Sections 7 (live subject state) and
8 (step corpora) are added after the subject is cut and the steps
run; on the conflict-STOP path they become the live conflict
record / no-corpus sections instead.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
branch as the reused-tooling check.
