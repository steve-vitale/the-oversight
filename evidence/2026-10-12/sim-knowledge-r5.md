# Long-run sim — LEVER 4: Knowledge & Teaching, r5 (2026-10-12)

Worktree branch: `sim-knowledge-r5` (lever: traders learn from the village over time).
Lever played: **trader pool growth** — knowledge traders pick up village
knowledge through legitimate channels, and what they learn DEEP joins their
tradeable pool. Base: master `dc4099dd` (includes r4's trade starvation fix +
trade hook). This is r5 of the SAME lever-4 slot; r4's named next blank was
the assignment ("pools are 2–3 deterministic plants, never refresh, and
tradeable-empty dominates the near-miss (189/326). If real-play feedback says
traders go quiet too fast, the lever is pool growth (traders learning from
the village over time), not price").

## The diagnosis (what the code revealed)

`traderKnowledge(vid)` built the pool purely from a vid hash — 2–3 plants,
frozen at roster generation, forever. But the LEARNING half already existed
scattered: `tradeKnowledge`'s knowledge-price path calls
`villagerLearnsPlant(vid, trade, 'traded')` (r4 measured 19 `traded:villager`
events), and traders sit at the same fires as everyone (`firesideTeaching`
calls `villagerLearnsPlant` for the whole roster). The village was ALREADY
teaching its traders — the pool just never listened. The blank was a missing
depth record, not a missing channel.

## The lever (exact changes)

**`src/js/game.js`** (the only game change, ~110 lines, all additive):
- `traderPoolGrowth()` — the gate. Browser default ON; node
  `TRADE_POOL_GROWTH=0` reproduces the legacy static pool exactly (nothing
  recorded, nothing read). Same `typeof process` pattern as TELEMETRY_FULL.
- `traderLearnExposure(vid, pid, source, alreadyKnew)` — hooked into
  `villagerLearnsPlant`, so it runs on the SAME legitimate learn events every
  other villager gets (fireside, word of mouth, taught, traded, foraging,
  working, tested, observed...). First exposure records identity
  (`{day, via, deep:false}`); a second exposure through a DIFFERENT channel
  at least 3 days later deepens to tradeable (the L3 they sell at). Slow by
  canon (Steve 2026-10-05): at most one new deep plant per trader per 12
  days. Static-pool plants skip (already tradeable); the player's id never
  counts. Records live in `v.traderDeep[vid][pid]` (plain JSON, save-safe).
  On deepening, the village says so out loud — knowledge-gated phrasing
  (`plantDisplayName`: the name only if the player knows it, else the
  descriptor).
- `traderKnowledge(vid, unfiltered)` — returns static core + deep plants
  (in that order). The existing L3 filter, the trade thread's
  descriptor-not-name offer, the `tradeKnowledge` currency check (deep plants
  can't be spent back as price), and `combineKnowledge`'s "a trader" L3
  credit all flow through automatically. The lever consumes zero Math.random.

**`scripts/trade-hook.js`**: records `K.traderIds` per meeting (end-state
roster misses dead traders). **`scripts/sweep-knowledge-lever.js`**: r5
instrumentation — `deepTrades` (tradeKnowledge 'ok' on a deep-pool plant),
end-state `traderDeep` summary (deep counts, via pairs, pool sizes, alive/
dead), per-trader pool sizes at the day-50/100/150/200 snapshots.
**`scripts/analyze-knowledge-r5.js`** (new; `analyze-r5.js` was already taken
by the completion sweep). **`scripts/sense-probe-r5.js`** (new): full-
transcript sense probe. **`docs/KNOWLEDGE.md`**: the pool-growth section.

Numbers: identity→depth needs a different channel ≥3 days later; 12-day cap
per trader. Coordinator's call (Steve 2026-10-07) — he can overrule. No
`[needs-eyes]`: no new UI, no combat/feel mechanic — one narration line in
the established fireside voice, and offer content that was always meant to
vary.

## Method

- BEFORE `/tmp/knowledge-r5-before.json`: levered code,
  `TRADE_POOL_GROWTH=0`, `TRADE_HOOK=1` — reproduces r4's conditions exactly
  (deepTotal=0 verified).
- AFTER `/tmp/knowledge-r5-after.json`: same code, `TRADE_POOL_GROWTH=1`,
  `TRADE_HOOK=1`. 20 seeds × 200 days, competent+ask policy, identical seeds
  1–20. Analysis: `scripts/analyze-knowledge-r5.js`.
- Proof: `scripts/test-trader-pool-growth-20261012.js` — **22/22**
  (T1 RED: growth-off records nothing, pool bit-identical; T2 identity
  anchor; T3 same-channel repeat no-depth; T4 different-channel +1d
  no-depth; T5 different-channel +10d deepens, pool +1, offered; T6 12-day
  cap refuses then lands; T7 static-pool plants never recorded; T8 sense:
  narration names the trader, no true-name leak at player L0, offer shows
  the descriptor).
- Regressions: trader-hook 17/17, knowledge-lever 24/24, kitchen-depth
  27/27, combine-toll 32/32, tradeecon ALL, trade-repeat 5/5, trade-wrong 4
  seeds, ontology 84/84. Pre-existing failures (verified identical on
  pristine game.js via stash): trade-honesty 3 FAILED, conversation-
  discovery endConvo crash — not from this lever.
- RNG discipline: the lever consumes no Math.random. Before/after deltas in
  mission measures on 3/20 seeds are honest downstream cascade (changed
  tradeable lists → the hook takes different conversation turns → game rolls
  shift), the same class r4 documented.

## Before/after on identical seeds (20 seeds × 200d)

| Measure | Before (growth off) | After (growth on) |
|---|---|---|
| **deep plants gained by traders** | **0** | **7** (Simone, Krzysztof, Salvador, Omondi, Gladys, Hedda, Samuel) |
| **deep-plant trades completed** | **0** | **3** (seeds 4, 6, 8) |
| deep-via channel pairs | — | taught+fireside, traded+fireside ×2, foraging+fireside, fireside+observed, working+fireside, tested+fireside |
| tradeable-empty near-miss | 159 | **78 (halved)** |
| tradeKnowledge 'ok' | 26 | 29 |
| traded identifications | 12 | 12 |
| trader meetings / offers | 361 / 32 | 286 / 37 |
| player plant L1/L2/L3/L4 | 454 / 10 / 27 / 30 | 475 / 11 / 31 / 30 |
| prepKnown | 67 | 72 |
| teachPlant (p→v) | 237 | 246 |
| combines / nearMiss | 40 / 365 | 38 / 357 |
| median / max survival | 65d / 167d | 63d / 177d |
| deaths P/V | 74 / 110 | 67 / 116 |
| player death causes (starv/combat) | 27% / 66% | 31% / 63% |
| wave max-unlock (2/3) | 13 / 7 | 14 / 6 |
| arc 3 reach | 19/20 | 19/20 |
| scale > village / won | 0 / 0 | 0 / 0 |
| counters | 180 | 177 |
| traps crafted/looted | 0 / 0 | 0 / 0 |

**Reading:** the pool grows and the growth SELLS — 7 deep plants across 7
traders, 3 of them bought back by the player, and the tradeable-empty
near-miss halved (the restock works: traders bought out go quiet, then come
back with new stock). The deep-via pairs are all fireside-anchored — the
fire is the deepening engine, exactly per canon. The lever's direct effects
all move the right way; mission deltas are noise (median survival 65→63d,
death causes within a few points — the lever adds a knowledge channel, it
doesn't move survival, consistent with r3/r4). Traded identifications flat
at 12: the 3 deep sales deepened plants the player already knew (L1/L2→L3),
they didn't name new ones — growth restocks DEPTH first.

Per-seed (after): seed 1 Simone deepened 1 (died, 3 ok trades); seed 4
Krzysztof deepened 1, sold it back (4 ok); seed 6 Salvador deepened 1, sold
it (7 ok); seed 8 Omondi deepened 1, sold it (5 ok); seed 9 Gladys+Hedda
deepened 1 each but never traded (Norwegian language barrier — mention never
fires); seed 13 Samuel deepened 1 (5 ok, died); seeds 7/14 traders alive at
end with static pools (mention-missed / bought out).

## Reachability verdict (the trader channel + pool growth)

- **Reachable and now self-renewing**: the trade channel restocks. A trader
  bought out on day 5 can have new offers by day 20 — the "goes quiet too
  fast" blank is filled: 159→78 tradeable-empty, 3 deep sales on identical
  seeds.
- **Gated by design, unchanged**: the 50% mention, the language barrier
  (seed 9's Norwegians deepened TWICE and sold nothing — the barrier holds
  exactly where it should), the knowledge-price currency check (deep plants
  can't be spent back).
- **Capped by mortality, not mechanics**: 8 of 10 traders met were dead by
  run end (median survival 63d). All 7 deep plants belonged to traders who
  later died; the 2 living end-state traders had static pools. Growth is
  real but its long-run value dies with the trader — a future lever's blank
  (trader survival/role value), not this one's.
- **Still decorative**: the win flag / table / national (0/40 — the scale
  wall); animal codex depth (r3's blank).

## Village assessment (plain words)

Seed 4 told the whole story in eleven days. On day 2 the scholar sat down
with Krzysztof the fishing guide and paid for Pawpaw-depth with a name:
"Trade: you teach Krzysztof about Black Walnut. They teach you about
Pawpaw." Krzysztof carried that name to the fire. On day 11, while Sofia
passed Black Walnut around and someone asked a dumb question nobody minded,
the village noticed: Krzysztof had been turning it over — asking after it
at fires, handling it on work days — and now knew it deep enough to teach.
On day 13 the scholar came back with food and bought back the depth:
"Okay. Black Walnut. Here's what I know..." — Level 3, highest-calorie wild
nut, oil-rich, keeps for months. The oldest deal there is, completed in a
circle: you sold him the name, he did the work, you bought back the
mastery. Salvador the hunting guide (seed 6) did the same with his own
stock — seven trades in thirty-two days, then dead like so many. And on
seed 9, Gladys and Hedda the Norwegians learned deep and never sold a word
— no shared language, no trade, the barrier Steve designed holding while
the knowledge piled up behind it.

## Sense-testing findings (read, not counted)

- **The deepening beat reads as village news, not UI** (seed 4, day 11 —
  full transcript): it lands between "You catch fragments by the fire —
  Lena telling Tiana about Adaeze. The retelling is already better than the
  event." and "Fireside lesson: Sofia passes around Black Walnut. Someone
  asks a dumb question. Nobody minds." The line itself: "Krzysztof has been
  turning the Black Walnut over — asking after it at fires, handling it on
  work days — and now knows it deep enough to teach. (Their trade grows: ask
  them what they know.)" A person getting good at something, noticed by the
  fire. The parenthetical is narrator-to-player guidance, honest about what
  changed.
- **The buy-back is a complete human loop** (day 13): "Krzysztof takes your
  food, nods. 'Okay. Black Walnut. Here's what I know...'" → "📚 TRADED
  KNOWLEDGE: Black Walnut — Level 3. Krzysztof knew it deep. Uses:
  highest-calorie wild nut. Oil-rich. Keeps for months in shell." The
  knowledge-price path now has a return — what you sold them can come back
  deeper. Nothing robotic: the price line, the nod, the depth text.
- **Knowledge-gating holds through growth** (proof T8, driven): the
  deepening narration and the trade offer both use the descriptor while the
  player is L0 — no true-name leak from the new pool. The trader's wrongness
  machinery (`wrongTeaching` on sale, trader's-belief offer names) applies
  to deep-pool plants unchanged — a trader who learned it wrong at the fire
  sells it wrong, and the game is honest about it.
- **The combine hint fires on grown depth** (day 11): "💡 Black Walnut: the
  village and a trader know more than you do. Harvest it a few more times
  (0/2) and it'll click." — the grown pool feeds the r3 combine chain.
- **Baseline narration repetition persists** (r1's blank, fifth
  confirmation): status lines still dominate windows. Still needs pickFresh
  for status lines — future lever.

## Blanks filled vs documented

- **Filled**: trader pool refresh/depth — pools grow via legitimate village
  channels (7 deep plants, 3 deep sales, tradeable-empty halved on identical
  seeds); the restock beat (bought-out traders come back with new stock);
  the currency check honors the grown pool (deep plants can't be spent
  back); the deepening narration (the village talks about it); sim
  instrumentation for pool growth (traderIds, deep-via, pool snapshots).
- **Documented**: trader mortality caps the growth's long-run value (8/10
  dead by end; all 7 deep plants belonged to dead traders — future lever:
  trader survival/role); the scale wall (0/20 national, 0 wins); animal
  codex depth (r3's blank); narration repetition (r1's blank, 5×); the 3/20
  seeds whose day counts moved are honest RNG cascade, not lever effect;
  pre-existing test failures (trade-honesty 3, conversation-discovery crash
  — verified on pristine game.js).
- **Next blank (named)**: trader survival — growth works but its
  beneficiaries die. If real-play feedback says traders feel disposable,
  the lever is trader role value (why keep them alive), not pool mechanics.

## Commits (in worktree branch `sim-knowledge-r5`, for --ff-only landing)

1. Lever + tooling + proof + evidence: `src/js/game.js`
   (`traderPoolGrowth`, `traderLearnExposure`, `traderKnowledge` growth),
   `docs/KNOWLEDGE.md` (pool-growth section),
   `scripts/sweep-knowledge-lever.js` + `scripts/trade-hook.js` (r5
   instrumentation), `scripts/test-trader-pool-growth-20261012.js` (22/22,
   red-checked), `scripts/analyze-knowledge-r5.js`,
   `scripts/sense-probe-r5.js`, this evidence file. No `[needs-eyes]`.

Tests run: proof 22/22 (fixed seeds, T1 red-verified with TRADE_POOL_GROWTH=0);
regressions trader-hook 17/17, knowledge-lever 24/24, kitchen-depth 27/27,
combine-toll 32/32, tradeecon ALL, trade-repeat 5/5, trade-wrong 4 seeds;
ontology 84/84. Sweeps 20×200d before + after on identical seeds
(TRADE_HOOK=1 both). No concurrent jest. No game-code edits during sweeps.
Pre-existing failures verified identical on pristine game.js (stash test).
