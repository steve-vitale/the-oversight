# Long-run sim — LEVER 4: Knowledge & Teaching (2026-10-11)

Worktree branch: `sim-knowledge` (commits `908b0f6`, `2de49dc` — merge via --ff-only; merged locally, pending ship).
Lever played: **the village experiments** — one small, documented game change.

## The lever (exact change)

**`Game.villagerExperimentBeat(present)`** (src/js/game.js, called from `villageLives()` right after `firesideTeaching`):
- Once per game day, a villager (food-background preferred, slight randomness so
  it's not always the same person) runs the cautious protocol on ONE unknown —
  plurality unknown plant lump in the camp prepStash, else unknown raw meat
  (`edible===false`) in inventory.
- Plant: consumes 2 units; verdict from `p.edibility` (safe/caution/cook/avoid);
  `avoid` costs the tester 10 health ("educationally sick"). Tester learns it
  (`villagerLearnsPlant(tester,pid,'tested')`), verdict lands in
  `village.sharedKnowledge[pid].tested/.testedBy`, rumor seeded. Player learns
  by witnessing: `identifyPlant(pid,'tested',testerName)` — presence-gated.
- Meat: mirrors `testMonsterMeat` honestly, attributed (`foodTestedBy`);
  toxic flesh → poison recorded + item marked + tester hurt 15.
- **Verdicts travel**: `identifyPlant` now carries `sharedKnowledge[pid].tested`
  into every LATER identification through any channel ("The village already
  tested this one — X did the careful tasting. Verdict: …").
- Honest-source fixes (same commit): `identifyPlant(pid,'gratitude',name)` and
  `identifyPlant(pid,'sample',name)` (were passing the villager's display name
  as `source`); `villagerLearnsPlant(vid,trade,'traded')` (source was missing).
  `entry.by` is write-only — behavior-neutral.

Why this blank: baseline showed Steve's experiment-before-identification law was
**real in code, dead in practice** — `testCautiously`/`testMonsterMeat` fired
0 times in 20×200d; `experiments`=0, `testedVerdicts`=0, `monsterFoodSafe`=0
(its only caller was `testMonsterMeat`). Not repeating today's done items
(plant-lesson cadence, agencyTurn honesty, guided-sow).

## Method

- `scripts/sweep-knowledge-lever.js` (new): 20 seeds × 200 days, competent+ask
  policy, seeded mulberry32 before eval, full src/js list minus DOM-only,
  `Game.save` never stubbed. Instruments identify/learn/grant/test channels by
  source; end-state codex by level; village-wide knowledge; mid-run snapshots
  (day 50/100/150); last-120 teaching transcript lines per run.
- BEFORE `/tmp/knowledge-before.json`, AFTER `/tmp/knowledge-after.json`
  (identical seeds 1–20). Proof: `scripts/test-knowledge-lever-20261011.js`
  24/24 ×3 runs.

## Before/after on identical seeds

| Measure | Before | After |
|---|---|---|
| `tested` identifications | 0 | **25** |
| tested verdicts on entries | 0 | **25** |
| monster foodSafe learned | 0 | **25** (`foodSafeBy.tested`) |
| monster poison-known | 0 | 0 (no toxic meat encountered) |
| identify channels (player) | shared 240, sample 73, fireside 30, taught 9, fieldwork 6 | shared 219, sample 89, fireside 30, **tested 25**, taught 3 |
| plant depth L2/L3/L4 (end, 20 runs) | 6 / 3 / 4 | 9 / 5 / 10 |
| mean prepKnown / run | 0.7 | 1.2 |
| teachPlant (player→villager) | 86 | 144 (2nd-order: more known plants to teach) |
| monsters named | 125/161 entries | 151 entries named |
| skills learned | 154 (background 37, stranger 110) | 146 (same mix) |
| villager↔villager transfers | fireside 1615, word-of-mouth 1289 | same channels, same order |
| median survival | 67d | 69d |
| deaths P/V | 151 / 59 | 147 / 61 |
| endReasons | 18 village-lost, 2 survived | 18 village-lost, 2 survived |
| arc reach | all 20 reach arc 3 | all 20 reach arc 3 |
| wave max dist | w1:2 w2:14 w3:4 | w1:2 w2:9 w3:9 |
| counters discovered | 145 | 174 |

**Reading**: the knowledge-channel numbers are the clean signal — the
experiment path went from 0 to alive (25 tested identifications, 25 monster
meats made safe, verdicts traveling). Mission measures are neutral on average
(median 67→69d, deaths ~flat), but per-seed survival swings wildly in both
directions (e.g. seed 3: 67→200d; seed 20: 200→50d; seed 2: 113→22d) — the
early game is a starvation knife-edge and any small change butterflies. The
w3 max-unlock shift (4→9 runs) is scattered across seeds in both directions,
not a systematic lever effect; honest verdict: **mission-neutral, high
butterfly variance**. No wins, no table, scale never leaves village in either
condition (matches the standing scale-on-ramp wall).

## Knowledge trajectory (mean/run, survivors only at late days)

- Day 50: player ~19 plants L1, depth ~0.2; village mean 17.4 known/villager.
- The 200d survivor: 45 plants L1, village mean 41.3, 28 skills. Depth stays
  ~0 throughout — **L2+ is nearly decorative in practice** (13/433 entries
  before, 24/437 after; the lever identifies at L1 by design).
- `animalLevels` end-state: **empty in all 20 runs both conditions** — the
  animal tasting-depth track never engages in sims (documented blank, not
  this lever).

## Reachability verdict (knowledge content)

- Reachable: plant naming (all channels fire), monster naming (125→151),
  monster food safety (**now reachable** — was decoration), human skills
  (background + stranger-jackpots), trees, recipes, techniques, fireside/
  word-of-mouth village teaching, agency expedition lessons (declining).
- Decorative in practice: plant depth L2+ (reachable in code, ~3% of entries
  in 200d), animal codex depth (0 entries in 40 runs), alien-disease
  building-block knowledge (no infections observed), the win flag / table /
  national scale (0/40 — the scale wall, not a knowledge gap).

## Village assessment (plain words)

The village is a real learning organism for *names*: by day 50 the average
villager knows ~17 plants and the rumor mill moves ~140 transfers/run. What it
can't do is *deepen* — villager knowledge is binary (name or not), so the
village teaches breadth while depth stays the player's lonely grind (harvest
the same plant 5+ times, taste it 3+). Before this lever, the village also
couldn't *test*: the cautious protocol existed as a player button nobody
pressed, and the whole monster-meat safety economy hung on it. Now a cook or
forager spends an afternoon with the strange shoots at the fire, sometimes
gets educationally sick, and the village remembers the verdict — the fire
has a new kind of evening.

## Sense-testing findings (read, not counted)

- **New beat lines read well** (all 4 edibility verdicts + both meat outcomes
  exercised in a live scenario): specific descriptors, no true-name leaks
  pre-identification (proven by E2), honest costs ("educationally sick"),
  attributed ("Fiona tells the fire… The Codex notes it"). Fixed one grammar
  bug found by reading ("the a plant" → article strip; mid-sentence name
  decapitalized).
- **Baseline transcript sample shows severe narration repetition**: "Hunger
  gnaws. The pack is thin — work the green, haul it back, get it named at
  camp. That's the whole game." ×15 in a 24-line window; a combat line
  ("FLASH. The world goes white… (Prediction 4/4…)") ×12 verbatim. The
  conversation system has a no-repeat invariant (`convoPick`); narration
  doesn't. Documented blank for a future lever — not this one.
- Teaching lines that fire are specific and honest: "★ IDENTIFIED: Staghorn
  Sumac. Fuzzy red berry cones pointing up like torches. Uses unknown —
  harvest, taste, and learn." The corpse-loot beat even *tells* the player to
  "test it cautiously" — the action was discoverable in copy, just never
  taken. The village doing it closes that loop.
- Generic ambient line "📖 X is talking through something they learned out
  there. Someone's listening." never says WHAT — mild blank vs the specific
  agencyTurn lines. Documented.

## Blanks filled vs documented

- **Filled**: village experimentation (the lever); honest teach sources
  (gratitude/sample/traded); tested-verdict travel.
- **Documented**: animal codex depth never engages in sims; plant L2+ nearly
  unreachable in 200d; narration repetition (no pickFresh for status lines);
  away-from-home experiments (beat is presence-gated by design — the village
  could test while you're gone and broker it at return, like `awayLearned`);
  no `docs/KNOWLEDGE.md` — **registered this run** (brief, factual,
  from code).
- **Cannon gap closed**: `docs/KNOWLEDGE.md` added — stores, depth ladders,
  channels, word-of-mouth rules, Steve's laws, file map.

## Commits (in worktree branch `sim-knowledge`, for --ff-only landing)

1. `908b0f6` [needs-eyes] lever + honest sources + sweep + proof test
   (24/24 ×3). [needs-eyes]: new fire narration + villagers taking small
   damage on bad verdicts — feel-adjacent, Steve may want to see it.
2. `2de49dc` narration grammar fix from sense-reading.
3. (this commit) evidence file `evidence/2026-10-11/sim-knowledge.md` +
   canon registration `docs/KNOWLEDGE.md`.

Tests run: `scripts/test-knowledge-lever-20261011.js` 24/24 (×3, fixed seeds);
sweep 20×200d before + after on identical seeds. No jest suites touched by
this change (game.js only); no concurrent jest run.
