# Trapline arm — sim-trapline-20261013 (flesh-out loop A, 2026-10-13)

## Pre-registered header (docs/MEASUREMENT.md §§9-12)

- **Primary metric:** NPC trapline activity (`npc_trap` return events via
  telemetry) + knower counts; player trap counters (`trapsCrafted` /
  `trapsSet`) and snare recipe level.
- **GO thresholds:**
  - Arm SEED (data): population-level — dead-cast rate drops on a 40-cast
    scan; no survival delta on the 8 pilot seeds.
  - Arm APPRENTICE (code): npc_trap events up vs telemetry baseline;
    ≥1 apprentice lesson observed or knower growth; no survival regression.
- **Regression gate:** median survival within ±10d of baseline.
- **Horizon:** 150d death-aware (Game.over stops the run; dead villages stop
  simulating — never a fixed 200d).
- **Seeds:** 11, 22, 33, 44 × belongseek/leadcourt (8 runs/side); confirm
  55, 66, 77, 88, 99, 110, 121, 132 × belongseek/leadcourt (16 runs/side).
- **Policies:** belongseek, leadcourt (competent-based — they work the
  trapline when the recipe is known).
- **Convergence:** converging → landed. (Would have been killed-at-pilot on
  GO failure.)

## The gap (traced, not assumed)

The finding: 0 traps crafted/set in 12/12 establishment sims, player and NPC.
Tracing the exact gates:

1. **NPC TRAPS objective** (`villager-objectives.js:163`): `if
   (vp.knowsSnare)` only. `knowsSnare` comes from the occupation
   (`occ.knowsSnare`, 5 of 55 occupations) at profile gen (`game.js:869-872`)
   and seed hydration (`game.js:1152`). **No villager could ever gain it
   during a run** — the teach chore (`agencyTeachVillager`) only taught
   plants; the snare teach beat (`objReturnEffect`, :814) taught only the
   player. When the wire-holders died (they always did — knowers 2→0, 1→0 in
   every pilot run), the NPC trapline died with them, permanently.
2. **Player craft** (`game.js:2842`): needs `codex.recipes.snare.level ≥ 1`
   (L1 = blind 35% craft, materials at risk; a successful blind craft teaches
   L2). `setTrap` needs a crafted tool OR `snare_wire` — but `snare_wire`
   exists in `items.json` with **zero sources in the world**, so the
   honest-tackle path (Steve 2026-10-05) was unreachable.
3. **Player learning paths:** occupation knowsSnare → L3 at start
   (`game.js:2253`); taught by a knowsSnare villager at trust 15+ on a
   witnessed TRAPS return (`villager-objectives.js:814`, once per villager —
   this one WORKS: 6/8 pilot runs reached L1); witnessed own-trap catch → L1
   (`game.js:3148` — chicken-and-egg without wire/tool); Trapper's Handbook
   (ruins, implemented); `knowledge.json`'s `snare_wire` skill lists
   backgrounds trapper/hunter/soldier/poacher — occupation ids that **don't
   exist** in characterGen, and its `make_snare` unlock maps to **nothing**.
   Two more dangling wires (documented, not chased — out of scope).
4. **Measurement correction:** the establishment sims' MET counters were
   player-policy ctx counters — NPC trap returns were never instrumented, so
   the "NPC 0" half of the finding was partly a measurement gap. The
   `npc_trap` telemetry added here (zero gameplay effect) shows the NPC
   trapline DOES fire when knowers live (18 events / 8 pilot runs) — then
   dies with them.

## The fix (two arms, non-overlapping)

**Arm SEED** (`src/data/characterGen.json`): widen who can seed the wire —
`soldier` (canon: `knowledge.json` snare_wire backgrounds), `farmer`
(rabbit snaring is classic farm pest control), `exterminator`
(professional small-animal trapper), `pilot` (bush-pilot trapline
bushcraft) join the 5 snare occupations → 9/55. This also ignites the
player side (occupation → recipe L3 at start, `game.js:2253`). Traps are
not free or cheap: the craft economy (vine + stick, blind 35% at L1) is
untouched.

**Arm APPRENTICE** (`src/js/villager-agency.js`,
`src/js/villager-objectives.js`): a knowsSnare villager can take a snare
apprentice through the honest teach chore — word of mouth is the canon
pre-codex channel. Same regard gate as the player beat (trust 15+;
strangers don't hand over their craft), once per learner, need-driven
(hungry or novice learner), 85% landing, recorded in `lessons` with a
`taught` deed. A player at haven who has earned the teacher's regard
overhears the lesson and gains recipe L1 (seen — never L2; hands learn by
doing). Plus `npc_trap` telemetry (measurement infrastructure).

Design question considered and answered: "widening who can seed the wire"
was the ignition; "attempt-based learning" already exists (blind L1 craft
→ L2 on success; witnessed catch → L1). The missing piece was never the
player's on-ramp — it was that the wire died with its holders.

## Proof test (RED honesty)

`scripts/test-trapline-20261013.js` — 11 checks. RED phase on the pristine
tree: 7 failed (E2 ×4: new occupations lack knowsSnare; E3 ×2: no
villager→villager wire transfer; E4: no `snareLessonOverhear`). After the
fix: **11/11 pass**. E1 documents the gap (seed 44: 0 knowers — dead cast).

## Before/after (identical seeds)

Measurement: `scripts/trapline-pilot-20261013.js` (8 pilot + 16 confirm
runs/side; per-seed JSONs alongside this note for the telemetry check).

**Arm SEED** — 40-cast scan (genRoster+newGame, no 150d):
- pristine: dead-cast rate **27.5%** (11/40), mean knowers 1.00
- with SEED: dead-cast rate **10.0%** (4/40), mean knowers **1.70**
- 8 pilot seeds: no cast drew the 4 new occupations → trajectories
  byte-identical, survival median 86.5 → 86.5 (zero regression).
- **GO.**

**Arm APPRENTICE** — pilot (8) then confirm (16):
- npc_trap events: 18 → 29 (pilot), **7 → 59 (confirm)**; catches 8→12 /
  2→25. Seed 22 leadcourt: 0→13 events with knowers 1→**2** (an apprentice
  learned — 2 `snare_lesson` events). Seed 132 leadcourt: 0→43 events,
  survival 74→125d.
- Median survival: 86.5 → 75 (pilot, −11.5 — noise on n=8, two leadcourt
  long-runs diverged); **94.5 → 98 (confirm-16, +3.5 — inside the ±10d
  gate)**. The pilot dip was investigated: deaths were wave-1 combat +
  starvation, the usual mix — no trap-specific death mechanism.
- Player: taught L1 on 6/8 both sides (existing beat works); player crafts
  stayed 0 — the policy needs 3 vine + 3 stick for a blind L1 craft and
  never held both (materials bottleneck, out of this arm's scope, noted
  below). Overhear never fired in 24 runs (trust-15 + chore rarity) —
  kept as a tested unit-level path; the TRAPS-return beat remains the
  player's live on-ramp.
- **GO.**

**Combined** (8 pilot seeds): npcTrap 18→29, lessons 2, survival 75
(same pilot noise; confirm-16 is the survival verdict).

## Sense test

From after-apprentice-t seed 33 (player at haven):
> 📖 the man in his 50s, with a missing fingertip is showing the woman in
> her 50s the snare — the loop, the trigger stick, where the run narrows
> between the roots. "Opossum trails. Check at dawn. Always."
> Recipe: Snare (Level 1). You have seen a snare. A loop, a stick, an animal.
> 🪤 You watch the man in his 50s, with a missing fingertip walk someone
> through the snare — the loop, the trigger stick, where the run narrows
> between the roots. Your hands don't know it yet. Your eyes do.

Reads like a person learning: physical, specific, knowledge-gated (the
player reads descriptors, never names). The NPC return beat
("🪤 …is back from the snares: +225 kcal to the pantry") stays honest
about empty vs full lines.

## Village assessment

The village finally runs a trapline that outlives its founders: wire
knowledge now travels by mouth instead of dying with the hunter. On seed
22 the apprentice's 13 trap returns were the difference between a silent
wire and a working line; on seed 132 the surviving trapper's 43 returns
carried the village to day 125. Dead casts (seed 44: programmer scholar,
0 knowers) still never ignite under APPRENTICE alone — SEED makes those
casts rarer (27.5% → 10%), it doesn't eliminate them. The player side
remains gated on materials, not knowledge — a competent L1 trapper who
can't hold 3 vine + 3 stick is the next blank (see findings).

## Blanks filled / documented

- **Filled:** villagers can now learn the wire (apprenticeship); 4 more
  occupations seed it; NPC trap returns instrumented (`npc_trap`).
- **Documented (findings backlog):**
  - `ambientSocial`'s "showing X how to tie a snare… three tries" flavor
    line fires in casts where NOBODY knows the wire (seed 44) — theater,
    claims teaching that never happened. (Appended as [open].)
  - Player blind-craft materials gate (3 vine + 3 stick) means L1 trappers
    never craft in sims — the player trapline's next bottleneck.
  - `knowledge.json` snare_wire: dead occupation ids + unmapped
    `make_snare` unlock; `snare_wire` item has no world source (the
    honest-tackle path is unreachable).
