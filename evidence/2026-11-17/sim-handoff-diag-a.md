# sim-handoff-diag-a — EVIDENCE (DIAG NO-GO on completeness; measurement delivered)

**Arm:** sim-handoff-diag-a · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** DIAG (classification only, finding #2498 follow-up). No game change lands from this arm.
**Branch:** `sim-handoff-diag-a` · **Worktree:** `~/workspace/worktrees/sim-handoff-diag-a`
**Base at arm start:** `3d0f5770c` · **Prereg:** `evidence/2026-11-17/sim-handoff-diag-a-prereg.md`
(+ Correction 1: corpus-first, fresh run abandoned; Correction 2: two analyzer bugs + stale-row rule).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Verdict: DIAG NO-GO** — classification delivered (28/79 handoff-available,
share 35%), but unknown 4 exceeds the frozen bar of ≤ 2, so the arm
fails its own completeness bar. The measurement stands; the verdict
judges the classification, not the game. Proof test 32/32.

## The question (finding #2498, design call)

sim-selblock-a classified 113 blocked win-plan selections: 79
`inviter-range-0` (70%) — the plan holder is a homebody (travel range
0) who bids at dawn and can never walk out. The fix is a Steve design
call: STOP range-0 holders from bidding/holding, OR HAND their plan to
a walker. This arm measures the hand-off option so the call is made on
numbers, not a guess: for each of the 79 range-0-holder blocked
selections on the frozen profilegate-b ON corpus, could a walker in
the SAME village have held the plan instead?

## Before / after (identical seeds, quoted from the frozen profilegate-b analysis)

| Metric | OFF (control) | ON (PROFILEGATE=1) |
| --- | --- | --- |
| Scored dawns / empty | 87 / 81 (0.931) | 99 / 3 (0.0303) |
| Mean eligible / dawn | 0.08 | 2.98 |
| Launched instances (any-commit) | 3 | 7 |
| **Selected-blocked instances** | **0** | **12** |
| Wave-4+ launch events (secondary) | 8 | 38 |
| Median survival (gameDays) | 147.5 | 116.5 |
| National standing / rank / table / wins | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |

Not re-measured here: this is a DIAG over the frozen corpus (see
"Why no fresh run" below). The before/after stands as quoted.

## Why no fresh run (Correction 1, in brief)

The frozen prereg first ordered a fresh 8-seed band with an extended
recorder, on the claim that the corpus lacked sick/health for
candidate walkers. That claim was wrong on the task's own criteria
(range/location/plan-hold — all carried by the corpus; sickness is
not among the task's criteria). And the pilot proved the fresh run
cannot work anyway: on this tip the frozen instances do not occur.
Seed 103414, 150d, `VETREENGAGE=1 PROFILEGATE=1`, lever re-applied
exactly as profilegate-b: **0 range-0 departs** (frozen: 57 on that
seed); the village dies day 103 (frozen: survived 150d, standing
199). The OFF leg (no lever at all) diverges the same way — first
divergence day 38, v4seeds 35 vs 16 frozen — so the drift is base
drift in the fight/expedition engine since profilegate-b's frozen
base, not a lever or recorder error: trajectories agree identically
through day 55 on the ON leg (including a homebody picked as
companion on day 54), then two agency-expedition kills present in
the frozen corpus are absent on this tip and the plans seed to
different villagers. The lever was reverted, the pilot scratch
corpora deleted, the handoff driver deleted uncommitted. The
classification below is therefore corpus-first, on the frozen 79 —
the task's instance set.

## Classification — the answer in one paragraph

On 28 of the 79 range-0-holder blocked selections (35%), a walker
was standing in the same village who could have held the plan
instead. The share is an upper bound with respect to sickness (the
corpus does not record sickness for unpicked villagers; sickness
blocked only 4/113 selections in selblock-a, so the bound is tight).
The walkers are almost always the person already picked: in 18 of
the 28, the named walker IS the picked companion — the dawn bid had
already chosen the right person to walk, and only the holder's own
range-0 stopped the party. The named walkers are all foragers (no
wanderer or explorer is ever named), and **none of the 28 is a
wave-4 veteran** — 18 of the 28 named walkers have a wave-3 kill,
but zero have killed a wave-4 beast. On the other 47 selections,
walkers exist but none could take the plan: the top proven reasons
are holding another plan (33 walker-instances) and being away from
Haven (28), with 1 on expedition. On 4 selections the village state
cannot be settled at all (no pool row on or before the day — the
corpus gap that fails this arm's completeness bar). Hand-off is
viable a good third of the time, and it is usually a matter of
letting the already-picked forager hold the plan — but it never
hands a plan to a proven wave-4 killer, and on nearly half the
blocked mornings the walkers are either holding their own plans or
away from Haven.

## Per-instance summary

| # | Seed | Holder [profile] | Target | Selections | Available | Unavailable | Unknown | Named walkers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 103413 | naran_tumen [homebody] | herald | 1 | 0 | 1 | 0 | — |
| 2 | 103413 | omar_farouk [homebody] | influencer | 8 | 7 | 1 | 0 | david_kim 3, sanne_bakker 4 |
| 3 | 103414 | giulia_bianchi [homebody] | eater | 28 | 13 | 14 | 1 | meera_reddy 9, app_mgpspjp5330 4 |
| 4 | 103414 | visjoin_73 [homebody] | reunion | 24 | 6 | 18 | 0 | meera_reddy 6 |
| 5 | 103414 | visjoin_85 [homebody] | eulogy | 5 | 2 | 3 | 0 | meera_reddy 2 |
| 6 | 103418 | visjoin_59 [homebody] | reunion | 3 | 0 | 2 | 1 | — |
| 7 | 103418 | yuki_mori [homebody] | reunion | 10 | 0 | 8 | 2 | — |

Named walkers total 33 available-walker listings across the 28
available selections (most selections have exactly one). All named
walkers are foragers; 18/28 have a wave-3 kill, 0/28 a wave-4 kill.
Named-walker trust runs high (12 at trust 94 — Meera Reddy; the rest
30–93; one unrecorded, the bid-proof-only case). Meera Reddy alone
is the named walker in 17 of the 28 available selections, across
three holders in seed 103414 — one forager carries the hand-off
option for most of a village's blocked plans.

## Per-selection classification table (all 79)

Classification rule (frozen, prereg Correction 1 + Correction 2):
pool row = nearest `companionPool` row for the holder on or before
the day (Gap = row age in days; `none` = no row on/before the day).
A walker is handoff-available iff profile forager/wanderer/explorer
(maxDist > 0), alive, at Haven proven by a same-day row or — for the
picked companion only — by the bid itself, not holding another plan
(day-D census or own party_launch bid), and not away/engaged/on
expedition where day-D state is proven. `*` = named walker is the
picked companion. V3/V4 = wave-3 / wave-4 killer. Why counts are
per-walker first-failing checks inside unavailable selections.

| Seed | Day | Holder | Target | Companion | Gap | Bucket | Named walker | Why |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 103413 | 122 | naran_tumen | herald | victor_lopez | 1d | walker-exists-but-unavailable | — | holding-a-plan 3, state-unproven-stale-1d 5 |
| 103413 | 141 | omar_farouk | influencer | devon_okafor | 0d | handoff-available | david_kim [forager V3] | — |
| 103413 | 142 | omar_farouk | influencer | david_kim | 0d | handoff-available | * david_kim [forager V3] | — |
| 103413 | 143 | omar_farouk | influencer | david_kim | 0d | handoff-available | * david_kim [forager V3] | — |
| 103413 | 144 | omar_farouk | influencer | sanne_bakker | 1d | handoff-available | * sanne_bakker [forager] | — |
| 103413 | 145 | omar_farouk | influencer | gen_4hoo6rr | 2d | walker-exists-but-unavailable | — | holding-a-plan 4, state-unproven-stale-2d 4 |
| 103413 | 146 | omar_farouk | influencer | sanne_bakker | 3d | handoff-available | * sanne_bakker [forager] | — |
| 103413 | 148 | omar_farouk | influencer | ines_duarte | 0d | handoff-available | sanne_bakker [forager] | — |
| 103413 | 150 | omar_farouk | influencer | david_kim | 0d | handoff-available | sanne_bakker [forager] | — |
| 103414 | 65 | giulia_bianchi | eater | app_mgpspjp5330 | none | handoff-available | * app_mgpspjp5330 [forager] | — |
| 103414 | 68 | giulia_bianchi | eater | luis_fernandez | none | unknown | — | no pool row; picked not provable |
| 103414 | 70 | giulia_bianchi | eater | gen_qj0v0ty | 0d | handoff-available | meera_reddy [forager] | — |
| 103414 | 71 | giulia_bianchi | eater | luis_fernandez | 1d | walker-exists-but-unavailable | — | state-unproven-stale-1d 3 |
| 103414 | 73 | giulia_bianchi | eater | meera_reddy | 0d | handoff-available | * meera_reddy [forager] | — |
| 103414 | 74 | giulia_bianchi | eater | app_mgpspjp5330 | 0d | handoff-available | * app_mgpspjp5330 [forager] | — |
| 103414 | 75 | giulia_bianchi | eater | app_mgpspjp5330 | 0d | handoff-available | * app_mgpspjp5330 [forager] | — |
| 103414 | 76 | giulia_bianchi | eater | app_mgpspjp5330 | 1d | handoff-available | * app_mgpspjp5330 [forager] | — |
| 103414 | 83 | giulia_bianchi | eater | nathan_lee | 5d | walker-exists-but-unavailable | — | state-unproven-stale-5d 3 |
| 103414 | 84 | giulia_bianchi | eater | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 2 |
| 103414 | 86 | giulia_bianchi | eater | nathan_lee | 2d | walker-exists-but-unavailable | — | state-unproven-stale-2d 3 |
| 103414 | 88 | giulia_bianchi | eater | nathan_lee | 1d | walker-exists-but-unavailable | — | holding-a-plan 1, state-unproven-stale-1d 1 |
| 103414 | 89 | giulia_bianchi | eater | visjoin_74 | 2d | walker-exists-but-unavailable | — | holding-a-plan 1, state-unproven-stale-2d 1 |
| 103414 | 90 | giulia_bianchi | eater | nathan_lee | 3d | walker-exists-but-unavailable | — | state-unproven-stale-3d 2 |
| 103414 | 91 | giulia_bianchi | eater | nathan_lee | 4d | walker-exists-but-unavailable | — | state-unproven-stale-4d 2 |
| 103414 | 92 | giulia_bianchi | eater | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 1 |
| 103414 | 93 | giulia_bianchi | eater | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 94 | giulia_bianchi | eater | jesse_cortez | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 1 |
| 103414 | 95 | giulia_bianchi | eater | meera_reddy | 1d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 99 | giulia_bianchi | eater | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 100 | giulia_bianchi | eater | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 101 | giulia_bianchi | eater | jesse_cortez | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 102 | giulia_bianchi | eater | nathan_lee | 0d | walker-exists-but-unavailable | — | away 2 |
| 103414 | 103 | giulia_bianchi | eater | jesse_cortez | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 1 |
| 103414 | 106 | giulia_bianchi | eater | meera_reddy | 1d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 107 | giulia_bianchi | eater | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 108 | giulia_bianchi | eater | jesse_cortez | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 110 | giulia_bianchi | eater | jesse_cortez | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 100 | visjoin_73 | reunion | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 101 | visjoin_73 | reunion | giulia_bianchi | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 102 | visjoin_73 | reunion | giulia_bianchi | 0d | walker-exists-but-unavailable | — | away 2 |
| 103414 | 103 | visjoin_73 | reunion | giulia_bianchi | 1d | walker-exists-but-unavailable | — | holding-a-plan 1, state-unproven-stale-1d 1 |
| 103414 | 104 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 105 | visjoin_73 | reunion | giulia_bianchi | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 106 | visjoin_73 | reunion | giulia_bianchi | 1d | walker-exists-but-unavailable | — | state-unproven-stale-1d 1 |
| 103414 | 107 | visjoin_73 | reunion | giulia_bianchi | 2d | walker-exists-but-unavailable | — | state-unproven-stale-2d 1 |
| 103414 | 108 | visjoin_73 | reunion | giulia_bianchi | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 109 | visjoin_73 | reunion | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 110 | visjoin_73 | reunion | jesse_cortez | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 117 | visjoin_73 | reunion | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103414 | 118 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 119 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 120 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 122 | visjoin_73 | reunion | jesse_cortez | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 123 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 125 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 126 | visjoin_73 | reunion | nathan_lee | 1d | walker-exists-but-unavailable | — | state-unproven-stale-1d 1 |
| 103414 | 127 | visjoin_73 | reunion | nathan_lee | 2d | walker-exists-but-unavailable | — | state-unproven-stale-2d 1 |
| 103414 | 128 | visjoin_73 | reunion | jesse_cortez | 3d | walker-exists-but-unavailable | — | state-unproven-stale-3d 1 |
| 103414 | 129 | visjoin_73 | reunion | jesse_cortez | 4d | walker-exists-but-unavailable | — | state-unproven-stale-4d 1 |
| 103414 | 130 | visjoin_73 | reunion | nathan_lee | 5d | walker-exists-but-unavailable | — | state-unproven-stale-5d 1 |
| 103414 | 131 | visjoin_73 | reunion | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 105 | visjoin_85 | eulogy | giulia_bianchi | 0d | handoff-available | meera_reddy [forager V3] | — |
| 103414 | 106 | visjoin_85 | eulogy | nathan_lee | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 107 | visjoin_85 | eulogy | giulia_bianchi | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 108 | visjoin_85 | eulogy | giulia_bianchi | 0d | walker-exists-but-unavailable | — | away 1 |
| 103414 | 109 | visjoin_85 | eulogy | meera_reddy | 0d | handoff-available | * meera_reddy [forager V3] | — |
| 103418 | 71 | yuki_mori | reunion | thabo_maseko | none | unknown | — | no pool row; picked not provable |
| 103418 | 72 | yuki_mori | reunion | gen_9vcqa7j | none | unknown | — | no pool row; picked not provable |
| 103418 | 73 | yuki_mori | reunion | gen_9vcqa7j | 0d | walker-exists-but-unavailable | — | holding-a-plan 3 |
| 103418 | 75 | yuki_mori | reunion | visjoin_59 | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 2 |
| 103418 | 76 | yuki_mori | reunion | thabo_maseko | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 2 |
| 103418 | 77 | yuki_mori | reunion | naran_tumen | 1d | walker-exists-but-unavailable | — | holding-a-plan 2, state-unproven-stale-1d 1 |
| 103418 | 79 | yuki_mori | reunion | zoltan_nagy | 3d | walker-exists-but-unavailable | — | holding-a-plan 3 |
| 103418 | 80 | yuki_mori | reunion | thabo_maseko | 0d | walker-exists-but-unavailable | — | away 2, holding-a-plan 1 |
| 103418 | 82 | yuki_mori | reunion | naran_tumen | 0d | walker-exists-but-unavailable | — | away 1 |
| 103418 | 83 | yuki_mori | reunion | naran_tumen | 0d | walker-exists-but-unavailable | — | onExped 1 |
| 103418 | 77 | visjoin_59 | reunion | naran_tumen | none | unknown | — | no pool row; picked not provable |
| 103418 | 78 | visjoin_59 | reunion | visjoin_58 | 0d | walker-exists-but-unavailable | — | away 1, holding-a-plan 2 |
| 103418 | 79 | visjoin_59 | reunion | gen_9vcqa7j | 0d | walker-exists-but-unavailable | — | holding-a-plan 3 |

## What each bucket means, in plain words

- **handoff-available (28).** On that morning, a walker was in the
  village, alive, at Haven, and free — holding no plan of their own,
  not away, not engaged, not out on an expedition. The plan could
  have changed hands that morning and the party could have walked.
  In 18 of the 28, the walker is the companion the dawn bid already
  picked: the bid chose right and the holder could not walk. The
  other 10 name a different forager standing at Haven (Sanne Bakker,
  David Kim, Meera Reddy on Omar's days; Meera on Giulia's). All 28
  are foragers — the villages' walkers are foragers, not rangers.
- **walker-exists-but-unavailable (47).** Walkers exist in the
  village and none could take the plan. Per-walker first-failing
  checks across these 47: holding-a-plan 33, away 28,
  state-unproven-stale 33 (row 1–5 days old), onExped 1. The
  proven-vs-stale split per selection: 29 selections are fully
  proven (every walker fails a day-D check — holding, away, or on
  expedition), 6 mixed, 12 rest entirely on stale-row state (the
  walkers exist, their day-D location is unproven). The single most
  common proven block is **holding another plan**: on 17 of the 47
  selections at least one walker holds a wave-4 plan of their own
  that day, and on 3 selections every walker does. The village is
  not short of walkers — it is short of walkers with empty hands.
  The second block is being away: on 28 walker-instances the walker
  is simply not at Haven that morning. Yuki Mori's village (seed
  103418) is the extreme: 8 unavailable selections, and on 3 of
  them every walker in the village holds a plan.
- **no-walker-in-village (0).** Never fires on this band. Every
  blocked selection's village has at least one living walker. The
  hand-off option never fails for lack of walkers existing.
- **unknown (4).** Giulia day 68, Yuki days 71–72, visjoin_59 day
  77. No pool row exists on or before the day, so the village's
  walker population is unobservable from the corpus, and the picked
  companion cannot settle it either (Luis Fernandez and Naran Tumen
  are homebodies; Thabo Maseko and gen_9vcqa7j are walkers but hold
  plans that day). These four are a corpus gap, not a village fact —
  they are what fails this arm's completeness bar.

## The design-call reading (measurement, not a ruling)

The ruling is Steve's. The numbers say: hand-off would unblock
about a third of the range-0 mornings (28/79 = 35%; 44% on the 50
selections with same-day evidence; 47% if stale-row locations are
taken at face value), and it would almost always hand the plan to
the forager the bid already picked (18/28). It would never hand a
plan to a wave-4 veteran — the walkers available are foragers with
wave-3 kills at best — so hand-off buys departures, not proven
wave-4 killers. It would not help on the other 47 mornings, where
the walkers are holding their own plans or away from Haven; for
those, only stop-bidding (or a hand-off that also waits for a free
walker) helps. Two further facts for the call: (a) one forager,
Meera Reddy, is the named walker in 17/28 available selections —
hand-off in practice means "Meera takes the plan" for seed 103414,
which concentrates the fix on a single villager's shoulders; (b)
the holding block (33 walker-instances) means a hand-off rule that
ignores who already holds a plan would hand plans to people who
already have one — the rule needs the holding check, or it just
moves the jam from the holder to the walker.

## Instrument verification (what was checked, and what could have fooled it)

- **Enumeration reproduces selblock-a exactly.** The analyzer
  reuses the frozen `classifySeed` (any-commit) and finds the same
  79 inviter-range-0 selections with the same per-instance counts
  (1 + 8 + 28 + 24 + 5 + 10 + 3). The instance set is the frozen
  79, not a re-count.
- **Pool-row coverage is measured, not assumed.** Same-day row
  50/79; nearest-before 1d: 11, 2d: 5, 3d: 4, 4d: 2, 5d: 2; no row
  on/before: 5. Pool rows are a superset of the daily roster (8/99
  rows carry one extra member — a villager the pool saw at dawn who
  left the roster by end of day). Profiles never change across pool
  rows (332/332 same), so profile from any row is safe; at-Haven is
  NOT stable day-over-day (P(stay) = 0.718, n = 188), so day-D
  location is proven only by a same-day row or the bid itself —
  that is why 12 unavailable selections rest on stale state, and
  why they are tallied separately instead of silently counted as
  proven.
- **Holding is day-D proven, not row-proven.** A candidate holding
  a wave-4 plan on day D has a census row that day; a candidate
  committing to their own plan has a party_launch score row that
  day. The wave-3-only ambiguity (a silently-held wave-3 plan) was
  measured: 0 verdicts rest only on a possibly-holding walker, so
  it does not move the share.
- **Two analyzer bugs found and fixed by correction (Correction
  2).** (1) No-pool-row selections with a homebody companion were
  misclassified as no-walker-in-village; they are unknown (2
  selections moved). (2) The picked companion is now the DEPART
  row's companion (executed pick), not the score commit's — one
  selection (visjoin_73 day 105: score jesse_cortez, depart
  giulia_bianchi) changed companion identity but not bucket (named
  walker Meera Reddy via the same-day row).
- **Corpus integrity (D-check (c)).** The frozen
  `analyze-profilegate-b.js` over the frozen OFF and ON corpora
  reproduces `profilegate-b-analysis.json` exactly on funnel,
  funnel subs, pool shape, wall, and median (proof test C8–C9).
- **Pilot drift (the fresh run that never was).** ON seed 103414:
  trajectories identical to frozen through day 55, first divergence
  day 56 (two agency-expedition kills absent on this tip), 0
  range-0 departs vs 57 frozen, village lost day 103 vs survived
  150d. OFF seed 103414 (no lever): first divergence day 38,
  v4seeds 35 vs 16 frozen. The divergence is base drift in the
  fight/expedition engine since `eb2d3714f`, proven lever- and
  recorder-independent by the OFF leg. The frozen instances do not
  reproduce on current master; the classification proceeds on the
  frozen corpus, which is the task's instance set.
- **Proof test green: 32/32** (`scripts/test-handoff-diag-a.js`):
  8 static (src/ diff empty, lever reverted, prereg + corrections
  + analysis + evidence exist, abandoned driver/scratch absent),
  15 analyzer fixtures (one per bucket + veteran + depart-precedence
  + possibly-holding + late-joiner + unknown-profile), 9 corpus
  checks (enumeration, tally, the exact 4 unknowns, shares, veteran
  / picked splits, wall, backing-row citations, OFF+ON replication).

## Village assessment (plain words)

Eight villages, same eight as profilegate-b. Look at Giulia
Bianchi's village (seed 103414) on a blocked morning in late
summer: Giulia holds the plan to kill the Eater, bids at dawn, and
cannot leave Haven — and standing right there at Haven is Meera
Reddy, a forager who has already killed wave-3 beasts, trusted at
94, free that morning. On 13 of Giulia's 28 blocked mornings Meera
(or App, another forager) could have taken the plan and walked.
The village is not short of walkers; it is short of anyone noticing
that the person holding the plan cannot walk and the person standing
next to her can. Omar Farouk's village (seed 103413) is the same
story in miniature: 7 of 8 blocked mornings, Sanne Bakker or David
Kim — both foragers, both wave-3 killers, both at Haven — could
have taken the Influencer plan. The mornings it does NOT work are
just as concrete: Yuki Mori's village, where every walker holds a
plan of their own (Thabo, gen_9vcqa7j, and the rest all holding on
days 73–79), and the days the walkers are simply away from Haven
(28 walker-instances). Nobody in these villages is idle — the
walkers are hunting, holding, fighting at the door (Omar, Sanne and
David "met them at the door" on day 142, the same week Sanne could
have taken Omar's plan). The jam is a handoff that does not exist,
not a village without walkers.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The fiction is alive where the game acts and
silent exactly where this stage blocks. On the blocked days, 12
`vetSays` lines fire across the three seeds — door fights ("Giulia
and Enrique met them at the door — 2 put down"), teaching ("Yuki
taught everyone about Ground Elder"), a veteran kill on camera
("Tathagata just put down The Herald... on CAMERA") — and **not
one of them says a plan changed hands, a walker took over, or a
picked party stayed home, or why**. The hand-off does not exist
yet, so there is nothing to say — but the silence is the same shape
selblock-a found for the block itself: the bid reads as a promise
the morning breaks silently, and a hand-off fix that lands without
a fiction line ("Meera took the plan — Giulia can't walk that far")
would read the same way. Finding #2499 (picked homebody gets no
fiction line) extends here: whichever fix Steve picks, the morning
it acts needs a line that names who holds the plan now and why.

## Metric review

- **The frozen bar was missed on the corpus gap, not on the
  measurement.** Unknown 4 vs a bar of ≤ 2. The four are all
  no-pool-row selections — a recorder gap (the holder never scored
  at dawn as a wave-4 holder on or before that day), not a
  classification failure: every selection WITH a backing row is
  classified (75/75), and the share is computed over all 79. The
  verdict is NO-GO on bar 1 by the frozen rule, and the rule is not
  re-scored: a NO-GO that delivers the numbers is the honest
  outcome. A follow-up that closes the gap would need a recorder
  that snapshots the village on mid-day commits (or on every
  depart), not a re-run of this classification.
- **Strict share vs sensitivities is the honest tension in the
  metric.** The primary share (35%) counts only walkers proven
  available on day-D evidence. Same-day-only selections give 44%
  (22/50); taking stale-row locations at face value gives 47%
  (37/79). The truth for the design call sits in that 35–47% band,
  with 35% the defensible floor. A future arm that judges a
  hand-off fix should pre-register on the strict share AND report
  the same-day subset — a fix that only moves stale-row mornings
  would look like a win on the loose share while the proven
  mornings stay blocked.
- **Holding is the binding secondary finding, not a footnote.**
  33 walker-instances hold a plan on the blocked day; on 3
  selections every walker does. Any hand-off rule that does not
  check holding will hand plans to holders. The next arm should
  pre-register on the holding-aware share (already the primary rule
  here), not on a holding-blind one.
- **No veteran walkers is a scope note, not a failure.** 0/28 named
  walkers are wave-4 veterans (18/28 are wave-3 killers). Hand-off
  buys departures by competent foragers, not proven wave-4 killers
  — the design call should price that in, and a later arm should
  ask whether handed-off plans actually kill (a launch-funnel
  question, not this arm's).
- **The sickness upper bound is tight and stated.** The share is an
  upper bound because sickness is unobservable for unpicked
  villagers. Sickness blocked 4/113 selections in selblock-a; if
  the same rate applied to the 33 available-walker listings, the
  share would fall by at most ~1 selection. The bound does not
  change the design reading.

## Wall numbers (scale-onramp axis, frozen ON corpus)

National standing 1/8, national rank 0/8, table 0, wins 0, wave 4
unlocked 8/8, wave 5 unlocked 1/8, median survival 116.5d
(per-seed gameDays 62, 57, 151, 151, 115, 118, 151, 103). The wall
did not move — and this arm says why one piece of it does not: on
35–47% of the range-0 mornings a walker was standing at Haven who
could have held the plan, and nobody handed it to them, so the
launch funnel stalls at selection even when the pool is full.

## Finding #2498 — follow-up claim for the coordinator

**#2498 HAND-OFF MEASURED (DIAG NO-GO on completeness, measurement
delivered).** Of the 79 range-0-holder blocked selections, 28
(35%; 44% same-day-only; 47% stale-face-value) have a
handoff-available walker in the same village; 47 have walkers but
none available (top proven reasons: holding another plan 33
walker-instances, away 28); 0 villages lack walkers entirely; 4
unknown (no pool row). Named walkers are all foragers (Meera Reddy
17/28, Sanne Bakker 4, David Kim 3, app_mgpspjp5330 4); 18/28 are
the picked companion; 0/28 are wave-4 veterans (18/28 wave-3
killers). Design call for Steve (unchanged): stop range-0 holders
from bidding/holding, OR hand their plan to a walker — with the
holding check (a hand-off must not hand to a holder) and a fiction
line when the plan changes hands (extends #2499). The 4 unknowns
are a recorder gap for a follow-up (snapshot the village on
mid-day commits), not a re-run of this classification.

## Disposition: DIAG NO-GO — nothing to revert

No src/ change was made at any point (verified: `git diff` vs base
empty; proof test static checks). No lever was committed (the
PROFILEGATE re-application was in-tree only for the pilot and
reverted before any classification). The handoff driver built for
the abandoned fresh run was deleted uncommitted; pilot/offcheck
scratch corpora deleted. Commits are instrument + evidence only:
prereg (+ Corrections 1–2), `scripts/analyze-handoff-a.js`,
`scripts/test-handoff-diag-a.js`,
`evidence/2026-11-17/handoff-a-analysis.json`, and this evidence.
Net src/ diff vs base: zero.

## Files

- Prereg: `evidence/2026-11-17/sim-handoff-diag-a-prereg.md`
  (frozen + Correction 1 + Correction 2)
- Evidence: `evidence/2026-11-17/sim-handoff-diag-a.md` (this file)
- Analysis: `evidence/2026-11-17/handoff-a-analysis.json`
- Analyzer: `scripts/analyze-handoff-a.js`
- Proof test: `scripts/test-handoff-diag-a.js` (32/32 green)
- Corpus read (not re-run): `evidence/2026-11-17/perseed-profilegate-b-on/`
  (8 files), `perseed-profilegate-b-off/` (8 files),
  `evidence/2026-11-17/profilegate-b-analysis.json`
- Pilot scratch legs (compared, deleted, not committed):
  `perseed-handoff-a-pilot` (ON 103414), `perseed-handoff-a-offcheck`
  (OFF 103414) — drift finding recorded in the prereg + above.
