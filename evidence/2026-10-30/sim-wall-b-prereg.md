# sim-wall-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0930Z.
Axis: food-economy. Arm: sim-wall-b — wall snapshot, MEASUREMENT ONLY.
Zero src/js changes, zero policy-default changes, zero game-code changes
of any kind. This arm supplies the real wall numbers the previous B run
today (evidence/2026-10-30/sim-food-economy-round-0830-b.md) could only
report as NOT OBSERVABLE on 30-day pre-seat legs.

Base pin (full HEAD hash at prereg time): 70ae4c83cd2f336ade00f5a2b8521f2003d0c952
Branch: sim-wall-b (worktree ~/workspace/worktrees/sim-wall-b).

## Primary metric set (no GO/NO-GO lever bar — the snapshot IS the verdict)

Per seed and in aggregate, on identical seeds, one policy, one horizon:
- national reach (ever reached national rank, sweep-compare `national`)
- table reach: invited (`table`) and entered/sat (`entered`) — reported
  separately, never conflated (panel contract ruling 665: `table` counts
  sittings; sweep-compare `table` counts invitations, `entered` counts
  sittings — both are reported with their definitions)
- wins (`won`)
- wave 4 unlocks (waveReach >= 4) and wave 5 unlocks (waveReach >= 5)
- median + max survival days (days at Game.over, or days at cap)
- death-cause shares (sweep-compare `deaths` per-seed sums)
- vesting (max vests per seed, summed)
- Arc reach (maxArc per seed)
- four-realm formation: NOT tracked by sweep-compare rows; reported as
  NOT TRACKED by this instrument, never estimated (see metric review)

Convergence state to report: converging, with the numbers (this arm
judges nothing against a re-scored metric; a miss against no bar is
not a NO-GO).

## Horizon + why (DEATH-AWARE, never a fixed 200d)

Cap 180 days, death-aware: the harness stops a run at Game.over
(village-lost / over-other) and the row's days are the death day; a
run that reaches the cap is reported AT CAP, never as a death.
Why 180: prior 180d feast-policy panels on current-master lineage
show median survival ~111–132d, so a 180d cap covers the full
wave-4/5 window and the table approach without cutting the tail;
it is also the horizon of the winseat telemetry baseline regime
(180d death-aware), so the numbers are comparable in shape even
though the regime differs (see below). No +10d post-death tail is
simulated: the harness stops at Game.over, which is the death-aware
rule — nothing after death is counted.

## Seeds (fixed up front, never re-screened)

8 seeds, consecutive range, pilot scale: 9981, 9982, 9983, 9984,
9985, 9986, 9987, 9988.
Selection rule: the consecutive 9981–9988 band already used as the
standard 8-seed competent band in recent runs (e.g. sim-liveness-b,
2026-10-28, same policy, 60d). No seed is added, dropped, or
replaced after seeing results; no shopping for better draws.
This run IS the pilot: no confirm spend beyond these 8 seeds is
authorized by this prereg.

## Policies (exact)

- Policy file: scripts/policies/competent.js (`competent` in
  scripts/sweep-compare.js POLICY_REGISTRY).
- Env flags: NONE. Competent defaults only (COMPETENT_WARM default ON,
  all COMPETENT_* / VINEBANK / SNARETEACH defaults untouched). No
  FEASTSCALE / WINPURSUIT / SEATDRIVE substrate flags — this is
  competent play as shipped, not a win-pursuit substrate, so table /
  win numbers are expected to read low and must be reported as
  competent-policy numbers, never compared raw against the winseat
  baseline (see regime note).
- Command (standard, reused verbatim from prior rounds):
  LEVER="sim-wall-b" SEEDS="9981,9982,9983,9984,9985,9986,9987,9988" \
  POLICIES="competent" DAYS=180 \
  OUT=evidence/2026-10-30/sim-wall-b-corpus.json \
  node scripts/sweep-compare.js
  (OUT is written by the script's own main path; if the script's
  main does not honor OUT, the stdout table + a captured JSON are
  recorded instead and the deviation is stated in the evidence.)

## Balanced panel (§15)

- Panel build (instrument, single arm): 
  node scripts/balance-panel.js --out evidence/2026-10-30/sim-wall-b-panel \
  --seeds 9981,9982,9983,9984,9985,9986,9987,9988 --policies competent --days 180
  Panel substrate is identical to the sweep (setupGame defaults the
  origin to Columbus, Ohio when none is given, which is the panel
  default too). Only panel.json.gz is committed; cases/ caches are
  deleted, never committed.
- Panel COMPARE: NOT producible honestly for this arm. A compare
  needs a before/after pair and this arm has no lever pair — it is a
  single snapshot. No compare .md is claimed; comparing the panel
  to itself would be a fabricated artifact. The identical-seed sweep
  corpus is the §15 substitute for this snapshot, and the single
  panel build is attached as the instrument artifact. This is stated
  in the evidence, not hidden.

## Telemetry deviation check (same-run investigation item)

After the sweep, run:
  node scripts/telemetry-check.js --baseline \
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json \
  --current 'evidence/2026-10-30/sim-wall-b-corpus.json' \
  --metrics national,table,wins,exiled
Regime note (pre-stated, not a post-hoc excuse): the baseline is a
WINSEAT regime baseline (full win-side win stack, 180d, leadfeast /
belongfeast, WINPURSUIT=1, SEATDRIVE=1; national 12/16, table 16/16,
wins 16/16). This arm is a COMPETENT regime snapshot (no win-pursuit
substrate). LOUD lines against that baseline are EXPECTED as a
regime artifact, exactly as the 0830Z run recorded for pre-seat legs
— they are investigated same-run and reported, and the baseline is
NOT rolled on a regime difference. A LOUD line would only become a
regression investigation if the sweep itself showed an internal
anomaly (e.g. zero wave-1 reach, or a new death mode dominating).

## Sense test (law)

Sample at least one village's trajectory from the sweep rows plus
one dedicated harness read (roster, deaths, knowledge/capability
gaps) on a single seed, and write the village assessment in plain
words. Flag anything robotic, static, or repeated in villager
behavior. Out-of-scope findings are LISTED in the evidence, never
chased; the coordinator appends them to the findings backlog.

## Proof

scripts/test-wall-b.js: corpus reconciles — 8/8 seeds present,
counts sum (national/table/entered/wins/wave-4/wave-5/vests from
per-seed rows equal the aggregates), no missing rows, determinism
spot-check (one seed re-run byte-identical on the judged rows,
excluding the generated timestamp) if the tooling supports it in a
single process without a second harness instance.

## Metric review (section required in every evidence file)

Pre-registered metrics bind this run (§14). No re-scoring: this arm
has no GO bar, so there is nothing to re-score against. Any metric
that proves wrong (e.g. four-realm formation untracked by the
instrument, table-invited vs table-sat conflation risk) is written
under "metric review" in the evidence with a revision proposed for
the NEXT run, not applied to this one.
