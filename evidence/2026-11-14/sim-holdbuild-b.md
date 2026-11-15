# sim-holdbuild-b — BUILD the hold: upkeep tending for seasoned links + post-dissolution poverty-trap relief

Loop B run `fleshout-loop-b-20261114T2345Z`, axis winnability chain. Arm sim-holdbuild-b.
Prereg: `evidence/2026-11-14/sim-holdbuild-b-prereg.md` (committed `0a50f2122` — binds).
Branch: `sim-holdbuild-b`. Base master `910bff7f4`.

## The lever, in plain words

Realms (a village's standing with other villages, built up to a national-level
alliance) fall apart after the court answers them, and twice they never came
back. Two named causes, both in the game's own tending machinery:

(a) **No upkeep tending.** The village's own tending drive only tends links
that are still young (unseasoned). Once the last link matures, tending stops
everywhere — the last tend on one village was day 70 — while raids, heralds
and arrears keep chipping trust away. A mature link only gains +1 trust a
week from tribute against −5/−10/−6 hits.

(b) **The poverty trap after a fall.** When a realm does fall apart, the
village is usually too poor in stored food for the tending gate to open at
all — one village never held more than about 14,000 food-energy in the 60
days after its fall, while monsters raided the stores every night — so trust
keeps sliding and the realm never climbs back.

The build (in `src/js/win-plan.js`, the one place the game itself decides
tending — see diagnosis below) does two things, each separately flaggable:

- **(a) Upkeep:** while the realm stands at national level, the village keeps
  tending its own links when trust falls below 55 (15 points of headroom
  above the 40-point line a link must hold), weekly, at the normal price of
  1,500 food-energy per tend — never free. Flag `HOLDBUILD_UPKEEP` (default
  on; `'0'` turns it off).
- **(b) Re-climb:** after a fall, if no plan-holder is at home to tend a
  link that has slipped below 40, the village's available representative
  steps in instead, and the food-store gate for that tending drops from 3
  days of stores to 1 day. Still real food, still weekly. Flag
  `HOLDBUILD_RECLIMB` (default on; `'0'` turns it off).

Nothing else changed: same tend price and cadence, same 40-point mature bar,
same succession haircut (−8 to all links, 7 days of mourning), same win
prices and deed gates, no new system.

## Where tending is actually decided (diagnosis)

Read first, before building. The player button (`tendLink`) was never the
blocker — it has no maturity gate. The engine decider is
`winPlanBondsTick` (daily tick): plan-holders at home tend their own main
links when trust is under 50, weekly, with 3+ days of stores — **but it
returned nothing at all once the realm stood at national level**. The
corpus proves it: 58 engine tends band-wide, zero on or after the national
day on any seed; 104–266 tick calls per national seed blocked by that one
return. The court's answer drive is off by default and never runs in the
browser, so it is not the real decider and was left alone. The sim
policies tend only young links with 20,000+ food-energy in store — an
instrument gap, not the game; the policies stay byte-identical.

A probe then overturned the brief's presumption for component (b): on the
two never-re-climbed seeds the binding blocker is not the food gate — it is
that **no plan-holder is at home at all** (0 holders on every day the gate
could have opened). Lowering the food gate alone could not produce one
tend there, so (b) adds a fallback actor as well as the lowered gate.

Prior art: sim-tenddrive-a (2026-11-08) built component (a) in exactly this
construction and went NO-GO at pilot — the mechanism fired (2 engine tends
while national) but its band had zero national losses, so there was nothing
to save. This band is loss-rich (7 dissolutions), so the bar here tests the
lever where losses exist.

## Baseline (committed corpus)

`evidence/2026-11-14/perseed-answercourt-confirm-b/` — 16 seeds × armed
competent-answercourt-b + baseline competent-scaleclimb-b, 150 days. Armed
leg: national ever 13/16; national held-days per seed 90, 0, 28, 71, 7, 72,
30, 57, 0, 0, 68, 77, 43, 19, 58, 34 (median 38.5); dissolutions 7
(series-counted); re-climbs 2 (100208 d113, 100211 d127); never re-climbed
100203, 100212; starvation armed 6 vs baseline 3; median survival armed
121.5d. Pilot band (100201–100208) corpus median national held-days 43.5.

## Stage 0 — reproduction (PASS 3/3)

Re-ran seeds 100201, 100203, 100212 armed with the recovered
answercourt driver and build flags OFF (`scripts/repro-holdbuild-b.js`):
every judged field identical to the corpus files; only `anchorCommit`
differs by construction. Policies recovered byte-identical from
`ed6df749e` (sha256-verified) and committed (`0a1282119`).

## Instrument incident — the recorder diverged the run (fixed)

The first pilot OFF leg (seed 100201) did NOT reproduce the corpus: maxWave
4→5, standing 199→656, wave-1 kills 35→50, deaths 50→121. The series first
diverged on day 5 (ladder-counted 12→13, wave-1 kills 1→2, pantry −450);
by day 10 the village's speaker was Liam for village_3 instead of Carmen
for village_0. The sweep was stopped after one seed; the contaminated file
was deleted, never used.

Root cause (instrument, not the build): the holdbuild driver's snapshot
read the upkeep/re-climb counters through `Game.winPlanStats()`. That
method calls `stateOf()`, which **creates** `village.winPlan = {}` when it
does not exist. `winPlanHavenTick` — the daily at-home plan tick — opens
with `if (!v || !v.winPlan) return null;`, so while `winPlan` is undefined
it does nothing at all; once the recorder created the empty object on day
2, the tick started seeding plans for every engaged wanderer/explorer at
home from day 3, gearing villagers up and changing fights days before the
corpus run ever forms a plan (which only happens after a wave-3+ fight).
`pantryDaysEstimate()` (pure arithmetic), the raw `winPlan` key count, and
the dissolution-episode ring (regex + array push) were all verified pure;
the `mode` label does not touch the RNG (`Math.random` is seeded from the
seed only).

Fix (committed `c06e85ffa`): `wpUpkeep`/`wpReclimb` are now read RAW from
`state.village.winPlanStats` — never through the method. Verified by the
new `scripts/repro-holdbuild-driver.js`: seed 100201 with the fixed
holdbuild driver, flags OFF, **PASS with zero field diffs** against the
corpus (150d, survived, national d62, maxWave 4, standing 199, deaths 50,
verbEvents 30). The pilot was re-run from scratch with the fixed driver.
Lesson: a recorder must never call a game accessor that creates state —
read the raw fields.

## Pilot (8 seeds 100201–100208, armed policy, 150d)

**TBD — runs in progress.** Pilot gate (all three, from the prereg):
(i) mechanism fires (upkeepTends + reclimbTends > 0 on the pilot band);
(ii) cost bar clean (starvation pooled ON ≤ OFF + 2 AND median survival
ON ≥ 0.8× OFF); (iii) 100203 re-climbs OR pilot median national held-days
≥ 48 (corpus pilot median 43.5 × 1.1). A miss = NO-GO at pilot: revert
the game change, report the measurement, no confirm spend.

### Pilot OFF leg (control — re-validates the fixed driver vs corpus)

TBD.

### Pilot ON leg

TBD.

### Pilot verdict

TBD.

## Confirm (16 seeds 100201–100216, 150d, if the pilot gate passes)

TBD. GO bars (all three): P1 — at least one of 100203 / 100212 re-climbs
on the ON leg. P2 — median national held-days ON ≥ 47 (corpus 38.5 × 1.2).
COST — starvation pooled ON ≤ OFF + 2 (totals AND arm-only per-seed) AND
median survival ON ≥ 0.8× OFF. Any miss = NO-GO: revert the game change,
report the measurement.

## Sense-testing — do the villages say why they tend again?

TBD — read the re-climb transcripts (`linkLines` + `dissolutionLines`)
in the ON leg and quote the lines.

## Reachability verdict

TBD.

## Village assessment (plain words)

TBD.

## Metric review

TBD — did P1/P2 measure the hold, or did the instrument? (Per the prereg
§16 prompt.) Note: the pilot-off incident above is itself a metric-review
finding — the recorder's counters must be read raw, or the instrument
becomes a lever.

## Wall numbers

TBD — national / table / wins, wave 4–5 unlocks, median survival, every run.

## Files changed (branch `sim-holdbuild-b`)

- `src/js/win-plan.js` — the build only (committed `ad0fcd0f8`).
- `scripts/test-holdbuild-b.js` — proof test, 9/9 PASS (seed 7);
  `scripts/test-tenddrive-a.js` cross-check 4/4 PASS with the build on.
- `scripts/repro-holdbuild-b.js` — Stage-0 reproduction (3/3 exact).
- `scripts/holdbuild-driver-20261114.js` — judged driver (fixed, `c06e85ffa`).
- `scripts/analyze-holdbuild-b.js` — analyzer (validated on the corpus:
  13/16 national, 38.5d median held, 7 dissolutions, 2 re-climbs,
  0 upkeep tends).
- `scripts/build-holdbuild-panels-20261114.js` — panel builder (ON vs OFF).
- `scripts/probe-holdbuild-b.js` — diagnostic probe (refuted the pantry-gate
  presumption for component (b)).
- `scripts/policies/competent-answercourt-b.js`,
  `scripts/policies/competent-scaleclimb-b.js` — recovered byte-identical.
- `scripts/answercourt-driver-20261114.js`,
  `scripts/analyze-answercourt-b.js`,
  `scripts/build-answercourt-panels-20261114.js`,
  `scripts/test-answercourt-b-20261114.js` — recovered byte-identical.
- `evidence/2026-11-14/sim-holdbuild-b-prereg.md` — the binding prereg.
- `evidence/2026-11-14/perseed-holdbuild-b-pilot-off/` — pilot OFF leg.
- `evidence/2026-11-14/perseed-holdbuild-b-pilot-on/` — pilot ON leg.
