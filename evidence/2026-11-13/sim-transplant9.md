# sim-transplant9 — family 9 favor-debt-help-coherence (Loop A, fleshout-20261114T0337Z)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant9, branch `sim-transplant9`, worktree
`~/workspace/worktrees/sim-transplant9`.

## Prereg (binding, committed BEFORE any judged sim)

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-13/sim-transplant-round-0215.md (last run's
coordinator evidence — arms 4b/5b/7, conflict-STOP outcome,
proof-on-master branch-identity note).

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies; native restored byte-identical afterwards, sha-verified.
- Subject: far end + family 9 diff, built on scratch branch
  `transplant-9-subject` (far end + `git cherry-pick -m 1 e44b0206e`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 9: merge e44b0206e "Merge pull request #14 from
  steve-vitale/cursor/favor-debt-help-coherence-bb3e" — single commit
  15e338184 "Fix favor/debt Help contradicting unfinished openers".
  src/js/convo-dialogue.js +40/-5, src/js/convo-wants.js +58/-3,
  scripts/test-favor-debt-help-coherence-20261108.js +165/-0 (new).
  No policy file, no standing.js.
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
  conflict list (which paths, UU/DU, which hunks), do NOT
  hand-resolve game code, do NOT decide a narrowed re-run (narrowed
  families are a coordinator decision only).
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's
  `worktreeOnly` helper passes them vacuously when HEAD is
  'master', so the proof stays green on master. (The 4b/5b/7 proofs
  failed 2/129 etc. on master only on branch-identity legs; this
  arm avoids that shape.)

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers conversation,
favor requests, and the favor-action contract — the family lives
inside that canon: a "How can I help?" press on an unfinished joint
outing (water haul / forage help) must name the concrete unfinished
work, never contradict the opener with "it's handled" / "we're
square". No standalone canon doc covers "Help contradicting
unfinished openers" specifically; the fix is a coherence repair
inside the documented favor contract, not a new system. Nothing here
invents canon.

## Family content (read before the pick)

The single commit 15e338184 is a dialogue-coherence fix, no numeric
change:

- convo-dialogue.js: `unfinishedOuting` (water_haul / forage_help
  with an unreturned run) and `deferredAfterResume` (a resume opener
  claimed unfinished debt/favor while the sitting's ask_favor never
  pinned one) now bypass the settled-favor "It's already handled"
  short-circuit and the vague restated pool; a blocked Help on
  unfinished favor/debt names the concrete work structurally
  ("We still need to get home and unload what we have. That's the
  help.") instead of drying into "lost my train of thought."
- convo-wants.js: the same deferred guard on the settled
  short-circuit and the why/stakes pools, plus `repay:help:water`
  and `repay:help:forage` lines so "How can I help?" on a repay
  want matches the opener's claim.
- New test file scripts/test-favor-debt-help-coherence-20261108.js
  (+165/-0).

No kcal, damage, armor, spawn, food-yield, spoilage, standing,
table, or wave identifier appears in the family diff (proof §3).
Mechanism expectation: the family changes what villagers SAY on
Help presses during unfinished outings; it changes no cost, no
reward, no schedule. A survival effect, if any, would have to come
through villagers actually completing outings they previously
abandoned mid-conversation — a second-order path, not a lever.

## Merge-tree pre-check (read-only, before the pick)

`git merge-tree aa4f6d54d 203a32775 e44b0206e` (base = the merge's
first parent): exactly TWO changed-in-both sections
(src/js/convo-dialogue.js, src/js/convo-wants.js), both at 0 conflict
markers; ONE added-in-remote section
(scripts/test-favor-debt-help-coherence-20261108.js) at 0 markers;
no merged section, no removed section, no DU entry, 0 conflict
markers in the whole output. Prediction: CLEAN pick.

## Subject (filled after the pick)

- Subject branch: `transplant-9-subject` — (hash to fill)
- Pick result: (clean / conflict-STOP with list)
- Measured family diff verification: (subject-vs-far-end ==
  family-vs-first-parent on src/js + policies + test file)

## Step (filled after the sim)

- STEP id: t9-e44b0206e
- Driver log: evidence/2026-11-13/culpritbisect-a-t9-e44b0206e-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t9-e44b0206e-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t9-e44b0206e/

## Verdict (filled after the sim)

- VERDICT: (CARRIER / AMBIGUOUS / NOT-CARRIER / UNMEASURED)
- Survived: /8 — per-seed days:
- Wave-5: /8, wave-4: /8, regional: /8, national: , table: , wins:
- Median: d, deaths: , standing range:
- Death-cause shares: (to fill from the summary)

## Sense-testing (filled after the sim)

(Transcripts read from the step corpus: do villagers act like
people on the subject — Help presses on unfinished outings naming
real work, repay wants matching the opener — and what changed
versus the far end?)

## Metric review

(To fill after the sim: did the pre-registered metric hold, or
does a metric need revision for the NEXT run?)

## Telemetry

(To fill: deviation check attempted; expected REFUSAL,
recorder-corpus class; baseline NOT rolled.)

## Infrastructure

(To fill: flap windows, safe-commit clobber, rebase/merge notes.)
