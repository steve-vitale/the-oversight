# Prereg — sim-zeroattempt-b (Loop B, run fleshout-loop-b-20261117T0430Z)

DIAG arm. Expignite-b (DIAG GO, findings #2463 CLOSED) classified the
zero-attempt mechanism on band 103001–103008: seed 103004 survived 150d,
wave 5, standing 300, yet never once committed to an expedition —
B/C-dominated (B/profile 256, B/gate-hunger 198, C/assign 46,
C/core-outdoor 20, C/duty 7, C/hash 4; 0 plan holders; 404
wanderer/explorer days). Sharpest finding: EVERY launch in the band
came through the win plan; the soft wanderer/explorer path produced
ZERO launches in 4,761 villager-days.

This DIAG goes one level deeper — decompose the dawn scorer's decision
chain per villager-day: (a) when no EXPEDITION candidate is offered,
WHICH sub-gate fired (profile? hunger gate before candidacy? duty?
hash? core-pick mix?) and in what order; (b) when ASSIGN overrides the
candidate, what does ASSIGN pick instead and why does it always win;
(c) why 0-plan-holder villages never get a plan (winPlan store ever
initialized? havenTick gate conditions?); (d) does the soft path ever
reach its chance roll, and what does it return. The deliverable is the
decomposition table + classification of every zero-attempt / zero-launch
seed on the band, with the dominant WHY named.

## Code-read ignition chain (read before building; anchors by function name)

Expignite-b's chain (prereg `evidence/2026-11-16/sim-expignite-b-prereg.md`)
still holds on this base. The new decomposition reads:

**(a) Sub-gate order when no candidate is offered.** `expeditionCand`
(`villager-brain.js`) checks its gates in this exact code order:
profile (wanderer/explorer only) → night → `npcTrigger`
`expedition_launch` (danger belief >= 4) → `npcMaxDist` < 1 → sick.
The FIRST failing gate is the fired sub-gate; later gates are never
consulted. The hunger gate is NOT in this list: it fires in `objPick`
(`villager-objectives.js`, `vbrainLogGate(vid, 'EAT', 'hunger')` when
hunger > 55 and pantry > 500) BEFORE `vbrainScorePick` is ever called,
so a hunger day carries a gate row, not a score row. The win-plan
context (plan stage, companion pool, party_wait / gear_hold /
veteran_guard) is a SEPARATE dimension, not a sub-gate: a villager
with a party-stage plan and no companion has no party_launch
candidate, and if their profile is not wanderer/explorer they have no
soft candidate either — the fired gate is profile, the plan context
explains why the plan path did not rescue them.

**(b) ASSIGN override.** `assignFeedCandFor` (`villager-brain.js`)
builds one ASSIGN candidate with **w: 99**; `vbrainScorePick` checks
overrides in order win-plan holds/launches → ASSIGN (`assign_standing`)
→ DUTY top-score → soft EXPEDITION hash. ASSIGN always wins because
99 beats every core weight (≤ ~7) and every soft weight (≤ 0.88), and
it is checked before DUTY and the hash. Assignments never expire:
`assignTask` (`game.js`) writes `v.assignments[vid] = {task,
assignedDay, assignedPart, via, buddy}` with no expiry; only a `rest`
assignment deletes the entry. In sims the assignments come from the
competent policy itself (water/wood/garden via `assignTask`, in-person).
The decomposition records, per C/assign day: the ASSIGN task, the via,
the assigned day, the ASSIGN weight (99), the EXPEDITION candidate
weight it beat, and the core pick weight it beat — plus how many days
each villager stays continuously assigned.

**(c) Why 0-plan villages never get a plan.** `winPlanHavenTick`
(`win-plan.js`) — the function that seeds a plan from lived/heard
knowledge — reads the store directly and returns before anything else:
`if (!v || !v.winPlan) return null;` It never calls `stateOf()`. The
store `v.winPlan` is lazily created by `stateOf()` only through
`winPlanSeedFromFight` (wave-3+ fight, fled/evaded), `winPlanNoteKill`
(any villager kill — `stateOf` runs before the no-plan early return),
`winPlanOf` (only reachable post-plan: party_launch depart / companion
copy), or a fight-gate / bond / muster bump (all require an existing
plan). Until the first wave-3+ seed or agency kill, every havenTick
call returns null at the guard — it can never be the first spark.
This is planignite-a's store finding (`evidence/2026-11-16/sim-planignite-a.md`,
band 102601–102608: 2/8 villages, store never initialized in 150d,
446 unexplained havenTick calls on the two dead villages); this arm
CONFIRMS it in the ignition frame on a fresh band: every havenTick
call records store-exists-before, so the store-missing call count and
the first-initializer day/creator per seed are measured, not assumed.
`agencyTick` (`villager-agency.js`) calls havenTick only for at-Haven,
daytime, non-indoor-objective villagers who pass the danger trigger —
indoor-objective holders and night ticks never reach it.

**(d) Soft-path chance roll.** `vbrainScorePick` consults the soft hash
only when no override fired AND the core pick is indoor
(HAVEN_CHORE/REST/EAT/SEEK): `dawnHashRoll(vid, day, 'exped') < chance`
where `chance = min(0.95, w/2)` (w 0.55 explorer / 0.28 wanderer,
x1.6 potential). The roll is deterministic (FNV-1a, re-implemented in
the analyzer); the decomposition reports, per soft-candidate day:
hash consulted or not (and if not, what pre-empted it: outdoor core,
ASSIGN, DUTY, win-plan), the roll, the chance, pass/fail.

## Taxonomy (frozen — the analyzer classifies every villager-day at home)

Expignite-b's A–F classes unchanged (denominator: alive, at Haven, not
away, not already out). Decompositions added on top, all re-derived
from the raw rows (D3):

- **B-sub (code order):** `gate-<id>` (hunger/low_energy/escape_goal/
  fresh_kill/want_knowledge — gate row pre-empts scoring), else from
  the last score row's inputs, first failing `expeditionCand` gate in
  code order: `profile` → `night` → `trigger` → `range` → `sick`.
  Plan context attached separately: `planCtx = {planStage,
  poolDepth, partyWait|gearHold|veteranGuard}`. (Expignite-b's
  B/plan-no-companion and B/gear-hold rows are plan context, not
  sub-gates; they are reported under planCtx, never as the fired gate.)
- **C/assign:** `assignTask`, `via`, `assignedDay`, `assignW` (99),
  `expedW`, `coreW`, `pick` (the kind the ASSIGN maps to).
- **Hash:** for every soft-candidate score row: `hashConsulted`
  (bool), `hashPreempt` (`outdoor-core` | `assign` | `duty` |
  `winplan` | null), `roll`, `chance`, `hashPass` (bool/null).
- **Plan store:** per seed: `storeEverInit`, `firstInitDay`,
  `firstInitCreator` (`seedFromFight` | `noteKill` | `winPlanOf` |
  null), `firstSlainDay` (first day `villageSlain` > 0),
  `firstFoughtDay` (first day any `know.fought` non-empty),
  `havenCalls` (total, `storeMissing`, `engagedStoreMissing`,
  `engagementFail`), `createsByCreator`, `firstPlanDay`,
  `planHolderDays`. A `havenTick` call with engagement present but
  the store missing is an `unexplained-call` (planignite-a's term).

Unknown bucket: any villager-day fitting none of A–F, any launch whose
origin/block reason fails re-derivation, any depart return contradicting
the post-call expedition record, any plan holder with no creation row.
Unknown must be 0.

## Method

- Band **103201–103208** (8 seeds), competent verbatim (sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c` —
  verified by `sha256sum scripts/policies/competent.js` on this tree,
  2026-11-17), horizon **150d death-aware** (dead villages stop; +10d
  tail max).
- Two legs, zero src/js change: OFF = master as-is, recorder off
  (trajectory reference); ON = master as-is + recorder wraps only.
  Instrument: `scripts/zeroattempt-driver-20261116.js` (extends the
  expignite driver: same score/gate/depart/tick/census/launch rows,
  PLUS candidate `dutyTask`/`assignTask`/`chore`, census
  `winPlanStoreExists` / `knowFoughtN` / `villageSlainN` /
  `assignedTask`, and the creation-ledger wraps
  `winPlanHavenTick` / `winPlanSeedFromFight` / `winPlanOf` /
  `winPlanNoteKill` — creation only when the plan is absent before
  and present after, store-init only when the store is absent before
  and present after; pure reads + driver-local writes, no RNG, no
  game-state writes). The `winPlanOf` wrap OBSERVES game-initiated
  calls only; it never calls `winPlanOf` itself (calling it would
  create a plan — the expignite no-call rule stands for the wraps'
  own reads). Analyzer: `scripts/analyze-zeroattempt-b.js` (reuses
  expignite's `classifyIgnition` + medicduty launch classification,
  adds the B/C/hash/store decompositions above).
- No balanced panel: DIAG, no game change. Per MEASUREMENT.md §15 the
  panel is the instrument for before/after comparisons; this arm
  compares nothing — OFF vs ON is a recorder-neutrality check, not a
  lever. The D2 neutrality proof (identical daily trajectories +
  wall fields, recorder ON vs OFF) is the substitute, exactly as the
  prior DIAGs (expignite-b, haventick-b, planignite-a) recorded it.
- Proof: `scripts/test-zeroattempt-b.js` — static checks + D1
  determinism + D2 neutrality + D3 re-derivation (synthetic + live).

## Seed-band freshness (per the seed-band freshness skill)

- Searched: every `evidence/*/sim-*-prereg.md` for the exact 6-digit
  seeds 103201–103208 (individual alternation); every
  `evidence/**/*.md` for the same seeds;
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/*.md`
  for the same seeds.
- Result: **0 hits in any prereg or goal hidden_files doc. Band
  103201–103208 is fresh.**
- False positives recorded so the next worker does not repeat them:
  the string `103201` occurs as a float substring in old corpus JSON
  (`80.0979643103201`, `1637.495348103201` in
  `evidence/2026-11-07/prodcollapse-a-corpus/` and
  `doublenight-fix-a-corpus-*`) — not a seed band, not a prereg.
- Near-miss bands on record: 103001–103008 (expignite-b, this loop),
  102601–102608 (planignite-a), 102141–102148 (haventick-b),
  102201–102208 (sibling Loop B — do not touch).

## Canon

- Read `docs/CANON.md` first, then `docs/PARTY.md` (party dynamics
  only) and `docs/MONSTER-WAVES.md` (wave law, readiness bars).
- **CANON GAP (recorded, not invented): no canon doc covers expedition
  candidate picking** — who the dawn brain picks as a launch candidate,
  the soft-expedition hash gate, the ASSIGN override, or the
  commit/depart split. The chain above is grounded only in
  `src/js/villager-brain.js`, `src/js/villager-agency.js`,
  `src/js/villager-objectives.js`, `src/js/npc-triggers.js`, and
  `src/js/win-plan.js` as read 2026-11-17.

## GO bars (bind the run — a miss is NO-GO, never re-scored)

1. All 8 seeds produce valid corpora on both legs, **0 instrument
   errors**, **unknown 0** (per-day classes + launch re-derivations +
   depart returns + plan-ledger check), mismatches 0.
2. Proof green: `scripts/test-zeroattempt-b.js` — static checks + D1
   determinism + D2 neutrality + D3 re-derivation.
3. Classification completeness: EVERY zero-attempt / zero-launch seed
   on the band is classified with dominant class + full per-day counts
   AND the WHY decomposition names which sub-gate dominates (B code-order
   gate, C/assign task, hash outcome, store-init state). If no
   zero-attempt seed occurs, report the ignition rate + decomposition
   and mark the classification N/A with reason — never re-score a bar
   mid-run; put metric doubts under "metric review".
4. Wall numbers on both legs (national by standing AND by scaleRank,
   table, wins, wave 4/5 unlocked, median survival, deaths).

## Metric review notes (for the evidence file, not a re-score)

- If the zero-attempt seeds are store-missing (planignite-a's
  mechanism), the fix space is the store initializer, not the dawn
  scorer — the B/C decomposition still stands as the description of
  what the scorer does while the store is dark.
- If the zero-attempt seeds are B/profile-dominated with the store
  present, the fix space is the profile gate / candidate offer.
- If C/assign dominates, the fix space is assignment persistence
  (orders never expire; the policy assigns the same villagers for the
  whole run) — a lever question for the next arm, not this DIAG.
- The hash roll is one Bernoulli per villager-day, so a village with
  0 wanderers/explorers and 0 plan holders can NEVER launch by the
  soft path — the census must report the per-seed wanderer/explorer
  count, or a zero-attempt seed will look mysterious when it is
  structural.
