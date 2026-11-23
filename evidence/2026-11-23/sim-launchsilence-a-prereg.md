# sim-launchsilence-a — PREREG (frozen)

**Arm:** sim-launchsilence-a · **Loop A run:** fleshout-20261123T1115Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** 0815Z round
next blank #2 — the launch funnel's silence (11/16 villages launch nothing
on either leg of the homebody band)
**Type:** DIAGNOSTIC (no game change, no new policy; one control leg only)
· **Base master:** `fdd7042b8b8d6385ee1e717aad3acfd89d7bd57f` (worktree
`~/workspace/worktrees/sim-launchsilence-a`, branch `sim-launchsilence-a`;
verified equal to the main tree's master tip 2026-11-23 ~11:56 UTC; the
homebody handoff `f99f9c0c6` is in history, so the funnel recorded here
is current-master behavior)
**Frozen:** 2026-11-23 ~11:56 UTC, before any judged run. No judged run
has run.

## 0. Why this run (read first)

On the homebody band 107455–107470 (16 seeds, 150d, competent verbatim),
**11/16 villages launch NOTHING on either leg** (launches 15 → 16 total
across the whole band; one seed, 107466, carries nearly half the band's
launches). The homebody block is certified and narrow (pool 3, all
converted) — it is not the wall on this band. The village plans, or
doesn't; something in the funnel dies silently. This arm decomposes
that silence: per village, per day, the funnel stage — plan exists?
plan ignites? launch attempted? — and for every village that never
launches, its FIRST-FAIL stage, named from the code, not invented.

## 1. Band — COLLISION, band moved (read this before using the corpus)

**Assigned band 107501–107516 is NOT fresh — COLLISION.** Freshness
check (seed-band skill: every dated prereg under `evidence/*/sim-*-prereg.md`,
plus all `evidence/*/*.md`):

- `evidence/2026-11-22/journey-endgame-r270-prereg.md:129` names band
  **107501–107508** (8 seeds, Pass T TRIBUTE_FIRST=1); its evidence
  `evidence/2026-11-22/journey-endgame-r270.md` judges seeds 107501–107508
  (107501 sat FULL d119 and won). The assigned band's whole pilot half
  is used.
- No prereg and no `.md` evidence names any of 107517–107539 (grep
  `10751[7-9]|10752[0-9]|10753[0-9]` over `evidence/*/sim-*-prereg.md`
  and `evidence/2026-11-2*/*.md`: zero hits).
- Loop B's live claim (`hidden_files/lever-claims/fleshout-loop-b-20261123T0230Z.json`)
  screens bands from 107471 upward; its gateavoid-doorrich-b arm screened
  107471–107478, 107479–107486, 107487–107494 only (its prereg already
  records 107501–107508 as used, journey-endgame-r270). Loop B has NOT
  named 107517+ anywhere.

**New band: 107517–107532 (16 seeds).** Pilot 107517–107524, confirm
107525–107532. **COORDINATOR NOTE: the sibling arm sim-departsafe-a was
assigned the same collided band 107501–107516.** This arm moved to
107517–107532; if departsafe-a also moves, the coordinator must confirm
both arms land on the SAME band or the shared-band comparison is void.
This arm's corpus is `perseed-launchsilence-a-ctl/` on 107517–107532
regardless.

## 2. The instrument (new this run)

Copy of the proven recorder `scripts/planignite-driver-20261116.js`
(itself the launchfunnel + planignite instrument: v4seeds / v4departs /
v4gates / v4encounters / dawnbidScores / dawnbidDeparts / dawnbidCensus /
dawnbidStarts / companionPool / v4creates / planCensus / havenTickCalls /
tickGates / tickGateChecks / tickGateTotals / igniteCensus / igniteVillage)
→ `scripts/launchsilence-driver-a.js`, deltas frozen here:

1. Output evidence dir 2026-11-23 (`EVIDENCE_DATE` override), run
   `launchsilence-a`, MODE `ctl` (single control leg; CLI refuses any
   other MODE), file names `launchsilence-a-s<seed>-launchsilence-a-ctl.json`.
2. Policy module `scripts/policies/tableseat-nowait.js` (see §3).
3. Anchor pin (launchfield §6 fix): `FROZEN_BASE =
   fdd7042b8b8d6385ee1e717aad3acfd89d7bd57f`. The CLI refuses to run
   unless run-time `git rev-parse HEAD` IS the frozen base; the corpus
   records `anchorCommit` (frozen) + `anchorHead` (run-time) side by side.
4. NEW `funnelStage` stream: one row per seed-day (end-of-day pure reads
   in the existing daily pass): day, villageAlive/lost, standing,
   unlockedWave (maxWave), nPlansW4 (wave-4+ plans held), nPlansAny,
   havenTickCallsToday, creationsToday, departAttemptsToday,
   launchesToday, and `stage` = highest funnel stage reached by end of
   that day (0 no-plan / 1 plan-exists / 2 plan-considered-at-dawn /
   3 depart-attempted / 4 launched). Plus a `funnelVillage` end-of-run
   row per seed (max stage, first-launch day, lost day).
5. NEW `deadTargetChecks` stream: wrap of `winPlanCommitDeadTarget`
   (pure read of its return + plan target before/after): the no-target
   stage is measured, not guessed.
6. The `winPlanDepart` wrap additionally records, read BEFORE the call:
   stageBefore, holder gear (armed/armored), holder launch-block
   (`deriveLaunchBlock` replica: sick / range-0 / hurt-no-medicine-no-healer
   / null), so a hold row carries its cause inputs.
7. `firstCallerFrame` skip list gains `launchsilence-driver-a.js`.
8. Recorder env flag `LAUNCHSILENCE_RECORDER` (off skips the wraps —
   determinism / neutrality leg).

New analyzer `scripts/analyze-launchsilence-a.js`: reads the per-seed
corpora, computes per-seed launches + first-fail (see §5), the stage
decomposition table, and wall numbers; `--selftest` required before
the band (classification completeness + determinism fixtures).

All wraps remain pure reads + driver-local writes; no game-state writes,
no RNG. Zero `src/js` changes in this arm.

## 3. Policy + substrate (frozen)

- **Policy module:** `scripts/policies/tableseat-nowait.js` (the brief's
  baseline). **Layers OFF:** `TABLESEATNOWAIT` unset and `LEANLINKRESCUE`
  unset — the driver CLI refuses to run if either is `'1'`. With both
  layers off, `tableseatNowait.daily` delegates to `leanlinkrescue.daily`,
  which delegates to `competent.daily` (both modules' det-gates pin
  off-daily as competent.daily byte-identically; the existing test
  `scripts/test-tableseat-nowait-sweep.js` is re-run green in the proof
  step). Net effect: **competent verbatim play**, recorded as
  `policy: 'tableseat-nowait (layers off → competent verbatim)'` with
  the shas of all three policy files on every corpus. This is deliberate:
  the silence to explain was measured under competent verbatim (homebody
  band), and recording the funnel under courtship-on leanlinkrescue would
  measure a different funnel. If the coordinator intended the seat/courtship
  layers ON, that is a different arm, not a re-score of this one.
- **Substrate env (read by game code), identical to the homebody band:**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`, `PRESENCE`,
  `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
- **Horizon:** 150d death-aware (dead villages stop simulating, +10d tail
  max — the sim-harness death-aware horizon, as on the homebody band).
  Why 150d: the silence is a 150d-band fact; the funnel needs the full
  wave-4 window (standing 100 + readiness) to open and close.

## 4. The question

On a fresh 16-seed band under the homebody substrate, for every village
that launches nothing in 150 days: at which funnel stage does it first
fail, and what blocks it there? The stages are defined from the code
(`src/js/win-plan.js` `winPlanDepart` / `winPlanHavenTick` /
`winPlanSeedFromFight` / `winPlanCommitDeadTarget`, `src/js/standing.js`
`unlockedWave` / `waveCombatReadiness`), §5.

## 5. First-fail taxonomy (frozen — evaluated in this order, first match wins)

A "launch" is a `v4departs` row with result `'launch'` for a wave-4+
plan (targetWave ≥ 4 or target in the wave-4+ roster). Non-launcher =
0 such launches in the run. For each non-launcher:

| # | First-fail stage | Code-grounded definition |
|---|---|---|
| 1 | `village-lost-before-launch` | Village lost AND maxWave < 3 at loss: the village died before the funnel's prerequisites (wave 3: day 25 + 4 w2 ledger points) ever existed. The loss is the whole story. |
| 2 | `gate-says-wait` | maxWave < 4 at end of run AND NOT stage 1: the wave-4 door never opened in the run (standing held below 100 and/or readiness short — `ready4` short bars recorded at end). The funnel never existed. |
| 3 | `no-plan-created` | maxWave ≥ 4 AND no wave-4+ plan ever created (no `v4creates` row with a wave-4+ target, no wave-4+ `planCensus` row). Door open, village never formed a plan. |
| 4 | `plan-never-ignites` | A wave-4+ plan existed AND no dawn depart consideration ever occurred (no `v4departs` row for any holder AND no `dawnbidScores` row carrying a `winPlanAction` for a holder). The plan sits in the store. Detail: `never-offered` (party_launch never a dawn candidate) / `offered-never-picked` / `holder-never-at-haven`. |
| 5 | `no-target` | Plan considered AND every consideration ended on a dead target: all `deadTargetChecks` rows `'held'`, or the plan's target null on every `planCensus` row after first creation. (`winPlanCommitDeadTarget` runs before any launch in `winPlanDepart` — causally prior to companions.) |
| 6 | `no-companions-available` | Depart attempted AND the terminal hold is companion absence: on the last hold day the `companionPool` row has eligible == 0 (or no companion was ever picked in any `dawnbidDeparts` row). |
| 7 | `holder-blocked` | Depart attempted AND the terminal hold is the holder: gear-stage hold (holder unarmed AND unarmored at stage `'gear'`), or `deriveLaunchBlock` non-null at the last hold (sick / range-0 / hurt-no-medicine-no-healer), or a veteran-guard hold at stage `'table'`. |
| 8 | `other` | Depart attempted AND the terminal hold matches none of 5–7. The row evidence is attached for manual audit. A large `other` count means the taxonomy is incomplete (see metric review). |
| 9 | `unclassified` | The classifier could not determine a stage (missing streams / instrument errors on that seed). Must be 0. |

Terminal-hold rule: when several holds occur across days with different
causes, the first-fail names the cause of the LAST hold (the block that
persisted to the end of the window); the per-seed detail records the
full hold-cause history (counts per cause) so the classification is
auditable. The stage order above is the funnel's causal order, not the
chronology of holds.

## 6. Pre-registered bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 90% of non-launching villages classified with a named first-fail stage (stages 1–8 count as named; stage 9 does not) |
| 2 | PRIMARY — unclassified | 0 unclassified villages |
| 3 | Determinism | A replay of 2 pilot seeds (one launching, one silent — 107517 + one silent pilot seed, named in the evidence) reproduces the classification AND the launch count exactly |
| 4 | Recorder neutrality | The same 2 seeds with `LAUNCHSILENCE_RECORDER=off` reproduce the launch counts AND survival days exactly (the recorder does not perturb the game) |
| 5 | Instrument validity | Proof test `scripts/test-launchsilence-a.js` green (classification completeness + determinism fixtures, incl. old-code-fails control where the fixture demands it); analyzer `--selftest` green; 0 instrument errors on all 16 seed files; tick-gate mismatches 0 |
| 6 | Pilot gate (8 seeds 107517–107524, before the confirm half) | Bars 1–2 evaluated on the pilot non-launchers (≥ 90% named, 0 unclassified) AND bar 5 on the pilot seeds. A pilot failure stops the run (DIAG-NO-GO at pilot, no confirm spend). |

Balanced panel (§15): N/A — single control leg, no before/after
comparison; the panel is the instrument only where a comparison applies.
No panel is run and none is claimed. The pre-registered threshold above
is the judge either way.

## 7. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 5, fixtures only).
2. Pilot: 8 seeds 107517–107524, control leg, recorder on.
3. Pilot gate (§6 bar 6). If it passes: determinism + neutrality replays
   on 2 pilot seeds (bars 3–4).
4. Confirm: 8 seeds 107525–107532, control leg, recorder on.
5. Analyzer over all 16; evidence + sense-test (one silent village's
   days read as a story, §8).

## 8. Sense-test (frozen)

Pick one village that launches nothing and read what its days actually
look like: its `igniteVillage`/`funnelStage` rows, its departure-beat
lines (`vetSays` / beat lines in the corpus), and its death/loss story.
Judge whether the silence is sensible (a village with no ranger, no
standing, and no plan has nothing to launch — that silence is honest)
or senseless (a geared village with a plan that never gets asked to go).
The verdict section names the village and quotes it.

## 9. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median survival,
max survival, villages lost, total deaths — on the control leg (16 seeds).

## 10. Metric review (to fill at evidence time, never mid-run)

- Whether the terminal-hold rule (last hold names the fail) hid a
  cause that dominated earlier (hold-cause history vs terminal cause).
- Whether `other` stayed small; if not, what the un-named holds were.
- Whether the tableseat-nowait-layers-off reading (§3) should have been
  layers-on, and what that would change.
- Whether the band move (107517–107532) changed anything vs the
  collided assignment (it must not — the band is fresh, not selected).

## 11. Freshness check (record, per the seed-band skill)

- Searched: all `evidence/*/sim-*-prereg.md` + all `evidence/*/*.md`
  for `10750[1-9]|10751[0-6]` (assigned band) and for
  `10751[7-9]|10752[0-9]|10753[0-9]` (replacement band).
- Assigned band 107501–107516: COLLISION — 107501–107508 named in
  `evidence/2026-11-22/journey-endgame-r270-prereg.md:129` and judged
  in `evidence/2026-11-22/journey-endgame-r270.md` (Pass T, 8 seeds).
- Replacement band 107517–107532: ZERO hits in preregs and `.md`
  evidence. Loop B gateavoid-doorrich-b screened 107471–107494 only
  (its prereg already records 107501–107508 as used).
- No forbidden/contaminated band list names 107517–107532 (none found
  naming this range; the gateavoid prereg's known-used list covers
  107501–107508 and 108001–108008, neither overlapping).

## 12. CORRECTION — bar 4 measurement method (2026-11-23 ~12:20 UTC, before the pilot)

Bar 4 as frozen above says the recorder-off replay must "reproduce the
launch counts AND survival days exactly". That is unmeasurable as
written: the launch counts are observed ONLY through the recorder's own
`v4departs` rows, which are empty by construction when the recorder is
off — a cross-leg comparison of them fails 9 vs 0 on the 30d smoke seed
even though the game trajectory is identical (bisect, seed 107517 30d:
ON vs OFF days 30=30, maxWave 3=3, standing 25=25, deaths 42=42,
killCalls 41=41, winPlanStats byte-identical including partyDepartures
9=9). The first version of the proof test's D2 check failed exactly
that way; the failure is a test bug, not a game perturbation (the
inherited planignite instrument shows the same 9-vs-0 shape on the
same seed for the same reason).

CORRECTED bar 4 (intent unchanged — the recorder must not perturb the
game; method fixed before any judged run): the same 2 seeds with
`LAUNCHSILENCE_RECORDER=off` reproduce the RECORDER-INDEPENDENT game
outcomes exactly — `winPlanStats.partyDepartures` (the game's own
launch count, bumped by launchParty itself), survival days, maxWave,
standing, total deaths, and VF killCalls. The proof test's D2 section
evaluates exactly this. No judged run has run; no bar threshold changed.

## 13. CLARIFICATION — stage 4 scope (2026-11-23 ~12:20 UTC, before the pilot)

§5 stage 4's definition sentence ("no v4departs row AND no dawnbidScores
row carrying a winPlanAction") contradicts its own detail list
("never-offered / offered-never-picked / holder-never-at-haven"):
offered-never-picked REQUIRES a winPlanAction row to exist. The
detail list governs: stage 4 (`plan-never-ignites`) fires whenever a
wave-4+ plan exists and no depart attempt ever occurred, with the
detail naming whether the dawn scorer ever offered a launch
(never-offered / offered-never-picked / holder-never-at-haven). The
one sub-case that is NOT stage 4: offered AND picked, but no depart
call ever recorded — the plan was picked for launch and the call
returned 'normal' (brain path) or never ran; that is `other` with the
detail 'considered-never-attempted'. The analyzer implements exactly
this; its selftest pins both sub-cases (fixtures 5–6 vs the
considered-never-attempted path). No bar threshold changed.

## 14. CORRECTION — brain-wrap post-call plan read + analyzer launch count (2026-11-23 ~13:40 UTC, after the pilot, before the confirm)

The pilot v1 (8 seeds, 107517–107524) ran clean on the frozen bars
(3/3 non-launchers classified, 0 unclassified, 0 instrument errors,
0 tick-gate mismatches) but its headline numbers were WRONG, caught by
reading the two `other` villages' days instead of trusting the count:

BUG 1 (driver): the vbrainExecuteDepart wrap read the holder's plan
AFTER the original call. The execute call consumes/transfers the plan,
so after a brain launch winPlanOf(vid) returns a plan with target and
needWave null. Every brain-path v4departs row in v1 carries target
null / targetWave null, so the analyzer's wave-4+ filter dropped them
all. Pilot seeds 107519 (eulogy plan, holder visjoin_62, d90) and
107522 (eater plan, holder naran_tumen, d45) DID launch — range-0
holders, homebody handoff sent the companion out, the parties went to
stage 'hunt' and fought wave-4 monsters (107522: eater party fought
The Algorithm d45, The Eulogy d47, Adaeze died on the hunt; 107519:
eulogy party out d90–d98) — but counted 0 launches. The analyzer also
undercounted 107523 (8→9) and 107524 (15→16) the same way.
FIX: the brain wrap now reads the plan BEFORE the call (same
discipline as the winPlanDepart wrap) and records targetWave on the
dawnbidDeparts row. The analyzer now counts launches as distinct
(vid, day) events across BOTH v4departs and dawnbidDeparts, with a
score-row / planCensus fallback join that recovers v1-shaped rows
(verified: the fixed analyzer re-reads v1 as 7/8 launching, 42
launches, 1 non-launcher — 107517, no-plan-created).

BUG 2 (analyzer): the `other`-branch brain-normal count was unscoped
— it counted dawnbidDeparts 'normal' returns for ANY plan. Pilot
seed 107519 v1 reported "23 brain normal return(s)"; all 23 were
low-wave plans. FIX: normals are scoped to wave-4+ plans (same
resolver as the launches) and the detail now names the picked plan
(target/day/holder) plus the total count for context.

BUG 3 (driver, minor): lostDay stayed null for villages lost in the
night phase after the last daily snapshot (107519/107522). FIX:
funnelVillage.lostDay falls back to the last simulated day (an upper
bound, noted in the driver comment).

CONSEQUENCE: pilot v1's numbers (5/8 launching, 38 launches, 2
`other`) are SUPERSEDED. The pilot is RE-RUN with the fixed driver
(v2) into the same outdir; the v1 corpus is archived under /tmp (not
committed) and the v1 numbers are recorded here and in the evidence
file only as the superseded run, with the reason. The pilot gate is
re-evaluated on v2. The frozen bars are unchanged; the launch
definition (a v4departs 'launch' row for a wave-4+ plan) is unchanged
— the fix makes the instrument actually record what the definition
says. New selftest fixtures 16–19 + proof-test band seeds 900008–
900009 pin both pilot shapes. Proof test re-run green 50/50 on the
fixed driver before the v2 pilot.
