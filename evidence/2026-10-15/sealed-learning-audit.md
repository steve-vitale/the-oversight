# Closed arena: learning does not open the gate

2026-10-15. Base cd1565f233a538d895d1ad95cf1904d325b22eba on
codex/resume-claude. Independent of the preceding Market guard beam correction.

## Decision and actual caller

Retain the existing sealed-arena commitment. fieldFights.js documents noFlee
for pit/gauntlet/siege; contestEngine.js _cxBlood passes noFlee=true and says
an unjudged vFlee cannot happen. A later learn-first branch bypassed that rule,
returning vFlee after three losing rounds, sometimes immediately after the
closed-gate narration. The fix adds !opts.noFlee to that voluntary withdrawal.
It does not force wild fighters to engage or alter beast damage, selection,
HP, armor, rewards, prices, XP, food, ability costs or the Table.

Ordinary wild learning withdrawals remain. Monsters can still rout and the
fifteen-round judges can still award either side the decision. A vFlee with
judges=true at the cap is a legal judged loss, not an escape. Source callers
still settle the real returned health once. Molt/Second Wind can refuse a
fatal hit but do not guarantee survival of later sealed-arena rounds.

This is a survival lever whose costs are retained and reviewed. Steve's
instruction does not make fewer wins automatically a regression, nor more
wins automatically an improvement. No replacement win/death quota is used.

## Runtime and test design change

New shared-harness test-sealed-learning: 11/11 current; frozen base 6 pass /
5 fail. It reaches real fieldFight, actual public contestResolveVillager for
pit, gauntlet and siege, health settlement, wild withdrawal and round-cap
judges. The public contest fixtures pin only the offered real drone; fight
resolution is never mocked. The low-damage jury fixture is explicitly prepared
to prove all fifteen rounds and a living judged loss.

The first quick/full runs exposed one old test dependent on the illegal exit:
test-survivalist-passives expected a rescued fighter to leave a 5,000-HP arena
alive. Its wild case stays. Its survivor-settlement contract now uses a real
fatal opening -> Molt -> survivable blow -> finishing kill, with an explicit
vKill/no-learning-escape assertion. The old hopeless arena is retained too,
proving actual Molt, later death, final settled health, removal and died verdict.
Expanded Molt test: current 34/34; the same expanded test on frozen source
32 pass / 2 fail. Nothing is quarantined and no assertion accepts either life
or death just to go green. Initial red logs and final green logs are retained.

Final quick: 163/163. Full: 935/935. Ontology: 111 valid.

## Standard campaign measurement

Current identical collector, contract, default capable/maker/merchant/caregiver
policies and flags; Columbus origin, 150 driver days, Node v24.13.0. Matched
16-seed screen, then 64 per policy. Baseline cache reuse is exact-source/config
reuse of the completed beam candidate, not reuse across this runtime edit.
The raw panels retain complete seed lists, source manifests and configuration.

All 64 screen states and all 256 confirmation states/standard rows match.
All 23 metrics stay identical for each policy. Wins remain 55/21/23/23;
communities lost 8/19/14/18. Each standard campaign still earns tier-3+ gear;
this is mixed-policy coverage, not crafting-only or pacifist viability. The
comparison decision no_material_signal does not clear earlier caregiver
population/community warnings or the capable challenge question.

Both source manifests are stable, with no observer/runtime warning or error.
All 512 confirmation rows match verified cache result digests. Sixteen retained
seed-7 on/off control jobs match full standard rows and complete gameplay hashes
in each policy/root pair. Identical final states do not prove the affected
learning-in-a-sealed-arena opportunity was exercised naturally or establish its
balance. Prepared affected cases therefore remain a separate cohort.

## Prepared affected guard cohort

The unchanged probe-market-guard runs real fieldFight, ordinary generated gear,
prepared Market God, no abilities/skills, day 85/100 HP/10 hunger, fresh full-health
real monsters and private seeded combat draws. It binds source/Node/flags/origin
to a matching panel and rejects nonfinite endpoints. Seeds 1-64 for drones plus
1-64 for physical wolves; all 128 initial gameplay hashes match across arms.
Prior published market-beam-stress-after is this experiment's frozen before arm;
it is copied unchanged, never rewritten to pretend its old exits were deaths.

| Returned result / resource | Drone before -> after | Physical wolf before -> after |
| --- | --- | --- |
| villager died (vDie) | 18 -> 64 | 0 -> 0 |
| villager withdrew (vFlee, learning) | 46 -> 0 | 0 -> 0 |
| monster fled (mFlee) | 0 -> 0 | 64 -> 64 |
| mean ending HP | 21.125 -> 0 | 89.09375 -> 89.09375 |
| mean coin absorption | 14.65625 -> 18.90625 | 186 -> 186 |
| final hunger | 10 -> 10 | 10 -> 10 |

All 64 wolf records and final hashes match exactly; 46 drone trajectories
change. The drone death-rate delta +0.71875 has exploratory paired bootstrap
interval [0.609375, 0.828125], unadjusted and without an independent holdout.
This establishes a lethal commitment for this unprepared guard-only fixture,
not a natural campaign or complete god-build death rate. The probe returns a
field outcome before the ordinary caller's later wound settlement. Public
contest caller tests and phone play establish the actual settlement separately.
Do not change beast damage simply to restore the old illegal-exit survival.

## Prepared phone: production watch choices and persisted aftermath

390 x 844. The retained generator prepares an ordinary novice NPC and pins
the offered real review_drone. It does not grant a god/class/kit or alter the
fight's damage/outcome. Its field wrapper reads the actual returned record.
Start NPC pit invokes the real contest interruption and watch UI. Through
Watch silently -> Hold your breath -> Give them space, Wei dies in round four,
learning escape=false, judges=false, HP 0. Haven falls 12 -> 11. The immediate
DOM snapshot retains those counters and the production death notice.

The initial screenshot caught a blank broadcast transition and was rejected.
The test was reopened through actual Continue, which retained Wei's death,
absence from the roster and eleven-person Haven. Stable screenshots now show
the named death notice and population. The prepared observer's in-memory counters
reset on reload (its banner says no contest yet); the saved game's death and
population are the authoritative persistence proof. Both immediate and loaded
DOM snapshots are retained. No new contest or death was invented on reload.
Owned test tabs closed, viewport reset, local server stopped. No SW/release bump.

## Scope and next work

Keep the existing costly arena while measuring actual fair-match participants,
preparation, known counterplay and player/NPC choices. The guard-only stress
cohort is intentionally not the normal threat-matched contest population.
Broader god-scale contest effects, recipient parity, NPC integration, eight
fitting authored deeds, livelihood viability and natural campaign/Network
coverage remain open. The separate Garden interpretation question remains.

Source reconstruction is in sealed-learning-sources.json.gz: reference the
exact committed Market beam after arm, verify its recursive source references,
then apply the one fieldFights.js replacement. Both full manifests and current
shared-kit/probe/test source plus the prior Molt test are retained. Validation
records artifact hashes (text canonical LF, gzip/PNG exact bytes), controls,
prepared initial matches and check counts. No balance threshold changed.
