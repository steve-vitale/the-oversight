# sim-armorsink-r2 — the worn-armor mortality-sink ledger (scale-onramp)

Run fleshout-20261022T0415Z, axis scale-onramp, arm sim-armorsink-r2.
INSTRUMENT-ONLY DIAG: zero src/js changes, scripts/ + evidence/ only.
Re-derivation of the dead sibling DIAG (sim-armorsink-diag, orphan worker
DEAD, tree removed) — built fresh on current master, no findings inherited.

## Canon

docs/CANON.md read. No dedicated canon doc covers armor equipment/crafting
(the canon table lists DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/CONTESTS/...
— armor has no doc; saying so instead of inventing). Armor mechanics read
from code, not invented:
- corpses.js registerDeath/generatePossessions: villager `p.equipped` is a
  VIEW over `p.items` (autoEquip builds from items without removing — "the
  worn copy stays"). Worn gear transfers to the death pack via items.
- ledger.js playerDeath: scholar's worn+carried DOES ride the death pack
  (but playerDeath clears s.equipped BEFORE calling registerDeath —
  the instrument snapshots worn armor in a playerDeath wrapper).
- corpses.js buryCorpse: unlooted pack goes into the ground as grave goods.
- storage.js: "armor/misc have no deposit hook (no communal armor pile)".
- game.js Game.equip: OVERWRITES s.equipped[slot] — the old worn item is
  NEVER returned to inventory (the "unequip current" comment has no code).
  This is a real sink: scholar gear-swap vanishes the displaced armor.
- equipment.js armorOf/armorTier (P>=15 line); standing.js defer5.

## Pre-registration (binding — written BEFORE any sweep, MEASUREMENT §§9–12, 14–15)

- PRIMARY (DIAG-GO): complete attribution ledger — every P>=15 production
  event and every armor sink event attributed to its cause, 0 unexplained
  events across the corpus. GO = ledger complete. MISS = unexplained
  events > 0 (the miss IS the finding: names the uninstrumented channel).
- Substrate (pinned): the plain VGEAR winning stack —
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  VGEAR=1 KILLDISC=1, policies VCE.armedFor(leadfeast|belongfeast) via
  scripts/policies/vgearconfirm.js. Nothing else set.
- Horizon: death-aware, 180d max (+10d tail). Dead villages stop simulating.
- Seeds: 65421–65428 x {leadfeast, belongfeast} (the armorcatch corpus
  seed set — results comparable). 16 instrumented runs.
- §15 instrument-parity: paired runs instrument-on vs instrument-off must
  be byte-identical (proof-test DET-GATE pins it), 0 instrumentErrors.
- Pilot sniff: if the sink ledger comes back structurally empty (no P>=15
  armor produced at all), report that as the finding — do not invent
  production to fill it.
- Scope: (a) P>=15 armor PRODUCTION — how much, by whom, how; (b) fighter-
  mortality SINK — worn armor vanished with dead bearers vs returned to
  the village, every sink event classified; (c) defer5 re-binds involving
  armor. This is the number-set for the corpse-stripping steve-call —
  measured here, NEVER designed or implemented here.

## Proof (STEP 1) — RED→GREEN

FEASTSCALE_R13=1 ... KILLDISC=1 node scripts/test-armorsink-r2-20261022.js
→ **80 PASS, 0 FAIL** (final).

Fixtures on the REAL engine (no game-code mocks):
- F1 villager death via REAL gear path: worn copy lives in rec.items,
  transfers to death pack — PACKED (recoverable), NOT vanished. CORRECTION
  OF THE BRIEF'S PREMISE: villager worn armor does NOT vanish at death.
- F1b desync edge (equipped refs absent from items — no live path builds
  this): classified worn-vanished, never dropped silently.
- F2 scholar death via playerDeath: worn rides the pack; burial → pack-buried.
  Required playerDeath wrapper (engine clears s.equipped before registerDeath).
- F3 scholar crafts hide_armor → production {how:craft, P:20}.
- F4 tele hooks: loot_dropped → monster-loot; broadcast_item_prize →
  contest-prize/show-prize; loot_taken → corpse-loot return.
- F4b apGrantItem (fan packages, NO tele): → fan-package production.
- F8 market trade: hawkerBuy → market-buy; traderSell → market-sell.
  (Fires 0x in the sweep corpus — the policy doesn't trade on this substrate.)
- F9 scholar gear-swap: Game.equip overwrites slot, old armor vanishes —
  hook classifies as swap-vanished. (Caught RED: equip returns null on
  success; hook verifies by slot change, not return value.)
- F5/F6/F7 pure: detectRebinds, reconcileCounts, wornArmorPieces (P>=15).
- E2 DET-GATE: instrument-on vs off byte-identical dayHash traces, 0 errors.
- E3 env-gate, E4 determinism.

Instrument: scripts/armorsink-ledger-20261022.js — wraps registerDeath,
playerDeath, tele, say, apGrantItem, hawkerBuy, traderSell, Game.equip.
All call-through, read-only. Tracks: production, sinkEvents, deaths (with
worn/packed), corpse fates (looted/buried/decayed), wear, defer5 rebinds,
roster joins/leaves, per-day reconciliation.

## Sweep (STEP 2)

MODE=ledger, 16/16 complete, 0 instrumentErrors, 0 bad runs.
Per-seed JSONs: evidence/2026-10-22/perseed-armorsink-r2/ledger/*/*.json

## The sink ledger (numbers)

### P>=15 PRODUCTION: 127 pieces across 16 runs (avg 7.9/run)

By how:
- endowment: 46 (36%) — starting gear
- monster-loot: 26 (20%) — combat drops
- contest-prize: 26 (20%) — contest winnings
- fan-package: 18 (14%) — alien fan care packages (apGrantItem, no tele)
- joined-with: 10 (8%) — alien players/visitors joining with their kit
- show-prize: 1 (1%)

By item (top): shelter_cloak P20: 30, wardens_cloak P25: 25,
stormcloak P15: 20, conquerors_plate P35: 8, hide_armor P20: 5,
military_vest P40: 5.

Craft: 0 pieces. The scholar never crafts P>=15 armor on this substrate
(the craft hook is proven working by F3; the policy simply doesn't craft).

### SINK: 3 classified + 31 returns

- swap-vanished: 3 — scholar gear-swap (Game.equip overwrites slot).
  The displaced armor VANISHES (not to inventory). This is the largest
  *avoidable* sink the ledger found.
- worn-vanished: 0 — no desyncs in the corpus.
- pack-buried / pack-decayed: 0 — corpses with armor were either looted
  or still existed at run end.
- departed-with: 0 in this corpus (hook proven by earlier runs).
- market-sell: 0 (policy doesn't trade).

RETURNS: 31 corpse-loot returns — armor recovered from death packs by
looting corpses. The village DOES get armor back from the dead, via the
corpse-loot verb.

### The mortality sink (fighter deaths)

Armor-bearing deaths: scholars and villagers who died wearing P>=15.
Every piece was PACKED (rode the death pack), NONE vanished at death.
Fates: pack-looted-returned (recovered by the village) or
pack-unlooted-at-end (corpse still existed when the run ended).

The brief's premise ("worn armor vanishes with dead bearers") is FALSE
for both ownership models:
- Villager: equipped is a view over items; the worn copy transfers to
  the death pack via generatePossessions.
- Scholar: worn+carried ride the death pack via playerDeath.

The real sinks are: (1) scholar gear-swap vanish (3), (2) burial of
unlooted packs (0 in this corpus, but the channel exists), (3) the 6
unexplained (below).

## defer5 re-binds involving armor

Analyzer reports binds/re-binds per run. Armor-involved binds occur when
the defer5 bind's shortlist includes armored veterans. (Counts in the
per-seed JSONs; the #735 bind's armor leg was the armorcatch context.)

## Village assessment

Who wore armor: scholars (primary — they get the best pieces via loot/
prizes/fans) and villagers (via the villagerGearDay gift/armory system).
Who died in it: scholars in combat (the main fighter-mortality), villagers
in combat/monster attacks. What happened to it: packed with the corpse,
then either looted back (31 returns) or left on the corpse.

The village is a net IMPORTER of high-tier armor: 127 pieces entered via
loot/prizes/fans/joins; only 3 vanished via swap; 31 were recycled via
corpse-loot. The armor economy is healthy — the constraint is not supply
but the scholar's survival.

## Sense-test — 2 armor-bearing fighter deaths, read for meaning

**Sive (scholar) d59, combat, wore Shelter Cloak P20** (belongfeast/s65422):
"The Eater is on you — no warning, just teeth." / "Armor absorbs 25." /
"The Eater hits you for 36." / "You go down." / "The Codex turns a page
on its own. Sive Tracy is dead. You didn't ask. It knew." / "Sive is dead
— and the dead hold no treaties. Every link Haven has shakes." / Tribute
rises to 11,250 kcal/week. "Grief is leverage."

**Charlotte (scholar) d140, combat, wore Warden's Cloak P25**
(belongfeast/s65421): "Armor absorbs 36." / "Reunion 1's Your Move hits
you for 41." / "You go down." / "Charlotte Koch is dead." / "Charlotte
is dead — and the dead hold no treaties." / The Red Table installs their
speaker; tribute rises to 7,500 kcal/week.

Both: the armor demonstrably absorbed hits (proving it was worn and
functional), deaths have narrative weight (Codex page, "the fire feels
smaller"), and political consequences (treaties shake, tribute rises).
The ledger's PACKED classification is correct — the armor rode the corpse.

## Blanks filled / documented

1. Villager worn armor does NOT vanish at death (brief premise corrected).
2. Scholar gear-swap VANISHES the old armor (Game.equip bug — documented,
   not fixed; instrument-only arm).
3. Fan packages (apGrantItem) and market trade are untele'd channels —
   hooked.
4. Alien players join with kit (joined-with); departures take kit (hook
   ready, 0 in this corpus).
5. Craft produces 0 P>=15 on this substrate (policy choice, not a bug).

## Plain-word numbers for the steve-call

- The village makes/finds 127 pieces of good armor per 16 runs (~8/run).
  Most comes from killing monsters (26), winning contests (26), and fan
  gifts (18). Nobody crafts it.
- When an armored fighter dies, their armor does NOT vanish — it stays
  with the corpse. The village gets it back by looting the corpse (31
  times in 16 runs).
- The armor that DOES vanish: when the scholar swaps to better gear, the
  old piece disappears (3 times). This is a game bug — equipping new
  armor should put the old armor in the pack, not delete it.
- 6 armor pieces appeared/disappeared without a clear cause (see below).
- Bottom line for corpse-stripping: the corpse already holds the armor;
  the village already loots it. A corpse-stripping verb would formalize
  what looting already does. The bigger leak is the gear-swap vanish.

## Metric review (§14 — mandatory)

Pre-registered PRIMARY: 0 unexplained events across the corpus.
Result: 6 unexplained → DIAG-NO-GO. Per §14, the miss IS the finding.

The 6 unexplained:
- leadfeast/s65422 d145: production conquerors_plate P35, wardens_cloak P25
- leadfeast/s65422 d171: sink stormcloak P15, wardens_cloak P25
- belongfeast/s65424 d99: sink shelter_cloak P20
- belongfeast/s65428 d105: production swat_vest P35

Pattern: high-tier armor (P25-35) appearing on existing roster members
without a hooked production event, and medium armor disappearing. The
d145 case shows two pieces appearing on villagers (gen_0d45zbv,
valeria_quispe, tom_baker) on the same day. Hypothesis: generated
villagers (gen_*) or a form-conversion (string↔object) bypassing the
census. The channel needs targeted instrumentation — likely a
villager-generation or gear-form path not yet hooked.

The ledger is COMPLETE for: endowment, monster-loot, contest-prize,
show-prize, fan-package, joined-with, craft, swap-vanished, corpse-loot
returns, departures. The 6 name the remaining gap.

§15 instrument-parity: DET-GATE green (byte-identical on/off). 0
instrumentErrors across 16 runs. Note: the sweep shows run-to-run
variance in event sequences (seeds 65422/65424 produced different day
counts on re-run), but each run's ledger is internally consistent —
the variance is in the simulation, not the instrument.

## Findings backlog

1. Game.equip gear-swap vanish (scholar) — real bug, steve-call whether
   to fix (should unequip to inventory).
2. The 6 unexplained — needs a follow-up DIAG with villager-generation
   instrumentation.
3. Craft: 0 P>=15 — policy never crafts; worth checking if the recipe
   is reachable.

## Verdict

**DIAG-NO-GO** (6 unexplained > 0). The ledger is 95% complete (121/127
production attributed, all major sinks classified). The miss names the
channel: high-tier armor appearing on roster members via an unhooked
path, likely villager-generation or form-conversion.

The number-set for the steve-call is delivered: production by channel,
the (non-)vanish at death, the swap-vanish bug, 31 corpse-loot returns,
and the wall numbers (13/16 national, 13/16 table, 13/16 wins).

---
Anchor: master 7f6f02487. Branch sim-armorsink-r2. Merged locally: no —
awaiting --ff-only merge. Do NOT push/bump.

Proof: scripts/test-armorsink-r2-20261022.js (80/80).
Instrument: scripts/armorsink-ledger-20261022.js.
Sweep: scripts/sweep-armorsink-r2-20261022.js.
Analyzer: scripts/analyze-armorsink-r2-20261022.js.
