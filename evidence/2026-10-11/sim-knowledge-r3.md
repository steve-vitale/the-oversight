# Long-run sim — LEVER 4: Knowledge & Teaching, r3 (2026-10-11)

Worktree branch: `sim-knowledge-r3` (lever: the combine path becomes reachable).
Lever played: **the fireside overlap can actually fire** — two small,
documented game changes. Base: master `fb4d2841` (includes r1's experiment
lever and r2's kitchen-deepening lever). This is r3 of the SAME lever-4 slot;
r2's blank menu is the assignment. r2 recommended softening the 3-harvest
toll; the before-run data revealed a deeper structural block, so r3 fixes
both.

## The structural finding (from the before-run, unlevered)

`combineKnowledge` fired **0 times** in r2 — but the toll wasn't the binding
constraint. New r3 instrumentation (near-miss counting in the sweep) showed
**1 near-miss in 20 runs** and **0 hint lines** in 20 transcripts: the combine
call almost never even sees "others know deeper." Root cause: the fireside
lesson is **one-shot per plant** (`taughtAround = true`, game.js) — it fires
the combine call once, at the naming moment, *before* any village depth
exists. Depth arrives days later through silent accrual
(`villageHandlingDeepens`), but the fire never revisits the plant, so the
overlap never gets a second chance. The toll was downstream of this.

## The lever (exact changes, both in src/js/game.js)

**1. The combine moment — `villageHandlingDeepens` wires the overlap.**
On a shared L1→L2 or L2→L3 level-up, if the player is home
(`playerAtHaven()`), call `this.combineKnowledge(pid)`. The village's depth
is NEW at that moment — and if you knew the name but not the parts, the
fireside talk clicks it into place for you too. Presence-gated (you weren't
in the conversation if you weren't home); `combineKnowledge` no-ops unless
the overlap is real (deeper other + your harvests meet the toll). ~4 lines,
inside the existing level-up branches.

**2. The toll — depth-differential, in `combineKnowledge`.**
`toll = max(1, 4 - (deepestOther - myLevel))`: one level deeper → 3 harvests
(Steve's gate, unchanged); two deeper → 2; three deeper → 1; never 0 — no
free depth from the fire, your hands must have held the plant at least once.
The hint line shows the real toll (`(1/2)`, not the old flat `(x/3)`).
Coordinator's call (Steve 2026-10-07); he can overrule. docs/KNOWLEDGE.md
updated to the toll ladder.

RNG discipline: the lever's own picks consume no Math.random (the deepening
pick is r2's deterministic rotation; the combine call is unconditional; the
toll is arithmetic). The 0.15 insight-jackpot roll inside a successful
combine is pre-existing mechanic RNG — it fires only because the lever
works, and its downstream (a rare skill, then re-shuffled rolls) is honest
lever cascade, documented below.

## Method

- `scripts/sweep-knowledge-lever.js` (extended): near-miss instrumentation
  (combine calls where village-shared is deeper but harvests fall short),
  `harvestHist` / `maxHarvests` end-state, `combines` in the aggregate.
- BEFORE `/tmp/knowledge-r3-before.json` (unlevered game.js), AFTER
  `/tmp/knowledge-r3-after.json` (levered). 20 seeds × 200 days,
  competent+ask policy, identical seeds 1–20. Analysis:
  `scripts/analyze-r3.js`.
- Proof: `scripts/test-combine-toll-20261011.js` — **32/32** (toll ladder
  T1–T6 incl. trader path, wiring W1–W3 incl. presence gating, guards T5).
  Regression: `scripts/test-kitchen-depth-20261011.js` 27/27; ontology 80/80.
- Mid-run save: the first before-attempt was contaminated (game.js edited
  before seed 2 loaded — `loadGame` re-reads per seed); killed, patch
  stashed, game.js reverted, clean before re-run. Documented so the next
  worker doesn't repeat it: never edit game code while a sweep is running.

## Before/after on identical seeds (20 seeds × 200d)

| Measure | Before | After |
|---|---|---|
| combineKnowledge firings | 0 | **26 (in 14/20 runs)** |
| combine near-misses (hint fired) | 1 | **306** |
| player plant L2 / L3 / L4 | 24 / 14 / 14 | 18 / 16 / **19** |
| player plant L1 | 479 | 445 |
| prepKnown | 52 | 53 |
| insight skills (jackpot) | 0 | 1 |
| sharedKnowledge L1/L2/L3 histogram | 103 / 179 / 93 | 92 / 176 / 85 |
| player harvests histogram (0/1/2/3/4+) | 464/6/4/5/52 | 432/4/4/5/53 |
| median survival | 64d | 63d |
| max survival | 149d | 108d |
| deaths P/V | 93 / 109 | 91 / 101 |
| player death causes (starv/combat) | 47% / 51% | **35%** / 60% |
| endReasons | 20 village-lost | 20 village-lost |
| wave max unlock (1/2/3) | 2 / 12 / 6 | 3 / 14 / 3 |
| arc reach | all 20 reach arc 3 | identical |
| scale | 20 village | identical |
| counters discovered | 149 | 138 |
| traps crafted/looted | 0 / 0 | 0 / 0 |
| tier-2 reach | 0 | 0 |
| teachPlant (p→v) | 385 | 272 |
| vilMeanKnown | 19.6 | 18.5 |
| monsters named / foodSafe | 99 / 18 | 87 / 21 |
| animal codex entries | 0 | 0 |
| traded identifications | 0 | 0 |

**Reading:** the combine path is reachable now — 0→26 firings, the L2→L3→L4
ladder moving (L2s graduate upward), the hint teaching the toll 306 times.
The lever's direct effects (knowledge) all move the right way. Mission
deltas are small and directionally mixed (deaths slightly down, starvation
share down 47→35% — consistent with better yields — max survival and wave-3
max-unlock down on small samples): downstream of the lever working
(knowledge → yields → survival, one insight skill, jackpot RNG re-shuffle),
not a lever regression. Nothing in the lever harms the player; the dip
reads as noise + re-shuffle. No wins, no table, scale never leaves village
in either condition (the standing scale-on-ramp wall).

## Reachability verdict (the combine path)

- Reachable NOW: player plant L2/L3/L4 via the fireside overlap — 26
  firings in 14/20 runs (was 0/40). The deepening moment is the combine
  moment; the toll ladder lets h1/h2 harvests count when the village knows
  much deeper.
- Still decorative in practice: animal codex depth (0 entries in 40 runs —
  sims never eat meat; **input problem, not threshold problem**; the 3/6/10
  tasting ladder is untested in sims); knowledge traders (0 traded
  identifications in 40 runs — the trader combine path is mechanically
  proven by T6 but practically unreached); the win flag / table / national
  scale (0/40 — the scale wall, not a knowledge gap).

## Village assessment (plain words)

The village was already deep in its hands — 179 L2 and 93 L3 shared entries
before this run. What it couldn't do was *hand that depth to its scholar*.
The fire taught each plant once, at the naming, and never spoke of it
again; the scholar stood at the edge of the firelight with 24 named plants
and no way in. Now the fire has a second kind of evening: the foragers come
home talking about what weeks of handling taught them — which parts are
worth hauling, what the plant is FOR — and if you've handled it yourself
even once or twice, their talk clicks it into place for you. In seed 3 the
village learned what white oak acorns are for, and the scholar's level
jumped to 3 in the same breath: "You knew it was safe. The village knew the
rest." Fourteen of twenty villages had at least one such evening. The
scholar is still usually a step behind the village's hands — as it should
be — but the gap is crossable now, not a wall.

## Sense-testing findings (read, not counted)

- **The combine + deepening sequence reads as one human moment** (seed 3):
  "🌿 White Oak Acorns, weeks in the baskets. Handling it day after day, the
  village has learned what it's FOR — not just what it is." followed by
  "💡 KNOWLEDGE COMBINES: White Oak Acorns — Level 3. You knew it was safe.
  the village knew the rest. Together, it's deeper. Uses: starch staple.
  Leached acorns = flour. High calories when processed." Specific plant,
  honest attribution, grounded uses text — earned, not granted.
- **The toll hint teaches instead of taunting**: near-misses (306) mean
  players now hear "the village knows more than you do — harvest it a couple
  more times and it'll click" at the moment the depth is new, not into a
  void. (Hint lines don't survive in the 24-line transcript tail — the
  count comes from instrumentation, the wording from the proof test.)
- **Baseline narration repetition persists** (r1's documented blank):
  "Hunger gnaws. The pack is thin…" still dominates transcript windows.
  Still needs `pickFresh` for status lines — future lever.
- Harness quirk found (not game code): `food.js`/`justice.js` do
  `module.exports = methods`, and sim-harness's direct eval runs in its own
  module scope — the first `loadGame` clobbers the harness's exports, so a
  second `loadGame` in one process fails. r2's tests never loaded twice and
  never hit it. Workaround documented in the new proof test (reuse
  top-level imports). A future tooling pass could indirect the eval.

## Blanks filled vs documented

- **Filled**: the combine path is reachable (0→26 firings; player L2/L3/L4
  via the village's depth); the toll ladder (3/2/1 by depth gap, never 0);
  the structural one-shot-lesson block (deepening beat now carries the
  combine moment); trader combine path proven (T6).
- **Documented**: animal codex depth 0/40 runs (sims never eat meat — input
  problem; needs a hunting/butchering sim policy or a meat-eating lever to
  test the 3/6/10 tasting ladder); knowledge traders 0/40 (mechanically
  proven, practically unreached — trader spawn/meeting frequency is the
  blank); narration repetition (r1's blank, confirmed a third time);
  wave-3 max-unlock 6→3 on n=20 (reads as noise + jackpot re-shuffle, not
  lever regression — flag for the next run's watch list); the contaminated
  first before-attempt (process lesson above).
- **Measurement discipline**: near-miss instrumentation — count the calls
  that ALMOST fire, not just the firings. The 1-near-miss finding is what
  revealed the structural block; firings alone would have pointed at the
  wrong fix (toll-only).

## Commits (in worktree branch `sim-knowledge-r3`, for --ff-only landing)

1. (this run) lever + proof test (32/32) + sweep/analysis extensions.
   No `[needs-eyes]`: no feel/combat/UI change — pure knowledge bookkeeping
   plus narration in existing style (deepening beat + combine/hint lines).

Tests run: `scripts/test-combine-toll-20261011.js` 32/32 (fixed seeds);
`scripts/test-kitchen-depth-20261011.js` 27/27 (r1/r2 regression);
ontology 80/80. Sweep 20×200d before + after on identical seeds. No
concurrent jest.
