# sim-partysize4-rerun-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partysize4-rerun-b · **Loop B run:** fleshout-loop-b-20261118T2030Z
**Type:** BUILD — re-run the PARTYSIZE4 lever (4th companion seat on
wave-4+ hunt plans) on a launch-rich band with the LAUNCHSURVIVE
launch tracker, to answer finding #2557 (post-quad launch drought).
**Frozen:** 2026-11-18 ~21:15 UTC, before the pilot sweep. The lever
is cherry-picked onto current master at freeze time (see Base); the
proof tests are green on the rebased tip (test-partysize4-b 42/42,
test-partyquads-b 29/29); no judged sim has run. The freeze binds
the metrics, thresholds, band, and policies below — a miss is
NO-GO, never re-scored mid-run (§14).
**Branch tip:** `sim-partysize4-rerun-b` at `1ea36b40f` (brain half).
**Base:** master `ecdee2fff` (journey-establishment r241) +
cherry-picked `072bcdf2f` (partyquads counter re-land
`d8c016a9c`), `c7ae32163` (lever win-plan half `ec1e393ef`),
`1ea36b40f` (lever brain half `c01fb5de4`). All three cherry-picks
applied clean — no commits touched `src/js/win-plan.js` or
`src/js/villager-brain.js` between the lever's base (`c4a9ba498`)
and this master, so no conflict was possible and none occurred.
The partyquads commit is a documented dependency, not scope
creep: `analyze-partysize4-b.js` hard-requires
`analyze-partyquads-b.js`, and the `partyQuads` stateOf default
lives in it — the 1735Z run built its base the same way
(master + cherry-picked partyquads `d8c016a9c`).
**Builds on:** `evidence/2026-11-18/sim-partysize4-b.md` (pilot
NO-GO METRIC-BROKEN: arm launched only 2 wave-4+ parties on band
105201–105208, floor ≥6/leg; both launches were quads, counted
2/2) and its frozen prereg `sim-partysize4-b-prereg.md`; findings
#2557 (post-quad launch drought — this run's question), #2558
(fourth seat has no spoken line), #2559 (quad fights cap at the
usual ally count).

## Why this re-run, and what is different

The 1735Z pilot proved the mechanism (quads form and count) but
could not judge the lever: its band launched 7 wave-4+ parties on
the control leg and 2 on the arm leg across 8 seeds, against a
blind pool floor (≥6/leg) set without measuring any band's launch
rate. Two seeds diverged after one quad launch each — the arm
village then never launched again while control launched 4 more
times (105201) and 1 more time (105202) — and with 2 launches the
band cannot tell whether "fewer later launches" is a real lever
cost or trajectory divergence. This run fixes the two defects
the 1735Z metric review named: (1) the band is picked FROM a
measured control-leg launch rate, with the floor derived from
that rate; (2) the LAUNCHSURVIVE tracker runs on both legs, so
the post-quad divergence is traced, not inferred.

## Band choice — measured, not guessed

Control-leg wave-4+ launches were measured from prior corpora
with the task-specified definition — `v4departs` rows with
`result === 'launch'` and `targetWave >= 4` (NOT all launches),
150d, competent policy — before this band was committed:

| Candidate band | Prior corpus | Seeds | Ctl w4+ launches | Mean/seed |
| --- | --- | --- | --- | --- |
| 104431–104446 | wildavoid-confirm-a-ctl (master) | 16 | 24 | 1.50 |
| 104411–104418 | aidleave-b-ctl (master) | 8 | 17 | 2.13 |
| 104701–104712 | wildavoid-seedplan-b-confirm-ctl (branch sim-wildavoid-seedplan-b) | 12 | 53 | 4.42 |

Per-seed for 104701–104712: 104701:0, 104702:0, 104703:5,
104704:12, 104705:2, 104706:5, 104707:0, 104708:13, 104709:4,
104710:2, 104711:10, 104712:0. **Richest band: 104701–104712.**
Pilot window: the richest contiguous 8-seed window,
**104704–104711 = 48 measured control-leg wave-4+ launches**
(12+2+5+0+13+4+2+10), one zero seed (104707) included — the
window was NOT scrubbed of zeros.

Two honest caveats, recorded before the sweep:
1. The brief cited "92 ctl launches/12 seeds" for 104701–104712.
   That figure does NOT reproduce under the task-specified
   v4departs definition (53 measured). It is the seedplan B2
   count — `dawnbidDeparts` rows with `result === 'launch'` and
   a wave-4 plan (seedplan evidence: "launches 92 → 76"). Both
   definitions agree this band is by far the richest; the pool
   floor below uses the v4departs definition only.
2. The seedplan corpora ran with PARTYSIZE4=1 on BOTH legs
   (substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, anchor
   877c5387f). The measured 53/48 was therefore measured with
   the lever ON. My control leg runs with the flag OFF, so it
   may launch fewer — the floor haircut below accounts for
   this, plus master drift since anchor 877c5387f.

**Freshness check** (skill local_seed_band_freshness): searched
ALL dated preregs (`evidence/*/sim-*-prereg.md`) for 104701–
104712 and for partysize/partysize4 bands. `104701` is named
only in `sim-partysize4-b-prereg.md`, in its list of bands
verified CLEAR ("105301 / 104701 / 104801 / 105401 / 105501
were also clear but 105201 was picked first") — an explicit
non-use declaration, not a reservation, and no partysize4
judged corpus exists on this band. No prereg names the
104704–104711 window. The band was used by wildavoid-seedplan
(a different lever); cross-lever reuse is this run's stated
design — a prior corpus is REQUIRED to measure the control-leg
launch rate. No forbidden/contaminated list names this band
(contaminated bands named in preregs: 9700–9711, 9930–9941,
73601–73608, 74201–74208). Freshness is therefore scoped to
the PARTYSIZE4 lever, as the brief directs.

## Primary metric (BINDING, §14)

**Quad-fire** = on the armed leg, analyzer-observed quad launches
(`v4departs`, `result === 'launch'`, `targetWave >= 4`,
`partySize >= 4`) AND `winPlanStats.partyQuads` counting them.

**GO threshold:** arm observed quads ≥ 1 **AND** arm
`partyQuads` ≥ 80% of arm observed quads **AND** control observed
quads == 0 **AND** control `partyQuads` == 0 **AND** per-seed
exact (arm `partyQuads` == observed quads) on ≥7/8 seeds.
**Pool floor (binding, derived from the measured rate):**
control leg ≥ 20 wave-4+ launches **AND** arm leg ≥ 6 wave-4+
launches **AND** ≥ 1 observed arm quad. Derivation: 20 is ~42%
of the measured 48 on the pilot window — a haircut for master
drift since anchor 877c5387f, for the PARTYSIZE4-off control
leg, and for trajectory divergence; 6 retains the 1735Z
absolute arm minimum so a near-empty arm pool cannot pass.
The floor is asymmetric BY DESIGN: the arm leg's launch count
is itself under investigation (finding #2557), so the pool is
measured on the control leg and the arm leg carries only the
old absolute minimum. Below the floor the pilot is
under-powered and the verdict is NO-GO (METRIC-BROKEN /
NO-QUAD-POOL), never a pass on a vacuous 0==0.

**Predicted outcome (stated before the sweep):** GO on
formation + counting, with a real pool this time — the lever
converted every wave-4+ launch it saw into a quad on the
1735Z band (2/2), and this band stages ~6x the launches. The
open questions are the #2557 divergence (does the arm leg
keep launching after a quad?) and whether the PARTYSIZE4-off
control leg reproduces the measured 48.

## Finding #2557 — LAUNCHSURVIVE analysis (REPORTED, not binding)

The tracker runs on BOTH legs (`LAUNCHSURVIVE=1`,
`v4launchTrack` rows in every corpus file — the partysize4
driver lineage already wires it; no new wiring was needed).
Analysis: run `scripts/analyze-launchsurvive-a.js` on the two
corpus dirs, plus a per-seed post-quad window table: for every
seed where the arm leg launches a quad, list the quad day,
then count wave-4+ launches in the 30 days after the quad on
each leg (same seed, same window), and the launches before
the quad for the same seed. Report whether the arm leg's
post-quad launch rate differs from control beyond trajectory
noise — with the 1735Z numbers as the reference (control
launched 4 more times after the quad on 105201, 1 more on
105202; arm launched 0 after on both). This analysis is
REPORTED, not a GO bar: it answers a question, it does not
judge the lever. If the arm leg's post-quad drought reproduces
on a launch-rich band, #2557 upgrades from "cannot tell" to a
named lever cost with numbers; if launches continue, it
downgrades to a 1735Z trajectory artifact.

## Secondary metrics (supporting, not binding unless marked)

- **Trio accounting (binding):** per-seed `partyTrios` ==
  analyzer-observed size≥3 launches on ≥7/8 seeds on EACH leg.
- **No-misfire (binding guardrail):** arm `partyQuads` == 0 on
  every seed where observed quads == 0; control `partyQuads` ==
  0 everywhere. A nonzero count with zero observed quads is a
  misfire — NO-GO outright.
- **Damage share on size-4 meetings (REPORTED, not binding):**
  mean `mDealt / mHpStart` on launched size-4 fought meetings
  vs control launched meetings, with the repaired recorder.
  NOT a GO bar: the fight-ally cap is known-binding (finding
  #2559 — a 4th member travels but cannot join the fight).
- **Cost bars (GUARDRAIL, binding):** starvation ≤ ctl+2 on
  totals AND arm-only deaths; median survival ≥ 0.8× ctl median.
  A GO met with these breached is NO-GO (§14).
- **Instrument:** 0 instrument errors on all per-seed files;
  8/8 files both legs; `missingHp` 0 on fought rows;
  `v4launchTrack` present on every file (LAUNCHSURVIVE bar).
- **Balanced panel** (`build-partysize4-b-panels.js` with
  `SEEDS=104704,...,104711` + `balance-panel.js compare`): the
  panel is the instrument, not the judge. Expectation is
  `no_material_signal` on most metrics with `review_required`
  from the 8-seed screen size investigated row by row, never
  waved.
- **Sense-test:** read villager dialogue/transcripts from the
  sims; judge meaning and coherence, not just counts. Flag
  anything robotic. (No villager dialogue transcripts are
  captured by this driver; talk quality is probed from the
  expedition/vetSays rows it does capture.)

## What this pilot does NOT judge

- Wins / national / table (the lever attacks damage-via-numbers,
  not standing; no movement expected — wall numbers are reported,
  not judged).
- The fight-ally cap (#2559) or the damage a 4th member adds in
  the fight (reported above, judged by the cap arm).
- Gate-4s (decided in the 1735Z prereg, finding #2550:
  `partyQuads` counts LAUNCHES only).
- The trio lever (substrate, judged already).
- Finding #2558 (fourth-seat spoken line) — a follow-up build,
  not this run's lever.

## Fixture staging (local-proof-of-effect)

The pilot runs live sims (competent policy), not a staged
fixture — the "fixture" is the live village, and the first two
pilots already showed live quads forming. The proof test's §5
fixtures stage the encounter as measured: a wave-4-target plan
holder at Haven with armed, trusted, Haven-idle companions
including a living wave-3 killer — the party a player actually
has when they reach wave-4 content — never a fresh un-geared
solo scholar. The §5q quad-fire leg in `test-partyquads-b.js`
fires on this branch (29/29 green, re-run after the rebase).
The rerun proof test (`scripts/test-partysize4-rerun-b.js`,
written after the sweep) proves the rebase + each measurement
on the real corpora: lever present on the rebased tip, a quad
actually launching and being counted by the fight engine's own
depart record, `v4launchTrack` present on both legs.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves
  4–5 / national / table). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 104704, 104705, 104706, 104707, 104708, 104709,
  104710, 104711 — the richest contiguous 8-seed window of the
  launch-richest measured band 104701–104712.**
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1`, `FIGHTALLY2` unset,
  `LAUNCHPARTY` unset. **Tracker both legs:** `LAUNCHSURVIVE=1`.
  **Legs differ ONLY by the lever flag:** ctl `PARTYSIZE4`
  unset, arm `PARTYSIZE4=1` — same branch code both legs (the
  lever is env-gated default-OFF, so flag-off IS the control).
  The driver asserts MODE↔env (ctl ⟺ flag unset, arm ⟺ flag
  =1) and records `leverPresent` + flag state per corpus file.
- **Instrument:** `scripts/partysize4-driver-b.js` (unchanged
  from the 1735Z lineage — it already carries the LAUNCHSURVIVE
  tracker, `v4launchTrack` rows, and the MODE↔env guard).
  Analyzer: `scripts/analyze-partysize4-b.js` (reuses
  `analyze-partyquads-b.js`). Panel builder:
  `scripts/build-partysize4-b-panels.js` (SEEDS env). Proof:
  `scripts/test-partysize4-b.js` (42/42) +
  `scripts/test-partyquads-b.js` (29/29), both green on the
  rebased tip before this freeze.
- **Confirm:** a 12–16 seed confirm runs ONLY on a pilot GO
  AND only if time remains — this run closes ~22:30Z; a
  finished pilot + evidence beats a stranded confirm.
