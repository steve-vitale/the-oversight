# Scale-wall r17 arm 1 — scholar-death attribution (player-kind death records)

Run: fleshout-20261013T2015Z-r17 (arm 1: scholar-death attribution, game-code + tooling).
Worktree: ~/workspace/worktrees/scale-deathattr. Axis: scale-onramp (blocking).
Canon: docs/CANON.md read first (no canon doc covers death telemetry — the
death system itself is canon in corpses.js's header; nothing invented).

## The open blank (from r16)

37 scholar successions across 8 wall-suite runs had ZERO attributable death
causes. Audit found: `playerDeath(cause)` (ledger.js) already called
`registerDeath({kind:'villager', ...})`, so the tele 'death' record existed —
but kind 'villager' is shared with every villager death, so the sampler could
not distinguish a scholar death from a villager death. No player-kind keys;
the bearerDeaths villagerId-change counter can't attribute cause.

## Pre-registration

- Mechanism: mark the scholar's death at the single choke point —
  ledger.js `playerDeath()` adds `player: true` to its registerDeath opts;
  corpses.js `registerDeath` passes `player: !!opts.player` ONLY into the
  `tele('death', ...)` record (telemetry-only side channel). kind stays
  'villager': every corpse/grief/gossip/funeral/audio gate keys on kind and
  behaves exactly as before. All 11 playerDeath call sites (combat, contest,
  expedition, pit trap, starvation, hunt, injuries, arena, phoenix ×3,
  trembles/lockjaw) funnel through this choke point — audited, no bypasses.
- Primary metric: attribution coverage = player-kind death records /
  bearer-change successions, over the wall suite.
- GO: >= 90% attributable AND byte-identical gameplay outcomes on identical
  seeds before/after (telemetry deltas allowed, nothing else).
- KILL: coverage < 90%, or any gameplay delta beyond the new player-kind keys.
- Suite: seeds 11/22/33/44/55/66/77/88 × competent/winseek, 150d death-aware,
  gates unset. fullTelemetry: true (a 150d run emits ~1000 tele events; the
  300-event ring cap would evict early death records and silently break
  attribution — tele() is gameplay-inert, so this is measurement-only).
- Driver: scripts/sweep-deathattr-r17-20261013.js. Proof:
  scripts/test-deathattr-20261013.js.

## Step 1 — audit: does the player flag change gameplay?

registerDeath side effects with `player: true` in opts (kind unchanged):
1. Double-death guard: keyed on opts.villagerId — flag not consulted. No change.
2. audioEvent('villagerDeath'): gated on kind person/villager — unchanged.
3. tele('death'): new `player` field in the data payload — telemetry only.
4. Corpse record: flag NOT stored on the corpse (telemetry-only by design).
5. partyDeathNotify / codexDeathSync / gossip / grief / first-grave: key on
   kind/witnesses/villagerId — flag not consulted. No change.
6. codex-people.js registerDeath wrap: passes opts through, checks
   `opts.villagerId !== this.villagerId` — at playerDeath time this.villagerId
   is still the dead scholar's id, so the bearer's book stays open as designed.
7. RNG: no new Math.random() calls; tele() reads state, writes the telemetry
   array only. No gameplay RNG consumed or reordered.

Verdict: the only new observable is the tele record's `player` field.
Telemetry-only side channel, as the brief allows.

## Step 2 — proof test (scripts/test-deathattr-20261013.js)

16/16 pass:
- Mechanism: direct `Game.playerDeath('combat')` emits exactly one tele
  'death' record: `{day, kind:'villager', who:<dead scholar>, cause:'combat',
  player:true}`. kind stays 'villager' (gameplay-identical gates); the corpse
  carries NO 'player' field (telemetry-only, nothing leaks into game state);
  the mantle passes (new bearer chosen).
- Villager death (`registerDeath` without the flag): player flag falsy.
- Determinism: identical seeds → identical days/endReason/death counts and
  byte-identical death records across two runs.
- Sense sample (seed 777, 60d): villager deaths read honestly — 'sickness',
  'a wound that wouldn\'t close', 'monster', 'lockjaw', 'combat' with
  sensible days. No 'the wild' fallbacks seen.

## Step 3 — before/after wall suite (identical seeds)

### BEFORE (pristine game code, tip 2bbae87b)

16 runs (8 seeds × competent/winseek, 150d death-aware, gates unset,
fullTelemetry): national **0/16** · table 0/16 · wins 0/16 · wave 3 ·
median **63d** / max 150d · exiled 0 · bearerDeaths **44** · playerDeaths 0
(attribution 0 — the r16 gap reproduced).

### AFTER (player-kind wiring)

national **0/16** · table 0/16 · wins 0/16 · wave 3 · median **63d** /
max 150d · exiled 0 · bearerDeaths **44** · playerDeaths **57** ·
attribution coverage **1.295** (records are a superset of hook-observed
successions — see Step 4).

### Gameplay-identity diff (before vs after)

`scripts/diff-deathattr-before-after.js`: ALL GAMEPLAY-IDENTICAL. Same run
set; every per-run gameplay field (days, gameDays, endReason, won,
waveReach, maxArc, maxRank, national, table, vests, exiled, bearerDeaths)
byte-identical; death totals conserved; rekey conservation holds per run.
The ONLY delta, suite-wide:

| before key | n | after: villager | after: player |
|---|---|---|---|
| villager:combat | 44 | 0 | player:combat 44 |
| villager:contest | 6 | 1 | player:contest 5 |
| villager:starvation | 18 | 11 | player:starvation 7 |
| villager:the expedition | 1 | 0 | player:the expedition 1 |

Every other death key byte-identical (monster:combat 92, monster:villager
combat 57, villager:monster 49, etc.). Notably: ALL 44 'villager:combat'
deaths in the before run were scholar deaths hiding in the villager bucket.

## Step 4 — attribution coverage (the GO metric)

- 57 player-kind death records, 44 hook-observed successions → coverage
  1.295 ≥ 0.90. **GO.**
- Zero duplicate `who` across all runs: every record is a distinct dead
  scholar — no double-counting.
- Zero runs where records < hook changes: every observed succession has ≥1
  attributed record. No unattributed successions remain.
- Why records > changes: 11 runs have same-day multiple scholar deaths
  (e.g. winseek s11: day 9 two scholars die, day 22 two, day 33 two — the
  successor walks into the same lost fight and dies too). The once-per-day
  hook counts A→C as one change for two deaths (A→B→C); the records are the
  accurate succession count. The hook was always an approximation — the
  player-kind records are now the better instrument.
- Cause distribution (57): combat 44 · starvation 7 · contest 5 ·
  the expedition 1.

## Step 5 — sense-test (read the death records)

The records read as honest game events, not telemetry artifacts:
- winseek s11 day 9: `gen_dkjljvy` dies 'combat', then `gen_1fo0vsd` dies
  'combat' the same day — a lost fight kills the bearer, the successor
  inherits the same battlefield and dies in it. Grim, legible, correct.
- Causes are specific everywhere: 'combat', 'starvation', 'contest',
  'the expedition'. Zero 'the wild' fallbacks — every playerDeath caller
  passes an honest cause (audited: all 11 call sites).
- Villager-side keys left behind are coherent: villagers die to
  'monster' (49), 'sickness' (15), "a wound that wouldn't close" (17),
  'starvation' (11) — the scholar's old hiding places now read cleanly.

## Wall numbers (this run)

national 0/16 · table 0/16 · wins 0/16 · wave 4–5 unlocks 0 ·
median 63d / max 150d · exiled 0/16 · vests 0 ·
scholar successions: 57 recorded, all 57 attributed (combat 44, starvation 7,
contest 5, expedition 1) · villager deaths by cause now cleanly separated.

## Blanks

FILLED: scholar-death cause telemetry gap (r16 open item) — 0/37
attributable → 57/57 attributable, zero gameplay change (proven
byte-identical on identical seeds). Side finding: the bearerDeaths hook
undercounts same-day successions (44 vs 57 real); player-kind records are
the accurate instrument going forward.
OPEN (appended to sim-findings.md): same-day double scholar deaths — the
successor inherits the lost fight's battlefield and dies in it (winseek s11:
3 such days). Is that the intended succession jeopardy, or should the
mantle grant a repositioning beat? Design question, not a bug.

Convergence: scale-onramp stays the blocking axis. This arm was measurement
infrastructure for the wall, not a wall attack itself — but the wall numbers
are now measured with attributable scholar deaths for the first time.
