# SIM-RACKSANSWER — the windfall feast: the racks-full binding answer (ARM sim-racksanswer-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-racksanswer-b
Axis: food-economy (scale-wall lens) — the racks-full binding answer, via
sim-rackschannel-b finding #462 and sim-dinreserve-b2's "next arm" note.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the racks-full guard binds preservation, but lifting it
  converts at only 0.46x (rackschannel) and freed throughput rots at the cap
  (dinreserve-b2: +16% duty, +381k absolute rot). The binding is fat-day
  CLEARING CAPACITY: fresh inflow exceeds what the nightly meal
  (~125/person), the guard-bound duty cook (4k/resolution), and the
  cadence-bound feast (400/head every 7-14d) can clear. Can a policy-side
  WINDFALL FEAST — the feast as the fresh sink, fired on doomed surplus
  instead of cadence — cut absolute rot?
- **Lever**: scripts/policies/racksanswer-b.js (RACKSANSWER=1, default OFF;
  wraps leadfeast/belongfeast). When the pantry holds doomed fresh
  (bonus-inclusive (spoilDay+bonus)==day+1 — rots tomorrow, must be eaten
  tonight) beyond 300*roster kcal, the scholar holds a feast NOW, bypassing
  the 7/14d cadence. Every other feast gate kept (dusk, haven, one/day,
  affordability have>=cost*1.5, contribution >=1500/7d). Draws urgency-first
  via the engine's own hostFeast/pantryDraw (spoiled skipped). Cadence clock
  resets on a windfall. One honest voice line names the why.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4801-4808 x {leadfeast, belongfeast} x {control,
  armed} = 32 runs, IDENTICAL seeds both sides. Banned/used: 4201–4208,
  4301–4308, 4401–4408, 4501–4508, 4601–4608, 17011–17018.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.85x control. (The share is confounded with survival
  length per dinreserve-b2's metric review; absolute/100d is the honest unit.)
- **ENGAGEMENT** (vacuous-pass protection): windfall feasts >= 16 across the
  armed side (~1/run). If the mechanism never engages, the run is a KILL
  (invisible effect), not a GO.
- **Guardrails**: starvation deaths armed <= control+2 per-pair
  (collapse-aware); median survival >= control-10d; no new death mode; no
  laundering (feast draws via pantryDraw which skips spoiled — proof G6).
- **Det-gate**: wrapped+RACKSANSWER-unset byte-identical to base over 40d
  (2 seeds); SMOKE+proof GREEN before any sims.
- **Metric-review note**: the 300*roster threshold is a design call (a real
  windfall, not daily noise). If engagement misses, the threshold — not the
  concept — is the first suspect.

## Proof results (scripts/test-racksanswer-b.js — run BEFORE any sims)

PROOF GREEN, all checks passed:
- RED gate-off: no fire, no voice, no telemetry (delegation byte-identical;
  det-gate confirms over 40d trajectories).
- G1 windfall fires: doomed 9000 > threshold 3600 → feastDay set, voice said
  once, telemetry (1 feast, kcal, doomed-seen), cadence reset; the feast drew
  the doomed pile urgency-first (9000 → 4200).
- G2 below threshold / G3 already feasted / G4 unaffordable (vacuous on this
  roster — have 14000 > cost*1.5 7200; the gate logic is pinned by code read)
  / G5 no contribution / G6 away from haven → no fire.
- G6b spoiled excluded: bonus-inclusive boundary — the game's own rot sweep
  and pantryDraw both read spoilBonusDays, so doomedFresh does too
  ((sd+bonus)==day+1). A stack with sd=day-1 and bonus=6 is NOT spoiled and
  NOT doomed (5 days left) — the proof pins the exclusion.
- G7 determinism: identical runs agree.

Det-gate (scripts/detgate-racksanswer-b.js): 2 seeds x 40d, wrapped+unset ==
wrapped+unset AND wrapped+unset == base, byte-identical end-states. GREEN.

## Sweep results

### Pilot (32 runs: 8 seeds 4801-4808 x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 130,994k | 69,674k | **PASS** (ratio 0.536 ≤ 0.85) |
| windfall feasts (engagement) | 0 | 371 | **PASS** (≥ 16) |
| median survival | 152d | 156d | **PASS** (≥ -10d) |
| starveDays/100d | 19.4 | 14.4 | (info, -5.0) |
| laundered | 0 | 0 | **PASS** |
| national | 7/16 | 10/16 | (info) |
| table | 15/16 | 14/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 1/16 | 1/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-racksanswer-b/sweep-*.json
Windfall: 371 feasts, 788k kcal eaten, 2,026k doomed-seen. Rot dropped
1,381k (46%) — more than the 788k eaten, suggesting compounding (less
0.8x blind smoking, better pantry flow).

Per-pair starvation deaths (guardrail ≤ +2): all pass (4801: 0, 4802: 0,
4804: +1, 4806: +2, 4807: +2, 4808-belong: +1).

**Pilot verdict: GO** (all gates pass).

### Confirm (48 runs: 12 fresh seeds 4811-4822 x {leadfeast, belongfeast} x {control, armed})

| metric | control (24) | armed (24) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 101,447k | 67,147k | **PASS** (ratio 0.662 ≤ 0.85) |
| windfall feasts (engagement) | 0 | 363 | **PASS** (≥ 16) |
| median survival | 146d | 127d | **FAIL** (-19d < -10d) |
| starveDays/100d | 18.5 | 17.9 | (info, -0.6) |
| laundered | 0 | 0 | **PASS** |
| national | 15/24 | 12/24 | (info) |
| table | 21/24 | 22/24 | (info) |

Per-seed: evidence/2026-10-18/perseed-racksanswer-b/confirm-*.json

The primary REPLICATES (0.662x on fresh seeds, 34% rot reduction). But the
survival guardrail FAILS: median -19d.

Per-pair survival deltas (armed-control): large negatives on lead 4818
(-100d), belong 4821 (-59d), lead 4817 (-37d), lead 4822 (-39d); positives
on lead 4815 (+25d), belong 4819 (+49d), belong 4814 (+19d). The rest ties.

Attribution check: windfall counts on regressed seeds are LOW (4818: 5,
4822: 6, 4817: 13, 4821: 16) vs improved seed 4815: 23. The harm does NOT
correlate with mechanism frequency — but the guardrail is blunt (no
attribution required) and it binds.

**Confirm verdict: NO-GO** (survival guardrail miss). Per §14, a miss is
NO-GO, never re-scored. The arm is KILLED: layer deleted zero-trace;
evidence + instruments landed.

## Wall numbers (every run)

Pilot armed: national 10/16, table 14/16, wins 0/16, w4 1/16, w5 0/16,
median 156d, max 180d. Confirm armed: national 12/24, table 22/24, wins
0/24, w4 0/24, w5 0/24, median 127d, max 180d. The wall stands (zero wins,
wave 3 ceiling on 47/48 confirm runs). This arm does not attack the wall.

## Village assessment (plain words)

Forty-eight villages, twenty-four twinned (confirm). The armed twins hold
windfall feasts — 363 across the confirm, 788k kcal eaten that would have
rotted. Their pantries are leaner: rot drops by a third (67k vs 101k per
100d). But four villages collapse much earlier than their twins (4818:
80d vs 180d; 4821: 121d vs 180d) — not from starvation (the death causes
are combat and sickness, the windfall counts are low), but the villages
simply lose earlier. The mechanism is powerful and honest; the survival
cost is real but unattributed. The next arm should try a higher threshold
or a frequency cap.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Two transcript reads (scripts/sense-windfall-b.js, seed 4803 40d + seed
4805 60d):

d33: "🍖 The Foraged food won't keep till tomorrow — Katarina calls a feast
to eat it before it turns." Followed by the engine feast report (menu, who
ate, the laughter line, FEASTED buff).

d50: "🍖 The Tribute grain from Thornfield and Tribute grain from Emberhold
won't keep till tomorrow — Paisley calls a feast to eat it before it turns."

**PASS** — the windfall line reads as a person making a sensible call
(names the food, the actor, the reason). The tribute-grain beat is
particularly honest: the village feasts on tribute that's about to rot.
Repetition ("won't keep till tomorrow" 3x in 3 days during a glut) is
consistent, not robotic — it names the real situation each time.

**FINDING** (not chased): windfall feasts cluster during gluts (6 in 8 days
on seed 4803 d33-d40) — the mechanism working through a windfall, but the
FEASTED buff refreshes daily during clusters. A future arm might cap
frequency.

## Blanks filled / documented

- **FILLED (finding)**: the windfall feast is a POWERFUL rot lever —
  0.536x pilot, 0.662x confirm (34-46% absolute rot reduction), 734
  windfall feasts across 40 armed runs, 1.5M kcal eaten that would have
  rotted. The feast as the fresh sink works.
- **FILLED (finding)**: bonus-inclusive spoilDay is the honest rot boundary
  — the game's sweepSpoiled and pantryDraw both read spoilBonusDays, and
  the proof pins that (sd+bonus)==day+1 is the doomed set. A stack with
  sd=day-1 and bonus=6 is NOT spoiled and NOT doomed (5 days left).
- **DOCUMENTED (killed)**: the survival guardrail fails on confirm (-19d
  median) despite passing on pilot (+4d). The harm does not correlate with
  windfall frequency. The next arm should test a higher doomed threshold
  (e.g., 500*roster) or a frequency cap (e.g., max 2/week).
- **DOCUMENTED (instrument)**: backgrounded sweep processes died twice
  mid-run (confirm + lever panel); foreground runs with polling are the
  robust route. The §15 lever panel could not be built (3/16 cases before
  death); the base panel (16 cases) is at
  evidence/2026-10-18/panel-base/panel.json.gz.

## Metric review (§14)

- The primary (rot/100d ≤ 0.85x) PASSED on both pilot (0.536x) and confirm
  (0.662x). The metric is sound; the effect replicates.
- The survival guardrail (median ≥ control-10d) PASSED on pilot (+4d) but
  FAILED on confirm (-19d). Per §14 this is NO-GO, not re-scored. The
  guardrail did its job: it caught a survival cost that the primary (rot)
  cannot see.
- Metric lesson: for powerful levers with mixed signals, the guardrail
  should require ATTRIBUTION (does the harm correlate with mechanism
  frequency?) before killing. The current blunt guardrail killed a 34%
  rot reduction on an unattributed signal. Propose for the NEXT run:
  guardrail = median survival ≥ control-10d OR (harm unattributed AND
  primary ≤ 0.70x). This does not touch the current verdict.

## Convergence state

**killed** (NO-GO on the survival guardrail — confirm median -19d vs the
-10d bound; primary 0.662x and engagement 363 both pass). The food-economy
axis is not converged. The windfall-feast direction is conceptually PROVEN
for rot (0.54-0.66x across 40 runs) but needs a survival-safe variant.
Filed in the findings backlog as the named next arm.
