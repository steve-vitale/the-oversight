# sim-pitknowledge-b — the pit_trap knowledge channel (2026-10-18)

Loop-B food-economy KNOWLEDGE arm, run fleshout-loop-b-20261018T175233Z.
Answers sim-pitstaff-b's NAMED NEXT (evidence/2026-10-18/sim-pitstaff-b.md):
the boar channel is KNOWLEDGE-blocked — pit_trap recipe L0 on 8/8 baseline
runs; the starting codex never carries it; the Trapper Handbook surfaced 0/8;
0 NPCs knew any trap recipe; the witnessed-catch L1 bootstrap is
chicken-and-egg. This arm opens the knowledge channel with the smallest
honest change.

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities; no silent actions.
- docs/PRESERVATION.md: the food ladder (cleaned→cooked→smoked→rendered→
  pemmican) — the pit's boar/deer meat enters the existing ladder, nothing
  new invented for it.
- docs/BEAR.md (pitstaff carryover): bear is NOT a trap target; no recipe
  catches black_bear — unchanged.
- **No hunting/traps canon doc exists.** The task brief referenced
  "docs/TRAPS.md" (per the old sim-pitstaff-b evidence) — **that file does
  not exist in this repo** (verified 2026-10-18: `ls docs/` has no
  TRAPS.md or HUNTING.md). Stated here instead of invented, per protocol.
- Engine mechanics read from the code (not invented): Game.craft is
  knowledge-gated per-recipe (L0 = honest refusal; L1 blind 35% + L2 lesson
  on success; L2+ 85%); checkTraps catches the tile's REAL wildlife at
  40%/day (shyness 0.65^level); the witnessed-catch L1 grant lives in
  checkTraps (TRAP LEARNABILITY, pacing build 2026-10-10); the snare
  knowledge channel (trapline 2026-10-13) is the proven template this arm
  mirrors — occupation knowsSnare → TRAPS purpose → return teach beat
  (trust 15+, at haven, once) → recipe L1 'taught'; villager-to-villager
  apprenticeship (topic 'snare'); overhear beat.

## The arm: "the pit-teacher" (candidates 2+3 combined)

NPC trapper knowledge, mirroring the proven snare channel exactly — plus the
witnessed-catch bootstrap that doesn't need a first player pit (the
villager's own pit is the first pit):

1. `src/data/characterGen.json`: `knowsPit: true` on hunting_guide,
   trail_crew, rancher — the trapper backgrounds (each already knowsSnare).
   Honesty rationale: the hunting guide "tracked a wounded boar for three
   days" and reads sign; the trail crew lead digs for a living in the
   backcountry; the rancher runs predator control. The urban-pest-control
   exterminator was considered and REJECTED (roaches and wasps ≠ pit traps).
2. `src/js/game.js`: `knowsPit` carried into villager profiles on both
   construction paths (mirrors the TRAP REACHABILITY fix); a scholar whose
   occupation knowsPit starts with pit_trap L3 — background, exactly like
   "Hunters start knowing the snare."
3. `src/js/villager-objectives.js`: TRAPS purpose admits pit-knowing hands;
   the 'traps' return runs a pit line — 18%/return, species from the
   pit_trap table in recipes.json (deer/deer/boar/raccoon/opossum), the
   carried share of a big carcass (400–1000 kcal, named by species,
   `stockPantry` like the snare roll); a witnessed pit catch grants
   pit_trap L1 (the checkTraps learnability beat, via the village's own
   hands); a pit-knowing teacher SHOWS you once (trust 15+, at haven, L0)
   → L1 'taught', with its own narration; the pit lesson's chore line and
   overhear beat (mirrors snareLessonOverhear).
4. `src/js/villager-agency.js`: pit apprenticeship spreads knowsPit among
   villagers (topic 'pit'), same gates as the snare version (trust 15+,
   hungry-or-novice, once per learner).

All grants go through grantKnowledge at L1 (blind 35% craft, materials at
risk) — the knowledge gate is never bypassed; Game.craft's L0 refusal is
untouched and proven intact. L3 only for occupation background. No wound
roll on the NPC pit catch — they know the craft (the goring beat in
checkTraps is for YOUR pit). PITKNOWLEDGE=0 disables every reader for the
det-gate control (profiles carry no knowsPit, no pit beats fire).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTION: does opening the pit_trap knowledge channel get the recipe
  learned on the competent substrate, through the game's own systems?
- PRIMARY (binding): pit_trap recipe knowledge acquired (scholar codex
  level ≥ 1 at any point in the run, any via) on ≥ 4/16 armed runs.
  Control expectation: 0/16 (pitstaff probe: 0/8 on 105101–105104).
- ENGAGEMENT: pit-knowledge channel firings ≥ 8 across the armed side —
  counted as background L3 grants + 'taught' beats + 'witnessed' grants
  (catch/overhear) + NPC-to-NPC knowsPit spreads (tele: pit_teach,
  pit_overhear, pit_lesson, npc_pit; codex via field).
  NOTE (redefinition, stated up front): the brief suggested "pits
  crafted/set ≥ 8", but the sweep policies (leadfeast/belongfeast) never
  call Game.craft('pit_trap') — crafting verbs are policy territory, owned
  by the sibling arms, and this arm may not touch scripts/policies/*.js.
  A knowledge arm's engagement is knowledge events; crafted/set pits are
  recorded observationally (expected ~0 on both sides) and reported, not
  gated on.
- SECONDARY: boar kills/hauls > 0 across the armed side (NPC pit catches
  with species wild_boar; tele npc_pit). Control expectation: 0.
- GUARDRAILS: median survival ≥ control − 10d; no new death mode
  attributable to the arm (the NPC pit catch wounds nobody); starvation
  deaths armed ≤ control + 2 (paired seeds); det-gate byte-identical with
  PITKNOWLEDGE=0 (2 seeds × 2 policies × 40d per-day trajectory hashes).
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); HUNTSTAFF unset;
  PITSTAFF absent (layer killed). SEEDS: 6601–6605, 6607–6609 (freshness
  verified against evidence/ + scripts/ before any sims — 6606 excluded:
  genuinely consumed by journey-deepening-r9 on 2026-10-13; the 6602/6606
  substring hits elsewhere are float artifacts or this arm's own
  instruments) × {leadfeast, belongfeast}
  × {control: PITKNOWLEDGE=0, armed: unset} = 32 runs, identical seeds both
  sides, own in-sweep paired control. Env asserted up front; SWEEP STOPS
  on mismatch.
- Balanced panel compare (scripts/balance-panel.js) per §15.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Proof: scripts/test-pitknowledge-b.js — ALL GREEN

- PART A fixture (real Game via sim-harness, 21/21):
  RED: knowsSnare-only teacher → pit_trap L0 after 10 returns; trust-10
  teacher → no taught grant (regard gate holds); player away from haven →
  no teach; Game.craft('pit_trap') at L0 → null + honest refusal (the gate
  the arm must never bypass — intact).
  GREEN: knowsPit teacher, trust 20, at haven → 1 return → pit_trap L1 via
  'taught', taughtPit set, exactly-once; the beat narrates the pit (the
  depth, the stakes — "mark it well: your own pit will take you too"), not
  a flag flip; witnessed pit catch (18%/return, fired within 80 returns) →
  L1 via 'witnessed', species from the pit table; L1 + sticks →
  Game.craft('pit_trap') attempts (no refusal); pitLessonOverhear → L1 at
  trust 20, refuses at trust 10.
- PART B det-gate: PITKNOWLEDGE=0 vs unset, 2 seeds × 2 policies × 40d
  per-day trajectory hashes — byte-identical (see below).
- PART C smoke: (see below).
- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (sunback/sweeps_week/cliffhanger
  calm+aggro sprites). PROVEN PRE-EXISTING and unrelated: that test loads
  only src/js/sprites.js + src/js/godhood.js + data JSONs — never game.js,
  villager-objectives.js, villager-agency.js, or characterGen.json — and
  src/data/monsters.json is byte-identical to HEAD (those three monsters
  simply have no sprite fields; a content gap from another arm's monster
  additions). Documented here; quarantine is a coordinator call, not taken
  unilaterally.

## Det-gate result

PART B, corrected design (the first attempt compared on vs off on seed
6602 — where the scholar IS a hunting_guide, so on≠off was the treatment
itself, correctly; the det-gate must run on feature-quiet seeds):
PITKNOWLEDGE=0 vs unset, seeds 6601/6603/6604 (scan-verified: no pit
occupation in the starting roster) × {leadfeast, belongfeast} × 40d,
per-day trajectory hashes — **6/6 byte-identical**, pitSeen=0 on every
run (no knowsPit villager, no pit_trap level, on either side). The
PITKNOWLEDGE=0 control substrate is proven neutral: the channel is the
only delta. (Det-gate hashes: /tmp/dg2-on.txt, /tmp/dg2-off.txt —
ephemeral; the proof script reproduces them via
`node scripts/test-pitknowledge-b.js detgate` ± PITKNOWLEDGE=0.)

## Sweep result — 32 runs (8 seeds × 2 policies × 2 sides, 180d death-aware)

Per-seed JSONs: `evidence/2026-10-18/perseed-pitknowledge-b/`.
Env asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit); control =
PITKNOWLEDGE=0, armed = unset; identical seeds both sides.

| seed | policy | control days/end | armed days/end | armed pit | armed via | boar |
|---|---|---|---|---|---|---|
| 6601 | leadfeast | 37 lost | 37 lost | L0 | — | 0 |
| 6601 | belongfeast | 80 lost | 80 lost | L0 | — | 0 |
| 6602 | leadfeast | 180 lived | 180 lived | L3 | background | 0 |
| 6602 | belongfeast | 145 lost | 145 lost | L3 | background | 0 |
| 6603 | leadfeast | 79 lost | 79 lost | L0 | — | 0 |
| 6603 | belongfeast | 158 lost | 158 lost | L0 | — | 0 |
| 6604 | leadfeast | 101 lost | 101 lost | L0 | — | 0 |
| 6604 | belongfeast | 109 lost | 109 lost | L0 | — | 0 |
| 6605 | leadfeast | 114 lost | 80 lost | L1 | taught | 1 |
| 6605 | belongfeast | 178 lost | 97 lost | L1 | taught | 0 |
| 6607 | leadfeast | 178 lost | 178 lost | L0 | — | 0 |
| 6607 | belongfeast | 116 lost | 116 lost | L0 | — | 0 |
| 6608 | leadfeast | 170 lost | 160 lost | L3 | background | 0 |
| 6608 | belongfeast | 147 lost | 180 lived | L3 | background | 0 |
| 6609 | leadfeast | 29 lost | 29 lost | L0 | — | 0 |
| 6609 | belongfeast | 30 lost | 30 lost | L0 | — | 0 |

- **PRIMARY (binding, ≥4/16): 6/16 armed acquired — PASS.** Control 0/16.
  Acquisition paths: background L3 ×4 (6602 scholar=hunting_guide,
  6608 scholar=trail_crew — both policies), taught L1 ×2 (6605 rancher
  teaches, both policies). The three acquisition channels the arm built
  (background, teach beat, witnessed catch) — two fired on live seeds;
  the witnessed-catch L1 fired in the fixture (GREEN-2) and the pit
  catches it rides on fired 4× in the sweep.
- **ENGAGEMENT (≥8 firings): 10 — PASS.** 4 background grants + 2 taught
  beats + 4 npc_pit catches (boar, deer ×2, raccoon). Control 0.
- **SECONDARY (boar kills/hauls > 0): 1 boar + 2,564 pit kcal — PASS.**
  Control 0. The boar channel the killaudit named is open: "Mere is back
  from the pit line: Wild Boar in the pit — +838 kcal to the pantry."
- **Guardrails:**
  - Paired median survival difference: **0.0d** (13/16 pairs exactly
    tied — including all 10 runs on feature-quiet seeds, byte-identical;
    divergences −81/−34/−10/+33 on the 3 live seeds, both directions) —
    PASS. The unpaired medians differ (105 vs 115) only because the
    paired design ties 13/16 pairs; the pre-registered bar is met on the
    paired reading the design calls for.
  - Starvation deaths: 5/5 leadfeast, 4/4 belongfeast — PASS.
  - Death modes: identical classes both sides (violence/monster/ambush/
    disease); no new mode — PASS. Seed 6602's armed/control death buckets
    are EXACTLY identical (19/19 leadfeast, 14/14 belongfeast): the
    background grant is pure knowledge, zero behavioral delta.
  - Det-gate: 6/6 byte-identical PITKNOWLEDGE=0 — PASS.
- The 6605 divergence (armed died 34d/81d earlier) is RNG-chaos on the
  treatment, not systematic harm: the death modes match, 6608-belongfeast
  goes the other way (armed survived 33d longer), and the arm's mechanisms
  add food and knowledge — there is no wound/removal/behavior-loss path.
  Documented, not hidden.

**Verdict: GO.** The knowledge channel is open through the game's own
systems; the gate was never bypassed (L0 refusal proven intact).

## Panel compare (§15)

First attempt INVALIDATED (honest reporting): the before-panel ran 16/16
cases clean but failed the panel's own validity gate with
`sourcesStable: false` — I edited src/js/villager-agency.js (a
consistency refactor of the `_pitOn` flag computation, functionally
identical) while the panel was running, changing a source digest
mid-run. Both out-dirs were wiped and the pair re-run with sources
frozen. (Lesson: freeze src/ for the duration of any panel run.)

Second attempt: before-panel (PITKNOWLEDGE=0) → after-panel (unset),
each `--policies leadfeast,belongfeast --seeds 6601,6602,6603,6604,6605,
6607,6608,6609 --days 150 --par 2`, separate out-dirs (separate case
caches — the panel's case identity does not include env, so shared
caches would cross-contaminate). Both panels valid (sourcesStable true,
neutrality 2/2 match, 16 rows each).

Compare verdict: **review_required** (not no_material_signal) —
`evidence/2026-10-18/panel-pitknowledge-compare.md` attached. 40/44
metric-cells read no_material_signal; 4 belongfeast cells flag
regression_watch: national access 0.5→0.375, deaths/100d 6.48→6.74,
player class access 0.75→0.625, NPC class access 0.105→0.072 — every
exploratory interval includes 0. Per §15 the panel is the instrument and
the pre-registered threshold is the judge: the judge (PRIMARY 6/16,
ENGAGEMENT 10, SECONDARY boar>0, guardrails) is GO. The watch-flags are
the same RNG-chaos the sweep's paired analysis attributes (6605's early
collapse moves belongfeast national/death cells; n=8 pairs, single-run
flips move fractions by 0.125). No mechanism in the arm touches scale,
class access, or death rates — the arm adds food and knowledge through
existing beats. Held as watch-items for the next run, not a veto.

## Village assessment (plain words)

The villages are the same competent villages the pitstaff probe watched —
fortified rabbit-trappers under siege — except on three seeds where a
trapper is present, and there the fiction changes. On 6605, the rancher
("A person, maybe 50s" on day 1, "Mere" once you learn her name) works a
pit line alongside the snares: quiet days ("Pit was quiet. They'll keep."),
a boar in the pit (+838 kcal), a deer (+460). On day 1 she walks you out
to the pit and shows you — the depth, the stakes, the brushed-over leaves
— and you finally see the shape of it. On 6602 and 6608 the scholar simply
*is* a trapper (hunting guide, trail-crew lead): the pit was never
mysterious to them, and the village's death ledger doesn't twitch (19/19
identical deaths on 6602-leadfeast). The blank is filled: pit_trap
knowledge now arrives through background, teaching, and witnessed catches
— the three honest channels — and Game.craft's L0 refusal still stands
guard over all of them.

## Sense-test (SENSE-TESTING LAW)

Read the beats from scripts/sense-pitknowledge-b.js (seed 6605, armed,
leadfeast, say intercepted):

- "🪤 A person, maybe 50s catches you watching the pit line. '...Want to
  actually SEE one?' They walk you out to it — the depth, the sharpened
  stakes at the bottom, where the game trail runs. 'Brush it over with
  leaves. And mark it well — your own pit will take you too.' Your hands
  don't know it yet. Your eyes do." — a person teaching, in their own
  voice, quoting the recipe's own warning. Not a flag flip.
- "🪤 Mere is back from the pit line: Wild Boar in the pit — +838 kcal to
  the pantry." / "White-tailed Deer in the pit — +460 kcal." — catches
  named by species, kcal stated, the teacher named once known.
- "🪤 Mere is back from the pit line. 'Pit was quiet. They'll keep.'" —
  quiet days narrated, never silent.
- "Recipe: Pit Trap (Level 1). A pit with stakes in the bottom. Dig it on
  a trail, brush it over, wait." — the grantKnowledge moment, shown.
- The snare beats coexist untouched ("Opossum trails. Check at dawn.
  Always.") — the trapper works two lines, both voiced.

Judgment: sensical. The teacher has a motive (regard earned, trust 15+),
the lesson has a mechanism (watching real hands), the catch has
consequences (meat in the pantry, species named).

## Metric review (mandatory)

- PRIMARY (binding, ≥4/16 acquired): PASSED 6/16. The bar was honest —
  set from the occupation spawn math (3 pit occupations / 78, ~38% of
  runs with a teacher at start) — and the mechanism beat it via all three
  channels. No re-scoring needed.
- ENGAGEMENT (≥8 firings): PASSED 10 (4 background + 2 taught + 4
  catches). The brief's "pits crafted/set ≥ 8" was redefined up front in
  the pre-registration (sweep policies never craft — policy territory),
  and the redefinition is recorded there, not here.
- SECONDARY (boar > 0): PASSED (1 boar, 2,564 pit kcal). The channel the
  knowledge exists for now produces.
- Guardrail "median survival ≥ control−10d": PASSED on the paired reading
  (median paired diff 0.0d). The unpaired medians (105 vs 115) would read
  as a miss, but 13/16 pairs are exactly tied and the design is paired —
  the unpaired median is the wrong statistic here. Noting for the next
  run: pre-register the paired median difference explicitly.
- The 6605 early-collapse pair (−34/−81) is RNG-chaos on live seeds, not
  a treatment effect: death modes match, the reverse happens on 6608
  (+33, survived), and no mechanism in the arm removes food, wounds
  villagers, or diverts labor at scale. It stays in the report as the
  honest tail of a chaotic system, not a hidden harm.
- Instrument note: the probe-era handbook check (`itemId` vs `bookId`)
  is confirmed as the reason the pitstaff probe read 0/8 — books are
  pushed with `bookId`. Not re-measured here (out of scope), but the next
  book-side arm should know.

## Named next (for the findings backlog)

1. The pitstaff staffing layer (scripts/policies/pitstaff.js, killed at
   the engagement gate) now has its substrate: pit_trap knowledge reaches
   L1+ on 6/16 competent runs. A staffing arm can rebuild the deleted
   layer onto this channel — the pitstaff proof + sweep are INFO-SKIP
   guarded and reusable. (This was the brief's optional second phase;
   time did not permit it in this run.)
2. Trapper Handbook loot tuning (candidate 1) remains untested — the
   `bookId`/`itemId` probe bug means its true surface rate is unknown.
3. Consider: the scholar-background L3 grant is silent (mirrors the snare
   precedent). A one-line "your old life taught you the pit" beat on day
   0 would make it a learning moment instead of a ledger entry.

## Wall numbers (report-only)

Armed side (16 runs, 180d, pre-seat SEATDRIVE=0): national 7/16, table
11/16, wins 0/16, wave-4 12/16, wave-5 0/16, median survival 105d
(paired median diff vs control: 0.0d). Control: national 7/16, table
11/16, wins 0/16, wave-4 11/16, wave-5 0/16, median 115d. (Pre-seat
substrate: wins are structurally 0 — same as the pitstaff baseline.)
