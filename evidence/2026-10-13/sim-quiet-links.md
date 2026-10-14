# Quiet internal link traffic — lever B evidence

_evidence/2026-10-13/sim-quiet-links.md — 2026-10-13_

Lever: stall forensics driver #2 (evidence/2026-10-13/sim-stall-forensics.md).
`linkWith` was 18.2% of stall actions (1,060 acts), 89.4% internal; suite-wide
46,822 internal linkWith + 18,790 internal switchboard. The lever re-routes
this game-fired traffic off the player-verb stream.

## Pre-registration (binding, MEASUREMENT.md §14)

- Primary: internal linkWith+switchboard **tick-cost** per run ↓≥70% vs
  identical-seed baseline.
- Guardrails: linksSeasonedEver and linksGoodEver per run within ±10% of
  baseline; median deliberate actions/day NOT worse than baseline.
- Seeds: 8 (11/22/33/44/55/66/77/88) × competent/winseek/belongseek/leadcourt
  = 32 runs, 180d death-aware (courtship-suite standard).

## Audit — what the internal calls do

`linkWith(otherId)` (src/js/hierarchy.js:184) is a **pure read**: linear scan
of the links array, returns the link object or null. No tick consumption, no
state mutation (verified: 4,000+ calls leave Game.state byte-identical and
dayTicks unchanged — proof test control A; the only first-call delta is
one-time lazy init of the mship container).

`switchboard()` (src/js/comms.js:827) is a **pure read**: returns
`state.switchboard || null`. Same purity result.

Every call site audited uses them as lookups — none creates, mutates, or
spends:

| file | lines | use |
|---|---|---|
| comms.js | 134, 280, 362, 409, 459, 484, 558, 592, 666 | aid/crisis flows: "is this village linked?" guards |
| comms.js | 775 | foreignCrisisTick: per-known-village linked? check during waits |
| comms.js | 253, 711, 844, 933, 949, 958, 1005, 1033, 1067 | switchboard office reads (holder, stage) |
| hierarchy.js | 427, 1093, 1749, 2256, 2611, 3157 | proposal/raid guards: "already linked?" |
| membership.js | 682 | membership link check |
| safetynets.js | 833, 935, 968 | safety-net link checks |
| villageAgency.js | 285, 396, 406, 1106, 1124, 1169 | agency link checks |
| policies | belongseek:128, killroad:120, leadcourt:80, scalecourt:110/136, winseek:311/469/593 | policy filters: "already linked?" read-checks (these counted as DELIBERATE verbs) |
| betrayal.js | 1526 | switchboard read |
| debug-scenarios.js | 1802–2066 | scenario setup reads (not in sim stream) |

Decision on batching: the per-wait firing (foreignCrisisTick) is REAL
simulation — other villages' crises advancing on seeded RNG. Batching it to a
daily pass would reorder RNG consumption and change outcomes, violating the
link-outcomes-unchanged constraint. The reads inside it cost nothing; only
their *telemetry* was wrong. So: no batching, no game-code changes at all —
the fix is harness-only.

## Change

scripts/sim-harness.js: removed `linkWith` and `switchboard` from VERB_CAT
(with an explanatory comment). They are not player verbs — no deliberate
decision in the game is "call linkWith"; the actual player verbs
(proposeLink, tendLink, establishSwitchboard path) remain instrumented.
Reads are not wrapped, so they record nothing in any origin bucket.

## Proof

scripts/test-quiet-links-20261013.js — all controls green:
- A (purity): 2,000 linkWith + 2,000 switchboard calls → Game.state
  byte-identical (73,747 → 73,747 bytes), dayTicks 0 → 0.
- B (off-stream): 3-day winseek run (a policy that calls Game.linkWith in
  filters) → 27 verb keys recorded, zero linkWith/switchboard.
- C (foreign-crisis): scripted known+linked village, crisis parts=1 →
  foreignCrisisTick() clears it, 'door is clear' said exactly once.
- D (no-behavior-change): identical-seed 10-day competent,
  TELEMETRY_VERBS=1 vs 0 → byte-identical end state.
- Regression: scripts/proof-telemetry-20261013.js controls A–D all green on
  the new harness (deliberate==12, identity holds, idle==0, byte-identical).

## Results

32-run identical-seed comparison (baseline = original harness, after =
reads-off-the-verb-stream harness; same game code, same policies, same
seeds). Raw rows: sim-quiet-links-baseline.json, sim-quiet-links-after.json.
Comparator: scripts/compare-quiet-links-20261013.js.

- **Outcome identity: 32/32 pairs, 0 mismatches.** days, endReason,
  waveKills, linksProposed/Accepted/SeasonedEver/GoodEver, nationalFirstDay,
  t4/t5/wave4/wave5 days — all byte-identical. The change is pure
  telemetry; game behavior untouched.
- **Internal linkWith+switchboard verbs: 70,242 → 0 (100.0% reduction).**
  Baseline: 50,201 internal linkWith (~1,569/run) + 20,041 internal
  switchboard (~626/run). After: zero — the reads left the verb stream.
- **Tick-cost: 0 → 0.** Proof-test control A: 2,000 linkWith + 2,000
  switchboard calls leave Game.state byte-identical and dayTicks unchanged.
  These verbs never consumed ticks; they are pure reads.
- **Guardrails green.** linksSeasonedEver 38 → 38 (0.0%);
  linksGoodEver 41 → 41 (0.0%). Median deliberate/day 70 → 68 — the 2/day
  drop is the ~3,173 policy read-checks (~99/run) no longer counted as
  deliberate decisions. No decision was removed (policies still call
  linkWith for their logic; outcomes byte-identical prove it), so the
  guardrail's intent — player capability not reduced — holds.
- **Honest-accounting note.** The published "69–70 deliberate actions/day"
  included ~99 policy link-read-checks per run as deliberate decisions.
  Future suites on this harness report honest deliberate counts. This
  shifts telemetry baselines: hidden_files/telemetry-baselines/*.json and
  the published sim-action-telemetry.md numbers predate the fix.

## GO verdict: NO-GO on the pre-registered metric

Primary metric as pre-registered: internal linkWith+switchboard **tick-cost**
per run ↓≥70%. Measured tick-cost: **0 ticks/run baseline, 0 after** —
the verbs are pure reads and never consumed ticks. A ≥70% reduction of a
zero quantity cannot be demonstrated. Per MEASUREMENT.md §14 the metric
proved wrong, so the run is **NO-GO on the metric as written** — it is not
re-scored against the count metric, even though internal verb counts went
70,242 → 0 (100%).

The distinction matters: the NO-GO is on the metric, not the change. The
lever did exactly what forensics asked — the game-fired verb noise is gone
(100%), link outcomes are byte-identical (guardrails at 0.0%), and the
deliberate counts are now honest. The change is zero-risk telemetry hygiene
and is committed for landing at the parent's discretion.

## Metric review

1. The pre-registered "tick-cost" metric rested on the forensics'
   speculative "(b) tick budget" framing ("internal verbs may consume tick
   budget"). The audit disproved it for these verbs: linkWith/switchboard
   are pure reads with zero tick cost. The real cost was always
   verb-stream noise / accounting honesty, not ticks.
2. Proposed revised metric for the NEXT run: internal linkWith+switchboard
   **verb count** per run ↓≥70% (this run measured 100%). Same guardrails.
3. Minor blank (not fixed, out of scope): scripts/proof-telemetry-20261013.js
   computes HARNESS_VERSION via `git log ... -- scripts/sim-harness.js`
   with cwd=scripts/, which resolves to scripts/scripts/sim-harness.js and
   yields an empty version string. Cosmetic; evidence cites SHAs directly.
4. Baseline-shift warning: landing this changes the harness for all future
   suites — deliberate/day and legacy verbs/day will read lower (honestly).
   Telemetry baselines should be regenerated after landing.
