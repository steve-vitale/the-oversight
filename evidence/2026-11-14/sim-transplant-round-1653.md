# sim-transplant-round-1653 — H1 transplant round, STALE-LOCK RECOVERY + ADOPTION (Loop A, fleshout-20261114T1653Z)

Run: fleshout-20261114T1653Z (Loop A), axis scale-onramp (survival collapse), H1 transplant program.
Claim: hidden_files/lever-claims/fleshout-20261114T1653Z.json (axis scale-onramp; arms adopt-15c-js, adopt-15e-1412, coordinator evidence).
This run ADOPTS the dead run fleshout-20261114T1452Z — it ran no fresh transplant arms of its own. All three 1452Z blanks (#1–#3 from round-1355) are now closed: #1 landed CARRIER, #2 completed UNMEASURED-BY-CONFLICT, #3 verified BAND-INCONCLUSIVE.

## Stale-lock recovery (run start)

Lock fleshout-loop.lock held run_id 2026-11-14T14:52:00Z, created 14:51:59Z — 1h52m old at this run's 16:43Z start (>90min fallback). All three of the dead run's tree heartbeats 47–62min stale (>15min guard): sim-transplant15c-js-a 15:42:19Z, sim-transplant15e-1412-a 15:47:27Z, sim-transplant15a-fresh-a 15:57:18Z. Coordinator agent 4869387e-6820-45da-9992-18e4bc8ea92e not in the active list; its session files last written 16:43:04Z (10s before this run started — the kill/flush, not live work: no merge of 15c/15e followed, no coordinator evidence file existed). No file writes under 15 minutes old in either adopted tree (newest 15c 16:02:53Z, 15e 15:58:23Z). Two of its workers done, one interrupted. DEAD per the body's mechanical guard. Lock deleted, claim fleshout-20261114T1452Z.json retired to .DEAD with a note; this run's lock + claim written before any landing work. Loop B live throughout on winnability chain (1557Z claim: holdpantry-b + cheaptend-b, workers running, heartbeats ~16:31Z) — NOT touched. journey-deepening live (heartbeat 16:40Z) — NOT touched.

State at recovery, all verified from git/branches (never from worker claims alone):
- 15a-fresh: MERGED to master at 16:41:20Z (reflog: merge sim-transplant15a-fresh-a, fast-forward to 723c53571). The dead coordinator's last act.
- 15c-js: worker done, CARRIER 1/8, branch b0f9421a1 UNMERGED, worktree clean.
- 15e-1412: worker INTERRUPTED at 15:58:59Z after stage-1 proof ca6fe04fa; subject at pick-3 tip 312647db0 (tree e6fab899…, exactly the predicted pick-3 tree), worktree clean, checked out on the subject branch.

Pre-flight: main tree clean (`git status --short` empty), disk 41% (`df -h ~`), `worktree-reap.sh` ran clean — nothing removed, 14/16 active, all 14 trees registry-active (several older trees flagged UNCOMMITTED — other runs' live work, reaper correctly refused them).

## Arm 1 — sim-transplant15c-js-a: ADOPT/LAND, CARRIER (tracker blank #1)

Worker (1452Z run) verdict, verified from the branch evidence before landing: **CARRIER — OVE-52's js hunks alone collapse the far end from 4/8 to 1/8** on the matched band (seeds 190391–190398, 150d death-aware). Subject transplant-15c-split-js-subject at d56206f70 (tree 00917347…): far end + OVE-52's four js files only (combat.js +26/−0, fieldFights.js +90/−23, game.js +59/−11, villager-agency.js +172/−0; +347/−34), probe-test refresh and ONTOLOGY hunk dropped per prereg. js-only STEP reproduces the group STEP per-seed-file-for-field (8/8 identical) — the group CARRIER (OVE-49 + OVE-52, 1/8) is carried entirely by OVE-52's game code; OVE-49 contributes nothing (test-only). **OVE-52 (1c1b23482, "wire shared fighterState into both fight brains") IS the carrier of family 15C's share of the collapse.**

Landing (coordinator, this run):
- Rebased branch b0f9421a1 onto master 723c53571 in its worktree: 5/5 picks clean, no quirk, new tip 6786879b2. Tree clean.
- Proof re-run on the rebased tip: 152/153 — one leg failed, a rebase artifact, not a verdict problem: §5 asserted the pre-rebase stage-1 commit 054c493f6 is an ancestor of HEAD. Landing fix (commit a2a1e4c5d, coordinator): re-pointed the leg to the rebased hash 96aedd769 and judged the prereg-before-subject ordering on AUTHOR dates (%at), which rebase preserves (committer dates are the rebase time and would invert the order). Equivalence verified first: `diff` of each commit against its own parent is empty (identical patches), same author date 15:21:57Z, same message. Proof re-run: **153/153 green** on tip a2a1e4c5d.
- Merged ff-only to master (a2a1e4c5d). Verified ancestor. Tree released done-merged, worktree removed, branch deleted. Subject branch transplant-15c-split-js-subject LEFT in place.
- Wall (STEP t15c-split-js, subject leg): survived **1/8** (190394 only), median 121d (analyzer upper-median; conventional 118d), wins 0, national 0, table 0, regional 7/8, village 1/8, wave-5 2/8 (190394, 190397), wave-4 8/8, deaths 690. Far end on the same band: 4/8, median 147d.
- Safe-commit index clobber struck the landing-fix commit (MM on the just-committed file) — repaired via the `ls-tree -r` pipe, verified status empty + diff HEAD empty + hash-object == HEAD blob. Release was slow (REGISTRY.lock queue, ~10.7min for release+remove+branch delete) — the known reaper lock self-contention, still owed a Steve nod.

## Arm 2 — sim-transplant15e-1412-a: ADOPT/COMPLETE + LAND, UNMEASURED-BY-CONFLICT (tracker blank #2)

Adoption worker (this run, agent 89d4323a) completed the interrupted arm. Live pick 4 (4a1c77cf1, OVE-57) attempted on the subject branch: it conflicted on EXACTLY the two files the merge-tree pre-check predicted — scripts/balance-proof.json (tooling) and src/js/villager-objectives.js (game code), same marker lines (balance-proof 3/6/9; villager-objectives 23/25/29 and 957/972/1039). Per the binding tooling-resolution rule the arm STOPPED: cherry-pick aborted, no hand-resolution, the tooling file NOT resolved --ours. Subject verified back at pick-3 tip 312647db0, tree e6fab899…, clean, exactly 4 commits on the far end.

**Verdict: UNMEASURED-BY-CONFLICT, verdict NONE.** No CARRIER / AMBIGUOUS / NOT-CARRIER verdict exists for family 15E on far end + family 14 + family 12. No judged sim ran; STEP t15e-on1412 never ran.

This CONFIRMS the prereg's argument from the live pick, not the prediction: the round-1355 (a2) route — land 14+12 first, then re-run 15E whole — does NOT unblock 15E as a unit. The 15E-on-14 arm proved route (a) (family 14 alone) fails on pick 3's dependency on family 12's widening; this arm proves (a2) fails on pick 4's dependency on Phase 4 villager-objectives.js (the far end's file predates the companionRank / lure-lottery / objCommitGuardOffer form; pick 4's hunks insert into regions that don't exist there). Each route clears the previous block and exposes the next — the group is a chain of origin-line dependencies, not a single missing piece. The conversation.js half of pick 4 merges CLEAN (a trader intro that survived Continue still surfaces); only the villager-objectives.js half blocks. The same Phase 4 dependency may recur in any arm whose picks touch villager-objectives.js past the far end's form.

Landing (coordinator, this run):
- Heartbeated the tree (17:20:51Z, read back) before landing work.
- Rebased branch b8893486d onto master a2a1e4c5d: 3/3 picks clean, new tip b2cac3fcc. Proof re-run on the rebased tip: **284/284 green** (224 stage-1 + 60 stage-2) — no landing fix needed; this proof does not hardcode the pre-rebase stage-1 hash.
- Merged ff-only to master (b2cac3fcc). Verified ancestor. Tree released done-merged, worktree removed, branch deleted. Subject branch transplant-15e-1412-subject LEFT in place at 312647db0 (far end + 14 + 12 + pick 2 + pick 3).
- Safe-commit index clobber struck the worker's stage-2 commit — repaired by the worker, recorded in evidence (commit b8893486d).

## Arm 3 — sim-transplant15a-fresh-a: already merged by the dead run, VERIFIED (tracker blank #3)

No landing work by this run. Master HEAD at recovery was already the arm's tip 723c53571; verified from the evidence file on master: **BAND-INCONCLUSIVE**. Fresh band 190449–190456 is harsher than the collapse band — the far end itself reads 1/8 (STEP t15a-fresh-base, median 109d, wave-5 3/8) against 4/8 on the collapse band, so the subject leg's 0/8 (STEP t15a-fresh-subj, median 104d, wave-5 3/8) is a one-seed difference on a collapsed baseline and is NOT called CARRIER (requires baseline ≥3/8), NOT NOT-CARRIER, NOT AMBIGUOUS-on-this-band. Old-band verdict stands: OVE-48 pick-1 alone AMBIGUOUS 2/8 twice, kept on the suspect list. Field-for-field: the pick moves trajectories on every seed (days/deaths/vetSays identical 0/8) — NOT deterministically inert, unlike 15F; direction consistently worse for the subject (sole baseline survivor dies at 141d with the pick; 190456 falls 150d→96d; 190452 falls 87d→41d) but the pre-registered table forbids calling it CARRIER. A third band calibrating the far end at ≥3/8 is what would discriminate — a coordinator call, not this arm's. National/table/wins 0 on both legs; deaths 657 vs 655; tribute ready 1/8 vs 0/8 (all veterans-short otherwise — the veteran bar stays the binding choke).
- Tree released done-merged by this run, worktree removed, branch deleted (branch was an ancestor of master). Subject branch transplant-15a-narrowed-subject LEFT in place.

## Wall (this run's judged corpora)

- 15C js-only STEP: far end 4/8 → subject 1/8. National 0, table 0, wins 0, wave-5 2/8, median 121d.
- 15A fresh-band STEPs: far end 1/8 → subject 0/8 (BAND-INCONCLUSIVE). National 0, table 0, wins 0, wave-5 3/8 both legs, medians 109d / 104d.
- 15E on 14+12: unmeasured (STOP at pick 4). No survival numbers exist.
- Pooled judged survival: 2/16 armed vs 5/16 far-end baselines. The collapse stands: the carrier is now identified (OVE-52) but no fix has landed, and the veteran bar still chokes every seed that survives (tribute ready 1/8 and 0/8 on the fresh band).

## Telemetry deviation check

Attempted on the 15c per-seed corpus (evidence/2026-11-13/perseed-culpritbisect-a-t15c-split-js/*.json, 8 files) against telemetry-baselines/scale-wall.json: **REFUSED by the tool** — "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs." Same standing refusal as the 1355Z/1430Z/1955Z rounds. Baseline NOT rolled. No LOUD lines to investigate (the refusal is the outcome).

## Metric review

- 15c-js: judged exactly as pre-registered (≤1/8 CARRIER). 1/8 is decisive; no re-run needed. The landing proof-fix changed one leg's referent (rebased hash + author dates) — the leg's intent (stage-1 commit in history, prereg before subject) is preserved and the patch-equivalence was verified, not assumed. No metric was re-scored.
- 15e-1412: the STOP clause fired exactly as pre-registered; the live pick reproduced the merge-tree prediction file-for-file and line-for-line, which validates the pre-check machinery itself (predictions across picks 0–4 were all exact, tree-for-tree). No judged sim, so no threshold was exercised.
- 15a-fresh: the fresh-band decision table worked as designed — a baseline ≤2/8 correctly refused a CARRIER call on a one-seed difference. The band-freshness check held (190449–190456 zero hits in evidence/preregs/tracker; one JSON float-substring artifact, documented class).
- Median convention note (from the 15c evidence, carried forward): the analyzer reports the upper-median (121d); the conventional median is 118d. Next run should adopt the conventional median — a tooling note, not a verdict change.

## Infrastructure

- REGISTRY.lock contention dominant again: the 15c release took ~10.7min (release+remove+branch-delete) queued on the lock; heartbeats took minutes. The reaper's lock self-contention fix is still owed (needs a Steve nod). The reaper itself ran clean (nothing removed, 14/16 active).
- Safe-commit index clobber struck twice this run (15c landing-fix commit, 15e stage-2 commit): repaired via the `ls-tree -r` pipe each time, commits verified correct. (If it strikes the coordinator evidence commit too, the repair is the same pipe; the commit is always correct, only the index lies.)
- Rebase stop-at-pick quirk did NOT strike (both rebases 5/5 and 3/3 clean).
- No EPERM write flap observed this run (all writes clean; the 15e worker noted one ~150s slow index restat on a branch checkout — slow I/O, not a denied write).
- check.js --quick NOT re-run: zero src/js, zero green-list files across all three landings (new evidence + new proof-test files only); both new proof suites re-ran green on their rebased tips (153/153, 284/284). Same standing rationale as round-1355.
- No push, no version bump, no live verification — the ship loop owns deploys.

## Tracker state + next blanks

scale-onramp stays converging (NOT converged): the carrier is identified and SPLIT (OVE-52 alone, 1/8 — family 15C is answered), 15A stays AMBIGUOUS on the old band (fresh band could not discriminate), 15E stays UNMEASURED as a unit (the (a2) route is now proven not to unblock it), and national/table/wins remain 0 on every judged corpus. The directive stands until the tracker records this axis converged on measured evidence. Next blanks, in order: (1) COORDINATOR DECISION OWED — the 15E route: (b) pick 2 alone (subject holds far end + 14 + 12 + pick 2; 15E-alone subject f541e4cd1 already holds pick 2 alone on the bare far end), (c) picks 2+3 (subject at the STOP point holds exactly that), (d) record the group unmeasurable-by-conflict as a unit, or (e) narrowed pick-4 conversation.js-only route (its conversation.js hunk merges clean — untested); (2) 15A third band calibrating the far end at ≥3/8 (a coordinator call — which band, and whether the AMBIGUOUS verdict is worth another band); (3) family 16; (4) narrowed 8b; (5) family 6b + narrowed 7b; (6) family 2b AMBIGUOUS stays on the suspect list; (7) proof refresh round 18 (Loop B, owed after the next manifest change); (8) headcount-ceiling (Steve-call); (9) Reunion mirror pack in the wild (Steve design call). food-economy stays converging (untouched; parked). Rotation left at 4 (convergence work does not cycle it). Claim deleted; lock deleted. Evidence: evidence/2026-11-14/sim-transplant-round-1653.md.
