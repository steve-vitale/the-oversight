# sim-throttledays-b — PRE-REGISTRATION (written BEFORE any new sweep or analysis, 2026-10-26)

Run: oversight-flesh-out-loop-b, axis food-economy. Analysis arm, measurement
only, zero src/js changes, no default flips. No game-code change of any kind:
this arm ADDS a recorder (scripts/throttledays-capture.js) and a sweep
(scripts/sweep-throttledays-b.js) that reuse scripts/garden-capture.js and
scripts/inflow-capture.js UNCHANGED, and writes a new analyzer
(scripts/analyze-throttledays-b.js). It does NOT modify garden-capture,
inflow-capture, or any recorder the sibling arm owns, and does NOT touch
any file named *stockdoor* or any other agent's work.

## Question (from the brief, in tracker order after the stockSurplus door)
Should the garden production throttle key on drain-days or on need-days?
Throttle garden-branch intent is Steve's call — this arm MEASURES, it does
not decide it. The prior arms fixed the two clocks' meanings:

- sim-freshdays-b (evidence/2026-10-26/sim-freshdays-b.md): pantryFreshDays
  is PANTRY-DRAIN days, not survival days. Seed 9753 day 74: 42,687 counted
  kcal / 170.9 kcal/day pantry drain = 249.8 drain-days, but 2.4 days at
  the roster's full need (9 x 2000). Band median: 16.0 drain-days on
  23,895 kcal, about 1.3 need-days. Out-of-arm observation carried
  forward: because the throttle engages at freshDays > 4, its effective
  kcal threshold swings with burn — on a 171-kcal-burn day it engages on
  a pantry holding under 700 fresh kcal.
- sim-gardenbar-b (evidence/2026-10-26/sim-gardenbar-b.md): on fresh
  seeds 9760-9767, the throttle engaged on 750 of 761 garden resolutions
  (98.6%), NPC sows were 11 across 8 seeds (all on seed 9763), and one
  seed (9766) never sowed at all.

## Band (identical to the gardenbar band, for comparability)
- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Seeds: 9760-9767 (8 seeds; this band IS the pilot — see below).
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed).
- Instrument: garden-capture + inflow-capture reused unchanged, PLUS the
  new throttledays-capture, installed AFTER garden-capture, which wraps
  resolveOneAssignment a further time (it does not modify garden-capture)
  and records, at entry to every garden resolution, the throttle flag
  plus BOTH denominator inputs (see definitions). No Game.state write,
  no RNG consumption, no say/log write; all reads try/catch isolated.
- Canon read: docs/CANON.md + docs/GARDENS.md + docs/PRESERVATION.md
  (ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican
  120d). Cultivation and preservation are covered by canon docs; nothing
  invented. Code read before designing: game.js pantryFreshKcal (15627),
  pantryFreshDays (15641), prodThrottleEngaged (15655).

## Definitions (fixed here, before seeing any new number)

(a) DRAIN-DAYS = Game.pantryFreshDays() at garden-resolution entry,
    exactly as the game computes it: pantryFreshKcal() / mean of the
    positive entries of village burnHistory (rolling 7-day honest net
    from villageEats); if no positive burn history, the fallback is
    pantryFreshKcal() / (roster x 2000); if freshKcal <= 0 it is 0; if
    burn <= 0 it is 999. The recorder stores the reported value AND its
    components (freshKcal, burnMean, burnN, roster) so the value can be
    rebuilt and checked.

(b) NEED-DAYS = Game.pantryFreshKcal() at the same resolution entry /
    (roster x 2000), where roster = (village.roster || []).length at
    entry and the numerator is the SAME freshKcal the drain clock uses.
    Only the denominator changes: measured pantry drain vs the village's
    full daily need. This is the freshdays arm's "fallbackDays" (counted
    / roster x 2000), computed at resolution entry rather than at a
    daily snapshot. A secondary figure, total-pantry need-days
    (total pantry kcal including preserved/rendered, / roster x 2000),
    is reported for context only and is NOT part of the disagreement
    computation. If roster is 0, need-days is null (uncovered).

(c) "PLENTY" thresholds (grounded in a number the prior evidence states):
    - Drain-plenty: drain-days > 4 — the throttle's own bar
      (game.js prodThrottleEngaged: pantryFreshDays() > 4, subject to
      the hungryStreak >= 3 exemption, which the recorder also stores).
    - Need-plenty (primary): need-days > 4 — the SAME 4-day bar on the
      need clock, so the comparison is bar-identical and only the clock
      differs. The freshdays "under 700 fresh kcal" note grounds the
      contrast: 4 drain-days at a 171-kcal burn is ~684 kcal, while
      4 need-days for a 9-person roster is 72,000 kcal.
    - Sensitivity (reported, NOT judged): need-plenty at need-days > 1
      and > 2, showing how the disagreement share moves if "plenty"
      means one or two full days of food instead of four.

## PRIMARY metric (judged ONLY against this)
Unit 1 (resolutions): every garden resolution with throttle flag true.
Unit 2 (days): every (seed, day) with at least one throttle-engaged
resolution; the day's classification comes from its FIRST engaged
resolution of the day (multi-engaged-resolution days are counted, and
a first-vs-any sensitivity is reported).

- Coverage (resolution) = engaged resolutions carrying BOTH denominators
  non-null / all engaged resolutions.
- Coverage (day) = engagement days carrying BOTH denominators on their
  first engaged resolution / all engagement days.
- Disagreement share (primary, on engagement days): the fraction of
  engagement days where the two clocks disagree about "plenty" at the
  primary thresholds — i.e. drain-plenty (true by construction on an
  engaged day, since engagement requires drain-days > 4 and no hunger
  exemption) while need-days <= 4 (need-scarce). The resolution-level
  share is reported alongside. Because drain-plenty is true by
  construction on engaged days, the disagreement share IS the share
  of throttle firings that fired while the village held at most 4
  need-days of fresh food.

GO (a measurement GO, not a design ruling) iff ALL of:
  1. day coverage >= 95%, AND
  2. resolution coverage >= 95%, AND
  3. the disagreement share is reported at the primary thresholds AND
     at the >1 and >2 sensitivity thresholds, with the fallback-day
     share (burn history empty, where drain == need by construction)
     reported separately.
A miss is NO-GO, never re-scored. The disagreement share itself carries
no pass/fail bar: whatever it is, it IS the answer to the design
question, and any keying change is written up as a steve-call item
with the numbers, never recommended as this arm's own ruling.

## Secondary figures (reported, not judged)
- Reverse disagreement: among NON-engaged garden resolutions, the share
  where need-days > 4 while drain-days <= 4 (throttle off under
  drain-keying, but the village holds 4+ need-days) — split from
  hunger-exempt stand-downs (drain-days > 4, hungryStreak >= 3,
  throttle false by design), which are NOT disagreements.
- Fallback sensitivity: disagreement share recomputed excluding
  fallback days (no positive burn history).
- Multi-engaged-resolution days: count, and whether first-vs-any
  classification changes any day's verdict.
- Effective kcal threshold distribution: freshKcal at engaged
  resolutions (median, quartiles, min) — the kcal the throttle
  actually fired on — vs 4 x roster x 2000.
- Wall numbers for the band (band facts, not arm findings): national /
  table / wins, wave 4/5 reach, median survival, death-cause shares.

## Reproduction branch (fixed here, before judging)
The sweep reuses the gardenbar instrument, so the gardenbar trajectory
should reproduce: 761 garden resolutions, 750 engaged (98.6%), 11 NPC
sows, 3,167 keeper turns, 32 beds, 235 player sows. If those counts
reproduce exactly, the band is "the gardenbar band, reproduced". If
they differ, the band re-labels as "a fresh 8-seed competent-nofeast
100d band", the diffs are reported, and the coverage/disagreement
verdict still stands on THIS band's engaged days — the reproduction
miss is reported, not hidden, and never used to re-score coverage.

## Pilot gate
This 8-seed band IS the pilot. No confirm band is spent unless coverage
fails, in which case the failure is reported and seeds are NOT silently
widened.

## Sense (SENSE-TESTING LAW)
One throttle-day transcript sample read in full from the captured
garden say-lines, judged for meaning: does the spoken line ("the
harvest can wait") make sense against the day's two denominator
values? The sample is quoted with its drain-days, need-days, freshKcal,
burn, and roster.

## Metric review
Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
