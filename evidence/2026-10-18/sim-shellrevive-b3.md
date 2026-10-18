# sim-shellrevive-b3 — shelltask-b revival under the #520 base-frozen guardrail (loop B, run fleshout-loop-b-20261018T1030Z, axis food-economy)

Revives sim-shelltask-b (evidence/2026-10-17/sim-shelltask-b.md): the
policy-side camp-shelling layer (SHELLCAMP=1, default OFF; Game.shellNuts,
4 honest ticks, whole pack batch, net 75% of gross). The arm was KILLED at
pilot on a noise-level guardrail miss (armed starvation 25 vs control 24
pooled, 14/16 pairs identical) whose own metric review judged the guardrail
too literal and proposed revival under a noise-margin guardrail.

This is a DIFFERENT adjudication from yesterday's sim-shellrevive-b run
(evidence/2026-10-17/sim-shellrevive-b.md), which tested the layer on FRESH
seeds 7601–7608 and killed it on engagement (376 kcal / 3 days — the
"nuts in pack on lean days" substrate is seed-sporadic). This run follows
the #520 base-frozen revival guardrail spec
(evidence/2026-10-17/sim-shellharm-b.md): freeze the base, re-run the
ORIGINAL corpus (seeds 7001–7008, the corpus that engaged 39 days /
41,404 kcal), FIRST adjudicate whether the original harm signal reproduces,
THEN re-adjudicate under the revised guardrail. The layer was reconstructed
fresh against the sim-shelltask-b spec (deleted zero-trace twice); the
retained proof test scripts/test-shelltask-b.js re-pins it.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written 2026-10-18 before any sim)

- BASE FROZEN: `01fd89450ea01109c79f1838b017741833f5cbe5` (git write probe
  OK at run start, 2026-10-18 10:39Z; worktree HEAD pinned to it; no rebase
  during the run — cross-base corpora are invalid per the spec).
- QUESTION: on the frozen base, with the exact original layer on the exact
  original seeds — (3) does the original harm signal reproduce, and (4)
  does the layer pass the revised guardrail?
- STEP 3 (reproduction adjudication): pooled armed starvation deaths >
  control+2 → HARM-CLASS SIGNAL REPRODUCED → kill again per protocol, keep
  evidence. Otherwise proceed to step 4. (The spec's "22-vs-7-class signal"
  phrasing = pooled armed > control+2; the original shelltask signal was
  25 vs 24, i.e. NOT harm-class — which is exactly what step 3 tests.)
- STEP 4 (revised guardrail GO — ALL must hold):
  - (a) shelled kcal converted, ARMED SIDE TOTAL (16 runs) >= 30,000 kcal,
    control = 0 (mechanism engagement at the original scale; the original
    corpus converted 41,404);
  - (b) pooled starvation armed <= control+2, per-pair collapse-aware
    (collapse-tail deaths don't count as harm; huntstaff-b4 precedent);
  - (c) pantry-draw displacement >= 0 — sum over identical-seed pairs of
    (control scholarPantryTakes − armed scholarPantryTakes) from the
    engine's v.takes[vid] ledger (the pure-gain exoneration: armed scholar
    pantry draws must not exceed control);
  - (d) national >= control−2; median survival >= control−10d; no new
    death mode; det-gate byte-identical gate-off.
- GO → land as default-OFF policy layer (scripts/policies/shelltask-b.js +
  proof + evidence as its own commit). Harm-class reproduction → KILL again
  per protocol, keep evidence. No harm but GO missed → KILL zero-trace
  (kill-fast), keep evidence + instruments.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 7001–7008 — the ORIGINAL corpus ("identical seeds" per the
  guardrail spec). Banned/used seed sets are not reused as FRESH, but this
  run's question is reproduction-on-identical-seeds, which is what the spec
  requires.
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep control, identical seeds; pairs stay
  inside one process.
- PROOF FIRST: scripts/test-shelltask-b.js re-pinned on the reconstructed
  layer — RED-verified (gate-on fixture fails pre-layer), GREEN post-layer;
  det-gate byte-identical gate-off; SMOKE green. Must be green before the
  sweep spends seeds.
- §15: the official balance-panel driver cannot express this arm
  (policy-side layer; FEASTSCALE_R13 substrate; leadfeast/belongfeast are
  not panel policies; the contract lacks exiled/median-survival/starvation/
  shelled-kcal/pantry metrics). Per the escape hatch used by every prior
  shell arm: light per-seed panel-schema JSONs for the wall metrics +
  arm metrics (evidence/2026-10-18/panel-shellrevive-b3/) + a compare .md;
  pre-registered metrics judged directly. Deviation noted here.
- SENSE-TESTING LAW: 2+ transcript reads of shelling days; judge
  meaning/coherence/relevance/consequences, not counts.
- CANON: docs/PRESERVATION.md does NOT cover shelling/nuts (stated, not
  invented — per the brief's canon rule). The engine verb
  (Game.shellNuts, food.js:449) + the evidence specs are the canon source.

## The layer (policy-side, scripts/policies/shelltask-b.js, SHELLCAMP=1 default OFF)

Reconstructed per the sim-shelltask-b spec (the killed run's file was
deleted zero-trace twice; this is a fresh write against the same spec,
re-pinned by the retained proof test). `withShellTask(base)` wraps the
feastscale policies:
- upkeep hook: at Haven camp — Game.playerAtHaven(), scholar alive (exiles
  allowed), no tbfight, no active contest, lean day, time to spare →
  Game.shellNuts() (whole pack batch) once/day (ctx._stShellDay);
- daily hook: bedding down wherever, pre-sleep (before base.daily), same
  gates minus the Haven requirement.
- lean day = scholar.kcal < kcalCap() AND no edible pack food AND ≥1
  in-shell nut item. Time to spare = dayTicks + 4 + 64 < TICKS_PER_DAY.
- Telemetry on ctx: stShellDays, stShelledKcal (engine-exact net per item:
  units * round(0.75 * hiddenKcal-per-unit); hiddenKcal IS per-unit —
  food.js:394 `hiddenKcal: p.caloriesPerUnit`), _stShellDay.
- Zero src/js changes. No new narration — the layer voices only the
  engine's normal task fiction via Game.shellNuts() (no [needs-eyes]).

## Proof (scripts/test-shelltask-b.js)

Re-pinned on the reconstructed layer. First run: **13/14, 1 failed** —
`GREEN: layer shells the pack batch at Haven`. Root cause is a BASE
BEHAVIOR CHANGE between the original corpus base and the frozen base
01fd8945, not a layer bug: on the frozen base the base upkeep's own eat
flow eats from the pack during upkeep itself (fixture debug: scholar
300 → 2390 kcal with the layer OFF, both nuts untouched in shell). With
the layer ON, the pack batch is shelled first and the same eat flow
consumes the shelled nuts during upkeep (observed: 3 hickory + 1 acorn
units eaten, 1 shelled acorn unit remains at kcalEach=375 =
round(500×0.75), scholar 300 → 2390). The layer demonstrably shelled —
the RED case proves the base never shells — but the old assertion ("2
shelled items sitting uneaten") belonged to the old base. The GREEN check
was corrected to the new-base-honest discriminating assertion: no
in-shell nuts remain in the pack AND any remainder is shelled+edible
(RED leaves both in shell; a non-firing layer would too). This is a
correction for a base change, not a loosened assertion — the new check
still discriminates RED vs GREEN.

Second run (after the correction): **14/14 GREEN, exit 0**
(evidence/2026-10-18/proof-shelltask-b3.log).

- PART A (gate-logic units): 9/9 on the first run.
- PART B (RED→GREEN fixture): RED ok; GREEN ok after correction.
- PART C (det-gate): 16/16 byte-identical gate-off on the first run —
  the layer introduces zero trajectory divergence when off.
- PART D (SMOKE): 8/8 no exceptions on the first run.

Notable: the fixture also demonstrates the displacement mechanism live —
pack-first eating (competentEat) consumed the shelled nuts during upkeep
instead of pantry food, the exact pure-gain channel the metric review
exonerated.

## Before / after (pilot: 32 runs, seeds 7001–7008 x 2 policies x {control,armed}, 180d death-aware)

Per-seed JSONs: evidence/2026-10-18/perseed-shellrevive-b3/ (32 files).
Panel compare: evidence/2026-10-18/panel-shellrevive-b3/compare-shellrevive-b3.md
(decision NO-GO, pre-registered adjudication). 0 instrument errors.

| metric | armed (16) | control (16) | bar | verdict |
|---|---|---|---|---|
| shelled kcal TOTAL | 16,830 | 0 | ≥ 30,000 | **MISS** |
| shell days | 13 | 0 | — | mechanism engages |
| pooled starvation deaths | 2 | 2 | step3: > control+2=4 | **not reproduced** |
| pooled starvation (4b) | 2 | ≤ control+2=4 | HOLD |
| pantry displacement (control−armed) | −25,664 kcal | ≥ 0 | **MISS** |
| national | 10/16 | 10/16 | ≥ control−2 | HOLD |
| median survival (gameDays) | 102d | 125d | ≥ control−10d | **MISS** |
| death modes | singletons both sides (armed: alien×1, wound×1; control: dehydration×3) | no arm-attributable mode | noise |
| det-gate | 16/16 byte-identical gate-off (proof Part C) | — | HOLD |

Engagement context: the original corpus (seeds 7001–7008, original base)
converted 41,404 kcal over 39 shell days. On the frozen base 01fd8945 the
same layer on the same seeds converts 16,830 kcal over 13 days — the base
behavior change documented in the Proof section (the base upkeep's own eat
flow now consumes from the pack during upkeep, including shelled nuts)
both shrinks the lean-day pool and eats the product. The mechanism fires
but cannot reach the original scale.

## Step-3 adjudication: does the original harm signal reproduce?

**NO — not reproduced.** Pooled starvation deaths: armed 2 vs control 2;
harm-class = armed > control+2 = 4. The original shelltask-b signal was
25 vs 24 (itself not harm-class); shellharm-b (evidence/2026-10-17/
sim-shellharm-b.md) independently found the shell food channel BENEFICIAL
for starvation on current master. The harm basis for the original kill
does not reproduce on the frozen base. Step 3 clears → step 4 adjudicates
the revival on its own merits.

## Step-4 adjudication: revised guardrail GO / KILL

**KILL — two of four sub-bars miss.**

- (a) engagement: 16,830 < 30,000 → **MISS**. The layer fires (13 shell
  days, control 0) but the frozen base yields less than half the original
  corpus scale (41,404 kcal). The base-change mechanism is documented in
  Proof: the base upkeep's eat flow consumes the pack (including shelled
  nuts) during upkeep, shrinking both the lean-day trigger pool and the
  retained product.
- (b) starvation guardrail: 2 ≤ 4 → **HOLD** (collapse-aware; no
  collapse-tail attribution needed at these counts).
- (c) pantry-draw displacement: −25,664 kcal → **MISS**. The armed scholar
  draws MORE pantry food than control (~1.6k/run). The pure-gain theory
  (pack-first eating displaces pantry draws) does not hold on the frozen
  base: supplementation, not substitution. This is the sharpest finding —
  the layer adds food but does not spare the pantry.
- (d) national 10 vs 10 → HOLD; median survival (gameDays) 102d vs 125d
  → **MISS** (note: `days` incl. tail reads 168 vs 175, which would hold;
  the panel instrument uses gameDays; the verdict does not hinge on this
  row — (a) and (c) already decide it); death modes: singletons both
  sides, no arm-attributable mode; det-gate 16/16 byte-identical → HOLD.

Per the pre-registration: "No harm but GO missed → KILL zero-trace
(kill-fast), keep evidence + instruments." The revival is dead. The
shelltask line now reads: killed at pilot (noise guardrail) →
revival attempt (this run) killed at the engagement bar with the
pure-gain theory refuted. The shell channel's remaining honest role is
the one shellharm-b measured: a small beneficial starvation buffer, not
a lever.

## Panel compare (evidence/2026-10-18/panel-shellrevive-b3/)

Light per-seed panel-schema JSONs (armed.json / control.json) + compare
compare-shellrevive-b3.md, per the §15 escape hatch declared in the
pre-registration (the official driver cannot express this arm). Decision:
**NO-GO** (pre-registered step-3/step-4 adjudication). 16 paired cases.
The panel's survival row uses gameDays (102 vs 125, MISS); `days`
including the death tail reads 168 vs 175. Both numbers are recorded
above; the kill does not hinge on this row.

## Telemetry deviation check

Not run as a separate telemetry-check invocation this run (the finisher
completed the evidence after the timeout; the wall-metric numbers above
are computed directly from the 32 per-seed JSONs). Wall numbers for the
record: national 10/16 both arms, table/wins 0/16 both arms (pre-seat
courtship substrate, SEATDRIVE=0), wave-4 0/16 both arms, median gameDays
102 armed / 125 control. No LOUD deviation vs the scale-wall baseline
beyond the survival row already adjudicated in step 4(d).

## Metric review (mandatory)

Two findings for the NEXT run, neither re-scores this one:

1. The 30k engagement bar was calibrated on the ORIGINAL corpus/base
   (41,404 kcal). The frozen base 01fd8945 changed the upkeep eat flow
   (pack-first eating during upkeep), which structurally shrinks both the
   trigger pool and the retained product. A base-frozen revival must
   re-calibrate the bar to the frozen base's honest scale — or name the
   base change as the lever's new binding constraint (as this run does).
2. The pure-gain exoneration (displacement ≥ 0) assumed substitution;
   the data shows supplementation (−25.6k). Any future shell-line work
   must model the scholar's total intake response, not just the pantry
   ledger.

The step-3/step-4 two-stage structure worked as designed: it separated
the harm question (answered: no) from the merit question (answered: miss).

## Reachability verdict

REACHABLE but not at lever scale. The layer fires on the frozen base
(13 shell days across 16 armed runs, control 0) and the proof fixture
demonstrates the honest mechanism end-to-end. What does not reach is
the pre-registered SCALE: 16.8k vs the 30k bar, on the same seeds that
once yielded 41.4k — the base moved under the lever. A player shelling
nuts on lean days gets real food (75% net); they do not get a
strategic-scale pantry engine.

## Village assessment (plain words)

Armed villages shell nuts on lean days and eat them — 16.8k kcal of
honest 75%-net food across the corpus, all of it additional to what
control gets (control: 0). Nobody starves because of it (2 vs 2). But the
villages do not pull ahead: national reach is identical (10/16), they die
at the same rate, and the scholar quietly draws MORE from the pantry
(−25.6k displacement) — the extra food goes to extra eating, not to
pantry savings. The village that shells is marginally better fed and no
better positioned. The shell line's honest size on the current base is a
snack, not a strategy.

## Sense-test (SENSE-TESTING LAW — transcript reads)

Read: sense-shellrevive-b3-s7002.txt (54 lines, 9 shell days d149–d169),
sense-shellrevive-b3-s7006.txt (0 shell days — lean pool never formed).

s7002 reads coherent and in-fiction: the hunger-gnaws beat opens each
shell day, the shelling line ("You crack and pick 1 lot of nuts. Shells
everywhere — the net is less than the gross looked. (4 ticks)") is
honest about the 75% net and the time cost, and the fiction around it
(raids, audience trial, camping wild) is undisturbed. The shelling beats
do what the canon requires: the NPC (scholar) wants food, the option
engages it, the ending resolves (nuts shelled, pack-first eating follows
in the upkeep fiction). No fabricated history, no filler loops. s7006 is
the honest null: no nuts, no shelling, no voice — the layer stays silent
when there is nothing to shell, as designed.

## VERDICT

**KILLED — NO-GO.** Harm signal not reproduced (step 3: 2 vs 2); revised
guardrail missed on engagement (16,830 < 30,000) and pantry displacement
(−25,664 < 0). Kill protocol: layer (scripts/policies/shellrevive-b.js)
deleted zero-trace; instruments + evidence landed. Completed 2026-10-18
by the finisher (run timed out before the worker wrote the verdict;
numbers computed from the 32 per-seed JSONs against the binding
pre-registration; the worker's panel compare already recorded NO-GO).
