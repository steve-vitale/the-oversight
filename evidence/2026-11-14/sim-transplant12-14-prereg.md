# sim-transplant12-14-prereg — families 12+14 COMBINED (Loop A, fleshout-20261114T0740Z)

Run: fleshout-20261114T0740Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant12-14-a, branch `sim-transplant12-14-a`,
worktree `~/workspace/worktrees/sim-transplant12-14-a`.

## Authority — coordinator decision (why 12+14 together, not 12 alone)

Per the 0615Z closeout (evidence/2026-11-14/sim-transplant-round-0615.md
§3, arms 2–3) and sim-findings line 2329: family 12 (PR #25
dialog-residual-sampler) rides on family 14's origin-only guard and
cannot be judged alone — the 0615Z arm sim-transplant12-a proved 12
alone conflicts on the far end (merge-tree predicted exactly, live
pick reproduced it: UU src/js/conversation.js + DU
scripts/test-snippet-stage-direction.js, UNMEASURED). Family 12's
conversation.js hunk extends `convoSnippetIsStageDirection`, a guard
that exists only on the origin line (0 hits at far end 203a32775 and
merge-base d229b58f5, 3 at first parent aa5d9ef92). Picking 14 first
supplies the guard; 12 then extends it. On the origin line 14
precedes 12, so 14→12 matches origin order. Do NOT re-attempt 12
alone. The 14-alone arm (sim-transplant14-a) runs in parallel this
run — do not touch its tree, branch, or claim file.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant12-prereg.md (the 12-alone arm —
template for this arm's proof/evidence shape, including the
proof-on-master branch-identity note).

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 14 diff + family 12 diff, built on
  scratch branch `transplant-12-14-subject` (far end +
  `git cherry-pick -m 1 7688cb7a4` FIRST, then
  `git cherry-pick -m 1 ac119e4ed` on top of it). NEVER committed
  to the arm branch. Branch LEFT in place, hash recorded in
  evidence, so the verdict is reproducible.
- Family 14: merge 7688cb7a4 "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard" — first parent
  16cdd690062b3551ff6b4b0d3639770c8af84b5f, second-parent side 1
  commit e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". 2 files, +33:
  src/js/conversation.js +12, scripts/test-snippet-stage-direction.js
  +21 (new test). No policy file, no standing.js, no data, no docs.
- Family 12: merge ac119e4ed "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726" — first parent
  aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0, second-parent side 1
  commit 3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject residual
  silence/meta resume memory quotes". 2 files, +73/-5 by numstat:
  src/js/conversation.js +18/-3, scripts/test-snippet-stage-direction.js
  +55/-2 (edited test). CORRECTION to the task brief's shorthand:
  the brief wrote conversation.js "+21/-5" and the test "+57/-5" —
  those are git --stat TOTAL changed-line counts per file (21 and
  57), not insertions/deletions; numstat is +18/-3 and +55/-2,
  totalling +73/-5 (verified by the stage-1 proof). No policy file,
  no standing.js, no data, no docs.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 12+14 PAIR
  as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a
  fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER. If the pair reads CARRIER, the next arm splits
  14-alone vs 12-on-14 (the 14-alone verdict will already be in
  hand from the parallel arm).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only). If
  conflicts are confined ENTIRELY to zero-src-reader tooling files
  (scripts/balance-proof.json / scripts/green-list.txt), record
  them and STOP too.
- STEP id: t12-14-combined (fresh).
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's `worktreeOnly`
  helper passes them vacuously when HEAD is 'master', so the proof
  stays green on master. Prereg-commit ancestry legs resolve by
  message/subject, not by hash (0608Z lesson: an adoption rebase
  rewrites hashes).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers conversation,
resume openers, and the dialog audit sampler ("The sampler retains
full displayed lines, real pages, selected words and emitted
replies..."). No standalone canon doc covers the OVE-29 residual
sampler widening itself — the pair is a coherence repair inside the
documented resume-opener contract (unfinished openers must quote
real spoken memory, never stage direction or meta scaffolding), not
a new system. Nothing here invents canon.

## Family content (read before the picks)

Family 14 (single commit e4836747, "Reject stage-direction snippets
as resume memory quotes"): adds `convoSnippetIsStageDirection` to
conversation.js (+12) — stage-direction snippets ("They glance at
the fire…", "A comfortable quiet…", "Still on what they confided")
are rejected as resume memory quotes — plus a 21-line new test file
with the stage-direction assertions.

Family 12 (single commit 3015beec, "Reject residual silence/meta
resume memory quotes"): widens the same guard — warm silence ("You
say nothing…", "You don't answer…", "The silence…", "You show
them…"), recap scaffolding ("Still on X", "Say it plain. Still on
X"), wind-down filler ("Anyway. A small smile."), teach diegesis,
plus quote-strip of leading/trailing quote marks.
`convoSnippetIsRealBeat` gains a party-join assent guard ("had
better be worth it" / "not carrying your stuff" / "watch your back.
Might as well") so party-join stock cannot land on the wrong thread
ledger and resume as the "memory" of a plant lesson (seed1
Eduardo). The test file gains OVE-29 assertions (warm-silence /
Still-on / Say-it-plain / teach / wind-down cases must read as
stage direction, never as real beats; a pre-seeded residual silence
snippet keeps its thread label and drops its quote in the resume
opener; party-join assent is not a real beat).

In plain words: resume openers stop quoting warm silence, recap
scaffolding, or party-join assent as if it were something the player
once said, while keeping the thread label. Both halves are
dialogue-coherence only — no numbers, no gates. No kcal, damage,
armor, spawn, food-yield, spoilage, standing, table, or wave
identifier appears in either family diff (proof §4). Mechanism
expectation: the pair changes what villagers' resume openers QUOTE
— silence/meta lines stop masquerading as remembered speech. It
changes no cost, no reward, no schedule, no survival lever. A
survival effect, if any, would have to come through villagers
acting on truer remembered speech — a second-order path, not a
lever.

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each merge's FIRST PARENT as the base
(the base `git cherry-pick -m 1` itself uses; the transplant12 arm
used the same convention). Run with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (14 onto the far end):
  `git merge-tree --write-tree --merge-base=16cdd690062b3551ff6b4b0d3639770c8af84b5f 203a32775 7688cb7a4`
  → rc=0, clean tree bc52919e73e6449e93ab2b64497eb25138d9ee90, zero
  conflicted files, zero conflict markers, no messages. CLEAN.
  Live-confirmed on a throwaway scaffold branch (tmp-14-predict,
  deleted afterwards): `git cherry-pick -m 1 7688cb7a4` rc=0,
  "Auto-merging src/js/conversation.js", commit e45649c68, 2 files
  +33 — the scaffold is not the subject and is gone.
- PICK 2 (12 onto the 14-applied tree): base aa5d9ef92 (12's first
  parent), ours = the 14-applied tree, theirs = ac119e4ed →
  rc=0, clean tree e78fac42d89e811f6bfce981b7274e5ee3c5c014, zero
  conflicted files, zero markers. CLEAN. The 14-applied tree was
  built two independent ways and both give the same tree:
  the live scaffold pick (e45649c68, tree bc52919e…) and a
  temp-index rebuild (`git read-tree 203a32775` + apply the 14
  diff + `git write-tree` → bc52919e… again); both merge-tree
  runs give e78fac42…. The predicted pick-2 tree carries the
  guard (2 `convoSnippetIsStageDirection` hits in conversation.js)
  and the residual markers (2 in conversation.js, 3 in the test
  file).

- BRIEF-BASE NOTE (method correction, recorded not hidden): the
  task brief's literal first command uses merge-base d229b58f5 as
  the base (`git merge-tree d229b58f5… 203a32775 7688cb7a4`). That
  run reports rc=1 with conflicts ONLY in scripts/balance-proof.json
  and scripts/green-list.txt — because d229b58f5 predates the whole
  origin line, so base→theirs carries ALL origin-line drift in those
  files (both files change on d229b58f5..7688cb7a4), while
  base→ours carries the local line's own edits. Neither file is in
  family 14's own diff (16cdd69006..7688cb7a4 = exactly the 2
  files above), so those conflicts are cumulative-line drift, not
  a family-14 conflict — a cherry-pick -m 1 never sees them (its
  base is the first parent). The binding prediction is the
  first-parent one (CLEAN, above); the brief-base run is recorded
  in the proof as an artifact leg. The live picks are ground truth:
  if either live pick conflicts, the STOP clause fires regardless
  of any prediction.

Prediction: BOTH PICKS CLEAN. No STOP expected. The live pick-1
tree must equal bc52919e… and the live subject tip tree must equal
e78fac42… (proof §7 asserts both).

## Family identity (verified at run start, before any sim)

- Merge 7688cb7a4 exists; subject "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard".
- First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f; second-parent
  side is 1 commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b
  "Reject stage-direction snippets as resume memory quotes".
- `git diff --stat 7688cb7a4^1 7688cb7a4`: 2 files, +33:
  src/js/conversation.js +12, scripts/test-snippet-stage-direction.js
  +21 (new test). Table reading js=1, pol=0 CONFIRMED.
- Merge ac119e4ed exists; subject "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726".
- First parent aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0; second-parent
  side is 1 commit: 3015beec0aefd3a3db394b73c362c2af9f4c2f84
  "Reject residual silence/meta resume memory quotes".
- `git diff --numstat ac119e4ed^1 ac119e4ed`: 2 files, +73/-5:
  src/js/conversation.js 18/3, scripts/test-snippet-stage-direction.js
  55/2 (edited test). Table reading js=1, pol=0 CONFIRMED.
- standing.js NOT in either family diff. No scripts/policies file
  in either. No data, no docs in either family diff.
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Guard origin-only counts (verified): convoSnippetIsStageDirection
  0 hits at far end 203a32775, 0 at merge-base d229b58f5, 0 at 14's
  first parent 16cdd69006, 3 at 12's first parent aa5d9ef92.
  Test file absent at the far end, present at both first parents.
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.
