# sim-transplant15e-1412 — family 15E on far end + family 14 + family 12 (Loop A, fleshout-20261114T1653Z)

Run: fleshout-20261114T1653Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-1412-a, branch `sim-transplant15e-1412-a`,
worktree `~/workspace/worktrees/sim-transplant15e-1412-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-1412-prereg.md
(committed ca6fe04fa, BEFORE the subject was cut or any judged sim
ran — the pre-check ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15E +
evidence/2026-11-14/sim-transplant15e-on14.md +
evidence/2026-11-14/sim-transplant15e-on14-prereg.md (the 15E-on-14
arm — template for this arm's prereg/proof/evidence shape; pick
identities, first parents, the pick-2 conflict anatomy, the
tooling-resolution rule; its "Merge-tree pre-check" and
"BRIEF-BASE NOTE" conventions apply here verbatim) +
evidence/2026-11-14/sim-transplant12-14-prereg.md (the 12+14
precedent). Coordinator decision 2:
evidence/2026-11-14/sim-transplant-round-1355.md (next blank #2,
route (a2): land 14+12 first, then re-run 15E whole — the 12+14
pair is MEASURED NOT-CARRIER, its subject exists).

This arm COMPLETES the interrupted arm from the dead run
fleshout-20261114T1452Z. Its coordinator died mid-landing; this
worker's stage-1 work (prereg + stage-1 proof, 224 legs) was
committed and verified by the coordinator from the branch, not
from any claim. The stage-1 live picks (picks 0–3) were applied
by the interrupted arm and re-verified here from the branch
before the pick-4 attempt.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 4)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15E on far end + family 14 + family 12.
  No judged sim ran. Survived/8: unmeasured. Per-seed days:
  unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15e-1412-subject`: cut at the far
  end, pick 0 (family 14) applied at abd8d5754 (tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — exactly the predicted
  pick-0-resolved tree), pick 1 (family 12) applied at 588f054d1
  (tree e78fac42d89e811f6bfce981b7274e5ee3c5c014 — exactly the
  predicted pick-1-resolved tree, and exactly the tree of the
  existing transplant-12-14-subject branch at c8655548f), pick 2
  applied at e0af0163a (tree
  45f64b03acaf50e38af24df375793cba9c666ae6 — exactly the predicted
  pick-2-resolved tree), pick 3 applied at 312647db0 (tree
  e6fab8999c9039e0cf987dccdefcab63a2f154b8 — exactly the predicted
  pick-3-resolved tree, both tooling files resolved --ours).
  Pick 4 was attempted live and conflicted; the cherry-pick was
  aborted. Subject LEFT in place at 312647db0 (far end + 14 + 12
  + pick 2 + pick 3) for reproducibility.
- STEP t15e-on1412: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15e-1412-prereg.md. Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds for
the GROUP as one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
with a fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause per the
coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z):
a pick conflicting ONLY on zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json) resolves EACH such file with
`git checkout --ours` and continues; ANY other conflicted file
(any src/js, data, policy, docs, or test file) STOPS the arm
immediately, no hand-resolution, no narrowed re-run decided by
this arm.

## Family identity (verified at run start, before any sim)

- Pick 0 (family 14): 7688cb7a46367c88c7bb85e976502ddc0d5456f0
  "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard".
  First parent 16cdd690062b3551ff6b4b0d3639770c8af84b5f. Second-parent
  side is 1 commit: e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b "Reject
  stage-direction snippets as resume memory quotes". Diff: 2 files —
  scripts/test-snippet-stage-direction.js +21/-0 (new),
  src/js/conversation.js +12/-0.
- Pick 1 (family 12): ac119e4ed27b2aa66131929795a4d3d0f381900b
  "Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726".
  First parent aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0. Second-parent
  side is 1 commit: 3015beec0aefd3a3db394b73c362c2af9f4c2f84 "Reject
  residual silence/meta resume memory quotes". Diff: 2 files, +73/-5 —
  scripts/test-snippet-stage-direction.js +55/-2 (edited),
  src/js/conversation.js +18/-3.
- Pick 2: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (family 14). Diff: 3 files —
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4.
- Pick 3: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33: refresh
  stale quick proofs and fix outside-Muse fails". First parent
  c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212 (Merge pull request #28,
  dialog-recap-teach-35a9 — family 3). Diff: 12 files —
  evidence/2026-11-08/neutral-ove33-master-quick.json.gz (binary),
  evidence/2026-11-08/phone-ove33-frame-736-r1.json +2585/-0,
  evidence/2026-11-08/phone-ove33-frame-844-r1.json +2686/-0,
  scripts/balance-proof.json +2/-2,
  scripts/godpath/test-mobile-combat-cadence.js +4/-0,
  scripts/godpath/test-occupation-panels.js +1/-1,
  scripts/godpath/test-time-save-crashes.js +3/-2,
  scripts/phone-frame-proof.json +6/-6,
  scripts/test-establishment-r20-fixes-20261020.js +3/-0,
  scripts/test-snippet-stage-direction.js +4/-0,
  src/js/conversation.js +4/-0, sw.js +1/-0.
- Pick 4: 4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 "OVE-57: triage
  tip quick-check after bond dawn". First parent
  134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc (OVE-54: record PR URL in
  companionScore evidence — family 15B). Diff: 4 files —
  evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz (binary),
  scripts/balance-proof.json +2/-2,
  src/js/conversation.js +21/-2,
  src/js/villager-objectives.js +21/-2.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: 7688cb7a4 (family 14) → ac119e4ed
  (family 12) → bb6a301cf → 7041e1bfb → 4a1c77cf1 (15E picks at
  first-parent positions 10 / 24 / 42 of 51; family 14 precedes
  family 12 precedes all three 15E picks on the origin line).
- Sequence dependencies: family 14 IS an ancestor of family 12's
  first parent aa5d9ef92; family 14 IS an ancestor of pick 2's
  first parent (it IS pick 2's first parent) and of pick 3's first
  parent c32ff6fa8; family 12 IS an ancestor of pick 3's first
  parent; pick 2 IS an ancestor of pick 3's first parent; pick 3
  IS an ancestor of pick 4's first parent 134a3d0ab. Family 14 and
  family 12 are NOT ancestors of the far end. The 12+14 pair is
  MEASURED NOT-CARRIER (subject transplant-12-14-subject at
  c8655548f, tree e78fac42… — the same tree this arm's pick-1
  prediction produces).
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live picks (the STOP)

- PICK 0 merge-tree prediction (base = pick's first parent
  16cdd69006, ours = far end 203a32775, theirs = 7688cb7a4):
  rc=0, CLEAN — no conflict. Merged tree
  bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the tree the
  12+14 prereg predicted. Prediction commit
  d632a89b1369dc970b6b2fb2966b17d331eaa292 (commit-tree of that
  tree, parent = far end). PREDICTION: cherry-pick -m 1 applies
  cleanly.
- PICK 1 merge-tree prediction (base = pick's first parent
  aa5d9ef92, ours = predicted pick-0 commit d632a89b, theirs =
  ac119e4ed): rc=0, CLEAN — no conflict. Merged tree
  e78fac42d89e811f6bfce981b7274e5ee3c5c014 — EXACTLY the tree the
  12+14 prereg predicted, and EXACTLY the tree of the existing
  transplant-12-14-subject branch (c8655548f). Prediction commit
  4566f962837d83464c918c513206deb6b54349ad (commit-tree of that
  tree, parent = predicted pick-0 commit) is the predicted
  pick-1-resolved tree. Its diff vs the pick-0 tree is exactly
  family 12 (2 files, +73/-5). PREDICTION: cherry-pick -m 1
  applies cleanly.
- PICK 2 merge-tree prediction (base = pick's first parent
  7688cb7a4, ours = predicted pick-1 commit 4566f962, theirs =
  bb6a301cf): rc=0, CLEAN — no conflict. Merged tree
  45f64b03acaf50e38af24df375793cba9c666ae6. Prediction commit
  6f389c109888b13f72246271adb48b41f0b0d791 (commit-tree of that
  tree, parent = predicted pick-1 commit) is the predicted
  pick-2-resolved tree. Its diff vs the pick-1 tree is exactly
  pick 2 (3 files, +148/-4). PREDICTION: cherry-pick applies
  cleanly.
- PICK 3 merge-tree prediction (base = pick's first parent
  c32ff6fa8, ours = predicted pick-2 commit 6f389c10, theirs =
  7041e1bfb): rc=1, tree
  9f0ee83bbc349c07ca16811689236df66836f144, conflicted files
  EXACTLY TWO — scripts/balance-proof.json,
  scripts/phone-frame-proof.json — BOTH zero-src-reader tooling
  files. PREDICTION: CONFLICT, tooling-only → resolve EACH with
  `git checkout --ours` and continue the cherry-pick (the
  coordinator tooling-resolution rule). Conflict markers in the
  merged tree: balance-proof.json lines 3/6/9;
  phone-frame-proof.json lines 7/15/23 and 81/91/101.
  PICK-3-RESOLVED TREE (constructed during prereg preparation
  via a temp index: the conflicted tree with both tooling files
  set to their OURS blobs from the pick-2 tree — balance-proof
  d0c6a42ff2395a49672f235f0218a3f969619dee, phone-frame-proof
  b06910148b2bb567ca3941b2ac3245872f74f632 — i.e. exactly what
  `git checkout --ours` on both files produces during the live
  cherry-pick): e6fab8999c9039e0cf987dccdefcab63a2f154b8.
  Prediction commit a7180fc9a6482feec46d0bfae4a2b82b617dda9e
  (commit-tree of that tree, parent = predicted pick-2 commit)
  is the predicted pick-3-resolved tree. Its diff vs the pick-2
  tree is exactly pick 3 MINUS the two tooling files (10 files:
  the .gz binary, both phone-frame receipts, 3 godpath tests,
  test-snippet +4, conversation.js +4, sw.js +1).
- PICK 4 merge-tree prediction (base = pick's first parent
  134a3d0ab, ours = predicted pick-3-resolved commit a7180fc9,
  theirs = 4a1c77cf1): rc=1, tree
  627f198ea6376f82ea7042ef4081e298b8c9a4b3, conflicted files
  EXACTLY TWO — scripts/balance-proof.json (tooling) and
  src/js/villager-objectives.js (GAME CODE). PREDICTION:
  CONFLICT, game-code included → STOP at pick 4 (the last pick).
  The tooling file alone would resolve --ours, but
  villager-objectives.js stops the arm under the rule.
  src/js/conversation.js merges CLEAN on this pick (pick 4's
  conversation.js hunk applies fine on the 12+14+15E-picks
  tree). Conflict markers in the merged tree:
  balance-proof.json lines 3/6/9; villager-objectives.js lines
  23/25/29 and 957/972/1039. See §Pick-4 mechanism for why the
  villager-objectives.js hunk cannot land.
- LIVE PICK 0 (subject branch `transplant-15e-1412-subject`, cut
  at the far end): `git cherry-pick -m 1 7688cb7a4` rc=0, clean.
  Result: commit abd8d5754 "Merge pull request #10 from
  steve-vitale/cursor/snippet-stage-direction-guard", 2 files
  +33, tree bc52919e73e6449e93ab2b64497eb25138d9ee90 — EXACTLY the
  predicted pick-0-resolved tree.
- LIVE PICK 1: `git cherry-pick -m 1 ac119e4ed` rc=0, clean.
  Result: commit 588f054d1 "Merge pull request #25 from
  steve-vitale/cursor/dialog-residual-sampler-f726", 2 files
  +73/-5, tree e78fac42d89e811f6bfce981b7274e5ee3c5c014 — EXACTLY
  the predicted pick-1-resolved tree (and exactly the tree of
  the existing transplant-12-14-subject branch).
- LIVE PICK 2: `git cherry-pick bb6a301cf` rc=0, clean. Result:
  commit e0af0163a "Deliver unfinished thread on resume-offer
  Yes", 3 files +148/-4, tree
  45f64b03acaf50e38af24df375793cba9c666ae6 — EXACTLY the predicted
  pick-2-resolved tree. Subject diff vs far end at this point:
  conversation.js +73/-4, test-snippet-stage-direction.js +76,
  test-story-offer-yes-20261108.js +73,
  story-offer-yes-followthrough.md +29.
- LIVE PICK 3: `git cherry-pick 7041e1bfb` rc=1, tooling-only
  conflict on scripts/balance-proof.json and
  scripts/phone-frame-proof.json. Each file resolved with
  `git checkout --ours` (far-end version kept byte-identical)
  and the cherry-pick continued. Result: commit 312647db0
  "OVE-33: refresh stale quick proofs and fix outside-Muse
  fails", tree e6fab8999c9039e0cf987dccdefcab63a2f154b8 —
  EXACTLY the predicted pick-3-resolved tree. Its diff vs the
  pick-2 tree is exactly pick 3 MINUS the two tooling files
  (10 files). Both resolved tooling files are byte-identical to
  the far end (balance-proof blob d0c6a42f, phone-frame-proof
  blob b0691014, on both the subject and the far end).
- LIVE PICK 4: `git cherry-pick 4a1c77cf1` rc=1. Output:
  "Auto-merging scripts/balance-proof.json", "CONFLICT
  (content): Merge conflict in scripts/balance-proof.json",
  "Auto-merging src/js/conversation.js", "Auto-merging
  src/js/villager-objectives.js", "CONFLICT (content): Merge
  conflict in src/js/villager-objectives.js". Status at
  conflict: A evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz,
  UU scripts/balance-proof.json,
  M src/js/conversation.js,
  UU src/js/villager-objectives.js. Conflict markers:
  scripts/balance-proof.json lines 3/6/9;
  src/js/villager-objectives.js lines 23/25/29 and 957/972/1039.
  The live pick reproduces the merge-tree prediction EXACTLY
  (same two files, same marker lines). Per the tooling-resolution
  rule the arm STOPPED: the cherry-pick was aborted
  (`git cherry-pick --abort`, rc=0), no file was hand-resolved,
  the tooling file was NOT resolved --ours (the pick also
  conflicts on src/js/villager-objectives.js), no narrowed
  re-run was decided.
- Recovery after the abort: HEAD back on
  transplant-15e-1412-subject at 312647db0, tree
  e6fab8999c9039e0cf987dccdefcab63a2f154b8, tracked tree clean, no
  CHERRY_PICK_HEAD, exactly 4 commits on top of the far end.
  The subject branch is LEFT in place at 312647db0 (far end +
  14 + 12 + pick 2 + pick 3) for reproducibility. The arm branch
  was then checked back out (sim-transplant15e-1412-a at
  ca6fe04fa, clean).
- Resolutions recorded (file, pick, method): pick 3 —
  scripts/balance-proof.json, `git checkout --ours` (far-end
  version kept byte-identical); pick 3 —
  scripts/phone-frame-proof.json, `git checkout --ours`
  (far-end version kept byte-identical). Pick 4 — NONE: neither
  file resolved by any method (the tooling file was NOT resolved
  --ours, because the pick also conflicts on
  src/js/villager-objectives.js and the rule stops the arm on
  any non-tooling conflicted file). Picks 0–2 applied cleanly
  (no resolution needed — none touches a tooling file).

## Why pick 4 cannot land (plain words + mechanism)

Pick 4 (OVE-57) is two small repairs. Its conversation.js half —
a trader introduction that survived Continue stays deferred
(`c.tradeIntroDeferred = true` at close) and must still surface
once the next opener has spoken (queueTraderIntro rework) — merges
CLEAN on the 14+12 tree: the live pick auto-merged conversation.js
with no conflict. Its villager-objectives.js half — the rally-guard
path skips the invite lottery so it draws no new RNG
(`rally-volunteer` decision, commit via objCommitGuardOffer) — is
written against the origin-line file at its first parent
134a3d0ab, which carries the VILLAGER-BRAIN Phase 4 form of
`objAskCompanion`: ranked candidates via companionRank, the
npcInviteDecision lure lottery, and objCommitGuardOffer (5 hits).
The far end's file is a different, older form: 0 hits for
objCommitGuardOffer, and its guard path directly writes the
companion's objective (`co2.kind = 'GUARD'; co2.purpose =
'guard'; …` — the direct-write form Phase 4's no-cross-write
replaced). Base→ours on this file is 26 hunks across the whole
file (header API list, objRefreshPick / objDangerBelief /
objResourceBelief / objRallyFreshRaid seams, the whole
objAskCompanion region). Pick 4's two hunks both fail against our
side: the header-comment hunk rewrites rally_guard /
companion_no_cross_write lines our side doesn't have (ours carries
the older "no new RNG draws, so games without a fresh raid are
bit-identical to base" rally_guard line and no
companion_no_cross_write line), and the rally-guard code hunk
inserts into the `offerBase` / ranked-candidate region that
doesn't exist in our form (live conflict region 2 spans lines
957–1039: ours side is the direct-write guard block, theirs side
is the companionRank + offerBase + lure-lottery block). In short:
pick 4 depends on origin-line Phase 4 villager-objectives.js
content the far end never had — a genuine code dependency, not a
tooling adjacency. No resolution of balance-proof.json would help.

SENSE-TESTING NOTE (read the pick-4 hunks, not just the counts):
the conversation.js half reads as a sensible person would expect —
a trader who was about to introduce themselves before you saved
doesn't lose their turn, and the deferred intro surfaces once the
new opener has spoken (stage ≥ 1) instead of waiting for a whole
new engagement arc to finish. The villager-objectives.js half is
also sensible on its own terms — a villager volunteering as guard
on a raid warning commits directly instead of rolling dice — but
it is written for the Phase 4 companion machinery (ranked
candidates, lure lottery, self-commit) that the far end's file
predates. The block is a missing dependency, not a dialogue
defect: nothing in the pick reads wrong, it just cannot be placed
on this tree.

## What this means (plain words)

Family 15E is the resume / conversation-repair group: saying Yes
to "Want to hear where it left off?" now actually continues the old
conversation instead of brushing it off; quoted speech stops being
mistaken for stage direction in resume openers; a trader who was
about to introduce themselves before you saved doesn't lose their
turn; a villager volunteering as guard doesn't roll dice to decide
it. The first three steps landed cleanly on the far end + 14 + 12
exactly as predicted — the guard, its widening, the resume-offer
repair, and the OVE-33 quote check all transplant fine, and the
temp-index predictions were validated by the live picks
tree-for-tree, including the tooling-only pick-3 resolution. But
the last 15E commit cannot be placed at all, because it is written
against a newer version of the villager-objectives file that the
far end never had — a version that comes from the VILLAGER-BRAIN
Phase 4 work on the origin line, which this arm did not pick.
Whether the group carries any of the collapse is still UNKNOWN:
four of its five pieces (plus the two prerequisite families) sit
on the far end, and no sim ran. The group stays unmeasured and
stays on the suspect list until the coordinator decides the route.

This CONFIRMS the prereg's argument, from the live pick rather
than the prediction: the (a2) route decided in round-1355 — land
14+12 first, then re-run 15E whole — does NOT unblock 15E as a unit.
The 15E-on-14 arm proved the (a) route (family 14
alone) fails on pick 3's dependency on family 12's widening; this
arm proves the (a2) route (14+12) fails on pick 4's dependency on
Phase 4 villager-objectives.js. Each route clears the previous
block and exposes the next one — the group is a chain of
origin-line dependencies, not a single missing piece.

## Coordinator decision owed

The route for family 15E given that the round-1355 (a2) route
(land 14+12 first, then re-run 15E whole) does NOT unblock it as
a unit. Candidate shapes (the arm decides none of these): (b)
measure pick 2 alone — the subject branch holds far end + 14 +
12 + pick 2 at the STOP point (and the 15E-alone subject
transplant-15e-subject at f541e4cd1 already holds pick 2 alone
on the bare far end); (c) measure picks 2+3 (both apply cleanly
on 14+12 — the subject at the STOP point holds exactly that,
plus the tooling-resolved pick 3); (d) record the group
unmeasurable-by-conflict as a unit; (e) a narrowed pick-4
conversation.js-only route (its conversation.js hunk merges
clean — untested, coordinator's call). Note for the decision:
the pick-4 conflict is a genuine code dependency (on Phase 4
villager-objectives.js), not a tooling adjacency — the
tooling-resolution rule correctly stopped the arm, and no
resolution of balance-proof.json would have helped. The same
Phase 4 dependency may recur in any arm whose picks touch
villager-objectives.js past the far end's form.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  The flap-watch log was not re-read by this adoption worker
  (the arm is a short completion; the coordinator's heartbeat
  at 16:54Z is the last recorded one). No write failure occurred
  at any step (prereg/proof reads, pick-4 attempt, abort,
  evidence, proof append all wrote cleanly). One write-adjacent
  incident: `git checkout sim-transplant15e-1412-a` (subject →
  arm branch) took ~150s of CPU before completing — a slow
  index restat, not a denied write; the checkout itself
  succeeded and the tree verified clean afterwards. No data
  lost.
- REGISTRY LOCK CONTENTION: none observed by this worker (no
  heartbeat run — the coordinator heartbeated the tree at
  16:54Z before handing the arm over; the run finished within
  the hour, so no reaper risk).
- SAFE-COMMIT INDEX CLOBBER: (recorded after the final commit —
  see below; none struck the stage-1 prereg commit per the
  coordinator's handoff).
- No runtime restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: NOT RUN — no corpus exists to check
  (no judged sim ran; recorder-corpus class would refuse it
  anyway, same as all prior bisect/transplant arms). Baseline NOT
  rolled.

## Metric review

No metric proved wrong — no metric was exercised. The primary
(survived/8, group thresholds fresh per 2115 §3) never got a
reading because the subject could not be completed. The
tooling-resolution rule worked as designed: the merge-tree
predictions named both conflicted files and the exact marker
lines for the pick-4 STOP, and the live pick reproduced the
prediction exactly (same two files, same marker lines 3/6/9 and
23/25/29 + 957/972/1039), and the arm stopped without
hand-resolving anything. Two process notes for future arms: (1)
a pick's merge-tree prediction must be built on the TRUE
preceding tree — the pick-4 prediction rebuilt on the
pick-3-resolved tree (not the bare far end) is what exposed the
Phase 4 dependency; a prediction built on the bare far end
would have shown the same files but for the wrong reason. (2)
The merge-tree OID depends on the refs AS SPELLED: full 40-char
hashes in every invocation, as the 15E prereg records — the proof
asserts the trees its own full-hash invocations produce (here
bc52919e…, e78fac42…, 45f64b03…, e6fab899…, 627f198e…).
Wall numbers: unmeasured — no sim ran, so there are no national
/ table / wins / wave 4–5 unlock / median-survival numbers from
this arm. The far-end baseline (GOOD 4/8) is unchanged.

## Proof

- scripts/test-transplant15e-1412.js — stage 1: 224 passed, 0
  failed (committed with the prereg, ca6fe04fa); stage 2: 284
  passed, 0 failed total (live picks 0–3 tree equality, pick-3
  tooling --ours resolution, pick-4 STOP outcome, evidence
  records).
- scripts/test-culpritbisect-a.js — 116 legs (not re-run by this
  adoption worker; the step tooling was untouched and no judged
  sim ran — the step script is named, not executed, by this arm).
