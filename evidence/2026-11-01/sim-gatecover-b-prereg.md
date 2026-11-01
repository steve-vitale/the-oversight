# sim-gatecover-b — PREREGISTRATION (committed BEFORE any judged analysis)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1930Z,
arm sim-gatecover-b, axis food-economy. Worktree sim-gatecover-b,
branch sim-gatecover-b.

Background: Loop B run 20261101T1830Z, arm sim-falsefire-b
(evidence/2026-11-01/sim-falsefire-b.md, corpus
evidence/2026-11-01/sim-falsefire-b-corpus/, both on master),
settled the 10-evening recovery definition of a false fire and
left two open items, both taken up here. First, its pilot seed
51608 collapsed (village-lost, day 28) and NEVER got a warning:
its depositgate was engaged only days 1-4, 8-9, 11; it stood
down day 12 and never re-engaged while the pantry fell 9,483 ->
700 over 16 more days, so the sensor's final-run counting had
nothing to score. That is the binding instrument problem, ahead
of further scoring refinements. Second, its single corpus false
fire, seed 51316, rides on a +5 kcal bounce (21,255 vs level
21,250) the evening after confirmation, after which the pantry
re-slides to 15,700: the recovery test has no noise margin.

DIAG ONLY: zero src/js game-code changes, zero policy-default
flips, zero edits to any existing script or policy file. New
files only, all named *-gatecover-b.*: this prereg, the tracer
(scripts/trace-gatecover-b.js), the margin analyzer
(scripts/analyze-gatecover-b.js), the proof test
(scripts/test-gatecover-b.js), evidence, and the diagnostic
trace corpus (evidence/2026-11-01/sim-gatecover-b-corpus/).
The depositgate driver (scripts/depositgate-b-driver.js), the
dipslide/falsefire analyzers, and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited. A re-run of
consumed seed 51608 for diagnosis is fine — it is not a judged
band, and its trace is diagnostic evidence, not a verdict leg.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE or
the dipslide sensor as systems — the mechanism below is read
from the depositgate and dipslide arms' preregs and evidence
plus the game code they instrument (src/js/game.js
_depositGateEngaged / prodThrottleEngaged / pantryFreshDays),
not invented canon. docs/PRESERVATION.md (food ladder) is
adjacent, not the sensor. This arm invents no game system: it
names how an existing gate decides, and how an instrument's
fires are scored under a new margin rule, both measurement
decisions, and says so.

## Q1 — GATE STAND-DOWN + NEVER-RE-ENGAGE MECHANISM (seed 51608)

PLAIN-WORDS HYPOTHESIS, TO BE PROVED OR EXCLUDED FROM THE
TRACE (not assumed): the gate is not a pantry-total sensor at
all. It engages only while the pantry reads PLENTIFUL on the
fresh slice — fresh days-on-hand above 4 — and a genuine hunger
stretch (hungryStreak >= 3) stands it down even when fresh
reads plentiful. On 51608 the fresh slice thins below 4 on day
12 and never recovers except on a day the hunger exemption is
already active, so the gate has no evening left to re-engage
on, and the sensor's final-run counting — which only scores
candidates inside the final engaged run, with a D+5 evening
that must itself be engaged — has nothing to score.

EXACT GATE RULE (from code, to be confirmed against the trace):
_depositGateEngaged() = _depositGateOn() AND
prodThrottleEngaged(), where prodThrottleEngaged() = (hungryStreak
< 3) AND (pantryFreshDays() > 4), and pantryFreshDays() =
fresh-only pantry kcal (preserved/rendered/pemmican excluded,
spoiled excluded) divided by the rolling burn rate. The sensor
side (unchanged from dipslide3/falsefire): a candidate evening
D requires gateEngaged true, >= 20% fall over 5 evenings, and
3 consecutive evening falls ending at D; eligibility requires
loopDay >= 8; confirmation requires the D+5 evening row to
exist, lie inside the SAME final engaged run, be engaged, sit
below the candidate level, and show no tolerance-recovery in
D+1..D+5. The final engaged run is the maximal trailing run of
engaged evenings ending at the last engaged evening.

TRACE REQUIREMENTS (what counts as naming the mechanism):
for every evening day 1-28 of the diagnostic 51608 re-run, the
trace must record gateEngaged, pantryKcal (evening total),
pantryFreshDays, fresh kcal, hungryStreak, and the two
condition values (freshDays > 4? hungryStreak >= 3?), and the
evidence must quote that table and identify, for each
disengaged stretch, WHICH condition fails. In particular it
must answer, with numbers, all three of: (i) why day 12
stands down (which condition flips vs day 11); (ii) why days
13-28 never re-engage (which condition fails on each day,
including the day-25 fresh spike, if the re-run reproduces
it); (iii) why the seed's only eligible candidate (day 11,
if reproduced) cannot confirm (its D+5 evening's gate state
and run membership). If the re-run does NOT reproduce the
published 51608 trajectory (rows != daysAlive, or evening
pantry series differing from the falsefire corpus row-for-row),
that is reported loudly, the mechanism is judged on the
published corpus trace instead, and the re-run discrepancy is
not smoothed over. The published corpus trace alone already
carries gateEngaged, pantryKcal, freshDays, and hungryStreak
per evening, so Q1 does not depend on the re-run succeeding.

## Q2 — RECOVERY-TEST NOISE MARGIN (new question, not a re-score)

PLAIN WORDS: the settled definition counts ANY evening at or
above the candidate level in the 10 evenings after
confirmation as a recovery. The margin rule asks whether a
recovery should have to be REAL — big enough, or durable
enough, to count as the village actually climbing back — rather
than a rounding-sized bounce that happens to cross a line.

MARGIN RULE, DECIDED HERE (symmetric with the dipslide3
tolerance confirmation rule, which already treats a margin
breach OR a sustained at-level pair as recovery inside the
confirmation window): for a confirmed fire with candidate
level L and confirmedDay C, a MARGIN RECOVERY occurs in
C+1..C+10 iff EITHER (a) some evening pantry P >= 1.05 * L
(a margin breach, the same 105% threshold as the tolerance
rule), OR (b) two consecutive evenings (by loopDay) both with
P >= L (a sustained at-level pair, the same durability test
as the tolerance rule). A single evening at or above L that
is below 1.05 * L and is undone the next evening is NOISE,
not a recovery. Everything else in the settled definition is
unchanged: collapsed seeds are true warnings; a margin
recovery makes the fire false ("quick recovery" under the
margin rule); no margin recovery in the horizon makes it a
true warning ("sustained slide"); censoring is unchanged
(fewer than 10 evenings observed and no margin recovery seen
= true as observed, flagged censored, excluded from the
judged denominator under the falsefire conservative rule).
The margin rule is applied ONLY as a re-scoring layer over
the already-confirmed fires; it never changes whether a seed
confirms, never changes a candidate, and never re-scores the
settled definition itself. The settled-definition verdicts
stand as published in sim-falsefire-b.md whatever Q2 finds.

CORPORA RE-SCORED (judged, no new sims except the Q1
diagnostic re-run): (i) the dipslide3 corpus as re-analyzed
in falsefire (seeds 51311-51330, 10 confirmed fires), via
its published falsefire corpus summary + pantry series; (ii)
the falsefire pilot (seeds 51601-51608, 2 confirmed fires),
via its published pilot summary + pantry series. Total
judged set: 28 seeds, 12 confirmed fires. The re-scoring
reads the EXISTING corpus files (evidence/2026-11-01/
sim-dipslide3-b-pilot-armed.jsonl,
sim-dipslide3-b-confirm-armed.jsonl,
sim-falsefire-b-pilot-armed.jsonl) — it does not re-run
those seeds, and it does not edit those files. If the margin
analyzer's settled-definition layer disagrees with the
published falsefire tables on any fire (candidate, level,
confirmedDay, recoveryDay, fire class), that is a loud
analyzer discrepancy to report, not a verdict change to
smooth over; the margin verdict is then judged on the
published tables, with the discrepancy stated.

## Primary metrics and DIAG-GO bars (judged exactly against this header)

DIAG-GO requires BOTH:

- (G-1) GATE MECHANISM NAMED WITH TRACE EVIDENCE: the
  evidence names the exact gate rule, quotes the per-evening
  trace (gate state, evening pantry, freshDays, hungryStreak,
  and both condition values) for 51608, and shows the exact
  failing condition for the day-12 stand-down, for every
  disengaged evening days 13-28 (grouped only where the
  failing condition is identical and consecutive, with the
  day-25 case, if present, called out separately), and for
  the day-11 candidate's failed confirmation. A mechanism
  that explains the stand-down but not the never-re-engage,
  or vice versa, does NOT pass G-1.
- (G-2) MARGIN RULE DECIDED AND VERDICT IMPACT MEASURED:
  the margin rule above is applied to all 12 confirmed fires
  in the two corpora, and the evidence reports, per fire,
  settled class vs margin class, and the resulting pooled
  judged rate, per-band judged rates, and whether any judged
  verdict changes: (a) falsefire Q1 (FF-1 pooled <= 25%,
  FF-2 pilot sensitivity >= 3, FF-3 pilot judged <= 25%),
  (b) falsefire Q2 (extension incidence / load-bearing,
  expected unchanged since the margin layer touches neither
  confirmation nor flagging), and (c) dipslide3 GO
  (confirmation count / hairline-only, expected unchanged
  since the margin layer touches neither). "Verdict impact"
  means the verdicts, not just the rates: a rate that moves
  without flipping a verdict is reported as no verdict
  change, with the moved rate stated.

DIAG-NO-GO = G-1 fails (the mechanism cannot be isolated
from the trace) OR G-2 is unmeasured. If G-1 fails, the
evidence must state what was excluded (which candidate
mechanisms the trace rules out) and must NOT guess a
mechanism. A miss is NO-GO, never re-scored against a
friendlier margin (e.g. a 101% threshold fitted to 51316's
+5 kcal, or a hold-only rule chosen after seeing which
fires flip) mid-run. The margin rule above is fixed here;
a different margin belongs to a next arm's prereg.

## Staged design

Policy: competent ONLY (scripts/policies/competent.js,
verbatim). Substrate gates, identical to falsefire:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0;
WOODCARRY/WOODWARM/MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/
FEDEVENING not 1; DEPOSITGATE=1 (armed only). Horizon: 30
days, death-aware, matching falsefire exactly so the
diagnostic re-run is comparable row-for-row. Tracer:
scripts/trace-gatecover-b.js (new recorder: wraps the
competent policy exactly as the depositgate driver does,
and at each evening records gateEngaged,
prodThrottleEngaged, _depositGateOn, pantryKcal,
pantryFreshKcal, pantryFreshDays, hungryStreak, alive, and
the derived condition values). Analyzer:
scripts/analyze-gatecover-b.js (imports the committed
falsefire analyzer's recovery/classification helpers
verbatim and adds ONLY the margin-recovery scan and the
margin re-scoring summary). Proof test:
scripts/test-gatecover-b.js (pure checks only, no judged
seeds: margin-recovery cases including a +5-kcal single
bounce, a margin breach, a sustained tiny pair, a single
at-level evening, and the gate-condition truth table).

STEP 1 — THIS PREREG COMMIT (before any judged analysis).
STEP 2 — TOOLS + PROOF (tracer, analyzer, proof test;
proof green before any judged application).
STEP 3 — Q1 DIAGNOSTIC RE-RUN (seed 51608 only, armed,
30d competent, same substrate gates; output to
evidence/2026-11-01/sim-gatecover-b-corpus/; verified
rows == daysAlive, and evening pantry series compared
row-for-row against the falsefire corpus).
STEP 4 — Q2 MARGIN RE-SCORING (existing corpora only,
via the margin analyzer; no new sims).
STEP 5 — EVIDENCE (evidence/2026-11-01/sim-gatecover-b.md).

## Balanced panel (§15) — inapplicability declared (same reasoning as the prior arms)

No balanced-panel compare is fabricated. This arm changes NO
game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (a gate trace on
one diagnostic seed; a re-scoring of already-confirmed
fires on identical evening pantry series), not panel
metrics. The tables are reported directly in the evidence
file instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported: the
diagnostic seed's end (village-lost day 28, if reproduced),
wave reach, and the corpora's published wall numbers as
already stated in falsefire/dipslide3 (not re-claimed).

## Sense test (SENSE-TESTING LAW)

Quote the actual say-lines a player would see around the
stand-down (days 11-12) and around the collapse (days 27-28)
of 51608, and judge in plain words whether the gate's
silence reads sensibly: on the stand-down evening the voice
still says the shelves are full while the fresh slice has
just slipped under 4 days, and on the collapse evenings
villagers starve beside a "pot stays full" line. At least
three lines are quoted in the evidence file. The known "pot
stays full" line is recorded only, not re-litigated.

## Attribution limits (stated before judging)

- Evening snapshots only for the sensor leg: the sensor
  reads evening pantry while the gate decides intraday.
  The tracer records the evening gate read (the same read
  the sensor's final-run counting uses) plus the evening
  condition values; it does not claim an intraday gate
  history. If the gate flickers intraday, the evening read
  is still the read that decides scoring, and that is the
  claim made here.
- The gate is judged, not the counterfactual: whether a
  different gate rule would have saved 51608 is unmeasured
  (the counterfactual changes the trajectory).
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game
  legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  DIAG-GO here names the gate mechanism and measures a
  margin rule's verdict impact; it does not prove the
  sensor works in general, and any gate-rule change belongs
  to a future arm's prereg, never to this DIAG arm.

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
