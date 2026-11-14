# sim-transplant-round-2115 — H1 transplant, 15A third band + family 16 (Loop A, fleshout-20261114T2115Z)

Run: fleshout-20261114T2115Z (Loop A), axis scale-onramp, H1 transplant
program. Program: "2015Z next blanks #2 (15A third band) and #3
(family 16) in order, plus the blank-#1 coordinator decision (15E
pick-3 objectives-half route)". Claim:
hidden_files/lever-claims/fleshout-20261114T2115Z.json — retired to
.DEAD at closeout (see the .DEAD.note beside it). Loop B live on
winnability chain throughout (2130Z answercourt adoption; its
proof-refresh-b18 round landed on master mid-run, 6c4332a73) — NOT
touched. Master moved once under the run besides this run's own
landings (Loop B proof-refresh-b18, zero overlap both times).

## Coordinator decision — blank #1: 15E pick-3 objectives-half route (DECIDED)

The 15E pick-3 (4a1c77cf1 OVE-57) villager-objectives.js half — the
rally-guard lottery skip (~19 lines in objAskCompanion: rallyOnly
volunteers commit via objCommitGuardOffer with no invite lottery) —
is recorded PERMANENTLY UNMEASURABLE-BY-CONFLICT as a transplant.
The hunk calls objCommitGuardOffer and the npcInviteDecision 'lure'
machinery, which do not exist on the far end in that form (the far
end's file predates the companionRank / lure-lottery /
objCommitGuardOffer form); a re-implementation against the far end's
form would invent Phase 4 machinery, not transplant the origin
commit. The conversation.js half is already measured NOT-CARRIER
(p3conv, 1736Z). The objectives half stays on the suspect list;
re-attempt only if Phase 4 objectives content lands in a form the
far end can take. No arm was spent re-implementing it. This closes
2015Z blank #1 as a decision, not an arm.

## Arm 1 — sim-transplant15a-band3-a: CARRIER (second carrier)

15A pick-1 alone (OVE-48, c937de65f, "convoSelectWant reads dawn
commitment and top drive"), third band, fresh band 190457–190464
(zero .md hits in evidence/preregs/tracker; non-.md hits are JSON
float-substring artifacts only). Existing subject branch
transplant-15a-narrowed-subject re-verified before any sim (tip
493d7a975, tree 6d6216e3e414518d2c335829e130e65ec849941b) and left
untouched. Base far end 203a32775 with the roster-check standing-fix
swap for every step, native restored byte-identical afterwards
(75762cb2…). 150d death-aware, competent verbatim own-policy per
step. STEPs t15a-band3-base / t15a-band3-subj. Gate-first decision
table from the prereg (baseline ≤2/8 → BAND-INCONCLUSIVE, STOP;
baseline ≥3/8 → judge subject ≤1/8 CARRIER / 2/8 AMBIGUOUS /
≥3/8 NOT-CARRIER). LAST band for 15A pick-1 by coordinator decision
— no fourth band.

- Baseline leg: survived 3/8 (190457, 190459, 190462) — the band
  discriminates, gate in. Median 129d (analyzer upper-median;
  middle two days 124d/129d; conventional 126.5d). Wave-4 7/8,
  wave-5 0/8; national 0, table 0, wins 0; regional 7/8,
  village 1/8. Tribute-ready 0/8 (all veterans-short). Deaths 533
  (wild 54, monster 23, starvation 7, sickness 6, arena 5).
  Blooded end-state 4/8.
- Subject leg: survived 0/8 → CARRIER by the binding table.
  Median 134d (upper-median; middle two 129d/134d; conventional
  131.5d). Wave-4 8/8, wave-5 4/8 (190457, 190458, 190460, 190464).
  National 0, table 0, wins 0. Tribute-ready 0/8 (all
  veterans-short). Deaths 635. Standing range 175–470 (max 470 vs
  baseline max 199). Starvation 0 (no starvation death with the
  pick, against 7 on the baseline). Villages die fighting, not
  hungry.
- Field-for-field: days/deaths/vetSays identical 0/8 — the pick
  moves every trajectory, not inert. The median-days secondary
  moved WITH the verdict in the unexpected direction (subject
  median 134d > baseline 129d while survival fell 3/8 → 0/8) —
  median survival alone would misread this band; the survived/8
  count is the deciding metric, as pre-registered.

This settles 15A pick-1: the old-band AMBIGUOUS 2/8-twice and the
fresh-band-1 BAND-INCONCLUSIVE reads are SUPERSEDED. OVE-48 alone
is the second carrier identified by the program (after OVE-52,
family 15C). Family 15A as a unit stays unmeasured (picks 2–3
stopped on conflict in the narrowed attempt); pick 1 alone is what
carries.

Proof scripts/test-transplant15a-band3.js: stage 1 88/88 (prereg
form, before any judged sim), stage 2 340/340; scripts/
test-culpritbisect-a.js 116/116. Coordinator re-ran both suites
green on BOTH rebased tips (997e68123 onto 007c61738, eaa8e4c85
onto 6c4332a73). Evidence:
evidence/2026-11-14/sim-transplant15a-band3.md (commits
cca618e1e + ff31e72b6, rebased clean twice, merged ff-only
eaa8e4c85). Corpora under
evidence/2026-11-13/perseed-culpritbisect-a-t15a-band3-base/ and
-subj/ (the driver writes to evidence/2026-11-13/, not the brief's
evidence/2026-11-14/perseed- shorthand — recorded in the prereg,
no verdict impact).

Mechanism gap (stated plainly, from the arm evidence): zero
dawn/commitment/want lines in all 473 vetSays lines, and no
convo-want event type in telemetry — this band proves a SURVIVAL
effect, not the conversation behavior itself. The arm recommends
instrumenting conversation opens before deciding on a revert.
Coordinator decision: NO revert in this run. OVE-48 implements a
documented contract (VILLAGER-BRAIN.md Phase 4); the measurement
proves its survival cost, not that the behavior is wrong.
Instrument-first is next blank #1 (arm); the revert-vs-keep call
follows with the mechanism in hand. Options recorded in the arm
evidence: (a) revert + re-measure, (b) keep as the cost of dawn
coherence, (c) instrument first (worker recommendation, adopted).

Sense-testing: Blooded beat-vs-flag disagrees in BOTH directions
again on this band (baseline flag-true with zero beats on 4
seeds; subject 190458 fires 4×, flag false; 190460 fires 11×) —
corroborated, no new backlog entry: backlog #2338 updated with
this band's corroboration. Low-trust refusal repeat did NOT
reproduce here (2 lines total).

## Arm 2 — sim-transplant16-a: UNMEASURED-BY-CONFLICT

Family 16 (js=0 merges #121, #119, #50, #49, #27, #24, #23, #21,
#19, #17, #15, #31; grouping prereg + 2115 §3). Family identity
verified first: all 12 merges js=0, pol=0, none an ancestor of the
far end; pick order origin order (positions 13–51 of 51). Live
pick 1 (b9f64660c, "Merge pull request #15 holdout-tradeoff-007e")
reproduced the merge-tree prediction exactly — CONFLICT
(modify/delete) on evidence/2026-11-08/prove-out-holdout.md
(status DU, stages 1+3 only). The file was added on the origin
side-branch (0ee7b3a39) and modified by side-branch ef7383bc0
(pick 1's second parent), and never existed on the far end — the
accepted-tradeoff write-up has no base to land on. Cherry-pick
aborted, nothing hand-resolved, no narrowed re-run decided by
this arm. Same missing-file-dependency shape as 15F pick 7 —
second sighting in the program. STEP t16-merges never ran; no
judged sim; verdict NONE. Picks 2–12 have no chained prediction
(chain stops at pick 1); far-end-based informational reads are
recorded in the prereg (#17/#21/#23/#27/#31/#49/#50 clean, #119
tooling-only, #19/#24 same missing-file shape, #121 conflicts on
a test file).

Proof scripts/test-transplant16.js 316/316 green on the tip
(coordinator re-ran it); test-culpritbisect-a.js 116/116.
Evidence: evidence/2026-11-14/sim-transplant16.md (commits
b831a3ec7 + 7a746600d + 007c61738, merged ff-only 007c61738).
Subject branch transplant-16-subject left in place at the far end
203a32775 (0 picks applied).

Coordinator decision (the decision owed in the arm evidence):
(c) record the group unmeasurable-by-conflict as a unit. The
pick-1 conflict is a missing-file dependency, not a game-code
question; landing the holdout note first (option b) would
manufacture a base that never existed. Picks 2–12's informational
reads stay on file in the prereg as a clean-subset narrowed
candidate for a future run — not taken now (a further 11-pick
program for js=0 merges is disproportionate). This closes
2015Z blank #3 as a decision.

## Wall (this run's judged corpora, 16 configs)

15A third band: survived 3/8 baseline → 0/8 subject; national 0,
table 0, wins 0, both legs; wave-5 0/8 → 4/8; median 129d → 134d
(upper-median; conventional 126.5d → 131.5d). Family 16:
unmeasured (no corpus). The collapse now has TWO identified
carriers (OVE-52 alone 1/8, OVE-48 alone 0/8 on their bands), but
no fix has landed and the veteran bar still chokes every
surviving seed (tribute-ready 0/8 on both 15A legs).

## Metric review

Pre-registered metrics judged both arms; no re-scoring happened
mid-run. The 15A gate-first table worked as designed (baseline
3/8 discriminated; the subject leg ran only because the gate
passed). The 16 STOP clause fired exactly as pre-registered; the
live pick reproduced the merge-tree prediction file-for-file,
which validates the pre-check machinery itself. No metric
revision is proposed. Two tooling notes carried forward: (1) the
median convention — this round cites the analyzer's upper-median
with the middle-two days and the conventional equivalent, per
the 1653Z note; (2) the STEP driver writes corpora under
evidence/2026-11-13/, not the brief's 2026-11-14 shorthand —
future briefs should name the driver's actual path.

## Telemetry deviation check

Attempted on the 15A baseline per-seed corpus
(evidence/2026-11-13/perseed-culpritbisect-a-t15a-band3-base/*.json)
against telemetry-baselines/scale-wall.json: REFUSED by the tool
— "refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs." Same standing refusal as every transplant round. Baseline
NOT rolled. No LOUD lines to investigate (the refusal is the
outcome).

## Infrastructure

- First ff-only merge of the 15A branch FAILED (diverged base):
  Loop B landed proof-refresh-b18 (6c4332a73, 3 commits, zero
  overlap) between the coordinator's rebase and merge. The
  command's chained `git worktree remove --force` ran anyway and
  removed the worktree, but `git branch -d` correctly refused
  (branch not fully merged) — the branch survived at 997e68123.
  Recovery per the isolation skill: re-registered under a FRESH
  slug (sim-transplant15a-band3-land), checked out the kept
  branch inside, heartbeated immediately, rebased onto 6c4332a73
  clean (2/2), proof re-run green (340/340 + 116/116), merged
  ff-only eaa8e4c85. Lesson for the next coordinator: never chain
  worktree removal after a merge in the same command — merge
  first, verify, then release/remove as separate steps. The old
  registry entry for sim-transplant15a-band3-a was already gone
  when the release was attempted ("not registered") — verified
  absent, nothing stale left.
- REGISTRY.lock queue: the recovery registration took ~11 min
  queued (the reaper holds the lock 9–14 min per run; fix still
  owed, needs a Steve nod). The 16 release took ~3 min queued.
- Safe-commit index clobber struck both workers' commits (both
  arms) — repaired via the ls-tree -r pipe each time, commits
  verified correct. No clobber on the coordinator evidence commit
  (check after committing; repair the same way if it strikes).
- No EPERM write flap this run. No service restart.
- check.js --quick NOT re-run (zero src/js, zero green-list
  files; both proof suites green on rebased tips; loop
  precedent). No push, no version bump, no live verification —
  the ship loop owns deploys.

scale-onramp stays converging (NOT converged): TWO carriers are
now identified and measured (OVE-52 1/8, OVE-48 0/8), family 16
is recorded unmeasurable-by-conflict as a unit, and the 15E
pick-3 objectives half is decided permanently
unmeasurable-by-conflict as a transplant — but no fix has landed
and national/table/wins remain 0 on every judged corpus.
food-economy stays converging (untouched; parked). Next blanks,
in order: (1) OVE-48 fix decision — instrument conversation
opens first (arm), then revert-vs-keep with the mechanism in
hand; (2) narrowed 8b (coordinator decision, own prereg); (3)
family 6b + narrowed 7b; (4) family 2b AMBIGUOUS stays on the
suspect list; (5) headcount-ceiling (Steve-call); (6) Reunion
mirror pack in the wild (Steve design call). Proof refresh round
18 is DONE (Loop B, 6c4332a73) — off the list. Rotation left at 4
(convergence work does not cycle it). Claim deleted; lock
deleted. Evidence: evidence/2026-11-14/sim-transplant-round-2115.md
(this file).
