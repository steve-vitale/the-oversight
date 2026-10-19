# sim-killaudit-b2 — kill-side audit: why boar/bear never enter the village's orbit (ARM sim-killaudit-b2)

Diagnostic arm, loop B food-economy axis, run fleshout-loop-b-20261019T1650Z.
NO lever, NO game-code change — instruments + evidence only.

Motivation: evidence/2026-10-18/sim-fatpipe-b.md (third confirmation) — the
render ladder is SUPPLY-STARVED AT THE KILL LEVEL: 0 fat slabs over 2,121
run-days, render known 0/16 runs, zero bear/boar/javelina beat mentions.
The kill channel that fires is monster carcasses (alien, no butcher.fat) +
snare hauls as pantry credit. Named next: kill-side audit — why do boar/bear
never enter the village's orbit?

Sub-questions (from the brief):
1. Trap species table composition — what species can even enter the
   snare/pit tables (census of Game data, not guess).
2. Hunt-duty staffing — wrap Game.assignTask AND snapshot v.taskLeads per
   day (b3 lesson: the task-lead system bypasses assignTask).
3. Bear-hunt feasibility — villagerHuntResolve bear path; BEAR.md canon
   check: is the bear a FIGHT or a stalk-kill?
4. The haul→butcher pipeline — butcher.fat production per kill channel.

## Canon read (BEFORE sims)

- docs/CANON.md (this run).
- docs/BEAR.md: the bear is "a non monster monster fight" — weapon ladder
  bow > spear > knife > bare hands; the maul (8–17 at range ≤ 2); spear
  reach halves it. Butchering: bear 6 slabs, boar 3, javelina 2 (~20% of
  gross); raw slabs inedible until rendered; L4 knowledge (rendering,
  trichinosis, pemmican); *Tallow & Keeping* teaches. Portion law: no giant
  lumps. Trichinosis: bear/boar/javelina, only 'cooked' clears.
- docs/PRESERVATION.md: ladder cleaned < cooked < smoked < rendered (90d) <
  pemmican (120d); blind penalties teach (render 0.65x, teaches); stash
  render/pemmican wired (data-stash-render → Game.renderFat).
- Prior art: sim-fatpipe-b (2026-10-18, 16 runs 99101-99108, master
  01fd8945): 0 slabs, 0 render firings, kill channel = monster carcasses +
  snare pantry-credit. sim-huntstaff-b3/b4 (2026-10-18): kind-aware death
  instrument (monsters pollute the death tele), task-lead hunt duties bypass
  assignTask (finding #528), wound→fever chain attribution.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- **PRIMARY (mechanism):** a ranked attribution of the binding gate per kill
  channel — boar-via-pit, boar/bear-via-hunt, bear-via-stalk — e.g. "X% of
  boar fat-absence is pipeline bypass, Y% staffing, Z% trap species table".
  GO = every census question answered with numbers AND the attribution fully
  explains the observed fat-slab count (0 expected per fatpipe; any slabs
  must be attributed to a channel). An unattributed fat slab or an
  unanswered sub-question is a MISS.
- **Q1 (static):** trap species tables × butcher.fat join — which recipes can
  catch a fat-bearing species. (Proof PART A1, live Game.data.)
- **Q2 (staffing):** hunt-duty staffing — assignTask('hunt') attempts +
  daily v.taskLeads snapshots + every hunt duty's resolution through
  villagerHuntResolve (aid drawn, killed, channel). (b3 lesson honored.)
- **Q3 (bear):** bear draws + resolutions through villagerHuntResolve;
  canon check stalk-kill vs FIGHT. Bear availability on tiles (daily scan).
- **Q4 (pipeline):** carcassToMeat calls per run — aid, fat slabs, caller
  class (village-duty / scholar / specialist / ability / other). The
  pipeline hypothesis: village channels never produce carcass items.
- **WALL (report-only):** national / table / wins / wave 1–5 / Arc reach /
  median+max survival / death-cause shares (kind-filtered).
- **SEEDS:** 99101-99108 × {leadfeast,belongfeast} — identical to fatpipe's
  census (verified fresh 2026-10-18), 16 runs, control-only (competent base
  policy, no layer).
- **SUBSTRATE:** FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat), 180d
  death-aware (engine tail).
- **INSTRUMENT HONESTY:** scripts/test-killaudit-b2.js — PART A RED/GREEN
  fixtures (A1–A7), PART B det-gate byte-identical trajectories on/off.
  Re-verified on current master before spend.
- **COMPLETION GATES:** 16/16 runs complete, 0 instrument errors,
  schema-clean output, 0 unattributed kill events.
- **§15 balanced panel:** N/A — diagnostic census, single-arm, no lever, no
  before/after.
- **SENSE (law):** read full transcript slices of hunt duties and bear
  encounters (2+ reads).
- **VERDICT:** DIAGNOSTIC — deliverable is the ranked attribution + a
  named-next decision for the following run (which gate, if fixed, would put
  fat on the rack; lever shape, policy-side if possible, game-code if the
  census proves it must be).

## Method notes

- Instrument: scripts/sweep-killaudit-b2.js (schema 'killaudit-b/1').
  Read-only wraps (side ledger, zero RNG draws, zero game-state writes):
  assignTask, villagerHuntResolve (sees ALL hunt duties — assigned, lead,
  other), hurtVillager (hunt wounds), foodCarcass (scholar trap/net/line
  kills), carcassToMeat (the sole fat-separation site; caller classified
  from the stack), stockPantry (anonymous/named kcal flows), tele (death
  WITH kind — b3/b4 lesson; npc_trap; npc_pit), say (sense ring).
  Daily (read-only): v.taskLeads snapshot, wildlife availability scan
  (existing t.wildlife ONLY — never backfillWildlife; backfilling would
  start a tile's ecology sim early and change the trajectory), render
  knowledge, wall metrics.
- Wound→fever chains (b4 lesson): hunt-wounded villager dying within ~7d
  counts as hunt-attributable even when the cause reads 'sickness'.
- Proof: scripts/test-killaudit-b2.js — PART A 26 fixture pins (incl. 3 RED
  documents: the hunt-duty pipeline bypass, the bear stalk-kill canon
  conflict, the assignTask-blindness to task leads), PART B det-gate.
- Worktree game code verified byte-identical to main-tree master for
  src/ + scripts/policies/ (the one-commit delta is a diagnostic
  evidence/scripts commit, zero game-code changes).

## Results

COMPLETION GATES (pre-registered): 16/16 runs complete, 0 instrument
errors, 0 unattributed kill events, 16/16 schema-clean per-seed JSONs
(evidence/2026-10-19/perseed-killaudit/). Det-gate re-verified on current
master BEFORE spend: PART A 26/26 pins, PART B 8/8 byte-identical 60d
trajectories instrument-on vs off (scripts/test-killaudit-b2.js ALL GREEN).

Corpus: 16 runs × 2,268 run-days (death-aware; median survival 136d, max
180d; 4 runs hit the 180d horizon).

### PRIMARY — ranked binding-gate attribution (the 0 fat slabs, explained)

**Q1 — trap species tables (static census, live Game.data):**

| Recipe | Table | Fat-bearing species |
|---|---|---|
| snare | rabbit, squirrel, opossum | **0** |
| deadfall | rabbit, squirrel, turkey, deer | **0** |
| box_trap | raccoon, opossum, muskrat, fox, skunk, rattlesnake, groundhog, beaver, bobcat, armadillo | **0** |
| spring_snare | rabbit, squirrel, turkey, fox, goose, crow | **0** |
| pit_trap | deer ×2, **wild_boar**, raccoon, opossum | **1 (boar, 1/5 weight)** |

4 of 5 trap recipes cannot catch any fat-bearing species — a static,
game-data gate. In vivo: the scholars' 88 trap catches were rabbit /
squirrel / opossum only (snare-table species), and all 66 carcassToMeat
calls were caller-class 'scholar' (0 'village-duty', 0 'specialist',
0 'ability') producing 0 slabs — exactly as the tables predict.

**Q2 — hunt-duty staffing:**

| Measure | Corpus |
|---|---|
| assignTask('hunt') attempts | **0** |
| task-lead hunt day-rows (v.taskLeads snapshots) | **0** |
| hunt resolves (villagerHuntResolve) | **0** |
| hunt kills | **0** |
| hunt wounds / wound-chains | 0 / 0 |

In the control corpus the hunt duty NEVER fires — not once in 2,268
run-days. The base competent policy staffs zero hunts (confirming
fatpipe's "hunt duties never assigned"), and the engine's contender-
challenge path fired no hunt domains on these seeds (contrast b4's 10
day-rows on armed s8473). **Staffing is 100% of the hunt-kill absence.**

**Q3 — bear:**

- Bear draws through villagerHuntResolve: **0** (no hunts at all).
- Bear tile-availability: present on **100%** of day-rows; boar on 99.1%;
  javelina 0% (not in eastern-woodlands fauna — correct per the 2026-10-14
  regional trim; it lives in na_arid). The wildlife is NOT the gate — boar
  and bear are in the village's orbit ecologically, every day.
- Canon check (fixture A3, real code path): a bear drawn by
  villagerHuntResolve resolves as a stalk **"clean kill"** (fixture:
  18,000 kcal from the 30,000 gross, difficulty 'hard', 15% base chance) —
  no fight, no maul. BEAR.md canon: the bear is a FIGHT ("a non monster
  monster fight"). **Canon conflict documented; practically unreached**
  (0 draws / 2,268 run-days).

**Q4 — haul→butcher pipeline:**

| Kill channel | Kills/hauls | Fat slabs |
|---|---|---|
| NPC pit line (boar catches) | 3 boar (741/622/836 kcal, 'Pit meat (Wild Boar)') | **0** |
| NPC pit line (other) | 19 catches, 12,751 kcal | 0 |
| NPC snare line | 180 catches, 44,997 kcal ('Snared meat', species-abstract) | 0 |
| Hunt duty | 0 kills | 0 |
| Scholar's traps → carcassToMeat | 66 butcher calls, all 'scholar' | 0 |
| Monster carcasses (loot-as-action) | alien meat, no butcher.fat | 0 |

The three boar pit catches are the smoking gun: the village DID catch
boar — three times, named by species — and **zero fat separated**, because
the pit line does `stockPantry(kcal, 'Pit meat (Wild Boar)')`: abstract
kcal, no carcass item, carcassToMeat never fires. Fixture A2 proves the
same for the hunt duty: a rigged boar kill through the real duty branch
→ pantry 'Game meat' +5000, **carcassToMeat called 0 times**. Fixture A6
pins the engine verb itself: boar carcass → carcassToMeat → exactly 3
slabs (canon BEAR.md). **The pipeline bypass is 100% of the fat absence
on every village channel** — the table and staffing gates only ever gated
the kcal, which flowed (2,199 kcal of named boar meat entered pantries;
not one slab separated).

### Ranked attribution per channel (PRIMARY, as pre-registered)

- **boar-via-pit:** pipeline bypass **100%** of fat absence (boar IS caught
  and named; the fat is discarded by construction). Table composition 0%
  (boar is in the table, 1/5). Staffing/knowledge gate only kcal frequency
  (22 pit catches / 2,268 run-days; knowsPit on 3 occupations).
- **boar/bear-via-hunt:** staffing **100%** of kill absence (0 assignments,
  0 lead-rows); pipeline **100%** of fat absence conditional on any future
  kill (fixture-proven). Wildlife/draw rarity is currently unmeasurable
  behind the staffing zero — boar/bear are tile-present ~every day.
- **bear-via-stalk:** no dedicated stalk mechanic exists — the hunt duty IS
  the stalk, and it resolves bear as a clean-kill (canon conflict vs
  BEAR.md's FIGHT, filed below as steve-call). Pipeline binds the fat.
- **trap channel (scholar's own):** table composition **100%** — 4/5 tables
  are fat-free by data; the scholars' 88 catches confirm it in vivo.

**Attribution completeness:** 0 slabs generated = 3 boar pit catches ×
pipeline-bypass + 0 hunt kills × staffing-zero + 66 scholar butchers ×
table-gate + 180 abstract snare hauls × species-abstract. Every slab of
the zero is accounted for. GO.

### Wall numbers (report-only)

- Scale: regional 16/16 · national 16/16 · global 12/16 · table 13/16 ·
  won 0/16 · exiled 0/16
- Waves (cumulative reach): 1: 16/16 · 2: 16/16 · 3: 16/16 · 4: 11/16 ·
  5: 0/16
- Arc: III 3/16 · IV 13/16 · four-realm 0/16
- Survival: median 136d · max 180d (4 runs hit horizon) · 2,268 run-days
- Render knowledge: 0/16 runs (unchanged since fatpipe)
- Deaths (kind-filtered, 204 person/villager): combat 54.4% · monster 25.0%
  · contest 3.9% · ambush 2.9% · phoenix 2.5% · sickness 1.5% · starvation
  1.0% (2 deaths) · other named causes 8.8%. Villager monster-kills: 408.
  Scholar deaths: 118 (succession churn; villages continue).
- Trap acquisition by source: scholar traps 88 (rabbit/squirrel/opossum) ·
  NPC snare line 180 catches / 44,997 kcal · NPC pit line 22 catches /
  14,950 kcal (3 boar).
- Counter discovery / young-link succession: not instrumented in this
  diagnostic (no combat-trick lens; succession observed via 118 scholar
  deaths with villages continuing).

Note: wave-4 reach is 11/16 on these identical seeds vs 3/16 in fatpipe's
2026-10-18 corpus — the wave-4 gate moved between 01fd8945 and this tree's
0924f8172. Filed to the backlog, not chased (diagnostic arm).

## Village assessment (plain words)

Sixteen villages, and not one of them ever sent anyone out to hunt — the
duty simply doesn't exist in the base policy's world, and the engine's
own contender-challenge path never raised a hunt lead on these seeds.
What the villages DO have is Theo and Denny working the pit line: three
times across the corpus one of them came home and said the words — "Wild
Boar in the pit" — and the village ate 741, 622, 836 kcal of named boar
meat. Nobody butchered it. There was no carcass to butcher: the pit hands
you calories, not a body. The fat that canon says lives in a boar —
three slabs, ~20% of the animal — never existed as an item, so nothing
could render it, and the render ladder stayed a museum exhibit for the
fourth consecutive census. Meanwhile the bears walk the tiles every
single day — present on 100% of day-rows — and no one ever goes after
them; the one beat that spots one just says "a black bear, powerful and
intelligent-eyed," and the village gets on with dying of combat (79.4%
of villager deaths are combat + monster). These villages are not
starving (2 starvation deaths in 2,268 days); they are being eaten. The
blank is exactly where fatpipe left it — the kill level — and this audit
names its shape: the village's hands can catch a boar, but the game's
hands have nowhere to put the fat.

## Sense-test (SENSE-TESTING LAW)

Three reads (no hunt duties existed in this corpus to read — the staffing
zero IS the finding; the standing hunt-duty sense record is Klaus/Ayaan/
Pavel in sim-huntstaff-b3/b4):

1. **Pit-line boar catch** (belongfeast-99107 d65): `🪤 Theo is back from
   the pit line: Wild Boar in the pit — +741 kcal to the pantry.` The
   species is NAMED — the village knows it caught a boar — but the haul
   arrives as pure kcal. No butchering beat, no fat, no hide, no tusks
   (the boar's butcher table promises hide/bone/tusk/fat). The fiction
   names the animal; the pipeline discards everything but the calories.
   Honest narration of a dishonest pipeline. (Same shape d41 leadfeast-
   99106 Denny, d73 leadfeast-99107 Theo.)
2. **Bear encounter** (belongfeast-99105 d44): `Movement — a black bear,
   powerful and intelligent-eyed.` Spotted, never engaged — no hunt duty
   exists to engage it, and the scholar's competent policy doesn't pick
   the fight. The bear is scenery that could be dinner.
3. **Boar-like monster fight** (leadfeast-99103 d27): `You STRIKE the
   boar for 45 (Hatchet)` ×2, `(boar's hide absorbs 8.)`, `boar is
   BLEEDING — and it likes it. Louder, faster, no more feints.` → kill
   note "Pork is pork. Smoke it; it keeps for weeks. The quills make
   excellent awls." — a Bulldozer (boar-like monster), fought
   blow-by-blow per the monster-fight law, monster-meat-gated ("you
   don't know this flesh"). The monster lane is alive; the animal lane
   never gets its turn.

Verdict: people read as people (Theo/Denny working the line, Paisley
"Wire doesn't lie," villagers spotting bears and getting on with their
day). The blank is structural, not fictional.

## Named-nexts

**NAMED NEXT (the deliverable): fix the haul→butcher pipeline (game-code
arm).** The gate that puts fat on the rack is the pipeline bypass — no
village kill channel produces carcass items, and carcassToMeat is the
sole fat-separation site. Fixing staffing alone (the HUNTSTAFF lever)
puts meat in the pantry but zero fat — fixture A2 proves the duty
anonymizes kills to 'Game meat'. Fixing trap tables alone does nothing
for the NPC abstract lines. **No policy-side lever can route around the
bypass** — the anonymization lives in resolveOneAssignment's hunt branch
(game.js) and the NPC trapline return (villager-objectives.js). The
census proves the fix must be game-code.

Lever shape for the next run ("village butchering" arm): when a hunt
duty resolves a fat-bearing species (butcher.fat > 0), or the NPC pit
line rolls one, produce a carcass item into the village stash (prepStash)
and run the existing carcassToMeat on it — village-side cleaning at the
duty's 0.60/0.78 rate (blind 0.30 if the cleaner lacks the technique;
design call for the brief) — so fat slabs separate into the stash where
the already-wired `data-stash-render` counter can render them. The three
boar pit catches in THIS corpus are the natural pilot fixture: replay
seeds 99106/99107 and the slabs should appear. Pre-register: ≥1 fat slab
separated per fat-bearing kill; renderFat firings > 0 within 30d of first
slab; carry the huntstaff-b4 wound/HP gates. Policy-side alternative:
explicitly NONE — named as not viable.

**Second item (steve-call, filed to backlog):** the bear stalk-kill canon
conflict — villagerHuntResolve resolves a drawn bear as a "clean kill"
stalk (fixture-proven), but BEAR.md canon says the bear is a FIGHT ("a
non monster monster fight," maul 8–17). If the pipeline arm ever routes
a bear through the hunt duty, the resolution violates canon. Design
ruling needed before the pipeline arm handles bear: fight path for
villagers, or bears excluded from the duty's draw pool.

## Metric review (mandatory)

- PRIMARY (ranked attribution per kill channel) answered exactly as
  framed: four channels, each gate quantified, the 0 slabs fully
  attributed (3 boar pit catches × pipeline-bypass + 0 hunts × staffing +
  66 scholar butchers × table-gate + 180 abstract snare hauls). No metric
  re-scored mid-run. No §14 event: the census met its pre-registration.
- §15 balanced panel: N/A (diagnostic census, single-arm, no lever — no
  before/after to compare). Per-seed JSONs are self-contained (schema
  killaudit-b/1).
- Instrument limitation (not a metric miss): the wildlife availability
  scan reads materialized tiles only (t.wildlife objects created by
  gameplay/backfill). Bear 100% / boar 99.1% day-rows are shares over
  materialized tiles — the village's actual hunting range, which is the
  honest denominator for the duty's draw pool.
- The wave-4 reach delta vs fatpipe (11/16 vs 3/16, identical seeds) is a
  substrate observation, not a metric miss — filed, not chased.
- Seeds 99101-99108 identical to fatpipe's census by design (the brief's
  "match fatpipe's census" option); freshness was verified 2026-10-18 and
  the corpus is a deliberate re-measurement on the newer master.

## Convergence

Axis food-economy, kill-side sub-blank: **converging**. The render ladder
remains supply-starved at the kill level (fourth confirmation), but the
blank now has a complete ranked attribution and a specified, fixture-
backed named next (village-butchering game-code arm + the bear steve-
call). The diagnostic phase of this blank is done — the next run builds.
