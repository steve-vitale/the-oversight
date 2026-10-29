# sim-recallpolicy-b — PRE-REGISTRATION (binding, written BEFORE any judged leg)

Run: fleshout-loop-b, arm sim-recallpolicy-b, axis food-economy.
Worker tree: ~/workspace/worktrees/sim-recallpolicy-b. Base: master
c3c8a2718 (ship bump, per coordinator brief; verified via
`git rev-parse HEAD` at instrument build time — if the tree base
differs, the evidence file records the actual anchor).

## What this is NOT (the honesty distinction, stated first)

sim-recalldiag-b (2026-10-22, evidence/2026-10-22/sim-recalldiag-b.md)
built RECALL-TRIGGER v1 OFFLINE against a corpus and judged LEAD
TIMES: DIAG-NO-GO (Rule A fires ≥3d before death in only 1/5
trail-starvation cases; the cliff is a single-day event, so 1–2d is
all any cliff trigger can buy). That verdict is NOT re-scored here.
This arm implements recall as a policy FOR THE FIRST TIME and judges
a DIFFERENT estimand: its RESCUE EFFECT on fresh seeds — do
cliff-triggered away-villagers who are walked home actually arrive
alive, and does starvation fall? A rescue GO here does not overturn
the recalldiag lead-time NO-GO (the window is still 1–2d); a rescue
NO-GO here does not re-prove it either. Both verdicts stand side by
side, judging different questions.

## The blank (from sim-deathcause-b + sim-recalldiag-b, both READ)

TRAIL-STARVATION CHANNEL: away-villagers whose expedition production
cliffed 80–95% overnight (ratios ~0.08–0.26) while the pantry sat ample
(8.6k–33k), pack draws 700–1000/d vs ~2000 need, no mechanism bringing
them home. 6/13 starvation deaths in the deathcause corpus.

## Canon

- docs/CANON.md read first. NO canon doc covers expedition recall
  (recalldiag's canon section says the same; CANON.md lists no
  expedition doc). The trigger is an INSTRUMENT over engine-state
  variables, not canon. Nothing invented from scratch: the rule is
  RECALL-TRIGGER v1 verbatim.
- docs/MAP.md §6 (walk-home law) DOES cover the return walk and
  binds this design: "NO TELEPORT, ever: any future 'return' that
  jumps position instead of stepping is a revert-on-sight failure."
  Node travel is free; steps meet the world tick-by-tick exactly as
  a manual walk would. Only a villager's RETURN walk may step
  through beyond coordinates (fixall-map slice 2) — this instrument
  never needs it (expedition nodes are clamped 0..8) and never uses
  it: BFS is clamped to 0..8, and a node found outside 0..8 holds
  in place and is recorded, never stepped.

## The policy instrument (NEW, default-OFF, policy-side only)

File: scripts/recallpolicy-instrument-b.js + sweep driver
scripts/sweep-recallpolicy-b.js + proof scripts/test-recallpolicy-b.js.
ZERO src/js changes. ZERO default flips. NO driver adopts it: the
sweep-compare registry is untouched; the instrument is loaded only by
its own sweep script, gated by env RECALLPOLICY_B=1 (default OFF).
When OFF, the instrument is observe-only (meal-row capture + trigger
evaluation, zero game-state writes) — the control leg. When ON, it
additionally reroutes and completes recalls (the treatment).

### Trigger (RECALL-TRIGGER v1, Rule A ONLY — villager-knowable)

Reused verbatim from scripts/taxonomy-recalldiag-b.js `triggerDay`
(required, not copied — one implementation, no drift). FIRE for a
villager-day d iff ALL hold:

1. away[d] (engine: village.away[vid] set — the villager IS out);
2. away-majority: ≥4 of the last 7 calendar days away;
3. production cliff: produced[d] ≤ 0.40 × mean(produced over the
   trailing 7 away-days before d), ≥3 away-days in the baseline,
   baseline mean ≥ 800 kcal/d;
4. pack-draw dependence: drawn[d] ≥ 0.30 × need[d].

Signals used and why each is villager-knowable (this is the
knowledge-honesty clause the brief demands):

- away flag: the villager knows they are out. Knowable.
- own daily production (own foraging/haul yields, via the engine's
  own contribLog for that villager): the villager knows what they
  caught today vs recent days. Knowable.
- own pack draws (drawn on away rows = pack draws, per the
  trailstarve evidence): the villager knows they are eating from
  their own pack. Knowable.
- own daily need (kcalPerDay): their own hunger. Knowable.

Signals NOT used, deliberately: Rule B's pantry ≥5000 condition is
EXCLUDED — the away villager cannot see the pantry (recalldiag's own
knowledge caveat: Rule B is System-only). The instrument NEVER reads
the pantry for the trigger. (Pantry is recorded by the deathcensus
instrument's daily series as an observer-only covariate, never fed
to the trigger. If any trigger code path is ever found reading
pantry state, that is a proof failure, not a feature.)

### Recall mechanism (legal travel only)

On first fire in an away-episode (an away-episode = a maximal run of
away-days for one villager; re-fires within the same episode do not
double-count the denominator):

1. The villager is marked RECALLED (instrument memory only).
2. WALK HOME, one engine step at a time: the instrument wraps
   Game.npcSetNode. For a recalled villager whose node is not haven,
   the engine's requested destination is REPLACED by the next step
   of a BFS path from the villager's current node to haven
   (orthogonal steps only, 0..8 grid, each edge checked with the
   engine's own Game.travelBlockage(nx, ny, fromX, fromY) — the
   eveningdetour BFS mechanics, mirrored as policy mechanics, not
   imported from a sibling-owned file). Blocked edge → that
   neighbor is not on the path. No BFS path → HOLD (the wrapper
   skips the move entirely; the villager stays put and the hold is
   recorded). No teleport, no forced hop through a blockage, no
   clearing, no bridge-building, no new narration (the instrument
   never calls say()).
3. ARRIVAL: when a recalled villager's node IS haven, the wrapper
   HOLDS all further node moves (so the next expedition leg cannot
   walk them back out before the return completes), and at the
   next sleep boundary the instrument clears village.away[vid] —
   exactly what the engine's own base return does (npcNodeTravel:
   npcSetNode to haven + delete away) — so the NEXT agencyTick
   completes the return through the engine's own expeditionReturn
   (haul stocking, trust, and the engine's pre-existing return
   narration if the player is at haven — engine narration for a
   real return, not policy-added narration).
4. GUARDS on every recall action: dead villager → no action;
   engaged (isEngaged) → no move that part (recorded as skipped);
   no agency expedition record (objective-departure away, no
   ex entry) → recall does NOT apply (recorded scope-excluded:
   the walk machinery this instrument steers is the agency
   expedition leg; objective departures are a different system and
   are counted, not silently claimed); mid-fight: NPC field fights
   resolve synchronously inside a leg, so no node move is ever
   issued mid-fight — the wrapper additionally refuses any move
   while the villager is engaged; tent entry: NPCs have no tents,
   nothing to enter — recorded N/A with this reason, not assumed.
5. Scope honesty: the instrument steers the ENGINE's leg cadence
   (one node step per leg, with the leg's own encounter rolls
   still firing — real stakes on the walk home, not a safe corridor).
   It does NOT speed the walk, does NOT suppress encounters, does
   NOT heal, does NOT feed from the pantry en route. A recalled
   villager still eats from the pack while away (away flag set
   until arrival completes) and can still die en route — those
   deaths count AGAINST the rescue rate, never hidden.

### Legs (identical seeds, shared baseline)

- Base policy: belongfeast (scripts/policies/feastscale.js) — the
  policy under which the trail-starvation channel was measured
  (5 of the 6 corpus trail deaths are belong-road). Substrate env:
  FEASTSCALE_R13=1 SEATDRIVE=0 (the deathcause substrate).
- OFF leg (control): instrument installed observe-only
  (RECALLPOLICY_B unset). Triggers are evaluated and recorded as
  would-fire, but no reroute, no completion. The control leg's
  would-fire episodes are the counterfactual denominator for the
  starvation comparison.
- ON leg (treatment): RECALLPOLICY_B=1. Same seeds, same policy,
  same env, same horizon. Only the recall actions differ.
- Death attribution rides on the proven deathcensus instrument
  (scripts/deathcensus-instrument-20261021.js), installed first;
  the recall instrument wraps villagerMealDay + npcSetNode + sleep
  (sleep wrap is post-call only, stacked after deathcensus's —
  install order: deathcensus, then recall; uninstall reverse).

## Staged method (docs/MEASUREMENT.md §§9–12, 14–15)

- HORIZON: 180d, death-aware (runDays ends on Game.over; dead
  villages stop; no fixed tail added). Why 180d: the corpus trail
  deaths fall d8–d143 and the deathcause wall numbers are 180d
  numbers — same horizon keeps the comparison legible.
- SEEDS: FRESH band 68101–68116 (exact `s681xx` matches: none in
  evidence/ or scripts/ at prereg time; the sweep asserts freshness
  inline the same way sweep-deathcause-b does, and aborts on a hit).
  Pilot: 68101–68108 (8 seeds × 2 legs = 16 runs). Confirm: ONLY if
  the pilot gate passes; confirm adds 68109–68116 (8 more seeds ×
  2 legs), pooled judged set = 16 seeds × 2 legs.
- PILOT GATE (instrument + safety, NOT the rescue bar): proceed to
  confirm iff ALL hold on the pilot: (a) ≥2 triggered episodes in
  the ON leg (the instrument fires on real cliffs); (b) 0 illegal
  moves (every recalled step orthogonal-adjacent, blockage-clean,
  contiguous from fire node to haven; every arrival at the haven
  node — verified by the analyzer over the recorded step log);
  (c) all three guards pass (below); (d) 0 instrument errors.
  If the pilot gate FAILS → NO-GO at pilot → KILL WITH TEETH (see
  Landing rule). The pilot gate is not a rescue verdict and a
  pilot pass is not a GO.
- PRIMARY (judged ONCE, on the pooled 16-seed set, never re-scored):
  STRICT RESCUE RATE among ON-leg triggered episodes:
  rescued / triggered, where rescued = the villager arrives home
  (away cleared via recall completion, node at haven) ALIVE and
  BEFORE their originally scheduled return part (partsAway at
  arrival < away.duration at fire time — the recall must beat the
  natural return, or it is not a rescue, it is a coincidence).
  A villager who arrives home alive only after the natural return
  part, or who dies en route, or who is still away at horizon/village
  loss, is NOT rescued. Loose arrival-alive (ignoring the schedule
  test) is reported alongside, never substituted.
  - GO: rescue rate ≥ 0.50 AND triggered episodes n ≥ 8 pooled.
    If n < 8 pooled → insufficient-data (NOT a GO, NOT a kill by
    itself — reported as insufficient-data with the instrument
    retained as measurement-only pending a wider band ONLY if the
    coordinator orders one; this run does not silently expand).
  - A miss on the rescue bar with n ≥ 8 → NO-GO → kill (see below).
- GUARDS (zero-tolerance honesty + survival/starvation totals vs
  control, mirroring nighttravel G1/G2/G3):
  - G1: median survival (gameDays) ON ≥ control − 2.
  - G2: total starvation deaths ON ≤ control + 2 (deathcensus
    pclass starvation, all villagers).
  - G3: 0 illegal moves (as in the pilot gate, over the full set).
  Any guard failure → NO-GO regardless of the rescue rate.
- SECONDARY (report-only, never judged): starvation deaths among
  control-leg would-fire episodes vs ON-leg triggered episodes
  (the identical-seed starvation comparison); all-cause death-cause
  shares; village-lost rate; wall numbers (national / table /
  wins, wave 4–5 unlocks, median survival) as OBSERVED-NOT-CLAIMED
  (a 180d horizon cannot show wins; wins are reported as 0/16
  observed, not as a claim about winnability).
- SENSE-TESTING: read the deathcensus say-lines around every ON-leg
  recall (fire day, walk days, arrival/death day) and judge whether
  the story reads sensibly (a villager turning home after a dead
  patch, arriving or dying on the way). Sample villager behavior
  out of the sims; flag anything robotic, static, or repeated.
  Counts never substitute for this reading.
- BALANCED PANEL (§15 — stated now, before judging, per the
  eveningdetour precedent): NO balance-panel compare .md is
  produced. This leg is a 180d position/reachability measurement of
  a POLICY-SIDE instrument — zero src/js changes, so there is no
  game-root delta for a panel to compare, and the panel's registry
  policies do not include this instrument. The before/after
  instrument is the custom driver on identical seeds, and the
  pre-registered thresholds above are the judge. If this lever
  ever becomes a game change, a panel compare is run at that point;
  a policy-side trace cannot fake one now.
- METRIC REVIEW (this file's section is a placeholder until the
  evidence file carries the real one): doubts about the metric go
  in the evidence file's "metric review" section and apply to the
  NEXT run, never to this one. Pre-registered metrics bind this run.

## Landing rule (binding)

- If GO: the deliverable is the default-OFF policy instrument ONLY
  (scripts/recallpolicy-instrument-b.js + sweep + proof, committed
  on the worker branch for the coordinator to merge). NOT a game
  change: no src/js, no default flips, no registry adoption.
- If NO-GO (pilot gate fail, guard fail, or rescue bar miss with
  n ≥ 8): KILL WITH TEETH per the clearhabit pattern — the policy
  instrument, sweep, and proof are DELETED from the branch,
  zero-trace checks run (grep for recallpolicy + RECALLPOLICY_B
  across scripts/ + evidence/ filenames; the only remaining
  mentions are this prereg and the kill evidence file, which
  document the kill), and the landing is evidence-only (prereg +
  kill evidence file committed; no code lands). The original proof
  is retired, not faked: the proof file is deleted with the
  instrument, and the kill evidence states what the proof showed
  before deletion.

## Instrument proof (pre-registered, scripts/test-recallpolicy-b.js)

RED→GREEN fixtures, run BEFORE any judged leg (proof is a gate for
the pilot, not a judged outcome):
(a) trigger reuse: RECALL-TRIGGER v1 fires on the exact signature
    and no-fires on EACH single missing condition (via the shared
    taxonomy module — fixtures assert the import, not a copy);
(b) BFS legality: synthetic Game stub — path avoids a blocked edge,
    is orthogonal-adjacent throughout, reaches haven, returns null
    when no path exists, never steps outside 0..8;
(c) reroute: npcSetNode wrap replaces an outward leg step with the
    BFS-next step toward haven, holds on no-path, holds at haven,
    passes through untouched for non-recalled villagers and when
    OFF, never calls say, consumes 0 Math.random calls;
(d) completion: node-at-haven + recalled → sleep-boundary clears
    away (and only away — no other state touched); engaged villager
    → no move; dead villager → no move; objective-away without an
    expedition record → scope-excluded, no move;
(e) OFF DET: observe-only instrumented vs pristine canonical
    projection byte-identical on 2 seeds × 40d (days, endReason,
    gameDays, over, death counts);
(f) gate default-OFF: source grep pins RECALLPOLICY_B=1 as the only
    ON condition; zero src/js files touched (git status shows only
    scripts/recallpolicy-instrument-b.js, scripts/sweep-recallpolicy-b.js,
    scripts/test-recallpolicy-b.js, evidence/2026-10-29/*).

## Metric review

(Placeholder — real doubts go in the evidence file's metric review
section after judging, and apply to the NEXT run.)
