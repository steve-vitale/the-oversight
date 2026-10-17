# sim-cookwin-b — cook-window lever (2026-10-17, loop B, food-economy axis)

Run: fleshout-b-2026-10-17T11-06-35Z, arm sim-cookwin-b.
Finding #462 context (read as lines #461-463 region; numbered findings absent — the
named-next source is the loop-B claim): the sim-rackschannel-b census closed its own
hypothesis — the cook smoke drive is ELIGIBILITY/DUTY-BOUND, NOT BUDGET-BOUND
(sim-findings: "the binding constraints are the eligible-surplus definition (fresh
beyond the 250/person dinner reserve, spoilDay <= day+2) and duty cadence, not the
budget... A future smoking lever should tune the cook drive itself (duty cadence,
reserve size)"). This arm tunes the eligibility window. Constraints honored:
dinreserve's reserve-cut died (250/person dinner reserve untouched); sim-triage's
evening pass died (no evening pass added; same pool extension, not a new pool);
the racks-full guard (incl. ownShelf/rackCap formula) untouched; isSpoiled
no-laundering exclusion untouched; 4000 kcal resolution budget untouched;
duty cadence untouched.

## Lever
src/js/game.js, duty-time cook drive (resolveOneAssignment 'cook', ~L6570):
`if (sd - day > 2) continue;` → env-gated window `COOKWIN_B=1` widens to
`sd - day > 4`. Gate reading follows the FOODLEVER_R5 pattern (runtime
process.env read, default OFF = pristine parity). Smoking days-3..4-out fresh at
the blind 0.80x yield is canon-honest preservation (PRESERVATION.md ladder),
not a subsidy.

## Pre-registration (binding, MEASUREMENT.md §§9-12, 14)
- PRIMARY: paired-median fresh waste-rate (freshRot kcal / pantry throughput /
  villager-day, WR instrument wasterate-instrument-20261017) armed vs control.
  GO: paired median of per-pair ratios <= 0.85.
- VOLUME SANITY: aggregate armed day-3..4-window smoked kcal >= 2x control
  (control is 0 by construction — the operative bar is >= 30k kcal aggregate:
  the extension must actually engage, not just widen a code path). KILL if missed.
- HETEROGENEITY LENS: per-pair direction split reported (improved/worsened),
  not scored.
- GUARDRAILS (all must hold): starvation <= control+2; national >= control-2;
  matched median survival >= control-10d; half-ration rate reported (finding
  #385); no new death mode; no crash.
- EVERY-GATE RULE: primary + volume sanity + all guardrails, or KILL the layer
  (game-code change reverted zero-trace; evidence + instruments kept).
- DET-GATE: gate-off trajectories byte-identical to the pristine baseline
  captured pre-edit (scripts/cookwin-det-baseline-20261017.json, 8 combos
  4701-4704 x {leadfeast,belongfeast}, 40d, all self-deterministic on pristine).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 8 fresh 4701-4708 (coordinator banned-list checked — clean).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1 substrate; SEATDRIVE=0
  EXPLICIT, pre-seat courtship, food-economy). Own in-sweep control, identical
  seeds.
- PROOF: scripts/test-cookwin-b.js — (a) window widens ONLY under COOKWIN_B=1
  (RED-verified on pristine: gate-on fixture failed pre-edit), (b) spoiled
  stacks still excluded gate-on (no laundering, at convert time), (c) det-gate
  gate-off == pristine baseline.

## Proof results
- scripts/test-cookwin-b.js GREEN both gates post-edit: gate-off 18/18
  (evidence/2026-10-17/cookwin-proof-gateoff.log), gate-on 20/20
  (evidence/2026-10-17/cookwin-proof-gateon.log).
- RED-verified on pristine (pre-edit): the gate-on fixtures failed as
  required (mid-window sd-day=3 stack NOT smoked without the lever code —
  4 fixture failures), while gate-off fixtures passed. The fixture is a real
  RED→GREEN.
- (a) window widens ONLY under COOKWIN_B=1: gate-off leaves the sd-day=3
  stack fresh; gate-on smokes it; sd-day=6 never smoked either gate.
- (b) spoiled stacks (spoilDay=day-1) never converted gate-on: 0 laundering
  in fixtures AND 0 laundered items across all 16 armed sweep runs
  (convert-time check, finding #101 lesson honored).
- (c) det-gate: 8/8 combos (4701-4704 x {leadfeast,belongfeast}, 40d)
  byte-identical day-hash trajectories gate-off vs the committed pristine
  baseline scripts/cookwin-det-baseline-20261017.json (all 8 self-deterministic
  on pristine pre-edit; 0 entropy-excluded).
- check.js --quick: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (216 sprite-asset failures:
  sweeps_week/cliffhanger aggro/calm sprites), which never reads game.js's
  cook drive; pre-existing on the base commit, unrelated.

## Sweep results (32 runs: 4701-4708 x {leadfeast,belongfeast} x {control,armed}, 180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0 explicit, own in-sweep control)
- PRIMARY paired-median fresh waste-rate ratio (armed/control): **1.0454**
  vs GO <= 0.85 — MISS. Per-pair ratios: 0.000, 0.251, 0.598, 0.699, 0.953,
  0.998, 1.028, 1.035, 1.056, 1.188, 1.369, 1.378, 2.174, 2.226, 3.261, 3.864.
  Direction split: improved 6, worsened 10.
- VOLUME SANITY: armed day-3..4-window smoked = **521,256 kcal** aggregate vs
  control 0 (by construction) — GO on the operative >= 30k bar. The extension
  engaged at scale (13/16 armed runs smoked w34 > 0; max 91,123 on
  belongfeast-s4704).
- GUARDRAILS: starvation 4 armed vs 3 control (<= control+2 ✓); national
  13 vs 14 (>= control-2 ✓); matched median survival 182.0d vs 147.5d
  (>= control-10d ✓); half-ration median 0.380 vs 0.288 (reported, no bar);
  no new death mode (cls armed {NON-HUNGER 692, STARVATION 4,
  WATER-DEHYDRATION 1} vs control {NON-HUNGER 646, STARVATION 3,
  WATER-DEHYDRATION 2}); laundering 0 items at convert time (✓); no crash.
- WALL control (n=16): wins 0, national 14, table 15, w1-w3 16/16, w4 1/16,
  w5 0/16, arc2 16, arc3 16, arc4 15, fourRealm 0, median 147.5d, max 182d,
  counters 441, starvation 3.
- WALL armed (n=16): wins 0, national 13, table 13, w1-w2 16/16, w3 14/16,
  w4 0/16, w5 0/16, arc2 16, arc3 16, arc4 13, fourRealm 0, median 182.0d,
  max 182d, counters 439, starvation 4. (0 wins both sides expected on the
  pre-seat SEATDRIVE=0 substrate.)
- Young-link succession survival: NOT MEASURED — instrument miss (see metric
  review). The reported mantle counts (armed 9 / control 0) are junk: the
  MANTLE_RE pattern matched monster codex-death beats ("The Codex turns a
  page on its own. Choir Toad is dead."), not mantle transfers, and beats
  were only captured on armed runs. Dropped from the wall report.

## Mechanism autopsy
The lever did exactly what it said: the cook smoked 521k kcal of
days-3..4-out fresh that the <=2 window never saw. Waste did NOT fall —
because days-3..4-out fresh is INSIDE the village's fresh-draw horizon. The
village eats fresh-first (pantryDraw soonest-spoiling); the 250/person dinner
reserve only protects tonight+tomorrow's draw. A day-3..4 stack is dinner in
3-4 days — the village would have eaten it at 1.0x. Smoking it at the blind
0.80x destroys 20% of dinner-bound kcal. The <=2 window's special property is
now named: it sees ONLY what the village cannot eat before it rots. The
extension crossed the line from "would-rot" to "would-eat" — the dinreserve
finding's mirror image (there: extra preserved kcal went to stomachs; here:
extra smoked kcal came OUT of stomachs).
- Heterogeneity tells the story: belongfeast-s4703 — armed smoked 47,806
  w34 kcal in 48 days (~1k/day) and the village STARVED TO DEATH (3
  STARVATION deaths, d48 vs control d178). The 20% haircut on dinner-bound
  food is lethal in marginal pantries. leadfeast-s4708 improved (0.598,
  182d vs 100d) — in feast-rich villages the extra smoking is harmless
  surplus handling. Aggregate verdict is a wash at 1.0454; the harm is
  seed-specific, which the every-gate rule still kills on.
- The rot the drive never sees remains: post-cook arrivals, death-tail,
  trajectory noise (the triage lesson, #99). Widening the window reaches
  the wrong pool.

## Metric review
1. The primary is BLIND TO STARVATION HARM: belongfeast-s4703 scored ratio
   0.000 (the "best" pair in the set) while its village starved to death.
   A waste-rate primary on this axis needs a starvation-death veto or a
   paired "no collapse" prong — proposed for the NEXT run's header, not this
   one's (the miss stands per §14).
2. Volume sanity as written was nearly vacuous (control = 0 by construction);
   the 30k aggregate bar did the real work. Kept as designed — honest.
3. The heterogeneity lens (per-pair direction split) caught the real story;
   keep it on future food headers.
4. Instrument miss: young-link succession survival unmeasured (MANTLE_RE
   matched monster codex-death beats; beats captured armed-only). A future
   run needs the true mantle-transfer beat ("The Codex turns a page: NAME,
   N days. The mantle passes to NAME") captured on both sides.

## Sense reads (cookwin-beats/, first armed run per policy)
1. Drive narration (leadfeast-armed-s4701, d9-d16): "🍲 Cedric cooked for the
   haven — meals stretched. Cedric worked the smoke racks too — 4 batches
   preserved (~3849 kcal, keeps for weeks)." Honest: names the cook, the
   batches, the kcal, the shelf. The skilled/blind distinction is visible in
   the voice (d12 Cedric "keeps for weeks" at 0.95x vs d16 Mara "a couple of
   weeks" at blind 0.80x) — matches the canon blind-penalty teaching.
2. Teaching beats (d5, d11): "the woman in her 40s, the veterinarian taught
   the person in their 50s Food Preservation" / "Codex: Elena taught Mara
   Food Preservation" — person-to-person transfer reads as real social
   knowledge movement; the d12 LEARNED beat follows a trial gift coherently.
3. The "Codex turns a page on its own. Choir Toad is dead." beats read fine
   as monster-codex updates — but they are what my mantle instrument
   misread as successions (documented above). The fiction is coherent; the
   instrument was wrong.

## Verdict
**KILLED at sweep (primary missed 1.0454 > 0.85; every-gate rule).**
Mechanism engaged (521k w34 kcal) but moved the wrong pool: the widened
window smokes dinner-bound food at a 20% haircut and starved a marginal
village (belongfeast-s4703, 3 starvation deaths, d48 vs d178). The game-code
change was reverted zero-trace (never committed; `git checkout HEAD --
src/js/game.js` verified clean). Instruments + evidence + proof kept:
scripts/test-cookwin-b.js, scripts/sweep-cookwin-b.js,
scripts/cookwin-det-baseline-20261017.json, evidence/2026-10-17/perseed-cookwin/,
evidence/2026-10-17/cookwin-beats/, logs.
- Named lesson for the axis: the <=2 about-to-rot window's special property
  is that it sees only what the village cannot eat before rot. Smoking levers
  must target the rot the drive never sees (post-cook arrivals, death-tail),
  not widen the window into the draw horizon.
- Blanks documented (not chased): mantle-transfer beat instrumentation needs
  the true transfer pattern on both sides (metric review #4).
