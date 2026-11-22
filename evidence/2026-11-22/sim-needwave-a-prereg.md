# sim-needwave-a — PREREG (frozen)

**Arm:** sim-needwave-a · **Loop A run:** fleshout-20261122T0615Z
**Axis:** scale-onramp · **Finding:** #2685 (backlog carries the
leadgate finding twice — line 2676 and line 2685, identical text;
this arm cites #2685; the companion-sync defect is also filed
separately as [open] line 2677)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs armed)
**Base master:** `bda6ff495` (worktree
`~/workspace/worktrees/sim-needwave-a`, branch `sim-needwave-a`)
**Frozen:** 2026-11-22 ~07:30 UTC, before any judged run. No judged
run has run.

## 1. The question

sim-leadgate-a (DIAG-GO, band 107359–107366) found the companion
plan sync copies `target` but NOT `needWave`. Measured: 22/33
launches were led by a null-needWave holder and ALL went out as
pairs (mean party 1.95, 0 trios) vs 11/11 trio+ for needWave-set
holders (mean 3.82), and the departure beat stays silent on the
null half (it gates on the same `needWave >= 4`). The question:
does copying `needWave` in the companion sync collapse the
null-needWave launch rate, restore trio+ launches on those
launches, and restore the departure beat — without starving the
village harder or shortening survival?

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave
  gates); docs/PARTY.md read (the SCHOLAR's party — invites, caps,
  betrayal; it does not cover villager plan-lead selection).
  **No canon doc covers who leads a wave-4+ villager party, how a
  plan holder is picked, or the companion plan sync** — said here
  rather than inventing canon. The rule below is code-derived.
- **THE SYNC SITE IS NOT WHERE THE BRIEF SAID.** The brief named
  `launchParty` in src/js/win-plan.js (~line 1313). That site
  exists — `cplan`/`cplan2`/`cplan3` syncs at win-plan.js:1313,
  :1317, :1322 copy stage/party/target/node but NOT needWave —
  but it is DEAD in sims. `agencyTick` (villager-agency.js:434)
  routes departures through `vbrainExecuteDepart` whenever
  `vbrainOwnsDawn()` is true, and `vbrainOwnsDawn()` returns true
  unconditionally (villager-brain.js:778); after
  `vbrainExecuteDepart` returns 'hold'/'launch' the tick
  `continue`s, so `winPlanDepart` (villager-agency.js:446) is never
  reached. Leadgate measured exactly this: 33/33 launches came
  from the brain path. **The live sync site is
  `vbrainExecuteDepart` in src/js/villager-brain.js (~lines
  1314–1335)**, which has its own companion sync with the same
  defect — `cplan2`/`cplan3` copy stage/party/target/node but NOT
  needWave, and `cplan` (first companion) copies stage/party only
  (no target, no node, no needWave).
- **Scope note (deviation from the brief's file constraint, frozen
  here).** The brief said "touch ONLY win-plan.js". A
  win-plan.js-only fix cannot move any preregistered metric in
  sims, because that launch path never fires while the brain owns
  dawn — judging the lever on it would be a false NO-GO. The lever
  is the SAME one-line-class change (copy `needWave` at the
  companion sync) applied at BOTH sync sites: win-plan.js
  launchParty (3 sites: cplan/cplan2/cplan3) and
  villager-brain.js vbrainExecuteDepart (3 sites:
  cplan/cplan2/cplan3). The brain-path `cplan` target/node gap
  (it copies neither) is a SEPARATE adjacent defect — recorded as
  a finding, NOT fixed by this lever; this lever copies needWave
  only. The coordinator can accept or reject the file-scope
  expansion; the prereg freezes it either way.
- **The companion sync is the ONLY target-without-needWave path.**
  Every other target-setting path sets needWave together with
  target: `winPlanSeedFromFight` (win-plan.js:884,
  `plan.needWave = mdef.wave`), the re-seed pick
  (win-plan.js:978, :1002, `plan.needWave = fresh.wave`).
  `winPlanOf` creates a plan with needWave undefined (stage
  'gear', win-plan.js:770), which the sync then fills. So after
  the fix, a null-needWave wave-4+ launch should be ~0; the GO
  bar (≤ 0.25) leaves room for any residual path not seen here.
- **Why the null share is 0.67, not 1.0, on control.** A holder
  who seeded their own plan carries needWave from the seed; a
  holder whose plan came from a companion sync carries a wave-4
  target with needWave null. The fix converts the second
  population into the first at the moment of the sync — the NEXT
  launch that holder leads is then a needWave-set launch, so the
  effect compounds across launches within a seed.
- **Gates the copy re-enables (all read `needWave >= 4`):**
  `extraCompanionScan` (2nd/3rd companion picks,
  win-plan.js:659), `winPlanDepartLaunchBeat`
  (win-plan.js:1083), the dawn candidate wave-4 gate
  (villager-brain.js:1033–1070). Nothing else reads needWave on
  the launch path.
- **The gun never enters this lever.** The fix changes party size
  and beat audibility, not who holds a gun; gun-led launches are
  recorded (leadgate: 0/33) but no bar turns on them.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107375–107382 (8 seeds).** Verified before this prereg
  (re-run by this arm, not taken from the coordinator's check):
  `rg -l --glob 'sim-*-prereg.md' "\b<seed>\b" evidence/` and
  `rg -l --glob 'sim-*.md' "\b<seed>\b" evidence/` — **0 hits on
  all 8 seeds** across every prereg and every sim-*.md evidence
  file in the worktree.
- **Raw-corpus collisions (not claims).** A whole-tree `rg -l`
  for the same tokens also hits old raw per-seed JSON corpora
  (e.g. `evidence/2026-11-21/perseed-gunlife-a-ctl/…-s107327-….json`,
  `hidden_files/…/journey-landing-r62-census-1280.json`). Spot
  check: the single occurrence in each is the token `107379` as a
  DATA value (`"expected": 107379` — a kcal figure), not a seed
  band. No prereg, evidence file, or forbidden-band list names
  107375–107382 as a sim band.
- **No collision; no shift needed.** Nearest used band:
  107359–107366 (sim-leadgate-a, this same day) — no overlap.
  Forbidden bands from prior briefs (106751–106766, 107221–
  107228, 107191–107198, 107131–107138, 107111–107118,
  107091–107098, 107081–107088, 107051–107058, 107021–107028) do
  not overlap it either.

## 4. Instrument (frozen design)

- `scripts/needwave-driver-a.js`: a COPY of
  `scripts/leadgate-driver-a.js` reused with its wraps intact
  (contest prizes, kill-loot, fieldFight volleys, alienLootGrant,
  corpse takes, daily `v4gunLoc` gun census, leadgate wraps:
  `winPlanDepart` + `vbrainExecuteDepart` departs, `fieldFight`
  wave-4+ fights, `winPlanSeedFromFight` seeds, daily `planCensus`)
  PLUS needwave wraps (pure reads + driver-local writes; every
  game function runs exactly once, untouched):
  - `needWaveCopies`: in BOTH depart wraps, a before/after diff
    of every companion plan's needWave across the call (holder
    excluded — the holder's own plan can re-seed during the
    call). A row is `{day, holder, companion, from, to,
    source}`. On ctl (old code) this list must be EMPTY by
    construction; on armed, the first copy day per seed is the
    divergence bound for the det-gate (§6).
  - `departBeats`: a wrap on `winPlanDepartLaunchBeat` recording
    `{day, vid, launched, needWave, ret, reseedSpoke}` — the
    reseed-spoke flag comes from a paired wrap on
    `winPlanReseedLaunchBeat` (rows counted across the synchronous
    call), so an ordinary beat is distinguished from a re-seed
    beat that speaks first and returns true without it.
  - `beatLines`: a wrap on `say` recording verbatim lines matching
    `/sets out .* the fire marks the trail/` — the sense-test
    quotes. Best-effort: if `say` is not wrappable the driver
    records `sayWrap: false` and the sense-test instantiates the
    deterministic template from the beat rows instead (never
    faked as verbatim).
  - **RUN id / OUTDIR (frozen choice):** `RUN=needwave-a`,
    OUTDIR `perseed-needwave-a-<mode>` (`ctl` / `arm`). The driver
    writes under `evidence/2026-11-22/<OUTDIR>`.
  - **Two legs:** MODE=ctl (old code — runs BEFORE the game-code
    commit) and MODE=arm (new code — runs AFTER it). Same driver,
    same substrate, identical seeds; the per-seed JSON's
    `anchorCommit` proves which code each leg ran on.
  - **Parallelism:** each leg runs as 2 detached processes (4
    seeds each), same RUN/OUTDIR — per-seed filenames never
    collide.
- New analyzer `scripts/analyze-needwave-a.js`: reads both legs'
  per-seed JSONs and emits the judged metrics, the det-gate
  verdict, and the wall numbers;
  `node scripts/analyze-needwave-a.js --ctl <dir> --arm <dir>
  --out <file>`; `--selftest` runs the staged checks.
- Proof test `scripts/test-needwave-a.js`: staged fixtures
  driving the REAL `winPlanDepart` AND the REAL
  `vbrainExecuteDepart` (departbeat-b fixture shape, holder +
  companions with pre-existing plans) — asserts the companion
  plan carries `needWave` after launch on new code, and asserts
  the old code leaves it null via `--old-code` child mode against
  `git show` of the branch base tip. 100% required before the
  band; the test MUST fail on old code (the copy assertions) and
  pass on new code.
- Panel builder `scripts/build-needwave-panels-a.js` (cloned from
  `build-evade-panels-a.js`): builds the §15 balanced-panel
  before/after JSONs from the paired corpora (case identity is the
  seed); `node scripts/balance-panel.js compare` is run and its
  compare `.md` attached to the evidence file. The panel is the
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
  `needWaveCopies` day on the armed leg. The ctl leg must record
  zero copy rows on all 8 seeds.
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
| 1 | **Instrument validity** — leadgate proof test 12/12-equivalent re-run on this base (killlootbundle proof + analyzer selftest re-run); needwave proof test 100% (fails on old code, passes on new); needwave analyzer `--selftest` 100%; 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate** — ctl leg records 0 `needWaveCopies` rows on all 8 seeds; for each seed, every recorded event stream (`v4departs`, `planSeeds`, `v4fights`, `volleyEvents`, `prizeEvents`, `grantEvents`, `contestEvents`, `deaths`) is byte-identical between legs for rows with day < the armed leg's first-copy day; the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — null-needWave launch rate** — armed ≤ 0.25 vs control ~0.67 (leadgate: 22/33) on identical seeds | must hold for GO |
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

GO = all eight bars pass. GO means: the needWave copy collapses
the null-needWave launch rate, restores trio+ launches and the
departure beat on those launches, and costs nothing on the
starvation/survival guardrails. NO-GO = any bar missed; the
evidence says which, and the game-code change is reverted
zero-trace per kill protocol (instrument + evidence kept).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-leadgate-a.js` → 33/33;
  `node scripts/analyze-leadgate-a.js --selftest` → 21/21;
  `node scripts/test-needwave-a.js` → 100% on NEW code AND its
  copy assertions FAIL on old code (child mode, `git show` of the
  branch base tip); `node scripts/analyze-needwave-a.js
  --selftest` → 100% — all before any judged run. Green.
- **Band (judged):** 8 seeds, **107375–107382**, horizon 150d
  death-aware, competent verbatim policy, two legs (ctl on old
  code, arm on new code). Substrate as §5.
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit; the game-code change is committed next; the arm leg
  runs AFTER it. The analyzer refuses to judge if either leg's
  `anchorCommit` does not match the expected side (ctl anchor
  without the fix, arm anchor with it) — recorded, not assumed.
- **Per-launch tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-needwave-a-ctl` and
  `evidence/2026-11-22/perseed-needwave-a-arm`).
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
