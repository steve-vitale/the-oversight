# sim-shellcounter-b — policy-side COUNTER shelling layer (loop B, run fleshout-b-20261017T1940Z, axis food-economy)

Fills finding #484 (hidden_files/sim-findings.md:484): returnToVillage stages
unprocessed hauls pack -> prep-stash counter (src/js/game.js:7883, honest
"unprocessed hauls onto the counter — the clock is ticking" beat) — so
in-shell nuts land on the kitchen counter with a ticking spoilage clock and
no policy ever shells them there. The sim-shelltask-b layer covered the PACK
only, by design (and was killed twice: first on a literal starvation
guardrail — evidence/2026-10-17/sim-shelltask-b.md; then the revival on
ENGAGEMENT, 376 kcal total, 0 on starvation days —
evidence/2026-10-17/sim-shellrevive-b.md). The sibling camp-task census
(evidence/2026-10-17/sim-camptasks-b.md) measured the counter-side headroom:
in-shell nuts 838,550 kcal total, **5,704/lean-day**, verified rotting on the
counter (leadfeast-7108 d174: 14 stacks of in-shell acorns/hickory on the
prep counter while the scholar starved at 27 kcal, fire nearby; "Overnight,
Hickory Nuts (in shell) went bad — beyond saving"). The pack-shelling
substrate was seed-sporadic (nuts rarely in pack on lean days); the counter
pool is 5.7k kcal per lean day. This arm teaches the competent policy the
counter beat.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14–15)

- PRIMARY: mechanism engagement ON LEAN DAYS — counter-nut kcal shelled on
  lean days (armed) vs 0 control (control never shells counter nuts — zero
  baseline by construction). Day type split at firing time: LEAN = scholar
  kcal < 50% of kcalCap (the camptasks-b day-type convention); FED = the
  rest. Both buckets measured and reported; FED expected ~0 (the layer fires
  lean-only by design).
- GO threshold: **>= 2,000 kcal counter-nuts shelled on LEAN days** across the
  16 armed runs. Honesty note: census headroom is 5.7k/lean-day, so this bar
  is ~0.35 lean-days' worth of pool — clears fast if the mechanism engages
  on real lean days (nuts staged, scholar hungry at Haven, time to spare),
  kills fast if the substrate starves it (nuts rot before a lean day, scholar
  never hungry at Haven with counter nuts present). A miss is NO-GO, never
  re-scored mid-run — and FED-day kcal may NOT be re-scored as a substitute.
- GUARDRAILS: starvation deaths armed <= control+2 (the shelltask-b
  metric-review noise margin — a ±1 pooled difference is trajectory noise,
  not signal); no new death mode; national >= control−2; median survival >=
  control−10d; det-gate byte-identical with the gate OFF.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: **7301–7308** (FRESH — zero hits in evidence/ and hidden_files/ as
  of 2026-10-17 14:50 CDT; banned/used lists scanned: 7001-7008, 7101-7108,
  7601-7608, 7611-7618, 7621-7628, 7631-7638, 7701-7708, 7901-7908,
  8701-8808/8901-8908/9701-9708 blocks, 4801-4808, 4101-4108, 6101-6108,
  5201-5208, 931-938, 941-948, 951-958, 962-969, 1801-1808, 4201-4208,
  3801-3808, 4001-4004, 4701-4708, 107-884, and the 1201/1701/3101/3201/
  3301/4301/4401/4501/5101 blocks).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep control, identical seeds. Screening =
  pilot only (8 seeds x 2 policies x {control,armed} = 32 runs); the pilot
  metric IS the verdict. Confirm (12–16) only if pilot GO.
- PROOF FIRST: scripts/test-shellcounter-b.js — RED-verified (gate-on
  fixture fails pre-edit behavior), GREEN post-edit; det-gate byte-identical
  gate-off; SMOKE green.
- KILL FAST: if the mechanism cannot engage on lean days on fresh seeds,
  KILL at pilot and say so — zero-trace layer deletion, instruments +
  evidence kept.
- §15: per the shellrevive-b metric-review deviation, the official
  balance-panel driver cannot express this arm (policy-side layer,
  FEASTSCALE_R13 substrate, leadfeast/belongfeast not panel policies, the
  contract lacks starvation/shelled-kcal/pantry metrics). Per the escape
  hatch: light per-seed panel-schema JSONs for the wall metrics + arm
  metrics (evidence/2026-10-17/panel-shellcounter/) and the pre-registered
  metrics judged directly. Deviation noted here.

## The lever (policy-side, scripts/policies/shellcounter.js, SHELLCOUNTER=1 default OFF)

`withShellCounter(base)` wraps the feastscale policies. The COUNTER BEAT, on
a lean camp day at Haven — scholar hungry (<50% cap), physically at the hall
(havenStoresAccess() !== 'none' — the counter is physical, Steve 2026-10-04),
in-shell nuts on the prep-stash counter, time to spare — the scholar shells
the counter batch (Game.shellNuts(undefined, Game.prepStash()): the EXACT
engine call the stash "Shell them" button makes, app.js:15038) and then puts
the finished food away (Game.putAwayFinished(): shelled nuts are finished
food — edible, no longer unprocessed — so they flow counter -> pantry, where
competentEat's takeFromPantry and the village's own consumption can reach
them; without the put-away the shelled nuts would sit on the counter with a
spoilage clock and no eater). Once per day, before the base upkeep/daily, so
the base policy's own eat flow then eats the pantry's shelled nuts.

GATES (all honest, all engine-state; checked against the verb):
- SHELLCOUNTER=1 (default OFF; gate-off = pure delegation to the base policy).
- Scholar alive, no tbfight (tickAction no-ops mid-fight; shelling without the
  time cost would be dishonest), no active contest.
- Lean day: scholar.kcal < 50% of kcalCap() — the day-type split the PRIMARY
  measures. (FED days never fire: a full scholar shelling nuts is a chore,
  not a decision.)
- At Haven stores: havenStoresAccess() !== 'none' — hands in the hall.
- In-shell nuts on the counter (unspoiled; the engine refuses rot honestly
  in the put-away).
- Time to spare: dayTicks + 4 + 64 < TICKS_PER_DAY — 4 honest ticks for the
  shell, 64-tick margin; never rolls the day, never enters the sleep-refusal
  window, never costs a critical action.
- Once per day (ctx._scShellDay).
- VERB-GATE READING (food.js:2745): the 'shell' task lists NO fire block and
  NO knowledge block — "Shell them · 4 ticks · net 75% of gross · everyone
  knows how" (food.js comment: "SHELL: hands or a stone"; the stash button
  renders unconditionally, app.js:14501). So the layer carries NO fire gate
  and NO knowledge gate — adding them would contradict the verb's own terms.
  This is the deliberate canon reading; flagged here.

Zero src/js changes. Zero overlap with sibling arms (sim-cookbulk-b owns
scripts/policies/cookbulk-b.js; sim-shelltask-b's layer is deleted).

Telemetry on ctx: _scShellDay (once-per-day guard), _scShellDays,
_scShelledKcal (net 75% converted, engine formula), _scShelledKcalLean /
_scShelledKcalFed (day-type split at firing).

## Proof (scripts/test-shellcounter-b.js) — 16/16 GREEN

- PART A (gate-logic units, 11/11): counterNuts finds in-shell counter nuts /
  ignores empty counter / ignores shelled nuts; leanDay split at 50% cap
  (hungry true, fed false, exactly-50% fed); timeToSpare mid-day true /
  nearly-spent false; atHavenStores inside true / none false; layerOn()
  default OFF.
- PART B (RED->GREEN fixture, live engine, constructed lean Haven state):
  RED — base belongfeast upkeep leaves counter nuts in shell (behavior absent
  pre-edit). GREEN — wrapped upkeep (SHELLCOUNTER=1) shells the counter batch
  (600+375 gross -> net), putAwayFinished moves the shelled nuts to the
  pantry, and the engine's normal pantry-eat then eats them (scholar 300 ->
  >1500 kcal).
- PART C (det-gate): wrapped SHELLCOUNTER-unset vs unwrapped base, per-day
  trajectory hashes, 60d x 8 seeds x 2 policies — 16/16 byte-identical, no
  layer-attributable divergence (base-vs-base control for substrate noise).
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.

## Before / after (pilot: 32 runs, seeds 7301–7308 x 2 policies x {control,armed}, 180d death-aware)

| metric | control (16) | armed (16) |
|---|---|---|
| shell days | 0 | 86 |
| shelled kcal converted (total) | 0 | 671,458 |
| shelled kcal on LEAN days (PRIMARY) | 0 | 671,458 |
| shelled kcal on FED days | 0 | 0 |
| eat kcal on shell days (proxy) | 0 | 128,485 |
| scholar pantry takes, kcal (v.takes[vid]) | 655,193 | 356,973 |
| paired pantry-draw displacement, control−armed | — | +298,220 |
| starvation deaths | 7 | 22 |
| player starvation deaths | 2 | 4 |
| paired starvation sign (better/worse/tied) | — | 1 / 6 / 9 |
| national | 12/16 | 12/16 |
| table | 13/16 | 14/16 |
| wins | 0 | 0 |
| exiled | 0 | 0 |
| wave4 / wave5 | 0 / 0 | 0 / 0 |
| arc2 / arc3 / arc4 | 16 / 16 / 13 | 16 / 16 / 14 |
| fourRealm | 0 / 16 | 0 / 16 |
| starved days (scholar <500) | 13 | 18 |
| median survival | 182d | 174d |
| max survival | 182d | 182d |
| instrument errors | 0 | 0 |

Death-cause histogram: armed bloodier overall (combat 453 vs 379, villager
combat 162 vs 154, monster 79 vs 68, expedition 42 vs 50, sickness 19 vs 5)
— the armed trajectories diverged into harder lives. Armed-only cause
strings: "The Anaconda Empress" (2), "The Big Beast" (1) — procedural
monster descriptors (control has "Sunback", "Ugly-Eyes", "Gavel", "Choir
Toad" in the same class; cf. shelltask-b's "Big Ugly") — and "the night"
(4), a rare pre-existing endDay cold-exposure attribution (game.js:18913),
not a new killing mechanism. No new death MODE.

Engagement by run (armed, all 16 engaged): s7308-belongfeast 4d / 94,838;
s7303-belongfeast 3d / 82,801; s7303-leadfeast 4d / 80,364;
s7302-leadfeast 14d / 71,779; s7307-belongfeast 22d / 57,529;
s7306-leadfeast 2d / 52,943; s7304-belongfeast 6d / 45,001;
s7307-leadfeast 2d / 39,450; s7302-belongfeast 9d / 38,403;
s7308-leadfeast 1d / 36,188; s7306-belongfeast 2d / 31,470;
s7305-belongfeast 7d / 13,277; s7304-leadfeast 2d / 13,201;
s7301-leadfeast 4d / 9,301; s7305-leadfeast 2d / 2,588;
s7301-belongfeast 2d / 2,325. Control never shells (0 by construction and by
measurement).

## Panel compare (evidence/2026-10-17/panel-shellcounter/compare-shellcounter-b.md)

Light per-seed panel-schema JSONs (control.json / armed.json) for the wall
metrics (national/table/wins/exiled/survivalDays/starvationDeaths) plus arm
metrics (shelledKcal/shelledKcalLean/shelledKcalFed/shelledDayEatKcal/
scholarPantryTakes). Compare .md attached in panel-shellcounter/.

## Verdict: NO-GO (guardrail miss) — layer killed zero-trace

PRIMARY met decisively: 671,458 kcal shelled on LEAN days vs 0 control (GO
>= 2,000) — 16/16 armed runs engaged, 86 shell days, FED bucket 0 by design.
But GUARDRAIL MISSED: starvation deaths armed 22 vs control 7, against the
pre-registered bound armed <= control+2 = 9. Per MEASUREMENT.md §14 the miss
binds — NO-GO, never re-scored mid-run. The layer
(scripts/policies/shellcounter.js) is deleted zero-trace; instruments +
evidence kept and committed.

Guardrail notes (all others HOLD, for the record): national 12 >= 12−2;
median survival 174d >= 182−10d; no new death mode (armed-only strings are
procedural monster names + a rare pre-existing attribution); det-gate 16/16
byte-identical gate-off; pantry displacement +298,220 kcal >= 0 (the
shellrevive-b validated instrument — the scholar drew LESS pantry food
armed, the shelled nuts fed the village instead).

## Telemetry deviation check

`telemetry-check.js` vs scale-wall.json baseline
({national:12, table:16, wins:16, exiled:0}), n=32 files: three LOUD lines —
national 12→24, table 16→27, wins 16→0. Hand-verified per the
schema-gap finding: BOTH arms agree identically (national 12/12, table
13/14, wins 0/0, exiled 0/0). This corpus (seeds 7301–7308, pre-seat
r13-only substrate, FEASTSCALE_R13=1/SEATDRIVE=0) never wins and never
reaches wave 4 — wins are a corpus/substrate property (no modal driver on
the feastscale road), not an arm effect. TRIAGED AS EXPLAINED
substrate-mismatch per the brief; baseline NOT rolled.

## Metric review (mandatory)

1. THE ENGAGEMENT SUBSTRATE IS REAL. Unlike the pack-shelling arm (killed
   on engagement: 376 kcal, 0 on starvation days — nuts rarely in pack on
   lean days, seed-sporadic), the counter pool is NOT seed-sporadic: 16/16
   armed runs engaged, 671k kcal on lean days, every run. The #484 blank is
   filled by the mechanism — the kill is on the guardrail, not the design.
   A future run should not re-litigate engagement; it should resolve the
   starvation signal.
2. THE STARVATION SIGNAL IS REAL BUT MECHANISTICALLY OPAQUE. 22 vs 7 with
   paired sign 6 worse / 1 better / 9 tied is not the shelltask-b ±1 noise
   pattern. But no food-channel mechanism exists: the layer ADDS 671k kcal
   to the shared pantry (pantryAdd: no RNG, no redistribution, cap-honest);
   the scholar drew 298k LESS pantry food armed (displacement instrument —
   the shelled nuts fed the village, not a diversion); the biggest shellers
   did fine or better (s7308-belongfeast: 94,838 kcal shelled, starvation
   1 vs 4 BETTER; s7302-leadfeast: 71,779, 0 vs 0; s7303-belongfeast:
   82,801, 1 vs 1). The scholar never starved in the worse pairs
   (playerStarvation 0 in all six worse pairs — the +2 player delta is
   elsewhere). The armed side is bloodier overall (combat +74) and the
   worse pairs are collapse-adjacent (village-lost with starvation in the
   tail). Best current hypothesis: the 4-tick dawn perturbation + item
   reorder chaotically re-times collapses on famine-prone seeds (s7304,
   s7306, s7308 are collapse seeds on both arms) — but with n=7 non-tied
   pairs the asymmetry (6/1) cannot be dismissed as noise either. This is
   the honest unresolved question for the next run.
3. PROPOSAL FOR THE NEXT RUN: revive with a guardrail that can resolve
   harm instead of the pooled count: (a) villager-starvation only,
   collapse-tail-adjusted (deaths after village-lost excluded — the tail
   is a different regime); (b) a larger seed set (16+) to resolve the
   chaotic component; (c) the pantry-displacement instrument as the binding
   food-channel guardrail (it held at +298,220 here). Do NOT re-run the
   engagement screen — it passed 335x over.
4. THE VERB-GATE READING HELD. No fire gate, no knowledge gate — the layer
   fired on 100% of its lean-day opportunities with zero gate friction,
   and the fiction reads clean (see sense-test). The "everyone knows how"
   design is load-bearing for engagement.
5. §15 DEVIATION (same as shellrevive-b): the official balance-panel driver
   cannot express this arm (policy-side layer; FEASTSCALE_R13 substrate;
   leadfeast/belongfeast are not panel policies; the contract lacks
   starvation/shelled-kcal/pantry metrics; its validity gates cannot be
   honestly satisfied by a light emission). Light per-seed panel-schema
   JSONs emitted for the wall + arm metrics; the panel's own compareMetric
   paired-interval statistics run on the contract-overlapping metrics;
   pre-registered metrics judged directly. Deviation noted here.

## Reachability verdict

Policy-side food lever; no content gates touched. Wall numbers on this
corpus (both sides): national 12/16, table 13–14/16, wins 0/16, wave-4
0/16, wave-5 0/16, median survival ~178d, fourRealm 0/16. The wave-4/5 zeros
and the win zero are corpus/substrate properties (pre-seat r13 road, no
modal driver) — both sides agree, so the arm changed nothing about
reachability.

## Village assessment (plain words)

Two kinds of villages on this corpus. The thriving kind (s7301/s7306/s7307
runs: d182 survived, national, table, Arc 4): deep runs where the counter
beat is a lean-season supplement — the scholar shells 30-80k kcal of nuts
into a pantry the village is already eating from, and the "Put away: N
finished batches → pantry. The counter breathes." beat lands like a person
tidying the kitchen before the hungry season. The dying kind (s7304, s7308:
collapse seeds; s7306-belongfeast armed): famine and raids kill these
villages while the counter beat fires anyway — the scholar shells nuts into
a pantry that Thornfield raids the same night ("carried off ~1400 kcal from
the pantry. Nobody's dead, but the message is clear"). The mechanism does
what #484 asked: it converts the rotting counter pool into village food on
exactly the lean days the census measured. It does not save villages whose
problem is raids and collapse timing — food is the margin, not the battle.
Combat remains the standing killer (~830 combat deaths across both arms);
starvation is the margin, and on this corpus the margin moved against the
armed side in a way the food channel cannot explain — that is the open
question the next run inherits.

## Sense-test (SENSE-TESTING LAW — transcript read)

Read s7302-leadfeast-armed d126/d130/d132 (scripts/sense-shellcounter-20261017.js,
14 shell days on the run). It reads like a person taking stock, not a
script: "Hunger gnaws. The pack is thin — work the green, haul it back, get
it named at camp. That's the whole game." → "You crack and pick 2 lots of
nuts. Shells everywhere — the net is less than the gross looked. (4 ticks)"
→ "Put away: 2 finished batches (1.6 Mcal) → pantry. The counter breathes."
The loop is legible across days: the scholar forages acorns with practiced
hands ("7× White Oak Acorns (in shell — shell them to eat)"), they stage
"1 unprocessed haul onto the counter — the clock is ticking", and on the
next lean day the shelling fires. The village lives around the beat: Thornfield
raids carry off pantry kcal the same nights, the meal line reads "Half
ration — they don't trust you yet", and on d132 "No food in the pantry. The
village is hungry." beside the scholar shelling 1.2 Mcal into it. Villagers
act like people where sampled: Rosma/Adel/Kojo work the creek, Kusi studies
a palm (2/3 looks). The mechanism is coherent, consequential, and human —
which is why the guardrail miss stings: the design deserves a second run
with a harm-resolving guardrail, not a burial.
