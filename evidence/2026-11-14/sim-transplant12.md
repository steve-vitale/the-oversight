# sim-transplant12 — family 12 dialog-residual-sampler (Loop A, fleshout-20261114T0615Z)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant12, branch `sim-transplant12-a`, worktree
`~/workspace/worktrees/sim-transplant12-a`.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant12-prereg.md (this arm's prereg,
committed d71157936 with the stage-1 proof, 72/72, BEFORE the subject
was cut and before any judged sim).

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies; native restored byte-identical afterwards, sha-verified.
- Subject: far end + family 12 diff, built on scratch branch
  `transplant-12-subject` (far end + `git cherry-pick -m 1 ac119e4ed`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 12: merge ac119e4ed "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726" — single commit
  3015beec0 "Reject residual silence/meta resume memory quotes".
  src/js/conversation.js +18/-3, scripts/test-snippet-stage-direction.js
  +55/-2 (edited test). No policy file, no standing.js.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step.
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id; ≥3/8 NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list, do NOT hand-resolve game code, do NOT decide a
  narrowed re-run (narrowed families are a coordinator decision only).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers conversation,
resume openers, and the dialog audit sampler. No standalone canon
doc covers the OVE-29 residual sampler widening itself — the family
is a coherence repair inside the documented resume-opener contract
(unfinished openers must quote real spoken memory, never stage
direction or meta scaffolding), not a new system. Nothing here
invents canon.

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
table, or wave identifier appears in the family diff (proof §3 —
the one naive substring hit was "comfortable" containing "table";
the proof matches on word boundaries).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0 203a32775 ac119e4ed`
predicted a CONFLICT — exactly ONE `+<<<<<<<` marker in the whole
output, ONE content-conflicted hunk in ONE file:

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
forbids. The live pick reproduced the prediction exactly (see
§Cherry-pick below) — the sixth consecutive exact prediction in
this program (families 2, 2b, 5, 5b, 7, 8).

## Cherry-pick (live)

- Subject branch `transplant-12-subject` cut at the far end
  `203a32775`; `git cherry-pick -m 1 ac119e4ed` conflicted in
  exactly the TWO predicted files (pick_rc=1). No subject commit
  exists.
- Live conflict list — TWO unmerged paths (one UU, one DU):
  - **UU src/js/conversation.js** — 1 hunk (1/1/1 markers),
    markers at lines 1728 (`<<<<<<< HEAD`), 1731 (`=======`),
    1761 (`>>>>>>> ac119e4ed (Merge pull request #25 from
    steve-vitale/cursor/dialog-residual-sampler-f726)`). The hunk
    is the `convoSnippetIsRealBeat` filter tail + the
    `convoSnippetIsStageDirection` method (merge-tree anchor
    `@@ -1725,8 +1725,40 @@`): ours (far end) has no stage-direction
    call and no such method at all; theirs (family) adds the call,
    the party-join assent guard, and the whole method. The far end
    never built the guard the family extends.
  - **DU scripts/test-snippet-stage-direction.js** — CONFLICT
    (modify/delete): deleted in HEAD and modified in ac119e4ed.
    Version ac119e4ed of the file left in tree. The file was
    created on the origin line (family 14, PR #10) and never
    existed on the local line; the family edits it (+55/-2).
- Abort: `git cherry-pick --abort` (abort_rc=0; no
  `update-index --refresh` needed this time — the racy-index shape
  the family-7/8 arms hit did not recur). Subject branch verified
  at the far end afterwards (`transplant-12-subject` =
  `203a327750a223e0a1465dc51f5409787efdfaae`, 0 commits ahead, no
  subject commit). HEAD checked back out to `sim-transplant12-a`
  (d71157936). Tracked tree clean, standing.js byte-identical to
  HEAD (no swap ever ran).
- The conflicts are NOT confined to zero-src-reader tooling files
  (conversation.js is game code), so the narrowed-tooling route
  does not apply even in principle. The coordinator decides the
  narrowed route, if any — this arm decides nothing.

## Verdict

- VERDICT: UNMEASURED
- Survived: — (no step ran). Wave-5: —. Median: —. Deaths: —.
- Family 12 cannot be measured on the far end as a clean
  cherry-pick: its only src/js file conflicts (1 hunk) and its
  test file is a modify/delete, because the work it extends
  (family 14's stage-direction guard) exists only on the origin
  line. It stays on the suspect list as UNMEASURED — neither
  CARRIER nor NOT-CARRIER. A hand-merged subject would measure a
  different diff than the family, so no verdict can be read off
  this arm.
- Note for the coordinator: family 14 (PR #10
  snippet-stage-direction-guard, merge 7688cb7a4) is the
  prerequisite — if family 14 ever reads CARRIER or NOT-CARRIER,
  family 12's content rides on top of it, and the two should be
  judged together, not separately. Family 12 alone, as staged,
  is unmeasurable.

## Sense-testing (SENSE-TESTING LAW)

No step ran, so no sim transcripts exist for this arm — there is
nothing to sense-test. What the diff DOES show, read as a village
assessor: the family makes resume openers honest — a villager
resuming an unfinished thread will no longer quote warm silence
("You say nothing…"), recap scaffolding ("Still on that hard
time"), or a party-join assent ("Fine. This had better be worth
it.") as if it were something the player once SAID. The thread
label survives ("that plant lesson") while the false quote drops.
That is a coherence repair to remembered speech, the same class
of fix as family 9's Help-coherence repair — and like family 9,
its survival effect, if any, would run through villagers acting
on truer remembered speech, a second-order path the competent
policy may never reach. The collision itself is not a design
contradiction: the far end simply never built the guard the
family extends (a lineage gap, not two honest repairs landing on
the same lines, as family 8's was). The village on the far end
carries no version of this guard at all — its resume openers can
still quote silence as memory. Whether that ever costs a village
a life is unmeasured, and stays unmeasured until the family-14
prerequisite is resolved.

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

- `node scripts/test-transplant12.js`: **92 passed, 0 failed**
  (family identity, merge-tree prediction with the hunk anchor +
  blob identities, origin-only mechanism, verdict mapping,
  conflict-STOP rule, prereg recorded, base state, live conflict
  record with the exact marker line numbers, no corpus).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).

## Infrastructure

- Safe-commit index clobber struck the stage-1 commit (both
  files staged-as-deleted after a correct commit d71157936) —
  repaired with the documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe, verified (status
  empty, diff empty, hash-object == HEAD blob per file).
- No flap EPERM hit on this arm's writes. No pushes, no version
  bumps, no live verification (ship loop owns deploys). Stage-2
  commit: 3e6decf6a9a6b8c7d3ef882bd58e4eccb3c4fb67 (proof 92/92,
  culpritbisect 116/116). Subject branch
  transplant-12-subject left in place at
  203a327750a223e0a1465dc51f5409787efdfaae (the far end, 0 commits
  ahead, no subject commit).
