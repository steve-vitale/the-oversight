# sim-shelterverb — the SHELTER/EVACUATE verb (2026-10-16)

**Type:** SUBSTRATE — game-side verb + policy hook. Not a lever arm; this builds the missing piece the killed arms measured the absence of.

## The gap (from the kill audit)

- **sim-siegeroster (2026-10-15, KILLED):** the muster beat fired 63 times and read well — "📯 MUSTER — The Reunion hunts near Haven, and it is beyond us. Everyone inside..." — but post-unlock villager combat deaths didn't move (2.40 → 2.40, byte-identical). Metric review §4: "The policy has no verb to move villagers off a threatened tile, and no safe way to kill a wave-4/5 monster at Haven. The beat is a narration without a mechanism."
- **sim-siegedef2r (2026-10-15, KILLED):** the shelterRule blank (sdShelters 0) — same missing verb, one arm earlier.
- Steve's root-cause-first directive (2026-10-16): build the missing substrate, don't run another arm against its absence.

## What was built

**`src/js/shelter.js`** (new module, ontology-validated) — the verb:
- `shelterVillagers(vids, opts)` — evacuates villagers to the Haven node, inside the hall (`npcSetNode` + `npcSetInside` — real movement, never narration alone), behind the shelter flag. Narrates the movement honestly (🚪 …bar the hall door).
- `shelterEveryoneBut(exceptVids, opts)` — the muster shape: everyone inside except named holdouts.
- `shelterThreatNearHaven()` — the siegeroster gate: wave-4+ world monster within 2 tiles (Chebyshev) of Haven.
- `releaseShelter(vids)` / `shelterAllClear()` — release; inside stays true (inside is home; agency moves them back out).
- `isSheltered(vid)` / `shelteredVillagers()` — queries.

**Three engine hooks (the mechanism, not narration):**
1. `villagerMonsterTick` (game.js) — sheltered villagers excluded from the wild-jump victim pool.
2. `havenRaidTick` defender draft (havenGrowth.js) — sheltered villagers not drafted. Unmet raiders linger and gorge (existing mechanic) — the honest cost: lives vs pantry, legible.
3. Duty loops (game.js, task-lead + assignment) — sheltered villagers skip duties but KEEP their assignment (resume on release). The verb's cost is lost production — over-sheltering starves through idleness, which is the policy's episode-length pressure.

**`scripts/policies/shelter.js`** (SHELTER=1, default OFF) — the policy hook:
- Threat arrives → the proven muster beat (threat-named) + `shelterEveryoneBut([])`.
- Threat gone → `shelterAllClear()` (single verb-owned all-clear beat).
- Episode-deduped; gate-off delegates byte-identically to `capable`.

## Design calls (mine — Steve overrules)

1. **Everyone shelters; no fighting watch held out.** Wave-4+ vs villagers is a 1-2-round death (siegeroster diagnosis) — a watch is spent lives. A future arm can pass holdouts.
2. **Sheltered villagers don't work AND still eat.** No free lunch; the policy must mind episode length.
3. **Raid draft exclusion is total.** The muster fiction is "we outlast it" — the linger/gorge mechanic is the counterweight, and driving raiders off is the scholar's job (the crisis chain exists).
4. **The scholar is never auto-sheltered.** The player is the player's.
5. **No auto-expiry.** The policy owns the episode (muster → all-clear).

## Proof

`node scripts/test-shelter-verb-20261016.js` — **35/35 PASS**, RED→GREEN:
- RED: an INSIDE (door sub-state) villager on the Haven node is still wild-jumped — the door protected nothing (the pre-verb gap, proven on the real tick).
- GREEN: verb moves villagers (node + inside + flag); threat gate (wave-4 at Haven detected, wave-1 ignored, clear ignored); sheltered never wild-jumped across 80 real ticks while the unsheltered control is jumped; raid draft takes the unsheltered villager, never the sheltered one (forced raid, real `havenRaidTick`); sheltered keeps (not loses) the duty assignment while the control resolves; all-clear releases; scholar never sheltered; double-shelter no-op.
- POLICY: SHELTER gate off/on; muster episode opens on threat (proven beat text fires, village moves inside); closes on all-clear (single beat, village released); quiet when already stood down.

`sense-shelter-verb-20261016.js` — narrative sense-read: the muster fires, 11 villagers hurry inside and bar the door, the wave-4 threat hunts empty grounds for 30 ticks (NO ONE jumped), all-clear releases. Reads as people, not mechanics.

## Verification

- `node --check` on all touched files: clean.
- `node scripts/check-wired.js src/js/shelter.js`: 7 functions, 0 unwired.
- `node scripts/validate-ontology.js`: 116 systems validated, release permitted.
- `node scripts/check.js --quick`: 95 passed, 2 failed — both in `test-table-trial-fire-20261012.js` (`Game.tableTrialResume is not a function`; the function is absent from `src/js/table.js`). Pre-existing, unrelated to this change (no table.js touch); noted, not fixed here.

## What this unlocks

The next muster-defense arm no longer measures a missing verb. Open threads for it:
- A wave-4+ **at** Haven (dist 0) vs merely near — the gate treats both the same; a future arm may want the distinction.
- The raid linger/gorge cost while sheltered is unmeasured — the tradeoff is honest but its severity is unknown.
- steve-call candidates: shelter costs (currently lost production only), whether the apex should be able to breach the hall (currently it cannot — monsters don't open doors).

## Files

- `src/js/shelter.js` (new)
- `src/js/game.js` (3 hook lines + comments)
- `src/js/havenGrowth.js` (raid-draft exclusion)
- `index.html` (script tag)
- `docs/ONTOLOGY.md` (regenerated)
- `scripts/policies/shelter.js` (new)
- `scripts/test-shelter-verb-20261016.js` (new, 35/35)
- `scripts/sense-shelter-verb-20261016.js` (new)
