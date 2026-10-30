# sim-wall-b — the wall snapshot on current master (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0930Z.
Axis: food-economy. Arm: sim-wall-b — MEASUREMENT ONLY. Zero src/js
changes, zero policy-default changes, zero game-code changes.
Base pin (HEAD at prereg time): 70ae4c83cd2f336ade00f5a2b8521f2003d0c952.
Prereg (committed BEFORE any judged leg): evidence/2026-10-30/sim-wall-b-prereg.md
(commit 08225f8ca). This file is the snapshot the previous B run today
(evidence/2026-10-30/sim-food-economy-round-0830-b.md) could not supply:
that run could only report NOT OBSERVABLE on 30-day pre-seat legs.
These numbers are observable.

## Prereg header (binding, from sim-wall-b-prereg.md)

- Primary metric set: national reach, table reach (invited AND entered,
  separately), wins, wave 4 unlocks, wave 5 unlocks, median + max
  survival, death-cause shares, vesting, Arc reach. No GO/NO-GO lever
  bar — the snapshot IS the verdict.
- Horizon: 180d cap, death-aware (harness stops at Game.over; a run
  reaching the cap is reported AT CAP, never as a death). Why 180:
  prior 180d panels show median survival ~111–132d, so the cap covers
  the wave-4/5 window and the table approach without a fixed 200d.
- Seeds (fixed up front, never re-screened): 9981–9988 consecutive,
  the standard 8-seed competent band used by recent runs.
- Policy: scripts/policies/competent.js, defaults only, NO env flags
  (no FEASTSCALE / WINPURSUIT / SEATDRIVE substrate). Command:
  LEVER="sim-wall-b" SEEDS="9981,…,9988" POLICIES="competent" DAYS=180
  OUT=evidence/2026-10-30/sim-wall-b-corpus.json node scripts/sweep-compare.js
- No metric was re-scored. Four-realm formation is NOT tracked by
  sweep-compare rows and is reported as NOT TRACKED, never estimated.

## Wall numbers (plain words first)

On current master, a competent player — the skill-ceiling bot that
learns plants, teaches, cooks everything, fights only with advantage
— survives well and learns steadily for six months, reaches wave 4
in half its villages, and NEVER gets anywhere near the scale wall's
far side: no village reaches regional, let alone national; no table
invitation, no sitting, no win, on any of the 8 seeds. The wall, on
competent play, is not "villages die before the table" — five of eight
villages are alive at the 180-day cap, still village-ranked, still
with no table on the horizon. The binding constraint is progression
past village rank, not survival: the villages live, learn, and stay
put. Wave 5 is unreached on all 8 seeds; wave 4 is the ceiling.

## Wall table (competent, 180d death-aware, n=8)

| seed | days | end | max wave | max Arc | max rank | national | table invited | table entered | won | vests | deaths |
|------|------|-----|----------|---------|----------|----------|---------------|---------------|-----|-------|--------|
| 9981 | 180 (cap) | survived | 3 | 3 | village | 0 | 0 | 0 | 0 | 0 | 43 |
| 9982 | 180 (cap) | survived | 4 | 3 | village | 0 | 0 | 0 | 0 | 0 | 82 |
| 9983 | 39 | village-lost | 2 | 3 | village | 0 | 0 | 0 | 0 | 0 | 14 |
| 9984 | 173 | village-lost | 3 | 3 | village | 0 | 0 | 0 | 0 | 0 | 48 |
| 9985 | 180 (cap) | survived | 4 | 3 | village | 0 | 0 | 0 | 0 | 0 | 36 |
| 9986 | 109 | village-lost | 4 | 3 | village | 0 | 0 | 0 | 0 | 0 | 43 |
| 9987 | 180 (cap) | survived | 3 | 3 | village | 0 | 0 | 0 | 0 | 0 | 40 |
| 9988 | 180 (cap) | survived | 4 | 3 | village | 0 | 0 | 0 | 0 | 0 | 33 |

Aggregates: national 0/8, table invited 0/8, table entered 0/8,
wins 0/8, wave 4 unlocks 4/8 (9982, 9985, 9986, 9988), wave 5 unlocks
0/8, vesting 0 total, Arc 3 on 8/8, rank village on 8/8.
Median survival 180 AT CAP (5/8 survived to the cap; the median is
the cap, not a death day — do not read it as "villages live 180 days
then die"). Max survival 180 (cap). Village-lost: 3/8 (days 39, 109,
173). Mean deliberate verbs/day 20.4.

Per-seed corpus (telemetry-check ingestible): evidence/2026-10-30/sim-wall-b-corpus.json
+ evidence/2026-10-30/sim-wall-b-corpus/seed-<seed>.json (8 files).
Sweep log: evidence/2026-10-30/sim-wall-b-sweep.log.

## Death-cause shares (339 deaths total, all 8 seeds)

| cause | n | share |
|-------|---|-------|
| monster:combat | 152 | 44.8% |
| monster:villager combat | 85 | 25.1% |
| player:the wild | 35 | 10.3% |
| villager:a wound that wouldn't close | 13 | 3.8% |
| monster:expedition | 13 | 3.8% |
| villager:sickness | 12 | 3.5% |
| villager:monster | 9 | 2.7% |
| player:a stranger | 5 | 1.5% |
| player:contest | 4 | 1.2% |
| player:the arena | 4 | 1.2% |
| player:dehydration | 2 | 0.6% |
| villager:starvation, person:alien, villager:contest, person:ambush, player:the night | 1 each | 0.3% each |

Read honestly: the top two rows (69.9% combined) are MONSTER deaths
— monsters killed in combat and in villager combat — not villager
deaths. The sweep's `deaths` stream counts every death event,
including monsters the village kills. Villager-side deaths are the
smaller rows: the wild (35, mostly the scholar dying out in the
world and being succeeded), wounds that wouldn't close (13),
sickness (12), monster kills of villagers (9), starvation (1).
Starvation is nearly absent on competent play (1/339) — food is not
what kills these villages. Combat with monsters is the world the
villages live in: they kill a lot of monsters and keep living.

## Balanced panel (§15)

Panel build (single arm, instrument artifact):
  node scripts/balance-panel.js --out evidence/2026-10-30/sim-wall-b-panel \
  --seeds 9981,…,9988 --policies competent --days 180
Result: 8 cases, validity sourcesStable=true, neutrality match=true
(seed 9981, 0 warnings). Panel rows agree with the sweep on EVERY
judged field for all 8 seeds (days, endReason, won, waveReach,
maxArc, maxRank, national, table, entered, vests, deaths) — the two
instruments reproduce each other exactly. Committed: panel.json.gz
only; cases/ caches deleted, never committed. Panel log:
evidence/2026-10-30/sim-wall-b-panel.log.
Panel COMPARE: NOT produced, honestly. A compare needs a before/after
pair and this arm has no lever pair — it is a single snapshot.
Comparing the panel to itself would be a fabricated artifact. The
identical-seed sweep corpus above is the §15 substitute for this
snapshot, and the single panel build is attached as the instrument
artifact. This is stated here per the prereg, not hidden.

## Telemetry deviation check (same-run investigation)

  node scripts/telemetry-check.js --baseline \
  hidden_files/telemetry-baselines/scale-wall.json \
  --current 'evidence/2026-10-30/sim-wall-b-corpus/*.json' \
  --metrics national,table,wins,exiled --sweep-rows
Result: 3 LOUD lines (national 12 → 0, table 16 → 0, wins 16 → 0,
n=8 seed rows); exiled clean. INVESTIGATED SAME-RUN: this is the
KNOWN REGIME ARTIFACT pre-stated in the prereg, not a regression.
The baseline is a WINSEAT regime baseline (full win-side win stack,
leadfeast/belongfeast, WINPURSUIT=1, SEATDRIVE=1; national 12/16,
table 16/16, wins 16/16). This arm is a COMPETENT regime snapshot
with no win-pursuit substrate — competent play is not trying to
reach the table, and the sweep confirms it never even reaches
regional, so wins/national/table at zero are the expected competent
reading, not vanished wins. Baseline NOT rolled. (First attempt
against the combined corpus file returned "no seed rows" — the
ingest needs per-seed files; the per-seed split above fixed it, and
that deviation is recorded, not hidden. Log:
evidence/2026-10-30/sim-wall-b-telemetry.log.)

## Village assessment (plain words — SENSE-TESTING LAW)

Two villages sampled end-to-end with the shared harness
(evidence/2026-10-30/sim-wall-b-sense-9983.json,
sim-wall-b-sense-9981.json). Both read as real, differentiated
villages, not as counters.

Seed 9983 — the village that died young. Twelve people at day 10,
seven by day 30, gone day 39. It was LEARNING while it died: known
plants 11 → 20 by day 30, monster codex 3 → 7, trust climbing
27 → 49, pantry swinging 12,250 → 4,500 → 8,940 kcal. The deaths
tell the story in order: monsters killed in villager combat early
(the village fighting and winning), then sickness taking Sam Wilson
(day 20) and Desmond Clarke (day 22), the scholar dying in the wild
(day 26, succeeded by another villager — the village-as-protagonist
continuity working as designed), another sickness death (day 28),
and the final villager starving on day 39, the day the village was
lost. A village that knew 20 plants, held ~9,000 kcal at day 30,
and still lost someone to starvation nine days later is a question,
not an answer (see out-of-scope findings) — but the trajectory
itself is coherent: sickness thinned it, the scholar's death cost
it leadership, and it never recovered critical mass.

Seed 9981 — the village that lived and stayed put. 180 days,
survived to the cap, population 12 → 8, pantry oscillating
9,000–27,000 kcal and never empty, known plants climbing the whole
run 13 → 55, monster codex 4 → 30, wave kills 22 (wave 1) / 19
(wave 2) / 3 (wave 3), wave 4 never unlocked. The scholar died
FIVE times in the wild (days 17, 37, 104, 161, 168) plus once in a
contest (day 111, Pavel Dubinin) — each time the village carried
on under a successor, which is exactly the design's promise, and
the roster at the end (8 people, down from 10 at the day-30 snapshot:
physical therapist, baker, arborist, electrician, pottery
instructor, mechanic, aquarium keeper, HVAC tech) still shows
distinct occupations, profiles (six foragers, one wanderer, one
homebody), and abilities (the_touch, purify, mending_hands,
green_whisper, beast_calm, iron_stomach, war_cry) — people, not
clones. (The bike messenger / postal worker / mushroom grower
roster cited in an earlier draft of this paragraph belonged to
seed 9983's end state, not 9981's — corrected here from the
sense JSON before commit.)
Standing climbed to 50 by day 110 and 75 by day 160, trust hovered
60–70 — and the rank NEVER moved off village. That is the wall in
miniature: a competent, growing, surviving village that earns
standing and still does not become regional in six months.

What thrived: knowledge (plants, codex, skills — 41 skills learned
on 9981 by day 180, from weather_read to shield_wall to purify_boil),
food (pantry never empty on the survivor; starvation 1/339 overall),
monster-fighting (wave 1–2 kills in the dozens).
What was missing: any path from village to regional under competent
play — no link, no standing conversion, no table approach in 180
days on any seed; wave 4 reached but wave 5 never unlocked; vests
never acquired (0 on all seeds); monster-meat / teaching channels
not visible in these trajectories (not measured here — not claimed
either way).

Robotic / static / repeated flags: NONE found in the sampled
trajectories. Villager snapshots differentiate by occupation,
profile, abilities, and xp; deaths are named and caused; the
succession chain after scholar deaths reads as continuity, not
reset. One wrinkle, noted not hidden: on 9983 the end-state roster
still lists 7 people on the day the village was lost — the roster
snapshot and the village-lost flag do not tell the same story at
face value (roster likely includes applicants / not-yet-pruned
members). That is a reporting wrinkle for the next sense read, not
a gameplay claim.

## Convergence state

converging, with the numbers above. The wall snapshot is now real
for competent play on current master: national 0/8, table 0/8,
wins 0/8, wave 4 4/8, wave 5 0/8, median survival 180 AT CAP, max
180. The previous NOT OBSERVABLE is replaced, not repeated.

## Proof

scripts/test-wall-b.js: 25/25 GREEN — corpus reconciles (8/8
preregistered seeds, aggregates equal byPolicy, death totals match,
median/max match), all 8 per-seed files match corpus rows, panel
validity clean, panel agrees with sweep on every judged field for
all 8 seeds, determinism spot-check (fresh child-process sweep of
seed 9981) reproduces the corpus row exactly. No concurrent jest
was run; this proof is a node script, not a jest suite.

## Out-of-scope findings (LISTED, NOT chased — coordinator appends to the backlog)

1. 9983 starvation death day 39 nine days after a 8,940 kcal pantry
   reading at day 30 — distribution/knowledge gap, or pantry-reading
   vs mouths timing? Needs a dedicated food-distribution trace, not
   a wall-snapshot judgment.
2. 9981 standing 75 by day 160 with rank still village — what, under
   competent play, converts standing into regional rank at all?
   The wall face for competent play is rank progression, not survival.
3. Vests 0/8 on competent play across 180 days — acquisition channel
   never fires under this policy; whether that is policy behavior
   or channel reachability needs a vest-focused census.
4. End-state roster (7 listed) vs village-lost flag on 9983 —
   roster-snapshot vs loss-flag reporting wrinkle for the next sense
   read.
5. Wave 4 reached 4/8 but wave 5 0/8 with wave-3 kills thin (3 on
   9981) — wave-5 unlock conditions vs competent kill rates, a
   question for the scale-onramp lane, not this snapshot.

## Metric review (§14 — required section)

- Pre-registered metrics bound the run; no re-scoring occurred. This
  arm had no GO bar, so there was nothing to re-score against, and
  the snapshot verdict (converging, with numbers) follows the prereg.
- Metric issue 1 (known before the run, confirmed by it): sweep-compare
  `table` counts INVITATIONS and `entered` counts sittings, while the
  panel contract counts sittings under `table`. Both are reported
  here with definitions; a future run that quotes only "table" from
  one instrument will mislead. Proposed revision for the NEXT run:
  always quote invited + entered as a pair, with the instrument named.
- Metric issue 2: four-realm formation is in the mission's measure
  list but tracked by NEITHER sweep-compare rows NOR the panel rows
  surfaced here. It stays NOT TRACKED for this snapshot. Proposed
  revision for the NEXT run: either add a four-realm field to the
  sweep row or drop it from the wall metric set by coordinator call —
  do not estimate it from rank/arc.
- Metric issue 3: the sweep's `deaths` stream counts monster deaths
  alongside villager deaths (69.9% of this corpus is monsters dying).
  Quoting "339 deaths" without that split overstates villager
  mortality. Proposed revision for the NEXT run: report villager-side
  and monster-side death shares as separate lines (this file does so
  in prose; the table above is the raw stream and is labeled as such).
- Metric issue 4: median survival AT CAP (180) is not a survival
  median in the usual sense — 5/8 runs are censored at the cap. The
  evidence labels it AT CAP wherever it appears; a future summary
  that strips the label would misread it as "villages live 180 days."
- Telemetry-check ingest: --sweep-rows needs per-seed files, not the
  combined corpus. The per-seed split is now part of this arm's
  corpus layout; future wall runs should emit it directly.
- No metric revision is applied to this run's numbers. All revisions
  above are proposals for the NEXT run.
