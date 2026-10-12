# Long-run sim — LEVER 4: Knowledge & Teaching, r4 (2026-10-12)

Worktree branch: `sim-knowledge-r4` (lever: the trader channel becomes reachable).
Lever played: **the `trade` offer no longer loses the menu slot lottery** — one
small, documented game change in `src/js/conversation.js`, mirroring the
2026-10-08 `teach` starvation fix. Base: master `c1d466d1` (includes r1's
experiment lever, r2's kitchen-deepening, r3's fireside combine). This is r4
of the SAME lever-4 slot; r3's blank menu is the assignment ("0 traded
identifications in 40 runs — the trader combine path is mechanically proven
but practically unreached").

## The diagnosis (what the code revealed)

The assignment expected a game-side spawn/meeting gate. The code revealed
**three gates, two of them legitimate design, one a real bug**:

1. **Sim coverage (the 0/40)**: traders spawn (5/8 rosters: journalist, fishing/hunting
   guide, ESL teacher, librarian), meetings happen (talkRound), the mention fires
   (50%/opener, verbal only), and the `trade` choice appears one answer-turn after
   the opener — but **no sim policy ever takes a conversation turn toward it**
   (talkRound opens+closes; askRound only takes `agency:` choices). The gate is in
   the measurement apparatus. Fixed with instrumentation, not game code: a
   `tradeRound` hook in the sweep (`scripts/trade-hook.js`) modeling the competent
   player who engages trader offers — same class as the existing askRound hook.
2. **Menu slot starvation (the real bug, game-side)**: the `trade` discovery action
   competed for remaining MAXC slots (`if (!onThread && choices.length < MAXC)`)
   and lost on full menus — the exact starvation the `teach` verb was fixed for
   (2026-10-08). Proven: seed 7's trader, channel discovered, post-answer menu of
   10 (5 topics + theorize + compare_maps) with NO `trade` choice. The mention had
   fired; the offer was strangled by topic slots.
3. **Legitimate gates (verified, not changed)**: the 50%-per-conversation mention
   (expected ~2 trader conversations to discover; then village-global via
   `discover('trade')`); the language barrier — the Norwegian hunting guide on
   seed 9 holds fully nonverbal conversations (`nvOpen` returns before the mention
   block, so the English mention never fires there either — no leak); the
   `tradeable` filter (trader's 2–3 plant pool, only what you know below L3).

## The lever (exact changes)

**`src/js/conversation.js`** (the only game change, ~11 lines): the trade block now
computes `tradeChoice` under `!onThread && !suppressPivot` (the teach pattern —
no trade pitches mid-grief/reactive-question) and pushes it after the capped
topics (`if (tradeChoice) choices.push(tradeChoice);`) instead of competing in
the slot lottery. Same label, same mention/discovery/tradeable conditions.

**`scripts/trade-hook.js`** (new, sweep tooling — NOT game code): `tradeRound(Game, K)`
— daily, per knowledge trader: open, engage the opener question (first `ans:`,
deterministic), take `trade` when offered, accept `trade_yes` iff affordable
(trust→free; food→300 kcal on hand; knowledge→`tradeCurrency` replicates the
game's own check), else honest `trade_no`. Near-miss instrumentation r3-style:
`tradeNoOffer:<tradeable-empty|mention-missed|no-engage>`,
`tradeDeclined:<reason>`, `tradeOutcomes` by token. The hook's own decisions
consume no Math.random; the game's internal rolls stay honest.

**`scripts/sweep-knowledge-lever.js`**: wires the hook (`TRADE_HOOK=1` enables;
default off so the before-run reproduces r1–r3), wraps `tradeKnowledge` (outcome
tokens) and `sayLine` (mention counter), records trader metrics per run.
**`scripts/analyze-r4.js`**: before/after comparison. **`docs/KNOWLEDGE.md`**: one
factual line registering the fix (same as r3's toll-ladder annotation).

RNG discipline: the lever's own picks consume no Math.random (choice assembly is
arithmetic; the hook's decisions are deterministic). Downstream re-shuffle from
the hook's extra conversation turns is honest cascade, documented below.

## Method

- BEFORE `/tmp/knowledge-r4-before.json`: unlevered game.js/conversation.js,
  `TRADE_HOOK` unset — reproduces r1–r3's conditions exactly.
- AFTER `/tmp/knowledge-r4-after2.json`: levered conversation.js + `TRADE_HOOK=1`.
  20 seeds × 200 days, competent+ask policy, identical seeds 1–20. Analysis:
  `scripts/analyze-r4.js`. The after-sweep was re-run on the final committed
  code and reproduced bit-identically (29 ok / 358 meetings / 32 offers).
- Proof: `scripts/test-trader-hook-20261012.js` — **17/17** (full path T1,
  sense T2, currency T3, honest decline T4, RED baseline T5, starvation fix T6
  red-checked against stashed unlevered conversation.js: T6b fails unlevered).
- Regressions: `test-knowledge-lever-20261011` 24/24, `test-kitchen-depth-20261011`
  27/27, `test-combine-toll-20261011` 32/32, ontology 83/83. No concurrent jest.

## Before/after on identical seeds (20 seeds × 200d)

| Measure | Before | After |
|---|---|---|
| **traded identifications** (`identifyPlant` 'traded') | **0** | **14** |
| tradeKnowledge outcomes | {} | **29 ok**, 3 declined (`knowledge-nothing-new`) |
| trader meetings / offers | 0 / 0 | 358 / 32 |
| trader mentions heard | 40 | 56 |
| no-offer near-miss | — | tradeable-empty 189, mention-missed 94, no-engage 43 |
| `traded:player` / `traded:villager` learn events | 0 / 0 | 14 / 19 |
| combineKnowledge firings | 47 | 45 |
| combine near-misses | 342 | 341 |
| player plant L1/L2/L3/L4 | 444 / 8 / 19 / 34 | 433 / 12 / 25 / 37 |
| prepKnown | 61 | 74 |
| identifyBy (fireside/tested/sample/shared) | 29/63/81/243 | 29/66/86/225 |
| teachPlant (p→v) | 295 | 319 |
| median / max survival | 70d / 151d | 70d / 151d |
| deaths P/V | 89 / 100 | 90 / 99 |
| player death causes (starv/combat) | 28% / 70% | 28% / 70% |
| endReasons | 20 village-lost | 20 village-lost |
| wave max-unlock (1/2/3) | 1 / 7 / 12 | 1 / 8 / 11 |
| arc 3 reach | 18/20 | 19/20 |
| scale > village / won | 0 / 0 | 0 / 0 |
| counters discovered | 201 | 203 |
| traps crafted/looted | 2 / 0 | 3 / 0 |

**Reading:** the trader channel is reachable now — 0→29 completed trades across
7/20 runs, 14 traded identifications, the knowledge-price path teaching the
trader back (19 `traded:villager` events). The lever's direct effects (knowledge)
all move the right way (L2/L3/L4 up, prepKnown 61→74); the r3 fireside chain is
undisturbed (combines 47→45, near-miss 342→341 — noise). Mission deltas are nil
(median survival 70d both, death causes identical): the lever adds a knowledge
channel, it doesn't move survival — honest, and consistent with r3's finding that
knowledge gains are small against the combat/starvation wall. 8/20 runs met no
trader (roster RNG) and 5/20 met one but never closed (language barrier /
mention-miss / early trader death) — the channel is reachable, not guaranteed,
which is the design.

## Reachability verdict (the trader channel)

- **Reachable NOW**: knowledge traders teach at L2/L3 via the `traded` channel —
  29 completed trades in 7/20 runs (was 0/40). The offer appears once the opener
  question is engaged, on any menu shape; prices are payable (knowledge-price
  dominant in sims; the currency check replicates the game's own).
- **Reachable but gated by design**: the 50% mention (discovery by talking, ~2
  trader conversations expected); the language barrier (Norwegian guide: fully
  nonverbal, no trade — verified the English mention never fires there);
  pool exhaustion (2–3 plants per trader; 189 tradeable-empty near-misses are the
  hook pestering traders daily after buying them out — a real player moves on).
- **Still decorative in practice**: the win flag / table / national scale (0/40 —
  the scale wall, not a knowledge gap); animal codex depth (r3's documented blank,
  untouched this run).

## Village assessment (plain words)

Seven villages in twenty found their trader and sat down for the oldest deal
there is: what I know for what you know. Salvador the hunting guide knew cattail
deep — rhizomes like potato, young shoots like asparagus, pollen for flour,
heads for tinder — and wanted Wild Ginger in return; the scholar paid it and
walked away with Level 2 and flour on their mind. The traders aren't quest
givers; they're the village's memory of the old world made transactional — a
librarian, an ESL teacher, a fishing guide — people whose former lives were
about knowing things, now bartering that knowing for food or for new knowing.
Three times the scholar had to walk away honest: "Bring me something I haven't
seen and we'll talk." And one village (seed 9) had its Norwegian hunting guide
all run long and never traded a word — not a bug, just no shared language, the
barrier Steve designed holding exactly where it should.

## Sense-testing findings (read, not counted)

- **The trade sequence reads as one human negotiation** (seed 6): the mention
  ("...I should say, I trade in what I know. My knowledge for yours. Or food,
  if you're short on secrets.") → the offer under the trader's own descriptor
  ("tall reeds with brown sausage-shaped heads. Deep knowledge. ...What do YOU
  know that's worth it?") → the honest accounting ("Trade: you teach Salvador
  about Wild Ginger. They teach you about Cattail. Knowledge for knowledge.") →
  the earned depth ("📚 TRADED KNOWLEDGE: Cattail — Level 2... Parts: rhizomes
  (starch, like potato)..."). The true name is NOT spoken by the trader before
  the deal — the offer uses the descriptor the player would recognize, and the
  name arrives with the identification. Knowledge-gating holds through the sale.
- **The cattail depth text is real knowledge** (rhizomes/shoots/pollen/heads uses)
  — the game teaching actual foraging, per the core thesis.
- **The decline is honest, not a dead button**: `trade_yes` with an empty pack at
  the food price declines with the counted reason, no charge, no phantom lesson
  (T4). The 3 `knowledge-nothing-new` declines are the "bring me something I
  haven't seen" beat — a reason, not a wall.
- **Baseline narration repetition persists** (r1–r3's documented blank, fourth
  confirmation): "Hunger gnaws. The pack is thin…" still dominates transcript
  windows. Still needs `pickFresh` for status lines — future lever.

## Blanks filled vs documented

- **Filled**: the trader channel is reachable (0→29 trades, 14 traded
  identifications); the menu-slot starvation bug (trade lost the MAXC lottery —
  the teach fix's sibling); the sim-coverage blank (the sweep now models a
  player who trades, with near-miss instrumentation: tradeable-empty 189,
  mention-missed 94, no-engage 43).
- **Documented**: the scale wall (0/20 national, 0 wins — not a knowledge gap);
  animal codex depth (r3's blank, untouched); narration repetition (r1's blank,
  confirmed 4×); the `no-engage` bucket conflates pre-answer nonverbal menus
  (language barrier, legitimate) with post-answer thread/pivot gating
  (coherence design, legitimate) — separated only coarsely; pool exhaustion
  means one trader = 2–3 lessons ever (design, but worth a future look if the
  channel feels thin in real play).
- **Next blank (named)**: trader pool refresh/depth — pools are 2–3 deterministic
  plants, never refresh, and `tradeable-empty` dominates the near-miss (189/326).
  If real-play feedback says traders go quiet too fast, the lever is pool growth
  (traders learning from the village over time), not price.

## Commits (in worktree branch `sim-knowledge-r4`, for --ff-only landing)

1. Lever + tooling: `src/js/conversation.js` (trade starvation fix),
   `scripts/trade-hook.js` (new), `scripts/sweep-knowledge-lever.js` (hook wiring
   + trader instrumentation), `scripts/analyze-r4.js` (new), `docs/KNOWLEDGE.md`
   (canon line). No `[needs-eyes]`: no feel/combat/UI change — a menu-ordering
   fix plus narration in existing style.
2. Proof: `scripts/test-trader-hook-20261012.js` (17/17, red-checked).

Tests run: `scripts/test-trader-hook-20261012.js` 17/17 (fixed seeds, T6
red-verified against unlevered conversation.js); regressions 24/24, 27/27,
32/32; ontology 83/83. Sweeps 20×200d before + after on identical seeds
(after re-run bit-identical on final code). No concurrent jest. No game-code
edits during any sweep.
