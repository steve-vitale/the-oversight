# sim-winnability-round-2230 — Loop B adoption run (courtship-rework2 PILOT GO + producergate PILOT NO-GO, both LANDED, merged locally pending ship)

**Run:** fleshout-loop-b-20261115T2230Z. **Axis:** winnability chain (re-pointed 2026-11-03; food-economy parked, no new food arm).
**Master at closeout:** 72a6efc99. **Coordinator evidence commit:** (this file).

## Stale-lock recovery

Lock 2005Z was 2h24m old at 22:29Z (created 20:05:00Z). Both of its
worktrees' heartbeats were 21:55:04Z — 34 minutes stale, past the
15-minute guard — and no node/jest process was running. The previous
run is DEAD by the guard (and past the 90-minute fallback). Dead
claim `fleshout-loop-b-20261115T2005Z.json` retired to `.DEAD`; new
lock + claim written for this run. Loop A live on scale-onramp
throughout (2115Z claim: sim-vetparty-a + sim-grecorder-a +
sim-alignstep-a) — NOT touched. The body's re-point queue items stay
disposed as recorded by the 1630Z run (arm-2 toggle CLOSED 2026-11-06,
flee-repair LANDED by Loop A, standing accumulation answered); this run
adopts the 2005Z run's two arms, which were themselves the 1810Z run's
next blanks (1) and (2).

## Arm 1 — sim-courtship-rework2-b adoption (PILOT GO, landed as 682f7354e)

BFS-pathfinding rework of the courtship-deeds lever, re-piloted on
fresh band 100761–100768, 200d, 16/16 configs, anchor e577ef5f8.
Worker's evidence: `evidence/2026-11-15/sim-courtship-rework2-b.md`
(prereg `sim-courtship-rework2-b-prereg.md`).

- G1 GO (16/16 complete, 0 errors, UNCLASSIFIED 0), G2 GO (covenant
  staged **8/8**, all answered 'pact', all sat; zero-move continuation
  pilgrim-days **0** band-wide and 0 on every seed, was 54 on seed
  100646 in round 1; stale drops **0**, was 4; 24/24 pilgrimages end in
  a study within 2 days), G3 GO-QUALIFIED (see below), cost bar PASS
  (starvation **1 vs 5**; median survival **175d vs 150d**, 1.17x).
- Opinion 10 by median day 4.5 (was d16 round 1, d57 control).
  National ever 8/8 vs 1/8, national final 6/8 vs 1/8, survived 3/8
  vs 1/8. Panel `review_required`: national access 0.125 → 0.75,
  deaths per 100 days 56.2 → 49.0 (absolute deaths 74.1 → 86.8 flagged
  `regression_watch`, CI spans 0 — longer exposure, lower daily rate).
- The stall is gone everywhere, not just on average — the per-seed
  stall bar reads 0 on all 8 seeds. The BFS fix (travelBlockage as
  oracle, every step strictly decreases BFS-distance) is the mechanism;
  the greedy never-steps-away guard is removed.
- Downstream gap, named not hidden: wave-5 facing tripled (6/8 vs 2/8)
  while wave-5 kills FELL (7 vs 11). National without wins persists;
  wins 0 everywhere. §14c guardrail trips on 4 seeds (100762, 100763,
  100764, 100768); two are pure exposure, two are real rate increases
  on long national holds — the confirm watches this.
- Sense: pilgrimage fully voiced (24 starts, 24 studied returns, 0
  stale lines); return line now says what happened. One blemish
  remains in engine text (repeated homecoming lines, 65 on seed
  100761) — not this arm's text.

**Proofs on the rebased tip (ce0f28a46):** test-courtship-rework2-b
**59/59**, test-courtship-rework-b **58/58**, test-courtship-b **57/57**,
test-covenant-b **32/33**, test-onlylead-b **29/29**,
test-onlylead2-b **24/25** (known drift, unchanged).

**G3 QUALIFIED (coordinator decision, 1630Z precedent):** the one
covenant failure ("propose attempts are prerequisite refusals in the
smoke window": 51 propose calls, 50 prereq, 1 accepted day 59) is
MASTER DRIFT, proven independent of this arm — the identical test
fails 32/33 on the producergate tree, which contains none of the
courtship branch's files. The tip includes journey-landing r137
(conversation.js), the same RNG-stream-moving class as the 1630Z
drift. No test was edited to go green; the branch is zero `src/js`,
so it cannot change the game; the pilot corpora are unaffected (the
three pilot-judging proofs are 59/59, 58/58, 57/57). Substrate
re-check for test-covenant-b joins the existing
test-courtship-b + test-onlylead2-b item in the next blanks.

**Landing:** 2 commits (b7d6a3dd8 corpora, 682f7354e policy + proof).
Rebased clean onto ce0f28a46; zero `src/js` diff vs master; merged
ff-only from the main tree, exit 0. The confirm band 100621–100636
stays fresh and unspent — the confirm is OWED on this GO, top item
for the next B run.

## Arm 2 — sim-producergate-b adoption (PILOT NO-GO, landed as 72a6efc99)

Gate / expedition-meeting link, piloted on fresh band 100781–100788,
150d, 16 configs, anchor e577ef5f8. Worker's evidence:
`evidence/2026-11-15/sim-producergate-b.md` (prereg
`sim-producergate-b-prereg.md`).

- Frozen bars: field kills per unlocked **0.50 < 1.00** (FAIL);
  FACED-NOT-KILLED **0.50 > 0.20** (FAIL); starvation **6 > 3** (FAIL).
  TB kills 0.75 vs control 0 (vacuous pass), kill:death 1.00 (passes
  on a deaths count that misses field deaths recorded the other way
  round — see the arm evidence §9.1). Overall PILOT NO-GO per the
  frozen prereg; confirm band 100801–100816 NOT spent.
- Mechanism: the seed half works (win-plan counter 10 → 75, plans
  12 → 81, brain commits 57 → 662) but the launch half almost never
  fires as designed — 561 party-waits produced 7 second-companion
  waits and **2 size-3 launches**; the second companion is almost
  never free at Haven. The SEEK still never fired (0 in both legs);
  the gate was consulted about wave 5 only 2–3 times per 8-seed leg.
  Both armed field kills came through the ordinary world-tick path
  (allies joining at the fight, never a launched expedition); across
  all 45 wave-5 field fights in both legs, not one started with
  expedition companions. 22 solo launches are a side effect (heavier
  plan load exhausts the companion pool).
- The lever is REVERTED on this branch: the killed arm leaves no
  trace in game code. Branch diff vs master is instrument + prereg +
  corpora + panel + evidence only, zero `src/js` (verified after both
  rebases; master has no commits on the three game files since the
  anchor, so the revert-to-anchor is byte-identical to master there).
- Proof test-producergate-b **4/4** on the rebased tip, re-run green
  after the second rebase (lever hash 656f4fc3b576).

**Landing:** 3 commits (656f4fc3b lever, c81976c91 instrument/evidence,
72a6efc99 revert). First ff-only merge correctly refused (master had
moved under the courtship merge); rebased, proof re-run 4/4, merged
ff-only, exit 0.

## Wall (this run's judged corpora)

| | courtship control | courtship armed | producergate control | producergate armed |
|---|---|---|---|---|
| National ever | 1/8 | **8/8** | 6/8 final | 6/8 final |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 5 ever | 2/8 | **6/8** | 5/8 unlocked | 4/8 unlocked |
| Wave-5 kills | 11 | 7 | 0 (0 field) | 5 (2 field) |
| Median survival | 150d | **175d** | 150d | 150d |
| Starvation | 5 | **1** | 1 | 6 |

## Telemetry deviation check

REFUSED on the courtship recorder corpus (anchorCommit guard, by
design — recorder corpora are compared with sweep-compare tables,
never against a run baseline), same as the 1630Z/1810Z/2015Z runs.
Baseline NOT rolled, no LOUD lines.

## Infrastructure

- Master moved twice under the run (journey-landing r137
  ce0f28a46 before the first rebase; the courtship merge itself
  before the producergate merge). Zero file overlap with either arm.
- Rebase-stop-at-pick quirk struck TWICE on the producergate revert
  pick (once per rebase): the pick listed in both done and todo,
  worktree clean, pick's changes unapplied (verified: the three game
  files still differed from master with the lever present). Recovered
  per the documented procedure (`git rebase --continue` after the
  unapplied check); both rebases completed clean, proofs green after
  each. The courtship rebase was clean first time.
- Merge-exit trap avoided: the producergate ff-only failure was read
  from the bare merge command's own exit, not a `| tail` pipeline
  (the piped exit would have read 0 — the 2015Z lesson).
- Registry-lock contention severe all run (heartbeat calls took
  ~3 min; the reaper holds REGISTRY.lock for its whole scan). Reap at
  run start: 15/16 active, nothing removed (4 LOUD uncommitted-changes
  warnings on other owners' trees — sim-saycap-a, sim-siegedialog-a,
  sim-inffight-ab, journey2-crisis — left alone).
- No write flap this run. No safe-commit index clobber on any commit
  in this run (coordinator evidence commit below is the first
  safe-commit of the run; status checked after).
- check.js --quick NOT re-run (zero `src/js` on either landed branch;
  loop precedent).
- gc warning on the producergate merge (too many unreachable loose
  objects; `.git/gc.log` present) — housekeeping, not this run's.

## Findings backlog

- Creek-tile village (100766 village_0 on an unbridged creek tile,
  unreachable on foot, studyable by proximity) is [open] in
  sim-findings.md — filed by the worker, verified present.
- Pilgrimage-stall item updated by the worker with the REWORK2
  verdict; stays [claimed], NOT [fixed] — [fixed] only if the confirm
  holds the pilot GO.

## Next blanks, in order

1. **Courtship-rework2 CONFIRM** on the reserved band **100621–100636**
   (16 seeds × 2 policies, 200d) — owed on this PILOT GO; top item
   for the next B run. Watch the §14c split (national-held villages
   dying faster per day at wave 4/5) and the walkRefusals counter
   split (BFS-step refusals vs greedy-fallback vetoes).
2. **Gate-reachability instrument** — why `winPlanFightGate` is
   consulted ~2–3 times per 8-seed leg; route launched parties
   through the gate on arrival, or move the party-of-3 + trick-known
   treatment onto the world-tick path where all 45 wave-5 field
   fights actually happen. Kill:death bar must count field-fight
   deaths from encounter rows (§9.1) before any re-test.
3. **Second-companion pool** — widen beyond villagers idle at Haven,
   or make waiting plans do useful work (trick-learning) instead of
   holding indefinitely; cap concurrent expeditions or exempt foragers
   (starvation cost of heavy departures needs a food guard).
4. **Substrate re-check** for test-covenant-b (new drift on
   ce0f28a46) + test-courtship-b + test-onlylead2-b on the new tip
   (proof drift).
5. Answercourt lever landing decision (Steve / main session).
6. Competent seat-taking BUILD (Steve-call).
7. Veterans survivorship (design question).
8. Family 2b AMBIGUOUS (Loop A suspect list).

## Convergence

winnability chain stays **converging** (NOT converged): the covenant
road is proven open (8/8 staged, 8/8 sat, opinion 10 by median day
4.5) with survival now moving the right way (median 175d vs 150d,
3/8 survived vs 1/8), but wins are still 0 everywhere, wave-5 kills
fell while facing tripled, and the gate SEEK — the designed meeting
point for wave-5 killing — has still never fired in any leg.
scale-onramp stays converging (untouched; sibling Loop A). food-economy
stays converging (untouched; parked).
