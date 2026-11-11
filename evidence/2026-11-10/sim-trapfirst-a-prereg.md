# Trapping — first numbers: pre-registration (arm sim-trapfirst-a)

Run fleshout-20261111T0315Z, Loop A. Coverage Program Tier 2 (Steve order
2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any judged
sim. Base commit ad6a04b27. Claim: goal hidden_files/lever-claims/
fleshout-20261111T0315Z.json (axis: coverage program Tier 2 — trapping +
travel/roads; arms sim-trapfirst-a + sim-travelfirst-a).

## Canon

- docs/CANON.md read first. **There is NO TRAPPING.md in docs/** — no canon
  doc covers trapping/snares as a system. docs/PREY-RUNTIME.md is the
  nearest canon (prey runtime, habitat, hunt methods, learned cues) but it
  does NOT cover trap crafting, setting, checking, or the villager trapline.
  Nothing is invented here; the code citations below are the source of truth.
- Trapping mechanics as coded (read before pre-registering):
  - Scholar tile traps (src/js/game.js setTrap ~3573, checkTraps ~3683):
    11 trap recipes in src/data/recipes.json, each with a `catches` table
    (snare: rabbit/squirrel/opossum; deadfall: rabbit/squirrel/turkey/deer;
    box_trap: raccoon/opossum/muskrat/fox/skunk/rattlesnake/groundhog/
    beaver/bobcat/armadillo; pit_trap: deer/boar/raccoon/opossum; plus
    spring_snare, fish_weir, fish_basket, minnow_trap, trotline, noose_pole,
    squirrel_pole). setTrap refuses haven tiles, refuses water traps on dry
    land, costs 16 ticks (pit 96). checkTraps runs at dawn over every tile:
    base 40% via modTarget('hunt.trap_catch') (snare_wire skill via
    KNOWLEDGE_MOD_MAP 'trap_success': L0 0.4 / L1 0.4 / L2 0.6 / L3 1.0,
    capped 0.95 — sim-snaremech-b), +0.15 with binoculars, shyness
    0.65^level (floor 0.05, +1 per catch cap 3, relaxes 1 per 3 quiet days),
    staged-injury (scarecrow) guarantees the next catch. A catch is a REAL
    animal from the tile's wildlife (population decremented), a carcass to
    the scholar's pack via foodCarcass(animal, kcal, day, 'trapped'),
    noteDeed('trapping'), encIdentifyAnimal; first witnessed catch grants
    recipe L1. Skunk spray / rattlesnake bite / boar goring handling beats
    (knowledge earns safety). Trap uses decrement; a spent trap breaks.
  - Scholar craft (game.js craft ~3417): recipe L0 = no button; L1 blind
    35%, materials at real risk; L2+ reliable. 'bait' is a pseudo-material
    — any edible item (berries/nuts/scraps) baits a deadfall, box, spring
    snare, noose pole, minnow trap, trotline. Snare wire in hand sets an
    improvised 2-use snare with no recipe knowledge (honest tackle).
  - Villager abstract trapline (src/js/villager-objectives.js): TRAPS
    objective kind, knowledge-gated — only villagers with knowsSnare or
    knowsPit get the candidate (w 1.6). objReturnEffect 'traps': snare
    roll 40% -> stockPantry 100–400 kcal 'Snared meat'; pit roll 18% ->
    stockPantry 400–1000 kcal 'Pit meat (Name)' from the pit_trap table;
    tele('npc_trap' / 'npc_pit'). Teaching beats: snare/pit overhear +
    taughtSnare/taughtPit, trust 15+, recipe L1. knowsSnare/knowsPit come
    from occupation data (game.js ~1279/1565; pit gated on
    pitKnowledgeOn()).
  - Hunt duty (game.js resolveAssignments 'hunt' ~7013): villagerHuntResolve
    (a REAL animal from REAL wildlife, hunter's gear/occupation) ->
    stockPantry 'Game meat'; village learns the species (L1 in
    village.animals). fishfirst-a: 'Game meat' deposits 0 across 838,459
    kcal because competent never staffs hunt duty — backlog #2130, CLAIMED
    by this arm (see Findings note below).
  - 'deadfall' DUTY IS NOT THE DEADFALL TRAP (name collision, record it):
    the 'deadfall' task (game.js ~6327/7068) gathers fallen sticks + fiber
    for the pile; competent staffs it via staffDeadfallDuty. The deadfall
    TRAP recipe is scholar-only (setTrap). This arm counts both and never
    conflates them.
  - Glasswing dive trap (game.js gwTrapTick ~23755): a set glasswing trap
    spawns the darter via spawnWorldMonster({ id: trap.monsterId }) at
    game.js:23844 — the sim-findings #1826 site (was :23565). #1826 noted
    the bare {id} fell back to baseHp 20. The WANDERSPAWN FIX
    (sim-wanderspawn-a 2026-11-06, in spawnWorldMonster ~20438) now fills
    missing def fields from the data def when hp is absent — this arm
    VERIFIES live whether a trap-spawned darter carries proper HP
    (def hp [18, 26], so baseHp 18, not 20).
  - Panel context: luckTrap / luckSnare / luckHunt exist (luckRoll streams)
    but judge nothing about yield (coverage audit §4) — this arm says so
    with numbers.
- Instrument pattern: evidence/2026-11-10/sim-fishfirst-a.md +
  sim-cookfirst-a.md + sim-preserve-a.md (same food-system first-numbers
  shape). Backlog #2130 (hunt staffing) is a MEASUREMENT claimed by this
  arm, not a build — no lever is implemented here.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the scholar trapline fires under competent — fishfirst-a's
   corpus counted 74 trapped carcasses / 32,650 kcal on 8 seeds, and
   competent.js workTrapline (~1908–2010) crafts (L1 blind 3+3 / L2+ 1+1,
   2-held cap) and sets on the foraged wild tile (workTraplineSet) plus a
   wire fallback. The villager TRAPS objective exists (knowledge-gated);
   the pilot will count its returns, not assume them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio to
   size. The addressable pool is the home-board + foraged-tile wildlife
   of trap-catchable species, snapshotted daily (read-only, no backfill).
3. **Verb existence**: setTrap / checkTraps / craft / foodCarcass /
   spawnWorldMonster all exist in the engine; the policy calls the
   scholar verbs. Hunt duty exists but competent never staffs it (grep of
   scripts/policies/competent.js: zero 'hunt' staffing calls — the pilot
   confirms the zero via the assignTask wrap, not assume it).
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 122.5–140d); trapping runs from day 1, so no
   late-window risk. The glasswing trap spawn is the one late-ish event
   (needs a wave-1 glasswing + trap); the pilot records whether it fires
   at all on this band.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of trapping** — every
trap event classified by method + caller + kind, every yield kcal
attributed, every metric in the list below counted or explicitly marked
unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every trap event classified by method + caller + kind, none 'other' | 0 unclassified events across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 8)

1. Trap events by method/caller/kind: scholar crafts by recipeId (+ blind
   vs known), scholar sets by recipeId (+ wire-improvised sets), dawn
   checks with game present (luckRoll 'trap' rolls + hits, staged catches
   separately), villager TRAPS returns (luckRoll 'snare'/'pit' rolls +
   hits, tele npc_trap/npc_pit), hunt-duty resolutions, 'deadfall'-duty
   resolutions (stick-gathering, counted separately — never conflated).
2. Yield kcal by source: scholar trapped carcasses by species + origin
   ('trapped'); villager 'Snared meat' + 'Pit meat (...)' deposits;
   'Game meat' deposits; trap share of pantry inflow (trap deposits /
   all deposits); trap-kill share of meat (trapped carcasses / all
   carcasses; trap deposits / all meat deposits by name).
3. Who traps: scholar vs villagers; scholar recipe levels + snare_wire
   skill level over time; villager knowsSnare/knowsPit headcounts;
   TRAPS-objective holders; hunt-duty staffing (assignTask 'hunt' calls,
   ok, refused by reason + villager); 'trapping' deeds by who.
4. Trap spawn path (#1826 verification): every spawnWorldMonster call
   with id/hp/maxHp/wave/veteran + caller frame; trap-spawned (gwTrapTick
   caller) monsters' hp vs their data-def hp; wanderer-cast spawns as a
   control row (same fix, different caller).
5. Trap upkeep / bait / placement / knowledge: trap uses at set, breaks,
   shyness levels on set tiles, sets on tiles with vs without eligible
   game, sets where the caught species is vs is not in village.animals
   (known game), bait consumed at craft (edible items spent), quiet-trap
   days (trap set, no eligible game), trap line length over time.
6. Trap kcal share vs forage/hunt/garden/fish: stockPantry deposits by
   name ('Snared meat' / 'Pit meat (...)' / 'Game meat' / 'Fish catch' /
   'Foraged food' / 'Garden harvest') on identical days, plus
   village-meal draws by pantry item name; trapped-carcass cleaning
   (cleanCarcass of trapped origin) vs rot loss.
7. Trap spoilage if observable: spoiled-present trap-meat kcal at daily
   snapshot; trapped carcasses purged via eat. If the dawn sweep purges
   rot before the snapshot (cookfirst-a limitation), say so and mark the
   sub-metric inferred/unmeasured.
8. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: trapping is a food-economy / reachability question; sibling
  first-numbers pilots (cookfirst-a, preserve-a, fishfirst-a) ran 150d
  with median survival 122.5–140d, so 150d captures the full village
  life without ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 180241–180248 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 180241–180248: zero
    hits (git grep over all committed preregs; the only 1802xx seeds
    named anywhere are 180201/180208 cookfirst-a, 180209/180216
    preserve-a, 180217/180224 garden band, 180225/180232 preserve
    reserved confirm band, 180233/180240 fishfirst-a).
  - Searched all dated evidence `.md` for 180241–180248: zero hits
    (recursive grep over evidence/, exit 1 no-match on the .md scope).
  - No perseed directory names any seed 180241–180248; no dated
    evidence .md names them.
  - The 7 JSON-corpus hits for the digit run 18024[1-8] are FALSE
    POSITIVES, not seeds: every one is a decimal float containing the
    digits inside a longer number (e.g. 2.180248314111048,
    126.18024499248713, 1739.5214675180243, 0.0018024291760460776) in
    panel-helpcost-compare.json, sweep-belongfeast.json,
    armed-belong.json, sim-gatedisengconf-b-armed.jsonl,
    sim-sensorconfirm2-b.jsonl, awayration2-b corpora, storageshed-b5
    panel cases. None is a standalone seed integer; none reserves the
    band. The same float matches appear in goal hidden_files copies of
    those corpora (armc-b-partial, panel-holdbeatfix-b) — copies, not
    reservations.
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked; the only "band" matches are preregs,
    not lists).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` (git grep) + all dated evidence `.md`
    (recursive grep) + all evidence JSON (git grep, false positives
    inspected individually) + perseed directory names + goal
    hidden_files listing + float-match inspection.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/trapfirst-instrument-20261110.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- stockPantry: every pantry deposit by name (trap share backstop:
  'Snared meat' / 'Pit meat (...)' / 'Game meat' / 'Fish catch' /
  'Foraged food' / 'Garden harvest' + everything else).
- foodCarcass: every carcass by origin ('trapped' / 'fished' / 'netted' /
  'hunted' / 'charred') + species + kcal — scholar trap-kill backstop.
- setTrap: every set by recipeId + caller frame + tile wildlife at set
  (eligible species present, known-in-village.animals or not, shyness
  level) + wire-improvised flag (no held tool + snare_wire consumed).
- craft: every craft by recipeId + blind flag (recipe level < 2) — trap
  crafts only (other crafts recorded as other, classified).
- tele: npc_trap / npc_pit returns (vid, caught, kcal, species) +
  snare_overhear / pit_overhear + tele('eat') reconciliation.
- __luckSink: trap / snare / pit luck rolls (p, hit) — the dawn-check
  and villager-return roll counts. Installed only in the instrumented
  leg (the panel collector is not running in this driver); restored on
  uninstall.
- assignTask: 'hunt' + 'deadfall' staffing calls with return + reason +
  trust-before (fishstaff-b pattern). offerDeal / appealToGoal 'hunt'
  calls too (expected 0 — re-verified here).
- creditDeed / noteDeed: 'trapping' deeds, who (same dedup suppression
  flag as fishfirst-a — noteDeed IS creditDeed('player', ...)).
- spawnWorldMonster: every spawn with id/hp/maxHp/wave/veteran + caller
  frame — the #1826 verification (gwTrapTick caller = trap spawn).
- cleanCarcass: trapped-origin carcasses cleaned, by name (trapped
  carcass items tracked from the foodCarcass return value).
- pantryDraw: meal draws by pantry item name (trap-meat kcal drawn).
- eat / eatOne / eatStashOne: trap-meat kcal eaten + spoiled purge (as in
  cookfirst-a / fishfirst-a).
- Daily snapshot: pantry roll by name, pack roll by name, traps on the
  current map (recipeId/uses/setDay/tile), scholar trap tools held,
  recipe levels (all trap recipes) + snare_wire skill level,
  knowsSnare/knowsPit villager counts, village.animals keys, foodXp,
  home-board trap-species wildlife total (read-only, never backfilled),
  spoiled-present trap-meat kcal.
Driver: scripts/trapfirst-driver-20261110.js (mirrors fishfirst-driver;
Game.say wrap with a trap regex for the sense corpus, 200 lines/seed
cap — same early-game-only caveat as fishfirst-a; regex narrowed to
trap|🪤|snare|pit|deadfall|trapline, no bare 'water'). Analyzer:
scripts/trapfirst-analyze-20261110.js. Proof:
scripts/test-trapfirst-a.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction; #1826 verified live in a gwTrap miniature: a
trap-spawned glasswing darter carries def hp, not 20).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b; cookfirst-a, preserve-a and
fishfirst-a likewise attached no panel). The control/neutral legs are
the neutrality proof, not a panel. Panel context recorded in evidence:
luckTrap / luckSnare / luckHunt exist but judge nothing about yield.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (cookfirst-a / preserve-a / fishfirst-a: median survival
122.5–140d, 6–7/8 village-lost). If the instrument changes any numeric
field vs the recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
