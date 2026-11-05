# journey-scale r100 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-05T1145CST (scheduled 11:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@1a898136c at worktree creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only
except the policy arm's own pressed verbs (fillWater / donateToPantry
are offered player verbs, pressed like a player would); pickers press
offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r97's,
r98's, or r99's verdicts (pilgrimage reset mover = COMPETENT thirst
walk; overnight drain separates on pack water / tile water; national
0/4; people check real; walk-out water mechanism = dawn fill fails
two ways). It tests r99's proposed POLICY ARM on the same matched
band: competent tops up bottles at Haven during daily before a
pilgrimage walk-out (unload-then-fill ordering).

## Standing context (read before scoring)
- r99 (2026-11-05 morning, seeds 85501–85504, same band): the walk-out
  water mechanism is identified descriptively. Two dry walk-outs on
  the band, two causes: **85503 d36** — cistern dry at dawn (the
  village drinks the night's boiled clean before the scholar wakes;
  hearth boils only at the day boundary; Ruth returns +4 clean during
  the dusk wait, AFTER the last fill attempt); **85504 d34** — pack
  full at dawn (two 9kg Cattail stacks hauled d33; the pack sheds to
  6.9kg during d34's daily, but the fill attempts already failed at
  dawn). Competent's only fill attempts are the 3 upkeep passes
  (dawn/midday/dusk, before the courtship walk); competent.daily
  NEVER fills at Haven (drinkSafe sits inside the thirst-home block,
  gated on NOT being at Haven). The game offers the verb (fillWater
  at Haven whenever clean is available); the bot doesn't ask at the
  right time. That is a policy (bot) gap, not a game bug.
- r99's band: 10 walk-out days (FIRST 8, RETRY 2). Dry walk-outs
  (postCourt packW 0): 2/10 (85503 d36, 85504 d34). Wet walk-outs
  (postCourt packW ≥ 2): 8/10. Refusal lines separate DRY vs WET
  perfectly on that cut (2/2 dry, 0/8 wet).
- Consequence chain (r99, descriptive): a dry walk-out starts the
  thirst-walk reset loop — 85503 d36 → 14 resets (d37–d51), 85504
  d34 → 14 resets (d35–d48); a wet walk-out studies and completes.
  Resets on the band: 28 (14 COMPETENT + 14 COMPETENT, r99 Q1c).
- Code facts (read, not assumed): `Game.fillWater()` fills ONE bottle
  (1L), costs 10 kcal + 1 tick, refuses aloud when the cistern is dry
  ("The cistern is dry...") or the pack is full ("Your pack is full
  — water is heavy (1L = 1kg).") — game.js:14659-14719. At Haven it
  draws from the shared cistern (`state.village.water.clean`).
  `Game.donateToPantry(i, amount)` moves pack food to the pantry
  (cap-real); competent's `donateHaul` (exported from competent.js)
  already sheds donation-ready surplus above keepKcal during daily
  (line 1081) — on 85504 d34 it shed the two 9kg stacks (23.1 →
  6.9kg) BEFORE the walk, which is why the fill-after-daily placement
  can work without a new unload mechanic. The arm's unload pass is a
  safety net for days daily didn't shed enough.
- Band: 85501–85504 is the r97/r98/r99 MATCHED band, reused
  deliberately for comparability; no freshness claim is made for it.
- Canon (read): docs/CANON.md (no-silent-actions law), docs/SCALE.md
  (national = one primary with ≥3 seasoned subordinates, or
  BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season).

## Tooling (one policy arm + clones; zero src/js)
- **Policy arm:** scripts/policies/scalecourt-nogate-morntrace3-fill.js
  = r99 morntrace3 clone PLUS one behavior addition and one logging
  fix. Behavior: `topUpBeforeWalk(Game, ctx)` runs in `daily()`
  AFTER competent.daily (after the postCompetent snapshot, so the
  analyzer can compare pre-fill vs postCourt state) and BEFORE
  courtship (so the fill lands before the walk). Gate: scholar at
  Haven AND a pilgrimage is in progress (`ctx._pilgrim` set, not
  returning, not stale >14d, target unlinked) — i.e. a walk-out day.
  Steps: (1) UNLOAD — if pack room < 3L, call `donateHaul`
  (competent's own surplus shed, exported) once; (2) FILL — call
  `Game.fillWater()` until the scholar carries 3L or a refusal
  (null) stops the loop (max 3 calls, 10 kcal + 1 tick each). Counts
  in ctx: `fillTopUps` (days the arm filled ≥1L), `fillTopUpLiters`,
  `fillUnloads`. The fill's own narration ("Filled 1L...") and
  refusals are the game's honest lines, not instrument text.
  Logging fix (r99 metric review): packTop falls back to the item
  NAME when itemId/id is absent (raw forage stacks read `?:9`
  in r99; the capture names them Cattail).
  Diff vs the r99 clone must contain ONLY: the header, the name
  fallback, the topUp function + its call + the donateHaul import.
  The standing scalecourt-nogate.js, morntrace3 clone, and r97/r98
  clones are untouched; this clone is this run's instrument only.
- Driver: scripts/journey-scale-r100-20261105.js = r99 driver,
  labels/seeds/EVIDIR only (85501–85504, DAYCAP 180), PLUS the
  policy require → morntrace3-fill and three census fields from ctx
  (`fillTopUps`, `fillTopUpLiters`, `fillUnloads`). All other
  instruments unchanged (water-watch refusal dump, morntrace3 rows,
  postrace, trust json/txt, wantwatch, capture).
- Analyzer: scripts/analyze-journey-scale-r100-20261105.js = r99
  analyzer, labels only, PLUS the revised Q1 gate (below) and the
  fill-counter report per seed. Q1b/Q1c/Q2/Q4 carried unchanged.

## Q1 — FILL ARM ELIMINATES DRY WALK-OUTS (binding)
**Question:** on the matched band, does topping up bottles at Haven
during daily before a pilgrimage walk-out eliminate dry walk-outs?
**Walk-out day (operational, as r99):** a day D whose entry snapshot
is at Haven (4,4) and whose postCourt snapshot is away from Haven
with a pilgrim set. DRY = postCourt packW 0; WET = postCourt
packW ≥ 2; PARTIAL = postCourt packW 1 (counted separately, neither
dry nor wet).
**FINDING clause (pre-registered, not re-scored):** the arm works if
dry walk-outs are **0 across the quad** (r99: 2 dry / 10 walk-outs),
with the fill counters showing the arm fired on the walk-out days
(`fillTopUps` ≥ 1 on each seed that walks out dry in r99 — 85503
and 85504 — and `fillTopUpLiters` ≥ 2 on those days). PARTIAL if
dry walk-outs fall to 1. FAIL if dry walk-outs stay at 2 (the arm
did not take) — reported as a failed arm, not re-scored against a
friendlier cut. The FIRST-vs-RETRY cut is NOT the judge this run
(r99 metric review: the wrong cut); DRY-vs-WET at postCourt is.
**What would count as interesting:** 0 dry walk-outs + the arm
firing on both formerly-dry days = the thirst-walk reset loop was
a bot artifact (the game offered the verb; the bot didn't ask),
and the policy fix is the correct layer. A dry walk-out that
SURVIVES the arm (refusal lines on that day in the water-watch)
names the NEXT mechanism: cistern genuinely dry at postCompetent
time (not just at dawn) or room < 3 even after the unload pass.

## Q1b — RESET-LOOP CONSEQUENCE (report-only, expectation named)
If Q1 passes, the reset loop should collapse: r99 had 28 resets
(14 COMPETENT on 85503 + 14 on 85504), all downstream of the two
dry walk-outs. Report resets per seed vs r99's 28 and the
first-attempt study rate (r99: wet walk-outs study and complete).
No threshold, no verdict — the count is the consequence, and a
collapse corroborates Q1; a surviving loop with 0 dry walk-outs
would mean the reset has a second cause and gets carried as the
next micro-question.

## Q1c — MOVER + DRAIN REGRESSION (report-only; r97/r98/r99 checks rerun)
The r99 Q1b/Q1c classifications run unchanged on the r100 output:
resets by segment and the drain table (first vs retry nights, burn
prediction, drankNight). A change from r99's numbers on the same
band is EXPECTED here (fewer loop nights if Q1 passes) — the
regression check is on the BURN MODEL, not the counts: on the
nights that remain, drain must still separate on pack water /
tile water and match the burn prediction within ±10 (r98 metric
review). If the burn model breaks on remaining nights, report it;
do not re-score r97/r98/r99.

## Q2 — CENSUS CONTINUITY (report-only; r93–r99 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96/r97/r98/r99)
One full sitting read in full from a surviving seed at day 90 if one
exists (85503/85504 pattern); no day substitution if none survives
to day 90. Corpus size is reported, not padded. Verdict: real vs
filler/faked-history, with quoted lines.

## Metric review (carried)
- Q1's FINDING clause is new for this run (the revised DRY-vs-WET
  gate r99's metric review proposed). The 0-dry bar is set from what
  the band is known to hold (2 dry / 10 walk-outs in r99), NOT from
  a statistical-power claim — this is a mechanism test on a
  small-n matched band, and the note must say so.
- The arm's scope is deliberately narrow (walk-out days only, Haven
  only, max 3L). A general "competent fills at Haven during daily"
  change would alter the whole run's hydration economy and break
  the matched-band comparison; it is NOT in this run.
- Burn-prediction tolerance (r98 metric review): ±10 stands; any
  outside-±10 drink-night case is reported as timing noise, not
  re-scored.
- Telemetry baseline: scripts/telemetry-check.js step 14 runs at
  closeout against telemetry-baselines/scale.json; baseline NOT
  rolled forward without a LOUD-line investigation.

## Fix gate (clause (a) discipline, as r96/r97/r98/r99)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. This run's
arm is POLICY-side (the bot), not game code: if Q1 passes, the
finding is that the reset loop was a bot artifact and the policy
clone's behavior is the correct layer — the standing competent
policy does NOT change in this run (a standing-policy change is a
separate decision, proposed for the next run with its own prereg).
If a dry walk-out SURVIVES the arm with a cistern-dry refusal at
postCompetent time, that names the next instrument (what drains /
refills the cistern across the day boundary), not a same-run game fix.
