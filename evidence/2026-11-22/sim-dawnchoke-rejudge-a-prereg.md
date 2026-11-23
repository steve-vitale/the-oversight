# sim-dawnchoke-rejudge-a — PREREG (frozen)

**Arm:** sim-dawnchoke-rejudge-a · **Loop A run:** fleshout-20261123T0215Z
**Axis:** scale-onramp (converging, NOT converged) · **Blank:** re-judge of
the forager-companion lift from run fleshout-20261122T2115Z
(evidence/2026-11-22/sim-dawnchoke-a.md)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs armed) —
RE-JUDGE, not a new lever
**Base master:** `a4603add1` (worktree
`~/workspace/worktrees/sim-dawnchoke-rejudge-a`, branch
`sim-dawnchoke-rejudge-a`)
**Frozen:** 2026-11-23 ~02:30 UTC, before any judged run. No judged run
has run under this prereg.

## 1. The question

The 2115Z arm (sim-dawnchoke-a) found attempts 12 → 57, launches 4 → 36,
2 of 3 stuck plans departed — but verdict NO-GO on the det-gate ONLY: the
analyzer's bound detector was written for a different fix shape
(profile-gate) than the DIAG-driven fix (companion gate in
findCompanion), so the bound never fired; and the §15 panel fired a
REGRESSION signal on total village deaths (+10.75/run) that the frozen
guardrails did not gate. The lever (commit `4ac23b12f` on held branch
`sim-dawnchoke-a`) was REVERTED, not landed. This arm re-judges the
SAME lever with the two defects corrected: a shape-agnostic det-gate
bound, and a total-deaths guardrail priced in as a frozen bar.

## 2. The lever (unchanged from 2115Z)

Commit `4ac23b12f` retires the `PROFILEGATE4` env gate: for a holder
whose plan targets wave 4+ (`needWave >= 4`), `findCompanion` now admits
a **forager**-profile companion (trust ≥ 15, at Haven, not away/engaged/
out) in addition to wanderer/explorer. Homebodies stay out (range 0).
No plan, or a wave-3 plan, keeps the old gate. The change is in
`findCompanion` in both `villager-brain.js` and `win-plan.js`; the env-var
reader `profilegate4On()` is deleted from both files. This arm
cherry-picks ONLY the src/js hunks from `4ac23b12f` — NOT the whole
commit (it carries the old prereg/analyzer/driver/proof test). Verified
with `git diff` that only the lever hunks are applied.

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave 4 gate:
  standing ≥ 100 + readiness bars; wave 5: standing ≥ 200 AND wave-4
  faced). **No canon doc covers who leads a villager party, how a dawn
  departure is attempted, or the profile gate** — said here rather than
  inventing canon. The rule below is code-derived (see 2115Z prereg §2,
  unchanged).

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107423–107430 (8 seeds).** SAME band as the 2115Z arm — this is
  a re-judge of the same lever on the same seeds, so the band is reused
  deliberately, not fresh; the 2115Z prereg §3 verified it fresh before
  that run (zero hits in evidence/2026-11-22 filenames and contents,
  evidence/2026-11-21 contents, ~/memory/2026-11-*.md; nearest used
  bands 107375–107382, 107383–107390, 107391–107398, 107399–107406,
  107407–107414, 107415–107422). Reuse is the point: identical seeds
  make the re-judge comparable to the 2115Z numbers.
- Corpora live in NEW directories so the 2115Z corpora are untouched:
  `evidence/2026-11-22/perseed-dawnchoke-rejudge-a-ctl` and
  `evidence/2026-11-22/perseed-dawnchoke-rejudge-a-arm`. The driver
  filename shape is unchanged (`dawnchoke-a-s<seed>-dawnchoke-a-<mode>.json`,
  RUN=dawnchoke-a — the analyzer and panel builder hardcode it).

## 4. Instrument (frozen design — corrections vs 2115Z)

- `scripts/dawnchoke-driver-a.js`, `scripts/build-dawnchoke-panels-a.js`:
  reused from master UNCHANGED (already landed there).
- `scripts/test-dawnchoke-a.js`: brought into this tree from the held
  branch (`git show sim-dawnchoke-a:scripts/test-dawnchoke-a.js`) —
  lever-specific proof test, 100% required before the armed band; it
  MUST fail on old code (no depart call) and pass on new code. Its §C
  old-code base is the frozen `f2d03db92` (pre-lever code; the lever was
  reverted on master, so old-code behavior is identical there).
- `scripts/analyze-dawnchoke-a.js`: CORRECTED in this arm (instrument
  change, lands with the evidence either way). Two mandatory fixes:
  - **(a) Shape-agnostic det-gate bound.** Per seed the bound is
    `min(firstExtraDepartDay, firstDivergenceDay)` where
    `firstExtraDepartDay` is the earliest day the armed leg records a
    brain-path depart call (wave-4+ plan) for a (vid, day) with NO
    control-leg brain depart call for that vid that day, and
    `firstDivergenceDay` is the earliest day any recorded event
    stream's per-day row multiset differs between legs. The det-gate
    passes iff: (i) the control leg records 0 first-release rows
    (forager/homebody holder, staged wave-4+ plan, no `party_launch`
    commit — the old definition, kept as a control-side check); (ii)
    every recorded stream is identical for rows with day < bound
    (verified independently of the bound computation); (iii) the
    first divergence is lever-attributable: either there is no
    divergence at all, or `firstDivergenceDay ==
    firstExtraDepartDay` (the first thing that differs is the day the
    lever first fires an extra depart call). A stream diverging
    BEFORE any extra depart call fails the gate.
  - **(b) Anchors actually verified.** The analyzer takes
    `--ctl-anchor --arm-anchor` (expected `anchorCommit`, full or
    12-char prefix) and `--ctl-brain --arm-brain --ctl-winplan
    --arm-winplan` (expected file-content shas from the per-seed
    JSONs). Every supplied expectation is compared against EVERY
    per-seed file; a missing expectation is a FAILED check
    (`checked: true, pass: false`), never the vacuous
    `checked: false` the 2115Z analyzer returned. The det-gate bar
    includes the anchor check passing.
  - **(c) Total-deaths guardrail (new bar 8).** Armed mean total
    village deaths per run ≤ control mean + 5. The 2115Z panel showed
    +10.75/run, so this bar is a real test, not a rubber stamp.
    Deaths-per-extra-launch is reported as a diagnostic.
- Panel builder `scripts/build-dawnchoke-panels-a.js` with
  `--before/--after` pointing at the re-judge corpora and
  `--out evidence/2026-11-22/dawnchoke-rejudge-a-panel`; `node
  scripts/balance-panel.js compare` run and its compare `.md`
  attached to the evidence file. The panel is the instrument, the
  frozen bars below are the judge.

## 5. Definitions (frozen — unchanged from 2115Z prereg §5)

- **Wave-4+ plan:** `needWave >= 4` OR a target that is a wave-4+
  species (same OR definition as leadgate-a §8 / needwave-a §5).
- **Staged plan:** stage `party`, `hunt`, `standing`, or `table`.
  A **staged-plan day** is a planCensus day-row for a living, at-Haven,
  not-on-expedition holder of a staged wave-4+ plan.
- **Departure ATTEMPT:** a `departCalls` row with source `brain`
  whose plan at call time is wave-4+. Result `launch`/`hold`/`normal`
  all count; `launch` alone is the departure.
- **Choke day / choke rate, STUCK plan, stuck plan departs,
  starvation death, median survival:** as 2115Z prereg §5 (stuck =
  ≥ 7 distinct staged census days on the CONTROL leg with ZERO
  departCalls rows for that vid across the whole control run).
- **Total village deaths:** per-seed `deaths` array length, summed
  across the 8 seeds; the guardrail compares the MEAN per run.
- **Deaths per extra launch (diagnostic):** (armed total deaths −
  control total deaths) / (armed launches − control launches);
  null when launches do not rise.
- **First-release day (old bound, kept only as the control-side
  check):** per seed, the earliest arm-leg `departCalls` row for a
  forager/homebody-profile holder with a staged wave-4+ plan and no
  `party_launch` commit today. The ctl leg must record zero such rows
  on all 8 seeds.
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `HYPOFLOOR` unset. Horizon 150d,
  death-aware.

## 6. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — needwave proof test re-run green on this base; dawnchoke proof test 100% (fails on old code, passes on new); dawnchoke analyzer `--selftest` 100% (including the new bound + anchor cases); 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate (CORRECTED)** — ctl leg records 0 first-release rows on all 8 seeds; every recorded event stream (`departCalls`, `scorePicks`, `v4departs`, `planSeeds`, `v4fights`, `planCensus`, `dawnPool`, `needWaveCopies`, `departBeats`, `reseedBeats`, `beatLines`, `volleyEvents`, `prizeEvents`, `grantEvents`, `contestEvents`, `deaths`) is identical between legs for rows with day < the shape-agnostic bound (§4a); the first divergence is lever-attributable (first divergence day == first extra depart call day, or no divergence); anchor checks pass with the expected anchor/sha values actually supplied and compared | all must hold |
| 3 | **PRIMARY — wave-4+ departure attempts** — armed attempts >= control attempts + 4 on 8 seeds | must hold for GO |
| 4 | **PRIMARY (second half) — a stuck plan departs** — at least one control-STUCK (seed, vid) actually departs on the armed leg (§5) | must hold for GO |
| 5 | **SECONDARY — launches** — armed wave-4+ launches >= control (reported; a rise in attempts that never becomes a launch is a hollow win, named in the evidence, not re-scored) | reported, not judged |
| 6 | **GUARDRAIL — starvation** — total starvation deaths armed <= control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 7 | **GUARDRAIL — survival** — median survival armed >= 0.8 x control median | must hold for GO |
| 8 | **GUARDRAIL — total deaths (NEW)** — armed mean total village deaths per run <= control mean + 5 | must hold for GO |
| 9 | **NO-GO rule** — any of bars 2, 3, 4, 6, 7, 8 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14) | frozen |

**Zero-attempt rule (frozen, no re-scoring):** if BOTH legs see
fewer than 5 wave-4+ departure attempts, there is nothing to
attribute and the verdict is **INCONCLUSIVE** (not GO, not
NO-GO) — the evidence says so and names the next step (a wider
band, or a substrate check on why attempts are absent). A miss
is NO-GO, never re-scored against a friendlier metric mid-run
(§14).

GO = all bars pass. GO means: the dawn tick now attempts
departure for staged wave-4+ holders, at least one previously-stuck
plan actually departs, the legs are demonstrably comparable under a
shape-agnostic bound with verified anchors, and it costs nothing
beyond the frozen death bars on the starvation/survival/total-deaths
guardrails. NO-GO = any bar missed; the evidence says which, and
the game-code change is reverted zero-trace per kill protocol
(instrument + evidence kept).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-needwave-a.js` → green on this base;
  `node scripts/analyze-dawnchoke-a.js --selftest` → 100% —
  all before any judged run.
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit (lever stashed, old code on disk); the game-code change
  is committed next (proof test green first); the arm leg runs
  AFTER it. The analyzer is run with the expected anchors/shas
  for both legs (ctl anchor = HEAD at ctl-run time, arm anchor =
  HEAD at arm-run time, i.e. the lever commit; brain/winplan shas
  read from the per-seed JSONs themselves).
- **Per-seed tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-dawnchoke-rejudge-a-ctl` and
  `evidence/2026-11-22/perseed-dawnchoke-rejudge-a-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read the departure lines for a converted
  launch (verbatim `beatLines` where captured): the morning must
  say something (Steve's no-silent-actions law).
- **Expected 2115Z comparison:** the judged numbers should
  reproduce the 2115Z arm (attempts 12 → 57, launches 4 → 36,
  2/3 stuck departed) within run-to-run noise on identical seeds
  and substrate — the base moved since 2115Z, so exact equality
  is NOT expected; any large deviation is investigated before
  verdict.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
