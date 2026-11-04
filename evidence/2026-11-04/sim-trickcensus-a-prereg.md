# Trick-availability census — prereg (Loop A, run fleshout-20261104T0215Z, arm sim-trickcensus-a)

Committed BEFORE any judged sim. DIAG-ONLY arm: zero src/js, no
policy-file changes, no default flips, no gate/price/deed/standing
changes. The fix this census specs (e.g. a Rage once-per-fight gate)
is a future arm, not this one.

## Grounding (read, not assumed)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave 4: The Mirror
  Draft; waves 3–5 carry NO `counter` field — their counterplay is
  signature mechanics, learnable through `noteVillagerTrickObservation`
  into `state.villagerTricks`, NOT through the ledger convention) +
  `docs/MEASUREMENT.md` §§9–12, 14–15 + `docs/SIMULATING.md`.
- Prior brief `hidden_files/arm-briefs-20261104/trickavail-a.md`
  (0115Z worker cancelled, zero output — brief only, no results
  reused) and this arm's brief `trickcensus-a.md`.
- 2315Z evidence `evidence/2026-11-03/sim-tbfinish-a.md` (51 TB
  exposures, 284 turns, Rage 35 presses, trickKnown False in all
  51, no wave-4 counter ever attempted) and
  `evidence/2026-11-03/sim-ready5-a.md` (door rule: capped
  standing >= 200 AND four bars armored 4 @ P>=15, armed 6,
  tricks 3, veterans 2 living with wave-4+ kill; tricks maxima
  16–30, never short once learned).
- Code-verified taxonomy this census uses (not assumed):
  - The BAR's "tricks" count = `monsterCounterKnown` over
    `state.monsterCounters` — which REQUIRES a `counter` field,
    so only wave 1–2 kinds can ever add to it. Wave-4/5 kinds
    cannot move the bar, by construction.
  - Wave-4/5 trick knowledge lives separately in
    `state.villagerTricks` (signature defs in
    `Game.villagerTrickDefs()`, 10 wave-4 kinds) fed by the
    2-observation bar (`state.villageCounterObs`), plus
    `state.villageSlain` teaching counts and the codex
    'slain' hint channel for wave 1–2.
  - Fighter abilities in TB fights are the scholar's System
    abilities (`state.scholar.abilities`, 6 slots) surfaced as
    `activatableAbilities()` combat actions; the competent
    policy presses them via `abilityPressPlay` (Rage when
    winning + non-trivial, NO once-per-fight gate — unlike
    Bird Strike) and attempts beast tricks via `beastTrickPlay`
    ONLY for known/hint-known counters (`beastHintKnown`).
  - Trick knowledge is VILLAGE state, not per-villager state:
    a fighter's personal inventory is scholar abilities + gear;
    village-known tricks are reported at village level, and
    any per-villager source the engine does not store is
    reported as "unknown, needs instrument", never invented.

## Calibration gate — DIVERGED on survival, AGREED on structure, RE-BASELINED

Calibration leg (unjudged, instrument commit 846dad552):
`scripts/trickcensus-driver-20261104.js`, seed 99107 only,
RUN=trickcensus-calib, output
`evidence/2026-11-04/perseed-trickcensus-a/trickcensus-s99107-trickcensus-calib.json`.

- This anchor (worktree HEAD c4c9865ce at instrument commit;
  branch sim-trickcensus-a): days 71, village-lost, maxWave 3,
  spawnsW4 0, tbCalls 0, fieldCallsW4 0, killsW4 0, scale
  village, endUnlockedWave 3, peak unmoved by the end call.
- 2315Z ready5/tbfinish for 99107: days 38, village-lost,
  maxWave 3, spawnsW4 0, TB 0, kills 0, end bars 5/9/16/0.
- Verdict: DIVERGED on survival (38 → 71 days) — master has
  moved since 2315Z (this base carries journey-scale and
  loop landings after the 2315Z anchor), so the band moved.
  AGREED on every structural point that matters to this
  census: no wave-4 exposure, no wave-4 kill, village scale,
  tricks bar met by end (21 here vs 16 at 2315Z — counter
  learning runs, longer life learns more). The 99107 seed
  cannot calibrate TB trick availability (it yields no TB
  fight at either anchor); it calibrates the bar + learning
  channels only.
- Consequence — RE-BASELINE (explicit, per the brief): the
  judged baseline for this arm is the pilot leg itself, on
  current master. 2315Z totals are NEVER cited as this arm's
  baseline and never pooled with pilot numbers. The pilot
  is judged against its own pre-registered legs below.

## Policy, seeds, horizon (fixed now)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (at THIS anchor), default env. No policy variant.
- Pilot seeds: 99101–99108. Confirm seeds (only if pilot GO):
  99109–99116, same policy/horizon.
- Horizon: 140 days, death-aware (dead villages stop
  simulating; never a fixed 200d).
- Balanced panel (§15): INAPPLICABLE — pure diagnostic with
  no before/after change, so no comparison is fabricated.
  The instrument is the census; the pre-registered
  threshold below is the judge.

## Instrument (scripts only)

`scripts/trickcensus-instrument-20261104.js` (on the
tbfinish instrument) + driver
`scripts/trickcensus-driver-20261104.js` + analyzer
`scripts/trickcensus-analyze-20261104.js`, proof
`scripts/test-trickcensus-20261104.js` 17/17 (commit
846dad552, index-clobber repaired from HEAD blobs and
verified byte-identical before the calibration leg):

- Round-1 capture per the tbfinish pending-buffer spec:
  outer player-action wraps buffer actions whose fight has
  no exposure yet; the startCombat post-call attaches the
  buffer + a start trick inventory to the new exposure.
  Zero-turn routs are pre-registered as a non-exposure
  class (tbfinish's proven suburb rout), not a miss.
- Per exposure: trick inventory at start AND end (scholar
  abilities, activatable combat actions with available/why,
  monsterCounterKnown / villageKnowsTrick / villagerTricks /
  villageCounterObs / villageSlain for the fought kind,
  bar trick count, readiness-5 bars), ability presses with
  per-action availability snapshots, ability-or-trick damage.
- Daily snapshots (policy.daily wrap, never calling
  villageStandingTotal() or unlockedWave()): readiness-5/4
  bars, standing breakdown + capped total, peak, bar trick
  ids, villagerTrick kinds, villageCounterObs, scholar
  abilities, wave-4 slain counts.
- Tele capture: counter_discovered / counter_observed /
  skill_taught events with id/via/vid (the source channel
  for each learned trick).
- End-of-run final inventory for every wave-4/5 kind +
  one separately-reported unlockedWave() call (never
  counted as a natural door-open).

## Primary metric + GO threshold (pre-registered, judge the arm on this)

Primary metric: trick-bar census completeness on the pilot.

DIAG-GO iff ALL hold on the 8-seed pilot (99101–99108,
competent, 140d):
(a) trick bar status + shortfall cause for all 8 seeds
(cause per short seed, or "mixed" with the split; the
analyzer's cause classes are: tricks-met, in-flight,
no-counters-known, bar-short, mixed — a seed whose bar is
met counts as (a) met, with the wave-4/5 signature state
reported alongside, not folded into the bar);
(b) per-villager trick inventory with source for every
fighter in TB fights, 0 fighters unclassified
(unclassified = no scholar-ability/gear record at fight
start; village-level trick state is reported at village
level per the taxonomy above, and a missing per-villager
source is reported as "unknown, needs instrument");
(c) one named lever with numbers (the SINGLE biggest
trick-availability lever, quantified, for the next arm);
(d) sense-test: at least 3 transcripts read (a trick
pressed, a trick available-but-unpressed, a villager
learning or being taught) and judged for meaning.

If pilot GO, confirm on +8 seeds (99109–99116) and check
stability. If any leg fails, report DIAG-NO-GO with the
failing leg named — do not re-score against a friendlier
metric. No fix, no game-code change in this run.

## Hard limits (binding, honored)

- NO src/js changes. NO policy-file changes. NO gate /
  price / deed / standing changes. NO Loop B food-economy
  code. NO other run's worktree. NO direct edits to
  hidden_files/sim-findings.md or convergence-tracker.md
  (findings listed in the evidence file for the
  coordinator). No `[needs-eyes]` commit (diag only).
- Worktree must contain ONLY committed work at end.
