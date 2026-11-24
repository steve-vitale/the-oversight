# Accord answering — Loop B, run fleshout-loop-b-20261124T0840Z, arm sim-accordanswer-b (POLICY PROBE)

Axis: winnability chain (re-point 2026-11-03). POLICY PROBE: zero
src/js changes — the arm flips the existing env gate only
(`ANSWERMAIL_DRIVE=1`, landed sim-answermail-drive-a); the
instrument is a neutral recorder layered over the havenlink
instrument, reused verbatim.

Prereg HEAD: `a77a5a749` (worktree sim-accordanswer-b; includes
Loop A retarget-a merged NO-GO with its lever reverted, and the
havenlink corpus anchor `ae5ee3892` as an ancestor). This prereg
is committed BEFORE any judged sim.

## Ground truth (read first)

`evidence/2026-11-24/sim-havenlink-b.md` §Next blanks #2: the
first gesture is never made — `pendingAccord` stages at link
formation and sits unanswered to run end on 7/7 linked seeds
(99 days on seed 109301). The competent policy never calls
`answerAccord`, and the engine's auto-answer
(`_answermailDriveDaily`) is env-gated (`ANSWERMAIL_DRIVE=1`,
default OFF). The Regional Dawn fires anyway, so the unanswered
accord blocks nothing mechanically — but the fiction says "the
gesture goes out now" while no gesture ever goes out.

Prior measurement of the SAME mechanism (not a duplicate of
this arm): `evidence/2026-11-10/sim-answermail-drive-a.md`
(Loop A, band 150201–150208, 150d): the drive answers the
accord 1/seed and seasons links 7/8 armed vs 0/8 control;
verdict NO-GO on its starvation cost bar (2 armed starvation
deaths against a cap of 0). So the mechanism is PROVEN to fire
and to season links. This arm does not re-prove that. It asks
the narrower question the havenlink blank left open, on the
havenlink band: on THESE seeds, is the accord fiction-only or
mechanically load-bearing downstream — and what does answering
it cost HERE?

## The question, pinned down

(a) Answer rate: of the accords staged on this band, how many
get answered on the arm, by whom, on what day, after how many
pending days — and how many sit unanswered to run end on the
control (reproduction of the havenlink finding)?
(b) Downstream deltas vs control on identical seeds: links
formed, standing (final / peak / capped), Regional Dawn day,
seasoned links at end, scaleRank, national / table / wins,
wave 4–5 unlocks and facings, survival days, deaths (total +
starvation). Is the accord fiction-only (zero downstream
delta) or load-bearing (a delta the drive arm's band did not
isolate)?
(c) The gesture's price on this band: kcal actually paid per
answer (full 2,000 vs partial vs bare-pantry), trust gained at
answer, tend/renegotiation/demand answers riding along (the
drive answers more than accords — see Confound below), and
any new offers/counters staged on either leg.

## Mechanism, as found in code (re-read at this anchor)

From `src/js/hierarchy.js` (unchanged in the accord path since
the drive arm — no hierarchy.js change in the havenlink anchor
lineage):
- `stageFirstAccord(link)` stages `state.pendingAccord =
  {linkId, day}` at link formation and says "the gesture goes
  out now"; the Regional Dawn is separate (fires when a bond
  is 21+ days old, via `_checkRegional` / `_fireRegionalDawn`).
- `answerAccord(how)`: `gift` pays 2,000 kcal from the pantry
  (partial if the pantry is short; trust +10 at full payment,
  scaled down otherwise), `visit` loans the representative for
  3 days (trust +8), `cold` sends nothing (opinion −3).
- `_answermailDriveDaily()`: ADDITIVE-ONLY, DEFAULT-OFF engine
  hook, fires only when `ANSWERMAIL_DRIVE=1` in node (browser
  `process` is undefined, so shipped play never runs it). Once
  a day it picks a living available representative via
  `_availableRepresentative()` (never the player; a dead bench
  means unanswered mail that day, counted as blocked) and
  answers the pending accord with `gift` (only if its link is
  still active), then tends LEAD links weekly when the pantry
  holds > 20,000 kcal, answers staged renegotiations with a
  gift, and honors pending demands. Stats live on
  `state.answermailDrive` (created only when the flag is on):
  accordAnswers, tends, tendsBlockedPantry,
  renegotiationAnswers, demandAnswers/kinds, blockedDays,
  answerers + answererNames, errors, firstAnswerDay. Never
  proposes a link, never answers counters or national/global
  beats.

## Confound, stated up front (not discovered later)

The env gate answers MORE than the accord: weekly tends,
renegotiations, demands ride along on the armed leg. The
instrument separates them — accord answers are recorded as
their own event stream (channel, actor, day, how, kcal paid,
trust gained) and `driveStats` breaks out tends /
renegotiations / demands per seed — but downstream deltas
(standing, seasoned links, Dawn day) are the DRIVE's total
effect, not the accord's alone. The accord is isolated only
at the answer event itself (its price, its trust gain, its
lag). Any claim that a downstream delta is "the accord's"
rather than "the drive's" would be over-claiming; the
evidence file will say "drive" where it means the drive.

## Canon

No canon doc covers the accord / answer-mail area. The canon
manifest (`docs/CANON.md`) has no accord doc; `docs/SCALE.md`
covers polity shapes, the 30-day season, the trust-40 bar,
and the first gesture at formation (per the drive arm). This
arm is grounded in the `hierarchy.js` comments quoted above
and in the havenlink evidence — stated, not invented as canon.

## Duplicate check

Loop A's live claim (`fleshout-20261124T0715Z`, axis
scale-onramp) is retarget / holdspeak / departteach.
Holdspeak is held DEPARTURES speaking — a different thing
from accord-answering. No live claim or branch does
accord-answering. The 2026-11-10 drive arm is LANDED, not
live; this arm reuses its gate on a different band for a
different (narrower, downstream) question.

## Pre-registration (§11 — frozen before any judged sim)

- **Primary metric:** accord-answer rate — answered / staged
  per seed, pooled over the band. Staged = `stageFirstAccord`
  events; answered = `answerAccord` events (channel recorded:
  engine vs policy vs UI; on this band the only answerer is
  the engine drive).
- **Secondary metrics (downstream deltas, paired per seed):**
  links formed, standing final / peak / capped, Dawn day
  (`networkLiveDay`), seasoned links at end, scaleRank,
  national / table / wins, wave 4–5 unlocks + facings,
  survival days, deaths total + starvation.
- **GO bars (frozen):** INSTRUMENT VALIDITY — every staged
  accord has an answer event recorded with actor + day on the
  arm, or a recorded unanswered span to run end on the
  control; 0 instrument errors on every seed; control
  reproduces the havenlink corpus on the 8 frozen fields
  (days, endReason, scaleRank, maxWave, endUnlockedWave,
  bestCapped, doorOpenDay, daysAt199) 8/8. Effect is measured
  either way — a zero downstream delta IS a verdict.
  **Verdict: DIAG-GO if classification is complete**
  (answer rate + downstream table + sense-test story all
  recorded, instrument valid), not a failure if the delta is
  zero. DIAG-NO-GO only if the instrument fails, the control
  does not reproduce, or classification is incomplete.
- **Cost guardrail (reported loudly, not re-scored — the
  verdict is diagnostic):** starvation deaths armed ≤
  control + 2 AND median survival armed ≥ 0.8× control
  median (the same bar whose breach made the drive arm NO-GO;
  a breach here is flagged as a cost finding in the evidence
  file, with the drive arm's lesson cited).
- **Legs:** control = competent policy VERBATIM, default env
  (drive off — `driveStats` must read null on every seed);
  arm = competent VERBATIM + `ANSWERMAIL_DRIVE=1` (engine
  drive on; the driver FAILS LOUDLY if the arm leg runs
  without the env flag, or the control leg with it). Two legs,
  one driver, separate node invocations (no env leak).
- **Seeds:** 109301–109308 (8 seeds, the havenlink band —
  replay for comparability, NOT a fresh band). Horizon 150
  days, death-aware (never a fixed 200d). Reason: the question
  is reachability-shaped (waves 4–5, national, table) and the
  baseline survival distribution is known from havenlink
  (days 36–150, median 122.5, 3/8 censored at 150).
- **Balanced panel (§15):** before/after compare through the
  shared instrument, built from the per-seed corpus
  (pseudo-policy pattern, paired seeds — the same pattern as
  `scripts/build-answermail-drive-panels-20261110.js`). The
  panel is the instrument; the pre-registered bars above are
  the judge. Panel metrics mappable from this corpus: won,
  national, survival30/60, communityLost, villageDeaths,
  villageDeaths100Days; playerDeaths not instrumented — left
  null, never faked.
- **Convergence state to report:** DIAG (not a tuning lever).

## Substrate checklist (§14b — before the pilot)

1. **Contact:** pendingAccord stages 7/7 linked seeds on this
   band (havenlink, measured) — the phenomenon occurs.
2. **Pool sizing:** 7 staged accords on 8 seeds; the bar is a
   rate over that pool, not an absolute figure pulled from
   nowhere.
3. **Verb existence:** `answerAccord` + `_answermailDriveDaily`
   exist in code and the drive arm proved they fire (accord
   answered 1/seed on its band).
4. **Horizon fit:** accords stage days 20–59 on this band,
   well inside the 150-day horizon; the Dawn follows 21+ days
   later, also inside.

## Expected shape (a prediction, not a bar)

Control reproduces havenlink: 0 answers, 7/7 accords
unanswered to run end, Dawn fires on schedule. Arm answers
7/7 staged accords within a day or two of staging (the drive
ticks daily; a dead bench blocks a day), each gift costing up
to 2,000 kcal. Downstream: the drive arm's band showed
seasoned links 7/8 armed vs 0/8 control — if that repeats
here, the accord is load-bearing through seasoning, not
fiction-only; if standing / Dawn / scale do not move, the
verdict is still DIAG-GO with a zero-delta downstream table.
