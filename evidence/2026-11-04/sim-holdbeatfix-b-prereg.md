# Hold-beat ordering fix — Loop B arm sim-holdbeatfix-b — PRE-REGISTRATION

Run: fleshout-loop-b-20261104T1030Z. Branch: sim-holdbeatfix-b.
Baseline anchor (this commit, before any fix): 02158dbea271a4c86232bc2f3332934c5ca135ff.
Committed BEFORE any verdict sim. No verdict number in this file is
written after a judged leg runs.

## Canon read

docs/CANON.md read first. No canon doc covers standing, the wave-5
door, or veteran counting — stated here instead of inventing canon
(same gap sim-holdbeat-a recorded). The door rule is read from code,
not assumed: src/js/standing.js `villageStandingTotal()` (gated total;
deferral holds fire `_standingHoldBeat`) and `waveCombatReadiness(5)`
(veterans = DISTINCT living roster members with a wave-4+ kill in
`state.waveKillLog`). Monster-wave law (docs/MONSTER-WAVES.md) is not
changed by this arm: no wave, loot, or monster stat changes.

## The fix (exactly this, nothing else)

Loop A arm sim-holdbeat-a (DIAG-GO, evidence/2026-11-04/
sim-holdbeat-a.md) proved Q2: a kill's own unlock-check beat reads
the PRE-kill veteran count, because `recordWaveKill` in src/js/
game.js calls `checkWaveUnlockBeat()` BEFORE appending the
`waveKillLog` entry the veteran count reads (99101 d134: kill entry
seq 6142, hold beat seq 6144 reading "0 of 2 veterans", credit seq
6156). This arm lands exactly the named fix: move the
`waveKillLog` append block (the KILL ATTRIBUTION block, including
its dedupe and its `waveKillByChannel` telemetry counter) to BEFORE
the `checkWaveUnlockBeat()` call inside `recordWaveKill`, so the
beat a kill triggers counts the kill. NOT touched: gates, win
prices, deed numbers, veteran demand numbers, ledger scoring
(`scoreLedgerKill` does not read `waveKillLog`), the companion-kill
beat, the codex/teaching channels, or any other `checkWaveUnlockBeat`
call site. The moved block is byte-identical; only its position
inside `recordWaveKill` changes.

Why the move is safe by construction (to be proven, not assumed):
- Nothing between the old push position and the unlock check reads
  `waveKillLog` except the unlock check itself (via
  `waveCombatReadiness`); `scoreLedgerKill` reads ledger state, not
  the log; `companionKillBeat` takes its arguments directly.
- Dedupe is order-independent: a pyrrhic kill already logged by
  `recordPyrrhicKill` is still deduped when `recordWaveKill` runs
  (the entry is already present either way).
- `_attrKills === false` (honesty control) still logs nothing; the
  unlock check still runs.

## Legs (GO requires BOTH)

Beats are rare, so this arm has two legs. A miss on either is NO-GO;
no re-scoring against a friendlier metric mid-run (§14).

### Leg 1 — DECIDING (fixture): the 99101-class kill

- Target: seed 99101, the exact holdbeat-a reproduction case
  (d134: player eulogy wave-4 kill by gen_o1uj9aa, hold beat in the
  same kill call). Run on BOTH legs (baseline anchor, then fixed)
  with the holdbeat instrument (scripts/holdbeat-instrument-
  20261104.js, reused verbatim) via the new driver
  scripts/holdbeatfix-driver-20261104.js (same substrate as
  holdbeat-a: competent policy verbatim, 140d death-aware horizon,
  per-seed JSON in evidence/2026-11-04/perseed-holdbeatfix-b/).
- PASS iff on the fixed leg the d134-class hold beat (a hold beat
  inside a wave-4 kill's own `recordWaveKill` call) reads the
  just-made kill: beat text "1 of 2 veterans" AND beat-moment
  veteran count 1, where the baseline leg reads "0 of 2" / 0 on
  the same seed/day/kill. If 99101 does not reproduce the d134
  kill-day hold beat at this anchor, the fixture leg falls back
  to the deterministic proof test (ordering probe below) as the
  deciding evidence and the non-reproduction is reported, NOT
  papered over with another seed.
- Deterministic proof (scripts/test-holdbeatfix-20261104.js, green
  required): wrap the unlock check during a `recordWaveKill` call
  and assert the log already contains the just-made entry at
  unlock-check time; cover the other `recordWaveKill` paths with
  no behavior change except beat-read order: player kill
  (via 'player'), villager field kill (via 'wild'), companion
  kill (via 'companion'), pyrrhic path (`recordPyrrhicKill` then
  `recordWaveKill` logs exactly once), duplicate call (dedupe:
  one log entry), and `_attrKills === false` (no entry, check
  still runs, no crash). Counters/ledger/codex assertions pin
  the unchanged side effects.

### Leg 2 — NEUTRALITY (pilot): 8 fresh seeds, identical-seed baseline vs fixed

- Seeds: 99801–99808. Freshness verified 2026-11-04: no
  evidence/2026-11-04/*.md filename or content mention, and no
  corpus filename under evidence/2026-11-04/perseed-*/ uses them
  (checked before this prereg was committed).
- Policy: scripts/policies/competent.js `{competent}` VERBATIM,
  default env. Horizon 140 days, death-aware (same as holdbeat-a).
  Both legs run through scripts/holdbeatfix-driver-20261104.js on
  identical seeds; RUN tags holdbeatfix-baseline /
  holdbeatfix-fixed. Smoke rule (fleerepair precedent): the first
  two legs of each leg are smoke-checked for 0 instrument errors
  and scale fields present; if a driver change followed, those
  legs would be discarded and re-run — none is expected, and any
  driver change after legs start invalidates the leg.
- Balanced panel (§15): scripts/balance-panel.js is run as a
  supporting instrument, not as a substitute for the driver legs:
  panel BEFORE on the baseline anchor and panel AFTER on the
  fixed commit, each `--policies capable --seeds
  99801,99802,99803,99804,99805,99806,99807,99808 --days 140`,
  then `compare --before <baseline panel.json.gz> --after <fixed
  panel.json.gz>`. Panel working dirs live OUTSIDE the repo
  (goal hidden_files scratch, regenerable); only the two
  panel.json.gz files and the compare .md/.json are committed to
  evidence. NOTE (stated before running): the panel's child runs
  the sweep-compare registry 'capable' policy, not competent
  verbatim — so the panel is a cross-check on a second policy,
  while the deciding neutrality numbers come from the driver
  legs. A panel decision other than `no_material_signal`, or any
  panel signal of harm, is a same-run investigation item and
  blocks GO until explained. If the panel itself fails for an
  infrastructure reason, that failure is reported in the
  evidence file and the driver legs still judge neutrality —
  no panel result is fabricated.
- COST BAR (deciding, binding): starvation deaths are
  deathEvents with cause exactly 'starvation' (player or
  villager) in the per-seed JSONs.
  - (a) TOTALS: fixed total starvation deaths across the 8
    seeds ≤ baseline total + 2.
  - (b) ARM-ONLY: per-seed excess Σ max(0, fixed_s − baseline_s)
    ≤ 2 (starvation deaths the fixed leg adds over baseline,
    seed by seed).
  - (c) MEDIAN: fixed median survival days ≥ 0.8 × baseline
    median survival days (median over the 8 seeds' days;
    censored-at-horizon legs count at 140).
  - (d) NO NEW FAILURE CLASS: no death-cause string and no
    endReason value appears in the fixed legs that never appears
    in the baseline legs' pooled causes/endReasons.
  - (e) NO SEED FLIP: no seed changes end-outcome category
    (survived vs lost) between baseline and fixed.
  - (f) TRAJECTORY CHECK (reported, not a separate bar): per-seed
    baseline-vs-fixed JSONs compared field by field; the ONLY
    expected differences are hold-beat veteran numbers in beat
    text. Any other difference is investigated under (d)/(e).
  - Instrument errors must be 0 on all 16 pilot legs.
- PASS iff (a)–(e) all hold and instrument errors are 0.

## GO / NO-GO

GO iff Leg 1 PASS (fixture beat reads post-credit, or the
deterministic ordering proof passes with a reported 99101
non-reproduction) AND Leg 2 PASS (all cost-bar clauses). If the
fixture passes but the pilot regresses, that is NO-GO. If the
pilot passes but the fixture fails, that is NO-GO. A NO-GO arm
lands nothing; the fix commit is not merged by the coordinator.

## Reachability + wall numbers (every run)

Report from the pilot legs (both legs): win rate, national reach,
table reach, wave 4–5 unlocks, wave-5 faced, wave-5 releases,
median/max survival, death-cause shares. Plus the scale-wall line:
national / table / wins, wave 4–5 unlocks, median survival.

## Sense test

Read one beat transcript before/after (the 99101 d134 hold beat on
both legs) and judge it as a player: does the fixed beat read as
the System noticing the kill it just watched, and does anything
else in the transcript change?

## Metric review (§14 — written in the evidence file, never mid-run)

A miss is NO-GO, never re-scored. If a metric proves wrong, it is
written under "metric review" and proposed for the NEXT run.
