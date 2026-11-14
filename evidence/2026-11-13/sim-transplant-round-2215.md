# H1 transplant round — families 2, 3, 2b (run fleshout-20261113T2215Z, Loop A)

Run: fleshout-20261113T2215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, families 2 + 3 + 2b (follow-up to the
DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE call, evidence/2026-11-13/
sim-scale-onramp-round-2115.md §3). Loop B live throughout on
winnability chain (proofrefresh-b12, transplant-raid-b, rageloop-b,
retribution-b) — not touched. All three arms LANDED, merged locally
pending ship. No pushes, no version bumps, no live verification (ship
loop owns deploys).

## Prereg (binding, from round-2115 §3 — same for all three arms)

- Base: far end 203a32775 (GOOD 4/8 on the bisect band), roster-check
  standing fix swapped in for every step (fix f8fda4295a99; native
  restored byte-identical, sha-verified). Base is the far end, never
  current master.
- Seeds: 190391–190398. Horizon: 150d death-aware. Policy: competent
  verbatim own-policy per step. Driver mechanics reused
  (scripts/culpritbisect-step.sh + culpritbisect-driver-20261113.js +
  analyzer). Subject on a scratch branch, LEFT in place, never
  committed to the arm branch. Cherry-pick `-m 1 <merge>`; on ANY
  conflict STOP, no hand-resolve of game code.
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id, 2/8 again → AMBIGUOUS (NOT-CARRIER for
  ordering, kept on suspect list); ≥3/8 NOT-CARRIER.
- Telemetry: recorder-corpus class — deviation-check refusal recorded,
  baseline never rolled (see §Telemetry).

## Arm 1 — family 2: UNMEASURED (conflict-STOP)

Branch sim-transplant2-a, LANDED 63650b80d (worker tip d652d2d6,
rebased onto 9d9fcb1af; proof re-run green on rebased branch).
Evidence: evidence/2026-11-13/sim-transplant2.md.
Proof: scripts/test-transplant2.js 40/40 + test-culpritbisect-a.js
116/116.

Merge 7ddcdfff9 (PR #6 raid-danger-heard-c0a3, js=4 pol=0 — table
reading CONFIRMED by the worker). Cherry-pick conflicted on exactly
one file: scripts/green-list.txt (UU, lines 916–924, 3 markers — both
sides appended different test-list entries). All four src/js files
applied cleanly; the two files the far end lacked added cleanly.
Merge-tree pre-check reproduced the single conflict exactly. No
subject, no sim, no survival number. Subject branch
transplant-2-subject left at the far end (no subject commit).

## Arm 2 — family 3: UNMEASURED (conflict-STOP)

Branch sim-transplant3-a, LANDED d004a6750 (worker tip 2989a5b3f,
rebased onto 62eab26e7; proof re-run green on rebased branch).
Evidence: evidence/2026-11-13/sim-transplant3.md.
Proof: scripts/test-transplant3.js 58/58 + test-culpritbisect-a.js
116/116.

Merge c32ff6fa8 (PR #28 dialog-recap-teach-35a9, js=3 pol=0 — table
reading CONFIRMED). Cherry-pick conflicted on exactly one file, one
hunk: src/js/conversation.js (live lines 1166–1231). The family
inserts convoResumeOwnsSitting between convoHasLiveUnfinished and
convoUnfinishedEngageLine — none of the three methods exists at the
far end. Family 1's missing-substrate wall in miniature (methods, not
a whole file). The other 8 family files applied cleanly. No subject,
no sim, no survival number. Subject branch transplant-3-subject left
at the far end (no subject commit). The family is dialogue/coherence
only (recap-hammer tightening + resume-ownership) — no survival,
combat, or wave mechanics — so the unmeasurability costs the program
little.

METHOD CORRECTION (from this arm, verified): the merge-tree pre-check
must use the merge's FIRST PARENT as its base, not the merge-base
d229b58f5. `cherry-pick -m 1` uses the first parent as its base; the
worker's pre-check with base d229b58f5 predicted the right file but
the wrong hunk, while re-running merge-tree with base b41bd6300
reproduces the live conflict exactly. All future transplant arms:
dry-run with base = the merge's first parent.

## Arm 3 — family 2b: AMBIGUOUS 2/8 twice (MEASURED)

Branch sim-transplant2b-a, LANDED cb43286ea (worker tip 58f9df9e7,
rebased twice — onto 5f83ca93d, then onto 14072de13 after a failed
ff-only race; proof re-run green after each rebase).
Evidence: evidence/2026-11-13/sim-transplant2b.md.
Proof: scripts/test-transplant2b.js 65/65 + test-culpritbisect-a.js
116/116. Corpora committed by coordinator addendum (summaries +
driver logs + 16 per-seed files, 22 files total in the merge).

Narrowed prereg (new family definition, decided by this coordinator
on the worker's recommendation): family 2 re-run with ONLY
scripts/green-list.txt resolved by union — 2 ours lines
(pellet-boost, pellet-q4) + 4 theirs lines (person-trust,
raid-danger-heard, win-rallyguard, retarget-gossip), no deletions.
Verified first that only scripts/check.js reads green-list.txt and
zero src/js files do. Subject's src/js diff is byte-identical to the
family diff (+71/−62); green-list +4 vs the family's +3 is the sole
difference. No game code hand-resolved. Subject commit
385a9f7b61ad (parent: far end 203a32775), branch
transplant-2b-subject left in place.

Numbers (STEP t2b-7ddcdfff9 and re-run t2b-7ddcdfff9r — per-seed, wall,
and death-cause data BYTE-IDENTICAL between the two runs; the
deterministic driver on an identical subject makes the re-run a
stability check, not fresh evidence):
- survived 2/8 → AMBIGUOUS (treated as NOT-CARRIER for ordering,
  kept on the suspect list). Far end 4/8, merge 1/8: the family pulls
  the far end down but does not collapse it to the merge's level.
- median 123d (far end 150d); wave-5 1/8, wave-4 8/8; national 0,
  table 0, wins 0; deaths 694 (far end 629); standing 175–450;
  blooded 2/8; instrument errors 0.
- Per-seed: 190391 survived 150d (wave 5, standing 450), 190392
  survived 150d; the other six lost on days 58–139. Death causes led
  by villager combat 257, expedition 203, combat 112, the wild 80;
  starvation 2.
- Sense note (from the arm evidence): seed 190391, lost day 86 at
  standing 199 on the far end, survived to 150d at standing 450 with
  real Producer fights (Reunion, Algorithm, Cancellation) under the
  subject — yet still only regional, no table, no win. Lulwa's
  on-camera Callback/Redactor kills (days 28/35) didn't survive her,
  so the living-veteran bar still read 0 at day 150.

## Wall (this run's judged corpora)

Only family 2b produced a judged corpus (families 2 and 3 stopped
before any sim): survived 2/8, national 0, table 0, wins 0, wave-5
1/8, wave-4 8/8, median 123d. The collapse is still unlocated: no
family reads CARRIER, and 3 of the 4 cherry-pick attempts in this
program (families 1, 2, 3) are unmeasurable on divergence — the
transplant method itself is hitting the wall, not just the families.
The narrowed-family route (2b) is the one that measured.

## Metric review

Pre-registered metric (survived/8, thresholds above) judged all three
arms; no re-scoring. The AMBIGUOUS re-run rule functioned as designed
(2/8 → re-run → 2/8 again → AMBIGUOUS), but the re-run's
byte-identical output shows the rule's second read adds stability
confirmation, not independent evidence — a future prereg should say
so explicitly. The 2/8 reading is one step below the far end's 4/8
and one above the merge's 1/8: the family is a partial contributor at
most, and the "AMBIGUOUS = NOT-CARRIER for ordering" treatment stands.

## Telemetry

Deviation check run by the coordinator on the t2b summary (it did NOT
refuse this time, despite the recorder-corpus prereg note): 3 LOUD
lines — national baseline 12 -> current 0, table 16 -> 0, wins 16 ->
0. INVESTIGATED, all three explained: the scale-wall baseline is a
WINSEAT (seat-driven) corpus while the t2b corpus is a pre-seat
recorder substrate (competent own-policy, no seat/courtship drive),
and the tool reads top-level national/wins paths the per-seed
recorder summary does not carry — the same regime + field-shape
artifact documented in the 1955Z/2115Z/2215Z runs. Baseline NOT
rolled. No real bug indicated: the summary's per-seed rows agree
(scaleRank regional, won False on all 8).

## Infrastructure

- Host write flap (EPERM errno=1) active intermittently all run:
  killed THREE worktree registrations (REG1 checkout file-write
  failures; REG2 ref-write failure; REG2 retry checkout failures)
  before clear windows let both trees register (~40 min to get two
  trees). Flap-watch watcher died in the 23:37Z runtime restart (log
  frozen 23:37:12Z, no process); coordinator probed ref writes
  directly thereafter. A 23:29–23:34Z stretch failed every .git ref
  write while plain writes passed.
- Reaper lock contention: the family-2 release queued ~12 min behind
  two concurrent reaper runs + the main-chat reaperguard registration;
  the reaper guard itself (flock -n + skip counter, alert at 3)
  LANDED on master during this run as 5f83ca93d.
- Safe-commit index clobber struck EVERY commit this run (all three
  workers' commits + both coordinator corpus commits — staged-deleted
  / MM variants); repaired each time with the documented
  `git ls-tree -r HEAD | git update-index --add --index-info` pipe,
  verified (status empty, diff HEAD empty, hash-object matches
  ls-tree). Second corpus commit also hit the safe-commit directory
  limitation (dirs rejected — "Unable to add ... to database");
  per-seed files committed with expanded file lists.
- Rebase stop-at-pick quirk struck the 2b rebase (pick 58f9df9e7 in
  BOTH done and todo, tree clean); recovered per the documented
  recipe (verified unapplied via `git diff HEAD <pick> -- <files>`
  non-empty, then `git rebase --continue` — sailed through).
- Failed ff-only merge race: HEAD moved under the 2b merge
  (journey-establishment r136 landed 14072de13 mid-merge, exit 128,
  "Diverging branches"); main tree stayed CLEAN (status empty — the
  failure was at the diverging check, before any worktree update, so
  the AGENTS.md dirty-tree repair was NOT needed); rebased onto
  14072de13 and merged clean in one call (HEAD read + merge together).
- Master moved 4 times under the run (batch ship bump 249da4729,
  journey-landing r130 addendum 62eab26e7, reaper guard 5f83ca93d,
  journey-establishment r136 14072de13). MEMORY.md and AGENTS.md were
  edited by other sessions mid-run (memory compaction; ff-merge
  lesson) — noted, never touched by this run.

## Next blanks, in order

1. H1 transplant families 4–16 in table order (round-2115 §3).
   Family 4 next: c0a85b17e (forager-deed merge, js=3 — contains TWO
   sub-families, person-trust side + forager-deed side; split it if
   it reads CARRIER). Family 5: abb3c2db2 (garden-measurement,
   pol=3 — first POLICY family; the prereg's policy mechanics need
   checking before that arm).
2. Family 2b AMBIGUOUS stays on the suspect list (NOT-CARRIER for
   ordering). A 2/8 family is a partial contributor, not an
   exoneration — revisit if no full carrier emerges.
3. METHOD QUESTION for the next coordinator (not decided here): 3 of
   4 cherry-picks are unmeasurable on divergence. If families 4+
   also conflict, the program needs a narrowed-family or alternate-
   base variant as its standard route — the 2b union precedent shows
   narrowing works when the conflict is confined to non-game files,
   but the conversation.js case (family 3) is game code and cannot
   be unioned away.
4. Proof refresh round 13 (Loop B's item, owed on 249da4729 — the
   version-bump staleness finding in sim-findings.md).
5. Headcount-ceiling (Steve-call); Reunion mirror pack in the wild
   (Steve design call).

scale-onramp stays converging (NOT converged): the first measured
transplant verdict is AMBIGUOUS, no carrier is identified, and
national/table/wins remain 0 on the collapse band. The directive
stands until the tracker records this axis converged on measured
evidence. food-economy stays converging (untouched; parked).
Rotation left at 4 (convergence work does not cycle it).
Claim fleshout-20261113T2215Z deleted at closeout; lock deleted.
