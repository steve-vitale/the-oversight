# flesh-out r16 arm C — villager field survival census + exposure-control pilot

Worker: sim-villsurv | run_id fleshout-20261013T1930Z-r16 | axis scale-onramp
Date: 2026-10-13. Canon read: docs/CANON.md, docs/MONSTER-WAVES.md.
Canon constraint: Highbeam Deer (160 HP) is the benchmark — unquestioned.

## Question
Binding constraint per convergence tracker: survival-to-national (median ~84d needed).
r15 baseline: villager combat deaths 10 across 8 runs; earlier runs: villager:monster
deaths 60% of villager deaths (26 wave-1 field deaths). The combat-lever run tried
villager counter-EXECUTION — KILLED AT PILOT (villagers held 1–2 rounds longer in
losing fights). The open question is EXPOSURE, not execution: do villagers walk
into fights they can't win, and can policy-side control of villager field
exposure reduce villager deaths without collapsing the food economy?

## Phase 1 — death-cause census (descriptive, no GO/KILL)
Instrument: `scripts/villdeath-census-20261013.js` (wraps Game.fieldFight +
Game.registerDeath; no game-code behavior changes) + sweep driver
`scripts/test-villdeath-sweep-20261013.js`.
For every field fight: monster id/wave/damage, villager HP, armed state (weapon
bonus + armor P, pre- AND post-fight — villagers re-equip at fight entry via
villagerGearUp), node + manhattan dist from haven, away purpose, ambushed vs
evaded, player present/at haven, contest/arena flag.
For every villager death: cause, day, linked same-day vDie fight, say-line
capture for sense-testing.
Suite: seeds 11/22/33/44 × belongseek/leadcourt, 150d death-aware (8 runs —
pilot budget per Steve 2026-10-13).
Census answers: which wave kills villagers, where (haven vs wild node,
distance), why are they there (expedition purpose), armed or not, ambushed or
contact, player present or not.

## Phase 2 — pilot lever: WOUND-WARD (REDIRECTED per pre-registered census gate)
Census gate FIRED: villagers die ARMED (17/31 vDie fights, death rate armed
6.0% vs unarmed 4.5% per contact — arming helps kills, not survival) and
WOUNDED (median hp0 22 vs 79 for all contacts; 27/31 entered at <50 HP).
Armory-stock is killed by the census — it would not move the primary metric.
The redirect: wound-state exposure control, policy-side.

WOUND-WARD (`scripts/policies/woundward.js`, `withWoundWard` wrapper):
every morning at haven, the player donates ALL medicine in inventory to the
communal pharmacy (`Game.donateMedicine`). The engine's villagerHealCheck
(expedition/patrol departures) then heals from real stock (bestFit full
heal) instead of the flat +25 or sit-out. Baseline probe: pharmacy 0.0 doses
all run; healer present ~always (Fatima/Walt); healerRounds +15/day one
villager; heal check only gates expeditions/patrols, NOT objective
departures (water/visit/traps — the actual death purposes). Small, exact:
morning-first, haven-only, donate-all, no game-code changes.

Pre-registered thresholds (unchanged from above): PRIMARY villager:monster
death share (NPC) GO ≥15pp reduction vs baseline 0.865; KILL <10pp.
Guards: median survival ≥ baseline 82.5d − 5; pantry ≥ baseline −10%;
national/table not worse than 4/8 / 0/8.

### Pre-registered thresholds (honest) — apply to the wound-ward pilot
- Horizon: 150d death-aware (median survival ~50d baseline; 150d headroom).
- Seeds/policies: identical 11/22/33/44 × belongseek/leadcourt, 8 runs.
- PRIMARY — villager:monster death share (monster-caused villager deaths /
  all villager deaths): GO ≥15 percentage-point reduction vs baseline;
  KILL <10pp reduction.
- SECONDARY guards (all must hold for GO):
  1. median survival ≥ baseline median − 5d (no survival regression)
  2. pantry security: median pantry-days (20–90d window) ≥ baseline − 10%
  3. national reach not worse than baseline; table not worse
  4. food economy: total fresh rot share no worse than baseline − 5pp (the
     lever must not starve the village — exposure control that collapses
     the food economy is a kill, full stop)
- Convergence verdict target: if GO → armory-stock lands as its own commit
  (own proof test, own evidence section), scale-onramp gains a verified
  exposure-control instrument; if KILL → no trace (policy file deleted, no
  game-code touched anyway).

Census may redirect the lever (documented below): if villagers die armed,
the lever becomes a RECALL/HOLD policy variant instead of armory stock —
thresholds above still apply with "armed-fight share" as the census gate.

## Wall numbers (every run)
national / table / wins · wave 4–5 unlocks · median/max survival ·
death-cause shares · trap acquisition by source · counter discovery/kill
rate · young-link succession survival · tier-2 / wave-3 reach.

## Results

### Phase 1 — census (baseline: 8 runs, seeds 11/22/33/44 × belongseek/leadcourt, 150d death-aware)
Raw: `/tmp/villdeath-base.json` (in-tree instruments: scripts/villdeath-census-20261013.js,
scripts/test-villdeath-sweep-20261013.js, scripts/analyze-villdeath-20261013.js).

Wall numbers: national 4/8, table 0/8, wins 0/8, wave 4–5 unlocks 0/8,
median survival 82.5d, max 150d. (belongseek/leadcourt scale policies reach
national 4/8 here vs r15's 0/8 on competent/winseek — the wall suite's
policies matter.)

NPC villager deaths: 37 total. Monster-caused: 32 (share **0.865** — the
primary-metric baseline). By wave: w1 27, w2 4, w3 1. Non-monster: starvation
2, wound 2, other:combat 1 (1 residual; the rest of the old "other:combat"
bucket was player-vessel deaths, now separated via mantleOf).

Which wave kills villagers: **wave 1 (84% of monster kills) — hushwolf 18,
gallowdeer 4, belltoad 5** (Highbeam Deer untouched per canon).
Where: 25/27 wild, median 2 nodes from haven.
Why are they there (awayPurpose): visit 7, expedition 5, water 4, guard 3,
traps 2, leave 2, explore 2, none 2 — ORDINARY LIFE, not just expeditions.
Ambushed (failed awareness check): 5/27. Player present: 2/27.

The headline: **villagers die at median 22 HP entering the fight** (vs 79
for all contact fights); 27/31 vDie fights entered at <50 HP; median 1
round, vTaken > hp0 — one-shot while already hurt. Armed 17/31: death rate
per contact armed 6.0% vs unarmed 4.5% — arming helps KILLS (9.3% vs 6.4%)
but not SURVIVAL. Census gate FIRED → armory-stock killed before building.

593 contact fights → 31 vDie (5.2%/contact). Allies arrived 0/593
(party-wiring not engaging in sims — game-code blank, see findings).

### Phase 2 — wound-ward pilot: KILLED (3.6pp < 10pp GO)
8 identical seeds. NPC monster share: 0.865 → 0.829 (−3.6pp). Guards held:
median survival 94d (≥77.5), national 4/8 (not worse), table 0/8.
Lever fired but supply-starved: 0/4/9 medicine donations across probe seeds;
pharmacy sits at 0.0 doses baseline; no craftable medicine exists (36
recipes, none healing). The lever is mechanically sound (s33: 9 donations →
NPC deaths 8→2 belongseek) but RNG-supply-capped. Killed per pre-registered
threshold; policy file deleted, no game-code touched by the lever.

### Blank filled (sense-testing)
`fieldFightSummary` mFlee branch lied: "bloodied but breathing" on 0-round,
0-damage stand-downs (237/8 runs) — same class as the r4 vFlee fix.
Fixed in src/js/fieldFights.js (one line); proof scripts/test-fieldfight-summary-20261013.js
(4/4 green). No [needs-eyes] — narration honesty, not feel.

### Findings appended to sim-findings.md
- objective departures (water/visit/traps) have NO heal gate — expeditions do (70 HP)
- party-wiring allies 0/593 in sims
- pharmacy supply: zero craftable medicine; heal check starved
- player-vessel deaths confound villager death metrics (mantleOf separation now in census)
