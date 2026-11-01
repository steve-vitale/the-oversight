# sim-patrolsched-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-patrolsched-b, run
fleshout-loop-b-20261101T0435Z, axis food-economy, arm
sim-patrolsched-b. Worktree sim-patrolsched-b, branch
sim-patrolsched-b. This arm is a LEVER COMPARISON on
POLICY-SIDE files only: zero src/js changes, zero edits
to any existing policy file or existing script, zero
default flips. New files only: this prereg, one new
variant policy (scripts/policies/deed-weekly.js), one
new driver variant (scripts/patrolsched-trace-b.js),
one pure proof test (scripts/test-patrolsched-b.js),
evidence, compare, corpora, censuses. The awayeve
analyzer (scripts/analyze-awayeve-b.js) and the
splitter (scripts/split-absencehunt-jsonl-b.js) are
REUSED VERBATIM. This worker does NOT push, bump,
verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Canon read before designing

docs/CANON.md first. No canon doc covers a deed-patrol
schedule: the CANON manifest lists no patrol/deed
doc, and a docs grep finds deed-seeking named only
as a policy kind (docs/MEASUREMENT.md) — stated here
instead of inventing canon. The design record for the
schedule is the policy file's own header
(scripts/policies/deed-seeking.js): "patrol schedule
is day-modulo; tile choice is farthest-first." The
travel pipeline the patrol uses is the same travelTo
pipeline awayeve read in docs/MAP.md / docs/TIME-
ECONOMY.md (no teleport; way home through travelTo).
Standing rules that bear on it: perception law
(decisions from what the villager senses — every
census field here is read from the villager's own
evening snap, its own day lines, and its own
following morning, never from a roster) and "no
silent actions" (the sense test reads transcripts
end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-awayeve-b.md + prereg
  (DIAG-GO, base 6409c13128f3f986f9a7f6b756483a8aeb07d18c):
  P3 deed-seeking ends 65.4% of evenings away
  (471/720, 24 legs) vs BARE competent-only 5.2%
  (37/708); P3 end-cause no-return-step 465/471;
  P3 episodes 116, lengths 2-4 days dominant (81),
  5+ days 31; walked-home-next-day 56, succession
  49, horizon 11. Causal read §2: "deed patrols
  are the away-evening machine"; episode starts
  recur in ~5-day shapes ([5-7], [10-12], [15-17],
  [19-21], [22-24], [26-29]) — "the villager goes
  out on patrol, stays out 2-4 days foraging and
  working, then either walks home in daytime or
  dies out there." The one seed where patrols add
  nothing is 17563 (BARE and P3 away days and
  episodes IDENTICAL — villager already out all
  day). Carried doubt, quoted from the evidence's
  closing: "a patrol-schedule lever could vary the
  patrol schedule itself" — the day-5 start and
  ~5-day patrol rhythm suggests the deed-patrol
  schedule sets the away calendar. THIS ARM IS
  THAT LEVER. Definitions reused verbatim from
  awayeve: haven / road / away evenings, atHaven,
  departure vs continuation, end-cause ordering
  (blocked-combat > tent-camp > return-attempted
  > no-return-step > other), return stories,
  away episodes, death-aware horizons, the
  gateOk predicate (errs 0, decisions == evenings,
  loop-days complete or game-over with day
  recorded).

## STEP 0 — MECHANISM READ (done before this prereg)

Patrol departures are driven POLICY-SIDE, in
scripts/policies/deed-seeking.js, function
deedPatrol (called from deedSeeking.daily after
competent.daily, before surgeUpkeep):

- Gate: `if (![1, 3, 5].includes(day % 7)) return;`
  (3 patrol days per 7-day week), once-per-day
  guard (`ctx._patrolDay === day`), kcal gate
  (scholar kcal < 40% of kcalCap blocks).
- Then: travelTargets(), drop haven tiles, sort
  farthest-first, visit up to 4 targets, forage
  on each; `ctx.patrols++` if any visited.
- NO schedule parameter exists in src/js and NO
  policy hook for it — but none is needed: the
  schedule is a literal in a policy file, so a
  NEW policy-side file expressing a different
  literal is a faithful schedule variant. The
  DIAG fallback in the task brief therefore does
  NOT apply: this arm runs the lever comparison,
  not the census fallback. (If this variant ever
  lands, the honest landing is a schedule
  parameter on deedPatrol, not a second patrol
  implementation — deed-weekly.js says so in its
  header.)

## Base commit (pinned)

Base commit for every leg in this arm:
e6a1351c7a407e99032f5a29dc0d35e13b828b64 (worktree
HEAD at prereg writing time). This is NOT awayeve's
base 6409c131: intervening landings moved it, so
the baseline P3 legs here are FRESH measurements
on THIS base, never a reuse of awayeve corpora.
Awayeve's 65.4% is the prior that sets the GO
threshold (below), not a number this arm re-
reports as its baseline.

## Variant definition (VERBATIM — the one schedule change)

BASELINE P3 (shared baseline, "P3 as in awayeve"):
scripts/policies/deed-seeking.js, deedSeeking.daily
= competent.daily + deedPatrol + surgeUpkeep;
patrol days day % 7 in [1, 3, 5]; no evening
return step.

VARIANT (new file scripts/policies/deed-weekly.js,
id 'deed-weekly'): competent.daily + weeklyPatrol
+ surgeUpkeep (surgeUpkeep IMPORTED from
deed-seeking.js, not copied); weeklyPatrol is
deedPatrol with ONLY the day list changed:

  patrol days day % 7 in [1]  (1 patrol day per
  7-day week, the same weekday alignment as P3's
  first patrol day)

Same once-per-day guard, same 40% kcal gate,
same farthest-first order, same up-to-4 targets,
same forage-on-each, same `ctx.patrols++` rule,
same NO evening return step. ONE schedule change
only — no bundle — so any away-share movement is
attributable to patrol cadence (3x/week -> 1x/week).

Both legs run through the NEW driver
scripts/patrolsched-trace-b.js (a copy of
absencehunt-trace-b.js whose diff is ONLY: the
POLICY set {deed-seeking, deed-weekly}, the base
construction, the header, and log prefixes —
verified by diff before this prereg was written).
Snap, ctx keys, substrate asserts, stdout
transport, and record shape are otherwise
identical, so the awayeve analyzer reads both
legs' output verbatim. The baseline is therefore
a fresh P3 measurement on this base through this
driver, comparable to the variant leg by
construction; it is NOT claimed identical to an
absencehunt-driver leg.

Substrate env asserted FATAL in the driver for ALL
legs (as for P3 in awayeve): COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
WOODCARRY/WOODWARM unset/0, MORNINGCARRY/
WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0.

## Search grid (declared fully, run exactly)

Fresh bands beyond strandtile F1 17501-17508 and
F2 17511-17518, strandwide G1 17519-17526 and G2
17527-17542, awayeve A1 17543-17550 and A2
17551-17566, refusedband/gate2hunt 176xx/177xx
bands (verified: no '"seed":1756[7-9]x' or
'"seed":175[7-9]x' judged seed in
evidence/2026-11-01; only seeds <= 17566 appear):

- Band B1 (pilot): 17567, 17568, 17569, 17570,
  17571, 17572, 17573, 17574
- Band B2 (confirm): 17575, 17576, 17577, 17578,
  17579, 17580, 17581, 17582, 17583, 17584,
  17585, 17586, 17587, 17588, 17589, 17590

PILOT (8 seeds before any confirm spend,
MEASUREMENT §9): P3 B1 x 30d (8 legs) +
deed-weekly B1 x 30d (8 legs), seed-matched.
PILOT GATE before any confirm: (i) instrument
gate passes on all 16 pilot legs (errs 0,
decisions == evenings, gateOk), AND (ii) the
effect is VISIBLE: deed-weekly away share is at
least 10 points BELOW P3 away share on the same
pilot seeds, in the predicted direction (down).
If (ii) fails — direction wrong, or a drop under
10 points — the lever is KILLED at pilot: no
confirm spend, verdict NO-GO at pilot, evidence
file written from the pilot alone.

CONFIRM (only on a pilot GO, §9 Stage 2): P3 B2
x 30d (16 legs) + deed-weekly B2 x 30d (16
legs), seed-matched to each other. Judged total
if confirm runs: 48 legs (16 pilot + 32 confirm).
No judged band is ever below 8 seeds. B1 legs
are kept identical for before/after comparability.

Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own
end handling). Never a fixed 200d. The 30d
horizon matches awayeve so counts are band-
comparable.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: away evenings per seed and away
share of evenings, variant vs baseline, on
identical seeds (B1+B2 pooled if confirm runs,
with per-band splits always reported, never
pooled away). Prediction, stated before seeing
results: FEWER patrol departures -> FEWER away
episodes -> LOWER away share (down, not up).

GO BARS (ALL must hold on the pooled judged legs):
(a) INSTRUMENT GATE: every judged leg errs 0,
decisions == evenings, gateOk (awayeve predicate).
(b) AWAY-SHARE MOVE: deed-weekly away share at
least 15 points BELOW P3 away share on identical
seeds (pooled). 15 is set honestly from the
awayeve P3-vs-BARE gap (65.4% - 5.2% = 60.2
points): cutting patrol cadence to one-third
should remove a substantial fraction of the
patrol-driven away evenings, and 15 points is
one quarter of the full gap — a demanding but
not all-or-nothing bar. A smaller drop is a
real measurement but a NO-GO on this bar.
(c) COST GUARDRAILS (a lever that buys away
evenings with deaths is NO-GO — here the
direction is reversed, so the guardrail is that
staying home more must not itself cost lives):
deed-weekly mean daysAlive >= P3 mean daysAlive
- 2 days, AND deed-weekly game-over legs <= P3
game-over legs + 2. Starvation deaths, if any
appear in the deaths lists, are itemized per leg
and reported as a cost finding even if the bars
pass.
(d) CLASSIFICATION COMPLETENESS: >= 95% of away
evenings across the judged cells carry a return
story (not UNCLASSIFIED); UNCLASSIFIED evenings
itemized.
(e) SENSE PASS: at least one patrol-departure /
away-evening episode from THIS arm's corpus,
read end to end in transcript, judged as a person
going out on patrol and staying out (or the
evidence states plainly why it does not, with
quotes — a failed sense-read is a documented
finding and fails this bar).

- GO: verdict = PATROLSCHED GO; the variant is a
  live schedule lever on the away calendar (it
  moves the calendar at acceptable cost). A GO
  here authorizes NO src/js change and NO default
  change by itself — landing (including the
  honest parameterized-deedPatrol shape) is the
  coordinator's / Steve's call, reported as
  "committed on branch, pending coordinator merge".
- NO-GO (miss is NO-GO, never re-scored mid-run
  per MEASUREMENT §14): verdict = PATROLSCHED
  NO-GO on this band on current master; the
  failing bar is named exactly, with numbers.
- HELD: instrument blocked (bar (a) fails) — the
  block is stated, no verdict is claimed.

Secondary reported counts (every leg, never
pooled across bands in verdict counts): haven
evenings, road evenings (separate, never pooled
into away), away episodes (counts, length
distribution, end split), away by tile / start /
end-cause / return story, patrolDelta away
evenings (patrols firing on away days), creek
away evenings (continuity), errs, game-overs,
survival (daysAlive, endReason), maxWaveUnlocked
per leg (wall context only, never a wall
measurement — this is a pre-seat census, and
national / table / wins are NOT measured here
and must be reported as not measured, never
fabricated).

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: variant policy + driver variant +
  pure proof test, committed before judged legs.
  Pure proof must pass before any judged leg
  runs. The proof test covers: the [1] day set
  (and deed-seeking's [1,3,5] as contrast), stub-
  Game patrol gating (fires only on day%7==1,
  farthest-first, forage each, once-per-day guard,
  kcal gate), and the reused classifiers
  (no-return-step end-cause, walked-home-next-day
  return story). It passed before this prereg
  was committed.
- JUDGED LEGS: stdout-runner transport (sim prints
  one JSON line per seed to stdout; stdout -> file
  in evidence/ in a foreground exec; idle splitter
  splits into per-seed files; jsonl deleted after
  split). Judged corpora are NEVER staged in /tmp,
  and judged legs NEVER write files from a
  game-loaded process.
- SENSE TEST (law): read one full patrol-departure
  / away-evening episode's transcript/dayLines end
  to end from THIS arm's corpus and judge meaning/
  coherence: does the record read as a person going
  out on patrol and staying out, or as a
  bookkeeping artifact? Quote the lines. A
  counts-only report FAILS the sense-testing law.
  Also sample villager behavior generally out of
  the sims (goals, routines, dialogue, reactions)
  and flag anything robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-patrolsched-b.md
  — verdict judged against prereg, before/after
  tables on identical seeds, reachability verdict,
  village assessment in plain words, blanks filled
  or documented, metric review section, proof
  section, file list, wall numbers as LAST
  MEASURED (not measured here — stated, not
  invented).

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express a 30-day per-day away-evening census, a
patrol-schedule variant policy that is not in the
registry (deed-weekly), or the away-evening
tiles/outcomes/return stories — and registering
them would require editing scripts/sweep-compare.js,
an existing script outside this arm's new-files-
only scope. The same declaration every prior
strand arm made. The before/after comparison here
is a matched-seed census across bands and across
policies on identical seeds through the awayeve
analyzer (reused verbatim), and the compare .md
(evidence/2026-11-01/sim-patrolsched-b-compare.md)
is attached to the evidence file. No panel result
is fabricated; the panel tool is not invoked on
this corpus. The comparison is never labeled a
panel result.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether matched-seed share differences can be
  read as "patrols created N away evenings": NO —
  awayeve's causal read §1 applies here too. The
  variant changes RNG consumption from the first
  divergent patrol day, so trajectories diverge;
  the share difference is a policy contrast on
  identical seeds, not a pure causal count. The
  17563-style identical-episode case (if one
  recurs) is the only clean causal pair, and it
  is reported as such, never pooled into the bar.
- Whether the 15-point bar is the right size:
  set from the 60.2-point P3-vs-BARE gap before
  seeing results; if the pilot drop lands between
  10 and 15 points, that is a real but sub-bar
  effect — reported as NO-GO on bar (b) with the
  number, and the metric review for the NEXT run
  may argue a smaller bar with this evidence.
- Whether staying home more could cost lives
  (fewer deeds, fewer encounters, different food):
  that is what bar (c) guards; a guardrail miss
  with a share GO is still NO-GO overall, and the
  cost mechanism (starvation vs combat vs other
  deaths) is itemized from the deaths lists.
- Whether a 1x/week schedule is the right single
  change vs a first-patrol-day shift: the task
  brief requires ONE schedule change for
  attributability; cadence (3x -> 1x) was chosen
  over a start-day shift because awayeve's rhythm
  claim is about cadence (the ~5-day episode
  cycle), and a start-day shift would move the
  calendar without changing its density. A
  start-day arm is a legitimate NEXT arm, not a
  mid-run addition.
