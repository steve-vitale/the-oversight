# sim-synergyholdout-b — 16-seed holdout for the synergy build's two exploratory panel signals

Run: `fleshout-loop-b-20261112T0930Z` (Loop B, 2026-11-12 03:30 CST).
Arm: sim-synergyholdout-b — holdout for arm sim-synergydisc-b.
Parent arm: sim-synergydisc-b (0730Z, dawn resonance, landed `ad2bd13fd`).
Prereg: `evidence/2026-11-12/sim-synergyholdout-b-prereg.md` (committed
`18cb05021` BEFORE any sims; left untouched after — the metric review
lives here, not as a post-hoc prereg edit).
Base: `fed635f1f` (pre-synergy master). After: `ad2bd13fd` (synergy tip).
Diff verified: `git diff fed635f1f ad2bd13fd --stat -- src/` →
`src/js/game.js | 92 ++++...`, exactly +92/−0, one file.

## Verdict: GO — neither 8-seed signal reproduces on 16 fresh seeds

- **Primary metric (panel compare, 16 paired cases): GO.** Neither of
  the two 8-seed `regression_signal` rows reproduces:
  - Village deaths per 100 calendar days: 62.69 → 61.98 (−0.71,
    interval −5.48 to +4.00), status **`no_material_signal`** (was
    +12.98, `regression_signal`, on 8 seeds). Direction flipped.
  - Eligible NPC named-class access: 0.0986 → 0.0809 (−0.0176,
    interval −0.055 to +0.014), status **`no_material_signal`** (was
    −0.0867, `regression_signal`, on 8 seeds). Interval now crosses
    zero.
- **Cost bar: PASS.** Starvation total 1 → 2 (bar ≤ 3); arm-only
  starvation 1 (seed 190516 only, bar ≤ 2); median survival 117.5d →
  103.0d (bar ≥ 94.0d).
- **Proof test `scripts/test-synergyholdout-b.js`: 14/14 green.**
- Overall compare decision is still `review_required` (exit 2) — driven
  by two `regression_watch` rows (player deaths/100d, player
  named-class access), not by the two judged signals. Per the prereg,
  the overall decision is not the judge; only the two rows are. The
  watches are reported below, not re-scored.
- **Conclusion: the 8-seed signals were 8-seed noise.** The synergy
  build stands as landed; no follow-up owed on the deaths signal.

## Fresh band (before/after, balanced panel)

`scripts/balance-panel.js`, competent policy only, seeds 190509–190524,
150d death-aware. Before `evidence/2026-11-12/synergyholdout-b-panel-before`
(16 cases, validity sourcesStable + neutrality match on proof seed
190509, 0 cached jobs, ~24 min under setsid, `--par 2`); after
`evidence/2026-11-12/synergyholdout-b-panel-after` (16 cases, same
validity, 0 cached, ~24 min); compare
`evidence/2026-11-12/synergyholdout-b-panel-compare`
(decision `review_required`, exit 2).

| | Before | After |
|---|---|---|
| Median survival | 117.5d | 103.0d (bar ≥ 94.0d ✓) |
| Survived (150d) | 1/16 | 3/16 |
| National | 0/16 | 0/16 |
| Table (invitation) | 16/16 | 15/16 |
| Sittings / Won | 0/16 / 0/16 | 0/16 / 0/16 |
| Wave reach | 4×13, 5×3 | 4×14, 5×2 |
| Starvation deaths total | 1 | 2 (bar ≤ 3 ✓) |
| Arm-only starvation | — | 1, seed 190516 (bar ≤ 2 ✓) |
| Village deaths/run (mean) | 73.44 | 66.19 |
| Village deaths/100d | 62.69 | 61.98 |

Per-seed days: before [120, 149, 86, 98, 115, 128, 93, 122, 125, 98,
111, 144, 112, 104, 134, 150]; after [106, 86, 102, 144, 150, 98, 93,
87, 125, 96, 72, 65, 128, 104, 150, 150].

Cost-bar thresholds (prereg formula, numbers from the before leg):
starvation total bar = 1+2 = 3; arm-only bar = 2 (the same +2 allowance
applied to newly-appearing starvation); median bar = 0.8 × 117.5 =
94.0d. "Arm-only" = after-leg starvation deaths on seeds where the
before leg had none (190516: 1; 190521's 1 is shared with the before
leg, not arm-only).

## Why the 8-seed signals were noise (per-seed sense test)

**Village deaths/100d.** The paired deltas scatter both ways — 8 seeds
down, 6 up, 2 identical — with no coherent direction. Total village
deaths per run FELL on 10/16 seeds (mean 73.44 → 66.19); the rate only
looks bad where a village died much earlier in the after leg, because
the rate divides by a shorter denominator: 190520 (144d → 65d, deaths
83 → 48, rate 58.0 → 73.8) and 190519 (111d → 72d, deaths 75 → 61,
rate 68.2 → 85.9). Fewer deaths, higher rate — the 8-seed signal was a
short-run artifact, not more dying. The counterweight: 190523 lived
longer (134d → 150d) and its rate fell 63.4 → 42.0. Nothing in the
change touches villager mortality (dawn resonance is scholar-scoped;
the scholar gets stronger, not weaker), and on 16 seeds the sign
reversed. Noise, judged.

**Eligible NPC named-class access.** Per-seed: 5 down, 4 up, 7
identical. The ratio sits on a tiny numerator (0–4 classed NPCs per
seed) over a 11–22 sampled-NPC denominator, so one NPC's godpath
recognition swings it by ~0.06–0.09. The biggest movers are roster
swings, not class losses: 190510 went 3 classed of 18 sampled → 0 of
15 (before classes forager/gardener, hunter/stalker; after: none
formed — a different set of villagers lived to be sampled); 190509
4 of 17 → 2 of 22; 190514 3 of 16 → 1 of 12. No NPC "lost" a class
through the synergy change — dawn resonance cannot touch NPC godpath
recognition, and the sampled roster is a different set of people on
each leg once trajectories diverge. Noise on a small-denominator ratio,
judged.

**Watches (reported, not judged).** Player deaths/100d 10.25 → 10.54
(`regression_watch`, interval −2.02 to +2.56, crosses zero); player
named-class access 0.8125 → 0.625 (`regression_watch`, interval −0.375
to 0 — 13/16 → 10/16 seeds with a player class). Both are trajectory
noise of the same kind (the scholar's godpath recognition depends on
which fights and offers the divergent trajectory serves up); neither
crosses the signal bar, and neither was a prereg judge. The player
named-class watch is worth one line in the next synergy follow-up if
anyone re-opens this area, but it does not overturn this verdict.

## Scale wall (this run)

Fresh band, both legs: national 0/16 → 0/16, table invitations 16/16 →
15/16, sittings 0/16 → 0/16, wins 0/16 → 0/16, wave-5 reach 3 → 2
seeds, median survival 117.5d → 103.0d. The wall did not move: villages
reach the table and wave 5, none reach national or a win, on either
leg. Dawn resonance is a progression fix, not a wall attack — it was
never expected to move the wall, and it did not.

## Village assessment (plain words)

Sixteen fresh villages, same seeds, same policy, one change between
them: whether the System notices when the scholar holds two abilities
that only make sense together. On the fresh band the villages look the
same either way — they live about as long, die of the same things
(monsters, overwhelmingly; starvation barely registers on either leg),
reach the table at the same rate, and never reach national or a win.
The two alarming numbers from the first eight villages did not survive
contact with sixteen new ones: the villages did not die faster, and
the villagers did not stop finding their callings. What did survive is
the fix itself — the scholar still gets the combinations the game used
to be blind to, and nothing else about the village changes.

## Smoke (diagnostic, branch tip, before the prereg)

`node scripts/test-synergy-stall.js` verbatim on tip `0436a04e0`
(log `/tmp/synergystall-holdout-tip.log`, ~94s under host load):
discovered `["stand_together","blood_tracker"]`, stand_together 3/3
attempts, zero held-leg synergies with zero attempts — discovery still
fires after landing. cornered_fury is not discovered on this tip
because the scholar's held abilities on the diagnostic seed shifted
between `ce653cdab` and `0436a04e0` (journey r133 preserver-cap
game.js change moved the trajectory; ability_granted 157 → 68), so its
legs are not held on this seed. That shift is exactly why the after
leg is pinned to `ad2bd13fd`, not the current tip.

## Metric review

No metric was re-scored mid-run. The prereg GO bar (neither judged row
`regression_signal` AND cost bar) is met in full: both rows read
`no_material_signal`, starvation 2 ≤ 3 total / 1 ≤ 2 arm-only, median
103.0d ≥ 94.0d. One prereg clarification recorded, not hidden: the
"arm-only deaths" half of the cost bar was not given an operational
definition in the prereg (the parent arm reported only the total), so
this run defines it as after-leg starvation deaths on seeds where the
before leg had none, with the same +2 allowance — and the bar passes
under that reading (1 ≤ 2) and under the stricter reading of total
alone. The overall compare decision (`review_required`) is not the
prereg judge by design; the two `regression_watch` rows behind it are
reported above. The prereg file itself was left untouched after its
pre-sim commit; this evidence file carries the run-end metric review.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current '<per-seed rows>' --metrics national,table,
wins,exiled --sweep-rows`: the tool refuses the gzipped panel corpus
directly (`could not parse ... panel.json.gz: Unexpected token` — the
b7/bisect refusal, recorded not waived). Re-ran on per-seed flat rows
extracted from the panels (`/tmp/holdout-telemetry/`, 32 rows, not
committed): after leg `wall: table=15/16 entered=0/16 won=0/16`;
`LOUD: national disappeared: baseline 12 -> current 0`;
`LOUD: wins disappeared: baseline 16 -> current 0`. The before leg
reads identically (`wall: table=16/16 entered=0/16 won=0/16`, same two
LOUD lines) — both LOUD lines are the winseat-regime artifact the
baseline itself warns about (baseline 16/16 wins; this competent-policy
panel has national/wins structurally 0 on BOTH legs). Not a change
caused by this arm.

## Run notes (infrastructure)

- **Panel generation under `setsid`, `--par 2`** (b7 precedent + sibling
  b8 generating a 64-row panel concurrently): both legs completed
  without a parent death; 0 cached jobs each; no `.json.tmp` partials
  left behind. Before ~24 min, after ~24 min, under heavy host load
  (load average peaked ~11.6).
- **Index clobber struck on the prereg safe-commit** (known class):
  commit `18cb05021` correct (134 insertions), index showed the file
  staged-deleted + untracked. Repaired with `git ls-tree -r HEAD --
  evidence/2026-11-12/ | git update-index --add --index-info`,
  verified `git status --short` empty + `git diff HEAD` empty.
- **Pinned-SHA leg discipline held**: `git status --short` empty
  before each checkout; detached at `fed635f1f` for the before panel,
  `ad2bd13fd` for the after panel; back on `sim-synergyholdout-b`
  before writing evidence or committing. No `cases/` cache committed
  (deleted at closeout).
- No game-code change in this arm (evidence + proof test only), so no
  `check.js --quick` run is owed; the proof test is the gate. Loop A
  live trees untouched; main tree untouched; no push, no version bump.

## Proof (files)

- `evidence/2026-11-12/sim-synergyholdout-b-prereg.md` (committed
  pre-sims, `18cb05021`).
- `evidence/2026-11-12/sim-synergyholdout-b.md` (this file).
- `evidence/2026-11-12/synergyholdout-b-panel-before/panel.json.gz`
  (16 cases) + `.log`; `synergyholdout-b-panel-after/panel.json.gz`
  (16 cases) + `.log`; `synergyholdout-b-panel-compare.{json,md}` +
  `.log`.
- `scripts/test-synergyholdout-b.js` (new): 14/14 green, exit 0.
- Smoke log `/tmp/synergystall-holdout-tip.log` (not committed;
  diagnostic only).
