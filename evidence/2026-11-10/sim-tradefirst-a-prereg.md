# Trade / market — first numbers: pre-registration (arm sim-tradefirst-a)

Run fleshout-20261111T0315Z, Loop A (same run as sim-travelfirst-a; this
arm runs after it in the same worktree). Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE
any judged sim. Base commit b7fe9c03d (worktree sim-tradefirst-a).

## Canon

- docs/CANON.md read first. **There is NO dedicated trade/market canon
  doc.** Grep of docs/ for trader/merchant/market returns only mentions
  (DESIGN.md, KNOWLEDGE.md trader-knowledge pools, MAP.md, SCALE.md,
  MEASUREMENT.md) — no TRADE.md, no market section in any canon doc.
  Nothing is invented here; the code citations below are the source of
  truth. (Canon gap, recorded in the evidence: trade/market needs a
  canon doc the way travel has docs/MAP.md.)
- Trade mechanics as coded (all in src/js/betrayal.js unless noted):
  - **Arrivals** — `considerStrangers()` (betrayal.js ~3319, called
    daily from `betrayalDaily()`): one visitor at a time, gated on
    `villageNotability()` (day≥7 +30, pantry>15000 +25, systemArrived
    +25, strangersHeard×5; needs ≥40 unless roster<8, which draws the
    desperate at a 0.08/day floor). Type pick: trader/trader/scout/
    curious/fleeing (thin villages: curious/fleeing only). Trader names
    are type-locked ('a weathered trader', 'a sharp-eyed peddler',
    'a cart-driver with flour on their sleeves'). `leavesDay = day+1`
    — traders don't wait; `visitorDaily()` moves unvisited visitors on.
  - **The cart** — `visitorInteract(vis,'trade')` opens the cart
    (`visitorWares(vis)`): 1 alien loot (tier by `tradesDone`:
    0/3/8 → tier 1/2/3, price 1200×tier + 0–800), 1 tool (fell-tier
    first, 500–1000), 'Road news' (300), sometimes trail rations
    (400–700, 3×350 kcal). `visitorInteract(vis,'sell')` opens the
    sell view (`traderSellStock` + `traderAppraise`, knowledge-gated:
    the trader only prices what they know; unknown goods refused).
    `traderSell(visId, packIdx)` sells a whole stack; the price lands
    as **tab credit** (`vis.credit`) toward the trader's wares.
    `visitorBuyWare(visId, idx)` buys: tab spends first, the remainder
    is paid in finished food via `traderPay(kcal)` — most-perishable
    first, preserved counts 1.5×; a failed payment rolls the tab spend
    back, no partial purchase. `visitorInteract(vis,'done')` folds the
    blanket and removes the visitor.
  - **Scams** — `maybeScamWare` (overprice / tier_lie /
    spoiled_as_fresh) rides the same rails; discovery is knowledge-
    gated (`tradeSavvy()` thresholds 3/5/4); discovered scams land on
    the scam ledger (`recordScam`); a returning scammer may come back
    (`returningScammer`, 0.4 when an open discovered scam exists).
  - **Resident hawkers** — `hawkerOffer(vid)`: any villager with the
    entrepreneurial spirit hawks ONE ware (a found tool, 400–800, or
    'Smoked strips', 300–500) — offered **in conversation only**
    (conversation.js hawker branch; `hawker_yes` → `hawkerBuy(vid)`).
    Same payment rails (`traderPay`, `goodsTradePrice`,
    `recordMarketExchange` route 'resident').
  - **River trader** — drama event day 21 (game.js ~26959,
    `evRiverTrader`): feed (~600 kcal, trust +8/+3, true news about
    silent dogs + 2 smoked fish) or trade a day-part (knife 400 /
    salt 350 / rope 250, `trade.price_mult` haggle) or snub (free —
    "the river remembers"). **The sim harness stubs drama**
    (scripts/sim-harness.js:254 `G.drama = function(){}`; drama.js is
    excluded from the node load) — so the river event is expected
    DEAD under the harness; the pilot proves the 0 via wraps, it does
    not assume it.
  - **Deeds** — `recordMarketExchange` (route cart/resident/river,
    role buyer/seller, price + packKcal/tabKcal/pantryKcal split)
    records a once-per-person `market_exchange` godpath deed and teles
    `godpath_deed`; `creditGoodsTrade` credits the 'trade' deed.
    Panel `craftTradeGear` counts trade-sourced gear only.
  - **Trade is a verb, not a role** (Steve 2026-10-06, betrayal.js
    header + `tradeSpirit()` 0–2): anyone with the spirit appraises
    and trades; 'trader' is arrival flavor, not a class.
- **Who calls the trade verbs** (grep-verified 2026-11-11):
  `visitorInteract`/`visitorBuyWare`/`traderSell`/`hawkerBuy`/
  `feedRiverTrader`/`tradeRiverTrader` are called ONLY from app.js UI
  buttons, the conversation.js hawker branch, membership.js:583
  (`visitorInteract 'invite'` — the thin-roster auto-intake, curious/
  fleeing only), and tests. **No policy calls them** — competent.js
  AND capable.js contain zero `visitorInteract|visitorBuyWare|
  traderSell|hawkerBuy|visitorWares|tradeSpirit` calls. The ONLY
  policy trade caller in the repo is the `merchant` profile in
  scripts/policies/livelihood.js (`trade()` — buys alien/tool wares
  it doesn't own when it can afford price+1200, banks perishable
  surplus above a 1200-kcal meal buffer, one counter visit per day
  part). The engine never trades autonomously: villagers never buy
  from hawkers, traders never sell to villagers, the cart never opens
  itself. Under competent, a trader can arrive, wait one day, and
  leave with **zero** interaction — that asymmetry IS one of the first
  numbers.
- Audit row: hidden_files/coverage-audit-20261110.md §4, Trade/market
  — **Partial**: base driver makes ZERO market/buy/sell calls in
  competent.js; merchant/maker policies only; panel `craftTradeGear`
  counts trade-sourced gear only; 12 trade tests; **zero November
  evidence files named trade/market**.

## What the 12 trade tests prove — and what they do NOT

The 12 tests (test-trader-appraisal, test-trader-hook-20261012,
test-trader-pool-growth-20261012, test-reach-trader-20261010,
test-knowledge3-trade-*, test-break-knowledge-tradeecon-20261008,
scripts/godpath/test-haggle-commerce.js, test-market-deed.js,
test-leantrade-a.js, test-miser-trade.js, test-pdtradeoff-b.js) prove
the verbs work when CALLED: appraisals price, tab credit spends
first, failed payments roll back, scams ledger, the market deed
records once. None of them measures whether trade ever HAPPENS in a
lived village: no arrival rate, no presence days, no trade count, no
kcal moved, no price actually paid, no trade-sourced gear in a real
run, no villager-side trade. This arm measures exactly that, on a
plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked: no open
trade/market line names this measurement; the trader-pool-growth and
leantrade/pdtradeoff items are lever builds, not first numbers.) Any
trade gap this arm surfaces is APPENDED as [open] in the evidence
file's findings section, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: `considerStrangers` runs daily via `betrayalDaily`
   (betrayal.js:4259) — the pilot will confirm arrivals live in the
   corpus, not assume them. The cart verbs are proven live in the
   proof fixture by direct calls (fixtures rig a visitor + wares);
   their zero under competent is then a real zero, not a dead wrap.
   `feedRiverTrader`/`tradeRiverTrader`/`snubRiverTrader` are proven
   live in the fixture the same way and marked dead-under-harness
   (drama stubbed).
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio
   to size. The addressable pool is every visitor arrival + every
   trade-verb call + every hawker offer on the band.
3. **Verb existence**: considerStrangers, visitorInteract,
   visitorWares, visitorBuyWare, traderSell, traderPay,
   traderAppraise, hawkerOffer, hawkerBuy, feedRiverTrader,
   tradeRiverTrader, snubRiverTrader, recordMarketExchange,
   recordScam all exist in the engine. The policy calls NONE of them
   under competent — that asymmetry IS one of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 122.5–140d); trader arrivals are notability-gated
   (day≥7, pantry>15000) so they are a mid/late-window phenomenon a
   30d window could not see; the long horizon is the point.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of trade/market** —
every visitor arrival classified by type, every trader-present day
counted, every trade verb counted by kind and party (scholar vs
villager), every kcal moved by route and direction, every price
actually paid, every trade-sourced gear item, every appraisal
verdict, every market deed and scam record, every metric in the list
below counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every visitor arrival classified by type, none 'other' | 0 unclassified arrivals across the pilot |
| Every visitorInteract call classified by caller, none 'other' | 0 unclassified interact calls across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–9; sense-test scenes quoted |
| Engagement floor | ≥5 visitor arrivals band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 9)

1. Visitor arrivals: total, by type (trader / scout / curious /
   fleeing), by day band (1–30 / 31–60 / 61–90 / 91+), notability at
   arrival, names given, entrepreneurial / shady / desperate /
   hostile flags, returning-scammer arrivals.
2. Trader presence: days with ≥1 trader-type visitor present, days
   with any visitor present, trader-days (sum over days of trader
   visitors present), visits that ended unvisited (left with no
   visitorInteract call at all), visits where the cart opened
   (interact 'trade' or 'sell'), visits where 'done'/'away'/'invite'
   closed them, mean visit length in days.
3. Scholar cart trades: buys by kind (alien / tool / food / news)
   with itemId, quoted price, tab kcal used, pack kcal paid, goods
   taken; sells by item (name, units, pricePerUnit, total, credit
   gained); total kcal moved in (goods received) vs out (food paid);
   `tradesDone` counter end value; buys/sells per trader visit.
4. Resident trade: hawkerOffer calls (vid, ware kind/name/price),
   hawkerBuy calls and outcomes (bought / refused-short / no-stock),
   goods and prices paid, kcal moved.
5. River route: evRiverTrader fires (expected 0 — drama stubbed,
   proven via wrap), feedRiverTrader / tradeRiverTrader /
   snubRiverTrader calls (expected 0), riverNews state, smoked-fish
   gift items.
6. Trade-sourced gear: every nonfood item entering the scholar's pack
   via a trade verb (route, itemId, kind, price paid) — the
   first-numbers analogue of panel `craftTradeGear`; plus food bought
   (units/kcal) and news bought (strangersHeard delta).
7. Appraisals + scams: traderAppraise calls by verdict (priced /
   refuse / decline), pricePerUnit distribution, specialty bonuses;
   scam ledger entries from trade (kind, ware, discovered or not,
   paid), confrontDiscounts granted.
8. Villager-side trade: any villager-initiated trade verb call
   (expected 0 — no such call path exists in code; proven by the
   caller census + zero counts), villager hawker offers surfaced,
   villagers buying from each other (expected 0).
9. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: trade is a whole-life question and arrivals are
  notability-gated (day≥7, pantry>15000) — a 30d window cannot see
  the cart; sibling first-numbers pilots (cookfirst-a, preserve-a,
  fishfirst-a, travelfirst-a) ran 150d with median survival
  122.5–140d, so 150d captures the full village life without ticking
  dead villages. Same horizon as the siblings for comparability.
- **Seeds: 180265–180272 (8 seeds).** BAND CHANGE from the assigned
  180257–180264: the freshness search found seed 180259 named in
  evidence/2026-11-10/sim-travelfirst-a-prereg.md:214 as the endpoint
  of the searched range "180250–180259". The travelfirst prereg itself
  records that search as zero hits (a searched range, not a used
  band), but the freshness skill treats a named seed as used, so this
  arm shifts to the next 8-seed band rather than argue the point.
  Freshness search for 180265–180272 (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 180265–180272:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all eight
    seeds.
  - No perseed directory names any seed 180265–180272 (listing of
    evidence/2026-11-10/perseed-* checked).
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked; only preregs matched "band" —
    same finding as the travelfirst prereg).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + full-tree word-boundary seed grep
    over evidence/*.md + perseed directory names + goal hidden_files
    listing.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/tradefirst-instrument-20261110.js — wraps (record-only, never
alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game):
- considerStrangers: every call — visitors-list diff (new arrivals:
  id/type/name/day/notability/flags), return value.
- visitorDaily: every call — visitors-list diff (departures: id/type/
  name/day/leavesDay, interacted-or-not from the interact log).
- visitorInteract: every call — visId, how, return, caller frame
  (membership-intake / conversation / policy / direct / app — node
  has no UI, so app is expected dead), trading/selling flags after.
- visitorWares: every generation — visId, wares (kind/itemId/name/
  price/units/kcalEach), tier implied by tradesDone.
- visitorBuyWare: every call — visId, idx, ware kind/itemId/name,
  quoted price, tab used, pack paid, result (bought / already-sold /
  refused-short / no-spirit), tradesDone after.
- traderSell: every call — visId, packIdx, item name/units,
  pricePerUnit, total, credit after, result.
- traderPay: every call — kcal asked, ok/short, paid, taken list
  (name/units/preserved/kcal). (Fires inside buy/sell — counted as
  payment legs, never summed with buy/sell totals.)
- traderAppraise: every call — item key/name, verdict, pricePerUnit,
  line (first 200 chars).
- hawkerOffer / hawkerBuy: every call — vid, ware kind/name/price,
  result.
- feedRiverTrader / tradeRiverTrader / snubRiverTrader /
  evRiverTrader: every call — result (all expected 0 under the
  harness; proven live in the fixture).
- recordMarketExchange: every call — route/role/partner/item/price/
  packKcal/tabKcal/pantryKcal, recorded-or-refused.
- recordScam: every call — who/kind/ware, paid, discovered.
- tele('godpath_deed'): market_exchange events (cross-check against
  recordMarketExchange).
- Daily snapshot: visitors present (id/type/name/trading/selling/
  credit/leavesDay/entrepreneurial/shady/desperate/hostile/
  returningScammer), hawkerStock (vid/ware kind/name/price/sold),
  scholar.tradesDone, riverTrader state, villageNotability,
  strangersHeard, pantry kcal, roster size, days-with-trader flag.
Driver: scripts/tradefirst-driver-20261110.js (mirrors
travelfirst-driver; Game.say wrap with a trade regex for the sense
corpus, 200 lines/seed cap — same early-game-only caveat as the
siblings, narrowed regex so combat "traded blows" lines do not eat
the cap: trader|peddler|hawker|cart|wares|scam|haggl|downriver|road
news|finished food|on your tab). Analyzer:
scripts/tradefirst-analyze-20261110.js. Proof:
scripts/test-tradefirst-a.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-fishstaff-b,
cookfirst-a, preserve-a, fishfirst-a, travelfirst-a). The
control/neutral legs are the neutrality proof, not a panel. Panel
context: **no panel metric for trade** (coverage audit §4) except
`craftTradeGear`, which counts trade-sourced gear only — this arm
supplies its first-numbers analogue (Metric 6).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (travelfirst-a: median survival to be read from its
evidence; fishfirst-a: median survival 122.5d, 7/8 village-lost, 650
deaths over 869 village-days). If the instrument changes any numeric
field vs the recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
