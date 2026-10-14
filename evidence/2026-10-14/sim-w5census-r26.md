# Wave-5 post-unlock death census — scale-onramp r26, loop A (2026-10-14)

DIAGNOSTIC ARM — measurement only, not a lever. What nobody has done is
MEASURE how wave-5 unlockers die (sim-findings "New measured wall" item:
0/6 wave-5 unlockers reached the table on the 15-seed confirm; the one table
reach, s303, died there in a 7-deep succession chain).

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **Primary metric**: cause + days-post-unlock emitted for each wave-5
  unlocker's post-unlock bearer deaths (census rows: unlock day, death day,
  cause, days-post-unlock at death, table reached ever, fight context for
  combat deaths). Top-3 post-unlock death causes named with shares.
- **GO threshold**: diagnostic — census emits ≥8 unlocker records; top-3
  causes named with shares. A NAMED finding is the GO.
- **Horizon**: 180d death-aware (harnessstop 2026-10-14 liveness stop +
  10d tail). Why: wave-5 unlocks land ~d50–130; post-unlock survival is the
  window. Death-aware, never fixed 200d.
- **Seeds**: 11/22/33/44/55/66/77/88 (standard set).
- **Policy**: leadfeast (leadcourt + FEASTSCALE_R13=1) — the policy that
  maximizes wave-5 unlocks (5/8 to wave-5 in r19).
- **No before/after**: this arm runs NO baseline comparison. The r25 finding
  (seed-88-class nondeterminism: identical seed+policy+days+code gives
  different trajectories across processes — sim-findings line 103) makes
  identical-seed before/after unmeasurable for this question. Per the task
  brief: measurement, not a lever — aggregate statistics only.
- **Convergence report**: diagnostic — census delivered. converging.

## Instrument

- `scripts/w5census-lib.js` — pure census-row builder (no Game reads):
  unlock filter, fight-context window ([deathDay-2, deathDay] of the
  player's own combat_start events, up to 3 most recent), start/end FIGHT
  PAIRING (greedy: each combat_end consumes the most recent unconsumed
  combat_start ≤ its day — index pairing misaligns on start-less ends),
  tenure matching by bearer vid, cause taxonomy (canonical causes pinned;
  named monsters -> combat; unknowns keep raw text under `other:`, never
  silently absorbed), per-seed succession chains (gaps ≤ 12d), aggregates.
- `scripts/sweep-w5census-r26-20261014.js` — the sweep driver. Daily hook
  tracks wave-unlock days (unlockedWave), standing at unlock, tableWaiting
  days, bearer tenures, rank/arc history. Post-run: fullTelemetry scan —
  player:true death records (r17 attribution), combat_start/end streams.
  Per-run reconciliation: census rows == post-unlock player-death count;
  FAIL is loud. Per-seed chains (a pooled chain mixes seeds — caught and
  fixed mid-run).
- `scripts/test-w5census-instrument-20261014.js` — proof test. PART A (pure,
  deterministic): taxonomy pinned, filter/window/tenure/pairing/chain/
  aggregate on fabricated data (incl. the s22-d144-shaped unpaired-end
  fixture). PART B (live): runOne(55, 180d) — zero instrument exceptions,
  rows reconcile, every row's deathDay >= unlockDay, every bearer tracked.

Raw data: `evidence/2026-10-14/w5census-r26.json` (19 census rows, all
reconciled, 0 instrument errors across 8 seeds).

## RESULTS

Sweep 1 (instrument v1): 4/8 unlockers, 22 rows. Sweep 2 (final instrument,
fight pairing added): **3/8 unlockers, 19 census rows** — the numbers below
are sweep 2. s22 and s44 reproduced row-for-row across both invocations;
s11/s88 flipped (see Noise floor). All 19 rows reconciled (rows ==
post-unlock player-death count); 19/19 have a paired fight; 0 instrument
exceptions.

**GO threshold: MET** (19 ≥ 8 rows; finding named below).

### Top causes (honest §14 note: only TWO categories exist)

| cause | n | share |
|---|---|---|
| combat | 18 | 94.7% |
| contest | 1 | 5.3% |

The pre-registered "top-3" cannot be named — the census produced two
categories, not three. Recorded as a miss on the letter of the threshold,
not the spirit: the finding lives one level down, in the FATAL FIGHTS
(18/18 combat deaths paired to a specific fight; the 1 contest death also
paired to its day's fight).

### Fatal fights behind the 18 combat deaths

| wave | n | monsters |
|---|---|---|
| wave 5 | 8 | The Rerun ×3, The Network Note ×3, The Timeslot ×1, The Cancellation ×1 |
| wave 4 | 6 | The Suburb ×3, The Audit ×2, The Eulogy ×1 |
| wave 3 | 2 | The Callback ×1, The Redactor ×1 |
| wave 2 | 1 | The Moderator ×1 |
| person-fight (no monster) | 1 | alien-player duel ("Stranger") — verified by fighter capture; uprising=false, betrayal=false |

The contest death (s44 d110) paired to The Audit (w4) fought the same day.

Median days-post-unlock at death: **23** (min 0 — two unlock-day deaths;
max 93). Table reached during the post-unlock window: **8/19 rows (42%)** —
the table does not protect the scholar.

### The chains (per seed)

- s22: three chains — (d64–d80, depth 3), (d95–d103, depth 2), (d144–d150,
  depth 3). Nine post-unlock bearers over 93 days.
- s44: three chains — (d70–d71, depth 3), (d87–d89, depth 3),
  (d110–d111, depth 3). Nine post-unlock bearers over 41 days.
- s88: no chain (1 post-unlock death).

The chains fire **multiple times per day**: s44 d71 (two bearers, The
Suburb), s44 d89 (two bearers, The Rerun), s44 d110 (contest + combat, The
Audit). Successors take the mantle and die to the SAME monster within
hours — devon_okafor's tenure started d71 and ended d71; fatima_hassan's
started d89 and ended d89. This is the s303 7-deep pattern at higher
resolution: the village feeds scholars to the same fight serially.

## The census, in plain words

Wave-5 unlockers die in fights — 95% combat, and the fights are named:
wave-5 monsters kill 42% of post-unlock scholars (Rerun and Network Note
lead), wave-4 monsters kill another 33% (Suburb and Audit lead — wave 4
doesn't stop killing after wave 5 unlocks), and the unlock day itself is
lethal (two sitting scholars died the day wave 5 unlocked, to wave-4
fights). One scholar in 19 died to a person, not a monster — an alien
duelist in a person-fight the combat_start telemetry never sees (the
startCombat tele only covers monster fights; uprising/betrayal/alien-duel
paths bypass it — the instrument now reports these as person-fights
instead of missing them). Scholars die AT the table (42% of rows): s22
held the table ~95 days (first table day d65) while losing nine scholars
in fights, then died village-lost at d158. s88 is the other mode: one
post-unlock death (d84, The Redactor w3), then village-lost d87 with the
scholar still alive — the village died around its scholar three days after
a 277-standing unlock.

## Village assessment

- **s22** (unlock d57, standing 252): the long bleed. Nine scholars over
  93 post-unlock days, killed by Callback → Eulogy → Suburb → Timeslot →
  Network Note → Network Note → alien duelist → Cancellation → Moderator.
  The village reached the table at d65 and sat there 95 days while the
  scholar lineage turned over nine times. Nobody starved; nobody got sick;
  the village fought its way to the table and bled out through the
  mantle. Who thrived: nobody — the village is gone. What was missing:
  any way to stop feeding successors into fights.
- **s44** (unlock d70, standing 222): the fast bleed. Nine scholars in 41
  days, chains of depth 3 every ~20 days, same-day double deaths. The
  Audit killed the sitting scholar on unlock day; the Suburb took two the
  next day; the Rerun took two on d89. A contest took one on d110 after
  she'd fought the Audit. The village never reached the table.
- **s88** (unlock d68, standing 277): the hollow unlock. One scholar died
  (d84, Redactor); the village died out at d87 with the scholar alive.
  Highest standing of the three unlockers, shortest post-unlock life.
- **s11/s33/s55/s66/s77** (no unlock this invocation): died village-lost
  at d66–d171 without reaching wave 5 — the familiar pre-wall attrition.

## Instrument findings (tooling)

1. combat_start/combat_end pair by GREEDY consumption, not index — a
   start-less end (person-fight paths) misaligns naive index pairing
   (observed: 30 ends vs 29 starts on s22).
2. The [deathDay-2, deathDay] start window MISSES the fatal fight when no
   start exists (s22 d144: no combat_start at all). The end-anchored
   pairing is the primary instrument; the window is context.
3. Per-seed chains only — a pooled chain finder interleaves seeds into a
   phantom 17-deep chain.
4. `other:` cause leaks are loud by design — none observed (all 19 rows
   categorized).

## Noise floor (r25 finding, confirmed live)

Sweep 1 → sweep 2, identical seeds/policy/days/code, ~2h apart: unlock
rate 4/8 → 3/8 (s11 unlocked d116 then didn't; s88 didn't then unlocked
d68). s22 and s44 reproduced row-for-row (death days, bearers, causes,
fatal fights). Census SHAPE is stable (combat ~95%, w5 ~42% of fatal
fights, chains of depth 3); the unlock BINARY flips. Any future arm
measuring unlock rates must budget for this.

## Blanks opened

- Successors take the mantle and die to the same monster the same day
  (tenure start == death day, twice on s44). No mechanic slows the
  succession feed post-unlock — the chain is the wall's engine.
  → sim-findings entry.
- Person-fight deaths (alien duel) are invisible to combat_start telemetry
  and to the wave ledger's monster framing — a scholar can die to a
  "Stranger" with no monster context anywhere. Whether the alien-duel
  path should emit a combat_start (or its own tele type) is an
  instrumentation design question. → sim-findings entry.
- s88 mode: village-lost WITH a living scholar 3 days after a
  277-standing unlock — the village died around its scholar, not through
  the mantle. The census is scholar-centric; village-level post-unlock
  death (non-scholar roster collapse) is unmeasured. → sim-findings entry.
- s22: 95 table days + village-lost. The table was held while the village
  bled out — the table is not a survival state in the sims. Whether that
  matches design intent is a Steve call. → sim-findings entry
  (steve-call).

## Metric review

Pre-registered GO (≥8 rows; top-3 named): MET on rows (19), MISSED on the
letter of "top-3" — two categories exist, not three. Not re-scored: the
finding is reported at the grain the data supports (fatal-fight waves),
and the miss is recorded here. No metric revision proposed — for a future
census run, pre-register "top fatal-fight waves" instead of "top-3
causes". The diagnostic verdict stands: the mortality wall is combat,
named, and chained.
