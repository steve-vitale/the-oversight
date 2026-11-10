# sim-spawncensus-a — per-kind spawn census, FIRST NUMBERS (coverage program Tier 1 #5)

- Run: `fleshout-20261110T1815Z`, Loop A, arm `sim-spawncensus-a`,
  worktree `~/workspace/worktrees/sim-spawncensus-a`, branch `sim-spawncensus-a`.
- Base: master `e5c19e54e` (+ prereg `a00da159a`, analyzer `e298d29d`,
  analyzer extension + DIAG script `8daf867a`).
- Band: **170201–170208** (8 seeds), horizon **150d death-aware**,
  policy `scripts/policies/competent` verbatim, driver
  `scripts/encounterprod-driver-20261105.js` (`RUN=spawncensus-a`,
  `POLICY=baseline`), instrument
  `scripts/encounterprod-instrument-20261105.js` (reused, not rewritten).
- Prereg: `evidence/2026-11-10/sim-spawncensus-a-prereg.md` (committed
  before any judged sim run). Analyzer:
  `scripts/spawncensus-analyze-20261110.js` (new; pure function over the
  per-seed JSONs). Proof: `scripts/test-spawncensus-a.js` — 7 checks green
  (roster 72 kinds with the audited wave split; reproduces encounterprod-b
  seed 99141 exactly: 49 spawns W1 19 / W2 10 / W3 14 / W4 6 / W5 0;
  deterministic; W5 kills separated; faced-instances/conjured split).
- Corpus: `evidence/2026-11-10/perseed-spawncensus-a/` (8 files).
  Full census table: `evidence/2026-11-10/spawncensus-a-table.md` (72 rows).

## Verdict: GO on census completeness

All five pre-registered GO conditions hold:

1. Instrument ran to completion on 8/8 seeds (8 per-seed JSONs, all sections
   present — spawns, casts, fights, daily, waveKillLog, wavesFaced).
2. **0 instrument errors** on all 8 seeds.
3. **Census completeness**: all 72 roster kinds have a row (spawn/kill/
   faced counts, possibly 0) with an explicit pool note (`wild` /
   `campaignOnly` / `titan-omen`). No wave/kind cell is silently absent.
   Zero unknown ids in the corpus.
4. **W5 kills separated**: 3 W5 kills counted per kind (`editor` 1,
   `finale_crew` 1, `spoiler` 1) out of 25 wave-4+ kills — no longer folded
   into a w4plus aggregate.
5. Reproduction + determinism proven by the test (see above).

W6 DIAG verdict: **COMPLETED** (see §W6 below).

## Headline census numbers (8 seeds, 150d, competent)

| | total |
|---|---:|
| world spawns (`spawnWorldMonster`) | 429 |
| casts (`castMonster` selections) | 144 |
| fight rows (`startCombat` + `fieldFight`) | 1,503 |
| kills (`waveKillLog`) | 566 |
| instrument errors | 0 |

Spawns by wave: W1 155, W2 94, W3 79, W4 84, **W5 17**.
Kills by wave: W1 315, W2 168, W3 58, W4 22, **W5 3**.
Kinds spawned 62/72 · faced 65/72 · killed 61/72.

Per-seed wall numbers: **national 0/8, table 0, wins 0**; W4 unlocked
8/8, W5 unlocked 3/8 (170202, 170204, 170207); median survival **137d**
(62–150); 4/8 villages lost, 3/8 survived to day 150; scale `regional`
on all 8 seeds. Three seeds sit at standing exactly **199** — held one
point below the W5 bar (t5 = 200) by the readiness gate
(170201, 170205, 170208). The scale wall stands: the villages reach
regional and wave 5, but none reaches national.

## The census table (summary — full 72-row table attached)

Spawn / faced / killed per wave (kinds with ≥1):

| wave | kinds | spawned | faced | killed |
|---:|---:|---:|---:|---:|
| W1 (25) | 25 | 22 | 25 | 25 |
| W2 (15) | 15 | 14 | 15 | 15 |
| W3 (9) | 9 | 9 | 9 | 8 |
| W4 (10) | 10 | 10 | 10 | 10 |
| W5 (10) | 10 | 7 | 6 | 3 |
| W6 (3) | 3 | 0 | 0 | 0 |

## Blind spots — kinds never spawned / faced / killed

**Never spawned in the wild (10):** `bulldozer`, `sanjun`, `sunbasker`
(W1), `warranty_caller` (W2), `finale`, `finale_opening`, `timeslot`
(W5), `network_heart`, `network_limb`, `network_tower` (W6).

- The W5/W6 zeros are expected by construction: `finale` (titan-omen)
  and `finale_opening` (campaignOnly) arrive only via the Finale
  campaign; the three W6 kinds only via the Network march (see §W6).
  `timeslot` (W5, wild pool) spawning 0 times in 17 W5 spawns is
  sampling — it is not excluded from the pool.
- The W1/W2 four are the real surprise — and they are **not** blind
  spots in play, they are a **different spawn path** (see next section):
  `bulldozer` faced 15× / killed 5×, `sanjun` faced 20× / killed 12×,
  `sunbasker` faced 16× / killed 6×, `warranty_caller` faced 16× /
  killed 6× — all with zero `spawnWorldMonster` calls and zero casts.

**Never faced (7):** `finale`, `finale_opening`, `network_note`,
`nielsen` (W5), plus the 3 W6 kinds. `network_note` spawned once (d127)
and was never met; `nielsen` spawned once (d140, on seed 170205, which
had only unlocked W4 — a titan-omen spawn, not a wave-pool spawn) and
was never met.

**Never killed (11):** `gavel` (W3), `cancellation`, `finale`,
`finale_opening`, `network_note`, `nielsen`, `rerun`, `timeslot` (W5),
plus the 3 W6 kinds. `gavel` is the standout: spawned 2×, faced 11×
on 6 seeds, killed **0×** — the only W3 kind never killed. W5 kills
exist at all only as `editor` (d113 seed 170202), `finale_crew`,
`spoiler` (1 each).

## The big finding: half the fights are conjured, not spawned

**791 of 1,503 fight rows (53%) have no spawned world instance**
(`seq` null — the fight's monster object was never registered by the
`spawnWorldMonster` wrapper). Breakdown by channel/class:

| conjured fight source | rows |
|---|---:|
| villager field fights, class `other` (agency expeditions) | 646 |
| arena contests (`field/contest` 47 + `player-tb/contest` 16) | 63 |
| player TB fights, class `world` (wanderer casts fought direct) | 68 |
| feast fights | 11 |
| trap fights | 3 |

Verified in code: `villager-agency.js:434` calls
`fieldFight(vid, m, null, …)` — the villager seeks a monster by def and
fights it with **no world instance**; `contestEngine.js:383,624,653`
passes `m = null` for arena beasts; the wanderer path
(`game.js:24576`) casts then fights without placing. So "all monsters
spawn" was the wrong frame: **the wild pool is only one of three ways a
kind reaches a fight** (world placement, agency conjuring, arena
conjuring). The census's `spawned` column counts world placements only;
`faced`/`killed` cover all three paths. The four never-spawned W1/W2
kinds live entirely on the conjured path — villagers hunt them by name
without them ever walking the map.

**Herald re-fight spam.** `herald` was spawned 7× but fought **261×**
(256 player-TB calls + 5 field fights) against only **6 distinct
spawned instances** — seed 170202 alone re-fought one herald instance
158 times, several calls per day (d70 ×3, d71 ×3…). The scholar keeps
re-encountering the same omen monster on its tile. Whether each
`startCombat` call runs a full fight is **unmeasured**: all 448
player-TB rows carry outcome `null` (the instrument reads
`ret.outcome`, which `startCombat` never sets — TB outcomes settle
later via `tbEnd`). Field fights all carry outcomes (vKill 490, evade
385, vFlee 125, mFlee 46, vDie 9). The re-encounter pattern itself is
real; its cost in fight-rounds is an open question (appended to
sim-findings).

**Spawn distribution is lumpy.** W1: `hushwolf` 38 spawns (24 of them
source `other` — the Quiet Woods ×3 event), `hummice` 14,
`gallowdeer` 13, down to 1 each for `ducks_in_a_row`, `dustboar`,
`speedbump_turtle`, `sunback`. W4: `eulogy` 19 spawns vs `strike` 3.
W5's 17 spawns: `editor` 6, `cancellation` 4, `finale_crew` 3,
`rerun` 1, `spoiler` 1, `network_note` 1, `nielsen` 1. First W5 spawn
was d101 (`editor`); first W5 faced d91 (`spoiler` — faced in a
conjured fight **before** any spoiler ever spawned, d149).

**Deed-feed mismatch (open question, not chased).** The finalize
`wavesFaced` deed feed and the fight rows disagree: `herald` is absent
from `wavesFaced` on 6/8 seeds despite 261 fight rows (present only on
the two seeds where a herald was killed); `gavel` is absent on 3 seeds
where it was faced; and `ad_sponsor` (the Ad Break's 40-HP sponsor
add — **not a roster kind**) appears in `wavesFaced` on 2 seeds with
no fight row at all. The deed gate reads `wavesFaced`, so whatever
rule drops fought kinds from it is load-bearing for the endgame bar.
Appended to sim-findings.

## What the village looked like

Eight competent villages, 150 days max. Every village unlocked wave 4;
three reached wave 5. Villages that pushed toward standing 200+ either
died on the way (170201 at d135, 170204 at d139) or sat held at 199 by
the readiness gate. The strongest village (170202, standing 455,
survived) is the only one with W5 kills — and only 3, one per kind.
Wave-4 kills totaled 22 across the band (most on any seed: 7). The
villages fight constantly — 1,503 fight rows, 566 kills — but the
killing is overwhelmingly low-wave: 483 of 566 kills are W1/W2. The
world is full of monsters the village meets (65/72 kinds faced) and
the village kills most of what it meets at low waves (61/72 kinds
killed) — the wall is not "monsters never arrive", it is "the village
cannot convert arrivals into high-wave kills and standing."

## W6 DIAG — COMPLETED (march reached via debug scenario)

Organic reach: **not reached** on the 150d band, as expected. Gate
verified in code: `src/js/overtime.js:111` summons only when
`networkKeyReady()` — Overtime tier ≥ `the_network.keyTier` (3,
`src/data/titans.json`) AND herald, nielsen, finale all slain. Before
the scenario the DIAG measured tier **0** and `networkKeyReady() =
false` — the band's villages are nowhere near the gate (no titan
slain on any seed; highest standing 455 with no table run).

Scenario run (`scripts/spawncensus-w6diag-20261110.js`, seed 170299,
`Game.debugScenario('network')`, corpus
`evidence/2026-11-10/spawncensus-a-w6diag.json`):

- Scenario OK; campaign `{summoned: true, started: true, idx: 0}`.
- **9 pieces placed, spawns recorded exactly as the march design
  says: `network_tower` ×4, `network_limb` ×4, `network_heart` ×1.**
- Muster ready (20 blades); first node THE NORTHWEST MAST
  (`network_tower`).
- **Node-1 fight ENTERED**: "⚔ NETWORK MAST! … 🛡️ 20 allies join you
  on the field. 📡 THE NORTHWEST MAST — node 1 of 9." The fight was
  fled ("You escape… 💀 THE NORTHWEST MAST holds. The coalition falls
  back in good order — the dead stay dead. (20 blades. Re-face it when
  ready.)") — a faced W6 kind, recorded as 1 fight row
  (`network_tower`, wave 6). 0 instrument errors.
- Instrument note: the W6 fight row carries `seq: null` (the
  `startCombat` tile lookup did not link the tower to its spawn
  record), so the analyzer's `facedInstances` for W6 reads 0 even
  though the fight happened — the faced verdict for W6 rests on the
  `tbfight` flag + SAY lines, not on the seq link.

**DIAG conclusion:** W6 kinds spawn and can be faced once the march is
reached — the machinery works. Organically they are unreachable from a
150d competent run because the summon gate (Overtime tier 3 + three
slain titans) sits behind content no sim village has ever reached.
First W6 spawn/kill/faced numbers in organic play remain unmeasured
(they need a run that slays three titans first).

## Audit §6 answer (recorded in the prereg, confirmed by this run)

`monsterKills` records carry no mid/wave — `state.codex.monsterKills`
was never written; only scalars exist. Per-kind kills for **all**
waves come from `waveKillLog` (`{d, mid, w, by, via, trick}`, capped
1000, deduped) — this census is built on it, including W1/W2 per-kind
kills (315 / 168) that no earlier analyzer ever tabulated.

## Metric review

- The completeness bar measured the right thing: every roster kind got
  a row, and the rows exposed two real distinctions the prereg did not
  foresee — (a) spawned vs conjured fights (53% conjured), which the
  `facedInstances`/`conjuredFaced` columns now capture; (b) the deed
  feed disagreeing with the fight rows.
- The 150d horizon was right for W4/W5 arrival (W5 spawned on 3/8
  seeds, first d101) but too short for W5 kills to accumulate (3 total)
  and far too short for W6 organically. A next census wanting W5 kill
  rates needs a longer horizon or a stronger policy (capable), not
  more seeds at 150d competent.
- The instrument's blind spots, stated plainly: player-TB fights carry
  no outcome (TB settlement is out of the wrapper's view); arena
  spawns are not placements (out of scope by design); `ad_sponsor`
  is faced through the deed feed with no fight row (non-roster add).
- Canon note: `docs/MONSTER-WAVES.md` roster counts (W1 15 / W4 9 /
  W5 8) are stale vs `src/data/monsters.json` (W1 25 / W4 10 / W5 10);
  the census roster was derived from the data file. The canon doc
  also lists 9 wave-4 monsters by name while the data holds 10
  (`herald` is the tenth — it is a titan-omen kind, not a wild-pool
  kind, which the doc's count obscures).

## Files

- Prereg: `evidence/2026-11-10/sim-spawncensus-a-prereg.md`
- Evidence (this file): `evidence/2026-11-10/sim-spawncensus-a.md`
- Corpus: `evidence/2026-11-10/perseed-spawncensus-a/` (8 files)
- Full table: `evidence/2026-11-10/spawncensus-a-table.md`
- W6 DIAG corpus: `evidence/2026-11-10/spawncensus-a-w6diag.json`
- Analyzer: `scripts/spawncensus-analyze-20261110.js`
- Proof: `scripts/test-spawncensus-a.js` (7 checks green)
- W6 DIAG: `scripts/spawncensus-w6diag-20261110.js`

## Convergence / blank filled

Coverage audit §5 gap #5 is now **measured, first numbers**: the
per-kind spawn census exists (62/72 kinds spawned in the wild on a
fresh band; W5 kills separated from W4; W6 faced once via the march
scenario). What it documents as still blank: W5 kill rates (n=3),
timeslot's wild spawn (0 in 17 W5 spawns), gavel's zero kills, the
herald re-fight cost, and the deed-feed recording rule.
