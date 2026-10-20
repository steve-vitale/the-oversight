# sim-spearfund — scale-wall: policy-side spear acquisition for the courtship scholar (2026-10-20)

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Axis/lens:** scale-onramp, lever-2 (wave unlock pacing) lens on the war path. Backlog #69 named next.
- **Primary metric:** seeds where the spear recipe reaches L1+ — recipe level ≥ 1 AND at least one craft attempt (sfSpearTries ≥ 1).
- **GO:** armed ≥ 3/8 seeds (baseline measured 0/8 in r19).
- **KILL:** armed < 3/8 seeds.
- **Secondary:** wave-3 ledger kills ≥ 2/8 seeds (reachability direction).
- **Guardrails:** median survival ≥ control −10d; no new death modes.
- **Horizon:** 180d death-aware (dead villages stop simulating).
- **Seeds:** 64001–64008 (this run's shared control seeds per the lever claim).
- **Policies:** baseline `leadcourt` (gate off) vs armed `spearfund-lead` (SPEARFUND=1), identical seeds.
- **Channel (declared before the pilot, from the probe):** corpse-loot
  priority (Game.corpseTakeItem) — the only honest channel the probe showed
  fires on the courtship road. Structural audit: stash-armory borrow is
  dead (donateWeapon is UI-only; the pile never fills), monster loot is
  alien-only, the river trader doesn't sell spears, no villager→scholar
  gift verb exists. Census (leadcourt, seeds 64001–64004, 30d): 3/4 seeds
  have a villager carrying a hunting_spear (equipped/stashed; one armed up
  by d30); villagers die; the dead carry their real gear as lootable packs.
- **Proof:** scripts/test-spearfund-20261020.js — 19/19 green, every gate-on
  assertion with a gate-off (or condition-off) RED contrast.

## Context

buildfund r19 (KILLED AT PILOT, evidence/2026-10-14/sim-buildfund.md) showed
the gear recipe chain's first link never fires on the courtship road: 8/8
seeds × 180d never put a hunting_spear in the scholar's hands (no loot, gift,
or find), so spear crafts were 0/0 tries. Backlog #69's named next: route a
spear to the courtship scholar and pre-register on the INTERMEDIATE metric
(seeds where the recipe reaches L1+). The courtship scholar LOSES wave-3
fights on capability, not motivation (r18; courtkill arm).

## Probe (which honest channel fires under leadcourt?)

Structural findings (code, verified by reading):
- **Stash-armory borrow:** STRUCTURALLY DEAD. donateWeapon is called only
  from the UI (app.js); no game code or policy ever deposits a weapon into
  the pile. The pile starts empty and can only fill via villager
  upgrade-returns (which need a pile weapon already — circular).
- **Monster loot:** alien-origin pool only (rollAlienLoot) — an earthly
  hunting_spear never drops.
- **Trade:** the river trader sells knife/salt/rope only.
- **Villager gift to scholar:** no verb exists (gifts are scholar→villager).
- **Recipe teaching:** no villager→scholar gear-recipe teaching verb.

Empirical — villager spear census (scripts/census-spearcarriers-20261020.js,
leadcourt, seeds 64001–64004, 30d):
- s64001: villager gen_9l2p9ec has a hunting_spear STASHED at d0 (gone by
  d30 — the carrier died or rearmed).
- s64002: villager gen_45fzio0 has a hunting_spear stashed at d0, EQUIPPED
  + carried by d30 (armed up via their own acquisition).
- s64004: dale_hoffman starts with hunting_spear equipped + carried.
- s64003: no spear carrier (bows, sticks, crowbar, knives).
- Villagers carry real weapons (machete, crossbow, hatchet, bow,
  fire_hardened_spear); the dead carry their real gear as lootable death
  packs (sapient_dead_carry_their_gear, corpses.js).
- Contest spear grants: not measured (the say-line probe died on harness
  speed); contests remain a secondary honest channel, unmeasured here.

Verdict: the probe shows exactly one honest acquisition channel that fires
under the base policy — the dead. The layer drives corpseTakeItem
opportunistically (no corpse-chasing travel).

## Lever played

`scripts/policies/spearfund.js` — SPEARFUND=1 (default OFF), wraps leadcourt.
Courtship verbs run fully; the drive is additive and runs BEFORE the base
daily so gearUp can equip a borrowed spear the same day. All verbs already
exist in the engine; zero src/js changes:

1. **Loot leg** — once/day, while the spear recipe is unseen (L0) and the
   scholar doesn't own a spear: scan for an unburied person/villager corpse
   at the scholar's node holding a hunting_spear; take JUST the spear via
   corpseTakeItem (the per-item verb — range-checked, weight-checked,
   narrated, trauma + observe('loot_corpse') social cost). Fires
   noteGearHandled → L1. Opportunistic only — no corpse-chasing travel.
   A living hunter lending/giving a spear would need a NEW verb (game
   code, out of scope) — noted as a steve-call candidate.
2. **Craft leg** — one blind craft attempt/day via Game.craft when recipe L1+
   and branch+stone+vine are on hand. craft() enforces every gate (L1 blind
   35%, materials at risk; success teaches L2).

## Pilot results

INCOMPLETE — worker timed out mid-pilot (recovered by main agent 2026-10-20).
Partial sweep from sf-a.log / sf-b.log:

Baseline (leadcourt, gate off), 7 seeds (64001–64007):
- spearEver=1 on 7/7 (contest channel delivers — the probe's secondary channel fires)
- recipeEver=1 on 5/7, tries=0, crafts=0, looted=0 on all
- w3kills: 0,1,1,2,0,2,0

Armed (spearfund-lead, SPEARFUND=1), 2 seeds (64001–64002):
- Identical to baseline on both seeds (spearEver=1, tries=0, crafts=0, looted=0)
- The loot leg never fired (looted=0); the craft leg never attempted (tries=0)

Primary metric (recipe L1+ AND ≥1 craft attempt): 0/7 baseline, 0/2 armed.
GO bar (≥3/8 armed) not reached; KILL bar (<3/8) not confirmed — pilot unjudged.

## Reachability verdict

Unjudged (incomplete pilot). The contest channel reaches the scholar with a
spear on 7/7 baseline seeds, but recipe + craft never engage (tries=0) — the
spear arrives as a finished weapon, not as a recipe unlock. Whether the
corpse-loot leg can bridge that gap is unmeasured: it never fired in the
2 armed seeds run.

## Village assessment

Partial (7 baseline + 2 armed seeds). Villages survive to 180d on most seeds
(2 village-lost: s64001 d29, s64006 d94). Wave-3 ledger kills appear on
4/7 baseline seeds (1,1,2,2) — the courtship scholar's wave-3 capability
question (r18 courtkill) shows kills happening, but none via crafted spears.

## Metric review

Primary (armed ≥3/8 with recipe L1+ and ≥1 craft) binds the NEXT run, not
this one — pilot incomplete, no re-scoring. Observation for the next run:
spearEver=1 on 7/7 baseline means the GO bar's "armed" condition may be
satisfiable without the layer (contest spears count as spearEver but the
metric requires recipe L1+ AND a craft attempt — tries=0 everywhere, so the
metric is really testing whether the recipe unlocks, not whether a spear is
held). If the next pilot shows tries=0 again, the metric needs revision:
the layer's loot leg fires noteGearHandled → L1, but with looted=0 it never
got the chance.

## Blanks filled / documented

- Probe documented 5 spear channels; 4 are structurally dead (stash-armory
  circular, monster loot alien-only, trader doesn't sell, no gift verb).
  Corpse-loot is the only honest channel — measured live via census.
- A living hunter lending/giving a spear needs a NEW verb (game code) —
  steve-call candidate, not this run's work.

## Wall numbers

Not measured (no full pilot). Baseline seeds show national/table/wins
unrecorded in this sweep's telemetry — wall numbers belong to the
scale-wall.json baseline, not this arm.
