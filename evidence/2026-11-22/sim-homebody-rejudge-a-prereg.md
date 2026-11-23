# sim-homebody-rejudge-a — PREREG (frozen)

**Arm:** sim-homebody-rejudge-a · **Loop A run:** fleshout-20261123T0215Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall)
**Type:** LEVER RE-JUDGE (one game-code change + instrument, two-leg
contrast: ctl vs armed) · **Base master:** `a4603add1` (worktree
`~/workspace/worktrees/sim-homebody-rejudge-a`, branch
`sim-homebody-rejudge-a`)
**Frozen:** 2026-11-23 ~02:50 UTC, before any judged run. No judged
run has run.

## 0. Why a re-judge (read first)

The 2115Z arm (sim-homebody-a, evidence
`evidence/2026-11-22/sim-homebody-a.md`) was **INCONCLUSIVE**: the
control leg launched only 4 wave-4+ parties in 8 seeds (all on one
seed, 107423), below the frozen 5-launch floor, so the zero-launch
rule fired; the primary bar also missed (armed 5 vs control 4 = +1,
bar +4). But the mechanism demonstrably works (2 handoff calls, 1
Dale-class conversion on 107429 d146, homebody holds 5 → 0,
selected-blocked share 0.417 → 0). One caveat: the single conversion
went out SOLO (party `[]`) — the handoff does not guarantee
companions follow. The lever (commit `e62603af0` on held branch
`sim-homebody-a`) was REVERTED, not landed.

Per MEASUREMENT.md §14a this is a **METRIC-BROKEN** kill, not a
concept kill: the fixed +4 bar assumed a livelier funnel than the
band has (~4 launches / 8 seeds, all on one seed) and was nearly
unmeetable by any depart-time lever. A re-judge is therefore a NEW
run with a corrected pre-registration — not a re-score of the 2115Z
run. The corrections (frozen below): (a) the primary bar is set
against the measured control base rate, as a relative gain on this
band's actual control leg; (b) the Dale-class bar distinguishes
SOLO vs PARTY conversions; (c) the band doubles to 16 seeds.

## 1. The lever (re-applied, verified)

Cherry-pick `-n` of held commit `e62603af0` (branch
`sim-homebody-a`) into this worktree, verified by `git diff
--cached --stat`: exactly 3 files, 159 insertions / 3 deletions —
identical to the held commit's own stat:

- `src/js/win-plan.js` (+129): `winPlanHomebodyHandoff` — a range-0
  holder's wave-4+ plan moves to a walkable companion at depart
  time; the homebody stays home, the plan moves.
- `src/js/villager-brain.js` (+13): the two call sites (brain path
  `vbrainExecuteDepart`, no fill; `winPlanDepart` path, fill).
- `docs/ONTOLOGY.md` (1 line): the provides-line entry for the new
  method (required by `validate-ontology.js`).

Correction to the task brief: the brief said the held commit
"carries the old prereg/analyzer/driver/proof test" — it does not.
`git show e62603af0 --stat` proves the commit touches only the
three files above. The instrument (driver
`scripts/homebody-driver-a.js`, analyzer
`scripts/analyze-homebody-a.js`, panel builder
`scripts/build-homebody-panels-a.js`) is already on master and is
reused unchanged. The proof test is brought in separately (below).

Proof test: `git show sim-homebody-a:scripts/test-homebody-handoff-a.js
> scripts/test-homebody-handoff-a.js` (409 lines, `node --check`
clean). ONE adaptation, frozen here: §C hardcodes
`BASE = 'f2d03db92'` (the 2115Z base tip). This run's pre-lever code
is HEAD `a4603add1`, so the constant is updated to `a4603add1` —
the old-code control must be THIS run's base, not the 2115Z base.
Everything else in the test is verbatim from the held branch.

## 2. The question (unchanged from sim-homebody-a)

Does handing a range-0 holder's wave-4+ plan to a walkable companion
at depart time convert held dawn commits into real wave-4+
departures — departures with companions, not solo walkouts —
without starving the village harder or shortening survival?

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107431–107446 (16 seeds).** Verified before this prereg
  by this arm (not taken from the coordinator's check):
  - `grep -rn "10743[1-9]|10744[0-6]" evidence/ --include='sim-*.md'
    --include='sim-*-prereg.md'` — the ONLY hit is
    `evidence/2026-11-22/sim-launchfield-rejudge-b-prereg.md`,
    where `107435`/`107438` appear as `pantryFreshAfter` VALUES
    (non-seed numbers), explicitly inspected and dismissed in
    that prereg. No seed, band naming, or reservation.
  - `grep -rn ... evidence/ --include='*.json' -l` — 10 October
    files, all the same false-positive class (pantry kcal,
    `trajHash` hex, floating-point decimals); none is a seed
    corpus for this band.
  - `find evidence/ -name '*10743*' -o -name '*10744*'` — only
    `fightorigin-b-insideevening-s10743.json` /
    `s10744.json` (Oct-29 raidname corpus), which are seeds
    **10743** and **10744** (5-digit), not 107431–107446. No
    collision.
  - `grep -rn "107431|107432" ~/memory/*.md` — 0 hits.
  - Prereg band declarations across all dates: the highest named
    band is 107423–107430 (sim-homebody-a). Nearest used bands:
    107375–107382 (needwave-a), 107383–107390 (refreeze-b),
    107391–107398 (needwave-b), 107399–107406 / 107407–107414 /
    107415–107422 (launchfield-rejudge-b screens), 107423–107430
    (homebody-a). Forbidden bands from prior briefs do not
    overlap.
- **No collision; no shift needed.** The suggested band stands.

## 4. Instrument (frozen design — reused from master, unchanged)

- Driver `scripts/homebody-driver-a.js` (unchanged): RUN stays
  `homebody-a` (the filename shape
  `homebody-a-s<seed>-homebody-a-<mode>.json` is hardcoded and the
  panel builder reads it); the legs are distinguished by OUTDIR:
  `perseed-homebody-rejudge-a-ctl` / `perseed-homebody-rejudge-a-arm`
  under `evidence/2026-11-22/`. Substrate, horizon, policy as §6.
- Analyzer `scripts/analyze-homebody-a.js` (unchanged): reads both
  legs' per-seed JSONs. **IMPORTANT — judge vs instrument:** the
  analyzer's own `bars`/`verdict` fields encode the 2115Z bars
  (primary +4 absolute, Dale ≥ 1 any conversion). Those fields are
  NOT the judge for this run. The re-judge verdict is computed in
  the evidence file from the analyzer's RAW numbers
  (`ctl/arm.launches`, `armHandoffsDetail` for party sizes,
  `starvDeaths`, `medianSurvival`, `det`, `wall`) against the
  frozen bars in §7 below. The analyzer's verdict is reported as a
  cross-check only, and any divergence is explained.
- Panel builder `scripts/build-homebody-panels-a.js` (unchanged):
  `--before evidence/2026-11-22/perseed-homebody-rejudge-a-ctl
  --after evidence/2026-11-22/perseed-homebody-rejudge-a-arm
  --seeds 107431,...,107446 --out
  evidence/2026-11-22/homebody-rejudge-a-panel`; then `node
  scripts/balance-panel.js compare` and attach the compare `.md`.
  The panel is the instrument, the frozen bars below are the judge.
- Proof test `scripts/test-homebody-handoff-a.js` (brought from the
  held branch, §C base adapted to `a4603add1`, §1): 100% required
  before the band; the handoff assertions MUST fail on old code
  (§C child mode) and pass on new code.

## 5. Leg order (frozen — lever is staged, not committed)

The lever is cherry-picked but UNCOMMITTED in this worktree. The
ctl leg must run on old code, so:

1. `git stash push -- src/js/win-plan.js src/js/villager-brain.js
   docs/ONTOLOGY.md` (staged lever only; the proof test is
   untracked and stays). Verify `grep -c winPlanHomebodyHandoff
   src/js/win-plan.js` is 0 and record the sha256 of both files.
2. Run the ctl leg (16 seeds, 2 processes × 8 seeds).
3. `git stash pop`. Verify the method is back (`grep -c` ≥ 1) and
   record the shas again — they must match the pre-stash armed
   shas.
4. Run the arm leg (16 seeds, 2 processes × 8 seeds).
5. The analyzer's anchor check (`--ctl-winplan/--ctl-brain/
   --arm-winplan/--arm-brain` from the per-seed JSONs'
   `winplanSha`/`brainSha`, which are content shas, not commits)
   proves which code each leg ran on. `anchorCommit` is
   `a4603add1` on both legs (the lever is uncommitted); the file
   shas are what differ.

## 6. Definitions (frozen — same as sim-homebody-a §6 unless noted)

- **Wave-4+ launch:** a `v4departs` row with result `launch` and
  (plan.needWave ≥ 4 OR plan.target a wave-4+ species).
- **Wave-4+ launches (PRIMARY):** the COUNT of wave-4+ launches
  across the 16 seeds. Holds are counted separately, never as
  launches.
- **Dale-class conversion:** a `handoffs` row with result
  `'launch'` whose `oldHolderMaxD` is 0.
- **PARTY conversion (NEW — bar 4):** a Dale-class conversion
  whose handoff row's `party` has length ≥ 1 — the new leader
  departs with at least one companion. A **SOLO conversion**
  (party `[]`) is reported separately and does NOT satisfy bar 4
  alone.
- **Selected-blocked share (reported, not judged):** as before
  (control-leg wave-4+ `party_launch` depart rows with result
  `'hold'` whose holder profile is `homebody`, over all
  control-leg wave-4+ depart rows).
- **Starvation death:** a `deaths` row whose kind or cause matches
  /starv|hunger/i.
- **Median survival:** median of per-seed `gameDays`.
- **First-handoff day (det-gate bound):** per seed, the earliest
  `handoffs` day on the armed leg. The ctl leg must record zero
  handoff rows on all 16 seeds.
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `PROFILEGATE4` unset.
- **Horizon:** 150d death-aware (reachability lever, waves 4–5;
  MEASUREMENT.md §10). **Seeds:** 107431–107446 (16).

## 7. Frozen bars (judge: the evidence file, from the analyzer's raw numbers)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — homebody proof test 100% (fails on old code via §C against `a4603add1`, passes on new); homebody analyzer `--selftest` 100%; 0 instrument errors on all 32 seed files (16 ctl + 16 arm) | all must hold |
| 2 | **Det-gate** — ctl leg records 0 `handoffs` rows on all 16 seeds; for each seed, every recorded event stream is byte-identical between legs for rows with day < the armed leg's first-handoff day; the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — wave-4+ launches, RELATIVE** — armed ≥ ceil(1.5 × control). At the measured 2115Z base rate (4 launches / 8 seeds = 0.5/seed) the expected control on 16 seeds is ≈ 8, so this bar is ≈ 12 (+4) at the expected base — the old absolute bar, but scaling with the ACTUAL control leg instead of assuming it. The absolute floor is the zero-launch rule below. | must hold for GO |
| 4 | **PRIMARY — Dale-class PARTY conversion** — at least one `handoffs` row with result `'launch'`, `oldHolderMaxD` 0, AND `party` length ≥ 1. Solo conversions are reported separately and do NOT satisfy this bar alone. | must hold for GO |
| 5 | **GUARDRAIL — starvation** — total starvation deaths armed ≤ control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 6 | **GUARDRAIL — survival** — median survival armed ≥ 0.8 × control median | must hold for GO |
| 7 | **NO-GO rule** — any of bars 3–6 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14); det-gate failure (bar 2) → NO-GO on instrument grounds (the legs are not comparable) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if EITHER leg sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO).

GO = all seven bars pass. GO means: the handoff converts held
range-0 wave-4+ plans into real departures WITH companions (≥50%
more launches than control, ≥1 party conversion) and costs nothing
on the starvation/survival guardrails. NO-GO = any bar missed; the
evidence says which, with the §14a kill classification
(CONCEPT-DEAD vs METRIC-BROKEN vs SUBSTRATE-MISSING), and the
game-code change is reverted zero-trace per kill protocol
(instrument + evidence kept).

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-homebody-handoff-a.js` → 100% on NEW code (its
  handoff assertions FAIL on old code via §C against
  `a4603add1`); `node scripts/analyze-homebody-a.js --selftest`
  → 100% — all before any judged run.
- **Band (judged):** 16 seeds, **107431–107446**, horizon 150d
  death-aware, competent verbatim policy, two legs (ctl on old
  code via the §5 stash, arm on new code after the pop). Same
  driver, same substrate, identical seeds.
- **Per-launch tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-homebody-rejudge-a-ctl` and
  `evidence/2026-11-22/perseed-homebody-rejudge-a-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read handoff lines + departure beats from both
  legs (verbatim `beatLines` where captured): does a converted
  launch read as a real party setting out, with the transfer
  named — and do companions actually follow?
- **Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (wave
  gates, readiness bars); docs/MEASUREMENT.md §§9–12, 14–15 read.
  **No canon doc covers who leads a wave-4+ villager party or what
  happens when the holder cannot walk** — said here rather than
  inventing canon. The rule is code-derived (see sim-homebody-a
  prereg §3).

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
