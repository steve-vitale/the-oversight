# sim-lqpersist-b — PRE-REGISTRATION (written BEFORE any new sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2029Z, axis
food-economy. Arm: 1930Z next blank 2 — a post-arrival persistence measure
for Lamb's Quarters. Measurement only: zero src/js changes, no default
flips, no garden/throttle redesign. This arm does NOT re-judge the 1930Z
NO-GO verdict and does NOT re-litigate the gap decomposition. Its verdict
is ONLY the post-arrival persistence measure and the mechanism separation
below. Judged ONLY against this prereg.

## Question (verbatim from the 1930Z metric review + out-of-arm observation)

1930Z: Lamb's Quarters alone covers 53.9% of the 59,670-kcal 9762 gap
(median 32,150 vs 0) but fails the present-across leg by ONE resolution
(79/99 = 79.8% vs the 80% bar) because the bar counts 19 pre-arrival
engaged days. From first appearance it is present on 79 of 80 engaged
resolutions, and on every engaged day from day 24 on. The persistence
MECHANISM is unknown: spoil timing vs meal-draw order vs deposit
frequency are not distinguished by the 1930Z corpus.

## Prior knowledge (what was known BEFORE this prereg — nothing more)

- The 1930Z numbers above, from evidence/2026-10-26/sim-stock9762-b.md
  and its prereg (read before writing this prereg).
- Code facts read before writing this prereg (not new data):
  pantryDraw (src/js/game.js) sorts fresh candidates spoilDay ascending
  (soonest-spoiling first), kcalEach ascending second — EXCEPT slabs
  (kcalEach > 2000) ride last. So a channel whose pieces are slabs is
  systematically eaten last: a sharp, testable draw-order hypothesis.
  Pantry items carry spoilDay (absolute scholar day); isSpoiled uses
  spoilDay vs day (meal boundary may carry a bonus — reported as a
  caveat, not modeled).
- The committed 1930Z corpus carries per-resolution per-channel
  fresh/nonFresh/spoiled kcal + stacks, inflows (door/name/kcal/day),
  and day-end snapshots — but NO per-draw records and NO spoil-horizon
  or slab-share fields. That absence is WHY this arm re-runs the band
  with two added recorders (below) instead of analyzing the committed
  corpus alone. No per-draw, horizon, or slab number for any seed has
  been computed before this prereg.

## Band (identical to the gardenbar / 1930Z band, for comparability)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9760–9767 (8 seeds; this band IS the pilot).
- Confirm seeds (ONLY if the pilot verdict is GO, see below):
  9768–9779 (12 seeds).
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed). Never a fixed 200d.
- Base commit pinned: this worktree's HEAD at prereg time is recorded
  by the proof (git rev-parse HEAD); if the base moves before the
  sweep, the sweep re-runs from the new HEAD and the evidence names
  the new HEAD — a trajectory move is reported, never hidden.

## Instrument (DIAG only, new files only)

- Reuses UNCHANGED: scripts/inflow-capture.js, scripts/garden-capture.js,
  scripts/throttledays-capture.js, scripts/stock9762-capture.js, and
  scripts/mealdraw-capture.js (the 1930Z arm-2 recorder: per-draw item
  names, kcalEach, spoilDay, foodState; mealCall cross-check anchors).
  No sibling capture file is modified.
- NEW scripts/lqpersist-capture.js, installed AFTER stock9762-capture
  (it wraps resolveOneAssignment a further time; it does not modify any
  existing capture). At entry to every garden resolution it records, per
  item-name channel, a spoil/slab summary over the pantry's CURRENT
  stacks, using the SAME fresh/nonFresh/spoiled classification as
  stock9762-capture: {channel, freshKcal, spoiledKcal, stacks,
  slabFreshKcal (fresh kcal in stacks with kcalEach > 2000),
  horizonMin, horizonMed, horizonMax} where horizon = spoilDay − day
  over FRESH stacks with a non-null spoilDay (stack-median for
  horizonMed; null when no such stack). It reads state, delegates with
  identical arguments, `this`, and return value, and writes ONLY to
  the caller's arrays. No Game.state write, no RNG consumption, no
  say/log write. All reads try/catch isolated.
- NEW scripts/sweep-lqpersist-b.js (same band/env assertions, same
  death/wall capture as sweep-stock9762-b.js, plus mealdraw + lqpersist
  recorders and the same day-end snapshots),
  scripts/analyze-lqpersist-b.js, and scripts/test-lqpersist-b.js
  (proof). Corpus: evidence/2026-10-26/sim-lqpersist-b-corpus/
  (per-seed JSONs; pilot 8, plus confirm 12 iff the pilot is GO).
- Median rule (named explicitly, per the 1930Z metric review):
  conventional median — average of the two middle values for even n.
  "Median across resolutions" of a per-resolution statistic means the
  conventional median of that statistic's per-resolution values.

## Definitions (fixed here, before judging)

- Engaged resolution: a garden resolution with throttle flag true
  (stock9762 flag; the three throttle flags must agree — see leg 2).
- First appearance of channel C on seed S: the day of the FIRST engaged
  resolution on S with C freshKcal > 0. If C never appears, it has no
  post-arrival window.
- Post-arrival window of C on S: engaged resolutions on S with
  day >= first-appearance day. Post-arrival presence = share of those
  resolutions with C freshKcal > 0.
- Band-start presence (reported alongside, for comparability): share
  of ALL engaged resolutions on S with C freshKcal > 0 — the 1930Z
  measure, NOT the judge here.
- Comparators (fixed here): Cattail on seed 9761 and Burdock on seed
  9760 — the two pulse-collapse channels from 1930Z (523,680 kcal in,
  ~1,080 median stock; 147,870 kcal in, 0–23,000 oscillation). All
  comparator statistics are computed over engaged resolutions where
  the comparator channel's freshKcal > 0, unless stated otherwise.
- Meal-drawn kcal: from mealdraw pantryDraw records with context !=
  'other' (meal contexts only; 'other' draws reported separately).
  Draw share of C = C meal-drawn kcal / all meal-drawn fresh kcal
  over the band (seed 9762 for the pilot verdict).
- Stock share of C (seed 9762): median C freshKcal / median total
  freshKcal across post-arrival engaged resolutions.
- Deposit window of C on S: first deposit-door day to last
  deposit-door day for C in the inflow records (doors 'deposit' and
  'stock' and 'pantryAdd' all count as deposits; door split reported).
  Deposit-day coverage = days in the window with >= 1 C deposit /
  days in the window. Median inter-deposit gap = conventional median
  of gaps between consecutive C deposit days.

## PRIMARY metric (judged ONLY against this)

GO (a measurement GO, not a design ruling) iff ALL of:
  1. Control reproduction exact: 761 garden resolutions, 750 engaged
     (98.6%), 11 NPC sows, 3,167 keeper turns, 32 beds, 235 player
     sows — the gardenbar band, reproduced. Any miss re-labels the
     band as "a fresh 8-seed competent-nofeast 100d band", is
     reported, and makes this leg NO-GO (a fresh band cannot claim
     the 1930Z gap).
  2. Snapshot rebuild: stock9762 summed bucket freshKcal equals
     pantryFreshKcal() on >= 99% of engaged resolutions, AND the
     three throttle flags agree on >= 99% of resolutions
     (mismatches listed, not hidden).
  3. Post-arrival persistence: Lamb's Quarters on seed 9762 is present
     on >= 80% of its post-arrival engaged resolutions.
A miss on ANY leg is NO-GO, never re-scored against a friendlier
measure (no switching to band-start presence, means, cumulative
inflows, or day-end snapshots to rescue a failed leg). The band-start
measure is reported alongside for comparability only — it does NOT
judge this verdict. Metric doubts go under "metric review" and propose
the revision for the NEXT run.

## Mechanism separation (diagnostics; name AT MOST ONE, only with counts)

Each diagnostic is computed on the pilot band (seed 9762 for Lamb's
Quarters; comparators as defined above). The mechanism is NAMED iff
EXACTLY ONE of the three bars below passes. If zero pass, or two or
more pass, the mechanism is UNDISTINGUISHED — reported as such with
all three diagnostics, never forced to one.

  A. SPOIL TIMING passes iff: median LQ horizon (median across
     post-arrival engaged resolutions of the per-resolution
     stack-median horizon, seed 9762) is >= 2.0x the pooled comparator
     median horizon (same statistic; Cattail-9761 and Burdock-9760
     resolutions pooled, each resolution weighted equally).
  B. MEAL-DRAW ORDER passes iff BOTH: (i) median LQ slab share
     (median across post-arrival engaged resolutions of
     slabFreshKcal / freshKcal for Lamb's Quarters, seed 9762) is
     >= 0.50, AND (ii) LQ draw share <= 0.50x LQ stock share (seed
     9762, band totals as defined above). Comparator slab shares
     are reported as contrast.
  C. DEPOSIT FREQUENCY passes iff BOTH: (i) LQ deposit-day coverage
     over its deposit window (seed 9762) is >= 0.60, AND (ii) BOTH
     comparators' deposit-day coverage is < 0.40. Median
     inter-deposit gaps reported for all three.

Interpretation is fixed here, not fitted after: spoil timing = the
stock survives because its pieces last longer; meal-draw order =
the stock survives because meals systematically eat other things
first (slabs ride last); deposit frequency = the stock survives
because it is topped up too often to drain. A named mechanism is a
measurement claim about THIS band, not a design ruling.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO, no confirm band is spent — the run ends with
the NO-GO verdict and the diagnostics. If the pilot is GO, run seeds
9768–9779 (12 seeds) with the identical instrument and band, then:
  - Qualifying channels on the confirm band: channels with median
    freshKcal >= 10% of their seed's median total freshKcal AND a
    first-appearance day >= 10 (mid-band arrival).
  - For each qualifying channel compute post-arrival presence and
    the three mechanism diagnostics (same definitions, per-channel
    comparators replaced by that seed's own pulse channels where
    applicable — reported, not re-defined: the mechanism bars are
    applied per channel exactly as written, with "comparators" read
    as the other qualifying channels on the same seed for bar C(ii)
    and as the pooled other-channel resolutions for bar A).
  - If the pilot named a mechanism: confirm PASS iff, among
    qualifying channels, mechanism-pass ⟺ post-arrival presence
    >= 80% agrees on >= 75% of channels, with >= 4 qualifying
    channels; confirm FAIL iff agreement < 75% with >= 4 channels.
    If fewer than 4 qualifying channels, the confirm is DIAG
    (too few to judge) — reported, not forced.
  - If the pilot named NO mechanism (undistinguished): the confirm
    is DIAG-only — report the persistence distribution and all three
    diagnostics per qualifying channel, no PASS/FAIL.
  - The confirm NEVER overrides the pilot verdict: the verdict is
    the pilot's GO/NO-GO; the confirm is reported alongside as
    CONFIRM-PASS / CONFIRM-FAIL / CONFIRM-DIAG.

## Secondary figures (reported, not judged)

- Band-start presence for Lamb's Quarters on 9762 (the 1930Z measure,
  expected reproduction 79/99) and the full 1930Z decomposition
  reproduction (totalGap, channel shares) for comparability.
- Per-channel presence tables (band-start + post-arrival) for all
  channels on all pilot seeds.
- LQ spoiled-kcal trajectory (median spoiled share of LQ stock) and
  comparator spoiled shares — supporting color for diagnostic A.
- Draw detail: LQ meal-drawn kcal by context (villager-home /
  villager-away / player), LQ 'other'-context draws, comparator
  draw shares and stock shares, and the spoilDay ordering check
  (share of meal draws whose items are spoilDay-ascending within
  the draw — the code's stated order, verified from records).
- Deposit detail: LQ deposit events by door, kcal per deposit
  distribution, active window, coverage, gaps; same for comparators.
- Wall numbers for the band (national / table / wins, wave 4/5
  reach, median survival, death-cause shares). Four-realm formation,
  Arc reach, trap acquisition, counter discovery/kill, young-link
  succession: reported ONLY if the corpus carries them; otherwise
  "not recorded in this corpus, not estimated".
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever, so there is no before/after to panel. Stated
  in the evidence file; the reproduction check above is the control.

## Pilot gate

This 8-seed band IS the pilot. No confirm band is spent unless the
pilot verdict is GO (see above). Never below 8 seeds for any band.

## Sense (SENSE-TESTING LAW)

At least one deposit/draw sequence quoted in plain words: what
arrived, what got eaten, what stayed — over a window where Lamb's
Quarters is present (e.g. days 30–41 on 9762, or the arrival window
itself), read from the inflow + mealdraw + day-end snapshot records
together, so the persistence claim reads as a village story, not
just a ratio. Plus one villager-talk check (does spoken plenty /
scarcity match the measured stockpile that day?).

## Metric review

Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
