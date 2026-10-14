# sim-harnessstop — dead-village stop condition (finding #95)

Arm: harnessstop (tooling/instrumentation, scale-onramp axis). Pure harness work — zero game-code changes (src/ untouched).

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Primary metric**: dead-village trajectory wall-clock ≤ baseline/4, measured on the dead portion (post-kill loop-days). GO iff GREEN post-kill ms ≤ RED post-kill ms / 4.
- **Guardrail**: 4 live seeds (44, 55, 99, 303) + seed 505, leadcourt, 180d — trajectories byte-identical before/after (trajHash over samples/endReason/days/gameDays/learned sets/waves/pacing).
- **Horizon**: fixture 75d (kill at game-day 15); live seeds 180d death-aware (same as the plentycost sweep).
- **Seeds**: 505 (fixture + live), 44/55/99/303 (live guardrail). Policy: leadcourt (the policy on the original stall).
- **Metric binding**: a miss is NO-GO, never re-scored. Metric review section below.

## What the finding got wrong (correction)

Finding #95 said "`runDays`' `pop()===0` stop reads `village.roster`, which disagrees with `state.villagers` — a classifier showed roster=11 while villagers=0". **The `state.villagers` half is a phantom**: no such path exists on `Game.state` (grep over src/js: zero hits) — the classifier measured `(Game.state.villagers||[]).length`, which is 0 by construction. The roster (11→5 in the classifier log) was the true villager count all along. The real defect was different: `pop()===0` counts roster entries **including the scholar**, so a scholar-alone village (the engine's correct continuation — wanderers can join, babies can be born) never trips it, and the trajectory grinds the full horizon.

Second correction: **seed 505's 13-minute stall does not reproduce on current master**. Re-ran the classifier's exact setup (seed 505, leadcourt, runDays path) on master 57df5478: the trajectory terminates at day 77 via engine `village-lost` in ~11s. The stall was an old-master trajectory (game code moved on since the plentycost run). All 15 other plentycost seeds terminated via village-lost on the old master too — 505 was the lone pathological case.

## What was actually fixed

`runDays` (scripts/sim-harness.js) stop condition:

- **Before**: `if (pop() === 0) break;` — roster length. Unreachable in practice: the scholar's death without successors already sets `Game.over` (checked every phase), and a living scholar keeps roster ≥ 1. A scholar-alone village simulated the whole horizon.
- **After**: engine-true liveness `livingNPCs()` = roster minus the scholar minus `.dead`-marked person records — the engine's own convention (game.js:14630, game.js:38703). When it hits 0, a **+10d tail** runs (death-tail telemetry: rot, succession, grief — the findings backlog measures death-tail rot), then stop with `endReason='village-dead'`. The tail **resets if the roster recovers** (joiners/births — roster.push exists in betrayal.js, game.js, membership.js, villageAgency.js), so a revived village keeps its full run. Fail-open: a read error returns 1 and notes it — never stop a living village on a harness error.
- `endReason` gains `'village-dead'` (consumers tabulate endReason generically — analyze-*.js — so a new value is safe). `'pop-zero'` retained as the unreachable fallback.
- No RNG touched, no state mutated, no per-day cost of note (roster ≤ ~20 ids). Living villages: the new branch never fires, `deadTail` stays 0.

## Proof test (real RED phase)

scripts/test-harnessstop-20261014.js — synthetic dead-village fixture: 15 lived-in game-days, then all NPCs die through the **engine's real removal path** (`Game.removeVillager(vid,'killed')` — corpse, gossip, dead mark), leaving the scholar alone. Fixture scaffolding (labeled in-file, identical in RED/GREEN): scholar HP topped up 3×/day, fights routed via `tbEnd('routed')` (the harness's own time-freeze resolution), pantry restocked — otherwise the engine correctly kills/scatters the lone scholar (combat death, then famine scatter game.js:26889 — verified during fixture development, a nice engine-coherence confirmation).

- **RED** (pristine sim-harness.js, patch reverted via file — never stash on the hot tree): `days=75 gameDays=77 endReason='survived'` — the dead village simulated the **entire horizon**. Assertion `endReason==='village-dead'` FAILED. 3 runs: post-kill wall 3556/6059/5262 ms (mean 4959 ms for 60 dead days).
- **GREEN** (fix applied): `days=23 gameDays=25 endReason='village-dead'` — stopped on the 10th dead day. Assertion PASSED, tail-length bounds held (≥ kill+5, ≤ kill+13). 3 runs: post-kill wall 1407/782/1040 ms (mean 1076 ms for 8 tail days).
- **Primary metric verdict**: 1076/4959 = **0.217 ≤ 0.25 — GO**.

## Guardrail: live villages byte-identical

scripts/measure-harnessstop-20261014.js — runDays, leadcourt, 180d, seeds 505/44/55/99/303, before vs after:

| seed | before ms | before end | after ms | after end | trajHash match |
|------|-----------|------------|----------|-----------|----------------|
| 505 | 11129 | village-lost d77 | 11571 | village-lost d77 | ✅ 993568fb…1a6a71 |
| 44 | 5901 | village-lost d53 | 4333 | village-lost d53 | ✅ 2734ff6a…b535a0e |
| 55 | 5812 | village-lost d91 | 9870 | village-lost d91 | ✅ 7f57168f…19e2b27f |
| 99 | 9375 | village-lost d112 | 13261 | village-lost d112 | ✅ 192247ee…8ea0893e1 |
| 303 | 13348 | village-lost d80 | 13487 | village-lost d80 | ✅ ec9db211…fcfdc233 |

**Guardrail verdict: 5/5 byte-identical** (trajHash covers samples, endReason, days, gameDays, learned sets, wave state, pacing). All five terminate via engine village-lost — the new branch never fires on live trajectories. (ms varies run to run — box noise, not the change; trajectories are what's hashed.)

## Sweep-script audit (task item 5)

- **All scripts/sweep-*.js** either call `runDays` from sim-harness.js (fixed centrally — sweep-compare.js and everything built on it), are launchers (sweep-parity.js → scripts/run-parity-chunk.js → runDays), or have no day loop (sweep-table-experience/grey-walks-20261012.js). **No sweep script carries its own copy of the bug.**
- **scripts/sim-idle-village-20261009.js** (not a sweep script — a dated one-off instrument) has its own day loop with the same `pop() === 0` pattern (line 322) and `'pop-zero'` endReason (line 334). Left untouched deliberately: it's a frozen 2026-10-09 instrument and changing its stop would break comparability with its historical outputs. Documented here instead.

## Design questions (for Steve / next runs)

1. **Scholar-alone = dead?** The engine deliberately continues a scholar-alone village (joiners, births can revive it). The harness now stops it after +10d for measurement. If a future mechanic makes lone-scholar recovery common (not just possible), the +10d tail may truncate recoverable trajectories — the tail reset on roster recovery is the hedge. Steve can overrule the 10d length.
2. **Cost watchdog (considered, deferred)**: the original 505 grind was *expensive days* (65s+/day past day 70), not just *many* days. A per-day wall-clock watchdog would cap that class directly, but it's wall-clock-nondeterministic under box load and no current-master trajectory reproduces the pathology to validate it against. Deferred until a reproducing case exists.
3. **sim-findings #95**: marked [claimed] at run start; marking [fixed] on landing (the stop-condition defect is fixed and proven; the original 13-min instance itself was already resolved by game-code movement).

## Metric review (§14)

- The primary metric was measured on the **dead portion** (post-kill ms), not whole-trajectory ms: whole-trajectory ms is diluted by identical fixed costs (loadGame ~4s + 15 pre-kill days both sides; 3.0s vs 11.0s = 0.27, just over the 1/4 line). The stop's effect is on dead days only (60 → 8 days), and post-kill ms isolates it (0.217 ≤ 0.25, GO). Proposed standing convention for future harness-timing metrics: measure the affected portion, not the whole run.
- The fixture is synthetic by necessity: the natural 505 stall doesn't reproduce on current master. The RED phase proves the *defect* (no dead-village stop existed); the GREEN phase proves the *fix*. The 13-minute figure from the old master is reported, not re-measured.

## Files

- scripts/sim-harness.js — the fix (livingNPCs + 10d tail + 'village-dead' endReason)
- scripts/test-harnessstop-20261014.js — proof test (RED→GREEN verified)
- scripts/measure-harnessstop-20261014.js — before/after timing + trajHash guardrail instrument
- scripts/diag-505-grind-20261014.js — per-phase timing + state-size diagnostic (used to establish non-repro on current master)
- evidence/2026-10-14/sim-harnessstop.md — this file

## Village assessment

No village was assessed this run (tooling arm — no sims on the axis). The fixture village (seed 505, leadcourt): a normal courtship-road village to day 15, then a test-engineered mass death. The engine's own responses during fixture development were all coherent: successors take the Codex when the scholar falls, a lone scholar who stands and fights dies, a lone scholar who gives away the pantry starves and the village scatters.
