# sim-trendsensor-b — PREREGISTRATION (committed BEFORE any judged analysis)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1305Z, arm
sim-trendsensor-b, axis food-economy. Worktree sim-trendsensor-b, branch
sim-trendsensor-b.

Answers the depositgate backlog item (Loop B round 1130Z, evidence
evidence/2026-11-01/sim-depositgate-b.md): the depositgate's "full"
reading is a LEVEL (fresh days > 4), not a trend. On seed 51101 it ate
6,442 kcal at the fire over days 12–17 while the pantry halved, with
voice still saying "the shelves are full"; by day 18 the sensor cleared
and the gate correctly stood down, but the village was already in free
fall (a villager starved day 22, HUNGER WINTER day 22, scattering day
25). The gate-off twin of the same seed holds ~13–17k kcal and survives
all 30 days. Caveat carried from that arm, not hidden: the SUPPORTED
verdict rests on n=1 — the confirm band (12 fresh seeds, both arms)
produced zero new collapses, so the collapse evidence is unreplicated.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-trendsensor-b.*: this prereg, the trend analyzer
(scripts/analyze-trendsensor-b.js), the proof test
(scripts/test-trendsensor-b.js), evidence, corpus
(evidence/2026-11-01/sim-trendsensor-b-corpus/). The depositgate driver
(scripts/depositgate-b-driver.js) and policy (scripts/policies/
competent.js) are REUSED VERBATIM by running them, never edited, and
only if a fresh confirm band is needed (see below).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE as a
system — the mechanism below is read from the depositgate arm's prereg
and evidence (fresh days > 4, hungryStreak >= 3 stands it down), not
invented canon. docs/PRESERVATION.md (food ladder: cleaned < cooked <
smoked < rendered < pemmican) is adjacent, not the gate: it explains
why a falling total pantry matters even while fresh days stay high
(fresh is a slice of the store, not the store).

## Mechanism as read (fixed before judging)

- Level rule (the gate as coded): on a decision, the gate is engaged
  iff DEPOSITGATE=1 AND pantryFreshDays() > 4 AND NOT (hungryStreak
  >= 3). The evening census flag `gateEngaged` is the read-only
  evening snapshot of that rule; intraday decisions may ease while the
  evening reads disengaged (depositgate day-18 note: 148 kcal eased
  while the evening read disengaged). Day attribution may therefore be
  off by one day at most; the >= 3-day earliness bar below absorbs it.
- Trend rule (this arm's instrument, computed OFF-LINE from the
  evening pantry series — it is never fed back into any sim, so it
  cannot change a trajectory; it only judges when a trend-aware
  sensor WOULD have stood down):
  - Evening pantry series P(d) = evening pantryKcal on lived day d
    (whole pantry, all food states, kcal).
  - TREND-NOT-FULL on evening day D iff ALL of:
    (i) D has at least 5 prior evening rows (a 5-day window exists);
    (ii) 5-day slope: P(D) <= 0.80 * P(D-5) (the total store fell by
         at least 20% over 5 evenings);
    (iii) consecutive-day falls: P(D-2) < P(D-3) AND P(D-1) < P(D-2)
         AND P(D) < P(D-1) — three consecutive evening falls ending
         at D (this is the consecutive-day criterion);
    (iv) the level rule says engaged that evening (gateEngaged true)
         — a trend stand-down only counts where it contradicts the
         level rule.
  - A day with a null pantry reading breaks all fall chains and is
    never counted as a trend day; missing counts are reported.
- Final engaged run: the maximal run of consecutive gateEngaged=true
  evenings ending at the seed's last engaged evening.
- Trend stand-down day: the first day D in the final engaged run
  satisfying TREND-NOT-FULL. (If the trend fires earlier in the seed
  but not in the final run, it is reported descriptively, never
  counted toward the bars — the bars judge the run that led to the
  seed's end state.)
- Level stand-down day: the first gateEngaged=false evening after the
  final engaged run ends, if one exists inside the lived window; else
  none (the seed ends with the gate still engaged).
- Earliness (collapsed seeds only, when both days exist):
  levelStandDown - trendDay.
- False stand-down seed: a SURVIVED seed with a trend stand-down day
  in its final engaged run. Per the task brief, a trend firing on a
  seed the level rule survived is counted false, even if the firing
  looks cautious in isolation — the bar is deliberately strict, and
  any over-strictness is a metric-review item for the NEXT run, not a
  mid-run re-score.

## Question

Would a trend-aware "full" reading have stood down materially earlier
than the level rule on the collapsing seed 51101, without crying wolf
on seeds the level rule survived?

## Replay design (no new sims for the pilot)

- Pilot = PURE REPLAY of the depositgate armed pilot corpus
  (evidence/2026-11-01/sim-depositgate-b-armed.jsonl, seeds
  51101–51108, competent, 30d, DEPOSITGATE=1), which is committed on
  this branch's history and was produced under the identical substrate
  gates below. Replay is deterministic: the analyzer is pure (no RNG,
  no game load), so the pilot trajectories are reusable byte-for-byte
  without re-running sims. The depositgate arm proved 51101's
  trajectory byte-identical across two runs, which is the determinism
  evidence for the corpus.
- Census-validity check per pilot seed (reported, never patched):
  rows == daysAlive and gateEngaged boolean on every row. A seed
  failing it is excluded from the bars and named, not silently fixed.
- Confirm (ONLY if the pilot passes GO, see Pilot gate): 12 FRESH
  seeds 51121–51132, armed arm only (DEPOSITGATE=1), competent, 30d,
  same substrate gates, run with the EXISTING depositgate driver
  (run, never edited), then the same trend analysis. Fresh here means
  seeds never run by any arm and never seen by this trend rule.
- Horizon + why: 30 days, death-aware (dead villages stop simulating;
  no fixed 200d). 30d is the depositgate baseline window: the slide to
  judge happened days 12–18 and the collapse day 25, so the window
  covers both the sensor question and its outcome. A longer window is
  a NEXT run's question, not this one's.

## Seeds and policies

Pilot (replay): 51101–51108, armed only (the level rule lives in the
armed arm; the control arm has no gateEngaged series to judge).
Confirm (fresh sims, only if pilot GO): 51121–51132, armed only.
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Substrate gates (identical to depositgate): COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0; WOODCARRY/WOODWARM/MORNINGCARRY/
WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1; DEPOSITGATE=1.

## Primary metric and DIAG-GO bar (judged exactly against this header)

DIAG-GO requires BOTH bars. A miss is NO-GO, never re-scored against
a friendlier metric mid-run. If the metric proves wrong, it goes under
"metric review" in the evidence file and the revision applies to the
NEXT run.

(a) 51101 EARLINESS: on seed 51101 (armed replay), a trend stand-down
    day exists in the final engaged run AND earliness >= 3 days
    (trend stands down at least 3 evenings before the level rule's
    stand-down evening).
(b) PILOT FALSE-STAND-DOWN CAP: among the SURVIVING pilot seeds
    (armed 51101–51108 seeds whose endReason is 'survived'), at most 2
    seeds have a trend stand-down day in their final engaged run.
    The denominator (number of surviving pilot seeds actually
    observed) is reported alongside the count; the cap is 2 seeds
    absolute, not a rate.

## Pilot gate (before any confirm spend)

Pilot = the 8-seed replay above. STOP (no confirm, report as the
result) if (a) or (b) fails, or if any pilot seed fails the
census-validity check in a way that changes a bar's denominator
(excluded seeds are named and the bars are judged on the remainder;
if the remainder cannot judge a bar, that bar is NO-GO).

## Confirm bars (only if pilot GO)

Confirm GO requires BOTH:
(c) FALSE-STAND-DOWN RATE: at most 25% of surviving confirm seeds
    (at most 3 of 12, scaled if fewer survive: floor(0.25 * survivors))
    have a trend stand-down day in their final engaged run.
(d) COLLAPSE EARLINESS (if any confirm seed collapses): at least one
    collapsed confirm seed has earliness >= 3 days. If zero confirm
    seeds collapse, (d) is UNJUDGED on confirm (reported as such, not
    as a pass or a fail) and the final verdict rests on (a)–(c).
Final verdict: GO iff pilot bars (a)+(b) AND confirm bars (c)+(d or
UNJUDGED) all pass. Pilot GO + confirm miss = NO-GO overall, reported
with the pilot pass intact (the pilot result is not rewritten).

## Balanced panel (§15) — inapplicability declared

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer, scorecard,
and cohort rows; this arm changes NO game code, runs NO lever, and its
primary metric is a within-trajectory instrument comparison (trend
rule vs level rule on identical evening pantry series), not a panel
metric. The level-vs-trend table is reported directly in the evidence
file instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states. The evidence will say so plainly and will NOT
claim wall movement. What is reported: wave reach (maxWaveUnlocked per
seed), median/max survival (days alive), collapse count, all
in-window, for the pilot replay band and the confirm band if run.

## Sense test (SENSE-TESTING LAW)

Quote the actual "shelves full" say-lines against the pantry trajectory
on 51101 (does the voice overstate fullness while the pantry falls? in
plain words), and record whether the known "pot stays full" prose bug
on the day-22 starvation night reproduces in the replay — do not
re-litigate it, just record reproduction yes/no with the quoted line.

## Attribution limits (stated before judging)

- Evening snapshots only: the trend rule reads evening pantry, while
  the gate decides intraday. A trend stand-down day is therefore "the
  evening a trend-aware sensor would first have disagreed", not a
  claim about any single intraday decision.
- The trend rule is judged, not the gate: a trend stand-down would
  NOT have saved 51101 by itself — banking the eased kcal changes the
  trajectory, so the counterfactual (what the village would have done
  with the food banked) is unmeasured here. Earliness is a sensor
  property, not a survival claim.
- Single policy (competent) by design: the question is the sensor's
  behavior under competent play. Other policies may pantry differently.
- Descriptive replay, NOT a causal claim: one collapsing seed cannot
  prove the level sensor caused the death, and a trend rule passing
  these bars cannot prove it would prevent the next collapse.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
