# sim-synergyholdout-b — prereg: 16-seed holdout for the synergy build's two exploratory panel signals

Run: `fleshout-loop-b-20261112T0930Z` (Loop B, 2026-11-12 03:30 CST).
Arm: sim-synergyholdout-b — holdout for arm sim-synergydisc-b.
Parent arm: sim-synergydisc-b (0730Z, dawn resonance, landed `ad2bd13fd`).
Findings-backlog item: the holdout owed by sim-synergydisc-b's evidence
(`evidence/2026-11-12/sim-synergydisc-b.md`, §Panel review).

## The question

The 0730Z synergy arm passed its cost bar on 8 seeds, but its panel
compare came back `review_required` on two exploratory signals:

- Village deaths per 100 calendar days: 75.57 → 88.54 (+12.98,
  interval 0.99–25.44), status `regression_signal`.
- Eligible NPC named-class access: 0.2717 → 0.1849 (−0.0867,
  interval −0.179–−0.012), status `regression_signal`.

On 8 seeds with unadjusted exploratory intervals, both are consistent
with 8-seed noise from gameplay-mediated chaotic divergence (the dawn
path consumes no RNG; once a synergy unlocks, trajectories diverge).
This arm judges on a fresh 16-seed band whether either signal
reproduces (real) or was 8-seed noise.

## Legs (pinned SHAs — verified before any sim)

- Before leg: `fed635f1f` (pre-synergy master).
- After leg: `ad2bd13fd` (synergy tip).
- Verification (this run, before writing this prereg):
  `git diff fed635f1f ad2bd13fd --stat -- src/` →
  `src/js/game.js | 92 ++++...` — exactly **+92/−0, one file**.
  That is the whole point: the diff is only `dawnSynergyResonance()`
  plus its `endDay()` hook.
- Current tip `0436a04e0` is NOT used as the after leg: it also carries
  journey r133's preserver-cap game.js change, which would confound the
  verdict. Both SHAs recorded here.

## Primary metric + GO threshold (binds the run)

Primary metric: the `scripts/balance-panel.js compare` verdict on the
fresh 16-seed band (before panel
`evidence/2026-11-12/synergyholdout-b-panel-before`, after panel
`evidence/2026-11-12/synergyholdout-b-panel-after`, compare
`evidence/2026-11-12/synergyholdout-b-panel-compare`).

- **GO iff the compare does NOT flag either of the same two signals
  ("Village deaths per 100 calendar days", "Eligible NPC named-class
  access") with status `regression_signal`.**
- If either reproduces as `regression_signal` → **NO-GO** (signal real;
  investigate in the evidence file, do not re-score).
- A `regression_watch` on either row is NOT a reproduction (the 8-seed
  signal was `regression_signal`); it is reported, not judged.
- The overall compare decision (`review_required` vs
  `no_material_signal`) is NOT the judge — only the two rows are. Other
  rows' signals are reported in the evidence file, not re-scored into
  the verdict.

## Guardrail / co-primary (scalemetric cost bar, §14)

Same bar as the parent arm, computed from the before leg once it runs
(thresholds recorded in the evidence file, never edited here after):

- Starvation ≤ control+2 on totals AND on arm-only deaths.
- Median survival ≥ 0.8× control median.
- A breached guardrail is NO-GO even if the primary passes.

## Band + freshness (verified by this arm)

- Band: seeds **190509–190524** (16 seeds), competent policy only,
  150d death-aware. No other seeds, no other policies.
- Horizon reason (§10): reachability lever (waves 4–5, national,
  table) → 150d; death-aware stop, +10d tail max.
- Freshness check (this arm, per the seed-band-freshness skill):
  `grep -rl "190509\|19051[0-9]\|19052[0-4]" evidence/*/sim-*-prereg.md`
  → **0 files**; same pattern over `evidence/*/sim-*.md` → **0 files**.
  Coordinator's pre-check (zero hits for 190509–190524, only
  190501–190508 named anywhere) independently reproduced. No
  forbidden/contaminated band list exists. Band is fresh.

## Smoke (diagnostic only, run on the branch tip before this prereg)

`node scripts/test-synergy-stall.js` verbatim on tip `0436a04e0`
(log `/tmp/synergystall-holdout-tip.log`, ~94s under host load):
discovered `["stand_together","blood_tracker"]`, attempts
stand_together 3/3, zero held-leg synergies with zero attempts —
discovery still fires after landing. Note: cornered_fury is NOT
discovered on this tip because the scholar's held abilities on the
diagnostic seed shifted between `ce653cdab` and `0436a04e0`
(the_touch/adrenaline_control/echo_location/cornered_rat →
green_whisper/beard_moss/mending_hands; ability_granted 157 → 68) —
the intervening journey r133 preserver-cap game.js change moved the
trajectory, so cornered_fury's legs are not held on this seed. That
shift is exactly why the after leg is pinned to `ad2bd13fd`, not the
current tip. The mechanism is confirmed working; the diagnostic seed
is not the judge here (the panel compare is).

## Method

- Both legs through `scripts/balance-panel.js` (competent only,
  `--seeds 190509,...,190524 --days 150`).
- Panel generation under `setsid` (b7 precedent: the panel parent died
  silently twice under heavy parallel load; sibling b8 is generating a
  64-row panel concurrently). If a parent dies, resume in the same
  `--out` dir — the case cache is reused exactly; remove stale
  `.json.tmp` partials per the b6/b7 precedent.
- Pinned-SHA legs: verify `git status --short` is empty, `git checkout
  <sha>` (detached), run the panel, `git checkout sim-synergyholdout-b`
  before writing evidence or committing. Never checkout with
  uncommitted work.
- Commit ONLY `panel.json.gz` + the compare `.md`/`.json` — NEVER
  commit the `cases/` cache (delete it at closeout).
- Wall numbers (national / table / wins, wave 4–5 reach, median
  survival) reported on both legs in the evidence file.
- SENSE-TESTING LAW: sample the flagged signals in per-seed output
  (which villages died faster, which NPCs gained named-class access)
  and judge meaning/coherence, never just counts.

## Proof plan

- `scripts/test-synergyholdout-b.js` (new): asserts the prereg from
  the committed corpora — (a) compare verdict: neither of the two
  rows is `regression_signal`; (b) cost bar: starvation totals and
  arm-only deaths ≤ control+2, median survival ≥ 0.8× control median.
  Green on the branch.
- Telemetry deviation check:
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current '<per-seed-evidence-glob>' --metrics national,table,wins,exiled`.
  If the tool refuses the panel corpus (as in prior bisect runs),
  record the refusal, don't waive it.

## Metric review

(Filled at run end. No metric re-scored mid-run.)
