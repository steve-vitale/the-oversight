# sim-nightcarry-a — RESUME PREREG (frozen update)

Run: Loop A `fleshout-20261117T060712Z` (coordinator), axis scale-onramp,
arm `sim-nightcarry-a` RESUMED as `sim-nightcarry-resume`, worktree
`~/workspace/worktrees/sim-nightcarry-resume`. Resumes the INCOMPLETE arm
from Loop A `fleshout-20261117T0215Z` (evidence
`evidence/2026-11-17/sim-nightcarry-a.md`). The BINDING prereg remains
`evidence/2026-11-17/sim-nightcarry-a-prereg.md` — this file restates its
bars, records the re-application + D1 result, and freezes the resume's
directories. Nothing in the frozen GO bar changes.

## Lever re-application (verified, not blind checkout)

- Base: master `9f7d0522e` (worktree tip at resume start). Lever source:
  commit `00fb5745a` (`src/js/villager-brain.js`, +118 lines).
- Applied as hunks only: hunks 1–3 (`nightcarryOn` + `companionStillEligible`,
  `writeCommit` carried fields, `vbrainScorePick` carry hook) applied clean
  via `git apply`; hunk 4 (carried departure voice line) applied by hand at
  its original anchor (`this.startExpedition(c.companion, ...)`), because
  the companionguard block (commit `1ef267b8b`, landed since) now sits
  between the anchor and the VETREENGAGE block.
- Verification: `node --check` passes; `git diff --no-index` of the
  re-applied file vs `00fb5745a:src/js/villager-brain.js` shows ONLY the
  companionguard change and its knock-on lines — no lever code lost, no
  guard clobbered. `grep COMPANIONGUARD` present in both
  `src/js/villager-brain.js:1177` and `src/js/villager-agency.js:485`.
  `git diff --stat`: `src/js/villager-brain.js +118` only.
- Proof test `scripts/test-nightcarry-a.js` re-run on this tip (lever-present
  mode, mode-aware per sim-proofadapt-a): **65/65 green** — the armed probe
  legs, old-code-fails control, bound + hunt legs, and D1/D2 all pass on
  the re-applied tip.

## D1 — DRIFTED (control leg must be re-run fresh)

Re-ran committed control seed 103101 on this tip (MODE=control,
`perseed-nightcarry-resume-d1/`, anchor `9f7d0522e`, policy sha
`df9b7dff4de4` unchanged):

| field | committed control (base 5d5293972, anchor 00fb5745a) | D1 re-run (tip 9f7d0522e) |
|---|---|---|
| days / endReason | 150 / survived | 150 / survived |
| standing / scaleRank | 465 / regional | 199 / regional |
| maxWave | 5 | 4 |
| deaths | 99 | 38 |
| v4seeds / v4departs / v4gates / v4encounters | 32 / 42 / 27 / 21 | 0 / 0 / 0 / 0 |
| nightcarrySkips | 47 | 0 |
| dawnbidScores / dawnbidDeparts / dawnbidCensus | 151 / 65 / 107 | 0 / 0 / 0 |

First population divergence day 17. The re-run village survives with
far fewer deaths but forms ZERO wave-4 plans — the subject itself
vanished on this seed. Substrate drift, not a lever effect: between
`5d5293972` and `9f7d0522e`, `src/` changed in `conversation.js` (+70/-),
`convo-dialogue.js`, `convo-wants.js`, `villager-agency.js`
(companionguard), `villager-brain.js` (companionguard), `build.js`.
Per the task instruction, the ON leg is NEVER judged against a control
leg on an old base: the FULL control leg (8/8) is re-run fresh on this
tip and the verdict rests on that fresh within-tip contrast.

## Band (restated + search scope)

- Band: seeds **103101–103108**, 150d death-aware, competent verbatim
  (`scripts/policies/competent.js`, sha `df9b7dff4de4`). PARTIALLY SPENT
  by this arm's own adopted control leg (6/8, base 5d5293972) — reuse
  authorized by the adopted resume instructions; the adopted corpora are
  now SUPERSEDED as the baseline by the fresh control leg on this tip
  (kept in the repo as the old-base record, never mixed into the verdict).
- Freshness re-check at resume start: `rg "10310"` over
  `hidden_files/lever-claims/` — no live claim file names a 10310x band
  (live claims: `fleshout-20261117T0015Z.json`,
  `fleshout-20261117T060712Z.json` — the latter is this coordinator run's
  own claim). Sibling arm `sim-reattach-a` runs in parallel — its files
  and band are not touched. The original prereg's full-`evidence/`
  freshness search (zero `"seed": 10310x` reservations) still stands;
  this resume adds no new band.
- Directories (distinct from the adopted files, per the task):
  fresh control `evidence/2026-11-17/perseed-nightcarry-resume-control/`,
  ON leg `evidence/2026-11-17/perseed-nightcarry-resume-on/`,
  D1 scratch `evidence/2026-11-17/perseed-nightcarry-resume-d1/` (seed
  103101 only, kept as the drift record).

## Frozen GO bar (restated verbatim from sim-nightcarry-a-prereg.md)

- **Primary:** launched wave-4+ instances (any-commit), armed leg ≥
  control leg **+ 2 instances**.
- **Secondary:** carried commits converting to launches ≥ **25%** of
  carried commits.
- **Cost bars (all must hold):** deaths/run within **+2** of control;
  median survival ratio ≥ **0.9**; starvation deaths within **+2**
  (arm-only, B3 method).
- **Subject-viability floor (pre-stated, NOT a re-score):** if control +
  armed instances opened total **< 4**, the pilot is **UNJUDGEABLE**
  (vacuous subject — wave-4+ plans never form), the lever stays untested
  pending a plan source (a coordinator decision), NOT a lever NO-GO.
- A miss on primary, secondary, or any cost bar is NO-GO, never
  re-scored against a friendlier metric mid-run.

## Instruments (unchanged from the frozen prereg)

- Driver `scripts/nightcarry-driver-20261117.js` (unchanged; MODE env
  flips the lever only). Analyzer `scripts/analyze-nightcarry-a.js`
  (unchanged; output renamed to `nightcarry-resume-analysis.json` after
  the run so the adopted arm's namespace stays clean). Panel builder
  `scripts/build-nightcarry-panels-20261117.js` (`--before/--after/--out`
  pointed at the resume dirs). Drift check
  `scripts/vetparty-drift-check.js` (control vs ON corpora).
- Proof: `scripts/test-nightcarry-resume.js` (new — resume proof:
  lever hunks byte-identical to `00fb5745a` modulo companionguard
  context, companionguard intact, fresh-leg corpora show carries on the
  ON leg and none on control, carried departure line present in ON
  transcripts) + the re-run `scripts/test-nightcarry-a.js` 65/65 above.
