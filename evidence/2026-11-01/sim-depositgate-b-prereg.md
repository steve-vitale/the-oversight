# sim-depositgate-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1130Z, arm
sim-depositgate-b. Worktree sim-depositgate-b, branch sim-depositgate-b.
Answers backlog item (Loop B round 1030Z next blank #4):
DEPOSITGATE FIRE-EATING VS COMING COLLAPSE, corroborated on seed 51101
(sim-supplyleg-b: surplus eaten at the fire while shelves read full on
days 5, 14, 16–17, then a 3-night scattering on day 25, under competent
policy — the same shape death17549 found under a different policy).

DIAG ONLY: no src/js changes, no policy-default flips, no edits to any
existing policy file or existing script. New files only: this prereg,
the depositgate trace driver, the depositgate analyzer, the proof test,
evidence, censuses/corpora. scripts/sim-harness.js and
scripts/policies/competent.js are REUSED VERBATIM.
Name note: scripts/test-depositgate-b.js ALREADY EXISTS (2026-10-22
DEPOSITGATE adoption proof). It is NOT edited. This arm's proof test is
the new file scripts/test-depositgate-b-census.js.

## Canon note (read first)

docs/CANON.md read. NO canon doc defines DEPOSITGATE as a system — the
mechanism below is read from the code's own comments and ledger
(game.js ~29944–30015 gate + holdback, ~30528 funnel.share ease,
~16828 away.return ease, ~27989/28008 big-haul ease, ~8744 homecoming
keep 2000→6000, hierarchy.js ~1256 tribute waiver), not invented
canon. docs/PRESERVATION.md (food ladder) is adjacent, not the gate.

## Mechanism as read (fixed before judging)

- Gate armed: DEPOSITGATE=1 (sim; browser always on). Gate off:
  DEPOSITGATE=0 (sim control only).
- Gate engaged on a decision iff gate armed AND prodThrottleEngaged():
  pantryFreshDays() > 4 (FRESH days only — preserved/rendered/pemmican
  excluded) AND NOT (hungryStreak >= 3, which stands it down).
- Easing channels, all at the decision, all conserved (eaten, never
  destroyed), no RNG in the easing itself:
  1. funnel.share (villagerMealDay): half the trust-scaled share is
     eaten at the fire; ledger v._depositGate.days[d].shareEased (kcal),
     intake 'depositgate-eased'.
  2. away.return: _depositGateHoldback halves the haul; ledger
     returnEased (COUNT, not kcal), intake 'depositgate-eased'.
  3. ambient.bighaul (big day + routine haul): same holdback; ledger
     bigHaulEased (COUNT, not kcal), intake 'depositgate-eased'.
  4. scholar homecoming keep: KEEP_KCAL 2000 → 6000 when engaged; the
     kept food stays in the pack (donate-able later). NOT in the day
     ledger — counted here only via the gate's own voice line
     ("pantry is bursting past tomorrow"), never kcal-estimated.
  5. tribute waiver: wagons waved home when engaged; ledger
     tributeWaived (kcal WANTED, not food moved — no food moves).
- The ledger is the instrument's primary source; the driver ALSO wraps
  _depositGateHoldback (returns held kcal + kind) and recordHarvestIntake
  (sums 'depositgate-eased' kcal) so eased-fire kcal can be tied to
  recorded eased shares (accounting check, bar (b) below).

## Question

(1) Does fire-eating of eased shares PRECEDE collapse — i.e. do seeds
that scatter/die show eased-fire kcal in the days just before the
collapse, after gate-engaged "full" days? (2) Does the gate's "full"
heuristic fire while a collapse is coming — i.e. are there
gate-engaged days on a FALLING pantry, or gate-engaged days shortly
before a collapse?

## Census (per seed, per lived day, BOTH arms)

Evening snapshot after the policy daily() call: pantryKcal (whole
pantry), pantryFreshDays, pantryDaysEstimate, gateEngaged (evening
_depositGateEngaged() read — read-only, no RNG), hungryStreak
(progState), aliveCount (roster, not dead), ledger day record
(shareEased kcal, returnEased count, bigHaulEased count, tributeWaived
kcal), holdback-wrapper totals (returnEasedKcal, bigHaulEasedKcal),
intake-wrapper total ('depositgate-eased' kcal), homecoming-keep voice
line count, scatter say lines. Morning pantryKcal is also kept, so a
day's pantry change is computable. Collapse day = last lived day of a
seed whose endReason is not 'survived'. Scattering = endReason
'village-lost' OR a say line containing 'scattering'.

## Primary metric

Per seed, armed arm, over its lived window (death-aware, see Horizon):
- easedFireKcal(day) = shareEasedKcal + returnEasedKcal +
  bigHaulEasedKcal (kcal eaten at the fire that day, all channels).
- preCollapse7(seed) = sum of easedFireKcal over the 7 days before the
  collapse day (collapse day excluded), for collapsed seeds only.
- fullWhileFalling(days) = days where evening gateEngaged AND evening
  pantryKcal < previous evening pantryKcal.
- engagedBeforeCollapse(seed) = gate-engaged days within the 14 days
  before the collapse day, for collapsed seeds only.
- Control arm reports the same rows (eased totals must be zero — bar
  (a)) plus days-alive / endReason per seed, so any armed-vs-control
  collapse-timing difference is visible on identical seeds. This is a
  descriptive contrast, NOT a causal claim: one gate cannot be shown
  to cause a collapse from 8 seeds.

## GO threshold (judged exactly against this header)

GO requires ALL of (a)–(c). The substantive verdict (d) may land in
any of its three states; a NOT-SUPPORTED or UNJUDGED verdict is still
GO as measurement (same discipline as supplyleg's "no dominant leg"
being a result, not a failure). KILL at pilot ONLY if (a), (b), or (c)
fails.
(a) INSTRUMENT CONTRAST: control (DEPOSITGATE=0) eased-fire total = 0
    exactly on all 8 pilot seeds; armed (DEPOSITGATE=1) eased-fire
    total > 0 on >= 1 pilot seed.
(b) ACCOUNTING TIE: per seed, |easedIntakeKcalTotal -
    (shareEasedTotal + holdbackKcalTotal)| <= 10 + nEasedEvents, where
    nEasedEvents counts ledger eased days + holdback calls (1 kcal
    rounding per event plus a small constant). Any seed breaching it
    = instrument not honest; KILL.
(c) CENSUS COMPLETE: a per-day row for every lived day on all 8 pilot
    seeds, both arms; no missing ledger day; every row's gateEngaged
    flag present.
(d) VERDICT RULE (fixed now, never after seeing numbers):
    - SUPPORTED iff >= 1 collapsed seed has preCollapse7 > 0 AND >= 1
      fullWhileFalling day exists on any armed seed.
    - NOT-SUPPORTED iff >= 1 seed collapses and no collapsed seed has
      preCollapse7 > 0, OR collapses exist but zero fullWhileFalling
      days exist anywhere (i.e. the gate never fired on a falling
      pantry and never eased just before a collapse).
    - UNJUDGED iff zero pilot seeds collapse (precedence cannot be
      judged without a collapse; the fullWhileFalling count is still
      reported).
    If GO, confirm on 12 fresh seeds (51109–51120, both arms, same
    design); the confirm verdict uses the SAME rule on the combined
    20-seed band, reported alongside the pilot-only verdict.

## Pilot gate (before any confirm spend)

Pilot = the 8 seeds below, competent policy, 30 days, both arms.
STOP (no confirm, report as the result) if any of (a)–(c) above fails.
"No collapse in pilot" is NOT a stop: it resolves to UNJUDGED under
rule (d) and the confirm band still runs.

## Horizon + why

30 days, death-aware: villages that die stop simulating (no fixed
200d; a dead village contributes its days-alive only, flagged, never
padded; +10d tail max is moot — runDays stops at engine ending).
30d matches the supplyleg window that produced seed 51101's shape, so
the corroboration is on the same horizon. A longer window is a NEXT
run's question, not this one's.

## Seeds and policies

Pilot seeds (reuse supplyleg's fresh band): 51101, 51102, 51103, 51104,
51105, 51106, 51107, 51108.
Confirm seeds (fresh, only if GO): 51109–51120.
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Substrate gates (identical to supplyleg, except DEPOSITGATE varies by
arm): COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0; WOODCARRY/WOODWARM/
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1.
Arms: DEPOSITGATE=0 control, DEPOSITGATE=1 armed, identical seeds.

## Balanced panel (§15) — inapplicability declared

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer, scorecard,
and cohort rows; this arm changes NO game code, and its primary metric
is a per-day gate-ledger census, not a panel metric. The DEPOSITGATE
0/1 contrast here is an instrument control (bar (a)), not a lever
comparison under §15. The identical-seed 0-vs-1 table is reported
directly in the evidence file instead.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states. The evidence will say so plainly and will NOT
claim wall movement. What is reported: wave reach (maxWaveUnlocked per
seed), median/max survival (days alive), collapse count, all in-window.

## Sense test (SENSE-TESTING LAW)

Read transcripts end to end for at least every seed that scatters
(armed arm): judge in plain words whether "shelves read full while
villagers starve" reads sensically — what the gate's voice lines say,
what the pantry actually held, and whether the fire-eating lines
rhyme with the collapse that follows. Quote lines in evidence.

## Attribution limits (stated before judging)

- The gate's sensor is FRESH days > 4, not whole-pantry days: a
  "full" reading can coexist with a thin preserved store or a falling
  total pantry. fullWhileFalling uses whole-pantry kcal change, so a
  falling total on a fresh-full day is exactly the mismatch this arm
  hunts — reported, not smoothed.
- Ledger days are keyed by scholar day at decision time; evening
  snapshots read the ledger after daily(); sleep-phase decisions may
  attribute to the next started day. Day attribution may be off by
  one day at most; preCollapse7 uses a 7-day window, so a 1-day slip
  cannot manufacture or erase a positive window alone.
- Homecoming keep kcal is NOT ledgered: it is counted (voice lines),
  never estimated in kcal. Tribute waiver kcal is WANTED kcal, not
  food moved: it is reported separately and NEVER added to
  easedFireKcal.
- Single policy (competent) by design: the question is the gate's
  behavior under competent play. Other policies may gate differently.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
