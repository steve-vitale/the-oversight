# sim-hauldrive-b — the kill→haul drive (loop B, 2026-10-16)

ARM: sim-hauldrive-b. Finding #17 follow-up (food-economy axis). The two
predecessor runs hardened the diagnosis: 79.7% of killed-monster gross kcal
(113,130/141,950) rots ON THE CORPSE unlooted; the player hauls only ~16.6%
(23,520); player kills are 55% of gross; the revealed-valued pool is
~300/run; a pack→mouth routing arm was KILLED AT PILOT (pool ~30x below any
meaningful bar). The named next is kill→haul: haul incentives and
corpse-side discovery prompts — NOT the kitchen, NOT the pack (both
exhausted).

## PRE-REGISTRATION (written BEFORE any sims — binding per MEASUREMENT.md §§9–12, 14)

- **Primary metric:** player-hauled gross kcal share = hauledTotal /
  killedTotal (meatlastmile-lib stage attribution, gross-valued at the
  _corpseTakeStack take event). **GO: armed >= 2x control.**
  (Control ~16.6% on the meatlastmile diagnostic substrate; this run's
  control is its own paired feastscale substrate in the same sweep.)
- **Guardrails:** starvation deaths armed <= control+2; national armed >=
  control-2/16; no new death mode (n>=3); median survival armed >=
  control-10d; alien-quirk acquisitions armed <= control+2.
- **Secondary (report-only):** revealed-valued monster-meat eaten kcal/run;
  scholar hunger-days.
- **GO → land the layer. MISS → kill protocol: delete the layer, commit
  evidence + instruments only.**
- **Horizon:** 180d death-aware (+10d tail max). Reason: the kill→haul
  pipeline needs multi-carcass lifetimes + rot cycles + successions; 180d
  is the pacing-law absolute max and matches the meatlastmile/monstermeat
  substrate cadence. Dead villages stop simulating.
- **Seeds:** 171,282,393,504,615,726,837,948 × {leadcourt,belongseek} ×
  {control,armed} = 32 runs. Own paired control in the SAME sweep.
  FEASTSCALE_R13=1 both sides (feastscale courtship substrate:
  leadcourt→leadfeast, belongseek→belongfeast per the sleepin precedent).
- **ZERO src/js changes.** Policy-side layer only.
- **Det-gate:** proof test RED→GREEN before sweep spend; gate-off
  byte-identical trajectories on 2 seeds; SMOKE=1 instrument-honesty gate.
- **Convergence state:** GO → land; MISS → killed-at-pilot.

## Canon read

- docs/CANON.md (knowledge law: "if you don't know, it doesn't show"; no
  silent actions; human skills ≠ alien abilities; loot-as-action).
- docs/PRESERVATION.md: the ladder (cleaned 2d < cooked 5d < smoked 30d <
  rendered 90d < pemmican 120d); the butcher's cut is honest weight
  reduction (gross → net at the knife, bounded by the species-honest
  gross); rot can't be cleaned back into food.
- docs/DISEASES.md (mandatory): the ALIEN pool (howlbelly, gristlefit,
  croakbelly, shellgut, witness_maw, flockmind + eurika/east_nile/lemons)
  — alien meat carries quirks as min-max building blocks; the engine
  prices them at eat time (maybeMonsterWeirdness / villagerMonsterWeirdness);
  the layer never suppresses or hides the price; the guardrail counts
  acquisitions. NEVER haul meat_human (trembles — kuru/prion, 15%/meal,
  cooking does NOT kill it, no cure exists).
- BELLTOAD design (Steve 2026-10-13): legs are a separate item
  (meat_belltoad_legs, 2/3 of gross, safe) from the body meat
  (meat_belltoad, poisonous); each gates on its own codex flag
  ('belltoad_legs' vs 'belltoad') through the normal cautious-test chain.
- sim-meatlastmile-b (evidence/2026-10-15): the bind is corpse-rot at
  79.7%; player kills 55% of gross; the only live onward path is the
  player haul (16.6%); the specialist butcher path never fired;
  markMonsterFoodSafe grants 40%-of-gross kcalEach to pack/stash meat
  (the reveal is a value step, engine convention).
- sim-monstermeat-b (evidence/2026-10-15): pack→mouth routing KILLED AT
  PILOT — the revealed pool (~300/run) is ~30x below any meaningful bar;
  the donation beat never fired; metric-review lesson: pre-register bars
  as multiples of the pool/control, not absolute kcal figures. This run's
  2x-control bar follows that lesson.
- sim-carcasshaul-b (evidence/2026-10-15): the V1 villager map-memory haul
  mechanism proved INERT (0/16 hauls) — the knowledge gate never opens on
  the baseline (policies never cautious-test). This arm is the PLAYER-side
  complement: the scholar hauls their own kills AND runs the cautious test
  that opens the gate. Game-code regions untouched (carcasshaul's lanes).

## The lever (policy-side, scripts/policies/hauldrive.js)

`withHaulDrive(base, id)` — HAULDRIVE=1 opt-in (default OFF; gate-off
delegates byte-identically, det-gate pinned). Chains the base
upkeep/daily/fight (never clobbers per #119). Four beats:

1. **freshHaul (upkeep, post-fight):** at fresh in-range monster corpses,
   haul REVEALED-EDIBLE monster meat via the honest verb
   (Game.corpseLootAll with a knowledge-gated skipFn), up to pack capacity
   (the verb's own canCarry gate — overweight stacks ride honestly).
   Fire checks are pure reads (state.corpses direct, coordinate range,
   codex foodSafe) — no Game call that mutates runs before the fire
   decision (the monstermeat nearFire lesson). Every fire narrates
   (the verb narrates takes; the layer adds the why-line).
2. **cleanOnSite (upkeep, after freshHaul):** if the beat hauled
   carcass-state meat and the scholar has a cutting tool,
   Game.cleanCarcass() — the butcher's cut, honest gross→net weight
   reduction, before leaving the kill site. Knifeless → one honest skip
   line/day (the prompt, not silence).
3. **sampleUnknown (upkeep, when freshHaul took nothing):** the corpse-side
   discovery prompt. At a fresh in-range corpse with unknown monster meat
   of an untested species, take ONE carcass for the cautious test — only
   if the pack holds no untested sample (never stockpile, never vacuum).
   Narrated ("Knowledge first, appetite later.").
4. **cautiousTest (daily):** one unknown flesh per day via meatseek's
   testUnknownMeat (the honest 1/day pace, 32-tick afternoon, toxic flesh
   pays the real price) — runs the designed protocol on the sampled (or
   base-looted) flesh, opening the knowledge gate the haul beat respects.

**Pre-pilot design refinement (documented, not hidden):** the 4-run sanity
subset (seeds 171/282 × leadcourt) showed hdHauled=0 — the freshHaul beat
never fired because the revealed pool was ~1 species/run (the base looter
brings almost no unknown meat home for the test to find; tests=1 in 180d).
The sampleUnknown beat was added to close the loop at the corpse: the
scholar samples unknown flesh where it falls, tests it that evening, and
hauls that species freely thereafter. This is "unknown flesh respects the
cautious-test path" (not "or is skipped") — one sample for the designed
protocol, never a vacuum. The 4 sanity runs were discarded; the proof test
was extended (22/22) and the sanity re-run with the four-beat layer.

Knowledge law: auto-haul revealed-edible species ONLY —
Game.monsterFoodSafe(mid) (belltoad legs gate on 'belltoad_legs', body on
'belltoad'). Unknown flesh is NEVER vacuumed — one sample for the test, or
it stays for the cautious-test path or rots honestly. NEVER meat_human
(trembles). The layer never eats, never reveals, never suppresses the
alien-quirk price at eat time — the guardrail counts acquisitions.

## Proof (scripts/test-hauldrive-20261016.js — 22/22 GREEN)

- RED phases: every beat is a pure no-op with the gate unset.
- GREEN: fixtures — fresh corpse with revealed species → meat hauled
  (ctx.hdHauled counts); unknown flesh → untouched by freshHaul; meat_human
  → untouched; clean on-site fires after a haul with knife (edible:true,
  real kcalEach via carcassToMeat's knowledge reveal); knifeless → honest
  once/day skip, no clean; sampleUnknown takes ONE unknown carcass for the
  test (no stockpiling while a sample awaits testing; poison-tested species
  never re-sampled); cautious test opens the gate (1/day) via the wrapped
  daily.
- Det-gate: gate-OFF wrapped vs pristine leadfeast/belongfeast
  byte-identical on 2 seeds × 30d.
- Zero-firing purity: gate-ON with no revealed meat byte-identical to
  gate-OFF (the monstermeat lesson — fire checks must not diverge).
- SMOKE: layerOn() === (HAULDRIVE==='1') honest.

## Results (pilot — 32/32 runs, 2026-10-16)

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| hauled share (hauled/killed) | 7.8% (57.5k/738.9k) | 12.8% (78.8k/617.2k) | armed ≥ 2× control = ≥15.6% | **MISS** (1.64×) |
| hdHauled (freshHaul items) | — | 5 total | — | barely fired |
| hdCleaned (on-site cleans) | — | 5 total | — | — |
| hdSampled (discovery samples) | — | 27 total | — | fires consistently |
| meatTests (cautious tests) | 0 | 42 total | — | the discovery loop works |
| reveals | — | 35 | — | — |
| starvation deaths | 0 | 3 | ≤ control+2 = ≤2 | **MISS** |
| national | 10/16 | 10/16 | ≥ control−2 = ≥8 | GO |
| median survival | 135d | 148d | ≥ control−10d = ≥125d | GO |
| alien quirks | 7 | 5 | ≤ control+2 = ≤9 | GO |
| new death mode | — | starvation (n=3) | none | **MISS** |
| eaten kcal/run (secondary) | 134 | 229 | report-only | — |
| hunger-days (secondary) | 169 | 195 | report-only | — |

The discovery loop works (27 samples → 42 tests → 35 reveals), but the
HAUL loop barely fires: freshHaul took 5 items across 16 runs (2 runs:
s393×1, s837×4). The revealed species are almost never re-killed in range —
monster kills are diverse, not repeated. The 1.64× share gain comes from
the samples themselves (via _corpseTakeStack) plus base-looter variance,
not from the designed freshHaul beat.

Wall numbers: control national 10/16 table 13/16 wins 0 wave45 12/16
medDays 135d; armed national 10/16 table 15/16 wins 0 wave45 15/16
medDays 148d. No wave-5 unlocks beyond the substrate's reach.

## GO/NO-GO

**NO-GO — KILLED AT PILOT per the binding pre-registration.** The PRIMARY
missed (12.8% vs the ≥15.6% bar — 1.64×, not 2×), and two guardrails
missed: starvation deaths 3 vs ≤2, and starvation as a new death mode
(n=3 on armed, 0 on control). Per §14: a miss is NO-GO, never re-scored.
The layer is deleted per kill protocol; evidence + instruments committed.

## Village assessment

The villages on the feastscale courtship substrate live and die as they
always do: combat (751), villager combat (251), monster (178) dominate;
expeditions, contests, and the named horrors take the rest. Zero wins,
national 20/32, table 28/32 — the scale wall stands (national reached,
table reachable, wins not).

The armed villages are not starving for lack of trying — they eat MORE
monster meat (229 vs 134 kcal/run) and live LONGER (148d vs 135d median).
But three scholars starved on the armed side (belongseek s615×1,
s948×2) where none did on control. The mechanism: the cautious test costs
32 ticks (an afternoon); on belongseek — the leaner road, with lower
baseline haulShare — a hungry scholar spending the afternoon testing
instead of foraging can tip over. The test runs after the base daily
(which eats first), but the time cost is real on the margin. This is not
a broken mechanic, but it is a real harm signal on a lever that doesn't
move its primary — the kill is clean.

The discovery loop is the arm's one working subsystem: scholars sample
strange flesh where it falls ("Knowledge first, appetite later."),
test it that evening, and the village learns. 35 species revealed across
16 runs. But the haul loop it feeds almost never fires — the village
learns what's food, then never kills it again in reach. The knowledge is
real; the kcal are not.

## Sense-test (transcripts)

The beats read like a person, not a robot. The sample beat:
"You don't know this flesh. You take a piece to test cautiously — the rest
stays where it lies. Knowledge first, appetite later." / "Strange meat. One
strip rides with you for the cautious test; the carcass keeps the rest.
You'll know by tomorrow." The haul beat (4 firings on the best run):
"Known meat doesn't stay on the ground. Into the pack — quickly, before it
turns." / "You've eaten this before and lived. The pack is the right place
for it, not the dirt." / "Waste is the real enemy out here. The meat rides
with you." The clean beat: "Cleaned at the kill site — the butcher's cut is
honest weight, and the walk home is lighter." No refusal spam, no robotic
repetition (lines rotate deterministically). The voice is right; the
opportunity is what's missing — 5 haul firings in 16 runs is a whisper,
not a drive.

## Reachability verdict

Not applicable to this arm — a policy routing layer changes no content
gates. Wave/arc/national reach matches the substrate (maxWave 5 observed
both sides, national 20/32, table 28/32); nothing regressed, nothing
unlocked. The armed side's wave45 edge (15/16 vs 12/16) is within noise
on an inert haul loop.

## Blanks filled / documented

1. **DOCUMENTED (not filled): the kill→haul bind, refined.** The
   meatlastmile diagnostic named corpse-rot (79.7%) as the bind and this
   arm as the kill→haul fix. The pilot shows the bind is actually TWO
   binds: (a) meat never leaves the corpse (confirmed), and (b) the
   knowledge gate can't be opened fast enough to matter — monster kills
   are diverse, not repeated, so revealed species are rarely re-killed in
   range. Even a working discovery loop (35 reveals) feeds a haul loop
   that fires 5× in 16 runs. A future arm must either haul unrevealed
   meat (violates the knowledge law — Steve's call) or find a different
   on-ramp (e.g., the villager haul path, or hauling at the moment of the
   kill rather than at upkeep).
2. **DOCUMENTED: the cautious-test time cost.** 32 ticks/day on a hungry
   scholar is a real starvation risk on lean roads (3 deaths on armed,
   0 on control). Any future testing policy should gate the test on
   hunger (skip when kcal < 500) or move it before the foraging beat.
3. **DOCUMENTED: the sample beat works.** 27 samples, 42 tests, 35
   reveals — the corpse-side discovery prompt is a functioning mechanic.
   It just doesn't move the haul needle. If a future design wants
   discovery without hauling, the beat is proven (but it ships with the
   starvation caveat above).
4. Finding #17 (revealed monster meat rots uneaten) stays OPEN. This arm
   plus meatlastmile plus monstermeat-b now bound it on three sides:
   the meat rots on the corpse (79.7%), the pack pool is tiny (~300/run),
   and the kill→haul bridge can't be built on revealed-meat alone.

## Convergence

**killed-at-pilot.** The kill→haul direction via revealed-edible auto-haul
is exhausted on this substrate — the discovery loop works but the haul
loop can't fire (kills don't repeat). The food-economy axis stays
converging; the scale wall is unmoved.

## Metric review

1. **The 2× bar behaved as designed** — unlike the monstermeat arm's
   absolute-kcal bar (30× the pool), the relative bar gave the layer a
   fair shot. It missed at 1.64×. The bar was honest; the mechanism was
   short.
2. **The starvation guardrail fired correctly.** 3 vs ≤2 is a real miss,
   and the new-death-mode rule caught it independently. The layer's time
   cost is the likely cause (see Blanks #2). Guardrails on a
   barely-firing lever still matter — a whisper that harms is worse than
   silence.
3. **Pilot completeness: 32/32.** No timeouts, no missing runs. The
   verdict is on the full pre-registered pilot.
4. **Pre-pilot design refinement (sampleUnknown) was handled cleanly:**
   the 4-run sanity showed hdHauled=0 with the three-beat layer; the
   sample beat was added before the pilot (documented in "The lever"
   above); the proof test was extended (22/22); the sanity was re-run.
   No hidden state in the verdict.
