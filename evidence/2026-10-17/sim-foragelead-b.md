# sim-foragelead-b — forage-stream attribution audit (sim-huntduty-b's second named next)

Diagnostic arm, loop B food-economy axis, run fleshout-b-20261017T1835Z.

sim-huntduty-b measured **893 forage-duty resolutions across 16 runs with NO
matching policy assignTask attempt** — a contender mechanism is the engine's
taskLeads path (game.js 6079; `v.taskLeads[ch.task || 'forage']`, 6124), but
attribution was unproven. Foraging is the village's baseline food verb; this
arm classifies 100% of the forage stream on the feastscale substrate and
measures what foraging actually yields.

## PRE-REGISTRATION (binding; written BEFORE sims)

- PRIMARY: 100% attribution of the forage stream. Every 'Foraged food'
  pantry inflow (stockPantry name-match + depositPantryPieces homecoming)
  classified into a named bucket:
  duty:forage / tasklead:forage / duty:forage-redirect / tasklead:forage-redirect
  / duty:scout-cache / ambient:villageLives / ambient:away-forage
  / ambient:self-forage / ambient-social:gratitude / ambient-social:fireside
  / player:quest-turnin / player:homecoming-haven / player:homecoming-old,
  with the named residual bucket 'unclassified-forage' (must be 0 or
  documented with a reason). GO requires the residual to be empty OR named
  with a documented mechanism.
- GO = a named fix spec (policy-side handle: file + function + gate
  conditions + safety argument) IF a policy blank exists (a foraging verb
  the village needs but no policy staffs), OR the verdict "no blank —
  ambient foraging is the design" with the measured numbers showing the
  current surface is honest (who forages, kcal/forager-day, forage share
  of pantry inflow, taskLeads occupancy from state).
- SECONDARY: kcal by forager per day per bucket; forager occupation
  profile (kcal-weighted) vs day-0 roster baseline; forage share of
  pantry inflow; wall numbers (national/table/wins, wave 4-5 unlocks,
  median survival, death-cause shares, starved days).
- SEEDS: 7621-7628 + 7631-7638 (16 fresh; verified unused: not on the
  banned/used list 4801-4808, 4101-4108, 6101-6108, 9701-9708, 5201-5208,
  931-938, 1801-1808, 4201-4208, 3801-3808, 107-884, 1940809, 962-969,
  941-948, 951-958, 4001-4004, 1253, 2601457, 1404-1406, 2026, 2031,
  2042, 3050, 3055, 3061, 8801-8808, 8701-8808, 8901-8908, 1707,
  1060511, 1802, s967, 7001-7008, 7101-7108, 7601-7608, 7901-7908,
  7611-7618; grepped evidence/2026-10-17 for 762x/763x — no hits before
  either batch). Batch 1 ran 7621-7628 x 2 policies; batch 2 ran
  7631-7638 x 2 policies (see Metric review — the brief's "16 fresh
  seeds" was misread as 8 at pre-registration; corrected before batch 2
  with fresh verification).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT;
  32 runs total). 180d death-aware horizons (engine tail) — no fixed 200d.
- INSTRUMENT: scripts/instrument-foragelead-b.js (read-only wraps:
  stack capture + counters + pure state reads; zero RNG draws; zero
  game-state writes; zero src/js and zero scripts/policies changes).
  Attribution discipline: resolveOneAssignment wrapper sets a transient
  Game._flbCtx slot (restored on exit, reentrancy-safe); 'duty' vs
  'tasklead' via assignment-object identity cross-checked against the
  v.taskLeads state map; villageLives forager identity retro-attached via
  creditDeed(id,'foraging'); npcTakeAction rid carried in ctx.
- INSTRUMENT HONESTY: scripts/test-foragelead-b.js — PART A RED-verified
  fixture (manual forage duty -> duty:forage with exact kcal/occupation;
  constructed taskLead -> tasklead:forage with taskLeads state agreement;
  ambient loop produces no unclassified events; RED = no instrument ->
  no attribution slot), PART B det-gate byte-identical trajectories
  instrument-on vs off (4 seeds x {leadfeast,belongfeast} x 60d), SMOKE
  green.
- §15: per-seed panel-schema JSONs (schema 'foragelead-wall/1'); this is
  an audit, not a lever — no armed side, no balance-panel compare.
- Sense-testing (law): read at least one forage-rich transcript day —
  do villagers forage like people or like background processes?
- COMPLETION GATES: 32/32 runs complete, schema-clean output (required
  keys; every forage event bucketed), 0 instrument errors, 100%
  attribution (named residual only).

## Canon read

- docs/CANON.md: read. Foraging is human-skill lane (knowledge-gated,
  teachable, no System slots) — correctly so. "If you don't know, it
  doesn't show" governs what forage UI reveals; no silent actions —
  every forage resolution narrates.
- docs/PRESERVATION.md: read. Foraging feeds the BOTTOM of the food
  ladder — 'Foraged food' enters as fresh-equivalent pieces (safe,
  spoilDay day+3 via the stockPantry piece template); the ladder's rungs
  (cleaned/cooked/smoked/rendered/pemmican) are where foraged food gains
  shelf life. No canon invention needed: the question is attribution and
  yield of the existing stream, not a new system.

## The mechanism, proven statically (before the census)

The 893 unattributed forage resolutions are **villager agency, not a
policy blank**. The full chain, verified in code:

1. `agencyTick()` → `agencyLeadershipTick()` (villager-agency.js:234,727)
   every tick: any roster villager with `npcGoal(id)==='lead'` and
   agencyScore ≥ 20 builds contender heat at 10%/tick; at heat ≥ 3 it
   raises `v.challenge = { cid: id, task: 'forage', age: 0 }`
   (villager-agency.js:745) — the forage domain is HARDCODED. (The other
   challenge site, game.js:16275, takes `task` from the duty being
   assigned — never 'forage', since no policy assigns forage.)
2. Challenge ignored 8 day-parts → `v.taskLeads['forage'] = ch.cid`
   (game.js:6124); player yields → same via `yieldChallenge`
   (game.js:5200, `task = ch.task || 'forage'`).
3. Every subsequent day-part, the lead loop in `resolveAssignments`
   (game.js:6079-6085) fires `resolveOneAssignment(leadVid, {task})` —
   the lead works the forage domain as their power base, on the
   village's behalf.

So: ambitious villagers SEIZE the forage domain; the policy never staffs
it because the engine's social layer does. The census below measures the
magnitude and the rest of the stream.

## Results

COMPLETION GATES (pre-registered): 32/32 runs complete (16 fresh seeds
7621-7628 + 7631-7638 x {leadfeast,belongfeast}, 180d death-aware), 0
instrument errors, 0 unattributed events (5,990/5,990 forage events
classified), all 32 per-seed JSONs schema-clean. Det-gate: 8/8
byte-identical 60d trajectories (one mismatch caught and fixed
mid-run — see Metric review). RED fixture: exact.

### PRIMARY — 100% attribution of the forage stream

32 runs, **5,990 forage events, 3,209 in batch 1; named residual
'unclassified-forage' = 0.** Policy forage assignTask attempts: **0**
(policy assign mix: fish 6,336 / water 6,136 / cook 3,352 / garden 574 /
wood 12 — the documented surface; forage deliberately absent, see
Verdict).

| bucket | events | kcal | share |
|---|---|---|---|
| ambient:villageLives (free villagers living their day) | 2,719 | 1,425,375 | 52.7% |
| ambient:away-forage (travelers returning, objMaybeDepart) | 3,043 | 1,214,905 | 45.0% |
| tasklead:forage (contender's domain, direct) | 87 | 42,528 | 1.6% |
| ambient:self-forage (hungry villagers, npcTakeAction) | 141 | 20,009 | 0.7% |
| duty:forage / duty:scout-cache / social / player | 0 | 0 | — |

Food state (code-verified): every villager-side inflow arrives via
`stockPantry(kcal,'Foraged food')` → the piece template (safe:true,
spoilDay day+3) — fresh-equivalent raw pieces, the bottom rung of the
PRESERVATION.md ladder. No forage inflow carries any other state.

### The 893 mirror — dutyForage vs policy assigns, mechanism PROVEN

1,382 resolveOneAssignment resolutions with taskIn='forage' across 32
runs. **Every one via='tasklead'** (assignment-object identity +
v.taskLeads state-map agreement); zero via='duty', zero via='deal' or
'appeal' (those verbs are player-UI-only; no policy calls them):

- tasklead|forage (direct): 87 — the lead brings food home when the
  pantry is lean (≤4 fresh days)
- tasklead|forage→wood: 402 | →water: 415 | →stone: 478 — the
  PRODTHROTTLE redirect: pantry full → the lead's labor becomes
  wood/water/stone instead, narrated honestly ("leaves the forage
  standing and turns to the wood run instead")

13/32 runs had an active forage lead. Direct producers: the programmer
of seed 7634 seized the domain on BOTH policies (leadfeast: 33
resolutions / 17,151 kcal; belongfeast: 49 / 23,424 kcal — same seed,
same roster, same ambitious villager), plus a Fisherman (7631, 851
kcal) and a hunting guide (7637, 1,102 kcal). sim-huntduty-b's 893 were
all redirects because those villages were well-fed; the direct path
fires exactly when it matters — lean pantries.

### taskLeads occupancy (mechanism from state)

Sampled ~every 10 days (475 day-slices): a lead of any domain active
34.7% of the time; a FORAGE lead 15.2%. Lead domains: cook 133 / fish
107 / water 97 / garden 78 / forage 72. The forage domain is a normal
contender prize, not an edge case.

### Yield — kcal per forager per day, occupation profile, share of inflow

- **Forage = 53.1% of pantry inflow** (2,702,817 / 5,087,780 kcal).
  Next: Fish catch 1,250,119; Expedition haul 422,682. Foraging is the
  village's primary food verb — the quiet engine is actually the loud
  one: 599 forage kcal/day, 1.33 events/day across the corpus.
- kcal per forager-day (identity-bearing buckets): tasklead:forage
  **1,215** (duty machinery: competence × trust × tile depletion);
  villageLives **667**; self-forage **142** (hungry-villager snacks).
- **Who forages: everybody.** Occupation profile (kcal-weighted) tracks
  the roster baseline — top is 'programmer' at 4.1% vs 2.6% of roster;
  'Wild food forager' 2.3% vs 2.1%. No occupation dominates; 232
  distinct villageLives foragers + 81 self-foragers + 3 leads. Foraging
  is what unassigned villagers DO, not a specialist's job.

### Wall numbers (standing directive)

32 runs: national 23/32, table 30/32, wins 0/32 (pre-seat substrate —
no modal driver on this road; huntduty measured the same 0/16),
exiled 0/32, Arc IV 30/32, wave-4 0/32, wave-5 0/32, median survival
157d, max 180d, starved-days 96 total (3.0/run). Deaths 1,512: combat
955 (63%), villager combat 290, monster 130, expedition 48, contest 34;
food-side (starvation 12, sickness 15, thirst 3, bad belly 2) ≈ 2%.
Well-fed villages that die fighting — the food economy is not the
constraint on this road.

### Verdict: DIAGNOSTIC-GO — no blank; ambient foraging is the design

GO met via the "no blank" deliverable, with the measured numbers
showing the current surface is honest:

1. **The policy omission is deliberate, not an oversight.**
   competent.js counterPlay: "an honest player in the depletion build
   doesn't just forage harder — they build the second food leg"
   (garden + fish crew + water/wood upkeep). Foraging is intentionally
   left to villager agency — and the agency delivers 53.1% of intake.
2. **The 893 are villagers acting like people.** Lead-goal villagers
   with agencyScore ≥ 20 seize the forage domain as their power base
   (villager-agency.js:745, hardcoded task='forage'); the lead works it
   every part, bringing food when lean and wood/water/stone when full.
   The hunt-duty blank (no actor exists) does not apply here — the
   actor exists, it's the contender system.
3. **The three ambient streams are canon-honest**: free villagers living
   their day (villageLives), hunger-driven departures and returns
   (objMaybeDepart → npcNodeTravel), hungry villagers foraging adjacent
   greens (npcTakeAction). All narrated, all depleting real tiles, all
   knowledge-gated per CANON.md.
4. **No fix spec is warranted.** Starvation is 0.8% of deaths; the
   villages are not hungry for lack of foraging. A policy forage-
   staffing arm would be redundant — and the throttle would redirect it
   anyway on well-fed runs.

## Sense-test (law)

Read leadfeast-7625 day 34 (30 forage beats, 2,057 forage kcal) as a
player. The day reads HUMAN:

- Dawn: "The village threw out spoiled stores: Foraged food, Foraged
  food (dried). (pantry)" — rot is honest.
- The scholar eats dried foraged food, 160 kcal at a time — the
  preservation ladder working.
- "Devon heads out to forage. 'Back before dark. Probably.'" / "Wei
  heads out to forage…" / "David returns from foraging the wilds: +328
  kcal to the pantry." — named villagers leave with a spoken line and
  come back with hauls.
- "Ethan came back with 806 kcal of something edible. The pantry
  breathes." / "Emma came back with 626 kcal…" — the villageLives
  hauls, from a trail crew lead and a Pharmacist.
- "🍖 FEAST 📺 — Marcus opens the pantry wide: 6× Foraged food, 3×
  Foraged food (dried). Ivy, David eat until the fire burns low.
  Somebody laughs so hard they cry." — the food becomes a feast, with
  joy.
- "A runner from The Red Table, dusty and direct: 'Your foragers are
  stripping our side of the southeast ground. Back off — or we'll talk
  with teeth.' (Trust -3…)" — the depletion has DIPLOMATIC
  consequences. The living world notices.

Two repetition flags (polish, not blanks): (1) the departure line
"Back before dark. Probably." fires verbatim for every away-forager —
a single template, no pool; five identical lines in one day reads
robotic. (2) Roman's six PRODTHROTTLE checks in one day ("the shelves
are full, ~36 days… ~37… ~38") — the wobbling day-count across parts
undercuts the honest-narration intent. Filed below.

## Village assessment

These are foraging villages. The pantry is a forager's pantry: 53%
of everything eaten was carried home by someone who walked out past
the treeline — free villagers on their own day (Ethan's 806-kcal haul),
travelers returning dusty (David's +328), hungry villagers grabbing
greens (142 kcal snacks), and the ambitious ones who seized the whole
domain (the programmer of 7634, working it on both policies like they
owned it — because for 15% of sampled days, they did). Who thrived:
everyone who walked — 232 distinct villageLives foragers, occupation-
blind, from masons to librarians. Who died: fighters, 63% of 1,512
deaths — the food economy held while the war didn't. The policy built
its second leg (garden/fish) and never touched foraging, and the
village ate anyway — that division of labor is the design working. The
blank I was sent to find isn't there; what I found instead is the
proof that the engine's social layer is a competent sous-chef.

## Metric review (mandatory)

- PRIMARY (100% attribution) answered exactly: 5,990/5,990 events
  classified, 0 instrument errors, 32/32 schema-clean, named residual
  empty. The taskLead mechanism is proven from state (via='tasklead'
  on all 1,382 resolutions + v.taskLeads snapshots + the hardcoded
  task='forage' challenge site).
- INSTRUMENT HONESTY: one det-gate mismatch caught mid-run
  (leadfeast-7622, day 52): my creditDeed wrapper forwarded (id, deed)
  explicitly, dropping the third arg trackOverride — perturbing the
  wave-ledger XP and diverging the trajectory. Root cause found by
  bisecting to the first-diverging day; fixed by apply-through
  forwarding on ALL wrappers; re-ran the full gate: 8/8 byte-identical,
  0 errors. The lesson is recorded in the instrument header. No
  rescoping: the gate was pre-registered and met after the fix.
- Seeds: 16 fresh as pre-registered (7621-7628 + 7631-7638; the first
  sweep ran 8×2 before I caught the "16 seeds" reading — batch 2
  completed the corpus; no seed reused, all freshness checks pass).
- Horizon: 180d death-aware as pre-registered (early deaths at
  27/31/57/68/72/116/121/122/124/125/141/147/153/159/170d stopped by
  the engine tail — included, not cut).
- No metric was re-scored mid-run. The verdict ("no blank") is the
  pre-registered GO deliverable for the no-blank branch, not a
  consolation re-score: the numbers (53.1% of inflow, 0.8%
  starvation deaths, deliberate policy omission) are the evidence the
  pre-registration asked for.
- §15: per-seed panel-schema JSONs emitted (schema
  'foragelead-wall/1', 32 files); no lever piloted, so no
  balance-panel compare (audit, not a lever — same as huntduty).

## Findings for sim-findings.md

- [open] 2026-10-17 — forage departures — the away-forage departure line "Back before dark. Probably." is a single template fired verbatim per departure (5 identical lines in one day on leadfeast-7625 d34); needs a pool like the other ambient lines (sim-foragelead-b sense-test).
- [open] 2026-10-17 — prodthrottle narration — the pantry-check beat repeats per part with a wobbling fresh-days count (~36→~38 in one day); reads as the engine recomputing, not a person checking (sim-foragelead-b sense-test).
- [open] 2026-10-17 — forage economy — away-forage (objMaybeDepart hunger-driven departures) is 45% of forage kcal / ~24% of total pantry inflow: the single largest ambient food stream, worth naming on the food-economy axis (sim-foragelead-b).
- [open] 2026-10-17 — tasklead forage — on well-fed runs 100% of forage-lead labor redirects to wood/water/stone (PRODTHROTTLE); the lead only brings food home on lean runs (87/1,382 resolutions). The domain functions as flexible labor reserve, not a food source, whenever the pantry is full (sim-foragelead-b).
