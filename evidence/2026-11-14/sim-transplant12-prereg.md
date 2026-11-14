# sim-transplant12-prereg — family 12 dialog-residual-sampler (Loop A, fleshout-20261114T0615Z)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant12, branch `sim-transplant12-a`, worktree
`~/workspace/worktrees/sim-transplant12-a`.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-13/sim-transplant9.md (last measured arm — template
for this arm's proof/evidence shape, including the proof-on-master
branch-identity note).

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 12 diff, built on scratch branch
  `transplant-12-subject` (far end + `git cherry-pick -m 1 ac119e4ed`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 12: merge ac119e4ed "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726" — single commit
  3015beec0 "Reject residual silence/meta resume memory quotes".
  src/js/conversation.js +18/-3, scripts/test-snippet-stage-direction.js
  +55/-2 (edited test). No policy file, no standing.js, no data, no docs.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as the
  bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated
  as NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only).
- STEP id (if the pick is clean): t12-ac119e4ed.
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's `worktreeOnly`
  helper passes them vacuously when HEAD is 'master', so the proof
  stays green on master.

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers conversation,
resume openers, and the dialog audit sampler ("The sampler retains
full displayed lines, real pages, selected words and emitted
replies..."). No standalone canon doc covers the OVE-29 residual
sampler widening itself — the family is a coherence repair inside
the documented resume-opener contract (unfinished openers must quote
real spoken memory, never stage direction or meta scaffolding), not
a new system. Nothing here invents canon.

## Family content (read before the pick)

The single commit 3015beec0 is a dialogue-coherence fix, no numeric
change (OVE-29 residual sampler, after PRs #9–#12/#14/#22):

- conversation.js: `convoSnippetIsStageDirection` widened — warm
  silence ("You say nothing…", "You don't answer…", "The silence…",
  "You show them…"), recap scaffolding ("Still on X", "Say it
  plain. Still on X"), wind-down filler ("Anyway. A small smile."),
  teach diegesis, plus quote-strip of leading/trailing quote marks.
  `convoSnippetIsRealBeat` gains a party-join assent guard
  ("had better be worth it" / "not carrying your stuff" /
  "watch your back. Might as well") so party-join stock cannot land
  on the wrong thread ledger and resume as the "memory" of a plant
  lesson (seed1 Eduardo).
- test file: extends test-snippet-stage-direction.js with OVE-29
  assertions (warm-silence / Still-on / Say-it-plain / teach /
  wind-down cases must read as stage direction, never as real
  beats; a pre-seeded residual silence snippet keeps its thread
  label and drops its quote in the resume opener; party-join
  assent is not a real beat).

No kcal, damage, armor, spawn, food-yield, spoilage, standing,
table, or wave identifier appears in the family diff (proof §3).
Mechanism expectation: the family changes what villagers' resume
openers QUOTE — silence/meta lines stop masquerading as remembered
speech. It changes no cost, no reward, no schedule, no survival
lever. A survival effect, if any, would have to come through
villagers acting on truer remembered speech — a second-order path,
not a lever.

## Merge-tree pre-check (read-only, before the pick)

`git merge-tree aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0 203a32775 ac119e4ed`
(base = the merge's first parent): exactly ONE `+<<<<<<<` marker in
the whole output — ONE content-conflicted hunk in ONE file:

- `src/js/conversation.js` — "changed in both" (base f9f5a340,
  our 1c943900, their ae77aa50), hunk anchored
  `@@ -1725,8 +1725,40 @@`: ours (far end) ends the
  `convoSnippetIsRealBeat` filter with a bare `return true; },`;
  theirs (family) inserts the stage-direction call + the
  party-join assent guard + `return true; },` + the whole new
  `convoSnippetIsStageDirection` method.
- `scripts/test-snippet-stage-direction.js` — "removed in local"
  (base 405b86d0, their 4748638d, NO our blob): the file exists at
  the first parent and is edited by the family, but is ABSENT at
  the far end. No conflict markers on it in the merge-tree output,
  no added/merged/removed section besides this one, no DU entry in
  the merge-tree output.
- No merged section, no added-in-remote section, no other section.

Prediction: CONFLICT-STOP. The live pick is expected to report UU
`src/js/conversation.js` (1 hunk, the `@@ -1725,8` hunk above) and
DU `scripts/test-snippet-stage-direction.js` (modify/delete — the
family edits a file the far end never had).

WHY the pick conflicts (verified, not assumed): the whole
stage-direction guard apparatus is ORIGIN-ONLY. `git grep
convoSnippetIsStageDirection` returns 0 hits at the far end
203a32775 AND 0 hits at the merge-base d229b58f5, but 3 hits at
the first parent aa5d9ef92. The guard (PR #10
snippet-stage-direction-guard, family 14, merge 7688cb7a4) was
built on the origin line after divergence; the far end's
conversation.js never had the call site the family edits, so the
family's hunk has no anchor there. Likewise the test file was
created on the origin line (family 14) and never existed on the
local line. Family 12 extends origin-only work — it cannot land
on the far end without a hand merge, which the STOP clause
forbids. This is the same shape as family 8 (merge-tree predicted
4 hunks / 2 src/js files; live pick reproduced exactly).

## Family identity (verified at run start, before any sim)

- Merge ac119e4ed exists; subject "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726".
- First parent aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0 ("Merge pull
  request #24 from steve-vitale/cursor/heard-raid-danger-3a06").
- Second-parent side is 1 commit: 3015beec0 "Reject residual
  silence/meta resume memory quotes".
- `git diff --stat ac119e4ed^1 ac119e4ed`: 2 files, +73/-5:
  src/js/conversation.js +18/-3 (the ONLY src/js file — table
  reading js=1, pol=0 CONFIRMED), scripts/test-snippet-stage-direction.js
  +55/-2 (edited test).
- standing.js NOT in the family diff. No scripts/policies file.
  No data, no docs in the family diff.
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
