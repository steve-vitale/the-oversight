# sim-scale-onramp-round-2025 — COORDINATOR EVIDENCE (run fleshout-20261117T2025Z)

**Run:** fleshout-20261117T2025Z · **Axis:** scale-onramp · **Type:** STALE-LOCK
RECOVERY + ADOPTION CLOSEOUT (1 arm LANDED NO-GO, lever reverted).
**Master at closeout:** cb49f8fab (merged locally, pending ship).

## Run-start closeout

STALE-LOCK RECOVERY: the 1820Z lock was 119 min old and its
sim-profilegate-b tree heartbeat 80 min stale at the guard (19:02Z) — dead
by the 15-min guard and past the 90-min fallback. Lock deleted, 1820Z claim
retired to .DEAD. The 1820Z closeout (commit 1aba45367, tracker review)
had already landed part2target-a (DIAG GO) and recorded profilegate-b as
HELD mid-sweep with a RESUME owed — this run is that resume. Loop B live
on the winnability chain the whole run (1830Z claim; fightallycap-b
heartbeat 5 min at guard) — NOT touched. Pre-flight: main tree clean,
disk 44%, reap ran (10/16 active, no removals).

## Arm sim-profilegate-b (adoption, NO-GO — lever reverted)

Stranded state at adoption: prereg + lever build [needs-eyes] + instrument
committed at tip dfbf915c4 (base eb2d3714f); OFF leg 4/8 seeds uncommitted;
ON/REC/REC0 legs, analysis, panel, evidence all missing. The adoption
worker completed all four legs on the frozen driver, fixed two analyzer
bugs the dead worker never tripped (ReferenceError `onPool is not defined`;
file-count check reading `.length` off a number, so B5 falsely failed and
rec/rec0 counts were vacuous), and judged against the frozen B1–B5 bars.
Full record: evidence/2026-11-17/sim-profilegate-b.md (+ prereg alongside
it); panel profilegate-b-panel.{json,md}; analysis
profilegate-b-analysis.json; corpora perseed-profilegate-b-{off,on,rec,rec0}/
(8 files each).

| Bar | Result |
| --- | --- |
| B1 pool fills | PASS — empty dawns 3/99 (0.030) vs 81/87 (0.931); mean eligible 2.98 vs bar 1.5. Picks ON: forager 50, homebody 43, wanderer 3; replica/real agree 96/96. |
| B2 launches rise | PASS — launched instances 7 vs 3 (bar ≥5 and > OFF); wave-4+ launch events 38 vs 8. |
| B3 cost | FAIL — starvation totals 3 vs 5 and arm-only 3 vs 5 pass, but median survival 116.5 vs bar 118.0 (0.8×147.5), a miss by 1.5 days. Total deaths 786 vs 517 (+52%). Panel agrees: deaths/run 64.6→98.25, `regression_signal`, decision `review_required`. |
| B4 damage (tracked) | 0.0577 pooled (138/2391, 2 meetings) vs launchfunnel's 0.085. 0 launched kills either leg. |
| B5 instrument | PASS on the frozen base — proof 50/50, D1/D2 green both PROFILEGATE states, D2 full-band 0/0 divergences, 8 files/leg, 0 errors. |

**Disposition applied:** lever REVERTED (ea3d3eabe, [needs-eyes] kept).
Net `src/` diff vs master is zero (verified). Instrument + corpora +
analysis + panel + evidence stay — the measurement stands as the record.

**What the numbers mean, in plain words:** opening the companion gate
works as a door — foragers and homebodies now walk with parties, and
launches more than double. But the villages die faster: more parties walk
the road, more villagers die on it, and no launched party kills anything
(the two fought meetings end in flight, dealing ~6% of a monster's
health). The pool is no longer the binding stage. The jam moved
downstream: 12 instances now die at `selected-blocked` (OFF: 0) — a
party is selected at dawn and then blocked from departing. OFF-leg
replication vs poolshape's `vre` leg was EXACT (87 rows, 81 empty,
per-seed 0/0/25/0/37/25/0/0), so base drift moved nothing on this band.

**Sense-testing (from the arm evidence):** forager Quinn Murphy walks
with Yara Haddad day 46 and fights three wave-4 monsters over twelve days
— reads as a person choosing to go. Homebody Jesse Cortez, picked day 78,
stays home with zero fiction lines marking it — the bid reads as a promise
the morning breaks silently. Filed as finding #2499; the selected-blocked
stage as #2498.

## Wall numbers (this run's judged corpora, 16 configs, band 103411–103418)

National standing 1/8 each leg (OFF 103416 at 430; ON 103413 at 340),
national rank 0/8, table 0, wins 0, wave 4 unlocked 8/8, wave 5 unlocked
1/8, median survival 147.5d OFF vs 116.5d ON, villages surviving to 150d
4/8 vs 3/8. The wall did not move: no village reaches national rank, the
table, or a win on either leg.

## Coordinator decisions

1. **Proof-test disposition (the worker's open call).** The rebased
   branch carried a proof test that failed its gate-act check on the new
   base (49/50 pre-revert: seed 103413 plants no plans there — trajectory
   drift from one of the 9 in-between commits, most plausibly the
   fightallycap second-ally landing — diagnosed by the worker, plan system
   verified alive on seed 103411) and its lever-presence checks after the
   NO-GO revert. I did NOT swap the fixture seed (re-scoring) and did NOT
   re-run the arm on the new base (the verdict was measured on the frozen
   base, where the proof was 50/50). Instead I adapted the test to the
   disposition the prereg itself mandates: static checks now assert the
   REVERTED state (src/ diff empty, unguarded profile check present in
   both twins, no profilegateOn() helper); the bid-ON fixture check now
   asserts flag inertness (no launch candidate with PROFILEGATE=1 either);
   the 150d gate-act check is RETIRED with the reason in the header; a
   cross-state flag-inert check (identical 60d trajectories, seed 103411)
   replaces it. Coordinator addendum commit 010353eb4 (post-rebase
   cb49f8fab). Adapted test: **50/50 green on the rebased tip AND on
   merged master**. The verdict stands as measured; the merged test guards
   the instrument + the revert.
2. **Conditional arm 2 (profilegate confirm) NOT spawned.** Arm 1 was
   NO-GO, so there is nothing to confirm; the run was past 80 min elapsed
   at the adoption's close, so no back-to-back round either. The honest
   next step is a lever addressing the cost (selected-blocked, or launched
   party damage), not a seed re-roll to chase the 1.5-day median miss —
   that would be metric shopping, per the arm's metric review.
3. **Telemetry deviation check: REFUSED by design** (same documented
   refusal as recent rounds). The per-seed files carry top-level
   `anchorCommit`, so they are sweep recorder rows, not runs; the script
   refuses recorder-corpus input against a run baseline. Baseline NOT
   rolled. This refusal (exit 2) is the likely source of the one recorded
   exec exit 2 in the worker's run — the worker's handoff does not itemize
   it separately; no other unexplained failure is outstanding (all final
   artifacts were verified by the coordinator: branch state, proof counts,
   worktree cleanliness).

## Infrastructure

- Master moved twice under the run (Loop B's fightallycap-b pilot-GO
  landing db8a289bf; journey-endgame r237 4f360b67f). First ff-only merge
  correctly refused (exit 128, no harm); branch rebased clean 7/7 onto
  4f360b67f, proof re-run 50/50 on the rebased tip, merged ff-only.
  Rebase stop-at-pick quirk did NOT strike this run.
- Safe-commit index clobber hit the coordinator addendum commit (MM
  variant on test-profilegate-b.js: index held the pre-edit blob, worktree
  matched HEAD) — repaired via the ls-tree -r pipe; commit verified
  correct (hash-object == HEAD blob), index repaired before merging.
- `check.js --quick` after the `src/` change: INCOMPLETE (worker's run,
  killed by a 20-min timeout, exit 124, ~330/340 scripts, no summary) —
  recorded as incomplete, never green. The adapted proof test (50/50) is
  the green signal for this arm; the test's own runtime dropped from
  ~10 min to ~75s once the 150d gate-act legs were retired.
- No EPERM flap this run. No game-code change in this arm (src/ diff 0).
- Worktree sim-profilegate-b released done-merged, branch deleted, main
  tree clean at closeout (tip cb49f8fab). Loop B trees/claim/axis untouched
  (Loop B has since opened a fightallycap-confirm arm — visible in the
  closing reap, not touched).

## Findings filed

- #2498 (selected-blocked is the new binding stage) and #2499 (picked
  homebody gets no fiction line), appended to hidden_files/sim-findings.md.
  Finding #2490 (pool empty because of the profile gate) is answered by
  this arm and stays open only as the record of the priced question.

## Next blanks, in order

1. `selected-blocked` classification — what blocks a selected party after
   the pool fills (finding #2498). The next arm needs a skip-reason
   breakdown before any further pool/launch lever is judged.
2. Launched-party damage wall (0.0577 pooled, 0 launched kills) — Loop B's
   fight-ally-cap + recorder-repair work is live in this area; do NOT
   duplicate, coordinate with Loop B.
3. Picked-homebody fiction line (finding #2499) — a voice line when a
   picked companion cannot walk.
4. B3 thin-miss note: a 12–16-seed confirm band could move the median
   either way, but only as a re-measurement behind a cost-addressing
   lever, never as a standalone re-roll.

scale-onramp stays converging (NOT converged): the pool is filled and
launches rise, but wins still come only through default-OFF courtship +
seat instruments, only through the lesser seat, wave 5 still 0 faced by
a launched party, and no launched party has ever killed a wave-4 beast
on any band. The directive stands until the tracker records this axis
converged on measured evidence. food-economy stays converging (parked);
winnability chain stays converging (Loop B live, untouched). Claim
deleted; lock deleted. Evidence: this file.
