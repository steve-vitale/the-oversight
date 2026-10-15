# sim-vinebank 2026-10-14 — materials-banking policy arm for the blind trapline (loop B, food-economy axis, POLICY-SIDE)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question:** evidence/2026-10-14/sim-snaregate.md (KILLED AT PILOT) — the 2+2
  blind-craft band fired ZERO times on 7/8 seeds because the scholar's pack
  never co-banked vine>=2 AND stick>=2 simultaneously. The kill's named next:
  "the blind-gate question dissolves into a MATERIALS question — a future arm
  needs MATERIALS-BANKING behavior (deliberate vine+stick stockpiling), not a
  lower gate number." This arm IS that named next.
- **Arm:** scripts/policies/vinebank.js — opt-in layer (VINEBANK=1, default
  OFF) on the competent substrate. While the snare recipe sits at L1 (the
  blind band; the base's reliable 1+1 band already drives L2+), the bank has
  first claim on vine+stick until both reach 2:
  - DEFERRAL: competing crafts that spend trap materials wait — stone_knife
    (vine 1: keepKnife + armUp), bark_armor (vine 2: gearUp), arrow (stick 2:
    gearUp dry-weapon). Deferred, not cancelled — the bank releases at 2+2.
  - ACQUISITION: the forage trip's sort biases to thickets (bush harvests ->
    vine, 30%) when vine is binding, groves (tree harvests -> stick, 40%)
    when stick is binding. Revealed tiles only; the fog keeps its secrets.
  - SPEND: at 2+2 (below the base 3+3 band, which the base owns) one honest
    Game.craft('snare')/day. A blind attempt costs 1+1 win or lose — 35% odds,
    materials at real risk. Runs BEFORE workTrapline in daily() so the layer
    reads pre-base inventory (workTrapline's craft consumes first; reading
    after it double-fires — caught and fixed in the proof, G5).
  - Engine-honest: only verbs the engine exposes; only suppresses the
    policy's OWN craft calls. Never moves materials, never invents a verb.
- **Primary metric:** blind-band craft attempts (the mechanism firing).
- **GO:** blind-band attempts >= 1 on >= 4/8 armed seeds AND armed blind-band
  crafts >= 2x control blind-band crafts. (GO needs the mechanism firing, not
  just a count. Control has no blind band — its blind-band crafts are 0 by
  construction, so the binding operational bar is the attempts conjunct; the
  crafts conjunct is reported literally.)
- **Guardrails:** median survival >= control-10d; national >= control-2; no
  new death mode (n>=3 per finding #216); starvation <= control+9.
- **KILL:** a miss on primary OR guardrail -> delete the layer before commit,
  keep only the evidence (killed arms leave no trace).
- **Horizon:** 150d death-aware (Game.over stops the run; dead villages stop
  simulating). **Seeds:** pilot 11/22/33/44/55/66/77/88; confirm
  111/222/333/444/555/666/777/888/101/202/303/404/505/606/707/808 x competent,
  belongseek (IDENTICAL seeds baseline vs armed).
- **Sides:** baseline = VINEBANK unset (default OFF); armed = VINEBANK=1.
  Code identical otherwise, same commit.
- **Convergence:** converging -> 12-16 seed confirm if GO met;
  killed-at-pilot otherwise.
- **Canon:** docs/CANON.md + docs/PRESERVATION.md (blind penalties teach —
  the engine's blind-success->L2 is that mechanic, verified in game.js
  craft(): L1 35%, L2+ 85%, materials consumed win or lose).

## Proof — scripts/test-vinebank-20261014.js (RED on pristine -> GREEN after)

RED (VINEBANK unset): the knife knaps (vine 1->0, no deferral); 2+2 produces
ZERO snare attempts (base 3+3 gate holds, materials untouched); the arrow
craft is attempted (stick 3->1); bark armor is attempted (vine 2->0); 3+3
exactly 1 attempt; banking()/defersCraft()/tripBoost() all inert. 9/9 green
on pristine — default-off is byte-identical.

GREEN (VINEBANK=1): knife DEFERS while banking (vine stays 1, deferral
counted); 2+2 fires exactly 1 attempt through the honest Game.craft path
(1+1 consumed win or lose; same-day double call still 1); arrow DEFERS while
stick-binding and re-fires at full bank; bark armor DEFERS while banking;
3+3 exactly 1 (base band; layer skips — no double); bank full releases the
knife (vine 2->1, then no blind attempt at 1+2); L2 retires the layer (no
deferral, blindBand no-op); L0 holds (no attempt, not banking without
knowledge); trip boost wants vine+stick while binding, quiet at full bank.
23/23 green.

The proof caught one real ordering bug: blindBand AFTER workTrapline
double-fired at 3+3 (workTrapline's craft consumed 1+1 first, the layer read
2+2 and fired again). Fixed by running the layer BEFORE workTrapline in
daily() — the layer reads pre-base inventory. G5 now asserts the fix.

Method: node harness, full src/js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), Math.random seeded
BEFORE eval, Game.save never stubbed. Named-export policy unwrap throughout
(finding #69 — never Object.assign({}, require(...))).

## SMOKE gate

SMOKE=1 before any sweep spend: both policies unwrap to a function daily,
the harness invokes policy.daily, pacing > 0, >=1 policy-origin deliberate
act. Green — safe to measure.

## Pilot — 8 seeds x competent/belongseek (16 runs/side, identical seeds)

| side | national | table | wins | exiled | crafts | snareAtt | blindAtt | blindCraft | seeds w/ blindAtt | medianSurv | pdeaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline (off) | 6 | 0 | 0 | 0 | 50 | 70 | 0 | 0 | — | 143d | combat 24, starvation 1, sickness 1 |
| armed (VINEBANK=1) | 6 | 0 | 0 | 0 | 13 | 20 | 11 | 5 | 6/8 | 151d | combat 22, sickness 2, starvation 1, contest 2 |

Primary: (a) blind attempts >= 1 on 6/8 seeds (need >= 4/8) ✓; (b) armed
blind-band crafts 5 >= 2x control blind-band crafts (0) ✓. GO.
Guardrails: median 151d >= 133d ✓; national 6 >= 4 ✓; no new death mode
(contest 2 < 3) ✓; starvation 1 <= 10 ✓.
Deferrals fired (2803 total across armed runs) — the bank-first rule engaged.

Note: total crafts 50 -> 13 in the pilot is trajectory divergence, not a
measured regression — the layer perturbs early-game RNG from day 0 (the
snaremat evidence documents the same reshuffle), and the baseline's crafts
concentrated on two long L2-line runs (66/C 14, 66/B 15). The confirm below
is the honest test; it did NOT replicate (153 vs 121, armed ahead).

## Confirm — 16 fresh seeds x competent/belongseek (32 runs/side, identical seeds)

| side | national | table | wins | exiled | crafts | snareAtt | blindAtt | blindCraft | seeds w/ blindAtt | medianSurv | pdeaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline (off) | 10 | 0 | 0 | 0 | 121 | 148 | 0 | 0 | — | 152d | combat 49, contest 1, sickness 1, lockjaw 3, expedition 1, starvation 1 |
| armed (VINEBANK=1) | 11 | 0 | 0 | 0 | 153 | 168 | 12 | 9 | 9/16 | 152d | contest 5, combat 43, expedition 1, lockjaw 1 |

Primary: (a) blind attempts >= 1 on 9/16 seeds (need 8/16) ✓; (b) armed
blind-band crafts 9 >= 2x control blind-band crafts (0) ✓. GO CONFIRMED.
Guardrails: median 152d >= 142d ✓; national 11 >= 8 ✓; no new death mode
(contest existed in control at n=1) ✓; starvation 0 <= 10 ✓.

The mechanism: blind attempts teach — armed seeds show snareL=3 where the
blind band fired repeatedly (blind-success->L2 is the engine's teaching
mechanic; the layer feeds it). Total line output 153 vs 121 — the pilot's
craft gap was noise.

## Verdict: GO (converging) — layer KEPT, committed in the worker tree

The snaregate kill's named next is answered: materials-banking makes the
blind band fire (6/8 pilot seeds, 9/16 confirm seeds; 12 attempts, 9 crafts
in the confirm), with no survival or national cost. The blind craft is no
longer decoration — it is a working early-trapline lane alongside the wire
path, and it teaches the recipe upward.

## Wall numbers (confirm, 32 runs/side)

national 10 -> 11 | table 0 -> 0 | wins 0 -> 0 | exiled 0 -> 0 |
wave 4+ unlocks 4 -> 4 (no wave 5 either side) | median survival 152d -> 152d

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-14/vinebank-pilot-confirm-*.json'
--metrics flat.national,flat.table,flat.wins,flat.exiled`:
LOUD: "flat.national newly appeared: baseline 0 -> current 21 (n=2 files)".
This is a SCHEMA ARTIFACT, not a finding: the stored baseline file carries
national at top level ({"national":8,...}), while the arm JSONs nest it
under flat. — investigated same-run, no action. The binding comparison is
control-vs-armed on identical seeds: national 10/32 -> 11/32, table 0 -> 0,
wins 0 -> 0, exiled 0 -> 0. No regression.

## Village assessment / blanks

- **Blank filled (the arm's purpose):** the blind trapline now has a working
  materials economy. On seed 55 the scholar's day reads like a person:
  "A sturdy stick (crafting material). / You also take some vine (crafting
  material). / You've only SEEN a Snare. You'll try to copy it from memory —
  long odds, and the materials are at risk if it comes apart. / The Snare
  comes apart in your hands. The materials are wasted." — gather, attempt,
  honest failure with material consequence, while the village's wire-snare
  line keeps producing around them (Vasyl +213/+317 kcal to the pantry).
  SENSE-TESTING LAW satisfied: a person doing a thing, not a counter
  incrementing.
- **Who thrived/died:** combat remains the player-killer (43-49 of ~55
  player deaths across the confirm); the layer changed nothing about how
  villagers act — no robotic behavior surfaced. The village trapline culture
  is alive independent of the scholar: NPCs check snares daily, teach
  ("Lena is showing Nino how to tie a snare. Hands patient. It takes three
  tries."), haul +112/+323 kcal to the pantry. The scholar's blind line is
  the apprentice lane next to the village's working wire line.
- **What the line contributed:** 12 blind attempts / 9 blind crafts in the
  confirm, several scholars riding the blind band to snare L2/L3 — the
  teaching mechanic the base band starves (it needs 3+3, which needs the
  very banking the layer provides).
- **Cost:** deferrals are real (3816 in the confirm) — the scholar knaps the
  knife later, knaps arrows later. The guardrails say the cost is affordable
  (median survival identical, national up 1). The knife still gets knapped;
  it just waits for the bank.

## Metric review

The pre-registered primary did its job: the attempts conjunct (mechanism
firing on >= 4/8 seeds) was the binding bar, and the crafts conjunct
(>= 2x control's 0) was vacuous-by-construction — recorded literally rather
than re-scored. If a future arm reuses this shape, the crafts conjunct
should be written against control TOTAL crafts (the snaregate shape) or
dropped. The pilot's total-craft gap (50 -> 13) tempted a mid-run re-score
in the kill direction; per §14 it was left alone and the confirm resolved
it as noise (153 vs 121, armed ahead). Guardrails on medians held against
trajectory noise. No metric changes proposed — the pre-registration was
sound.

## New findings filed

- hidden_files/sim-findings.md: crafted arrows are ammo-invisible
  (engine-side) — craft('arrow') makes {itemId:'arrow', units:5} with no
  material key, so ammoCount/spendAmmo never see them; the bow reads dry
  forever and gearUp re-crafts daily (the stick-bank drain this arm
  measured). Fix lane: producesMaterial or material key (game.js, not
  policy). NOT chased mid-run (policy-side arm).
