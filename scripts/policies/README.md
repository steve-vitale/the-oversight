# scripts/policies/ — the policy library (measurement 2026-10-11)

One policy = one file = one way of playing. Every lever is measured with
**multiple policies on identical seeds** so results show strategy-dependence,
not just one competent player's luck.

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
}
```

Rules: deterministic (seeded PRNG only — the harness seeds Math.random BEFORE
eval; never use Date.now()/unseeded randomness for decisions), try/catch-guard
every Game call (a hostile API must never kill a run), never mutate shared
policy objects (sweep-compare shallow-copies per run).

## The six canonical policies

`campaigner` is a separate capable-based coverage policy: real coalition
recruitment, food, spare-gear donations, announced-target approach and battle.
`campaigner-control` has the same cautious late-game waiting without that
route. Both can take the Table when weakened; neither guarantees Network
exposure. Run `scripts/campaign-audit.js` for natural coverage and read
`evidence/2026-10-15/campaign-usage-audit.md` for the prepared/natural limits.

| id | file | plays like | measures |
|---|---|---|---|
| `competent` | competent.js | aware experienced player: learns, cooks, avoids vectors, fights with advantage | the default baseline — keep behavior stable |
| `risk-aware` | risk-aware.js | competent + reads contest billing: refuses high/extreme when hurt, hedges phases by declared harm, ejects at 45% HP | fear: participation/injury/win-rate deltas vs competent |
| `larceny-leaning` | larceny-leaning.js | competent + steals when hungry (and on schedule), cold neighbor | justice system: moot firings, trust/gossip response |
| `kind` | kind.js | competent + uniformly kind: never steals, shares surplus, comforts grieving | the warm pole; contrast with larceny-leaning |
| `deed-seeking` | deed-seeking.js | competent + hunts notability deeds: patrols, channels, always takes cameras | deed-accumulation curves, table-bar pacing |
| `winseek` | winseek.js | full table-gate pursuit (6 roads) | win-path reachability ceiling |
| `capable` | capable.js | leadfeast base + real flee (barrier push), combat abilities + signature verbs, scored offers/contests/Table/relics, held talks by need, relay | the game as a capable player plays it — the default bot for build/lever sims |
| `merchant` | livelihood.js | same capable brain, no deliberate hunts/feast fights, earns a food budget and shops/sells at actual carts | commerce opportunities, prices and gear access |
| `maker` | livelihood.js | merchant plus reading held books, paid trips seeking books, known equipment recipes and preserving cooked meat | recipe/material reachability and useful crafting |
| `caregiver` | livelihood.js | same capable brain, no deliberate hunts/feast fights, comforts actual frightened/grieving villagers | a care-led run's rewards, survival and ending access |
| `garden-feeder` | garden-feeder.js | caregiver plus six real garden plots, personal tending/harvesting and full gifts to nearby visibly hungry residents; keeps a dinner buffer | named feeding experiment, not a pacifist or a default-policy replacement |
| `covenanter` | peer-league.js | same capable survival/choice brain, no deliberate hunts; known/courted equal links, real crisis/defense answers and bounded famine draws | natural league founding, food relief, ending access |
| `charterer` | peer-league.js | same brain, trade charters and priced help requests; no deliberate hunts | natural charter founding, useful trade routes and endings |
| `peer-control` | peer-league.js | same brain and hunt restrictions; both LEAD and peer proposals suppressed | paired control for peer-route behavior |

The livelihood policies still defend themselves in unavoidable fights; these
are not zero-combat or pacifist proofs. Compare the same policy code on
frozen before/after game sources. A policy called merchant making zero
purchases is an audit finding, not proof that trade is balanced.

The maker seeks a known ruin first; otherwise it explores a nearby unknown
destination without inspecting its biome. Knowledge trips require at least
1800 kcal, 50 health, an early day and three days between attempts. It uses
normal travel/search/reading costs, backs off blocked routes for nine days,
and stops to resolve danger. Prepared recipe tests do not establish organic
book frequency. The shared gearing routine crafts the actual ammo recipe
(arrows or bolts) only when known and funded, then rebinds pack indices.

Also present (legacy, not canonical): `idle.js` (zero/mvc/leader), `oracle.js`,
`oracleV2.js` (systems-engaged), `socialite.js` (social-play), `weird-c.js`,
`progress-*.js`. Use the six above for new measurement; the legacy set stays
for reproducing old results.

The peer probes replace the inherited LEAD proposal with no action during all
callbacks (restored in finally). Only the two route policies propose their
chosen kind: day 25+, a known unlinked village with opinion 10+, pantry above
12,000 kcal, one proposal/day and seven days between asks of the same village.
They rely on actual visible relationships and ordinary broadcast/time courtship;
they do not grant opinion, travel to codices, or read hidden village contents.
All three also explicitly host an armed feast at dusk, using the real plan,
1.5x pantry buffer and shared seven-day cooldown; an online reactor prevents
this buff-hosting choice. This does not require paying LEAD tribute or grant
food deeds. Normal combat must actually use the real buff to earn that deed.
They accept counters, make an affordable first gift (otherwise a visit), concede
priced crises and send help with a roster of at least six. The engine still
checks the actual bench. Covenant draws move at most 4,000 kcal/day toward a
12,000-kcal pantry buffer, consuming the real pool. Normal Table taking remains
on: these are whole-run strategies, not a national-rank-only ceiling. Peak link,
live benefit and pool counters are sampled decision observations; they are not
complete weekly accounting or exact founding timestamps. Inherited courtship
counters can count suppressed LEAD attempts, so use livelihoodPeer counters and
observed public actions for peer claims.

## Adding a policy

The opt-in `capable-voice-ready`, `maker-voice-ready`, `merchant-voice-ready`
and `caregiver-voice-ready` inherit their named base's work, offers, combat,
contest and pending choices. Optional ctx.godDayIntent and ctx.beforeKnownFight
callbacks let them price Be Heard without replacing game methods or NPC brains.
They preserve a post-word max(500kcal,40% bank) and75 own humanity, use known
god prices, and require a living other member with progressive-trust room for
a social cast. At ordinary+2,90+ trust is not useful room. Unknown prices/trust
do not become free power or invented need. Known-fight callbacks prepare at
an existing hunt approach or actual raid help choice; no additional hunt,
contest forecast or early God grant is introduced. Other daily god choices
stay as before. Meter/trust inputs use existing game state APIs; exact native
HUD readability is a separate question, not established by these policies.

Use all four originals as controls. Run `policy-scorecard.js` for explicitly
mapped same-panel strategy pairs, not balance-panel's game-only comparator.
The fixed16-screen/64-disjoint-holdout experiment and named tradeoffs are in
`evidence/2026-10-16/voice-policy-audit.md`. They remain opt-in; no total-win
target justifies default adoption. Preserve cohort identity, region, time,
source and contract when sharing results with Muse.

1. Copy `kind.js` (smallest layering example).
2. Build on `competent` via `Object.assign({}, competent, {...})` unless you
   genuinely need a different base — say why in the header.
3. Document the behavior AND what it measures in the header comment.
4. One file, deterministic, guarded. Add a row to the table above.

## Miser build-intent cohorts

merchant-hoarder and merchant-dealer inherit merchant's food, public trade, care, travel, defensive combat and Table controller. They add only a declared ability-choice preference. The optional ctx.offerIntent callback in capable.chooseOffers receives actual shown offers and the generic proposed pick/swap/keep; absent callbacks preserve the ordinary policy. New cohorts never replace Game.buildScore/buildDecide or the NPC brain.

Only offered or currently held magic definitions are inspected. Miser offers rank100, preferred subclass+20, payoff+4 or enabler+2; stable sheet order breaks ties. Free slots prefer the highest ranked shown Miser. Full level-up slots first replace the weakest known off-path incumbent (never the reactor), otherwise upgrade only a lower-preference Miser. A generic off-path pick that would remove earned Miser core is declined. This is a committed preference, can occupy all six slots, and has real defence/food/opportunity costs; it is not an optimal-human policy or a guarantee of the named subclass. Full gifts still obey the real swap gate.

Use --policies merchant,merchant-hoarder,merchant-dealer in balance-panel or deed-screen. Compare the same policy files and flags on both game roots. For a strategy comparison on one game, keep it separately labelled; never relabel strategy change as a game-only regression. Count the Table's locked build/coda, the current bearer's class and ever-class separately: the priced frame can outlive its original bearer. Track the reactor, succession, food, community and gear sources. Share source-bound roots with Muse; the older balanced-measurement game lacks the published paid-trade/Haggle repairs and must not be treated as the same runtime.
