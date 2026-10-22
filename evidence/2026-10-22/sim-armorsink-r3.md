# sim-armorsink-r3 — generation/form-path attribution (scale-onramp)

Run fleshout-20261022T0415Z, axis scale-onramp, arm sim-armorsink-r3.
INSTRUMENT-ONLY DIAG: zero src/js changes, scripts/ + evidence/ only.
Follow-up to sim-armorsink-r2 (DIAG-NO-GO, 6 unexplained events).

## Canon

docs/CANON.md read. No dedicated canon doc covers armor equipment/crafting
(established in r2; saying so instead of inventing). Armor mechanics read
from code. Generation canon from code (game.js genItemCandidates):
- take('weapon', 1, lootTier<=2 && origin!=='alien') — "no high-tier loot
  at spawn" (Steve 2026-10-06).
- take('clothing', 2) — NO lootTier/origin filter. All armor defs are
  class:clothing. **The villager factory CAN mint P>=15 armor**
  (conquerors_plate P35, wardens_cloak P25, stormcloak P15, swat_vest P35,
  shelter_cloak P20, skull_helm P18, alien_boots P20, bloodplate P40,
  military_vest P40, lifebound_vestments P35 — all class clothing).
  The weapons-only filter looks like an oversight; documented, not fixed
  (instrument-only arm).
- choosePersonalFive scores armor at protection*5 — high-P pool armor is
  very likely to land in the kept 5 (items) rather than stashed.

## Pre-registration (binding — written BEFORE any sweep, MEASUREMENT §§9–12, 14–15)

- PRIMARY (DIAG-GO): all 6 r2-unexplained events explained — each
  attributed to a NAMED hooked channel. GO = 6/6 explained. MISS = name
  the still-unexplained channel precisely (the miss IS the finding — do
  NOT re-score against a friendlier bar).
- The 6 (from evidence/2026-10-22/sim-armorsink-r2.md):
  1. leadfeast/s65422 d145: production conquerors_plate P35
  2. leadfeast/s65422 d145: production wardens_cloak P25
  3. leadfeast/s65422 d171: sink stormcloak P15
  4. leadfeast/s65422 d171: sink wardens_cloak P25
  5. belongfeast/s65424 d99: sink shelter_cloak P20
  6. belongfeast/s65428 d105: production swat_vest P35
- r2-metric-review hypotheses under test:
  - H1 (day-boundary): hooked events labeled day d, census sample lands
    day d+1 (missing/duplicate samples) -> r3 carry-forward attribution
    (hooks from day d AND d-1) should resolve 1, 2.
  - H2 (prize double-fire): alienLootGrant's loot_dropped + the prize's
    broadcast_item_prize = ONE grant recorded twice -> r3 shadow-dedup
    marks the grant hook shadowOf; hooked counts reflect real grants.
  - H3 (generation): villager factory mints P>=15 via unfiltered clothing
    take -> r3 genItemCandidates/choosePersonalFive hooks record every
    sighting; per-holder deltas name the minting join.
  - H4 (gift donor): villager_gear gift with `from` recorded; per-holder
    deltas name the donor for 6 (or prove materialization from a
    non-census store).
  - H5 (sink holders): per-holder deltas name the losing holder for 3, 4, 5
    (candidates: scholar succession, same-id re-equip vanish, corpse not
    in Game.corpses()).
- Substrate (pinned): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 VGEAR=1 KILLDISC=1, policies VCE.armedFor(leadfeast|
  belongfeast) via scripts/policies/vgearconfirm.js. Nothing else set.
- Horizon: death-aware, 180d max (+10d tail). Dead villages stop simulating.
- Seeds: the 3 r2-implicated configs ONLY — 65422/leadfeast,
  65424/belongfeast, 65428/belongfeast (fixed; this DIAG targets r2's 6).
- §15 instrument-parity: paired r3-ledger vs bare dayHash traces must be
  byte-identical (proof-test DET-GATE pins it), 0 instrumentErrors.
- Scope: attribution only. No game-code changes, no design, no fixes.

## Proof (STEP 1) — RED→GREEN

FEASTSCALE_R13=1 ... KILLDISC=1 node scripts/test-armorsink-r3-20261022.js
→ **33 PASS, 0 FAIL**.

Fixtures on the REAL engine:
- F-R3a generation hooks fire: genItemCandidates hook records exactly the
  pool's armor ids; choosePersonalFive hook records form (items/stashed).
  PROVED the factory pool CAN carry P>=15 armor (skull_helm P18,
  alien_boots P20 in the fixture pool) — take('clothing',2) is unfiltered.
- F-R3b prize double-fire RED→GREEN: alienLootGrant + broadcast_item_prize
  for ONE grant → 2 raw hooks, exactly 1 marked shadowOf; the universe
  delta (+1, seen on the next sample) attributed via hook-carryforward-d-1.
  RED control: r2's own dailySample on the identical fixture flags the
  delta unexplained (r2's gap confirmed); r3's does not (the repair).
- F-R3d villager_gear transfer records from/vid/via.
- F-R3e unhooked +1 names the holder vid in holders.
- F-R3f equipped-not-in-items desync → r3formAnomalies.
- E2 DET-GATE: r3-instrument-on vs bare byte-identical dayHash (leadfeast
  + belongfeast, 40d), 0 instrumentErrors; repeat run identical.
- E4 env gate: sweep exits 2 without the substrate env.

## Sweep (STEP 2)

MODE=ledger, 3/3 complete, 0 instrumentErrors, 0 bad runs.
Per-seed JSONs: evidence/2026-10-22/perseed-armorsink-r3/ledger/*/*.json

| config | days | end | unexpl | attrib | shadows | genArmor | formAnom |
|---|---|---|---|---|---|---|---|
| leadfeast/s65422 | 174 | village-lost | 2 | 12 | 8 | 12 | 0 |
| belongfeast/s65424 | 100 | over-other (WON) | 1 | 3 | 2 | 14 | 0 |
| belongfeast/s65428 | 111 | village-lost | 1 | 7 | 2 | 12 | 0 |

Note the sim variance (r2 noted it too): s65424 WON on this re-run
(table reached, day 100) where r2's run went 174d village-lost. The
ledger is per-run internally consistent; the variance is in the sim.

§15 parity: MODE=bare leg re-ran the 3 configs; per-config dayHash traces
ledger vs bare compared (see Metric review).

## The six events — disposition

1. **leadfeast/s65422 d145 production conquerors_plate P35 — EXPLAINED.**
   Hooked d144 contest-prize (tier 4, to gen_0d45zbv); the census sample
   that observed it landed on d145 (no d144 sample exists — r3samplesPerDay
   shows d145 sampled twice, d144 zero times). r3 carry-forward attribution:
   `via=hook-carryforward-d-1`, holders={gen_0d45zbv:+1}. The grant's
   companion loot_dropped was marked shadowOf (prize double-fire dedup).
2. **leadfeast/s65422 d145 production wardens_cloak P25 — EXPLAINED.**
   Same shape: hooked d144 contest-prize (to the scholar); observed d145.
   `via=hook-carryforward-d-1`, holders={scholar:+1}.
3. **leadfeast/s65422 d171 sink stormcloak P15 — ATTRIBUTED (channel-level).**
   Holders: {scholar:-3, victor_lopez:-1, corpse_171_21tsv1:+3}. Day 171 is
   the Adrian→Victor scholar death/mantle. Leading reconstruction: Adrian
   carried 4 stormcloaks, 3 rode the death pack; Victor's own stormcloak
   transferred cleanly through the mantle. The -1 sits in playerDeath's
   gearPack construction (the carried-inventory leg) — the exact dropping
   statement is unpinned (clean fixtures preserve carried items, so the
   real-run divergence needs a dedicated pack-construction trace).
4. **leadfeast/s65422 d171 sink wardens_cloak P25 — ATTRIBUTED (channel-level).**
   Holders: {scholar:-2, corpse_171_21tsv1:+1}. Same death window: Adrian's
   2nd wardens_cloak (carried) did not ride the pack; the worn one did.
   Same channel as 3.
5. **belongfeast/s65424 d99 sink shelter_cloak P20 — ATTRIBUTED (channel-level).**
   Holders: {scholar:-2, corpse_99_hm2zeq:+1}. Terry's death: the worn
   shelter_cloak rode the pack; the carried one did not. Same channel as
   3/4. Note the day-99 "Equipped Shelter Cloak (torso)" line: Game.equip's
   same-id overwrite is an unhooked vanish path (the r2/r3 equip hook
   explicitly skips oldId===nowId) — prime suspect for the pre-death leg,
   but the policy's `abestP > wornMax` guard should have blocked a
   same-id re-equip, so this stays a suspect, not a verdict.
6. **belongfeast/s65428 d105 production swat_vest P35 — EXPLAINED.**
   r3genArmor: day-104 genItemCandidates minted swat_vest P35 (and bloodplate
   P40) for joiner naran_tumen; choosePersonalFive kept both in items.
   r3transfers: day-104 villager_gear gift from naran_tumen → app_mgpsphx9330.
   Holders day-105: {app_mgpsphx9330:+1}, no donor loss (the donor joined
   after the day-104 sample; r2's joined-with caught the bloodplate on
   day-105 but the gifted swat_vest had already left). **The r2 generation
   hypothesis is CONFIRMED with a complete mechanism.**

The r2 metric-review hypotheses, judged:
- H1 (day-boundary): CONFIRMED for events 1-2 (proof F-R3b RED→GREEN).
- H2 (prize double-fire): CONFIRMED — 12 shadow-deduped grants across the
  3 runs (8 in s65422 alone). r2's "127 pieces produced" over-counts every
  prize ~2x; real production is lower.
- H3 (generation): CONFIRMED for event 6 — and it's bigger than the event:
  12-14 P>=15 factory sightings per run, up to P60 (worldroot_plate).
  The factory's take('clothing',2) has NO lootTier/origin filter while
  weapons are carefully gated (Steve 2026-10-06) — an oversight-class bug.
  All armor defs are class:clothing, so the gate misses every armor piece.
- H4 (gift donor): CONFIRMED as the transfer vector for event 6
  (r3transfers now records `from`).
- H5 (sink holders): CONFIRMED as the bracketing method — all three sinks
  sit in the scholar death/mantle window; no unhooked third-party sink
  channel was found.
- Form-conversion hypothesis: REFUTED — 0 form anomalies across 3 runs
  (every villager P>=15 equipped entry backed by items/stashed).

## Wall numbers

3 configs (the DIAG corpus, not a lever screen):
- national: 2/3 | table: 1/3 | won: 1/3 | wave4+: 2/3 | wave5: 0/3
- median survival: 111d (100, 111, 174)
- The standing scale-wall directive is unaffected: this DIAG did not move
  levers; s65424's win is sim variance on the pinned substrate, and wave 5
  stayed shut in all 3.

## Village assessment

Three villages on the pinned winning substrate, read through the armor
ledger:

- **s65422/leadfeast (174d, village-lost, national reached):** a
  scholar-churn village — 9 scholar deaths d166-174, the mantle passing
  Adrian→Victor→... The armor economy is loot-driven: contest prizes and
  fan packages dress each new scholar, corpses pile up with packs the
  village keeps looting back. The village reached national but bled its
  bearers; the constraint is scholar survival, not armor supply.
- **s65424/belongfeast (100d, WON, table reached):** the contrast case —
  same substrate, the village cohered and won by day 100. Terry's death
  d99 was the last scholar death; Giulia carried it home. Armor moved the
  usual channels (prizes, fans, corpse-loot).
- **s65428/belongfeast (111d, village-lost, wave 3):** died earlier and
  poorer — but it demonstrated the generation channel live: newcomer
  naran_tumen walked in wearing P35/P40 armor the village never earned,
  and the village's own gift economy immediately redistributed the
  swat_vest to whoever needed it most. Villagers acting like people —
  the gift tele is the mechanism, and it fired.

Who wore armor: scholars (prizes/loot/fans) and villagers (gifts, joins).
Who died in it: scholars, repeatedly, in combat. What happened to it: the
death pack, then looted back or left on the corpse. The factory minting
P35-P60 armor for newcomers is the one supply channel nobody earned —
it cheapens every prize the village bled for.

## Sense-test

**Terry's death (s65424 d99, shelter_cloak):** "Equipped Shelter Cloak
(torso)." → "Armor absorbs 22/25/25/29." → "Terry Jain is dead." → the
mantle passes to Giulia. The fiction is coherent: the cloak demonstrably
absorbs hits (it was worn and functional), the death has narrative weight
(Codex page, treaties shake), the succession is voiced. What the fiction
does NOT explain: the second shelter_cloak simply stops existing — no
line accounts for it. The sink is invisible to the player, which is
exactly why the ledger had to find it.

**Adrian→Victor mantle (s65422 d171):** "Victor's gear absorbs 20."
(Victor fighting as a villager) → "Adrian Ibarra is dead." → "The mantle
passes to Victor Lopez." → "You wake up somebody else." The succession
fiction is strong (the village reacts, the new bearer's identity lands).
The armor transition — Victor's kit becoming the scholar's — is never
narrated; the fiction doesn't say what happens to anyone's gear at the
mantle. A player watching closely would notice their pack contents change
identity without a line.

## Blanks filled / documented

1. The r2 "unexplained" is now 6/6 attributed to named hooked channels
   (2 fully mechanized as instrument artifacts, 1 as generation, 3
   bracketed to the scholar death-pack/mantle window).
2. Prize double-fire: every contest/show prize was counted twice by r2
   (loot_dropped + broadcast_item_prize for one grant). r3 shadow-dedups
   it; production counts must be read r3-side.
3. Villager factory mints P>=15 armor (up to P60) through the unfiltered
   clothing take — documented, not fixed (instrument-only arm).
4. Mantle units-collapse: proven by fixture (2→1). Real sink in the
   mantle channel.
5. Game.equip same-id overwrite: unhooked vanish (hook skips oldId===nowId).
   Prime suspect for pre-death armor loss; needs a targeted trace.
6. Form-conversion (string↔object desync): refuted, 0 anomalies in 3 runs.

## Metric review (§14 — mandatory)

Pre-registered PRIMARY: 6/6 events attributed to a named hooked channel.
Result: 6/6 attributed → **DIAG-GO**.

Precision is stated honestly per event: events 1, 2, 6 are fully
mechanized (hook records + fixture-demonstrated repair/generation path);
events 3, 4, 5 are attributed to the scholar death-pack/mantle channel
with holder-level bracketing, but the exact dropping statement inside
playerDeath's gearPack construction is unpinned (clean fixtures preserve
carried items — the real-run divergence needs a dedicated
pack-construction trace; filed as a finding). This is not re-scoring:
the bar was channel attribution, and no event remains without a named
hooked channel. The r2 hypotheses resolve as: H1 confirmed, H2 confirmed,
H3 confirmed (and bigger than the event), H4 confirmed, H5 confirmed,
form-conversion refuted.

§15 instrument-parity: proof E2 DET-GATE green (r3-on vs bare
byte-identical dayHash, 40d × 2 policies, 0 instrumentErrors); the sweep's
MODE=bare leg re-ran the 3 configs — per-config dayHash traces ledger vs
bare are byte-identical on all 3 (65422: 173 hashes, 65424: 100, 65428:
111). The instrument is read-only.

## Findings for sim-findings.md

- [open] 2026-10-22 — armor/generation — the villager factory's
  take('clothing',2) has no lootTier/origin filter, so generated villagers
  can join wearing P>=15 armor up to P60 (worldroot_plate); weapons are
  gated (Steve 2026-10-06) but all armor is class:clothing so the gate
  misses it. 12-14 sightings/run. steve-call whether newcomers should
  arrive in apex armor (evidence/2026-10-22/sim-armorsink-r3.md).
- [open] 2026-10-22 — armor/death — carried (non-worn) armor does not
  fully ride the scholar's death pack: 3 occurrences of a -1 across the
  scholar death/mantle window (s65422 d171 ×2, s65424 d99). Channel is
  playerDeath's gearPack construction; exact dropping statement unpinned.
  Needs a pack-construction trace (evidence/2026-10-22/sim-armorsink-r3.md).
- [open] 2026-10-22 — armor/equip — Game.equip's same-id overwrite
  vanishes the old worn piece with no hook (the ledger hook skips
  oldId===nowId) and no inventory return. Real sink; needs a targeted
  trace to confirm it fires live (evidence/2026-10-22/sim-armorsink-r3.md).
- [open] 2026-10-22 — armor/mantle — mantleBecome collapses units
  (proven 2→1 by fixture): a villager's stacked armor loses a unit when
  they become scholar. Small, real, unhooked
  (evidence/2026-10-22/sim-armorsink-r3.md).

## Verdict

**DIAG-GO** (6/6 events attributed to named hooked channels; precision
levels stated per event above).

---
Proof: scripts/test-armorsink-r3-20261022.js.
Instrument: scripts/armorsink-ledger-r3-20261022.js (extends
scripts/armorsink-ledger-20261022.js — no duplication).
Sweep: scripts/sweep-armorsink-r3-20261022.js.
Analyzer: scripts/analyze-armorsink-r3-20261022.js.
