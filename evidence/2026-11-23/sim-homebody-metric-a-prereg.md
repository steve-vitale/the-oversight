# sim-homebody-metric-a — PREREG (frozen)

**Arm:** sim-homebody-metric-a · **Loop A run:** fleshout-20261123T0815Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall)
**Type:** LEVER RE-JUDGE WITH CORRECTED METRIC (one game-code change +
instrument, two-leg contrast: ctl vs armed) · **Base master:** `80e7da0bc`
(worktree `~/workspace/worktrees/sim-homebody-metric-a`, branch
`sim-homebody-metric-a`; verified equal to the main tree's master tip
2026-11-23)
**Frozen:** 2026-11-23 ~09:05 UTC, before any judged run. No judged
run has run.

## 0. Why this run (read first)

The 0215Z re-judge (sim-homebody-rejudge-a, evidence
`evidence/2026-11-22/sim-homebody-rejudge-a.md`, commit `3fd09decc`)
found the mechanism works — Dale-class conversions 0 → 2, both WITH
parties (a trio and a pair; 0 solo), homebody holds 36 → 0, control
51 launches vs armed 56 on 16-seed band 107431–107446, 150d,
competent — but the frozen bar 3 was METRIC-BROKEN: it demanded
≥ ceil(1.5 × 51) = 77 launches, calibrated to an expected base of
~8 against an actual control base of 51, i.e. +26 — nearly all
walker launches the handoff cannot touch. Verdict NO-GO §14a
METRIC-BROKEN; the lever was reverted and stays on held branch
`sim-homebody-a` (commit `e62603af0`).

Per MEASUREMENT.md §14a this is a NEW run with a corrected
pre-registration, not a re-score. The correction, frozen below:
the primary is no longer a multiple of TOTAL launches. It is the
lever's own quantity — Dale-class PARTY conversions — plus the
converted share of the convertible-hold pool, sized per §14b
(pool sizing: the bar is a multiple of the pool, not of a quantity
the lever cannot touch). The launch-count delta is reported, never
judged.

## 1. The lever (re-applied, verified)

Cherry-pick `-n` of held commit `e62603af0` (branch
`sim-homebody-a`) into this worktree, verified by `git diff
--cached --stat`: exactly 3 files, 159 insertions / 3 deletions —
identical to the held commit's own stat (the three files are
unchanged on master since the lever was written, so the cherry-pick
applies cleanly):

- `src/js/win-plan.js` (+129): `winPlanHomebodyHandoff` — a range-0
  holder's wave-4+ plan moves to a walkable companion at depart
  time; the homebody stays home, the plan moves.
- `src/js/villager-brain.js` (+13): the two call sites (brain path
  `vbrainExecuteDepart`, no fill; `winPlanDepart` path, fill).
- `docs/ONTOLOGY.md` (1 line): the provides-line entry for the new
  method (required by `validate-ontology.js`).

Proof test: `git show sim-homebody-a:scripts/test-homebody-handoff-a.js
> scripts/test-homebody-handoff-a.js` (409 lines, `node --check`
clean). ONE adaptation, frozen here: §C hardcodes
`BASE = 'f2d03db92'` (the 2115Z base tip). This run's pre-lever code
is HEAD `80e7da0bc`, so the constant is updated to `80e7da0bc` —
the old-code control must be THIS run's base, not the 2115Z base.
Everything else in the test is verbatim from the held branch.

New instrument this run: `scripts/analyze-homebody-pool-a.js` —
the corrected-metric judge (see §4). It reads the analyzer's
output JSON plus the per-seed corpora and computes the pool, the
share, the party conversions, and the guardrails. It carries its
own `--selftest` (100% required before the band).

Driver adaptation, frozen here: `scripts/homebody-driver-a.js`
hardcodes its output date `evidence/2026-11-22` (line 985). One
line changes to `process.env.EVIDENCE_DATE || '2026-11-22'`;
this run passes `EVIDENCE_DATE=2026-11-23`. Output directory only;
no measurement behavior changes. `node --check` clean required.

## 2. The question (unchanged from sim-homebody-a)

Does handing a range-0 holder's wave-4+ plan to a walkable companion
at depart time convert held dawn commits into real wave-4+
departures — departures with companions, not solo walkouts —
without costing the village more dead or shorter survival?

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107455–107470 (16 seeds).** Verified before this prereg
  by this arm (not taken from the coordinator's check):
  - `grep -rn "10745[5-9]|1074[6-7][0-9]|107455|107470"
    evidence/ --include='*.md'` — **0 hits.** No prereg, evidence
    file, or claim ever named these seeds.
  - `grep -rn <each seed> evidence/ --include='*.md'
    --include='*.json' -l` — 182 files list a band number as a
    substring; seed-context inspection of every flagged file
    (`"seed":`, `s10745x`, standalone 6-digit token) leaves exactly
    5, all pantry-kcal VALUES, the known false-positive class:
    `pantryFreshAfter 107458` (crumbdefault census),
    `eveningPantryKcal 107456` (corpsehome nighttravel),
    `pantry 107459` (journey-scale-r71 trust + wsplit, twice).
    None is a seed, band, or corpus for 107455–107470.
  - `find evidence/ -name '*10745*' -o -name '*10746*' -o -name
    '*10747*'` — only `fightorigin-b-insideevening-s10745.json` /
    `s10746.json` / `s10747.json` (Oct-29 raidname corpus), which
    are seeds **10745**, **10746**, **10747** (5-digit), not
    107455–107470. No collision.
  - Prereg band declarations across all dates: the highest named
    band is 107447–107454 (launchfield-horizon-b, run today) —
    adjacent, no overlap. Nearest used bands: 107431–107446
    (homebody-rejudge-a), 107423–107430 (homebody-a).
  - `grep -rn "107455|107470" <goal>/hidden_files/` — only the
    coordinator's claim file for THIS run
    (`lever-claims/fleshout-20261123T0815Z.json`, reserving
    107455–107470 for sim-homebody-metric-a). No other claim.
  - `grep -rn "107455|107470" ~/memory/*.md` — 0 hits.
- **No collision; no shift needed.** The suggested band stands.

## 4. Instrument (frozen design)

- Driver `scripts/homebody-driver-a.js` (one-line date override,
  §1): RUN stays `homebody-a`; the legs are distinguished by
  OUTDIR: `perseed-homebody-metric-a-ctl` /
  `perseed-homebody-metric-a-arm` under `evidence/2026-11-23/`.
  Substrate, horizon, policy as §6.
- Analyzer `scripts/analyze-homebody-a.js` (unchanged): reads both
  legs' per-seed JSONs. **IMPORTANT — judge vs instrument:** the
  analyzer's own `bars`/`verdict` fields encode the 2115Z bars
  (primary +4 absolute, Dale ≥ 1 any conversion) AND the re-judge
  reading of them. Those fields are NOT the judge for this run.
  The corrected verdict is computed by
  `scripts/analyze-homebody-pool-a.js` from the analyzer's RAW
  numbers plus the per-seed corpora, against the frozen bars in §7
  below. The analyzer's verdict is reported as a cross-check only,
  and any divergence is explained.
- Pool judge `scripts/analyze-homebody-pool-a.js` (new, §1):
  `--ctl <dir> --arm <dir> --analyzer <analysis.json>
  --seeds 107455,...,107470 --out <file>`; `--selftest` 100%
  required before the band. Computes §6 quantities from the
  per-seed `handoffs` / `v4departs` / `deaths` streams and the
  analyzer's `detPass` / instrument-error counts, and prints the
  corrected verdict. It never re-scores: it implements the frozen
  bars in §7 exactly.
- Panel builder `scripts/build-homebody-panels-a.js` (unchanged):
  `--before evidence/2026-11-23/perseed-homebody-metric-a-ctl
  --after evidence/2026-11-23/perseed-homebody-metric-a-arm
  --seeds 107455,...,107470 --out
  evidence/2026-11-23/homebody-metric-a-panel`; then `node
  scripts/balance-panel.js compare` and attach the compare `.md`.
  The panel is the instrument, the frozen bars below are the judge.
- Proof test `scripts/test-homebody-handoff-a.js` (brought from the
  held branch, §C base adapted to `80e7da0bc`, §1): 100% required
  before the band; the handoff assertions MUST fail on old code
  (§C child mode) and pass on new code.

## 5. Leg order (frozen — lever is staged, not committed)

The lever is cherry-picked but UNCOMMITTED in this worktree. The
ctl leg must run on old code, so:

1. `git stash push -- src/js/win-plan.js src/js/villager-brain.js
   docs/ONTOLOGY.md` (staged lever only; the proof test, pool
   script, driver edit, and prereg are untracked-or-separate and
   stay). Verify `grep -c winPlanHomebodyHandoff
   src/js/win-plan.js` is 0 and record the sha256 of both files.
2. Run the ctl leg (pilot 8 seeds, then confirm 8 — see §8).
3. `git stash pop`. Verify the method is back (`grep -c` ≥ 1) and
   record the shas again — they must match the pre-stash armed
   shas.
4. Run the arm leg (pilot 8, then confirm 8).
5. The analyzer's anchor check (`--ctl-winplan/--ctl-brain/
   --arm-winplan/--arm-brain` from the per-seed JSONs'
   `winplanSha`/`brainSha`, which are content shas, not commits)
   proves which code each leg ran on. `anchorCommit` is
   `80e7da0bc` on both legs (the lever is uncommitted); the file
   shas are what differ.

## 6. Definitions (frozen)

- **Wave-4+ launch:** a `v4departs` row with result `launch` and
  (plan.needWave ≥ 4 OR plan.target a wave-4+ species). Same OR
  definition as the re-judge.
- **Wave-4+ launches (REPORTED, never judged):** the COUNT of
  wave-4+ launches across the 16 seeds. Holds are counted
  separately, never as launches.
- **Handoff case:** an armed-leg `handoffs` row with result
  `'launch'` or `'hold'`, `oldHolderMaxD` strictly 0, and wave-4+
  (needWave ≥ 4 OR target a wave-4+ species). A `'skip'` row is a
  NON-case by the method's own filters (no plan, not wave-4+, or
  the holder can walk) and never enters the pool. A `'hold'` row
  IS a case: the lever faced the hold and no walker could depart.
  (Why the pool is read off the armed leg: the hold rows on the
  control leg record only the holder in `members` — the commit's
  companions are not recorded there — so "a walkable companion was
  on the commit" is not measurable from control data. The armed
  leg's handoff stream IS the record of cases the lever faced;
  pre-bound identity with the control leg means each pool case
  corresponds to a hold the control leg records for the same
  holder/target on the same day. The control-leg distinct-hold
  count is reported as a cross-check, §6 below.)
- **Convertible-hold pool (PRIMARY denominator):** the count of
  DISTINCT (seed, oldHolder, target) triples among handoff cases.
  Distinct triples, not rows: one held plan is re-attempted every
  dawn (on the re-judge band, 36 hold rows were 2 plans), so rows
  would count one plan 34 times.
- **Party conversion:** a pool triple converts iff at least one
  armed-leg `handoffs` row with result `'launch'`,
  `oldHolderMaxD` 0, `party` length ≥ 1, and the same (seed,
  oldHolder, target) exists. **Solo conversion:** same with
  `party` length 0 — reported separately, NEVER counts toward the
  share numerator or bar 4 (the 2115Z caveat).
- **Converted share (PRIMARY):** party-converted triples / pool
  triples.
- **Pool cross-check (reported, not judged):** distinct (seed,
  holder, target) triples among control-leg wave-4+ `v4departs`
  hold rows with members[0].maxD === 0. On the re-judge band this
  is 2 — the same 2 the armed leg faced. A mismatch on the fresh
  band is explained in the evidence, never silently resolved.
- **Total deaths (GUARDRAIL):** sum over seeds of `deaths` rows
  (all causes), per leg, from the per-seed corpora.
- **Starvation deaths (reported, not judged):** a `deaths` row
  whose kind or cause matches /starv|hunger/i. Continuity with
  the re-judge guardrail; the brief replaces it with total deaths
  as the judged guardrail.
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
  MEASUREMENT.md §10). **Seeds:** 107455–107470 (16).

## 7. Frozen bars (judge: the evidence file, from the pool judge's numbers)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — homebody proof test 100% (fails on old code via §C against `80e7da0bc`, passes on new); homebody analyzer `--selftest` 100%; pool judge `--selftest` 100%; 0 instrument errors on all 32 seed files (16 ctl + 16 arm) | all must hold |
| 2 | **Det-gate** — ctl leg records 0 `handoffs` rows on all 16 seeds; for each seed, every recorded event stream is byte-identical between legs for rows with day < the armed leg's first-handoff day; the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — converted share** — party-converted triples / pool triples ≥ 0.50 | must hold for GO |
| 4 | **PRIMARY — party conversions** — party-converted triples ≥ 2 | must hold for GO |
| 5 | **GUARDRAIL — total deaths** — total deaths armed ≤ ceil(1.1 × control total) | must hold for GO |
| 6 | **GUARDRAIL — survival** — median survival armed ≥ 0.8 × control median | must hold for GO |
| 7 | **NO-GO rule** — any of bars 3–6 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14); det-gate failure (bar 2) → NO-GO on instrument grounds (the legs are not comparable) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if EITHER leg sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO).

**Pool rule (frozen, no re-scoring):** if the pool is **0**, the
share is undefined and the verdict is **INCONCLUSIVE** (the band
gave the lever nothing to convert). If the pool is 1, the bars are
judged as written — a single conversion can satisfy bar 3 but
never bar 4, so pool 1 caps at NO-GO.

GO = all seven bars pass. GO means: the handoff converts at least
half of the held wave-4+ plans it faces into real departures WITH
companions (≥ 2 of them) and costs nothing on the total-deaths /
survival guardrails. GO certifies the lever for landing (from held
branch `sim-homebody-a` `e62603af0`, rebased onto current master,
re-proved, as its own commit with its proof test). NO-GO = any bar
missed; the evidence says which, with the §14a kill
classification, and the game-code change stays reverted
(instrument + evidence land). The launch-count delta is reported,
never judged.

## 8. Run plan (frozen, staged per §§9–12)

- **Pre-flight (NOT judged):** `node
  scripts/test-homebody-handoff-a.js` → 100% on NEW code (its
  handoff assertions FAIL on old code via §C against
  `80e7da0bc`); `node scripts/analyze-homebody-a.js --selftest`
  → 100%; `node scripts/analyze-homebody-pool-a.js --selftest`
  → 100% — all before any judged run.
- **Consistency re-score (NOT judged):** apply the pool judge to
  the EXISTING 107431–107446 corpus
  (`evidence/2026-11-22/homebody-rejudge-a-analysis.json` +
  `perseed-homebody-rejudge-a-ctl/arm`). Expected from the re-judge
  evidence: pool 2, share 2/2 = 100%, party conversions 2, total
  deaths armed ≤ ceil(1.1 × control), median survival passes —
  i.e. the old corpus re-scores GO under the corrected bar. The
  re-score is a consistency check on the instrument, not a verdict:
  whatever it says, the fresh band below is the judge. If the
  re-score disagrees with the expectation, the discrepancy is
  investigated BEFORE the fresh band runs (it would mean the pool
  definition or the judge is wrong, not the lever).
- **Pilot (judged, stage 1):** seeds **107455–107462** (8), both
  legs, same driver/substrate/horizon. Pilot GO (proceed to
  confirm) iff instrument valid + det-gate passes on the pilot
  seeds + pool_pilot ≥ 1 (the lever faced at least one
  convertible-hold case). If pool_pilot == 0 → stop,
  INCONCLUSIVE-at-pilot, no confirm spend (§9: no confirm spend
  on an invisible effect). The share is judged ONLY on the full
  16-seed band, never on the pilot alone.
- **Confirm (judged, stage 2):** seeds **107463–107470** (8), both
  legs, into the same OUTDIRs. Then the analyzer + pool judge over
  all 16 seeds; the bars in §7 judge the full band.
- **Per-launch tables** in the evidence file from the analyzer +
  pool-judge outputs (per-seed JSONs in
  `evidence/2026-11-23/perseed-homebody-metric-a-ctl` and
  `evidence/2026-11-23/perseed-homebody-metric-a-arm`).
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
