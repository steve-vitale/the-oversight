# sim-regresswatch-b — prereg: fresh-band reproduction of the regression_watch player named-class read

Run: `fleshout-loop-b-20261112T2130Z` (Loop B, 2026-11-12 15:30 CST).
Arm: sim-regresswatch-b — independent fresh-band reproduction of the
`regression_watch` named-class line, not a re-argument of the holdout.

## The read to reproduce

The synergy holdout (`evidence/2026-11-12/sim-synergyholdout-b.md`,
16 fresh seeds 190509–190524, before `fed635f1f` → after `ad2bd13fd`)
adjudicated its two judged signals as 8-seed noise, but its compare
came back `review_required` on two `regression_watch` rows. One of
them was the player named-class line:

- **Player named-class access (`classAccess`): 0.8125 → 0.625
  (13/16 → 10/16 seeds with a player class), delta −0.1875,
  95% exploratory interval [−0.375, 0], status `regression_watch`.**
  Source: `evidence/2026-11-12/synergyholdout-b-panel-compare.json`,
  competent policy, 16 paired cases.
- The holdout judged it trajectory noise ("the scholar's godpath
  recognition depends on which fights and offers the divergent
  trajectory serves up"), worth one line in the next synergy
  follow-up. This arm is that line.

History of the same row: the discovery arm
(`evidence/2026-11-12/sim-synergydisc-b.md`, 8 seeds 190501–190508)
read 0.875 → 0.75 (7/8 → 6/8), also a watch, never a signal. So the
row has been a watch twice, a signal never.

## Scorecard rule (the judge for this line)

`scripts/lib/balance-scorecard.js` `compareMetric`, contract
`scripts/balance-metrics.json`: `classAccess`, direction `higher`,
tolerance 0.02, minimum pairs 8. Status is `regression_signal` iff
delta < −0.02 **and** the 95% bootstrap interval lies entirely below
zero (upper bound < 0); `regression_watch` iff delta < −0.02 but the
interval crosses or touches zero; `no_material_signal` otherwise.
The holdout's interval touched zero at its upper bound, hence watch.

## Legs (pinned SHAs — verified before writing this prereg)

- Before leg: `fed635f1f` (pre-synergy master).
- After leg: `ad2bd13fd` (synergy tip).
- Verification (this run, before writing this prereg):
  `git diff fed635f1f ad2bd13fd --stat -- src/` →
  `src/js/game.js | 92 ++++...` — exactly **+92/−0, one file**
  (`dawnSynergyResonance()` plus its `endDay()` hook). Both SHAs
  exist in this worktree.
- Current tip `bd29d8bd7` is NOT used as the after leg: it also
  carries journey r133's preserver-cap game.js change, stallcut
  fixes, and adoption-round landings, which would confound any move
  — a signal there could not be attributed to the synergy change.
  The read to reproduce is the synergy before/after, so the legs
  are the holdout's legs on a fresh band.

## Primary metric + GO threshold (binds the run)

Primary metric: the `classAccess` row status in the
`scripts/balance-panel.js compare` verdict on the fresh 8-seed pilot
band (before panel
`evidence/2026-11-12/regresswatch-b-panel-before`, after panel
`evidence/2026-11-12/regresswatch-b-panel-after`, compare
`evidence/2026-11-12/regresswatch-b-panel-compare`).

- **SIGNAL (GO for confirm) iff the pilot compare flags
  `classAccess` with status `regression_signal`.**
- **NO-GO (noise) iff the row reads `regression_watch` or
  `no_material_signal`.** A watch on a fresh 8-seed band is the
  same trajectory-noise pattern the holdout already adjudicated:
  stop there, do NOT run a 12–16 seed confirm on noise.
- The overall compare decision (`review_required` vs
  `no_material_signal`) is NOT the judge — only the `classAccess`
  row is. Other rows' signals are reported in the evidence file,
  not re-scored into the verdict.

Confirm (only on pilot GO): extend the SAME band with seeds
190533–190540 and re-run both legs as a 16-seed compare. Confirm
verdict: signal iff the 16-seed `classAccess` row reads
`regression_signal`; watch or no-signal on 16 seeds = noise, and
the pilot signal is recorded as an 8-seed artifact.

## Band + freshness (verified by this arm)

- Pilot band: seeds **190525–190532** (8 seeds), competent policy
  only, 150d death-aware. Confirm extension, if owed: 190533–190540.
  No other seeds, no other policies.
- Horizon reason (§10): reachability lever (waves 4–5, national,
  table) → 150d; death-aware stop, +10d tail max. Same horizon as
  the discovery and holdout arms, so the three reads are comparable.
- Freshness check (this arm, per the seed-band-freshness skill):
  - `grep -rhoE "19052[0-9]|19053[0-9]|19054[0-9]"
    evidence/*/sim-*-prereg.md` → only **190524** (the holdout
    band's endpoint; 190509–190524 used in full).
  - Same pattern over `evidence/*/sim-*.md` → only 190520, 190521,
    190523, 190524 (all inside the holdout band).
  - `grep -rlE "19052[5-9]|19053[0-9]|19054[0-9]" evidence/
    --include="*.md"` → **0 files**: no .md anywhere in evidence/
    names 190525–190540.
  - Full `evidence/` md+json sweep for `1905xx` (background grep,
    completed before this prereg's commit): tokens 190525–190540
    appear ONLY as float fragments inside old Oct 17–23 narrative
    corpora (e.g. `fd` 0.2602857142857143, `16741.190525`,
    `1905434728`); the files' own `seed` fields read 6102, 6108,
    64205 — none names 190525–190540 as a seed. No reservation.
  - The `grep -rl` file list for 19052[5-9]|19053|19054 is those
    same Oct 17–23 corpora plus storageshed/panel-b2 case JSONs
    (float fragments again). No forbidden/contaminated band list
    exists; the Oct 26–27 preregs naming "forbidden" carry no
    1905xx reservation.
  - Prior bands in this range: discovery 190501–190508, holdout
    190509–190524. Band 190525–190540 is fresh.

## Method

- Both legs through `scripts/balance-panel.js` (competent only,
  `--seeds <csv> --days 150 --par 2`, under `setsid` per the
  holdout precedent).
- Pinned-SHA legs: verify `git status --short` is empty, `git
  checkout <sha>` (detached), run the panel, `git checkout
  sim-regresswatch-b` before writing evidence or committing. Never
  checkout with uncommitted work.
- Commit ONLY `panel.json.gz` + the compare `.md`/`.json` — NEVER
  commit the `cases/` cache (delete it at closeout).
- Wall numbers (national / table / wins, wave 4–5 reach, median
  survival) reported on both legs in the evidence file.
- SENSE-TESTING LAW: sample the flagged row per seed (which seeds
  lost the player class, and whether the loss tracks a mechanism
  or a divergent trajectory — different fights/offers serving a
  different godpath recognition) and judge meaning/coherence,
  never just counts.
- Write-flap probe before any write that matters:
  `git update-ref refs/heads/probe HEAD` then delete the probe ref.
  Probe passed at prereg time. If it ever fails, stop writing,
  heartbeat, wait, report BLOCKED-ON-FLAP.

## Proof plan

- `scripts/test-regresswatch-b.js` (new): asserts the prereg from
  the committed corpora — the compare's `classAccess` row status
  and values match the evidence file's claim, and both panels carry
  8 (or 16, if confirmed) paired competent cases. Green on the
  branch.
- Telemetry deviation check:
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current '<per-seed-evidence-glob>' --metrics national,table,
  wins,exiled`. If the tool refuses the panel corpus (as in prior
  runs), record the refusal, don't waive it.

## Metric review

(Filled at run end. No metric re-scored mid-run.)
