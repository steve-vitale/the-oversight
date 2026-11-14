# sim-transplant15e-p1-prereg — family 15E PICK-1 ALONE (resume-offer Yes) (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p1-a, branch `sim-transplant15e-p1-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p1-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15E (family 15E = resume / conversation repair, 3 standalone
first-parent commits, pick order oldest first: bb6a301cf →
7041e1bfb → 4a1c77cf1). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics, fix policy) + evidence/2026-11-14/sim-transplant15e-prereg.md
and evidence/2026-11-14/sim-transplant15e.md (the 15E-alone arm's
prereg + evidence: pick identities, first parents, tooling-resolution
rule, merge-tree pre-check convention, pick-2 conflict anatomy, and
the UNMEASURED-BY-CONFLICT outcome). Coordinator decision:
evidence/2026-11-14/sim-transplant-round-1653.md, next blank #1 —
"15E PICK-1 ALONE" (route (b) from the 15E evidence's coordinator
decision owed: measure pick 1 alone as its own transplant; the
subject branch already holds it at f541e4cd1). This prereg is that
arm's. Claim: hidden_files/lever-claims/fleshout-20261114T1736Z.json
(live; this arm named in it).

## Prereg (binding, committed BEFORE running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: ALREADY EXISTS — branch `transplant-15e-subject` at
  f541e4cd1, cut by the 15E-alone arm (live pick 1, clean apply, no
  resolution needed — it touches no tooling file). VERIFIED at run
  start, before any sim, from the branch (not from the prior arm's
  claim): `git log 203a32775..transplant-15e-subject` is exactly one
  commit ("Deliver unfinished thread on resume-offer Yes");
  parent is the far end 203a32775; tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738 — exactly the predicted
  pick-1-resolved tree from the 15E prereg's merge-tree pre-check
  (prediction commit 19e50e1e0); diff vs the far end is exactly 3
  files, +148/-4 (evidence/2026-11-08/story-offer-yes-followthrough.md
  +29/-0, scripts/test-story-offer-yes-20261108.js +73/-0,
  src/js/conversation.js +46/-4); the diff's changed lines are
  identical to bb6a301cf's diff (only blob index hashes and hunk
  line numbers differ — the same +/- lines applied at slightly
  different offsets); subject standing.js is the far-end native
  (sha 75762cb2…), subject policy is the far-end policy (sha
  a7ff5c51…). If the subject does not verify, this arm FAILS LOUDLY
  and stops — it does not rebuild the subject itself. NEVER commit
  anything onto the subject branch. This arm's own branch
  `sim-transplant15e-p1-a` is based on master and holds ONLY
  prereg/proof/evidence commits (evidence-only landing, like the
  15A-pick1 arm). To run the STEP, check the subject out in the
  worktree (via scripts/culpritbisect-step.sh, which checks out
  the commit detached); check the arm branch back out before
  committing evidence.
- Pick measured: pick 1 ONLY, bb6a301cf "Deliver unfinished thread
  on resume-offer Yes". Picks 2 (OVE-33) and 3 (OVE-57) are NOT
  measured by this arm: pick 2 conflicts on src/js/conversation.js
  because it is written against family 14's
  convoSnippetIsStageDirection function (7688cb7a4), which the far
  end never had (15E evidence §"Why pick 2 cannot land on the far
  end"); pick 3 was never attempted by the group arm and is being
  measured by the sibling arm sim-transplant15e-p3conv-a. The
  verdict below is about the resume-offer Yes repair alone.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging PICK 1 alone.
  ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id
  (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
  ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If pick
  1 reads CARRIER, the resume-offer repair alone carries (part of)
  the collapse and the fix policy below decides the next step; if
  NOT-CARRIER, the 15E carrier question moves to the pick-2/pick-3
  routes (which need family 14 / family 12 first — coordinator
  decisions, not this arm's).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: the subject already exists and is verified; there
  is no cherry-pick in this arm, so the tooling-resolution rule
  does not fire here. If the subject verification fails, FAIL
  LOUDLY and stop. If the step reads 2/8, re-run ONCE with a fresh
  STEP id per the bisect rule. Process note carried from
  sim-transplant15a-pick1.md §Metric review: a re-run is vacuous
  under a deterministic harness (same seeds + same code reproduce
  exactly), so the re-run can never move a 2/8 — the rule is
  followed anyway and the outcome recorded as AMBIGUOUS.
- STEP id: t15e-p1 (fresh — do NOT reuse t15e-resume, which
  belongs to the STOPped 15E-alone arm and never ran).
- Fix policy (bisect prereg §Fix policy, binding): no game-code
  change lands from this measurement arm unless the change is a
  DEFECT (not a design trade-off), small (a revert of the culprit
  hunk, or a one-hunk correction), carries its own proof test, and
  restores ≥3/8 on the same band. Otherwise — document only.

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat; resume openers are structural
grammar — a resume opener that asks whether to hear / pick up the
unfinished thread must deliver that thread. No standalone canon
doc covers the pick itself — it is a coherence repair inside the
documented conversation contract (a resume-offer Yes delivers the
thread; a teaser/invitation is not quotable as the thread's
content-memory), not a new system. Nothing here invents canon.

## Pick content (read before the step)

- Pick 1, bb6a301cf "Deliver unfinished thread on resume-offer
  Yes": when a resume opener asks whether to hear / pick up the
  unfinished thread, Yes must deliver that thread — not a generic
  "I see." acknowledgment. Tags the opener's return
  (`resumeOffer: true`, thread id) so startConvo marks the hanging
  genericQ (`c.genericQ.resumeOffer = true`, `resumeTid`), and the
  gq:yn handler follows through to the thread instead of GQ_ACK.
  In plain words: saying Yes to "Want to hear where it left off?"
  now actually continues the old conversation instead of brushing
  it off.
- Pick 1 diff vs its first parent, 3 files:
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4. js=1, pol=0. No pick touches
  src/js/standing.js or scripts/policies.

Mechanism expectation: the pick changes WHAT a Yes answer does
inside one conversation exchange — a dialogue follow-through
repair. It changes no kcal cost, no damage, no armor, no spawn,
no food yield, no spoilage, no wave or table gate number. A
survival effect, if any, would have to come through villagers
finishing threads they started — a third-order behavioral path,
not a lever. Expectation (not a verdict input): NOT-CARRIER is
the likelier read; a CARRIER read would point at resume-offer
coherence itself mattering for survival, which would need a
mechanism follow-up, not an assumption.

## Family identity (verified at run start, before any sim)

- Pick 1: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes" (2026-11-08 21:20 UTC).
  First parent 7688cb7a46367c88c7bb85e976502ddc0d5456f0 (Merge pull
  request #10, snippet-stage-direction-guard — family 14). Diff
  vs first parent, 3 files: evidence/2026-11-08/story-offer-yes-followthrough.md
  +29/-0, scripts/test-story-offer-yes-20261108.js +73/-0,
  src/js/conversation.js +46/-4. js=1, pol=0.
- Subject: branch transplant-15e-subject, tip f541e4cd1, tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738, exactly 1 commit on
  the far end, diff vs far end 3 files +148/-4, no tooling file
  in the commit, standing.js and policy byte-identical to the
  far end.
- Pick 1's first parent 7688cb7a4 is NOT an ancestor of the far
  end (family 14 is not on the far end) — recorded because it is
  the dependency that stops pick 2, not pick 1: pick 1's own
  hunks apply to conversation.js regions that DO exist at the
  far end (merge-tree rc=0, tree f9e9b8b8…).
- No pick touches src/js/standing.js or scripts/policies (empty
  diff on both paths for pick 1).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Merge-tree pre-check (carried from the 15E-alone arm; re-run as proof legs)

- PICK 1 (base = pick's first parent 7688cb7a4, ours = far end
  203a32775, theirs = bb6a301cf): rc=0, CLEAN — no conflict.
  Merged tree f9e9b8b80156e7157793e7ee6a69306edcd5c738.
  Prediction commit 19e50e1e0e48b21094eccc9b139672900afaba21
  (commit-tree of that tree, parent = far end) is the predicted
  pick-1-resolved tree. PREDICTION: cherry-pick applies cleanly.
  The live pick 1 (15E-alone arm) reproduced this tree EXACTLY
  (subject tree f9e9b8b8…), validating the temp-index prediction.
- PICK 2 / PICK 3: NOT measured by this arm. The 15E-alone arm's
  pick-2 prediction (rc=1, four conflicted files including
  src/js/conversation.js) and its live STOP are recorded in
  evidence/2026-11-14/sim-transplant15e.md; this arm claims no
  pick-2/pick-3 conflict status of its own.

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 75 preregs name the band
  (vetphantom, firstparent, merge, reconciled, anchor, survival
  control, mcconfirm, bisect rounds r5–r10, cut confirms, stallcut,
  optb, pairarming, scholarschurn, collapseband3, mergebase,
  origin, and others across 2026-11-11/12/13/14). The band is named
  everywhere because it IS the program's matched band.
- Forbidden/contaminated lists: `grep -rl '190391'
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/convergence-tracker.md
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/`
  — 10 files name the band (convergence-tracker.md, 8 dead
  lever-claim JSONs, 1 live claim = this run's
  fleshout-20261114T1736Z.json), all as the program's matched band
  in run claims / the tracker — NONE as a forbidden or contaminated
  band. No forbidden/contaminated list names it.
- Searched scope: every dated prereg under evidence/ (the 75
  hits above) + the goal hidden_files lists. No fresh band is
  claimed; the reuse is the program design, recorded here so a
  later reader does not mistake the 75 hits for contamination.

## Ordering note (recorded, not hidden)

The subject verification above ran as part of prereg preparation,
before this file was committed — the 15E-alone arm's prereg
likewise records its pre-check results. The binding requirement
is met: this prereg is committed BEFORE any judged sim runs. No
STEP t15e-p1 corpus, summary, or driver log exists. The subject
branch was cut by the 15E-alone arm, not by this arm; this arm
verifies it, never rebuilds it.
