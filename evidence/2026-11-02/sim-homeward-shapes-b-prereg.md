# sim-homeward-shapes-b — PREREG (committed BEFORE any reproduction or pilot sim)

Run: oversight-flesh-out-loop-b, arm sim-homeward-shapes-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1505Z). Worktree sim-homeward-shapes-b,
branch sim-homeward-shapes-b. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands the branch.
Status to coordinator: committed in worktree, pending
coordinator merge.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-homeward-substrate-b.md (Loop B 1345Z):
  shadow E VALIDATED for approach-clean screening, but the
  approach-clean screen found 0 candidates in 8 bands / 64
  seeds (DIAG-NO-CANDIDATE). It did find armed homeward
  vetoes firing on natural bands for the first time (8
  total, on 2 seeds) in shapes the approach-clean entry
  definition EXCLUDES. Those shapes are this run's
  assignment; the 1345Z screen and corpus are not
  re-judged here.
- Prototypes, from the 1345Z stored files (re-read, not
  re-judged):
  - SHAPE A, seed 67105: shadow day 5 walks out
    (4,4)->(6,4)->(7,4)->(7,2)->(7,1), every hop-time hop
    simOk=true, then day-end position (7,1) with
    dayEndReturnSim.ok=false, and shadow day-end sims fail
    days 5-9 at (7,1). Armed: day 5 homeward veto
    (7,1)->(6,1) simOk=false, originSimOk=false, ends
    (7,2) with day-end sim passing; days 6-8 homeward
    vetoes (7,2)->(6,2) simOk=false, originSimOk=true,
    ends (7,2) with day-end sims passing; comes home day
    9. Outward entry + homeward escape-attempt vetoes.
  - SHAPE C, seed 68001 day 8: scholar starts the day
    already out at (2,8) (start.pos != haven (4,4)) with
    a PASSING shadow day-end sim; shadow attempts
    homeward (2,8)->(4,8) simOk=false. Armed day 8:
    homewardVetoes=4, vetoOriginPass=4, vetoOriginFail=0
    — vetoed homeward hops (2,8)->(4,8) x3 and
    (0,8)->(4,8) x1, all simOk=false, originSimOk=true —
    ends (2,8) with day-end sim passing. Mid-trip fence
    from escapable ground.
  - SHAPE B (context only, NOT judged here): 67204,
    68207 approach E-fails; the armed scholar never
    attempts the homeward step.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way home
as travel through the same travelTo pipeline. No canon doc
covers the pocket guard itself: it is a policy-side sim
instrument (a competent variant), not a game system, so
there is no canon to invent from — the guard's E(D) model
is inherited verbatim from the predecessors. This run is
INSTRUMENT/SCREEN ONLY: zero src/js changes, zero policy
changes, zero default flips, zero bundled fix. If GO, it
is reported as DIAG-GO for a follow-up build that names
the extension — no game change lands in this run.

## Question

Do homeward shapes A and C reproduce on the current
master substrate, and do fresh pilot bands contain
candidate episodes under an extended (A/C-inclusive)
entry definition, with hop-time E recorded alongside
day-end E for every homeward veto?

## Reproduction FIRST (before pilot bands are judged)

Fresh runs, reused driver unchanged, same substrate as
the 1345Z screen (competent, 30d, DEPOSITGATE=0,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, packcomp
*=1 flags not 1): seed 67105 and seed 68001, two legs
each — baseline 'competent' under the SHADOW guard and
armed 'competent-homewardstep-b' (full guard). These are
pre-used prototypes, used ONLY for reproduction: they are
never screened, never judged, never candidates.

REPRODUCTION BAR (decided now): shape A reproduces iff
the fresh 67105 legs show shadow day 5 walk-out prefix
(4,4)->(6,4)->(7,4)->(7,2)->(7,1) all simOk=true with
shadow day-5 dayEndReturnSim.ok=false, AND armed day 5
homewardVetoes>=1 with armed day-5 dayEndReturnSim.ok=
true. Shape C reproduces iff the fresh 68001 legs show
armed day 8 start.pos != haven, homewardVetoes>=1 with
at least one vetoed homeward hop simOk=false and
originSimOk=true, and armed day-8 dayEndReturnSim.ok=
true. Any field that differs is reported precisely (seed,
day, field, stored value, fresh value) as a DIVERGENCE;
definitions are NOT re-tuned to chase a divergence, and
the pilot proceeds on the prereg definitions regardless.
A divergence does not change the pilot verdict, which is
judged on the fresh pilot bands alone.

## EXTENDED entry definition (decided now, before any sim)

Proving driver fields, exactly: day.start.pos,
day.start.haven, day.end.pos, day.dayEndReturnSim.ok,
day.hops[].from/to, .simOk, .vetoed, .homeward,
.originSimOk, .silent, day.homewardVetoes,
day.vetoOriginPass, day.vetoOriginFail. Paired legs per
seed: shadow baseline + armed full, same seed, same day.

A day D on seed S is SHAPE-A-QUALIFYING iff ALL hold:
1. Shadow day-D dayEndReturnSim.ok === false.
2. Armed day-D homewardVetoes >= 1 AND armed day-D
   dayEndReturnSim.ok === true.
3. FIRST-DAY-OF-RUN walk-out (applied to the first day
   of each maximal run, see grouping): the shadow
   day-D hop log has a contiguous PREFIX starting at
   day.start.pos === day.start.haven and ending at
   shadow day-D end.pos, every hop simOk === true.
   (Hop-time E passes on the whole walk-out, including
   the final hop into the end tile, while the day-end E
   for that tile fails — the time-sensitivity finding.)

A day D is SHAPE-C-QUALIFYING iff ALL hold (A takes
precedence per day: a day already A-qualifying is not
also counted as C):
1. Armed day-D start.pos !== day.start.haven (mid-trip,
   not a haven departure that day).
2. Armed day-D homewardVetoes >= 1, with at least one
   vetoed homeward hop with simOk === false AND
   originSimOk === true.
3. Armed day-D dayEndReturnSim.ok === true AND shadow
   day-D dayEndReturnSim.ok === true (fence from
   escapable ground, not a pocket day).
4. Shadow day-D hop log contains that same from->to
   homeward hop (first occurrence) with simOk === false
   (shadow hop-time corroboration).
A day meeting C except clause 4 is reported as C-LOOSE
(secondary count, never a candidate).

EPISODE GROUPING: per seed and shape, maximal runs of
consecutive loopDays (each day +1) of qualifying days
form ONE episode. Prototype check: 67105 days 5-8 form
one A episode (day 5 carries the walk-out, days 6-8
carry the run); 68001 day 8 alone forms one C episode.
A seed may yield at most one episode per shape per run
of days; a seed yielding both shapes counts as two
episodes (one per shape), named per episode.

CANDIDATE RECORD (per episode): seed, shape, days,
per-day (shadow dayEnd ok, armed dayEnd ok, armed
homewardVetoes, vetoOriginPass/Fail), walk-out prefix
(A) or vetoed hop(s) with originSimOk (C), shadow
day-end kcal on the first day.

## Pilot screening

Bands, in order, both bands always run (no early stop;
the budget is the pilot, not a search):
1. 69301-69308 (bookkeeping label: A-screen band)
2. 69401-69408 (bookkeeping label: C-screen band)
Screening is shape-blind: the analyzer applies BOTH
shape definitions to BOTH bands; the labels do not
restrict which shapes count. Total candidate episodes =
A episodes + C episodes across both bands.

BANNED (never screened, never judged): all 1345Z
screening bands (67001, 67101, 67201, 68001, 68201,
68701, 69101, 69201 as 8-seed starts), 62801-62808,
62001-62016, 61901-61916, 62301, 62401, 62501, 62601,
62701, 64001-64708, and the prototype seeds 67105 and
68001 themselves (reproduction only). Verification
before this prereg was written: zero mentions of band
starts 69301 / 69401 and zero mentions of any
individual seed 69301-69308 / 69401-69408 in any *.md
under evidence/ (all dates).

Per band, BOTH legs fresh with scripts/homext-abl-b-driver.js
(unchanged): baseline 'competent' under the SHADOW guard
and armed 'competent-homewardstep-b' (full guard).
Judged by the new analyzer scripts/analyze-homeward-shapes-b.js
(episodes mode), which applies the definitions above and
prints every candidate episode plus a veto E table.

Substrate, identical to 1345Z: competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, packcomp *=1 flags not 1
(driver-enforced, FATAL otherwise). Horizon reason:
pockets are an early far-travel phenomenon (observed
days 4-30 in predecessor evidence); a 30d window
contains them while a longer window adds pre-seat
noise, and the 30d pre-seat profile (national / table /
wins 0) is expected, not a regression.

## E-divergence report (pre-registered)

For EVERY armed homeward veto in the pilot bands
(every hop with vetoed === true AND homeward === true
on an armed leg), the analyzer records: hop-time E =
the vetoed hop's simOk, origin E = originSimOk, and
day-end E = that day's armed dayEndReturnSim.ok. Counts
reported:
- vetoes total, vetoes where hop-time E != day-end E
  (disagree), vetoes where hop-time E === false AND
  day-end E === true (hop-time E explains the veto
  better: the step fails while the day-end position is
  escapable), vetoes where both fail (agree-fail).
Separately, for each A episode, the entry-tile
divergence: final walk-out hop simOk (hop-time) vs
shadow day-end ok (day-end) for the end tile.
No veto is re-scored after the fact: the table is the
report.

## Primary metric, GO threshold, verdicts (decided now)

Primary metric: count of candidate episodes under the
extended (A/C-inclusive) entry definition on the two
fresh pilot bands (16 seeds), with hop-time E recorded
for all vetoes.
- GO (DIAG-GO): >= 2 candidate episodes total, with
  hop-time E recorded for every veto in the pilot bands.
  Reported as DIAG-GO for a follow-up build naming the
  extension — NOT a game-change verdict, NOT a landing.
- NO-GO (DIAG-NO-CANDIDATE): 0 candidate episodes.
- DIAG-ONE: exactly 1 candidate episode — below GO,
  above zero; reported as-is, never rounded up to GO
  and never rounded down to NO-GO.
Judge the run against this header. A miss is NO-GO
(or DIAG-ONE at 1), never re-scored against a friendlier
metric mid-run (MEASUREMENT.md §14). If the metric
proves wrong, write it under "metric review" for the
NEXT run.

## Balanced panel (§15)

Run scripts/balance-panel.js as CONTEXT only on one
pilot band (combined campaign, policies competent +
competent-homewardstep-b, 30 days), as the 1345Z run
did. No split-panel compare is claimed: policy-split
panels can never match (predecessor finding), and no
panel verdict is needed for a diagnostic run. If the
panel refuses the corpus, record the refusal as-is;
never fabricate a compare. If the panel cannot express
the shadow-vs-armed guard split, say so deliberately:
the panel expresses the two policies, not the shadow
instrument — that is why it is context, never verdict.

## Sense-testing law

Read the sayLines transcripts for veto lines on armed
legs (prototype days and any candidate episodes) and
for the candidate villages' own words; judge meaning
and coherence, never just counts. The evidence file
carries a village assessment in plain words (what the
village looked like, who thrived and who died and why,
what knowledge was missing), wall numbers for the
pilot bands (national / table / wins, wave 4-5
unlocks, median survival) with the 30d pre-seat
profile stated as expected, not a regression, and a
"metric review" section.

## Census (proof, not judged evidence)

BEFORE pilot legs are judged, the proof test
scripts/test-homeward-shapes-b.js must show: (a) the
episodes analyzer counts an A episode exactly (2-day
run with walk-out prefix + armed pass/veto, grouped as
ONE episode); (b) A rejected when armed day-end fails
and when a walk-out hop fails; (c) a C episode exactly
(mid-trip start, origin-passing veto, shadow
corroboration, both day-ends passing); (d) C-loose
(shadow corroboration missing) counted loose, never
candidate; (e) A-precedence: a day meeting both shapes
counts as A only; (f) the veto E table counts disagree
/ hop-explains / agree-fail exactly; (g) pilot band
starts 69301 / 69401 are outside the banned set and do
not overlap any banned band; (h) the reused
driver/analyzer/policy files are unmodified in this
worktree. The predecessor proof tests
scripts/test-homeward-substrate-b.js,
scripts/test-homext-abl-b.js, and
scripts/test-homeveto-screen-b.js are re-run
post-commit as regression checks, not re-authored. Any
proof failure is a proof failure: fix the instrument,
do not judge legs against a failing one.

## Deliverable

Evidence file evidence/2026-11-02/sim-homeward-shapes-b.md
(prereg header, reproduction per-field tables for 67105
and 68001, pilot ledger for both bands, candidate
episode list or NO-CANDIDATE / ONE verdict, veto E
table with divergence counts, village assessment in
plain words, wall numbers, metric review section),
plus the analyzer + proof test files, all committed on
branch sim-homeward-shapes-b. Report to coordinator:
verdict (GO / NO-GO / DIAG-ONE / DIAG), prototype
reproduction result for 67105 and 68001, pilot band
numbers, E-divergence counts, proof test counts, and
commit hashes.

## Explicitly excluded

No reuse of any banned band; no screening past the
2-band pilot budget; no re-judging the 1345Z screen or
corpus; no re-litigation of shape B beyond context; no
src/js or policy changes; no default flip; no bundled
fix; no landing of a game change on a GO; no other
worktree touched; no push, bump, live verification,
merge, or rebase.
