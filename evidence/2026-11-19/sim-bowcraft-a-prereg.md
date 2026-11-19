# sim-bowcraft-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-bowcraft-a · **Loop A run:** fleshout-20261119T1415Z
**Type:** BUILD + measure — the bow-craft verb never fires (finding #2597).
**Frozen:** 2026-11-19 ~15:05 UTC, before any judged sim and before the
fix is implemented.
**Branch:** `sim-bowcraft-a` (worktree
`~/workspace/worktrees/sim-bowcraft-a`). **Base:** master `de9bb3c22`
(local master tip; the brief's base `f075dbb84` is an ancestor of it —
branch rebased onto current master before any judged sim, per the
brief. One `src/` change between the two bases: `baba35e87`
journey-deepening r244 F8 confide-line secret gate — a conversation
gate, no bow/craft/departure code; the control leg is re-measured on
the new base rather than assumed equal to bowsource.)
**Builds on:** `evidence/2026-11-19/sim-bowsource-a.md` (§§4.4, 5, 10)
and finding #2597, plus `sim-arrowsupply-a.md` and
`sim-scale-onramp-round-1215.md`.

## The question

The bowsource diag (8 seeds × 150d, band 107001–107008) proved the
home craft duty `villagerWeaponCraftDay` (villager-build.js) fired
**0 times in 90 eligible-villager-days**: the duty serves weaponless
villagers only, and bow knowledge is seeded only by handling a
finished bow — so 1,138 of 1,228 knows-bow villager-days sit on
armed villagers the duty skips, and the eligible remainder never
attempts even on the 39 days the pile held branch+vine for a
crude_bow. Materials are plentiful (pile branch on 86% of days);
loot cannot supply earth bows (alien table only); the pile never
holds a bow. This arm BUILDS the fix named in bowsource §5 and
measures before/after on identical seeds.

## Code facts read before any sim (frozen, not a sim)

- Duty `villagerWeaponCraftDay` (villager-build.js:1285–1402, read
  line by line): ladder hunting_spear → fire_hardened_spear → bow →
  crude_bow; serves WEAPONLESS villagers only (`armed` =
  weaponBonusOf melee+ranged > 0 OR any weapon item in pack);
  knowledge `v.weaponCraft[vid][recipeId]` seeded ONLY by the
  villager's own wear/carry/stash of the finished weapon (L1);
  level ≥ 1 required before any attempt (NO blind attempt — the
  bowsource prereg's "L1 35% blind" was wrong); odds L1 35% /
  L2+ 85%; blind success teaches L2 (PRACTICE rule); ≤1 attempt
  per villager per 3 days; materials own-carried first, then the
  communal camp pile; result equipped via `eq.autoEquip`;
  `tele('weapon_craft', {vid, item, ok})` on every attempt.
- Recipes (recipes.json, read live): hunting_spear branch 1 +
  stone 1 + vine 1; fire_hardened_spear branch 1 + wood 1;
  crude_bow branch 1 + vine 1; bow wood 1 + vine 2.
- Items (items.json, read live): hunting_spear / fire_hardened_
  spear are type melee, range 2, NO ammo; crude_bow / bow are
  type ranged, range 5, ammo arrow. A spear in the ranged slot is
  NOT a ranged weapon (`volleyWeaponOf`, equipment.js:383 — ammo,
  not the slot; speargate finding #2590, landed).
- Spear-out-of-slot is ALREADY handled by landed code:
  MELEE-FIRST FALLBACK (sim-meleefirst-b, 2026-11-10,
  equipment.js `autoEquip`): when the carrier holds a real ranged
  weapon the spear takes the MELEE slot and the bow takes the
  ranged slot, so the volley fires. The fix does NOT re-implement
  this; the proof test verifies it (unit + live smoke).
- Teaching infrastructure exists but teaches ABILITIES, not
  recipes: `villagerSeekKnowledge` / `npcLearnFromTalk`
  (villager-build.js) teach abilityIds via `npcLearnAbility`.
  There is NO recipe-teaching channel, and gossip moves REP only,
  never item knowledge (canon law: trust ≠ reputation;
  gossip/rumors move REP only). See "Not built" below.
- Substrate gates verified present in `src/js` on this base by
  grep (not assumed): SENSEEXPED (party-wiring.js),
  VETREENGAGE (game.js, villager-brain.js), PARTYSIZE4
  (villager-brain.js), FLEEREPAIR2 (win-plan.js), FIGHTALLY2
  (fieldFights.js). LAUNCHPARTY appears NOWHERE in `src/js` on
  this base — dead flag, must stay unset (same correction as
  bowsource). BOWCRAFT appears nowhere yet — the fix does not
  exist.

## The fix (frozen design — BOWCRAFT, env-gated)

In `villagerWeaponCraftDay` only, behind `BOWCRAFT=1`
(process.env, node sims only — the repo's lever-gate precedent:
SPEARGATE / BOWOPEN / SENSEEXPED). Control leg (unset) is
byte-identical old behavior.

(a) **Serve RANGED-LESS villagers.** Ranged-less = no
volley-capable ranged weapon after the duty's `autoEquip` call
(`volleyWeaponOf(p, defs) == null`) AND none carried in pack.
Weaponless villagers keep the FULL ladder unchanged (spear first,
then bow). Ranged-less-but-armed villagers (spear- or
melee-holders) are served for **BOW rungs only** (`bow`,
`crude_bow`) — never a second spear; a spear adds no ranged
option and wastes materials. Villagers WITH a volley weapon are
still skipped entirely.

(b) **Seed bow knowledge from SEEING a bow — perception-gated
only.** At duty start, snapshot the LADDER weapons EQUIPPED by
home villagers (visible in hand, same tile = the home camp).
Any home villager without L1 for a rung seeds L1 for each rung
they SEE equipped on ANOTHER home villager. Equipped only — a
bow in someone's pack or stash is not seen. Snapshot is taken
before the per-villager loop, so a same-day craft cannot seed a
same-day attempt (no ordering artifact). The existing
handling-seeding (own wear/carry/stash → L1) is unchanged.
Perception-first skill read before designing: the three accepted
channels are seeing on the same tile, hearing a shout within
earshot, following someone seen leave — this seeding uses the
first only. No roster is consulted for any decision; the roster
is iterated only to schedule each villager's own decision (the
existing duty pattern).

**NOT built (design calls, filed in the evidence as steve-calls,
not smuggled in):**
- TEACHING a recipe to a villager who has never seen a bow.
  No recipe-teaching channel exists; adding one would be a new
  system, and teaching a thing never seen is a design question.
- HEARD-ABOUT seeding via gossip. Gossip moves REP only; no
  item-knowledge gossip channel exists.
- Crossbow in the ladder. The duty ladder is spear/bow only;
  crossbow has a recipe but is not a duty rung. Out of scope.

**Unchanged:** ≤1 attempt / 3d cooldown; L1 35% / L2+ 85% odds;
PRACTICE rule; materials own-carried-first then camp pile;
`tele('weapon_craft')` on every attempt; at-home only; the
scholar's own craft() untouched; the sharpened-stick whittle
fallback untouched.

## Primary metric (BINDING, §14)

**Before/after on identical seeds 107001–107008, two legs
(ctl: BOWCRAFT unset; arm: BOWCRAFT=1), one shared base.**
Judge is the frozen bars below; the panel (§15) is the
instrument.

- **Craft attempts:** `tele('weapon_craft')` events with item
  bow / crude_bow, per leg, across the band.
- **Bows crafted:** the ok:true subset of the above.
- **Bowless departure share:** departures with no volley-capable
  ranged weapon / all departures (same driver row as bowsource).
- **Craft denominator (new):** ranged-less-knows-bow
  villager-days = sum over census rows of alive villagers with
  no volley weapon equipped or carried who know a bow recipe
  (bow or crude_bow ≥ 1). The old weaponless-knows denominator
  is still recorded for comparability.

**GO threshold — ALL must hold:**
1. Craft attempts (bow rungs) on the arm leg **≥ 3** across the
   band (control re-measured; bowsource measured 0).
2. Bows crafted (bow / crude_bow, ok) on the arm leg **≥ 3**
   across the band.
3. Bowless departure share: arm **< control by ≥ 0.05 absolute**
   (control re-measured; bowsource measured 128/161 = 0.795).
4. No-regression guardrails: median survival arm **≥ 0.8×**
   control; starvation deaths arm **≤ control + 2**; village
   deaths per run (panel) arm **≤ control × 1.10**.

**GO** = all four hold → finding #2597 FIXED, lever lands (gate
stays; adoption decides un-gating, mirroring speargate).
**NO-GO** = any bar misses → the finding stays open with the
measured reason; the fix is reverted before commit (killed arms
leave no trace — game code reverted, only instrument + evidence
commit).

## Secondary metrics (supporting, not binding)

- Engaged meetings with a bow-armed fighter (control: 0/32
  expedition wave-4+ meetings had a bow fighter, per the brief;
  arm > 0 is the direction).
- Craft attempts per ranged-less-knows villager-day (arm leg).
- Knowledge spread: ranged-less villagers who know a bow recipe
  over time (arm vs control); spear-armed-knows-bow days.
- Attribution completeness on the arm leg ≥ 0.90 (same
  instrument as bowsource: starting / crafted / looted / spawned
  / moved / unexplained).
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival.

## What this arm does NOT judge

- Whether a ranged opening wins fights (bowopen NO-GO stands).
- Arrow supply (arrowsupply NO-GO stands — a crafted bow still
  needs arrows; the departure ammo craft is a separate lever).
- No live verification (ship loop owns deploys). No push, no
  version bump. No merge to master by this arm — the coordinator
  merges.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowsource band,
  for comparability). Dead villages stop simulating (+10d tail).
- **Seeds (pilot, identical both legs): 107001–107008** (the
  bowsource band — deliberately REUSED, not fresh: this is a
  before/after on the measured band).
- **Confirm (only if the pilot passes all four bars):** fresh
  band 107011–107018, 8 seeds per leg (freshness: `grep -rl
  "107011|...|107018"` over `evidence/ --include="*.md"` — 0
  hits; over goal `hidden_files/ --include="*.md"` — 0 hits;
  over `~/memory/*.md` — 0 hits; checked at prereg time, before
  any judged sim). Pilot + confirm = 16 seeds per leg.
- **Policies:** competent verbatim. **Substrate (both legs):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1
  + SENSEEXPED=1`. **BOWOPEN unset, SPEARGATE unset** (matches
  the bowsource control exactly — the diag measured the world
  as-is). **LAUNCHPARTY unset** (dead flag). Leg difference is
  BOWCRAFT only: ctl unset, arm `=1`.
- **Instrument:** `scripts/bowcraft-driver-a.js` (copy of
  `scripts/bowsource-driver-a.js` — launch-funnel recorder +
  bow-supply recorder unchanged — PLUS the BOWCRAFT flag
  assertion and the ranged-less census counts
  `nRangedlessKnowsBow` / `nSpearArmedKnowsBow` per census row);
  analyzer `scripts/analyze-bowcraft-a.js` (copy of
  `scripts/analyze-bowsource-a.js` + the before/after judge on
  the frozen bars); per-seed JSONs under
  `evidence/2026-11-19/perseed-bowcraft-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowcraft-panels-a.js` (adapted
  copy of the bowsource panel builder, same schema) + `node
  scripts/balance-panel.js compare` with ctl vs arm legs; the
  compare `.md` is attached to the evidence file. The panel is
  the instrument, the frozen bars above are the judge.
- **Proof test:** `scripts/test-bowcraft-a.js` — GREEN before the
  sweep. Covers: (a) ranged-less eligibility (weaponless full
  ladder; spear-armed bow-rungs only; volley-armed skipped);
  (b) seeing-seeding (equipped bow on another home villager
  seeds L1; pack/stash bow does not; snapshot-before-loop, no
  same-day craft seeding); (c) spear-out-of-slot (crafted bow
  auto-equips to ranged, spear moves to melee — the landed
  MELEE-FIRST FALLBACK, verified not re-implemented); (d)
  control leg byte-identical (BOWCRAFT unset: old behavior —
  spear-armed skipped, no seeing-seeding); (e) live 5-day smoke
  asserting the recorder writes baseline + census rows with 0
  instrument errors and BOWCRAFT on/off proof; (f) analyzer
  interop on the live smoke corpus. Encounter-gear fixture:
  the competent policy stages the encounter itself (a geared
  scholar fighting with a party, never a fresh un-geared solo
  scholar); corpora record the encounter averages beside the
  verdict.

## Pre-run substrate checklist (§14b)

1. **Contact:** departures occur on the substrate — bowsource
   saw 161 departures / 7 engaged meetings on these exact
   seeds; the bowless pool (128) is the measured denominator.
2. **Pool sizing:** craft denominator is counted, not assumed
   (new ranged-less-knows census count on both legs).
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (GREEN before the sweep) proves the eligibility split, the
   seeing-seeding rules, the spear-out-of-slot equip, the
   control-leg identity, and the recorder shape on fixtures,
   plus a short live smoke. The analyzer `--selftest` covers the
   before/after judge shapes incl. the GO / NO-GO paths.

## Canon note

`docs/CANON.md` (manifest) was read for this arm, plus
`docs/MONSTER-WAVES.md` (no bow-craft canon — one craftable
decoy rattle and apex_bow as a damage reference only). No canon
doc covers villager crafting, bow supply, or launch gear-up —
said here rather than inventing canon (same as the bowsource
prereg). All supply-chain claims are cited from code
(`villager-build.js` `villagerWeaponCraftDay`,
`equipment.js` `volleyWeaponOf` / `autoEquip`,
`game.js` `villagerKillLoot` / `genOpeningPool`), not from
canon. The ownership law (no communal armory, deposit-is-
consent) is Steve's 2026-10-09 ruling, cited from the bowsource
evidence.

## Metric review (filled in the evidence file, not here)

Per §14: if a frozen metric proves wrong, it is written up under
"metric review" in the evidence file and a revision proposed for
the NEXT run — never re-scored mid-run.
