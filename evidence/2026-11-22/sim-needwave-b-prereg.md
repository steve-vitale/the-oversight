# sim-needwave-b — PREREG (frozen)

**Arm:** sim-needwave-b · **Loop A run:** fleshout-20261122T1415Z
**Axis:** scale-onramp · **Finding:** #2685 (leadgate-a DIAG-GO) +
the needwave-a NO-GO root cause (null-holder wipe, sim-needwave-a.md
§4; instrument blind spot, sim-findings.md line 2693)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs armed)
**Base master:** `b199d55c8` (worktree
`~/workspace/worktrees/sim-needwave-b`, branch `sim-needwave-b`)
**Frozen:** 2026-11-22 ~16:00 UTC, before any judged run. No judged
run has run.

## 1. The question

sim-needwave-a proved the UNGUARDED needWave copy NO-GO on the
det-gate: a leader whose own plan has no wave number wipes a
companion's set wave number when they set out together (seed
107377: Jason's wave 4 wiped day 58 by Mia's blank, trio launch
became a silent solo; seed 107378: a wave 3 wiped day 67). The
lever's intended effect worked where it fired (primary 0.14 vs
0.36, trio 0.43 vs 0.36, beats 0.86 vs 0.64), but the copy is
symmetric: it copies a blank just as faithfully as a 4. The
question: does the GUARDED copy — copy the leader's needWave to
companions ONLY when the leader's is set, NEVER erase a
companion's existing needWave — keep the intended effect (null
launch rate ≤ 0.25, trio+ up, beats up) while the det-gate holds
on a wipe-aware copy record, with no starvation/survival cost?

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave
  gates); docs/PARTY.md read (the SCHOLAR's party — invites, caps,
  betrayal; it does not cover villager plan-lead selection).
  **No canon doc covers who leads a wave-4+ villager party, how a
  plan holder is picked, or the companion plan sync** — said here
  rather than inventing canon. The rule below is code-derived.
- **The guarded shape (frozen).** One line per companion, three
  syncs per site, assignment on the SAME line as its `if` guard
  (so the test-needwave-a.js §A pins, which trip only on a
  line-start unguarded assignment, still forbid the -a shape):
  - `src/js/win-plan.js`, `launchParty`: `if (plan.needWave !=
    null) cplan.needWave = plan.needWave;` (and `cplan2` / `cplan3`).
    This path is DEAD in sims (the brain owns dawn) but the copy
    belongs there too, so the two paths cannot drift apart again.
  - `src/js/villager-brain.js`, `vbrainExecuteDepart`: `if (plan2
    && plan2.needWave != null) cplan.needWave = plan2.needWave;`
    (and `cplan2` / `cplan3`). This is the live path: all 18
    launches on the -a band came through it.
- **What "never erase" means here (frozen).** The guard copies
  only when the leader's needWave is set; a null leader copies
  nothing, so a companion's set number survives. A set leader
  OVERWRITES a companion's set number (e.g. leader 3 + companion
  4 → companion 3): that is the chosen shape, not a wipe — the
  sync already re-points the companion's target unconditionally,
  so the wave number follows the target. The analyzer COUNTS
  downgrades (set-to-lower copies) on the band and reports them;
  they are not a bar, and a downgrade is never a null. If
  downgrades dominate the armed leg, the evidence says so and the
  next arm can consider fill-only.
- **The instrument blind spot is fixed first (frozen).**
  needwave-a §4: `diffNeedWaves` dropped every change whose new
  value was null (`a != null`) and skipped the holder's own plan
  (`k === holderVid`), so the det-gate bound was days late or
  absent. In `scripts/needwave-driver-b.js` the copy record logs
  EVERY needWave change — a wipe to null IS a row (`to: null`),
  and the holder's own plan IS included with `isHolderPlan: true`.
  The analyzer treats holder rows as re-seed noise (the holder's
  plan can re-seed inside the call via winPlanCommitDeadTarget):
  the ctl-zero rule covers COMPANION rows only, holder rows are
  compared as a stream pre-bound, and the bound is the earliest
  armed COMPANION copy, any to-value. Analyzer selftest 26/26
  (19 carried + 7 new wipe/holder/downgrade cases).
- **Scope note (frozen, carried from -a).** Both sync sites, same
  one-line-class change. The brain-path `cplan` target/node gap
  (it copies neither) is a SEPARATE adjacent defect — recorded as
  a finding, NOT fixed by this lever; this lever copies needWave
  only.
- **Gates the copy re-enables (all read `needWave >= 4`):**
  `extraCompanionScan` (2nd/3rd companion picks,
  win-plan.js:659), `winPlanDepartLaunchBeat`
  (win-plan.js:1083), the dawn candidate wave-4 gate
  (villager-brain.js:1033–1070). Nothing else reads needWave on
  the launch path.
- **The gun never enters this lever.** The fix changes party size
  and beat audibility, not who holds a gun; gun-led launches are
  recorded but no bar turns on them.
- **test-needwave-a.js is updated DELIBERATELY in the instrument
  commit (not silently weakened).** It was the -a NO-GO revert
  guard (26/26 on reverted code, adoption commit 512f86760, not
  yet merged — a parallel adoption coordinator owns that merge).
  Its §A pins are UNCHANGED (they still forbid the unguarded
  line-start copy, and the guarded shape does not trip them); its
  §B/§D live fixtures are rewritten to the guarded expectations
  (companions inherit 4; companion-turned-holder speaks; wave-3
  copies 3); §B2W (null-holder wipe guard) is unchanged; §C BASE
  is now b199d55c8. The guarded copy's own proof is
  `scripts/test-needwave-b.js` (positive §A pins: all six guarded
  syncs present; §B4 downgrade fixture documents the chosen
  shape). Neither test may be weakened to pass: a failure is a
  loud failure.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107391–107398 (8 seeds).** Verified before this prereg
  (re-run by this arm, not taken from the coordinator's check):
  `rg -l --glob 'sim-*.md' "\b<seed>\b" evidence/` in the main
  tree — **0 hits on all 8 seeds** across every sim-*.md
  evidence file — and `ls evidence/2026-11-22/ | grep -E
  '10739[1-8]'` — **0 filename hits**.
- **Raw-corpus collisions (not claims).** A whole-tree `rg -l`
  for the same tokens also hits old raw per-seed JSON corpora
  (e.g. `evidence/2026-11-20/perseed-reseed-b-control/
  reseed-b-s106091-….json`); spot check: the single occurrence
  in each is the token as a DATA value (a kcal figure), not a
  seed band — the same class of collision the -a prereg
  documented for 107375–107382. No prereg, evidence file, or
  forbidden-band list names 107391–107398 as a sim band.
- **No collision; no shift needed.** DO NOT use 107367–107390
  (spent: cellcheck 107367–107374, needwave-a 107375–107382,
  Loop B launchfield-refreeze 107383–107390). Nearest used band:
  107383–107390 (launchfield-refreeze-b, landed as b199d55c8
  this same day) — no overlap.

## 4. Instrument (frozen design)

- `scripts/needwave-driver-b.js`: a COPY of
  `scripts/needwave-driver-a.js` renamed (`RUN=needwave-b`,
  `OUTDIR perseed-needwave-b-<mode>`, filename prefix
  `needwave-b`) with the wipe-aware `diffNeedWaves` fix (§2)
  and nothing else changed in the wraps. Substrate, horizon,
  policy, and leg discipline identical to -a.
- New analyzer `scripts/analyze-needwave-b.js`: reads both legs'
  per-seed JSONs and emits the judged metrics, the wipe-aware
  det-gate verdict, downgrade/wipe counts, and the wall numbers;
  `node scripts/analyze-needwave-b.js --ctl <dir> --arm <dir>
  --out <file>`; `--selftest` runs the staged checks (26/26).
- Proof test `scripts/test-needwave-b.js`: staged fixtures
  driving the REAL `winPlanDepart` AND the REAL
  `vbrainExecuteDepart` — asserts the companion plan carries
  `needWave` after launch on new code, the wipe fixture (null
  leader + set-wave companions keep their number), the beat
  speaking for the companion-turned-holder, the downgrade shape
  (§B4), and the old code leaving it null via `--old-code` child
  mode against `git show` of the base tip. 100% required before
  the band; the test MUST fail on old code (the copy assertions)
  and pass on new code.
- Panel builder `scripts/build-needwave-panels-b.js` (cloned from
  `build-needwave-panels-a.js`, defaults re-pointed at the -b
  corpora/seeds): builds the §15 balanced-panel before/after
  JSONs from the paired corpora (case identity is the seed);
  `node scripts/balance-panel.js compare` is run and its compare
  `.md` attached to the evidence file. The panel is the
  instrument, the frozen bars below are the judge.

## 5. Definitions (frozen)

- **Wave-4+ launch:** a `v4departs` row with result `launch`
  and (plan.needWave ≥ 4 OR plan.target a wave-4+ species) — the
  OR definition from leadgate-a §8 (the companion sync drops
  needWave, so a needWave-only definition undercounts).
- **Null-needWave launch rate:** wave-4+ launches whose holder
  plan had `needWave == null` at launch, divided by all wave-4+
  launches. (The holder's own needWave is untouched by the sync,
  so the post-call read in the depart wrap is the launch-time
  value.)
- **Trio+ launch rate:** wave-4+ launches with partySize ≥ 3,
  divided by all wave-4+ launches.
- **Departure-beat rate:** wave-4+ launches with an ordinary
  (non-reseed) beat row on the same day+vid, divided by all
  wave-4+ launches.
- **Starvation death:** a `deaths` row whose kind or cause matches
  /starv|hunger/i. (The analyzer lists the actual kind strings
  seen on the corpus; if none match, the guardrail is reported
  as unmeasurable, never faked.)
- **Median survival:** median of per-seed `gameDays` (analyzer
  gameDays, as in leadgate-a).
- **First-copy day (det-gate bound):** per seed, the earliest
  `needWaveCopies` COMPANION row (isHolderPlan false) on the
  armed leg, ANY to-value (a wipe to null sets the bound just as
  a fill does). The ctl leg must record zero COMPANION copy rows
  on all 8 seeds; holder rows (re-seed noise) are compared as a
  stream pre-bound and never set the bound.
- **Wipe copy:** a companion copy row with `to == null`. On the
  guarded code the armed leg must record ZERO (the guard copies
  nothing from a null leader); the analyzer reports the count
  and any wipe is a same-run investigation item, not a bar.
- **Downgrade copy:** a companion copy row with `from != null`,
  `to != null`, `to < from`. Counted and reported, not a bar.
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`) — the leadgate-a baseline
  shape: the scholar is driven by the competent policy, geared
  and fighting with a party as the policy drives (encounter-gear
  fixture per the arm brief; a staged fixture that does not match
  encounter gear would invalidate the verdict). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `HYPOFLOOR` unset.

## 6. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — needwave-b proof test 100% (fails on old code, passes on new); needwave-b analyzer `--selftest` 100% (26/26); test-needwave-a.js (updated pins) 100% on new code; 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate (wipe-aware)** — ctl leg records 0 COMPANION `needWaveCopies` rows on all 8 seeds; for each seed, every recorded event stream (`v4departs`, `planSeeds`, `v4fights`, `volleyEvents`, `prizeEvents`, `grantEvents`, `contestEvents`, `deaths`) is byte-identical between legs for rows with day < the armed leg's first COMPANION copy day (any to-value); the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — null-needWave launch rate** — armed ≤ 0.25 vs control ~0.36 (needwave-a: 4/11) on identical seeds | must hold for GO |
| 4 | **SECONDARY — trio+ launch rate** — armed > control | must hold for GO |
| 5 | **SECONDARY — departure-beat rate** — armed ≥ control (on wave-4+ launches) | must hold for GO |
| 6 | **GUARDRAIL — starvation** — total starvation deaths armed ≤ control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 7 | **GUARDRAIL — survival** — median survival armed ≥ 0.8 × control median | must hold for GO |
| 8 | **NO-GO rule** — any of bars 3–7 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14); det-gate failure (bar 2) → NO-GO on instrument grounds (the legs are not comparable) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if EITHER leg sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO) — the
evidence says so and names the next step (a wider band, or a
substrate check on why launches are absent). A miss is NO-GO,
never re-scored against a friendlier metric mid-run (§14).

GO = all eight bars pass. GO means: the guarded needWave copy
collapses the null-needWave launch rate, restores trio+ launches
and the departure beat on those launches, the det-gate holds on a
wipe-aware record, and it costs nothing on the
starvation/survival guardrails. NO-GO = any bar missed; the
evidence says which, and the game-code change is reverted
zero-trace per kill protocol (instrument + evidence kept).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-killlootbundle-a.js` → 12/12 (if present on this
  base); `node scripts/test-leadgate-a.js` → 33/33 (if present);
  `node scripts/test-needwave-b.js` → 100% on NEW code AND its
  copy assertions FAIL on old code (child mode, `git show` of
  the base tip b199d55c8); `node
  scripts/test-needwave-a.js` → 100% on NEW code (updated pins);
  `node scripts/analyze-needwave-b.js --selftest` → 100%
  (26/26) — all before any judged run. Green.
- **Band (judged):** 8 seeds, **107391–107398**, horizon 150d
  death-aware, competent verbatim policy, two legs (ctl on old
  code, arm on new code). Substrate as §5.
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit; the game-code change is committed next; the arm leg
  runs AFTER it. The analyzer refuses to judge if either leg's
  `anchorCommit` does not match the expected side (ctl anchor
  without the fix, arm anchor with it) — recorded, not assumed.
  Anchors recorded: ctl win-plan/brain shas (pre-fix), arm
  win-plan/brain shas (post-fix).
- **Base note:** the brief named master d9d98bf8f; local master
  moved once more before this prereg (b199d55c8,
  launchfield-refreeze-b DIAG-NO-GO, evidence-only, no src/
  changes — verified by `git show --stat`). The worktree was
  rebased onto b199d55c8 before any judged run. If master moves
  again (the parallel 0615Z adoption may land needwave-a
  mid-run), rebase again before judging and re-run proofs green
  after every rebase. A needwave-a landing would touch the same
  two files: check its scope before rebasing — if it lands the
  UNGUARDED copy, this arm's guarded copy must be re-applied on
  top and re-proved, never silently merged over.
- **Per-launch tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-needwave-b-ctl` and
  `evidence/2026-11-22/perseed-needwave-b-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read launch/departure beats from both legs
  (verbatim `beatLines` where captured): does a trio launch read
  as a real party setting out vs a silent pair?
- **Canon:** docs/MONSTER-WAVES.md (gates); docs/PARTY.md
  (scholar's party only); no canon doc covers villager
  party-lead selection or the companion sync — the rule is
  code-derived (see §2), said here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
