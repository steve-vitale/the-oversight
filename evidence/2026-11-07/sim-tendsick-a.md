# sim-tendsick-a — TREAT THE FEVER IN THE WILD (PILOT NO-GO, killed)

Run: oversight-flesh-out-loop, run fleshout-20261107T1928Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-tendsick-a, branch sim-tendsick-a.
Substrate: branch base 018295600 (coordinator round-1820 evidence commit:
prodstore NO-GO killed at pilot, prodcollapse DIAG-GO HEALTH). Policy:
competent ONLY in Phase A; TENDSICK layer wrapping competent in Phase B
(scripts/policies/tendsick-a.js, NEW, does NOT edit competent.js). Env:
PLENTYDEPRI=1, DEPOSITGATE=1, TENDSICK_A=1 on the armed leg. Horizon:
150d death-aware. Seeds: pilot 96301–96308 (8 seeds). Prereg:
evidence/2026-11-07/sim-tendsick-a-prereg.md (binding, incl. the Phase-B
amendment finalized BEFORE any pilot sweep; confirm band 96309–96324
fresh, NOT run — confirm runs only on a pilot GO).

## Verdict: PILOT NO-GO — killed, no confirm

The layer works as a fever treatment and fails as a village saver. The
GO bars are binding and two miss:

- PRIMARY (sick-days per village-day): baseline 0.065 → armed 0.053,
  ratio 0.815 ≤ 0.90 → PASS. Mean episode duration 3.2d → 2.1d.
  Episodes 157 → 205, sickness deaths 14 → 10, cures 0 → 27.
- ENGAGEMENT: acts 275 (≥10) on 93.5% of sick-at-Haven days (≥25%)
  → PASS. The scholar really does tend the sick: 248 tended, 27
  cured, 98 no-effect.
- STARVATION: baseline 1 → armed 5 (GO ≤ 1) → FAIL. Per-seed:
  s96302: 1, s96303: 1, s96308: 3.
- SURVIVAL: median 128d → 114d (GO ≥ 102.4d) → PASS.
- PER-SEED: regressions >30d vs own baseline: 3 (GO ≤ 1) → FAIL.
  s96302 −83d (150→67), s96306 −42d (134→92), s96308 −32d (145→113).

GO CHECK: primary PASS | starvation FAIL | survival PASS | per-seed
FAIL | engagement PASS. A miss is NO-GO, never re-scored. The layer
is killed at pilot. The policy file stays in the repo as dormant
measurement tooling (same precedent as the feaststopspend landing:
policy-side killed arms land their tooling; the policy is loaded only
by sweeps, never by the game). No src/js was touched at any point.

Adoption note: the worker ran the pilot sweep to completion (armed
corpus written 21:29Z) but was cancelled before running the analyzer
or writing this file. The adopting session (main session, INSPECT HELD
WORK) found and fixed one instrument bug the cancelled worker never
hit — the analyzer's per-seed filename regex expected policy
`tendsick` while the sweep registers the policy as `tendsick-a`, so
the analyzer exited 2 ("no per-seed files"). Fix: one-line regex
change in scripts/analyze-tendsick-a.js; proof test re-run 15/15
green after the fix; analyzer then ran clean (exit 0). The numbers
below are the analyzer's own output, reproduced verbatim.

## Baseline (Phase A — measured, from the amendment)

Pooled, 8 seeds 96301–96308, competent, 150d death-aware (991
village-days, 7,731 villager-days). G2 PASS, G3 letter-miss recorded
in the amendment (death-day flow rows; revised PASS).

- B1 FEVER BURDEN: sick-days/village-day = 0.065 (499 / 7,731); mean
  episode duration = 3.2d; episodes = 157 (closed 157, open 0);
  villagers affected = 81; sickness deaths = 14. Per-seed
  sick-days/village-day: 0.068 / 0.095 / 0.052 / 0.056 / 0.067 /
  0.049 / 0.032 / 0.093.
- B2 OPPORTUNITY: sick-at-Haven days = 361; treat/tend acts under
  competent = 0 (cures 0) — the competent scholar never treats a
  villager without a promise. Scholar healing-ability holdings (days
  held / at L2+): herbal_remedy 456/167, field_medicine 501/78,
  triage 501/78.
- B3 PRODUCTION COST: fever days run sicker and (mostly) hungrier
  than non-fever days (healthFrac fever 0.70–0.92 vs non-fever
  0.84–0.93; produced/need fever 0.82–1.11 vs non-fever 0.94–1.07).
  Pooled produced/need = 0.992.
- B4 GUARDRAILS: villager starvation deaths = 1 (s96308 only);
  median survival = 128d (per-seed 127 / 150 / 124 / 61 / 129 / 134
  / 121 / 145); empty-pantry village-days = 114; wave reach 5 on
  3/8 seeds (96303, 96306, 96307); death causes: the wild 85,
  monster 18, sickness 14, a wound that wouldn't close 12, ambush 4,
  dehydration 4, arena 4, starvation 2 (1 villager + 1 player),
  combat 2, a stranger 1, contest 1, experiment 1, the night 1, the
  landlord 1; national 0/8, table 0, wins 0.
- B5 NPC CARE: villagerCareTick tends = 104 (0.7 per episode).
- Forage baseline: 'Foraged food' stocked = 407,478 kcal;
  duty-stocked all names = 1,054,133 kcal; 'Fish catch' = 381,301
  kcal. (Recomputed from the corpus by the adopting session; matches
  the amendment to the kcal.)

## Pilot (Phase B — armed, TENDSICK_A=1)

Analyzer: `node scripts/analyze-tendsick-a.js
evidence/2026-11-07/tendsick-a-corpus-armed
evidence/2026-11-07/tendsick-a-corpus` (exit 0).

- B1 FEVER BURDEN: sick-days = 400, village-days = 7,607,
  sick-days/village-day = 0.053; mean episode duration = 2.1d;
  episodes = 205 (closed 202, open 3); villagers affected = 83;
  sickness deaths = 10. Per-seed sick-days/village-day: s96301
  0.037, s96302 0.122, s96303 0.049, s96304 0.024, s96305 0.033,
  s96306 0.054, s96307 0.036, s96308 0.097. Per-seed mean duration:
  2.1 / 3.0 / 1.9 / 1.0 / 1.5 / 2.3 / 1.5 / 2.5d. Episodes per seed:
  25 / 31 / 25 / 21 / 24 / 18 / 23 / 38.
- B2 OPPORTUNITY: sick-at-Haven days = 294; treat/tend acts = 275
  (cures 27); treatEvents by kind:outcome = {tend:tended: 248,
  tend:no-effect: 98, treat:cured: 27}. Scholar healing-ability
  holdings (days held / at L2+): herbal_remedy 306/115,
  field_medicine 393/114, triage 393/114.
- B3 PRODUCTION COST (per-seed fever vs non-fever produced/need +
  mean healthFrac): s96301 1.097/0.923 vs 1.115/0.939; s96302
  0.895/0.776 vs 0.882/0.784; s96303 1.062/0.871 vs 1.049/0.870;
  s96304 1.065/0.912 vs 1.088/0.907; s96305 1.045/0.865 vs
  1.089/0.876; s96306 0.873/0.668 vs 0.950/0.760; s96307 1.032/0.860
  vs 1.072/0.911; s96308 0.871/0.704 vs 0.875/0.769.
- B4 GUARDRAILS: starvation deaths (villager) = 5; median survival
  = 114d, max 150d; empty-pantry days = 58; death causes: lockjaw 1,
  the night 2, the arena 6, the wild 54, monster 19, a wound that
  wouldn't close 9, sickness 12, contest 2, the influencer 1,
  starvation 5, dehydration 2, ambush 3, a stranger 3, combat 3,
  loud-eyes 1. Per-seed survival: 150 / 67 / 113 / 116 / 125 / 92 /
  115 / 113d. Per-seed starvation: 0 / 1 / 1 / 0 / 0 / 0 / 0 / 3.
- WALL: national 0/8, table 0, wins 0, waveReach {1:8, 2:8, 3:8,
  4:7, 5:3}.
- B5 NPC CARE: villagerCareTick tends = 111 (0.5 per episode).

### Forage cost (the "instead of ranging" read)

Pooled stocked kcal from flowSeries (recomputed by the adopting
session; baseline reproduces the amendment exactly):

| stocked | baseline | armed | change |
|---|---|---|---|
| Foraged food | 407,478 | 296,259 | −27% |
| Fish catch | 381,301 | 207,503 | −46% |
| Duty-stocked, all names | 1,054,133 | 679,948 | −35% |

The day has no slack on this band after all: tending 275 times cost
the village a third of its duty-stocked food. The fever got better
and the pantry got worse — and on the seeds where the pantry went
empty, people starved (s96308: 3 starvation deaths). Caveat: the
armed runs are not the same trajectories (a policy change re-rolls
the days), so the forage gap is a pooled comparison, not a paired
one — but the direction, the size, and the starvation pattern line
up, and the empty-pantry days fell only because the villages died
earlier (58 vs 114 over fewer village-days).

## Metric review (post-run)

- G3 CORPUS: FAIL (letter and revised) on the armed corpus —
  s96305: daySeries=124 daysAlive=125 (missing day 125),
  flowsCover=false; s96307: daySeries=114 daysAlive=115 (missing day
  115), flowsCover=false. Verified by the adopting session against
  the corpus files:
  - s96305: the missing day 125 IS the death day (deathRow: d125,
    the wild). Same pattern the baseline amendment's revised rule
    already excuses; the analyzer's revised check passes s96305.
  - s96307: the missing day 115 is a village-lost end (endReason
    'village-lost', finalPop 3, last death d99). No death is recorded
    on day 115, so the analyzer's revised rule (excuse only when a
    death is recorded that day) does not cover it. The gap is one day
    with no snapshot/flow at the very end of a lost village; it
    touches none of the judged numbers (all GO inputs are per-seed
    totals from complete rows).
  - Proposed revision for the NEXT run: excuse the final day's
    missing snapshot/flow when the run ends mid-day (endReason
    village-lost / game over), not only when a death is recorded
    that day. The corpus is valid for this verdict.
- The analyzer prints "BASELINE VERDICT: INCOMPLETE — G3 failed"
  after the DIR corpus section. That is the label for the corpus
  just printed (the armed corpus in comparison mode), not a second
  verdict — the binding verdict is PILOT VERDICT: NO-GO below it.
- Episodes rose 157 → 205 while mean duration fell 3.2d → 2.1d.
  That is not tending creating episodes: armed trajectories diverge
  from baseline (different days, different onsets), so episode
  counts are not paired. The mechanism read is duration + sickness
  deaths (both down) + cures (0 → 27).
- No metric proved wrong except the G3 final-day rule above. The
  starvation and per-seed guards did exactly what they are for:
  they caught a lever that helps the fever and hurts the village.

## Sense (SENSE-TESTING LAW)

The analyzer's SENSE section was not produced in comparison mode
(the worker was cancelled before the sense pass). What the corpus
does show: the tend drive fires constantly and visibly — 275 acts
across 294 sick-at-Haven days, 27 cures — and the cure ladder's
triage order (lowest days-to-death first) is exercised in the proof
test (L15). No transcript read was completed for this arm; the
sense pass is owed if the layer is ever re-armed in another shape.

## Village assessment in plain words

The scholar stayed home and nursed the sick, and the sick got
better: fevers lasted two days instead of three, 27 people were
cured outright, and sickness deaths fell from 14 to 10. But the
scholar wasn't out foraging and fishing while nursing, and the
village stocked a third less food. On three seeds the pantry ran dry
and people starved who hadn't starved before — five starvation
deaths against one in the villages left alone. Three villages died
more than a month early. The medicine works. The price is food, and
on this band the village can't afford it. The wall stands:
national 0/8, table 0, wins 0.

## Blanks filled or documented

- FILLED: tending the sick is a real, working lever with a real,
  measured price. Fever burden −18%, duration −34%, 27 cures —
  and forage −35%, starvation 1→5, three seeds regressing >30d.
  The "instead of ranging" mechanism is not free time; the day has
  no slack to give on this band.
- DOCUMENTED (named next arms, not built here): (1) a cheaper
  tending shape — tend only on days the trip wouldn't range anyway
  (bad weather, no able foragers), or cap acts below 3/day, so the
  forage cost shrinks; (2) the feveranat diagnosis in this same
  round (DIAG-GO) names healer presence as the strongest survival
  signal — a village-side care lever (more medics, not more scholar
  time) may move the burden without the forage cost; (3) the
  sickfloor lever in this same round (NO-GO at pilot) shows the same
  pattern from the other side: easing the health→production link
  helps production and still loses villages early.

## Findings for the backlog (coordinator appends)

- Tending trades fever for food on a tight band. Any re-arm must
  carry a forage-cost bar alongside the fever bars, or it will
  repeat this kill.
- The G3 final-day rule needs the village-lost revision (see Metric
  review) before the next arm judges a corpus with a mid-day end.
