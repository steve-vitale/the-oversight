# Journey leg ESTABLISHMENT — r110 pre-registration (2026-11-07, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109 precedent). Death-aware: stop after
10 consecutive all-dead daily checks; never tick a dead village to fill the
leg.

## Leg question (fresh — named by r109's metric review + the landed practice build)
The practice build (sim-drive-practice-a, 2b9b0371e) landed and is proven on
the LANDING leg: r112/r113 panels show practice moving competence in the
first month (94 attributed cells d1→d28 on 10/10 seeds, 3,364 practice reps
at d28). The establishment leg asks the next question: **does practice keep
moving competence in the second month (d28→d42), or does it saturate after
the first month?** The Nov 5 census (pre-practice) showed 0 competence
movement across 8 seeds / 30 villagers; the role-formation census
(sim-roleform-a) was GO with caveats on 80d. This run measures the d28→d42
window on the establishment panel, plus skill-from-zero and skills gained —
the ROLE PATHS commitment (Steve 2026-11-04): roles must form from lived
experience, competence moves with practice, skill builds from zero, hybrids
emerge.

Why this is not a re-proof (Steve 2026-11-01 rebuke; 2026-11-04 standing
rule): r109's Q1 (thin-beat stall) was SUBSTRATE-MISSING and its Q2
(no-teacher split) is GO — neither is re-judged. The landing-leg practice
verdict is not re-judged either; the d28→d42 window is unmeasured. Funnel
numbers are reported descriptively; the verdict turns on second-month
practice movement.

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r110-20261107.js` — r109 driver
   clone (same competent policy base, same 42d horizon, same census, same
   telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check with r109 hygiene). ONLY driver changes: run tag / seed file names,
   and the PRACTICE SNAPSHOTS:
   - `practiceSnapshot(Game)` cloned from the landing r112 driver
     (`Game.villagerCompetence` per task × 14 tasks, `p.practice` reps,
     `Game.specialistSkill` × 5 specs, `foodXp`, `npcSkills`) — pure reads,
     no RNG, no Game writes. Takes Game as a parameter (in this driver Game
     is local to runSeed, unlike the landing driver's module-level Game).
   - Snapshots at d1 (start, after setup), d14, d28 (end of the day the
     scholar day hits 14 / 28), dEnd (end of run, next to holdingsEnd,
     before the people check). Stored as `{day, snap}` pairs so the
     analyzer reads the actual snapshot days (daily rows run day 2–43 for
     a 42d run: sleep advances the day first).
   - Driver-neutrality check: the r110 panel's funnel keys
     (endDay/aliveEnd/aliveAt40/wave/pantry/deaths/teleTypes/skillCounts/
     huntStaff counts) must reproduce r109's after-panel exactly, and the
     convo transcripts must be byte-identical — the snapshots are pure
     reads, so any divergence is investigated, not waved. The proof test
     runs the same check on a 5-day seed-1502 run first.
2. Analyzer `scripts/analyze-journey-establishment-r110-20261107.py` —
   r109 analyzer clone, re-pointed at r110 files, plus:
   - Practice section: moved competence cells d1→d14, d14→d28, d28→dEnd
     per seed (same villager id in both snaps only; dead/left excluded),
     attributed = reps > 0 in that task at the later snap; skill
     0→positive (specialist/foodXp) and npcSkills gained per window;
     per-task movement table; practice reps totals.
   - Holder-dating table (Q2): every dEnd field_dressing holder dated via
     telemetry villager_skill rows or snapshot brackets (d1 seeded /
     (d1,d14] / (d14,d28] / (d28,dEnd]).
   - Funnel-reproduction table (r110 vs r109 after-panel, per seed).
   - Q1/Q2 verdicts, M1b/M2/M3/M4 continuity, funnel descriptive.
3. Proof test `scripts/test-journey-establishment-r110-practice.js` —
   r112 proof-test pattern (static driver checks + synthetic-corpus
   analyzer runs in temp dirs, no repo writes) plus a live det-gate: the
   r110 driver on 5d seed 1502 (HUNTSTAFF=2) reproduces r109 after-panel
   seed-1502 funnel keys at day 6 (endDay/alive/pantryKcal/deaths≤d6/
   skillRows≤d6). Written BEFORE the panel runs; green before the panel
   is judged.

## Run order (binding — single panel on the current engine; no lever change, no before/after)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. Panel: the r110 driver on current master, 4 seeds × 42d.
3. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SECOND-MONTH PRACTICE MOVEMENT
- Instrument: single panel (same driver, same 4 seeds as r107–r109).
  Moved cell = villagerCompetence(task) differs between two snapshots for
  the same living villager; attributed when that villager holds practice
  reps > 0 in that task at the later snapshot.
- Bar (binding): GO if attributed moved cells d28→dEnd ≥ 1 on ≥ 3/4 seeds.
  NO-GO if 0 attributed moved cells d28→dEnd on ≥ 2 seeds (movement stalls
  in month 2). Pool sizing (§14b): the landing panel moved ~9.4 attributed
  cells/seed over d1→d28; a proportional d28→dEnd pool is ~4–5/seed — the
  bar (≥1 on 3/4 seeds) sits well inside the pool, not 30x above it.
- Guardrails (binding, §14): M3 survival-42 (≥3/4 seeds alive at 42) and
  M4 pantry-guardrail (starvationDeaths 0 on ≥3/4 seeds) must hold; a GO
  met with a guardrail breached is NO-GO.
- Descriptive (not judged): moved cells d1→d14 and d14→d28 (continuity
  with landing), skill 0→positive d1→dEnd, npcSkills gained, per-task
  movement, top-task/role shape at dEnd vs d1 (hybrid formation).

## Q2 SECONDARY — HOLDER-SINCE DATING HOLE (r109 metric-review instrument item)
- Ursula (1603, mortician) gains field_dressing with no datable row —
  holdings are snapshotted only at start/end, so a mid-run gain can't be
  dated. The Q1 snapshots (d14/d28/dEnd npcSkills) + telemetry
  villager_skill rows close the hole: every dEnd holder gets a dating
  bracket.
- Bar (binding): GO if every living dEnd field_dressing holder is datable
  to a ≤14-day window (telemetry day or snapshot bracket) AND ≥1 gain is
  observed in the d14–dEnd window. NO-GO if any living dEnd holder is
  undatable. If 0 gains occur in d14–dEnd: unexercised, not a failure —
  report as such (r109's after-panel showed 4 gains in d28–d42 on these
  same seeds, so the pool is expected to fire).

## Seeds
Matched reuse 1502, 1504, 1603, 1604 (r107/r108/r109's four firing seeds —
deliberate matched reuse for funnel comparability). No new band: no new
seeds are claimed; the freshness rule applies to NEW bands.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109's
latest behavior). The play loop is byte-identical to r109's driver (only
the practice snapshots are added, pure reads), so the panel's funnel
numbers should reproduce r109's after-panel numbers; the det-gate in the
proof test + the panel itself verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master 2016a7ed0 at run start (verified by `git pull`, already up to
date; includes r109 Q2 split + landing r113 NAV-log/practice +
finishersize/linkdrive). Worktree `journey-establishment`, branch
`journey-establishment`.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109.

## Metric review (carried from r109; for the NEXT run, not this one)
- M1 ladder 'words' side: a lesson fails honestly on language when a
  teacher is at home — stays as-is; this panel's prep rows are expected
  to be all no-teacher again (r109: 12/12), so the words rung stays
  unexercised. If a lesson row fires, report its why.
- Same-animal held/notheld kcal ratio is the better frac instrument —
  descriptive only this run (analyzer already prints by-aid held/notheld).
- "veteran kill" hype line fires for non-wave-4 kills + accept lines
  repeat verbatim — narration pool work, NOT this run's scope (Loop B's
  arena/gauntlet axis owns it).
- Thin-beat stall — SUBSTRATE-MISSING in r109, stays parked.
