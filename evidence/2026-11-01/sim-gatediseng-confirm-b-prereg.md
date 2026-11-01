# sim-gatediseng-confirm-b — ADOPTION PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2230Z,
arm sim-gatediseng-confirm-b, axis food-economy. Worktree
sim-gatediseng-confirm-b, branch sim-gatediseng-confirm-b.
Base at spawn: master 3141390ef.

Background: Loop B arm sim-gatediseng-b (2030Z, DIAG-GO,
evidence/2026-11-01/sim-gatediseng-b.md) NAMED candidate (c)
STAND-DOWN + TREND as the disengaged-state rule. It fired day 15
on collapsing seed 51608 (6 evenings before first starvation
day 21), at corpus cost 2/27 survivors and fresh-pilot cost 2/8
survivors (exactly at the 25% bar). This arm CONFIRMS (c) on a
fresh 12-seed band. It does NOT deploy (c) and does NOT flip
any default, and it changes NO game code: zero src/js edits,
zero policy-default flips, zero edits to any existing script
or policy file. New files only, all named
*-gatediseng-confirm-b.*: this prereg, the evenings analyzer
(scripts/analyze-gatediseng-confirm-b.js), the proof test
(scripts/test-gatediseng-confirm-b.js), evidence, and the
confirm corpus (evidence/2026-11-01/sim-gatediseng-confirm-b-*.jsonl
/ *.json / *.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and
scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE
or the dipslide sensor as systems — the mechanism and the
candidate rule below are read from the gatecover / falsefire /
gatediseng evidence plus the game code they instrument
(src/js/game.js _depositGateEngaged / prodThrottleEngaged /
pantryFreshDays), not invented canon. docs/PRESERVATION.md
(food ladder) is adjacent, not the sensor. This arm invents
no game system: it measures would-fire overlays on existing
evening trajectories, and the deploy spec in this prereg is
a SPEC for a future arm, not a change made here.

## The (c) rule, verbatim (as named by gatediseng-b)

Let S be the first evening of the current disengaged stretch
(gateEngaged false at S, true at S-1); the firing evening D
(D > S, same stretch, D disengaged) shows 3 consecutive total
falls ending at D, all after S, AND pantryKcal(D) <= 0.90 *
pantryKcal(S).

Operationalization, fixed here exactly as gatediseng-b's
reused analyzer implements it (no redefinition mid-run):
- Every candidate also carries the sensor's eligibility
  floor loopDay >= 8; a (c) shape before day 8 does not fire.
- The three falls ending at D are the falls D-3 -> D-2,
  D-2 -> D-1, D-1 -> D, all strictly decreasing; the
  analyzer requires D-3 >= S, i.e. the fall window starts
  at or after the stand-down evening S (the 51608 firing
  itself is the boundary case: S = 12, D = 15, D-3 = 12 = S).
- The firing day on a trajectory is its FIRST evening
  satisfying the rule (first per trajectory for the rate;
  see evenings reporting below for repeats).
- A stretch that begins on the run's first recorded evening
  counts as a stand-down with S = that first evening (the
  "true at S-1" clause is vacuous there); any such seed is
  reported loudly with its startsDisengaged flag, as
  gatediseng-b did for pilot seed 52101. This is the reused
  analyzer's behavior, stated here before judging so it
  cannot be re-decided after seeing the band.

## Confirm band (fixed here, freshness verified BEFORE this prereg)

Seeds 52201-52212 (12 seeds), armed only, 30d competent,
same substrate gates as gatecover / gatediseng-b (below),
via scripts/trace-gatecover-b.js verbatim, one node process
per seed, each line appended to
evidence/2026-11-01/sim-gatediseng-confirm-b-armed.jsonl.

Freshness verification, done before this prereg was written:
- Seed-field scan over ALL of evidence/ in both spellings:
  grep --include='*.jsonl' and --include='*.json' for
  `"seed": ?522(01|02|...|12)` followed by a non-digit —
  zero hits.
- .md mentions: grep -w over all of evidence/ for
  52201-52212 — zero hits.
- Gatediseng pilot consumed 52101-52108; this band does not
  overlap it, the gatediseng corpus (51311-51330, 51601-51608),
  or any other consumed band found by the scans above.
- If any confirm seed's tracer verification fails (rows !=
  daysAlive), that seed is re-run and the retry is reported
  loudly; a seed is never judged on a mismatched row count.

## Substrate (identical to gatecover / gatediseng-b)

Policy: competent ONLY (scripts/policies/competent.js,
verbatim). Substrate gates: COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0; WOODCARRY / WOODWARM / MORNINGCARRY /
WINDOWCARRY / STRANDFIX / PRESSB / FEDEVENING not 1;
DEPOSITGATE=1 (armed only). Horizon: 30 days, death-aware,
matching gatecover / gatediseng-b exactly. Tracer:
scripts/trace-gatecover-b.js verbatim (evening gate read +
freshKcal + freshDays + hungryStreak + both condition
values, per evening, plus sayLines for the sense test).
Judged analyzer: scripts/analyze-gatediseng-b.js verbatim
(first (c) firing per seed, survivor rate, in-time flag).
Evenings analyzer (new, this arm):
scripts/analyze-gatediseng-confirm-b.js — computes, per
seed, ALL evenings satisfying the (c) condition (not just
the first) and warnings issued under the deploy counting
rule below (first firing per stretch); it cross-checks its
first firing against the reused analyzer's candidateC day
on every judged seed, and any mismatch is a loud failure,
not a re-score.

## CONFIRM BAR (stated before seeing the band — judged exactly against this header)

Primary metric: survivor firing-seed rate on the confirm
band = confirm seeds with >= 1 (c) firing that SURVIVED /
all confirm seeds that SURVIVED. (A firing on a collapsed
seed is timeliness evidence, not cost; see in-time leg.)

- CONFIRM BAR: survivor firing-seed rate <= 25% on the
  confirm band (same bar as the pilot leg). With 12
  survivors that means <= 3 firing survivors (3/12 = 25.0%
  passes; 4/12 = 33.3% fails). The denominator is the
  actual survivor count on the band, reported explicitly;
  if the band has zero survivors, the verdict is
  INSUFFICIENT-DATA, not a rate.
- IN-TIME CHECK (on any collapsing trajectory): for EVERY
  confirm seed that collapses, (c) must fire in time: its
  first firing day <= firstStarvationDay - 3 (first death
  whose cause is starvation in that seed's deaths list; if
  a collapsed seed has no starvation death, <= its
  collapse day (daysAlive) - 3, same margin). A collapsing
  seed with NO (c) firing fails the in-time leg outright —
  a rule that stays silent on a collapsing village has not
  confirmed its purpose on that trajectory. If the band
  contains NO collapsing seed, the in-time leg is vacuous:
  reported as "not re-tested on this band" (51608's in-time
  firing, day 15 vs starvation day 21, stands from
  gatediseng-b) and it does not block PASS.
- EVENINGS-PER-FIRING-SEED (reported, not a bar): for
  every firing seed, report (i) raw evenings satisfying
  the (c) condition, and (ii) warnings issued under the
  one-per-stretch counting rule below. Report the mean,
  median, and max of (i) across firing seeds, plus the
  per-seed counts in the evidence table. NO evenings
  threshold is set in this prereg: evenings texture is a
  reporting requirement, not a judged bar, and a high
  raw-evenings count does not by itself fail the confirm
  — the deploy counting rule already caps issued warnings
  at one per stretch, so raw evenings and issued warnings
  are reported side by side and must not be conflated.
  This closes gatediseng metric review (3) as a measurement
  gap; it does not invent a post-hoc bar for it.

Verdict:
- PASS: survivor firing-seed rate <= 25% AND the in-time
  leg satisfied (every collapsing seed fires in time, or
  no collapsing seed exists). PASS means the rule is
  CONFIRMED and the deploy spec below is deploy-ready: a
  future arm may then make the deploy claim. PASS does not
  itself deploy anything.
- FAIL: survivor firing-seed rate > 25%, OR any collapsing
  seed fires late or never. FAIL means the rule stays
  NAMED-BUT-UNCONFIRMED; no deploy claim may cite this arm.
- INSUFFICIENT-DATA: tracer verification failure that
  cannot be repaired by re-run, a first-firing mismatch
  between the new evenings analyzer and the reused
  analyzer, missing fields, or zero survivors — with the
  failure stated.

A miss is NO-GO, never re-scored against a friendlier
metric mid-run (no re-basing the rate on pooled corpus +
confirm seeds, no relaxing the in-time margin, no
re-defining a firing evening) — metric doubts go under
"metric review" for the NEXT run.

## DEPLOY SPEC (decided here, not deferred; executed by NO arm in this run)

A future arm that makes the deploy claim must implement
exactly this spec (or re-prereg a different spec before
judging it). This arm implements none of it.

1. CODE CHANGE (src/js/game.js, sensor path only): add a
   disengaged-state branch alongside the engaged sensor.
   The gate itself is UNCHANGED (plenty line stays
   freshDays > 4, hunger override stays hungryStreak < 3,
   gate flag unchanged; NO hysteresis threshold is adopted
   — the 2.0 lowered line from candidate (b) is NOT part
   of this spec). On each evening, while gateEngaged is
   false, evaluate (c) on the same evening read the sensor
   uses (pantryKcal total, gateEngaged). On the first
   firing evening D of a disengaged stretch, emit a (c)
   warning record. The engaged sensor, its candidate rule,
   its D+5 confirmation, and its false-fire scoring are
   untouched.
2. VOICE / NARRATION LINE (village voice, on the firing
   evening, in words matching the evenings around a
   stand-down — cf. gatediseng-b sense test: "nothing
   extra for the pantry", "hunger gnaws"): "Tariq checks
   the pantry before heading out — the shelves stopped
   reading full days ago, and the store has kept falling
   since. Nothing extra is reaching it." The line names
   the stand-down and the falling trend, not a number or
   a gate condition; it must fire once per warning (see
   counting rule), never nightly.
3. COUNTING RULE FOR WARNINGS BORN IN A RE-ENGAGED RUN
   (DECIDED — this is the hysteresis counting gap, closed
   here): (a) ONE warning per disengaged stretch: only the
   first firing evening of a stretch issues a warning;
   later condition-satisfying evenings in the same stretch
   issue nothing and are not re-counted. (b) A (c) warning,
   once born, STANDS regardless of later gate state: gate
   re-engagement does NOT retract it, and it does NOT need
   an engaged D+5 evening to confirm — the 3-fall + 10%
   trend since the stand-down IS its confirmation. This is
   the direct answer to the gatediseng-b hysteresis gap:
   a lowered gate alone did not rescue the day-11 warning
   because its D+5 evening (day 16, freshDays 1.72) stayed
   below even the lowered line; under this rule, no warning
   ever waits on a re-engaged D+5, so no warning can be
   stranded by a D+5 that never re-engages. (c) If the gate
   re-engages and then stands down again, that is a NEW
   stretch, eligible for a NEW (c) warning. (d) For future
   false-fire scoring of (c) warnings, recovery is judged
   on PANTRY ONLY: the warning counts as recovered iff the
   pantry climbs back to its firing-evening level within
   10 evenings, regardless of gate state during recovery —
   gate membership plays no part in (c) scoring, at birth
   or at recovery.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged sim).
STEP 2 — TOOLS + PROOF (evenings analyzer, proof test;
  proof green after the prereg commit and before any
  judged application; proof test is pure, uses NO judged
  seeds — synthetic series only, no 52201-52212, no 51608,
  no 52101-52108 — and changes no prereg word).
STEP 3 — CONFIRM BAND (seeds 52201-52212 via the verbatim
  tracer; verified rows == daysAlive each; (c) firings +
  evenings counts + wall numbers).
STEP 4 — SENSE TEST (re-read transcripts around firing
  evenings on firing seeds, plus the 51608 day 12-28
  stretch already published; see below).
STEP 5 — EVIDENCE
  (evidence/2026-11-01/sim-gatediseng-confirm-b.md).

## Balanced panel (§15) — inapplicability declared (same as gatediseng-b)

No balanced-panel compare is fabricated. This arm changes
NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables are reported directly in the evidence file
instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported from
the confirm band: survival (seeds survived / 12, median
and max days alive), wave reach (max wave unlocked per
seed), and national / table / wins as NOT REACHED IN
WINDOW (expected 0 — those are late-game states with no
fields in this window, reported as such, not as a rate
claim).

## Sense test (SENSE-TESTING LAW)

Read the transcripts (sayLines) around firing evenings on
confirm firing seeds, and re-read the published 51608
day 12-28 stretch, and judge in plain words whether a (c)
warning on a confirm firing evening would read as the
village noticing in time, in words matching the evenings
around it. At least three lines are quoted in the evidence
file. A warning that would read as two voices disagreeing
on the same evening, or as an alarm from nowhere, is
reported as such even on a PASS — sense texture does not
re-score the confirm bar, but it travels with the deploy
spec.

## Attribution limits (stated before judging)

- Evening snapshots only: (c) reads evening pantry/gate
  values, the same read the sensor's counting uses.
  Intraday flicker is not measured and cannot change a
  would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days
  are computed on trajectories as run. A real (c) rule
  could change villager behavior and therefore later
  evenings; whether it would have saved any village is
  unmeasured and is not claimed.
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game
  legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  PASS here confirms (c) against the bars above and lands
  a deploy-ready spec; it does not deploy (c), and any
  deploy belongs to a future arm's claim.
- GateOn on confirm rows is recorded directly by the
  gatecover tracer, so no gateOn assumption is carried
  on this band (unlike the gatediseng corpus rows).

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
