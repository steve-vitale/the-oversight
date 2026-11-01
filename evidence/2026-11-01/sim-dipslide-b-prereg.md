# sim-dipslide-b — PREREGISTRATION (committed BEFORE any judged replay)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1346Z, arm
sim-dipslide-b, axis food-economy. Worktree sim-dipslide-b, branch
sim-dipslide-b.

Answers the 1305Z Loop B round's metric review
(evidence/2026-11-01/sim-food-depositkeep-trendsensor-round-1305.md and
evidence/2026-11-01/sim-trendsensor-b.md): the trendsensor arm's trend
rule (NO-GO, killed at pilot) passed earliness on 51101 (trend day
loopDay 7 vs level stand-down loopDay 18, earliness 11 days) but failed
its false-fire cap: 3 of 7 surviving pilot seeds fired in their final
engaged run (51103, 51104 — the cleanest false alarm, pantry recovers
to 32–33k and survives — and 51108), against a cap of 2. The killer
slide (days 12–17) looks, to a slope rule, exactly like the settling
that opens every healthy run (days 3–7). The metric review's charge to
this run: the next design must tell a dip from a slide — an
early-window exclusion or a recovery check, pre-registered, judged on
fresh seeds, with an explicit counting rule. This arm designs and
pilots that next sensor. It does NOT land a game change.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-dipslide-b.*: this prereg, the dip/slide analyzer
(scripts/analyze-dipslide-b.js), the proof test
(scripts/test-dipslide-b.js), evidence, corpus
(evidence/2026-11-01/sim-dipslide-b-corpus/). The depositgate driver
and the trendsensor analyzer are REUSED only as read reference, never
edited, and no new sims are run in this arm (see below).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE as a
system — the mechanism below is read from the depositgate and
trendsensor arms' preregs and evidence (fresh days > 4, hungryStreak
>= 3 stands the gate down), not invented canon. docs/PRESERVATION.md
(food ladder) is adjacent, not the gate: it explains why a falling
total pantry matters even while fresh days stay high (fresh is a slice
of the store, not the store).

## The sensor rule (EXACT — implementable live from pantry history alone)

Evening pantry series P(d) = evening pantryKcal on lived day d (whole
pantry, all food states, kcal). loopDay is the census day label, as in
the trendsensor corpus. No retrospective peeking: every condition below
is evaluated from evenings at or before the confirmation evening, and
the sensor's actionable day is the confirmation evening itself, never
the candidate day retroactively.

Underlying trend condition (IDENTICAL to the trendsensor prereg, no
change): CANDIDATE on evening day D iff ALL of:
  (i)   D has at least 5 prior evening rows (a 5-day window exists);
  (ii)  5-day slope: P(D) <= 0.80 * P(D-5) (the total store fell by at
        least 20% over 5 evenings);
  (iii) consecutive-day falls: P(D-2) < P(D-3) AND P(D-1) < P(D-2)
        AND P(D) < P(D-1) — three consecutive evening falls ending
        at D;
  (iv)  the level rule says engaged that evening (gateEngaged true).
A day with a null pantry reading breaks all fall chains and is never
a candidate day.

Direction (i) — EARLY-WINDOW EXCLUSION: a candidate day D is eligible
only if D >= 8. Trend signals on loopDays 1–7 are ignored entirely.
Cutoff and why: the first seven evenings are the settling week. Every
pilot seed starts near 39–42k kcal and sheds roughly a quarter of it
in week 1, including a ~10k kcal step on day 3 (trendsensor evidence);
a slope rule fired inside that week is reading the starting stock
being eaten down to its working level, not a slide. Day 8 is the first
evening AFTER the first full week, so it is the earliest evening a
fall can be read as something other than settling. The cutoff is a
day label (loopDay), not a row index, so it survives any window offset.

Direction (ii) — RECOVERY CONFIRMATION, N = 5: an eligible candidate
day D CONFIRMS only if, five evenings later, the pantry has NOT
recovered to the signal day's level. Exactly:
  P(D+5) exists as a numeric evening reading, the loopDay-(D+5)
  evening is still inside the same final engaged run (gateEngaged
  true there — a sensor that would act only while the gate is engaged
  cannot confirm after the level rule has already stood down), AND
  P(D+5) < P(D).
  Because the candidate already satisfies P(D) <= 0.80 * P(D-5), the
  condition P(D+5) < P(D) also implies P(D+5) < P(D-5): five evenings
  after the signal the store is still below even the level it had
  five evenings BEFORE the signal. A dip that has been erased within
  five evenings (P(D+5) >= P(D)) does NOT confirm.
Why N = 5: it mirrors the slope window itself (5 evenings) — the
village gets one full slope-window to eat its way back, no more. A
shorter window would confirm dips that merely pause; a longer window
would delay the sensor past the point where standing down matters
(the 51101 slide runs days 12–17 against a day-18 level stand-down,
so the confirmation must land inside that slide, not after it).
Why the comparison P(D+5) < P(D) and not a continued-fall test: a
slide need not fall monotonically to be a slide — it need only fail to
recover. A continued-fall test would miss a slide that plateaus low;
a recovery test catches both falling and flat-low stores while still
clearing any dip the village eats through.

Scanning rule: candidate days inside the final engaged run are scanned
in ascending loopDay order. The FIRST eligible candidate that
confirms yields the pair (candidateDay = D, confirmedDay = D+5).
A candidate that fails recovery does NOT end the scan: later
candidates in the same run are still tested (a village can dip, recover,
then genuinely slide). If no candidate in the final run confirms,
confirmedDay is null. The sensor's actionable day — the day it would
stand the gate down — is confirmedDay, never candidateDay: the village
cannot act on a signal it has not yet confirmed.

## Counting rule (pre-registered, from the trendsensor metric review)

Final engaged run ONLY: the maximal run of consecutive gateEngaged =
true evenings ending at the seed's last engaged evening. A fire counts
as a false alarm only if it occurs in a seed's final engaged run — here,
a CONFIRMED fire (a confirmedDay) inside that run.
  - Seeds with NO final engaged run (the gate never engaged): counted
    as no-run, never as false, and named.
  - Seeds whose gate disengages and resets (an earlier run ends, a
    later run begins): only the final run counts. Fires (candidate or
    confirmed) outside the final run are reported descriptively as
    confirmedAnywhere / candidateAnywhere, never toward the bars.
  - Seeds ending with the gate still engaged (no level stand-down):
    the false count still applies (survived + confirmed in the final
    run = false alarm); earliness is undefined for them (no level
    stand-down day to subtract from).
  - Collapsed seeds: a confirmed fire is NOT a false alarm. Earliness
    is defined only when a level stand-down evening exists after the
    final run.
  - Confirmation evenings beyond the lived window, or on a null-pantry
    row, or outside the final run: the candidate does NOT confirm
    (unconfirmed, not missing-data-imputed).

## Question

Does the dip-vs-slide sensor — early-window exclusion (D >= 8) plus
5-evening recovery confirmation (P(D+5) < P(D)) on top of the unchanged
trend condition — stand down materially earlier than the level rule on
the collapsing seed 51101, without crying wolf on seeds the level rule
survived?

## Replay design (no new sims for the pilot)

Pilot = PURE REPLAY of the depositgate armed pilot corpus
(evidence/2026-11-01/sim-depositgate-b-armed.jsonl, seeds 51101–51108,
competent, 30d, DEPOSITGATE=1), exactly as the trendsensor arm did.
Replay is deterministic: the analyzer is pure (no RNG, no game load),
so the pilot trajectories are reusable byte-for-byte without re-running
sims. This arm runs NO fresh-seed confirm whatever the outcome (see
Pilot gate): a GO earns a fresh-seed confirm NEXT run; it does not run
one here. This is deliberate — the pilot corpus is the same corpus
whose failure mode motivated this design, so a pilot GO is provisional
by construction and the fresh-seed confirm is the real test.
Census-validity check per pilot seed (reported, never patched):
rows == daysAlive and gateEngaged boolean on every row. A seed failing
it is excluded from the bars and named, not silently fixed.
Horizon + why: 30 days, death-aware (dead villages stop simulating;
no fixed 200d). 30d is the depositgate baseline window: the slide to
judge happened days 12–18 and the collapse day 25, so the window covers
both the sensor question and its outcome. A longer window is a NEXT
run's question, not this one's.

## Seeds and policies

Pilot (replay): 51101–51108, armed only (the level rule lives in the
armed arm; the control arm has no gateEngaged series to judge).
Policy: competent ONLY (scripts/policies/competent.js, verbatim, as
reused by the depositgate corpus).
Substrate gates (identical to depositgate/trendsensor): COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0; WOODCARRY/WOODWARM/MORNINGCARRY/
WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1; DEPOSITGATE=1.

## Primary metric and DIAG-GO bar (judged exactly against this header)

GO if BOTH bars pass — (a) earliness preserved: confirmed trend day
on 51101 is >= 3 days before the level stand-down day 18; (b) false
fires in final engaged runs <= 1 across surviving pilot seeds
(trendsensor pilot: 3). Otherwise NO-GO. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If the metric proves
wrong, it goes under "metric review" in the evidence file and the
revision applies to the NEXT run.

(a) 51101 EARLINESS: on seed 51101 (armed replay), a confirmedDay
    exists in the final engaged run AND levelStandDown - confirmedDay
    >= 3 (the confirmed, actionable day stands down at least 3
    evenings before the level rule's stand-down evening, loopDay 18).
    Note the bar is STRICTER than the trendsensor bar in one respect:
    it is judged on confirmedDay (D+5), not on the candidate day —
    the 5-evening confirmation delay is charged against earliness.
(b) PILOT FALSE-FIRE CAP: among the SURVIVING pilot seeds (armed
    51101–51108 seeds whose endReason is 'survived'), at most 1 seed
    has a confirmedDay in its final engaged run. The denominator
    (number of surviving pilot seeds actually observed) is reported
    alongside the count; the cap is 1 seed absolute, not a rate.

## Pilot gate (before any confirm spend)

Pilot = the 8-seed replay above. STOP (no confirm, report as the
result) whatever the outcome: a GO earns a fresh-seed confirm NEXT
run; a NO-GO kills this sensor design as pre-registered. No fresh
seeds are consumed in this run under any outcome.

## Confirm bars (NEXT run only, specified here so the GO means something)

Confirm (fresh seeds, next run, armed only, competent, 30d, same
substrate gates): GO requires BOTH:
(c) FALSE-FIRE RATE: at most 25% of surviving confirm seeds have a
    confirmedDay in their final engaged run.
(d) COLLAPSE EARLINESS (if any confirm seed collapses): at least one
    collapsed confirm seed has levelStandDown - confirmedDay >= 3.
    If zero confirm seeds collapse, (d) is UNJUDGED on confirm
    (reported as such, not as a pass or a fail) and the final verdict
    rests on (a)–(c).
These bars are specified, not judged, in this run.

## Balanced panel (§15) — inapplicability declared

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer, scorecard,
and cohort rows; this arm changes NO game code, runs NO lever, and its
primary metric is a within-trajectory instrument comparison (dip/slide
sensor vs level rule on identical evening pantry series), not a panel
metric. The level-vs-sensor table is reported directly in the evidence
file instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states. The evidence will say so plainly and will NOT
claim wall movement. What is reported: wave reach (maxWaveUnlocked per
seed), median/max survival (days alive), collapse count, all
in-window, for the pilot replay band.

## Sense test (SENSE-TESTING LAW)

Quote the actual "shelves full" say-lines against the pantry trajectory
around each confirmed fire — especially 51101's slide and 51104's
recovery — and judge whether the sensor's voice would read sensibly
to a player (would standing down on the confirmed day sound like a
village noticing a slide, or like crying wolf on a dip? in plain
words). At least one line is quoted in the evidence file.

## Attribution limits (stated before judging)

- Evening snapshots only: the sensor reads evening pantry while the
  gate decides intraday. A confirmed day is "the evening a dip/slide
  sensor would first have disagreed, after confirmation", not a claim
  about any single intraday decision.
- The sensor is judged, not the gate: a confirmed stand-down would NOT
  have saved 51101 by itself — banking the eased kcal changes the
  trajectory, so the counterfactual is unmeasured here. Earliness is a
  sensor property, not a survival claim.
- Single policy (competent) by design: the question is the sensor's
  behavior under competent play. Other policies may pantry differently.
- Descriptive replay, NOT a causal claim: one collapsing seed cannot
  prove the level sensor caused the death, and a pilot GO on this same
  corpus cannot prove the sensor works in general — the fresh-seed
  confirm next run is the test that would.
- Pilot-corpus reuse caveat: this design was motivated by the pilot
  corpus's own failure mode, so its pilot numbers are optimistic by
  construction. A GO here licenses a fresh-seed confirm; it is not,
  by itself, a landing case.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
