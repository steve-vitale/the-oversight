# sim-haventickgate-b — PREREG (binding)

Run: fleshout-loop-b-20261117T0430Z (Loop B), axis winnability chain,
arm sim-haventickgate-b — DIAG: WHY do half the villages never ignite
a plan? The havenTick gate's three conditions (wanderer/explorer
profile, at Haven, engaged) read per tick against the empty seeds,
plus the winPlan store-initialization state per seed (the
planignite-a catch-22). Branch `sim-haventickgate-b` (worktree
`~/workspace/worktrees/sim-haventickgate-b`). Base: master `eb8e0cc18`
at arm start (the worktree HEAD; master has since moved under Loop A
— NOT rebased mid-run, coordinator owns the rebase at landing).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-haventickgate-b: frozen prereg — ..."`),
then build.

## The question, in plain words

HavenTick is the plan system's first spark on master as-is, but it is
a coin flip: on haventick-b's control leg 4 of 8 villages never
started a plan in 150 days while surviving, reaching wave 5, and
slaying beasts; planignite-a reproduced the shape on a fresh band
(2 of 8 never start) and found the binding failure is the plan store
itself — `v.winPlan` is lazily initialized by `stateOf()` and
`winPlanHavenTick` reads the store directly and never calls
`stateOf()`, so it can never be the first spark; the two no-plan
seeds had zero initializers of any kind. This DIAG is haventick-b's
named next diagnostic #1, with planignite-a's proposed taxonomy row
(`store-never-initialized`) now a first-class frozen row: read the
havenTick gate's three conditions per tick against the empty seeds
and say which never lines up — profile, Haven presence, or
engagement — or whether the village just never has a ranger at Haven
at tick time — AND record the store-initialization state per seed,
with the store guard's blocked calls counted directly (did havenTick
calls return early on the uninitialized store?).

## Prior art (read first)

- `evidence/2026-11-16/sim-haventick-b.md` + prereg — the instrument
  this arm EXTENDS (creation ledger, planCensus, six creators). Its
  §Next diagnostic #1 names this arm.
- `evidence/2026-11-16/sim-planignite-a.md` + prereg — the direct
  parent instrument this arm EXTENDS (havenTickCalls, tickGates /
  tickGateChecks, tickGateTotals, igniteCensus / igniteVillage, the
  agencyTick Layer-1 gate replica, the store-initializer diagnostic).
  Its §Metric review proposes the `store-never-initialized` taxonomy
  row this arm adopts as a frozen row. Its catch-22 is taken as the
  working hypothesis, NOT as the verdict — this arm re-tests it on a
  fresh band with the store guard counted directly from the calls.
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg;
  `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg;
  `evidence/2026-11-16/sim-companionpool-b.md`;
  `evidence/2026-11-16/sim-launchdef-a.md`.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`,
  `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  havenTick plan creation, departure gates, or the pick lottery
  (checked 2026-11-16 by seedpaths against the `docs/CANON.md`
  manifest). Ground the gate only in `src/js/win-plan.js` and the
  agency tick (`src/js/villager-agency.js`), and say so in the
  evidence file. No canon doc covers the plan store's lazy
  initialization either — it is code-grounded only
  (`src/js/win-plan.js:90-93` `stateOf`, `:340-343`
  `winPlanHavenTick`).

## The gate, in code (frozen — verified in this tree)

Two layers, in order. A plan can be created at a tick only if the
villager passes BOTH:

**Layer 1 — agencyTick** (`src/js/villager-agency.js:357` loop, once
per day-part, hooked after npcNodeTravel): per roster member, first
fail wins — player-skip / dead / `isEngaged` (busy talking, or
titan-committed; `src/js/game.js:20470`) / onExped / notRanger
(unless today's `party_launch` commit bypasses the profile gate —
PROFILEGATE) / notAtHaven (node != village px/py) / night /
indoor-objective (unless a dawn-brain EXPEDITION commit) /
`npcTrigger(rid, 'expedition_launch')` / reached. Only a `reached`
villager gets a `winPlanHavenTick(rid, hx, hy)` call (the single call
site, `:433`).

**Layer 2 — winPlanHavenTick** (`src/js/win-plan.js:340`): first fail
wins — store guard (`!v || !v.winPlan` → return null, `:343`; the
store is lazily initialized by `stateOf()` `:90-93`, which
havenTick never calls) / `atHaven` (`:138`, npcNode == hx/hy) /
profile (wanderer/explorer only, via `npcRangeProfile`) /
engagement — lived (`agencyState().know[vid].fought` non-empty) OR
heard (`state.villageSlain` any type > 0). Only then is a plan
created (stage `gear`, target null, `sinceDay` today).

**Store initializers** (the only paths that call `stateOf()` and so
create the store): `winPlanSeedFromFight` (wave-3+ seed row),
`winPlanNoteKill` (expedition/agency kill), `winPlanFightGate` (via
seed call or `bump`), `winPlanOf` (launch companion), `winPlanStats`
(bond-tend / muster-stand-down bumps), plus `winPlanBondsTick` /
`winPlanMusterTick` (via `bump`). A village with none of these before
a ranger+engaged havenTick call has a store that never existed.

## Design — the gate instrument (frozen)

The driver (`scripts/haventickgate-driver-20261116.js`) is the
planignite driver EXTENDED, not rebuilt (same vetfirst T-class
instrument, same v4seeds / v4departs / v4gates / v4encounters
recorder, same dawnbid bid/census capture, same companionPool
first-fail capture, same creation-ledger v4creates / planCensus,
same havenTickCalls / tickGates / tickGateChecks / tickGateTotals /
igniteCensus / igniteVillage). Deltas, frozen:

1. **Modes:** `MODE=off|on` (planignite was control-only).
   `RUN=haventickgate-b`, `OUTDIR=perseed-haventickgate-b-<mode>`,
   recorder env `HAVENTICKGATE_RECORDER`. OFF leg = master as-is,
   recorder off; ON leg = master as-is + recorder wraps only. No
   seed call anywhere on either leg. ZERO src/js game-behavior
   change survives on the branch.
2. **havenTickCalls rows gain `storeExists`** — `!!v.winPlan` at
   call time (pure read before the call). The outcome taxonomy gains
   **`store-uninitialized`**, checked FIRST after `created` /
   `plan-exists` in `classifyHavenCallOutcome` (mirroring code
   order: the store guard at win-plan.js:343 fires before the
   profile and engagement checks). Outcome set, frozen:
   `created` / `plan-exists` / `store-uninitialized` /
   `profile-fail` / `engagement-fail` / `unexplained-call`.
   A `store-uninitialized` call is one where the store was absent
   at call time and no plan existed — the call returned null at the
   guard, whatever the profile, Haven presence, or engagement said.
3. **storeInitEvents** — a first-class driver array: wraps on every
   `stateOf()` caller reachable in a run — `winPlanSeedFromFight`,
   `winPlanNoteKill`, `winPlanFightGate`, `winPlanOf`,
   `winPlanBondsTick`, `winPlanMusterTick`, `winPlanStats` — each
   recording an absent→present store transition as
   `{day, kind, vid, caller}`. A `runActive` flag gates recording
   to the run itself (the driver's own end-of-run `winPlanStats`
   summary call must not register a spurious initializer). A
   baseline event `{day, kind: 'pre-run', vid: null}` is recorded
   if the store already exists at wrap-install time (after
   `setupGame`). `storeInitEvents` is empty iff the store never
   existed during the run.
4. **tickGates rows gain `storeExists`** (read once per tick) and
   **igniteVillage rows gain `storeExists`** (end-of-day). The
   analyzer cross-checks the first store-present day from
   `storeInitEvents` against the first `storeExists=true` day in
   `igniteVillage` and reports any disagreement as a diagnostic
   (it is an instrument error if they disagree).
5. **Analyzer** (`scripts/analyze-haventickgate-b.js`) extends
   `analyze-planignite-a.js` (same per-seed classification
   machinery, same creation-ledger check via
   `analyze-haventick-b.js`, same wall summary) PLUS the frozen
   taxonomy below, the per-condition failure table, and the
   OFF-vs-ON neutrality comparison.

## Frozen taxonomy — classification of every empty seed

An **empty seed** is a seed with zero plan creations of any kind
(`v4creates` empty). Classification, first match wins, per empty
seed. A **store-guard-blocked call** is a havenTick call with
`storeExists=false` AND profile ranger (wanderer/explorer) AND
(lived OR heard) AND no plan before — a call that would have
created but for the store guard:

1. **`store-never-initialized`** — `storeGuardBlockedCalls > 0`
   (the guard demonstrably ate would-be creations). Sub-blocker:
   first blocked day + blocked-call count. Detail: per-call
   blocked rows (day, vid, lived/heard), `storeInitEvents` (empty),
   first-slain day.
2. **`no-ranger`** — `rangerDays === 0` (zero ranger-days in
   igniteCensus). Detail: modal profile tally + per-villager
   profile score parts (as planignite).
3. **`no-engagement`** — rangers exist but engagement never true
   (heard never, no ranger ever fought). Detail: ranger list,
   heard first day, fought max.
4. **`ranger-never-reaches-haventick`** — rangers exist,
   engagement true some day, but zero havenTick calls for any
   ranger. Sub-blocker = modal Layer-1 first-fail bucket among
   ranger-ticks (`notAtHaven` = the village never has a ranger at
   Haven at tick time; `notRanger`, `onExped`, `engaged`, `night`,
   `indoor`, `trigger` likewise). Detail: ranger bucket
   distribution, reached ticks, explained mid-tick departures.
5. **`haventick-called-no-create`** — havenTick calls for rangers
   exist but zero creations. Sub-blocker = modal call outcome
   (`profile-fail` / `engagement-fail` / `store-uninitialized` for
   calls that were not guard-blocked by rule 1's ranger+engaged
   test). Detail: call-outcome distribution, ranger call days.
6. **`unexplained`** — none of the above (fails bar 3 by
   construction; the taxonomy assumed a named blocker and the
   real blocker was outside it — same rule as planignite-a).

Seeds that DO ignite get `ignited` with first-creation day /
creator / source / vid, total creations, ranger calls, and the
store check: `firstCreationOnOrAfterInitializer` (first creation
day >= first initializer day; same-day possible).

**Per-condition failure table** (the deliverable, per seed): for
every empty seed, the analyzer reports the Layer-1 ranger-tick
bucket distribution, the Layer-2 call-outcome distribution, the
store-guard-blocked call count, and the store state
(`storeEverInitialized`, first initializer day/kind) — so the
dominant failing condition is visible as numbers, not just as the
taxonomy label.

## Primary metric + GO bars (frozen)

Primary metric: **classification completeness of the empty seeds**
— every empty seed named by its dominant failing gate condition
under the frozen taxonomy above, with the per-condition failure
table behind it.

GO (DIAG validity) iff ALL hold:

1. **Corpus + instrument:** 8/8 valid per-seed files parse on EACH
   leg (16 files); 0 instrument errors on either leg (including 0
   tick-gate mismatches on the ON leg — predicted reached == actual
   called on every tick — and 0 null-tick havenTick calls); 0
   `unknown-*` havenTick sources; 0 `unknown-*` seed paths; the
   creation-ledger check holds on the ON leg (every planCensus
   holder traces to a `v4creates` row on/before its first observed
   day — `holdersWithoutCreation` 0).
2. **Proof green:** `scripts/test-haventickgate-b.js` — static /
   judge / recorder green + determinism D1 (recorder ON twice,
   identical full corpus, 60d) + D2 (recorder ON vs OFF, identical
   trajectories, 60d) on seed 103211, + 150d live-run replica
   validation (tick-gate replica holds on every tick) + synthetic
   corpora re-deriving every taxonomy row (incl. the new
   `store-never-initialized` row and the `store-uninitialized`
   outcome fixture). Cross-leg neutrality: the analyzer's ON-vs-OFF
   comparison finds identical per-seed trajectories on (days,
   gameDays, endReason, standing, scaleRank, maxWave, won, deaths,
   waveKillLog) for 8/8 seeds.
3. **Classification completeness:** every empty seed (zero plan
   creations of any kind) on the ON leg is classified by the frozen
   taxonomy (blocker != `unexplained`, unclassified 0). If NO empty
   seed occurs on the fresh band, report the ignition rate + the
   gate-condition distribution and mark the classification N/A with
   reason — never re-score a bar mid-run; put metric doubts under
   "metric review".
4. **Wall numbers on both legs:** national by standing >=200,
   national by scaleRank, table, wins, wave-4 unlocks, wave-5
   unlocks, median survival.

The VERDICT is the per-condition failure table plus the
classification of every empty seed. A DIAG GO means the instrument
is valid and the table is trustworthy — not that any path "wins".

## Seed band (fresh — verified, not reused)

- Band: **103211–103218** (8 seeds), OFF leg first (master as-is,
  recorder off), then ON leg (master as-is + recorder), identical
  seeds, same policy/horizon.
- FRESH (verified 2026-11-17 in the worktree, before this commit):
  `grep -rn "10321[1-8]\|103211\|103218" evidence/*/sim-*-prereg.md
  evidence/*/sim-*-*.md` returns nothing; `grep -rln "103211"
  evidence/ --include="*.md"` returns nothing. Per
  `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`:
  searched every dated prereg under `evidence/` plus the dated
  evidence notes naming bands; no prereg, forbidden list, screen,
  or extension band names any seed in 103211–103218.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over). Sibling Loop A 0415Z is LIVE on
  scale-onramp (rumortarget revert + nightcarry ON leg) — do NOT
  touch its trees, claims, or band. Loop A 0015Z's
  sim-planignite-fix-a (the LEVER that initializes the store on
  first HavenTick) is a separate arm — this DIAG does not build the
  fix; do not rebuild it here.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha `df9b7dff4de4`, verified in the worktree before this commit;
  same sha planignite-a re-pinned to after the landing r140 budget
  stop).
- OFF anchor = the instrument commit (driver + analyzer + proof
  test, recorder OFF); ON anchor = the same commit, recorder ON.
  Both legs run on the same base commit `eb8e0cc18`; the ONLY
  difference between legs is the recorder wraps. After measurement
  nothing is reverted (no seed call exists to revert; no src/
  change exists at all). The branch's `src/` stays byte-identical
  to the base.
- ZERO src/js game-code change: the instrument is driver-side wraps
  only (pure reads + driver-local writes, no RNG, no state). The
  profile replica reads the cached profile when present and
  otherwise recomputes the score WITHOUT writing the cache (a
  cache write would be a state write — planignite rule, kept).
- Determinism: D1/D2 as in §Primary metric (bar 2). Drift check D3
  (same shape as haventick-b / planignite-a): the OFF leg IS the
  drift control — any ON-vs-OFF trajectory difference is
  investigated, not waived.

## Sense-testing (mandatory)

Read transcripts. Read the per-seed rows as stories: does the
named blocker match what the villagers actually did (a ranger
standing at Haven hearing the fire talk about a slain beast, and
no plan starting — is the store really the reason, or did the
villager never stand at Haven at all)? One seed where the recorded
blocker contradicts the day's narration is a finding, not a
rounding error — name it in the evidence.

## Balanced panel (per docs/MEASUREMENT.md §15)

Evaluated and DECLINED with reason, same as dawnbid,
companionpool, poolmarginals, seedpaths, haventick-b, and
planignite-a: the panel (`scripts/balance-panel.js`) runs fresh
multi-policy sims and compares two panel `.json.gz` files — it
cannot compare recorder corpora, and this arm ships no game
change: the instrument is observation-only, the two legs differ
only by the recorder, and the prereg bars are the judge. A panel
here would measure recorder noise across fresh trajectories, not
the judged corpora. The neutrality proof (D1/D2 + the analyzer's
8/8 ON-vs-OFF trajectory identity) is the panel's substitute here.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the store row fire where planignite-a's `unexplained` did
  (same shape, fresh band — does the catch-22 reproduce)?
- Did any empty seed classify under a Layer-1 bucket rather than
  the store (i.e. is the store NOT the only ignition failure)?
- Did any wrap miss a creation (a planCensus holder with no
  `v4creates` row)? Name the missed hook.
- Did any havenTick call carry a null tick (called from outside
  agencyTick)? Name it.
- Was 150d the right horizon, or did ignitions cluster at the
  tail?
- Did the OFF leg reproduce the ON leg exactly (neutrality 8/8)?
  If not, name the first diverging field and seed.

## Wall numbers (report every run)

National (standing >=200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths —
per leg.
