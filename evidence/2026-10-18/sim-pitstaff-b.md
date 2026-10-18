# sim-pitstaff-b — pit-trap staffing layer (2026-10-18)

Loop-B food-economy arm, run fleshout-loop-b-20261018T1530Z. Answers the
kill-side audit's NAMED NEXT #1 (evidence/2026-10-18/sim-killaudit-b.md):
staff the pit_trap (the only boar trap) that the competent policy never
crafts (pit_trap 0/8 runs in the audit).

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities; no silent actions.
- docs/BEAR.md: separable fat bear 6 / boar 3 / javelina 2 slabs (~20% of
  gross); bear is a non-monster monster FIGHT (bow > spear > knife > bare
  hands; maul 8-17 at range ≤ 2) — bear is NOT a trap target; render/pemmican
  are L4 deep knowledge.
- **No hunting/traps canon doc exists** (docs/ has no HUNTING.md or
  TRAPS.md). The trap species table lives in src/data/recipes.json:
  snare catches rabbit/squirrel/opossum; pit_trap catches
  deer/deer/BOAR/raccoon/opossum — the only boar trap; NO recipe catches
  black_bear. Stated here instead of invented.
- Engine mechanics read from the code (not invented): Game.craft is
  knowledge-gated per-recipe (L0 = honest refusal "You don't know how to
  make a Pit Trap yet"; L1 blind 35% + L2 lesson on success; L2+ 85%);
  checkTraps catches the tile's REAL wildlife at 40%/day (shyness
  0.65^level); pit uses=4; setting a pit costs 96 ticks ("labor to dig");
  boar retrieval is a real beat (L3 pit readers spear from above: 10%
  goring 5-10 dmg; careless climb-down: 35% goring 12-20 dmg).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTION: does staffing pit traps produce boar kills and boar-kcal
  reaching the pantry?
- PRIMARY (binding): boar kills armed >= 4 across the armed side AND
  boar-meat pantry arrivals >= 5,000 kcal (control expected 0 — the
  killaudit measured 0/1281 run-days).
- ENGAGEMENT (kill-fast): pit traps armed+set >= 16 across the armed side
  (the layer must engage). If 0 traps armed at pilot, KILL — never run 16
  seeds on an invisible effect.
- GUARDRAILS: trap-duty deaths <= control+2; median survival >=
  control-10d; no new death mode; det-gate byte-identical gate-off.
- HORIZON: 180d death-aware. SUBSTRATE: FEASTSCALE_R13=1; SEATDRIVE=0
  EXPLICIT; HUNTSTAFF unset (default OFF) both sides. SEEDS: 105101-105104
  (the killaudit's clean baseline) + 4 fresh verified-unused x
  {leadfeast,belongfeast} x {control,armed}, own in-sweep paired control,
  identical seeds. (Fresh seeds 105201-105204 checked against all
  evidence/ seed lists 2026-10-16..18 before any sims: 105201/105202/
  105203 zero matches; 105204 one substring match — a float artifact
  (`25.271998341052047` in evidence/2026-10-17/feastvoice-b-beats/
  leadfeast-s6107.json), not a seed usage. None of the four were ever
  consumed — the full pilot never ran.)
- Balanced panel compare (scripts/balance-panel.js) per §15.
- DEATH INSTRUMENTS: capture death tele KIND and filter to
  person/villager before judging (lesson #525); snapshot v.taskLeads
  alongside any assignTask wrap (lesson #528).
- A miss is NO-GO, never re-scored mid-run.

## The layer (built per the audit's named spec, then killed)

scripts/policies/pitstaff.js (PITSTAFF=1, default OFF; wraps
leadfeast/belongfeast's upkeep+daily; zero src/js changes):
- staffPit fires in the wrapper's daily BEFORE the base daily (dawn craft
  at Haven rides the day's forage outing — workTraplineSet sets the first
  held trap), once per day, on LEAN days only (pantryFreshDays < 4 or
  scholar kcal < 50% cap / < 500 — the huntstaff lean definition), scholar
  at Haven, not recovering (competent.recovering), snare knowledge L1+
  (the audit spec's gate), pit line (held + tile-set) < 2, materials
  (L2+: 2 sticks; blind L1: 6 sticks — mirrors workTrapline's blind band).
- The engine's own Game.craft('pit_trap') applies the pit recipe's
  knowledge gate and costs; engine refusal = honest miss, no count.
- Telemetry: ctx._psCrafted + ctx._psCraftLog, written only when the
  layer fires; gate-off = zero writes.

## Proof: scripts/test-pitstaff-b.js — ALL GREEN on current master

- PART A fixture (RED/GREEN): 19/19 — gate-off → null + craft never
  attempted + ctx untouched (RED exact); gate-on fires exactly once when
  all gates pass; once-per-day; lean/haven/snare-L1/pit-L0/line-full/
  materials-blind-band/engine-refusal/recovering gates each refuse
  honestly; the fired craft lands the tool in the trapline queue.
- PART B det-gate: wrapped PITSTAFF-unset vs unwrapped base, 2 seeds x 2
  policies x 60d per-day trajectory hashes — 4/4 byte-identical, 0
  substrate-noise, 0 layer-attributable.
- PART C smoke: layerOn() true/false.
- Post-kill the script degrades to INFO-SKIP (layer absent), same pattern
  as test-huntstaff-b4.

## The decisive probe (BEFORE the pilot spend)

scripts/probe-pitknowledge.js — 8 runs x 180d on the exact baseline
seeds/policies (105101-105104 x leadfeast/belongfeast, FEASTSCALE_R13=1,
SEATDRIVE=0):

| run | days | snare L | pit_trap L | pit held | pit set | handbook |
|---|---|---|---|---|---|---|
| leadfeast-105101 | 82 | 3 | 0 | 0 | 0 | 0 |
| leadfeast-105102 | 151 | 0 | 0 | 0 | 0 | 0 |
| leadfeast-105103 | 180 | 0 | 0 | 0 | 0 | 0 |
| leadfeast-105104 | 180 | 2 | 0 | 0 | 0 | 0 |
| belongfeast-105101 | 180 | 3 | 0 | 0 | 0 | 0 |
| belongfeast-105102 | 148 | 1 | 0 | 0 | 0 | 0 |
| belongfeast-105103 | 180 | 0 | 0 | 0 | 0 | 0 |
| belongfeast-105104 | 180 | 1 | 0 | 0 | 0 | 0 |

**pit_trap knowledge is L0 on 8/8 runs.** Game.craft('pit_trap') refuses
honestly at L0 — the layer's pitL<1 pre-check fires first, every day,
every run. The knowledge-acquisition channels are all dead:
- starting codex (seed 105101: cloth/snare/stone_knife/water_filter L3;
  105102: no snare): never carries pit_trap.
- NPC teachers: 0 villagers with any trap recipe knowledge (both seeds).
- Trapper Handbook (src/data/books.json — the only item unlocking
  pit_trap): 0/8 scholar inventories over 180d.
- witnessed-catch L1 bootstrap (checkTraps grants the trap's L1 on its
  first witnessed catch): chicken-and-egg — no pit is ever set, so no pit
  catch is ever witnessed.

The audit's named spec ("craft pit_trap when lean-day + snare knowledge
L1+") assumed craftability the substrate doesn't provide — its
"pit->boar carcass fixture" hand-placed the trap object and never passed
Game.craft's knowledge gate.

## Pilot: PITSTAFF=1 armed smoke (2 seeds x 60d)

scripts/sweep-pitstaff-b.js with SEEDS=105101,105102 POLICIES=leadfeast
ARMS=armed DAYS=60 (same policy object both arms; the only delta is the
env var):

| run | days | pitCrafts | pitsSet | boarKills | boarMeatKcal | fatSlabs | pitL |
|---|---|---|---|---|---|---|---|
| leadfeast-armed-105101 | 60 | 0 | 0 | 0 | 0 | 0 | 0 |
| leadfeast-armed-105102 | 60 | 0 | 0 | 0 | 0 | 0 | 0 |

ENGAGEMENT: 0 traps armed (bar >= 16; kill-fast rule: 0 → KILL).
PRIMARY: 0 boar kills (bar >= 4), 0 boar-meat kcal (bar >= 5,000).
The layer engaged zero times — by construction, not by luck: the
knowledge gate refuses before any lean-day/sticks/line logic is reached.
Running the full 16-run pilot would burn sim hours re-measuring a zero
the probe already measured on the identical seeds.

## Verdict: KILLED at the engagement gate (kill-fast)

The layer is correct per spec and fully proven (19/19 + det-gate 4/4
byte-identical), but the substrate defeats it one layer deeper than the
killaudit's staffing attribution: **the boar channel is gated on
knowledge, not labor.** scripts/policies/pitstaff.js deleted zero-trace
per kill protocol. Instruments + evidence land:
scripts/test-pitstaff-b.js, scripts/sweep-pitstaff-b.js,
scripts/probe-pitknowledge.js (all INFO-SKIP-guarded), this file,
evidence/2026-10-18/perseed-pitstaff-b/ (2 pilot JSONs + probe JSON).

§15 balanced panel: N/A — the lever never engaged, so no before/after
exists (same class as the killaudit diagnostic). The det-gate (PART B,
4/4 byte-identical gate-off) is the neutrality proof.

Convergence state: **killed-at-pilot**.

## Guardrails (as far as they apply)

- Trap-duty deaths: 0 armed / 0 control (the layer never fired — nothing
  to attribute). The "new death modes" line in the pilot summary is a
  no-control artifact (starvation/combat/monster are the corpus's normal
  modes, per the killaudit's 119-death profile).
- Median survival: 60d/60d (both runs alive at the 60d pilot horizon —
  horizon-capped, not a survival signal).
- No new death mode attributable to the layer (it never acted).
- Det-gate byte-identical gate-off: PROVEN (PART B 4/4).

## Wall numbers (report-only)

- Armed pilot (60d, 2 runs): national 0/2, table 0/2, wins 0/2, wave-4
  1/2, wave-5 0/2, median survival 60d (horizon-capped).
- Killaudit baseline corpus (context, 8 runs 180d): national 6/8, table
  7/8, wins 0/8, wave-4 7/8, wave-5 0/8.
- TELEMETRY: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-10-18/perseed-pitstaff-b/*.json' --metrics
  national,table,wins,exiled` fired 3 LOUD lines (national/table/wins
  disappeared: baseline 12/16/16 → current 0). REGIME ARTIFACT, not a
  game regression: the baseline is now labeled `_regime: winseat —
  full win-side win stack, ~100%-win suite — DO NOT compare pre-seat /
  courtship substrates` (loop A, 2026-10-18); my files are a 60d
  armed-only pilot where wins are structurally 0. NOT rolled.

## Village assessment (plain words)

The villages are the killaudit's villages, unchanged: fortified
rabbit-trappers under siege. The snare line works — catches named with
kcal and rot warnings — while boar root in the thickets three tiles from
Haven every day and nobody digs a pit, because nobody knows the shape of
one. The knowledge ledger is the blank, not the labor ledger: the
starting scholar knows cloth, snare, stone_knife, water_filter; the
Trapper Handbook never surfaces in 8 long runs; no villager can teach
the pit; and the witnessed-catch bootstrap can't fire without a first
pit. This is a village that has forgotten — or never learned — the pit,
and no staffing policy can staff a verb the village doesn't know. The
blank I documented (not filled): pit_trap knowledge acquisition is dead
on the competent substrate. The blank I filled: none — the layer was
killed per the pre-registered kill-fast rule.

## Sense-test (SENSE-TESTING LAW)

- Read 1 (pilot corpus, PITSTAFF=1): true pit/boar narration beats — 0
  across both runs (the regex's 26/15 raw hits were substring false
  positives: "boar" ⊂ "boards", "pit" ⊂ "Airtight"). The absence IS the
  finding: with the layer armed, the fiction never mentions a pit.
- Read 2 (engine refusal, fixture ok 11): the layer never spams the
  honest refusal — a design choice worth naming: at pit L0 the village
  doesn't even *try* the pit, which reads as genuine ignorance, not a
  disabled button. Sensical.
- Read 3 (killaudit carryover): the snare-line narration was judged
  sensical there ("This ground has learned your trap. Rest it, or move
  the line"); nothing in this arm changes it — the layer never fired.

## Metric review (mandatory)

- ENGAGEMENT (kill-fast: >= 16 pits armed+set, KILL if 0): MISSED as
  framed — 0 armed on the 2-seed armed pilot, 0 craftable on the 8-run
  probe. The miss is not a measurement artifact: the mechanism (knowledge
  gate) refuses before any stochastic step. No re-scoring; the kill
  stands.
- PRIMARY (>= 4 boar kills AND >= 5,000 boar-meat kcal): unmeasurable —
  the engagement gate fired first, per the pre-registered kill-fast
  order. The bar was honest (the audit's fixture proved the catch
  machinery works when armed).
- The audit's named spec is revised by this run, not the metric: its GO
  bar (>= 4 boar catches + >= 12 fat slabs) assumed Game.craft would
  succeed on snare-L1+ villages. The probe shows pit_trap L0 on 8/8 —
  the spec's knowledge premise was untested. Future staffing specs must
  assert the recipe's own level, not a proxy recipe's.
- Instrument note: the pitBeats say-corpus regex needs word boundaries
  (this run's /pit|boar/i matched "Airtight"/"floorboards"); the sweep
  keeps the raw corpus and the evidence filters honestly. Not a verdict
  issue.

## Named next (for the findings backlog)

The boar channel needs a KNOWLEDGE-side arm before any staffing arm can
work. Candidates (game-side content, not policy):
1. Trapper Handbook loot tuning — the only book unlocking pit_trap;
   0/8 finds in 180d runs.
2. Trapper-background NPC recipe knowledge — 0 villagers know any trap
   recipe; a trapper NPC who can teach pits via teachRound.
3. A witnessed-catch bootstrap that doesn't need a first pit (e.g. a
   villager's pit in the world fiction, or the handbook's diagrams
   granting L1 on read — check what book-reading grants today).
The pitstaff layer rebuilds cleanly onto any of these substrates (proof
+ sweep kept, INFO-SKIP-guarded; the layer's gates are substrate-honest
as written).

## Findings backlog note

- [killed] 2026-10-18 — food/knowledge — PIT-STAFFING LAYER KILLED AT
  ENGAGEMENT GATE (loop B sim-pitstaff-b, run
  fleshout-loop-b-20261018T1530Z, evidence/2026-10-18/sim-pitstaff-b.md,
  instrument-honest: proof 19/19 + det-gate 4/4 byte-identical, armed
  pilot 2x60d 0 crafts): the layer (PITSTAFF=1, per the killaudit named
  spec) is correct and proven but the substrate defeats it at the
  knowledge gate — pit_trap recipe L0 on 8/8 baseline runs
  (105101-105104 x leadfeast/belongfeast, 180d); starting codex never
  carries it; 0 NPCs know it; Trapper Handbook 0/8; witnessed-catch L1
  bootstrap is chicken-and-egg. Game.craft refuses honestly at L0, so 0
  traps armed (bar >= 16; kill-fast fired). Layer deleted zero-trace per
  kill protocol; instruments + evidence landed. The boar channel is
  gated on knowledge, not labor — one layer deeper than the killaudit's
  staffing attribution. NAMED NEXT: knowledge-side arm (handbook loot,
  trapper NPC knowledge, or bootstrap that doesn't need a first pit).
