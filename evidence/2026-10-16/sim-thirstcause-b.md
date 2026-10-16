# sim-thirstcause-b — the 'dehydration' vs 'thirst' cause-string split, closed (loop B, 2026-10-16)

**Run:** fleshout-loop-b-20261016T2130Z · sim-findings **#418** (the food-economy/water-measurement blank)
**Date:** 2026-10-16 · worktree `~/workspace/worktrees/sim-thirstcause-b`
**Axis:** food-economy (scale-wall lens)
**Design:** INSTRUMENT-ONLY arm — read-only, zero src/js, zero policy changes. Two deliverables: (1) a verified code-audit verdict on whether 'thirst' and 'dehydration' share one registerDeath pipeline (file:line cited), (2) a 16-run census capturing every distinct water-related cause string so no future water-side instrument misses one.

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** — stated per the canon rule, not invented. All water mechanics referenced (cistern, villageDrinks 2L/day draw, `v.health −5/day`, `registerDeath` cause `'thirst'`, scholar overnight hydration in `src/js/engine/calories.js`) were read from the code as-is. Nothing was changed.

## Lineage

sim-thirstinst2-b (32-run water-death census; instrument keyed on `'thirst'` only; 3 deaths carried `'dehydration'`, 0 carried `'thirst'`; pipeline equivalence never verified) → **this arm: the audit + the definitive census** → closes #418.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **PRIMARY:** (a) instrument attribution of water-death cause strings ≥ 95% — every death whose cause string matches the water classification, tele-captured verbatim from the shared registerDeath pipeline and reconciled against the fallen roll; (b) the pipeline verdict delivered with code citations. **GO = both.**
- **Substrate:** 180d death-aware (+10d tail), single side (census, not comparison), SEATDRIVE=0 explicit, FEASTSCALE_R13=1, policies {leadfeast, belongfeast}.
- **Seeds:** 8 FRESH seeds [3301–3308] (verified absent from all evidence/**/perseed*/ filenames 2026-10-13→16 before sims) × {belongfeast, leadfeast} = 16 runs.
- **Gates before sims:** `scripts/test-thirstcause-20261016.js` — PART A classifier fixtures for every observed string, PART B live-honesty (forced registerDeath captured verbatim), PART C det-gate (instrument-on vs pristine byte-identical), SMOKE green.

## What was built (instrument only — zero src/js, zero policy)

- `scripts/census-thirstcause-20261016.js` — the census sweep: read-only tele-wrap instrument capturing verbatim death records `{day, kind, who, cause, player}` from the registerDeath pipeline, fallen-roll cross-check at run end, full distinct cause-string inventory, wall-number rollup. Lib-guard `THIRSTCAUSE_LIB=1` exports the pure classifier.
- `scripts/test-thirstcause-20261016.js` — the proof (A/B/C + SMOKE).

## The pipeline verdict (the #418 deliverable)

**VERDICT: ONE shared pipeline, TWO cause strings by person-role.**

Every death — villager or scholar, water or otherwise — funnels through `this.registerDeath(opts)` at **`src/js/corpses.js:152`**, which at **`src/js/corpses.js:223`** fires `tele('death', {kind, who, cause: opts.cause || '?', wave, player: !!opts.player})` **verbatim — the pipeline normalizes nothing**. The sampler keys scholar deaths `player:<cause>` (corpses.js comment ~line 210). There is no second pipeline.

The two strings diverge one call frame above the choke point, by WHO dies:

1. **Villagers (empty cistern)** — `src/js/game.js:28349`, inside `villageDrinks()`: `registerDeath({kind:'villager', villagerId: id, ..., cause: 'thirst', killerId: null})`. The cistern can't cover the draw → `v.health[id] −5` → at 0, cause string **`'thirst'`**.
2. **The scholar/bearer (overnight metabolism)** — `src/js/engine/calories.js:125` (the HONEST DEATH CAUSES change, 2026-10-14): `if (!killedBy && scholar.health <= 0) killedBy = 'dehydration'` when the overnight tick zeroes health on empty hydration → `game.js:29041` `const honestCause = (res.killedBy || 'starvation')` → `game.js:29046` `this.playerDeath(honestCause)` → `ledger.js:701` `registerDeath({kind:'villager', villagerId: oldId, ..., cause: cause || 'the wild', ..., player: true})`. The cause string arriving at the shared pipeline is **`'dehydration'`**.

Near-synonym sweep: `'died of thirst'` / `'dying of thirst'` / `'thirsty'` appear nowhere as cause strings — only as display/awayNews text (game.js:28355 `died of thirst` in the say/awayNews string, and `scripts/test-drifter-absence.js` assertions). No third water cause string exists in `src/js/`.

**The verdict future water-side instruments must use: match on BOTH `'thirst'` AND `'dehydration'`** — one filter misses the scholar side (the sim-thirstinst2-b leak class); the other misses every villager water death (the #286 signature class). Split by `player:true` when role attribution matters. There is no normalization to rely on, and no hidden third string.

## Results

### Proof tests (scripts/test-thirstcause-20261016.js)

**32 assertions, all green** (SMOKE=1 fast gate: 30/30; full run: 32/32).

- **PART A (classifier fixtures):** `'thirst'`→WATER-THIRST, `'dehydration'`→WATER-DEHYDRATION, near-synonyms (`'died of thirst'`, `'dying of thirst'`, `'DEHYDRATED'`) classify WATER; a 16-string NON-WATER roster (combat, starvation, sickness, injuries, the night, alien, alien_beam, the wild, the expedition, a wound that wouldn't close, aid-runner, the phoenix link, your own pit trap, threat, exile) stays NON-WATER; null/undefined/''/0 classify NON-WATER without throwing; deterministic across repeat calls.
- **PART B (live-honesty):** forced `registerDeath` with `'thirst'`, `'dehydration'` (player:true), `'combat'` through the REAL pipeline — the instrument captured all 3 records verbatim (cause string + player flag), and the engine's own corpse count was unchanged (3 test corpses — the instrument added none).
- **PART C (det-gate):** 20d run, instrument-on vs pristine — per-day state hashes byte-identical (the instrument is read-only).

### Census (16 runs, 180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0, ~6.5 min)

689 deaths total, **19 distinct cause strings, 19/19 classified — attribution 100% (bar ≥ 95%)**. Full inventory (verbatim, shares, role split):

| cause string | n | share | cls | player | villager |
|---|---|---|---|---|---|
| combat | 395 | 57.33% | NON-WATER | 87 | 308 |
| villager combat | 152 | 22.06% | NON-WATER | 0 | 152 |
| monster | 75 | 10.89% | NON-WATER | 0 | 75 |
| expedition | 29 | 4.21% | NON-WATER | 0 | 29 |
| contest | 11 | 1.60% | NON-WATER | 8 | 3 |
| ambush | 5 | 0.73% | NON-WATER | 0 | 5 |
| Choir Toad | 4 | 0.58% | NON-WATER | 0 | 4 |
| **dehydration** | **3** | **0.44%** | **WATER-DEHYDRATION** | **3** | **0** |
| starvation | 3 | 0.44% | NON-WATER | 2 | 1 |
| a wound that wouldn't close | 3 | 0.44% | NON-WATER | 0 | 3 |
| Big-Eyes | 1 | 0.15% | NON-WATER | 0 | 1 |
| the night | 1 | 0.15% | NON-WATER | 1 | 0 |
| Ugly-Eyes | 1 | 0.15% | NON-WATER | 0 | 1 |
| Buffering | 1 | 0.15% | NON-WATER | 0 | 1 |
| The Redactor | 1 | 0.15% | NON-WATER | 0 | 1 |
| Big Loud | 1 | 0.15% | NON-WATER | 0 | 1 |
| alien | 1 | 0.15% | NON-WATER | 0 | 1 |
| the expedition | 1 | 0.15% | NON-WATER | 1 | 0 |
| The Union Rep | 1 | 0.15% | NON-WATER | 0 | 1 |

Water-related strings observed: **exactly one — `'dehydration'`**, n=3/689 (0.44%), **all player=true (the scholar/bearer), 0 villagers**. No `'thirst'` villager deaths in 16 runs (the cistern economy held — see village assessment); no WATER-OTHER strings; monster-name causes (Choir Toad, Big-Eyes, …) are individual-monster kill attribution, all NON-WATER.

**Reconciliation (the leak check):** tele-captured water deaths = 3, fallen-roll water entries = 3, identity-matched (villagerId@day) = 3. **Zero leaks** — every water death the engine recorded passed through the shared tele pipeline the instrument reads.

## GO verdict

**GO.** Attribution 100% ≥ 95% bar, pipeline verdict delivered with file:line citations, reconciliation leak-free. sim-findings **#418 → closed (fixed)**. The two-line verdict above is the contract for all future water-side instruments.

## Metric review (§14 — mandatory)

- The PRIMARY's attribution denominator was the 19 observed distinct strings — 19/19 = 100% ≥ 95%. Not a re-score: the bar was written before sims and judged as written.
- Zero `'thirst'` deaths is an observed value, not a missing denominator: the villager-side string's classification is proven by fixture (PART A) and by the audit trace (game.js:28349); the census confirms the scholar-side string empirically (3/3 `'dehydration'`, all player=true) and the role-split holds. No metric was widened to "any water string" mid-run.
- The reconciliation was the honest check: a tele wrap could silently miss deaths registered outside the tele path (the #400/#403 class). It missed none.
- 16 runs completed clean; no runtime restart; seeds 3301–3308 were fresh (verified absent from all perseed filenames before sims).
- Per-seed JSON schema: all 16 carry exact numeric `national`/`table`/`wins`/`exiled` keys — verified 0 violations (the recurring schema-drift class).
- No metric was changed mid-run. Nothing in this file was re-scored after the fact.

## Sense-testing (SENSE-TESTING LAW — transcripts read, not just counts)

Sampled the death/funeral beats around all 3 water deaths plus general funeral beats (~30 beats read). The deaths READ as thirst deaths:

- **Telegraphing works.** The spiral is warned before it arrives, per the design rule: days 130–133 (leadfeast-s3303) and 145–148 (belongfeast-s3302) each carry repeated `⚠ DEHYDRATED: find and treat water today.` warnings before the deaths. The bearer <redacted> own risky water and got sick first ("You are wrong in the gut — the creek water. Something churns down there, and it isn't settling. (-5 health. Boil it next time.)") — the death has a legible causal chain, not a counter decrement.
- **The epitaph is honest.** `🕯️ Mai Reed is dead — dehydration. The village stops. Somebody screams. Somebody else starts digging.` — the audit-traced `'dehydration'` string reaches the player-facing funeral beat verbatim, exactly as the 2026-10-14 HONEST DEATH CAUSES change intended (a bearer <redacted> "died of thirst" drinks tomorrow).
- **Grief has consequences.** Each scholar death moves the politics: "With Haven grieving, Stonebridge installs their own speaker at the table. Tribute rises to 25,313 kcal/week. Grief is leverage, and they know it." / "Emberhold watches to see if Haven holds without its dead — and presses the tribute down to 1,688 kcal/week while the chair is empty." Death is social, not mechanical.
- **The village reacts to the cause.** After the d132 dehydration death: "The cistern is dry. Haul from a creek (risky water), or put someone on water duty." → `📋 Danilo — 💧 Fetch water. Danilo nods eagerly.` → `💧 Danilo returns with 13L of creek water.` → "💧 The cistern's recovered — full cups again, and nobody's guarding the dipper." The village learns from the death within a day. That's people, not a counter.
- **Succession holds.** belongfeast-s3302 lost two bearers in two days (Mai Reed d147, Katarina Novak d148) and the village continued to d182. The story is the village's.
- Mild template repetition in early-day water-hauling lines ("The well won't fill itself." ×7 on day 1), but the lines are stranger-descriptor voice by design pre-naming, and they narrate real liters and costs — in-fiction, not robotic.

## Wall numbers (the standing scale-wall report)

- n=16 · national: **14/16** · everTable: **13/16** · won: **0/16** (pre-seat substrate — SEATDRIVE=0 by design; reachability read) · exiled: **0/16**
- wave reach: **wave4 0/16 · wave5 0/16** (this substrate stalls at wave 3 — all 16 runs)
- arc: arc2 16/16 · arc3 16/16 · **arc4 13/16** · fourRealm 0/16
- median survival: **181.0d** · max: **182d** (death-aware: villages died or survived to the 180d horizon)
- starvedDays (village hungry-days counter): 38 across 16 runs
- death-cause shares (689 deaths): combat 57.3% · villager-combat 22.1% · monster 10.9% · expedition 4.2% · contest 1.6% · ambush 0.7% · monster-named 1.7% · **dehydration 0.4% (3, all scholar)** · starvation 0.4% · wound 0.4% · the night 0.1% · alien 0.1%
- water: 0 villager `'thirst'` deaths; cistern never collapsed (rationing beat fired and recovered in the death runs)

## Village assessment (plain words)

The villages in this census are combat villages that mostly win their logistics war and lose to teeth and claws: 689 deaths, 89% of them combat/monster/expedition/contest, and a 181-day median survival with 14/16 reaching national and 13/16 touching the table. Water is a solved-but-real pressure: the cistern held in every run, the one rationing episode (belongfeast-s3302, d147) self-corrected within a day, and the three water deaths were all bearer-level — two back-to-back scholar deaths in one village, one in another — each with a legible causal chain (warnings telegraphed, risky water drunk, sickness, death) and each answered by the village (water duty assigned, 13–17L hauled, cistern recovered). Nobody died a mysterious counter death; the epitaphs say "dehydration" and mean it.

The wave wall here is stark: 0/16 past wave 3 on this substrate (pre-seat courtship, competent feast policy). The food economy is not what's holding them — combat readiness is. That matches the thirstinst2 read ("the next lever should live at combat/monsters, not at the cistern") and is documented, not chased — this arm stays on its axis.

## Blanks filled / documented

- **#418 filled:** the verdict (one pipeline, two role-split strings, match BOTH, split by player:true) + the full verbatim cause-string inventory + a proven-honest read-only instrument (`scripts/census-thirstcause-20261016.js`, 32/32 proof assertions). Future water-side instruments inherit this file's contract.
- **Documented, not chased:** the wave-3 wall on the pre-seat courtship substrate (0/16 wave4+) — combat-side question, outside this arm's axis.
- No src/js touched. Zero game-code changes. No policy changes.

## Convergence state

**converged** — the #418 question is answered with code citations and an empirical inventory; the instrument is proven (det-gate byte-identical, reconciliation leak-free). Nothing further to tune; the verdict is the standing contract.
