# HUNGER-DEPTH EXEMPTION — pilot (fleshout-b ARM 1: hunger-depth-exempt)
2026-10-14 (run-b-20261014-0630) | axis: food-economy | arm: sim-hungerdepth-b

## Context
The landed prodthrottle lever (afb736e6) cut village-scale fresh-rot −41%
but its confirm was NO-GO at guardrails (median survival −14d, starvation
deaths +12). The r23b any-hunger exemption (exempt while
progState().hungryStreak > 0) was KILLED AT PILOT this morning: it backfired
(starve/100vd 1.241 → 1.853, +49%; GO needed ≤1.055) because a streak-1 gate
fires constantly (lead-77: 183 exemptions over 166d, zero starvation deaths)
and forfeits the redirect's trust-carrying wood/water/stone work
(evidence/2026-10-14/sim-hungerexempt-b.md; sim-findings #115).

This arm is the finding's named next design: gate on hunger DEPTH
(streak ≥ 3) — the engine's own chronic-hunger threshold, the same signal
that fires the hunger-winter crisis. Transient hunger (streak 1–2) still
fires the redirect; only chronic hunger exempts.

Signal note (engine-honest, not a proxy): progState().hungryStreak is the
anyStarving signal out of villageEats (some villager ate under 60% of
ration-adjusted need, not fasting, not on voted half-rations). The
empty-pantry clock v.hungryDays is MUTUALLY EXCLUSIVE with the throttle
(an empty pantry never engages — pantryFreshDays() = 0), so it cannot gate
the exemption; asserted in proof §4.

Recovery note: this run recovered an inherited draft proof
(scripts/test-hungerdepth-20261014.js). Two draft bugs were fixed before
any measurement: (1) the module-list grep was double-escaped and eval'd
zero modules (Scattering undefined — replaced with the landed proof's
working line); (2) the §2b famine fixture's gorge/zero meal-days skewed the
throttle's burn denominator and disengaged it mid-fixture (RED showed 3
failures) — burnHistory is now snapshotted/restored around the fixture.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sweep spend
- Question: does a hunger-DEPTH-gated exemption (streak ≥ 3) avoid the
  killed arm's backfire — i.e. does it leave the throttle's starvation
  cost no worse than the landed control, without gutting the rot effect?
- Lever: HUNGER-DEPTH EXEMPTION — game-code change in src/js/game.js
  resolveOneAssignment, behind the HUNGERDEPTH env gate (default OFF):
  when the throttle would redirect a forage/garden/fish duty but
  progState().hungryStreak ≥ 3, production continues (no redirect, no
  rotation advance, v.throttleExemptDepth counted) and the beat narrates
  the decision honestly ("🍽️ ...but someone has gone hungry three days
  running. The hungry eat first: keeps working the forage...").
  Streak 1–2 fires the redirect normally. HUNGERDEPTH=0: byte-identical
  landed behavior (real RED mode).
- CONTROL: landed throttle on current tip, HUNGERDEPTH=0 (exemption
  disabled). ARMED: depth-exempt throttle, HUNGERDEPTH=1. Same code tree,
  identical seeds, env-var only. (Master moved during the run: local
  master 44c90147 is evidence+scripts only — src/js/game.js byte-identical
  to this tree's base 212671ac, so the tree tests the tip's game code. No
  rebase performed per brief.)
- PRIMARY: starvation deaths per 100 villager-days (death-cause
  'starvation' over summed daily roster length from samples.pop), armed
  vs control on identical seeds. GO = armed ≤ control + 1.130 (one-sided;
  noise-aware bound = p90 |per-seed rate Δ| from the throttle-aa A/A
  calibration, evidence/2026-10-14/sim-throttle-aa-b.md). A miss is NO-GO —
  never re-scored against a friendlier metric mid-run.
- GUARDRAILS:
  - absolute fresh-rot kcal: armed ≤ 1.15 × control (the lever must still
    move rot — the exemption must not gut the effect)
  - median survival: armed_median ≥ control_median − 3d (A/A one-sided;
    ceil of p90 |Δdays|)
  - national: armed ≥ control − 2
- Horizon: 180d death-aware (dead villages stop, 10d tail — harnessstop
  fix); 180d is the pacing-law max.
- Seeds: 11/22/33/44/55/66/77/88 × leadcourt/belongseek, IDENTICAL seeds
  both sides (16 runs/side). This 16-run pilot IS the gate per
  pre-registration (pilot, no confirm spend this run).
- Instrument-honesty: SMOKE=1 gate before any sweep spend; named-export
  policy unwrap (no Object.assign({}, require(...)) — #69); per-side shape
  assertion (proof test, side-aware) before each side's runs; sweep logs to
  evidence/2026-10-14/ (never /tmp).
- Determinism gate (sim-findings #113): same seed+policy twice in-process
  on the control suite — bit-identical or quantified spread; effect must
  exceed the noise floor. Quantified spread (throttle-aa A/A): p90
  |Δdays| = 3d, p90 |Δsp100vd| = 0.144, p90 |Δsp100village-days| = 1.130;
  suite is highly deterministic, seed-dependent bifurcation on
  fight-heavy trajectories is real.
- Metric review: (mandatory section — filled after the run; metric doubts
  go here, revisions apply to the NEXT run.)

## Proof (scripts/test-hungerdepth-20261014.js)
RED→GREEN verified via the patch-file cycle (no git stash on the hot tree):
- RED (pristine tree, MODE=red): exemption inert — redirect fires into
  chronic hunger (streak 3/4), rotation advances, no exemption ledger,
  landed beat fires. ALL GREEN (post draft-fix).
- GREEN (armed tree, MODE=green HUNGERDEPTH=1): production continues at
  streak 3/4 (task not redirected, exemption counted, decision narrated
  honestly with pantry state + "three days running", redirect beat
  silent, rotation untouched); streak 1/2 fires the redirect normally;
  the engine walks its own streak 1→2→3 through REAL villageEats and the
  decision boundary flips exactly at the 2→3 transition
  ("1:redirect 2:redirect 3:EXEMPT"); a fed day resets the streak to 0
  (consecutive-day counter, not a flag) and the throttle redirects again.
  ALL GREEN.
- Gate-OFF RED semantics (armed tree, HUNGERDEPTH=0): all 24 checks ALL
  GREEN — identical inert shape to pristine.
- Mutual exclusivity (§4): empty pantry never engages even on the hunger
  clock (freshDays=0.0, hungryDays=5) — a hungryDays gate would be a dead
  branch; the proof pins this.
- Garden/fish duties obey the same depth gate (§5).

## Byte-identity check (HUNGERDEPTH=0 vs pristine)
- Code: when the gate is off, `depthExempt` short-circuits on the env
  check BEFORE progState() is read — the else branch is the landed block
  verbatim (same statements, same order: prodThrottleAltTask →
  pantryFreshDays → landed say → throttleRedirects++ → a.task=alt →
  recurse). In the browser (process undefined) the gate can never fire.
- Empirical (SEEDS=11,22 × leadcourt, DAYS=60, identical suite): armed
  gate-off vs pristine tree —
  - seed 22: ALL THREE runs byte-identical (rotF=133490, redir=285).
  - seed 11: armed-gate-off == pristine-rerun EXACTLY (rotF=40722,
    redir=318); both differ from pristine-run-1 (rotF=37362) — the suite's
    documented seed-dependent bifurcation (throttle-aa: "genuine
    trajectory bifurcation on rerun"), not a code difference. The gate-off
    tree reproduced a pristine trajectory exactly.
- Verdict: gate-off behavior is identical to landed up to the suite's own
  bifurcation noise. (Strict cross-process byte-identity is unachievable
  even pristine-vs-pristine; the A/A calibration quantifies the floor.)

## Instrument-honesty gate
- `SMOKE=1 node scripts/measure-hungerdepth-20261014.js`: ALL GREEN (8/8)
  — both policies unwrap to a real `daily`, the harness invokes it
  (meanCalls/day 4.5), and ≥1 policy-origin deliberate act fires
  (policyActs=2132 both policies). The suite cannot run policy-less.
- Per-side shape assertion before each side (proof, side-aware):
  - CONTROL (HUNGERDEPTH=0): ALL GREEN — exemption provably DISABLED.
  - ARMED (HUNGERDEPTH=1): ALL GREEN — exemption fires at depth only.

## Results

16 runs/side, 180d death-aware, identical seeds. Aggregates:
hungerdepth-control.json / hungerdepth-armed.json; per-seed
hungerdepth-{control,armed}-perseed/; logs hungerdepth-{control,armed}.log.

| metric | control (landed, HUNGERDEPTH=0) | armed (HUNGERDEPTH=1) | delta | pre-reg |
|---|---|---|---|---|
| starve deaths / 100 villager-days (PRIMARY) | 1.276 (17/1332vd) | 1.185 (17/1435vd) | −7.1% | GO ≤ 2.406 ✓ |
| starvation deaths | 17 | 17 | 0 | — |
| villager-days | 1332 | 1435 | +103 | — |
| fresh-rot kcal (guardrail) | 2017.5k | 2578.6k | **+27.8%** | ≤ 2319.1k ✗ |
| preserved-rot kcal | 175.0k | 246.8k | +41% | — |
| median survival | 115d | 117d | +2d | ≥ 112d ✓ |
| max survival | 180d | 180d | 0 | — |
| national | 9/16 | 11/16 | +2 | ≥ 7 ✓ |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| exiled | 0 | 0 | 0 | report only |
| max wave reach | 4 | 4 | 0 | — |
| wave-4 reach | 4 | 5 | +1 | — |
| wave-5 reach | 0 | 0 | — | — |
| hungryDays | 29 | 28 | −1 | report only |
| throttle redirects | 3728 | 3965 | +237 | — |
| throttle depth-exemptions | 0 (gate held, all 16) | 174 | mechanism fires | — |
| tribute (belongseek) | 1038.8k | 1335.4k | +296.6k | guardrail-only |

Per-seed (days / starve / sp100 | redirects | exemptions):
- control: lead-11 121/1/1.05, lead-22 158/2/1.91, lead-33 151/1/0.89,
  lead-44 96/1/1.27, lead-55 115/0/0, lead-66 95/1/1.92, lead-77 79/0/0,
  lead-88 52/2/4.76, belo-11 98/0/0, belo-22 180/0/0, belo-33 33/5/17.24,
  belo-44 180/0/0, belo-55 180/0/0, belo-66 137/1/1.02, belo-77 47/2/5.26,
  belo-88 29/1/5.00
- armed: lead-11 143/0/0 e31, lead-22 158/2/1.91 e0, lead-33 107/1/1.70 e5,
  lead-44 96/1/1.27 e0, lead-55 117/1/1.08 e1, lead-66 34/2/7.41 e4,
  lead-77 59/0/0 e48, lead-88 105/0/0 e7, belo-11 180/0/0 e3,
  belo-22 180/0/0 e0, belo-33 33/5/17.24 e0, belo-44 180/0/0 e0,
  belo-55 180/0/0 e0, belo-66 54/1/2.44 e9, belo-77 105/2/2.53 e59,
  belo-88 141/2/2.11 e7

Rot autopsy (per-seed armed−control ΔrotF): 6 seeds byte-identical
(Δ=0, exemption never fired — gate truly inert when hunger never reaches
depth 3). The +561k net Δ is dominated by ONE seed: belo-11 +589k
(armed 180d/667 redirects vs control 98d/169 redirects; only 3 exemptions
fired). Mechanism check: 174 exemptions × ~one duty's production
(≤1k kcal each) bounds the direct effect ≈174k — belo-11's 589k from 3
exemptions is a longevity cascade (3 early interventions → village
survives 82d longer → bigger village rots more), not the direct
mechanism. Rate-normalized rot still misses: per villager-day 1.186×,
per day-alive 1.195× (both > 1.15) — the miss is robust, not purely a
longevity artifact. See Metric review.

Death-cause shares (16 runs): control — combat 69, monster 27,
starvation 17, villager combat 16, sickness 12, wound 11, bad belly 2,
lockjaw 2, Ugly-Eyes 2, contest 1; armed — combat 74, monster 25,
starvation 17, villager combat 14, sickness 11, wound 11, contest 3,
Ugly-Eyes 2, lockjaw 1, expedition 1, experiment 1, The Suburb 1.
Starvation deaths identical at 17; combat remains ~60% of all deaths.

## Sense-test: the exemption beats
Verbatim beat (streak 3, forage duty, HUNGERDEPTH=1):

> 🍽️ A person, maybe 40s checks the pantry before heading out — ~10 days
> of fresh on hand, but someone has gone hungry three days running. The
> hungry eat first: keeps working the forage instead of turning to other
> work.
> 🌿 A person, maybe 40s returns with foraged food: +229 kcal to the
> pantry. 1 area stripped bare the near wilds.

Judgment: sensical. It names the pantry state honestly (~10 days of
fresh — the throttle's own condition, not hidden), names the depth
("three days running" — the gate's actual reason), names the decision
("keeps working the forage instead of turning to other work"), and the
consequence is visible on the next line (the forage haul lands in the
pantry — production genuinely continues). No silent branch. The voice
matches the landed redirect beat ("checks the pantry before heading
out") with the decision flipped — consistent register, honest contrast.
Ledger: v.throttleExemptDepth=1, redirects=0, rotation untouched.

## Village assessment
What the villages looked like across 32 runs: the depth gate fired 174
times total (vs 686 for the killed any-hunger arm — the ≥3 gate fires
~4× less often, as designed). On 6/16 seeds it never fired and the armed
trajectory ran byte-identical to control — chronic hunger simply never
arrived there.

Who thrived: belo-11 armed — 3 early exemptions during a chronic-hunger
spell cascaded into a 180-day village (control died at 98d), reaching
national. The exemption did what it was designed for: fed the hungry
through a crisis instead of redirecting to wood/water/stone.

Who died and why: belo-33 both sides collapsed at 33d with 5 starvation
deaths — too fast for the depth gate (it needs 3 consecutive hungry days;
the village was already dead). lead-77 armed fired 48 exemptions yet died
at 59d; belo-77 fired 59 and died at 105d — the exemption delays but does
not prevent collapse when the bind isn't food distribution. Combat
remains the dominant killer (~60% of deaths both sides); starvation
deaths were identical at 17.

What was missing: nothing new in the exemption's area — the decision,
its narration, and its ledger all behaved. The blank this run filled was
the draft proof's two bugs (fixed before measurement). The blank
documented, not filled: the rot guardrail's absolute-kcal form (see
Metric review).

## Wall numbers
national 9/16 → 11/16; table 0 → 0; wins 0 → 0; wave-4 reach 4 → 5;
wave-5 0 → 0; median survival 115d → 117d; max 180d both. The scale wall
stands — no table, no wins, no wave-5 on either side.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-14/hungerdepth-{control,armed}-perseed/*.json'
--metrics national,table,wins,exiled` (run per side; the script's glob
supports one `*` in the basename only):
- control: quiet (16 files, no large deviations)
- armed: quiet (16 files, no large deviations)
Baseline (national 8, table 0, wins 0, exiled 0) NOT rolled — no
deviation to explain.

## Metric review
(mandatory) The rot guardrail as pre-registered (absolute fresh-rot kcal
≤ 1.15× control) MISSED at 1.278×. Two observations for the NEXT run's
design, not this one's verdict:
1. Absolute rot penalizes longevity: the arm's mechanism (feed the hungry
   → village survives longer) increases total rot through more
   village-days even when the per-unit rate is unchanged. A
   per-villager-day (or per-day-alive) rot rate would separate the
   lever's effect from lifespan. (Rate-normalized this run: 1.186× per
   villager-day, 1.195× per day-alive — still above 1.15, so the miss is
   robust, not purely a metric artifact.)
2. The rot A/A noise floor was never calibrated (throttle-aa calibrated
   days and starvation rate only). A future rot guardrail should carry a
   p90 |Δrot| calibration like the starvation bound.
Neither revises this run: per §14 the miss is NO-GO, binding.

## Verdict
NO-GO — killed at pilot. Primary GO (1.185 ≤ 2.406), median GO (117 ≥
112), national GO (11 ≥ 7), but the pre-registered rot guardrail missed
(2578.6k > 2319.1k bound, 1.278× vs 1.15×). Per §14 the miss is binding
and is not re-scored. Arm reverted per kill protocol: src/js/game.js
restored byte-clean, scripts + evidence kept, landed prodthrottle stands
without the exemption. Convergence state: killed-at-pilot.
