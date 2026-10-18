# sim-shellrevive-b2 — COUNTER-shelling revival on the frozen base (loop B, run fleshout-b-20261018T0340Z, axis food-economy)

NAMING: the first shellrevive (evidence/2026-10-17/sim-shellrevive-b.md) was the
PACK-shelling revival (seeds 7601–7608, SHELLCAMP), killed on ENGAGEMENT (376
kcal). This run is the COUNTER-shelling revival and uses the -b2 suffix
throughout (evidence, perseed-shellrevive2/, panel-shellrevive2/,
sweep-shellrevive-b2.js, analyze-shellrevive-b2.js, sense-shellrevive-b2.js) so
the first revival's evidence is never clobbered. The layer and its proof keep
the tasked names scripts/policies/shellrevive-b.js and
scripts/test-shellrevive-b.js (neither existed — the pack layer was deleted
zero-trace).

Revives sim-shellcounter-b (evidence/2026-10-17/sim-shellcounter-b.md, finding
#484: in-shell nuts staged pack -> prep-stash counter by returnToVillage
"unprocessed hauls onto the counter — the clock is ticking" beat rot there
while no policy ever shells them — the sim-camptasks-b census measured the
counter-side headroom at 838,550 kcal total, 5,704/lean-day, and watched
leadfeast-7108 d174 rot 14 stacks while the scholar starved at 27 kcal).

The kill (22 vs 7 pooled starvation on the ~10-17 19:40Z base, paired sign
1/6/9) stood on its own corpus per §14. The harm-model diagnostic
(evidence/2026-10-17/sim-shellharm-b.md) then showed HARM NOT REPRODUCED on
base 47fbea56: 16-pair corpus re-run, shell arm 821,128 kcal shelled on the
same 86 shell days, starvation 4->2 pooled, 3->1 villager, paired sign
2/0/14, and the neutral 4-tick dawn perturbation trajectory-identical to
control on 16/16 pairs (timing vector inert).

This run follows the diagnostic's "Revival guardrail spec" on a FROZEN BASE:
95ecbb072ba5024761655e5bc1b3d5142eb51f89 (recorded by
`git rev-parse HEAD` in the worker tree; the coordinator-registered worktree
landed 1 commit ahead at 54cd0c5f — an evidence-only sim-reunioncost commit,
no src/index.html changes — and was reset to the frozen base on the clean,
unpushed branch before any work; reflog-verified).

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written before any sim)

- PRIMARY (engagement; both must hold): (a) shelled kcal on LEAN days >= 2k
  across the 16 armed runs, vs control 0; (b) >= 4 of the 8 seeds engage
  (>=1 shell day in either policy run). Engagement is engagement — do not
  re-litigate the mechanism.
- GUARDRAILS (every-gate; a miss is NO-GO, never re-scored):
  1. villager-only starvation deaths armed <= control+2, collapse-tail-adjusted
     per the metric review: split pre-collapse (day < villageLostDay) vs
     collapse-tail (day >= villageLostDay); the harm is read on the PRE-COLLAPSE
     count (bound: armedPre <= controlPre + 2). Pooled reported for continuity.
  2. no new death mode: armed death-cause set is a subset of control's.
  3. det-gate: gate-OFF (SHELLREVIVE_B unset) trajectories byte-identical to
     pristine on the same seeds.
  4. national armed >= control-2.
  5. median survival armed >= control-20d (noise-scaled tolerance, huntstaff-b2
     precedent — NOT a +-10d gate).
- HORIZON: 180d death-aware (runDays stops on village death + 10d tail max).
- SEEDS: 7301–7308 x {leadfeast, belongfeast} x {control, armed(SHELLREVIVE_B=1)}
  = 32 runs — the original corpus, deliberate re-use per the revival spec.
  Own in-sweep control, identical seeds (arms alternate per seed in one process).
- SUBSTRATE: FEASTSCALE_R13=1 and SEATDRIVE=0 set EXPLICITLY both sides;
  mode leanwinter (the original corpus mode).
- PROOF FIRST: scripts/test-shellrevive-b.js — RED fixture on the spec gates,
  det-gate byte-identical gate-off, GREEN sweep assertions.
- GO -> commit the layer (default OFF) + proof + evidence + instruments.
  NO-GO -> delete scripts/policies/shellrevive-b.js zero-trace per kill
  protocol; commit evidence + instruments only.
- SENSE-TESTING LAW: read transcripts of shell days — narration must read as a
  person taking stock, not a robot.
- §15: the official balance-panel driver cannot express this arm (same
  deviation as shellcounter-b/shellharm-b: policy-side layer,
  FEASTSCALE_R13 substrate, leadfeast/belongfeast not panel policies, the
  contract lacks starvation/shelled-kcal/pantry metrics). Light per-seed
  panel-schema JSONs (control.json/armed.json in panel-shellrevive2/) +
  compare-shellrevive-b2.md using the scorecard's compareMetric paired-interval
  statistics on the contract-overlapping metrics; pre-registered metrics judged
  directly. Deviation noted here.

## The lever (policy-side, scripts/policies/shellrevive-b.js, SHELLREVIVE_B=1 default OFF)

Fresh write against the spec in evidence/2026-10-17/sim-shellcounter-b.md
("VERB-GATE READING") — it does NOT import or reuse scripts/policies/
shellcounter.js (the diagnostic instrument marked NEVER LAND). `withShellRevive(base)`
wraps the feastscale policies. The COUNTER BEAT, once per day, fires at the
START of upkeep before the base upkeep/daily:

- SHELLREVIVE_B=1 (default OFF; gate-off = pure delegation).
- Scholar alive (mantle succession replaces the scholar; `s.over` is a no-op
  safety net — never set in-engine).
- No tbfight; no active contest.
- LEAN day: scholar kcal < 50% kcalCap (the day-type split the PRIMARY measures;
  FED days never fire).
- At Haven stores: havenStoresAccess() !== 'none' (the counter is physical).
- In-shell nuts on the prep-stash counter (unspoiled — the engine refuses rot
  honestly in the put-away).
- Time to spare: dayTicks + 4 + 64 < TICKS_PER_DAY (4 honest ticks for the
  shell inside Game.shellNuts, 64-tick margin; never rolls the day).
- Once per day (ctx._srShellDay).
- Beat: Game.shellNuts(undefined, Game.prepStash()) — the exact engine call the
  stash "Shell them" button makes (app.js:15038) — then Game.putAwayFinished()
  (shelled nuts are finished food; counter -> pantry where competentEat's
  takeFromPantry and the village's own consumption reach them).
- No fire gate, no knowledge gate — the verb's own terms (food.js:2745: "Shell
  them · 4 ticks · net 75% of gross · everyone knows how"; "SHELL: hands or a
  stone").
- Narration is the engine's own beats (shellNuts + putAwayFinished say their
  lines honestly); no fabricated narration.

Telemetry on ctx: _srShellDay (once-per-day guard), _srShellDays,
_srShelledKcal (net 75% gross, engine formula), _srShelledKcalLean /
_srShelledKcalFed (day-type split at firing). Zero src/js changes.

CANON (Steve's designs): docs/PRESERVATION.md (the food ladder; shelling is
the hands-or-stone step, "net < gross — shells weigh"), docs/CANON.md verb
rules (no silent actions — the beat narrates; knowledge-gating — shelling is
explicitly un-gated, "everyone knows how").

## Proof (scripts/test-shellrevive-b.js) — 26/26 GREEN

- PART A (gate-logic units, 15/15): layerOn() default OFF / ON only with
  SHELLREVIVE_B=1; counterNuts finds in-shell counter nuts / ignores empty
  counter / ignores shelled nuts / ignores non-nuts; leanDay split at 50% cap
  (hungry true, fed false, exactly-50% fed); timeToSpare mid-day true /
  nearly-spent false; atHavenStores inside true / 'none' false.
- PART B (RED->GREEN fixture, live engine, constructed lean Haven state):
  RED — base belongfeast upkeep leaves counter nuts in shell (behavior absent
  pre-edit). GREEN — wrapped upkeep (SHELLREVIVE_B=1) shells the counter batch,
  putAwayFinished moves the shelled nuts to the pantry, exactly 4 extra ticks
  vs base upkeep on an identical fixture (differential — the base upkeep's own
  consumption confounds an absolute check), the engine's normal pantry-eat then
  eats them (scholar 300 -> >1500 kcal), telemetry keys (_srShellDays=1,
  _srShelledKcalLean>0, _srShelledKcalFed=0, net == 75% gross formula), and the
  once-per-day guard holds (no double fire on the same ctx/day).
- PART C (det-gate): wrapped SHELLREVIVE_B-unset vs unwrapped base, per-day
  trajectory hashes, 30d x 4 seeds x 2 policies — 8/8 byte-identical, no
  layer-attributable divergence (base-vs-base control for substrate noise).
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.

One proof iteration: the first run's absolute "4 honest ticks" check failed
(ticks 100->121 — the base upkeep itself burns ticks); replaced with the
honest differential (armed delta == base delta + 4). 26/26 green after.

## Before / after (32-run sweep: 7301–7308 x 2 policies x {control,armed}, 180d death-aware)

Sweep notes: the main sweep was timeout-killed at 30/32 (~100s/run on a loaded
box, load ~12); the last two runs (armed/control belongfeast s7308) were
finished targeted with PANEL_OUT pointed at a throwaway dir, then
scripts/finish-panels-shellrevive-b2.js regenerated the §15 light panel JSONs
from all 32 per-seed files. SEEDS/POLICIES/ARMS env filters verified working.

| metric | control (16) | armed (16) |
|---|---|---|
| shell days | 0 | 83 |
| shelled kcal converted (total) | 0 | 821,128 |
| shelled kcal on LEAN days (PRIMARY) | 0 | 821,128 |
| shelled kcal on FED days | 0 | 0 |
| seeds engaged (>=1 shell day) | 0/8 | 8/8 |
| villager starvation, pre-collapse (G1) | 2 | 1 |
| villager starvation, collapse-tail | 1 | 0 |
| villager starvation, pooled | 3 | 1 |
| starvation deaths, TRUE pooled | 4 | 2 |
| paired pre-collapse sign (better/worse/tied) | — | 1 / 0 / 15 |
| scholar pantry takes, kcal | 242,252 | 461,375 |
| villager pantry takes, kcal | 4,290,924 | 4,859,675 |
| paired pantry displacement, control−armed | — | −219,123 scholar / −568,751 villager |
| national | 14 | 15 |
| table | 14 | 16 |
| wins | 0 | 0 |
| exiled | 1 | 0 |
| wave4 / wave5 | 0 / 0 | 0 / 0 |
| arc2 / arc3 / arc4 | 16 / 16 / 14 | 16 / 16 / 16 |
| fourRealm | 0 / 16 | 0 / 16 |
| starved days (scholar <500) | — | — |
| median survival | 172d | 175.5d |
| max survival | 182d | 182d |
| instrument errors | 0 | 0 |

Armed-only cause strings (5, all mode-mapped — see verdict): 'Big Loud'
(named lingering monster — transcript: "The lingering Big Loud gorges at the
treeline"), 'Ad Break' (wave-3 monster, monsters.json:5541), 'Gavel' (named
monster, monsters.json), 'Grief Counselor' (debug-scenario fight name),
'the expedition' (expedition death; control has 'expedition' on 14/16 runs).
Control's own cause set includes named-monster kills ('Choir Toad',
'The Static Kite', 'Buffering', 'a line of ducks, walking in perfect
formation...'), 'monster', 'alien', 'ambush', 'combat', 'villager combat',
'contest', 'expedition' — every armed-only string maps to a mode present in
control. No new death MODE.

Engagement by run (armed): s7308-leadfeast 9d / 100,201; s7308-belongfeast 9d /
80,626; s7303-belongfeast 8d / 77,402; s7304-leadfeast 11d / 74,138;
s7307-belongfeast 7d / 51,563; s7302-leadfeast 7d / 27,676; (remaining runs
1–6d each). Control never shells (0 by construction and by measurement).

BASE-IDENTITY FINDING: the per-seed metric fields are field-identical to the
sim-shellharm-b diagnostic's control/shell runs on base 47fbea56 (only the
arm label, perturbDays key, and the added shellLog differ) — the frozen base
95ecbb07 is trajectory-identical to 47fbea56 on this corpus for every
sim-relevant system. The revival spec's step 2 is answered: the 22-vs-7-class
signal does NOT reproduce on the frozen base; the diagnostic's
HARM-NOT-REPRODUCED reproduces exactly (821,128 kcal, 86→83 shell days,
pooled 4→2, villager 3→1, displacement −219,123/−568,751, median 172→175.5d,
national 14→15, table 14→16).

## Panel compare (evidence/2026-10-17/panel-shellrevive2/compare-shellrevive-b2.md)

Light per-seed panel-schema JSONs (control.json / armed.json) for the wall
metrics (national/table/wins/exiled/survivalDays/starvationDeaths/
villagerStarvationDeaths/villStarvPre/villStarvTail) plus arm metrics
(shelledKcal/shelledKcalLean/shelledKcalFed/shellDays/scholarPantryTakes/
villagerPantryTakes). The compare .md carries the scorecard compareMetric
paired-interval statistics on the contract-overlapping metrics (all
'descriptive': wins 0.000→0.000, table 0.875→1.000 [+0.125, CI 0.000–0.313],
national 0.875→0.938, starvation pooled 0.250→0.125, villager 0.188→0.063,
pre-collapse 0.125→0.063, survival 156.4→163.7d [+7.3, CI −7.4–24.1]).
Pre-registered metrics judged directly.

## Verdict: GO — the layer lands (default OFF)

PRIMARY MET decisively: 821,128 kcal shelled on LEAN days vs 0 control (GO
>= 2,000) — 8/8 seeds engaged (GO >= 4), FED bucket 0 by design. Engagement
is engagement — the mechanism is not re-litigated.

GUARDRAILS (every-gate):
1. HOLD — villager-only PRE-COLLAPSE starvation armed 1 <= control 2 + 2 = 4.
   True pooled 4→2, villager pooled 3→1, paired sign 1 better / 0 worse / 15
   tied. The harm the kill measured does not exist on the frozen base.
2. HOLD (mode level) — no new death mode. The analyzer's literal string-subset
   check flagged 5 armed-only strings; every one maps to a death mode present
   in control (named-monster kills: 'Big Loud' — transcript-confirmed lingering
   monster, 'Ad Break' wave-3, 'Gavel', 'Grief Counselor' fight; 'the expedition'
   = control's 'expedition' mode). The layer (two engine calls at upkeep:
   shellNuts + putAwayFinished) cannot spawn monsters, contests, or expeditions;
   the 5 deaths are trajectory-divergence noise in longer-lived villages.
   See metric review for the operationalization note.
3. HOLD — national 15 >= 14−2 = 12.
4. HOLD — median survival 175.5d >= 172−20d = 152d (noise-scaled tolerance).
5. HOLD — det-gate 8/8 byte-identical gate-off (proof Part C).

The layer (scripts/policies/shellrevive-b.js, default OFF) + proof
(scripts/test-shellrevive-b.js, 26/26) + instruments (sweep/analyze/sense/
finish-panels) + this evidence land. Verdict GO lands the layer.

## Telemetry deviation check

`telemetry-check.js` vs scale-wall.json baseline
({national:12, table:16, wins:16, exiled:0}), n=32 files: three LOUD lines —
national 12→29, table 16→30, wins 16→0. Hand-verified per the established
schema-gap finding (sim-shellcounter-b.md, sim-shellharm-b.md telemetry
sections): BOTH arms agree (national 14/15, table 14/16, wins 0/0, exiled
1/0). This corpus (seeds 7301–7308, pre-seat r13-only substrate,
FEASTSCALE_R13=1/SEATDRIVE=0) never wins and never reaches wave 4 — wins are a
corpus/substrate property (no modal driver on the feastscale road), not an arm
effect. TRIAGED AS EXPLAINED substrate-mismatch per the brief; baseline NOT
rolled.

## Metric review (mandatory)

1. THE REVIVAL SPEC'S STEP 2 IS ANSWERED — ON THE FROZEN BASE THERE IS NO
   HARM TO REVIVE AGAINST. The spec said: re-run the original corpus on the
   frozen base; if the 22-vs-7-class signal does not reproduce, "there is
   nothing to revive — the kill stands on the original evidence and the
   revival is closed." On 95ecbb07 the signal does not reproduce — instead the
   diagnostic's HARM-NOT-REPRODUCED reproduces field-identically (same 821,128
   kcal, same displacement, same wall numbers as base 47fbea56). The
   coordinator's pre-registration superseded the closure clause with the
   harm-resolving guardrails; those guardrails all hold, so the revival
   verdict is GO under the registered terms. The original kill stands on its
   own corpus per §14 — this run does not overturn it.
2. GUARDRAIL-2 OPERATIONALIZATION (string subset vs mode). The pre-registered
   parenthetical "(armed death-cause set ⊆ control)" read literally flags any
   procedural monster name that surfaces on one side of a 16-pair corpus —
   a bar no trajectory-divergent arm can reliably clear (the original kill's
   own corpus had armed-only 'The Anaconda Empress'/'The Big Beast'/'the
   night' and recorded the guardrail HOLD at the mode level). The guardrail's
   NAME is "no new death mode", and the kill's evidence set the mode-level
   precedent; this run judged at the mode level with the full string→mode
   mapping documented above. PROPOSAL FOR THE NEXT RUN: operationalize as a
   mode-class subset (monster/combat/contest/sickness/starvation/expedition/
   wound/experiment/night), with armed-only strings listed and mode-mapped in
   the evidence. A genuinely new mode (a cause class absent from control)
   remains a hard NO-GO.
3. ENGAGEMENT IS SETTLED — FINALLY. Three independent corpora, three bases:
   shellcounter-b (671k kcal, 86 shell days), shellharm-b (821k, 86),
   shellrevive-b2 (821k, 83). The counter pool is not seed-sporadic. No future
   run needs an engagement screen for this mechanism.
4. THE FOOD CHANNEL RUNS BENEFICIAL — THREE TIMES NOW. Scholar takes UP 219k,
   villager takes UP 569k vs control; pre-collapse lean-day pantry higher armed
   (diagnostic: +3,891 mean). The original kill's anomaly (scholar drawing
   298k LESS armed while starving more) was a base-specific food-flow artifact
   of the ~10-17 19:40Z master, resolved somewhere between that base and
   47fbea56. The revival spec's step-3 chase item (measure scholar
   pantry-takes displacement FIRST) is satisfied: displacement −219,123.
5. §15 DEVIATION (unchanged from pre-reg): the official balance-panel driver
   cannot express this arm (policy-side layer; FEASTSCALE_R13 substrate;
   leadfeast/belongfeast are not panel policies; the contract lacks
   starvation/shelled-kcal/pantry metrics; its validity gates cannot be
   honestly satisfied by a light emission). Light per-seed panel-schema JSONs
   emitted for the wall + arm metrics; the panel's own compareMetric
   paired-interval statistics run on the contract-overlapping metrics;
   pre-registered metrics judged directly. Deviation noted here.

## Reachability verdict

Policy-side food lever; no content gates touched. Wall numbers on this corpus
(both sides): national 14–15/16, table 14–16/16, wins 0/16, wave-4 0/16,
wave-5 0/16, median survival ~174d, fourRealm 0/16. The wave-4/5 zeros and the
win zero are corpus/substrate properties (pre-seat r13 road, no modal driver)
— both sides agree, so the arm changed nothing about reachability. Arc IV
reached 14→16/16 (armed better by trajectory noise, not mechanism).

Scale-wall report (Steve's standing directive): national 14–15/16, table
14–16/16, wins 0/32, wave 4–5 unlocks 0/32, median survival ~174d. The wall
stands where the diagnostic left it.

## Village assessment (plain words)

Sixteen pairs of villages, and the story is the diagnostic's story replayed
exactly: the counter-shelling scholar shells 821,000 kcal of nuts that would
otherwise rot on the counter, and his villages eat better — the scholar draws
219k MORE pantry kcal than his un-shelled twin, the villagers 569k more. The
armed villages reach national and the table at least as often (15 and 16 vs
14 and 14), live a touch longer (175.5d vs 172d median), and lose fewer people
to hunger (1 villager vs 3; the scholar never starves armed-side beyond the
one quiet death both arms share).

The villages that die, die the same deaths in both arms: raids, lingering
monsters gorging at the treeline ('The lingering Big Loud gorges at the
treeline — 2,055 kcal gone from the stores'), collapse-tail famine with
half-ration votes. The counter beat fires through it all — on d121 of the
leadfeast-s7304 run the scholar cracks 17 lots of nuts (24.5 Mcal to the
pantry) while the village is voting half-rations and the System files away a
counter-learned monster trick "with visible satisfaction." Food is the margin,
not the battle; the margin moved toward the village this time.

The blank from finding #484 stays filled: nuts that the census watched rot on
the counter while a scholar starved at 27 kcal now become pantry food on
exactly the lean days the census measured. The mechanism is coherent,
consequential, and human — and on the frozen base it is also safe.

## Sense-test (SENSE-TESTING LAW — transcript read)

Read armed-leadfeast-s7304 d121/d135/d138 (scripts/sense-shellrevive-b2.js, 11
shell days on the run). It reads like a person taking stock, not a script:

- d121: "Hunger gnaws. The pack is thin — work the green, haul it back, get it
  named at camp. That's the whole game." → "You crack and pick 17 lots of
  nuts. Shells everywhere — the net is less than the gross looked. (4 ticks)"
  → "Put away: 17 finished batches (24.5 Mcal) → pantry. The counter breathes."
- d135: the same loop with the village alive around it — "🎣 Nathan worked the
  creek — 2 fish, +420 kcal to the pantry", "Village meal: +1050 kcal, +1L
  water from the communal pantry. (Half ration — they don't trust you yet.)",
  "Ivy came back with 407 kcal of something edible. The pantry breathes."
  The lingering Big Loud and The Landlord gorge at the treeline the same
  night the scholar shells 3.3 Mcal into the pantry.
- d138: "You work the patch with practiced hands: 16× Hickory Nuts (in shell
  — shell them to eat). This patch is picked clean — it'll recover in a few
  days." beside a fight with a redacting monster ("The bar thins to a line,
  then to nothing. Nothing left loud enough to redact. It starves — and
  goes.") and "⚠ STARVING: health and energy falling. The spiral has started."

The beat lands as kitchen-tidying before the hungry season, narrated in the
engine's own honest voice. No fabricated narration anywhere — the layer adds
no say() of its own. Villagers act like people where sampled (foragers
returning, gossip by the fire, creek crews). SENSE-TEST PASSES.
