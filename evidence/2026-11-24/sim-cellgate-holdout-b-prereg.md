# sim-cellgate-holdout-b — PREREG (frozen)

**Arm:** sim-cellgate-holdout-b · **Loop B run:** fleshout-loop-b-20261123T2322Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2716
`[claimed]` — CELLGATE HOLDS EVERY KILL-LOOT VOLLEY BELOW WAVE 4
(killbundle-b §8), via sim-cellgate-floor-b DIAG (bar-8 deaths
regression_watch unresolved on 16 seeds)
**Type:** HOLDOUT on a judged lever question (CELLGATE_FLOOR, env
parameter, no default flip). This arm does NOT re-judge whether
floor 3 makes the gun fire — floor-b answered that yes, decisively
(9 volleys vs 2, 7 at wave 3). It resolves the ONE open item the
floor-b DIAG left: does firing at wave 3 cost village lives on
balance? The flip decision (default floor 3) needs this answer.
**Base:** worktree `~/workspace/worktrees/sim-cellgate-holdout-b`,
branch `sim-cellgate-holdout-b`, HEAD `f5d2c3caa` (master; version
bump only, zero game-code delta from the branch base `3df28e069` —
`git log --oneline master..HEAD` was empty before the ff-merge).
**Frozen:** 2026-11-24 ~01:07 UTC, before any judged run. No judged
run has run.

## 1. The question (from sim-cellgate-floor-b §7/§8)

Floor 3 makes the loaded gun fire (9 volleys vs 2 on 16 seeds), but
the balanced panel's village-deaths rows read `regression_watch`:
**+82 deaths over 16 seeds (+5.125/run, 95% CIs straddling zero,
paired median 0, worse 4 / better 3 / tied 9)**, concentrated in 4
downstream-divergence seeds, 3 of them villages the wave-3 firing
SAVED from being lost (surviving villages record more deaths over
longer lives). On 16 seeds that watch cannot be resolved. Does
firing at wave 3 cost lives on balance, or was the +82 noise from
saved villages living longer?

## 2. Carried numbers (sim-cellgate-floor-b, NOT re-derived)

- Staged corpus `evidence/2026-11-21/perseed-cellgate-floor-b-{ctl,arm}/`
  (16 seeds 107533–107548): control floor 4 — 16 arrivals, 16
  bundled, 0 dry, 2 volleys (Emma Larsen 107539 d51 wave-4, Caleb
  Jones 107542 d100 wave-5), 1581 deaths, 9 starvation deaths,
  median survival 149d, 8 villages lost. Armed floor 3 — 17
  arrivals (16 staged + 1 natural), 17 bundled, 0 dry, 9 volleys
  (7 wave-3, 2 wave-4+), 1663 deaths, 5 starvation deaths, median
  survival 151d, 5 villages lost.
- Per-seed deaths delta (arm − ctl): 9 seeds exactly 0; +66
  (107535), +28 (107536), +15 (107538), +11 (107546); −30
  (107539), −3 (107540), −5 (107544); net +82. Paired median 0.
- Mechanistic expectation (floor-b prereg §2/§6, held up): armed
  8 volleys / 16 arrivals = 50% fire rate, of which 7 wave-3.
  Observed 9 volleys (7 wave-3 + 1 natural wave-4 + Caleb wave-5).
- Scale wall on the 16-seed band (both legs): national 0/16, wins
  0/16, wave 5 11/16 ctl / 12/16 arm, wave 4 16/16 both.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107670–107733 (64 seeds) — FRESH.** Pilot 107670–107677
  (8), confirm 107678–107733 (56). Staged leg: the first
  kill-loot roll of each of these 64 seeds is forced to searcaster
  (STAGE_SEAR), as in floor-b; the seeds' natural rolls are
  overridden for that one call only.
- **Full check, done before freezing:** grepped
  `evidence/*/sim-*-prereg.md` (all dates, 1138 files) for every
  standalone token in the chosen band and in both candidate bands;
  grepped non-prereg `evidence/*/sim-*.md` for the chosen band;
  grepped the convergence tracker and the live + dead lever-claim
  files for the chosen band and both candidates; checked the
  forbidden/contaminated mentions inside the preregs (no dedicated
  forbidden-band file exists in hidden_files; the preregs that
  mention forbidden/contaminated bands name other ranges — 74201–
  74208, 73601–73608, 99801–99808, 58001–58008, 59001–59008,
  103441–103448, 9110x, 96301–96308 — none touches 107670–107733).
- **Candidate A 107649–107712: COLLIDES.** Seeds 107649–107669 sit
  inside Loop A's held 107617–107669 (sim-cellgate-floor-b-prereg
  §4; sim-gatehorizon-b-prereg:172; sim-muster-a-prereg:52,
  "coordinator scope 107617–107669"; dead claim
  fleshout-loop-b-20261123T1430Z.json.DEAD names 107617–107669).
  The free tail 107670–107712 is only 43 seeds — too few for 64.
- **Candidate B 107549–107600: COLLIDES.** Seeds 107549–107581 sit
  inside killarrive-b's band 107533–107581 (49 seeds;
  sim-killarrive-b-prereg §4, "Band: 107533–107581"). The free tail
  107582–107600 is only 19 seeds.
- **Chosen band 107670–107733: ZERO hits** in all 1138 dated
  preregs, zero hits in non-prereg evidence sim-*.md files, zero
  hits in the convergence tracker, zero hits in live/dead
  lever-claims. Nearest used bands, none overlapping: Loop A
  107617–107669 (ends 1 seed below); departsafe 107601–107616;
  killarrive-b 107533–107581; gateavoid-doorrich-b 107471–107494;
  108001–108008 (named as known-used, far above). No prereg,
  screen, or extension band names any of 107670–107733.

## 4. Base note

Worktree HEAD `f5d2c3caa` (master). The CELLGATE_FLOOR parameter
landed in `185a3528b` (fieldFights.js) and is in this base; no new
game code in this arm. `git diff 3df28e069 f5d2c3caa -- src scripts`
is EMPTY (the bump touched index.html, src/js/build.js, sw.js,
version.json only) — the floor-4 control leg on this base is
expected to behave exactly as floor-b's control leg. The only
`src/`-adjacent change this arm makes is none; the new files are
`scripts/test-cellgate-holdout-b.js` (proof + analyzer) and
`scripts/build-cellgate-holdout-panels-b.js` (panel builder),
plus prereg/evidence/corpora.

## 5. Instrument (frozen design)

- **Lever (game code, already landed):** `src/js/fieldFights.js` —
  the CELLGATE hold reads `CELLGATE_FLOOR` (integer 1..5, default
  4 when unset or invalid) and holds when `wave < _cgFloor`. The
  hold line names the live floor. CELLGATE=1 still required.
  Contest searcaster volleys do NOT go through this hold. No
  default flip in this arm.
- **Driver:** `scripts/killlootbundle-driver-a.js` reused UNCHANGED
  (STAGE_SEAR hook + `cellgateFloor` recording included; refuses an
  out-of-range CELLGATE_FLOOR with exit 2 — an invalid floor must
  never silently fall back to 4 on a judged leg).
- **Leg 1 — control (floor 4):** MODE=arm, KILLBUNDLE=1,
  STAGE_SEAR=1, CELLGATE_FLOOR unset (default 4), seeds
  107670–107733 (64), RUN token `killlootbundle-a` UNCHANGED,
  fresh OUTDIR `perseed-cellgate-holdout-b-ctl`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpora land under 2026-11-21
  although this arm's evidence is 2026-11-24; recorded, not moved.
- **Leg 2 — armed (floor 3):** identical except
  CELLGATE_FLOOR=3, fresh OUTDIR `perseed-cellgate-holdout-b-arm`.
  Both legs are driver MODE=arm (STAGE_SEAR requires it); the floor
  label is per-file (`cellgateFloor` 4 vs 3), not a filename mode.
- **Substrate (both legs, identical to killbundle-b / floor-b):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset. Horizon 150d death-aware. Policy: competent
  (verbatim).
- **Tier tally:** `scripts/test-killrate-analysis-a.js` (lootTier
  lookup in `src/data/items.json`).
- **Holdout test (NEW):** `scripts/test-cellgate-holdout-b.js` —
  frozen-band checks, bar derivations, paired-stats math
  (unit-tested on hand-computed fixtures), bar wiring (synthetic
  PASS/FAIL datasets), panel wiring (synthetic corpora through
  the holdout panel builder + balance-panel compare), corpus
  validation modes (`--dir-ctl` floor-4 64, `--dir-arm` floor-3
  64), and `--analyze` (paired deaths table + bar verdicts from
  two corpora). It must be GREEN before the judged runs.
- **Panel builder (NEW):**
  `scripts/build-cellgate-holdout-panels-b.js` — adapted from
  build-cellgate-floor-panels-b.js for the 64-seed band (origin
  `sim-cellgate-holdout-b`, corpus labels
  `cellgate-holdout-b-{ctl,arm}`, seeds 107670–107733).
- **Parallelism:** pilot 2 processes × 4 seeds per leg, then
  confirm 8 processes × 7 seeds per leg (56 seeds per leg).
  Sequential within each process; NEVER two harnesses in one node
  process. If the run window ends mid-band, corpus + progress note
  are committed and the exact done-seed list reported (coordinator
  adopts; nothing faked or extrapolated). If a process dies
  mid-way (machine restarts are happening tonight — check `uptime`
  if one vanishes), re-run ONLY the missing seeds with the same
  instrument/anchor/band, never overwrite a valid per-seed file.

## 6. Definitions (frozen — killbundle-b §6 + floor-b §6, carried verbatim, plus holdout terms)

- **Kill-loot event / tier-4 kill roll / tier-4 kill-roll rate /
  kill-loot searcaster arrival / armed arrival / bundled
  arrival / kill-loot volley / per-arrival fire rate /
  wave-3 kill-loot volley / re-arm:** as killbundle-b §6 and
  floor-b §6.
- **Paired village-deaths difference:** for one seed, (armed-leg
  total deaths) − (control-leg total deaths), where total deaths
  is the per-seed file's `deaths` array length. The pairing is by
  seed: the same staged seed on both legs, the ONLY difference
  between the pair being the CELLGATE floor.
- **95% CI for the paired mean:** two-sided Student-t interval,
  mean ± t(0.975, n−1) × s/√n, s the sample SD of the 64 paired
  differences, n = 64, t(0.975, 63) = 1.9983. Computed by
  `pairedDeathsStats` in the holdout test; unit-tested against
  hand-computed fixtures (see test file).
- **Worse / better / tied:** paired differences > 0 / < 0 / == 0
  (armed leg deaths more / fewer / equal).
- **Mechanistic expectation, scaled (floor-b §2/§6 × 4):** armed
  leg 32 volleys / 64 arrivals = 50% fire rate, of which 28 are
  wave-3 volleys. The expectation is mechanistic, not fitted:
  upstream of each first wave-3 fight the game state is identical
  on both legs, so each loaded holder fires at their first wave-3
  fight. Downstream divergence after a first wave-3 firing changes
  a fight's outcome is the only slack — the GO bars sit below the
  expectation for exactly that reason. The 16-seed observed rates
  were 9/16 armed volleys (56.25%, incl. 1 natural arrival) and
  7/16 wave-3.

## 7. Frozen bars (judge: holdout test --analyze + analyzer + tier tally + panel)

**Numbering note (read first):** the brief lists the control-
replication check as "bar 5" and separately names the deaths
check "GO bar 5 (primary)". Both cannot be bar 5 — the verdict
rule ("GO = bars 1-4, 6-8 pass AND bar 5 passes … the deaths
watch stands") only makes sense with bar 5 = the deaths check.
This prereg therefore numbers NINE bars, with the deaths check
as bar 5 and the brief's bars 6–8 shifted to 7–9. Mapping:
brief bar 1 → 1, 2 → 2, 3 → 3, 4 → 4, deaths (brief "GO bar 5
(primary)") → 5, brief bar 5 (control replication) → 6, brief
bar 6 (guardrails) → 7, brief bar 7 (panel) → 8, brief bar 8
(sense-test) → 9. Verdict rule below is the brief's rule with
"6-8" widened to "6-9" to match. No threshold changed.

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof 12/12 + analyzer `--selftest` 31/31 + `test-killrate-a.js` 36/36 + `test-killrate-analysis-a.js` 14/14 + `test-killarrive-b.js` 12/12 + `test-killbundle-b.js` 11/11 + `--live` 11/11 + `test-gunrate-a.js` 39/39 + `test-cellgate-floor-b.js` pre-run 17/17 + `--live` 24/24 + `test-cellgate-holdout-b.js` pre-run green, all re-run on this base; 0 instrument errors on all 64 + 64 files; single anchor + policySha + gameSha on every file in each corpus; `cellgateFloor` 4 on all 64 ctl files, 3 on all 64 arm files | all must hold |
| 2 | **Cells-at-arrival** — every staged arrival on BOTH legs carries exactly 2 cells (`klBundled == klArrivals == 64`, `klDry == 0`, per leg; natural arrivals, if any, also bundled — counted separately in the evidence table) | must hold for GO |
| 3 | **Volley replication (armed leg, floor 3)** — armed-leg kill-loot volleys ≥ 20/64 (floor-b GO bar ≥5/16 = 31.25% scaled ×4; mechanistic expectation 32/64) | ≥ 20 for GO |
| 4 | **Wave-3 specificity** — armed-leg wave-3 kill-loot volleys ≥ 12/64 (floor-b GO bar ≥3/16 = 18.75% scaled ×4; mechanistic expectation 28/64) | ≥ 12 for GO |
| 5 | **PRIMARY — paired village deaths** — paired mean difference (armed − control, per run) ≤ +2 deaths/run AND 95% CI upper bound ≤ +5 deaths/run | both must hold for GO |
| 6 | **Control replication (floor 4)** — control-leg kill-loot volleys ≤ 6/64 (16-seed control was 2/16) | ≤ 6 for GO |
| 7 | **Guardrails** (analyzer `--compare` floor-4 staged vs floor-3 staged) — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO |
| 8 | **Balanced panel (§15)** — panels built floor-4 vs floor-3 staged (64 matched seeds) via `scripts/build-cellgate-holdout-panels-b.js`; `node scripts/balance-panel.js compare` completes; decision `review_required`; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient}. **The deaths rows are judged by bar 5, not by this bar** — the panel is the instrument; a `regression_watch` on a deaths row does not by itself fail bar 8, but it must be named in the evidence file and reconciled against bar 5 (if bar 5 passes and the panel still watches deaths, the evidence says why the watch is noise; if bar 5 fails, the watch stands as corroboration). Any `regression_watch`/`regression` row on a NON-deaths metric fails bar 8. | must hold for GO |
| 9 | **Sense-test + per-seed table delivered** — a firing holder's story read as a village story (does anyone notice, equip, comment on the gun and its cells), the per-seed paired deaths table (all 64 pairs: deaths ctl/arm/delta, volleys, end, standing) in the evidence file, and whether any holder re-arms after firing | must be delivered |

**Verdict rule (frozen):** GO = bars 1–4, 6–9 pass AND bar 5
passes — the deaths watch is resolved: firing at wave 3 does not
cost lives on balance, and the flip decision has its evidence.
NO-GO = bars 1–4, 6–9 pass AND bar 5 fails — the deaths watch
stands; the flip stays undecided. DIAG = bar 1 fails (instrument)
OR bar 2 fails (bundle — the staged instrument did not load) OR
bar 3 or bar 4 fails (the lever effect did not replicate on the
fresh band — the deaths comparison is then uninformative for the
flip, and the verdict is about the band/instrument, not the
deaths). A miss is NO-GO/DIAG, never re-scored against a
friendlier metric mid-run (§14). If bar 5 fails, the evidence
file decomposes the paired differences per seed exactly as
floor-b §7 did (median, worse/better/tied, concentration, saved-
village analysis) — no re-scoring, only decomposition.

**Bar 6 calibration note (frozen, read before judging):** the
16-seed control was exactly 2/16 = 12.5%, which scales to 8/64
expected on this band; the brief's ≤6/64 bar (9.4%) therefore
sits BELOW the scaled expectation. It is tight by design per the
brief. If bar 6 fails with a count of 7–8 AND every control volley
is at wave 4+ (the mechanism reproduced exactly), the evidence
file's metric review records the miss as a bar-calibration miss
(a count consistent with 2/16 within noise), not a mechanism
failure — the frozen verdict still follows the rule above, and
the flip decision weighs the mechanism reproduction. This note
does not change the bar; it changes only what a miss means.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  31/31 (the floor-b prereg froze 17/17; the count grew to 31 when
  sim-rearm-b added the rearm selftests to the analyzer after
  floor-b froze — the re-run on this base is 31 passed, 0 failed); `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → 12/12;
  `node scripts/test-killbundle-b.js` → 11/11;
  `node scripts/test-killbundle-b.js --live` → 11/11;
  `node scripts/test-gunrate-a.js` → 39/39;
  `node scripts/test-cellgate-floor-b.js` → 17/17;
  `node scripts/test-cellgate-floor-b.js --live` → 24/24;
  `node scripts/test-cellgate-holdout-b.js` → green — all re-run
  on base `f5d2c3caa`. (Known pre-existing drift, NOT part of bar
  1: `node scripts/test-cellgate-a.js` is 10/12 on this base — both
  failures are its stale `^  loosed` shot counter after the Nov 22
  searvoice narration change; the game spends correctly. Fixing it
  is out of this arm's area; recorded here and in the evidence
  infra notes, not silently dropped.)
- **Prereg + test commit BEFORE any judged run:** the prereg and
  the holdout test + panel builder commit on branch
  `sim-cellgate-holdout-b` after the pre-flight re-run and BEFORE
  the pilot. The judged corpora then carry the prereg-commit
  anchor (single anchor by construction — the floor-b two-anchor
  split came from committing pilot evidence mid-band; this arm
  commits NO evidence mid-band, pilot or confirm).
- **Pilot (judged):** 8 staged seeds per leg, 107670–107677.
  Pilot gate (instrument only): single anchor + policySha +
  gameSha on all 16 files, 0 errors, floors correct per leg,
  16/16 bundled per leg so far, and the armed pilot shows the
  effect is visible on the fresh band (≥ 1 wave-3 kill-loot
  volley; floor-b pilot showed 5/8). If the pilot gate fails,
  stop and DIAG — no confirm spend. Pilot volley counts are
  recorded, not judged against bars 3/4 (those judge the full 64).
- **Confirm (judged):** remaining 56 staged seeds per leg
  (107678–107733), 8 processes × 7 seeds per leg.
- **Analysis (judged):** analyzer `--dir` per leg;
  `--compare` floor-4 staged vs floor-3 staged (its verdict field
  is inapplicable on this arm by construction — its pilotGO bar
  requires ctl bundled == 0 — as floor-b §3 records; the frozen
  bars are the judge); tier tally per leg; holdout test
  `--analyze` (paired deaths table + bar verdicts); panel build +
  compare; per-seed staged table in the evidence file (seed,
  staged arrival day/holder, cells, fights by wave, volleys,
  shots/hits/dmg) for BOTH legs, plus a matched per-seed paired
  table (seed, days, end, wave, standing, deaths ctl/arm/delta,
  starv, contests, kill-loot volleys) for all 64 pairs.
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median/max survival.
- **Sense-test:** read the census/volley/grant records for a
  firing holder as a village story; the driver records no
  dialogue text, so the sense-test judges from equip/carry/fight
  behavior and any grant/corpse-take narration in the records —
  said plainly, not faked.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read; no
  canon doc covers the kill-loot roll table, the bundle, or the
  CELLGATE floor — the numbers are code-derived (killbundle-b §2,
  fieldFights.js), said here rather than inventing canon. Wave 3
  is "The Final Draft" (day 25+ AND 4 wave-2 ledger points);
  wave 4 is "The Mirror Draft" (standing ≥ 100). A wave-3 firing
  spends the cells on a mid-build fight (HP 240–420) instead of
  saving them for a wave-4+ mirror fight (HP 850–1500) — that
  trade is the design question the flip decision owns.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
- **Base-merge write flap (2026-11-24 ~00:32–00:46 UTC):** the
  first `git merge --ff-only master` (3df28e069 → f5d2c3caa) ran
  ~13 min (index refresh over 110k tracked files under load
  ~10) and then failed writing the 4 version-bump files
  ("unable to write file index.html / src/js/build.js / sw.js /
  version.json"). Inspection showed all 4 files truncated to 0
  bytes (hash e69de29b… = empty) while the index still pointed at
  the HEAD blobs — the flap's signature (truncate, then refuse
  the write). Writes probed working again at 00:54 UTC; the 4
  files were restored from HEAD (`git checkout HEAD -- …`,
  hashes verified byte-identical to HEAD blobs), and the merge
  was retried: exit 0, HEAD f5d2c3caa, all 4 files' worktree
  hashes match the f5d2c3caa blobs. No game-code delta in the
  merge (verified `git diff 3df28e069 f5d2c3caa -- src scripts`
  empty). Recorded here so the anchor story is complete.
- **Heartbeat lock contention:** `worktree-heartbeat.sh` at
  01:04 UTC failed ("registry lock held > 120s — heartbeat
  skipped, retry later") — siblings hold the registry lock under
  load. Retry during the run; a skipped heartbeat is not a dead
  tree (the tree is registered; the lock is the contention).
- `node scripts/check.js --quick` is NOT re-run in this arm (64
  min on the 2130Z adoption log; arm instruments green). The
  repo rule is noted; the arm's proof surface is the bar-1 suite
  above.
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  '<per-seed-evidence-glob>' --metrics national,table,wins,exiled`
  at closeout; floor-b's run found the checker refuses
  recorder-corpus input (no LOUD lines) — if it refuses again,
  record the refusal and report the wall numbers from the
  analyzer, never faked.
