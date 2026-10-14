# sim-sharcensus-b — per-villager meal census instrument (2026-10-14)

ARM 3, instrument-only. **No game-code changes, no policy files.**
Worktree: sim-sharcensus-b. Commit: TBD (see footer).

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Instrument under test**: scripts/sharcensus-20261014.js — wraps
  `villageEats` (outermost = membership.js roster filter), `villagerMealDay`,
  `pantryDraw`, `drawSpoiled`, `packMeal`. Per villager-day records: kcal
  eaten, drawn-from-pantry vs own production, hunger before/after, trust +
  trustFactor at meal time, health before/after, away, rhythm, meal order,
  pantry fresh kcal before/after, and the ENGINE PATH that decided the
  outcome. Paths are the real code branches (game.js ~26402/25784/25964/
  25984, membership.js:1008) — no invented categories.
- **Primary metric (diagnostic GO)**: attribution coverage =
  starved-villager-days (ate < 0.6×need, !fasting — the engine's own
  starvation branch condition) carrying a named engine path ÷ all
  starved-villager-days. **GO ≥ 0.80.** A miss is NO-GO on the instrument,
  never re-scored.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop (+10d tail).
- **Seeds × policies**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek,
  single process, landed production throttle (no lever — this run builds the
  instrument that adjudicates the sibling arms).
- **Determinism caveat** (sim-findings #113): each seed ran once; per-seed
  numbers reported honestly, single-seed deltas not over-read. s44 completed
  clean on both roads (d96/d180) — no stall this run.

## Proof test (scripts/test-sharcensus-20261014.js) — 16/16

- **RED** (pristine engine, PHASE=red): raw `villagerMealDay` returns
  {ate, gave, drawn, fasting} attribute 0% of meal outcomes; trust is
  invisible; the severed villager leaves no trace. 4/4 — the gap is real.
- **GREEN** (instrument installed, PHASE=green): 10/10 fixture rows name a
  real engine path; exile → `nonmember-withheld` skip recorded; away →
  `away-pack`; trust 5 → trustFactor 0.2 on all rows; the trust→sharing
  channel measured live (gave 38 vs 188 kcal at trust 5 vs 90, same seed —
  ~5× = the trustFactor ratio). 8/8.
- **HONESTY** (PHASE=honesty): 4 seeds × 30d leadcourt in-process A/B —
  armed trajectories **byte-identical** to pristine. The instrument consumes
  zero RNG and changes zero behavior. 4/4.

## Diagnostic verdict: GO — coverage 44/44 = 1.00 ≥ 0.80

## Measured taxonomy (16 runs, 12,324 villager meal-days)

Meal-path shares (all villager-days):
- `self-fed` 8,352 (67.8%) — own production covered need, no draw
- `pantry-fresh` 3,079 (25.0%) — pantryDraw covered the want
- `away-pack` 796 (6.5%) / `away-pack-empty` 14 (0.1%)
- `desperation-spoiled` 81 (0.7%) — fresh ran short, spoiled topped up
- `voluntary-fast` 2 (0.02%)

Starved-villager-day attribution (44 days, **coverage 1.00**):
- `empty-pantry` 27 (61%) — pantry held no fresh candidates at meal time
- `crumbs-left` 7 (16%) — pantry still held food the floor1 rounding rule
  would not take (see mechanism note below)
- `spoiled-insufficient` 6 (14%) — desperation ran and still fell short
- `away-pack-empty` 2 / `away-pack-short` 2 (9%) — the pack couldn't cover
- `other-short` 0 — no taxonomy gap

Mechanism note on `crumbs-left`: all 4 full-pantry starvations (>4 fresh
days in pantry, 9% of starved days) are this path — e.g. leadcourt s66 d46,
Nino: need 1,218, drew 520, pantry still held 8,000 fresh kcal in pieces
each larger than the remaining 596 want. The anti-fractionating rule
(Steve 2026-10-08: an indivisible piece is eaten whole or not at all —
never broken for crumbs) leaves big pieces untouched once the remaining
want drops below the smallest piece. Fictionally coherent and Steve-designed,
but it is a real, now-measured starvation path: hungry with a full pantry,
by granularity, not by denial.

## Verdict on sim-findings #115 ("trust-gated sharing" hypothesis): REFINED

#115 (hunger-exempt arm): "the cost is DISTRIBUTIONAL: hungry villagers
exist while the pantry holds >4 fresh days — the bind is trust-gated
sharing, not total food."

The census splits this into three measured claims:

1. **The trust→sharing channel is CONFIRMED and steep.** Mean gave/day by
   trust band: lo (<30) 82 kcal, mid (30–60) 321, hi (60+) 679 — an ~8×
   gradient, exactly the trustFactor bands (0.2/0.5/0.8/1.0) doing their
   designed work. Low-trust villagers hoard; high-trust villagers feed the
   pantry. The instrument's fixture A/B measured it live (gave 38 vs 188).
2. **Individual-level trust denial is REJECTED.** Under-eating
   (ate < 0.6×need) by trust band: lo 0.27%, mid 0.57%, hi 0.28% — flat.
   Starved-day mean trust 44.3 vs fed-day 46.6 — no gradient. Draws are
   first-come-first-served in roster order; there is NO trust gate on
   `pantryDraw` (verified in code — trust enters only through `gave`).
   A low-trust villager is no more likely to go hungry than anyone else.
3. **"Hungry with a full pantry" exists but is rare and not trust-caused.**
   4/44 starved days (9%) had >4 fresh days in the pantry — all four are
   the `crumbs-left` granularity path above, with trusts 30–54 (mid band),
   not trust denial.

**Refined statement**: trust gates *contributions*, not *draws*. The
distributional cost runs through the communal pantry — low trust → less
sharing → thinner pantry → more `empty-pantry` days for everyone — not
through anyone being denied food. The two lowest-trust runs (belongseek-s33
23.5, leadcourt-s66 30.2) are the two highest-starvation runs (9, 10 days),
consistent with the communal link; but mid-trust runs also starve
(s77: 8 days at trust 43.6), so trust is a contributor, not the whole story.
The sibling arms (hunger-depth exemption, direct sharing) now have the
instrument to test exactly this: watch `gave` by trust band and the
`empty-pantry` share move.

## Starvation trajectories (sense test — 3/3 read as village decisions)

1. **Nino, leadcourt s66** (full-pantry granularity): 31 days a strong
   self-fed producer (trust 16–26, hoarding 80% of surplus); day-32
   village-wide pantry collapse; own production collapses with health;
   d46 starves (622/1,218) with 8,000 kcal in the pantry — pieces too big
   for the remaining want. Survives at 0 health (only the famine branch
   kills). A design-rule consequence with a face, not a bug.
2. **Joseph, belongseek s33** (honest famine): producer → wounded (health
   100→26, production collapses) → draws down the pantry for 18 days →
   pantry bare d31 → desperation-spoiled d31–33 → health 6→0 d33.
   The village dies d33. Reads as a slow, legible tragedy.
3. **Fatima, belongseek s77** (road hunger): ranges away d41/d45–46; d46
   pack empty + own production 1,174 < 60% of need → starves on the road
   (health 100→92); d47 home to a bare pantry, eats spoiled. A forager who
   ranged too far while home was bare.

All three: a starved villager reads as a village decision with a cause —
never silence, never a number without a story.

## Wall numbers (telemetry-check: quiet, no LOUD lines)

leadcourt: n=8 won=0 medD=115 maxD=158 nat=6 tab=0 maxWave=4 hungry=12.
belongseek: n=8 won=0 medD=137 maxD=180 nat=4 tab=0 maxWave=3 hungry=14.
Deaths: combat 63, monster 33, starvation 17, villager combat 15, sickness
10, wounds 9, bad belly 2, lockjaw 2, Ugly-Eyes 2, expedition 1, contest 1.

## Blanks filled / documented

- **FILLED**: the r22b measurement blank — starvation-death distribution now
  has a dedicated per-villager instrument with measured paths (this run).
- **DOCUMENTED (new finding)**: ~0.42% of census rows are duplicate
  (vid,day) pairs — `villageEats` occasionally fires twice in one
  scholar-day (e.g. Joseph belongseek-s33 d25 ×2). Rows are meal-calls, not
  strict villager-days; attribution unaffected at this rate. → appended to
  sim-findings.md.
- **DOCUMENTED (new finding)**: the `crumbs-left` granularity starvation —
  anti-fractionating rule + coarse pantry pieces = hunger with a full
  pantry. Steve-designed (2026-10-08), now measured (7/44 starved days,
  4 with >4 fresh days in pantry). Whether piece granularity should ever
  overrule a hungry villager is a steve-call. → appended to sim-findings.md.

## Metric review

The diagnostic GO (≥80% attribution) was met at 100% with zero
`other-short` residuals — the taxonomy is complete for this suite's 44
starved days. One calibration note for the next instrument run: on suites
with zero starved days the coverage metric is vacuous (defined as 1.0);
pair it with a minimum-starved-days floor (e.g. n≥10) before calling GO.
`starvedFullPantryShare` used an 8,000-kcal (>4 fresh days) threshold —
kept as-is; it matched the #115 phrasing exactly.
