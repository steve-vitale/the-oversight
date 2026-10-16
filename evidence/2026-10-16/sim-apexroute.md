# sim-apexroute — engine-side villager apex-avoidance routing (flesh-out loop ARM 2, 2026-10-16)

**Run:** flesh-out loop ARM sim-apexroute, run_id fleshout-20261016T0915Z (coordinator claim filed before any sims), axis scale-onramp (blocking).
**Type:** LEVER — game-code, APEXROUTE=1, default OFF (zero trace when off; browser never sets it during the pilot).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-fieldfightsrc delivered the fork verdict FIELD-EXPOSURE-DOMINANT (74 post-invite monster-verb deaths: 21 RAID / 51 EXPEDITION / 2 WILD-ENCOUNTER); sim-apexpredators named the predators (Reunion 17, EATER 8/8 one-round, Eulogy 8, Audit 5, Editor 5, Cancellation 5, Influencer 4 — wave-4 66%, wave-5 20%, 62% one-round kills). sim-fieldroute (policy-side scholar routing) was KILLED at pilot: the 72% channel is villager-autonomous (villagerMonsterTick wild encounters + agency expeditions), and a policy layer can only move the scholar. This arm is the named next: the answer must be ENGINE-SIDE, in villager behavior — villagers remember where apexes were seen and route around that ground.

**PRIMARY (binding):** field-exposure (non-raid, post-invite) monster-verb villager death sum, armed <= 0.70x control on identical seeds. Field-exposure = FFS src EXPEDITION + WILD-ENCOUNTER (fieldroute's primary definition, reused verbatim for comparability). GO = ratio <= 0.70. A miss is NO-GO, never re-scored.

**GUARDRAILS (binding, all must hold):** national >= control-2; median survival >= control-10d; no new death mode; expedition foraging yields not collapsed (forage kcal/run-day armed >= 0.80x control — 'Foraged food' + 'Expedition haul' stockPantry sources). A miss on primary or any guardrail = KILL: game-code reverted to zero trace per the kill protocol; instruments + evidence land.

**Horizon:** 180d death-aware (matches the fork; the full post-invite ladder window must be observable).

**Seeds:** 8 FRESH [117, 228, 339, 441, 552, 663, 774, 885] — verified 0 `-s<seed>.json` hits across evidence/ before the run. Never the fork's [205, 246, 321, 412, 523, 634, 745, 856], never fieldroute's [391, 402, 415, 518, 629, 733, 844, 955].

**Policies:** leadfeast / belongfeast (the tribfloor courtship-road stack), x {control, armed} = 32 runs, one sweep, own paired control. APEXROUTE=1 is the ONLY armed-side switch; both sides carry the FFS instrument (read-only, proven by its own det-gate) + a read-only stockPantry forage-kcal tap.

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (pre-seat substrate, post-flip spelling), WAVE5REACH/W3DRIVE off. Confirm (12–16 seeds) ONLY if pilot passes every gate.

**Gates before spend:** unit RED→GREEN (41 checks: census weights, record/no-op gate, heat + 14d decay boundary, path heat, cold-dir + all-hot fallback, pantry gate on village tier, objDanger verdict move, expeditionLeg sidestep live-fire); DET-GATE 4/4 trajectory-identical (APEXROUTE unset, 40d pairs, plain/instr repeats, zero-trace asserted); SMOKE green (15d x 2 policies, APEXROUTE=1, pre-seeded hot ring — gates fire on real departures).

## The lever (src/js, all new code — no rewrites)

**The memory** — `state.village.apexSights`: `{ "x,y": { day, speciesId, weight } }`, freshest wins per tile, 14d decay (apexes wander; mirrors fieldroute's DECAY_DAYS). Weights from the predator census: eater 3 > reunion 2 > other wave-4/5 1; wave ≤3 = 0 (not an apex). Recording is perception-honest — only villagers who SAW the apex and lived:
- `resolveWildMonsterEncounter` (game.js): vFlee / mFlee / evade outcomes vs wave-4/5 → record at the fight tile (before the mFlee move). vKill removes the monster (nothing to avoid); vDie records nothing (VILLAGER XP LAW — the dead told no tale).
- `expeditionMonster` (villager-agency.js): evade ("saw it, gave it room") / mFlee (stood it down) / vFlee (fought, fled) vs wave-4/5 → record at the villager's node.
- No silent actions: the first time a tile goes hot, the survivor's report fires at the fire (👁 beat, knowledge-gated descriptor — never the true name).

**The gates** — the existing routing choices, consulted only when the pantry holds (villageFoodTier secure/abundant = 3+ pantry-days). Tight/starving villages walk straight — food missions win (the w3drive lesson; fieldroute's 413 pantry-blocks verified in the field):
- `objPick` (villager-objectives.js): a picked outdoor destination (forage/water/traps/explore) whose walk is hot → reroute to a cold direction at the same distance (tightness is a radius — the leash stays honest). No cold way → keep the original (routing never strands).
- `objDanger` (villager-objectives.js): fresh apex weight on the walk adds to the departure danger score (capped +3) — hot ground pushes departures toward ask/tighten/defer through the existing verdict machinery.
- `startExpedition` (villager-agency.js): a hot initial direction → cold way out at the same distance; all hot → depart anyway.
- `expeditionLeg` (villager-agency.js): a hot next tile → sidestep to cold ground costing at most one extra tile toward the target; none → walk through.

**Scope honesty:** file region is the villager travel/expedition routing system — NOT the trick/counter region (game.js villagerTrickDefs ~30461, sibling sim-apexhook's arm), NOT the meal-distribution/pantryDraw region (game.js ~26785, loop B sim-crumbs-b's arm). The lever does not touch fight outcomes, damage, or knowledge — only where villagers walk.

**[needs-eyes] call:** not included — the lever is default-OFF (APEXROUTE=1 sims only); there is nothing on the live build for Steve to feel. If the pilot GOes and the coordinator arms it default-on, the sighting beat + rerouted departures want his eyes then.

## Results

Sweep complete 2026-10-16 ~11:00 UTC: 32/32 runs finished (16 control + 16 armed, 8 fresh seeds x 2 policies x 2 sides), 180d death-aware, 0 dropped runs. Per-seed JSONs: evidence/2026-10-16/perseed-apexroute/.

### PRIMARY: NO-GO (1.176 vs the 0.70 bar)

Field-exposure (non-raid, post-invite) monster-verb villager death sums:

| side | Σ field-exposure | ratio |
|---|---|---|
| control | 34 | — |
| armed | 40 | **1.176** (GO needed ≤ 0.70) |

Per-pair (control→armed): belongfeast-s117: 4→4 · s228: 0→0 · s339: 0→0 · s441: 3→5 · s552: 1→1 · s663: 3→5 · s774: 2→3 · s885: 4→5 · leadfeast-s117: 2→2 · s228: 0→0 · s339: 4→3 · s441: 0→0 · s552: 4→5 · s663: 0→0 · s774: 4→4 · s885: 3→3. Five pairs improved or tied, five worsened, six tied — net +6 deaths on the armed side, all of it on the belongfeast road. The lever does not move the channel; the direction is wrong.

### GUARDRAILS: MIXED (primary already kills; recorded honestly)

| guardrail | control | armed | bar | verdict |
|---|---|---|---|---|
| national | 7 | 8 | ≥ 5 | HOLD |
| median survival | 141.5d | 139.5d | ≥ 131.5d | HOLD (−2d) |
| new death modes | — | other-named ×2 | none | **BREACH (instrument edge — see below)** |
| forage kcal/day | 695.3 | 712.7 | ≥ 0.8× | HOLD (1.025×) |

The "other-named" breach: 2 armed deaths carried no family classification (1 each on belongfeast-armed-s117, leadfeast-armed-s885). This is NOT a lever-introduced death mode — the identical bucket appears twice in perseed-fieldroute/ (the killed scholar-routing arm, which made ZERO src/js changes), and the lever touches no death record, damage, or cause path. It is a pre-existing FFS instrument coverage edge (family-less death records). Noted honestly; it does not change the verdict.

Secondaries: wave-4 13→13 · table invites 13→13 · starvation 17→17 · armed apexStats sums {sights: 84, reroute: 5, sidestep: 0, heat: 142}.

### VERDICT: KILLED AT PILOT

Primary NO-GO (1.176, wrong direction). Per the pre-registered binding gates: KILL. Game-code reverted to zero trace per the kill protocol (this commit); instruments (test/sweep/sense, INFO-SKIP post-kill) + analyzer + this evidence + the 32 per-seed JSONs land; no trace of the lever remains. No confirm spend — the pilot did its job.

### Mechanism autopsy (secondaries)

The lever fired MECHANICALLY — 84 sightings recorded, 142 objDanger heat applications, 5 objPick reroutes, the 👁 survivor-report beats narrated honestly — but the protection never landed. Three structural flaws, all visible in the sense run (leadfeast-armed-s552, 253 lines):

1. **Survivor bias: the memory is blind to the deadliest predators.** Sightings require a survivor (vFlee/mFlee/evade). THE EATER kills 8/8 in one round — by construction it NEVER enters the memory, yet the brief weighted it highest ("routing around is the only defense"). The sense run shows the pattern live: d101 "💀 The Reunion killed Midhun in 2 rounds" (never reported), d112 "💀 The Spoiler killed Sylwester in 1 round", d121 "💀 The Timeslot killed Jack in 1 round" — none were ever sighted, because one-round kills leave no reporter. The memory systematically covers the predators villagers can already survive, not the ones killing them.
2. **Decay (14d) < threat persistence.** d72: "👁 Liam came back white-faced — saw The Influencer to the east. The village will give that ground room." d110: "💀 The Influencer killed Moana in 2 rounds." The sighting expired 24 days before the kill; the threat stayed. Apexes linger for weeks (the m.lingering channel); a 14d memory of a wandering predator is a lagging indicator of ground that was dangerous once.
3. **Heat (+1..3) rarely flips the departure verdict.** The sense run shows villagers "heading out to forage" every single day through the whole hot period — the village hears the report and walks out anyway, because +1..3 on a low base score seldom crosses go→ask→tighten→defer. The 5 reroutes and 0 sidesteps confirm the sparse hot tiles rarely intersect a picked direction. And the 👥 paired departures from d105 suggest the heat that DID flip verdicts pushed 'ask' → companions → more villagers in the field, the wrong direction for a 62%-ork predator population.

Net: a lagging, survivor-biased, weak-signal memory cannot route around predators that kill in one round and wander for weeks. The fieldroute kill ("the price exceeds the protection because the protection never reaches the population that's dying") has an engine-side twin: the protection never reaches the PREDATORS that are killing.

## Village assessment

The villages on this substrate die the way the fork said — of combat, not hunger (starvation 17 both sides, forage yields 1.025×). The armed villages knew more (84 sightings, honest 👁 beats at the fire — Liam's d72 Influencer report reads like a real person warning their village) and walked anyway: the departure lines continue daily, the 👥 pairs walk out together, and the Reunion/Spoiler/Timeslot kill unreported in 1–2 rounds. Who dies: everyone, steadily — foragers in the wild (the 51), wanderers, the mantle cycling. What was missing: any sighting of the actual killers — 92% of the fork's dead were killed by species the village had never observed, and this lever's memory inherits exactly that blindness. The blank filled: engine-side apex-avoidance routing is measured and killed. The 72% needs an answer that does not depend on survivors reporting one-round killers — the counter/trick game (sibling sim-apexhook's arm, the wave-3+ unwired counterplay), witness-reported deaths (allies present at a kill see it — engine-grounded, unbuilt), or the raid-defense answer for apexes (finding #161's territory) — not routing on survivor memory.

## Sense-reads (SENSE-TESTING LAW)

Sense run: leadfeast-armed-s552 (sights=12, heat=25), 180d, apex beats + departures + deaths captured (scripts/sense-apexroute-20261016.js → evidence/2026-10-16/apexroute-sense-s552.txt, 253 lines).

The fiction reads TRUE — that is what makes the kill informative rather than confusing:
- d72 "👁 Liam came back white-faced — saw The Influencer to the east. The village will give that ground room." and d100 "👁 Nathan came back white-faced — saw The Eulogy out there." — survivors reporting, knowledge-gated descriptors, direction named. Sensible villagers avoiding known danger, narrated honestly.
- d17 "💀 The Hushpuppy killed Thabo in 1 round" two lines after "⚔️ Thabo stood down the Hushpuppy and kept walking — 5 rounds" — the wild is honest about variance.
- The failure reads true too: d110 "💀 The Influencer killed Moana in 2 rounds" 38 days after the report expired, and the daily "heads out to forage" drumbeat through every hot period — the village is not stupid, the signal is just too weak and too stale to act on. No template fingerprints from the lever itself (one beat shape, fires rarely); the existing departure/fight/death beats carry the run.

Verdict: diversions read as villagers sensibly avoiding known danger WHEN they fire — but they fire 5 times in 16 runs, and the danger that kills is never the danger that was known.

## Metric review (§14)

The pre-registered metric did its job — no revision needed, no re-scoring. Three notes for future arms:

1. **The 0.70 bar was honest for a villager-side lever against the full 72%** — and the pilot killed it in one sweep with no confirm spend. The bar did not need the guardrails to catch this one (unlike fieldroute, where the median-survival guardrail did the work); the primary missed outright and in the wrong direction.
2. **The "no new death mode" guardrail needs an instrument-coverage carve-out.** The "other-named" bucket is a family-classification gap in the FFS instrument, not a death mode — it fired on fieldroute's zero-game-code sweep too. A future analyzer should either resolve family-less deaths or exclude the bucket with a cited precedent, rather than letting an instrument edge read as a guardrail breach.
3. **Pre-register a per-firing metric for sparse levers.** sights=84/heat=142/reroute=5/sidestep=0 told the mechanism story before the primary did. A future routing arm should pre-register "protection delivered per firing" (e.g., hot-path departures avoided per sighting) so a sparse-but-effective lever isn't killed on noise — and a sparse-and-ineffective one (this) is killed with the mechanism named.

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged: the 72% field-exposure channel stands, and engine-side survivor-memory routing joins scholar-side routing and both patrol lines as measured dead ends — four distinct attacks on the channel, four kills, each naming the next more precisely. The durable lesson sharpens: the killing is done by one-round wave-4/5 predators the village never sees coming (92% unobserved at death; the Eater structurally un-reportable). The next arm on the 72% needs an answer that works without survivor reports — the wave-3+ counter/trick game (engine-real counterplay, unwired to the ledger), witness-reported kill sites, or apex raid-defense. The mortality wall itself stands: 15/16 village-lost on the pre-seat substrate across both roads.

## Per-seed JSONs

evidence/2026-10-16/perseed-apexroute/ (numeric wall-metric keys: won/wins/national/table/wave4/wave5/exiled as 0/1; postInviteFieldExposure; apexStats {sights, reroute, sidestep, heat}; forageKcal/forageKcalPerDay)

## Proof artifacts

- scripts/test-apexroute-20261016.js — proof: 41/41 synthetic RED→GREEN, DET-GATE 4/4 trajectory-identical (APEXROUTE unset, 40d, zero-trace asserted), SMOKE 6/6 green; INFO-SKIPs post-kill (lever reverted)
- scripts/sweep-apexroute-20261016.js — the paired sweep (FFS instrument + read-only forage tap); INFO-SKIPs post-kill
- scripts/sense-apexroute-20261016.js — the sense-read capture; INFO-SKIPs post-kill
- scripts/analyze-apexroute-20261016.js — the gate judge (reads the landed per-seed JSONs)
- evidence/2026-10-16/apexroute-sense-s552.txt — 253-line sense transcript (leadfeast-armed-s552)
