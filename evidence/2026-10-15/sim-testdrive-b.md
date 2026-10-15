# sim-testdrive-b — the testing drive × V1 haul synergy, measured (loop B, 2026-10-15)

## Status: PRE-REGISTERED (header written BEFORE any sims; results below as they land)

## Context — the blank

The carcasshaul arm (KILLED AT PILOT, evidence/2026-10-15/sim-carcasshaul-b.md)
proved Steve's 2026-10-13 design call MAP MEMORY + CROSS-NODE OBJECTIVES
STRUCTURALLY INERT on the natural baseline: 0/16 hauls across 2,880+
villager-days (commits 1723aae1 + belltoad-legs fix on the current tip). The
binding constraint is the KNOWLEDGE GATE — the village never learns what's
food: baseline policies never cautious-test, NPC fireside experiments opened
the gate 0–2× per 60d, zero animal corpses in 360 villager-days. The killed
arm's named next: the designed synergy — a TESTING POLICY that opens the
gate, then the landed V1 villager HAUL objectives fire — is real but
UNMEASURED. This run is that measurement.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — fixed BEFORE the pilot ran)

- **Primary metric:** villager kill→food conversion — armed median
  `villagerHaulK` (kcal deposited to the pantry via villager HAUL objectives,
  measured at the objReturnEffect deposit) per run, plus the count of runs
  with haulK > 0.
- **GO threshold (pilot gate):** armed median haulK ≥ 1,500 kcal/run AND
  haulK > 0 in ≥ 6/16 runs — the exact bar that killed V1 alone (the bar
  that GOes this synergy). §9 sniff test: visible in the raw numbers.
- **Secondary:** codex monsterFoodSafe entries opened by the testing policy
  (count + which monsters; drive-attributed via tdTestLog, engine-opened
  via foodTestedBy separately).
- **Horizon:** 180 days, death-aware (runDays stops at village-lost).
- **Seeds:** 11/22/33/44/55/66/77/88. **Policies:** leadcourt, belongseek
  (courtship roads — the natural baseline the carcasshaul pilot used).
  16 runs/side, identical seeds across sides.
- **Control:** TESTDRIVE unset (default OFF — the layer is a byte-identical
  passthrough; the proof's RED phase verifies 30d wrapped-vs-base
  identity, both policies), MAPMEM=1. **Armed:** TESTDRIVE=1, MAPMEM=1.
  Own control in the SAME sweep (CONTROL BASELINE DRIFT #247 — never
  inherit a baseline, even on identical seeds).
- **Guardrails:** median survival ≥ control − 10d; national ≥ control −
  2/16; rot per-villager-day ≤ control × 1.335 (r25b calibration); no new
  death mode (n ≥ 3). §14: a miss is NO-GO, never re-scored mid-run.

## The testing policy form (pre-registered before sims)

`scripts/policies/testdrive.js`, TESTDRIVE=1, default OFF; zero src/js changes.
`withTestDrive(base, id)` wraps leadcourt/belongseek:

- **upkeep** (post-fight-drive, pre-move): `driveLoot` — the haulCorpses
  verb (policies/haul.js): loot-as-action corpseTakeItem one at a time,
  range/weight-gated, never person/human meat, then cleanCarcass on the
  hauled carcasses when the knife allows. The "before the blood cools" beat.
- **daily** (after the day's work): `driveTest` — up to TESTS_PER_DAY=2
  cautious tests of unknown monster flesh (pack then prepStash), freshest
  spoilDay first, via the engine's own Game.testMonsterMeat (the app's
  [data-meattest] verb: look/smell/touch, smallest taste, wait; 8+12+12
  ticks; toxic flesh −30 energy + known-poison, honestly).
- **Finder:** foodKind 'meat', edible===false, plantId meat_<mid>, the part
  gated like a monster id (monsterMeatGated — covers monsters AND
  belltoad_legs), not monsterFoodSafe, not already tested (safe or poison).
  NEVER the belltoad body (poisonous — no probing).
- **Safety bounds:** NO testing when starving-critical (scholar energy <
  35 — a toxic result costs 30; a depleted tester doesn't gamble). 2/day
  cap. Tests are raw-tests — clean/cook stay separate verbs; no claim of
  cooked safety (only 'cooked' clears trichinosis, DISEASES.md). Once
  tested, never re-tested — the codex keeps it.
- **Discoveries are honest:** codex monsterFoodSafe opens only from real
  test results (foodSafeHow 'tested' + tdTestLog attribution); never
  invented. NPC fireside experiments stay engine-driven (foodTestedBy
  attribution) — the policy never fakes them.
- **What happens when the village learns:** nothing in this layer — the V1
  HAUL objectives form on their own via the engine (objPick →
  mapmemBestHaul). This arm MEASURES them (villagerHaulK at the deposit),
  never steers them.

**belltoad-legs note (#267 steve-call design extension):** the drive CAN
open codex 'belltoad_legs' via honest testing (proven in the proof's phase
c), but mapmemFoodKnown gates on 'belltoad' (the poisonous body), so
villagers still won't haul legs. The gate is NOT changed (design
extension, not a bug) — the sweep documents what the testing arm does
and doesn't reach for legs.

**Why 2/day:** the pilot showed flesh ACQUISITION is the bind (courtship
policies never loot; NPC experiments opened the gate 0–2×/60d). The drive
adds looting; the cap is a throughput multiplier on flesh that exists.
A real player could spend the afternoon on two mystery meats, not ten —
the per-test cost (32 ticks, possible −30 energy) is unchanged and honest.

## Canon read

- docs/CANON.md (first), docs/PRESERVATION.md (carcass spoil clock day+2;
  "Rot can't be smoked back into food" — freshest-first testing order),
  docs/DISEASES.md (monster-meat quirks — alien-pool effects via weirdness;
  cautious testing is the canon testing path; villagers only haul
  known-safe meat — the gate this arm opens, never breaks).

## The lever (tooling only — policy-side, zero src/js)

- scripts/policies/testdrive.js — the drive (TESTDRIVE=1, default OFF).
- scripts/test-testdrive-20261015.js — proof with REAL RED phases:
  gate-off (0 tests fired; 30d wrapped-vs-base byte-identical, both
  policies) → gate-on (cautious test fires, codex opens honestly);
  belltoad RED (body never probed) / GREEN (legs tested honestly);
  starving-critical RED (energy 20 → no test) / GREEN (energy 80 →
  tests); END-TO-END synergy (closed gate → drive test → V1 haul →
  pantry +700 kcal). SMOKE=1 instrument-honesty (no invented
  discoveries — every 'tested' codex entry attributed).
- scripts/det-gate-testdrive-20261015.js — 16/16 bit-identical per side
  (MAPMEM=1 both sides).
- scripts/testdrive-sweep-20261015.js — the pilot: 8 seeds × 2 policies ×
  2 sides, haul + drive telemetry, narration capture for the sense-test.

## Results

### Det-gate (r27 rule)

- CONTROL (drive off): 16/16 bit-identical.
- ARMED (TESTDRIVE=1): 16/16 bit-identical.
The before/after comparison is trustworthy on both sides (MAPMEM=1 both
sides). Cross-side trajectory divergences are real (the drive consumes
ticks/RNG through engine verbs), not measurement noise.

### Pilot — the synergy measured (8 seeds × {leadcourt, belongseek} × {control, armed}, 180d death-aware, MAPMEM=1 both sides)

| side | n | medDays | national | table | wins | exiled | wave45 | haulK total | haulK median | runsWithHaul | haulShare | carcassKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CONTROL (drive off) | 16 | 106d | 9/16 | 0/16 | 0 | 2 | 9/16 | 0 | 0 | 0/16 | 0% | 141.9k |
| ARMED (TESTDRIVE=1) | 16 | 93d | 5/16 | 0/16 | 0 | 2 | 6/16 | 0 | 0 | 0/16 | 0% | 117.5k |

Drive telemetry (armed): 30 cautious tests fired across 38 flesh sightings,
opening 10 species in 11/16 runs — hushwolf, white_noise_heron,
belltoad_legs, nightcourt, gallowdeer, nightlight_catfish, hummice,
glasswing, mirrormoth, lockpick_raccoon. Zero poison tests (no toxic flesh
was looted in these 16 runs — the −30 energy path and the starving-critical
bound never bound in practice). Engine (NPC fireside) opened 10 species on
11/16 control runs but only 1/16 armed runs — the drive opens the gate
faster than the NPC experiments get to it; total gate-opening is higher on
armed either way.

**PRIMARY: MISS.** Armed median haulK 0 vs GO ≥ 1,500 kcal/run;
runsWithHaul 0/16 vs GO ≥ 6/16. Per §14: NO-GO, never re-scored.

**Guardrails:** median 93d vs 106d — MISSES ≥ control−10d by 3d.
National 5/16 vs 9/16 — MISSES ≥ control−2/16. Rot/vd 205.6 vs 226.0 —
PASSES (≤ 301.7). Starvation 6 vs 10 starveDays — passes (better). No new
death mode: armed deaths are combat/villager-combat/wounds/sickness/
starvation/monster on both sides; "expedition" n=3 are monster (not
villager) deaths, thirst n=2 below the n≥3 bar.

Per-seed survival direction is mixed but leans negative (10/16 armed worse:
lc −78/−29/−35/−53, bs −76/−25/−87/−30; 6/16 better or even). The drive has
real costs — upkeep looting ticks, 32 ticks per test-day, the afternoons
spent testing instead of foraging/fighting — and zero villager-haul payoff
to offset them. Per the carcasshaul metric review, guardrails on a
zero-primary lever read cost-without-benefit, not catastrophe; the misses
are consistent with that.

### Diagnosis — the chain breaks upstream of the gate now

The carcasshaul pilot blamed the knowledge gate (0 NPC openings → 0 hauls).
This pilot proves the gate is NOT the remaining bind: the drive opened 10
species on 11/16 armed runs, the engine opened 10 species on 11/16 control
runs — and hauls still didn't fire (1 departure in 32 runs).

The single firing is instructive (armed/leadcourt/s55): the drive opened
hummice + nightlight_catfish on d30; on d31 Vasyl departed for a remembered
corpse ("The Ugly Bastard"), butchered +75 kcal ("working fast, wasting
little"), headed home — and the deposit never landed (no return beat in 80
more days; village lost d111). The synergy CAN fire end-to-end. It just
almost never gets the chance.

The refined bind, now quantified:
1. **Site formation is structurally rare.** Only the killer remembers
   (mapmemNoteKill = villager expedition kills — rare on courtship roads)
   or walkers-by (mapmemNoticeNode). 1 departure in 32 runs ≈ the
   carcasshaul pilot's 1–32 sites/60d finding, unchanged by the drive.
2. **Disjoint populations.** The drive opens species from the SCHOLAR's
   kills (driveLoot at the scholar's upkeep); villagers remember THEIR
   kills and walk-bys. The scholar's tested species and the villagers'
   remembered corpses rarely overlap — the gate opens on meat nobody
   remembers.
3. **The spoil clock (2–3d) still purges** before the rare remembered site
   is selected, and mapmemBestHaul competes against every other objective.

The knowledge gate was necessary but not sufficient. The V1 mechanism is
starved of sites, not of knowledge.

### Builder-work assessment (this arm's remaining option)

Policy-side fixes are exhausted honestly:
- The scholar cannot see villager memories, so the drive cannot target
  remembered species (that would be invented knowledge).
- The scholar telling villagers about kills would need a new game verb
  (mapmemTell is villager→villager) — a game-code design change, out of
  this arm's zero-src/js scope and Steve's-call territory.
- Making villagers remember the scholar's kills (witness memory) is a
  design change to the knowledge economy, not a policy lever.
The remaining work is game-side site formation (expedition frequency,
witness memory, walk-by radius) — filed as a design question, not built.

### Verdict

**KILL the lever at pilot (§14).** The testing drive works exactly as
designed (proof-green, 30 honest tests, 10 species opened, belltoad body
never probed, starving-critical bound proven) — but the synergy it was
built to unlock does not fire: 0/16 runs with a villager haul deposit vs
the GO bar of ≥6/16. The binding constraint moved upstream of the gate,
out of policy-side reach. Layer deleted per kill protocol; instruments
INFO-SKIP; evidence + pilot JSONs retained.

## Sense-test (SENSE-TESTING LAW)

Read the testing beats and the one haul's beats (32 runs, SMOKE=1):

- The drive's test beat reads as a person, not a robot: "You set aside
  time with the Big Ugly flesh. Look, smell, touch — then the smallest
  taste, and wait. This is how you learn without dying." The descriptor
  ("Big Ugly") is knowledge-gated — the true name never leaks
  pre-discovery. The protocol (look/smell/touch/taste/wait) is the canon
  cautious chain, narrated honestly.
- The loot beat is honest about the knowledge gate: "Nothing edible.
  (White Noise (carcass) — not food yet: A carcass. Clean it with a knife
  — quickly. Spoils fast.)" — the drive hauls the carcass "before the
  blood cools" but the UI never claims it's food.
- The one haul (s55, Vasyl): "sets out for the The Ugly Bastard.
  'Meat's meat. Back with it or not at all.'" then "butchers the The Ugly
  Bastard — working fast, wasting little. (+75 kcal of meat, heading
  home.)" The voice is right — a person working a kill. Two flaws,
  both pre-existing V1, neither this arm's: (1) "the The Ugly Bastard"
  (doubled article in the departure/butcher lines — cosmetic, filed as a
  blank); (2) the return beat never comes — the deposit is lost
  somewhere between "heading home" and the pantry (the objective likely
  died with the village at d111, but the telemetry can't say).
- Plant-test beats from the engine's own testCautiously share the
  "smallest taste" language — the TEST_LINE regex caught them; they're
  the village's parallel honest work, not the drive's. No confusion in
  attribution (tdTestLog is the drive's own).

## Village assessment

The villages lived the courtship roads as always: leadcourt reached
national 7/16 combined, belongseek 7/16. They died as they always do —
field fights (combat 194 total), wounds that wouldn't close, sickness,
the odd starvation. The scholar on armed runs spent afternoons with
mystery meat — 30 cautious tests, 10 species learned, zero poisonings —
while the village ate exactly as before: the carcass economy (117–142k
gross kcal) rotted where it fell, 0% converted by villagers on either
side. The drive made the scholar a more knowledgeable person; it did not
make the village a meat-hauling one. The wall is unmoved.

## Wall numbers

national 14/32, table 0/32, wins 0/32, wave45 15/32, median survival
~100d (control 106d / armed 93d). The scale on-ramp stands: villages
reach national on the courtship roads, the table stays at zero.

## Blanks filled / documented

- FILLED (measurement): the designed synergy — testing drive × V1 haul —
  is measured and inert at pilot scale: 0/16 runs with a villager haul
  deposit, 1 narrative haul in 32 runs (+75 kcal butchered, never
  deposited). The binding constraint is NOT the knowledge gate (the
  drive opened 10 species; the engine opened 10 on control) — it is
  site formation + the scholar-kill/villager-memory disjoint
  populations + the spoil clock.
- FILLED (instrument): the drive's verb chain is proof-green end to end
  (gate-off byte-identical, gate-on fires honestly, belltoad body never
  probed / legs tested, starving-critical bound holds, full synergy
  chain in scenario: closed gate → test → V1 haul → pantry +700 kcal).
- DOCUMENTED (design, steve-call): game-side site formation — villagers
  need witness memory of the scholar's kills, or more expedition kills,
  or a wider walk-by radius, before V1 hauls can fire at lever scale.
  Filed in sim-findings.
- DOCUMENTED (not fixed): "the The Ugly Bastard" doubled article in V1
  departure/butcher narration (cosmetic, pre-existing).
- DOCUMENTED (belltoad-legs #267): the drive opened codex 'belltoad_legs'
  honestly twice (d32, d77); mapmemFoodKnown still gates on 'belltoad',
  so legs never haul. Gate NOT changed per the task — open design
  extension stands.
- DOCUMENTED (instrument wrinkle): the drive can double-test a species
  within one daily call (finder snapshots before the first test opens
  it) — the second test is costless (engine early-outs, no ticks) but
  inflates tdTests slightly. Moot now that the layer is deleted.

## Metric review (§14)

- The GO bar (median ≥ 1,500 kcal, ≥ 6/16 runs) was the exact bar that
  killed V1 alone — reusing it for the synergy was honest, and the miss
  is clean (0 / 0/16). No re-scoring.
- The survival/national guardrail misses on a zero-primary lever read
  cost-without-benefit, per the carcasshaul pilot's review: the drive's
  real tick/energy costs bought nothing on the villager side. The
  absolute bars still fired correctly as guardrails — they caught a
  lever that costs more than it earns.
- Secondary metric (drive-opened species) GOed in spirit (10 species,
  11/16 runs) but the primary binds the run — a gate can be wide open
  with nothing walking through it. Future runs on haul-adjacent levers
  should pre-register a site-formation metric (remembered sites/run),
  not just gate-openings.

## Convergence

**food-economy: converging (unchanged).** The testing-drive × V1-haul
synergy is now a measured quantity, not an open question: the drive
works, the gate opens, the hauls don't fire — the #18 carcass-haul
blank is now a site-formation design question (steve-call), not a
knowledge-gate one. The scale wall is unmoved (national 14/32, table 0,
wins 0).
