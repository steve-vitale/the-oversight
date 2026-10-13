# LEAD-road fix — scale-wall repair (2026-10-12)

## Pre-registration (before running)

- **Primary metric:** fraction of primary-Haven (LEAD) links reaching seasoned
  (link age ≥30 days AND trust ≥40) within the horizon.
- **GO threshold (pilot):** ≥50% of LEAD links season across 4 seeds.
  Pre-fix baseline: 0% for links #2+, ~2–9% for link #1 (probe-scale-wall
  Part A, 20,000-trial Monte Carlo of the exact coded process). ≥50% is an
  obvious, unmistakable move — not a statistical argument.
- **Horizon:** 150 days (scale question; death-aware — a dead/scattered
  village stops simulating via the harness endReason; no dead-village ticking).
- **Seeds:** 11, 22, 33, 44 (pilot). Expand to 12 on an obvious pilot GO.
- **Policies:** `leadcourt` (new: competent + LEAD-road courtship — proposes
  subordinates, tends with grain). `competent` stays pinned as the scale-free
  baseline (MEASUREMENT.md §2); reachability is measured against leadcourt,
  never against competent's silence.
- **Secondary (reported, not gated):** national staging day/shape, regional
  dawn day, tribute actually flowing (kcal/week into Haven's pantry).

## The fix (what changed and why)

**Binding problem:** the LEAD road's weekly trust process had negative
expected drift at every trust level below 80 (arrival lottery
`R() < trust/100`: +1 on arrival, −4 + full arrears on every miss), so links
spiraled down from birth — P(seasoning) = 0 for links #2+. Subordinate
pantries were frozen between player approaches, so tribute reliability
tracked arbitrary frozen wealth. And canon demanded "tending required" while
no tending verb existed for primary-Haven links.

**1. Tending verb — `Game.tendLink(linkId)` (hierarchy.js).** "Send grain":
1,500 kcal from Haven's pantry → +8 trust via `_trustGain` (mourning choke +
lastKeptDay stamping), mirroring the renegotiation gift's pricing exactly
(1,500 → +8). One tending per week per link (`tendedWeek`): trust is a
relationship, not a meter — you can't buy a season in an afternoon. Refuses
honestly during their mourning and on a bare pantry. Button in the link row
(app.js `data-link-tend`), wired like payTribute.

**2. Tribute attempted every week (hierarchy.js `linkTick`).** The arrival
lottery is gone. Trust now tracks what actually happened:
- full payment → **+1** (faithfulness deepens the bond),
- partial → **−1** + true shortfall as arrears (they tried — the shame is
  real but small),
- nothing → **−2** + full arrears, **said aloud** (their fields are empty,
  not their hearts).

Expected drift (Monte Carlo of the new process, 20,000 trials, speaker
deaths ~2%/wk — linked villages live the light tick, so deaths are rare):
- healthy (full tribute): +1/wk − mortality ≈ +0.8/wk → 30→40 in ~12 weeks.
  Faithfulness holds and slowly deepens; tending is the accelerator.
- tended (grain weekly, as the leadcourt policy does): +1 +8/wk → 30→40 in
  ~1–2 weeks. Clearly positive — the verb is the engine.
- half-paying: ≈ −0.2/wk → slow bleed, holds ≥25 for months. Needs tending
  or aid, not panic.
- starving: −2/wk → snap zone in ~5 weeks. Audible (the empty-fields line
  fires every week), rescuable via grain/aid — tending stamps lastKeptDay,
  holding off the snap.

**3. Linked villages live weekly (`Game._linkedVillageWeek`, game.js).**
Production − consumption + pantry cap for LINKED villages only, inside the
weekly tick, advancing the same `village.day` watermark `catchUpSim` uses —
never double-counts. Deliberately abstract: no tile depletion, no roster
deaths, no rumors. This tick answers "can they pay tribute?", not "who
died?" Mortality still resolves in the full catch-up sim on approach.
Design call: kept the 4,000 kcal/week tribute rate (it's the negotiated
due; changing it silently would be a different lever). With living
pantries, shortfalls now mean real hardship — said aloud, rescuable via
aid or grain.

**4. Measurement honesty (`scripts/policies/leadcourt.js`).** New policy:
competent + LEAD-road courtship (proposes up to 3 subordinates from day 25,
tends weekly when the pantry holds 20k+, answers beats). `competent`
unchanged and pinned. Reachability proofs run against leadcourt.

## Numbers

### Part A — trust-drift Monte Carlo (new process, 20,000 trials, deaths ~2%/wk)
| config | result |
|---|---|
| tended (grain weekly, start 30) | P(trust≥40 by wk 4) = 0.997 |
| healthy (full tribute, start 30) | P(trust≥40 by wk 14) = 0.755 |
| half-paying (start 30) | P(hold ≥25 at wk 12) = 0.769 |
| starving (start 30) | P(trust<20 by wk 8) = 1.000 (audible, not instant) |
| OLD lottery (healthy, start 30) | P(trust≥40 by wk 12) = 0.000 — the bug, demonstrated |

### Part B — pilot (leadcourt × 4 seeds × 150d, pre-registered GO ≥50% season)
| seed | formed | seasoned | maxTrust | national | dawn | polity | end |
|---|---|---|---|---|---|---|---|
| 11 | 3 | 3 | 93 | 0 | 46 | 57 | village-lost |
| 22 | 0 | 0 | 0 | 0 | — | — | survived |
| 33 | 0 | 0 | 0 | 0 | — | — | village-lost |
| 44 | 3 | 1 | 60 | 0 | 46 | — | village-lost |
**Seasoned fraction: 4/6 = 0.67 ≥ 0.50 → PILOT GO.** (Pre-fix on identical
seeds: 0/11 = 0.00 — RED-verified via git stash.)

### Part B — confirm (leadcourt × 12 seeds × 150d)
| seed | formed | seasoned | maxTrust | national | dawn | polity | end |
|---|---|---|---|---|---|---|---|
| 11 | 3 | 3 | 93 | 0 | 46 | 57 | village-lost |
| 22 | 0 | 0 | 0 | 0 | — | — | survived |
| 33 | 0 | 0 | 0 | 0 | — | — | village-lost |
| 44 | 3 | 1 | 60 | 0 | 46 | — | village-lost |
| 55 | 0 | 0 | 0 | 0 | — | — | village-lost |
| 66 | 3 | 3 | 69 | 0 | 46 | 57 | village-lost |
| 77 | 3 | 3 | 100 | 1 | 46 | 57 | village-lost |
| 88 | 3 | 3 | 100 | 1 | 46 | 57 | survived |
| 99 | 3 | 3 | 100 | 1 | 46 | 57 | village-lost |
| 101 | 3 | 3 | 89 | 0 | 46 | 57 | village-lost |
| 202 | 3 | 3 | 89 | 0 | 46 | 57 | village-lost |
| 303 | 3 | 3 | 100 | 1 | 46 | 57 | survived |
**Seasoned fraction: 25/27 = 0.93. National staged on 4/12 seeds** — the
first LEAD-road nationals ever observed in sims. Dawn day 46 and polity
day 57 are metronomic; the rung gate (networkLiveDay+30 = day 76) plus
village survival decides the beat. Seeds with polity-but-no-beat lost the
village before day 76 — the base food economy (sibling's lever), not scale
costs: the LEAD road is food-positive for Haven (+7,500 kcal/wk net at
3 links: 12,000 tribute in, 4,500 tending out).
Seeds 22/33/55 formed 0 links: courtship gating (opinion) or early village
death — the policy proposes, the world doesn't always answer.

### Regressions
- scripts/test-scale-lead-fix-20261012.js: Part A 5/5, Part B pilot+confirm green; RED-verified (0/11 pre-fix).
- Ontology: 86/86 green (docs/ONTOLOGY.md regenerated).
- test-scale-onramp-20261010: ALL GREEN.
- test-bal-scale-ladder-20261010: 54/54 green.
- Pre-existing failures, unchanged by this fix (verified identical on pre-fix
  code via git stash): test-hierarchy.js 2 (partial-week grace vs test
  expectation — test bug, not code), test-hierarchy-break-20261010 (crash at
  formLink), test-scale-ladder-20261010 (24 failures). Flagged for the loops.

## Lines read aloud (sense check)

Tending, full: "🌾 Haven sends 1,500 kcal of grain to [their] fire — not
tribute, the other way around. Someone's grandmother over there will
remember who fed her. (Trust +8.)"

Tending, partial pantry: "🌾 Haven sends [X] of 1,500 kcal to [them] — all
the pantry holds. They count the gap, and they count the trying. (Trust +N.)"

Tribute thin: "🌾 [Their] tribute comes up thin — [X] of 4,000 kcal. They
sent everything the wagons could carry, and it wasn't enough. The shortfall
rides as arrears (+[Y] kcal). (Trust -1.)"

Tribute nothing: "🌾 Nothing comes from [them] this week — their fields are
as empty as the wagons look. Hunger isn't defiance, but the ledger doesn't
know the difference. (Arrears +4,000 kcal, trust -2.)"

These read as a relationship under strain — effort recognized, hardship
named, the ledger honest about what it can't tell apart.

## Convergence state

**converging** — the LEAD road is unblocked (seasoning 0.93, national 4/12),
but two threads remain for the loops: (1) villages dying before the day-76
rung gate (base food economy — sibling's lever); (2) seeds where courtship
never lands a proposal (opinion gating). The fix itself needs no further
tuning — the numbers are at ceiling for the mechanism.
