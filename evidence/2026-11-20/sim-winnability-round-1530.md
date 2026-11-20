# Loop B winnability round 1530Z — closeout (adoption)

Run: `fleshout-loop-b-20261120T1530Z`, Loop B, axis **winnability chain**
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Base master `057bfa60f` (journey-social-life r256).
Adopts `fleshout-loop-b-20261120T1430Z` (flap-blocked stand-down; same
blanks, no work done). Claim `fleshout-loop-b-20261120T1530Z.json`,
arms `sim-strikeband-b` + `sim-targetless-b`.

Closeout adopted: the coordinator's release step was interrupted
(`interrupted_without_durable_result` on `worktree-release.sh` for
sim-strikeband-b). This adoption verified the release had NOT completed
(registry entry still `active`, worktree + branch still present, branch
fully merged), finished the round record, merged it, then released /
removed / deleted the branch. Lock + claim deleted last by the adoption.

## Arm 1 — sim-strikeband-b: NO-GO (survey — no band designates)

**Verdict: NO-GO.** Three fresh bands screened under the full substrate
(SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1,
ALLYSLOT3=1 env-only), 150d death-aware, competent verbatim policy sha
`150229eda010`: 106211–106218, 106221–106228, 106231–106238 (24 seeds).
Best band 106231–106238: **2 first-fights (floor 6), 2 distinct
strike-fights (floor 4)** — neither bar clears, so no band designates.
Steps 2–3 (counterplay-priced decomposition + ALLYSLOT3-ported run)
NOT RUN — blocked, not skipped. The ALLYSLOT3 port was NOT performed;
`src/` diff on the branch is 0 lines. Evidence-only.

- Launches: **9 / 24 seeds (0.375/seed)** vs 40 / 32 (1.25/seed) on the
  dmgsurvey survey. First-fights 3 / 24. 13/24 seeds launch nothing.
  431 `v4departs` rows → 9 launches (2.1%). Binding funnel stages:
  plan-churned-before-dawn (band 1) and candidate-not-bid (bands 2–3).
- The strike bar never bound: all 3 first-fights struck (mDealt 59 /
  135 / 123); 0 counterplay fights in 24 seeds. The pool floor bound.
- **Finding #2627 — THE LAUNCH DROUGHT** (filed): launch rate collapsed
  ~3× against the dmgsurvey survey on the same policy and substrate.
  The only `src/` change between the survey base (`c75503d6f`) and this
  base (`057bfa60f`) is the conversation.js gossip-ask fix, which
  touches no launch code — reads as band variance on a lumpy engine,
  not a substrate regression (unproven: different seed sets).
- **Herald-grind confirmation (#2605 update):** two proven
  grind-then-cleanup sequences — 106233 (577 dealt d115, then a 135
  kill at ~123 entry HP) and 106234 (111 / 123 / 82 / 15 / 11 across
  five meetings). A first-fight's `mDealt/rounds` does not measure a
  fresh full-HP fight; any future decomposition must carry entry HP.
- Repeat-target churn, second sighting: 106237 launches twice in four
  days against network_note, no meeting either time.
- Proofs: `test-strikeband-survey-b.js` **39/39 green**, analyzer
  selftest **22/22 green**. No `check.js` gate was run for this step
  (evidence-only survey instrument; the proof tests are its gate).
- Evidence: `evidence/2026-11-20/sim-strikeband-b.md` (+ survey prereg,
  survey JSON, legs log, 3 perseed corpora dirs). Commit `c82fe0d23`
  on master; shipped in version bump `c82fe0d23-20261120-172444`.

## Arm 2 — sim-targetless-b: NO-GO (guardrail), HELD unmerged

**Verdict: NO-GO — guardrail miss.** Branch `sim-targetless-b` tip
`b7a6c1ac9`, **NOT merged, NOT landed**. The #2626 lever (a plan the
dead-target gate dissolved must not launch targetless on later days)
built exactly per the frozen prereg on top of the ported gate +
same-day suppression: `winPlanDeadTargetDissolved` helper, bid-layer
suppression in `winPlanCands`, commit-point `'hold'` backstop on both
departure paths, flag-gated `DEADTARGETGATE=1`.

- **Cross-day hole CLOSED:** post-block targetless launches **12 → 0**
  armed; dead-target launches **2/6 → 0/4** (primary bar met);
  suppression bar met (4 blocks, 0 same-day re-departures); 106084
  re-launch pair gone.
- **Guardrail MISSED on the same numbers as deadsuppress:** median
  survival 150.5d → **147.5d**, survived **5/8 → 4/8**, starvation
  2 → 1 (improvement does not rescue the other two). The flip moved
  seeds: deadsuppress lost 106081; this arm saves 106081 and loses
  106084 d115 instead. The reshuffle cost moved, not removed.
- The re-seed path works in live play two ways: the companion mirror
  (brian re-seeds onto reunion via nino's hunt, launches d103/d107/
  d111) and lived fights (hannah re-seeds twice after her block). But
  on 106081 the two blocked hunters never fight again and the village
  stalls at standing 199, short of the wave-5 door.
- Proofs: gate **125/125**, diag **22/22**, analyzer selftest **28/28**.
  `node scripts/check.js --quick` did NOT complete (ran 13+ min with
  zero output, starved by sibling load; killed to free the box) — the
  quick check is **owed before any merge** of this branch, not before
  this verdict.
- **Finding #2626 stays OPEN** — the fix is unlanded. **Finding #2637
  NEW** (analyzer blind spot): a launch's `targetWave` reads the
  plan's `needWave`, not the target's wave, so wave-4-target launches
  on needWave-3 plans are invisible to the judged population.
- Balanced panel: `review_required` (no material signal on headline
  metrics; `regression_watch` on community loss 0.375 → 0.5 — the
  same 106084 flip).
- Evidence: `evidence/2026-11-20/sim-targetless-b.md` (+ prereg, both
  corpora, panel) — **on the held branch only**, not on master.

## Wall numbers

Strikeband screen (24 seeds): wins **0**, national **0**, table **0**,
wave 5 reached 6/24, wave 4 reached 23/24, survived 12/24, median
survival 128–151d by band, standing-199 stall **11/24**, starvation
deaths 20 / 1,867 total (1.1% — combat is ~84% of deaths).

Targetless band 106081–106088: wins 0 / national 0 / table 0 both legs;
wave 5 reached 4/8 control / 3/8 armed; wave 4 reached 8/8 both;
standing ≥ 200: 4/8 control / 3/8 armed.

## Gate status (this round)

No `check.js --quick` gate was run for the round as a whole: the
strikeband step is evidence-only (its proof tests are its gate), and
the targetless quick check was starved by sibling load and is owed
before that branch is ever merged. Both arms' targeted proof suites
are green (39/39 + 22/22; 125/125 + 22/22 + 28/28). The strikeband
evidence commit `c82fe0d23` is on master and shipped; the targetless
branch is HELD and unmerged, so no gate failure can ride on it.

## Convergence state

Winnability chain stays **converging (NOT converged)**: the dead-target
gate + same-day suppression + cross-day fix are all built and proven
but fail the same guardrail and stay HELD; the damage question is still
unanswered and its blocker moved upstream (no launch pool at all);
nothing reaches national or the table. Next blanks, in order:

1. **The damage question (#2605)** — coordinator call: screen a 4th
   band (106241–106248, scoped-fresh per the survey protocol) or fix
   the launch engine first (why plans churn / candidates never bid).
   Cheap decisive check owed FIRST: re-run the dmgsurvey instrument on
   ITS designated band (106181–106188) on the current base — if it
   still launches 16 times, the collapse is band variance; if it
   drops, the base moved the launch engine.
2. **#2626 re-seed lever** — rumor-based re-seed or plan expiry as a
   NEW arm with a fresh prereg (not a tighter hold — the cost is in
   changed trajectories, not wasted launches). Guardrail metric-review
   decision owed BEFORE the next legs run: wider band / stated noise
   allowance, decided up front.
3. **Third-ally sense question (#2619).**
4. **Standing-199 stall** (11/24 on this screen; 3/8 on the
   targetless band).

Scale-onramp untouched; sibling Loop A 1315Z closed separately
(round record `sim-scale-onramp-round-1515.md`, commit `b4339a6b6`).

## Infrastructure

- Write flap QUIET for both arms' legs (strikeband: 0 `@@FALLBACK` in
  the legs log; targetless: no flap, no machine restart). The 1430Z
  predecessor stood down flap-blocked; this run adopted its blanks.
- Safe-commit index clobber struck twice on the strikeband branch
  (prereg + instrument commits); repaired both times via the `ls-tree
  -r` pipe, verified by status empty + diff HEAD empty + hash-object
  == HEAD blob per file.
- Master moved under the run (r256 social fix, r149 landing fixes,
  r245 establishment evidence, 1315Z round record, ship bump
  `c82fe0d23-20261120-172444`); the strikeband branch was rebased
  cleanly onto the ship tip by this adoption before the round-record
  commit. No `check.js` gate on the round-record commit (evidence-only
  file; targeted proofs are the arms' own).
- Registry held 17 trees at adoption time (cap 16) — the strikeband
  release below frees the slot; the reaper was run as the final sweep.

## Closeout (adoption)

- Arm 1 evidence commit `c82fe0d23` verified an ancestor of master;
  shipped in bump `c82fe0d23-20261120-172444` (master `4f91af362`).
- Arm 2 HELD unmerged at `b7a6c1ac9`; worktree heartbeated by the
  adoption and left in place.
- This round record committed by the adoption (see commit message);
  worktree `sim-strikeband-b` released done-merged, removed, branch
  deleted; main tree clean.
- Claim retired; `fleshout-loop-b.lock` deleted last, run_id
  `fleshout-loop-b-20261120T1530Z` matched.
