# scripts/policies/ — the policy library (measurement 2026-10-11)

A policy is a named way of playing; a module may export several. Every lever is measured with
**multiple policies on identical seeds** so results show strategy-dependence,
not just one competent player's luck.

Finale counter access (2026-10-19): capable's signature parser now reads the
same data-finale buttons as the phone. Red Pen, Leaked Script and Bad Note have
one-use preferences and still require actual available crew spoils. This is a
controller revision, not a Game balance lever. Use this same controller on both
Game roots; do not compare against the old controller as a Game-only change.
See test-finale-counter-access and the release-contact2 retained screen.

## Interface

Each module exports a policy object:

```js
{
  id: 'competent',          // stable id, used in sweep tables
  desc: '...',              // one-line behavior summary
  setup(Game, ctx) {},      // once per run (optional)
  upkeep(Game, ctx) {},     // 3x per day, before fights/contests
  daily(Game, ctx) {},      // once per day, before sleep
  fight(Game, ctx) {},      // per player turn in combat; return true if handled
  contest(Game, ctx) {},    // per step of an active contest; return true if handled
  pending(Game, ctx) {},    // explicit public response before pending-encounter fight fallback
  diagnostics(ctx) {},     // optional bounded JSON report, never full Game/context state
}
```

Rules: deterministic (seeded PRNG only — the harness seeds Math.random BEFORE
eval; never use Date.now()/unseeded randomness for decisions), try/catch-guard
every Game call (a hostile API must never kill a run), never mutate shared
policy objects (sweep-compare shallow-copies per run).

## The six canonical policies

Targeted playstyle measurement also registers `maker`, `merchant`, `caregiver`
from livelihood.js. They inherit capable's survival/choice/defense brain,
disable deliberate hunts and feast-fight seeking, and drive off actual feast
draws through the public response. Unavoidable combat and contests remain;
they are not pacifists. Each comparison root must use identical tooling.

- Maker studies real books/known ruins, crafts learned funded recipes, trades,
  and preserves a selected safe cooked batch. Hidden recipes stay hidden.
- Merchant seeks real stock and pays real cart prices, keeping a personal
  meal buffer. Maker/merchant retain three current kcalCap buffers, giving
  two extra capacity buffers beyond ordinary contribution policy. This is a bot
  choice, not a changed game food price, metabolism or reward.
  It scales with personal capacity, not exactly three calendar days of food.
- Caregiver uses available personal treatment and one physically present
  living patient per day, with known medicine or actual wound care; remote
  and dead roster entries are excluded. Comfort uses actual visible needs.

Read policyDiagnostics.errors, counters and blocked fields with the scorecard.
Historical source2af has no public counter-material pickup: maker reports
the opportunity/day and leaves stock untouched. Source16fb supplies the real
paid public action; the same maker controller can take only actual material
stock that fits, then use its existing knowledge-gated crafting choices.
Track pickup calls, actual material units, recipe attempts and successes
separately. A structured refusal is truthy, so a truthy pickup return alone
does not establish a transfer. Errors still warn and fail neutrality; known
unavailable paths remain explicit rather than becoming fake actions.
Attempt counters (harvest trips/searches) are effort, not successful rewards.

| id | file | plays like | measures |
|---|---|---|---|
| `competent` | competent.js | aware experienced player: learns, cooks, avoids vectors, fights with advantage | the default baseline — keep behavior stable |
| `risk-aware` | risk-aware.js | competent + reads contest billing: refuses high/extreme when hurt, hedges phases by declared harm, ejects at 45% HP | fear: participation/injury/win-rate deltas vs competent |
| `larceny-leaning` | larceny-leaning.js | competent + steals when hungry (and on schedule), cold neighbor | justice system: moot firings, trust/gossip response |
| `kind` | kind.js | competent + uniformly kind: never steals, shares surplus, comforts grieving | the warm pole; contrast with larceny-leaning |
| `deed-seeking` | deed-seeking.js | competent + hunts notability deeds: patrols, channels, always takes cameras | deed-accumulation curves, table-bar pacing |
| `winseek` | winseek.js | full table-gate pursuit (6 roads) | win-path reachability ceiling |
| `capable` | capable.js | leadfeast base + real flee (barrier push), combat abilities + signature verbs, scored offers/contests/Table/relics, held talks by need, relay | the game as a capable player plays it — the default bot for build/lever sims |

Also present (legacy, not canonical): `idle.js` (zero/mvc/leader), `oracle.js`,
`oracleV2.js` (systems-engaged), `socialite.js` (social-play), `weird-c.js`,
`progress-*.js`. Use the six above for new measurement; the legacy set stays
for reproducing old results.

## Adding a policy

`market-dealer` and `market-hoarder` are deliberate Miser intent cohorts on
merchant's paid-trade/survival behavior. Their ordered preference comes from the
authored subclass payoff, enablers and tie, then the other Miser subclass. It
selects only a genuinely offered, unheld option. At full level-up slots it lets
the public engine replace a lower-priority piece or keep the current kit; the
reactor is protected. Non-level sheets cannot bypass capacity. Actual held gains,
refusals and keeps have separate diagnostics. A preferred choice sacrifices
general survival utility deliberately: measure that tradeoff, never assume a
build priority is better. Generic merchant and other profiles do not set this
preference and keep their original scoring behavior. These remain mixed policies,
not pacifists, and do not emulate an NPC's decision process.

These two intent profiles also inspect the real daily Market button before
merchant upkeep/daily chores. They can buy its quoted automatic weapon upgrade
or an unowned armor upgrade from the public familiar suggestions (owned items
and known recipes). They do not enumerate hidden catalog names, buy duplicate
owned defaults or mint gear. Quotes must leave 1200 personal kcal including
activation, at most two debt markers and no pending Audit; real marker purchases
are allowed within that budget. This is a policy risk choice, not a changed
Game price or gate. Each command attempt is recorded separately from physical
delivery. Receipts retain quote, actual food spent, actual units and debt;
they do not prove equipping, retention or usefulness. Blocked-query counts are
calls, while exposure maps deduplicate observed bearer/day keys.

Read marketDailyExposure.holder/listed/available separately: the runtime
currently exposes the first ascension's verbs. A secondary Market God can be
recorded as a holder without a listed Market button. The controller records
that unlisted observation and the actual activeGods array; it never changes
their order or invokes an unavailable verb. Its exposure is limited to the
noncombat policy callbacks actually visited, not continuous holder coverage.

Use all three policies on the same Game/controller root. This is a descriptive
strategy comparison, not a Game-only balance estimate. Compare controller
revisions with an explicit `harness_revision` declaration; use the same new
controller on both roots before estimating any later Game change. Include named
job/region cohorts and independent holdouts before viability claims.

1. Copy `kind.js` (smallest layering example).
2. Build on `competent` via `Object.assign({}, competent, {...})` unless you
   genuinely need a different base — say why in the header.
3. Document the behavior AND what it measures in the header comment.
4. One file, deterministic, guarded. Add a row to the table above.
