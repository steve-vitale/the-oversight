# sim-wirewatch-b — the watch-drive: haven-hours for the trapline (backlog #633)

Worker: fleshout-loop-b run fleshout-loop-b-20261019T1929Z, arm sim-wirewatch-b.
Worktree: ~/workspace/worktrees/sim-wirewatch-b.

## Pre-registration (binding; written BEFORE the pilot sweep — MEASUREMENT.md §14)

- **Base SHA (frozen):** e374e9a3a98f0f33134def17947807e3f7de00ab — verified
  at worktree HEAD before any measurement. Tree delta during measurement:
  scripts/policies/wirewatch.js (new, the layer under test),
  scripts/policies/competent.js (additive wiring: require + one
  env-gated comeHome call at end of daily), instruments only otherwise.
- **Primary metric:** scholar snare recipe-L1 learn rate — runs with a
  recipe-learn event / 16 pilot runs. Before/after on IDENTICAL seeds;
  the drive is WIREWATCH=1, default OFF (unset = byte-identical control).
- **GO threshold:** armed learn-rate ≥ control + 2/16 AND armed ≥ 5/16,
  with ≥2 MECHANISM-ATTRIBUTED learns (defined below). A rate lift with
  zero mechanism-attributed learns is trajectory noise → NO-GO (the
  wirebootstrap-b2 metric-review lesson: 3/4 "successes" weren't the
  mechanism).
- **Mechanism attribution:** a learn is mechanism-attributed iff
  (a) its grant type is 'taught' (the return teach beat — the beat the
  watch positions for), (b) the layer held ≥1 come-home night in the 7
  days before the learn (ctx.wirewatchComeHomeDays), and
  (c) the same-seed CONTROL run shows the scholar away from haven for ≥1
  npc_trap return in those 7 days (the counterfactual: without the layer,
  this window was unwitnessed — both sides log scholar position at each
  npc_trap tele).
- **Mechanism check (reported, not separately judged):** armed npc_trap
  witness rate ≥ 98% (probe baseline 90.8% — the layer did its positioning
  job) vs control.
- **Guardrails (binding):** (a) median survival ≥ control − 10d;
  (b) paired starvation deaths ≤ control + 1; (c) no new death mode —
  any death-cause key absent from the control corpus appearing on ≥2
  armed runs is a same-run investigation item.
- **Horizon:** 180d death-aware (dead villages stop simulating + 10d tail
  max — the harness's own deadTail; never a fixed grind).
- **Seeds:** 41711, 41713, 41714, 41715, 41716, 41718, 41719, 41720 —
  screened pre-run (scripts/screen-wirewatch-20261019.js, loadGame+
  setupGame only, design-only): scholar L0 + ≥1 living knower at day 0.
  41712/41717 excluded (0 knowers — the channel is dead there by
  construction). Freshness verified: zero genuine hits for 41711–41730
  in evidence/ + scripts/ + hidden_files/ before sims.
- **Policies:** leadfeast, belongfeast (competent family; FEASTSCALE_R13=1
  substrate, SEATDRIVE=0 pre-seat per the run claim — matches the teach
  lane's substrate).
- **Convergence:** converging — the teach sub-axis moves (snareteach
  landed: 4/8→5/8, median day 6→2); this arm tests the witness sub-axis.

## Canon read

- docs/CANON.md: human skills are teachable earthly knowledge (the snare
  is a RECIPE, taught villager→player); knowledge gates every surface;
  "If you don't know, it doesn't show."
- No hunting/traps canon doc exists in docs/ (verified 2026-10-19 — same
  finding as the trapjoin and npctrap runs). Stated here, not invented:
  the snare learn beats live in src/js/villager-objectives.js (see Engine
  reading below).

## Engine reading (from code, 2026-10-19 — the brief's required first step)

The brief asked for "the witnessing/learn hook that grants snare recipe
L1 on witnessing a catch." Code reading verdict: **no such hook exists
for snare.** Scholar snare-L1 grants exist at exactly two sites
(grep: grantKnowledge('recipe','snare') — 2 hits, both in
src/js/villager-objectives.js):

1. **TRAP TEACHING beat** (:1307, objReturnEffect 'traps'): a knower's
   TRAPS return, witnessed (playerAtHaven), scholar L0, !taughtSnare
   (once per teacher), trust ≥ 15 (read BEFORE the return's own +1) →
   recipe L1, grant type 'taught'.
2. **SNARE OVERHEAR** (:1162, snareLessonOverhear): the teach chore lands
   a 'snare' lesson (agencyTeachVillager: teacher trust ≥ 15, learner
   picked at RANDOM among villagers present, need-gated hungry/novice,
   85% roll) while the scholar is at haven, scholar L0, trust(teacher)
   ≥ 15 → recipe L1, grant type 'witnessed'.

Findings that shaped the design (all verified in code, then measured):
- The pit HAS the witnessed-catch bootstrap the brief describes
  (pitknowledge 2026-10-18: a witnessed pit catch teaches pit L1, NO
  trust gate — villager-objectives.js:1267). The snare does not. A
  low-trust "watch me" learn is therefore NOT implementable policy-side;
  that hook would be game-code. **This is the brief's anticipated pivot:
  documented here, pivot to the best policy-side approximation below —
  no engine hooks invented.**
- Accompanying the trapper is counterproductive: both beats read
  playerAtHaven at fire time; an away scholar cannot be taught.
- The teach chore is NPC-autonomous: the objective AI picks it
  (villager-objectives.js:473 — 'teach' enters the chore pool for
  knowers; the social-need track forces it at w1.2). assignTask('teach')
  is the haven ROLE (game.js:6857 — plants + contribution credit, never
  agencyTeachVillager). It cannot be staffed policy-side. (This also
  re-explains trapjoin-b's 0-lessons-from-4-duties: the duties were haven
  roles, the wrong lane — the census's 5 organic teach-chore calls were
  the autonomous path.)
- Probe (scripts/probe-wirewatch-20261019.js, 8 runs × 60d, fresh seeds
  41711–41714): **87 npc_trap returns, 79 witnessed (90.8%)**; teach-chore
  calls with a knower teacher 11/127 (8.7%), ALL witnessed (100%); 6
  landed snare lessons, all witnessed. The honest policy-side gap is the
  ~9% of unwitnessed returns. The overhear channel has no positioning
  gap (100%) and no staffable lever.

## The lever (policy-side, scripts/policies/wirewatch.js, WIREWATCH=1)

**Haven-hours for the trapline.** While the wire is unlearned (L0) and a
living knower holds the wire, the scholar comes home every night — no
multi-day trips while the lesson is pending. Positioning ONLY: the
scholar's own movement (the walkTo shape — travelTo steps, stops at
fights/blockage/refusal; self-contained in the layer, no circular
require), no trust moved, no knowledge granted, no NPC agency touched.
The trust-15 gate itself is the teach-drive's lane (SNARETEACH, landed)
— this layer only keeps the scholar in the room where the beats fire.
Wired into competent.js daily end (after competentEat), next to the
snareteach precedent: `wirewatch.comeHome(Game, ctx)` — env-gated,
gate-off is a pure no-op.

Design calls (Steve can overrule):
- The watch holds for ALL living knowers (spent or not) until L1 — the
  overhear channel stays open for spent teachers holding the teach
  chore; the return beat is once-per-teacher but the watch costs one
  nightly walk either way.
- The layer never walks the scholar out of a fight, never walks on
  Game.over, and records a come-home only when the scholar actually
  moved (refused travel = null, no trace).
- Det-gate (scripts/det-gate-wirewatch-20261019.js): on no-knower seeds
  the layer is idle by construction — WIREWATCH=1 vs unset must be
  trajectory-identical (proves zero footprint when idle).

## Proof test

scripts/test-wirewatch-20261019.js — 11 checks. RED: WIREWATCH unset →
comeHome null, zero verbs, zero ctx writes (gate-off = master behavior).
GREEN: flag set → away scholar walked home (travelTo, ctx logged, day
logged once); already-home / L1 / no-knowers / dead-knower / fight /
game-over / refused-travel → null with no trace. Live smoke (6d
leadfeast s41713, WIREWATCH=1): no errors. **11/11 pass.**

## Before/after (identical seeds)

Driver: scripts/sweep-wirewatch-20261019.js (per-seed JSONs alongside this
note). Balanced panel: scripts/balance-panel.js on the pilot seeds,
before/after per §15 (compare .md attached).

### Pilot results

Driver: scripts/sweep-wirewatch-20261019.js (per-seed JSONs:
evidence/2026-10-19/perseed-wirewatch-b/{wirewatch-baseline,wirewatch-armed}/).
Balanced panel: scripts/build-wirewatch-panels-b.js → §15 compare
evidence/2026-10-19/wirewatch-panel-b.{md,json} (+ -before/-after.json.gz).

| Metric (16 before / 16 after) | baseline | armed |
|---|---|---|
| scholar snare-L1 learn rate | 16/16 | 16/16 |
| median learn day | 6 | 6 |
| learn vias | taught ×14, witnessed ×2 | taught ×14, witnessed ×2 |
| learn days (per seed × policy) | 1,3,6,6,6,8,9,14 (both policies same) | identical |
| npc_trap returns / caught | 699 / 283 | 699 / 283 |
| npc_trap witness rate | 0.958 | 0.958 |
| away returns | 22 | 22 |
| snare_lesson (NPC→NPC) / overhears | 33 / 2 | 33 / 2 |
| **drive come-home nights** | — | **0** |
| median survival (days) | 147 | 147 |
| starvation deaths | 2 | 2 |
| end reasons | 12 village-lost, 4 survived | 12 village-lost, 4 survived |
| national / table / wins | 15 / 0 / 0 | 15 / 0 / 0 |
| waveMax / wave4 / wave5 | 4 / 11 / 0 | 4 / 11 / 0 |

Per-seed: every one of the 16 pairs is BIT-IDENTICAL — same learn day,
same via, same survival, same end reason, same witness rate. The layer
fired zero times (0 come-home nights): on all 16 armed runs the scholar
was already home at every end-of-daily during the learn window, so
comeHome returned null before any verb.

## GO adjudication — KILLED AT PILOT

- **Primary (pre-registered, armed ≥ control+2 AND ≥5/16 with ≥2
  mechanism-attributed): MISS.** 16/16 vs 16/16 (+0), 0 attributed.
- **Mechanism check: the layer never engaged.** 0 come-home nights;
  witness rate 0.958 both sides; away returns 22 both sides.
- **Guardrails: all PASS** (survival 147 vs 147−10; starvation 2 vs 2+1,
  all pairs within +1; no new death mode).
- **Panel (§15):** no_material_signal on every observed metric (all
  paired deltas exactly 0); decision review_required (the panel's default
  posture — no auto-clear). The instrument worked; there is no signal
  because there is no difference.

**Verdict: KILLED-AT-PILOT.** Classification: **substrate-missing /
mechanism-inert** — not concept-dead, not metric-broken. The mechanism
(keep haven-hours so the trapper's returns are witnessed) is sound, but
the opportunity does not occur on the competent substrate: the scholar
learns the wire in days 1–14 while their early-game routine already
keeps them home every night. The ~4% unwitnessed returns (22/699) are a
post-learn phenomenon — the scholar roams only after the lesson is
learned. A watch-drive cannot engage where the scholar never leaves.

Per kill protocol: scripts/policies/wirewatch.js deleted zero-trace;
the competent.js wiring (require + comeHome call) reverted; instruments
(proof test 11/11, sweep, probe, screen, det-gate, panel-builder, sense,
analyzer) + evidence kept.

## Sense test

The watch never engaged, so there is no watch transcript to read — the
layer is silent by design (the scholar's own feet; the engine narrates
travel, and a nightly "I'm staying home" line would be spam). The learn
beats were sense-read on armed runs (evidence/2026-10-19/wirewatch-sense-b/):

The d3 overhear learn (leadfeast s41714, WIREWATCH=1), read whole:

> [d3] 📖 Samuel is showing the man in his 30s, with a scarred cheek the
> snare — the loop, the trigger stick, where the run narrows between the
> roots. "Opossum trails. Check at dawn. Always."
> [d3] ★ RECIPE LEARN: snare L1 via=witnessed by=Samuel
> [d3] Recipe: Snare (Level 1). You have seen a snare. A loop, a stick, an
> animal.
> [d3] 🪤 You watch Samuel walk someone through the snare — the loop, the
> trigger stick, where the run narrows between the roots. Your hands don't
> know it yet. Your eyes do.

Reads as earned: a person teaching a person, physical and specific, no
mechanic-speak. The village reads alive around it — the dawn trapline
patter ("Wire doesn't lie.", "Snares were empty. They'll keep."), the
patient teaching beats ("Hands patient. It takes three tries."), the pit
line working beside the snare line (raccoon +560, pit recipe learned the
same morning). PASS.

Neighbor observation, not this arm: the garden sowing line ("You sow
Burdock — 14 days to maturity...") repeats verbatim 3× when the scholar
sows 3× — honest (same action) but slightly robotic. Noted, not chased.

## Village assessment

Sixteen villages on the pre-seat feast substrate, all with wire-knowledge
at day 0 by screening. The shape is strikingly uniform: the scholar
learns the wire in the first two weeks (median day 6; earliest day 1,
latest day 14), 14 via the return teach beat, 2 via the overhear. The
trapline then works or doesn't on the materials gate (the wirebootstrap
finding — traps need wire, and the scholar's hands learn by doing). Where
the line engages it's the familiar living pattern: dawn checks, honest
empty lines, real catches (283 caught of 699 returns across the batch).

Who thrives and dies: the wave-1 meat grinder dominates (12/16
village-lost, median survival 147d); 4 villages survive all 180 days.
Starvation is rare (2 deaths across 32 runs) — villages die to combat,
not hunger, on this substrate. Nobody reaches the table (0/16 both
sides); waves stall at 4 (11/16 reach wave 4, 0 reach wave 5); national
15/16 — the standing scale-wall shape, wire or no wire.

What knowledge was missing: nothing about the wire itself — on
knower-present seeds the learn is 16/16 robust. The seed-fragility in
#633 is knower PRESENCE (41712/41717 screened out: 0 knowers — the
channel is dead there by construction), not witnessing. The watch-drive
addressed the wrong sub-gap.

## Blanks filled / documented

- **DOCUMENTED (this arm, #633 reframed):** the trapline's seed-fragility
  is NOT a witnessing problem. Measured: 16/16 learns on knower-present
  seeds (median day 6); the watch-drive's 0 engagements prove the
  scholar is home during the entire learn window; the 4.2% unwitnessed
  returns are post-learn. The fragility lives in (a) knower presence at
  day 0, (b) the trust-15 timing (snareteach's lane, landed), (c) the
  materials gate for crafting (wirebootstrap's open ACQUIRE leg). The
  brief's "low-trust watch me" channel does not exist in the engine —
  the pit has the witnessed-catch bootstrap (no trust gate), the snare
  does not. If the wire is ever to be learnable below trust 15, that is
  a game-code hook (the pit's pattern applied to snare), not a policy
  drive. Named next for a future arm.
- **DOCUMENTED (engine misreading corrected):** assignTask('teach') is
  the haven ROLE (plants + contribution, game.js:6857), never
  agencyTeachVillager. The teach chore is NPC-autonomous and cannot be
  staffed policy-side. This re-explains trapjoin-b's 0-lessons-from-4-
  duties (the duties were haven roles, the wrong lane).
- **FILLED:** none — the arm is killed. The instruments (probe, screen,
  det-gate, sweep, panel-builder, sense, analyzer) are kept for the next
  trapline arm.

## Telemetry deviation check (run-body step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall-preseat.json --current
/tmp/wirewatch-telemetry-current.json --metrics national,table,won,exiled`
→ fired LOUD on "table disappeared: baseline 24 → current 0".
Investigated: **regime/flag artifact, not a deviation.** The preseat
baseline was built from the winsupport-decomp corpus with
NODEWITNESS=1/VETREL=1/WINDEFER=1; this pilot's substrate is the plain
feast pre-seat (FEASTSCALE_R13=1/SEATDRIVE=0, no extra flags) — the same
substrate as the snareteach pilots, which also show table 0/8. The honest
comparison is armed vs control (my own baseline): national 15/16 both,
table 0/16 both, wins 0/16 both — identical. No layer deviation. Baseline
NOT rolled.

## Metric review

- The pre-registered GO bar was honest and the pilot honored it: the bar
  demanded mechanism-attributed learns, not just a rate lift. The rate
  was 16/16 both sides (ceiling — the screened seeds all learn), so the
  attribution clause was the binding judge, and it correctly returned
  NO-GO on zero engagement rather than a spurious "tie."
- The intermediate metric (learn rate ≤ day 8 / median day) is saturated
  on screened seeds — future teach-metric pilots on knower-present seeds
  should pre-register on the UNSCREENED composition (where the learn can
  actually fail) or on a harder margin (e.g. median learn day), not the
  raw rate.
- Median survival as a regression gate: both sides 147d — no butterfly
  noise this time (the 16 identical pairs bound perturbation at zero).
- Instrument note: the sweep's awayReturns/witnessRate tele wrapper is
  the reusable witness instrument for any future watch-adjacent work;
  scripts/analyze-wirewatch-b.js is the adjudication template (GO logic
  + paired guardrails + mechanism attribution).

## Convergence state

**killed-at-pilot** — food-economy axis stays **converging**. The
witness sub-axis is closed: the scholar is home during the learn window
on the competent substrate, and the unwitnessed returns are post-learn.
The remaining trapline gaps are knower presence (seed composition),
trust-15 timing (snareteach landed), and the materials/crafting gate
(wirebootstrap's open ACQUIRE leg) — plus the game-code low-trust watch
hook named above, if Steve ever wants the wire learnable below trust 15.

## Recovery (2026-10-19, fleshout-loop-b-20261019T2230Z — stale-lock recovery of run 1929Z/2047Z)

- The 1929Z run timed out; its worker left the kill commit unlanded (9098bdb66).
  The 2047Z recovery run committed c6707177c ("coordinator-recovery
  verification") but never merged it — and the commit was EMPTY (zero file
  changes): its claimed "kill-protocol proof block (WIREWATCH_KILLED=1, 3/3
  GREEN) + recovery note in evidence" existed nowhere. The claims were
  dropped as unsubstantiated per the worker-integrity rule (AGENTS.md).
- This recovery: rebased the kill commit clean onto master (edd3021d1),
  verified scope (49 files: scripts/ + evidence/ only; zero src/js, zero
  scripts/policies/ leftovers), and ran an honest post-kill verification —
  scripts/test-wirewatch-killed-b.js, 5/5 GREEN:
  V1 layer file absent; V2 no wiring in competent.js; V3 no src/js refs;
  V4 all 9 instruments present; V5 verdict documented.
- Note: the pre-kill proof (11/11 GREEN) ran before the layer was deleted;
  the proof script requires the layer and cannot run post-kill by design.
