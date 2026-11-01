# sim-gatediseng-b — PREREGISTRATION (committed BEFORE any judged analysis)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2030Z,
arm sim-gatediseng-b, axis food-economy. Worktree sim-gatediseng-b,
branch sim-gatediseng-b.

Background: Loop B arm sim-gatecover-b
(evidence/2026-11-01/sim-gatecover-b.md, DIAG-GO) NAMED the gate
mechanism: gate engaged = depositGateOn AND freshDays > 4 AND
hungryStreak < 3, read fresh each evening with no memory. Seed
51608 stood down day 12 on freshDays 3.39 and never re-engaged
days 13-28 while the pantry fell 9,483 -> 700 to a day-28 village
loss; day 25 passes plenty at 10.98 but fails on hunger-exempt
streak 6; the day-11 candidate fails confirmation solely on D+5
gate/run membership. Loop B arm sim-falsefire-b settled the
false-fire definition: a warning is a false alarm only if the
pantry climbs back to its warning level within ten evenings.
The 1830Z next-blank (2) remainder, taken up here: a future
deploy claim needs a pre-registered disengaged-state rule.
This arm names and measures candidate rules. It does NOT change
the gate, does NOT make a deploy claim, and does NOT adopt any
rule — adoption needs a design decision plus a future adoption
prereg.

DIAG ONLY: zero src/js game-code changes, zero policy-default
flips, zero edits to any existing script or policy file. New
files only, all named *-gatediseng-b.*: this prereg, the
analyzer (scripts/analyze-gatediseng-b.js), the proof test
(scripts/test-gatediseng-b.js), evidence, and the fresh pilot
corpus (evidence/2026-11-01/sim-gatediseng-b-pilot-armed.jsonl).
The gatecover tracer (scripts/trace-gatecover-b.js), the
falsefire/dipslide analyzers, and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE or
the dipslide sensor as systems — the mechanism and the candidate
rules below are read from the gatecover/falsefire evidence plus
the game code they instrument (src/js/game.js
_depositGateEngaged / prodThrottleEngaged / pantryFreshDays),
not invented canon. docs/PRESERVATION.md (food ladder) is
adjacent, not the sensor. This arm invents no game system: it
measures would-fire overlays on existing evening trajectories.

## Candidate rules (fixed here; each is an evening read)

All four candidates are evaluated on evening rows only, on
existing recorder fields (pantryKcal total, freshDays,
hungryStreak, gateEngaged, gateOn where the tracer records it).
Every candidate requires loopDay >= 8 (the sensor's candidate
eligibility floor) and requires the firing evening itself to be
DISENGAGED (gateEngaged false) — a rule that fires only while
engaged is not a disengaged-state rule. A candidate's
RE-ENGAGE / FIRING DAY on a trajectory is its FIRST evening
satisfying its condition. "What condition fired" is reported
per candidate as the condition values on that evening.

- (a) TOTAL-SLIDE (gate-blind slide shape): the firing evening
  D shows a total-pantry fall >= 20% over 5 evenings
  (pantryKcal(D-5) -> pantryKcal(D), both observed) AND 3
  consecutive evening total falls ending at D
  (pantryKcal(D-2) > pantryKcal(D-1) > pantryKcal(D) with the
  fall into D also counted — i.e. falls on D-2->D-1, D-1->D,
  and D-3->D-2, all strictly decreasing; equivalently three
  consecutive falls ending at D). Same slide shape as the
  sensor's candidate rule, but scored on TOTAL pantry with
  the gate ignored. Firing = the sensor would have a
  candidate if it counted while disengaged.

- (b) HYSTERESIS (lowered re-engage threshold): the gate
  re-engages while disengaged when freshDays > 2.0 AND
  hungryStreak < 3 AND gateOn true. The 2.0 threshold is a
  round half of the standing 4-day plenty line, fixed here
  before measurement — NOT fitted to any trajectory. Firing
  = the lowered gate turns on. This candidate measures GATE
  re-engagement only: whether a warning would then confirm
  depends on counting after re-engagement, which is reported
  as a secondary observation (for 51608: whether the day-11
  candidate's D+5 evening is engaged under the lowered gate),
  NOT as part of the bar — a gate that re-engages without a
  confirmable warning is reported as PARTIAL, not PASS.

- (c) STAND-DOWN + FALLING TREND: let S be the first evening
  of the current disengaged stretch (the stand-down evening:
  gateEngaged false at S, true at S-1; if the run starts
  disengaged, S is the first evening — no such stretch is
  expected in the armed corpora and any such case is reported
  loudly). The firing evening D (D > S, same stretch, D
  disengaged) shows 3 consecutive total falls ending at D,
  all after S, AND pantryKcal(D) <= 0.90 * pantryKcal(S)
  (total at least 10% below the stand-down evening's total).
  Firing = the stand-down itself, confirmed by a falling
  trend, becomes the signal.

- (d) TOTAL-PANTRY FLOOR: the firing evening D (disengaged)
  shows pantryKcal(D) < 10,000. A round absolute floor, fixed
  here before measurement — NOT fitted to any trajectory.
  Firing = the store has fallen below the floor while the
  sensor is off.

## "In time" bar (fixed here)

For a collapsing trajectory, a candidate is IN TIME iff its
firing day is >= 3 evenings before the trajectory's FIRST
STARVATION DAY (first death whose cause is starvation in the
trajectory's deaths list; if a collapsed trajectory has no
starvation death, before its collapse day with the same
3-evening margin). For 51608 the published first starvation
death is day 21, so in-time means firing day <= 18. This bar
is applied to 51608, the only collapsed trajectory in the
corpora (see below). For surviving trajectories, firings are
cost, not timeliness: no "in time" claim is made on a seed
that survives.

## False-positive cost measure (fixed here)

A firing on a SURVIVING seed is cost, measured per candidate
as: (i) firing-seed rate = surviving seeds with >= 1 firing /
all surviving seeds, reported pooled over the corpus survivors
and separately for the fresh pilot survivors; (ii) total
firings per surviving seed (counting every firing evening is
NOT the metric — first-firing only per seed for the rate;
repeat firings are reported as a count for texture, not
judged). Cost is NOT the settled false-fire definition: a
firing on a survivor is not automatically a "false fire"
under falsefire (that definition scores confirmed warnings by
10-evening recovery). This census measures would-fire cost
only; whether a would-fire warning would have confirmed and
then recovered is outside this arm's scope and is not claimed.

## Primary metrics and DIAG verdict bars (judged exactly against this header)

Per-candidate verdicts:
- PASS: in-time firing on 51608 (firing day <= 18) AND pooled
  corpus surviving firing-seed rate <= 25% AND fresh-pilot
  surviving firing-seed rate <= 25%.
- PARTIAL: in-time firing on 51608, but either rate bar
  fails — OR, for (b) only, in-time gate re-engagement whose
  secondary D+5 check shows the day-11 candidate still
  unconfirmable under hysteresis counting (reported with the
  D+5 condition values, not hidden inside a PASS).
- FAIL: no in-time firing on 51608 (never fires, or fires
  after day 18).

Overall verdict:
- DIAG-GO iff at least one candidate is PASS.
- DIAG-NO-GO iff every candidate is measured and none is
  PASS (PARTIAL candidates are named with their gap).
- INSUFFICIENT-DATA iff the pilot band or a corpus leg is
  unusable (verification failure, missing fields, or a seed
  re-run discrepancy), with the failure stated.

A miss is NO-GO, never re-scored against a friendlier
threshold (no 1.5-day hysteresis fitted after seeing D+5,
no 12,000 floor fitted after seeing survivor minima) mid-run.
A different threshold belongs to a next arm's prereg.

## Trajectories (judged)

- Corpus (existing files, NO re-runs): dipslide3 pilot-armed
  (seeds 51311-51318) + dipslide3 confirm-armed (seeds
  51319-51330) + falsefire pilot-armed (seeds 51601-51608):
  28 seeds, 27 survivors, 1 collapse (51608). The 51608
  gatecover trace file
  (evidence/2026-11-01/sim-gatecover-b-corpus/
  sim-gatecover-b-trace-51608.jsonl) supplies the
  gate-condition values (gateOn, freshKcal) for the
  diagnostic seed; the dipslide/falsefire rows supply
  pantryKcal, freshDays, hungryStreak, gateEngaged.
- Fresh pilot (new sims, this arm): seeds 52101-52108,
  armed only, 30d competent, same substrate gates as
  gatecover/falsefire, via scripts/trace-gatecover-b.js
  verbatim. Freshness verified BEFORE this prereg was
  written: no "seed":52101-52108 field in any evidence/
  *.jsonl (seed-field scan) and no whole-word mention of
  52101-52108 in any evidence/2026-11-01/*.md. The pilot
  records candidate firings on NEW seeds, so false-positive
  cost is measured on fresh data, not just the corpus.
- Per candidate, the evidence reports on 51608: firing day
  or never, days before first starvation (21 - firing day,
  or "never"), and what condition fired (condition values
  on the firing evening); on the corpora: per-seed firing
  days for every firing seed; on the pilot: the same, plus
  in-window wall numbers (below).

## Staged design

Policy: competent ONLY (scripts/policies/competent.js,
verbatim). Substrate gates, identical to gatecover/falsefire:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0;
WOODCARRY/WOODWARM/MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/
FEDEVENING not 1; DEPOSITGATE=1 (armed only). Horizon: 30
days, death-aware, matching gatecover/falsefire exactly.
Tracer: scripts/trace-gatecover-b.js verbatim (evening gate
read + freshKcal + freshDays + hungryStreak + both condition
values, per evening). Analyzer:
scripts/analyze-gatediseng-b.js (new: the four candidate
rules as pure functions over evening series, plus per-seed
and pooled summaries; imports NOTHING judged — it reads
evening series from the corpus/pilot files). Proof test:
scripts/test-gatediseng-b.js (pure checks only, NO judged
seeds, NO judged trajectories: synthetic series for each
rule's fire / no-fire boundaries, including a synthetic
day-25-like trap for (b) — plenty passing with streak >= 3
must NOT re-engage — a flicker stretch with only 2 falls
for (c), the 10,000 boundary for (d), and the in-time
arithmetic).

STEP 1 — THIS PREREG COMMIT (before any judged analysis).
STEP 2 — TOOLS + PROOF (analyzer, proof test; proof green
before any judged application).
STEP 3 — CORPUS CENSUS (existing files only; per-candidate
firing days on 51608 + firing-seed rates on corpus
survivors).
STEP 4 — FRESH PILOT (seeds 52101-52108 via the verbatim
tracer; verified rows == daysAlive each; candidate firings
+ wall numbers).
STEP 5 — SENSE TEST (re-read the 51608 day 12-28 transcript
stretch from the gatecover trace's sayLines; see below).
STEP 6 — EVIDENCE (evidence/2026-11-01/sim-gatediseng-b.md).

## Balanced panel (§15) — inapplicability declared (same reasoning as the prior arms)

No balanced-panel compare is fabricated. This arm changes NO
game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays
on identical evening series), not panel metrics. The tables
are reported directly in the evidence file instead, on
identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported from
the fresh pilot band: survival (seeds survived / 8, median
and max days alive), wave reach (max wave unlocked per
seed), and national / table / wins as NOT REACHED IN WINDOW
(expected 0 — those are late-game states with no fields in
this window, reported as such, not as a rate claim).

## Sense test (SENSE-TESTING LAW)

Re-read the 51608 day 12-28 transcript stretch (sayLines in
the gatecover trace) and judge in plain words whether a
re-engaged warning at the measured firing day would have
read sensically to a player: what the village's voice is
saying on and around the firing evening, whether a warning
line there would fit or clash, and whether the silence
after day 11 still reads as the gap gatecover diagnosed.
At least three lines are quoted in the evidence file. The
known "pot stays full" line is recorded only, not
re-litigated.

## Attribution limits (stated before judging)

- Evening snapshots only: the candidates read evening
  pantry/gate values, the same read the sensor's counting
  uses. Intraday flicker is not measured and cannot change
  a would-fire evening verdict.
- GateOn assumption on corpus rows: dipslide/falsefire rows
  record gateEngaged, not gateOn separately. Candidate (b)
  on corpus rows therefore assumes gateOn true on armed
  legs (DEPOSITGATE=1 by construction; verified directly on
  the 51608 gatecover trace, where gateOn is true on all 28
  evenings). The fresh pilot uses the gatecover tracer,
  which records gateOn directly, so the pilot leg of (b)
  carries no assumption. Any corpus (b) firing whose
  gateEngaged is true is impossible by construction
  (firing requires disengaged); any (b) firing on a corpus
  row with freshDays <= 4 and streak < 3 is consistent with
  gateOn true, and is reported as such.
- Would-fire overlay, not a counterfactual: firing days are
  computed on trajectories as run. A real disengaged-state
  rule could change villager behavior and therefore later
  evenings; whether it would have saved 51608 is unmeasured
  and is not claimed.
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game
  legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  DIAG-GO here names a candidate rule that meets the bars;
  it does not deploy it, and any adoption belongs to a
  future arm's prereg with a design decision.

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
