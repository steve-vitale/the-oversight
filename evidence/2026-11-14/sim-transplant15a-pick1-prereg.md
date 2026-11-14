# sim-transplant15a-pick1-prereg — family 15A PICK-1 ALONE (OVE-48) (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-pick1-a, branch
`sim-transplant15a-pick1-a`, worktree
`~/workspace/worktrees/sim-transplant15a-pick1-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15A (family 15A = dawn scorer / convo wants, 3 standalone
first-parent OVE commits, pick order oldest first: c937de65f →
4594de6b5 → 748cce3b8). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics, fix policy) + evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md
and evidence/2026-11-14/sim-transplant15a-narrowed.md (the narrowed
arm's template + the pick-1 identity and pick-2 conflict anatomy).
Coordinator decision: evidence/2026-11-14/sim-transplant-round-1215.md,
next blank #3 — "15A PICK-1 ALONE: OVE-48 on the far end (subject
branch transplant-15a-narrowed-subject at 493d7a975 already holds
it). Fresh arm, own prereg + STEP id." This prereg is that arm's.

## Prereg (binding, committed BEFORE running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: ALREADY EXISTS — branch `transplant-15a-narrowed-subject`
  at 493d7a975, cut by the narrowed arm (live pick 1, resolved
  tooling-only green-list.txt with `git checkout --ours` +
  `git add`, per the coordinator tooling-resolution rule). VERIFIED
  at run start, before any sim, from the branch (not from the
  narrowed arm's claim): `git log 203a32775..transplant-15a-narrowed-subject`
  is exactly one commit ("OVE-48: convoSelectWant reads dawn
  commitment and top drive"); tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; diff vs the far end is exactly 3 files,
  +320/-3 (docs/ONTOLOGY.md +3/-2,
  scripts/test-convo-dawn-priorities.js +206/-0,
  src/js/convo-wants.js +111/-1); scripts/green-list.txt is NOT in
  the commit and is byte-identical to the far end. If the subject
  does not verify, this arm FAILS LOUDLY and stops — it does not
  rebuild the subject itself. NEVER commit anything onto the
  subject branch. This arm's own branch
  `sim-transplant15a-pick1-a` is based on master and holds ONLY
  prereg/proof/evidence commits (evidence-only landing, like the
  15C-narrowed adoption). To run the STEP, check the subject branch
  out in the worktree; check the arm branch back out before
  committing evidence.
- Pick measured: pick 1 ONLY, c937de65f "OVE-48: convoSelectWant
  reads dawn commitment and top drive". Picks 2 (OVE-50) and 3
  (OVE-51) are NOT measured by this arm: pick 2 conflicts on
  src/js/convo-wants.js because it is written against family 15D's
  believed-pantry code (03436c1bc), which the far end never had (narrowed-arm
  evidence §"Why pick 2 cannot land on the far end"); pick 3 was
  never attempted. The verdict below is about OVE-48 alone.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging PICK 1 alone.
  ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id
  (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
  ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If pick
  1 reads CARRIER, OVE-48 alone carries (part of) the collapse and
  the fix policy below decides the next step; if NOT-CARRIER, the
  15A carrier question moves to the pick-2/pick-3 route (which
  needs 15D first — see the round-1215 mapping: 15D cannot land
  on the far end as a transplant at all, so that route is a
  coordinator decision, not this arm's).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: the subject already exists and is verified; there
  is no cherry-pick in this arm, so the tooling-resolution rule
  does not fire here. If the subject verification fails, FAIL
  LOUDLY and stop. If the step reads 2/8, re-run ONCE with a fresh
  STEP id per the bisect rule.
- STEP id: t15a-pick1 (fresh — do NOT reuse t15a-dawn or
  t15a-narrowed, which belong to the STOPped arms).
- Fix policy (bisect prereg §Fix policy, binding): no game-code
  change lands from this measurement arm unless the change is a
  DEFECT (not a design trade-off), small (a revert of the culprit
  hunk, or a one-hunk correction), carries its own proof test, and
  restores ≥3/8 on the same band. Otherwise — document only.

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers dawn/convo
wants (conversation opens from wants; the dawn decision and the
conversation a villager opens are linked by design — see the
"Context-aware openings" and goal/thread sections). No standalone
canon doc covers OVE-48 itself — the pick is a coherence repair
inside the documented dawn-scorer + conversation-wants contract
(the opener should track the same priorities dawn chose), not a
new system. Nothing here invents canon.

## Pick content (read before the step)

- Pick 1, c937de65f "OVE-48: convoSelectWant reads dawn commitment
  and top drive": `convoDawnPriorities(vid)` reads today's
  vbrain commitment kind + top drive (vgoal) and biases the
  weighted want pick toward the wants that match (DAWN_KIND_WANTS
  / DAWN_DRIVE_WANTS, primary bias 2.0); unfinished-business
  pre-emptors (seeds, repay, pocketed) stay above. In plain words:
  what a villager talks about when you open a conversation now
  follows what dawn already decided they are doing today.
- Pick 1 diff vs its first parent, 4 files: docs/ONTOLOGY.md
  +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1. js=1, pol=0. No pick touches
  src/js/standing.js or scripts/policies.

Mechanism expectation: the pick changes WHICH want a conversation
opens with — dawn coherence in social prioritization. It changes
no kcal cost, no damage, no armor, no spawn, no food yield, no
spoilage, no wave or table gate number. A survival effect, if any,
would have to come through villagers choosing different
conversations — a third-order behavioral path, not a lever. The
weights are biases inside an existing decision, not new gates.
Expectation (not a verdict input): NOT-CARRIER is the likelier
read; a CARRIER read would point at dawn-commitment coherence
itself mattering for survival, which would need a mechanism
follow-up, not an assumption.

## Family identity (verified at run start, before any sim)

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive" (2026-11-08
  22:27 UTC). First parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32
  (single parent — standalone commit, no merge). Diff vs first
  parent, 4 files: docs/ONTOLOGY.md +3/-2,
  scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1. js=1, pol=0.
- Subject: branch transplant-15a-narrowed-subject, tip 493d7a975,
  tree 6d6216e3e414518d2c335829e130e65ec849941b, exactly 1 commit on
  the far end, diff vs far end 3 files +320/-3, green-list.txt NOT
  in the commit, green-list.txt byte-identical to the far end.
- No pick touches src/js/standing.js or scripts/policies (empty
  diff on both paths for pick 1).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Ordering note (recorded, not hidden)

The subject verification above ran as part of prereg preparation,
before this file was committed — the narrowed arm's prereg
likewise records its pre-check results. The binding requirement
is met: this prereg is committed BEFORE any judged sim runs. No
STEP t15a-pick1 corpus, summary, or driver log exists. The
subject branch was cut by the narrowed arm, not by this arm;
this arm verifies it, never rebuilds it.
