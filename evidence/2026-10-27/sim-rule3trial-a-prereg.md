# sim-rule3trial-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: flesh-out loop, RULE-(3) LIVE-TEST SUBSTRATE SCREEN. Axis:
scale-onramp. Worker: sim-rule3trial-a. Worktree:
`~/workspace/worktrees/sim-rule3trial-a` (branch sim-rule3trial-a).

Canon (read first): docs/CANON.md, then docs/TABLE.md (the Feared
section, §1; the Defiant path definition in src/js/table-defiant.js:
prereq ledger defiance >= 4, minSeat lesser) and docs/MEASUREMENT.md
§§9-12, 14-15. No canon invented. The defiant-door rule under test is
POLICY-SIDE, not canon (see below).

## Background (why this arm exists)

evidence/2026-10-27/sim-fallbackfeared-a.md (pilot 1631Z, seeds
74201-74208) was PILOT-INCONCLUSIVE: defiance was offered on all 6
seated seeds, so rule (1) pre-empted rule (3) every time.
evidence/2026-10-27/sim-defnoffer-screen-a.md (1715Z, bands
74601-74608, 74801-74808, 75701-75708) was SCREEN-NEGATIVE: 9/24
seated, 0 with defiance NOT offered, defiance 5-13 vs threshold 4.
evidence/2026-10-27/sim-lowdef-a.md (1816Z, bands 76101-76108,
76301-76308, 76501-76508) was SCREEN-NEGATIVE: leanlink no-tend
courtship seated 8/24 with 0 no-defiance (defiance 4-13 vs threshold
4); defiance at seating is trial expiries only. The 1816Z next-blank
orders a TRIAL-COMPLETING PLAYER substrate (not another courtship
variant) plus a pre-registered SEAT-RATE FLOOR. That is this arm.
Seeds 74201-74208, 74601-74608, 74801-74808, 75701-75708, 76101-76108,
76301-76308, 76501-76508, and diagnostic 76901-76902 are NOT re-swept
or re-scored here, ever.

## The rule under live test — QUOTED VERBATIM, not paraphrased

From evidence/2026-10-27/sim-fallbackfeared-a-prereg.md
("The rule under live test (from sim-defiantdoor-a, 1315Z)"):

"scripts/policies/tablepaths-defiant.js, rule (3): at a paths-phase offer
(every option id 'path:*'):
  (1) if 'defiant' is offered, take it (rule 'defiant');
  (2) else take the first offered door that is NOT 'feared', in engine order
      (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared';
      that seating is flagged fallback-Feared and was EXCLUDED from the
      defiant GO)."

Live uses of rule (3) so far: ZERO. Unit proof only
(scripts/test-tablepaths-defiant.js, only-feared case: picks
path:feared, rule fallback-feared, dpFallbackFeared flagged).
This arm gives rule (3) its next live chance, on a substrate designed
to produce the trigger condition (a seating with defiance NOT earned).

## The 1816Z next-blank — QUOTED

From evidence/2026-10-27/sim-lowdef-a.md, metric review:

"A future arm wanting a live rule-(3) firing should build a
trial-completing player (a policy that chases active trials: haul hard
and identify fast while a trial is open) and pre-register it as a NEW
substrate with its own det-gate — not another landed courtship."

## Phase 0 — design (UNJUDGED; the candidate and its mechanism)

HOW LEDGER DEFIANCE IS EARNED (from code, per lowdef's prereg):
exactly four channels — (a) trial expiry (progression.js checkTrial:
each expired 3-day audience trial writes ledgerAdd('defiance', 1));
(b) arena defiance acts (one contest node, never picked by the
harness's contestChoose(0)); (c) declining the world feed; (d)
refusing the national scale. The tableseat courtship answers
pendingGlobal with 'feast' and pendingNational with a shape-mapped
pick — never 'decline', never 'refuse' — so (c) and (d) are CLOSED
and (b) is closed by the harness, leaving (a), trial expiry, as the
only open defiance source on this substrate, exactly as on lowdef.

HOW TRIALS COMPLETE (from code, progression.js offerAudienceTrial /
checkTrial / completeTrial): tasks are haul_small (pantry +1,000 kcal
in 3 days, 45% of offers), haul (pantry +3,000 kcal in 3 days, 25%),
identify (3 plants newly to knowledge level 3 in 3 days, 30%; dropped
from the pool when fewer than 3 plants sit below L3). Pantry trials
measure pantry GROWTH net of the village drain (~3,000 kcal/day), so
completing one needs a real haul surplus, not a full pantry. Identify
trials measure plants CROSSING to L3: L1 comes from identification,
L2 from 5 harvests, L3 from 3 tastings at L2 (game.js eatOne) — so a
trial player with L2 plants in the pack can finish one by eating them.

CANDIDATE SUBSTRATE (judged from code): tableseat-nowait (leanlinkrescue
courtship + seat legs, no wait leg) PLUS a trial-chasing player layer:
while a trial is open, after the base daily, the player (pantry trial)
runs one extra forage trip, sorts the haul, and donates ALL
donation-ready pack food (keepKcal 0); (identify trial) runs one extra
forage trip, sorts, then eats level-2 plants from the pack with eatOne
(safe/identified/ready food only; a full scholar eats nothing).
Channels (b), (c), (d) stay closed exactly as on lowdef (same
courtship answers, same harness contest driver, same competent base),
so no new defiance source opens. HONEST CAVEAT, stated before
sweeping: the chase spends real day-parts and the pantry-drain math
still fights haul trials (a 3,000-kcal haul must beat ~3 days of
village drain, not just reach 3,000 gross), and identify trials need
L2 plants already in the pack — the screen tests whether chasing moves
completions enough to seat anyone under the defiance threshold, and a
negative result is a real finding (it would say even a player who
plays FOR trials cannot reliably stay under 4, and the rule-(3) live
test needs a different trigger route, not a stronger chase).

INSTRUMENTS (new, policy-side only, default-OFF, zero src/js):
  - scripts/policies/tableseat-trialchase.js: tableseat-nowait +
    trial chase, env TRIALCHASE=1; off → tableseat-nowait.daily exactly.
    Telemetry ctx prefix tr (trTrials[] with kind/need/expires/outcome
    + ledger deltas, trCompleted/trExpired, chase-day counts).
  - scripts/policies/tablepaths-trial.js: the defiant-door rule
    verbatim (dp counters, dpOffers, dpFallbackFeared) on
    tableseat-trialchase, env TABLETRIALDOOR=1; off →
    tableseat-trialchase.daily exactly. (Structure mirrors
    tablepaths-defiant.js: dp seat legs, then leanlinkrescue.daily,
    then the shared trialChase — never tableseat-trialchase.daily, which
    would re-run the seat legs.)
  - scripts/test-rule3trial-a-sweep.js: paired sweep modeled on
    scripts/test-lowdef-a-sweep.js (same row shape, same incremental
    corpus writer, same G2/G3 reporting), with the new pair; env SEEDS
    / EVID / DAYS; modes default sweep, --detgate (TWO gates, see
    below), --sense (non-measured replay only).
  - scripts/test-rule3trial-a.js: this arm's proof validator
    (G-screen / G-offer / G-leak / qualification / Phase 2 GO inputs /
    trial telemetry), modeled on scripts/test-defnoffer-screen-a.js.
If the screen is negative, the two new policy files are DELETED
before the final commit (killed arms leave no trace); the sweep and
proof scripts stay as the measurement record. If the band qualifies,
the policy files are KEPT as the Phase-2 instrument and the evidence
says so. NEVER edited: tablepaths-defiant.js, tableseat-nowait.js,
leanlinkrescue.js, leanlink.js, competent.js, or any src/js file.

## Substrate and pairing (VERBATIM rule, new substrate)

- Baseline: scripts/policies/tableseat-trialchase.js
  (TABLESEATNOWAIT=1, TRIALCHASE=1, TABLETRIALDOOR unset) — trial
  substrate, first-option doors (tableseat-nowait's seat legs).
- Armed (the observing leg): scripts/policies/tablepaths-trial.js
  (TABLESEATNOWAIT=1, TRIALCHASE=1, TABLETRIALDOOR=1) — same substrate
  + the door rule verbatim above.
- A door never offered is NEVER taken. Branches stay ledger-earned;
  this arm NEVER overrides tableBranch.
- Sweep instrument: scripts/test-rule3trial-a-sweep.js via env only
  (SEEDS / EVID / DAYS). Its verdict field is the DEFIANT verdict and
  is NOT this run's verdict; this run judges manually from its
  per-seed rows + proof script output.
- Own baseline: this band runs its OWN baseline on identical seeds
  (the sweep always runs both legs). NEVER another arm's corpus as
  baseline. The trial substrate is judged on its OWN absolute floor
  below; prior screens' rates are context, not a paired baseline.

## Phase 1 — screen design (BINDING)

One pilot band, one full paired sweep (both legs, 8 seeds, same
instrument, same horizon). No second band, no re-screen, no pooling
across bands — the single band IS the screen.

  Pilot band: 77301-77308

Freshness verified BEFORE sweeping: substring grep of
evidence/2026-10-27/ found ZERO hits for any seed in 77301-77308
(neighbouring used ranges 74201-74208, 74601-74608, 74801-74808,
75701-75708, 76101-76108, 76301-76308, 76501-76508, diagnostic
76901-76902, and all other 2026-10-27 bands avoided; note 77101/77107
do hit under substring grep and were rejected for that reason).

Per seed, recorded from the armed row: entered, offer list (dpOffers:
the paths-phase `offered` array), defiance offered yes/no ('defiant'
present in `offered`), defiance value if present (from the earned
snapshot's defiant `why` string), door taken (enteredPath / doorRule),
won, national ever/final, table, wave reach, median survival, trial
telemetry (trials seen/completed/expired, chase days by kind). Wall
numbers: national / table / wins, wave 4-5 unlocks, median survival
(both legs).

Horizon: 180d death-aware, same as the 1631Z pilot, the 1715Z screen,
and the 1816Z screen (dead villages stop simulating, +10d tail max
per the harness's death-aware stop) — so the pilot is comparable in
shape to the pilots it follows.

### Seat-rate floor / qualifying-band definition (BINDING)

The pilot band QUALIFIES for Phase 2 judgment iff BOTH hold on its
armed leg:
  (a) seated seeds >= 3 (a seated seed = armed row entered = 1), AND
  (b) >= 1 seated seed has defiance NOT offered ('defiant' absent
      from that seed's paths-phase offer list).
The seated minimum (3, not 1) is the 1816Z lesson: a band with 1 seated
seed could never qualify no matter what its one seating showed, and a
floor that can be met by a single lucky seating is not a screen. The
no-defiance minimum (1, not 2) is this arm's deliberate loosening
versus the 1715Z/1816Z bands (which needed 2 across 8 seeds and got 0
three times): on a substrate DESIGNED to produce no-defiance seatings,
one such seating is enough to judge the door rule on — but it must be
paired with a real seat rate (>= 3), or the screen is still starved.
If the band fails either clause, the verdict is SCREEN-NEGATIVE (see
below) — documented, killed with teeth, no live test forced, no
cherry-picking beyond this one pre-registered band, no second band,
no re-screening of any prior seed.

Note the deliberate gap between qualification and the Phase 2 GO:
qualification needs only defiance-not-offered, while a
fallback-feared seating needs ONLY feared offered. A qualifying band
may therefore still yield zero fallback-feared seatings (its
no-defiance seed may take a fallback-non-feared door). That outcome
is PILOT-INCONCLUSIVE in Phase 2, not a failure of the screen.

## Phase 2 — conditional live pilot (qualifying band ONLY)

Judged ONLY on the pilot band's already-run paired corpus (no
re-sweep: the Phase 1 sweep already ran both legs on identical seeds,
so its corpus IS the pilot corpus). Adapted explicitly from the
1631Z prereg shape (same primary, same cost bar):

GO requires ALL of:
  (a) at least 1 fallback-feared seating that enters AND wins
      (armed row entered = 1 AND fallbackFeared = 1 AND won = 1), AND
  (b) the scalemetric cost bar (same as the 1631Z pilot):
      - starvation (death cause matching /starv|hunger/i) armed total
        <= baseline total + 2, AND
      - arm-only starvation deaths <= 2 (seeds where baseline
        starvation = 0 but armed > 0, summed), AND
      - median days armed >= 0.8 x baseline median days.

Verdict branches (no re-score mid-run):
  - QUALIFIED + GO met -> GO (pilot-level; a confirm on a fresh
    separate 12-seed band is a FUTURE run's job, never blended here).
  - QUALIFIED + fallback-feared seatings enter but LOSE -> NO-GO
    with the mechanism named (branch, meters, price, death,
    downgrade — whatever the rows show).
  - QUALIFIED + ZERO fallback-feared seatings -> PILOT-INCONCLUSIVE
    (the screen found no-defiance seats, but rule (3)'s only-feared
    trigger still never fired; do NOT proceed to another band).
  - FLOOR FAILS -> SCREEN-NEGATIVE (the screen, not the rule, is what
    failed; rule (3) stays unit-proven only, exactly as after 1631Z,
    1715Z, and 1816Z; the two new policy files are DELETED before the
    final commit).

## Proof gates (defined BEFORE sweeping)

  - G-det1 (NEW door layer, so it MUST run): --detgate mode, seed
    77301, TABLETRIALDOOR unset: tablepaths-trial days/gameDays ==
    tableseat-trialchase days/gameDays, no dp counters. A mismatch is
    a proof-gate failure (exit 1), not a verdict. Run BEFORE judging
    the band (it uses a door-off config, so it is not a judged sweep).
  - G-det2 (NEW chase layer, so it MUST run): --detgate mode, seed
    77301, TRIALCHASE unset: tableseat-trialchase days/gameDays ==
    tableseat-nowait days/gameDays, no tr counters. A mismatch is a
    proof-gate failure (exit 1), not a verdict. Run BEFORE judging
    the band (trial-off config, not a judged sweep).
  - G-screen: every config produced a row (16/16), no zero-day rows,
    counters objects (ts/dp/tr) present on every row (the sweep's G3,
    reported for the band).
  - G-offer (per seated armed row): the row's defiance-offered flag
    is consistent with its offer list — flagged offered iff 'defiant'
    appears in dpOffers' `offered` array, and vice versa; rule <->
    offer-list consistency per the defnoffer script; earned snapshot
    defiant.earned matches offer inclusion. Checked by
    scripts/test-rule3trial-a.js; a mismatch is a proof-gate failure
    (exit 1), not a verdict.
  - G-leak (as in the defnoffer script): for every seed where NEITHER
    leg entered the table, days and gameDays must be identical
    between legs — the door assignment changes NOTHING except the door
    answered (both legs chase trials identically). A leak is a
    proof-gate failure.
  - G-trial (report, not gate): trial telemetry present on every row;
    trials seen/completed/expired totals per leg reported in the
    evidence. If ZERO trials were seen across all 16 legs, that is
    reported LOUDLY as a vacuous screen (the chase never had anything
    to chase) — it does not retroactively change the floor verdict,
    but it must be named in the evidence.

## SENSE TEST

If a fallback-feared seating occurs in the pilot band, read at least
one seating transcript (the sweep's --sense mode is a NON-MEASURED
replay; it never enters the census) and judge it in plain words in
the evidence: does the seating read as a real choice, not a
mechanical fallback? If none occurs, say explicitly that no seating
transcript is claimed. Additionally, regardless of seating outcome,
run ONE sense replay of a single seed (any pilot seed) and read it
for meaning under the SENSE-TESTING LAW: does the trial chase read as
a player genuinely playing for trials (forage, sort, donate, eat) in
the transcript, or as mechanical noise? Report the reading honestly.

## Balanced panel (MEASUREMENT.md §15)

Attempt scripts/balance-panel.js on this corpus. Prior arms found it
has NO corpus-ingest mode for per-seed corpora (its modes are its own
observer/compare; no per-seed-corpus ingest flag exists). If that is
still true, no panel artifact is produced and none is faked; the
before/after per-seed comparison in the evidence IS the comparison,
as in 1631Z, 1715Z, and 1816Z. Report the attempt honestly either way.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
