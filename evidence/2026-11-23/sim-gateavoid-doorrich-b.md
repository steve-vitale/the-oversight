# sim-gateavoid-doorrich-b — DIAG-NO-GO on supply (Loop B round 0230Z adoption)

**Run:** `fleshout-loop-b-20261123T0230Z`, axis winnability-chain, arm
`sim-gateavoid-doorrich-b` (the door-richer re-judge of the leader-projection
gate — the 0030Z round record's named next step after the gateavoid NO-GO).
The occurrence timed out ~10:30Z with the screen half-run and no verdict.
Adopted and finished by the adoption coordinator: band 2 completed (seed
107486, left unrun at timeout), band 3 screened (107487–107494), all three
bands adjudicated against the frozen screen rule. All work verified from
git/files, not from worker reports.

**Frozen base:** master `80e7da0bc` (full
`80e7da0bcf29d0b5017384ead04cbad652114c5c`, journey-establishment r271).
Anchor `80e7da0bcf29` verified on every one of the 24 screen corpus files
(each screen-log line carries it, with `policySha` `1884c8852d38`).
**Zero `src/` changes** — the instrument is already on master (merged
`a8ff84fd8`); this arm reuses it verbatim. No default flip.

## Verdict: DIAG-NO-GO (supply)

No screen band qualifies. Three fresh 8-seed bands were screened (the frozen
maximum); every band's CONTROL probe shows a projection pool of exactly **1
door**, so the ≥4-pool / ≥2-bad supply floor never binds and D1 can never be
judged. Per the frozen screen rule the arm STOPS here — no judged legs were
run, and D1–D6 are unjudged, not failed. The question (does the projection
gate reduce bad outcomes on a door-rich band?) stays open for a different
supply strategy; see Metric review.

## Frozen-bar table

| Bar | Result |
|---|---|
| M1 `test-allyslot3-b.js` | 18/18 GREEN (proofs log, 09:07Z) |
| M2 `test-pinquaddoor-b.js` | 35/35 GREEN |
| M2w `test-pinquaddoor-wide-b.js` | 16/16 GREEN |
| M3 `test-dmgpin-b.js` | 29/29 GREEN |
| M3d `test-doorflee2-b.js` | 49/49 GREEN |
| M3e `test-downedtwice-b.js` | 25/25 GREEN, exit 0 |
| M3f `test-hypofloor-b.js` | 48/48 GREEN |
| M3g `test-hpgate-b.js` | 43/43 GREEN |
| M3h `test-leaderhpgate-b.js` | 50/50 GREEN |
| M3i `test-leaderproj-b.js` | 55/55 GREEN |
| M3j `test-gateavoid-b.js` | 36/36 GREEN |
| M3k `test-gateavoid-screen-b.js` (NEW) | **11/11 GREEN** (adoption re-run; target count recorded at build: 11) |
| Analyzer selftest `analyze-gateavoid-b.js --selftest` | 39/39 GREEN (adoption re-run) |
| M4 panel bars D1–D6 | NOT RUN — screen stopped the arm before any judged leg |
| M5 guardrail (balanced-panel compare) | NOT APPLICABLE — no legs, no panel to compare |
| M6 deliverable | this file + screen analysis JSONs per band |

The M1–M3j battery was run post-freeze by the timed-out run (proofs log
09:07–10:14Z, on the frozen base). M3k + the analyzer selftest were re-run
by the adoption on the same base and are green.

## Screen table (frozen rule: qualify iff CONTROL probe shows ≥ 4 pool doors with ≥ 2 bad)

| Band | Seeds | Fought doors | Pool (leader ≤ 75 HP) | Bad (vFlee+vDie) | Qualifies? |
|---|---|---|---|---|---|
| 107471–107478 | 8/8 | 3 (3 vKill) | 1 | 0 | NO — pool floor binds |
| 107479–107486 | 8/8 | 7 (7 vKill) | 1 | 0 | NO — pool floor binds |
| 107487–107494 | 8/8 | 2 (1 vKill, 1 vDie) | 1 | 1 | NO — pool floor binds |

Pool = control fought doors whose leader entered ≤ 75 HP (projHp2 ≤ 25), as
the analyzer reports `projPool` / `projPoolBad` (`doorStats`, same
computation the M3k test proves). Screen analysis JSONs:
`gateavoid-doorrich-b-screen-107471-analysis.json`,
`-107479-…`, `-107487-…` (pool rows, fought rows, wall numbers per band).

Band 2 was left 7/8 at timeout (seed 107486 unrun); the adoption ran it
(exit 0, anchor verified) before adjudicating. Band 3 is the frozen third
and last band. No fourth band was screened — the rule caps at three.

## Door-fight table (every fought door, all three screen bands)

| Seed | Day | Monster | Wave | Leader HP | projHp2 | Band | Outcome | Rounds | Dealt |
|---|---|---|---|---|---|---|---|---|---|
| 107473 | 126 | strike | 4 | 55 | 5 | collapse2 | vKill | 7 | 1094 |
| 107475 | 106 | audit | 4 | 95 | 45 | safe | vKill | 8 | 1271 |
| 107478 | 38 | audit | 4 | 81 | 31 | safe | vKill | 9 | 1298 |
| 107481 | 53 | audit | 4 | 82 | 32 | safe | vKill | 8 | 1212 |
| 107481 | 73 | reunion | 4 | 95 | 45 | safe | vKill | 7 | 1270 |
| 107481 | 78 | eater | 4 | 94 | 44 | safe | vKill | 6 | 1018 |
| 107481 | 99 | spoiler | 5 | 86 | 36 | safe | vKill | 6 | 1505 |
| 107481 | 101 | influencer | 4 | 80 | 30 | safe | vKill | 6 | 1078 |
| 107482 | 99 | suburb | 4 | 61 | 11 | collapse2 | vKill | 7 | 1396 |
| 107483 | 144 | cancellation | 5 | 91 | 41 | safe | vKill | 8 | 1880 |
| 107493 | 103 | reunion | 4 | 62 | 12 | collapse2 | vDie | 5 | 984 |
| 107494 | 85 | algorithm | 4 | 100 | 50 | safe | vKill | 5 | 1164 |

12 fought doors across 24 seeds / 150d. 11 vKill, 1 vDie, 0 vFlee. Only 3
of the 12 leaders entered at ≤ 75 HP — those three are the entire
projection pool, one per band:

| Seed | Day | Monster | Leader HP | projHp2 | Outcome |
|---|---|---|---|---|---|
| 107473 | 126 | strike | 55 | 5 | vKill (GOOD) |
| 107482 | 99 | suburb | 61 | 11 | vKill (GOOD) |
| 107493 | 103 | reunion | 62 | 12 | vDie (BAD — the only bad pool door in 24 seeds) |

## Matched-pool table

None — no judged legs ran, so there is no armed leg to match against. The
pool above is the control-side population D1 would have been judged on.

## Diag table (pool composition — why the supply floor never binds)

- Fought doors are rare on the control leg: 12 across 24 seeds (3 / 7 / 2
  per band), even though `v4encounters` counts run 2–50 per seed. Most
  wave-4+ encounters never reach a fought door (the door-open decision with
  rounds ≥ 1).
- Of those 12, only 3 leaders entered at ≤ 75 HP (25%). The other 9
  entered at 80–100 HP, i.e. `safe` projection band — the projection gate
  could not touch them even if it had been armed.
- Of the 3 pool doors, 2 were already GOOD (vKill) and 1 was BAD (vDie).
  The bad-outcome population the gate is supposed to reduce is a single
  door in 24 seeds.
- The gate-avoid log fired 4 times across the 24 seeds, all `hold` kind
  (the whole-party HPGATE — a member below 25 HP), never `proj` (the
  projection gate is off in the control config, as designed):
  - 107478 d40: Lan, 9 HP vs eater — "gave eater room — Lan is too hurt
    to hold a door (9 HP)"
  - 107481 d112: Rafael, 20 HP vs audit
  - 107482 d107: Kåre, 2 HP vs editor
  - 107487 d91: Ehab, 3 HP vs strike
- The durable log is doing its job on the control leg (4 log entries, 4
  surviving notes — log-vs-notes gap 0 on these seeds); the blind channel
  the gateavoid arm measured is not the binding constraint here. The
  binding constraint is that the pool itself does not exist on fresh
  bands.

## Sense-test read

Quoted from the persisted durable log, seed 107478 day 40 (band 107471):

> "gave eater room — Lan is too hurt to hold a door (9 HP)"

The nearest fought door on the same seed is two days earlier, day 38: the
party fought an audit at wave 4 with the leader at 81 HP and killed it in
9 rounds (1298 dealt, `doorHold` 2, `everHopeless` true — the party held
the door twice and still won). The hold two days later reads true to the
mechanism: the same village that won a door fight at full strength gave
the next one room when its member was at 9 HP. No `proj` avoid exists to
quote on any screened band — the projection gate never fired in the control
config, which is the correct null: the screen measures the control pool,
and the pool is what is missing.

## Wall numbers (24 screened seeds, control config)

- Wins 0/24. National by standing ≥ 200: 15/24. Table: not measured on
  this instrument (no table signal in the pinquaddoor driver output).
- Wave 4 unlocked 24/24; wave 5 unlocked 15/24.
- Median survival 148d; survived to horizon 11/24; deaths 2,403 total.
- Standings: 100–610 (median ~320). No village won; the scale wall is
  untouched by this arm (it was never the arm's question).

## Balanced-panel compare

None attached — there is no control/armed pair to compare, because the
screen stopped the arm before any judged leg. M5 is therefore not
applicable rather than passed or failed.

## Metric review

- **D1 stays unjudged, not failed.** The screen rule did exactly what it
  was frozen to do: it refused to let D1 be judged on a 1-door pool, the
  same failure mode that made the gateavoid verdict METRIC-BROKEN. The
  rule is vindicated, not broken — three bands, same answer.
- **The pool is thin by construction, not by luck.** Exactly 1 pool door
  per 8-seed band, three bands running, is a pattern, not noise. Two
  compounding scarcities: fought doors are rare (12/24 seeds), and
  leaders rarely enter them at ≤ 75 HP (3/12). A fourth, fifth, or sixth
  fresh band would most likely return the same 1-door pool — the frozen
  cap of 3 bands was the right stop, and screening more fresh bands is
  NOT the recommended next step.
- **Next supply strategy (for the next run, not this one):** stop screening
  fresh bands and go where the pool already exists. The leaderproj probe's
  richer history (band 107391–107398: 8 `leaderprojFires`, pool doors
  fought) is the known pool-rich substrate — re-judge D1 there, or stage
  pool doors deliberately (a driver that seeds leaders at ≤ 75 HP at a
  door), or widen the pool definition (the day-window matching proposal
  the prereg declined returns here as a supply question, not a scoring
  change: a pool door fought a day late still tests whether the gate
  would have saved the leader). Any of these changes the SUPPLY, not the
  −20pp bar.
- **D2/D3 would have been noise anyway** (prereg's own warning): 12
  fought doors across three bands cannot support a per-door kill/damage
  comparison. Nothing is lost by not running the legs.
- **The 107493 reunion vDie is the one data point the next run wants.**
  A pool door that ended in a leader death, on a band where the armed leg
  could have refused it — if the next supply strategy ever assembles a
  ≥ 4-door pool, the first question is whether the armed leg's `proj`
  avoid lands on doors like this one.
- **No re-score.** Nothing in this evidence re-scores D1 or the screen
  rule after seeing the screens. The DIAG-NO-GO stands on the frozen
  rule as written.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (carried from
  the prereg; the gate is a sim lever, judged door by door).
- `evidence/2026-11-23/sim-gateavoid-b.md` + its frozen prereg (D1–D6
  carried verbatim; the 1-door 0%-bad pool this arm exists to replace).
- `evidence/2026-11-23/sim-winnability-round-0030.md` (the adoption
  record; the named next step is this arm).
- `evidence/2026-11-22/sim-leaderproj-b.md` + its frozen prereg (the
  original D1 rule; the 8-fires / 1-note diag).
- `docs/MEASUREMENT.md` §§9–12, 14–15.

## Files

- Prereg: `evidence/2026-11-23/sim-gateavoid-doorrich-b-prereg.md`
- Evidence: `evidence/2026-11-23/sim-gateavoid-doorrich-b.md` (this file)
- Screen analysis JSONs:
  `evidence/2026-11-23/gateavoid-doorrich-b-screen-107471-analysis.json`,
  `-107479-…`, `-107487-…`
- Screen corpora: `evidence/2026-11-23/perseed-gateavoid-doorrich-b-screen-107471/`
  (8 files), `-107479/` (8 files), `-107487/` (8 files)
- Screen log: `evidence/2026-11-23/gateavoid-doorrich-b-screen.log`
- Proofs log: `evidence/2026-11-23/gateavoid-doorrich-b-proofs.log`
- Instrument: `scripts/test-gateavoid-screen-b.js` (M3k, NEW — 11/11)
- `src/` diff: NONE. No default flip.
