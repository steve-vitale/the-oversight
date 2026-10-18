# sim-defercensus2 — wave-4 readiness deferral census refresh on current master (2026-10-18)

Run: flesh-out loop arm sim-defercensus2 (run_id fleshout-20261018T0515Z), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first). ZERO src/js changes,
ZERO scripts/policies changes — read-only diagnostic arm. Instruments + evidence only.

## The question

sim-wave4census (2026-10-17) named the binding bar on the win-side substrate:
veterans fails 100% of deferral days; armor co-binds on 83%. Three game-code
commits landed since (crisistier 9a76cc6e: read-only census; witnesource
3e6b44d1: exposure layer on witness/ledger/truth — no readiness inputs;
fieldfeast kill 95ecbb07: read-only). This arm refreshes the deferral census
on CURRENT master on the pre-seat courtship road (the substrate the standing
wall is measured on): 8 fresh seeds x {leadfeast, belongfeast} = 16 runs,
180d death-aware — and asks WHERE the gate binds NOW, plus which armor
sources feed the deferral margin (direct input for the sim-butcharmor arm's
design space, same run).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Deferral-day method** (reused EXACTLY from scripts/wave4census-lib-20261017.js,
per the arm brief — updated only where the code moved; verified: the gate did
not move): a deferral day mirrors the defer4 hold in
`Game.villageStandingTotal()` (src/js/standing.js): raw Standing >= t4 (=100)
AND !ready AND peak < 4 — the Standing door is open and readiness alone holds
it shut. Binding = intersection of the engine's OWN `short` set
(`Game.waveUnlockReady(4)` -> `waveCombatReadiness(4)`, the four named bars:
armor / weapons / tricks(=counters) / veterans) over all deferral days:
- single bar — present in `short` on ALL deferral days
- `multi:a+b` — 2+ bars co-bind (non-empty intersection, >1)
- `none-single` — deferral days exist, intersection empty (rotating bind)
- `standing` — zero deferral days AND peak < 4 (scale/on-ramp bound, not readiness)
- `unlocked` — peak >= 4 during the run

**PRIMARY (diagnostic GO, binding):** 100% of deferral days attributed to a
single binding-bar label, 0 unattributed runs (an unattributed run = an
instrument-error-voided run or an attribution ERROR — `none-single`,
`standing`, `unlocked` are honest attributions, not failures), with the
fidelity check: re-run 2 runs and confirm the classification reproduces the
same binding bar on the same days — byte-identical day-hash trajectories via
seeded determinism. A miss is NO-GO, never re-scored.

**Bar-share table (report):** veterans-bound / armor-bound / armor+veterans
co-bound / weapons-bound / counters(tricks)-bound / knowledge-bound, plus
medians: max living veterans over the run; armored count at deferral
(demand 4 @ P>=15). NOTE on "knowledge": verified on current code
(src/js/standing.js `waveCombatReadiness`) — the engine's `short` set can
only contain armor/weapons/tricks/veterans (+ read-error/unknown-wave
failure modes). There is NO knowledge readiness bar in the gate (the old
faced-experience bar measured exposure, not capability, and was retired per
docs/MONSTER-WAVES.md design call #4). The knowledge row is therefore 0 by
construction; the knowledge-adjacent signal (counters known) lives in the
tricks/counters bar. Reported, not invented.

**SECONDARY (report-only):** which armor sources feed the P>=15 margin on
deferral days — per-villager piece census (read-only: `S.equipment.armorOf` /
`Game.armorBonus()`, equipped item ids per body slot), each piece labeled by
its verified acquisition channel.

**Substrate (asserted up front):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1; SEATDRIVE/WAVE5REACH/W3DRIVE/VETREL/
VETSHAPE/ALLOWGATE2 unset (asserted at startup). Policies: TF.leadfeast /
TF.belongfeast (scripts/policies/tribfloor base ids, plain — the
presubstrate 9a76cc6e pre-seat courtship composition). Seeds: 8 fresh
(41131, 41142, 41153, 41164, 41175, 41186, 41197, 41208 — verified unused in
evidence/). Horizon: 180d death-aware (dead villages stop, +10d tail).

**Instrument (read-only):** once per day — `Game.villageStanding()`,
`Game.waveUnlockReady(4)`, `state._standingPeakWave` (the lib's
sampleReadiness), plus on deferral days only the armor-margin piece census,
plus wall-number rising edges (`unlockedWave()`, `scaleRank()`,
`progState().tableWaiting`). Zero writes, zero RNG draws. The det-gate proves
byte-identical day-hash trajectories instrumented vs bare (in-process pairs,
both-repeat, 4 seeds); any divergence = STOP.

## Armor-source channel map (verified on current master, 2026-10-18)

| channel | items | code path |
|---|---|---|
| gen (trophy spawns) | ANY clothing-class armor incl. lootTier-3/4: bloodplate, worldroot_plate, second_skin_suit, stormcloak, conquerors_plate, ... + mundane clothing | game.js `take('clothing', 2)` in villager gen — UNFILTERED (the lootTier filter applies to weapons and the wild-card only). Villagers can spawn wearing jackpot armor. |
| gen (wild-card) | riot_gear (P30), military_vest (P40), swat_vest (P35), leather_jacket (P15) — no lootTier, pass the `(lootTier\|\|1)<=2` filter | game.js:1858 |
| craft (butchering-fed) | bark_armor (P10), padded_cloth (P5), hide_armor (P20; 2 hides + vine — hides from butchering) | src/data/recipes.json; corpses.js hide handling |
| salvage | alien_helm (P25), alien_carapace (P40), alien_greaves (P25), alien_gauntlets (P20), alien_boots (P20) | alienPlayers.js apOnCombatEnd: kill an alien player, 60% strip armor |
| godpath | bloodplate, commanders_coat, farstrider_boots, lifebound_vestments, worldroot_plate | godpaths.json capstoneItems (also gen-reachable — labeled godpath\|gen) |
| loot (monster) | NONE — rollAlienLoot draws origin==='alien' items; verified 0 armor in that pool | game.js:40705 |
| prize (contest) | NONE — same alien pool via rollAlienLoot | contests.js:5167 |

Note: `findable:true` on items.json is comment-only in src/js (no reader) — the
lootTier/findable armor items' ONLY grant path is the gen clothing jackpot
(or godpath capstones). Monster loot and contest prizes do NOT feed armor on
current master.

## Results

**PRIMARY: GO — 16/16 runs attributed (100%), 0 instrument errors, 0
unattributed.** Per-seed JSONs: evidence/2026-10-18/perseed-defercensus2/
(16 files, daily readiness snapshots + deferral-day armor-margin censuses;
deferArmor day counts match deferral-day counts exactly, 1529/1529).

### Binding-bar counts

| binding | n/16 | reading |
|---|---|---|
| veterans (single) | 6 | the veteran bar alone never clears |
| multi:armor+veterans | 10 | armor + veterans co-bind |
| armor (single) | 0 | — |
| weapons (single) | 0 | — |
| counters/tricks (single) | 0 | — |
| knowledge | 0 | no engine bar — verified absent in waveCombatReadiness (see pre-reg note) |
| none-single / standing / unlocked | 0 | every run reached the Standing door and deferred on readiness |

**Veterans is in the binding set on 16/16 runs (100%). Weapons bind on 0.
Tricks/counters bind on 0.**

### Deferral-day anatomy (1,529 deferral days across all 16 runs)

| bar | days in `short` | share of deferral days |
|---|---|---|
| veterans | 1,529 | **100.0%** — fails every single deferral day |
| armor | 1,383 | 90.5% |
| weapons | 246 | 16.1% |
| tricks (counters) | 0 | 0.0% |

### Distance-to-threshold (max value / demand over the run)

| bar | demand | median max | range | verdict |
|---|---|---|---|---|
| veterans | 2 | **1** | 0..1 | **never reaches 2 on any of 16 runs** |
| armor | 4 (P>=15) | 3 | 2..5 | reachable but fragile — median below bar |
| weapons | 5 | ~8-11 | — | non-binding (fails only 16% of deferral days, always alongside veterans) |
| tricks | 3 | 15-25 | — | satisfied many times over — non-binding |

**The answer replicates sim-wave4census on fresh seeds and current master:
VETERANS binds.** It is the only bar that fails on 100% of deferral days and
never reaches its demand on any run. Armor is the secondary co-binder (fails
90.5% of deferral days; median 2-3 armored at deferral vs demand 4).
Weapons and counters are structurally non-binding.

### SECONDARY — which armor sources feed the margin

9,148 margin piece-days (qualifying villagers, P>=15, on deferral days):

| channel | pieces | share | reading |
|---|---|---|---|
| gen-mundane | 4,795 | 52.4% | junk-patchwork: good_boots, work_gloves, canvas_pants, knit_cap, keepsakes-as-armor (notebook, daughters_drawing, dog_tags — P=1-2 each, stacked) |
| gen-jackpot (lootTier>=3 via clothing jackpot) | 1,875 | 20.5% | conquerors_plate 273, skull_helm 267, shelter_cloak 236, investigators_coat 227, rage_bindings 212, deep_earth_boots 198, stormcloak 110, ... — the "trophy spawns" |
| salvage (alien players) | 1,300 | 14.2% | alien_helm 358, alien_greaves 356, alien_gauntlets 320, alien_boots 210, alien_carapace 56 |
| craft (butchering-fed) | 826 | 9.0% | bark_armor 407, hide_armor 233, padded_cloth 186 |
| godpath\|gen | 352 | 3.8% | farstrider_boots 212, bloodplate 140 |
| monster-loot / contest-prize | 0 | 0% | no armor in the alien-origin loot pool — verified |

**For sim-butcharmor:** the P>=15 margin is currently fed 73% by gen
(spawn clothing + spawn jackpots), 14% by alien salvage, and only **9% by
butchering-fed crafts**. Monster loot and contest prizes feed ZERO armor.
The margin is junk-patchwork: median armored-at-deferral is 2 (demand 4),
built from stacks of P=1-5 mundane pieces plus coordination. Butchering has
real headroom — it is the smallest live channel, and the two zero-channels
(loot/prize) are design space nobody currently feeds.

### Wall numbers (pre-seat courtship road, current master)

national 12/16 | table invites 14/16 | wave-4 unlocks 0/16 | wave-5 0/16 |
wins 0/16 | village-lost 10/16 | median survival 176.5d.

Every run reached the Standing door (raw >= 100 at some point); the gate
never opened. The scale on-ramp opens the door (national 12/16); readiness
is the lock.

### Fidelity check (pre-registered)

2/2 re-runs reproduced BYTE-IDENTICAL day-hash trajectories
(hashes-identical=true), same binding bar, same deferral-day classification
(defer-classification-identical=true): leadfeast-s41131 and
belongfeast-s41142, both multi:armor+veterans.

## Village assessment (plain words)

The modal pre-seat village: opens the Standing door around day 50-80
(raw 100), grinds the wave-3 overtime for ~100 deferral days with raw
Standing climbing to 300-480 (3-5x the door), learns counters prodigiously
(15-25 known), arms 7-11 fighters — and never unlocks wave 4 because it
cannot keep two killers alive at once (max living veterans 0-1 on every
run) and cannot hold 4 armored fighters (median 2 at deferral, the armor
decaying as fighters die — 58-78 deaths per long run).

Who thrived: the scholars and fighters who learned counters and stood down
wave-3 monsters round after round; villages that reached national (12/16)
and drew table invites (14/16). Who died and why: the kill channel's own —
everyone who lands a wave-3 killing blow dies soon after, which is why the
veteran count never compounds; and the armed/armored roster bleeds to the
overtime meatgrinder (belongfeast-s41142 lost weapons-bar standing on day
181 as its fighters died — short=armor+weapons+veterans).

What was missing: a second living killer, and armor depth. Not knowledge
(counters 5-8x over), not weapons (satisfied most days). The armor the bar
measures is spawn-jackpot luck and junk stacks — craft (butchering) is 9%
of it.

## The named next

Unchanged from sim-wave4census, sharpened by the source breakdown:
**compose vetrel's companion-veteran channel into the win-side stack** (or
Steve rules on the 2-living-veteran demand, #427). NEW from this arm: the
armor side is not a depth problem the village can craft its way out of —
butchering crafts are 9% of the margin and monster loot / contest prizes
feed ZERO armor by construction. If Steve wants the armor bar to measure
something more durable than spawn luck + junk stacks, sim-butcharmor's L1
has the headroom (and the loot/prize zero-channels are open design space).

## Metric review (§14 — binding, never re-scored)

1. **Knowledge row:** pre-registered as report-only with the code citation;
   verified 0 by construction (no knowledge bar in `waveCombatReadiness` —
   read the current src/js/standing.js, not the old snapshots). Not a miss;
   documented as designed.
2. **"Exactly one bar" vs co-bind labels:** the taxonomy assigns exactly one
   label per run; `multi:armor+veterans` IS one label (the engine's short-set
   intersection). 16/16 labeled, 0 ERROR, 0 instrument-error voids. No
   re-score.
3. **Gate-code currency:** verified before the sweep — crisistier 9a76cc6e
   (read-only), witnesource 3e6b44d1 (exposure.js + ledger/table-witness/
   truth wiring — no readiness inputs: no waveKillLog, no monsterCounters,
   no equipment, no standing changes), fieldfeast kill 95ecbb07 (read-only).
   `waveCombatReadiness`/`waveUnlockReady`/`villageStandingTotal` unchanged
   since the 2026-10-17 census; VETSHAPE unset = pristine living-killers.
4. **Deferral-day coverage:** deferArmor censuses exist for all 1,529
   deferral days (1529/1529) — the margin census never missed a deferral
   day. Census errors: 0.
5. **Det-gate + fidelity:** det-gate 4/4 byte-identical (instrument neutral);
   fidelity 2/2 byte-identical re-runs with identical classification. The
   PRIMARY's determinism clause is proven, not asserted.

## Convergence

**converging.** The diagnostic GO is met on current master with fresh seeds:
100% attribution, fidelity proven, and the binding picture replicates the
2026-10-17 census directionally (veterans 100% of deferral days both times;
armor co-bind 90.5% now vs 83% then). The new contribution is the
armor-source breakdown: the deferral margin is 73% spawn-fed, 14% salvage,
9% butchering-craft, 0% loot/prize — the named input sim-butcharmor asked
for. The axis stays scale-onramp; the next step is compositional (vetrel x
win-side stack) or Steve's #427 ruling, not another census. No game change:
zero src/js changes, zero scripts/policies changes — instruments + evidence
only.

## Sense-testing (SENSE-TESTING LAW)

**1. leadfeast-s41175 (veterans-bound, 127 deferral days, survived).**
The door opened day 55 (raw 100, armor 1/4, veterans 0/2). By day 181: raw
482 — nearly 5x the door — armor 5/4 (the village DID armor up over four
months), veterans still 0/2 (max 1 all run). It went national, drew a table
invite, learned 25 counters, armed 8 fighters — and heard "blood your
fighters (1 of 2 veterans)" for 127 days. The hold fiction names the true
bind; the village's lived experience IS the measured bar. Coherent.

**2. belongfeast-s41142 (multi:armor+veterans, 131 deferral days, survived).**
Never got past armor 2-3/4; on day 181 the short set was
armor+weapons+veterans — the village had bled armed fighters faster than it
replaced them (78 deaths). The gate's fiction ("armor the village (2 of 4
fighters armored); put weapons in hands; blood your fighters") reads as a
siege report, which is what it is. Coherent.

**3. leadfeast-s41153 (died day 57, 3 deferral days).** The door opened and
the village died 3 days later in the wave-3 meatgrinder. The taxonomy
attributes multi:armor+veterans honestly — readiness was the lock for the 3
days it mattered; the scale wall (survival) killed it. No forcing.

Limitation (honest): this instrument did not capture say-beats (kept minimal
for the det-gate); the sense read is from snapshots + the deterministic hold
text, not transcripts. The fiction-beat layer (waveUnlockBeat / hold beats)
was read in code, not observed live.

## Files

- scripts/defcensus-sweep-20261018.js — sweep + SMOKE/DET/FIDELITY modes (this run)
- scripts/defcensus-analyze-20261018.js — analyzer (this run)
- scripts/test-defercensus2-20261018.js — proof: 15/15 GREEN (13 fixtures + SMOKE + DET) (this run)
- evidence/2026-10-18/perseed-defercensus2/ — 16 per-seed JSONs (daily readiness snapshots + deferral-day armor-margin censuses)
- evidence/2026-10-18/sim-defercensus2.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (read-only arm)
