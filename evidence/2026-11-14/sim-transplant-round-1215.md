# sim-transplant-round-1215 — coordinator evidence (Loop A, run fleshout-20261114T1215Z)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp, H1 transplant
program. Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md
§3 + evidence/2026-11-13/sim-culpritbisect-a-prereg.md +
hidden_files/family15-grouping-prereg-2026-11-14.md.

## Stale-lock recovery (run start)

The 0936Z run was dead: lock 2h44m old, its trees' heartbeats 55–104 min
stale at check, no registered tree for the lock run_id, coordinator dead.
All its workers verified done/cancelled via subagent.list (run 509b012d):
15A/15B/15C/15D full arms already merged; 15A-narrowed worker DONE with
evidence committed; 15C-narrowed worker CANCELLED mid-step (7/8 corpus,
no prereg/evidence); 15E tree registered only, no work; 15F never
spawned. Lock deleted, claim retired to .DEAD with a note. Loop B live
on winnability chain throughout (1130Z claim: proofrefresh-b16 +
diplo-verb-b) — NOT touched. Master moved once under this run from a
sibling lane (batch ship bump 16f05da86, version files only, zero
overlap); all branches rebased clean, proofs re-run green after every
rebase.

## Arm 1 — sim-transplant15a-narrowed-a ADOPTION (UNMEASURED by conflict)

Adopted from the dead 0936Z run. Worker DONE, evidence committed
43cb9788f (UNMEASURED by pick-2 src/js conflict; family 15A dawn scorer
/ convo wants). Coordinator verified the evidence, rebased clean onto
master 237fb445f (b8af687d1 + 3b7a5c56b), re-ran proofs green on the
rebased tip (test-transplant15a-narrowed.js 155/155,
test-culpritbisect-a.js 116/116), merged ff-only 3b7a5c56b, released,
worktree removed, branch deleted. The ship loop has already pushed it
(master tip 16f05da86 is its version bump). No judged sim ran; the
coordinator decision owed from the arm's evidence stands: the route for
15A given the pick-2 dependency on 15D — see §15D mapping below.

## Arm 2 — sim-transplant15c-narrowed-a COMPLETION (CARRIER 1/8)

Adopted from the dead 0936Z run's cancelled worker: 7/8 corpus in tree
sim-transplant15c52-a (detached HEAD at 12fd9d694), no prereg, no
evidence, fix swap still in place. The completion worker verified the
subject chain from the tree (203a32775..12fd9d694 is exactly OVE-49
7183c942e then OVE-52 12fd9d694, both single-parent), sha256-recorded
the 7 prior files, ran ONLY missing seed 190398 under STEP
t15c-narrowed (149d, village-lost, maxWave 4, 0 errors), restored
standing.js byte-identical to far-end native (sha 75762cb2…, verified
from the far-end blob), deleted 4 untracked instrument duplicates
(byte-identical to master), wrote the prereg as an explicit post-step
RECONSTRUCTION (states plainly it was not written before the step; the
judging bar predates it via round-2115 §3), wrote evidence + proof
(112/112 on the worker's tree), committed on new branch
sim-transplant15c-narrowed-a (4213459e8 + 3 proof-fix commits).

VERDICT: CARRIER — family 15C alone collapses the far end, 1/8 survived
(far end GOOD 4/8 on the same band). Per-seed days 60/75/115/150/106/
128/121/149, median 118d. National 0, table 0, wins 0; regional 7/8
(REGIONAL_INTACT); wave-4 8/8, wave-5 2/8; living wave-4+ veterans 0/8;
tribute ready 0/8; deaths 690 total, combat-heavy. First CARRIER in the
whole H1 transplant program: ten families measured before it, none a
carrier (2b AMBIGUOUS, 4b/5b/9/10b/11/13/14 + 12+14 pair NOT-CARRIER).
Mechanistic suspect is OVE-52's fighterState wiring (OVE-49 is
test-only) — but that must be MEASURED by the split arm, not assumed.
Correction recorded in the prereg: the grouping prereg said OVE-49
touched "green-list.txt + test" — `git show` proves it touches only
the test file.

LANDING (coordinator): the worker committed the evidence on top of the
subject (tree was checked out detached at 12fd9d694). Landing
evidence-only required `git rebase --onto master 12fd9d694` of the 4 arm
commits; the subject is kept reachable on branch
transplant-15c-narrowed-subject at 12fd9d694. That rebase broke 3 proof
legs that assumed the branch sits on the subject — landing-shape
artifacts, not measurement defects; rewritten in place to
landing-shape equivalents (coordinator addendum 9e7bed805, proof
112/0 on the rebased tip). CORRECTION: the addendum commit itself made
the "exactly 4 commits on top of master" leg false (5 commits), so the
final pre-merge re-run read 111/1 — the merge had already landed by the
time the failure was seen. The leg is corrected to a merge-safe form
(the 4 rebased arm commits are ancestors of HEAD) in fix commit
ec0e56f4e; proof re-run 112/0 on the fix branch AND 112/0 on merged
master; culpritbisect 116/116 throughout. Landed commits: f26bad4e8
(evidence), 520ab0df2, 4c682e639, bc679ec4c (proof fixes), 9e7bed805
(addendum), ec0e56f4e (count-leg fix). Worktree released done-merged,
arm branches deleted, subject branch kept. Main tree clean.

Sense-testing (from the arm evidence): transcripts read like people —
voiced foraging/water runs, honest low-trust refusals, villagers
teaching each other European Elder unprompted, veteran kills announced
on camera. One flagged observation, filed as a finding: the Blooded
beat fires twice in the survivor's transcript (d133, d142) yet
end-state `blooded` reads false on all 8 seeds.

## Arm 3 — sim-transplant15e-a (UNMEASURED by conflict)

Fresh arm in the reused 15E tree (clean, stale master tip; ff-only to
237fb445f before starting). Family 15E resume / conversation repair.
STOP at pick 2: pick 1 bb6a301cf applied cleanly (subject branch
transplant-15e-subject at f541e4cd1, exactly the predicted tree); pick 2
7041e1bfb conflicted on exactly the four predicted files
(balance-proof.json + phone-frame-proof.json tooling-only, plus
src/js/conversation.js lines 1730/1731/1754 and
scripts/test-snippet-stage-direction.js modify/delete); cherry-pick
aborted, nothing hand-resolved; pick 3 never attempted; STEP
t15e-resume never ran. Mechanism: pick 2's only game-code change — a
4-line quote check — lives inside `convoSnippetIsStageDirection`, a
function family 14 introduced and the far end never had. The group
depends on family 14's code. Coordinator verified the evidence,
rebased clean onto master ec0e56f4e (48655ec77 + 3a60ceb10; the rebase
stop-at-pick quirk struck once at pick 2 — tree clean, pick unapplied,
`git rebase --continue` sailed through), re-ran proofs green on the
rebased tip (test-transplant15e.js 153/153, test-culpritbisect-a.js
116/116), merged ff-only 3a60ceb10, released, worktree removed, branch
deleted. Subject branch kept.

Coordinator decision owed for 15E: (a) run 15E on far end + 14 (the
12+14 precedent — family 14 is MEASURED, its guard is on master as
7688cb7a4); (b) measure pick 1 alone (subject tip f541e4cd1); or (c)
record unmeasurable-by-conflict. The worker notes pick 3 touches
conversation.js regions that exist at the far end plus
villager-objectives.js, so a pick-1+pick-3 pairing might merge.
DECIDED this run (coordinator, per the 12+14 precedent): next blank
is (a) 15E-on-14 as a fresh arm with its own prereg — the group as a
unit with its prerequisite in place. (b) stays the cheaper fallback.

## Arm 4 — sim-transplant15f-a (UNMEASURED by conflict)

Fresh arm in a fresh tree (registered by the coordinator, ~16 min
registry-lock contention). Family 15F proof refreshes, 7 js=0 picks,
STEP t15f-proofs. STOP at pick 7: picks 1–6 landed live on the subject
branch, each tree byte-identical to its merge-tree prediction (picks
1–4 and 6 conflicted only on the tooling proof JSONs
balance-proof.json / phone-frame-proof.json, each resolved with
`git checkout --ours` + `git add`; pick 5 applied cleanly; all three
tooling files byte-identical to the far end at the subject tip).
Pick 7 (OVE-61, person-trust baseline refresh) conflicted
modify/delete on evidence/2026-11-08/person-trust-prereg.md and
scripts/test-person-trust-20261108.js (DU/DU, stages 1+3 only, no
markers): both files belong to the person-trust writer feature
(side-branch commit 458811411, family 10/PR #4 content) that the far
end never had — the refresh has no base to land on. Cherry-pick
aborted, nothing hand-resolved, no narrowed re-run decided. STEP
t15f-proofs never ran; no judged sim, no corpus. Subject branch
transplant-15f-subject left in place at 4eca36017 (tree 7bee7b39…,
picks 1–6). Coordinator verified the evidence, rebased clean onto
master 3a60ceb10 (d0abb5447 + 28a5cacaf), re-ran proofs green on the
rebased tip (test-transplant15f.js 286/286,
test-culpritbisect-a.js 116/116), merged ff-only 28a5cacaf, released,
worktree removed, branch deleted. Subject branch kept.

Coordinator decision owed for 15F: (a) measure picks 1–6 alone as
their own transplant (subject already holds them at 4eca36017); (b)
land the person-trust feature first, then re-run 15F whole; or (c)
record the group unmeasurable-by-conflict. DECIDED this run: (a) —
the subject already exists, the group is js=0 and likely inert, so it
is a cheap completeness check; it becomes next blank #4 below.

## Coordinator mapping — family 15D pick-1 conflict (decides the 15A route)

The 15A-narrowed evidence owed a route decision for 15A given its
pick-2 dependency on 15D's believed-pantry code. The coordinator mapped
15D's pick-1 conflict with merge-tree predictions (read-only, from the
main tree): pick 1 (03436c1bc, believed pantry/cistern) conflicts on
docs/ONTOLOGY.md + scripts/green-list.txt (tooling) AND
src/js/villager-objectives.js (game code → STOP, as the 15D arm
reported). Convo-wants.js and villager-goals.js merge CLEAN. The
villager-objectives.js conflict is STRUCTURAL, not a small overlap:
the far-end side deleted the very functions the pick edits
(objNeedsEmergencyPick + objRefreshPick and a dozen more hunks) while
the pick adds a +126-line believed-pantry block and edits the same
regions. A narrowed 15D that keeps only the clean hunks would drop the
believed-pantry core — the mechanism itself. DECIDED: no narrowed 15D
arm (the clean subset is mechanism-free; record this so the next run
does not re-attempt it). Family 15D stays UNMEASURED-by-conflict as a
unit. The 15A route therefore cannot be (a) "land 15D first" — 15D
cannot land on the far end as a transplant at all. The 15A route is
(b) measure pick 1 alone: the subject branch
transplant-15a-narrowed-subject already holds OVE-48 at 493d7a975 — a
fresh arm with its own prereg + STEP id. (c) record unmeasurable is
rejected while (b) is untested.

## Wall (this run's judged corpora)

Only 15C ran a judged step. Armed: survived 1/8, national 0, table 0,
wins 0, wave-5 2/8, median 118d. Pooled judged corpora this run: 1/8
survived, 0 national / 0 table / 0 wins. The CARRIER changes what the
wall means: the collapse now has a named carrier (fight-brain
fighterState wiring, pending the split measurement), but national/
table/wins remain 0 on the collapse band and the win still comes only
through default-OFF courtship + seat instruments on other bands.

Telemetry deviation check: REFUSED by the tool (recorder-corpus class,
as for all prior bisect/transplant arms); baseline NOT rolled. No LOUD
lines to investigate.

## Metric review

No metric proved wrong. The binding thresholds judged exactly as
pre-registered (15C: 1/8 → CARRIER). Two process notes: (1) the 15C
prereg reconstruction is honest about its status — the bar predates the
step via the binding prereg, so the verdict stands as judged, not as
re-scored; the reconstruction pattern (missing prereg rebuilt from
binding prereg + corpus records, plainly dated) is the right adoption
shape for a cancelled worker. (2) The count-leg incident: a proof leg
that counts commits on top of master is inherently pre-merge-only and
broke the moment the coordinator addendum became a 5th commit — the
merge-safe ancestor form is the fix, and the final proof run must be
ON THE COMMITTED STATE (the 111/1 was caught by a re-run after the
addendum commit, but the merge had already run in the same command —
sequence the re-run BEFORE the merge next time).

## Infrastructure

- Host write flap: CLEAR all run (flap-watch log ALL-OK throughout;
  load 2–16). No EPERM window struck any write.
- REGISTRY.lock contention is the run's dominant cost: 15F registration
  ~16 min, 15C heartbeat ~12 min, 15E heartbeat ~11.5 min, 15A release
  ~30 min (merge command), 15E release ~4.7 min — all queued, all
  landed. The reaper holds the lock for its whole run; this is the
  known issue, fix needs a Steve nod. No reaper risk materialized
  (heartbeats landed before any 4h line).
- Safe-commit index clobber struck: all 4 15C worker commits, both 15E
  worker commits, and both coordinator addendum/fix commits (staged-as-
  deleted + MM variants) — repaired every time with the documented
  ls-tree -r pipe, commits verified correct first (hash-object ==
  HEAD blob). No work lost.
- Rebase stop-at-pick quirk struck once (15E, pick 2) — recovered with
  the documented verify-unapplied + `git rebase --continue`. The 15C
  --onto rebase was clean; the 15A rebase was clean.
- check.js --quick NOT re-run (zero src/js, zero green-list files
  changed by this run — evidence + proof tests only; the one
  proof-test edit is covered by its own 112/0 + culpritbisect 116/116
  runs on merged master).
- No pushes, no version bumps, no live verification (ship loop owns
  deploys). All arms merged locally, pending ship.

## Next blanks, in order

1. 15C SPLIT (commit-by-commit): OVE-52 alone on the far end (OVE-49
   is test-only) — the carrier's mechanism must be measured, not
   assumed. Fresh arm, own prereg + STEP id.
2. 15E-ON-14: family 15E on far end + family 14's guard (the 12+14
   precedent). Fresh arm, own prereg + STEP id. Fallback: 15E pick-1
   alone (subject tip f541e4cd1).
3. 15A PICK-1 ALONE: OVE-48 on the far end (subject branch
   transplant-15a-narrowed-subject at 493d7a975 already holds it).
   Fresh arm, own prereg + STEP id.
4. 15F PICKS 1–6 ALONE: the six landed picks as their own transplant
   (subject branch transplant-15f-subject at 4eca36017 already holds
   them). Fresh arm, own prereg + STEP id. Pick 7 stays blocked on
   the person-trust feature (family 10 content the far end never had).
5. Family 16 (js=0 merges, only if no carrier explains the collapse —
   a carrier is now identified, so 16 drops to a completeness check
   behind the split).
6. Narrowed 8b (clean-hunks subset) — needs its own prereg +
   coordinator decision.
7. Family 6b + narrowed 7b — proposed, each needs its own prereg +
   coordinator decision.
8. Family 2b AMBIGUOUS stays on the suspect list.
9. Proof refresh round 16 (Loop B, in flight).
10. Headcount-ceiling (Steve-call).
11. Reunion mirror pack in the wild (Steve design call).

scale-onramp stays converging (NOT converged): the first CARRIER is
identified and the collapse now has a named suspect, but the split
measurement is owed, national/table/wins remain 0 on the collapse
band, and the win still comes only through default-OFF instruments.
food-economy stays converging (untouched; parked). Rotation left at 4
(convergence work does not cycle it).
