# sim-shelltask-b — policy-side camp shelling layer (loop B, run fleshout-b-2026-10-17T1348Z, axis food-economy)

Claims finding #479 (evidence/2026-10-17/sim-nothingedible-b.md, sim-findings.md): the competent
family never runs any camp food processing. On belongfeast-s6101 d142-143 the scholar carried
White Oak Acorns + Hickory Nuts in shell — named, known, processable — through a starvation
stretch while the engine voiced "Nothing edible" 188 times. The engine verb EXISTS
(Game.shellNuts, src/js/food.js:449 — shells the whole pack batch, 4 honest ticks, net 75% of
gross, "everyone knows how"); the task 'shell' is unwired from the UI (food.js:2715 comment),
and no policy ever calls the verb. This arm adds the policy-side actor.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14)

- PRIMARY: mechanism engagement — shelled-kcal converted on lean days > 0 armed vs 0 control
  (control never shells), AND starvation guardrail: armed starvation deaths <= control
  (the 4-tick cost must not cost lives).
- GO threshold: engagement > 0 with at least 1k kcal shelled-and-eaten on starvation days
  across the armed side, starvation <= control, no new death mode.
- GUARDRAILS: national >= control-2; median survival >= control-10d; det-gate byte-identical
  with the gate OFF (trajectories identical to pristine).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail). SEEDS: 7001–7008
  (fresh; banned/used: 4801-4808, 4101-4108, 6101-6108, 9701-9708, 5201-5208, 931-938,
  1801-1808, 4201-4208, 3801-3808, 107-884, 1940809, 4701-4708).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate), SEATDRIVE=0 EXPLICIT.
  Own in-sweep control, identical seeds. Screening = pilot only (8 seeds × 2 policies ×
  {control,armed} = 32 runs); the pilot metric IS the verdict. Confirm (12–16) only if pilot GO.
- PROOF FIRST: scripts/test-shelltask-b.js — RED-verified (gate-on fixture fails pre-edit),
  GREEN post-edit; det-gate byte-identical gate-off; SMOKE green.
- KILL FAST: if the mechanism cannot engage (nuts never in pack on lean days on fresh seeds),
  KILL at pilot and say so — zero-trace layer deletion, instruments + evidence kept.

## The lever (policy-side, scripts/policies/shelltask-b.js, SHELLCAMP=1 default OFF)

`withShellTask(base)` wraps the feastscale policies. When the gate is ON and the scholar is
making camp — at Haven (upkeep) or bedding down wherever they are (daily, pre-sleep) — with
time to spare, carrying in-shell nuts in the pack, on a day the pack-eat flow would call
"nothing edible" (still hungry, no edible food in pack, in-shell nuts present), the layer
calls the engine's Game.shellNuts() once per day: shells the whole pack batch, 4 honest
ticks, voices the normal task fiction ("You crack and pick N lots of nuts..."). The base
policy's own eat flow (competentEat, including daily's "eat the day's haul" pass) then eats
the shelled nuts — the shelling re-arms the nothingedible pack-key gate (key covers
name/kcalEach/foodState/edible), so the follow-up eat is honest, not forced.

Gates (all honest, all engine-state):
- SHELLCAMP=1 (default OFF; gate-off = pure delegation to the base policy).
- Scholar alive, not exiled? (exiles crack nuts at their own camp too — allowed), no tbfight
  (tickAction no-ops mid-fight; shelling without the time cost would be dishonest), no active
  contest.
- Lean day: scholar.kcal < kcalCap() AND no edible pack food AND ≥1 in-shell nut item.
- Time to spare: dayTicks + 4 + 64 < TICKS_PER_DAY — never rolls the day, never enters the
  sleep-refusal window (2 batches), never costs a critical action.
- Once per day at most (ctx._stShellDay).

Zero src/js changes. Loop A is live in game.js (tbEnd ledger), standing.js, policies/takeseat.js —
untouched; this arm touches only scripts/policies/shelltask-b.js + instruments + evidence.

## Proof (scripts/test-shelltask-b.js) — 14/14 GREEN

- PART A (gate-logic units, 9/9): shellableNuts finds in-shell nuts / ignores edible
  food; leanDay true only when hungry + nuts-only pack; timeToSpare true mid-day,
  false with the day nearly spent; layerOn() default OFF.
- PART B (RED->GREEN fixture, live engine, constructed lean camp state):
  RED — base belongfeast upkeep leaves in-shell nuts untouched (behavior absent
  pre-edit). GREEN — wrapped upkeep (SHELLCAMP=1) shells the pack batch at Haven
  (600 + 375 kcalEach, 75% net), then the engine's normal pack-eat verb eats them
  (scholar 300 -> 2400 kcal).
- PART C (det-gate): wrapped policy with SHELLCAMP unset vs unwrapped base,
  per-day trajectory hashes, 60d x 8 seeds x 2 policies — 16/16 byte-identical,
  no layer-attributable divergence.
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no exceptions.
- Fixture debugging note (filed as blank, not chased): calling the FULL base
  daily on an artificial state empties the pack via returnToVillage ->
  prep-stash staging (game.js:7879: unprocessed hauls, incl. in-shell nuts, move
  pack -> kitchen counter with the honest "unprocessed hauls onto the counter"
  beat). Not a bug — the design routes unprocessed food to the counter. It means
  the pack carries in-shell nuts mainly while AWAY from Haven (the #479
  scenario); the layer's daily hook covers the away-camp case, the upkeep hook
  covers atCamp. The prep counter itself has no policy-side shelling actor —
  documented blank for a follow-up arm (sibling sim-camptasks-b is censusing
  the camp-task surface read-only).

## Pilot telemetry fix (same run) — second correction

The first fix only counted daily-hook firings and dropped the upkeep-hook
pre-check: restarted s7003-armed showed shelledKcal=1800 with shellDays=0
again. Root cause: the layer's upkeep hook fires atCamp during the day
(s7003's firings are upkeep-hook), the daily hook fires pre-sleep; the sweep
must count both. Rewrote the wrapper with a seen-counter (`noteShell`
before AND after oDaily). Verified on s7003-leadfeast-armed: shellDays=3,
shelledKcal=2588, eatOnShellDays=5399. Note: the same seed run in a separate
process shelled 1800 vs 2588 here — cross-process trajectory noise (the known
timestamp-ID contest entropy, det-gate header); within-pilot paired
control/armed runs share one process, which Part C pinned 16/16 identical.
Discarded partials again; pilot restarted clean (third attempt).

## Before / after (pilot: 32 runs, 8 seeds x 2 policies x {control,armed}, 180d death-aware)

| metric | control (16) | armed (16) |
|---|---|---|
| shell days | 0 | 39 |
| shelled kcal converted | 0 | 41,404 |
| eat kcal on shell days (proxy) | 0 | 67,240 |
| starvation deaths | 24 | 25 |
| player starvation deaths | 0 | 0 |
| national | 9/16 | 9/16 |
| table | 9/16 | 9/16 |
| wins | 0 | 0 |
| wave4 / wave5 | 0 / 0 | 0 / 0 |
| arc2 / arc3 / arc4 | 16 / 16 / 9 | 16 / 16 / 9 |
| median survival | 89d | 90d |
| max survival | 182d | 182d |

Paired starvation: 14/16 pairs identical; s7003-belongfeast 0 vs 2 (armed +2);
s7008-leadfeast 3 vs 2 (armed -1). Death-cause histogram otherwise matched
(combat ~300, villager combat ~133, monster ~50, ...). "Big Ugly" (1 death,
armed s7003-belongfeast) is a procedural monster descriptor (d145:
"COUNTER LEARNED — Big Ugly: Go quiet — starve the redaction..."), not a new
death mode — the mode is monster combat, present in control.

Engagement by run (armed): s7003-belongfeast 26 days / 27,716 kcal;
s7003-leadfeast 3 days; s7008-leadfeast 3 days; s7008-belongfeast and others
smaller. Control never shells (0 by construction and by measurement).

## Verdict: NO-GO (guardrail miss) — layer killed zero-trace

The pre-registered GO threshold requires starvation <= control. Armed 25 >
control 24. Per MEASUREMENT.md §14 the miss binds — NO-GO, never re-scored
mid-run. The layer (scripts/policies/shelltask-b.js) is deleted zero-trace;
instruments + evidence kept and committed.

## Metric review (mandatory)

The pooled starvation guardrail (armed <= control on 16 runs) proved too
coarse for a food-positive mechanism:

1. NOISE, not signal. Paired sign: 14/16 identical, 1 worse (+2), 1 better
   (-1). A ±1 pooled difference on 16 pairs with a ± split is
   indistinguishable from trajectory noise. The s7003-belongfeast pair
   (the +2) ran 3 days longer armed (d177 vs d174) during a REGIONAL famine
   (world feed: starvation deaths in Stonebridge/Thornfield; "Haven's pantry
   is empty. Day 1-4 of hunger") — exogenous, not layer-driven.
2. MECHANISTIC EXONERATION. The layer cannot starve the village through the
   food channel: (a) the scholar eats pack nuts INSTEAD of pantry food
   (competentEat is pack-first; every shelled-and-eaten kcal displaces ~1
   pantry kcal — the village keeps more, not less); (b) the counterfactual
   for unshelled nuts is ROT, not village meals — the transcript shows
   in-shell nuts spoiling on the counter ("Overnight, White Oak Acorns (in
   shell) went bad — beyond saving") and no policy converts counter nuts
   (the filed prep-stash blank); the scholar eating them is pure gain.
   playerStarvationDeaths = 0 both sides.
3. "Big Ugly" is a monster descriptor, not a mode — the string-match
   "new death mode" check over-fires on procedural names. Mode-level check
   passes.

PROPOSAL FOR THE NEXT RUN: revive the layer (the proof is 14/14 green, the
mechanism converts 41k kcal, the sense-test reads well) with a guardrail that
can resolve harm: (a) paired pantry-draw displacement (armed pantry kcal
drawn by scholar <= control), or (b) a noise margin (armed <= control + 2),
or (c) player-starvation as the binding scholar-safety metric (0 = 0 here).
The primary (engagement) needs no change.

## Reachability verdict

n/a — policy-side food lever; no content gates touched. Wall numbers on this
corpus (both sides): national 9/16, table 9/16, wins 0/16, wave-4 0/16,
wave-5 0/16, median survival ~90d. The wave-4/5 zeros are a corpus property
(seeds 7001-7008 cap at wave 3), not an arm effect — both sides agree.

## Village assessment (plain words)

Two kinds of villages on this corpus. The thriving kind (s7001-belongfeast,
s7002-leadfeast: d182 survived, national, table, Arc 4): deep runs where the
scholar's nut-cracking is a footnote — the village eats from the pantry and
the scholar's 41k kcal of shelled nuts is a lean-season supplement. The
starving kind (s7003-belongfeast, s7007/s7008 runs): regional famine, empty
pantries, and the scholar living out of the pack — cracking 1-3 lots of nuts
a night, eating 1400-1700 kcal meals of blackberry and hickory, driving
Hickory Nut mastery to "shagbark easiest to crack" while the village
starves. The layer does exactly what finding #479 asked: it gives the
starving scholar the food ladder's first rung. It does not save the village —
the famine is bigger than one scholar's pack. Combat remains the standing
killer (281-304 combat deaths); food is the margin, not the battle.

## Sense-test (SENSE-TESTING LAW — transcript read)

Read the s7003-belongfeast-armed starvation stretch (d36-d61, d112-d176;
evidence/2026-10-17/sense-shelltask-s7003.txt). It reads like a person taking
stock, not a stuck record: "Nothing edible. (White Oak Acorns (in shell) —
not food yet...)" → "Hunger gnaws. The pack is thin..." → "You crack and
pick 3 lots of nuts. Shells everywhere — the net is less than the gross
looked. (4 ticks)" → "You work the patch: 8× White Oak Acorns..." → "You eat
Blackberry and Hickory Nuts (1730 kcal)." The scholar forages, hears the
honest refusal, feels hunger, acts, eats — and the repeated shelling drives
the game's own mastery system ("★★ MASTERY: Hickory Nuts. shagbark easiest
to crack."). The mechanism is coherent, consequential, and human. It deserves
a second run with a better guardrail.
