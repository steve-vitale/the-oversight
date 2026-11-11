# Trade / market — first numbers (arm sim-tradefirst-a)

Run fleshout-20261111T0315Z, Loop A (same run as sim-travelfirst-a).
Coverage Program Tier 2 (Steve order 2026-11-10 "Measure all").
Prereg: evidence/2026-11-10/sim-tradefirst-a-prereg.md (committed
7bb341f69 BEFORE any judged sim). Base commit b7fe9c03d.
Instrument + driver + analyzer + proof: 220730e93 (proof 87/87).

## Verdict: GO

Every pre-registered GO check passes (table below). A GO makes NO
landing claim and spends NO confirm band — there is no lever here to
land. This is the first measurement of trade/market ever taken on a
plain competent band: the audit's "zero November evidence files named
trade/market" is now exactly one file — this one.

| GO check | Bar | Result | Pass |
|---|---|---|---|
| Engagement floor | ≥5 visitor arrivals band-wide | 267 arrivals | ✓ |
| Unclassified arrivals | 0 other-type arrivals | 0 | ✓ |
| Unclassified interacts | 0 other-caller interact calls | 0 | ✓ |
| Instrument errors | 0, all seeds, all legs | 0 | ✓ |
| Complete capture | per-seed tables for metrics 1–9 + sense scenes quoted | 8 seeds tabulated, scenes below | ✓ |
| Neutrality | days + end pantry kcal + deaths match exactly, 8/8 seeds | 8/8 | ✓ |

## Headline (plain words)

Traders come to Haven constantly and **nobody ever trades with them**.
118 traders arrived over 8 villages and stayed 118 trader-days; every
single one left without the cart ever opening — zero buys, zero sells,
zero appraisals, zero coins of food changing hands in either direction.
The river trader arrives on schedule (day 21, all 8 seeds) and is never
fed, never haggled with, never snubbed. The village's own hawkers never
offer a ware, because offering only happens inside a conversation the
default driver never has. The only thing that ever moves is people:
11 frightened families and curious wanderers were taken in by the
village itself, without the scholar lifting a finger. Trade, as a
system, is a shop with the lights on and the door locked — the
merchandise exists, the customers arrive, and the only buyer in the
game is a button no policy ever presses.

## Metrics 1–9 (control leg, 8 seeds, 150d death-aware)

Per-seed corpus: evidence/2026-11-10/perseed-tradefirst-a/
(tradefirst-s<seed>-tradefirst-pilot-control.json, 8 files).
Summary JSON: evidence/2026-11-10/tradefirst-summary-tradefirst-pilot.json.
Analyzer: scripts/tradefirst-analyze-20261110.js.

### Metric 1 — Visitor arrivals: 267

| Seed | Days | Arrivals | trader | scout | curious | fleeing | 1–30 | 31–60 | 61–90 | 91+ |
|---|---|---|---|---|---|---|---|---|---|---|
| 180265 | 143 | 37 | 19 | 8 | 5 | 5 | 7 | 10 | 8 | 12 |
| 180266 | 147 | 35 | 19 | 4 | 8 | 4 | 5 | 9 | 6 | 15 |
| 180267 | 94 | 20 | 4 | 6 | 5 | 5 | 7 | 7 | 4 | 2 |
| 180268 | 104 | 31 | 15 | 4 | 7 | 5 | 7 | 11 | 11 | 2 |
| 180269 | 144 | 30 | 14 | 5 | 5 | 6 | 8 | 8 | 4 | 10 |
| 180270 | 150 | 38 | 14 | 5 | 9 | 10 | 6 | 9 | 7 | 16 |
| 180271 | 150 | 38 | 17 | 6 | 9 | 6 | 8 | 10 | 8 | 12 |
| 180272 | 148 | 38 | 16 | 7 | 8 | 7 | 9 | 12 | 9 | 8 |
| **Pooled** | **1067** | **267** | **118** | **45** | **56** | **48** | **57** | **76** | **57** | **77** |

- Traders are the commonest arrival (118/267, 44%) and arrive in every
  day band (27 / 31 / 24 / 36) — this is not a late-game phenomenon.
- Notability at arrival: mean 70.0, range 55–80, 0 nulls. The gate
  (≈40) is comfortably cleared whenever the village is alive; the
  arrival rate is ~1 visitor every 4 days (267 arrivals / 1067 days).
- Names are type-locked as coded: 118 trader arrivals all carry one of
  the three trader names; no "frightened family" ever ran a cart.
- 0 unclassified arrivals; 0 instrument errors.

### Metric 2 — Trader presence and departures

| Seed | Trader-present days | Visitor-present days | Departures | Unvisited departures | Interacts |
|---|---|---|---|---|---|
| 180265 | 19 | 37 | 34 | 34 | 2 (invite) |
| 180266 | 19 | 35 | 33 | 33 | 1 (invite) |
| 180267 | 4 | 20 | 19 | 19 | 0 |
| 180268 | 15 | 31 | 30 | 30 | 1 (invite) |
| 180269 | 14 | 30 | 26 | 26 | 4 (invite) |
| 180270 | 14 | 38 | 38 | 38 | 0 |
| 180271 | 17 | 38 | 35 | 35 | 3 (invite) |
| 180272 | 16 | 37 | 38 | 38 | 0 |
| **Pooled** | **118** | **266** | **253** | **253** | **11 (invite)** |

- A trader is present on 118 of 1067 snapshot-days (11.1%); some
  visitor is present on 266 (24.9%). A trader visits roughly every
  9 days per village and stays exactly one day (leavesDay = day+1):
  trader-present days (118) equal trader arrivals (118) — no trader
  ever stayed a second day, and no trader was ever kept waiting by a
  trade in progress (visitorDaily skips `trading` visitors; none was
  ever trading).
- All 253 visitorDaily departures were **unvisited** (no
  visitorInteract call for that visitor, ever). The 11 interacts are
  all `visitorInteract 'invite'` from the thin-roster auto-intake
  (membership.js:583, caller `membership-intake`): 6 curious + 5
  fleeing, days 66–134. No `welcome`, `trade`, `sell`, `shelve`,
  `done`, or `away` call exists anywhere in the corpus — the cart was
  never opened, not once.
- Reconciliation: 267 arrivals = 253 visitorDaily departures + 11
  invites (which remove the visitor inside visitorInteract, not
  visitorDaily) + 3 visitors still present at the final snapshot.

### Metric 3 — Scholar cart trades: 0

- Buys: **0** (0 alien, 0 tool, 0 food, 0 news). Sells: **0**.
  Payments (`traderPay`): **0**. Appraisals (`traderAppraise`): **0**.
  `visitorWares` generations: **0**. `tradesDone` end value: **0** on
  all 8 seeds. Tab credit: never created, never spent.
- Kcal moved in either direction: **0**. Total price ever paid: none.
- The cart's contents are therefore unmeasured in live play — the
  wares exist only in the proof fixture (news 300, tool 500–1000,
  alien 1200×tier, rations 400–700). What a trader *would* have sold
  on this band is unknown, because the cart never opened.

### Metric 4 — Resident trade (hawkers): 0

- `hawkerOffer` calls: **0**. `hawkerBuy` calls: **0**. No villager
  ever offered a ware, because offering happens only inside a
  conversation (conversation.js:6856) and competent never takes the
  hawker branch. The village's own merchants are as unreachable as
  the road traders.

### Metric 5 — River route: the event fires, the trader starves

- `evRiverTrader` fired **8/8 seeds, day 21 every time** (plus the
  Village-stage ladder reward sent a second river trader "a day
  early" on all 8 seeds — the day-7 line below). The river trader
  was present (`riverTrader` state seen) on 8/8 seeds.
- `feedRiverTrader`: **0**. `tradeRiverTrader`: **0**.
  `snubRiverTrader`: **0**. `riverNews` (the silent-dogs tip):
  **0/8 seeds**. The 2 smoked fish thank-you gift: never given.
- The river trader arrives, waits till dusk, and leaves unfed and
  untraded on every seed. (Prereg correction — see Metric review:
  the prereg expected evRiverTrader dead under the harness because
  drama is stubbed. Wrong: `G.drama` is only the visual-effects
  hook; the day-21 event is data-driven from events.json and fires
  in node. The verbs are dead because no policy calls them, not
  because the event cannot fire.)

### Metric 6 — Trade-sourced gear: 0

- Nonfood items entering the pack via a trade verb: **0** on all
  routes (cart / resident / river). Panel `craftTradeGear` would read
  0 on this band — not because the panel is broken, but because the
  substrate never trades. Food bought: 0 kcal. News bought: 0
  (strangersHeard moved only via invites and the river-trader
  reward's own accounting, never via a purchase).

### Metric 7 — Appraisals + scams: 0

- Appraisal verdicts: none recorded (the verb never ran).
  Scam ledger entries from trade: **0**. Confront discounts: **0**.
  The scam system — overprice, tier lies, spoiled-as-fresh — is
  entirely unexercised in lived play on this band. Its 12 unit tests
  prove the rails; nothing proves a scam can actually happen to a
  village, because nothing ever reaches the counter.

### Metric 8 — Villager-side trade: 0, by construction

- No villager-initiated trade verb exists in code (caller census:
  trade verbs are called only from app.js buttons, the conversation
  hawker branch, membership auto-intake, and tests). The pilot
  confirms the zero: no `visitorBuyWare`/`traderSell`/`hawkerBuy`
  call carries a villager caller, and no villager ever bought from
  another villager. Villagers do not trade with each other, with
  traders, or with the river trader — they cannot; there is no verb
  for them to call.

### Metric 9 — Wall numbers

| Seed | Days | End | Scale | Max wave | Standing | Deaths | End pantry kcal |
|---|---|---|---|---|---|---|---|
| 180265 | 143 | village-lost | regional | 4 | 199 | 76 | 0 |
| 180266 | 147 | village-lost | regional | 4 | 199 | 89 | 0 |
| 180267 | 94 | village-lost | regional | 4 | 199 | 73 | 0 |
| 180268 | 104 | village-lost | regional | 4 | 199 | 88 | 3250 |
| 180269 | 144 | village-lost | regional | 4 | 199 | 82 | 0 |
| 180270 | 150 | survived | regional | 4 | 199 | 99 | 10652 |
| 180271 | 150 | survived | regional | 4 | 199 | 104 | 0 |
| 180272 | 148 | village-lost | regional | 4 | 199 | 92 | 0 |
| **Pooled** | **median 145.5** | **6/8 lost** | **regional 8/8** | **wave 4: 8/8, wave 5: 0/8** | **199 ×8** | **703** | — |

- National **0**, table **0**, wins **0** — the scale wall stands on
  this band, same as the sibling pilots. Wave 4 unlocked 8/8,
  wave 5 0/8. Standing is 199 on all 8 seeds (the regional cap
  shape the siblings also see).
- Death causes (703): villager combat 253, expedition 205, combat
  136, the wild 66, monster 15, wound 7, arena 6, ambush 3,
  contest 3, sickness 2, dehydration 1, starvation 1, thirst 1,
  the rest singletons (The Focus Group, Gavel, Ad Break, a
  stranger). Villages die fighting and travelling, not starving.

## Village assessment (plain words)

The village is a place traders want to come to and nobody wants to
trade in. Word travels — the arrival line says so, 118 times, and it
is true: Haven has food, the carts roll in, the river trader walks
up on day 21 with river-mud on their boots and a practiced smile.
And then nothing happens. The trader waits a day, says nothing more,
and walks on down the road. The same three names, the same two
lines, 118 times: arrival, departure, silence in between. The
village takes in the frightened and the curious on its own — the
auto-intake quietly grows the roster by 11 over the band — but it
never takes the trader's hand. The river trader is the saddest
figure in the corpus: they arrive with news that could save lives
(the silent dogs that fear fire) and a gift of smoked fish, and on
all 8 seeds the village lets them stand there till dusk and leave.
The goods the cart carries — alien loot, good steel, trail rations —
are the exact things a village dying of combat and expeditions
needs, and they are priced in the one currency the village has in
surplus (finished food). The shop is stocked, the customers are in
the doorway, and the counter has never once been used. That is the
blank this arm found: not a missing system, but a missing caller —
trade is a UI-only verb in a game whose default driver never opens
a UI.

## Sense test (do traders read like people trading?)

No — because nobody trades, and the lines know it. The corpus
(351 trade-matched say-lines, cap never hit — max 58/seed) contains
exactly four kinds of trader speech, and none of them is a
transaction:

1. **Arrival** (118×, once per trader — the count reconciles
   exactly with the 118 arrivals):
   > "Riders on the ridge — no, a cart. A TRADER. Word travels:
   > Haven has food, and where there's food there's trade."
   Good line. It promises trade and the game never delivers on it.
2. **Departure** (117×, once per trader who left):
   > "A weathered trader waits a while, then moves on down the
   > road. Word travels about that, too."
   Honest, and damning in aggregate: the only trader sentence the
   village ever hears twice is goodbye.
3. **The river trader** (8× day 21 + 8× "a day early"):
   > "🐪 A trader from the downriver village walks into Haven, pack
   > heavy, smile practiced. River-mud on their boots, river-gossip
   > on their tongue."
   > "🐪 A river trader walks into Haven a day early — word of the
   > village's standing travels faster than feet. 'Heard Haven's
   > name on the river,' they say, pack heavy, smile practiced.
   > 'Thought I'd see it for myself.'"
   The river trader is the only trader who ever speaks twice — and
   still never transacts.
4. **Traders as the world's newspaper** (~50 lines, the richest
   trader speech in the game — all of it free, none of it bought):
   > "🧳 The trader lowers their voice. 'And further still — FOUR
   > fires under one head. They call it a REALM. Tribute flows
   > uphill like a river; I saw the grain carts with my own eyes.'
   > They won't say more. Or can't."
   > "🗣️ Word with the traders: The Hungry Road sent Emberhold
   > grain when their stores ran thin — no tribute, no ceremony,
   > just food on the road."
   > "🧳 Word comes late, through traders: Thornfield has bound
   > itself to The Red Table. The region's map is being redrawn —
   > not by Haven."
   These lines (from scaleDiscovery.js, voiced through a trader)
   are the one place trade feels like people: news, grain aid,
   realms forming — the world talking through the road. But they
   arrive as free narration, not as something bought at the cart:
   the "Road news" ware (300 kcal) was never purchased on any seed,
   and the news in these lines is delivered by the scale system
   regardless of any trader being present.

Verdict on the sense test: the trader *persona* reads like a
person — weathered, practiced, gossiping, watching the world
redraw itself. The trader *transaction* does not exist in lived
play at all. A player who walks up to the cart in the real game
would find a working shop (the 12 unit tests prove it); a village
left to itself finds an empty doorway. The fiction is ready. The
driver is not.

Caveat on the corpus: the say-regex is narrow by design (it
excludes bare 'trade'/'buy'/'sell' so combat "traded blows" lines
do not eat the 200-line cap). It therefore misses departure lines
for non-trader-named visitors ("A curious wanderer waits a
while…") — those departures are still counted in Metric 2 from the
instrument, only their lines are absent from the quoted corpus.
The cap never bound (max 58 lines/seed).

## Neutrality (control vs neutral, 8/8)

days + end pantry kcal + deaths match exactly on all 8 seeds
(including seed 180268, where both legs end at 3250 pantry kcal).
Instrument errors 0 on all seeds, all legs. The instrument is
neutral: wrapping 17 methods and snapshotting daily changed nothing
about any village's fate.

## Wrap liveness (pilot vs fixture)

- Live in the pilot: considerStrangers, visitorDaily,
  visitorInteract, evRiverTrader, tele (8/8 seeds).
- Proven live in the proof fixture (test-tradefirst-a.js, 87/87)
  and **dead under competent** in the pilot — the zeros are real,
  not dead wraps: visitorWares, visitorBuyWare, traderSell,
  traderPay, traderAppraise, hawkerOffer, hawkerBuy,
  feedRiverTrader, tradeRiverTrader, snubRiverTrader,
  recordMarketExchange, recordScam.
- Tele 'godpath_deed' market_exchange events: 0 in the pilot
  (consistent with 0 market exchanges).

## Telemetry deviation check

REFUSED expected (recorder rows, not runs) — same handling as
sibling first-numbers arms; baseline NOT rolled. The scale-wall
baseline (national/table/wins/exiled) is unchanged by this arm: the
wall numbers above are the same shape the baseline already holds
(0 national, 0 table, 0 wins on the band).

## Balanced panel (§15)

No panel comparison: measurement arm, no lever change, no
before/after arms (same position as cookfirst-a, preserve-a,
fishfirst-a, travelfirst-a). Panel context: no panel metric for
trade except `craftTradeGear`, which would read 0 on this band
(Metric 6).

## Metric review (§14)

- **Prereg correction 1 — the river event DOES fire.** The prereg
  said evRiverTrader was expected dead under the harness because
  sim-harness stubs drama. That was wrong: `G.drama` is the
  visual-effects hook (drama.js), not the event scheduler. The
  day-21 event is data-driven (events.json `scheduledDay` via
  `scheduleSystemEvents`) and fired 8/8 seeds. What is dead under
  competent is the feed/trade/snub *verbs*, not the event. The GO
  bar is unaffected (the river row counted calls, and the calls
  were 0 as expected) — but the mechanism named in the prereg was
  wrong, and the evidence corrects it here.
- **Prereg correction 2 — a second river-trader path.** The
  Village-stage ladder reward (`_ladderRewardTrader`,
  metaProgression.js) writes `scholar.riverTrader` directly and
  fires on all 8 seeds (the "a day early" line). The instrument
  does not wrap it; its arrival is visible only via snapshots and
  say-lines. A future arm that wants the full river-trader count
  should wrap `_ladderRewardTrader` too.
- **Metric 2 counting note.** "Departures unvisited" counts only
  visitorDaily departures. The 11 invite-joins remove the visitor
  inside visitorInteract, so they are not departures and are not
  counted as either visited or unvisited there; they are counted
  separately in the interacts table. The reconciliation
  (267 = 253 + 11 + 3 still present) holds.
- **SAY_RE caveat.** The narrow regex misses departure lines for
  visitors whose names contain no trade word (scout/curious/
  fleeing). The instrument counts are complete; only the quoted
  corpus is trader-name-biased. A future arm wanting the full
  departure voice should match "waits a while, then moves on"
  instead.
- **Metric 3's unknown.** The cart's wares are unmeasured in live
  play (0 generations). Prices, tiers, and the alien-loot roll are
  known only from code + fixtures. Any claim about what traders
  sell on a real band needs a merchant-policy arm (livelihood.js
  `merchant` actually buys) — competent alone cannot supply it.
- **What held.** The metric set held: every metric counted or was
  explicitly marked (the zeros are the finding). No metric needs
  revision for the next run; the next run is a policy question
  (merchant arm), not a metric question.

## Findings for the backlog

Appended to hidden_files/sim-findings.md (this evidence file):
- Trade/market — THE CART NEVER OPENS (the blank).
- Trade/river — THE RIVER TRADER STARVES (event fires, verbs dead).
- Trade/hawker — VILLAGER HAWKERS NEVER OFFER (conversation-only).
- Trade/canon — NO TRADE/MARKET CANON DOC.
- Trade/news — TRADERS ARE THE NEWSPAPER, FREE (Road news never bought).

## Files

- Prereg: evidence/2026-11-10/sim-tradefirst-a-prereg.md (7bb341f69)
- Instrument + driver + analyzer + proof: scripts/tradefirst-instrument-20261110.js,
  scripts/tradefirst-driver-20261110.js,
  scripts/tradefirst-analyze-20261110.js, scripts/test-tradefirst-a.js (220730e93)
- Per-seed corpus: evidence/2026-11-10/perseed-tradefirst-a/ (16 files: 8 control + 8 neutral)
- Summary JSON: evidence/2026-11-10/tradefirst-summary-tradefirst-pilot.json (this commit)
- Evidence: evidence/2026-11-10/sim-tradefirst-a.md (this commit)

## Run notes

- Runtime restart interrupted the first control-leg run after 4/8
  seeds (07:36 UTC); the 4 finished files were verified valid JSON
  and the leg was resumed for the remaining 4 seeds only (the driver
  refuses to overwrite). No seed was run twice; no file was
  overwritten.
- The safe-commit index clobber hit on both commits (prereg + tooling);
  repaired both times with `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`, verified `git status --short`
  empty after each repair.
- Seed band: assigned 180257–180264, shifted to 180265–180272 (see
  prereg — 180259 is named in the travelfirst prereg as the endpoint
  of a searched range; strict freshness reading). Freshness verified
  across all preregs + the full evidence *.md tree + perseed dirs.
- Canon gap: no dedicated trade/market canon doc exists (grep of
  docs/ finds only mentions). Mechanics here are grounded in
  betrayal.js §§8b/10, game.js river trader, livelihood.js merchant
  policy, conversation.js hawker branch.
