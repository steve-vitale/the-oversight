# sim-fieldroute — apex-aware expedition routing (flesh-out loop ARM 2, 2026-10-16)

**Run:** flesh-out loop ARM sim-fieldroute, run_id fleshout-20261016T0715Z (coordinator claim filed before any sims), axis scale-onramp (blocking).
**Type:** LEVER — policy-side composition layer, zero src/js changes, guard-classified default-OFF (FIELDROUTE=1).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-fieldfightsrc (this run's fork diagnostic) attributed the post-invite mortality: FIELD-EXPOSURE-DOMINANT — of 74 post-invite monster-verb villager deaths on the pre-seat substrate, 21 (28.4%) raid-system, ~72% wild field encounters with wave-3/4/5 monsters (~9–10%/day post-invite vs 1.5%/day pre). The patrol line is exhausted on both sides (sim-patrolassign + sim-patrolwave, both killed at pilot): ungated patrols thin apexes but patrollers die 1:1.2; wave-gated stand-downs preserve the threat and do worse net. This arm attacks the 72% differently: APEX-AWARE EXPEDITION ROUTING — remember where wave-4/5 apexes were sighted, and walk the scholar's expeditions around that ground instead of through it.

**PRIMARY (binding):** field-exposure (non-raid, post-invite) monster-verb villager death sum, armed <= 0.70x control on identical seeds. Field-exposure = FFS src EXPEDITION + WILD-ENCOUNTER (the fork's 72%). GO = ratio <= 0.70. A miss is NO-GO, never re-scored.

**GUARDRAILS (binding, all must hold):** national >= control-2; table >= control-2; median survival >= control-10d; starvation deaths <= control+2; no new death mode; wave-4 unlock count >= control-1 (routing must not kill the arc). A miss on primary or any guardrail = KILL: the policy file is deleted per the kill protocol, instruments + evidence land, no trace of the lever.

**Horizon:** 180d death-aware (matches the fork; the full post-invite ladder window must be observable).

**Seeds:** 8 FRESH [391, 402, 415, 518, 629, 733, 844, 955] — verified 0 `-s<seed>.json` hits across evidence/ (filename + content grep) before the run. Never the fork's [205, 246, 321, 412, 523, 634, 745, 856].

**Policies:** leadfeast / belongfeast (the tribfloor courtship-road stack), x {control, armed} = 32 runs, one sweep, own paired control. FIELDROUTE=1 is the ONLY armed-side switch; both sides carry the FFS instrument (read-only, proven by its own det-gate).

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (pre-seat substrate, post-flip spelling), WAVE5REACH/W3DRIVE off. Confirm (12–16 seeds) ONLY if pilot passes every gate.

**Gates before spend:** unit RED→GREEN (31 synthetic routing decisions + composition sensitivity); DET-GATE 4/4 trajectory-identical (FIELDROUTE unset, 40d pairs); SMOKE green (15d x 2 policies, live-fire: a real injected wave-4 apex is sighted by the perception scan and its tile diverts).

## The layer (scripts/policies/fieldroute.js)

APEX-AWARE EXPEDITION ROUTING. Two parts, both policy-side, zero src/js:

**1. The memory** — a deterministic per-run record of wave-4/5 apex sightings, keyed by tile, holding the freshest sighting per tile, decaying after DECAY_DAYS=14 (apex wander; also the pilgrimage-stale horizon, so memory and patience expire together). Two engine-grounded, perception-honest sources (no prose parsing; grep found no engine map-memory):
- PERCEPTION SCAN: each daily/upkeep window, tiles within Manhattan d<=3 of the scholar (travelTargets' own reach — exactly what the scholar can see) read via Game.monsterAt, the engine's own perception (the same call competent.js's fightAssessSkipTile uses).
- ENGAGEMENTS: the startCombat wrap records every wave-4/5 fight the scholar enters (the village knows — they're narrated), tagged atHaven so haven raids stay separable from field fights.
The memory persists across mantle transfers (the village's knowledge, gossip-honest) but never across runs (ctx is per-run). "If you don't know, it doesn't show": the layer never routes on the engine's omniscient worldMonsters() list — only on what the scholar has seen or fought.

**2. The routing** — a travelTo wrap installed for the daily/upkeep window (the tribfloor verb-gate pattern). When the base asks to travel to (x,y):
- mid-fight → pass (movement belongs to the fight); forced/combatExit → pass (escapes); destination is haven (4,4) → pass (home is home; the raid system owns haven defense); destination cold → pass.
- apex-hot AND the village pantry is TIGHT/STARVING → pass, counted as frPantryBlock. THE W3DRIVE LESSON: the gate reads villageFoodTier() — the VILLAGE pantry — never the scholar's kcal. A hungry village cannot afford caution; food missions win.
- apex-hot and the pantry holds (SECURE/ABUNDANT, >=3 pantry-days) → divert to the nearest non-hot travelTarget minimizing distance to the intended destination (the mission continues, around the hot ground). Deterministic tie-break (distance, x, y) — pure function of game state, no RNG anywhere in the layer (proven: Math.random monkey-patched to throw, routing still works). No alternative → pass (routing never strands). One honest 🧭 beat per day when diversions happened (no silent actions, no flood).

**Scope honesty:** the layer's actionable surface is the scholar's travelTo. Villager task assignments (assignTask) carry no destinations in the policy — the engine moves villagers — so villager-autonomous field exposure is out of reach for a policy-side layer. The layer can only move the scholar (and the scholar's expeditions). The pilot adjudicates whether that's enough.

## Results

Sweep complete 2026-10-16 ~08:35 UTC: 32/32 runs finished (16 control +
16 armed, 8 fresh seeds x 2 policies x 2 sides), 180d death-aware, 0
dropped runs. Per-seed JSONs: evidence/2026-10-16/perseed-fieldroute/.

### PRIMARY: NO-GO (1.109 vs the 0.70 bar)

Field-exposure (non-raid, post-invite) monster-verb villager death sums:

| side | Σ field-exposure | ratio |
|---|---|---|
| control | 46 | — |
| armed | 51 | **1.109** (GO needed ≤ 0.70) |

Per-pair (control→armed): belongfeast-s391: 4→2 · s402: 4→2 · s415: 1→1 ·
s518: 4→5 · s629: 6→5 · s733: 5→3 · s844: 4→3 · s955: 1→4 ·
leadfeast-s391: 2→2 · s402: 2→3 · s415: 0→2 · s518: 2→4 · s629: 2→2 ·
s733: 0→3 · s844: 5→2 · s955: 4→8. Six pairs improved, seven worsened,
three tied — net +5 deaths on the armed side. The layer does not move the
channel; if anything it feeds it.

### GUARDRAILS: BREACH (median survival)

| guardrail | control | armed | bar | verdict |
|---|---|---|---|---|
| national | 7 | 7 | ≥ 5 | HOLD |
| table invites | 15 | 16 | ≥ 13 | HOLD |
| median survival | 139.5d | 127.5d | ≥ 129.5d | **BREACH** (−12d) |
| starvation deaths | 6 | 6 | ≤ 8 | HOLD |
| wave-4 unlocks | 15 | 15 | ≥ 14 | HOLD |
| new death modes | — | none | none | HOLD |

### VERDICT: KILLED AT PILOT

Primary NO-GO (1.109, wrong direction) + guardrail BREACH (median survival
−12d). Per the pre-registered binding gates: KILL. The policy file
scripts/policies/fieldroute.js is deleted per the kill protocol;
instruments (test/sweep/analyzer, INFO-SKIP post-kill) + this evidence +
the 32 per-seed JSONs land; no trace of the lever remains. No confirm
spend — the pilot did its job.

### Wall numbers (this seed set, pre-seat substrate)

Armed side: national **7/16** · table **16/16** invites / 0 sittings · wins
**0/16** · wave-4 **15/16** · wave-5 **9/16** · median survival **127.5d**
(max 180d, one survivor: leadfeast-s844). Control: 7/16, 15/16, 0/16,
15/16, 9/16, 139.5d. Death-cause shares (armed): combat 495, monster 108,
sickness 7, starvation 6, wounds 3, other-named 1 — combat-family still the
wall, as the fork said.

### Mechanism autopsy (secondaries)

Armed side: **476 diverted legs** across 16 runs (279 apex sightings, 0
no-alt strandings), **413 pantry-blocks** (tight/starving days walked
straight — the w3drive gate honored), apex engagements 1 (0 in the field),
travel days 9189 → 9238 (+49 legs). The layer worked MECHANICALLY —
sightings became memory, memory became diversions, diversions were narrated
honestly, nobody stranded.

Why it failed: the 72% channel is villager-autonomous. The fork's
EXPEDITION tag was always a broad correlation ("non-raid field death");
the actual killing is villagerMonsterTick wild encounters + villager-agency
expeditions — and a policy-side layer cannot move villagers (assignTask
carries no destinations; the engine moves them). The layer's actionable
surface was ever only the scholar's travelTo. It displaced the scholar
(+49 travel legs, longer field days) without removing a single villager
from the killing ground — and the displacement itself cost the village
12 median days. The pantry gate (413 blocks) means the layer additionally
stands down exactly on the hungriest days, when villages are most fragile.
Scholar-side routing is a measured dead end for the 72%, the same way the
patrol line was: the price (displacement, exposure, stand-downs) exceeds
the protection because the protection never reaches the population that's
dying.

## Village assessment

The villages on this substrate die the way the fork said — of combat, not
hunger (495 combat-family vs 6 starvation on the armed side). The scholar's
expeditions got safer on paper (476 walked-around legs, honest 🧭 beats —
the d128–132 reunion arc reads like a competent player making a good call),
but the village kept dying at the same rate in the wild: wanderers,
foragers, and agency-expedition villagers meeting wave-3/4/5 monsters the
scholar never sees. Who dies: everyone, steadily — the mantle still cycles,
defenders still fall at the treeline, and now the scholar walks slightly
longer days to do it. What was missing: any villager-side answer to field
exposure — the layer could see the apexes (279 sightings) but could move
only one person. The blank filled: apex-aware expedition routing is
measured and killed. The 72% needs a villager-side answer — the
counter/trick game for wave-3+ (engine-real counterplay, unwired to the
ledger) or engine-side villager routing — not scholar routing.

## Sense-reads (SENSE-TESTING LAW)

Sense run: leadfeast-s402 armed, 150d, narration captured, expedition arcs
printed around real diversion days (tracked via the ctx counter, not the
emoji — the engine also uses 🧭 for return-from-expedition beats).

**d128–d132 arc (the reunion's ground):** the scholar is on a forage trip.
"Birds scatter in a sudden hush — something is moving out there. You give
it a wide berth." (engine evasion), then the layer's beat: "🧭 The scholar
gives the reunion's ground a wide berth — last seen here d126. The pantry
holds, so caution wins today." The scholar diverts ("Travel 3 tiles to
meadow" instead of the hot tile) and walks home. The pantry holds ~38 days,
so the diversion is affordable — the beat states the condition honestly.
That same night: "🐗 RAID — 5 raiders (Big Ugly, mosquito, Night Court, The
Reunion, Loud-Eyes) hit Haven" — the very apex the scholar avoided in the
field raids haven that night. The fiction is coherent AND scope-honest: the
layer routes field expeditions; it cannot stop haven raids (the raid
channel is untouched by design).

**Verdict:** the routing reads sensible in the fiction. The diversion beat
names the apex, cites the sighting day, states the pantry condition, and the
expedition continues to an alternate tile and comes home — no stranding, no
silence. Polish note (not a blocker): the beat uses the monster id
("the reunion's ground"); the display name ("The Reunion") would read
better.

## Metric review (§14)

The pre-registered metric did its job — no revision needed, no re-scoring.
Three notes for future arms:

1. **The 0.70 bar was ambitious for a scholar-only lever against a
   villager-majority channel** — and that is exactly what the pilot is for.
   The bar killed the arm in one pilot with no confirm spend. Pre-register
   honest bars even when the mechanism is a long shot; the kill is the
   throughput.
2. **The median-survival guardrail caught what the primary missed.** The
   primary alone (1.109, wrong direction but "close") might have tempted a
   re-tune; the −12d survival breach made the cost legible. Guardrails are
   not decoration.
3. **frPantryBlock (413) is the w3drive lesson verified in the field.**
   The gate honored the village pantry over caution — but it also means the
   layer stands down on exactly the hungriest days. A future routing arm
   should pre-register a metric for gate-fire rate vs protection delivered.

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged: the 72%
field-exposure channel stands, and scholar-side routing joins the patrol
line as a measured dead end — both attacked the channel from the wrong
population. The durable lesson: the killing is villager-autonomous
(villagerMonsterTick + agency expeditions); policy-side levers can only
move the scholar. The next arm on the 72% needs a villager-side answer
(the wave-3+ counter/trick game, or engine-side villager routing).

## Per-seed JSONs

evidence/2026-10-16/perseed-fieldroute/ (numeric wall-metric keys: won/wins/national/table/wave4/wave5/exiled as 0/1) · analyzer: scripts/analyze-fieldroute-20261016.js

## Proof artifacts

- scripts/policies/fieldroute.js — DELETED per the kill protocol (pilot
  NO-GO); the design is documented under "The layer" above for the record
- scripts/test-fieldroute-20261016.js — proof: 31/31 synthetic units RED→GREEN, SMOKE 10/10 green (live-fire apex sighting + divert), DET-GATE 4/4 trajectory-identical (FIELDROUTE unset, 40d); INFO-SKIPs every part post-kill
- scripts/sweep-fieldroute-20261016.js — the paired sweep (FFS instrument + layer)
- scripts/analyze-fieldroute-20261016.js — the gate judge
