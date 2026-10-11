# Measurement methodology — evidence 2026-10-11

Worker: sim-measure (tooling only — no game balance changed).

## What was built

**1. Policy library** (`scripts/policies/` + README.md). Six canonical policies,
one file each, deterministic, documented behavior + what each measures:

| id | behavior | measures |
|---|---|---|
| competent | existing baseline, unchanged | default |
| risk-aware | NEW: refuses high/extreme contests when hurt, hedges phases by declared harm, ejects fights at 45% | fear: participation/injury/win deltas vs competent |
| larceny-leaning | NEW: steals when hungry + on schedule, cold neighbor | justice system: moot firings, trust/gossip response |
| kind | NEW: never steals, shares surplus, comforts grieving | warm pole; contrast with larceny-leaning |
| deed-seeking | NEW: patrols for wave deeds, channels keepsakes, always takes cameras | deed-accumulation curves |
| winseek | existing table-gate pursuit | win-path ceiling |

Legacy (idle, oracle, oracleV2, socialite, weird-c, progress-*) untouched for
reproducing old results.

**2. Wall-clock, two parts.**
- (a) Sim proxy: `runDays` now always records `result.pacing` — per-day
  player-verb counts (documented 11-verb list; upper bound, some internal
  callers), policy-hook firings (strict lower bound), and dayTicks consumed.
  Cheap, always on, RNG-untouched. First data: competent ≈ 10–34 verbs/day
  (early vs established days).
- (b) Live hooks: `endDay()` records real minutes-per-day into
  `state.pacing` (60-day ring + total, local only, never network, never read
  by game logic; +55 bytes save size; JSON roundtrip verified).
  `Game.pacingStats()` → {days, meanMin, medianMin, totalMin}; the 🐞 debug
  panel shows "⏱️ PACE: X min/day median over Nd".

**3. Standard harness** (`scripts/sweep-compare.js`). CLI
(`LEVER/SEEDS/POLICIES/DAYS/OUT`) or module (`runComparison({label, seeds,
policies, days, extraMetrics})`). Standard table per policy: n, won,
median/max days, max wave, national%, table%, death-cause shares, verbs/day,
plus lever-specific `extraMetrics(Game, ctx)`. Tracks max scale rank / arc /
table over history (not just end state).

**4. `docs/MEASUREMENT.md`.** House standard: identical seeds, multi-policy,
seeded PRNG, sense-reads, what "green" means, [needs-eyes] rule, pacing
measured not estimated, tooling never pulls levers.

## Self-test results

- Determinism: same seeds × 2 policies × 2 runs → byte-identical tables
  (game state AND pacing counts). DETERMINISM-OK.
- Existing proof re-run: `scripts/test-contest-fear-20261011.js` → 21/21 on
  this tree (harness + game.js changes broke nothing).
- risk-aware unit: refuses high-risk pit at 30% HP (REFUSE-OK); picks min-harm
  in-phase choice (HEDGE-OK); harmScore orders safe < risky (247.5).
- Pacing hook: 4 endDays → 4 entries; pacingStats() reads; JSON roundtrip OK.
- Syntax: node --check clean on all touched files.

## How loop workers should use it

```bash
# Before/after on identical seeds, two policies:
LEVER="my lever" SEEDS="7,42,99" POLICIES="competent,risk-aware" DAYS=200 \
  OUT=evidence/2026-10-11/my-lever.json node scripts/sweep-compare.js
```

```js
// Lever-specific metrics plug in:
const { runComparison, printTable } = require('./scripts/sweep-compare');
const rep = await runComparison({
  label: 'fear', seeds: [7,42,99], policies: ['competent','risk-aware'], days: 200,
  extraMetrics: (Game, ctx) => ({ refusals: ctx.contestRefusals||0, hedges: ctx.contestHedges||0 }),
});
printTable(rep);
```

Fear measurement (the original gap): competent vs risk-aware on identical
seeds — participation rate, injury share, win-rate deltas ARE the fear signal.
The old sim auto-participated; now "thinking twice" is measurable.

## Balance issues spotted (documented, NOT fixed — tooling only)

- None new. (The harness surfaced no balance change; all edits are
  additive telemetry or new policy files.)
