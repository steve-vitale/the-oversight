# Survivalist passive parity and real survivor HP — 2026-10-15

Codex's godpath lane, with the explicit combat-caller exception in
AGENT-LANES.md. Baseline: commit 8d7d8d77 and the preceding published
`survivalist-deed-after-64.json.gz` (64 seeds per policy, 150 driver days).
No region or nomad content, new ability prices, offer ordering or job lean.

## The actual missing routes

NPC Second Wind now triggers from lethal tactical hits and real world
damage, as well as off-screen fights. NPC Molt now triggers in all three
health pipelines. A single `npcDeathRefusal` function applies the existing
order: funded Ember Heart in a fight, then available Molt, then Second Wind.
An unfunded Ember Heart no longer suppresses a valid alternative. NPCs keep
their actual discovered-synergy benefits: two daily/weekly uses with Refuses
Death, and Undying Fury restores full HP only during actual active rage.

Second Wind restores 1 HP (or the active-rage synergy's full restore).
Violent use establishes a 500-kcal floor; it is not a repeat +500 grant.
For the NPC belly, one hunger point represents 25 kcal, so the equivalent
floor is hunger <=80. Actual sickness damage passes an internal nonviolent
flag independently of its knowledge-gated disease/cause name. It prints no
food. Pending rescue links keep their uses; another person's link does not
consume or grant their passives. Molt heals their own full HP and clears
actual worn equipment, retaining their pack, just as the player's Molt does.
Tactical weapon/armor caches and field weapon/armor/morale caches lose the
shed equipment immediately; passive armor remains.

Per-person `village.godpathSurvival[personId]` stores actual daily and weekly
uses. Existing player fields and old NPC daily markers are read/mirrored,
not forgotten. Real succession into a body cannot refresh that body's spent
NPC use. The voluntary player Molt action and the automatic death cheat
share the same weekly use after succession. No predecessor uses transfer to
a different person. Real outcomes also feed the existing per-person fitting
deed receipt.

## Rescue must survive the caller

Before this fix, fieldFight returned `vHpLeft`, but twelve wound-application
sites in game.js, contestEngine.js and villager-agency.js replayed cumulative
`vTaken`. In-fight healing and death refusals could therefore be undone by
post-fight damage. New NPC records carry `healthSettlement` with the actual
actor, starting HP and surviving HP. Those wound sites call
`settleFieldFight`. It applies the actual returned HP once, including a net
heal, rejects another actor/replay/stale health, and retains gross `vTaken`
for fight tactics and honest damage logs. Existing already-dead outcome
handling is preserved. A second helper call cannot replay a refund or wound.

This settlement receipt is for NPC field participants. Legacy/unreceipted
records retain the previous damage fallback. The separate headless-player
field-contest adapter still needs an audit of player kit/resources/HP and
posthumous outcome semantics; this change does not claim to complete that
adapter or all passive/active parity throughout the game. Foreground human
combat continues to use its existing death-cheat rules and costs.

## Proofs

`test-survivalist-passives.js`: **31 assertions** through real tactical
`tbDamage`, `hurtVillager`, `fieldFight`, actual succession and voluntary
`useAbility`, plus the real wild-encounter and pit-contest callers. The
field proofs prepare a dangerous real monster definition and inject the
engine's supported deterministic RNG; they never stub a fight result.
They prove real Second Wind/Molt rescues, gear loss, food floor/no food for
sickness, day/week refresh and caps, discovered synergies/active rage,
legacy markers, no scene/succession refresh, field HP persistence and no
replayed or misattributed health settlement. Prepared proofs are not natural
campaign survival rates.

The older villager proof used the first roster id as its NPC, which was the
current bearer. It instantiated one identity as both player and NPC fighter.
The fixture now selects actual non-bearer villagers; all **57 original
assertions** remain and pass. No assertion was weakened.

The observer now retains up to 100 console warnings per seeded run. A
successful child's warnings previously disappeared from the parent report;
new field-settlement diagnostics must remain inspectable. Existing 150-day
observer-on/off gameplay parity is still checked.

`check-wired`: Godpath **93 functions / 0 unwired**; field fights **7 / 0**.
Ontology: **111 systems** validated and generated catalog updated. Quick:
**143/143**. The first full suite was 914 passing / 1 failure in the legacy
spawn-knack test's nested ontology command; the standalone validator and
unchanged test pass (37/37). The failure output did not retain enough detail
to establish a cause. No quarantine; an unchanged full retry is required.

## Remaining scope

Nine fitting god deeds remain. This closes the specifically identified NPC
Second Wind/Molt automatic activation gaps; it is not a blanket claim that
all 27 subclass verbs and every older magic action/passive have been audited.
NPC ability evolution/voluntary action decisions and headless player contest
parity still need reconciliation with actual callers. Class/offer access,
including the absent Miser subclasses and sparse Undying coverage, remains
separate measured work. No new browser UI was introduced by this pass.

## Final 256-pair comparison

| Policy | Wins before / after | Seated before / after | Median day before / after | Player deaths before / after | Other person deaths before / after |
|---|---:|---:|---:|---:|---:|
| capable | 41 / 42 | 55 / 56 | 90 / 90 | 93 / 95 | 591 / 585 |
| maker | 18 / 18 | 24 / 24 | 116 / 120.5 | 63 / 73 | 734 / 742 |
| merchant | 10 / 16 | 22 / 24 | 123.5 / 144.5 | 43 / 42 | 710 / 595 |
| caregiver | 21 / 15 | 30 / 22 | 123.5 / 136 | 49 / 52 | 636 / 641 |

64 matched seeds in each row; **90 -> 91 total wins of 256**. Only 8/256
standard rows remain identical. This is a combined activation/cooldown/HP
settlement repair, not a clean isolated passive-balance lever or a universal
buff. Caregiver wins fall despite longer median campaigns. Keep that regression
visible; investigate ending access and death traces instead of declaring
all peaceful paths healthy from the aggregate. Other-person deaths sum only
`villager:` and `person:` categories, not monster deaths.

All 256 after-runs retained **zero console warnings**, including zero rejected
settlements. Old baseline reports did not capture warnings, so no historical
zero-warning claim is made. Raw report: `survivalist-passive-after-64.json.gz`;
source hashes and compact comparison: `survivalist-passive-validation.json`.
The observer is read-only and its 150-day on/off parity proof remains green.

No natural Second Wind or Molt receipt appeared in this panel; only one
Ember Heart receipt remained, and no Unkillable ascension occurred. The prior
panel had two Ember Heart receipts and one Unkillable. Prepared proofs
establish functioning routes, **not healthy natural passive usage**. Second
Wind and Molt still sit at positions 10 and 11 of the Strange kit, outside
the initial offer window. This makes measured offer/class access the next
high-value follow-up; the wider parity audit is not finished.

Final full retry: **915/915**, unchanged runtime (194 seconds). New runtime
proof **31/31**, existing NPC proof **57/57**, quick **143/143**. No quarantine
or weakened assertion. The source's player/NPC kit/data prices were not
retuned. No release or service-worker bump.
