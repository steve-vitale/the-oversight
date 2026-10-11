# Long-run sim — LEVER 4: Knowledge & Teaching, r2 (2026-10-11)

Worktree branch: `sim-knowledge-r2` (lever: village handling deepens shared knowledge).
Lever played: **the village's hands learn depth** — one small, documented game change.
Base: master `1cbdddcd` (includes r1's experiment lever). This is r2 of the SAME
lever-4 slot; r1's blank menu is the assignment. Picked ONE: **knowledge DEPTH
reachability — villagers deepening knowledge, not just names** (recommended).

## The lever (exact change)

**`Game.villageHandlingDeepens(v)`** (src/js/game.js, called from `villageEats`
once per village day) + a handling-event recorder in `villagerMealDay`:
- Every villager-day (not away, not dead), one handling event is recorded on a
  village-KNOWN plant (`v.sharedKnowledge` — the local flora they actually
  re-encounter). Deterministic rotation via `v.handlingCursor` — **RNG-neutral**:
  the pick consumes no `Math.random`, so before/after sims on identical seeds
  isolate the lever instead of re-rolling the world's dice.
- The beat accrues `sharedKnowledge[pid].servings` (+1 per village-day the
  plant was handled); at **8** the village knows parts/prep (**L2**), at **20**
  it knows uses (**L3**). Caps at L3 — mastery is personal, never communal.
- Narrates on level-up only, presence-gated (`playerAtHaven`) and
  knowledge-gated (`plantDisplayName` — descriptor, never a true-name leak,
  proven by proof test K1e). Unnamed plants are skipped (hands can't deepen
  what the village hasn't named).
- This is the **"others know deeper" half of `combineKnowledge`**: the fireside
  overlap mechanic existed but could never fire (shared was always L1).

Thresholds are a coordinator's call (Steve 2026-10-07): 8 days ≈ a week of
communal handling before the parts are known (player: 5 personal harvests);
20 ≈ three weeks before the uses are read (player: tastings at L2).

**Failed first attempt, documented:** the lever was first fed from communal
MEALS (ledger in `villagerMealDay` recording `pile.items` plantIds). Dead on
arrival — measured 0 servings in 20×200d: **the village's food is species-less
by design** (abstract kcal production, generic "Dried beans" staples with no
`plantId`), so the ledger never recorded a plant. Foraging-day handling is
where the village actually touches species, day after day. The meal-ledger
code was removed, not left dead.

## Method

- `scripts/sweep-knowledge-lever.js` (r1's tool, extended this run): added
  `combines` instrumentation (combineKnowledge firings) and `ks.sharedLevels` /
  `ks.sharedServings` / `ks.sharedMaxServings` end-state. 20 seeds × 200 days,
  competent+ask policy, identical seeds 1–20 before/after.
- BEFORE `/tmp/knowledge-r2-before.json` (unlevered game.js, extended sweep),
  AFTER `/tmp/knowledge-r2-after.json` (levered). Analysis:
  `scripts/analyze-r2.js`.
- Proof: `scripts/test-kitchen-depth-20261011.js` — 27/27 ×3 runs (fixed seeds).
  Covers the ladder (L1→L2 at 8, L2→L3 at 20, L3 cap), no true-name leak,
  unnamed-plant safety, ledger hygiene, expert-L2→L3, combine fires on
  village-L2+3-harvests, combine refuses at 0 harvests, and the
  villagerMealDay→beat integration (K8).

## Before/after on identical seeds (20 seeds × 200d)

| Measure | Before | After |
|---|---|---|
| sharedKnowledge entries w/ servings>0 (mean/run) | 0 | **15.6** |
| sharedKnowledge max servings (max/run) | 0 | **51** |
| sharedKnowledge level histogram (all runs) | 317 L1 | **72 L1, 151 L2, 94 L3** |
| combineKnowledge firings | 0 | 0 |
| player plant L2 / L3 / L4 (total) | 8 / 8 / 5 | 8 / 8 / 5 |
| player plant L1 (total) | 414 | 414 |
| prepKnown (total) | 21 | 21 |
| median survival | 58d | 58d |
| max survival | 105d | 105d |
| deaths P/V | 145 / 68 | 145 / 68 |
| endReasons | 20 village-lost | 20 village-lost |
| wave max dist | w1:1 w2:15 w3:4 | **identical** |
| arc reach | all 20 reach arc 3 | **identical** |
| scale | 20 village | **identical** |
| counters discovered | 147 | 147 |
| traps crafted/looted | 0 / 0 | 0 / 0 |
| tier-2 reach | 0 | 0 |
| tested identifications | 24 | 24 |
| teachPlant (player→villager) | 113 | 113 |
| monsters named / foodSafe | 116 / 26 | 116 / 26 |
| skills | 159 | 159 |
| vilMeanKnown | 17.1 | 17.1 |

**Reading:** the cleanest before/after this loop has produced — the mission
block is **bit-identical** (every number matches), proving the lever is
RNG-neutral and mission-neutral: pure knowledge, zero survival impact. The
depth block moves enormously: the village's shared knowledge goes from
universally L1 to 151 L2 + 94 L3. An intermediate RNG-consuming version of
this lever showed scary mission deltas (villager deaths 68→86); making the
pick deterministic erased them completely — **that delta was pure RNG
butterfly, and RNG-neutrality is now a proven measurement discipline for
knowledge levers.** No wins, no table, scale never leaves village in either
condition (the standing scale-on-ramp wall).

## The combine gap (documented, not this lever)

`combineKnowledge` still fires **0 times**. The village now genuinely knows
deeper — but the player's access path needs **3 personal harvests** on the
plant, and sim players never reach 3 harvests on one species (maxHarvests
0–1 at day 50; they forage for calories across depleting ground, not for
depth). The mechanic is now POSSIBLE (was impossible: shared was always L1);
a real player who deliberately works a plant can now combine at the fireside.
Closing the player-harvest pacing gap is a separate blank for a future lever —
this run did not touch Steve's 3-harvest gate.

## Reachability verdict (knowledge depth)

- Reachable NOW: village shared depth L2/L3 (151/94 entries across 20 runs —
  was 0); the fireside combine path is unlocked in principle.
- Still decorative in practice: player-side L2+ via combine (0 firings —
  harvest gate); animal codex depth (0 entries in 60 runs now — sims never
  eat meat; the input never arrives, thresholds untested); alien-disease
  building-block knowledge; the win flag / table / national scale (0/40 —
  the scale wall, not a knowledge gap).

## Village assessment (plain words)

The village was already a great breadth organism — by day 50 the average
villager knows ~17 plants and the rumor mill moves hundreds of transfers.
What it couldn't do was *deepen*: every shared entry sat at L1, the only L2s
in the world came from rare expert discoverers, and depth was the player's
lonely grind. Now the village's hands learn what its eyes recognized — after
a few weeks of hauling the same plants, the foragers know which parts are
worth carrying (L2), and after a couple of months they know what each plant
is *for* (L3). The fire has a new kind of evening: "🌿 Greenbrier Shoots,
weeks in the baskets. Handling it day after day, the village has learned
what it's FOR — not just what it is." The player hasn't caught up yet — the
village knows deeper than its scholar on 245 entries, and the scholar's
three-harvest toll still stands between them.

## Sense-testing findings (read, not counted)

- **New beat lines read well** (sampled 6 L3 lines across seeds 1/2/6/9):
  specific plant names, no true-name leaks (player knew these; the ignorant
  case is proven by K1e), honest attribution to collective handling, no
  repetition (fires once per plant per level).
- **Baseline narration repetition persists** (r1's documented blank, not this
  lever): "Hunger gnaws. The pack is thin…" ×15 in a 24-line transcript
  window. Still needs `pickFresh` for status lines — future lever.
- The L2 line ("which parts are worth hauling, which bruise, how it wants to
  be carried") is grounded in the foragers' actual work — it reads as earned,
  not granted.

## Blanks filled vs documented

- **Filled**: village knowledge depth (shared L2/L3 reachable — 151/94
  entries); the "others know deeper" half of combineKnowledge now exists.
- **Documented**: combine still 0 firings (player 3-harvest gate — the
  player's depth pacing is the next blank); animal codex depth 0/60 runs
  (sims never eat meat — input problem, not threshold problem); narration
  repetition (r1's blank, confirmed again); away-from-home handling (beat
  accrues while you're away, narration presence-gated — consistent with
  r1's awayLearned pattern); the failed meal-ledger attempt (species-less
  food model — a future lever could give village food species identity, but
  that's a food-model change, not a knowledge tweak).
- **Measurement discipline**: RNG-neutral lever design (deterministic
  rotation) — before/after bit-identical on mission measures. Recommended
  for all future knowledge levers.

## Commits (in worktree branch `sim-knowledge-r2`, for --ff-only landing)

1. `9f10a4a7` lever + proof test (27/27 ×3) + sweep extension + analysis tool.
   No `[needs-eyes]`: no feel/combat/UI change — pure knowledge bookkeeping
   plus two narration lines in existing style.
2. (this commit) evidence file `evidence/2026-10-11/sim-knowledge-r2.md`.

Tests run: `scripts/test-kitchen-depth-20261011.js` 27/27 (×3, fixed seeds);
`scripts/test-knowledge-lever-20261011.js` 24/24 (r1 regression);
break-knowledge gating/firesidewrong/r4 green; ontology 72/72. Sweep
20×200d before + after on identical seeds. No concurrent jest.
