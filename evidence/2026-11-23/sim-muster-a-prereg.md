# sim-muster-a — PREREG (frozen)

**Arm:** sim-muster-a · **Loop A run:** fleshout-20261123T1415Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** tracker
next blank #1 — THE PARTY NEVER MUSTERS: THE COMPANION POOL READS
ELIGIBLE 0 (`hidden_files/sim-findings.md` line 2711,
evidence/2026-11-23/sim-launchsilence-a.md §3b/§4/§8)
**Type:** DIAGNOSTIC (no game change, no new policy; one control leg only)
· **Base master:** `8a949703afbc81fdb23073dbbbef601ced25d72c` (worktree
`~/workspace/worktrees/sim-muster-a`, branch `sim-muster-a`;
verified equal to `git rev-parse HEAD` at run start 2026-11-23
~14:35 UTC; the coordinator's claim
`hidden_files/lever-claims/fleshout-20261123T1415Z.json` names this
arm on band 107617–107632)
**Frozen:** 2026-11-23 ~14:40 UTC, before any judged run. No judged run
has run.

## 0. Why this run (read first)

On the launchsilence band 107517–107532 (16 seeds, 150d, competent
verbatim), three villages form a wave-4+ plan and the holder waits alone
for the whole plan life — the dawn scorer offers `party_wait` every day
and `party_launch` is never even among the candidates, because the
companion pool reads eligible 0 on every measured muster day (seed
107526: eligible 0 on all 11 pool rows; zero free rangers at Haven on
the sampled plan days). Seed 107529 is the sharpest case: standing 480,
wave 5 unlocked, a wave-4 herald killed in the wild day 108, yet six
holders cycle through one plan over 38 days and nobody ever musters.

The question this arm answers: is the companion pool really empty on
muster days (villagers dead, out, or engaged), or does the muster never
ask them? Two halves, both measured from the code, not invented:

- **Pool-empty:** per muster day, the per-villager eligibility breakdown
  — alive? at Haven? free (not on an expedition, not engaged elsewhere)?
  profile? armed? sick or wounded? — each ineligible villager counted
  at its first failing check, in `findCompanion`'s own check order.
- **Never-asked:** whether `findCompanion` was called at dawn for that
  holder and what it returned — observed directly at the call site
  (`vbrainFeedExtras` → `winPlanCands` → `findCompanion`), plus whether
  `party_launch` appeared in the dawn scorer's candidate list that day
  (present/absent, and its score vs `party_wait` when present).

## 1. Band — FRESH (verified by this arm, not only by the coordinator)

**Band: 107617–107632 (16 seeds).** Pilot 107617–107624, confirm
107625–107632. Freshness check (seed-band skill: every dated prereg
under `evidence/*/sim-*-prereg.md`, plus all `evidence/2026-11-2*/*.md`):

- `grep -rEn "10761[7-9]|10762[0-9]|10763[0-9]|10764[0-9]|10765[0-9]|10766[0-9]"`
  over `evidence/*/sim-*-prereg.md` + `evidence/2026-11-2*/*.md`:
  **zero hits** for the whole coordinator scope 107617–107669 (the
  earlier `10762`/`10763` hits in 2026-10-29 preregs are the five-digit
  October seeds 10762/10763, creekpath/nighttravel bands 10750–10781 —
  not this range).
- The coordinator's claim (`fleshout-20261123T1415Z.json`, started
  2026-11-23T14:15:52Z) assigns this arm 107617–107632 and the sibling
  arm sim-planform-a 107633–107648; sibling Loop B claim bands
  107471–107494 and 107533–107581 do not overlap. No forbidden /
  contaminated band list names 107617–107632.

## 2. The instrument (new this run)

Copy of the proven recorder `scripts/launchsilence-driver-a.js`
(itself the launchfunnel + planignite instrument, incl. the
2026-11-23 pilot-v1 fix: the brain wrap reads the holder's plan
BEFORE the call) → `scripts/muster-driver-a.js`, deltas frozen here:

1. Output evidence dir 2026-11-23 (`EVIDENCE_DATE` override), run
   `muster-a`, MODE `ctl` (single control leg; CLI refuses any other
   MODE), file names `muster-a-s<seed>-muster-a-ctl.json`.
2. Policy module `scripts/policies/tableseat-nowait.js` (see §3).
3. Anchor pin: `FROZEN_BASE =
   8a949703afbc81fdb23073dbbbef601ced25d72c`. The CLI refuses to run
   unless run-time `git rev-parse HEAD` IS the frozen base; the corpus
   records `anchorCommit` (frozen) + `anchorHead` (run-time) side by side.
4. NEW `muster` stream: one row per `vbrainFeedExtras` call (the dawn
   objective pick, `villager-objectives.js:660` — one feed+score pair
   per pick) for a holder whose plan, read BEFORE the call, is wave-4+
   (`needWave >= 4` or target in the wave-4+ roster). Row: day, part,
   holder, plan {stage, target, needWave, party}, the win-plan
   candidates ADDED by the feed (diff of the candidate list before /
   after the call: winPlanAction, companion, w), the ask classification
   (§5, pure function `classifyMusterAsk`), and the companion-pool
   snapshot taken at the same call (same `poolReplica` as the
   `companionPool` rows, extended — see delta 6). A muster DAY is one
   (holder, day) group at part 0; non-0 parts are recorded but do not
   define muster days.
5. NEW `musterExtra` stream: wraps of `Game.winPlanSecondCompanion`
   and `Game.winPlanThirdCompanion` (both documented PURE READ in
   `win-plan.js`, no gear-up, no state writes, no RNG): day, holder,
   first (second) companion(s) passed in, returned id or null. Records
   whether the trio/quad muster is ever asked. These fire only when a
   first companion exists, so they are downstream of the first-companion
   question, not a second population.
6. `poolReplica` members EXTENDED (additive fields only — the existing
   `counts` / `fails` / `eligible` / `members` shape is unchanged, so
   the launchsilence analyzer logic still applies): per member `armed`,
   `armored`, `sick`, `health`, `maxDist` (range-0 flag source),
   `killer3` (a wave-3+ kill in `state.waveKillLog`). These are CONTEXT
   attributes, NOT first-fail causes: the first-fail taxonomy stays
   `findCompanion`'s check order (§5), so the counts still sum to
   rosterN. Armed/sick/wounded never disqualify a companion from the
   POOL — they are `companionLaunchable` bars at depart time
   (`win-plan.js:729`: gear-up then armed-or-armored, sick stays home,
   range-0 cannot go, hurt <70 with no medicine and no healer sits
   out) — and the analyzer reports them separately, never folded into
   the pool causes.
7. `firstCallerFrame` skip list gains `muster-driver-a.js`.
8. Recorder env flag `MUSTER_RECORDER` (off skips the wraps —
   determinism / neutrality leg).
9. Top-level `musterFeedCalls`: count of `vbrainFeedExtras` calls
   observed (any vid) — proves the new wrap is live even on a seed
   with no wave-4+ plan.

New analyzer `scripts/analyze-muster-a.js`: reads the per-seed corpora,
computes per-seed muster-day events + eligible-0 classification (§5),
launch counts (the launchsilence definition: distinct (vid, day)
launches across `v4departs` + `dawnbidDeparts`, with the score-row /
planCensus fallback join), and wall numbers; `--selftest` required
before the band (one synthetic corpus per taxonomy row + ask
classification fixtures + determinism checks); `--diff` compares two
corpus dirs seed by seed on (classification summary, launches, days)
for the determinism check.

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
  the silence to explain was measured under competent verbatim
  (launchsilence band), and recording the muster under courtship-on
  leanlinkrescue would measure a different muster. If the coordinator
  intended the seat/courtship layers ON, that is a different arm, not a
  re-score of this one.
- **Substrate env (read by game code), identical to the launchsilence
  prereg §3:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
  `PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
  (`PROFILEGATE4` unset matters here: the profile gate in
  `findCompanion` applies in full — a non-ranger is never eligible.)
- **Horizon:** 150d death-aware (dead villages stop simulating, +10d tail
  max — the sim-harness death-aware horizon, as on the launchsilence
  band). Why 150d: the silence is a 150d-band fact; the muster needs
  the full wave-4 window (standing 100 + readiness) to open and close.

## 4. The question

On a fresh 16-seed band under the launchsilence substrate, for every
muster day of a wave-4+ plan holder: was `findCompanion` asked at dawn
and what did it return, and for every muster-day eligible-0 event, what
disqualifies each villager — counted by cause, from the code?

## 5. Taxonomy (frozen — evaluated in order, first match wins)

### 5a. The ask — `classifyMusterAsk(planBefore, addedCands)` (pure function)

Grounded in `winPlanCands` (`src/js/villager-brain.js:217–306`), which
`vbrainFeedExtras` calls once per scoring pick. `findCompanion`
(`villager-brain.js:153`) is called exactly once inside it, AFTER the
gear-stage early return and BEFORE the stage branches:

| askKind | Meaning (from the code) | `findCompanion` |
|---|---|---|
| `party_launch` | a launch candidate was added, carrying companion X | asked, returned X |
| `party_wait` | stage `party`, no companion | asked, returned null |
| `veteran_guard` | stage `table` + holder killed wave-4+ + no companion | asked, returned null |
| `no-candidate` | stage `hunt`/`standing`/`table` (no wave-4 kill), no companion — `winPlanCands` adds nothing | asked, returned null |
| `gear_hold` | stage `gear`, holder unarmed+unarmored — the early return fires BEFORE `findCompanion` is called | NEVER ASKED |
| `no-plan` | no plan / no stage at scoring time | NEVER ASKED |

Note the asymmetry the taxonomy preserves: `party_wait` exists ONLY
for stage `party`. A `hunt`/`standing`/`table` holder with no companion
gets NO candidate at all — the scorer offers nothing win-plan, not even
a wait. And a `gear` holder is never asked, however empty or full the
pool is: the pool is irrelevant until the holder gears up.

The depart-side ask is recorded separately and is NOT part of this
taxonomy: `winPlanDepart` → `launchParty` calls the win-plan copy of
`findCompanion` (`win-plan.js:244`) and then `companionLaunchable`, but
only when the depart gate is reached (gear passed, dead-target check
passed, stage in party/hunt/standing/table or the table veteran guard).
The analyzer cross-checks, per holder-day: dawn pick (`party_launch`)
with no `v4departs` row that day = the depart was never asked — a
third never-asked layer, reported as a secondary table, not a bar.

### 5b. The eligible-0 event — classification (first match wins)

A **muster day** is one (seed, day, holder) with a wave-4+ plan held at
dawn scoring (part 0). An **eligible-0 event** is a muster day whose
pool snapshot reads eligible 0, PLUS a holder-day with no part-0
muster row at all (the holder held a wave-4+ plan at end of day per
`planCensus`, holder alive, but was never scored at dawn — the muster
was never asked that day). Population A (scored, eligible 0) + population
B (never scored) are judged TOGETHER by bars 1–2.

| # | Cause | Code-grounded definition |
|---|---|---|
| 1 | `never-asked:stage-gear` | Scored muster day, askKind `gear_hold`: `findCompanion` never called (stage `gear` early return). Pool eligible 0 is incidental — the muster never asked. |
| 2 | `never-asked:holder-not-scored` | Holder-day with no part-0 muster row. Sub-cause from the holder's end-of-day state (`planCensus` holderAlive/holderNode/holderExped + `igniteCensus`): `holder-on-expedition` / `holder-not-at-haven` / `scored-other-part-only` (a muster row exists at part ≠ 0 that day) / `unknown` (no state explains it — counts toward `unclassified` if it ever fires; see below). |
| 3 | `pool-empty:<cause>` | Scored muster day, asked (`party_wait` / `veteran_guard` / `no-candidate`), eligible 0. `<cause>` is the MODAL first-fail among the roster's non-eligible members, ties broken by `findCompanion`'s check order: dead > away > trustLow > notAtHaven > engaged > notRanger > onExped. The full counts vector is recorded on the event so the modal call is auditable. First-fail causes (the pool's disqualifiers, in check order): `dead` (getPerson dead), `away` (v.away), `trustLow` (trust < 15; undefined → 10, so unknown trust FAILS), `notAtHaven` (npcNode ≠ Haven tile), `engaged` (isEngaged), `notRanger` (profile neither wanderer nor explorer; PROFILEGATE4 unset), `onExped` (agencyState.exped). Self/scholar (holder + scholar) are excluded from the population, exactly as the loop excludes them. |
| 4 | `unclassified` | The classifier could not determine a cause (missing `muster` / `planCensus` streams, or an instrument error on that seed). Must be 0. |

NOT a cause: `armed` / `sick` / `health` never disqualify anyone from
the pool — they are `companionLaunchable` bars at depart time. A
villager who is eligible-but-unarmed is still picked by
`findCompanion`; whether they can go is decided at launch. The
analyzer reports, per event, how many eligible villagers are
unarmed+unarmored / sick / hurt, as a SEPARATE launchability table —
it never renames a pool cause.

### 5c. What is NOT an eligible-0 event (excluded from bars 1–2, counted separately)

- Scored muster days with eligible > 0 (`asked:companion-found`):
  the muster exists. Reported as the muster rate (found / scored days).
- Muster days where the dawn pick was `party_launch` (the launch was
  offered): reported with the launch count.
- Holder-days where the holder is dead at end of day (planCensus
  holderAlive false): the plan is orphaned, not a muster day.

## 6. Pre-registered bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 90% of muster-day eligible-0 events classified with a named cause (causes 1–3 count as named; cause 4 does not) |
| 2 | PRIMARY — unclassified | 0 unclassified muster-day eligible-0 events |
| 3 | Determinism | A replay of 2 pilot seeds (107617 + one pilot seed with muster days, named in the evidence) reproduces the classification summary AND the launch count exactly (analyzer `--diff`: 2/2 seeds match) |
| 4 | Recorder neutrality (launchsilence §12 lesson) | The same 2 seeds with `MUSTER_RECORDER=off` reproduce the RECORDER-INDEPENDENT game outcomes exactly — `winPlanStats.partyDepartures`, survival days, maxWave, standing, total deaths, VF killCalls. Never compare recorder rows across legs: they are empty by construction when off. |
| 5 | Instrument validity | Proof test `scripts/test-muster-a.js` green (classification completeness + determinism fixtures, incl. old-code-fails control where the fixture demands it); analyzer `--selftest` green; 0 instrument errors on all 16 seed files; tick-gate mismatches 0; muster-pool cross-check: the muster row's pool counts agree with the same (vid, day) `companionPool` row on every muster day (the two snapshots read the same dawn state) |
| 6 | Pilot gate (8 seeds 107617–107624, before the confirm half) | Bars 1–2 evaluated on the pilot NON-LAUNCHERS' eligible-0 events (≥ 90% named, 0 unclassified) AND bar 5 on the pilot seeds. A pilot failure stops the run (DIAG-NO-GO at pilot, no confirm spend). The all-pilot-events numbers are reported alongside; the gate is the non-launcher subset, per the brief. |

Balanced panel (§15): N/A — single control leg, no before/after
comparison; the panel is the instrument only where a comparison applies.
No panel is run and none is claimed. The pre-registered threshold above
is the judge either way.

## 7. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 5, fixtures only).
2. Pilot: 8 seeds 107617–107624, control leg, recorder on.
3. Pilot gate (§6 bar 6). If it passes: determinism + neutrality replays
   on 2 pilot seeds (bars 3–4).
4. Confirm: 8 seeds 107625–107632, control leg, recorder on.
5. Analyzer over all 16; evidence + sense-test (one plan-holding
   village that never musters, §8).

## 8. Sense-test (frozen)

Pick one village that forms a wave-4+ plan and never musters, and read
its days as a story: its muster rows (who was asked, what the pool
read, what disqualified each villager), its departure-beat lines
(`vetSays` / beat lines in the corpus), and its death/loss story. Judge
whether the silence is sensible (nobody alive at Haven to muster — the
pool really is empty) or senseless (villagers stand at Haven, free and
ranging, and the muster never asks them). The verdict section names the
village and quotes it.

## 9. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median survival,
max survival, villages lost, total deaths — on the control leg (16 seeds).

## 10. Metric review (to fill at evidence time, never mid-run)

- Whether the modal-cause call (largest first-fail count) hid a second
  cause that dominated on the days that mattered (counts vector vs modal).
- Whether the never-scored population (B) was real or zero — and if
  real, whether its sub-causes name a scorer gap or a holder-state fact.
- Whether `gear_hold` days (never-asked) are a large share of muster
  days — if so, the gear stage, not the pool, is the first wall.
- Whether the launchability table (eligible-but-blocked at depart)
  changes the story: a pool that reads non-empty but never launches.
- Whether the tableseat-nowait-layers-off reading (§3) should have been
  layers-on, and what that would change.
- Whether the band (107617–107632) changed anything vs the
  launchsilence band (it must not — the band is fresh, not selected).

## 11. Freshness check (record, per the seed-band skill)

- Searched: all `evidence/*/sim-*-prereg.md` + all
  `evidence/2026-11-2*/*.md` for `10761[7-9]|10762[0-9]|10763[0-9]|
  10764[0-9]|10765[0-9]|10766[0-9]` (coordinator scope 107617–107669).
- Result: ZERO hits. (Earlier `10762`/`10763` hits in 2026-10-29
  preregs are the five-digit October seeds 10762/10763,
  creekpath/nighttravel bands 10750–10781 — not this range.)
- Coordinator claim `fleshout-20261123T1415Z.json` (started
  2026-11-23T14:15:52Z): this arm 107617–107632, sibling
  sim-planform-a 107633–107648, sibling Loop B bands 107471–107494
  and 107533–107581 — no overlap.
- No forbidden/contaminated band list names 107617–107632.

## 12. Canon note (read first, per the brief)

Read: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave 4/5 gates:
standing ≥ 100 / ≥ 200 + wave-4 faced; readiness bars armored/armed/
tricks/veterans), `docs/PARTY.md` (the player's party system: System
unlock day 7, trust affects acceptance not eligibility, cap 3→4→5).
**No canon doc covers the win-plan muster.** `PARTY.md` is the
player's party, not the win-plan companion pool; the muster mechanism
here is grounded in code only — `villager-brain.js` `winPlanCands` /
`findCompanion`, `win-plan.js` `findCompanion` /
`companionLaunchable` / `extraCompanionScan`, `villager-objectives.js`
`objPick` feed+score pair — with call text cited in the proof test.
Nothing in the taxonomy is invented canon; where the code is silent
(e.g. why a holder is never scored), the taxonomy says `unknown` and
counts it unclassified rather than guessing.

## 13. CORRECTION — analyzer / proof-test file names (2026-11-23 ~15:00 UTC, before any judged run)

The prereg as frozen above names `scripts/analyze-muster-a.js` and
`scripts/test-muster-a.js`. Both names are TAKEN on master by the landed
October 2026-10-30 sim-muster-a arm (Herald muster-diag probe, commit
`1bec3ced8`; prereg `evidence/2026-10-30/sim-muster-a-prereg.md`) —
`analyze-muster-a.js` joins muster snapshots to the refusalsay pilot
population, `test-muster-a.js` is that probe's fixture suite. Overwriting
them would destroy a landed arm's instrument (and `test-muster-a.js`
may sit on the green list). This arm's files are therefore
`scripts/analyze-muster-a2.js` and `scripts/test-muster-a2.js`
(the driver name `scripts/muster-driver-a.js` was free — no collision).
Bar 5 (§6) is judged against the -a2 files. No bar threshold changed;
no judged run has run.
