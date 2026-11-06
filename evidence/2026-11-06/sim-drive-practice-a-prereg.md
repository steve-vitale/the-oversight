# sim-drive-practice-a — preregistration (practice moves competence)

- Run: `fleshout-20261106T1415Z`, Loop A, axis self-improvement drive
  (Steve 2026-11-06 10:22 CST: "villagers don't continually seek to improve
  themselves and their village")
- Arm: `sim-drive-practice-a`, worktree
  `~/workspace/worktrees/sim-drive-practice-a`
- Band: **99451–99458** (8 seeds, pilot)
- Horizon: **80d max, death-aware** (run until game over; villages that die
  stop simulating, +10d tail max). Why 80d: practice accrues per resolved
  assignment (up to ~4/day for a steadily-assigned villager); the scholar
  shape needs 8 reps for the first rung, so 80d gives every practicing
  villager many rung chances while staying inside observed village
  lifetimes (median survival ~day 39–63 on the scale wall).
- Policies: `scripts/policies/competent` (verbatim, NOT modified). No new
  policy. No gate/price/deed/readyDemand change. No table.js change.
- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read for wave context.
  No canon doc covers villager practice/competence growth (CANON.md's
  "Human skills ≠ alien abilities" is the governing rule instead: practice
  grows HUMAN competence/skill, never grants alien abilities, never touches
  the six slots). The scholar-side shape is game.js `practice(stat,n)`
  (game.js:2069, "practice makes human").

## The diagnosis this arm attacks

Role census 2026-11-05 (8 seeds, 30 villagers): competence moved 0 cells,
skill moved 0→positive for 0 villagers. `villagerCompetence` (game.js:6281)
is a pure function of formerOccupation (+ temperament) with no experience
input. `specialistSkill` (food.js) hard-gates skill at zero for
non-matching occupations. Wave-4 killers sit at Haven 100% of days after
the kill with no hunt-the-next-one drive (killersurvive-a).

## The lever (BUILD, inside existing systems)

PRACTICE MOVES COMPETENCE, mirroring the scholar-side shape:

- Every resolved assignment (the single choke point,
  `resolveOneAssignment`, tail) records one practice rep for that villager
  in that task, stored on the villager record (`vp.practice[task]`, same
  pattern as `foodXp` on the person record).
- Enough reps raise competence one rung on the ladder
  0.7 / 1.0 / 1.2 / 1.3 / 1.4, capped at 1.4 (practice makes you as good as
  a natural, never better). Thresholds mirror the scholar shape:
  8 reps for the first rung, +4 per rung after (8, 12, 16 — 36 reps to
  max). No RNG, no new system, no new verb: the work villagers already do
  is what teaches them.
- On a rung gain the villager says one plain line ("getting the hang of
  …") — the improvement must read as a person getting better, not a
  number ticking. Sense test: read those lines.
- Scope: ONLY the competence/practice regions of src/js/game.js
  (villagerCompetence + the practice-recording call site) — a sibling arm
  owns game.js spawn sites this run and Loop B is live on other game.js
  regions. NEVER touched: spawnWorldMonster, trap/wanderer/fled-recovery
  spawns, pyrrhic attribution, table.js, any gate/price/deed/readyDemand.
  `specialistSkill`'s zero-gate lives in food.js, OUTSIDE this arm's
  regions: NOT fixed here; recorded as a follow-up blank (see below).
  The killers-sitting-at-Haven drive is a goals/objectives question, NOT
  this arm's target; second-kill timing is measured as context only.

## Steve's 2026-11-06 11:48 CST ruling (recorded mid-run)

REWARD ALL PATHS, NOT JUST KILLING: the drive must reward every path, not
only killing; roles differentiate by personality; measure by role
formation across ALL five tracks (combat, field, social, craft, strange),
not by kill counts alone. This arm complies by design: practice accrues
on ALL 14 tasks (hunt through mend), the primary metric is competence
movement across all task domains, and kill counts never judge it.

## Primary metric and verdict rule

- **Practicing villager** = a villager in the end snapshot with ≥8
  resolutions in a single task (one rung's worth of work in that task).
- **Cells moved** = ladder-rung movement of `villagerCompetence` between
  the day-0 and end snapshots, summed over tasks, temperament-normalized
  (observed competence ÷ temperament multiplier, then rung-index diff on
  the 0.7/1.0/1.2/1.3/1.4 ladder). Movement is counted per
  (villager, task) cell.
- **GO** iff on the ARMED leg ≥50% of practicing villagers move ≥1 cell
  AND the BASELINE leg shows 0 cells moved for every villager (the
  instrument check: competence is a pure function without the lever).
- **NO-GO** iff the armed leg moves <50% of practicing villagers, or any
  villager's competence DECREASES (practice must never lower competence),
  or the baseline leg moves any cell (instrument broken — stop and fix the
  instrument, do not re-score).
- Guards (reported, NOT gated): wall numbers per leg (national / table /
  wins, wave 4–5 unlocks, median survival); rung-gain narration lines
  read for sense; no new death mode introduced (death-cause shares from
  the daily rows).
- Secondary, context ONLY (never re-judged): second-kill timing from
  waveKillLog (wave-4 kills per killer, days between first and second
  kill); cells moved broken down by task (all 14) as the role-formation
  picture across tracks. At pilot scale (8 seeds × 80d) wave-4 kills are
  expected to be ~0–2 total; an empty second-kill table is "unmeasurable
  at this scale", not a NO-GO.

## Method

1. **Instrument** (`scripts/drive-practice-census-20261106.js`, adapted
   from `scripts/rolecensus-20261104.js`): per seed, competent policy,
   80d death-aware; start/end snapshots of villagerCompetence per task +
   practice reps; resolved-assignment log (outermost call, final task);
   rung-gain say lines captured; wall snapshot tracked daily
   (maxRank/maxArc/everTable/everWon).
2. **Pilot**: 8 seeds, BASELINE leg first (current master, no lever),
   then ARMED leg on identical seeds. Confirm 12–16 seeds ONLY if the
   pilot passes GO.
3. **Analysis** (`scripts/drive-practice-analyze-20261106.js`): per-leg
   practicing-villager share moved, cells moved (total + by task),
   practice reps, wall numbers, second-kill table.
4. **Proof** (`scripts/test-drive-practice-a.js`): unit — practice moves
   competence one rung at 8/20/36 reps, caps at 1.4, never decreases,
   temperament still applies; integration — a scripted villager resolving
   assignments gains a rung and says the line. Green before the evidence
   file is written.
5. **Balanced panel (§15)**: `scripts/balance-panel.js` runs its own full
   panel and takes no corpus input — it cannot compare this census corpus
   on identical seeds (same limitation recorded by killersurvive-a and
   other census arms). Before/after is therefore the identical-seed
   census comparison in (3), with the compare table attached to the
   evidence file. No compare `.md` is fabricated from the panel.

## Seed-freshness record (band 99451–99458)

- Searched ALL dated preregs (`evidence/*/sim-*-prereg.md`): 0 hits for
  99451, 99452, 99453, 99454, 99455, 99456, 99457, 99458 individually,
  and 0 hits for the range string "99451–99458".
- Checked the near bands that ARE used, so the next worker does not
  repeat the check: 99501–99508 is reserved by the askplus arm (2026-11-04,
  "asking works on band 99501–99508"); 99052, 99351, 99354, 99356, 99358
  appear in preregs; 996xx/997xx/998xx/999xx heavily used.
- Searched the goal hidden_files forbidden/contaminated lists: 0 hits for
  9945x seeds or ranges.
- Screens: "99451" appears in evidence/2026-10-14 fifthlink r26 screen
  files and "99451" in 2026-10-24 fullpantry corpora — verified NOT seed
  uses: the fifthlink hits are village IDs (`village_spl_27_99451`), the
  fullpantry hit is a float substring (`2176.7185129945165`). No seed use
  of 99451–99458 anywhere. **Band 99451–99458 is FRESH.**

## Metric review (pre-run note)

- Temperament normalization is load-bearing for the cell count: a bold
  hunter reads 1.4×1.15=1.61, a cautious one 1.4×0.9=1.26. The analyzer
  divides by the temperament multiplier before rung-indexing; if a
  competence value ever falls off-ladder after division, the analyzer
  must fail loudly rather than silently bucket it.
- "Practicing villager" (≥8 resolutions in one task) is a low bar by
  design: the pilot's job is to show the mechanism fires at all. If the
  pilot passes GO trivially (e.g. everyone maxes by day 20), the pacing
  question (thresholds too fast — homogenization toward 1.4 everywhere)
  goes in the evidence metric review as a design concern for the NEXT
  run; the GO verdict itself stands, because the prereg binds the
  threshold, not the pacing taste.
- The specialistSkill zero-gate (food.js) is deliberately out of scope:
  competence movement alone does not open specialistSkill>0 for
  non-matching occupations. If the armed leg moves competence but the
  role-formation picture still shows 0 skill movement, that is the
  documented next blank (food.js arm), not a failure of this lever.
- Second-kill timing is context only: this arm changes how good
  villagers get at work, not whether killers go back out. A flat
  second-kill table does not overturn a competence GO.

## Convergence state

Axis self-improvement drive: NOT converged. This arm is the first lever
on the practice-moves-competence rung of it.
